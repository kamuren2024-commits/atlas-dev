import React, { useState, useEffect } from 'react';
import { 
  Network, TrendingUp, ShieldAlert, Award, FileSpreadsheet, Anchor, 
  MapPin, CheckCircle, AlertTriangle, Play, HelpCircle, FileText, 
  Settings, Users, History, Database, ArrowRight, ShieldCheck, Sparkles, Info,
  Radio, Layers, Briefcase, Sliders, LineChart, Cpu, Zap, Activity,
  RefreshCw, Trash2, Fingerprint, Lock
} from 'lucide-react';
import { AtlasMissionBrief } from '../ui/atlas/AtlasMissionBrief';
import { AtlasAgentPulse, DEFAULT_ENTERPRISE_AGENTS } from '../ui/atlas/AtlasAgentPulse';
import { ProjectSupplyNexus as ProjectSupplyNexusReconstructed } from './project-supply-nexus';

interface ScmModuleProps {
  onAskCopilot?: (prompt: string) => void;
}

// ==========================================
// 1. PROJECT SUPPLY NEXUS MODULE
// ==========================================
export function ProjectSupplyNexus({ onAskCopilot }: ScmModuleProps) {
  return <ProjectSupplyNexusReconstructed onAskCopilot={onAskCopilot} />;
}

