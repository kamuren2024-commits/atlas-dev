// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — PROVIDER FACTORY
// Instantiates all provider adapters and registers them with ModelRegistry
// ============================================================================

import { ModelRegistry } from '../registry/ModelRegistry';
import { CapabilityRegistry } from '../registry/CapabilityRegistry';
import { ModelIdentity, ModelCapabilities } from '../federation/types';
import { FederatedModelProvider } from './FederatedModelProvider';
import { OpenAIProvider } from './openai';
import { GeminiProviderV2 } from './gemini-v2';
import { AnthropicProvider } from './anthropic';
import { OllamaProviderV2 } from './ollama-v2';
import { QwenProvider } from './qwen';
import { DeepSeekProvider } from './deepseek';
import { ZhipuProvider } from './zhipu';
import { MoonshotProvider } from './moonshot';
import { MiniMaxProvider } from './minimax';
import { VLLMProvider, SGLangProvider, LlamaCppProvider, LocalEmbeddingProvider } from './local';
import { ProviderRegistry } from '../registry/ProviderRegistry';

export class ProviderFactory {
  private static initialized = false;

  /**
   * Initialize all providers and register them with the model registry
   */
  static init(): void {
    if (ProviderFactory.initialized) return;

    const modelRegistry = ModelRegistry.getInstance();
    const capabilityRegistry = CapabilityRegistry.getInstance();
    const providerRegistry = ProviderRegistry.getInstance();

    const factories: Array<() => FederatedModelProvider> = [
      () => new GeminiProviderV2(),
      () => new OpenAIProvider(),
      () => new AnthropicProvider(),
      () => new OllamaProviderV2(),
      () => new QwenProvider(),
      () => new DeepSeekProvider(),
      () => new ZhipuProvider(),
      () => new MoonshotProvider(),
      () => new MiniMaxProvider(),
      () => new VLLMProvider(),
      () => new SGLangProvider(),
      () => new LlamaCppProvider(),
      () => new LocalEmbeddingProvider(),
    ];

    for (const factory of factories) {
      try {
        const provider = factory();
        const registryConfig = providerRegistry.getProvider(provider.identity.providerId);

        // Only register if provider is enabled in config
        if (registryConfig && registryConfig.enabled) {
          modelRegistry.register(provider.identity, provider.capabilities, provider);
          ProviderFactory.mapCapabilities(capabilityRegistry, provider.identity, provider.capabilities);
          console.log(`[PROVIDER-FACTORY] Registered ${provider.identity.displayName}`);
        }
      } catch (err: any) {
        console.warn(`[PROVIDER-FACTORY] Failed to init provider: ${err.message}`);
      }
    }

    ProviderFactory.initialized = true;
    console.log('[PROVIDER-FACTORY] Federation provider initialization complete');
  }

  /**
   * Map model capabilities to capability registry
   */
  private static mapCapabilities(
    capabilityRegistry: CapabilityRegistry,
    identity: ModelIdentity,
    caps: ModelCapabilities
  ): void {
    const mappings: Array<[string, number]> = [
      ['reasoning', caps.reasoning],
      ['coding', caps.coding],
      ['analysis', caps.analysis],
      ['creative', caps.creative],
      ['multilingual', caps.multilingual],
      ['data_analysis', caps.analysis],
      ['document_analysis', caps.analysis],
      ['summarization', caps.analysis],
      ['structured_output', caps.structuredOutput ? 90 : 40],
      ['tool_calling', caps.toolCalling ? 90 : 40],
      ['function_calling', caps.functionCalling ? 90 : 40],
      ['json_mode', caps.jsonMode ? 90 : 40],
      ['vision', caps.vision ? 90 : 40],
      ['embedding', caps.embedding ? 90 : 40],
      ['legal_reasoning', caps.reasoning * 0.85],
      ['numerical_reasoning', caps.reasoning * 0.9],
      ['domain_expertise', caps.reasoning * 0.8],
      ['classification', caps.reasoning * 0.8],
      ['extraction', caps.analysis * 0.85],
      ['citation', caps.analysis * 0.7],
      ['forecasting', caps.analysis * 0.8],
      ['compliance_checking', caps.reasoning * 0.85],
    ];

    for (const [capability, score] of mappings) {
      capabilityRegistry.mapCapabilityToModel(capability, identity.id, identity.providerId, score);
    }
  }
}
