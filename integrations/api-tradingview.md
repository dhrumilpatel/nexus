# TradingView Widgets

**Phase:** 1A (Active now)
**Cost:** Free — no API key, no account needed
**Status:** ✅ Live in nexus-v7. Carries forward unchanged into v8.
**Codebase:** `app/rightpanel.js`, `views/view-news.js`

---

## What NEXUS Uses

| Widget | Where | Purpose |
|--------|-------|---------|
| Advanced Chart | Right panel → CHART tab | Full candlestick chart per selected stock |
| Timeline (symbol mode) | Right panel → NEWS tab | News feed filtered to selected stock |
| Timeline (market mode) | Intelligence tab → TradingView sub-tab | Broad market news feed |

---

## TradingView Pro and “live” tile prices

A **TradingView Pro (or higher) subscription unlocks features on tradingview.com** (more indicators, alerts, etc.). It does **not** provide a supported API or API key to pull last price / change % from TradingView’s servers into your own HTML/JS (outside their Broker API / Charting Library datafeeds, which are different products).

The **embeddable widgets** NEXUS uses run in TradingView’s iframe and show a **live chart** there, but the parent page **cannot read** that stream (browser security + no public quote endpoint tied to your Pro account).

**For live numbers on tiles, screener, and summary bar**, use a market-data API (NEXUS wires **Finnhub** in `app/live-prices.js`). Keep TradingView for charts and news; use Finnhub (or another feed) for numeric quotes.

---

## How It Works

TradingView widgets are loaded dynamically via injected `<script>` tags. No API key. No SDK install. TradingView hosts everything on their CDN.

**Pattern used in rightpanel.js:**
```javascript
let rpChDbn = null;  // debounce timer — file-local variable

function loadChart() {
  clearTimeout(rpChDbn);
  rpChDbn = setTimeout(() => {
    const el = document.getElementById('rpc-el');
    if (!el) return;

    // Container div
    const w = document.createElement('div');
    w.className = 'tradingview-widget-container';
    w.style = 'position:absolute;inset:0';

    // Inner div (widget mounts here)
    const i = document.createElement('div');
    i.className = 'tradingview-widget-container__widget';
    i.style = 'height:100%;width:100%';
    w.appendChild(i);

    // Config script
    const sc = document.createElement('script');
    sc.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    sc.async = true;
    sc.innerHTML = JSON.stringify({
      autosize: true,
      symbol: getTVSym(SEL_STOCK),   // e.g. 'NASDAQ:NVDA'
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',                    // 1 = candles
      locale: 'en',
      toolbar_bg: '#111421',
      enable_publishing: false,
      hide_top_toolbar: true,
      hide_legend: true,
      hide_side_toolbar: true,
      overrides: {
        'paneProperties.background': '#0c0e18',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.vertGridProperties.color': 'rgba(61,154,255,.05)',
        'paneProperties.horzGridProperties.color': 'rgba(61,154,255,.05)',
        'mainSeriesProperties.candleStyle.upColor': '#00c97a',
        'mainSeriesProperties.candleStyle.downColor': '#ff4757',
        'mainSeriesProperties.candleStyle.wickUpColor': '#00c97a',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ff4757',
      }
    });

    el.appendChild(w);
    w.appendChild(sc);
  }, 200);  // 200ms debounce — prevents widget conflicts on rapid navigation
}
```

**Why debounce:** TradingView widgets are heavy iframes. Mounting two simultaneously (rapid stock switching) causes silent failures. The 200ms debounce ensures only the final selection loads.

**Why dynamic injection:** Widgets must be re-created (not re-configured) when the symbol changes. innerHTML-setting the container and re-injecting the script is the only reliable approach.

---

## Symbol Format: getTVSym()

All tickers need a `EXCHANGE:SYMBOL` format. Most US stocks default to `NASDAQ:TICKER`.

