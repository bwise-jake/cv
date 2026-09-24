import type { Focus } from '../types';
import type { summaryIcons } from './icons';

/*
 * All CV copy lives here. Strings use the inline markup documented in rich.ts:
 *   **always bold**   [[bold under some focuses|b,g,e]]   {{placeholder}}   [link](https://…)
 * b = Balanced (the original CV's emphasis), g = Growth, e = Engineering.
 */

export interface Headline {
  kicker: string;
  role: string;
}

export interface SummaryItem {
  id: keyof typeof summaryIcons;
  label: string;
  text: string;
}

export interface Job {
  title?: string;
  dates?: string;
  bullets: string[];
}

export interface Employer {
  logo: string;
  logoAlt: string;
  tags: string;
  name: string;
  span: string;
  intro?: string;
  /** Long blocks may split across a printed page. */
  long?: boolean;
  jobs: Job[];
}

export interface SkillGroup {
  id: 'frontend' | 'growth' | 'ai';
  title: string;
  skills: string;
  logos: string[];
  logosLabel: string;
}

export const person = {
  name: 'Jake Thornton-Bowen',
  photo: 'assets/profile.jpg',
  location: 'Sydney, NSW, Australia',
  email: 'jakethorntonbowen@gmail.com',
  linkedin: 'linkedin.com/in/jaketb',
  /** Live interactive CV. Shown in the header (and so in every PDF); swap for a custom domain. */
  website: 'https://bwise-jake.github.io/jaketb-cv-repo/',
};

/**
 * "How this was measured" notes, shown on hover/focus over the matching phrase in the CV.
 * Keys must match the phrase text exactly. Notes still containing a {{placeholder}} only show in
 * local dev, never in the deployed site or the PDF.
 */
export const metricNotes: Record<string, string> = {
  '$5.5m+ in incremental LTV': '{{How LTV was calculated: attribution model, retention window, source (e.g. Amplitude/Optimizely)}}',
  '60+ web experiments': '{{Period, platforms and what counted as an experiment; win rate}}',
  '10× traffic': '{{Baseline vs expanded traffic, markets included}}',
  'triple experimentation velocity': '{{Tests per quarter before vs after}}',
  '15+ countries': '{{Which markets the winners were rolled out to}}',
  '3k+ incremental subscriptions': '{{Measurement window and method (holdout, A/B lift)}}',
  'doubling marketing velocity': '{{What was measured: requests shipped per month before vs after}}',
  'Lighthouse 90+': '{{Pages, device profile and how it was maintained}}',
  '25 small businesses': '{{Types of businesses and what was delivered}}',
};

export const headlines: Record<Focus, Headline> = {
  balanced: {
    kicker: '10+ yrs · Ex-Intuit · 60+ experiments · $5.5m+ incremental LTV',
    role: 'Front-End Growth Engineer',
  },
  growth: {
    kicker: '$5.5m+ incremental LTV · 60+ experiments · Ex-Intuit',
    role: 'Senior Growth Engineer',
  },
  engineering: {
    kicker: '10+ yrs · Ex-Intuit · React & TypeScript · Lighthouse 90+',
    role: 'Senior Front-End Engineer',
  },
};

export const summary: SummaryItem[] = [
  {
    id: 'growth',
    label: 'Growth',
    text: 'Technical growth leader, most recently accountable owner of QuickBooks websites across APAC for **Intuit**, personally driving [[$5.5m+ in incremental LTV|b,g]] through [[60+ web experiments|b,g]] across the funnel: merchandising, UX/UI, components, content, [[page speed and technical SEO|e]].',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    text: 'Hands-on [[front-end engineer with 10+ years|b,e]] shipping enterprise production code in [[TypeScript/JavaScript, React, HTML and CSS|b,e]]: [[component architecture|e]], [[web performance|e]] and [[experimentation-ready UI|g]] on [[high-traffic, revenue-critical sites|g]]. Fluent in [[agentic engineering|b,e]], orchestrating autonomous agent workflows with human-in-the-loop review.',
  },
  {
    id: 'founder',
    label: 'Founder',
    text: 'Founded **fuelr**, a web marketing consultancy running low-maintenance marketing stacks for [[25 small businesses|b,g]], and now building **finguide**, a [[full-stack open-banking|e]] personal-finance app that helps users compound the benefits of small actions.',
  },
  {
    id: 'customer',
    label: 'Customer-focused',
    text: 'Crafting [[user experiences|b,g]] from [[quantitative and qualitative data|g]], working closely with designers, engineers, marketing and product, and keeping myself and the team accountable for [[measurable impact|g]], while able to [[influence above and motivate below|b]].',
  },
];

