import type { DatabaseCore } from '../../database/db-core';
import type { ProjectRecord } from './project-contract';

interface ProjectRow {
  id: string;
  tenant_id: string;
  project_code: string | null;
  name: string | null;
  description: string | null;
  project_type: string | null;
  category: string | null;
  lifecycle_stage: string | null;
  status: string | null;
  owner: string | null;
  project_manager: string | null;
  location: string | null;
  planned_start: string | null;
  planned_completion: string | null;
  forecast_completion: string | null;
  actual_completion: string | null;
  created_at: string | null;
  updated_at: string | null;
  version: number | null;
  source_system: string | null;
  authority: string | null;
  freshness: string | null;
  retrieved_at: string | null;
  verification_status: string | null;
  data_source_state: string | null;
}

export class ProjectRepository {
  constructor(private readonly db: DatabaseCore) {}

  public async getByTenantAndProjectId(tenantId: string, projectId: string): Promise<ProjectRecord | null> {
    const row = await this.db.get<ProjectRow>(
      `SELECT * FROM project_supply_project WHERE tenant_id = ? AND id = ? LIMIT 1`,
      [tenantId, projectId],
    );
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      tenantId: row.tenant_id,
      projectCode: row.project_code,
      name: row.name,
      description: row.description,
      projectType: row.project_type,
      category: row.category,
      lifecycleStage: row.lifecycle_stage,
      status: row.status,
      owner: row.owner,
      projectManager: row.project_manager,
      location: row.location,
      plannedStart: row.planned_start,
      plannedCompletion: row.planned_completion,
      forecastCompletion: row.forecast_completion,
      actualCompletion: row.actual_completion,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      version: row.version,
      provenance: {
        source: row.source_system ?? 'project_supply_project',
        authority: (row.authority as ProjectRecord['provenance']['authority']) ?? 'UNAVAILABLE',
        freshness: (row.freshness as ProjectRecord['provenance']['freshness']) ?? 'UNKNOWN',
        retrievedAt: row.retrieved_at ?? new Date().toISOString(),
        verificationState: (row.verification_status as ProjectRecord['provenance']['verificationState']) ?? 'NOT_VERIFIED',
        dataSourceState: (row.data_source_state as ProjectRecord['provenance']['dataSourceState']) ?? 'NOT_CONNECTED',
      },
    };
  }

  public async upsertProject(project: ProjectRecord): Promise<void> {
    await this.db.run(
      `INSERT INTO project_supply_project (
        id, tenant_id, project_code, name, description, project_type, category,
        lifecycle_stage, status, owner, project_manager, location, planned_start,
        planned_completion, forecast_completion, actual_completion, created_at,
        updated_at, version, source_system, authority, freshness, retrieved_at,
        verification_status, data_source_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        tenant_id = excluded.tenant_id,
        project_code = excluded.project_code,
        name = excluded.name,
        description = excluded.description,
        project_type = excluded.project_type,
        category = excluded.category,
        lifecycle_stage = excluded.lifecycle_stage,
        status = excluded.status,
        owner = excluded.owner,
        project_manager = excluded.project_manager,
        location = excluded.location,
        planned_start = excluded.planned_start,
        planned_completion = excluded.planned_completion,
        forecast_completion = excluded.forecast_completion,
        actual_completion = excluded.actual_completion,
        updated_at = excluded.updated_at,
        version = excluded.version,
        source_system = excluded.source_system,
        authority = excluded.authority,
        freshness = excluded.freshness,
        retrieved_at = excluded.retrieved_at,
        verification_status = excluded.verification_status,
        data_source_state = excluded.data_source_state`,
      [
        project.id,
        project.tenantId,
        project.projectCode,
        project.name,
        project.description,
        project.projectType,
        project.category,
        project.lifecycleStage,
        project.status,
        project.owner,
        project.projectManager,
        project.location,
        project.plannedStart,
        project.plannedCompletion,
        project.forecastCompletion,
        project.actualCompletion,
        project.createdAt ?? new Date().toISOString(),
        project.updatedAt ?? new Date().toISOString(),
        project.version ?? 1,
        project.provenance.source,
        project.provenance.authority,
        project.provenance.freshness,
        project.provenance.retrievedAt,
        project.provenance.verificationState,
        project.provenance.dataSourceState,
      ],
    );
  }
}
