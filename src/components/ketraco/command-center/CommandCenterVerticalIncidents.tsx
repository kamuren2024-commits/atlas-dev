import React from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { GridIncident } from './decision/types';

interface CommandCenterVerticalIncidentsProps {
  incidents: GridIncident[];
  onOpenDecisionBrief: (incidentId: string) => void;
  onOpenAsset360: (assetId: string) => void;
  onOpenCorridor360: (corridorId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const CommandCenterVerticalIncidents: React.FC<CommandCenterVerticalIncidentsProps> = ({
  incidents,
  onOpenDecisionBrief,
  onOpenAsset360,
  onOpenCorridor360,
  onSelectAsset
}) => {
  return (
    <section className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg select-text">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            HUMAN-IN-THE-LOOP OPERATIONAL TRIAGE
          </span>
          <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
            Critical Incidents & Causality Queue
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Active transmission anomalies requiring formal operator investigation, engineering assessment, and authorization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            {incidents.length} Active System Incidents
          </span>
        </div>
      </div>

      {/* Vertical Stack of Incident Content Containers */}
      <div className="pt-5 space-y-4">
        {incidents.map((incident) => {
          const isP0 = incident.priority === 'P0' || incident.priority === 'CRITICAL';

          return (
            <div
              key={incident.id}
              className={`rounded-xl border p-5 transition-all ${
                isP0
                  ? 'bg-[#0e1220] border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  : 'bg-[#090f1d] border-amber-500/40'
              }`}
            >
              {/* Incident Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      isP0
                        ? 'bg-rose-950 text-rose-200 border border-rose-500/60'
                        : 'bg-amber-950 text-amber-200 border border-amber-500/60'
                    }`}>
                      {incident.priority} PRIORITY
                    </span>

                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-cyan-300 border border-slate-700">
                      STATUS: {incident.status}
                    </span>

                    <span className="text-xs font-mono text-slate-400">
                      Code: {incident.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-white tracking-tight mt-1">
                    {incident.title}
                  </h3>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {incident.affectedAssets?.[0] && (
                    <button
                      onClick={() => incident.affectedAssets?.[0] && onOpenAsset360(incident.affectedAssets[0])}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      View Asset Profile
                    </button>
                  )}

                  <button
                    onClick={() => onOpenDecisionBrief(incident.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
                  >
                    <span>Open Decision Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Incident Description & Root Cause */}
              <div className="py-3 space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    TRIGGER TELEMETRY
                  </span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed mt-0.5">
                    {incident.trigger}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    ENGINEERING ROOT CAUSE ANALYSIS
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mt-0.5">
                    {incident.rootCause}
                  </p>
                </div>
              </div>

              {/* Operational Metadata Grid (Location, Detected, Severity, Impact, Owner) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
                
                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-bold">LOCATION / CORRIDOR</span>
                  <span className="text-white font-bold block mt-1 truncate">
                    {(incident.affectedCorridors || []).join(', ') || 'Regional Backbone'}
                  </span>
                  {incident.affectedAssets?.[0] && (
                    <button
                      onClick={() => onSelectAsset(incident.affectedAssets![0])}
                      className="text-[10px] text-cyan-400 hover:underline mt-0.5 block"
                    >
                      Trace on Canvas &rarr;
                    </button>
                  )}
                </div>

                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-bold">DETECTED TIMESTAMP</span>
                  <span className="text-white font-bold block mt-1">
                    {incident.timeDetected ? new Date(incident.timeDetected).toLocaleTimeString() : 'Live'}
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">
                    Updated: {incident.lastUpdated ? new Date(incident.lastUpdated).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>

                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-bold">MW AT RISK</span>
                  <span className="text-rose-400 font-bold block mt-1 text-sm">
                    {incident.impactAssessment?.mwAtRisk ?? 0} MW
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">
                    {(incident.impactAssessment?.customersAffectedEst ?? 0).toLocaleString()} customers
                  </span>
                </div>

                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-bold">CASCADE WINDOW</span>
                  <span className="text-amber-300 font-bold block mt-1 text-sm">
                    {incident.predictions?.timeToCascadeMin ?? 30} Minutes
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">
                    Escalation risk: {incident.predictions?.severityEscalationProbPct ?? 10}%
                  </span>
                </div>

                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-bold">LEAD RESPONSIBILITY</span>
                  <span className="text-white font-bold block mt-1 truncate">
                    National Control Centre
                  </span>
                  <span className="text-cyan-300 text-[10px] block mt-0.5">
                    Shift Supervisor Lead
                  </span>
                </div>

              </div>

              {/* Recommended Next Action Banner */}
              {incident.recommendations && incident.recommendations.length > 0 && incident.recommendations[0] && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-xs font-mono text-slate-300">
                      <strong className="text-cyan-400 font-semibold">Recommended Action:</strong>{' '}
                      {incident.recommendations[0]?.title} — {incident.recommendations[0]?.details}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenDecisionBrief(incident.id)}
                    className="text-xs font-mono font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                  >
                    Authorize Action &rarr;
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
};
