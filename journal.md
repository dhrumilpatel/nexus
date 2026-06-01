# NEXUS — journal (compressed)

Tiny agent/human cache. Narrative in git history.

---

## Snapshot (Jun 2026)

| Area | State |
|------|--------|
| Repo | [dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) · `main` @ `de812c2` · no open PRs |
| Recent merges | #12 live quotes (`app/live-prices.js`) · #13 PHOTONIC 40-name seed |
| Live poll | 60s (`NEXUS_FINNHUB_POLL_MS` in deploy/example config) |
| Live quotes | Prior-close fallback · `sessionStorage` cache · badge SYNC/CLOSE · manual refresh |
| FMP | Proxy + DATA tab on `main`; prod needs `FMP_API_KEY` + redeploy if fundamentals 500 |
| ETF + seeds | #8/#9 ETF mode + infographic holdings · PHOTONIC pyramid on `main` |
| Stack | `data/` `views/` `app/` · Vercel + `/api/finnhub` · Finnhub key in `finnhub-key.js` (gitignored) |
| Next | Await user task; `git pull origin main` → new `feature/` or `fix/` branch |

---

## Archive

Older milestones (v6–v8, go-live, md dedupe) — see git history.
