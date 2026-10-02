import { createHash, randomUUID } from 'node:crypto';
import type {
  ProjectMilestone,
  ProjectMilestoneUpdatedEvent,
  UpdateProjectMilestoneForecastCommand,
} from '../../../packages/contracts/project-schedule';
import type { DatabaseCore } from '../../database/db-core';

interface MilestoneRow {
  id: string;
  tenant_id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: ProjectMilestone['status'];
  baseline_date: string | null;
  current_date: string | null;
  forecast_date: string | null;
  actual_date: string | null;
  owner_id: string | null;
  version: number;
  source: string;
  authority: ProjectMilestone['authority'];
  created_at: string;
  updated_at: string;
}

export class ProjectMilestoneCommandError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ProjectMilestoneCommandError';
  }
}

export interface MilestoneCommandContext {
  actorId: string;
  actorRole: string;
  tenantId: string;
  correlationId: string;
}

export interface MilestoneCommandResult {
  milestone: ProjectMilestone;
  event: ProjectMilestoneUpdatedEvent;
  auditId: string;
  replayed: boolean;
}

function toMilestone(row: MilestoneRow): ProjectMilestone {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    status: row.status,
    baselineDate: row.baseline_date,
    currentDate: row.current_date,
    forecastDate: row.forecast_date,
    actualDate: row.actual_date,
    ownerId: row.owner_id,
    version: Number(row.version),
    source: row.source,
    authority: row.authority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateCommand(command: UpdateProjectMilestoneForecastCommand): void {
  if (!command.projectId.trim() || !command.milestoneId.trim()) {
    throw new ProjectMilestoneCommandError(400, 'INVALID_TARGET', 'Project ID and milestone ID are required.');
  }
  const forecastTimestamp = /^\d{4}-\d{2}-\d{2}$/.test(command.forecastDate)
    ? Date.parse(`${command.forecastDate}T00:00:00.000Z`)
    : Number.NaN;
  if (!Number.isFinite(forecastTimestamp) ||
      new Date(forecastTimestamp).toISOString().slice(0, 10) !== command.forecastDate) {
    throw new ProjectMilestoneCommandError(422, 'INVALID_FORECAST_DATE', 'Forecast date must be a valid ISO calendar date (YYYY-MM-DD).');
  }
  if (typeof command.reason !== 'string' || command.reason.trim().length < 5 || command.reason.trim().length > 1000) {
    throw new ProjectMilestoneCommandError(422, 'REASON_REQUIRED', 'Provide a reason between 5 and 1000 characters.');
  }
  if (!Number.isSafeInteger(command.expectedVersion) || command.expectedVersion < 1) {
    throw new ProjectMilestoneCommandError(422, 'INVALID_VERSION', 'Expected version must be a positive integer.');
  }
  if (typeof command.idempotencyKey !== 'string' || command.idempotencyKey.trim().length < 8 || command.idempotencyKey.trim().length > 200) {
    throw new ProjectMilestoneCommandError(400, 'INVALID_IDEMPOTENCY_KEY', 'Idempotency-Key must contain between 8 and 200 characters.');
  }
}

export class ProjectMilestoneService {
  constructor(private readonly db: DatabaseCore) {}

  public async list(tenantId: string, projectId: string, limit: number, offset: number): Promise<ProjectMilestone[]> {
    const rows = await this.db.all<MilestoneRow>(
      `SELECT * FROM schedule_milestones
        WHERE tenant_id = ? AND project_id = ?
        ORDER BY baseline_date ASC, id ASC
        LIMIT ? OFFSET ?`,
      [tenantId, projectId, limit, offset],
    );
    return rows.map(toMilestone);
  }

  public async get(tenantId: string, projectId: string, milestoneId: string): Promise<ProjectMilestone | null> {
    const row = await this.db.get<MilestoneRow>(
      `SELECT * FROM schedule_milestones
        WHERE tenant_id = ? AND project_id = ? AND id = ? LIMIT 1`,
      [tenantId, projectId, milestoneId],
    );
    return row ? toMilestone(row) : null;
  }

  public async updateForecast(
    command: UpdateProjectMilestoneForecastCommand,
    context: MilestoneCommandContext,
  ): Promise<MilestoneCommandResult> {
    validateCommand(command);
    if (command.projectId !== command.projectId.trim() || command.milestoneId !== command.milestoneId.trim()) {
      throw new ProjectMilestoneCommandError(422, 'INVALID_TARGET', 'Project and milestone IDs must not contain surrounding whitespace.');
    }

    const operation = 'UpdateProjectMilestoneForecast';
    const requestHash = createHash('sha256').update(JSON.stringify({
      projectId: command.projectId,
      milestoneId: command.milestoneId,
      forecastDate: command.forecastDate,
      reason: command.reason.trim(),
      expectedVersion: command.expectedVersion,
    })).digest('hex');

    return this.db.withTransaction(async () => {
      const project = await this.db.get<{ id: string }>(
        'SELECT id FROM project_supply_project WHERE tenant_id = ? AND id = ?',
        [context.tenantId, command.projectId],
      );
      if (!project) {
        throw new ProjectMilestoneCommandError(404, 'PROJECT_NOT_FOUND', 'Project was not found in the authenticated tenant.');
      }

      const prior = await this.db.get<{ request_hash: string; result_json: string }>(
        `SELECT request_hash, result_json FROM atlas_command_idempotency
          WHERE tenant_id = ? AND actor_id = ? AND operation = ? AND idempotency_key = ?`,
        [context.tenantId, context.actorId, operation, command.idempotencyKey],
      );
      if (prior) {
        if (prior.request_hash !== requestHash) {
          throw new ProjectMilestoneCommandError(409, 'IDEMPOTENCY_KEY_REUSED', 'The idempotency key was already used for a different command.');
        }
        return { ...(JSON.parse(prior.result_json) as Omit<MilestoneCommandResult, 'replayed'>), replayed: true };
      }

      const row = await this.db.get<MilestoneRow>(
        `SELECT * FROM schedule_milestones
          WHERE tenant_id = ? AND project_id = ? AND id = ?`,
        [context.tenantId, command.projectId, command.milestoneId],
      );
      if (!row) {
        throw new ProjectMilestoneCommandError(404, 'MILESTONE_NOT_FOUND', 'Milestone was not found within this project.');
      }
      const previousState = toMilestone(row);
      if (previousState.version !== command.expectedVersion) {
        throw new ProjectMilestoneCommandError(409, 'VERSION_CONFLICT', 'Milestone changed after it was loaded; refresh before retrying.', {
          expectedVersion: command.expectedVersion,
          currentVersion: previousState.version,
          currentState: previousState,
        });
      }
      if (previousState.status === 'COMPLETED' || previousState.actualDate) {
        throw new ProjectMilestoneCommandError(409, 'MILESTONE_CLOSED', 'A completed milestone forecast cannot be changed.');
      }

      const now = new Date().toISOString();
      const resultingState: ProjectMilestone = {
        ...previousState,
        forecastDate: command.forecastDate,
        version: previousState.version + 1,
        updatedAt: now,
      };
      const update = await this.db.run(
        `UPDATE schedule_milestones
            SET forecast_date = ?, version = ?, updated_at = ?
          WHERE tenant_id = ? AND project_id = ? AND id = ? AND version = ?`,
        [resultingState.forecastDate, resultingState.version, now, context.tenantId,
          command.projectId, command.milestoneId, command.expectedVersion],
      );
      if (update.changes !== 1) {
        throw new ProjectMilestoneCommandError(409, 'VERSION_CONFLICT', 'Milestone changed concurrently; refresh before retrying.');
      }

      const eventId = randomUUID();
      const auditId = randomUUID();
      const event: ProjectMilestoneUpdatedEvent = {
        id: eventId,
        eventType: 'ProjectMilestoneUpdated',
        category: 'PROJECT',
        timestamp: now,
        sourceId: 'ATLAS_PROJECT_SCHEDULE',
        severity: 'INFO',
        status: 'PENDING',
        tenantId: context.tenantId,
        projectId: command.projectId,
        aggregateType: 'PROJECT_MILESTONE',
        aggregateId: command.milestoneId,
        actorId: context.actorId,
        correlationId: context.correlationId,
        causationId: context.correlationId,
        version: resultingState.version,
        previousState,
        resultingState,
        reason: command.reason.trim(),
        tags: ['project', 'schedule', 'milestone'],
        metadata: { command: operation, projectId: command.projectId, milestoneId: command.milestoneId },
      };
      const result = { milestone: resultingState, event, auditId };

      await this.db.run(
        `INSERT INTO atlas_command_audit (
          audit_id, timestamp, actor_id, tenant_id, project_id, entity_type, entity_id,
          action, previous_state_json, resulting_state_json, reason,
          authorization_context_json, correlation_id, command_id, event_id, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [auditId, now, context.actorId, context.tenantId, command.projectId, 'PROJECT_MILESTONE',
          command.milestoneId, operation, JSON.stringify(previousState), JSON.stringify(resultingState),
          command.reason.trim(), JSON.stringify({ role: context.actorRole, permission: 'project:update' }),
          context.correlationId, command.idempotencyKey, eventId, 'PROJECT_360_UI'],
      );
      await this.db.run(
        `INSERT INTO atlas_outbox_events (
          event_id, tenant_id, aggregate_type, aggregate_id, event_type, event_version,
          payload_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, context.tenantId, 'PROJECT_MILESTONE', command.milestoneId,
          event.eventType, resultingState.version, JSON.stringify(event), now],
      );
      await this.db.run(
        `INSERT INTO atlas_command_idempotency (
          tenant_id, actor_id, operation, idempotency_key, request_hash, result_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [context.tenantId, context.actorId, operation, command.idempotencyKey,
          requestHash, JSON.stringify(result), now],
      );
      return { ...result, replayed: false };
    });
  }
}
