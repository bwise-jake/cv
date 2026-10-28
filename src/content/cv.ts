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
  /** Run-in subtitles for the sets, by index, shown under one theme only (the other themes hide them). Only the Atlassian theme, whose sets are separate card blocks, has any. */
  titles?: Partial<Record<ThemeId, string[]>>;
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
    'Incremental subscriptions measured by A/B test or holdout (~10,600 paying subscriptions) × $520 lifetime value (monthly price × average retention).',
  '60+ web experiments':
    'Split and multi-armed bandit tests across key landing pages, scoped with FullStory and measured in Adobe Analytics to statistical significance, 2022–2026.',
  '10× traffic': 'From ~100k monthly visits (QuickBooks AU) to ~1m across APAC when the role expanded to the region.',
  'triple experimentation velocity':
    'Pooling ~10× the traffic let tests reach statistical significance far sooner, so the same team concluded roughly three times as many tests per quarter.',
  '9+ countries': 'Including AU, NZ, PH, SG, MY, JP, HK, CN and KR.',
  '3k+ incremental subscriptions':
    'Incremental subscriptions from winning tests rolled out across APAC, measured by A/B test or holdout, FY26 (Aug 2025–Jul 2026).',
  'doubling marketing content authoring velocity':
    'Measured briefed-to-shipped: scored triage plus agency workstreams for content and simple builds halved the time from brief to live page, so twice as much shipped.',
  'load performance': 'Google Core Web Vitals passed on 100% of desktop and 90% of mobile page loads.',
  '32% of sign-up starts completing':
    "Desktop sign-ups finished as a share of sign-ups started, QuickBooks Australia: the highest completion rate of Intuit's international markets.",
  '20–30% faster':
    'Experiments enrolled only users who scrolled to the changed component (variant or control), so unexposed traffic no longer diluted the results.',
  '28% increase in traffic to sign-up':
    'Measured by split testing each personalisation experiment against the existing experience, Jan 2022 – Aug 2023.',
};

export const headlines: Record<Focus, Headline> = {
  balanced: {
    kicker: '10+ yrs · Ex-Intuit · 60+ experiments · $5.5m+ incremental LTV',
    role: 'Frontend Growth Engineer',
  },
  growth: {
    kicker: '$5.5m+ incremental LTV · 60+ experiments · Ex-Intuit',
    role: 'Senior Growth Engineer',
  },
  engineering: {
    kicker: '10+ Years’ Experience · React & TypeScript · Design Systems',
    role: 'Senior Frontend Engineer',
    roleByTheme: { atlassian: 'Senior Frontend Software Engineer' },
  },
};

export const summary: SummaryItem[] = [
  {
    id: 'growth',
    label: 'Growth',
    text: 'Growth engineer who most recently led QuickBooks web across APAC for **Intuit**, applying design thinking to [[60+ web experiments|b,g]] across the funnel (merchandising, UX/UI, components, content, [[page speed and technical SEO|e]]) that drove [[$5.5m+ in incremental LTV|b,g]].',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    text: 'Senior [[frontend engineer with 10+ years|b,e]] of enterprise/agency experience, shipping [[performant, decoupled, testable code in React|b,e]] on high-traffic and revenue-critical sites with a focus on reliability. Ships through [[agentic workflows|b,e]] gated by automated tests and code review.',
  },
  {
    id: 'founder',
    label: 'Founder',
    text: 'Currently user-testing **finguide**, a [[full-stack open-banking|e]] personal-finance app. Supporting SMBs through **fuelr**, a web consultancy building self-service marketing stacks for [[25 small businesses|b,g]].',
  },
  {
    id: 'customer',
    label: 'Customer-focused',
    text: 'Shapes UI from [[user evidence|b,g,e]]: uses analytics and session recordings to pinpoint and remove user friction. Synthesises sales and support feedback into tailored full-funnel personalised experiences across paid creative, landing pages, sign-up flows and onboarding, resulting in improvements to customer web KPIs (reduced bounce rates and increased page interactivity and scroll depth).',
  },
];

