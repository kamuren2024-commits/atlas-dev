import type { AtlasEntityRef, AtlasEntityType } from '../contracts/atlas-fabric';

export type AtlasModuleStatus = 'existing' | 'integrating' | 'upgraded' | 'experimental';

export type ModuleCapability = 'PREDICT' | 'DETECT' | 'EXPLAIN' | 'RECOMMEND' | 'SIMULATE' | 'OPTIMIZE' | 'SUMMARIZE' | 'INVESTIGATE' | 'FORECAST' | 'MONITOR' | string;

export interface ModuleView {
  id: string;
  name: string;
  kind: 'workspace' | 'graph' | 'map' | 'table' | 'timeline' | 'custom';
}

export interface ModuleWorkflow {
  id: string;
  name: string;
  requiresApproval: boolean;
  triggerEvents?: string[];
}

export interface ModuleAction {
  id: string;
  label: string;
  permission: string;
  requiresApproval?: boolean;
}

export interface ModuleMetric {
  id: string;
  label: string;
  source: string;
  unit?: string;
}

export interface AtlasModuleDefinition {
  id: string;
  name: string;
  version: string;
  domain: string;
  status: AtlasModuleStatus;
  capabilities: string[];
  routes?: string[];
  dependencies?: string[];
  integrations?: string[];
  ontologyEntities?: AtlasEntityType[];
  eventsProduced?: string[];
  eventsConsumed?: string[];
  views?: ModuleView[];
  workflows?: ModuleWorkflow[];
  intelligence?: ModuleCapability[];
  actions?: ModuleAction[];
  metrics?: ModuleMetric[];
  permissions?: string[];
}

export interface AtlasEntityDefinition {
  type: AtlasEntityType;
  displayName: string;
  aliases: string[];
  description: string;
  requiredFields: Array<keyof AtlasEntityRef>;
}

export interface IntelligenceRequest {
  requestId: string;
  module: string;
  objective: string;
  entityContext?: Array<{ type: AtlasEntityType; ids: string[] }>;
  dataContext?: unknown;
  requestedCapabilities?: string[];
  requiresEvidence?: boolean;
  requiresHumanApproval?: boolean;
}

export interface IntelligenceResponse<TResult = unknown> {
  status: 'success' | 'partial' | 'unavailable';
  result: TResult;
  confidence?: number;
  evidence?: Array<{ id: string; source: string }>;
  provider?: string;
  limitations?: string[];
  timestamp: string;
}

export interface AtlasContext {
  requestId: string;
  module: string;
  user?: { id: string; roles: string[] };
  mission?: { id: string; type: string };
  entities?: Array<{ type: AtlasEntityType; id: string }>;
  correlationId?: string;
  tenantId?: string;
}

export interface AtlasAuditEvent {
  id: string;
  actor: { type: 'user' | 'agent' | 'system'; id: string };
  action: string;
  resource: { type: AtlasEntityType; id: string };
  module: string;
  timestamp: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export type IntegrationState =
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'HEALTHY'
  | 'DEGRADED'
  | 'OFFLINE'
  | 'ERROR';

export interface IntegrationHealth {
  connectorId: string;
  state: IntegrationState;
  checkedAt: string;
  message?: string;
  sourceSystem: string;
}

export class AtlasModuleRegistry {
  private readonly modules = new Map<string, AtlasModuleDefinition>();

  register(definition: AtlasModuleDefinition): void {
    if (this.modules.has(definition.id)) {
      throw new Error(`Atlas module already registered: ${definition.id}`);
    }
    this.modules.set(definition.id, { ...definition });
  }

  get(id: string): AtlasModuleDefinition | undefined {
    return this.modules.get(id);
  }

  list(): AtlasModuleDefinition[] {
    return Array.from(this.modules.values()).map((module) => ({ ...module }));
  }
}

export class AtlasEntityRegistry {
  private readonly entities = new Map<AtlasEntityType, AtlasEntityDefinition>();

  register(definition: AtlasEntityDefinition): void {
    if (this.entities.has(definition.type)) {
      throw new Error(`Atlas entity already registered: ${definition.type}`);
    }
    this.entities.set(definition.type, { ...definition, aliases: [...definition.aliases] });
  }

  get(type: AtlasEntityType): AtlasEntityDefinition | undefined {
    return this.entities.get(type);
  }

