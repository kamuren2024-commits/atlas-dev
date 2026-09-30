import { randomUUID } from 'node:crypto';
import { OllamaClient, OllamaError } from './OllamaClient';
import {
  OllamaFailureClass,
  OllamaModelEvaluation,
  OllamaModelTag,
  OllamaProbeEvidence,
  OllamaProbeStatus,
} from './types';

export interface OllamaEvaluationOptions {
  timeoutMs?: number;
  boundedTimeoutMs?: number;
  cancellationTimeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function classifyError(error: unknown, streaming = false): OllamaFailureClass {
  if (error instanceof OllamaError) {
    if (error.code === 'MODEL_NOT_FOUND') return 'MODEL_NOT_FOUND';
    if (error.code === 'ABORTED') return 'REQUEST_ABORTED';
    if (error.code === 'CONNECTION_REFUSED' || error.code === 'CONNECTION_TIMEOUT') return 'CONNECTIVITY_FAILURE';
    if (error.code === 'RESPONSE_TIMEOUT') return streaming ? 'STREAM_TIMEOUT' : 'INFERENCE_TIMEOUT';
    if (error.code === 'INVALID_RESPONSE') return 'INVALID_RESPONSE';
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/out of memory|oom|memory/i.test(message)) return 'OUT_OF_MEMORY';
  if (/model.*(load|loading)|load.*model/i.test(message)) return 'MODEL_LOAD_FAILURE';
  if (/aborted|abort/i.test(message)) return 'REQUEST_ABORTED';
  if (/timeout|timed out/i.test(message)) return streaming ? 'STREAM_TIMEOUT' : 'INFERENCE_TIMEOUT';
  if (/not found|404/i.test(message)) return 'MODEL_NOT_FOUND';
  return 'RUNTIME_ERROR';
}

function evidence(
  model: string,
  requestId: string,
  traceId: string,
  started: number,
  timeoutMs: number,
  params: Partial<OllamaProbeEvidence> = {},
): OllamaProbeEvidence {
  return {
    provider: 'ollama',
    model,
    requestId,
    traceId,
    startedAt: new Date(started).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    timeoutMs,
    status: 'UNVERIFIED',
    responseBytes: 0,
    streaming: false,
    structuredOutput: false,
    toolCalling: false,
    ...params,
  };
}

function successful(
  model: string,
  requestId: string,
  traceId: string,
  started: number,
  timeoutMs: number,
  params: Partial<OllamaProbeEvidence> = {},
): OllamaProbeEvidence {
  return evidence(model, requestId, traceId, started, timeoutMs, { status: 'PASS', errorClass: 'SUCCESS', ...params });
}

export class OllamaRuntimeEvaluator {
  constructor(private readonly client: OllamaClient) {}

  async evaluateModel(model: OllamaModelTag, options: OllamaEvaluationOptions = {}): Promise<OllamaModelEvaluation> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const boundedTimeoutMs = options.boundedTimeoutMs ?? Math.min(timeoutMs, 10_000);
    const cancellationTimeoutMs = options.cancellationTimeoutMs ?? Math.min(timeoutMs, 1_000);
    const traceRefs: string[] = [];
    const errors: Array<{ class: OllamaFailureClass; message: string }> = [];
    const runId = randomUUID();

    const connectivityStarted = Date.now();
    let connectivity: OllamaProbeEvidence;
    try {
      const models = await this.client.listModels(timeoutMs);
      const found = models.some(candidate => candidate.name === model.name);
      connectivity = found
        ? successful(model.name, `${runId}-connectivity`, runId, connectivityStarted, timeoutMs, { responseBytes: JSON.stringify(models).length })
        : evidence(model.name, `${runId}-connectivity`, runId, connectivityStarted, timeoutMs, {
            status: 'FAIL', errorClass: 'MODEL_NOT_FOUND', errorMessage: `Model ${model.name} was not present in /api/tags`,
          });
    } catch (error) {
      const errorClass = classifyError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      connectivity = evidence(model.name, `${runId}-connectivity`, runId, connectivityStarted, timeoutMs, {
        status: 'FAIL', errorClass, errorMessage,
      });
      errors.push({ class: errorClass, message: errorMessage });
    }
    traceRefs.push(connectivity.traceId);

    const minimalInference = await this.runInference(model.name, 'Return exactly: ATLAS_OLLAMA_OK', timeoutMs, runId, 'minimalInference', errors);
    const boundedInference = await this.runInference(model.name, 'Return exactly: ATLAS_OLLAMA_OK', boundedTimeoutMs, runId, 'boundedInference', errors, {
      temperature: 0,
      num_predict: 16,
      context: model.details?.context_length,
    });
    const streaming = await this.runStreaming(model.name, boundedTimeoutMs, runId, errors);
    const structuredOutput = await this.runStructured(model.name, boundedTimeoutMs, runId, errors);
    const toolCalling = this.toolProbe(model.name, runId);
    const cancellation = await this.runCancellation(model.name, cancellationTimeoutMs, runId, errors);

