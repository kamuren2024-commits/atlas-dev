import { AIModel, InferenceRequest } from '../types';
import { ModelRegistry } from '../registry/model-registry';

export class AIRouter {
  static selectModel(request: InferenceRequest): AIModel {
    const strategy = request.modelStrategy || 'availability';
    const models = ModelRegistry.listModels().filter(m => m.status === 'online');

    if (models.length === 0) {
      throw new Error('No online models available in registry');
    }

    switch (strategy) {
      case 'cost':
        return models.sort((a, b) => a.tokenPricing.prompt - b.tokenPricing.prompt)[0];
      case 'latency':
        return models.sort((a, b) => (a.latencyProfile === 'low' ? 0 : 1) - (b.latencyProfile === 'low' ? 0 : 1))[0];
      case 'reasoning':
        return models.sort((a, b) => (b.capabilities.includes('high-reasoning') ? 1 : 0) - (a.capabilities.includes('high-reasoning') ? 1 : 0))[0];
      case 'availability':
      default:
        return models.sort((a, b) => a.fallbackPriority - b.fallbackPriority)[0];
    }
  }

  static getFailoverChain(primaryModelId: string): string[] {
    const allModels = ModelRegistry.getFallbackPriorityList();
    const chain = [primaryModelId];
    allModels.forEach(m => {
      if (m.id !== primaryModelId && m.status === 'online') {
        chain.push(m.id);
      }
    });
    return chain;
  }
}
