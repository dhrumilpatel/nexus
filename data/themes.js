// NEXUS — Theme Configurations
// Themes are cross-sector narratives rendered by the same pyramid engine.
// To add a theme: one object here. color overrides the default blue accent.
// label: pill button text. label_full: shown in summary bar.
// All ticker keys must exist in stocks.js.

const THEMES_DATA={
  NVIDIA:{
    type:'pyramid',
    label:'NVIDIA',
    label_full:'NVIDIA ECOSYSTEM',
    color:'#f59e0b',
    layers:[
      {id:'apps',    name:'AI Applications',     theme:'Hyperscalers + cloud AI platforms — direct buyers of NVIDIA silicon at scale',              stocks:['CRWV','DELL','META','GOOGL','MSFT','AMZN']},
      {id:'core',    name:'NVIDIA Core',          theme:'The gravitational center — $2.76T AI infrastructure anchor and CUDA moat',                  stocks:['NVDA']},
      {id:'silicon', name:'Custom Silicon & IP',  theme:'Competing and complementary architectures — AMD GPUs, Broadcom XPUs, ARM architecture IP', stocks:['AMD','AVGO','ARM']},
      {id:'memory',  name:'Memory & Storage',     theme:'HBM3e demand pull — every H100 cluster needs petabytes of fast, high-bandwidth memory',    stocks:['MU','SNDK','WDC','STX']},
      {id:'network', name:'Networking & Optics',  theme:'East-west GPU cluster bandwidth — 400G/800G interconnects are the emerging bottleneck',    stocks:['ANET','COHR','LITE','CIEN','CRDO']},
      {id:'power',   name:'Power & Cooling',      theme:'Energy density crisis — GB200 racks draw 120kW+, reshaping grid and cooling markets',      stocks:['VRT','ETN','MPWR','CEG']},
      {id:'foundry', name:'Equipment & Foundry',  theme:'The tools that build NVIDIA chips — EUV lithography, etch, inspection, advanced packaging', stocks:['ASML','LRCX','KLAC','AMAT','TSM','AMKR'],up:true},
    ]
  },
  // Planned Phase 1B additions:
  // INDIA_AI:  India Data Center & AI Infrastructure (see artifacts/integrations for schema)
  // AI_MEMORY: AI Memory Supercycle — MU, SNDK, SKH, WDC
  // AI_POWER:  AI Power Play — CEG, VST, ETN, VRT, EQIX
};
