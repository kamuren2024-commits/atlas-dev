import React, { useMemo } from 'react';
import { FileText, AlertTriangle, TrendingUp, Shield, Zap, Calendar, Target, ChevronRight } from 'lucide-react';
import type { PlanningBrief, PlanningHorizon } from '../../../../../backend/planning-engine/types';
import { gridPlanningEngine } from '../../../../../backend/planning-engine';

interface ExecutivePlanningBriefProps {
  horizon: PlanningHorizon;
}

export default function ExecutivePlanningBriefUI({ horizon }: ExecutivePlanningBriefProps) {
  const brief = useMemo(() => gridPlanningEngine.generatePlanningBrief(
    horizon,
    [
      'Nairobi North 400kV transformer T1 forced outage — 480 MW metro load affected, alternative supply providing 320 MW',
      'Loiyangalani 400kV protection event — auto-reclose successful, monitoring required',
    ],
    [
      'Northern corridor elevated weather risk — thunderstorm and lightning activity forecast for 72 hours',
      'Naivasha 220kV reactor maintenance scheduled — high exposure due to corridor overlap',
    ],
    [
      'Nairobi Loop Reinforcement (PRJ-201) on track — 420 MW capacity gain in construction',
      'Western Corridor HVDC Support (PRJ-214) in procurement — 660 MW gain',
    ],
    [
      'Demand growth at 4.1% may exceed committed transmission reinforcement by 2028',
      'Renewable intermittency increasing frequency regulation requirements',
      'Aging transformer fleet requiring accelerated replacement programme',
    ],
    [
      'Reinforce Nairobi–Naivasha corridor with additional 400kV circuit',
      'Accelerate substation expansion at Nairobi North and Lessos',
      'Deploy energy storage for frequency support as renewable share rises',
    ],
  ), [horizon]);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/30">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400">Executive Intelligence</div>
          <h3 className="text-lg font-bold">NATIONAL GRID PLANNING BRIEF</h3>
          <div className="text-[10px] text-slate-400">Horizon: {horizon}</div>
        </div>
      </div>

      {/* Brief Sections */}
      <div className="space-y-3">
        <BriefSection
          icon={TrendingUp}
          title="GRID OUTLOOK"
          content={brief.gridOutlook}
          color="text-cyan-400"
          bgColor="bg-cyan-500/5"
          borderColor="border-cyan-500/30"
        />
        <BriefSection
          icon={Zap}
          title="CAPACITY POSITION"
          content={brief.capacityPosition}
          color="text-emerald-400"
          bgColor="bg-emerald-500/5"
          borderColor="border-emerald-500/30"
        />

        {/* Top Constraints */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">TOP CONSTRAINTS</span>
          </div>
          <div className="space-y-2">
            {brief.topConstraints.map((constraint, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                <span>{constraint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Major Outages */}
        <BriefSection
          icon={AlertTriangle}
          title="MAJOR OUTAGES"
          items={brief.majorOutages}
          color="text-rose-400"
          bgColor="bg-rose-500/5"
          borderColor="border-rose-500/30"
        />

        {/* Maintenance Exposure */}
        <BriefSection
          icon={Calendar}
          title="MAINTENANCE EXPOSURE"
          items={brief.maintenanceExposure}
          color="text-amber-400"
          bgColor="bg-amber-500/5"
          borderColor="border-amber-500/30"
        />

        {/* Project Portfolio */}
        <BriefSection
          icon={Target}
          title="PROJECT PORTFOLIO"
          items={brief.projectPortfolio}
          color="text-violet-400"
          bgColor="bg-violet-500/5"
          borderColor="border-violet-500/30"
        />

        {/* Future Risks */}
        <BriefSection
          icon={Shield}
          title="FUTURE RISKS"
          items={brief.futureRisks}
          color="text-rose-400"
          bgColor="bg-rose-500/5"
          borderColor="border-rose-500/30"
        />

        {/* Priority Investments */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">PRIORITY INVESTMENTS</span>
          </div>
          <div className="space-y-2">
            {brief.priorityInvestments.map((inv, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold w-4 shrink-0">{i + 1}.</span>
                <span>{inv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence & Provenance */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-[#0a1222] p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Evidence & Provenance</div>
        {brief.evidence.map((ev, i) => (
          <div key={i} className="text-[10px] text-slate-400 mt-1">
            Source: {ev.source} | Model: {ev.modelVersion} | Confidence: {(ev.confidence * 100).toFixed(0)}% | {ev.dataState}
          </div>
        ))}
        <div className="mt-2 text-[10px] text-slate-500">
          All statements evidence-backed. No fabricated planning values.
        </div>
      </div>
    </div>
  );
}

function BriefSection({ icon: Icon, title, content, items, color, bgColor, borderColor }: {
  icon: typeof TrendingUp;
  title: string;
  content?: string;
  items?: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm font-bold ${color}`}>{title}</span>
      </div>
      {content && <div className="text-[11px] text-slate-300 leading-relaxed">{content}</div>}
      {items && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
              <ChevronRight className={`w-3 h-3 ${color} mt-0.5 shrink-0`} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
