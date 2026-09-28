import { DigitalTwin, GraphNode, GraphEdge } from '../../src/types/evaluation';
import { KnowledgeGraphService } from './knowledge-graph';

export class DigitalTwinService {
  private graphService: KnowledgeGraphService;

  constructor() {
    this.graphService = KnowledgeGraphService.getInstance();
  }

  public generateSupplierTwin(supplierId: string): DigitalTwin | null {
    const supplierNode = this.graphService.getNode(supplierId);
    if (!supplierNode || supplierNode.type !== 'SUPPLIER') return null;

    const { nodes, edges } = this.graphService.traverse(supplierId, 3);

    return {
      id: supplierId,
      type: 'SUPPLIER',
      nodes,
      edges,
      lastUpdated: new Date().toISOString(),
      riskScore: this.calculateRiskScore(nodes, edges),
      complianceStatus: 'ACTIVE'
    };
  }

  public generateTenderTwin(tenderId: string): DigitalTwin | null {
    const tenderNode = this.graphService.getNode(tenderId);
    if (!tenderNode || tenderNode.type !== 'TENDER') return null;

    const { nodes, edges } = this.graphService.traverse(tenderId, 3);

    return {
      id: tenderId,
      type: 'TENDER',
      nodes,
      edges,
      lastUpdated: new Date().toISOString(),
      riskScore: 0,
      complianceStatus: 'OPEN'
    };
  }

  public generateOrganizationTwin(entityId: string): DigitalTwin | null {
    const entityNode = this.graphService.getNode(entityId);
    if (!entityNode || entityNode.type !== 'ENTITY') return null;

    const { nodes, edges } = this.graphService.traverse(entityId, 3);

    return {
      id: entityId,
      type: 'ORGANIZATION',
      nodes,
      edges,
      lastUpdated: new Date().toISOString(),
      riskScore: 5,
      complianceStatus: 'GOVERNANCE_OPTIMIZED'
    };
  }

  private calculateRiskScore(nodes: GraphNode[], edges: GraphEdge[]): number {
    let score = 10; // Base score
    
    // Increase risk for shared directors with other suppliers
    const sharedDirectorEdges = edges.filter(e => e.type === 'SHARED_DIRECTOR');
    score += sharedDirectorEdges.length * 20;

    // Increase risk for debarment history (if any in properties)
    nodes.forEach(node => {
      if (node.properties.debarred) score += 50;
    });

    return Math.min(100, score);
  }
}
