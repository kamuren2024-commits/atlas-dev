// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — INTELLIGENT MODEL ROUTER
// Multi-dimensional scoring with capability-aware routing
// ============================================================================

import {
  RoutingRequest,
  RoutingDecision,
  RoutingScores,
  DataClassification,
  DeploymentPreference,
} from './types';
import { ModelRegistry, RegisteredModel } from '../registry/ModelRegistry';
import { CapabilityRegistry } from '../registry/CapabilityRegistry';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { ProviderHealthRegistry } from '../health/health-registry';

// Routing weights by mission profile
const ROUTING_WEIGHTS: Record<string, RoutingScores> = {
  DEFAULT: {
    capability: 0.30,
    quality: 0.20,
    latency: 0.15,
    cost: 0.10,
    security: 0.15,
    availability: 0.10,
    total: 0,
  },
  CRITICAL_INFRASTRUCTURE: {
    capability: 0.20,
    quality: 0.15,
    latency: 0.20,
    cost: 0.05,
    security: 0.25,
    availability: 0.15,
    total: 0,
  },
  RESEARCH_ANALYSIS: {
    capability: 0.35,
    quality: 0.25,
    latency: 0.10,
    cost: 0.05,
    security: 0.15,
    availability: 0.10,
    total: 0,
  },
  HIGH_VOLUME_AUTOMATION: {
    capability: 0.15,
    quality: 0.15,
    latency: 0.15,
    cost: 0.30,
    security: 0.10,
    availability: 0.15,
    total: 0,
  },
  CONVERSATION: {
    capability: 0.20,
    quality: 0.20,
    latency: 0.25,
    cost: 0.10,
    security: 0.10,
    availability: 0.15,
    total: 0,
  },
};

// Security classification to deployment mode mapping
const CLASSIFICATION_DEPLOYMENT: Record<DataClassification, DeploymentPreference[]> = {
  PUBLIC: ['ANY'],
  INTERNAL: ['ANY'],
  CONFIDENTIAL: ['LOCAL_OR_PRIVATE', 'CLOUD_ONLY'],
  RESTRICTED: ['LOCAL_OR_PRIVATE', 'LOCAL_ONLY'],
  TOP_SECRET: ['LOCAL_ONLY'],
  KETRACO_CRITICAL: ['LOCAL_ONLY', 'LOCAL_OR_PRIVATE'],
};

export class IntelligentRouter {
  private static instance: IntelligentRouter;
  private modelRegistry: ModelRegistry;
  private capabilityRegistry: CapabilityRegistry;
  private providerRegistry: ProviderRegistry;

  private constructor() {
    this.modelRegistry = ModelRegistry.getInstance();
    this.capabilityRegistry = CapabilityRegistry.getInstance();
    this.providerRegistry = ProviderRegistry.getInstance();
  }

  public static getInstance(): IntelligentRouter {
    if (!IntelligentRouter.instance) {
      IntelligentRouter.instance = new IntelligentRouter();
    }
    return IntelligentRouter.instance;
  }

  /**
   * Core routing decision engine
   */
  async route(request: RoutingRequest): Promise<RoutingDecision> {
    const weights = this.selectWeights(request);
    const allowedDeployments = CLASSIFICATION_DEPLOYMENT[request.dataClassification] || ['ANY'];

    // 1. Get all available models
    const allModels = this.modelRegistry.getAllRegisteredModels();

    // 2. Filter by deployment policy (security gate)
    const compliantModels = allModels.filter(model =>
      this.isDeploymentCompliant(model.identity.deploymentMode, allowedDeployments)
    );

    if (compliantModels.length === 0) {
      console.warn('[ROUTER] No compliant models for classification, falling back to local');
      return this.buildFallbackDecision('No compliant models available');
    }

    // 3. Filter by required capabilities
    const capableModels = compliantModels.filter(model =>
      this.hasRequiredCapabilities(model, request.requiredCapabilities)
    );

    if (capableModels.length === 0) {
      console.warn('[ROUTER] No models match required capabilities');
      return this.buildFallbackDecision('No models match capabilities');
    }

    // 4. Score each model
    const scored = capableModels.map(model => {
      const scores = this.scoreModel(model, request, weights);
      return { model, scores };
    });

    // 5. Sort by total score descending
    scored.sort((a, b) => b.scores.total - a.scores.total);

    const best = scored[0];
    const fallbackChain = scored.slice(1, 6).map(s => `${s.model.identity.providerId}:${s.model.identity.id}`);

    return {
      selectedProvider: best.model.identity.providerId,
      selectedModel: best.model.identity.id,
      score: best.scores.total,
      scores: best.scores,
      fallbackChain,
      reason: this.buildReason(best.scores, request),
      estimatedCost: best.model.capabilities.costPerMillionInput,
      estimatedLatency: best.model.capabilities.avgLatencyMs,
    };
  }

  /**
   * Select routing weights based on mission context
   */
  private selectWeights(request: RoutingRequest): RoutingScores {
    const mission = request.missionId?.toUpperCase() || '';
    const taskType = request.task.type;

    if (mission.includes('GRID') || mission.includes('INFRASTRUCTURE') || mission.includes('CRITICAL')) {
      return { ...ROUTING_WEIGHTS.CRITICAL_INFRASTRUCTURE };
    }
    if (taskType === 'ANALYSIS' || taskType === 'REASONING') {
      return { ...ROUTING_WEIGHTS.RESEARCH_ANALYSIS };
    }
    if (taskType === 'CLASSIFICATION' || taskType === 'EXTRACTION') {
      return { ...ROUTING_WEIGHTS.HIGH_VOLUME_AUTOMATION };
    }
    if (taskType === 'CONVERSATION' || taskType === 'GENERATION') {
      return { ...ROUTING_WEIGHTS.CONVERSATION };
    }
    return { ...ROUTING_WEIGHTS.DEFAULT };
  }

