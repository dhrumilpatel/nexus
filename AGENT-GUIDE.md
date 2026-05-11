# NEXUS — Agent Developer Guide
**Version:** v8 Architecture (Modular Split)
**Last Updated:** May 2026  
**Status:** Modular v8 app in repo; optional Finnhub live quotes; sectors include **Nuclear** and expanded **Commodity**; further enhancements TBD.

---

## What Is NEXUS

Personal stock intelligence dashboard for an active investor/trader. Tracks **AI, Space, Quantum, Photonic, Semiconductor, Nuclear,** and **Commodity** sectors via supply chain pyramid (or flat) visualisations. Built for a single user, deployed free on Vercel.

**Core concept:** Every sector is a pyramid from end applications (top) to raw materials (bottom). **Sankey-style** band widths reflect layer aggregate market cap (sqrt mapping, ~54–96% row width, centered). SVG connectors taper between adjacent layers. Stock tiles use a **fixed width** (`--py-tile-w` on `.sankey-wrap`) so cards stay uniform; narrow bands scroll horizontally. Themes (e.g. NVIDIA Ecosystem) use the same pyramid engine with different config data.

**Critical principle:** The render engine is generic and data-agnostic. It reads whatever pyramid config is active. Adding a new theme or sector requires zero changes to render logic.

---

## Architecture: Three-Layer Modular System

Changes in one layer never require changes in another.

```
LAYER 1 — DATA          Edit tickers, sectors, themes
LAYER 2 — VIEWS         Edit one visual without touching others
LAYER 3 — SHELL         HTML skeleton + CSS + app coordination (rarely changes)
```

### Complete File Map

```
Nexus/
│
├── index.html              HTML skeleton — strict script order
├── nexus.css               All styles — no logic (includes `.sankey-wrap.sec-AI` tile tweaks)
│
├── data/
│   ├── stocks.js           S{} stock registry — one entry per ticker
│   ├── sectors.js          PYRAMIDS{} — pyramid + flat commodity + Nuclear sector
│   └── themes.js           THEMES_DATA{}
│
├── views/
│   ├── view-pyramid.js     Sankey pyramid; wrapper class `sankey-wrap sec-<CUR|CUR_THEME>`
│   ├── view-wheel.js       Bubble scatter (WHEEL tab)
│   ├── view-screener.js    Sortable screener (`data-nexus-tk` for live price patch)
│   ├── view-news.js        Intelligence + TradingView widgets
│   └── view-flat.js        Commodity flat grid (`data-nexus-tk` on tiles)
│
└── app/
    ├── utils.js            fmtB, pct, getTVSym, getFinnhubSymbol, …
    ├── state.js            State, SEC_COLORS / SEC_LABELS, getCurrentP(), getActiveStocks()
    ├── finnhub-config.js   NEXUS_FINNHUB_KEY, NEXUS_FINNHUB_POLL_MS, NEXUS_FINNHUB_USE_WS
    ├── live-prices.js      Finnhub REST sweep + optional WS; DOM price updates
    ├── nav.js              Navigation, pills, sector/theme switching
    ├── watchlist.js        Left panel watchlist
    ├── rightpanel.js       Right panel + chart/data/news sub-tabs
    └── app.js              init, renderCenter, modal, NexusLivePrices.start()
```

---

## How to Make Common Changes

### Add a New Ticker

**File:** `data/stocks.js` only.

```javascript
// Add one entry to S{}:
CLS: {
  n: 'Celestica Inc',
  px: '$82.40', ch: 1.24, mc: 12.4, ms: '$12.4B',
  pe: 18.2, eps: 4.53, be: 1.38,
  vl: '1M', av: '1M', hi: '$96', lo: '$28', op: '$81',
  rt: 'Buy', rs: [6,8,4,1,0], an: 18,
  tags: ['AI','SERVERS'],
  ytd: 82, rev: 8.4, net: .38
},
```

Then add the ticker key to the relevant layer in `data/sectors.js` or `data/themes.js`. Nothing else changes.

### Edit a Ticker's Price or Data

**File:** `data/stocks.js` only. Find the key, edit the field. One line change.

### Add a New Sector Pyramid

**File:** `data/sectors.js` only. Add one object to `PYRAMIDS`:

