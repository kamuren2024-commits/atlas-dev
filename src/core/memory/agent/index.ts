/**
 * Enterprise Memory Fabric (EMF) — Agent Memory Subsystem
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { BaseMemoryProvider } from '../providers';

export class AgentMemoryProvider extends BaseMemoryProvider {
  constructor() {
    super('AGENT', {
      classification: 'RESTRICTED',
      retentionMs: 7 * 24 * 60 * 60 * 1000, // 7 Days retention for logs/experience metrics
      encryptionRequired: true
    });
  }
}
