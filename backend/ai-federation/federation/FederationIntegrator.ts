// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — FEDERATION INTEGRATOR
// Integrates the AI Federation with Knowledge Graph, Digital Twin, and Events
// ============================================================================

import { AIOrchestrator } from './AIOrchestrator';
import { SemanticMemory } from '../memory/SemanticMemory';
import { AIObservability } from '../observability/AIObservability';
import { generateId } from '../../../src/core/shared/crypto';

/**
 * Context retrieved from the knowledge graph and digital twin
 */
export interface FederationContext {
  knowledgeGraphContext?: string[];
  digitalTwinContext?: string[];
  eventContext?: string[];
  memoryContext?: string[];
}

/**
 * FederationIntegrator — bridges the AI Federation to
 * enterprise data sources (Knowledge Graph, Digital Twin, Event Fabric).
 * Ensures AI requests are grounded in retrievable organizational context.
 */
export class FederationIntegrator {
  private static instance: FederationIntegrator;
  private orchestrator: AIOrchestrator;
  private semanticMemory: SemanticMemory;

  private constructor() {
    this.orchestrator = AIOrchestrator.getInstance();
    this.semanticMemory = SemanticMemory.getInstance();
  }

  public static getInstance(): FederationIntegrator {
    if (!FederationIntegrator.instance) {
      FederationIntegrator.instance = new FederationIntegrator();
    }
    return FederationIntegrator.instance;
  }

  /**
   * Gather context from all available sources before an AI inference.
   * This provides "grounding" — the AI never operates on empty context.
   */
  async gatherContext(input: {
    task: string;
    mission: string;
    entityIds?: string[];
    knowledgeGraph?: {
      getNode: (id: string) => any;
      getNeighbors: (nodeId: string) => Array<{ node: any; edge: any }>;
      findImpact: (nodeId: string, depth?: number) => any;
    };
    digitalTwin?: {
      generateSupplierTwin: (id: string) => any;
      generateTenderTwin: (id: string) => any;
    };
    eventFabric?: {
      queryRecent?: (filters: any) => Array<Record<string, any>>;
    };
  }): Promise<FederationContext> {
    const traceId = AIObservability.startTrace('gather-context', { missionId: input.mission });
    const context: FederationContext = {};

    try {
      // 1. Knowledge Graph context
      if (input.knowledgeGraph && input.entityIds && input.entityIds.length > 0) {
        const kgContext: string[] = [];
        for (const entityId of input.entityIds.slice(0, 5)) {
          const node = input.knowledgeGraph.getNode(entityId);
          if (node) {
            const neighbors = input.knowledgeGraph.getNeighbors(entityId).slice(0, 10);
            kgContext.push(`Entity ${node.label} (${node.type}): connected to ${neighbors.length} nodes`);
            for (const { node: neighbor, edge } of neighbors) {
              kgContext.push(`  - ${edge.type} -> ${neighbor.label} (${neighbor.type})`);
            }
          } else {
            // Fall through to semantic memory
            const memoryMatches = this.semanticMemory.search(entityId);
            for (const m of memoryMatches.slice(0, 5)) {
              kgContext.push(`Memory: ${m.name} (${m.type}) - ${JSON.stringify(m.attributes).substring(0, 150)}`);
            }
          }
        }
        context.knowledgeGraphContext = kgContext;
      }

      // 2. Digital Twin context
      if (input.digitalTwin && input.entityIds && input.entityIds.length > 0) {
        const twinContext: string[] = [];
        for (const entityId of input.entityIds.slice(0, 3)) {
          try {
            const supplierTwin = input.digitalTwin.generateSupplierTwin(entityId);
            if (supplierTwin) {
              twinContext.push(`Supplier Twin ${entityId}: risk=${supplierTwin.riskScore}, compliance=${supplierTwin.complianceStatus}, nodes=${supplierTwin.nodes?.length || 0}`);
              continue;
            }
            const tenderTwin = input.digitalTwin.generateTenderTwin(entityId);
            if (tenderTwin) {
              twinContext.push(`Tender Twin ${entityId}: status=${tenderTwin.complianceStatus}, nodes=${tenderTwin.nodes?.length || 0}`);
            }
          } catch (err) {
            // Twin generation not available — continue without twin context
          }
        }
        context.digitalTwinContext = twinContext;
      }

      // 3. Event context
      if (input.eventFabric?.queryRecent) {
        try {
          const recentEvents = input.eventFabric.queryRecent({ type: undefined, limit: 10 });
          if (recentEvents && recentEvents.length > 0) {
            context.eventContext = recentEvents.map(ev =>
              `Event ${ev.id || 'unknown'} (${ev.type || 'unknown'}): ${JSON.stringify(ev).substring(0, 150)}`
            );
          }
        } catch (err) {
          // Event fabric unavailable
        }
      }

      // 4. Memory context (episodic + semantic + institutional)
      const memoryContext: string[] = [];
      const recentEpisodes = this.semanticMemory.search(input.task).slice(0, 5);
      for (const ep of recentEpisodes) {
        memoryContext.push(`Semantic: ${ep.name} (${ep.type})`);
      }
      context.memoryContext = memoryContext;

      return context;
    } finally {
      AIObservability.endTrace(traceId, 'success');
    }
  }

