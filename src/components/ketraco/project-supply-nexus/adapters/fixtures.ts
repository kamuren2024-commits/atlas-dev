import {
  KPIItem,
  ConstellationNode,
  ConstellationEdge,
  CriticalException,
  PDSStageItem,
  GenomeDimension,
  SupplyReadinessItem,
  ProjectDeltaEvent,
  MapLayerOption,
  MasterProjectSummary,
  PortfolioDelayedProject,
  PortfolioCriticalProject,
  FinancialExposureItem,
  SupplyExposureItem,
  ResourceConflictItem,
  CommissioningPipelineItem,
  PortfolioRiskItem,
  ExecutiveStrategicProject,
  ExecutiveChangeFeedItem,
  ExecutiveAttentionItem,
  ExecutiveDecisionItem,
  DevelopmentPipelineProject,
  ConceptItem,
  FeasibilityAssessmentItem,
  FundingTrancheItem,
  RegulatoryApprovalItem,
  GateReadinessItem,
  ProgramItem,
  WorkPackageItem,
  MilestoneItem,
  DependencyChainNode,
  ScheduleActivity,
  CostBreakdownItem,
  ResourceEntity,
  ProgressSPoint,
  CriticalPathItem
} from '../types';

export const PRIMARY_KPIS: KPIItem[] = [
  {
    id: 'deliv-conf',
    label: 'Delivery Confidence',
    value: '86.7%',
    delta: '+2.4% (7d)',
    trend: 'up',
    status: 'HEALTHY',
    trendPositive: true,
    freshness: '12s ago',
    contributingFactors: ['Tower steel delivery accelerated', 'Western Grid substations completed']
  },
  {
    id: 'sched-hlth',
    label: 'Schedule Health',
    value: '82.4%',
    delta: '-3.1% (7d)',
    trend: 'down',
    status: 'AT_RISK',
    trendPositive: false,
    freshness: '24s ago',
    contributingFactors: ['Mombasa 400kV transformer delivery lag', 'Tana River wayleave litigation']
  },
  {
    id: 'supp-read',
    label: 'Supply Readiness',
    value: '91.2%',
    delta: '+1.8% (7d)',
    trend: 'up',
    status: 'HEALTHY',
    trendPositive: true,
    freshness: '15s ago',
    contributingFactors: ['180km Conductor shipments arrived at Mombasa port']
  },
  {
    id: 'comm-hlth',
    label: 'Commercial Health',
    value: '89.1%',
    delta: '+0.6% (7d)',
    trend: 'up',
    status: 'HEALTHY',
    trendPositive: true,
    freshness: '45s ago',
    contributingFactors: ['Contract variation approvals reconciled with PPADA guidelines']
  },
  {
    id: 'fin-hlth',
    label: 'Financial Health',
    value: '87.8%',
    delta: '+1.2% (7d)',
    trend: 'up',
    status: 'HEALTHY',
    trendPositive: true,
    freshness: '1m ago',
    contributingFactors: ['KES 18.4M interim IPC certificate released on schedule']
  }
];

export const CONSTELLATION_NODES: ConstellationNode[] = [
  {
    id: 'lamu',
    name: 'Lamu - Isiolo 400kV',
    voltage: '400kV',
    status: 'HEALTHY',
    x: 18,
    y: 28,
    confidence: 94,
    progress: 72,
    stage: 'Construction',
    activeRiskCount: 1
  },
  {
    id: 'rift',
    name: 'Rift Valley 220kV',
    voltage: '220kV',
    status: 'AT_RISK',
    x: 48,
    y: 32,
    delta: '▼ -3.1% (7d)',
    confidence: 82,
    progress: 58,
    stage: 'Construction',
    activeRiskCount: 3
  },
  {
    id: 'kisumu',
    name: 'Kisumu 220kV',
    voltage: '220kV',
    status: 'HEALTHY',
    x: 22,
    y: 45,
    confidence: 91,
    progress: 84,
    stage: 'Commissioning',
    activeRiskCount: 0
  },
  {
    id: 'nairobi',
    name: 'Nairobi Ring 132kV',
    voltage: '132kV',
    status: 'HEALTHY',
    x: 52,
    y: 52,
    confidence: 96,
    progress: 92,
    stage: 'Commissioning',
    activeRiskCount: 0
  },
  {
    id: 'mombasa',
    name: 'Mombasa 400kV',
    voltage: '400kV',
    status: 'HEALTHY',
    x: 82,
    y: 42,
    confidence: 81,
    progress: 53,
    stage: 'Construction',
    activeRiskCount: 2
  },
  {
    id: 'western',
    name: 'Western Grid 132kV',
    voltage: '132kV',
    status: 'HEALTHY',
    x: 28,
    y: 72,
    confidence: 88,
    progress: 68,
    stage: 'Construction',
    activeRiskCount: 1
  },
  {
    id: 'tana',
    name: 'Tana River 220kV',
    voltage: '220kV',
    status: 'AT_RISK',
    x: 65,
    y: 62,
    delta: '▲ +1.0% (33m)',
    confidence: 76,
    progress: 41,
    stage: 'Land/Wayleave',
    activeRiskCount: 4
  },
  {
    id: 'south',
    name: 'South Coast 220kV',
    voltage: '220kV',
    status: 'CRITICAL',
    x: 50,
    y: 84,
    delta: '▼ -5.0% (24h)',
    confidence: 68,
    progress: 35,
    stage: 'Procurement',
    activeRiskCount: 5
  }
];

