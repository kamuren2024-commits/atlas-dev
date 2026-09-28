/**
 * PHASE 01: EETF RULE ONTOLOGY - RULE EXECUTOR
 * 
 * Executes compiled rules and produces immutable audit trails.
 * Ensures determinism and auditability by:
 * - Using versionable rule code
 * - Recording all evidence used
 * - Generating cryptographic signatures
 * - Maintaining immutable execution records
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import * as crypto from 'crypto';
import {
  Rule,
  RuleResult,
  RuleResultStatus,
  ExecutionContext,
  EvidenceReference,
  CalculationDetails,
  CalculationStep,
  CompiledRuleSet
} from './rule-schema';
import { RuleRegistry } from './rule-registry';
import { RuleCompiler } from './rule-compiler';
import { DatabaseCore } from '../database/db-core';
import { randomUUID } from 'crypto';

/**
 * RuleExecutor - Executes compiled rules
 */
export class RuleExecutor {
  private db: DatabaseCore;
  private registry: RuleRegistry;
  private executionCache: Map<string, RuleResult> = new Map();

  constructor(db: DatabaseCore) {
    this.db = db;
    this.registry = RuleRegistry.getInstance();
  }

  /**
   * Execute a single rule
   */
  public async executeRule(
    rule: Rule,
    context: ExecutionContext,
    evidence: Map<string, EvidenceReference[]>
  ): Promise<RuleResult> {
    const startTime = Date.now();

    try {
      // Validate prerequisites
      if (!this.validatePrerequisites(rule, context)) {
        return this.createSkippedResult(rule, context, 'Prerequisites not met');
      }

      // Check if rule is applicable for this date
      if (!this.registry.isRuleApplicable(rule.rule_id, context.applicable_date)) {
        return this.createSkippedResult(rule, context, 'Rule not applicable on this date');
      }

      // Execute the rule logic
      const result = await this.executeRuleLogic(rule, context, evidence);

      // Add execution metadata
      result.executed_by = context.executed_by;
      result.executed_at = new Date();
      result.audit_signature = this.generateAuditSignature(result);

      // Store in database (immutable)
      await this.storeExecution(result);

      // Cache for replay detection
      this.executionCache.set(result.result_id, result);

      // Record statistics
      await this.recordExecutionStats(rule.rule_id, result.status, Date.now() - startTime);

      return result;
    } catch (error) {
      return this.createErrorResult(rule, context, error, Date.now() - startTime);
    }
  }

  /**
   * Execute all rules for a stage (with dependency resolution)
   */
  public async executeStage(
    stage: string,
    context: ExecutionContext,
    evidence: Map<string, EvidenceReference[]>
  ): Promise<RuleResult[]> {
    const rules = this.registry.getStageRules(stage as any);
    const results: RuleResult[] = [];

    // Sort by sequence, then resolve dependencies
    const sorted = this.topologicalSort(rules);

    for (const rule of sorted) {
      // Check dependencies from previous results
      const depsMet = this.checkDependencies(rule, results);
      if (!depsMet.met) {
        results.push(this.createBlockedResult(rule, context, depsMet.reason));
        continue;
      }

      // Execute rule
      const result = await this.executeRule(rule, context, evidence);
      results.push(result);

      // If a MANDATORY rule fails, stop processing this stage
      if (rule.severity === 'MANDATORY' && result.status === 'FAIL') {
        console.log(`[RuleExecutor] Stopping stage due to MANDATORY rule failure: ${rule.rule_id}`);
        break;
      }
    }

    return results;
  }

  /**
   * Execute all rules with full dependency resolution
   */
  public async executeWithDependencies(
    rules: Rule[],
    context: ExecutionContext,
    evidence: Map<string, EvidenceReference[]>
  ): Promise<Map<string, RuleResult>> {
    const results = new Map<string, RuleResult>();
    const processed = new Set<string>();

    // Process in topological order
    const sorted = this.topologicalSort(rules);

    for (const rule of sorted) {
      if (processed.has(rule.rule_id)) continue;

      // Check if dependencies are satisfied
      const depResults = this.checkDependencyResults(rule, results);
      if (!depResults.satisfied) {
        results.set(rule.rule_id, this.createBlockedResult(rule, context, depResults.reason));
        processed.add(rule.rule_id);
        continue;
      }

      // Execute rule
      const result = await this.executeRule(rule, context, evidence);
      results.set(rule.rule_id, result);
      processed.add(rule.rule_id);

      // Stop if MANDATORY rule fails
      if (rule.severity === 'MANDATORY' && result.status === 'FAIL') {
        break;
      }
    }

    return results;
  }

