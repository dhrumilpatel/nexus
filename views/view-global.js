// NEXUS — GLOBAL cross-sector visualizer (overlap heatmap · mega Sankey · force graph).
// Globals: NexusGlobalIndex, GLOBAL_SUB, GLOBAL_MIN_OVERLAP, GLOBAL_TAG_FILTER, echarts, cytoscape

const GLOBAL_ROOT='NEXUS TOTAL';

function nexusGlobalDispose(el){
  if(typeof nexusSankeyDispose==='function') nexusSankeyDispose(el);
  if(el._nexusCy){ try{ el._nexusCy.destroy(); }catch(e){} el._nexusCy=null; }
}

function globalFilteredHubs(index){
  return index.hubs.filter(h=>
    h.count>=GLOBAL_MIN_OVERLAP&&NexusGlobalIndex.matchesTagFilter(h.tk,GLOBAL_TAG_FILTER)
  );
}

function globalToolbarHtml(){
  const subs=[
    {id:'overlap',label:'OVERLAP'},
    {id:'flow',label:'MEGA FLOW'},
    {id:'graph',label:'GRAPH'}
  ];
  const subPills=subs.map(s=>
    `<button type="button" class="gl-sub${GLOBAL_SUB===s.id?' on':''}" onclick="setGlobalSub('${s.id}')">${s.label}</button>`
  ).join('');
  const tags=['','HYPERSCALER','AI','CLOUD'];
  const tagOpts=tags.map(t=>{
    const lbl=t||'All tags';
    const val=t;
    return `<option value="${val}"${GLOBAL_TAG_FILTER===val?' selected':''}>${lbl}</option>`;
  }).join('');
  const minOpts=[1,2,3,4,5].map(n=>
    `<option value="${n}"${GLOBAL_MIN_OVERLAP===n?' selected':''}">${n}+ universes</option>`
  ).join('');
  const mode=typeof SANKEY_WEIGHT!=='undefined'?SANKEY_WEIGHT:'mcap';
  const wtBtns=GLOBAL_SUB==='flow'?`
    <span class="gl-lbl">Weight</span>
    <div class="skf-wtog">
      <button type="button" class="skf-wbtn${mode==='mcap'?' on':''}" onclick="setSankeyWeight('mcap')">Mcap</button>
      <button type="button" class="skf-wbtn${mode==='rev'?' on':''}" onclick="setSankeyWeight('rev')">Revenue</button>
    </div>`:'';
  return `<div class="gl-toolbar">
    <div class="gl-sub-row">${subPills}</div>
    <div class="gl-filters">
      <label class="gl-lbl">Min overlap<select class="gl-sel" onchange="setGlobalMinOverlap(+this.value)">${minOpts}</select></label>
      <label class="gl-lbl">Tag<select class="gl-sel" onchange="setGlobalTagFilter(this.value)">${tagOpts}</select></label>
      ${wtBtns}
    </div>
  </div>`;
}

function setGlobalSub(sub){
  if(sub!=='overlap'&&sub!=='flow'&&sub!=='graph') return;
  GLOBAL_SUB=sub;
  renderCenter();
}

function setGlobalMinOverlap(n){
  if(!Number.isFinite(n)||n<1) return;
  GLOBAL_MIN_OVERLAP=n;
  renderCenter();
}

function setGlobalTagFilter(tag){
  GLOBAL_TAG_FILTER=tag||'';
  renderCenter();
}

function renderGlobalSummary(index){
  const hubs=globalFilteredHubs(index);
  const top=hubs[0];
  const bar=document.getElementById('sumbar');
  if(!bar) return;
  bar.innerHTML=`
    <div class="sb-item"><span class="sb-lbl">UNIVERSES</span><span class="sb-val">${index.universes.length}</span></div>
    <div class="sb-item"><span class="sb-lbl">OVERLAPPERS</span><span class="sb-val acc">${hubs.length}</span></div>
    <div class="sb-item"><span class="sb-lbl">TOP HUB</span><span class="sb-val acc">${top?top.tk+' · '+top.count:'—'}</span></div>
    <div class="sb-item"><span class="sb-lbl">VIEW</span><span class="sb-val">${GLOBAL_SUB.toUpperCase()}</span></div>
    <div class="sb-item sb-item-label"><span class="sb-lbl sb-lbl-sec">GLOBAL NEXUS MAP</span></div>`;
}

