import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Search, BookOpen, Layers, Sparkles, RefreshCcw } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  group: 'memory' | 'security' | 'intelligence' | 'analytic';
  summary: string;
  x: number;
  y: number;
  size: number;
}

interface Edge {
  source: string;
  target: string;
}

export default function KnowledgeCortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filter, setFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = [
    { id: '1', label: 'OAuth Token Ingress', group: 'memory', x: 200, y: 150, size: 10, summary: 'Persistent database hooks storing third-party auth access keys securely, synced through server cookies.' },
    { id: '2', label: 'Anomaly Detector S-1', group: 'security', x: 350, y: 220, size: 12, summary: 'Automated statistical checker analyzing CPU levels, latency variations, and workspace permission violations.' },
    { id: '3', label: 'Foresight Trend Engine', group: 'intelligence', x: 450, y: 100, size: 15, summary: 'Main analytics driver executing linear projection logic loops to map market forecasts.' },
    { id: '4', label: 'Cognitive Workspace Log', group: 'memory', x: 150, y: 320, size: 8, summary: 'Continuous document cache summarizing PDF, DOCX, and text assets ingested by operators.' },
    { id: '5', label: 'Executive Threat Matrix', group: 'security', x: 550, y: 280, size: 11, summary: 'High-level predictive dashboard highlighting security exploits, compliance anomalies, and model costs.' },
    { id: '6', label: 'Macro Workflow Trigger', group: 'analytic', x: 280, y: 380, size: 13, summary: 'Dynamic automated scheduler running task arrays based on external event changes or hourly clocks.' }
  ];

  const initialEdges: Edge[] = [
    { source: '1', target: '4' },
    { source: '4', target: '2' },
    { source: '2', target: '5' },
    { source: '3', target: '5' },
    { source: '3', target: '6' },
    { source: '6', target: '1' }
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });

  // Custom Physics Physics Node constellations run
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 420);

    // Dynamic resize
    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 700;
      height = canvas.height = 420;
    };
    window.addEventListener('resize', handleResize);

    // Active Node physics loops
    let activeNodes = [...nodes];
    const runConstellation = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle orbital grid background
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 220, 0, Math.PI * 2);
      ctx.stroke();

      // Mouse interactive absolute gravity pull calculations
      const mouse = mouseRef.current;
      activeNodes.forEach(node => {
        // Natural slight float state drift
        node.x += Math.sin(Date.now() * 0.0015 + parseFloat(node.id)) * 0.12;
        node.y += Math.cos(Date.now() * 0.001 + parseFloat(node.id)) * 0.12;

        if (mouse.isHovering) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            // Magnetic pull
            const strength = (180 - dist) * 0.015;
            node.x += (dx / dist) * strength;
            node.y += (dy / dist) * strength;
          }
        }

        // Bound nodes to screen size
        if (node.x < 40) node.x = 40;
        if (node.x > width - 40) node.x = width - 40;
        if (node.y < 40) node.y = 40;
        if (node.y > height - 40) node.y = height - 40;
      });

      // Draw Connection lines (Edges)
      ctx.lineWidth = 1.2;
      initialEdges.forEach(edge => {
        const fromNode = activeNodes.find(n => n.id === edge.source);
        const toNode = activeNodes.find(n => n.id === edge.target);

        if (fromNode && toNode) {
          const isHighlighted = (selectedNode?.id === fromNode.id || selectedNode?.id === toNode.id);
          const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
          gradient.addColorStop(0, isHighlighted ? 'rgba(6, 182, 212, 0.8)' : 'rgba(139, 92, 246, 0.2)');
          gradient.addColorStop(1, isHighlighted ? 'rgba(168, 85, 247, 0.8)' : 'rgba(139, 92, 246, 0.1)');

          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Draw Nodes (glowing spheres)
      activeNodes.forEach(node => {
        const textMatch = filter ? node.label.toLowerCase().includes(filter.toLowerCase()) : true;

        ctx.shadowBlur = selectedNode?.id === node.id ? 20 : 8;
        ctx.shadowColor = node.group === 'security' ? '#EF4444' :
                          node.group === 'intelligence' ? '#06B6D4' : '#8B5CF6';

        ctx.fillStyle = node.group === 'security' ? 'rgba(239, 68, 68, 0.85)' :
                        node.group === 'intelligence' ? 'rgba(6, 182, 212, 0.85)' : 'rgba(139, 92, 246, 0.85)';

        if (!textMatch) {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.2)';
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (selectedNode?.id === node.id ? 3 : 0), 0, Math.PI * 2);
        ctx.fill();

        // Draw Node labels text
        ctx.shadowBlur = 0;
        ctx.fillStyle = textMatch ? '#f8fafc' : 'rgba(71, 85, 105, 0.4)';
        ctx.font = `500 ${selectedNode?.id === node.id ? '11px' : '10px'} var(--font-mono)`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.size - 6);
      });

      animId = requestAnimationFrame(runConstellation);
    };

    runConstellation();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [nodes, selectedNode, filter]);

  // Handle click on canvas to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Detect closest node
    let matched: Node | null = null;
    nodes.forEach(node => {
      const dist = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
      if (dist < node.size + 15) {
        matched = node;
      }
    });

    setSelectedNode(matched);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isHovering = false;
  };

  const regenerateCortexMemory = () => {
    // Re-jigger node positions for premium interaction
    setNodes(prev => prev.map(n => ({
      ...n,
      x: 80 + Math.random() * 400,
      y: 80 + Math.random() * 260
    })));
    setSelectedNode(null);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="knowledge-cortex-module">
      {/* Interactive Graph Box */}
      <div className="flex-[2] glass-panel rounded-2xl p-5 flex flex-col justify-between overflow-hidden relative min-h-[460px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
                <Network className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Spatially Dynamic Knowledge Cortex</h3>
                <p className="text-[11px] text-slate-400">Memory node network mapping semantic and structural weights</p>
              </div>
            </div>

            {/* Semantic Search node */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter semantic links..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Neural constellation Canvas workspace */}
        <div className="flex-1 w-full bg-slate-950/30 rounded-xl border border-slate-900 overflow-hidden relative my-4">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full block h-[420px] cursor-crosshair"
          />
          <div className="absolute bottom-3 left-3 flex gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span> MEMORY_ENTITY</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span> INTELLIGENCE_ENTITY</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping"></span> SECURITY_ANOMALY</span>
          </div>

          <button 
            onClick={regenerateCortexMemory}
            className="absolute bottom-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-md text-slate-400 hover:text-white transition-colors"
            title="Spatially destabilize node anchors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Space Navigation enabled. Move mouse to trigger gravitational vortex pulls on cortex anchors.
        </div>
      </div>

      {/* Selected Node Briefing Detail Panel */}
      <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col justify-between max-h-[550px] overflow-y-auto">
        <div className="space-y-4">
          <h3 className="text-sm font-display font-semibold text-white tracking-wide border-b border-indigo-500/10 pb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Cognitive Entity Briefing
          </h3>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-display font-medium text-white">{selectedNode.label}</span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20 text-cyan-300">
                      {selectedNode.group}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">UID_HASH: SHA_WEIGHT_CLUST_{selectedNode.id}</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3">
                  <p className="text-xs leading-relaxed text-slate-300 font-sans">{selectedNode.summary}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-indigo-400">Associated Memory Interlinks</span>
                  <div className="grid grid-cols-1 gap-2">
                    {initialEdges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge, idx) => {
                        const linkedId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const linkedNode = initialNodes.find(n => n.id === linkedId);
                        return linkedNode ? (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedNode(linkedNode)}
                            className="text-xs bg-slate-900 hover:bg-slate-800 p-2.5 rounded-lg border border-slate-850 hover:border-indigo-500/20 transition-all cursor-pointer flex items-center justify-between"
                          >
                            <span className="text-slate-300 font-display font-medium">{linkedNode.label}</span>
                            <span className="text-[9px] font-mono text-cyan-400">LINKED_ENTITY</span>
                          </div>
                        ) : null;
                      })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-24 text-center text-slate-600 space-y-2 font-sans">
                <Network className="w-10 h-10 mx-auto text-slate-800 animate-pulse" />
                <p className="text-xs text-slate-500">No active context entity. Click any neural constellation node on the left to extract diagnostic weights.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
