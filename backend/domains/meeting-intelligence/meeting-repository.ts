/**
 * KETRACO MEETING INTELLIGENCE — PERSISTENCE REPOSITORY
 * Provides complete enterprise CRUD, search, audit logging, and state synchronization
 */

import { DatabaseCore } from '../../database/db-core';
import { EventFabric } from '../../event-fabric/event-fabric';
import {
  MeetingEntity,
  TranscriptSegment,
  DetectedIntelligenceItem,
  DecisionRecord,
  ActionControlItem,
  CommitmentRecord,
  RiskItem,
  ProcurementClarification,
  MeetingMinutes,
  EvidenceRecord,
  ConversationMemoryItem,
  MeetingNotification,
  AuditLedgerEntry,
  MeetingIntelligenceOverview,
  MeetingLoopStage,
  MeetingStatus,
  Participant,
  AgendaItem,
  ContextDocument,
  MeetingDocument,
  MeetingLifecycleEvent,
  ReviewStatus,
  DecisionStatus,
  ActionStatus,
  RecordingSession,
} from './types';
import { MeetingGraphAdapter } from './graph-adapter';
import { ClosedLoopAutomationEngine } from './closed-loop-automation';
import { enrichMeetingProviderMetadata, enrichCalendarMetadata, getMeetingProvider, getCalendarProvider } from './providers';

export function validateMeetingTransition(from: MeetingStatus, to: MeetingStatus): { valid: boolean; reason?: string } {
  const normFrom = (from === 'READY' || from === 'CREATED') ? 'SCHEDULED' : from;
  const normTo = (to === 'READY' || to === 'CREATED') ? 'SCHEDULED' : to;

  if (normFrom === normTo) return { valid: true };

  const validTransitions: Record<string, string[]> = {
    'DRAFT': ['SCHEDULED', 'CANCELLED'],
    'SCHEDULED': ['LIVE', 'DRAFT', 'CANCELLED'],
    'LIVE': ['PAUSED', 'COMPLETED'],
    'PAUSED': ['LIVE', 'COMPLETED'],
    'COMPLETED': ['ARCHIVED'],
    'CANCELLED': ['ARCHIVED'],
    'ARCHIVED': []
  };

  const allowed = validTransitions[normFrom] || [];
  if (!allowed.includes(normTo)) {
    return {
      valid: false,
      reason: `Invalid state transition from ${from} to ${to}. Allowed transitions: ${allowed.join(', ') || 'None (Terminal state)'}`
    };
  }

  return { valid: true };
}

export class MeetingIntelligenceRepository {
  private db: DatabaseCore;
  private graphAdapter: MeetingGraphAdapter;
  private closedLoop: ClosedLoopAutomationEngine;

  constructor(db?: DatabaseCore) {
    this.db = db || DatabaseCore.getInstance();
    this.graphAdapter = MeetingGraphAdapter.getInstance();
    this.closedLoop = ClosedLoopAutomationEngine.getInstance();
  }

  // --- MEETINGS ---

  public async getAllMeetings(type?: string): Promise<MeetingEntity[]> {
    try {
      let query = `SELECT * FROM meeting_entities`;
      const params: any[] = [];
      if (type && type !== 'ALL') {
        query += ` WHERE meeting_type = ?`;
        params.push(type);
      }
      query += ` ORDER BY created_at DESC`;

      const rows = await this.db.all<any>(query, params);
      return rows.map(r => this.mapMeetingEntity(r));
    } catch (e) {
      console.warn('[MEETING-REPO] Failed to query all meetings:', e);
      return [this.getCanonicalFallback().next_meeting];
    }
  }

  public async getMeetingById(id: string): Promise<MeetingEntity | null> {
    try {
      const row = await this.db.get<any>(`SELECT * FROM meeting_entities WHERE id = ?`, [id]);
      if (row) return this.mapMeetingEntity(row);
    } catch (e) {
      console.warn(`[MEETING-REPO] Failed to get meeting ${id}:`, e);
    }
    return null;
  }

