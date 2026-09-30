// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA CLIENT
// Production-grade HTTP client for the local Ollama runtime.
// Supports: health, listModels, getModel, generate, chat, stream.
// No fabricated responses. No simulated fallbacks.
// ============================================================================

import { ConfigService } from '../../../core/config/config-loader';
import {
  OllamaModelTag,
  OllamaGenerateResponse,
  OllamaChatRequest,
  OllamaGenerateRequest,
  OllamaHealth,
} from './types';

export type OllamaErrorCode =
  | 'CONNECTION_REFUSED'
  | 'CONNECTION_TIMEOUT'
  | 'RESPONSE_TIMEOUT'
  | 'MODEL_NOT_FOUND'
  | 'HTTP_ERROR'
  | 'INVALID_RESPONSE'
  | 'ABORTED';

export class OllamaError extends Error {
  code: OllamaErrorCode;
  status?: number;
  provider = 'ollama';
  retryable: boolean;
  constructor(code: OllamaErrorCode, message: string, options?: { status?: number; cause?: unknown; retryable?: boolean }) {
    super(message);
    this.name = 'OllamaError';
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
    this.retryable = options?.retryable ?? false;
  }
}

export interface OllamaClientConfig {
  baseUrl: string;
  timeoutMs: number;
  connectTimeoutMs: number;
}

const DEFAULTS: OllamaClientConfig = {
  baseUrl: 'http://127.0.0.1:11434',
  timeoutMs: 120_000,
  connectTimeoutMs: 10_000,
};

function normalizeOllamaBaseUrl(raw?: string): string {
  const candidate = (raw || '').trim();
  if (!candidate) return DEFAULTS.baseUrl;

  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `http://${candidate}`;
  try {
    const url = new URL(withScheme);
    return url.origin.replace(/\/$/, '');
  } catch {
    return DEFAULTS.baseUrl;
  }
}

export class OllamaClient {
  private config: OllamaClientConfig;

  constructor(overrides?: Partial<OllamaClientConfig>) {
    ConfigService.init();
    const configuredBaseUrl = overrides?.baseUrl ||
      ConfigService.get('OLLAMA_BASE_URL') ||
      ConfigService.get('OLLAMA_HOST') ||
      process.env.OLLAMA_BASE_URL ||
      process.env.OLLAMA_HOST ||
      DEFAULTS.baseUrl;

    this.config = {
      baseUrl: normalizeOllamaBaseUrl(configuredBaseUrl),
      timeoutMs:
        overrides?.timeoutMs ??
        (() => {
          const v = Number(process.env.OLLAMA_TIMEOUT_MS);
          return Number.isFinite(v) && v > 0 ? v : DEFAULTS.timeoutMs;
        })(),
      connectTimeoutMs:
        overrides?.connectTimeoutMs ??
        (() => {
          const v = Number(process.env.OLLAMA_CONNECT_TIMEOUT_MS);
          return Number.isFinite(v) && v > 0 ? v : DEFAULTS.connectTimeoutMs;
        })(),
    };
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  get timeoutMs(): number {
    return this.config.timeoutMs;
  }

  /**
   * Create an AbortController with a connection timeout that aborts if the
   * server does not even accept the connection within connectTimeoutMs.
   */
  private createController(timeoutMs?: number): { controller: AbortController; clear: () => void } {
    const controller = new AbortController();
    const effectiveTimeout = timeoutMs ?? this.config.timeoutMs;
    const timer = setTimeout(() => controller.abort(), effectiveTimeout);
    return { controller, clear: () => clearTimeout(timer) };
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    { responseTimeoutMs, connectOnly = false, signal }: { responseTimeoutMs?: number; connectOnly?: boolean; signal?: AbortSignal } = {}
  ): Promise<T> {
    const { controller, clear } = this.createController(responseTimeoutMs);
    const connectController = new AbortController();
    const connectTimer = setTimeout(() => connectController.abort(), this.config.connectTimeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, {
        ...init,
        signal: signal || controller.signal,
        headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      });
    } catch (err: any) {
      clear();
      clearTimeout(connectTimer);
      if (err?.name === 'AbortError') {
        if (signal?.aborted) {
          throw new OllamaError('ABORTED', 'Ollama request was aborted by the caller', { cause: err });
        }
        if (connectController.signal.aborted) {
          throw new OllamaError('CONNECTION_TIMEOUT', `Connection to Ollama timed out after ${this.config.connectTimeoutMs}ms`, { cause: err });
        }
        throw new OllamaError('RESPONSE_TIMEOUT', `Ollama request timed out after ${responseTimeoutMs ?? this.config.timeoutMs}ms`, { cause: err, retryable: true });
      }
      const isConnRefused = /ECONNREFUSED|fetch failed|Failed to fetch|connect/i.test(err?.message || '');
      throw new OllamaError('CONNECTION_REFUSED', `Unable to reach Ollama at ${this.config.baseUrl}: ${err?.message || 'connection failed'}`, { cause: err, retryable: true });
    } finally {
      clearTimeout(connectTimer);
    }

    if (connectOnly) return response as unknown as T;

    if (!response.ok) {
      clear();
      if (response.status === 404) {
        throw new OllamaError('MODEL_NOT_FOUND', `Ollama resource not found (404)`, { status: 404, retryable: false });
      }
      const text = await response.text().catch(() => '');
      throw new OllamaError('HTTP_ERROR', `Ollama HTTP ${response.status}: ${text}`, { status: response.status, retryable: response.status >= 500 || response.status === 429 });
    }

    const data = await response.json().catch(() => {
      clear();
      throw new OllamaError('INVALID_RESPONSE', 'Ollama returned an unparseable response body');
    });
    clear();
    return data as T;
  }

