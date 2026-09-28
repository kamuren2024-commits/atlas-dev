/**
 * PHASE 01: EETF RULE ONTOLOGY - RULE REGISTRY
 * 
 * Singleton registry for managing all EETF evaluation rules.
 * Responsible for:
 * - Rule registration and versioning
 * - Rule retrieval by stage, category, or ID
 * - Validation of rule definitions
 * - Dependency resolution
 * - Applicability checking
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import { DatabaseCore } from '../database/db-core';
import {
  Rule,
  RuleQuery,
  RuleVersion,
  RuleValidation,
  RuleValidationError,
  RuleValidationWarning,
  EvaluationStage,
  RuleCategory,
  isValidRule
} from './rule-schema';
import { getLegalSection } from './legal-framework';

/**
 * RuleRegistry - Singleton
 * 
 * Thread-safe (single-threaded Node.js) rule management.
 * Maintains in-memory cache for performance.
 */
export class RuleRegistry {
  private static instance: RuleRegistry;
  
  /** In-memory rule cache: rule_id -> Rule */
  private ruleCache: Map<string, Rule> = new Map();
  
  /** Version history: rule_id -> RuleVersion[] */
  private versionHistory: Map<string, RuleVersion[]> = new Map();
  
  /** Stage index: stage -> rule_ids[] */
  private stageIndex: Map<EvaluationStage, Set<string>> = new Map();
  
  /** Category index: category -> rule_ids[] */
  private categoryIndex: Map<RuleCategory, Set<string>> = new Map();
  
  /** Initialization flag */
  private initialized: boolean = false;

