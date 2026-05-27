// NEXUS — WHEEL Bubble Scatter View
// 4 dimensions: X=YTD return, Y=P/E ratio, size=MCap, color=today's % change.
// Replaces view-heatmap.js. Phase 1B+.
// Reads: S, getCurrentP(), getActiveStocks(), SEL_STOCK — globals from state.js

function renderWheelView(el){
  const p=getCurrentP();
  if(!p){el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--dim)">No active pyramid</div>';return;}

  const allTks=getActiveStocks();
  const idxMap=sectorMcapWeights(allTks).map;
  const data=allTks.map(tk=>{
    const st=S[tk]; if(!st||!st.mc) return null;
    return{tk,...st,idxW:idxMap[tk]||0};
  }).filter(Boolean);
  if(!data.length){el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--dim)">No stock data</div>';return;}

  const svgW=820, svgH=520, pad={l:58,r:22,t:36,b:48};
  const plotW=svgW-pad.l-pad.r, plotH=svgH-pad.t-pad.b;

  // X: YTD — log-compress above 200% to prevent extreme outliers crushing chart
  function compYTD(v){
    if(!v&&v!==0) v=0;
    if(v>200) return 200+Math.log((v-200)/50+1)*62;
    return Math.max(v,-80);
  }
  const cYTDs=data.map(d=>compYTD(d.ytd||0));
  const minY=Math.min(-30,...cYTDs), maxY=Math.max(150,...cYTDs), rngY=maxY-minY||1;

  // Y: P/E — sqrt scale capped at 400x
  function yPx(pe){
    if(!pe||pe<=0) return pad.t+plotH-6;
    return pad.t+plotH-(Math.sqrt(Math.min(pe,400))/Math.sqrt(400))*plotH;
  }
  function xPx(ytd){return pad.l+((compYTD(ytd||0)-minY)/rngY)*plotW;}

  // Bubble size: sqrt(MCap) normalised 5-23px radius
  const sqrts=data.map(d=>Math.sqrt(d.mc));
  const mnS=Math.min(...sqrts), mxS=Math.max(...sqrts), rngS=mxS-mnS||1;
  function bubR(mc){return 5+((Math.sqrt(mc)-mnS)/rngS)*18;}

  function bClr(ch){
    if(ch>=5) return'#00c97a'; if(ch>=2) return'#4ddb9a';
    if(ch>=0) return'#6ee7b7'; if(ch>=-2) return'#ff8a8a';
    if(ch>=-5) return'#ff4757'; return'#c0392b';
  }

  const splitX=xPx(0), splitY=yPx(50);

  let svg=`<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%">`;

  // Quadrant zones
  svg+=`<rect x="${pad.l}" y="${pad.t}" width="${(splitX-pad.l).toFixed(1)}" height="${(splitY-pad.t).toFixed(1)}" fill="rgba(255,71,87,.04)"/>`;
  svg+=`<rect x="${splitX.toFixed(1)}" y="${pad.t}" width="${(svgW-pad.r-splitX).toFixed(1)}" height="${(splitY-pad.t).toFixed(1)}" fill="rgba(245,166,35,.05)"/>`;
  svg+=`<rect x="${pad.l}" y="${splitY.toFixed(1)}" width="${(splitX-pad.l).toFixed(1)}" height="${(svgH-pad.b-splitY).toFixed(1)}" fill="rgba(61,154,255,.04)"/>`;
  svg+=`<rect x="${splitX.toFixed(1)}" y="${splitY.toFixed(1)}" width="${(svgW-pad.r-splitX).toFixed(1)}" height="${(svgH-pad.b-splitY).toFixed(1)}" fill="rgba(0,201,122,.05)"/>`;

  // X grid lines
  [-30,0,50,100,200,350,500].forEach(v=>{
    const x=xPx(v); if(x<pad.l||x>svgW-pad.r) return;
    const z=v===0;
    svg+=`<line x1="${x.toFixed(1)}" y1="${pad.t}" x2="${x.toFixed(1)}" y2="${svgH-pad.b}" stroke="${z?'rgba(238,242,255,.22)':'rgba(238,242,255,.07)'}" stroke-width="${z?1:.5}" stroke-dasharray="${z?'none':'4,4'}"/>`;
    svg+=`<text x="${x.toFixed(1)}" y="${svgH-pad.b+16}" text-anchor="middle" fill="rgba(238,242,255,.32)" font-family="IBM Plex Mono" font-size="9">${v>0?'+':''}${v}%</text>`;
  });

  // Y grid lines
  [0,25,50,100,200,400].forEach(v=>{
    const y=v===0?pad.t+plotH:yPx(v); if(y<pad.t-2||y>pad.t+plotH+2) return;
    const ref=v===50;
    svg+=`<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${svgW-pad.r}" y2="${y.toFixed(1)}" stroke="${ref?'rgba(238,242,255,.22)':'rgba(238,242,255,.07)'}" stroke-width="${ref?1:.5}" stroke-dasharray="${ref?'none':'4,4'}"/>`;
    svg+=`<text x="${pad.l-5}" y="${(y+3.5).toFixed(1)}" text-anchor="end" fill="rgba(238,242,255,.32)" font-family="IBM Plex Mono" font-size="9">${v?v+'x':'—'}</text>`;
  });

  // Axis titles (see legend for X/Y/size/color/idx decode)
  svg+=`<text x="${svgW/2}" y="${svgH-4}" text-anchor="middle" fill="rgba(238,242,255,.3)" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="2">YTD RETURN \u2192</text>`;
  svg+=`<text x="12" y="${svgH/2}" text-anchor="middle" fill="rgba(238,242,255,.3)" font-family="Barlow Condensed" font-size="11" font-weight="700" letter-spacing="2" transform="rotate(-90 12 ${svgH/2})">P/E RATIO \u2191</text>`;

  // Quadrant labels
  svg+=`<text x="${pad.l+6}" y="${pad.t+13}" fill="rgba(255,71,87,.45)" font-family="Barlow Condensed" font-size="9" font-weight="700" letter-spacing="1">EXPENSIVE \u00b7 LAGGING</text>`;
  svg+=`<text x="${svgW-pad.r-6}" y="${pad.t+13}" text-anchor="end" fill="rgba(245,166,35,.45)" font-family="Barlow Condensed" font-size="9" font-weight="700" letter-spacing="1">EXPENSIVE \u00b7 MOMENTUM</text>`;
  svg+=`<text x="${pad.l+6}" y="${svgH-pad.b-7}" fill="rgba(61,154,255,.45)" font-family="Barlow Condensed" font-size="9" font-weight="700" letter-spacing="1">VALUE \u00b7 LAGGING</text>`;
  svg+=`<text x="${svgW-pad.r-6}" y="${svgH-pad.b-7}" text-anchor="end" fill="rgba(0,201,122,.45)" font-family="Barlow Condensed" font-size="9" font-weight="700" letter-spacing="1">VALUE \u00b7 MOMENTUM</text>`;

  // Bubbles: render large first so small ones appear on top
  const sorted=[...data].sort((a,b)=>(b.mc||0)-(a.mc||0));
  sorted.forEach(d=>{
    const x=xPx(d.ytd||0), y=yPx(d.pe), r=bubR(d.mc);
    const c=bClr(d.ch), sel=SEL_STOCK===d.tk, noPE=!d.pe||d.pe<=0;
    const fs=Math.min(r*.9,11).toFixed(0);
    svg+=`<g class="wheel-node" data-nexus-tk="${d.tk}" style="cursor:pointer" onmouseover="wheelTT(event,'${d.tk}',${(d.idxW||0).toFixed(4)})" onmouseout="hideWTT()" onclick="clickTile({stopPropagation:()=>{}}, '${d.tk}')">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
        fill="${c}" fill-opacity="${noPE?.5:.78}"
        stroke="${sel?'#fff':c}" stroke-width="${sel?2.5:0.7}"
        stroke-dasharray="${noPE?'3,2':'none'}"/>
      ${r>8?`<text x="${x.toFixed(1)}" y="${(y+3.5).toFixed(1)}" text-anchor="middle" fill="rgba(0,0,0,.88)" font-family="Barlow Condensed" font-size="${fs}" font-weight="800" pointer-events="none">${d.tk}</text>`:''}
    </g>`;
  });

  svg+='</svg>';

  // Legend HTML
  const legend=`<div class="wheel-legend">
    <div class="wleg-t">TODAY %</div>
    ${[['#00c97a','>+5%'],['#4ddb9a','+2\u20135%'],['#6ee7b7','0\u20132%'],['#ff8a8a','-2\u20130%'],['#ff4757','-5\u2013-2%'],['#c0392b','<-5%']].map(([c,l])=>`<div class="wleg-row"><div class="wleg-dot" style="background:${c}"></div><span class="wleg-lbl">${l}</span></div>`).join('')}
    <div style="margin-top:6px;padding-top:5px;border-top:1px solid var(--b1)">
      <div class="wleg-t">SIZE = MCAP</div>
      <div class="wleg-t" style="margin-top:2px;color:var(--dim)">Dashed = No P/E</div>
    </div>
    <div style="margin-top:6px;padding-top:5px;border-top:1px solid var(--b1)">
      <div class="wleg-t">AXES</div>
      <div class="wleg-lbl" style="line-height:1.35;margin-top:2px">X = YTD % · Y = P/E</div>
      <div class="wleg-lbl" style="line-height:1.35">Color = Today % · Idx % = cap wt</div>
    </div>
  </div>`;

  const wrap=document.createElement('div');
  wrap.className='wheel-wrap';
  wrap.innerHTML=svg+legend;
  el.appendChild(wrap);
}

