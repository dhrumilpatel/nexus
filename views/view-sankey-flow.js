// NEXUS — ECharts Sankey: pyramid / flat, Mcap or Revenue-weighted flows.
// Reco A: single hub after root (no mega fan). Reco B: SANKEY_WEIGHT toggle + tooltips show both.
// Globals: echarts, getCurrentP, S, layerAgg, secColor, THEMES_DATA, NAV_MODE, CUR, CUR_THEME, SANKEY_WEIGHT

const SKF_HUB_NAME='Universe total';

function nexusSankeyDispose(el){
  if(el._nexusEcharts){ try{ el._nexusEcharts.dispose(); }catch(e){} el._nexusEcharts=null; }
  if(el._nexusSankeyResize){
    window.removeEventListener('resize',el._nexusSankeyResize);
    el._nexusSankeyResize=null;
  }
}

function nexusStockNodeName(tk,lid){
  return lid?`${tk}@${lid}`:tk;
}

function nexusSankeyParseTk(nodeName){
  if(typeof nodeName!=='string') return null;
  const i=nodeName.indexOf('@');
  return i>0?nodeName.slice(0,i):nodeName;
}

function nexusSankeyMc(st){
  return st&&(typeof st.mc==='number'&&st.mc>0)?st.mc:0.05;
}

/** Stock weight ($B) for Sankey edges — mode 'mcap' | 'rev'. */
function nexusSankeyStockWeight(st,mode){
  if(!st) return mode==='rev'?0.02:0.05;
  if(mode==='rev'){
    if(typeof st.rev==='number'&&st.rev>0) return st.rev;
    return 0.02;
  }
  return nexusSankeyMc(st);
}

function skfMetricLabel(mode){
  return mode==='rev'?'Revenue ($B)':'Mcap ($B)';
}

function skfCountRevCoverage(p){
  if(!p) return{withRev:0,total:0};
  const tks=p.type==='flat'
    ?p.categories.flatMap(c=>c.stocks)
    :[...new Set(p.layers.flatMap(l=>l.stocks))];
  const uniq=[...new Set(tks)];
  let withRev=0;
  uniq.forEach(tk=>{
    const st=S[tk];
    if(st&&typeof st.rev==='number'&&st.rev>0) withRev++;
  });
  return{withRev,total:uniq.length};
}

function buildSankeyFromPyramid(p,mode){
  const root=(p.label_full||'SUPPLY CHAIN').slice(0,56);
  const allTk=new Set();
  p.layers.forEach(l=>l.stocks.forEach(tk=>allTk.add(tk)));
  let totalU=0;
  allTk.forEach(tk=>{const st=S[tk];if(st)totalU+=nexusSankeyStockWeight(st,mode);});
  totalU=Math.max(totalU,0.01);

  const layerWeights=p.layers.map(l=>{
    let s=0;
    l.stocks.forEach(tk=>{const st=S[tk];if(st)s+=nexusSankeyStockWeight(st,mode);});
    return Math.max(s,0.01);
  });
  const sumL=layerWeights.reduce((a,b)=>a+b,0)||1;
  const scale=totalU/sumL;

  const nodes=[
    {name:root,depth:0,itemStyle:{color:'rgba(61,154,255,.38)'}},
    {name:SKF_HUB_NAME,depth:1,itemStyle:{color:'rgba(147,197,253,.22)'}}
  ];
  const links=[{source:root,target:SKF_HUB_NAME,value:totalU}];
  const seenLeaf=new Set();
  const usedLayerNames=new Set();

  p.layers.forEach((l,idx)=>{
    const lid=l.id||`L${idx}`;
    let layerName=`${l.name}`;
    if(usedLayerNames.has(layerName)) layerName=`${l.name} (${lid})`;
    usedLayerNames.add(layerName);
    const rawL=layerWeights[idx];
    const inFlow=rawL*scale;
    const layerDepth=2+idx*2;
    nodes.push({
      name:layerName,
      depth:layerDepth,
      itemStyle:{color:`rgba(238,242,255,${0.12+idx*0.035})`}
    });
    links.push({source:SKF_HUB_NAME,target:layerName,value:Math.max(inFlow,0.02)});

    l.stocks.forEach(tk=>{
      const st=S[tk]; if(!st) return;
      const raw=nexusSankeyStockWeight(st,mode);
      const outV=rawL>0?raw*(inFlow/rawL):inFlow/(l.stocks.length||1);
      const leaf=nexusStockNodeName(tk,lid);
      if(!seenLeaf.has(leaf)){
        seenLeaf.add(leaf);
        nodes.push({
          name:leaf,
          depth:layerDepth+1,
          itemStyle:{color:st.ch>=0?'rgba(0,201,122,.42)':'rgba(255,71,87,.35)'}
        });
      }
      links.push({source:layerName,target:leaf,value:Math.max(outV,0.01)});
    });
  });
  return{nodes,links,root,mode};
}

