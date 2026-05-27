// NEXUS — ETF mode: sector buckets, weighted holdings ring, holdings table
// Reads: ETF_SECTORS, CUR_ETF, SEL_ETF, SEL_STOCK, S

const ETF_RING_COLORS=['#ff4757','#f5a623','#fbbf24','#34d399','#22d3ee','#3d9aff','#6366f1','#a78bfa','#c084fc','#f472b6'];

function etfRingColor(i){ return ETF_RING_COLORS[i%ETF_RING_COLORS.length]; }

function buildEtfRingSvg(holdings, centerLabel){
  const cx=220,cy=220,R=168,r=98;
  const tot=holdings.reduce((a,h)=>a+(h.weight||0),0)||1;
  let start=-Math.PI/2;
  const paths=[];
  const labels=[];
  holdings.forEach((h,i)=>{
    const p=Math.max(0,h.weight||0)/tot;
    if(p<=0) return;
    const ang=p*Math.PI*2;
    const x1=cx+R*Math.cos(start),y1=cy+R*Math.sin(start);
    const x2=cx+R*Math.cos(start+ang),y2=cy+R*Math.sin(start+ang);
    const x3=cx+r*Math.cos(start+ang),y3=cy+r*Math.sin(start+ang);
    const x4=cx+r*Math.cos(start),y4=cy+r*Math.sin(start);
    const large=ang>Math.PI?1:0;
    const col=etfRingColor(i);
    paths.push(`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${r} ${r} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width="0.6"/>`);
    const mid=start+ang/2;
    const lx=cx+(R+36)*Math.cos(mid),ly=cy+(R+36)*Math.sin(mid);
    const anchor=Math.cos(mid)>0.15?'start':Math.cos(mid)<-0.15?'end':'middle';
    labels.push(`<text x="${lx.toFixed(1)}" y="${(ly-4).toFixed(1)}" text-anchor="${anchor}" fill="${col}" font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="800">${h.name.split(' ').slice(0,3).join(' ').toUpperCase()}</text>`);
    labels.push(`<text x="${lx.toFixed(1)}" y="${(ly+10).toFixed(1)}" text-anchor="${anchor}" fill="#eef2ff" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="600">$${h.tk} · ${(h.weight||0).toFixed(2)}%</text>`);
    start+=ang;
  });
  const title=(centerLabel||'ETF').replace(/</g,'');
  return`<svg class="etf-ring-svg" viewBox="0 0 440 440" width="100%" height="100%">
    <defs><radialGradient id="etfRingBg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#161b2e"/><stop offset="100%" stop-color="#0c0e18"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${R+8}" fill="url(#etfRingBg)"/>
    ${paths.join('')}
    <circle cx="${cx}" cy="${cy}" r="${r-4}" fill="#0c0e18"/>
    <text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#f5a623" font-family="Barlow Condensed,sans-serif" font-size="22" font-weight="800" letter-spacing=".06em">${title}</text>
    <text x="${cx}" y="${cy+14}" text-anchor="middle" fill="rgba(238,242,255,.45)" font-family="Barlow Condensed,sans-serif" font-size="11" font-weight="600" letter-spacing=".14em">ETF WEIGHTS</text>
    ${labels.join('')}
  </svg>`;
}

function clickEtf(etfId){
  SEL_ETF=etfId;
  SEL_STOCK=null;
  renderCenter();
  renderWatchlist();
  renderSummaryBar();
  renderRightPanel();
}

function clickEtfHolding(tk){
  if(typeof S!=='undefined'&&S[tk]){
    clickTileByTk(tk);
    return;
  }
  SEL_STOCK=null;
  renderCenter();
  renderRightPanel();
}

function renderEtfView(el){
  const sec=getEtfSector();
  if(!sec){
    el.innerHTML='<div class="etf-empty">No ETF sector data</div>';
    return;
  }
  const etfIds=Object.keys(sec.etfs||{});
  if(!SEL_ETF||!sec.etfs[SEL_ETF]) SEL_ETF=etfIds[0];
  const etf=sec.etfs[SEL_ETF];
  const holdings=getActiveEtfHoldings();
  const totW=holdings.reduce((a,h)=>a+(h.weight||0),0);
  const top3=holdings.slice(0,3).reduce((a,h)=>a+(h.weight||0),0);

  const cards=etfIds.map(id=>{
    const e=sec.etfs[id];
    const on=id===SEL_ETF;
    const n=(e.holdings||[]).length;
    return`<button type="button" class="etf-card${on?' on':''}" onclick="clickEtf('${id}')">
      <div class="etf-card-sym">${e.symbol||id}</div>
      <div class="etf-card-lbl">${e.label}</div>
      <div class="etf-card-meta">${n} holdings · ${e.asOf||'—'}</div>
    </button>`;
  }).join('');

  const rows=holdings.map((h,i)=>{
    const st=typeof S!=='undefined'?S[h.tk]:null;
    const ch=st?pct(st.ch,2):'—';
    const chCls=st?(st.ch>=0?'up':'dn'):'';
    const on=SEL_STOCK===h.tk;
    return`<tr class="etf-tr${on?' on':''}" onclick="clickEtfHolding('${h.tk}')">
      <td class="etf-td-rank">${i+1}</td>
      <td><span class="etf-dot" style="background:${etfRingColor(i)}"></span><span class="etf-tk">${h.tk}</span></td>
      <td class="etf-td-name">${h.name}</td>
      <td class="etf-td-w num">${(h.weight||0).toFixed(2)}%</td>
      <td class="etf-td-px num">${st?st.px:'—'}</td>
      <td class="etf-td-ch num ${chCls}">${ch}</td>
    </tr>`;
  }).join('');

  const wrap=document.createElement('div');
  wrap.className='etf-wrap';
  wrap.innerHTML=`
    <div class="etf-head">
      <div class="etf-title">${sec.label_full}</div>
      <div class="etf-sub">${etf.label} · ${etf.theme} · Source: ${etf.source||'manual'} · As of ${etf.asOf||'—'}</div>
    </div>
    <div class="etf-layout">
      <div class="etf-side">
        <div class="etf-ph">ETFs IN ${sec.label}</div>
        <div class="etf-cards">${cards}</div>
      </div>
      <div class="etf-main">
        <div class="etf-kpis">
          <div class="etf-kpi"><span class="etf-kpi-l">HOLDINGS</span><span class="etf-kpi-v">${holdings.length}</span></div>
          <div class="etf-kpi"><span class="etf-kpi-l">SUM WEIGHT</span><span class="etf-kpi-v acc">${totW.toFixed(1)}%</span></div>
          <div class="etf-kpi"><span class="etf-kpi-l">TOP 3</span><span class="etf-kpi-v">${top3.toFixed(1)}%</span></div>
        </div>
        <div class="etf-ring-host">${buildEtfRingSvg(holdings, etf.symbol||etf.label)}</div>
        <div class="etf-tbl-wrap">
          <table class="etf-tbl">
            <thead><tr><th>#</th><th>Holding</th><th>Name</th><th class="num">Weight</th><th class="num">Price</th><th class="num">Today</th></tr></thead>
            <tbody>${rows||'<tr><td colspan="6" class="etf-dim">No holdings</td></tr>'}</tbody>
          </table>
        </div>
        <div class="etf-foot">Holdings are manual seed data · Phase 2 API sync via NexusEtfApi</div>
      </div>
    </div>`;
  el.appendChild(wrap);
}
