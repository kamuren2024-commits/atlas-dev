import {
  ScheduleActivity,
  CostBreakdownItem,
  ResourceEntity,
  ProgressSPoint,
  CriticalPathItem
} from '../types';

export const SCHEDULE_ACTIVITIES_DATA: ScheduleActivity[] = [
  {
    id: 'act-01',
    wbsCode: '1.1.1',
    name: 'Topographical Centerline Survey & Tower Staking',
    durationDays: 45,
    baselineStart: '15 Jan 2025',
    baselineEnd: '01 Mar 2025',
    actualStart: '15 Jan 2025',
    actualEnd: '26 Feb 2025',
    forecastEnd: '26 Feb 2025',
    progress: 100,
    floatDays: 18,
    isCritical: false,
    dependencies: [],
    owner: 'Eng. Brian Ndwiga'
  },
  {
    id: 'act-02',
    wbsCode: '1.1.2',
    name: 'Geotechnical Soil Boring & Foundation Classification',
    durationDays: 60,
    baselineStart: '01 Feb 2025',
    baselineEnd: '01 Apr 2025',
    actualStart: '05 Feb 2025',
    actualEnd: '12 Apr 2025',
    forecastEnd: '12 Apr 2025',
    progress: 100,
    floatDays: 8,
    isCritical: false,
    dependencies: ['1.1.1'],
    owner: 'Geotech Solutions Ltd'
  },
  {
    id: 'act-03',
    wbsCode: '1.2.1',
    name: 'Excavation & Civil Works: Towers 1-150',
    durationDays: 90,
    baselineStart: '15 Apr 2025',
    baselineEnd: '15 Jul 2025',
    actualStart: '18 Apr 2025',
    actualEnd: '20 Jul 2025',
    forecastEnd: '20 Jul 2025',
    progress: 100,
    floatDays: 5,
    isCritical: false,
    dependencies: ['1.1.2'],
    owner: 'Larsen & Toubro Civil'
  },
  {
    id: 'act-04',
    wbsCode: '1.2.2',
    name: 'Deep Piling Works: Likoni Creek Crossing (Towers 151-165)',
    durationDays: 110,
    baselineStart: '01 Jun 2025',
    baselineEnd: '20 Sep 2025',
    actualStart: '08 Jun 2025',
    actualEnd: '04 Oct 2025',
    forecastEnd: '04 Oct 2025',
    progress: 100,
    floatDays: 0,
    isCritical: true,
    dependencies: ['1.2.1'],
    owner: 'Sterling & Wilson Deep Piling'
  },
  {
    id: 'act-05',
    wbsCode: '1.3.1',
    name: 'Tower Steel Lattice Assembly (Towers 1-200)',
    durationDays: 85,
    baselineStart: '01 Aug 2025',
    baselineEnd: '25 Oct 2025',
    actualStart: '10 Aug 2025',
    actualEnd: '30 Oct 2025',
    forecastEnd: '30 Oct 2025',
    progress: 100,
    floatDays: 4,
    isCritical: false,
    dependencies: ['1.2.2'],
    owner: 'Larsen & Toubro Erection'
  },
  {
    id: 'act-06',
    wbsCode: '1.3.2',
    name: 'Tower Erection Section 2 (Towers 201-412)',
    durationDays: 120,
    baselineStart: '20 Oct 2025',
    baselineEnd: '20 Feb 2026',
    actualStart: '28 Oct 2025',
    forecastEnd: '10 Mar 2026',
    progress: 78,
    floatDays: 0,
    isCritical: true,
    dependencies: ['1.3.1'],
    owner: 'Larsen & Toubro Erection'
  },
  {
    id: 'act-07',
    wbsCode: '1.4.1',
    name: 'Conductor Stringing Section 1 (Mariakani to Mazeras)',
    durationDays: 60,
    baselineStart: '15 Feb 2026',
    baselineEnd: '15 Apr 2026',
    actualStart: '22 Feb 2026',
    actualEnd: '28 Apr 2026',
    forecastEnd: '28 Apr 2026',
    progress: 100,
    floatDays: 12,
    isCritical: false,
    dependencies: ['1.3.2'],
    owner: 'Sterling & Wilson Stringing'
  },
  {
    id: 'act-08',
    wbsCode: '1.4.2',
    name: 'Conductor Stringing Section 2 & OPGW (Mazeras to Rabai)',
    durationDays: 90,
    baselineStart: '01 May 2026',
    baselineEnd: '01 Aug 2026',
    actualStart: '15 May 2026',
    forecastEnd: '18 Aug 2026',
    progress: 62,
    floatDays: 0,
    isCritical: true,
    dependencies: ['1.4.1'],
    owner: 'Sterling & Wilson Stringing'
  },
  {
    id: 'act-09',
    wbsCode: '2.1.1',
    name: 'Mariakani 400kV Switchbay Civil Foundations',
    durationDays: 75,
    baselineStart: '01 Dec 2025',
    baselineEnd: '15 Feb 2026',
    actualStart: '01 Dec 2025',
    actualEnd: '14 Feb 2026',
    forecastEnd: '14 Feb 2026',
    progress: 100,
    floatDays: 14,
    isCritical: false,
    dependencies: [],
    owner: 'Eng. Kevin Mutua'
  },
  {
    id: 'act-10',
    wbsCode: '2.2.1',
    name: 'Rabai 400/220kV Autotransformer T-204 Pad Casting & Oil Basin',
    durationDays: 45,
    baselineStart: '15 Feb 2026',
    baselineEnd: '01 Apr 2026',
    actualStart: '18 Feb 2026',
    actualEnd: '28 Mar 2026',
    forecastEnd: '28 Mar 2026',
    progress: 100,
    floatDays: 28,
    isCritical: false,
    dependencies: ['2.1.1'],
    owner: 'Eng. Kevin Mutua'
  },
  {
    id: 'act-11',
    wbsCode: '2.2.2',
    name: 'Transformer T-204 Factory Acceptance & Shipping from Mumbai',
    durationDays: 80,
    baselineStart: '15 Apr 2026',
    baselineEnd: '05 Jul 2026',
    actualStart: '15 Apr 2026',
    actualEnd: '18 Jul 2026',
    forecastEnd: '20 Sep 2026',
    progress: 88,
    floatDays: -14,
    isCritical: true,
    dependencies: ['2.2.1'],
    owner: 'TBEA Hengyang / KETRACO Supply'
  },
  {
    id: 'act-12',
    wbsCode: '2.2.3',
    name: 'Heavy Haulage Low-Loader Transport: Port to Rabai Plinth',
    durationDays: 6,
    baselineStart: '06 Jul 2026',
    baselineEnd: '12 Jul 2026',
    forecastEnd: '26 Sep 2026',
    progress: 0,
    floatDays: -14,
    isCritical: true,
    dependencies: ['2.2.2'],
    owner: 'Bolloré Logistics / KeNHA Escort'
  },
  {
    id: 'act-13',
    wbsCode: '2.3.1',
    name: 'Transformer Assembly, Bushing Mount & Vacuum Oil Filling',
    durationDays: 18,
    baselineStart: '14 Jul 2026',
    baselineEnd: '01 Aug 2026',
    forecastEnd: '14 Oct 2026',
    progress: 0,
    floatDays: -14,
    isCritical: true,
    dependencies: ['2.2.3'],
    owner: 'TBEA Field Engineers'
  },
  {
    id: 'act-14',
    wbsCode: '2.4.1',
    name: 'Substation Cold Testing & Protection Relay Calibration',
    durationDays: 15,
    baselineStart: '02 Aug 2026',
    baselineEnd: '17 Aug 2026',
    forecastEnd: '29 Oct 2026',
    progress: 0,
    floatDays: -14,
    isCritical: true,
    dependencies: ['2.3.1', '1.4.2'],
    owner: 'Eng. Sarah Ochieng'
  },
  {
    id: 'act-15',
    wbsCode: '3.1.1',
    name: 'High Voltage Dielectric Breakdown & Line Soak Testing',
    durationDays: 7,
    baselineStart: '18 Aug 2026',
    baselineEnd: '25 Aug 2026',
    forecastEnd: '06 Nov 2026',
    progress: 0,
    floatDays: -14,
    isCritical: true,
    dependencies: ['2.4.1'],
    owner: 'Eng. Moses Chebet'
  },
  {
    id: 'act-16',
    wbsCode: '3.2.1',
    name: 'Commercial Energization & Grid Intertie Synchronization (COD)',
    durationDays: 5,
    baselineStart: '26 Aug 2026',
    baselineEnd: '31 Aug 2026',
    forecastEnd: '28 Nov 2026',
    progress: 0,
    floatDays: -14,
    isCritical: true,
    dependencies: ['3.1.1'],
    owner: 'Eng. David Gitau / KPLC NCC'
  }
];

