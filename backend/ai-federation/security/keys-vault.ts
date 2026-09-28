import { AIConfig } from '../config/provider-config';
import { ConfigService } from '../../core/config/config-loader';

export interface ProviderCredentials {
  apiKey?: string;
  apiBase?: string;
  orgId?: string;
}

export class KeysVault {
  private static rotationIndex: Record<string, number> = {};

  /**
   * Retrieves secure credentials for a provider with built-in masking and key rotation support.
   */
  static getCredentials(providerId: string): ProviderCredentials {
    const key = providerId.toUpperCase();
    ConfigService.init();
    
    // Support rotated keys e.g., GEMINI_API_KEY_1, GEMINI_API_KEY_2
    const baseKeyName = `${key}_API_KEY`;
    const activeIndex = this.rotationIndex[providerId] || 0;
    
    let apiKey = ConfigService.get(`${baseKeyName}_${activeIndex}`);
    
    // Fallback to central AIConfig parsed value if no active rotated key is set
    if (!apiKey) {
      const conf = AIConfig.providers[providerId];
      apiKey = conf?.apiKey || '';
    }

    // Secondary fallback for local development keys
    if (!apiKey) {
      const keyMappings: Record<string, string> = {
        'gemini': 'GEMINI_API_KEY',
        'groq': 'GROQ_API_KEY',
        'openrouter': 'OPENROUTER_API_KEY',
        'cerebras': 'CEREBRAS_API_KEY',
        'openai': 'OPENAI_API_KEY',
        'anthropic': 'ANTHROPIC_API_KEY',
        'deepseek': 'DEEPSEEK_API_KEY',
        'qwen': 'QWEN_API_KEY',
        'zhipu': 'ZHIPU_API_KEY',
        'moonshot': 'MOONSHOT_API_KEY',
        'minimax': 'MINIMAX_API_KEY',
        'together': 'TOGETHER_API_KEY',
        'fireworks': 'FIREWORKS_API_KEY',
        'huggingface': 'HF_API_KEY',
        'vllm': 'VLLM_API_KEY',
        'sglang': 'SGLANG_API_KEY',
        'llamacpp': 'LLAMACPP_API_KEY',
        'ollama': 'OLLAMA_API_KEY',
      };
      const envKey = keyMappings[providerId];
      if (envKey) {
        apiKey = ConfigService.get(envKey, 'LOCAL_OLLAMA');
      }
    }

    if (apiKey === 'MY_GEMINI_API_KEY' || !apiKey || apiKey.trim() === '') {
      apiKey = undefined;
    }

    const configBase = AIConfig.providers[providerId]?.apiBase;

    return {
      apiKey,
      apiBase: configBase || ConfigService.get(`${key}_API_BASE`),
      orgId: ConfigService.get(`${key}_ORG_ID`) || undefined
    };
  }

  /**
   * Rotate to next credential key if primary gets throttled or fails.
   */
  static rotateKey(providerId: string): void {
    const currentIndex = this.rotationIndex[providerId] || 0;
    this.rotationIndex[providerId] = currentIndex + 1;
    console.log(`[VAULT KEY ROTATION] Rotated key index for provider [${providerId}] to index [${currentIndex + 1}]`);
  }

  /**
   * Safe masking for logs.
   */
  static maskKey(key?: string): string {
    if (!key) return 'NOT_CONFIGURED';
    if (key.length <= 8) return '********';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }
}
