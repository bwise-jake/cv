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
  title 14px/600, summary 14px, body 12px, metadata 10-11.5px. Hierarchy carried by
  weight + family switch (sans/mono), not by large size jumps — a dense
  resume needs many small steps, not a marketing-page modular scale.

## Layout

- Single column throughout (ATS parsers choke on multi-column text order), except Skills & stacks: three cards
  side by side, each one block in source order, so PDF text still reads card by card (`npm run pdf` checks it).
- Numbered section markers (`01 Summary`, `02 Experience`...) in mono +
  accent, replacing the generic tiny-uppercase-tracked-label pattern with a
  deliberate system.
- Sections are divided by a hairline (`--line`) above each one on the same sheet; the headings themselves are
  unruled. Employers within a section are divided by a lighter hairline (`--line` mixed 55% into the paper),
  so the sections still read as the main breaks.
- The first employer under a heading has its date line on the heading's line (the block is pulled up 16px),
  which saves a line per section. Phones, where the dates move under the name, keep it on its own line.
- Two text columns only: everything starts on the page's left edge, except section titles and
  summary text, which share one column 26px in (section numbers are fixed 16px wide, the same as
  the summary icons). Each employer header is one line of logo, name and tags (tags right-aligned),
  with the date line right-aligned above the tags; the intro, roles and bullets below it return to
  the left edge. Bullets hang their dash. No side-stripe
  borders anywhere (banned pattern).
- Every page uses the same fit scale (the smallest any page needs), so type size and margins are
  identical from page to page.
- Graphic elements are few and deliberate: the accent bar before the role title, small line
  icons on the summary items, employer logos, and monochrome tech-stack logos. No stock imagery.

## Components

- **Default theme: no pill badges for industry tags.** They are plain interpunct-separated text in mono. Pill
  tags read as "generic resume template." Brand themes are the deliberate exception: they render tags as that
  company's own component (see "Brand components per theme" below).
- **Skills & stacks cards** (every theme): three cards with a light wash of the accent (`--skill-card`), each
  titled by a mono label chip (`--skill-chip`), the stack logos under the title, then the keywords in
  hairline-divided sets, each opened by a semibold run-in subtitle ("Delivery: …"). Themes recolour them by group.
- **Summary** is set at 14px on a 20px line, a step above the 12px body copy.
- **Contact details** are underlined links (underline in `--line-on-ink`, dropped on hover), and the contact
  block is centred on the photo and name beside it.