  /**
   * Execute an AI task with fully grounded context from enterprise sources.
   * This is the recommended pattern: always gather context before infer.
   */
  async executeGrounded(
    input: {
      mission: string;
      task: string;
      taskType: string;
      entityIds?: string[];
      classification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
      requireAudit?: boolean;
      systemPrompt?: string;
      knowledgeGraph?: any;
      digitalTwin?: any;
    }
  ): Promise<{
    success: boolean;
    text: string;
    model: string;
    provider: string;
    traceId: string;
    context: FederationContext;
    error?: string;
  }> {
    const context = await this.gatherContext({
      task: input.task,
      mission: input.mission,
      entityIds: input.entityIds,
      knowledgeGraph: input.knowledgeGraph,
      digitalTwin: input.digitalTwin,
    });

    // Build a system prompt enriched with grounded context
    const contextPrompt = [
      input.systemPrompt,
      '\n\n## GROUNDED ORGANIZATIONAL CONTEXT (from Knowledge Graph, Digital Twin, and Enterprise Memory):',
      '\n### Knowledge Graph Context:',
      ...(context.knowledgeGraphContext || ['None available']),
      '\n### Digital Twin Context:',
      ...(context.digitalTwinContext || ['None available']),
      '\n### Event Context:',
      ...(context.eventContext || ['None available']),
      '\n### Memory Context:',
      ...(context.memoryContext || ['None available']),
      '\n\nUse ONLY the provided context as source of truth. If the context cannot answer the task, explicitly state that the information is unavailable rather than guessing.',
    ].join('\n');

    const response = await this.orchestrator.executeForMission(
      input.mission,
      input.task,
      {
        systemPrompt: contextPrompt,
        requiredCapabilities: this.inferCapabilities(input.taskType),
        missionId: input.mission,
      },
      {
        classification: input.classification || 'CONFIDENTIAL',
        requireAudit: input.requireAudit ?? true,
      }
    );

    return {
      success: response.success,
      text: response.text,
      model: response.model,
      provider: response.provider,
      traceId: response.traceId,
      context,
      error: response.error,
    };
  }

  private inferCapabilities(taskType: string): string[] {
    switch (taskType) {
      case 'ANALYSIS': return ['analysis', 'reasoning', 'data_analysis'];
      case 'REASONING': return ['reasoning', 'numerical_reasoning'];
      case 'CODING': return ['coding'];
      case 'EXTRACTION': return ['extraction', 'document_analysis'];
      case 'CLASSIFICATION': return ['classification'];
      case 'SUMMARIZATION': return ['summarization'];
      case 'CONVERSATION': return ['creative', 'summarization'];
      default: return ['reasoning', 'analysis'];
    }
  }
}