  list(): AtlasEntityDefinition[] {
    return Array.from(this.entities.values()).map((entity) => ({
      ...entity,
      aliases: [...entity.aliases],
      requiredFields: [...entity.requiredFields],
    }));
  }
}

export const atlasModuleRegistry = new AtlasModuleRegistry();
export const atlasEntityRegistry = new AtlasEntityRegistry();

const moduleDefinitions: AtlasModuleDefinition[] = [
  {
    id: 'executive-command-center',
    name: 'Executive Mission Control',
    version: 'existing',
    domain: 'executive',
    status: 'existing',
    capabilities: ['command-center', 'portfolio-overview', 'operational-alerts'],
    dependencies: ['tenant-context', 'event-fabric', 'graph-service'],
    integrations: ['ai-federation', 'mission-engine'],
    ontologyEntities: ['Mission', 'Project', 'Risk', 'Incident'],
  },
  {
    id: 'procurement-intelligence',
    name: 'Procurement Intelligence',
    version: 'existing',
    domain: 'procurement',
    status: 'integrating',
    capabilities: ['tender-evaluation', 'rules', 'evidence', 'approval-workflow'],
    dependencies: ['evaluation-service', 'audit-service'],
    integrations: ['knowledge-graph', 'ai-federation'],
    ontologyEntities: ['Tender', 'Bid', 'Evaluation', 'Supplier', 'Contract', 'Decision'],
    eventsProduced: ['tender.status_changed', 'procurement.approval_required'],
  },
  {
    id: 'logistics-intelligence',
    name: 'Logistics & Supply Chain Intelligence',
    version: 'existing',
    domain: 'logistics',
    status: 'integrating',
    capabilities: ['shipments', 'delivery-eta', 'supply-dependencies'],
    dependencies: ['logistics-service', 'event-fabric'],
    integrations: ['inventory-intelligence', 'project-supply-nexus'],
    ontologyEntities: ['Shipment', 'Supplier', 'Project', 'Location'],
    eventsProduced: ['shipment.status_changed', 'shipment.delayed'],
  },
  {
    id: 'inventory-intelligence',
    name: 'Inventory & Critical Spares Intelligence',
    version: 'existing',
    domain: 'inventory',
    status: 'integrating',
    capabilities: ['stock', 'warehouses', 'critical-spares', 'forecasting'],
    dependencies: ['inventory-hub', 'logistics-intelligence'],
    integrations: ['project-supply-nexus', 'asset-lifecycle'],
    ontologyEntities: ['InventoryItem', 'Warehouse', 'Project', 'Asset'],
    eventsProduced: ['inventory.stock_changed', 'inventory.stockout_risk_detected'],
    views: [{ id: 'inventory-workspace', name: 'Inventory workspace', kind: 'workspace' }, { id: 'inventory-graph', name: 'Supply graph', kind: 'graph' }],
    intelligence: ['MONITOR', 'FORECAST', 'DETECT', 'RECOMMEND'],
    workflows: [{ id: 'inventory-replenishment', name: 'Approve replenishment', requiresApproval: true, triggerEvents: ['inventory.stockout_risk_detected'] }],
    actions: [{ id: 'create-replenishment', label: 'Create replenishment draft', permission: 'inventory.write', requiresApproval: true }],
    metrics: [{ id: 'critical-stock', label: 'Critical stock items', source: 'inventory', unit: 'items' }],
    permissions: ['inventory.read', 'inventory.write'],
  },
  {
    id: 'enterprise-ai-intelligence',
    name: 'Enterprise Knowledge & AI Intelligence',
    version: 'existing',
    domain: 'knowledge-ai',
    status: 'integrating',
    capabilities: ['ask-atlas', 'document-intelligence', 'agent-platform', 'model-federation'],
    dependencies: ['ai-federation', 'ai-runtime', 'knowledge-graph'],
    integrations: ['all-mission-modules'],
    ontologyEntities: ['Document', 'Agent', 'Decision', 'Mission'],
  },
];

const entityDefinitions: Array<[AtlasEntityType, string, string[], string, Array<keyof AtlasEntityRef>]> = [
  ['Supplier', 'Supplier', ['vendor'], 'An organization that provides goods or services.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Project', 'Project', ['programme'], 'A governed capital or operational delivery initiative.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Contract', 'Contract', ['agreement'], 'A commercial agreement linking parties and obligations.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Tender', 'Tender', ['procurement-event'], 'A procurement solicitation and its evaluation lifecycle.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Asset', 'Asset', ['equipment'], 'A persistent operational or infrastructure object.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Shipment', 'Shipment', ['consignment'], 'A movement of materials through the supply chain.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['InventoryItem', 'Inventory Item', ['material', 'spare'], 'A stock-controlled material or critical spare.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Risk', 'Risk', ['exposure'], 'A condition with potential impact on an enterprise outcome.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Incident', 'Incident', ['event'], 'An operational, safety, security, or service disruption.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Document', 'Document', ['record'], 'A source document or evidence-bearing artifact.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Location', 'Location', ['place'], 'A geographic or operational location.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Organization', 'Organization', ['company'], 'A legal or operational organization.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
  ['Person', 'Person', ['individual'], 'A human participant in an enterprise process.', ['id', 'type', 'tenantId', 'sourceSystem', 'sourceId']],
];

moduleDefinitions.forEach((definition) => atlasModuleRegistry.register(definition));
entityDefinitions.forEach(([type, displayName, aliases, description, requiredFields]) =>
  atlasEntityRegistry.register({ type, displayName, aliases, description, requiredFields })
);
