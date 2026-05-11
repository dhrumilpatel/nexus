# SEC EDGAR

**Phase:** 3
**Cost:** Free — no API key, no account needed
**Status:** ⏳ Pending
**API Base:** https://data.sec.gov
**Docs:** https://www.sec.gov/developer
**Target file:** `app/api-sec.js` (new file, Phase 3)

---

## What NEXUS Uses It For

| Feature | Filing Type | Value |
|---------|------------|-------|
| Insider buying/selling | Form 4 | Who's buying their own stock? |
| Material events | 8-K | Earnings, acquisitions, guidance changes |
| Quarterly financials | 10-Q | Revenue, net income as filed |
| Annual report | 10-K | Full year financials |

**Primary use case:** Surface significant insider transactions directly in the right panel. If a CEO or large shareholder just bought $10M of their own stock, that's signal — and it's in Form 4 filings within 2 days.

---

## Authentication

None required. EDGAR is a public government database. All endpoints are open.

One requirement: include a `User-Agent` header identifying your app:
```javascript
headers: {
  'User-Agent': 'NEXUS Dashboard contact@youremail.com'
}
```

EDGAR enforces rate limits (10 requests/second) but this is generous for personal use.

---

## Key Concepts

### CIK Number
Every company has a Central Index Key (CIK). Required for all EDGAR queries.

```javascript
// app/api-sec.js — CIK map (add as needed)
const CIK = {
  NVDA:  '0001045810',
  MSFT:  '0000789019',
  GOOGL: '0001652044',
  META:  '0001326801',
  AMZN:  '0001018724',
  TSM:   '0001046179',
  AMD:   '0000002488',
  ASML:  '0000937556',
  MU:    '0000723125',
  AVGO:  '0001054374',
  ARM:   '0001973239',
  ANET:  '0001313925',
  IONQ:  '0001837235',
  RKLB:  '0001819989',
  ASTS:  '0001834974',
  IBM:   '0000051143',
  INTC:  '0000050863',
  KLAC:  '0000319201',
  LRCX:  '0000707549',
  AMAT:  '0000796343',
  VRT:   '0001518715',
  // Add more as needed — find at: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=NVDA&type=&dateb=&owner=include&count=40
};
```

---

## Endpoints

### Recent Filings for a Company
```
GET https://data.sec.gov/submissions/CIK{padded_cik}.json

Example: https://data.sec.gov/submissions/CIK0001045810.json

Response (key fields):
{
  "name": "NVIDIA CORP",
  "filings": {
    "recent": {
      "accessionNumber": ["0001045810-26-000042", ...],
      "filingDate":      ["2026-05-08", ...],
      "form":            ["4", "8-K", "10-Q", ...],
      "primaryDocument": ["wf-form4_171234567890.xml", ...],
    }
  }
}
```

### Form 4 — Insider Transactions
```javascript
// 1. Get recent Form 4 filings
async function getRecentForm4(tk) {
  const cik = CIK[tk]; if (!cik) return [];
  const paddedCIK = cik.padStart(10, '0');
  const resp = await fetch(`https://data.sec.gov/submissions/CIK${paddedCIK}.json`,
    { headers: { 'User-Agent': 'NEXUS contact@email.com' } });
  const data = await resp.json();

  const filings = data.filings.recent;
  const form4s = [];
  filings.form.forEach((f, i) => {
    if (f === '4') form4s.push({
      date: filings.filingDate[i],
      accession: filings.accessionNumber[i],
      doc: filings.primaryDocument[i],
    });
  });
  return form4s.slice(0, 5);  // 5 most recent
}
```

### 8-K — Material Events
```javascript
async function getRecent8K(tk) {
  // Same pattern as Form 4 but filter form === '8-K'
  // Display: date + filing link
  // Phase 3: parse for key events (earnings, guidance, M&A)
}
```

### Company Facts — Structured Financial Data
```
GET https://data.sec.gov/api/xbrl/companyfacts/CIK{padded_cik}.json

This returns ALL XBRL-tagged financial data filed by the company.
Key paths:
  .facts['us-gaap']['Revenues']['units']['USD']          → revenue by quarter
  .facts['us-gaap']['NetIncomeLoss']['units']['USD']     → net income by quarter
  .facts['us-gaap']['Assets']['units']['USD']            → total assets
  .facts['us-gaap']['EarningsPerShareBasic']['units']['USD/shares']  → EPS
```

This is the richest free financial data source available. No third-party needed.

```javascript
async function getCompanyFacts(tk) {
  const cik = CIK[tk]; if (!cik) return null;
  const paddedCIK = cik.padStart(10, '0');
  const resp = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
    { headers: { 'User-Agent': 'NEXUS contact@email.com' } });
  return await resp.json();
}

// Extract quarterly revenue
function extractQuarterlyRevenue(facts, quarters = 8) {
  const revenues = facts?.['us-gaap']?.['Revenues']?.['units']?.['USD'] || [];
  return revenues
    .filter(r => r.form === '10-Q' || r.form === '10-K')
    .slice(-quarters)
    .map(r => ({ date: r.end, value: r.val / 1e9 }));  // $B
}
```

---

## Rate Limits

| Limit | Value |
|-------|-------|
| Requests/second | 10 |
| Daily limit | None stated (reasonable use) |
| Data freshness | Filings appear within minutes of SEC acceptance |

For personal use: effectively unlimited. Never need to proxy — no key to protect.

---

## UI Implementation (Phase 3)

**Right panel — DATA tab addition (below analyst bar):**
```
INSIDER ACTIVITY
  [May 08] CEO Jensen Huang   BUY  $4.2M   (+0.02% of shares)   Form 4 →
  [Apr 22] SVP Colette Kress  BUY  $1.8M   (+0.01% of shares)   Form 4 →
  [Apr 15] Dir. Mark Stevens  SELL $12.4M  (-0.04% of shares)   Form 4 →
```

**Right panel — NEWS tab (alongside TradingView feed):**
```
SEC FILINGS
  [May 10] 8-K — Q1 2026 Earnings Results           8-K →
  [Apr 28] DEF 14A — Proxy Statement                 Filing →
  [Feb 12] 10-K — Annual Report FY2025               10-K →
```

---

## Implementation Plan (Phase 3)

```
New files:
  app/api-sec.js     CIK map, getRecentForm4(), getRecent8K(), getCompanyFacts()
                     parseInsiderTransaction() — extract buyer, amount, transaction type
                     No proxy needed — EDGAR is public

Modified files:
  app/rightpanel.js  Add insider activity section to DATA tab
                     Add SEC filings list to NEWS tab
  app/state.js       Add secCache{} for filing data (session TTL 10 min)
```

**No Vercel function needed** — EDGAR is a public API, no credentials to protect. Call directly from client.
