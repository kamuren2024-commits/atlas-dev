/**
 * PHASE 01: EETF RULE ONTOLOGY - RULE SCHEMA
 * 
 * Canonical TypeScript definitions for EETF evaluation rules.
 * All rules must conform to this schema.
 * 
 * Authority: PPADA 2015, PPADR 2020, Tender-Specific Criteria
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import { JSONSchema7 } from 'json-schema';

/**
 * Rule Categories - Major classifications of procurement rules
 */
export type RuleCategory =
  | 'PRELIMINARY'      // Preliminary evaluation (eligibility, format)
  | 'RESPONSIVENESS'   // Responsiveness checks (mandatory requirements)
  | 'TECHNICAL'        // Technical evaluation criteria
  | 'FINANCIAL'        // Financial evaluation and ranking
  | 'TEMPORAL'         // Time-based validations (expiry, validity)
  | 'DUE_DILIGENCE';   // Post-qualification verification

/**
 * Rule Severity - Impact if rule fails
 */
export type RuleSeverity = 
  | 'MANDATORY'        // Rule failure = automatic rejection
  | 'HIGH'             // Rule failure = serious issue, requires review
  | 'MEDIUM'           // Rule failure = scores reduced
  | 'LOW';             // Rule failure = informational only

/**
 * Failure Behavior - What happens when a rule fails
 */
export type FailureBehavior =
  | 'NON_RESPONSIVE'       // Bidder marked non-responsive, blocked from next stage
  | 'NEXT_STAGE_BLOCK'     // Cannot proceed to next evaluation stage
  | 'SCORE_PENALTY'        // Reduce evaluation score
  | 'REQUIRES_REVIEW';     // Flag for human review

/**
 * Review Behavior - When human review is needed
 */
export type ReviewBehavior =
  | 'AUTOMATIC'        // Execute without human review required
  | 'ALWAYS_REVIEW'    // Always require human review before result
  | 'REVIEW_IF_FAIL';  // Review only if rule fails

/**
 * Legal Instrument - Source of procurement law
 */
export type LegalInstrument =
  | 'PPADA_2015'           // Public Procurement and Asset Disposal Act 2015
  | 'PPADR_2020'           // Public Procurement and Asset Disposal Regulations 2020
  | 'TENDER_DOCUMENT'      // Tender-specific requirements
  | 'COMMON_LAW';          // Common law principles

/**
 * Evaluation Stage - When a rule executes
 */
export type EvaluationStage =
  | 'INTAKE'               // Document ingestion
  | 'CLASSIFICATION'       // Document type classification
  | 'OCR'                  // Optical character recognition
  | 'METADATA'             // Metadata extraction
  | 'LEGAL_VALIDATION'     // Legal document validation
  | 'PRELIMINARY'          // Preliminary evaluation (PPADA 74)
  | 'RESPONSIVENESS'       // Responsiveness gate (mandatory requirements)
  | 'TECHNICAL'            // Technical evaluation
  | 'FINANCIAL'            // Financial evaluation
  | 'DUE_DILIGENCE'        // Post-qualification verification
  | 'CROSS_VALIDATION'     // Cross-bid validation
  | 'RECOMMENDATION'       // Final recommendation
  | 'OFFICER_APPROVAL'     // Officer approval gate
  | 'POST_QUALIFICATION'   // After-award verification
  | 'AWARD';               // Contract award stage

/**
 * Rule Result Status - Outcome of rule execution
 */
export type RuleResultStatus =
  | 'PASS'             // Rule passed
  | 'FAIL'             // Rule failed
  | 'INCONCLUSIVE'     // Result unclear (missing evidence)
  | 'ERROR';           // Execution error

/**
 * Core Rule Definition
 * 
 * This is the authoritative schema for all EETF evaluation rules.
 * Rules are versioned and immutable once created.
 */
export interface Rule {
  // =====================================================
  // IDENTITY & VERSIONING
  // =====================================================
  
  /** Unique rule identifier (immutable) e.g., "PRE-01-ELIGIBILITY" */
  rule_id: string;
  
  /** Semantic version e.g., "1.0.0" */
  rule_version: string;
  
  /** Execution sequence within stage (lower numbers execute first) */
  rule_sequence: number;
  
  // =====================================================
  // CLASSIFICATION
  // =====================================================
  
