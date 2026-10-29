import './styles/base.css';
import './styles/themes.css';
import './styles/ads-tokens.css';
import './styles/atlassian.css';
import './styles/controls.css';
import './styles/notes.css';
import './styles/print.css';

import { initAnalytics, track } from './analytics';
import { fitPages, fitPagesForScreen } from './fit';
import { mountFinguideMark } from './finguide-mark';
import { annotateNotes, mountNotes } from './notes';
import { bindPrintTitle, downloadPdf } from './pdf';
import { renderCv } from './render/cv';
import { bindScreenScale } from './screen-scale';
import { mountControls } from './render/controls';
import { getRecipient, getState, initState, setState, subscribe, toSearch } from './state';
import { ensureThemeFonts, getTheme, themes } from './themes/registry';
import { FOCUSES, type CvState, type Focus } from './types';

const html = document.documentElement;
const cvRoot = document.getElementById('cv')!;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const recipient = getRecipient(location.search);
const SITE_URL = 'https://bwise-jake.github.io/cv/';

/** Point links to this site at the current theme and focus, so a click in the PDF opens the same view. */
function linkSiteToState() {
  const href = `${SITE_URL}${toSearch(getState())}`;
  cvRoot.querySelectorAll<HTMLAnchorElement>(`a[href^="${SITE_URL}"]`).forEach((a) => (a.href = href));
}

/** Render the CV for a focus, then everything that depends on the fresh DOM. */
function render(focus: Focus) {
  renderCv(cvRoot, focus, recipient);
  linkSiteToState();
  annotateNotes(cvRoot);
  mountFinguideMark(cvRoot);
  fitPagesForScreen(cvRoot);
}

/** FLIP: re-render, then animate every [data-flip] element from its old position to its new one. */
function renderWithFlip(focus: Focus) {
  const before = new Map<string, DOMRect>();
  cvRoot.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => before.set(el.dataset.flip!, el.getBoundingClientRect()));
  const boldBefore = new Set(emphasised().map((el) => el.textContent));

  html.dataset.focus = focus;
  render(focus);
  if (reducedMotion.matches) return;

  cvRoot.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => {
    const prev = before.get(el.dataset.flip!);
    if (!prev) return;
    const next = el.getBoundingClientRect();
    const dx = prev.left - next.left;
    const dy = prev.top - next.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)',
    });
  });

  // Flash keywords that just became bold, so the change of focus is visible at a glance.
  for (const el of emphasised()) {
    if (!boldBefore.has(el.textContent)) el.classList.add('kw-flash');
  }
}

/** Keywords currently bold under the active focus. */
function emphasised(): HTMLElement[] {
  const focus = html.dataset.focus ?? '';
  return [...cvRoot.querySelectorAll<HTMLElement>('b.kw')].filter((el) => el.dataset.f?.split(' ').includes(focus));
}

async function applyTheme(state: CvState) {
  // Give fonts a brief head start to avoid a flash of fallback type, but never stall the click.
  await ensureThemeFonts(getTheme(state.theme), 250);
  // A later click may have won the race while fonts loaded.
  if (getState().theme === state.theme) {
    html.dataset.theme = state.theme;
    fitPagesForScreen(cvRoot);
  }
}

/**
 * Fetch every theme's fonts once the visitor shows interest in switching (pointer, focus or touch on
 * the controls), so switches feel instant without making every visitor download all seven themes.
 */
function warmThemeFontsOnIntent(controls: HTMLElement) {
  const warm = () => themes.forEach((t) => void ensureThemeFonts(t, 10_000));
  for (const type of ['pointerenter', 'focusin', 'touchstart'] as const) {
    controls.addEventListener(type, warm, { once: true, passive: true });
  }
}

/** The PDF button and P shortcut; a built-PDF download is tracked here, printing on beforeprint. */
const download = () => downloadPdf(() => track('PDF download', { ...getState(), source: 'built' }));

function cycle<T>(list: readonly T[], current: T, step = 1): T {
  return list[(list.indexOf(current) + step + list.length) % list.length];
}

function bindShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest('input, textarea, [contenteditable], [role="listbox"]')) return;
    const { theme, focus } = getState();
    const step = e.shiftKey ? -1 : 1;
    const key = e.key.toLowerCase();
    if (key === 's') setState({ theme: cycle(themes.map((t) => t.id), theme, step) });
    else if (key === 'e') setState({ focus: cycle(FOCUSES, focus, step) });
    else if (key === 'p') download();
  });
}

function boot() {
  const state = initState();
  html.dataset.theme = state.theme;
  html.dataset.focus = state.focus;
  render(state.focus);
  void applyTheme(state);
  mountNotes(cvRoot);
  bindScreenScale();
  // Web fonts arriving late change line wrapping, so refit whenever any finish loading.
  document.fonts.addEventListener('loadingdone', () => fitPagesForScreen(cvRoot));

  mountControls(document.getElementById('controls')!, download);
  bindShortcuts();
  bindPrintTitle();
  warmThemeFontsOnIntent(document.getElementById('controls')!);

  initAnalytics({ for: recipient });
  track('Visit', { theme: state.theme, focus: state.focus });
  // beforeprint covers the PDF button, the P shortcut and Cmd/Ctrl+P alike. Fit here too, since
  // phones skip fitting while browsing.
  addEventListener('beforeprint', () => {
    fitPages(cvRoot);
    track('PDF download', { ...getState() });
  });

  subscribe((next, prev) => {
    linkSiteToState();
    if (next.theme !== prev.theme) {
      void applyTheme(next);
      track('Theme', { theme: next.theme });
    }
    if (next.focus !== prev.focus) {
      renderWithFlip(next.focus);
      track('Focus', { focus: next.focus });
    }
  });
}

boot();
