/**
 * KETRACO MEETING INTELLIGENCE — CLOSED-LOOP AUTOMATION ENGINE
 * Manages the autonomous lifecycle of meeting actions and decision execution:
 * Action Created → Owner Assigned → Notification → Deadline Monitoring → Overdue Detection → Escalation → Evidence Submission → Verification → Completion → Mission Control Update
 */

import { DatabaseCore } from '../../database/db-core';
import { EventBus } from '../../event-fabric/event-bus';
import { ActionControlItem, MeetingNotification } from './types';

export class ClosedLoopAutomationEngine {
  private static instance: ClosedLoopAutomationEngine | null = null;
  private db: DatabaseCore;
  private eventBus: EventBus;

  private constructor() {
    this.db = DatabaseCore.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): ClosedLoopAutomationEngine {
    if (!ClosedLoopAutomationEngine.instance) {
      ClosedLoopAutomationEngine.instance = new ClosedLoopAutomationEngine();
    }
    return ClosedLoopAutomationEngine.instance;
  }

  /**
   * Dispatches a notification to the assigned owner and logs audit trail
   */
  public async notifyActionOwner(action: ActionControlItem): Promise<void> {
    const notifId = `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const notification: MeetingNotification = {
      id: notifId,
      user_id: action.owner,
      title: `Action Assigned: ${action.action_title}`,
      message: `You have been assigned as lead owner for "${action.action_title}" from meeting "${action.source_meeting_title || 'KETRACO Governance'}". Target deadline: ${action.due_date}. Priority: ${action.priority}.`,
      category: 'ACTION_ASSIGNED',
      severity: action.priority === 'CRITICAL' ? 'CRITICAL' : 'INFO',
      link: `/meeting-intelligence/actions`,
      read: false,
      created_at: new Date().toISOString(),
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_notifications (id, user_id, title, message, category, severity, link, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          notification.id,
          notification.user_id,
          notification.title,
          notification.message,
          notification.category,
          notification.severity,
          notification.link || null,
          notification.created_at,
        ]
      );

      // Publish event to the Central Event Bus
      if ((this.eventBus as any).publishEvent) {
        await (this.eventBus as any).publishEvent({
          id: `EVT_${Date.now()}`,
          eventType: 'meeting.action.assigned',
          category: 'INCIDENT',
          timestamp: new Date().toISOString(),
          sourceId: 'meeting-intelligence-loop',
          severity: action.priority === 'CRITICAL' ? 'CRITICAL' : 'INFO',
          status: 'PENDING',
          tags: ['meeting', 'action'],
          metadata: {
            actionId: action.id,
            title: action.action_title,
            owner: action.owner,
            department: action.department,
            dueDate: action.due_date,
          },
        });
      }
    } catch (err) {
      console.warn('[CLOSED-LOOP] Error dispatching action assignment notification:', err);
    }
  }

  /**
   * Runs deadline monitoring pass across all open actions
   */
  public async checkDeadlinesAndEscalate(): Promise<{ checked: number; escalated: number }> {
    let escalatedCount = 0;
    try {
      const actions = await this.db.all<any>(
        `SELECT * FROM meeting_actions WHERE status NOT IN ('COMPLETED', 'CANCELLED')`
      );

      const today = new Date().toISOString().split('T')[0];

      for (const act of actions) {
        const isOverdue = act.due_date && act.due_date < today;
        if (isOverdue && act.status !== 'OVERDUE') {
          const newEscalationLevel = (act.escalation_level || 0) + 1;
          const escalatedTo = newEscalationLevel >= 2 ? 'Managing Director & CEO' : 'Operations Director (Kamuren Wanjau)';

          await this.db.run(
            `UPDATE meeting_actions 
             SET status = 'OVERDUE', escalation_level = ?, escalated_to = ?, last_notified_at = ?
             WHERE id = ?`,
            [newEscalationLevel, escalatedTo, new Date().toISOString(), act.id]
          );

          // Dispatch critical notification
          await this.db.run(
            `INSERT INTO meeting_notifications (id, user_id, title, message, category, severity, link, read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
              `NOTIF_ESC_${Date.now()}_${act.id}`,
              act.owner,
              `CRITICAL OVERDUE ESCALATION: ${act.action_title}`,
              `Action deadline (${act.due_date}) has lapsed without verification evidence. Escalated to ${escalatedTo} under statutory governance compliance.`,
              'OVERDUE_ESCALATION',
              'CRITICAL',
              '/meeting-intelligence/actions',
              new Date().toISOString(),
            ]
          );

