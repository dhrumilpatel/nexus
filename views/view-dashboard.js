// NEXUS — Dashboard: KPI (Mcap · Sentiment · Movers), dominance, layer perf, Finnhub detail.
// Reads: S, getActiveStocks, getCurrentP, NAV_MODE, CUR, CUR_THEME, PYRAMIDS/THEMES_DATA

const DASH_DOM_TOP_N=6;
const DASH_DOM_COLS=['#3d9aff','#38bdf8','#22d3ee','#34d399','#a78bfa','#fbbf24','#64748b'];
const DASH_MOVERS_N=5;
const DASH_TIER_DEFS=[
  {key:'mega',label:'Mega (>$200B)',min:200,color:'#3d9aff'},
  {key:'large',label:'Large ($10B–$200B)',min:10,max:200,color:'#38bdf8'},
  {key:'mid',label:'Mid ($2B–$10B)',min:2,max:10,color:'#22d3ee'},
  {key:'small',label:'Small ($300M–$2B)',min:0.3,max:2,color:'#34d399'},
  {key:'micro',label:'Micro (<$300M)',min:0,max:0.3,color:'#64748b'}
];

function dashTierForVal(v){
  if(v>=200) return 'mega';
  if(v>=10) return 'large';
  if(v>=2) return 'mid';
  if(v>=0.3) return 'small';
  return 'micro';
}

function dashTierBreakdown(stks,field){
  const buckets={mega:0,large:0,mid:0,small:0,micro:0};
  stks.forEach(s=>{
    const v=field==='rev'
      ?((typeof s.rev==='number'&&s.rev>0)?s.rev:0)
      :(s.mc||0);
    if(v<=0) return;
    buckets[dashTierForVal(v)]+=v;
  });
  const tot=Object.values(buckets).reduce((a,v)=>a+v,0);
  const slices=DASH_TIER_DEFS.map(t=>({
    label:t.label,
    pct:tot>0?(buckets[t.key]/tot)*100:0,
    color:t.color
  })).filter(s=>s.pct>0.05);
  return{slices,tot};
}

function dashSvgDonutCentered(slices,centerMain,centerSub){
  const cx=90,cy=90,r=44,R=58;
  const tot=slices.reduce((a,t)=>a+Math.max(0,t.pct||0),0);
  if(tot<=0) return `<div class="dash-dim dash-don-empty">${centerSub||'No data'}</div>`;
  let start=-Math.PI/2;
  const paths=[];
  slices.forEach(t=>{
    const p=Math.max(0,t.pct||0);
    if(p<=0) return;
    const ang=(p/tot)*Math.PI*2;
    const x1=cx+R*Math.cos(start),y1=cy+R*Math.sin(start);
    const x2=cx+R*Math.cos(start+ang),y2=cy+R*Math.sin(start+ang);
    const x3=cx+r*Math.cos(start+ang),y3=cy+r*Math.sin(start+ang);
    const x4=cx+r*Math.cos(start),y4=cy+r*Math.sin(start);
    const large=ang>Math.PI?1:0;
    paths.push(`<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${x3.toFixed(2)} ${y3.toFixed(2)} A${r} ${r} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z" fill="${t.color}" stroke="rgba(0,0,0,.28)" stroke-width="0.5"/>`);
    start+=ang;
  });
  let leg='';
  slices.forEach(t=>{
    if((t.pct||0)<=0) return;
    leg+=`<div class="dash-don-leg"><span class="dash-don-dot" style="background:${t.color}"></span><span class="dash-don-lbl">${t.label}</span><span class="dash-don-pct">${t.pct.toFixed(1)}%</span></div>`;
  });
  return`<div class="dash-don-wrap dash-don-wrap--mid"><div class="dash-don-svg-wrap"><svg class="dash-don-svg dash-don-svg--mid" viewBox="0 0 180 180" width="120" height="120">${paths.join('')}<text x="${cx}" y="${cy-4}" text-anchor="middle" fill="#eef2ff" font-size="11" font-weight="700" font-family="IBM Plex Mono,monospace">${centerMain}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" fill="#8892a8" font-size="8" font-weight="600" font-family="Barlow Condensed,sans-serif" letter-spacing=".1em">${centerSub||''}</text></svg></div><div class="dash-don-legs">${leg}</div></div>`;
}

