import { OntologyEngine, OntologyRelationship, OntologyEntity } from '../ontology/OntologyEngine';
import { ObservabilityEngine } from '../observability/Observability';

export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export class KnowledgeGraphEngine {
  private static instance: KnowledgeGraphEngine;

  private constructor() {}

  public static getInstance(): KnowledgeGraphEngine {
    if (!KnowledgeGraphEngine.instance) {
      KnowledgeGraphEngine.instance = new KnowledgeGraphEngine();
    }
    return KnowledgeGraphEngine.instance;
  }

  /**
   * Search and formulate full adjacency maps
   */
  public getGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const ontology = OntologyEngine.getInstance();
    
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Map out all entities in system as GraphNodes
    const types = ['Supplier', 'Contract', 'Project', 'Substation'];
    for (const tId of types) {
      const ents = ontology.getEntitiesByType(tId);
      for (const ent of ents) {
        nodes.push({
          id: `${ent.typeId}:${ent.id}`,
          type: ent.typeId,
          properties: ent.properties
        });
      }
    }

    // Map relationships as edges
    const rels = ontology.getRelationships();
    for (const rel of rels) {
      edges.push({
        from: `${rel.sourceType}:${rel.sourceId}`,
        to: `${rel.targetType}:${rel.targetId}`,
        relation: rel.relationshipName
      });
    }

    return { nodes, edges };
  }

  /**
   * Trace Downstream dependency maps (Impact Analysis)
   */
  public async traceWorkflowImpact(startId: string, startType: string, traceId?: string): Promise<{
    impactedSubstations: string[];
    affectedContracts: string[];
    traversalPath: string[];
  }> {
    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();
    
    return await ObservabilityEngine.traceAction(
      `GRAPH_IMPACT_TRAVERSAL_${startId.toUpperCase()}`,
      'KnowledgeGraphEngine',
      { startId, startType },
      async () => {
        const ontology = OntologyEngine.getInstance();
        const analysis = ontology.performImpactAnalysis(startId, startType);

        return {
          impactedSubstations: analysis.affectedSubstations,
          affectedContracts: analysis.affectedContracts,
          traversalPath: analysis.visitedIds
        };
      },
      correlationId
    );
  }

  /**
   * Root Cause Back-tracking (trace ancestors of complex failure logs)
   */
  public performRootCauseAnalysis(targetId: string, targetType: string): {
    upstreamFaultCandidates: string[];
    riskOriginators: { id: string; type: string; details: any }[];
  } {
    const ontology = OntologyEngine.getInstance();
    const rels = ontology.getRelationships();

    const visited = new Set<string>();
    const parents: string[] = [];
    const queue: Array<{ id: string; type: string }> = [{ id: targetId, type: targetType }];
    
    visited.add(`${targetType}:${targetId}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Find all relations leading INTO this entity (backward traverse)
      const incoming = rels.filter(
        rel => rel.targetId === current.id && rel.targetType === current.type
      );

      for (const edge of incoming) {
        const parentKey = `${edge.sourceType}:${edge.sourceId}`;
        if (!visited.has(parentKey)) {
          visited.add(parentKey);
          parents.push(parentKey);
          queue.push({ id: edge.sourceId, type: edge.sourceType });
        }
      }
    }

    const candidates = Array.from(visited);
    const riskOriginators = candidates
      .map(key => {
        const parts = key.split(':');
        const type = parts[0];
        const id = parts[1];
        const ent = ontology.getEntity(type, id);
        return { id, type, details: ent?.properties || {} };
      })
      .filter(o => o.type === 'Supplier'); // Suppliers are the typical root origin of supply risks

    return {
      upstreamFaultCandidates: parents,
      riskOriginators
    };
  }

  /**
   * Syncs metadata with Neo4j / Memgraph / Neptune target mocks
   */
  public async publishToCloudGraphDB(graphUrl: string): Promise<{ success: boolean; rowsSynced: number }> {
    const data = this.getGraphData();
    // Simulate high speed REST push to external graph instance
    return {
      success: true,
      rowsSynced: data.nodes.length + data.edges.length
    };
  }
}
