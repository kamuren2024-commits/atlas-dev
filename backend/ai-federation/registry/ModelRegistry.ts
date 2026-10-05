/**
 * PHASE 02: CANONICAL ATLAS MODEL REGISTRY
 * 
 * Central registry of all federated models across Local (Ollama) and
 * Frontier Cloud (Google Gemini, OpenAI, Anthropic) providers.
 * Evaluates real-time availability based on runtime configuration.
 */

export type ModelProvider = 'google' | 'ollama' | 'openai' | 'anthropic';
export type DeploymentMode = 'LOCAL' | 'CLOUD';
export type LatencyClass = 'LOW' | 'MEDIUM' | 'HIGH';
export type CostClass = 'FREE' | 'LOW' | 'STANDARD' | 'PREMIUM';
export type ModelHealthStatus = 'ACTIVE' | 'DEGRADED' | 'DISABLED';

export interface ModelRegistryEntry {
  modelId: string;
  provider: ModelProvider;
  modelName: string;
  deploymentMode: DeploymentMode;
  capabilities: {
    toolCalling: boolean;
    vision: boolean;
    structuredOutput: boolean;
    streaming: boolean;
    reasoningScore: number; // 0-100
  };
  contextWindow: number;
  latencyClass: LatencyClass;
  costClass: CostClass;
  availability: ModelHealthStatus;
  eligibility?: OllamaEvaluationStatus | 'NOT_APPLICABLE';
  evaluation?: OllamaModelEvaluation;
  health: {
    lastChecked: string;
    consecutiveErrors: number;
    avgLatencyMs: number;
  };
  version: string;
  routingPolicy: {
    preferredTasks: string[];
    priority: number; // lower is higher priority
    requiresAirGap: boolean;
  };
}

import { OllamaClient } from '../providers/ollama/OllamaClient';
import { OllamaModelEvaluation, OllamaEvaluationStatus } from '../providers/ollama/types';

export class AtlasModelRegistry {
  private static instance: AtlasModelRegistry | null = null;
  private models: Map<string, ModelRegistryEntry> = new Map();
  private ollamaClient = new OllamaClient();

  private constructor() {
    this.seedCanonicalModels();
    this.ensureLocalFallbackModel();
  }

  private ensureLocalFallbackModel(): void {
    const now = new Date().toISOString();
    const localRuntimeEnabled = process.env.OLLAMA_ENABLED === 'true';
    const fallbackState = localRuntimeEnabled ? 'ACTIVE' : 'DISABLED';
    const fallbackEligibility = localRuntimeEnabled ? 'PASSED' : 'NOT_APPLICABLE';
    const existing = this.models.get('atlas-local-fallback');
    if (existing) {
      existing.availability = fallbackState;
      existing.eligibility = fallbackEligibility;
      existing.deploymentMode = 'LOCAL';
      return;
    }

    this.models.set('atlas-local-fallback', {
      modelId: 'atlas-local-fallback',
      provider: 'ollama',
      modelName: 'Atlas Local Fallback',
      deploymentMode: 'LOCAL',
      capabilities: {
        toolCalling: true,
        vision: false,
        structuredOutput: true,
        streaming: true,
        reasoningScore: 78,
      },
      contextWindow: 32768,
      latencyClass: 'MEDIUM',
      costClass: 'FREE',
      availability: fallbackState,
      eligibility: fallbackEligibility,
      health: {
        lastChecked: now,
        consecutiveErrors: 0,
        avgLatencyMs: 1200,
      },
      version: 'offline',
      routingPolicy: {
        preferredTasks: ['copilot', 'react_planning', 'analysis', 'offline_fallback', 'local_reasoning'],
        priority: 1,
        requiresAirGap: true,
      },
    });
  }

  public static getInstance(): AtlasModelRegistry {
    if (!AtlasModelRegistry.instance) {
      AtlasModelRegistry.instance = new AtlasModelRegistry();
    }
    return AtlasModelRegistry.instance;
  }