function renderGlobalOverlap(el,index){
  const hubs=globalFilteredHubs(index);
  const rows=hubs.map(h=>h.tk);
  const cols=index.universes.map(u=>u.label);
  const memMap=NexusGlobalIndex.membershipMap(index);
  const data=[];
  rows.forEach((tk,ri)=>{
    index.universes.forEach((u,ci)=>{
      const m=memMap[`${tk}|${u.key}`];
      if(!m) return;
      const depth=m.layerCount>1?m.layerIdx/(m.layerCount-1):0;
      data.push([ci,ri,depth,m.layerName]);
    });
  });
  const wrap=document.createElement('div');
  wrap.className='gl-wrap';
  wrap.innerHTML=`${globalToolbarHtml()}
    <div class="gl-split">
      <div class="gl-chart" id="gl-overlap-chart"></div>
      <div class="gl-hub-list">
        <div class="gl-hub-hdr">Top overlappers</div>
        ${hubs.slice(0,12).map(h=>{
          const st=S[h.tk];
          return `<button type="button" class="gl-hub-row" onclick="clickTileByTk('${h.tk}')">
            <span class="gl-hub-tk">${h.tk}</span>
            <span class="gl-hub-n">${(st?.n||'').slice(0,18)}</span>
            <span class="gl-hub-c">${h.count}×</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  el.appendChild(wrap);
  const host=document.getElementById('gl-overlap-chart');
  if(!host||typeof echarts==='undefined') return;
  const chart=echarts.init(host,null,{renderer:'canvas'});
  el._nexusEcharts=chart;
  const h=Math.max(320,rows.length*22+80);
  host.style.height=h+'px';
  const opt={
    backgroundColor:'transparent',
    tooltip:{
      position:'top',
      backgroundColor:'rgba(17,20,33,.94)',
      borderColor:'rgba(61,154,255,.35)',
      textStyle:{color:'#eef2ff',fontSize:11},
      formatter(p){
        if(!p.data) return '';
        const tk=rows[p.data[1]];
        const st=S[tk];
        return `<b>${tk}</b> ${st?.n||''}<br/>${cols[p.data[0]]} · ${p.data[3]}<br/>${hubs.find(x=>x.tk===tk)?.count||0} universes`;
      }
    },
    grid:{left:72,right:24,top:48,bottom:72},
    xAxis:{type:'category',data:cols,splitArea:{show:true},axisLabel:{color:'rgba(226,232,240,.75)',fontSize:10,rotate:35,interval:0}},
    yAxis:{type:'category',data:rows,splitArea:{show:true},axisLabel:{color:'rgba(238,242,255,.88)',fontSize:10,fontFamily:'IBM Plex Mono,monospace'}},
    visualMap:{
      min:0,max:1,calculable:false,orient:'horizontal',left:'center',bottom:8,
      inRange:{color:['#1e3a5f','#4d9fff','#a78bfa','#f59e0b']},
      text:['Upstream','Apps'],textStyle:{color:'rgba(226,232,240,.7)',fontSize:10}
    },
    series:[{
      type:'heatmap',data:data,
      label:{show:false},
      emphasis:{itemStyle:{shadowBlur:8,shadowColor:'rgba(0,0,0,.4)'}}
    }]
  };
  chart.setOption(opt);
  chart.on('click',p=>{
    if(!p.data) return;
    const tk=rows[p.data[1]];
    if(tk&&S[tk]) clickTileByTk(tk);
  });
  const onResize=()=>{ try{ chart.resize(); }catch(e){} };
  el._nexusSankeyResize=onResize;
  window.addEventListener('resize',onResize);
  requestAnimationFrame(onResize);
}

