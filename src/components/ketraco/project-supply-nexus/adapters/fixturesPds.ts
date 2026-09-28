import {
  DevelopmentPipelineProject,
  ConceptItem,
  FeasibilityAssessmentItem,
  FundingTrancheItem,
  RegulatoryApprovalItem,
  GateReadinessItem
} from '../types';

export const DEVELOPMENT_PIPELINE_PROJECTS: DevelopmentPipelineProject[] = [
  {
    id: 'pipe-01',
    code: 'KET-DEV-0104',
    name: 'Turkana - Marsabit 400kV Wind Evacuation',
    voltage: '400kV',
    stage: 'Need',
    readiness: 28,
    blockers: ['National Grid Master Plan 2030 alignment update pending'],
    blockerSeverity: 'NONE',
    owner: 'Eng. Dennis Kipchumba',
    dueDate: '15 Nov 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 35,
    evidenceCount: 3,
    nextAction: 'Finalize generation forecast with KenGen and Lake Turkana Wind Power.'
  },
  {
    id: 'pipe-02',
    code: 'KET-DEV-0098',
    name: 'Kitale - Lodwar 220kV Northwestern Corridor',
    voltage: '220kV',
    stage: 'Concept',
    readiness: 62,
    blockers: ['Preliminary route alternative selection across Cherangany Hills'],
    blockerSeverity: 'HIGH',
    owner: 'Eng. Patrick Koech',
    dueDate: '20 Oct 2026',
    riskTier: 'MEDIUM',
    evidenceCompleteness: 58,
    evidenceCount: 7,
    nextAction: 'Complete drone lidar aerial contour survey on Route Option B.'
  },
  {
    id: 'pipe-03',
    code: 'KET-DEV-0089',
    name: 'Meru - Maua 132kV Agricultural Feeder',
    voltage: '132kV',
    stage: 'Feasibility',
    readiness: 74,
    blockers: ['ESIA public participation hearings in Meru County'],
    blockerSeverity: 'HIGH',
    owner: 'Eng. Grace Mwiti',
    dueDate: '30 Oct 2026',
    riskTier: 'MEDIUM',
    evidenceCompleteness: 72,
    evidenceCount: 14,
    nextAction: 'File formal draft ESIA report with NEMA for gazettement.'
  },
  {
    id: 'pipe-04',
    code: 'KET-PDS-0071',
    name: 'Tana River 220kV Hydro Intertie',
    voltage: '220kV',
    stage: 'Land/Wayleave',
    readiness: 54,
    blockers: ['14 disputed communal land title successions in Tana Delta'],
    blockerSeverity: 'CRITICAL',
    owner: 'Wayleave Dept. (Eng. Hassan Abdi)',
    dueDate: '15 Dec 2026',
    riskTier: 'HIGH',
    evidenceCompleteness: 64,
    evidenceCount: 22,
    nextAction: 'Deposit KES 45M in NLC compensation escrow account.'
  },
  {
    id: 'pipe-05',
    code: 'KET-DEV-0078',
    name: 'Narok - Bomet 220kV Interconnector',
    voltage: '220kV',
    stage: 'Funding',
    readiness: 81,
    blockers: ['Financier AfDB Condition Precedent on counterpart funding release'],
    blockerSeverity: 'HIGH',
    owner: 'Finance Directorate (Mrs. Jane Mutiso)',
    dueDate: '25 Nov 2026',
    riskTier: 'MEDIUM',
    evidenceCompleteness: 85,
    evidenceCount: 18,
    nextAction: 'Obtain Treasury exchequer counterpart allocation letter.'
  },
  {
    id: 'pipe-06',
    code: 'KET-DEV-0072',
    name: 'Mariakani - Dongo Kundu 220kV SEZ Link',
    voltage: '220kV',
    stage: 'Approval',
    readiness: 88,
    blockers: ['KPA berth right-of-way crossing clearance pending'],
    blockerSeverity: 'HIGH',
    owner: 'Legal & Regulatory (Mr. Collins Oloo)',
    dueDate: '10 Oct 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 90,
    evidenceCount: 16,
    nextAction: 'Execute joint easement agreement with Kenya Ports Authority.'
  },
  {
    id: 'pipe-07',
    code: 'KET-PDS-0084',
    name: 'South Coast 220kV Regional Backbone',
    voltage: '220kV',
    stage: 'Procurement',
    readiness: 76,
    blockers: ['EPC contract award finalization post-PPARB review'],
    blockerSeverity: 'CRITICAL',
    owner: 'Supply Chain Dept. (Eng. Omar Mwashetani)',
    dueDate: '18 Sep 2026',
    riskTier: 'HIGH',
    evidenceCompleteness: 79,
    evidenceCount: 26,
    nextAction: 'Issue notification of award to lowest evaluated responsive bidder.'
  },
  {
    id: 'pipe-08',
    code: 'KET-DEV-0061',
    name: 'Isinya - Konza 400kV Smart City Spur',
    voltage: '400kV',
    stage: 'Design',
    readiness: 92,
    blockers: ['Gas Insulated Switchgear (GIS) single line diagram review by EPRA'],
    blockerSeverity: 'NONE',
    owner: 'Engineering & Design (Eng. Sarah Ochieng)',
    dueDate: '14 Nov 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 94,
    evidenceCount: 31,
    nextAction: 'Issue approved for construction (IFC) structural drawings to EPC.'
  },
  {
    id: 'pipe-09',
    code: 'KET-PDS-0042',
    name: 'Mombasa 400kV Ring & Interconnector',
    voltage: '400kV',
    stage: 'Construction',
    readiness: 68,
    blockers: ['Transformer T-204 shipment ETA delayed +14 days'],
    blockerSeverity: 'CRITICAL',
    owner: 'Eng. David Gitau',
    dueDate: '28 Nov 2026',
    riskTier: 'HIGH',
    evidenceCompleteness: 88,
    evidenceCount: 54,
    nextAction: 'Receive vessel MSC Aurora at Mombasa berth 4 and dispatch low loader.'
  },
  {
    id: 'pipe-10',
    code: 'KET-PDS-0029',
    name: 'Kisumu - Lessos 220kV Grid Reinforcement',
    voltage: '220kV',
    stage: 'Commissioning',
    readiness: 94,
    blockers: ['Final protection trip test with KPLC National Control Centre'],
    blockerSeverity: 'NONE',
    owner: 'Eng. Joseph Otieno',
    dueDate: '30 Sep 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 96,
    evidenceCount: 42,
    nextAction: 'Execute 72-hour trial energization run on Lessos-Mamboleo line.'
  },
  {
    id: 'pipe-11',
    code: 'KET-PDS-0012',
    name: 'Olkaria - Suswa 220kV Dual Circuit Line',
    voltage: '220kV',
    stage: 'Handover',
    readiness: 99,
    blockers: ['As-built CAD documentation signoff with Operations & Maintenance'],
    blockerSeverity: 'NONE',
    owner: 'Eng. Moses Chebet',
    dueDate: '28 Sep 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 100,
    evidenceCount: 38,
    nextAction: 'Issue final commercial operational certificate (PAC).'
  },
  {
    id: 'pipe-12',
    code: 'KET-OPS-0004',
    name: 'Isinya - Konza 400kV Smart City Spine',
    voltage: '400kV',
    stage: 'Operations',
    readiness: 100,
    blockers: [],
    blockerSeverity: 'NONE',
    owner: 'Ops & Maintenance (Eng. Beatrice Wanjiku)',
    dueDate: '15 Oct 2026',
    riskTier: 'LOW',
    evidenceCompleteness: 100,
    evidenceCount: 65,
    nextAction: 'Complete 12-month post-commercial energization performance warranty audit.'
  }
];

