import { AIResponse, AIProvider } from '../providers/base';
import { GeminiProvider } from '../providers/gemini';
import { OpenRouterProvider } from '../providers/openrouter';
import { GroqProvider } from '../providers/groq';
import { CerebrasProvider } from '../providers/cerebras';
import { OllamaProvider } from '../providers/ollama';
import { GenericProvider } from '../providers/generic';
import { ProviderRegistry } from '../config/provider-registry';
import { ProviderHealthRegistry } from '../health/health-registry';
import { FederationCache } from '../cache/federation-cache';
import { CostGovernor } from '../costs/cost-governor';
import { AuditLedger } from '../compliance/audit-ledger';

export interface RouteOptions {
  user?: string;
  module?: string;
  workflow?: string;
  strategy?: 'cost' | 'reasoning' | 'latency' | 'availability';
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  agentName?: string;
  agentDepth?: number;
}

export class ModelRouter {
  private static providers: Record<string, AIProvider> = {
    gemini: new GeminiProvider(),
    groq: new GroqProvider(),
    openrouter: new OpenRouterProvider(),
    cerebras: new CerebrasProvider(),
    ollama: new OllamaProvider(),
    openai: new GenericProvider('openai', 'OpenAI GPT', 'https://api.openai.com/v1/chat/completions', 'gpt-5'),
    anthropic: new GenericProvider('anthropic', 'Anthropic Claude', 'https://api.anthropic.com/v1/messages', 'claude-opus'),
    deepseek: new GenericProvider('deepseek', 'DeepSeek Platform', 'https://api.deepseek.com/beta/chat/completions', 'deepseek-chat'),
    together: new GenericProvider('together', 'Together AI', 'https://api.together.xyz/v1/chat/completions', 'meta-llama'),
    fireworks: new GenericProvider('fireworks', 'Fireworks AI', 'https://api.fireworks.ai/inference/v1/chat/completions', 'llama'),
    huggingface: new GenericProvider('huggingface', 'HuggingFace', 'https://api-inference.huggingface.co/models', 'mistralai')
  };

  private static get failoverChain(): string[] {
    return ProviderRegistry.getFallbackChain();
  }
  private static MAX_DEPTH = 8; // Agent runaway loop protection threshold
  private static activeCircuitBreakers: Record<string, { failedCount: number; lastFailedTime: number }> = {};
  private static FAILURE_THRESHOLD = 3;
  private static COOLDOWN_PERIOD_MS = 60000; // 1 minute circuit cooldown

  /**
   * Main route function: checks cache, handles loop-prevention, picks primary provider, and coordinates fallback
   */
  static async route(prompt: string, options?: RouteOptions): Promise<AIResponse> {
    const user = options?.user || 'ANONYMOUS_USER';
    const module = options?.module || 'default';
    const workflow = options?.workflow || 'unassigned';
    const depth = options?.agentDepth || 0;

    // 1. Runaway Agent / Loop Protection
    if (depth > this.MAX_DEPTH) {
      console.warn(`[SAFETY TRIGGER] Infinite agent loop protection. Terminated routing at depth ${depth}.`);
      throw new Error(`Execution budget exceeded. Max recursive agent depth (${this.MAX_DEPTH}) hit.`);
    }

    // 2. Request Deduplication (Enterprise Cache)
    const cached = await FederationCache.get(prompt, module);
    if (cached) {
      console.log(`[DEDUPLICATION MATCH] Found cached response for prompt hash: ${cached.hash}`);
      
      // Still log a secure audit trace for compliance tracking
      AuditLedger.append(
        prompt, 
        cached.response.text, 
        cached.provider, 
        cached.model, 
        0, // $0 cost for cache hit
        5, // negligible latency
        user, 
        workflow,
        ['CACHED_RESPONSE']
      );

      return {
        ...cached.response,
        latencyMs: 5,
        text: `${cached.response.text}\n\n*Source: Salience Enterprise Intelligent Cache*`
      };
    }

    // 3. Determine Primary Provider according to routing strategy
    const primaryProviderId = this.selectPrimaryProvider(prompt, options?.strategy, module);
    console.log(`[ROUTER INTENT] Routed [${module}] module query to primary provider: [${primaryProviderId}]`);

    // 4. Failover Orchestration loop
    const attemptsChain = this.getFailoverSequence(primaryProviderId);
    let lastError: any = null;

    for (const providerId of attemptsChain) {
      if (this.isCircuitBroken(providerId)) {
        console.warn(`[CIRCUIT BREAKER ACTIVE] Skipping unhealthy provider [${providerId}] due to high failure rates.`);
        continue;
      }

      const provider = this.providers[providerId];
      if (!provider) continue;

      try {
        const response = await provider.generate(prompt, options?.systemInstruction, {
          temperature: options?.temperature,
          maxOutputTokens: options?.maxOutputTokens
        });

        // Record metrics
        this.recordSuccess(providerId);
        await FederationCache.set(prompt, response, providerId, response.model, module);
        CostGovernor.recordTransaction(module, user, response.promptTokens + response.completionTokens, response.cost, providerId, options?.agentName, workflow);
        AuditLedger.append(prompt, response.text, providerId, response.model, response.cost, response.latencyMs, user, workflow);

        return response;
      } catch (err: any) {
        console.error(`[ROUTER FAILOVER CHANNEL] Provider [${providerId}] failed: ${err.message}. Cascading down-chain...`);
        this.recordFailure(providerId);
        lastError = err;
      }
    }

    // If all fail, return emergency local fallback response without crashing
    console.error('[CRITICAL SEVERE COGNITIVE FAILURE] All primary and secondary cloud providers failed! Triggering emergency local Ollama simulation.');
    const localOllama = this.providers['ollama'];
    const response = await localOllama.generate(prompt, options?.systemInstruction, {
      temperature: options?.temperature,
      maxOutputTokens: options?.maxOutputTokens
    });

    await FederationCache.set(prompt, response, 'ollama', response.model, module);
    CostGovernor.recordTransaction(module, user, response.promptTokens + response.completionTokens, response.cost, 'ollama', options?.agentName, workflow);
    AuditLedger.append(prompt, response.text, 'ollama', response.model, response.cost, response.latencyMs, user, workflow, ['EMERGENCY_FALLBACK_ACTIVE']);

    return {
      ...response,
      text: `### Resiliency Failover Mode Active\n\n*The primary cloud clusters are undergoing severe service load. Salience Atlas has switched execution seamlessly to the local containment node.* \n\n${response.text}`
    };
  }