function wheelTT(e,tk,idxPct){
  const st=S[tk]; if(!st) return;
  const tt=document.getElementById('wheel-tt');
  const ytdCls=(st.ytd||0)>=0?'up':'dn';
  const netCls=(st.net||0)>=0?'up':'dn';
  const idx=typeof idxPct==='number'?idxPct:(sectorMcapWeights(getActiveStocks()).map[tk]||0);
  const peStr=st.pe?st.pe.toFixed(0)+'x':'N/A';
  const ytdStr=fmtYTD(st.ytd);
  tt.innerHTML=`
    <div class="wtt-tk">${tk}</div>
    <div class="wtt-nm">${st.n}</div>
    <div class="wtt-row"><span class="wtt-lbl">PRICE</span><span class="wtt-val">${st.px}</span></div>
    <div class="wtt-row"><span class="wtt-lbl">TODAY</span><span class="wtt-val ${st.ch>=0?'up':'dn'}">${pct(st.ch)}</span></div>
    <div class="wtt-row"><span class="wtt-lbl">YTD</span><span class="wtt-val ${ytdCls}">${ytdStr}</span><span class="wtt-hint"> \u2192 X</span></div>
    <div class="wtt-row"><span class="wtt-lbl">P/E</span><span class="wtt-val acc">${peStr}</span><span class="wtt-hint"> \u2191 Y</span></div>
    <div class="wtt-row"><span class="wtt-lbl">MCAP</span><span class="wtt-val acc">${st.ms}</span><span class="wtt-hint"> \u2192 size</span></div>
    <div class="wtt-row"><span class="wtt-lbl">IDX %</span><span class="wtt-val acc">${idx.toFixed(2)}%</span></div>
    <div class="wtt-note">Cap-weight % of active universe Mcap</div>
    <div class="wtt-row"><span class="wtt-lbl">REVENUE</span><span class="wtt-val">${fmtRev(st.rev)}</span></div>
    <div class="wtt-row"><span class="wtt-lbl">NET INC</span><span class="wtt-val ${netCls}">${fmtNet(st.net)}</span></div>`;
  tt.style.display='block';
  tt.style.left=Math.min(e.clientX+14,window.innerWidth-215)+'px';
  tt.style.top=Math.min(e.clientY-10,window.innerHeight-265)+'px';
}

function hideWTT(){
  document.getElementById('wheel-tt').style.display='none';
}
