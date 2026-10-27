# Agent notes

Interactive two-page CV (Vite + TypeScript, no framework). Read `README.md` first.

## Commands

- `npm run typecheck`, `npm test`, `npm run lint`, `npm run check:contrast`, `npm run pdf`.
- Every theme × focus must stay exactly 2 A4 pages (`npm run pdf` fails otherwise).

## Atlassian theme (`src/styles/atlassian.css`)

- Build it with Atlassian Design System (ADS) tokens only: `var(--ds-*, <light-theme fallback>)`.
  `npm run lint:css` (the ADS Stylelint plugin) must pass.
- After adding or changing a `--ds-*` token in `src/styles/atlassian.css`, run `npm run ads:tokens` and commit
  `src/styles/ads-tokens.css` (`npm test` fails if it is stale).
- Use ADS icons only (`@atlaskit/icon/core/*`), as inline SVG with `fill="currentColor"`. Look them up
  with the `ads_search_icons` tool. Never use Unicode or emoji glyphs as icons in this theme.
- Visual rules come from Atlassian's DESIGN.md: https://atlassian.design/DESIGN.md (not the repo's own
  `DESIGN.md`, which describes this CV). Component and token docs: https://atlassian.design/llms.txt
- ADS MCP server `ads-mcp` is configured in `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex).
  Use `ads_search_tokens` before writing any token name, `ads_search_icons` before any icon, and
  `ads_get_guidelines` for foundations (typography, elevation, iconography).
- ADS agent skills (`npx @atlassian/skills`) are Atlassian-employee-only and not on public npm, so they
  are not installed here. Do not try to install them.
- Proprietary Atlassian typefaces are not available; Inter is the open stand-in (see `src/themes/registry.ts`).
