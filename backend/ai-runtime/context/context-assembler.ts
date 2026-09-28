import { ExecutionContext } from '../types';
import { MemoryRuntime } from '../memory/memory-runtime';

export class ContextAssembler {
  static async assemble(basePrompt: string, variables: Record<string, any>, context: ExecutionContext): Promise<string> {
    let assembled = basePrompt;

    // 1. Inject Variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      assembled = assembled.split(placeholder).join(String(value));
    }

    // 2. Inject Semantic Memory (RAG)
    if (context.tenantId) {
      const memories = await MemoryRuntime.retrieve(context.tenantId, context.workflowId || 'global', basePrompt, 5);
      if (memories.length > 0) {
        const memoryContext = memories.map(m => `[Memory]: ${m.content}`).join('\n');
        assembled = `${assembled}\n\nRelevant Contextual Memory:\n${memoryContext}`;
      }
    }

    // 3. Inject Runtime Metadata
    const metadata = `
[Runtime Context]
User: ${context.userId || 'Anonymous'}
Tenant: ${context.tenantId || 'Default'}
Workflow: ${context.workflowId || 'None'}
Module: ${context.moduleId || 'Unknown'}
Correlation: ${context.correlationId || 'N/A'}
Timestamp: ${new Date().toISOString()}
`.trim();

    return `${metadata}\n\n${assembled}`;
  }
}