export const experience: Employer[] = [
  {
    logo: 'assets/logos/intuit.jpeg',
    logoAlt: 'Intuit logo',
    tags: 'Enterprise · SaaS · Finance · B2C · B2B · AI',
    name: 'Intuit – [QuickBooks](https://quickbooks.intuit.com/au/) & [Mailchimp](https://mailchimp.com/)',
    span: '(6 yrs 6 months) Mar 2020 – Aug 2026',
    intro: 'Promoted 3× from Senior Web Development Manager (M1) to Senior Staff Growth Engineer (P6) on the individual-contributor track. Engineering lead for QuickBooks Australia, expanding to Mailchimp and 9+ countries across APAC, owning web development, authoring, experimentation and growth delivery against business and technical KPIs.',
    long: true,
    jobs: [
      {
        title: 'Senior Staff Growth Engineer, APAC',
        dates: 'Jun 2025 – Aug 2026',
        bullets: [
          'Owned [[growth engineering and experimentation strategy|g]] for QuickBooks and Mailchimp across APAC, using the [[10× traffic|b,g]] of the wider scope to [[triple experimentation velocity|b,g]] and roll A/B winners out to [[9+ countries|b,g]], driving [[3k+ incremental subscriptions|b,g]] in FY26.',
          '[[Technical lead|e]] for regional GTM launches, including 3 global AI platform rebrands: led APAC delivery and contributed to the global component strategy and build, balancing rich experiences, developer resource and [[load performance|e]] (Core Web Vitals passed).',
          '[[Mentored engineers|e]] as technical lead and led early adoption of agentic coding, sharing open-source agent skills adapted to the team\'s use cases. Set up shared knowledge spaces in Notion for most AU departments and trained each team to use them.',
        ],
      },
      {
        title: 'Head of Web, Australia',
        dates: 'Aug 2023 – Jun 2025',
        bullets: [
          "Set [[technical direction|e]] for [[paid performance, CRO and measurement|g]] across all digital sales channels; embedded Australia's desktop sign-up flow, deferred scripts, added skeleton loading and rebuilt all its UI and interactions, making it the highest-converting of Intuit's international markets, with [[32% of sign-up starts completing|b,g,e]].",
          'Introduced impact/effort/complexity triage with parallel agency workstreams, freeing engineers for complex builds and [[doubling marketing content authoring velocity|b,g]].',
        ],
      },
      {
        title: 'Senior Web Development & CRO Manager',
        dates: 'Jan 2022 – Aug 2023',
        bullets: [
          'Added [[CRO experimentation|g]] and [[performance|e]] to the remit, transforming the website into a growth sales channel. Full-funnel personalisation experiments delivered a [[28% increase in traffic to sign-up|b,g,e]].',
          'Rebuilt the [[experimentation analytics and component-level event tracking|e]], so experiments were more accurate and reached statistical significance [[20–30% faster|b,g,e]].',
        ],
      },
      {
        title: 'Senior Web Development Manager',
        dates: 'Mar 2020 – Jan 2022',
        bullets: [
          'Led a [[team of 4 engineers|e]] and agency partners, running frontend development and delivery for QuickBooks Australia.',
          'Built a [[shared component library|e]] on [[Atomic Design|b,e]] principles in [[React and Next.js|b,e]], with Storybook docs, tests and [[Chromatic visual regression|e]], and partnered with design to deliver multiple site migrations and full rebrands on it.',
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
    intro: 'Built client websites on WordPress, CQ5 (AEM) and Sitecore, in [[HTML, SCSS and ES5/ES6|e]].',
    jobs: [
      {
        title: 'Web Development Lead',
        dates: 'Dec 2016 – Mar 2020',
        bullets: [
          "Led a team of 4 developers and 3 content authors delivering frontend website builds, component development and content authoring for **McDonald's**, **Hyundai**, **Nivea**, **Charter Hall**, **Lion** and **Young Henrys**.",
        ],
      },
      {
        title: 'Web Developer',
        dates: 'Nov 2015 – Dec 2016',
        bullets: [
          "Built [[responsive, cross-browser|e]] campaign sites for **Kellogg's** across APAC in CQ5, with themeable shared component blocks.",
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
    intro: 'Personal-finance education app for Australians, in closed alpha and gathering user feedback: step-by-step finance admin guides, sorted by effort and impact and personalised with the user’s own banking data via open banking, plus an optional AI browser assistant.',
    jobs: [
      {
        bullets: [
          'Designed and built the frontend in [[React 19, TypeScript and Tailwind|b,e]] on a Radix/shadcn design system in [[[Storybook](https://finguide-storybook.vercel.app/)|b,e]], backed by a [[typed GraphQL API|e]] over a Django service with Celery workers, hosted on [[Railway and Vercel|e]].',
          'Tested at every layer: 800+ [[Jest and Testing Library|b,e]] specs, 300+ Storybook stories run as [[Vitest browser tests|e]] that fail CI on accessibility violations, [[Chromatic visual regression|e]] with MSW-mocked GraphQL, and pytest on the backend.',
          'Built an [[agent-driven delivery pipeline|b,e]] utilising frontier models for planning and lower-cost subagents for execution, gated by automated tests, compliance checks and code review.',
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
    intro: 'Side web consultancy [[building and growing sites|g]] for 25 Australian small businesses, focusing on low-maintenance marketing stacks.',
    jobs: [],
  },
  {
    logo: 'assets/logos/cv-knight.png',
    logoAlt: 'Pixel-art knight avatar',
    tags: 'Open source · Tech · Design systems',
    name: '[github.com/bwise-jake/cv](https://github.com/bwise-jake/cv)',
    span: 'Started Sep 2026',
    intro: 'Built this CV as a [[framework-free TypeScript/Vite|b,e]] app with per-company themes and an emphasis toggle that reorders it by role. [[Vitest tests and CI|e]] check every deploy, keeping all 24 PDFs at 2 pages, in reading order and passing [[WCAG AA contrast|e]].',
    jobs: [],
  },
];

export const skills: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend engineering',
    skills: [
      'Component Architecture, Design Systems, Design Patterns, State & Data Management, API Integration (GraphQL, REST), CMS & Content Authoring',
      'Responsive UI, Cross-Browser Compatibility, Accessibility (WCAG), Internationalisation (i18n), Web Performance (Core Web Vitals)',
      'Unit & Visual Regression Testing, Code Review, Technical Design, CI/CD, Cloud Hosting',
    ],
    titles: { atlassian: ['Foundations', 'User experience', 'Delivery'] },
    logos: ['React', 'Next.js', 'TypeScript', 'HTML5', 'CSS', 'Tailwind CSS', 'Storybook', 'Node.js', 'Git'],
    logosLabel: 'Frontend Engineering platforms',
    extra: {
      atlassian: [
        'Design Tokens, Migrations & Rebrands',
        '',
        '',
      ],
    },
  },
  {
    id: 'growth',
    title: 'Analytics & experimentation',
    skills: [
      'A/B Testing, Experiment Design & Analysis, Experimentation Infrastructure, CRO, UX Design & Wireframing',
      'Analytics Instrumentation, Funnel Analytics',
      'Paid Performance Measurement, SEO, Regional GTM Launches, Impact/Effort Prioritisation',
    ],
    titles: { atlassian: ['Experimentation', 'Measurement', 'Go-to-market'] },
    logos: ['Optimizely', 'Google Analytics', 'Google Tag Manager', 'Looker', 'FullStory', 'Google Ads', 'Semrush', 'Ahrefs', 'Figma', 'Hotjar', 'Amplitude', 'Google Search Console'],
    logosLabel: 'Analytics and Experimentation platforms',
    extra: {
      atlassian: [
        'Holdout Testing, Multi-Armed Bandit Testing, Personalisation',
        'Behavioural Analytics, Session Replay, Event Tracking, Incrementality & LTV Measurement',
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
      'Agentic Development, Multi-Agent Orchestration, MCP Integrations',
      'Automated Quality Gates, AI Compliance Guardrails, Human-in-the-Loop Review',
      'Knowledge Capture & Reuse',
    ],
    titles: { atlassian: ['Planning', 'Agents', 'Guardrails', 'Sharing'] },
    logos: ['Claude', 'OpenAI Codex', 'Cursor', 'Model Context Protocol', 'GitHub', 'Airtable', 'Notion', 'Jira', 'Confluence'],
    logosLabel: 'AI-Native Workflows platforms',
    extra: {
      atlassian: [
        'AI Coding Assistants',
        'Agent-Driven Delivery Pipelines',
        'Automated Compliance Checks, Accessibility Checks',
        'Shared Knowledge Bases, Technical Leadership & Mentoring',
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
    summary: ['engineering', 'customer', 'growth', 'founder'],
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
export function visibleSkillSets(
  group: SkillGroup,
  focus: Focus,
): { text: string; extras: [ThemeId, string][]; titles: [ThemeId, string][] }[] {
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
      titles: Object.entries(group.titles ?? {})
        .map(([theme, list]) => [theme as ThemeId, list?.[i] ?? ''] as [ThemeId, string])
        .filter(([, title]) => title),
    }))
    .filter(({ text }) => text);
}
