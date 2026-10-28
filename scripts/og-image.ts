/**
 * Renders the link-preview image (Open Graph / Twitter): the top of page 1 in the Default theme with the
 * Engineering emphasis (what the bare link shows), scaled up on the canvas backdrop.
 * Output: public/og-image.jpg at 2400×1260 (1200×630 at 2×). Re-run after changing the header or summary.
 *
 * Usage: npm run og   (builds first, then serves dist/ with `vite preview`)
 */
import { writeFile } from 'node:fs/promises';
import { chromium, type Browser } from 'playwright';
import { preview } from 'vite';

const OUT = new URL('../public/og-image.jpg', import.meta.url);

// Hide the controls, show only page 1, and centre it scaled up below a strip of backdrop.
const CARD_CSS = `
  #controls, .skip-link { display: none !important; }
  html, body { background: var(--canvas) !important; overflow: hidden !important; }
  .layout { display: block !important; padding: 0 !important; margin: 0 !important; }
  #cv { position: fixed !important; left: 50%; top: 44px; margin: 0 !important;
        transform: translateX(-50%) scale(1.3); transform-origin: top center; }
  #cv .page:not(:first-child) { display: none !important; }
  #cv .page { box-shadow: 0 2px 24px rgb(0 0 0 / 12%) !important; }`;

async function launch(): Promise<Browser> {
  // Prefer the installed Chrome so no browser download is needed; fall back to Playwright's.
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

async function main() {
  const server = await preview({ preview: { port: 4175, strictPort: true, open: false } });
  const base = server.resolvedUrls?.local[0] ?? 'http://localhost:4175/';
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
    await page.goto(`${base}?theme=default&focus=engineering`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: CARD_CSS });
    await page.waitForTimeout(300);
    await writeFile(OUT, await page.screenshot({ type: 'jpeg', quality: 88 }));
    console.log('Wrote public/og-image.jpg (2400×1260)');
  } finally {
    await browser.close();
    server.httpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
