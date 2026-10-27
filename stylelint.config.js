// Atlassian Design System rules, as atlassian.design recommends them. Only the Atlassian theme
// is checked, for colour, spacing and typography: the other themes and the base styles have their
// own colour systems.
export default {
  plugins: ['@atlaskit/stylelint-design-system'],
  rules: {
    'design-system/ensure-design-token-usage': { color: true, spacing: true, typography: true },
    'design-system/no-deprecated-design-token-usage': true,
    'design-system/no-unsafe-design-token-usage': [true, { shouldEnsureFallbackUsage: true }],
  },
};
