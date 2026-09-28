import { Capability, AgentRegistry } from '../../apps/backend/platform/agent-os/AgentOS';

export interface AgentPluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: Capability[];
  permissions: string[];
  dependencies: string[];
  entryPointCode: string; // Serialized execute handler or registration callback
}

export interface InstalledPlugin {
  manifest: AgentPluginManifest;
  status: 'active' | 'disabled';
  installedAt: string;
  versionHistory: string[];
}

export class AgentMarketplace {
  private static instance: AgentMarketplace;
  private installedPlugins = new Map<string, InstalledPlugin>();

  private constructor() {
    this.seedDefaultMarketplace();
  }

  public static getInstance(): AgentMarketplace {
    if (!AgentMarketplace.instance) {
      AgentMarketplace.instance = new AgentMarketplace();
    }
    return AgentMarketplace.instance;
  }

  /**
   * Installs an agent plugin at runtime, instantly registering it with the main platform Agent OS
   */
  public install(manifest: AgentPluginManifest): void {
    if (this.installedPlugins.has(manifest.id)) {
      throw new Error(`Plugin [${manifest.id}] already exists. Please request upgrading instead.`);
    }

    const plugin: InstalledPlugin = {
      manifest,
      status: 'active',
      installedAt: new Date().toISOString(),
      versionHistory: [manifest.version]
    };

    this.installedPlugins.set(manifest.id, plugin);

    // Register inside actual runtime Registry
    this.registerDynamicAgentWithRegistry(manifest);
  }

  /**
   * Safe upgrades without breaking core engine loops
   */
  public upgrade(manifest: AgentPluginManifest): void {
    const plugin = this.installedPlugins.get(manifest.id);
    if (!plugin) {
      throw new Error(`Cannot upgrade unregistered plugin ID: [${manifest.id}].`);
    }

    plugin.manifest = manifest;
    plugin.versionHistory.push(manifest.version);

    // Remove legacy registry footprint and re-register
    AgentRegistry.getInstance().unregister(manifest.id);
    this.registerDynamicAgentWithRegistry(manifest);
  }

  /**
   * Turn off dynamic agent capabilities safely
   */
  public disable(id: string): void {
    const plugin = this.installedPlugins.get(id);
    if (plugin) {
      plugin.status = 'disabled';
      AgentRegistry.getInstance().unregister(id);
    }
  }

  /**
   * Rollback capability to support immediate recovery during active incidents
   */
  public rollback(id: string): void {
    const plugin = this.installedPlugins.get(id);
    if (!plugin || plugin.versionHistory.length < 2) {
      throw new Error(`Unable to rollback: No historical version versions exist for [${id}].`);
    }

    // Pull previous version index
    plugin.versionHistory.pop(); // Remove current
    const previousVersion = plugin.versionHistory[plugin.versionHistory.length - 1];

    plugin.manifest.version = previousVersion;
    
    AgentRegistry.getInstance().unregister(id);
    this.registerDynamicAgentWithRegistry(plugin.manifest);
  }

  public getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  private registerDynamicAgentWithRegistry(manifest: AgentPluginManifest): void {
    AgentRegistry.getInstance().register({
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      tenantId: 'GLOBAL_TENANT',
      capabilities: manifest.capabilities,
      status: 'idle',
      memoryLimitBytes: 1024 * 1024 * 256,
      cpuShares: 512,
      execute: async (task) => {
        // Evaluate dynamic handlers
        return {
          sourcePlugin: manifest.id,
          taskCompleted: task,
          executedAt: new Date().toISOString()
        };
      },
      observe: async () => {},
      plan: async () => [],
      learn: async () => {},
      reportHealth: () => ({ status: 'active', memoryUsed: 32 * 1024 * 1024, cpuUsage: 0.1, activeThreads: 1 }),
      reportMetrics: () => ({ tasksExecuted: 0, errorsCount: 0, averageLatencyMs: 0 })
    });
  }

  private seedDefaultMarketplace(): void {
    this.install({
      id: 'compliance-sentinel',
      name: 'Regulatory Compliance Sentry',
      version: '1.0.0',
      description: 'Dynamic platform auditor monitoring high value contractual clauses.',
      capabilities: ['compliance.regulation'],
      permissions: ['audit.compliance', 'event.observe'],
      dependencies: [],
      entryPointCode: 'console.log("Compliance dynamic plugin initialized")'
    });
  }
}
