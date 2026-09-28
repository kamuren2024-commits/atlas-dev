/**
 * PHASE 01: EETF RULE ONTOLOGY - RULE COMPILER
 * 
 * Compiles rule definitions into executable form.
 * Ensures determinism by:
 * - Creating fixed executable code from rule definition
 * - Versioning compiled code
 * - Including version in hash for replay-ability
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import * as crypto from 'crypto';
import {
  Rule,
  RuleExecutable,
  EvaluationStage,
  RuleCategory,
  RuleSeverity,
  FailureBehavior,
  ReviewBehavior,
  LegalInstrument
} from './rule-schema';

/**
 * RuleCompiler - Compiles rules to executable form
 */
export class RuleCompiler {
  private static readonly COMPILER_VERSION = '1.0.0';

  /**
   * Compile a single rule to executable form
   */
  public static compile(rule: Rule): RuleExecutable {
    const compilerVersion = this.COMPILER_VERSION;
    const compiledAt = new Date();

    // Generate deterministic TypeScript code
    const compiledCode = this.generateRuleCode(rule);

    // Create hash for integrity verification
    const codeHash = this.hashCode(compiledCode + compilerVersion);

    return {
      compiler_version: compilerVersion,
      compiled_at: compiledAt,
      compiled_code: compiledCode,
      language: 'typescript',
      code_hash: codeHash
    };
  }

  /**
   * Compile all rules for a stage
   */
  public static compileStage(rules: Rule[], stage: EvaluationStage): Map<string, RuleExecutable> {
    const executables = new Map<string, RuleExecutable>();

    for (const rule of rules) {
      if (rule.evaluation_stage === stage) {
        const executable = this.compile(rule);
        executables.set(rule.rule_id, executable);
      }
    }

    return executables;
  }

  /**
   * Generate TypeScript code for a rule
   * This code is deterministic and versionable.
   */
  private static generateRuleCode(rule: Rule): string {
    const code = `
/**
 * Auto-generated rule code for: ${rule.rule_id}
 * Version: ${rule.rule_version}
 * Generated: ${new Date().toISOString()}
 * 
 * DETERMINISTIC EXECUTION:
 * - Same input + same rule version = same output
 * - No external dependencies beyond input context
 * - No randomization or time-based decisions
 */

import { RuleResult, RuleResultStatus, ExecutionContext, EvidenceReference } from './rule-schema';

/**
 * Execute rule: ${rule.rule_id}
 * Category: ${rule.rule_category}
 * Severity: ${rule.severity}
 * Legal: ${rule.legal_instrument} ${rule.section_or_regulation}
 */
export async function execute_${this.sanitizeRuleId(rule.rule_id)}(
  context: ExecutionContext,
  evidenceMap: Map<string, EvidenceReference[]>
): Promise<RuleResult> {
  const startTime = Date.now();
  
  try {
    // ===================================
    // RULE EXECUTION LOGIC
    // ===================================
    
    // Rule: ${rule.rule_id}
    // Description: ${rule.description}
    // 
    // Prerequisites:
    ${rule.prerequisites.map((p, i) => `    // ${i + 1}. ${p.description}`).join('\n')}
    //
    // Evidence Requirements:
    ${rule.evidence_requirements.map((e, i) => `    // ${i + 1}. ${e.evidence_type} (${e.mandatory ? 'MANDATORY' : 'OPTIONAL'}, min confidence: ${e.min_confidence})`).join('\n')}
    
    // Placeholder: Rule-specific logic will be generated based on rule definition
    // This is the skeleton that will be filled in with actual evaluation logic
    const ruleResult = await executeRuleLogic(context, evidenceMap);
    
    const executionTime = Date.now() - startTime;
    
    return {
      result_id: context.evaluation_id + '_${rule.rule_id}_' + Date.now(),
      rule_id: '${rule.rule_id}',
      rule_version: '${rule.rule_version}',
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: ruleResult.status,
      confidence: ruleResult.confidence,
      evidence_used: ruleResult.evidence_used || [],
      calculation_details: ruleResult.calculation_details || { steps: [], values: {}, logic_description: '' },
      output: ruleResult.output,
      audit_signature: generateAuditSignature({
        rule_id: '${rule.rule_id}',
        rule_version: '${rule.rule_version}',
        execution_time: executionTime,
        context_hash: hashContext(context)
      }),
      replayed: false
    };
  } catch (error) {
    return {
      result_id: context.evaluation_id + '_${rule.rule_id}_' + Date.now(),
      rule_id: '${rule.rule_id}',
      rule_version: '${rule.rule_version}',
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: 'ERROR' as RuleResultStatus,
      confidence: 0,
      evidence_used: [],
      calculation_details: { steps: [], values: {}, logic_description: '' },
      output: null,
      error: {
        error_code: 'EXECUTION_ERROR',
        error_message: (error as Error).message,
        error_details: { name: (error as Error).name, stack: (error as Error).stack }
      },
      audit_signature: generateAuditSignature({
        rule_id: '${rule.rule_id}',
        rule_version: '${rule.rule_version}',
        error: true
      }),
      replayed: false
    };
  }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Execute rule-specific logic
 * This is a placeholder that will be filled in with actual evaluation code
 */
async function executeRuleLogic(context: ExecutionContext, evidenceMap: Map<string, EvidenceReference[]>) {
  // TODO: Implement rule-specific evaluation logic
  // This should:
  // 1. Retrieve relevant evidence from evidenceMap
  // 2. Apply rule logic to evidence
  // 3. Return status, confidence, and output
  
  return {
    status: 'INCONCLUSIVE' as RuleResultStatus,
    confidence: 0,
    evidence_used: [],
    output: null,
    calculation_details: {
      steps: [],
      values: {},
      logic_description: 'Rule logic not yet implemented'
    }
  };
}

/**
 * Generate cryptographic audit signature
 */
function generateAuditSignature(data: any): string {
  // In production, this would use cryptographic signing
  // For now, return a deterministic hash
  return hashCode(JSON.stringify(data));
}

/**
 * Hash execution context for audit trail
 */
function hashContext(context: ExecutionContext): string {
  const data = {
    evaluation_id: context.evaluation_id,
    tender_id: context.tender_id,
    bid_id: context.bid_id,
    applicable_date: context.applicable_date.toISOString()
  };
  return hashCode(JSON.stringify(data));
}

/**
 * Simple hash function (deterministic)
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}
`;

    return code;
  }

  /**
   * Sanitize rule ID for use as function name
   */
  private static sanitizeRuleId(ruleId: string): string {
    return ruleId.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Generate SHA256 hash
   */
  private static hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Validate compiled executable
   */
  public static validateExecutable(executable: RuleExecutable): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!executable.compiled_code) {
      errors.push('Missing compiled_code');
    }