export const COST_BREAKDOWN_DATA: CostBreakdownItem[] = [
  {
    id: 'cbs-01',
    wbsCode: '1.0',
    category: 'Civil Works & Tower Foundations',
    approvedBudget: 1420000000,
    baseline: 1420000000,
    commitments: 1380000000,
    actuals: 1050000000,
    forecast: 1452400000,
    etc: 402400000,
    eac: 1452400000,
    variance: 32400000,
    contingency: 50000000,
    exposure: 32400000
  },
  {
    id: 'cbs-02',
    wbsCode: '2.0',
    category: 'Tower Steel Lattice Fabrication & Supply',
    approvedBudget: 1850000000,
    baseline: 1850000000,
    commitments: 1850000000,
    actuals: 960000000,
    forecast: 1895000000,
    etc: 935000000,
    eac: 1895000000,
    variance: 45000000,
    contingency: 60000000,
    exposure: 45000000
  },
  {
    id: 'cbs-03',
    wbsCode: '3.0',
    category: 'Conductor & OPGW Materials & Stringing',
    approvedBudget: 1150000000,
    baseline: 1150000000,
    commitments: 1120000000,
    actuals: 440000000,
    forecast: 1168000000,
    etc: 728000000,
    eac: 1168000000,
    variance: 18000000,
    contingency: 40000000,
    exposure: 18000000
  },
  {
    id: 'cbs-04',
    wbsCode: '4.0',
    category: 'Substations & 400/220kV Transformers',
    approvedBudget: 1250000000,
    baseline: 1250000000,
    commitments: 1240000000,
    actuals: 650000000,
    forecast: 1342000000,
    etc: 692000000,
    eac: 1342000000,
    variance: 92000000,
    contingency: 70000000,
    exposure: 92000000
  },
  {
    id: 'cbs-05',
    wbsCode: '5.0',
    category: 'Wayleave Land Acquisition & Resettlement (RAP)',
    approvedBudget: 350000000,
    baseline: 350000000,
    commitments: 320000000,
    actuals: 240000000,
    forecast: 432600000,
    etc: 192600000,
    eac: 432600000,
    variance: 82600000,
    contingency: 40000000,
    exposure: 82600000
  },
  {
    id: 'cbs-06',
    wbsCode: '6.0',
    category: 'Engineering Supervision & Owner Project Management',
    approvedBudget: 80000000,
    baseline: 80000000,
    commitments: 75000000,
    actuals: 48000000,
    forecast: 80000000,
    etc: 32000000,
    eac: 80000000,
    variance: 0,
    contingency: 10000000,
    exposure: 0
  }
];

