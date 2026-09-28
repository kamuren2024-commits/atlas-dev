/**
 * KETRACO SCM MEETING INTELLIGENCE - DOMAIN CONTRACT & TYPES
 * Enterprise Meeting-to-Decision Intelligence Architecture
 * KETRACO National Grid Command Center & Decision Nexus
 */

export type MeetingType =
  | 'BOARD'
  | 'COMMITTEE'
  | 'EXECUTIVE'
  | 'PROJECT'
  | 'SITE'
  | 'PROCUREMENT'
  | 'TECHNICAL'
  | 'OPERATIONS'
  | 'CONTRACT'
  | 'STAKEHOLDER'
  | 'HSE'
  | 'FINANCE'
  | 'ICT'
  | 'DEPARTMENTAL'
  | 'EMERGENCY'
  | 'OTHER'
  | 'BOARD_COMMITTEE'
  | 'GENERAL';

export type MeetingProviderType = 'ZOOM' | 'MICROSOFT_TEAMS' | 'GOOGLE_MEET' | 'INTERNAL';
export type CalendarProviderType = 'OUTLOOK' | 'GOOGLE_CALENDAR' | 'INTERNAL';
export type ProviderConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR';
export type CalendarSyncStatus = 'SYNCED' | 'PENDING' | 'ERROR';

export interface MeetingProviderMetadata {
  type: MeetingProviderType;
  label: string;
  oauth_enabled: boolean;
  connection_status: ProviderConnectionStatus;
  join_url?: string;
  meeting_url?: string;
  external_meeting_id?: string;
  webhooks_enabled?: boolean;
  calendar_provider?: CalendarProviderType;
  calendar_sync_status?: CalendarSyncStatus;
  last_sync_at?: string;
}

export type SpecializedMeetingType = MeetingType;

export type PdsStage =
  | 'Need'
  | 'Concept'
  | 'Feasibility'
  | 'Wayleave/RAP'
  | 'Financing'
  | 'Approvals'
  | 'Procurement'
  | 'Design'
  | 'Construction'
  | 'Commissioning'
  | 'Handover'
  | 'Benefits';

export type MeetingLoopStage =
  | 'CREATE'
  | 'CONFIGURE'
  | 'AGENDA'
  | 'PARTICIPANTS'
  | 'DOCUMENT_CONTEXT'
  | 'LIVE_MEETING'
  | 'TRANSCRIPT'
  | 'AI_EXTRACTION'
  | 'DECISIONS'
  | 'ACTIONS'
  | 'RISKS'
  | 'COMMITMENTS'
  | 'DRAFT_MINUTES'
  | 'HUMAN_REVIEW'
  | 'APPROVAL'
  | 'PUBLISH'
  | 'NOTIFY'
  | 'MONITOR'
  | 'ESCALATE'
  | 'REPORT'
  | 'GRAPH'
  | 'ORGANIZATIONAL_MEMORY';

export type MeetingStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'LIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'CREATED'
  | 'READY'
  | 'PROCESSING'
  | 'REVIEW'
  | 'PUBLISHED';

export type ParticipantRole =
  | 'CHAIR'
  | 'SECRETARY'
  | 'MEMBER'
  | 'OBSERVER'
  | 'PRESENTER'
  | 'GUEST'
  | string;

export type ParticipantAttendance =
  | 'INVITED'
  | 'CONFIRMED'
  | 'ATTENDED'
  | 'ABSENT'
  | 'EXCUSED';

export type AgendaItemStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'DISCUSSED'
  | 'DEFERRED'
  | 'CLOSED';

