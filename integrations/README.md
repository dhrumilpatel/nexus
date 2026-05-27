# NEXUS — External services

**Deploy:** [`../deployment.md`](../deployment.md). Per-API: `api-*.md` below.

---

## Map

| File | Service | Phase | Status |
|------|---------|-------|--------|
| `hosting-vercel.md` | Vercel | 1A | Active |
| `api-tradingview.md` | TradingView | 1A | Live |
| `api-finnhub.md` | Finnhub | 2 | Partial |
| `api-fmp.md` | FMP | 2 | Active |
| `api-etf.md` (inline) | ETF holdings | 2 | Manual seed |
| `api-perplexity.md` | Perplexity | 3 | Pending |
| `api-sec-edgar.md` | SEC EDGAR | 3 | Pending |
| `cache/README.md` | Node cache | 2 | Optional |

Live prices + KPI: `api-finnhub.md`, `live-prices.js`. Historical fundamentals: `api-fmp.md`, `app/api-fmp.js`, `app/rightpanel.js`. Charts: `api-tradingview.md`.

**ETF mode (Phase 2-ready):** Manual registry in `data/etfs.js` (`ETF_SECTORS`). UI: top nav `ETF`, center `views/view-etf.js`, right panel `renderRPEtf()` in `app/rightpanel.js`. Phase 2 adapter: `app/etf-api.js` (`NexusEtfApi.fetchHoldings`, `normalizeEtf`, `mergeIntoEtf`) — wire a provider proxy the same way as FMP/Finnhub, then merge into the active ETF before `renderCenter()`.

---

## Environment (Phase 2+)

`FINNHUB_API_KEY` · `FMP_API_KEY` · `PERPLEXITY_API_KEY` · `NEXUS_CACHE_DIR` (optional)

Static deploy: use proxy below — never commit keys.

---

## Proxy pattern

```javascript
// api/finnhub.js — pattern for FMP/Perplexity with different env + URL
export default async function handler(req, res) {
  const { path, ...params } = req.query;
  const qs = new URLSearchParams({ ...params, token: process.env.FINNHUB_API_KEY });
  const r = await fetch(`https://finnhub.io/api/v1/${path}?${qs}`);
  res.json(await r.json());
}
```

| API | Env | Auth param |
|-----|-----|------------|
| Finnhub | `FINNHUB_API_KEY` | `token` query |
| FMP | `FMP_API_KEY` | `apikey` query |
| Perplexity | `PERPLEXITY_API_KEY` | Bearer header (POST) |

SEC: public, no proxy.

---

## Phase readiness

**2:** Finnhub + FMP keys; Vercel env; [x] `live-prices.js` + `finnhub-key.js` / proxy + `api/fmp.js` + `app/api-fmp.js` on-demand DATA tab fetch.

**3:** Perplexity; CIK map; `app/api-perplexity.js`, `app/api-sec.js`.
