import type { ThemeId } from '../types';

export interface Theme {
  id: ThemeId;
  label: string;
  /** CSS background for colour swatches. */
  swatch: string;
  /** Google Fonts css2 query (without the base URL). Null when the fonts are already loaded. */
  fonts: string | null;
  /** Font families that must be ready before printing. */
  families: string[];
  /** Tooltip note on type substitutions. */
  note: string;
}

export const themes: Theme[] = [
  {
    id: 'default',
    label: 'Default',
    swatch: 'linear-gradient(135deg, oklch(46% 0.15 38), oklch(20% 0.015 40))',
    fonts: null,
    families: ['Geist', 'Geist Mono'],
    note: 'Geist · Jake’s own design',
  },
  {
    id: 'atlassian',
    label: 'Atlassian',
    swatch: '#1868db',
    fonts: 'family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500',
    families: ['Inter', 'JetBrains Mono'],
    note: 'Inter + JetBrains Mono, standing in for Charlie & Atlassian Mono',
  },
  {
    id: 'notion',
    label: 'Notion',
    swatch: '#191918',
    fonts: 'family=Inter:wght@400..700',
    families: ['Inter'],
    note: 'Inter, the open base of NotionInter',
  },
  {
    id: 'canva',
    label: 'Canva',
    swatch: 'linear-gradient(98deg, #00c4cc, #5a32fa 70%, #7630d7)',
    fonts: 'family=Plus+Jakarta+Sans:wght@400..800&family=DM+Mono:wght@400;500',
    families: ['Plus Jakarta Sans', 'DM Mono'],
    note: 'Plus Jakarta Sans, standing in for Canva Sans',
  },
  {
    id: 'stripe',
    label: 'Stripe',
    swatch: '#533afd',
    fonts: 'family=Inter+Tight:wght@300..700&family=Source+Code+Pro:wght@400;500',
    families: ['Inter Tight', 'Source Code Pro'],
    note: 'Inter Tight, standing in for Söhne',
  },
  {
    id: 'linear',
    label: 'Linear',
    swatch: '#5e6ad2',
    fonts: 'family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500',
    families: ['Inter', 'JetBrains Mono'],
    note: 'Inter + JetBrains Mono, standing in for Berkeley Mono',
  },
  {
    id: 'relevance',
    label: 'Relevance AI',
    swatch: 'linear-gradient(135deg, #6056ff, #3b32f9)',
    fonts: 'family=Sora:wght@400;600&family=Inter:wght@400..700&family=JetBrains+Mono:wght@400;500',
    families: ['Sora', 'Inter', 'JetBrains Mono'],
    note: 'Sora + Inter, Relevance AI’s own open-source typefaces',
  },
];

export const getTheme = (id: ThemeId): Theme => themes.find((t) => t.id === id) ?? themes[0];

const stylesheets = new Map<string, Promise<void>>();

/** Inject the theme's Google Fonts stylesheet once; resolves when its @font-face rules are parsed. */
function injectFonts(theme: Theme): Promise<void> {
  if (!theme.fonts) return Promise.resolve();
  let loaded = stylesheets.get(theme.fonts);
  if (!loaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${theme.fonts}&display=swap`;
    loaded = new Promise((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve();
    });
    document.head.append(link);
    stylesheets.set(theme.fonts, loaded);
  }
  return loaded;
}

/**
 * Load a theme's fonts and resolve once they're usable (or after `timeout` ms, so a slow
 * network never blocks switching). Regular + semibold covers the weights the CV uses.
 */
export async function ensureThemeFonts(theme: Theme, timeout = 1500): Promise<void> {
  const ready = injectFonts(theme).then(() =>
    Promise.all(
      theme.families.flatMap((family) =>
        ['400', '600'].map((weight) => document.fonts.load(`${weight} 16px "${family}"`).catch(() => [])),
      ),
    ),
  );
  await Promise.race([ready, new Promise((r) => setTimeout(r, timeout))]);
}
