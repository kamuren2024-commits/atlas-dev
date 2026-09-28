/**
 * Enterprise Agent Framework (EAF) — Permissions Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentPermission, AgentPermissionType } from '../types';

export class AgentPermissionEngine {
  /**
   * Enforces security constraints to ensure the agent is authorized.
   */
  public static isAuthorized(
    permissions: AgentPermission[],
    resource: string,
    requiredType: AgentPermissionType
  ): boolean {
    // If empty permissions, fail safe
    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Check exact or wildcard match
    return permissions.some((permission) => {
      if (!permission.authorized) return false;

      const typeMatches = permission.type === requiredType;
      
      const resourceMatches =
        permission.resource === '*' ||
        permission.resource === resource ||
        (permission.resource.endsWith('*') &&
          resource.startsWith(permission.resource.slice(0, -1)));

      return typeMatches && resourceMatches;
    });
  }
}
