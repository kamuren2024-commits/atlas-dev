/**
 * Enterprise Agent Framework (EAF) — Security Integration
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentContext } from '../types';

export class AgentSecurityGuard {
  /**
   * Verifies that the security context associated with the agent is intact.
   */
  public static verifyContext(context: AgentContext, requiredRoles: string[] = []): boolean {
    const sec = context.securityContext;
    if (!sec) {
      // If no security context but we require roles, fail
      return requiredRoles.length === 0;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const roles = sec.roles || [];
    return requiredRoles.some((role) => roles.includes(role));
  }
}
