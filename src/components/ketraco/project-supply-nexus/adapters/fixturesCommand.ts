import {
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
  ExecutiveDecisionItem
} from '../types';

export const PORTFOLIO_OVERVIEW_METRICS = {
  totalPortfolioValue: 'KES 48.20B',
  activeProjectsCount: 27,
  healthyCount: 18,
  atRiskCount: 6,
  criticalCount: 3,
  onSchedulePercent: 74.1,
  budgetVariancePercent: +3.2,
  financialExposureTotal: 'KES 1.84B',
  supplyExposureTotal: '4 Major Components',
  resourceConflictsCount: 3,
  upcomingCommissioningCount: 5,
  autonomousActionsLogged: 18
};

export const PORTFOLIO_DELAYED_PROJECTS: PortfolioDelayedProject[] = [
  {
    id: 'mombasa',
    name: 'Mombasa 400kV Ring & Interconnector',
    code: 'KET-PDS-0042',
    phase: 'Construction',
    delayDays: 14,
    criticalMilestone: 'Transformer T-204 Delivery at Site',
    impactScore: 'CRITICAL',
    driver: 'Factory QC reinspection in Mumbai dry dock',
    mitigation: 'Re-sequenced pad civil works, booked express low-loader transport.',
    health: 'AT_RISK'
  },
  {
    id: 'tana',
    name: 'Tana River 220kV Hydro Intertie',
    code: 'KET-PDS-0071',
    phase: 'Land/Wayleave',
    delayDays: 21,
    criticalMilestone: 'RAP Section 3 Compensation Finalization',
    impactScore: 'HIGH',
    driver: '14 disputed parcel successions in Tana Delta sub-county',
    mitigation: 'Joint Baraza convened with County Commissioner and NLC Valuer.',
    health: 'AT_RISK'
  },
  {
    id: 'south',
    name: 'South Coast 220kV Regional Backbone',
    code: 'KET-PDS-0084',
    phase: 'Procurement',
    delayDays: 35,
    criticalMilestone: 'EPC Tender Award and Letter of Acceptance',
    impactScore: 'CRITICAL',
    driver: 'PPADA bidder objection before Public Procurement Administrative Review Board',
    mitigation: 'PPRA tribunal ruling delivered, contract documentation finalized.',
    health: 'CRITICAL'
  },
  {
    id: 'rift',
    name: 'Rift Valley 220kV Geothermal Evacuation',
    code: 'KET-PDS-0055',
    phase: 'Construction',
    delayDays: 8,
    criticalMilestone: 'Tower Erection Section 2 (Suswa)',
    impactScore: 'MODERATE',
    driver: 'Steep terrain access road wash-outs during heavy rains',
    mitigation: 'Deployed crawler excavators and stone rip-rap stabilization.',
    health: 'AT_RISK'
  },
  {
    id: 'western',
    name: 'Western Grid 132kV Resiliency Corridor',
    code: 'KET-PDS-0068',
    phase: 'Construction',
    delayDays: 5,
    criticalMilestone: 'Malaba Substation Civil Works Handover',
    impactScore: 'MODERATE',
    driver: 'Cross-border customs delay for SF6 testing instruments',
    mitigation: 'Temporary clearance bond secured with Kenya Revenue Authority.',
    health: 'HEALTHY'
  }
];

export const PORTFOLIO_CRITICAL_PROJECTS: PortfolioCriticalProject[] = [
  {
    id: 'mombasa',
    name: 'Mombasa 400kV Ring & Interconnector',
    code: 'KET-PDS-0042',
    voltage: '400kV',
    capex: 'KES 6.10B',
    progress: 53.4,
    confidence: 81.7,
    health: 'AT_RISK',
    daysToCommissioning: 78,
    targetDate: '28 Nov 2026',
    topRisk: 'T-204 transformer delivery slip affecting Rabai 400kV energization'
  },
  {
    id: 'lamu',
    name: 'Lamu - Isiolo 400kV Transmission Corridor',
    code: 'KET-PDS-0036',
    voltage: '400kV',
    capex: 'KES 11.40B',
    progress: 72.0,
    confidence: 94.0,
    health: 'HEALTHY',
    daysToCommissioning: 110,
    targetDate: '15 Aug 2026',
    topRisk: 'Security escorts along Boni Forest corridor section'
  },
  {
    id: 'south',
    name: 'South Coast 220kV Regional Backbone',
    code: 'KET-PDS-0084',
    voltage: '220kV',
    capex: 'KES 2.90B',
    progress: 35.0,
    confidence: 68.0,
    health: 'CRITICAL',
    daysToCommissioning: 228,
    targetDate: '28 Apr 2027',
    topRisk: 'EPC tender contract execution delay post-tribunal hearing'
  },
  {
    id: 'nairobi',
    name: 'Nairobi Metropolitan 132kV Ring System',
    code: 'KET-PDS-0018',
    voltage: '132kV',
    capex: 'KES 5.20B',
    progress: 92.4,
    confidence: 96.5,
    health: 'HEALTHY',
    daysToCommissioning: 34,
    targetDate: '15 Oct 2026',
    topRisk: 'NCC fiber SCADA tele-protection protocol testing'
  }
];

