import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Building,
  Users,
  FileText,
  Plus,
  Trash2,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import type { MeetingEntity, SpecializedMeetingType } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  initialType?: SpecializedMeetingType;
  onClose: () => void;
  onCreate: (meeting: Partial<MeetingEntity>) => Promise<void>;
}

export const CreateMeetingModal: React.FC<Props> = ({
  initialType = 'GENERAL',
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState<SpecializedMeetingType>(initialType);
  const [room, setRoom] = useState('Executive Conference Room, Nairobi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [department, setDepartment] = useState('SCM');
  const [objective, setObjective] = useState('');
  const [pdsStage, setPdsStage] = useState('Tender Advertising & Evaluation');
  const [tenderId, setTenderId] = useState('');
  const [projectId, setProjectId] = useState('PRJ-SCM-MOD-2025');

  const [agenda, setAgenda] = useState<Array<{ title: string; presenter: string; duration_minutes: number }>>([
    { title: 'Adoption of Agenda & Quorum Confirmation', presenter: 'Chair', duration_minutes: 10 },
    { title: 'Substantive Technical Proceedings', presenter: 'Lead Specialist', duration_minutes: 30 }
  ]);

  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaPresenter, setNewAgendaPresenter] = useState('Operations Director');
  const [newAgendaDuration, setNewAgendaDuration] = useState(15);

  const addAgendaItem = () => {
    if (!newAgendaTitle.trim()) return;
    setAgenda([
      ...agenda,
      {
        title: newAgendaTitle.trim(),
        presenter: newAgendaPresenter,
        duration_minutes: newAgendaDuration
      }
    ]);
    setNewAgendaTitle('');
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreate({
      title: title.trim(),
      meeting_type: meetingType,
      room,
      date,
      start_time: startTime,
      end_time: endTime,
      department,
      objective: objective.trim() || 'Statutory review and compliance evaluation.',
      pds_stage: pdsStage,
      tender_id: tenderId ? tenderId.trim() : undefined,
      project_id: projectId ? projectId.trim() : undefined,
      status: 'READY',
      current_stage: 'CREATE',
      agenda: agenda.map((ag, i) => ({
        id: `AG_${i + 1}`,
        order: i + 1,
        title: ag.title,
        presenter: ag.presenter,
        duration_minutes: ag.duration_minutes,
        completed: false
      })),
      participants: [
        { name: 'Kamuren Wanjau', role: 'Operations Director' },
        { name: 'John Kamau', role: 'SCM Lead' }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase font-mono">
              Configure New Meeting Session
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Session Title</label>
            <input
              type="text"
              required
              placeholder="e.g. KETRACO Suswa-Isinya EPC Technical Clarification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Meeting Archetype</label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="GENERAL">General Governance</option>
                <option value="BOARD_COMMITTEE">Board & Committee</option>
                <option value="PROJECT">Project / PDS Stage</option>
                <option value="PROCUREMENT">Procurement / Pre-Bid</option>
                <option value="STAKEHOLDER">Stakeholder / PAP</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Directorate / Dept</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="SCM">Supply Chain Management</option>
                <option value="Grid Infrastructure">Grid Infrastructure</option>
                <option value="Operations">Operations & Maintenance</option>
                <option value="Legal">Legal & Regulatory</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">PDS Delivery Stage</label>
              <select
                value={pdsStage}
                onChange={(e) => setPdsStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              >
                <option value="Conception">Conception</option>
                <option value="Feasibility & ESIA">Feasibility & ESIA</option>
                <option value="Detailed Engineering Design">Detailed Design</option>
                <option value="Tender Advertising & Evaluation">Tender Evaluation</option>
                <option value="Contract Negotiation & Award">Contract Award</option>
                <option value="Construction & Tower Erection">Construction</option>
                <option value="Testing & Grid Synchronization">Commissioning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Strategic Objective</label>
            <textarea
              rows={2}
              placeholder="Outline meeting purpose, statutory mandate, and expected resolutions..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
            />
          </div>

          {/* Agenda Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-medium block">Agenda Items ({agenda.length})</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {agenda.map((ag, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-200">{i + 1}. {ag.title} ({ag.duration_minutes}m, {ag.presenter})</span>
                  <button
                    type="button"
                    onClick={() => removeAgendaItem(i)}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="New agenda item title..."
                value={newAgendaTitle}
                onChange={(e) => setNewAgendaTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
              />
              <input
                type="number"
                placeholder="Mins"
                value={newAgendaDuration}
                onChange={(e) => setNewAgendaDuration(parseInt(e.target.value) || 15)}
                className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-center"
              />
              <button
                type="button"
                onClick={addAgendaItem}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Initialize Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
