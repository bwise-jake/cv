import './styles/base.css';
import './styles/themes.css';
import './styles/controls.css';
import './styles/print.css';

import { fitPages } from './fit';
import { bindPrintTitle, downloadPdf } from './pdf';
import { renderCv } from './render/cv';
import { mountControls } from './render/controls';
import { getState, initState, setState, subscribe } from './state';
import { ensureThemeFonts, getTheme, themes } from './themes/registry';
import { FOCUSES, type CvState, type Focus } from './types';

const html = document.documentElement;
const cvRoot = document.getElementById('cv')!;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/** FLIP: re-render, then animate every [data-flip] element from its old position to its new one. */
function renderWithFlip(focus: Focus) {
  const before = new Map<string, DOMRect>();
  cvRoot.querySelectorAll<HTMLElement>('[data-flip]').forEach((el) => before.set(el.dataset.flip!, el.getBoundingClientRect()));
  const boldBefore = new Set(emphasised().map((el) => el.textContent));

  html.dataset.focus = focus;
  renderCv(cvRoot, focus);
  fitPages(cvRoot);
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
    fitPages(cvRoot);
  }
}

/** Once the page is idle, fetch every theme's fonts so later switches are instant. */
function warmThemeFonts() {
  const warm = () => themes.forEach((t) => void ensureThemeFonts(t, 10_000));
  // requestIdleCallback can be starved indefinitely, so give it a deadline.
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2000 });
  else setTimeout(warm, 1200);
}

function cycle<T>(list: readonly T[], current: T, step = 1): T {
  return list[(list.indexOf(current) + step + list.length) % list.length];
}

function bindShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest('input, textarea, [contenteditable], [role="listbox"]')) return;
    const { theme, focus } = getState();
    const step = e.shiftKey ? -1 : 1;
    const key = e.key.toLowerCase();
    if (key === 't') setState({ theme: cycle(themes.map((t) => t.id), theme, step) });
    else if (key === 'f') setState({ focus: cycle(FOCUSES, focus, step) });
    else if (key === 'p') downloadPdf();
  });
}

function boot() {
  const state = initState();
  html.dataset.theme = state.theme;
  html.dataset.focus = state.focus;
  renderCv(cvRoot, state.focus);
  fitPages(cvRoot);
  void applyTheme(state);
  // Web fonts arriving late change line wrapping, so refit whenever any finish loading.
  document.fonts.addEventListener('loadingdone', () => fitPages(cvRoot));

  mountControls(document.getElementById('controls')!, downloadPdf);
  bindShortcuts();
  bindPrintTitle();
  addEventListener('load', warmThemeFonts, { once: true });

  subscribe((next, prev) => {
    if (next.theme !== prev.theme) void applyTheme(next);
    if (next.focus !== prev.focus) renderWithFlip(next.focus);
  });
}

boot();
