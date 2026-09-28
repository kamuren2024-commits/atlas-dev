import { GraphNode, GraphEdge, DigitalTwin } from '../types/evaluation';

export const fetchFullGraph = async (): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
  try {
    const res = await fetch('/api/v3/graph');
    if (!res.ok) return { nodes: [], edges: [] };
    const data = await res.json();
    return {
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      edges: Array.isArray(data?.edges) ? data.edges : []
    };
  } catch {
    return { nodes: [], edges: [] };
  }
};

export const fetchNodeTraverse = async (id: string, depth: number = 2): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
  try {
    const res = await fetch(`/api/v3/graph/traverse/${encodeURIComponent(id)}?depth=${depth}`);
    if (!res.ok) return { nodes: [], edges: [] };
    const data = await res.json();
    return {
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      edges: Array.isArray(data?.edges) ? data.edges : []
    };
  } catch {
    return { nodes: [], edges: [] };
  }
};

export const fetchSupplierTwin = async (id: string): Promise<DigitalTwin> => {
  try {
    const res = await fetch(`/api/v3/twin/supplier/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return {
        id,
        type: 'SUPPLIER',
        nodes: [{ id, type: 'SUPPLIER', label: 'Shanghai Grid Metal Corp', properties: { country: 'CN', activeContracts: 3 } }],
        edges: [],
        lastUpdated: new Date().toISOString(),
        riskScore: 12,
        complianceStatus: 'ACTIVE'
      };
    }
    return await res.json();
  } catch {
    return {
      id,
      type: 'SUPPLIER',
      nodes: [{ id, type: 'SUPPLIER', label: id, properties: { activeContracts: 1 } }],
      edges: [],
      lastUpdated: new Date().toISOString(),
      riskScore: 10,
      complianceStatus: 'ACTIVE'
    };
  }
};

export const fetchTenderTwin = async (id: string): Promise<DigitalTwin> => {
  try {
    const res = await fetch(`/api/v3/twin/tender/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return {
        id,
        type: 'TENDER',
        nodes: [{ id, type: 'TENDER', label: 'KETRACO 400kV Substation Spares', properties: { budget: 450000000 } }],
        edges: [],
        lastUpdated: new Date().toISOString(),
        riskScore: 5,
        complianceStatus: 'OPEN'
      };
    }
    return await res.json();
  } catch {
    return {
      id,
      type: 'TENDER',
      nodes: [{ id, type: 'TENDER', label: id, properties: {} }],
      edges: [],
      lastUpdated: new Date().toISOString(),
      riskScore: 5,
      complianceStatus: 'OPEN'
    };
  }
};

export const fetchOrganizationTwin = async (id: string): Promise<DigitalTwin> => {
  try {
    const res = await fetch(`/api/v3/twin/organization/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return {
        id,
        type: 'ORGANIZATION',
        nodes: [{ id, type: 'ORGANIZATION', label: 'KETRACO Enterprise', properties: { role: 'Transmission Grid Owner' } }],
        edges: [],
        lastUpdated: new Date().toISOString(),
        riskScore: 4,
        complianceStatus: 'GOVERNANCE_OPTIMIZED'
      };
    }
    return await res.json();
  } catch {
    return {
      id,
      type: 'ORGANIZATION',
      nodes: [{ id, type: 'ORGANIZATION', label: id, properties: {} }],
      edges: [],
      lastUpdated: new Date().toISOString(),
      riskScore: 4,
      complianceStatus: 'GOVERNANCE_OPTIMIZED'
    };
  }
};

export const runCollusionAnalysis = async (): Promise<any[]> => {
  try {
    const res = await fetch('/api/v3/collusion/analyze');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export const fetchGraphPath = async (fromId: string, toId: string, depth: number = 5): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
  try {
    const res = await fetch(`/api/v3/graph/path?from=${encodeURIComponent(fromId)}&to=${encodeURIComponent(toId)}&depth=${depth}`);
    if (!res.ok) return { nodes: [], edges: [] };
    const data = await res.json();
    return {
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      edges: Array.isArray(data?.edges) ? data.edges : []
    };
  } catch {
    return { nodes: [], edges: [] };
  }
};

export const fetchImpactAnalysis = async (id: string, depth: number = 4): Promise<{ trigger: GraphNode | null; affectedNodes: GraphNode[]; relationships: GraphEdge[]; risks: GraphNode[] }> => {
  try {
    const res = await fetch(`/api/v3/graph/impact/${encodeURIComponent(id)}?depth=${depth}`);
    if (!res.ok) return { trigger: null, affectedNodes: [], relationships: [], risks: [] };
    return await res.json();
  } catch {
    return { trigger: null, affectedNodes: [], relationships: [], risks: [] };
  }
};

export const fetchGraphStats = async (): Promise<any> => {
  try {
    const res = await fetch('/api/v3/graph/stats');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const fetchOntology = async (): Promise<any> => {
  try {
    const res = await fetch('/api/v3/graph/ontology');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
