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
| `--ink-faint` | `oklch(52% 0.012 40)` | metadata, dates |
| `--line` | `oklch(88% 0.012 40)` | hairline rules |
| `--accent` | `oklch(46% 0.15 38)` | kicker, section numbers, links, skill labels, brand mark |

Contrast verified: ink-on-paper 17.2:1, ink-soft-on-paper 9.1:1,
accent-on-paper 7.3:1. All clear WCAG AAA for normal text.
Every theme's small text is checked for WCAG AA (4.5:1) in a real browser by `npm run check:contrast`.

## Typography

- **Geist** (sans) — headings, body, names. Chosen over Inter/Space
  Grotesk/IBM Plex (reflex defaults) because it's the actual typeface of the
  named reference (Vercel) and reads precise without being a training-data
  default.
- **Geist Mono** — dates, locations, contact details, section numbers,
  skill-group labels, industry tags. Used for anything that's metadata, not
  prose — the mono/sans split IS the hierarchy signal, not color or boxes.
- Scale: name 28px/700, section h2 15px/600, employer name 15.5px/700, job
  title 14px/600, body 13.5px/13px, metadata 10-11.5px. Hierarchy carried by
  weight + family switch (sans/mono), not by large size jumps — a dense
  resume needs many small steps, not a marketing-page modular scale.

## Layout

- Single column throughout (ATS parsers choke on multi-column text order).
- Numbered section markers (`01 Summary`, `02 Experience`...) in mono +
  accent, replacing the generic tiny-uppercase-tracked-label pattern with a
  deliberate system.
- Two text columns only: everything starts on the page's left edge, except section titles and
  summary text, which share one column 26px in (section numbers are fixed 16px wide, the same as
  the summary icons). Employer logo + tags + name form one media unit; the date line, intro,
  roles and bullets below it return to the left edge. Bullets hang their dash. No side-stripe
  borders anywhere (banned pattern).
- Every page uses the same fit scale (the smallest any page needs), so type size and margins are
  identical from page to page.
- Graphic elements are few and deliberate: the accent bar before the role title, small line
  icons on the summary items, employer logos, and monochrome tech-stack logos. No stock imagery.

## Components

- **Default theme: no pill/chip badges.** Skills and industry tags are plain comma- or
  interpunct-separated text in mono. Pill tags read as "generic resume template." Brand themes
  are the deliberate exception: they render tags as that company's own component (see
  "Brand components per theme" below).
- **Placeholder callouts** (`.fill`): accent-colored italic text with a
  dashed underline, not a yellow highlighter block — reads as a considered
  annotation rather than a Word tracked-change leftover.
- **Company logos**: 36px squares (corner radius from the `--radius-logo` token) with a hairline
  border, beside the employer tags and name — treated as real brand marks, not decorative badges.

## Print

`@media print` (`src/styles/print.css`): `@page { size: A4; margin: 0 }`; each `.page` is exactly
one sheet, scaled by the fit factor from `src/fit.ts` so content never spills to a third page.
Backgrounds print (`print-color-adjust: exact`) so the PDF matches the screen in every theme.
The controls, metric-note tooltips and the header's noise texture are hidden in print (the noise
uses a blend mode that makes Apple's PDF renderer flatten gradients).

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
*Export* is an ink Download PDF button. Keycaps for S / E / P sit in one column at the end of each label. Colours come from the active theme's
tokens so it belongs on light and dark pages; type stays Geist so it doesn't shift while switching.
Under 1200px an ink "Version" button opens the same content on a paper sheet.

## Focus modes

Emphasis is data, not markup: `[[phrase|b,g,e]]` in `src/content/cv.ts` renders a `b.kw` that is
only bold when `html[data-focus]` matches. Switching focus re-renders, FLIP-animates the reordered
Summary/Skills items, and briefly washes newly emphasised phrases in the accent tint.

## Brand components per theme

Beyond tokens, some themes render elements as the company's own design-system components (all
real text, so PDFs and ATS parsing are unaffected):

| Theme | Industry tags | Section numbers | Other |
|---|---|---|---|
| Atlassian | Lozenges (neutral; first "in progress" blue) | Lozenge | |
| Notion | Select-property pills, Notion's pastel palette | Hidden (Notion headings are unnumbered) | Page-style header: cover band, face as page icon, 32px title; emoji summary icons |
| Linear | Outlined issue labels with coloured dots | Issue IDs (`JTB-1`) | |
| Canva | Rounded purple chips | Default | |
| Default, Stripe, Relevance AI | Interpunct-separated mono text | Default | |
