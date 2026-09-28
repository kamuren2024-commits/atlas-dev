import { AIModel } from '../types';

export class ModelRegistry {
  private static models: Map<string, AIModel> = new Map();

  static initialize() {
    const defaultModels: AIModel[] = [
      {
        id: 'gemini-3.8-flash',
        provider: 'gemini',
        name: 'Gemini 3.8 Flash',
        version: 'latest',
        capabilities: ['text', 'vision', 'audio', 'tools'],
        contextWindow: 1000000,
        supportedTools: ['googleSearch', 'googleMaps', 'codeInterpreter'],
        latencyProfile: 'low',
        tokenPricing: { prompt: 0.0000001, completion: 0.0000003 },
        fallbackPriority: 1,
        status: 'online'
      },
      {
        id: 'gemini-3.1-pro-preview',
        provider: 'gemini',
        name: 'Gemini 3.1 Pro',
        version: 'preview',
        capabilities: ['text', 'vision', 'audio', 'tools', 'high-reasoning'],
        contextWindow: 2000000,
        supportedTools: ['googleSearch', 'googleMaps', 'codeInterpreter'],
        latencyProfile: 'medium',
        tokenPricing: { prompt: 0.00000125, completion: 0.00000375 },
        fallbackPriority: 2,
        status: 'online'
      },
      {
        id: 'llama-3.1-70b-versatile',
        provider: 'groq',
        name: 'Llama 3.1 70B',
        version: 'latest',
        capabilities: ['text', 'tools'],
        contextWindow: 128000,
        supportedTools: [],
        latencyProfile: 'low',
        tokenPricing: { prompt: 0.0000005, completion: 0.0000008 },
        fallbackPriority: 3,
        status: 'online'
      }
    ];

    defaultModels.forEach(m => this.models.set(m.id, m));
  }

  static getModel(id: string): AIModel | undefined {
    if (this.models.size === 0) this.initialize();
    return this.models.get(id);
  }

  static listModels(): AIModel[] {
    if (this.models.size === 0) this.initialize();
    return Array.from(this.models.values());
  }

  static getFallbackPriorityList(): AIModel[] {
    return this.listModels().sort((a, b) => a.fallbackPriority - b.fallbackPriority);
  }
}
