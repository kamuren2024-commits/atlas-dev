// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — PROVIDER REGISTRY
// Registry of all AI providers with health, status, and configuration
// ============================================================================

import { ProviderCategory, ProviderStatus, ProviderHealth, DataClassification } from '../federation/types';

export interface ProviderConfig {
  id: string;
  name: string;
  category: ProviderCategory;
  enabled: boolean;
  apiKey?: string;
  apiBase?: string;
  model: string;
  fallbackPriority: number;
  allowedClassifications: DataClassification[];
  maxConcurrentRequests: number;
  rateLimitPerMinute: number;
}

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, ProviderConfig> = new Map();

  private constructor() {
    this.loadFromEnvironment();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Load provider configurations from environment variables
   */
  private loadFromEnvironment(): void {
    const providers: ProviderConfig[] = [
      {
        id: 'gemini',
        name: 'Google Gemini',
        category: 'FRONTIER',
        enabled: process.env.GEMINI_ENABLED === 'true',
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        fallbackPriority: parseInt(process.env.GEMINI_FALLBACK_PRIORITY || '1'),
        allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 60,
      },
      {
        id: 'groq',
        name: 'Groq',
        category: 'FRONTIER',
        enabled: process.env.GROQ_ENABLED === 'true',
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'llama-4-scout',
        fallbackPriority: parseInt(process.env.GROQ_FALLBACK_PRIORITY || '2'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 200,
        rateLimitPerMinute: 30,
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        category: 'OPENAI_COMPATIBLE',
        enabled: process.env.OPENROUTER_ENABLED === 'true',
        apiKey: process.env.OPENROUTER_API_KEY,
        apiBase: 'https://openrouter.ai/api/v1/chat/completions',
        model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1',
        fallbackPriority: parseInt(process.env.OPENROUTER_FALLBACK_PRIORITY || '3'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'cerebras',
        name: 'Cerebras',
        category: 'FRONTIER',
        enabled: process.env.CEREBRAS_ENABLED === 'true',
        apiKey: process.env.CEREBRAS_API_KEY,
        model: process.env.CEREBRAS_MODEL || 'llama-4',
        fallbackPriority: parseInt(process.env.CEREBRAS_FALLBACK_PRIORITY || '4'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 30,
      },
      {
        id: 'openai',
        name: 'OpenAI',
        category: 'FRONTIER',
        enabled: process.env.OPENAI_ENABLED === 'true',
        apiKey: process.env.OPENAI_API_KEY,
        apiBase: 'https://api.openai.com/v1/chat/completions',
        model: process.env.OPENAI_MODEL || 'gpt-5',
        fallbackPriority: parseInt(process.env.OPENAI_FALLBACK_PRIORITY || '5'),
        allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 60,
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        category: 'FRONTIER',
        enabled: process.env.ANTHROPIC_ENABLED === 'true',
        apiKey: process.env.ANTHROPIC_API_KEY,
        apiBase: 'https://api.anthropic.com/v1/messages',
        model: process.env.ANTHROPIC_MODEL || 'claude-opus',
        fallbackPriority: parseInt(process.env.ANTHROPIC_FALLBACK_PRIORITY || '6'),
        allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 40,
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        category: 'CHINESE',
        enabled: process.env.DEEPSEEK_ENABLED === 'true',
        apiKey: process.env.DEEPSEEK_API_KEY,
        apiBase: 'https://api.deepseek.com/beta/chat/completions',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        fallbackPriority: parseInt(process.env.DEEPSEEK_FALLBACK_PRIORITY || '7'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'qwen',
        name: 'Alibaba Qwen',
        category: 'CHINESE',
        enabled: process.env.QWEN_ENABLED === 'true',
        apiKey: process.env.QWEN_API_KEY,
        apiBase: process.env.QWEN_API_BASE || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: process.env.QWEN_MODEL || 'qwen-max',
        fallbackPriority: parseInt(process.env.QWEN_FALLBACK_PRIORITY || '8'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'zhipu',
        name: 'Zhipu AI (GLM)',
        category: 'CHINESE',
        enabled: process.env.ZHIPU_ENABLED === 'true',
        apiKey: process.env.ZHIPU_API_KEY,
        apiBase: process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: process.env.ZHIPU_MODEL || 'glm-4-plus',
        fallbackPriority: parseInt(process.env.ZHIPU_FALLBACK_PRIORITY || '9'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'moonshot',
        name: 'Moonshot (Kimi)',
        category: 'CHINESE',
        enabled: process.env.MOONSHOT_ENABLED === 'true',
        apiKey: process.env.MOONSHOT_API_KEY,
        apiBase: process.env.MOONSHOT_API_BASE || 'https://api.moonshot.cn/v1/chat/completions',
        model: process.env.MOONSHOT_MODEL || 'moonshot-v1-128k',
        fallbackPriority: parseInt(process.env.MOONSHOT_FALLBACK_PRIORITY || '10'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'minimax',
        name: 'MiniMax',
        category: 'CHINESE',
        enabled: process.env.MINIMAX_ENABLED === 'true',
        apiKey: process.env.MINIMAX_API_KEY,
        apiBase: process.env.MINIMAX_API_BASE || 'https://api.minimax.chat/v1/text/chatcompletion_v2',
        model: process.env.MINIMAX_MODEL || 'MiniMax-Text-01',
        fallbackPriority: parseInt(process.env.MINIMAX_FALLBACK_PRIORITY || '11'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'together',
        name: 'Together AI',
        category: 'OPENAI_COMPATIBLE',
        enabled: process.env.TOGETHER_ENABLED === 'true',
        apiKey: process.env.TOGETHER_API_KEY,
        apiBase: 'https://api.together.xyz/v1/chat/completions',
        model: process.env.TOGETHER_MODEL || 'meta-llama',
        fallbackPriority: parseInt(process.env.TOGETHER_FALLBACK_PRIORITY || '12'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'fireworks',
        name: 'Fireworks AI',
        category: 'OPENAI_COMPATIBLE',
        enabled: process.env.FIREWORKS_ENABLED === 'true',
        apiKey: process.env.FIREWORKS_API_KEY,
        apiBase: 'https://api.fireworks.ai/inference/v1/chat/completions',
        model: process.env.FIREWORKS_MODEL || 'llama',
        fallbackPriority: parseInt(process.env.FIREWORKS_FALLBACK_PRIORITY || '13'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 50,
      },
      {
        id: 'huggingface',
        name: 'HuggingFace',
        category: 'OPENAI_COMPATIBLE',
        enabled: process.env.HF_ENABLED === 'true',
        apiKey: process.env.HF_API_KEY,
        apiBase: 'https://api-inference.huggingface.co/models',
        model: process.env.HF_MODEL || 'mistralai',
        fallbackPriority: parseInt(process.env.HF_FALLBACK_PRIORITY || '14'),
        allowedClassifications: ['PUBLIC', 'INTERNAL'],
        maxConcurrentRequests: 100,
        rateLimitPerMinute: 30,
      },
      {
        id: 'ollama',
        name: 'Ollama (Local)',
        category: 'LOCAL',
        enabled: process.env.OLLAMA_ENABLED === 'true',
        apiBase: process.env.OLLAMA_HOST || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3',
        fallbackPriority: parseInt(process.env.OLLAMA_FALLBACK_PRIORITY || '999'),
        allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
        maxConcurrentRequests: 10,
        rateLimitPerMinute: 30,
      },
      {
        id: 'vllm',
        name: 'vLLM (Local)',
        category: 'LOCAL',
        enabled: process.env.VLLM_ENABLED === 'true',
        apiBase: process.env.VLLM_HOST || 'http://localhost:8000',
        model: process.env.VLLM_MODEL || 'qwen-72b',
        fallbackPriority: parseInt(process.env.VLLM_FALLBACK_PRIORITY || '998'),
        allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
        maxConcurrentRequests: 20,
        rateLimitPerMinute: 60,
      },
    ];

    for (const provider of providers) {
      this.providers.set(provider.id, provider);
    }

    const enabledCount = providers.filter(p => p.enabled).length;
    console.log(`[PROVIDER-REGISTRY] Loaded ${providers.length} providers (${enabledCount} enabled)`);
  }

  /**
   * Get a provider configuration
   */
  getProvider(id: string): ProviderConfig | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all enabled providers sorted by fallback priority
   */
  getEnabledProviders(): ProviderConfig[] {
    return Array.from(this.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.fallbackPriority - b.fallbackPriority);
  }

  /**
   * Check if a provider is enabled
   */
  isProviderEnabled(id: string): boolean {
    return this.providers.get(id)?.enabled ?? false;
  }

  /**
   * Get fallback chain (enabled providers sorted by priority)
   */
  getFallbackChain(): string[] {
    return this.getEnabledProviders().map(p => p.id);
  }

  /**
   * Enable/disable a provider at runtime
   */
  setProviderEnabled(id: string, enabled: boolean): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.enabled = enabled;
      console.log(`[PROVIDER-REGISTRY] Provider ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get all providers
   */
  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }
}
