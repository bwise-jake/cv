/** Writes src/styles/ads-tokens.css: the ADS tokens src/styles/atlassian.css uses (npm run ads:tokens). */
import { readFileSync, writeFileSync } from 'node:fs';
import { adsTokensCss } from './ads-tokens';

const source = new URL('../src/styles/atlassian.css', import.meta.url);
const target = new URL('../src/styles/ads-tokens.css', import.meta.url);

const css = adsTokensCss(readFileSync(source, 'utf8'));
writeFileSync(target, css);
console.log(`Wrote ${css.split('\n').filter((line) => line.includes('--ds-') && line.endsWith(';')).length} tokens`);