  /**
   * Replay a rule execution (for audit verification)
   */
  public async replayExecution(
    originalResult: RuleResult,
    context: ExecutionContext,
    evidence: Map<string, EvidenceReference[]>
  ): Promise<RuleResult> {
    const rule = this.registry.getRule(originalResult.rule_id, originalResult.rule_version);
    if (!rule) {
      throw new Error(`Cannot replay: Rule ${originalResult.rule_id} version ${originalResult.rule_version} not found`);
    }

    // Execute with same context and evidence
    const replayedResult = await this.executeRule(rule, context, evidence);

    // Mark as replayed for audit trail
    replayedResult.replayed = true;

    // Verify determinism: results should match
    if (replayedResult.status !== originalResult.status || 
        JSON.stringify(replayedResult.output) !== JSON.stringify(originalResult.output)) {
      console.warn(`[RuleExecutor] Non-deterministic result detected for rule ${rule.rule_id}`);
    }

    return replayedResult;
  }

  /**
   * Private: Execute rule-specific logic
   */
  private async executeRuleLogic(
    rule: Rule,
    context: ExecutionContext,
    evidence: Map<string, EvidenceReference[]>
  ): Promise<RuleResult> {
    // In Phase 01, we provide a skeleton execution framework
    // Actual rule logic will be generated by RuleCompiler and specialized in later phases

    // Check evidence requirements
    const evidenceCheck = this.verifyEvidenceRequirements(rule, evidence);
    if (!evidenceCheck.satisfied) {
      return {
        result_id: this.generateResultId(context, rule),
        rule_id: rule.rule_id,
        rule_version: rule.rule_version,
        evaluation_id: context.evaluation_id,
        tender_id: context.tender_id,
        bid_id: context.bid_id,
        bidder_id: context.bidder_id,
        executed_by: context.executed_by,
        executed_at: new Date(),
        status: 'INCONCLUSIVE',
        confidence: 0,
        evidence_used: [],
        calculation_details: {
          steps: [],
          values: {},
          logic_description: `Missing evidence: ${evidenceCheck.missing.join(', ')}`
        },
        output: null,
        audit_signature: '',
        replayed: false
      };
    }

    // TODO: In Phase 02, replace with actual rule-specific evaluation logic
    // This would invoke the compiled rule code
    return {
      result_id: this.generateResultId(context, rule),
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: 'INCONCLUSIVE',
      confidence: 0,
      evidence_used: evidence.get(rule.rule_id) || [],
      calculation_details: {
        steps: [],
        values: {},
        logic_description: 'Phase 01: Rule logic placeholder'
      },
      output: null,
      audit_signature: '',
      replayed: false
    };
  }

  /**
   * Private: Create skipped result
   */
  private createSkippedResult(rule: Rule, context: ExecutionContext, reason: string): RuleResult {
    return {
      result_id: this.generateResultId(context, rule),
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: 'INCONCLUSIVE',
      confidence: 0,
      evidence_used: [],
      calculation_details: {
        steps: [],
        values: {},
        logic_description: `Skipped: ${reason}`
      },
      output: null,
      audit_signature: this.generateAuditSignature({ skipped: true, reason }),
      replayed: false
    };
  }

  /**
   * Private: Create blocked result
   */
  private createBlockedResult(rule: Rule, context: ExecutionContext, reason: string): RuleResult {
    return {
      result_id: this.generateResultId(context, rule),
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: 'INCONCLUSIVE',
      confidence: 0,
      evidence_used: [],
      calculation_details: {
        steps: [],
        values: {},
        logic_description: `Blocked: ${reason}`
      },
      output: null,
      audit_signature: this.generateAuditSignature({ blocked: true, reason }),
      replayed: false
    };
  }

  /**
   * Private: Create error result
   */
  private createErrorResult(rule: Rule, context: ExecutionContext, error: any, executionTime: number): RuleResult {
    return {
      result_id: this.generateResultId(context, rule),
      rule_id: rule.rule_id,
      rule_version: rule.rule_version,
      evaluation_id: context.evaluation_id,
      tender_id: context.tender_id,
      bid_id: context.bid_id,
      bidder_id: context.bidder_id,
      executed_by: context.executed_by,
      executed_at: new Date(),
      status: 'ERROR',
      confidence: 0,
      evidence_used: [],
      calculation_details: {
        steps: [],
        values: {},
        logic_description: `Error: ${(error as Error).message}`
      },
      output: null,
      error: {
        error_code: 'EXECUTION_ERROR',
        error_message: (error as Error).message,
        error_details: { name: (error as Error).name }
      },
      audit_signature: this.generateAuditSignature({ error: true, message: (error as Error).message }),
      replayed: false
    };
  }

  /**
   * Private: Validate prerequisites
   */
  private validatePrerequisites(rule: Rule, context: ExecutionContext): boolean {
    // In Phase 01, all prerequisites are met (placeholder)
    // Phase 02 will implement actual prerequisite validation
    return true;
  }