function dashMoversTableHtml(rows,cls){
  if(!rows||!rows.length) return '<div class="dash-dim">—</div>';
  const body=rows.map((x,i)=>`<tr class="dash-tbl-tr" data-nexus-tk="${x.tk}" onclick="clickTileByTk('${x.tk}')"><td class="dash-tbl-num">${i+1}</td><td class="dash-tk">${x.tk}</td><td class="dash-tbl-name">${x.n||'—'}</td><td class="wr-px num">${x.px}</td><td class="wr-ch num ${cls}">${pct(x.ch,2)}</td></tr>`).join('');
  return`<div class="dash-tbl-wrap"><table class="dash-tbl dash-tbl-mv"><thead><tr><th>#</th><th>Ticker</th><th>Name</th><th class="num">Price</th><th class="num">% Change</th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function dashLayerMetric(){
  try{
    const m=sessionStorage.getItem('nexus_dash_layer');
    if(m==='today'||m==='ytd') return m;
  }catch(e){}
  return 'today';
}

function setDashLayerMetric(m,btn){
  if(m!=='today'&&m!=='ytd') return;
  try{ sessionStorage.setItem('nexus_dash_layer',m); }catch(e){}
  document.querySelectorAll('.dash-seg-tog').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  const host=document.getElementById('dash-seg-list');
  if(host&&typeof getCurrentP==='function'){
    host.innerHTML=dashSegListHtml(getCurrentP(),dashLayerMetric());
  }
}

function dashCapWtdCh(stks,mcTot){
  if(mcTot<=0)return null;
  let s=0;
  stks.forEach(x=>{if(x.mc>0)s+=(x.mc/mcTot)*(x.ch||0);});
  return s;
}

function dashSegRows(p){
  if(!p)return[];
  if(p.type==='flat'){
    return p.categories.map(cat=>{
      const rows=cat.stocks.map(tk=>S[tk]).filter(Boolean);
      const mc=rows.reduce((a,s)=>a+(s.mc||0),0);
      const y=mc>0
        ?rows.reduce((a,s)=>a+(s.mc/mc)*(s.ytd||0),0)
        :rows.reduce((a,s)=>a+(s.ytd||0),0)/(rows.length||1);
      return{name:cat.name,ytd:y,mc};
    });
  }
  if(p.type==='pyramid'){
    return p.layers.map(L=>{
      const rows=L.stocks.map(tk=>S[tk]).filter(Boolean);
      const mc=rows.reduce((a,s)=>a+(s.mc||0),0);
      const y=mc>0
        ?rows.reduce((a,s)=>a+(s.mc/mc)*(s.ytd||0),0)
        :rows.reduce((a,s)=>a+(s.ytd||0),0)/(rows.length||1);
      return{name:L.name,ytd:y,mc};
    });
  }
  return[];
}

function dashSegRowsToday(p){
  if(!p)return[];
  const mapSeg=(name,rows)=>{
    const mc=rows.reduce((a,s)=>a+(s.mc||0),0);
    const y=mc>0
      ?rows.reduce((a,s)=>a+(s.mc/mc)*(s.ch||0),0)
      :rows.reduce((a,s)=>a+(s.ch||0),0)/(rows.length||1);
    return{name,val:y,mc};
  };
  if(p.type==='flat'){
    return p.categories.map(cat=>mapSeg(cat.name,cat.stocks.map(tk=>S[tk]).filter(Boolean)));
  }
  if(p.type==='pyramid'){
    return p.layers.map(L=>mapSeg(L.name,L.stocks.map(tk=>S[tk]).filter(Boolean)));
  }
  return[];
}

function dashSegListHtml(p,metric){
  const segs=metric==='today'?dashSegRowsToday(p):dashSegRows(p);
  const yMax=Math.max(1e-6,...segs.map(s=>Math.abs((metric==='today'?s.val:s.ytd)||0)));
  if(!segs.length) return '<div class="dash-dim">No segments</div>';
  return segs.map(s=>{
    const v=metric==='today'?s.val:s.ytd;
    const w=Math.min(100,(Math.abs(v||0)/yMax)*100);
    const u=(v||0)>=0;
    const disp=metric==='today'?pct(v,2):fmtYTD(v);
    return`<div class="dash-seg-row"><span class="dash-seg-nm">${s.name}</span><span class="dash-seg-ytd ${u?'up':'dn'}">${disp}</span><div class="dash-seg-bar"><div class="dash-seg-fill ${u?'up':'dn'}" style="width:${w.toFixed(0)}%"></div></div></div>`;
  }).join('');
}

function dashSortedStks(stks){
  return [...stks].sort((a,b)=>(b.ch||0)-(a.ch||0));
}

function dashMoverKpiRow(st,dir){
  if(!st) return `<div class="dash-mv-kpi dash-mv-kpi-empty dash-dim">—</div>`;
  const cls=dir==='up'?'up':'dn';
  const arrow=dir==='up'?'↑':'↓';
  return`<div class="dash-mv-kpi dash-mv-kpi-${cls}" data-nexus-tk="${st.tk}" onclick="clickTileByTk('${st.tk}')">
    <span class="dash-mv-kpi-arr">${arrow}</span>
    <span class="dash-mv-kpi-tk">${st.tk}</span>
    <span class="wr-ch ${cls}">${pct(st.ch,2)}</span>
    <span class="wr-px dash-mv-kpi-px">${st.px}</span>
  </div>`;
}

function dashMoversPanelHtml(stks,n){
  const sorted=dashSortedStks(stks);
  const gain=sorted.slice(0,n);
  const lose=[...sorted].reverse().slice(0,n);
  const row=(x,cls)=>`<div class="dash-mv-row" data-nexus-tk="${x.tk}" onclick="clickTileByTk('${x.tk}')">
    <span class="dash-mv-tk">${x.tk}</span>
    <span class="wr-px">${x.px}</span>
    <span class="wr-ch ${cls}">${pct(x.ch,2)}</span>
  </div>`;
  return`<div class="dash-mv-cols">
    <div class="dash-mv-col"><div class="dash-mv-col-h up">TOP ${n} GAINERS</div>${gain.map(x=>row(x,'up')).join('')||'<div class="dash-dim">—</div>'}</div>
    <div class="dash-mv-col"><div class="dash-mv-col-h dn">TOP ${n} LOSERS</div>${lose.map(x=>row(x,'dn')).join('')||'<div class="dash-dim">—</div>'}</div>
  </div>`;
}

function dashSentimentFromAgg(agg){
  if(!agg)return null;
  const pts=[];
  if(agg.avgBuyBias!=null) pts.push(Math.min(100,Math.max(0,agg.avgBuyBias*100)));
  if(agg.avgNewsScore!=null){
    const v=agg.avgNewsScore;
    const n=v>=-1&&v<=1?(v+1)*50:Math.min(100,Math.max(0,v*50+25));
    pts.push(n);
  }
  if(agg.avgBuzz!=null) pts.push(Math.min(100,Math.max(0,(agg.avgBuzz||0)*18)));
  if(!pts.length)return null;
  return pts.reduce((a,b)=>a+b,0)/pts.length;
}

function dashSentimentFallback(avgY){
  return Math.min(92,Math.max(18,52+Math.min(28,Math.max(-28,(avgY||0)*0.38))));
}

function dashGaugeLabel(score){
  if(score>=62)return{text:'BULLISH',cls:'up'};
  if(score>=45)return{text:'NEUTRAL',cls:''};
  return{text:'CAUTIOUS',cls:'dn'};
}

function dashSvgDonutCore(slices,emptyMsg){
  const cx=90,cy=90,r=52,R=66;
  const tot=slices.reduce((a,t)=>a+Math.max(0,t.pct||0),0);
  if(tot<=0)return`<div class="dash-dim dash-don-empty">${emptyMsg||'No data'}</div>`;
  let start=-Math.PI/2;
  const paths=[];
  slices.forEach(t=>{
    const p=Math.max(0,t.pct||0);
    if(p<=0)return;
    const ang=(p/tot)*Math.PI*2;
    const x1=cx+R*Math.cos(start),y1=cy+R*Math.sin(start);
    const x2=cx+R*Math.cos(start+ang),y2=cy+R*Math.sin(start+ang);
    const x3=cx+r*Math.cos(start+ang),y3=cy+r*Math.sin(start+ang);
    const x4=cx+r*Math.cos(start),y4=cy+r*Math.sin(start);
    const large=ang>Math.PI?1:0;
    paths.push(`<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L${x3.toFixed(2)} ${y3.toFixed(2)} A${r} ${r} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z" fill="${t.color}" stroke="rgba(0,0,0,.28)" stroke-width="0.5"/>`);
    start+=ang;
  });
  let leg='';
  slices.forEach(t=>{
    if((t.pct||0)<=0)return;
    const pctOfUniverse=(t.pct/tot)*100;
    leg+=`<div class="dash-don-leg"><span class="dash-don-dot" style="background:${t.color}"></span><span class="dash-don-lbl">${t.label}</span><span class="dash-don-pct">${pctOfUniverse.toFixed(1)}%</span></div>`;
  });
  return`<div class="dash-don-wrap dash-don-wrap--sm"><svg class="dash-don-svg" viewBox="0 0 180 180" width="140" height="140">${paths.join('')}</svg><div class="dash-don-legs">${leg}</div></div>`;
}

