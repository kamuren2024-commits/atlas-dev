export interface LineageCheckpoint {
  id: string; // Lineage record identifier
  dataFactId: string; // The specific ontological entity or document catalog ID
  sourceOrigin: string; // PDF upload path, system sensor stream, or API webhook
  transformedBy?: string; // SCM OCR, Agent translation, etc.
  consumedByWorkflows: string[]; // List of workflow instances that read this element
  decisionsResolved: string[]; // Resulting decisions referencing this fact
  timestamp: string;
}

export class EnterpriseKnowledgeLineage {
  private static instance: EnterpriseKnowledgeLineage;
  private auditLineages = new Map<string, LineageCheckpoint>();

  private constructor() {
    this.seedLineageHistory();
  }

  public static getInstance(): EnterpriseKnowledgeLineage {
    if (!EnterpriseKnowledgeLineage.instance) {
      EnterpriseKnowledgeLineage.instance = new EnterpriseKnowledgeLineage();
    }
    return EnterpriseKnowledgeLineage.instance;
  }

  /**
   * Appends or records dynamic data lineage pathways
   */
  public logProvenance(checkpoint: LineageCheckpoint): void {
    const existing = this.auditLineages.get(checkpoint.dataFactId);
    if (existing) {
      // Append consumers and decisions logically to maintain continuity
      existing.consumedByWorkflows = Array.from(new Set([...existing.consumedByWorkflows, ...checkpoint.consumedByWorkflows]));
      existing.decisionsResolved = Array.from(new Set([...existing.decisionsResolved, ...checkpoint.decisionsResolved]));
      existing.timestamp = new Date().toISOString();
    } else {
      this.auditLineages.set(checkpoint.dataFactId, checkpoint);
    }
  }

  /**
   * Deep traces the origin flow of any fact (Requirement 9)
   */
  public traceFactProvenance(dataFactId: string): LineageCheckpoint | undefined {
    return this.auditLineages.get(dataFactId);
  }

  public getAllLineages(): LineageCheckpoint[] {
    return Array.from(this.auditLineages.values());
  }

  private seedLineageHistory(): void {
    this.logProvenance({
      id: 'lin-mariakani-spares',
      dataFactId: 'spares-mariakani-box',
      sourceOrigin: 'Equipment_Reserve_Manuals.pdf',
      transformedBy: 'inventory-ocr-agent v1.2',
      consumedByWorkflows: ['wfl-strike-remediation'],
      decisionsResolved: ['dec-reallocate-spares'],
      timestamp: new Date().toISOString()
    });

    this.logProvenance({
      id: 'lin-shanghai-backlogs',
      dataFactId: 'shanghai-cable-corp',
      sourceOrigin: 'Mombasa_Logistics_SLA_Sheet.xlsx',
      transformedBy: 'supplier-risk-agent v1.0',
      consumedByWorkflows: ['wfl-mombasa-contingency'],
      decisionsResolved: ['dec-reroute-logistics'],
      timestamp: new Date().toISOString()
    });
  }
}
