import { OntologyEngine } from '../ontology/OntologyEngine';
import { KnowledgeGraphEngine } from '../knowledge-graph/KnowledgeGraph';
import { EventFabricEngine } from '../event-fabric/EventFabric';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  outageTargetNodeId: string; // The specific transformer, route, or substation experiencing difficulty
  disruptionProbability: number; // 0 to 1
  impactSeverityScale: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SimulationResult {
  scenarioId: string;
  simulatedRuns: number;
  failureRateDetectedPercent: number;
  averageSupplyDelayDays: number;
  estimatedFinancialLossUsd: number;
  cascadeOutageNodes: string[];
}

export class SimulationGrid {
  private static instance: SimulationGrid;
  private scenarios = new Map<string, SimulationScenario>();

  private constructor() {
    this.seedScenarios();
  }

  public static getInstance(): SimulationGrid {
    if (!SimulationGrid.instance) {
      SimulationGrid.instance = new SimulationGrid();
    }
    return SimulationGrid.instance;
  }

  public registerScenario(scenario: SimulationScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  /**
   * Run Monte Carlo simulation modeling cascading risks along SCM links (Requirement 7)
   */
  public runSimulation(scenarioId: string, iterations: number = 250): SimulationResult {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Simulation scenario [${scenarioId}] missing in Grid registries.`);
    }

    // Capture ontological downstream nodes
    const graphData = KnowledgeGraphEngine.getInstance().getGraphData();
    const ontology = OntologyEngine.getInstance();
    
    // Perform DFS/BFS to compute cascading dependency lists starting at target
    const dependencySummary = ontology.performImpactAnalysis(scenario.outageTargetNodeId, 'Supplier');

    // Run Monte Carlo math model
    let failedTrials = 0;
    let totalDelayAccumulator = 0;
    
    // Deterministic parameters based on impacted assets
    const affectedContractsCount = dependencySummary.affectedContracts.length;
    let baseLossMultiplier = affectedContractsCount * 180000; // $180k delay penalty/disruption standard loss

    for (let run = 0; run < iterations; run++) {
      // Trigger random probabilities modeling stochastic conditions
      const roll = Math.random();
      
      if (roll <= scenario.disruptionProbability) {
        failedTrials++;
        // Calculate dynamic delays (e.g. log-normal or box-muller approximation skew)
        const delayInDays = Math.round(15 + Math.random() * 45); // between 15 and 60 days
        totalDelayAccumulator += delayInDays;
      }
    }

    const failureRate = (failedTrials / iterations) * 100;
    const averageDelay = failedTrials > 0 ? (totalDelayAccumulator / failedTrials) : 0;
    const estimatedLoss = failedTrials > 0 
      ? (failedTrials / iterations) * baseLossMultiplier * (scenario.impactSeverityScale === 'Critical' ? 2.5 : 1.2)
      : 0;

    const result: SimulationResult = {
      scenarioId,
      simulatedRuns: iterations,
      failureRateDetectedPercent: Number(failureRate.toFixed(2)),
      averageSupplyDelayDays: Number(averageDelay.toFixed(1)),
      estimatedFinancialLossUsd: Number(estimatedLoss.toFixed(2)),
      cascadeOutageNodes: dependencySummary.visitedIds
    };

    // Broadcast result out through Event Fabric (Requirement 7)
    EventFabricEngine.getInstance().publish(
      'RiskDetected',
      'SimulationGrid',
      'GLOBAL_TENANT',
      { scenarioId, message: 'Simulation metrics generated successfully.', result }
    );

    return result;
  }

  public getScenario(id: string): SimulationScenario | undefined {
    return this.scenarios.get(id);
  }

  public getAllScenarios(): SimulationScenario[] {
    return Array.from(this.scenarios.values());
  }

  private seedScenarios(): void {
    this.registerScenario({
      id: 'sim-shanghai-monsoon',
      name: 'South China Sea Logistics Disruption Scenario',
      description: 'Stochastic model evaluating supplier failures inside Shanghai due to ocean freight blockages.',
      outageTargetNodeId: 'shanghai-cable-corp',
      disruptionProbability: 0.82,
      impactSeverityScale: 'Critical'
    });

    this.registerScenario({
      id: 'sim-siemens-germany-inflation',
      name: 'Siemens Energy auxiliary spares shortage',
      description: 'Monte Carlo assessment factoring delayed delivery times from Munich depot hubs.',
      outageTargetNodeId: 'siemens-energy-ag',
      disruptionProbability: 0.24,
      impactSeverityScale: 'Medium'
    });
  }
}
