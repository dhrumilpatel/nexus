# TradingView Widgets

**Phase:** 1A · **Live** · `rightpanel.js`, `view-news.js`

| Widget | Where |
|--------|-------|
| Advanced Chart | RP → CHART |
| Timeline | RP → NEWS · Intelligence |

No API key. **Quotes:** Finnhub only — TV iframes cannot feed parent page.

**Injection:** 200ms debounce; recreate on symbol change; `getTVSym(tk)` → `EXCHANGE:SYMBOL` (map in `utils.js`; includes CYBER names e.g. `INFY`, `S`, `NET`).

Widgets: `embed-widget-advanced-chart.js`, `embed-widget-timeline.js` (`feedMode` symbol|market).

Needs HTTPS. Styling via `overrides` only.