  /**
   * Health check — verifies the runtime is reachable and counts models.
   */
  async health(timeoutMs?: number): Promise<OllamaHealth> {
    const start = Date.now();
    try {
      const data = await this.listModels(timeoutMs);
      return {
        reachable: true,
        modelCount: data.length,
        modelNames: data.map(m => m.name),
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        reachable: false,
        modelCount: 0,
        modelNames: [],
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
        error: err instanceof OllamaError ? err.message : String(err?.message || err),
      };
    }
  }

  /**
   * List all installed models via GET /api/tags.
   */
  async listModels(timeoutMs?: number): Promise<OllamaModelTag[]> {
    const data = await this.request<{ models: OllamaModelTag[] }>(
      '/api/tags',
      { method: 'GET' },
      { responseTimeoutMs: timeoutMs ?? this.config.connectTimeoutMs + 5000 }
    );
    return data.models || [];
  }

  /**
   * Get a single model by exact name.
   */
  async getModel(name: string, timeoutMs?: number): Promise<OllamaModelTag | undefined> {
    const models = await this.listModels(timeoutMs);
    return models.find(m => m.name === name);
  }

  /**
   * Non-streaming generate (single prompt).
   */
  async generate(req: OllamaGenerateRequest, options?: { timeoutMs?: number; signal?: AbortSignal }): Promise<OllamaGenerateResponse> {
    return this.request<OllamaGenerateResponse>(
      '/api/generate',
      {
        method: 'POST',
        body: JSON.stringify({ ...req, stream: false }),
      },
      { responseTimeoutMs: options?.timeoutMs ?? this.config.timeoutMs, signal: options?.signal }
    );
  }

  /**
   * Non-streaming chat (message payloads). Preferred for Qwen-family chat.
   */
  async chat(req: OllamaChatRequest, options?: { timeoutMs?: number; signal?: AbortSignal }): Promise<OllamaGenerateResponse> {
    return this.request<OllamaGenerateResponse>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({ ...req, stream: false }),
      },
      { responseTimeoutMs: options?.timeoutMs ?? this.config.timeoutMs, signal: options?.signal }
    );
  }

  /**
   * Streaming generate — yields incremental text deltas.
   */
  async *streamGenerate(req: OllamaGenerateRequest, options?: { timeoutMs?: number }): AsyncGenerator<string, void, unknown> {
    const { controller, clear } = this.createController(options?.timeoutMs ?? this.config.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, stream: true }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clear();
      if (err?.name === 'AbortError') {
        throw new OllamaError('RESPONSE_TIMEOUT', `Ollama stream timed out`, { cause: err, retryable: true });
      }
      throw new OllamaError('CONNECTION_REFUSED', `Unable to reach Ollama: ${err?.message || 'connection failed'}`, { cause: err, retryable: true });
    }

    if (!response.ok || !response.body) {
      clear();
      throw new OllamaError('HTTP_ERROR', `Ollama stream HTTP ${response.status}`, { status: response.status, retryable: response.status >= 500 });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.response) {
              yield chunk.response as string;
            }
            if (chunk.done) break;
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      clear();
      reader.releaseLock();
    }
  }

  /**
   * Streaming chat — yields incremental text deltas.
   */
  async *streamChat(req: OllamaChatRequest, options?: { timeoutMs?: number }): AsyncGenerator<string, void, unknown> {
    const { controller, clear } = this.createController(options?.timeoutMs ?? this.config.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, stream: true }),
        signal: controller.signal,
      });
    } catch (err: any) {
      clear();
      if (err?.name === 'AbortError') {
        throw new OllamaError('RESPONSE_TIMEOUT', `Ollama stream timed out`, { cause: err, retryable: true });
      }
      throw new OllamaError('CONNECTION_REFUSED', `Unable to reach Ollama: ${err?.message || 'connection failed'}`, { cause: err, retryable: true });
    }

    if (!response.ok || !response.body) {
      clear();
      throw new OllamaError('HTTP_ERROR', `Ollama stream HTTP ${response.status}`, { status: response.status, retryable: response.status >= 500 });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.message?.content) {
              yield chunk.message.content as string;
            }
            if (chunk.done) break;
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      clear();
      reader.releaseLock();
    }
  }
}
