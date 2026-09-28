import React, { useState } from 'react';
import {
  Building,
  Radio,
  FileText,
  Users,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import type { MeetingEntity, SpecializedMeetingType } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  meetings: MeetingEntity[];
  activeType: SpecializedMeetingType;
  onSelectType: (type: SpecializedMeetingType) => void;
  onOpenLive: (meeting: MeetingEntity) => void;
  onCreateMeeting: (type: SpecializedMeetingType) => void;
}

const PDS_STAGES = [
  'Conception',
  'Feasibility & ESIA',
  'Route Selection & Survey',
  'Detailed Engineering Design',
  'Land Acquisition & Wayleave Valuation',
  'Project Affected Persons (PAP) Compensation',
  'Tender Document Preparation',
  'Tender Advertising & Evaluation',
  'Contract Negotiation & Award',
  'Construction & Tower Erection',
  'Testing & Grid Synchronization',
  'Commercial Handover & Operations'
];

export const SpecializedMeetingsView: React.FC<Props> = ({
  meetings,
  activeType,
  onSelectType,
  onOpenLive,
  onCreateMeeting
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const filteredMeetings = meetings.filter(m => m.meeting_type === activeType);
  const activeMeeting = filteredMeetings.find(m => m.id === selectedMeetingId) || filteredMeetings[0] || meetings[0];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1220] border border-slate-800 rounded-xl p-2 shadow-lg">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectType('BOARD_COMMITTEE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeType === 'BOARD_COMMITTEE'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Board & Committees
          </button>
          <button
            onClick={() => onSelectType('PROJECT')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeType === 'PROJECT'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Project / PDS Meetings
          </button>
          <button
            onClick={() => onSelectType('PROCUREMENT')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeType === 'PROCUREMENT'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Procurement & Pre-Bid
          </button>
          <button
            onClick={() => onSelectType('STAKEHOLDER')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeType === 'STAKEHOLDER'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Stakeholder & PAP
          </button>
        </div>

        <button
          onClick={() => onCreateMeeting(activeType)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" /> New Session
        </button>
      </div>

      {/* PDS 12-Stage Visual Progress Bar for Project Meetings */}
      {activeType === 'PROJECT' && (
        <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> KETRACO 12-Stage Project Delivery System (PDS)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Active Stage: <strong className="text-slate-200">{activeMeeting?.pds_stage || 'Tender Advertising & Evaluation'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-1.5 pt-1">
            {PDS_STAGES.map((stg, i) => {
              const isCurrent = activeMeeting?.pds_stage?.toLowerCase().includes(stg.toLowerCase().slice(0, 8));
              return (
                <div
                  key={i}
                  className={`p-2 rounded text-center text-[10px] font-mono border transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                  title={`Stage ${i + 1}: ${stg}`}
                >
                  <div className="font-bold mb-0.5">S{i + 1}</div>
                  <div className="truncate">{stg}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Specialized Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Sessions (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase">
            Scheduled & Historical Sessions ({filteredMeetings.length})
          </h3>
          <div className="space-y-2">
            {filteredMeetings.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeetingId(m.id)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                  m.id === activeMeeting?.id
                    ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0c1220] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-semibold">{m.date}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    m.status === 'LIVE' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 line-clamp-2">{m.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">{m.objective}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Session Details (8 cols) */}
        {activeMeeting && (
          <div className="lg:col-span-8 bg-[#0c1220] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {activeMeeting.meeting_type}
                  </span>
                  {activeMeeting.tender_id && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Tender: {activeMeeting.tender_id}
                    </span>
                  )}
                  {activeMeeting.project_id && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Project: {activeMeeting.project_id}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-100">{activeMeeting.title}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Venue: {activeMeeting.room || 'KETRACO Executive Conference Room'} • {activeMeeting.date} ({activeMeeting.start_time} - {activeMeeting.end_time})
                </p>
              </div>

              <button
                onClick={() => onOpenLive(activeMeeting)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
              >
                <Radio className="w-3.5 h-3.5" /> Launch Live Meeting Desk
              </button>
            </div>

            {/* Strategic Objective */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Meeting Objective & Mandate
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {activeMeeting.objective}
              </p>
            </div>

            {/* Quorum & Participants */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Statutory Attendees & Quorum
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeMeeting.participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="font-semibold text-slate-200">{p.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Agenda Blueprint
              </h4>
              <div className="space-y-2">
                {activeMeeting.agenda.map((ag) => (
                  <div key={ag.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold mr-2">Item {ag.order}:</span>
                      <span className="font-medium text-slate-200">{ag.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{ag.duration_minutes} mins ({ag.presenter})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
