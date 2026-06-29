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
    {id:'launch',name:'Launch',theme:'Reusable launch · cadence · cost to orbit · rideshare demand',stocks:['RKLB','FLY'],w:70},
    {id:'satcom',name:'Satellite Communications',theme:'Constellations · spectrum · direct-to-device · backhaul',stocks:['VSAT','GSAT','SATS','IRDM','ASTS','TSAT'],w:76},
    {id:'eartheo',name:'Earth Observation',theme:'Tasking · analytics · defense & commercial sensing',stocks:['SATL','PL','SPIR','BKSY'],w:82},
    {id:'explore',name:'Space Exploration',theme:'Cislunar logistics · landers · science & robotics',stocks:['LUNR'],w:88},
    {id:'infra',name:'Infrastructure & Manufacturing',theme:'Structures · modules · in-space services & tooling',stocks:['MDA','RDW','SIDU','VOYG'],w:94},
    {id:'components',name:'Components & Support',theme:'Ground networks · specialty avionics · satellite ground segment',stocks:['GILT','CW'],w:100,up:true},
  ]},

  QUANTUM:{type:'pyramid',label_full:'QUANTUM SUPPLY CHAIN',layers:[
    {id:'cloud',name:'Cloud Quantum Access',theme:'Commercial readiness gap · Vendor lock-in forming early',stocks:['IBM','MSFT','AMZN'],w:68},
    {id:'qpu',name:'QPU Hardware',theme:'Qubit fidelity race · Error correction · Fault tolerance',stocks:['IONQ','RGTI','QBTS','QUBT'],w:82},
    {id:'security',name:'Quantum Security',theme:'Post-quantum cryptography · IP moats · NIST standards',stocks:['ARQQ'],w:91},
    {id:'instruments',name:'Control & Instrumentation',theme:'Cryogenics monopoly · Ultra-pure materials · Single source',stocks:['OXIG'],w:100,up:true},
  ]},

  PHOTONIC:{type:'pyramid',label_full:'PHOTONICS · LIN JUN 2026',layers:[
    {id:'materials',name:'Photonic materials & substrates',theme:'Glass & ceramics · nonlinear optics · compound substrates · high-purity chemistry',stocks:['IQE','SOI','AXTI','LWLG','WOLF','TECK'],w:68},
    {id:'packaging',name:'Packaging & assembly',theme:'Advanced optical modules · OSAT · foundry for photonic & RF SOI',stocks:['FN','AMKR','GFS','SIVE','TSEM','UMC','ASX','SANM'],w:74},
    {id:'lasers',name:'Lasers & light sources',theme:'Datacom lasers · industrial & scientific · fiber amplifiers · diode & custom solutions',stocks:['LITE','COHR','LASR','LPTH','AIXA','HIMX'],w:80},
    {id:'optical',name:'Optical components & transceivers',theme:'Subsystems · fiber connectivity · pluggable optics',stocks:['AAOI','OPTX','VIAV','SMTC','ALRIB','ALMU'],w:86},
    {id:'pics',name:'Photonic integrated circuits',theme:'Silicon photonics · PIC platforms · optical I/O & custom networking silicon',stocks:['MRVL','CRDO','POET','MTSI','STM','XFAB'],w:92},
    {id:'test',name:'Test, sensing & broader photonics',theme:'Optical transport · DC switching · instrumentation · wafer-level photonic test',stocks:['CIEN','AEHR','VECO','ONTO','FORM','COHU','TER','LRCX','AMAT'],w:100,up:true},
  ]},

  CYBER:{type:'pyramid',label_full:'CYBERSECURITY · LIN MAY 2026',layers:[
    {id:'platform',name:'Platform & network security',theme:'SIEM/SASE leaders · firewall consolidation · cloud edge',stocks:['PANW','CRWD','FTNT','ZS','NET'],w:68},
    {id:'endpoint',name:'Endpoint & cloud-native',theme:'EDR/XDR · zero trust · identity-adjacent security',stocks:['S','OKTA','TENB','RBRK','VRNS'],w:74},
    {id:'vuln_ops',name:'Vulnerability & security ops',theme:'Exposure management · SIEM adjacency · IR tooling',stocks:['RPD','CHKP','FFIV','ATEN','SCWX'],w:80},
    {id:'infra',name:'Infrastructure & diversified tech',theme:'Network appliances · mega-cap networking · offshore IT',stocks:['CSCO','INFY','YOU'],w:86},
    {id:'gov',name:'Gov & professional services',theme:'Federal cyber spend · consulting · critical infrastructure',stocks:['BAH','LDOS','PSN'],w:100,up:true},
  ]},

  ROBOTICS:{type:'pyramid',label_full:'ROBOTICS · LIN JUN 2026',layers:[
    {id:'autonomy',name:'Autonomy & logistics',theme:'Warehouse AMRs · delivery bots · AV stacks · humanoids',stocks:['SYM','PATH','SERV','RRR','AUR','TSLA','XPEV'],w:68},
    {id:'industrial',name:'Industrial automation',theme:'Factory robots · motion control · machine vision · test',stocks:['ROK','ABB','HON','ZBRA','TER','CGNX','OUST'],w:74},
    {id:'medical',name:'Medical & surgical robotics',theme:'Surgical systems · med devices · robotic surgery',stocks:['ISRG','SYK','MDT','PRCT'],w:80},
    {id:'defense',name:'Defense & marine robotics',theme:'Drones · subsea · aerospace platforms',stocks:['LMT','GD','NOC','BA','KTOS','OII'],w:86},
    {id:'components',name:'Compute, power & components',theme:'AI edge · batteries · sensors · precision motion',stocks:['NVDA','AMZN','INDI','AMBA','INVZ','VPG','AMBQ','AMPX','KULR','LECO','SLDP','QS','FLNC','KRKNF'],w:100,up:true},
  ]},

  SEMICONDUCTOR:{type:'pyramid',label_full:'CRITICAL AI BOTTLENECK · SEMICONDUCTORS',layers:[
    {id:'compute',name:'Compute & CPU IP',theme:'GPUs · AI accelerators · x86 turnaround · ARM licensing',stocks:['AMD','INTC','ARM'],w:68},
    {id:'connectivity',name:'Data infrastructure & mixed-signal',theme:'Cloud networking · RF · analog & optical links',stocks:['MRVL','MXL','MTSI'],w:74},
    {id:'power_edge',name:'Power, sensing & edge logic',theme:'PMIC density · GaN/SiC · industrial & edge FPGAs',stocks:['MPWR','ON','NVTS','LSCC'],w:80},
    {id:'test_pack',name:'Test & assembly',theme:'HBM & accelerator test · OSAT · wire bond & packaging tools',stocks:['TER','FORM','AMKR','KLIC'],w:86},
    {id:'fab_sys',name:'Fab metrology & subsystems',theme:'Process control · capital equipment · ion implant · fluid delivery',stocks:['ONTO','VECO','ACLS','ICHR'],w:92},
    {id:'specialty',name:'Foundry & discrete / analog',theme:'Specialty capacity · discrete & broad analog',stocks:['GFS','DIOD'],w:100,up:true},
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
