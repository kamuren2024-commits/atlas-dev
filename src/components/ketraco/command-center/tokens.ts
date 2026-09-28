// Design & Motion Tokens for KETRACO National Grid Command Center

export const GRID_COLORS = {
  // Voltage Hierarchy Colors
  voltage: {
    hvdc500: '#F59E0B', // 500 kV HVDC (Amber / Gold)
    ehv400: '#06B6D4',  // 400 kV EHV (Cyan)
    primary220: '#A855F7', // 220 kV Primary (Purple)
    sub132: '#10B981',  // 132 kV Sub-transmission (Emerald)
    dist66: '#3B82F6',   // 66 kV Distribution / Feeders (Blue)
  },
  // Operational Status Colors
  status: {
    optimal: '#10B981',  // Emerald
    normal: '#3B82F6',   // Sky/Blue
    warning: '#F59E0B',  // Amber
    critical: '#EF4444', // Red
    offline: '#6B7280',  // Gray
    congested: '#EC4899', // Pink/Magenta
    maintenance: '#8B5CF6' // Indigo/Violet
  },
  // Surface Palette (Sophisticated High-Contrast Control Room Dark)
  surface: {
    base: '#050913',
    card: '#090E1A',
    elevated: '#0D1527',
    border: '#1E293B',
    borderActive: '#334155',
    borderHighlight: '#38BDF8',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B'
  },
  // Confidence & Verification Status
  confidence: {
    verified: '#10B981',
    high: '#06B6D4',
    review: '#F59E0B',
    low: '#EF4444',
    unverified: '#94A3B8'
  }
};

export const MOTION_TOKENS = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
    dramatic: 1.0,
  },
  ease: {
    smooth: [0.16, 1, 0.3, 1], // easeOutExpo
    bouncy: [0.34, 1.56, 0.64, 1],
    anticipate: [0.36, 0, 0.66, -0.56],
  }
};

export const COMMAND_MODES = [
  { id: 'OPERATIONS', label: 'Operations', icon: 'Activity', desc: 'SCADA load flow, frequency & reserve margin' },
  { id: 'DECISION_QUEUE', label: 'Action Queue', icon: 'Sparkles', desc: 'Palantir-class operator attention ranking & work queue' },
  { id: 'INCIDENT_ROOM', label: 'Incident Room', icon: 'AlertTriangle', desc: 'Active incident lifecycle, causality graph & decision briefs' },
  { id: 'CORRELATION', label: 'Correlations', icon: 'GitMerge', desc: 'Cross-domain SCADA, PMU, weather & EAM evidence synthesis' },
  { id: 'DECISION_AUDIT', label: 'Audit Ledger', icon: 'ShieldCheck', desc: 'Human-in-the-loop decision audit trail & outcome verification' },
  { id: 'EXECUTIVE', label: 'Executive View', icon: 'Building2', desc: 'C-Suite national grid situation & strategic decisions' },
  { id: 'FORECAST_WALL', label: 'Forecast Wall', icon: 'TrendingUp', desc: 'Probabilistic 15m–24h demand, generation & stability horizons' },
  { id: 'SCENARIO_LAB', label: 'Scenario Lab', icon: 'Cpu', desc: 'What-If contingency simulations, power flow & remedial actions' },
  { id: 'CONTINGENCY_RANK', label: 'N-1 Rankings', icon: 'GitPullRequest', desc: 'Ranked contingency severity, cascading failure & propagation' },
  { id: 'PREDICTIVE_WATCH', label: 'Asset Watchlist', icon: 'Eye', desc: 'Early-failure risk, DGA dissolved gas & degradation horizons' },
  { id: 'RESILIENCE', label: 'Resilience N-1', icon: 'Layers', desc: 'Resilience scorecard, restoration timelines & islanding defense' },
  { id: 'RISK', label: 'Risk Matrix', icon: 'AlertTriangle', desc: 'Likelihood vs Impact, SPOF & critical assets' },
  { id: 'CONGESTION', label: 'Congestion & DLR', icon: 'Flame', desc: 'Corridor thermal headroom, Dynamic Line Rating & line loading' },
  { id: 'WEATHER', label: 'Weather Impact', icon: 'CloudRain', desc: 'Lightning risk, wind ampacity cooling & renewable output' },
  { id: 'ASSET_HEALTH', label: 'Asset Health', icon: 'ShieldCheck', desc: 'Transformers, breakers & relay diagnostics' },
  { id: 'MODEL_DRIFT', label: 'Model Accuracy', icon: 'Target', desc: 'Forecast MAPE, Brier score calibration & drift monitor' },
  { id: 'GRAPH', label: 'Topology Graph', icon: 'Share2', desc: 'Electrical topology & upstream/downstream trace' },
  { id: 'DIGITAL_TWIN', label: '3D Twin', icon: 'Box', desc: 'WebGL 3D switchyard inspection & thermography' },
  { id: 'DATA_QUALITY', label: 'Data Quality', icon: 'Database', desc: 'GIS-SCADA-EAM canonical reconciliation & confidence' },
  { id: 'PLANNING', label: 'Grid Planning', icon: 'Layers3', desc: 'National grid planning, outage coordination, maintenance optimization & future grid twin' },
  { id: 'INVESTMENT', label: 'Investment Intel', icon: 'TrendingUp', desc: 'Grid investment ranking, renewable integration & project portfolio impact' },
  { id: 'FUTURE_GRID', label: 'Future Grid Twin', icon: 'Clock', desc: 'Temporal grid states 2026–2035, scenario comparison & digital twin projections' }
] as const;

export type CommandModeKey = typeof COMMAND_MODES[number]['id'];
