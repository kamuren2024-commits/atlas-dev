import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import sqlite3 from 'sqlite3';
import { MeetingIntelligenceMigration } from '../../database/migration-008-meeting-intelligence';
import { EventBus } from '../../event-fabric/event-bus';
import { ClosedLoopAutomationEngine } from './closed-loop-automation';
import { MeetingIntelligenceRepository } from './meeting-repository';
import type { EvidenceRecord } from './types';

interface TestDatabase {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: unknown[]): Promise<{ lastID: number; changes: number }>;
  get<T = any>(sql: string, params?: unknown[]): Promise<T | undefined>;
  all<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

function createInMemoryDatabase(): Promise<TestDatabase> {
  return new Promise((resolve, reject) => {
    const connection = new sqlite3.Database(':memory:', error => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        exec: sql => new Promise((execResolve, execReject) => {
          connection.exec(sql, execError => execError ? execReject(execError) : execResolve());
        }),
        run: (sql, params = []) => new Promise((runResolve, runReject) => {
          connection.run(sql, params, function (runError) {
            if (runError) {
              runReject(runError);
              return;
            }
            runResolve({ lastID: this.lastID, changes: this.changes });
          });
        }),
        get: <T>(sql: string, params: unknown[] = []) => new Promise<T | undefined>((getResolve, getReject) => {
          connection.get(sql, params, (getError, row) => getError ? getReject(getError) : getResolve(row as T | undefined));
        }),
        all: <T>(sql: string, params: unknown[] = []) => new Promise<T[]>((allResolve, allReject) => {
          connection.all(sql, params, (allError, rows) => allError ? allReject(allError) : allResolve(rows as T[]));
        }),
        withTransaction: async <T>(work: () => Promise<T>) => {
          await new Promise<void>((beginResolve, beginReject) => {
            connection.run('BEGIN IMMEDIATE', error => error ? beginReject(error) : beginResolve());
          });
          try {
            const result = await work();
            await new Promise<void>((commitResolve, commitReject) => {
              connection.run('COMMIT', error => error ? commitReject(error) : commitResolve());
            });
            return result;
          } catch (error) {
            await new Promise<void>(rollbackResolve => {
              connection.run('ROLLBACK', () => rollbackResolve());
            });
            throw error;
          }
        },
        close: () => new Promise((closeResolve, closeReject) => {
          connection.close(closeError => closeError ? closeReject(closeError) : closeResolve());
        })
      });
    });
  });
}

