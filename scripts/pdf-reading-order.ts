/**
 * Pure helpers for checking that a CV PDF's text layer reads in CV order. Chrome writes PDF text in
 * paint order, not DOM order, so a stray position/z-index in a theme can scramble what AI screeners
 * and parsers read (name after the roles, job titles detached from bullets) while the PDF still
 * looks perfect. `expectedOrder()` builds the phrases from src/content/cv.ts and
 * `readingOrderProblems()` checks they appear in sequence in the extracted text.
 */
import { experience, person, ventures } from '../src/content/cv';

/** Plain text of a CV content string: strips **bold**, [[text|keys]], {{fill}} and [text](url) markup. */
export function plainText(src: string): string {
  return src
    .replace(/\[\[(.+?)\|([a-z,\s]+)\]\]/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\{\{(.+?)\}\}/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1');
}

const BULLET_PREFIX = 24;

function employerNeedles(employers: typeof experience): string[] {
  return employers.flatMap((employer) => [
    plainText(employer.name),
    ...employer.jobs.flatMap((job) => [
      ...(job.title ? [job.title] : []),
      ...job.bullets.map((b) => plainText(b).slice(0, BULLET_PREFIX)),
    ]),
  ]);
}

/** Ordered phrases a correctly ordered CV PDF must contain, built from src/content/cv.ts. */
export function expectedOrder(): string[] {
  return [
    person.name,
    'Summary',
    'Experience',
    ...employerNeedles(experience),
    'Ventures',
    ...employerNeedles(ventures),
    'Skills',
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
