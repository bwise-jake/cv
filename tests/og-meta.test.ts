import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

/** Every <meta> tag whose `key` attribute (property or name) equals `id`, as its content strings. */
function contents(attr: 'property' | 'name', id: string): string[] {
  const out: string[] = [];
  for (const tag of html.match(/<meta\s[^>]*>/g) ?? []) {
    if (tag.match(new RegExp(`\\s${attr}="([^"]*)"`))?.[1] === id) {
      out.push(tag.match(/\scontent="([^"]*)"/)?.[1] ?? '');
    }
  }
  return out;
}
const one = (attr: 'property' | 'name', id: string) => contents(attr, id)[0];

/** Width and height from the first SOF0/SOF2 marker of a JPEG (height then width, big-endian, at +5 and +7). */
function jpegSize(buf: Buffer): { width: number; height: number } {
  for (let i = 0; i < buf.length - 9; i++) {
    if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
  }
  throw new Error('No SOF marker found');
}

describe('link-preview tags in index.html', () => {
  const required: ['property' | 'name', string][] = [
    ['property', 'og:type'],
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:url'],
    ['property', 'og:image'],
    ['property', 'og:image:width'],
    ['property', 'og:image:height'],
    ['property', 'og:image:alt'],
    ['name', 'twitter:card'],
    ['name', 'twitter:image'],
    ['name', 'description'],
  ];

  it.each(required)('has exactly one non-empty %s "%s" tag', (attr, id) => {
    const found = contents(attr, id);
    expect(found).toHaveLength(1);
    expect(found[0].trim()).not.toBe('');
  });

  it('points og:image and twitter:image at the same absolute file that exists in public/', () => {
    const image = one('property', 'og:image');
    expect(image).toBe(one('name', 'twitter:image'));
    expect(image.startsWith('https://bwise-jake.github.io/cv/')).toBe(true);
    expect(existsSync(new URL(`../public/${image.split('/').pop()}`, import.meta.url))).toBe(true);
  });

  it('uses the canonical link as og:url', () => {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    expect(one('property', 'og:url')).toBe(canonical);
  });

  it('asks for the large summary card on X', () => {
    expect(one('name', 'twitter:card')).toBe('summary_large_image');
  });

  it('declares the real pixel size of the image', () => {
    const file = one('property', 'og:image').split('/').pop()!;
    const size = jpegSize(readFileSync(new URL(`../public/${file}`, import.meta.url)));
    expect(String(size.width)).toBe(one('property', 'og:image:width'));
    expect(String(size.height)).toBe(one('property', 'og:image:height'));
  });
});
