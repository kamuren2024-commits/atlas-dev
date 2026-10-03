/**
 * ATLAS CUMULATIVE ENACTMENT EVALUATION ENGINE
 * 
 * This module provides the canonical evaluation system for all platform
 * enactments completed so far, implementing the systematic trust gate
 * required by the cumulative evaluation phase.
 * 
 * Key principles:
 * - Every Atlas enactment must produce executable evidence
 * - Explicit trust status is assigned through comprehensive evaluation
 * - Regressions are detected and exposed
 * - Dependencies are mapped and verified before downstream use
 * 
 * Uses the EnactmentStatus vocabulary and inventory from platform/kernel/contracts.ts
 */

import {
  AtlasEnactmentEvaluation,
  EnactmentStatus,
  ATLAS_ENACTMENT_INVENTORY,
  AtlasEnactmentInventoryEntry,
  buildEnactmentEvaluationFor,
  deriveEnactmentStatus,
  EnactmentEvidenceSnapshot,
} from '../../platform/kernel/contracts';

interface EnactmentEvaluationConfig {
  skipMissing?: boolean;
  includeDeprecated?: boolean;
  strictRegressionDetection?: boolean;
}

export class EnactmentEvaluationEngine {
  private static instance: EnactmentEvaluationEngine | null = null;
  private evaluations: Map<string, AtlasEnactmentEvaluation> = new Map();
  private inventory: readonly AtlasEnactmentInventoryEntry[] = ATLAS_ENACTMENT_INVENTORY;

  private constructor() {
    this.initialize();
  }

  static getInstance(): EnactmentEvaluationEngine {
    if (!EnactmentEvaluationEngine.instance) {
      EnactmentEvaluationEngine.instance = new EnactmentEvaluationEngine();
    }
    return EnactmentEvaluationEngine.instance;
  }

  private initialize(): void {
    for (const entry of this.inventory) {
      const evaluation = buildEnactmentEvaluationFor(entry);
      this.evaluations.set(evaluation.evaluationId, evaluation);
    }
  }

  /**
   * Returns all enactment evaluations in the current inventory
   */
  getInventory(): AtlasEnactmentEvaluation[] {
    return Array.from(this.evaluations.values());
  }

  /**
   * Returns evaluations grouped by phase
   */
  getByPhase(phaseId: string): AtlasEnactmentEvaluation[] {
    return this.getInventory().filter(e => e.phaseId === phaseId);
  }

  /**
   * Returns evaluations by status
   */
  getByStatus(status: EnactmentStatus): AtlasEnactmentEvaluation[] {
    return this.getInventory().filter(e => e.actualStatus === status);
  }

  /**
   * Returns evaluations grouped by eligibility
   */
  getByEligibility(eligibility: 'ELIGIBLE' | 'BLOCKED' | 'RESTRICTED' | 'UNVERIFIED'): AtlasEnactmentEvaluation[] {
    return this.getInventory().filter(e => e.eligibility === eligibility);
  }

  /**
   * Summarizes the current enactment landscape
   */
  getSummary(): {
    total: number;
    byStatus: Record<EnactmentStatus, number>;
    byEligibility: Record<string, number>;
    blockers: Array<{ evaluationId: string; blockers: string[] }>;
    risks: Array<{ evaluationId: string; risks: string[] }>;
  } {
    const evaluations = this.getInventory();
    const byStatus: Record<EnactmentStatus, number> = {
      NOT_ENACTED: 0,
      CONTRACT_ONLY: 0,
      IMPLEMENTED: 0,
      WIRED: 0,
      FUNCTIONAL: 0,
      VERIFIED: 0,
      PARTIAL: 0,
      UNVERIFIED: 0,
      FAILED: 0,
      BLOCKED: 0,
      MOCKED: 0,
      STUBBED: 0,
      NON_DURABLE: 0,
      FAIL_OPEN: 0,
      FAIL_CLOSED: 0,
      DEPRECATED: 0,
      REGRESSED: 0,
    };

    const byEligibility: Record<string, number> = {
      ELIGIBLE: 0,
      BLOCKED: 0,
      RESTRICTED: 0,
      UNVERIFIED: 0,
    };

    const blockers: Array<{ evaluationId: string; blockers: string[] }> = [];
    const risks: Array<{ evaluationId: string; risks: string[] }> = [];

    for (const eval of evaluations) {
      byStatus[eval.actualStatus]++;
      byEligibility[eval.eligibility]++;

      if (eval.blockers.length > 0) {
        blockers.push({ evaluationId: eval.evaluationId, blockers: eval.blockers });
      }
      if (eval.risks.length > 0) {
        risks.push({ evaluationId: eval.evaluationId, risks: eval.risks });
      }
    }

    return { total: evaluations.length, byStatus, byEligibility, blockers, risks };
  }

