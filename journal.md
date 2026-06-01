# NEXUS — journal (compressed)

Tiny agent/human cache. Narrative in git history.

---

## Snapshot (Jun 2026)

| Area | State |
|------|--------|
| Repo | [dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) · `main` @ `f826683` · no open PRs |
| Recent merges | #14 memory docs · #15 CYBER seed · #12 live quotes · #13 PHOTONIC seed |
| Live poll | 60s (`NEXUS_FINNHUB_POLL_MS` in deploy/example config) |
| Live quotes | Prior-close fallback · `sessionStorage` cache · badge SYNC/CLOSE · manual refresh |
| FMP | Proxy + DATA tab on `main`; prod needs `FMP_API_KEY` + redeploy if fundamentals 500 |
| Sector seeds | PHOTONIC (40) · CYBER (21) — Lin @speculator_io May 2026 · `data/sectors.js` + `data/stocks.js` |
| ETF | #8/#9 mode + infographic holdings in `data/etfs.js` |
| Stack | `data/` `views/` `app/` · Vercel + `/api/finnhub` · Finnhub key in `finnhub-key.js` (gitignored) |
| Next | Await user task; `git pull origin main` → new `feature/` or `fix/` branch |

---

## Archive

Older milestones (v6–v8, go-live, md dedupe) — see git history.