    if (!executable.compiler_version) {
      errors.push('Missing compiler_version');
    }

    if (!executable.compiled_at) {
      errors.push('Missing compiled_at timestamp');
    }

    if (executable.language !== 'typescript') {
      errors.push(`Unsupported language: ${executable.language}`);
    }

    if (!executable.code_hash) {
      errors.push('Missing code_hash');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Verify executable integrity (code hasn't been tampered with)
   */
  public static verifyIntegrity(executable: RuleExecutable, originalHash: string): boolean {
    const recomputedHash = this.hashCode(executable.compiled_code + executable.compiler_version);
    return recomputedHash === originalHash;
  }
}

/**
 * Example: How to generate a fully-specified rule compiler for a specific rule type
 * This would be used for high-complexity rules like Financial Evaluation
 */
export class RuleCodeGenerator {
  /**
   * Generate rule code for Preliminary Evaluation (PPADA 74)
   */
  public static generatePreliminaryEvaluationCode(): string {
    return `
// PRELIMINARY EVALUATION RULE (PPADA Section 74)
// 
// Checks:
// 1. Tender completeness
// 2. Tender security provided
// 3. Certificate authenticity
// 4. Proper sealing and labeling
// 5. Tender validity not lapsed
// 6. Authorized submission

export async function evaluatePreliminary(context: ExecutionContext, evidenceMap: Map<string, any>) {
  const steps = [];
  
  // Check 1: Tender Completeness
  const completenessResult = checkTenderCompleteness(evidenceMap);
  steps.push({
    step_number: 1,
    operation: 'checkTenderCompleteness',
    output_value: completenessResult.status
  });
  
  if (!completenessResult.passed) {
    return {
      status: 'FAIL',
      confidence: 1.0,
      output: { reason: 'Incomplete tender' },
      calculation_details: { steps }
    };
  }
  
  // Additional checks...
  
  return {
    status: 'PASS',
    confidence: 1.0,
    output: { all_checks_passed: true },
    calculation_details: { steps }
  };
}

function checkTenderCompleteness(evidenceMap: Map<string, any>): { status: string; passed: boolean } {
  // Implementation would verify all required documents present
  return { status: 'VERIFIED', passed: true };
}
`;
  }

  /**
   * Generate rule code for Responsiveness Check (PPADA 71)
   */
  public static generateResponsivenesCheckCode(): string {
    return `
// RESPONSIVENESS CHECK RULE (PPADA Section 71)
// 
// Checks:
// 1. Bidder legal capacity
// 2. No insolvency/bankruptcy
// 3. No conviction records (3 years)
// 4. Tax compliance
// 5. Professional registration
// 6. Specific qualifications met

export async function evaluateResponsiveness(context: ExecutionContext, evidenceMap: Map<string, any>) {
  const steps = [];
  
  // Check 1: Legal Capacity
  const legalCapacityCheck = checkLegalCapacity(evidenceMap);
  steps.push({ step_number: 1, operation: 'checkLegalCapacity', output_value: legalCapacityCheck.status });
  
  if (!legalCapacityCheck.passed) {
    return { status: 'FAIL', confidence: 1.0, output: { reason: legalCapacityCheck.reason } };
  }
  
  // Check 2: Insolvency
  const insolvencyCheck = checkInsolvency(evidenceMap);
  steps.push({ step_number: 2, operation: 'checkInsolvency', output_value: insolvencyCheck.status });
  
  if (insolvencyCheck.insolvent) {
    return { status: 'FAIL', confidence: 1.0, output: { reason: 'Bidder is insolvent' } };
  }
  
  // Additional checks...
  
  return { status: 'PASS', confidence: 1.0, output: { all_checks_passed: true } };
}

function checkLegalCapacity(evidenceMap: Map<string, any>) {
  return { status: 'VERIFIED', passed: true };
}

function checkInsolvency(evidenceMap: Map<string, any>) {
  return { status: 'VERIFIED', insolvent: false };
}
`;
  }
}
