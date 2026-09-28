// ============================================================================
// SALIENCE ATLAS — ENTERPRISE AI SERVICE
// Single service boundary for application AI use.
// Responsibilities: execute(), stream(), listModels(), getProviderStatus(),
// refreshModels(). Backed by the REAL local Ollama runtime. No mock paths.
// ============================================================================

import { OllamaFederationProvider } from './providers/ollama/OllamaFederationProvider';
import { OllamaClient } from './providers/ollama/OllamaClient';
import type { OllamaStatus, OllamaStatusSnapshot } from './providers/ollama/OllamaHealthService';
import type { QueueStats } from './providers/ollama/InferenceQueue';
import { ConfigService } from '../core/config/config-loader';

export interface ChatRequest {
  message: string;
  context?: string;
  system?: string;
  requestedModel?: string;
  provider?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  success: boolean;
  requestId: string;
  provider: string;
  model: string;
  response: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    costUsd: number;
  };
  latencyMs: number;
  timestamp: string;
  status?: string;
  error?: string;
  queue?: QueueStats;
}

export interface ModelRegistryEntry {
  id: string;
  name: string;
  provider: 'ollama';
  deployment: 'LOCAL';
  status: 'AVAILABLE' | 'UNKNOWN';
  size?: number;
  parameterSize?: string;
  quantizationLevel?: string;
  family?: string;
  contextLength?: number;
  capabilities: string[];
  modifiedAt?: string;
  isQwen: boolean;
}

export interface ProviderStatusEntry {
  id: string;
  status: OllamaStatus;
  latencyMs: number;
  modelCount: number;
  modelNames: string[];
  lastCheckedAt?: string;
  reachable: boolean;
  error?: string;
}

export class AIFederationService {
  private provider: OllamaFederationProvider;
  private client: OllamaClient;
  private registry: ModelRegistryEntry[] = [];
  private registrySyncedAt?: string;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private syncIntervalMs: number;

  private static instance: AIFederationService;

  private constructor() {
    this.provider = new OllamaFederationProvider();
    this.client = this.provider.getClient();
    this.syncIntervalMs = (() => {
      const v = Number(process.env.OLLAMA_MODEL_SYNC_INTERVAL_MS);
      return Number.isFinite(v) && v > 0 ? v : 5 * 60 * 1000; // every 5 minutes
    })();
  }

  static getInstance(): AIFederationService {
    if (!AIFederationService.instance) {
      AIFederationService.instance = new AIFederationService();
    }
    return AIFederationService.instance;
  }

