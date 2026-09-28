import React from 'react';
import { AlertTriangle, ShieldCheck, Fingerprint, Lock, Zap, Target, Scale, History } from 'lucide-react';
import { motion } from 'motion/react';

export function RiskIntelligence() {
  const riskDimensions = [
    { label: 'Legal Integrity', value: 12, status: 'LOW', details: 'No blacklisting found in PPRA portal.' },
    { label: 'Financial Stability', value: 45, status: 'MEDIUM', details: 'Audited accounts show slight ratio variance.' },
    { label: 'Supplier Integrity', value: 8, status: 'LOW', details: 'Director check matches CR12 exactly.' },
    { label: 'Technical Capacity', value: 72, status: 'HIGH', details: 'Manufacturer authorization requires second-layer OCR.' },
    { label: 'Operational Risk', value: 25, status: 'LOW', details: 'Past performance records indicate 98% delivery.' },
    { label: 'Fraud Detection', value: 5, status: 'LOW', details: 'Document hash verified against known templates.' },
  ];

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Risk Intelligence Profile</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Multi-Dimensional Fraud & Compliance Scrutiny</p>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {riskDimensions.map((risk) => (
            <div key={risk.label} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white tracking-tight">{risk.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    risk.status === 'LOW' ? 'text-emerald-400 bg-emerald-500/10' :
                    risk.status === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' :
                    'text-red-400 bg-red-500/10'
                  }`}>
                    {risk.status}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/30">{risk.value}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${risk.value}%` }}
                  className={`h-full transition-all duration-1000 ${
                    risk.value < 30 ? 'bg-emerald-500' :
                    risk.value < 60 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-[10px] text-white/30 italic group-hover:text-white/50 transition-colors leading-relaxed">
                "{risk.details}"
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500/50 animate-spin" />
              <div className="w-32 h-32 rounded-full border border-white/5 flex flex-col items-center justify-center bg-[#0d0f1a] shadow-inner">
                <ShieldCheck className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-2xl font-bold text-white">92</span>
                <span className="text-[10px] font-mono text-white/40 uppercase">Safe Score</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 max-w-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">AI Verdict: PROCEED WITH CAUTION</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Overall integrity profile is strong. Identified technical capacity variance requires human review on manufacturer authorization validity.
            </p>
            <div className="pt-4 flex gap-2">
              <button className="flex-1 py-2 bg-indigo-500 text-slate-950 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Full Audit
              </button>
              <button className="flex-1 py-2 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Compare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
