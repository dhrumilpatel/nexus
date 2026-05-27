# Finnhub API

**Phase:** 2 · **Cost:** Free — 60 REST/min; WS separate  
**Status:** Active (optional) — key in `app/finnhub-key.js` (see `finnhub-key.example.js`) or Vercel proxy  
**Docs:** https://finnhub.io/docs/api  
**Code:** `live-prices.js`, `finnhub-dashboard.js`  
**Proxy:** `integrations/README.md` → Proxy pattern · **Deploy:** `deployment.md`

**NEXUS rate limiting:** `NEXUS_FINNHUB_POLL_MS` (e.g. 120000); spaced `/quote` per sweep; DOM patch via `data-nexus-tk`. Optional `NEXUS_FINNHUB_USE_WS`.

---

## Endpoints in use

| Feature | Endpoint | Module |
|---------|----------|--------|
| Live prices | WS + `/quote` | `live-prices.js` |
| Dashboard sentiment | `/stock/recommendation` | `finnhub-dashboard.js` (top 10 Mcap, 6h cache `nexus_fh_dash_v4`) |
| Fundamentals (planned) | `/stock/metric` | on select |
| Earnings (planned) | `/stock/earnings` | on select |

**Not used:** `/news-sentiment` — 403 on free tier.

---

## Setup

1. Register at finnhub.io; copy key.
2. `finnhub-config.example.js` → `finnhub-config.js`; `finnhub-key.example.js` → `finnhub-key.js`; paste key in key file only.
3. Serve over HTTP(S), not `file://`.
4. Public repo: Vercel proxy (see README).

---

## WebSocket (live-prices.js)

- Symbols: `getFinnhubSymbol(tk)` in `utils.js` (not `getTVSym`).
- Map `trade.s` back to registry key.
- Use REST `/quote` `dp` or `pc` off-hours.
- Subscribe only active universe (~50 symbol cap on free tier).

```javascript
ws = new WebSocket(`wss://ws.finnhub.io?token=${KEY}`);
ws.send(JSON.stringify({ type: 'subscribe', symbol: getFinnhubSymbol(tk) }));
```

---

## REST (key fields)

**Quote** `GET /quote?symbol=NVDA` → `c`, `dp`, `pc` → tile `px`, `ch`

**Metric** `GET /stock/metric?symbol=NVDA&metric=all` → `peAnnual`, `epsAnnual`, `beta`, `marketCapitalization`, …

**Recommendation** `GET /stock/recommendation?symbol=NVDA` → `strongBuy`, `buy`, `hold`, `sell`, `strongSell` → `S[tk].rs`

---

## Dashboard sentiment

`finnhub-dashboard.js`: cap-weighted `avgBuyBias` from top-10 Mcap sample; gauge in `view-dashboard.js`; hidden if no data; no footer panel.

---

## Limits & batching

| Limit | NEXUS |
|-------|--------|
| 60 calls/min | Spaced sweep in `live-prices.js` |
| 50 WS symbols | Active sector only |
| No free history | Use FMP (`api-fmp.md`) |

Fundamentals on select: session cache ~5 min; don't prefetch all tickers at load.

---

## Status

| Module | Done |
|--------|------|
| `live-prices.js` | Quotes + optional WS |
| `finnhub-dashboard.js` | Analyst KPI |
| `api/finnhub.js` proxy | Planned |