export const CONCEPTS_WORKSPACE_DATA: ConceptItem[] = [
  {
    id: 'concept-01',
    code: 'CPT-2026-004',
    title: 'Kitale - Lodwar 220kV Northwestern Transmission Corridor',
    transmissionNeed: 'The Turkana region currently relies on expensive, polluting off-grid diesel generation. A 220kV backbone connects the northwest to the national grid, reducing cost from KES 42/kWh to KES 8/kWh and powering irrigation and water extraction.',
    objective: 'Integrate Turkana county into the national grid and support regional trade corridor with South Sudan.',
    voltage: '220kV Double Circuit',
    route: 'Kitale Substation - Kapenguria - Marich Pass - Kainuk - Lokichar - Lodwar',
    lengthKm: 284,
    substations: ['Kitale 220/132kV Expansion', 'Marich Pass 220/33kV', 'Lodwar 220/66/33kV'],
    capacityMw: 250,
    beneficiaries: 'Over 850,000 residents in West Pokot & Turkana counties, oil field exploration, South Sudan cross-border border posts.',
    reliabilityRationale: 'N-1 transmission criteria eliminating total blackout risk during maintenance outages.',
    preliminaryCapex: 'KES 8.65B',
    preliminarySchedule: '30 Months (Q1 2027 - Q3 2029)',
    economicEirr: '21.4% Economic Internal Rate of Return',
    status: 'BOARD_REVIEW',
    alternatives: [
      {
        id: 'alt-a',
        name: 'Option A: Direct Marich Pass Gorge Route (Selected)',
        description: 'Follows existing highway corridor through Marich Pass. Shorter distance, existing road access for construction cranes.',
        capex: 'KES 8.65B',
        lengthKm: 284,
        environmentalImpact: 'MODERATE',
        wayleaveComplexity: 'LOW',
        technicalMerit: 'Utilizes KeNHA road reserve for 45% of route, minimizing private land acquisition.'
      },
      {
        id: 'alt-b',
        name: 'Option B: Cherangany Eastern Bypass',
        description: 'Circumnavigates the Marich gorge via eastern plateau to avoid rockfall hazard zones.',
        capex: 'KES 10.80B',
        lengthKm: 348,
        environmentalImpact: 'HIGH',
        wayleaveComplexity: 'HIGH',
        technicalMerit: 'Longer distance (+64km), higher transmission losses, crosses pristine indigenous forest zone.'
      }
    ]
  },
  {
    id: 'concept-02',
    code: 'CPT-2026-007',
    title: 'Isinya - Konza 400kV Technopolis Smart City Spur',
    transmissionNeed: 'Konza Technopolis smart city and national data centres require Tier IV power reliability with twin 400kV grid feeds.',
    objective: 'Provide world-class 99.999% uptime electrical supply to national government cloud data centres.',
    voltage: '400kV Single Circuit (Tower designed for Double Circuit)',
    route: 'Isinya 400kV Hub - Malili - Konza Technopolis Substation',
    lengthKm: 42,
    substations: ['Isinya 400kV Substation (2 Bays)', 'Konza Technopolis 400/66kV GIS'],
    capacityMw: 400,
    beneficiaries: 'Konza Technopolis, Konza Data Centre, Konza Light Industrial Park.',
    reliabilityRationale: 'Twin feeds from Olkaria geothermal and coastal coal/hydro with micro-second bus transfer.',
    preliminaryCapex: 'KES 3.90B',
    preliminarySchedule: '18 Months',
    economicEirr: '26.8%',
    status: 'APPROVED',
    alternatives: [
      {
        id: 'alt-k1',
        name: 'Option 1: Overhead 400kV Line with Compact Guyed Towers',
        description: 'Direct straight-line route across savannah grazing land.',
        capex: 'KES 3.90B',
        lengthKm: 42,
        environmentalImpact: 'LOW',
        wayleaveComplexity: 'MEDIUM',
        technicalMerit: 'Lowest capital cost and fastest execution.'
      },
      {
        id: 'alt-k2',
        name: 'Option 2: Hybrid Underground XLPE Cable (Final 8km)',
        description: 'Underground transmission into Konza smart city core to preserve visual aesthetics.',
        capex: 'KES 5.40B',
        lengthKm: 42,
        environmentalImpact: 'LOW',
        wayleaveComplexity: 'LOW',
        technicalMerit: 'Eliminates bird flight collisions near wildlife corridor; higher cost.'
      }
    ]
  }
];

