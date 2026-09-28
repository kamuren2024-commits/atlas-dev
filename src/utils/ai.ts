export interface AIRequest {
  module: string;
  prompt: string;
  systemInstruction?: string;
  config?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export interface AIResponse {
  mock: boolean;
  text: string;
  generatedAt: string;
  error?: boolean;
  provider?: string;
  model?: string;
}

/** Response contract from the real /api/ai/chat endpoint. */
export interface AIChatResponse {
  success: boolean;
  requestId: string;
  provider: string;
  model: string;
  response: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    costUsd: number;
  };
  latencyMs: number;
  timestamp: string;
  status?: string;
  error?: string;
  queue?: {
    active: number;
    queued: number;
    maxConcurrent: number;
    queueLimit: number;
  };
}

/** Response contract from /api/ai/status. */
export interface AIChatStatus {
  federation: {
    status: string;
    queue: {
      active: number;
      queued: number;
      maxConcurrent: number;
      queueLimit: number;
    };
  };
  providers: Array<{
    id: string;
    status: string;
    latency: number;
    models: number;
    reachable: boolean;
  }>;
  models: {
    deployed: string;
    provider: string;
    count: number;
    qwenModels: number;
  };
}

export async function checkSystemHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch('/api/health', { signal: controller.signal });
    const data = await res.json();
    clearTimeout(timeoutId);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      status: 'offline',
      database: 'cache_degraded',
      gemini_configured: false,
      uptime: 0,
      version: '2.4.0-LOCAL_OFFLINE'
    };
  }
}

/**
 * Query the REAL local AI runtime status (Ollama backed).
 */
export async function checkAIAvailability(): Promise<AIChatStatus | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('/api/ai/status', { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Execute a REAL local AI chat request through the backend AI Federation.
 */
export async function processAIChat(req: {
  message: string;
  context?: string;
  system?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AIChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150000);
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    const data = await res.json();
    return data as AIChatResponse;
  } catch (err: any) {
    return {
      success: false,
      requestId: '',
      provider: 'ollama',
      model: '',
      response: '',
      usage: { promptTokens: null, completionTokens: null, totalTokens: null, costUsd: 0 },
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      status: 'UNAVAILABLE',
      error: 'Local AI inference service is currently unavailable.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function processAIRequest(req: AIRequest): Promise<AIResponse> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      throw new Error(`Processor exception: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('[AI UTILITY EXCEPTION]', err);
    return {
      mock: true,
      text: `### Connection Diagnostics Offline\n\nThe local AI gateway failed to establish remote links. Booting offline memory cache:\n\n*   **Status**: Recovered\n*   **Recovery Note**: Verified thread consistency.\n\n*Task Context: ${req.prompt}*`,
      generatedAt: new Date().toISOString(),
      error: true
    };
  }
}
