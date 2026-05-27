# NEXUS — External services & hosting

One file per integration. **Deploy:** [`../deployment.md`](../deployment.md). API details in each `api-*.md`.

---

## Integration map

| File | Service | Phase | Status | Cost |
|------|---------|-------|--------|------|
| `hosting-vercel.md` | Vercel | 1A | Active | Free |
| `api-tradingview.md` | TradingView Widgets | 1A | Live | Free |
| `api-finnhub.md` | Finnhub | 2 | Partial — `live-prices.js`, `finnhub-dashboard.js` | Free tier |
| `api-fmp.md` | FMP | 2 | Pending | Free tier |
| `api-perplexity.md` | Perplexity Sonar Pro | 3 | Pending | Pay-per-query |
| `api-sec-edgar.md` | SEC EDGAR | 3 | Pending | Free |
| `cache/README.md` | Node fundamentals cache | 2 | Optional | Free |

| Feature | File |
|---------|------|
| Hosting | `hosting-vercel.md` |
| Charts + news widgets | `api-tradingview.md` |
| Live prices + analyst KPI | `api-finnhub.md`, `app/live-prices.js` |
| Historical MCap/PE, revenue history | `api-fmp.md` |
| Disk cache (TTL) | `cache/README.md`, `scripts/fundamentals-cache.mjs` |
| AI research Q&A | `api-perplexity.md` |
| Form 4 / 8-K | `api-sec-edgar.md` |

---

## Environment variables (Phase 2+)

Vercel dashboard or `.env.local` (gitignored):

```
FINNHUB_API_KEY
FMP_API_KEY
PERPLEXITY_API_KEY
NEXUS_CACHE_DIR          # optional; defaults to Nexus/cache/
```

Static deploy: keys are visible in client code unless proxied. Use **Proxy pattern** below for public repos.

---

## Proxy pattern (static deploy)

Thin Vercel serverless handler — one pattern, different env keys and upstream URLs.

```javascript
// api/finnhub.js (example — duplicate as api/fmp.js with FMP_API_KEY + fmp base URL)
export default async function handler(req, res) {
  const { path, ...params } = req.query;
  const qs = new URLSearchParams({ ...params, token: process.env.FINNHUB_API_KEY });
  const r = await fetch(`https://finnhub.io/api/v1/${path}?${qs}`);
  res.json(await r.json());
}
// Client: fetch('/api/finnhub?path=quote&symbol=NVDA')
```

| API | Env var | Upstream base | Query auth param |
|-----|---------|---------------|------------------|
| Finnhub | `FINNHUB_API_KEY` | `https://finnhub.io/api/v1/` | `token` |
| FMP | `FMP_API_KEY` | `https://financialmodelingprep.com/api/v3/` | `apikey` |
| Perplexity | `PERPLEXITY_API_KEY` | `https://api.perplexity.ai/chat/completions` | `Authorization: Bearer` header (POST body) |

SEC EDGAR: public — no proxy. Perplexity: see `api-perplexity.md` for POST body shape.

---

## Phase readiness

**Phase 2:** Finnhub + FMP keys; Vercel connected; env vars set; [x] `live-prices.js` + `finnhub-config.js` + `finnhub-key.js` (local) / Vercel env.

**Phase 3:** Perplexity access; CIK map for key tickers; scaffold `app/api-perplexity.js`, `app/api-sec.js`.
