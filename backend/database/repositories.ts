import { DatabaseCore } from './db-core';

// Let's declare our data types inline to prevent circular imports with evaluation-engine.ts
export interface PipelineStage {
  name: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  duration: string;
  confidence: number;
  input?: string;
  output?: string;
  rawConfidence?: number;
  adjustedConfidence?: number;
  supportingEvidenceCount?: number;
  missingEvidenceCount?: number;
  humanReviewRequired?: boolean;
  errors?: string;
  retries?: number;
  evidenceGenerated?: string[];
}

export interface MetadataField {
  label: string;
  value: string;
  confidence: number;
  key: string;
}

export interface RequirementRule {
  id: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'PENDING' | 'NOT FOUND' | 'WARNING';
  evidence: string;
  confidence: number;
  comment: string;
}

export interface TimelineEvent {
  time: string;
  stage: string;
  status: string;
  duration: string;
}

export interface DocumentQualityAssessment {
  score: number;
  imageQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  readability: 'High' | 'Medium' | 'Low';
  completeness: 'Complete' | 'Incomplete';
  missingPages: number;
  rotation: number;
  noise: 'Low' | 'Medium' | 'High';
  blur: 'None' | 'Slight' | 'Severe';
  cropping: 'None' | 'Partial' | 'Severe';
  resolution: string;
  signatureVisibility: 'Visible' | 'Not Visible' | 'Partially Visible';
  recommendations: string[];
}

export interface CrossFieldValidationResult {
  isValid: boolean;
  checks: {
    parameter: string;
    value: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    comment: string;
  }[];
}

export interface FinancialVerificationResult {
  isValid: boolean;
  bidTotal: number;
  bidSecurityValue: number;
  arithmeticConsistency: 'Consistent' | 'Inconsistent';
  currency: string;
  taxesIncluded: boolean;
  discountsApplied: boolean;
  errorsDetected: string[];
}

export interface TechnicalCriterion {
  criterion: string;
  maxScore: number;
  awardedScore: number;
  reason: string;
  supportingEvidence: string;
  reviewStatus: 'Approved' | 'Requires Clarification' | 'Failed';
}

export interface EvidenceCorrelation {
  id: string;
  documentId: string;
  documentName: string;
  page?: number;
  paragraph?: string;
  extractedValue: string;
  matchedRequirement: string;
  relatedRuleId: string;
  confidence: number;
  verificationMethod: 'AI Extraction' | 'Deterministic Rule' | 'Cross-Doc Sync' | 'Human Verification';
}

export interface ConfidenceFusion {
  rawConfidence: number;
  adjustedConfidence: number;
  finalVerificationStatus: 'Fully Verified' | 'Flagged for Review' | 'Verification Failed';
  signals: {
    ocrConfidence: number;
    classificationConfidence: number;
    metadataConfidence: number;
    crossDocConsistency: number;
    ruleValidationScore: number;
    evidenceCompleteness: number;
    officerConfirmation: boolean;
  };
}

export interface EvalDocument {
  id: string;
  name: string;
  bidderId: string;
  category: string;
  size: string;
  uploadTime: string;
  progress: number;
  status: 'Completed' | 'Processing' | 'Failed' | 'Queued' | 'Uploaded';
  extractedText: string;
  metadata: MetadataField[];
  requirements: RequirementRule[];
  officerNotes: string;
  versionHistory: string[];
  overridesLog: string[];
  pipelineStages: PipelineStage[];
  recommendation: {
    status: 'Responsive' | 'Non-Responsive' | 'Pending Review' | 'Requires Human Review';
    confidence: number;
    reasons: string[];
    approvedByOfficer: boolean;
  };
  timelineEvents: TimelineEvent[];
  documentQuality?: DocumentQualityAssessment;
  crossFieldValidation?: CrossFieldValidationResult;
  financialVerification?: FinancialVerificationResult;
  technicalEvaluation?: TechnicalCriterion[];
  evidenceCorrelations?: EvidenceCorrelation[];
  confidenceFusion?: ConfidenceFusion;
}

