// NEXUS — GLOBAL cross-sector visualizer (matrix · mega Sankey · bridge graph).
// Globals: NexusGlobalIndex, GLOBAL_SUB, GLOBAL_MIN_OVERLAP, GLOBAL_TAG_FILTER, GLOBAL_GRAPH_LAYERS, echarts, cytoscape

const GLOBAL_ROOT='NEXUS TOTAL';

function nexusGlobalDispose(el){
  if(typeof nexusSankeyDispose==='function') nexusSankeyDispose(el);
  if(el._nexusCy){ try{ el._nexusCy.destroy(); }catch(e){} el._nexusCy=null; }
  if(el._glTip){ el._glTip.remove(); el._glTip=null; }
}

function globalSubLabel(sub){
  if(sub==='overlap') return'MATRIX';
  if(sub==='flow') return'MEGA FLOW';
  if(sub==='graph') return'GRAPH';
  return(sub||'').toUpperCase();
}

function globalFilteredHubs(index){
  return index.hubs.filter(h=>
    h.count>=GLOBAL_MIN_OVERLAP&&NexusGlobalIndex.matchesTagFilter(h.tk,GLOBAL_TAG_FILTER)
  );
}

function globalCellColor(hex,depth){
  if(!hex||hex.length<7) return`rgba(77,159,255,${0.28+depth*0.55})`;
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  const a=0.22+depth*0.62;
  return`rgba(${r},${g},${b},${a})`;
}

