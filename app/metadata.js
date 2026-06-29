// NEXUS — Canonical infrastructure metadata helpers (read-only)

function getInfraMeta(tk){
  const st=typeof S!=='undefined'?S[tk]:null;
  return st?.meta||null;
}

function hasInfraMeta(tk){
  return !!getInfraMeta(tk);
}

function isAllowedValue(list, value){
  return Array.isArray(list)&&list.includes(value);
}

function validateMeta(meta){
  if(!meta||typeof meta!=='object') return false;
  let ok=true;
  if(meta.theme&&!isAllowedValue(INFRA_THEMES,meta.theme)){
    console.warn('[nexus meta] invalid theme:',meta.theme); ok=false;
  }
  if(meta.subtheme&&!isAllowedValue(INFRA_SUBTHEMES,meta.subtheme)){
    console.warn('[nexus meta] invalid subtheme:',meta.subtheme); ok=false;
  }
  const allowedSubs=meta.theme?THEME_TO_SUBTHEMES[meta.theme]:null;
  if(allowedSubs&&meta.subtheme&&allowedSubs.length&&!allowedSubs.includes(meta.subtheme)){
    console.warn('[nexus meta] subtheme not mapped to theme:',meta.theme,meta.subtheme); ok=false;
  }
  (meta.narratives||[]).forEach(n=>{
    if(!isAllowedValue(INFRA_NARRATIVES,n)) console.warn('[nexus meta] invalid narrative:',n);
  });
  (meta.bottlenecks||[]).forEach(b=>{
    if(!isAllowedValue(INFRA_BOTTLENECKS,b)) console.warn('[nexus meta] invalid bottleneck:',b);
  });
  if(meta.marketRole&&!isAllowedValue(MARKET_ROLES,meta.marketRole)){
    console.warn('[nexus meta] invalid marketRole:',meta.marketRole); ok=false;
  }
  return ok;
}

function formatRegimeSensitivity(obj){
  if(!obj||typeof obj!=='object') return [];
  const labels={training:'Training',inference:'Inference',enterprise:'Enterprise AI',robotics:'Robotics',edge:'Edge AI'};
  return Object.entries(obj).map(([k,v])=>({key:k,label:labels[k]||k,score:Number(v)||0}));
}

function buildInfraMetaHtml(st){
  const m=st?.meta;
  if(!m) return '';
  validateMeta(m);
  const narr=(m.narratives||[]).map(n=>`<span class="rp-tag theme">${n}</span>`).join('');
  const bn=(m.bottlenecks||[]).map(b=>`<span class="kwd">${b}</span>`).join('');
  const regimes=formatRegimeSensitivity(m.regimeSensitivity);
  const regimeRows=regimes.map(r=>{
    const w=Math.max(0,Math.min(100,r.score));
    return `<div class="rp-reg-row"><span class="rp-reg-lbl">${r.label}</span><div class="rp-reg-bar"><div class="rp-reg-fill" style="width:${w}%"></div></div><span class="rp-reg-pct">${w}</span></div>`;
  }).join('');
  return `<div class="rp-infra">
    <div class="rp-sec-t">INFRASTRUCTURE METADATA</div>
    <div class="rp-mg">
      <div class="rp-mc"><div class="rp-ml">Theme</div><div class="rp-mv acc">${m.theme||'—'}</div></div>
      <div class="rp-mc"><div class="rp-ml">Subtheme</div><div class="rp-mv acc">${m.subtheme||'—'}</div></div>
      <div class="rp-mc"><div class="rp-ml">Market role</div><div class="rp-mv">${m.marketRole||'—'}</div></div>
    </div>
    ${narr?`<div class="rp-sec-t" style="margin-top:8px">Narratives</div><div class="rp-tags" style="margin-bottom:6px">${narr}</div>`:''}
    ${bn?`<div class="rp-sec-t" style="margin-top:4px">Bottlenecks</div><div class="kwd-row">${bn}</div>`:''}
    ${regimeRows?`<div class="rp-sec-t" style="margin-top:8px">Regime sensitivity</div><div class="rp-regime">${regimeRows}</div>`:''}
  </div>`;
}

function capWeightYtdRows(rows){
  const mcTot=rows.reduce((a,s)=>a+(s.mc||0),0);
  if(mcTot<=0) return rows.reduce((a,s)=>a+(s.ytd||0),0)/(rows.length||1);
  return rows.reduce((a,s)=>a+((s.mc||0)/mcTot)*(s.ytd||0),0);
}

function stocksWithMeta(stks){
  return stks.filter(s=>s&&s.meta);
}

function aggregateByTheme(stks){
  const map={};
  stocksWithMeta(stks).forEach(s=>{
    const t=s.meta.theme||'Other';
    if(!map[t]) map[t]={theme:t,rows:[]};
    map[t].rows.push(s);
  });
  return Object.values(map).map(g=>({
    theme:g.theme,
    ytd:capWeightYtdRows(g.rows),
    mc:g.rows.reduce((a,s)=>a+(s.mc||0),0),
    count:g.rows.length
  })).sort((a,b)=>b.ytd-a.ytd);
}

function aggregateBottlenecks(stks){
  const map={};
  stocksWithMeta(stks).forEach(s=>{
    (s.meta.bottlenecks||[]).forEach(b=>{
      if(!map[b]) map[b]=[];
      map[b].push(s);
    });
  });
  return Object.keys(map).map(b=>({
    bottleneck:b,
    ytd:capWeightYtdRows(map[b]),
    count:map[b].length
  })).sort((a,b)=>b.ytd-a.ytd);
}

function leaderEnablerSpread(stks){
  const map={};
  stocksWithMeta(stks).forEach(s=>{
    const r=s.meta.marketRole||'Other';
    if(!map[r]) map[r]=[];
    map[r].push(s);
  });
  return Object.keys(map).map(r=>({
    role:r,
    ytd:capWeightYtdRows(map[r]),
    count:map[r].length
  })).sort((a,b)=>b.ytd-a.ytd);
}

const REGIME_KEY_MAP={
  'Training':'training',
  'Inference':'inference',
  'Enterprise AI':'enterprise',
  'Robotics':'robotics',
  'Edge AI':'edge'
};

function regimeScore(stks,regimeLabel){
  const key=REGIME_KEY_MAP[regimeLabel]||String(regimeLabel||'').toLowerCase();
  let mcTot=0,scoreSum=0;
  const metaStks=stocksWithMeta(stks);
  metaStks.forEach(s=>{
    const rs=s.meta.regimeSensitivity;
    if(!rs||rs[key]==null) return;
    const mc=s.mc||0;
    if(mc<=0) return;
    mcTot+=mc;
    scoreSum+=mc*(Number(rs[key])||0);
  });
  const tickers=metaStks
    .filter(s=>s.meta.regimeSensitivity&&s.meta.regimeSensitivity[key]!=null)
    .map(s=>({tk:s.tk,n:s.n,score:Number(s.meta.regimeSensitivity[key])||0}))
    .sort((a,b)=>b.score-a.score)
    .slice(0,3);
  return{score:mcTot>0?scoreSum/mcTot:null,tickers,count:metaStks.length};
}
