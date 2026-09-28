// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AI ORCHESTRATOR
// Central entry point for all enterprise AI inference
// ============================================================================

import {
  AIGatewayRequest,
  AIGatewayResponse,
  InferenceRequest,
  InferenceResponse,
  DataClassification,
  RequestMetadata,
  Evidence,
  Message,
} from './types';
import { IntelligentRouter } from './ModelRouter';
import { FailoverEngine } from './FailoverEngine';
import { PolicyEngine } from '../governance/PolicyEngine';
import { AuditTrail } from '../governance/AuditTrail';
import { AgentEvaluator } from '../evaluation/AgentEvaluator';
import { OperationalMemory } from '../memory/OperationalMemory';
import { generateId } from '../../../src/core/shared/crypto';

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private router: IntelligentRouter;
  private failover: FailoverEngine;
  private policy: PolicyEngine;
  private audit: AuditTrail;
  private evaluator: AgentEvaluator;
  private memory: OperationalMemory;

  private constructor() {
    this.router = IntelligentRouter.getInstance();
    this.failover = FailoverEngine.getInstance();
    this.policy = PolicyEngine.getInstance();
    this.audit = AuditTrail.getInstance();
    this.evaluator = AgentEvaluator.getInstance();
    this.memory = OperationalMemory.getInstance();
  }

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  /**
   * Primary entry point — all AI requests flow through here.
   * Enforces governance, routing, failover, audit, and evaluation.
   */
  async execute(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    const requestId = generateId('req');
    const traceId = generateId('trc');
    const startTime = Date.now();

    console.log(`[AI-ORCHESTRATOR] Executing mission="${request.mission}" task="${request.task}" [${requestId}]`);

    // 1. Policy Gate — check if this request is allowed
    const policyResult = await this.policy.evaluate({
      requestId,
      mission: request.mission,
      task: request.task,
      classification: request.governance.classification,
      requireApproval: request.governance.requireApproval,
    });

    if (!policyResult.allowed) {
      console.warn(`[AI-ORCHESTRATOR] Policy denied request [${requestId}]: ${policyResult.reason}`);
      return {
        success: false,
        text: '',
        model: '',
        provider: '',
        costUsd: 0,
        latencyMs: Date.now() - startTime,
        traceId,
        requiresHumanApproval: false,
        error: `Policy violation: ${policyResult.reason}`,
      };
    }

    // 2. Build metadata for routing
    const metadata: RequestMetadata = {
      requestId,
      missionId: request.mission,
      agentId: request.context.agentId,
      agentDepth: request.context.agentDepth || 0,
      userId: request.context.userId,
      tenantId: request.context.tenantId || 'ketraco',
      module: request.context.module || 'federation',
      workflow: request.context.workflow,
      dataClassification: request.governance.classification,
      requiredCapabilities: request.context.requiredCapabilities || [],
      preferredDeployment: request.context.preferredDeployment,
      latencyRequirementMs: request.context.latencyRequirementMs,
      budgetUsd: request.context.budgetUsd,
      auditRequired: request.governance.requireAudit,
      citationRequired: request.governance.requireCitation,
      timestamp: new Date().toISOString(),
    };

    // 3. Build inference request
    const messages: Message[] = [];
    if (request.context.systemPrompt) {
      messages.push({ role: 'system', content: request.context.systemPrompt });
    }
    messages.push({ role: 'user', content: request.task });

    const inferenceRequest: InferenceRequest = {
      messages,
      system: request.context.systemPrompt,
      temperature: request.options?.temperature ?? 0.7,
      maxTokens: request.options?.maxTokens ?? 4096,
      metadata,
    };

    // 4. Route and execute with failover
    const result = await this.failover.executeWithFailover(inferenceRequest);

    // 5. Build response
    const response: AIGatewayResponse = {
      success: result.success,
      text: result.response?.text || '',
      model: result.response?.model || '',
      provider: result.response?.provider || '',
      costUsd: result.response?.usage.costUsd || 0,
      latencyMs: Date.now() - startTime,
      traceId,
      requiresHumanApproval: policyResult.requiresApproval,
      error: result.error,
    };

    // 6. Audit trail
    if (request.governance.requireAudit) {
      const auditId = await this.audit.record({
        requestId,
        traceId,
        mission: request.mission,
        task: request.task,
        classification: request.governance.classification,
        provider: response.provider,
        model: response.model,
        costUsd: response.costUsd,
        latencyMs: response.latencyMs,
        success: response.success,
        agentId: request.context.agentId,
        userId: request.context.userId,
        timestamp: new Date().toISOString(),
      });
      response.auditId = auditId;
    }

    // 7. Evaluation
    if (response.success) {
      const evalId = await this.evaluator.evaluate({
        requestId,
        traceId,
        agentId: request.context.agentId || 'unknown',
        taskId: request.task,
        response: result.response!,
        classification: request.governance.classification,
      });
      response.evaluationId = evalId;
    }

    // 8. Record to operational memory
    this.memory.record({
      type: 'INFERENCE_EXECUTED',
      data: {
        requestId,
        traceId,
        mission: request.mission,
        provider: response.provider,
        model: response.model,
        costUsd: response.costUsd,
        latencyMs: response.latencyMs,
        success: response.success,
      },
    });

    console.log(`[AI-ORCHESTRATOR] Completed [${requestId}] provider=${response.provider} model=${response.model} cost=$${response.costUsd.toFixed(4)} latency=${response.latencyMs}ms`);

    return response;
  }

  /**
   * High-level execute — wraps execute() with common KETRACO patterns
   */
  async executeForMission(
    mission: string,
    task: string,
    context: Record<string, any>,
    options?: {
      classification?: DataClassification;
      requireAudit?: boolean;
      requireCitation?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIGatewayResponse> {
    return this.execute({
      mission,
      task,
      context: {
        ...context,
        module: mission.toLowerCase().replace(/_/g, '-'),
      },
      governance: {
        classification: options?.classification || 'CONFIDENTIAL',
        requireAudit: options?.requireAudit ?? true,
        requireCitation: options?.requireCitation ?? false,
      },
      options: {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      },
    });
  }
}
