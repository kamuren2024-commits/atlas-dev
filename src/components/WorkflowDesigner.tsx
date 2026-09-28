import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Plus, GitBranch, ArrowRight, Hourglass, 
  Settings, Save, Activity, Trash2, Cpu, CheckCircle2
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition';
  desc: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export default function WorkflowDesigner() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', name: 'Trigger: Compliance Breach', type: 'trigger', desc: 'Activates immediately if security metric drops below 85% basic rating.', status: 'idle' },
    { id: '2', name: 'Condition: Hour Allocation', type: 'condition', desc: 'Checks if primary executive orchestrator loops are active (> UTC-4).', status: 'idle' },
    { id: '3', name: 'Action: Synthesis Ingress', type: 'action', desc: 'Queries Gemini-3.5-Flash to summarize anomaly vector parameters.', status: 'idle' },
    { id: '4', name: 'Action: Slack Dispatch', type: 'action', desc: 'Relays direct strategic recommendations to operations rooms.', status: 'idle' }
  ]);

  const [activeRunningId, setActiveRunningId] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<WorkflowNode['type']>('action');
  const [newNodeDesc, setNewNodeDesc] = useState('');

  const runWorkflowSequence = async () => {
    setConsoleLogs([]); 
    
    // Stagger node execution simulation
    for (let i = 0; i < nodes.length; i++) {
      const activeNode = nodes[i];
      setActiveRunningId(activeNode.id);

      setNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, status: 'running' } : n));
      setConsoleLogs(prev => [...prev, `[INITIATE STEP G-0${i+1}] Processing logical block: "${activeNode.name}"...`]);
      
      await new Promise(r => setTimeout(r, 1200));

      setNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, status: 'success' } : n));
      setConsoleLogs(prev => [...prev, `[SUCCESS] Output matrix synced for block: "${activeNode.name}". Step completed normal execution.`]);
    }

    setActiveRunningId(null);
    setConsoleLogs(prev => [...prev, `[WORKFLOW LOOP TERMINAL] Automation flow reached secure resolution. Zero latency locks.`]);
  };

  const addWorkflowNode = () => {
    if (!newNodeName.trim() || !newNodeDesc.trim()) return;
    const nNode: WorkflowNode = {
      id: Date.now().toString(),
      name: newNodeName,
      type: newNodeType,
      desc: newNodeDesc,
      status: 'idle'
    };
    setNodes(prev => [...prev, nNode]);
    setNewNodeName('');
    setNewNodeDesc('');
  };

  const deleteWorkflowNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const resetNodeStatus = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    setConsoleLogs([]);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="workflow-designer-module">
      {/* Node designer field on canvas */}
      <div className="flex-[2] glass-panel rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-h-[500px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Visual Automation Studio</h3>
                <p className="text-[11px] text-slate-400">Assemble multi-stage conditional process chains & webhook streams</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runWorkflowSequence}
                disabled={activeRunningId !== null}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-xs uppercase font-medium rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Execute
              </button>
              <button
                onClick={resetNodeStatus}
                className="p-1 px-2.5 text-xs border border-slate-800 hover:bg-slate-900 rounded-lg transition-colors text-slate-400"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Nodes lists with animated visual connecting flow lines */}
        <div className="flex-1 my-6 space-y-4 relative w-full flex flex-col items-center py-4 bg-slate-950/20 rounded-xl border border-slate-900 overflow-y-auto max-h-[460px]">
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {/* Connector line between cards */}
              {i > 0 && (
                <div className="flex justify-center items-center h-8 shrink-0 relative">
                  <div className="w-[1.5px] h-full bg-slate-800"></div>
                  {activeRunningId === nodes[i-1].id && (
                    <div className="absolute top-0 w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                  )}
                </div>
              )}

              {/* Node Card Component */}
              <div className={`w-11/12 max-w-lg p-4 rounded-xl border relative transition-all ${
                node.status === 'running' ? 'bg-indigo-950/50 border-indigo-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]' :
                node.status === 'success' ? 'bg-emerald-950/30 border-emerald-500/30' :
                'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                {/* Node header type block */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                    node.type === 'trigger' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/20' :
                    node.type === 'condition' ? 'bg-pink-950 text-pink-300 border-pink-500/20' :
                    'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    {node.type}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Execution check markers */}
                    {node.status === 'running' && (
                      <span className="text-[10px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                        <Cpu className="w-3 h-3 animate-spin" /> EXECUTING
                      </span>
                    )}
                    {node.status === 'success' && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SYNCED
                      </span>
                    )}
                    <button 
                      onClick={() => deleteWorkflowNode(node.id)}
                      className="text-slate-500 hover:text-pink-400 transition-colors p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-display font-semibold text-white">{node.name}</h4>
                <p className="text-[11px] leading-relaxed text-slate-400 font-sans mt-1">{node.desc}</p>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="text-[9px] font-mono text-slate-500 uppercase">
          PROCESS ENGINE: CENTRAL EXECUTIONS SYNCHRONIZED ACROSS WORKSPACES
        </div>
      </div>

      {/* Adding Module Step Form & Live Terminal Console */}
      <div className="flex-1 space-y-6 max-h-[660px] overflow-y-auto">
        {/* Simple Step creator */}
        <div className="glass-panel p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-3 border-b border-indigo-500/10 pb-3">
            <Plus className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-display font-semibold text-white">Inject Node Block</h4>
          </div>

          <div className="space-y-3 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300">BLOCK TITLE</label>
              <input
                type="text"
                placeholder="e.g. Action: Email Alert Log"
                value={newNodeName}
                onChange={e => setNewNodeName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500/50 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300 block">LOGICAL STAGE TYPE</label>
              <select
                value={newNodeType}
                onChange={e => setNewNodeType(e.target.value as any)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2 px-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="action">Action Node (Gemini/Webhook)</option>
                <option value="condition">Condition Branch Evaluator</option>
                <option value="trigger">Trigger Event Sensor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300">BLOCK DESCRIPTION</label>
              <textarea
                placeholder="Explain what parameters are manipulated during this step..."
                value={newNodeDesc}
                onChange={e => setNewNodeDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500/50 text-white"
              />
            </div>

            <button
              onClick={addWorkflowNode}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase py-2 rounded-lg font-semibold"
            >
              Append Block
            </button>
          </div>
        </div>

        {/* Live Step logger */}
        <div className="glass-panel p-5 rounded-2xl space-y-3.5">
          <h4 className="text-sm font-display font-semibold text-white tracking-wide border-b border-indigo-500/10 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Action Execution Logs
          </h4>

          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 h-48 overflow-y-auto space-y-2 font-mono text-[10px] text-slate-400">
            {consoleLogs.length > 0 ? (
              consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log.startsWith('[SUCCESS]') && <span className="text-emerald-400 font-semibold">{log.slice(0, 9)}</span>}
                  {log.startsWith('[INITIATE') && <span className="text-cyan-400 font-semibold">{log.slice(0, 16)}</span>}
                  <span>
                    {log.startsWith('[SUCCESS]') ? log.slice(9) :
                     log.startsWith('[INITIATE') ? log.slice(16) : log}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                <GitBranch className="w-8 h-8 text-slate-800 animate-pulse mb-1" />
                <p>Execution console idle.</p>
                <p>Initialize trigger routing to read telemetry lines.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
