import { describe, expect, it } from 'vitest';
import { expectedOrder, readingOrderProblems } from '../scripts/pdf-reading-order';
import { byOrder, order as cardOrder, skills, visibleSkillSets } from '../src/content/cv';
import { cvMarkup } from '../src/render/cv';
import { FOCUSES } from '../src/types';

describe('expectedOrder', () => {
  const order = expectedOrder();
  it('starts with name, Summary, Experience and includes Skills', () => {
    expect(order.slice(0, 3)).toEqual(['Jake Thornton-Bowen', 'Summary', 'Experience']);
    expect(order).toContain('Skills');
  });
  it('puts a job title before its first bullet', () => {
    const title = order.indexOf('Senior Staff Growth Engineer, APAC');
    expect(title).toBeGreaterThan(-1);
    expect(order[title + 1].length).toBeLessThanOrEqual(24);
  });
});

describe('expectedOrder skills cards', () => {
  it('lists the card titles in the focus card order, after Skills', () => {
    for (const focus of FOCUSES) {
      const needles = expectedOrder(focus);
      const titles = byOrder(skills, cardOrder[focus].skills).map((g) => g.title);
      const positions = titles.map((t) => needles.indexOf(t));
      expect(positions.every((p) => p > needles.indexOf('Skills'))).toBe(true);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });
  it('puts the cards in the documented order per focus', () => {
    const titlesAfterSkills = (focus: (typeof FOCUSES)[number]) => {
      const needles = expectedOrder(focus);
      const names = skills.map((g) => g.title);
      return needles.slice(needles.indexOf('Skills')).filter((n) => names.includes(n));
    };
    expect(titlesAfterSkills('engineering')).toEqual(['Front-end engineering', 'AI-native workflows', 'Analytics & experimentation']);
    expect(titlesAfterSkills('growth')).toEqual(['Analytics & experimentation', 'Front-end engineering', 'AI-native workflows']);
    expect(titlesAfterSkills('balanced')).toEqual(['Front-end engineering', 'Analytics & experimentation', 'AI-native workflows']);
  });
  it('follows each card title with one needle per set the card shows', () => {
    for (const focus of FOCUSES) {
      const needles = expectedOrder(focus);
      for (const group of byOrder(skills, cardOrder[focus].skills)) {
        const at = needles.indexOf(group.title);
        const sets = visibleSkillSets(group, focus);
        expect(at).toBeGreaterThan(-1);
        // The next needle after the last set is the next card's title (or the end of the list).
        const after = needles.slice(at + 1 + sets.length)[0];
        expect(after === undefined || skills.some((g) => g.title === after)).toBe(true);
        expect(needles.slice(at + 1, at + 1 + sets.length).some((n) => skills.some((g) => g.title === n))).toBe(false);
      }
    }
    const counts = (focus: (typeof FOCUSES)[number]) =>
      Object.fromEntries(skills.map((g) => [g.id, visibleSkillSets(g, focus).length]));
    expect(counts('engineering')).toEqual({ frontend: 3, growth: 3, ai: 4 });
  });
  it('matches the text the rendered markup produces (no browser needed)', () => {
    const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    for (const focus of FOCUSES) {
      const html = cvMarkup(focus);
      const text = decode(html.slice(html.indexOf('Skills &amp; stacks')).replace(/<[^>]*>/g, ' '));
      const needles = expectedOrder(focus);
      expect(readingOrderProblems(text, needles.slice(needles.indexOf('Skills')))).toEqual([]);
    }
  });
});

describe('readingOrderProblems', () => {
  const order = expectedOrder();
  const text = order.join('\n');

  it('accepts the expected order', () => {
    expect(readingOrderProblems(text, order)).toEqual([]);
  });
  it('tolerates removed spaces and changed case', () => {
    expect(readingOrderProblems(text.toUpperCase().replace(/ /g, ''), order)).toEqual([]);
  });
  it('flags the name moved to the end (the phrases that now precede it are reported)', () => {
    const moved = [...order.slice(1), order[0]].join('\n');
    const problems = readingOrderProblems(moved, order);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toContain('Summary');
  });
  it('flags a job title moved after its bullets (the bullets are reported)', () => {
    const i = order.indexOf('Senior Staff Growth Engineer, APAC');
    const next = order.findIndex((n, k) => k > i && n === 'Ventures');
    const moved = [...order.slice(0, i), ...order.slice(i + 1, next), order[i], ...order.slice(next)].join('\n');
    const problems = readingOrderProblems(moved, order);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toContain(order[i + 1]);
  });
  it('flags the skills cards swapped (AI-native before Front-end)', () => {
    const needles = expectedOrder('engineering');
    const fe = needles.indexOf('Front-end engineering');
    const ai = needles.indexOf('AI-native workflows');
    const moved = [...needles.slice(0, fe), ...needles.slice(ai), ...needles.slice(fe, ai)].join('\n');
    expect(readingOrderProblems(needles.join('\n'), needles)).toEqual([]);
    expect(readingOrderProblems(moved, needles).length).toBeGreaterThan(0);
  });
});
