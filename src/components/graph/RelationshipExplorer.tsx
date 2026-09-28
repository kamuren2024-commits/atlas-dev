import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge } from '../../types/evaluation';
import { fetchNodeTraverse, fetchGraphPath, fetchImpactAnalysis } from '../../utils/graph-service';
import { Search, ZoomIn, ZoomOut, Filter, Info, ShieldAlert, GitBranch, Eye, RotateCcw, Crosshair, Network, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RelationshipExplorerProps {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
  onSelectTwin?: (type: string, id: string) => void;
}

const RelationshipExplorer: React.FC<RelationshipExplorerProps> = ({ initialNodes, initialEdges, onSelectTwin }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const [nodes, setNodes] = useState<any[]>(initialNodes.map(n => ({ ...n })));
  const [edges, setEdges] = useState<any[]>(initialEdges.map(e => ({ ...e })));
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    SUPPLIER: true,
    TENDER: true,
    DIRECTOR: true,
    RULE: true,
    ENTITY: true,
    CONTRACT: true,
    PROJECT: true,
    SHIPMENT: true,
    RISK: true,
    TRANSFORMER: true
  });

  // Intelligence panels
  const [showPathFinder, setShowPathFinder] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState('');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [pathResult, setPathResult] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);

  const [impactData, setImpactData] = useState<any | null>(null);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [expanding, setExpanding] = useState(false);

  useEffect(() => {
    setNodes(initialNodes.map(n => ({ ...n })));
    setEdges(initialEdges.map(e => ({ ...e })));
  }, [initialNodes, initialEdges]);

  // Render D3 Graph
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 650;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    // Filter nodes/edges by active layers
    const visibleNodes = nodes.filter(n => activeLayers[n.type] !== false);
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = edges.filter(e => {
      const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
      const targetId = typeof e.target === 'object' ? e.target.id : e.target;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    const simulation = d3.forceSimulation(visibleNodes)
      .force('link', d3.forceLink(visibleEdges).id((d: any) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g.append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(visibleEdges)
      .join('line')
      .attr('stroke-width', (d: any) => Math.sqrt(d.properties?.shares ? d.properties.shares / 50 : 2))
      .attr('stroke', (d: any) => {
        if (pathResult && pathResult.edges.some(pe => pe.id === d.id)) return '#00D9FF';
        if (d.type === 'HAS_RISK' || d.type === 'IMPACTS') return '#EF4444';
        return '#334155';
      });

    const node = g.append('g')
      .attr('stroke', '#0F172A')
      .attr('stroke-width', 2)
      .selectAll('g')
      .data(visibleNodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', (event, d: any) => {
        setSelectedNode(d);
      });

    node.append('circle')
      .attr('r', (d: any) => d.type === 'ENTITY' ? 18 : d.type === 'SUPPLIER' ? 14 : d.type === 'TENDER' ? 15 : d.type === 'RISK' ? 12 : 10)
      .attr('fill', (d: any) => {
        if (pathResult && pathResult.nodes.some(pn => pn.id === d.id)) return '#00D9FF';
        switch (d.type) {
          case 'ENTITY': return '#00D9FF';
          case 'SUPPLIER': return '#3B82F6';
          case 'TENDER': return '#10B981';
          case 'DIRECTOR': return '#F59E0B';
          case 'RULE': return '#8B5CF6';
          case 'CONTRACT': return '#06B6D4';
          case 'PROJECT': return '#3B82F6';
          case 'SHIPMENT': return '#EC4899';
          case 'RISK': return '#EF4444';
          case 'TRANSFORMER': return '#14B8A6';
          default: return '#64748B';
        }
      });

    node.append('text')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .text((d: any) => d.label)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#F8FAFC')
      .attr('stroke', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, edges, activeLayers, pathResult]);

  // Real Graph Search
  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v3/graph/search?q=${encodeURIComponent(searchTerm)}`);
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const firstMatch = results[0];
        setSelectedNode(firstMatch);
        const data = await fetchNodeTraverse(firstMatch.id, 2);
        if (data.nodes.length) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      }
    } catch (err) {
      console.error('Graph search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Expand Neighborhood Handler
  const handleExpandNeighborhood = async (nodeId: string) => {
    setExpanding(true);
    try {
      const traversal = await fetchNodeTraverse(nodeId, 2);
      if (traversal.nodes.length) {
        // Merge nodes avoiding duplicates
        const existingNodeIds = new Set(nodes.map(n => n.id));
        const newNodes = traversal.nodes.filter(n => !existingNodeIds.has(n.id));
        
        const existingEdgeIds = new Set(edges.map(e => e.id));
        const newEdges = traversal.edges.filter(e => !existingEdgeIds.has(e.id));

        setNodes(prev => [...prev, ...newNodes]);
        setEdges(prev => [...prev, ...newEdges]);
      }
    } catch (err) {
      console.error('Failed to expand neighborhood:', err);
    } finally {
      setExpanding(false);
    }
  };

  // Risk Impact Handler
  const handleAnalyzeRisks = async (nodeId: string) => {
    try {
      const impact = await fetchImpactAnalysis(nodeId);
      setImpactData(impact);
      setShowImpactModal(true);
    } catch (err) {
      console.error('Impact analysis failed:', err);
    }
  };

  // Trace Path Handler
  const handleFindPath = async () => {
    if (!sourceNodeId || !targetNodeId) return;
    setLoading(true);
    setPathError(null);
    try {
      const res = await fetchGraphPath(sourceNodeId, targetNodeId);
      if (!res.nodes || res.nodes.length === 0) {
        setPathResult(null);
        setPathError('NO VERIFIED PATH FOUND');
      } else {
        setPathResult(res);
        setPathError(null);
      }
    } catch (err: any) {
      setPathError('NO VERIFIED PATH FOUND');
      setPathResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Focus Node
  const handleFocus = (node: GraphNode) => {
    setSelectedNode(node);
  };

  // Isolate Node
  const handleIsolate = async (nodeId: string) => {
    const traversal = await fetchNodeTraverse(nodeId, 1);
    if (traversal.nodes.length) {
      setNodes(traversal.nodes);
      setEdges(traversal.edges);
    }
  };

  // Reset Graph View
  const handleReset = () => {
    setNodes(initialNodes.map(n => ({ ...n })));
    setEdges(initialEdges.map(e => ({ ...e })));
    setSelectedNode(null);
    setPathResult(null);
    setPathError(null);
    setSearchTerm('');
  };

  // Layer Toggle
  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="flex flex-col h-full bg-[#05070D] rounded-2xl shadow-lg border border-slate-800/80 overflow-hidden" id="graph-explorer">
      {/* Top Bar Controls */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-[#0B1220]/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Network size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              Relationship Explorer
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/20">LIVE ENGINE</span>
            </h3>
            <p className="text-[11px] text-slate-400">Enterprise Knowledge Graph & Topology Control Plane</p>
          </div>
        </div>

        {/* Path & Control Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPathFinder(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showPathFinder
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-slate-800 text-slate-300 hover:bg-white/10'
            }`}
          >
            <GitBranch size={14} />
            Trace Path
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          {/* Search Input */}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes & attributes..."
                className="pl-8 pr-3 py-1.5 bg-[#05070D] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-56"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Search size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Trace Path Sub-Bar */}
      <AnimatePresence>
        {showPathFinder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 py-3 bg-[#0B1220] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-cyan-400 uppercase tracking-widest text-[10px]">Path Finder:</span>
              <select
                value={sourceNodeId}
                onChange={(e) => setSourceNodeId(e.target.value)}
                className="bg-[#05070D] border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="">Select Source Entity</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                ))}
              </select>
              <ArrowRight size={14} className="text-slate-500" />
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="bg-[#05070D] border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="">Select Target Entity</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                ))}
              </select>
              <button
                onClick={handleFindPath}
                disabled={!sourceNodeId || !targetNodeId || loading}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 font-bold text-slate-950 rounded-lg transition-all"
              >
                Execute BFS Traversal
              </button>
            </div>

            {pathError && (
              <div className="px-3 py-1 bg-rose-500/20 text-rose-400 font-mono font-bold rounded border border-rose-500/30 text-[11px]">
                {pathError}
              </div>
            )}

            {pathResult && pathResult.nodes.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                <span>PATH FOUND:</span>
                <span className="font-bold">{pathResult.nodes.map(n => n.label).join(' → ')}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex relative min-h-[580px]">
        {/* Layer Toggles & Legend Panel */}
        <div className="absolute top-4 left-4 p-3.5 bg-[#05070D]/90 backdrop-blur-md border border-slate-800/80 rounded-xl text-xs space-y-2.5 shadow-xl z-10 w-44">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
            <span>Graph Layers</span>
            <Filter size={12} />
          </div>
          {Object.keys(activeLayers).map(layer => (
            <label key={layer} className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none text-[11px]">
              <input
                type="checkbox"
                checked={activeLayers[layer]}
                onChange={() => toggleLayer(layer)}
                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span className={`w-2 h-2 rounded-full ${
                layer === 'ENTITY' ? 'bg-cyan-400' :
                layer === 'SUPPLIER' ? 'bg-blue-400' :
                layer === 'TENDER' ? 'bg-emerald-400' :
                layer === 'DIRECTOR' ? 'bg-amber-400' :
                layer === 'RISK' ? 'bg-rose-500' : 'bg-slate-400'
              }`} />
              <span className="capitalize">{layer.toLowerCase()}</span>
            </label>
          ))}
        </div>

        {/* SVG Canvas */}
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-[#05070D]" />

        {/* Node Inspector Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-84 bg-[#0B1220]/95 backdrop-blur-md border-l border-slate-800 shadow-2xl p-5 overflow-y-auto z-20 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <h4 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Entity Details</h4>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
              </div>

              {/* Entity Identity */}
              <div>
                <div className="inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider mb-2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {selectedNode.type}
                </div>
                <h2 className="text-xl font-bold text-slate-100 leading-tight">{selectedNode.label}</h2>
                <p className="text-xs font-mono text-slate-400 mt-1">ID: {selectedNode.id}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExpandNeighborhood(selectedNode.id)}
                  disabled={expanding}
                  className="py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} />
                  {expanding ? 'Expanding...' : 'Expand'}
                </button>
                <button
                  onClick={() => handleIsolate(selectedNode.id)}
                  className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Crosshair size={14} />
                  Isolate
                </button>
              </div>

              {/* Properties Section */}
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800/80 pb-1">
                  Canonical Attributes
                </h5>
                <div className="space-y-1.5 font-mono text-xs">
                  {Object.entries(selectedNode.properties || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400 capitalize">{key}:</span>
                      <span className="font-semibold text-slate-200 text-right truncate max-w-[150px]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intelligence Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleAnalyzeRisks(selectedNode.id)}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={15} />
                  Analyze Propagation & Risks
                </button>

                {onSelectTwin && (selectedNode.type === 'SUPPLIER' || selectedNode.type === 'TENDER' || selectedNode.type === 'ORGANIZATION' || selectedNode.type === 'ENTITY') && (
                  <button
                    onClick={() => onSelectTwin(selectedNode.type.toLowerCase(), selectedNode.id)}
                    className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Info size={15} />
                    Open Digital Twin Context
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact Analysis Modal */}
        <AnimatePresence>
          {showImpactModal && impactData && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <ShieldAlert size={20} />
                    <h3 className="font-bold text-slate-100">Ripple Impact & Propagation</h3>
                  </div>
                  <button onClick={() => setShowImpactModal(false)} className="text-slate-400 hover:text-white font-bold">×</button>
                </div>

                <div>
                  <div className="text-xs text-slate-400">TRIGGER NODE</div>
                  <div className="text-lg font-bold text-slate-100">{impactData.trigger?.label || 'Selected Entity'}</div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <div className="text-xs font-bold text-rose-400 uppercase">Affected Nodes: {impactData.affectedNodes?.length || 0}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {impactData.affectedNodes?.map((n: any) => (
                        <span key={n.id} className="px-2 py-0.5 bg-slate-900 text-slate-200 text-[11px] rounded border border-slate-800">
                          {n.label} ({n.type})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="text-xs font-bold text-amber-400 uppercase">Connected Risks: {impactData.risks?.length || 0}</div>
                    <div className="space-y-1 mt-2">
                      {impactData.risks?.map((r: any) => (
                        <div key={r.id} className="text-xs text-slate-300 font-semibold flex items-center justify-between">
                          <span>• {r.label}</span>
                          <span className="text-[10px] text-rose-400 font-mono uppercase">{r.properties?.severity || 'HIGH'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowImpactModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    Close Analysis
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RelationshipExplorer;