export const FEASIBILITY_ASSESSMENTS_DATA: FeasibilityAssessmentItem[] = [
  {
    id: 'feas-tech',
    projectId: 'mombasa',
    pillar: 'Technical',
    score: 94,
    status: 'SATISFACTORY',
    evidence: [
      'DigSILENT PowerFactory load flow & N-1 contingency study',
      'Dynamic transient stability simulation with Olkaria IV geothermal generation',
      'Conductor ampacity and thermal ratings calculated under 40°C coastal ambient'
    ],
    gaps: ['Final harmonics distortion audit for Dongo Kundu arc furnaces pending'],
    assumptions: ['400kV line will operate at 95% power factor under normal dispatch'],
    risks: ['High salinity coastal fog requiring composite silicone insulators with 31mm/kV creepage'],
    recommendation: 'Technical design fully approved with upgraded 31mm/kV creepage insulators.'
  },
  {
    id: 'feas-econ',
    projectId: 'mombasa',
    pillar: 'Economic',
    score: 91,
    status: 'SATISFACTORY',
    evidence: [
      'Cost-benefit model computed against unserved energy cost of USD 0.85/kWh',
      'Economic Internal Rate of Return (EIRR) calculated at 23.4%',
      'Net Present Value (NPV) of USD 184M at 10% discount rate'
    ],
    gaps: ['Secondary benefit sensitivity analysis on container terminal automated cranes'],
    assumptions: ['Mombasa industrial demand grows at 6.2% CAGR between 2026 and 2035'],
    risks: ['Industrial demand ramp-up slower than projected due to tariff levels'],
    recommendation: 'Strong economic justification; project yields positive national economic returns.'
  },
  {
    id: 'feas-env',
    projectId: 'mombasa',
    pillar: 'Environmental',
    score: 82,
    status: 'ACTION_REQUIRED',
    evidence: [
      'Comprehensive Environmental & Social Impact Assessment (ESIA) Study Report',
      'NEMA License NEMA/EIA/PSL/1429 issued with 18 conditions',
      'Mangrove ecosystem mitigation plan for Likoni creek crossing'
    ],
    gaps: ['Detailed bird diverter installation plan for seasonal migratory raptor path'],
    assumptions: ['No permanent dredging required in Likoni creek tidal zone'],
    risks: ['Disruption to inter-tidal marine biodiversity during temporary work platform placement'],
    recommendation: 'Deploy high-visibility spiral bird flappers and monitor creek turbidity daily.'
  },
  {
    id: 'feas-fin',
    projectId: 'mombasa',
    pillar: 'Financial',
    score: 89,
    status: 'SATISFACTORY',
    evidence: [
      'Financial Internal Rate of Return (FIRR) model showing 14.8%',
      'Debt Service Coverage Ratio (DSCR) projected at 1.72x over 20-year loan tenure',
      'Transmission wheeling tariff model approved by EPRA at KES 0.82/kWh'
    ],
    gaps: ['Foreign exchange hedging mechanism on EUR currency component'],
    assumptions: ['Concessional loan interest rate capped at 1.8% plus Euribor'],
    risks: ['Exchange rate depreciation of KES against USD/EUR increasing debt service burden'],
    recommendation: 'Financial viability confirmed; secure Treasury sovereign debt guarantee.'
  },
  {
    id: 'feas-land',
    projectId: 'mombasa',
    pillar: 'Land',
    score: 68,
    status: 'CRITICAL_GAP',
    evidence: [
      'Resettlement Action Plan (RAP) census identifying 624 project-affected persons (PAPs)',
      'National Land Commission Gazette Notice Vol. CXXV No. 142',
      'Valuation roll for Section 1 (Mariakani to Mazeras)'
    ],
    gaps: [
      'Section 2 valuation disputed by 38 informal settlement residents',
      'Unresolved absentee landlord parcels in Likoni peri-urban zone'
    ],
    assumptions: ['NLC statutory compensation rate accepted by 90% of PAPs without court action'],
    risks: ['Court injunctions halting tower foundation construction in high-density sections'],
    recommendation: 'Deploy dedicated KETRACO grievance redress committee and NLC alternative dispute resolution.'
  },
  {
    id: 'feas-reg',
    projectId: 'mombasa',
    pillar: 'Regulatory',
    score: 96,
    status: 'SATISFACTORY',
    evidence: [
      'EPRA Transmission Facility Construction License No. EPRA/TL/400-042',
      'KCAA Height Clearance approval for 68m river crossing towers',
      'Kenya Ports Authority marine navigation clearance certificate'
    ],
    gaps: ['KeNHA special road crossing permit for Mariakani weighbridge section (in progress)'],
    assumptions: ['Grid code exemption granted for temporary single-circuit commissioning stage'],
    risks: ['Slight delay in KeNHA permit fee payment clearance'],
    recommendation: 'Regulatory compliance on track; release KeNHA permit administrative fee.'
  },
  {
    id: 'feas-soc',
    projectId: 'mombasa',
    pillar: 'Social',
    score: 84,
    status: 'SATISFACTORY',
    evidence: [
      '14 Public Consultation Barazas conducted in Kilifi, Kwale, and Mombasa counties',
      'Vulnerable and Marginalized Groups Plan (VMGP) approved',
      'Community Corporate Social Responsibility budget of KES 45M for local water boreholes'
    ],
    gaps: ['Youth employment quota verification with local county labor offices'],
    assumptions: ['Contractor will source at least 60% of unskilled labor locally'],
    risks: ['Local youth group demonstrations demanding higher casual labor quotas'],
    recommendation: 'Hold monthly joint community liaison baraza with Area Chiefs.'
  },
  {
    id: 'feas-sec',
    projectId: 'mombasa',
    pillar: 'Security',
    score: 92,
    status: 'SATISFACTORY',
    evidence: [
      'Security Threat & Risk Assessment (STRA) report by National Police Service',
      'Critical Infrastructure Protection Unit (CIPU) deployment agreement',
      'Perimeter intrusion detection design for Mariakani and Rabai substations'
    ],
    gaps: ['Vandalism prevention strategy for copper earth cables in peri-urban section'],
    assumptions: ['Armed security escort available during remote stringing works'],
    risks: ['Theft of galvanized tower member bolts in unpopulated sections'],
    recommendation: 'Use anti-theft tack-welded shear bolts up to 5 meters height on all towers.'
  },
  {
    id: 'feas-impl',
    projectId: 'mombasa',
    pillar: 'Implementation',
    score: 87,
    status: 'SATISFACTORY',
    evidence: [
      'EPC procurement strategy and FIDIC Silver Book conditions cleared with AfDB',
      'Integrated Primavera P6 critical path master schedule with resource leveling',
      'Independent QA/QC technical inspection framework contract with Bureau Veritas'
    ],
    gaps: ['Mariakani contractor heavy staging yard lease registration (underway)'],
    assumptions: ['Customs direct expedited clearance for 400kV shunt reactors through Mombasa Port within 10 days'],
    risks: ['Berth congestion at Mombasa Port container terminal delaying high-voltage transformer discharge'],
    recommendation: 'Register project with KRA green channel for out-of-gauge heavy electrical cargo priority discharge.'
  }
];

