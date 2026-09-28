// GridIncidentLifecycleManager - KETRACO Phase 06 Operational Incidents & Decision Support

import { 
  GridIncident, 
  IncidentLifecycleStage, 
  OperatorDecisionBrief, 
  DecisionLedgerEntry, 
  Asset360Profile, 
  Corridor360Profile, 
  MaintenanceRiskFusionItem,
  EventCausalityGraphData
} from './types';
import { GridAsset, TransmissionLine } from '../types';

export class GridIncidentLifecycleManager {
  private static incidents: GridIncident[] = [
    {
      id: 'INC-2026-08-SSW-01',
      code: 'INC-P0-SSW-01',
      title: 'Suswa 400kV Export Corridor Thermal Overload & Transformer T2 Hotspot',
      priority: 'P0',
      status: 'INVESTIGATING',
      trigger: 'Simultaneous 94% Line Loading on Suswa–Isinya 400kV and Ethylene Dissolved Gas Alert on Auto-Transformer T2.',
      timeDetected: new Date(Date.now() - 22 * 60000).toISOString(),
      lastUpdated: new Date().toISOString(),
      affectedAssets: ['suswa', 'isinya', 'tl_ssw_isy'],
      affectedCorridors: ['tl_ssw_isy', 'tl_ssw_nbn'],
      rootCause: 'Concentrated dispatch from Olkaria geothermal generating units and Moyale HVDC import during regional high ambient temperatures (32.4°C) without sufficient local reactive compensation.',
      impactAssessment: {
        mwAtRisk: 520,
        customersAffectedEst: 640000,
        voltageStabilityLossPct: 14.8,
        thermalExceedancePct: 8.2,
        economicLossEstUSDPerHr: 145000
      },
      riskScore: 89,
      predictions: {
        nextLikelyEvent: 'Conductor thermal sag over-clearance violation at Span #142 within 18 minutes if flow is not redispatched.',
        timeToCascadeMin: 18,
        severityEscalationProbPct: 84
      },
      scenarios: [
        {
          id: 'SCEN_A_REDISPATCH',
          name: 'Redispatch 120 MW to Seven Forks Hydro',
          description: 'Reduce Olkaria generation by 120 MW and ramp Gitaru/Kiambere hydro to supply Nairobi from the East.',
          projectedOutcome: 'Relieves Suswa–Isinya flow to 76% loading; prevents conductor sag violation.',
          stabilityImpactMW: 120
        },
        {
          id: 'SCEN_B_NO_ACTION',
          name: 'Do Nothing (Baseline Continue)',
          description: 'Conductor core temperature escalates to 88°C; auto-trip on differential thermal relay within 25 min.',
          projectedOutcome: 'Triggers cascading overload of 114% on parallel 220kV circuits and load shedding in Nairobi West.',
          stabilityImpactMW: -450
        }
      ],
      recommendations: [
        {
          id: 'REC-01',
          action: 'Authorize 120 MW redispatch from Olkaria to Seven Forks Hydro & adjust Suswa reactor tap #4',
          impact: 'Eliminates overload, lowers transformer T2 hotspot to 68°C, preserves N-1 security.',
          risk: 'LOW',
          dispatchChangeMW: 120,
          switchingOperations: ['Close Bus Coupler BC-02 at Isinya', 'Step up shunt reactor SR-01 at Suswa'],
          confidence: 94.6
        },
        {
          id: 'REC-02',
          action: 'Transfer 80 MVA load from Auto-Transformer T2 to T1 at Suswa 400kV yard',
          impact: 'Immediately drops T2 ethylene generation rate and extends insulation life.',
          risk: 'LOW',
          confidence: 96.0
        }
      ],
      evidence: [
        {
          id: 'EV-01',
          type: 'TELEMETRY',
          description: 'Line active power flow telemetry',
          metric: 'Line Loading P (MW)',
          value: '940 MW (94.0%)',
          source: 'SCADA_EMS',
          confidence: 99.2
        },
        {
          id: 'EV-02',
          type: 'PMU_WAVEFORM',
          description: 'Synchrophasor voltage phase angle spread',
          metric: 'Phase Angle Delta',
          value: '18.4° divergence',
          source: 'WAMS_PMU',
          confidence: 99.8
        },
        {
          id: 'EV-03',
          type: 'WEATHER_CELL',
          description: 'Ambient temperature and wind sensor along corridor',
          metric: 'Ambient Temp / Wind Speed',
          value: '32.4°C / 1.1 m/s wind',
          source: 'WEATHER_MET',
          confidence: 95.0
        },
        {
          id: 'EV-04',
          type: 'EAM_LOG',
          description: 'Online DGA Hydran gas chromatography',
          metric: 'C2H4 Ethylene concentration',
          value: '185 ppm (Alert > 150)',
          source: 'DGA_ONLINE',
          confidence: 96.5
        }
      ],
      owner: 'National Control Centre Shift Superintendant (NCC-Lead)'
    },
    {
      id: 'INC-2026-08-MAR-02',
      code: 'INC-P1-MAR-02',
      title: 'Mariakani–Rabai 400kV Convective Storm Front & Lightning Strike Cluster',
      priority: 'P1',
      status: 'MITIGATION',
      trigger: 'Doppler radar detects severe convective cell with 42 cloud-to-ground lightning discharges in transmission corridor.',
      timeDetected: new Date(Date.now() - 48 * 60000).toISOString(),
      lastUpdated: new Date().toISOString(),
      affectedAssets: ['mariakani', 'rabai', 'tl_mar_rab'],
      affectedCorridors: ['tl_mar_rab'],
      rootCause: 'Seasonal coastal maritime squall line intersecting high-voltage overhead lines with salt-contaminated insulator strings.',
      impactAssessment: {
        mwAtRisk: 380,
        customersAffectedEst: 420000,
        voltageStabilityLossPct: 9.4,
        thermalExceedancePct: 0.0,
        economicLossEstUSDPerHr: 98000
      },
      riskScore: 78,
      predictions: {
        nextLikelyEvent: 'High probability (72%) of line trip within 20 minutes if lightning core passes directly over Tower #88.',
        timeToCascadeMin: 20,
        severityEscalationProbPct: 72
      },
      scenarios: [
        {
          id: 'SCEN_COAST_AUTO_RECLOSE',
          name: 'Arm Fast Auto-Reclose and Start Kipevu GT',
          description: 'Ensure auto-reclose cycle is armed and run Kipevu gas turbine at spinning reserve to protect Mombasa Island.',
          projectedOutcome: 'Immediate islanding protection if transmission line trips on transient surge.',
          stabilityImpactMW: 60
        }
      ],
      recommendations: [
        {
          id: 'REC-MAR-01',
          action: 'Arm Special Protection Scheme (SPS-COAST) and synchronize Kipevu GT Unit #2',
          impact: 'Guarantees zero customer interruption in Mombasa port and Dongo Kundu SEZ during storm passage.',
          risk: 'LOW',
          confidence: 92.0
        }
      ],
      evidence: [
        {
          id: 'EV-MAR-01',
          type: 'WEATHER_CELL',
          description: 'Doppler Radar Storm Core',
          metric: 'Reflectivity / Ground Flash Density',
          value: '48 dBZ / 42 strikes per 30m',
          source: 'WEATHER_MET',
          confidence: 96.0
        },
        {
          id: 'EV-MAR-02',
          type: 'ALARM_SEQUENCE',
          description: 'Distance Protection Relay Zone 1 Start',
          metric: 'Relay Carrier Health',
          value: 'Carrier Normal, 2 auto-reclosures logged',
          source: 'SCADA_EMS',
          confidence: 98.4
        }
      ],
      owner: 'Coast Regional Controller (Coast-Lead)'
    }
  ];