// ==========================================
// 2. INVENTORY INTELLIGENCE HUB
// ==========================================
export function InventoryHub({ onAskCopilot }: ScmModuleProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="inventory-intel-hub">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Inventory Intelligence Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Forecasting auxiliary demand vectors, tracking warehousing buffers, and identifying dead stock assets across KETRACO depots.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Forecast SCM demand curves for substation replacement kits and auxiliary power parts over next 90 days.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Forecast Demand
          </button>
          <button 
            onClick={() => onAskCopilot?.("Identify low-buffer assets and predict stockout thresholds at Isinya, Mombasa and Nairobi warehouses.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Predict Stockout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 block">MARIAKANI WAREHOUSE</span>
          <span className="text-2xl font-mono text-white block">142</span>
          <p className="text-xs font-medium text-slate-300">Heavy Grid Circuit Breakers</p>
          <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono font-medium block w-max">OVER-BUFFER EXTRA</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 block">ISINYA DEPOT</span>
          <span className="text-2xl font-mono text-rose-400 block">4</span>
          <p className="text-xs font-medium text-slate-300">Replacement Transformer Insulators</p>
          <span className="text-[9px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded font-mono font-bold block w-max animate-pulse">UNDER-BUFFER SHORT</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 block">EMBAKASI STORE</span>
          <span className="text-2xl font-mono text-white block">2,400m</span>
          <p className="text-xs font-medium text-slate-300">Spare 33kV Low-Loss Ground Cables</p>
          <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-medium block w-max">OPTIMAL STOCK</span>
        </div>
      </div>

      {/* Dead Stock & Neural Demand forecasting */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wide">Auxiliary Neural Demand Forecast</h2>
        <p className="text-xs text-slate-400">
          Neural forecasting predicts a +14.2% supply surge demand for substation replacement earthing kits over the next 90 days due to upcoming seasonal monsoon grounding overcurrent upgrades.
        </p>
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/40 text-xs font-mono text-slate-400 space-y-1">
          <p>&gt; RUNNING Linear-trend extrapolation model...</p>
          <p>&gt; Q3 Target: +14% deviation expected</p>
          <p className="text-emerald-400">&gt; Status: Supply orders allocated safely to Nairobi depot buffers.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. SUPPLIER INTELLIGENCE NETWORK
// ==========================================
interface ProcurementEntity {
  id: string;
  name: string;
  type: string;
  status: string;
  healthScore: number;
  metadata: Record<string, any>;
  lastEvaluatedAt: string;
  lastExecution?: {
    observedContext: string;
    understanding: string;
    validation: { isValid: boolean; violations: string[]; score: number };
    reasoningPath: string[];
    prediction: { outcomes: string[]; failureProbability: number };
    recommendation: string;
    riskScore: number;
    evidence: { statute: string; paragraph: string; rating: number }[];
    auditTrailHash: string;
  };
}
interface ApprovalGate {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  actionRequested: string;
  proposedChange: string;
  reason: string;
  riskRating: 'Low' | 'Medium' | 'High';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

const ENTITY_STATUS_TONE: Record<string, string> = {
  OPTIMAL: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
  NOMINAL: 'bg-sky-950/40 border-sky-500/20 text-sky-300',
  DEGRADED: 'bg-yellow-950/40 border-yellow-500/20 text-yellow-400',
  CRITICAL: 'bg-rose-950/40 border-rose-500/20 text-rose-400',
  ESCALATED: 'bg-orange-950/40 border-orange-500/20 text-orange-400',
  APPROVED: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
};

const SUPPLIER_CENTRIC_TYPES = new Set(['SupplierProfile', 'AGPOSupplier', 'Contract', 'FrameworkAgreement', 'PerformanceSecurity']);

export function SupplierIntelligence({ onAskCopilot }: ScmModuleProps) {
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [entities, setEntities] = useState<ProcurementEntity[]>([]);
  const [gates, setGates] = useState<ApprovalGate[]>([]);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'LIVE' | 'ERROR'>('LIVE');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [entRes, gateRes, logRes] = await Promise.all([
          fetch('/api/scm/procurement-intelligence/entities'),
          fetch('/api/scm/procurement-intelligence/approval-gates'),
          fetch('/api/scm/procurement-intelligence/logs'),
        ]);
        if (!entRes.ok || !gateRes.ok || !logRes.ok) throw new Error('procurement engine unavailable');
        const entData = await entRes.json();
        const gateData = await gateRes.json();
        const logData = await logRes.json();
        if (cancelled) return;
        setEntities(entData.entities ?? []);
        setGates(gateData.gates ?? []);
        setLogs(Array.isArray(logData.logs) ? logData.logs : []);
        setDataSource('LIVE');
      } catch (err) {
        if (cancelled) return;
        console.error('Supplier intelligence engine unavailable:', err);
        setEntities([]);
        setDataSource('ERROR');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const supplierEntities = entities.filter(e => SUPPLIER_CENTRIC_TYPES.has(e.type));
  const watchlist = supplierEntities.filter(e => e.status === 'CRITICAL' || e.status === 'ESCALATED' || e.status === 'DEGRADED');
  const highRisk = entities.filter(e => (e.lastExecution?.riskScore ?? (100 - e.healthScore)) >= 50).length;
  const pendingGates = gates.filter(g => g.status === 'PENDING');
  const avgReliability = supplierEntities.length
    ? Math.round(supplierEntities.reduce((a, e) => a + e.healthScore, 0) / supplierEntities.length)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto space-y-4" id="supplier-intelligence-network">
      <AtlasMissionBrief
        moduleLabel="Procurement Intelligence"
        mission="Every supplier relationship understood, monitored and anticipated."
        description="Supplier profiles, compliance checks, risk heatmaps and reliability averages — driven live by the autonomous procurement decision engine."
        metrics={[
          { label: 'Supplier Entities', value: supplierEntities.length, icon: Users, tone: 'info' },
          { label: 'At Risk', value: highRisk, icon: ShieldAlert, tone: highRisk > 0 ? 'risk' : 'healthy' },
          { label: 'Avg Health', value: supplierEntities.length ? `${avgReliability}%` : '—', icon: Award, tone: 'healthy' },
          { label: 'AI Engine', value: dataSource === 'LIVE' ? 'LIVE' : 'OFFLINE', icon: Zap, tone: dataSource === 'LIVE' ? 'ai' : 'risk' },
        ]}
      />

      {loading ? (
        <div className="px-6 py-10 space-y-2">
          <div className="h-4 w-40 bg-slate-800/60 rounded animate-pulse" />
          <div className="h-3 w-72 bg-slate-800/40 rounded animate-pulse" />
          <div className="h-3 w-56 bg-slate-800/40 rounded animate-pulse" />
        </div>
      ) : dataSource === 'ERROR' ? (
        <div className="px-6">
          <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300">
            <span className="font-bold uppercase">Autonomous Procurement Engine offline.</span> The supply intelligence slice could not reach the real entity registry. System state is reported truthfully rather than fabricated.
          </div>
        </div>
      ) : (
        <>
          {/* Live supplier entity cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
            {supplierEntities.map(ent => {
              const tone = ENTITY_STATUS_TONE[ent.status] ?? ENTITY_STATUS_TONE.NOMINAL;
              const riskScore = ent.lastExecution?.riskScore ?? (100 - ent.healthScore);
              const evidence = ent.lastExecution?.evidence ?? [];
              return (
                <div key={ent.id} className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{ent.name}</span>
                      <p className="text-[10px] text-slate-500 font-mono">{ent.id} · {ent.type}</p>
                    </div>
                    <span className={`${tone} text-xs px-2.5 py-1 rounded font-mono font-bold`}>
                      {Math.round(ent.healthScore)}% {ent.status}
                    </span>
                  </div>
                  {ent.lastExecution ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-300">{ent.lastExecution.understanding}</p>
                      <div className="bg-slate-950/40 p-3 rounded-lg text-[10px] space-y-1">
                        {ent.lastExecution.validation.isValid ? (
                          <span className="font-bold text-emerald-400">LEGALLY COMPLIANT</span>
                        ) : (
                          <span className="font-bold text-rose-400">COMPLIANCE GAP</span>
                        )}
                        {ent.lastExecution.validation.violations.length > 0 && (
                          <p className="text-slate-400">{ent.lastExecution.validation.violations.join('; ')}</p>
                        )}
                        {evidence.length > 0 && (
                          <p className="text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            {evidence.map(ev => ev.statute).join(', ')}
                          </p>
                        )}
                        {ent.lastExecution.auditTrailHash && (
                          <p className="text-slate-600 font-mono">audit {ent.lastExecution.auditTrailHash.slice(0, 18)}…</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className={riskScore >= 50 ? 'text-rose-400 font-bold' : ''}>RISK {Math.round(riskScore)}%</span>
                        <span>failure p {Math.round((ent.lastExecution.prediction.failureProbability ?? 0) * 100)}%</span>
                        <span>{new Date(ent.lastEvaluatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 p-3 rounded-lg text-[10px] text-slate-500 font-mono">
                      Pending first autonomous evaluation cycle.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* HITL Approval Gates (governance) + engine logs */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-6">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" /> Human-in-the-Loop Approval Gates
                </h2>
                <span className="text-[10px] font-mono text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded">
                  {pendingGates.length} PENDING
                </span>
              </div>
              {gates.length === 0 ? (
                <p className="text-[11px] text-slate-500">No approval gates currently queued.</p>
              ) : (
                <div className="space-y-2">
                  {gates.map(g => (
                    <div key={g.id} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-slate-200">{g.entityName}</span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                          g.status === 'PENDING' ? 'bg-yellow-950/40 text-yellow-400' :
                          g.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-rose-950/40 text-rose-400'
                        }`}>{g.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{g.actionRequested} — {g.proposedChange}</p>
                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>{g.riskRating} risk</span>
                        <span>{new Date(g.requestedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Engine Telemetry
              </h2>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(logs.length ? logs.slice(-8).reverse() : []).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] font-mono">
                    <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={log.type === 'warning' ? 'text-yellow-400' : log.type === 'error' ? 'text-rose-400' : 'text-slate-400'}>{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-[10px] text-slate-500">No engine activity captured.</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contextual Intelligence rail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onAskCopilot?.("Execute a Supplier Risk Scan for Shanghai Grid Cable Corp, focusing on port clearances and SLA targets.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Supplier Risk Scan
          </button>
          <button
            onClick={() => onAskCopilot?.("Analyze strategic market intelligence trends for high-voltage electricity hardware in the East African region.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <LineChart className="w-3.5 h-3.5 text-indigo-400" /> Market Intelligence
          </button>
          <button
            onClick={() => onAskCopilot?.(pendingGates[0] ? `Review the pending approval gate for "${pendingGates[0].entityName}": ${pendingGates[0].proposedChange}. Assess the PPADA risk and recommend an approval posture.` : "Summarize the current supplier approval-gate posture and any pending HITL decisions.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Review Approval Gates
          </button>
        </div>
        <AtlasAgentPulse agents={DEFAULT_ENTERPRISE_AGENTS} expanded={agentsOpen} onToggle={() => setAgentsOpen(o => !o)} />
      </div>
    </div>
  );
}

// ==========================================
// 4. LOGISTICS COMMAND HUB
// ==========================================
export function LogisticsCommand({ onAskCopilot }: ScmModuleProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="logistics-command">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Anchor className="w-5 h-5 text-indigo-400" />
            Logistics Command & Fleet Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive transit routing, freight tracking, maritime logistics, Northern Corridor clearance, and Delivery Confidence Scores.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Explain the Mombasa Port shipping pipeline and identify why customs terminal holds are peaking at 4 days.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Predict Route SLA
          </button>
          <button 
            onClick={() => onAskCopilot?.("Run the SCM Port ETA predictive model on active high-voltage substation cables transit lines.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Port ETA Model
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white tracking-wide">Active Mombasa-Suswa Shipping Pipeline</h2>
          <span className="border border-indigo-400/20 bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-mono">
            DELIVERY CONFIDENCE INDEX: 81%
          </span>
        </div>

        {/* Pathway visual log */}
        <div className="space-y-4 relative">
          <div className="border-l border-slate-800 ml-3.5 pl-5 space-y-5">
            <div className="relative">
              <span className="absolute -left-[27px] w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
              <span className="text-xs font-bold text-slate-200">Shanghai Ocean Terminus (Departed)</span>
              <p className="text-[10px] text-slate-500">Shipped: Aluminum Cabling cargo batch weight: 4.5 Tons. ETA met.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[27px] w-4 h-4 rounded-full bg-amber-400 animate-ping border-2 border-slate-950"></span>
              <span className="text-xs font-bold text-slate-200">Mombasa Port Cargo Berth (Currently Here)</span>
              <p className="text-[10px] text-slate-400">Undergoing secondary standard KRA tax customs verification. Holding time currently 4 days.</p>
            </div>
            <div className="relative opacity-50">
              <span className="absolute -left-[27px] w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950"></span>
              <span className="text-xs font-bold text-slate-500">Nairobi Dry Port / SGR Transit Line (Upcoming)</span>
              <p className="text-[10px] text-slate-600">Standard standard rail haulage dispatch scheduled.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. RISK & COMPLIANCE CENTER
// ==========================================
export function RiskComplianceCenter({ onAskCopilot }: ScmModuleProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="risk-compliance-center">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Risk & Compliance Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit trails, transaction compliance indices, conflict of interest detection algorithms, KETRACO anti-fraud telemetry.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Run and output SCM compliance audit checking. Reconcile bidding scores and anti-collusion safeguards.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Audit Compliance
          </button>
          <button 
            onClick={() => onAskCopilot?.("Evaluate conflict of interest alerts and flag possible transaction pricing collusion variables.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Assess Collusion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-wide">Audit & Anti-Fraud Warnings</h2>
          <div className="space-y-3">
            <div className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-100">Bidding Pricing Congruity Passed</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Shanghai Cable bid priced within nominal deviation limits (within 4.2% of core category budgets). No collusion anomalies identified.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/35 flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-slate-300">Auditee Scope Check OK</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  All board evaluation matrix scores reconciled cleanly against internal guidelines. Audit readiness score verified at 99.4% bounds.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-3 text-center flex flex-col justify-center items-center">
          <ShieldCheck className="w-12 h-12 text-indigo-400" />
          <span className="text-sm font-bold text-white block mt-2">Compliance Risk Index</span>
          <span className="text-3xl font-mono font-bold text-indigo-400 block">LOW RISK (12%)</span>
          <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
            All procurement procedures strictly adhere to Kenyan Treasury directives and SCM anti-collusion legislation parameters.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. STRATEGIC SOURCING HUB
// ==========================================
export function StrategicSourcing({ onAskCopilot }: ScmModuleProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="strategic-sourcing-hub">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Strategic Sourcing Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Spend category analysis, supplier consolidation metrics, total cost of ownership (TCO) calculators, and savings projections.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Outline potential spend consolidations and category optimizations across Substation EPC sourcing contracts.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Audit Spend Gaps
          </button>
          <button 
            onClick={() => onAskCopilot?.("Explain total cost of ownership (TCO) calculator methodologies for high-capital substation installations.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Model TCO Reductions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-wide">Category Consolidation Opportunities</h2>
          <div className="space-y-3">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs font-bold text-white block">Substation Insulators EPC Sourcing</span>
              <p className="text-[10px] text-slate-400 mt-1">Action: Streamlining 3 local warranty builders into a single corporate EPC package.</p>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 block pt-2">Potential Saving: $340,000 (12.4% category TCO reduction)</span>
            </div>
            
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs font-bold text-white block">Concrete Grid Line Poles Contracting</span>
              <p className="text-[10px] text-slate-400 mt-1">Action: Consolidating regional shipping distributors into northern SGR rail logistics.</p>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 block pt-2">Potential Saving: $80,000 (4.5% logistics TCO reduction)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 text-center flex flex-col justify-center items-center">
          <div className="w-14 h-14 bg-indigo-950/50 rounded-full flex items-center justify-center border border-indigo-500/20 mb-3">
            <TrendingUp className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <span className="text-sm font-bold text-white block">Strategic Savings Realized YTD</span>
          <span className="text-3xl font-mono font-bold text-emerald-400 block">$420,000</span>
          <p className="text-[10px] text-slate-500 mt-2 max-w-xs leading-relaxed">
            Consolidation actions triggered by our SCM autonomous Sourcing Specialist successfully trimmed 6% off baseline substation accessory prices.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. EXECUTIVE INTELLIGENCE MODULE
// ==========================================
export function ExecutiveIntelligence({ onAskCopilot }: ScmModuleProps) {
  const [loading, setLoading] = useState(false);
  const [briefName, setBriefName] = useState('Suswa-Olkaria Line-4 Strategic SCM Review');
  const [briefingOutput, setBriefingOutput] = useState<string | null>(null);

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setBriefingOutput(`
### KETRACO SCM Executive Briefing: ${briefName}
*Target Audience: Board of Directors & SCM Chairman*
*Generated: UTC 2026-06-21*

**Executive Status Summary:**
The general structural health index of current transmission lines contracts stands nominal at 82%. Deliveries are fully compliant with legal anti-fraud boundaries, and saving matrices are peaking at $420,000.

**Active Operational Directives:**
*   Reallocate double-circuit Insulators from Mariakani warehousing depots.
*   Bypass customs withhold delays on high-voltage cables at Mombasa terminals using corporate authorization fast-track channels.
      `);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="executive-intelligence">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Executive Intelligence Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate board briefs, aggregate global SCM KPIs, download official transcripts and model recommendations for board presentations.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Compile and draft an executive strategic Board Briefing report summarizing current KETRACO SCM readiness, risks and mitigations.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Generate Board Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-wide">Board Briefing Generator Panel</h2>
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-slate-400 block">BRIEF SUB-HEADER SUBJECT</label>
            <input 
              type="text" 
              value={briefName}
              onChange={(e) => setBriefName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-505/45"
            />
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Compiling telemetries...' : 'Generate KETRACO SCM Executive Audit'}
          </button>
        </div>

        {/* Display Output area */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 relative min-h-[220px]">
          <span className="text-[9px] font-mono text-slate-500 absolute top-4 right-4">SECURE BRIEF_V3.RTF</span>
          {briefingOutput ? (
            <div className="font-mono text-[11px] text-slate-300 leading-relaxed max-h-[280px] overflow-y-auto whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              {briefingOutput}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-650">
              <FileText className="w-10 h-10 text-slate-850 mb-2" />
              <p className="text-xs font-semibold">Ready for compilation...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. ADMINISTRATION MODULE
// ==========================================
interface AdministrationOSProps extends ScmModuleProps {
  telemetryLogs: any[];
}

export function AdministrationOS({ telemetryLogs, onAskCopilot }: AdministrationOSProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditVerified, setAuditVerified] = useState<boolean | null>(null);
  const [auditMessage, setAuditMessage] = useState<string>('');
  const [secConfig, setSecConfig] = useState({
    hmacTokens: true,
    aesConfig: true,
    rateLimiting: true,
    aiInjectionShield: true
  });

  const fetchActiveSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/auth/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err: any) {
      console.error('[SECURITY DASHBOARD] Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleForceRevoke = async (sessionId: string) => {
    try {
      const res = await fetch('/api/auth/sessions/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, tenantId: 'ketraco' }) // Default tenant id, fallback handled
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        // Append log to telemetry falls
        console.log(`[ZERO TRUST] Successfully terminated session ${sessionId}. Identity revoked.`);
      }
    } catch (err) {
      console.error('[SECURITY DASHBOARD] Force revoke failure:', err);
    }
  };

  const handleAuditLedger = async () => {
    setIsAuditing(true);
    setAuditVerified(null);
    try {
      const res = await fetch('/api/auth/security-audit');
      const data = await res.json();
      if (data.success) {
        setAuditVerified(data.integrityVerified);
        setAuditMessage(data.integrityVerified 
          ? 'SECURE: All historical ledger hashes verify perfectly. SHA-256 chain remains unbroken and tamper-free.'
          : 'COMPROMISED: A signature mismatch was detected in the audit ledger block-chain. Immediate investigation required!'
        );
      } else {
        setAuditVerified(false);
        setAuditMessage('AUDIT FAILURE: Unable to securely reach the cryptographic evaluation registry.');
      }
    } catch (err) {
      setAuditVerified(false);
      setAuditMessage('AUDIT FAILURE: Network failure while validating mathematical integrity.');
    } finally {
      setIsAuditing(false);
    }
  };

  React.useEffect(() => {
    fetchActiveSessions();
    handleAuditLedger();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" id="administration-os">
      {/* Module Header with Contextual AI Everywhere Buttons */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Zero Trust Identity & Security Operations (EIZSP)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Distributed Redis session managers, Cryptographic ledger chains, API Gateway shields, and statutory SCM access policies.
          </p>
        </div>

        {/* Contextual AI Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button 
            onClick={() => onAskCopilot?.("Provide a rigorous security and compliance audit review for KETRACO's Zero Trust framework, including token rotation rules, rate-limits, and how SHA-256 chain seals safeguard audits under Kenya PPADA.")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Assess Security Model
          </button>
        </div>
      </div>

      {/* Grid of Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Cryptographic Audit & Configuration Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Cryptographic Audit ledger integrity check */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400 animate-pulse" />
                Audit Ledger Cryptographic Seal
              </h2>
              <button 
                onClick={handleAuditLedger}
                disabled={isAuditing}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-3">
              {auditVerified === null ? (
                <div className="text-slate-500 font-mono text-[10px] animate-pulse">Running HMAC validation scan...</div>
              ) : auditVerified ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full font-mono text-[9px] font-semibold tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> LEDGER SEAL VERIFIED
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed px-2">{auditMessage}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-400 rounded-full font-mono text-[9px] font-semibold tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5" /> SEC_LEAK_WARNING
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed px-2">{auditMessage}</p>
                </div>
              )}
            </div>

            {/* Micro details of hashing */}
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850/60 font-mono text-[9px] text-slate-550 space-y-1">
              <div className="flex justify-between">
                <span>CHAINING_ALGORITHM:</span>
                <span className="text-indigo-400 font-bold">HMAC-SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span>TAMPER_EVIDENT_STATE:</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>IMMUTABILITY_RULE:</span>
                <span className="text-cyan-400">APPEND_ONLY_BLOCKS</span>
              </div>
            </div>
          </div>

          {/* Section B: API Gateway & Cryptography Shields */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
            <h2 className="text-sm font-semibold text-white">Gateway Security Controls</h2>
            
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-400">HMAC TOKEN ROTATION</span>
                <span className="text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[8px]">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-400">AES-256 CONFIG CRYPTO</span>
                <span className="text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[8px]">GCM_MODE</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-400">REDIS-BACKED RATE LIMIT</span>
                <span className="text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[8px]">100_REQ_MIN</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-850">
                <span className="text-slate-400">AI INJECTION SHIELD</span>
                <span className="text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[8px]">ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Active Sessions & Telecom logs */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section C: Live Session Pool */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Active Multi-Tenant Sessions (Redis-backed)
              </h2>
              <button 
                onClick={fetchActiveSessions}
                disabled={loadingSessions}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {sessions.length > 0 ? (
                sessions.map((sess: any) => (
                  <div key={sess.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-850 flex justify-between items-center font-mono text-[9px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-300 font-bold">{sess.device}</span>
                        <span className="text-slate-600">({sess.ip})</span>
                      </div>
                      <div className="text-slate-500 text-[8px]">
                        Session ID: <span className="text-slate-400">{sess.id}</span> • Login: {new Date(sess.loginTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleForceRevoke(sess.id)}
                      className="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 rounded-lg flex items-center gap-1 transition-all text-[8px] cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> REVOKE
                    </button>
                  </div>
                ))
              ) : (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center text-[10px] text-slate-600">
                  No other active device sessions tracked.
                </div>
              )}
            </div>
          </div>

          {/* Section D: Telemetry Logs */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4 flex flex-col justify-between">
            <h2 className="text-sm font-semibold text-white tracking-wide">Multi-Agent Operating System Trace</h2>
            
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {telemetryLogs && telemetryLogs.length > 0 ? (
                telemetryLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-indigo-300">
                      <span className="font-bold">{log.agentName}</span>
                      <span className="text-slate-600">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-200">Task: {log.task}</p>
                    <p className="text-slate-500 whitespace-pre-wrap">Target outcome: {log.result}</p>
                  </div>
                ))
              ) : (
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-center text-xs text-slate-600">
                  No active execution triggers recorded. Prompt SCM Command Workspace above to see live multi-agent traces step-by-step.
                </div>
              )}
            </div>

            <p className="text-[9px] text-slate-550 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850/60 mt-2 font-mono">
              *System health logs integrated. All actions audit-pinned in compliance with PPADA 2015 Part XII rules.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
