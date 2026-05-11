// NEXUS — Screener View
// Sortable table of all stocks in the active sector.
// Sort state (SORT_COL, SORT_DIR) lives in app/state.js.

function renderFundamentalsView(el){
  let stks=[...new Set(getActiveStocks())].map(tk=>({tk,st:S[tk]})).filter(x=>x.st);
  if(SORT_COL==='ch')  stks.sort((a,b)=>SORT_DIR==='desc'?b.st.ch-a.st.ch:a.st.ch-b.st.ch);
  else if(SORT_COL==='ytd') stks.sort((a,b)=>SORT_DIR==='desc'?(b.st.ytd||0)-(a.st.ytd||0):(a.st.ytd||0)-(b.st.ytd||0));
  else if(SORT_COL==='mc')  stks.sort((a,b)=>SORT_DIR==='desc'?b.st.mc-a.st.mc:a.st.mc-b.st.mc);
  else if(SORT_COL==='pe')  stks.sort((a,b)=>SORT_DIR==='desc'?(b.st.pe||0)-(a.st.pe||0):(a.st.pe||0)-(b.st.pe||0));
  else stks.sort((a,b)=>SORT_DIR==='desc'?b.tk.localeCompare(a.tk):a.tk.localeCompare(b.tk));

  const arr=col=>SORT_COL===col?(SORT_DIR==='desc'?'↓':'↑'):'';
  const on=col=>SORT_COL===col?'sort-on':'';
  const wrap=document.createElement('div'); wrap.className='fund-wrap';
  wrap.innerHTML=`<table class="fund-tbl"><thead><tr>
    <th onclick="sortFund('tk')" class="${on('tk')}">TICKER<span class="sort-ic">${arr('tk')}</span></th>
    <th>COMPANY</th>
    <th onclick="sortFund('ch')" class="${on('ch')}">TODAY<span class="sort-ic">${arr('ch')}</span></th>
    <th onclick="sortFund('ytd')" class="${on('ytd')}">YTD<span class="sort-ic">${arr('ytd')}</span></th>
    <th>PRICE</th>
    <th onclick="sortFund('mc')" class="${on('mc')}">MCAP<span class="sort-ic">${arr('mc')}</span></th>
    <th onclick="sortFund('pe')" class="${on('pe')}">P/E<span class="sort-ic">${arr('pe')}</span></th>
    <th>REV</th><th>NET</th><th>RATING</th>
  </tr></thead><tbody>${stks.map(({tk,st})=>{
    const u=st.ch>=0, yu=(st.ytd||0)>=0;
    const rc={'Strong Buy':'color:var(--up)','Buy':'color:#4ddb9a','Hold':'color:var(--acc)','Sell':'color:var(--dn)'};
    return`<tr class="${SEL_STOCK===tk?'on':''}" data-nexus-tk="${tk}" onclick="clickFundRow('${tk}')">
      <td class="ft-tk">${tk}</td>
      <td class="ft-dim" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Barlow',sans-serif">${st.n}</td>
      <td class="ft-today ${u?'ft-up':'ft-dn'}">${pct(st.ch)}</td>
      <td class="${yu?'ft-up':'ft-dn'}">${fmtYTD(st.ytd)}</td>
      <td class="ft-price" style="font-weight:600">${st.px}</td>
      <td class="ft-acc">$${fmtB(st.mc)}</td>
      <td class="ft-acc">${st.pe?st.pe.toFixed(1)+'x':'—'}</td>
      <td class="ft-dim">${fmtRev(st.rev)}</td>
      <td style="${(st.net||0)>=0?'color:var(--up)':'color:var(--dn)'}">${fmtNet(st.net)}</td>
      <td style="font-size:var(--f11);${rc[st.rt]||''}">${st.rt||'—'}</td>
    </tr>`;
  }).join('')}</tbody></table>`;
  el.appendChild(wrap);
}

function sortFund(col){
  SORT_COL===col?(SORT_DIR=SORT_DIR==='desc'?'asc':'desc'):(SORT_COL=col,SORT_DIR='desc');
  renderCenter();
}

function clickFundRow(tk){
  SEL_STOCK=tk; SEL_LAYER=null;
  renderCenter(); renderWatchlist(); renderRightPanel();
}
