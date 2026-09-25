import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FOCUSES, THEME_IDS } from '../src/types';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const stateSrc = readFileSync(new URL('../src/state.ts', import.meta.url), 'utf8');
const list = (name: string) =>
  JSON.parse(html.match(new RegExp(`var ${name} = (\\[[^\\]]*\\])`))![1].replace(/'/g, '"'));

describe('pre-paint script in index.html', () => {
  it('knows every theme and focus', () => {
    expect(list('themes')).toEqual([...THEME_IDS]);
    expect(list('focuses')).toEqual([...FOCUSES]);
  });

  it('reads the same storage key as src/state.ts', () => {
    const key = stateSrc.match(/STORAGE_KEY = '([^']+)'/)![1];
    expect(html).toContain(`localStorage.getItem('${key}')`);
  });
});