export const FINANCIAL_EXPOSURE_DATA: FinancialExposureItem[] = [
  {
    id: 'fin-01',
    project: 'Mombasa 400kV Ring',
    category: 'VARIATION',
    exposureAmount: 'KES 32.4M',
    status: 'PENDING_AUDIT',
    riskScore: 78,
    mitigationAction: 'Resident engineer independent quantity takeoff on foundation bedrock depth.'
  },
  {
    id: 'fin-02',
    project: 'Lamu - Isiolo 400kV',
    category: 'CLAIMS',
    exposureAmount: 'KES 124.0M',
    status: 'DISPUTED',
    riskScore: 84,
    mitigationAction: 'Contractor claim for standby crane idle hours during security standoff under review.'
  },
  {
    id: 'fin-03',
    project: 'South Coast 220kV',
    category: 'FOREX',
    exposureAmount: 'KES 86.5M',
    status: 'PROVISIONED',
    riskScore: 65,
    mitigationAction: 'Treasury currency hedging swap applied on EUR/KES tranche.'
  },
  {
    id: 'fin-04',
    project: 'Tana River 220kV',
    category: 'LIQUIDATED_DAMAGES',
    exposureAmount: 'KES 45.0M',
    status: 'PENDING_AUDIT',
    riskScore: 72,
    mitigationAction: 'Notice of delay claim sent to EPC contractor for delay on Kiambere switchbay.'
  }
];

export const SUPPLY_EXPOSURE_DATA: SupplyExposureItem[] = [
  {
    id: 'sup-exp-01',
    item: '200MVA 400/220kV Autotransformer',
    project: 'Mombasa 400kV Ring',
    supplier: 'TBEA Hengyang',
    delayWeeks: 2,
    criticality: 'CRITICAL',
    contingencyAvailable: false,
    status: 'Shipped from Mumbai on vessel MSC Aurora, ETA 20 Sep'
  },
  {
    id: 'sup-exp-02',
    item: 'Swamp Tower Leg Extensions (30 Tonnes)',
    project: 'Mombasa 400kV Ring',
    supplier: 'Jindal Steel',
    delayWeeks: 1,
    criticality: 'HIGH',
    contingencyAvailable: true,
    status: 'Diverted from Western Grid surplus buffer stock at Isinya yard'
  },
  {
    id: 'sup-exp-03',
    item: '400kV SF6 Live Tank Circuit Breakers',
    project: 'Lamu - Isiolo 400kV',
    supplier: 'Siemens Energy',
    delayWeeks: 0,
    criticality: 'HIGH',
    contingencyAvailable: true,
    status: 'Customs cleared at Mombasa Port berth 4, dispatching to site'
  },
  {
    id: 'sup-exp-04',
    item: 'Optical Ground Wire (OPGW 24-core, 60km)',
    project: 'Tana River 220kV',
    supplier: 'Sterlite Technologies',
    delayWeeks: 3,
    criticality: 'HIGH',
    contingencyAvailable: true,
    status: 'Manufacturer factory test passed, awaiting sea freight consolidation'
  }
];

