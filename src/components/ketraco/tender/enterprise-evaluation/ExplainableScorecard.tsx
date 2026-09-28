import React from 'react';
import { ScrollText, CheckCircle2, XCircle, Info, Scale, ShieldCheck, Binary, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function ExplainableScorecard() {
  const sections = [
    {
      group: 'Mandatory Requirements',
      requirements: [
        { id: 'R1', label: 'Valid Tax Compliance', weight: 0, score: 1, status: 'PASS', law: 'PPADA Sec 71(1)(b)', agent: 'KRA_BOT_3', confidence: 99 },
        { id: 'R2', label: 'CR12 Business Registration', weight: 0, score: 1, status: 'PASS', law: 'PPADA Sec 71(1)(a)', agent: 'CR12_PARSER', confidence: 94 },
        { id: 'R3', label: 'Manufacturer Authorization', weight: 0, score: 1, status: 'PASS', law: 'ITB 4.1', agent: 'DOC_AUTHENTICATOR', confidence: 88 },
      ]
    },
    {
      group: 'Technical Capacity (80%)',
      requirements: [
        { id: 'T1', label: 'Past Performance History', weight: 30, score: 28, status: 'PASS', law: 'Evaluation Criteria #1', agent: 'PAST_PERF_AGENT', confidence: 92 },
        { id: 'T2', label: 'Personnel Qualification', weight: 20, score: 15, status: 'PASS', law: 'Evaluation Criteria #2', agent: 'CV_SCANNER', confidence: 85 },
        { id: 'T3', label: 'Financial Capability', weight: 30, score: 25, status: 'PASS', law: 'PPADR Reg 101', agent: 'FIN_ANALYST', confidence: 91 },
      ]
    }
  ];

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Explainable Evaluation Scorecard</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Transparent Multi-Agent Scrutiny Ledger</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        {sections.map((section) => (
          <div key={section.group} className="space-y-4">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
              {section.group}
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {section.requirements.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${req.status === 'PASS' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                          <h5 className="text-sm font-bold text-white tracking-tight">{req.label}</h5>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-white/20 uppercase block">Score</span>
                            <span className="text-xs font-bold text-white">{req.score}/{req.weight || 'PASS'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-white/20 uppercase block">Conf</span>
                            <span className="text-xs font-bold text-indigo-400">{req.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-[10px] font-mono text-white/40 uppercase truncate">{req.law}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-[10px] font-mono text-white/40 uppercase truncate">Agent: {req.agent}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 cursor-pointer">
                            Inspect Evidence <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