- **Placeholder callouts** (`.fill`): orange (#C2410C) italic text, the same in
  every theme so placeholders stand out from real copy, with a
  dashed underline, not a yellow highlighter block — reads as a considered
  annotation rather than a Word tracked-change leftover.
- **Company logos**: 36px squares (corner radius from the `--radius-logo` token) with a hairline
  border, on the same line as the employer name and tags — treated as real brand marks, not decorative badges.
  The finguide mark is the exception: the site's dark-mode logo redrawn as inline SVG
  (`src/content/logo-marks.ts`) and animated by `src/finguide-mark.ts`, a port of finguide-marketing's
  `AnimatedPigMark` (glances, blinks, ear flicks, an occasional hop; on a fine pointer the eyes follow the
  cursor and a click hops). It moves only while on screen and the tab is visible, and stands still under
  `prefers-reduced-motion` and in print.

## Print

`@media print` (`src/styles/print.css`): `@page { size: A4; margin: 0 }`; each `.page` is exactly
one sheet, scaled by the fit factor from `src/fit.ts` so content never spills to a third page.
Backgrounds print (`print-color-adjust: exact`) so the PDF matches the screen in every theme.
The controls, metric-note tooltips and the header's noise texture are hidden in print (the noise
uses a blend mode that makes Apple's PDF renderer flatten gradients).

## Company themes (interactive version)

The default design above is one of twelve themes. The others re-skin the same layout by overriding
tokens only (`src/styles/themes.css`); no theme changes the structure, so ATS text order and
the two-page layout hold everywhere.

| Theme | Type (open stand-in) | Accent | Header |
|---|---|---|---|
| Atlassian | Inter (for Atlassian Sans) | #1868DB | Confluence page: blue cover band, white title block |
| Notion | Inter (NotionInter) | #0075DE | light, page-title style |
| Canva | Plus Jakarta Sans (Canva Sans) + DM Mono | #8B3DFF | teal → violet gradient |
| Stripe | Inter Tight (Söhne) + Source Code Pro | #533AFD | navy → blurple sweep |
| Linear | Inter + JetBrains Mono (Berkeley Mono) | #7170FF | dark page, violet haze |
| Relevance AI | Sora + Inter (both open) | #6056FF, teal #0E9384 tags | light lavender → pink wash |
| Everlab | Newsreader + Schibsted Grotesk + DM Mono (for Tobias, Saans, Saans Mono) | black and grey; #FF6A1A squares only | near-black, serif name, muted-white mono kicker |
| Remitly | Figtree (for Greycliff CF), no mono | main indigo #16273C; teal #397882, light teal #BFE6EC, green #42C888, ube #743D95 | flat main indigo #16273C, Agave #96D0D8 kicker and role dash |
| Anduril | Inter Tight (for Helvetica Now Display), no mono | near-black #010101 and olive #505544; lime #DFF140 on black only | flat near-black #010101, lime kicker and role dash |
| Mitti | Funnel Display + Geist (both open), no mono | indigo #4A42C8 on warm near-black #1C1714; yellow #FFC800, cyan #5ECEFA | flat near-black #1C1714 with the logo's indigo → cyan → yellow swoosh along its foot, yellow kicker and role dash |
| finguide | Hanken Grotesk (finguide's own, open) | lime #C0F43E on Ink | dark page (#1C1C1C card on #080808), Ink header band, lime role dash and labels |

The controls (`src/render/controls.ts`) are typeset as a CV section headed **Version** in the
margin beside the centred page, sticky so only the pages scroll. No card, blur or pills: a section
head styled like "01 Summary", then ruled lines of lead word + value. *Style* is a listbox showing each
company's app icon (`src/themes/logos.ts`) with names set in the theme's own typeface; *Emphasis* is
three words (Engineering / Growth / Balanced, Engineering by default) with the chosen one underlined in the accent; then an
*Export* is an ink Download PDF button. Keycaps for S / E / P sit in one column at the end of each label. Colours come from the active theme's
tokens so it belongs on light and dark pages; type stays Geist so it doesn't shift while switching.
Under 1200px an ink "Version" button opens the same content on a paper sheet.

## Focus modes

Emphasis is data, not markup: `[[phrase|b,g,e]]` in `src/content/cv.ts` renders a `b.kw` that is
only bold when `html[data-focus]` matches. Switching focus re-renders, FLIP-animates the reordered
Summary/Skills items, and briefly washes newly emphasised phrases in the accent tint. Skills keywords are never emphasised, in any theme or focus.

## Brand components per theme

Beyond tokens, some themes render elements as the company's own design-system components (all
real text, so PDFs and ATS parsing are unaffected):

| Theme | Industry tags | Section numbers | Other |
|---|---|---|---|
| Atlassian | ADS Tags: transparent, grey border, sentence case | Hidden (Confluence headings are unnumbered) | Confluence page: a full-width brand-blue band with 8px rounded bottom corners (bold label on the left, ADS badges on the right) over a white title block with a 96px photo, kicker as the byline, Summary as a white ADS card (surface fill, hairline border, xlarge radius) with 14px body text and a brand-blue ADS icon per item (angle-brackets, chart-trend-up, people-group, lightbulb), no section divider under the Summary card, Skills & stacks cards in ADS accent fills (blue, green, purple by group, `radius.xlarge`, titled by an uppercase label chip in the group's bolder accent on its subtlest fill), contact links in the ADS link colour, three ADS Tags with check icons under the role title |
| Notion | Select-property pills, Notion's pastel palette | Hidden (Notion headings are unnumbered) | Page-style header: cover band, face as page icon, 32px title; emoji summary icons; skills cards in Notion's blue, green and purple block backgrounds with matching pill titles |
| Linear | Outlined issue labels with coloured dots | Issue IDs (`JTB-1`) | |
| Canva | Rounded purple chips | Default | |
| Everlab | Uppercase mono, each after an orange square | Outlined mono "subhead" tag with a black square | Serif name only (headings stay sans, "continued" in two-tone grey), monochrome summary in a linen card, skills cards in the same linen, sub-headings as black mono labels after an orange square (no chip) |
| Remitly | Warm-neutral pills (#EFECE7), 12px/600 tag style | Hidden | Summary in a 16px-radius Eucalyptus (#E5F6F9) card with teal icons, skills cards on the site's Eucalyptus, Wasabi and Macadamia backgrounds, sub-headings as pills by group: light teal, green, ube purple |
| Anduril | Outlined 2px boxes, uppercase | Default (olive) | Squircle photo; metadata as the site's uppercase tracked sans labels; skills cards on its off-white #F1F0EA with 2px corners, sub-headings as chips by group: black with lime, olive, grey |
| Mitti | Outlined 6px boxes, like its secondary buttons | Default (indigo) | 18px rounded-square photo; Funnel Display name and headings; metadata as the site's uppercase Geist labels tracked 0.1em; skills cards on its light grey #F2F1F1 with 16px corners, sub-headings as chips by group: indigo, yellow, cyan |
| finguide | Neutral pill badges (#2E2E2E, hairline border) | Hidden | Rounded-square photo (16px); lime role dash and summary labels; skills cards on the raised neutral (#262626) with lime-wash title chips |
| Default, Stripe, Relevance AI | Interpunct-separated mono text | Default | |