function buildSankeyFromFlat(p,mode){
  const root=(p.label_full||'UNIVERSE').slice(0,56);
  const allTk=new Set();
  p.categories.forEach(c=>c.stocks.forEach(tk=>allTk.add(tk)));
  let totalU=0;
  allTk.forEach(tk=>{const st=S[tk];if(st)totalU+=nexusSankeyStockWeight(st,mode);});
  totalU=Math.max(totalU,0.01);

  const catWeights=p.categories.map(cat=>{
    let s=0;
    cat.stocks.forEach(tk=>{const st=S[tk];if(st)s+=nexusSankeyStockWeight(st,mode);});
    return Math.max(s,0.01);
  });
  const sumC=catWeights.reduce((a,b)=>a+b,0)||1;
  const scale=totalU/sumC;

  const nodes=[
    {name:root,depth:0,itemStyle:{color:'rgba(61,154,255,.38)'}},
    {name:SKF_HUB_NAME,depth:1,itemStyle:{color:'rgba(147,197,253,.22)'}}
  ];
  const links=[{source:root,target:SKF_HUB_NAME,value:totalU}];
  const usedCat=new Set();

  p.categories.forEach((cat,ci)=>{
    let catName=cat.name||`CAT${ci}`;
    if(usedCat.has(catName)) catName=`${cat.name||'CAT'} (${cat.id||ci})`;
    usedCat.add(catName);
    const rawC=catWeights[ci];
    const inFlow=rawC*scale;
    nodes.push({name:catName,depth:2,itemStyle:{color:'rgba(238,242,255,.18)'}});
    links.push({source:SKF_HUB_NAME,target:catName,value:Math.max(inFlow,0.02)});
    cat.stocks.forEach(tk=>{
      const st=S[tk]; if(!st) return;
      const raw=nexusSankeyStockWeight(st,mode);
      const outV=rawC>0?raw*(inFlow/rawC):inFlow/(cat.stocks.length||1);
      const leaf=nexusStockNodeName(tk,cat.id||`c${ci}`);
      if(!nodes.some(n=>n.name===leaf))
        nodes.push({
          name:leaf,
          depth:3,
          itemStyle:{color:st.ch>=0?'rgba(0,201,122,.42)':'rgba(255,71,87,.35)'}
        });
      links.push({source:catName,target:leaf,value:Math.max(outV,0.01)});
    });
  });
  return{nodes,links,root,mode};
}

