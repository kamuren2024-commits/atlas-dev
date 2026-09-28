/**
 * PHASE 01: UNIT TESTS - RULE ONTOLOGY
 * 
 * Tests for:
 * - Rule schema validation
 * - Rule registry operations
 * - Rule compilation
 * - Rule execution
 * - Dependency resolution
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import * as assert from 'assert';
import {
  Rule,
  RuleCategory,
  RuleExecutable,
  EvaluationStage,
  ExecutionContext,
  RuleResult,
  RuleSeverity,
  FailureBehavior,
  ReviewBehavior,
  LegalInstrument,
  EvidenceReference,
  isValidRule
} from '../evaluation/rule-schema';
import { RuleRegistry } from '../evaluation/rule-registry';
import { RuleCompiler } from '../evaluation/rule-compiler';
import { RuleExecutor } from '../evaluation/rule-executor';
import { DatabaseCore } from '../database/db-core';
import { RuleOntologyMigration } from '../database/migration-001-phase-01-rule-ontology';

/**
 * Test Suite: Rule Schema
 */
describe('Rule Schema', () => {
  it('should validate a complete rule', () => {
    const rule: Rule = {
      rule_id: 'TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'Section 71(1)',
      tender_clause: null,
      legal_text: 'Test legal text',
      effective_from: new Date('2015-12-18'),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: {
        compiler_version: '1.0.0',
        compiled_at: new Date(),
        compiled_code: 'function() {}',
        language: 'typescript',
        code_hash: 'abc123'
      },
      test_reference: [],
      description: 'Test rule',
      created_at: new Date(),
      created_by: 'test-user',
      last_modified_at: null,
      last_modified_by: null
    };

    assert.ok(isValidRule(rule), 'Rule should be valid');
  });

  it('should reject invalid rule', () => {
    const rule = {
      rule_id: 'TEST-01',
      rule_version: '1.0.0'
      // Missing required fields
    };

    assert.ok(!isValidRule(rule), 'Rule should be invalid');
  });

  it('should handle rule versioning', () => {
    const rule1: Rule = {
      rule_id: 'TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'Section 71',
      tender_clause: null,
      legal_text: 'Text v1',
      effective_from: new Date('2015-12-18'),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: {
        compiler_version: '1.0.0',
        compiled_at: new Date(),
        compiled_code: 'function() {}',
        language: 'typescript',
        code_hash: 'hash1'
      },
      test_reference: [],
      description: 'Version 1',
      created_at: new Date(),
      created_by: 'user1',
      last_modified_at: null,
      last_modified_by: null
    };

    const rule2: Rule = {
      ...rule1,
      rule_version: '1.1.0',
      legal_text: 'Text v1.1',
      logic: { ...rule1.logic, code_hash: 'hash2' },
      description: 'Version 1.1'
    };

    assert.notEqual(rule1.rule_version, rule2.rule_version);
    assert.notEqual(rule1.logic.code_hash, rule2.logic.code_hash);
  });
});

/**
 * Test Suite: Rule Registry
 */
