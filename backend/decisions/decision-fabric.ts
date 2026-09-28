/**
 * PHASE 02: CANONICAL DECISION FABRIC
 * 
 * Records, audits, and verifies all autonomous and human-in-the-loop decisions
 * across missions, procurement awards, dispatch orders, and contingency switches.
 * Backed by decisions_fabric in SQLite.
 */

import { DatabaseCore } from '../database/db-core';
import { v4 as uuidv4 } from 'uuid';

export type DecisionApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED';

export interface DecisionRecord {
  decisionId: string;
  missionId?: string;
  agentId: string;
  inputContext: Record<string, any>;
  ontologyObjects: string[];
  evidence: Record<string, any>;
  reasoningSummary: string;
  model: string;
  policy: string;
  proposedAction: Record<string, any>;
  approvalState: DecisionApprovalState;
  executedAction?: Record<string, any>;
  verification?: Record<string, any>;
  outcome?: 'SUCCESS' | 'FAILURE' | 'PENDING';
  tenantId?: string;
  createdAt?: string;
}

export class DecisionFabric {
  private static instance: DecisionFabric | null = null;
  private db: DatabaseCore;

  private constructor() {
    this.db = DatabaseCore.getInstance();
  }

  public static getInstance(): DecisionFabric {
    if (!DecisionFabric.instance) {
      DecisionFabric.instance = new DecisionFabric();
    }
    return DecisionFabric.instance;
  }

  /**
   * Record a new decision into the durable fabric
   */
  public async recordDecision(decision: Omit<DecisionRecord, 'decisionId' | 'createdAt'> & { decisionId?: string }): Promise<DecisionRecord> {
    const decisionId = decision.decisionId || `dec_${uuidv4()}`;
    const now = new Date().toISOString();
    const tenantId = decision.tenantId || 'ketraco';

    const proposedActionStr = JSON.stringify(decision.proposedAction || {});
    const executedActionStr = decision.executedAction ? JSON.stringify(decision.executedAction) : null;

    await this.db.run(
      `INSERT INTO decisions_fabric (
        decision_id, mission_id, agent_id, input_context_json, ontology_objects_json,
        evidence_json, reasoning_summary, model, policy, proposed_action, proposed_action_json,
        approval_state, executed_action, executed_action_json, verification_json, outcome,
        tenant_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(decision_id) DO UPDATE SET
        approval_state = excluded.approval_state,
        executed_action = excluded.executed_action,
        executed_action_json = excluded.executed_action_json,
        verification_json = excluded.verification_json,
        outcome = excluded.outcome`,
      [
        decisionId,
        decision.missionId || null,
        decision.agentId,
        JSON.stringify(decision.inputContext || {}),
        JSON.stringify(decision.ontologyObjects || []),
        JSON.stringify(decision.evidence || {}),
        decision.reasoningSummary,
        decision.model,
        decision.policy,
        proposedActionStr,
        proposedActionStr,
        decision.approvalState,
        executedActionStr,
        executedActionStr,
        decision.verification ? JSON.stringify(decision.verification) : null,
        decision.outcome || 'PENDING',
        tenantId,
        now,
      ]
    );

    return {
      ...decision,
      decisionId,
      createdAt: now,
    };
  }

  /**
   * Update decision approval or execution outcome
   */
  public async updateDecisionOutcome(
    decisionId: string,
    update: {
      approvalState?: DecisionApprovalState;
      executedAction?: Record<string, any>;
      verification?: Record<string, any>;
      outcome?: 'SUCCESS' | 'FAILURE';
    }
  ): Promise<void> {
    const sets: string[] = [];
    const params: any[] = [];

    if (update.approvalState) {
      sets.push('approval_state = ?');
      params.push(update.approvalState);
    }
    if (update.executedAction) {
      sets.push('executed_action_json = ?');
      params.push(JSON.stringify(update.executedAction));
    }
    if (update.verification) {
      sets.push('verification_json = ?');
      params.push(JSON.stringify(update.verification));
    }
    if (update.outcome) {
      sets.push('outcome = ?');
      params.push(update.outcome);
    }

    if (sets.length === 0) return;

    params.push(decisionId);
    await this.db.run(
      `UPDATE decisions_fabric SET ${sets.join(', ')} WHERE decision_id = ?`,
      params
    );
  }

  /**
   * Query decisions by agent or mission
   */
  public async queryDecisions(filter: { agentId?: string; missionId?: string; limit?: number }): Promise<DecisionRecord[]> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filter.agentId) {
      conditions.push('agent_id = ?');
      params.push(filter.agentId);
    }
    if (filter.missionId) {
      conditions.push('mission_id = ?');
      params.push(filter.missionId);
    }

    const limit = filter.limit || 50;
    params.push(limit);

    const rows = await this.db.all<any>(
      `SELECT * FROM decisions_fabric WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT ?`,
      params
    );

    return rows.map(r => ({
      decisionId: r.decision_id,
      missionId: r.mission_id,
      agentId: r.agent_id,
      inputContext: r.input_context_json ? JSON.parse(r.input_context_json) : {},
      ontologyObjects: r.ontology_objects_json ? JSON.parse(r.ontology_objects_json) : [],
      evidence: r.evidence_json ? JSON.parse(r.evidence_json) : {},
      reasoningSummary: r.reasoning_summary,
      model: r.model,
      policy: r.policy,
      proposedAction: r.proposed_action_json ? JSON.parse(r.proposed_action_json) : {},
      approvalState: r.approval_state as DecisionApprovalState,
      executedAction: r.executed_action_json ? JSON.parse(r.executed_action_json) : undefined,
      verification: r.verification_json ? JSON.parse(r.verification_json) : undefined,
      outcome: r.outcome,
      tenantId: r.tenant_id,
      createdAt: r.created_at,
    }));
  }
}
