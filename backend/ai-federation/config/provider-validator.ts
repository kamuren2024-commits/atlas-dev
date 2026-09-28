import { AIConfig } from './provider-config';
import { ProviderInfo } from './provider-types';

export class ProviderValidator {
  /**
   * Performs rigorous validation on startup config
   * Throws Error if critical issues exist (e.g. enabled cloud provider without API key, duplicate priority)
   */
  static validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prioritiesUsed: Record<number, string[]> = {};

    const providers = Object.values(AIConfig.providers);

    providers.forEach((prov: ProviderInfo) => {
      // Validate priority duplicates
      if (prov.enabled) {
        if (!prioritiesUsed[prov.fallbackPriority]) {
          prioritiesUsed[prov.fallbackPriority] = [];
        }
        prioritiesUsed[prov.fallbackPriority].push(prov.id);

        // Validate API Key exists for non-local enabled providers
        if (prov.id !== 'ollama' && (!prov.apiKey || prov.apiKey.trim() === '')) {
          errors.push(`[VALIDATION ERROR] Provider "${prov.id}" (${prov.name}) is ENABLED but is missing its required credential (${prov.id.toUpperCase()}_API_KEY).`);
        }

        // Validate model names
        if (!prov.model || prov.model.trim() === '') {
          errors.push(`[VALIDATION ERROR] Provider "${prov.id}" is ENABLED but has an empty model specified.`);
        }
      } else {
        // Disabled but credentials present warning
        if (prov.apiKey && prov.apiKey.trim() !== '') {
          warnings.push(`[VALIDATION WARNING] Provider "${prov.id}" is disabled, but API Key is configured in environment variables.`);
        }
      }
    });

    // Check duplicate priorities
    Object.entries(prioritiesUsed).forEach(([priority, ids]) => {
      if (ids.length > 1) {
        errors.push(`[VALIDATION ERROR] Duplicate fallback priority ${priority} detected between multiple enabled providers: [${ids.join(', ')}]. Each provider must have a unique priority order.`);
      }
    });

    // Force provider override checks
    if (AIConfig.forceProvider) {
      const selected = AIConfig.providers[AIConfig.forceProvider];
      if (!selected) {
        errors.push(`[VALIDATION ERROR] FORCE_PROVIDER is set to "${AIConfig.forceProvider}", but this is not a registered provider.`);
      } else if (!selected.enabled) {
        errors.push(`[VALIDATION ERROR] FORCE_PROVIDER is set to "${AIConfig.forceProvider}", but that provider is currently disabled.`);
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      console.error('================================================================');
      console.error('⚠️  SALIENCE ATLAS AI FEDERATION GATEWAY CONFIGURATION FAILURE  ⚠️');
      console.error('================================================================');
      errors.forEach(err => console.error(err));
      console.error('================================================================');
      throw new Error(`AI Federation Gateway startup halted: ${errors.length} critical configuration errors detected.`);
    }

    if (warnings.length > 0) {
      console.log('================================================================');
      console.log('⚠️  SALIENCE ATLAS AI FEDERATION GATEWAY CONFIGURATION WARNINGS ⚠️');
      console.log('================================================================');
      warnings.forEach(warn => console.log(warn));
      console.log('================================================================');
    }

    return { isValid, errors, warnings };
  }
}
