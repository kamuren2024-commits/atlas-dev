import { AIConfig } from './provider-config';
import { ProviderRegistry } from './provider-registry';
import { ProviderValidator } from './provider-validator';
import { KeysVault } from '../security/keys-vault';

export class ProviderLoader {
  private static bootstrapped = false;

  /**
   * Initializes the environment governance validation suite and prints runtime diagnostic maps.
   */
  static bootstrap(): void {
    if (this.bootstrapped) return;

    console.log('================================================================');
    console.log('⚡  SALIENCE ATLAS V2: AI ENVIRONMENT GOVERNANCE BOOTSTRAP  ⚡');
    console.log('================================================================');

    // 0. Dynamically initialize provider configurations and registry catalog
    ProviderRegistry.initialize();

    // 1. Run dynamic validation checks. Startup halts here if any critical config error exists.
    ProviderValidator.validate();

    // 2. Resolve Active Fallback Sequence
    const chain = ProviderRegistry.getFallbackChain();

    console.log('📋 DYNAMIC CHANNELS ENROLLED:');
    chain.forEach((id, index) => {
      const conf = ProviderRegistry.getProviderConfig(id);
      if (conf) {
        const masked = KeysVault.maskKey(conf.apiKey);
        console.log(`   [${index + 1}] Priority ${conf.fallbackPriority} => Provider: ${id.toUpperCase().padEnd(10)} Model: ${conf.model.padEnd(25)} Status: ONLINE Cred: ${masked}`);
      }
    });

    if (AIConfig.forceProvider) {
      console.log(`🎯 FORCE_PROVIDER OVERRIDE ACTIVE: [${AIConfig.forceProvider}]`);
    }

    console.log('----------------------------------------------------------------');
    console.log(`💰 SCM Monthly Budget: $${AIConfig.costGovernance.monthlyBudgetUsd} | Daily Limit: $${AIConfig.costGovernance.dailyBudgetUsd}`);
    console.log(`⏱️  Telemetry: ${AIConfig.telemetry.enableAiTelemetry ? 'Enabled' : 'Disabled'} | Cache: ${AIConfig.caching.enabled ? 'Enabled' : 'Disabled'} (${AIConfig.caching.ttlSeconds}s TTL)`);
    console.log('================================================================');

    this.bootstrapped = true;
  }
}
