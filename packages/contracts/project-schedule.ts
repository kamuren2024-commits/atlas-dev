export type ScheduleRecordAuthority = 'ATLAS_PERSISTED_NOT_VERIFIED';

export interface ProjectMilestone {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  description: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED';
  baselineDate: string | null;
  currentDate: string | null;
  forecastDate: string | null;
  actualDate: string | null;
  ownerId: string | null;
  version: number;
  source: string;
  authority: ScheduleRecordAuthority;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectMilestoneForecastCommand {
  projectId: string;
  milestoneId: string;
  forecastDate: string;
  reason: string;
  expectedVersion: number;
  idempotencyKey: string;
}

export interface ProjectMilestoneUpdatedEvent {
  id: string;
  eventType: 'ProjectMilestoneUpdated';
  category: 'PROJECT';
  timestamp: string;
  sourceId: 'ATLAS_PROJECT_SCHEDULE';
  severity: 'INFO';
  status: 'PENDING';
  tenantId: string;
  projectId: string;
  aggregateType: 'PROJECT_MILESTONE';
  aggregateId: string;
  actorId: string;
  correlationId: string;
  causationId: string;
  version: number;
  previousState: ProjectMilestone;
  resultingState: ProjectMilestone;
  reason: string;
  tags: string[];
  metadata: Record<string, string | number>;
}
