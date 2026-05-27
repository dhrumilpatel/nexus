// NEXUS — Watchlist (Left Panel)
// Groups stocks by layer (pyramid) or category (flat) with collapsible sections.
// WL_LAYERS collapse state lives in app/state.js.

function renderWatchlist(){
  const c=getActiveColor();
  let html='';

  if(NAV_MODE==='etf'){
    const etf=getActiveEtf();
    const holdings=getActiveEtfHoldings();
    if(!etf){document.getElementById('wl-sc').innerHTML='';document.getElementById('wlcnt').textContent='0';return;}
    html+=`<div class="wl-lhdr" style="cursor:default">
      <span class="wl-ln op" style="color:${c}">${etf.label}</span>
      <span class="wl-lc">${holdings.length}</span>
    </div>`;
    holdings.forEach(h=>{
      const st=typeof S!=='undefined'?S[h.tk]:null;
      const u=st?(st.ch>=0):true;
      html+=`<div class="wl-row${SEL_STOCK===h.tk?' on':''}" data-nexus-tk="${st?h.tk:''}" onclick="clickEtfHolding('${h.tk}')">
        <div class="wr-tk" style="color:${c}">${h.tk}</div>
        <div class="wr-px">${st?st.px:(h.weight||0).toFixed(1)+'%'}</div>
        <div class="wr-nm">${h.name.slice(0,22)}</div>
        <div class="wr-ch ${st?(u?'up':'dn'):''}">${st?pct(st.ch,1):(h.weight||0).toFixed(2)+'% wt'}</div>
      </div>`;
    });
    document.getElementById('wl-sc').innerHTML=html;
    document.getElementById('wlcnt').textContent=holdings.length;
    return;
  }

  const p=getCurrentP(); if(!p) return;

  if(p.type==='flat'){
    p.categories.forEach(cat=>{
      html+=`<div class="wl-lhdr" style="cursor:default">
        <span class="wl-ln op" style="color:${c}">${cat.name}</span>
      </div>`;
      cat.stocks.forEach(tk=>{
        const st=S[tk]; if(!st) return;
        const u=st.ch>=0;
        html+=`<div class="wl-row${SEL_STOCK===tk?' on':''}" data-nexus-tk="${tk}" onclick="clickTileByTk('${tk}')">
          <div class="wr-tk" style="color:${c}">${tk}</div>
          <div class="wr-px">${st.px}</div>
          <div class="wr-nm">${st.n.split(' ').slice(0,3).join(' ')}</div>
          <div class="wr-ch ${u?'up':'dn'}">${pct(st.ch,1)}</div>
        </div>`;
      });
    });
  } else {
    // Multi-layer pin section
    const ml=Object.keys(p.multiLayer||{});
    if(ml.length){
      html+=`<div class="ml-pin">
        <div class="ml-pin-lbl">MULTI-LAYER</div>
        <div class="mlchips">${ml.map(tk=>`<span class="mlchip" onclick="clickTileByTk('${tk}')">${tk}</span>`).join('')}</div>
      </div>`;
    }
    p.layers.forEach(l=>{
      const isOpen=WL_LAYERS[l.id]!==undefined?WL_LAYERS[l.id]:(l.id==='compute'||l.id==='design'||l.id==='qpu');
      html+=`<div class="wl-lhdr" onclick="toggleLayer('${l.id}')">
        <span class="wl-arr ${isOpen?'op':''}">&#9658;</span>
        <span class="wl-ln ${isOpen?'op':''}">${l.name.split(' ').slice(0,2).join(' ')}</span>
        <span class="wl-lc">${l.stocks.length}</span>
      </div><div class="wl-rows ${isOpen?'op':''}">`;
      l.stocks.forEach(tk=>{
        const st=S[tk]; if(!st) return;
        const u=st.ch>=0, isMl=p.multiLayer?.[tk];
        html+=`<div class="wl-row${SEL_STOCK===tk?' on':''}" data-nexus-tk="${tk}" style="${SEL_STOCK===tk?'border-left-color:'+c:''}" onclick="clickTileByTk('${tk}')">
          <div class="wr-tk" style="color:${c}">${tk}${isMl?`<span class="ml-badge">x${isMl.length+1}L</span>`:''}</div>
          <div class="wr-px">${st.px}</div>
          <div class="wr-nm">${st.n.slice(0,22)}</div>
          <div class="wr-ch ${u?'up':'dn'}">${pct(st.ch,1)}</div>
        </div>`;
      });
      html+=`</div>`;
    });
  }

  document.getElementById('wl-sc').innerHTML=html;
  document.getElementById('wlcnt').textContent=getActiveStocks().length;
}

function toggleLayer(id){
  WL_LAYERS[id]=!WL_LAYERS[id];
  renderWatchlist();
}
