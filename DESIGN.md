# Design

## Reference

Sleek tech-portfolio: closer to Linear / Stripe / Vercel marketing pages than a
traditional HR resume template. Warm, editorial, quietly technical — not a
generic resume-builder look.

## Color

Strategy: restrained-plus-one-committed-accent. Warm-tinted neutrals (hue 40)
carry the page; a single confident terracotta accent (hue 38) is used
deliberately, not everywhere. OKLCH throughout, no pure `#000`/`#fff`.

| Token | Value | Use |
|---|---|---|
| `--paper` | `oklch(98.2% 0.006 40)` | page background |
| `--canvas` | `oklch(94% 0.006 40)` | body background behind the page |
| `--ink` | `oklch(20% 0.015 40)` | headings, primary text |
| `--ink-soft` | `oklch(39% 0.014 40)` | body copy |
| `--ink-faint` | `oklch(58% 0.012 40)` | metadata, dates |
| `--line` | `oklch(88% 0.012 40)` | hairline rules |
| `--accent` | `oklch(46% 0.15 38)` | kicker, section numbers, links, skill labels, brand mark |

Contrast verified: ink-on-paper 17.2:1, ink-soft-on-paper 9.1:1,
accent-on-paper 7.3:1. All clear WCAG AAA for normal text.

## Typography

- **Geist** (sans) — headings, body, names. Chosen over Inter/Space
  Grotesk/IBM Plex (reflex defaults) because it's the actual typeface of the
  named reference (Vercel) and reads precise without being a training-data
  default.
- **Geist Mono** — dates, locations, contact details, section numbers,
  skill-group labels, industry tags. Used for anything that's metadata, not
  prose — the mono/sans split IS the hierarchy signal, not color or boxes.
- Scale: name 30px/700, section h2 15px/600, employer name 15.5px/700, job
  title 14px/600, body 13.5px/13px, metadata 10-11.5px. Hierarchy carried by
  weight + family switch (sans/mono), not by large size jumps — a dense
  resume needs many small steps, not a marketing-page modular scale.

## Layout

- Single column throughout (ATS parsers choke on multi-column text order).
- Numbered section markers (`01 Summary`, `02 Experience`...) in mono +
  accent, replacing the generic tiny-uppercase-tracked-label pattern with a
  deliberate system.
- Hanging-indent for role entries under an employer: `.job` padding-left
  (38px) matches logo-width + gap so sub-roles align under the employer name
  with no drawn rule. No side-stripe borders anywhere (banned pattern).
- One small accent-colored mark (34x4px bar) as the page's only graphic
  flourish. No icons, no stock imagery — a CV is a text-evidence document,
  not an imagery-led brand surface.

## Components

- **No pill/chip badges anywhere.** Skills and industry tags are plain
  comma- or interpunct-separated text in mono/ink-soft. This was the biggest
  anti-reference: pill tags read as "generic resume template."
- **Placeholder callouts** (`.fill`): accent-colored italic text with a
  dashed underline, not a yellow highlighter block — reads as a considered
  annotation rather than a Word tracked-change leftover.
- **Company logos**: small (26px) squares with a hairline border, sitting
  inline with the employer name at normal weight — treated as real brand
  marks, not decorative icon badges.

## Print

`@media print`: page fills the print area (0.3in/0.5in padding, A4 via
`@page`), background goes pure white, layout collapses to a single column
under 640px. Google Fonts load before print since the page is fully
rendered in-browser first.

## Company themes (interactive version)

The default design above is one of seven themes. The others re-skin the same layout by overriding
tokens only (`src/styles/themes.css`); no theme changes the structure, so ATS text order and
the two-page layout hold everywhere.

| Theme | Type (open stand-in) | Accent | Header |
|---|---|---|---|
| Atlassian | Inter + JetBrains Mono (for Charlie / Atlassian Mono) | #1868DB | solid brand blue |
| Notion | Inter (NotionInter) | #0075DE | light, page-title style |
| Canva | Plus Jakarta Sans (Canva Sans) + DM Mono | #8B3DFF | teal → violet gradient |
| Stripe | Inter Tight (Söhne) + Source Code Pro | #533AFD | navy → blurple sweep |
| Linear | Inter + JetBrains Mono (Berkeley Mono) | #7170FF | dark page, violet haze |
| Relevance AI | Sora + Inter (both open) | #6056FF, teal #0E9384 tags | light lavender → pink wash |

The controls (`src/render/controls.ts`) are typeset as a CV section headed **Version** in the
margin beside the centred page, sticky so only the pages scroll. No card, blur or pills: a section
head styled like "01 Summary", then ruled lines of lead word + value. *Style* is a listbox showing each
company's app icon (`src/themes/logos.ts`) with names set in the theme's own typeface; *Emphasis* is
three words (Balanced / Growth / Engineering) with the chosen one underlined in the accent; then an
ink Download PDF button with the filename in mono beneath. Colours come from the active theme's
tokens so it belongs on light and dark pages; type stays Geist so it doesn't shift while switching.
Under 1200px an ink "Version" button opens the same content on a paper sheet.

## Focus modes

Emphasis is data, not markup: `[[phrase|b,g,e]]` in `src/content/cv.ts` renders a `b.kw` that is
only bold when `html[data-focus]` matches. Switching focus re-renders, FLIP-animates the reordered
Summary/Skills items, and briefly washes newly emphasised phrases in the accent tint.
