import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { skills } from '../src/content/cv';
import { cvMarkup } from '../src/render/cv';
import { FOCUSES } from '../src/types';

const read = (name: string) => readFileSync(new URL(`../src/styles/${name}`, import.meta.url), 'utf8');
const atlassian = read('atlassian.css');

describe('skills cards', () => {
  it('shows set subtitles only in the Atlassian theme', () => {
    expect(read('base.css')).toMatch(/\.skill-set-title\s*\{\s*display:\s*none;\s*\}/);
    expect(atlassian).toMatch(/\.skill-set-title\[data-theme-title="atlassian"\]\s*\{\s*display:\s*inline;/);
  });

  it('gives every skill group its own Atlassian colour', () => {
    const fills = skills.map((g) => {
      const rule = new RegExp(`\\.skill-group\\[data-skill="${g.id}"\\]\\s*\\{\\s*background:\\s*var\\(--ds-background-accent-([a-z]+)-subtler,[^)]*\\)\\s*;?\\s*\\}`);
      const colour = atlassian.match(rule)?.[1];
      expect(colour, `atlassian.css has no accent-subtler background rule for .skill-group[data-skill="${g.id}"]`).toBeDefined();
      return colour;
    });
    expect(new Set(fills).size, `the groups must use three different fills, got ${fills.join(', ')}`).toBe(skills.length);
  });

  it('puts the data-skill hook on every group in the markup, whatever the focus', () => {
    const ids = skills.map((g) => g.id);
    for (const focus of FOCUSES) {
      const html = cvMarkup(focus);
      const hooks = [...html.matchAll(/<div class="skill-group"[^>]*? data-skill="([^"]*)"/g)].map((m) => m[1]);
      expect([...hooks].sort(), `focus ${focus}`).toEqual([...ids].sort());
      expect(html.match(/data-skill="/g), `focus ${focus}: data-skill only on skill groups`).toHaveLength(ids.length);
    }
  });

  it('does not hang the colour on the animation key', () => {
    expect(atlassian).not.toContain('data-flip');
  });

  it('names the wrapper grid for what it is', () => {
    expect(cvMarkup('engineering')).toContain('class="skill-grid"');
    for (const name of ['base.css', 'atlassian.css', 'print.css']) {
      expect(read(name), name).not.toContain('grid-three');
    }
  });
});