function dashDominancePair(stks,mcTot,n){
  const N=typeof n==='number'&&n>0?n:DASH_DOM_TOP_N;
  const valid=stks.filter(s=>(s.mc||0)>0);
  if(!valid.length||mcTot<=0)return null;
  const sorted=[...valid].sort((a,b)=>b.mc-a.mc);
  const top=sorted.slice(0,Math.min(N,sorted.length));
  const topMc=top.reduce((a,s)=>a+s.mc,0);
  const mcOther=Math.max(0,mcTot-topMc);
  const mcapSlices=top.map((s,i)=>({label:s.tk,pct:(s.mc/mcTot)*100,color:DASH_DOM_COLS[i%DASH_DOM_COLS.length]}));
  if(mcOther>mcTot*0.0005)mcapSlices.push({label:'Other',pct:(mcOther/mcTot)*100,color:DASH_DOM_COLS[DASH_DOM_COLS.length-1]});

  const revTot=stks.reduce((a,s)=>a+((typeof s.rev==='number'&&s.rev>0)?s.rev:0),0);
  let revSlices=null;
  if(revTot>0){
    revSlices=[];
    let topRevSum=0;
    top.forEach((s,i)=>{
      const r=(typeof s.rev==='number'&&s.rev>0)?s.rev:0;
      topRevSum+=r;
      revSlices.push({label:s.tk,pct:(r/revTot)*100,color:DASH_DOM_COLS[i%DASH_DOM_COLS.length]});
    });
    const revOther=Math.max(0,revTot-topRevSum);
    if(revOther>revTot*0.0005)revSlices.push({label:'Other',pct:(revOther/revTot)*100,color:DASH_DOM_COLS[DASH_DOM_COLS.length-1]});
  }
  const rows=top.map((s,i)=>{
    const mcPct=(s.mc/mcTot)*100;
    const revVal=(typeof s.rev==='number'&&s.rev>0)?s.rev:0;
    const revPct=revTot>0?(revVal/revTot)*100:null;
    return{tk:s.tk,mc:s.mc,rev:revVal,mcPct,revPct,color:DASH_DOM_COLS[i%DASH_DOM_COLS.length]};
  });
  return{mcapSlices,revSlices,rows,revTot,mcTot,topN:top.length};
}