export const RESOURCE_ALLOCATIONS_DATA: ResourceEntity[] = [
  {
    id: 'res-01',
    name: 'Eng. Sarah Ochieng',
    type: 'ENGINEER',
    role: 'Lead Protection & SCADA Commissioning Engineer',
    assignedProjects: ['Mombasa 400kV Ring', 'Nairobi Metropolitan 132kV Ring'],
    utilizationPercent: 145,
    allocationHours: 232,
    availability: 'OVERALLOCATED',
    conflicts: ['Mombasa cold testing clashes with Nairobi NCC trial energization in Oct 2026.'],
    demandTrend: 'PEAK'
  },
  {
    id: 'res-02',
    name: 'Eng. David Gitau',
    type: 'PM',
    role: 'Chief Project Manager - Transmission',
    assignedProjects: ['Mombasa 400kV Ring & Interconnector'],
    utilizationPercent: 95,
    allocationHours: 152,
    availability: 'AVAILABLE',
    conflicts: [],
    demandTrend: 'HIGH'
  },
  {
    id: 'res-03',
    name: 'Specialist Heavy Piling Rig Unit 04 (250 Tonnes)',
    type: 'EQUIPMENT',
    role: 'Marine & Swamp Bored Piling Crane Rig',
    assignedProjects: ['Mombasa 400kV Likoni Creek', 'South Coast 220kV Diani Intertie'],
    utilizationPercent: 160,
    allocationHours: 256,
    availability: 'OVERALLOCATED',
    conflicts: ['Mobilization requested at Dongo Kundu and Diani on overlapping dates (Oct 01-18).'],
    demandTrend: 'PEAK'
  },
  {
    id: 'res-04',
    name: 'Eng. Brian Ndwiga',
    type: 'ENGINEER',
    role: 'Senior Cadastral & Geodetic Surveyor',
    assignedProjects: ['Mombasa 400kV Ring', 'Lamu - Isiolo 400kV Corridor'],
    utilizationPercent: 88,
    allocationHours: 140,
    availability: 'AVAILABLE',
    conflicts: [],
    demandTrend: 'STABLE'
  },
  {
    id: 'res-05',
    name: 'SF6 Gas Handling & Dielectric Mobile Testing Van A',
    type: 'EQUIPMENT',
    role: 'High Voltage SF6 Gas Purity & Breakdown Testing Van',
    assignedProjects: ['Mombasa 400kV Mariakani', 'Kisumu - Lessos 220kV Mamboleo'],
    utilizationPercent: 120,
    allocationHours: 192,
    availability: 'CONSTRAINED',
    conflicts: ['Requires 5 days transit between Western region and Coast.'],
    demandTrend: 'HIGH'
  },
  {
    id: 'res-06',
    name: 'Dr. Anne Karimi',
    type: 'CONSULTANT',
    role: 'Lead Environmental & Social Compliance Specialist',
    assignedProjects: ['Mombasa 400kV Ring', 'Tana River 220kV Intertie'],
    utilizationPercent: 92,
    allocationHours: 148,
    availability: 'AVAILABLE',
    conflicts: [],
    demandTrend: 'STABLE'
  }
];