export interface Bidder {
  id: string;
  name: string;
  overallStatus: 'Approved' | 'Rejected' | 'Pending Review' | 'Processing';
  complianceScore: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  documentId?: string;
  documentName?: string;
  details: string;
  category: 'UPLOAD' | 'PIPELINE' | 'OVERRIDE' | 'APPROVAL' | 'EXPORT' | 'SYSTEM' | 'SIMULATION' | 'BENCHMARK';
  signature: string;
}

export interface ProcurementRule {
  id: string;
  description: string;
  applicableStage: string;
  expectedEvidence: string;
}

export interface WorkflowCheckpoint {
  id: string;
  timestamp: number;
  executionId: string;
  currentState: string;
  variables: Record<string, any>;
  stepExecutions: Record<string, any>;
}

export interface AgentRun {
  id: string;
  agentName: string;
  taskId: string;
  status: string;
  reasoningHistory: string[];
  confidenceScore: number;
  duration: number;
}

// ============================================================================
// 1. TENDER & BIDDER REPOSITORY
// ============================================================================
export class TenderRepository {
  private dbCore = DatabaseCore.getInstance();

  public async getBidder(id: string): Promise<Bidder | null> {
    const row = await this.dbCore.get(
      'SELECT id, name, overall_status as overallStatus, compliance_score as complianceScore FROM bidders WHERE id = ?',
      [id]
    );
    return row ? (row as Bidder) : null;
  }

  public async getAllBidders(): Promise<Bidder[]> {
    const rows = await this.dbCore.all(
      'SELECT id, name, overall_status as overallStatus, compliance_score as complianceScore FROM bidders'
    );
    return rows as Bidder[];
  }

