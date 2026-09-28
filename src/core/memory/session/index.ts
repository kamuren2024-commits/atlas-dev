/**
 * Enterprise Memory Fabric (EMF) — Session Memory Subsystem
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { BaseMemoryProvider } from '../providers';

export class SessionMemoryProvider extends BaseMemoryProvider {
  constructor() {
    // Session memory expires in 30 minutes
    super('SESSION', {
      classification: 'INTERNAL',
      retentionMs: 30 * 60 * 1000,
      encryptionRequired: true // Secure session states
    });
  }
}
