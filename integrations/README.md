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

Live prices + KPI: `api-finnhub.md`, `live-prices.js`. **Intl OMX quotes** (e.g. Swedish `.ST`): Yahoo proxy `/api/yahoo` when Finnhub free tier denies access — see `api/yahoo.js`, `yahoo-api.js`. Historical fundamentals: `api-fmp.md`, `app/api-fmp.js`, `app/rightpanel.js`. Charts: `api-tradingview.md`.

**Sector infographic seeds:** PHOTONIC (40 names) and CYBER (21 names) from Lin @speculator_io decks — manual `px`/`mc`/`ytd` in `data/stocks.js`, pyramid layers in `data/sectors.js`; live Finnhub overwrites quotes on load.

**ETF mode (Phase 2-ready):** Manual registry in `data/etfs.js` (`ETF_SECTORS`: AI, SPACE, MEMORY, PHOTONICS, SEMI, GREEN, COMM). Holdings tickers must exist in `data/stocks.js` (`S`) for live quotes + sector tags. UI: top nav `ETF`, center `views/view-etf.js`, right panel `renderRPEtf()`. Phase 2: `app/etf-api.js` (`NexusEtfApi`) — merge API payload before `renderCenter()`.

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