export const PROGRESS_S_CURVE_DATA: ProgressSPoint[] = [
  { period: 'Jan 2025', plannedValue: 5.2, earnedValue: 5.0, actualCost: 4.8, forecastValue: 5.0 },
  { period: 'Apr 2025', plannedValue: 14.8, earnedValue: 14.1, actualCost: 14.9, forecastValue: 14.1 },
  { period: 'Jul 2025', plannedValue: 26.5, earnedValue: 25.2, actualCost: 26.8, forecastValue: 25.2 },
  { period: 'Oct 2025', plannedValue: 38.0, earnedValue: 36.4, actualCost: 38.8, forecastValue: 36.4 },
  { period: 'Jan 2026', plannedValue: 46.2, earnedValue: 43.8, actualCost: 47.1, forecastValue: 43.8 },
  { period: 'Apr 2026', plannedValue: 54.0, earnedValue: 50.1, actualCost: 55.4, forecastValue: 50.1 },
  { period: 'Jul 2026', plannedValue: 62.8, earnedValue: 53.4, actualCost: 61.2, forecastValue: 53.4 },
  { period: 'Aug 2026', plannedValue: 71.5, earnedValue: 59.8, actualCost: 67.5, forecastValue: 61.2 },
  { period: 'Sep 2026', plannedValue: 80.4, earnedValue: 68.2, actualCost: 75.8, forecastValue: 72.0 },
  { period: 'Oct 2026', plannedValue: 91.0, earnedValue: 80.5, actualCost: 86.4, forecastValue: 85.0 },
  { period: 'Nov 2026', plannedValue: 100.0, earnedValue: 94.2, actualCost: 98.2, forecastValue: 97.4 },
  { period: 'Dec 2026', plannedValue: 100.0, earnedValue: 100.0, actualCost: 105.2, forecastValue: 100.0 }
];

