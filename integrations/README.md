# NEXUS — External services & hosting

Documentation for every external service NEXUS uses or will use. One file per integration. Each file is self-contained — you can set up an integration from that file alone.

---

## Integration map

| File | Service | Phase | Status | Cost |
|------|---------|-------|--------|------|
| `hosting-vercel.md` | Vercel | 1A | Active | Free |
| `api-tradingview.md` | TradingView Widgets | 1A | Live | Free |
| `api-finnhub.md` | Finnhub | 2 | **Partial** — quotes in `live-prices.js` (key in `finnhub-config.js`) | Free tier |
| `api-fmp.md` | Financial Modeling Prep | 2 | Pending | Free tier |
| `api-perplexity.md` | Perplexity Sonar Pro | 3 | Pending | Pay-per-query |
| `api-sec-edgar.md` | SEC EDGAR | 3 | Pending | Free |

---

## Integration by feature

| Feature | Integration | File |
|---------|-------------|------|
| Hosting + deployment | Vercel | `hosting-vercel.md` |
| Stock charts | TradingView Advanced Chart | `api-tradingview.md` |
| News timeline | TradingView Timeline | `api-tradingview.md` |
| Live tile prices (today) | Finnhub REST + optional WebSocket | `app/live-prices.js`, `api-finnhub.md` |
| P/E, EPS, fundamentals (not yet wired to UI) | Finnhub REST | `api-finnhub.md` |
| Historical MCap + PE | FMP REST | `api-fmp.md` |
| Revenue + net income history | FMP REST | `api-fmp.md` |
| AI research Q&A | Perplexity Sonar Pro | `api-perplexity.md` |
| Insider trades Form 4 | SEC EDGAR | `api-sec-edgar.md` |
| Company filings 8-K | SEC EDGAR | `api-sec-edgar.md` |

---

## Environment variables (Phase 2+)

Store API keys in Vercel environment variables — never commit keys in code.

```
FINNHUB_API_KEY          Phase 2 — Finnhub free tier key
FMP_API_KEY              Phase 2 — Financial Modeling Prep key
PERPLEXITY_API_KEY       Phase 3 — Sonar Pro key
```

For local development, create `.env.local` (gitignored):

```
FINNHUB_API_KEY=your_key_here
FMP_API_KEY=your_key_here
```

**Important:** NEXUS is a static frontend. API keys cannot be hidden in a pure static deploy. Phase 2 requires either a thin serverless function (Vercel functions, free) to proxy API calls, or acceptance that keys are client-exposed. See each integration file for the recommended approach per API.

---

## Phase readiness checklist

**Before Phase 2:**

- [ ] Finnhub account created, free API key obtained
- [ ] FMP account created, free API key obtained
- [ ] Vercel project connected to GitHub repo
- [ ] Environment variables set in Vercel dashboard
- [x] `app/live-prices.js` + `app/finnhub-config.js` (see `api-finnhub.md` for proxy / future `api.js` if desired)

**Before Phase 3:**

- [ ] Perplexity API access granted (Sonar Pro tier)
- [ ] SEC EDGAR company CIK numbers mapped for key tickers
- [ ] `app/api-perplexity.js` scaffolded
- [ ] `app/api-sec.js` scaffolded
