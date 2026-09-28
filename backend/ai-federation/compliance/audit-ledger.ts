import crypto from 'crypto';
import { generateId } from '../../../src/core/shared/crypto';

export interface AuditInteraction {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  provider: string;
  model: string;
  costUsd: number;
  latencyMs: number;
  user: string;
  workflow: string;
  complianceTags: string[]; // PPADA_2015, PPADR_2020, ISO_27001, ISO_42001
  previousRecordHash: string;
  recordHash: string;
}

export class AuditLedger {
  private static ledger: AuditInteraction[] = [];
  private static lastHash = 'SALIENCE_GENESIS_BLOCK_0000000000000000';

  /**
   * Deterministic cryptographically secure SHA-256 hash function for log linking.
   */
  private static computeHash(record: Partial<AuditInteraction>): string {
    const serialized = JSON.stringify({
      timestamp: record.timestamp,
      prompt: record.prompt,
      response: record.response,
      provider: record.provider,
      model: record.model,
      user: record.user,
      workflow: record.workflow,
      prevHash: record.previousRecordHash
    });

    // Standard cryptographically secure SHA-256 hash
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  static append(
    prompt: string, 
    response: string, 
    provider: string, 
    model: string, 
    costUsd: number, 
    latencyMs: number, 
    user: string, 
    workflow: string,
    additionalTags: string[] = []
  ): AuditInteraction {
    const id = generateId('AUDIT');
    const timestamp = new Date().toISOString();
    
    // Auto Tag compliance markers based on content triggers
    const complianceTags = ['ISO_27001', 'ISO_42001'];
    const lowerPrompt = prompt.toLowerCase();
    const lowerResponse = response.toLowerCase();

    if (lowerPrompt.includes('tender') || lowerPrompt.includes('bid') || lowerPrompt.includes('procure') || lowerPrompt.includes('ppada')) {
      complianceTags.push('PPADA_2015_SEC_XII');
    }
    if (lowerPrompt.includes('regulation') || lowerPrompt.includes('statutory') || lowerPrompt.includes('audit')) {
      complianceTags.push('PPADR_2020_COMPLIANCE');
    }
    additionalTags.forEach(tag => {
      if (!complianceTags.includes(tag)) complianceTags.push(tag);
    });

    const partialRecord: Partial<AuditInteraction> = {
      timestamp,
      prompt,
      response,
      provider,
      model,
      user,
      workflow,
      previousRecordHash: this.lastHash
    };

    const recordHash = this.computeHash(partialRecord);
    
    const finalRecord: AuditInteraction = {
      id,
      timestamp,
      prompt,
      response,
      provider,
      model,
      costUsd,
      latencyMs,
      user,
      workflow,
      complianceTags,
      previousRecordHash: this.lastHash,
      recordHash
    };

    this.ledger.push(finalRecord);
    this.lastHash = recordHash;

    console.log(`[AUDIT LEDGER] Appended immutable block ${id} linked with parent hash ${finalRecord.previousRecordHash.substring(0, 16)}`);
    return finalRecord;
  }

  static async log(entry: {
    module?: string;
    action: string;
    status: 'success' | 'failure' | string;
    details?: string;
    officer?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditInteraction> {
    return this.append(
      `[${entry.module || 'SYSTEM'}] ${entry.action}`,
      entry.details || `Status: ${entry.status}`,
      'ENTERPRISE_LEDGER',
      'AUDIT_v1',
      0,
      1,
      entry.officer || 'SYSTEM',
      entry.action,
      ['SYSTEM_AUDIT', entry.module || 'CORE']
    );
  }

  static getLedger(): AuditInteraction[] {
    return this.ledger;
  }

  static verifyLedgerIntegrity(): { isValid: boolean; corruptedIndex?: number } {
    let currentPrevHash = 'SALIENCE_GENESIS_BLOCK_0000000000000000';
    for (let i = 0; i < this.ledger.length; i++) {
      const record = this.ledger[i];
      if (record.previousRecordHash !== currentPrevHash) {
        return { isValid: false, corruptedIndex: i };
      }
      const calculatedHash = this.computeHash({
        timestamp: record.timestamp,
        prompt: record.prompt,
        response: record.response,
        provider: record.provider,
        model: record.model,
        user: record.user,
        workflow: record.workflow,
        previousRecordHash: record.previousRecordHash
      });
      if (record.recordHash !== calculatedHash) {
        return { isValid: false, corruptedIndex: i };
      }
      currentPrevHash = record.recordHash;
    }
    return { isValid: true };
  }
}
