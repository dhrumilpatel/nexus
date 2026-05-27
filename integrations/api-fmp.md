# FMP

**Phase:** 2 · **250 req/day** · **Pending** · `app/api-fmp.js`
**Proxy:** `integrations/README.md` · **Cache:** `cache/README.md`

| Data | Source |
|------|--------|
| Live / current | Finnhub |
| Hist MCap, PE, rev, net | **FMP** |

Endpoints: `/historical-market-capitalization/{sym}`, `/income-statement/{sym}`, `/ratios/{sym}` (8Q).

**Plan:** `api-fmp.js` proxy + `getHistory()` in `rightpanel.js`; fetch on DATA tab open only; `stocks.js` fallbacks.
