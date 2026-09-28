import React from 'react';
import { Layers3, CheckCircle2, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { EvaluationStage } from '../../../../types/evaluation';
import { motion } from 'motion/react';

const STAGES: { id: EvaluationStage; label: string }[] = [
  { id: 'INTAKE', label: 'Document Intake' },
  { id: 'CLASSIFICATION', label: 'Classification' },
  { id: 'OCR', label: 'OCR Extraction' },
  { id: 'METADATA', label: 'Metadata Enrichment' },
  { id: 'LEGAL_VALIDATION', label: 'Legal Validation' },
  { id: 'MANDATORY', label: 'Mandatory Requirements' },
  { id: 'TECHNICAL', label: 'Technical Evaluation' },
  { id: 'FINANCIAL', label: 'Financial Evaluation' },
  { id: 'RISK_ASSESSMENT', label: 'Risk Intelligence' },
  { id: 'CROSS_VALIDATION', label: 'Cross Validation' },
  { id: 'RECOMMENDATION', label: 'Recommendation' },
  { id: 'OFFICER_APPROVAL', label: 'Officer Approval' },
];

export function MultiStagePipeline({ currentStage }: { currentStage: EvaluationStage }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl p-6 overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <Layers3 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Stage Procurement Pipeline</h3>
        </div>
        <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Stage {currentIndex + 1} of {STAGES.length}
        </div>
      </div>

      <div className="flex items-start gap-4 min-w-max pb-4">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-3 w-32 relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 z-10 ${
                  isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  isActive ? 'bg-indigo-500 border-indigo-500 text-slate-950 shadow-[0_0_20px_rgba(99,102,241,0.4)]' :
                  'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                   isActive ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                   <span className="text-xs font-bold font-mono">{idx + 1}</span>}
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-tight leading-tight transition-colors ${
                    isActive ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/20'
                  }`}>
                    {stage.label}
                  </p>
                </div>
              </div>
              
              {idx < STAGES.length - 1 && (
                <div className="pt-5 shrink-0">
                  <ArrowRight className={`w-4 h-4 ${isCompleted ? 'text-emerald-500/30' : 'text-white/5'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
