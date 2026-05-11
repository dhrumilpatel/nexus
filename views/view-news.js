// NEXUS — Intelligence / News View
// Left: Perplexity Research placeholder (Phase 3).
// Right: TradingView news timeline (live), Finnhub sentiment (Phase 2), SEC (Phase 3).
// TradingView widget uses 300ms debounce to avoid iframe conflicts.

let newsDbn=null;

function renderNewsView(el){
  const cz=document.createElement('div'); cz.className='news-cz';
  const sym=SEL_STOCK||'NVDA';

  const left=document.createElement('div'); left.className='news-left';
  left.innerHTML=`
    <div class="np-hdr">
      <div class="np-title">◈ PERPLEXITY RESEARCH</div>
      <div class="np-sub">AI-powered intelligence · Phase 3</div>
    </div>
    <div class="np-inp-wrap">
      <input class="np-inp" id="perp-q" placeholder="Why is ${sym} moving today? ${CUR} sector catalysts?"/>
      <button class="np-btn" onclick="mockPerp()">RESEARCH →</button>
    </div>
    <div class="np-resp" id="perp-resp">
      <div style="color:var(--acc);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.1em;margin-bottom:8px">// INTELLIGENCE CENTER</div>
      ${SEL_STOCK&&S[SEL_STOCK]?`
        <div style="color:var(--txt2)">Researching: <strong style="color:var(--acc)">${SEL_STOCK}</strong></div>
        <div style="margin-top:8px;color:var(--muted)">Suggested questions:</div>
        <div style="color:var(--muted);margin-top:5px;line-height:1.8">
          · Why is ${SEL_STOCK} moving today?<br>
          · Analyst outlook for ${SEL_STOCK} next quarter?<br>
          · Key risks for ${SEL_STOCK} position?<br>
          · Compare ${SEL_STOCK} to sector peers
        </div>
      `:`<div style="color:var(--muted)">Select a stock from the pyramid to generate research questions.</div>`}
      <div style="margin-top:12px;font-size:var(--f11);color:var(--dim);font-family:'IBM Plex Mono',monospace">⟳ Phase 3: Perplexity Sonar Pro + real-time web search</div>
    </div>`;

  const right=document.createElement('div'); right.className='news-right';
  right.innerHTML=`<div class="nsrc-tabs">
    <button class="nstab on" onclick="setNewsSrc('tv',this)">TRADINGVIEW</button>
    <button class="nstab" onclick="setNewsSrc('finnhub',this)">FINNHUB</button>
    <button class="nstab" onclick="setNewsSrc('sec',this)">SEC EDGAR</button>
  </div>`;

  const feed=document.createElement('div');
  feed.id='news-feed'; feed.className='news-feed';
  right.appendChild(feed);
  cz.appendChild(left); cz.appendChild(right); el.appendChild(cz);
  loadNewsFeed();
}

function loadNewsFeed(){
  const feed=document.getElementById('news-feed'); if(!feed) return;
  if(NEWS_SRC==='tv'){
    feed.innerHTML='';
    clearTimeout(newsDbn);
    newsDbn=setTimeout(()=>{
      const w=document.createElement('div');
      w.className='tradingview-widget-container'; w.style='position:absolute;inset:0';
      const i=document.createElement('div');
      i.className='tradingview-widget-container__widget'; i.style='height:100%;width:100%';
      w.appendChild(i); feed.appendChild(w);
      const sc=document.createElement('script');
      sc.src='https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
      sc.async=true;
      sc.innerHTML=JSON.stringify({
        feedMode:SEL_STOCK?'symbol':'market',
        symbol:SEL_STOCK?getTVSym(SEL_STOCK):'',
        market:'stock',colorTheme:'dark',isTransparent:true,
        displayMode:'regular',width:'100%',height:'100%',locale:'en'
      });
      w.appendChild(sc);
    },300);
  } else {
    feed.innerHTML=`<div class="news-phase">
      <div class="npm-t">${NEWS_SRC==='finnhub'?'FINNHUB SENTIMENT':'SEC EDGAR'}</div>
      <div class="npm-s">${NEWS_SRC==='finnhub'?'Real-time sentiment scores · Phase 2':'Form 4 · 8-K filings · Phase 3'}</div>
    </div>`;
  }
}

function setNewsSrc(src,btn){
  NEWS_SRC=src;
  document.querySelectorAll('.nstab').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  loadNewsFeed();
}

function mockPerp(){
  const q=document.getElementById('perp-q')?.value.trim(); if(!q) return;
  document.getElementById('perp-resp').innerHTML=`
    <div style="color:var(--acc);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.1em;margin-bottom:8px">// ANALYZING...</div>
    <div style="color:var(--muted)">⟳ Querying Perplexity Sonar Pro...</div>
    <div style="margin-top:10px;color:var(--dim);font-size:var(--f11)">Phase 3 integration pending.<br>Will deliver sourced answers with citations.</div>`;
}
