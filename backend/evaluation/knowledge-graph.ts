import { GraphNode, GraphEdge, GraphProvenance, GraphRelationshipClass } from '../../src/types/evaluation';

/**
 * Structural contract for the Finance subsystems (Phase 01 — 01-14 graph sync,
 * ingestion, /api/finance mount).  Server mounts `KnowledgeGraphService
 * .getGraph()` — a live `{ nodes, edges }` container — into `/api/finance` as
 * `kg`.  Nodes/edges are written in a superset shape of GraphNode/GraphEdge so
 * existing graph consumers (collusion detection, digital twin, entity
 * resolution) continue to work against the same live graph.
 */
export interface KnowledgeGraphNode {
  id: string;
  type: string;
  label: string;
  category?: string;
  attributes?: Record<string, unknown>;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id?: string;
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  type?: string;
  relationship?: string;
  weight?: number;
  attributes?: Record<string, unknown>;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export class KnowledgeGraphService {
  private static instance: KnowledgeGraphService;
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();

  private constructor() {
    this.seedInitialGraph();
  }

  public static getInstance(): KnowledgeGraphService {
    if (!KnowledgeGraphService.instance) {
      KnowledgeGraphService.instance = new KnowledgeGraphService();
    }
    return KnowledgeGraphService.instance;
  }

  private seedInitialGraph() {
    // Seed basic nodes based on the evaluation engine's bidders and entities
    const source = 'atlas-seed-adapter';
    const properties = (extra: Record<string, unknown>) => ({
      ...extra,
      tenantId: 'ketraco',
      sourceSystem: source,
      observedAt: new Date().toISOString(),
    });
    const entities = [
      { id: 'ent-ketraco', type: 'ENTITY', label: 'KETRACO', properties: properties({ role: 'PROCURING_ENTITY' }) },
      { id: 'tender-2026-08', type: 'TENDER', label: 'KETRACO/TNT/2026/08', properties: properties({ title: 'Supply of Conductor Spares', status: 'EVALUATION' }) },
      { id: 'supplier-shanghai', type: 'SUPPLIER', label: 'Shanghai Grid Metal Corp', properties: properties({ pin: 'P051284920K', ipAddress: '192.168.1.50' }) },
      { id: 'supplier-siemens', type: 'SUPPLIER', label: 'Siemens Energy Ltd Nairobi', properties: properties({ pin: 'P002931849L', ipAddress: '192.168.1.50' }) },
      { id: 'director-liang', type: 'DIRECTOR', label: 'Liang Wei', properties: properties({ nationality: 'Chinese' }) },
      { id: 'director-jane', type: 'DIRECTOR', label: 'Jane Wambui', properties: properties({ nationality: 'Kenyan' }) },
      { id: 'rule-ppada-71', type: 'RULE', label: 'PPADA Section 71', properties: properties({ description: 'Mandatory Compliance Requirements' }) },
      { id: 'contract-suswa-04', type: 'CONTRACT', label: 'Contract KTR-SUSWA-04', properties: properties({ status: 'ACTIVE', value: 185000000 }) },
      { id: 'project-suswa-04', type: 'PROJECT', label: 'Suswa Lot 4 Grid Link', properties: properties({ status: 'IN_DELIVERY', criticality: 'HIGH' }) },
      { id: 'shipment-cable-01', type: 'SHIPMENT', label: 'Shipment SHP-CABLE-01', properties: properties({ status: 'DELAYED', eta: '2026-09-12' }) },
      { id: 'inventory-insulator-01', type: 'INVENTORY_ITEM', label: 'EHV Glass Insulator Kit', properties: properties({ available: 70, unit: 'kits', reorderPoint: 80 }) },
      { id: 'warehouse-embakasi', type: 'WAREHOUSE', label: 'Embakasi Central Warehouse', properties: properties({ region: 'Nairobi' }) },
      { id: 'asset-suswa-transformer', type: 'TRANSFORMER', label: 'Suswa 220/132kV Transformer', properties: properties({ status: 'COMMISSIONING' }) },
      { id: 'risk-shipment-delay', type: 'RISK', label: 'Shipment delay exposure', properties: properties({ severity: 'HIGH', status: 'OPEN' }) },
    ];

    entities.forEach(ent => this.addNode(ent as GraphNode));

    const verified = (sourceRecordId: string): GraphProvenance => ({
      source,
      sourceRecordId,
      observedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED',
      confidence: 1,
    });
    const edges = [
      { id: 'edge-1', source: 'tender-2026-08', target: 'ent-ketraco', type: 'ISSUED_BY', confidence: 1, properties: {}, provenance: verified('tender-2026-08') },
      { id: 'edge-2', source: 'supplier-shanghai', target: 'tender-2026-08', type: 'SUBMITTED_BID', confidence: 1, properties: {}, provenance: verified('bid-shanghai-2026-08') },
      { id: 'edge-3', source: 'supplier-siemens', target: 'tender-2026-08', type: 'SUBMITTED_BID', confidence: 1, properties: {}, provenance: verified('bid-siemens-2026-08') },
      { id: 'edge-4', source: 'director-liang', target: 'supplier-shanghai', type: 'DIRECTOR_OF', confidence: 1, properties: { shares: 500 }, provenance: verified('supplier-shanghai') },
      { id: 'edge-5', source: 'director-jane', target: 'supplier-shanghai', type: 'DIRECTOR_OF', confidence: 1, properties: { shares: 500 }, provenance: verified('supplier-shanghai') },
      { id: 'edge-6', source: 'tender-2026-08', target: 'rule-ppada-71', type: 'COMPLIES_WITH', confidence: 1, properties: {}, provenance: verified('rule-ppada-71') },
      { id: 'edge-contract-supplier', source: 'supplier-shanghai', target: 'contract-suswa-04', type: 'AWARDED', confidence: 1, properties: {}, provenance: verified('contract-suswa-04') },
      { id: 'edge-contract-project', source: 'contract-suswa-04', target: 'project-suswa-04', type: 'DELIVERS_FOR', confidence: 1, properties: {}, provenance: verified('contract-suswa-04') },
      { id: 'edge-project-shipment', source: 'project-suswa-04', target: 'shipment-cable-01', type: 'DEPENDS_ON', confidence: 1, properties: {}, provenance: verified('project-suswa-04') },
      { id: 'edge-shipment-inventory', source: 'shipment-cable-01', target: 'inventory-insulator-01', type: 'CONTAINS', confidence: 1, properties: {}, provenance: verified('shipment-cable-01') },
      { id: 'edge-inventory-warehouse', source: 'inventory-insulator-01', target: 'warehouse-embakasi', type: 'STORED_AT', confidence: 1, properties: {}, provenance: verified('warehouse-embakasi') },
      { id: 'edge-project-asset', source: 'project-suswa-04', target: 'asset-suswa-transformer', type: 'USES', confidence: 1, properties: {}, provenance: verified('project-suswa-04') },
      { id: 'edge-shipment-risk', source: 'shipment-cable-01', target: 'risk-shipment-delay', type: 'HAS_RISK', confidence: 1, properties: {}, provenance: verified('shipment-cable-01') },
      { id: 'edge-risk-project', source: 'risk-shipment-delay', target: 'project-suswa-04', type: 'IMPACTS', confidence: 0.92, relationshipClass: 'INDIRECT' as GraphRelationshipClass, properties: {}, provenance: { ...verified('impact-analysis-01'), verificationStatus: 'SYSTEM_DERIVED', confidence: 0.92 } },
    ];

    edges.forEach(edge => this.addEdge(edge as GraphEdge));
  }

  public addNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge) {
    this.edges.set(edge.id, edge);
  }

