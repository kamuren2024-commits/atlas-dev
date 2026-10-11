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

    const configured = process.env[key]?.trim();
    if (configured) {
      this.secretsCache.set(key, configured);
      return configured;
    }

    if (defaultValue && defaultValue.trim()) {
      this.secretsCache.set(key, defaultValue);
      return defaultValue;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required secret ${key} in production.`);
    }

    const generated = CryptographyService.generateRandomToken(32);
    this.secretsCache.set(key, generated);
    process.env[key] = generated;
    return generated;
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
        const message = `[WARN] Config value for "${key}" is either missing or contains a placeholder.`;
        warnings.push(message);

        if (process.env.NODE_ENV === 'production') {
          isValid = false;
          warnings.push(`[ERROR] ${key} must be configured before production startup.`);
          continue;
        }

        const generated = CryptographyService.generateRandomToken(32);
        process.env[key] = generated;
        this.secretsCache.set(key, generated);
        warnings.push(`[AUTO-HEAL] Generated an ephemeral secret for "${key}" in this process.`);
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
