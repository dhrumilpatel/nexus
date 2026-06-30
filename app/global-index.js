// NEXUS — Global membership index (all sectors + themes).
// Builds overlap scores and hub rankings for GLOBAL visualizer views.

(function(){
  const HYPERSCALER_SET=new Set(['MSFT','AMZN','GOOGL','META','NVDA','IBM','CRM','NOW']);

  function universeLabel(key,type){
    if(type==='sector') return(typeof SEC_LABELS!=='undefined'&&SEC_LABELS[key])||key;
    if(type==='theme'&&typeof THEMES_DATA!=='undefined') return THEMES_DATA[key]?.label||key;
    return key;
  }

  function universeColor(key,type){
    if(type==='sector') return secColor(key);
    if(type==='theme'&&typeof THEMES_DATA!=='undefined') return THEMES_DATA[key]?.color||'#f59e0b';
    return '#4d9fff';
  }

  function collectFromPyramid(pyramid,key,type,memberships,tkUniverses){
    if(!pyramid) return;
    const ukey=`${type}:${key}`;
    const label=universeLabel(key,type);
    if(pyramid.type==='flat'){
      const stocks=[...new Set((pyramid.categories||[]).flatMap(c=>c.stocks||[]))];
      stocks.forEach(tk=>{
        if(typeof S==='undefined'||!S[tk]) return;
        memberships.push({tk,universeKey:ukey,universeType:type,universeId:key,layerId:'flat',layerName:'All',layerIdx:0,layerCount:1,label});
        if(!tkUniverses[tk]) tkUniverses[tk]=new Set();
        tkUniverses[tk].add(ukey);
      });
      return;
    }
    if(!pyramid.layers) return;
    pyramid.layers.forEach((l,idx)=>{
      (l.stocks||[]).forEach(tk=>{
        if(typeof S==='undefined'||!S[tk]) return;
        memberships.push({tk,universeKey:ukey,universeType:type,universeId:key,layerId:l.id,layerName:l.name,layerIdx:idx,layerCount:pyramid.layers.length,label});
        if(!tkUniverses[tk]) tkUniverses[tk]=new Set();
        tkUniverses[tk].add(ukey);
      });
    });
  }

  function buildGlobalIndex(){
    const memberships=[];
    const tkUniverses={};
    if(typeof PYRAMIDS!=='undefined'){
      Object.keys(PYRAMIDS).forEach(k=>collectFromPyramid(PYRAMIDS[k],k,'sector',memberships,tkUniverses));
    }
    if(typeof THEMES_DATA!=='undefined'){
      Object.keys(THEMES_DATA).forEach(k=>collectFromPyramid(THEMES_DATA[k],k,'theme',memberships,tkUniverses));
    }
    const overlap={};
    Object.keys(tkUniverses).forEach(tk=>{
      const universes=[...tkUniverses[tk]];
      const layerKeys=memberships.filter(m=>m.tk===tk).map(m=>`${m.universeKey}:${m.layerId}`);
      overlap[tk]={count:universes.length,universes,layerKeys};
    });
    const hubs=Object.keys(overlap)
      .map(tk=>({tk,...overlap[tk],mc:(S[tk]?.mc)||0}))
      .sort((a,b)=>b.count-a.count||(b.mc-a.mc));
    const universes=[];
    const seenU=new Set();
    memberships.forEach(m=>{
      if(seenU.has(m.universeKey)) return;
      seenU.add(m.universeKey);
      universes.push({
        key:m.universeKey,
        type:m.universeType,
        id:m.universeId,
        label:m.label,
        color:universeColor(m.universeId,m.universeType)
      });
    });
    return{memberships,overlap,hubs,universes};
  }

  let cache=null;
  function getGlobalIndex(){
    if(!cache) cache=buildGlobalIndex();
    return cache;
  }
  function invalidateGlobalIndex(){ cache=null; }

  function matchesTagFilter(tk,tag){
    if(!tag) return true;
    const st=typeof S!=='undefined'?S[tk]:null;
    if(!st) return false;
    if(tag==='HYPERSCALER') return HYPERSCALER_SET.has(tk)||(st.tags||[]).includes('HYPERSCALER');
    return(st.tags||[]).includes(tag);
  }

  function membershipMap(index){
    const map={};
    index.memberships.forEach(m=>{
      const k=`${m.tk}|${m.universeKey}`;
      map[k]=m;
    });
    return map;
  }

  function groupedUniverses(index){
    const sectors=[],themes=[];
    (index?.universes||[]).forEach(u=>{
      if(u.type==='sector') sectors.push(u);
      else if(u.type==='theme') themes.push(u);
    });
    return{sectors,themes,all:[...sectors,...themes]};
  }

  function mapDisplayLabel(u){
    if(!u) return'';
    if(u.type==='sector') return`${u.label} sector`;
    if(u.type==='theme') return`${u.label} theme`;
    return u.label;
  }

  function stockMapLabels(index,tk){
    const ov=index?.overlap?.[tk];
    if(!ov) return[];
    return ov.universes.map(key=>{
      const u=(index.universes||[]).find(x=>x.key===key);
      return u?u.label:key;
    });
  }

  function membershipFor(index,tk,universeKey){
    return(index?.memberships||[]).find(m=>m.tk===tk&&m.universeKey===universeKey)||null;
  }

  window.NexusGlobalIndex={
    getGlobalIndex,invalidateGlobalIndex,matchesTagFilter,membershipMap,
    groupedUniverses,mapDisplayLabel,stockMapLabels,membershipFor,HYPERSCALER_SET
  };
})();