function renderSankeyFlowView(el){
  nexusSankeyDispose(el);
  const p=getCurrentP();
  if(!p){
    el.innerHTML='<div class="skf-empty">No universe</div>';
    return;
  }

  const mode=(typeof SANKEY_WEIGHT==='string'&&SANKEY_WEIGHT==='rev')?'rev':'mcap';
  const cov=skfCountRevCoverage(p);
  const covLine=mode==='rev'
    ?`Revenue data: ${cov.withRev}/${cov.total} tickers · missing names use a thin trace ($0.02B)`
    :'Link width ∝ Mcap ($B), deduped across layers · hover for revenue';

  const accent=NAV_MODE==='themes'?(THEMES_DATA[CUR_THEME]?.color||'#f59e0b'):secColor(CUR);
  let built;
  if(p.type==='flat') built=buildSankeyFromFlat(p,mode);
  else if(p.type==='pyramid'&&p.layers) built=buildSankeyFromPyramid(p,mode);
  else{
    el.innerHTML='<div class="skf-empty">Sankey needs a pyramid or flat sector</div>';
    return;
  }

  const wrap=document.createElement('div');
  wrap.className='skf-wrap';
  const subBase=(p.label_full||'').slice(0,56);
  const subMetric=`Flow width ∝ ${skfMetricLabel(mode)} · ${subBase}`;
  wrap.innerHTML=`
    <div class="skf-head">
      <div class="skf-head-row">
        <div>
          <div class="skf-title">Sankey flow</div>
          <div class="skf-sub">${subMetric}</div>
          <div class="skf-cov">${covLine}</div>
        </div>
        <div class="skf-weight" role="group" aria-label="Sankey weighting">
          <span class="skf-weight-lbl">Weight by</span>
          <button type="button" class="skf-wbtn${mode==='mcap'?' on':''}" onclick="setSankeyWeight('mcap')">Mcap</button>
          <button type="button" class="skf-wbtn${mode==='rev'?' on':''}" onclick="setSankeyWeight('rev')">Revenue</button>
        </div>
      </div>
    </div>
    <div class="skf-chart" id="skf-chart"></div>
    <div class="skf-hint">Root → <b>${SKF_HUB_NAME}</b> → layers → tickers · click a leaf for detail · drag nodes · labels hide when overlapping</div>`;
  el.appendChild(wrap);

  const host=document.getElementById('skf-chart');
  if(!host||typeof echarts==='undefined'){
    wrap.querySelector('.skf-hint').textContent='ECharts failed to load. Check network or CDN.';
    return;
  }

  const chart=echarts.init(host,null,{renderer:'canvas'});
  el._nexusEcharts=chart;

  const maxDepth=Math.max(0,...built.nodes.map(n=>n.depth||0));
  const levels=[];
  for(let d=0;d<=maxDepth;d++){
    let fontSize=10,fontWeight=600;
    if(d===0){ fontSize=13; fontWeight=800; }
    else if(d===1){ fontSize=10; fontWeight=600; }
    else if(d<=3){ fontSize=11; fontWeight=700; }
    else if(d>=10) fontSize=7;
    else if(d>=8) fontSize=8;
    else if(d>=6) fontSize=9;
    levels.push({depth:d,label:{fontSize,fontWeight,color:d===1?'rgba(226,232,240,.78)':'rgba(238,242,255,.84)'}});
  }

  const edgeUnit=mode==='rev'?'rev':'mcap';
  const opt={
    backgroundColor:'transparent',
    tooltip:{
      trigger:'item',
      backgroundColor:'rgba(17,20,33,.94)',
      borderColor:'rgba(61,154,255,.35)',
      textStyle:{color:'#eef2ff',fontSize:11,fontFamily:'IBM Plex Mono,monospace'},
      formatter(p){
        if(p.dataType==='edge'){
          const s=p.data.source||'', t=p.data.target||'';
          const v=p.data.value!=null?fmtB(p.data.value):'';
          const unit=edgeUnit==='rev'?'$B revenue (flow)':'$B mcap (flow)';
          return `${s} → ${t}<br/>${v} ${unit}`;
        }
        const n=p.name||'';
        if(n===SKF_HUB_NAME)
          return `<b>${SKF_HUB_NAME}</b><br/>Deduped ${mode==='rev'?'revenue':'mcap'} pool — all layer inflows sum here.`;
        const tk=nexusSankeyParseTk(n);
        if(tk&&S[tk]){
          const st=S[tk];
          return `<b>${tk}</b> ${st.n||''}<br/>Mcap ${st.ms||'—'} · Rev ${fmtRev(st.rev)} · YTD ${fmtYTD(st.ytd)} · Today ${pct(st.ch,1)}`;
        }
        if(p.value!=null) return `${n}<br/>${fmtB(p.value)}B (${edgeUnit==='rev'?'revenue':'mcap'} slice)`;
        return n;
      }
    },
    series:[{
      type:'sankey',
      left:'2%',
      right:'5%',
      top:'3%',
      bottom:'6%',
      nodeAlign:'justify',
      nodeGap:12,
      nodeWidth:12,
      layoutIterations:48,
      draggable:true,
      emphasis:{focus:'adjacency',blurScope:'coordinateSystem'},
      lineStyle:{
        color:'gradient',
        curveness:0.5,
        opacity:0.28
      },
      labelLayout:{hideOverlap:true},
      levels,
      label:{
        color:'rgba(238,242,255,.84)',
        fontFamily:'Barlow Condensed,IBM Plex Mono,sans-serif',
        fontSize:10,
        fontWeight:600,
        formatter(params){
          const nm=params.name||'';
          if(nm===SKF_HUB_NAME) return 'Total';
          const i=nm.indexOf('@');
          return i>0?nm.slice(0,i):nm;
        }
      },
      itemStyle:{borderWidth:0},
      data:built.nodes.map(n=>{
        const base=n.itemStyle||{};
        const isHub=n.name===SKF_HUB_NAME;
        return{
          name:n.name,
          depth:n.depth,
          itemStyle:{
            ...base,
            borderColor:accent+'55',
            borderWidth:n.depth===0||isHub?1:0
          }
        };
      }),
      links:built.links.map(l=>({...l,lineStyle:{opacity:0.22,color:accent}}))
    }]
  };
  chart.setOption(opt);

  const onResize=()=>{ try{ chart.resize(); }catch(e){} };
  el._nexusSankeyResize=onResize;
  window.addEventListener('resize',onResize);
  requestAnimationFrame(onResize);

  chart.on('click',params=>{
    if(params.dataType!=='node') return;
    if(params.name===SKF_HUB_NAME) return;
    const tk=nexusSankeyParseTk(params.name);
    if(tk&&S[tk]) clickTileByTk(tk);
  });
}
