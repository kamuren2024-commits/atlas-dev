import type { DatabaseCore } from '../../database/db-core';
import type { ProjectRecord } from './project-contract';
import { ProjectRepository } from './project-repository';

export class ProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  public static create(db: DatabaseCore): ProjectService {
    return new ProjectService(new ProjectRepository(db));
  }

  public async getProject(tenantId: string, projectId: string): Promise<ProjectRecord | null> {
    return this.repository.getByTenantAndProjectId(tenantId, projectId);
  }

  public async upsertProject(project: ProjectRecord): Promise<ProjectRecord> {
    await this.repository.upsertProject(project);
    return project;
  }
}