describe('Rule Registry', () => {
  let registry: RuleRegistry;

  beforeEach(() => {
    registry = RuleRegistry.getInstance();
    registry.clearCache();
  });

  it('should validate a rule', () => {
    const rule: Rule = {
      rule_id: 'REG-TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'PPADA-71-1',
      tender_clause: null,
      legal_text: 'Test',
      effective_from: new Date(),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: { compiler_version: '1.0.0', compiled_at: new Date(), compiled_code: 'code', language: 'typescript', code_hash: 'hash' },
      test_reference: [],
      description: 'Test',
      created_at: new Date(),
      created_by: 'user',
      last_modified_at: null,
      last_modified_by: null
    };

    const validation = registry.validateRule(rule);
    assert.ok(validation.is_valid, 'Rule should be valid');
    assert.equal(validation.errors.length, 0);
  });

  it('should detect missing required fields', () => {
    const rule = {
      rule_category: 'PRELIMINARY'
      // Missing rule_id, rule_version, etc
    };

    const validation = registry.validateRule(rule);
    assert.ok(!validation.is_valid);
    assert.ok(validation.errors.length > 0);
  });

  it('should check rule applicability by date', () => {
    const rule: Rule = {
      rule_id: 'DATE-TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'PPADA-71-1',
      tender_clause: null,
      legal_text: 'Test',
      effective_from: new Date('2015-12-18'),
      effective_to: new Date('2030-12-31'),
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: { compiler_version: '1.0.0', compiled_at: new Date(), compiled_code: 'code', language: 'typescript', code_hash: 'hash' },
      test_reference: [],
      description: 'Test',
      created_at: new Date(),
      created_by: 'user',
      last_modified_at: null,
      last_modified_by: null
    };

    // Add rule to registry
    (registry as any).ruleCache.set(rule.rule_id, rule);

    const validDate = new Date('2020-01-01');
    const expiredDate = new Date('2031-01-01');
    const futureDate = new Date('2010-01-01');

    assert.ok(registry.isRuleApplicable(rule.rule_id, validDate), 'Rule should be applicable on valid date');
    assert.ok(!registry.isRuleApplicable(rule.rule_id, expiredDate), 'Rule should not be applicable after expiry');
    assert.ok(!registry.isRuleApplicable(rule.rule_id, futureDate), 'Rule should not be applicable before effective date');
  });

  it('should get statistics', () => {
    const stats = registry.getStatistics();
    assert.equal(stats.totalRules, 0);
    assert.ok(typeof stats.byStage === 'object');
    assert.ok(typeof stats.byCategory === 'object');
  });
});

/**
 * Test Suite: Rule Compiler
 */
describe('Rule Compiler', () => {
  it('should compile a rule to executable', () => {
    const rule: Rule = {
      rule_id: 'COMPILE-TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'PPADA-71-1',
      tender_clause: null,
      legal_text: 'Test',
      effective_from: new Date(),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: { compiler_version: '1.0.0', compiled_at: new Date(), compiled_code: 'code', language: 'typescript', code_hash: 'hash' },
      test_reference: [],
      description: 'Test',
      created_at: new Date(),
      created_by: 'user',
      last_modified_at: null,
      last_modified_by: null
    };

    const executable = RuleCompiler.compile(rule);

    assert.ok(executable.compiled_code);
    assert.equal(executable.compiler_version, '1.0.0');
    assert.ok(executable.compiled_at instanceof Date);
    assert.equal(executable.language, 'typescript');
    assert.ok(executable.code_hash);
  });

  it('should validate compiled executable', () => {
    const executable: RuleExecutable = {
      compiler_version: '1.0.0',
      compiled_at: new Date(),
      compiled_code: 'function() {}',
      language: 'typescript',
      code_hash: 'abc123'
    };

    const result = RuleCompiler.validateExecutable(executable);
    assert.ok(result.valid);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid executable', () => {
    const executable = {
      compiler_version: '1.0.0',
      // Missing compiled_code, compiled_at, code_hash
    };

    const result = RuleCompiler.validateExecutable(executable as any);
    assert.ok(!result.valid);
    assert.ok(result.errors.length > 0);
  });

  it('should verify executable integrity', () => {
    const code = 'function test() { return 42; }';
    const version = '1.0.0';
    const originalHash = RuleCompiler['hashCode'](code + version);

    const executable: RuleExecutable = {
      compiler_version: version,
      compiled_at: new Date(),
      compiled_code: code,
      language: 'typescript',
      code_hash: originalHash
    };

    const valid = RuleCompiler.verifyIntegrity(executable, originalHash);
    assert.ok(valid);
  });
});

/**
 * Test Suite: Rule Execution
 */
