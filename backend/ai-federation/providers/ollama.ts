import { AIProvider, AIResponse } from './base';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { ProviderStatusService } from '../health/provider-status-service';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama Local Mistral';

  health(): string {
    return ProviderStatusService.getProviderStatus(this.id);
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials(this.id);
    const model = config?.model || 'mistral';

    let text = '';
    const promptTokens = Math.round(prompt.length / 4) + 10;
    let completionTokens = 0;
    let isMock = true;

    // In a real environment, Ollama can run on localhost:11434
    if (creds.apiKey) {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            prompt,
            system: systemInstruction,
            stream: false,
            options: {
              temperature: config?.temperature ?? 0.3
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          text = data.response || '';
          isMock = false;
        } else {
          const err = new Error(`Ollama API Error: ${response.status}`);
          ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, response.status, promptTokens, 0);
          throw err;
        }
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        console.error(`[OLLAMA API EXCEPTION] Generation failed: ${err.message}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, promptTokens, 0);
        throw err;
      }
    } else {
      const err = new Error('Ollama API key is not configured');
      ProviderHealthRegistry.recordRequest(this.id, Date.now() - startTime, false, 401, promptTokens, 0);
      throw err;
    }

    completionTokens = Math.round(text.length / 4) || 120;
    const latencyMs = Date.now() - startTime;
    const cost = this.estimateCost(promptTokens, completionTokens); // $0 cost as local model!

    ProviderHealthRegistry.recordRequest(this.id, latencyMs, true, 200, promptTokens + completionTokens, cost);

    return {
      text,
      promptTokens,
      completionTokens,
      cost,
      latencyMs,
      provider: this.id,
      model: isMock ? `${model}-local-simulated` : model,
      timestamp: new Date().toISOString()
    };
  }

  async *stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown> {
    const creds = KeysVault.getCredentials(this.id);
    if (!creds.apiKey) {
      throw new Error('Ollama API key is not configured');
    }

    const model = config?.model || 'mistral';
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemInstruction,
        stream: true,
        options: { temperature: config?.temperature ?? 0.3 }
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama stream error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) yield json.response;
        } catch {}
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const dimensions = 1536;
    const arr = [];
    for (let i = 0; i < dimensions; i++) {
      arr.push(Math.sin(i * text.length * 4.4));
    }
    return arr;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      return response.ok;
    } catch {
      return false;
    }
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return 0.0; // Local Ollama models consume zero monetary API costs!
  }

}