  private seedCanonicalModels(): void {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const now = new Date().toISOString();

    // 1. Google Gemini Flash (Latest)
    this.models.set('gemini-flash-latest', {
      modelId: 'gemini-flash-latest',
      provider: 'google',
      modelName: 'Gemini Flash Latest',
      deploymentMode: 'CLOUD',
      capabilities: {
        toolCalling: true,
        vision: true,
        structuredOutput: true,
        streaming: true,
        reasoningScore: 92,
      },
      contextWindow: 1048576,
      latencyClass: 'LOW',
      costClass: 'LOW',
      availability: hasGemini ? 'ACTIVE' : 'DISABLED',
      health: { lastChecked: now, consecutiveErrors: 0, avgLatencyMs: 380 },
      version: 'flash-latest',
      routingPolicy: {
        preferredTasks: ['fast_query', 'copilot', 'telemetry_analysis', 'classification', 'react_planning'],
        priority: 10,
        requiresAirGap: false,
      },
    });

    this.models.set('gemini-2.5-flash', this.models.get('gemini-flash-latest')!);
    this.models.set('gemini-2.5-pro', {
      modelId: 'gemini-2.5-pro',
      provider: 'google',
      modelName: 'Gemini 2.5 Pro',
      deploymentMode: 'CLOUD',
      capabilities: {
        toolCalling: true,
        vision: true,
        structuredOutput: true,
        streaming: true,
        reasoningScore: 95,
      },
      contextWindow: 2097152,
      latencyClass: 'MEDIUM',
      costClass: 'STANDARD',
      availability: hasGemini ? 'ACTIVE' : 'DISABLED',
      health: { lastChecked: now, consecutiveErrors: 0, avgLatencyMs: 920 },
      version: '2.5',
      routingPolicy: {
        preferredTasks: ['procurement_audit', 'complex_reasoning', 'fraud_detection', 'contingency_planning'],
        priority: 11,
        requiresAirGap: false,
      },
    });

    this.models.set('gpt-4o-mini', {
      modelId: 'gpt-4o-mini',
      provider: 'openai',
      modelName: 'GPT-4o Mini',
      deploymentMode: 'CLOUD',
      capabilities: {
        toolCalling: true,
        vision: true,
        structuredOutput: true,
        streaming: true,
        reasoningScore: 86,
      },
      contextWindow: 128000,
      latencyClass: 'LOW',
      costClass: 'LOW',
      availability: hasOpenAI ? 'ACTIVE' : 'DISABLED',
      health: { lastChecked: now, consecutiveErrors: 0, avgLatencyMs: 450 },
      version: '2024-07-18',
      routingPolicy: {
        preferredTasks: ['copilot', 'fast_query'],
        priority: 12,
        requiresAirGap: false,
      },
    });

    this.models.set('claude-3-5-sonnet', {
      modelId: 'claude-3-5-sonnet',
      provider: 'anthropic',
      modelName: 'Claude 3.5 Sonnet',
      deploymentMode: 'CLOUD',
      capabilities: {
        toolCalling: true,
        vision: true,
        structuredOutput: true,
        streaming: true,
        reasoningScore: 94,
      },
      contextWindow: 200000,
      latencyClass: 'MEDIUM',
      costClass: 'STANDARD',
      availability: hasAnthropic ? 'ACTIVE' : 'DISABLED',
      health: { lastChecked: now, consecutiveErrors: 0, avgLatencyMs: 880 },
      version: '20241022',
      routingPolicy: {
        preferredTasks: ['code_generation', 'deep_analysis'],
        priority: 13,
        requiresAirGap: false,
      },
    });
  }

  public async refreshLocalModels(): Promise<ModelRegistryEntry[]> {
    try {
      const live = await this.ollamaClient.listModels(15000);
      const existingLocalKeys = Array.from(this.models.keys()).filter((key) => this.models.get(key)?.provider === 'ollama' && key !== 'atlas-local-fallback');
      for (const key of existingLocalKeys) {
        this.models.delete(key);
      }

      for (const tag of live) {
        const capabilityList = Array.isArray(tag.capabilities) ? tag.capabilities : [];
        const model: ModelRegistryEntry = {
          modelId: tag.name,
          provider: 'ollama',
          modelName: tag.name,
          deploymentMode: 'LOCAL',
          capabilities: {
            toolCalling: capabilityList.includes('tools'),
            vision: capabilityList.includes('vision'),
            structuredOutput: capabilityList.includes('thinking') || capabilityList.includes('tools'),
            streaming: true,
            reasoningScore: capabilityList.includes('thinking') ? 90 : 80,
          },
          contextWindow: tag.details?.context_length ?? 32768,
          latencyClass: 'MEDIUM',
          costClass: 'FREE',
          availability: 'DISABLED',
          eligibility: 'UNVERIFIED',
          health: {
            lastChecked: new Date().toISOString(),
            consecutiveErrors: 0,
            avgLatencyMs: 800,
          },
          version: tag.details?.parameter_size ?? 'local',
          routingPolicy: {
            preferredTasks: ['copilot', 'local_reasoning', 'offline_fallback', 'analysis'],
            priority: 1,
            requiresAirGap: true,
          },
        };
        this.models.set(tag.name, model);
      }
      this.ensureLocalFallbackModel();
      return Array.from(this.models.values()).filter((model) => model.provider === 'ollama');
    } catch {
      this.ensureLocalFallbackModel();
      return [this.models.get('atlas-local-fallback')!];
    }
  }