function buildMegaSankeyCollapsed(index,mode){
  const nodes=[{name:GLOBAL_ROOT,depth:0,itemStyle:{color:'rgba(61,154,255,.38)'}}];
  const links=[];
  const usedNames=new Set([GLOBAL_ROOT]);
  index.universes.forEach(u=>{
    const mems=index.memberships.filter(m=>m.universeKey===u.key);
    let tks=[...new Set(mems.map(m=>m.tk))].filter(tk=>{
      const ov=index.overlap[tk];
      return ov&&ov.count>=GLOBAL_MIN_OVERLAP&&NexusGlobalIndex.matchesTagFilter(tk,GLOBAL_TAG_FILTER);
    });
    if(!tks.length) tks=[...new Set(mems.map(m=>m.tk))];
    tks=tks.sort((a,b)=>(S[b]?.mc||0)-(S[a]?.mc||0)).slice(0,5);
    let uW=0;
    tks.forEach(tk=>{ uW+=nexusSankeyStockWeight(S[tk],mode); });
    uW=Math.max(uW,0.05);
    let uName=u.label;
    if(usedNames.has(uName)) uName=`${u.label} (${u.id})`;
    usedNames.add(uName);
    nodes.push({name:uName,depth:1,itemStyle:{color:u.color+'44'}});
    links.push({source:GLOBAL_ROOT,target:uName,value:uW});
    tks.forEach(tk=>{
      const leaf=`${tk}@${u.id}`;
      if(!usedNames.has(leaf)){
        usedNames.add(leaf);
        const st=S[tk];
        nodes.push({
          name:leaf,depth:2,
          itemStyle:{color:(st?.ch||0)>=0?'rgba(0,201,122,.42)':'rgba(255,71,87,.35)'}
        });
      }
      const w=nexusSankeyStockWeight(S[tk],mode);
      links.push({source:uName,target:leaf,value:Math.max(w,0.01)});
    });
  });
  return{nodes,links,mode};
}

function renderGlobalMegaFlow(el,index){
  const mode=typeof SANKEY_WEIGHT!=='undefined'?SANKEY_WEIGHT:'mcap';
  const built=buildMegaSankeyCollapsed(index,mode);
  const wrap=document.createElement('div');
  wrap.className='gl-wrap gl-wrap-flow';
  wrap.innerHTML=`${globalToolbarHtml()}
    <div class="skf-chart gl-flow-chart" id="gl-flow-chart"></div>
    <div class="skf-hint">Collapsed mega flow · top overlappers per universe · click leaf for detail</div>`;
  el.appendChild(wrap);
  const host=document.getElementById('gl-flow-chart');
  if(!host||typeof echarts==='undefined') return;
  const chart=echarts.init(host,null,{renderer:'canvas'});
  el._nexusEcharts=chart;
  const accent='#38bdf8';
  const maxDepth=Math.max(0,...built.nodes.map(n=>n.depth||0));
  const levels=[];
  for(let d=0;d<=maxDepth;d++){
    levels.push({depth:d,label:{fontSize:d===0?12:10,fontWeight:d===0?800:600,color:'rgba(238,242,255,.84)'}});
  }
  chart.setOption({
    backgroundColor:'transparent',
    tooltip:{
      trigger:'item',
      backgroundColor:'rgba(17,20,33,.94)',
      borderColor:'rgba(61,154,255,.35)',
      textStyle:{color:'#eef2ff',fontSize:11},
      formatter(p){
        if(p.dataType==='edge'){
          return `${p.data.source} → ${p.data.target}<br/>${fmtB(p.data.value)}B`;
        }
        const tk=nexusSankeyParseTk(p.name);
        if(tk&&S[tk]){
          const st=S[tk];
          return `<b>${tk}</b> ${st.n||''}<br/>${index.overlap[tk]?.count||0} universes`;
        }
        return p.name;
      }
    },
    series:[{
      type:'sankey',left:'2%',right:'6%',top:'4%',bottom:'8%',
      nodeAlign:'justify',nodeGap:14,nodeWidth:14,layoutIterations:48,draggable:true,
      emphasis:{focus:'adjacency'},
      lineStyle:{color:'gradient',curveness:0.48,opacity:0.26},
      labelLayout:{hideOverlap:true},
      levels,
      label:{
        color:'rgba(238,242,255,.84)',
        fontFamily:'Barlow Condensed,IBM Plex Mono,sans-serif',
        formatter(params){
          const nm=params.name||'';
          const i=nm.indexOf('@');
          return i>0?nm.slice(0,i):nm;
        }
      },
      data:built.nodes,
      links:built.links.map(l=>({...l,lineStyle:{opacity:0.22,color:accent}}))
    }]
  });
  const onResize=()=>{ try{ chart.resize(); }catch(e){} };
  el._nexusSankeyResize=onResize;
  window.addEventListener('resize',onResize);
  requestAnimationFrame(onResize);
  chart.on('click',params=>{
    if(params.dataType!=='node') return;
    const tk=nexusSankeyParseTk(params.name);
    if(tk&&S[tk]) clickTileByTk(tk);
  });
}