export const FUNDING_TRANCHES_DATA: FundingTrancheItem[] = [
  {
    id: 'fund-afdb',
    projectId: 'mombasa',
    fundingSource: 'African Development Bank (AfDB)',
    type: 'CONCESSIONAL_LOAN',
    committedFunding: 'KES 3,850,000,000',
    fundingRequest: 'KES 3,850,000,000',
    disbursedToDate: 'KES 2,480,000,000 (64.4%)',
    financingGap: 'KES 0',
    disbursementSchedule: [
      { quarter: 'Q1 2025', amount: 'KES 650M', status: 'COMPLETED' },
      { quarter: 'Q3 2025', amount: 'KES 980M', status: 'COMPLETED' },
      { quarter: 'Q1 2026', amount: 'KES 850M', status: 'COMPLETED' },
      { quarter: 'Q3 2026', amount: 'KES 720M', status: 'PENDING_CONDITIONS' },
      { quarter: 'Q1 2027', amount: 'KES 650M', status: 'PROJECTED' }
    ],
    conditionsPrecedent: [
      { title: 'Full RAP compensation evidence submitted for Sections 1 & 2', status: 'SATISFIED', dueDate: '15 Jan 2025' },
      { title: 'Independent Environmental Audit Report for Q2 2026 submitted', status: 'SATISFIED', dueDate: '30 Jun 2026' },
      { title: 'Treasury Counterpart Funding matching parity certificate', status: 'IN_PROGRESS', dueDate: '30 Sep 2026' }
    ],
    financierRequirements: [
      'Procurement following AfDB Standard Bidding Documents',
      'Monthly Environmental & Social Compliance Monitoring',
      'Mandatory grievance mechanism reporting'
    ],
    financingRisk: 'Low; tranches released on schedule subject to Treasury matching allocation.'
  },
  {
    id: 'fund-jica',
    projectId: 'mombasa',
    fundingSource: 'Japan International Cooperation Agency (JICA)',
    type: 'CONCESSIONAL_LOAN',
    committedFunding: 'KES 1,650,000,000',
    fundingRequest: 'KES 1,650,000,000',
    disbursedToDate: 'KES 980,000,000 (59.4%)',
    financingGap: 'KES 0',
    disbursementSchedule: [
      { quarter: 'Q2 2025', amount: 'KES 420M', status: 'COMPLETED' },
      { quarter: 'Q4 2025', amount: 'KES 560M', status: 'COMPLETED' },
      { quarter: 'Q3 2026', amount: 'KES 390M', status: 'PENDING_CONDITIONS' },
      { quarter: 'Q4 2026', amount: 'KES 280M', status: 'PROJECTED' }
    ],
    conditionsPrecedent: [
      { title: 'Substation Transformer Factory Acceptance Test (FAT) witness signoff', status: 'SATISFIED', dueDate: '10 Aug 2026' },
      { title: 'Verification of Japanese consultant supervision engineer mandate', status: 'SATISFIED', dueDate: '15 Feb 2025' }
    ],
    financierRequirements: ['Tied equipment procurement verification', 'Quarterly financial audit by Auditor General'],
    financingRisk: 'Very Low; sovereign loan with 40-year tenure and 0.2% interest.'
  },
  {
    id: 'fund-gok',
    projectId: 'mombasa',
    fundingSource: 'Government of Kenya (Counterpart Exchequer)',
    type: 'GOK_EXCHEQUER',
    committedFunding: 'KES 600,000,000',
    fundingRequest: 'KES 600,000,000',
    disbursedToDate: 'KES 320,000,000 (53.3%)',
    financingGap: 'KES 80,000,000 (Pending Exchequer Requisition)',
    disbursementSchedule: [
      { quarter: 'FY 24/25 Q3', amount: 'KES 180M', status: 'COMPLETED' },
      { quarter: 'FY 24/25 Q4', amount: 'KES 140M', status: 'COMPLETED' },
      { quarter: 'FY 25/26 Q1', amount: 'KES 120M', status: 'PENDING_CONDITIONS' },
      { quarter: 'FY 25/26 Q2', amount: 'KES 160M', status: 'PROJECTED' }
    ],
    conditionsPrecedent: [
      { title: 'National Treasury Project Progress Review Committee signoff', status: 'SATISFIED', dueDate: '12 Jul 2026' },
      { title: 'NLC verified compensation disbursement vouchers for Section 3', status: 'IN_PROGRESS', dueDate: '15 Oct 2026' }
    ],
    financierRequirements: ['Public Finance Management (PFM) Act compliance', 'Internal Audit quarterly returns'],
    financingRisk: 'Moderate; periodic exchequer liquidity constraints can delay RAP escrow funding.'
  }
];

