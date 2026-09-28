export interface EvidenceDrawerSummary {
  conclusion: string;
  confidence: number;
  evidenceCount: number;
  firstObserved: string;
  previousCondition: string;
  currentCondition: string;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  recommendedAction: string;
  humanStatus: 'AWAITING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface PanelDefinition {
  title: string;
  question: string;
  supportsAction: boolean;
}

export const PHASE0_UI_CONTRACTS: PanelDefinition[] = [
  { title: 'Executive Overview', question: 'What is wrong, where, and how urgent?', supportsAction: true },
  { title: 'Grid Operations Map', question: 'Which corridors and assets require immediate attention?', supportsAction: true },
  { title: 'Inspection Mission Control', question: 'What is the current media processing and mission status?', supportsAction: true },
  { title: 'Defect Intelligence', question: 'Which defects are active, worsening, and actionable?', supportsAction: true },
  { title: 'Engineering Workbench', question: 'What evidence, history, and recommendation support the decision?', supportsAction: true }
];
