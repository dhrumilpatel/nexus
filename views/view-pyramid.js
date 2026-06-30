// NEXUS — Sankey pyramid view
// Band row width = sqrt(layer MCap) mapped to 54–96% (tapered stack). Connectors bridge adjacent widths.
// Stock tiles: fixed width (--py-tile-w in nexus.css); narrow bands scroll horizontally.
// Reads: S, getCurrentP(), SEL_STOCK, SEL_LAYER — all globals from data/state.
// Writes: to el only. Never modifies state.

function calcSankeyWidths(layers){
  const sqrts=layers.map(l=>Math.sqrt(layerAgg(l).mc||1));
  const mn=Math.min(...sqrts), mx=Math.max(...sqrts), rng=mx-mn||1;
  return sqrts.map(s=>54+((s-mn)/rng)*42);
}

function sankeyConnector(w1,w2,color){
  const h=18;
  const l1=(100-w1)/2, r1=l1+w1, l2=(100-w2)/2, r2=l2+w2, m=h/2;
  const fill=`M${l1.toFixed(2)},0 C${l1.toFixed(2)},${m} ${l2.toFixed(2)},${m} ${l2.toFixed(2)},${h} L${r2.toFixed(2)},${h} C${r2.toFixed(2)},${m} ${r1.toFixed(2)},${m} ${r1.toFixed(2)},0 Z`;
  const eL=`M${l1.toFixed(2)},0 C${l1.toFixed(2)},${m} ${l2.toFixed(2)},${m} ${l2.toFixed(2)},${h}`;
  const eR=`M${r1.toFixed(2)},0 C${r1.toFixed(2)},${m} ${r2.toFixed(2)},${m} ${r2.toFixed(2)},${h}`;
  return `<svg class="sk-conn" height="${h}" viewBox="0 0 100 ${h}" preserveAspectRatio="none">
    <path d="${fill}" fill="${color}" opacity="0.13"/>
    <path d="${eL}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.35"/>
    <path d="${eR}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.35"/>
  </svg>`;
}

function renderPyramidView(el){
  const p=getCurrentP(); if(!p||!p.layers) return;
  const widths=calcSankeyWidths(p.layers);
  const color=getActiveColor();
  const navKey=NAV_MODE==='themes'?CUR_THEME:CUR;
  const wrap=document.createElement('div');
  wrap.className='sankey-wrap sec-'+navKey;

  p.layers.forEach((l,idx)=>{
    if(idx>0){
      const conn=document.createElement('div');
      conn.innerHTML=sankeyConnector(widths[idx-1],widths[idx],color);
      wrap.appendChild(conn);
    }

    const agg=layerAgg(l);
    const isSel=SEL_LAYER===l.id;
    const band=document.createElement('div');
    band.className=`band${isSel?' sel':''}${l.up?' upstream':''}`;
    band.style.width=widths[idx].toFixed(1)+'%';
    band.dataset.lid=l.id;

    // Build tiles
    let tiles='';
    l.stocks.forEach(tk=>{
      const st=S[tk]; if(!st) return;
      const isST=SEL_STOCK===tk;
      const netCls=st.net>=0?'tile-met-net-pos':'tile-met-net-neg';
      tiles+=`<div class="tile${isST?' sel':''}" data-nexus-tk="${tk}" onclick="clickTile(event,'${tk}')">
        <div class="tile-tk">${tk}</div>
        <div class="tile-co">${st.n.split(' ').slice(0,3).join(' ')}</div>
        <div class="tile-px">${st.px}</div>
        <div class="tile-ch ${st.ch>=0?'up':'dn'}">${pct(st.ch)}</div>
        <div class="tile-mets">
          <div class="tile-met tile-met-pe">${st.pe?st.pe.toFixed(0)+'x':'N/A'}</div>
          <div class="tile-met tile-met-mc">${st.ms}</div>
          <div class="tile-met tile-met-rev">${fmtRev(st.rev)}</div>
          <div class="tile-met ${netCls}">${fmtNet(st.net)}</div>
        </div>
      </div>`;
    });

    const agCh=agg.avgCh;
    band.innerHTML=`
      <div class="bh" onclick="clickBand(event,'${l.id}')">
        <div class="bh-left">
          <div class="bh-nm">${l.name}${l.up?' · UPSTREAM':''}</div>
          <div class="bh-th">${l.theme}</div>
        </div>
        <div class="bh-agg">
          <span class="bh-mc">$${fmtB(agg.mc)}</span>
          <span class="bh-pe">${agg.avgPE?'P/E '+agg.avgPE.toFixed(0)+'x':'—'}</span>
          <span class="bh-ch ${agCh>=0?'up':'dn'}">${pct(agCh,1)}</span>
        </div>
      </div>
      <div class="band-tiles">${tiles}</div>`;
    wrap.appendChild(band);
  });
  el.appendChild(wrap);
}
