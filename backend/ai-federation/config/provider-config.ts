import { AIEnvironmentConfig, ProviderInfo } from './provider-types';
import { ConfigService } from '../../core/config/config-loader';

// Initialize ConfigService
ConfigService.init();

const providersList: { id: string; name: string; envPrefix: string; defaultModel: string; defaultPriority: number; hasBaseUrl?: boolean; apiKeyOptional?: boolean }[] = [
  { id: 'gemini', name: 'Google Gemini', envPrefix: 'GEMINI', defaultModel: 'gemini-2.5-pro', defaultPriority: 1 },
  { id: 'groq', name: 'Groq Cloud', envPrefix: 'GROQ', defaultModel: 'llama-4-scout', defaultPriority: 2 },
  { id: 'openrouter', name: 'OpenRouter', envPrefix: 'OPENROUTER', defaultModel: 'deepseek/deepseek-r1', defaultPriority: 3 },
  { id: 'cerebras', name: 'Cerebras AI', envPrefix: 'CEREBRAS', defaultModel: 'llama-4', defaultPriority: 4 },
  { id: 'openai', name: 'OpenAI GPT', envPrefix: 'OPENAI', defaultModel: 'gpt-5', defaultPriority: 5 },
  { id: 'anthropic', name: 'Anthropic Claude', envPrefix: 'ANTHROPIC', defaultModel: 'claude-opus', defaultPriority: 6 },
  { id: 'deepseek', name: 'DeepSeek Platform', envPrefix: 'DEEPSEEK', defaultModel: 'deepseek-chat', defaultPriority: 7 },
  { id: 'qwen', name: 'Alibaba Qwen', envPrefix: 'QWEN', defaultModel: 'qwen-max', defaultPriority: 11, hasBaseUrl: true },
  { id: 'zhipu', name: 'Zhipu GLM', envPrefix: 'ZHIPU', defaultModel: 'glm-4-plus', defaultPriority: 12, hasBaseUrl: true },
  { id: 'moonshot', name: 'Moonshot Kimi', envPrefix: 'MOONSHOT', defaultModel: 'moonshot-v1-128k', defaultPriority: 13, hasBaseUrl: true },
  { id: 'minimax', name: 'MiniMax', envPrefix: 'MINIMAX', defaultModel: 'MiniMax-Text-01', defaultPriority: 14, hasBaseUrl: true },
  { id: 'vllm', name: 'vLLM Local', envPrefix: 'VLLM', defaultModel: 'qwen-72b', defaultPriority: 998, hasBaseUrl: true, apiKeyOptional: true },
  { id: 'sglang', name: 'SGLang Local', envPrefix: 'SGLANG', defaultModel: 'deepseek-v3', defaultPriority: 997, hasBaseUrl: true, apiKeyOptional: true },
  { id: 'llamacpp', name: 'llama.cpp Local', envPrefix: 'LLAMACPP', defaultModel: 'llama-3-8b', defaultPriority: 996, hasBaseUrl: true, apiKeyOptional: true },
  { id: 'together', name: 'Together AI', envPrefix: 'TOGETHER', defaultModel: 'meta-llama', defaultPriority: 15 },
  { id: 'fireworks', name: 'Fireworks AI', envPrefix: 'FIREWORKS', defaultModel: 'llama', defaultPriority: 16 },
  { id: 'huggingface', name: 'HuggingFace', envPrefix: 'HF', defaultModel: 'mistralai', defaultPriority: 17 },
  { id: 'ollama', name: 'Local Ollama', envPrefix: 'OLLAMA', defaultModel: 'llama3', defaultPriority: 999, hasBaseUrl: true, apiKeyOptional: true }
];

const providers: Record<string, ProviderInfo> = {};

providersList.forEach(p => {
  const isEnabled = ConfigService.getBoolean(`${p.envPrefix}_ENABLED`, false);
  const apiKey = ConfigService.get(`${p.envPrefix}_API_KEY`);
  const model = ConfigService.get(`${p.envPrefix}_MODEL`, p.defaultModel);
  const fallbackPriority = ConfigService.getNumber(`${p.envPrefix}_FALLBACK_PRIORITY`, p.defaultPriority);
  const apiBase = p.hasBaseUrl ? ConfigService.get(`${p.envPrefix}_API_BASE`, ConfigService.get(`${p.envPrefix}_HOST`, undefined)) : undefined;

  providers[p.id] = {
    id: p.id,
    name: p.name,
    enabled: isEnabled,
    apiKey,
    model,
    fallbackPriority,
    apiBase
  };
});

export const AIConfig: AIEnvironmentConfig = {
  providers,
  forceProvider: ConfigService.get('FORCE_PROVIDER') || undefined,
  costGovernance: {
    monthlyBudgetUsd: ConfigService.getNumber('AI_MONTHLY_BUDGET_USD', 100),
    dailyBudgetUsd: ConfigService.getNumber('AI_DAILY_BUDGET_USD', 10),
    requestLimitPerMinute: ConfigService.getNumber('AI_REQUEST_LIMIT_PER_MINUTE', 500),
    maxRetries: ConfigService.getNumber('AI_MAX_RETRIES', 3),
    maxAgentDepth: ConfigService.getNumber('AI_MAX_AGENT_DEPTH', 20),
    maxConcurrentWorkflows: ConfigService.getNumber('AI_MAX_CONCURRENT_WORKFLOWS', 100),
  },
  telemetry: {
    enableAiTelemetry: ConfigService.getBoolean('ENABLE_AI_TELEMETRY', true),
    enableAiAuditLogging: ConfigService.getBoolean('ENABLE_AI_AUDIT_LOGGING', true),
    enableProviderHealthMonitoring: ConfigService.getBoolean('ENABLE_PROVIDER_HEALTH_MONITORING', true),
    enableCostTracking: ConfigService.getBoolean('ENABLE_COST_TRACKING', true),
  },
  caching: {
    enabled: ConfigService.getBoolean('AI_CACHE_ENABLED', true),
    ttlSeconds: ConfigService.getNumber('AI_CACHE_TTL_SECONDS', 3600),
    backend: (ConfigService.get('AI_CACHE_BACKEND') === 'redis' ? 'redis' : 'memory') as 'redis' | 'memory',
  },
  security: {
    enableSecretRotation: ConfigService.getBoolean('ENABLE_SECRET_ROTATION', true),
    secretRotationDays: ConfigService.getNumber('SECRET_ROTATION_DAYS', 30),
    enableProviderIsolation: ConfigService.getBoolean('ENABLE_PROVIDER_ISOLATION', true),
  }
};
