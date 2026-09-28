/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: VERSIONED LEGAL RULE ENGINE
 * 
 * Capability:
 * Legal Source → Provision → Rule → Condition → Control → Required Evidence → Allowed/Blocked Action → Audit Requirement
 * 
 * Rules are:
 * - Versioned
 * - Effective-date aware
 * - Traceable
 * - Testable
 * - Reviewable
 * - Independently updateable
 * 
 * Principle: Never let AI invent law. AI outputs are labeled AI ANALYSIS, not LEGAL AUTHORITY.
 */

import { AUTHORITATIVE_LEGAL_SOURCES, AuthoritativeLegalSource } from './authoritative-sources';

export type RuleEvaluationOutcome = 'ALLOW' | 'BLOCK' | 'REQUIRES_HUMAN_REVIEW' | 'NOT_APPLICABLE';

export interface LegalRuleDefinition {
  ruleId: string;
  version: string;
  ruleName: string;
  legalSourceId: string;
  provisionRef: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  stage: 'INTAKE' | 'PRELIMINARY' | 'TECHNICAL' | 'FINANCIAL' | 'CONSENSUS' | 'APPROVAL' | 'AWARD';
  appliesWhen: (context: EvaluationActionContext) => boolean;
  requiresEvidence: string[];
  permitsAction: string[];
  blocksAction: string[];
  auditRequirement: string;
  evaluate: (context: EvaluationActionContext) => RuleEvaluationResult;
}

export interface EvaluationActionContext {
  tenderId: string;
  evaluationId: string;
  action: string;
  actorId: string;
  actorRole: string;
  targetBidderId?: string;
  criterionId?: string;
  submittedScore?: number;
  submittedComments?: string;
  evidenceProvided?: Array<{ id: string; type: string; hash?: string; valid?: boolean }>;
  isCriteriaLocked?: boolean;
  hasConflictOfInterest?: boolean;
  hasRecusedSelf?: boolean;
  currentWorkflowStage?: string;
  committeeQuorumCount?: number;
  committeeTotalCount?: number;
  dissentRecorded?: boolean;
  variancePercent?: number;
  aiAssistanceUsed?: boolean;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  outcome: RuleEvaluationOutcome;
  reason: string;
  missingConditions: string[];
  legalAuthority: {
    sourceId: string;
    sourceName: string;
    provision: string;
    citation: string;
    effectiveDate: string;
  };
  requiredRemediation?: string;
  auditFlag: boolean;
}

export class VersionedLegalRuleEngine {
  private static instance: VersionedLegalRuleEngine;
  private rules: Map<string, LegalRuleDefinition> = new Map();

  private constructor() {
    this.registerStandardRules();
  }

  public static getInstance(): VersionedLegalRuleEngine {
    if (!VersionedLegalRuleEngine.instance) {
      VersionedLegalRuleEngine.instance = new VersionedLegalRuleEngine();
    }
    return VersionedLegalRuleEngine.instance;
  }

