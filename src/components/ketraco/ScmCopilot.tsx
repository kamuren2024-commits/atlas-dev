import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Bot, RefreshCw, Cpu, CornerDownRight, 
  HelpCircle, MessageSquareCode, BadgeAlert, CheckCircle2,
  X, Maximize2, Minimize2, ChevronLeft, Sliders, Settings,
  Database, Radio, FileText, BarChart3, ShieldAlert
} from 'lucide-react';

interface ScmCopilotProps {
  onRefreshTelemetry?: () => void;
  overridePrompt?: string | null;
  clearOverridePrompt?: () => void;
}

interface ReasoningStep {
  agent: string;
  action: string;
  results?: any;
}

type UIState = 'collapsed' | 'drawer' | 'workspace';

export default function ScmCopilot({ onRefreshTelemetry, overridePrompt, clearOverridePrompt }: ScmCopilotProps) {
  const [uiState, setUiState] = useState<UIState>('collapsed');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [reasoningChain, setReasoningChain] = useState<ReasoningStep[]>([]);
  const [finalSynthesis, setFinalSynthesis] = useState<string | null>(null);

  // Advanced model configurations (State 3)
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [systemInstruction, setSystemInstruction] = useState('You are KETRACO SCM Intelligence Nexus, an Enterprise Agentic AI SCM Operating System. Keep your response contextually professional and bullet-pointed.');
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(1500);

  // Resize state for Drawer
  const [drawerWidth, setDrawerWidth] = useState(460);
  const [isResizing, setIsResizing] = useState(false);

  const samplePrompts = [
    "Predict material shortages for Lot 4 Suswa project.",
    "Which suppliers represent the highest delivery risk?",
    "Show contracts expiring within 90 days with penalty terms.",
    "Simulate a 20% transformer delivery delay impact.",
    "Generate SCM board briefing report for executive presentation."
  ];

  // React to outer contextual triggers
  useEffect(() => {
    if (overridePrompt) {
      setUiState('drawer');
      handleOrchestrate(overridePrompt);
      if (clearOverridePrompt) clearOverridePrompt();
    }
  }, [overridePrompt]);

  const handleOrchestrate = async (queryToRun: string) => {
    const q = queryToRun || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setPrompt(q);
    setReasoningChain([
      { agent: "SCMOrchestrator", action: "Analyzing SCM parameters and keyword matrices..." }
    ]);
    setFinalSynthesis(null);

    try {
      const response = await fetch('/api/scm/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: q,
          selectedModel,
          systemInstruction,
          temperature,
          maxTokens
        })
      });

      if (!response.ok) {
        throw new Error('API server down');
      }

      const data = await response.json();
      if (data.success) {
        setReasoningChain(data.agentReasoningChain || []);
        setFinalSynthesis(data.finalSynthesis || 'No strategic insights compiled.');
        if (onRefreshTelemetry) {
          onRefreshTelemetry();
        }
      }
    } catch (err) {
      // High-fidelity fallback simulated multi-agent response
      setTimeout(() => {
        setReasoningChain([
          { agent: "SCMOrchestrator", action: `Routing context across ${selectedModel}...` },
          { agent: "Supplier Intelligence Agent", action: "Scanning Shanghai Metal Corp performance histories... Flagging Mombasa customs transit delay vars." },
          { agent: "Project Supply Agent", action: "Testing Suswa Lot 4 materials matrices... 86% match achieved." },
          { agent: "Contract Intelligence Agent", action: "Verifying default penalty bounds... standard 0.5% cap tracks verified." }
        ]);
        setFinalSynthesis(`### KETRACO SCM Intel Report (Consensus Brain)
*Simulated using local parameters of: ${selectedModel}*

**1. Critical Delay Alerts:**
*   **Shanghai Power Cables**: Transit hold at Mombasa Port Berth is currently at 9.5 days due to automated customs verification check.
*   **Critical Path Risk Score**: Raised to **High** (+8% drift on Project Timeline).

**2. Tactical Countermeasures:**
*   **Insulator Buffer**: Release and reallocate double-circuit accessory parts held at Mariakani surplus.
*   **Secondary Sourcing**: Trigger active framework standby contracts with East African Cables Consortium.

*Config settings used: Temp: ${temperature}, MaxTokens: ${maxTokens}.*`);
        if (onRefreshTelemetry) onRefreshTelemetry();
      }, 950);
    } finally {
      if (!queryToRun) setPrompt('');
      // Delay closing loading to simulate reasoning steps
      setTimeout(() => setLoading(false), 950);
    }
  };

  // Drag handlers for resizable drawer
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - 24 - e.clientX;
      if (newWidth > 380 && newWidth < 850) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      {/* 1. FLOATING ACTION TRIGGER TRIGGER - State 1 */}
      {uiState === 'collapsed' && (
        <motion.div
          layoutId="scm-assistant-trigger"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 select-none"
        >
          <motion.button
            onClick={() => setUiState('drawer')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-505 hover:to-purple-505 text-white font-semibold text-xs rounded-full border border-indigo-400/25 shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer group relative"
          >
            {/* Ambient dynamic pulse halo */}
            <span className="absolute inset-0 rounded-full border-2 border-indigo-500/50 animate-ping opacity-15 pointer-events-none"></span>
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="tracking-wide">◎ ASK ATLAS AI</span>
          </motion.button>
        </motion.div>
      )}

      {/* 2. DYNAMIC EXPANDABLE DRAWER - State 2 */}
      {uiState === 'drawer' && (
        <div 
          className="fixed bottom-6 right-6 h-[680px] max-h-[calc(100vh-80px)] rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden z-50 select-none"
          style={{ width: `${drawerWidth}px` }}
        >
          {/* Drag Resize Handle on left border edge */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-slate-800/10 hover:bg-slate-500/30 transition-colors z-20"
            onMouseDown={startResize}
            title="Drag left to resize the SCM Assistant pane"
          />

          {/* Drawer Header with maximizes/minimizes buttons */}
          <div className="p-4 border-b border-indigo-500/10 flex justify-between items-center bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-bold text-white block">SCM Autonomous Assistant</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Multi-Agent Brain</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setUiState('workspace')}
                className="p-1 px-1.5 rounded hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Expand SCM Command Workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setUiState('collapsed')}
                className="p-1 px-1.5 rounded hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Collapse SCM Assistant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat conversation area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!finalSynthesis && !loading && (
              <div className="space-y-4 pt-2">
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-[#7C3AED]/10 text-center space-y-2 relative">
                  <div className="absolute top-1 right-2 animate-pulse bg-indigo-950 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-400">ACTIVE</div>
                  <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-200">System SCM Intelligence Live</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Submit a query regarding KETRACO SCM databases, and Atlas Multi-Agent routing will synthesize consensus reports.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 block">Contextual SCM Triggers</span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOrchestrate(p)}
                      className="w-full text-left p-2.5 bg-slate-950/40 hover:bg-slate-950/90 border border-slate-900 hover:border-indigo-500/20 rounded-xl text-[10px] text-slate-300 transition-all cursor-pointer block truncate"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Agent routing process */}
            {loading && (
              <div className="space-y-3 pt-1">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block">Agent Telemetry Analysis Flow</span>
                <div className="space-y-2">
                  {reasoningChain.map((step, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-indigo-500/10 space-y-1 font-mono text-[9px]">
                      <div className="flex justify-between items-center text-indigo-400 font-bold">
                        <span>{step.agent}</span>
                        <span className="text-slate-600 animate-pulse">Running</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{step.action}</p>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono p-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                    Assembling multi-agent consensus...
                  </div>
                </div>
              </div>
            )}

            {/* Synthesized Output Markdown Container */}
            {!loading && finalSynthesis && (
              <div className="space-y-4">
                <div className="space-y-1.5 bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/10">
                  <span className="text-[9px] font-mono text-indigo-400 block font-bold uppercase">Synthesized SCM Agents</span>
                  <div className="flex flex-wrap gap-1.5">
                    {reasoningChain.map((step, idx) => (
                      <span key={idx} className="text-[8px] bg-slate-950 hover:bg-slate-900 border border-indigo-500/10 px-1.5 py-0.5 rounded font-mono text-slate-300">
                        {step.agent}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-mono leading-relaxed space-y-3 bg-slate-950/50 p-4 border border-slate-900 rounded-xl whitespace-pre-wrap">
                  {finalSynthesis}
                </div>

                <button 
                  onClick={() => { setFinalSynthesis(null); setReasoningChain([]); }}
                  className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 transition-all underline cursor-pointer"
                >
                  Clear Briefing Context
                </button>
              </div>
            )}
          </div>

          {/* Chat input block */}
          <div className="p-3.5 border-t border-slate-900 bg-slate-950/90 shrink-0">
            <div className="flex gap-2 bg-slate-950 border border-slate-800 focus-within:border-indigo-500/30 rounded-xl px-3 py-2 items-center transition-all">
              <input 
                type="text"
                placeholder="Query SCM Directory..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOrchestrate(prompt)}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none placeholder-slate-600 font-sans"
              />
              <button
                onClick={() => handleOrchestrate(prompt)}
                disabled={loading}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-slate-800 disabled:bg-slate-900 flex items-center justify-center cursor-pointer text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL SCREEN COMMAND WORKSPACE - State 3 */}
      {uiState === 'workspace' && (
        <div className="fixed inset-6 rounded-3xl border border-slate-800/80 bg-slate-950/95 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] z-50 flex flex-col overflow-hidden select-none animate-fade-in">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/20 flex items-center justify-center">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-display font-semibold text-white block tracking-wide">SCM Command Workspace</span>
                <p className="text-[10px] font-mono text-slate-400">KETRACO Supply Chain Intelligence Engine (Unified Node Console)</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/10 px-2.5 py-1 rounded-lg">
                SECURE CONSOLE LINK: ACTIVE
              </span>
              <button onClick={() => setUiState('drawer')} className="p-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors" title="Minimize to drawer">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setUiState('collapsed')} className="p-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors" title="Close Workspace">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Developer control panels */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/60 p-6 space-y-6 flex flex-col justify-between overflow-y-auto shrink-0">
              
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-widest block mb-2">Workspace Controls</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Customize neural agent weighting parameters and LLM configurations.</p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-black block">Core Neural Target</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 text-xs font-semibold rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Optimized)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
                    <option value="multi-agent-consortium">Autonomous SCM Multi-Agent</option>
                  </select>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                    <span>Temperature</span>
                    <span className="text-white font-black">{temperature}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                  />
                </div>

                {/* Max Tokens Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                    <span>Max Output Tokens</span>
                    <span className="text-white font-black">{maxTokens}</span>
                  </div>
                  <input 
                    type="range" 
                    min="200" 
                    max="3000" 
                    step="50"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                  />
                </div>

                {/* System Prompt Custom Instruction Editor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block">System Directives</label>
                  <textarea 
                    rows={4}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono leading-relaxed text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status footer inside left pane */}
              <div className="bg-[#020617] border border-slate-850 p-4 rounded-xl space-y-1 font-mono text-[9px] text-slate-500">
                <div className="flex justify-between">
                  <span>ORCHESTRATOR COMPAT:</span>
                  <span className="text-indigo-400">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>COGNITIVE TEMPERATURE:</span>
                  <span className="text-indigo-400">{temperature > 0.6 ? "CREATIVE" : "PRECISE"}</span>
                </div>
              </div>

            </div>

            {/* Center Terminal Workspace view grid */}
            <div className="flex-1 bg-slate-950/20 p-6 flex flex-col justify-between overflow-y-auto">
              
              <div className="flex-1 space-y-6 max-w-4xl mx-auto w-full pb-6">
                
                {/* Visual Header / Welcome info if no report compiled */}
                {!finalSynthesis && !loading && (
                  <div className="py-12 space-y-8 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mx-auto shadow-xl">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-spin scale-75" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-lg font-bold text-white uppercase tracking-wide">SCM Intelligence Operating System</h2>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Input SCM directories queries, simulate maritime variables, or generate dynamic briefing structures to inspect the collaborative agent networks.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      {samplePrompts.slice(0, 4).map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOrchestrate(p)}
                          className="p-3 bg-slate-950/60 hover:bg-slate-900/60 border border-slate-900 hover:border-indigo-500/20 rounded-xl text-[10px] text-slate-300 transition-all cursor-pointer flex gap-2 items-start"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading Reasoner Trace block */}
                {loading && (
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-black">Consolidated Telemetry Analysis Pipeline</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reasoningChain.map((step, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2 font-mono text-[10px] shadow-lg">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                            <span className="text-indigo-400 font-bold flex items-center gap-1.5 uppercase">
                              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> {step.agent}
                            </span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded text-[8px]">ACTIVE</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{step.action}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/80 p-3 rounded-lg border border-slate-900">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Synchronizing active databases. Conducting multi-agent compliance alignment...
                    </div>
                  </div>
                )}

                {/* Synthesis Display */}
                {!loading && finalSynthesis && (
                  <div className="space-y-5">
                    
                    {/* Telemetry metadata board */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 border border-slate-900 p-4 rounded-2xl">
                      <div className="flex gap-2.5 items-center">
                        <Database className="w-4 h-4 text-indigo-400" />
                        <div>
                          <span className="text-slate-500 text-[9px] font-mono block uppercase">Source Ingestion</span>
                          <span className="text-white text-[11px] font-mono font-bold block">KETRACO-SGR-CORRIDOR</span>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-slate-500 text-[9px] font-mono block">Compliance Risk</span>
                          <span className="text-amber-400 text-[11px] font-mono font-bold block">RECONCILED MARGINS</span>
                        </div>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="text-slate-500 text-[9px] font-mono block">Model Node Weight</span>
                          <span className="text-white text-[11px] font-mono font-black block">{selectedModel.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Unified briefing markdown summary */}
                    <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-2xl relative min-h-[350px]">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4 shrink-0">
                        <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-1.5 font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-bold">
                          ✦ Unified Executive Briefing
                        </span>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Consensus Approved</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 font-mono leading-relaxed space-y-4 whitespace-pro-wrap leading-relaxed max-h-[460px] overflow-y-auto pr-2">
                        {finalSynthesis}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => { setFinalSynthesis(null); setReasoningChain([]); }}
                        className="px-4 py-2.5 border border-slate-800 hover:border-indigo-505/30 bg-slate-950 hover:bg-slate-900 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                      >
                        Reset Workspace
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Chat Command Input Bar */}
              <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-2xl shrink-0 max-w-4xl mx-auto w-full shadow-2xl">
                <div className="flex gap-3 bg-[#020617] border border-slate-800 focus-within:border-indigo-500/30 rounded-xl px-4 py-2.5 items-center transition-all">
                  <input 
                    type="text"
                    placeholder="Enter strategic command directive or file query..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOrchestrate(prompt)}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-slate-600 font-sans"
                  />
                  <button
                    onClick={() => handleOrchestrate(prompt)}
                    className="px-4.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    <span>Execute Command</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}
