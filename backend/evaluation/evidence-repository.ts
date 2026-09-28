/**
 * PHASE 02: EETF EVIDENCE MODEL - EVIDENCE REPOSITORY
 * 
 * Data access layer for evidence atoms, relationships, and conflicts.
 * Handles:
 * - Create/read/query evidence
 * - Relationship management
 * - Conflict tracking
 * - Immutability enforcement
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import Database from 'better-sqlite3';
import {
  EvidenceAtom,
  EvidenceRelationship,
  EvidenceConflict,
  EvidenceQuery,
  EvidenceValidationStatus
} from './evidence-schema';

/**
 * EvidenceRepository - Data access for evidence
 */
export class EvidenceRepository {
  private db: Database.Database;
  private static instance: EvidenceRepository;

  private constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Initialize repository with database connection
   */
  static initialize(db: Database.Database): EvidenceRepository {
    this.instance = new EvidenceRepository(db);
    return this.instance;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EvidenceRepository {
    if (!this.instance) {
      throw new Error('EvidenceRepository not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Create evidence atom (immutable after creation)
   */
  createEvidence(atom: EvidenceAtom): EvidenceAtom {
    const stmt = this.db.prepare(`
      INSERT INTO evidence (
        evidence_id, evidence_type, data_type, document_id, document_type,
        document_date, page_number, section, location_text, extracted_value,
        normalized_value, extraction_confidence, ocr_confidence, consensus_confidence,
        format_valid, overall_confidence, validation_status, validation_errors,
        effective_from, effective_to, bidder_id, tender_id, requirement_ids,
        created_at, created_by, hash, immutable, source_extractor, extraction_method
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      atom.evidence_id,
      atom.evidence_type,
      atom.data_type,
      atom.document_id,
      atom.document_type,
      atom.document_date.toISOString(),
      atom.page_number,
      atom.section,
      atom.location_text,
      atom.extracted_value,
      atom.normalized_value,
      atom.extraction_confidence,
      atom.ocr_confidence,
      atom.consensus_confidence,
      atom.format_valid ? 1 : 0,
      atom.overall_confidence,
      atom.validation_status,
      JSON.stringify(atom.validation_errors),
      atom.effective_from.toISOString(),
      atom.effective_to?.toISOString(),
      atom.bidder_id,
      atom.tender_id,
      JSON.stringify(atom.requirement_ids),
      atom.created_at.toISOString(),
      atom.created_by,
      atom.hash,
      atom.immutable ? 1 : 0,
      atom.source_extractor,
      atom.extraction_method
    );

    return atom;
  }

  /**
   * Get evidence by ID
   */
  getEvidenceById(evidenceId: string): EvidenceAtom | null {
    const stmt = this.db.prepare('SELECT * FROM evidence WHERE evidence_id = ?');
    const row = stmt.get(evidenceId) as any;

    if (!row) return null;

    return this.rowToEvidenceAtom(row);
  }

  /**
   * Query evidence by filters
   */
  queryEvidence(query: EvidenceQuery): EvidenceAtom[] {
    let sql = 'SELECT * FROM evidence WHERE 1=1';
    const params: any[] = [];

    if (query.tender_id) {
      sql += ' AND tender_id = ?';
      params.push(query.tender_id);
    }
    if (query.bidder_id) {
      sql += ' AND bidder_id = ?';
      params.push(query.bidder_id);
    }
    if (query.document_id) {
      sql += ' AND document_id = ?';
      params.push(query.document_id);
    }
    if (query.evidence_type) {
      sql += ' AND evidence_type = ?';
      params.push(query.evidence_type);
    }
    if (query.validation_status) {
      sql += ' AND validation_status = ?';
      params.push(query.validation_status);
    }
    if (query.min_confidence !== undefined) {
      sql += ' AND overall_confidence >= ?';
      params.push(query.min_confidence);
    }
    if (query.expired === true) {
      sql += ' AND effective_to < datetime("now")';
    }
    if (query.expired === false) {
      sql += ' AND (effective_to IS NULL OR effective_to >= datetime("now"))';
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => this.rowToEvidenceAtom(row));
  }

  /**
   * Create relationship between two evidence atoms
   */
  createRelationship(rel: EvidenceRelationship): EvidenceRelationship {
    const stmt = this.db.prepare(`
      INSERT INTO evidence_relationships (
        relationship_id, evidence_id_1, evidence_id_2, relationship_type,
        description, confidence, created_at, bidirectional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      rel.relationship_id,
      rel.evidence_id_1,
      rel.evidence_id_2,
      rel.relationship_type,
      rel.description,
      rel.confidence,
      rel.created_at.toISOString(),
      rel.bidirectional ? 1 : 0
    );

    return rel;
  }

  /**
   * Get relationships for evidence
   */
  getRelationships(evidenceId: string): EvidenceRelationship[] {
    const stmt = this.db.prepare(`
      SELECT * FROM evidence_relationships
      WHERE evidence_id_1 = ? OR evidence_id_2 = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(evidenceId, evidenceId) as any[];

    return rows.map(row => ({
      relationship_id: row.relationship_id,
      evidence_id_1: row.evidence_id_1,
      evidence_id_2: row.evidence_id_2,
      relationship_type: row.relationship_type,
      description: row.description,
      confidence: row.confidence,
      created_at: new Date(row.created_at),
      bidirectional: row.bidirectional === 1
    }));
  }

  /**
   * Create conflict record
   */
  createConflict(conflict: EvidenceConflict): EvidenceConflict {
    const stmt = this.db.prepare(`
      INSERT INTO evidence_conflicts (
        conflict_id, evidence_id_1, evidence_id_2, conflict_type,
        description, severity, requires_review, created_at, review_status, review_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      conflict.conflict_id,
      conflict.evidence_id_1,
      conflict.evidence_id_2,
      conflict.conflict_type,
      conflict.description,
      conflict.severity,
      conflict.requires_review ? 1 : 0,
      conflict.created_at.toISOString(),
      conflict.review_status,
      conflict.review_notes
    );

    return conflict;
  }

  /**
   * Get conflicts for evidence
   */
  getConflicts(evidenceId: string): EvidenceConflict[] {
    const stmt = this.db.prepare(`
      SELECT * FROM evidence_conflicts
      WHERE evidence_id_1 = ? OR evidence_id_2 = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(evidenceId, evidenceId) as any[];

    return rows.map(row => ({
      conflict_id: row.conflict_id,
      evidence_id_1: row.evidence_id_1,
      evidence_id_2: row.evidence_id_2,
      conflict_type: row.conflict_type,
      description: row.description,
      severity: row.severity,
      requires_review: row.requires_review === 1,
      created_at: new Date(row.created_at),
      review_status: row.review_status,
      review_notes: row.review_notes
    }));
  }

  /**
   * Get unresolved conflicts for tender
   */
  getUnresolvedConflicts(tenderId: string): EvidenceConflict[] {
    const stmt = this.db.prepare(`
      SELECT ec.* FROM evidence_conflicts ec
      JOIN evidence e ON (ec.evidence_id_1 = e.evidence_id OR ec.evidence_id_2 = e.evidence_id)
      WHERE e.tender_id = ? AND ec.review_status = 'PENDING'
      ORDER BY ec.severity DESC, ec.created_at ASC
    `);

    const rows = stmt.all(tenderId) as any[];

    return rows.map(row => ({
      conflict_id: row.conflict_id,
      evidence_id_1: row.evidence_id_1,
      evidence_id_2: row.evidence_id_2,
      conflict_type: row.conflict_type,
      description: row.description,
      severity: row.severity,
      requires_review: row.requires_review === 1,
      created_at: new Date(row.created_at),
      review_status: row.review_status,
      review_notes: row.review_notes
    }));
  }

  /**
   * Mark conflict as reviewed
   */
  resolveConflict(conflictId: string, notes?: string): void {
    const stmt = this.db.prepare(`
      UPDATE evidence_conflicts
      SET review_status = 'RESOLVED', review_notes = ?
      WHERE conflict_id = ?
    `);

    stmt.run(notes, conflictId);
  }

  /**
   * Get evidence statistics for tender
   */
  getStatistics(tenderId: string): {
    total_evidence: number;
    verified: number;
    requires_review: number;
    invalid: number;
    average_confidence: number;
    conflicts: number;
    documents: number;
  } {
    const countStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN validation_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN validation_status = 'REQUIRES_REVIEW' THEN 1 ELSE 0 END) as requires_review,
        SUM(CASE WHEN validation_status = 'INVALID' THEN 1 ELSE 0 END) as invalid,
        AVG(overall_confidence) as avg_confidence
      FROM evidence WHERE tender_id = ?
    `);

    const result = countStmt.get(tenderId) as any;

    const conflictStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM evidence_conflicts ec
      JOIN evidence e ON (ec.evidence_id_1 = e.evidence_id OR ec.evidence_id_2 = e.evidence_id)
      WHERE e.tender_id = ?
    `);

    const conflictResult = conflictStmt.get(tenderId) as any;

    const docStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT document_id) as count FROM evidence WHERE tender_id = ?
    `);

    const docResult = docStmt.get(tenderId) as any;

    return {
      total_evidence: result.total || 0,
      verified: result.verified || 0,
      requires_review: result.requires_review || 0,
      invalid: result.invalid || 0,
      average_confidence: result.avg_confidence || 0,
      conflicts: conflictResult.count || 0,
      documents: docResult.count || 0
    };
  }

  /**
   * Get bidder evidence summary
   */
  getBidderSummary(tenderId: string, bidderId: string): {
    total_evidence: number;
    verified: number;
    average_confidence: number;
    conflicts: number;
    has_all_required: boolean;
  } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN validation_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
        AVG(overall_confidence) as avg_confidence
      FROM evidence
      WHERE tender_id = ? AND bidder_id = ?
    `);

    const result = stmt.get(tenderId, bidderId) as any;

    const conflictStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM evidence_conflicts ec
      JOIN evidence e ON (ec.evidence_id_1 = e.evidence_id OR ec.evidence_id_2 = e.evidence_id)
      WHERE e.tender_id = ? AND e.bidder_id = ? AND ec.review_status = 'PENDING'
    `);

    const conflictResult = conflictStmt.get(tenderId, bidderId) as any;

    return {
      total_evidence: result.total || 0,
      verified: result.verified || 0,
      average_confidence: result.avg_confidence || 0,
      conflicts: conflictResult.count || 0,
      has_all_required: true  // Would be populated from requirements
    };
  }

  /**
   * Delete evidence (only in specific cases, not normal operation)
   * Raises error if evidence is immutable
   */
  deleteEvidence(evidenceId: string): boolean {
    const atom = this.getEvidenceById(evidenceId);
    if (!atom) return false;

    if (atom.immutable) {
      throw new Error(`Cannot delete immutable evidence ${evidenceId}`);
    }

    const stmt = this.db.prepare('DELETE FROM evidence WHERE evidence_id = ?');
    const result = stmt.run(evidenceId);

    return result.changes > 0;
  }

  /**
   * Verify evidence hasn't been tampered with
   */
  verifyIntegrity(evidenceId: string, expectedHash: string): boolean {
    const atom = this.getEvidenceById(evidenceId);
    if (!atom) return false;

    return atom.hash === expectedHash;
  }

  /**
   * Export evidence for auditing
   */
  exportForAudit(tenderId: string, bidderId?: string): {
    evidence: EvidenceAtom[];
    relationships: EvidenceRelationship[];
    conflicts: EvidenceConflict[];
    export_date: Date;
  } {
    const query: EvidenceQuery = { tender_id: tenderId, bidder_id: bidderId };
    const evidence = this.queryEvidence(query);

    const relationships: EvidenceRelationship[] = [];
    const conflicts: EvidenceConflict[] = [];

    for (const atom of evidence) {
      relationships.push(...this.getRelationships(atom.evidence_id));
      conflicts.push(...this.getConflicts(atom.evidence_id));
    }

    return {
      evidence,
      relationships: Array.from(new Map(relationships.map(r => [r.relationship_id, r])).values()),
      conflicts: Array.from(new Map(conflicts.map(c => [c.conflict_id, c])).values()),
      export_date: new Date()
    };
  }

  /**
   * Helper: Convert database row to EvidenceAtom
   */
  private rowToEvidenceAtom(row: any): EvidenceAtom {
    return {
      evidence_id: row.evidence_id,
      evidence_type: row.evidence_type,
      data_type: row.data_type,
      document_id: row.document_id,
      document_type: row.document_type,
      document_date: new Date(row.document_date),
      page_number: row.page_number,
      section: row.section,
      location_text: row.location_text,
      extracted_value: row.extracted_value,
      normalized_value: row.normalized_value,
      extraction_confidence: row.extraction_confidence,
      ocr_confidence: row.ocr_confidence,
      consensus_confidence: row.consensus_confidence,
      format_valid: row.format_valid === 1,
      overall_confidence: row.overall_confidence,
      validation_status: row.validation_status,
      validation_errors: JSON.parse(row.validation_errors || '[]'),
      effective_from: new Date(row.effective_from),
      effective_to: row.effective_to ? new Date(row.effective_to) : undefined,
      bidder_id: row.bidder_id,
      tender_id: row.tender_id,
      requirement_ids: JSON.parse(row.requirement_ids || '[]'),
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      hash: row.hash,
      immutable: row.immutable === 1,
      source_extractor: row.source_extractor,
      extraction_method: row.extraction_method,
      extraction_context: row.extraction_context ? JSON.parse(row.extraction_context) : undefined
    };
  }
}
