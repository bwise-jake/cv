/**
 * The A4 sheet is a fixed 210mm wide, so on screens between the phone layout (base.css, 640px) and
 * the sheet's own width it would run past the window and lose its right-hand padding. These widths
 * shrink the whole sheet to fit instead; the phone layout reflows and wider screens keep it at 1.
 */
const A4_WIDTH_PX = (210 / 25.4) * 96;
const PHONE_MAX_WIDTH = 640;

/** Scale to apply to the sheets so they fit a window `width` px wide (never above 1). */
export function screenScale(width: number): number {
  if (width <= PHONE_MAX_WIDTH) return 1;
  return Math.min(1, Math.floor(width) / A4_WIDTH_PX);
}

/** Keep `--screen-scale` on the root in step with the window width (used by #cv in base.css). */
export function bindScreenScale() {
  const root = document.documentElement;
  const update = () => root.style.setProperty('--screen-scale', screenScale(root.clientWidth).toFixed(4));
  update();
  addEventListener('resize', update);
}
