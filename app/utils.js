// NEXUS — Utility Functions
// Pure functions only. No state. No DOM. Safe to call from anywhere.
// Depends on: SEC_COLORS (state.js) and S (stocks.js) at call time — not at definition time.

const fmtB=v=>v>=1000?(v/1000).toFixed(2)+'T':v>=1?v.toFixed(0)+'B':(v*1000).toFixed(0)+'M';
const pct=(v,d=2)=>(v>=0?'+':'')+v.toFixed(d)+'%';

function fmtRev(v){
  if(v===null||v===undefined) return '—';
  if(v>=1000) return '$'+(v/1000).toFixed(1)+'T';
  if(v>=1)    return '$'+Math.round(v)+'B';
  return '$'+(v*1000).toFixed(0)+'M';
}

function fmtNet(v){
  if(v===null||v===undefined) return '—';
  const a=Math.abs(v);
  const s=a>=1?'$'+a.toFixed(1)+'B':'$'+(a*1000).toFixed(0)+'M';
  return (v>=0?'&#9650;':'&#9660;')+s;
}

function fmtYTD(v){
  if(v===null||v===undefined) return '—';
  return (v>=0?'+':'')+v.toFixed(1)+'%';
}

function secColor(s){return SEC_COLORS[s]||'#4d9fff';}

/** Cap-weight % of each ticker vs sum of Mcap ($B) in the given list — custom sector index weights. */
function sectorMcapWeights(tickerKeys){
  const map=Object.create(null);
  if(!Array.isArray(tickerKeys)||typeof S==='undefined') return{totalMc:0,map};
  let tot=0;
  const rows=[];
  tickerKeys.forEach(tk=>{
    const st=S[tk];
    if(st&&typeof st.mc==='number'&&st.mc>0){ tot+=st.mc; rows.push({tk,mc:st.mc}); }
  });
  if(tot<=0) return{totalMc:0,map};
  rows.forEach(({tk,mc})=>{ map[tk]=(mc/tot)*100; });
  return{totalMc:tot,map};
}

function maxMcapWeightTicker(tickerKeys){
  const{map}=sectorMcapWeights(tickerKeys);
  let bestTk='',best=0;
  Object.keys(map).forEach(tk=>{ if(map[tk]>best){ best=map[tk]; bestTk=tk; } });
  return{tk:bestTk,w:best};
}

/** Finnhub/WebSocket symbol (no exchange prefix for US; .L suffix for London). */
function getFinnhubSymbol(tk){
  const st=typeof S!=='undefined'?S[tk]:null;
  if(st?.yahooSym) return null;
  const tv=getTVSym(tk);
  const m=tv.match(/^(NASDAQ|NYSE|AMEX):(.+)$/i);
  if(m) return m[2];
  if(/^LON:/i.test(tv)) return tv.slice(4)+'.L';
  if(/^TSX:/i.test(tv)) return tv.slice(4)+'.TO';
  return tk;
}

/** Yahoo Finance symbol for intl quotes (Finnhub free tier misses OMX etc.). */
function getYahooSymbol(tk){
  const st=typeof S!=='undefined'?S[tk]:null;
  return st?.yahooSym||null;
}

