import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import type { KnowledgeGraph } from '../../evaluation/knowledge-graph';
import { AuthorizationService } from '../../security/authorization-service';
import type { UserIdentity } from '../../security/identity-service';
import type { AuditLogger } from '../../observability/audit-logger';
import { ApiGatewayMiddleware } from '../../security/api-gateway-middleware';
import { EventBus } from '../../event-fabric/event-bus';
import { SSEHandler } from '../../event-fabric/sse-handler';
import type { ProjectMilestoneUpdatedEvent, UpdateProjectMilestoneForecastCommand } from '../../../packages/contracts/project-schedule';
import { calculateSupplyPosition, type ProjectSupplyRequirement, type SupplyPosition } from './intelligence';
import {
  type Project360Section,
  type Project360HealthState,
  type Project360Snapshot,
  type ProjectDataSourceState,
  type ProjectProvenance,
  type ProjectRecord,
} from './project-contract';
import { ProjectService } from './project-service';
import { ProjectMilestoneCommandError, ProjectMilestoneService } from './project-milestone-service';

export interface ProjectSupplyApiDeps {
  db: DatabaseCore;
  kg: KnowledgeGraph;
  authz: AuthorizationService;
  audit: AuditLogger;
}

interface RequirementRow {
  id: string;
  project_id: string;
  work_package_id: string | null;
  requirement_type: string;
  product_id: string | null;
  description: string;
  required_quantity: number;
  unit: string;
  required_by: string | null;
  delivery_location: string | null;
  criticality: string;
  procurement_status: string;
  supplier_id: string | null;
  contract_id: string | null;
  purchase_order_id: string | null;
  milestone_id: string | null;
}

interface StockAggregate {
  product_id: string;
  quantity: number;
  reserved: number;
}

interface OrderAggregate {
  product_id: string;
  open_quantity: number;
  expected_shipment_quantity: number;
  expected_receipt_date: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: UserIdentity;
}

function toRequirement(row: RequirementRow): ProjectSupplyRequirement {
  return {
    id: row.id,
    projectId: row.project_id,
    workPackageId: row.work_package_id,
    requirementType: row.requirement_type,
    productId: row.product_id,
    description: row.description,
    requiredQuantity: Number(row.required_quantity),
    unit: row.unit,
    requiredBy: row.required_by,
    deliveryLocation: row.delivery_location,
    criticality: row.criticality,
    procurementStatus: row.procurement_status,
    supplierId: row.supplier_id,
    contractId: row.contract_id,
    purchaseOrderId: row.purchase_order_id,
    milestoneId: row.milestone_id,
  };
}

function fail(res: Response, status: number, code: string, message: string, details?: unknown) {
  return res.status(status).json({ ok: false, error: { code, message, ...(details === undefined ? {} : { details }) } });
}

