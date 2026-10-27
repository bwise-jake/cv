import { describe, expect, it } from 'vitest';
import { plainText, rich } from '../src/content/rich';

describe('rich', () => {
  it('escapes plain text', () => {
    expect(rich('A & B <c>')).toBe('A &amp; B &lt;c&gt;');
  });

  it('renders always-bold text', () => {
    expect(rich('for **Intuit**.')).toBe('for <b>Intuit</b>.');
  });

  it('renders focus keywords with every listed focus', () => {
    expect(rich('[[60+ experiments|b,g]]')).toBe('<b class="kw" data-f="balanced growth">60+ experiments</b>');
    expect(rich('[[React|e]]')).toBe('<b class="kw" data-f="engineering">React</b>');
  });

  it('rejects unknown focus keys', () => {
    expect(() => rich('[[x|z]]')).toThrow(/Unknown focus key/);
  });

  it('renders placeholders and links', () => {
    expect(rich('Ran {{XX}} tests')).toBe('Ran <span class="fill">XX</span> tests');
    expect(rich('[QuickBooks](https://quickbooks.intuit.com/au/) & more')).toBe(
      '<a href="https://quickbooks.intuit.com/au/" target="_blank" rel="noopener noreferrer">QuickBooks</a> &amp; more',
    );
  });
});

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

  it('matches the visible text of rich() for every markup form (grammar parity)', () => {
    const visible = (html: string) =>
      html
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
    for (const s of ['**a** & b', 'x [[y|b,g,e]] z', 'ran {{XX}} tests', '[Q](https://q.example/a) <i>']) {
      expect(plainText(s)).toBe(visible(rich(s)));
    }
  });
});
