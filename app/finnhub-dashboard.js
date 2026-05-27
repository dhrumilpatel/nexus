// NEXUS — Finnhub dashboard bundle (sentiment + recommendation) with TTL cache.
// Not live: refresh at most on interval or manual button. Top-N names only to limit API calls.

(function(){
  const STORAGE_KEY='nexus_fh_dash_v4';
  const DEFAULT_TTL_MS=(typeof window.NEXUS_FINNHUB_DASH_TTL_MS==='number'&&window.NEXUS_FINNHUB_DASH_TTL_MS>60000)
    ?window.NEXUS_FINNHUB_DASH_TTL_MS:(6*60*60*1000);
  const TOP_N=10;
  const GAP_MS=1200;

  function api(){ return window.NexusFinnhubApi; }
  function finnhubActive(){ return api()&&api().active(); }

  function universeKey(){
    const tks=(typeof getActiveStocks==='function'?getActiveStocks():[]).slice().sort().join(',');
    const nav=(typeof NAV_MODE!=='undefined'?NAV_MODE:'')+'|'+(NAV_MODE==='themes'&&typeof CUR_THEME!=='undefined'?CUR_THEME:'')+'|'+(typeof CUR!=='undefined'?CUR:'');
    return nav+'::'+tks;
  }

  function readCache(){
    try{
      const raw=sessionStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){ return null; }
  }

  function writeCache(obj){
    try{ sessionStorage.setItem(STORAGE_KEY,JSON.stringify(obj)); }catch(e){}
  }

  function topTickersByMcap(){
    const tks=typeof getActiveStocks==='function'?getActiveStocks():[];
    if(typeof S==='undefined') return[];
    return tks.filter(tk=>S[tk]&&S[tk].mc>0)
      .sort((a,b)=>(S[b].mc||0)-(S[a].mc||0))
      .slice(0,TOP_N);
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  async function fetchBundle(force){
    if(!finnhubActive()||!api()) return{ok:false,reason:'no_key',at:Date.now(),universe:universeKey(),byTicker:{}};

    const uKey=universeKey();
    const now=Date.now();
    const cached=readCache();
    if(!force&&cached&&cached.universe===uKey&&(now-cached.at)<DEFAULT_TTL_MS&&cached.byTicker){
      const recHitsCached=Object.values(cached.byTicker).filter(x=>Array.isArray(x.recommendation)&&x.recommendation.length).length;
      if(recHitsCached>0||!topTickersByMcap().length){
        return{ok:true,cached:true,at:cached.at,universe:uKey,byTicker:cached.byTicker,sentimentHits:cached.sentimentHits||0,recHits:recHitsCached,sentimentLimited:!!cached.sentimentLimited,analystAvailable:recHitsCached>0};
      }
    }

    const list=topTickersByMcap();
    const byTicker={};
    let sentimentHits=0;
    let recHits=0;
    for(let i=0;i<list.length;i++){
      const tk=list[i];
      const sym=getFinnhubSymbol(tk);
      const [sent,rec]=await Promise.all([
        api().fetchJson('news-sentiment',{symbol:sym}),
        api().fetchJson('stock/recommendation',{symbol:sym})
      ]);
      if(sent) sentimentHits++;
      if(Array.isArray(rec)&&rec.length) recHits++;
      byTicker[tk]={sentiment:sent,recommendation:Array.isArray(rec)?rec:null};
      if(i<list.length-1) await sleep(GAP_MS);
    }
    const payload={at:now,universe:uKey,byTicker,sentimentHits,recHits,sentimentLimited:sentimentHits===0&&list.length>0,analystAvailable:recHits>0};
    writeCache(payload);
    return{ok:true,cached:false,at:now,universe:uKey,byTicker,sentimentHits,recHits,sentimentLimited:sentimentHits===0&&list.length>0,analystAvailable:recHits>0};
  }

  function aggregate(bundle){
    const bt=bundle.byTicker||{};
    const tks=Object.keys(bt);
    let buzzSum=0,buzzN=0,bullSum=0,bullN=0,recBuy=0,recTot=0;
    tks.forEach(tk=>{
      const s=bt[tk].sentiment;
      if(s&&typeof s.buzz==='number'){ buzzSum+=s.buzz; buzzN++; }
      if(s&&typeof s.companyNewsScore==='number'){ bullSum+=s.companyNewsScore; bullN++; }
      const arr=bt[tk].recommendation;
      if(arr&&arr[0]){
        const r=arr[0];
        const buy=(r.strongBuy||0)+(r.buy||0);
        const tot=buy+(r.hold||0)+(r.sell||0)+(r.strongSell||0);
        if(tot>0){ recBuy+=buy/tot; recTot++; }
      }
    });
    return{
      tickersSampled:tks.length,
      avgBuzz:buzzN?buzzSum/buzzN:null,
      avgNewsScore:bullN?bullSum/bullN:null,
      avgBuyBias:recTot?recBuy/recTot:null
    };
  }

  window.NexusFinnhubDashboard={
    ttlMs(){ return DEFAULT_TTL_MS; },
    async load(force,cb){
      const b=await fetchBundle(!!force);
      const agg=b.ok&&b.byTicker?aggregate(b):null;
      if(typeof cb==='function') cb(b,agg);
      return{bundle:b,agg};
    }
  };
})();
