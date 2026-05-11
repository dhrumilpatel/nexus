// NEXUS — Live quotes via Finnhub (REST + optional WebSocket).
// Finnhub free tier: 60 REST calls/minute — we space /quote requests by REST_GAP_MS.
// Price updates patch DOM only (data-nexus-tk) so the pyramid layout does not rebuild every tick.
// Config: app/finnhub-config.js — NEXUS_FINNHUB_KEY, NEXUS_FINNHUB_POLL_MS, NEXUS_FINNHUB_USE_WS

(function(){
  const WS_BASE='wss://ws.finnhub.io?token=';
  const REST_GAP_MS=1100;

  let ws=null;
  let pollTimer=null;
  let pollBusy=false;
  let wheelRedrawTimer=null;
  let sideRaf=null;
  const subscribed=new Set();
  const quoteCache={};

  function key(){ return typeof window.NEXUS_FINNHUB_KEY==='string'?window.NEXUS_FINNHUB_KEY.trim():''; }
  function pollMs(){ const n=+window.NEXUS_FINNHUB_POLL_MS; return n>=60000?n:300000; }
  function useWs(){ return window.NEXUS_FINNHUB_USE_WS===true; }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  function layersWithTicker(tk){
    if(typeof getCurrentP!=='function') return [];
    const p=getCurrentP();
    if(!p||p.type!=='pyramid'||!p.layers) return [];
    return p.layers.filter(l=>l.stocks.includes(tk)).map(l=>l.id);
  }

  function refreshBandHeaderForLayer(lid){
    if(typeof getCurrentP!=='function'||typeof layerAgg!=='function') return;
    const p=getCurrentP();
    if(!p||p.type!=='pyramid'||!p.layers) return;
    const layer=p.layers.find(l=>l.id===lid);
    if(!layer) return;
    const band=document.querySelector(`#cc [data-lid="${lid}"]`);
    if(!band) return;
    const agg=layerAgg(layer);
    const mc=band.querySelector('.bh-mc');
    const pe=band.querySelector('.bh-pe');
    const ch=band.querySelector('.bh-ch');
    if(mc) mc.textContent='$'+fmtB(agg.mc);
    if(pe) pe.textContent=agg.avgPE?'P/E '+agg.avgPE.toFixed(0)+'x':'—';
    if(ch){
      ch.textContent=pct(agg.avgCh,1);
      ch.className='bh-ch '+(agg.avgCh>=0?'up':'dn');
    }
  }

  function patchTickerInDom(tk){
    if(typeof S==='undefined'||!S[tk]) return;
    const st=S[tk];
    document.querySelectorAll(`[data-nexus-tk="${tk}"]`).forEach(node=>{
      if(node.tagName==='TR'){
        const ch=node.querySelector('.ft-today');
        const px=node.querySelector('.ft-price');
        if(ch){
          ch.textContent=pct(st.ch);
          ch.className='ft-today '+(st.ch>=0?'ft-up':'ft-dn');
        }
        if(px) px.textContent=st.px;
        return;
      }
      const pxEl=node.querySelector('.tile-px');
      const chEl=node.querySelector('.tile-ch');
      if(pxEl) pxEl.textContent=st.px;
      if(chEl){
        chEl.textContent=pct(st.ch);
        chEl.className='tile-ch '+(st.ch>=0?'up':'dn');
      }
    });
    layersWithTicker(tk).forEach(refreshBandHeaderForLayer);
  }

  function scheduleSidebarRenders(){
    if(sideRaf) return;
    sideRaf=requestAnimationFrame(()=>{
      sideRaf=null;
      try{
        if(typeof renderWatchlist==='function') renderWatchlist();
        if(typeof renderSummaryBar==='function') renderSummaryBar();
        if(typeof renderRightPanel==='function'&&typeof SEL_STOCK!=='undefined'&&SEL_STOCK) renderRightPanel();
      }catch(e){}
    });
  }

  function maybeRedrawWheel(){
    if(typeof CTAB==='undefined'||CTAB!=='wheel') return;
    clearTimeout(wheelRedrawTimer);
    wheelRedrawTimer=setTimeout(()=>{
      wheelRedrawTimer=null;
      if(typeof renderCenter==='function') renderCenter();
    },useWs()?900:0);
  }

  function applyQuote(tk,j){
    const st=S[tk];
    if(!st||j.c==null) return;
    const c=Number(j.c), pc=j.pc!=null?Number(j.pc):null;
    st.px='$'+c.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(typeof j.dp==='number'&&!Number.isNaN(j.dp)) st.ch=j.dp;
    else if(pc&&pc>0) st.ch=(c-pc)/pc*100;
    const sym=getFinnhubSymbol(tk);
    quoteCache[sym]={pc:pc||quoteCache[sym]?.pc,c};
  }

  function fetchQuote(tk){
    const k=key();
    if(!k||typeof S==='undefined'||!S[tk]) return Promise.resolve();
    const sym=getFinnhubSymbol(tk);
    return fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(k)}`)
      .then(r=>r.ok?r.json():null)
      .then(j=>{ if(j) applyQuote(tk,j); })
      .catch(()=>{});
  }

  function tkFromFeedSymbol(sym){
    if(sym==null||typeof S==='undefined') return null;
    const u=String(sym).toUpperCase();
    for(const tk of Object.keys(S)){
      if(getFinnhubSymbol(tk).toUpperCase()===u) return tk;
    }
    return null;
  }

  async function runPollSweep(){
    if(!key()||pollBusy) return;
    if(typeof getActiveStocks!=='function') return;
    pollBusy=true;
    try{
      const list=getActiveStocks();
      for(let i=0;i<list.length;i++){
        await fetchQuote(list[i]);
        patchTickerInDom(list[i]);
        await sleep(REST_GAP_MS);
      }
      scheduleSidebarRenders();
      if(typeof CTAB!=='undefined'&&CTAB==='wheel'&&typeof renderCenter==='function') renderCenter();
    }finally{
      pollBusy=false;
    }
  }

  function subscribeAll(){
    if(!ws||ws.readyState!==WebSocket.OPEN||typeof S==='undefined') return;
    const seen=new Set();
    Object.keys(S).forEach(tk=>{
      const sym=getFinnhubSymbol(tk);
      if(seen.has(sym)) return;
      seen.add(sym);
      if(subscribed.has(sym)) return;
      subscribed.add(sym);
      ws.send(JSON.stringify({type:'subscribe',symbol:sym}));
    });
  }

  function onWsMessage(ev){
    if(ev.data==='ping'){ ws.send('pong'); return; }
    let data;
    try{ data=JSON.parse(ev.data); }catch(e){ return; }
    if(data.type==='ping'){ ws.send(JSON.stringify({type:'pong'})); return; }
    if(data.type!=='trade'||!Array.isArray(data.data)) return;
    data.data.forEach(t=>{
      if(t.p==null) return;
      const tk=tkFromFeedSymbol(t.s);
      if(!tk||!S[tk]) return;
      const p=Number(t.p);
      S[tk].px='$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
      const sym=getFinnhubSymbol(tk);
      const qc=quoteCache[sym];
      if(qc&&qc.pc) S[tk].ch=(p-qc.pc)/qc.pc*100;
      patchTickerInDom(tk);
    });
    scheduleSidebarRenders();
    maybeRedrawWheel();
  }

  function connectWs(){
    const k=key();
    if(!k||!useWs()) return;
    subscribed.clear();
    ws=new WebSocket(WS_BASE+encodeURIComponent(k));
    ws.onopen=()=>{
      subscribeAll();
      runPollSweep();
    };
    ws.onmessage=onWsMessage;
    ws.onclose=()=>{ ws=null; if(useWs()) setTimeout(connectWs,3000); };
    ws.onerror=()=>{ try{ ws.close(); }catch(e){} };
  }

  window.NexusLivePrices={
    start(){
      if(!key()){
        console.info('[Nexus] Finnhub: set NEXUS_FINNHUB_KEY in app/finnhub-config.js');
        return;
      }
      window.NexusLivePrices.stop();
      runPollSweep();
      pollTimer=setInterval(runPollSweep,pollMs());
      if(useWs()) connectWs();
    },
    stop(){
      if(pollTimer){ clearInterval(pollTimer); pollTimer=null; }
      clearTimeout(wheelRedrawTimer);
      wheelRedrawTimer=null;
      subscribed.clear();
      if(ws){ try{ ws.close(); }catch(e){} ws=null; }
    },
    resubscribe(){
      if(useWs()&&ws&&ws.readyState===WebSocket.OPEN){
        subscribed.clear();
        subscribeAll();
      }
    },
    refreshNow(){ runPollSweep(); }
  };
})();
