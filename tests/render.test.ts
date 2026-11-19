import { describe, expect, it } from 'vitest';
import { cvMarkup } from '../src/render/cv';
import { metricNotes } from '../src/content/cv';

/** The CV without company-tuned skills sets (data-theme-alt), i.e. what every theme but that company's shows. */
const standardSkills = (html: string) => html.replace(/<div class="skill-list" data-theme-alt="[^"]*">.*?<\/div>/gs, '');

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
      cvMarkup(focus).match(/class="summary-label"(?: data-theme-std="[^"]*")?>([^<]+)</)?.[1];
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
    const labels = [...cvMarkup('engineering').matchAll(/class="summary-label"(?: data-theme-std="[^"]*")?>([^<]+)</g)].map((m) => m[1]);
    expect(labels).toEqual(['Engineering', 'Customer-focused', 'Growth', 'Founder']);
  });

  it('carries the advertised Atlassian title alongside the standard one', () => {
    const role = cvMarkup('engineering').match(/<p class="role-title">.*?<\/p>/s)?.[0] ?? '';
    expect(role).toContain('<span class="role-std">Senior Frontend Engineer</span>');
    expect(role).toContain('data-theme-role="atlassian">Senior Frontend Software Engineer</span>');
    expect(cvMarkup('growth')).not.toContain('data-theme-role="atlassian"');
  });

  it('carries the Anduril kicker under Engineering focus', () => {
    const kicker = cvMarkup('engineering').match(/<p class="kicker">.*?<\/p>/s)?.[0] ?? '';
    expect(kicker).toContain('<span class="kicker-std">10+ Years’ Experience · React &amp; TypeScript · Design Systems</span>');
    expect(kicker).toContain('data-theme-kicker="anduril">10+ Years’ Experience · React &amp; TypeScript · Systems Design</span>');
  });

  it('carries the Anduril title in every focus', () => {
    for (const focus of ['balanced', 'growth', 'engineering'] as const) {
      expect(cvMarkup(focus)).toContain('data-theme-role="anduril">Senior Software Engineering Manager</span>');
    }
  });

  it('carries the Mitti-tuned summary, intro and bullets beside the standard ones', () => {
    const html = cvMarkup('growth');
    expect(html).toContain('<span data-theme-std="mitti">');
    expect(html).toMatch(/<span data-theme-alt="mitti">Engineer \/ marketer who led web growth/);
    expect(html).toMatch(/<p class="employer-intro" data-theme-alt="mitti">Growth lead within Intuit's marketing organisation/);
    expect(html).toMatch(/<ul class="bullets" data-theme-alt="mitti">(?:(?!<\/ul>).)*Tracked <b class="kw" data-f="balanced growth">SQLs in Salesforce/s);
    expect(html).toContain('<b class="summary-label" data-theme-alt="mitti">Customer</b>');
    // Content without a Mitti version renders once, unwrapped.
    expect(html).toContain('<h3>Frontend engineering</h3>');
    expect(html).toMatch(/<ul class="bullets" data-theme-alt="mitti"><li>Built <b class="kw" data-f="balanced growth">marketing and lifecycle automation<\/b> for <b class="kw" data-f="balanced growth">R.M.Williams/);
  });

  it('carries the Mitti title, kicker, label and skills in every focus', () => {
    for (const focus of ['balanced', 'growth', 'engineering'] as const) {
      const html = cvMarkup(focus);
      expect(html).toContain('data-theme-role="mitti">Growth Technology Leader</span>');
      expect(html).toContain('data-theme-kicker="mitti">');
      expect(html).toContain('<b class="summary-label" data-theme-alt="mitti">Technology</b>');
      expect(html).toMatch(/<div class="skill-list" data-theme-alt="mitti">.*Salesforce, HubSpot, Segment/s);
      expect(html).toContain('<h3 data-theme-alt="mitti">Martech &amp; experimentation</h3>');
      expect(html).toContain('<h3 data-theme-std="mitti">Analytics &amp; experimentation</h3>');
    }
  });

  it('leaves SEO and ad tools out of the Growth skills under Engineering focus', () => {
    const growthGroup = (focus: 'growth' | 'engineering') =>
      cvMarkup(focus).match(/data-flip="skills-growth">.*?<\/div>\s*<\/div>/s)?.[0] ?? '';
    for (const name of [', SEO,', 'aria-label="Google Ads"', 'aria-label="Semrush"']) {
      expect(growthGroup('growth')).toContain(name);
      expect(growthGroup('engineering')).not.toContain(name);
    }
    expect(growthGroup('engineering')).toContain('Paid Performance Measurement, Regional GTM Launches');
  });

  it('keeps platform names out of the skills keywords', () => {
    const html = cvMarkup('engineering');
    const start = html.indexOf('class="skill-grid"');
    const grid = html.slice(start, html.indexOf('</section>', start));
    expect(grid).toContain('Testing, Code Review, Technical Design, CI/CD, Cloud Hosting');
    for (const name of ['Jenkins', 'AWS', 'Railway', 'Vercel', 'Jest', '(AEM)', 'Adobe Analytics', '(FullStory)', '(Claude, Codex, Cursor)', '(Coda)']) {
      expect(grid, name).not.toContain(name);
    }
    expect(html).not.toContain('Unit, E2E');
  });

  it('names the eight evidenced keywords in the skills cards', () => {
    const html = cvMarkup('engineering');
    const start = html.indexOf('class="skill-grid"');
    const grid = html.slice(start, html.indexOf('</section>', start));
    const added = [
      'Unit &amp; Visual Regression Testing',
      'Design Tokens',
      'Migrations &amp; Rebrands',
      'Holdout Testing',
      'Event Tracking',
      'Session Replay',
      'Accessibility Checks',
      'Technical Leadership &amp; Mentoring',
    ];
    for (const keyword of added) expect(grid, keyword).toContain(keyword);
  });

  it('keeps page 2 ventures and VML lean', () => {
    const html = cvMarkup('engineering');
    expect(html).not.toContain('largest marketing, communications and creative agency networks');
    expect(html).toContain('for 25 Australian small businesses, focusing on low-maintenance marketing stacks.');
    expect(html).toContain('over a Django service with Celery workers');
  });

  it('tags the CV repo as open source and says what CI gates', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('<span class="tag">Open source</span>');
    expect(html).toContain('Started Sep 2026');
    expect(html).toContain('keeping all 36 PDFs at 2 pages, in reading order');
    expect(html).toContain('passing <b class="kw" data-f="engineering">WCAG AA contrast</b>');
    expect(html).not.toContain('7 company themes');
    expect(html).not.toContain('This CV as a');
  });

  it('shows the confirmed VML, customer and finguide copy', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('Built client websites on WordPress, CQ5 (AEM) and Sitecore');
    expect(html).toContain('<b class="kw" data-f="balanced growth">Lion</b> and <b class="kw" data-f="balanced growth">Young Henrys</b>');
    expect(html).toContain('full-funnel personalised omni-channel experiences, resulting');
    expect(html).toContain('in closed alpha and gathering user feedback');
    expect(html).toContain('compounding improvements measured by behavioural signals, heuristic tracking and automated experience metrics.');
    expect(html).toContain('transforming the website into a growth sales channel');
    expect(html).toContain('Side web consultancy');
    expect(html).toContain('Built this CV as a');
    expect(html).not.toContain('AEM, React and Next.js');
    expect(html).toContain('that <b class="kw" data-f="engineering">fail CI on accessibility violations</b>');
    expect(html).toContain('(Core Web Vitals passed)');
    expect(html).toContain('deferred scripts, added skeleton loading and <b class="kw" data-f="engineering">rebuilt all its UI and interactions</b>');
    expect(html).not.toContain('our use cases');
    expect(html).toContain('compliance checks and <b class="kw" data-f="engineering">HITL code reviews</b>');
    expect(html).not.toContain('AI-native engineer');
  });

  it("keeps each card's keywords in separated sets", () => {
    const html = standardSkills(cvMarkup('balanced'));
    const sets = (id: string): string[] => {
      const start = html.indexOf(`data-flip="skills-${id}">`);
      const end = html.indexOf('class="logo-wrapper"', start);
      return [...html.slice(start, end).matchAll(/<p class="skill-set">(.*?)<\/p>/gs)].map((m) =>
        m[1]
          .replace(/<span class="skill-set-title".*?<\/span>/gs, '')
          .replace(/<[^>]*>/g, ''),
      );
    };
    const items = (id: string): string[] => sets(id).join(', ').split(/, (?![^()]*\))/);

    expect(sets('frontend')).toHaveLength(3);
    expect(sets('growth')).toHaveLength(3);
    expect(sets('ai')).toHaveLength(4);
    expect(items('frontend')).toHaveLength(18);
    expect(items('growth')).toHaveLength(18);
    expect(items('ai')).toHaveLength(15);

    const starts = (id: string): string[] => sets(id).map((set) => set.slice(0, 40));
    const expected: Record<string, string[]> = {
      frontend: ['Component Architecture', 'Responsive UI', 'Unit &amp; Visual Regression'],
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

  it('includes the keywords that balance the shorter cards, in every theme', () => {
    const html = cvMarkup('balanced');
    const phrases = [
      'Multi-Armed Bandit Testing',
      'Personalisation',
      'Behavioural Analytics',
      'Incrementality &amp; LTV Measurement',
      'AI Coding Assistants',
      'Agent-Driven Delivery Pipelines',
      'Automated Compliance Checks',
      'Shared Knowledge Bases',
      'Design Tokens',
      'Migrations &amp; Rebrands',
      'Holdout Testing',
      'Session Replay',
      'Event Tracking',
      'Accessibility Checks',
      'Technical Leadership &amp; Mentoring',
    ];
    for (const phrase of phrases) expect(html).toContain(phrase);
    expect(html).not.toContain('skill-extra');
    expect(html).not.toContain('data-theme-title');
  });

  it('opens each skill set with a subtitle and bolds no skills keyword', () => {
    for (const focus of ['balanced', 'growth', 'engineering'] as const) {
      const html = standardSkills(cvMarkup(focus));
      const start = html.indexOf('class="skill-grid"');
      const grid = html.slice(start, html.indexOf('</section>', start));
      expect(grid, focus).not.toContain('<b');
      expect(grid.match(/<span class="skill-set-title">/g), focus).toHaveLength(10);
      // The Mitti sets (Martech & experimentation, AI-native workflows) open with subtitles and bold nothing either.
      const mitti = cvMarkup(focus).match(/<div class="skill-list" data-theme-alt="mitti">.*?<\/div>/gs) ?? [];
      expect(mitti, focus).toHaveLength(2);
      expect(mitti.join(''), focus).not.toContain('<b');
      expect(mitti.join('').match(/<span class="skill-set-title">/g), focus).toHaveLength(7);
      expect(mitti.join(''), focus).toContain('<span class="skill-set-title">Leadership: </span>');
    }
    const html = cvMarkup('engineering');
    const labels = ['Foundations', 'User experience', 'Delivery', 'Experimentation', 'Measurement', 'Go-to-market', 'Planning', 'Agents', 'Guardrails', 'Sharing'];
    for (const label of labels) expect(html).toContain(`<span class="skill-set-title">${label}: </span>`);
  });

  it('has no placeholders left in any focus', () => {
    for (const focus of ['balanced', 'growth', 'engineering'] as const) {
      expect(cvMarkup(focus)).not.toContain('class="fill"');
    }
  });

  it('shows the confirmed Intuit engineering facts', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('individual-contributor track');
    expect(html).toContain('against business and <b class="kw" data-f="engineering">technical KPIs</b>');
    expect(html).toContain('>Mentored engineers</b>');
    expect(html).toContain('>experimentation analytics and component-level event tracking</b>');
    expect(html).toContain('>28% increase in traffic to sign-up</b>');
    expect(html.match(/>Chromatic visual regression<\/b>/g)?.length).toBe(1);
    expect(html).toContain('Introduced impact/effort/complexity triage');
  });

  it('opens every web link in a new tab', () => {
    const links = [...cvMarkup('engineering').matchAll(/<a\s[^>]*href="https?:[^>]*>/g)].map(([tag]) => tag);
    expect(links.length).toBeGreaterThan(5);
    for (const tag of links) expect(tag, tag).toContain('target="_blank" rel="noopener noreferrer"');
  });

  it('bolds role keywords, not client names, under the Engineering focus', () => {
    const bold = (f: 'engineering' | 'growth', phrase: string) =>
      [...cvMarkup(f).matchAll(/<b class="kw" data-f="([^"]*)">(.*?)<\/b>/g)].some(
        ([, focuses, text]) => text === phrase && focuses.split(' ').includes(f),
      );
    for (const phrase of ['Radix/shadcn design system', 'fail CI on accessibility violations', 'open-source agent skills', 'global component strategy', 'page speed'])
      expect(bold('engineering', phrase), phrase).toBe(true);
    for (const phrase of ["McDonald's", "Kellogg's", 'performance', 'Railway and Vercel'])
      expect(bold('engineering', phrase), phrase).toBe(false);
    expect(bold('growth', "McDonald's")).toBe(true);
  });

  it('bolds every metric-note phrase in at least one focus, so each note can show', () => {
    const all = (['balanced', 'growth', 'engineering'] as const).map((f) => cvMarkup(f)).join('');
    for (const key of Object.keys(metricNotes)) expect(all, key).toContain(`>${key}</b>`);
  });

  it('keeps the metric-note phrases intact in the rewritten bullets', () => {
    expect(cvMarkup('engineering')).toContain('>load performance</b>');
    expect(cvMarkup('growth')).toContain('>doubling marketing content authoring velocity</b>');
    expect(cvMarkup('engineering')).toContain('>32% of sign-up starts completing</b>');
    expect(cvMarkup('engineering')).toContain('>20–30% faster</b>');
  });

  it('no longer carries the long Airtable bullet', () => {
    expect(cvMarkup('engineering')).not.toContain('Airtable impact/effort scoring system');
  });

  it('shows finguide testing and the knowledge spaces, without naming Notion', () => {
    const html = cvMarkup('engineering');
    expect(html).toContain('Tested at every layer');
    expect(html).toContain('href="https://finguide-storybook.vercel.app/?path=%2Fdocs%2Fmarketing-showcase--docs"');
    expect(html).toContain('shared knowledge spaces with relational databases');
    expect(html).not.toContain('spaces in Notion');
  });

  it('breaks the founder summary line between finguide and fuelr', () => {
    expect(cvMarkup('balanced')).toContain('rel="noopener noreferrer">web application</a>.<br>Runs <b>fuelr</b>, a web consultancy supporting SMBs');
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
