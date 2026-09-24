import { metricNotes } from './content/cv';
import { rich } from './content/rich';
import { track } from './analytics';

/** Notes still containing a {{placeholder}} are only shown in local dev. */
export function visibleNotes(notes: Record<string, string>, dev: boolean): Record<string, string> {
  return Object.fromEntries(Object.entries(notes).filter(([, note]) => note.trim() && (dev || !note.includes('{{'))));
}

const notes = visibleNotes(metricNotes, import.meta.env.DEV);

/**
 * "How this was measured" popovers. After each render, bold phrases matching a key in
 * metricNotes get a dotted underline and become focusable; one shared tooltip element is
 * positioned next to whichever is hovered or focused. Screen-only: print hides it all.
 */
export function mountNotes(root: HTMLElement) {
  const tip = document.createElement('div');
  tip.id = 'metric-tip';
  tip.className = 'metric-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);

  let current: HTMLElement | null = null;
  const show = (el: HTMLElement) => {
    const note = notes[el.textContent ?? ''];
    if (!note) return;
    current = el;
    tip.innerHTML = `<span class="metric-tip-label">How this was measured</span>${rich(note)}`;
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), innerWidth - t.width - 8);
    const above = r.top - t.height - 10;
    tip.style.left = `${left}px`;
    tip.style.top = `${above > 8 ? above : r.bottom + 10}px`;
    tip.dataset.side = above > 8 ? 'top' : 'bottom';
    el.setAttribute('aria-describedby', tip.id);
    track('Metric note', { metric: el.textContent });
  };
  const hide = () => {
    current?.removeAttribute('aria-describedby');
    current = null;
    tip.hidden = true;
  };

  const target = (e: Event) => (e.target as HTMLElement).closest<HTMLElement>('.has-note');
  root.addEventListener('mouseover', (e) => { const el = target(e); if (el && el !== current) show(el); });
  root.addEventListener('mouseout', (e) => {
    if (current && !current.contains(e.relatedTarget as Node)) hide();
  });
  root.addEventListener('focusin', (e) => { const el = target(e); if (el) show(el); });
  root.addEventListener('focusout', hide);
  addEventListener('scroll', hide, { passive: true });
  addEventListener('keydown', (e) => e.key === 'Escape' && hide());
}

/** Mark up phrases that have a note. Call after every render. */
export function annotateNotes(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.page b').forEach((b) => {
    if (!notes[b.textContent ?? '']) return;
    b.classList.add('has-note');
    b.tabIndex = 0;
  });
}

