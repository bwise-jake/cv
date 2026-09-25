import { defineConfig } from 'vitest/config';
import { cvMarkup } from './src/render/cv';

export default defineConfig({
  // Relative asset paths so the build works under a GitHub Pages sub-path.
  base: './',
  plugins: [
    {
      // Ship the Default/Balanced CV inside index.html so it is readable without JavaScript
      // (crawlers, link previews, no-JS readers). src/main.ts re-renders it on boot as before.
      name: 'prerender-cv',
      // Build only: the dev server injects CSS from JS after first paint, so pre-rendered markup
      // would flash unstyled there (a full-size photo, then plain text).
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace('<main id="cv"></main>', `<main id="cv">${cvMarkup('balanced')}</main>`);
      },
    },
  ],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
