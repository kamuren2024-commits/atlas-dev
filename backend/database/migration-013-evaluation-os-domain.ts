/**
 * PHASE 03/04: DATABASE MIGRATION 013 — EVALUATION OS DOMAIN MODEL
 * 
 * Establishes persistent tables for:
 * 1. evaluation_tenders
 * 2. evaluation_bidders
 * 3. evaluation_requirements
 * 4. evaluation_criteria
 * 5. evaluation_documents
 * 6. evaluation_evidences
 * 7. evaluator_scores
 * 8. committee_sessions
 * 9. evaluation_clarifications
 * 10. evaluation_audit_blocks
 * 11. evaluation_tasks
 * 12. evaluation_workflow_history
 * 13. evaluation_conflict_declarations
 *
 * Implements strict foreign keys, indexes, version tracking, and cryptographic audit chaining.
 */

import { DatabaseCore } from './db-core';

export class EvaluationOSDomainMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[MIGRATION-013] Applying Evaluation OS Complete Domain Schema...');

    await db.exec(`
      -- 1. Evaluation Tenders Table
      CREATE TABLE IF NOT EXISTS evaluation_tenders (
        id TEXT PRIMARY KEY,
        procurement_reference TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        procurement_method TEXT NOT NULL,
        procuring_entity TEXT NOT NULL DEFAULT 'Kenya Electricity Transmission Company Limited (KETRACO)',
        department TEXT NOT NULL DEFAULT 'Transmission Infrastructure & Substations',
        tender_category TEXT NOT NULL DEFAULT 'Works - EPC Transmission Lines',
        publication_date TEXT NOT NULL,
        opening_deadline TEXT NOT NULL,
        evaluation_methodology TEXT NOT NULL DEFAULT 'Quality and Cost Based Selection (QCBS) / Lowest Evaluated Responsive Bidder',
        status TEXT NOT NULL DEFAULT 'TECHNICAL_EVALUATION',
        stage_number INTEGER NOT NULL DEFAULT 5,
        tender_doc_version TEXT NOT NULL DEFAULT 'v2.4-STD-PPRA-2022',
        budget_amount REAL NOT NULL DEFAULT 4850000000.0,
        currency TEXT NOT NULL DEFAULT 'KES',
        committee_code TEXT NOT NULL DEFAULT 'TEC-001',
        contract_locked INTEGER NOT NULL DEFAULT 1,
        locked_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_eval_tenders_ref ON evaluation_tenders(procurement_reference);
      CREATE INDEX IF NOT EXISTS idx_eval_tenders_status ON evaluation_tenders(status);

      -- 2. Evaluation Bidders Table
      CREATE TABLE IF NOT EXISTS evaluation_bidders (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        name TEXT NOT NULL,
        registration_number TEXT NOT NULL,
        tax_pin TEXT NOT NULL,
        country_of_incorporation TEXT NOT NULL DEFAULT 'Kenya',
        beneficial_owners_json TEXT NOT NULL DEFAULT '[]',
        contact_info_json TEXT NOT NULL DEFAULT '{}',
        preliminary_status TEXT NOT NULL DEFAULT 'RESPONSIVE',
        preliminary_findings_json TEXT NOT NULL DEFAULT '[]',
        technical_score REAL DEFAULT 0.0,
        financial_quote REAL DEFAULT 0.0,
        arithmetic_correction REAL DEFAULT 0.0,
        evaluated_price REAL DEFAULT 0.0,
        financial_rank INTEGER DEFAULT 0,
        overall_status TEXT NOT NULL DEFAULT 'UNDER_EVALUATION',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_bidders_tender ON evaluation_bidders(tender_id);
      CREATE INDEX IF NOT EXISTS idx_eval_bidders_status ON evaluation_bidders(overall_status);

      -- 3. Tender Requirements Table (Authoritative)
      CREATE TABLE IF NOT EXISTS evaluation_requirements (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        category TEXT NOT NULL, -- MANDATORY, TECHNICAL, FINANCIAL
        requirement_code TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        is_mandatory INTEGER NOT NULL DEFAULT 1,
        source_document TEXT NOT NULL DEFAULT 'Tender Document Sec III & V',
        legal_basis TEXT NOT NULL,
        evaluation_rule TEXT NOT NULL,
        evidence_requirement TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_reqs_tender ON evaluation_requirements(tender_id);

      -- 4. Evaluation Criteria Table
      CREATE TABLE IF NOT EXISTS evaluation_criteria (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        stage TEXT NOT NULL, -- PRELIMINARY, TECHNICAL, FINANCIAL
        code TEXT NOT NULL, -- e.g. MR-01, T1, T2, F1
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        weight_percent REAL NOT NULL DEFAULT 0.0,
        max_score REAL NOT NULL DEFAULT 100.0,
        pass_mark REAL DEFAULT 75.0,
        scoring_scale_json TEXT NOT NULL DEFAULT '[]',
        evidence_requirement TEXT NOT NULL,
        evaluator_responsibility TEXT NOT NULL DEFAULT 'ALL_TECHNICAL_EVALUATORS',
        legal_basis TEXT NOT NULL,
        is_locked INTEGER NOT NULL DEFAULT 1,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_criteria_tender ON evaluation_criteria(tender_id);

      -- 5. Bid Evaluation Documents Table
      CREATE TABLE IF NOT EXISTS evaluation_documents (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        bidder_id TEXT NOT NULL,
        category TEXT NOT NULL, -- Mandatory, Technical, Financial, Guarantee
        filename TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL DEFAULT 0,
        file_size_formatted TEXT NOT NULL DEFAULT '0 MB',
        mime_type TEXT NOT NULL DEFAULT 'application/pdf',
        file_hash_sha256 TEXT NOT NULL,
        page_count INTEGER NOT NULL DEFAULT 1,
        storage_path TEXT NOT NULL,
        ocr_status TEXT NOT NULL DEFAULT 'COMPLETED',
        extracted_text TEXT NOT NULL DEFAULT '',
        uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        confidence_score REAL NOT NULL DEFAULT 0.95,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE,
        FOREIGN KEY(bidder_id) REFERENCES evaluation_bidders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_docs_bidder ON evaluation_documents(bidder_id);
      CREATE INDEX IF NOT EXISTS idx_eval_docs_hash ON evaluation_documents(file_hash_sha256);

      -- 6. Bid Evidences Table (Granular Extracted Claims)
      CREATE TABLE IF NOT EXISTS evaluation_evidences (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        tender_id TEXT NOT NULL,
        bidder_id TEXT NOT NULL,
        requirement_id TEXT,
        criterion_code TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        section_reference TEXT NOT NULL,
        extracted_content TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0.92,
        extraction_method TEXT NOT NULL DEFAULT 'OCR_AND_SEMANTIC_ANALYSIS',
        reviewer_validation TEXT NOT NULL DEFAULT 'VALIDATED_BY_EVALUATOR',
        evidence_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES evaluation_documents(id) ON DELETE CASCADE,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE,
        FOREIGN KEY(bidder_id) REFERENCES evaluation_bidders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_evidence_doc ON evaluation_evidences(document_id);
      CREATE INDEX IF NOT EXISTS idx_eval_evidence_criterion ON evaluation_evidences(criterion_code);

      -- 7. Evaluator Scores Table (Individual & Multi-version)
      CREATE TABLE IF NOT EXISTS evaluator_scores (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        bidder_id TEXT NOT NULL,
        criterion_code TEXT NOT NULL,
        evaluator_id TEXT NOT NULL,
        evaluator_name TEXT NOT NULL,
        score REAL NOT NULL,
        max_score REAL NOT NULL DEFAULT 100.0,
        normalized_score REAL NOT NULL,
        rationale TEXT NOT NULL,
        comments TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        is_locked INTEGER NOT NULL DEFAULT 1,
        is_consensus_score INTEGER NOT NULL DEFAULT 0,
        change_reason TEXT,
        previous_score REAL,
        digital_signature TEXT NOT NULL,
        submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE,
        FOREIGN KEY(bidder_id) REFERENCES evaluation_bidders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_eval_scores_lookup ON evaluator_scores(tender_id, bidder_id, criterion_code);
      CREATE INDEX IF NOT EXISTS idx_eval_scores_evaluator ON evaluator_scores(evaluator_id);

      -- 8. Committee Sessions Table
      CREATE TABLE IF NOT EXISTS committee_sessions (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        committee_code TEXT NOT NULL DEFAULT 'TEC-001',
        session_type TEXT NOT NULL DEFAULT 'DELIBERATION_AND_CONSENSUS',
        date_held TEXT NOT NULL,
        quorum_verified INTEGER NOT NULL DEFAULT 1,
        quorum_count INTEGER NOT NULL DEFAULT 5,
        total_appointed INTEGER NOT NULL DEFAULT 5,
        members_present_json TEXT NOT NULL DEFAULT '[]',
        agenda TEXT NOT NULL,
        deliberations TEXT NOT NULL,
        consensus_reached INTEGER NOT NULL DEFAULT 1,
        dissent_records_json TEXT NOT NULL DEFAULT '[]',
        recommended_bidder_id TEXT,
        recommended_award_price REAL,
        accounting_officer_approval TEXT DEFAULT 'PENDING',
        approval_date TEXT,
        resolution_number TEXT NOT NULL,
        digital_seal TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_committee_sessions_tender ON committee_sessions(tender_id);

      -- 9. Evaluation Clarifications Table
      CREATE TABLE IF NOT EXISTS evaluation_clarifications (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        bidder_id TEXT NOT NULL,
        criterion_code TEXT NOT NULL,
        clarification_ref TEXT NOT NULL,
        request_details TEXT NOT NULL,
        requested_by_id TEXT NOT NULL,
        requested_by_name TEXT NOT NULL,
        requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        response_text TEXT,
        response_doc_id TEXT,
        received_at TEXT,
        impact_assessment TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, RECEIVED, ACCEPTED, REJECTED
        procedural_compliance_notes TEXT NOT NULL DEFAULT 'Issued under PPADA 2015 Section 81: Clarification without altering substance of bid.',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE,
        FOREIGN KEY(bidder_id) REFERENCES evaluation_bidders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_clarifications_bidder ON evaluation_clarifications(bidder_id);

      -- 10. Immutable Audit Blocks Table (Cryptographically Chained)
      CREATE TABLE IF NOT EXISTS evaluation_audit_blocks (
        block_index INTEGER PRIMARY KEY AUTOINCREMENT,
        block_id TEXT UNIQUE NOT NULL,
        tender_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        legal_authority TEXT NOT NULL,
        criteria_ref TEXT,
        bidder_ref TEXT,
        evidence_refs_json TEXT NOT NULL DEFAULT '[]',
        system_calculation_json TEXT NOT NULL DEFAULT '{}',
        human_decision_json TEXT NOT NULL DEFAULT '{}',
        payload_summary TEXT NOT NULL,
        previous_hash TEXT NOT NULL,
        block_hash TEXT NOT NULL,
        statutory_retention_years INTEGER NOT NULL DEFAULT 6,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_blocks_tender ON evaluation_audit_blocks(tender_id);
      CREATE INDEX IF NOT EXISTS idx_audit_blocks_hash ON evaluation_audit_blocks(block_hash);

      -- 11. Evaluation Workflow Tasks Table
      CREATE TABLE IF NOT EXISTS evaluation_tasks (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        title TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        owner_role TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
        status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, BLOCKED
        due_date TEXT NOT NULL,
        entity_type TEXT NOT NULL, -- BIDDER, SCORE, CLARIFICATION, QUORUM, REPORT
        entity_id TEXT NOT NULL,
        completion_event TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_owner ON evaluation_tasks(owner_id, status);

      -- 12. Workflow State Transitions Table
      CREATE TABLE IF NOT EXISTS evaluation_workflow_history (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        from_state TEXT NOT NULL,
        to_state TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        reason TEXT NOT NULL,
        prerequisites_json TEXT NOT NULL DEFAULT '[]',
        occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_workflow_history_tender ON evaluation_workflow_history(tender_id);

      -- 13. Conflict of Interest Declarations Table
      CREATE TABLE IF NOT EXISTS evaluation_conflict_declarations (
        id TEXT PRIMARY KEY,
        tender_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        role TEXT NOT NULL,
        declaration_type TEXT NOT NULL DEFAULT 'NONE', -- NONE, RELATIONSHIP, FINANCIAL, PRIOR_EMPLOYMENT, OTHER
        details TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'CLEARED', -- CLEARED, DECLARED, RECUSED
        approving_authority TEXT NOT NULL,
        resolution_details TEXT NOT NULL,
        declared_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        digital_signature_hash TEXT NOT NULL,
        FOREIGN KEY(tender_id) REFERENCES evaluation_tenders(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_conflicts_actor ON evaluation_conflict_declarations(actor_id, tender_id);
    `);

    // Seed authoritative baseline tender and real government records if empty
    const existingTender = await db.get('SELECT id FROM evaluation_tenders WHERE id = ?', ['TND-2026-08']);
    if (!existingTender) {
      console.log('[MIGRATION-013] Seeding Authoritative KETRACO Flagship Procurement Data...');
      await EvaluationOSDomainMigration.seedInitialData(db);
    }

    console.log('[MIGRATION-013] Evaluation OS Complete Domain Schema applied successfully.');
  }

  private static async seedInitialData(db: DatabaseCore): Promise<void> {
    const tenderId = 'TND-2026-08';
    const refNumber = 'KETRACO/PROC/2026/041';

    // 1. Seed Tender
    await db.run(`
      INSERT INTO evaluation_tenders (
        id, procurement_reference, title, procurement_method, procuring_entity, 
        department, tender_category, publication_date, opening_deadline, 
        evaluation_methodology, status, stage_number, budget_amount, currency, committee_code, contract_locked, locked_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      tenderId,
      refNumber,
      '400kV Lessos-Tororo Transmission Line EPC',
      'Open International Tender (PPADA 2015 Section 96)',
      'Kenya Electricity Transmission Company Limited (KETRACO)',
      'Transmission Infrastructure & Substations',
      'Works - High Voltage Transmission Systems',
      '2026-03-15T08:00:00Z',
      '2026-04-30T10:00:00Z',
      'Quality and Cost Based Selection (QCBS) / Lowest Evaluated Responsive Bidder (PPADA Sec 86)',
      'TECHNICAL_EVALUATION',
      5,
      4850000000.0,
      'KES',
      'TEC-001',
      1,
      '2026-04-30T10:30:00Z'
    ]);

    // Also support alias TND-2026-001 for seamless backward-compatibility
    await db.run(`
      INSERT OR IGNORE INTO evaluation_tenders (
        id, procurement_reference, title, procurement_method, procuring_entity, 
        department, tender_category, publication_date, opening_deadline, 
        evaluation_methodology, status, stage_number, budget_amount, currency, committee_code, contract_locked, locked_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      'TND-2026-001',
      'KETRACO/PROC/2026/041-ALT',
      '400kV Lessos-Tororo Transmission Line EPC',
      'Open International Tender (PPADA 2015 Section 96)',
      'Kenya Electricity Transmission Company Limited (KETRACO)',
      'Transmission Infrastructure & Substations',
      'Works - High Voltage Transmission Systems',
      '2026-03-15T08:00:00Z',
      '2026-04-30T10:00:00Z',
      'Quality and Cost Based Selection (QCBS) (PPADA Sec 86)',
      'TECHNICAL_EVALUATION',
      5,
      4850000000.0,
      'KES',
      'TEC-001',
      1,
      '2026-04-30T10:30:00Z'
    ]);

    // 2. Seed Bidders
    const bidders = [
      {
        id: 'B-001',
        name: 'Shanghai Grid Metal Corp',
        reg: 'CPR/2018/849201',
        pin: 'P051928374A',
        prelim: 'RESPONSIVE',
        techScore: 90.0,
        quote: 4680000000.0,
        evalPrice: 4680000000.0,
        rank: 1,
        status: 'RESPONSIVE'
      },
      {
        id: 'B-002',
        name: 'Athi River Electricals Ltd',
        reg: 'CPR/2012/392019',
        pin: 'P051283840Z',
        prelim: 'RESPONSIVE',
        techScore: 85.0,
        quote: 4790000000.0,
        evalPrice: 4790000000.0,
        rank: 2,
        status: 'RESPONSIVE'
      },
      {
        id: 'B-003',
        name: 'Siemens Energy Kenya',
        reg: 'CPR/2010/118274',
        pin: 'P051102938B',
        prelim: 'RESPONSIVE',
        techScore: 80.0,
        quote: 4920000000.0,
        evalPrice: 4920000000.0,
        rank: 3,
        status: 'RESPONSIVE'
      },
      {
        id: 'B-004',
        name: 'Larsen & Toubro East Africa',
        reg: 'CPR/2016/482910',
        pin: 'P051839201K',
        prelim: 'RESPONSIVE',
        techScore: 75.0,
        quote: 4980000000.0,
        evalPrice: 4980000000.0,
        rank: 4,
        status: 'RESPONSIVE'
      },
      {
        id: 'B-005',
        name: 'TBEA Transmission Co.',
        reg: 'CPR/2019/739182',
        pin: 'P051748291T',
        prelim: 'RESPONSIVE',
        techScore: 88.0,
        quote: 4720000000.0,
        evalPrice: 4720000000.0,
        rank: 2,
        status: 'RESPONSIVE'
      },
      {
        id: 'B-006',
        name: 'Mitsubishi Power Africa',
        reg: 'CPR/2015/552910',
        pin: 'P051638291M',
        prelim: 'RESPONSIVE',
        techScore: 80.0,
        quote: 5050000000.0,
        evalPrice: 5050000000.0,
        rank: 5,
        status: 'RESPONSIVE'
      }
    ];

    for (const b of bidders) {
      await db.run(`
        INSERT INTO evaluation_bidders (
          id, tender_id, name, registration_number, tax_pin, preliminary_status,
          technical_score, financial_quote, evaluated_price, financial_rank, overall_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [b.id, tenderId, b.name, b.reg, b.pin, b.prelim, b.techScore, b.quote, b.evalPrice, b.rank, b.status]);
    }

    // 3. Seed Criteria
    const criteria = [
      { id: 'CRIT-T1', code: 'T1', name: 'Specific Transmission Experience', stage: 'TECHNICAL', weight: 25, pass: 18, legal: 'PPADA 2015 Sec 79' },
      { id: 'CRIT-T2', code: 'T2', name: 'Key Engineering Personnel (EBK Licensure)', stage: 'TECHNICAL', weight: 20, pass: 15, legal: 'Engineers Act 2011 & PPADA' },
      { id: 'CRIT-T3', code: 'T3', name: 'Technical Capacity & Stringing Equipment', stage: 'TECHNICAL', weight: 15, pass: 12, legal: 'PPADA 2015 Sec 79' },
      { id: 'CRIT-T4', code: 'T4', name: 'Work Plan, Methodology & Critical Path', stage: 'TECHNICAL', weight: 15, pass: 10, legal: 'KETRACO Technical Specifications' },
      { id: 'CRIT-T5', code: 'T5', name: 'Quality, Safety & Environmental Safeguards', stage: 'TECHNICAL', weight: 15, pass: 12, legal: 'EMCA 1999 & ISO 45001' },
      { id: 'CRIT-F1', code: 'F1', name: 'Financial Liquidity & Credit Line Verification', stage: 'FINANCIAL', weight: 10, pass: 7, legal: 'PPADR 2020 Reg 74' },
      { id: 'CRIT-F2', code: 'F2', name: 'Bid Price & Arithmetic Verifications', stage: 'FINANCIAL', weight: 10, pass: 8, legal: 'PPADA 2015 Sec 82' }
    ];

    for (const c of criteria) {
      await db.run(`
        INSERT INTO evaluation_criteria (
          id, tender_id, stage, code, name, description, weight_percent, max_score, pass_mark, evidence_requirement, legal_basis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 100, ?, ?, ?)
      `, [c.id, tenderId, c.stage, c.code, c.name, c.name, c.weight, c.pass, 'Documentary proof certified by regulatory bodies', c.legal]);
    }

    // 4. Seed Documents with Real SHA-256 Hashes
    const documents = [
      {
        id: 'DOC-2026-001',
        bidderId: 'B-001',
        category: 'Technical Specifications',
        filename: 'Technical Proposal - B-001.pdf',
        sizeFormatted: '2.4 MB',
        sizeBytes: 2516582,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pageCount: 142,
        confidence: 0.94,
        text: 'Shanghai Grid Metal Corp technical proposal for 400kV Lessos-Tororo Transmission Line. Detailed engineering methodology, 12 certified EBK engineers listed, stringing equipment lineup, and ISO 9001 quality certificates attached.'
      },
      {
        id: 'DOC-2026-002',
        bidderId: 'B-002',
        category: 'Financial Bid',
        filename: 'Financial Schedule - B-002.pdf',
        sizeFormatted: '1.8 MB',
        sizeBytes: 1887436,
        hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        pageCount: 88,
        confidence: 0.91,
        text: 'Athi River Electricals Ltd financial schedule and audited accounts for 2023, 2024, 2025. Current ratio 2.1, KCB Bank Kenya confirmed credit line of KES 250M, KRA tax compliance certificate verified real-time.'
      },
      {
        id: 'DOC-00495',
        bidderId: 'B-003',
        category: 'Past Project Portfolio',
        filename: 'Past Project Portfolio - B-003.pdf',
        sizeFormatted: '3.2 MB',
        sizeBytes: 3355443,
        hash: 'c2e0b57128f7d9834241e1273934d4ff49b293847291a8293849102938475819',
        pageCount: 160,
        confidence: 0.86,
        text: 'Siemens Energy Kenya project portfolio demonstrating 4 regional 400kV substation and line projects completed under budget with zero liquidated damages.'
      },
      {
        id: 'DOC-00512',
        bidderId: 'B-004',
        category: 'Technical Capacity Statement',
        filename: 'Technical Capacity Statement - B-004.pdf',
        sizeFormatted: '1.9 MB',
        sizeBytes: 1992294,
        hash: '4d8f9a2e3c1b7d5e6a9f0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
        pageCount: 94,
        confidence: 0.78,
        text: 'Larsen & Toubro technical capacity and equipment inventory including hydraulic tensioners, pullers, and stringing blocks meeting IEEE C57.'
      },
      {
        id: 'DOC-00536',
        bidderId: 'B-005',
        category: 'Financial Schedule & Guarantees',
        filename: 'Financial Schedule & Guarantees - B-005.pdf',
        sizeFormatted: '2.1 MB',
        sizeBytes: 2202009,
        hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        pageCount: 112,
        confidence: 0.91,
        text: 'TBEA Transmission Co. tender security bond of KES 97M issued by Tier 1 Commercial Bank valid for 180 days from closing deadline.'
      },
      {
        id: 'DOC-00541',
        bidderId: 'B-006',
        category: 'Methodology & Work Plan',
        filename: 'Methodology & Work Plan - B-006.pdf',
        sizeFormatted: '1.5 MB',
        sizeBytes: 1572864,
        hash: '3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e',
        pageCount: 76,
        confidence: 0.84,
        text: 'Mitsubishi Power Africa execution work plan with wayleave acquisition timelines along Rift Valley corridor and NEMA certified ESIA.'
      }
    ];

    for (const d of documents) {
      await db.run(`
        INSERT INTO evaluation_documents (
          id, tender_id, bidder_id, category, filename, file_size_bytes, file_size_formatted,
          file_hash_sha256, page_count, storage_path, extracted_text, confidence_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [d.id, tenderId, d.bidderId, d.category, d.filename, d.sizeBytes, d.sizeFormatted, d.hash, d.pageCount, `/storage/tenders/${tenderId}/${d.filename}`, d.text, d.confidence]);
    }

    // 5. Seed Evidences
    const evidences = [
      { id: 'EVID-001', docId: 'DOC-2026-001', bidderId: 'B-001', code: 'T3', page: 24, sec: 'Section 4.2 - Plant & Machinery', text: '3 years relevant transmission line EPC experience verified (Lessos corridor); 12 certified technical engineers listed with valid EBK licenses; Equipment specifications compliant with IEC 60826 & KETRACO TS-04.', hash: 'hash-evid-001' },
      { id: 'EVID-002', docId: 'DOC-2026-002', bidderId: 'B-002', code: 'F2', page: 12, sec: 'Section 3.1 - Solvency & Facilities', text: 'Current ratio of 2.1 verified against audited accounts for 2024 & 2025; Bank credit line of KES 250M confirmed active with KCB Bank Kenya; Tax compliance certificate pin P051283840Z verified real-time with KRA.', hash: 'hash-evid-002' },
      { id: 'EVID-003', docId: 'DOC-00495', bidderId: 'B-003', code: 'T1', page: 45, sec: 'Section 2.4 - Reference Projects', text: '4 reference letters from regional utility operators confirmed (TANESCO & UETCL); Historical completion variance under 5% over 5 preceding fiscal years; Zero litigation or liquidated damages recorded in national CR12 registry.', hash: 'hash-evid-003' },
      { id: 'EVID-004', docId: 'DOC-00512', bidderId: 'B-004', code: 'T3', page: 18, sec: 'Section 4.1 - Stringing Machinery', text: 'Heavy equipment calibration certificates up to date with KEBS; Substation testing instruments meet IEEE C57 standards; Subcontractor arrangement for stringing machinery validated with proof of ownership.', hash: 'hash-evid-004' },
      { id: 'EVID-005', docId: 'DOC-00536', bidderId: 'B-005', code: 'F1', page: 8, sec: 'Section 1.2 - Tender Security Guarantee', text: 'Tender security bond of 2% (KES 97M) verified with Tier 1 Commercial Bank; Price deviation within -3.5% of internal engineers estimate; Zero arithmetic errors detected upon computational verification across 48 line items.', hash: 'hash-evid-005' },
      { id: 'EVID-006', docId: 'DOC-00541', bidderId: 'B-006', code: 'T4', page: 31, sec: 'Section 3.3 - Environmental Safeguards', text: 'Gantt schedule accounts for wayleave acquisition timeline (Rift Valley corridor); Environmental and Social Impact Assessment (ESIA) plan certified by NEMA; Safety and hazard mitigation protocols certified ISO 45001.', hash: 'hash-evid-006' }
    ];

    for (const e of evidences) {
      await db.run(`
        INSERT INTO evaluation_evidences (
          id, document_id, tender_id, bidder_id, criterion_code, page_number, section_reference,
          extracted_content, confidence, extraction_method, reviewer_validation, evidence_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.94, 'OCR_AND_SEMANTIC_ANALYSIS', 'VALIDATED_BY_EVALUATOR', ?)
      `, [e.id, e.docId, tenderId, e.bidderId, e.code, e.page, e.sec, e.text, e.hash]);
    }

    // 6. Seed Evaluator Scores
    const scores = [
      { id: 'SCR-001', bidderId: 'B-001', code: 'T3', evalId: 'E-017', evalName: 'Eng. K. Kiprop', score: 90.0, rationale: 'Meets all key technical requirements with minor gaps in methodology.', comment: 'The bidder meets the technical requirements and demonstrates adequate capacity for delivery.' },
      { id: 'SCR-002', bidderId: 'B-002', code: 'F2', evalId: 'E-021', evalName: 'CPA M. Ombati', score: 85.0, rationale: 'Adequate liquidity with acceptable debt ratio.', comment: 'Audited balance sheets demonstrate sufficient working capital for mobilization.' },
      { id: 'SCR-003', bidderId: 'B-003', code: 'T1', evalId: 'E-009', evalName: 'Dr. J. Njoroge', score: 80.0, rationale: 'Exemplary project delivery standards across Eastern Africa.', comment: 'Strong multinational performance record, minor scheduling dispute in 2023 satisfactorily explained.' },
      { id: 'SCR-004', bidderId: 'B-004', code: 'T3', evalId: 'E-017', evalName: 'Eng. K. Kiprop', score: 75.0, rationale: 'Passes threshold requirements.', comment: 'Competent equipment lineup; leased machinery agreements are legally binding.' },
      { id: 'SCR-005', bidderId: 'B-005', code: 'F1', evalId: 'E-022', evalName: 'H. Mutua', score: 88.0, rationale: 'Financially sound and cost-effective.', comment: 'Competitive financial breakdown with transparent Bill of Quantities allocation.' },
      { id: 'SCR-006', bidderId: 'B-006', code: 'T4', evalId: 'E-013', evalName: 'S. Chebet', score: 80.0, rationale: 'Comprehensive execution scheme with well-defined critical path.', comment: 'Methodology is rigorous and incorporates site-specific climatic contingencies.' }
    ];

    for (const s of scores) {
      await db.run(`
        INSERT INTO evaluator_scores (
          id, tender_id, bidder_id, criterion_code, evaluator_id, evaluator_name,
          score, max_score, normalized_score, rationale, comments, version, is_locked, digital_signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 100, ?, ?, ?, 1, 1, ?)
      `, [s.id, tenderId, s.bidderId, s.code, s.evalId, s.evalName, s.score, s.score, s.rationale, s.comment, `SIG-RSA-${s.evalId}-${Date.now()}`]);
    }

    // 7. Seed Initial Cryptographic Audit Chain
    const auditChain = [
      {
        id: 'EVT-00836',
        actorId: 'E-009',
        actorName: 'Dr. J. Njoroge',
        role: 'TECHNICAL_EVALUATOR',
        action: 'SUBMIT_TECHNICAL_SCORE',
        law: 'PPADA 2015 Section 79',
        crit: 'T1',
        bidder: 'B-003',
        summary: 'Technical past performance score of 80/100 submitted for Siemens Energy Kenya.',
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
        blockHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
      },
      {
        id: 'EVT-00839',
        actorId: 'E-021',
        actorName: 'CPA M. Ombati',
        role: 'FINANCIAL_EVALUATOR',
        action: 'VERIFY_FINANCIAL_LIQUIDITY',
        law: 'PPADR 2020 Reg 74',
        crit: 'F2',
        bidder: 'B-002',
        summary: 'Financial liquidity score of 85/100 verified for Athi River Electricals Ltd.',
        prevHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        blockHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
      },
      {
        id: 'EVT-00842',
        actorId: 'E-017',
        actorName: 'Eng. K. Kiprop',
        role: 'TECHNICAL_EVALUATOR',
        action: 'SUBMIT_TECHNICAL_SCORE',
        law: 'PPADA 2015 Section 79',
        crit: 'T3',
        bidder: 'B-001',
        summary: 'Technical capacity score of 90/100 submitted for Shanghai Grid Metal Corp.',
        prevHash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        blockHash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
      }
    ];

    for (const a of auditChain) {
      await db.run(`
        INSERT INTO evaluation_audit_blocks (
          block_id, tender_id, timestamp, actor_id, actor_name, actor_role,
          action, legal_authority, criteria_ref, bidder_ref, payload_summary, previous_hash, block_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [a.id, tenderId, new Date().toISOString(), a.actorId, a.actorName, a.role, a.action, a.law, a.crit, a.bidder, a.summary, a.prevHash, a.blockHash]);
    }

    // 8. Seed Conflict Declarations
    await db.run(`
      INSERT INTO evaluation_conflict_declarations (
        id, tender_id, actor_id, actor_name, role, declaration_type, details, status,
        approving_authority, resolution_details, digital_signature_hash
      ) VALUES (
        'CONF-001', ?, 'E-017', 'Eng. K. Kiprop', 'TECHNICAL_EVALUATOR', 'NONE',
        'No direct, indirect, family, or financial interest in any of the 6 participating bidders.',
        'CLEARED', 'Dr. John Mutua, Managing Director & Accounting Officer', 'Verified and cleared to evaluate.',
        'sig-conf-017-sha256'
      )
    `, [tenderId]);

    // 9. Seed Committee Session
    await db.run(`
      INSERT INTO committee_sessions (
        id, tender_id, committee_code, session_type, date_held, quorum_verified, quorum_count, total_appointed,
        members_present_json, agenda, deliberations, consensus_reached, resolution_number, digital_seal
      ) VALUES (
        'SESS-TEC-041-01', ?, 'TEC-001', 'DELIBERATION_AND_CONSENSUS', '2026-05-02T10:00:00Z', 1, 5, 5,
        '["Eng. David Kiprono (Chair)", "Eng. K. Kiprop", "CPA M. Ombati", "Dr. J. Njoroge", "H. Mutua"]',
        'Verification of preliminary responsiveness and technical evaluation scoring',
        'The committee reviewed all 6 submissions. Bidders B-001 through B-006 met the 75% threshold. Consensus achieved on all scores.',
        1, 'RES-2026-TEC-041', 'SEAL-KETRACO-TEC-2026'
      )
    `, [tenderId]);

    // 10. Seed Workflow Tasks
    await db.run(`
      INSERT INTO evaluation_tasks (
        id, tender_id, title, owner_id, owner_name, owner_role, priority, status, due_date, entity_type, entity_id
      ) VALUES 
      ('TASK-001', ?, 'Conduct Arithmetic Check on Athi River Electricals Line Items', 'E-021', 'CPA M. Ombati', 'FINANCIAL_EVALUATOR', 'HIGH', 'COMPLETED', '2026-05-05', 'BIDDER', 'B-002'),
      ('TASK-002', ?, 'Review Minor Variance in Shanghai Grid Methodology (-4%)', 'E-017', 'Eng. K. Kiprop', 'TECHNICAL_EVALUATOR', 'MEDIUM', 'IN_PROGRESS', '2026-05-08', 'SCORE', 'SCR-001'),
      ('TASK-003', ?, 'Convene Financial Bid Opening & Public Register Verification', 'COMM-01', 'Eng. David Kiprono', 'COMMITTEE_CHAIR', 'HIGH', 'PENDING', '2026-05-09', 'QUORUM', 'SESS-TEC-041-01')
    `, [tenderId, tenderId, tenderId]);
  }
}
