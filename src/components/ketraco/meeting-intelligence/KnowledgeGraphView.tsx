import React, { useState, useEffect } from 'react';
import {
  Share2,
  Layers,
  Search,
  Filter,
  ShieldCheck,
  Building,
  User,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import type { MeetingEntity } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  meeting: MeetingEntity;
}

interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export const KnowledgeGraphView: React.FC<Props> = ({ meeting }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGraph();
  }, [meeting.id]);

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/meeting-intelligence/graph/meeting/${meeting.id}`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        if (data.nodes?.length > 0) setSelectedNode(data.nodes[0]);
      } else {
        createFallbackGraph();
      }
    } catch (e) {
      createFallbackGraph();
    } finally {
      setIsLoading(false);
    }
  };

  const createFallbackGraph = () => {
    const fallbackNodes: GraphNode[] = [
      { id: meeting.id, label: meeting.title, type: 'Meeting' },
      { id: 'PRJ_SCM', label: 'SCM Modernization 2025', type: 'Project' },
      { id: 'TND_SCM_01', label: 'TND-SCM-2025-084', type: 'Tender' },
      { id: 'SUP_SHANGHAI', label: 'Shanghai Electric Group', type: 'Supplier' },
      { id: 'DEC_0241', label: 'D-0241: Supplier Validation', type: 'Decision' },
      { id: 'ACT_01', label: 'Deploy Live KRA Adapter', type: 'Action' },
      { id: 'RSK_01', label: 'KRA API Schema Outage', type: 'Risk' },
      { id: 'USR_KAMUREN', label: 'Kamuren Wanjau (Ops Director)', type: 'Person' }
    ];

    const fallbackEdges: GraphEdge[] = [
      { id: 'E1', source: meeting.id, target: 'PRJ_SCM', type: 'GOVERNS_PROJECT' },
      { id: 'E2', source: meeting.id, target: 'DEC_0241', type: 'RESULTED_IN' },
      { id: 'E3', source: meeting.id, target: 'ACT_01', type: 'GENERATED_ACTION' },
      { id: 'E4', source: 'PRJ_SCM', target: 'TND_SCM_01', type: 'EXECUTES_TENDER' },
      { id: 'E5', source: 'TND_SCM_01', target: 'SUP_SHANGHAI', type: 'EVALUATING_BIDDER' },
      { id: 'E6', source: 'ACT_01', target: 'RSK_01', type: 'MITIGATES' }
    ];

    setNodes(fallbackNodes);
    setEdges(fallbackEdges);
    setSelectedNode(fallbackNodes[0]);
  };

  const filteredNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-cyan-500/20 border-cyan-400 text-cyan-300';
      case 'Decision':
        return 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
      case 'Action':
        return 'bg-amber-500/20 border-amber-400 text-amber-300';
      case 'Risk':
        return 'bg-rose-500/20 border-rose-400 text-rose-300';
      case 'Project':
        return 'bg-purple-500/20 border-purple-400 text-purple-300';
      case 'Tender':
        return 'bg-blue-500/20 border-blue-400 text-blue-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Atlas Ontology & Enterprise Knowledge Graph
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Bidirectional semantic linking of meetings, project delivery milestones, statutory tenders, and executive decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGraph}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Sub-graph
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0c1220] border border-slate-800/80 rounded-xl p-3">
        <div className="text-xs font-mono text-slate-400">
          Sub-graph: <strong className="text-cyan-400">{nodes.length} Nodes</strong> • <strong className="text-purple-400">{edges.length} Edges</strong>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1 font-mono"
        >
          <option value="ALL">All Entity Types</option>
          <option value="Meeting">Meeting</option>
          <option value="Decision">Decision</option>
          <option value="Action">Action</option>
          <option value="Risk">Risk</option>
          <option value="Project">Project</option>
          <option value="Tender">Tender</option>
        </select>
      </div>

      {/* Visual Network Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Interactive Node Map (8 cols) */}
        <div className="lg:col-span-8 bg-[#090d16] border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
              Connected Domain Entities ({filteredNodes.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                    selectedNode?.id === node.id
                      ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'hover:scale-[1.02]'
                  } ${getNodeColor(node.type)}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                    <span>{node.type}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </div>
                  <h4 className="font-bold text-slate-100 line-clamp-2">{node.label}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Active Edges Stream */}
          <div className="pt-4 border-t border-slate-800/80 mt-6 relative z-10">
            <h4 className="text-[11px] font-mono font-semibold text-slate-400 uppercase mb-2">
              Relational Edges Active ({edges.length}):
            </h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {edges.map((e) => (
                <span
                  key={e.id}
                  className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1.5"
                >
                  <strong className="text-cyan-400">{e.source.split('_')[0]}</strong>
                  <span className="text-slate-500">→ [{e.type}] →</span>
                  <strong className="text-purple-400">{e.target.split('_')[0]}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Entity Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Ontology Node Inspector
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                  {selectedNode.type} Node
                </span>
                <h4 className="text-sm font-bold text-slate-100">{selectedNode.label}</h4>
                <p className="text-[11px] font-mono text-slate-500">{selectedNode.id}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                  Connected Edges from this Node:
                </h5>
                <div className="space-y-1.5">
                  {edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge) => (
                      <div
                        key={edge.id}
                        className="p-2 rounded bg-slate-950/60 border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center justify-between"
                      >
                        <span className="text-cyan-400 font-semibold">{edge.type}</span>
                        <span className="text-slate-500">
                          {edge.source === selectedNode.id ? edge.target : edge.source}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Select an entity in the graph to inspect properties.</p>
          )}
        </div>
      </div>
    </div>
  );
};
