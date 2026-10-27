import { byOrder, experience, headlines, order, person, skills, summary, ventures, type Employer, type Headline } from '../content/cv';
import { adsBadgeIcons, adsSummaryIcons, stackLogos, summaryIcons } from '../content/icons';
import { logoMarks } from '../content/logo-marks';
import { escapeHtml, rich } from '../content/rich';
import type { Focus } from '../types';

/** Notion-theme page icons for the summary items (shown instead of the line icons). */
const SUMMARY_EMOJI: Record<string, string> = { growth: '📈', engineering: '💻', founder: '🚀', customer: '🤝' };

/**
 * Section number, plus a Linear-style issue ID ("JTB-1") that the Linear theme shows instead.
 * Both are real text; themes hide one with display:none so PDFs only carry the visible one.
 */
const sectionHead = (num: string, title: string, cont = false) =>
  `<div class="section-head"><span class="section-num"><span class="num-std">${num}</span><span class="num-issue">JTB-${Number(num)}</span></span><h2>${title}${
    cont ? ' <span class="section-cont">continued</span>' : ''
  }</h2></div>`;

/**
 * Atlassian-theme badges, shown in the brand band across the top of the sheet: what this theme is
 * built and checked with (see src/styles/atlassian.css). They come after the identity row in the
 * source, so the PDF text reads the name first; the theme's grid puts them in the band above it.
 * Every other theme hides them with display:none, so their PDFs don't carry the text.
 */
const ADS_BADGES = [
  {
    icon: 'tokens',
    label: 'Tokens',
    href: 'https://atlassian.design/foundations/tokens/design-tokens',
    title: 'Every colour and space in this theme is an Atlassian Design System token',
  },
  {
    icon: 'stylelint',
    label: 'Stylelint',
    href: 'https://atlassian.design/components/stylelint-design-system/usage',
    title: 'Checked by @atlaskit/stylelint-design-system',
  },
  {
    icon: 'eslint',
    label: 'ESLint',
    href: 'https://atlassian.design/components/eslint-plugin-design-system/usage',
    title: 'The repo\'s TypeScript is linted with @atlaskit/eslint-plugin-design-system (recommended config)',
  },
] as const;

const adsBadges = () =>
  `<p class="ads-badges"><span class="ads-badges-label">Built with Atlassian Design System</span>${ADS_BADGES.map(
    (b) =>
      `<a class="ads-badge" href="${b.href}" title="${b.title}" target="_blank" rel="noopener noreferrer">${adsBadgeIcons[b.icon]}${b.label}</a>`,
  ).join(' ')}</p>`;

/**
 * The role title, plus any company's advertised title for it. Themes show the one that applies
 * (atlassian.css) and hide the rest with display:none, so PDFs only carry the visible one.
 */
const roleTitle = ({ role, roleByTheme = {} }: Headline) =>
  `<span class="role-std">${escapeHtml(role)}</span>${Object.entries(roleByTheme)
    .map(([theme, title]) => `<span class="role-alt" data-theme-role="${theme}">${escapeHtml(title)}</span>`)
    .join('')}`;

/** Plain text of a rich-text fragment, for matching it against `omit` lists. */
const plain = (src: string) => src.replace(/\[\[(.+?)\|[a-z,\s]+\]\]/g, '$1').replace(/\*\*/g, '');


function header(focus: Focus, recipient: string | null) {
  const headline = headlines[focus];
  return `
  <header class="identity">
    <div class="identity-row">
      <div class="identity-main">
        <span class="avatar-frame">
          <img class="avatar" src="${person.photo}" alt="${escapeHtml(person.name)}" width="80" height="80">
        </span>
        <div>
          <p class="kicker">${escapeHtml(headline.kicker)}</p>
          <h1>${escapeHtml(person.name)}</h1>
          <p class="role-title">${roleTitle(headline)}</p>
        </div>
      </div>
      <div class="contact">
        ${recipient ? `<span class="prepared-for">Prepared for ${escapeHtml(recipient)}</span>` : ''}
        <span>${escapeHtml(person.location)}</span>
        <a href="mailto:${person.email}">${person.email}</a>
        <a href="https://${person.linkedin}">${person.linkedin}</a>
      </div>
    </div>
    ${adsBadges()}
  </header>`;
}

