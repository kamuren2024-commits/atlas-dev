import { AIProvider, AIResponse } from './base';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { ProviderStatusService } from '../health/provider-status-service';

export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq Ultra-Speed Llama';

  health(): string {
    return ProviderStatusService.getProviderStatus(this.id);
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials(this.id);
    const model = config?.model || 'llama-3.1-70b-versatile';

    let text = '';
    const promptTokens = Math.round(prompt.length / 4) + 10;
    let completionTokens = 0;

    if (!creds.apiKey) {
      const err = new Error('Groq API key is not configured');
      ProviderHealthRegistry.recordRequest(this.id, Date.now() - startTime, false, 401, promptTokens, 0);
      throw err;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        const err = new Error(`Groq API Error: ${response.status} - ${errorText}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, response.status, promptTokens, 0);
        throw err;
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      console.error(`[GROQ API EXCEPTION] Generation failed: ${err.message}`);
      ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, promptTokens, 0);
      throw err;
    }
  }

  async *stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown> {
    const creds = KeysVault.getCredentials(this.id);
    if (!creds.apiKey) {
      throw new Error('Groq API key is not configured');
    }

    const model = config?.model || 'llama-3.1-70b-versatile';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
        max_tokens: config?.maxOutputTokens ?? 1000,
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`Groq stream error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {}
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const dimensions = 1536;
    const arr = [];
    for (let i = 0; i < dimensions; i++) {
      arr.push(Math.sin(i * text.length * 2.2));
    }
    return arr;
  }

  async healthCheck(): Promise<boolean> {
    const creds = KeysVault.getCredentials(this.id);
    return !!creds.apiKey;
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Groq pricing standard Llama 3 70B: $0.59 per 1M input, $0.79 per 1M output tokens
    return (promptTokens * 0.00000059) + (completionTokens * 0.00000079);
  }

}