  private static decisionLedger: DecisionLedgerEntry[] = [
    {
      id: 'LEDGER-2026-08-01',
      briefId: 'BRIEF-P0-SSW-01',
      incidentId: 'INC-2026-08-SSW-01',
      incidentTitle: 'Suswa 400kV Export Corridor Thermal Overload',
      priority: 'P0',
      alertSummary: 'Suswa–Isinya 400kV thermal loading reached 94.0% with conductor temperature at 78.4°C.',
      evidenceSnapshot: [
        'SCADA active power flow: 940 MW (94.0%)',
        'Ambient temp: 32.4°C / wind: 1.1 m/s',
        'DGA Hydran C2H4: 185 ppm'
      ],
      aiRecommendation: 'Execute 120 MW redispatch from Olkaria to Seven Forks Hydro & adjust Suswa reactor tap #4',
      simulationSummary: 'AC Load Flow confirms loading drops to 76.2% without voltage violations.',
      operatorId: 'OP-NCC-8841',
      operatorName: 'Eng. David Kiprono (Principal Grid Controller)',
      operatorDecision: 'AUTHORIZED',
      operatorNotes: 'Authorized immediate 120 MW generation adjustment with KenGen NCC desk. Confirmed Seven Forks spinning reserve available.',
      timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
      executionStatus: 'EXECUTED_AUTOMATIC',
      verification: {
        verifiedAt: new Date(Date.now() - 4 * 60000).toISOString(),
        expectedOutcome: 'Suswa–Isinya loading drops below 78% within 10 minutes.',
        observedOutcome: 'Loading measured at 76.4% on SCADA; conductor temperature stabilized at 68.1°C.',
        outcomeStatus: 'VALIDATED_OPTIMAL',
        variancePct: 0.8,
        learningFeedbackLogged: true
      }
    },
    {
      id: 'LEDGER-2026-08-02',
      briefId: 'BRIEF-P1-MAR-02',
      incidentId: 'INC-2026-08-MAR-02',
      incidentTitle: 'Mariakani–Rabai Storm & Lightning Protection',
      priority: 'P1',
      alertSummary: 'Severe convective storm cell with 42 lightning strikes intersecting 400kV line.',
      evidenceSnapshot: [
        'Doppler radar reflectivity: 48 dBZ',
        'Lightning ground flash counter: 42 strikes in 30 min'
      ],
      aiRecommendation: 'Arm Special Protection Scheme (SPS-COAST) and synchronize Kipevu GT Unit #2',
      simulationSummary: 'Islanded load flow confirms Mombasa grid stability during possible line trip.',
      operatorId: 'OP-COAST-4412',
      operatorName: 'Eng. Amina Hassan (Coast Control Lead)',
      operatorDecision: 'AUTHORIZED',
      operatorNotes: 'SPS armed on Mariakani 400kV terminal; Kipevu GT2 synchronized to 30 MW base.',
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      executionStatus: 'MANUAL_DISPATCHED',
      verification: {
        verifiedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        expectedOutcome: 'Zero voltage dip on Mombasa 132kV busbars during thunderstorm passage.',
        observedOutcome: 'Bus voltage maintained at 132.8 kV (1.006 pu); no interruptions recorded.',
        outcomeStatus: 'VALIDATED_OPTIMAL',
        variancePct: 0.4,
        learningFeedbackLogged: true
      }
    }
  ];

