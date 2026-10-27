import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { adsTokensCss, isFallbackOnly, sameValue, tokenData, usedTokens } from '../scripts/ads-tokens';

const read = (name: string) => readFileSync(new URL(`../src/styles/${name}`, import.meta.url), 'utf8');
const atlassian = read('atlassian.css');
const generated = adsTokensCss(atlassian);

describe('ads-tokens.css', () => {
  it('is in sync with atlassian.css (run `npm run ads:tokens` if this fails)', () => {
    expect(read('ads-tokens.css'), 'src/styles/ads-tokens.css is stale: run `npm run ads:tokens`').toBe(generated);
  });

  it('has atlassian.css fallbacks that are the real ADS light-theme values', () => {
    const { defaults, names } = tokenData();
    const keyByProperty = new Map(Object.entries(names).map(([key, property]) => [property, key]));
    const mismatches: string[] = [];
    for (const [property, fallback] of usedTokens(atlassian)) {
      const key = keyByProperty.get(property);
      if (key === undefined || isFallbackOnly(key)) continue;
      const real = defaults[key];
      if (real === undefined || !sameValue(fallback, real)) mismatches.push(`${property}: ${fallback} ≠ ${real}`);
    }
    expect(mismatches).toEqual([]);
  });

  it('leaves the font tokens to their fallbacks, except weights', () => {
    const fontTokens = generated.match(/--ds-font-[a-z-]+/g) ?? [];
    expect(fontTokens.filter((name) => !name.startsWith('--ds-font-weight-'))).toEqual([]);
  });

  it('is one rule scoped to the Atlassian theme', () => {
    const selectors = [...generated.matchAll(/([^{}]+)\{/g)].map((match) => match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim());
    expect(selectors).toEqual([':root[data-theme="atlassian"]']);
  });

  it('rejects a token that is not in ADS', () => {
    expect(() => adsTokensCss('a { color: var(--ds-not-a-token, red); }')).toThrow('Unknown ADS token --ds-not-a-token');
  });
});
