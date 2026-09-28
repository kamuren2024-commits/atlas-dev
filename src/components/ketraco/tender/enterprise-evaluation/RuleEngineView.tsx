import React from 'react';
import { Scale, ShieldCheck, AlertTriangle, BookOpen, Clock, Search, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export function RuleEngineView() {
  const rules = [
    { id: 'RULE_TAX', source: 'PPADA 2015', section: 'Sec 71(1)(b)', desc: 'Valid Tax Compliance Certificate', severity: 'MANDATORY' },
    { id: 'RULE_REG', source: 'PPADA 2015', section: 'Sec 71(1)(a)', desc: 'Legal capacity to contract', severity: 'MANDATORY' },
    { id: 'RULE_AGPO', source: 'PPADA 2015', section: 'Sec 157', desc: 'Reservation schemes for disadvantaged groups', severity: 'HIGH' },
    { id: 'RULE_BANK', source: 'PPADR 2020', section: 'Reg 101', desc: 'Demonstrated financial capacity', severity: 'HIGH' },
  ];

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Central Procurement Rule Engine</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Regulatory Logic Framework v2.4</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input 
            type="text" 
            placeholder="Search Laws/Sections..."
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-indigo-500/50 transition-all w-64"
          />
        </div>
      </div>

      <div className="p-6 overflow-y-auto space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-start justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 font-bold uppercase">
                  {rule.source}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-white/40 font-bold uppercase">
                  {rule.section}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  rule.severity === 'MANDATORY' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                }`}>
                  {rule.severity}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white/90">{rule.desc}</h4>
                <p className="text-[11px] text-white/40 leading-relaxed mt-1">
                  Evaluation logic mapped to agent: <span className="text-indigo-400/60 font-mono">kra-validation-agent@v1.2</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer group-hover:scale-110">
                <BookOpen className="w-4 h-4" />
              </button>
              <button className="text-[10px] font-mono text-indigo-400/60 hover:text-indigo-400 transition-colors uppercase tracking-widest font-bold">
                View Logic
              </button>
            </div>
          </div>
        ))}

        <button className="w-full py-4 rounded-xl border border-dashed border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 text-xs font-bold text-white/20 hover:text-white/40 group cursor-pointer">
          <ShieldCheck className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
          EXTEND RULESET (LEGAL OVERRIDE)
        </button>
      </div>
    </div>
  );
}