  public static getIncidents(): GridIncident[] {
    return this.incidents;
  }

  public static getDecisionLedger(): DecisionLedgerEntry[] {
    return this.decisionLedger;
  }

  /**
   * Generates a comprehensive 9-Part Operator Decision Brief for an incident
   */
  public static generateDecisionBrief(incidentId: string): OperatorDecisionBrief {
    const inc = this.incidents.find(i => i.id === incidentId) || this.incidents[0];

    return {
      id: `BRIEF-${inc.code}`,
      incidentId: inc.id,
      incidentCode: inc.code,
      incidentTitle: inc.title,
      priority: inc.priority,
      generatedAt: new Date().toISOString(),
      confidence: 94.8,
      author: 'AI_COMMAND_INTELLIGENCE',
      whatHappened: `Active power flow across the Suswa–Isinya 400kV transmission interconnector has escalated to 940 MW (94.0% of nominal rating). Concurrently, online DGA chromatography on Suswa Auto-Transformer T2 has detected accelerated Ethylene (185 ppm) and Acetylene (12 ppm) generation under 32.4°C ambient weather with minimal cross-wind cooling.`,
      whyItMatters: `This corridor serves as the primary bulk energy artery supplying 60% of the Nairobi Metropolitan load center and evacuating baseload Olkaria geothermal power. An uncontrolled thermal trip would cause immediate 114% cascading overload on parallel 220kV lines and trigger automated Under-Frequency Load Shedding (UFLS) affecting 640,000 customers.`,
      whatIsAffected: {
        substations: ['Suswa 500/400kV EHV Hub', 'Isinya 400/220kV Substation', 'Nairobi North 220kV Hub'],
        lines: ['Suswa–Isinya 400kV Circuit 1', 'Suswa–Nairobi North 400kV Circuit 1'],
        generationMWAtRisk: 520,
        loadDemandMWAtRisk: 640
      },
      whatIsLikelyNext: {
        timelineMin: 18,
        consequence: 'Conductor thermal elongation will exceed statutory ground clearance (8.5m) at Span #142 over the Naivasha highway, risking flashover to ground or differential trip.',
        cascadeRiskPct: 84
      },
      options: [
        {
          id: 'OPT-1',
          title: 'Option 1: Guided Hydro Redispatch & Reactive Voltage Boost (Recommended)',
          description: 'Ramp down Olkaria generation by 120 MW; increase Gitaru / Kiambere Seven Forks hydro generation by 120 MW; step up Suswa shunt reactor tap.',
          tradeoffs: 'Marginal fuel cost differential ($850/hr), eliminates thermal overload within 6 minutes, retains 100% customer supply.',
          riskLevel: 'LOW',
          requiresAuthorization: true
        },
        {
          id: 'OPT-2',
          title: 'Option 2: Dynamic Line Rating (DLR) Reconfiguration Only',
          description: 'Rely on IEEE 738 dynamic line rating thresholds and wait for afternoon convective wind front.',
          tradeoffs: 'High risk if wind speed remains below 1.5 m/s; leaves transformer T2 in thermal hotspot state.',
          riskLevel: 'HIGH',
          requiresAuthorization: true
        },
        {
          id: 'OPT-3',
          title: 'Option 3: Selective Feeder Curtailment in Nairobi Industrial Area',
          description: 'Drop 80 MW of interruptible industrial load via SCADA remote tripping at Embakasi & Dandora.',
          tradeoffs: 'Severe economic impact ($68,000/hr in unserved industrial energy); high customer dissatisfaction.',
          riskLevel: 'MEDIUM',
          requiresAuthorization: true
        }
      ],
      simulatedOutcomes: [
        {
          optionId: 'OPT-1',
          frequencyDeltaHz: 0.01,
          maxLineLoadingPct: 76.2,
          voltageStabilityMarginPct: 18.5,
          unservedEnergyMWh: 0.0
        },
        {
          optionId: 'OPT-2',
          frequencyDeltaHz: 0.00,
          maxLineLoadingPct: 94.0,
          voltageStabilityMarginPct: 4.8,
          unservedEnergyMWh: 0.0
        },
        {
          optionId: 'OPT-3',
          frequencyDeltaHz: 0.03,
          maxLineLoadingPct: 81.0,
          voltageStabilityMarginPct: 16.0,
          unservedEnergyMWh: 80.0
        }
      ],
      recommendedInvestigation: 'Verify dynamic line rating sensor telemetry at Tower #142, review Hydran DGA trend on Suswa T2, and confirm Seven Forks AGC governor response status.',
      recommendedIntervention: 'Execute Option 1: Transmit 120 MW redispatch order to KenGen National Dispatcher and adjust Suswa Shunt Reactor SR-01 tap position.',
      confidenceExplanation: 'Score based on 4 converging real-time data sources (SCADA telemetry, WAMS synchrophasors, Doppler weather radar, and IEEE 738 thermal model) with >99% sensor data quality.',
      confidenceFactors: [
        { factor: 'SCADA Telemetry Quality', score: 99.2 },
        { factor: 'WAMS Synchrophasor Precision', score: 99.8 },
        { factor: 'AC Load Flow Simulation Fidelity', score: 96.0 },
        { factor: 'DGA Chromatography Consistency', score: 95.5 }
      ],
      evidenceCitations: [
        {
          source: 'SCADA_EMS',
          metric: 'Suswa–Isinya Line Flow',
          value: '940 MW (94.0% load)',
          timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
          relevance: 'Direct measurement of active power exceeding continuous thermal rating.'
        },
        {
          source: 'WAMS_PMU',
          metric: 'Phase Angle Spread',
          value: '18.4° divergence',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          relevance: 'Confirms high transmission stress between Rift Valley generators and Nairobi.'
        },
        {
          source: 'WEATHER_MET',
          metric: 'Ambient Temp & Wind',
          value: '32.4°C / 1.1 m/s wind',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          relevance: 'De-rates convective cooling capacity of conductor by 14.2%.'
        },
        {
          source: 'DGA_ONLINE',
          metric: 'C2H4 Ethylene Gas',
          value: '185 ppm (Limit: 150)',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          relevance: 'Confirms localized core winding thermal degradation inside Suswa T2.'
        }
      ]
    };
  }

