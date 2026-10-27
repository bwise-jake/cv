import { describe, expect, it } from 'vitest';
import { expectedOrder, plainText, readingOrderProblems } from '../scripts/pdf-reading-order';

describe('plainText', () => {
  it('strips bold markup', () => {
    expect(plainText('a **b** c')).toBe('a b c');
  });
  it('strips focus-bold markup', () => {
    expect(plainText('a [[b|b,g,e]] c')).toBe('a b c');
  });
  it('strips placeholders', () => {
    expect(plainText('a {{b}} c')).toBe('a b c');
  });
  it('strips links', () => {
    expect(plainText('a [b](https://example.com/x) c')).toBe('a b c');
  });
});

describe('expectedOrder', () => {
  const order = expectedOrder();
  it('starts with name, Summary, Experience and ends with Skills', () => {
    expect(order.slice(0, 3)).toEqual(['Jake Thornton-Bowen', 'Summary', 'Experience']);
    expect(order.at(-1)).toBe('Skills');
  });
  it('puts a job title before its first bullet', () => {
    const title = order.indexOf('Senior Staff Growth Engineer, APAC');
    expect(title).toBeGreaterThan(-1);
    expect(order[title + 1].length).toBeLessThanOrEqual(24);
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
});
