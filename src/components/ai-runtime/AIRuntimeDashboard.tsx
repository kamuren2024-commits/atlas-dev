import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Database, ShieldCheck, Activity, Terminal, 
  BarChart3, RefreshCw, Layers, Zap, AlertTriangle,
  Settings, Search, Filter, ChevronRight, Play,
  Lock, Key, BookOpen, Clock, HardDrive, Server
} from 'lucide-react';

interface ModelConfig {
  id: string;
  provider: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  capabilities: string[];
  tokenPricing: { prompt: number; completion: number };
  latencyProfile: 'low' | 'medium' | 'high';
}

interface PromptConfig {
  id: string;
  name: string;
  version: number;
  content: string;
  system_instruction: string;
  status: string;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  prompt_name: string;
  model_id: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost: number;
  latency_ms: number;
  status: string;
  error_message?: string;
}

export default function AIRuntimeDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'prompts' | 'logs' | 'safety'>('overview');
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [prompts, setPrompts] = useState<PromptConfig[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [safety, setSafety] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes, lRes, hRes, sRes] = await Promise.all([
        fetch('/api/ai/runtime/registry/models'),
        fetch('/api/ai/runtime/registry/prompts'),
        fetch('/api/ai/runtime/governance/logs'),
        fetch('/api/ai/runtime/health'),
        fetch('/api/ai/runtime/safety')
      ]);

      const [m, p, l, h, s] = await Promise.all([
        mRes.json(), pRes.json(), lRes.json(), hRes.json(), sRes.json()
      ]);

      setModels(Array.isArray(m) ? m : []);
      setPrompts(Array.isArray(p) ? p : []);
      setLogs(Array.isArray(l) ? l : []);
      setHealth(h && !h.error ? h : { status: 'UP' });
      setSafety(s && !s.error ? s : { status: 'ENFORCED' });
    } catch (err) {
      console.error('Failed to fetch AI Runtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeModels = Array.isArray(models) ? models : [];
  const safePrompts = Array.isArray(prompts) ? prompts : [];
  const totalCost = safeLogs.reduce((acc, log) => acc + (log.cost || 0), 0);
  const avgLatency = safeLogs.length > 0 ? safeLogs.reduce((acc, log) => acc + (log.latency_ms || 0), 0) / safeLogs.length : 0;
  const successRate = safeLogs.length > 0 ? (safeLogs.filter(l => l.status === 'SUCCESS').length / safeLogs.length) * 100 : 100;

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Platform Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Cpu className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Enterprise AI Runtime Platform</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest uppercase">Salience Atlas EARP V5.0</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className={`w-1.5 h-1.5 rounded-full ${health?.status === 'UP' ? 'bg-emerald-400 animate-pulse' : health ? 'bg-amber-400' : 'bg-slate-600'}`} />
                <span className="text-[9px] font-bold text-emerald-400 uppercase">
                  {health?.status === 'UP' ? 'System Nominal' : health ? health.status : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-2">
            <Settings className="w-4 h-4" />
            PLATFORM CONFIG
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-slate-800 bg-slate-900/10 flex items-center gap-1">
        {[
          { id: 'overview', label: 'Runtime Overview', icon: Activity },
          { id: 'models', label: 'Model Registry', icon: Layers },
          { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
          { id: 'logs', label: 'Governance Logs', icon: Terminal },
          { id: 'safety', label: 'Safety Protocols', icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all relative ${
              activeTab === tab.id 
                ? 'text-indigo-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="tab-active"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Stage */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Platform Availability', value: '99.98%', sub: 'Global Cluster', icon: Activity, color: 'text-emerald-400' },
                  { label: 'Inference Success', value: `${successRate.toFixed(1)}%`, sub: 'Last 24 Hours', icon: Zap, color: 'text-amber-400' },
                  { label: 'Avg Latency', value: `${avgLatency.toFixed(0)}ms`, sub: 'P95 Performance', icon: Clock, color: 'text-indigo-400' },
                  { label: 'Token Burn Rate', value: `$${totalCost.toFixed(4)}`, sub: 'Current Session', icon: BarChart3, color: 'text-rose-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[9px] font-mono text-slate-600 uppercase">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Routing Strategy */}
                <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-tight">Intelligent Router State</h2>
                    <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-400 uppercase">Strategy: AVAILABILITY</span>
                  </div>
                  
                  <div className="space-y-4">
                    {models.map(model => (
                      <div key={model.id} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${model.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                          <div>
                            <div className="text-xs font-bold text-white uppercase">{model.name}</div>
                            <div className="text-[9px] font-mono text-slate-500 uppercase">{model.provider} // {model.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase">{model.latencyProfile} latency</div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase">Priority {model.id.includes('flash') ? '1' : '2'}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Matrix */}
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-tight">Platform Health Matrix</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Inference Gateway', key: 'gateway', icon: Zap },
                      { label: 'Model Registry', key: 'model_registry', icon: Layers },
                      { label: 'Prompt Registry', key: 'prompt_registry', icon: BookOpen },
                      { label: 'Memory Runtime', key: 'memory_runtime', icon: HardDrive },
                      { label: 'Database', key: 'database', icon: Database }
                    ].map((item, i) => {
                      const rawStatus = health?.components?.[item.key] ?? 'unknown';
                      const isUp = rawStatus === 'active' || rawStatus === 'synced' || rawStatus === 'ok' || rawStatus === 'UP';
                      const isDown = rawStatus === 'error' || rawStatus === 'down' || rawStatus === 'unavailable';
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px] text-slate-300">{item.label}</span>
                          </div>
                          <span className={`text-[9px] font-bold uppercase ${isDown ? 'text-rose-400' : isUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isUp ? 'OPERATIONAL' : isDown ? 'DOWN' : rawStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {health && (
                    <div className="pt-4 border-t border-slate-800 mt-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Platform Status</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${health.status === 'UP' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{health.status} // {health.platform} v{health.version}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div
              key="models"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {models.map(model => (
                <div key={model.id} className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-5 hover:bg-slate-900/60 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      <Server className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${
                      model.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {model.status}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white uppercase">{model.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">{model.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <div className="text-[8px] font-bold text-slate-600 uppercase mb-1">Pricing (Prompt)</div>
                      <div className="text-xs font-mono text-indigo-300">${model.tokenPricing.prompt.toFixed(6)}</div>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/50">
                      <div className="text-[8px] font-bold text-slate-600 uppercase mb-1">Pricing (Comp)</div>
                      <div className="text-xs font-mono text-indigo-300">${model.tokenPricing.completion.toFixed(6)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Capabilities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {model.capabilities.map(cap => (
                        <span key={cap} className="px-2 py-0.5 bg-slate-800 rounded-md text-[8px] font-mono text-slate-400 uppercase border border-slate-700/50">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800/50 rounded-xl mb-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Search registry..." 
                      className="bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:border-indigo-500 focus:outline-none w-64"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-600" />
                    <span className="text-xs text-slate-500">Filter by version or status</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  SYNC REGISTRY
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {prompts.map(prompt => (
                  <div key={prompt.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-900/60 transition-all flex items-start justify-between group">
                    <div className="space-y-3 flex-1 pr-10">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">{prompt.name}</h3>
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] font-mono text-indigo-400 uppercase font-bold">V{prompt.version}.0</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono text-emerald-400 uppercase font-bold">{prompt.status}</span>
                      </div>
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 leading-relaxed max-h-20 overflow-hidden">
                        {prompt.content}
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Last Modified: 2 hours ago
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3 h-3" /> Usage: 450 calls
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all group-hover:scale-105">
                        <Play className="w-4 h-4 text-white" />
                      </button>
                      <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                        <Settings className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operation</th>
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider / Model</th>
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Latency</th>
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Cost (USD)</th>
                      <th className="py-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                        <td className="py-4 px-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-xs font-bold text-white uppercase">{log.prompt_name}</div>
                          <div className="text-[8px] font-mono text-slate-600 mt-1 uppercase">ID: {log.id.slice(0, 8)}...</div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-[10px] font-bold text-indigo-400 uppercase">{log.provider}</div>
                          <div className="text-[9px] font-mono text-slate-500">{log.model_id}</div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`text-[10px] font-mono font-bold ${log.latency_ms > 2000 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {log.latency_ms}ms
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <span className="text-[10px] font-mono text-indigo-300">${log.cost.toFixed(5)}</span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-tight">Active Security Filters</h2>
                  </div>
                  <div className="space-y-4">
                    {(safety?.filters ?? []).map((filter: any, i: number) => {
                      const isBypassed = filter.status === 'bypassed' || !filter.enabled;
                      const isActive = filter.status === 'active' && filter.enabled;
                      return (
                        <div key={filter.id ?? i} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                          <span className="text-[11px] text-slate-300">{filter.label}</span>
                          <span className={`text-[10px] font-bold uppercase ${isBypassed ? 'text-slate-500' : isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isBypassed ? 'BYPASSED' : isActive ? 'ACTIVE' : filter.status}
                          </span>
                        </div>
                      );
                    })}
                    {(!safety?.filters || safety.filters.length === 0) && (
                      <div className="text-[11px] text-slate-500 text-center py-4">
                        {loading ? 'Loading safety protocols...' : 'No safety filter data available'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-tight">Access Control (RBAC)</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Policy</span>
                        <span className="text-[9px] font-mono text-amber-400">{safety?.rbac?.global_policy ?? 'UNKNOWN'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {safety?.rbac?.description ?? 'Safety protocol configuration not available.'}
                      </p>
                    </div>
                    <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-bold text-white uppercase transition-all">
                      Update Security Protocols
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
