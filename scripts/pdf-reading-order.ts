/**
 * Pure helpers for checking that a CV PDF's text layer reads in CV order. Chrome writes PDF text in
 * paint order, not DOM order, so a stray position/z-index in a theme can scramble what AI screeners
 * and parsers read (name after the roles, job titles detached from bullets) while the PDF still
 * looks perfect. `expectedOrder()` builds the phrases from src/content/cv.ts (including the skills
 * cards, in the focus's card order) and `readingOrderProblems()` checks they appear in sequence in
 * the extracted text.
 */
import { byOrder, experience, order, person, skills, ventures, visibleSkillSets } from '../src/content/cv';
import { plainText } from '../src/content/rich';
import type { Focus, ThemeId } from '../src/types';

const BULLET_PREFIX = 24;
const SET_PREFIX = 24;

function employerNeedles(employers: typeof experience, theme: ThemeId): string[] {
  return employers.flatMap((employer) => [
    plainText(employer.name),
    ...employer.jobs.flatMap((job) => [
      ...(job.title ? [job.title] : []),
      ...(job.bulletsByTheme?.[theme] ?? job.bullets).map((b) => plainText(b).slice(0, BULLET_PREFIX)),
    ]),
  ]);
}

/** A card's title, then the start of each keyword set it shows, for the cards in the focus's order. */
function skillNeedles(focus: Focus, theme: ThemeId): string[] {
  return byOrder(skills, order[focus].skills).flatMap((group) => [
    group.titleByTheme?.[theme] ?? group.title,
    ...visibleSkillSets(group, focus, theme).map(({ text }) => plainText(text).slice(0, SET_PREFIX)),
  ]);
}

/** Ordered phrases a correctly ordered CV PDF must contain, built from src/content/cv.ts. */
export function expectedOrder(focus: Focus = 'engineering', theme: ThemeId = 'default'): string[] {
  return [
    person.name,
    'Summary',
    'Experience',
    ...employerNeedles(experience, theme),
    'Ventures',
    ...employerNeedles(ventures, theme),
    'Skills',
    ...skillNeedles(focus, theme),
  ];
}

const normalise = (s: string) => s.normalize('NFKC').toLowerCase().replace(/\s+/g, '');

/** Returns one message per phrase that is missing or out of order in `text`; [] when the order is right. */
export function readingOrderProblems(text: string, needles: string[]): string[] {
  const hay = normalise(text);
  const problems: string[] = [];
  let cursor = 0;
  for (const original of needles) {
    const n = normalise(original);
    const idx = hay.indexOf(n, cursor);
    if (idx < 0) problems.push(`"${original}" missing or out of order`);
    else cursor = idx + n.length;
  }
  return problems;
}