```javascript
// app/utils.js — getTVSym() lookup table
function getTVSym(tk) {
  const m = {
    // Non-NASDAQ US listings
    TSM:  'NYSE:TSM',
    ASML: 'NASDAQ:ASML',    // Dutch company, US ADR, trades NASDAQ
    LHX:  'NYSE:LHX',
    LMT:  'NYSE:LMT',
    BA:   'NYSE:BA',
    RTX:  'NYSE:RTX',
    NOC:  'NYSE:NOC',
    ASTS: 'NASDAQ:ASTS',
    PL:   'NYSE:PL',
    RKLB: 'NASDAQ:RKLB',
    IBM:  'NYSE:IBM',
    IONQ: 'NYSE:IONQ',
    QBTS: 'NYSE:QBTS',
    QUBT: 'NASDAQ:QUBT',
    ARQQ: 'NASDAQ:ARQQ',
    ONTO: 'NYSE:ONTO',
    GLD:  'NASDAQ:GLD',     // ETF
    URA:  'NYSE:URA',       // ETF
    COPX: 'NYSE:COPX',      // ETF
    CCJ:  'NYSE:CCJ',
    ALB:  'NYSE:ALB',
    // UK / European listings
    OXIG: 'LON:OXIG',
    FILTR:'LON:FILTR',      // Phase 1B — NASA theme
    // Indian stocks (Phase 1B — India AI theme)
    TATACOMM:  'NSE:TATACOMM',
    HFCL:      'NSE:HFCL',
    STLTECH:   'NSE:STLTECH',
    APARINDS:  'NSE:APARINDS',
    NTPC:      'NSE:NTPC',
    EXIDEIND:  'NSE:EXIDEIND',
    AMARAJABAT:'NSE:AMARAJABAT',
    AURIONPRO: 'NSE:AURIONPRO',
    AMBER:     'NSE:AMBER',
  };
  return m[tk] || `NASDAQ:${tk}`;   // default to NASDAQ
}
```

**Adding a new ticker:** Add one line to the map if it's not NASDAQ. If it is NASDAQ, no change needed — the default handles it.

---

## Widget Types Reference

### Advanced Chart
```
URL: https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js
Use: Right panel CHART tab
Key config: symbol, interval, theme, overrides
```

### Timeline (News Feed)
```
URL: https://s3.tradingview.com/external-embedding/embed-widget-timeline.js
Use: Right panel NEWS tab, Intelligence tab
Key config: feedMode ('symbol' or 'market'), symbol, colorTheme, displayMode
```

**Symbol mode** (specific stock news):
```javascript
JSON.stringify({
  feedMode: 'symbol',
  symbol: getTVSym(SEL_STOCK),
  colorTheme: 'dark',
  isTransparent: true,
  displayMode: 'regular',
  width: '100%',
  height: '100%',
  locale: 'en'
})
```

**Market mode** (broad market news — no symbol):
```javascript
JSON.stringify({
  feedMode: 'market',
  market: 'stock',
  colorTheme: 'dark',
  isTransparent: true,
  displayMode: 'regular',
  width: '100%',
  height: '100%',
  locale: 'en'
})
```

---

## Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| No programmatic data access | Can't read chart data | Use Finnhub (`live-prices.js`) for tile numbers; keep widgets for charts |
| Private companies (SpaceX) | No chart available | Show placeholder in right panel |
| Indian stocks on NSE | Works with NSE:TICKER prefix | Add to getTVSym() map |
| Widgets need live HTTP/S | Won't load from file:// | Always use Vercel preview URL for testing |
| iframe-based | Can't style internals | Use overrides config object for chart colours |

---

## Interaction with Finnhub

With a key in `app/finnhub-config.js`, `app/live-prices.js` updates **tile/screener prices** (and related summaries). TradingView widgets continue to handle **charts and news** unchanged. Further Finnhub endpoints (fundamentals, sentiment in the UI) remain Phase 2 polish — no conflict with widgets.