  public async saveBidder(bidder: Bidder): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO bidders (id, name, overall_status, compliance_score, updated_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET 
         name = excluded.name, 
         overall_status = excluded.overall_status, 
         compliance_score = excluded.compliance_score,
         updated_at = CURRENT_TIMESTAMP`,
      [bidder.id, bidder.name, bidder.overallStatus, bidder.complianceScore]
    );
  }

  public async deleteBidder(id: string): Promise<void> {
    await this.dbCore.run('DELETE FROM bidders WHERE id = ?', [id]);
  }
}

// ============================================================================
// 2. EVALUATION & DOCUMENT REPOSITORY
// ============================================================================
export class EvaluationRepository {
  private dbCore = DatabaseCore.getInstance();

  public async getDocument(id: string): Promise<EvalDocument | null> {
    const row = await this.dbCore.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!row) return null;

    // Load pipeline stages
    const stageRows = await this.dbCore.all('SELECT * FROM pipeline_stages WHERE document_id = ?', [id]);
    const pipelineStages: PipelineStage[] = stageRows.map((s: any) => ({
      name: s.name,
      status: s.status as any,
      duration: s.duration,
      confidence: s.confidence,
      input: s.input || undefined,
      output: s.output || undefined,
      rawConfidence: s.raw_confidence !== null ? s.raw_confidence : undefined,
      adjustedConfidence: s.adjusted_confidence !== null ? s.adjusted_confidence : undefined,
      supportingEvidenceCount: s.supporting_evidence_count !== null ? s.supporting_evidence_count : undefined,
      missingEvidenceCount: s.missing_evidence_count !== null ? s.missing_evidence_count : undefined,
      humanReviewRequired: s.human_review_required === 1,
      errors: s.errors || undefined,
      retries: s.retries !== null ? s.retries : undefined,
      evidenceGenerated: s.evidence_generated_json ? JSON.parse(s.evidence_generated_json) : undefined
    }));

    return {
      id: row.id,
      name: row.name,
      bidderId: row.bidder_id,
      category: row.category,
      size: row.size,
      uploadTime: row.upload_time,
      progress: row.progress,
      status: row.status as any,
      extractedText: row.extracted_text,
      metadata: JSON.parse(row.metadata_field_json || row.metadata_json || '[]'),
      requirements: JSON.parse(row.requirements_json || row.requirements || '[]'),
      officerNotes: row.officer_notes,
      versionHistory: JSON.parse(row.version_history_json || '[]'),
      overridesLog: JSON.parse(row.overrides_json || '[]'),
      recommendation: JSON.parse(row.recommendation_json || '{}'),
      timelineEvents: JSON.parse(row.timeline_json || '[]'),
      pipelineStages,
      documentQuality: row.quality_json ? JSON.parse(row.quality_json) : undefined,
      crossFieldValidation: row.cross_field_json ? JSON.parse(row.cross_field_json) : undefined,
      financialVerification: row.financial_json ? JSON.parse(row.financial_json) : undefined,
      technicalEvaluation: row.technical_json ? JSON.parse(row.technical_json) : undefined,
      evidenceCorrelations: row.evidence_json ? JSON.parse(row.evidence_json) : undefined,
      confidenceFusion: row.confidence_json ? JSON.parse(row.confidence_json) : undefined
    };
  }

  public async getAllDocuments(): Promise<EvalDocument[]> {
    const rows = await this.dbCore.all('SELECT id FROM documents');
    const docs: EvalDocument[] = [];
    for (const r of rows) {
      const doc = await this.getDocument(r.id);
      if (doc) docs.push(doc);
    }
    return docs;
  }

  public async saveDocument(doc: EvalDocument): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO documents (
        id, name, bidder_id, category, size, upload_time, progress, status, extracted_text, officer_notes,
        version_history_json, overrides_json, recommendation_json, timeline_json,
        quality_json, cross_field_json, financial_json, technical_json, evidence_json, confidence_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        bidder_id = excluded.bidder_id,
        category = excluded.category,
        size = excluded.size,
        upload_time = excluded.upload_time,
        progress = excluded.progress,
        status = excluded.status,
        extracted_text = excluded.extracted_text,
        officer_notes = excluded.officer_notes,
        version_history_json = excluded.version_history_json,
        overrides_json = excluded.overrides_json,
        recommendation_json = excluded.recommendation_json,
        timeline_json = excluded.timeline_json,
        quality_json = excluded.quality_json,
        cross_field_json = excluded.cross_field_json,
        financial_json = excluded.financial_json,
        technical_json = excluded.technical_json,
        evidence_json = excluded.evidence_json,
        confidence_json = excluded.confidence_json,
        updated_at = CURRENT_TIMESTAMP`,
      [
        doc.id,
        doc.name,
        doc.bidderId,
        doc.category,
        doc.size,
        doc.uploadTime,
        doc.progress,
        doc.status,
        doc.extractedText,
        doc.officerNotes,
        JSON.stringify(doc.versionHistory),
        JSON.stringify(doc.overridesLog),
        JSON.stringify(doc.recommendation),
        JSON.stringify(doc.timelineEvents),
        doc.documentQuality ? JSON.stringify(doc.documentQuality) : null,
        doc.crossFieldValidation ? JSON.stringify(doc.crossFieldValidation) : null,
        doc.financialVerification ? JSON.stringify(doc.financialVerification) : null,
        doc.technicalEvaluation ? JSON.stringify(doc.technicalEvaluation) : null,
        doc.evidenceCorrelations ? JSON.stringify(doc.evidenceCorrelations) : null,
        doc.confidenceFusion ? JSON.stringify(doc.confidenceFusion) : null
      ]
    );

    // Save/Update metadata & requirements inside JSON structure
    // (We also support direct column insertion for compatibility if needed, but JSON is modern and standard here)
    await this.dbCore.run(
      'UPDATE documents SET metadata_field_json = ?, requirements_json = ? WHERE id = ?',
      [JSON.stringify(doc.metadata), JSON.stringify(doc.requirements), doc.id]
    );

