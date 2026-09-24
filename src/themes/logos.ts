import atlassian from '../assets/brands/atlassian.svg';
import canva from '../assets/brands/canva.png';
import defaultMark from '../assets/brands/default.svg';
import linear from '../assets/brands/linear.png';
import notion from '../assets/brands/notion.png';
import relevance from '../assets/brands/relevance.png';
import stripe from '../assets/brands/stripe.png';
import type { ThemeId } from '../types';

/**
 * Company app icons for the theme picker, taken from each company's own site (Default is Jake's
 * monogram). Kept apart from registry.ts so Node scripts can import the registry without assets.
 */
export const themeLogos: Record<ThemeId, string> = {
  default: defaultMark,
  atlassian,
  notion,
  canva,
  stripe,
  linear,
  relevance,
};
