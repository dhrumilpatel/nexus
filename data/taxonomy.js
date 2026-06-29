// NEXUS — Infrastructure taxonomy (canonical metadata)
// Source: AI Infrastructure Intelligence.pdf — curated allowed values for stock meta{}.
// Distinct from THEMES_DATA in themes.js (narrative pyramids, e.g. NVIDIA ecosystem).

const INFRA_THEMES=[
  'Applications',
  'AI Platforms',
  'Compute',
  'Networking',
  'Power & Cooling',
  'Data Centers',
  'Semiconductor Equipment',
  'Materials & Components',
  'Security',
  'Robotics',
  'Quantum',
];

const INFRA_SUBTHEMES=[
  'GPU',
  'HBM',
  'Inference Chips',
  'Optical Networking',
  'Cooling Infrastructure',
  'Power Infrastructure',
  'Foundry',
  'Advanced Packaging',
  'EUV Lithography',
  'Nuclear Utilities',
  'Edge AI',
  'Data Center REITs',
  'Platform Security',
  'Enterprise Applications',
];

const INFRA_NARRATIVES=[
  'AI Training',
  'Inference Scaling',
  'AI Agents',
  'Power Bottleneck',
  'HBM Supercycle',
  'Optical Networking',
  'Edge AI',
  'Robotics Expansion',
  'Nuclear Revival',
  'Enterprise AI',
];

const INFRA_BOTTLENECKS=[
  'HBM',
  'Power Capacity',
  'Cooling Capacity',
  'Advanced Packaging',
  'Optical Interconnect',
  'Transformers',
  'CoWoS Capacity',
  'EUV Capacity',
];

const INFRA_REGIMES=[
  'Training',
  'Inference',
  'Enterprise AI',
  'Robotics',
  'Edge AI',
];

const MARKET_ROLES=['Leader','Enabler','Beneficiary','At-Risk'];

const THEME_TO_SUBTHEMES={
  'Applications':['Enterprise Applications','Edge AI'],
  'AI Platforms':['Enterprise Applications'],
  'Compute':['GPU','HBM','Inference Chips'],
  'Networking':['Optical Networking'],
  'Power & Cooling':['Cooling Infrastructure','Power Infrastructure','Nuclear Utilities'],
  'Data Centers':['Data Center REITs'],
  'Semiconductor Equipment':['EUV Lithography','Advanced Packaging','Foundry'],
  'Materials & Components':['Foundry'],
  'Security':['Platform Security'],
  'Robotics':['Edge AI'],
  'Quantum':[],
};
