/**
 * Fit each A4 page's content to its sheet. Brand fonts have different metrics and focus modes
 * change emphasis, so the natural height varies per theme × focus. We measure in the desktop
 * A4 layout (see [data-measure] in base.css) and binary-search the largest zoom that fits.
 */
// A few px of headroom: print layout can differ from screen by sub-pixel rounding.
const A4_HEIGHT_PX = (297 / 25.4) * 96 - 12;
const MIN_FIT = 0.8;

/** Phone screens reflow into one column (base.css), so the A4 fit only matters for print there. */
const phoneLayout = matchMedia('screen and (max-width: 640px)');

/**
 * Fit pages now on A4 layouts; on phones, defer until printing. Measuring briefly lays the page
 * out at A4 width, which on a phone can trigger mobile text inflation, so avoid it while browsing.
 */
export function fitPagesForScreen(root: ParentNode = document) {
  if (!phoneLayout.matches) fitPages(root);
}

export function fitPages(root: ParentNode = document) {
  const html = document.documentElement;
  const pages = [...root.querySelectorAll<HTMLElement>('.page')];
  html.dataset.measure = '';
  try {
    for (const page of pages) {
      const heightAt = (fit: number) => {
        page.style.setProperty('--fit', String(fit));
        // Measured height is layout px at 1/fit width; the sheet shows it scaled by fit.
        return page.offsetHeight * fit;
      };
      if (heightAt(1) <= A4_HEIGHT_PX) continue;
      let lo = MIN_FIT;
      let hi = 1;
      for (let i = 0; i < 8; i++) {
        const mid = (lo + hi) / 2;
        if (heightAt(mid) <= A4_HEIGHT_PX) lo = mid;
        else hi = mid;
      }
      page.style.setProperty('--fit', lo.toFixed(4));
    }
  } finally {
    delete html.dataset.measure;
  }
}