    // Sync pipeline stages
    await this.dbCore.run('DELETE FROM pipeline_stages WHERE document_id = ?', [doc.id]);
    for (let idx = 0; idx < doc.pipelineStages.length; idx++) {
      const s = doc.pipelineStages[idx];
      await this.dbCore.run(
        `INSERT INTO pipeline_stages (
          id, document_id, name, status, duration, confidence, input, output,
          raw_confidence, adjusted_confidence, supporting_evidence_count, missing_evidence_count,
          human_review_required, errors, retries, evidence_generated_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${doc.id}_stage_${idx}`,
          doc.id,
          s.name,
          s.status,
          s.duration,
          s.confidence,
          s.input || null,
          s.output || null,
          s.rawConfidence !== undefined ? s.rawConfidence : null,
          s.adjustedConfidence !== undefined ? s.adjustedConfidence : null,
          s.supportingEvidenceCount !== undefined ? s.supportingEvidenceCount : null,
          s.missingEvidenceCount !== undefined ? s.missingEvidenceCount : null,
          s.humanReviewRequired ? 1 : 0,
          s.errors || null,
          s.retries !== undefined ? s.retries : null,
          s.evidenceGenerated ? JSON.stringify(s.evidenceGenerated) : null
        ]
      );
    }
  }

  public async getRules(): Promise<ProcurementRule[]> {
    const rows = await this.dbCore.all('SELECT id, description, applicable_stage as applicableStage, expected_evidence as expectedEvidence FROM procurement_rules');
    return rows as ProcurementRule[];
  }

  public async saveRules(rules: ProcurementRule[]): Promise<void> {
    for (const rule of rules) {
      await this.dbCore.run(
        `INSERT INTO procurement_rules (id, description, applicable_stage, expected_evidence, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           description = excluded.description,
           applicable_stage = excluded.applicable_stage,
           expected_evidence = excluded.expected_evidence,
           updated_at = CURRENT_TIMESTAMP`,
        [rule.id, rule.description, rule.applicableStage, rule.expectedEvidence]
      );
    }
  }
}

// ============================================================================
// 3. AI AGENT RUNTIME REPOSITORY
// ============================================================================
export class AgentRuntimeRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveAgentRun(run: AgentRun): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO agent_runs (id, agent_name, task_id, status, reasoning_history_json, confidence_score, duration, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         agent_name = excluded.agent_name,
         task_id = excluded.task_id,
         status = excluded.status,
         reasoning_history_json = excluded.reasoning_history_json,
         confidence_score = excluded.confidence_score,
         duration = excluded.duration,
         updated_at = CURRENT_TIMESTAMP`,
      [
        run.id,
        run.agentName,
        run.taskId,
        run.status,
        JSON.stringify(run.reasoningHistory),
        run.confidenceScore,
        run.duration
      ]
    );
  }

  public async getAgentRun(id: string): Promise<AgentRun | null> {
    const row = await this.dbCore.get('SELECT * FROM agent_runs WHERE id = ?', [id]);
    if (!row) return null;
    return {
      id: row.id,
      agentName: row.agent_name,
      taskId: row.task_id,
      status: row.status,
      reasoningHistory: JSON.parse(row.reasoning_history_json),
      confidenceScore: row.confidence_score,
      duration: row.duration
    };
  }

  public async getAgentRunsForTask(taskId: string): Promise<AgentRun[]> {
    const rows = await this.dbCore.all('SELECT * FROM agent_runs WHERE task_id = ?', [taskId]);
    return rows.map((row: any) => ({
      id: row.id,
      agentName: row.agent_name,
      taskId: row.task_id,
      status: row.status,
      reasoningHistory: JSON.parse(row.reasoning_history_json),
      confidenceScore: row.confidence_score,
      duration: row.duration
    }));
  }
}

// ============================================================================
// 4. WORKFLOW ENGINE REPOSITORY
// ============================================================================
export class WorkflowRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveCheckpoint(checkpoint: any): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO workflow_checkpoints (id, workflow_id, node_id, status, payload_json, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         workflow_id = excluded.workflow_id,
         node_id = excluded.node_id,
         status = excluded.status,
         payload_json = excluded.payload_json,
         updated_at = CURRENT_TIMESTAMP`,
      [
        checkpoint.id,
        checkpoint.executionId || '',
        checkpoint.currentState || '',
        'ACTIVE',
        JSON.stringify(checkpoint)
      ]
    );
  }

  public async getCheckpoint(id: string): Promise<any | null> {
    const row = await this.dbCore.get('SELECT * FROM workflow_checkpoints WHERE id = ?', [id]);
    if (!row) return null;
    return JSON.parse(row.payload_json);
  }

  public async getAllCheckpoints(): Promise<any[]> {
    const rows = await this.dbCore.all('SELECT * FROM workflow_checkpoints');
    return rows.map((row: any) => JSON.parse(row.payload_json));
  }

  public async clearCheckpoints(): Promise<void> {
    await this.dbCore.run('DELETE FROM workflow_checkpoints');
  }

  public async deleteCheckpoint(id: string): Promise<void> {
    await this.dbCore.run('DELETE FROM workflow_checkpoints WHERE id = ?', [id]);
  }
}

