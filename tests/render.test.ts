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

  it('renders the Atlassian-theme ADS badges with ticks', () => {
    const badges = cvMarkup('engineering').match(/<p class="ads-badges">.*?<\/p>/s)?.[0] ?? '';
    expect(badges.match(/class="ads-badge"/g)).toHaveLength(3);
    expect(badges.match(/<svg/g)).toHaveLength(3);
  });

  it('orders the engineering summary for frontend roles', () => {
    const labels = [...cvMarkup('engineering').matchAll(/class="summary-label">([^<]+)</g)].map((m) => m[1]);
    expect(labels).toEqual(['Engineering', 'Growth', 'Customer-focused', 'Founder']);
  });

  it('carries the advertised Atlassian title alongside the standard one', () => {
    const role = cvMarkup('engineering').match(/<p class="role-title">.*?<\/p>/s)?.[0] ?? '';
    expect(role).toContain('<span class="role-std">Senior Front-End Engineer</span>');
    expect(role).toContain('data-theme-role="atlassian">Senior Frontend Software Engineer</span>');
    expect(cvMarkup('growth')).not.toContain('role-alt');
  });

  it('leaves SEO and ad tools out of the Growth skills under Engineering focus', () => {
    const growthGroup = (focus: 'growth' | 'engineering') =>
      cvMarkup(focus).match(/data-flip="skills-growth">.*?<\/div>\s*<\/div>/s)?.[0] ?? '';
    for (const name of ['>SEO<', 'aria-label="Google Ads"', 'aria-label="Semrush"']) {
      expect(growthGroup('growth')).toContain(name);
      expect(growthGroup('engineering')).not.toContain(name);
    }
    expect(growthGroup('engineering')).toContain('Paid Performance Measurement, Regional GTM Launches');
  });

  it('names the testing tools and hosting in the front-end skills', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('Testing (Jest, Testing Library, Vitest, Chromatic, MSW, pytest)');
    expect(html).toContain('Cloud Hosting (Railway, Vercel)');
    expect(html).not.toContain('Unit, E2E');
  });

  it('marks the invented Intuit figures as placeholders', () => {
    const html = cvMarkup('engineering');
    expect(html.match(/class="fill"/g)?.length).toBe(7);
  });

  it('keeps the metric-note phrases intact in the rewritten bullets', () => {
    expect(cvMarkup('engineering')).toContain('>Core Web Vitals passed</b>');
    expect(cvMarkup('growth')).toContain('>doubling marketing velocity</b>');
  });

  it('no longer carries the long Airtable bullet', () => {
    expect(cvMarkup('engineering')).not.toContain('Airtable impact/effort scoring system');
  });

  it('shows finguide testing and the Coda.io knowledge base', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('Tested at every layer');
    expect(html).toContain('href="https://finguide-storybook.vercel.app/"');
    expect(html).toContain('Coda.io as the APAC teams');
  });

  it('puts each employer name before its tags, so PDF text reads in order', () => {
    const head = cvMarkup('engineering').match(/<div class="employer-copy">.*?<\/div>\s*<\/div>/s)?.[0] ?? '';
    expect(head.indexOf('employer-name')).toBeLessThan(head.indexOf('employer-tags'));
  });

  it('shows the prepared-for line only for tailored links', () => {
    expect(cvMarkup('balanced')).not.toContain('Prepared for');
    expect(cvMarkup('balanced', 'Atlassian')).toContain('Prepared for Atlassian');
  });
});
