import React from 'react';
import { X, Binary, Search, ShieldCheck, Scale, ArrowRight, Fingerprint, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ManagedDocument } from '../../../../types/evaluation';

interface ReasoningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoc?: ManagedDocument;
}

export function ReasoningPanel({ isOpen, onClose, selectedDoc }: ReasoningPanelProps) {
  if (!selectedDoc) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-[480px] bg-[#0b0e16] border-l border-white/5 z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
          >
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0d111b]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Binary className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Structured Audit Reasoning</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Document Overview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Target Context</span>
                  <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">Hash Verified: OK</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-bold text-white">{selectedDoc.name}</h4>
                  <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">CLASSIFICATION: {selectedDoc.classification}</p>
                </div>
              </div>

              {/* Reasoning Chain */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Logic Execution Tree</h3>
                
                <div className="space-y-4 relative">
                  {/* Step 1: Input */}
                  <ReasoningStep 
                    idx={1}
                    title="Input Decryption & Normalization"
                    description="Source document stream decoded. OCR layer applied with UTF-8 normalization."
                    status="SUCCESS"
                    data={{ chars: '14,204', encoding: 'UTF-8', layer: 'Native Text' }}
                  />
                  
                  {/* Step 2: Processing */}
                  <ReasoningStep 
                    idx={2}
                    title="Entity Extraction (KRA_PIN_PARSER)"
                    description="Regex and Semantic search patterns identified 11-digit KRA PIN on Page 1."
                    status="SUCCESS"
                    data={{ extracted: 'P051234567A', confidence: '99.8%', pattern: 'KRA_STANDARD_v2' }}
                  />

                  {/* Step 3: Rule Application */}
                  <ReasoningStep 
                    idx={3}
                    title="Rule Compliance Mapping (PPADA_SEC_71)"
                    description="Extracted PIN cross-referenced against KRA iTax REST API endpoint."
                    status="SUCCESS"
                    data={{ endpoint: 'api.kra.go.ke', response: 'VALID', status: 'ACTIVE' }}
                  />

                  {/* Step 4: Decision Tree */}
                  <ReasoningStep 
                    idx={4}
                    title="Decision Tree Finalization"
                    description="Aggregating agent confidence and mandatory requirement weightings."
                    status="SUCCESS"
                    data={{ verdict: 'PASSED', weight: 'MANDATORY', next: 'Technical Evaluation' }}
                  />
                </div>
              </div>

              {/* Legal Reference */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Legal Traceability</h3>
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                  <div className="flex items-start gap-3">
                    <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">PPADA 2015 Section 71(1)(b)</p>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-1 italic">
                        "The person has fulfilled his tax obligations or has made arrangements satisfactory..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#0d111b] shrink-0 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/30 uppercase">Officer Verification Required</span>
                <span className="text-amber-400 font-bold">LEVEL 2 REVIEW</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-emerald-500 text-slate-950 text-[11px] font-bold rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer uppercase tracking-wider">
                  APPROVE FINDING
                </button>
                <button className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer uppercase tracking-wider">
                  FLAG RISK
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ReasoningStep({ idx, title, description, status, data }: any) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center z-10 text-[10px] font-mono text-indigo-400 font-bold">
        {idx}
      </div>
      {idx < 4 && <div className="absolute left-2.5 top-6 bottom-[-16px] w-px bg-white/5" />}
      
      <div className="space-y-2">
        <div>
          <h5 className="text-[11px] font-bold text-white/90 uppercase tracking-tight">{title}</h5>
          <p className="text-[10.5px] text-white/40 leading-relaxed mt-0.5">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-1.5">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[9.5px] font-mono">
              <span className="text-white/20 uppercase">{key}</span>
              <span className="text-indigo-400/80 font-bold">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
