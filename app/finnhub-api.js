// NEXUS — Finnhub REST routing (direct key or Vercel /api/finnhub proxy).
// Load after finnhub-config.js and finnhub-key.js, before live-prices.js and finnhub-dashboard.js.

(function(){
  function key(){
    return typeof window.NEXUS_FINNHUB_KEY==='string'?window.NEXUS_FINNHUB_KEY.trim():'';
  }
  function useProxy(){
    return window.NEXUS_FINNHUB_USE_PROXY===true;
  }
  function active(){
    return !!key()||useProxy();
  }
  /** WebSocket requires a client key; production proxy is REST-only. */
  function useWs(){
    return window.NEXUS_FINNHUB_USE_WS===true&&!!key()&&!useProxy();
  }
  function apiUrl(path,params){
    const p=params&&typeof params==='object'?{...params}:{};
    if(useProxy()){
      const qs=new URLSearchParams({path,...p});
      return '/api/finnhub?'+qs.toString();
    }
    const qs=new URLSearchParams({...p,token:key()});
    return 'https://finnhub.io/api/v1/'+path+'?'+qs.toString();
  }
  function wsUrl(){
    const k=key();
    if(!k||useProxy()) return null;
    return 'wss://ws.finnhub.io?token='+encodeURIComponent(k);
  }
  function fetchJson(path,params){
    return fetch(apiUrl(path,params))
      .then(async r=>{
        let j=null;
        try{ j=await r.json(); }catch(e){ return null; }
        if(!r.ok||!j||j.error) return null;
        return j;
      })
      .catch(()=>null);
  }
  window.NexusFinnhubApi={key,useProxy,active,useWs,apiUrl,wsUrl,fetchJson};
})();
