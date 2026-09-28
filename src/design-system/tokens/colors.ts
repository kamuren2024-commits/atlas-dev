export const colors = {
  bg: {
    deep: '#05070D',
    surface: '#0B1220',
    panel: '#101827',
    elevated: '#162038',
    sunken: '#070B16',
  },
  intelligence: {
    active: '#00D9FF',
    secondary: '#0EA5E9',
    glow: 'rgba(0, 217, 255, 0.15)',
  },
  feedback: {
    success: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    neutral: '#64748B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    highlight: '#00D9FF'
  },
  border: {
    subtle: 'border-cyan-500/10',
    standard: 'border-slate-800/80',
    active: 'border-cyan-500/30',
    divider: 'rgba(148,163,184,0.12)',
  },
  // Semantic signal mapping — every color communicates system meaning
  signal: {
    liveData: '#00D9FF',       // Cyan — real-time data feeds
    aiInference: '#8B5CF6',    // Purple — AI reasoning in progress
    autonomousAction: '#7C3AED', // Violet — agent-initiated actions
    healthy: '#10B981',        // Green — system nominal
    risk: '#F59E0B',           // Amber — elevated risk, warning
    critical: '#EF4444',       // Red — immediate attention required
    unknown: '#64748B',        // Slate — data not yet available
    agent: '#8B5CF6',          // Purple — AI agent presence
    graph: '#00D9FF',          // Cyan — knowledge graph
    twin: '#0EA5E9',           // Sky — digital twin
    workflow: '#10B981',       // Green — active workflow
    procurement: '#00D9FF',    // Cyan — procurement intelligence
    supply: '#0EA5E9',         // Sky — supply chain
    financial: '#F59E0B',      // Amber — financial data
  },
  // Logistics-specific color scheme
  logistics: {
    bg: '#05070D',
    surface: '#0B1220',
    surfaceElevated: '#101827',
    border: '#1E293B',
    primary: '#00D9FF',
    secondary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    glowPrimary: 'rgba(0, 217, 255, 0.15)',
    glowSecondary: 'rgba(124, 58, 237, 0.15)',
  }
};
