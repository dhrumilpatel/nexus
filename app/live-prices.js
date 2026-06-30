// NEXUS — Live quotes via Finnhub (REST + optional WebSocket) + Yahoo fallback for intl.
// Finnhub free tier: 60 REST calls/minute — we space /quote requests by REST_GAP_MS.
// Price updates patch DOM only (data-nexus-tk) so the pyramid layout does not rebuild every tick.
// Fallback: live c → prior close pc → session cache → stocks.js seed (unchanged).

(function(){
  const REST_GAP_MS=1100;
  const QUOTE_CACHE_KEY='nexus_quote_cache_v1';

  function api(){ return window.NexusFinnhubApi; }
  function finnhubActive(){ return api()&&api().active(); }
  function useWs(){ return api()&&api().useWs(); }

  let ws=null;
  let pollTimer=null;
  let pollBusy=false;
  let pendingResweep=false;
  let pendingResweepOpts=null;
  let sideRaf=null;
  let hasEverLive=false;
  const subscribed=new Set();
  const quoteCache={};

  function pollMs(){ const n=+window.NEXUS_FINNHUB_POLL_MS; return n>=60000?n:300000; }

  function quoteCacheKey(tk){
    if(typeof getYahooSymbol==='function'){
      const y=getYahooSymbol(tk);
      if(y) return y;
    }
    return getFinnhubSymbol(tk);
  }

  function formatPx(n){
    return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  const FX_CACHE_KEY='nexus_sek_usd_v1';
  const FX_TTL_MS=3600000;
  let sekUsdRate=null;

  function loadSekUsdFromCache(){
    try{
      const raw=sessionStorage.getItem(FX_CACHE_KEY);
      if(!raw) return;
      const o=JSON.parse(raw);
      if(o&&o.rate>0&&Date.now()-o.at<FX_TTL_MS) sekUsdRate=o.rate;
    }catch(e){}
  }

  function persistSekUsd(rate){
    sekUsdRate=rate;
    try{ sessionStorage.setItem(FX_CACHE_KEY,JSON.stringify({rate,at:Date.now()})); }catch(e){}
  }

  function stockNeedsSekFx(tk){
    const st=typeof S!=='undefined'?S[tk]:null;
    return !!(st&&(st.ccy==='SEK'||st.yahooSym));
  }

  function ensureSekUsdRate(){
    if(sekUsdRate>0) return Promise.resolve(sekUsdRate);
    loadSekUsdFromCache();
    if(sekUsdRate>0) return Promise.resolve(sekUsdRate);
    if(!window.NexusYahooApi) return Promise.resolve(null);
    return NexusYahooApi.fetchQuote('SEKUSD=X').then(j=>{
      const r=j&&j.c>0?Number(j.c):null;
      if(r) persistSekUsd(r);
      return sekUsdRate;
    });
  }

  function toUsdQuote(tk,j){
    if(!j||!stockNeedsSekFx(tk)||!sekUsdRate) return j;
    const fx=sekUsdRate;
    const c=j.c!=null?Number(j.c)*fx:null;
    const pc=j.pc!=null?Number(j.pc)*fx:null;
    const dp=j.dp!=null?Number(j.dp):null;
    return{c,pc,dp};
  }

  function quotePollActive(){
    if(finnhubActive()) return true;
    if(!window.NexusYahooApi||typeof getActiveStocks!=='function') return false;
    return getActiveStocks().some(tk=>stockNeedsSekFx(tk));
  }

  function loadPersistedQuoteCache(){
    try{
      const raw=sessionStorage.getItem(QUOTE_CACHE_KEY);
      if(!raw) return;
      const all=JSON.parse(raw);
      if(all&&typeof all==='object') Object.assign(quoteCache,all);
    }catch(e){}
  }

  function persistQuoteCache(sym,entry){
    quoteCache[sym]=entry;
    try{
      const raw=sessionStorage.getItem(QUOTE_CACHE_KEY);
      const all=raw?JSON.parse(raw):{};
      all[sym]=entry;
      sessionStorage.setItem(QUOTE_CACHE_KEY,JSON.stringify(all));
    }catch(e){}
  }

  function setLiveStatus(mode,title){
    const lbl=document.getElementById('live-lbl');
    const txt=document.getElementById('live-txt');
    if(!lbl||!txt) return;
    lbl.classList.remove('live-static','live-sync','live-close');
    if(mode==='active'){
      txt.textContent='LIVE';
      lbl.title=title||'Finnhub live quotes · click to refresh';
    }else if(mode==='close'){
      lbl.classList.add('live-close');
      txt.textContent='CLOSE';
      lbl.title=title||'Prior session close (live quote unavailable) · click to refresh';
    }else if(mode==='sync'){
      lbl.classList.add('live-sync');
      txt.textContent='SYNC';
      lbl.title=title||'Refreshing quotes…';
    }else{
      lbl.classList.add('live-static');
      txt.textContent='STATIC';
      lbl.title=title||'Set FINNHUB_API_KEY on Vercel or NEXUS_FINNHUB_KEY in finnhub-key.js';
    }
  }

  function wireBadgeRefresh(){
    const lbl=document.getElementById('live-lbl');
    if(!lbl||lbl.dataset.nexusRefresh) return;
    lbl.dataset.nexusRefresh='1';
    lbl.style.cursor='pointer';
    lbl.setAttribute('role','button');
    lbl.setAttribute('tabindex','0');
    lbl.addEventListener('click',()=>{
      if(window.NexusLivePrices) NexusLivePrices.refreshNow({forceSync:true});
    });
    lbl.addEventListener('keydown',ev=>{
      if(ev.key==='Enter'||ev.key===' '){
        ev.preventDefault();
        if(window.NexusLivePrices) NexusLivePrices.refreshNow({forceSync:true});
      }
    });
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
      if(node.classList&&node.classList.contains('wheel-node')){
        const circle=node.querySelector('circle');
        if(circle){
          const c=(st.ch||0)>=5?'#00c97a':(st.ch||0)>=2?'#4ddb9a':(st.ch||0)>=0?'#6ee7b7':(st.ch||0)>=-2?'#ff8a8a':(st.ch||0)>=-5?'#ff4757':'#c0392b';
          circle.setAttribute('fill',c);
          if(SEL_STOCK!==tk) circle.setAttribute('stroke',c);
        }
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
        patchRightPanelIfVisible();
        patchDashboardIfActive();
      }catch(e){}
    });
  }

  function patchRightPanelIfVisible(){
    if(typeof SEL_STOCK==='undefined'||!SEL_STOCK||typeof S==='undefined') return;
    const st=S[SEL_STOCK];
    if(!st) return;
    const rpBody=document.getElementById('rp-body');
    if(!rpBody||!rpBody.querySelector('.rp-hero')) return;
    const px=rpBody.querySelector('.rp-px');
    const ch=rpBody.querySelector('.rp-ch');
    if(px) px.textContent=st.px;
    if(ch){
      ch.textContent=pct(st.ch);
      ch.className='rp-ch '+(st.ch>=0?'up':'dn');
    }
  }

  function parsePxNumber(px){
    if(px==null) return null;
    const n=Number(String(px).replace(/[^\d.-]/g,''));
    return Number.isFinite(n)&&n>0?n:null;
  }

  function scaleMcapFromPrice(tk,nextPx){
    const st=S[tk];
    if(!st||(st.mc||0)<=0) return;
    const prevPx=parsePxNumber(st.px);
    if(!prevPx||!nextPx) return;
    const ratio=nextPx/prevPx;
    if(Number.isFinite(ratio)&&ratio>0){
      st.mc*=ratio;
      st.ms='$'+fmtB(st.mc);
    }
  }

  function applyQuoteFromValues(tk,c,pc,dp,source){
    const st=S[tk];
    if(!st||!c||c<=0) return false;
    scaleMcapFromPrice(tk,c);
    st.px=formatPx(c);
    if(typeof dp==='number'&&!Number.isNaN(dp)) st.ch=dp;
    else if(pc&&pc>0) st.ch=(c-pc)/pc*100;
    st._quoteSource=source;
    st._livePx=source==='live';
    const sym=quoteCacheKey(tk);
    if(sym) persistQuoteCache(sym,{c,pc:pc||quoteCache[sym]?.pc,at:Date.now(),source});
    return true;
  }

  function applyPriorClose(tk,pc,source){
    const st=S[tk];
    if(!st||!pc||pc<=0) return false;
    scaleMcapFromPrice(tk,pc);
    st.px=formatPx(pc);
    st.ch=0;
    st._quoteSource=source;
    st._livePx=false;
    const sym=quoteCacheKey(tk);
    if(sym) persistQuoteCache(sym,{c:pc,pc,at:Date.now(),source});
    return true;
  }

  function applyQuoteFromCache(tk){
    const sym=quoteCacheKey(tk);
    if(!sym) return false;
    const qc=quoteCache[sym];
    if(!qc) return false;
    if(qc.source==='live'&&qc.c>0) return applyQuoteFromValues(tk,qc.c,qc.pc,null,'cache');
    const px=qc.pc>0?qc.pc:(qc.c>0?qc.c:null);
    if(px) return applyPriorClose(tk,px,qc.source==='prior_close'?'prior_close':'cache');
    return false;
  }

  function applyQuote(tk,j){
    if(typeof S==='undefined'||!S[tk]) return false;
    if(j==null) return applyQuoteFromCache(tk);
    const c=j.c!=null?Number(j.c):null;
    const pc=j.pc!=null?Number(j.pc):null;
    const dp=j.dp;
    if(c!=null&&c>0&&applyQuoteFromValues(tk,c,pc,dp,'live')) return 'live';
    if(pc!=null&&pc>0&&applyPriorClose(tk,pc,'prior_close')) return 'prior_close';
    if(applyQuoteFromCache(tk)){
      const src=S[tk]._quoteSource;
      return src==='prior_close'?'prior_close':'cache';
    }
    return false;
  }

  function bootstrapFromCache(){
    if(typeof getActiveStocks!=='function'||typeof S==='undefined') return;
    let n=0;
    getActiveStocks().forEach(tk=>{
      if(applyQuoteFromCache(tk)){
        n++;
        patchTickerInDom(tk);
      }
    });
    if(n) scheduleSidebarRenders();
  }

  function sortedActiveTickers(){
    if(typeof getActiveStocks!=='function') return [];
    const list=getActiveStocks();
    if(typeof S==='undefined') return list;
    return list.slice().sort((a,b)=>(S[b]?.mc||0)-(S[a]?.mc||0));
  }

  function patchDashboardIfActive(){
    if(typeof CTAB==='undefined'||CTAB!=='dashboard') return;
    if(typeof getActiveStocks!=='function'||typeof S==='undefined') return;
    const tks=getActiveStocks();
    const stks=tks.map(tk=>S[tk]).filter(Boolean);
    if(!stks.length) return;
    const mcTot=stks.reduce((a,s)=>a+(s.mc||0),0);
    const mcEl=document.querySelector('#cc .dash-card-mcap .dash-card-val-hero');
    if(mcEl) mcEl.textContent='$'+fmtB(mcTot);
    const subs=document.querySelectorAll('#cc .dash-card-mcap .dash-card-sub');
    const nUp=stks.filter(s=>(s.ch||0)>0).length;
    const cwCh=(typeof dashCapWtdCh==='function')?dashCapWtdCh(stks,mcTot):null;
    if(subs[0]){
      if(cwCh!=null){
        subs[0].textContent=`Cap-wtd today ${pct(cwCh,2)}`;
        subs[0].className='dash-card-sub '+(cwCh>=0?'up':'dn');
      }else{
        subs[0].textContent='Cap-wtd today —';
        subs[0].className='dash-card-sub dash-dim';
      }
    }
    if(subs[1]){
      const liveOn=window.NexusLivePrices&&NexusLivePrices.isActive();
      const badge=document.getElementById('live-txt');
      const tag=badge&&(badge.textContent==='CLOSE')?' · CLOSE':(liveOn?' · LIVE':'');
      subs[1].textContent=`Breadth ${nUp}/${stks.length} advancing${tag}`;
      subs[1].className='dash-card-sub dash-card-sub-stack '+(nUp>=stks.length/2?'up':'dn');
    }
    const rotEl=document.getElementById('dash-rot-strip');
    if(rotEl&&typeof dashRotationStripHtml==='function') rotEl.innerHTML=dashRotationStripHtml();
  }

  function finishSweepStatus(liveCount,closeCount,updated){
    if(!quotePollActive()){
      setLiveStatus('static');
      return;
    }
    if(liveCount>0){
      hasEverLive=true;
      const hint=closeCount?` · ${closeCount} prior close`:'';
      setLiveStatus('active',`Finnhub live quotes${hint} · click to refresh`);
      return;
    }
    if(closeCount>0||updated>0){
      setLiveStatus('close');
      return;
    }
    if(hasEverLive) setLiveStatus('active');
    else setLiveStatus('static');
  }

  function fetchQuote(tk){
    if(typeof S==='undefined'||!S[tk]) return Promise.resolve(false);
    const ySym=typeof getYahooSymbol==='function'?getYahooSymbol(tk):null;
    const needsFx=stockNeedsSekFx(tk);
    const yahooFetch=()=>{
      if(!ySym||!window.NexusYahooApi) return Promise.resolve(false);
      const chain=needsFx?ensureSekUsdRate():Promise.resolve(sekUsdRate);
      return chain.then(()=>NexusYahooApi.fetchQuote(ySym).then(j=>applyQuote(tk,toUsdQuote(tk,j))));
    };
    if(ySym) return yahooFetch();
    if(!finnhubActive()||!api()) return Promise.resolve(false);
    const sym=getFinnhubSymbol(tk);
    if(!sym) return Promise.resolve(false);
    return api().fetchJson('quote',{symbol:sym}).then(j=>applyQuote(tk,j));
  }

  function tkFromFeedSymbol(sym){
    if(sym==null||typeof S==='undefined') return null;
    const u=String(sym).toUpperCase();
    for(const tk of Object.keys(S)){
      const fh=getFinnhubSymbol(tk);
      if(fh&&fh.toUpperCase()===u) return tk;
      const ys=typeof getYahooSymbol==='function'?getYahooSymbol(tk):null;
      if(ys&&ys.toUpperCase()===u) return tk;
    }
    return null;
  }

  async function runPollSweep(opts){
    opts=opts||{};
    if(!quotePollActive()) return;
    if(pollBusy){
      pendingResweep=true;
      pendingResweepOpts=opts;
      return;
    }
    if(typeof getActiveStocks!=='function') return;
    pollBusy=true;
    pendingResweep=false;
    const showSync=!!opts.forceSync||!hasEverLive;
    if(showSync) setLiveStatus('sync');
    const PRIORITY_N=8;
    let updated=0,liveCount=0,closeCount=0;
    try{
      if(getActiveStocks().some(tk=>stockNeedsSekFx(tk))) await ensureSekUsdRate();
      const list=sortedActiveTickers();
      for(let i=0;i<list.length;i++){
        const result=await fetchQuote(list[i]);
        if(result){
          updated++;
          if(result==='live') liveCount++;
          else if(result==='prior_close'||result==='cache') closeCount++;
          patchTickerInDom(list[i]);
          if(liveCount===1&&showSync) setLiveStatus('active');
        }
        if(i%2===0||i===list.length-1) scheduleSidebarRenders();
        if(i<PRIORITY_N-1) await sleep(200);
        else await sleep(REST_GAP_MS);
      }
      scheduleSidebarRenders();
      patchDashboardIfActive();
      finishSweepStatus(liveCount,closeCount,updated);
    }catch(e){
      finishSweepStatus(liveCount,closeCount,updated);
    }finally{
      pollBusy=false;
      const nextOpts=pendingResweepOpts;
      pendingResweepOpts=null;
      if(pendingResweep){
        pendingResweep=false;
        runPollSweep(nextOpts||{});
      }
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
      scaleMcapFromPrice(tk,p);
      S[tk].px=formatPx(p);
      S[tk]._quoteSource='live';
      S[tk]._livePx=true;
      hasEverLive=true;
      const sym=quoteCacheKey(tk);
      const qc=quoteCache[sym];
      if(qc&&qc.pc) S[tk].ch=(p-qc.pc)/qc.pc*100;
      patchTickerInDom(tk);
    });
    scheduleSidebarRenders();
    patchDashboardIfActive();
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

  loadPersistedQuoteCache();
  loadSekUsdFromCache();

  window.NexusLivePrices={
    start(){
      if(!quotePollActive()){
        setLiveStatus('static');
        console.info('[Nexus] Quotes: set FINNHUB_API_KEY on Vercel or NEXUS_FINNHUB_KEY in finnhub-key.js');
        return;
      }
      window.NexusLivePrices.stop();
      wireBadgeRefresh();
      bootstrapFromCache();
      setLiveStatus('sync');
      runPollSweep({forceSync:true});
      pollTimer=setInterval(()=>runPollSweep({}),pollMs());
      if(useWs()) connectWs();
    },
    stop(){
      if(pollTimer){ clearInterval(pollTimer); pollTimer=null; }
      subscribed.clear();
      if(ws){ try{ ws.close(); }catch(e){} ws=null; }
      hasEverLive=false;
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
      bootstrapFromCache();
      runPollSweep({});
    },
    refreshNow(opts){ runPollSweep({forceSync:true,...opts}); },
    refreshVisible(){
      if(typeof getActiveStocks!=='function'||typeof S==='undefined') return;
      getActiveStocks().forEach(tk=>{ if(S[tk]) patchTickerInDom(tk); });
      scheduleSidebarRenders();
    },
    isActive(){ return !!finnhubActive(); }
  };
})();
