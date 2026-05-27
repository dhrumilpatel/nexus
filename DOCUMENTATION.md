# NEXUS — Documentation index

Markdown for developers and agents. Not required for the UI.

**Rule:** App code = `data/`, `views/`, `app/`, `index.html`, `nexus.css`. Long-form docs = this directory + `integrations/*.md`.

---

## Doc layout

```
Nexus/
├── README.md              Quick overview + core rule
├── DOCUMENTATION.md       This file — navigation
├── AGENT-GUIDE.md         Architecture, schemas, decisions, script order
├── deployment.md          Vercel go-live + live prices + handover
├── journal.md             Compressed session snapshot
├── cache/                 Node fundamentals cache (cache/README.md)
├── scripts/               fundamentals-cache.mjs
├── integrations/          hosting-vercel.md, api-*.md, README.md
├── data/                  stocks.js, sectors.js, themes.js
├── views/                 view-*.js
└── app/                   state, nav, live-prices, app.js
```

---

## Where to start

| I want to… | Read |
|------------|------|
| Quick overview | `README.md` |
| Whole project / schemas / render flow | `AGENT-GUIDE.md` |
| Past sessions | `journal.md` |
| Hosting + APIs + phases | `integrations/README.md` |
| Deploy to Vercel (v1 go-live) | `deployment.md` |
| Branch, commit, open PR | `.cursor/skills/git-pr-workflow/SKILL.md` |
| Vercel quick pointer | `integrations/hosting-vercel.md` |
| Node fundamentals cache | `cache/README.md` |
| Finnhub live prices + dashboard KPI | `integrations/api-finnhub.md`, `app/finnhub-key.js` (local), `app/live-prices.js` |
| Dashboard UI | `views/view-dashboard.js`, AGENT-GUIDE § Dashboard |
| Dashboard CSS | `nexus.css` (`.dash-*` ~L431+) |
| FMP / Perplexity / SEC (planned) | `integrations/api-fmp.md`, `api-perplexity.md`, `api-sec-edgar.md` |
| TradingView charts/news | `integrations/api-tradingview.md` |
| WHEEL + index weights | `views/view-wheel.js`, `app/utils.js` (`sectorMcapWeights`) |

Optional layer READMEs (`data/`, `views/`, `app/`) if present — edit one folder without reading the full guide.
