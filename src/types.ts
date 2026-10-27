export const FOCUSES = ['engineering', 'growth', 'balanced'] as const;
export type Focus = (typeof FOCUSES)[number];

export const THEME_IDS = ['default', 'atlassian', 'notion', 'canva', 'stripe', 'linear', 'relevance', 'everlab'] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export interface CvState {
  theme: ThemeId;
  focus: Focus;
}