export const CONSTELLATION_EDGES: ConstellationEdge[] = [
  { id: 'e1', from: 'lamu', to: 'nairobi', type: 'dependency' },
  { id: 'e2', from: 'rift', to: 'nairobi', type: 'dependency' },
  { id: 'e3', from: 'kisumu', to: 'nairobi', type: 'strategic' },
  { id: 'e4', from: 'western', to: 'kisumu', type: 'dependency' },
  { id: 'e5', from: 'western', to: 'nairobi', type: 'strategic' },
  { id: 'e6', from: 'nairobi', to: 'mombasa', type: 'dependency' },
  { id: 'e7', from: 'nairobi', to: 'tana', type: 'strategic' },
  { id: 'e8', from: 'nairobi', to: 'south', type: 'dependency' },
  { id: 'e9', from: 'mombasa', to: 'tana', type: 'dependency' },
  { id: 'e10', from: 'tana', to: 'south', type: 'strategic' }
];

export const CRITICAL_EXCEPTIONS: CriticalException[] = [
  {
    id: 'exc-1',
    code: 'KET-PDS-0042',
    project: 'Mombasa 400kV',
    title: 'Transformer Delivery Delay',
    severity: 'CRITICAL',
    detail: 'Supplier revised delivery +14 days',
    impact: 'Commissioning +11 days, 2 dependent milestones',
    aiConfidence: 92,
    cause: 'Factory QC reinspection in Mumbai dry dock',
    timestamp: '12:42 PM',
    recommendedAction: 'Re-sequence civil pad casting and pre-commission auxiliary bay wiring.'
  },
  {
    id: 'exc-2',
    code: 'KET-PDS-0071',
    project: 'Tana River 220kV',
    title: 'Wayleave Acquisition',
    severity: 'HIGH',
    detail: '14 parcels outstanding (3 disputed)',
    impact: '5.2 km construction delay',
    aiConfidence: 87,
    cause: 'Title deed succession conflicts in Tana Delta sub-county',
    timestamp: '11:15 AM',
    recommendedAction: 'Convene county commissioner baraza with NLC valuer arbitration.'
  },
  {
    id: 'exc-3',
    code: 'KET-PDS-0036',
    project: 'Lamu - Isiolo 400kV',
    title: 'Contract Variation Exposure',
    severity: 'HIGH',
    detail: 'KES 124M exposure (2 variations pending)',
    impact: 'Cost overrun potential KES 124M',
    aiConfidence: 78,
    cause: 'Geotechnical bedrock depth deviation on tower legs 140 to 184',
    timestamp: '10:30 AM',
    recommendedAction: 'Engage resident consulting engineer for rock socket foundation approval.'
  },
  {
    id: 'exc-4',
    code: 'KET-PDS-0068',
    project: 'Western Grid 132kV',
    title: 'Site Progress Lag',
    severity: 'MEDIUM',
    detail: '-7.8% vs planned (civil works)',
    impact: 'Substation commissioning delay +18d',
    aiConfidence: 71,
    cause: 'Heavy seasonal precipitation affecting heavy equipment access',
    timestamp: '09:45 AM',
    recommendedAction: 'Deploy sub-base stone stabilizing layer and add night shift compaction.'
  }
];

export const PDS_STAGES: PDSStageItem[] = [
  { id: 'need', sequence: 1, name: 'Need', count: 18, cycleDays: 12, color: 'bg-cyan-400' },
  { id: 'concept', sequence: 2, name: 'Concept', count: 14, cycleDays: 28, color: 'bg-cyan-400' },
  { id: 'feasibility', sequence: 3, name: 'Feasibility', count: 11, cycleDays: 45, color: 'bg-blue-400' },
  {
    id: 'wayleave',
    sequence: 4,
    name: 'Land/Wayleave',
    count: 8,
    cycleDays: 68,
    color: 'bg-amber-400',
    isBottleneck: true,
    bottleneckInfo: {
      driver: 'RAP approvals',
      owner: 'Wayleave Dept.',
      action: 'Expedite NLC hearings'
    }
  },
  { id: 'financing', sequence: 5, name: 'Financing', count: 7, cycleDays: 76, color: 'bg-purple-400' },
  { id: 'approval', sequence: 6, name: 'Approval', count: 6, cycleDays: 91, color: 'bg-purple-400' },
  { id: 'procurement', sequence: 7, name: 'Procurement', count: 5, cycleDays: 110, color: 'bg-orange-400' },
  { id: 'design', sequence: 8, name: 'Design', count: 4, cycleDays: 160, color: 'bg-amber-400' },
  { id: 'construction', sequence: 9, name: 'Construction', count: 12, cycleDays: 180, color: 'bg-emerald-400' },
  { id: 'commissioning', sequence: 10, name: 'Commissioning', count: 3, cycleDays: 180, color: 'bg-cyan-400' }
];

