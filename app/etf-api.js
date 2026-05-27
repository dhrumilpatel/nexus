// NEXUS — ETF holdings adapter (Phase 2 placeholder)
// Manual seed in data/etfs.js today. Future: fetch + normalize provider payloads here.

(function(){
  function normalizeHoldings(rows){
    if(!Array.isArray(rows)) return [];
    return rows.map(r=>({
      tk:String(r.tk||r.symbol||'').toUpperCase(),
      name:r.name||r.tk||'—',
      weight:Number(r.weight)||0,
      exchange:r.exchange||null,
      note:r.note||null,
    })).filter(r=>r.tk&&r.weight>0);
  }

  function normalizeEtf(raw){
    if(!raw||typeof raw!=='object') return null;
    const holdings=normalizeHoldings(raw.holdings);
    return{
      id:raw.id||raw.symbol,
      symbol:raw.symbol||raw.id,
      label:raw.label||raw.symbol,
      theme:raw.theme||'',
      source:raw.source||'api',
      asOf:raw.asOf||new Date().toISOString().slice(0,10),
      color:raw.color||'#3d9aff',
      holdings,
    };
  }

  window.NexusEtfApi={
    /** Phase 2: GET holdings from FMP/Finnhub/other and return normalized ETF object. */
    async fetchHoldings(etfSymbol){
      void etfSymbol;
      return null;
    },
    normalizeEtf,
    normalizeHoldings,
    /** Merge API holdings into manual ETF object (API wins on overlap). */
    mergeIntoEtf(baseEtf,apiHoldings,meta){
      const base=normalizeEtf(baseEtf);
      if(!base) return null;
      const api=normalizeHoldings(apiHoldings);
      if(!api.length) return base;
      const map=Object.create(null);
      base.holdings.forEach(h=>{ map[h.tk]=h; });
      api.forEach(h=>{ map[h.tk]=h; });
      return{
        ...base,
        source:meta?.source||'merged',
        asOf:meta?.asOf||base.asOf,
        holdings:Object.values(map).sort((a,b)=>b.weight-a.weight),
      };
    },
  };
})();
