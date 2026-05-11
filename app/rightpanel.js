// NEXUS — Right Panel
// Three modes: sector overview (default), layer detail, stock detail (chart/data/news tabs).
// TradingView chart uses 200ms debounce. News feed uses 200ms debounce.

// Historical data for sparkline trajectories (mock Phase 1 — FMP replaces in Phase 2)
const HIST={
  NVDA:{q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[580,1040,1180,1220,2180,2950,2280,2760],pe:[58,182,240,186,124,82,72,68]},
  MSFT:{q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[1820,2220,2420,2780,3020,3180,3280,3390],pe:[28,32,34,36,38,36,35,34]},
  AMD: {q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[120,142,172,220,280,380,468,580],pe:[124,186,null,82,248,184,148,128]},
  TSM: {q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[420,480,540,620,840,1200,1680,2000],pe:[14,16,18,20,24,28,32,35]},
  MU:  {q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[68,82,96,124,280,420,580,752],pe:[null,null,null,null,18,22,28,31]},
  ASML:{q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[220,260,310,340,420,480,540,597],pe:[32,36,40,42,48,52,54,53]},
  IBM: {q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[128,134,140,148,158,178,198,221],pe:[20,21,21,22,22,24,25,26]},
  IONQ:{q:["Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],mc:[2.8,2.4,3.6,4.2,4.8,6.2,7.4,8.8],pe:[null,null,null,null,null,null,null,null]},
};

let TRAJ_PER_VAL=8;
function setTrajPer(n){TRAJ_PER_VAL=n;if(SEL_STOCK)renderRPStock();}

function buildTraj(st){
  const hist=HIST[SEL_STOCK]; if(!hist) return '';
  const n=Math.min(TRAJ_PER_VAL,hist.q.length);
  const mcd=hist.mc.slice(-n), ped=hist.pe.slice(-n);
  return`<div class="rp-traj">
    <div class="rp-tj-hdr">
      <span class="rp-tj-t">MCap &amp; P/E TRAJECTORY</span>
      <div class="tj-btns">
        <button class="tj-b${TRAJ_PER_VAL===4?' on':''}" onclick="setTrajPer(4)">4Q</button>
        <button class="tj-b${TRAJ_PER_VAL===8?' on':''}" onclick="setTrajPer(8)">8Q</button>
      </div>
    </div>
    ${sparkline(mcd,'MCap ($B)','#4d9fff',274,40)}
    ${sparkline(ped,'P/E Ratio','#94a3b8',274,36)}
    <div class="traj-leg">
      <div class="tleg"><div class="tleg-l" style="background:#4d9fff"></div>MCap</div>
      <div class="tleg"><div class="tleg-l" style="background:#94a3b8"></div>P/E</div>
    </div>
  </div>`;
}

function sparkline(data,label,color,W,H){
  const vals=data.filter(v=>v!=null);
  if(vals.length<2) return`<div style="height:${H+20}px;display:flex;align-items:center;font-size:var(--f11);color:var(--dim);padding:4px 0">${label}: insufficient data</div>`;
  const mn=Math.min(...vals), mx=Math.max(...vals), rng=mx-mn||1;
  const n=data.length, pw=W/(n-1);
  let pts=[];
  data.forEach((v,i)=>{if(v!=null)pts.push(`${(i*pw).toFixed(1)},${(H-((v-mn)/rng*H*.82+H*.09)).toFixed(1)}`);});
  const gid='g'+Math.random().toString(36).slice(2,7);
  const lineD=`M${pts[0]} `+pts.slice(1).map(p=>`L${p}`).join(' ');
  const areaD=lineD+` L${W},${H} L0,${H} Z`;
  return`<div style="margin-bottom:4px">
    <div style="font-size:var(--f11);color:var(--dim);margin-bottom:2px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.1em">${label}</div>
    <svg width="${W}" height="${H}" style="display:block;overflow:visible">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".18"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaD}" fill="url(#${gid})"/>
      <path d="${lineD}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="3" fill="${color}" style="filter:drop-shadow(0 0 4px ${color})"/>
    </svg>
  </div>`;
}

function getMoat(tk){
  const m={
    NVDA:'CUDA ecosystem lock-in + 85%+ AI training GPU share + cuDNN library dependency',
    MSFT:'Office/Azure bundling + enterprise switching cost + GitHub + Azure OpenAI partnership',
    AMD:'x86 duopoly with Intel + competitive GPU roadmap + MI300X datacenter wins',
    TSM:'Advanced node monopoly (3nm/2nm) + 150B+ capex moat + decades of process IP',
    MU:'HBM leadership for AI training + cost structure advantage + DRAM/NAND scale',
    ASML:'Only EUV lithography maker globally + 10yr backlog + irreplaceable process IP',
    IONQ:'Highest trapped-ion fidelity + only listed quantum hardware + government contracts',
    COHR:'Vertical integration in optical + hyperscaler supply agreements + datacenter optics moat',
    RKLB:'Only public small-launch company with operational cadence + Space Systems division',
    IBM:'Enterprise relationships + Watsonx AI platform + 2800+ quantum patents + mainframe',
    ARM:'Architecture IP for 99% of mobile + royalty model scales with global chip volume',
    SNDK:'SanDisk brand + flash memory scale + AI training data storage + WDC spinoff',
    default:'Select stock for Phase 2 competitive intelligence (Finnhub + FMP integration)'
  };
  return m[tk]||m.default;
}

function getRisk(tk){
  const r={
    NVDA:'US export controls on H100/H200 to China + AMD/Google TPU threat + 68x PE valuation',
    MSFT:'Azure growth deceleration + OpenAI equity risk + EU antitrust scrutiny',
    AMD:'NVIDIA CUDA moat + custom ASIC threat from Google/Amazon + AI server deal losses',
    TSM:'Taiwan geopolitical risk + CHIPS Act delays + Apple/NVDA customer concentration',
    MU:'DRAM/NAND commodity cycle + China CXMT competition + HBM share battle with SK Hynix',
    ASML:'China EUV export ban ~15% revenue impact + CapEx cycles + Dutch government risk',
    IONQ:'5-10 years from commercial scale + cash burn + government funding sentiment',
    RKLB:'Launch failure risk + Neutron development delays + customer concentration',
    default:'Phase 2 will surface real risk data from Finnhub fundamentals and SEC filings'
  };
  return r[tk]||r.default;
}

// ── Render dispatcher ──────────────────────────────────────────────────────────
function renderRightPanel(){
  if(CTAB==='news'){renderRPNewsCtrl();return;}
  if(!SEL_STOCK&&!SEL_LAYER){renderRPDefault();return;}
  if(SEL_LAYER&&!SEL_STOCK){renderRPLayer();return;}
  renderRPStock();
}

function setRPHdr(title,badge){
  document.getElementById('rp-title').textContent=title;
  const b=document.getElementById('rp-badge');
  if(badge){
    b.textContent=badge; b.style.display='inline-flex';
    b.style.borderColor=secColor(CUR)+'55';
    b.style.color=secColor(CUR);
    b.style.background=secColor(CUR)+'12';
  } else b.style.display='none';
}

// ── Default: sector overview ───────────────────────────────────────────────────
function renderRPDefault(){
  setRPHdr('SECTOR OVERVIEW','');
  document.getElementById('rp-tabs').style.display='none';
  const stks=getActiveStocks().map(tk=>({tk,st:S[tk]})).filter(x=>x.st).sort((a,b)=>b.st.ch-a.st.ch);
  const g=stks.slice(0,5), l=stks.slice(-5).reverse();
  const avgCh=stks.reduce((a,x)=>a+x.st.ch,0)/(stks.length||1);
  let secBars='';
  Object.keys(PYRAMIDS).forEach(sec=>{
    const ss=getAllStocks(sec).map(tk=>S[tk]).filter(Boolean); if(!ss.length) return;
    const avg=ss.reduce((a,s)=>a+s.ch,0)/ss.length, u=avg>=0;
    const w=Math.min(Math.abs(avg)/8*50,50).toFixed(1);
    const c=secColor(sec);
    const barStyle=u?`right:50%;border-right:2px solid ${c};color:${c};background:${c}18`:`left:50%;border-left:2px solid #ff4757;color:#ff4757;background:rgba(255,71,87,.12)`;
    secBars+=`<div class="sp-row">
      <span class="sp-nm" style="color:${c}">${SEC_LABELS[sec]}</span>
      <div class="sp-track"><div class="sp-zero"></div>
        <div class="sp-bar ${u?'up':'dn'}" style="width:${w}%;${barStyle}">${pct(avg,1)}</div>
      </div>
    </div>`;
  });
  document.getElementById('rp-body').innerHTML=`<div class="rp-def">
    <div class="rp-sec-t">ALL SECTORS TODAY</div>${secBars}
    <div class="rp-sec-t" style="margin-top:14px">TOP MOVERS</div>
    ${g.map(x=>`<div class="mv-row" onclick="clickTileByTk('${x.tk}')">
      <div><div class="mv-tk">${x.tk}</div><div class="mv-nm">${x.st.n.slice(0,22)}</div></div>
      <div class="mv-ch up">${pct(x.st.ch)}</div>
    </div>`).join('')}
    <div class="rp-sec-t" style="margin-top:12px">BIGGEST DECLINES</div>
    ${l.map(x=>`<div class="mv-row" onclick="clickTileByTk('${x.tk}')">
      <div><div class="mv-tk">${x.tk}</div><div class="mv-nm">${x.st.n.slice(0,22)}</div></div>
      <div class="mv-ch dn">${pct(x.st.ch)}</div>
    </div>`).join('')}
    <div style="padding:10px 0;border-top:1px solid var(--b0);margin-top:8px">
      <div class="rp-sec-t">${CUR} SECTOR AVG</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:var(--f32);font-weight:600;color:${avgCh>=0?'var(--up)':'var(--dn)'}">${pct(avgCh)}</div>
    </div>
  </div>`;
}

// ── Layer detail ───────────────────────────────────────────────────────────────
function renderRPLayer(){
  const p=getCurrentP();
  const layer=p?.layers?.find(l=>l.id===SEL_LAYER); if(!layer) return;
  setRPHdr(layer.name,CUR);
  document.getElementById('rp-tabs').style.display='none';
  const stks=layer.stocks.map(tk=>({tk,st:S[tk]})).filter(x=>x.st).sort((a,b)=>b.st.ch-a.st.ch);
  const agg=layerAgg(layer);
  document.getElementById('rp-body').innerHTML=`<div class="rp-lay">
    <div class="rp-lay-nm">${layer.name}</div>
    <div class="rp-lay-th">${layer.theme}</div>
    <div class="rp-agg-g">
      <div class="rp-agg-c"><div class="rp-agg-l">STOCKS</div><div class="rp-agg-v">${stks.length}</div></div>
      <div class="rp-agg-c"><div class="rp-agg-l">MCap</div><div class="rp-agg-v acc">$${fmtB(agg.mc)}</div></div>
      <div class="rp-agg-c"><div class="rp-agg-l">Avg P/E</div><div class="rp-agg-v">${agg.avgPE?agg.avgPE.toFixed(1)+'x':'—'}</div></div>
    </div>
    <div class="rp-lay-sl">HOLDINGS</div>
    ${stks.map(({tk,st})=>`<div class="rp-lay-row" onclick="clickTileByTk('${tk}')">
      <div><div class="rp-lay-tk">${tk}</div><div class="rp-lay-nm2">${st.n.slice(0,24)}</div></div>
      <div style="text-align:right">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:var(--f13);color:var(--txt2)">${st.px}</div>
        <div class="rp-lay-ch ${st.ch>=0?'up':'dn'}">${pct(st.ch)}${st.pe?' · P/E '+st.pe.toFixed(0):''}</div>
      </div>
    </div>`).join('')}
  </div>`;
}

// ── Stock detail ───────────────────────────────────────────────────────────────
let rpChDbn=null, rpNwDbn=null;

function renderRPStock(){
  const st=S[SEL_STOCK]; if(!st) return;
  setRPHdr(SEL_STOCK,CUR);
  const u=st.ch>=0;
  const rpTabs=document.getElementById('rp-tabs'); rpTabs.style.display='flex';
  rpTabs.innerHTML=['chart','data','news'].map(t=>`<button class="rp-tab${RPTAB===t?' on':''}" onclick="setRPTab('${t}',this)">${t.toUpperCase()}</button>`).join('');
  const p=getCurrentP();
  const myLayers=p?.layers?.filter(l=>l.stocks.includes(SEL_STOCK)).map(l=>`<span class="rp-tag">${l.name.split(' ')[0]}</span>`).join('')||'';
  const myTags=(st.tags||[]).slice(0,5).map(t=>`<span class="rp-tag theme">${t.replace(/_/g,' ')}</span>`).join('');
  const lo=parseFloat(st.lo?.replace(/[^0-9.]/g,'')||0), hi=parseFloat(st.hi?.replace(/[^0-9.]/g,'')||100), cu=parseFloat(st.px?.replace(/[^0-9.]/g,'')||50);
  const rPct=Math.max(0,Math.min(100,((cu-lo)/(hi-lo||1)*100))).toFixed(0);
  const tot=st.rs?.reduce((a,v)=>a+v,0)||1;
  const ps=st.rs?.map(v=>Math.round(v/tot*100))||[0,0,100,0,0];
  const rMap={'Strong Buy':'sb','Buy':'b','Hold':'h','Sell':'s','Strong Sell':'ss'};

  const hero=`<div class="rp-hero">
    <div class="rp-px">${st.px}</div>
    <div class="rp-chrow"><span class="rp-ch ${u?'up':'dn'}">${pct(st.ch)}</span><span class="rp-co">${st.n}</span></div>
    <div class="rp-tags">${myLayers}${myTags}</div>
  </div>`;

  let body='';
  if(RPTAB==='chart'){
    body=`${hero}<div class="rp-chart" id="rpc-el"></div>${buildTraj(st)}`;
  } else if(RPTAB==='data'){
    const ytdCls=(st.ytd||0)>=0?'up':'dn';
    body=`${hero}
    <div class="rp-ytd-row">
      <span class="rp-ytd-lbl">YTD RETURN</span>
      <span class="rp-ytd-val ${ytdCls}">${fmtYTD(st.ytd)}</span>
    </div>
    <div class="rp-mg">
      ${[['MCap',st.ms,'acc'],['P/E',st.pe?st.pe.toFixed(1)+'x':'N/A','acc'],
         ['Revenue',fmtRev(st.rev),''],['Net Income',fmtNet(st.net),(st.net||0)>=0?'up':'dn'],
         ['EPS','$'+st.eps,''],['Beta',st.be,''],
         ['52W Hi',st.hi,'up'],['52W Lo',st.lo,'dn'],
         ['Volume',st.vl,''],['Avg Vol',st.av,'']
      ].map(([l,v,c])=>`<div class="rp-mc"><div class="rp-ml">${l}</div><div class="rp-mv ${c}">${v}</div></div>`).join('')}
    </div>
    <div class="rp-range">
      <div class="rp-rt">52-WEEK RANGE</div>
      <div class="rw"><div class="rw-fill"></div><div class="rw-pos" style="left:${rPct}%"></div></div>
      <div class="rw-lbls"><span>${st.lo}</span><span>${st.px}</span><span>${st.hi}</span></div>
    </div>
    <div class="rp-an">
      <div class="rp-an-t">ANALYST CONSENSUS — ${st.an} analysts</div>
      <div class="an-bar">${['sb','b','h','s','ss'].map((c,i)=>`<div class="ars ${c}" style="flex:${ps[i]}">${ps[i]>12?c.toUpperCase():''}</div>`).join('')}</div>
      <div class="rp-cons"><span class="rp-cr ${rMap[st.rt]||'h'}">${st.rt?.toUpperCase()||'HOLD'}</span><span class="rp-csub">${tot} ratings</span></div>
    </div>
    ${buildTraj(st)}
    <div class="rp-biz">
      <div class="rp-sec-t">INTELLIGENCE</div>
      <div class="biz-item"><div class="biz-l">COMPETITIVE MOAT</div><div class="biz-d">${getMoat(SEL_STOCK)}</div></div>
      <div class="biz-item"><div class="biz-l">KEY RISK</div><div class="biz-d">${getRisk(SEL_STOCK)}</div></div>
    </div>`;
  } else {
    body=`${hero}<div class="rp-news" id="rpn-el"></div>`;
  }

  document.getElementById('rp-body').innerHTML=body;

  if(RPTAB==='chart'){
    clearTimeout(rpChDbn); rpChDbn=setTimeout(()=>{
      const el=document.getElementById('rpc-el'); if(!el) return;
      const w=document.createElement('div'); w.className='tradingview-widget-container'; w.style='position:absolute;inset:0';
      const i=document.createElement('div'); i.className='tradingview-widget-container__widget'; i.style='height:100%;width:100%';
      w.appendChild(i); el.appendChild(w);
      const sc=document.createElement('script');
      sc.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      sc.async=true;
      sc.innerHTML=JSON.stringify({
        autosize:true,symbol:getTVSym(SEL_STOCK),interval:'D',
        timezone:'America/New_York',theme:'dark',style:'1',locale:'en',
        toolbar_bg:'#111421',enable_publishing:false,allow_symbol_change:false,
        hide_top_toolbar:true,hide_legend:true,hide_side_toolbar:true,
        overrides:{
          'paneProperties.background':'#0c0e18','paneProperties.backgroundType':'solid',
          'paneProperties.vertGridProperties.color':'rgba(61,154,255,.05)',
          'paneProperties.horzGridProperties.color':'rgba(61,154,255,.05)',
          'mainSeriesProperties.candleStyle.upColor':'#00c97a',
          'mainSeriesProperties.candleStyle.downColor':'#ff4757',
          'mainSeriesProperties.candleStyle.wickUpColor':'#00c97a',
          'mainSeriesProperties.candleStyle.wickDownColor':'#ff4757'
        }
      });
      w.appendChild(sc);
    },200);
  }

  if(RPTAB==='news'){
    clearTimeout(rpNwDbn); rpNwDbn=setTimeout(()=>{
      const el=document.getElementById('rpn-el'); if(!el) return;
      const w=document.createElement('div'); w.className='tradingview-widget-container'; w.style='position:absolute;inset:0';
      const i=document.createElement('div'); i.className='tradingview-widget-container__widget'; i.style='height:100%;width:100%';
      w.appendChild(i); el.appendChild(w);
      const sc=document.createElement('script');
      sc.src='https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
      sc.async=true;
      sc.innerHTML=JSON.stringify({
        feedMode:'symbol',symbol:getTVSym(SEL_STOCK),
        colorTheme:'dark',isTransparent:true,displayMode:'regular',
        width:'100%',height:'100%',locale:'en'
      });
      w.appendChild(sc);
    },200);
  }
}

// ── News ctrl panel ────────────────────────────────────────────────────────────
function renderRPNewsCtrl(){
  setRPHdr('INTELLIGENCE','');
  document.getElementById('rp-tabs').style.display='none';
  const st=SEL_STOCK&&S[SEL_STOCK]?S[SEL_STOCK]:null;
  document.getElementById('rp-body').innerHTML=`<div class="rp-nctrl">
    <div class="rp-sec-t">ACTIVE STOCK</div>
    <div class="nc-card">
      <div class="nc-lbl">Selected</div>
      <div class="nc-val">${SEL_STOCK||'NONE'}</div>
      ${st?`<div class="nc-status" style="color:${st.ch>=0?'var(--up)':'var(--dn)'}">Today: ${pct(st.ch)}</div>`:''}
    </div>
    <div class="rp-sec-t" style="margin-top:10px">DATA SOURCES</div>
    <div class="nc-card"><div class="nc-lbl">TradingView</div><div class="nc-status nc-on">✓ LIVE — Charts + News Feed</div></div>
    <div class="nc-card"><div class="nc-lbl">Finnhub Sentiment</div><div class="nc-status nc-off">⏳ Phase 2 — API key needed</div></div>
    <div class="nc-card"><div class="nc-lbl">SEC EDGAR</div><div class="nc-status nc-off">⏳ Phase 3 — Form 4, 8-K</div></div>
    <div class="nc-card"><div class="nc-lbl">Perplexity Sonar Pro</div><div class="nc-status nc-off">⏳ Phase 3 — Research Q&A</div></div>
    ${st?.tags?.length?`<div class="rp-sec-t" style="margin-top:10px">TAGS</div><div class="kwd-row">${st.tags.map(t=>`<span class="kwd">${t.replace(/_/g,' ')}</span>`).join('')}</div>`:''}
  </div>`;
}

function setRPTab(tab,btn){
  RPTAB=tab;
  document.querySelectorAll('.rp-tab').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  if(SEL_STOCK) renderRPStock();
}
