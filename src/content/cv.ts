import type { Focus, ThemeId } from '../types';
import type { summaryIcons } from './icons';
import type { LogoMark } from './logo-marks';
import { plainText } from './rich';

/*
 * All CV copy lives here. Strings use the inline markup documented in rich.ts:
 *   **always bold**   [[bold under some focuses|b,g,e]]   {{placeholder}}   [link](https://…)
 * b = Balanced (the original CV's emphasis), g = Growth, e = Engineering.
 */

export interface Headline {
  kicker: string;
  role: string;
  /** A company's advertised title, shown in that company's theme instead of `role`. */
  roleByTheme?: Partial<Record<ThemeId, string>>;
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
  /** Image path. Omitted when `logoMark` supplies an inline mark instead. */
  logo?: string;
  /** Inline animated mark (see `src/content/logo-marks.ts`), drawn in place of the image. */
  logoMark?: LogoMark;
  logoAlt: string;
  /** Industry tags, " · "-separated. Omitted for entries that fold them into `span`. */
  tags?: string;
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
  /** One entry per visually separated set of keywords. */
  skills: string[];
  logos: string[];
  logosLabel: string;
  /** Extra keywords shown under one theme only (the other themes hide them), appended to the set at the same index; '' for none. They cost the other themes page space, so only the Atlassian theme, which has the room, has any. */
  extra?: Partial<Record<ThemeId, string[]>>;
  /** Skills and logos (by their plain text) left out under a focus. */
  omit?: Partial<Record<Focus, string[]>>;
}

export const person = {
  name: 'Jake Thornton-Bowen',
  photo: 'assets/profile.jpg',
  location: 'Sydney, NSW, Australia',
  email: 'jakethorntonbowen@gmail.com',
  linkedin: 'linkedin.com/in/jaketb',
};

/**
 * "How this was measured" notes, shown on hover/focus over the matching phrase in the CV.
 * Keys must match the phrase text exactly. Notes still containing a {{placeholder}} only show in
 * local dev, never in the deployed site or the PDF.
 */
export const metricNotes: Record<string, string> = {
  '$5.5m+ in incremental LTV':
    'Sum of incremental subscriptions measured by A/B test or holdout, multiplied by 36-month LTV, 2022–2026.',
  '60+ web experiments':
    'Split and multi-armed bandit tests across key landing pages, scoped with FullStory and measured in Adobe Analytics to statistical significance, 2022–2026.',
  '10× traffic': 'From ~100k monthly visits (QuickBooks AU) to ~1m across APAC when the role expanded to the region.',
  'triple experimentation velocity':
    'Pooling ~10× the traffic let tests reach statistical significance far sooner, so the same team concluded roughly three times as many tests per quarter.',
  '9+ countries': 'Including AU, NZ, PH, SG, MY, JP, HK, CN and KR.',
  '3k+ incremental subscriptions':
    'Incremental subscriptions from winning tests rolled out across APAC, measured by A/B test or holdout, Jun 2025–Aug 2026.',
  'doubling marketing velocity':
    'Measured briefed-to-shipped: scored triage plus agency workstreams for content and simple builds halved the time from brief to live page, so twice as much shipped.',
  'Core Web Vitals passed': 'Google Core Web Vitals passed on 100% of desktop and 90% of mobile page loads.',
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
    kicker: '10+ Years Experience · React & TypeScript · Design Systems',
    role: 'Senior Front-End Engineer',
    roleByTheme: { atlassian: 'Senior Frontend Software Engineer' },
  },
};

export const summary: SummaryItem[] = [
  {
    id: 'growth',
    label: 'Growth',
    text: 'Technical growth builder who most recently led QuickBooks web across APAC for **Intuit**, validating assumptions about users with [[60+ web experiments|b,g]] across the funnel (merchandising, UX/UI, components, content, [[page speed and technical SEO|e]]) and personally driving [[$5.5m+ in incremental LTV|b,g]].',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    text: 'Hands-on [[front-end engineer with 10+ years|b,e]] shipping enterprise production code in [[TypeScript/JavaScript, React, HTML and CSS|b,e]]: [[component architecture|e]], [[web performance|e]] and [[experimentation-ready UI|g]] on [[high-traffic, revenue-critical sites|g]]. Fluent in [[agentic engineering|b,e]], orchestrating agent workflows with human-in-the-loop review.',
  },
  {
    id: 'founder',
    label: 'Founder',
    text: 'Founded **fuelr**, a web marketing consultancy running low-maintenance marketing stacks for [[25 small businesses|b,g]], and now building **finguide**, a [[full-stack open-banking|e]] personal-finance app that helps users compound the benefits of small actions.',
  },
  {
    id: 'customer',
    label: 'Customer-focused',
    text: 'Shapes UI from [[user evidence|b,g,e]]: {{FullStory showed mobile users abandoning a 3-step plan picker, and a single-screen comparison lifted mobile sign-ups 14%}}. Puts users before quick wins, {{holding a launch to fix keyboard and screen-reader gaps}}.',
  },
];

