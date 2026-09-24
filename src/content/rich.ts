import type { Focus } from '../types';

/**
 * Inline markup used in CV content strings:
 *   **text**            always bold
 *   [[text|b,g,e]]      bold only under the listed focuses (b=balanced, g=growth, e=engineering)
 *   {{text}}            placeholder still to be filled in
 *   [text](https://…)   external link
 * Everything else is treated as plain text and HTML-escaped.
 */

const FOCUS_KEYS: Record<string, Focus> = { b: 'balanced', g: 'growth', e: 'engineering' };

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function parseFocusKeys(keys: string): Focus[] {
  return keys.split(',').map((k) => {
    const focus = FOCUS_KEYS[k.trim()];
    if (!focus) throw new Error(`Unknown focus key "${k}" in rich text`);
    return focus;
  });
}

export function rich(src: string): string {
  return escapeHtml(src)
    .replace(/\[\[(.+?)\|([a-z,\s]+)\]\]/g, (_, text: string, keys: string) =>
      `<b class="kw" data-f="${parseFocusKeys(keys).join(' ')}">${text}</b>`)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\{\{(.+?)\}\}/g, '<span class="fill">$1</span>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
