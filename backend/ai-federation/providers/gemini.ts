import { GoogleGenAI } from '@google/genai';
import { AIProvider, AIResponse } from './base';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { ProviderStatusService } from '../health/provider-status-service';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini Pro';
  private client: GoogleGenAI | null = null;

  health(): string {
    return ProviderStatusService.getProviderStatus(this.id);
  }

  private getClient(): GoogleGenAI | null {
    if (!this.client) {
      const creds = KeysVault.getCredentials(this.id);
      if (creds.apiKey) {
        this.client = new GoogleGenAI({
          apiKey: creds.apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      }
    }
    return this.client;
  }

  async generate(prompt: string, systemInstruction?: string, config?: any): Promise<AIResponse> {
    const startTime = Date.now();
    const client = this.getClient();

    // Default Token counts & pricing metrics
    const promptTokens = Math.round(prompt.length / 4) + 12;
    let completionTokens = 0;
    let text = '';

    if (!client) {
      const err = new Error('Gemini API client is not configured or API key is missing');
      ProviderHealthRegistry.recordRequest(this.id, Date.now() - startTime, false, 401, promptTokens, 0);
      throw err;
    }

    try {
      const response = await client.models.generateContent({
        model: config?.model || 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are KETRACO SCM Intelligence Nexus. Keep your response contextually helpful, structured and professional.',
          temperature: config?.temperature ?? 0.4,
          maxOutputTokens: config?.maxOutputTokens ?? 1500,
        }
      });
      
      text = response.text || '';
      completionTokens = Math.round(text.length / 4) || 200;
      const latencyMs = Date.now() - startTime;
      const cost = this.estimateCost(promptTokens, completionTokens);

      // Record health telemetry
      ProviderHealthRegistry.recordRequest(this.id, latencyMs, true, 200, promptTokens + completionTokens, cost);

      return {
        text,
        promptTokens,
        completionTokens,
        cost,
        latencyMs,
        provider: this.id,
        model: config?.model || 'gemini-3.8-flash',
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const statusCode = err.status || err.code || 500;
      console.error(`[GEMINI API EXCEPTION] Generation failed: ${err.message || err}`);
      ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, statusCode, promptTokens, 0);
      throw err;
    }
  }

  async *stream(prompt: string, systemInstruction?: string, config?: any): AsyncGenerator<string, void, unknown> {
    const client = this.getClient();
    if (client) {
      try {
        const responseStream = await client.models.generateContentStream({
          model: config?.model || 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 'You are KETRACO SCM Intelligence Nexus.',
            temperature: config?.temperature ?? 0.4,
            maxOutputTokens: config?.maxOutputTokens ?? 1200,
          }
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
        return;
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        console.error(`[GEMINI STREAM ERROR] ${err.message}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, 0, 0);
        throw err;
      }
    }

    throw new Error('Gemini API client is not configured or API key is missing');
  }

  async embed(text: string): Promise<number[]> {
    const client = this.getClient();
    if (client) {
      try {
        const response: any = await client.models.embedContent({
          model: 'text-embedding-004',
          contents: text
        });
        if (response.embedding?.values) {
          return response.embedding.values;
        } else if (response.embeddings?.[0]?.values) {
          return response.embeddings[0].values;
        }
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        console.error(`[GEMINI EMBED ERROR] ${err.message}`);
        ProviderHealthRegistry.recordRequest(this.id, latencyMs, false, 500, 0, 0);
        throw err;
      }
    }

    throw new Error('Gemini API client is not configured or API key is missing');
  }

  async healthCheck(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'ping',
        config: { maxOutputTokens: 5 }
      });
      return true;
    } catch {
      return false;
    }
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // $0.075 / 1M input tokens, $0.30 / 1M output tokens
    return (promptTokens * 0.000000075) + (completionTokens * 0.0000003);
  }

}
