import crypto from 'crypto';
import { AuthoritativeLegalSource } from '../governance/authoritative-sources';

export type ControlApplicability = 'ALWAYS' | 'WHEN_PROVIDED' | 'CONFIGURED';
export type ControlFailureState = 'NON_COMPLIANT' | 'INSUFFICIENT_EVIDENCE' | 'REQUIRES_LEGAL_REVIEW';
export type ControlEvaluationMethod = 'REQUIRED_EVIDENCE' | 'DATE_VALIDITY' | 'NUMERIC_THRESHOLD' | 'EXACT_VALUE';
export type DeterministicResult = 'PASS' | 'FAIL' | 'INSUFFICIENT_EVIDENCE' | 'NOT_APPLICABLE';

export interface LegalFramework {
  frameworkId: string;
  name: string;
  jurisdiction: string;
  sourceIds: string[];
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
}

export interface LegalVersion {
  versionId: string;
  frameworkId: string;
  sourceId: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  officialCitation: string;
  verificationSource: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REQUIRES_LEGAL_REVIEW';
}

export interface ControlDefinition {
  controlId: string;
  title: string;
  description: string;
  legalSourceId: string;
  legalVersion: string;
  provision: string;
  effectiveFrom: string;
  effectiveTo?: string;
  applicability: ControlApplicability;
  mandatory: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evaluationMethod: ControlEvaluationMethod;
  requiredEvidence: string[];
  failureState: ControlFailureState;
  humanReviewRequired: boolean;
  stage: 'INTAKE' | 'PRELIMINARY' | 'TECHNICAL' | 'FINANCIAL' | 'APPROVAL' | 'AWARD';
}

export interface RequirementControl {
  requirementId: string;
  controlId: string;
  requirementCode: string;
  description: string;
  configuredValue?: string | number | boolean;
  source: 'TENDER' | 'LEGAL_FRAMEWORK';
}

export interface EvidenceInput {
  evidenceId: string;
  type: string;
  value?: string | number | boolean;
  validFrom?: string;
  validTo?: string;
  hash: string;
  status: 'VERIFIED' | 'REQUIRES_REVIEW' | 'INVALID' | 'PENDING';
  sourceDocumentId?: string;
}

export interface ControlEvaluation {
  controlId: string;
  requirementId?: string;
  result: DeterministicResult;
  reason: string;
  evidenceIds: string[];
  legalSourceId: string;
  legalVersion: string;
  evaluatedAt: string;
  humanReviewRequired: boolean;
}

export interface DecisionTrace {
  decisionId: string;
  tenantId: string;
  evaluationId: string;
  inputs: { inputId: string; hash: string; type: string }[];
  criteriaVersion: string;
  legalVersion: string;
  policyVersion: string;
  evidenceVersions: string[];
  deterministicResults: ControlEvaluation[];
  aiRecommendations: Array<{
    recommendationId: string;
    model: string;
    promptVersion: string;
    outputHash: string;
    status: 'ADVISORY' | 'INDEPENDENTLY_VERIFIED';
  }>;
  humanActions: Array<{ actorId: string; action: string; occurredAt: string }>;
  approvals: Array<{ actorId: string; role: string; occurredAt: string; decision: 'APPROVED' | 'REJECTED' }>;
  finalDecision?: 'AWARD' | 'REJECT' | 'CLARIFICATION' | 'PENDING_HUMAN_REVIEW';
  createdAt: string;
  traceHash: string;
}

export function legalVersionFromSource(source: AuthoritativeLegalSource): LegalVersion {
  return {
    versionId: `${source.sourceId}:${source.version}`,
    frameworkId: 'KENYA_PUBLIC_PROCUREMENT',
    sourceId: source.sourceId,
    version: source.version,
    effectiveFrom: source.effectiveDate,
    effectiveTo: source.expiryDate || undefined,
    officialCitation: source.officialCitation,
    verificationSource: source.verificationSource,
    status: source.status === 'ACTIVE' ? 'ACTIVE' : 'REQUIRES_LEGAL_REVIEW'
  };
}

export function hashDecisionTrace(trace: Omit<DecisionTrace, 'traceHash'>): string {
  return crypto.createHash('sha256').update(JSON.stringify(trace)).digest('hex');
}
