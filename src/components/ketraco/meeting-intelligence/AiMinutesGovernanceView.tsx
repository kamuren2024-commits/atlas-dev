import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Download,
  Printer,
  Edit3,
  Save,
  ShieldCheck,
  Building,
  Calendar,
  Users,
  Clock,
  Award
} from 'lucide-react';
import type { MeetingMinutes, MeetingEntity } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  meeting: MeetingEntity;
  minutes: MeetingMinutes | null;
  onGenerateMinutes: () => Promise<void>;
  onSaveMinutes: (minutes: MeetingMinutes) => Promise<void>;
  onApproveMinutes: (minutesId: string, chair: string) => Promise<void>;
}

export const AiMinutesGovernanceView: React.FC<Props> = ({
  meeting,
  minutes,
  onGenerateMinutes,
  onSaveMinutes,
  onApproveMinutes
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(minutes?.executive_summary || '');
  const [editedNextNotes, setEditedNextNotes] = useState(minutes?.next_meeting_notes || '');
  const [chairSignoffName, setChairSignoffName] = useState('Kamuren Wanjau (Operations Director)');
  const [isApproving, setIsApproving] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerateMinutes();
    setIsGenerating(false);
  };

  const handleSave = async () => {
    if (!minutes) return;
    const updated: MeetingMinutes = {
      ...minutes,
      executive_summary: editedSummary,
      next_meeting_notes: editedNextNotes,
      status: 'SECRETARY_REVIEW',
      updated_at: new Date().toISOString()
    };
    await onSaveMinutes(updated);
    setIsEditing(false);
  };

  const handleApprove = async () => {
    if (!minutes) return;
    setIsApproving(true);
    await onApproveMinutes(minutes.id, chairSignoffName);
    setIsApproving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    if (!minutes) return;
    const md = `# ${minutes.title}
Date: ${minutes.date} | Location: ${minutes.location}
Status: ${minutes.status} | Version Lock: ${minutes.version_lock_hash || 'Uncommitted'}
Chair: ${minutes.chair} | Secretary: ${minutes.secretary}

## EXECUTIVE SUMMARY
${minutes.executive_summary}

## ATTENDEES
${minutes.attendees.map(a => `- ${a.name} (${a.role})`).join('\n')}

## AGENDA PROCEEDINGS
${minutes.agenda_proceedings.map(ag => `### ${ag.agenda_title}\n${ag.discussion_summary}`).join('\n\n')}

## DECISIONS ADOPTED
${minutes.decisions.map(d => `- **${d.code}**: ${d.title} (Authority: ${d.authority})`).join('\n')}

## ACTIONS ASSIGNED
${minutes.actions.map(a => `- **${a.action_title}** | Owner: ${a.owner} | Due: ${a.due_date}`).join('\n')}

## NEXT MEETING
${minutes.next_meeting_notes}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KETRACO_Minutes_${meeting.id}_v${minutes.version}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!minutes) {
    return (
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Official Minutes Not Compiled</h2>
        <p className="text-sm text-slate-400">
          Compile KETRACO enterprise minutes directly from verified proceedings, speaker transcripts, and approved decisions.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Synthesizing Minutes via Gemini...' : 'Generate Official Minutes'}
        </button>
      </div>
    );
  }

  const isLocked = minutes.status === 'OFFICIAL_LOCKED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Governance Status Bar */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded flex items-center gap-1.5 uppercase ${
            isLocked
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
          }`}>
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {minutes.status}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Version: {minutes.version}
          </span>
          {minutes.version_lock_hash && (
            <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              HASH: {minutes.version_lock_hash.substr(0, 16)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLocked && (
            <>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedSummary(minutes.executive_summary);
                    setEditedNextNotes(minutes.next_meeting_notes || '');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Draft
                </button>
              )}
            </>
          )}

          <button
            onClick={handleDownloadMarkdown}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export MD
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" /> Print
          </button>
        </div>
      </div>

      {/* Official KETRACO Minutes Document Container */}
      <div className="bg-[#0b101c] border border-slate-800/90 rounded-xl p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none">
        {/* Document Header with KETRACO Emblems */}
        <div className="border-b border-slate-800 pb-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
            <Building className="w-4 h-4" /> Kenya Electricity Transmission Company Limited
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            {minutes.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {minutes.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {meeting.start_time} - {meeting.end_time}</span>
            <span>Venue: {minutes.location}</span>
          </div>
        </div>

        {/* Section 1: Attendance Ledger */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" /> 1. Attendance & Quorum
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            {minutes.attendees.map((att, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60 last:border-0">
                <span className="font-semibold">{att.name}</span>
                <span className="text-slate-400 font-mono">{att.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            2. Executive Summary
          </h2>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-lg border border-slate-800/80">
              {minutes.executive_summary}
            </p>
          )}
        </div>

        {/* Section 3: Agenda Proceedings */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            3. Detailed Proceedings by Agenda Item
          </h2>
          <div className="space-y-3">
            {minutes.agenda_proceedings.map((ag, idx) => (
              <div key={ag.agenda_item_id || idx} className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-200">
                  Agenda {idx + 1}: {ag.agenda_title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ag.discussion_summary}
                </p>
                {ag.key_findings && ag.key_findings.length > 0 && (
                  <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1 pt-1">
                    {ag.key_findings.map((f, fi) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Adopted Decisions */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> 4. Decisions Reached
          </h2>
          <div className="space-y-2">
            {minutes.decisions.map((dec, i) => (
              <div key={i} className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">{dec.code}</span>
                  <span className="text-[11px] font-mono text-slate-400">Authority: {dec.authority}</span>
                </div>
                <p className="text-slate-100 font-semibold">{dec.title}</p>
                <p className="text-[11px] text-slate-400 font-mono">Sign-off: {dec.approved_by}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Action Queue */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> 5. Assigned Action Controls
          </h2>
          <div className="space-y-2">
            {minutes.actions.map((act, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">{act.action_title}</p>
                  <p className="text-[11px] text-slate-400">Lead Owner: <strong className="text-slate-300">{act.owner}</strong></p>
                </div>
                <span className="font-mono text-cyan-400 font-semibold text-xs">
                  Deadline: {act.due_date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Next Session */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            6. Next Meeting Schedule
          </h2>
          {isEditing ? (
            <input
              type="text"
              value={editedNextNotes}
              onChange={(e) => setEditedNextNotes(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500 rounded p-2 text-xs text-slate-200"
            />
          ) : (
            <p className="text-xs text-slate-300">
              {minutes.next_meeting_notes || 'Next statutory review session scheduled within 7 business days.'}
            </p>
          )}
        </div>

        {/* Sign-off & Version Lock Verification Section */}
        <div className="border-t-2 border-slate-800 pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Compiled by Secretary:</span>
              <p className="font-bold text-slate-200">{minutes.secretary}</p>
              <p className="text-[11px] text-slate-400 font-mono">{minutes.created_at.split('T')[0]}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Confirmed by Committee Chair:</span>
              <p className="font-bold text-slate-200">
                {minutes.approved_by_chair || 'Pending Official Chair Approval'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {minutes.approved_at ? minutes.approved_at.split('T')[0] : 'Statutory approval outstanding'}
              </p>
            </div>
          </div>

          {!isLocked && (
            <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-cyan-300 uppercase font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Executive Chair Approval Gateway
                </h4>
                <p className="text-[11px] text-slate-300">
                  Approving will commit these minutes as statutory record, lock versions, and compute immutable SHA256 audit hash.
                </p>
              </div>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Award className="w-4 h-4" />
                {isApproving ? 'Locking Version...' : 'Approve & Lock Minutes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
