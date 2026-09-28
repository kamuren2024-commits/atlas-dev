/**
 * Enterprise Memory Fabric (EMF) — Workflow Memory Subsystem
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { BaseMemoryProvider } from '../providers';

export class WorkflowMemoryProvider extends BaseMemoryProvider {
  constructor() {
    // Workflow memory preserves states across the entire DAG execution pipeline
    super('WORKFLOW', {
      classification: 'INTERNAL',
      retentionMs: 24 * 60 * 60 * 1000, // 24 Hours retention
      encryptionRequired: false
    });
  }
}
