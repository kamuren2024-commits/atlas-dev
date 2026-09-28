/**
 * Salience Atlas Tool Runtime
 * Bridged to the Canonical Atlas Tool Registry
 */

import { AtlasToolRegistry } from '../../tools/atlas-tool-registry';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<any>;
}

export class ToolRuntime {
  private static registry = AtlasToolRegistry.getInstance();
  private static legacyTools: Map<string, ToolDefinition> = new Map();

  static register(tool: ToolDefinition) {
    this.legacyTools.set(tool.name, tool);
    // Register into canonical registry
    this.registry.registerTool({
      toolId: tool.name,
      name: tool.name,
      version: '1.0.0',
      description: tool.description,
      inputSchema: tool.parameters || { type: 'object' },
      outputSchema: { type: 'object' },
      requiredPermissions: ['*'],
      ontologyScope: ['*'],
      riskLevel: 'LOW',
      idempotency: true,
      timeoutMs: 10000,
      retryPolicy: { maxRetries: 1, backoffMs: 200 },
      auditPolicy: 'ON_ERROR',
      execute: async (args) => {
        const start = Date.now();
        const res = await tool.execute(args);
        return {
          toolId: tool.name,
          status: 'SUCCESS',
          result: res,
          executionTimeMs: Date.now() - start,
        };
      },
    });
  }

  static async execute(name: string, args: any, context?: any): Promise<any> {
    const ctx = context || {
      agentId: 'atlas-legacy-invoker',
      executionId: `exec_${Date.now()}`,
      tenantId: 'ketraco',
      actorRoles: ['ADMIN', '*'],
      autonomyLevel: 5,
    };

    const res = await this.registry.executeTool(name, args, ctx);
    if (res.status === 'FAILED' || res.status === 'REJECTED') {
      throw new Error(res.error || `Tool ${name} failed with status ${res.status}`);
    }
    return res.result;
  }

  static getToolDefinitions(): any[] {
    return this.registry.listTools().map(t => ({
      name: t.toolId,
      description: t.description,
      parameters: t.inputSchema,
    }));
  }
}
