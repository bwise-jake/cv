/**
 * Measures WCAG contrast for small secondary text in every theme, in a real browser, and fails if
 * any is below AA (4.5:1). Backgrounds are sampled from pixels (text hidden), so chips and gradient
 * headers are measured as rendered, not guessed from tokens.
 *
 * Usage: npm run check:contrast   (builds first, then serves dist/ with `vite preview`)
 */
import { chromium, type Browser, type Page } from 'playwright';
import { preview } from 'vite';
import { themes } from '../src/themes/registry';

const MIN = 4.5;

/** [label, selector] — first match is measured. */
const CHECKS: [string, string][] = [
  ['dates', '.job-meta'],
  ['employer date line', '.employer-span'],
  ['industry tag', '.employer-tags .tag'],
  ['header kicker', '.kicker'],
  ['controls label', '.controls-lead'],
  ['emphasis (unselected)', '.focus-word[aria-checked="false"]'],
];

const HIDE_CSS = `
  [data-cc-hide], [data-cc-hide] * {
    color: transparent !important; -webkit-text-fill-color: transparent !important;
    text-decoration-color: transparent !important; border-color: transparent !important;
  }
  [data-cc-hide]::before, [data-cc-hide]::after, [data-cc-hide] *::before, [data-cc-hide] *::after {
    visibility: hidden !important;
  }`;

async function launch(): Promise<Browser> {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

/** Worst contrast between the element's text colour and any background pixel behind it. */
async function worstContrast(page: Page, selector: string): Promise<number | null> {
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) return null;
  const color = await el.evaluate((e) => getComputedStyle(e).color);
  await el.evaluate((e) => e.setAttribute('data-cc-hide', ''));
  const png = await el.screenshot({ animations: 'disabled' });
  await el.evaluate((e) => e.removeAttribute('data-cc-hide'));
  return page.evaluate(
    async ({ b64, color }) => {
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
      // Note: arrow functions below are wrapped in `[fn][0]` rather than assigned directly via
      // `const fn = (...) => ...` — tsx/esbuild injects a `__name()` call for the latter form,
      // which page.evaluate's function-stringification then ships into the isolated page context
      // where `__name` doesn't exist, throwing "ReferenceError: __name is not defined".
      const toRgb = [
        (c: string) => {
          ctx.canvas.width = ctx.canvas.height = 1;
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = c;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        },
      ][0];
      const lum = [
        ([r, g, b]: number[]) => {
          const f = [(v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)][0];
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        },
      ][0];
      const fg = lum(toRgb(color));
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      let worst = Infinity;
      for (let i = 0; i < d.length; i += 4 * 5) {
        const bg = lum([d[i], d[i + 1], d[i + 2]]);
        const [hi, lo] = fg > bg ? [fg, bg] : [bg, fg];
        worst = Math.min(worst, (hi + 0.05) / (lo + 0.05));
      }
      return Math.round(worst * 100) / 100;
    },
    { b64: png.toString('base64'), color },
  );
}

async function main() {
  const server = await preview({ preview: { port: 4175, strictPort: true, open: false } });
  const base = server.resolvedUrls?.local[0] ?? 'http://localhost:4175/';
  const browser = await launch();
  const failures: string[] = [];
  try {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`${base}?theme=${theme.id}&focus=balanced`, { waitUntil: 'networkidle' });
      await page.waitForFunction((id) => document.documentElement.dataset.theme === id, theme.id);
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: HIDE_CSS });
      const row: string[] = [];
      for (const [label, selector] of CHECKS) {
        const ratio = await worstContrast(page, selector);
        if (ratio === null) continue;
        const ok = ratio >= MIN;
        if (!ok) failures.push(`${theme.label}: ${label} ${ratio}:1`);
        row.push(`${ok ? '✓' : '✗'} ${label} ${ratio}`);
      }
      console.log(`${theme.label.padEnd(14)} ${row.join('  ')}`);
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
  if (failures.length) {
    console.error(`\n${failures.length} contrast failure(s) below ${MIN}:1:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`\nAll themes pass WCAG AA (${MIN}:1) for small text.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
