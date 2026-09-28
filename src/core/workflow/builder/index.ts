/**
 * Enterprise Workflow Orchestrator (EWO) — Fluent Immutable Builder
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowDefinition, WorkflowNode, WorkflowPolicy, WorkflowMetadata } from '../types';
import { IWorkflowBuilder } from '../contracts';
import { WorkflowRegistry } from '../registry';

export class WorkflowBuilder implements IWorkflowBuilder {
  private readonly _id: string;
  private readonly _metadata: WorkflowMetadata;
  private readonly _nodes: WorkflowNode[];
  private readonly _globalPolicy?: WorkflowPolicy;

  constructor(
    id = '',
    metadata: WorkflowMetadata = { name: '', description: '', version: '1.0.0' },
    nodes: WorkflowNode[] = [],
    globalPolicy?: WorkflowPolicy
  ) {
    this._id = id;
    this._metadata = { ...metadata };
    this._nodes = [...nodes];
    this._globalPolicy = globalPolicy ? { ...globalPolicy } : undefined;
  }

  public setId(id: string): this {
    return new WorkflowBuilder(id, this._metadata, this._nodes, this._globalPolicy) as any;
  }

  public setName(name: string): this {
    const updatedMeta = { ...this._metadata, name };
    return new WorkflowBuilder(this._id, updatedMeta, this._nodes, this._globalPolicy) as any;
  }

  public setDescription(description: string): this {
    const updatedMeta = { ...this._metadata, description };
    return new WorkflowBuilder(this._id, updatedMeta, this._nodes, this._globalPolicy) as any;
  }

  public setVersion(version: string): this {
    const updatedMeta = { ...this._metadata, version };
    return new WorkflowBuilder(this._id, updatedMeta, this._nodes, this._globalPolicy) as any;
  }

  public setMetadata(metadata: Partial<WorkflowMetadata>): this {
    const updatedMeta = { ...this._metadata, ...metadata };
    return new WorkflowBuilder(this._id, updatedMeta, this._nodes, this._globalPolicy) as any;
  }

  public addNode(node: WorkflowNode): this {
    const updatedNodes = [...this._nodes, node];
    return new WorkflowBuilder(this._id, this._metadata, updatedNodes, this._globalPolicy) as any;
  }

  public setGlobalPolicy(policy: WorkflowPolicy): this {
    return new WorkflowBuilder(this._id, this._metadata, this._nodes, policy) as any;
  }

  public build(): WorkflowDefinition {
    if (!this._id) {
      throw new Error('Workflow Definition Build Error: missing unique ID');
    }
    if (!this._metadata.name) {
      throw new Error('Workflow Definition Build Error: missing metadata.name');
    }
    return {
      id: this._id,
      metadata: this._metadata,
      nodes: this._nodes,
      globalPolicy: this._globalPolicy
    };
  }

  public register(): WorkflowDefinition {
    const definition = this.build();
    WorkflowRegistry.getInstance().register(definition);
    return definition;
  }
}
