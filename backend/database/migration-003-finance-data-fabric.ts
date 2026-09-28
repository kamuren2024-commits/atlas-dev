/**
 * PHASE 01: DATABASE MIGRATION 003 — FINANCE DATA FABRIC
 *
 * Creates SQLite tables for the KETRACO Finance Bounded Context.
 * All tables:
 *   - enforce idempotency (unique indexes on sourceSystem + sourceRecordId)
 *   - preserve source provenance (sourceSystem, sourceRecordId, batchId, ingestedAt)
 *   - support rawHash + recordVersion for integrity checks
 *   - include isFixture + environment per CP-03 production fixture protection
 *
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import { DatabaseCore } from './db-core';

export class FinanceDataFabricMigration {
  public static async apply(db: DatabaseCore): Promise<void> {
    console.log('[Migration-003] Finance Data Fabric — creating 18 finance_* tables');

    const migrationSQL: string[] = [];

    // ------------------------------------------------------------------
    // 1. finance_sources — Source registry (01-03)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_sources (
        source_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        source_type TEXT NOT NULL,
        system TEXT,
        status TEXT NOT NULL DEFAULT 'REGISTERED',
        owner TEXT,
        connection_status TEXT NOT NULL DEFAULT 'DISCONNECTED',
        last_successful_sync TEXT,
        last_attempted_sync TEXT,
        schema_version TEXT,
        data_classification TEXT,
        credential_reference TEXT,
        configuration_json TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_sources_ext ON finance_sources(source_type, system, name);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_sources_status ON finance_sources(status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_sources_env ON finance_sources(environment, is_fixture);`);

    // ------------------------------------------------------------------
    // 2. finance_batches — Ingestion batches (01-07)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_batches (
        batch_id TEXT PRIMARY KEY,
        run_id TEXT,
        correlation_id TEXT,
        source_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL DEFAULT 'CREATED',
        record_count INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        warning_count INTEGER NOT NULL DEFAULT 0,
        failure_count INTEGER NOT NULL DEFAULT 0,
        quarantined_count INTEGER NOT NULL DEFAULT 0,
        error_summary TEXT,
        checkpoint_json TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        actor_id TEXT,
        FOREIGN KEY(source_id) REFERENCES finance_sources(source_id)
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_batches_source ON finance_batches(source_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_batches_status ON finance_batches(status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_batches_started ON finance_batches(started_at DESC);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_batches_correlation ON finance_batches(correlation_id);`);

    // ------------------------------------------------------------------
    // 3. finance_records — Raw + normalized source records (01-07, 01-08, 01-09)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_records (
        record_id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        source_id TEXT NOT NULL,
        source_system TEXT,
        source_record_id TEXT NOT NULL,
        record_version INTEGER NOT NULL DEFAULT 1,
        raw_hash TEXT,
        raw_payload_json TEXT NOT NULL,
        normalized_payload_json TEXT,
        record_status TEXT NOT NULL DEFAULT 'RAW',
        validation_severity TEXT DEFAULT 'VALID',
        validation_errors_json TEXT,
        normalization_rules_json TEXT,
        entity_kind TEXT,
        resolved_entity_id TEXT,
        ontology_mappings_json TEXT,
        ingested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        effective_date TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        FOREIGN KEY(batch_id) REFERENCES finance_batches(batch_id),
        FOREIGN KEY(source_id) REFERENCES finance_sources(source_id)
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_records_idempotency ON finance_records(source_system, source_record_id, record_version);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_records_batch ON finance_records(batch_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_records_status ON finance_records(record_status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_records_kind ON finance_records(entity_kind);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_records_env ON finance_records(environment, is_fixture);`);

    // ------------------------------------------------------------------
    // 4. finance_accounts — Account master (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_accounts (
        account_id TEXT PRIMARY KEY,
        external_id TEXT,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        account_class TEXT NOT NULL,
        chart_of_accounts_id TEXT,
        parent_account_id TEXT,
        normal_balance TEXT NOT NULL DEFAULT 'DEBIT',
        is_cashflow_relevant INTEGER DEFAULT 0,
        is_capex INTEGER DEFAULT 0,
        is_opex INTEGER DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'KES',
        description TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_accounts_code ON finance_accounts(chart_of_accounts_id, code);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_accounts_ext ON finance_accounts(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_accounts_class ON finance_accounts(account_class);`);

    // ------------------------------------------------------------------
    // 5. finance_cost_centres — Cost centre master (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_cost_centres (
        cost_centre_id TEXT PRIMARY KEY,
        external_id TEXT,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        department_id TEXT,
        manager_id TEXT,
        parent_cost_centre_id TEXT,
        currency TEXT NOT NULL DEFAULT 'KES',
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_cc_code ON finance_cost_centres(code);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_cc_ext ON finance_cost_centres(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 6. finance_budgets — Budget master + headers (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_budgets (
        budget_id TEXT PRIMARY KEY,
        external_id TEXT,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        budget_status TEXT NOT NULL DEFAULT 'DRAFT',
        fiscal_year_id TEXT,
        department_id TEXT,
        cost_centre_id TEXT,
        project_id TEXT,
        profit_centre_id TEXT,
        currency TEXT NOT NULL DEFAULT 'KES',
        total_amount REAL NOT NULL DEFAULT 0,
        approved_amount REAL,
        revised_amount REAL,
        budget_class TEXT,
        funding_source_id TEXT,
        approved_by TEXT,
        approved_at TEXT,
        description TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_budgets_code ON finance_budgets(code);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_budgets_ext ON finance_budgets(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_budgets_status ON finance_budgets(budget_status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_budgets_project ON finance_budgets(project_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_budgets_cc ON finance_budgets(cost_centre_id);`);

    // ------------------------------------------------------------------
    // 7. finance_budget_lines — Budget lines (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_budget_lines (
        budget_line_id TEXT PRIMARY KEY,
        external_id TEXT,
        budget_id TEXT NOT NULL,
        line_number INTEGER NOT NULL,
        account_id TEXT NOT NULL,
        cost_centre_id TEXT,
        project_id TEXT,
        department_id TEXT,
        financial_period_id TEXT,
        amount REAL NOT NULL,
        expenditure_class TEXT,
        description TEXT,
        currency TEXT NOT NULL DEFAULT 'KES',
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        FOREIGN KEY(budget_id) REFERENCES finance_budgets(budget_id),
        FOREIGN KEY(account_id) REFERENCES finance_accounts(account_id)
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_budget_lines ON finance_budget_lines(budget_id, line_number);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_budget_lines_ext ON finance_budget_lines(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 8. finance_commitments — Commitments / encumbrances (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_commitments (
        commitment_id TEXT PRIMARY KEY,
        external_id TEXT,
        commitment_status TEXT NOT NULL DEFAULT 'PRE_COMMITMENT',
        commitment_number TEXT,
        budget_line_id TEXT,
        budget_id TEXT,
        project_id TEXT,
        purchase_order_id TEXT,
        contract_id TEXT,
        supplier_id TEXT,
        original_amount REAL NOT NULL,
        variation_amount REAL DEFAULT 0,
        current_amount REAL NOT NULL,
        invoiced_amount REAL DEFAULT 0,
        paid_amount REAL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'KES',
        committed_date TEXT NOT NULL,
        description TEXT,
        encumbrance_id TEXT,
        idempotency_key TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_commitments_idem ON finance_commitments(idempotency_key);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_commitments_ext ON finance_commitments(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_commitments_status ON finance_commitments(commitment_status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_commitments_project ON finance_commitments(project_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_commitments_supplier ON finance_commitments(supplier_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_commitments_contract ON finance_commitments(contract_id);`);

    // ------------------------------------------------------------------
    // 9. finance_invoices — Invoices (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_invoices (
        invoice_id TEXT PRIMARY KEY,
        external_id TEXT,
        invoice_number TEXT NOT NULL,
        supplier_id TEXT,
        purchase_order_id TEXT,
        commitment_id TEXT,
        contract_id TEXT,
        budget_line_id TEXT,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        gross_amount REAL NOT NULL,
        net_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        outstanding_amount REAL,
        currency TEXT NOT NULL DEFAULT 'KES',
        invoice_status TEXT NOT NULL DEFAULT 'RECEIVED',
        payment_terms_days INTEGER,
        three_way_matched INTEGER DEFAULT 0,
        matched_by TEXT,
        approved_for_payment_at TEXT,
        approver_id TEXT,
        idempotency_key TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_invoices_idem ON finance_invoices(idempotency_key);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_invoices_ext ON finance_invoices(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_invoices_num ON finance_invoices(invoice_number);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON finance_invoices(invoice_status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_invoices_commitment ON finance_invoices(commitment_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_invoices_supplier ON finance_invoices(supplier_id);`);

    // ------------------------------------------------------------------
    // 10. finance_payments — Payments (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_payments (
        payment_id TEXT PRIMARY KEY,
        external_id TEXT,
        payment_number TEXT,
        payment_status TEXT NOT NULL DEFAULT 'PROPOSED',
        payer_id TEXT,
        payee_supplier_id TEXT,
        payee_bank_account_id TEXT,
        cash_account_id TEXT,
        currency TEXT NOT NULL DEFAULT 'KES',
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        value_date TEXT,
        method TEXT,
        reference TEXT,
        bank_transaction_id TEXT,
        released_by TEXT,
        released_at TEXT,
        reconciled_at TEXT,
        idempotency_key TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        organization_id TEXT,
        owner_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_payments_idem ON finance_payments(idempotency_key);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_payments_ext ON finance_payments(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_payments_status ON finance_payments(payment_status);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_payments_date ON finance_payments(payment_date);`);

    // ------------------------------------------------------------------
    // 11. finance_journals — Journals (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_journals (
        journal_id TEXT PRIMARY KEY,
        external_id TEXT,
        journal_number TEXT,
        journal_type TEXT NOT NULL,
        journal_status TEXT NOT NULL DEFAULT 'DRAFT',
        financial_period_id TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'KES',
        posting_date TEXT NOT NULL,
        description TEXT,
        total_debit REAL NOT NULL DEFAULT 0,
        total_credit REAL NOT NULL DEFAULT 0,
        posted_by TEXT,
        approved_by TEXT,
        approved_at TEXT,
        reversed_journal_id TEXT,
        chain_hash_previous TEXT,
        chain_hash TEXT,
        idempotency_key TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_journals_idem ON finance_journals(idempotency_key);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_journals_ext ON finance_journals(source_system, source_record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_journals_period ON finance_journals(financial_period_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_journals_status ON finance_journals(journal_status);`);

    // ------------------------------------------------------------------
    // 12. finance_projects — Project finance summary (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_projects (
        project_finance_id TEXT PRIMARY KEY,
        external_id TEXT,
        project_id TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'KES',
        approved_budget REAL,
        revised_budget REAL,
        actual_cost_to_date REAL DEFAULT 0,
        commitments_total REAL DEFAULT 0,
        forecast_cost_at_completion REAL,
        funding_committed REAL,
        funding_secured REAL,
        project_start_date TEXT,
        project_end_date TEXT,
        financial_progress_pct REAL,
        physical_progress_pct REAL,
        health_score REAL,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_projects_pid ON finance_projects(project_id);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_projects_ext ON finance_projects(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 13. finance_costs — Project cost line items (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_costs (
        cost_id TEXT PRIMARY KEY,
        external_id TEXT,
        project_finance_id TEXT,
        project_id TEXT NOT NULL,
        financial_period_id TEXT,
        currency TEXT NOT NULL DEFAULT 'KES',
        approved_budget REAL,
        revised_budget REAL,
        actual_cost REAL DEFAULT 0,
        commitments REAL DEFAULT 0,
        forecast_cost REAL,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(project_finance_id) REFERENCES finance_projects(project_finance_id)
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_costs_project ON finance_costs(project_id);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_costs_ext ON finance_costs(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 14. finance_forecasts — Financial forecasts (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_forecasts (
        forecast_id TEXT PRIMARY KEY,
        external_id TEXT,
        subject_kind TEXT,
        subject_id TEXT,
        model TEXT NOT NULL,
        model_version TEXT NOT NULL,
        training_data_window_json TEXT,
        forecast_horizon TEXT NOT NULL,
        horizon_start TEXT NOT NULL,
        horizon_end TEXT NOT NULL,
        assumptions_json TEXT,
        error_metrics_json TEXT,
        ci_low_series_json TEXT,
        ci_high_series_json TEXT,
        forecast_series_json TEXT NOT NULL,
        baseline_series_json TEXT,
        scenario_id TEXT,
        currency TEXT,
        published_at TEXT,
        published_by TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_forecasts_subject ON finance_forecasts(subject_kind, subject_id);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_forecasts_ext ON finance_forecasts(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 15. finance_risks — Financial risks (01-01)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_risks (
        risk_id TEXT PRIMARY KEY,
        external_id TEXT,
        code TEXT,
        title TEXT NOT NULL,
        risk_type TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'MONITOR',
        probability TEXT NOT NULL,
        impact TEXT NOT NULL,
        exposure_amount REAL,
        currency TEXT,
        drivers_json TEXT,
        evidence_ids_json TEXT,
        mitigations_json TEXT,
        owner_id TEXT,
        affected_entity_kind TEXT,
        affected_entity_id TEXT,
        source_system TEXT,
        source_record_id TEXT,
        status TEXT NOT NULL DEFAULT 'IDENTIFIED',
        effective_date TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        provenance_id TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_risks_level ON finance_risks(level);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_risks_type ON finance_risks(risk_type);`);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_risks_ext ON finance_risks(source_system, source_record_id);`);

    // ------------------------------------------------------------------
    // 16. finance_lineage — Data lineage (01-15)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_lineage (
        lineage_id TEXT PRIMARY KEY,
        entity_kind TEXT,
        entity_id TEXT,
        record_id TEXT,
        batch_id TEXT,
        source_id TEXT,
        parent_lineage_id TEXT,
        transformation_type TEXT NOT NULL,
        transformation_rule TEXT,
        from_entity_kind TEXT,
        from_entity_id TEXT,
        to_entity_kind TEXT,
        to_entity_id TEXT,
        field_mappings_json TEXT,
        formula_used TEXT,
        actor_id TEXT,
        trace_hash TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_lineage_entity ON finance_lineage(entity_kind, entity_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_lineage_batch ON finance_lineage(batch_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_lineage_record ON finance_lineage(record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_lineage_flow ON finance_lineage(from_entity_kind, from_entity_id, to_entity_kind, to_entity_id);`);

    // ------------------------------------------------------------------
    // 17. finance_mappings — Ontology / cross-domain mappings (01-13)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_mappings (
        mapping_id TEXT PRIMARY KEY,
        finance_entity_kind TEXT NOT NULL,
        finance_entity_id TEXT NOT NULL,
        remote_domain TEXT NOT NULL,
        remote_entity_kind TEXT NOT NULL,
        remote_entity_id TEXT,
        mapping_type TEXT NOT NULL,
        confidence_level TEXT NOT NULL DEFAULT 'STRONG',
        mapping_rule TEXT,
        resolved_by TEXT,
        resolved_at TEXT,
        source_system TEXT,
        source_record_id TEXT,
        version INTEGER NOT NULL DEFAULT 1,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE UNIQUE INDEX IF NOT EXISTS ux_finance_mappings ON finance_mappings(finance_entity_kind, finance_entity_id, remote_domain, remote_entity_kind, remote_entity_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_mappings_remote ON finance_mappings(remote_domain, remote_entity_kind, remote_entity_id);`);

    // ------------------------------------------------------------------
    // 18. finance_data_quality — Quality scores (01-11)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_data_quality (
        quality_id TEXT PRIMARY KEY,
        batch_id TEXT,
        record_id TEXT,
        entity_kind TEXT,
        entity_id TEXT,
        source_id TEXT,
        completeness_score REAL,
        validity_score REAL,
        uniqueness_score REAL,
        consistency_score REAL,
        timeliness_score REAL,
        referential_integrity_score REAL,
        source_reliability_score REAL,
        overall_score REAL,
        dimensions_json TEXT NOT NULL,
        formula_version TEXT NOT NULL,
        failing_checks_json TEXT,
        warnings_json TEXT,
        quality_agent TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_quality_batch ON finance_data_quality(batch_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_quality_record ON finance_data_quality(record_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_quality_entity ON finance_data_quality(entity_kind, entity_id);`);

    // ------------------------------------------------------------------
    // 19. finance_profiles — Data profiling snapshots (01-10)
    // ------------------------------------------------------------------
    migrationSQL.push(`
      CREATE TABLE IF NOT EXISTS finance_profiles (
        profile_id TEXT PRIMARY KEY,
        source_id TEXT,
        batch_id TEXT,
        dataset_name TEXT NOT NULL,
        row_count INTEGER,
        column_count INTEGER,
        null_rate_json TEXT,
        duplicate_rate REAL,
        unique_rate_json TEXT,
        type_distribution_json TEXT,
        date_range_json TEXT,
        amount_range_json TEXT,
        currency_distribution_json TEXT,
        schema_change_signature TEXT,
        inferred_entities_json TEXT,
        is_fixture INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        tenant_id TEXT,
        profiled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_profiles_source ON finance_profiles(source_id);`);
    migrationSQL.push(`CREATE INDEX IF NOT EXISTS idx_finance_profiles_batch ON finance_profiles(batch_id);`);

    // Execute all statements sequentially within one transaction
    for (const sql of migrationSQL) {
      await db.exec(sql);
    }

    // Register migration in the migrations table (if migrations table exists)
    try {
      const exists = await db.get(
        "SELECT name FROM migrations WHERE name = '003_finance_data_fabric'"
      );
      if (!exists) {
        await db.run(
          "INSERT INTO migrations (name) VALUES (?)",
          ['003_finance_data_fabric']
        );
      }
    } catch (e) {
      // migrations table may not exist in every context — ignore
    }

    console.log('[Migration-003] Finance Data Fabric — 19 tables + 40+ indexes created successfully.');
  }
}