function dashDominanceTableHtml(rows,mcTot,revTot,stksLen){
  if(!rows||!rows.length)return'';
  const body=rows.map(r=>{
    const revDisp=(typeof r.rev==='number'&&r.rev>0)?fmtRev(r.rev):'—';
    const revPctDisp=r.revPct!=null?`${r.revPct.toFixed(1)}%`:'—';
    return`<tr class="dash-dom-tr" onclick="clickTileByTk('${r.tk}')"><td class="dash-dom-td-name"><span class="dash-dom-sq" style="background:${r.color}"></span><span class="dash-dom-tk">${r.tk}</span></td><td class="num acc">$${fmtB(r.mc)}</td><td class="num">${r.mcPct.toFixed(1)}%</td><td class="num">${revDisp}</td><td class="num">${revPctDisp}</td></tr>`;
  }).join('');
  const revCell=revTot>0?fmtRev(revTot):'—';
  const revPctCell=revTot>0?'100%':'—';
  const totRow=`<tr class="dash-dom-tr dash-dom-tr-tot"><td class="dash-dom-td-name">Universe (${stksLen})</td><td class="num acc">$${fmtB(mcTot)}</td><td class="num">100%</td><td class="num">${revCell}</td><td class="num">${revPctCell}</td></tr>`;
  return`<div class="dash-dom-table-wrap"><table class="dash-dom-table" aria-label="Mcap and revenue comparison"><thead><tr><th>Name</th><th class="num">Mcap</th><th class="num">% Mcap</th><th class="num">Revenue</th><th class="num">% Rev</th></tr></thead><tbody>${body}${totRow}</tbody></table></div>`;
}