export const RESOURCE_CONFLICTS_DATA: ResourceConflictItem[] = [
  {
    id: 'res-conf-01',
    resourceName: 'Eng. Sarah Ochieng (Lead Protection Specialist)',
    role: 'Lead Protection Relay Commissioning Engineer',
    competingProjects: ['Mombasa 400kV Ring', 'Nairobi Metropolitan 132kV Ring'],
    allocationPercent: 155,
    impactDate: '15 Oct - 05 Nov 2026',
    recommendedResolution: 'Delegate secondary testing to Eng. Kevin Mutua under remote signoff.'
  },
  {
    id: 'res-conf-02',
    resourceName: 'Heavy Hydraulic Piling Rig 04 (250T)',
    role: 'Deep Swamp Foundation Rig',
    competingProjects: ['Mombasa 400kV Creek Crossing', 'South Coast 220kV Diani Tower 14'],
    allocationPercent: 180,
    impactDate: '01 Oct - 20 Oct 2026',
    recommendedResolution: 'Prioritize Mombasa Creek crossing; lease secondary crawler rig from KeNHA contractor.'
  },
  {
    id: 'res-conf-03',
    resourceName: 'National Land Commission Senior Valuer Team A',
    role: 'Statutory RAP Compensation Assessment',
    competingProjects: ['Tana River 220kV Delta Section', 'Lamu - Isiolo Section 4'],
    allocationPercent: 140,
    impactDate: 'Immediate',
    recommendedResolution: 'Second private licensed valuer firm approved under PPADA framework agreement.'
  }
];

export const COMMISSIONING_PIPELINE_DATA: CommissioningPipelineItem[] = [
  {
    id: 'comm-01',
    project: 'Kisumu - Lessos 220kV Reinforcement',
    targetQuarter: 'Q3 2026',
    targetDate: '30 Sep 2026',
    confidence: 91.2,
    criticalPrerequisite: 'Lessos 220kV bay inter-trip scheme testing',
    status: 'ON_TRACK'
  },
  {
    id: 'comm-02',
    project: 'Nairobi Metropolitan 132kV Ring',
    targetQuarter: 'Q4 2026',
    targetDate: '15 Oct 2026',
    confidence: 96.5,
    criticalPrerequisite: 'NCC SCADA telemetry handshake',
    status: 'ON_TRACK'
  },
  {
    id: 'comm-03',
    project: 'Mombasa 400kV Ring & Interconnector',
    targetQuarter: 'Q4 2026',
    targetDate: '28 Nov 2026',
    confidence: 81.7,
    criticalPrerequisite: 'Transformer T-204 delivery & oil dielectric breakdown test',
    status: 'AT_RISK'
  },
  {
    id: 'comm-04',
    project: 'Western Grid 132kV Resiliency Corridor',
    targetQuarter: 'Q1 2027',
    targetDate: '05 Jan 2027',
    confidence: 88.0,
    criticalPrerequisite: 'Malaba Substation EPRA safety license',
    status: 'ON_TRACK'
  },
  {
    id: 'comm-05',
    project: 'Tana River 220kV Hydro Intertie',
    targetQuarter: 'Q1 2027',
    targetDate: '14 Feb 2027',
    confidence: 76.0,
    criticalPrerequisite: 'Resolution of 14 disputed wayleave compensation claims',
    status: 'AT_RISK'
  }
];

export const PORTFOLIO_RISKS_DATA: PortfolioRiskItem[] = [
  {
    id: 'prisk-01',
    title: 'Wayleave Land Succession & Communal Title Disputes',
    category: 'WAYLEAVE',
    affectedProjectsCount: 5,
    exposure: 'KES 480M / +45 days delay potential',
    severity: 'CRITICAL',
    trend: 'UP'
  },
  {
    id: 'prisk-02',
    title: 'Global Heavy Electrical Equipment Shipping Lag',
    category: 'SUPPLY',
    affectedProjectsCount: 4,
    exposure: 'KES 310M / +28 days delay potential',
    severity: 'HIGH',
    trend: 'STABLE'
  },
  {
    id: 'prisk-03',
    title: 'Counterpart Funding Exchequer Release Timetable',
    category: 'FINANCE',
    affectedProjectsCount: 3,
    exposure: 'KES 620M pending exchequer requisitions',
    severity: 'HIGH',
    trend: 'DOWN'
  },
  {
    id: 'prisk-04',
    title: 'Contractor Geotechnical Bedrock Deviations & Variations',
    category: 'CONTRACT',
    affectedProjectsCount: 2,
    exposure: 'KES 156M in pending variation notices',
    severity: 'MEDIUM',
    trend: 'STABLE'
  }
];

