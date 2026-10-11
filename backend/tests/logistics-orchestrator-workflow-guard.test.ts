import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { DatabaseCore } from '../database/db-core';
import {
  LogisticsAgentOrchestrator,
  LogisticsWorkflowCapabilityUnavailableError,
} from '../domains/logistics/agents/orchestrator';

test('orchestrator fails closed for workflows without authoritative stock and delivery capabilities', async t => {
  const calls: string[] = [];
  const database = {
    all: async () => {
      calls.push('all');
      return [];
    },
    get: async () => {
      calls.push('get');
      return undefined;
    },
    run: async () => {
      calls.push('run');
      return { changes: 0, lastID: 0 };
    },
  } as unknown as DatabaseCore;
  const orchestrator = LogisticsAgentOrchestrator.getInstance(database);
  const user = { id: 'trusted-actor', name: 'Trusted Actor', role: 'Director Grid Logistics' };

  for (const workflowId of ['STOCK_SHORTAGE_RECONCILIATION', 'DELIVERY_VERIFICATION']) {
    await t.test(workflowId, async () => {
      await assert.rejects(
        orchestrator.executeWorkflow(
          workflowId,
          'entity-1',
          { shortageKg: 1200, verified: true, actor: 'forged-client-actor', approved: true },
          user,
          'ketraco'
        ),
        error => error instanceof LogisticsWorkflowCapabilityUnavailableError
          && error.message.includes(workflowId)
      );
      assert.deepEqual(calls, [], 'unavailable workflows must not read, mutate, or emit via persistence');
    });
  }
});
