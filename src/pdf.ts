import { getState } from './state';
import { ensureThemeFonts, getTheme } from './themes/registry';
import type { CvState } from './types';

/** Chrome, Edge and Safari use the document title as the default "Save as PDF" file name. */
export function pdfFileName({ theme, focus }: CvState): string {
  const label = getTheme(theme).label;
  const focusPart = focus === 'balanced' ? '' : `-${focus[0].toUpperCase()}${focus.slice(1)}`;
  return `Jake-Thornton-Bowen-CV-${label}${focusPart}`;
}

export async function downloadPdf() {
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
