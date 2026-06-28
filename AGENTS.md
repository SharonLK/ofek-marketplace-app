# AGENTS.md — Agent Conventions for ofek-marketplace-app

## Tech stack

- Vite 8 + React 19 + TypeScript 6
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, not PostCSS)
- React Router v7 (flat routes in `src/App.tsx`)
- `oxlint` for linting

## Commands

```sh
npm run dev       # Start Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # vite preview (serve built dist/)
```

## Project layout

```
src/
├── api/github.ts            — GitHub API layer (tree fetch, manifest parsing)
├── components/
│   ├── Layout.tsx            — App shell with header (Ofek logo) and footer
│   ├── FilterBar.tsx         — Type pills, hierarchy pills, search input
│   ├── PluginCard.tsx        — Card with badges, component names, text highlighting
│   ├── PluginGrid.tsx        — Responsive grid wrapper (1/2/3 cols)
│   ├── PluginDetailModal.tsx — Overlay modal with per-type install commands + copy buttons
│   └── MarkdownContent.tsx   — Simple regex-based markdown renderer
├── pages/
│   ├── HomePage.tsx          — Main page: loads plugins, filters, modal via ?plugin=&hierarchy=
│   └── PluginDetailPage.tsx  — Standalone route /plugin/:name (direct URL access)
├── types.ts                  — PluginItem, PluginType, PluginManifest interfaces
├── utils/search.ts           — fuzzyMatch() and getHighlightSegments() for soft search + highlighting
├── App.tsx                   — Router definition
├── index.css                 — Tailwind import + body/scrollbar styles (#0a0a0a bg)
└── main.tsx                  — Entry point
```

## Key patterns

- **Modal driven by URL**: `?plugin=<name>&hierarchy=<unit>` query params open the detail modal; closing clears them. Links like `/?plugin=code-review&hierarchy=common` are shareable.
- **Install commands**: Per-file `mkdir -p` + `curl -o` blocks grouped by type (skills, hooks, MCPs, agents) in the modal. Raw GitHub URL pattern: `https://raw.githubusercontent.com/SharonLK/ofek-marketplace/main/{common|units/<unit>}/plugins/<dirName>/{skills|hooks|mcps|agents}/<name>/<EXT>.md`.
- **Plugin identity**: `plugin.name` comes from the manifest (`plugin.json`), `plugin.dirName` from the directory on GitHub. `dirName` is used for URL construction because the two can differ (e.g. `code-review-skill` vs `code-review`).
- **Fuzzy search**: `fuzzyMatch()` in `src/utils/search.ts` — characters must appear in order but not contiguously. Matched characters are highlighted with `<mark>` in cards.
- **Type detection**: 3-part path `<type>s/<name>/<EXT>.md` under a plugin directory. Supported types: `skills`, `hooks`, `mcps`, `agents`.

## Color scheme

- Page background: `bg-neutral-950` (`#0a0a0a`)
- Accent: `cyan-500` (buttons, borders on hover)
- Surfaces: `neutral-900` (cards), `neutral-800` (badge bg, borders)

## Deployment

- `Dockerfile`: multi-stage build (node:24-alpine build → nginx:alpine)
- `nginx.conf`: SPA `try_files` fallback + asset caching

## .gitignore

- `FEATURE.md` and `PLAN.md` are gitignored (local planning docs)
