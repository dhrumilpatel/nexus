# Financial Modeling Prep (FMP)

**Phase:** 2 · **Cost:** Free 250 req/day  
**Status:** Pending · **Target:** `app/api-fmp.js`  
**Docs:** https://financialmodelingprep.com/developer/docs  
**Proxy:** `integrations/README.md` → Proxy pattern  
**Cache:** `cache/README.md`, `scripts/fundamentals-cache.mjs`

---

## Role vs Finnhub

| Data | Source |
|------|--------|
| Live price / today % | Finnhub |
| Current PE, MCap, EPS | Finnhub `/metric` |
| Historical quarterly MCap, PE | **FMP** |
| Annual revenue / net income | **FMP** |
| Segment revenue | **FMP** |

Powers right-panel DATA sparklines (`HIST[tk].mc[]`, `pe[]`) — 8 quarters.

---

## Key endpoints

```
GET /historical-market-capitalization/{sym}?limit=8&apikey=KEY
GET /income-statement/{sym}?period=annual&limit=4&apikey=KEY
GET /ratios/{sym}?period=quarter&limit=8&apikey=KEY
GET /profile/{sym}?apikey=KEY
```

Map MCap to $B (`/1e9`); income `revenue` / `netIncome` → `S[tk].rev` / `net` overrides on load.

---

## Phase 2 plan

**New:** `app/api-fmp.js` (`getHistory()`, `getIncomeStatement()`, session `histCache`), `api/fmp.js` proxy.

**Modify:** `rightpanel.js` — async `getHistory()` replaces mock `HIST{}`; loading state on DATA tab.

**Strategy:** Fetch on DATA tab open only; ~2 calls/stock; 250/day cap → no preload on page load. Keep `stocks.js` rev/net as fallbacks.

---

## Limits

250 req/day — on-demand per ticker per session. Historical depth 5y on free tier (enough for 8Q sparklines).
