import React, { useState } from 'react';
import { DollarSign, AlertCircle, AlertTriangle, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface FinancialControlProps {
  budget?: string;
  committed?: string;
  actual?: string;
  certified?: string;
  forecast?: string;
  contractHealthPercent?: number;
  eacVariance?: string;
  obligationsBreachCount?: number;
  variationsPendingCount?: number;
}

export const FinancialControl: React.FC<FinancialControlProps> = ({
  budget = 'KES 6.1B',
  committed = '5.1B',
  actual = '3.1B',
  certified = '3.1B',
  forecast = '5.3B',
  contractHealthPercent = 89,
  eacVariance = '+KES 200M',
  obligationsBreachCount = 2,
  variationsPendingCount = 1
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [resolvedNotice, setResolvedNotice] = useState<string | null>(null);

  const resolveItem = (itemTitle: string) => {
    setResolvedNotice(`Approved & resolved: "${itemTitle}". Updated in KETRACO Financial Ledger.`);
  };

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Financial Control
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">
            Project Financial Position
          </p>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          Review (3)
        </button>
      </div>

      {/* Financial Comparison Bars */}
      <div className="space-y-2 py-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Approved Budget:</span>
          <span className="text-white font-bold">{budget}</span>
        </div>

        {/* Breakdown bar graph visualizer */}
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span>Committed</span>
            <span className="text-cyan-400 font-bold">{committed}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: '83%' }} />
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Actual / Certified</span>
            <span className="text-emerald-400 font-bold">{actual}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '51%' }} />
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Forecast at Completion</span>
            <span className="text-purple-400 font-bold">{forecast}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: '87%' }} />
          </div>
        </div>
      </div>

      {/* Financial Indicators */}
      <div className="pt-2 border-t border-slate-800/60 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">{contractHealthPercent}% Contract Health</span>
          <span className="text-rose-400 font-bold">EAC Variance: {eacVariance}</span>
        </div>
        <div className="space-y-0.5 text-[10px] font-mono">
          <div
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{obligationsBreachCount} obligations approaching breach</span>
          </div>
          <div
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{variationsPendingCount} variation requires review</span>
          </div>
        </div>
      </div>

      {/* Financial Review & Mitigation Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f18] border border-cyan-500/40 rounded-xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white text-xs">Financial Obligations & Variations</span>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/40 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-amber-300 font-mono text-[11px]">Letter of Credit Expiry (Lot 2)</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Expires in 11 days. EPC contractor milestone payment pending.</div>
                </div>
                <button
                  onClick={() => resolveItem('Extend LC for 60 Days')}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-200 rounded font-mono text-[10px] shrink-0 cursor-pointer"
                >
                  Extend LC
                </button>
              </div>

              <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-rose-300 font-mono text-[11px]">Substation Transformer Variation 04</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Claim for +KES 32.4M due to seismic foundation reinforcement.</div>
                </div>
                <button
                  onClick={() => resolveItem('Variation 04 Independent Audit')}
                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 rounded font-mono text-[10px] shrink-0 cursor-pointer"
                >
                  Audit Claim
                </button>
              </div>

              {resolvedNotice && (
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resolvedNotice}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