// EXECUTIVE VIEW FIXTURES
export const EXECUTIVE_STRATEGIC_PROJECTS: ExecutiveStrategicProject[] = [
  {
    id: 'mombasa',
    code: 'KET-PDS-0042',
    name: 'Mombasa 400kV Ring & Interconnector',
    voltage: '400kV',
    strategicObjective: 'Evacuate 300MW baseload to Mombasa port industrial belt and eliminate coastal blackouts.',
    deliveryProbability: 81.7,
    capitalBudget: 'KES 6.10B',
    capitalCommitted: 'KES 5.48B (89.8%)',
    status: 'AT_RISK',
    headlineIssue: 'T-204 transformer delivery slip of 14 days compressing cold commissioning window.',
    actionRequired: 'Authorise expedited police-escorted heavy haulage from Mombasa Berth 4 to Rabai substation.'
  },
  {
    id: 'lamu',
    code: 'KET-PDS-0036',
    name: 'Lamu - Isiolo 400kV Transmission Corridor',
    voltage: '400kV',
    strategicObjective: 'Anchor power backbone for LAPSSET corridor, enabling northern Kenya regional industrialization.',
    deliveryProbability: 94.0,
    capitalBudget: 'KES 11.40B',
    capitalCommitted: 'KES 9.80B (86.0%)',
    status: 'HEALTHY',
    headlineIssue: 'Geotechnical bedrock variations on tower foundations 140-184.',
    actionRequired: 'Ratify Variation Order 02 capped at KES 120M following independent engineering audit.'
  },
  {
    id: 'south',
    code: 'KET-PDS-0084',
    name: 'South Coast 220kV Regional Backbone',
    voltage: '220kV',
    strategicObjective: 'Reliable transmission intertie with Tanzania and tourism hub power stability in Kwale county.',
    deliveryProbability: 68.0,
    capitalBudget: 'KES 2.90B',
    capitalCommitted: 'KES 720M (24.8%)',
    status: 'CRITICAL',
    headlineIssue: '35-day procurement lag following PPRA tender dispute.',
    actionRequired: 'Execute contract award immediately following clearance from Attorney General.'
  },
  {
    id: 'nairobi',
    code: 'KET-PDS-0018',
    name: 'Nairobi Metropolitan 132kV Ring System',
    voltage: '132kV',
    strategicObjective: 'Provide N-1 transmission redundancy to Nairobi CBD and eliminate transmission constraints.',
    deliveryProbability: 96.5,
    capitalBudget: 'KES 5.20B',
    capitalCommitted: 'KES 5.02B (96.5%)',
    status: 'HEALTHY',
    headlineIssue: 'Final fiber optic SCADA telemetry handshake pending NCC test slot.',
    actionRequired: 'Authorize 4-hour system outage schedule with KPLC National Control Centre for 12 Oct.'
  }
];

export const EXECUTIVE_CHANGE_FEED: ExecutiveChangeFeedItem[] = [
  {
    id: 'chg-01',
    timestamp: 'Today, 11:30 AM',
    headline: 'NEMA Licence Granted for Tana River 220kV Section 2',
    project: 'Tana River 220kV Hydro Intertie',
    type: 'REGULATORY',
    impactLevel: 'HIGH',
    summary: 'NEMA issued environmental clearance licence (NEMA/EIA/PSL/1942) with conditions on riverine flora monitoring.'
  },
  {
    id: 'chg-02',
    timestamp: 'Today, 09:45 AM',
    headline: 'Treasury Counterpart Funding of KES 280M Disbursed',
    project: 'Mombasa 400kV Ring & Interconnector',
    type: 'COMMERCIAL',
    impactLevel: 'HIGH',
    summary: 'Exchequer funds credited to KETRACO special project account, enabling clearance of outstanding IPC certificates.'
  },
  {
    id: 'chg-03',
    timestamp: 'Yesterday, 04:15 PM',
    headline: 'Transformer T-204 Shipping ETA Confirmed: 20 Sep',
    project: 'Mombasa 400kV Ring & Interconnector',
    type: 'SUPPLY',
    impactLevel: 'CRITICAL',
    summary: 'Vessel MSC Aurora berthed in Salalah, Oman; final arrival at Mombasa Berth 4 scheduled for 20 Sep.'
  },
  {
    id: 'chg-04',
    timestamp: 'Yesterday, 02:00 PM',
    headline: 'PPRA Tribunal Clears South Coast 220kV EPC Award',
    project: 'South Coast 220kV Regional Backbone',
    type: 'COMMERCIAL',
    impactLevel: 'HIGH',
    summary: 'Public Procurement Administrative Review Board dismissed rival bidder appeal, confirming KETRACO award.'
  }
];