export const CRITICAL_PATH_ACTIVITIES_DATA: CriticalPathItem[] = [
  {
    id: 'cp-01',
    wbsCode: '2.2.2',
    activityName: 'Transformer T-204 Factory Re-QC & Sea Shipping (Mumbai to Mombasa)',
    earlyStart: '15 Apr 2026',
    earlyFinish: '20 Sep 2026',
    lateStart: '01 Apr 2026',
    lateFinish: '06 Sep 2026',
    totalFloat: -14,
    freeFloat: 0,
    threatenedMilestones: ['MS-MOM-04 Delivery on Pad', 'MS-MOM-06 Cold Commissioning'],
    commissioningImpactDays: 14,
    recoveryOpportunities: [
      {
        strategy: 'Express Berth Priority at Mombasa Port (Avoid Anchorage Dwell)',
        costDelta: '+KES 850,000 (KPA Priority Berth Fee)',
        daysRecovered: 4,
        risk: 'LOW: Pre-cleared with Kenya Ports Authority Marine Operations.'
      },
      {
        strategy: 'Pre-assembled Radiators & Conservator Piping on Standby at Site',
        costDelta: '+KES 1,200,000 (Overtime Crane Rigging Crew)',
        daysRecovered: 5,
        risk: 'LOW: TBEA technicians on site 7 days ahead of transformer delivery.'
      },
      {
        strategy: 'Dual-shift 24/7 Oil Vacuum Filling & Dielectric Degassing',
        costDelta: '+KES 2,100,000 (Continuous Generator Fuel & Night Shift Surcharge)',
        daysRecovered: 5,
        risk: 'MEDIUM: Requires uninterrupted 415V 3-phase auxiliary power.'
      }
    ]
  },
  {
    id: 'cp-02',
    wbsCode: '2.2.3',
    activityName: 'Heavy Haulage Low-Loader Transport (Mombasa Berth 4 to Rabai Substation Plinth)',
    earlyStart: '20 Sep 2026',
    earlyFinish: '26 Sep 2026',
    lateStart: '06 Sep 2026',
    lateFinish: '12 Sep 2026',
    totalFloat: -14,
    freeFloat: 0,
    threatenedMilestones: ['MS-MOM-04 Transformer Delivery at Site'],
    commissioningImpactDays: 14,
    recoveryOpportunities: [
      {
        strategy: 'Pre-approved Night Movement Escort with National Police Service (CIPU)',
        costDelta: '+KES 450,000 (Security & Road Escort)',
        daysRecovered: 2,
        risk: 'LOW: KeNHA bridge load rating clearance certificate issued.'
      }
    ]
  },
  {
    id: 'cp-03',
    wbsCode: '2.4.1',
    activityName: 'Substation Cold Testing & Protection Relay Calibration',
    earlyStart: '15 Oct 2026',
    earlyFinish: '29 Oct 2026',
    lateStart: '01 Oct 2026',
    lateFinish: '15 Oct 2026',
    totalFloat: -14,
    freeFloat: 0,
    threatenedMilestones: ['MS-MOM-06 Cold Commissioning Signoff'],
    commissioningImpactDays: 14,
    recoveryOpportunities: [
      {
        strategy: 'Deploy Parallel Secondary Injection Testing Crew from Western Grid',
        costDelta: '+KES 1,400,000 (Inter-region Deployment & Per Diems)',
        daysRecovered: 4,
        risk: 'LOW: Both crews operate standard Omicron CMC 356 test sets.'
      }
    ]
  },
  {
    id: 'cp-04',
    wbsCode: '3.1.1',
    activityName: 'High Voltage Dielectric Breakdown & Line Soak Testing (400kV Energization)',
    earlyStart: '30 Oct 2026',
    earlyFinish: '06 Nov 2026',
    lateStart: '16 Oct 2026',
    lateFinish: '23 Oct 2026',
    totalFloat: -14,
    freeFloat: 0,
    threatenedMilestones: ['MS-MOM-07 Full Line HV Dielectric Signoff'],
    commissioningImpactDays: 14,
    recoveryOpportunities: [
      {
        strategy: 'Accelerate 72-Hour Continuous No-Load Soak Test Protocol',
        costDelta: 'KES 0 (Regulatory concession with EPRA)',
        daysRecovered: 1,
        risk: 'LOW: Follows IEC 60076 transmission energization standard.'
      }
    ]
  }
];

export const SCHEDULE_GANTT_ACTIVITIES = [
  {
    id: 'act-01',
    code: '1.1.1',
    name: 'Topographical Centerline Survey & Tower Staking',
    startDate: '2026-01-15',
    endDate: '2026-03-01',
    durationDays: 45,
    progress: 100,
    totalFloatDays: 18,
    isCritical: false
  },
  {
    id: 'act-02',
    code: '1.1.2',
    name: 'Geotechnical Soil Boring & Foundation Classification',
    startDate: '2026-02-01',
    endDate: '2026-04-01',
    durationDays: 60,
    progress: 100,
    totalFloatDays: 8,
    isCritical: false
  },
  {
    id: 'act-03',
    code: '1.2.1',
    name: 'Tower Foundation Piling Likoni Creek Crossing',
    startDate: '2026-04-15',
    endDate: '2026-07-20',
    durationDays: 95,
    progress: 88,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-04',
    code: '1.3.1',
    name: 'Tower Steel Lattice Assembly (Towers 1-200)',
    startDate: '2026-06-01',
    endDate: '2026-09-15',
    durationDays: 105,
    progress: 72,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-05',
    code: '1.4.1',
    name: 'Conductor & OPGW Tension Stringing (Section 1)',
    startDate: '2026-08-01',
    endDate: '2026-10-25',
    durationDays: 85,
    progress: 45,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-06',
    code: '2.2.1',
    name: 'Rabai 400/220kV Autotransformer T-204 Pad Casting',
    startDate: '2026-03-15',
    endDate: '2026-05-15',
    durationDays: 60,
    progress: 100,
    totalFloatDays: 14,
    isCritical: false
  },
  {
    id: 'act-07',
    code: '2.2.2',
    name: 'Transformer T-204 Delivery & Low-loader Transport',
    startDate: '2026-09-01',
    endDate: '2026-09-28',
    durationDays: 28,
    progress: 30,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-08',
    code: '2.4.1',
    name: 'Substation Bay Protection Relay Calibration',
    startDate: '2026-10-01',
    endDate: '2026-10-28',
    durationDays: 28,
    progress: 15,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-09',
    code: '3.1.1',
    name: 'High Voltage Dielectric Breakdown & Line Soak Testing',
    startDate: '2026-10-25',
    endDate: '2026-11-10',
    durationDays: 16,
    progress: 0,
    totalFloatDays: 0,
    isCritical: true
  },
  {
    id: 'act-10',
    code: '3.2.1',
    name: 'Commercial Grid Energization & COD Synchronization',
    startDate: '2026-11-10',
    endDate: '2026-11-28',
    durationDays: 18,
    progress: 0,
    totalFloatDays: 0,
    isCritical: true
  }
];

