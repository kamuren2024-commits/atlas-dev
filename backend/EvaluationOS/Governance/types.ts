/**
 * STATUTORY CONTROL PLANE — CONTRACTS & TYPES
 * PPADA 2015 / Rev. 2022 / PPADR 2020
 */

export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'ESCALATE';

export interface LegalSourceRecord {
  id: string;
  code: string;
  title: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REPEALED';
  source: string;
  reviewedAt: string;
  provisionsCount: number;
}

export interface LegalProvisionRecord {
  id: string;
  sourceId: string;
  provisionRef: string; // e.g. "Section 67", "Section 80", "Section 86"
  heading: string;
  content: string;
  mandatoryRequirement: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  version: string;
  status: 'ACTIVE' | 'SUPERSEDED';
}

export interface PolicyRuleRecord {
  id: string;
  policyCode: string;
  name: string;
  description: string;
  provisionRef: string;
  actionRequired: string;
  allowedRoles: string[];
  decisionOnMatch: PolicyDecision;
  humanApprovalRequired: boolean;
  version: string;
}

export interface StatutoryControlRecord {
  id: string;
  controlCode: string;
  legalSource: string;
  provision: string;
  policy: string;
  runtimeRule: string;
  workflowGate: string;
  evidenceRequired: string;
  testSuite: string;
  auditEventType: string;
}

export interface HumanApprovalGate {
  gateId: string;
  tenderId: string;
  stageName: string;
  requiredRole: string; // 'ACCOUNTING_OFFICER' | 'COMMITTEE_CHAIR' | 'HEAD_OF_PROCUREMENT'
  status: 'LOCKED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  dissentRationale?: string;
  digitalSignature?: string;
  auditBlockHeight?: number;
}