function globalToolbarHtml(index){
  const hubs=index?globalFilteredHubs(index):[];
  const subs=[
    {id:'overlap',label:'MATRIX'},
    {id:'flow',label:'MEGA FLOW'},
    {id:'graph',label:'GRAPH'}
  ];
  const subPills=subs.map(s=>
    `<button type="button" class="gl-sub${GLOBAL_SUB===s.id?' on':''}" onclick="setGlobalSub('${s.id}')">${s.label}</button>`
  ).join('');
  const tags=['','HYPERSCALER','AI','CLOUD'];
  const tagOpts=tags.map(t=>{
    const lbl=t||'All tags';
    return`<option value="${t}"${GLOBAL_TAG_FILTER===t?' selected':''}>${lbl}</option>`;
  }).join('');
  const minOpts=[1,2,3,4,5].map(n=>
    `<option value="${n}"${GLOBAL_MIN_OVERLAP===n?' selected':''}">${n}+ maps</option>`
  ).join('');
  const mode=typeof SANKEY_WEIGHT!=='undefined'?SANKEY_WEIGHT:'mcap';
  const wtBtns=GLOBAL_SUB==='flow'?`
    <span class="gl-lbl">Weight</span>
    <div class="skf-wtog">
      <button type="button" class="skf-wbtn${mode==='mcap'?' on':''}" onclick="setSankeyWeight('mcap')">Mcap</button>
      <button type="button" class="skf-wbtn${mode==='rev'?' on':''}" onclick="setSankeyWeight('rev')">Revenue</button>
    </div>`:'';
  const layerTog=GLOBAL_SUB==='graph'?`
    <label class="gl-lbl gl-tog">
      <input type="checkbox" class="gl-chk"${GLOBAL_GRAPH_LAYERS?' checked':''} onchange="setGlobalGraphLayers(this.checked)"/>
      Show layers
    </label>`:'';
  const countLine=index?`<span class="gl-count">${hubs.length} bridge stocks · ${index.universes.length} maps</span>`:'';
  return`<div class="gl-toolbar">
    <div class="gl-sub-row">${subPills}</div>
    <div class="gl-filters">
      <label class="gl-lbl">Min maps<select class="gl-sel" onchange="setGlobalMinOverlap(+this.value)">${minOpts}</select></label>
      <label class="gl-lbl">Tag<select class="gl-sel" onchange="setGlobalTagFilter(this.value)">${tagOpts}</select></label>
      ${wtBtns}${layerTog}${countLine}
    </div>
    <p class="gl-explainer">Each column is a sector or theme pyramid. Cells show where a stock sits in that map (layer depth).</p>
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

function setGlobalGraphLayers(on){
  GLOBAL_GRAPH_LAYERS=!!on;
  renderCenter();
}

function renderGlobalSummary(index){
  const hubs=globalFilteredHubs(index);
  const top=hubs[0];
  const bar=document.getElementById('sumbar');
  if(!bar) return;
  const tagNote=GLOBAL_TAG_FILTER?` · ${GLOBAL_TAG_FILTER}`:'';
  bar.innerHTML=`
    <div class="sb-item"><span class="sb-lbl">MAPS</span><span class="sb-val">${index.universes.length}</span></div>
    <div class="sb-item"><span class="sb-lbl">BRIDGE STOCKS</span><span class="sb-val acc">${hubs.length}</span></div>
    <div class="sb-item"><span class="sb-lbl">TOP BRIDGE</span><span class="sb-val acc">${top?top.tk+' · '+top.count+' maps':'—'}</span></div>
    <div class="sb-item"><span class="sb-lbl">VIEW</span><span class="sb-val">${globalSubLabel(GLOBAL_SUB)}</span></div>
    <div class="sb-item sb-item-label"><span class="sb-lbl sb-lbl-sec">GLOBAL · ${hubs.length} names in ${GLOBAL_MIN_OVERLAP}+ maps${tagNote}</span></div>`;
}

function globalBridgeSidebarHtml(index,hubs){
  return`<div class="gl-hub-list">
    <div class="gl-hub-hdr">Top bridge stocks</div>
    <div class="gl-hub-sc">
      ${hubs.slice(0,14).map(h=>{
        const st=S[h.tk];
        const chips=NexusGlobalIndex.stockMapLabels(index,h.tk).map(l=>
          `<span class="gl-chip">${l}</span>`
        ).join('');
        const sel=SEL_STOCK===h.tk?' gl-hub-row-sel':'';
        return`<button type="button" class="gl-hub-row${sel}" onclick="clickTileByTk('${h.tk}')">
          <div class="gl-hub-top">
            <span class="gl-hub-tk">${h.tk}</span>
            <span class="gl-hub-c">${h.count} maps</span>
          </div>
          <span class="gl-hub-n">${(st?.n||'').slice(0,22)}</span>
          <div class="gl-map-chips">${chips}</div>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

function globalEmptyHtml(index){
  const tag=GLOBAL_TAG_FILTER||'any tag';
  return`<div class="gl-empty">No stocks appear in ${GLOBAL_MIN_OVERLAP}+ maps with tag <b>${tag}</b>. Try lowering the map threshold or clearing the tag filter.</div>`;
}

function renderGlobalOverlap(el,index){
  const hubs=globalFilteredHubs(index);
  const wrap=document.createElement('div');
  wrap.className='gl-wrap gl-wrap-matrix';
  if(!hubs.length){
    wrap.innerHTML=`${globalToolbarHtml(index)}${globalEmptyHtml(index)}`;
    el.appendChild(wrap);
    return;
  }
  const rows=hubs.map(h=>h.tk);
  const grouped=NexusGlobalIndex.groupedUniverses(index);
  const colUniverses=[...grouped.sectors,{gap:true,key:'__gap__'},...grouped.themes];
  const memMap=NexusGlobalIndex.membershipMap(index);
  const rowH=32;
  const data=[];
  rows.forEach((tk,ri)=>{
    colUniverses.forEach((u,ci)=>{
      if(!u||u.gap) return;
      const m=memMap[`${tk}|${u.key}`];
      if(!m) return;
      const depth=m.layerCount>1?m.layerIdx/(m.layerCount-1):0.5;
      data.push({
        ci,ri,depth,
        tk,layerName:m.layerName,layerIdx:m.layerIdx,layerCount:m.layerCount,
        mapLabel:NexusGlobalIndex.mapDisplayLabel(u),mapColor:u.color
      });
    });
  });
  const xLabels=colUniverses.map(u=>u?.gap?'':u.label);
  const sectorN=grouped.sectors.length;
  const themeStart=sectorN+1;
  wrap.innerHTML=`${globalToolbarHtml(index)}
    <div class="gl-split gl-matrix-split">
      <div class="gl-row-gutter" id="gl-row-gutter">
        ${rows.map((tk,ri)=>{
          const st=S[tk];
          const h=hubs[ri];
          const sel=SEL_STOCK===tk?' gl-row-sel':'';
          return`<button type="button" class="gl-row-item${sel}" style="height:${rowH}px" onclick="clickTileByTk('${tk}')" data-ri="${ri}">
            <span class="gl-row-tk">${tk}</span>
            <span class="gl-row-n">${(st?.n||'').slice(0,16)}</span>
            <span class="gl-row-m">${h.count} maps</span>
          </button>`;
        }).join('')}
      </div>
      <div class="gl-chart gl-matrix-chart" id="gl-overlap-chart"></div>
      ${globalBridgeSidebarHtml(index,hubs)}
    </div>
    <div class="gl-legend">
      <span class="gl-leg-item"><span class="gl-leg-swatch gl-leg-up"></span>Upstream</span>
      <span class="gl-leg-item"><span class="gl-leg-swatch gl-leg-app"></span>Apps / downstream</span>
      <span class="gl-leg-note">Cell tint = map color · intensity = layer depth</span>
    </div>`;
  el.appendChild(wrap);
  const host=document.getElementById('gl-overlap-chart');
  if(!host||typeof echarts==='undefined') return;
  const chart=echarts.init(host,null,{renderer:'canvas'});
  el._nexusEcharts=chart;
  const chartH=Math.max(280,rows.length*rowH+72);
  host.style.height=chartH+'px';
  const opt={
    backgroundColor:'transparent',
    tooltip:{
      position:'top',
      backgroundColor:'rgba(17,20,33,.94)',
      borderColor:'rgba(61,154,255,.35)',
      textStyle:{color:'#eef2ff',fontSize:11},
      formatter(p){
        const d=p.data;
        if(!d||!d.tk) return'';
        const st=S[d.tk];
        const layerPos=d.layerCount>1?`layer ${d.layerIdx+1}/${d.layerCount}`:'flat map';
        return`<b>${d.tk}</b> ${st?.n||''}<br/>${d.mapLabel}<br/>${d.layerName} · ${layerPos}<br/>${st?.mc?fmtB(st.mc)+'B mcap · ':''}${hubs.find(x=>x.tk===d.tk)?.count||0} maps`;
      }
    },
    grid:{left:8,right:12,top:56,bottom:28},
    xAxis:{
      type:'category',data:xLabels,position:'top',
      splitArea:{show:true,areaStyle:{color:['rgba(255,255,255,.02)','rgba(255,255,255,.04)']}},
      axisLine:{lineStyle:{color:'rgba(148,163,184,.25)'}},
      axisTick:{show:false},
      axisLabel:{
        color:(val,idx)=>{
          const u=colUniverses[idx];
          return u&&!u.gap?u.color:'transparent';
        },
        fontSize:10,fontWeight:600,rotate:40,interval:0,
        formatter:(val,idx)=>{
          if(!val) return'';
          const u=colUniverses[idx];
          if(!u||u.gap) return'';
          return u.type==='theme'?`${val}*`:`${val}`;
        }
      }
    },
    yAxis:{
      type:'category',data:rows,show:false,
      inverse:true
    },
    series:[{
      type:'heatmap',
      data:data.map(d=>({
        value:[d.ci,d.ri,1],
        tk:d.tk,layerName:d.layerName,layerIdx:d.layerIdx,layerCount:d.layerCount,
        mapLabel:d.mapLabel,
        itemStyle:{
          color:globalCellColor(d.mapColor,d.depth),
          borderRadius:4,
          borderColor:'rgba(15,18,28,.5)',
          borderWidth:1
        }
      })),
      emphasis:{
        focus:'series',
        itemStyle:{shadowBlur:10,shadowColor:'rgba(61,154,255,.35)',borderColor:'rgba(238,242,255,.7)',borderWidth:1}
      }
    }],
    graphic:[
      {type:'text',left:8,top:6,style:{text:'SECTORS',fill:'rgba(148,163,184,.75)',fontSize:10,fontWeight:700,fontFamily:'Barlow Condensed'}},
      {type:'text',right:12,top:6,style:{text:'THEMES *',fill:'rgba(148,163,184,.75)',fontSize:10,fontWeight:700,fontFamily:'Barlow Condensed'}}
    ]
  };
  if(sectorN>0&&grouped.themes.length>0){
    const gapIdx=sectorN;
    opt.xAxis.splitLine={show:true,lineStyle:{color:'rgba(148,163,184,.2)',width:2,type:'dashed'}};
    opt.series[0].markLine={
      silent:true,symbol:'none',
      lineStyle:{color:'rgba(148,163,184,.18)',width:2,type:'dashed'},
      data:[{xAxis:gapIdx+0.5}]
    };
  }
  chart.setOption(opt);
  chart.on('click',p=>{
    const d=p.data;
    if(!d?.tk||!S[d.tk]) return;
    clickTileByTk(d.tk);
  });
  chart.on('mouseover',p=>{
    if(!p.data?.tk) return;
    document.querySelectorAll('.gl-row-item').forEach(n=>{
      n.classList.toggle('gl-row-hl',n.dataset.ri==String(p.data.value[1]));
    });
  });
  chart.on('mouseout',()=>{
    document.querySelectorAll('.gl-row-item').forEach(n=>n.classList.remove('gl-row-hl'));
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
  const hubs=globalFilteredHubs(index);
  const mode=typeof SANKEY_WEIGHT!=='undefined'?SANKEY_WEIGHT:'mcap';
  const wrap=document.createElement('div');
  wrap.className='gl-wrap gl-wrap-flow';
  if(!hubs.length){
    wrap.innerHTML=`${globalToolbarHtml(index)}${globalEmptyHtml(index)}`;
    el.appendChild(wrap);
    return;
  }
  const built=buildMegaSankeyCollapsed(index,mode);
  wrap.innerHTML=`${globalToolbarHtml(index)}
    <div class="skf-chart gl-flow-chart" id="gl-flow-chart"></div>
    <div class="skf-hint">Collapsed mega flow · top bridge stocks per map · click leaf for detail</div>`;
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
          return `<b>${tk}</b> ${st.n||''}<br/>${index.overlap[tk]?.count||0} maps`;
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

function buildOrbitalGraphElements(index){
  const hubs=globalFilteredHubs(index);
  const maps=index.universes;
  const n=maps.length||1;
  const R=260;
  const mapPos={};
  maps.forEach((u,i)=>{
    const ang=(2*Math.PI*i)/n-Math.PI/2;
    mapPos[u.key]={x:R*Math.cos(ang),y:R*Math.sin(ang),u};
  });
  const els=[];
  maps.forEach(u=>{
    const p=mapPos[u.key];
    els.push({
      data:{id:u.key,label:u.label,type:'map',mapType:u.type,color:u.color||'#4d9fff'},
      position:{x:p.x,y:p.y}
    });
  });
  if(GLOBAL_GRAPH_LAYERS){
    const layerSeen=new Set();
    index.memberships.forEach(m=>{
      if(!hubs.find(h=>h.tk===m.tk)) return;
      const lid=`${m.universeKey}:${m.layerId}`;
      if(layerSeen.has(lid)) return;
      layerSeen.add(lid);
      const mp=mapPos[m.universeKey];
      if(!mp) return;
      const ang=Math.atan2(mp.y,mp.x);
      const lr=180;
      els.push({
        data:{id:lid,label:m.layerName,type:'layer',parent:m.universeKey},
        position:{x:lr*Math.cos(ang),y:lr*Math.sin(ang)}
      });
    });
  }
  hubs.forEach(h=>{
    const tk=h.tk;
    const st=S[tk];
    const pts=h.universes.map(k=>mapPos[k]).filter(Boolean);
    let x=0,y=0;
    pts.forEach(p=>{ x+=p.x; y+=p.y; });
    if(pts.length){ x/=pts.length; y/=pts.length; }
    x*=0.5; y*=0.5;
    const sz=26+Math.min(22,Math.sqrt(st?.mc||1)*2.2);
    els.push({
      data:{id:`stock:${tk}`,label:tk,type:'stock',overlap:h.count,mcap:st?.mc||0,size:sz},
      position:{x,y}
    });
    h.universes.forEach(ukey=>{
      const mem=NexusGlobalIndex.membershipFor(index,tk,ukey);
      const target=GLOBAL_GRAPH_LAYERS&&mem?`${ukey}:${mem.layerId}`:ukey;
      els.push({
        data:{
          id:`e:${tk}:${ukey}`,
          source:`stock:${tk}`,
          target,
          layerName:mem?.layerName||'',
          mapLabel:mem?NexusGlobalIndex.mapDisplayLabel(mapPos[ukey]?.u):ukey
        }
      });
    });
  });
  return els;
}

function globalGraphResetStyles(cy){
  cy.elements().removeClass('dim hl');
}

function globalGraphHighlightMap(cy,mapId){
  globalGraphResetStyles(cy);
  const mapNode=cy.getElementById(mapId);
  if(!mapNode.length) return;
  mapNode.addClass('hl');
  const hood=cy.collection().merge(mapNode);
  cy.nodes().forEach(n=>{
    const id=n.id();
    if(id.startsWith(mapId+':')) hood.merge(n);
  });
  cy.edges().forEach(e=>{
    const sid=e.source().id();
    const tid=e.target().id();
    if(sid===mapId||tid===mapId||sid.startsWith(mapId+':')||tid.startsWith(mapId+':')){
      hood.merge(e).merge(e.source()).merge(e.target());
    }
  });
  cy.elements().not(hood).addClass('dim');
}

function globalGraphHighlightStock(cy,stockId){
  globalGraphResetStyles(cy);
  const stockNode=cy.getElementById(stockId);
  if(!stockNode.length) return;
  stockNode.addClass('hl');
  const hood=stockNode.closedNeighborhood();
  cy.elements().not(hood).addClass('dim');
}

function renderGlobalGraph(el,index){
  const hubs=globalFilteredHubs(index);
  const wrap=document.createElement('div');
  wrap.className='gl-wrap gl-wrap-graph';
  if(!hubs.length){
    wrap.innerHTML=`${globalToolbarHtml(index)}${globalEmptyHtml(index)}`;
    el.appendChild(wrap);
    return;
  }
  wrap.innerHTML=`${globalToolbarHtml(index)}
    <div class="gl-graph-split">
      <div class="gl-cy-wrap">
        <div class="gl-cy" id="gl-cy-chart"></div>
        <div class="gl-graph-legend">Maps = sector/theme pyramids · Lines = membership · Hover edge for layer</div>
      </div>
      ${globalBridgeSidebarHtml(index,hubs)}
    </div>`;
  el.appendChild(wrap);
  const host=document.getElementById('gl-cy-chart');
  if(!host||typeof cytoscape==='undefined'){
    if(host) host.innerHTML='<p class="gl-err">Cytoscape failed to load.</p>';
    return;
  }
  const tip=document.createElement('div');
  tip.className='gl-graph-tip';
  tip.style.display='none';
  host.appendChild(tip);
  el._glTip=tip;
  const cy=cytoscape({
    container:host,
    elements:buildOrbitalGraphElements(index),
    style:[
      {selector:'node[type="map"]',style:{
        'background-opacity':0.08,
        'background-color':'data(color)',
        'border-width':3,'border-color':'data(color)','border-opacity':0.85,
        'shape':'round-rectangle','width':72,'height':36,
        'label':'data(label)','font-size':11,'font-weight':700,'color':'#eef2ff',
        'text-valign':'center','text-halign':'center',
        'font-family':'Barlow Condensed,sans-serif'
      }},
      {selector:'node[type="layer"]',style:{
        'background-color':'#1e293b','border-width':1,'border-color':'#64748b',
        'label':'data(label)','font-size':8,'color':'#94a3b8',
        'width':22,'height':22
      }},
      {selector:'node[type="stock"]',style:{
        'background-color':ele=>{const st=S[ele.data('label')];return(st?.ch||0)>=0?'#00c97a':'#ff4757';},
        'label':'data(label)','font-size':10,'font-weight':700,'font-family':'IBM Plex Mono,monospace',
        'color':'#fff','text-outline-width':2,'text-outline-color':'#0c0e18',
        'width':'data(size)','height':'data(size)'
      }},
      {selector:'edge',style:{
        'width':1,'line-color':'#64748b','opacity':0.35,'curve-style':'bezier'
      }},
      {selector:'.dim',style:{opacity:0.12}},
      {selector:'.hl',style:{'border-width':4,'z-index':10}},
      {selector:'edge.hl',style:{opacity:0.85,'line-color':'#94a3b8','width':2}}
    ],
    layout:{name:'preset',fit:true,padding:40},
    wheelSensitivity:0.3
  });
  el._nexusCy=cy;
  cy.on('tap','node[type="stock"]',evt=>{
    globalGraphHighlightStock(cy,evt.target.id());
    const tk=evt.target.data('label');
    if(tk&&S[tk]) clickTileByTk(tk);
  });
  cy.on('tap','node[type="map"]',evt=>{
    globalGraphHighlightMap(cy,evt.target.id());
  });
  cy.on('tap',evt=>{
    if(evt.target===cy) globalGraphResetStyles(cy);
  });
  cy.on('mouseover','edge',evt=>{
    const e=evt.target;
    const layer=e.data('layerName');
    const map=e.data('mapLabel');
    if(!layer&&!map) return;
    tip.textContent=map?`${map} · ${layer}`:layer;
    tip.style.display='block';
    e.addClass('hl');
  });
  cy.on('mouseout','edge',evt=>{
    tip.style.display='none';
    evt.target.removeClass('hl');
  });
  cy.on('mousemove',evt=>{
    if(tip.style.display==='block'){
      const r=host.getBoundingClientRect();
      tip.style.left=(evt.originalEvent.clientX-r.left+12)+'px';
      tip.style.top=(evt.originalEvent.clientY-r.top+12)+'px';
    }
  });
  if(SEL_STOCK){
    const sid=`stock:${SEL_STOCK}`;
    if(cy.getElementById(sid).length) globalGraphHighlightStock(cy,sid);
  }
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
