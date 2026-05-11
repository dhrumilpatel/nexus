# Finnhub API

**Phase:** 2
**Cost:** Free tier — **60 REST API calls/minute** (rolling); WebSocket trades are separate
**Status:** **Active (optional)** — set `NEXUS_FINNHUB_KEY` in `app/finnhub-config.js`; without a key the app uses static `stocks.js` data.

**Rate limits in NEXUS:** `app/live-prices.js` refreshes **active** tickers on a timer (`NEXUS_FINNHUB_POLL_MS`, default 5 minutes) and waits **~1.1 seconds** between `/quote` requests during a sweep so a single sweep does not exceed the free-tier cap. Pyramid/screener rows update via **`data-nexus-tk` DOM patches** (not a full `renderCenter()`), so layouts stay stable. Optional `NEXUS_FINNHUB_USE_WS` enables WebSocket ticks (still DOM-patched).

**Sign up:** https://finnhub.io  
**Docs:** https://finnhub.io/docs/api  
**Implementation:** `app/finnhub-config.js` (key + poll/WS flags; **gitignored** — use `app/finnhub-config.example.js` as template), `app/live-prices.js`. A separate `app/api.js` proxy is optional for hiding keys on Vercel.

---

## What NEXUS Uses Finnhub For

| Feature | Endpoint | Frequency |
|---------|---------|-----------|
| Live stock prices | WebSocket | Real-time stream |
| Quote (price + change) | REST `/quote` | On demand / 30s poll fallback |
| Company fundamentals | REST `/stock/metric` | On stock select |
| Analyst ratings | REST `/stock/recommendation` | On stock select |
| News sentiment | REST `/news-sentiment` | On stock select |
| Earnings surprises | REST `/stock/earnings` | On stock select |

---

## Authentication

All requests require an API key as a query parameter or WebSocket param.

```javascript
const FINNHUB_KEY = 'your_api_key_here';  // Phase 2: load from env
```

**Important:** For a pure static Vercel deploy, the key is visible in client-side code. Options:
1. **Accept it** — Finnhub free keys have rate limits that protect against abuse. Personal dashboard = low risk.
2. **Proxy via Vercel function** — `api/finnhub.js` serverless function hides the key. Recommended for production.

Recommended approach for Phase 2: Vercel serverless proxy.

```javascript
// api/finnhub.js — Vercel serverless function (thin proxy)
export default async function handler(req, res) {
  const { path, ...params } = req.query;
  const qs = new URLSearchParams({ ...params, token: process.env.FINNHUB_KEY });
  const response = await fetch(`https://finnhub.io/api/v1/${path}?${qs}`);
  const data = await response.json();
  res.json(data);
}
// Client calls /api/finnhub?path=quote&symbol=NVDA — key never exposed
```

---

## WebSocket — Live Prices

**Implemented in:** `app/live-prices.js` (optional; enable with `window.NEXUS_FINNHUB_KEY` in `index.html`).

Connect once on app load. Subscribe with **Finnhub symbols** from `getFinnhubSymbol(tk)` in `app/utils.js` (not `getTVSym`, which uses `NASDAQ:` prefixes for widgets). Map each trade’s `trade.s` back to a registry key by matching `getFinnhubSymbol(tk)`. Use REST `/quote` for `dp` (day change %) or cache `pc` (previous close) to derive % from the last trade price.

```javascript
// Pattern (see live-prices.js for full ping/pong + throttling)
ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);
ws.onopen = () => {
  Object.keys(S).forEach(tk => {
    ws.send(JSON.stringify({ type: 'subscribe', symbol: getFinnhubSymbol(tk) }));
  });
};
```

**Market hours only:** WebSocket delivers trades 9:30am–4:00pm ET. Outside hours, fall back to REST `/quote` polling.

---

## REST Endpoints

### Quote — Current Price
```
GET https://finnhub.io/api/v1/quote?symbol=NVDA&token=KEY

Response:
{
  "c": 1124.80,   // current price
  "d": 30.84,     // change
  "dp": 2.84,     // change percent
  "h": 1138.20,   // high today
  "l": 1092.40,   // low today
  "o": 1092.00,   // open
  "pc": 1093.96,  // previous close
}
```

Maps to `S[tk]` fields: `px`, `ch`, `op`, (today's `hi` and `lo`)

### Basic Financials — Fundamentals
```
GET https://finnhub.io/api/v1/stock/metric?symbol=NVDA&metric=all&token=KEY

Key response fields:
{
  "metric": {
    "peAnnual": 68.2,          → S[tk].pe
    "epsAnnual": 16.50,        → S[tk].eps
    "beta": 1.68,              → S[tk].be
    "52WeekHigh": 1240,        → S[tk].hi (numeric)
    "52WeekLow": 462,          → S[tk].lo (numeric)
    "marketCapitalization": 2760000,  → S[tk].mc (in $M → divide by 1000 for $B)
    "revenuePerShareAnnual": ...,
    "netProfitMarginAnnual": ...,
  }
}
```

### Analyst Recommendations
```
GET https://finnhub.io/api/v1/stock/recommendation?symbol=NVDA&token=KEY

Response (array, most recent first):
[{
  "buy": 28,
  "hold": 4,
  "period": "2026-05-01",
  "sell": 0,
  "strongBuy": 10,
  "strongSell": 0,
  "symbol": "NVDA"
}]
```

Maps to `S[tk].rs` array: `[strongBuy, buy, hold, sell, strongSell]`

### News Sentiment
```
GET https://finnhub.io/api/v1/news-sentiment?symbol=NVDA&token=KEY

Response:
{
  "buzz": { "articlesInLastWeek": 184, "weeklyAverage": 98.3 },
  "sentiment": { "bullishPercent": 0.72, "bearishPercent": 0.28 },
  "companyNewsScore": 0.84
}
```

Phase 2: display as a sentiment bar in the right panel DATA tab.

---

## Rate Limits (Free Tier)

| Limit | Value | NEXUS impact |
|-------|-------|-------------|
| API calls | 60/minute | ~85 stocks → need smart batching |
| WebSocket symbols | 50 simultaneous | Subscribe only to active sector stocks |
| Historical data | Not available free | Use FMP for history (see api-fmp.md) |

**Batching strategy:** Don't load fundamentals for all 85 stocks at once. Load on-demand when a stock is selected. Use a local cache with 5-minute TTL.

```javascript
// Simple cache pattern
const fundamentalsCache = {};
async function getFundamentals(tk) {
  const now = Date.now();
  if (fundamentalsCache[tk] && now - fundamentalsCache[tk].ts < 300000) {
    return fundamentalsCache[tk].data;  // return cached if < 5 min old
  }
  const data = await fetchFinnhub('/stock/metric', { symbol: tk, metric: 'all' });
  fundamentalsCache[tk] = { data, ts: now };
  return data;
}
```

---

## Implementation Plan (Phase 2)

```
New files:
  app/api.js           WebSocket connection + quote polling + cache
  api/finnhub.js       Vercel serverless proxy (hides API key)

Modified files:
  data/stocks.js       Add finnhubSymbol field to stocks that differ from default
  app/rightpanel.js    Replace mock fundamentals with live getFundamentals() calls
  app/watchlist.js     Update to show live prices from WebSocket
  app/state.js         Add MARKET_OPEN bool, LAST_PRICE_UPDATE timestamp
```

Order: Build proxy first → test with one stock (NVDA) → expand to full watchlist → wire right panel.