export const REGULATORY_APPROVALS_DATA: RegulatoryApprovalItem[] = [
  {
    id: 'app-01',
    projectId: 'mombasa',
    approval: 'Transmission Facility Construction License',
    authority: 'Energy and Petroleum Regulatory Authority (EPRA)',
    owner: 'Mr. Collins Oloo (Legal Directorate)',
    submissionDate: '14 Oct 2024',
    evidence: 'License Document EPRA/TL/400-042 Signed & Sealed',
    status: 'APPROVED',
    dueDate: '15 Dec 2024',
    blocker: null,
    escalation: 'None; license active through 2029.'
  },
  {
    id: 'app-02',
    projectId: 'mombasa',
    approval: 'Environmental Impact Assessment License',
    authority: 'National Environment Management Authority (NEMA)',
    owner: 'Dr. Anne Karimi (Environment Dept.)',
    submissionDate: '02 Nov 2024',
    evidence: 'NEMA License No. NEMA/EIA/PSL/1429',
    status: 'APPROVED',
    dueDate: '28 Jan 2025',
    blocker: null,
    escalation: 'Annual environmental audit submission due November 2026.'
  },
  {
    id: 'app-03',
    projectId: 'mombasa',
    approval: 'Gazettement of Statutory Wayleave Corridors',
    authority: 'National Land Commission (NLC)',
    owner: 'Eng. Hassan Abdi (Wayleave Dept.)',
    submissionDate: '15 Mar 2025',
    evidence: 'Kenya Gazette Vol. CXXV No. 142',
    status: 'APPROVED',
    dueDate: '30 May 2025',
    blocker: null,
    escalation: 'Section 3 supplementary valuation roll gazettement pending.'
  },
  {
    id: 'app-04',
    projectId: 'mombasa',
    approval: 'Airspace Height Clearance for River Crossing Towers',
    authority: 'Kenya Civil Aviation Authority (KCAA)',
    owner: 'Eng. Brian Ndwiga (Lead Surveyor)',
    submissionDate: '10 Feb 2025',
    evidence: 'KCAA Airspace Clearance Ref: KCAA/ATS/PER/2025/084',
    status: 'APPROVED',
    dueDate: '15 Apr 2025',
    blocker: null,
    escalation: 'Towers 112 and 113 fitted with solar aviation obstruction beacons.'
  },
  {
    id: 'app-05',
    projectId: 'mombasa',
    approval: 'Special Highway & Railway Crossing Permits',
    authority: 'Kenya National Highways Authority (KeNHA) & KRC',
    owner: 'Eng. David Gitau (Project Manager)',
    submissionDate: '18 Jul 2026',
    evidence: 'Joint Inspection Minutes with KeNHA Coast Regional Director',
    status: 'UNDER_REVIEW',
    dueDate: '25 Sep 2026',
    blocker: 'Administrative processing fee receipt verification at KeNHA headquarters.',
    escalation: 'Director Project Management follow-up with KeNHA Director General.'
  },
  {
    id: 'app-06',
    projectId: 'mombasa',
    approval: 'National Grid Code Commissioning Exemption',
    authority: 'EPRA & KPLC National Control Centre (NCC)',
    owner: 'Eng. Sarah Ochieng (SCADA/Protection Lead)',
    submissionDate: '01 Aug 2026',
    evidence: 'Draft Temporary Energization Protocol Rev 2',
    status: 'PENDING_SUBMISSION',
    dueDate: '15 Oct 2026',
    blocker: 'Requires cold dielectric test data from transformer T-204.',
    escalation: 'Schedule formal technical review session once transformer docks.'
  }
];

