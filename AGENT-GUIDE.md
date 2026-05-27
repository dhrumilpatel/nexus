# NEXUS — Agent Developer Guide
**Version:** v8 (Modular) · **Updated:** May 2026  
**Status:** Finnhub live quotes + dashboard analyst KPI; **Nuclear** + **Commodity** sectors.

---

## What Is NEXUS

Personal stock dashboard: **AI, Space, Quantum, Photonics, Semiconductors, Nuclear, Commodity** pyramids (or flat commodity). Vercel, single user.

**Core concept:** Pyramids = applications (top) → raw materials (bottom). Sankey band widths = sqrt(layer MCap), ~54–96% row width. Fixed tiles (`--py-tile-w`). Themes reuse the same engine.

**Critical principle:** Render engine is data-agnostic. New sector/theme = data only, zero render changes.

---

## Architecture

```
LAYER 1 — DATA     data/stocks.js, sectors.js, themes.js
LAYER 2 — VIEWS    views/view-*.js
LAYER 3 — SHELL    index.html, nexus.css, app/*.js
```

### File map (paths only)

| Path | Role |
|------|------|
| `index.html` | Skeleton; strict script order |
| `nexus.css` | All styles |
| `data/stocks.js` | `S{}` registry |
| `data/sectors.js` | `PYRAMIDS{}` |
| `data/themes.js` | `THEMES_DATA{}` |
| `views/view-dashboard.js` | KPI, tier donuts, movers |
| `views/view-pyramid.js` | Sankey pyramid (`sankey-wrap sec-<key>`) |
| `views/view-sankey-flow.js` | Sankey flow tab |
| `views/view-wheel.js` | WHEEL scatter |
| `views/view-screener.js` | Screener (`data-nexus-tk`) |
| `views/view-news.js` | Intelligence + TV widgets |
| `views/view-flat.js` | Commodity flat grid |
| `app/utils.js` | fmtB, pct, getTVSym, getFinnhubSymbol, sectorMcapWeights |
| `app/state.js` | State, SEC_COLORS/LABELS, getCurrentP() |
| `app/finnhub-config.js` | Poll, WS, proxy flags (no key) |
| `app/finnhub-key.js` | `NEXUS_FINNHUB_KEY` only (gitignored) |
| `app/finnhub-api.js` | REST routing: direct key or `/api/finnhub` |
| `app/finnhub-config.deploy.js` | Production settings (Vercel build copy) |
| `api/finnhub.js` | Vercel serverless proxy (`FINNHUB_API_KEY`) |
| `app/finnhub-dashboard.js` | Analyst KPI bundle |
| `app/live-prices.js` | REST sweep + optional WS |
| `app/nav.js` | Pills, sector/theme |
| `app/watchlist.js` | Left panel |
| `app/rightpanel.js` | Right panel |
| `app/app.js` | init, renderCenter |

Full doc tree: `DOCUMENTATION.md`.

---

## How to Make Common Changes

### Add a New Ticker

**File:** `data/stocks.js` only.

```javascript
CLS: {
  n: 'Celestica Inc',
  px: '$82.40', ch: 1.24, mc: 12.4, ms: '$12.4B',
  pe: 18.2, eps: 4.53, be: 1.38,
  vl: '1M', av: '1M', hi: '$96', lo: '$28', op: '$81',
  rt: 'Buy', rs: [6,8,4,1,0], an: 18,
  tags: ['AI','SERVERS'],
  ytd: 82, rev: 8.4, net: .38
},
```

Add key to a layer in `data/sectors.js` or `data/themes.js`.

### Edit ticker data

`data/stocks.js` only.

### Add sector / theme

- **Sector:** `data/sectors.js` → new `PYRAMIDS` entry (copy shape from existing pyramid). Pill label + color: `app/state.js` `SEC_LABELS`, `SEC_COLORS`.
- **Theme:** `data/themes.js` → new `THEMES_DATA` entry (+ `label`, `color`).

### Helpers (utils.js)

- **`sectorMcapWeights(tickerKeys)`** — `{ totalMc, map }` cap-weight %.
- **`maxMcapWeightTicker(tickerKeys)`** — `{ tk, w }` for summary **Idx max**.

### Fix a view

Edit only `views/view-*.js` (stateless: read globals, write DOM). Dashboard → `view-dashboard.js`; WHEEL → `view-wheel.js`; pyramid → `view-pyramid.js`; screener → `view-screener.js`; news → `view-news.js`.

### Styling

`nexus.css` only. Prefixes: `.band-*`, `.tile-*`, `.sankey-wrap`, `.wheel-*`, `.rp-*`, `.wl-*`, `.sb-*`, `.nm-*`, `.dash-*` (~L431+).

---

## Dashboard (view-dashboard.js)

Default tab (`CTAB === 'dashboard'`).

| Row | Content |
|-----|---------|
| KPI | Mcap · Sentiment (Finnhub analyst) · Top mover/loser |
| Middle | Mcap tiers · Revenue tiers · Layer perf (TODAY/YTD) |
| Bottom | Top 5 gainers / bottom 5 losers |

**Sentiment:** `finnhub-dashboard.js` → `/stock/recommendation`; hidden if no data. **Live prices:** `live-prices.js` patches `data-nexus-tk`; one re-render per sweep. **Layer toggle:** `sessionStorage` `nexus_dash_layer`. Finnhub details: `integrations/api-finnhub.md`.

**Read for dashboard work:** `view-dashboard.js` + `finnhub-dashboard.js`.

---

## Data Schemas

### Stock Entry (stocks.js)

