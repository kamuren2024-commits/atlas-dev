/**
 * Enterprise Memory Fabric (EMF) — Diagnostics & Performance Verification Suite
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryRuntime } from '../runtime';
import { MemoryEventPublisher } from '../events';
import { MemoryGovernanceEngine } from '../governance';
import { MemorySecurityGuard } from '../security';
import { MemoryLifecycleState, MemoryContext, MemoryEntry } from '../types';

export class MemoryDiagnosticSuite {
  public static async runAll(): Promise<boolean> {
    console.log('=== [Enterprise Memory Fabric (EMF) Diagnostics: Initiating Suite] ===');
    let allPassed = true;

    try {
      await this.testProviderRegistration();
      console.log('✔ Test Provider Registration: PASSED');
    } catch (err) {
      console.error('❌ Test Provider Registration: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testLifecycleTransitionsAndEvents();
      console.log('✔ Test Lifecycle Transitions & Events: PASSED');
    } catch (err) {
      console.error('❌ Test Lifecycle Transitions & Events: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testIndexingAndSearchFilters();
      console.log('✔ Test Indexing & Advanced Search Filters: PASSED');
    } catch (err) {
      console.error('❌ Test Indexing & Advanced Search Filters: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testVersioningAndRollback();
      console.log('✔ Test Immutable Versioning & Rollback: PASSED');
    } catch (err) {
      console.error('❌ Test Immutable Versioning & Rollback: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testSnapshotsAndRestoration();
      console.log('✔ Test Snapshot Captures & Restorations: PASSED');
    } catch (err) {
      console.error('❌ Test Snapshot Captures & Restorations: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testGovernancePolicies();
      console.log('✔ Test Governance Evaluation & Purging: PASSED');
    } catch (err) {
      console.error('❌ Test Governance Evaluation & Purging: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testSecurityPolicies();
      console.log('✔ Test Security Sandboxing & isolation: PASSED');
    } catch (err) {
      console.error('❌ Test Security Sandboxing & isolation: FAILED', err);
      allPassed = false;
    }

    console.log(`=== [EMF Diagnostics Completed. Global Status: ${allPassed ? 'GREEN/SUCCESS' : 'RED/FAILED'}] ===`);
    return allPassed;
  }

  private static assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  private static async testProviderRegistration() {
    const runtime = MemoryRuntime.getInstance();
    
    const workingProvider = runtime.getProvider('WORKING');
    const sessionProvider = runtime.getProvider('SESSION');
    const organizationProvider = runtime.getProvider('ORGANIZATION');
    const longTermProvider = runtime.getProvider('LONG_TERM');

    this.assert(workingProvider !== undefined, 'Working Memory Provider missing');
    this.assert(sessionProvider !== undefined, 'Session Memory Provider missing');
    this.assert(organizationProvider !== undefined, 'Organization Memory Provider missing');
    this.assert(longTermProvider !== undefined, 'Long-Term Memory Provider missing');
    this.assert(workingProvider?.getType() === 'WORKING', 'Working Type mismatch');
  }

  private static async testLifecycleTransitionsAndEvents() {
    const runtime = MemoryRuntime.getInstance();
    const tenantId = 'TENANT-DIAGNOSTIC';
    runtime.clearAll(tenantId);

    let eventFired: boolean = false;
    const unsubscribe = MemoryEventPublisher.subscribe('MemoryCreated', (event) => {
      if (event.payload.key === 'diagnostic-probe') {
        eventFired = true;
      }
    });

    const context: MemoryContext = {
      tenantId,
      correlationId: 'corr-diag-1',
      permissions: [{ resource: '*', action: 'MANAGE', authorized: true }]
    };

    const entry = await runtime.set('WORKING', 'diagnostic-probe', { ping: 'pong' }, context);
    
    this.assert(entry.state === MemoryLifecycleState.INDEXED, 'Lifecycle state should be INDEXED upon creation');
    this.assert(!!eventFired, 'MemoryCreated event was not published');

    unsubscribe();
  }

  private static async testIndexingAndSearchFilters() {
    const runtime = MemoryRuntime.getInstance();
    const tenantId = 'TENANT-DIAGNOSTIC';
    const context: MemoryContext = {
      tenantId,
      correlationId: 'corr-search-1',
      permissions: [{ resource: '*', action: 'MANAGE', authorized: true }],
      tags: ['critical', 'compliance'],
      metadata: { namespace: 'tender-scope', bidValue: 750000 }
    };

    await runtime.set('WORKFLOW', 'eval-result-1', { score: 0.96 }, context);
    await runtime.set('WORKFLOW', 'eval-result-2', { score: 0.42 }, { ...context, tags: ['non-critical'] });

    // Precise query
    const results = await runtime.search('WORKFLOW', {
      tags: ['critical'],
      namespaces: ['tender-scope']
    }, context);

    this.assert(results.entries.length === 1, 'Search filter mismatch');
    this.assert(results.entries[0].key === 'eval-result-1', 'Incorrect search output matched');
  }

  private static async testVersioningAndRollback() {
    const runtime = MemoryRuntime.getInstance();
    const tenantId = 'TENANT-DIAGNOSTIC';
    const context: MemoryContext = {
      tenantId,
      correlationId: 'corr-ver-1',
      permissions: [{ resource: '*', action: 'MANAGE', authorized: true }]
    };

    await runtime.set('WORKING', 'mutable-config', { limit: 100 }, context);
    await runtime.set('WORKING', 'mutable-config', { limit: 250 }, context);
    await runtime.set('WORKING', 'mutable-config', { limit: 500 }, context);

    const history = await runtime.getHistory('WORKING', 'mutable-config', context);
    this.assert(history.length === 3, `History should record 3 revisions, found: ${history.length}`);
    this.assert(history[0].entry.value.limit === 100, 'Original value version-0 error');
    this.assert(history[2].entry.value.limit === 500, 'Latest value version-2 error');

    // Rollback to version 2 (which had limit = 250)
    const rollbacked = await runtime.rollback('WORKING', 'mutable-config', 2, context);
    this.assert(rollbacked.value.limit === 250, 'Rollback restoring value mismatch');
  }

  private static async testSnapshotsAndRestoration() {
    const runtime = MemoryRuntime.getInstance();
    const tenantId = 'TENANT-SNAP-DIAGNOSTIC';
    const context: MemoryContext = {
      tenantId,
      correlationId: 'corr-snap-1',
      permissions: [{ resource: '*', action: 'MANAGE', authorized: true }]
    };

    runtime.clearAll(tenantId);

    await runtime.set('SHARED', 'collaborator-1', { active: true }, context);
    await runtime.set('SHARED', 'collaborator-2', { active: false }, context);

    // Capture snapshot
    const snap = await runtime.captureSnapshot('SHARED', tenantId, { author: 'admin' });
    this.assert(snap.entries.length === 2, 'Snapshot should contain exactly 2 entries');

    // Modify active values
    await runtime.set('SHARED', 'collaborator-1', { active: false }, context);
    await runtime.delete('SHARED', 'collaborator-2', context);

    // Restore snapshot
    await runtime.restoreSnapshot(snap, context);

    const r1 = await runtime.get('SHARED', 'collaborator-1', context);
    const r2 = await runtime.get('SHARED', 'collaborator-2', context);

    this.assert(r1?.value.active === true, 'Snap restore failed to rollback state on collaborator-1');
    this.assert(r2 !== undefined, 'Snap restore failed to undelete collaborator-2');
  }

  private static async testGovernancePolicies() {
    const policy = { classification: 'RESTRICTED' as const, retentionMs: 1000 };
    const context: MemoryContext = {
      tenantId: 'T1',
      correlationId: 'corr-gov',
      securityContext: { userId: 'usr-gov', roles: ['OPERATIONS'] }
    };

    const isAccessAllowed = MemoryGovernanceEngine.verifyAccessControl(context, policy);
    this.assert(isAccessAllowed === true, 'Governance Access Control validation mismatch');

    const entry: MemoryEntry = {
      id: 'e1',
      type: 'WORKING',
      key: 'k1',
      value: 'v1',
      context,
      state: MemoryLifecycleState.CREATED,
      version: 1,
      hash: 'h1',
      createdAt: Date.now() - 5000, // 5 seconds ago
      updatedAt: Date.now() - 5000
    };

    // Retention duration evaluates to false (purged) since elapsed time 5000ms > retentionMs 1000ms
    const isValid = MemoryGovernanceEngine.evaluateRetention(entry, policy);
    this.assert(isValid === false, 'Retention logic error on expired entry');
  }

  private static async testSecurityPolicies() {
    const context: MemoryContext = {
      tenantId: 'TENANT-X',
      correlationId: 'corr-sec',
      permissions: [{ resource: 'restricted-key', action: 'WRITE', authorized: false }]
    };

    const isAllowed = MemorySecurityGuard.verifyPermissions(context, 'WRITE', 'restricted-key');
    this.assert(isAllowed === false, 'Security permissions should decline un-authorized scopes');
  }
}
