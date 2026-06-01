# NEXUS v1 — Deployment

**Repo:** [github.com/dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) (private)

Static dashboard on Vercel with live data via serverless proxies: Finnhub (`/api/finnhub`) for live quotes and FMP (`/api/fmp`) for historical fundamentals. Keys stay server-side.

---

## Overview

| Item | Value |
|------|--------|
| Host | Vercel Hobby |
| Live prices | `live-prices.js` → `/api/finnhub` → `/quote` |
| Poll | 60s (`NEXUS_FINNHUB_POLL_MS`) |
| Historical fundamentals | `rightpanel.js` DATA tab → `/api/fmp` |
| WS | Local only (`finnhub-key.js` + `USE_WS`); off on Vercel |
| Config | `finnhub-config.js` — poll, proxy, WS (**no key**) |
| Key (local) | `finnhub-key.js` — gitignored |
| Keys (prod) | Vercel env `FINNHUB_API_KEY`, `FMP_API_KEY` |
| Build | `vercel.json` copies `finnhub-config.deploy.js` + empty `finnhub-key.js` |

---

## Deploy

1. Push `main` to GitHub (repo above).
2. [vercel.com/new](https://vercel.com/new) → import **dhrumilpatel/nexus** → Framework **Other** → empty build/output/install (`vercel.json` handles build).
3. Env **`FINNHUB_API_KEY`** and **`FMP_API_KEY`** (Production + Preview) → redeploy.

---

## Live refresh

1. `NexusLivePrices.start()` on load.
2. `USE_PROXY=true` on Vercel.
3. Poll `/api/finnhub?path=quote&symbol=…` for active tickers.
4. DOM patch `data-nexus-tk`; dashboard sentiment via `/stock/recommendation`.

## Fundamentals refresh (Phase 2)

1. Open right panel **DATA** tab on a selected ticker.
2. `NexusFmpApi.getHistory()` calls `/api/fmp` endpoints for market cap, income statement, and ratios (last ~8 quarters).
3. Results are cached per symbol (~5 min); fallback remains `stocks.js` / static trajectory if unavailable.

---

## Verify

| Check | Expected |
|-------|----------|
| Badge | LIVE or SYNC |
| `/api/finnhub?path=quote&symbol=AAPL` | JSON `c`, `dp` |
| `/api/fmp?path=income-statement/AAPL&period=quarter&limit=1` | JSON array with `revenue`, `netIncome` |
| ~1 min | Background quote poll; click LIVE/SYNC/CLOSE badge to refresh now |

---

## Local dev

```bash
cp app/finnhub-config.example.js app/finnhub-config.js
cp app/finnhub-key.example.js app/finnhub-key.js
# key in finnhub-key.js only
npx serve .
```

Proxy match: `finnhub-config.deploy.js` + `FINNHUB_API_KEY` + `npx vercel dev`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| STATIC | Set `FINNHUB_API_KEY`; redeploy |
| `/api/finnhub` 500/502 | Env var / Finnhub outage |
| `/api/fmp` 500/502 | Missing `FMP_API_KEY` / upstream issue |
| 404 config or key JS | Vercel build log — `cp` step failed |
| Key committed | Only `finnhub-key.js` is secret |
| TV blank | HTTPS not `file://` |

---

## Handover

- [ ] `api/finnhub.js`, `api/fmp.js`, `vercel.json`, client API modules committed
- [ ] `index.html`: config → key → api → live-prices
- [ ] Vercel env set; LIVE/SYNC; proxy returns quotes

**APIs:** [`integrations/README.md`](integrations/README.md) · [`integrations/api-finnhub.md`](integrations/api-finnhub.md) · [`integrations/api-fmp.md`](integrations/api-fmp.md)