```javascript
DEFENSE: {
  type: 'pyramid',
  label_full: 'DEFENSE SUPPLY CHAIN',
  layers: [
    { id: 'prime',      name: 'Prime Contractors', theme: '...', stocks: ['LMT','RTX','NOC'] },
    { id: 'systems',    name: 'C4ISR Systems',      theme: '...', stocks: ['LHX','LDOS'] },
    { id: 'components', name: 'Components',         theme: '...', stocks: ['HEICO'], up: true },
  ]
},
```

Add the pill label and accent color in `app/state.js`: **`SEC_LABELS`** (header pill text) and **`SEC_COLORS`** (sector tint for spills/bands). `nav.js` builds pills from `PYRAMIDS` keys automatically.

### Add a New Theme

**File:** `data/themes.js` only. Add one object to `THEMES_DATA`:

```javascript
AI_POWER: {
  type: 'pyramid',
  label: 'AI POWER',
  label_full: 'AI POWER PLAY',
  color: '#22d3ee',
  layers: [
    { id: 'demand',  name: 'AI Demand Anchor', theme: 'Hyperscalers pulling 50GW+ by 2030', stocks: ['GOOGL','MSFT','META'] },
    { id: 'nuclear', name: 'Nuclear Baseload',  theme: '24/7 carbon-free baseload',          stocks: ['CEG','VST','CCJ'] },
    { id: 'grid',    name: 'Grid & Conversion', theme: 'Transformers, switchgear, cooling',  stocks: ['ETN','VRT','MPWR'] },
  ]
},
```

Nothing else changes. The render engine reads `layers` from whatever config is active.

### Helpers (utils.js)

- **`sectorMcapWeights(tickerKeys)`** — `{ totalMc, map }` where `map[tk]` = cap-weight % of universe Mcap (custom index weight).
- **`maxMcapWeightTicker(tickerKeys)`** — `{ tk, w }` largest single-name weight (summary bar **Idx max**).

### Fix or Upgrade a View

Edit only the relevant `views/view-*.js`:

- WHEEL scatter / tooltip / legend → `views/view-wheel.js` (uses `idxW` on hover; legend **AXES** block)
- Pyramid band header overlapping → `views/view-pyramid.js`
- Add YTD column to screener → `views/view-screener.js`
- Intelligence tab changes → `views/view-news.js`

Each view is stateless — reads global state, writes to target element, no side effects.

### Change Styling

**File:** `nexus.css` only.

Class naming convention:
- `.band-*` — pyramid band header area
- `.tile-*` — individual stock tile (pyramid); commodity grid uses `.flat-tile` but shares `.tile-px` / `.tile-ch`
- `.tile-mets` — 2×2 metric grid at tile bottom
- `.sankey-wrap.sec-AI` — AI-only wider pyramid tiles + horizontal band scroll (does not change global `.tile` rules for other tabs)
- `.wheel-*` — wheel scatter view
- `.rp-*` — right panel
- `.wl-*` — watchlist left panel
- `.sb-*` — summary bar
- `.nm-*` — nav mode toggle (SECTORS / THEMES)

---

## Data Schemas

### Stock Entry (stocks.js)

```javascript
TICKER: {
  n:   'Company Full Name',     // string
  px:  '$000.00',               // display price string (with $ and commas)
  ch:  0.00,                    // today % change float (2.84 = +2.84%)
  mc:  000,                     // market cap in $B float
  ms:  '$000B',                 // market cap display string
  pe:  00.0,                    // P/E ratio float (null if loss/N/A)
  eps: 0.00,                    // EPS dollars float (negative = loss)
  be:  0.00,                    // beta float
  vl:  '00M',                   // volume display string
  av:  '00M',                   // avg volume display string
  hi:  '$000',                  // 52W high display string
  lo:  '$000',                  // 52W low display string
  op:  '$000',                  // open price display string
  rt:  'Strong Buy',            // analyst rating: Strong Buy | Buy | Hold | Sell
  rs:  [sb, b, h, s, ss],      // rating count array [5 ints]
  an:  00,                      // total analyst count int
  tags: ['TAG1','TAG2'],        // uppercase tag strings array
  ytd: 00,                      // YTD % return float (85 = +85%, -42 = -42%)
  rev: 00,                      // Annual revenue $B float (null for ETFs)
  net: 00,                      // Net income $B float (negative = loss, null for ETFs)
}
```

