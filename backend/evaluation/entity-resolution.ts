import { GraphNode, GraphEdge } from '../../src/types/evaluation';
import { KnowledgeGraphService } from './knowledge-graph';

export class EntityResolutionEngine {
  private graphService: KnowledgeGraphService;

  constructor() {
    this.graphService = KnowledgeGraphService.getInstance();
  }

  public resolveEntities() {
    const { nodes } = this.graphService.getGraph();
    const suppliers = nodes.filter(n => n.type === 'SUPPLIER');
    const directors = nodes.filter(n => n.type === 'DIRECTOR');

    // Rule-based entity resolution
    this.detectSharedDirectors(suppliers);
    this.detectSharedAddresses(suppliers);
    this.detectDuplicateSuppliers(suppliers);
  }

  private detectSharedDirectors(suppliers: GraphNode[]) {
    // Logic to find suppliers with same directors
    for (let i = 0; i < suppliers.length; i++) {
      for (let j = i + 1; j < suppliers.length; j++) {
        const s1 = suppliers[i];
        const s2 = suppliers[j];
        
        const neighbors1 = this.graphService.getNeighbors(s1.id);
        const neighbors2 = this.graphService.getNeighbors(s2.id);

        const directors1 = neighbors1.filter(n => n.node.type === 'DIRECTOR').map(n => n.node.id);
        const directors2 = neighbors2.filter(n => n.node.type === 'DIRECTOR').map(n => n.node.id);

        const shared = directors1.filter(id => directors2.includes(id));

        if (shared.length > 0) {
          this.graphService.addEdge({
            id: `rel-shared-dir-${s1.id}-${s2.id}`,
            source: s1.id,
            target: s2.id,
            type: 'SHARED_DIRECTOR',
            confidence: 1,
            properties: { sharedDirectors: shared }
          });
        }
      }
    }
  }

  private detectSharedAddresses(suppliers: GraphNode[]) {
    // Logic to find suppliers with same addresses
    for (let i = 0; i < suppliers.length; i++) {
      for (let j = i + 1; j < suppliers.length; j++) {
        const s1 = suppliers[i];
        const s2 = suppliers[j];

        if (s1.properties.address && s1.properties.address === s2.properties.address) {
          this.graphService.addEdge({
            id: `rel-shared-addr-${s1.id}-${s2.id}`,
            source: s1.id,
            target: s2.id,
            type: 'SHARED_ADDRESS',
            confidence: 0.9,
            properties: { address: s1.properties.address }
          });
        }
      }
    }
  }

  private detectDuplicateSuppliers(suppliers: GraphNode[]) {
    // Logic to find potential duplicate suppliers (e.g., similar names, same PIN)
    for (let i = 0; i < suppliers.length; i++) {
      for (let j = i + 1; j < suppliers.length; j++) {
        const s1 = suppliers[i];
        const s2 = suppliers[j];

        if (s1.properties.pin && s1.properties.pin === s2.properties.pin) {
          this.graphService.addEdge({
            id: `rel-duplicate-${s1.id}-${s2.id}`,
            source: s1.id,
            target: s2.id,
            type: 'POTENTIAL_DUPLICATE',
            confidence: 0.95,
            properties: { reason: 'Same PIN Number' }
          });
        }
      }
    }
  }
}
