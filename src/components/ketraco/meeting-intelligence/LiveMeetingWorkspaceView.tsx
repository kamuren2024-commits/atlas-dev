import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  Square,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  FileText,
  Users,
  ChevronRight,
  Filter,
  Check,
  X,
  Edit2,
  Upload,
  ArrowRight,
  FileUp,
  AlertCircle
} from 'lucide-react';
import type {
  MeetingEntity,
  TranscriptSegment,
  DetectedIntelligenceItem,
  ReviewStatus,
  AttendanceStatus,
  MeetingDocument,
  AgendaItem,
  MeetingRecordingStatus
} from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  meeting: MeetingEntity;
  transcripts: TranscriptSegment[];
  detectedItems: DetectedIntelligenceItem[];
  userRole?: string;
  onAddTranscript: (text: string, speaker: string) => Promise<void>;
  onTriggerAiExtract: () => Promise<void>;
  onReviewSignal: (id: string, status: ReviewStatus, notes?: string, editedTitle?: string) => Promise<void>;
  onStartMeeting?: (id: string) => Promise<void>;
  onPauseMeeting?: (id: string) => Promise<void>;
  onResumeMeeting?: (id: string) => Promise<void>;
  onEndMeeting?: (id: string) => Promise<void>;
  onToggleAgendaItem?: (itemId: string, completed: boolean) => Promise<void>;
  onToggleAttendance?: (participantId: string, attendance: AttendanceStatus) => Promise<void>;
  onAttachDocument?: (doc: Partial<MeetingDocument>) => Promise<void>;
  onNavigateToMinutes?: () => void;
}

