import { 
  ContingencyRankedItem, 
  ContingencyScenarioType, 
  ContingencySeverity,
  CascadingSimulation,
  CascadingStage
} from './types';
import { GridAsset, TransmissionLine } from '../types';
import { GridScenarioEngine } from './scenario-engine';

export class GridContingencyEngine {
  /**
   * Automatically evaluates and ranks all critical N-1 and compound contingencies
   * across the Kenyan national transmission grid.
   */
  public static rankContingencies(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): ContingencyRankedItem[] {
    const rawScenarios = GridScenarioEngine.STANDARD_SCENARIOS;

    const ranked: ContingencyRankedItem[] = rawScenarios.map(scen => {
      const outcome = GridScenarioEngine.simulateContingency(scen, substations, lines);

      // Quantitative Risk Ranking = Impact * Probability
      // Impact is composite of MW loss, frequency drop, line overloads, and unserved energy
      const impactScore = (scen.lossMW || 150) * 0.4 + 
        Math.abs(outcome.freqDeltaHz) * 200 + 
        outcome.overloadedLineCount * 120 + 
        outcome.unservedEnergyMW * 1.5;

      const riskScore = parseFloat((impactScore * (scen.probability * 15)).toFixed(1));

      // Determine recovery time in minutes based on contingency type and severity
      let restorationMins = 45;
      if (scen.type === 'TRANSFORMER_TRIP') restorationMins = 120;
      else if (scen.type === 'HVDC_LOSS') restorationMins = 90;
      else if (scen.type === 'BUSBAR_FAULT') restorationMins = 180;
      else if (scen.type === 'LINE_TRIP') restorationMins = 35;
      else if (scen.type === 'MULTIPLE_CONTINGENCY') restorationMins = 240;

      const topRemediation = 
        scen.type === 'GENERATION_LOSS' || scen.type === 'HVDC_LOSS'
          ? 'Fast AGC Hydro Redispatch (+140 MW Gitaru/Kiambere)'
          : scen.type === 'TRANSFORMER_TRIP'
          ? 'Transfer 220kV load to Isinya T1 & Nairobi South'
          : scen.type === 'BUSBAR_FAULT'
          ? 'Busbar isolation & bypass switching via reserve bay'
          : 'Alternative 400kV corridor power reroute';

      return {
        rank: 0, // will be assigned after sorting
        id: scen.id,
        name: scen.name,
        type: scen.type,
        primaryAssetId: scen.primaryAssetId,
        primaryAssetName: scen.primaryAssetName,
        probability: scen.probability,
        severity: outcome.contingencySeverity,
        mwImpact: scen.lossMW || 150,
        frequencyDipHz: outcome.freqDeltaHz,
        minVoltagePU: outcome.minBusVoltagePU,
        overloadedCircuitsCount: outcome.overloadedLineCount,
        affectedSubstations: outcome.affectedSubstations,
        restorationTimeMinutes: restorationMins,
        confidence: 94.8,
        topRemediation,
        riskScore
      };
    });

    // Sort by riskScore descending
    ranked.sort((a, b) => b.riskScore - a.riskScore);

    // Assign sequential ranks 1..N
    return ranked.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  /**
   * Generates step-by-step Cascading Failure Simulation data
   * for Three.js / Canvas visualizer
   */
  public static generateCascadingSimulation(
    scenarioId: string,
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>
  ): CascadingSimulation {
    const defaultStages: CascadingStage[] = [
      {
        stageIndex: 0,
        timeOffsetSec: 0,
        title: 'Stage 0: Normal Pre-Fault Grid Baseline',
        description: 'System operating normally at 50.02 Hz. Suswa Central Hub carrying 780 MW total throughput.',
        trigger: 'System in steady state equilibrium',
        affectedAsset: 'Suswa 400/220kV Substation',
        corridorImpact: 'All transmission lines operating under 78% thermal capacity.',
        gridImpact: 'Nominal voltages across all 400kV and 220kV regional buses.',
        frequencyHz: 50.02,
        voltagePU: 1.002,
        overloadedLines: [],
        trippedAssets: [],
        status: 'INITIATING'
      },
      {
        stageIndex: 1,
        timeOffsetSec: 0.12,
        title: 'Stage 1: Primary Contingency Event Trigger',
        description: 'Differential protection (87T) trips Suswa Auto-Transformer T1 (350 MVA) due to internal bushing flashover.',
        trigger: 'Transformer 87T Protection Trip',
        affectedAsset: 'Suswa T1 Transformer',
        corridorImpact: 'Immediate 240 MW power deficit transferred abruptly to parallel Suswa T2 and 220kV Ring.',
        gridImpact: 'Transient frequency dip to 49.78 Hz (-0.24 Hz). Transient voltage depression at Suswa 220kV bus.',
        frequencyHz: 49.78,
        voltagePU: 0.948,
        overloadedLines: ['line_suswa_isinya_400kv_1'],
        trippedAssets: ['suswa_t1'],
        status: 'PROPAGATING'
      },
      {
        stageIndex: 2,
        timeOffsetSec: 4.8,
        title: 'Stage 2: Secondary Thermal Overload Cascade',
        description: 'Suswa-Isinya 400kV circuit 2 loading surges to 118% (415 MVA). Olkaria-Nairobi 220kV line heats up to 109%.',
        trigger: 'Parallel Line Overcurrent / Thermal Overload',
        affectedAsset: 'Suswa-Isinya 400kV Corridor',
        corridorImpact: 'Extreme thermal sag on spans 42-58 over the Great Rift Escarpment.',
        gridImpact: 'Nairobi Ring bus voltages drop to 0.912 p.u. (198 kV on 220kV base). Reactive power deficit expands.',
        frequencyHz: 49.62,
        voltagePU: 0.912,
        overloadedLines: ['line_suswa_isinya_400kv_1', 'line_olkaria_nairobi_220kv_1', 'line_nairobi_ring_220kv'],
        trippedAssets: ['suswa_t1'],
        status: 'CRITICAL_CASCADE'
      },
      {
        stageIndex: 3,
        timeOffsetSec: 18.5,
        title: 'Stage 3: Automated Defense & Under-Frequency Load Shedding (UFLS)',
        description: 'Special Protection Scheme (SPS) arms. Stage 1 UFLS sheds 120 MW non-critical feeder load in Nairobi South and Dandora.',
        trigger: 'UFLS Stage 1 Relay Trigger (df/dt < -0.15 Hz/s, f < 49.50 Hz)',
        affectedAsset: 'Nairobi South & Dandora 132kV Distribution Feeders',
        corridorImpact: 'Load shedding relieves 400kV backbone loading from 118% down to 88%.',
        gridImpact: 'Frequency arrest at 49.52 Hz. Bus voltages recover to 0.965 p.u. Islanding prevented.',
        frequencyHz: 49.52,
        voltagePU: 0.965,
        overloadedLines: ['line_suswa_isinya_400kv_1'],
        trippedAssets: ['suswa_t1', 'feeder_nairobi_south_132kv_1'],
        status: 'ISLANDING_DEFENSE'
      },
      {
        stageIndex: 4,
        timeOffsetSec: 45.0,
        title: 'Stage 4: Governor Redispatch & Island Stabilization',
        description: 'Seven Forks Hydro units (Gitaru + Kiambere) ramp +140 MW on AGC. Grid reaches new stable equilibrium.',
        trigger: 'Secondary AGC Frequency Restoration Control',
        affectedAsset: 'Gitaru & Kiambere Hydro Power Stations',
        corridorImpact: 'All transmission lines stabilized within Continuous Operating Thermal Limits (COTL).',
        gridImpact: 'Frequency restored to 49.98 Hz. Voltage restored to 0.985 p.u. Zero cascading collapse.',
        frequencyHz: 49.98,
        voltagePU: 0.985,
        overloadedLines: [],
        trippedAssets: ['suswa_t1'],
        status: 'STABILIZED'
      }
    ];

    return {
      scenarioId: scenarioId || 'SCEN_SUSWA_T1_TRIP',
      title: 'Cascading Propagation Analysis: Suswa T1 Transformer Trip',
      rootAsset: 'Suswa 400/220kV Substation',
      stages: defaultStages,
      totalStages: defaultStages.length,
      mitigationAvailable: true,
      recommendedInterventionStage: 2
    };
  }
}
