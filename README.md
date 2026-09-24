# Jake Thornton-Bowen — interactive CV

A two-page A4 CV that restyles itself for the company reading it.

- **Company themes**: Default, Atlassian, Notion, Canva, Stripe, Linear, Relevance AI. Colours were
  sampled from each company's live site; proprietary typefaces are swapped for the closest open
  font (see the header of `src/styles/themes.css`).
- **Focus modes**: Balanced, Growth, Engineering. Each changes which phrases are bold, the order
  of the Summary and Skills sections, and the headline role/kicker.
- **Download PDF**: prints exactly what's on screen (vector, selectable text), named
  `Jake-Thornton-Bowen-CV-<Theme>-<Focus>.pdf`.
- **Shareable state**: `?theme=atlassian&focus=growth` opens straight into that view.

The CV stays centred and the controls sit in a panel in the right-hand gutter (it stays put while the pages scroll): a Theme
dropdown, a Focus switch and Download PDF. Below 1200px wide they collapse into a floating
"Customise" button that opens the same panel as a sheet.

Keyboard: `T` / `Shift+T` cycle themes, `F` / `Shift+F` cycle focus, `P` downloads the PDF.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # content/state unit tests
npm run pdf        # builds, renders all 21 theme × focus PDFs to exports/, asserts each is 2 pages
```

## Editing the CV

All copy lives in `src/content/cv.ts`. Inline markup:

| Markup | Meaning |
|---|---|
| `**text**` | always bold |
| `[[text\|b,g,e]]` | bold only in the listed focuses (b = Balanced, g = Growth, e = Engineering) |
| `{{text}}` | placeholder still to fill in (dashed accent underline) |
| `[text](https://…)` | link |

Section order per focus is the `order` object in the same file; headline role/kicker per focus is
`headlines`.

## How pages stay on A4

Each `.page` is a fixed 210 × 297mm sheet. `src/fit.ts` measures the content in the desktop
layout and applies a uniform CSS `zoom` (typically 97–100%) when a theme's fonts or a focus make it
run long, so the screen, the PDF and every theme stay exactly two pages. `npm run pdf` fails if any
combination spills or clips.

PDF-safe styling notes (Chrome → Preview/Quick Look): header gradients must be linear with opaque,
distinct stops, and nothing on the page may use `mix-blend-mode` in print — either makes Apple's
renderer flatten the gradient.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`
(enable Pages → "GitHub Actions" in the repo settings once).
