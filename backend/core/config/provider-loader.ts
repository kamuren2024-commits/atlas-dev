import { ConfigService } from './config-loader';

export interface ProviderAuditReport {
  provider: string;
  enabled: boolean;
  keyPresent: boolean;
}

export class ProviderLoader {
  private static auditReport: ProviderAuditReport[] = [];

  /**
   * Performs an audit on registered providers, logs their status, and returns the compiled metrics.
   */
  static runStartupAudit(): ProviderAuditReport[] {
    const targetProviders = [
      { id: 'Gemini', prefix: 'GEMINI' },
      { id: 'Groq', prefix: 'GROQ' },
      { id: 'OpenRouter', prefix: 'OPENROUTER' },
      { id: 'OpenAI', prefix: 'OPENAI' },
      { id: 'Anthropic', prefix: 'ANTHROPIC' },
      { id: 'Cerebras', prefix: 'CEREBRAS' },
      { id: 'DeepSeek', prefix: 'DEEPSEEK' }
    ];

    this.auditReport = targetProviders.map(p => {
      const isEnabled = ConfigService.getBoolean(`${p.prefix}_ENABLED`, false);
      const rawKey = ConfigService.get(`${p.prefix}_API_KEY`);
      const keyPresent = !!rawKey && rawKey.trim() !== '' && !rawKey.includes('MY_') && !rawKey.startsWith('AQ.Ab8RN');

      return {
        provider: p.id,
        enabled: isEnabled,
        keyPresent
      };
    });

    this.printAuditReport();
    return this.auditReport;
  }

  /**
   * Formats and prints the verified provider audit report to stdout.
   */
  private static printAuditReport(): void {
    console.log('\n================================================================');
    console.log('📋  SALIENCE ATLAS V2 — PROVIDER STARTUP AUDIT REPORT  📋');
    console.log('================================================================');

    this.auditReport.forEach(report => {
      console.log(`Provider: ${report.provider}`);
      console.log(`Status: ${report.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`Key Present: ${report.keyPresent ? 'Yes' : 'No'}`);
      console.log('----------------------------------------------------------------');
    });

    console.log('================================================================\n');
  }

  /**
   * Retrieves secure api keys for provider operations.
   */
  static getProviderKey(providerPrefix: string): string {
    const key = ConfigService.get(`${providerPrefix.toUpperCase()}_API_KEY`);
    if (!key || key.trim() === '') {
      throw new Error(`[SECURITY] Required API key for ${providerPrefix} is missing or empty in ConfigService.`);
    }
    return key;
  }
}
