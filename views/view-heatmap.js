// NEXUS — Heatmap View (Phase 1A)
// Phase 1B replaces this file with view-wheel.js (bubble scatter).
// 1D color map: bubble size = MCap share of layer, color = today's % change.

function hcls(ch){
  return ch>=5?'hu5':ch>=2?'hu2':ch>=0?'hu0':ch>=-2?'hd0':ch>=-5?'hd2':'hd5';
}

function renderHeatmapView(el){
  const p=PYRAMIDS[CUR]; if(!p||!p.layers) return;
  const wrap=document.createElement('div'); wrap.className='hmap-wrap';

  p.layers.forEach(l=>{
    const stks=l.stocks.filter(tk=>S[tk]);
    const tot=stks.reduce((a,tk)=>a+Math.sqrt(S[tk].mc||1),0)||1;
    const sec=document.createElement('div');
    sec.innerHTML=`<div class="hmap-sec-lbl">${l.name.toUpperCase()}</div>
    <div class="hmap-row">${stks.map(tk=>{
      const st=S[tk], fl=(Math.sqrt(st.mc||1)/tot*100).toFixed(1);
      return`<div class="hmap-box ${hcls(st.ch)}" style="flex:${fl}" onclick="clickTile({stopPropagation:()=>{}},'${tk}')">
        <div class="hb-tk">${tk}</div>
        <div class="hb-ch">${pct(st.ch)}</div>
        <div class="hb-co">${st.n.split(' ').slice(0,2).join(' ')}</div>
        <div class="hb-mc">${st.ms}</div>
      </div>`;
    }).join('')}</div>`;
    wrap.appendChild(sec);
  });
  el.appendChild(wrap);
}