  /**
   * Private: Verify evidence requirements are met
   */
  private verifyEvidenceRequirements(
    rule: Rule,
    evidence: Map<string, EvidenceReference[]>
  ): { satisfied: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const req of rule.evidence_requirements) {
      if (req.mandatory) {
        const evid = evidence.get(req.evidence_type);
        if (!evid || evid.length === 0) {
          missing.push(req.evidence_type);
        }
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    };
  }

  /**
   * Private: Check if dependencies from previous results are satisfied
   */
  private checkDependencies(rule: Rule, results: RuleResult[]): { met: boolean; reason?: string } {
    for (const depId of rule.dependencies) {
      const depResult = results.find(r => r.rule_id === depId);
      if (!depResult) {
        return { met: false, reason: `Dependency not found: ${depId}` };
      }
      if (depResult.status === 'FAIL') {
        return { met: false, reason: `Dependency failed: ${depId}` };
      }
    }
    return { met: true };
  }

  /**
   * Private: Check if dependencies are satisfied from result map
   */
  private checkDependencyResults(rule: Rule, results: Map<string, RuleResult>): { satisfied: boolean; reason?: string } {
    for (const depId of rule.dependencies) {
      const depResult = results.get(depId);
      if (!depResult) {
        return { satisfied: false, reason: `Dependency not found: ${depId}` };
      }
      if (depResult.status === 'FAIL') {
        return { satisfied: false, reason: `Dependency failed: ${depId}` };
      }
    }
    return { satisfied: true };
  }

  /**
   * Private: Topological sort of rules by dependencies
   */
  private topologicalSort(rules: Rule[]): Rule[] {
    const sorted: Rule[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (ruleId: string) => {
      if (visited.has(ruleId)) return;
      if (visiting.has(ruleId)) throw new Error(`Circular dependency detected: ${ruleId}`);

      visiting.add(ruleId);

      const rule = rules.find(r => r.rule_id === ruleId);
      if (rule) {
        for (const depId of rule.dependencies) {
          visit(depId);
        }
      }

      visiting.delete(ruleId);
      visited.add(ruleId);

      if (rule) sorted.push(rule);
    };

    for (const rule of rules) {
      visit(rule.rule_id);
    }

    // Sort by sequence
    return sorted.sort((a, b) => a.rule_sequence - b.rule_sequence);
  }

  /**
   * Private: Generate cryptographic audit signature
   */
  private generateAuditSignature(data: any): string {
    const json = JSON.stringify(data);
    return crypto.createHash('sha256').update(json).digest('hex');
  }

  /**
   * Private: Store execution in database (immutable)
   */
  private async storeExecution(result: RuleResult): Promise<void> {
    await this.db.run(`
      INSERT INTO rule_executions (
        execution_id, rule_id, rule_version, evaluation_id, tender_id, bid_id, bidder_id,
        executed_by, executed_at, status, confidence, evidence_used, calculation_details,
        output_json, error_code, error_message, audit_signature, replayed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      result.result_id,
      result.rule_id,
      result.rule_version,
      result.evaluation_id,
      result.tender_id,
      result.bid_id,
      result.bidder_id,
      result.executed_by,
      result.executed_at.toISOString(),
      result.status,
      result.confidence,
      JSON.stringify(result.evidence_used),
      JSON.stringify(result.calculation_details),
      JSON.stringify(result.output),
      result.error?.error_code || null,
      result.error?.error_message || null,
      result.audit_signature,
      result.replayed ? 1 : 0
    ]);
  }

  /**
   * Private: Record execution statistics
   */
  private async recordExecutionStats(ruleId: string, status: RuleResultStatus, executionTime: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Update or insert stats
    await this.db.run(`
      INSERT INTO rule_execution_stats (rule_id, date, total_executions, passed, failed, inconclusive, errors, avg_execution_time_ms)
      VALUES (?, ?, 1, ?, 0, 0, 0, ?)
      ON CONFLICT(rule_id, date) DO UPDATE SET
        total_executions = total_executions + 1,
        passed = passed + ?,
        avg_execution_time_ms = (avg_execution_time_ms * (total_executions - 1) + ?) / total_executions
    `, [
      ruleId,
      today,
      status === 'PASS' ? 1 : 0,
      executionTime,
      status === 'PASS' ? 1 : 0,
      executionTime
    ]);
  }

  /**
   * Private: Generate unique result ID
   */
  private generateResultId(context: ExecutionContext, rule: Rule): string {
    return `${context.evaluation_id}_${rule.rule_id}_${Date.now()}_${randomUUID().replace(/-/g, '').substring(0, 8)}`;
  }
}

/**
 * Factory function to create executor
 */
export function createRuleExecutor(db: DatabaseCore): RuleExecutor {
  return new RuleExecutor(db);
}