export const COST_CBS_DATA = [
  {
    id: '1',
    code: 'CBS-1.0',
    name: 'Transmission Line EPC Construction',
    approvedBudget: 'KES 3,420M',
    committed: 'KES 3,380M',
    actualIncurred: 'KES 2,450M',
    eac: 'KES 3,510M',
    variance: '+KES 90M (+2.6%)',
    children: [
      {
        id: '1-1',
        code: 'CBS-1.1',
        name: 'Tower Foundations & Geotech Civils',
        approvedBudget: 'KES 1,420M',
        committed: 'KES 1,380M',
        actualIncurred: 'KES 1,050M',
        eac: 'KES 1,452M',
        variance: '+KES 32M'
      },
      {
        id: '1-2',
        code: 'CBS-1.2',
        name: 'Tower Steelwork Supply & Hydraulic Erection',
        approvedBudget: 'KES 1,850M',
        committed: 'KES 1,850M',
        actualIncurred: 'KES 960M',
        eac: 'KES 1,895M',
        variance: '+KES 45M'
      },
      {
        id: '1-3',
        code: 'CBS-1.3',
        name: 'Conductor & OPGW Stringing',
        approvedBudget: 'KES 1,150M',
        committed: 'KES 1,120M',
        actualIncurred: 'KES 440M',
        eac: 'KES 1,168M',
        variance: '+KES 18M'
      }
    ]
  },
  {
    id: '2',
    code: 'CBS-2.0',
    name: 'Substations & Autotransformer Expansion',
    approvedBudget: 'KES 1,250M',
    committed: 'KES 1,240M',
    actualIncurred: 'KES 650M',
    eac: 'KES 1,342M',
    variance: '+KES 92M (+7.3%)',
    children: [
      {
        id: '2-1',
        code: 'CBS-2.1',
        name: 'Rabai 400kV GIS Bay Equipment & Switchgear',
        approvedBudget: 'KES 650M',
        committed: 'KES 650M',
        actualIncurred: 'KES 380M',
        eac: 'KES 670M',
        variance: '+KES 20M'
      },
      {
        id: '2-2',
        code: 'CBS-2.2',
        name: '200MVA 400/220kV Autotransformer T-204 Package',
        approvedBudget: 'KES 600M',
        committed: 'KES 590M',
        actualIncurred: 'KES 270M',
        eac: 'KES 672M',
        variance: '+KES 72M'
      }
    ]
  },
  {
    id: '3',
    code: 'CBS-3.0',
    name: 'Wayleave Land Acquisition & Resettlement (RAP)',
    approvedBudget: 'KES 350M',
    committed: 'KES 320M',
    actualIncurred: 'KES 240M',
    eac: 'KES 432M',
    variance: '+KES 82M (+23.4%)'
  },
  {
    id: '4',
    code: 'CBS-4.0',
    name: 'Engineering Supervision & Project Management',
    approvedBudget: 'KES 80M',
    committed: 'KES 75M',
    actualIncurred: 'KES 48M',
    eac: 'KES 80M',
    variance: '0M (0.0%)'
  }
];

