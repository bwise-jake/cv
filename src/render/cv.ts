import { byOrder, experience, headlines, order, person, skills, summary, ventures, type Employer } from '../content/cv';
import { stackLogos, summaryIcons } from '../content/icons';
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

const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function header(focus: Focus, recipient: string | null) {
  const { kicker, role } = headlines[focus];
  return `
  <header class="identity">
    <div class="identity-row">
      <div class="identity-main">
        <span class="avatar-frame">
          <img class="avatar" src="${person.photo}" alt="${escapeHtml(person.name)}">
        </span>
        <div>
          <p class="kicker">${escapeHtml(kicker)}</p>
          <h1>${escapeHtml(person.name)}</h1>
          <p class="role-title">${escapeHtml(role)}</p>
        </div>
      </div>
      <div class="contact">
        ${recipient ? `<span class="prepared-for">Prepared for ${escapeHtml(recipient)}</span>` : ''}
        <span>${escapeHtml(person.location)}</span>
        <a href="mailto:${person.email}">${person.email}</a>
        <a href="https://${person.linkedin}">${person.linkedin}</a>
        <a href="${person.website}" data-live-link>${displayUrl(person.website)}</a>
      </div>
    </div>
  </header>`;
}

function summarySection(focus: Focus) {
  const items = byOrder(summary, order[focus].summary)
    .map(
      (item) => `
      <li data-flip="summary-${item.id}">
        <span class="summary-icon" aria-hidden="true">${summaryIcons[item.id]}</span>
        <span class="summary-emoji" aria-hidden="true">${SUMMARY_EMOJI[item.id]}</span>
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
        <img class="employer-logo" src="${e.logo}" alt="${escapeHtml(e.logoAlt)}">
        <div class="employer-copy">
          <div class="employer-tags">${e.tags
            .split(' · ')
            .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
            .join(' ')}</div>
          <div class="employer-name">${rich(e.name)}</div>
        </div>
      </div>
      <div class="employer-span">${escapeHtml(e.span)}</div>
      ${e.intro ? `<p class="employer-intro">${rich(e.intro)}</p>` : ''}
      ${jobs}
    </div>`;
}

function skillsSection(focus: Focus) {
  const groups = byOrder(skills, order[focus].skills)
    .map(
      (g) => `
      <div class="skill-group" data-flip="skills-${g.id}">
        <h3>${escapeHtml(g.title)}</h3>
        <div class="skill-list">${rich(g.skills)}</div>
        <div class="logo-wrapper" aria-label="${escapeHtml(g.logosLabel)}">
          ${g.logos.map((name) => `<div class="stack-logo" role="img" tabindex="0" aria-label="${escapeHtml(name)}" data-tooltip="${escapeHtml(name)}">${stackLogos[name]}</div>`).join('')}
        </div>
      </div>`,
    )
    .join('');
  return `
  <section>
    ${sectionHead('04', 'Skills &amp; Stacks')}
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
