// NEXUS — Application State
// All state variables live here. Render functions read these. Only nav.js and app.js write them.
// getAllStocks() is here because it reads PYRAMIDS (data layer).

const SEC_COLORS={
  AI:'#4d9fff',SPACE:'#a78bfa',QUANTUM:'#34d399',
  PHOTONIC:'#fb923c',SEMICONDUCTOR:'#fbbf24',NUCLEAR:'#ef4444',COMMODITY:'#22d3ee'
};
const SEC_LABELS={
  AI:'AI',SPACE:'SPACE',QUANTUM:'QUANTUM',
  PHOTONIC:'PHOTONIC',SEMICONDUCTOR:'SEMI',NUCLEAR:'NUCLEAR',COMMODITY:'COMM'
};

// Active sector / tab / selection
let CUR='AI';
let CTAB='pyramid';
let RPTAB='chart';
let SEL_STOCK=null;
let SEL_LAYER=null;

// Screener sort
let SORT_COL='ch';
let SORT_DIR='desc';

// UI state
let WL_OPEN=true;
let NEWS_SRC='tv';
let TRAJ_PER=8;
const WL_LAYERS={};  // {layerId: bool} — watchlist section expand/collapse

// Navigation mode — 'sectors' | 'themes'
let NAV_MODE='sectors';
let CUR_THEME='NVIDIA';

// Returns the active pyramid config (sector or theme)
function getCurrentP(){
  return NAV_MODE==='themes'?THEMES_DATA[CUR_THEME]:PYRAMIDS[CUR];
}

// Returns active accent color
function getActiveColor(){
  if(NAV_MODE==='themes') return THEMES_DATA[CUR_THEME]?.color||'#f59e0b';
  return secColor(CUR);
}

// Returns all ticker keys for the active pyramid (deduped)
function getActiveStocks(){
  const p=getCurrentP(); if(!p) return [];
  if(p.type==='flat') return p.categories.flatMap(c=>c.stocks);
  return [...new Set(p.layers.flatMap(l=>l.stocks))];
}

// Returns all ticker keys for a specific sector (used by screener + watchlist sector mode)
function getAllStocks(sec){
  const p=PYRAMIDS[sec]; if(!p) return [];
  if(p.type==='flat') return p.categories.flatMap(c=>c.stocks);
  return [...new Set(p.layers.flatMap(l=>l.stocks))];
}
