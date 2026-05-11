# NEXUS v8 — Root

**App code path:** this project’s JavaScript lives in **`app/`**, **`data/`**, and **`views/`** (plural) next to `index.html`. If you opened the parent folder `Downloads/Nexus` in the editor, expand the inner **`Nexus`** folder to see them.

Personal stock intelligence dashboard. Supply chain pyramid visualisation across **AI, Space, Quantum, Photonic, Semiconductor, Nuclear,** and **Commodity** sectors. Deployed on Vercel (free tier), no build step, pure HTML/CSS/JS.

**Optional live quotes:** With a free [Finnhub](https://finnhub.io) key in `app/finnhub-config.js`, `app/live-prices.js` updates tile prices (DOM patch + timed REST sweep; optional WebSocket). Charts stay on TradingView widgets — see `integrations/api-tradingview.md`.

**Pyramid:** Sankey band widths (layer MCap → %), tapered connectors, **fixed-width** tiles (`--py-tile-w` on `.sankey-wrap`), **`safe center`** on `.band-tiles` so sparse rows center without clipping.

**WHEEL:** YTD (X) × P/E (Y), bubble size = Mcap, color = today %. Tooltip + legend document axes; **cap-weight index %** per name (`sectorMcapWeights` in `utils.js`). Summary bar shows **Idx max** (largest Mcap share) under total Mcap.

**Finnhub:** `app/finnhub-config.js` is **gitignored** — use `app/finnhub-config.example.js` as a template after clone.

---

## Folder Structure

```
Nexus/
├── README.md                   This file — root overview
├── DOCUMENTATION.md            Doc index + “where to start”
├── AGENT-GUIDE.md              Architecture, schemas, roadmap
├── journal.md                  Session history
├── index.html                  HTML skeleton — loads all CSS and JS
├── nexus.css                   All styles — no logic, no data
│
├── integrations/               Hosting + API reference (not loaded by the app)
│   ├── README.md               Integration map, env vars, phase checklist
│   ├── hosting-vercel.md       Vercel setup
│   ├── api-tradingview.md      TradingView (Phase 1 — live)
│   ├── api-finnhub.md          Finnhub (Phase 2)
│   ├── api-fmp.md              FMP (Phase 2)
│   ├── api-perplexity.md       Perplexity (Phase 3)
│   └── api-sec-edgar.md        SEC EDGAR (Phase 3)
│
├── data/                       LAYER 1 — Pure data. No logic ever lives here.
│   ├── README.md               Data layer guide (if present)
│   ├── stocks.js               Stock registry S{}
│   ├── sectors.js              Sector pyramid configs PYRAMIDS{}
│   └── themes.js               Theme configs THEMES_DATA{}
│
├── views/                      LAYER 2 — One file per center view. Stateless.
│   ├── README.md               Views layer guide (if present)
│   ├── view-pyramid.js         Sankey pyramid
│   ├── view-wheel.js           Bubble scatter (WHEEL tab)
│   ├── view-screener.js        Sortable screener table
│   ├── view-news.js            Intelligence + TradingView
│   └── view-flat.js            Commodity flat grid
│
└── app/                        LAYER 3 — State, nav, panels, coordination.
    ├── README.md               App layer guide (if present)
    ├── utils.js                Formatting helpers + getFinnhubSymbol()
    ├── state.js                All state variables + getCurrentP()
    ├── finnhub-config.js       Paste free Finnhub API key here (see finnhub.io/register)
    ├── live-prices.js          Finnhub REST poll + optional WS; DOM price patch (`data-nexus-tk`)
    ├── nav.js                  Navigation, pill buttons, mode switching
    ├── watchlist.js            Left panel watchlist
    ├── rightpanel.js           Right panel + sub-tabs
    └── app.js                  init(), renderCenter() dispatcher
```

---

## The Core Rule

**Data never contains logic. Views never modify state. App coordinates but doesn't render.**

If a change requires touching more than one folder, the architecture has been violated.

---

## How to Add Something

| What | File | Folder |
|------|------|--------|
| New ticker | stocks.js | data/ |
| New sector pyramid | sectors.js | data/ |
| New sector pill + accent color | state.js (`SEC_LABELS`, `SEC_COLORS`) | app/ |
| New theme | themes.js | data/ |
| New visual/tab | view-newname.js | views/ |
| New styling | nexus.css | root |
| Navigation change | nav.js | app/ |
| Right panel change | rightpanel.js | app/ |

---

## Script Load Order (index.html)

Order is strict — data before utils, utils before state, state before everything else.

```html
<!-- Data layer first -->
<script src="data/stocks.js"></script>
<script src="data/sectors.js"></script>
<script src="data/themes.js"></script>

<!-- Utilities and state -->
<script src="app/utils.js"></script>
<script src="app/state.js"></script>
<script src="app/finnhub-config.js"></script>
<script src="app/live-prices.js"></script>

<!-- Views (order within this block doesn't matter) -->
<script src="views/view-pyramid.js"></script>
<script src="views/view-wheel.js"></script>
<script src="views/view-screener.js"></script>
<script src="views/view-news.js"></script>
<script src="views/view-flat.js"></script>

<!-- App coordination last -->
<script src="app/nav.js"></script>
<script src="app/watchlist.js"></script>
<script src="app/rightpanel.js"></script>
<script src="app/app.js"></script>   <!-- calls init() — must be last -->
```

---

## Live prices (Finnhub, free tier)

1. Register at [finnhub.io](https://finnhub.io/register) and copy your API key.
2. Copy `app/finnhub-config.example.js` to `app/finnhub-config.js` (or create it) and set `window.NEXUS_FINNHUB_KEY`.
3. Optional: `NEXUS_FINNHUB_POLL_MS` — default **300000** (5 min). Use **120000** for 2 min. Finnhub allows **60 REST calls/minute**; each refresh walks active tickers with ~1.1s between `/quote` calls so one sweep stays under the cap.
4. Optional: `NEXUS_FINNHUB_USE_WS = true` for WebSocket trade ticks (tiles still update via DOM patch, not a full pyramid redraw).
5. Serve the site over HTTP(S) (e.g. local server or Vercel), not `file://`.

For a public GitHub repo, prefer a serverless proxy so the key is not in the client; see `integrations/api-finnhub.md`.

---

## Deployment

Vercel free tier. Push to GitHub, connect repo to Vercel, auto-deploys on push. No build config needed. External dependencies are CDN-loaded at runtime:

- **Google Fonts** — loaded in `index.html` `<head>`
- **TradingView widgets** — scripts injected on demand by `rightpanel.js` and `view-news.js`

---

## Phase Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1A | ✅ Baseline | Modular `data/` / `views/` / `app/` layout in this repo |
| 1B | In progress | WHEEL, tile-mets, THEMES nav, NVIDIA theme, sector expansions (e.g. Nuclear, commodities) |
| 2 | Partial | **Finnhub** tile quotes via `live-prices.js` + `finnhub-config.js`; FMP and richer fundamentals still planned |
| 3 | Planned | Intelligence: Perplexity Sonar + SEC EDGAR + COMPARE tab |

See `AGENT-GUIDE.md` for full roadmap and decisions log. For a doc index and integration checklist, see `DOCUMENTATION.md` and `integrations/README.md`.
