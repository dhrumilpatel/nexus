# NEXUS v1

**Path:** `app/`, `data/`, `views/` next to `index.html` (inner `Nexus/` if repo is nested).

Supply-chain dashboard: **AI, Space, Quantum, Photonics, Semi, Nuclear, Commodity** pyramids; **Dashboard** (Mcap, Finnhub sentiment, movers); **WHEEL** (YTD × P/E, cap-weight index). Vercel static app.

| Feature | Notes |
|---------|--------|
| Pyramid | Sankey widths, fixed `--py-tile-w` tiles |
| WHEEL | `sectorMcapWeights`; summary **Idx max** |
| Live quotes | [`deployment.md`](deployment.md) / `finnhub-key.js` |
| Charts | `integrations/api-tradingview.md` |

**Docs:** [`DOCUMENTATION.md`](DOCUMENTATION.md) · [`AGENT-GUIDE.md`](AGENT-GUIDE.md) · [`integrations/README.md`](integrations/README.md)

---

## Core rule

**Data = no logic. Views = no state writes. App = coordinate only.**

---

## How to add

| What | File |
|------|------|
| Ticker | `data/stocks.js` |
| Sector | `data/sectors.js` + `app/state.js` labels/colors |
| Theme | `data/themes.js` |
| View | `views/view-*.js` |
| Style | `nexus.css` |
| Nav / panel | `app/nav.js` / `rightpanel.js` |

Script order: **AGENT-GUIDE.md → Vercel** (canonical block). Deploy: **deployment.md**.
