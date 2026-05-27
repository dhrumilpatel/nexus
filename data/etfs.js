// NEXUS — ETF registry (manual seed, API-ready schema)
// ETF_SECTORS[sectorKey].etfs[etfId] — holdings[].weight is portfolio % (0–100).
// Phase 2: NexusEtfApi merges live provider payload into this shape.

const ETF_SECTORS={
  AI:{
    label:'AI',
    label_full:'AI & ROBOTICS ETFs',
    color:'#4d9fff',
    etfs:{
      BOTZ:{
        id:'BOTZ',
        symbol:'BOTZ',
        label:'Global X Robotics & AI',
        theme:'Robotics · automation · AI software',
        source:'manual',
        asOf:'2026-05-15',
        color:'#3d9aff',
        holdings:[
          {tk:'NVDA',name:'NVIDIA Corp',weight:9.8},
          {tk:'ISRG',name:'Intuitive Surgical',weight:8.2},
          {tk:'ABB',name:'ABB Ltd',weight:6.1},
          {tk:'KEYENCE',name:'Keyence Corp',weight:5.4},
          {tk:'FANUC',name:'Fanuc Corp',weight:4.9},
          {tk:'AMD',name:'Advanced Micro Devices',weight:4.2},
          {tk:'INTC',name:'Intel Corp',weight:3.8},
          {tk:'PLTR',name:'Palantir Technologies',weight:3.5},
        ],
      },
      AIQ:{
        id:'AIQ',
        symbol:'AIQ',
        label:'Global X AI & Technology',
        theme:'AI platforms · cloud · semis',
        source:'manual',
        asOf:'2026-05-15',
        color:'#38bdf8',
        holdings:[
          {tk:'NVDA',name:'NVIDIA Corp',weight:11.2},
          {tk:'MSFT',name:'Microsoft Corp',weight:10.5},
          {tk:'GOOGL',name:'Alphabet Inc',weight:9.1},
          {tk:'META',name:'Meta Platforms',weight:7.8},
          {tk:'AMZN',name:'Amazon.com',weight:7.2},
          {tk:'AVGO',name:'Broadcom Inc',weight:5.6},
          {tk:'ORCL',name:'Oracle Corp',weight:4.1},
        ],
      },
    },
  },

  SPACE:{
    label:'SPACE',
    label_full:'SPACE & AEROSPACE ETFs',
    color:'#a78bfa',
    etfs:{
      TEMA_SPACE:{
        id:'TEMA_SPACE',
        symbol:'NASA',
        label:'TEMA Space Innovators',
        theme:'Launch · satcom · Earth observation · exploration',
        source:'manual',
        asOf:'2026-05-15',
        color:'#f5a623',
        holdings:[
          {tk:'SPACEX',name:'SpaceX (SPV)',weight:10.0,note:'via Forge — pre-IPO exposure'},
          {tk:'RKLB',name:'Rocket Lab USA',weight:7.3},
          {tk:'PL',name:'Planet Labs',weight:6.34},
          {tk:'FTC',name:'Filtronic PLC',weight:6.24,exchange:'LON'},
          {tk:'LUNR',name:'Intuitive Machines',weight:5.9},
          {tk:'FLY',name:'Firefly Aerospace',weight:5.02},
          {tk:'OHB',name:'OHB SE',weight:4.71,exchange:'XETRA'},
          {tk:'ASTS',name:'AST SpaceMobile',weight:4.31},
          {tk:'VNP',name:'5N Plus Inc',weight:4.08},
          {tk:'VSAT',name:'Viasat Inc',weight:3.73},
        ],
      },
      UFO:{
        id:'UFO',
        symbol:'UFO',
        label:'Procure Space ETF',
        theme:'Pure-play space economy basket',
        source:'manual',
        asOf:'2026-05-15',
        color:'#c084fc',
        holdings:[
          {tk:'RKLB',name:'Rocket Lab USA',weight:8.5},
          {tk:'ASTS',name:'AST SpaceMobile',weight:7.2},
          {tk:'GSAT',name:'Globalstar',weight:6.8},
          {tk:'IRDM',name:'Iridium Communications',weight:6.1},
          {tk:'LUNR',name:'Intuitive Machines',weight:5.4},
          {tk:'VSAT',name:'Viasat Inc',weight:5.0},
          {tk:'SATS',name:'EchoStar',weight:4.6},
        ],
      },
    },
  },

  MEMORY:{
    label:'MEMORY',
    label_full:'MEMORY & STORAGE ETFs',
    color:'#34d399',
    etfs:{
      MEME:{
        id:'MEME',
        symbol:'MEME',
        label:'AI Memory Supercycle',
        theme:'HBM · NAND · storage for AI training',
        source:'manual',
        asOf:'2026-05-15',
        color:'#22d3ee',
        holdings:[
          {tk:'MU',name:'Micron Technology',weight:14.2},
          {tk:'SNDK',name:'SanDisk Corp',weight:11.5},
          {tk:'WDC',name:'Western Digital',weight:10.8},
          {tk:'STX',name:'Seagate Technology',weight:9.4},
          {tk:'NVDA',name:'NVIDIA Corp',weight:6.2},
          {tk:'AVGO',name:'Broadcom Inc',weight:5.1},
        ],
      },
    },
  },

  SEMICONDUCTOR:{
    label:'SEMI',
    label_full:'SEMICONDUCTOR ETFs',
    color:'#fbbf24',
    etfs:{
      SMH:{
        id:'SMH',
        symbol:'SMH',
        label:'VanEck Semiconductor ETF',
        theme:'Chip designers · foundry · equipment',
        source:'manual',
        asOf:'2026-05-15',
        color:'#fbbf24',
        holdings:[
          {tk:'NVDA',name:'NVIDIA Corp',weight:20.1},
          {tk:'TSM',name:'Taiwan Semiconductor',weight:12.8},
          {tk:'AVGO',name:'Broadcom Inc',weight:8.4},
          {tk:'AMD',name:'Advanced Micro Devices',weight:6.2},
          {tk:'ASML',name:'ASML Holding',weight:5.9},
          {tk:'QCOM',name:'Qualcomm',weight:4.7},
          {tk:'INTC',name:'Intel Corp',weight:4.1},
        ],
      },
    },
  },

  COMMODITY:{
    label:'COMM',
    label_full:'COMMODITY ETFs',
    color:'#22d3ee',
    etfs:{
      COMM_BASKET:{
        id:'COMM_BASKET',
        symbol:'DBC',
        label:'Invesco DB Commodity Index',
        theme:'Broad commodity index exposure',
        source:'manual',
        asOf:'2026-05-15',
        color:'#22d3ee',
        holdings:[
          {tk:'GLD',name:'SPDR Gold Shares',weight:18.0},
          {tk:'USO',name:'United States Oil Fund',weight:15.0},
          {tk:'SLV',name:'iShares Silver Trust',weight:12.0},
          {tk:'URA',name:'Global X Uranium ETF',weight:8.0},
          {tk:'DBC',name:'Invesco DB Commodity',weight:7.0},
          {tk:'DBA',name:'Invesco DB Agriculture',weight:6.0},
        ],
      },
    },
  },
};
