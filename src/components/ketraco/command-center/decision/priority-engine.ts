// GridPriorityEngine - KETRACO Phase 06 Operational Attention Ranking Engine

import { GridAsset, TransmissionLine, GridAlarm, GridEvent } from '../types';
import { PriorityItem, PriorityLevel, PriorityCategory, PriorityScoreBreakdown } from './types';

export class GridPriorityEngine {
  /**
   * Generates a ranked operational work queue of items requiring operator attention
   */
  public static computePriorityQueue(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[],
    events: GridEvent[]
  ): PriorityItem[] {
    const rawItems: PriorityItem[] = [];

    // 1. Critical Line Overload / Thermal Risk (Corridor / Incident)
    const suswaIsinya = lines['tl_ssw_isy'] || Object.values(lines)[0];
    if (suswaIsinya && suswaIsinya.loadingPct > 75) {
      const impact = 94;
      const urgency = 92;
      const probability = 88;
      const criticality = 95;
      const confidence = 96;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_CORR_SUSWA_OVERLOAD',
        code: 'ACT-P0-CORR-01',
        title: 'Suswa – Isinya 400kV Thermal Corridor Overload',
        category: 'CORRIDOR',
        priority: 'P0',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'corridor_loading_suswa_isinya',
        groupedEventCount: 4,
        affectedAssetIds: ['suswa', 'isinya', 'tl_ssw_isy'],
        affectedAssetNames: ['Suswa 400kV Substation', 'Isinya 400kV Substation', 'Suswa–Isinya 400kV Circuit 1'],
        affectedCorridorIds: ['tl_ssw_isy'],
        rootCauseHypothesis: 'High bulk power transfer from Olkaria Geothermal + Moyale HVDC import simultaneously feeding Nairobi ring during ambient peak temperature (32°C).',
        recommendedInvestigation: 'Verify dynamic line rating sensor telemetry, inspect conductor sag at Span #142, and check Isinya busbar voltage profile.',
        recommendedAction: 'Shift 120 MW generation from Olkaria I AU to Seven Forks Hydro and arm Nairobi North interlock.',
        evidenceSummary: [
          'SCADA active power flow: 940 MW on 1000 MVA nominal rating (94% loading)',
          'WAMS PMU phase angle divergence: 18.4° (threshold: 22.0°)',
          'Ambient temperature along corridor: 32.4°C with light wind (1.1 m/s)'
        ],
        dataSources: ['SCADA_EMS', 'WAMS_PMU', 'WEATHER_MET'],
        status: 'OPEN',
        timeDetected: new Date(Date.now() - 6 * 60000).toISOString(),
        assignedOperator: 'Shift Engineer (NCC-01)',
        scenarioSimulationId: 'SCEN_SUSWA_T1_TRIP'
      });
    }

    // 2. Transformer Thermal Escalation & DGA Warning (Asset)
    const suswaAsset = substations['suswa'];
    if (suswaAsset) {
      const impact = 88;
      const urgency = 85;
      const probability = 82;
      const criticality = 96;
      const confidence = 91;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_ASSET_SUSWA_T2_DGA',
        code: 'ACT-P1-ASSET-02',
        title: 'Suswa 400/220kV Auto-Transformer T2 Thermal Escalation',
        category: 'ASSET',
        priority: 'P1',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'asset_dga_suswa_t2',
        groupedEventCount: 3,
        affectedAssetIds: ['suswa'],
        affectedAssetNames: ['Suswa 400/220kV Substation (T2 Bay)'],
        rootCauseHypothesis: 'Localized core winding hotspot caused by continuous operation at 88% rated load combined with aged insulation oil.',
        recommendedInvestigation: 'Review online Hydran DGA dissolved gas chromatography rate-of-rise and verify oil cooling pump bank #2 operation.',
        recommendedAction: 'Transfer 80 MVA load to Auto-Transformer T1 and dispatch field inspection team from Naivasha regional depot.',
        evidenceSummary: [
          'DGA C2H4 (Ethylene) concentration: 185 ppm (Alert threshold: 150 ppm)',
          'Top oil temperature sensor: 74.2°C (baseline: 58.0°C)',
          'Winding hotspot calculated temperature: 98.6°C'
        ],
        dataSources: ['DGA_ONLINE', 'SCADA_EMS', 'EAM_SAP'],
        status: 'INVESTIGATING',
        timeDetected: new Date(Date.now() - 18 * 60000).toISOString(),
        assignedOperator: 'Substation Asset Specialist (Asset-04)',
        scenarioSimulationId: 'SCEN_SUSWA_T1_TRIP'
      });
    }

    // 3. Nairobi Ring Congestion & N-1 Contingency Violation (Contingency)
    const nairobiNorth = substations['nairobi_north'];
    if (nairobiNorth) {
      const impact = 82;
      const urgency = 78;
      const probability = 75;
      const criticality = 90;
      const confidence = 92;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_CONT_NAIROBI_N1_WATCH',
        code: 'ACT-P1-CONT-03',
        title: 'Nairobi 220kV Ring N-1 Contingency Vulnerability',
        category: 'CONTINGENCY',
        priority: 'P1',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'n1_nairobi_ring',
        groupedEventCount: 2,
        affectedAssetIds: ['nairobi_north', 'isinya', 'dandora'],
        affectedAssetNames: ['Nairobi North 220kV', 'Isinya 400/220kV', 'Dandora 132kV'],
        affectedCorridorIds: ['tl_ssw_nbn', 'tl_isy_emb'],
        rootCauseHypothesis: 'Loss of Suswa–Nairobi North 400kV line would trigger 108% overload on parallel Isinya–Embakasi 220kV line.',
        recommendedInvestigation: 'Run AC power flow contingency simulation and verify emergency thermal ratings on Embakasi transformers.',
        recommendedAction: 'Pre-arm Special Protection Scheme (SPS) and prepare 50 MW fast-start diesel peaker backup at Nairobi South.',
        evidenceSummary: [
          'What-If N-1 simulation post-contingency flow: 432 MW on 400 MVA line (108%)',
          'Nairobi urban demand forecast: Rising to 840 MW by 19:30 EAT peak',
          'Static bus voltage stability margin: 4.8% (threshold minimum: 5.0%)'
        ],
        dataSources: ['SIMULATION_ENGINE', 'SCADA_EMS', 'HISTORIAN'],
        status: 'OPEN',
        timeDetected: new Date(Date.now() - 32 * 60000).toISOString(),
        assignedOperator: 'Grid Stability Coordinator (NCC-02)',
        scenarioSimulationId: 'SCEN_ETHIOPIA_HVDC_BLOCK'
      });
    }

    // 4. Coast Corridor Lightning & Weather Exposure (Weather / Forecast)
    const mariakani = substations['mariakani'];
    if (mariakani) {
      const impact = 74;
      const urgency = 70;
      const probability = 85;
      const criticality = 80;
      const confidence = 89;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_MET_COAST_LIGHTNING',
        code: 'ACT-P2-MET-04',
        title: 'Severe Convective Lightning Front along Mariakani – Rabai Corridor',
        category: 'FORECAST',
        priority: 'P2',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'weather_lightning_coast',
        groupedEventCount: 5,
        affectedAssetIds: ['mariakani', 'rabai'],
        affectedAssetNames: ['Mariakani 400/220kV', 'Rabai 132kV', 'Mariakani–Rabai 400kV Line'],
        affectedCorridorIds: ['tl_mar_rab'],
        rootCauseHypothesis: 'Maritime tropical thunderstorm cell moving northwest across Coast transmission rights-of-way.',
        recommendedInvestigation: 'Monitor lightning strike counter on Mariakani surge arresters and confirm auto-reclose relay readiness.',
        recommendedAction: 'Block manual live-line maintenance along Coast corridor and verify Dongo Kundu power supply backup.',
        evidenceSummary: [
          'Kenya Met Doppler radar: 42 lightning strikes recorded within 5 km of transmission towers in past 30 min',
          'Auto-recloser protection health: Ready and armed on both circuit ends',
          'Rainfall rate: 38 mm/hr with gusting winds to 18 m/s'
        ],
        dataSources: ['WEATHER_MET', 'SCADA_EMS'],
        status: 'OPEN',
        timeDetected: new Date(Date.now() - 45 * 60000).toISOString(),
        assignedOperator: 'Coast Regional Controller (Coast-01)'
      });
    }

    // 5. Olkaria Geothermal Overdue SAP EAM Breaker Overhaul (Maintenance)
    const olkaria = substations['olkaria'];
    if (olkaria) {
      const impact = 68;
      const urgency = 65;
      const probability = 72;
      const criticality = 88;
      const confidence = 94;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_EAM_OLKARIA_BREAKER',
        code: 'ACT-P2-MAINT-05',
        title: 'Olkaria II 220kV Bus Coupler SF6 Breaker Overdue Maintenance',
        category: 'MAINTENANCE',
        priority: 'P2',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'maint_eam_olkaria_cb',
        groupedEventCount: 1,
        affectedAssetIds: ['olkaria'],
        affectedAssetNames: ['Olkaria II Geothermal Substation (Bay 04)'],
        rootCauseHypothesis: 'Circuit breaker has logged 2,420 operating cycles; SAP EAM preventive maintenance schedule is 38 days overdue.',
        recommendedInvestigation: 'Review SF6 gas pressure trend (currently 5.8 bar vs 6.2 bar nominal) and schedule planned outage window.',
        recommendedAction: 'Coordinate with KenGen dispatch to take Bay 04 out of service during upcoming low-demand weekend window.',
        evidenceSummary: [
          'SAP EAM Work Order #WO-884910 overdue since 2026-07-20',
          'Breaker trip coil operating time: 48 ms (standard limit: 40 ms)',
          'High operational criticality: evacuates 280 MW of baseload geothermal energy'
        ],
        dataSources: ['EAM_SAP', 'SCADA_EMS'],
        status: 'ACTION_PENDING',
        timeDetected: new Date(Date.now() - 120 * 60000).toISOString(),
        assignedOperator: 'Rift Valley Maintenance Planner (EAM-02)'
      });
    }

    // 6. Turkana PMU Loss of Communication Packet Rate (Data Quality)
    const loiyangalani = substations['loiyangalani'];
    if (loiyangalani) {
      const impact = 52;
      const urgency = 58;
      const probability = 60;
      const criticality = 75;
      const confidence = 98;
      const composite = Math.round(impact * 0.25 + urgency * 0.25 + probability * 0.2 + criticality * 0.2 + confidence * 0.1);

      rawItems.push({
        id: 'PRIO_DATA_TURKANA_PMU_JITTER',
        code: 'ACT-P3-DATA-06',
        title: 'Loiyangalani PMU WAMS Telemetry Packet Loss',
        category: 'DATA_QUALITY',
        priority: 'P3',
        scores: {
          impact,
          urgency,
          probability,
          criticality,
          confidence,
          compositeScore: composite
        },
        deduplicationKey: 'data_pmu_loiyangalani',
        groupedEventCount: 3,
        affectedAssetIds: ['loiyangalani'],
        affectedAssetNames: ['Loiyangalani 400kV Wind Collector Station'],
        rootCauseHypothesis: 'Fiber optic OPGW repeater degradation along Maralal desert section causing 14% PMU frame drop.',
        recommendedInvestigation: 'Verify OPGW OTDR optical attenuation and switch phasor data concentrator (PDC) stream to satellite backup.',
        recommendedAction: 'Instruct Telecommunications dispatch to test optical transceiver module at Mount Kulal repeater station.',
        evidenceSummary: [
          'PMU sample rate: Dropped from 50 fps to 38 fps (14.2% packet drop rate)',
          'OPGW optical power margin: -28 dBm (threshold: -24 dBm)',
          'SCADA backup polling active and healthy over IEC 60870-5-104 link'
        ],
        dataSources: ['WAMS_PMU', 'SCADA_EMS'],
        status: 'OPEN',
        timeDetected: new Date(Date.now() - 180 * 60000).toISOString(),
        assignedOperator: 'Telecom Operations Engineer (Tel-01)'
      });
    }

    // Sort items strictly by Priority (P0 -> P4) and Composite Score descending
    const priorityWeight: Record<PriorityLevel, number> = {
      P0: 500,
      P1: 400,
      P2: 300,
      P3: 200,
      P4: 100
    };

    return rawItems.sort((a, b) => {
      const scoreA = priorityWeight[a.priority] + a.scores.compositeScore;
      const scoreB = priorityWeight[b.priority] + b.scores.compositeScore;
      return scoreB - scoreA;
    });
  }
}