  /** Major rule category */
  rule_category: RuleCategory;
  
  /** Evaluation stage when rule executes */
  evaluation_stage: EvaluationStage;
  
  // =====================================================
  // LEGAL AUTHORITY
  // =====================================================
  
  /** Source of legal authority */
  legal_instrument: LegalInstrument;
  
  /** Section or regulation cite e.g., "Section 71(1)(b)" */
  section_or_regulation: string;
  
  /** Tender-specific clause reference (if applicable) e.g., "Clause 5.2" */
  tender_clause: string | null;
  
  /** Full text of legal requirement */
  legal_text: string;
  
  // =====================================================
  // TEMPORAL GOVERNANCE
  // =====================================================
  
  /** Effective date for this rule (becomes applicable) */
  effective_from: Date;
  
  /** Expiry date (becomes inapplicable), null if no expiry */
  effective_to: Date | null;
  
  // =====================================================
  // SEVERITY & BEHAVIOR
  // =====================================================
  
  /** Severity level if rule fails */
  severity: RuleSeverity;
  
  /** What happens if rule fails */
  failure_behavior: FailureBehavior;
  
  /** When human review is required */
  review_behavior: ReviewBehavior;
  
  // =====================================================
  // DEPENDENCIES & PREREQUISITES
  // =====================================================
  
  /** IDs of rules that must execute before this rule */
  dependencies: string[];
  
  /** Predicates that must be true for rule to execute */
  prerequisites: RuleCondition[];
  
  // =====================================================
  // SCHEMA & CONTRACT
  // =====================================================
  
  /** JSON Schema for expected evidence input */
  input_schema: JSONSchema7;
  
  /** JSON Schema for expected rule output */
  output_schema: JSONSchema7;
  
  /** Types of evidence required for this rule */
  evidence_requirements: EvidenceRequirement[];
  
  // =====================================================
  // EXECUTION & LOGIC
  // =====================================================
  
  /** Compiled executable form of rule logic */
  logic: RuleExecutable;
  
  /** Test case IDs for regression testing */
  test_reference: string[];
  
  // =====================================================
  // METADATA
  // =====================================================
  
  /** Human-readable description */
  description: string;
  
  /** When rule was created */
  created_at: Date;
  
  /** User who created rule */
  created_by: string;
  
  /** Last modification timestamp */
  last_modified_at: Date | null;
  
  /** User who last modified rule */
  last_modified_by: string | null;
}

/**
 * Rule Condition - Predicate for rule applicability
 * Used to determine if a rule should execute
 */
export interface RuleCondition {
  /** Name of condition */
  condition_id: string;
  
  /** Type of condition */
  condition_type: 'STAGE' | 'PREVIOUS_RESULT' | 'EVIDENCE_EXISTS' | 'CUSTOM';
  
  /** Condition expression or reference */
  expression: string;
  
  /** Human description */
  description: string;
}

/**
 * Evidence Requirement - Specification of needed evidence
 */
export interface EvidenceRequirement {
  /** Type of evidence needed */
  evidence_type: string;
  
  /** Required or optional */
  mandatory: boolean;
  
  /** Minimum confidence threshold (0-1) */
  min_confidence: number;
  
  /** Description of requirement */
  description: string;
}

/**
 * Compiled Executable Form of Rule
 * 
 * Rules must be compiled to an executable form.
 * This is created by RuleCompiler and executed by RuleExecutor.
 * Must be deterministic and versionable.
 */
export interface RuleExecutable {
  /** Version of compiler that created this */
  compiler_version: string;
  
  /** Timestamp of compilation */
  compiled_at: Date;
  
  /** Serialized executable code (deterministic function) */
  compiled_code: string;
  
  /** Language/format of compiled code */
  language: 'typescript' | 'json-logic' | 'sql';
  
  /** AST or intermediate representation (optional, for inspection) */
  ast?: any;
  
  /** Hash for integrity verification */
  code_hash: string;
}

/**
 * Rule Execution Result
 * 
 * Immutable record of a rule execution.
 * Includes evidence references for auditability.
 */
export interface RuleResult {
  // Identity
  result_id: string;
  rule_id: string;
  rule_version: string;
  
  // Execution context
  evaluation_id: string;
  tender_id: string;
  bid_id: string;
  bidder_id: string;
  executed_by: string;
  executed_at: Date;
  
