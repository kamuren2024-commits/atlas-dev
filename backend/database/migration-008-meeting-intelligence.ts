/**
 * PHASE 08: DATABASE MIGRATION 008 — KETRACO PRODUCTION MEETING INTELLIGENCE
 * 
 * Creates durable persistence for:
 * - Meeting entities & agendas (Board, Project/PDS, Procurement, Stakeholder, SCM)
 * - Timestamped transcript segments & live audio feeds
 * - Real-time AI extracted intelligence items (with Accept/Edit/Reject governance)
 * - Decision register with human approval audit ledger & state transitions
 * - Action control work queue with closed-loop verification & escalation
 * - Contractor/Supplier/Management commitments
 * - Project & tender risks & issues
 * - Procurement pre-bid clarifications & tender clause mapping
 * - Structured KETRACO-grade AI minutes (Draft → Secretary Review → Chair Approval → Locked)
 * - Real-time notifications & audit logging
 * - Knowledge graph entity bindings
 */

import { DatabaseCore } from './db-core';

export class MeetingIntelligenceMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS meeting_entities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        meeting_type TEXT NOT NULL DEFAULT 'GENERAL',
        room TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'READY',
        priority TEXT NOT NULL DEFAULT 'HIGH',
        preparation_pct INTEGER NOT NULL DEFAULT 78,
        objective TEXT NOT NULL,
        department TEXT NOT NULL DEFAULT 'SCM',
        project_id TEXT,
        pds_stage TEXT,
        tender_id TEXT,
        contract_id TEXT,
        current_stage TEXT NOT NULL DEFAULT 'LIVE_MEETING',
        lifecycle_version INTEGER NOT NULL DEFAULT 1,
        participants_json TEXT NOT NULL DEFAULT '[]',
        agenda_json TEXT NOT NULL DEFAULT '[]',
        documents_json TEXT NOT NULL DEFAULT '[]',
        prior_meetings_count INTEGER NOT NULL DEFAULT 4,
        open_decisions_count INTEGER NOT NULL DEFAULT 3,
        previous_signals_json TEXT NOT NULL DEFAULT '[]',
        open_commitments_json TEXT NOT NULL DEFAULT '[]',
        relevant_entities_json TEXT NOT NULL DEFAULT '[]',
        provider_json TEXT NOT NULL DEFAULT '{}',
        calendar_json TEXT NOT NULL DEFAULT '{}',
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_transcripts (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        speaker TEXT NOT NULL,
        speaker_role TEXT,
        timestamp_label TEXT NOT NULL,
        start_seconds INTEGER NOT NULL DEFAULT 0,
        text TEXT NOT NULL,
        confidence INTEGER NOT NULL DEFAULT 95,
        sentiment TEXT DEFAULT 'NEUTRAL',
        is_key_point INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_signals (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        signal_type TEXT NOT NULL,
        speaker TEXT,
        timestamp_label TEXT NOT NULL,
        text TEXT NOT NULL,
        suggested_title TEXT,
        evidence_count INTEGER NOT NULL DEFAULT 1,
        confidence INTEGER NOT NULL DEFAULT 90,
        entity_tag TEXT NOT NULL,
        category_tag TEXT NOT NULL,
        evidence_quote TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        reviewed_by TEXT,
        reviewed_at TEXT,
        review_notes TEXT,
        promoted_entity_id TEXT,
        provenance_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_decisions (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'AWAITING_APPROVAL',
        authority TEXT NOT NULL DEFAULT 'SCM Committee',
        owner TEXT NOT NULL,
        meeting_id TEXT,
        meeting_name TEXT,
        meeting_date TEXT,
        project_id TEXT,
        entity_name TEXT,
        confidence INTEGER NOT NULL DEFAULT 90,
        requires_human_approval INTEGER NOT NULL DEFAULT 1,
        evidence_text TEXT,
        implementation_notes TEXT,
        approved_by TEXT,
        approved_at TEXT,
        audit_trail_json TEXT NOT NULL DEFAULT '[]',
        version INTEGER NOT NULL DEFAULT 1,
        supersedes_decision_id TEXT,
        source_meeting_id TEXT,
        source_evidence_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_actions (
        id TEXT PRIMARY KEY,
        action_title TEXT NOT NULL,
        description TEXT,
        owner TEXT NOT NULL,
        department TEXT NOT NULL DEFAULT 'SCM',
        due_date TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'HIGH',
        status TEXT NOT NULL DEFAULT 'ON_TRACK',
        project_id TEXT,
        source_meeting_id TEXT,
        source_meeting_title TEXT,
        evidence_text TEXT,
        dependencies_json TEXT NOT NULL DEFAULT '[]',
        linked_entities_json TEXT NOT NULL DEFAULT '[]',
        verification_notes TEXT,
        verified_by TEXT,
        completed_at TEXT,
        escalation_level INTEGER NOT NULL DEFAULT 0,
        escalated_to TEXT,
        last_notified_at TEXT,
        workflow_triggered INTEGER NOT NULL DEFAULT 0,
        workflow_id TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        supersedes_action_id TEXT,
        source_decision_id TEXT,
        source_evidence_json TEXT NOT NULL DEFAULT '[]',
        confirmation_actor TEXT,
        confirmed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_commitments (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        commitment_title TEXT NOT NULL,
        party TEXT NOT NULL,
        owner TEXT NOT NULL,
        target_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        evidence_ref TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_risks (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        risk_title TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        likelihood TEXT NOT NULL DEFAULT 'MEDIUM',
        mitigation_plan TEXT NOT NULL,
        owner TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        project_id TEXT,
        tender_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_procurement_clarifications (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        tender_id TEXT NOT NULL,
        tender_clause TEXT NOT NULL,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        clarification_status TEXT NOT NULL DEFAULT 'PUBLISHED',
        addendum_required INTEGER NOT NULL DEFAULT 0,
        evidence_ref TEXT NOT NULL,
        action_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_minutes (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'AI_DRAFT',
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        chair TEXT NOT NULL,
        secretary TEXT NOT NULL,
        attendees_json TEXT NOT NULL DEFAULT '[]',
        apologies_json TEXT NOT NULL DEFAULT '[]',
        executive_summary TEXT NOT NULL,
        agenda_proceedings_json TEXT NOT NULL DEFAULT '[]',
        decisions_json TEXT NOT NULL DEFAULT '[]',
        actions_json TEXT NOT NULL DEFAULT '[]',
        commitments_json TEXT NOT NULL DEFAULT '[]',
        risks_and_issues_json TEXT NOT NULL DEFAULT '[]',
        procurement_clarifications_json TEXT NOT NULL DEFAULT '[]',
        next_meeting_notes TEXT,
        version_lock_hash TEXT,
        approved_by_chair TEXT,
        approved_at TEXT,
        published_at TEXT,
        audit_events_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_recording_sessions (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL DEFAULT 'ketraco',
        status TEXT NOT NULL DEFAULT 'IDLE',
        started_at TEXT,
        ended_at TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        media_type TEXT NOT NULL DEFAULT 'audio/webm',
        codec TEXT,
        storage_ref TEXT,
        checksum TEXT,
        size_bytes INTEGER NOT NULL DEFAULT 0,
        created_by TEXT NOT NULL DEFAULT 'browser-recorder',
        version TEXT NOT NULL DEFAULT '1.0',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_evidence (
        id TEXT PRIMARY KEY,
        meeting_id TEXT,
        evidence_type TEXT NOT NULL,
        title TEXT NOT NULL,
        date_label TEXT,
        quote TEXT NOT NULL,
        source_ref TEXT NOT NULL,
        entity_tag TEXT NOT NULL,
        category_tag TEXT NOT NULL,
        confidence INTEGER NOT NULL DEFAULT 90,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_memory (
        id TEXT PRIMARY KEY,
        meeting_id TEXT,
        title TEXT NOT NULL,
        date_label TEXT NOT NULL,
        decisions_count INTEGER NOT NULL DEFAULT 0,
        actions_count INTEGER NOT NULL DEFAULT 0,
        risks_count INTEGER NOT NULL DEFAULT 0,
        tags_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'INFO',
        link TEXT,
        read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_audit_ledger (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        details_json TEXT NOT NULL DEFAULT '{}',
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meeting_participants (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'MEMBER',
        attendance TEXT NOT NULL DEFAULT 'INVITED',
        organization TEXT,
        department TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meeting_entities(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_participants_uniq ON meeting_participants(meeting_id, name);

      CREATE TABLE IF NOT EXISTS meeting_agenda_items (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        sequence INTEGER NOT NULL DEFAULT 1,
        title TEXT NOT NULL,
        description TEXT,
        presenter TEXT,
        linked_entity TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        duration_minutes INTEGER DEFAULT 15,
        completed INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meeting_entities(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_meeting_agenda_meeting ON meeting_agenda_items(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_meeting_agenda_seq ON meeting_agenda_items(meeting_id, sequence);

      CREATE TABLE IF NOT EXISTS meeting_documents (
        id TEXT PRIMARY KEY,
        meeting_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'GENERAL',
        size TEXT DEFAULT '1.0 MB',
        summary TEXT,
        url TEXT,
        uploaded_by TEXT,
        uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES meeting_entities(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_meeting_documents_meeting ON meeting_documents(meeting_id);

      CREATE TABLE IF NOT EXISTS meeting_lifecycle_events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        correlation_id TEXT,
        tenant_id TEXT DEFAULT 'ketraco',
        metadata_json TEXT DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_meeting_lifecycle_entity ON meeting_lifecycle_events(entity_id);
      CREATE INDEX IF NOT EXISTS idx_meeting_lifecycle_type ON meeting_lifecycle_events(event_type);
    `);

    // Add safe column additions in case tables were previously created with older schema
    const alterQueries = [
      "ALTER TABLE meeting_entities ADD COLUMN meeting_type TEXT DEFAULT 'GENERAL'",
      "ALTER TABLE meeting_entities ADD COLUMN department TEXT DEFAULT 'SCM'",
      "ALTER TABLE meeting_entities ADD COLUMN project_id TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN pds_stage TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN tender_id TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN contract_id TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN current_stage TEXT DEFAULT 'LIVE_MEETING'",
      "ALTER TABLE meeting_entities ADD COLUMN agenda_json TEXT DEFAULT '[]'",
      "ALTER TABLE meeting_entities ADD COLUMN documents_json TEXT DEFAULT '[]'",
      "ALTER TABLE meeting_entities ADD COLUMN description TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN chair TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN secretary TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN created_by TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN venue TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN started_at TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN paused_at TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN resumed_at TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN ended_at TEXT",
      "ALTER TABLE meeting_entities ADD COLUMN total_paused_ms INTEGER DEFAULT 0",
      "ALTER TABLE meeting_entities ADD COLUMN lifecycle_version INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE meeting_entities ADD COLUMN linked_entities_json TEXT DEFAULT '[]'",
      "ALTER TABLE meeting_entities ADD COLUMN provider_json TEXT DEFAULT '{}'",
      "ALTER TABLE meeting_entities ADD COLUMN calendar_json TEXT DEFAULT '{}'",
      "ALTER TABLE meeting_signals ADD COLUMN suggested_title TEXT",
      "ALTER TABLE meeting_signals ADD COLUMN evidence_quote TEXT",
      "ALTER TABLE meeting_signals ADD COLUMN status TEXT DEFAULT 'PENDING'",
      "ALTER TABLE meeting_signals ADD COLUMN reviewed_by TEXT",
      "ALTER TABLE meeting_signals ADD COLUMN reviewed_at TEXT",
      "ALTER TABLE meeting_signals ADD COLUMN review_notes TEXT",
      "ALTER TABLE meeting_signals ADD COLUMN promoted_entity_id TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN description TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN authority TEXT DEFAULT 'SCM Committee'",
      "ALTER TABLE meeting_decisions ADD COLUMN project_id TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN entity_name TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN evidence_text TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN implementation_notes TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN version INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE meeting_decisions ADD COLUMN supersedes_decision_id TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN source_meeting_id TEXT",
      "ALTER TABLE meeting_decisions ADD COLUMN source_evidence_json TEXT NOT NULL DEFAULT '[]'",
      "ALTER TABLE meeting_decisions ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE meeting_actions ADD COLUMN description TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN department TEXT DEFAULT 'SCM'",
      "ALTER TABLE meeting_actions ADD COLUMN priority TEXT DEFAULT 'HIGH'",
      "ALTER TABLE meeting_actions ADD COLUMN project_id TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN source_meeting_id TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN source_meeting_title TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN evidence_text TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN dependencies_json TEXT DEFAULT '[]'",
      "ALTER TABLE meeting_actions ADD COLUMN verification_notes TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN verified_by TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN completed_at TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN escalation_level INTEGER DEFAULT 0",
      "ALTER TABLE meeting_actions ADD COLUMN escalated_to TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN last_notified_at TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE meeting_actions ADD COLUMN version INTEGER NOT NULL DEFAULT 1",
      "ALTER TABLE meeting_actions ADD COLUMN supersedes_action_id TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN source_decision_id TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN source_evidence_json TEXT NOT NULL DEFAULT '[]'",
      "ALTER TABLE meeting_actions ADD COLUMN confirmation_actor TEXT",
      "ALTER TABLE meeting_actions ADD COLUMN confirmed_at TEXT",
    ];

    for (const q of alterQueries) {
      try {
        await db.run(q);
      } catch (e) {
        // Ignored: column already exists
      }
    }

    // Seed canonical meetings across categories if missing
    await this.seedCanonicalDataset(db);
  }

  private static async seedCanonicalDataset(db: DatabaseCore): Promise<void> {
    const existing = await db.get('SELECT id FROM meeting_entities WHERE id = ?', ['MEETING_SCM_TRANSFORMATION_REVIEW']);
    if (!existing) {
      // 1. Primary Live Meeting: SCM Transformation Review
      await db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, current_stage, participants_json, agenda_json, documents_json,
          prior_meetings_count, open_decisions_count, previous_signals_json, open_commitments_json, relevant_entities_json, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MEETING_SCM_TRANSFORMATION_REVIEW',
          'KETRACO SCM Transformation Review',
          'GENERAL',
          'Executive Conference Room',
          'Today',
          '10:00',
          '11:00',
          'LIVE',
          'HIGH',
          78,
          'Validate implementation progress, verify KRA adapter integration, and resolve statutory procurement workflow blockers.',
          'SCM',
          'PRJ-SCM-MOD-2025',
          'Procurement',
          'LIVE_MEETING',
          JSON.stringify([
            { name: 'Kamuren Wanjau', role: 'Operations Director', department: 'Executive', email: 'kamuren@ketraco.co.ke', attended: true },
            { name: 'John Kamau', role: 'SCM Lead', department: 'Supply Chain', email: 'jkamau@ketraco.co.ke', attended: true },
            { name: 'Eng. Patrick Odhiambo', role: 'Grid Infrastructure Specialist', department: 'Engineering', email: 'podhiambo@ketraco.co.ke', attended: true },
            { name: 'Grace Mutua', role: 'ICT Integration Lead', department: 'ICT', email: 'gmutua@ketraco.co.ke', attended: true },
            { name: 'David Kiprono', role: 'Procurement Specialist', department: 'Procurement', email: 'dkiprono@ketraco.co.ke', attended: true },
            { name: 'Sarah Ochieng', role: 'Compliance Officer', department: 'Legal & Risk', email: 'sochieng@ketraco.co.ke', attended: true },
            { name: 'Peter Karanja', role: 'Finance Analyst', department: 'Finance', email: 'pkaranja@ketraco.co.ke', attended: true }
          ]),
          JSON.stringify([
            { id: 'AG_01', order: 1, title: 'Adoption of Agenda & Minutes of Previous SCM Review', presenter: 'John Kamau', duration_minutes: 10, completed: true, objective: 'Formal adoption of Aug 21 proceedings' },
            { id: 'AG_02', order: 2, title: 'KRA Verification Adapter Integration & Evaluation OS Compliance', presenter: 'Grace Mutua', duration_minutes: 20, completed: false, objective: 'Resolve integration owner and technical dependency' },
            { id: 'AG_03', order: 3, title: 'Supplier Data Validation Quality Audit (Mombasa & Nairobi Substations)', presenter: 'Eng. Patrick Odhiambo', duration_minutes: 15, completed: false, objective: 'Review audit findings and approve remediation' },
            { id: 'AG_04', order: 4, title: 'Review of Statutory PPADA Tender Evaluation Gateways', presenter: 'David Kiprono', duration_minutes: 10, completed: false, objective: 'Align committee sign-offs with PPADA Section 71' },
            { id: 'AG_05', order: 5, title: 'Any Other Business & Action Plan Finalization', presenter: 'Kamuren Wanjau', duration_minutes: 5, completed: false, objective: 'Confirm action owners and execution timelines' }
          ]),
          JSON.stringify([
            { id: 'DOC_01', name: 'KETRACO-SCM-Audit-Q3-2025.pdf', category: 'Audit', size: '2.4 MB', summary: 'Quarterly supplier validation audit across transmission substations.', uploaded_at: '2025-09-08' },
            { id: 'DOC_02', name: 'Evaluation-OS-API-Specs-v4.2.pdf', category: 'Technical', size: '1.8 MB', summary: 'Technical interface specifications for KRA PIN and Tax Compliance verification.', uploaded_at: '2025-09-07' },
            { id: 'DOC_03', name: 'PPADA-Section71-Compliance-Guidelines.pdf', category: 'Regulatory', size: '840 KB', summary: 'Public Procurement and Asset Disposal Act statutory evaluation thresholds.', uploaded_at: '2025-08-15' }
          ]),
          4,
          3,
          JSON.stringify(['Supplier data quality concern', 'Integration timeline at risk', 'Stakeholder alignment needed']),
          JSON.stringify(['Complete supplier validation', 'Review tender evaluation workflow', 'Confirm integration owner']),
          JSON.stringify([
            { label: 'SCM Transformation', type: 'Project' },
            { label: 'KRA', type: 'Supplier' },
            { label: 'Evaluation OS', type: 'System' }
          ]),
          'ketraco'
        ]
      );

      // 2. Board & Committee Meeting
      await db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, current_stage, participants_json, agenda_json, documents_json, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MEETING_BOARD_TECH_COMMITTEE_2026',
          'Board Technical Committee: 400kV Grid Expansion Capital Expenditure',
          'BOARD_COMMITTEE',
          'Boardroom A, KETRACO Plaza',
          'Sep 15, 2025',
          '09:00',
          '13:00',
          'SCHEDULED',
          'URGENT',
          92,
          'Review capital allocation, EPC contract variations, and environmental risk mitigations for Western Kenya transmission loop.',
          'Board Secretariat',
          'PRJ-SUSWA-ISINYA-400KV',
          'Financing',
          'CONFIGURE',
          JSON.stringify([
            { name: 'Dr. Joseph Njoroge', role: 'Committee Chair', department: 'Board', email: 'chair.tech@ketraco.co.ke' },
            { name: 'Dr. John Mativo', role: 'Managing Director & CEO', department: 'Executive', email: 'md@ketraco.co.ke' },
            { name: 'Kamuren Wanjau', role: 'Operations Director', department: 'Executive', email: 'kamuren@ketraco.co.ke' },
            { name: 'Eng. Peter Chege', role: 'General Manager Project Development', department: 'Projects', email: 'pchege@ketraco.co.ke' }
          ]),
          JSON.stringify([
            { id: 'AG_B01', order: 1, title: 'Review of Suswa-Isinya 400kV CapEx Reconciliation', presenter: 'Finance GM', duration_minutes: 45, completed: false },
            { id: 'AG_B02', order: 2, title: 'Contract Variation Approvals under PPADA §139', presenter: 'Kamuren Wanjau', duration_minutes: 60, completed: false }
          ]),
          JSON.stringify([
            { id: 'DOC_B01', name: 'Board-Paper-CapEx-Reconciliation-2026.pdf', category: 'Board Paper', size: '5.2 MB', summary: 'Comprehensive capital reconciliation for 400kV grid backbone.', uploaded_at: '2025-09-05' }
          ]),
          'ketraco'
        ]
      );

      // 3. Project Meeting (PDS Stage: Construction)
      await db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, current_stage, participants_json, agenda_json, documents_json, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MEETING_PRJ_SUSWA_ISINYA_M4',
          'Suswa-Isinya 400kV Line Project: Milestone 4 Tower Erection Review',
          'PROJECT',
          'Site Office / Virtual Hybrid',
          'Sep 14, 2025',
          '14:00',
          '16:30',
          'SCHEDULED',
          'HIGH',
          85,
          'Assess contractor delivery pace, tower foundations in Section B (Towers 112 to 148), and wayleave access clearance.',
          'Project Delivery',
          'PRJ-SUSWA-ISINYA-400KV',
          'Construction',
          'CONFIGURE',
          JSON.stringify([
            { name: 'Eng. Francis Kipchumba', role: 'Project Manager', department: 'Projects' },
            { name: 'Li Wei', role: 'Contractor Project Director', department: 'Shanghai Electric' },
            { name: 'Mary Waweru', role: 'Wayleave Officer', department: 'Land & RAP' }
          ]),
          JSON.stringify([
            { id: 'AG_P01', order: 1, title: 'Progress on Tower Foundation Curing (Section B)', presenter: 'Francis Kipchumba', duration_minutes: 30, completed: false },
            { id: 'AG_P02', order: 2, title: 'Soil Test Anomalies at Tower 124', presenter: 'Civil Lead', duration_minutes: 30, completed: false }
          ]),
          JSON.stringify([
            { id: 'DOC_P01', name: 'Suswa-Isinya-Tower-Erection-Weekly-Status.pdf', category: 'Project Status', size: '3.1 MB', summary: 'Tower foundation and conductor stringing progress.', uploaded_at: '2025-09-08' }
          ]),
          'ketraco'
        ]
      );

      // 4. Procurement Meeting: Pre-Bid Clarification
      await db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, tender_id, current_stage, participants_json, agenda_json, documents_json, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MEETING_PROC_TENDER_TRANSFORMERS_2026',
          'Pre-Bid Clarification Meeting: 220/66kV Substation Transformers (Tender KTR/2026/08)',
          'PROCUREMENT',
          'Auditorium 2 / Public Webcast',
          'Sep 11, 2025',
          '11:00',
          '13:00',
          'SCHEDULED',
          'HIGH',
          90,
          'Respond to prospective bidders inquiries, clarify FAT test factory standards, and issue binding addendum criteria.',
          'Procurement',
          'PRJ-SUBSTATION-UPGRADE-2026',
          'Procurement',
          'TENDER-KTR-2026-08',
          'CONFIGURE',
          JSON.stringify([
            { name: 'David Kiprono', role: 'Tender Committee Chair', department: 'Procurement' },
            { name: 'Eng. Patrick Odhiambo', role: 'Technical Evaluator', department: 'Engineering' },
            { name: 'Sarah Ochieng', role: 'Procurement Oversight', department: 'Legal' },
            { name: 'Bidders Representatives (14 firms)', role: 'Prospective Suppliers', department: 'Industry' }
          ]),
          JSON.stringify([
            { id: 'AG_PR01', order: 1, title: 'Address Clauses 14.2 & 18.1 FAT Witness Testing Protocols', presenter: 'Patrick Odhiambo', duration_minutes: 40, completed: false },
            { id: 'AG_PR02', order: 2, title: 'Clarification on Local Content Requirement (40% PPADA)', presenter: 'David Kiprono', duration_minutes: 30, completed: false }
          ]),
          JSON.stringify([
            { id: 'DOC_PR01', name: 'Tender-Document-KTR-2026-08-Transformers.pdf', category: 'Tender Spec', size: '6.4 MB', summary: 'Official tender documentation for 220/66kV transmission power transformers.', uploaded_at: '2025-08-28' }
          ]),
          'ketraco'
        ]
      );

      // 5. Stakeholder Meeting (Wayleave & RAP)
      await db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, current_stage, participants_json, agenda_json, documents_json, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MEETING_STAKEHOLDER_KAJIADO_RAP',
          'Kajiado County Consultative Session: Wayleave Acquisition & PAP Compensation',
          'STAKEHOLDER',
          'Kajiado Town Hall',
          'Sep 18, 2025',
          '10:00',
          '14:00',
          'SCHEDULED',
          'HIGH',
          80,
          'Engage Project Affected Persons (PAPs), county land registrars, and community elders on compensation disbursements.',
          'Wayleave & RAP',
          'PRJ-SUSWA-ISINYA-400KV',
          'Wayleave/RAP',
          'CONFIGURE',
          JSON.stringify([
            { name: 'Mary Waweru', role: 'Head of Wayleaves', department: 'KETRACO' },
            { name: 'Hon. Alais Kisau', role: 'County Commissioner Representative', department: 'Kajiado County' },
            { name: 'Elders Council Representatives', role: 'Community Leadership', department: 'Local Administration' }
          ]),
          JSON.stringify([
            { id: 'AG_S01', order: 1, title: 'Disbursement Schedule for Segment 3 Land Owners', presenter: 'Mary Waweru', duration_minutes: 60, completed: false }
          ]),
          JSON.stringify([
            { id: 'DOC_S01', name: 'RAP-Valuation-Roll-Kajiado-2025.pdf', category: 'Valuation', size: '4.8 MB', summary: 'National Land Commission certified valuation roll for PAPs.', uploaded_at: '2025-09-02' }
          ]),
          'ketraco'
        ]
      );

      // 6. Transcripts for Live Meeting
      const transcripts = [
        ['TR_01', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Kamuren Wanjau', 'Operations Director', '10:01', 60, 'Good morning colleagues. We are convening this SCM Transformation Review to resolve two critical workflow gates: the KRA integration and supplier validation data readiness.', 98, 'NEUTRAL', 1],
        ['TR_02', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'John Kamau', 'SCM Lead', '10:04', 240, 'Thank you Director. As presented in our agenda, our key milestone is finalizing supplier validation records prior to the next procurement cycle.', 96, 'NEUTRAL', 0],
        ['TR_03', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Eng. Patrick Odhiambo', 'Grid Infrastructure Specialist', '10:07', 420, 'On the transformer inventory side, the data from Mombasa is clean. However, the Nairobi North substation batch has 14 suppliers with missing statutory tax compliance certificates.', 95, 'RISK', 1],
        ['TR_04', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Grace Mutua', 'ICT Integration Lead', '10:12', 720, 'We have completed the Evaluation OS API staging. But to verify against KRA automatically, ICT requires formal confirmation of the API key ownership from finance before Friday.', 97, 'NEUTRAL', 1],
        ['TR_05', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'David Kiprono', 'Procurement Specialist', '10:15', 900, 'Under PPADA Section 71, tenders above 50 million cannot proceed to award without validated tax status. If the KRA adapter is delayed past Friday, three high-voltage transformer awards will be stalled.', 96, 'CRITICAL', 1],
        ['TR_06', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Kamuren Wanjau', 'Operations Director', '10:18', 1080, 'Understood. Let us establish an executive decision: Decision D-0241 on the supplier validation architecture is adopted subject to ICT providing the end-to-end integration by Friday.', 99, 'POSITIVE', 1],
        ['TR_07', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Sarah Ochieng', 'Compliance Officer', '10:22', 1320, 'Legal concurs. We will append the audit certificate to the meeting record so the Evaluation Committee can proceed without regulatory exposure.', 96, 'POSITIVE', 0]
      ];

      for (const t of transcripts) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_transcripts (id, meeting_id, speaker, speaker_role, timestamp_label, start_seconds, text, confidence, sentiment, is_key_point)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          t
        );
      }

      // 7. Detected Intelligence Signals with Human Governance (Accept / Edit / Reject)
      const detectedSignals = [
        ['SIG_01', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'DECISION', 'Kamuren Wanjau', '10:18', 'Decision D-0241: Supplier validation architecture adopted with mandatory KRA adapter sign-off.', 'Supplier validation architecture approved', 94, 'Evaluation OS', 'DECISION', 'Understood. Let us establish an executive decision: Decision D-0241...', 'PENDING', null, null, null, null],
        ['SIG_02', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'ACTION', 'Grace Mutua', '10:12', 'ICT to deliver live KRA integration adapter for Evaluation OS before Friday 17:00 EAT.', 'Deliver KRA integration adapter', 96, 'ICT / KRA', 'ACTION', 'ICT requires formal confirmation of the API key ownership from finance before Friday.', 'PENDING', null, null, null, null],
        ['SIG_03', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'RISK', 'David Kiprono', '10:15', 'KRA verification dependency delaying procurement cycle for 3 high-voltage transformer tenders under PPADA Section 71.', 'Procurement stall risk on 3 HV transformers', 95, 'Procurement / PPADA', 'RISK', 'If the KRA adapter is delayed past Friday, three high-voltage transformer awards will be stalled.', 'ACCEPTED', 'Kamuren Wanjau', '2025-09-10T10:20:00Z', 'Verified high regulatory risk', 'RSK_01'],
        ['SIG_04', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'COMMITMENT', 'John Kamau', '10:04', 'PMO and SCM commit to deliver full supplier validation report by Friday COB.', 'Deliver supplier validation report', 92, 'SCM PMO', 'COMMITMENT', 'our key milestone is finalizing supplier validation records prior to the next procurement cycle.', 'ACCEPTED', 'Kamuren Wanjau', '2025-09-10T10:10:00Z', 'Direct commitment accepted', 'COM_01'],
        ['SIG_05', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'QUESTION', 'Eng. Patrick Odhiambo', '10:07', 'Who verifies Nairobi North substation 14 non-compliant supplier tax certificates?', 'Ownership of non-compliant supplier re-verification', 88, 'Engineering / SCM', 'QUESTION', 'Nairobi North substation batch has 14 suppliers with missing statutory tax compliance certificates.', 'PENDING', null, null, null, null],
        ['SIG_06', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'ESCALATION', 'David Kiprono', '10:15', 'Escalate statutory compliance block to Executive Committee if ICT sign-off exceeds Sep 12 deadline.', 'Escalation to Executive Committee on Statutory Block', 91, 'Executive', 'ESCALATION', 'tenders above 50 million cannot proceed to award without validated tax status', 'PENDING', null, null, null, null]
      ];

      for (const sig of detectedSignals) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_signals (id, meeting_id, signal_type, speaker, timestamp_label, text, suggested_title, confidence, entity_tag, category_tag, evidence_quote, status, reviewed_by, reviewed_at, review_notes, promoted_entity_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          sig
        );
      }

      // 8. Decisions
      const decisions = [
        ['DEC_01', 'D-0241', 'Supplier validation architecture sign-off', 'Adopt the automated KRA validation adapter into Evaluation OS workflow prior to statutory tender award.', 'AWAITING_APPROVAL', 'Operations Director / SCM Committee', 'Grace Mutua (ICT)', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'KETRACO SCM Transformation Review', 'Sep 10, 2025', 'PRJ-SCM-MOD-2025', 'Evaluation OS', 94, 1, 'Meeting Transcript segment 10:18: Decision D-0241 on the supplier validation architecture is adopted', 'ICT integration test passing, staging ready', null, null, JSON.stringify([{ action: 'PROPOSED_BY_AI', user: 'Meeting Intelligence Engine', timestamp: '2025-09-10T10:18:00Z' }])],
        ['DEC_02', 'D-0237', 'Evaluation OS Integration Authorization', 'Authorize production deployment of Evaluation OS v4.2 for statutory compliance auditing.', 'APPROVED', 'Managing Director & CEO', 'PMO Lead', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'KETRACO SCM Transformation Review', 'Aug 21, 2025', 'PRJ-SCM-MOD-2025', 'Evaluation OS', 98, 1, 'Aug 21 Proceedings §3: Formal sign-off granted by executive team.', 'Deployed to cloud container cluster on port 3000.', 'Dr. John Mativo', '2025-08-21T14:30:00Z', JSON.stringify([{ action: 'APPROVED', user: 'Dr. John Mativo', timestamp: '2025-08-21T14:30:00Z', note: 'Statutory compliance satisfied' }])],
        ['DEC_03', 'D-0228', 'Tender Evaluation Scoring Weighting Protocol', 'Implement 70/30 Technical to Financial score threshold on High-Voltage substation tenders.', 'IMPLEMENTED', 'Tender Committee', 'David Kiprono', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'Tender Evaluation Workshop', 'Jul 18, 2025', 'PRJ-SUBSTATION-UPGRADE-2026', 'Tender KTR/2026/08', 92, 1, 'Jul 18 Tender Committee Minutes Resolution 4.', 'Adopted in standard bidding documents.', 'David Kiprono', '2025-07-18T16:00:00Z', JSON.stringify([{ action: 'APPROVED', user: 'David Kiprono', timestamp: '2025-07-18T16:00:00Z' }])]
      ];

      for (const dec of decisions) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_decisions (id, code, title, description, status, authority, owner, meeting_id, meeting_name, meeting_date, project_id, entity_name, confidence, requires_human_approval, evidence_text, implementation_notes, approved_by, approved_at, audit_trail_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          dec
        );
      }

      // 9. Actions with Closed-Loop Automation
      const actions = [
        ['ACT_01', 'Complete Supplier Validation Report', 'Finalize data reconciliation of 14 suppliers from Nairobi North substation with KRA certificates.', 'John Kamau', 'SCM', '2025-09-12', 'HIGH', 'AT_RISK', 'PRJ-SCM-MOD-2025', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'KETRACO SCM Transformation Review', 'Mombasa batch complete; Nairobi North batch pending 14 tax clearance documents.', JSON.stringify(['ACT_02']), JSON.stringify(['Supplier', 'Project']), null, null, null, 1, 'Kamuren Wanjau (Operations Director)', '2025-09-09T14:00:00Z', 1, 'WF_ACT_01'],
        ['ACT_02', 'Deploy KRA Adapter into Evaluation OS', 'Wire API endpoints and test automated tax verification against live KRA staging portal.', 'Grace Mutua', 'ICT', '2025-09-12', 'CRITICAL', 'ON_TRACK', 'PRJ-SCM-MOD-2025', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'KETRACO SCM Transformation Review', 'Evaluation OS specs §4.2 verified with ICT security architecture.', JSON.stringify([]), JSON.stringify(['System', 'Project']), null, null, null, 0, null, '2025-09-09T10:00:00Z', 1, 'WF_ACT_02'],
        ['ACT_03', 'Executive Board Paper Preparation on Suswa CapEx', 'Compile audited milestone CapEx reconciliation and variance schedule for Board Tech Committee.', 'Peter Karanja', 'Finance', '2025-09-14', 'HIGH', 'ON_TRACK', 'PRJ-SUSWA-ISINYA-400KV', 'MEETING_BOARD_TECH_COMMITTEE_2026', 'Board Technical Committee', 'CapEx ledger reconciled up to Milestone 3.', JSON.stringify([]), JSON.stringify(['Board', 'Finance']), null, null, null, 0, null, null, 0, null],
        ['ACT_04', 'Issue Pre-Bid Clarification Addendum #1', 'Draft, sign, and publish technical addendum answering bidder questions on FAT inspection standards.', 'David Kiprono', 'Procurement', '2025-09-13', 'HIGH', 'UNDER_VERIFICATION', 'PRJ-SUBSTATION-UPGRADE-2026', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'Pre-Bid Clarification Meeting', 'Pre-Bid minutes compiled with clause 14.2 answers.', JSON.stringify([]), JSON.stringify(['Tender', 'Procurement']), 'Pending Head of Procurement final signature', 'David Kiprono', null, 0, null, null, 0, null],
        ['ACT_05', 'Resolve Kajiado PAP Compensation Claims', 'Coordinate with National Land Commission to disburse segment 3 verified PAP compensation payments.', 'Mary Waweru', 'Wayleave & RAP', '2025-09-20', 'MEDIUM', 'BLOCKED', 'PRJ-SUSWA-ISINYA-400KV', 'MEETING_STAKEHOLDER_KAJIADO_RAP', 'Kajiado County Consultative Session', 'Valuation roll approved, waiting treasury exchequer release.', JSON.stringify([]), JSON.stringify(['Wayleave', 'County']), null, null, null, 1, 'General Manager Projects', null, 0, null]
      ];

      for (const act of actions) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_actions (id, action_title, description, owner, department, due_date, priority, status, project_id, source_meeting_id, source_meeting_title, evidence_text, dependencies_json, linked_entities_json, verification_notes, verified_by, completed_at, escalation_level, escalated_to, last_notified_at, workflow_triggered, workflow_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          act
        );
      }

      // 10. Commitments
      const commitments = [
        ['COM_01', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Deliver reconciled supplier validation report by Friday COB', 'PMO / SCM Lead', 'John Kamau', '2025-09-12', 'ACTIVE', 'Meeting Transcript 10:04'],
        ['COM_02', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'Provide production KRA API adapter gateway with zero downtime', 'ICT Department', 'Grace Mutua', '2025-09-12', 'ACTIVE', 'Meeting Transcript 10:12'],
        ['COM_03', 'MEETING_PRJ_SUSWA_ISINYA_M4', 'Deploy additional soil reinforcement rigs at Tower 124 by Monday', 'Shanghai Electric (Contractor)', 'Li Wei', '2025-09-15', 'ACTIVE', 'Site Technical Minutes M4'],
        ['COM_04', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'Publish Addendum #1 answering all 14 bidder queries within 48 hours', 'Procurement Directorate', 'David Kiprono', '2025-09-13', 'ACTIVE', 'Pre-bid meeting recording']
      ];

      for (const com of commitments) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_commitments (id, meeting_id, commitment_title, party, owner, target_date, status, evidence_ref)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          com
        );
      }

      // 11. Risks & Issues
      const risks = [
        ['RSK_01', 'MEETING_SCM_TRANSFORMATION_REVIEW', 'KRA verification dependency delaying procurement cycle under PPADA §71', 'HIGH', 'HIGH', 'Deploy Evaluation OS automated tax compliance adapter and establish direct SLA with KRA Enterprise Support.', 'Grace Mutua / David Kiprono', 'OPEN', 'PRJ-SCM-MOD-2025', 'TENDER-KTR-2026-08'],
        ['RSK_02', 'MEETING_PRJ_SUSWA_ISINYA_M4', 'Soil bearing capacity variance at Tower 124 risking tower stability', 'HIGH', 'MEDIUM', 'Execute micro-piling depth extension from 8m to 14m as recommended by geotechnical report.', 'Eng. Patrick Odhiambo', 'OPEN', 'PRJ-SUSWA-ISINYA-400KV', null],
        ['RSK_03', 'MEETING_STAKEHOLDER_KAJIADO_RAP', 'Wayleave access restriction by PAPs over compensation schedule delay', 'MEDIUM', 'HIGH', 'Accelerate NLC payment vouchers and hold weekly baraza with community liaison committees.', 'Mary Waweru', 'MONITORING', 'PRJ-SUSWA-ISINYA-400KV', null]
      ];

      for (const r of risks) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_risks (id, meeting_id, risk_title, severity, likelihood, mitigation_plan, owner, status, project_id, tender_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          r
        );
      }

      // 12. Procurement Pre-Bid Clarifications
      const clarifications = [
        ['CLR_01', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'TENDER-KTR-2026-08', 'Clause 14.2 (FAT Testing)', 'Will KETRACO accept virtual FAT inspection for overseas transformer factory testing?', 'No. In accordance with KETRACO Grid Code Standards, physical attendance by two KETRACO certified electrical engineers is mandatory for all 220kV transformers.', 'PUBLISHED', 1, 'Tender Spec §14.2 Clarification Response', 'ACT_04'],
        ['CLR_02', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'TENDER-KTR-2026-08', 'Clause 18.1 (Delivery Schedule)', 'Can the 18-month delivery timeline be extended to 22 months due to global maritime shipping constraints?', 'Under review by Technical Evaluation Committee. A 2-month conditional extension is under evaluation via Addendum #1.', 'PENDING_TECHNICAL_REVIEW', 1, 'Bidder Query Letter ref BQ-04', 'ACT_04'],
        ['CLR_03', 'MEETING_PROC_TENDER_TRANSFORMERS_2026', 'TENDER-KTR-2026-08', 'Clause 22.4 (Local Content)', 'Must the local sub-contracting 40% threshold be substantiated at bid submission or post-award?', 'Bidders must submit formal letters of intent and registration certificates with indigenous Kenyan subcontractors at time of bid submission.', 'PUBLISHED', 0, 'PPADA §157 Statutory Directive', null]
      ];

      for (const clr of clarifications) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_procurement_clarifications (id, meeting_id, tender_id, tender_clause, question, response, clarification_status, addendum_required, evidence_ref, action_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          clr
        );
      }

      // 13. AI Minutes with Human Governance
      await db.run(
        `INSERT OR IGNORE INTO meeting_minutes (
          id, meeting_id, version, status, title, date, location, chair, secretary,
          attendees_json, apologies_json, executive_summary, agenda_proceedings_json,
          decisions_json, actions_json, commitments_json, risks_and_issues_json,
          procurement_clarifications_json, next_meeting_notes, version_lock_hash,
          approved_by_chair, approved_at, audit_events_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'MIN_SCM_2025_09_10',
          'MEETING_SCM_TRANSFORMATION_REVIEW',
          1,
          'SECRETARY_REVIEW',
          'Minutes of KETRACO SCM Transformation Review Meeting',
          'September 10, 2025',
          'Executive Conference Room, KETRACO Plaza, Nairobi',
          'Kamuren Wanjau (Operations Director)',
          'John Kamau (SCM Lead)',
          JSON.stringify([
            { name: 'Kamuren Wanjau', role: 'Operations Director (Chair)', organization: 'KETRACO' },
            { name: 'John Kamau', role: 'SCM Lead (Secretary)', organization: 'KETRACO' },
            { name: 'Eng. Patrick Odhiambo', role: 'Grid Infrastructure Specialist', organization: 'KETRACO' },
            { name: 'Grace Mutua', role: 'ICT Integration Lead', organization: 'KETRACO' },
            { name: 'David Kiprono', role: 'Procurement Specialist', organization: 'KETRACO' },
            { name: 'Sarah Ochieng', role: 'Compliance Officer', organization: 'KETRACO' },
            { name: 'Peter Karanja', role: 'Finance Analyst', organization: 'KETRACO' }
          ]),
          JSON.stringify([]),
          'The meeting reviewed the implementation status of the KETRACO SCM Transformation, focusing on the integration of the Evaluation OS with statutory tax compliance databases (KRA) and the completion of supplier validation audits across regional transmission hubs. The Chair emphasized zero-tolerance for procurement compliance stalls while ensuring rigorous adherence to PPADA Section 71.',
          JSON.stringify([
            {
              agenda_item_id: 'AG_01',
              agenda_title: 'Adoption of Agenda & Minutes of Previous SCM Review',
              discussion_summary: 'The minutes of the previous meeting held on August 21, 2025 were reviewed and confirmed as a true record with no amendments.',
              key_findings: ['Previous action on Evaluation OS architecture completed successfully.']
            },
            {
              agenda_item_id: 'AG_02',
              agenda_title: 'KRA Verification Adapter Integration & Evaluation OS Compliance',
              discussion_summary: 'ICT Lead Grace Mutua presented the technical interface specs for the KRA PIN and Tax Compliance verification adapter. The committee agreed on adopting automated validation to avoid tender evaluation bottlenecks.',
              key_findings: ['ICT requires finance confirmation for API key allocation.', 'Target go-live Friday Sep 12.']
            }
          ]),
          JSON.stringify([
            { code: 'D-0241', title: 'Supplier validation architecture sign-off', authority: 'Operations Director', approved_by: 'Pending Chair Signature' }
          ]),
          JSON.stringify([
            { id: 'ACT_01', action_title: 'Complete Supplier Validation Report', owner: 'John Kamau', due_date: '2025-09-12' },
            { id: 'ACT_02', action_title: 'Deploy KRA Adapter into Evaluation OS', owner: 'Grace Mutua', due_date: '2025-09-12' }
          ]),
          JSON.stringify([
            { title: 'Deliver reconciled supplier validation report by Friday COB', party: 'PMO / SCM', deadline: '2025-09-12' }
          ]),
          JSON.stringify([
            { title: 'KRA verification dependency delaying procurement cycle under PPADA §71', severity: 'HIGH', mitigation: 'Deploy Evaluation OS automated adapter.' }
          ]),
          JSON.stringify([]),
          'Next SCM Transformation Review scheduled for Friday, September 19, 2025 at 10:00 AM.',
          'HASH_SHA256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          null,
          null,
          JSON.stringify([
            { action: 'AI_DRAFT_GENERATED', actor: 'Meeting Intelligence Engine (Gemini 3.8)', timestamp: '2025-09-10T10:30:00Z', note: 'Initial draft compiled from live audio transcript.' },
            { action: 'SUBMITTED_TO_SECRETARY', actor: 'Meeting Intelligence Engine', timestamp: '2025-09-10T10:32:00Z', note: 'Awaiting John Kamau review.' }
          ])
        ]
      );

      // 14. Notifications
      const notifications = [
        ['NOTIF_01', 'kamuren@ketraco.co.ke', 'Decision D-0241 Requires Your Approval', 'AI extraction detected Decision D-0241 from today SCM Transformation Review. Sign-off required.', 'DECISION_REQUIRES_APPROVAL', 'WARNING', '/meeting-intelligence/decisions', 0],
        ['NOTIF_02', 'gmutua@ketraco.co.ke', 'Action Assigned: Deploy KRA Adapter into Evaluation OS', 'You have been designated owner for ACT_02 with deadline Fri Sep 12 17:00.', 'ACTION_ASSIGNED', 'INFO', '/meeting-intelligence/actions', 0],
        ['NOTIF_03', 'jkamau@ketraco.co.ke', 'Action ACT_01 Nearing Statutory Deadline', 'Supplier validation report is due in 48 hours. 14 records in Nairobi North remain unverified.', 'DEADLINE_IMMINENT', 'WARNING', '/meeting-intelligence/actions', 0],
        ['NOTIF_04', 'kamuren@ketraco.co.ke', 'Minutes Ready for Secretary Review', 'AI Draft Minutes for SCM Transformation Review have been compiled from 7 transcript segments.', 'MINUTES_READY', 'INFO', '/meeting-intelligence/minutes', 0]
      ];

      for (const n of notifications) {
        await db.run(
          `INSERT OR IGNORE INTO meeting_notifications (id, user_id, title, message, category, severity, link, read)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          n
        );
      }
    }
  }
}
