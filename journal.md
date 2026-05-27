# NEXUS — journal (compressed)

**Purpose:** tiny agent/human cache. Long narrative lives in git history / older backups.

---

## Current snapshot (May 2026)

| Area | State |
|------|--------|
| Layout | Modular `data/` · `views/` · `app/` + `nexus.css`; serve from inner `Nexus/` |
| Dashboard | Mock-v3: Mcap · Sentiment · Movers KPIs; tier donuts; gainers/losers tables; no Finnhub footer |
| Finnhub | Live quotes + optional WS; dashboard analyst KPI via `finnhub-dashboard.js` (cache `nexus_fh_dash_v4`) |
| Pyramid | Sankey % widths + connectors; fixed `--py-tile-w` tiles |
| WHEEL | YTD×P/E scatter; cap-weight Idx %; summary **Idx max** |
| Sectors | AI, Space, Quantum, Photonic, Semi, Nuclear, Commodity |
| Docs | Compressed dedupe + `deployment.md` (Vercel v1 handover) |
| Deploy | [github.com/dhrumil-pat/nexus](https://github.com/dhrumil-pat/nexus) pushed; Vercel proxy; key in `finnhub-key.js` |
| Next | FMP, custom domain, pyramid polish |

---

## Archive (one line each)

- **2026-05-08** — v6 collaborative discovery → dashboard direction.
- **2026-05-09** — v8: Midnight Pro, WHEEL, THEMES/NVIDIA, modular split.
- **2026-05-11** — Docs sync; Finnhub live-prices; Sankey + wheel index.
- **2026-05-21** — Dashboard v3, Finnhub analyst KPI, live price sweep fix, docs compress.
- **2026-05-27** — Markdown dedupe; v1 go-live; Finnhub key split (`finnhub-key.js` gitignored).