### Sector Pyramid (sectors.js)

```javascript
KEY: {
  type: 'pyramid',              // 'pyramid' | 'flat'
  label_full: 'DISPLAY NAME',   // shown in summary bar
  layers: [
    {
      id:     'layer-id',       // unique slug, used for WL_LAYERS state tracking
      name:   'Layer Name',     // band header title
      theme:  'Narrative · Key · Context',  // band header subtitle (wraps, visible)
      stocks: ['TK1', 'TK2'],   // ticker keys — must exist in stocks.js
      up:     true,             // optional — marks upstream (dashed border)
    },
    // ... top to bottom (applications at top, raw materials at bottom)
  ]
}
```

Flat type (commodity grids):
```javascript
KEY: {
  type: 'flat',
  label_full: 'DISPLAY NAME',
  categories: [
    { id: 'cat-id', name: 'CATEGORY', desc: 'Description text', stocks: ['TK1','TK2'] }
  ]
}
```

### Theme Config (themes.js)

Same as pyramid, plus:
```javascript
KEY: {
  ...same as pyramid...,
  label: 'SHORT LABEL',         // pill button label (5 chars max works best)
  color: '#f59e0b',             // hex accent color — overrides blue for this theme
}
```

---

## State Variables (app/state.js)

```javascript
CUR          // active sector key:  'AI' | 'SPACE' | 'QUANTUM' | 'PHOTONIC' | 'SEMICONDUCTOR' | 'NUCLEAR' | 'COMMODITY'
CUR_THEME    // active theme key:   'NVIDIA' | etc.
NAV_MODE     // navigation mode:    'sectors' | 'themes'
CTAB         // center tab:         'pyramid' | 'wheel' | 'fundamentals' | 'news'
RPTAB        // right panel tab:    'chart' | 'data' | 'news'
SEL_STOCK    // selected ticker key (string) or null
SEL_LAYER    // selected layer id (string) or null
SORT_COL     // screener sort:      'mc' | 'ch' | 'ytd' | 'pe' | 'tk'
SORT_DIR     // sort direction:     'asc' | 'desc'
WL_OPEN      // watchlist visible:  bool
WL_LAYERS    // {layerId: bool}     watchlist section collapse state
NEWS_SRC     // news source:        'tv' | 'finnhub' | 'sec'
```

Key helpers (state.js):
```javascript
getCurrentP()        // PYRAMIDS[CUR] or THEMES_DATA[CUR_THEME] based on NAV_MODE
getActiveColor()     // hex accent color for current active key
getActiveStocks()    // all ticker keys in current pyramid/theme (deduped)
```

---

## Render Flow

```
User interaction (click, select, sort)
    ↓
nav.js: setSector() / setTheme() / setNavMode()
    ↓ mutates state variables
app.js: renderCenter()  ─────────────────────────────────────┐
    │                                                         │
    ├─ getCurrentP().type === 'flat' → view-flat.js           │
    ├─ CTAB === 'pyramid'            → view-pyramid.js        │
    ├─ CTAB === 'wheel'              → view-wheel.js          │
    ├─ CTAB === 'fundamentals'       → view-screener.js       │
    └─ CTAB === 'news'              → view-news.js            │
                                                              │
app.js: renderWatchlist()   → watchlist.js                    │
app.js: renderRightPanel()  → rightpanel.js  ←────────────────┘
```

View functions are pure: `render(el, pyramid, color, state) → void`. They write into `el`, never modify state.

---

## Design System — Midnight Pro (LOCKED)

Do not change until major version.

```css
--bg:  #0c0e18   /* page background */
--s1:  #111421   /* panel / header background */
--s2:  #161b2e   /* card / tile background */
--s3:  #1c223a   /* input / hover background */
--s4:  #222a48   /* active / selected */
--acc: #3d9aff   /* primary blue accent */
--up:  #00c97a   /* green / positive */
--dn:  #ff4757   /* red / negative */
--warn:#f5a623   /* amber / caution */
```

Fonts: `Barlow Condensed` (labels, headers, tickers), `IBM Plex Mono` (numbers, data), `Barlow` (prose)