export const EXECUTIVE_ATTENTION_ITEMS: ExecutiveAttentionItem[] = [
  {
    id: 'att-01',
    project: 'Tana River 220kV Hydro Intertie',
    area: 'Wayleave Escrow Compensation',
    urgency: 'IMMEDIATE',
    description: '14 landowners in Section 3 refuse access until compensation escrow deposit of KES 45M is placed with NLC.',
    financialImpact: 'KES 45M deposit required from project contingency.',
    timelineImpact: 'Causes 21 days delay to tower foundation excavation.',
    escalatedBy: 'General Manager, Project Development Services'
  },
  {
    id: 'att-02',
    project: 'Mombasa 400kV Ring & Interconnector',
    area: 'Heavy Haulage Transportation Route',
    urgency: 'HIGH',
    description: 'KeNHA axle-load exemption and police escort needed for 180-tonne transformer movement on Mombasa road.',
    financialImpact: 'KES 1.8M special transport licensing fees.',
    timelineImpact: '4 days saved if permit issued before ship docking.',
    escalatedBy: 'Project Manager, Mombasa 400kV'
  },
  {
    id: 'att-03',
    project: 'Lamu - Isiolo 400kV Corridor',
    area: 'Contractor Standby Claims',
    urgency: 'MONITOR',
    description: 'PowerChina submitted formal notice of claim for KES 124M due to delayed security clearance in June.',
    financialImpact: 'Maximum exposure KES 124M; audit assesses valid claim at KES 38M.',
    timelineImpact: 'No direct schedule delay; potential commercial litigation.',
    escalatedBy: 'Head of Legal & Regulatory Affairs'
  }
];

export const EXECUTIVE_DECISION_ITEMS: ExecutiveDecisionItem[] = [
  {
    id: 'dec-01',
    decisionId: 'DEC-2026-084',
    title: 'Authorize Emergency Escrow Fund Deposit for Section 3 Land Acquisition',
    project: 'Tana River 220kV Hydro Intertie',
    authority: 'Managing Director / Finance Committee',
    deadline: 'Tomorrow, 5:00 PM',
    financialImplication: 'KES 45,000,000 drawdown from Wayleave Contingency Sub-Account',
    summary: 'Placing KES 45M in National Land Commission statutory escrow unblocks 14 contested tower footings, avoiding contractor demobilization claims of KES 62M.',
    options: [
      { label: 'Approve Escrow Transfer', impact: 'Immediately unblocks 5.2km corridor; saves KES 17M net.', actionKey: 'APPROVE' },
      { label: 'Refer to Court Arbitration', impact: 'Delay extends +90 days; contractor will demobilize.', actionKey: 'DEFER' },
      { label: 'Reroute Transmission Line', impact: 'Adds 3.4km line, +KES 85M and 6 months redesign.', actionKey: 'REJECT' }
    ],
    status: 'PENDING'
  },
  {
    id: 'dec-02',
    decisionId: 'DEC-2026-085',
    title: 'Approve Fast-Track Air Freight for Auxiliary Protection Panels',
    project: 'Mombasa 400kV Ring & Interconnector',
    authority: 'Managing Director / Director Project Management',
    deadline: 'Within 48 Hours',
    financialImplication: '+KES 3,200,000 differential air freight expense',
    summary: 'Air freighting 2 remaining protection panels from Frankfurt recovers 14 days on cold commissioning critical path.',
    options: [
      { label: 'Authorize Air Freight (+KES 3.2M)', impact: 'Protects commercial energization date; saves 14 days.', actionKey: 'APPROVE' },
      { label: 'Maintain Sea Freight', impact: 'Zero additional cost, but delays commissioning by 14 days.', actionKey: 'REJECT' }
    ],
    status: 'PENDING'
  },
  {
    id: 'dec-03',
    decisionId: 'DEC-2026-086',
    title: 'Execute Formal EPC Contract Award for South Coast 220kV Backbone',
    project: 'South Coast 220kV Regional Backbone',
    authority: 'Board Tender Committee / Managing Director',
    deadline: '18 Sep 2026',
    financialImplication: 'KES 2,900,000,000 EPC Commitment',
    summary: 'Following dismissal of PPARB appeals, the contract award can now proceed to conclusion with the evaluated responsive bidder.',
    options: [
      { label: 'Sign & Issue Letter of Award', impact: 'Mobilizes contractor in Q4 2026; secures financier funding.', actionKey: 'APPROVE' },
      { label: 'Request Secondary Legal Opinion', impact: 'Postpones award by 21 days; risks financier commitment expiry.', actionKey: 'DEFER' }
    ],
    status: 'PENDING'
  }
];
