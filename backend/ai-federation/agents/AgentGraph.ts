// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AGENT GRAPH
// Dynamic capability-based agent discovery and orchestration
// ============================================================================

import { AgentDefinition } from './AgentRuntime';
import { findAgentsByCapability, ENTERPRISE_AGENTS } from './AgentRegistry';

export interface AgentNode {
  agent: AgentDefinition;
  connectedAgents: string[];
  centrality: number;  // 0-100
  capabilities: string[];
}

export class AgentGraph {
  private static instance: AgentGraph;
  private nodes: Map<string, AgentNode> = new Map();
  private edges: Array<{ from: string; to: string; type: string }> = [];

  private constructor() {
    this.buildGraph();
  }

  public static getInstance(): AgentGraph {
    if (!AgentGraph.instance) {
      AgentGraph.instance = new AgentGraph();
    }
    return AgentGraph.instance;
  }

  /**
   * Build the agent graph from registry definitions
   */
  private buildGraph(): void {
    this.nodes.clear();
    this.edges = [];

    for (const agent of ENTERPRISE_AGENTS) {
      this.nodes.set(agent.id, {
        agent,
        connectedAgents: [],
        centrality: 0,
        capabilities: agent.providedCapabilities,
      });
    }

    // Connect agents that share capabilities
    for (const [id, node] of this.nodes) {
      for (const [otherId, otherNode] of this.nodes) {
        if (id === otherId) continue;

        const shared = node.capabilities.filter(cap =>
          otherNode.capabilities.includes(cap) || otherNode.agent.requiredCapabilities.includes(cap)
        );

        if (shared.length > 0) {
          node.connectedAgents.push(otherId);
          this.edges.push({ from: id, to: otherId, type: shared.join(',') });
        }
      }
    }

    // Compute centrality
    for (const [id, node] of this.nodes) {
      node.centrality = node.connectedAgents.length > 0
        ? (node.connectedAgents.length / (this.nodes.size - 1)) * 100
        : 0;
    }
  }

  /**
   * Discover agents that can fulfill required capabilities
   */
  findAgents(requiredCapabilities: string[]): Array<{
    agent: AgentDefinition;
    matchedCapabilities: string[];
    score: number;
  }> {
    return ENTERPRISE_AGENTS.map(agent => {
      const matched = agent.providedCapabilities.filter(cap => requiredCapabilities.includes(cap));
      const score = matched.length > 0
        ? (matched.length / requiredCapabilities.length) * 100
        : 0;
      return { agent, matchedCapabilities: matched, score };
    })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Find agents connected to a specific agent
   */
  getConnectedAgents(agentId: string): AgentNode[] {
    const node = this.nodes.get(agentId);
    if (!node) return [];
    return node.connectedAgents
      .map(id => this.nodes.get(id))
      .filter((n): n is AgentNode => !!n);
  }

  /**
   * Trace a delegation path between two agents
   */
  traceDelegationPath(fromAgentId: string, toAgentId: string): string[] | null {
    const queue: Array<{ agentId: string; path: string[] }> = [
      { agentId: fromAgentId, path: [fromAgentId] },
    ];
    const visited = new Set<string>([fromAgentId]);

    while (queue.length > 0) {
      const { agentId, path } = queue.shift()!;
      const node = this.nodes.get(agentId);
      if (!node) continue;

      for (const connectedId of node.connectedAgents) {
        if (connectedId === toAgentId) {
          return [...path, toAgentId];
        }
        if (!visited.has(connectedId)) {
          visited.add(connectedId);
          queue.push({ agentId: connectedId, path: [...path, connectedId] });
        }
      }
    }

    return null;
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    totalAgents: number;
    totalEdges: number;
    averageCentrality: number;
    mostConnected: AgentNode[];
    clusters: Array<{ clusterId: number; agents: string[] }>;
  } {
    const nodes = Array.from(this.nodes.values());
    const avgCentrality = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.centrality, 0) / nodes.length
      : 0;

    const mostConnected = [...nodes]
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 5);

    // Simple cluster detection via connected components (BFS)
    const visited = new Set<string>();
    const clusters: Array<{ clusterId: number; agents: string[] }> = [];
    let clusterId = 0;

    for (const [id] of this.nodes) {
      if (visited.has(id)) continue;

      const cluster = [id];
      visited.add(id);
      const queue = [id];

      while (queue.length > 0) {
        const current = queue.shift()!;
        const node = this.nodes.get(current);
        if (!node) continue;
        for (const conn of node.connectedAgents) {
          if (!visited.has(conn)) {
            visited.add(conn);
            cluster.push(conn);
            queue.push(conn);
          }
        }
      }

      clusters.push({ clusterId: clusterId++, agents: cluster });
    }

    return {
      totalAgents: nodes.length,
      totalEdges: this.edges.length,
      averageCentrality: avgCentrality,
      mostConnected,
      clusters,
    };
  }

  getAllNodes(): AgentNode[] {
    return Array.from(this.nodes.values());
  }
}
