// NEXUS — Sector Pyramid Configurations
// To add a sector: add one object here, add pill label to app/nav.js SEC_LABELS.
// To add a ticker to a layer: add the key to the stocks array. Key must exist in stocks.js.
// Layer order: top = end applications, bottom = raw materials/upstream (mark bottom with up:true).

const PYRAMIDS={
  AI:{type:'pyramid',label_full:'AI SUPPLY CHAIN',layers:[
    {id:'apps',name:'Applications & Agents',theme:'Platform lock-in · Vertical AI · Agent frameworks',stocks:['PLTR','CRM','NOW','CRWV','DELL'],w:68},
    {id:'llms',name:'Large Language Models',theme:'Model commoditization · Hyperscaler dominance · Training cost moat',stocks:['GOOGL','META','MSFT','AMZN'],w:80},
    {id:'compute',name:'Compute',theme:'GPU monopoly · Custom silicon race · HBM memory supercycle',stocks:['NVDA','AMD','AVGO','TSM','MU','ARM'],w:88},
    {id:'network',name:'Network Infrastructure',theme:'Bandwidth explosion · Optical interconnect · East-West traffic',stocks:['ANET','MRVL','CIEN','CRDO'],w:92},
    {id:'power',name:'Power & Cooling',theme:'Energy demand crisis · Grid capacity · AI power density',stocks:['VRT','ETN','CEG','VST','MPWR'],w:95},
    {id:'storage',name:'Storage & Real Estate',theme:'AI training data explosion · Edge storage · Datacenter density',stocks:['STX','WDC','SNDK','EQIX','DLR'],w:97},
    {id:'upstream',name:'Upstream Inputs',theme:'Equipment monopolies · Export controls · Advanced wafer supply',stocks:['ASML','AMAT','LRCX','KLAC','ENTG','AMKR'],w:100,up:true},
  ]},

  SPACE:{type:'pyramid',label_full:'SPACE SUPPLY CHAIN',layers:[
    {id:'apps',name:'Apps & Intelligence',theme:'Defense ISR · Navigation · Commercial remote sensing',stocks:['LHX','LDOS','BAH','IRDM'],w:68},
    {id:'satellites',name:'Satellites & Connectivity',theme:'LEO constellation race · Direct-to-cell · Spectrum rights',stocks:['ASTS','PL'],w:80},
    {id:'launch',name:'Launch Vehicles',theme:'Cost per kg reduction · Reusability · Launch cadence',stocks:['RKLB'],w:88},
    {id:'prime',name:'Prime Contractors',theme:'Defense budgets · Long-term programs · Government risk',stocks:['LMT','BA','RTX','NOC'],w:95},
    {id:'rawmat',name:'Critical Materials',theme:'Rare earth dependency · Supply chain fragility · China risk',stocks:['MP'],w:100,up:true},
  ]},

  QUANTUM:{type:'pyramid',label_full:'QUANTUM SUPPLY CHAIN',layers:[
    {id:'cloud',name:'Cloud Quantum Access',theme:'Commercial readiness gap · Vendor lock-in forming early',stocks:['IBM','MSFT','AMZN'],w:68},
    {id:'qpu',name:'QPU Hardware',theme:'Qubit fidelity race · Error correction · Fault tolerance',stocks:['IONQ','RGTI','QBTS','QUBT'],w:82},
    {id:'security',name:'Quantum Security',theme:'Post-quantum cryptography · IP moats · NIST standards',stocks:['ARQQ'],w:91},
    {id:'instruments',name:'Control & Instrumentation',theme:'Cryogenics monopoly · Ultra-pure materials · Single source',stocks:['OXIG'],w:100,up:true},
  ]},

  PHOTONIC:{type:'pyramid',label_full:'PHOTONIC SUPPLY CHAIN',layers:[
    {id:'apps',name:'Systems & Applications',theme:'Datacenter optical interconnects · 800G/1.6T transition',stocks:['COHR','VIAV','LITE','ALAB'],w:68},
    {id:'pics',name:'Photonic ICs & Modules',theme:'Silicon photonics · InP integration · PIC moats forming',stocks:['COHR','AAOI'],w:82},
    {id:'lasers',name:'Light Sources & VCSELs',theme:'Laser supply · VCSEL competition · LiDAR adjacency',stocks:['LITE','VECO'],w:91},
    {id:'equip',name:'Fabrication Equipment',theme:'MOCVD · Specialized lithography · Inspection tooling',stocks:['ACLS','ONTO'],w:100,up:true},
  ]},

  SEMICONDUCTOR:{type:'pyramid',label_full:'SEMICONDUCTOR SUPPLY CHAIN',layers:[
    {id:'design',name:'Chip Design (Fabless)',theme:'IP moats · Architecture wars · CUDA vs RDNA vs custom ASIC',stocks:['NVDA','AMD','QCOM','MRVL','ARM','MCHP'],w:68},
    {id:'eda',name:'EDA & Design Tools',theme:'Design tool duopoly · Licensing lock-in · 95%+ market share',stocks:['SNPS','CDNS'],w:78},
    {id:'idm',name:'Integrated Device Mfg',theme:'Design + fab model · Analog dominance · Automotive cycles',stocks:['INTC','TXN','STM','ON'],w:86},
    {id:'foundry',name:'Foundry & Manufacturing',theme:'TSMC monopoly at advanced nodes · Geopolitical risk premium',stocks:['TSM','GFS','UMC','TSEM'],w:92},
    {id:'equipment',name:'Semiconductor Equipment',theme:'Export control leverage · Process monopolies · WFE cycles',stocks:['ASML','AMAT','LRCX','KLAC','ONTO','ACLS'],w:96},
    {id:'packaging',name:'Packaging & Materials',theme:'Chiplet integration · OSAT · Materials purity at angstrom scale',stocks:['AMKR','ENTG','MKSI','CMC'],w:100,up:true},
  ]},

  NUCLEAR:{type:'pyramid',label_full:'NUCLEAR ENERGY SUPPLY CHAIN',layers:[
    {id:'utilities',name:'Power Utilities & Operators',theme:'Grid reliability demand · baseload pricing power · power purchase visibility',stocks:['CEG','VST'],w:70},
    {id:'infrastructure',name:'Grid & Power Infrastructure',theme:'Nuclear-adjacent electrification spend · substation and conversion bottlenecks',stocks:['ETN','VRT','MPWR'],w:82},
    {id:'fuelcycle',name:'Fuel Cycle & Uranium',theme:'Long-term contracting cycle · enrichment risk · strategic stockpiles',stocks:['CCJ','URA'],w:92},
    {id:'upstream',name:'Critical Inputs',theme:'Copper and critical minerals for transmission, thermal systems, and hardening',stocks:['COPX','CPER','MP2'],w:100,up:true},
  ]},

  COMMODITY:{type:'flat',label_full:'COMMODITIES & MATERIALS',categories:[
    {id:'energy',name:'ENERGY',desc:'Nuclear + oil exposure · Power demand cycles · Fuel scarcity regimes',stocks:['CCJ','URA','USO']},
    {id:'precious',name:'PRECIOUS METALS',desc:'Gold + silver + platinum as inflation and macro risk hedges',stocks:['GLD','SLV','PPLT']},
    {id:'industrial',name:'INDUSTRIAL METALS',desc:'Copper electrification thesis · Mining beta · rare-earth optionality',stocks:['COPX','CPER','MP2']},
    {id:'battery',name:'BATTERY MATERIALS',desc:'Lithium cycle volatility · EV adoption path · supply concentration',stocks:['ALB','LTHM','LAC']},
    {id:'agri',name:'AGRICULTURE',desc:'Soft commodities and crop exposure for food inflation diversification',stocks:['DBA']},
    {id:'broad',name:'BROAD BASKET',desc:'Diversified commodity index exposure across energy and metals',stocks:['DBC']},
  ]},
};
