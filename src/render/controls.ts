import { escapeHtml } from '../content/rich';
import { pdfFileName } from '../pdf';
import { getState, setState, subscribe } from '../state';
import { themeLogos } from '../themes/logos';
import { ensureThemeFonts, themes, type Theme } from '../themes/registry';
import { FOCUSES, type CvState, type Focus } from '../types';

const FOCUS_LABELS: Record<Focus, string> = {
  balanced: 'Balanced',
  growth: 'Growth',
  engineering: 'Engineering',
};

const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`;
const ICON_CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

/** Company app icon for a theme. */
const brandMark = (t: Theme) =>
  `<img class="brand-mark" src="${themeLogos[t.id]}" alt="" width="20" height="20" decoding="async">`;

/**
 * The CV controls: a sticky panel beside the CV on wide screens, a floating button + bottom sheet
 * below that. Typeset like a CV section headed "Version": Style (listbox), Emphasis (word radios), PDF.
 */
export function mountControls(root: HTMLElement, onDownload: () => void) {
  root.className = 'controls';
  root.setAttribute('aria-label', 'CV display options');
  root.innerHTML = `
    <button type="button" class="controls-toggle" aria-expanded="false" aria-controls="controls-panel">
      <span class="brand-slot" data-current-mark></span>
      <span>Version</span>
      ${ICON_CHEVRON}
    </button>
    <div class="controls-panel" id="controls-panel">
      <div class="controls-head">
        <h2 class="controls-title">Version</h2>
      </div>

      <div class="controls-line">
        <span class="controls-lead" id="theme-label">Style</span>
        <div class="theme-select">
          <button type="button" class="theme-trigger" aria-haspopup="listbox" aria-expanded="false"
            aria-controls="theme-list" aria-labelledby="theme-label theme-current">
            <span class="brand-slot" data-current-mark></span>
            <span class="theme-current" id="theme-current"></span>
            ${ICON_CHEVRON}
          </button>
          <ul class="theme-list" id="theme-list" role="listbox" tabindex="-1" aria-labelledby="theme-label" hidden>
            ${themes
              .map(
                (t) => `
            <li class="theme-option" role="option" id="theme-opt-${t.id}" data-value="${t.id}" aria-selected="false">
              ${brandMark(t)}
              <span class="theme-option-text">
                <span class="theme-option-name" style="font-family:'${t.families[0]}', system-ui, sans-serif">${escapeHtml(t.label)}</span>
                <span class="theme-option-note">${escapeHtml(t.note)}</span>
              </span>
              <span class="theme-option-check">${ICON_CHECK}</span>
            </li>`,
              )
              .join('')}
          </ul>
        </div>
      </div>

      <div class="controls-line">
        <span class="controls-lead" id="focus-label">Emphasis</span>
        <div class="focus-words" role="radiogroup" aria-labelledby="focus-label">
          ${FOCUSES.map(
            (f) => `<button type="button" role="radio" class="focus-word" data-value="${f}">${FOCUS_LABELS[f]}</button>`,
          ).join('<span class="focus-sep" aria-hidden="true">/</span>')}
        </div>
      </div>

      <div class="controls-download">
        <button type="button" class="controls-pdf">
          ${ICON_DOWNLOAD}<span>Download PDF</span><span class="controls-pdf-meta">A4 · 2 pages</span>
        </button>
        <span class="controls-file" data-file-name></span>
      </div>

      <p class="controls-keys">Keys: <kbd>T</kbd> style, <kbd>F</kbd> emphasis, <kbd>P</kbd> PDF</p>
    </div>`;

  const toggle = root.querySelector<HTMLButtonElement>('.controls-toggle')!;
  const trigger = root.querySelector<HTMLButtonElement>('.theme-trigger')!;
  const list = root.querySelector<HTMLUListElement>('.theme-list')!;
  const options = [...list.querySelectorAll<HTMLLIElement>('.theme-option')];
  const focusGroup = root.querySelector<HTMLElement>('.focus-words')!;
  const radios = [...focusGroup.querySelectorAll<HTMLButtonElement>('.focus-word')];

  // ---- Sync UI from state (dropdown, radios, filename) ----
  const sync = (state: CvState) => {
    const theme = themes.find((t) => t.id === state.theme) ?? themes[0];
    root.querySelectorAll<HTMLElement>('[data-current-mark]').forEach((el) => (el.innerHTML = brandMark(theme)));
    root.querySelector('#theme-current')!.textContent = theme.label;
    trigger.title = theme.note;
    for (const opt of options) opt.setAttribute('aria-selected', String(opt.dataset.value === state.theme));
    for (const radio of radios) {
      const checked = radio.dataset.value === state.focus;
      radio.setAttribute('aria-checked', String(checked));
      radio.tabIndex = checked ? 0 : -1;
    }
    root.querySelector('[data-file-name]')!.textContent = `${pdfFileName(state)}.pdf`;
  };

  // ---- Emphasis: three words acting as a radiogroup ----
  focusGroup.addEventListener('click', (e) => {
    const radio = (e.target as HTMLElement).closest<HTMLButtonElement>('.focus-word');
    if (radio) setState({ focus: radio.dataset.value as Focus });
  });
  focusGroup.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const current = radios.indexOf(e.target as HTMLButtonElement);
    if (!step || current < 0) return;
    e.preventDefault();
    const next = radios[(current + step + radios.length) % radios.length];
    next.click();
    next.focus();
  });

  // ---- Theme: listbox dropdown (button + aria-activedescendant pattern) ----
  let activeIndex = 0;
  const isListOpen = () => !list.hidden;

  const setActive = (i: number) => {
    activeIndex = (i + options.length) % options.length;
    options.forEach((o, j) => o.classList.toggle('is-active', j === activeIndex));
    list.setAttribute('aria-activedescendant', options[activeIndex].id);
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const openList = () => {
    // Option names are set in each theme's own typeface; make sure those fonts are loading.
    themes.forEach((t) => void ensureThemeFonts(t, 10_000));
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.classList.add('is-list-open');
    setActive(Math.max(0, options.findIndex((o) => o.dataset.value === getState().theme)));
    list.focus();
  };

  const closeList = (returnFocus = true) => {
    if (!isListOpen()) return;
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-list-open');
    if (returnFocus) trigger.focus();
  };

  const choose = (i: number) => {
    setState({ theme: options[i].dataset.value as CvState['theme'] });
    closeList();
  };

  trigger.addEventListener('click', () => (isListOpen() ? closeList() : openList()));
  trigger.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  });

  list.addEventListener('keydown', (e) => {
    e.stopPropagation(); // keep T/F/P shortcuts and the sheet's Escape out of the listbox
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive(activeIndex + 1); break;
      case 'ArrowUp': e.preventDefault(); setActive(activeIndex - 1); break;
      case 'Home': e.preventDefault(); setActive(0); break;
      case 'End': e.preventDefault(); setActive(options.length - 1); break;
      case 'Enter':
      case ' ': e.preventDefault(); choose(activeIndex); break;
      case 'Escape': e.preventDefault(); closeList(); break;
      case 'Tab': closeList(false); break;
      default:
        // Type-ahead: jump to the next theme starting with the typed letter.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const key = e.key.toLowerCase();
          for (let n = 1; n <= options.length; n++) {
            const i = (activeIndex + n) % options.length;
            if (options[i].querySelector('.theme-option-name')!.textContent!.toLowerCase().startsWith(key)) {
              setActive(i);
              break;
            }
          }
        }
    }
  });
  list.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLLIElement>('.theme-option');
    if (opt) choose(options.indexOf(opt));
  });
  list.addEventListener('mousemove', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLLIElement>('.theme-option');
    if (opt && options.indexOf(opt) !== activeIndex) setActive(options.indexOf(opt));
  });
  list.addEventListener('focusout', (e) => {
    // The trigger's own click handler toggles; don't double-handle it here.
    if (e.relatedTarget !== trigger && !list.contains(e.relatedTarget as Node)) closeList(false);
  });

  // ---- PDF ----
  root.querySelector('.controls-pdf')!.addEventListener('click', onDownload);

  // ---- Small screens: floating button opens the panel as a bottom sheet ----
  const setSheetOpen = (open: boolean) => {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (!open) closeList(false);
  };
  toggle.addEventListener('click', () => setSheetOpen(!root.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setSheetOpen(false));
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) {
      setSheetOpen(false);
      closeList(false);
    }
  });

  subscribe(sync);
  sync(getState());
}
