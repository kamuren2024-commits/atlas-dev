// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA MODEL DISCOVERY
// Discovers all installed Ollama models via GET /api/tags and normalizes
// them into LocalModel descriptors for the Atlas Model Registry.
// NO model names are hardcoded — everything is discovered at runtime.
// ============================================================================

import { OllamaClient, OllamaError } from './OllamaClient';
import { LocalModel, OllamaModelTag } from './types';

export class OllamaModelDiscovery {
  private client: OllamaClient;

  constructor(client: OllamaClient) {
    this.client = client;
  }

  /**
   * Discover all installed models from the local Ollama runtime.
   */
  async discover(): Promise<LocalModel[]> {
    const tags = await this.client.listModels();
    return tags.map(tag => this.mapTag(tag));
  }

  /**
   * Discover only Qwen-family models (future-proof: supports all Qwen variants).
   */
  async discoverQwen(): Promise<LocalModel[]> {
    const all = await this.discover();
    return all.filter(m => m.family?.toLowerCase().includes('qwen') || m.name.toLowerCase().includes('qwen'));
  }

  /**
   * Normalize a /api/tags entry into a LocalModel.
   */
  private mapTag(tag: OllamaModelTag): LocalModel {
    return {
      id: tag.name,
      name: tag.name,
      provider: 'ollama',
      size: tag.size,
      modifiedAt: tag.modified_at ? new Date(tag.modified_at) : undefined,
      digest: tag.digest,
      parameterSize: tag.details?.parameter_size,
      quantizationLevel: tag.details?.quantization_level,
      family: tag.details?.family,
      contextLength: tag.details?.context_length,
      deployment: 'LOCAL',
      // Only advertise capabilities explicitly reported by the runtime.
      // Unknown capabilities remain UNKNOWN (i.e. not fabricated).
      status: 'AVAILABLE',
      capabilities: tag.capabilities || [],
    };
  }

  /**
   * Determine whether a model is a Qwen family model.
   */
  static isQwen(model: LocalModel | OllamaModelTag): boolean {
    const name = model.name || '';
    const family = (model as LocalModel).family || (model as OllamaModelTag).details?.family || '';
    return name.toLowerCase().includes('qwen') || family.toLowerCase().includes('qwen');
  }

  /**
   * Resolve a preferred model against discovered models.
   * Returns undefined if no compatible model exists.
   */
  async resolveDefaultModel(preferred?: string): Promise<LocalModel | undefined> {
    let models: LocalModel[];
    try {
      models = await this.discover();
    } catch (err) {
      if (err instanceof OllamaError) throw err;
      return undefined;
    }

    if (models.length === 0) return undefined;

    // 1. Explicit preferred model
    if (preferred) {
      const exact = models.find(m => m.name === preferred);
      if (exact) return exact;
    }

    // 2. Configured default local model
    const configuredDefault = process.env.OLLAMA_DEFAULT_MODEL;
    if (configuredDefault) {
      const hit = models.find(m => m.name === configuredDefault);
      if (hit) return hit;
    }

    // 3. Preferred Qwen model (if preferred contained qwen)
    if (preferred?.toLowerCase().includes('qwen')) {
      const qwen = models.filter(OllamaModelDiscovery.isQwen);
      if (qwen.length > 0) return qwen[0];
    }

    // 4. Available Qwen model
    const qwenModels = models.filter(OllamaModelDiscovery.isQwen);
    if (qwenModels.length > 0) return qwenModels[0];

    // 5. First healthy compatible local model
    return models[0];
  }
}
