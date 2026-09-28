import { 
  ManagedDocument, AgentStatus, EvaluationFinding, 
  AuditEntry, ProcurementEvent, DocumentClassification,
  EvaluationStage
} from '../../src/types/evaluation';
import { RuleEngine } from './rule-engine';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../../src/core/shared/crypto';

class EvaluationIntelligenceService {
  private documents: ManagedDocument[] = [];
  private agents: AgentStatus[] = [
    { id: 'intake-agent', name: 'Document Intake Agent', status: 'IDLE', progress: 0, version: '2.1.0', owner: 'Infrastructure', legalAuthority: 'N/A', dependencies: [], health: 1.0 },
    { id: 'ocr-agent', name: 'OCR Quality Agent', status: 'IDLE', progress: 0, version: '1.8.4', owner: 'Data Science', legalAuthority: 'N/A', dependencies: ['intake-agent'], health: 0.98 },
    { id: 'kra-validation-agent', name: 'KRA Validation Agent', status: 'IDLE', progress: 0, version: '3.0.1', owner: 'Legal Compliance', legalAuthority: 'PPADA Sec 71', dependencies: ['ocr-agent'], health: 0.95 },
    { id: 'cr12-validation-agent', name: 'CR12 Validation Agent', status: 'IDLE', progress: 0, version: '2.5.0', owner: 'Legal Compliance', legalAuthority: 'PPADA Sec 71', dependencies: ['ocr-agent'], health: 0.92 },
    { id: 'financial-capacity-agent', name: 'Financial Capacity Agent', status: 'IDLE', progress: 0, version: '1.2.0', owner: 'Finance', legalAuthority: 'PPADR Reg 101', dependencies: ['ocr-agent'], health: 0.88 },
    { id: 'agpo-verification-agent', name: 'AGPO Agent', status: 'IDLE', progress: 0, version: '1.1.0', owner: 'Procurement', legalAuthority: 'PPADA Sec 157', dependencies: ['ocr-agent'], health: 0.99 },
    { id: 'forgery-detection-agent', name: 'Forgery Detection Agent', status: 'IDLE', progress: 0, version: '0.9.0', owner: 'Security', legalAuthority: 'N/A', dependencies: ['ocr-agent'], health: 0.85 },
    { id: 'risk-intel-agent', name: 'Risk Intelligence Agent', status: 'IDLE', progress: 0, version: '1.5.0', owner: 'Audit', legalAuthority: 'N/A', dependencies: ['kra-validation-agent', 'cr12-validation-agent'], health: 0.94 }
  ];
  private auditLogs: AuditEntry[] = [];
  private activityStream: ProcurementEvent[] = [];
  private stages: EvaluationStage[] = [
    'INTAKE', 'CLASSIFICATION', 'OCR', 'METADATA', 'LEGAL_VALIDATION', 
    'MANDATORY', 'TECHNICAL', 'FINANCIAL', 'RISK_ASSESSMENT', 
    'CROSS_VALIDATION', 'RECOMMENDATION', 'OFFICER_APPROVAL'
  ];

  async ingestDocument(file: { name: string; size: number; uploader: string }): Promise<ManagedDocument> {
    const doc: ManagedDocument = {
      id: `DOC-${uuidv4().substring(0, 8)}`,
      name: file.name,
      hash: `sha256-${generateHash('eval-' + Date.now()).substring(0, 16)}`,
      size: file.size,
      type: file.name.split('.').pop() || 'unknown',
      classification: 'OTHER',
      confidence: 0,
      uploader: file.uploader,
      timestamp: new Date().toISOString(),
      version: 1,
      stage: 'INTAKE',
      riskScore: 0,
      metadata: {},
      path: `/storage/tenders/${file.name}`
    };

    this.documents.push(doc);
    this.logActivity('DOCUMENT_UPLOAD', `Document ${doc.name} ingested for evaluation.`, { docId: doc.id });
    
    // Auto-trigger classification
    setTimeout(() => this.classifyDocument(doc.id), 500);
    
    return doc;
  }

  async classifyDocument(docId: string): Promise<void> {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    // Mock classification logic
    const nameLower = doc.name.toLowerCase();
    let classification: DocumentClassification = 'OTHER';
    let confidence = 0.95;

    if (nameLower.includes('kra') || nameLower.includes('tax')) classification = 'TAX_CERTIFICATE';
    else if (nameLower.includes('cr12')) classification = 'CR12';
    else if (nameLower.includes('bank') || nameLower.includes('statement')) classification = 'BANK_STATEMENT';
    else if (nameLower.includes('pin')) classification = 'KRA_PIN';
    else if (nameLower.includes('audit')) classification = 'AUDITED_ACCOUNTS';
    else if (nameLower.includes('tender')) classification = 'TENDER_DOCUMENT';

    doc.classification = classification;
    doc.confidence = confidence;
    
    this.logActivity('AGENT_COMPLETION', `Agent "Document Classifier" identified ${doc.name} as ${classification}.`, { docId, confidence });
  }

  private logActivity(type: ProcurementEvent['type'], description: string, metadata?: any) {
    const event: ProcurementEvent = {
      id: uuidv4(),
      title: type.replace(/_/g, ' '),
      type,
      timestamp: new Date().toISOString(),
      description,
      metadata
    };
    this.activityStream.unshift(event);
  }

  getAgents() { return this.agents; }
  getDocuments() { return this.documents; }
  getActivityStream() { return this.activityStream; }
  
  getAuditLogs() { return this.auditLogs; }

  async triggerEvaluation(docId: string): Promise<void> {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return;

    this.logActivity('OFFICER_ACTION', `Evaluation pipeline initialized for ${doc.name}.`, { docId });

    for (const stage of this.stages) {
      doc.stage = stage;
      this.logActivity('MILESTONE', `Pipeline stage entered: ${stage}`, { docId, stage });
      
      // Update relevant agents for this stage
      this.agents.forEach(a => {
        if (a.status !== 'COMPLETED') {
          a.status = 'RUNNING';
          a.progress = Math.min(90, a.progress + 20);
          a.currentTask = `Analyzing ${stage} requirements...`;
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.agents.forEach(a => {
      a.status = 'COMPLETED';
      a.progress = 100;
      a.confidence = 0.9 + Math.random() * 0.1;
      a.riskScore = Math.random() * 0.3;
    });

    this.logActivity('MILESTONE', `Full procurement evaluation cycle completed for ${doc.name}.`, { docId });
  }
}

export const EvaluationService = new EvaluationIntelligenceService();
