import React from 'react';
import { Network, Fingerprint, Search, ShieldCheck, Map, ArrowUpRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface EvidenceGraphProps {
  docId: string | null;
}

export function EvidenceGraph({ docId }: EvidenceGraphProps) {
  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Network className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evidence Traceability Graph</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Finding-to-Source Mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> FINDING</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> SOURCE</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> RULE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]">
        {/* Canvas Simulation */}
        <div className="relative w-full h-full p-12">
          {/* Central Doc Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 40px rgba(99,102,241,0.2)', '0 0 0px rgba(99,102,241,0)']
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex flex-col items-center justify-center gap-1 shadow-2xl backdrop-blur-xl"
            >
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              <span className="text-[9px] font-bold text-white uppercase">Source</span>
            </motion.div>
          </div>

          {/* Connection Lines (SVGs) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="75%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="25%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Evidence Nodes */}
          <EvidenceNode 
            pos={{ top: '30%', left: '25%' }} 
            type="FINDING" 
            label="KRA PIN Verified" 
            id="FIND_01" 
            details="Page 1, Para 4" 
            color="indigo"
          />
          <EvidenceNode 
            pos={{ top: '30%', left: '75%' }} 
            type="RULE" 
            label="PPADA Section 71" 
            id="RULE_01" 
            details="Tax Compliance" 
            color="amber"
          />
          <EvidenceNode 
            pos={{ top: '70%', left: '25%' }} 
            type="SOURCE" 
            label="KRA iTax Portal" 
            id="SRC_01" 
            details="Real-time Lookup" 
            color="emerald"
          />
          <EvidenceNode 
            pos={{ top: '70%', left: '75%' }} 
            type="FINDING" 
            label="Director Match" 
            id="FIND_02" 
            details="CR12 v Bidder" 
            color="indigo"
          />
        </div>

        {/* Hover Inspector Mock */}
        <div className="absolute bottom-6 right-6 w-64 p-4 rounded-xl bg-[#0d111b]/95 border border-white/10 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Micro Inspector</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          <p className="text-xs font-bold text-white leading-tight">Evidence: P051234567A</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-white/30">
              <span>Source Doc:</span>
              <span className="text-white/60">Tender_KRA_PIN.pdf</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-white/30">
              <span>Page Ref:</span>
              <span className="text-white/60">Page 1, Paragraph 4</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-white/30">
              <span>OCR Conf:</span>
              <span className="text-emerald-400">99.8%</span>
            </div>
          </div>
          <button className="w-full py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1.5">
            VIEW SOURCE SEGMENT <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EvidenceNode({ pos, type, label, id, details, color }: any) {
  const colorClasses: any = {
    indigo: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400',
    amber: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
  };

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 w-40 group cursor-pointer"
      style={pos}
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className={`p-3 rounded-xl border backdrop-blur-md transition-all group-hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] ${colorClasses[color]}`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">{type}</span>
          <span className="text-[8px] opacity-40">#{id}</span>
        </div>
        <h5 className="text-[10px] font-bold text-white/90 truncate">{label}</h5>
        <p className="text-[9px] opacity-50 mt-0.5 truncate">{details}</p>
      </motion.div>
    </div>
  );
}
