/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Causal Graph Engine
 * 
 * Traversable cause-effect chain: CAUSE → EVENT → ASSET → TOPOLOGY → IMPACT → RISK → RECOMMENDATION
 */

import { Mission, CausalGraph, CausalNode, CausalEdge, RootCauseAnalysis, Recommendation } from './types';

/**
 * Causal Graph Engine
 */
export class CausalGraphEngine {
  private static instance: CausalGraphEngine | null = null;
  private graphs: Map<string, CausalGraph> = new Map();

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): CausalGraphEngine {
    if (!CausalGraphEngine.instance) {
      CausalGraphEngine.instance = new CausalGraphEngine();
    }
    return CausalGraphEngine.instance;
  }

  /**
   * Build causal graph for mission
   */
  public buildGraph(
    mission: Mission,
    rootCause: RootCauseAnalysis,
    recommendations: Recommendation[]
  ): CausalGraph {
    console.log('[CAUSAL-GRAPH] Building causal graph for mission:', mission.id);

    const nodes: CausalNode[] = [];
    const edges: CausalEdge[] = [];

    // 1. CAUSE nodes (from root cause analysis)
    const causeNode = this.createCauseNode(rootCause);
    nodes.push(causeNode);

    // 2. EVENT nodes (from mission evidence)
    const eventNodes = this.createEventNodes(mission);
    nodes.push(...eventNodes);

    // Connect CAUSE → EVENT
    eventNodes.forEach((eventNode) => {
      edges.push({
        from: causeNode.id,
        to: eventNode.id,
        relationship: 'triggers',
        evidence: `${rootCause.primaryHypothesis.title}`,
        confidence: rootCause.confidence,
      });
    });

    // 3. ASSET nodes (affected assets)
    const assetNodes = this.createAssetNodes(mission);
    nodes.push(...assetNodes);

    // Connect EVENT → ASSET
    eventNodes.forEach((eventNode) => {
      assetNodes.forEach((assetNode) => {
        edges.push({
          from: eventNode.id,
          to: assetNode.id,
          relationship: 'affects',
          evidence: `Event impacts ${assetNode.label}`,
          confidence: 80,
        });
      });
    });

    // 4. TOPOLOGY nodes (network effects)
    const topoNode = this.createTopologyNode(mission);
    nodes.push(topoNode);

    // Connect ASSET → TOPOLOGY
    assetNodes.forEach((assetNode) => {
      edges.push({
        from: assetNode.id,
        to: topoNode.id,
        relationship: 'changes',
        evidence: `Cascading impact on network`,
        confidence: 75,
      });
    });

    // 5. IMPACT nodes (consequences)
    const impactNode = this.createImpactNode(mission);
    nodes.push(impactNode);

    // Connect TOPOLOGY → IMPACT
    edges.push({
      from: topoNode.id,
      to: impactNode.id,
      relationship: 'results_in',
      evidence: `Network state change leads to operational impact`,
      confidence: 78,
    });

    // 6. RISK nodes (future risk)
    const riskNode = this.createRiskNode(mission);
    nodes.push(riskNode);

    // Connect IMPACT → RISK
    edges.push({
      from: impactNode.id,
      to: riskNode.id,
      relationship: 'creates',
      evidence: `Current state creates future risk`,
      confidence: 82,
    });

    // 7. RECOMMENDATION nodes (mitigation)
    const recNodes = this.createRecommendationNodes(recommendations);
    nodes.push(...recNodes);

    // Connect RISK → RECOMMENDATION
    recNodes.forEach((recNode) => {
      edges.push({
        from: riskNode.id,
        to: recNode.id,
        relationship: 'mitigated_by',
        evidence: `Recommendation reduces risk`,
        confidence: 85,
      });
    });

    const graph: CausalGraph = { nodes, edges };

    // Store graph
    this.graphs.set(mission.id, graph);

    console.log(
      '[CAUSAL-GRAPH] Graph built:',
      nodes.length,
      'nodes,',
      edges.length,
      'edges'
    );

    return graph;
  }

  /**
   * Create CAUSE node
   */
  private createCauseNode(rootCause: RootCauseAnalysis): CausalNode {
    return {
      id: `cause-${rootCause.primaryHypothesis.id}`,
      type: 'CAUSE',
      label: rootCause.primaryHypothesis.title,
      data: {
        hypothesis: rootCause.primaryHypothesis,
        alternatives: rootCause.hypotheses.slice(1),
      },
      confidence: rootCause.confidence,
    };
  }

  /**
   * Create EVENT nodes
   */
  private createEventNodes(mission: Mission): CausalNode[] {
    return mission.evidence.map((event, idx) => ({
      id: `event-${idx}`,
      type: 'EVENT',
      label: `${event.eventType} at ${new Date(event.timestamp).toLocaleTimeString()}`,
      data: event,
      confidence: 95,
    }));
  }

  /**
   * Create ASSET nodes
   */
  private createAssetNodes(mission: Mission): CausalNode[] {
    return mission.affectedAssets.map((assetId) => ({
      id: `asset-${assetId}`,
      type: 'ASSET',
      label: assetId,
      data: { assetId },
      confidence: 90,
    }));
  }

  /**
   * Create TOPOLOGY node
   */
  private createTopologyNode(mission: Mission): CausalNode {
    return {
      id: 'topology-1',
      type: 'TOPOLOGY',
      label: 'Network Topology Impact',
      data: {
        affectedAssets: mission.affectedAssets.length,
        cascadeRisk: mission.severity === 'CRITICAL',
        redundancyLost: false,
      },
      confidence: 75,
    };
  }

  /**
   * Create IMPACT node
   */
  private createImpactNode(mission: Mission): CausalNode {
    return {
      id: 'impact-1',
      type: 'IMPACT',
      label: 'Operational Impact',
      data: {
        missionType: mission.type,
        severity: mission.severity,
        customerImpact: `${Math.random() * 100000 | 0} customers`,
        serviceImpact: 'Reduced reliability and reserve margin',
      },
      confidence: 80,
    };
  }

  /**
   * Create RISK node
   */
  private createRiskNode(mission: Mission): CausalNode {
    return {
      id: 'risk-1',
      type: 'RISK',
      label: 'Future Grid Risk',
      data: {
        cascadeRisk: 'HIGH',
        frequencyRisk: 'MEDIUM',
        voltageRisk: 'MEDIUM',
        timeToMitigation: '30 minutes',
        worstCaseScenario: 'Total system collapse if not addressed',
      },
      confidence: 82,
    };
  }

  /**
   * Create RECOMMENDATION nodes
   */
  private createRecommendationNodes(recommendations: Recommendation[]): CausalNode[] {
    return recommendations.slice(0, 3).map((rec, idx) => ({
      id: `recommendation-${idx}`,
      type: 'RECOMMENDATION',
      label: rec.title,
      data: {
        ...rec,
        rank: idx === 0 ? 'BEST' : idx === 1 ? 'ALTERNATIVE' : 'CONTINGENT',
      },
      confidence: rec.confidence,
    }));
  }

  /**
   * Get graph for mission
   */
  public getGraph(missionId: string): CausalGraph | null {
    return this.graphs.get(missionId) || null;
  }

  /**
   * Traverse graph forward (CAUSE → RECOMMENDATION)
   */
  public traverseForward(graph: CausalGraph, startNodeId: string): CausalNode[] {
    const visited = new Set<string>();
    const result: CausalNode[] = [];

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.find((n) => n.id === nodeId);
      if (node) result.push(node);

      // Follow outgoing edges
      graph.edges
        .filter((e) => e.from === nodeId)
        .forEach((edge) => {
          traverse(edge.to);
        });
    };

    traverse(startNodeId);
    return result;
  }

  /**
   * Traverse graph backward (RECOMMENDATION → CAUSE)
   */
  public traverseBackward(graph: CausalGraph, startNodeId: string): CausalNode[] {
    const visited = new Set<string>();
    const result: CausalNode[] = [];

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.find((n) => n.id === nodeId);
      if (node) result.push(node);

      // Follow incoming edges
      graph.edges
        .filter((e) => e.to === nodeId)
        .forEach((edge) => {
          traverse(edge.from);
        });
    };

    traverse(startNodeId);
    return result;
  }

  /**
   * Get path from cause to recommendation
   */
  public getFullCausalPath(
    graph: CausalGraph,
    causeNodeId: string
  ): { nodes: CausalNode[]; edges: CausalEdge[] } {
    const path = this.traverseForward(graph, causeNodeId);

    const pathNodeIds = new Set(path.map((n) => n.id));

    const relevantEdges = graph.edges.filter(
      (e) => pathNodeIds.has(e.from) && pathNodeIds.has(e.to)
    );

    return {
      nodes: path,
      edges: relevantEdges,
    };
  }

  /**
   * Get causal chain explanation
   */
  public explainCausalChain(graph: CausalGraph): string {
    if (graph.nodes.length === 0) return 'No causal chain available';

    const causeNodes = graph.nodes.filter((n) => n.type === 'CAUSE');
    if (causeNodes.length === 0) return 'No root cause identified';

    const startNode = causeNodes[0];
    const path = this.traverseForward(graph, startNode.id);

    let explanation = `CAUSAL CHAIN:\n\n`;
    explanation += `1. CAUSE: ${startNode.label} (Confidence: ${startNode.confidence}%)\n\n`;

    let currentType = '';
    let stepNum = 2;

    path.slice(1).forEach((node) => {
      if (node.type !== currentType) {
        explanation += `${stepNum}. ${node.type}:\n`;
        stepNum++;
        currentType = node.type;
      }
      explanation += `   - ${node.label} (Confidence: ${node.confidence}%)\n`;
    });

    return explanation;
  }

  /**
   * Clear graph
   */
  public clearGraph(missionId: string): void {
    this.graphs.delete(missionId);
  }
}

export default CausalGraphEngine;
