import { AgentRegistry, EnterpriseAgent, Capability } from '../../apps/backend/platform/agent-os/AgentOS';
import { ToolRegistry, ToolManifest } from '../tool-registry/ToolRegistry';
import { OntologyEngine, OntologyEntity } from '../ontology/OntologyEngine';
import { WorkflowOrchestrationEngine, WorkflowDefinition } from '../workflow-engine/WorkflowEngine';
import { EventFabricEngine, EnterpriseEventType } from '../event-fabric/EventFabric';
import { MemoryFabricEngine } from '../memory-fabric/MemoryFabric';
import { GovernanceEngine } from '../governance/Governance';
import { ObservabilityEngine } from '../observability/Observability';

// Phase ΩΩΩ additions
import { SupervisorEngine } from '../supervisor-engine/SupervisorEngine';
import { AgentReputationSystem } from '../agent-reputation/AgentReputation';
import { AgentMarketplace } from '../agent-marketplace/AgentMarketplace';
import { DecisionIntelligenceFabric } from '../decision-intelligence/DecisionIntelligence';
import { ExplainabilityEngine } from '../explainability/Explainability';
import { PolicyReasoningEngine } from '../policy-engine/PolicyEngine';
import { SimulationGrid } from '../simulation-grid/SimulationGrid';
import { SelfOptimizationFabric } from '../self-optimization/SelfOptimization';
import { EnterpriseKnowledgeLineage } from '../knowledge-lineage/KnowledgeLineage';
import { WorkforceCoordinator } from '../workforce-coordinator/WorkforceCoordinator';
import { FederatedTenantIntelligence } from '../federation/Federation';
import { StrategicIntelligenceEngine } from '../strategic-intelligence/StrategicIntelligence';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  bootstrap: () => Promise<void>;
}

export class PlatformSDK {
  private static registeredModules = new Map<string, ModuleManifest>();

  /**
   * Platform Module Initialization
   */
  public static async createModule(manifest: ModuleManifest): Promise<void> {
    if (this.registeredModules.has(manifest.id)) {
      throw new Error(`Module [${manifest.id}] already running on Salience Platform.`);
    }

    await ObservabilityEngine.traceAction(
      `BOOTSTRAP_MODULE_${manifest.id.toUpperCase()}`,
      `PlatformSDK`,
      { id: manifest.id, version: manifest.version },
      async () => {
        await manifest.bootstrap();
        this.registeredModules.set(manifest.id, manifest);
      }
    );
  }

  /**
   * Enterprise Agent Registration Builder
   */
  public static createAgent(options: {
    id: string;
    name: string;
    version: string;
    tenantId: string;
    capabilities: Capability[];
    executor: (task: string, ctx: Record<string, any>) => Promise<any>;
  }): EnterpriseAgent {
    const agentInstance: EnterpriseAgent = {
      id: options.id,
      name: options.name,
      version: options.version,
      tenantId: options.tenantId,
      capabilities: options.capabilities,
      status: 'idle',
      memoryLimitBytes: 1024 * 1024 * 512,
      cpuShares: 1024,
      execute: async (task, ctx) => {
        agentInstance.status = 'busy';
        try {
          return await options.executor(task, ctx);
        } finally {
          agentInstance.status = 'idle';
        }
      },
      observe: async (event, ctx) => {
        console.log(`Agent [${options.id}] observed event:`, event.type);
      },
      plan: async (prompt) => {
        return [`Task planning action on: ${prompt}`];
      },
      learn: async (feedback) => {
        console.log(`Agent [${options.id}] integrated learning feedback index.`);
      },
      reportHealth: () => ({ status: 'optimal', memoryUsed: 64 * 1024 * 1024, cpuUsage: 1.2, activeThreads: 1 }),
      reportMetrics: () => ({ tasksExecuted: 12, errorsCount: 0, averageLatencyMs: 44.2 })
    };

    AgentRegistry.getInstance().register(agentInstance);
    return agentInstance;
  }

  /**
   * Dynamic Tool Registry Builder
   */
  public static createTool(manifest: ToolManifest): void {
    ToolRegistry.getInstance().register(manifest);
  }

  /**
   * Workflow Core Registry Builder
   */
  public static createWorkflow(def: WorkflowDefinition): void {
    WorkflowOrchestrationEngine.getInstance().registerDefinition(def);
  }

  /**
   * Ontology Entity Instantiation Wrapper
   */
  public static createOntologyEntity(id: string, typeId: string, properties: Record<string, any>): OntologyEntity {
    return OntologyEngine.getInstance().createEntity(id, typeId, properties);
  }

  /**
   * Event Publication Gateway shorthand helper
   */
  public static async publishEvent<T>(type: EnterpriseEventType, source: string, tenantId: string, payload: T, traceId?: string): Promise<string> {
    return await EventFabricEngine.getInstance().publish(type, source, tenantId, payload, traceId);
  }

  /**
   * Local Memory Integration Layer Wrapper
   */
  public static getMemoryFabric() {
    return MemoryFabricEngine.getInstance();
  }

  /**
   * System-Wide HITL Gatekeeper Integration
   */
  public static getGovernance() {
    return GovernanceEngine.getInstance();
  }

  // Phase ΩΩΩ Superclass accessors

  public static getSupervisor() {
    return SupervisorEngine.getInstance();
  }

  public static getReputationSystem() {
    return AgentReputationSystem.getInstance();
  }

  public static getMarketplace() {
    return AgentMarketplace.getInstance();
  }

  public static getDecisionIntelligence() {
    return DecisionIntelligenceFabric.getInstance();
  }

  public static getExplainability() {
    return ExplainabilityEngine.getInstance();
  }

  public static getPolicyEngine() {
    return PolicyReasoningEngine.getInstance();
  }

  public static getSimulationGrid() {
    return SimulationGrid.getInstance();
  }

  public static getSelfOptimization() {
    return SelfOptimizationFabric.getInstance();
  }

  public static getKnowledgeLineage() {
    return EnterpriseKnowledgeLineage.getInstance();
  }

  public static getWorkforceCoordinator() {
    return WorkforceCoordinator.getInstance();
  }

  public static getFederatedIntelligence() {
    return FederatedTenantIntelligence.getInstance();
  }

  public static getStrategicIntelligence() {
    return StrategicIntelligenceEngine.getInstance();
  }

  public static getActiveModules() {
    return Array.from(this.registeredModules.values());
  }
}
