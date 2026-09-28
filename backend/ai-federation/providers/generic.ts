import { AIProvider, AIResponse } from './base';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { AIConfig } from '../config/provider-config';
import { ProviderStatusService } from '../health/provider-status-service';

export class GenericProvider implements AIProvider {
  id: string;
  name: string;
  endpoint: string;
  defaultModel: string;

  health(): string {
    return ProviderStatusService.getProviderStatus(this.id);
  }

  constructor(id: string, name: string, endpoint: string, defaultModel: string) {
    this.id = id;
    this.name = name;
    this.endpoint = endpoint;
    this.defaultModel = defaultModel;
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials(this.id);
    const configured = AIConfig.providers[this.id];
    const model = config?.model || configured?.model || this.defaultModel;

    const promptTokens = Math.round(prompt.length / 4) + 12;

    if (!creds.apiKey) {
      const err = new Error(`API key for generic provider ${this.id} is not configured`);
      ProviderHealthRegistry.recordRequest(this.id, Date.now() - startTime, false, 401, promptTokens, 0);
      throw err;
    }

    try {
      const body: any = {
        model,
        temperature: config?.temperature ?? 0.3,
        max_tokens: config?.maxOutputTokens ?? 1000
      };

      if (this.id === 'anthropic') {
        // Anthropic-style messages endpoint
        body.messages = [{ role: 'user', content: prompt }];
        if (systemInstruction) {
          body.system = systemInstruction;
        }
      } else {
        // Standard OpenAI-compatible format
        body.messages = [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ];
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creds.apiKey}`
      };

      if (this.id === 'anthropic') {
        headers['x-api-key'] = creds.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        delete headers['Authorization'];
      }

      const response = await fetch(creds.apiBase || this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        let text = '';
        if (this.id === 'anthropic') {
          text = data.content?.[0]?.text || '';
        } else {
          text = data.choices?.[0]?.message?.content || '';
        }
        const completionTokens = Math.round(text.length / 4) || 120;
        const cost = this.estimateCost(promptTokens, completionTokens);

        ProviderHealthRegistry.recordRequest(this.id, latencyMs, true, response.status, promptTokens + completionTokens, cost);

        return {
          text,
          model,
          promptTokens,
          completionTokens,
          cost,
          latencyMs,
          provider: this.id,
          timestamp: new Date().toISOString()
        };
      } else {
        const errorText = await response.text();
        const err = new Error(`${this.name} API Error: ${response.status} - ${errorText}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, response.status, promptTokens, 0);
        throw err;
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      console.error(`[${this.id.toUpperCase()} API EXCEPTION] Generation failed: ${err.message}`);
      ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, promptTokens, 0);
      throw err;
    }
  }

  async *stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown> {
    const response = await this.generate(prompt, systemInstruction, config);
    const words = response.text.split(' ');
    for (const w of words) {
      yield w + ' ';
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }

  async embed(text: string): Promise<number[]> {
    // Standard embed simulator returning stable embeddings
    const dims = 1536;
    const emb: number[] = [];
    for (let i = 0; i < dims; i++) {
      const charCode = text.charCodeAt(i % text.length) || 0;
      emb.push(Math.sin(i + charCode) / 10);
    }
    return emb;
  }

  async healthCheck(): Promise<boolean> {
    const creds = KeysVault.getCredentials(this.id);
    return !!creds.apiKey;
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Custom enterprise cost-mapping structure based on standard pricing tiers
    let inputPrice = 0.0000015; // default $1.50 per million
    let outputPrice = 0.000006;  // default $6.00 per million

    switch (this.id) {
      case 'openai':
        inputPrice = 0.0000025; // GPT-5 estimate
        outputPrice = 0.000010;
        break;
      case 'anthropic':
        inputPrice = 0.000015;  // Claude Opus level
        outputPrice = 0.000075;
        break;
      case 'deepseek':
        inputPrice = 0.00000014; // Ultra low-cost deepseek
        outputPrice = 0.00000028;
        break;
      case 'together':
      case 'fireworks':
        inputPrice = 0.0000002;
        outputPrice = 0.0000006;
        break;
      case 'huggingface':
        inputPrice = 0.0000005;
        outputPrice = 0.0000015;
        break;
    }

    return (promptTokens * inputPrice) + (completionTokens * outputPrice);
  }

  private getSimulatedResponse(prompt: string): string {
    const lower = prompt.toLowerCase();
    let topic = 'procurement optimization';
    if (lower.includes('tender') || lower.includes('bid')) topic = 'bid & tender compliance reviews';
    else if (lower.includes('logistic') || lower.includes('shipping')) topic = 'supply chain logistics routing';
    else if (lower.includes('inventory') || lower.includes('stock')) topic = 'real-time inventory replenishment models';
    else if (lower.includes('risk') || lower.includes('hazard')) topic = 'SCM risk and buffer vulnerability profiles';
    
    return `[${this.name} SCM Intelligence Cluster]\n\nProcessing supply chain simulation for ${topic}.\n\nSalience Atlas successfully established a secure, cost-governed channel to the "${this.id}" provider cluster. The model analyzed the tender, cost boundaries, and logistics metrics.\n\nKey Insights:\n1. Re-prioritizing transport corridors reduces transit times by 14%.\n2. Intelligent buffering policies absorb supply disruptions of up to 18 days.\n3. Digital ledger alignment minimizes procurement approval cycles to less than 4 hours.`;
  }
}