export const experience: Employer[] = [
  {
    logo: 'assets/logos/intuit.jpeg',
    logoAlt: 'Intuit logo',
    tags: 'Enterprise · SaaS · Finance · B2C · B2B · AI',
    name: 'Intuit – [QuickBooks](https://quickbooks.intuit.com/au/) & [Mailchimp](https://mailchimp.com/)',
    span: '(6 yrs 6 months) Mar 2020 – Aug 2026',
    intro: 'Promoted 3× from Senior Web Development Manager (M1) to Senior Staff Growth Engineer (P6), starting on QuickBooks Australia and expanding to Mailchimp and 9+ countries across APAC, owning web development, authoring, experimentation and growth delivery.',
    long: true,
    jobs: [
      {
        title: 'Senior Staff Growth Engineer, APAC',
        dates: 'Jun 2025 – Aug 2026',
        bullets: [
          'Owned [[growth engineering and experimentation strategy|g]] for QuickBooks and Mailchimp across APAC, using the [[10× traffic|b,g]] from my expanded scope to [[triple experimentation velocity|b,g]] and roll proven A/B winners out to [[9+ countries|b,g]], driving [[3k+ incremental subscriptions|b,g]].',
          '[[Technical lead|e]] for regional GTM launches, including 3 global AI rebrands: {{owned the front-end architecture and CI performance budgets for 6 engineers across 3 teams}}, cutting LCP from {{3.4s to 1.9s}} with [[Core Web Vitals passed|e]].',
          "Set up [[Coda.io as the APAC teams' shared knowledge base|b,e]], a hive mind where engineers, marketers and agencies could find and reuse each other's work.",
        ],
      },
      {
        title: 'Head of Web, Australia',
        dates: 'Aug 2023 – Jun 2025',
        bullets: [
          'Joined the marketing leadership team and took on [[technical direction|e]] for [[paid performance, CRO and measurement|g]] across all digital sales channels, shaping shared web strategy across AU, UK and CA.',
          'Introduced impact/effort triage and parallel agency workstreams, freeing engineers for complex builds and [[doubling marketing velocity|b,g]].',
        ],
      },
      {
        title: 'Senior Web Development & CRO Manager',
        dates: 'Jan 2022 – Aug 2023',
        bullets: [
          'Added [[CRO experimentation|g]] and [[performance|e]] to the remit, turning the website into a measurable sales channel with a larger budget. Ran numerous full-funnel personalisation experiments, delivering a [[28% increase in traffic to sign-up|b,g]].',
          'Built the [[experimentation infrastructure|e]]: {{a React variant framework on Adobe Target with feature-flagged components and typed analytics events}}, cutting the build time per test from {{5 days to 1}}.',
        ],
      },
      {
        title: 'Senior Web Development Manager',
        dates: 'Mar 2020 – Jan 2022',
        bullets: [
          'Ran front-end development and web project delivery, leading a [[team of 4 engineers|e]] alongside agency partners to support marketing and drive technical KPIs.',
          'Built a [[shared component library|e]] on [[Atomic Design|b,e]] principles in [[AEM, React and Next.js|b,e]] ({{120+ components in Storybook with Jest tests, used by 4 teams across 3 sites}}), and partnered with design to deliver multiple site migrations and full rebrands on it.',
        ],
      },
    ],
  },
  {
    logo: 'assets/logos/vml.jpeg',
    logoAlt: 'VML logo',
    tags: 'Agency · Marketing · Tech',
    name: 'VML',
    span: '(4 yrs 5 months) Nov 2015 – Mar 2020',
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
    logoMark: 'finguide',
    logoAlt: 'finguide.money logo',
    tags: 'Start-up · Tech · Finance · AI',
    name: '[finguide.money](https://finguide.money)',
    span: 'Founded Jan 2026',
    intro: 'Personal-finance education app for Australians, in closed alpha: step-by-step Guides across 14 money topics beside the user’s own open-banking data (via **Basiq**), with optional AI autopilot.',
    jobs: [
      {
        bullets: [
          'Designed and built the front end in [[React 19, TypeScript and Tailwind|b,e]] on a Radix/shadcn design system in [[[Storybook](https://finguide-storybook.vercel.app/)|b,e]], backed by a [[typed GraphQL API|e]] over Django and Celery, hosted on [[Railway and Vercel|e]].',
          'Tested at every layer: 800+ [[Jest and Testing Library|b,e]] specs, 300+ Storybook stories run as [[Vitest browser tests|e]] that fail CI on axe violations, [[Chromatic visual regression|e]] with MSW-mocked GraphQL, and pytest on the backend.',
          'Built an [[agent-driven delivery pipeline|b,e]] where every change starts with a plan and is gated by automated tests, compliance checks and my code review.',
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
  {
    logo: 'assets/logos/cv-knight.png',
    logoAlt: 'Pixel-art knight avatar',
    name: '[github.com/bwise-jake/cv](https://github.com/bwise-jake/cv)',
    span: 'Open source · 2026',
    intro: 'This CV as a [[pre-rendered TypeScript/Vite|b,e]] app (no JavaScript needed), themed for 7 companies. [[Vitest unit tests and CI|e]] keep all 24 PDFs at 2 pages and [[WCAG AA contrast|e]]; the Atlassian theme uses [[ADS tokens|e]] checked by ADS Stylelint, with the ADS ESLint plugin on the TypeScript.',
    jobs: [],
  },
];

export const skills: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Front-end engineering',
    skills: [
      '[[Component Architecture|e]], [[Design Systems|e]], Design Patterns, State & Data Management, API Integration (GraphQL, REST), CMS & Content Authoring (AEM)',
      'Responsive UI, Cross-Browser Compatibility, [[Accessibility (WCAG)|e]], Internationalisation (i18n), [[Web Performance (Core Web Vitals)|e,g]]',
      'Testing (Jest, Testing Library, Vitest, Chromatic, MSW, pytest), Code Review, Technical Design, CI/CD, Cloud Hosting (Railway, Vercel)',
    ],
    logos: ['React', 'Next.js', 'TypeScript', 'HTML5', 'CSS', 'Tailwind CSS', 'Storybook', 'Node.js', 'Git'],
    logosLabel: 'Front-End Engineering platforms',
  },
  {
    id: 'growth',
    title: 'Analytics & experimentation',
    skills: [
      '[[A/B Testing|g]], [[Experiment Design & Analysis|g]], [[Experimentation Infrastructure|g,e]], [[CRO|g]], UX Design & Wireframing',
      '[[Analytics Instrumentation|g,e]], [[Funnel Analytics|g]] (Adobe Analytics)',
      'Paid Performance Measurement, [[SEO|g]], Regional GTM Launches, Impact/Effort Prioritisation',
    ],
    logos: ['Optimizely', 'Google Analytics', 'Google Tag Manager', 'Looker', 'FullStory', 'Google Ads', 'Semrush', 'Ahrefs', 'Figma', 'Hotjar', 'Amplitude', 'Google Search Console'],
    logosLabel: 'Analytics and Experimentation platforms',
    extra: {
      atlassian: [
        '[[Multi-Armed Bandit Testing|g]], Personalisation',
        'Behavioural Analytics (FullStory), [[Incrementality & LTV Measurement|g]]',
        '',
      ],
    },
    omit: {
      engineering: ['SEO', 'Google Ads', 'Semrush', 'Ahrefs'],
      growth: ['Google Tag Manager', 'Looker', 'Google Search Console'],
      balanced: ['Google Tag Manager', 'Looker', 'Google Search Console'],
    },
  },
  {
    id: 'ai',
    title: 'AI-native workflows',
    skills: [
      'Context Engineering, Plan-First Delivery',
      '[[Agentic Development|e]], [[Multi-Agent Orchestration|e]], [[MCP Integrations|e]]',
      '[[Automated Quality Gates|e]], AI Compliance Guardrails, Human-in-the-Loop Review',
      'Knowledge Capture & Reuse',
    ],
    logos: ['Claude', 'OpenAI Codex', 'Cursor', 'Model Context Protocol', 'GitHub', 'Airtable', 'Notion', 'Jira', 'Confluence'],
    logosLabel: 'AI-Native Workflows platforms',
    extra: {
      atlassian: [
        'AI Coding Assistants (Claude, Codex, Cursor)',
        '[[Agent-Driven Delivery Pipelines|e]]',
        'Automated Compliance Checks',
        'Shared Knowledge Bases (Coda)',
      ],
    },
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
    summary: ['engineering', 'growth', 'customer', 'founder'],
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

/**
 * The keyword sets a card shows under a focus: keywords named in `omit` are removed (matched by their plain text),
 * and so are sets left empty. Each set carries the per-theme `extra` keywords for the same index, filtered the same
 * way. The renderer and the PDF reading-order check both use this, so they cannot disagree about what a card shows.
 */
export function visibleSkillSets(group: SkillGroup, focus: Focus): { text: string; extras: [ThemeId, string][] }[] {
  const omitted = new Set(group.omit?.[focus]);
  const keep = (list: string) =>
    list
      .split(', ')
      .filter((s) => !omitted.has(plainText(s)))
      .join(', ');
  return group.skills
    .map((set, i) => ({
      text: keep(set),
      extras: Object.entries(group.extra ?? {})
        .map(([theme, lists]) => [theme as ThemeId, keep(lists?.[i] ?? '')] as [ThemeId, string])
        .filter(([, text]) => text),
    }))
    .filter(({ text }) => text);
}
