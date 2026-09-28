/**
 * Enterprise Memory Fabric (EMF) — Governance, Risk, and Compliance (GRC)
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryEntry, MemoryContext, MemoryPolicy, MemoryType } from '../types';

export class MemoryGovernanceEngine {
  private static approvals = new Set<string>();

  public static evaluateRetention(entry: MemoryEntry, policy: MemoryPolicy): boolean {
    if (!policy.retentionMs) return true;
    const elapsed = Date.now() - entry.createdAt;
    return elapsed <= policy.retentionMs;
  }

  public static verifyAccessControl(context: MemoryContext, policy: MemoryPolicy): boolean {
    const classification = policy.classification;
    if (classification === 'PUBLIC') return true;

    const userRoles = context.securityContext?.roles || [];
    if (classification === 'CONFIDENTIAL') {
      return userRoles.includes('ADMIN') || userRoles.includes('COMPLIANCE_OFFICER');
    }

    if (classification === 'RESTRICTED') {
      return userRoles.includes('ADMIN') || userRoles.includes('COMPLIANCE_OFFICER') || userRoles.includes('OPERATIONS');
    }

    // INTERNAL allows any authenticated staff roles
    return userRoles.length > 0;
  }

  public static applyComplianceTags(entry: MemoryEntry, policy: MemoryPolicy): Record<string, any> {
    const complianceMetadata: Record<string, any> = {
      evaluatedAt: Date.now(),
      classification: policy.classification,
      isPiiRedacted: policy.classification === 'CONFIDENTIAL' || policy.classification === 'RESTRICTED',
      auditSignature: `grc-sig-${entry.id}-${Date.now().toString(36)}`,
      retentionExempt: !policy.retentionMs
    };

    if (policy.retentionMs) {
      complianceMetadata.scheduledPurgeTime = entry.createdAt + policy.retentionMs;
    }

    return complianceMetadata;
  }

  public static requestApproval(operationId: string): void {
    this.approvals.add(operationId);
  }

  public static grantApproval(operationId: string): void {
    this.approvals.add(operationId);
  }

  public static isApproved(operationId: string): boolean {
    return this.approvals.has(operationId);
  }

  public static clearApprovals(): void {
    this.approvals.clear();
  }
}