export const PROJECT_HEALTH_GENOME: GenomeDimension[] = [
  { id: 'sch', name: 'Schedule', score: 82, delta7d: -7, status: 'AT_RISK' },
  { id: 'sup', name: 'Supply', score: 91, delta7d: 2, status: 'HEALTHY' },
  { id: 'cst', name: 'Cost', score: 87, delta7d: -3, status: 'HEALTHY' },
  { id: 'cnt', name: 'Contract', score: 94, delta7d: 0, status: 'HEALTHY' },
  { id: 'eng', name: 'Engineering', score: 96, delta7d: 1, status: 'HEALTHY' },
  { id: 'way', name: 'Wayleave', score: 68, delta7d: -9, status: 'CRITICAL', driver: 'Disputed valuation in Section 3' },
  { id: 'con', name: 'Construction', score: 84, delta7d: -4, status: 'AT_RISK' },
  { id: 'qty', name: 'Quality', score: 92, delta7d: 3, status: 'HEALTHY' },
  { id: 'stk', name: 'Stakeholder', score: 76, delta7d: -5, status: 'AT_RISK' },
  { id: 'gov', name: 'Governance', score: 98, delta7d: 1, status: 'HEALTHY' }
];

export const SUPPLY_MATERIALS: SupplyReadinessItem[] = [
  { id: 'm1', material: 'Transformer', required: '2', available: '1', eta: '26 Sep', risk: 'CRITICAL' },
  { id: 'm2', material: 'Tower steel', required: '420T', available: '390T', eta: '14 Sep', risk: 'AT_RISK' },
  { id: 'm3', material: 'Conductors', required: '180km', available: '180km', eta: 'Ready', risk: 'HEALTHY' },
  { id: 'm4', material: 'Insulators', required: '920', available: '920', eta: 'Ready', risk: 'HEALTHY' },
  { id: 'm5', material: 'Protection panels', required: '14', available: '12', eta: '21 Sep', risk: 'AT_RISK' }
];

export const PROJECT_DELTA_EVENTS: ProjectDeltaEvent[] = [
  {
    id: 'd1',
    time: '12:42',
    title: 'Supplier ETA updated',
    description: 'Transformer T-204 +14 days',
    badge: 'Transformer T-204 +14 days',
    badgeColor: 'purple',
    category: 'supply'
  },
  {
    id: 'd2',
    time: '12:35',
    title: 'Site progress uploaded',
    description: 'Workfront 07 • 74% complete',
    badgeColor: 'cyan',
    category: 'construction'
  },
  {
    id: 'd3',
    time: '12:31',
    title: 'Payment certified',
    description: 'Contract KET-0036 • KES 18.4M',
    badgeColor: 'emerald',
    category: 'commercial'
  },
  {
    id: 'd4',
    time: '12:18',
    title: 'Document indexed',
    description: 'Drawing D-1045 • Substation',
    badgeColor: 'blue',
    category: 'document'
  },
  {
    id: 'd5',
    time: '11:56',
    title: 'AI risk recalculated',
    description: 'Supply chain • High risk detected',
    badgeColor: 'amber',
    category: 'ai'
  },
  {
    id: 'd6',
    time: '10:42',
    title: 'Wayleave parcel cleared',
    description: 'Parcel 742 • 91% complete',
    badgeColor: 'emerald',
    category: 'wayleave'
  }
];

export const MAP_LAYERS: MapLayerOption[] = [
  { id: 'projects', label: 'Projects', color: '#00d9ff', enabled: true },
  { id: 'substations', label: 'Substations', color: '#a855f7', enabled: true },
  { id: 'transmission', label: 'Transmission Lines', color: '#38bdf8', enabled: true },
  { id: 'wayleaves', label: 'Wayleaves', color: '#eab308', enabled: false },
  { id: 'constraints', label: 'Constraints', color: '#ef4444', enabled: false }
];

// Re-export all domain submodule fixtures
export * from './fixturesProjects';
export * from './fixturesCommand';
export * from './fixturesPds';
export * from './fixturesControls';
