// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — CAPABILITY RESOLVER
// Maps task requirements to model capabilities
// ============================================================================

import { DataClassification, DeploymentPreference } from './types';

export interface CapabilityRequirement {
  capability: string;
  minimumScore: number;  // 0-100
  mandatory: boolean;
}

export interface CapabilityProfile {
  id: string;
  name: string;
  description: string;
  requirements: CapabilityRequirement[];
  preferredDeployment: DeploymentPreference;
  maxClassification: DataClassification;
}

// Pre-defined capability profiles for KETRACO missions
export const CAPABILITY_PROFILES: Record<string, CapabilityProfile> = {
  PROCUREMENT_TENDER_EVALUATION: {
    id: 'PROCUREMENT_TENDER_EVALUATION',
    name: 'Tender Evaluation',
    description: 'Analyze and score procurement tenders against compliance criteria',
    requirements: [
      { capability: 'legal_reasoning', minimumScore: 70, mandatory: true },
      { capability: 'document_analysis', minimumScore: 80, mandatory: true },
      { capability: 'structured_output', minimumScore: 60, mandatory: false },
      { capability: 'numerical_reasoning', minimumScore: 70, mandatory: true },
    ],
    preferredDeployment: 'LOCAL_OR_PRIVATE',
    maxClassification: 'CONFIDENTIAL',
  },
  SUPPLIER_RISK_ANALYSIS: {
    id: 'SUPPLIER_RISK_ANALYSIS',
    name: 'Supplier Risk Analysis',
    description: 'Assess supplier reliability and geopolitical risk factors',
    requirements: [
      { capability: 'reasoning', minimumScore: 75, mandatory: true },
      { capability: 'data_analysis', minimumScore: 80, mandatory: true },
      { capability: 'multilingual', minimumScore: 50, mandatory: false },
    ],
    preferredDeployment: 'ANY',
    maxClassification: 'CONFIDENTIAL',
  },
  GRID_RESILIENCE_ANALYSIS: {
    id: 'GRID_RESILIENCE_ANALYSIS',
    name: 'Grid Resilience Analysis',
    description: 'Analyze power grid stability and resilience factors',
    requirements: [
      { capability: 'reasoning', minimumScore: 85, mandatory: true },
      { capability: 'numerical_reasoning', minimumScore: 90, mandatory: true },
      { capability: 'domain_expertise', minimumScore: 70, mandatory: true },
    ],
    preferredDeployment: 'LOCAL_OR_PRIVATE',
    maxClassification: 'KETRACO_CRITICAL',
  },
  CONTRACT_COMPLIANCE_CHECK: {
    id: 'CONTRACT_COMPLIANCE_CHECK',
    name: 'Contract Compliance',
    description: 'Verify contract terms against regulatory frameworks',
    requirements: [
      { capability: 'legal_reasoning', minimumScore: 80, mandatory: true },
      { capability: 'document_analysis', minimumScore: 85, mandatory: true },
      { capability: 'citation', minimumScore: 70, mandatory: true },
    ],
    preferredDeployment: 'LOCAL_OR_PRIVATE',
    maxClassification: 'RESTRICTED',
  },
  EXECUTIVE_BRIEF_GENERATION: {
    id: 'EXECUTIVE_BRIEF_GENERATION',
    name: 'Executive Brief',
    description: 'Generate executive summaries and briefings',
    requirements: [
      { capability: 'creative', minimumScore: 70, mandatory: false },
      { capability: 'summarization', minimumScore: 80, mandatory: true },
      { capability: 'reasoning', minimumScore: 60, mandatory: false },
    ],
    preferredDeployment: 'ANY',
    maxClassification: 'CONFIDENTIAL',
  },
  DOCUMENT_EXTRACTION: {
    id: 'DOCUMENT_EXTRACTION',
    name: 'Document Extraction',
    description: 'Extract structured data from documents',
    requirements: [
      { capability: 'structured_output', minimumScore: 85, mandatory: true },
      { capability: 'document_analysis', minimumScore: 80, mandatory: true },
    ],
    preferredDeployment: 'ANY',
    maxClassification: 'INTERNAL',
  },
  KNOWLEDGE_GRAPH_QUERY: {
    id: 'KNOWLEDGE_GRAPH_QUERY',
    name: 'Knowledge Graph Query',
    description: 'Query and reason over knowledge graph data',
    requirements: [
      { capability: 'reasoning', minimumScore: 80, mandatory: true },
      { capability: 'structured_output', minimumScore: 75, mandatory: true },
    ],
    preferredDeployment: 'LOCAL_OR_PRIVATE',
    maxClassification: 'CONFIDENTIAL',
  },
};

export class CapabilityResolver {
  private static instance: CapabilityResolver;

  private constructor() {}

  public static getInstance(): CapabilityResolver {
    if (!CapabilityResolver.instance) {
      CapabilityResolver.instance = new CapabilityResolver();
    }
    return CapabilityResolver.instance;
  }

  /**
   * Resolve capability requirements for a mission
   */
  resolve(missionId: string): CapabilityProfile | null {
    return CAPABILITY_PROFILES[missionId] || null;
  }

  /**
   * Check if a model meets capability requirements
   */
  meetsRequirements(
    modelCapabilities: Record<string, number>,
    requirements: CapabilityRequirement[]
  ): { meets: boolean; score: number; missing: string[] } {
    let totalScore = 0;
    let metCount = 0;
    const missing: string[] = [];

    for (const req of requirements) {
      const modelScore = modelCapabilities[req.capability] || 0;
      if (modelScore >= req.minimumScore) {
        totalScore += modelScore;
        metCount++;
      } else if (req.mandatory) {
        missing.push(`${req.capability} (required ${req.minimumScore}, got ${modelScore})`);
      } else {
        totalScore += modelScore * 0.5; // partial credit for optional
      }
    }

    const meets = missing.length === 0;
    const score = requirements.length > 0 ? (totalScore / requirements.length) : 0;

    return { meets, score, missing };
  }

  /**
   * Get all available capability profiles
   */
  getAllProfiles(): CapabilityProfile[] {
    return Object.values(CAPABILITY_PROFILES);
  }
}