  /**
   * Score a model across all routing dimensions
   */
  private scoreModel(
    model: RegisteredModel,
    request: RoutingRequest,
    weights: RoutingScores
  ): RoutingScores {
    // Capability score (0-100)
    const capabilityScore = this.computeCapabilityScore(model, request);

    // Quality score (0-100) — from historical evaluation
    const qualityScore = this.computeQualityScore(model);

    // Latency score (0-100) — lower is better
    const latencyScore = this.computeLatencyScore(model.capabilities.avgLatencyMs, request.latencyRequirementMs);

    // Cost score (0-100) — lower cost is better
    const costScore = this.computeCostScore(model.capabilities.costPerMillionInput, request.budgetUsd);

    // Security score (0-100)
    const securityScore = this.computeSecurityScore(model, request.dataClassification);

    // Availability score (0-100)
    const availabilityScore = this.computeAvailabilityScore(model.identity.providerId);

    const total =
      capabilityScore * weights.capability +
      qualityScore * weights.quality +
      latencyScore * weights.latency +
      costScore * weights.cost +
      securityScore * weights.security +
      availabilityScore * weights.availability;

    return {
      capability: Math.round(capabilityScore * 100) / 100,
      quality: Math.round(qualityScore * 100) / 100,
      latency: Math.round(latencyScore * 100) / 100,
      cost: Math.round(costScore * 100) / 100,
      security: Math.round(securityScore * 100) / 100,
      availability: Math.round(availabilityScore * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  private computeCapabilityScore(model: RegisteredModel, request: RoutingRequest): number {
    const caps = request.requiredCapabilities;
    if (caps.length === 0) return 70; // default baseline

    let matchCount = 0;
    const supported = this.capabilityRegistry.supportedCapabilities(model.identity.id);
    for (const cap of caps) {
      if (supported.includes(cap) || this.capabilityRegistry.hasCapability(model.identity.id, cap)) {
        matchCount++;
      }
    }
    return (matchCount / caps.length) * 100;
  }

  private computeQualityScore(model: RegisteredModel): number {
    const evaluations = model.evaluations;
    if (evaluations.length === 0) return 60; // default for unevaluated models
    const avgScore = evaluations.reduce((sum, e) => sum + e.qualityScore, 0) / evaluations.length;
    return avgScore;
  }

  private computeLatencyScore(actualMs: number, requirementMs?: number): number {
    if (!requirementMs) {
      // General scoring: under 500ms is perfect, scales down to 0 at 5000ms
      return Math.max(0, Math.min(100, 100 - ((actualMs - 200) / 48)));
    }
    // Requirement-based: 100 if under requirement, scales down
    if (actualMs <= requirementMs) return 100;
    return Math.max(0, 100 - ((actualMs - requirementMs) / requirementMs) * 100);
  }

  private computeCostScore(costPerMillion: number, budget?: number): number {
    // Lower cost = higher score
    // $0.10/M tokens = 100, $10/M tokens = ~50, $100/M tokens = ~10
    if (costPerMillion <= 0) return 100;
    return Math.max(0, Math.min(100, 100 - Math.log10(costPerMillion) * 25));
  }

  private computeSecurityScore(model: RegisteredModel, classification: DataClassification): number {
    const allowed = model.identity.allowedClassifications || [];
    if (allowed.includes(classification)) return 100;
    // Partial scores for less sensitive data
    if (classification === 'PUBLIC') return 90;
    if (classification === 'INTERNAL') return 70;
    return 20; // Non-compliant models get very low security scores
  }

  private computeAvailabilityScore(providerId: string): number {
    const metric = ProviderHealthRegistry.getProviderStatus(providerId);
    if (!metric) return 50;
    if (!metric.isOnline) return 0;
    return metric.availability * 100; // ProviderMetric availability is 0-1
  }

  private isDeploymentCompliant(
    modelDeployment: string,
    allowedDeployments: DeploymentPreference[]
  ): boolean {
    if (allowedDeployments.includes('ANY')) return true;
    return allowedDeployments.some(allowed => {
      if (allowed === 'ANY') return true;
      if (allowed === 'LOCAL_OR_PRIVATE') {
        return modelDeployment === 'LOCAL' || modelDeployment === 'PRIVATE' || modelDeployment === 'HYBRID';
      }
      return modelDeployment === allowed;
    });
  }

  private hasRequiredCapabilities(model: RegisteredModel, required: string[]): boolean {
    if (required.length === 0) return true;
    const supported = this.capabilityRegistry.supportedCapabilities(model.identity.id);
    return required.every(cap =>
      supported.includes(cap) || this.capabilityRegistry.hasCapability(model.identity.id, cap)
    );
  }

  private buildReason(scores: RoutingScores, request: RoutingRequest): string {
    const parts: string[] = [];
    if (scores.capability > 80) parts.push('high capability match');
    if (scores.security > 90) parts.push('classification compliant');
    if (scores.latency > 80) parts.push('low latency');
    if (scores.cost > 70) parts.push('cost efficient');
    if (scores.availability > 85) parts.push('high availability');
    return parts.length > 0 ? parts.join(', ') : 'best overall score';
  }

  private buildFallbackDecision(reason: string): RoutingDecision {
    return {
      selectedProvider: 'ollama',
      selectedModel: 'llama3',
      score: 10,
      scores: { capability: 10, quality: 10, latency: 10, cost: 10, security: 10, availability: 10, total: 10 },
      fallbackChain: [],
      reason,
      estimatedCost: 0,
      estimatedLatency: 0,
    };
  }
}
