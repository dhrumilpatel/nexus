# TradingView Widgets

**Phase:** 1A · **Cost:** Free · **Status:** Live  
**Code:** `app/rightpanel.js`, `views/view-news.js`

---

## Widgets

| Widget | Where |
|--------|-------|
| Advanced Chart | Right panel → CHART |
| Timeline (symbol) | Right panel → NEWS |
| Timeline (market) | Intelligence → TV sub-tab |

No API key. Scripts from `s3.tradingview.com/external-embedding/`.

**Tile prices:** TradingView Pro does **not** expose quotes to parent page. Use Finnhub (`live-prices.js`) for numbers; TV for charts/news only.

---

## Injection pattern (rightpanel.js)

- Debounce 200ms (`rpChDbn`) — avoids dual iframe mount on fast symbol change.
- Re-create widget on symbol change (don't reconfigure in place).
- `getTVSym(SEL_STOCK)` → `EXCHANGE:SYMBOL`.

```javascript
sc.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
sc.innerHTML = JSON.stringify({
  autosize: true, symbol: getTVSym(SEL_STOCK), interval: 'D', theme: 'dark',
  style: '1', hide_top_toolbar: true, hide_legend: true,
  overrides: { 'paneProperties.background': '#0c0e18', /* … */ }
});
```

Timeline: `embed-widget-timeline.js` — `feedMode: 'symbol'|'market'`, `symbol`, `colorTheme: 'dark'`.

---

## getTVSym() — app/utils.js

Default `NASDAQ:${tk}`. Override map for NYSE, LON, NSE, ETFs — add one line per non-NASDAQ ticker. Full map in source file.

---

## Limits

| Issue | Workaround |
|-------|------------|
| No parent-page data | Finnhub for quotes |
| Private companies | Placeholder in panel |
| Needs HTTP(S) | Not `file://` |
| iframe styling | `overrides` only |
