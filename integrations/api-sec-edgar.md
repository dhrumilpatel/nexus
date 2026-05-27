# SEC EDGAR

**Phase:** 3 · **Cost:** Free · **No API key**  
**Status:** Pending · **Base:** https://data.sec.gov  
**Target:** `app/api-sec.js`  
**Docs:** https://www.sec.gov/developer

---

## Use in NEXUS

| Filing | Use |
|--------|-----|
| Form 4 | Insider buy/sell in DATA tab |
| 8-K | Material events in NEWS tab |
| 10-Q / 10-K | Filed financials |
| companyfacts XBRL | Structured revenue, net income, EPS |

**No Vercel proxy** — public API; require `User-Agent: NEXUS Dashboard contact@youremail.com`.

Rate limit: 10 req/s — fine for personal use.

---

## CIK map

`app/api-sec.js` — `CIK[tk]` padded to 10 digits. Lookup: https://www.sec.gov/cgi-bin/browse-edgar

Seed map: NVDA, MSFT, GOOGL, META, AMZN, TSM, AMD, … (extend as needed).

---

## Endpoints

```
GET /submissions/CIK{padded}.json     → recent forms, dates, accession numbers
GET /api/xbrl/companyfacts/CIK{padded}.json  → us-gaap Revenues, NetIncomeLoss, EPS
```

Filter `filings.recent.form` for `4` or `8-K`. Parse Form 4 for insider name, amount, buy/sell.

---

## Phase 3 plan

**New:** `api-sec.js` — `getRecentForm4()`, `getRecent8K()`, `getCompanyFacts()`, `parseInsiderTransaction()`.

**Modify:** `rightpanel.js` — insider block on DATA; SEC list on NEWS; `state.js` session cache ~10 min.
