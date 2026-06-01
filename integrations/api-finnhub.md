# Finnhub API

**Phase:** 2 · **60 REST/min** · **Status:** optional — `finnhub-key.js` or Vercel proxy
**Code:** `live-prices.js`, `finnhub-dashboard.js` · **Proxy:** `integrations/README.md` · **Deploy:** `deployment.md`

Poll `NEXUS_FINNHUB_POLL_MS` (~60s); prior-close fallback when `c` missing; click badge → `refreshNow()`; DOM patch `data-nexus-tk`; optional `NEXUS_FINNHUB_USE_WS` (local + key only).

---

## Endpoints

| Use | Endpoint | Module |
|-----|----------|--------|
| Prices | WS + `/quote` | `live-prices.js` |
| Sentiment | `/stock/recommendation` | `finnhub-dashboard.js` (top 10 Mcap, 6h cache) |
| Planned | `/stock/metric`, `/stock/earnings` | on select |

`/news-sentiment` — 403 free tier (unused).

---

## Local setup

`cp finnhub-config.example.js` + `finnhub-key.example.js` → paste key in **key file only** · HTTP(S) required.

---

## WS (local)

`getFinnhubSymbol(tk)` not `getTVSym` · ~50 symbol cap · REST fallback off-hours.

---

## REST fields

`/quote` → `c`, `dp`, `pc` · `/stock/metric` → PE, EPS, beta, MCap · `/stock/recommendation` → `rs[]`

---

## Limits

60/min spaced sweep · 50 WS symbols · history → FMP (`api-fmp.md`). On-select cache ~5 min; no bulk prefetch. Infographic seeds (PHOTONIC, CYBER) may include ADR/intl tickers — prior-close + seed fallback in `live-prices.js` when `/quote` misses.
