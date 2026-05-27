// NEXUS — Live quotes via Finnhub (REST + optional WebSocket).
// Finnhub free tier: 60 REST calls/minute — we space /quote requests by REST_GAP_MS.
// Price updates patch DOM only (data-nexus-tk) so the pyramid layout does not rebuild every tick.
// Config: finnhub-config.js (poll, proxy, WS) + finnhub-key.js (key) or Vercel /api/finnhub

(function(){
  const REST_GAP_MS=1100;

  function api(){ return window.NexusFinnhubApi; }
  function finnhubActive(){ return api()&&api().active(); }
  function useWs(){ return api()&&api().useWs(); }

  let ws=null;
  let pollTimer=null;
  let pollBusy=false;
  let pendingResweep=false;
  let wheelRedrawTimer=null;
  let centerRedrawTimer=null;
  let sideRaf=null;
  const subscribed=new Set();
  const quoteCache={};

  function pollMs(){ const n=+window.NEXUS_FINNHUB_POLL_MS; return n>=60000?n:300000; }

  function setLiveStatus(mode){
    const lbl=document.getElementById('live-lbl');
    const txt=document.getElementById('live-txt');
    if(!lbl||!txt) return;
    lbl.classList.remove('live-static','live-sync');
    if(mode==='active'){
      txt.textContent='LIVE';
      lbl.title='Finnhub quotes active';
    }else if(mode==='sync'){
      lbl.classList.add('live-sync');
      txt.textContent='SYNC';
      lbl.title='Refreshing quotes…';
    }else{
      lbl.classList.add('live-static');
      txt.textContent='STATIC';
      lbl.title='Set FINNHUB_API_KEY on Vercel or NEXUS_FINNHUB_KEY in app/finnhub-key.js';
    }
  }

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
        const ch=node.querySelector('.ft-today')||node.querySelector('.wr-ch');
        const px=node.querySelector('.ft-price')||node.querySelector('.wr-px');
        if(ch){
          if(ch.classList.contains('ft-today')){
            ch.textContent=pct(st.ch);
            ch.className='ft-today '+(st.ch>=0?'ft-up':'ft-dn');
          }else{
            const isNum=ch.classList.contains('num');
            ch.textContent=pct(st.ch,isNum?2:1);
            const base=isNum?'wr-ch num ':'wr-ch ';
            ch.className=base+(st.ch>=0?'up':'dn');
          }
        }
        if(px) px.textContent=st.px;
        return;
      }
      const pxEl=node.querySelector('.tile-px')||node.querySelector('.wr-px');
      const chEl=node.querySelector('.tile-ch')||node.querySelector('.wr-ch');
      if(pxEl) pxEl.textContent=st.px;
      if(chEl){
        chEl.textContent=chEl.classList.contains('wr-ch')?pct(st.ch,1):pct(st.ch);
        chEl.className=(chEl.classList.contains('wr-ch')?'wr-ch ':'tile-ch ')+(st.ch>=0?'up':'dn');
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
    if(!st||j==null||j.c==null||j.c===0) return false;
    const c=Number(j.c), pc=j.pc!=null?Number(j.pc):null;
    st.px='$'+c.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(typeof j.dp==='number'&&!Number.isNaN(j.dp)) st.ch=j.dp;
    else if(pc&&pc>0) st.ch=(c-pc)/pc*100;
    st._livePx=true;
    const sym=getFinnhubSymbol(tk);
    quoteCache[sym]={pc:pc||quoteCache[sym]?.pc,c};
    return true;
  }

  function sortedActiveTickers(){
    if(typeof getActiveStocks!=='function') return [];
    const list=getActiveStocks();
    if(typeof S==='undefined') return list;
    return list.slice().sort((a,b)=>(S[b]?.mc||0)-(S[a]?.mc||0));
  }

  function scheduleCenterRefresh(){
    if(typeof CTAB==='undefined'||typeof renderCenter!=='function') return;
    if(CTAB!=='wheel') return;
    clearTimeout(centerRedrawTimer);
    centerRedrawTimer=setTimeout(()=>{
      centerRedrawTimer=null;
      renderCenter();
    },400);
  }

  function refreshDashboardIfActive(){
    if(typeof CTAB!=='undefined'&&CTAB==='dashboard'&&typeof renderCenter==='function') renderCenter();
  }

  function fetchQuote(tk){
    if(!finnhubActive()||typeof S==='undefined'||!S[tk]||!api()) return Promise.resolve(false);
    const sym=getFinnhubSymbol(tk);
    return api().fetchJson('quote',{symbol:sym}).then(j=>applyQuote(tk,j));
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
    if(!finnhubActive()) return;
    if(pollBusy){ pendingResweep=true; return; }
    if(typeof getActiveStocks!=='function') return;
    pollBusy=true;
    pendingResweep=false;
    setLiveStatus('sync');
    const PRIORITY_N=8;
    let updated=0;
    try{
      const list=sortedActiveTickers();
      for(let i=0;i<list.length;i++){
        const ok=await fetchQuote(list[i]);
        if(ok){
          updated++;
          patchTickerInDom(list[i]);
          if(updated===1) setLiveStatus('active');
        }
        if(i%2===0||i===list.length-1) scheduleSidebarRenders();
        if(i%4===0||i===list.length-1) scheduleCenterRefresh();
        if(i<PRIORITY_N-1) await sleep(200);
        else await sleep(REST_GAP_MS);
      }
      scheduleSidebarRenders();
      scheduleCenterRefresh();
      refreshDashboardIfActive();
      setLiveStatus(updated>0||finnhubActive()?'active':'static');
    }catch(e){
      setLiveStatus(finnhubActive()?'active':'static');
    }finally{
      pollBusy=false;
      if(pendingResweep) runPollSweep();
    }
  }

  function activeSymbols(){
    if(typeof getActiveStocks!=='function') return [];
    const seen=new Set();
    return getActiveStocks().map(tk=>{
      const sym=getFinnhubSymbol(tk);
      return seen.has(sym)?null:(seen.add(sym),sym);
    }).filter(Boolean);
  }

  function subscribeActive(){
    if(!ws||ws.readyState!==WebSocket.OPEN) return;
    activeSymbols().forEach(sym=>{
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
    const url=api()?api().wsUrl():null;
    if(!url||!useWs()) return;
    subscribed.clear();
    ws=new WebSocket(url);
    ws.onopen=()=>{ subscribeActive(); };
    ws.onmessage=onWsMessage;
    ws.onclose=()=>{ ws=null; if(useWs()) setTimeout(connectWs,3000); };
    ws.onerror=()=>{ try{ ws.close(); }catch(e){} };
  }

  window.NexusLivePrices={
    start(){
      if(!finnhubActive()){
        setLiveStatus('static');
        console.info('[Nexus] Finnhub: set FINNHUB_API_KEY on Vercel or NEXUS_FINNHUB_KEY in finnhub-key.js');
        return;
      }
      window.NexusLivePrices.stop();
      setLiveStatus('sync');
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
      setLiveStatus('static');
    },
    resubscribe(){
      if(useWs()&&ws&&ws.readyState===WebSocket.OPEN){
        [...subscribed].forEach(sym=>{
          try{ ws.send(JSON.stringify({type:'unsubscribe',symbol:sym})); }catch(e){}
        });
        subscribed.clear();
        subscribeActive();
      }else if(useWs()){
        connectWs();
      }
      runPollSweep();
    },
    refreshNow(){ runPollSweep(); },
    /** Patch DOM from S[] after tab render (no new API calls). */
    refreshVisible(){
      if(typeof getActiveStocks!=='function'||typeof S==='undefined') return;
      getActiveStocks().forEach(tk=>{ if(S[tk]) patchTickerInDom(tk); });
      scheduleSidebarRenders();
    },
    isActive(){ return !!finnhubActive(); }
  };
})();
