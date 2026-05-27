// NEXUS — Navigation
// Owns header pill row, sector switching, mode toggle (Phase 1B), clock, font scale.
// After any nav change: fires renderSummaryBar + renderWatchlist + renderCenter + renderRightPanel.

function setSectorCSS(key){
  let c;
  if(NAV_MODE==='etf') c=ETF_SECTORS[key]?.color||'#3d9aff';
  else if(NAV_MODE==='themes') c=THEMES_DATA[key]?.color||'#f59e0b';
  else c=secColor(key);
  const r=document.documentElement.style;
  r.setProperty('--sec',c);
  r.setProperty('--sec-lo',c+'18');
  r.setProperty('--sec-glo',c+'32');
}

function updateCenterTabsForMode(){
  const cz=document.querySelector('.ctabs');
  if(!cz) return;
  cz.style.display=NAV_MODE==='etf'?'none':'flex';
}

function buildPills(){
  if(NAV_MODE==='etf'){
    document.getElementById('spills').innerHTML=Object.keys(ETF_SECTORS).map(k=>
      `<button class="spill${k===CUR_ETF?' on':''}" onclick="setEtfSector('${k}',this)">${ETF_SECTORS[k].label}</button>`
    ).join('');
  } else if(NAV_MODE==='themes'){
    document.getElementById('spills').innerHTML=Object.keys(THEMES_DATA).map(k=>
      `<button class="spill${k===CUR_THEME?' on':''}" onclick="setTheme('${k}',this)">${THEMES_DATA[k].label}</button>`
    ).join('');
  } else {
    document.getElementById('spills').innerHTML=Object.keys(PYRAMIDS).map(s=>
      `<button class="spill${s===CUR?' on':''}" onclick="setSector('${s}',this)">${SEC_LABELS[s]||s}</button>`
    ).join('');
  }
}

function defaultEtfForSector(secKey){
  const sec=ETF_SECTORS[secKey];
  if(!sec||!sec.etfs) return null;
  const ids=Object.keys(sec.etfs);
  return ids[0]||null;
}

function setEtfSector(key,btn){
  CUR_ETF=key;
  SEL_ETF=defaultEtfForSector(key);
  SEL_STOCK=null;
  SEL_LAYER=null;
  setSectorCSS(key);
  document.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar();
  renderWatchlist();
  renderCenter();
  renderRightPanel();
}

function setNavMode(mode,btn){
  NAV_MODE=mode;
  SEL_STOCK=null;
  SEL_LAYER=null;
  document.querySelectorAll('.nm-btn').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  if(mode==='etf'){
    if(!ETF_SECTORS[CUR_ETF]) CUR_ETF=Object.keys(ETF_SECTORS)[0];
    SEL_ETF=defaultEtfForSector(CUR_ETF);
    setSectorCSS(CUR_ETF);
  }else{
    const key=mode==='themes'?CUR_THEME:CUR;
    setSectorCSS(key);
  }
  updateCenterTabsForMode();
  buildPills();
  renderSummaryBar();
  renderWatchlist();
  renderCenter();
  renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.resubscribe();
}

function setTheme(key,btn){
  CUR_THEME=key; SEL_STOCK=null; SEL_LAYER=null;
  setSectorCSS(key);
  document.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar(); renderWatchlist(); renderCenter(); renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.resubscribe();
}

function setSector(sec,btn){
  CUR=sec; SEL_STOCK=null; SEL_LAYER=null;
  setSectorCSS(sec);
  document.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar(); renderWatchlist(); renderCenter(); renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.resubscribe();
}

function setCTab(tab,btn){
  CTAB=tab;
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar();
  renderCenter(); renderRightPanel();
  if(window.NexusLivePrices&&NexusLivePrices.isActive()) NexusLivePrices.refreshVisible();
}

function toggleWL(){
  WL_OPEN=!WL_OPEN;
  document.getElementById('shell').classList.toggle('wl-off',!WL_OPEN);
}

function adjFS(d){
  const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fs')||1);
  document.documentElement.style.setProperty('--fs',Math.max(.7,Math.min(1.5,v+d)));
}

// Live clock — ET timezone
setInterval(()=>{
  document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-US',{
    hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'America/New_York'
  })+' ET';
},1000);
