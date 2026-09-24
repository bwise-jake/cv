/**
 * Renders every theme × focus combination to A4 PDF with headless Chrome and checks that each
 * one fits on exactly two pages (brand fonts have different metrics, so a theme can overflow).
 * Output: exports/Jake-Thornton-Bowen-CV-<Theme>[-<Focus>].pdf — ready to attach to applications.
 *
 * Usage: npm run pdf   (builds first, then serves dist/ with `vite preview`)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, type Browser } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { preview } from 'vite';
import { pdfFileName } from '../src/pdf';
import { themes } from '../src/themes/registry';
import { FOCUSES } from '../src/types';

const EXPECTED_PAGES = 2;
const OUT_DIR = new URL('../exports/', import.meta.url);

async function launch(): Promise<Browser> {
  // Prefer the installed Chrome so no browser download is needed; fall back to Playwright's.
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

async function main() {
  const server = await preview({ preview: { port: 4174, strictPort: true, open: false } });
  const base = server.resolvedUrls?.local[0] ?? 'http://localhost:4174/';
  const browser = await launch();
  await mkdir(OUT_DIR, { recursive: true });

  const failures: string[] = [];
  try {
    for (const theme of themes) {
      for (const focus of FOCUSES) {
        const page = await browser.newPage();
        await page.goto(`${base}?theme=${theme.id}&focus=${focus}`, { waitUntil: 'networkidle' });
        await page.waitForFunction((id) => document.documentElement.dataset.theme === id, theme.id);
        await page.evaluate(async (families) => {
          await Promise.all(families.flatMap((f) => ['400', '600'].map((w) => document.fonts.load(`${w} 16px "${f}"`))));
          await document.fonts.ready;
        }, theme.families);

        // Pages are fixed A4 sheets with overflow hidden in print, so also check nothing is clipped.
        await page.emulateMedia({ media: 'print' });
        const clipped = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('.page')].map((p) => p.scrollHeight - p.clientHeight).filter((d) => d > 1),
        );
        const fits = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('.page')].map((p) => Number(p.style.getPropertyValue('--fit') || 1)),
        );

        const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
        const pages = (await PDFDocument.load(pdf)).getPageCount();
        const name = `${pdfFileName({ theme: theme.id, focus })}.pdf`;
        await writeFile(new URL(name, OUT_DIR), pdf);

        const ok = pages === EXPECTED_PAGES && clipped.length === 0;
        if (!ok) failures.push(`${name}: ${pages} pages${clipped.length ? `, clipped by ${clipped.join('/')}px` : ''}`);
        const scale = fits.map((f) => `${Math.round(f * 1000) / 10}%`).join(' / ');
        console.log(`${ok ? '✓' : '✗'} ${name.padEnd(52)} ${pages} pages   scale ${scale}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  if (failures.length) {
    console.error(`\n${failures.length} export(s) did not fit on ${EXPECTED_PAGES} pages:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`\nAll ${themes.length * FOCUSES.length} PDFs fit on ${EXPECTED_PAGES} pages → exports/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