Sector accent colors — used for `.spill.on`, band borders, selected tile borders:
```
AI:            #4d9fff
SPACE:         #a78bfa
QUANTUM:       #34d399
PHOTONIC:      #fb923c
SEMICONDUCTOR: #fbbf24
NUCLEAR:       #ef4444
COMMODITY:     #22d3ee
NVIDIA theme:  #f59e0b
```

---

## Current Universe (May 2026)

### AI (7 layers, 32 tickers)
Apps: PLTR, CRM, NOW, CRWV, DELL
LLMs: GOOGL, META, MSFT, AMZN
Compute: NVDA, AMD, AVGO, TSM, MU, ARM
Network: ANET, MRVL, CIEN, CRDO
Power: VRT, ETN, CEG, VST, MPWR
Storage: STX, WDC, SNDK, EQIX, DLR
Upstream: ASML, AMAT, LRCX, KLAC, ENTG, AMKR

### SPACE (5 layers, 12 tickers)
Apps: LHX, LDOS, BAH, IRDM | Satellites: ASTS, PL | Launch: RKLB
Prime: LMT, BA, RTX, NOC | Materials: MP

### QUANTUM (4 layers, 7 tickers)
Cloud: IBM, MSFT, AMZN | QPU: IONQ, RGTI, QBTS, QUBT
Security: ARQQ | Instruments: OXIG

### PHOTONIC (4 layers, 8 tickers)
Systems: COHR, VIAV, LITE, ALAB | PICs: COHR, AAOI
Lasers: LITE, VECO | Equipment: ACLS, ONTO

### SEMICONDUCTOR (6 layers, 22 tickers)
Design: NVDA, AMD, QCOM, MRVL, ARM, MCHP | EDA: SNPS, CDNS
IDM: INTC, TXN, STM, ON | Foundry: TSM, GFS, UMC, TSEM
Equipment: ASML, AMAT, LRCX, KLAC, ONTO, ACLS | Packaging: AMKR, ENTG, MKSI, CMC

### NUCLEAR (4 layers)
Utilities: CEG, VST | Infrastructure: ETN, VRT, MPWR | Fuel cycle: CCJ, URA | Upstream inputs: COPX, CPER, MP2

### COMMODITY (flat — multiple categories)
Energy: CCJ, URA, USO | Precious: GLD, SLV, PPLT | Industrial metals: COPX, CPER, MP2 | Battery / lithium: ALB, LTHM, LAC | Agriculture: DBA | Broad basket: DBC

### THEMES
NVIDIA Ecosystem (7 layers): CRWV, DELL, META, GOOGL, MSFT, AMZN / NVDA / AMD, AVGO, ARM / MU, SNDK, WDC, STX / ANET, COHR, LITE, CIEN, CRDO / VRT, ETN, MPWR, CEG / ASML, LRCX, KLAC, AMAT, TSM, AMKR

---

## Phase Roadmap

### Phase 1A — Modular Split (DONE — baseline in repo)
Modular `data/` / `views/` / `app/` + `index.html` / `nexus.css` structure is the working codebase.

### Phase 1B — v8 Features (file by file, isolated)
- `data/stocks.js` — add ytd/rev/net to all stocks
- `data/sectors.js` — remove multiLayer from all configs
- `data/themes.js` — NVIDIA Ecosystem config (already drafted)
- `views/view-pyramid.js` — tile-mets 2x2 grid, band header visible fix
- `views/view-wheel.js` — NEW: bubble scatter (YTD x PE x MCap x today%)
- `views/view-screener.js` — add YTD sortable column
- `app/nav.js` — SECTORS / THEMES toggle in header
- `app/rightpanel.js` — Revenue, Net Income, YTD row in DATA tab
- `nexus.css` — WHEEL styles, tile-mets, band header overflow fix

### Phase 2 — Live Data
- **Done (partial):** `app/finnhub-config.js` + `app/live-prices.js` — REST quote sweep + optional WebSocket; DOM updates for tiles/screener; `getFinnhubSymbol()` in `utils.js`
- **Planned:** `app/api-fmp.js` (or similar) — Financial Modeling Prep historical data
- **Optional:** Vercel serverless proxy to hide Finnhub key; richer Finnhub endpoints (fundamentals, sentiment) in UI
- Update: `data/stocks.js` — optional `finnhubId` per ticker if symbol mapping outgrows `getFinnhubSymbol()`