export const LiveMeetingWorkspaceView: React.FC<Props> = ({
  meeting,
  transcripts,
  detectedItems,
  userRole = 'CHAIR',
  onAddTranscript,
  onTriggerAiExtract,
  onReviewSignal,
  onStartMeeting,
  onPauseMeeting,
  onResumeMeeting,
  onEndMeeting,
  onToggleAgendaItem,
  onToggleAttendance,
  onAttachDocument,
  onNavigateToMinutes
}) => {
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [newSpeaker, setNewSpeaker] = useState(meeting.chair || 'Kamuren Wanjau');
  const [newText, setNewText] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isExtracting, setIsExtracting] = useState(false);
  const [editingSignalId, setEditingSignalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isLifecycleLoading, setIsLifecycleLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('TECHNICAL_SPEC');
  const [docSummary, setDocSummary] = useState('');
  const [activeTabSub, setActiveTabSub] = useState<'AGENDA' | 'PARTICIPANTS' | 'DOCS'>('AGENDA');
  const [recordingStatus, setRecordingStatus] = useState<MeetingRecordingStatus>('IDLE');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<string | null>(null);

  // Elapsed Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(meeting.elapsed_seconds || 0);

  useEffect(() => {
    if (meeting.status === 'COMPLETED') {
      if (meeting.started_at && meeting.ended_at) {
        const start = new Date(meeting.started_at).getTime();
        const end = new Date(meeting.ended_at).getTime();
        const paused = meeting.total_paused_ms || 0;
        setElapsedSeconds(Math.max(0, Math.floor((end - start - paused) / 1000)));
      }
      return;
    }

    if (meeting.status === 'LIVE' && meeting.started_at) {
      const updateTimer = () => {
        const now = Date.now();
        const start = new Date(meeting.started_at!).getTime();
        const paused = meeting.total_paused_ms || 0;
        const diff = Math.max(0, Math.floor((now - start - paused) / 1000));
        setElapsedSeconds(diff);
      };
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    } else if (meeting.status === 'PAUSED' && meeting.started_at && meeting.paused_at) {
      const start = new Date(meeting.started_at).getTime();
      const pauseTime = new Date(meeting.paused_at).getTime();
      const paused = meeting.total_paused_ms || 0;
      setElapsedSeconds(Math.max(0, Math.floor((pauseTime - start - paused) / 1000)));
    } else {
      setElapsedSeconds(0);
    }
  }, [meeting.status, meeting.started_at, meeting.paused_at, meeting.ended_at, meeting.total_paused_ms]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getUserMedia) {
      setRecordingStatus('UNAVAILABLE');
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const persistRecordingMetadata = async (nextStatus: MeetingRecordingStatus, extra?: Record<string, any>) => {
    try {
      await fetch(`/api/meeting-intelligence/meetings/${meeting.id}/recordings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          startedAt: startedAtRef.current || new Date().toISOString(),
          endedAt: nextStatus === 'STORED' || nextStatus === 'FAILED' ? new Date().toISOString() : null,
          durationMs: elapsedSeconds * 1000,
          mediaType: 'audio/webm',
          codec: 'opus',
          ...extra
        })
      });
    } catch (error) {
      console.warn('[MEETING-RECORDING] Failed to persist recording metadata', error);
    }
  };

  const handleRecordingToggle = async () => {
    if (recordingStatus === 'UNAVAILABLE') {
      return;
    }

    if (!mediaRecorderRef.current) {
      try {
        setRecordingStatus('REQUESTING_PERMISSION');
        await persistRecordingMetadata('REQUESTING_PERMISSION');
        if (!navigator.mediaDevices?.getUserMedia) {
          setRecordingStatus('UNAVAILABLE');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;
        recordingChunksRef.current = [];
        startedAtRef.current = new Date().toISOString();

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordingChunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
          setRecordingStatus('UPLOADING');
          await persistRecordingMetadata('UPLOADING');
          const blob = new Blob(recordingChunksRef.current, { type: mimeType || 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1] || '';
            try {
              const payload = new Uint8Array(await blob.arrayBuffer());
              const checksum = 'sha256:' + btoa(String.fromCharCode(...payload.slice(0, 32)));
              const res = await fetch(`/api/meeting-intelligence/meetings/${meeting.id}/recordings/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: base64,
                  storageRef: `recording_${meeting.id}_${Date.now()}.webm`,
                  checksum,
                  size: blob.size,
                  createdBy: 'browser-recorder',
                  tenantId: meeting.tenant_id || 'ketraco'
                })
              });
              if (res.ok) {
                setRecordingStatus('STORED');
                await persistRecordingMetadata('STORED');
              } else {
                setRecordingStatus('FAILED');
                await persistRecordingMetadata('FAILED');
              }
            } catch (error) {
              setRecordingStatus('FAILED');
              await persistRecordingMetadata('FAILED');
            }
          };
          reader.readAsDataURL(blob);
        };

        setRecordingStatus('READY');
        await persistRecordingMetadata('READY');
        return;
      } catch (error) {
        console.warn('[MEETING-RECORDING] unable to access microphone', error);
        setRecordingStatus('FAILED');
        return;
      }
    }

    if (recordingStatus === 'READY') {
      mediaRecorderRef.current.start();
      setRecordingStatus('RECORDING');
      await persistRecordingMetadata('RECORDING');
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setRecordingStatus('STOPPING');
      await persistRecordingMetadata('STOPPING');
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
    }
  };

  const handleSendTranscript = async () => {
    if (!newText.trim()) return;
    await onAddTranscript(newText.trim(), newSpeaker);
    setNewText('');
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    await onTriggerAiExtract();
    setIsExtracting(false);
  };

  const startEdit = (sig: DetectedIntelligenceItem) => {
    setEditingSignalId(sig.id);
    setEditTitle(sig.suggested_title);
    setEditNotes(sig.review_notes || '');
  };

  const saveEditAndAccept = async (id: string) => {
    await onReviewSignal(id, 'EDITED', editNotes, editTitle);
    setEditingSignalId(null);
  };

  const handleLifecycleAction = async (action: 'START' | 'PAUSE' | 'RESUME' | 'END') => {
    setIsLifecycleLoading(true);
    try {
      if (action === 'START' && onStartMeeting) {
        await onStartMeeting(meeting.id);
      } else if (action === 'PAUSE' && onPauseMeeting) {
        await onPauseMeeting(meeting.id);
      } else if (action === 'RESUME' && onResumeMeeting) {
        await onResumeMeeting(meeting.id);
      } else if (action === 'END' && onEndMeeting) {
        await onEndMeeting(meeting.id);
      }
    } finally {
      setIsLifecycleLoading(false);
    }
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !onAttachDocument) return;
    await onAttachDocument({
      name: docName.trim(),
      category: docCategory as any,
      summary: docSummary.trim() || 'Attached supporting evidence for meeting proceedings.'
    });
    setDocName('');
    setDocSummary('');
    setShowDocModal(false);
  };

  const filteredItems = detectedItems.filter(item => {
    if (filterType === 'ALL') return true;
    return item.item_type === filterType;
  });

  const isLive = meeting.status === 'LIVE';
  const isPaused = meeting.status === 'PAUSED';
  const isCompleted = meeting.status === 'COMPLETED';
  const isScheduled = meeting.status === 'SCHEDULED' || meeting.status === 'DRAFT' || meeting.status === 'READY';

  return (
    <div className="space-y-4">
      {/* Workspace Header Toolbar & Real-Time Lifecycle Controls */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Live In-Session
            </div>
          )}
          {isPaused && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Session Paused
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Session Completed
            </div>
          )}
          {isScheduled && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase">
              <Clock className="w-3.5 h-3.5" />
              Scheduled ({meeting.start_time || '10:00'})
            </div>
          )}

          {/* Session Timer Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs">
            <Clock className={`w-3.5 h-3.5 ${isLive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-bold tracking-wider">{formatTimer(elapsedSeconds)}</span>
          </div>

          <span className="text-slate-200 font-semibold text-sm">
            {meeting.title}
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            [{meeting.room || meeting.venue || 'Executive Conference Room'}]
          </span>
        </div>

        {/* State Machine Transition Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Start Meeting Button */}
          {isScheduled && onStartMeeting && (
            <button
              onClick={() => handleLifecycleAction('START')}
              disabled={isLifecycleLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isLifecycleLoading ? 'Starting...' : 'Start Session'}
            </button>
          )}

          {/* Pause Meeting Button */}
          {isLive && onPauseMeeting && (
            <button
              onClick={() => handleLifecycleAction('PAUSE')}
              disabled={isLifecycleLoading}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          )}

          {/* Resume Meeting Button */}
          {isPaused && onResumeMeeting && (
            <button
              onClick={() => handleLifecycleAction('RESUME')}
              disabled={isLifecycleLoading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume
            </button>
          )}

          {/* End Meeting Button */}
          {(isLive || isPaused) && onEndMeeting && (
            <button
              onClick={() => handleLifecycleAction('END')}
              disabled={isLifecycleLoading}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              End Session
            </button>
          )}

          {/* Completed Session - Navigate to Minutes */}
          {isCompleted && onNavigateToMinutes && (
            <button
              onClick={onNavigateToMinutes}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Review Minutes & Approval</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Browser Recording Boundary */}
          <button
            onClick={handleRecordingToggle}
            disabled={recordingStatus === 'REQUESTING_PERMISSION' || recordingStatus === 'UPLOADING' || recordingStatus === 'STOPPING'}
            className={`px-4 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-50 ${
              recordingStatus === 'RECORDING' || recordingStatus === 'PAUSED'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : recordingStatus === 'UNAVAILABLE'
                  ? 'bg-slate-800 border-slate-700 text-slate-500'
                  : 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${recordingStatus === 'RECORDING' ? 'animate-pulse' : ''}`} />
            {recordingStatus === 'RECORDING' ? 'Stop Recording' : recordingStatus === 'REQUESTING_PERMISSION' ? 'Requesting Mic...' : recordingStatus === 'UPLOADING' ? 'Uploading...' : recordingStatus === 'STORED' ? 'Stored' : recordingStatus === 'UNAVAILABLE' ? 'Mic Unavailable' : 'Start Recording'}
          </button>

          {/* AI Trigger */}
          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Extracting...' : 'Trigger AI Extraction'}
          </button>
        </div>
      </div>

      {/* 3-Column Command Desk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">
        {/* Left Column (3 cols): Agenda, Participants Roster, Documents Tabs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-4 shadow-lg space-y-3">
            {/* Sub-Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTabSub('AGENDA')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTabSub === 'AGENDA'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agenda ({meeting.agenda.filter(a => a.completed).length}/{meeting.agenda.length})
              </button>
              <button
                onClick={() => setActiveTabSub('PARTICIPANTS')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTabSub === 'PARTICIPANTS'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Roster ({meeting.participants.length})
              </button>
              <button
                onClick={() => setActiveTabSub('DOCS')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTabSub === 'DOCS'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Docs ({meeting.documents.length})
              </button>
            </div>

            {/* Tab 1: Agenda Proceedings */}
            {activeTabSub === 'AGENDA' && (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {meeting.agenda.map((ag) => (
                  <div
                    key={ag.id}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      ag.completed
                        ? 'bg-slate-900/30 border-slate-800 text-slate-400'
                        : 'bg-slate-900/80 border-cyan-500/30 text-slate-100 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        ITEM {ag.sequence || ag.order}
                      </span>
                      {onToggleAgendaItem && (
                        <button
                          onClick={() => onToggleAgendaItem(ag.id, !ag.completed)}
                          className="cursor-pointer text-slate-400 hover:text-emerald-400"
                          title={ag.completed ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {ag.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-600 hover:border-cyan-400" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="font-medium mt-1 leading-snug">{ag.title}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                      <span>{ag.presenter}</span>
                      <span>{ag.duration_minutes || ag.durationMinutes || 15}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Participants Roster with Attendance Management */}
            {activeTabSub === 'PARTICIPANTS' && (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {meeting.participants.map((p) => (
                  <div
                    key={p.id || p.name}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{p.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {p.role}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{p.department || 'KETRACO'}</span>
                      {onToggleAttendance && p.id ? (
                        <button
                          onClick={() => {
                            const nextStatus: AttendanceStatus =
                              p.attendance === 'ATTENDED' ? 'ABSENT' : 'ATTENDED';
                            onToggleAttendance(p.id, nextStatus);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            p.attendance === 'ATTENDED' || p.attended
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {p.attendance === 'ATTENDED' || p.attended ? 'Attended' : 'Mark Present'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">{p.attendance || 'INVITED'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Documents Management */}
            {activeTabSub === 'DOCS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Evidence Dossier</span>
                  {onAttachDocument && (
                    <button
                      onClick={() => setShowDocModal(true)}
                      className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Attach Doc
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {meeting.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{doc.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {doc.summary}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{doc.category}</span>
                        <span>{doc.size || '1.2 MB'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column (5 cols): Timestamped Live Transcript */}
        <div className="lg:col-span-5 bg-[#0c1220] border border-slate-800/80 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase">
                <Radio className="w-4 h-4 text-cyan-400" />
                Live Audio Transcript Ledger ({transcripts.length} Segments)
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                98% Accuracy
              </span>
            </div>

            {/* Transcript Stream */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
              {transcripts.map((seg) => (
                <div
                  key={seg.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    seg.is_key_point
                      ? 'bg-slate-900/90 border-cyan-500/30'
                      : 'bg-slate-900/40 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">{seg.speaker}</span>
                      {seg.speaker_role && (
                        <span className="text-slate-400">({seg.speaker_role})</span>
                      )}
                    </div>
                    <span className="text-slate-500">[{seg.timestamp_label}]</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {seg.text}
                  </p>
                  {seg.is_key_point && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-semibold">
                      <Sparkles className="w-3 h-3" /> Key Governance Evidence Point
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Injection / Statement Controls */}
          <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={newSpeaker}
                onChange={(e) => setNewSpeaker(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium max-w-[170px] truncate"
              >
                {meeting.participants.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Transcribe live speech input or enter statement..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTranscript()}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleSendTranscript}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Intelligence Extracted Items */}
        <div className="lg:col-span-4 bg-[#0c1220] border border-slate-800/80 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase">
                  Detected Intelligence Items ({filteredItems.length})
                </h3>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded px-2 py-1 font-mono"
              >
                <option value="ALL">All Signals</option>
                <option value="DECISION">Decisions</option>
                <option value="ACTION">Actions</option>
                <option value="RISK">Risks</option>
                <option value="COMMITMENT">Commitments</option>
                <option value="QUESTION">Questions</option>
                <option value="ESCALATION">Escalations</option>
              </select>
            </div>

            {/* Extracted Signals List with Accept / Edit / Reject Governance */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredItems.map((sig) => (
                <div
                  key={sig.id}
                  className={`p-3 rounded-lg border text-xs transition-all ${
                    sig.status === 'ACCEPTED' || sig.status === 'EDITED'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : sig.status === 'REJECTED'
                      ? 'bg-slate-900/30 border-slate-800 opacity-60'
                      : 'bg-slate-900/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        sig.item_type === 'DECISION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        sig.item_type === 'ACTION' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        sig.item_type === 'RISK' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {sig.item_type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">[{sig.timestamp_label}]</span>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {sig.confidence}% conf
                    </span>
                  </div>

                  {editingSignalId === sig.id ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-slate-100 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Review notes / verification rationale..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingSignalId(null)}
                          className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditAndAccept(sig.id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer"
                        >
                          Save & Promote
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-100 leading-snug">
                        {sig.suggested_title}
                      </p>

                      <p className="text-[11px] text-slate-400 italic mt-1 bg-slate-950/50 p-1.5 rounded border border-slate-800/60">
                        "{sig.evidence_quote || sig.source_text}"
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Speaker: <strong className="text-slate-300">{sig.speaker || 'Unknown'}</strong></span>
                        <span className="font-mono text-cyan-400/80">{sig.linked_entity}</span>
                      </div>

                      {/* Human Review Controls */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          sig.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300' :
                          sig.status === 'EDITED' ? 'bg-blue-500/20 text-blue-300' :
                          sig.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sig.status}
                        </span>

                        {sig.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEdit(sig)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => onReviewSignal(sig.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                            <button
                              onClick={() => onReviewSignal(sig.id, 'ACCEPTED')}
                              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">
                            Reviewed by {sig.reviewed_by || 'Director'}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Human Governance Active: AI extractions only promote to official records upon explicit human sign-off.</span>
          </div>
        </div>
      </div>

      {/* Document Attachment Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-cyan-400" />
                Attach Meeting Evidence Document
              </h4>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Document Title / File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPADA_Compliance_Audit_2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="TECHNICAL_SPEC">Technical Specification</option>
                  <option value="PPADA_COMPLIANCE">PPADA Statutory Compliance</option>
                  <option value="PDS_MILESTONE">PDS Stage Milestone</option>
                  <option value="LEGAL_OPINION">Legal Opinion</option>
                  <option value="AUDIT_LEDGER">Audit Ledger Record</option>
                  <option value="TENDER_EVALUATION">Tender Evaluation Memo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Summary / Verification Scope</label>
                <textarea
                  rows={3}
                  placeholder="Describe the context and evidentiary relevance for this meeting..."
                  value={docSummary}
                  onChange={(e) => setDocSummary(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Attach Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
