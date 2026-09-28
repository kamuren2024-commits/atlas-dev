import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Play, Square, Cpu, Terminal, Trash2, 
  Settings, Users, Activity, Layers
} from 'lucide-react';
import { processAIRequest } from '../utils/ai';

interface Agent {
  id: string;
  name: string;
  type: 'Research' | 'Analysis' | 'Coding' | 'Planning' | 'Review';
  directive: string;
  status: 'idle' | 'executing' | 'completed';
  logs: string[];
}

export default function AgentStudio() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'ag-1',
      name: 'Cybernetic Researcher Alpha',
      type: 'Research',
      directive: 'Ingest raw academic logs and identify 2026 cognitive threat indices.',
      status: 'idle',
      logs: []
    },
    {
      id: 'ag-2',
      name: 'Codex Optimizer Omega',
      type: 'Coding',
      directive: 'Analyze workspace latency matrices and bundle esbuild modules on demand.',
      status: 'idle',
      logs: []
    }
  ]);

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState<Agent['type']>('Research');
  const [newAgentDirective, setNewAgentDirective] = useState('');
  const [activeConsoleAgentId, setActiveConsoleAgentId] = useState<string>('ag-1');

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Scroll active logs console automatically
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agents]);

  const handleCreateAgent = () => {
    if (!newAgentName.trim() || !newAgentDirective.trim()) return;
    const newAg: Agent = {
      id: `ag-${Date.now()}`,
      name: newAgentName,
      type: newAgentType,
      directive: newAgentDirective,
      status: 'idle',
      logs: []
    };
    setAgents(prev => [...prev, newAg]);
    setActiveConsoleAgentId(newAg.id);
    setNewAgentName('');
    setNewAgentDirective('');
  };

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    if (activeConsoleAgentId === id) {
      setActiveConsoleAgentId(agents[0]?.id || '');
    }
  };

  const handleRunAgent = async (id: string) => {
    const target = agents.find(a => a.id === id);
    if (!target) return;

    // Set executing state
    setAgents(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'executing',
      logs: [`[INITIALIZE] Launching sandboxed sub-container execution context...`, `[DIRECTIVE CORE] Syncing priorities: "${target.directive}"`]
    } : a));

    // Stagger fake loading step entries
    const simulatedSteps = [
      `[NODE CACHE] Instantiating isolated model runner...`,
      `[ORCHESTRATOR] Selected model group: Gemini-3.5-Flash (Latency: 110ms, Cost: Optimized)`,
      `[PROCESSING PATH] Querying related long-term contexts from Knowledge Cortex...`,
      `[VALIDATING MODULE] Synthesizing structural logic chains in sandboxed memory environment...`
    ];

    for (let i = 0; i < simulatedSteps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setAgents(prev => prev.map(a => a.id === id ? {
        ...a,
        logs: [...a.logs, simulatedSteps[i]]
      } : a));
    }

    // Call server logic to enrich final results
    const response = await processAIRequest({
      module: 'agent',
      prompt: target.directive,
      systemInstruction: "You are an AI Agent simulator executing structural workflows. Summarize the completed action output concisely."
    });

    setAgents(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'completed',
      logs: [...a.logs, `[VIRTUAL RUN COMPLETE] Success telemetry received. Output logged below:`, response.text, `[CONSOLIDATE] Flushing transaction buffer. Agent returned to active standby.`]
    } : a));
  };

  const handleStopAgent = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'idle',
      logs: [...a.logs, `[TERMINATION COMMAND] Process aborted by User Operator. Context flushed.`]
    } : a));
  };

  const activeAgent = agents.find(a => a.id === activeConsoleAgentId);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="agent-studio-module">
      {/* Left panel Config Form & Agents List */}
      <div className="flex-1 space-y-6 max-h-[750px] overflow-y-auto">
        {/* Create Card Form */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-indigo-500/10 pb-3">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-display font-semibold text-white">Synthesize Intelligence Agent</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300 uppercase">Agent Identifier</label>
              <input
                type="text"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="e.g. Audit Analyst Gamma"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-lg py-2 text-xs text-white focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300 uppercase">Specialization Class</label>
              <select
                value={newAgentType}
                onChange={(e) => setNewAgentType(e.target.value as any)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-2 px-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="Research">Research Assistant</option>
                <option value="Coding">Coding Core Optimizer</option>
                <option value="Planning">Macro Planner</option>
                <option value="Review">Validation Auditor</option>
                <option value="Analysis">Divergent Analyst</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-indigo-300 uppercase">Core Directive Prompt</label>
            <textarea
              value={newAgentDirective}
              onChange={(e) => setNewAgentDirective(e.target.value)}
              placeholder="Inject core behavior objectives, security boundaries, and telemetry requirements..."
              rows={2}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            onClick={handleCreateAgent}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Synthesize Agent Node
          </button>
        </div>

        {/* Instantiated Agent list */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Allocated Agent Structures
            </h3>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/25 px-2 py-0.5 rounded">
              {agents.length} ACTIVE CORES
            </span>
          </div>

          <div className="space-y-3">
            {agents.map((ag) => (
              <div
                key={ag.id}
                onClick={() => setActiveConsoleAgentId(ag.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeConsoleAgentId === ag.id 
                    ? 'bg-indigo-950/40 border-indigo-500/40 shadow-sm' 
                    : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-medium text-white truncate">{ag.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-purple-400 border border-slate-800 uppercase">
                        {ag.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans truncate">{ag.directive}</p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    {ag.status === 'executing' ? (
                      <button
                        onClick={() => handleStopAgent(ag.id)}
                        className="p-1.5 bg-pink-950/40 hover:bg-pink-900/40 text-pink-400 border border-pink-500/20 rounded-lg transition-colors"
                        title="Force Abort Process"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRunAgent(ag.id)}
                        className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors animate-pulse"
                        title="Allocate Sandbox memory and execute"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteAgent(ag.id)}
                      className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-pink-400 rounded-lg transition-colors"
                      title="Decommission Agent Frame"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" /> STATUS: 
                    <strong className={
                      ag.status === 'executing' ? 'text-cyan-400 animate-pulse' :
                      ag.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'
                    }>
                      {ag.status.toUpperCase()}
                    </strong>
                  </span>
                  {ag.status === 'executing' && (
                    <span className="text-cyan-400 animate-pulse">MATRIX_ACTIVE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel Terminal-like Active Logs Console */}
      <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col justify-between max-h-[750px] overflow-hidden">
        <div className="space-y-3 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 shrink-0">
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" /> Virtual Terminal Log console
            </h3>
            {activeAgent && (
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                ATTACHED: {activeAgent.name.toUpperCase()}
              </span>
            )}
          </div>

          {/* Scrolling output list */}
          <div className="flex-1 bg-slate-950/90 border border-slate-900 rounded-xl p-4 overflow-y-auto space-y-2.5 font-mono text-xs text-slate-300">
            {activeAgent && activeAgent.logs.length > 0 ? (
              <div className="space-y-2 pb-4">
                {activeAgent.logs.map((logLine, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {/* Colour markers of different logging formats */}
                    {logLine.startsWith('[') ? (
                      <span className="text-cyan-400 font-semibold">{logLine.slice(0, logLine.indexOf(']') + 1)}</span>
                    ) : null}
                    <span>
                      {logLine.startsWith('[') ? logLine.slice(logLine.indexOf(']') + 1) : logLine}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-600">
                <Terminal className="w-8 h-8 text-slate-800 animate-pulse" />
                <p className="text-[11px]">System console is idle.</p>
                {activeAgent && (
                  <button 
                    onClick={() => handleRunAgent(activeAgent.id)}
                    className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider"
                  >
                    Initialize {activeAgent.type} Execution
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-indigo-500/10 h-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SANDBOX STATUS: HEALTHY</span>
            </div>
            <span>PORT_INGRESS_SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