  /**
   * Records an operator's authorization in the immutable Decision Ledger
   */
  public static recordOperatorAuthorization(
    brief: OperatorDecisionBrief,
    operatorId: string,
    operatorName: string,
    action: 'AUTHORIZED' | 'REJECTED' | 'MODIFIED' | 'HOLD_FOR_INVESTIGATION',
    notes: string
  ): DecisionLedgerEntry {
    const entry: DecisionLedgerEntry = {
      id: `LEDGER-${Date.now()}`,
      briefId: brief.id,
      incidentId: brief.incidentId,
      incidentTitle: brief.incidentTitle,
      priority: brief.priority,
      alertSummary: brief.whatHappened,
      evidenceSnapshot: brief.evidenceCitations.map(e => `${e.source}: ${e.metric} = ${e.value}`),
      aiRecommendation: brief.recommendedIntervention,
      simulationSummary: `Predicted line loading drop to 76.2% with 0 MWh unserved energy.`,
      operatorId,
      operatorName,
      operatorDecision: action,
      operatorNotes: notes,
      timestamp: new Date().toISOString(),
      executionStatus: action === 'AUTHORIZED' ? 'EXECUTED_AUTOMATIC' : 'MANUAL_DISPATCHED',
      verification: {
        expectedOutcome: 'Suswa–Isinya loading drops below 78% within 10 minutes.',
        outcomeStatus: 'PENDING',
        learningFeedbackLogged: false
      }
    };

    this.decisionLedger.unshift(entry);

    // Update incident status
    const inc = this.incidents.find(i => i.id === brief.incidentId);
    if (inc) {
      if (action === 'AUTHORIZED') {
        inc.status = 'MITIGATION';
        inc.lastUpdated = new Date().toISOString();
      } else if (action === 'REJECTED') {
        inc.status = 'INVESTIGATING';
      }
    }

    return entry;
  }