### Phase 3 — Intelligence Layer
- New: `app/api-perplexity.js` — Sonar Pro research integration
- New: `app/api-sec.js` — EDGAR Form 4 / 8-K
- New: `views/view-compare.js` — side-by-side stock analysis tab
- Files affected: 3 new files. Existing files untouched.

---

## API Integration Status

| API | Status | Purpose | Target File |
|-----|--------|---------|-------------|
| TradingView Widgets | Live | Charts + news | rightpanel.js, view-news.js |
| Finnhub | Partial | Live tile prices (REST + optional WS) | `live-prices.js`, `finnhub-config.js`; full API surface still Phase 2 |
| Financial Modeling Prep | Phase 2 | Historical PE + revenue | api-fmp.js |
| Perplexity Sonar Pro | Phase 3 | AI research Q&A | api-perplexity.js |
| SEC EDGAR | Phase 3 | Form 4, 8-K filings | api-sec.js |

---

## Token Window — Honest Assessment

### The Problem (monolithic approach)
Reading nexus-v7.html = 94KB = ~23K tokens consumed before any work starts.
As the file grows each version, this cost compounds. By v12, reading the file alone
would consume 35-40K tokens, leaving little room for actual generation.

### Solution (modular approach)

| Task | Monolith cost | Modular cost | Improvement |
|------|--------------|--------------|-------------|
| Fix WHEEL view bug | 23K tokens | 3K (view-wheel.js) | 7.7x |
| Add new ticker | 23K tokens | 2K (stocks.js) | 11.5x |
| Add new theme | 23K tokens | 2K (themes.js) | 11.5x |
| Upgrade right panel | 23K tokens | 4K (rightpanel.js) | 5.75x |
| Full feature review | 23K tokens | 8-10K (select files) | 2.5x |

### Session Start Protocol (every future session)
1. Read AGENT-GUIDE.md — architecture context (~4K tokens)
2. State the task explicitly
3. Read only the 1-2 files relevant to that task
4. Make the targeted change
5. Verify that file in isolation before shipping

Never read the full codebase unless doing a cross-cutting architectural review.

### Context Budget Per Session (estimated, 200K window)
- AGENT-GUIDE.md: ~4K
- Conversation history / compacted summary: ~3-5K
- Target file(s): 2-5K
- Generation: 5-10K
- Total used: ~15-25K (well within limits, vs 40-60K for monolith sessions)

---

## Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Multi-layer system | Removed | No UX payoff without dedicated relationship view. Phase 2. |
| Heatmap tab | Replaced by WHEEL | 4D scatter (YTD/PE/MCap/today%) more actionable than 1D color |
| Theme: Midnight Pro | Locked | No changes until major version. |
| Sankey band width | sqrt(layer MCap) → 54–96% | Visual weight of each supply-chain tier |
| Pyramid tile width | `--py-tile-w` (~114px) | Uniform stock cards; `band-tiles` scrolls when row is narrower than content |
| Screener default sort | Market cap descending | Largest/most relevant first |
| File generation | Modular, max 120 lines/file | Avoids truncation, enables targeted edits |
| Tile prices | Static + optional Finnhub | Default: `stocks.js`. With key: `live-prices.js` overwrites px/ch via DOM patch. |

---

## Vercel Deployment Notes

Free tier, no build step required. Pure HTML/CSS/JS, zero dependencies except:
- Google Fonts (CDN, loaded in index.html)
- TradingView widgets (CDN scripts, loaded on demand in rightpanel.js and view-news.js)

All JS files loaded as `<script src="...">` in index.html. Order matters:
```html
<!-- Data first -->
<script src="data/stocks.js"></script>
<script src="data/sectors.js"></script>
<script src="data/themes.js"></script>
<!-- Utilities + optional live quotes -->
<script src="app/utils.js"></script>
<script src="app/state.js"></script>
<script src="app/finnhub-config.js"></script>
<script src="app/live-prices.js"></script>
<!-- Views -->
<script src="views/view-pyramid.js"></script>
<script src="views/view-wheel.js"></script>
<script src="views/view-screener.js"></script>
<script src="views/view-news.js"></script>
<script src="views/view-flat.js"></script>
<!-- App coordination last -->
<script src="app/nav.js"></script>
<script src="app/watchlist.js"></script>
<script src="app/rightpanel.js"></script>
<script src="app/app.js"></script>
```