  /**
   * Performs a forensic evaluation of a single capability
   */
  evaluateCapability(capabilityId: string): {
    evaluation: AtlasEnactmentEvaluation | null;
    evidence: {
      declaration: string;
      actual: string;
      contractExists: boolean;
      runtimePath: boolean;
      tested: boolean;
      failureTested: boolean;
      securityTested: boolean;
      observable: boolean;
      durable: boolean;
      productionReady: boolean;
    };
  } {
    const evaluation = Array.from(this.evaluations.values()).find(e => e.capabilityId === capabilityId);

    if (!evaluation) {
      return {
        evaluation: null,
        evidence: {
          declaration: 'NOT_FOUND',
          actual: 'NOT_ENACTED',
          contractExists: false,
          runtimePath: false,
          tested: false,
          failureTested: false,
          securityTested: false,
          observable: false,
          durable: false,
          productionReady: false,
        },
      };
    }

    return {
      evaluation,
      evidence: {
        declaration: evaluation.declaredStatus,
        actual: evaluation.actualStatus,
        contractExists: evaluation.contractEvidence.length > 0,
        runtimePath: evaluation.runtimeEvidence.length > 0,
        tested: evaluation.testRefs.length > 0,
        failureTested: evaluation.failureEvidence.length > 0,
        securityTested: evaluation.securityEvidence.length > 0,
        observable: evaluation.observabilityEvidence.length > 0,
        durable: evaluation.persistenceEvidence.length > 0,
        productionReady: evaluation.eligibility === 'ELIGIBLE',
      },
    };
  }

  /**
   * Checks if a capability is eligible for use
   */
  isEligible(capabilityId: string): boolean {
    const result = this.evaluateCapability(capabilityId);
    return result.evaluation?.eligibility === 'ELIGIBLE';
  }

  /**
   * Checks if a capability has regressed
   */
  hasRegressed(capabilityId: string, priorStatus: EnactmentStatus): boolean {
    const result = this.evaluateCapability(capabilityId);
    if (!result.evaluation) return true;

    const regressionRank: Record<EnactmentStatus, number> = {
      VERIFIED: 10,
      PARTIAL: 9,
      IMPLEMENTED: 8,
      WIRED: 7,
      FUNCTIONAL: 6,
      UNVERIFIED: 5,
      BLOCKED: 4,
      CONTRACT_ONLY: 3,
      MOCKED: 2,
      STUBBED: 2,
      NON_DURABLE: 2,
      FAIL_OPEN: 1,
      REGRESSED: 0,
      FAILED: 0,
      DEPRECATED: 0,
      NOT_ENACTED: 0,
    };

    return regressionRank[result.evaluation.actualStatus] < regressionRank[priorStatus];
  }

  /**
   * Performs diagnostics for a failed evaluation
   */
  diagnoseFailure(evaluationId: string): {
    evaluation: AtlasEnactmentEvaluation | null;
    diagnosis: {
      gap: string;
      evidence: string[];
      requiredEvidence: string[];
      nextStep: string;
    };
  } {
    const evaluation = this.evaluations.get(evaluationId);

    if (!evaluation) {
      return {
        evaluation: null,
        diagnosis: {
          gap: 'EVALUATION_NOT_FOUND',
          evidence: [],
          requiredEvidence: [],
          nextStep: 'Verify the evaluation ID and ensure the capability exists in the inventory',
        },
      };
    }

    const requiredEvidence: string[] = [];
    let gap = '';

    if (!evaluation.contractEvidence || evaluation.contractEvidence.length === 0) {
      gap = 'NO_CONTRACT_EVIDENCE';
      requiredEvidence.push('Contract definition file, documentation, or code comment');
    }

    if (!evaluation.runtimeEvidence || evaluation.runtimeEvidence.length === 0) {
      gap = gap || 'NO_RUNTIME_EVIDENCE';
      requiredEvidence.push('Functional implementation in code');
    }

    if (!evaluation.persistenceEvidence || evaluation.persistenceEvidence.length === 0) {
      gap = gap || 'NON_DURABLE';
      requiredEvidence.push('Persistence mechanism (database, durable storage, etc.)');
    }

    if (!evaluation.testRefs || evaluation.testRefs.length === 0) {
      gap = gap || 'NOT_TESTED';
      requiredEvidence.push('Unit/integration/contract tests');
    }

    if (!evaluation.failureEvidence || evaluation.failureEvidence.length === 0) {
      gap = gap || 'NO_FAILURE_TESTING';
      requiredEvidence.push('Explicit failure cases and negative tests');
    }

    if (!evaluation.securityEvidence || evaluation.securityEvidence.length === 0) {
      gap = gap || 'SECURITY_NOT_TESTED';
      requiredEvidence.push('Security boundary checks, injection tests, authorization validation');
    }

    const nextStep =
      gap === 'EVALUATION_NOT_FOUND'
        ? 'Verify the evaluation ID'
        : gap === 'NO_CONTRACT_EVIDENCE'
        ? 'Define and document the contract for this capability'
        : gap === 'NO_RUNTIME_EVIDENCE'
        ? 'Implement the capability in code'
        : gap === 'NON_DURABLE'
        ? 'Add durable storage mechanism (e.g., database, event stream)'
        : gap === 'NOT_TESTED'
        ? 'Write comprehensive tests covering happy path and edge cases'
        : gap === 'NO_FAILURE_TESTING'
        ? 'Add explicit failure and negative test scenarios'
        : 'Add security tests for authorization, injection handling, and boundary validation';

    return {
      evaluation,
      diagnosis: {
        gap,
        evidence: evaluation.contractEvidence.concat(
          evaluation.runtimeEvidence,
          evaluation.persistenceEvidence,
          evaluation.testRefs,
          evaluation.failureEvidence,
          evaluation.securityEvidence
        ),
        requiredEvidence,
        nextStep,
      },
    };
  }

