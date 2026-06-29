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