function dashSvgGauge(score,compact){
  const cx=100,cy=compact?72:78,r=compact?58:68;
  const needle=Math.PI+(score/100)*Math.PI;
  const nx=cx+r*0.55*Math.cos(needle),ny=cy+r*0.55*Math.sin(needle);
  const gl=dashGaugeLabel(score);
  const gid='dgG'+Math.random().toString(36).slice(2,8);
  const h=compact?108:118;
  return`<svg class="dash-gauge-svg${compact?' dash-gauge-svg--kpi':''}" viewBox="0 0 200 ${h}" width="100%" height="${h}">
    <defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00c97a"/><stop offset="50%" stop-color="#f5a623"/><stop offset="100%" stop-color="#ff4757"/></linearGradient></defs>
    <path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}" fill="none" stroke="url(#${gid})" stroke-width="10" stroke-linecap="round"/>
    <text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#eef2ff" font-size="${compact?22:26}" font-weight="700" font-family="IBM Plex Mono,monospace">${Math.round(score)}</text>
    <text x="${cx}" y="${cy+10}" text-anchor="middle" class="dash-gauge-lbl ${gl.cls}" font-size="10" font-weight="700" font-family="Barlow Condensed,sans-serif" letter-spacing=".14em">${gl.text}</text>
    <line x1="${cx}" y1="${cy+2}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#eef2ff" stroke-width="2" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy+2}" r="3.5" fill="#eef2ff"/>
  </svg>`;
}

function dashHasAnalystData(agg){
  return agg&&agg.avgBuyBias!=null&&typeof agg.avgBuyBias==='number';
}

function dashSetSentimentVisible(show){
  const card=document.getElementById('dash-sent-card');
  const kpi=document.querySelector('.dash-kpi-cards');
  if(card) card.style.display=show?'':'none';
  if(kpi) kpi.classList.toggle('dash-kpi-cards--2',!show);
}

function dashUpdateGauge(score,fromApi,limited){
  const host=document.getElementById('dash-gauge');
  if(!host)return;
  const sc=typeof score==='number'&&!Number.isNaN(score)?score:dashSentimentFallback(0);
  let src='Sentiment proxy · YTD blend';
  if(fromApi){
    src=limited?'Analyst buy bias · Finnhub':'Analyst buy bias · Finnhub';
  }else if(window.NexusFinnhubApi&&NexusFinnhubApi.active()){
    src='Loading Finnhub…';
  }
  host.innerHTML=dashSvgGauge(sc,true)+`<div id="dash-sent-sub" class="dash-gauge-src dash-dim">${src}</div>`;
}

function dashUpdateSentSub(text){
  const el=document.getElementById('dash-sent-sub');
  if(el) el.textContent=text;
}