  /**
   * Updates the eligibility status for a capability based on new evidence
   */
  updateEvidenceSnapshot(capabilityId: string, snapshot: EnactmentEvidenceSnapshot): AtlasEnactmentEvaluation | null {
    const entry = this.inventory.find(e => e.capabilityId === capabilityId);
    if (!entry) return null;

    const newStatus = deriveEnactmentStatus(snapshot);
    const evaluation = buildEnactmentEvaluationFor(entry);
    evaluation.actualStatus = newStatus;
    this.evaluations.set(evaluation.evaluationId, evaluation);

    return evaluation;
  }

  /**
   * Generates a forensic report in markdown format
   */
  generateReport(): string {
    const summary = this.getSummary();
    const evaluations = this.getInventory();

    let report = `# Salience Atlas — Cumulative Enactment Evaluation Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += `## Executive Summary\n\n`;
    report += `| Metric | Value |\n`;
    report += `|---|---|\n`;
    report += `| Total Enactments | ${summary.total} |\n`;
    report += `| Eligible | ${summary.byEligibility.ELIGIBLE} |\n`;
    report += `| Blocked | ${summary.byEligibility.BLOCKED} |\n`;
    report += `| Unverified | ${summary.byEligibility.UNVERIFIED} |\n`;
    report += `| Not Enacted | ${summary.byStatus.NOT_ENACTED} |\n\n`;

    report += `## Status Distribution\n\n`;
    report += `| Status | Count |\n`;
    report += `|---|---|\n`;
    for (const [status, count] of Object.entries(summary.byStatus)) {
      if (count > 0) {
        report += `| ${status} | ${count} |\n`;
      }
    }
    report += `\n`;

    if (summary.blockers.length > 0) {
      report += `## Blockers\n\n`;
      for (const { evaluationId, blockers } of summary.blockers) {
        report += `### ${evaluationId}\n`;
        for (const blocker of blockers) {
          report += `- ${blocker}\n`;
        }
        report += `\n`;
      }
    }

    if (summary.risks.length > 0) {
      report += `## Risks\n\n`;
      for (const { evaluationId, risks } of summary.risks) {
        report += `### ${evaluationId}\n`;
        for (const risk of risks) {
          report += `- ${risk}\n`;
        }
        report += `\n`;
      }
    }

    report += `## Detailed Evaluations\n\n`;
    for (const eval of evaluations) {
      report += `### ${eval.capabilityId}\n\n`;
      report += `- **Phase**: ${eval.phaseId}\n`;
      report += `- **Declared Status**: ${eval.declaredStatus}\n`;
      report += `- **Actual Status**: ${eval.actualStatus}\n`;
      report += `- **Eligibility**: ${eval.eligibility}\n`;
      report += `- **Evidence Refs**: ${eval.artifactRefs.join(', ') || 'None'}\n\n`;
    }

    return report;
  }
}

export async function initializeEnactmentEvaluation(): Promise<EnactmentEvaluationEngine> {
  return EnactmentEvaluationEngine.getInstance();
}
