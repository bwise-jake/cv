import { describe, expect, it } from 'vitest';
import { rich } from '../src/content/rich';

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