function buildCytoscapeElements(index){
  const els=[];
  const hubs=globalFilteredHubs(index);
  const hubSet=new Set(hubs.map(h=>h.tk));
  index.universes.forEach(u=>{
    els.push({data:{id:u.key,label:u.label,type:'universe',color:u.color||'#4d9fff'}});
  });
  const layerSeen=new Set();
  index.memberships.forEach(m=>{
    if(!hubSet.has(m.tk)) return;
    const lid=`${m.universeKey}:${m.layerId}`;
    if(!layerSeen.has(lid)){
      layerSeen.add(lid);
      els.push({data:{id:lid,label:m.layerName,parent:m.universeKey,type:'layer'}});
    }
  });
  hubSet.forEach(tk=>{
    const st=S[tk];
    els.push({data:{id:`stock:${tk}`,label:tk,name:st?.n||tk,type:'stock',overlap:index.overlap[tk]?.count||0}});
    index.memberships.filter(m=>m.tk===tk).forEach(m=>{
      const lid=`${m.universeKey}:${m.layerId}`;
      els.push({data:{id:`e:${tk}:${lid}`,source:`stock:${tk}`,target:lid}});
    });
  });
  return els;
}

function renderGlobalGraph(el,index){
  const wrap=document.createElement('div');
  wrap.className='gl-wrap gl-wrap-graph';
  wrap.innerHTML=`${globalToolbarHtml()}
    <div class="gl-cy" id="gl-cy-chart"></div>
    <div class="skf-hint">Force graph · compound universes → layers · stocks with ${GLOBAL_MIN_OVERLAP}+ appearances · tap node for detail</div>`;
  el.appendChild(wrap);
  const host=document.getElementById('gl-cy-chart');
  if(!host||typeof cytoscape==='undefined'){
    if(host) host.innerHTML='<p class="gl-err">Cytoscape failed to load.</p>';
    return;
  }
  const cy=cytoscape({
    container:host,
    elements:buildCytoscapeElements(index),
    style:[
      {selector:'node[type="universe"]',style:{
        'background-color':'data(color)','background-opacity':0.15,
        'border-width':2,'border-color':'data(color)','border-opacity':0.55,
        'label':'data(label)','font-size':11,'font-weight':700,'color':'#eef2ff',
        'text-valign':'top','text-halign':'center','padding':'12px'
      }},
      {selector:'node[type="layer"]',style:{
        'background-color':'#1e293b','border-width':1,'border-color':'#64748b',
        'label':'data(label)','font-size':9,'color':'#cbd5e1',
        'text-valign':'bottom','text-halign':'center','width':28,'height':28
      }},
      {selector:'node[type="stock"]',style:{
        'background-color':ele=>{const st=S[ele.data('label')];return(st?.ch||0)>=0?'#00c97a':'#ff4757';},
        'label':'data(label)','font-size':10,'font-weight':700,'font-family':'IBM Plex Mono,monospace',
        'color':'#fff','text-outline-width':2,'text-outline-color':'#0c0e18',
        'width':ele=>24+Math.min(20,(ele.data('overlap')||1)*4),
        'height':ele=>24+Math.min(20,(ele.data('overlap')||1)*4)
      }},
      {selector:'edge',style:{
        'width':1,'line-color':'#475569','opacity':0.45,'curve-style':'bezier'
      }}
    ],
    layout:{name:'cose',animate:false,fit:true,padding:36,
      nodeRepulsion:8000,idealEdgeLength:80,nestingFactor:1.2}
  });
  el._nexusCy=cy;
  cy.on('tap','node[type="stock"]',evt=>{
    const tk=evt.target.data('label');
    if(tk&&S[tk]) clickTileByTk(tk);
  });
}

function renderGlobalView(el){
  nexusGlobalDispose(el);
  el.innerHTML='';
  if(typeof NexusGlobalIndex==='undefined') return;
  const index=NexusGlobalIndex.getGlobalIndex();
  renderGlobalSummary(index);
  if(GLOBAL_SUB==='flow') renderGlobalMegaFlow(el,index);
  else if(GLOBAL_SUB==='graph') renderGlobalGraph(el,index);
  else renderGlobalOverlap(el,index);
}
