import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Radio,
  Sparkles,
  Users,
  Building,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import type { MeetingIntelligenceOverview, MeetingEntity } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  data: MeetingIntelligenceOverview;
  onOpenLive: (meeting: MeetingEntity) => void;
  onSelectTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
}

export const MeetingCommandCenterView: React.FC<Props> = ({
  data,
  onOpenLive,
  onSelectTab,
  onQuickAction
}) => {
  const meeting = data.next_meeting;
  const intel = data.today_intelligence;
  const recent = data.recent_transcript;

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-Time Operational Status */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#0f172a] to-[#16122c] border border-cyan-500/20 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Live Command Active
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                PDS Stage: {meeting.pds_stage || 'Procurement'}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                Dept: {meeting.department}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              {meeting.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {meeting.objective}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenLive(meeting)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-spin text-slate-950" />
              Launch Live Workspace
            </button>
            <button
              onClick={() => onSelectTab('ai-minutes')}
              className="px-4 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              Review AI Minutes
            </button>
          </div>
        </div>
      </div>

      {/* 4-Pillar High Density Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('decisions')}
          className="bg-[#0c1220] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>DECISION RADAR</span>
            <span className="text-cyan-400 font-semibold">{intel.decisions} Detected</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
            <span>{data.decision_register.total}</span>
            <ShieldCheck className="w-6 h-6 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            1 Awaiting Chair Sign-off
          </div>
        </div>

        <div
          onClick={() => onSelectTab('actions')}
          className="bg-[#0c1220] border border-slate-800 hover:border-amber-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>ACTION CONTROL</span>
            <span className="text-amber-400 font-semibold">{data.action_control.at_risk} At Risk</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
            <span>{data.action_control.total}</span>
            <Clock className="w-6 h-6 text-amber-400/60 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {data.action_control.overdue} Escalated to Executive
          </div>
        </div>

        <div
          onClick={() => onSelectTab('risks')}
          className="bg-[#0c1220] border border-slate-800 hover:border-rose-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>GRID & SCM RISKS</span>
            <span className="text-rose-400 font-semibold">{data.risks.length} Active</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
            <span>{data.risks.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL').length}</span>
            <AlertTriangle className="w-6 h-6 text-rose-400/60 group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            PPADA §71 Regulatory Exposure
          </div>
        </div>

        <div
          onClick={() => onSelectTab('commitments')}
          className="bg-[#0c1220] border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>COMMITMENTS</span>
            <span className="text-purple-400 font-semibold">{data.commitments.length} Logged</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
            <span>{data.commitments.filter(c => c.status === 'ACTIVE').length}</span>
            <Zap className="w-6 h-6 text-purple-400/60 group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Contractor & Director Pledges
          </div>
        </div>
      </div>

      {/* Main Grid: Left Live Intel Feed & Right Context Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Signal Monitor & Recent Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Live Intelligence Detection Stream
                </h2>
              </div>
              <button
                onClick={() => onSelectTab('live-meetings')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                Inspect All Signals <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {data.live_signals.slice(0, 4).map((sig) => (
                <div
                  key={sig.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        sig.item_type === 'DECISION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        sig.item_type === 'ACTION' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        sig.item_type === 'RISK' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {sig.item_type}
                      </span>
                      <span className="text-xs font-medium text-slate-300">{sig.speaker || 'Participant'}</span>
                      <span className="text-[11px] font-mono text-slate-500">[{sig.timestamp_label}]</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {sig.confidence}% conf
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    {sig.suggested_title}
                  </p>
                  <p className="text-[11px] text-slate-400 italic mt-1 bg-slate-950/40 p-1.5 rounded border border-slate-800/40">
                    "{sig.evidence_quote || sig.source_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audio Snippet / Transcription Preview */}
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase">
                <Radio className="w-4 h-4 text-emerald-400" />
                Latest Speech Transcription Packet
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Offset: {recent.timestamp_offset}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{recent.speaker}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {recent.classification}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  "{recent.text}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Meeting Readiness & Agenda Progress */}
        <div className="space-y-4">
          {/* Readiness Score Card */}
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Session Readiness Radar
              </h3>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {meeting.preparation_pct}% Ready
              </span>
            </div>

            <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${meeting.preparation_pct}%` }}
              />
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Pre-read Documents Circulated
                </span>
                <span className="font-mono text-slate-400">3/3 Docs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Statutory Quorum Verified
                </span>
                <span className="font-mono text-slate-400">7 Members</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  KRA Integration Key Confirmation
                </span>
                <span className="font-mono text-amber-400">Pending Finance</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  PPADA §71 Checklist Loaded
                </span>
                <span className="font-mono text-slate-400">Verified</span>
              </div>
            </div>
          </div>

          {/* Agenda Timeline Preview */}
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase">
                Agenda Timetable
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {meeting.agenda.length} Items
              </span>
            </div>

            <div className="space-y-2">
              {meeting.agenda.map((ag) => (
                <div
                  key={ag.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                    ag.completed
                      ? 'bg-slate-900/30 border-slate-800 text-slate-400'
                      : 'bg-slate-900/80 border-cyan-500/30 text-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                    ag.completed ? 'bg-slate-800 text-slate-400' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {ag.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ag.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ag.presenter} • {ag.duration_minutes}m
                    </p>
                  </div>
                  {ag.completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase mb-2">
              Executive Fast Actions
            </h3>
            <button
              onClick={() => onQuickAction('GENERATE_MINUTES')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span>Compile AI Minutes</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              onClick={() => onQuickAction('TRIGGER_DEADLINE_CHECK')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span>Execute Action Deadline Scan</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <button
              onClick={() => onQuickAction('EXPORT_EXECUTIVE_BRIEF')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center justify-between cursor-pointer"
            >
              <span>Export Executive Brief (Markdown)</span>
              <FileText className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
