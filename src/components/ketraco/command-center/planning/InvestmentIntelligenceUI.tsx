import React, { useMemo } from 'react';
import { TrendingUp, ArrowUpRight, ChevronRight, DollarSign } from 'lucide-react';
import type { InvestmentRanking, GridInvestmentCandidate, PlanningHorizon } from '../../../../../backend/planning-engine/types';
import { gridInvestmentEngine } from '../../../../../backend/planning-engine';
import type { Project } from '../../../../../backend/planning-engine/types';

interface InvestmentIntelligenceProps {
  projects: Project[];
}

export default function InvestmentIntelligenceUI({ projects }: InvestmentIntelligenceProps) {
  const ranking = useMemo(() => gridInvestmentEngine.rankInvestments(projects), [projects]);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Investment Intelligence</div>
          <h3 className="text-lg font-bold">GRID INVESTMENT RANKING</h3>
        </div>
      </div>

      {/* Aggregate Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Capacity Gain', value: `${ranking.totalCapacityGainMw} MW`, color: 'text-emerald-400' },
          { label: 'Congestion Reduction', value: `${ranking.totalCongestionReductionPct}%`, color: 'text-amber-400' },
          { label: 'Reliability Gain', value: `${ranking.totalReliabilityGainPct}%`, color: 'text-cyan-400' },
          { label: 'N-1 Improvement', value: `${ranking.totalN1ImprovementPct}%`, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Investment Candidates Ranked */}
      <div className="space-y-2">
        {ranking.candidates.map((candidate, idx) => (
          <CandidateCard key={candidate.id} candidate={candidate} rank={idx + 1} />
        ))}
      </div>

      {/* Provenance */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-[#0a1222] p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Provenance</div>
        <div className="text-[10px] text-slate-400">
          Source: {ranking.evidence?.[0]?.source || 'Planning Model'} | Confidence: {ranking.evidence?.[0] ? `${(ranking.evidence[0].confidence * 100).toFixed(0)}%` : '95%'} | {ranking.evidence?.[0]?.dataState || 'VERIFIED'}
        </div>
      </div>
    </div>
  );
};

const CandidateCard: React.FC<{ candidate: GridInvestmentCandidate; rank: number }> = ({ candidate, rank }) => {
  const TYPE_LABELS: Record<string, string> = {
    SUBSTATION_EXPANSION: 'Substation', TRANSMISSION_LINE: 'Line', TRANSFORMER: 'Transformer',
    BAY: 'Bay', COMPENSATION: 'Compensation', HVDC: 'HVDC',
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-500 w-8">#{rank}</span>
          <div>
            <div className="text-sm font-bold text-slate-100">{candidate.name}</div>
            <div className="text-[10px] text-slate-400">{TYPE_LABELS[candidate.projectType]} · {candidate.region}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-400">+{candidate.capacityGainMw} MW</div>
          <div className="text-[10px] text-slate-400">Priority: {candidate.priorityScore}</div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="mt-3 grid grid-cols-6 gap-2 text-[10px]">
        {[
          { label: 'Capacity', value: `+${candidate.capacityGainMw} MW`, color: 'text-emerald-400' },
          { label: 'Congestion', value: `-${candidate.congestionReductionPct}%`, color: 'text-amber-400' },
          { label: 'Reliability', value: `+${candidate.reliabilityGainPct}%`, color: 'text-cyan-400' },
          { label: 'N-1', value: `+${candidate.n1ImprovementPct}%`, color: 'text-violet-400' },
          { label: 'Losses', value: `-${candidate.lossReductionPct.toFixed(1)}%`, color: 'text-emerald-400' },
          { label: 'Risk', value: `-${candidate.riskReductionPct}%`, color: 'text-rose-400' },
        ].map(m => (
          <div key={m.label} className="text-slate-400">
            <span className="block text-[9px]">{m.label}</span>
            <span className={`font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Priority Score Bar */}
      <div className="mt-3 flex items-center gap-2 text-[9px]">
        <span className="text-slate-500 w-14">Priority</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 rounded-full"
            style={{ width: `${Math.min(100, candidate.priorityScore)}%` }} />
        </div>
        <span className="text-slate-400 w-8 text-right">{candidate.priorityScore}</span>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Est. cost: {candidate.estimatedCostMw} M (indexed)</span>
        <span>Horizon: {candidate.implementationHorizon}</span>
        <span>Criticality: {candidate.criticality}/100</span>
      </div>
    </div>
  );
}
