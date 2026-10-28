/**
 * Renders the link-preview image (Open Graph / Twitter) as an intro slide in the finguide theme (Jake's own app,
 * src/styles/themes.css): photo, name, the Engineering kicker, the year and the site URL. Name, kicker and photo
 * come from src/content/cv.ts.
 * Output: public/og-image.jpg at 2400×1260 (1200×630 at 2×). Re-run after changing the name, kicker or photo.
 *
 * Usage: npm run og   (needs network access for the Hanken Grotesk web font)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium, type Browser } from 'playwright';
import { headlines, person } from '../src/content/cv';
import { escapeHtml } from '../src/content/rich';

const OUT = new URL('../public/og-image.jpg', import.meta.url);
const SITE = 'bwise-jake.github.io/cv';
const MARGIN = 88;

function slide(photo: string, year: number): string {
  const [first, ...rest] = person.name.split(' ');
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;560;650&display=block" rel="stylesheet">
<style>
  /* finguide dark tokens (DESIGN.md): Ink canvas, card, hairline, foreground, muted, lime. */
  :root { --ink: #080808; --card: #1c1c1c; --line: #333333; --fg: #fafafa; --muted: #bdbdbd; --lime: #c0f43e; }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; color: var(--fg); font-family: 'Hanken Grotesk', sans-serif;
         background: radial-gradient(90% 120% at 100% 0%, #16190f 0%, var(--ink) 55%); }
  .slide { height: 100%; padding: 64px ${MARGIN}px 56px; display: flex; flex-direction: column; }
  .row { display: flex; justify-content: space-between; align-items: center;
         font-size: 18px; font-weight: 560; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
  .year { color: var(--lime); }
  .main { flex: 1; display: flex; align-items: center; gap: 64px; }
  .photo { width: 240px; height: 240px; border-radius: 53px; object-fit: cover; flex-shrink: 0;
           border: 1px solid var(--line); box-shadow: 0 24px 60px rgb(0 0 0 / 50%); }
  h1 { font-weight: 650; font-size: 92px; line-height: 0.98; letter-spacing: -0.03em; }
  .rule { width: 72px; height: 4px; background: var(--lime); border-radius: 2px; margin: 32px 0 28px; }
  .kicker { font-size: 24px; line-height: 1.35; font-weight: 400; color: var(--muted); white-space: nowrap; }
  .foot { border-top: 1px solid var(--line); padding-top: 24px; text-transform: none; letter-spacing: 0.01em; }
  .url { color: var(--fg); }
</style></head><body><div class="slide">
  <div class="row"><span>Curriculum vitae</span><span class="year">${year}</span></div>
  <div class="main">
    <img class="photo" src="data:image/jpeg;base64,${photo}" alt="">
    <div>
      <h1>${escapeHtml(first)}<br>${escapeHtml(rest.join(' '))}</h1>
      <div class="rule"></div>
      <p class="kicker">${escapeHtml(headlines.engineering.kicker)}</p>
    </div>
  </div>
  <div class="row foot"><span class="url">${SITE}</span></div>
</div></body></html>`;
}

async function launch(): Promise<Browser> {
  // Prefer the installed Chrome so no browser download is needed; fall back to Playwright's.
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return chromium.launch();
  }
}

async function main() {
  const photo = (await readFile(new URL(`../public/${person.photo}`, import.meta.url))).toString('base64');
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
    await page.setContent(slide(photo, new Date().getFullYear()), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(
      (margin) => document.querySelector('.kicker')!.getBoundingClientRect().right > 1200 - margin,
      MARGIN,
    );
    if (overflow) throw new Error('The kicker runs past the right margin; shorten it or reduce its size.');
    await writeFile(OUT, await page.screenshot({ type: 'jpeg', quality: 90 }));
    console.log('Wrote public/og-image.jpg (2400×1260)');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