export const experience: Employer[] = [
  {
    logo: 'assets/logos/intuit.jpeg',
    logoAlt: 'Intuit logo',
    tags: 'Enterprise · SaaS · Finance · Tech · B2C · B2B · AI',
    name: 'Intuit – [QuickBooks](https://quickbooks.intuit.com/au/) & [Mailchimp](https://mailchimp.com/?currency=AUD)',
    span: 'Mar 2020 – Aug 2026 · 6 yrs 6 months',
    intro: 'Promoted 3× from Senior Web Development Manager (M1) to Senior Staff Growth Engineer (P6), starting on QuickBooks Australia and expanding to Mailchimp and 15+ countries across APAC, owning web development, authoring, experimentation and growth delivery.',
    long: true,
    jobs: [
      {
        title: 'Senior Staff Growth Engineer, APAC',
        dates: 'Jun 2025 – Aug 2026',
        bullets: [
          'Owned [[growth engineering and experimentation strategy|g]] for QuickBooks and Mailchimp across APAC, using the [[10× traffic|b,g]] from my expanded scope to [[triple experimentation velocity|b,g]] and roll proven A/B winners out to [[15+ countries|b,g]], driving [[3k+ incremental subscriptions|b,g]].',
          '[[Technical lead|e]] for regional GTM launches, including 3 global AI rebrands, balancing rich experiences with page performance ([[Lighthouse 90+|e]]).',
        ],
      },
      {
        title: 'Head of Web, Australia',
        dates: 'Aug 2023 – Jun 2025',
        bullets: [
          'Joined the marketing leadership team and took on [[technical direction|e]] for [[paid performance, CRO and measurement|g]] across all digital sales channels, shaping shared web strategy across tier-2 markets (AU, UK, CA).',
          'Triaged hundreds of cross-functional requests with an Airtable impact/effort scoring system, and secured budget for parallel agency workstreams on content and simple builds, freeing the core team for complex work and [[doubling marketing velocity|b,g]].',
        ],
      },
      {
        title: 'Senior Web Development & CRO Manager',
        dates: 'Jan 2022 – Aug 2023',
        bullets: [
          'Added [[CRO experimentation|g]] and [[performance|e]] to the remit, turning the website into a measurable sales channel with a larger budget. Ran {{XX}} experiments, delivering {{XX% lift in XX}}.',
        ],
      },
      {
        title: 'Senior Web Development Manager',
        dates: 'Mar 2020 – Jan 2022',
        bullets: [
          'Ran front-end development and web project delivery, leading a [[team of 4 engineers|e]] alongside agency partners to support marketing and drive technical KPIs.',
          'Built a [[shared component library|e]] on [[Atomic Design|b,e]] principles in [[AEM, React and Next.js|b,e]], and partnered with design to deliver multiple site migrations and full rebrands on it.',
        ],
      },
    ],
  },
  {
    logo: 'assets/logos/vml.jpeg',
    logoAlt: 'VML logo',
    tags: 'Agency · Marketing · Tech',
    name: 'VML',
    span: 'Nov 2015 – Mar 2020 · 4 yrs 4 months',
    intro: "One of the world's largest marketing, communications and creative agency networks.",
    jobs: [
      {
        title: 'Web Development Lead',
        dates: 'Dec 2016 – Mar 2020',
        bullets: [
          "Led a team of 4 developers and 3 content authors delivering front-end for **McDonald's**, **Hyundai**, **Nivea** and **Charter Hall**, taking [[responsive campaign sites|e]] and [[product launches|g]] from design to launch.",
        ],
      },
      {
        title: 'Web Developer',
        dates: 'Nov 2015 – Dec 2016',
        bullets: [
          "Built [[responsive, cross-browser|e]] campaign sites and landing pages for **Kellogg's** across APAC, promoted to lead within a year.",
        ],
      },
    ],
  },
];

