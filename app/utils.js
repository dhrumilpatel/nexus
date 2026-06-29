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
  const tv=getTVSym(tk);
  const m=tv.match(/^(NASDAQ|NYSE|AMEX):(.+)$/i);
  if(m) return m[2];
  if(/^LON:/i.test(tv)) return tv.slice(4)+'.L';
  if(/^TSX:/i.test(tv)) return tv.slice(4)+'.TO';
  return tk;
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
