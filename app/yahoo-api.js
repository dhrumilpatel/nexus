// NEXUS — Yahoo Finance quote proxy (intl / OMX fallback when Finnhub unavailable).

(function(){
  function fetchQuote(symbol){
    if(!symbol) return Promise.resolve(null);
    const qs=new URLSearchParams({symbol});
    return fetch('/api/yahoo?'+qs.toString())
      .then(async r=>{
        let j=null;
        try{ j=await r.json(); }catch(e){ return null; }
        if(!r.ok||!j||j.error) return null;
        return j;
      })
      .catch(()=>null);
  }
  window.NexusYahooApi={fetchQuote};
})();
