/**
 * PHASE 01: DATABASE MIGRATION - RULE ONTOLOGY TABLES
 * 
 * Creates SQLite tables for rule management, versioning, and execution tracking.
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-30
 */

import { DatabaseCore } from './db-core';

export class RuleOntologyMigration {
  /**
   * Create all required tables for Phase 01
   */
  public static async create(db: DatabaseCore): Promise<void> {
    console.log('[Migration] Phase 01 - Rule Ontology tables');

    // Create rules table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rules (
        rule_id TEXT PRIMARY KEY,
        rule_version TEXT NOT NULL,
        rule_sequence INTEGER NOT NULL DEFAULT 0,
        rule_category TEXT NOT NULL,
        evaluation_stage TEXT NOT NULL,
        legal_instrument TEXT NOT NULL,
        section_or_regulation TEXT NOT NULL,
        tender_clause TEXT,
        legal_text TEXT NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        severity TEXT NOT NULL,
        failure_behavior TEXT NOT NULL,
        review_behavior TEXT NOT NULL,
        dependencies TEXT,
        prerequisites TEXT,
        input_schema TEXT,
        output_schema TEXT,
        evidence_requirements TEXT,
        compiled_code TEXT NOT NULL,
        compiled_version TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT,
        updated_by TEXT,
        description TEXT,
        test_references TEXT,
        UNIQUE(rule_id, rule_version)
      );
    `);

    // Create indices for rules
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rules_stage ON rules(evaluation_stage);
      CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(rule_category);
      CREATE INDEX IF NOT EXISTS idx_rules_effective ON rules(effective_from, effective_to);
      CREATE INDEX IF NOT EXISTS idx_rules_created ON rules(created_at);
    `);

    // Create rule_versions table (immutable version history)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rule_versions (
        version_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id TEXT NOT NULL,
        version TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        change_reason TEXT,
        legal_update TEXT,
        tender_update TEXT,
        content_json TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES rules(rule_id),
        UNIQUE(rule_id, version)
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rule_versions_id ON rule_versions(rule_id);
      CREATE INDEX IF NOT EXISTS idx_rule_versions_created ON rule_versions(created_at);
    `);

    // Create rule_executions table (immutable audit trail)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rule_executions (
        execution_id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        rule_version TEXT NOT NULL,
        evaluation_id TEXT NOT NULL,
        tender_id TEXT NOT NULL,
        bid_id TEXT NOT NULL,
        bidder_id TEXT NOT NULL,
        executed_by TEXT NOT NULL,
        executed_at TEXT NOT NULL,
        status TEXT NOT NULL,
        confidence REAL NOT NULL,
        evidence_used TEXT,
        calculation_details TEXT,
        output_json TEXT,
        error_code TEXT,
        error_message TEXT,
        error_details TEXT,
        audit_signature TEXT NOT NULL,
        replayed INTEGER DEFAULT 0,
        FOREIGN KEY(rule_id) REFERENCES rules(rule_id)
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_executions_rule ON rule_executions(rule_id);
      CREATE INDEX IF NOT EXISTS idx_executions_eval ON rule_executions(evaluation_id);
      CREATE INDEX IF NOT EXISTS idx_executions_bid ON rule_executions(bid_id);
      CREATE INDEX IF NOT EXISTS idx_executions_status ON rule_executions(status);
      CREATE INDEX IF NOT EXISTS idx_executions_timestamp ON rule_executions(executed_at);
    `);

    // Create legal_instruments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS legal_instruments (
        instrument_code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        effective_from TEXT NOT NULL,
        effective_to TEXT,
        country TEXT NOT NULL,
        language TEXT NOT NULL,
        description TEXT
      );
    `);

    // Create legal_sections table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS legal_sections (
        section_id TEXT PRIMARY KEY,
        instrument_code TEXT NOT NULL,
        section_number TEXT NOT NULL,
        subsection TEXT,
        heading TEXT NOT NULL,
        full_text TEXT NOT NULL,
        interpretation_guidance TEXT,
        related_sections TEXT,
        FOREIGN KEY(instrument_code) REFERENCES legal_instruments(instrument_code),
        UNIQUE(instrument_code, section_number, subsection)
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sections_instrument ON legal_sections(instrument_code);
    `);

    // Create rule_dependencies table (for complex dependency tracking)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rule_dependencies (
        dependency_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id TEXT NOT NULL,
        depends_on TEXT NOT NULL,
        dependency_type TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY(rule_id) REFERENCES rules(rule_id),
        FOREIGN KEY(depends_on) REFERENCES rules(rule_id),
        UNIQUE(rule_id, depends_on)
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_deps_rule ON rule_dependencies(rule_id);
      CREATE INDEX IF NOT EXISTS idx_deps_on ON rule_dependencies(depends_on);
    `);

    // Create rule_test_cases table (for regression testing)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rule_test_cases (
        test_id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        rule_version TEXT NOT NULL,
        test_name TEXT NOT NULL,
        description TEXT,
        input_json TEXT NOT NULL,
        expected_output_json TEXT NOT NULL,
        expected_status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(rule_id) REFERENCES rules(rule_id)
      );
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tests_rule ON rule_test_cases(rule_id);
    `);

    // Create rule_execution_stats table (for monitoring)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rule_execution_stats (
        stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_id TEXT NOT NULL,
        date TEXT NOT NULL,
        total_executions INTEGER DEFAULT 0,
        passed INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        inconclusive INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        avg_execution_time_ms REAL DEFAULT 0,
        FOREIGN KEY(rule_id) REFERENCES rules(rule_id),
        UNIQUE(rule_id, date)
      );
    `);

    console.log('[Migration] Phase 01 tables created successfully');
  }

  /**
   * Seed legal instruments and sections
   */
  public static async seedLegalFramework(db: DatabaseCore): Promise<void> {
    console.log('[Migration] Seeding legal framework');

    // Insert legal instruments
    await db.run(`
      INSERT OR IGNORE INTO legal_instruments 
      (instrument_code, name, full_name, effective_from, effective_to, country, language, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'PPADA_2015',
      'Public Procurement and Asset Disposal Act, 2015',
      'Public Procurement and Asset Disposal Act, 2015 (Act No. 33 of 2015)',
      '2015-12-18',
      null,
      'Kenya',
      'English',
      'Primary legislation governing public procurement in Kenya'
    ]);

    await db.run(`
      INSERT OR IGNORE INTO legal_instruments 
      (instrument_code, name, full_name, effective_from, effective_to, country, language, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'PPADR_2020',
      'Public Procurement and Asset Disposal Regulations, 2020',
      'Public Procurement and Asset Disposal Regulations, 2020',
      '2020-04-22',
      null,
      'Kenya',
      'English',
      'Implementing regulations for PPADA 2015'
    ]);

    // Insert legal sections
    const sections = [
      {
        section_id: 'PPADA-71-1',
        instrument_code: 'PPADA_2015',
        section_number: '71',
        subsection: '(1)',
        heading: 'Qualification and Eligibility',
        full_text: 'A person shall not participate in a procurement proceeding unless...',
        interpretation_guidance: 'Establishes mandatory qualification requirements'
      },
      {
        section_id: 'PPADA-74',
        instrument_code: 'PPADA_2015',
        section_number: '74',
        subsection: null,
        heading: 'Preliminary Evaluation',
        full_text: 'A public entity shall use a preliminary evaluation method...',
        interpretation_guidance: 'Preliminary evaluation is mandatory'
      },
      {
        section_id: 'PPADA-157',
        instrument_code: 'PPADA_2015',
        section_number: '157',
        subsection: null,
        heading: 'Preference and Reservation Schemes',
        full_text: 'In accordance with Article 227 of the Constitution...',
        interpretation_guidance: 'AGPO is mandatory where applicable'
      },
      {
        section_id: 'PPADR-101',
        instrument_code: 'PPADR_2020',
        section_number: '101',
        subsection: null,
        heading: 'Financial Capacity Assessment',
        full_text: 'A procuring entity shall establish financial capacity requirements...',
        interpretation_guidance: 'Financial capacity verification is essential'
      },
      {
        section_id: 'PPADR-102',
        instrument_code: 'PPADR_2020',
        section_number: '102',
        subsection: null,
        heading: 'Bid Submission Requirements',
        full_text: 'Every bid shall include...',
        interpretation_guidance: 'Preliminary evaluation checks completeness'
      },
      {
        section_id: 'PPADR-103',
        instrument_code: 'PPADR_2020',
        section_number: '103',
        subsection: null,
        heading: 'Technical Evaluation of Tenders',
        full_text: 'Technical evaluation shall assess the extent...',
        interpretation_guidance: 'Technical criteria must be specified in tender documents'
      }
    ];

    for (const section of sections) {
      await db.run(`
        INSERT OR IGNORE INTO legal_sections 
        (section_id, instrument_code, section_number, subsection, heading, full_text, interpretation_guidance)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        section.section_id,
        section.instrument_code,
        section.section_number,
        section.subsection,
        section.heading,
        section.full_text,
        section.interpretation_guidance
      ]);
    }

    console.log('[Migration] Legal framework seeded');
  }

  /**
   * Rollback (for testing/development)
   */
  public static async rollback(db: DatabaseCore): Promise<void> {
    console.log('[Migration] Rolling back Phase 01');

    await db.exec(`DROP TABLE IF EXISTS rule_execution_stats;`);
    await db.exec(`DROP TABLE IF EXISTS rule_test_cases;`);
    await db.exec(`DROP TABLE IF EXISTS rule_dependencies;`);
    await db.exec(`DROP TABLE IF EXISTS legal_sections;`);
    await db.exec(`DROP TABLE IF EXISTS legal_instruments;`);
    await db.exec(`DROP TABLE IF EXISTS rule_executions;`);
    await db.exec(`DROP TABLE IF EXISTS rule_versions;`);
    await db.exec(`DROP TABLE IF EXISTS rules;`);

    console.log('[Migration] Phase 01 tables removed');
  }
}