  // Outcome
  status: RuleResultStatus;
  confidence: number;  // 0-1, where 1 = deterministic
  
  // Evidence & Calculation
  evidence_used: EvidenceReference[];
  calculation_details: CalculationDetails;
  output: any;  // Matches output_schema
  
  // Error handling
  error?: RuleError;
  
  // Audit
  audit_signature: string;  // Cryptographic signature
  replayed: boolean;  // True if this is a replay
}

/**
 * Reference to evidence used in rule execution
 */
export interface EvidenceReference {
  evidence_id: string;
  document_id: string;
  page?: number;
  section?: string;
  extracted_value: string;
  confidence: number;
}

/**
 * Details of calculation for auditability
 */
export interface CalculationDetails {
  /** Steps of calculation */
  steps: CalculationStep[];
  
  /** Intermediate values */
  values: Record<string, any>;
  
  /** Any formulas or logic applied */
  logic_description: string;
}

/**
 * Single step in calculation
 */
export interface CalculationStep {
  step_number: number;
  operation: string;
  input_values: any[];
  output_value: any;
  description: string;
}

/**
 * Rule Execution Error
 */
export interface RuleError {
  error_code: string;
  error_message: string;
  error_details: any;
}

/**
 * Rule Version Record
 * 
 * Immutable history of rule changes.
 */
export interface RuleVersion {
  version: string;
  rule_id: string;
  created_at: Date;
  created_by: string;
  
  /** Reason for new version */
  change_reason: string;
  
  /** Legal update that triggered version */
  legal_update?: string;
  
  /** Tender-specific change */
  tender_update?: string;
  
  /** Full rule definition at this version */
  rule_content: Rule;
}

/**
 * Compiled Rule Set
 * 
 * All rules compiled for a stage, ready for execution.
 */
export interface CompiledRuleSet {
  stage: EvaluationStage;
  compiled_at: Date;
  rules: Map<string, Rule>;  // rule_id -> Rule
  executables: Map<string, RuleExecutable>;  // rule_id -> Executable
  execution_order: string[];  // rule_ids in sequence order
}

/**
 * Rule Validation Result
 */
export interface RuleValidation {
  is_valid: boolean;
  errors: RuleValidationError[];
  warnings: RuleValidationWarning[];
}

/**
 * Rule Validation Error
 */
export interface RuleValidationError {
  field: string;
  error: string;
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Rule Validation Warning
 */
export interface RuleValidationWarning {
  field: string;
  warning: string;
}

/**
 * Execution Context
 * 
 * Context required for rule execution.
 * Immutable during execution for determinism.
 */
export interface ExecutionContext {
  /** Evaluation ID this execution is part of */
  evaluation_id: string;
  
  /** Tender being evaluated */
  tender_id: string;
  tender_version: string;
  
  /** Bid being evaluated */
  bid_id: string;
  
  /** Bidder */
  bidder_id: string;
  bidder_name: string;
  
  /** Who is executing the rules */
  executed_by: string;
  
  /** When execution started */
  execution_timestamp: Date;
  
  /** Applicable date for temporal rules (usually tender closing date) */
  applicable_date: Date;
  
  /** Tender evaluation criteria (for requirement matching) */
  tender_criteria?: Record<string, any>;
}

/**
 * Rule Query Request
 * 
 * Used to query and retrieve rules.
 */
export interface RuleQuery {
  stage?: EvaluationStage;
  category?: RuleCategory;
  rule_id?: string;
  version?: string;
  as_of_date?: Date;
  include_expired?: boolean;
}

/**
 * Type guard: Is this a valid rule?
 */
export function isValidRule(obj: any): obj is Rule {
  return (
    obj &&
    typeof obj.rule_id === 'string' &&
    typeof obj.rule_version === 'string' &&
    typeof obj.evaluation_stage === 'string' &&
    typeof obj.legal_instrument === 'string' &&
    obj.created_at instanceof Date
  );
}

/**
 * Rule Execution Statistics
 * Used for monitoring and analysis
 */
export interface RuleExecutionStats {
  rule_id: string;
  total_executions: number;
  passed: number;
  failed: number;
  inconclusive: number;
  errors: number;
  average_execution_time_ms: number;
  last_execution_at: Date;
}
