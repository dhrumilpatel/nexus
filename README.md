# NEXUS v8 — Root

**App code path:** JavaScript lives in **`app/`**, **`data/`**, and **`views/`** next to `index.html`. If you opened parent `Downloads/Nexus`, expand the inner **`Nexus`** folder.

Personal stock intelligence dashboard: supply-chain pyramids across **AI, Space, Quantum, Photonics, Semiconductors, Nuclear, Commodity**; **Dashboard** (Mcap KPI, Finnhub analyst sentiment, movers, tier donuts); **WHEEL** (YTD × P/E, cap-weight index %); optional Finnhub live quotes. Vercel, no build step, HTML/CSS/JS.

| Feature | Notes |
|---------|--------|
| Pyramid | Sankey band widths, fixed `--py-tile-w` tiles, centered sparse rows |
| WHEEL | `sectorMcapWeights` in `utils.js`; summary **Idx max** |
| Live quotes | Vercel: `FINNHUB_API_KEY` — see [`deployment.md`](deployment.md); local: `finnhub-key.js` + `finnhub-config.example.js` |
| Charts | TradingView widgets — `integrations/api-tradingview.md` |

**Docs:** folder map and “where to start” → [`DOCUMENTATION.md`](DOCUMENTATION.md). Architecture/schemas → [`AGENT-GUIDE.md`](AGENT-GUIDE.md). Integrations/phases → [`integrations/README.md`](integrations/README.md).

---

## Where code lives

| Layer | Path |
|-------|------|
| Data | `data/stocks.js`, `sectors.js`, `themes.js` |
| Views | `views/view-*.js` |
| App | `app/*.js` + `index.html` + `nexus.css` |
| Node cache | `cache/`, `scripts/fundamentals-cache.mjs` — `cache/README.md` |

Full tree: **DOCUMENTATION.md → Doc layout**.

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
| New sector pill + accent | state.js (`SEC_LABELS`, `SEC_COLORS`) | app/ |
| New theme | themes.js | data/ |
| New visual/tab | view-newname.js | views/ |
| New styling | nexus.css | root |
| Navigation / right panel | nav.js / rightpanel.js | app/ |
| Fundamentals disk cache (Node) | `scripts/fundamentals-cache.mjs` | `cache/README.md` |

---

## Script load order

Strict order in **AGENT-GUIDE.md → Vercel Deployment Notes** (canonical `<script>` block). Summary: `data/*` → `app/utils` … `live-prices` → ECharts → `views/*` → `nav` → `watchlist` → `rightpanel` → `app.js`.

---

## Deployment

**NEXUS v1 on Vercel:** [`deployment.md`](deployment.md) (env vars, live prices, smoke tests, handover checklist). Short pointer: `integrations/hosting-vercel.md`.

**Phase status:** `integrations/README.md`.