function summarySection(focus: Focus) {
  const items = byOrder(summary, order[focus].summary)
    .map(
      (item) => `
      <li data-flip="summary-${item.id}">
        <span class="summary-icon" aria-hidden="true">${summaryIcons[item.id]}</span>
        <span class="summary-emoji" aria-hidden="true">${SUMMARY_EMOJI[item.id]}</span>
        <span class="summary-ads-icon" aria-hidden="true">${adsSummaryIcons[item.id]}</span>
        <span><b class="summary-label">${escapeHtml(item.label)}</b> • ${rich(item.text)}</span>
      </li>`,
    )
    .join('');
  return `
  <section>
    ${sectionHead('01', 'Summary')}
    <ul class="summary-list">${items}</ul>
  </section>`;
}

function employerBlock(e: Employer) {
  const jobs = e.jobs
    .map(
      (job) => `
      <div class="job">
        ${
          job.title
            ? `<div class="job-head">
          <span class="job-title">${escapeHtml(job.title)}</span>
          <span class="job-meta">${escapeHtml(job.dates ?? '')}</span>
        </div>`
            : ''
        }
        <ul class="bullets">${job.bullets.map((b) => `<li>${rich(b)}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');
  return `
    <div class="employer-block${e.long ? ' employer-long' : ''}">
      <div class="employer-head">
        ${
          e.logoMark
            ? `<span class="employer-logo employer-logo-mark" role="img" aria-label="${escapeHtml(e.logoAlt)}">${logoMarks[e.logoMark]}</span>`
            : `<img class="employer-logo" src="${e.logo}" alt="${escapeHtml(e.logoAlt)}" width="36" height="36">`
        }
        <div class="employer-copy">
          <div class="employer-name">${rich(e.name)}</div>
          ${
            e.tags
              ? `<div class="employer-tags">${e.tags
                  .split(' · ')
                  .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
                  .join(' ')}</div>`
              : ''
          }
          <div class="employer-span">${escapeHtml(e.span)}</div>
        </div>
      </div>
      ${e.intro ? `<p class="employer-intro">${rich(e.intro)}</p>` : ''}
      ${jobs}
    </div>`;
}

function skillsSection(focus: Focus) {
  const groups = byOrder(skills, order[focus].skills)
    .map((g) => {
      const omitted = new Set(g.omit?.[focus]);
      const list = g.skills.split(', ').filter((s) => !omitted.has(plain(s))).join(', ');
      const logos = g.logos.filter((name) => !omitted.has(name));
      return `
      <div class="skill-group" data-flip="skills-${g.id}">
        <h3>${escapeHtml(g.title)}</h3>
        <div class="skill-list">${rich(list)}</div>
        <div class="logo-wrapper" role="group" aria-label="${escapeHtml(g.logosLabel)}">
          ${logos.map((name) => `<div class="stack-logo" role="img" tabindex="0" aria-label="${escapeHtml(name)}" data-tooltip="${escapeHtml(name)}">${stackLogos[name]}</div>`).join('')}
        </div>
      </div>`;
    })
    .join('');
  return `
  <section>
    ${sectionHead('04', 'Skills &amp; stacks')}
    <div class="grid-three">${groups}</div>
  </section>`;
}

/** The whole CV (both A4 pages) as an HTML string. Pure: also used to pre-render index.html at build. */
export function cvMarkup(focus: Focus, recipient: string | null = null): string {
  const [intuit, ...earlier] = experience;
  return `
<div class="page">
  ${header(focus, recipient)}
  ${summarySection(focus)}
  <section>
    ${sectionHead('02', 'Experience')}
    ${employerBlock(intuit)}
  </section>
</div>

<div class="page">
  <section>
    ${sectionHead('02', 'Experience', true)}
    ${earlier.map(employerBlock).join('')}
  </section>
  <section>
    ${sectionHead('03', 'Ventures')}
    ${ventures.map(employerBlock).join('')}
  </section>
  ${skillsSection(focus)}
</div>`;
}

export function renderCv(root: HTMLElement, focus: Focus, recipient: string | null = null) {
  root.innerHTML = cvMarkup(focus, recipient);
}
