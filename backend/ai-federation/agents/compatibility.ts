import { ModelRouter, RouteOptions } from '../routing/model-router';
import { AIResponse } from '../providers/base';
import { AIFederationGateway, GatewayResponse } from '../gateway/AIFederationGateway';

export class AIService {
  /**
   * Universal provider-agnostic text completion entry point.
   *
   * Phase 1: Runs through the hardened Enterprise AIFederationGateway
   * (validation → correlation → circuit-breaker → retry → timeout → audit → observe),
   * while preserving the exact V1 `AIResponse` return shape for backward compatibility.
   */
  static async generate(
    prompt: string,
    systemInstruction?: string,
    options?: Partial<RouteOptions>
  ): Promise<AIResponse> {
    const gateway = AIFederationGateway.getInstance();

    // Map V1 options into V2 GatewayRequest shape
    const gatewayResponse = await gateway.execute({
      messages: [{ role: 'user', content: prompt }],
      system: systemInstruction,
      temperature: options?.temperature ?? 0.4,
      maxTokens: options?.maxOutputTokens ?? 1200,
      preferredProvider: this.mapStrategyToProvider(options?.strategy),
      metadata: {
        module: options?.module || 'agent',
        workflow: options?.workflow || 'autonomous_audit',
        userId: options?.user || 'SCM_AGENT_FABRIC',
        agentId: options?.agentName,
        agentDepth: options?.agentDepth || 0,
        dataClassification: 'RESTRICTED',
      },
    });

    return this.toV1Response(gatewayResponse);
  }

  /**
   * Universal embed method.
   */
  static async embed(text: string): Promise<number[]> {
    // Forward embedding task to base router (defaulting to Gemini since it handles dense vectors well)
    const gemini = (ModelRouter as any).providers['gemini'];
    if (gemini) {
      return gemini.embed(text);
    }
    throw new Error('No embedding provider available');
  }

  /**
   * Maps the V1 routing strategy to a V2 preferred provider hint.
   */
  private static mapStrategyToProvider(strategy?: string): string | undefined {
    switch (strategy) {
      case 'fast':
        return 'groq';
      case 'reasoning':
        return 'gemini';
      case 'cost':
        return 'deepseek';
      case 'availability':
      default:
        return undefined; // Let the gateway router decide
    }
  }

  /**
   * Normalizes a V2 GatewayResponse into the V1 AIResponse contract.
   */
  private static toV1Response(g: GatewayResponse): AIResponse {
    if (!g.success) {
      throw new Error(g.error || 'AI inference failed');
    }
    return {
      text: g.text,
      promptTokens: g.usage.promptTokens,
      completionTokens: g.usage.completionTokens,
      cost: g.usage.costUsd,
      latencyMs: g.latencyMs,
      provider: g.provider,
      model: g.model,
      timestamp: new Date().toISOString(),
    };
  }
}