  private constructor() {
    // Initialize indices
    const stages: EvaluationStage[] = [
      'INTAKE', 'CLASSIFICATION', 'OCR', 'METADATA', 'LEGAL_VALIDATION',
      'PRELIMINARY', 'RESPONSIVENESS', 'TECHNICAL', 'FINANCIAL',
      'DUE_DILIGENCE', 'CROSS_VALIDATION', 'RECOMMENDATION',
      'OFFICER_APPROVAL', 'POST_QUALIFICATION', 'AWARD'
    ];
    stages.forEach(stage => this.stageIndex.set(stage, new Set()));
    
    const categories: RuleCategory[] = [
      'PRELIMINARY', 'RESPONSIVENESS', 'TECHNICAL', 'FINANCIAL', 'TEMPORAL', 'DUE_DILIGENCE'
    ];
    categories.forEach(cat => this.categoryIndex.set(cat, new Set()));
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      RuleRegistry.instance = new RuleRegistry();
    }
    return RuleRegistry.instance;
  }

  /**
   * Initialize registry from database
   * Should be called once at application startup
   */
  public async initialize(db: DatabaseCore): Promise<void> {
    if (this.initialized) {
      console.warn('RuleRegistry already initialized');
      return;
    }

    try {
      // Load all rules from database
      const rows = await db.all(`
        SELECT * FROM rules
        WHERE effective_to IS NULL OR effective_to > datetime('now')
        ORDER BY evaluation_stage, rule_sequence, rule_id
      `);

      for (const row of rows) {
        const rule = this.deserializeRule(row);
        this.ruleCache.set(rule.rule_id, rule);
        this.indexRule(rule);
      }

      this.initialized = true;
      console.log(`[RuleRegistry] Loaded ${this.ruleCache.size} active rules`);
    } catch (error) {
      console.error('[RuleRegistry] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Register a new rule or update existing
   */
  public async registerRule(rule: Rule, db: DatabaseCore, createdBy: string): Promise<void> {
    // Validate rule
    const validation = this.validateRule(rule);
    if (!validation.is_valid) {
      throw new Error(`Rule validation failed: ${JSON.stringify(validation.errors)}`);
    }

    // Check if rule exists
    const existing = this.ruleCache.get(rule.rule_id);
    if (existing && existing.rule_version === rule.rule_version) {
      throw new Error(`Rule ${rule.rule_id} version ${rule.rule_version} already exists`);
    }

    // Store in database
    await db.run(`
      INSERT OR REPLACE INTO rules (
        rule_id, rule_version, rule_sequence, rule_category, evaluation_stage,
        legal_instrument, section_or_regulation, tender_clause, legal_text,
        effective_from, effective_to, severity, failure_behavior, review_behavior,
        dependencies, prerequisites, input_schema, output_schema, evidence_requirements,
        compiled_code, compiled_version, created_at, created_by, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      rule.rule_id,
      rule.rule_version,
      rule.rule_sequence,
      rule.rule_category,
      rule.evaluation_stage,
      rule.legal_instrument,
      rule.section_or_regulation,
      rule.tender_clause,
      rule.legal_text,
      rule.effective_from.toISOString(),
      rule.effective_to?.toISOString() || null,
      rule.severity,
      rule.failure_behavior,
      rule.review_behavior,
      JSON.stringify(rule.dependencies),
      JSON.stringify(rule.prerequisites),
      JSON.stringify(rule.input_schema),
      JSON.stringify(rule.output_schema),
      JSON.stringify(rule.evidence_requirements),
      rule.logic.compiled_code,
      rule.logic.compiler_version,
      rule.created_at.toISOString(),
      createdBy,
      rule.description
    ]);

    // Store version record
    const version: RuleVersion = {
      version: rule.rule_version,
      rule_id: rule.rule_id,
      created_at: rule.created_at,
      created_by: createdBy,
      change_reason: rule.description,
      rule_content: rule
    };

    await db.run(`
      INSERT INTO rule_versions (rule_id, version, created_at, created_by, content_json)
      VALUES (?, ?, ?, ?, ?)
    `, [
      rule.rule_id,
      rule.rule_version,
      rule.created_at.toISOString(),
      createdBy,
      JSON.stringify(version)
    ]);

    // Update cache
    this.ruleCache.set(rule.rule_id, rule);
    this.indexRule(rule);

    // Update version history
    if (!this.versionHistory.has(rule.rule_id)) {
      this.versionHistory.set(rule.rule_id, []);
    }
    this.versionHistory.get(rule.rule_id)!.push(version);
  }

  /**
   * Get rule by ID and version
   */
  public getRule(ruleId: string, version?: string): Rule | undefined {
    const rule = this.ruleCache.get(ruleId);
    if (!rule) return undefined;
    
    if (version && rule.rule_version !== version) {
      // Would need to load from database or version history
      return undefined;
    }
    
    return rule;
  }

  /**
   * Get all rules for a stage
   */
  public getStageRules(stage: EvaluationStage): Rule[] {
    const ruleIds = this.stageIndex.get(stage) || new Set();
    return Array.from(ruleIds)
      .map(id => this.ruleCache.get(id)!)
      .filter(Boolean)
      .sort((a, b) => a.rule_sequence - b.rule_sequence);
  }

  /**
   * Get all rules for a category
   */
  public getCategoryRules(category: RuleCategory): Rule[] {
    const ruleIds = this.categoryIndex.get(category) || new Set();
    return Array.from(ruleIds)
      .map(id => this.ruleCache.get(id)!)
      .filter(Boolean);
  }

  /**
   * Query rules with filters
   */
  public queryRules(query: RuleQuery): Rule[] {
    let results = Array.from(this.ruleCache.values());

    if (query.stage) {
      results = results.filter(r => r.evaluation_stage === query.stage);
    }

    if (query.category) {
      results = results.filter(r => r.rule_category === query.category);
    }

    if (query.rule_id) {
      results = results.filter(r => r.rule_id === query.rule_id);
    }

    if (query.as_of_date) {
      results = results.filter(r => {
        const effective = r.effective_from <= query.as_of_date!;
        const expired = r.effective_to && r.effective_to < query.as_of_date!;
        return effective && !expired;
      });
    }

    if (!query.include_expired) {
      const now = new Date();
      results = results.filter(r => !r.effective_to || r.effective_to > now);
    }

    return results;
  }

  /**
   * Get rules that must execute before a given rule
   */
  public getDependencies(ruleId: string): Rule[] {
    const rule = this.getRule(ruleId);
    if (!rule) return [];

    return rule.dependencies
      .map(depId => this.getRule(depId))
      .filter((r): r is Rule => r !== undefined);
  }

  /**
   * Get dependency graph for a rule
   */
  public getDependencyGraph(ruleId: string): Map<string, Rule[]> {
    const graph = new Map<string, Rule[]>();
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = this.getDependencies(id);
      graph.set(id, deps);

      deps.forEach(dep => traverse(dep.rule_id));
    };

    traverse(ruleId);
    return graph;
  }

  /**
   * Check if a rule is applicable given an execution date
   */
  public isRuleApplicable(ruleId: string, asOfDate: Date): boolean {
    const rule = this.getRule(ruleId);
    if (!rule) return false;

    const effective = rule.effective_from <= asOfDate;
    const expired = rule.effective_to && rule.effective_to < asOfDate;

    return effective && !expired;
  }

  /**
   * Validate a rule definition
   */
  public validateRule(rule: Partial<Rule>): RuleValidation {
    const errors: RuleValidationError[] = [];
    const warnings: RuleValidationWarning[] = [];

    // Required fields
    if (!rule.rule_id) {
      errors.push({ field: 'rule_id', error: 'Missing rule_id', severity: 'CRITICAL' });
    }
    if (!rule.rule_version) {
      errors.push({ field: 'rule_version', error: 'Missing rule_version', severity: 'CRITICAL' });
    }
    if (!rule.evaluation_stage) {
      errors.push({ field: 'evaluation_stage', error: 'Missing evaluation_stage', severity: 'CRITICAL' });
    }
    if (!rule.legal_instrument) {
      errors.push({ field: 'legal_instrument', error: 'Missing legal_instrument', severity: 'CRITICAL' });
    }

    // Legal section validation
    if (rule.section_or_regulation) {
      const section = getLegalSection(rule.section_or_regulation);
      if (!section) {
        warnings.push({
          field: 'section_or_regulation',
          warning: `Section ${rule.section_or_regulation} not found in legal framework`
        });
      }
    }

    // Schema validation
    if (!rule.input_schema) {
      warnings.push({
        field: 'input_schema',
        warning: 'input_schema recommended for type safety'
      });
    }
    if (!rule.output_schema) {
      warnings.push({
        field: 'output_schema',
        warning: 'output_schema recommended for type safety'
      });
    }

    // Logic validation
    if (!rule.logic) {
      errors.push({ field: 'logic', error: 'Missing compiled logic', severity: 'CRITICAL' });
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Private: Add rule to indices
   */
  private indexRule(rule: Rule): void {
    const stageSet = this.stageIndex.get(rule.evaluation_stage);
    if (stageSet) stageSet.add(rule.rule_id);

    const categorySet = this.categoryIndex.get(rule.rule_category);
    if (categorySet) categorySet.add(rule.rule_id);
  }

  /**
   * Private: Deserialize rule from database row
   */
  private deserializeRule(row: any): Rule {
    return {
      rule_id: row.rule_id,
      rule_version: row.rule_version,
      rule_sequence: row.rule_sequence,
      rule_category: row.rule_category,
      evaluation_stage: row.evaluation_stage,
      legal_instrument: row.legal_instrument,
      section_or_regulation: row.section_or_regulation,
      tender_clause: row.tender_clause,
      legal_text: row.legal_text,
      effective_from: new Date(row.effective_from),
      effective_to: row.effective_to ? new Date(row.effective_to) : null,
      severity: row.severity,
      failure_behavior: row.failure_behavior,
      review_behavior: row.review_behavior,
      dependencies: JSON.parse(row.dependencies || '[]'),
      prerequisites: JSON.parse(row.prerequisites || '[]'),
      input_schema: JSON.parse(row.input_schema || '{}'),
      output_schema: JSON.parse(row.output_schema || '{}'),
      evidence_requirements: JSON.parse(row.evidence_requirements || '[]'),
      logic: {
        compiler_version: row.compiled_version,
        compiled_at: new Date(row.created_at),
        compiled_code: row.compiled_code,
        language: 'typescript',
        code_hash: this.hashCode(row.compiled_code)
      },
      test_reference: JSON.parse(row.test_references || '[]'),
      description: row.description,
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      last_modified_at: row.updated_at ? new Date(row.updated_at) : null,
      last_modified_by: row.updated_by || null
    };
  }

  /**
   * Private: Simple hash for code
   */
  private hashCode(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Clear cache (for testing)
   */
  public clearCache(): void {
    this.ruleCache.clear();
    this.versionHistory.clear();
    this.stageIndex.forEach(s => s.clear());
    this.categoryIndex.forEach(s => s.clear());
    this.initialized = false;
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    totalRules: number;
    byStage: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const stats = {
      totalRules: this.ruleCache.size,
      byStage: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    this.stageIndex.forEach((rules, stage) => {
      stats.byStage[stage] = rules.size;
    });

    this.categoryIndex.forEach((rules, category) => {
      stats.byCategory[category] = rules.size;
    });

    return stats;
  }
}

// Export singleton instance getter
export function getRuleRegistry(): RuleRegistry {
  return RuleRegistry.getInstance();
}