```javascript
TICKER: {
  n:   'Company Full Name',
  px:  '$000.00', ch: 0.00, mc: 000, ms: '$000B',
  pe:  00.0, eps: 0.00, be: 0.00,
  vl: '00M', av: '00M', hi: '$000', lo: '$000', op: '$000',
  rt: 'Strong Buy', rs: [sb,b,h,s,ss], an: 00,
  tags: ['TAG1'], ytd: 00, rev: 00, net: 00
}
```

### Sector Pyramid (sectors.js)

```javascript
KEY: {
  type: 'pyramid',
  label_full: 'DISPLAY NAME',
  layers: [
    { id: 'layer-id', name: 'Layer', theme: 'Narrative', stocks: ['TK1'], up: true },
  ]
}
```

Flat: `type: 'flat'`, `categories: [{ id, name, desc, stocks }]`.

### Theme (themes.js)

Pyramid fields + `label` (pill), `color` (hex accent).

---

## State (app/state.js)

```javascript
CUR, CUR_THEME, NAV_MODE, CTAB, SANKEY_WEIGHT, RPTAB,
SEL_STOCK, SEL_LAYER, SORT_COL, SORT_DIR, WL_OPEN, WL_LAYERS, NEWS_SRC
```

Helpers: `getCurrentP()`, `getActiveColor()`, `getActiveStocks()`.

---

## Render Flow

1. `nav.js` mutates state (`setSector`, `setTheme`, …)
2. `app.js` `renderCenter()`:
   - `dashboard` → view-dashboard.js
   - `sankey` → view-sankey-flow.js
   - `flat` type → view-flat.js
   - `pyramid` → view-pyramid.js
   - `wheel` → view-wheel.js
   - `fundamentals` → view-screener.js
   - `news` → view-news.js
3. `renderWatchlist()` → watchlist.js; `renderRightPanel()` → rightpanel.js

Views are pure: `render(el, pyramid, color, state) → void`.

---

## Design System — Midnight Pro (LOCKED)

Tokens in `nexus.css` `:root`:

| Token | Role |
|-------|------|
| `--bg` `#0c0e18` | Page |
| `--s1`–`--s4` | Panel → active surfaces |
| `--acc` | Primary blue |
| `--up` / `--dn` / `--warn` | Green / red / amber |

Fonts: Barlow Condensed (labels), IBM Plex Mono (numbers), Barlow (prose). Sector accents: `SEC_COLORS` in `state.js` (AI `#4d9fff`, SPACE `#a78bfa`, …).

---

## Universe

Ticker lists and layer membership: **`data/sectors.js`**, **`data/themes.js`**, **`data/stocks.js`** — not duplicated here.

---

## Phases & APIs

| Phase | Status |
|-------|--------|
| 1A–1B | Done — modular layout, WHEEL, Sankey, dashboard, Nuclear/Commodity |
| 2 | Partial — Finnhub quotes + dashboard KPI; Node `cache/` optional; FMP planned |
| 3 | Planned — Perplexity, SEC, compare view |

Integration map, env vars, proxy pattern: **`integrations/README.md`**.

---

## Token window

| Task | Modular read |
|------|----------------|
| WHEEL fix | ~3K `view-wheel.js` |
| New ticker | ~2K `stocks.js` |
| New theme | ~2K `themes.js` |
| Right panel | ~4K `rightpanel.js` |

**Session protocol:** (1) Read this guide (~4K). (2) State task. (3) Open 1–2 target files only. (4) Change + verify. (5) After Node cache edits → `cache/README.md` smoke tests from inner `Nexus/`.

Budget ~15–25K/session vs ~40–60K monolith.

---

## Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Multi-layer system | Removed | No UX without relationship view |
| Heatmap | → WHEEL | 4D scatter more actionable |
| Midnight Pro | Locked | Until major version |
| Sankey width | sqrt(MCap) 54–96% | Tier visual weight |
| Tile width | `--py-tile-w` | Uniform cards + band scroll |
| Screener sort | Mcap desc | Largest first |
| Modular files | ~120 lines max | Targeted agent edits |
| Dashboard sentiment | Finnhub analyst only | No footer if empty |
| Tile prices | Static + optional Finnhub | DOM patch, not full redraw |
| Fundamentals cache | Node `cache/*.json` | UI unchanged |

---

## Vercel Deployment Notes

**Go-live:** [`deployment.md`](deployment.md) — env vars, smoke tests, handover checklist.

Free tier, no build. CDN: Fonts, TradingView, ECharts 5. Production: `vercel.json` copies deploy config + empty `finnhub-key.js`. Repo: [github.com/dhrumil-pat/nexus](https://github.com/dhrumil-pat/nexus).

**Canonical script order** (must match [index.html](index.html)):

```html
<!-- Data -->
<script src="data/stocks.js"></script>
<script src="data/sectors.js"></script>
<script src="data/themes.js"></script>
<!-- Utils + state + Finnhub -->
<script src="app/utils.js"></script>
<script src="app/state.js"></script>
<script src="app/finnhub-config.js"></script>
<script src="app/finnhub-key.js"></script>
<script src="app/finnhub-api.js"></script>
<script src="app/finnhub-dashboard.js"></script>
<script src="app/live-prices.js"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<!-- Views -->
<script src="views/view-dashboard.js"></script>
<script src="views/view-pyramid.js"></script>
<script src="views/view-sankey-flow.js"></script>
<script src="views/view-wheel.js"></script>
<script src="views/view-screener.js"></script>
<script src="views/view-news.js"></script>
<script src="views/view-flat.js"></script>
<!-- App coordination last -->
<script src="app/nav.js"></script>
<script src="app/watchlist.js"></script>
<script src="app/rightpanel.js"></script>
<script src="app/app.js"></script>
```
