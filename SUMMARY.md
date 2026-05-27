# NEXUS v1 — Project summary

**Updated:** May 2026

---

## Git

| Item | Value |
|------|--------|
| **Remote** | `https://github.com/dhrumil-pat/nexus.git` |
| **Branch** | `main` (tracks `origin/main`) |
| **Latest commit** | `3a502d3` — feat: NEXUS v1 — Finnhub key split, Vercel proxy, deployment docs |
| **Visibility** | Private |
| **Auth** | GitHub CLI (`gh`) as **dhrumil-pat**; `gh auth setup-git` uses HTTPS |

### Why not `dhrumilpatel/nexus`?

- Push failed with **repository not found** on `dhrumilpatel/nexus` (no repo visible to the active token).
- Credentials in this environment authenticate as **`dhrumil-pat`**, not `dhrumilpatel`.
- A private repo **`dhrumil-pat/nexus`** was created and **`main`** was pushed successfully.

To use **`dhrumilpatel/nexus`** instead:

1. Create the private repo on the **dhrumilpatel** account (or ensure it exists).
2. `gh auth login` with a PAT from that account (scope: `repo`).
3. `git remote set-url origin https://github.com/dhrumilpatel/nexus.git`
4. `git push -u origin main`

### Common git commands

```bash
git status
git pull origin main
git add .
git commit -m "your message"
git push origin main
```

### Secrets (never commit)

| File | Git |
|------|-----|
| `app/finnhub-key.js` | **Ignored** — Finnhub API key only |
| `app/finnhub-config.js` | Committed — poll / proxy / WS flags only |

---

## Markdown documentation (~1,030 lines total)

Compressed dedupe layout: one topic per file, cross-links instead of copy-paste.

| File | Lines | Role |
|------|------:|------|
| [`README.md`](README.md) | ~65 | Quick overview, core rule, deploy pointer |
| [`DOCUMENTATION.md`](DOCUMENTATION.md) | ~45 | Doc index — where to start |
| [`deployment.md`](deployment.md) | ~150 | **Vercel go-live**, env vars, handover checklist |
| [`SUMMARY.md`](SUMMARY.md) | — | This file — git + docs map |
| [`AGENT-GUIDE.md`](AGENT-GUIDE.md) | ~280 | Architecture, schemas, script order, decisions |
| [`journal.md`](journal.md) | ~30 | Compressed session snapshot |
| [`integrations/README.md`](integrations/README.md) | ~75 | API map, proxy pattern, phases |
| [`integrations/hosting-vercel.md`](integrations/hosting-vercel.md) | ~15 | Pointer → `deployment.md` |
| [`integrations/api-finnhub.md`](integrations/api-finnhub.md) | ~85 | Live prices + dashboard KPI |
| [`integrations/api-tradingview.md`](integrations/api-tradingview.md) | ~55 | Charts / news widgets |
| [`integrations/api-fmp.md`](integrations/api-fmp.md) | ~50 | Phase 2 (planned) |
| [`integrations/api-perplexity.md`](integrations/api-perplexity.md) | ~40 | Phase 3 (planned) |
| [`integrations/api-sec-edgar.md`](integrations/api-sec-edgar.md) | ~50 | Phase 3 (planned) |
| [`cache/README.md`](cache/README.md) | ~85 | Node fundamentals cache |

**Read order:** `README` → `DOCUMENTATION` → task-specific file (`deployment.md` for deploy, `AGENT-GUIDE` for code changes).

---

## Deploy stack (v1)

| Layer | Detail |
|-------|--------|
| Host | Vercel static + `api/finnhub.js` serverless proxy |
| Env | `FINNHUB_API_KEY` on Vercel (not in git) |
| Live prices | `live-prices.js` — REST poll every 120s, DOM patch |
| Build | `vercel.json` copies `finnhub-config.deploy.js` + empty `finnhub-key.js` |

**Next:** Import [dhrumil-pat/nexus](https://github.com/dhrumil-pat/nexus) on Vercel, set `FINNHUB_API_KEY`, deploy. See [`deployment.md`](deployment.md).

---

## Repo layout (app code)

```
Nexus/
├── index.html, nexus.css
├── api/finnhub.js
├── app/          state, nav, live-prices, finnhub-*
├── data/         stocks, sectors, themes
├── views/        view-*.js
├── vercel.json
└── deployment.md
```