// ============================================================================
// 5. AUDIT PLATFORM REPOSITORY
// ============================================================================
export class AuditRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveAuditLog(log: AuditLogEntry): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO audit_logs (id, timestamp, user, action, document_id, document_name, details, category, signature, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         timestamp = excluded.timestamp,
         user = excluded.user,
         action = excluded.action,
         document_id = excluded.document_id,
         document_name = excluded.document_name,
         details = excluded.details,
         category = excluded.category,
         signature = excluded.signature,
         updated_at = CURRENT_TIMESTAMP`,
      [
        log.id,
        log.timestamp,
        log.user,
        log.action,
        log.documentId || null,
        log.documentName || null,
        log.details,
        log.category,
        log.signature
      ]
    );
  }

  public async getAuditLogs(): Promise<AuditLogEntry[]> {
    const rows = await this.dbCore.all('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    return rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      user: r.user,
      action: r.action,
      documentId: r.document_id || undefined,
      documentName: r.document_name || undefined,
      details: r.details,
      category: r.category as any,
      signature: r.signature
    }));
  }
}

// ============================================================================
// 6. SYSTEM CONFIGURATION REPOSITORY
// ============================================================================
export class ConfigRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveConfig(key: string, value: string): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO system_configs (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`,
      [key, value]
    );
  }

  public async getConfig(key: string): Promise<string | null> {
    const row = await this.dbCore.get('SELECT value FROM system_configs WHERE key = ?', [key]);
    return row ? row.value : null;
  }
}

// ============================================================================
// 7. ENTERPRISE MEMORY / CHAT CONVERSATION REPOSITORY
// ============================================================================
export class ChatRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveConversation(id: string, historyJson: string): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO conversations (id, history_json, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         history_json = excluded.history_json,
         updated_at = CURRENT_TIMESTAMP`,
      [id, historyJson]
    );
  }

  public async getConversation(id: string): Promise<string | null> {
    const row = await this.dbCore.get('SELECT history_json as historyJson FROM conversations WHERE id = ?', [id]);
    return row ? row.historyJson : null;
  }
}

// ============================================================================
// 8. NOTIFICATION REPOSITORY
// ============================================================================
export class NotificationRepository {
  private dbCore = DatabaseCore.getInstance();

  public async saveNotification(n: { id: string; title: string; message: string; read: number }): Promise<void> {
    await this.dbCore.run(
      `INSERT INTO notifications (id, title, message, read, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         message = excluded.message,
         read = excluded.read`,
      [n.id, n.title, n.message, n.read]
    );
  }

  public async getNotifications(): Promise<{ id: string; title: string; message: string; read: number; created_at: string }[]> {
    const rows = await this.dbCore.all('SELECT * FROM notifications ORDER BY created_at DESC');
    return rows as any[];
  }
}