          // Log in audit ledger
          await this.db.run(
            `INSERT INTO meeting_audit_ledger (id, event_type, entity_type, entity_id, actor, details_json, timestamp)
             VALUES (?, 'ESCALATE', 'ACTION', ?, 'ClosedLoopAutomationEngine', ?, ?)`,
            [
              `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              act.id,
              JSON.stringify({ previousStatus: act.status, escalatedTo, escalationLevel: newEscalationLevel }),
              new Date().toISOString(),
            ]
          );

          escalatedCount++;
        }
      }

      return { checked: actions.length, escalated: escalatedCount };
    } catch (err) {
      console.warn('[CLOSED-LOOP] Error running deadline check:', err);
      return { checked: 0, escalated: 0 };
    }
  }

  /**
   * Submits evidence and transitions action to UNDER_VERIFICATION
   */
  public async submitVerificationEvidence(actionId: string, evidenceText: string, actor: string): Promise<boolean> {
    try {
      await this.db.run(
        `UPDATE meeting_actions 
         SET status = 'UNDER_VERIFICATION', evidence_text = ?, updated_at = ?
         WHERE id = ?`,
        [evidenceText, new Date().toISOString(), actionId]
      );

      await this.db.run(
        `INSERT INTO meeting_audit_ledger (id, event_type, entity_type, entity_id, actor, details_json, timestamp)
         VALUES (?, 'EDIT', 'ACTION', ?, ?, ?, ?)`,
        [
          `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          actionId,
          actor,
          JSON.stringify({ note: 'Evidence submitted for verification', evidenceText }),
          new Date().toISOString(),
        ]
      );

      return true;
    } catch (err) {
      console.error('[CLOSED-LOOP] Error submitting evidence:', err);
      return false;
    }
  }

  /**
   * Verifies action completion and promotes to COMPLETED with human verification
   */
  public async verifyAndCompleteAction(actionId: string, verificationNotes: string, verifier: string): Promise<boolean> {
    try {
      const completedAt = new Date().toISOString();
      await this.db.run(
        `UPDATE meeting_actions 
         SET status = 'COMPLETED', verification_notes = ?, verified_by = ?, completed_at = ?, updated_at = ?
         WHERE id = ?`,
        [verificationNotes, verifier, completedAt, completedAt, actionId]
      );

      await this.db.run(
        `INSERT INTO meeting_audit_ledger (id, event_type, entity_type, entity_id, actor, details_json, timestamp)
         VALUES (?, 'APPROVE', 'ACTION', ?, ?, ?, ?)`,
        [
          `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          actionId,
          verifier,
          JSON.stringify({ verificationNotes, completedAt }),
          completedAt,
        ]
      );

      // Publish completion to Central Event Bus to sync with Mission Control
      if ((this.eventBus as any).publishEvent) {
        await (this.eventBus as any).publishEvent({
          id: `EVT_${Date.now()}`,
          eventType: 'meeting.action.completed',
          category: 'INCIDENT',
          timestamp: completedAt,
          sourceId: 'meeting-closed-loop',
          severity: 'INFO',
          status: 'RESOLVED',
          tags: ['meeting', 'action', 'completed'],
          metadata: {
            actionId,
            verifiedBy: verifier,
            completedAt,
          },
        });
      }

      return true;
    } catch (err) {
      console.error('[CLOSED-LOOP] Error verifying action completion:', err);
      return false;
    }
  }
}