  /**
   * Helper strategy selector
   */
  private static selectPrimaryProvider(prompt: string, strategy?: string, module?: string): string {
    const lower = prompt.toLowerCase();
    
    // Auto-detect strategy based on module or prompt content if not explicitly specified
    let selectedStrategy = strategy || 'availability';
    if (!strategy) {
      if (
        module === 'chat' || 
        module === 'copilot' || 
        lower.includes('copilot') || 
        lower.includes('hi ') || 
        lower.includes('hello') || 
        lower.includes('summary') || 
        lower.includes('summarize')
      ) {
        selectedStrategy = 'fast';
      } else if (
        module === 'orchestrator' ||
        lower.includes('evaluate') || 
        lower.includes('tender') ||
        lower.includes('score') || 
        lower.includes('compliance') || 
        lower.includes('audit') || 
        lower.includes('ppada') ||
        lower.includes('supplier') ||
        lower.includes('risk') ||
        lower.includes('contract') ||
        lower.includes('intelligence')
      ) {
        selectedStrategy = 'reasoning';
      } else if (lower.includes('saving') || lower.includes('cost') || lower.includes('spend')) {
        selectedStrategy = 'cost';
      }
    }

    const metrics = ProviderHealthRegistry.getAllProviderMetrics();
    // Only select providers that are currently enabled in the registry
    const onlineProviders = metrics
      .filter(m => m.isOnline && ProviderRegistry.isProviderEnabled(m.providerId))
      .map(m => m.providerId);

    if (onlineProviders.length === 0) return 'ollama';

    switch (selectedStrategy) {
      case 'fast':
        // Fast Tasks: Groq or OpenRouter
        if (onlineProviders.includes('groq')) return 'groq';
        if (onlineProviders.includes('openrouter')) return 'openrouter';
        break;

      case 'reasoning':
        // Heavy Reasoning Tasks: Gemini, OpenAI, Anthropic
        if (onlineProviders.includes('gemini')) return 'gemini';
        if (onlineProviders.includes('openai')) return 'openai';
        if (onlineProviders.includes('anthropic')) return 'anthropic';
        break;

      case 'cost':
        // Sort by cost
        const sortedByCost = metrics
          .filter(m => m.isOnline && ProviderRegistry.isProviderEnabled(m.providerId))
          .sort((a, b) => a.totalCostAccumulated - b.totalCostAccumulated);
        if (sortedByCost.length > 0) return sortedByCost[0].providerId;
        break;

      case 'availability':
      default:
        break;
    }

    // Default to sorting by highest availability score among online & enabled providers
    const sortedByAvailability = metrics
      .filter(m => m.isOnline && ProviderRegistry.isProviderEnabled(m.providerId))
      .sort((a, b) => b.availability - a.availability);

    return sortedByAvailability[0]?.providerId || 'gemini';
  }

  /**
   * Constructs the array order for trying models based on the preferred model
   */
  private static getFailoverSequence(preferredId: string): string[] {
    const sequence = [preferredId];
    this.failoverChain.forEach(id => {
      // Ensure only enabled and active providers are added to the sequence
      if (ProviderRegistry.isProviderEnabled(id) && !sequence.includes(id)) {
        sequence.push(id);
      }
    });
    return sequence;
  }

  /**
   * Circuit Breaker Checks
   */
  private static isCircuitBroken(providerId: string): boolean {
    const cb = this.activeCircuitBreakers[providerId];
    if (!cb) return false;

    if (cb.failedCount >= this.FAILURE_THRESHOLD) {
      const now = Date.now();
      if (now - cb.lastFailedTime < this.COOLDOWN_PERIOD_MS) {
        return true;
      } else {
        // Cooldown period passed, reset circuit partially to test status
        cb.failedCount = 1;
        console.log(`[CIRCUIT BREAKER RESET] Cooldown expired. Testing provider [${providerId}] health status...`);
        return false;
      }
    }
    return false;
  }

  private static recordFailure(providerId: string): void {
    const cb = this.activeCircuitBreakers[providerId] || { failedCount: 0, lastFailedTime: 0 };
    cb.failedCount += 1;
    cb.lastFailedTime = Date.now();
    this.activeCircuitBreakers[providerId] = cb;
    console.warn(`[CIRCUIT BREAKER STATUS] Provider [${providerId}] failed ${cb.failedCount}/${this.FAILURE_THRESHOLD} times.`);
  }

  private static recordSuccess(providerId: string): void {
    if (this.activeCircuitBreakers[providerId]) {
      delete this.activeCircuitBreakers[providerId];
    }
  }
}
