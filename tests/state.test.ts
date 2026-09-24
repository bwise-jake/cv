import { describe, expect, it } from 'vitest';
import { order, skills, summary } from '../src/content/cv';
import { pdfFileName } from '../src/pdf';
import { DEFAULT_STATE, resolveState, toSearch } from '../src/state';
import { FOCUSES } from '../src/types';

describe('resolveState', () => {
  it('defaults when nothing is set', () => {
    expect(resolveState('', null)).toEqual(DEFAULT_STATE);
  });

  it('prefers the URL over saved state', () => {
    expect(resolveState('?theme=Notion&focus=engineering', { theme: 'canva', focus: 'growth' })).toEqual({
      theme: 'notion',
      focus: 'engineering',
    });
  });

  it('falls back to saved state, then default, for invalid values', () => {
    expect(resolveState('?theme=nope&focus=bad', { theme: 'canva' })).toEqual({ theme: 'canva', focus: 'balanced' });
  });
});

describe('toSearch', () => {
  it('omits defaults and keeps unrelated params', () => {
    expect(toSearch(DEFAULT_STATE, '?utm_source=x&theme=canva')).toBe('?utm_source=x');
    expect(toSearch({ theme: 'linear', focus: 'growth' })).toBe('?theme=linear&focus=growth');
  });
});

describe('pdfFileName', () => {
  it('names the file after theme and focus', () => {
    expect(pdfFileName({ theme: 'atlassian', focus: 'growth' })).toBe('Jake-Thornton-Bowen-CV-Atlassian-Growth');
    expect(pdfFileName(DEFAULT_STATE)).toBe('Jake-Thornton-Bowen-CV-Default');
  });
});

describe('content order', () => {
  it('lists every summary item and skill group exactly once per focus', () => {
    for (const focus of FOCUSES) {
      expect([...order[focus].summary].sort()).toEqual(summary.map((s) => s.id).sort());
      expect([...order[focus].skills].sort()).toEqual(skills.map((s) => s.id).sort());
    }
  });
});
