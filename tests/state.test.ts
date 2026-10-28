import { describe, expect, it } from 'vitest';
import { order, skills, summary, visibleSkillSets } from '../src/content/cv';
import { pdfFileName } from '../src/pdf';
import { visibleNotes } from '../src/notes';
import { DEFAULT_STATE, getRecipient, resolveState, toSearch } from '../src/state';
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
    expect(resolveState('?theme=nope&focus=bad', { theme: 'canva' })).toEqual({ theme: 'canva', focus: 'engineering' });
  });
});

describe('toSearch', () => {
  it('omits defaults and keeps unrelated params', () => {
    expect(toSearch(DEFAULT_STATE, '?utm_source=x&theme=canva')).toBe('?utm_source=x');
    expect(toSearch({ theme: 'linear', focus: 'growth' })).toBe('?theme=linear&focus=growth');
    expect(toSearch({ theme: 'default', focus: 'balanced' })).toBe('?focus=balanced');
  });
});

describe('pdfFileName', () => {
  it('names the file after theme and focus', () => {
    expect(pdfFileName({ theme: 'atlassian', focus: 'growth' })).toBe('Jake-Thornton-Bowen-CV-Atlassian-Growth');
    expect(pdfFileName(DEFAULT_STATE)).toBe('Jake-Thornton-Bowen-CV-Default');
    expect(pdfFileName({ theme: 'relevance', focus: 'balanced' })).toBe(
      'Jake-Thornton-Bowen-CV-Relevance-AI-Balanced',
    );
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

describe('visibleSkillSets', () => {
  const group = (id: string) => skills.find((g) => g.id === id)!;

  it('omits focus-hidden keywords by plain text and keeps the rest', () => {
    const eng = visibleSkillSets(group('growth'), 'engineering');
    expect(eng.map((s) => s.text).join(', ')).not.toContain('SEO');
    expect(eng[2].text).toContain('Paid Performance Measurement, Regional GTM Launches');
    expect(visibleSkillSets(group('growth'), 'growth')[2].text).toContain('SEO');
  });
  it('shows 3, 3 and 4 sets (frontend, growth, ai) under every focus', () => {
    for (const focus of FOCUSES) {
      expect(visibleSkillSets(group('frontend'), focus)).toHaveLength(3);
      expect(visibleSkillSets(group('growth'), focus)).toHaveLength(3);
      expect(visibleSkillSets(group('ai'), focus)).toHaveLength(4);
    }
  });
  it('carries the Atlassian extras only where the content defines them', () => {
    for (const focus of FOCUSES) {
      expect(visibleSkillSets(group('ai'), focus).every((s) => s.extras.length > 0)).toBe(true);
      expect(visibleSkillSets(group('frontend'), focus).map((s) => s.extras.length)).toEqual([1, 0, 0]);
    }
  });
});

describe('getRecipient', () => {
  it('reads and tidies ?for=', () => {
    expect(getRecipient('?for=Atlassian')).toBe('Atlassian');
    expect(getRecipient('?for=%20Relevance%20%20AI%20')).toBe('Relevance AI');
    expect(getRecipient('?for=<script>alert(1)</script>')).toBe('scriptalert1script');
    expect(getRecipient('?theme=canva')).toBeNull();
    expect(getRecipient('?for=')).toBeNull();
  });

  it('caps the length', () => {
    expect(getRecipient(`?for=${'a'.repeat(80)}`)?.length).toBe(40);
  });
});

describe('visibleNotes', () => {
  const notes = { a: 'Measured with a 12-month holdout', b: '{{placeholder}}', c: ' ' };
  it('hides placeholder notes outside dev', () => {
    expect(Object.keys(visibleNotes(notes, false))).toEqual(['a']);
    expect(Object.keys(visibleNotes(notes, true))).toEqual(['a', 'b']);
  });
});