function getTVSym(tk){
  const m={
    NVDA:'NASDAQ:NVDA',MSFT:'NASDAQ:MSFT',AMZN:'NASDAQ:AMZN',GOOGL:'NASDAQ:GOOGL',
    META:'NASDAQ:META',AVGO:'NASDAQ:AVGO',INTC:'NASDAQ:INTC',PLTR:'NASDAQ:PLTR',
    DELL:'NYSE:DELL',CRWV:'NASDAQ:CRWV',ANET:'NYSE:ANET',MRVL:'NASDAQ:MRVL',
    CIEN:'NYSE:CIEN',CRDO:'NASDAQ:CRDO',SNDK:'NASDAQ:SNDK',EQIX:'NASDAQ:EQIX',
    MPWR:'NASDAQ:MPWR',AMAT:'NASDAQ:AMAT',LRCX:'NASDAQ:LRCX',KLAC:'NASDAQ:KLAC',
    ENTG:'NASDAQ:ENTG',AMKR:'NASDAQ:AMKR',
    ASML:'NASDAQ:ASML',TSM:'NYSE:TSM',OXIG:'LON:OXIG',
    LHX:'NYSE:LHX',LDOS:'NYSE:LDOS',BAH:'NYSE:BAH',IRDM:'NASDAQ:IRDM',
    ASTS:'NASDAQ:ASTS',PL:'NYSE:PL',RKLB:'NASDAQ:RKLB',
    AAC:'OMXSTO:AAC',ACCON:'OMXSTO:ACCON',RAYB:'OMXSTO:RAY_B',SAABB:'OMXSTO:SAAB_B',UNIBAP:'OMXSTO:UNIBAP',
    BBAI:'NYSE:BBAI',PI:'NASDAQ:PI',RBOT:'NYSE:RBOT',RXRX:'NASDAQ:RXRX',SDGR:'NASDAQ:SDGR',
    FLY:'NYSE:FLY',SATL:'NASDAQ:SATL',SPIR:'NYSE:SPIR',BKSY:'NYSE:BKSY',
    VSAT:'NASDAQ:VSAT',GSAT:'NYSE:GSAT',SATS:'NASDAQ:SATS',TSAT:'TSX:TSAT',
    LUNR:'NASDAQ:LUNR',MDA:'TSX:MDA',RDW:'NYSE:RDW',SIDU:'NASDAQ:SIDU',
    VOYG:'NASDAQ:VOYG',GILT:'NASDAQ:GILT',CW:'NYSE:CW',
    LMT:'NYSE:LMT',BA:'NYSE:BA',RTX:'NYSE:RTX',NOC:'NYSE:NOC',MP:'NYSE:MP',
    IBM:'NYSE:IBM',IONQ:'NYSE:IONQ',RGTI:'NASDAQ:RGTI',QBTS:'NYSE:QBTS',
    QUBT:'NASDAQ:QUBT',ARQQ:'NASDAQ:ARQQ',
    COHR:'NASDAQ:COHR',VIAV:'NASDAQ:VIAV',LITE:'NASDAQ:LITE',
    AAOI:'NASDAQ:AAOI',VECO:'NASDAQ:VECO',ACLS:'NASDAQ:ACLS',ONTO:'NYSE:ONTO',
    SIVE:'NASDAQ:SIVE',IQE:'LON:IQE',ALRIB:'EPA:ALRIB',WOLF:'NYSE:WOLF',
    AIXA:'FRA:AIXA',HIMX:'NASDAQ:HIMX',ASX:'NYSE:ASX',SMTC:'NASDAQ:SMTC',
    COHU:'NASDAQ:COHU',SANM:'NASDAQ:SANM',XFAB:'NYSE:XFAB',ALMU:'NASDAQ:ALMU',
    TECK:'NYSE:TECK',
    ZS:'NASDAQ:ZS',TENB:'NASDAQ:TENB',OKTA:'NASDAQ:OKTA',FFIV:'NASDAQ:FFIV',
    INFY:'NYSE:INFY',CRWD:'NASDAQ:CRWD',S:'NYSE:S',RPD:'NASDAQ:RPD',
    FTNT:'NASDAQ:FTNT',CHKP:'NASDAQ:CHKP',PSN:'NYSE:PSN',VRNS:'NASDAQ:VRNS',
    NET:'NYSE:NET',PANW:'NASDAQ:PANW',RBRK:'NYSE:RBRK',ATEN:'NYSE:ATEN',
    YOU:'NYSE:YOU',SCWX:'NASDAQ:SCWX',
    VPG:'NYSE:VPG',OII:'NYSE:OII',AMPX:'NYSE:AMPX',ROK:'NYSE:ROK',KULR:'AMEX:KULR',
    GD:'NYSE:GD',KRKNF:'OTC:KRKNF',SYK:'NYSE:SYK',MDT:'NYSE:MDT',QS:'NYSE:QS',
    PATH:'NYSE:PATH',ABB:'NYSE:ABB',XPEV:'NYSE:XPEV',ISRG:'NASDAQ:ISRG',TSLA:'NASDAQ:TSLA',
    CGNX:'NASDAQ:CGNX',OUST:'NASDAQ:OUST',AUR:'NASDAQ:AUR',HON:'NASDAQ:HON',LECO:'NASDAQ:LECO',
    ZBRA:'NASDAQ:ZBRA',INDI:'NASDAQ:INDI',FLNC:'NASDAQ:FLNC',AMBA:'NASDAQ:AMBA',PRCT:'NASDAQ:PRCT',
    SYM:'NASDAQ:SYM',INVZ:'NASDAQ:INVZ',KTOS:'NASDAQ:KTOS',SLDP:'NASDAQ:SLDP',RRR:'NASDAQ:RRR',
    SERV:'NASDAQ:SERV',AMBQ:'NASDAQ:AMBQ',
    SOI:'EPA:SOI',NBIS:'NASDAQ:NBIS',BRUN:'NASDAQ:BRUN',WYFI:'NASDAQ:WYFI',HPE:'NYSE:HPE',
    APLD:'NASDAQ:APLD',INOD:'NASDAQ:INOD',GEV:'NYSE:GEV',DDOG:'NASDAQ:DDOG',IREN:'NASDAQ:IREN',
    RMBS:'NASDAQ:RMBS',TE:'NYSE:TE',CLS:'NYSE:CLS',P:'NYSE:P',SNOW:'NYSE:SNOW',
    ALAB:'NASDAQ:ALAB',QCOM:'NASDAQ:QCOM',MCHP:'NASDAQ:MCHP',
    TER:'NASDAQ:TER',LSCC:'NASDAQ:LSCC',FORM:'NASDAQ:FORM',MXL:'NYSE:MXL',MTSI:'NASDAQ:MTSI',KLIC:'NASDAQ:KLIC',ICHR:'NASDAQ:ICHR',DIOD:'NASDAQ:DIOD',    NVTS:'NASDAQ:NVTS',
    GLW:'NYSE:GLW',LWLG:'NASDAQ:LWLG',AXTI:'NASDAQ:AXTI',FN:'NYSE:FN',IPGP:'NASDAQ:IPGP',LPTH:'NASDAQ:LPTH',LASR:'NASDAQ:LASR',LASE:'NASDAQ:LASE',OPTX:'NASDAQ:OPTX',POET:'NASDAQ:POET',CSCO:'NASDAQ:CSCO',AEHR:'NASDAQ:AEHR',
    SNPS:'NASDAQ:SNPS',CDNS:'NASDAQ:CDNS',TXN:'NASDAQ:TXN',
    STM:'NYSE:STM',ON:'NASDAQ:ON',GFS:'NASDAQ:GFS',UMC:'NYSE:UMC',
    TSEM:'NASDAQ:TSEM',MKSI:'NASDAQ:MKSI',CMC:'NYSE:CMC',
    CCJ:'NYSE:CCJ',URA:'AMEX:URA',GLD:'NASDAQ:GLD',
    SLV:'AMEX:SLV',PPLT:'AMEX:PPLT',USO:'AMEX:USO',DBA:'AMEX:DBA',DBC:'AMEX:DBC',
    COPX:'AMEX:COPX',CPER:'AMEX:CPER',ALB:'NYSE:ALB',LTHM:'NYSE:LTHM',LAC:'NYSE:LAC',
  };
  return m[tk]||`NASDAQ:${tk}`;
}

