// NEXUS — Flat View (Commodity Grid)
// Used when getCurrentP().type === 'flat' — currently COMMODITY sector only.
// No Sankey, no layers. Groups stocks by category in a flat tile grid.

function renderFlatView(el){
  document.getElementById('sumbar').innerHTML='';
  const p=PYRAMIDS[CUR];
  const wrap=document.createElement('div'); wrap.className='flat-wrap';

  p.categories.forEach(cat=>{
    const catMC=cat.stocks.map(tk=>S[tk]?.mc||0).reduce((a,v)=>a+v,0);
    const div=document.createElement('div'); div.className='flat-cat';
    let tiles='';

    cat.stocks.forEach(tk=>{
      const st=S[tk]; if(!st) return;
      const u=st.ch>=0;
      const yu=st.ytd?.startsWith?.('+');
      tiles+=`<div class="flat-tile${SEL_STOCK===tk?' sel':''}" data-nexus-tk="${tk}" onclick="clickTile({stopPropagation:()=>{}},'${tk}')">
        <div class="tile-tk">${tk}</div>
        <div class="tile-co">${st.n.split(' ').slice(0,4).join(' ')}</div>
        <div class="tile-px" style="margin-top:4px;font-size:var(--f14);font-family:'IBM Plex Mono',monospace;font-weight:600;color:var(--txt)">${st.px}</div>
        <div class="tile-ch ${u?'up':'dn'}">${pct(st.ch)}</div>
        ${st.ytd?`<div class="tile-ytd ${yu?'up':'dn'}">YTD ${st.ytd}</div>`:''}
        <div class="tile-mc" style="margin-top:2px">${st.ms}</div>
      </div>`;
    });

    div.innerHTML=`<div class="flat-cat-hdr">
      <span class="flat-cat-nm">${cat.name}</span>
      <span class="flat-cat-sub">${cat.desc||''} · $${fmtB(catMC)}</span>
    </div>
    <div class="flat-tiles">${tiles}</div>`;
    wrap.appendChild(div);
  });
  el.appendChild(wrap);
}
