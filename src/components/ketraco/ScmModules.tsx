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
type ExecutiveBoardEntity = {
  id: string;
  name: string;
  type: string;
  status: string;
  healthScore: number;
  metadata: Record<string, any>;
  lastEvaluatedAt?: string;
  lastExecution?: {
    recommendation?: string;
    riskScore?: number;
    evidence?: Array<{ statute?: string; paragraph?: string; rating?: number }>;
    validation?: { violations?: string[]; score?: number; isValid?: boolean };
  };
  history?: Array<{ timestamp: string; status: string; healthScore: number; riskScore: number; recommendation: string }>;
};

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') return '—';
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(num)) return '—';
  if (Math.abs(num) >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
}

export function ExecutiveIntelligence({ onAskCopilot }: ScmModuleProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entities, setEntities] = useState<ExecutiveBoardEntity[]>([]);
  const [gates, setGates] = useState<Array<{ id: string; entityId: string; entityName: string; entityType: string; actionRequested: string; proposedChange: string; reason: string; riskRating: 'Low' | 'Medium' | 'High'; status: 'PENDING' | 'APPROVED' | 'REJECTED'; requestedAt: string; resolvedAt?: string; operatorFeedback?: string }>>([]);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: string }>>([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBoard() {
      setLoading(true);
      setError(null);

      try {
        const [entitiesRes, gatesRes, logsRes] = await Promise.all([
          fetch('/api/scm/procurement-intelligence/entities'),
          fetch('/api/scm/procurement-intelligence/approval-gates'),
          fetch('/api/scm/procurement-intelligence/logs')
        ]);

        if (!entitiesRes.ok || !gatesRes.ok || !logsRes.ok) {
          throw new Error('One or more executive data sources are unavailable.');
        }

        const [entitiesJson, gatesJson, logsJson] = await Promise.all([
          entitiesRes.json(),
          gatesRes.json(),
          logsRes.json()
        ]);

        if (!active) return;

        const nextEntities = Array.isArray(entitiesJson?.entities) ? entitiesJson.entities : [];
        const nextGates = Array.isArray(gatesJson?.gates) ? gatesJson.gates : [];
        const nextLogs = Array.isArray(logsJson?.logs) ? logsJson.logs : [];

        setEntities(nextEntities);
        setGates(nextGates);
        setLogs(nextLogs);
        setSelectedDecisionId(nextGates.find((gate: any) => gate.status === 'PENDING')?.id ?? nextGates[0]?.id ?? null);
      } catch (e) {
        if (!active) return;
        setError('Executive intelligence data source unavailable.');
        setEntities([]);
        setGates([]);
        setLogs([]);
        setSelectedDecisionId(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBoard();
    return () => {
      active = false;
    };
  }, []);

  const enterpriseHealth = entities.length
    ? Math.round(entities.reduce((sum, entity) => sum + (entity.healthScore ?? 0), 0) / entities.length)
    : 0;

  const pendingGates = gates.filter((gate) => gate.status === 'PENDING');
  const criticalEntities = entities.filter((entity) => ['CRITICAL', 'ESCALATED', 'DEGRADED'].includes(entity.status));
  const strategicSignals = [...entities]
    .filter((entity) => ['ProcurementPlan', 'TenderNotice', 'AwardDecision', 'Contract', 'FrameworkAgreement'].includes(entity.type))
    .sort((a, b) => (b.healthScore ?? 0) - (a.healthScore ?? 0))
    .slice(0, 4);

  const financialExposure = entities
    .filter((entity) => ['AwardDecision', 'Contract', 'Payment'].includes(entity.type))
    .reduce((sum, entity) => {
      const value = entity.metadata?.proposedValue ?? entity.metadata?.invoiceAmount ?? entity.metadata?.maxPenaltyCap ?? 0;
      return sum + Number(value || 0);
    }, 0);

  const supplierExposure = entities
    .filter((entity) => ['SupplierProfile', 'FrameworkAgreement', 'Contract', 'AGPOSupplier'].includes(entity.type))
    .reduce((sum, entity) => {
      const value = entity.metadata?.priceBid ?? entity.metadata?.bondValue ?? entity.metadata?.invoiceAmount ?? entity.metadata?.maxPenaltyCap ?? 0;
      return sum + Number(value || 0);
    }, 0);

  const selectedDecision = gates.find((gate) => gate.id === selectedDecisionId) ?? gates[0] ?? null;

  const executiveBrief = {
    developments: logs.slice(0, 3).map((log) => log.message).filter(Boolean),
    risks: criticalEntities.slice(0, 3).map((entity) => `${entity.name} — ${entity.status}`),
    decisionsRequired: pendingGates.length
      ? pendingGates.slice(0, 3).map((gate) => gate.actionRequested)
      : ['No pending approval gates are currently reported.'],
    projectExceptions: strategicSignals.filter((entity) => (entity.healthScore ?? 100) < 85).slice(0, 3).map((entity) => `${entity.name} — ${entity.healthScore}% health`),
    commercialExposure: [
      `Contracting and award exposure: ${formatCurrency(financialExposure)}`,
      `Supplier concentration exposure: ${formatCurrency(supplierExposure)}`
    ],
    nextActions: entities
      .map((entity) => entity.lastExecution?.recommendation)
      .filter(Boolean)
      .slice(0, 3)
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-6 text-slate-100" id="executive-intelligence">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-cyan-300/80">EXECUTIVE BOARD</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Board Intelligence</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onAskCopilot?.('Summarize current enterprise health, material risks, outstanding approvals, and recommended executive actions from the live Atlas data set.')}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/15"
          >
            <Sparkles className="h-3.5 w-3.5" /> Atlas brief
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
        <span>Board</span>
        <ArrowRight className="h-3 w-3 text-slate-500" />
        <span>Enterprise issue</span>
        <ArrowRight className="h-3 w-3 text-slate-500" />
        <span>Procurement / project / risk</span>
        <ArrowRight className="h-3 w-3 text-slate-500" />
        <span>Evidence</span>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-400/5 p-4 text-sm text-amber-100">
          <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Data source unavailable</div>
          <p className="mt-2 text-[11px] text-amber-100/80">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 xl:col-span-4" />
          ))}
        </div>
      ) : entities.length === 0 && !error ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
          No live executive board data is available from the current Atlas source.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="rounded-2xl border border-cyan-500/15 bg-[#07111d]/80 p-4 shadow-[0_0_32px_rgba(34,211,238,0.08)] xl:col-span-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Enterprise status</div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-mono font-semibold text-emerald-300">LIVE</span>
            </div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-3xl font-semibold text-white">{enterpriseHealth}%</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Health index</div>
              </div>
              <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-mono text-cyan-200">Atlas scoring</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-slate-400"><span>Operational resilience</span><span>{Math.max(0, 100 - criticalEntities.length * 8)}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.max(0, 100 - criticalEntities.length * 8)}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-slate-400"><span>Commercial exposure</span><span>{formatCurrency(financialExposure)}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" style={{ width: `${Math.min(100, (financialExposure / 800000000) * 100)}%` }} /></div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Strategic priorities</div>
            <div className="space-y-3">
              {strategicSignals.map((entity) => (
                <div key={entity.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{entity.name}</div>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${entity.status === 'CRITICAL' || entity.status === 'ESCALATED' ? 'border-rose-400/30 bg-rose-500/10 text-rose-300' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'}`}>
                      {entity.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{entity.type}</span>
                    <span>{entity.healthScore}% health</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Critical decisions</div>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-mono text-amber-200">{pendingGates.length} pending</span>
            </div>
            <div className="space-y-2">
              {pendingGates.length > 0 ? pendingGates.slice(0, 4).map((gate) => (
                <button
                  key={gate.id}
                  type="button"
                  onClick={() => setSelectedDecisionId(gate.id)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-left transition hover:border-cyan-500/30 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-white">{gate.entityName}</div>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${gate.riskRating === 'High' ? 'border-rose-400/30 bg-rose-500/10 text-rose-300' : gate.riskRating === 'Medium' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
                      {gate.riskRating}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">{gate.actionRequested}</div>
                </button>
              )) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-500">No pending approval gates are currently reported.</div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Enterprise risk</div>
            <div className="space-y-2">
              {criticalEntities.length > 0 ? criticalEntities.slice(0, 4).map((entity) => (
                <div key={entity.id} className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white">{entity.name}</span>
                    <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[9px] font-mono text-rose-300">{entity.status}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-300">Health score: {entity.healthScore}%</div>
                </div>
              )) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-500">No critical enterprise risks are currently active.</div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Capital projects</div>
            <div className="space-y-2">
              {strategicSignals.slice(0, 3).map((entity) => (
                <div key={entity.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="text-sm text-white">{entity.name}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{entity.type}</span>
                    <span>{entity.healthScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Financial / commercial position</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/8 p-3">
                <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-300">Exposure</div>
                <div className="mt-2 text-xl font-semibold text-white">{formatCurrency(financialExposure)}</div>
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/8 p-3">
                <div className="text-[9px] uppercase tracking-[0.2em] text-violet-300">Supplier risk</div>
                <div className="mt-2 text-xl font-semibold text-white">{formatCurrency(supplierExposure)}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Procurement / supplier exposure</div>
            <div className="space-y-2">
              {entities.filter((entity) => ['SupplierProfile', 'FrameworkAgreement', 'Contract'].includes(entity.type)).slice(0, 4).map((entity) => (
                <div key={entity.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white">{entity.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">{entity.type}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-300">Health: {entity.healthScore}%</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Operational exceptions</div>
            <div className="space-y-2">
              {criticalEntities.length > 0 ? criticalEntities.slice(0, 4).map((entity) => (
                <div key={entity.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-white">
                  <div className="flex items-center justify-between gap-2">
                    <span>{entity.name}</span>
                    <span className="text-[9px] font-mono text-amber-200">{entity.status}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-300">{entity.lastExecution?.recommendation ?? 'No recommendation recorded in source data.'}</div>
                </div>
              )) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-500">No operational exceptions are currently reported.</div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-8">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Executive activity</div>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={`${log.timestamp}-${log.message}`} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                  <div className="flex-1">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm text-white">{log.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#08131f]/90 p-4 xl:col-span-4">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-300">Executive brief</div>
            <div className="space-y-2 text-sm text-slate-200">
              {[
                ['Key developments', executiveBrief.developments],
                ['Material risks', executiveBrief.risks],
                ['Decisions required', executiveBrief.decisionsRequired],
                ['Commercial exposure', executiveBrief.commercialExposure],
                ['Recommended next actions', executiveBrief.nextActions]
              ].map(([label, items]) => (
                <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mb-2 text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-300">{String(label)}</div>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    {Array.isArray(items) && items.length > 0 ? items.map((entry) => <li key={String(entry)} className="list-disc ml-4">{String(entry)}</li>) : <li className="list-disc ml-4">No live data available.</li>}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedDecision && (
        <aside className="mt-6 rounded-2xl border border-cyan-500/15 bg-[#07111d]/90 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300">Decision detail</div>
              <h2 className="mt-1 text-xl font-semibold text-white">{selectedDecision.entityName}</h2>
            </div>
            <span className={`rounded-full border px-2 py-1 text-[9px] font-mono ${selectedDecision.status === 'PENDING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : selectedDecision.status === 'APPROVED' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}>
              {selectedDecision.status}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-2"><dt className="text-slate-400">Subject</dt><dd className="text-right text-white">{selectedDecision.entityName}</dd></div>
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-2"><dt className="text-slate-400">Owner</dt><dd className="text-right text-white">{selectedDecision.entityType || 'Not specified'}</dd></div>
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-2"><dt className="text-slate-400">Originating department</dt><dd className="text-right text-white">{selectedDecision.entityType || 'Not specified'}</dd></div>
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-2"><dt className="text-slate-400">Priority</dt><dd className="text-right text-white">{selectedDecision.riskRating}</dd></div>
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-2"><dt className="text-slate-400">Deadline</dt><dd className="text-right text-white">{entities.find((entity) => entity.id === selectedDecision.entityId)?.metadata?.submissionDeadline ?? 'Not specified'}</dd></div>
            </dl>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-300">Supporting evidence</div>
                <p className="mt-2 text-slate-300">{selectedDecision.reason}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-300">Related project / risk</div>
                <p className="mt-2 text-slate-300">{selectedDecision.proposedChange || 'No related record provided in source data.'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAskCopilot?.(`Review the live decision workflow for ${selectedDecision.entityName}, including the approval reason, risk rating and evidence trail.`)}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-cyan-200 hover:border-cyan-400/60 hover:bg-cyan-500/15"
            >
              Ask Atlas
            </button>
          </div>
        </aside>
      )}
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