export const MONTHLY_CASHFLOW_DATA = [
  { month: 'Apr 26', planned: 'KES 280M', actual: 'KES 265M', variance: '-KES 15M' },
  { month: 'May 26', planned: 'KES 340M', actual: 'KES 310M', variance: '-KES 30M' },
  { month: 'Jun 26', planned: 'KES 420M', actual: 'KES 395M', variance: '-KES 25M' },
  { month: 'Jul 26', planned: 'KES 490M', actual: 'KES 460M', variance: '-KES 30M' },
  { month: 'Aug 26', planned: 'KES 520M', actual: 'KES 485M', variance: '-KES 35M' },
  { month: 'Sep 26', planned: 'KES 450M', actual: 'KES 430M', variance: '-KES 20M' }
];

export const RESOURCES_ALLOCATION_DATA = [
  {
    id: 'res-1',
    roleOrEquipment: 'Certified Transmission Tower Riggers Gang',
    type: 'HUMAN',
    location: 'Sector 2 (Likoni Creek to Mazeras)',
    plannedCount: 48,
    actualCount: 42,
    utilizationPercent: 114,
    status: 'OPTIMAL',
    bottleneckAlert: null
  },
  {
    id: 'res-2',
    roleOrEquipment: 'Heavy Bored Piling Rig (250-Tonne Crane)',
    type: 'EQUIPMENT',
    location: 'Towers 151-165 Plinths',
    plannedCount: 2,
    actualCount: 1,
    utilizationPercent: 160,
    status: 'CONFLICT',
    bottleneckAlert: 'Overlapping demand at South Coast Diani Intertie. Single unit operating dual shift.'
  },
  {
    id: 'res-3',
    roleOrEquipment: 'High-Tension Hydraulic Conductor Puller',
    type: 'EQUIPMENT',
    location: 'Camp 3 (Mazeras Depot)',
    plannedCount: 2,
    actualCount: 2,
    utilizationPercent: 92,
    status: 'OPTIMAL',
    bottleneckAlert: null
  },
  {
    id: 'res-4',
    roleOrEquipment: 'High Voltage Testing & Commissioning Engineers',
    type: 'HUMAN',
    location: 'Rabai 400kV Substation Control Room',
    plannedCount: 6,
    actualCount: 4,
    utilizationPercent: 145,
    status: 'OVERALLOCATED',
    bottleneckAlert: 'Lead engineer Sarah Ochieng also allocated to Nairobi Ring trial energization.'
  },
  {
    id: 'res-5',
    roleOrEquipment: 'Mobile SF6 Gas Purification & Dielectric Van',
    type: 'EQUIPMENT',
    location: 'Mariakani GIS Bay',
    plannedCount: 1,
    actualCount: 1,
    utilizationPercent: 100,
    status: 'OPTIMAL',
    bottleneckAlert: null
  },
  {
    id: 'res-6',
    roleOrEquipment: 'Environmental & Wayleave Arbitrators',
    type: 'HUMAN',
    location: 'Kwale & Kilifi County Liaison Office',
    plannedCount: 4,
    actualCount: 4,
    utilizationPercent: 98,
    status: 'OPTIMAL',
    bottleneckAlert: null
  }
];

export const PROGRESS_EVM_METRICS = {
  pv: 'KES 4.38B',
  ev: 'KES 3.82B',
  ac: 'KES 3.98B',
  scheduleVariance: '-KES 560M',
  costVariance: '-KES 160M',
  spi: 0.87,
  cpi: 0.96,
  tcpi: 1.08,
  physicalUnits: {
    totalFoundations: 412,
    foundationsCompleted: 348,
    totalTowers: 412,
    towersErected: 268,
    totalLineKm: 182,
    conductorStrungKm: 89,
    totalSubstationBays: 8,
    substationBaysCompleted: 5
  }
};

export const EVM_MONTHLY_TRENDS = [
  { month: 'Apr 2026', pv: 'KES 2.85B', ev: 'KES 2.72B', ac: 'KES 2.76B', spi: 0.95, cpi: 0.98 },
  { month: 'May 2026', pv: 'KES 3.20B', ev: 'KES 3.02B', ac: 'KES 3.09B', spi: 0.94, cpi: 0.97 },
  { month: 'Jun 2026', pv: 'KES 3.60B', ev: 'KES 3.32B', ac: 'KES 3.42B', spi: 0.92, cpi: 0.97 },
  { month: 'Jul 2026', pv: 'KES 3.95B', ev: 'KES 3.55B', ac: 'KES 3.68B', spi: 0.90, cpi: 0.96 },
  { month: 'Aug 2026', pv: 'KES 4.18B', ev: 'KES 3.70B', ac: 'KES 3.84B', spi: 0.88, cpi: 0.96 },
  { month: 'Sep 2026', pv: 'KES 4.38B', ev: 'KES 3.82B', ac: 'KES 3.98B', spi: 0.87, cpi: 0.96 }
];