  /**
   * Generates complete Asset 360 profile for any asset
   */
  public static generateAsset360(asset: GridAsset): Asset360Profile {
    const safeAsset = (asset || {
      id: 'suswa',
      name: 'Suswa 400/220kV Hub',
      code: 'SSW-400',
      type: 'SUBSTATION',
      voltageLevelKV: 400,
      region: 'Rift Valley / Central',
      county: 'Narok'
    }) as unknown as GridAsset;
    const isSuswa = safeAsset.id === 'suswa';
    const isOlkaria = safeAsset.id === 'olkaria';

    return {
      identity: {
        id: safeAsset.id,
        name: safeAsset.name,
        code: safeAsset.code,
        type: safeAsset.type,
        voltageLevelKV: safeAsset.voltageLevelKV,
        region: safeAsset.region,
        county: safeAsset.county,
        commissionDate: isSuswa ? '2019-11-15' : isOlkaria ? '2014-06-20' : '2018-03-10',
        manufacturer: isSuswa ? 'Siemens Energy / TBEA' : 'ABB / Hitachi Energy',
        model: isSuswa ? 'EHV-500-GIS-Series-4' : 'EHV-220-AIS-Standard',
        criticalityTier: isSuswa ? 'CRITICAL_SPOF' : isOlkaria ? 'HIGH_HUB' : 'STANDARD_SUB'
      },
      location: {
        latitude: asset.latitude,
        longitude: asset.longitude,
        elevationM: asset.elevationM,
        terrainType: isSuswa ? 'Rift Valley Volcanic Escarpment' : 'Volcanic Geothermal Caldera',
        nearestTown: isSuswa ? 'Naivasha / Mai Mahiu (14 km)' : 'Naivasha (22 km)',
        accessRoadCondition: 'All-Weather Bitumen Access Road (Class B)'
      },
      telemetry: {
        activePowerMW: asset.telemetry.activePowerMW?.value || 1145,
        reactivePowerMVAR: asset.telemetry.reactivePowerMVAR?.value || 182,
        voltageKV: asset.telemetry.voltageKV?.value || 508.2,
        frequencyHz: asset.telemetry.frequencyHz?.value || 50.02,
        thermalLoadingPct: asset.telemetry.thermalLoadingPct?.value || 81.4,
        oilTempC: asset.telemetry.transformerOilTempC?.value || 68.5,
        windingTempC: (asset.telemetry.transformerOilTempC?.value || 68.5) + 18.2,
        sf6PressureBar: asset.telemetry.sf6PressureBar?.value || 6.2,
        powerFactor: asset.telemetry.powerFactor?.value || 0.98,
        dataFreshness: asset.telemetry.activePowerMW?.freshness || 'LIVE',
        lastTelemetrySec: 1
      },
      health: {
        overallHealthIndex: asset.healthScore,
        dgaIndex: isSuswa ? 64 : 92,
        breakwearPct: isSuswa ? 42 : 28,
        insulationResistanceMOhm: isSuswa ? 1450 : 2800,
        degradationRatePerYear: isSuswa ? 4.2 : 1.8,
        expectedRULMonths: isSuswa ? 78 : 164
      },
      risk: {
        failureRiskScore: asset.riskScore,
        impactScore: asset.criticalityScore * 10,
        n1Exposure: isSuswa ? true : false,
        contingencySeverityIndex: isSuswa ? 9.2 : 6.8,
        primaryThreat: isSuswa ? 'Thermal Hotspot on T2 & Overload on Isinya Corridor' : 'Lightning Exposure & Breaker Wear'
      },
      maintenance: {
        sapWorkOrderNumber: isSuswa ? 'SAP-WO-884910' : 'SAP-WO-882104',
        lastServiceDate: isSuswa ? '2025-10-12' : '2026-03-01',
        nextScheduledServiceDate: isSuswa ? '2026-08-04' : '2026-09-15',
        daysOverdue: isSuswa ? 24 : 0,
        serviceStatus: isSuswa ? 'OVERDUE' : 'CURRENT',
        openFaultNotificationsCount: isSuswa ? 3 : 1,
        meanTimeBetweenFailuresHrs: 18400
      },
      alarms: [
        {
          id: 'ALM-01',
          code: 'DGA-C2H4-HI',
          severity: isSuswa ? 'CRITICAL' : 'INFO',
          message: isSuswa ? 'Auto-Transformer T2 Ethylene gas concentration > 150 ppm' : 'Normal telemetry heartbeat',
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          acknowledged: false
        }
      ],
      topology: {
        connectedLines: asset.connectedLines || ['tl_ssw_olk', 'tl_ssw_isy', 'tl_ssw_nbn'],
        connectedSubstations: asset.connectedSubstations || ['olkaria', 'isinya', 'nairobi_north'],
        upstreamSources: asset.upstreamNodes || ['olkaria', 'loiyangalani', 'moyale_hvdc'],
        downstreamSinks: asset.downstreamNodes || ['nairobi_north', 'isinya', 'nairobi_ring'],
        alternativePaths: asset.alternativePaths || ['olkaria -> lessos -> kisumu', 'isinya -> mariakani -> rabai']
      },
      history: {
        tripsLast12Months: isSuswa ? 1 : 0,
        unplannedOutageHoursLastYear: isSuswa ? 4.5 : 0.0,
        peakHistoricalLoadMW: 1320,
        lastTripReason: isSuswa ? 'Zone 2 Distance Relay Trip during thunderstorm (2025-11-04)' : 'None'
      },
      forecast: {
        projectedLoading6hPct: isSuswa ? 86.4 : 64.0,
        projectedTemp6hC: isSuswa ? 78.0 : 54.0,
        failureRiskHorizon14Days: isSuswa ? 48.0 : 12.0
      },
      contingencies: [
        {
          scenario: 'Loss of Suswa–Isinya 400kV C1',
          voltageDropKV: 14.2,
          lineLoadingRedistributionPct: 114.0,
          cascadeRisk: 'HIGH'
        },
        {
          scenario: 'Loss of Auto-Transformer T1',
          voltageDropKV: 6.8,
          lineLoadingRedistributionPct: 98.0,
          cascadeRisk: 'MEDIUM'
        }
      ],
      model3D: {
        has3DTwin: true,
        switchyardType: isSuswa ? 'GIS' : 'AIS',
        bays: asset.baysCount || 16,
        transformers: asset.transformersCount || 4
      },
      provenance: {
        scadaId: asset.scadaId,
        gisId: asset.gisId,
        eamId: asset.eamId,
        pmuId: 'PMU-WAMS-SSW-400-01',
        dataReconciliationConfidence: asset.confidence
      }
    };
  }