describe('Meeting Intelligence operational golden path', () => {
  let db: TestDatabase;
  let repository: MeetingIntelligenceRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    db = await createInMemoryDatabase();
    await MeetingIntelligenceMigration.apply(db as any);
    eventBus = EventBus.getInstance();
    await eventBus.initialize();
    eventBus.clearHistory();
    const automation = new ClosedLoopAutomationEngine(db as any, eventBus);
    repository = new MeetingIntelligenceRepository(db as any, { closedLoop: automation });
  });

  afterEach(async () => {
    await eventBus.shutdown();
    await db.close();
  });

  it('persists a meeting through recording, transcript evidence, human review, and verified action completion', async () => {
    const meeting = await repository.createMeeting({
      id: 'MI_GOLDEN_PATH',
      title: 'Golden path verification',
      status: 'DRAFT',
      date: '2026-10-04'
    }, 'meeting-creator');

    expect((await repository.getMeetingById(meeting.id))?.status).toBe('DRAFT');
    await repository.updateMeeting(meeting.id, { status: 'SCHEDULED' }, 'scheduler');
    await repository.startMeeting(meeting.id, 'chair', 2);

    const recording = await repository.saveRecordingSession({
      id: 'REC_GOLDEN_PATH',
      meetingId: meeting.id,
      tenantId: meeting.tenant_id,
      status: 'STORED',
      storageRef: 'test-media://golden-path',
      checksum: 'sha256:test',
      createdBy: 'recorder'
    });
    expect((await repository.getRecordingSessions(meeting.id)).map(session => session.id)).toContain(recording.id);

    const transcript = await repository.addTranscriptSegment({
      id: 'TR_GOLDEN_PATH',
      meeting_id: meeting.id,
      speaker: 'Chair',
      timestamp_label: '00:30',
      start_seconds: 30,
      text: 'Assign the supplier validation report to Jordan by 2026-10-10.',
      confidence: 100
    });
    const evidence: EvidenceRecord = {
      id: 'EVD_GOLDEN_PATH',
      meeting_id: meeting.id,
      evidence_type: 'TRANSCRIPT',
      title: 'Action assignment evidence',
      date_label: '00:30',
      quote: transcript.text,
      source_ref: transcript.id,
      entity_tag: 'supplier-validation',
      category_tag: 'ACTION',
      confidence: 100
    };
    await repository.createEvidence(evidence, 'secretary');

    const candidate = await repository.addDetectedItem({
      id: 'SIG_GOLDEN_PATH',
      meeting_id: meeting.id,
      item_type: 'ACTION',
      speaker: 'Chair',
      timestamp_label: transcript.timestamp_label,
      source_text: transcript.text,
      suggested_title: 'Complete supplier validation report',
      confidence: 100,
      linked_entity: 'supplier-validation',
      category: 'ACTION',
      evidence_quote: evidence.quote,
      sourceEvidence: [{ quote: evidence.quote, sourceRef: evidence.id, timestamp: transcript.timestamp_label }]
    });
    const review = await repository.reviewDetectedItem(candidate.id, 'ACCEPTED', 'Confirmed in meeting', 'secretary');
    expect(review.success).toBe(true);
    expect(review.promotedEntityId).toBeTruthy();

    const retry = await repository.reviewDetectedItem(candidate.id, 'ACCEPTED', 'Duplicate request', 'secretary');
    expect(retry.promotedEntityId).toBe(review.promotedEntityId);
    const action = (await repository.getActions({ sourceMeetingId: meeting.id }))
      .find(item => item.id === review.promotedEntityId);
    expect(action).toBeDefined();
    expect(action?.confirmation_actor).toBe('secretary');
    expect(action?.sourceEvidence?.[0].sourceRef).toBe(evidence.id);

    expect(await repository.updateActionStatus(action!.id, 'IN_PROGRESS', 'action-owner')).toBe(true);
    expect((await repository.getActions({ sourceMeetingId: meeting.id }))
      .find(item => item.id === action!.id)?.version).toBe(2);
    expect(await repository.verifyAction(action!.id, 'Delivery receipt checked', 'verifier')).toBe(true);
    const completedAction = (await repository.getActions({ sourceMeetingId: meeting.id }))
      .find(item => item.id === action!.id);
    expect(completedAction?.status).toBe('COMPLETED');
    expect(completedAction?.version).toBe(3);
    expect(completedAction?.verified_by).toBe('verifier');
    expect(await repository.verifyAction(action!.id, 'Retry verification', 'verifier')).toBe(false);

    const decisionCandidate = await repository.addDetectedItem({
      id: 'SIG_DECISION_GOLDEN_PATH',
      meeting_id: meeting.id,
      item_type: 'DECISION',
      speaker: 'Chair',
      timestamp_label: transcript.timestamp_label,
      source_text: 'The committee confirms the supplier validation approach.',
      suggested_title: 'Confirm supplier validation approach',
      confidence: 100,
      linked_entity: 'supplier-validation',
      category: 'DECISION',
      evidence_quote: 'The committee confirms the supplier validation approach.',
      sourceEvidence: [{
        quote: 'The committee confirms the supplier validation approach.',
        sourceRef: evidence.id,
        timestamp: transcript.timestamp_label
      }]
    });
    const decisionReview = await repository.reviewDetectedItem(
      decisionCandidate.id,
      'ACCEPTED',
      'Reviewed against the transcript',
      'secretary'
    );
    expect(decisionReview.success).toBe(true);
    expect(await repository.approveDecision(decisionReview.promotedEntityId!, 'chair')).toBe(true);
    const confirmedDecision = (await repository.getDecisions({ meetingId: meeting.id }))
      .find(item => item.id === decisionReview.promotedEntityId);
    expect(confirmedDecision?.status).toBe('APPROVED');
    expect(confirmedDecision?.approved_by).toBe('chair');
    expect(confirmedDecision?.approved_at).toBeTruthy();
    expect(confirmedDecision?.version).toBe(2);
    expect(confirmedDecision?.sourceEvidence?.[0].sourceRef).toBe(evidence.id);

    await repository.pauseMeeting(meeting.id, 'chair');
    await repository.resumeMeeting(meeting.id, 'chair');
    await repository.endMeeting(meeting.id, 'chair');
    await repository.updateMeeting(meeting.id, { status: 'REVIEW' }, 'secretary');
    await repository.updateMeeting(meeting.id, { status: 'PUBLISHED' }, 'chair');
    await repository.updateMeeting(meeting.id, { status: 'ARCHIVED' }, 'secretary');

    const storedMeeting = await repository.getMeetingById(meeting.id);
    expect(storedMeeting?.status).toBe('ARCHIVED');
    expect(storedMeeting?.lifecycle_version).toBe(9);
    expect(await repository.getEvidenceForMeeting(meeting.id)).toEqual([evidence]);

    const lifecycleEvents = await repository.getLifecycleEvents(meeting.id);
    expect(lifecycleEvents.map(event => event.eventType)).toEqual(expect.arrayContaining([
      'MEETING_CREATED',
      'MEETING_STARTED',
      'MEETING_PAUSED',
      'MEETING_RESUMED',
      'MEETING_ENDED'
    ]));
    const audit = await repository.getAuditLog(100);
    expect(audit.some(entry => entry.entity_id === meeting.id && entry.actor === 'meeting-creator')).toBe(true);
    expect(audit.some(entry => entry.entity_id === 'EVD_GOLDEN_PATH' && entry.actor === 'secretary')).toBe(true);
    expect(audit.some(entry => entry.entity_id === action!.id && entry.actor === 'verifier')).toBe(true);
    expect(eventBus.getEventHistory().some(event => event.eventType === 'meeting.action.completed')).toBe(true);
  });

  it('rejects invalid lifecycle transitions and unlinked transcript evidence', async () => {
    const meeting = await repository.createMeeting({
      id: 'MI_INVALID_TRANSITION',
      title: 'Invalid transition verification',
      status: 'DRAFT'
    });

    await expect(repository.updateMeeting(meeting.id, { status: 'PUBLISHED' }, 'actor')).rejects.toThrow('Invalid state transition');
    await expect(repository.createEvidence({
      id: 'EVD_UNLINKED',
      meeting_id: meeting.id,
      evidence_type: 'TRANSCRIPT',
      title: 'Missing source',
      date_label: '',
      quote: 'Not actually stored',
      source_ref: 'TR_DOES_NOT_EXIST',
      entity_tag: '',
      category_tag: '',
      confidence: 50
    })).rejects.toThrow('was not found');
    await expect(repository.executeActionWorkflow('ACTION_UNCONFIGURED', 'actor'))
      .rejects.toThrow('MEETING_WORKFLOW_NOT_CONFIGURED');
    expect((await repository.getMeetingById(meeting.id))?.status).toBe('DRAFT');
  });

  it('allows only one of two concurrent lifecycle operations from the same version', async () => {
    const meeting = await repository.createMeeting({
      id: 'MI_LIFECYCLE_RACE',
      title: 'Lifecycle concurrency verification',
      status: 'SCHEDULED'
    });
    await repository.startMeeting(meeting.id, 'chair', 1);
    const live = await repository.getMeetingById(meeting.id);
    expect(live?.status).toBe('LIVE');

    const outcomes = await Promise.allSettled([
      repository.pauseMeeting(meeting.id, 'secretary', live!.lifecycle_version),
      repository.endMeeting(meeting.id, 'chair', live!.lifecycle_version)
    ]);
    expect(outcomes.filter(outcome => outcome.status === 'fulfilled')).toHaveLength(1);
    const state = await repository.getMeetingById(meeting.id);
    expect(['PAUSED', 'COMPLETED']).toContain(state?.status);
    expect(state?.lifecycle_version).toBe(3);
  });

  it('rejects transitions out of terminal or published states', async () => {
    const archived = await repository.createMeeting({
      id: 'MI_ARCHIVED_TERMINAL',
      title: 'Archived terminal state',
      status: 'ARCHIVED'
    });
    const cancelled = await repository.createMeeting({
      id: 'MI_CANCELLED_TERMINAL',
      title: 'Cancelled terminal state',
      status: 'CANCELLED'
    });
    const published = await repository.createMeeting({
      id: 'MI_PUBLISHED_TERMINAL',
      title: 'Published terminal state',
      status: 'PUBLISHED'
    });

    await expect(repository.startMeeting(archived.id)).rejects.toThrow('Cannot start meeting in ARCHIVED');
    await expect(repository.startMeeting(cancelled.id)).rejects.toThrow('Cannot start meeting in CANCELLED');
    await expect(repository.updateMeeting(published.id, { status: 'DRAFT' })).rejects.toThrow('Invalid state transition');
  });
});