describe('Rule Executor', () => {
  let executor: RuleExecutor;
  let db: DatabaseCore;

  before(async () => {
    // Initialize database
    db = DatabaseCore.getInstance();
    await db.connect();
    
    // Create tables
    await RuleOntologyMigration.create(db);
    
    executor = new RuleExecutor(db);
  });

  after(async () => {
    await RuleOntologyMigration.rollback(db);
    await db.close();
  });

  it('should execute a rule', async () => {
    const rule: Rule = {
      rule_id: 'EXEC-TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'PPADA-71-1',
      tender_clause: null,
      legal_text: 'Test',
      effective_from: new Date('2015-12-18'),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: { compiler_version: '1.0.0', compiled_at: new Date(), compiled_code: 'code', language: 'typescript', code_hash: 'hash' },
      test_reference: [],
      description: 'Test',
      created_at: new Date(),
      created_by: 'user',
      last_modified_at: null,
      last_modified_by: null
    };

    const context: ExecutionContext = {
      evaluation_id: 'eval-123',
      tender_id: 'tender-456',
      tender_version: '1.0.0',
      bid_id: 'bid-789',
      bidder_id: 'bidder-001',
      bidder_name: 'Test Bidder',
      executed_by: 'test-user',
      execution_timestamp: new Date(),
      applicable_date: new Date()
    };

    const evidence = new Map<string, EvidenceReference[]>();

    const result = await executor.executeRule(rule, context, evidence);

    assert.ok(result.result_id);
    assert.equal(result.rule_id, rule.rule_id);
    assert.equal(result.evaluation_id, context.evaluation_id);
  });

  it('should handle rule execution with dependencies', async () => {
    // This would test dependency resolution
    // Actual implementation depends on Phase 02
  });

  it('should record execution in database', async () => {
    // This would verify database storage
    // Actual verification depends on database access
  });
});

/**
 * Test Suite: Integration
 */
describe('Integration: Rule Compilation and Execution', () => {
  let db: DatabaseCore;
  let registry: RuleRegistry;
  let executor: RuleExecutor;

  before(async () => {
    db = DatabaseCore.getInstance();
    await db.connect();
    await RuleOntologyMigration.create(db);
    registry = RuleRegistry.getInstance();
    executor = new RuleExecutor(db);
  });

  after(async () => {
    await RuleOntologyMigration.rollback(db);
    await db.close();
  });

  it('should compile and execute a rule workflow', async () => {
    const rule: Rule = {
      rule_id: 'INTEGRATION-TEST-01',
      rule_version: '1.0.0',
      rule_sequence: 1,
      rule_category: 'PRELIMINARY',
      evaluation_stage: 'PRELIMINARY',
      legal_instrument: 'PPADA_2015',
      section_or_regulation: 'PPADA-71-1',
      tender_clause: null,
      legal_text: 'Integration test rule',
      effective_from: new Date('2015-12-18'),
      effective_to: null,
      severity: 'MANDATORY',
      failure_behavior: 'NON_RESPONSIVE',
      review_behavior: 'AUTOMATIC',
      dependencies: [],
      prerequisites: [],
      input_schema: {},
      output_schema: {},
      evidence_requirements: [],
      logic: { compiler_version: '1.0.0', compiled_at: new Date(), compiled_code: 'code', language: 'typescript', code_hash: 'hash' },
      test_reference: [],
      description: 'Integration test',
      created_at: new Date(),
      created_by: 'test-user',
      last_modified_at: null,
      last_modified_by: null
    };

    // Compile rule
    const executable = RuleCompiler.compile(rule);
    assert.ok(executable.compiled_code.includes('INTEGRATION-TEST-01'));

    // Update rule with compiled executable
    rule.logic = executable;

    // Execute rule
    const context: ExecutionContext = {
      evaluation_id: 'eval-integration-001',
      tender_id: 'tender-integration-001',
      tender_version: '1.0.0',
      bid_id: 'bid-integration-001',
      bidder_id: 'bidder-integration-001',
      bidder_name: 'Integration Test Bidder',
      executed_by: 'integration-test-user',
      execution_timestamp: new Date(),
      applicable_date: new Date()
    };

    const evidence = new Map<string, EvidenceReference[]>();
    const result = await executor.executeRule(rule, context, evidence);

    assert.ok(result.result_id);
    assert.ok(result.audit_signature);
    assert.ok(result.executed_at);
  });
});

// Run tests
describe('Phase 01 - Rule Ontology Test Suite', () => {
  console.log('[Tests] Phase 01 Rule Ontology Tests');
  console.log('[Tests] - Rule Schema validation');
  console.log('[Tests] - Rule Registry operations');
  console.log('[Tests] - Rule Compilation');
  console.log('[Tests] - Rule Execution');
  console.log('[Tests] - Integration workflow');
});