  private registerStandardRules() {
    // 1. RULE: PPADA Section 80(2) — Locked Criteria (Prohibition of Unannounced Criteria)
    this.registerRule({
      ruleId: 'RULE-LOCKED-CRITERIA-PPADA-80',
      version: '1.0.0',
      ruleName: 'Prohibition of Unannounced Criteria & Locked Configuration',
      legalSourceId: 'PPADA-2015-SEC-80',
      provisionRef: 'PPADA 2015, Section 80(2)',
      effectiveFrom: '2016-01-07T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'TECHNICAL',
      appliesWhen: (ctx) => ctx.action === 'MODIFY_CRITERIA' || ctx.action === 'ALTER_WEIGHTS',
      requiresEvidence: ['FORMAL_ADDENDUM_DOCUMENT', 'APPROVAL_ACCOUNTING_OFFICER'],
      permitsAction: [],
      blocksAction: ['MODIFY_CRITERIA', 'ALTER_WEIGHTS', 'ADD_SUBCRITERIA_POST_OPENING'],
      auditRequirement: 'AUDIT_ATTEMPTED_CRITERIA_MODIFICATION_SEC80',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'PPADA-2015-SEC-80')!;
        if (ctx.isCriteriaLocked && (ctx.action === 'MODIFY_CRITERIA' || ctx.action === 'ALTER_WEIGHTS')) {
          return {
            ruleId: 'RULE-LOCKED-CRITERIA-PPADA-80',
            ruleName: 'Prohibition of Unannounced Criteria & Locked Configuration',
            outcome: 'BLOCK',
            reason: 'Criteria are legally locked post-tender opening. Under PPADA Section 80(2), no criterion or methodology shall be used during evaluation that was not specified in the tender documents.',
            missingConditions: ['Tender evaluation criteria is already locked. Changes post-opening without formal gazetted addendum are null and void.'],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'Criteria cannot be edited during active evaluation. If an error in tender documents occurred, refer to formal addendum protocol or retender.',
            auditFlag: true
          };
        }
        return {
          ruleId: 'RULE-LOCKED-CRITERIA-PPADA-80',
          ruleName: 'Prohibition of Unannounced Criteria & Locked Configuration',
          outcome: 'ALLOW',
          reason: 'Criteria are intact and not being altered post-lock.',
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: false
        };
      }
    });

    // 2. RULE: PPADA Section 66 — Conflict of Interest & Recusal Mandate
    this.registerRule({
      ruleId: 'RULE-CONFLICT-OF-INTEREST-PPADA-66',
      version: '1.0.0',
      ruleName: 'Mandatory Recusal on Conflict of Interest',
      legalSourceId: 'PPADA-2015-SEC-66',
      provisionRef: 'PPADA 2015, Section 66(1)-(4)',
      effectiveFrom: '2016-01-07T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'TECHNICAL',
      appliesWhen: (ctx) => Boolean(ctx.hasConflictOfInterest || ctx.hasRecusedSelf),
      requiresEvidence: ['SIGNED_CONFLICT_DECLARATION'],
      permitsAction: ['RECUSE_SELF', 'VIEW_PUBLIC_AUDIT'],
      blocksAction: ['SUBMIT_SCORE', 'CAST_VOTE', 'SIGN_REPORT', 'PARTICIPATE_DELIBERATION'],
      auditRequirement: 'AUDIT_CONFLICT_RESTRICTION_ENFORCEMENT',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'PPADA-2015-SEC-66')!;
        if (ctx.hasConflictOfInterest && !ctx.hasRecusedSelf) {
          return {
            ruleId: 'RULE-CONFLICT-OF-INTEREST-PPADA-66',
            ruleName: 'Mandatory Recusal on Conflict of Interest',
            outcome: 'BLOCK',
            reason: 'Evaluator has a declared or flagged conflict of interest under PPADA Section 66. Mandatory recusal has not been completed.',
            missingConditions: ['Official recusal resolution by Accounting Officer'],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'The conflicted evaluator must recuse themselves from all scoring and deliberation for this tender.',
            auditFlag: true
          };
        }
        if (ctx.hasRecusedSelf && ['SUBMIT_SCORE', 'CAST_VOTE', 'SIGN_REPORT'].includes(ctx.action)) {
          return {
            ruleId: 'RULE-CONFLICT-OF-INTEREST-PPADA-66',
            ruleName: 'Mandatory Recusal on Conflict of Interest',
            outcome: 'BLOCK',
            reason: 'Recused evaluator is strictly forbidden from scoring or signing under PPADA Section 66(2).',
            missingConditions: ['Recused evaluator cannot participate in scoring'],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'Reassign scoring duty to an alternate appointed committee member.',
            auditFlag: true
          };
        }
        return {
          ruleId: 'RULE-CONFLICT-OF-INTEREST-PPADA-66',
          ruleName: 'Mandatory Recusal on Conflict of Interest',
          outcome: 'ALLOW',
          reason: 'No disqualifying conflict of interest present.',
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: false
        };
      }
    });

    // 3. RULE: PPADR 2020 Regulation 74 — Mandatory Preliminary Responsiveness
    this.registerRule({
      ruleId: 'RULE-PRELIMINARY-CHECK-PPADR-74',
      version: '1.0.0',
      ruleName: 'Preliminary Statutory Documentation Verification',
      legalSourceId: 'PPADR-2020-REG-74',
      provisionRef: 'PPADR 2020, Regulation 74(1)',
      effectiveFrom: '2020-04-22T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'PRELIMINARY',
      appliesWhen: (ctx) => ctx.action === 'EVALUATE_MANDATORY_RESPONSIVENESS',
      requiresEvidence: ['KRA_TAX_COMPLIANCE', 'CR12_INCORPORATION', 'TENDER_SECURITY', 'POWER_OF_ATTORNEY'],
      permitsAction: ['ADVANCE_TO_TECHNICAL'],
      blocksAction: ['ADVANCE_TO_TECHNICAL_WITHOUT_MANDATORY'],
      auditRequirement: 'AUDIT_PRELIMINARY_RESPONSIVENESS_DECISION',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'PPADR-2020-REG-74')!;
        const requiredDocs = ['KRA_TAX_COMPLIANCE', 'CR12_INCORPORATION', 'TENDER_SECURITY'];
        const providedTypes = (ctx.evidenceProvided || []).map(e => e.type);
        const missing = requiredDocs.filter(d => !providedTypes.includes(d));

        if (missing.length > 0) {
          return {
            ruleId: 'RULE-PRELIMINARY-CHECK-PPADR-74',
            ruleName: 'Preliminary Statutory Documentation Verification',
            outcome: 'BLOCK',
            reason: `Bidder failed mandatory preliminary responsiveness under PPADR Regulation 74. Missing statutory evidence: ${missing.join(', ')}.`,
            missingConditions: missing.map(m => `Missing verified evidence document: ${m}`),
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'Mark bidder as non-responsive at preliminary stage. Non-responsive bids cannot proceed to technical evaluation.',
            auditFlag: true
          };
        }

        return {
          ruleId: 'RULE-PRELIMINARY-CHECK-PPADR-74',
          ruleName: 'Preliminary Statutory Documentation Verification',
          outcome: 'ALLOW',
          reason: 'All mandatory administrative documents verified compliant.',
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: true
        };
      }
    });

    // 4. RULE: PPADR 2020 Regulation 77 — 15% Score Variance Flag & Deliberation
    this.registerRule({
      ruleId: 'RULE-SCORE-VARIANCE-PPADR-77',
      version: '1.0.0',
      ruleName: '15% Score Variance Identification & Consensus Requirement',
      legalSourceId: 'PPADR-2020-REG-77',
      provisionRef: 'PPADR 2020, Regulation 77(4)',
      effectiveFrom: '2020-04-22T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'TECHNICAL',
      appliesWhen: (ctx) => typeof ctx.variancePercent === 'number' && ctx.variancePercent > 15,
      requiresEvidence: ['RECORDED_CONSENSUS_MINUTES', 'EVALUATOR_JUSTIFICATIONS'],
      permitsAction: ['CONVENE_CONSENSUS_DELIBERATION'],
      blocksAction: ['FINALIZE_TECHNICAL_WITHOUT_CONSENSUS_MINUTES'],
      auditRequirement: 'AUDIT_SCORE_VARIANCE_FLAGGED_SEC77',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'PPADR-2020-REG-77')!;
        const variance = ctx.variancePercent || 0;
        if (variance > 15 && ctx.action === 'FINALIZE_TECHNICAL_SCORES') {
          return {
            ruleId: 'RULE-SCORE-VARIANCE-PPADR-77',
            ruleName: '15% Score Variance Identification & Consensus Requirement',
            outcome: 'REQUIRES_HUMAN_REVIEW',
            reason: `Evaluator score variance is ${variance.toFixed(1)}% (exceeds statutory 15% threshold under PPADR Reg. 77(4)). Mandatory committee consensus deliberation and minute recording required before finalizing.`,
            missingConditions: ['Documented consensus deliberation in committee minutes explaining the score variance'],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'Committee Chair must convene deliberation session and record agreed consensus score with justifications.',
            auditFlag: true
          };
        }
        return {
          ruleId: 'RULE-SCORE-VARIANCE-PPADR-77',
          ruleName: '15% Score Variance Identification & Consensus Requirement',
          outcome: 'ALLOW',
          reason: `Score variance (${variance.toFixed(1)}%) is within acceptable statutory limits (<= 15%).`,
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: false
        };
      }
    });

    // 5. RULE: PPADA Section 84 — Full Committee Signatures on Evaluation Report
    this.registerRule({
      ruleId: 'RULE-COMMITTEE-SIGNATURE-PPADA-84',
      version: '1.0.0',
      ruleName: 'Full Committee Signatures and Dissent Recording',
      legalSourceId: 'PPADA-2015-SEC-84',
      provisionRef: 'PPADA 2015, Section 84(2)-(3)',
      effectiveFrom: '2016-01-07T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'APPROVAL',
      appliesWhen: (ctx) => ctx.action === 'SUBMIT_EVALUATION_REPORT',
      requiresEvidence: ['ALL_MEMBER_DIGITAL_SIGNATURES', 'DISSENTING_OPINION_IF_ANY'],
      permitsAction: ['TRANSMIT_TO_HEAD_OF_PROCUREMENT'],
      blocksAction: ['TRANSMIT_INCOMPLETE_EVALUATION_REPORT'],
      auditRequirement: 'AUDIT_COMMITTEE_SIGNATURE_VERIFICATION',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'PPADA-2015-SEC-84')!;
        const quorum = ctx.committeeQuorumCount || 0;
        const total = ctx.committeeTotalCount || 5;

        if (quorum < total) {
          return {
            ruleId: 'RULE-COMMITTEE-SIGNATURE-PPADA-84',
            ruleName: 'Full Committee Signatures and Dissent Recording',
            outcome: 'BLOCK',
            reason: `Evaluation report has ${quorum}/${total} required committee member signatures. Under PPADA Section 84(2), the evaluation report shall be signed by all members of the evaluation committee.`,
            missingConditions: [`Missing ${total - quorum} required committee member signature(s)`],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'All appointed committee members must sign the report or submit a signed dissenting opinion.',
            auditFlag: true
          };
        }

        return {
          ruleId: 'RULE-COMMITTEE-SIGNATURE-PPADA-84',
          ruleName: 'Full Committee Signatures and Dissent Recording',
          outcome: 'ALLOW',
          reason: 'All appointed committee members have executed statutory signatures.',
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: true
        };
      }
    });

    // 6. RULE: AI Evaluation Boundary — AI May Assist, Authorized Humans Must Decide
    this.registerRule({
      ruleId: 'RULE-AI-DECISION-BOUNDARY',
      version: '1.0.0',
      ruleName: 'AI Evaluation Governance & Human-in-the-Loop Decision Mandate',
      legalSourceId: 'KE-CONST-ART-227',
      provisionRef: 'Article 227 & Public Officer Ethics Act',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: null,
      status: 'ACTIVE',
      stage: 'TECHNICAL',
      appliesWhen: (ctx) => ctx.action === 'AUTOMATIC_AWARD_ATTEMPT',
      requiresEvidence: ['HUMAN_EVALUATOR_DECISION_RECORD'],
      permitsAction: ['AI_EXTRACTION', 'AI_MATCHING', 'AI_RECOMMENDATION'],
      blocksAction: ['AI_AUTONOMOUS_AWARD', 'AI_AUTONOMOUS_DISQUALIFICATION'],
      auditRequirement: 'AUDIT_AI_HUMAN_SEPARATION_CHECK',
      evaluate: (ctx) => {
        const source = AUTHORITATIVE_LEGAL_SOURCES.find(s => s.sourceId === 'KE-CONST-ART-227')!;
        if (ctx.action === 'AUTOMATIC_AWARD_ATTEMPT' || (ctx.aiAssistanceUsed && !ctx.actorRole.includes('EVALUATOR'))) {
          return {
            ruleId: 'RULE-AI-DECISION-BOUNDARY',
            ruleName: 'AI Evaluation Governance & Human-in-the-Loop Decision Mandate',
            outcome: 'BLOCK',
            reason: 'Autonomous award by AI is strictly prohibited by procurement governance law. AI outputs are advisory (AI ANALYSIS). Consequential evaluation decisions require authorized human review and sign-off.',
            missingConditions: ['Authorized human evaluator review and recorded score'],
            legalAuthority: {
              sourceId: source.sourceId,
              sourceName: source.sourceName,
              provision: source.provision,
              citation: source.officialCitation,
              effectiveDate: source.effectiveDate
            },
            requiredRemediation: 'Authorized human evaluator must review evidence and record independent human score.',
            auditFlag: true
          };
        }
        return {
          ruleId: 'RULE-AI-DECISION-BOUNDARY',
          ruleName: 'AI Evaluation Governance & Human-in-the-Loop Decision Mandate',
          outcome: 'ALLOW',
          reason: 'AI is deployed in assistive advisory mode with human evaluator authority preserved.',
          missingConditions: [],
          legalAuthority: {
            sourceId: source.sourceId,
            sourceName: source.sourceName,
            provision: source.provision,
            citation: source.officialCitation,
            effectiveDate: source.effectiveDate
          },
          auditFlag: false
        };
      }
    });
  }

  public registerRule(rule: LegalRuleDefinition): void {
    this.rules.set(rule.ruleId, rule);
  }

  public getRule(ruleId: string): LegalRuleDefinition | undefined {
    return this.rules.get(ruleId);
  }

  public getAllRules(): LegalRuleDefinition[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluate all applicable rules for a proposed action in context
   */
  public evaluateAction(context: EvaluationActionContext): {
    allowed: boolean;
    requiresReview: boolean;
    results: RuleEvaluationResult[];
    blockingReasons: string[];
  } {
    const applicableRules = Array.from(this.rules.values()).filter(r => r.appliesWhen(context));
    const results: RuleEvaluationResult[] = [];
    const blockingReasons: string[] = [];
    let requiresReview = false;

    for (const rule of applicableRules) {
      const res = rule.evaluate(context);
      results.push(res);
      if (res.outcome === 'BLOCK') {
        blockingReasons.push(res.reason);
      } else if (res.outcome === 'REQUIRES_HUMAN_REVIEW') {
        requiresReview = true;
      }
    }

    return {
      allowed: blockingReasons.length === 0,
      requiresReview,
      results,
      blockingReasons
    };
  }
}
