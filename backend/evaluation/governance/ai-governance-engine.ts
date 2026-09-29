/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: AI EVALUATION GOVERNANCE, EXPLAINABILITY & HUMAN OVERRIDE
 * 
 * Directives:
 * - Directive 3: Never let AI invent law (AI outputs labeled AI ANALYSIS)
 * - Directive 12: AI Evaluation Governance & Explainability (AI Assists. Authorized Humans Decide)
 * - Directive 13: Human Override (Authorized human can reject/modify; original AI preserved)
 */

export interface AIAssistanceRecord {
  assistanceId: string;
  tenderId: string;
  bidderId: string;
  criterionOrRequirementId: string;
  aiModel: string;
  provider: string;
  promptTaskVersion: string;
  timestamp: string;
  documentSourceIds: string[];
  extractedFacts: Array<{
    field: string;
    value: any;
    confidence: number;
    sourcePage?: number;
    quoteSnippet?: string;
  }>;
  aiSuggestedOutcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'PASS' | 'FAIL' | 'FLAG_FOR_REVIEW';
  aiSuggestedScore?: number;
  aiConfidenceScore: number;
  aiUncertaintyFlags: string[];
  humanReviewStatus: 'PENDING_HUMAN_REVIEW' | 'ACCEPTED_BY_HUMAN' | 'MODIFIED_BY_HUMAN' | 'REJECTED_BY_HUMAN';
  humanReviewerId?: string;
  humanReviewerName?: string;
  humanReviewerRole?: string;
  humanReviewTimestamp?: string;
  humanDecisionOutcome?: string;
  humanDecisionScore?: number;
  humanOverrideDifference?: string;
  humanOverrideRationale?: string;
  auditTrailId: string;
}

export class AIGovernanceEngine {
  private static instance: AIGovernanceEngine;
  private records: Map<string, AIAssistanceRecord> = new Map();

  private constructor() {
    // AI governance records are only created from authoritative evidence sources.
  }

  public static getInstance(): AIGovernanceEngine {
    if (!AIGovernanceEngine.instance) {
      AIGovernanceEngine.instance = new AIGovernanceEngine();
    }
    return AIGovernanceEngine.instance;
  }

  public getAllRecords(tenderId?: string): AIAssistanceRecord[] {
    const all = Array.from(this.records.values());
    if (tenderId) {
      return all.filter(r => r.tenderId === tenderId);
    }
    return all;
  }

  public getRecord(assistanceId: string): AIAssistanceRecord | undefined {
    return this.records.get(assistanceId);
  }

  /**
   * Submit an authorized human override of an AI evaluation (Directive 13)
   */
  public submitHumanOverride(
    assistanceId: string,
    override: {
      humanReviewerId: string;
      humanReviewerName: string;
      humanReviewerRole: string;
      decisionOutcome: string;
      decisionScore?: number;
      rationale: string;
    }
  ): AIAssistanceRecord {
    const record = this.records.get(assistanceId);
    if (!record) {
      throw new Error(`AI Assistance Record ${assistanceId} not found.`);
    }

    const isDifferent = record.aiSuggestedOutcome !== override.decisionOutcome || 
      (record.aiSuggestedScore !== undefined && record.aiSuggestedScore !== override.decisionScore);

    record.humanReviewStatus = isDifferent ? 'MODIFIED_BY_HUMAN' : 'ACCEPTED_BY_HUMAN';
    record.humanReviewerId = override.humanReviewerId;
    record.humanReviewerName = override.humanReviewerName;
    record.humanReviewerRole = override.humanReviewerRole;
    record.humanReviewTimestamp = new Date().toISOString();
    record.humanDecisionOutcome = override.decisionOutcome;
    record.humanDecisionScore = override.decisionScore;
    record.humanOverrideDifference = isDifferent 
      ? `AI suggested [${record.aiSuggestedOutcome}${record.aiSuggestedScore ? ` / ${record.aiSuggestedScore}pts` : ''}]; Human decided [${override.decisionOutcome}${override.decisionScore ? ` / ${override.decisionScore}pts` : ''}].`
      : 'Human evaluator affirmed AI analysis without modification.';
    record.humanOverrideRationale = override.rationale;

    return record;
  }
}