    const capabilities: Record<string, OllamaProbeStatus> = {
      TEXT_GENERATION: minimalInference.status === 'PASS' ? 'PASS' : 'UNVERIFIED',
      STREAMING: streaming.status,
      STRUCTURED_OUTPUT: structuredOutput.status,
      TOOL_CALLING: toolCalling.status,
      VISION: model.capabilities?.includes('vision') ? 'UNVERIFIED' : 'UNSUPPORTED',
      AUDIO: 'UNSUPPORTED',
      THINKING: model.capabilities?.includes('thinking') ? 'UNVERIFIED' : 'UNSUPPORTED',
      LONG_CONTEXT: model.details?.context_length ? 'UNVERIFIED' : 'UNSUPPORTED',
    };
    const requiredPass = [minimalInference, boundedInference, streaming, structuredOutput]
      .every(test => test.status === 'PASS');
    const status: OllamaModelEvaluation['status'] = requiredPass
      ? (toolCalling.status === 'UNSUPPORTED' ? 'PASSED_WITH_RESTRICTIONS' : 'PASSED')
      : (connectivity.status === 'PASS' ? 'FAILED' : 'UNVERIFIED');

    return {
      provider: 'ollama',
      model: model.name,
      evaluationVersion: '1.0',
      status,
      tests: { connectivity, minimalInference, boundedInference, streaming, structuredOutput, toolCalling, cancellation },
      capabilities,
      errors,
      traceRefs,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private async runInference(
    model: string,
    prompt: string,
    timeoutMs: number,
    runId: string,
    testName: string,
    errors: Array<{ class: OllamaFailureClass; message: string }>,
    parameters: Record<string, unknown> = {},
  ): Promise<OllamaProbeEvidence> {
    const started = Date.now();
    const requestId = `${runId}-${testName}`;
    try {
      const response = await this.client.generate({ model, prompt, ...parameters }, { timeoutMs });
      const text = response.response || response.message?.content || '';
      if (!text.trim()) throw new OllamaError('INVALID_RESPONSE', 'Ollama returned an empty response');
      return successful(model, requestId, runId, started, timeoutMs, {
        responseBytes: Buffer.byteLength(text), tokensIfAvailable: response.eval_count,
        parameters,
      });
    } catch (error) {
      const errorClass = classifyError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ class: errorClass, message: errorMessage });
      return evidence(model, requestId, runId, started, timeoutMs, { status: 'FAIL', errorClass, errorMessage, parameters });
    }
  }

  private async runStreaming(model: string, timeoutMs: number, runId: string, errors: Array<{ class: OllamaFailureClass; message: string }>): Promise<OllamaProbeEvidence> {
    const started = Date.now();
    const requestId = `${runId}-streaming`;
    let output = '';
    try {
      for await (const chunk of this.client.streamGenerate({ model, prompt: 'Return exactly: ATLAS_OLLAMA_OK', temperature: 0, num_predict: 16 }, { timeoutMs })) {
        output += chunk;
      }
      if (!output.trim()) throw new OllamaError('INVALID_RESPONSE', 'Ollama stream completed without output');
      return successful(model, requestId, runId, started, timeoutMs, { responseBytes: Buffer.byteLength(output), streaming: true });
    } catch (error) {
      const errorClass = classifyError(error, true);
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ class: errorClass, message: errorMessage });
      return evidence(model, requestId, runId, started, timeoutMs, { status: 'FAIL', errorClass, errorMessage, responseBytes: Buffer.byteLength(output), streaming: true });
    }
  }

  private async runStructured(model: string, timeoutMs: number, runId: string, errors: Array<{ class: OllamaFailureClass; message: string }>): Promise<OllamaProbeEvidence> {
    const started = Date.now();
    const requestId = `${runId}-structured`;
    try {
      const response = await this.client.generate({
        model,
        prompt: 'Return only JSON: {"status":"ok","model":"' + model + '","test":"ollama"}',
        temperature: 0,
        num_predict: 64,
        options: { format: 'json' },
      }, { timeoutMs });
      const text = response.response || '';
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (parsed.status !== 'ok' || parsed.model !== model || parsed.test !== 'ollama') {
        throw new OllamaError('INVALID_RESPONSE', 'Structured output did not match the required shape');
      }
      return successful(model, requestId, runId, started, timeoutMs, { responseBytes: Buffer.byteLength(text), structuredOutput: true });
    } catch (error) {
      const errorClass = error instanceof SyntaxError ? 'MALFORMED_RESPONSE' : classifyError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ class: errorClass, message: errorMessage });
      return evidence(model, requestId, runId, started, timeoutMs, { status: 'FAIL', errorClass, errorMessage, structuredOutput: true });
    }
  }

  private toolProbe(model: string, runId: string): OllamaProbeEvidence {
    return evidence(model, `${runId}-tools`, runId, Date.now(), 0, {
      status: 'UNSUPPORTED', errorClass: 'UNSUPPORTED_CAPABILITY',
      errorMessage: 'Ollama tool round-trip is not implemented by the current provider contract',
      toolCalling: true,
    });
  }

  private async runCancellation(model: string, timeoutMs: number, runId: string, errors: Array<{ class: OllamaFailureClass; message: string }>): Promise<OllamaProbeEvidence> {
    const started = Date.now();
    const requestId = `${runId}-cancellation`;
    const controller = new AbortController();
    const cancellation = this.client.generate({ model, prompt: 'Return exactly: ATLAS_OLLAMA_OK', num_predict: 16 }, { timeoutMs, signal: controller.signal });
    controller.abort();
    try {
      await cancellation;
      return evidence(model, requestId, runId, started, timeoutMs, {
        status: 'UNVERIFIED', errorClass: 'REQUEST_ABORTED', errorMessage: 'Client contract does not expose an AbortSignal',
      });
    } catch (error) {
      const errorClass = classifyError(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ class: errorClass, message: errorMessage });
      return evidence(model, requestId, runId, started, timeoutMs, { status: errorClass === 'REQUEST_ABORTED' ? 'PASS' : 'FAIL', errorClass, errorMessage });
    }
  }
}
