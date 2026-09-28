import { v4 as uuidv4 } from 'uuid';
import { AuditLedger } from '../ai-federation/compliance/audit-ledger';

export type MasterRecordType = 'SUPPLIER' | 'ORGANIZATION' | 'COMMITTEE' | 'OFFICER' | 'PROJECT' | 'CONTRACT' | 'BANK' | 'MANUFACTURER' | 'TEMPLATE' | 'LEGAL_RULE';

export interface MasterRecord {
  id: string;
  type: MasterRecordType;
  name: string;
  externalId?: string;
  data: Record<string, any>;
  version: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING_APPROVAL';
  provenance: {
    source: string;
    importedAt: string;
    officer: string;
  };
  metadata: {
    tags: string[];
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  };
}

export class MasterDataService {
  private static records: Map<string, MasterRecord[]> = new Map(); // id -> versions

  public static async createRecord(type: MasterRecordType, name: string, data: Record<string, any>, officer: string): Promise<MasterRecord> {
    const id = uuidv4();
    const record: MasterRecord = {
      id,
      type,
      name,
      data,
      version: 1,
      status: 'ACTIVE',
      provenance: {
        source: 'MANUAL_ENTRY',
        importedAt: new Date().toISOString(),
        officer
      },
      metadata: {
        tags: [],
        classification: 'INTERNAL'
      }
    };
    this.records.set(id, [record]);
    
    await AuditLedger.log({
      module: 'MDM',
      action: 'CREATE_RECORD',
      status: 'success',
      details: `Created master record for ${type}: ${name}`,
      metadata: { recordId: id, type }
    });
    
    return record;
  }

  public static getRecord(id: string, version?: number): MasterRecord | undefined {
    const versions = this.records.get(id);
    if (!versions) return undefined;
    if (version) return versions.find(v => v.version === version);
    return versions[versions.length - 1];
  }

  public static async updateRecord(id: string, updates: Partial<MasterRecord>, officer: string): Promise<MasterRecord> {
    const versions = this.records.get(id);
    if (!versions) throw new Error('Record not found');
    const current = versions[versions.length - 1];
    
    const next: MasterRecord = {
      ...current,
      ...updates,
      version: current.version + 1,
      provenance: {
        ...current.provenance,
        importedAt: new Date().toISOString(),
        officer
      }
    };
    versions.push(next);
    
    await AuditLedger.log({
      module: 'MDM',
      action: 'UPDATE_RECORD',
      status: 'success',
      details: `Updated master record ${id} to version ${next.version}`,
      metadata: { recordId: id, version: next.version }
    });
    
    return next;
  }

  public static async mergeRecords(primaryId: string, secondaryId: string, officer: string): Promise<MasterRecord> {
    const primary = this.getRecord(primaryId);
    const secondary = this.getRecord(secondaryId);
    if (!primary || !secondary) throw new Error('One or both records not found');
    
    const mergedData = { ...secondary.data, ...primary.data };
    const updated = await this.updateRecord(primaryId, { data: mergedData }, officer);
    
    // Archive secondary
    const secondaryVersions = this.records.get(secondaryId)!;
    const lastSecondary = secondaryVersions[secondaryVersions.length - 1];
    secondaryVersions.push({
      ...lastSecondary,
      status: 'ARCHIVED',
      version: lastSecondary.version + 1,
      data: { ...lastSecondary.data, mergedInto: primaryId }
    });
    
    await AuditLedger.log({
      module: 'MDM',
      action: 'MERGE_RECORDS',
      status: 'success',
      details: `Merged record ${secondaryId} into ${primaryId}`,
      metadata: { primaryId, secondaryId }
    });
    
    return updated;
  }

  public static listRecords(type?: MasterRecordType): MasterRecord[] {
    const all = Array.from(this.records.values()).map(versions => versions[versions.length - 1]);
    if (type) return all.filter(r => r.type === type && r.status !== 'ARCHIVED');
    return all.filter(r => r.status !== 'ARCHIVED');
  }
}