  public getRelationships(nodeId: string, filters?: { type?: string; source?: string; minConfidence?: number }) {
    return Array.from(this.edges.values()).filter(edge =>
      (edge.source === nodeId || edge.target === nodeId) &&
      (!filters?.type || edge.type === filters.type) &&
      (!filters?.source || edge.provenance?.source === filters.source) &&
      (filters?.minConfidence === undefined || edge.confidence >= filters.minConfidence)
    );
  }

  public findRelatedEntities(nodeId: string, depth = 1, limit = 50) {
    return this.traverse(nodeId, Math.min(Math.max(depth, 0), 3)).nodes.filter(node => node.id !== nodeId).slice(0, limit);
  }

  public findPath(startId: string, targetId: string, maxDepth = 5) {
    const queue: Array<{ id: string; nodePath: string[]; edgePath: string[] }> = [{ id: startId, nodePath: [startId], edgePath: [] }];
    const visited = new Set<string>([startId]);
    while (queue.length) {
      const current = queue.shift()!;
      if (current.id === targetId) {
        return { nodes: current.nodePath.map(id => this.nodes.get(id)).filter((node): node is GraphNode => Boolean(node)), edges: current.edgePath.map(id => this.edges.get(id)).filter((edge): edge is GraphEdge => Boolean(edge)) };
      }
      if (current.edgePath.length >= maxDepth) continue;
      for (const edge of this.getRelationships(current.id)) {
        const nextId = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({ id: nextId, nodePath: [...current.nodePath, nextId], edgePath: [...current.edgePath, edge.id] });
        }
      }
    }
    return null;
  }

  public findConnectedRisks(nodeId: string, depth = 3) {
    return this.findRelatedEntities(nodeId, depth).filter(node => node.type === 'RISK');
  }

  public findImpact(nodeId: string, depth = 4) {
    const graph = this.traverse(nodeId, Math.min(Math.max(depth, 1), 4));
    return {
      trigger: this.getNode(nodeId),
      affectedNodes: graph.nodes.filter(node => node.id !== nodeId),
      relationships: graph.edges,
      risks: graph.nodes.filter(node => node.type === 'RISK'),
    };
  }

  public getGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  public getNode(id: string) {
    return this.nodes.get(id);
  }

  public getNeighbors(nodeId: string) {
    const neighbors: { node: GraphNode; edge: GraphEdge }[] = [];
    this.edges.forEach(edge => {
      if (edge.source === nodeId) {
        const targetNode = this.nodes.get(edge.target);
        if (targetNode) neighbors.push({ node: targetNode, edge });
      } else if (edge.target === nodeId) {
        const sourceNode = this.nodes.get(edge.source);
        if (sourceNode) neighbors.push({ node: sourceNode, edge });
      }
    });
    return neighbors;
  }

  public search(query: string) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nodes.values()).filter(node => 
      node.label.toLowerCase().includes(lowerQuery) || 
      Object.values(node.properties).some(v => String(v).toLowerCase().includes(lowerQuery))
    );
  }

  public traverse(startNodeId: string, depth: number = 2) {
    const visited = new Set<string>();
    const resultNodes = new Map<string, GraphNode>();
    const resultEdges = new Map<string, GraphEdge>();

    const traverseRecursive = (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) return;
      visited.add(currentId);

      const node = this.nodes.get(currentId);
      if (node) resultNodes.set(currentId, node);

      this.edges.forEach(edge => {
        if (edge.source === currentId) {
          resultEdges.set(edge.id, edge);
          traverseRecursive(edge.target, currentDepth + 1);
        } else if (edge.target === currentId) {
          resultEdges.set(edge.id, edge);
          traverseRecursive(edge.source, currentDepth + 1);
        }
      });
    };

    traverseRecursive(startNodeId, 0);

    return {
      nodes: Array.from(resultNodes.values()),
      edges: Array.from(resultEdges.values())
    };
  }
}
