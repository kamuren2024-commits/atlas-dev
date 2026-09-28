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
    this.seedSampleAIRecords();
  }

  public static getInstance(): AIGovernanceEngine {
    if (!AIGovernanceEngine.instance) {
      AIGovernanceEngine.instance = new AIGovernanceEngine();
    }
    return AIGovernanceEngine.instance;
  }

  private seedSampleAIRecords() {
    const records: AIAssistanceRecord[] = [
      {
        assistanceId: 'AI-REC-2026-001',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        criterionOrRequirementId: 'TECH-02',
        aiModel: 'Gemini-1.5-Pro-Procurement-Agent',
        provider: 'Google Vertex AI / Salience Sovereign Gateway',
        promptTaskVersion: 'eval-gis-specs-v3.2',
        timestamp: '2026-08-15T09:12:00Z',
        documentSourceIds: ['DOC-SHANGHAI-TEST-01'],
        extractedFacts: [
          { field: 'standard', value: 'IEC 62271-203', confidence: 0.99, sourcePage: 14, quoteSnippet: 'Tested in accordance with IEC 62271-203 edition 2.0' },
          { field: 'ratedVoltage', value: '145kV (exceeds 132kV)', confidence: 0.98, sourcePage: 18, quoteSnippet: 'Rated maximum operating voltage: 145 kV' },
          { field: 'accreditation', value: 'CESI / KEMA', confidence: 0.95, sourcePage: 2, quoteSnippet: 'CESI Test Certificate No. CESI-2024-HV-092' }
        ],
        aiSuggestedOutcome: 'COMPLIANT',
        aiSuggestedScore: 39,
        aiConfidenceScore: 0.97,
        aiUncertaintyFlags: [],
        humanReviewStatus: 'ACCEPTED_BY_HUMAN',
        humanReviewerId: 'COMM-03',
        humanReviewerName: 'Eng. Patrick Ochieng',
        humanReviewerRole: 'TECHNICAL_MEMBER',
        humanReviewTimestamp: '2026-08-16T12:00:00Z',
        humanDecisionOutcome: 'COMPLIANT',
        humanDecisionScore: 37,
        humanOverrideDifference: 'AI suggested 39/40; Human evaluator scored 37/40.',
        humanOverrideRationale: 'Minor deduction applied because secondary spare parts schedule delivery lead time is 18 weeks vs desired 14 weeks.',
        auditTrailId: 'AUDIT-AI-GOV-001'
      },
      {
        assistanceId: 'AI-REC-2026-002',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        criterionOrRequirementId: 'MR-TAX',
        aiModel: 'KRA-Document-OCR-Agent-v2',
        provider: 'KRA Integration Hub',
        promptTaskVersion: 'tax-tcc-extract-v1.1',
        timestamp: '2026-08-15T10:04:00Z',
        documentSourceIds: ['DOC-ATHI-TCC-01'],
        extractedFacts: [
          { field: 'tccNumber', value: 'KRA0882190111', confidence: 0.96, sourcePage: 1 },
          { field: 'pin', value: 'P051992011A', confidence: 0.98, sourcePage: 1 },
          { field: 'validUntil', value: '2026-12-31', confidence: 0.97, sourcePage: 1 }
        ],
        aiSuggestedOutcome: 'PASS',
        aiConfidenceScore: 0.97,
        aiUncertaintyFlags: [],
        humanReviewStatus: 'ACCEPTED_BY_HUMAN',
        humanReviewerId: 'COMM-02',
        humanReviewerName: 'Sarah Mwangi, CPA-K',
        humanReviewerRole: 'FINANCIAL_MEMBER',
        humanReviewTimestamp: '2026-08-16T10:15:00Z',
        humanDecisionOutcome: 'PASS',
        auditTrailId: 'AUDIT-AI-GOV-002'
      }
    ];

    for (const r of records) {
      this.records.set(r.assistanceId, r);
    }
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