export const GATE_READINESS_DATA: GateReadinessItem[] = [
  {
    id: 'gate-01',
    projectId: 'mombasa',
    gateNumber: 1,
    gateName: 'Gate 1: Concept & Strategic Need Approval',
    readinessScore: 100,
    status: 'READY',
    mandatoryCriteria: [
      { criterion: 'Grid Master Plan 2030 priority project alignment', met: true, evidenceRef: 'GMP-SEC-04' },
      { criterion: 'Preliminary Capex and economic EIRR > 12%', met: true, evidenceRef: 'EIRR Report 23.4%' },
      { criterion: 'Board of Directors concept approval minute', met: true, evidenceRef: 'BOD Minute 142/2023' }
    ],
    evidenceCompleteness: 100,
    outstandingRisks: [],
    approvals: [
      { name: 'General Manager, Planning', signed: true, signee: 'Eng. John Mativo' },
      { name: 'Managing Director', signed: true, signee: 'Dr. John Kipchumba' }
    ],
    actions: ['Archive gate dossier in enterprise document management system.'],
    decisionAuthority: 'Board of Directors'
  },
  {
    id: 'gate-02',
    projectId: 'mombasa',
    gateNumber: 2,
    gateName: 'Gate 2: Feasibility & Route Corridor Signoff',
    readinessScore: 100,
    status: 'READY',
    mandatoryCriteria: [
      { criterion: 'DigSILENT technical power flow validation', met: true, evidenceRef: 'DigSILENT Rev 4' },
      { criterion: 'NEMA ESIA License secured', met: true, evidenceRef: 'License PSL/1429' },
      { criterion: 'Resettlement Action Plan census finalized', met: true, evidenceRef: 'RAP Final Roll' },
      { criterion: 'EPRA Construction License granted', met: true, evidenceRef: 'EPRA/TL/400-042' }
    ],
    evidenceCompleteness: 100,
    outstandingRisks: ['Mangrove protection requirements in Likoni creek section'],
    approvals: [
      { name: 'Director, Project Development Services', signed: true, signee: 'Eng. Anthony Musyoka' },
      { name: 'Director, Legal & Corporate Services', signed: true, signee: 'Adv. Maryanne Njeri' }
    ],
    actions: ['Publish corridor coordinates to Kenya National Spatial Data Infrastructure.'],
    decisionAuthority: 'PDS Gate Committee'
  },
  {
    id: 'gate-03',
    projectId: 'mombasa',
    gateNumber: 3,
    gateName: 'Gate 3: Financing Agreement & EPC Tender Launch',
    readinessScore: 100,
    status: 'READY',
    mandatoryCriteria: [
      { criterion: 'AfDB Loan Agreement signed & ratified by National Assembly', met: true, evidenceRef: 'AfDB Loan 210015' },
      { criterion: 'JICA Bilateral Concessional Agreement executed', met: true, evidenceRef: 'JICA KE-P38' },
      { criterion: 'Treasury Counterpart Commitment letter on file', met: true, evidenceRef: 'MOF/ERD/42/2024' },
      { criterion: 'PPADA standard tender documents cleared by Financiers', met: true, evidenceRef: 'NO-OBJECTION-AFDB-04' }
    ],
    evidenceCompleteness: 100,
    outstandingRisks: [],
    approvals: [
      { name: 'National Treasury Cabinet Secretary', signed: true, signee: 'Prof. Njuguna Ndung’u' },
      { name: 'AfDB Regional Director', signed: true, signee: 'Nnenna Nwabufo' }
    ],
    actions: ['Publish international competitive bid notices in UNDB and national dailies.'],
    decisionAuthority: 'National Treasury & Board of Directors'
  },
  {
    id: 'gate-04',
    projectId: 'mombasa',
    gateNumber: 4,
    gateName: 'Gate 4: Notice to Proceed (NTP) & Site Handover',
    readinessScore: 88,
    status: 'AT_RISK',
    mandatoryCriteria: [
      { criterion: 'At least 75% unencumbered right-of-way corridor handed over', met: true, evidenceRef: '81.4% Handover Protocol' },
      { criterion: 'Performance bond 10% from Tier 1 bank verified', met: true, evidenceRef: 'Stanbic Bank PB-4029' },
      { criterion: 'Contractor Advance Payment Guarantee verified', met: true, evidenceRef: 'KCB Bank APG-192' },
      { criterion: 'Section 3 disputed parcels access agreement', met: false, evidenceRef: '14 parcels pending NLC escrow' }
    ],
    evidenceCompleteness: 88,
    outstandingRisks: ['Landowner access protest on towers 182-195 in Mariakani'],
    approvals: [
      { name: 'Director, Project Management', signed: true, signee: 'Eng. Peter Gitau' },
      { name: 'Resident Supervising Engineer', signed: false, signee: 'Eng. David Gitau' }
    ],
    actions: [
      'Deposit KES 45M into NLC compensation escrow account.',
      'Sign conditional site handover protocol for Sections 1 & 2.'
    ],
    decisionAuthority: 'Project Steering Committee'
  },
  {
    id: 'gate-05',
    projectId: 'mombasa',
    gateNumber: 5,
    gateName: 'Gate 5: Commercial Energization & Grid Handover',
    readinessScore: 64,
    status: 'NOT_READY',
    mandatoryCriteria: [
      { criterion: '100% towers erected and conductors tension strung', met: false, evidenceRef: 'Stringing at 38%' },
      { criterion: 'Transformer T-204 installed, oil filled & dielectric passed', met: false, evidenceRef: 'In transit on vessel MSC Aurora' },
      { criterion: 'SCADA telemetry integration with KPLC National Control Centre', met: false, evidenceRef: 'Tele-protection test slot scheduled 12 Oct' },
      { criterion: 'EPRA Certificate of Compliance for high voltage energization', met: false, evidenceRef: 'Inspection to follow cold commissioning' }
    ],
    evidenceCompleteness: 64,
    outstandingRisks: [
      '14-day schedule compression required to meet 28 Nov energization',
      'High-voltage testing equipment availability slot'
    ],
    approvals: [
      { name: 'Chief Commissioning Engineer', signed: false, signee: 'Eng. Sarah Ochieng' },
      { name: 'KPLC National Control Centre General Manager', signed: false, signee: 'Eng. George Tarus' }
    ],
    actions: [
      'Expedite customs clearance and police escort for transformer T-204.',
      'Execute pre-commissioning dry wiring on auxiliary bay ahead of transformer arrival.'
    ],
    decisionAuthority: 'Grid Code Commissioning Panel'
  }
];
