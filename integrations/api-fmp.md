# FMP

**Phase:** 2 · **250 req/day** · **Active** · `app/api-fmp.js`
**Proxy:** `integrations/README.md` · **Cache:** `cache/README.md`

| Data | Source |
|------|--------|
| Live / current | Finnhub |
| Hist MCap, PE, rev, net | **FMP** |

Endpoints via `/api/fmp` proxy:
- `/historical-market-capitalization/{sym}` (market cap trajectory)
- `/income-statement/{sym}` (revenue, net income)
- `/ratios/{sym}` (P/E trajectory)

`rightpanel.js` calls `NexusFmpApi.getHistory()` on DATA tab open only (no bulk prefetch), caches per symbol (~5 min), and falls back to `stocks.js` + static `HIST` when FMP is unavailable.