function renderDashboardView(el){
  const p=getCurrentP();
  if(!p){el.innerHTML='<div class="dash-empty">No universe</div>';return;}

  const tks=getActiveStocks();
  const stks=tks.map(tk=>({tk,st:S[tk]})).filter(x=>x.st).map(x=>({...x.st,tk:x.tk}));
  const mcTot=stks.reduce((a,s)=>a+(s.mc||0),0);
  const avgY=stks.reduce((a,s)=>a+(s.ytd||0),0)/(stks.length||1);
  const avgCh=stks.reduce((a,s)=>a+s.ch,0)/(stks.length||1);
  const cwCh=dashCapWtdCh(stks,mcTot);
  const nUp=stks.filter(s=>(s.ch||0)>0).length;
  const revRows=stks.filter(s=>s.rev!=null&&typeof s.rev==='number');

  const sorted=dashSortedStks(stks);
  const topG=sorted[0]||null;
  const topL=sorted.length?sorted[sorted.length-1]:null;

  const mcapTier=dashTierBreakdown(stks,'mc');
  const revTier=dashTierBreakdown(stks,'rev');
  const mcapDonutHtml=dashSvgDonutCentered(mcapTier.slices,'$'+fmtB(mcTot),'TOTAL');
  const revDonutHtml=revTier.tot>0
    ?dashSvgDonutCentered(revTier.slices,'$'+fmtB(revTier.tot),'LTM REVENUE')
    :dashSvgDonutCentered([],'—','NO REVENUE');

  const layerMet=dashLayerMetric();
  const segHtml=dashSegListHtml(p,layerMet);
  const segTogToday=layerMet==='today'?' on':'';
  const segTogYtd=layerMet==='ytd'?' on':'';

  const label=NAV_MODE==='themes'?(THEMES_DATA[CUR_THEME]?.label_full||CUR_THEME):(PYRAMIDS[CUR]?.label_full||CUR);
  const liveOn=window.NexusLivePrices&&NexusLivePrices.isActive();
  const hasKey=window.NexusFinnhubApi&&NexusFinnhubApi.active();

  const kpiSubMcap=cwCh!=null
    ?`<span class="dash-card-sub ${cwCh>=0?'up':'dn'}">Cap-wtd today ${pct(cwCh,2)}</span><span class="dash-card-sub ${nUp>=stks.length/2?'up':'dn'} dash-card-sub-stack">Breadth ${nUp}/${stks.length} advancing${liveOn?' · LIVE':''}</span>`
    :`<span class="dash-card-sub dash-dim">Cap-wtd today —</span><span class="dash-card-sub dash-card-sub-stack">Breadth ${nUp}/${stks.length} advancing</span>`;

  const wrap=document.createElement('div');
  wrap.className='dash-wrap';
  wrap.innerHTML=`
    <div class="dash-head">
      <div class="dash-title">Dashboard</div>
      <div class="dash-sub">${label} · ${stks.length} names · cap-weight index</div>
    </div>
    <div class="dash-kpi-cards">
      <div class="dash-card dash-card-mcap">
        <div class="dash-card-lbl">TOTAL MARKET CAP</div>
        <div class="dash-card-val dash-card-val-hero acc">$${fmtB(mcTot)}</div>
        ${kpiSubMcap}
      </div>
      <div class="dash-card dash-card-sent" id="dash-sent-card" style="display:none">
        <div class="dash-card-lbl">MARKET SENTIMENT</div>
        <div id="dash-gauge" class="dash-gauge-host dash-gauge-host--kpi"></div>
      </div>
      <div class="dash-card dash-card-mv">
        <div class="dash-card-lbl">TOP MOVERS &amp; LOSERS</div>
        ${dashMoverKpiRow(topG,'up')}
        ${dashMoverKpiRow(topL,'dn')}
      </div>
    </div>
    <div class="dash-row-mid">
      <div class="dash-panel dash-panel-mid">
        <div class="dash-ph">Market cap breakdown</div>
        <div class="dash-don-host dash-don-host--mid">${mcapDonutHtml}</div>
      </div>
      <div class="dash-panel dash-panel-mid">
        <div class="dash-ph">Revenue breakdown</div>
        <div class="dash-don-host dash-don-host--mid">${revDonutHtml}</div>
      </div>
      <div class="dash-panel dash-panel-mid">
        <div class="dash-ph-row">
          <span class="dash-ph">Layer performance${layerMet==='ytd'?' (YTD)':''}</span>
          <span class="dash-seg-togs">
            <button type="button" class="dash-seg-tog${segTogToday}" onclick="setDashLayerMetric('today',this)">TODAY</button>
            <button type="button" class="dash-seg-tog${segTogYtd}" onclick="setDashLayerMetric('ytd',this)">YTD</button>
          </span>
        </div>
        <div class="dash-seg-list" id="dash-seg-list">${segHtml}</div>
      </div>
    </div>
    <div class="dash-row-tables">
      <div class="dash-panel dash-panel-table">
        <div class="dash-ph dash-ph-up">Top 5 gainers</div>
        ${dashMoversTableHtml(sorted.slice(0,DASH_MOVERS_N),'up')}
      </div>
      <div class="dash-panel dash-panel-table">
        <div class="dash-ph dash-ph-dn">Bottom 5 losers</div>
        ${dashMoversTableHtml([...sorted].reverse().slice(0,DASH_MOVERS_N),'dn')}
      </div>
    </div>`;
  el.appendChild(wrap);

  dashSetSentimentVisible(false);
  if(hasKey&&window.NexusFinnhubDashboard){
    window.NexusFinnhubDashboard.load(false,(bundle,agg)=>dashApplyFinnhubSentiment(bundle,agg));
  }
}

function dashApplyFinnhubSentiment(bundle,agg){
  const hasAnalyst=dashHasAnalystData(agg);
  const show=bundle&&bundle.ok&&hasAnalyst;
  dashSetSentimentVisible(show);
  if(!show) return;
  const sc=Math.min(100,Math.max(0,agg.avgBuyBias*100));
  dashUpdateGauge(sc,true,!!(bundle&&bundle.sentimentLimited));
  dashUpdateSentSub(`Buy ${(agg.avgBuyBias*100).toFixed(0)}% · Finnhub analyst`);
}
