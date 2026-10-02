export const AI_PROVIDER_NOT_CONFIGURED = 'AI_PROVIDER_NOT_CONFIGURED';

export type MeetingRecordingStatus =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'READY'
  | 'RECORDING'
  | 'PAUSED'
  | 'STOPPING'
  | 'UPLOADING'
  | 'STORED'
  | 'FAILED'
  | 'UNAVAILABLE';

export interface MeetingKernelContract {
  meetingId: string;
  tenantId: string;
  title: string;
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  updatedAt?: string;
}

export interface MeetingRecordingContract {
  id: string;
  meetingId: string;
  tenantId: string;
  status: MeetingRecordingStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  durationMs?: number;
  mediaType: 'audio/webm' | 'audio/mp4' | 'video/webm';
  codec?: string;
  storageRef?: string;
  checksum?: string;
  size?: number;
  createdBy?: string;
  version?: string;
}

export interface MeetingTranscriptionContract {
  id: string;
  meetingId: string;
  tenantId: string;
  speaker: string;
  speakerRole?: string;
  timestampLabel: string;
  startSeconds: number;
  text: string;
  confidence: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'CRITICAL' | 'RISK';
  isKeyPoint?: boolean;
  createdAt: string;
}

export interface MeetingEvidenceContract {
  id: string;
  meetingId: string;
  tenantId: string;
  evidenceType: 'TRANSCRIPT' | 'PROJECT_DOC' | 'SUPPLIER_RECORD' | 'PREVIOUS_MEETING' | 'STATUTORY_FILING';
  title: string;
  dateLabel: string;
  quote: string;
  sourceRef: string;
  entityTag: string;
  categoryTag: string;
  confidence: number;
}

export interface MeetingWorkflowContract {
  workflowId: string;
  meetingId: string;
  tenantId: string;
  state: string;
  nextStep?: string;
  actor?: string;
  evidenceRef?: string;
  updatedAt: string;
}

export interface MeetingAIContextContract {
  contextId: string;
  meetingId: string;
  tenantId: string;
  providerState: 'READY' | 'AI_PROVIDER_NOT_CONFIGURED' | 'DEGRADED';
  selectedModel?: string;
  groundedContext: string[];
  updatedAt: string;
}

export interface MeetingTenantAccessContract {
  tenantId: string;
  role: string;
  canView: boolean;
  canEdit: boolean;
  canManageParticipants: boolean;
  canAttachDocuments: boolean;
  canApprove: boolean;
}

export interface MeetingMediaAccessContract {
  meetingId: string;
  tenantId: string;
  access: 'GRANTED' | 'PENDING' | 'DENIED' | 'UNAVAILABLE';
  mediaType: 'audio' | 'video' | 'screen';
  source?: string;
}
