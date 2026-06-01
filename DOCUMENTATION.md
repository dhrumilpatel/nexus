# NEXUS — Documentation index

Markdown for developers/agents. Not required for the UI.

**Rule:** App = `data/`, `views/`, `app/`, `index.html`, `nexus.css`. Docs = this file + `integrations/*.md`.

---

## Status

| Item | Value |
|------|--------|
| **Repo** | [github.com/dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) (private) |
| **Branch** | `main` |
| **Deploy** | [`deployment.md`](deployment.md) — Vercel, `FINNHUB_API_KEY`, smoke tests |

| Secret file | Git |
|-------------|-----|
| `app/finnhub-key.js` | Ignored — API key only |
| `app/finnhub-config.js` | Committed — poll / proxy / WS (no key) |

---

## Doc layout

```
README.md · DOCUMENTATION.md · AGENT-GUIDE.md · deployment.md · journal.md
cache/ · scripts/ · integrations/ · data/ · views/ · app/
```

---

## Where to start

| I want to… | Read |
|------------|------|
| Overview | `README.md` |
| Schemas / render / script order | `AGENT-GUIDE.md` |
| Session snapshot | `journal.md` |
| Deploy Vercel + live prices | `deployment.md` |
| Branch, commit, open PR | `.cursor/skills/git-pr-workflow/SKILL.md` |
| Git author (Vercel) | `.cursor/rules/nexus-repo-identity.mdc` |
| Compress memory + keep workspace clean | `.cursor/skills/token-management/SKILL.md` |
| APIs + proxy | `integrations/README.md` |
| Finnhub wiring | `integrations/api-finnhub.md` |
| TradingView | `integrations/api-tradingview.md` |
| Node cache | `cache/README.md` |
| Dashboard UI/CSS | `views/view-dashboard.js`, `nexus.css` `.dash-*` |
| WHEEL | `views/view-wheel.js`, `app/utils.js` |
| FMP / Perplexity / SEC (planned) | `integrations/api-fmp.md`, `api-perplexity.md`, `api-sec-edgar.md` |
