// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AI GATEWAY (COMPATIBILITY LAYER)
// Unified gateway delegating to the AI Federation Orchestrator
// ============================================================================

import {
  InferenceRequest,
  InferenceResponse,
  ExecutionContext,
  PromptTemplate,
} from './types';
import { PromptRegistry } from './registry/prompt-registry';
import { ContextAssembler } from './context/context-assembler';
import { SafetyPipeline } from './safety/safety-pipeline';
import { EvaluationService } from './evaluation/evaluation-service';
import { DatabaseCore } from '../database/db-core';
import { AIOrchestrator } from '../ai-federation/federation/AIOrchestrator';
import { FailoverEngine } from '../ai-federation/federation/FailoverEngine';
import { generateId } from '../../src/core/shared/crypto';

export class AIGateway {
  private static db = DatabaseCore.getInstance();
  private static orchestrator = AIOrchestrator.getInstance();
  private static failover = FailoverEngine.getInstance();

  /**
   * Primary entry point for all AI Inference in the platform.
   * Delegates to the AI Federation V2 Orchestrator for multi-provider routing.
   */
  static async execute(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const requestId = generateId('req');
    const context: ExecutionContext = request.context || { tenantId: 'default' };

    console.log(`[AI-GATEWAY] Processing inference request ${requestId} via Federation...`);

    // 1. Resolve Prompt
    let promptTemplate: PromptTemplate | null = null;
    if (request.promptName) {
      promptTemplate = await PromptRegistry.getPrompt(request.promptName, request.promptVersion);
      if (!promptTemplate) throw new Error(`Prompt ${request.promptName} not found`);
    }

    const rawPrompt = promptTemplate ? promptTemplate.content : (request.rawPrompt || '');
    const systemInstruction = promptTemplate?.systemInstruction;

    // 2. Assemble Context
    const assembledPrompt = await ContextAssembler.assemble(rawPrompt, request.variables || {}, context);

    // 3. Safety Check (Input)
    const safetyInput = await SafetyPipeline.validateInput(assembledPrompt);
    if (!safetyInput.isSafe) {
      throw new Error(`AI Safety Violation (Input): ${safetyInput.reason}`);
    }

    // 4. Execute via the AI Federation Orchestrator
    const strategy = request.modelStrategy || 'availability';

    const response = await this.orchestrator.executeForMission(
      context.moduleId ? context.moduleId.toUpperCase().replace(/-/g, '_') : 'ENTERPRISE_INFERENCE',
      assembledPrompt,
      {
        userId: context.userId,
        agentId: request.overrides?.model,
        agentDepth: 0,
        module: context.moduleId || 'enterprise',
        workflow: context.workflowId,
        tenantId: context.tenantId || 'ketraco',
        requiredCapabilities: [],
        systemPrompt: systemInstruction,
        temperature: request.overrides?.temperature,
        maxTokens: request.overrides?.maxTokens,
        preferredDeployment: strategy === 'cost' ? 'ANY' : 'LOCAL_OR_PRIVATE',
      },
      {
        classification: 'CONFIDENTIAL',
        requireAudit: true,
        requireCitation: false,
        temperature: request.overrides?.temperature,
        maxTokens: request.overrides?.maxTokens,
      }
    );

    if (!response.success) {
      await this.logExecution(
        requestId,
        context,
        '',
        '',
        0,
        0,
        0,
        Date.now() - startTime,
        'FAILED',
        response.error || 'Unknown error'
      );
      throw new Error(`Enterprise AI Runtime Inference Failure: ${response.error}`);
    }

    const resultText = response.text;
    const finalModelId = response.model;
    const finalProvider = response.provider;

    // 5. Safety Check (Output)
    const safetyOutput = await SafetyPipeline.validateOutput(resultText);
    let finalText = resultText;
    if (!safetyOutput.isSafe) {
      finalText = `[REDACTED]: ${safetyOutput.reason}`;
    }

    const usage = {
      promptTokens: Math.round(assembledPrompt.length / 4),
      completionTokens: Math.round(finalText.length / 4),
      totalTokens: Math.round(assembledPrompt.length / 4) + Math.round(finalText.length / 4),
      cost: response.costUsd,
    };

    const inferenceResponse: InferenceResponse = {
      id: requestId,
      text: finalText,
      model: finalModelId,
      provider: finalProvider,
      usage,
      performance: {
        latencyMs: Date.now() - startTime,
      },
      traceId: response.traceId,
    };

    // 6. Evaluation
    await EvaluationService.evaluate(inferenceResponse);

    // 7. Audit Logging
    await this.logExecution(
      requestId,
      context,
      finalModelId,
      finalProvider,
      usage.promptTokens,
      usage.completionTokens,
      usage.cost,
      inferenceResponse.performance.latencyMs,
      'SUCCESS'
    );

    return inferenceResponse;
  }

  private static async logExecution(
    requestId: string,
    context: ExecutionContext,
    model: string,
    provider: string,
    pTokens: number,
    cTokens: number,
    cost: number,
    latency: number,
    status: string,
    error?: string
  ) {
    try {
      await this.db.run(
        `INSERT INTO ai_execution_logs (id, request_id, user_id, module, workflow_id, model, provider, prompt_tokens, completion_tokens, cost, latency_ms, status, error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `log_${requestId}`,
          requestId,
          context.userId || null,
          context.moduleId || null,
          context.workflowId || null,
          model,
          provider,
          pTokens,
          cTokens,
          cost,
          latency,
          status,
          error || null
        ]
      );
    } catch (err: any) {
      console.error('[AI-GATEWAY] Failed to log execution:', err.message);
    }
  }
}
