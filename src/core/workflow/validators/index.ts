/**
 * Enterprise Workflow Orchestrator (EWO) — Validation Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowDefinition, WorkflowNode } from '../types';

export class WorkflowValidator {
  public static validateDefinition(definition: WorkflowDefinition): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!definition.id) {
      errors.push('Workflow definition must have a unique ID.');
    }

    if (!definition.metadata || !definition.metadata.name) {
      errors.push('Workflow definition must specify a name in metadata.');
    }

    if (!definition.metadata || !definition.metadata.version) {
      errors.push('Workflow definition must specify a semver version.');
    }

    if (!definition.nodes || definition.nodes.length === 0) {
      errors.push('Workflow definition must contain at least one node.');
    } else {
      const nodeIds = new Set<string>();
      for (const node of definition.nodes) {
        if (!node.id) {
          errors.push('All workflow nodes must have a unique ID.');
        } else {
          if (nodeIds.has(node.id)) {
            errors.push(`Duplicate node ID found: "${node.id}".`);
          }
          nodeIds.add(node.id);
        }

        if (!node.name) {
          errors.push(`Node "${node.id || 'unknown'}" is missing a descriptive name.`);
        }

        if (!node.action) {
          errors.push(`Node "${node.id || 'unknown'}" is missing an action function.`);
        }

        // Validate dependencies
        if (node.dependencies) {
          for (const dep of node.dependencies) {
            if (!dep.nodeId) {
              errors.push(`Node "${node.id}" has an empty dependency specification.`);
            }
          }
        }
      }

      // Check for dangling dependencies (referencing nodes not in definition)
      for (const node of definition.nodes) {
        if (node.dependencies) {
          for (const dep of node.dependencies) {
            if (dep.nodeId && !nodeIds.has(dep.nodeId)) {
              errors.push(`Node "${node.id}" has a dependency on non-existent node "${dep.nodeId}".`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public static validateNodePolicy(node: WorkflowNode): string[] {
    const errors: string[] = [];
    if (node.policy) {
      const p = node.policy;
      if (p.timeoutMs !== undefined && p.timeoutMs <= 0) {
        errors.push(`Node "${node.id}" policy has an invalid non-positive timeoutMs.`);
      }
      if (p.retryPolicy) {
        if (p.retryPolicy.maxAttempts <= 0) {
          errors.push(`Node "${node.id}" retry policy has invalid maxAttempts <= 0.`);
        }
        if (p.retryPolicy.baseDelayMs < 0) {
          errors.push(`Node "${node.id}" retry policy has invalid negative baseDelayMs.`);
        }
      }
    }
    return errors;
  }
}