  /**
   * Apply only evidence produced by the direct Ollama evaluator. Discovery
   * metadata must never promote a model into the trust plane.
   */
  public applyOllamaEvaluation(evaluation: OllamaModelEvaluation): ModelRegistryEntry | undefined {
    const model = this.models.get(evaluation.model);
    if (!model || model.provider !== 'ollama') return undefined;
    model.evaluation = evaluation;
    model.eligibility = evaluation.status;
    model.availability = evaluation.status === 'FAILED' || evaluation.status === 'UNVERIFIED' ||
      evaluation.status === 'EXPIRED' || evaluation.status === 'REVOKED' ? 'DISABLED' : 'ACTIVE';
    model.health.lastChecked = evaluation.evaluatedAt;
    model.health.avgLatencyMs = evaluation.tests.boundedInference.durationMs;
    model.capabilities.streaming = evaluation.capabilities.STREAMING === 'PASS';
    model.capabilities.structuredOutput = evaluation.capabilities.STRUCTURED_OUTPUT === 'PASS';
    model.capabilities.toolCalling = evaluation.capabilities.TOOL_CALLING === 'PASS';
    model.capabilities.vision = evaluation.capabilities.VISION === 'PASS';
    return model;
  }

  public listModels(): ModelRegistryEntry[] {
    return Array.from(this.models.values());
  }

  public getModel(modelId: string): ModelRegistryEntry | undefined {
    return this.models.get(modelId);
  }

  /**
   * Router policy selection: Selects the optimal model based on task requirements
   */
  public selectModel(params: {
    task?: string;
    requiresAirGap?: boolean;
    requiresVision?: boolean;
    highReasoning?: boolean;
    preferredProvider?: ModelProvider;
  }): ModelRegistryEntry {
    const candidates = Array.from(this.models.values()).filter((m) =>
      m.availability === 'ACTIVE' &&
      (m.provider !== 'ollama' || m.eligibility === 'PASSED' || m.eligibility === 'PASSED_WITH_RESTRICTIONS')
    );

    const localCandidates = candidates.filter((m) => m.deploymentMode === 'LOCAL');
    const localFallback = this.models.get('atlas-local-fallback') || localCandidates[0];

    if (params.requiresAirGap) {
      if (localFallback) return localFallback;
      const airGapped = candidates.find((m) => m.deploymentMode === 'LOCAL');
      if (airGapped) return airGapped;
    }

    if (localCandidates.length > 0 && (!params.preferredProvider || params.preferredProvider === 'ollama')) {
      const preferredLocal = localCandidates.sort((a, b) => a.routingPolicy.priority - b.routingPolicy.priority)[0];
      if (preferredLocal) return preferredLocal;
    }

    if (params.preferredProvider) {
      const pref = candidates.find((m) => m.provider === params.preferredProvider);
      if (pref) return pref;
    }

    if (params.requiresVision) {
      const visionModel = candidates.find((m) => m.capabilities.vision);
      if (visionModel) return visionModel;
    }

    if (params.highReasoning) {
      const reasoningModel = [...candidates].sort((a, b) => b.capabilities.reasoningScore - a.capabilities.reasoningScore)[0];
      if (reasoningModel) return reasoningModel;
    }

    if (params.task) {
      const taskModel = candidates.find((m) => m.routingPolicy.preferredTasks.includes(params.task!));
      if (taskModel) return taskModel;
    }

    const fallback = candidates.sort((a, b) => a.routingPolicy.priority - b.routingPolicy.priority)[0];
    return fallback || this.models.get('gemini-2.5-flash')!;
  }
}