export const ventures: Employer[] = [
  {
    logo: 'assets/logos/finguide.jpeg',
    logoAlt: 'finguide.money logo',
    tags: 'Start-up · Tech · Finance · AI',
    name: '[finguide.money](https://finguide.money)',
    span: 'Founded Jan 2026',
    intro: 'Personal-finance education app for Australians, in closed alpha: step-by-step Guides across 14 money topics beside the user’s own open-banking data (via **Basiq**), with optional AI autopilot.',
    jobs: [
      {
        bullets: [
          'Designed and built the front end in [[React 19, TypeScript and Tailwind|b,e]] on a Radix/shadcn design system in [[Storybook|b,e]], with [[Chromatic visual regression|e]] and [[axe accessibility testing|e]], backed by a [[typed GraphQL API|e]] over Django and Celery.',
          'Built an [[agent-driven delivery pipeline|b,e]] where every change starts with a written technical plan and is gated by automated tests, compliance checks and my code review.',
        ],
      },
    ],
  },
  {
    logo: 'assets/logos/fuelr.jpeg',
    logoAlt: 'fuelr.digital logo',
    tags: 'Agency · SMBs · Tech',
    name: '[fuelr.digital](https://fuelr.digital)',
    span: 'Founded Oct 2016',
    intro: 'Web consultancy [[building and growing sites|g]] for 25 Australian sole traders and small businesses without in-house teams, run alongside full-time roles.',
    jobs: [],
  },
];

export const skills: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Front-End Engineering',
    skills: '[[Component Architecture|e]], [[Design Systems|e]], Design Patterns, State & Data Management, API Integration (GraphQL, REST), Responsive UI, Cross-Browser Compatibility, [[Accessibility (WCAG)|e]], [[Web Performance (Core Web Vitals)|e,g]], Internationalisation (i18n), CMS & Content Authoring, Unit, E2E & Visual Regression Testing, Code Review, Technical Design Docs, CI/CD',
    logos: ['React', 'Next.js', 'TypeScript', 'HTML5', 'CSS', 'Tailwind CSS', 'Storybook', 'Node.js', 'Git'],
    logosLabel: 'Front-End Engineering platforms',
  },
  {
    id: 'growth',
    title: 'Growth & Experimentation',
    skills: '[[A/B Testing|g]], [[CRO|g]], UX Design & Wireframing, [[Experiment Design & Analysis|g]], [[Experimentation Infrastructure|g,e]], [[Analytics Instrumentation|g,e]], [[Funnel Analytics|g]], Paid Performance Measurement, [[SEO|g]], Regional GTM Launches, Impact/Effort Prioritisation',
    logos: ['Optimizely', 'Google Analytics', 'FullStory', 'Google Ads', 'Semrush', 'Ahrefs', 'Figma', 'Hotjar', 'Amplitude'],
    logosLabel: 'Growth and Experimentation platforms',
  },
  {
    id: 'ai',
    title: 'AI-Native Workflows',
    skills: 'Context Engineering, [[Agentic Development|e]], [[Multi-Agent Orchestration|e]], Plan-Driven Delivery, [[Automated Quality Gates|e]], AI Compliance Guardrails, [[MCP Integrations|e]], Human-in-the-Loop Review, Knowledge Capture & Reuse',
    logos: ['Claude', 'OpenAI Codex', 'Cursor', 'Model Context Protocol', 'GitHub', 'Airtable', 'Notion', 'Jira', 'Confluence'],
    logosLabel: 'AI-Native Workflows platforms',
  },
];

/** Order of summary items and skill groups per focus. Balanced matches the original CV. */
export const order: Record<Focus, { summary: SummaryItem['id'][]; skills: SkillGroup['id'][] }> = {
  balanced: {
    summary: ['growth', 'engineering', 'founder', 'customer'],
    skills: ['frontend', 'growth', 'ai'],
  },
  growth: {
    summary: ['growth', 'customer', 'engineering', 'founder'],
    skills: ['growth', 'frontend', 'ai'],
  },
  engineering: {
    summary: ['engineering', 'founder', 'growth', 'customer'],
    skills: ['frontend', 'ai', 'growth'],
  },
};

export function byOrder<T extends { id: string }>(items: T[], ids: readonly string[]): T[] {
  return ids.map((id) => {
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error(`No content item with id "${id}"`);
    return item;
  });
}
