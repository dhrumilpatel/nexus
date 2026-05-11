# Financial Modeling Prep (FMP)

**Phase:** 2
**Cost:** Free tier — 250 requests/day. Starter plan ~$19/month for more.
**Status:** ⏳ Pending — API key needed
**Sign up:** https://financialmodelingprep.com
**Docs:** https://financialmodelingprep.com/developer/docs
**Target file:** `app/api-fmp.js` (new file, Phase 2)

---

## Why FMP Alongside Finnhub

Finnhub free tier doesn't provide historical quarterly data — only current snapshots. FMP fills the gap:

| Data | Source |
|------|--------|
| Live price + today's change | Finnhub WebSocket |
| Current PE, MCap, EPS, Beta | Finnhub /metric |
| **Historical quarterly MCap** | **FMP** |
| **Historical quarterly PE** | **FMP** |
| **Annual Revenue history** | **FMP** |
| **Annual Net Income history** | **FMP** |
| **Segment revenue breakdown** | **FMP** |

FMP is the engine behind the sparkline trajectory charts (MCap & PE over 8 quarters) in the right panel DATA tab.

---

## Authentication

API key as query param. Same proxy approach as Finnhub:

```javascript
// api/fmp.js — Vercel serverless proxy
export default async function handler(req, res) {
  const { path, ...params } = req.query;
  const qs = new URLSearchParams({ ...params, apikey: process.env.FMP_API_KEY });
  const response = await fetch(`https://financialmodelingprep.com/api/v3/${path}?${qs}`);
  const data = await response.json();
  res.json(data);
}
```

---

## Key Endpoints

### Historical Market Cap (Quarterly)
```
GET https://financialmodelingprep.com/api/v3/historical-market-capitalization/NVDA
    ?limit=8&apikey=KEY

Response:
[
  { "symbol": "NVDA", "date": "2026-03-31", "marketCap": 2760000000000 },
  { "symbol": "NVDA", "date": "2025-12-31", "marketCap": 2280000000000 },
  // ... 8 quarters
]
```

Maps to `HIST[tk].mc[]` — the sparkline data in rightpanel.js.
Divide by 1e9 for $B display.

### Income Statement (Annual)
```
GET https://financialmodelingprep.com/api/v3/income-statement/NVDA
    ?period=annual&limit=4&apikey=KEY

Key response fields per year:
{
  "date": "2026-01-31",
  "revenue": 113270000000,        → S[tk].rev (divide by 1e9)
  "netIncome": 72880000000,       → S[tk].net (divide by 1e9)
  "eps": 16.50,                   → S[tk].eps
  "grossProfit": 83600000000,
  "operatingIncome": 78400000000,
  "ebitda": 81200000000,
}
```

### PE Ratio History (Quarterly)
```
GET https://financialmodelingprep.com/api/v3/historical-price-full/NVDA
    ?serietype=line&apikey=KEY
    (then calculate PE from price / ttm EPS)

Or use:
GET https://financialmodelingprep.com/api/v3/ratios/NVDA
    ?period=quarter&limit=8&apikey=KEY

Key fields: { "date": "...", "priceEarningsRatio": 68.2 }
```

Maps to `HIST[tk].pe[]` — the PE sparkline.

### Company Profile (Supplementary)
```
GET https://financialmodelingprep.com/api/v3/profile/NVDA?apikey=KEY

Response:
{
  "symbol": "NVDA",
  "companyName": "NVIDIA Corporation",
  "sector": "Technology",
  "industry": "Semiconductors",
  "description": "...",
  "ceo": "Jensen Huang",
  "employees": 29600,
  "website": "https://www.nvidia.com",
  "image": "https://financialmodelingprep.com/image-stock/NVDA.png",
}
```

Phase 3: company description and CEO name in the intelligence panel.

---

## Data Structure Update (Phase 2)

The `HIST{}` object in `rightpanel.js` currently holds hand-entered mock data for 8 stocks. Phase 2 replaces this with FMP-fetched data, cached locally.

**Current mock structure (Phase 1):**
```javascript
const HIST = {
  NVDA: {
    q:  ['Q1\'23','Q2\'23','Q3\'23','Q4\'23','Q1\'24','Q2\'24','Q3\'24','Q4\'24'],
    mc: [580, 1040, 1180, 1220, 2180, 2950, 2280, 2760],
    pe: [58, 182, 240, 186, 124, 82, 72, 68]
  },
  // ...
};
```

**Phase 2 replacement — dynamic fetch:**
```javascript
// app/api-fmp.js
const histCache = {};

async function getHistory(tk) {
  if (histCache[tk]) return histCache[tk];

  const [mcData, peData] = await Promise.all([
    fetchFMP('/historical-market-capitalization/' + tk, { limit: 8 }),
    fetchFMP('/ratios/' + tk, { period: 'quarter', limit: 8 })
  ]);

  const result = {
    q:  mcData.map(d => formatQuarter(d.date)),
    mc: mcData.map(d => d.marketCap / 1e9),    // $B
    pe: peData.map(d => d.priceEarningsRatio),
  };

  histCache[tk] = result;
  return result;
}
```

---

## Rate Limits (Free Tier)

| Limit | Value | NEXUS impact |
|-------|-------|-------------|
| Daily requests | 250 | Load history on demand, cache aggressively |
| Historical depth | 5 years | More than enough for 8-quarter sparklines |
| Quarterly data | Available | Full access on free tier |

**250 calls/day is tight for 85 stocks.** Strategy:
- Only fetch history when user clicks into DATA tab
- Cache in `histCache{}` for the session — one fetch per stock per session
- At 85 stocks max, one full load = 170 calls (2 per stock). Fine for personal use.
- Never pre-fetch on page load — always on-demand.

---

## Implementation Plan (Phase 2)

```
New files:
  app/api-fmp.js       getHistory(), getIncomeStatement(), cache management
  api/fmp.js           Vercel serverless proxy

Modified files:
  app/rightpanel.js    Replace HIST{} mock with getHistory() async call
                       Add loading spinner while data fetches
                       Update DATA tab to show live revenue/netIncome from getIncomeStatement()
  data/stocks.js       Rev and net fields become Phase 1 fallbacks (FMP overrides on load)
```

**Migration path:** Keep `S[tk].rev` and `S[tk].net` in stocks.js as Phase 1 fallbacks. Phase 2 `getIncomeStatement()` overwrites them on first stock selection. Graceful degradation if FMP is slow or fails.
