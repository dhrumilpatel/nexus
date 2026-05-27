# NEXUS — Agent Developer Guide
**v8 modular** · May 2026 · Finnhub live quotes + dashboard KPI · Nuclear + Commodity

---

## What Is NEXUS

Personal supply-chain dashboard (pyramids + flat commodity). Vercel, single user.

**Engine:** Data-agnostic render — new sector/theme = `data/` only. Sankey widths = sqrt(layer MCap); fixed `--py-tile-w` tiles.

---

## Architecture

`LAYER 1` `data/` · `LAYER 2` `views/` · `LAYER 3` `index.html`, `nexus.css`, `app/`

### File map

| Layer | Paths |
|-------|--------|
| Data | `stocks.js`, `sectors.js`, `themes.js` |
| Views | `view-dashboard`, `pyramid`, `sankey-flow`, `wheel`, `screener`, `news`, `flat` |
| App | `utils`, `state`, `nav`, `watchlist`, `rightpanel`, `app.js` |
| Finnhub | `finnhub-config.js`, `finnhub-key.js` (gitignored), `finnhub-api.js`, `finnhub-dashboard.js`, `live-prices.js` |
| Deploy | `api/finnhub.js`, `finnhub-config.deploy.js` |

Tree: `DOCUMENTATION.md`.

---

## How to Make Common Changes

**Ticker:** `data/stocks.js` + layer in `sectors.js` or `themes.js`.

```javascript
CLS: { n:'Celestica Inc', px:'$82.40', ch:1.24, mc:12.4, ms:'$12.4B',
  pe:18.2, eps:4.53, be:1.38, vl:'1M', av:'1M', hi:'$96', lo:'$28', op:'$81',
  rt:'Buy', rs:[6,8,4,1,0], an:18, tags:['AI','SERVERS'], ytd:82, rev:8.4, net:.38 },
```

**Sector:** `PYRAMIDS` in `sectors.js` + `SEC_LABELS` / `SEC_COLORS` in `state.js`. **Theme:** `THEMES_DATA` (+ `label`, `color`).

**Views:** one `views/view-*.js` only. **CSS:** `nexus.css` (`.band-*`, `.tile-*`, `.wheel-*`, `.dash-*` ~L431+).

**Helpers:** `sectorMcapWeights`, `maxMcapWeightTicker` in `utils.js`.

---

## Dashboard

| Row | Content |
|-----|---------|
| KPI | Mcap · Finnhub sentiment · movers |
| Middle | Mcap/revenue tiers · layer TODAY/YTD |
| Bottom | Top/bottom 5 tables |

`finnhub-dashboard.js` + `live-prices.js` · `sessionStorage` `nexus_dash_layer` · details: `integrations/api-finnhub.md`.

---

## Data Schemas

### Stock (`stocks.js`)

```javascript
TICKER: {
  n:'Name', px:'$000.00', ch:0.00, mc:000, ms:'$000B',
  pe:00.0, eps:0.00, be:0.00, vl:'00M', av:'00M', hi:'$000', lo:'$000', op:'$000',
  rt:'Strong Buy', rs:[sb,b,h,s,ss], an:00, tags:['TAG'], ytd:00, rev:00, net:00
}
```

### Pyramid (`sectors.js`)

```javascript
KEY: { type:'pyramid', label_full:'NAME',
  layers:[{ id:'id', name:'Layer', theme:'Narrative', stocks:['TK'], up:true }] }
```

Flat: `type:'flat'`, `categories:[{ id, name, desc, stocks }]`. Theme: + `label`, `color`.

---

## State (`state.js`)

`CUR`, `CUR_THEME`, `NAV_MODE`, `CTAB`, `SANKEY_WEIGHT`, `RPTAB`, `SEL_STOCK`, `SEL_LAYER`, `SORT_*`, `WL_*`, `NEWS_SRC`

Helpers: `getCurrentP()`, `getActiveColor()`, `getActiveStocks()`.

---

## Render flow

`nav.js` → state → `renderCenter()` by `CTAB` / flat type → `view-*.js`; `renderWatchlist`, `renderRightPanel`. Views pure (no state writes).

---

## Design (Midnight Pro — locked)

`nexus.css` `:root`: `--bg` `#0c0e18`, `--s1`–`--s4`, `--acc`, `--up`, `--dn`, `--warn`. Fonts: Barlow Condensed, IBM Plex Mono. Accents: `SEC_COLORS`.

---

## Universe

`data/stocks.js`, `sectors.js`, `themes.js` — not listed here.

---

## Phases

| Phase | Status |
|-------|--------|
| 1 | Done — modular, WHEEL, Sankey, dashboard |
| 2 | Partial — Finnhub quotes/KPI; FMP planned |
| 3 | Planned — Perplexity, SEC, compare |

`integrations/README.md` for APIs.

---

## Agent protocol

1. Read this guide (~4K). 2. State task. 3. Open 1–2 target files. 4. Verify. 5. Node cache changes → `cache/README.md` smoke tests.

Snapshot: `journal.md`. Budget ~15–25K/session.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Heatmap | → WHEEL |
| Sankey width | sqrt(MCap) 54–96% |
| Tile width | `--py-tile-w` |
| Dashboard sentiment | Finnhub analyst only |
| Tile prices | DOM patch via Finnhub |
| Fundamentals cache | Node `cache/*.json` |

---

## Vercel + script order

Deploy: [`deployment.md`](deployment.md). Repo: [dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus).

**Must match [index.html](index.html):**

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
