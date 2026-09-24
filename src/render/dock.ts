import { escapeHtml } from '../content/rich';
import { getState, setState, subscribe } from '../state';
import { themes } from '../themes/registry';
import { FOCUSES, type CvState, type Focus } from '../types';

const FOCUS_LABELS: Record<Focus, string> = {
  balanced: 'Balanced',
  growth: 'Growth',
  engineering: 'Engineering',
};

const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>`;
const ICON_SLIDERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>`;

type GroupKey = keyof CvState;

function radio(group: GroupKey, value: string, label: string, extra = '', title = '') {
  return `<button type="button" role="radio" class="dock-option" data-group="${group}" data-value="${value}"${
    title ? ` title="${escapeHtml(title)}"` : ''
  }>${extra}<span class="dock-label">${escapeHtml(label)}</span></button>`;
}

export function mountDock(root: HTMLElement, onDownload: () => void) {
  root.className = 'dock';
  root.setAttribute('aria-label', 'CV display options');
  root.innerHTML = `
    <button type="button" class="dock-toggle" aria-expanded="false" aria-controls="dock-panel">
      <span class="dock-swatch" data-current-swatch></span>
      <span>Customise</span>
      ${ICON_SLIDERS}
    </button>
    <div class="dock-panel" id="dock-panel">
      <div class="dock-group dock-themes" role="radiogroup" aria-label="Theme">
        <span class="dock-caption">Theme</span>
        <span class="dock-indicator" aria-hidden="true"></span>
        ${themes
          .map((t) =>
            radio('theme', t.id, t.label, `<span class="dock-swatch" style="background:${t.swatch}"></span>`, t.note),
          )
          .join('')}
      </div>
      <span class="dock-divider" aria-hidden="true"></span>
      <div class="dock-group dock-focus" role="radiogroup" aria-label="Focus">
        <span class="dock-caption">Focus</span>
        <span class="dock-indicator" aria-hidden="true"></span>
        ${FOCUSES.map((f) => radio('focus', f, FOCUS_LABELS[f])).join('')}
      </div>
      <span class="dock-divider" aria-hidden="true"></span>
      <button type="button" class="dock-pdf" title="Download PDF (P)">
        ${ICON_DOWNLOAD}<span>PDF</span>
      </button>
    </div>`;

  const toggle = root.querySelector<HTMLButtonElement>('.dock-toggle')!;
  const options = [...root.querySelectorAll<HTMLButtonElement>('.dock-option')];

  const sync = (state: CvState) => {
    for (const btn of options) {
      const checked = state[btn.dataset.group as GroupKey] === btn.dataset.value;
      btn.setAttribute('aria-checked', String(checked));
      btn.tabIndex = checked ? 0 : -1;
    }
    const swatch = themes.find((t) => t.id === state.theme)?.swatch ?? '';
    root.querySelector<HTMLElement>('[data-current-swatch]')!.style.background = swatch;
    requestAnimationFrame(placeIndicators);
  };

  // Sliding "active" pill: sized and positioned to the checked option in each group.
  const placeIndicators = () => {
    for (const group of root.querySelectorAll<HTMLElement>('.dock-group')) {
      const active = group.querySelector<HTMLElement>('[aria-checked="true"]');
      const indicator = group.querySelector<HTMLElement>('.dock-indicator');
      if (!active || !indicator) continue;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = `${active.offsetHeight}px`;
      indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    }
  };

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const option = target.closest<HTMLButtonElement>('.dock-option');
    if (option) setState({ [option.dataset.group as GroupKey]: option.dataset.value } as Partial<CvState>);
    if (target.closest('.dock-pdf')) onDownload();
  });

  // Radiogroup keyboard pattern: arrows move + select, focus follows selection.
  root.addEventListener('keydown', (e) => {
    const option = (e.target as HTMLElement).closest<HTMLButtonElement>('.dock-option');
    if (!option) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const siblings = options.filter((o) => o.dataset.group === option.dataset.group);
    const next = siblings[(siblings.indexOf(option) + step + siblings.length) % siblings.length];
    next.click();
    next.focus();
  });

  const setOpen = (open: boolean) => {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) requestAnimationFrame(placeIndicators);
  };
  toggle.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) setOpen(false);
  });

  new ResizeObserver(placeIndicators).observe(root);
  document.fonts.addEventListener('loadingdone', placeIndicators);
  subscribe(sync);
  sync(getState());
  // First placement shouldn't animate in from 0,0.
  root.classList.add('no-anim');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-anim')));
}