  /**
   * Generates Corridor 360 profile for any line
   */
  public static generateCorridor360(line: TransmissionLine): Corridor360Profile {
    const safeLine = (line || {
      id: 'tl_ssw_isy',
      name: 'Suswa–Isinya 400kV Double Circuit',
      voltageLevelKV: 400,
      fromSubstationId: 'suswa',
      fromSubstationName: 'Suswa Hub',
      toSubstationId: 'isinya',
      toSubstationName: 'Isinya Substation',
      lengthKm: 102.5,
      conductorType: 'Quad Bundled ACSR Zebra 400mm²'
    }) as unknown as TransmissionLine;
    const isSuswaIsinya = safeLine.id === 'tl_ssw_isy';
    const isMariakani = safeLine.id === 'tl_mar_rab';

    return {
      id: safeLine.id,
      name: safeLine.name,
      voltageLevelKV: safeLine.voltageLevelKV,
      fromSubstationId: safeLine.fromSubstationId,
      fromSubstationName: safeLine.fromSubstationName,
      toSubstationId: safeLine.toSubstationId,
      toSubstationName: safeLine.toSubstationName,
      lengthKm: safeLine.lengthKm,
      conductorType: safeLine.conductorType,
      currentFlowMW: isSuswaIsinya ? 940 : 285,
      nominalRatingMVA: safeLine.thermalRatingMVA || 1000,
      dynamicLineRatingMVA: isSuswaIsinya ? 858 : (safeLine.thermalRatingMVA || 1000) + 45,
      thermalHeadroomMW: isSuswaIsinya ? 60 : 215,
      thermalHeadroomPct: isSuswaIsinya ? 6.0 : 43.0,
      loadingPct: isSuswaIsinya ? 94.0 : 57.0,
      congestionStatus: isSuswaIsinya ? 'CONGESTED' : isMariakani ? 'MONITOR' : 'NORMAL',
      weather: {
        ambientTempC: isSuswaIsinya ? 32.4 : isMariakani ? 31.0 : 26.0,
        windSpeedMS: isSuswaIsinya ? 1.1 : isMariakani ? 4.2 : 2.5,
        windAngleDeg: 45,
        solarRadiationWM2: 940,
        lightningStrikesNearby24h: isMariakani ? 42 : 4,
        dlrGainMW: isSuswaIsinya ? -142 : 45
      },
      outages: {
        circuit1Status: 'IN_SERVICE',
        circuit2Status: 'IN_SERVICE'
      },
      dependencies: {
        evacuatesGenerationMW: isSuswaIsinya ? 680 : 320,
        suppliesDemandHubs: isSuswaIsinya ? ['Nairobi Ring (Isinya, Embakasi, Nairobi North)', 'Machakos'] : ['Mombasa Island', 'Dongo Kundu SEZ'],
        criticalDownstreamCustomers: isSuswaIsinya ? 'JKIA International Airport, Standard Gauge Railway (SGR), Konza Technopolis' : 'Mombasa Port & Marine Terminal'
      },
      nMinusOneStatus: {
        trippingSurvivesN1: isSuswaIsinya ? false : true,
        contingencyOverloadCorridor: isSuswaIsinya ? 'Isinya–Embakasi 220kV Line' : 'None',
        postTripLoadingPct: isSuswaIsinya ? 114.0 : 72.0
      },
      risk: {
        bushfireRisk: isSuswaIsinya ? 'MEDIUM' : 'LOW',
        vegetationEncroachmentRisk: 'LOW',
        insulatorContaminationRisk: isMariakani ? 'HIGH' : 'LOW',
        overallCorridorRiskScore: isSuswaIsinya ? 88 : isMariakani ? 74 : 32
      },
      forecast: {
        peakFlowPredictedNext6hMW: isSuswaIsinya ? 980 : 310,
        peakLoadingPredictedPct: isSuswaIsinya ? 98.0 : 62.0,
        congestionRiskProbabilityPct: isSuswaIsinya ? 89.0 : 24.0
      },
      alternativePaths: [
        {
          pathName: 'Suswa -> Nairobi North 400kV -> Dandora 132kV',
          availableCapacityMW: 180,
          transferImpedancePU: 0.042
        },
        {
          pathName: 'Olkaria -> Lessos 220kV -> Kisumu',
          availableCapacityMW: 120,
          transferImpedancePU: 0.068
        }
      ]
    };
  }

