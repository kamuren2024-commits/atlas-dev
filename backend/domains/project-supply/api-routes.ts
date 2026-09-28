import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import type { KnowledgeGraph } from '../../evaluation/knowledge-graph';
import { AuthorizationService } from '../../security/authorization-service';
import type { UserIdentity } from '../../security/identity-service';
import type { AuditLogger } from '../../observability/audit-logger';
import { calculateSupplyPosition, type ProjectSupplyRequirement, type SupplyPosition } from './intelligence';

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

function fail(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

export function createProjectSupplyApiRouter(deps: ProjectSupplyApiDeps): express.Router {
  const router = express.Router();

  async function authorizeProject(req: Request, res: Response, projectId: string): Promise<string | null> {
    const user = (req as AuthenticatedRequest).user;
    const tenantId = user?.tenantId || 'ketraco';
    if (!user || !(await deps.authz.check(user.id, 'project', 'read', { tenantId, resourceId: projectId, role: user.role, permissions: user.permissions }))) {
      fail(res, 403, 'UNAUTHORIZED', 'Not authorized to read project supply data');
      return null;
    }
    const project = deps.kg.nodes.find(node =>
      node.id === projectId && node.type === 'PROJECT' && node.properties?.tenantId === tenantId,
    );
    const requirement = await deps.db.get<{ id: string }>(
      'SELECT id FROM project_supply_requirement WHERE tenant_id = ? AND project_id = ? LIMIT 1',
      [tenantId, projectId],
    );
    if (!project && !requirement) {
      fail(res, 404, 'NOT_FOUND', 'Project not found');
      return null;
    }
    return tenantId;
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

  router.get('/projects/:projectId', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const requirements = await getRequirements(tenantId, req.params.projectId);
    const positions = await getPositions(tenantId, requirements);
    const relatedIds = new Set([req.params.projectId]);
    deps.kg.edges.forEach(edge => {
      if (edge.source === req.params.projectId) relatedIds.add(edge.target);
      if (edge.target === req.params.projectId) relatedIds.add(edge.source);
    });
    const graph = {
      nodes: deps.kg.nodes.filter(node => relatedIds.has(node.id)),
      edges: deps.kg.edges.filter(edge => relatedIds.has(edge.source) && relatedIds.has(edge.target)),
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
    deps.audit.log({
      actor: (req as AuthenticatedRequest).user!.id,
      action: 'project-supply:nexus:get',
      resourceType: 'project',
      resourceId: req.params.projectId,
      status: 'completed',
      metadata: { tenantId, requirementCount: requirements.length },
    });
    return res.json({
      ok: true,
      data: {
        projectId: req.params.projectId,
        requirements,
        supplyPositions: positions,
        graph: {
          nodes: [...graph.nodes, ...requirementNodes],
          edges: [...graph.edges, ...requirementEdges],
        },
        dataStatus: requirements.length ? 'DERIVED' : 'UNAVAILABLE',
        limitations: requirements.length ? [] : ['No persisted project requirements are linked to this project'],
      },
    });
  });

  router.get('/projects/:projectId/requirements', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    return res.json({ ok: true, data: { requirements: await getRequirements(tenantId, req.params.projectId) } });
  });

  router.get('/projects/:projectId/supply-position', async (req, res) => {
    const tenantId = await authorizeProject(req, res, req.params.projectId);
    if (!tenantId) return;
    const requirements = await getRequirements(tenantId, req.params.projectId);
    return res.json({ ok: true, data: { positions: await getPositions(tenantId, requirements), dataStatus: requirements.length ? 'DERIVED' : 'UNAVAILABLE' } });
  });

  return router;
}
