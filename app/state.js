// NEXUS — Application State
// All state variables live here. Render functions read these. Only nav.js and app.js write them.
// getAllStocks() is here because it reads PYRAMIDS (data layer).

const SEC_COLORS={
  AI:'#4d9fff',SPACE:'#a78bfa',QUANTUM:'#34d399',
  PHOTONIC:'#fb923c',CYBER:'#a855f7',ROBOTICS:'#22c55e',SEMICONDUCTOR:'#fbbf24',NUCLEAR:'#ef4444',COMMODITY:'#22d3ee'
};
const SEC_LABELS={
  AI:'AI',SPACE:'SPACE',QUANTUM:'QUANTUM',
  PHOTONIC:'PHOTONICS',CYBER:'CYBER',ROBOTICS:'ROBOTICS',SEMICONDUCTOR:'SEMI CONDUCTORS',NUCLEAR:'NUCLEAR',COMMODITY:'COMM'
};

// Active sector / tab / selection
let CUR='AI';
let CTAB='dashboard';
/** Sankey center tab only: link widths from Mcap ($B) or Revenue ($B). */
let SANKEY_WEIGHT='mcap';
try{
  const _sw=sessionStorage.getItem('nexus_sankey_w');
  if(_sw==='mcap'||_sw==='rev') SANKEY_WEIGHT=_sw;
}catch(e){}
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

// Navigation mode — 'sectors' | 'themes' | 'etf'
let NAV_MODE='sectors';
let CUR_THEME='NVIDIA';
let CUR_ETF='SPACE';
let SEL_ETF='TEMA_SPACE';

// Returns the active pyramid config (sector or theme); null in ETF mode
function getCurrentP(){
  if(NAV_MODE==='etf') return null;
  return NAV_MODE==='themes'?THEMES_DATA[CUR_THEME]:PYRAMIDS[CUR];
}

function getEtfSector(){
  if(typeof ETF_SECTORS==='undefined'||!CUR_ETF) return null;
  return ETF_SECTORS[CUR_ETF]||null;
}

function getActiveEtf(){
  const sec=getEtfSector();
  if(!sec||!SEL_ETF||!sec.etfs) return null;
  return sec.etfs[SEL_ETF]||null;
}

function getActiveEtfHoldings(){
  const etf=getActiveEtf();
  if(!etf||!Array.isArray(etf.holdings)) return [];
  return etf.holdings.slice().sort((a,b)=>(b.weight||0)-(a.weight||0));
}

// Returns active accent color
function getActiveColor(){
  if(NAV_MODE==='etf'){
    const sec=getEtfSector();
    return sec?.color||'#3d9aff';
  }
  if(NAV_MODE==='themes') return THEMES_DATA[CUR_THEME]?.color||'#f59e0b';
  return secColor(CUR);
}

// Returns all ticker keys for the active universe (deduped)
function getActiveStocks(){
  if(NAV_MODE==='etf'){
    return [...new Set(getActiveEtfHoldings().map(h=>h.tk).filter(tk=>typeof S!=='undefined'&&S[tk]))];
  }
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