  /**
   * Generates SAP EAM Maintenance x Operations Risk Fusion items
   */
  public static getMaintenanceOperationsRiskList(): MaintenanceRiskFusionItem[] {
    return [
      {
        assetId: 'suswa_t2',
        assetName: 'Suswa Auto-Transformer T2 (400/220kV)',
        assetType: 'AUTO_TRANSFORMER',
        voltageKV: 400,
        substationRegion: 'RIFT_VALLEY',
        criticalityScore: 10,
        operationalExposure: 94,
        failureProbabilityPct: 82,
        daysOverdue: 24,
        eamWorkOrder: 'SAP-WO-884910',
        maintenanceUrgency: 'IMMEDIATE',
        gridImpactIfFailed: 'Loss of 450 MVA transformation capacity at national hub; triggers 108% overload on sister transformer T1.',
        combinedPriorityScore: 95,
        recommendedAction: 'Shift 80 MVA load to T1 and dispatch vacuum oil degassing unit to Suswa yard.'
      },
      {
        assetId: 'olkaria_cb_04',
        assetName: 'Olkaria II 220kV Bus Coupler SF6 Breaker',
        assetType: 'CIRCUIT_BREAKER',
        voltageKV: 220,
        substationRegion: 'RIFT_VALLEY',
        criticalityScore: 9,
        operationalExposure: 88,
        failureProbabilityPct: 68,
        daysOverdue: 38,
        eamWorkOrder: 'SAP-WO-883201',
        maintenanceUrgency: 'HIGH',
        gridImpactIfFailed: 'Breaker failure-to-open would trip entire 220kV main bus, disconnecting 280 MW geothermal power.',
        combinedPriorityScore: 86,
        recommendedAction: 'Schedule 4-hour maintenance window during Sunday morning off-peak period.'
      },
      {
        assetId: 'mariakani_t1',
        assetName: 'Mariakani 400/220kV Inter-Bus Transformer T1',
        assetType: 'TRANSFORMER',
        voltageKV: 400,
        substationRegion: 'COAST',
        criticalityScore: 8,
        operationalExposure: 72,
        failureProbabilityPct: 54,
        daysOverdue: 12,
        eamWorkOrder: 'SAP-WO-881900',
        maintenanceUrgency: 'PLANNED',
        gridImpactIfFailed: 'De-rates Mombasa transmission import capability by 200 MW.',
        combinedPriorityScore: 74,
        recommendedAction: 'Complete scheduled bushing cleaning and infrared thermography scan.'
      },
      {
        assetId: 'lessos_sw_12',
        assetName: 'Lessos 132kV Feeder Disconnector SW-12',
        assetType: 'DISCONNECTOR',
        voltageKV: 132,
        substationRegion: 'WESTERN',
        criticalityScore: 7,
        operationalExposure: 65,
        failureProbabilityPct: 48,
        daysOverdue: 5,
        eamWorkOrder: 'SAP-WO-880451',
        maintenanceUrgency: 'ROUTINE',
        gridImpactIfFailed: 'Localized outage on Eldoret industrial feeder (18 MW).',
        combinedPriorityScore: 61,
        recommendedAction: 'Lubricate mechanical operating linkage during next scheduled switching cycle.'
      }
    ];
  }

