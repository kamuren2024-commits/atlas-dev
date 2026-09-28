import React, { useState } from 'react';
import { Activity, ShieldAlert, Clock, AlertCircle, TrendingUp, Users, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DecisionAssistant from './DecisionAssistant';
import { AtlasMissionBrief } from '../ui/atlas/AtlasMissionBrief';

const ProcurementWatchCenter: React.FC = () => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [metrics] = useState({
    activeEvaluations: 8,
    highRiskSuppliers: 3,
    pendingReviews: 5,
    complianceScore: 94.2
  });

  const alerts = [
    { id: 1, type: 'CRITICAL', title: 'Collusion Clustering Alert', desc: 'Identified mathematical price clustering pattern across 3 bidders in Substation Lot 4.', time: '2m ago' },
    { id: 2, type: 'WARNING', title: 'Statutory Filing Expiry', desc: 'CR12 certification for Siemens Energy East Africa expires within 14 calendar days.', time: '1h ago' },
    { id: 3, type: 'INFO', title: 'Autonomous Document Audit', desc: 'OCR Ingestion Agent verified tax compliance authenticity for 12 bidding submissions.', time: '3h ago' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#070b16] space-y-6 overflow-y-auto text-slate-100" id="watch-center">
      {/* Atlas Standard Mission Brief */}
      <AtlasMissionBrief
        moduleLabel="Procurement Watch Center"
        mission="Autonomous monitoring, bid integrity audit, statutory compliance checks, and real-time fraud anomaly deterrence."
        description="Continuously audits statutory registry links, PPRA thresholds, bidder tax clearances, and price variance distributions across active utility infrastructure tenders."
        metrics={[
          { label: 'Active Evaluations', value: metrics.activeEvaluations, icon: Clock, tone: 'info' },
          { label: 'High Risk Findings', value: metrics.highRiskSuppliers, icon: ShieldAlert, tone: 'risk' },
          { label: 'Pending Reviews', value: metrics.pendingReviews, icon: Users, tone: 'ai' },
          { label: 'Compliance Index', value: `${metrics.complianceScore}%`, icon: CheckCircle2, tone: 'healthy' }
        ]}
      />

      <div className="px-6 sm:px-8 flex-1 flex flex-col lg:flex-row gap-6 pb-6">
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Top Actions Rail */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1020] border border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">PROCUREMENT SURVEILLANCE ACTIVE</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setShowAssistant(!showAssistant)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                  showAssistant 
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(0,217,255,0.2)]' 
                    : 'bg-[#0d1527] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <MessageSquare size={14} className="text-cyan-400" />
                <span>AI ASSISTANT</span>
              </button>
              <button className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(0,217,255,0.15)] cursor-pointer">
                GENERATE BRIEF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Alerts Stream */}
            <div className="lg:col-span-1 bg-[#090f1d] rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#0c1426]">
                <h3 className="font-mono font-bold text-xs flex items-center gap-2 text-slate-200 uppercase tracking-wider">
                  <AlertCircle size={14} className="text-rose-400" />
                  Live Intelligence Alerts
                </h3>
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950/50 border border-cyan-500/20 px-1.5 py-0.5 rounded">STREAM</span>
              </div>
              <div className="p-4 space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3.5 bg-[#0d1424] border border-slate-800/70 rounded-xl relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      alert.type === 'CRITICAL' ? 'bg-rose-500' : alert.type === 'WARNING' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`} />
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        alert.type === 'CRITICAL' ? 'bg-rose-950/50 text-rose-400 border border-rose-500/20' : alert.type === 'WARNING' ? 'bg-amber-950/50 text-amber-300 border border-amber-500/20' : 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/20'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-500">{alert.time}</span>
                    </div>
                    <div className="font-bold text-xs text-slate-200 leading-snug">{alert.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alert.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="lg:col-span-2 bg-[#090f1d] rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col justify-between">
              <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#0c1426]">
                <h3 className="font-mono font-bold text-xs flex items-center gap-2 text-slate-200 uppercase tracking-wider">
                  <TrendingUp size={14} className="text-cyan-400" />
                  Predictive Tender Variance & Anomaly Models
                </h3>
                <div className="flex gap-1.5">
                  {['Cost', 'Delay', 'Fraud'].map(t => (
                    <span key={t} className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded text-[9.5px] font-mono font-bold text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="h-44 flex items-end gap-3 pb-2 border-b border-slate-800/50">
                  {[65, 45, 85, 30, 95, 50, 75, 40].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className={`w-full rounded-t-md ${h > 80 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : h > 50 ? 'bg-cyan-500' : 'bg-emerald-500'} opacity-85`}
                      />
                      <span className="text-[8.5px] font-mono text-slate-400 font-bold">W{i+1}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="p-3.5 bg-[#0d1424] rounded-xl border border-slate-800/70">
                    <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Forecast Error</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">± 2.4%</div>
                  </div>
                  <div className="p-3.5 bg-[#0d1424] rounded-xl border border-slate-800/70">
                    <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Exposure Estimate</div>
                    <div className="text-lg font-mono font-bold text-rose-400">KES 48.2M</div>
                  </div>
                  <div className="p-3.5 bg-[#0d1424] rounded-xl border border-slate-800/70">
                    <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Throughput Rate</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">12.4 / Mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assistant Sidebar */}
        <AnimatePresence>
          {showAssistant && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-full lg:w-96 shrink-0 border border-slate-800/80 bg-[#090e1c] rounded-2xl overflow-hidden shadow-2xl p-4"
            >
              <DecisionAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProcurementWatchCenter;