export function createProjectSupplyApiRouter(deps: ProjectSupplyApiDeps): express.Router {
  const router = express.Router();
  const projectService = ProjectService.create(deps.db);
  const milestoneService = new ProjectMilestoneService(deps.db);
  const eventBus = EventBus.getInstance();
  const sseHandler = SSEHandler.getInstance();

  router.use(ApiGatewayMiddleware.correlationId);
  router.use((req, res, next) => {
    void ApiGatewayMiddleware.authenticate(req, res, next).catch(next);
  });

  async function authorizeProject(req: Request, res: Response, projectId: string, action: 'read' | 'update' = 'read'): Promise<string | null> {
    const user = (req as AuthenticatedRequest).user;
    const tenantId = user?.tenantId;
    if (!user || !tenantId) {
      fail(res, 403, 'UNAUTHORIZED', `Not authorized to ${action} project data`);
      return null;
    }
    const authorization = deps.authz.evaluate(user, action, 'project', {
      tenantId,
      resourceId: projectId,
    });
    if (!authorization.isAuthorized) {
      fail(res, 403, 'UNAUTHORIZED', authorization.reason || `Not authorized to ${action} project data`);
      return null;
    }
    const project = deps.kg.nodes.find(node =>
      node.id === projectId && node.type === 'PROJECT' && node.properties?.tenantId === tenantId,
    );
    const requirement = await deps.db.get<{ id: string }>(
      'SELECT id FROM project_supply_requirement WHERE tenant_id = ? AND project_id = ? LIMIT 1',
      [tenantId, projectId],
    );
    const projectRecord = await deps.db.get<{ id: string }>(
      'SELECT id FROM project_supply_project WHERE tenant_id = ? AND id = ? LIMIT 1',
      [tenantId, projectId],
    );
    if (!project && !requirement && !projectRecord) {
      fail(res, 404, 'NOT_FOUND', 'Project not found');
      return null;
    }
    return tenantId;
  }

  async function publishOutboxEvent(eventId: string): Promise<boolean> {
    const record = await deps.db.get<{ payload_json: string; published_at: string | null }>(
      'SELECT payload_json, published_at FROM atlas_outbox_events WHERE event_id = ?',
      [eventId],
    );
    if (!record) {
      throw new Error(`Durable outbox event ${eventId} is missing.`);
    }
    if (record.published_at) return true;
    const event = JSON.parse(record.payload_json) as ProjectMilestoneUpdatedEvent;
    try {
      await eventBus.publishEvent(event);
      await deps.db.run(
        `UPDATE atlas_outbox_events
            SET published_at = ?, publish_attempts = publish_attempts + 1, last_error = NULL
          WHERE event_id = ? AND published_at IS NULL`,
        [new Date().toISOString(), eventId],
      );
      return true;
    } catch (error) {
      await deps.db.run(
        `UPDATE atlas_outbox_events
            SET publish_attempts = publish_attempts + 1, last_error = ?
          WHERE event_id = ? AND published_at IS NULL`,
        [error instanceof Error ? error.message : 'Unknown event publication failure', eventId],
      );
      return false;
    }
  }

  async function dispatchPendingOutbox(): Promise<void> {
    const pending = await deps.db.all<{ event_id: string }>(
      `SELECT event_id FROM atlas_outbox_events
        WHERE published_at IS NULL
        ORDER BY created_at ASC
        LIMIT 50`,
    );
    for (const { event_id: eventId } of pending) {
      await publishOutboxEvent(eventId);
    }
  }

  const outboxRetry = setInterval(() => {
    void dispatchPendingOutbox().catch(error => {
      console.error('[PROJECT-SUPPLY] Outbox retry failed:', error);
    });
  }, 5000);
  outboxRetry.unref();

  function defaultProvenance(projectId: string, state: ProjectDataSourceState): ProjectProvenance {
    return {
      source: 'project_supply_project',
      authority: state === 'LIVE_AUTHORITATIVE' ? 'AUTHORITATIVE' : state === 'LIVE_NON_AUTHORITATIVE' ? 'NON_AUTHORITATIVE' : 'UNAVAILABLE',
      freshness: 'UNKNOWN',
      retrievedAt: new Date().toISOString(),
      verificationState: state === 'NOT_VERIFIED' || state === 'UNAVAILABLE' || state === 'NOT_CONNECTED' ? 'NOT_VERIFIED' : 'VERIFIED',
      dataSourceState: state,
    };
  }

  function toProjectContract(project: ProjectRecord | null, projectId: string, requirements: ProjectSupplyRequirement[]): { project: ProjectRecord | null; dataStatus: ProjectDataSourceState; provenance: ProjectProvenance } {
    if (project) {
      return {
        project,
        dataStatus: project.provenance.dataSourceState || 'LIVE_AUTHORITATIVE',
        provenance: project.provenance,
      };
    }
    if (requirements.length > 0) {
      return {
        project: null,
        dataStatus: 'DERIVED',
        provenance: defaultProvenance(projectId, 'DERIVED'),
      };
    }
    return {
      project: null,
      dataStatus: 'NOT_CONNECTED',
      provenance: defaultProvenance(projectId, 'NOT_CONNECTED'),
    };
  }

  function buildSnapshot(
    projectId: string,
    project: ProjectRecord | null,
    projectState: { dataStatus: ProjectDataSourceState; provenance: ProjectProvenance },
    requirements: ProjectSupplyRequirement[],
    positions: SupplyPosition[],
    graph: { nodes: unknown[]; edges: unknown[] },
  ): Project360Snapshot {
    const snapshotGeneratedAt = new Date().toISOString();
    const section = <T,>(
      state: ProjectDataSourceState,
      source: string,
      authority: ProjectProvenance['authority'],
      data: T | null,
      sourceUpdatedAt: string | null = null,
      version: number | null = null,
    ): Project360Section<T> => ({
      state,
      source,
      authority,
      sourceUpdatedAt,
      retrievedAt: snapshotGeneratedAt,
      version,
      data,
    });
    const unavailable = (source: string) =>
      section('NOT_CONNECTED', source, 'UNAVAILABLE', null);
    const materialState: ProjectDataSourceState = requirements.length ? 'DERIVED' : 'NOT_CONNECTED';
    const connectedGraph = graph.edges.length > 0;
    const dimensions: Array<{
      domain: string;
      state: Project360HealthState;
      source: string;
      authority: ProjectProvenance['authority'];
      sourceUpdatedAt: string | null;
      evidenceReferences: string[];
      contributingConditions: string[];
    }> = [
      'schedule', 'procurement', 'suppliers', 'contracts', 'materials', 'logistics',
      'site', 'risk', 'cost', 'quality', 'approvals', 'evidence',
    ].map(domain => ({
      domain,
      state: 'NOT_CONNECTED' as const,
      source: 'UNAVAILABLE',
      authority: 'UNAVAILABLE' as const,
      sourceUpdatedAt: null,
      evidenceReferences: [],
      contributingConditions: [`No authoritative ${domain} source is connected to Project 360.`],
    }));

    if (requirements.length) {
      dimensions.find(item => item.domain === 'materials')!.state = 'UNKNOWN';
      dimensions.find(item => item.domain === 'materials')!.source = 'project_supply_requirement + logistics stock/order records';
      dimensions.find(item => item.domain === 'materials')!.authority = 'DERIVED';
      dimensions.find(item => item.domain === 'materials')!.contributingConditions = [
        'Material positions are derived from linked requirement, stock, and order records; source freshness is not available.',
      ];
    }

    return {
      projectId,
      project: section(
        projectState.dataStatus,
        projectState.provenance.source,
        projectState.provenance.authority,
        project,
        project?.updatedAt ?? null,
        project?.version ?? null,
      ),
      domains: {
        schedule: unavailable('schedule'),
        procurement: unavailable('procurement'),
        suppliers: unavailable('supplier'),
        contracts: unavailable('contract'),
        materials: section(
          materialState,
          requirements.length ? 'project_supply_requirement + logistics_stock + logistics_order' : 'project_supply_requirement',
          requirements.length ? 'DERIVED' : 'UNAVAILABLE',
          requirements.length ? { requirements, positions } : null,
        ),
        logistics: unavailable('logistics'),
        site: unavailable('site'),
        risk: unavailable('risk'),
        cost: unavailable('finance'),
        quality: unavailable('quality'),
        approvals: unavailable('approvals'),
        evidence: unavailable('evidence'),
        exceptions: unavailable('project-exceptions'),
        timeline: unavailable('atlas-event-fabric/project-events'),
        dependencies: section(
          connectedGraph ? 'DERIVED' : 'NOT_CONNECTED',
          'atlas-knowledge-graph',
          connectedGraph ? 'DERIVED' : 'UNAVAILABLE',
          connectedGraph ? graph : null,
        ),
      },
      health: {
        state: 'UNKNOWN',
        overall: 'UNKNOWN',
        dimensions,
      },
      freshness: {
        snapshotGeneratedAt,
        sourceUpdatedAt: project?.updatedAt ?? null,
      },
      version: project?.version ?? null,
    };
  }

  async function getRequirements(tenantId: string, projectId: string): Promise<ProjectSupplyRequirement[]> {
    const rows = await deps.db.all<RequirementRow>(
      `SELECT id, project_id, work_package_id, requirement_type, product_id, description,
              required_quantity, unit, required_by, delivery_location, criticality,
              procurement_status, supplier_id, contract_id, purchase_order_id, milestone_id
         FROM project_supply_requirement
        WHERE tenant_id = ? AND project_id = ?
        ORDER BY required_by ASC, id ASC`,
      [tenantId, projectId],
    );
    return rows.map(toRequirement);
  }

  async function getPositions(tenantId: string, requirements: ProjectSupplyRequirement[]): Promise<SupplyPosition[]> {
    const productIds = requirements.map(item => item.productId).filter((id): id is string => Boolean(id));
    if (productIds.length === 0) {
      return requirements.map(requirement => calculateSupplyPosition({
        requirement,
        grossRequirement: requirement.requiredQuantity,
        availableStock: 0,
        reservedStock: 0,
        allocatedStock: 0,
        openPoQuantity: 0,
        expectedShipmentQuantity: 0,
      }));
    }
    const placeholders = productIds.map(() => '?').join(',');
    const stocks = await deps.db.all<StockAggregate>(
      `SELECT product_id, COALESCE(SUM(quantity), 0) as quantity, COALESCE(SUM(reserved), 0) as reserved
         FROM logistics_stock
        WHERE tenant_id = ? AND product_id IN (${placeholders})
        GROUP BY product_id`,
      [tenantId, ...productIds],
    );
    const orders = await deps.db.all<OrderAggregate>(
      `SELECT oi.product_id,
              COALESCE(SUM(CASE WHEN o.status NOT IN ('DELIVERED', 'CANCELLED') THEN oi.quantity - oi.received ELSE 0 END), 0) as open_quantity,
              COALESCE(SUM(CASE WHEN o.status IN ('IN_TRANSIT', 'DISPATCHED') THEN oi.shipped - oi.received ELSE 0 END), 0) as expected_shipment_quantity,
              MIN(CASE WHEN o.status NOT IN ('DELIVERED', 'CANCELLED') THEN o.estimated_arrival END) as expected_receipt_date
         FROM logistics_order_item oi
         JOIN logistics_order o ON o.id = oi.order_id AND o.tenant_id = oi.tenant_id
        WHERE oi.tenant_id = ? AND oi.product_id IN (${placeholders})
        GROUP BY oi.product_id`,
      [tenantId, ...productIds],
    );
    const stockByProduct = new Map(stocks.map(row => [row.product_id, row]));
    const ordersByProduct = new Map(orders.map(row => [row.product_id, row]));
    return requirements.map(requirement => {
      const stock = requirement.productId ? stockByProduct.get(requirement.productId) : undefined;
      const order = requirement.productId ? ordersByProduct.get(requirement.productId) : undefined;
      return calculateSupplyPosition({
        requirement,
        grossRequirement: requirement.requiredQuantity,
        availableStock: Number(stock?.quantity || 0),
        reservedStock: Number(stock?.reserved || 0),
        allocatedStock: 0,
        openPoQuantity: Number(order?.open_quantity || 0),
        expectedShipmentQuantity: Number(order?.expected_shipment_quantity || 0),
        expectedReceiptDate: order?.expected_receipt_date,
      });
    });
  }

  router.get('/telemetry', async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const tenantId = user?.tenantId;
    if (!user || !tenantId) {
      return fail(res, 403, 'UNAUTHORIZED', 'Not authorized to read project telemetry');
    }

    const authorization = deps.authz.evaluate(user, 'read', 'project', {
      tenantId,
      resourceId: 'project-supply-telemetry',
    });
    if (!authorization.isAuthorized) {
      return fail(res, 403, 'UNAUTHORIZED', authorization.reason || 'Not authorized to read project telemetry');
    }

    try {
      const [projectRecord, requirementRecord] = await Promise.all([
        deps.db.get<{ count: number }>('SELECT COUNT(*) AS count FROM project_supply_project WHERE tenant_id = ?', [tenantId]),
        deps.db.get<{ count: number }>('SELECT COUNT(*) AS count FROM project_supply_requirement WHERE tenant_id = ?', [tenantId]),
      ]);
      const projectCount = Number(projectRecord?.count || 0);
      const requirementCount = Number(requirementRecord?.count || 0);
      const status: ProjectDataSourceState = requirementCount > 0 ? 'DERIVED' : projectCount > 0 ? 'NOT_CONNECTED' : 'NOT_CONNECTED';
      const payload = {
        status,
        lastUpdated: new Date().toISOString(),
        dataFreshnessSeconds: 0,
        kpis: [
          {
            id: 'project-coverage',
            label: 'Project coverage',
            value: String(projectCount),
            delta: requirementCount > 0 ? `${requirementCount} linked requirements` : 'No linked requirement evidence',
            trend: requirementCount > 0 ? 'up' : 'flat',
            status: requirementCount > 0 ? 'HEALTHY' : 'WATCH',
            trendPositive: requirementCount > 0,
            freshness: 'just now',
            contributingFactors: requirementCount > 0
              ? ['Project requirement records are linked to this tenant scope.']
              : ['No authoritative project requirement evidence is connected for this tenant.'],
          },
        ],
        nodes: [],
        edges: [],
        exceptions: [],
        stages: [],
        genome: [],
        materials: [],
        deltas: [],
        layers: [],
      };
      return res.json({ ok: true, data: payload });
    } catch (error) {
      console.error('[PROJECT-SUPPLY] Telemetry read failed:', error);
      return fail(res, 500, 'TELEMETRY_READ_FAILED', 'Project telemetry could not be loaded.');
    }
  });

  router.get('/projects/:projectId', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const [requirements, project] = await Promise.all([
      getRequirements(tenantId, req.params.projectId),
      projectService.getProject(tenantId, req.params.projectId),
    ]);
    const positions = await getPositions(tenantId, requirements);
    const projectState = toProjectContract(project, req.params.projectId, requirements);
    const relatedIds = new Set([req.params.projectId]);
    deps.kg.edges.forEach(edge => {
      if (edge.source === req.params.projectId) relatedIds.add(edge.target);
      if (edge.target === req.params.projectId) relatedIds.add(edge.source);
    });
    const graph = {
      nodes: deps.kg.nodes.filter(node => relatedIds.has(node.id) && node.properties?.tenantId === tenantId),
      edges: deps.kg.edges.filter(edge =>
        relatedIds.has(edge.source) &&
        relatedIds.has(edge.target) &&
        deps.kg.nodes.some(node => node.id === edge.source && node.properties?.tenantId === tenantId) &&
        deps.kg.nodes.some(node => node.id === edge.target && node.properties?.tenantId === tenantId),
      ),
    };
    const graphForProject = {
      nodes: [...graph.nodes],
      edges: [...graph.edges],
    };
    const requirementNodes = requirements.map(requirement => ({
      id: requirement.id,
      type: 'REQUIREMENT',
      label: requirement.description,
      properties: {
        tenantId,
        projectId: requirement.projectId,
        productId: requirement.productId,
        requiredQuantity: requirement.requiredQuantity,
        requiredBy: requirement.requiredBy,
        dataStatus: 'FACT',
        sourceSystem: 'project_supply_requirement',
      },
    }));
    const requirementEdges = requirements.flatMap(requirement => [
      {
        id: `edge-${req.params.projectId}-${requirement.id}`,
        source: req.params.projectId,
        target: requirement.id,
        type: 'HAS_REQUIREMENT',
        confidence: 1,
        properties: {},
        provenance: { source: 'project_supply_requirement', sourceRecordId: requirement.id, verificationStatus: 'VERIFIED' },
      },
      ...(requirement.productId ? [{
        id: `edge-${requirement.id}-${requirement.productId}`,
        source: requirement.id,
        target: requirement.productId,
        type: 'REQUIRES',
        confidence: 1,
        properties: {},
        provenance: { source: 'project_supply_requirement', sourceRecordId: requirement.id, verificationStatus: 'VERIFIED' },
      }] : []),
    ]);
    const snapshot = buildSnapshot(
      req.params.projectId,
      project,
      projectState,
      requirements,
      positions,
      {
        nodes: [...graphForProject.nodes, ...requirementNodes],
        edges: [...graphForProject.edges, ...requirementEdges],
      },
    );
    deps.audit.log({
      actor: (req as AuthenticatedRequest).user!.id,
      action: 'project-supply:nexus:get',
      resourceType: 'project',
      resourceId: req.params.projectId,
      status: 'completed',
      metadata: { tenantId, requirementCount: requirements.length, dataStatus: projectState.dataStatus },
    });
    return res.json({
      ok: true,
      data: {
        projectId: req.params.projectId,
        project: projectState.project,
        snapshot,
        requirements,
        supplyPositions: positions,
        graph: {
          nodes: [...graph.nodes, ...requirementNodes],
          edges: [...graph.edges, ...requirementEdges],
        },
        dataStatus: projectState.dataStatus,
        provenance: projectState.provenance,
        limitations: requirements.length ? [] : ['No persisted project requirements are linked to this project.'],
      },
    });
  });

  router.get('/projects/:projectId/requirements', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const requirements = await getRequirements(tenantId, req.params.projectId);
    const project = await projectService.getProject(tenantId, req.params.projectId);
    const outcome = toProjectContract(project, req.params.projectId, requirements);
    return res.json({ ok: true, data: { requirements, dataStatus: outcome.dataStatus, provenance: outcome.provenance } });
  });

  router.get('/projects/:projectId/supply-position', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const requirements = await getRequirements(tenantId, req.params.projectId);
    const project = await projectService.getProject(tenantId, req.params.projectId);
    const outcome = toProjectContract(project, req.params.projectId, requirements);
    return res.json({ ok: true, data: { positions: await getPositions(tenantId, requirements), dataStatus: outcome.dataStatus, provenance: outcome.provenance } });
  });

  router.get('/projects/:projectId/milestones', async (req, res) => {
    try {
      const tenantId = await authorizeProject(req, res, req.params.projectId);
      if (!tenantId) return;
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
      const offset = Math.max(0, Number(req.query.offset) || 0);
      const milestones = await milestoneService.list(tenantId, req.params.projectId, limit, offset);
      return res.json({
        ok: true,
        data: {
          milestones,
          page: { limit, offset, returned: milestones.length },
          authority: 'ATLAS_PERSISTED_NOT_VERIFIED',
          source: 'ATLAS_INTERNAL',
          retrievedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[PROJECT-SUPPLY] Milestone read failed:', error);
      return fail(res, 500, 'MILESTONE_READ_FAILED', 'Milestones could not be loaded.');
    }
  });

  router.get('/projects/:projectId/milestones/events', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const clientId = sseHandler.handleConnection(res);
    sseHandler.subscribe(clientId, {
      eventTypes: ['ProjectMilestoneUpdated'],
      customFilter: event =>
        event.eventType === 'ProjectMilestoneUpdated' &&
        event.tenantId === tenantId &&
        event.projectId === req.params.projectId,
    });
  });

  router.get('/projects/:projectId/milestones/:milestoneId', async (req, res) => {
    try {
      const tenantId = await authorizeProject(req, res, req.params.projectId);
      if (!tenantId) return;
      const milestone = await milestoneService.get(tenantId, req.params.projectId, req.params.milestoneId);
      if (!milestone) return fail(res, 404, 'MILESTONE_NOT_FOUND', 'Milestone was not found within this project.');
      return res.json({
        ok: true,
        data: {
          milestone,
          provenance: { source: milestone.source, authority: milestone.authority, verificationState: 'NOT_VERIFIED' },
          retrievedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[PROJECT-SUPPLY] Milestone read failed:', error);
      return fail(res, 500, 'MILESTONE_READ_FAILED', 'Milestone could not be loaded.');
    }
  });

  router.patch('/projects/:projectId/milestones/:milestoneId/forecast', async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const tenantId = await authorizeProject(req, res, req.params.projectId, 'update');
    if (!tenantId || !user) return;
    const allowedKeys = ['forecastDate', 'reason', 'expectedVersion', 'idempotencyKey'];
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).some(key => !allowedKeys.includes(key))) {
      return fail(res, 400, 'INVALID_COMMAND', 'Command must contain only forecastDate, reason, expectedVersion, and idempotencyKey.');
    }
    const idempotencyKey = req.get('Idempotency-Key') || req.body.idempotencyKey;
    const command: UpdateProjectMilestoneForecastCommand = {
      projectId: req.params.projectId,
      milestoneId: req.params.milestoneId,
      forecastDate: req.body.forecastDate,
      reason: req.body.reason,
      expectedVersion: req.body.expectedVersion,
      idempotencyKey,
    };
    try {
      const result = await milestoneService.updateForecast(command, {
        actorId: user.id,
        actorRole: user.role,
        tenantId,
        correlationId: req.correlationId || '',
      });
      const eventPublished = await publishOutboxEvent(result.event.id);
      return res.status(200).json({
        ok: true,
        data: {
          milestone: result.milestone,
          auditId: result.auditId,
          eventId: result.event.id,
          eventStatus: eventPublished ? 'EVENT_ACCEPTED_BY_IN_PROCESS_BUS' : 'EVENT_QUEUED',
          correlationId: req.correlationId,
          replayed: result.replayed,
        },
      });
    } catch (error) {
      if (error instanceof ProjectMilestoneCommandError) {
        return fail(res, error.statusCode, error.code, error.message, error.details);
      }
      console.error('[PROJECT-SUPPLY] Milestone forecast command failed:', {
        correlationId: req.correlationId,
        error,
      });
      return fail(res, 500, 'MILESTONE_COMMAND_FAILED', 'Milestone update failed; no confirmed state was returned.');
    }
  });

  return router;
}