  /**
   * Generates Causality Graph for visual traversal
   */
  public static generateCausalityGraph(incidentId: string): EventCausalityGraphData {
    return {
      incidentId,
      rootNodeId: 'node_event_01',
      nodes: [
        {
          id: 'node_event_01',
          type: 'EVENT',
          label: 'Thermal Exceedance & DGA Alarm',
          subtitle: 'Detected on Suswa Hub',
          status: 'CRITICAL',
          value: '940 MW / 185 ppm C2H4',
          source: 'SCADA_EMS',
          confidence: 99.2
        },
        {
          id: 'node_asset_01',
          type: 'ASSET',
          label: 'Suswa 400/220kV Auto-Transformer T2',
          subtitle: 'Asset Health: 64/100',
          status: 'CRITICAL',
          value: 'Oil: 74.2°C (Winding: 98.6°C)',
          source: 'DGA_ONLINE',
          confidence: 96.0
        },
        {
          id: 'node_corridor_01',
          type: 'CORRIDOR',
          label: 'Suswa–Isinya 400kV Transmission Corridor',
          subtitle: 'Length: 102 km (Rating: 1000 MVA)',
          status: 'WARNING',
          value: 'Loading: 94.0% (DLR: 858 MW)',
          source: 'SCADA_EMS',
          confidence: 98.0
        },
        {
          id: 'node_dependency_01',
          type: 'DEPENDENCY',
          label: 'Olkaria Geothermal + Moyale HVDC Bulk Feed',
          subtitle: 'Baseload Evacuation Artery',
          status: 'WARNING',
          value: '1,145 MW total injected',
          source: 'SCADA_EMS',
          confidence: 99.5
        },
        {
          id: 'node_impact_01',
          type: 'IMPACT',
          label: 'Conductor Thermal Sag & Nairobi Urban Grid Risk',
          subtitle: '640,000 customers in Nairobi Ring',
          status: 'CRITICAL',
          value: '520 MW at immediate risk',
          source: 'SIMULATION_ENGINE',
          confidence: 94.0
        },
        {
          id: 'node_risk_01',
          type: 'RISK',
          label: 'Cascading N-1 Trip on Parallel 220kV Lines',
          subtitle: 'Isinya–Embakasi overload to 114%',
          status: 'CRITICAL',
          value: 'Probability: 84% in 18 min',
          source: 'SIMULATION_ENGINE',
          confidence: 92.5
        },
        {
          id: 'node_rec_01',
          type: 'RECOMMENDATION',
          label: '120 MW Redispatch to Seven Forks Hydro',
          subtitle: 'Guided Remedial Action Plan',
          status: 'INFO',
          value: 'Relieves loading to 76.2%',
          source: 'SIMULATION_ENGINE',
          confidence: 96.8
        }
      ],
      edges: [
        {
          id: 'e1',
          source: 'node_event_01',
          target: 'node_asset_01',
          relation: 'LOCATED_AT',
          label: 'Originates At',
          confidence: 99,
          strength: 'HIGH'
        },
        {
          id: 'e2',
          source: 'node_asset_01',
          target: 'node_corridor_01',
          relation: 'CONNECTS_TO',
          label: 'Feeds Into',
          confidence: 98,
          strength: 'HIGH'
        },
        {
          id: 'e3',
          source: 'node_dependency_01',
          target: 'node_corridor_01',
          relation: 'DEPENDS_ON',
          label: 'Heavy Inflow',
          confidence: 97,
          strength: 'HIGH'
        },
        {
          id: 'e4',
          source: 'node_corridor_01',
          target: 'node_impact_01',
          relation: 'CAUSES_IMPACT',
          label: 'Thermal Constraint',
          confidence: 95,
          strength: 'HIGH'
        },
        {
          id: 'e5',
          source: 'node_impact_01',
          target: 'node_risk_01',
          relation: 'ESCALATES_RISK',
          label: 'Triggers Cascade',
          confidence: 92,
          strength: 'HIGH'
        },
        {
          id: 'e6',
          source: 'node_risk_01',
          target: 'node_rec_01',
          relation: 'MITIGATED_BY',
          label: 'Resolved By',
          confidence: 96,
          strength: 'HIGH'
        }
      ]
    };
  }
}
