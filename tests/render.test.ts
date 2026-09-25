import { describe, expect, it } from 'vitest';
import { cvMarkup } from '../src/render/cv';

describe('cvMarkup', () => {
  it('renders two A4 pages with the core content', () => {
    const html = cvMarkup('balanced');
    expect(html.match(/class="page"/g)).toHaveLength(2);
    expect(html).toContain('Jake Thornton-Bowen');
    expect(html).toContain('Summary');
    expect(html).toContain('Intuit');
  });

  it('orders summary items by focus', () => {
    const firstLabel = (focus: 'growth' | 'engineering') =>
      cvMarkup(focus).match(/class="summary-label">([^<]+)</)?.[1];
    expect(firstLabel('growth')).toBe('Growth');
    expect(firstLabel('engineering')).toBe('Engineering');
  });

  it('shows the prepared-for line only for tailored links', () => {
    expect(cvMarkup('balanced')).not.toContain('Prepared for');
    expect(cvMarkup('balanced', 'Atlassian')).toContain('Prepared for Atlassian');
  });
});
