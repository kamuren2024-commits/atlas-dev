/**
 * Enterprise Memory Fabric (EMF) — Working Memory Subsystem
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { BaseMemoryProvider } from '../providers';

export class WorkingMemoryProvider extends BaseMemoryProvider {
  constructor() {
    // Working memory has short-lived transient retention policy (e.g. 5 minutes expiration)
    super('WORKING', {
      classification: 'INTERNAL',
      retentionMs: 5 * 60 * 1000, // 5 minutes
      encryptionRequired: false
    });
  }
}
