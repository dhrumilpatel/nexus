// NEXUS — Application Coordinator
// Loaded last. Calls init() which bootstraps the entire app.
// Owns: renderSummaryBar, renderCenter dispatcher, all click handlers, Add Ticker modal.

function renderSummaryBar(){
  const p=getCurrentP();
  if(!p||(p.type==='flat'&&CTAB!=='dashboard')){document.getElementById('sumbar').innerHTML='';return;}
  const tks=getActiveStocks();
  const stks=tks.map(tk=>S[tk]).filter(Boolean);
  const mc=stks.reduce((a,s)=>a+(s.mc||0),0);
  const mx=maxMcapWeightTicker(tks);
  const pes=stks.filter(s=>s.pe).map(s=>s.pe);
  const avgPE=pes.length?pes.reduce((a,v)=>a+v,0)/pes.length:null;
  const avgCh=stks.reduce((a,s)=>a+s.ch,0)/(stks.length||1);
  const u=avgCh>=0;
  const revRows=stks.filter(s=>s.rev!=null&&typeof s.rev==='number');
  const avgRev=revRows.length?revRows.reduce((a,s)=>a+s.rev,0)/revRows.length:null;
  const revTitle=revRows.length?`Avg revenue $B (static) · ${revRows.length}/${stks.length} names with data`:'No revenue field on these names';
  const label=NAV_MODE==='themes'?(THEMES_DATA[CUR_THEME]?.label_full||CUR_THEME):PYRAMIDS[CUR]?.label_full||CUR;
  const idxLine=mx.w>0&&mx.tk?`<span class="sb-idx">Idx max ${mx.tk} ${mx.w.toFixed(1)}%</span>`:'<span class="sb-idx sb-idx-empty">&nbsp;</span>';
  document.getElementById('sumbar').innerHTML=`
    <div class="sb-item sb-item-stack sb-item-mcap">
      <div class="sb-mcap-row"><span class="sb-lbl">MCAP</span><span class="sb-val acc">$${fmtB(mc)}</span></div>
      <div class="sb-mcap-sub">${idxLine}</div>
    </div>
    <div class="sb-item"><span class="sb-lbl">AVG P/E</span><span class="sb-val acc">${avgPE?avgPE.toFixed(1)+'x':'N/A'}</span></div>
    <div class="sb-item sb-item-rev" title="${revTitle.replace(/"/g,'&quot;')}"><span class="sb-lbl">AVG REV</span><span class="sb-val acc">${avgRev!=null?'$'+avgRev.toFixed(1)+'B':'N/A'}</span>${revRows.length?`<span class="sb-rev-n">${revRows.length}/${stks.length}</span>`:''}</div>
    <div class="sb-item"><span class="sb-lbl">TODAY</span><span class="sb-val ${u?'up':'dn'}">${pct(avgCh)}</span></div>
    <div class="sb-item"><span class="sb-lbl">STOCKS</span><span class="sb-val">${stks.length}</span></div>
    <div class="sb-item sb-item-label"><span class="sb-lbl sb-lbl-sec">${label}</span></div>`;
}

function renderCenter(){
  const el=document.getElementById('cc');
  if(typeof nexusSankeyDispose==='function') nexusSankeyDispose(el);
  el.innerHTML='';
  const p=getCurrentP();
  if(CTAB==='dashboard')   {renderDashboardView(el);return;}
  if(CTAB==='sankey')      {renderSankeyFlowView(el);return;}
  if(p&&p.type==='flat')   {renderFlatView(el);return;}
  if(CTAB==='pyramid')     {renderPyramidView(el);return;}
  if(CTAB==='wheel')       {renderWheelView(el);return;}
  if(CTAB==='fundamentals'){renderFundamentalsView(el);return;}
  if(CTAB==='news')        {renderNewsView(el);return;}
}

function setSankeyWeight(w){
  if(w!=='mcap'&&w!=='rev') return;
  SANKEY_WEIGHT=w;
  try{ sessionStorage.setItem('nexus_sankey_w',w); }catch(e){}
  if(CTAB==='sankey') renderCenter();
}

// ── Click handlers ─────────────────────────────────────────────────────────────
function clickTile(e,tk){
  e?.stopPropagation?.();
  SEL_STOCK=tk; SEL_LAYER=null; RPTAB='chart';
  renderCenter(); renderWatchlist(); renderRightPanel();
}

function clickBand(e,lid){
  if(e?.target?.closest?.('.tile')) return;
  SEL_LAYER=SEL_LAYER===lid?null:lid; SEL_STOCK=null;
  renderCenter(); renderWatchlist(); renderRightPanel();
}

function clickTileByTk(tk){
  SEL_STOCK=tk; SEL_LAYER=null; RPTAB='chart';
  renderCenter(); renderWatchlist(); renderRightPanel();
}

// ── Add Ticker Modal ───────────────────────────────────────────────────────────
function openModal(){
  document.getElementById('modal').classList.add('on');
  updateLayerDD();
}

function closeModal(){
  document.getElementById('modal').classList.remove('on');
}

function fill(tk,nm,sec,layer){
  document.getElementById('m-tk').value=tk;
  document.getElementById('m-nm').value=nm;
  document.getElementById('m-sec').value=sec;
  updateLayerDD();
  if(layer){
    const sel=document.getElementById('m-layer');
    for(const o of sel.options){if(o.value===layer){o.selected=true;break;}}
  }
}

function updateLayerDD(){
  const sec=document.getElementById('m-sec').value, p=PYRAMIDS[sec];
  const wrap=document.getElementById('m-layerwrap'), sel=document.getElementById('m-layer');
  if(!p||p.type==='flat'){wrap.style.display='none';return;}
  wrap.style.display='block';
  sel.innerHTML=p.layers.map(l=>`<option value="${l.id}">${l.name}</option>`).join('');
}

function addTicker(){
  const tk=document.getElementById('m-tk').value.trim().toUpperCase();
  const nm=document.getElementById('m-nm').value.trim()||tk;
  const sec=document.getElementById('m-sec').value;
  const lid=document.getElementById('m-layer')?.value;
  if(!tk) return;
  if(!S[tk]) S[tk]={n:nm,px:'—',ch:+(Math.random()*8-2).toFixed(2),mc:.5,ms:'—',pe:null,eps:0,be:1,vl:'—',av:'—',hi:'—',lo:'—',op:'—',rt:'Hold',rs:[1,2,4,2,1],an:0,tags:[sec]};
  const p=PYRAMIDS[sec];
  if(p?.type==='pyramid'&&lid){const l=p.layers.find(x=>x.id===lid);if(l&&!l.stocks.includes(tk))l.stocks.push(tk);}
  else if(p?.type==='flat'){if(!p.categories[0].stocks.includes(tk))p.categories[0].stocks.push(tk);}
  closeModal();
  if(sec!==CUR) setSector(sec,null);
  else{renderCenter();renderWatchlist();renderSummaryBar();}
  if(window.NexusLivePrices) NexusLivePrices.resubscribe();
}

// Close modal on backdrop click
document.getElementById('modal').addEventListener('click',e=>{
  if(e.target===document.getElementById('modal')) closeModal();
});

// ── Bootstrap ──────────────────────────────────────────────────────────────────
function init(){
  buildPills();
  setSectorCSS('AI');
  renderSummaryBar();
  renderWatchlist();
  renderCenter();
  renderRightPanel();
  if(window.NexusLivePrices) NexusLivePrices.start();
}

init();
