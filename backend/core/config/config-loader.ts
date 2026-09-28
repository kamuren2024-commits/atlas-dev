import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export class ConfigService {
  private static configCache: Record<string, string> = {};
  private static isInitialized = false;

  /**
   * Initializes the ConfigService by loading variables from .env, .env.local, and mock Secret Providers in order.
   */
  static init(): void {
    if (this.isInitialized) return;

    // 1. Reconstruct .env from .env.example if missing
    this.ensureEnvFile();

    // 2. Load .env
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const k in envConfig) {
        this.configCache[k] = envConfig[k];
      }
    }

    // 3. Load .env.local (Precedence over .env)
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
      for (const k in envLocalConfig) {
        this.configCache[k] = envLocalConfig[k];
      }
    }

    // 4. Overwrite/merge with process.env (Vault, KMS, secret manager simulation or cloud env injection)
    // Cloud environments (such as Google Cloud Run or Secret Manager) inject variables directly into process.env.
    // This represents the highest priority level.
    for (const k in process.env) {
      if (process.env[k] !== undefined) {
        this.configCache[k] = process.env[k] as string;
      }
    }

    this.isInitialized = true;
  }

  /**
   * Ensures that a .env file exists. If it is missing, reconstructs it from .env.example.
   */
  private static ensureEnvFile(): void {
    const envPath = path.resolve(process.cwd(), '.env');
    const examplePath = path.resolve(process.cwd(), '.env.example');

    if (!fs.existsSync(envPath)) {
      console.warn('\n================================================================');
      console.warn('⚠️  WARNING: .env file was missing in the workspace root.');
      
      if (fs.existsSync(examplePath)) {
        console.warn('🔄 Regenerating placeholder .env structure from .env.example...');
        try {
          const exampleContent = fs.readFileSync(examplePath, 'utf8');
          // Copy structure only: keep keys, but clear the secrets/values.
          const lines = exampleContent.split('\n');
          const outputLines = lines.map(line => {
            const trimmed = line.trim();
            // Preserve comments and empty lines
            if (trimmed.startsWith('#') || trimmed === '') {
              return line;
            }
            // If it is a key-value assignment, blank out the value
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
              const key = match[1].trim();
              // Keep non-secret default flags (like _ENABLED=true, budgets, or telemetry)
              if (key.endsWith('_ENABLED') || key.startsWith('AI_') || key.startsWith('ENABLE_')) {
                return line;
              }
              // Blank out secrets/keys
              return `${key}=`;
            }
            return line;
          });

          fs.writeFileSync(envPath, outputLines.join('\n'), 'utf8');
          console.warn('✅ Generated placeholder .env from .env.example.');
          console.warn('🚨 Secrets must be supplied in .env before startup.');
          console.warn('================================================================\n');
        } catch (err: any) {
          console.error(`❌ Failed to reconstruct .env file from .env.example: ${err.message}`);
        }
      } else {
        console.error('❌ Critical: Neither .env nor .env.example could be found in the workspace root.');
        console.warn('================================================================\n');
      }
    }
  }

  /**
   * Retrieves a string configuration value.
   */
  static get(key: string, defaultValue?: string): string {
    if (!this.isInitialized) {
      this.init();
    }
    const val = this.configCache[key];
    if (val === undefined || val === '') {
      if (defaultValue !== undefined) return defaultValue;
      return '';
    }
    return val;
  }

  /**
   * Retrieves a boolean configuration value.
   */
  static getBoolean(key: string, defaultValue = false): boolean {
    const val = this.get(key);
    if (val === '') return defaultValue;
    return val.toLowerCase() === 'true' || val === '1';
  }

  /**
   * Retrieves a numeric configuration value.
   */
  static getNumber(key: string, defaultValue = 0): number {
    const val = this.get(key);
    if (val === '') return defaultValue;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Checks if a configuration key has a non-empty value.
   */
  static has(key: string): boolean {
    return this.get(key) !== '';
  }

  /**
   * Returns a copy of the loaded configuration catalog (with secrets masked).
   */
  static getAllMasked(): Record<string, string> {
    if (!this.isInitialized) {
      this.init();
    }
    const masked: Record<string, string> = {};
    for (const k in this.configCache) {
      const val = this.configCache[k];
      if (k.includes('KEY') || k.includes('SECRET') || k.includes('TOKEN') || k.includes('PASSWORD')) {
        if (!val || val.trim() === '') {
          masked[k] = '[EMPTY]';
        } else {
          masked[k] = val.length > 8 
            ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` 
            : '********';
        }
      } else {
        masked[k] = val;
      }
    }
    return masked;
  }

  /**
   * Reloads configuration from disk (clearing cache).
   */
  static reload(): void {
    this.isInitialized = false;
    this.configCache = {};
    this.init();
  }
}