function layerAgg(layer){
  const stks=layer.stocks.map(tk=>S[tk]).filter(Boolean);
  const mc=stks.reduce((a,s)=>a+(s.mc||0),0);
  const rev=stks.reduce((a,s)=>a+((typeof s.rev==='number'&&s.rev>0)?s.rev:0),0);
  const pes=stks.filter(s=>s.pe).map(s=>s.pe);
  return{
    mc,
    rev,
    avgPE:pes.length?pes.reduce((a,v)=>a+v,0)/pes.length:null,
    avgCh:stks.reduce((a,s)=>a+s.ch,0)/(stks.length||1),
    count:stks.length
  };
}

function sectorSummary(sec){
  const stks=getAllStocks(sec).map(tk=>S[tk]).filter(Boolean);
  const mc=stks.reduce((a,s)=>a+(s.mc||0),0);
  const pes=stks.filter(s=>s.pe).map(s=>s.pe);
  return{
    mc,
    avgPE:pes.length?pes.reduce((a,v)=>a+v,0)/pes.length:null,
    avgCh:stks.reduce((a,s)=>a+s.ch,0)/(stks.length||1)
  };
}

function capWeightAvg(stks,field,mcTot){
  if(mcTot==null) mcTot=stks.reduce((a,s)=>a+(s.mc||0),0);
  if(mcTot<=0) return null;
  return stks.reduce((a,s)=>a+((s.mc||0)/mcTot)*(s[field]||0),0);
}