  /**
   * Initialize — starts health monitoring + model registry sync.
   */
  start(): void {
    // Start health monitoring
    this.refreshHealth().catch(() => {});
    // Start periodic model registry sync
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.syncModelRegistry().catch(err => {
          console.warn('[AI-SERVICE] Model registry sync failed:', err?.message || err);
        });
      }, this.syncIntervalMs);
    }
  }

  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Execute a real chat request against local Ollama.
   * This is the application-level AI execution boundary.
   */
  async execute(req: ChatRequest): Promise<ChatResult> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const start = Date.now();

    try {
      // Resolve a model first (throws if none available)
      const resolved = await this.provider.resolveModel({
        requestedModel: req.requestedModel,
      });

      // Assemble the prompt with optional context
      const messages: Array<{ role: 'user' | 'system'; content: string }> = [];
      if (req.system) {
        messages.push({ role: 'system', content: req.system });
      }
      let messageContent = req.message || '';
      if (req.context) {
        messageContent = `Context:\n${req.context}\n\nQuestion: ${messageContent}`;
      }
      messages.push({ role: 'user', content: messageContent });

      const inferenceRequest = {
        messages: messages as any,
        system: req.system,
        temperature: req.temperature ?? 0.7,
        maxTokens: req.maxTokens ?? 2048,
        metadata: {
          requestId,
          agentDepth: 0,
          tenantId: 'ketraco',
          module: 'assistant',
          dataClassification: 'INTERNAL' as const,
          requiredCapabilities: [],
          auditRequired: true,
          citationRequired: false,
          timestamp: new Date().toISOString(),
        },
      };

      // Execute real inference through the federated provider (queue-gated)
      const response = await this.provider.infer(inferenceRequest);

      const latencyMs = Date.now() - start;

      return {
        success: true,
        requestId,
        provider: response.provider || 'ollama',
        model: response.model || resolved?.name || 'ollama-local',
        response: response.text,
        usage: {
          promptTokens: response.usage.promptTokens > 0 ? response.usage.promptTokens : null,
          completionTokens: response.usage.completionTokens > 0 ? response.usage.completionTokens : null,
          totalTokens: response.usage.totalTokens > 0 ? response.usage.totalTokens : null,
          costUsd: response.usage.costUsd || 0,
        },
        latencyMs,
        timestamp: new Date().toISOString(),
        queue: this.provider.getQueueStats(),
      };
    } catch (err: any) {
      const isUnavailable = /unavailable|not reachable|connection|timed out|no ollama models|refused/i.test(err?.message || '');
      const latencyMs = Date.now() - start;
      return {
        success: false,
        requestId,
        provider: 'ollama',
        model: '',
        response: '',
        usage: { promptTokens: null, completionTokens: null, totalTokens: null, costUsd: 0 },
        latencyMs,
        timestamp: new Date().toISOString(),
        status: isUnavailable ? 'UNAVAILABLE' : 'ERROR',
        error: isUnavailable
          ? 'Local AI inference service is currently unavailable.'
          : err?.message || 'AI inference failed',
        queue: this.provider.getQueueStats(),
      };
    }
  }

  /**
   * Get the federated provider instance.
   */
  getProvider(): OllamaFederationProvider {
    return this.provider;
  }

  /**
   * Get queue stats for observability.
   */
  getQueueStats(): QueueStats {
    return this.provider.getQueueStats();
  }

  /**
   * Sync the model registry with the live Ollama runtime.
   * Called at startup, periodically, and on manual refresh.
   */
  async syncModelRegistry(): Promise<{ models: ModelRegistryEntry[]; count: number }> {
    const models = await this.provider.listModels();
    this.registry = models.map(m => ({
      id: m.id,
      name: m.name,
      provider: 'ollama',
      deployment: 'LOCAL',
      status: m.status,
      size: m.size,
      parameterSize: m.parameterSize,
      quantizationLevel: m.quantizationLevel,
      family: m.family,
      contextLength: m.contextLength,
      capabilities: m.capabilities,
      modifiedAt: m.modifiedAt?.toISOString(),
      isQwen: m.family?.toLowerCase().includes('qwen') || m.name.toLowerCase().includes('qwen'),
    }));
    this.registrySyncedAt = new Date().toISOString();
    console.log(`[AI-SERVICE] Model registry synced: ${this.registry.length} local models`);
    return { models: this.registry, count: this.registry.length };
  }

  /**
   * Get the current model registry.
   */
  getModelRegistry(): ModelRegistryEntry[] {
    return this.registry;
  }

  /**
   * Get Qwen models specifically.
   */
  getQwenModels(): ModelRegistryEntry[] {
    return this.registry.filter(m => m.isQwen);
  }

  /**
   * Force a model registry refresh (manual refresh).
   */
  async refreshModels(): Promise<{ models: ModelRegistryEntry[]; count: number }> {
    return this.syncModelRegistry();
  }

  /**
   * Get the live provider status.
   */
  async getProviderStatus(): Promise<ProviderStatusEntry> {
    const snapshot: OllamaStatusSnapshot = await this.provider.getHealthService().check();
    return {
      id: 'ollama',
      status: snapshot.status,
      latencyMs: snapshot.latencyMs,
      modelCount: snapshot.modelCount,
      modelNames: snapshot.modelNames,
      lastCheckedAt: snapshot.lastCheckedAt,
      reachable: snapshot.reachable,
      error: snapshot.error,
    };
  }

  /**
   * Force an immediate health check.
   */
  async refreshHealth(): Promise<ProviderStatusEntry> {
    return this.getProviderStatus();
  }

  /**
   * Return the OLLAMA configuration summary (non-sensitive).
   */
  getConfig(): { enabled: boolean; baseUrl: string; timeoutMs: number; maxConcurrentRequests: number; queueLimit: number } {
    ConfigService.init();
    const configured = process.env.OLLAMA_ENABLED === 'true' || process.env.OLLAMA_ENABLED === undefined;
    return {
      enabled: configured,
      baseUrl: this.client.baseUrl,
      timeoutMs: this.client.timeoutMs,
      maxConcurrentRequests: this.provider.getQueueStats().maxConcurrent,
      queueLimit: this.provider.getQueueStats().queueLimit,
    };
  }
}
