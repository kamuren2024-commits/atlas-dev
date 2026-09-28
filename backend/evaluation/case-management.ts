import { ProcurementCase } from '../../src/types/evaluation';
import { v4 as uuidv4 } from 'uuid';

export class CaseManagementService {
  private static instance: CaseManagementService;
  private cases: Map<string, ProcurementCase> = new Map();

  private constructor() {
    this.seedInitialCases();
  }

  public static getInstance(): CaseManagementService {
    if (!CaseManagementService.instance) {
      CaseManagementService.instance = new CaseManagementService();
    }
    return CaseManagementService.instance;
  }

  private seedInitialCases() {
    const case1: ProcurementCase = {
      id: 'case-001',
      type: 'COMPLIANCE',
      title: 'Missing KRA PIN Verification',
      description: 'Shanghai Grid Metal Corp submitted a PIN that failed automated validation against iTax registry.',
      status: 'IN_INVESTIGATION',
      priority: 'HIGH',
      assignedOfficer: 'Officer Wambui',
      timeline: [
        { timestamp: new Date().toISOString(), event: 'Case opened by Compliance Agent', officer: 'SYSTEM' },
        { timestamp: new Date().toISOString(), event: 'Assigned to Officer Wambui', officer: 'SCM_DIRECTOR' }
      ],
      evidence: ['doc-tax-001', 'itax-error-log'],
      linkedEntities: ['supplier-shanghai', 'tender-2026-08']
    };
    this.cases.set(case1.id, case1);
  }

  public createCase(caseData: Omit<ProcurementCase, 'id'>) {
    const id = `case-${uuidv4().slice(0, 8)}`;
    const newCase = { ...caseData, id };
    this.cases.set(id, newCase);
    return newCase;
  }

  public getCases() {
    return Array.from(this.cases.values());
  }

  public updateCase(id: string, updates: Partial<ProcurementCase>) {
    const existing = this.cases.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.cases.set(id, updated);
    return updated;
  }
}
