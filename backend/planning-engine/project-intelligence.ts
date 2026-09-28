import type { PlanningEvidence, Project, ProjectPortfolioEntry } from './types';

export class ProjectIntelligenceEngine {
  private static instance: ProjectIntelligenceEngine | null = null;

  public static getInstance(): ProjectIntelligenceEngine {
    if (!ProjectIntelligenceEngine.instance) {
      ProjectIntelligenceEngine.instance = new ProjectIntelligenceEngine();
    }
    return ProjectIntelligenceEngine.instance;
  }

  public getBaselineProjects(): Project[] {
    const now = new Date();
    const days = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

    return [
      {
        id: 'PRJ-201', name: 'Nairobi Loop Reinforcement', type: 'TRANSMISSION_LINE',
        status: 'CONSTRUCTION', region: 'NAIROBI',
        affectedAssets: ['nairobi_north', 'tl_nai_loop_1', 'embakasi_220'],
        plannedStart: days(-90), plannedEnd: days(180),
        capacityGainMw: 420, congestionReductionPct: 22, reliabilityGainPct: 18,
        n1ImprovementPct: 15, riskReductionPct: 20, criticality: 88,
        evidence: [{ source: 'Project management office', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['construction progress', 'engineering design'], assumptions: ['On schedule per current milestone tracking'], confidence: 0.9, dataState: 'COMMITTED' }],
      },
      {
        id: 'PRJ-214', name: 'Western Corridor HVDC Support', type: 'HVDC',
        status: 'PROCUREMENT', region: 'WESTERN',
        affectedAssets: ['lessos', 'kisumu_220', 'tl_lessos_kisumu'],
        plannedStart: days(30), plannedEnd: days(365),
        capacityGainMw: 660, congestionReductionPct: 28, reliabilityGainPct: 22,
        n1ImprovementPct: 20, riskReductionPct: 18, criticality: 92,
        evidence: [{ source: 'Procurement office', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['tender evaluation', 'procurement timeline'], assumptions: ['Tender awarded, mobilisation within 30 days'], confidence: 0.85, dataState: 'COMMITTED' }],
      },
      {
        id: 'PRJ-230', name: 'Coastal Grid Expansion', type: 'SUBSTATION_EXPANSION',
        status: 'PLANNED', region: 'COASTAL',
        affectedAssets: ['mariakani', 'rabai_220'],
        plannedStart: days(120), plannedEnd: days(480),
        capacityGainMw: 310, congestionReductionPct: 16, reliabilityGainPct: 14,
        n1ImprovementPct: 12, riskReductionPct: 14, criticality: 72,
        evidence: [{ source: 'Planning department', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['feasibility study', 'environmental assessment'], assumptions: ['Pending environmental approval'], confidence: 0.78, dataState: 'PLANNED' }],
      },
      {
        id: 'PRJ-245', name: 'Suswa 500kV Transformer Replacement', type: 'TRANSFORMER',
        status: 'CONSTRUCTION', region: 'RIFT_VALLEY',
        affectedAssets: ['suswa', 'suswa_tx_t4'],
        plannedStart: days(-60), plannedEnd: days(90),
        capacityGainMw: 180, congestionReductionPct: 8, reliabilityGainPct: 12,
        n1ImprovementPct: 10, riskReductionPct: 24, criticality: 82,
        evidence: [{ source: 'Site progress report', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['delivery status', 'installation progress'], assumptions: ['Transformer delivered, installation 60% complete'], confidence: 0.92, dataState: 'COMMITTED' }],
      },
      {
        id: 'PRJ-260', name: 'Loiyangalani–Marsabit 132kV Line', type: 'TRANSMISSION_LINE',
        status: 'PLANNED', region: 'NORTH_EASTERN',
        affectedAssets: ['loiyangalani_400', 'marsabit_132'],
        plannedStart: days(180), plannedEnd: days(540),
        capacityGainMw: 120, congestionReductionPct: 10, reliabilityGainPct: 8,
        n1ImprovementPct: 6, riskReductionPct: 10, criticality: 58,
        evidence: [{ source: 'Planning department', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['route survey', 'land acquisition'], assumptions: ['Land acquisition in progress'], confidence: 0.72, dataState: 'PLANNED' }],
      },
      {
        id: 'PRJ-275', name: 'Kajiado 220kV New Substation', type: 'SUBSTATION_EXPANSION',
        status: 'PROCUREMENT', region: 'RIFT_VALLEY',
        affectedAssets: ['kajiado_220'],
        plannedStart: days(60), plannedEnd: days(300),
        capacityGainMw: 240, congestionReductionPct: 14, reliabilityGainPct: 10,
        n1ImprovementPct: 8, riskReductionPct: 12, criticality: 66,
        evidence: [{ source: 'Procurement office', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['EPC tender package', 'prequalification results'], assumptions: ['Contractor selection in progress'], confidence: 0.82, dataState: 'COMMITTED' }],
      },
    ];
  }

