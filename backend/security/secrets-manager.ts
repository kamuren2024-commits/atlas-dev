import { CryptographyService } from './cryptography-service';

export class SecretsManager {
  private static secretsCache: Map<string, string> = new Map();
  private static rotationCallbacks: Set<() => Promise<void>> = new Set();

  /**
   * Safe retrieval of a configuration variable
   */
  static getSecret(key: string, defaultValue = ''): string {
    if (this.secretsCache.has(key)) {
      return this.secretsCache.get(key)!;
    }
    const val = process.env[key] || defaultValue;
    return val;
  }

  /**
   * Set or update a secret dynamically (enabling rotation hooks)
   */
  static setSecret(key: string, val: string): void {
    this.secretsCache.set(key, val);
    process.env[key] = val;
    this.triggerRotation();
  }

  /**
   * Register rotation callbacks to adjust active connections/sessions
   */
  static registerRotationHook(cb: () => Promise<void>): void {
    this.rotationCallbacks.add(cb);
  }

  private static triggerRotation(): void {
    console.log('[SECRETS-MANAGER] Secret rotation triggered. Invoking callbacks...');
    for (const cb of this.rotationCallbacks) {
      cb().catch(err => console.error('[SECRETS-MANAGER] Rotation hook failure:', err));
    }
  }

  /**
   * Verify critical enterprise runtime secrets and logs configuration status safely
   */
  static validateEnvironment(): { isValid: boolean; warnings: string[] } {
    const criticalKeys = ['JWT_SECRET', 'SESSION_ENCRYPTION_KEY', 'GEMINI_API_KEY'];
    const warnings: string[] = [];
    let isValid = true;

    for (const key of criticalKeys) {
      const val = process.env[key];
      if (!val || val.trim() === '' || val.includes('MY_') || val.includes('placeholder')) {
        warnings.push(`[WARN] Config value for "${key}" is either missing or contains a placeholder.`);
        if (key === 'JWT_SECRET') {
          // Provision a fallback secret in-memory for zero-crash startup
          const fallbackSecret = CryptographyService.generateRandomToken();
          process.env[key] = fallbackSecret;
          warnings.push(`[AUTO-HEAL] Provisioned fallback cryptographic JWT_SECRET in memory.`);
        }
      }
    }

    return { isValid, warnings };
  }

  /**
   * Store high-value strings (like API Keys or passwords) in AES-256-GCM encrypted format
   */
  static encryptConfigValue(plainText: string): string {
    const encrypted = CryptographyService.encrypt(plainText);
    return JSON.stringify(encrypted);
  }

  /**
   * Retrieve high-value strings from AES-256-GCM encrypted format
   */
  static decryptConfigValue(cipherJSON: string): string {
    try {
      const payload = JSON.parse(cipherJSON);
      if (payload.iv && payload.encryptedData && payload.tag) {
        return CryptographyService.decrypt(payload);
      }
    } catch {
      // Fallback if the value was not JSON-encrypted (i.e. already plaintext)
    }
    return cipherJSON;
  }
}
