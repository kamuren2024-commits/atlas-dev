/**
 * Enterprise Workflow Orchestrator (EWO) — Workflow Registry
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowDefinition } from '../types';
import { IWorkflowRegistry } from '../contracts';

export class WorkflowRegistry implements IWorkflowRegistry {
  private static instance: WorkflowRegistry;
  private definitions = new Map<string, Map<string, WorkflowDefinition>>(); // id -> version -> definition

  private constructor() {}

  public static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  public register(definition: WorkflowDefinition): void {
    if (!definition.id) {
      throw new Error('Workflow Definition ID must be provided.');
    }
    const version = definition.metadata.version || '1.0.0';

    if (!this.definitions.has(definition.id)) {
      this.definitions.set(definition.id, new Map<string, WorkflowDefinition>());
    }

    const versionMap = this.definitions.get(definition.id)!;
    versionMap.set(version, definition);
  }

  public get(id: string, version?: string): WorkflowDefinition | undefined {
    const versionMap = this.definitions.get(id);
    if (!versionMap) return undefined;

    if (version) {
      return versionMap.get(version);
    }

    // Default to the highest semver version or the single registered version
    const versions = Array.from(versionMap.keys()).sort((a, b) => b.localeCompare(a));
    const targetVersion = versions[0];
    return versionMap.get(targetVersion);
  }

  public list(): WorkflowDefinition[] {
    const all: WorkflowDefinition[] = [];
    this.definitions.forEach((versionMap) => {
      versionMap.forEach((def) => {
        all.push(def);
      });
    });
    return all;
  }

  public deregister(id: string): boolean {
    return this.definitions.delete(id);
  }

  public clear(): void {
    this.definitions.clear();
  }
}