export const CRITICAL_PATH_ACTIVITIES = [
  {
    id: 'cpm-1',
    code: '1.2.2',
    name: 'Likoni Creek Deep Piling & Foundation Works',
    durationDays: 110,
    earlyStart: '08 Jun 2025',
    earlyFinish: '04 Oct 2025',
    lateStart: '08 Jun 2025',
    lateFinish: '04 Oct 2025',
    totalFloat: 0,
    freeFloat: 0,
    isDriving: true,
    riskScore: 82,
    predecessor: 'Civil Works Towers 1-150',
    successor: 'Tower Steelwork Erection Section 2'
  },
  {
    id: 'cpm-2',
    code: '1.3.2',
    name: 'Tower Erection Section 2 (Towers 201-412)',
    durationDays: 120,
    earlyStart: '28 Oct 2025',
    earlyFinish: '10 Mar 2026',
    lateStart: '28 Oct 2025',
    lateFinish: '10 Mar 2026',
    totalFloat: 0,
    freeFloat: 0,
    isDriving: true,
    riskScore: 78,
    predecessor: 'Likoni Creek Deep Piling',
    successor: 'Conductor Stringing Section 2'
  },
  {
    id: 'cpm-3',
    code: '2.2.2',
    name: '400kV Transformer T-204 Shipping & Plinth Haulage',
    durationDays: 80,
    earlyStart: '15 Apr 2026',
    earlyFinish: '20 Sep 2026',
    lateStart: '15 Apr 2026',
    lateFinish: '20 Sep 2026',
    totalFloat: 0,
    freeFloat: 0,
    isDriving: true,
    riskScore: 92,
    predecessor: 'Pad Casting & Oil Basin',
    successor: 'Transformer Assembly & Degassing'
  },
  {
    id: 'cpm-4',
    code: '2.4.1',
    name: 'Substation Protection Relay Calibration & Secondary Injection',
    durationDays: 15,
    earlyStart: '15 Oct 2026',
    earlyFinish: '29 Oct 2026',
    lateStart: '15 Oct 2026',
    lateFinish: '29 Oct 2026',
    totalFloat: 0,
    freeFloat: 0,
    isDriving: true,
    riskScore: 68,
    predecessor: 'Transformer Assembly & Degassing',
    successor: 'High Voltage Dielectric Breakdown Test'
  },
  {
    id: 'cpm-5',
    code: '3.1.1',
    name: 'High Voltage Dielectric Breakdown & Line Soak Testing',
    durationDays: 7,
    earlyStart: '30 Oct 2026',
    earlyFinish: '06 Nov 2026',
    lateStart: '30 Oct 2026',
    lateFinish: '06 Nov 2026',
    totalFloat: 0,
    freeFloat: 0,
    isDriving: true,
    riskScore: 74,
    predecessor: 'Substation Protection Relay Calibration',
    successor: 'Commercial Energization & COD'
  },
  {
    id: 'cpm-6',
    code: '1.4.1',
    name: 'Conductor & OPGW Tension Stringing Section 1',
    durationDays: 85,
    earlyStart: '01 Aug 2026',
    earlyFinish: '25 Oct 2026',
    lateStart: '05 Aug 2026',
    lateFinish: '29 Oct 2026',
    totalFloat: 4,
    freeFloat: 2,
    isDriving: false,
    riskScore: 55,
    predecessor: 'Tower Steel Lattice Assembly',
    successor: 'Line Soak Testing'
  },
  {
    id: 'cpm-7',
    code: '2.2.1',
    name: 'Rabai Autotransformer T-204 Pad Casting & Oil Basin',
    durationDays: 45,
    earlyStart: '15 Feb 2026',
    earlyFinish: '01 Apr 2026',
    lateStart: '01 Mar 2026',
    lateFinish: '15 Apr 2026',
    totalFloat: 14,
    freeFloat: 8,
    isDriving: false,
    riskScore: 42,
    predecessor: 'Substation Site Clearing',
    successor: 'Transformer Delivery'
  }
];