  public trackProject(project: Partial<Project>): Project {
    return {
      id: project.id ?? 'project-unknown',
      name: project.name ?? 'Unnamed project',
      type: project.type ?? 'TRANSMISSION_LINE',
      status: project.status ?? 'PLANNED',
      region: project.region ?? 'National',
      affectedAssets: project.affectedAssets ?? ['asset-unknown'],
      plannedStart: project.plannedStart ?? new Date().toISOString(),
      plannedEnd: project.plannedEnd ?? new Date(Date.now() + 86400000 * 180).toISOString(),
      capacityGainMw: project.capacityGainMw ?? 0,
      congestionReductionPct: project.congestionReductionPct ?? 0,
      reliabilityGainPct: project.reliabilityGainPct ?? 0,
      n1ImprovementPct: project.n1ImprovementPct ?? 0,
      riskReductionPct: project.riskReductionPct ?? 0,
      criticality: project.criticality ?? 50,
      evidence: project.evidence ?? [{
        source: 'Project portfolio registry',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['project approvals', 'delivery schedule', 'network impact review'],
        assumptions: ['No scope change beyond approved design'],
        confidence: 0.82,
        dataState: 'PLANNED',
      }],
    };
  }

  public computeProjectImpact(project: Project): {
    before: { capacity: number; congestion: number; redundancy: number; n1: number; losses: number; resilience: number; risk: number; };
    after: { capacity: number; congestion: number; redundancy: number; n1: number; losses: number; resilience: number; risk: number; };
    evidence: PlanningEvidence[];
  } {
    const before = { capacity: 100, congestion: 72, redundancy: 54, n1: 58, losses: 7.2, resilience: 62, risk: 71 };
    const after = {
      capacity: Math.round(100 + project.capacityGainMw / 10),
      congestion: Math.max(0, Math.round(72 - project.congestionReductionPct)),
      redundancy: Math.min(100, Math.round(54 + project.n1ImprovementPct)),
      n1: Math.min(100, Math.round(58 + project.n1ImprovementPct)),
      losses: Math.max(0, Number((7.2 - project.n1ImprovementPct / 10).toFixed(1))),
      resilience: Math.min(100, Math.round(62 + project.reliabilityGainPct)),
      risk: Math.max(0, Math.round(71 - project.riskReductionPct)),
    };

    return { before, after, evidence: project.evidence };
  }

  public buildPortfolio(projects: Project[]): ProjectPortfolioEntry[] {
    return projects.map(project => {
      const statusMap: Record<Project['status'], ProjectPortfolioEntry['mapStatus']> = {
        OPERATIONAL: 'EXISTING', COMMISSIONING: 'UNDER_CONSTRUCTION',
        CONSTRUCTION: 'UNDER_CONSTRUCTION', PROCUREMENT: 'PLANNED',
        PLANNED: 'PROPOSED', DELAYED: 'PLANNED',
      };
      return {
        project,
        mapStatus: statusMap[project.status],
        gridImpact: this.computeProjectImpact(project),
        evidence: project.evidence,
      };
    });
  }
}

export const projectIntelligenceEngine = ProjectIntelligenceEngine.getInstance();
