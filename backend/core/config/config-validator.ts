import fs from 'fs';
import path from 'path';
import { ConfigService } from './config-loader';

export class ConfigValidator {
  /**
   * Performs critical environment validation checks on .env existence, readability, and keys.
   * Halts the process with a clear report if validations fail.
   */
  static validateEnvFile(): void {
    const envPath = path.resolve(process.cwd(), '.env');

    // 1. Verify existence
    if (!fs.existsSync(envPath)) {
      throw new Error('[FATAL] .env file is missing and could not be auto-generated.');
    }

    // 2. Verify readability
    try {
      fs.accessSync(envPath, fs.constants.R_OK);
    } catch (err: any) {
      throw new Error(`[FATAL] .env file exists but is NOT readable: ${err.message}`);
    }

    // Initialize ConfigService to parse all keys
    ConfigService.init();

    const errors: string[] = [];

    // 3. Verify enabled providers have non-blank secrets
    const providers = [
      { id: 'gemini', name: 'Google Gemini', prefix: 'GEMINI' },
      { id: 'groq', name: 'Groq Cloud', prefix: 'GROQ' },
      { id: 'openrouter', name: 'OpenRouter', prefix: 'OPENROUTER' },
      { id: 'cerebras', name: 'Cerebras AI', prefix: 'CEREBRAS' },
      { id: 'openai', name: 'OpenAI GPT', prefix: 'OPENAI' },
      { id: 'anthropic', name: 'Anthropic Claude', prefix: 'ANTHROPIC' },
      { id: 'deepseek', name: 'DeepSeek Platform', prefix: 'DEEPSEEK' },
      { id: 'together', name: 'Together AI', prefix: 'TOGETHER' },
      { id: 'fireworks', name: 'Fireworks AI', prefix: 'FIREWORKS' },
      { id: 'huggingface', name: 'HuggingFace', prefix: 'HF' }
    ];

    providers.forEach(p => {
      const isEnabled = ConfigService.getBoolean(`${p.prefix}_ENABLED`, false);
      const key = ConfigService.get(`${p.prefix}_API_KEY`);

      if (isEnabled) {
        if (!key || key.trim() === '' || key.includes('MY_') || key.startsWith('AQ.Ab8RN')) {
          errors.push([
            'Provider: ' + p.name,
            'ID: ' + p.id,
            'Status: ENABLED',
            'Credential: ' + p.prefix + '_API_KEY',
            'Status: MISSING',
            'Action: configure the credential or disable ' + p.name + '.'
          ].join('\n'));
        }
      }
    });

    // 4. Verify duplicate priority checks
    const prioritiesUsed: Record<number, string[]> = {};
    providers.forEach(p => {
      const isEnabled = ConfigService.getBoolean(`${p.prefix}_ENABLED`, false);
      if (isEnabled) {
        const priority = ConfigService.getNumber(`${p.prefix}_FALLBACK_PRIORITY`, 99);
        if (!prioritiesUsed[priority]) {
          prioritiesUsed[priority] = [];
        }
        prioritiesUsed[priority].push(p.id);
      }
    });

    Object.entries(prioritiesUsed).forEach(([priority, ids]) => {
      if (ids.length > 1 && priority !== '99') {
        errors.push(`[FATAL ARCHITECTURE ERROR] Duplicate fallback priority (${priority}) detected between enabled providers: [${ids.join(', ')}]. Fallback priority values must be unique.`);
      }
    });

    // 5. Budget constraints verification
    const monthlyBudget = ConfigService.getNumber('AI_MONTHLY_BUDGET_USD', 0);
    const dailyBudget = ConfigService.getNumber('AI_DAILY_BUDGET_USD', 0);
    if (monthlyBudget <= 0) {
      errors.push('[FATAL BUDGET ERROR] AI_MONTHLY_BUDGET_USD is invalid or unconfigured.');
    }
    if (dailyBudget <= 0) {
      errors.push('[FATAL BUDGET ERROR] AI_DAILY_BUDGET_USD is invalid or unconfigured.');
    }
    if (dailyBudget > monthlyBudget) {
      errors.push('[FATAL BUDGET ERROR] Daily AI Budget exceeds the total Monthly AI Budget limit.');
    }

    // 6. Cache validation
    const cacheEnabled = ConfigService.getBoolean('AI_CACHE_ENABLED', false);
    if (cacheEnabled) {
      const backend = ConfigService.get('AI_CACHE_BACKEND');
      if (backend !== 'memory' && backend !== 'redis') {
        errors.push(`[FATAL CACHE ERROR] Cache is enabled, but AI_CACHE_BACKEND "${backend}" is unsupported. Choose either "memory" or "redis".`);
      }
    }

    // 7. Verify host URLs if configured
    const ollamaEnabled = ConfigService.getBoolean('OLLAMA_ENABLED', false);
    if (ollamaEnabled) {
      const host = ConfigService.get('OLLAMA_HOST');
      if (host && !host.startsWith('http://') && !host.startsWith('https://')) {
        errors.push(`[FATAL URL ERROR] OLLAMA_HOST "${host}" is malformed. Must begin with http:// or https://.`);
      }
    }

    if (errors.length > 0) {
      console.error('\n================================================================');
      console.error('⛔ SALIENCE ATLAS V2 — CRITICAL DEPLOYMENT PREFLIGHT FAILURE ⛔');
      console.error('================================================================');
      errors.forEach(err => console.error(err));
      console.error('================================================================\n');
      throw new Error(`Preflight checks failed: ${errors.length} fatal configuration errors.`);
    }
  }
}

export class PreflightEnvironmentValidation {
  /**
   * Run the exhaustive preflight environmental validator checks.
   */
  static run(): void {
    ConfigValidator.validateEnvFile();
  }
}