export interface Participant {
  id: string;
  meetingId: string;
  name: string;
  email?: string;
  role: ParticipantRole;
  attendance: ParticipantAttendance;
  organization?: string;
  department?: string;
  attended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaItem {
  id: string;
  meetingId?: string;
  meeting_id?: string;
  sequence: number;
  order?: number;
  title: string;
  description?: string;
  presenter?: string;
  linkedEntity?: string;
  linked_entity?: string;
  status?: AgendaItemStatus;
  duration_minutes?: number;
  durationMinutes?: number;
  completed: boolean;
  objective?: string;
  notes?: string;
}

export interface ContextDocument {
  id: string;
  meetingId?: string;
  meeting_id?: string;
  name: string;
  category: string;
  size: string;
  summary: string;
  url?: string;
  uploaded_at?: string;
  uploadedAt?: string;
  uploaded_by?: string;
  uploadedBy?: string;
}

export type MeetingDocument = ContextDocument;

export interface MeetingLifecycleEvent {
  eventId: string;
  eventType: string;
  entityId: string;
  actor: string;
  timestamp: string;
  correlationId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface MeetingEntity {
  id: string;
  title: string;
  meeting_type: MeetingType;
  type?: MeetingType;
  room: string;
  venue?: string;
  date: string;
  start_time: string;
  startTime?: string;
  end_time: string;
  endTime?: string;
  status: MeetingStatus;
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
  preparation_pct: number;
  objective: string;
  description?: string;
  department: string;
  chair?: string;
  secretary?: string;
  project_id?: string;
  projectId?: string;
  pds_stage?: PdsStage;
  tender_id?: string;
  contract_id?: string;
  current_stage: MeetingLoopStage;
  provider?: MeetingProviderMetadata;
  calendar?: {
    provider: CalendarProviderType;
    sync_status: CalendarSyncStatus;
    event_id?: string;
    organizer?: string;
    attendees?: string[];
    reminders?: string[];
    recurring?: boolean;
  };
  participants: Array<{
    id?: string;
    meetingId?: string;
    name: string;
    role: string;
    department?: string;
    organization?: string;
    email?: string;
    attendance?: ParticipantAttendance;
    attended?: boolean;
  }>;
  agenda: AgendaItem[];
  documents: ContextDocument[];
  prior_meetings_count: number;
  open_decisions_count: number;
  previous_signals: string[];
  open_commitments: string[];
  relevant_entities: Array<{ id?: string; label: string; type: string }>;
  linkedEntities?: Array<{ id?: string; label: string; type: string }>;
  tenant_id: string;
  created_by?: string;
  createdBy?: string;
  started_at?: string | null;
  startedAt?: string | null;
  paused_at?: string | null;
  pausedAt?: string | null;
  resumed_at?: string | null;
  resumedAt?: string | null;
  ended_at?: string | null;
  endedAt?: string | null;
  total_paused_ms?: number;
  totalPausedMs?: number;
  elapsed_seconds?: number;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
}

export type Meeting = MeetingEntity;

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  speaker: string;
  speaker_role?: string;
  timestamp_label: string;
  start_seconds: number;
  text: string;
  confidence: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL' | 'RISK';
  is_key_point?: boolean;
  created_at: string;
}

export type DetectedItemType =
  | 'DECISION'
  | 'ACTION'
  | 'RISK'
  | 'COMMITMENT'
  | 'ISSUE'
  | 'QUESTION'
  | 'ESCALATION';

export type ReviewStatus = 'PENDING' | 'ACCEPTED' | 'EDITED' | 'REJECTED';

export interface DetectedIntelligenceItem {
  id: string;
  meeting_id: string;
  item_type: DetectedItemType;
  speaker?: string;
  timestamp_label: string;
  source_text: string;
  text?: string;
  suggested_title: string;
  confidence: number;
  linked_entity: string;
  entity_tag?: string;
  category: string;
  category_tag?: string;
  evidence_quote: string;
  status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  promoted_entity_id?: string;
  created_at: string;
}

// Backwards compatibility alias for live signals
export type IntelligenceSignal = DetectedIntelligenceItem;

export type DecisionStatus =
  | 'PROPOSED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DEFERRED'
  | 'IMPLEMENTING'
  | 'IMPLEMENTED'
  | 'SUPERSEDED'
  | 'AWAITING_APPROVAL';

export interface DecisionRecord {
  id: string;
  code: string;
  title: string;
  description?: string;
  status: DecisionStatus;
  authority: string;
  owner: string;
  meeting_id: string;
  meeting_name: string;
  meeting_date: string;
  project_id?: string;
  entity_name?: string;
  confidence: number;
  requires_human_approval: boolean;
  evidence_text?: string;
  implementation_notes?: string;
  approved_by?: string;
  approved_at?: string;
  audit_trail: Array<{ action: string; user: string; timestamp: string; note?: string }>;
  created_at: string;
  updated_at?: string;
}

export type ActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'BLOCKED'
  | 'OVERDUE'
  | 'UNDER_VERIFICATION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ActionControlItem {
  id: string;
  action_title: string;
  description?: string;
  owner: string;
  department: string;
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ActionStatus;
  project_id?: string;
  source_meeting_id?: string;
  source_meeting_title?: string;
  evidence_text?: string;
  dependencies: string[];
  linked_entities: string[];
  verification_notes?: string;
  verified_by?: string;
  completed_at?: string;
  escalation_level: number;
  escalated_to?: string;
  last_notified_at?: string;
  workflow_triggered?: boolean;
  workflow_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface CommitmentRecord {
  id: string;
  meeting_id: string;
  commitment_title: string;
  party: string;
  owner: string;
  target_date: string;
  status: 'ACTIVE' | 'FULFILLED' | 'BREACHED' | 'AT_RISK';
  evidence_ref: string;
  created_at: string;
}

export interface RiskItem {
  id: string;
  meeting_id: string;
  risk_title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation_plan: string;
  owner: string;
  status: 'OPEN' | 'MONITORING' | 'MITIGATED' | 'CLOSED';
  project_id?: string;
  tender_id?: string;
  created_at: string;
}

export interface ProcurementClarification {
  id: string;
  meeting_id: string;
  tender_id: string;
  tender_clause: string;
  question: string;
  response: string;
  clarification_status: 'PUBLISHED' | 'PENDING_TECHNICAL_REVIEW' | 'ADDENDUM_REQUIRED';
  addendum_required: boolean;
  evidence_ref: string;
  action_id?: string;
  created_at: string;
}

export type MinutesStatus =
  | 'AI_DRAFT'
  | 'SECRETARY_REVIEW'
  | 'CHAIR_APPROVAL'
  | 'OFFICIAL_LOCKED'
  | 'PUBLISHED';

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  version: number;
  status: MinutesStatus;
  title: string;
  date: string;
  location: string;
  chair: string;
  secretary: string;
  attendees: Array<{ name: string; role: string; organization?: string }>;
  apologies: Array<{ name: string; role: string }>;
  executive_summary: string;
  agenda_proceedings: Array<{
    agenda_item_id: string;
    agenda_title: string;
    discussion_summary: string;
    key_findings: string[];
  }>;
  decisions: Array<{ code: string; title: string; authority: string; approved_by?: string }>;
  actions: Array<{ id: string; action_title: string; owner: string; due_date: string }>;
  commitments: Array<{ title: string; party: string; deadline: string }>;
  risks_and_issues: Array<{ title: string; severity: string; mitigation: string }>;
  procurement_clarifications?: ProcurementClarification[];
  next_meeting_notes?: string;
  version_lock_hash?: string;
  approved_by_chair?: string;
  approved_at?: string;
  published_at?: string;
  audit_events: Array<{ action: string; actor: string; timestamp: string; note?: string }>;
  created_at: string;
  updated_at: string;
}

