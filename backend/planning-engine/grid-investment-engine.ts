import type { GridInvestmentCandidate, InvestmentRanking, PlanningEvidence, Project, PlanningHorizon } from './types';

export class GridInvestmentEngine {
  private static instance: GridInvestmentEngine | null = null;

  public static getInstance(): GridInvestmentEngine {
    if (!GridInvestmentEngine.instance) {
      GridInvestmentEngine.instance = new GridInvestmentEngine();
    }
    return GridInvestmentEngine.instance;
  }

  public evaluateCandidate(project: Project): GridInvestmentCandidate {
    const criticality = this.computeCriticality(project);
    const priorityScore = this.computePriorityScore(project, criticality);

    return {
      id: `inv-${project.id}`,
      name: project.name,
      projectType: project.type,
      region: project.region,
      capacityGainMw: project.capacityGainMw,
      congestionReductionPct: project.congestionReductionPct,
      reliabilityGainPct: project.reliabilityGainPct,
      n1ImprovementPct: project.n1ImprovementPct,
      lossReductionPct: project.n1ImprovementPct * 0.4,
      riskReductionPct: project.riskReductionPct,
      criticality,
      priorityScore,
      estimatedCostMw: this.estimateCost(project),
      implementationHorizon: this.mapStatusToHorizon(project.status),
      evidence: [{
        source: 'Grid investment intelligence engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['project portfolio', 'capacity model', 'risk assessment', 'congestion analysis'],
        assumptions: ['Cost estimates based on similar historical projects', 'No external regulatory delays assumed'],
        confidence: 0.82,
        dataState: 'PLANNED',
      }],
    };
  }

  public rankInvestments(projects: Project[]): InvestmentRanking {
    const candidates = projects.map(p => this.evaluateCandidate(p))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      candidates,
      totalCapacityGainMw: candidates.reduce((sum, c) => sum + c.capacityGainMw, 0),
      totalCongestionReductionPct: candidates.reduce((sum, c) => sum + c.congestionReductionPct, 0),
      totalReliabilityGainPct: candidates.reduce((sum, c) => sum + c.reliabilityGainPct, 0),
      totalN1ImprovementPct: candidates.reduce((sum, c) => sum + c.n1ImprovementPct, 0),
      evidence: [{
        source: 'Investment ranking engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['project impact assessments', 'risk profiles', 'capacity constraints'],
        assumptions: ['Priority based on weighted capacity, reliability, and risk reduction metrics'],
        confidence: 0.85,
        dataState: 'MODELLED',
      }],
    };
  }

  public estimateProject(project: Project) {
    return this.evaluateCandidate(project);
  }

  private computeCriticality(project: Project): number {
    let score = 50;
    if (project.type === 'HVDC') score += 20;
    else if (project.type === 'SUBSTATION_EXPANSION') score += 15;
    else if (project.type === 'TRANSMISSION_LINE') score += 12;
    score += Math.min(15, project.capacityGainMw / 50);
    score += project.riskReductionPct * 0.3;
    return Math.min(100, Math.round(score));
  }

  private computePriorityScore(project: Project, criticality: number): number {
    return Math.round(
      criticality * 0.3 +
      project.capacityGainMw * 0.015 +
      project.congestionReductionPct * 0.8 +
      project.n1ImprovementPct * 0.9 +
      project.reliabilityGainPct * 0.6 +
      project.riskReductionPct * 0.5
    );
  }

  private estimateCost(project: Project): number {
    const baseCost: Record<Project['type'], number> = {
      SUBSTATION_EXPANSION: 45,
      TRANSMISSION_LINE: 32,
      TRANSFORMER: 18,
      BAY: 8,
      COMPENSATION: 12,
      HVDC: 85,
    };
    return Math.round((baseCost[project.type] || 20) * (1 + project.capacityGainMw / 500));
  }

  private mapStatusToHorizon(status: Project['status']): PlanningHorizon {
    switch (status) {
      case 'OPERATIONAL': return 'NOW';
      case 'COMMISSIONING': return '24H';
      case 'CONSTRUCTION': return '7D';
      case 'PROCUREMENT': return '30D';
      case 'PLANNED': return '1Y';
      case 'DELAYED': return '5Y';
      default: return '1Y';
    }
  }
}

export const gridInvestmentEngine = GridInvestmentEngine.getInstance();
