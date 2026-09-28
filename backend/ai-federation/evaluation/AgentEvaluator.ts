// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AGENT EVALUATOR
// Continuous evaluation of agent and model performance
// ============================================================================

import { InferenceResponse, DataClassification } from '../federation/types';
import { generateId } from '../../../src/core/shared/crypto';

export interface AgentEvaluation {
  id: string;
  requestId: string;
  traceId: string;
  agentId: string;
  taskId: string;
  model: string;
  provider: string;
  qualityScore: number;      // 0-100
  factualityScore: number;   // 0-100
  citationScore: number;     // 0-100
  latencyMs: number;
  costUsd: number;
  classification: DataClassification;
  evaluatedAt: string;
}

export class AgentEvaluator {
  private static instance: AgentEvaluator;
  private evaluations: AgentEvaluation[] = [];
  private maxEvaluations = 10000;

  private constructor() {}

  public static getInstance(): AgentEvaluator {
    if (!AgentEvaluator.instance) {
      AgentEvaluator.instance = new AgentEvaluator();
    }
    return AgentEvaluator.instance;
  }

  /**
   * Evaluate an inference response
   */
  async evaluate(params: {
    requestId: string;
    traceId: string;
    agentId: string;
    taskId: string;
    response: InferenceResponse;
    classification: DataClassification;
  }): Promise<string> {
    const id = generateId('eval');

    // Evaluate quality dimensions
    const qualityScore = this.evaluateQuality(params.response);
    const factualityScore = this.evaluateFactuality(params.response);
    const citationScore = this.evaluateCitation(params.response);

    const evaluation: AgentEvaluation = {
      id,
      requestId: params.requestId,
      traceId: params.traceId,
      agentId: params.agentId,
      taskId: params.taskId,
      model: params.response.model,
      provider: params.response.provider,
      qualityScore,
      factualityScore,
      citationScore,
      latencyMs: params.response.latencyMs,
      costUsd: params.response.usage.costUsd,
      classification: params.classification,
      evaluatedAt: new Date().toISOString(),
    };

    this.evaluations.push(evaluation);
    this.evict();

    console.log(`[EVALUATOR] Evaluated [${id}] quality=${qualityScore} factuality=${factualityScore} citation=${citationScore}`);

    return id;
  }

  /**
   * Get evaluations for an agent
   */
  getAgentEvaluations(agentId: string, limit: number = 50): AgentEvaluation[] {
    return this.evaluations
      .filter(e => e.agentId === agentId)
      .slice(-limit);
  }

  /**
   * Get evaluations for a model
   */
  getModelEvaluations(model: string, limit: number = 50): AgentEvaluation[] {
    return this.evaluations
      .filter(e => e.model === model)
      .slice(-limit);
  }

  /**
   * Get aggregate statistics
   */
  getStats(): {
    totalEvaluations: number;
    averageQuality: number;
    averageFactuality: number;
    averageCitation: number;
    averageLatency: number;
    totalCostUsd: number;
    byAgent: Record<string, { count: number; avgQuality: number; avgCost: number }>;
    byModel: Record<string, { count: number; avgQuality: number; avgCost: number }>;
  } {
    const total = this.evaluations.length;
    if (total === 0) {
      return {
        totalEvaluations: 0,
        averageQuality: 0,
        averageFactuality: 0,
        averageCitation: 0,
        averageLatency: 0,
        totalCostUsd: 0,
        byAgent: {},
        byModel: {},
      };
    }

    const avgQuality = this.evaluations.reduce((s, e) => s + e.qualityScore, 0) / total;
    const avgFactuality = this.evaluations.reduce((s, e) => s + e.factualityScore, 0) / total;
    const avgCitation = this.evaluations.reduce((s, e) => s + e.citationScore, 0) / total;
    const avgLatency = this.evaluations.reduce((s, e) => s + e.latencyMs, 0) / total;
    const totalCost = this.evaluations.reduce((s, e) => s + e.costUsd, 0);

    const byAgent: Record<string, { count: number; avgQuality: number; avgCost: number }> = {};
    const byModel: Record<string, { count: number; avgQuality: number; avgCost: number }> = {};

    for (const eval_ of this.evaluations) {
      // By agent
      if (!byAgent[eval_.agentId]) byAgent[eval_.agentId] = { count: 0, avgQuality: 0, avgCost: 0 };
      byAgent[eval_.agentId].count++;
      byAgent[eval_.agentId].avgQuality += eval_.qualityScore;
      byAgent[eval_.agentId].avgCost += eval_.costUsd;

      // By model
      if (!byModel[eval_.model]) byModel[eval_.model] = { count: 0, avgQuality: 0, avgCost: 0 };
      byModel[eval_.model].count++;
      byModel[eval_.model].avgQuality += eval_.qualityScore;
      byModel[eval_.model].avgCost += eval_.costUsd;
    }

    for (const key of Object.keys(byAgent)) {
      byAgent[key].avgQuality /= byAgent[key].count;
      byAgent[key].avgCost /= byAgent[key].count;
    }
    for (const key of Object.keys(byModel)) {
      byModel[key].avgQuality /= byModel[key].count;
      byModel[key].avgCost /= byModel[key].count;
    }

    return {
      totalEvaluations: total,
      averageQuality: avgQuality,
      averageFactuality: avgFactuality,
      averageCitation: avgCitation,
      averageLatency: avgLatency,
      totalCostUsd: totalCost,
      byAgent,
      byModel,
    };
  }

  private evaluateQuality(response: InferenceResponse): number {
    let score = 50; // baseline

    // Length-based quality signal (very short = lower quality)
    if (response.text.length > 200) score += 15;
    if (response.text.length > 500) score += 10;
    if (response.text.length > 1000) score += 5;

    // Structure-based quality signal
    if (response.text.includes('#')) score += 5; // has headings
    if (response.text.includes('- ') || response.text.includes('* ')) score += 5; // has lists
    if (response.text.includes('\n\n')) score += 5; // has paragraphs

    // Finish reason
    if (response.finishReason === 'STOP') score += 10;
    if (response.finishReason === 'MAX_TOKENS') score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  private evaluateFactuality(response: InferenceResponse): number {
    let score = 60; // baseline

    // Hedging language (indicates uncertainty = lower factuality)
    const hedgingPatterns = ['might', 'possibly', 'could be', 'perhaps', 'it seems', 'maybe'];
    const hedgeCount = hedgingPatterns.filter(p => response.text.toLowerCase().includes(p)).length;
    score -= hedgeCount * 5;

    // Specific numbers and dates (indicates precision)
    const numberMatches = response.text.match(/\d+/g);
    if (numberMatches && numberMatches.length > 3) score += 10;

    // Citation patterns
    if (response.text.includes('[') && response.text.includes(']')) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private evaluateCitation(response: InferenceResponse): number {
    let score = 30; // baseline (no citations)

    // Check for source references
    if (response.text.includes('Source:')) score += 20;
    if (response.text.includes('According to')) score += 15;
    if (response.text.includes('Based on')) score += 10;
    if (response.text.includes('[') && response.text.includes(']')) score += 15;

    return Math.min(100, Math.max(0, score));
  }

  private evict(): void {
    if (this.evaluations.length > this.maxEvaluations) {
      this.evaluations = this.evaluations.slice(-this.maxEvaluations / 2);
    }
  }
}
