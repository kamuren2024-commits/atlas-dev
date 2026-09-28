import { AIConfig } from './provider-config';
import { ProviderInfo } from './provider-types';
import { ConfigService } from '../../core/config/config-loader';

export class ProviderRegistry {
  private static activeCatalog: string[] = [];

  /**
   * Reads all federation environment variables, detects enabled and configured providers,
   * validates credentials, and dynamically registers them.
   */
  static initialize(): string[] {
    this.activeCatalog = [];
    ConfigService.init();
    
    const providersList = [
      { id: 'gemini', name: 'Google Gemini', envPrefix: 'GEMINI', defaultModel: 'gemini-2.5-pro', defaultPriority: 1 },
      { id: 'groq', name: 'Groq Cloud', envPrefix: 'GROQ', defaultModel: 'llama-4-scout', defaultPriority: 2 },
      { id: 'openrouter', name: 'OpenRouter', envPrefix: 'OPENROUTER', defaultModel: 'deepseek/deepseek-r1', defaultPriority: 3 },
      { id: 'cerebras', name: 'Cerebras AI', envPrefix: 'CEREBRAS', defaultModel: 'llama-4', defaultPriority: 4 },
      { id: 'openai', name: 'OpenAI GPT', envPrefix: 'OPENAI', defaultModel: 'gpt-5', defaultPriority: 5 },
      { id: 'anthropic', name: 'Anthropic Claude', envPrefix: 'ANTHROPIC', defaultModel: 'claude-opus', defaultPriority: 6 },
      { id: 'deepseek', name: 'DeepSeek Platform', envPrefix: 'DEEPSEEK', defaultModel: 'deepseek-chat', defaultPriority: 7 },
      { id: 'together', name: 'Together AI', envPrefix: 'TOGETHER', defaultModel: 'meta-llama', defaultPriority: 8 },
      { id: 'fireworks', name: 'Fireworks AI', envPrefix: 'FIREWORKS', defaultModel: 'llama', defaultPriority: 9 },
      { id: 'huggingface', name: 'HuggingFace', envPrefix: 'HF', defaultModel: 'mistralai', defaultPriority: 10 },
      { id: 'ollama', name: 'Local Ollama', envPrefix: 'OLLAMA', defaultModel: 'llama3', defaultPriority: 999, hasBaseUrl: true }
    ];

    providersList.forEach(p => {
      // 1. Read environment variables through ConfigService
      const envEnabled = ConfigService.has(`${p.envPrefix}_ENABLED`)
        ? ConfigService.getBoolean(`${p.envPrefix}_ENABLED`, false)
        : false;

      const apiKey = ConfigService.get(`${p.envPrefix}_API_KEY`);
      const apiBase = p.hasBaseUrl ? ConfigService.get(`${p.envPrefix}_HOST`, 'http://localhost:11434') : undefined;

      // 2. Validate credentials exist
      const hasCredentials = p.id === 'ollama' ? !!apiBase : (!!apiKey && apiKey.trim() !== '');

      // Dynamic activation logic: ignore disabled and unconfigured providers
      const isRegistered = envEnabled && hasCredentials;

      if (AIConfig.providers[p.id]) {
        AIConfig.providers[p.id].enabled = isRegistered;
        AIConfig.providers[p.id].apiKey = apiKey;
        if (apiBase) AIConfig.providers[p.id].apiBase = apiBase;
      }

      if (isRegistered) {
        this.activeCatalog.push(p.id);
      }
    });

    console.log(`[AI FEDERATION] Dynamic initialization complete. Discovered active catalog: ${JSON.stringify(this.activeCatalog)}`);
    return this.activeCatalog;
  }

  /**
   * Returns the runtime provider catalog list.
   */
  static getActiveCatalog(): string[] {
    if (this.activeCatalog.length === 0) {
      this.initialize();
    }
    return this.activeCatalog;
  }

  /**
   * Gets list of all currently registered providers (both enabled and disabled)
   */
  static getAllProviders(): ProviderInfo[] {
    return Object.values(AIConfig.providers);
  }

  /**
   * Discovers all enabled providers with proper credentials configured
   */
  static getEnabledProviders(): ProviderInfo[] {
    return Object.values(AIConfig.providers).filter(prov => prov.enabled);
  }

  /**
   * Check if a specific provider is enabled
   */
  static isProviderEnabled(id: string): boolean {
    return !!AIConfig.providers[id]?.enabled;
  }

  /**
   * Gets configuration detail for a single provider
   */
  static getProviderConfig(id: string): ProviderInfo | undefined {
    return AIConfig.providers[id];
  }

  /**
   * Evaluates the fallback chain dynamically at runtime
   * Sorts enabled providers by their assigned fallbackPriority
   * Respects FORCE_PROVIDER override if active
   */
  static getFallbackChain(): string[] {
    // Make sure catalog has been initialized
    if (this.activeCatalog.length === 0) {
      this.initialize();
    }

    // If a provider is being explicitly forced, place it at the front of the list
    if (AIConfig.forceProvider) {
      const forced = AIConfig.providers[AIConfig.forceProvider];
      if (forced && forced.enabled) {
        return [AIConfig.forceProvider];
      }
    }

    // Sort active providers by assigned priority score
    const active = this.getEnabledProviders();
    const sorted = [...active].sort((a, b) => a.fallbackPriority - b.fallbackPriority);
    
    return sorted.map(prov => prov.id);
  }
}
