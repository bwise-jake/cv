import babelParser from '@babel/eslint-parser';
import designSystem from '@atlaskit/eslint-plugin-design-system';

// Atlassian Design System rules. They target ADS components and CSS-in-JS (css, cssMap, xcss);
// the CV renders plain DOM, so they mostly guard against hard-coded styles creeping into TS.
// Babel parses the TypeScript: typescript-eslint needs TypeScript's JS API, which TS 7 dropped.
export default [
  { ignores: ['dist/', 'exports/'] },
  {
    ...designSystem.configs['recommended/flat'],
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: ['@babel/preset-typescript'] },
      },
    },
  },
];
