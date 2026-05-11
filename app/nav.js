// NEXUS — Navigation
// Owns header pill row, sector switching, mode toggle (Phase 1B), clock, font scale.
// After any nav change: fires renderSummaryBar + renderWatchlist + renderCenter + renderRightPanel.

function setSectorCSS(key){
  const c=(NAV_MODE==='themes'?THEMES_DATA[key]?.color:null)||secColor(key);
  const r=document.documentElement.style;
  r.setProperty('--sec',c);
  r.setProperty('--sec-lo',c+'18');
  r.setProperty('--sec-glo',c+'32');
}

function buildPills(){
  if(NAV_MODE==='themes'){
    document.getElementById('spills').innerHTML=Object.keys(THEMES_DATA).map(k=>
      `<button class="spill${k===CUR_THEME?' on':''}" onclick="setTheme('${k}',this)">${THEMES_DATA[k].label}</button>`
    ).join('');
  } else {
    document.getElementById('spills').innerHTML=Object.keys(PYRAMIDS).map(s=>
      `<button class="spill${s===CUR?' on':''}" onclick="setSector('${s}',this)">${SEC_LABELS[s]||s}</button>`
    ).join('');
  }
}

function setNavMode(mode,btn){
  NAV_MODE=mode; SEL_STOCK=null; SEL_LAYER=null;
  document.querySelectorAll('.nm-btn').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  const key=mode==='themes'?CUR_THEME:CUR;
  setSectorCSS(key);
  buildPills();
  renderSummaryBar(); renderWatchlist(); renderCenter(); renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.refreshNow();
}

function setTheme(key,btn){
  CUR_THEME=key; SEL_STOCK=null; SEL_LAYER=null;
  setSectorCSS(key);
  document.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar(); renderWatchlist(); renderCenter(); renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.refreshNow();
}

function setSector(sec,btn){
  CUR=sec; SEL_STOCK=null; SEL_LAYER=null;
  setSectorCSS(sec);
  document.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderSummaryBar(); renderWatchlist(); renderCenter(); renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.refreshNow();
}

function setCTab(tab,btn){
  CTAB=tab;
  document.querySelectorAll('.ctab').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  renderCenter(); renderRightPanel();
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