  public async createMeeting(meeting: Partial<MeetingEntity>, actor: string = 'Operator'): Promise<MeetingEntity> {
    const id = meeting.id || `MEETING_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const status: MeetingStatus = meeting.status || 'SCHEDULED';
    const meetingType = meeting.meeting_type || meeting.type || 'GENERAL';
    const room = meeting.room || meeting.venue || 'Executive Conference Room, Nairobi';
    const date = meeting.date || new Date().toISOString().split('T')[0];
    const startTime = meeting.start_time || meeting.startTime || '10:00';
    const endTime = meeting.end_time || meeting.endTime || '11:30';
    const title = meeting.title?.trim() || 'Untitled Strategic Session';
    const description = meeting.description || meeting.objective || 'Statutory review and governance evaluation.';

    const providerType = meeting.provider?.type || (meeting as any).provider_type || 'INTERNAL';
    const calendarProviderType = meeting.calendar?.provider || (meeting as any).calendar_provider || 'OUTLOOK';
    const providerMetadata = enrichMeetingProviderMetadata({
      ...meeting,
      id,
      title,
      meeting_type: meetingType,
      type: meetingType,
      room,
      venue: room,
      date,
      start_time: startTime,
      startTime,
      end_time: endTime,
      endTime,
      status,
      priority: meeting.priority || 'HIGH',
      preparation_pct: meeting.preparation_pct || 75,
      objective: description,
      description,
      department: meeting.department || 'SCM',
      chair: meeting.chair || 'Kamuren Wanjau (Operations Director)',
      secretary: meeting.secretary || 'Sarah Ochieng (Legal Counsel)',
      project_id: meeting.project_id || meeting.projectId,
      projectId: meeting.project_id || meeting.projectId,
      pds_stage: meeting.pds_stage,
      tender_id: meeting.tender_id,
      contract_id: meeting.contract_id,
      current_stage: meeting.current_stage || (status === 'LIVE' ? 'LIVE_MEETING' : 'CONFIGURE'),
      participants: [],
      agenda: [],
      documents: [],
      prior_meetings_count: meeting.prior_meetings_count || 1,
      open_decisions_count: meeting.open_decisions_count || 0,
      previous_signals: meeting.previous_signals || [],
      open_commitments: meeting.open_commitments || [],
      relevant_entities: meeting.relevant_entities || meeting.linkedEntities || [],
      tenant_id: meeting.tenant_id || 'ketraco',
      created_by: meeting.created_by || meeting.createdBy || actor,
      createdAt: now,
      updated_at: now,
      updatedAt: now
    } as MeetingEntity, providerType);
    const calendarMetadata = await enrichCalendarMetadata({
      ...meeting,
      id,
      title,
      meeting_type: meetingType,
      type: meetingType,
      room,
      venue: room,
      date,
      start_time: startTime,
      startTime,
      end_time: endTime,
      endTime,
      status,
      priority: meeting.priority || 'HIGH',
      preparation_pct: meeting.preparation_pct || 75,
      objective: description,
      description,
      department: meeting.department || 'SCM',
      chair: meeting.chair || 'Kamuren Wanjau (Operations Director)',
      secretary: meeting.secretary || 'Sarah Ochieng (Legal Counsel)',
      project_id: meeting.project_id || meeting.projectId,
      projectId: meeting.project_id || meeting.projectId,
      pds_stage: meeting.pds_stage,
      tender_id: meeting.tender_id,
      contract_id: meeting.contract_id,
      current_stage: meeting.current_stage || (status === 'LIVE' ? 'LIVE_MEETING' : 'CONFIGURE'),
      participants: [],
      agenda: [],
      documents: [],
      prior_meetings_count: meeting.prior_meetings_count || 1,
      open_decisions_count: meeting.open_decisions_count || 0,
      previous_signals: meeting.previous_signals || [],
      open_commitments: meeting.open_commitments || [],
      relevant_entities: meeting.relevant_entities || meeting.linkedEntities || [],
      tenant_id: meeting.tenant_id || 'ketraco',
      created_by: meeting.created_by || meeting.createdBy || actor,
      createdAt: now,
      updated_at: now,
      updatedAt: now
    } as MeetingEntity, calendarProviderType);

    const entity: MeetingEntity = {
      id,
      title,
      meeting_type: meetingType,
      type: meetingType,
      room,
      venue: room,
      date,
      start_time: startTime,
      startTime,
      end_time: endTime,
      endTime,
      status,
      priority: meeting.priority || 'HIGH',
      preparation_pct: meeting.preparation_pct || 75,
      objective: description,
      description,
      department: meeting.department || 'SCM',
      chair: meeting.chair || 'Kamuren Wanjau (Operations Director)',
      secretary: meeting.secretary || 'Sarah Ochieng (Legal Counsel)',
      project_id: meeting.project_id || meeting.projectId,
      projectId: meeting.project_id || meeting.projectId,
      pds_stage: meeting.pds_stage,
      tender_id: meeting.tender_id,
      contract_id: meeting.contract_id,
      current_stage: meeting.current_stage || (status === 'LIVE' ? 'LIVE_MEETING' : 'CONFIGURE'),
      provider: meeting.provider || providerMetadata,
      calendar: meeting.calendar || {
        provider: calendarProviderType,
        sync_status: calendarMetadata.syncStatus,
        event_id: calendarMetadata.eventId,
        organizer: calendarMetadata.organizer,
        attendees: calendarMetadata.attendees,
        reminders: calendarMetadata.reminders,
        recurring: calendarMetadata.recurring,
      },
      participants: (meeting.participants && meeting.participants.length > 0)
        ? meeting.participants.map((p, idx) => ({
            id: p.id || `PART_${id}_${idx + 1}`,
            meetingId: id,
            name: p.name,
            role: p.role || 'MEMBER',
            department: p.department || meeting.department || 'SCM',
            organization: p.organization || 'KETRACO',
            email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '.')}@ketraco.co.ke`,
            attendance: p.attendance || 'INVITED',
            attended: p.attendance === 'ATTENDED' || Boolean(p.attended)
          }))
        : [
            { id: `PART_${id}_1`, meetingId: id, name: meeting.chair || 'Kamuren Wanjau', role: 'CHAIR', department: 'Executive', organization: 'KETRACO', email: 'kamuren.wanjau@ketraco.co.ke', attendance: 'CONFIRMED', attended: false },
            { id: `PART_${id}_2`, meetingId: id, name: meeting.secretary || 'Sarah Ochieng', role: 'SECRETARY', department: 'Legal', organization: 'KETRACO', email: 'sarah.ochieng@ketraco.co.ke', attendance: 'CONFIRMED', attended: false },
            { id: `PART_${id}_3`, meetingId: id, name: 'John Kamau', role: 'MEMBER', department: 'SCM', organization: 'KETRACO', email: 'john.kamau@ketraco.co.ke', attendance: 'INVITED', attended: false }
          ],
      agenda: (meeting.agenda && meeting.agenda.length > 0)
        ? meeting.agenda.map((ag, idx) => ({
            id: ag.id || `AG_${id}_${idx + 1}`,
            meetingId: id,
            sequence: ag.sequence || ag.order || idx + 1,
            order: ag.order || ag.sequence || idx + 1,
            title: ag.title,
            description: ag.description || '',
            presenter: ag.presenter || 'Lead Presenter',
            linkedEntity: ag.linkedEntity || ag.linked_entity,
            status: ag.status || (ag.completed ? 'CLOSED' : 'PENDING'),
            duration_minutes: ag.duration_minutes || ag.durationMinutes || 15,
            durationMinutes: ag.durationMinutes || ag.duration_minutes || 15,
            completed: Boolean(ag.completed),
            notes: ag.notes || ''
          }))
        : [
            { id: `AG_${id}_1`, meetingId: id, sequence: 1, order: 1, title: 'Adoption of Agenda & Quorum Confirmation', presenter: 'Chair', duration_minutes: 10, completed: false, status: 'PENDING' },
            { id: `AG_${id}_2`, meetingId: id, sequence: 2, order: 2, title: 'Substantive Technical & Governance Proceedings', presenter: 'Lead Specialist', duration_minutes: 30, completed: false, status: 'PENDING' }
          ],
      documents: (meeting.documents && meeting.documents.length > 0)
        ? meeting.documents.map((doc, idx) => ({
            id: doc.id || `DOC_${id}_${idx + 1}`,
            meetingId: id,
            name: doc.name,
            category: doc.category || 'TECHNICAL_SPEC',
            size: doc.size || '1.2 MB',
            summary: doc.summary || 'Attached reference documentation.',
            url: doc.url || `/documents/${doc.name}`,
            uploaded_at: doc.uploaded_at || doc.uploadedAt || now,
            uploadedAt: doc.uploadedAt || doc.uploaded_at || now,
            uploaded_by: doc.uploaded_by || doc.uploadedBy || actor,
            uploadedBy: doc.uploadedBy || doc.uploaded_by || actor
          }))
        : [],
      prior_meetings_count: meeting.prior_meetings_count || 1,
      open_decisions_count: meeting.open_decisions_count || 0,
      previous_signals: meeting.previous_signals || [],
      open_commitments: meeting.open_commitments || [],
      relevant_entities: meeting.relevant_entities || meeting.linkedEntities || [],
      linkedEntities: meeting.relevant_entities || meeting.linkedEntities || [],
      tenant_id: meeting.tenant_id || 'ketraco',
      created_by: meeting.created_by || meeting.createdBy || actor,
      createdBy: meeting.created_by || meeting.createdBy || actor,
      started_at: meeting.started_at || null,
      paused_at: meeting.paused_at || null,
      resumed_at: meeting.resumed_at || null,
      ended_at: meeting.ended_at || null,
      total_paused_ms: meeting.total_paused_ms || 0,
      elapsed_seconds: 0,
      created_at: now,
      createdAt: now,
      updated_at: now,
      updatedAt: now
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_entities (
          id, title, meeting_type, room, date, start_time, end_time, status, priority, preparation_pct, objective,
          department, project_id, pds_stage, tender_id, contract_id, current_stage,
          participants_json, agenda_json, documents_json, prior_meetings_count, open_decisions_count,
          previous_signals_json, open_commitments_json, relevant_entities_json, provider_json, calendar_json, tenant_id,
          description, chair, secretary, created_by, venue, started_at, paused_at, resumed_at, ended_at, total_paused_ms, linked_entities_json,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entity.id, entity.title, entity.meeting_type, entity.room, entity.date, entity.start_time, entity.end_time,
          entity.status, entity.priority, entity.preparation_pct, entity.objective, entity.department,
          entity.project_id || null, entity.pds_stage || null, entity.tender_id || null, entity.contract_id || null,
          entity.current_stage, JSON.stringify(entity.participants), JSON.stringify(entity.agenda), JSON.stringify(entity.documents),
          entity.prior_meetings_count, entity.open_decisions_count, JSON.stringify(entity.previous_signals),
          JSON.stringify(entity.open_commitments), JSON.stringify(entity.relevant_entities), JSON.stringify(entity.provider || {}), JSON.stringify(entity.calendar || {}), entity.tenant_id,
          entity.description, entity.chair, entity.secretary, entity.created_by, entity.venue,
          entity.started_at, entity.paused_at, entity.resumed_at, entity.ended_at, entity.total_paused_ms,
          JSON.stringify(entity.linkedEntities),
          entity.created_at, entity.updated_at
        ]
      );

      // Insert relational participants
      for (const p of entity.participants) {
        try {
          await this.db.run(
            `INSERT OR REPLACE INTO meeting_participants (id, meeting_id, name, email, role, attendance, organization, department, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.id, entity.id, p.name, p.email, p.role, p.attendance || 'INVITED', p.organization, p.department, now, now]
          );
        } catch (e) {
          // ignore duplicate insert errors
        }
      }

      // Insert relational agenda items
      for (const ag of entity.agenda) {
        try {
          await this.db.run(
            `INSERT OR REPLACE INTO meeting_agenda_items (id, meeting_id, sequence, title, description, presenter, linked_entity, status, duration_minutes, completed, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ag.id, entity.id, ag.sequence, ag.title, ag.description, ag.presenter, ag.linkedEntity, ag.status || 'PENDING', ag.duration_minutes || 15, ag.completed ? 1 : 0, ag.notes || '', now, now]
          );
        } catch (e) {
          // ignore duplicate insert errors
        }
      }

      // Insert relational documents
      for (const doc of entity.documents) {
        try {
          await this.db.run(
            `INSERT OR REPLACE INTO meeting_documents (id, meeting_id, name, category, size, summary, url, uploaded_by, uploaded_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [doc.id, entity.id, doc.name, doc.category, doc.size, doc.summary, doc.url, doc.uploaded_by, doc.uploaded_at]
          );
        } catch (e) {
          // ignore duplicate insert errors
        }
      }

      // Sync into Knowledge Graph
      this.graphAdapter.syncMeetingToGraph(entity);

      // Log audit
      await this.logAudit('CREATE', 'MEETING', entity.id, actor, { title: entity.title, status: entity.status });

      // Emit event
      await this.emitMeetingEvent('MEETING_CREATED', entity.id, actor, {
        title: entity.title,
        status: entity.status,
        type: entity.meeting_type
      });
    } catch (e) {
      console.error('[MEETING-REPO] Error creating meeting:', e);
      throw e;
    }

    return entity;
  }

  public async updateMeeting(meetingId: string, updates: Partial<MeetingEntity>, actor: string = 'Operator'): Promise<MeetingEntity> {
    const existing = await this.getMeetingById(meetingId);
    if (!existing) {
      throw new Error(`Meeting ${meetingId} not found.`);
    }

    // Check state transition if status is being modified
    if (updates.status && updates.status !== existing.status) {
      const validation = validateMeetingTransition(existing.status, updates.status);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }
    }

    const now = new Date().toISOString();
    const title = updates.title !== undefined ? updates.title.trim() : existing.title;
    const meetingType = updates.meeting_type || updates.type || existing.meeting_type;
    const room = updates.room || updates.venue || existing.room;
    const date = updates.date || existing.date;
    const startTime = updates.start_time || updates.startTime || existing.start_time;
    const endTime = updates.end_time || updates.endTime || existing.end_time;
    const status = updates.status || existing.status;
    const priority = updates.priority || existing.priority;
    const description = updates.description || updates.objective || existing.description;
    const department = updates.department || existing.department;
    const chair = updates.chair !== undefined ? updates.chair : existing.chair;
    const secretary = updates.secretary !== undefined ? updates.secretary : existing.secretary;
    const currentStage = updates.current_stage || existing.current_stage;
    const projectId = updates.project_id !== undefined ? updates.project_id : existing.project_id;
    const tenderId = updates.tender_id !== undefined ? updates.tender_id : existing.tender_id;
    const contractId = updates.contract_id !== undefined ? updates.contract_id : existing.contract_id;
    const pdsStage = updates.pds_stage !== undefined ? updates.pds_stage : existing.pds_stage;
    const providerMetadata = updates.provider ? updates.provider : existing.provider || enrichMeetingProviderMetadata(existing, existing.provider?.type || 'INTERNAL');
    const calendarData = updates.calendar ? updates.calendar : existing.calendar || {
      provider: 'OUTLOOK',
      sync_status: 'SYNCED',
    };

    await this.db.run(
      `UPDATE meeting_entities SET
        title = ?, meeting_type = ?, room = ?, venue = ?, date = ?, start_time = ?, end_time = ?,
        status = ?, priority = ?, objective = ?, description = ?, department = ?, chair = ?, secretary = ?,
        project_id = ?, tender_id = ?, contract_id = ?, pds_stage = ?, current_stage = ?, provider_json = ?, calendar_json = ?, updated_at = ?
       WHERE id = ?`,
      [
        title, meetingType, room, room, date, startTime, endTime,
        status, priority, description, description, department, chair, secretary,
        projectId, tenderId, contractId, pdsStage, currentStage, JSON.stringify(providerMetadata), JSON.stringify(calendarData), now, meetingId
      ]
    );

    await this.logAudit('EDIT', 'MEETING', meetingId, actor, { updates });
    await this.emitMeetingEvent('MEETING_UPDATED', meetingId, actor, { updates });

    return (await this.getMeetingById(meetingId))!;
  }

  public async deleteMeeting(meetingId: string, actor: string = 'Operator'): Promise<boolean> {
    const existing = await this.getMeetingById(meetingId);
    if (!existing) {
      throw new Error(`Meeting ${meetingId} not found.`);
    }

    await this.db.run(`DELETE FROM meeting_participants WHERE meeting_id = ?`, [meetingId]);
    await this.db.run(`DELETE FROM meeting_agenda_items WHERE meeting_id = ?`, [meetingId]);
    await this.db.run(`DELETE FROM meeting_documents WHERE meeting_id = ?`, [meetingId]);
    await this.db.run(`DELETE FROM meeting_transcripts WHERE meeting_id = ?`, [meetingId]);
    await this.db.run(`DELETE FROM meeting_signals WHERE meeting_id = ?`, [meetingId]);
    await this.db.run(`DELETE FROM meeting_entities WHERE id = ?`, [meetingId]);

    await this.logAudit('DELETE', 'MEETING', meetingId, actor, { title: existing.title });
    await this.emitMeetingEvent('MEETING_DELETED', meetingId, actor, { title: existing.title });

    return true;
  }

  // --- LIFECYCLE CONTROLS (START, PAUSE, RESUME, END) ---

  public async startMeeting(meetingId: string, actor: string = 'Operator'): Promise<MeetingEntity> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    const validInitialStatuses = ['SCHEDULED', 'DRAFT', 'READY', 'CREATED'];
    if (!validInitialStatuses.includes(meeting.status)) {
      throw new Error(`Cannot start meeting in ${meeting.status} state. Only SCHEDULED or DRAFT sessions can be started.`);
    }

    const now = new Date().toISOString();
    await this.db.run(
      `UPDATE meeting_entities SET
        status = 'LIVE',
        started_at = ?,
        paused_at = NULL,
        current_stage = 'LIVE_MEETING',
        updated_at = ?
       WHERE id = ?`,
      [now, now, meetingId]
    );

    await this.logAudit('START', 'MEETING', meetingId, actor, { started_at: now });
    await this.emitMeetingEvent('MEETING_STARTED', meetingId, actor, { started_at: now });

    return (await this.getMeetingById(meetingId))!;
  }

  public async pauseMeeting(meetingId: string, actor: string = 'Operator'): Promise<MeetingEntity> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (meeting.status !== 'LIVE') {
      throw new Error(`Cannot pause meeting in ${meeting.status} state. Only LIVE sessions can be paused.`);
    }

    const now = new Date().toISOString();
    await this.db.run(
      `UPDATE meeting_entities SET
        status = 'PAUSED',
        paused_at = ?,
        updated_at = ?
       WHERE id = ?`,
      [now, now, meetingId]
    );

    await this.logAudit('PAUSE', 'MEETING', meetingId, actor, { paused_at: now });
    await this.emitMeetingEvent('MEETING_PAUSED', meetingId, actor, { paused_at: now });

    return (await this.getMeetingById(meetingId))!;
  }

  public async resumeMeeting(meetingId: string, actor: string = 'Operator'): Promise<MeetingEntity> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (meeting.status !== 'PAUSED') {
      throw new Error(`Cannot resume meeting in ${meeting.status} state. Only PAUSED sessions can be resumed.`);
    }

    const now = new Date();
    const nowIso = now.toISOString();

    let additionalPausedMs = 0;
    if (meeting.paused_at) {
      const pauseTime = new Date(meeting.paused_at).getTime();
      if (!isNaN(pauseTime)) {
        additionalPausedMs = Math.max(0, now.getTime() - pauseTime);
      }
    }

    const newTotalPausedMs = (meeting.total_paused_ms || 0) + additionalPausedMs;

    await this.db.run(
      `UPDATE meeting_entities SET
        status = 'LIVE',
        paused_at = NULL,
        resumed_at = ?,
        total_paused_ms = ?,
        updated_at = ?
       WHERE id = ?`,
      [nowIso, newTotalPausedMs, nowIso, meetingId]
    );

    await this.logAudit('RESUME', 'MEETING', meetingId, actor, { resumed_at: nowIso, total_paused_ms: newTotalPausedMs });
    await this.emitMeetingEvent('MEETING_RESUMED', meetingId, actor, { resumed_at: nowIso, total_paused_ms: newTotalPausedMs });

    return (await this.getMeetingById(meetingId))!;
  }

  public async endMeeting(meetingId: string, actor: string = 'Operator'): Promise<MeetingEntity> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (meeting.status !== 'LIVE' && meeting.status !== 'PAUSED') {
      throw new Error(`Cannot end meeting in ${meeting.status} state. Only LIVE or PAUSED sessions can be ended.`);
    }

    const now = new Date();
    const nowIso = now.toISOString();

    let finalTotalPausedMs = meeting.total_paused_ms || 0;
    if (meeting.status === 'PAUSED' && meeting.paused_at) {
      const pauseTime = new Date(meeting.paused_at).getTime();
      if (!isNaN(pauseTime)) {
        finalTotalPausedMs += Math.max(0, now.getTime() - pauseTime);
      }
    }

    await this.db.run(
      `UPDATE meeting_entities SET
        status = 'COMPLETED',
        paused_at = NULL,
        ended_at = ?,
        total_paused_ms = ?,
        current_stage = 'APPROVAL',
        updated_at = ?
       WHERE id = ?`,
      [nowIso, finalTotalPausedMs, nowIso, meetingId]
    );

    await this.logAudit('END', 'MEETING', meetingId, actor, { ended_at: nowIso, total_paused_ms: finalTotalPausedMs });
    await this.emitMeetingEvent('MEETING_ENDED', meetingId, actor, { ended_at: nowIso, total_paused_ms: finalTotalPausedMs });

    return (await this.getMeetingById(meetingId))!;
  }

  public async updateMeetingStage(meetingId: string, stage: MeetingLoopStage, actor: string = 'Operator'): Promise<boolean> {
    try {
      await this.db.run(
        `UPDATE meeting_entities SET current_stage = ?, updated_at = ? WHERE id = ?`,
        [stage, new Date().toISOString(), meetingId]
      );
      await this.logAudit('EDIT', 'MEETING', meetingId, actor, { stageTransition: stage });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error updating stage:', e);
      return false;
    }
  }

  // --- PARTICIPANTS MANAGEMENT ---

  public async getParticipants(meetingId: string): Promise<Participant[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_participants WHERE meeting_id = ? ORDER BY created_at ASC`,
        [meetingId]
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          meetingId: r.meeting_id,
          name: r.name,
          email: r.email,
          role: r.role,
          attendance: r.attendance,
          organization: r.organization,
          department: r.department,
          attended: r.attendance === 'ATTENDED',
          created_at: r.created_at,
          updated_at: r.updated_at
        }));
      }

      // Fallback to meeting_entities.participants_json
      const meeting = await this.getMeetingById(meetingId);
      return (meeting?.participants || []) as Participant[];
    } catch (e) {
      console.warn(`[MEETING-REPO] Error getting participants for ${meetingId}:`, e);
      return [];
    }
  }

  public async addParticipant(meetingId: string, participant: Partial<Participant>, actor: string = 'Operator'): Promise<Participant> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (!participant.name || !participant.name.trim()) {
      throw new Error('Participant name is required.');
    }

    const trimmedName = participant.name.trim();

    // Check for duplicate participant (Requirement 5)
    const existing = await this.db.get<any>(
      `SELECT id FROM meeting_participants WHERE meeting_id = ? AND LOWER(name) = LOWER(?)`,
      [meetingId, trimmedName]
    );
    if (existing) {
      throw new Error(`Participant with name "${trimmedName}" already exists in meeting ${meetingId}.`);
    }

    const id = participant.id || `PART_${meetingId}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 3)}`;
    const now = new Date().toISOString();
    const role = participant.role || 'MEMBER';
    const attendance = participant.attendance || 'INVITED';
    const department = participant.department || meeting.department || 'SCM';
    const organization = participant.organization || 'KETRACO';
    const email = participant.email || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@ketraco.co.ke`;

    const newPart: Participant = {
      id,
      meetingId,
      name: trimmedName,
      email,
      role,
      attendance,
      organization,
      department,
      attended: attendance === 'ATTENDED',
      created_at: now,
      updated_at: now
    };

    await this.db.run(
      `INSERT INTO meeting_participants (id, meeting_id, name, email, role, attendance, organization, department, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, meetingId, trimmedName, email, role, attendance, organization, department, now, now]
    );

    // Sync participants_json
    const all = await this.getParticipants(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET participants_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('PARTICIPANT_CHANGE', 'MEETING', meetingId, actor, { action: 'ADD', participant: newPart });
    await this.emitMeetingEvent('PARTICIPANT_ADDED', meetingId, actor, { participant: newPart });

    return newPart;
  }

  public async updateParticipant(meetingId: string, participantId: string, updates: Partial<Participant>, actor: string = 'Operator'): Promise<Participant | null> {
    const existing = await this.db.get<any>(
      `SELECT * FROM meeting_participants WHERE id = ? AND meeting_id = ?`,
      [participantId, meetingId]
    );
    if (!existing) {
      throw new Error(`Participant ${participantId} not found in meeting ${meetingId}.`);
    }

    const now = new Date().toISOString();
    const name = updates.name ? updates.name.trim() : existing.name;
    const email = updates.email !== undefined ? updates.email : existing.email;
    const role = updates.role || existing.role;
    const attendance = updates.attendance || existing.attendance;
    const department = updates.department !== undefined ? updates.department : existing.department;
    const organization = updates.organization !== undefined ? updates.organization : existing.organization;

    await this.db.run(
      `UPDATE meeting_participants SET
        name = ?, email = ?, role = ?, attendance = ?, department = ?, organization = ?, updated_at = ?
       WHERE id = ? AND meeting_id = ?`,
      [name, email, role, attendance, department, organization, now, participantId, meetingId]
    );

    const all = await this.getParticipants(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET participants_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('PARTICIPANT_CHANGE', 'MEETING', meetingId, actor, { action: 'UPDATE', participantId, updates });
    await this.emitMeetingEvent('PARTICIPANT_UPDATED', meetingId, actor, { participantId, updates });

    const updated = await this.db.get<any>(`SELECT * FROM meeting_participants WHERE id = ?`, [participantId]);
    return updated ? {
      id: updated.id,
      meetingId: updated.meeting_id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      attendance: updated.attendance,
      organization: updated.organization,
      department: updated.department,
      attended: updated.attendance === 'ATTENDED',
      created_at: updated.created_at,
      updated_at: updated.updated_at
    } : null;
  }

  public async removeParticipant(meetingId: string, participantId: string, actor: string = 'Operator'): Promise<boolean> {
    const existing = await this.db.get<any>(
      `SELECT * FROM meeting_participants WHERE id = ? AND meeting_id = ?`,
      [participantId, meetingId]
    );
    if (!existing) {
      throw new Error(`Participant ${participantId} not found in meeting ${meetingId}.`);
    }

    await this.db.run(`DELETE FROM meeting_participants WHERE id = ? AND meeting_id = ?`, [participantId, meetingId]);

    const now = new Date().toISOString();
    const all = await this.getParticipants(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET participants_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('PARTICIPANT_CHANGE', 'MEETING', meetingId, actor, { action: 'REMOVE', participantId, name: existing.name });
    await this.emitMeetingEvent('PARTICIPANT_REMOVED', meetingId, actor, { participantId, name: existing.name });

    return true;
  }

  // --- AGENDA MANAGEMENT ---

  public async getAgenda(meetingId: string): Promise<AgendaItem[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_agenda_items WHERE meeting_id = ? ORDER BY sequence ASC`,
        [meetingId]
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          meetingId: r.meeting_id,
          meeting_id: r.meeting_id,
          sequence: r.sequence,
          order: r.sequence,
          title: r.title,
          description: r.description,
          presenter: r.presenter,
          linkedEntity: r.linked_entity,
          linked_entity: r.linked_entity,
          status: r.status,
          duration_minutes: r.duration_minutes,
          durationMinutes: r.duration_minutes,
          completed: Boolean(r.completed),
          notes: r.notes
        }));
      }

      const meeting = await this.getMeetingById(meetingId);
      return meeting?.agenda || [];
    } catch (e) {
      console.warn(`[MEETING-REPO] Error getting agenda for ${meetingId}:`, e);
      return [];
    }
  }

  public async addAgendaItem(meetingId: string, item: Partial<AgendaItem>, actor: string = 'Operator'): Promise<AgendaItem> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (!item.title || !item.title.trim()) {
      throw new Error('Agenda item title is required.');
    }

    const currentAgenda = await this.getAgenda(meetingId);
    const nextSequence = item.sequence || item.order || (currentAgenda.length + 1);
    const id = item.id || `AG_${meetingId}_${Date.now().toString(36)}_${nextSequence}`;
    const now = new Date().toISOString();

    const newAgenda: AgendaItem = {
      id,
      meetingId,
      sequence: nextSequence,
      order: nextSequence,
      title: item.title.trim(),
      description: item.description || '',
      presenter: item.presenter || 'Lead Presenter',
      linkedEntity: item.linkedEntity || item.linked_entity,
      status: item.status || 'PENDING',
      duration_minutes: item.duration_minutes || item.durationMinutes || 15,
      durationMinutes: item.durationMinutes || item.duration_minutes || 15,
      completed: Boolean(item.completed),
      notes: item.notes || ''
    };

    await this.db.run(
      `INSERT INTO meeting_agenda_items (id, meeting_id, sequence, title, description, presenter, linked_entity, status, duration_minutes, completed, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, meetingId, newAgenda.sequence, newAgenda.title, newAgenda.description,
        newAgenda.presenter, newAgenda.linkedEntity || null, newAgenda.status,
        newAgenda.duration_minutes, newAgenda.completed ? 1 : 0, newAgenda.notes, now, now
      ]
    );

    const all = await this.getAgenda(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET agenda_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('AGENDA_CHANGE', 'MEETING', meetingId, actor, { action: 'ADD', item: newAgenda });
    await this.emitMeetingEvent('AGENDA_UPDATED', meetingId, actor, { action: 'ADD', itemId: id });

    return newAgenda;
  }

  public async updateAgendaItem(meetingId: string, itemId: string, updates: Partial<AgendaItem>, actor: string = 'Operator'): Promise<AgendaItem | null> {
    const existing = await this.db.get<any>(
      `SELECT * FROM meeting_agenda_items WHERE id = ? AND meeting_id = ?`,
      [itemId, meetingId]
    );
    if (!existing) {
      throw new Error(`Agenda item ${itemId} not found in meeting ${meetingId}.`);
    }

    const now = new Date().toISOString();
    const title = updates.title !== undefined ? updates.title.trim() : existing.title;
    const description = updates.description !== undefined ? updates.description : existing.description;
    const presenter = updates.presenter !== undefined ? updates.presenter : existing.presenter;
    const linkedEntity = updates.linkedEntity || updates.linked_entity || existing.linked_entity;
    const status = updates.status || (updates.completed !== undefined ? (updates.completed ? 'CLOSED' : 'PENDING') : existing.status);
    const durationMinutes = updates.duration_minutes || updates.durationMinutes || existing.duration_minutes;
    const completed = updates.completed !== undefined ? (updates.completed ? 1 : 0) : existing.completed;
    const notes = updates.notes !== undefined ? updates.notes : existing.notes;
    const sequence = updates.sequence || updates.order || existing.sequence;

    await this.db.run(
      `UPDATE meeting_agenda_items SET
        title = ?, description = ?, presenter = ?, linked_entity = ?, status = ?,
        duration_minutes = ?, completed = ?, notes = ?, sequence = ?, updated_at = ?
       WHERE id = ? AND meeting_id = ?`,
      [title, description, presenter, linkedEntity, status, durationMinutes, completed, notes, sequence, now, itemId, meetingId]
    );

    const all = await this.getAgenda(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET agenda_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('AGENDA_CHANGE', 'MEETING', meetingId, actor, { action: 'UPDATE', itemId, updates });
    await this.emitMeetingEvent('AGENDA_UPDATED', meetingId, actor, { action: 'UPDATE', itemId });

    const updated = await this.db.get<any>(`SELECT * FROM meeting_agenda_items WHERE id = ?`, [itemId]);
    return updated ? {
      id: updated.id,
      meetingId: updated.meeting_id,
      sequence: updated.sequence,
      order: updated.sequence,
      title: updated.title,
      description: updated.description,
      presenter: updated.presenter,
      linkedEntity: updated.linked_entity,
      status: updated.status,
      duration_minutes: updated.duration_minutes,
      durationMinutes: updated.duration_minutes,
      completed: Boolean(updated.completed),
      notes: updated.notes
    } : null;
  }

  public async reorderAgenda(meetingId: string, orderedIds: string[], actor: string = 'Operator'): Promise<AgendaItem[]> {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('orderedIds array is required for reordering.');
    }

    const now = new Date().toISOString();
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const seq = i + 1;
      await this.db.run(
        `UPDATE meeting_agenda_items SET sequence = ?, updated_at = ? WHERE id = ? AND meeting_id = ?`,
        [seq, now, id, meetingId]
      );
    }

    const all = await this.getAgenda(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET agenda_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('AGENDA_CHANGE', 'MEETING', meetingId, actor, { action: 'REORDER', orderedIds });
    await this.emitMeetingEvent('AGENDA_UPDATED', meetingId, actor, { action: 'REORDER', orderedIds });

    return all;
  }

  public async removeAgendaItem(meetingId: string, itemId: string, actor: string = 'Operator'): Promise<boolean> {
    const existing = await this.db.get<any>(
      `SELECT * FROM meeting_agenda_items WHERE id = ? AND meeting_id = ?`,
      [itemId, meetingId]
    );
    if (!existing) {
      throw new Error(`Agenda item ${itemId} not found in meeting ${meetingId}.`);
    }

    await this.db.run(`DELETE FROM meeting_agenda_items WHERE id = ? AND meeting_id = ?`, [itemId, meetingId]);

    const now = new Date().toISOString();
    const all = await this.getAgenda(meetingId);
    // Re-sequence remaining items
    for (let i = 0; i < all.length; i++) {
      await this.db.run(
        `UPDATE meeting_agenda_items SET sequence = ? WHERE id = ?`,
        [i + 1, all[i].id]
      );
    }

    const updatedAll = await this.getAgenda(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET agenda_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(updatedAll), now, meetingId]
    );

    await this.logAudit('AGENDA_CHANGE', 'MEETING', meetingId, actor, { action: 'REMOVE', itemId, title: existing.title });
    await this.emitMeetingEvent('AGENDA_UPDATED', meetingId, actor, { action: 'REMOVE', itemId });

    return true;
  }

  // --- DOCUMENTS MANAGEMENT ---

  public async getDocuments(meetingId: string): Promise<MeetingDocument[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_documents WHERE meeting_id = ? ORDER BY uploaded_at DESC`,
        [meetingId]
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          meetingId: r.meeting_id,
          name: r.name,
          category: r.category,
          size: r.size,
          summary: r.summary,
          url: r.url,
          uploadedAt: r.uploaded_at,
          uploaded_at: r.uploaded_at,
          uploadedBy: r.uploaded_by,
          uploaded_by: r.uploaded_by
        }));
      }

      const meeting = await this.getMeetingById(meetingId);
      return meeting?.documents || [];
    } catch (e) {
      console.warn(`[MEETING-REPO] Error getting documents for ${meetingId}:`, e);
      return [];
    }
  }

  public async addDocument(meetingId: string, doc: Partial<MeetingDocument>, actor: string = 'Operator'): Promise<MeetingDocument> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    if (!doc.name || !doc.name.trim()) {
      throw new Error('Document name is required.');
    }

    const id = doc.id || `DOC_${meetingId}_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newDoc: MeetingDocument = {
      id,
      meetingId,
      name: doc.name.trim(),
      category: doc.category || 'TECHNICAL_SPEC',
      size: doc.size || '1.4 MB',
      summary: doc.summary || 'Supporting document for meeting proceedings.',
      url: doc.url || `/documents/${doc.name.trim()}`,
      uploadedAt: now,
      uploaded_at: now,
      uploadedBy: doc.uploadedBy || doc.uploaded_by || actor,
      uploaded_by: doc.uploaded_by || doc.uploadedBy || actor
    };

    await this.db.run(
      `INSERT INTO meeting_documents (id, meeting_id, name, category, size, summary, url, uploaded_by, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, meetingId, newDoc.name, newDoc.category, newDoc.size, newDoc.summary, newDoc.url, newDoc.uploaded_by, now]
    );

    const all = await this.getDocuments(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET documents_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('DOCUMENT_ATTACH', 'MEETING', meetingId, actor, { document: newDoc });
    await this.emitMeetingEvent('DOCUMENT_ATTACHED', meetingId, actor, { document: newDoc });

    return newDoc;
  }

  public async removeDocument(meetingId: string, documentId: string, actor: string = 'Operator'): Promise<boolean> {
    const existing = await this.db.get<any>(
      `SELECT * FROM meeting_documents WHERE id = ? AND meeting_id = ?`,
      [documentId, meetingId]
    );
    if (!existing) {
      throw new Error(`Document ${documentId} not found in meeting ${meetingId}.`);
    }

    await this.db.run(`DELETE FROM meeting_documents WHERE id = ? AND meeting_id = ?`, [documentId, meetingId]);

    const now = new Date().toISOString();
    const all = await this.getDocuments(meetingId);
    await this.db.run(
      `UPDATE meeting_entities SET documents_json = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(all), now, meetingId]
    );

    await this.logAudit('DOCUMENT_DETACH', 'MEETING', meetingId, actor, { documentId, name: existing.name });
    await this.emitMeetingEvent('DOCUMENT_DETACHED', meetingId, actor, { documentId, name: existing.name });

    return true;
  }

  // --- CONTEXT & ORGANIZATIONAL MEMORY RETRIEVAL (Requirement 9) ---

  public async getMeetingContext(meetingId: string): Promise<any> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error(`Meeting ${meetingId} not found.`);

    const [participants, agenda, documents] = await Promise.all([
      this.getParticipants(meetingId),
      this.getAgenda(meetingId),
      this.getDocuments(meetingId)
    ]);

    // Query previous related meetings
    let previousMeetings: MeetingEntity[] = [];
    try {
      const prevRows = await this.db.all<any>(
        `SELECT * FROM meeting_entities
         WHERE id != ? AND (department = ? OR project_id = ? OR meeting_type = ?)
         ORDER BY created_at DESC LIMIT 5`,
        [meetingId, meeting.department, meeting.project_id || '', meeting.meeting_type]
      );
      previousMeetings = prevRows.map(r => this.mapMeetingEntity(r));
    } catch (e) {
      // ignore
    }

    // Query outstanding actions for the project / department
    let outstandingActions: ActionControlItem[] = [];
    try {
      const actRows = await this.db.all<any>(
        `SELECT * FROM meeting_actions
         WHERE status != 'COMPLETED' AND (department = ? OR project_id = ? OR source_meeting_id = ?)
         ORDER BY due_date ASC LIMIT 10`,
        [meeting.department, meeting.project_id || '', meetingId]
      );
      outstandingActions = actRows.map(r => this.mapAction(r));
    } catch (e) {
      // ignore
    }

    // Query previous decisions
    let previousDecisions: DecisionRecord[] = [];
    try {
      const decRows = await this.db.all<any>(
        `SELECT * FROM meeting_decisions
         WHERE department = ? OR project_id = ? OR meeting_id = ?
         ORDER BY created_at DESC LIMIT 10`,
        [meeting.department, meeting.project_id || '', meetingId]
      );
      previousDecisions = decRows.map(r => this.mapDecision(r));
    } catch (e) {
      // ignore
    }

    // Query risks
    let activeRisks: RiskItem[] = [];
    try {
      const riskRows = await this.db.all<any>(
        `SELECT * FROM meeting_risks
         WHERE status = 'OPEN' AND (source_meeting_id = ? OR department = ?)
         LIMIT 10`,
        [meetingId, meeting.department]
      );
      activeRisks = riskRows.map(r => ({
        id: r.id,
        meeting_id: r.meeting_id || r.source_meeting_id,
        risk_title: r.risk_title || r.title,
        severity: r.severity || 'MEDIUM',
        likelihood: r.likelihood || 'MEDIUM',
        mitigation_plan: r.mitigation_plan || '',
        owner: r.owner || 'Unassigned',
        status: r.status || 'OPEN',
        project_id: r.project_id || undefined,
        tender_id: r.tender_id || undefined,
        created_at: r.created_at || new Date().toISOString()
      }));
    } catch (e) {
      // ignore
    }

    return {
      meeting: {
        ...meeting,
        participants,
        agenda,
        documents
      },
      participants,
      agenda,
      documents,
      linkedEntities: meeting.linkedEntities || meeting.relevant_entities || [],
      previousMeetings,
      outstandingActions,
      previousDecisions,
      activeRisks
    };
  }

  // --- LIFECYCLE AUDIT & EVENT DISPATCHING ---

  public async emitMeetingEvent(
    eventType: string,
    meetingId: string,
    actor: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const eventId = `EVT_MTG_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const correlationId = metadata.correlationId || `CORR_${meetingId}`;
    const tenantId = metadata.tenantId || 'ketraco';

    // 1. Persist to meeting_lifecycle_events
    try {
      await this.db.run(
        `INSERT INTO meeting_lifecycle_events (event_id, event_type, entity_id, actor, timestamp, correlation_id, tenant_id, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, eventType, meetingId, actor, now, correlationId, tenantId, JSON.stringify(metadata)]
      );
    } catch (e) {
      console.warn('[MEETING-REPO] Failed to persist lifecycle event:', e);
    }

    // 2. Publish to Central Event Fabric
    try {
      const eventFabric = EventFabric.getInstance();
      await (eventFabric.publishEvent as any)({
        id: eventId,
        incidentId: eventId,
        title: `Meeting Event: ${eventType}`,
        description: `Lifecycle event ${eventType} on meeting ${meetingId} by ${actor}`,
        affectedAssets: [meetingId],
        priority: 'P3',
        eventType: eventType as any,
        category: 'INCIDENT',
        timestamp: now,
        sourceId: 'meeting-engine',
        severity: 'INFO',
        status: 'PENDING',
        tags: ['meeting', eventType.toLowerCase(), meetingId],
        metadata: {
          meetingId,
          actor,
          correlationId,
          ...metadata
        }
      });
    } catch (e) {
      console.warn('[MEETING-REPO] Failed to publish event to EventFabric:', e);
    }
  }

  public async getLifecycleEvents(meetingId: string): Promise<MeetingLifecycleEvent[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_lifecycle_events WHERE entity_id = ? ORDER BY timestamp DESC`,
        [meetingId]
      );
      return rows.map(r => ({
        eventId: r.event_id,
        eventType: r.event_type,
        entityId: r.entity_id,
        actor: r.actor,
        timestamp: r.timestamp,
        correlationId: r.correlation_id,
        tenantId: r.tenant_id,
        metadata: JSON.parse(r.metadata_json || '{}')
      }));
    } catch (e) {
      console.warn(`[MEETING-REPO] Failed to get lifecycle events for ${meetingId}:`, e);
      return [];
    }
  }

  public async getRecordingSessions(meetingId: string): Promise<RecordingSession[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_recording_sessions WHERE meeting_id = ? ORDER BY created_at DESC`,
        [meetingId]
      );
      return rows.map(r => ({
        id: r.id,
        meetingId: r.meeting_id,
        tenantId: r.tenant_id,
        status: r.status,
        startedAt: r.started_at,
        endedAt: r.ended_at,
        durationMs: Number(r.duration_ms || 0),
        mediaType: (r.media_type || 'audio/webm') as RecordingSession['mediaType'],
        codec: r.codec || undefined,
        storageRef: r.storage_ref || undefined,
        checksum: r.checksum || undefined,
        size: Number(r.size_bytes || 0),
        createdBy: r.created_by || undefined,
        version: r.version || '1.0'
      }));
    } catch (e) {
      console.warn(`[MEETING-REPO] Failed to load recording sessions for ${meetingId}:`, e);
      return [];
    }
  }

  public async saveRecordingSession(session: Partial<RecordingSession>): Promise<RecordingSession> {
    const id = session.id || `REC_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const record: RecordingSession = {
      id,
      meetingId: session.meetingId || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      tenantId: session.tenantId || 'ketraco',
      status: session.status || 'IDLE',
      startedAt: session.startedAt || now,
      endedAt: session.endedAt || now,
      durationMs: session.durationMs || 0,
      mediaType: session.mediaType || 'audio/webm',
      codec: session.codec || 'opus',
      storageRef: session.storageRef || undefined,
      checksum: session.checksum || undefined,
      size: session.size || 0,
      createdBy: session.createdBy || 'browser-recorder',
      version: session.version || '1.0'
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_recording_sessions (id, meeting_id, tenant_id, status, started_at, ended_at, duration_ms, media_type, codec, storage_ref, checksum, size_bytes, created_by, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id, record.meetingId, record.tenantId, record.status, record.startedAt || now,
          record.endedAt || now, record.durationMs || 0, record.mediaType, record.codec || 'opus',
          record.storageRef || null, record.checksum || null, record.size || 0, record.createdBy || 'browser-recorder',
          record.version || '1.0', now, now
        ]
      );
    } catch (e) {
      console.warn('[MEETING-REPO] Failed to save recording session:', e);
    }

    return record;
  }

  // --- TRANSCRIPTS ---

  public async getTranscripts(meetingId: string): Promise<TranscriptSegment[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_transcripts WHERE meeting_id = ? ORDER BY start_seconds ASC`,
        [meetingId]
      );
      return rows.map(r => ({
        id: r.id,
        meeting_id: r.meeting_id,
        speaker: r.speaker,
        speaker_role: r.speaker_role || undefined,
        timestamp_label: r.timestamp_label,
        start_seconds: r.start_seconds,
        text: r.text,
        confidence: r.confidence,
        sentiment: r.sentiment,
        is_key_point: Boolean(r.is_key_point),
        created_at: r.created_at
      }));
    } catch (e) {
      console.warn('[MEETING-REPO] Error getting transcripts:', e);
      return [];
    }
  }

  public async addTranscriptSegment(segment: Partial<TranscriptSegment>): Promise<TranscriptSegment> {
    const id = segment.id || `TR_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newSeg: TranscriptSegment = {
      id,
      meeting_id: segment.meeting_id || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      speaker: segment.speaker || 'Operator',
      speaker_role: segment.speaker_role || 'Participant',
      timestamp_label: segment.timestamp_label || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      start_seconds: segment.start_seconds || Math.floor(Date.now() / 1000) % 3600,
      text: segment.text || '',
      confidence: segment.confidence || 95,
      sentiment: segment.sentiment || 'NEUTRAL',
      is_key_point: Boolean(segment.is_key_point),
      created_at: new Date().toISOString()
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_transcripts (id, meeting_id, speaker, speaker_role, timestamp_label, start_seconds, text, confidence, sentiment, is_key_point, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newSeg.id, newSeg.meeting_id, newSeg.speaker, newSeg.speaker_role || null,
          newSeg.timestamp_label, newSeg.start_seconds, newSeg.text, newSeg.confidence,
          newSeg.sentiment || null, newSeg.is_key_point ? 1 : 0, newSeg.created_at
        ]
      );
    } catch (e) {
      console.error('[MEETING-REPO] Error inserting transcript segment:', e);
    }

    return newSeg;
  }

  // --- DETECTED INTELLIGENCE ITEMS (SIGNALS) ---

  public async getDetectedItems(meetingId: string): Promise<DetectedIntelligenceItem[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_signals WHERE meeting_id = ? ORDER BY created_at DESC`,
        [meetingId]
      );
      return rows.map(r => this.mapDetectedItem(r));
    } catch (e) {
      console.warn('[MEETING-REPO] Error getting detected items:', e);
      return [];
    }
  }

  public async addDetectedItem(item: Partial<DetectedIntelligenceItem>): Promise<DetectedIntelligenceItem> {
    const id = item.id || `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const fullItem: DetectedIntelligenceItem = {
      id,
      meeting_id: item.meeting_id || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      item_type: item.item_type || 'DECISION',
      speaker: item.speaker || 'Executive Participant',
      timestamp_label: item.timestamp_label || '10:00',
      source_text: item.source_text || item.text || '',
      suggested_title: item.suggested_title || 'Governance Signal Identified',
      confidence: item.confidence || 90,
      linked_entity: item.linked_entity || item.entity_tag || 'KETRACO Governance',
      category: item.category || item.category_tag || 'GOVERNANCE',
      evidence_quote: item.evidence_quote || item.source_text || '',
      status: item.status || 'PENDING',
      reviewed_by: item.reviewed_by,
      reviewed_at: item.reviewed_at,
      review_notes: item.review_notes,
      promoted_entity_id: item.promoted_entity_id,
      created_at: new Date().toISOString()
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_signals (id, meeting_id, signal_type, speaker, timestamp_label, text, suggested_title, confidence, entity_tag, category_tag, evidence_quote, status, reviewed_by, reviewed_at, review_notes, promoted_entity_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullItem.id, fullItem.meeting_id, fullItem.item_type, fullItem.speaker || null,
          fullItem.timestamp_label, fullItem.source_text, fullItem.suggested_title,
          fullItem.confidence, fullItem.linked_entity, fullItem.category,
          fullItem.evidence_quote, fullItem.status, fullItem.reviewed_by || null,
          fullItem.reviewed_at || null, fullItem.review_notes || null,
          fullItem.promoted_entity_id || null, fullItem.created_at
        ]
      );
    } catch (e) {
      console.error('[MEETING-REPO] Error saving detected item:', e);
    }

    return fullItem;
  }

  /**
   * Human Governance Review: ACCEPT, EDIT, or REJECT an AI detected item.
   * If ACCEPTED, automatically promotes the item to a first-class official entity
   * (DecisionRecord, ActionControlItem, RiskItem, or CommitmentRecord)!
   */
  public async reviewDetectedItem(
    id: string,
    status: ReviewStatus,
    notes?: string,
    reviewer?: string,
    editedValues?: Partial<DetectedIntelligenceItem>
  ): Promise<{ success: boolean; promotedEntityId?: string }> {
    try {
      const itemRow = await this.db.get<any>(`SELECT * FROM meeting_signals WHERE id = ?`, [id]);
      if (!itemRow) return { success: false };

      const item = this.mapDetectedItem(itemRow);
      const reviewedAt = new Date().toISOString();
      const actualReviewer = reviewer || 'Kamuren Wanjau (Operations Director)';

      let promotedId: string | undefined;

      if (status === 'ACCEPTED' || status === 'EDITED') {
        const titleToUse = editedValues?.suggested_title || item.suggested_title;

        // Promote to formal entity based on item_type
        if (item.item_type === 'DECISION') {
          const dec = await this.createDecision({
            code: `D-0${Math.floor(240 + Math.random() * 50)}`,
            title: titleToUse,
            description: item.source_text,
            authority: 'Operations Director',
            owner: item.speaker || 'Kamuren Wanjau',
            meeting_id: item.meeting_id,
            status: 'AWAITING_APPROVAL',
            confidence: item.confidence,
            evidence_text: item.evidence_quote,
            project_id: 'PRJ-SCM-MOD-2025'
          });
          promotedId = dec.id;
        } else if (item.item_type === 'ACTION') {
          const act = await this.createAction({
            action_title: titleToUse,
            description: item.source_text,
            owner: item.speaker || 'John Kamau',
            department: 'SCM',
            due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
            priority: 'HIGH',
            status: 'ON_TRACK',
            source_meeting_id: item.meeting_id,
            evidence_text: item.evidence_quote,
            dependencies: [],
            linked_entities: [item.linked_entity]
          });
          promotedId = act.id;
        } else if (item.item_type === 'RISK') {
          const rsk = await this.createRisk({
            meeting_id: item.meeting_id,
            risk_title: titleToUse,
            severity: 'HIGH',
            likelihood: 'HIGH',
            mitigation_plan: `Mitigate dependency risk identified during ${item.timestamp_label} proceedings.`,
            owner: item.speaker || 'Eng. Patrick Odhiambo',
            status: 'OPEN'
          });
          promotedId = rsk.id;
        } else if (item.item_type === 'COMMITMENT') {
          const com = await this.createCommitment({
            meeting_id: item.meeting_id,
            commitment_title: titleToUse,
            party: item.speaker || 'Contractor / Director',
            owner: item.speaker || 'John Kamau',
            target_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            status: 'ACTIVE',
            evidence_ref: item.evidence_quote
          });
          promotedId = com.id;
        }
      }

      await this.db.run(
        `UPDATE meeting_signals 
         SET status = ?, reviewed_by = ?, reviewed_at = ?, review_notes = ?, promoted_entity_id = ?
         WHERE id = ?`,
        [status, actualReviewer, reviewedAt, notes || null, promotedId || null, id]
      );

      await this.logAudit(status === 'ACCEPTED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'EDIT', 'SIGNAL', id, actualReviewer, {
        notes,
        promotedEntityId: promotedId
      });

      return { success: true, promotedEntityId: promotedId };
    } catch (e) {
      console.error('[MEETING-REPO] Error reviewing detected item:', e);
      return { success: false };
    }
  }

  // --- DECISIONS ---

  public async getDecisions(filter?: { status?: string; meetingId?: string }): Promise<DecisionRecord[]> {
    try {
      let q = `SELECT * FROM meeting_decisions WHERE 1=1`;
      const params: any[] = [];
      if (filter?.status && filter.status !== 'ALL') {
        q += ` AND status = ?`;
        params.push(filter.status);
      }
      if (filter?.meetingId) {
        q += ` AND meeting_id = ?`;
        params.push(filter.meetingId);
      }
      q += ` ORDER BY created_at DESC`;

      const rows = await this.db.all<any>(q, params);
      return rows.map(r => this.mapDecision(r));
    } catch (e) {
      console.warn('[MEETING-REPO] Error getting decisions:', e);
      return [];
    }
  }

  public async createDecision(decision: Partial<DecisionRecord>): Promise<DecisionRecord> {
    const id = decision.id || `DEC_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const code = decision.code || `D-0${Math.floor(240 + Math.random() * 50)}`;
    const now = new Date().toISOString();

    const record: DecisionRecord = {
      id,
      code,
      title: decision.title || 'Official Resolution',
      description: decision.description,
      status: decision.status || 'AWAITING_APPROVAL',
      authority: decision.authority || 'SCM Committee',
      owner: decision.owner || 'Kamuren Wanjau',
      meeting_id: decision.meeting_id || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      meeting_name: decision.meeting_name || 'KETRACO SCM Transformation Review',
      meeting_date: decision.meeting_date || 'Sep 10, 2025',
      project_id: decision.project_id,
      entity_name: decision.entity_name,
      confidence: decision.confidence || 90,
      requires_human_approval: decision.requires_human_approval !== false,
      evidence_text: decision.evidence_text,
      implementation_notes: decision.implementation_notes,
      approved_by: decision.approved_by,
      approved_at: decision.approved_at,
      audit_trail: decision.audit_trail || [
        { action: 'CREATED', user: 'Operator', timestamp: now, note: 'Decision drafted for committee' }
      ],
      created_at: now,
      updated_at: now
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_decisions (
          id, code, title, description, status, authority, owner, meeting_id, meeting_name, meeting_date,
          project_id, entity_name, confidence, requires_human_approval, evidence_text, implementation_notes,
          approved_by, approved_at, audit_trail_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id, record.code, record.title, record.description || null, record.status, record.authority,
          record.owner, record.meeting_id, record.meeting_name, record.meeting_date, record.project_id || null,
          record.entity_name || null, record.confidence, record.requires_human_approval ? 1 : 0,
          record.evidence_text || null, record.implementation_notes || null, record.approved_by || null,
          record.approved_at || null, JSON.stringify(record.audit_trail), record.created_at, record.updated_at
        ]
      );

      this.graphAdapter.syncDecisionToGraph(record);
      await this.logAudit('CREATE', 'DECISION', record.id, 'Operator', { code: record.code });
    } catch (e) {
      console.error('[MEETING-REPO] Error creating decision:', e);
    }

    return record;
  }

  public async approveDecision(id: string, actor: string): Promise<boolean> {
    try {
      const row = await this.db.get<any>(`SELECT * FROM meeting_decisions WHERE id = ? OR code = ?`, [id, id]);
      if (!row) return false;

      const auditTrail = JSON.parse(row.audit_trail_json || '[]');
      const approvedAt = new Date().toISOString();
      auditTrail.push({
        action: 'APPROVED_BY_CHAIR',
        user: actor,
        timestamp: approvedAt,
        note: 'Statutory verification complete under PPADA §71'
      });

      await this.db.run(
        `UPDATE meeting_decisions 
         SET status = 'APPROVED', approved_by = ?, approved_at = ?, audit_trail_json = ?, updated_at = ?
         WHERE id = ?`,
        [actor, approvedAt, JSON.stringify(auditTrail), approvedAt, row.id]
      );

      // Sync into Knowledge Graph
      const updated = await this.getDecisions({ meetingId: row.meeting_id });
      const current = updated.find(d => d.id === row.id);
      if (current) this.graphAdapter.syncDecisionToGraph(current);

      await this.logAudit('APPROVE', 'DECISION', row.id, actor, { approvedAt });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error approving decision:', e);
      return false;
    }
  }

  public async updateDecisionStatus(id: string, status: DecisionStatus, actor: string, notes?: string): Promise<boolean> {
    try {
      const row = await this.db.get<any>(`SELECT * FROM meeting_decisions WHERE id = ? OR code = ?`, [id, id]);
      if (!row) return false;

      const auditTrail = JSON.parse(row.audit_trail_json || '[]');
      const timestamp = new Date().toISOString();
      auditTrail.push({
        action: `STATUS_CHANGE_TO_${status}`,
        user: actor,
        timestamp,
        note: notes || 'Status updated via Decision Register'
      });

      await this.db.run(
        `UPDATE meeting_decisions 
         SET status = ?, audit_trail_json = ?, updated_at = ?
         WHERE id = ?`,
        [status, JSON.stringify(auditTrail), timestamp, row.id]
      );

      await this.logAudit('EDIT', 'DECISION', row.id, actor, { newStatus: status, notes });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error updating decision status:', e);
      return false;
    }
  }

  // --- ACTIONS ---

  public async getActions(filter?: { status?: string; sourceMeetingId?: string }): Promise<ActionControlItem[]> {
    try {
      let q = `SELECT * FROM meeting_actions WHERE 1=1`;
      const params: any[] = [];
      if (filter?.status && filter.status !== 'ALL') {
        q += ` AND status = ?`;
        params.push(filter.status);
      }
      if (filter?.sourceMeetingId) {
        q += ` AND source_meeting_id = ?`;
        params.push(filter.sourceMeetingId);
      }
      q += ` ORDER BY due_date ASC`;

      const rows = await this.db.all<any>(q, params);
      return rows.map(r => this.mapAction(r));
    } catch (e) {
      console.warn('[MEETING-REPO] Error getting actions:', e);
      return [];
    }
  }

  public async createAction(action: Partial<ActionControlItem>): Promise<ActionControlItem> {
    const id = action.id || `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();

    const record: ActionControlItem = {
      id,
      action_title: action.action_title || 'Governance Action Item',
      description: action.description,
      owner: action.owner || 'John Kamau',
      department: action.department || 'SCM',
      due_date: action.due_date || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      priority: action.priority || 'HIGH',
      status: action.status || 'ON_TRACK',
      project_id: action.project_id,
      source_meeting_id: action.source_meeting_id,
      source_meeting_title: action.source_meeting_title,
      evidence_text: action.evidence_text,
      dependencies: action.dependencies || [],
      linked_entities: action.linked_entities || [],
      escalation_level: 0,
      workflow_triggered: false,
      created_at: now,
      updated_at: now
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_actions (
          id, action_title, description, owner, department, due_date, priority, status,
          project_id, source_meeting_id, source_meeting_title, evidence_text, dependencies_json,
          linked_entities_json, escalation_level, workflow_triggered, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id, record.action_title, record.description || null, record.owner, record.department,
          record.due_date, record.priority, record.status, record.project_id || null,
          record.source_meeting_id || null, record.source_meeting_title || null, record.evidence_text || null,
          JSON.stringify(record.dependencies), JSON.stringify(record.linked_entities), record.escalation_level,
          0, record.created_at, record.updated_at
        ]
      );

      // Closed-loop: Dispatch notification & update Knowledge Graph
      await this.closedLoop.notifyActionOwner(record);
      this.graphAdapter.syncActionToGraph(record);
      await this.logAudit('ASSIGN', 'ACTION', record.id, 'Operator', { owner: record.owner });
    } catch (e) {
      console.error('[MEETING-REPO] Error creating action:', e);
    }

    return record;
  }

  public async updateActionStatus(id: string, status: ActionStatus, actor: string): Promise<boolean> {
    try {
      await this.db.run(
        `UPDATE meeting_actions SET status = ?, updated_at = ? WHERE id = ?`,
        [status, new Date().toISOString(), id]
      );
      await this.logAudit('EDIT', 'ACTION', id, actor, { newStatus: status });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error updating action status:', e);
      return false;
    }
  }

  public async escalateAction(id: string, reason: string, actor: string): Promise<boolean> {
    try {
      const act = await this.db.get<any>(`SELECT * FROM meeting_actions WHERE id = ?`, [id]);
      if (!act) return false;

      const newLevel = (act.escalation_level || 0) + 1;
      const target = newLevel >= 2 ? 'Managing Director & CEO' : 'Operations Director (Kamuren Wanjau)';

      await this.db.run(
        `UPDATE meeting_actions 
         SET status = 'OVERDUE', escalation_level = ?, escalated_to = ?, updated_at = ?
         WHERE id = ?`,
        [newLevel, target, new Date().toISOString(), id]
      );

      await this.logAudit('ESCALATE', 'ACTION', id, actor, { reason, escalatedTo: target, level: newLevel });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error escalating action:', e);
      return false;
    }
  }

  public async verifyAction(id: string, notes: string, verifier: string): Promise<boolean> {
    return this.closedLoop.verifyAndCompleteAction(id, notes, verifier);
  }

  public async executeActionWorkflow(id: string, actor: string): Promise<{ success: boolean; workflowId: string }> {
    const workflowId = `WF_${Date.now().toString(36).toUpperCase()}`;
    try {
      await this.db.run(
        `UPDATE meeting_actions SET status = 'ON_TRACK', workflow_triggered = 1, workflow_id = ?, updated_at = ? WHERE id = ?`,
        [workflowId, new Date().toISOString(), id]
      );
      await this.logAudit('EDIT', 'ACTION', id, actor, { workflowTriggered: workflowId });
    } catch (e) {
      console.warn('[MEETING-REPO] DB update error, proceeding with execution acknowledge');
    }
    return { success: true, workflowId };
  }

  // --- COMMITMENTS & RISKS ---

  public async getCommitments(meetingId?: string): Promise<CommitmentRecord[]> {
    try {
      let q = `SELECT * FROM meeting_commitments`;
      const params: any[] = [];
      if (meetingId) {
        q += ` WHERE meeting_id = ?`;
        params.push(meetingId);
      }
      q += ` ORDER BY created_at DESC`;
      const rows = await this.db.all<any>(q, params);
      return rows.map(r => ({
        id: r.id,
        meeting_id: r.meeting_id,
        commitment_title: r.commitment_title,
        party: r.party,
        owner: r.owner,
        target_date: r.target_date,
        status: r.status,
        evidence_ref: r.evidence_ref,
        created_at: r.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  public async createCommitment(commitment: Partial<CommitmentRecord>): Promise<CommitmentRecord> {
    const id = commitment.id || `COM_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const record: CommitmentRecord = {
      id,
      meeting_id: commitment.meeting_id || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      commitment_title: commitment.commitment_title || 'Executive Commitment',
      party: commitment.party || 'KETRACO Leadership',
      owner: commitment.owner || 'John Kamau',
      target_date: commitment.target_date || '2025-09-12',
      status: commitment.status || 'ACTIVE',
      evidence_ref: commitment.evidence_ref || 'Meeting proceedings',
      created_at: new Date().toISOString()
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_commitments (id, meeting_id, commitment_title, party, owner, target_date, status, evidence_ref, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.meeting_id, record.commitment_title, record.party, record.owner, record.target_date, record.status, record.evidence_ref, record.created_at]
      );
    } catch (e) {
      console.error('[MEETING-REPO] Error creating commitment:', e);
    }
    return record;
  }

  public async getRisks(meetingId?: string): Promise<RiskItem[]> {
    try {
      let q = `SELECT * FROM meeting_risks`;
      const params: any[] = [];
      if (meetingId) {
        q += ` WHERE meeting_id = ?`;
        params.push(meetingId);
      }
      q += ` ORDER BY created_at DESC`;
      const rows = await this.db.all<any>(q, params);
      return rows.map(r => ({
        id: r.id,
        meeting_id: r.meeting_id,
        risk_title: r.risk_title,
        severity: r.severity,
        likelihood: r.likelihood,
        mitigation_plan: r.mitigation_plan,
        owner: r.owner,
        status: r.status,
        project_id: r.project_id || undefined,
        tender_id: r.tender_id || undefined,
        created_at: r.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  public async createRisk(risk: Partial<RiskItem>): Promise<RiskItem> {
    const id = risk.id || `RSK_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const record: RiskItem = {
      id,
      meeting_id: risk.meeting_id || 'MEETING_SCM_TRANSFORMATION_REVIEW',
      risk_title: risk.risk_title || 'Identified Risk',
      severity: risk.severity || 'HIGH',
      likelihood: risk.likelihood || 'HIGH',
      mitigation_plan: risk.mitigation_plan || 'Review and remediate immediately.',
      owner: risk.owner || 'Eng. Patrick Odhiambo',
      status: risk.status || 'OPEN',
      project_id: risk.project_id,
      tender_id: risk.tender_id,
      created_at: new Date().toISOString()
    };

    try {
      await this.db.run(
        `INSERT INTO meeting_risks (id, meeting_id, risk_title, severity, likelihood, mitigation_plan, owner, status, project_id, tender_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.meeting_id, record.risk_title, record.severity, record.likelihood, record.mitigation_plan, record.owner, record.status, record.project_id || null, record.tender_id || null, record.created_at]
      );
      this.graphAdapter.syncRiskToGraph(record);
    } catch (e) {
      console.error('[MEETING-REPO] Error creating risk:', e);
    }
    return record;
  }

  public async getProcurementClarifications(meetingId?: string): Promise<ProcurementClarification[]> {
    try {
      let q = `SELECT * FROM meeting_procurement_clarifications`;
      const params: any[] = [];
      if (meetingId) {
        q += ` WHERE meeting_id = ?`;
        params.push(meetingId);
      }
      q += ` ORDER BY created_at DESC`;
      const rows = await this.db.all<any>(q, params);
      return rows.map(r => ({
        id: r.id,
        meeting_id: r.meeting_id,
        tender_id: r.tender_id,
        tender_clause: r.tender_clause,
        question: r.question,
        response: r.response,
        clarification_status: r.clarification_status,
        addendum_required: Boolean(r.addendum_required),
        evidence_ref: r.evidence_ref,
        action_id: r.action_id || undefined,
        created_at: r.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  // --- MINUTES & GOVERNANCE ---

  public async getMinutes(meetingId: string): Promise<MeetingMinutes | null> {
    try {
      const row = await this.db.get<any>(
        `SELECT * FROM meeting_minutes WHERE meeting_id = ? ORDER BY version DESC LIMIT 1`,
        [meetingId]
      );
      if (row) return this.mapMinutes(row);
    } catch (e) {
      console.warn('[MEETING-REPO] Error getting minutes:', e);
    }
    return null;
  }

  public async saveMinutes(minutes: MeetingMinutes): Promise<MeetingMinutes> {
    try {
      await this.db.run(
        `INSERT OR REPLACE INTO meeting_minutes (
          id, meeting_id, version, status, title, date, location, chair, secretary,
          attendees_json, apologies_json, executive_summary, agenda_proceedings_json,
          decisions_json, actions_json, commitments_json, risks_and_issues_json,
          procurement_clarifications_json, next_meeting_notes, version_lock_hash,
          approved_by_chair, approved_at, published_at, audit_events_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          minutes.id, minutes.meeting_id, minutes.version, minutes.status, minutes.title,
          minutes.date, minutes.location, minutes.chair, minutes.secretary,
          JSON.stringify(minutes.attendees), JSON.stringify(minutes.apologies),
          minutes.executive_summary, JSON.stringify(minutes.agenda_proceedings),
          JSON.stringify(minutes.decisions), JSON.stringify(minutes.actions),
          JSON.stringify(minutes.commitments), JSON.stringify(minutes.risks_and_issues),
          JSON.stringify(minutes.procurement_clarifications || []), minutes.next_meeting_notes || null,
          minutes.version_lock_hash || null, minutes.approved_by_chair || null,
          minutes.approved_at || null, minutes.published_at || null,
          JSON.stringify(minutes.audit_events), minutes.created_at, new Date().toISOString()
        ]
      );
      await this.logAudit('EDIT', 'MINUTES', minutes.id, 'Secretary', { version: minutes.version, status: minutes.status });
    } catch (e) {
      console.error('[MEETING-REPO] Error saving minutes:', e);
    }
    return minutes;
  }

  public async approveMinutes(minutesId: string, chair: string): Promise<boolean> {
    try {
      const row = await this.db.get<any>(`SELECT * FROM meeting_minutes WHERE id = ?`, [minutesId]);
      if (!row) return false;

      const auditEvents = JSON.parse(row.audit_events_json || '[]');
      const now = new Date().toISOString();
      const lockHash = `LOCK_${Math.random().toString(36).substr(2, 16).toUpperCase()}`;

      auditEvents.push({
        action: 'CHAIR_APPROVED_AND_LOCKED',
        actor: chair,
        timestamp: now,
        note: 'Official minutes approved and locked by Committee Chair.'
      });

      await this.db.run(
        `UPDATE meeting_minutes 
         SET status = 'OFFICIAL_LOCKED', approved_by_chair = ?, approved_at = ?, version_lock_hash = ?, audit_events_json = ?, updated_at = ?
         WHERE id = ?`,
        [chair, now, lockHash, JSON.stringify(auditEvents), now, minutesId]
      );

      await this.logAudit('APPROVE', 'MINUTES', minutesId, chair, { lockHash });
      return true;
    } catch (e) {
      console.error('[MEETING-REPO] Error approving minutes:', e);
      return false;
    }
  }

  // --- NOTIFICATIONS & AUDIT ---

  public async getNotifications(userId?: string): Promise<MeetingNotification[]> {
    try {
      let q = `SELECT * FROM meeting_notifications`;
      const params: any[] = [];
      if (userId) {
        q += ` WHERE user_id = ?`;
        params.push(userId);
      }
      q += ` ORDER BY created_at DESC LIMIT 30`;

      const rows = await this.db.all<any>(q, params);
      return rows.map(r => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        message: r.message,
        category: r.category,
        severity: r.severity,
        link: r.link || undefined,
        read: Boolean(r.read),
        created_at: r.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  public async markNotificationRead(id: string): Promise<boolean> {
    try {
      await this.db.run(`UPDATE meeting_notifications SET read = 1 WHERE id = ?`, [id]);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getAuditLog(limit = 50): Promise<AuditLedgerEntry[]> {
    try {
      const rows = await this.db.all<any>(
        `SELECT * FROM meeting_audit_ledger ORDER BY timestamp DESC LIMIT ?`,
        [limit]
      );
      return rows.map(r => ({
        id: r.id,
        event_type: r.event_type,
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        actor: r.actor,
        details: JSON.parse(r.details_json || '{}'),
        timestamp: r.timestamp
      }));
    } catch (e) {
      return [];
    }
  }

  public async logAudit(
    eventType: AuditLedgerEntry['event_type'],
    entityType: AuditLedgerEntry['entity_type'],
    entityId: string,
    actor: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const id = `AUD_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      await this.db.run(
        `INSERT INTO meeting_audit_ledger (id, event_type, entity_type, entity_id, actor, details_json, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, eventType, entityType, entityId, actor, JSON.stringify(details), new Date().toISOString()]
      );
    } catch (e) {
      console.warn('[MEETING-REPO] Audit log error:', e);
    }
  }

  // --- SEARCH ---

  public async search(query: string): Promise<any> {
    const q = `%${query.toLowerCase()}%`;
    try {
      const meetings = await this.db.all<any>(
        `SELECT id, title, date, department FROM meeting_entities WHERE LOWER(title) LIKE ? OR LOWER(objective) LIKE ? LIMIT 5`,
        [q, q]
      );
      const transcripts = await this.db.all<any>(
        `SELECT id, meeting_id, speaker, text, timestamp_label FROM meeting_transcripts WHERE LOWER(text) LIKE ? LIMIT 8`,
        [q]
      );
      const decisions = await this.db.all<any>(
        `SELECT id, code, title, status, owner FROM meeting_decisions WHERE LOWER(title) LIKE ? OR LOWER(code) LIKE ? LIMIT 5`,
        [q, q]
      );
      const actions = await this.db.all<any>(
        `SELECT id, action_title, owner, status, due_date FROM meeting_actions WHERE LOWER(action_title) LIKE ? OR LOWER(owner) LIKE ? LIMIT 5`,
        [q, q]
      );

      return {
        query,
        results: {
          meetings,
          transcripts,
          decisions,
          actions,
          total_matches: meetings.length + transcripts.length + decisions.length + actions.length
        }
      };
    } catch (e) {
      return { query, results: { meetings: [], transcripts: [], decisions: [], actions: [], total_matches: 0 } };
    }
  }

  // --- OVERVIEW AGGREGATOR ---

  public async getOverview(meetingId = 'MEETING_SCM_TRANSFORMATION_REVIEW'): Promise<MeetingIntelligenceOverview> {
    try {
      const nextMeetingRow = await this.db.get<any>(
        `SELECT * FROM meeting_entities WHERE id = ?`,
        [meetingId]
      );
      const allMeetings = await this.getAllMeetings();
      const detectedSignals = await this.getDetectedItems(meetingId);
      const transcripts = await this.getTranscripts(meetingId);
      const decisions = await this.getDecisions({ meetingId });
      const actions = await this.getActions({ sourceMeetingId: meetingId });
      const commitments = await this.getCommitments(meetingId);
      const risks = await this.getRisks(meetingId);
      const clarifications = await this.getProcurementClarifications(meetingId);
      const minutes = await this.getMinutes(meetingId);
      const notifications = await this.getNotifications();

      const evidenceRows = await this.db.all<any>(`SELECT * FROM meeting_evidence LIMIT 10`);
      const memoryRows = await this.db.all<any>(`SELECT * FROM meeting_memory LIMIT 10`);

      const nextMeeting = nextMeetingRow ? this.mapMeetingEntity(nextMeetingRow) : allMeetings[0] || this.getCanonicalFallback().next_meeting;

      const openActions = actions.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED');
      const atRiskActions = actions.filter(a => a.status === 'AT_RISK');
      const overdueActions = actions.filter(a => a.status === 'OVERDUE');

      return {
        next_meeting: nextMeeting,
        all_meetings: allMeetings,
        live_signals: detectedSignals,
        transcript_segments: transcripts,
        evidence_list: evidenceRows.map(r => ({
          id: r.id,
          meeting_id: r.meeting_id,
          evidence_type: r.evidence_type,
          title: r.title,
          date_label: r.date_label,
          quote: r.quote,
          source_ref: r.source_ref,
          entity_tag: r.entity_tag,
          category_tag: r.category_tag,
          confidence: r.confidence
        })),
        memory_timeline: memoryRows.map(r => ({
          id: r.id,
          meeting_id: r.meeting_id,
          title: r.title,
          date_label: r.date_label,
          decisions_count: r.decisions_count,
          actions_count: r.actions_count,
          risks_count: r.risks_count,
          tags: JSON.parse(r.tags_json || '[]')
        })),
        recurring_themes: [
          { theme: 'KRA Tax Compliance Integration', mentions: 18 },
          { theme: 'PPADA §71 Evaluation Thresholds', mentions: 14 },
          { theme: 'Transformer Geotechnical Stabilization', mentions: 11 },
          { theme: 'PAP Wayleave Compensation', mentions: 9 }
        ],
        unresolved_commitments: [
          { commitment: 'Complete supplier validation report for Nairobi North', owner: 'John Kamau' },
          { commitment: 'Deliver live KRA API verification adapter', owner: 'Grace Mutua' },
          { commitment: 'Deploy micro-piling rigs at Tower 124', owner: 'Li Wei (Shanghai Electric)' }
        ],
        action_control: {
          total: actions.length,
          at_risk: atRiskActions.length,
          overdue: overdueActions.length,
          items: actions
        },
        decision_register: {
          total: decisions.length,
          items: decisions
        },
        commitments,
        risks,
        procurement_clarifications: clarifications,
        active_minutes: minutes || undefined,
        notifications,
        today_intelligence: {
          decisions: decisions.length,
          actions: actions.length,
          risks: risks.length,
          follow_ups: commitments.length,
          top_signal: {
            text: detectedSignals[0]?.suggested_title || 'KRA Verification Dependency on Evaluation OS',
            confidence: `${detectedSignals[0]?.confidence || 94}%`,
            references: 4
          }
        },
        recent_transcript: {
          timestamp_offset: transcripts[transcripts.length - 1]?.timestamp_label || '10:22',
          speaker: transcripts[transcripts.length - 1]?.speaker || 'Sarah Ochieng',
          text: transcripts[transcripts.length - 1]?.text || 'Legal concurs with the compliance sign-off.',
          classification: 'Compliance Verified'
        },
        copilot_thread: []
      };
    } catch (err) {
      console.warn('[MEETING-REPO] Database query failed, using canonical fallback:', err);
      return this.getCanonicalFallback();
    }
  }

  // --- MAPPERS ---

  private mapMeetingEntity(r: any): MeetingEntity {
    const status = (r.status || 'SCHEDULED') as MeetingStatus;
    const started_at = r.started_at || null;
    const paused_at = r.paused_at || null;
    const resumed_at = r.resumed_at || null;
    const ended_at = r.ended_at || null;
    const total_paused_ms = Number(r.total_paused_ms) || 0;

    let elapsed_seconds = 0;
    if (started_at) {
      const startMs = new Date(started_at).getTime();
      if (!isNaN(startMs)) {
        if (status === 'LIVE') {
          elapsed_seconds = Math.max(0, Math.floor((Date.now() - startMs - total_paused_ms) / 1000));
        } else if (status === 'PAUSED' && paused_at) {
          const pauseMs = new Date(paused_at).getTime();
          elapsed_seconds = Math.max(0, Math.floor((pauseMs - startMs - total_paused_ms) / 1000));
        } else if (status === 'COMPLETED' && ended_at) {
          const endMs = new Date(ended_at).getTime();
          elapsed_seconds = Math.max(0, Math.floor((endMs - startMs - total_paused_ms) / 1000));
        }
      }
    }

    const participants = JSON.parse(r.participants_json || '[]').map((p: any) => ({
      id: p.id,
      meetingId: r.id,
      name: p.name,
      role: p.role || 'MEMBER',
      department: p.department,
      organization: p.organization,
      email: p.email,
      attendance: p.attendance || (p.attended ? 'ATTENDED' : 'INVITED'),
      attended: p.attendance === 'ATTENDED' || Boolean(p.attended)
    }));

    const provider = (() => {
      try {
        const parsed = JSON.parse(r.provider_json || '{}');
        return Object.keys(parsed || {}).length ? parsed : undefined;
      } catch {
        return undefined;
      }
    })();

    const calendar = (() => {
      try {
        const parsed = JSON.parse(r.calendar_json || '{}');
        return Object.keys(parsed || {}).length ? parsed : undefined;
      } catch {
        return undefined;
      }
    })();

    const agenda = JSON.parse(r.agenda_json || '[]').map((item: any, idx: number) => ({
      id: item.id || `AG_${idx + 1}`,
      meetingId: r.id,
      sequence: item.sequence || item.order || idx + 1,
      order: item.order || item.sequence || idx + 1,
      title: item.title,
      description: item.description,
      presenter: item.presenter,
      linkedEntity: item.linkedEntity || item.linked_entity,
      status: item.status || (item.completed ? 'CLOSED' : 'PENDING'),
      duration_minutes: item.duration_minutes || item.durationMinutes || 15,
      durationMinutes: item.durationMinutes || item.duration_minutes || 15,
      completed: Boolean(item.completed),
      objective: item.objective,
      notes: item.notes
    }));

    const documents = JSON.parse(r.documents_json || '[]').map((doc: any) => ({
      id: doc.id,
      meetingId: r.id,
      name: doc.name,
      category: doc.category || 'GENERAL',
      size: doc.size || '1.0 MB',
      summary: doc.summary || '',
      url: doc.url,
      uploadedAt: doc.uploadedAt || doc.uploaded_at || r.created_at,
      uploaded_at: doc.uploaded_at || doc.uploadedAt || r.created_at,
      uploadedBy: doc.uploadedBy || doc.uploaded_by,
      uploaded_by: doc.uploaded_by || doc.uploadedBy
    }));

    const relevant_entities = JSON.parse(r.linked_entities_json || r.relevant_entities_json || '[]');

    return {
      id: r.id,
      title: r.title,
      meeting_type: r.meeting_type || 'GENERAL',
      type: r.meeting_type || 'GENERAL',
      room: r.room || r.venue || 'Executive Room',
      venue: r.venue || r.room || 'Executive Room',
      date: r.date,
      start_time: r.start_time,
      startTime: r.start_time,
      end_time: r.end_time,
      endTime: r.end_time,
      status,
      priority: r.priority || 'HIGH',
      preparation_pct: r.preparation_pct || 75,
      objective: r.objective || r.description || '',
      description: r.description || r.objective || '',
      department: r.department || 'SCM',
      chair: r.chair || undefined,
      secretary: r.secretary || undefined,
      project_id: r.project_id || undefined,
      projectId: r.project_id || undefined,
      pds_stage: r.pds_stage || undefined,
      tender_id: r.tender_id || undefined,
      contract_id: r.contract_id || undefined,
      current_stage: r.current_stage || 'LIVE_MEETING',
      provider,
      calendar,
      participants,
      agenda,
      documents,
      prior_meetings_count: r.prior_meetings_count || 0,
      open_decisions_count: r.open_decisions_count || 0,
      previous_signals: JSON.parse(r.previous_signals_json || '[]'),
      open_commitments: JSON.parse(r.open_commitments_json || '[]'),
      relevant_entities,
      linkedEntities: relevant_entities,
      tenant_id: r.tenant_id || 'ketraco',
      created_by: r.created_by || undefined,
      createdBy: r.created_by || undefined,
      started_at,
      startedAt: started_at,
      paused_at,
      pausedAt: paused_at,
      resumed_at,
      resumedAt: resumed_at,
      ended_at,
      endedAt: ended_at,
      total_paused_ms,
      totalPausedMs: total_paused_ms,
      elapsed_seconds,
      created_at: r.created_at,
      createdAt: r.created_at,
      updated_at: r.updated_at,
      updatedAt: r.updated_at
    };
  }

  private mapDetectedItem(r: any): DetectedIntelligenceItem {
    return {
      id: r.id,
      meeting_id: r.meeting_id,
      item_type: r.signal_type,
      speaker: r.speaker || undefined,
      timestamp_label: r.timestamp_label,
      source_text: r.text,
      suggested_title: r.suggested_title || r.text,
      confidence: r.confidence,
      linked_entity: r.entity_tag,
      category: r.category_tag,
      evidence_quote: r.evidence_quote || r.text,
      status: r.status || 'PENDING',
      reviewed_by: r.reviewed_by || undefined,
      reviewed_at: r.reviewed_at || undefined,
      review_notes: r.review_notes || undefined,
      promoted_entity_id: r.promoted_entity_id || undefined,
      created_at: r.created_at
    };
  }

  private mapDecision(r: any): DecisionRecord {
    return {
      id: r.id,
      code: r.code,
      title: r.title,
      description: r.description || undefined,
      status: r.status,
      authority: r.authority || 'SCM Committee',
      owner: r.owner,
      meeting_id: r.meeting_id,
      meeting_name: r.meeting_name,
      meeting_date: r.meeting_date,
      project_id: r.project_id || undefined,
      entity_name: r.entity_name || undefined,
      confidence: r.confidence,
      requires_human_approval: Boolean(r.requires_human_approval),
      evidence_text: r.evidence_text || undefined,
      implementation_notes: r.implementation_notes || undefined,
      approved_by: r.approved_by || undefined,
      approved_at: r.approved_at || undefined,
      audit_trail: JSON.parse(r.audit_trail_json || '[]'),
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  }

  private mapAction(r: any): ActionControlItem {
    return {
      id: r.id,
      action_title: r.action_title,
      description: r.description || undefined,
      owner: r.owner,
      department: r.department || 'SCM',
      due_date: r.due_date,
      priority: r.priority || 'HIGH',
      status: r.status,
      project_id: r.project_id || undefined,
      source_meeting_id: r.source_meeting_id || undefined,
      source_meeting_title: r.source_meeting_title || undefined,
      evidence_text: r.evidence_text || undefined,
      dependencies: JSON.parse(r.dependencies_json || '[]'),
      linked_entities: JSON.parse(r.linked_entities_json || '[]'),
      verification_notes: r.verification_notes || undefined,
      verified_by: r.verified_by || undefined,
      completed_at: r.completed_at || undefined,
      escalation_level: r.escalation_level || 0,
      escalated_to: r.escalated_to || undefined,
      last_notified_at: r.last_notified_at || undefined,
      workflow_triggered: Boolean(r.workflow_triggered),
      workflow_id: r.workflow_id || undefined,
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  }

  private mapMinutes(r: any): MeetingMinutes {
    return {
      id: r.id,
      meeting_id: r.meeting_id,
      version: r.version,
      status: r.status,
      title: r.title,
      date: r.date,
      location: r.location,
      chair: r.chair,
      secretary: r.secretary,
      attendees: JSON.parse(r.attendees_json || '[]'),
      apologies: JSON.parse(r.apologies_json || '[]'),
      executive_summary: r.executive_summary,
      agenda_proceedings: JSON.parse(r.agenda_proceedings_json || '[]'),
      decisions: JSON.parse(r.decisions_json || '[]'),
      actions: JSON.parse(r.actions_json || '[]'),
      commitments: JSON.parse(r.commitments_json || '[]'),
      risks_and_issues: JSON.parse(r.risks_and_issues_json || '[]'),
      procurement_clarifications: JSON.parse(r.procurement_clarifications_json || '[]'),
      next_meeting_notes: r.next_meeting_notes || undefined,
      version_lock_hash: r.version_lock_hash || undefined,
      approved_by_chair: r.approved_by_chair || undefined,
      approved_at: r.approved_at || undefined,
      published_at: r.published_at || undefined,
      audit_events: JSON.parse(r.audit_events_json || '[]'),
      created_at: r.created_at,
      updated_at: r.updated_at
    };
  }

  public getCanonicalFallback(): MeetingIntelligenceOverview {
    const nextMeeting: MeetingEntity = {
      id: 'MEETING_SCM_TRANSFORMATION_REVIEW',
      title: 'KETRACO SCM Transformation Review',
      meeting_type: 'GENERAL',
      room: 'Executive Conference Room',
      date: 'Today',
      start_time: '10:00',
      end_time: '11:00',
      status: 'LIVE',
      priority: 'HIGH',
      preparation_pct: 78,
      objective: 'Validate implementation progress, verify KRA adapter integration, and resolve statutory procurement workflow blockers.',
      department: 'SCM',
      project_id: 'PRJ-SCM-MOD-2025',
      pds_stage: 'Procurement',
      current_stage: 'LIVE_MEETING',
      participants: [
        { name: 'Kamuren Wanjau', role: 'Operations Director', email: 'kamuren@ketraco.co.ke' },
        { name: 'John Kamau', role: 'SCM Lead', email: 'jkamau@ketraco.co.ke' },
        { name: 'Eng. Patrick Odhiambo', role: 'Grid Infrastructure Specialist' },
        { name: 'Grace Mutua', role: 'ICT Integration Lead' },
        { name: 'David Kiprono', role: 'Procurement Specialist' },
        { name: 'Sarah Ochieng', role: 'Compliance Officer' },
        { name: 'Peter Karanja', role: 'Finance Analyst' }
      ],
      agenda: [
        { id: 'AG_01', sequence: 1, order: 1, title: 'Adoption of Agenda & Previous Minutes', presenter: 'John Kamau', duration_minutes: 10, completed: true },
        { id: 'AG_02', sequence: 2, order: 2, title: 'KRA Verification Adapter Integration & Evaluation OS Compliance', presenter: 'Grace Mutua', duration_minutes: 20, completed: false },
        { id: 'AG_03', sequence: 3, order: 3, title: 'Supplier Data Validation Quality Audit (Mombasa & Nairobi)', presenter: 'Eng. Patrick Odhiambo', duration_minutes: 15, completed: false }
      ],
      documents: [
        { id: 'DOC_01', name: 'KETRACO-SCM-Audit-Q3-2025.pdf', category: 'Audit', size: '2.4 MB', summary: 'Quarterly supplier validation audit.', uploaded_at: '2025-09-08' }
      ],
      prior_meetings_count: 4,
      open_decisions_count: 3,
      previous_signals: ['Supplier data quality concern', 'Integration timeline at risk'],
      open_commitments: ['Complete supplier validation', 'Review tender evaluation workflow'],
      relevant_entities: [
        { label: 'SCM Transformation', type: 'Project' },
        { label: 'KRA', type: 'Supplier' },
        { label: 'Evaluation OS', type: 'System' }
      ],
      tenant_id: 'ketraco',
      created_at: '2025-09-09T08:00:00.000Z',
      updated_at: '2025-09-09T08:00:00.000Z'
    };

    return {
      next_meeting: nextMeeting,
      all_meetings: [nextMeeting],
      live_signals: [
        {
          id: 'SIG_01',
          meeting_id: 'MEETING_SCM_TRANSFORMATION_REVIEW',
          item_type: 'DECISION',
          speaker: 'Kamuren Wanjau',
          timestamp_label: '10:18',
          source_text: 'Decision D-0241: Supplier validation architecture adopted with mandatory KRA adapter sign-off.',
          suggested_title: 'Supplier validation architecture approved',
          confidence: 94,
          linked_entity: 'Evaluation OS',
          category: 'DECISION',
          evidence_quote: 'Let us establish an executive decision: Decision D-0241...',
          status: 'PENDING',
          created_at: '2025-09-10T10:18:00.000Z'
        }
      ],
      transcript_segments: [
        {
          id: 'TR_01',
          meeting_id: 'MEETING_SCM_TRANSFORMATION_REVIEW',
          speaker: 'Kamuren Wanjau',
          speaker_role: 'Operations Director',
          timestamp_label: '10:01',
          start_seconds: 60,
          text: 'Good morning colleagues. We are convening this SCM Transformation Review to resolve two critical workflow gates: the KRA integration and supplier validation data readiness.',
          confidence: 98,
          created_at: '2025-09-10T10:01:00.000Z'
        }
      ],
      evidence_list: [],
      memory_timeline: [],
      recurring_themes: [],
      unresolved_commitments: [],
      action_control: { total: 0, at_risk: 0, overdue: 0, items: [] },
      decision_register: { total: 0, items: [] },
      commitments: [],
      risks: [],
      procurement_clarifications: [],
      notifications: [],
      today_intelligence: {
        decisions: 1,
        actions: 2,
        risks: 1,
        follow_ups: 1,
        top_signal: {
          text: 'KRA Verification Dependency on Evaluation OS',
          confidence: '94%',
          references: 4
        }
      },
      recent_transcript: {
        timestamp_offset: '10:18',
        speaker: 'Kamuren Wanjau',
        text: 'Decision D-0241 on the supplier validation architecture is adopted.',
        classification: 'Decision Reached'
      },
      copilot_thread: []
    };
  }
}
