# NEXUS — Documentation index

Markdown reference for developers and agents. These files ship with the repo (and static hosting) but are not required for the UI to run.

**Rule:** Application code lives in `data/`, `views/`, `app/`, plus `index.html` and `nexus.css`. Long-form docs live in this directory and in `integrations/` as `.md` files.

---

## Doc layout

```
Nexus/
├── README.md              Project overview, folder map, script order
├── DOCUMENTATION.md       This file — where to read next
├── AGENT-GUIDE.md         Architecture, schemas, roadmap, decisions
├── journal.md             Session history
│
└── integrations/          Hosting + per-API guides
    ├── README.md          Integration map, env vars, phase checklist
    ├── hosting-vercel.md
    ├── api-tradingview.md
    ├── api-finnhub.md
    ├── api-fmp.md
    ├── api-perplexity.md
    └── api-sec-edgar.md
```

---

## Where to start

| I want to… | Read |
|------------|------|
| Understand the whole project | `AGENT-GUIDE.md` |
| See what was built in past sessions | `journal.md` |
| Hosting and external services overview | `integrations/README.md` |
| Set up Vercel | `integrations/hosting-vercel.md` |
| Wire live prices (Finnhub; optional key) | `app/finnhub-config.js`, `app/live-prices.js`, `integrations/api-finnhub.md` |
| Add historical chart data (Phase 2) | `integrations/api-fmp.md` |
| Build the research panel (Phase 3) | `integrations/api-perplexity.md` |
| Add insider trade alerts (Phase 3) | `integrations/api-sec-edgar.md` |
| Charts and news widgets today | `integrations/api-tradingview.md` |
| WHEEL scatter + cap-weight index % | `views/view-wheel.js`, `app/utils.js` (`sectorMcapWeights`), summary bar in `app/app.js` |

---

## Per-folder READMEs (optional)

If present, `data/README.md`, `views/README.md`, and `app/README.md` describe that layer only so you can stay inside one folder while editing.
