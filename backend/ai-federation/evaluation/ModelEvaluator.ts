// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — MODEL EVALUATOR
// Benchmarks and continuous model evaluation
// ============================================================================

import { ModelEvaluation } from '../federation/types';
import { ModelRegistry } from '../registry/ModelRegistry';
import { generateId } from '../../../src/core/shared/crypto';

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  domain: string;
  testCases: Array<{
    input: string;
    expectedOutput?: string;
    criteria: string[];
  }>;
}

// Pre-defined benchmarks for KETRACO
export const ENTERPRISE_BENCHMARKS: Benchmark[] = [
  {
    id: 'BENCH-LEGAL-001',
    name: 'Legal Compliance Analysis',
    description: 'Evaluate ability to analyze legal and regulatory compliance',
    domain: 'PROCUREMENT',
    testCases: [
      {
        input: 'Analyze the following tender clause for PPADA compliance: "The contractor shall deliver all equipment within 90 days of contract signing."',
        criteria: ['identifies relevant regulations', 'provides compliance assessment', 'cites specific provisions'],
      },
    ],
  },
  {
    id: 'BENCH-REASONING-001',
    name: 'Multi-step Reasoning',
    description: 'Evaluate multi-step logical reasoning capability',
    domain: 'GENERAL',
    testCases: [
      {
        input: 'If transformer A feeds substation B, and substation B feeds feeder C, and feeder C has a fault, what is the impact chain?',
        criteria: ['correct causal chain', 'identifies affected entities', 'provides impact assessment'],
      },
    ],
  },
  {
    id: 'BENCH-STRUCTURED-001',
    name: 'Structured Output Quality',
    description: 'Evaluate ability to produce valid structured output',
    domain: 'GENERAL',
    testCases: [
      {
        input: 'Create a JSON object with fields: supplier_name, risk_score (0-100), risk_factors (array), recommendation (string)',
        criteria: ['valid JSON', 'all required fields present', 'correct data types'],
      },
    ],
  },
];

export class ModelEvaluator {
  private static instance: ModelEvaluator;
  private modelRegistry: ModelRegistry;
  private evaluations: ModelEvaluation[] = [];

  private constructor() {
    this.modelRegistry = ModelRegistry.getInstance();
  }

  public static getInstance(): ModelEvaluator {
    if (!ModelEvaluator.instance) {
      ModelEvaluator.instance = new ModelEvaluator();
    }
    return ModelEvaluator.instance;
  }

  /**
   * Record a model evaluation result
   */
  recordEvaluation(evaluation: Omit<ModelEvaluation, 'id'>): string {
    const id = generateId('meval');
    const fullEvaluation: ModelEvaluation = {
      ...evaluation,
      evaluatedAt: new Date().toISOString(),
    };

    this.evaluations.push(fullEvaluation);
    this.modelRegistry.recordEvaluation(evaluation.modelId, fullEvaluation);

    return id;
  }

  /**
   * Get evaluations for a model
   */
  getModelEvaluations(modelId: string): ModelEvaluation[] {
    return this.evaluations.filter(e => e.modelId === modelId);
  }

  /**
   * Get benchmark results
   */
  getBenchmarkResults(benchmarkId: string): ModelEvaluation[] {
    return this.evaluations.filter(e => e.benchmarkId === benchmarkId);
  }

  /**
   * Get model rankings by benchmark
   */
  getModelRankings(benchmarkId: string): Array<{
    modelId: string;
    providerId: string;
    averageScore: number;
    evaluationCount: number;
  }> {
    const modelScores: Map<string, { providerId: string; scores: number[] }> = new Map();

    for (const eval_ of this.evaluations.filter(e => e.benchmarkId === benchmarkId)) {
      if (!modelScores.has(eval_.modelId)) {
        modelScores.set(eval_.modelId, { providerId: eval_.providerId, scores: [] });
      }
      modelScores.get(eval_.modelId)!.scores.push(eval_.qualityScore);
    }

    const rankings = Array.from(modelScores.entries()).map(([modelId, data]) => ({
      modelId,
      providerId: data.providerId,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      evaluationCount: data.scores.length,
    }));

    rankings.sort((a, b) => b.averageScore - a.averageScore);
    return rankings;
  }

  /**
   * Get all available benchmarks
   */
  getBenchmarks(): Benchmark[] {
    return [...ENTERPRISE_BENCHMARKS];
  }

  /**
   * Get aggregate evaluation statistics
   */
  getStats(): {
    totalEvaluations: number;
    averageQuality: number;
    averageFactuality: number;
    averageHallucinationRate: number;
    totalModelsEvaluated: number;
    benchmarkBreakdown: Record<string, number>;
  } {
    const total = this.evaluations.length;
    if (total === 0) {
      return {
        totalEvaluations: 0,
        averageQuality: 0,
        averageFactuality: 0,
        averageHallucinationRate: 0,
        totalModelsEvaluated: 0,
        benchmarkBreakdown: {},
      };
    }

    const models = new Set(this.evaluations.map(e => e.modelId));
    const benchmarkBreakdown: Record<string, number> = {};
    for (const eval_ of this.evaluations) {
      benchmarkBreakdown[eval_.benchmarkId] = (benchmarkBreakdown[eval_.benchmarkId] || 0) + 1;
    }

    return {
      totalEvaluations: total,
      averageQuality: this.evaluations.reduce((s, e) => s + e.qualityScore, 0) / total,
      averageFactuality: this.evaluations.reduce((s, e) => s + e.factualityScore, 0) / total,
      averageHallucinationRate: this.evaluations.reduce((s, e) => s + e.hallucinationRate, 0) / total,
      totalModelsEvaluated: models.size,
      benchmarkBreakdown,
    };
  }
}
