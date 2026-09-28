/**
 * Enterprise Memory Fabric (EMF) — Organization & Long-Term Memory Subsystem
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { BaseMemoryProvider } from '../providers';

export class OrganizationMemoryProvider extends BaseMemoryProvider {
  constructor() {
    super('ORGANIZATION', {
      classification: 'CONFIDENTIAL', // Highly protected business blueprints
      approvalRequiredForDelete: true,
      approvalRequiredForWrite: true
    });
  }
}

export class LongTermMemoryProvider extends BaseMemoryProvider {
  constructor() {
    super('LONG_TERM', {
      classification: 'CONFIDENTIAL',
      approvalRequiredForDelete: true,
      approvalRequiredForWrite: true
    });
  }
}
