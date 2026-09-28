/**
 * Enterprise Workflow Orchestrator (EWO) — Workflow DAG and Graph Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowDefinition, WorkflowNode, WorkflowExecutionContext } from '../types';
import { IWorkflowGraphEngine } from '../contracts';

export class WorkflowGraphEngine implements IWorkflowGraphEngine {
  /**
   * Performs Kahn's algorithm or DFS to detect cycles in the workflow DAG.
   */
  public validateDAG(definition: WorkflowDefinition): boolean {
    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize degrees
    for (const node of definition.nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    // Build graph edges from dependencies: parent -> child
    // Since node.dependencies specifies which nodes 'id' depends on:
    // parent is dep.nodeId, child is node.id
    for (const node of definition.nodes) {
      for (const dep of node.dependencies) {
        // Ensure dependency node actually exists in the definition
        if (!inDegree.has(dep.nodeId)) {
          throw new Error(`Workflow node "${node.id}" has an invalid dependency on non-existent node "${dep.nodeId}"`);
        }
        adjList.get(dep.nodeId)!.push(node.id);
        inDegree.set(node.id, inDegree.get(node.id)! + 1);
      }
    }

    // Queue of nodes with in-degree 0
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    let visitedCount = 0;
    while (queue.length > 0) {
      const u = queue.shift()!;
      visitedCount++;

      const neighbors = adjList.get(u) || [];
      for (const v of neighbors) {
        const d = inDegree.get(v)! - 1;
        inDegree.set(v, d);
        if (d === 0) {
          queue.push(v);
        }
      }
    }

    return visitedCount === definition.nodes.length;
  }

  /**
   * Groups nodes into parallel execution tiers (buckets of nodes that can run concurrently).
   * Supports fan-out / fan-in structures.
   */
  public resolveExecutionOrder(definition: WorkflowDefinition): string[][] {
    if (!this.validateDAG(definition)) {
      throw new Error('Cyclic dependency detected in workflow DAG. Cannot resolve execution order.');
    }

    const tiers: string[][] = [];
    const remainingNodes = new Set(definition.nodes.map((n) => n.id));
    const completedNodes = new Set<string>();

    while (remainingNodes.size > 0) {
      const currentTier: string[] = [];

      for (const nodeId of remainingNodes) {
        const node = definition.nodes.find((n) => n.id === nodeId)!;
        const allDepsSatisfied = node.dependencies.every((dep) => completedNodes.has(dep.nodeId));

        if (allDepsSatisfied) {
          currentTier.push(nodeId);
        }
      }

      if (currentTier.length === 0) {
        // This shouldn't happen if validateDAG passes, but safety first
        throw new Error('Deadlock or unresolvable dependencies in DAG engine.');
      }

      tiers.push(currentTier);
      for (const id of currentTier) {
        remainingNodes.delete(id);
        completedNodes.add(id);
      }
    }

    return tiers;
  }

  /**
   * Helper to check if a specific node's dependencies are satisfied, taking conditional dependency paths into account.
   */
  public async isNodeRunnable(
    node: WorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<boolean> {
    for (const dep of node.dependencies) {
      const stepExecution = context.stepExecutions.get(dep.nodeId);
      if (!stepExecution) {
        return false;
      }

      // If dependency is sequential, it must have completed successfully
      if (dep.type === 'SEQUENTIAL' && stepExecution.state !== 'COMPLETED') {
        return false;
      }

      // If conditional, evaluate user function
      if (dep.type === 'CONDITIONAL' && dep.condition) {
        const passed = await Promise.resolve(dep.condition(context));
        if (!passed) {
          return false;
        }
      }
    }
    return true;
  }
}