function mcapTier(mc){
  if(mc>=200) return 'mega';
  if(mc>=10) return 'large';
  if(mc>=2) return 'mid';
  if(mc>=0.3) return 'small';
  return 'micro';
}

function concentrationMetrics(stks){
  const mcTot=stks.reduce((a,s)=>a+(s.mc||0),0);
  const withMc=[...stks].filter(s=>(s.mc||0)>0).sort((a,b)=>b.mc-a.mc);
  const top5Mc=withMc.slice(0,5).reduce((a,s)=>a+s.mc,0);
  const megaMc=withMc.filter(s=>s.mc>=200).reduce((a,s)=>a+s.mc,0);
  const tiers={mega:{n:0,up:0},large:{n:0,up:0},mid:{n:0,up:0},small:{n:0,up:0},micro:{n:0,up:0}};
  withMc.forEach(s=>{
    const t=mcapTier(s.mc);
    tiers[t].n++;
    if((s.ch||0)>0) tiers[t].up++;
  });
  const chVals=withMc.map(s=>s.ch||0).sort((a,b)=>a-b);
  const medianCh=chVals.length?chVals[Math.floor(chVals.length/2)]:0;
  const capWtdCh=capWeightAvg(withMc,'ch',mcTot);
  return{
    mcTot,
    top5Share:mcTot>0?top5Mc/mcTot:0,
    megaShare:mcTot>0?megaMc/mcTot:0,
    tiers,
    medianCh,
    capWtdCh,
    spread:capWtdCh!=null?capWtdCh-medianCh:null
  };
}

function valuationMetrics(stks){
  const withPe=stks.filter(s=>(s.mc||0)>0&&s.pe&&s.pe>0);
  if(!withPe.length) return null;
  const peMcTot=withPe.reduce((a,s)=>a+s.mc,0);
  const sortedPe=[...withPe].sort((a,b)=>a.pe-b.pe);
  let cum=0,medianPe=null;
  for(const s of sortedPe){
    cum+=s.mc;
    if(cum>=peMcTot/2){ medianPe=s.pe; break; }
  }
  const top5=[...stks].filter(s=>(s.mc||0)>0).sort((a,b)=>b.mc-a.mc).slice(0,5);
  const top5Tk=new Set(top5.map(s=>s.tk));
  const top5Pe=top5.filter(s=>s.pe>0);
  const restPe=withPe.filter(s=>!top5Tk.has(s.tk));
  const top5PeAvg=top5Pe.length?top5Pe.reduce((a,s)=>a+s.pe,0)/top5Pe.length:null;
  const restMc=restPe.reduce((a,s)=>a+s.mc,0);
  const restPeAvg=restMc>0?restPe.reduce((a,s)=>a+(s.mc/restMc)*s.pe,0):null;
  const avgYtd=stks.reduce((a,s)=>a+(s.ytd||0),0)/(stks.length||1);
  const stretched=top5PeAvg&&medianPe&&top5PeAvg>1.5*medianPe&&avgYtd>0;
  return{medianPe,top5PeAvg,restPeAvg,stretched,avgYtd};
}
