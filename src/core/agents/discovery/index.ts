/**
 * Enterprise Agent Framework (EAF) — Discovery Service
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { EnterpriseAgent, IAgentDiscoveryService } from '../contracts';
import { AgentRegistry } from '../registry';
import { AgentPermissionType } from '../types';

export class AgentDiscoveryService implements IAgentDiscoveryService {
  private registry: AgentRegistry;

  constructor() {
    this.registry = AgentRegistry.getInstance();
  }

  public findCapableOf(capability: string): EnterpriseAgent[] {
    const capsUpper = capability.toUpperCase();
    return this.registry.list().filter((agent) => {
      const config = agent.getConfiguration();
      return config.capabilities.some((c) => c.toUpperCase() === capsUpper);
    });
  }

  public findWithPermissions(resource: string, permissionType: AgentPermissionType): EnterpriseAgent[] {
    return this.registry.list().filter((agent) => {
      const config = agent.getConfiguration();
      return config.permissions.some(
        (p) => p.resource === resource && p.type === permissionType && p.authorized
      );
    });
  }

  public query(filter: (agent: EnterpriseAgent) => boolean): EnterpriseAgent[] {
    return this.registry.list().filter(filter);
  }
}
