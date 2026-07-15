# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All real work happens in `frontend/` (an npm workspace); root scripts just proxy into it.

```bash
npm run dev       # start Vite dev server (from repo root or frontend/)
npm run build     # production build (Vite)
npm run preview   # preview a production build
```

From `frontend/` directly:

```bash
npm run lint      # oxlint (frontend/.oxlintrc.json — react + oxc plugins)
```

There is no test suite and no test runner configured anywhere in the repo — don't invent test commands or assume one exists.

`backend/` and `database/` are **not live code**: `backend/server.js` is a mock Express template (in-memory arrays, never called by the frontend) sketching a future migration off `localStorage`, and `database/` is a one-off collection of scripts used to reverse-engineer styling/structure from source Excel workbooks during development. Don't wire the frontend up to `backend/server.js` unless a task explicitly asks for that migration.

## Architecture

**Everything is client-side.** There is no real backend or database in use today — all state lives in the browser's `localStorage`, read/written through plain functions in `frontend/src/lib/*.js`. This is the single most important thing to know before touching data: there's no server round-trip to reason about, but there's also no schema enforcement — the `localStorage` shape *is* the schema, and it lives only in these files.

### The data layer → context → page flow

1. **`frontend/src/lib/state.js`** is the primary data module: seeds default residential units/guest rooms/bookings/furniture library into `localStorage` on first run (`initStore()`), and exposes get/update functions for each domain (residential units, guest house rooms, bookings, furniture library, audit log, settings).
2. **`frontend/src/lib/rentState.js`** and **`frontend/src/lib/electricityBillState.js`** are separate, independent state modules for Money Management — each owns its own `localStorage` key(s) and its own upsert/derive functions. They are intentionally *not* merged into `state.js` or into each other: Residential Rent and Electricity Bill are tracked as separate per-flat records (see below), and neither should be made to depend on the other's storage.
3. **`frontend/src/lib/useAams.jsx`** is the single React Context (`AamsProvider` / `useAams()`) that wraps all of the above. It holds one `useState` mirror per domain, a `refresh()` that re-reads everything from `localStorage`, and action functions (e.g. `updateResidential`, `saveRentRecord`, `updateElectricityBillUnitsUsed`) that call into the lib layer and then refresh the relevant state slice. **Pages never touch `localStorage` or the `lib/*State.js` files directly — they only call `useAams()`.**
4. **Pages** (`frontend/src/pages/**`) are plain consumers: derive view-specific data with `useMemo` over the context's arrays, render tables/cards, and call the context's action functions on user input. There's no separate "service" layer beyond `lib/`.

When adding a new trackable entity (like Electricity Bill was added), the pattern is: new `lib/xState.js` module with its own storage key + upsert functions → wire it into `useAams.jsx` (state + actions) → consume via `useAams()` in a page. Don't retrofit an existing table's storage to carry a new feature — keep each concern in its own module, even if two features share the same identifier scheme (e.g. `buildingCode + roomNo`).

### Buildings, not a table

There is **no canonical buildings list** anywhere — `'NT1'` and `'NT2'` are hardcoded string literals throughout `state.js`, `useAams.jsx`, and page components (as `localStorage` key suffixes, function arguments, etc.). If a feature needs a list of buildings, hardcode `['NT1', 'NT2']` at the call site rather than inventing a shared constant that doesn't exist yet.

### Furniture & Fixtures — free text, not structured data

Furniture is stored differently depending on the source, and this inconsistency is load-bearing (not a bug to "fix" casually):
- **Residential units**: `unit.furniture` is a single comma-separated string, or the literal `'NIL'` when empty (see `frontend/src/lib/units.js` for the mock generator's shape).
- **Guest house rooms**: `room.furniture` is an array of item-name strings, occasionally with a `"Item (x2)"` quantity suffix.
- **`frontend/src/lib/importer.js`** (`parseAamsExcel`) parses the real-world Excel export (see `mockup/*.xlsx`) into the residential shape above. The real export packs furniture into one cell as `"Category: detail; Category: detail"` (e.g. `"AC/Electrical: 1AC,gey; Bed/Other: 6x4 -2 beds; Sofa; Dining Table (2)"`) — **`frontend/src/lib/furnitureParsing.js`** is the parser for that specific format, including size classification for beds/tables (dimension patterns like `6x4`, named sizes like `Queen`) baked into the item name plus an `(xN)` quantity suffix. It's a best-effort heuristic over messy hand-entered text, not a strict grammar.
- **`frontend/src/lib/assetAnalytics.js`** (used by the Asset Management page) is the aggregation layer that reads both shapes back out (`unit.furniture.split(',')` vs `room.furniture` array), parses the `(xN)` suffix via a shared regex, and rolls counts up by type/building. Any change to how furniture strings are formatted must stay compatible with this parser's expectations (plain comma-joined names, no embedded commas within a single item name).
- `getFurnitureLibrary()` / `getFurnitureUsageCount()` in `state.js` maintain a separate canonical *list* of known furniture-item names (for a picker/library UI) — this is distinct from the per-unit furniture data and cascades renames/deletes across both storage shapes above.

### Design system

Tailwind v4 (`@tailwindcss/vite` plugin, `frontend/src/index.css` → `@import "tailwindcss"` + `@config`) with a custom Material-3-flavored token set defined entirely in `frontend/tailwind.config.js` (`theme.extend.colors/spacing/fontSize`) — tokens like `bg-surface-container-lowest`, `text-on-surface`, `border-outline-variant`, `text-primary` (maroon, `#9b113e`), spacing aliases (`gutter`, `xl`, `lg`). There is no dark mode wired up despite `darkMode: 'class'` being set — don't add dark-mode variants unless asked. Icons are Material Symbols via the `Icon` component (`frontend/src/components/Icon.jsx`), passing a Material Symbols name string.

No charting library is installed (`frontend/package.json` deps are just `react`, `react-router-dom`, `xlsx`). Charts are hand-rolled SVG components in `frontend/src/components/charts/` (`Donut.jsx`'s stroke-dasharray technique is the original pattern; `PieChart.jsx`, `ProportionDonut.jsx`, `BuildingDistributionChart.jsx` extend it). Don't add a charting dependency without checking with the user first — it's a deliberate choice so far, not an oversight.

### Page shell & routing

`frontend/src/App.jsx` defines routes inside a single `<Layout>` (sidebar + content). Flat, non-building-scoped pages (Reports, Money Management, Asset Management, Settings) are one route each; Residential and Guest Houses are `:buildingCode`-parameterized routes that redirect from their bare path to `/…/nt1`. New flat tabs need: a route in `App.jsx`, a `navItems` entry in `frontend/src/components/Sidebar.jsx` (icon + label + `to`), and the page typically wrapped in `<Page>` (fixed sidebar offset, `frontend/src/components/Page.jsx`) + `<TopBar>` (search bar, `frontend/src/components/TopBar.jsx`).
