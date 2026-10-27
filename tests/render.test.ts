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

  it('renders the Atlassian-theme ADS badges after the identity row, so PDF text reads the name first', () => {
    const html = cvMarkup('engineering');
    const badges = html.match(/<p class="ads-badges">.*?<\/p>/s)?.[0] ?? '';
    expect(badges).toContain('>Built with Atlassian Design System<');
    expect(badges.match(/<a class="ads-badge" href="https:\/\/atlassian\.design\/[^"]+"/g)).toHaveLength(3);
    expect(badges).not.toMatch(/>ADS /);
    const icons = badges.match(/<svg.*?<\/svg>/gs) ?? [];
    expect(icons).toHaveLength(3);
    expect(new Set(icons).size).toBe(3);
    expect(html.indexOf('class="identity-row"')).toBeLessThan(html.indexOf('class="ads-badges"'));
  });

  it('gives every summary item an ADS icon for the Atlassian theme', () => {
    const items = [...cvMarkup('engineering').matchAll(/<li data-flip="summary-[^"]+">.*?<\/li>/gs)].map((m) => m[0]);
    expect(items).toHaveLength(4);
    for (const item of items) expect(item).toMatch(/class="summary-ads-icon" aria-hidden="true"><svg viewBox="0 0 16 16"/);
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

  it("keeps each card's keywords in separated sets", () => {
    const html = cvMarkup('balanced');
    const sets = (id: string): string[] => {
      const start = html.indexOf(`data-flip="skills-${id}">`);
      const end = html.indexOf('class="logo-wrapper"', start);
      return [...html.slice(start, end).matchAll(/<p class="skill-set">(.*?)<\/p>/gs)].map((m) =>
        m[1].replace(/<span class="skill-extra".*?<\/span>/gs, '').replace(/<[^>]*>/g, ''),
      );
    };
    const items = (id: string): string[] => sets(id).join(', ').split(/, (?![^()]*\))/);

    expect(sets('frontend')).toHaveLength(3);
    expect(sets('growth')).toHaveLength(3);
    expect(sets('ai')).toHaveLength(4);
    expect(items('frontend')).toHaveLength(16);
    expect(items('growth')).toHaveLength(11);
    expect(items('ai')).toHaveLength(9);

    const starts = (id: string): string[] => sets(id).map((set) => set.slice(0, 40));
    const expected: Record<string, string[]> = {
      frontend: ['Component Architecture', 'Responsive UI', 'Testing ('],
      growth: ['A/B Testing', 'Analytics Instrumentation', 'Paid Performance Measurement'],
      ai: ['Context Engineering', 'Agentic Development', 'Automated Quality Gates', 'Knowledge Capture'],
    };
    for (const [id, prefixes] of Object.entries(expected)) {
      prefixes.forEach((prefix, n) => expect(starts(id)[n].startsWith(prefix)).toBe(true));
    }
  });

  it('shows nine logos in every card under every focus', () => {
    for (const focus of ['engineering', 'growth', 'balanced'] as const) {
      const cards = cvMarkup(focus).split('<div class="skill-group"').slice(1);
      expect(cards).toHaveLength(3);
      for (const card of cards) expect(card.match(/class="stack-logo"/g)).toHaveLength(9);
    }
  });

  it('fills the Analytics & experimentation logos with analytics tools under Engineering', () => {
    const growthCard = (focus: 'engineering' | 'growth' | 'balanced'): string =>
      cvMarkup(focus).match(/data-flip="skills-growth">.*?<\/div>\s*<\/div>/s)?.[0] ?? '';
    const added = ['Google Tag Manager', 'Looker', 'Google Search Console'];
    for (const name of added) {
      expect(growthCard('engineering')).toContain(`aria-label="${name}"`);
      expect(growthCard('growth')).not.toContain(`aria-label="${name}"`);
      expect(growthCard('balanced')).not.toContain(`aria-label="${name}"`);
    }
    expect(growthCard('engineering')).not.toContain('aria-label="Semrush"');
    expect(growthCard('growth')).toContain('aria-label="Semrush"');
    expect(growthCard('balanced')).toContain('aria-label="Semrush"');
    expect(cvMarkup('engineering')).toContain('Analytics &amp; experimentation');
    expect(cvMarkup('engineering')).not.toContain('Growth &amp; experimentation');
  });

  it('adds Atlassian-only keywords that balance the shorter cards', () => {
    const html = cvMarkup('balanced');
    const spans = [...html.matchAll(/<span class="skill-extra"[^>]*>.*?<\/span>/gs)].map((m) => m[0]);
    expect(spans).toHaveLength(6);
    expect(html.match(/class="skill-extra"/g)).toHaveLength(6);
    for (const span of spans) expect(span).toContain('data-theme-extra="atlassian"');
    const extraText = spans.join(' ').replace(/<[^>]*>/g, '');
    const phrases = [
      'Multi-Armed Bandit Testing',
      'Personalisation',
      'Behavioural Analytics (FullStory)',
      'Incrementality &amp; LTV Measurement',
      'AI Coding Assistants (Claude, Codex, Cursor)',
      'Agent-Driven Delivery Pipelines',
      'Automated Compliance Checks',
      'Shared Knowledge Bases (Coda)',
    ];
    for (const phrase of phrases) {
      expect(extraText).toContain(phrase);
      // every occurrence in the page sits inside a skill-extra span
      expect(html.split(phrase).length).toBe(extraText.split(phrase).length);
    }

    const total = (id: string): number => {
      const start = html.indexOf(`data-flip="skills-${id}">`);
      const end = html.indexOf('class="logo-wrapper"', start);
      const sets = [...html.slice(start, end).matchAll(/<p class="skill-set">(.*?)<\/p>/gs)].map((m) =>
        m[1].replace(/<span class="skill-extra"[^>]*>, /g, ', ').replace(/<[^>]*>/g, ''),
      );
      return sets.join(', ').split(/, (?![^()]*\))/).length;
    };
    expect(total('frontend')).toBe(16);
    expect(total('growth')).toBe(15);
    expect(total('ai')).toBe(13);
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

  it('draws the finguide logo as an animated inline mark, not an image', () => {
    const html = cvMarkup('balanced');
    expect(html).toContain('class="fg-mark"');
    expect(html).toContain('aria-label="finguide.money logo"');
    expect(html).not.toContain('finguide.jpeg');
    // Each moving part has its own hook for src/finguide-mark.ts.
    for (const part of ['fg-lean', 'fg-hop', 'fg-ear-l', 'fg-ear-r', 'fg-eyes', 'fg-eyehop', 'fg-blink', 'fg-eye-l', 'fg-eye-r']) {
      expect(html).toContain(part);
    }
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
