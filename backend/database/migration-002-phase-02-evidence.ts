/**
 * PHASE 02: EETF EVIDENCE MODEL - DATABASE MIGRATION
 * 
 * Creates 3 SQLite tables for evidence model:
 * - evidence: Core evidence atoms (immutable)
 * - evidence_relationships: Links between evidence
 * - evidence_conflicts: Detected inconsistencies
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import Database from 'better-sqlite3';

export class Phase02EvidenceMigration {
  /**
   * Create Phase 02 tables
   */
  static create(db: Database.Database): void {
    // =====================================================
    // TABLE 1: EVIDENCE (Core)
    // =====================================================
    // Immutable evidence atoms extracted from documents
    db.exec(`
      CREATE TABLE IF NOT EXISTS evidence (
        -- Identity & Classification
        evidence_id TEXT PRIMARY KEY,
        evidence_type TEXT NOT NULL,
        data_type TEXT NOT NULL,

        -- Source & Location
        document_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        document_date TEXT NOT NULL,
        page_number INTEGER,
        section TEXT,
        location_text TEXT,

        -- Extracted Value
        extracted_value TEXT NOT NULL,
        normalized_value TEXT NOT NULL,

        -- Confidence & Quality
        extraction_confidence REAL NOT NULL,
        ocr_confidence REAL,
        consensus_confidence REAL,
        format_valid INTEGER NOT NULL,
        overall_confidence REAL NOT NULL,

        -- Validation & Status
        validation_status TEXT NOT NULL,
        validation_errors TEXT NOT NULL,

        -- Temporal Validity
        effective_from TEXT NOT NULL,
        effective_to TEXT,

        -- Relationships
        bidder_id TEXT,
        tender_id TEXT NOT NULL,
        requirement_ids TEXT NOT NULL,

        -- Audit & Integrity
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        hash TEXT NOT NULL,
        immutable INTEGER NOT NULL,

        -- Extraction Metadata
        source_extractor TEXT NOT NULL,
        extraction_method TEXT NOT NULL,
        extraction_context TEXT,

        -- Constraints
        UNIQUE(evidence_id),
        CHECK(overall_confidence >= 0 AND overall_confidence <= 1),
        CHECK(validation_status IN ('VERIFIED', 'REQUIRES_REVIEW', 'INVALID', 'PENDING'))
      );

      -- Indices for common queries
      CREATE INDEX IF NOT EXISTS idx_evidence_tender_id ON evidence(tender_id);
      CREATE INDEX IF NOT EXISTS idx_evidence_bidder_id ON evidence(bidder_id);
      CREATE INDEX IF NOT EXISTS idx_evidence_document_id ON evidence(document_id);
      CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(evidence_type);
      CREATE INDEX IF NOT EXISTS idx_evidence_validation_status ON evidence(validation_status);
      CREATE INDEX IF NOT EXISTS idx_evidence_overall_confidence ON evidence(overall_confidence);
      CREATE INDEX IF NOT EXISTS idx_evidence_created_at ON evidence(created_at);
      CREATE INDEX IF NOT EXISTS idx_evidence_effective_to ON evidence(effective_to);
    `);

    // =====================================================
    // TABLE 2: EVIDENCE_RELATIONSHIPS
    // =====================================================
    // Links between evidence atoms (same company, same amount, etc.)
    db.exec(`
      CREATE TABLE IF NOT EXISTS evidence_relationships (
        relationship_id TEXT PRIMARY KEY,
        evidence_id_1 TEXT NOT NULL,
        evidence_id_2 TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        description TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        bidirectional INTEGER NOT NULL,

        UNIQUE(relationship_id),
        FOREIGN KEY(evidence_id_1) REFERENCES evidence(evidence_id),
        FOREIGN KEY(evidence_id_2) REFERENCES evidence(evidence_id),
        CHECK(confidence >= 0 AND confidence <= 1),
        CHECK(relationship_type IN (
          'SAME_BIDDER', 'SAME_AMOUNT', 'SAME_DATE', 'SAME_ENTITY',
          'SUPPORTING_EVIDENCE', 'CONTRADICTING', 'DEPENDENCY', 'CROSS_REFERENCE'
        ))
      );

      -- Indices
      CREATE INDEX IF NOT EXISTS idx_evidence_relationships_1 ON evidence_relationships(evidence_id_1);
      CREATE INDEX IF NOT EXISTS idx_evidence_relationships_2 ON evidence_relationships(evidence_id_2);
      CREATE INDEX IF NOT EXISTS idx_evidence_relationships_type ON evidence_relationships(relationship_type);
      CREATE INDEX IF NOT EXISTS idx_evidence_relationships_created_at ON evidence_relationships(created_at);
    `);

    // =====================================================
    // TABLE 3: EVIDENCE_CONFLICTS
    // =====================================================
    // Detected inconsistencies and problems with evidence
    db.exec(`
      CREATE TABLE IF NOT EXISTS evidence_conflicts (
        conflict_id TEXT PRIMARY KEY,
        evidence_id_1 TEXT NOT NULL,
        evidence_id_2 TEXT,
        conflict_type TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        requires_review INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        review_status TEXT NOT NULL,
        review_notes TEXT,

        UNIQUE(conflict_id),
        FOREIGN KEY(evidence_id_1) REFERENCES evidence(evidence_id),
        FOREIGN KEY(evidence_id_2) REFERENCES evidence(evidence_id),
        CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        CHECK(review_status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
        CHECK(conflict_type IN (
          'CONTRADICTING_VALUES', 'EXPIRED_DOCUMENT', 'MISSING_REQUIRED_FIELD',
          'INSUFFICIENT_CONFIDENCE', 'FORMAT_INVALID', 'CANNOT_VERIFY',
          'INCONSISTENT_DATES', 'DUPLICATE_SUBMISSION'
        ))
      );

      -- Indices
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_1 ON evidence_conflicts(evidence_id_1);
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_2 ON evidence_conflicts(evidence_id_2);
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_type ON evidence_conflicts(conflict_type);
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_severity ON evidence_conflicts(severity);
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_review_status ON evidence_conflicts(review_status);
      CREATE INDEX IF NOT EXISTS idx_evidence_conflicts_created_at ON evidence_conflicts(created_at);
    `);
  }

  /**
   * Seed initial data (if needed)
   */
  static seed(db: Database.Database): void {
    // No seed data needed for Phase 02
    // Evidence is extracted from tender documents at runtime
  }

  /**
   * Rollback (drop Phase 02 tables)
   */
  static rollback(db: Database.Database): void {
    db.exec(`
      DROP INDEX IF EXISTS idx_evidence_effective_to;
      DROP INDEX IF EXISTS idx_evidence_created_at;
      DROP INDEX IF EXISTS idx_evidence_overall_confidence;
      DROP INDEX IF EXISTS idx_evidence_validation_status;
      DROP INDEX IF EXISTS idx_evidence_type;
      DROP INDEX IF EXISTS idx_evidence_document_id;
      DROP INDEX IF EXISTS idx_evidence_bidder_id;
      DROP INDEX IF EXISTS idx_evidence_tender_id;
      DROP TABLE IF EXISTS evidence;

      DROP INDEX IF EXISTS idx_evidence_relationships_created_at;
      DROP INDEX IF EXISTS idx_evidence_relationships_type;
      DROP INDEX IF EXISTS idx_evidence_relationships_2;
      DROP INDEX IF EXISTS idx_evidence_relationships_1;
      DROP TABLE IF EXISTS evidence_relationships;

      DROP INDEX IF EXISTS idx_evidence_conflicts_created_at;
      DROP INDEX IF EXISTS idx_evidence_conflicts_review_status;
      DROP INDEX IF EXISTS idx_evidence_conflicts_severity;
      DROP INDEX IF EXISTS idx_evidence_conflicts_type;
      DROP INDEX IF EXISTS idx_evidence_conflicts_2;
      DROP INDEX IF EXISTS idx_evidence_conflicts_1;
      DROP TABLE IF EXISTS evidence_conflicts;
    `);
  }

  /**
   * Verify tables exist
   */
  static verify(db: Database.Database): boolean {
    const tables = ['evidence', 'evidence_relationships', 'evidence_conflicts'];

    for (const table of tables) {
      const result = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(table);

      if (!result) {
        console.error(`✗ Table ${table} does not exist`);
        return false;
      }
    }

    console.log('✓ Phase 02 Evidence Model tables verified');
    return true;
  }
}

/**
 * Migration runner
 * 
 * Usage:
 *   const db = new Database('app.db');
 *   Phase02EvidenceMigration.create(db);
 *   Phase02EvidenceMigration.seed(db);
 *   Phase02EvidenceMigration.verify(db);
 */
export async function runPhase02Migration(dbPath: string): Promise<void> {
  const db = new Database(dbPath);

  console.log('📦 Creating Phase 02 Evidence Model tables...');
  Phase02EvidenceMigration.create(db);

  console.log('🌱 Seeding Phase 02 initial data...');
  Phase02EvidenceMigration.seed(db);

  console.log('✓ Verifying Phase 02 tables...');
  const verified = Phase02EvidenceMigration.verify(db);

  if (verified) {
    console.log('✅ Phase 02 Migration Complete');
  } else {
    throw new Error('Phase 02 Migration verification failed');
  }

  db.close();
}
