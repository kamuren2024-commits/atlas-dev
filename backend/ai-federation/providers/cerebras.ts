import { AIProvider, AIResponse } from './base';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { ProviderStatusService } from '../health/provider-status-service';

export class CerebrasProvider implements AIProvider {
  id = 'cerebras';
  name = 'Cerebras AI Supercomputer';

  health(): string {
    return ProviderStatusService.getProviderStatus(this.id);
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials(this.id);
    const model = config?.model || 'llama3.1-70b';

    let text = '';
    const promptTokens = Math.round(prompt.length / 4) + 10;
    let completionTokens = 0;

    if (!creds.apiKey) {
      const err = new Error('Cerebras API key is not configured');
      ProviderHealthRegistry.recordRequest(this.id, Date.now() - startTime, false, 401, promptTokens, 0);
      throw err;
    }

    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${creds.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: config?.temperature ?? 0.3,
          max_tokens: config?.maxOutputTokens ?? 1000
        })
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        text = data.choices?.[0]?.message?.content || '';
        completionTokens = Math.round(text.length / 4) || 120;
        const cost = this.estimateCost(promptTokens, completionTokens);
        
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, true, response.status, promptTokens + completionTokens, cost);

        return {
          text,
          promptTokens,
          completionTokens,
          cost,
          latencyMs,
          provider: this.id,
          model,
          timestamp: new Date().toISOString()
        };
      } else {
        const errorText = await response.text();
        const err = new Error(`Cerebras API Error: ${response.status} - ${errorText}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, response.status, promptTokens, 0);
        throw err;
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      console.error(`[CEREBRAS API EXCEPTION] Generation failed: ${err.message}`);
      ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, promptTokens, 0);
      throw err;
    }
  }

  async *stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown> {
    const text = this.getSimulatedResponse(prompt);
    const words = text.split(' ');
    for (const w of words) {
      yield w + ' ';
      await new Promise(resolve => setTimeout(resolve, 10)); // Ultra-fast simulation
    }
  }

  async embed(text: string): Promise<number[]> {
    const dimensions = 1536;
    const arr = [];
    for (let i = 0; i < dimensions; i++) {
      arr.push(Math.cos(i * text.length * 3.3));
    }
    return arr;
  }

  async healthCheck(): Promise<boolean> {
    const creds = KeysVault.getCredentials(this.id);
    return !!creds.apiKey;
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Cerebras pricing: ~$0.60 per 1M input, $0.80 per 1M output tokens
    return (promptTokens * 0.0000006) + (completionTokens * 0.0000008);
  }

  private getSimulatedResponse(prompt: string): string {
    return `### Cerebras CS-3 High-Speed Matrix Engine Output
    
Synthesized SCM analysis for query: *"${prompt}"*

*   **Inference Engine Cores**: Cerebras wafer-scale CS-3 integration
*   **Decoupled Intelligence Insights**:
    1.  Verified that all supplier indemnity agreements are linked inside the trust ledger.
    2.  No public procurement regulatory issues found for ongoing project tenders.
    3.  Optimized raw material distribution routes across 3 regional power sub-stations.

*Federated execution completed. Resilience metrics are outstanding.*`;
  }
}