export interface EvidenceRecord {
  id: string;
  meeting_id?: string;
  evidence_type: 'TRANSCRIPT' | 'PROJECT_DOC' | 'SUPPLIER_RECORD' | 'PREVIOUS_MEETING' | 'STATUTORY_FILING';
  title: string;
  date_label: string;
  quote: string;
  source_ref: string;
  entity_tag: string;
  category_tag: string;
  confidence: number;
}

export interface ConversationMemoryItem {
  id: string;
  meeting_id?: string;
  title: string;
  date_label: string;
  decisions_count: number;
  actions_count: number;
  risks_count: number;
  tags: string[];
}

export interface RecurringTheme {
  theme: string;
  mentions: number;
}

export interface UnresolvedCommitment {
  commitment: string;
  owner: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: string[];
  suggested_actions?: string[];
  evidence_ref?: string;
}

export interface MeetingNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: 'ACTION_ASSIGNED' | 'DEADLINE_IMMINENT' | 'OVERDUE_ESCALATION' | 'DECISION_REQUIRES_APPROVAL' | 'MINUTES_READY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  link?: string;
  read: boolean;
  created_at: string;
}

export type AttendanceStatus = ParticipantAttendance;

export interface AuditLedgerEntry {
  id: string;
  event_type:
    | 'CREATE'
    | 'EDIT'
    | 'DELETE'
    | 'APPROVE'
    | 'REJECT'
    | 'ASSIGN'
    | 'PUBLISH'
    | 'EXPORT'
    | 'ESCALATE'
    | 'LINK'
    | 'START'
    | 'PAUSE'
    | 'RESUME'
    | 'END'
    | 'PARTICIPANT_CHANGE'
    | 'AGENDA_CHANGE'
    | 'DOCUMENT_ATTACH'
    | 'DOCUMENT_DETACH'
    | 'AUTH_FAILURE'
    | string;
  entity_type: 'MEETING' | 'DECISION' | 'ACTION' | 'MINUTES' | 'SIGNAL' | 'COMMITMENT' | 'RISK' | string;
  entity_id: string;
  actor: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface MeetingIntelligenceOverview {
  next_meeting: MeetingEntity;
  all_meetings: MeetingEntity[];
  live_signals: DetectedIntelligenceItem[];
  transcript_segments: TranscriptSegment[];
  evidence_list: EvidenceRecord[];
  memory_timeline: ConversationMemoryItem[];
  recurring_themes: RecurringTheme[];
  unresolved_commitments: UnresolvedCommitment[];
  action_control: {
    total: number;
    at_risk: number;
    overdue: number;
    items: ActionControlItem[];
  };
  decision_register: {
    total: number;
    items: DecisionRecord[];
  };
  commitments: CommitmentRecord[];
  risks: RiskItem[];
  procurement_clarifications: ProcurementClarification[];
  active_minutes?: MeetingMinutes;
  notifications: MeetingNotification[];
  today_intelligence: {
    decisions: number;
    actions: number;
    risks: number;
    follow_ups: number;
    top_signal: {
      text: string;
      confidence: string;
      references: number;
    };
  };
  recent_transcript: {
    timestamp_offset: string;
    speaker: string;
    text: string;
    classification: string;
  };
  copilot_thread: CopilotMessage[];
}
