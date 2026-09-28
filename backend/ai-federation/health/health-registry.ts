export interface ProviderMetric {
  providerId: string;
  name: string;
  availability: number; // 0.0 to 1.0
  avgLatencyMs: number;
  errorRate: number; // 0.0 to 1.0
  rateLimit429Count: number;
  totalTokensConsumed: number;
  totalCostAccumulated: number;
  lastResponseQualityScore: number; // 1 to 10 scale
  lastChecked: string;
  isOnline: boolean;
}

export class ProviderHealthRegistry {
  private static registry: Map<string, ProviderMetric> = new Map([
    ['gemini', {
      providerId: 'gemini',
      name: 'Google Gemini Pro',
      availability: 1.0,
      avgLatencyMs: 240,
      errorRate: 0.0,
      rateLimit429Count: 0,
      totalTokensConsumed: 0,
      totalCostAccumulated: 0.0,
      lastResponseQualityScore: 9.8,
      lastChecked: new Date().toISOString(),
      isOnline: true
    }],
    ['groq', {
      providerId: 'groq',
      name: 'Groq Llama 3.1 70B',
      availability: 0.98,
      avgLatencyMs: 110,
      errorRate: 0.02,
      rateLimit429Count: 0,
      totalTokensConsumed: 0,
      totalCostAccumulated: 0.0,
      lastResponseQualityScore: 9.0,
      lastChecked: new Date().toISOString(),
      isOnline: true
    }],
    ['openrouter', {
      providerId: 'openrouter',
      name: 'OpenRouter Aggregator',
      availability: 0.99,
      avgLatencyMs: 380,
      errorRate: 0.01,
      rateLimit429Count: 0,
      totalTokensConsumed: 0,
      totalCostAccumulated: 0.0,
      lastResponseQualityScore: 9.2,
      lastChecked: new Date().toISOString(),
      isOnline: true
    }],
    ['cerebras', {
      providerId: 'cerebras',
      name: 'Cerebras High-Speed Llama',
      availability: 0.97,
      avgLatencyMs: 75,
      errorRate: 0.03,
      rateLimit429Count: 0,
      totalTokensConsumed: 0,
      totalCostAccumulated: 0.0,
      lastResponseQualityScore: 8.8,
      lastChecked: new Date().toISOString(),
      isOnline: true
    }],
    ['ollama', {
      providerId: 'ollama',
      name: 'Ollama Local Mistral',
      availability: 1.0,
      avgLatencyMs: 450,
      errorRate: 0.0,
      rateLimit429Count: 0,
      totalTokensConsumed: 0,
      totalCostAccumulated: 0.0,
      lastResponseQualityScore: 8.0,
      lastChecked: new Date().toISOString(),
      isOnline: true
    }]
  ]);

  static getProviderStatus(providerId: string): ProviderMetric | undefined {
    return this.registry.get(providerId);
  }

  static getAllProviderMetrics(): ProviderMetric[] {
    return Array.from(this.registry.values());
  }

  static recordRequest(
    providerId: string, 
    latencyMs: number, 
    isSuccess: boolean, 
    statusCode?: number, 
    tokens?: number, 
    cost?: number
  ): void {
    const metric = this.registry.get(providerId);
    if (!metric) return;

    metric.lastChecked = new Date().toISOString();
    
    // Accumulate tokens and cost
    if (tokens) metric.totalTokensConsumed += tokens;
    if (cost) metric.totalCostAccumulated += cost;

    // Track 429 Rate Limit events
    if (statusCode === 429) {
      metric.rateLimit429Count += 1;
    }

    // Dynamic availability and latency updates
    const weight = 0.15; // Exponential moving average weight
    metric.avgLatencyMs = Math.round(metric.avgLatencyMs * (1 - weight) + latencyMs * weight);
    
    const successVal = isSuccess ? 1.0 : 0.0;
    metric.availability = Number((metric.availability * (1 - weight) + successVal * weight).toFixed(4));
    
    const errorVal = isSuccess ? 0.0 : 1.0;
    metric.errorRate = Number((metric.errorRate * (1 - weight) + errorVal * weight).toFixed(4));

    // Auto toggle online/offline if availability drops below critical thresholds
    if (metric.availability < 0.25 || metric.errorRate > 0.75) {
      metric.isOnline = false;
    } else {
      metric.isOnline = true;
    }

    this.registry.set(providerId, metric);
  }

  static updateResponseQuality(providerId: string, score: number): void {
    const metric = this.registry.get(providerId);
    if (metric) {
      metric.lastResponseQualityScore = Number(((metric.lastResponseQualityScore * 0.8) + (score * 0.2)).toFixed(2));
      this.registry.set(providerId, metric);
    }
  }
}
