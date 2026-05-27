# NEXUS v1 — Project summary

**Updated:** May 2026

---

## Git

| Item | Value |
|------|--------|
| **Remote** | `https://github.com/dhrumilpatel/nexus.git` |
| **Branch** | `main` (tracks `origin/main`) |
| **Visibility** | Private |
| **Auth** | GitHub CLI (`gh`) as **dhrumilpatel** |

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

| File | Role |
|------|------|
| [`README.md`](README.md) | Quick overview, core rule |
| [`DOCUMENTATION.md`](DOCUMENTATION.md) | Doc index |
| [`deployment.md`](deployment.md) | Vercel go-live, `FINNHUB_API_KEY`, checklist |
| [`SUMMARY.md`](SUMMARY.md) | Git + docs map (this file) |
| [`AGENT-GUIDE.md`](AGENT-GUIDE.md) | Architecture, schemas, script order |
| [`journal.md`](journal.md) | Session snapshot |
| [`integrations/README.md`](integrations/README.md) | API map, proxy pattern |
| [`integrations/api-*.md`](integrations/) | Per-service guides |
| [`cache/README.md`](cache/README.md) | Node fundamentals cache |

---

## Deploy stack (v1)

| Layer | Detail |
|-------|--------|
| Host | Vercel + `api/finnhub.js` proxy |
| Env | `FINNHUB_API_KEY` on Vercel |
| Live prices | REST poll ~120s via `live-prices.js` |
| Repo | [github.com/dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) |

**Next:** Import **dhrumilpatel/nexus** on Vercel → set `FINNHUB_API_KEY` → deploy. See [`deployment.md`](deployment.md).
