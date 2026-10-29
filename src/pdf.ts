import { DEFAULT_STATE, getState } from './state';
import { ensureThemeFonts, getTheme } from './themes/registry';
import type { CvState } from './types';

/** Chrome, Edge and Safari use the document title as the default "Save as PDF" file name. */
export function pdfFileName({ theme, focus }: CvState): string {
  const label = getTheme(theme).label.replace(/\s+/g, '-');
  const focusPart = focus === DEFAULT_STATE.focus ? '' : `-${focus[0].toUpperCase()}${focus.slice(1)}`;
  return `Jake-Thornton-Bowen-CV-${label}${focusPart}`;
}

/**
 * Touch-first devices (phones, tablets) print through their own engines, which add page margins and
 * spill each A4 sheet onto a blank page. They get the PDF CI built and checked for this theme and
 * focus instead (deployed under pdf/; not in local dev, which prints).
 */
function downloadBuiltPdf(onBuilt: () => void): boolean {
  if (!import.meta.env.PROD || !matchMedia('(hover: none) and (pointer: coarse)').matches) return false;
  const name = `${pdfFileName(getState())}.pdf`;
  Object.assign(document.createElement('a'), { href: `pdf/${name}`, download: name }).click();
  onBuilt();
  return true;
}

/** onBuilt runs when a built PDF is downloaded; printing is tracked on beforeprint instead. */
export async function downloadPdf(onBuilt: () => void = () => {}) {
  if (downloadBuiltPdf(onBuilt)) return;
  await ensureThemeFonts(getTheme(getState().theme));
  await document.fonts.ready;
  print();
}

export function bindPrintTitle() {
  const title = document.title;
  // Covers both the PDF button and Cmd/Ctrl+P.
  addEventListener('beforeprint', () => (document.title = pdfFileName(getState())));
  addEventListener('afterprint', () => (document.title = title));
}
