/**
 * KETRACO MEETING INTELLIGENCE — REST API & SSE EVENT STREAM ROUTES
 * Complete enterprise API surface for meetings, transcripts, AI extraction,
 * human governance, decisions, actions, commitments, risks, minutes, reports, and search.
 */

import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { MeetingIntelligenceRepository } from './meeting-repository';
import { MeetingCopilotService } from './copilot-service';
import { AiMeetingService } from './ai-meeting-service';
import { MeetingGraphAdapter } from './graph-adapter';
import { ClosedLoopAutomationEngine } from './closed-loop-automation';

export function createMeetingIntelligenceApiRouter(): Router {
  const router = Router();
  const repo = new MeetingIntelligenceRepository();
  const copilot = MeetingCopilotService.getInstance();
  const aiService = AiMeetingService.getInstance();
  const graphAdapter = MeetingGraphAdapter.getInstance();
  const closedLoop = ClosedLoopAutomationEngine.getInstance();

  // Active SSE connections
  const sseClients: Response[] = [];

  const broadcastSse = (event: string, data: any) => {
    sseClients.forEach(client => {
      try {
        client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        // Ignored, client will be cleaned up
      }
    });
  };

  // --- SSE STREAM ---
  router.get('/live/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // --- OVERVIEW ---
  router.get('/overview', async (req: Request, res: Response) => {
    try {
      const meetingId = (req.query.meetingId as string) || 'MEETING_SCM_TRANSFORMATION_REVIEW';
      const overview = await repo.getOverview(meetingId);
      res.json(overview);
    } catch (err: any) {
      console.error('[API] /meeting-intelligence/overview error:', err);
      res.status(500).json({ error: 'Failed to retrieve overview', details: err?.message });
    }
  });

  // RBAC Permission Guard
  const checkRbac = (permission: string) => {
    return (req: Request, res: Response, next: any) => {
      const userRole = (req.headers['x-user-role'] as string) || (req.body?.userRole as string) || (req.query?.userRole as string) || 'CHAIR';
      const actor = (req.headers['x-user-name'] as string) || (req.headers['x-user-id'] as string) || req.body?.actor || 'Operator';

      const rolePermissions: Record<string, string[]> = {
        'admin': ['*'],
        'Administrator': ['*'],
        'CHAIR': ['VIEW', 'CREATE', 'EDIT', 'START', 'END', 'PAUSE', 'RESUME', 'MANAGE_PARTICIPANTS', 'MANAGE_AGENDA', 'ATTACH_DOCUMENTS', 'DELETE', 'ARCHIVE'],
        'SECRETARY': ['VIEW', 'CREATE', 'EDIT', 'START', 'END', 'PAUSE', 'RESUME', 'MANAGE_PARTICIPANTS', 'MANAGE_AGENDA', 'ATTACH_DOCUMENTS', 'ARCHIVE'],
        'MEMBER': ['VIEW', 'ATTACH_DOCUMENTS'],
        'PRESENTER': ['VIEW', 'ATTACH_DOCUMENTS'],
        'OBSERVER': ['VIEW'],
        'GUEST': ['VIEW']
      };

      const allowed = (rolePermissions[userRole] || ['*']).includes('*') || (rolePermissions[userRole] || []).includes(permission);
      if (!allowed) {
        repo.logAudit('AUTH_FAILURE', 'MEETING', req.params.id || 'N/A', actor, {
          requiredPermission: permission,
          userRole,
          path: req.originalUrl
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: `Role "${userRole}" lacks permission "${permission}".`,
          requiredPermission: permission,
          userRole
        });
      }

      req.body = req.body || {};
      if (!req.body.actor) req.body.actor = actor;
      next();
    };
  };

  // --- MEETINGS CRUD & SEARCH ---
  router.get('/meetings', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const meetings = await repo.getAllMeetings(type);
      res.json(meetings);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve meetings', details: err?.message });
    }
  });

  router.post('/meetings', checkRbac('CREATE'), async (req: Request, res: Response) => {
    try {
      const { title, date, start_time, startTime } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Meeting title is required.' });
      }
      const actor = req.body.actor || 'Operator';
      const meeting = await repo.createMeeting(req.body, actor);
      broadcastSse('meeting_created', meeting);
      res.status(201).json(meeting);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create meeting', details: err?.message });
    }
  });

  router.get('/meetings/:id', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const meeting = await repo.getMeetingById(req.params.id);
      if (meeting) res.json(meeting);
      else res.status(404).json({ error: 'Meeting not found' });
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching meeting', details: err?.message });
    }
  });

  router.patch('/meetings/:id', checkRbac('EDIT'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const updated = await repo.updateMeeting(req.params.id, req.body, actor);
      broadcastSse('meeting_updated', updated);
      res.json(updated);
    } catch (err: any) {
      const status = err?.message?.includes('not found') ? 404 : 400;
      res.status(status).json({ error: 'Failed to update meeting', details: err?.message });
    }
  });

  router.delete('/meetings/:id', checkRbac('DELETE'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      await repo.deleteMeeting(req.params.id, actor);
      broadcastSse('meeting_deleted', { meetingId: req.params.id });
      res.json({ success: true, message: `Meeting ${req.params.id} deleted successfully.` });
    } catch (err: any) {
      const status = err?.message?.includes('not found') ? 404 : 500;
      res.status(status).json({ error: 'Failed to delete meeting', details: err?.message });
    }
  });

  // --- LIFECYCLE STATE TRANSITIONS (START, PAUSE, RESUME, END) ---
  router.post('/meetings/:id/start', checkRbac('START'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const meeting = await repo.startMeeting(req.params.id, actor);
      broadcastSse('meeting_started', meeting);
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(400).json({ error: 'Cannot start meeting', details: err?.message });
    }
  });

  router.post('/meetings/:id/pause', checkRbac('PAUSE'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const meeting = await repo.pauseMeeting(req.params.id, actor);
      broadcastSse('meeting_paused', meeting);
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(400).json({ error: 'Cannot pause meeting', details: err?.message });
    }
  });

  router.post('/meetings/:id/resume', checkRbac('RESUME'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const meeting = await repo.resumeMeeting(req.params.id, actor);
      broadcastSse('meeting_resumed', meeting);
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(400).json({ error: 'Cannot resume meeting', details: err?.message });
    }
  });

  router.post('/meetings/:id/end', checkRbac('END'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const meeting = await repo.endMeeting(req.params.id, actor);
      broadcastSse('meeting_ended', meeting);
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(400).json({ error: 'Cannot end meeting', details: err?.message });
    }
  });

  router.patch('/meetings/:id/stage', checkRbac('EDIT'), async (req: Request, res: Response) => {
    try {
      const { stage } = req.body;
      const actor = req.body.actor || 'Operator';
      const success = await repo.updateMeetingStage(req.params.id, stage, actor);
      if (success) {
        broadcastSse('meeting_stage_updated', { meetingId: req.params.id, stage });
        res.json({ success: true, stage });
      } else {
        res.status(400).json({ success: false, error: 'Failed to update stage' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error updating meeting stage', details: err?.message });
    }
  });

  // --- CONTEXT & ORGANIZATIONAL MEMORY ---
  router.get('/meetings/:id/context', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const context = await repo.getMeetingContext(req.params.id);
      res.json(context);
    } catch (err: any) {
      const status = err?.message?.includes('not found') ? 404 : 500;
      res.status(status).json({ error: 'Failed to get meeting context', details: err?.message });
    }
  });

  // --- LIFECYCLE EVENTS AUDIT TRAIL ---
  router.get('/meetings/:id/events', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const events = await repo.getLifecycleEvents(req.params.id);
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get lifecycle events', details: err?.message });
    }
  });

  // --- PARTICIPANTS MANAGEMENT ---
  router.get('/meetings/:id/participants', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const participants = await repo.getParticipants(req.params.id);
      res.json(participants);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get participants', details: err?.message });
    }
  });

  router.post('/meetings/:id/participants', checkRbac('MANAGE_PARTICIPANTS'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const participant = await repo.addParticipant(req.params.id, req.body, actor);
      broadcastSse('participant_added', { meetingId: req.params.id, participant });
      res.status(201).json(participant);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to add participant', details: err?.message });
    }
  });

  router.patch('/meetings/:id/participants/:participantId', checkRbac('MANAGE_PARTICIPANTS'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const updated = await repo.updateParticipant(req.params.id, req.params.participantId, req.body, actor);
      broadcastSse('participant_updated', { meetingId: req.params.id, participant: updated });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to update participant', details: err?.message });
    }
  });

  router.delete('/meetings/:id/participants/:participantId', checkRbac('MANAGE_PARTICIPANTS'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      await repo.removeParticipant(req.params.id, req.params.participantId, actor);
      broadcastSse('participant_removed', { meetingId: req.params.id, participantId: req.params.participantId });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to remove participant', details: err?.message });
    }
  });

  // --- AGENDA MANAGEMENT ---
  router.get('/meetings/:id/agenda', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const agenda = await repo.getAgenda(req.params.id);
      res.json(agenda);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get agenda', details: err?.message });
    }
  });

  router.post('/meetings/:id/agenda', checkRbac('MANAGE_AGENDA'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const item = await repo.addAgendaItem(req.params.id, req.body, actor);
      broadcastSse('agenda_updated', { meetingId: req.params.id, action: 'ADD', item });
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to add agenda item', details: err?.message });
    }
  });

  router.patch('/meetings/:id/agenda/:itemId', checkRbac('MANAGE_AGENDA'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const item = await repo.updateAgendaItem(req.params.id, req.params.itemId, req.body, actor);
      broadcastSse('agenda_updated', { meetingId: req.params.id, action: 'UPDATE', item });
      res.json(item);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to update agenda item', details: err?.message });
    }
  });

  router.post('/meetings/:id/agenda/reorder', checkRbac('MANAGE_AGENDA'), async (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      const actor = req.body.actor || 'Operator';
      const agenda = await repo.reorderAgenda(req.params.id, orderedIds, actor);
      broadcastSse('agenda_updated', { meetingId: req.params.id, action: 'REORDER', agenda });
      res.json(agenda);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to reorder agenda', details: err?.message });
    }
  });

  router.delete('/meetings/:id/agenda/:itemId', checkRbac('MANAGE_AGENDA'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      await repo.removeAgendaItem(req.params.id, req.params.itemId, actor);
      broadcastSse('agenda_updated', { meetingId: req.params.id, action: 'REMOVE', itemId: req.params.itemId });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to delete agenda item', details: err?.message });
    }
  });

  // --- DOCUMENTS MANAGEMENT ---
  router.get('/meetings/:id/documents', checkRbac('VIEW'), async (req: Request, res: Response) => {
    try {
      const docs = await repo.getDocuments(req.params.id);
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get documents', details: err?.message });
    }
  });

  router.post('/meetings/:id/documents', checkRbac('ATTACH_DOCUMENTS'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      const doc = await repo.addDocument(req.params.id, req.body, actor);
      broadcastSse('document_attached', { meetingId: req.params.id, document: doc });
      res.status(201).json(doc);
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to attach document', details: err?.message });
    }
  });

  router.delete('/meetings/:id/documents/:documentId', checkRbac('ATTACH_DOCUMENTS'), async (req: Request, res: Response) => {
    try {
      const actor = req.body.actor || 'Operator';
      await repo.removeDocument(req.params.id, req.params.documentId, actor);
      broadcastSse('document_detached', { meetingId: req.params.id, documentId: req.params.documentId });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: 'Failed to remove document', details: err?.message });
    }
  });

  // --- RECORDING BOUNDARY ---
  router.get('/meetings/:id/recordings', async (req: Request, res: Response) => {
    try {
      const recordings = await repo.getRecordingSessions(req.params.id);
      res.json(recordings);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching recordings', details: err?.message });
    }
  });

  router.post('/meetings/:id/recordings', async (req: Request, res: Response) => {
    try {
      const { status, startedAt, endedAt, durationMs, mediaType, codec, storageRef, checksum, size, createdBy, tenantId } = req.body;
      const session = await repo.saveRecordingSession({
        meetingId: req.params.id,
        tenantId: tenantId || 'ketraco',
        status: status || 'READY',
        startedAt: startedAt || new Date().toISOString(),
        endedAt: endedAt || null,
        durationMs: durationMs || 0,
        mediaType: mediaType || 'audio/webm',
        codec,
        storageRef,
        checksum,
        size,
        createdBy: createdBy || 'browser-recorder',
        version: '1.0'
      });
      broadcastSse('recording_session_updated', { meetingId: req.params.id, session });
      res.status(201).json(session);
    } catch (err: any) {
      res.status(500).json({ error: 'Error saving recording session', details: err?.message });
    }
  });

  router.post('/meetings/:id/recordings/upload', async (req: Request, res: Response) => {
    try {
      const { storageRef, checksum, size } = req.body;
      if (!storageRef) {
        return res.status(400).json({ error: 'storageRef is required' });
      }
      const targetDir = path.resolve(process.cwd(), 'data', 'meeting-media');
      fs.mkdirSync(targetDir, { recursive: true });
      const finalPath = path.join(targetDir, path.basename(storageRef));
      if (req.body.data) {
        fs.writeFileSync(finalPath, Buffer.from(req.body.data, 'base64'));
      }
      const session = await repo.saveRecordingSession({
        meetingId: req.params.id,
        tenantId: req.body.tenantId || 'ketraco',
        status: 'STORED',
        storageRef: finalPath,
        checksum: checksum || undefined,
        size: size || 0,
        createdBy: req.body.createdBy || 'browser-recorder',
        version: '1.0'
      });
      broadcastSse('recording_stored', { meetingId: req.params.id, session });
      res.status(201).json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ error: 'Error storing recording', details: err?.message });
    }
  });

  // --- TRANSCRIPTS & LIVE AUDIO ---
  router.get('/meetings/:id/transcripts', async (req: Request, res: Response) => {
    try {
      const segments = await repo.getTranscripts(req.params.id);
      res.json(segments);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching transcripts', details: err?.message });
    }
  });

  router.post('/meetings/:id/transcripts', async (req: Request, res: Response) => {
    try {
      const segment = await repo.addTranscriptSegment({ ...req.body, meeting_id: req.params.id });
      broadcastSse('transcript_segment', segment);
      res.status(201).json(segment);
    } catch (err: any) {
      res.status(500).json({ error: 'Error saving transcript segment', details: err?.message });
    }
  });

  router.get('/ai-context', async (req: Request, res: Response) => {
    try {
      const meetingId = (req.query.meetingId as string) || 'MEETING_SCM_TRANSFORMATION_REVIEW';
      const tenantId = (req.query.tenantId as string) || 'ketraco';
      const context = aiService.getProviderStatus(meetingId, tenantId);
      res.json(context);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to resolve AI context', details: err?.message });
    }
  });

  // --- AI EXTRACTION & SIGNALS ---
  router.post('/meetings/:id/ai-extract', async (req: Request, res: Response) => {
    try {
      const meeting = await repo.getMeetingById(req.params.id);
      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

      const segments = await repo.getTranscripts(req.params.id);
      const detected = await aiService.extractIntelligenceItems(meeting, segments);

      // Persist newly detected items
      const savedItems = [];
      for (const item of detected) {
        const saved = await repo.addDetectedItem(item);
        savedItems.push(saved);
      }

      broadcastSse('intelligence_extracted', { meetingId: req.params.id, items: savedItems });
      res.json({ success: true, count: savedItems.length, items: savedItems });
    } catch (err: any) {
      console.error('[API] AI extraction error:', err);
      res.status(500).json({ error: 'AI extraction failed', details: err?.message });
    }
  });

  router.get('/meetings/:id/detected-items', async (req: Request, res: Response) => {
    try {
      const items = await repo.getDetectedItems(req.params.id);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching detected items', details: err?.message });
    }
  });

  router.post('/detected-items/:id/review', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes, reviewer, editedValues } = req.body;
      const result = await repo.reviewDetectedItem(id, status, notes, reviewer, editedValues);
      if (result.success) {
        broadcastSse('signal_reviewed', { id, status, promotedEntityId: result.promotedEntityId });
        res.json({ success: true, ...result });
      } else {
        res.status(400).json({ success: false, error: 'Review update failed' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error reviewing detected item', details: err?.message });
    }
  });

  // --- DECISIONS ---
  router.get('/decisions', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const meetingId = req.query.meetingId as string | undefined;
      const decisions = await repo.getDecisions({ status, meetingId });
      res.json(decisions);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching decisions', details: err?.message });
    }
  });

  router.post('/decisions', async (req: Request, res: Response) => {
    try {
      const dec = await repo.createDecision(req.body);
      broadcastSse('decision_created', dec);
      res.status(201).json(dec);
    } catch (err: any) {
      res.status(500).json({ error: 'Error creating decision', details: err?.message });
    }
  });

  router.post('/decisions/:id/approve', async (req: Request, res: Response) => {
    try {
      const { actor } = req.body;
      const success = await repo.approveDecision(req.params.id, actor || 'Kamuren Wanjau (Operations Director)');
      if (success) {
        broadcastSse('decision_approved', { id: req.params.id, actor });
        res.json({ success: true, message: `Decision ${req.params.id} approved under statutory compliance.` });
      } else {
        res.status(404).json({ success: false, error: 'Decision not found or could not be approved' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Approval execution failed', details: err?.message });
    }
  });

  router.patch('/decisions/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, actor, notes } = req.body;
      const success = await repo.updateDecisionStatus(req.params.id, status, actor || 'Operator', notes);
      if (success) {
        broadcastSse('decision_status_changed', { id: req.params.id, status });
        res.json({ success: true, status });
      } else {
        res.status(400).json({ success: false, error: 'Failed to update decision status' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error updating decision status', details: err?.message });
    }
  });

  // --- ACTIONS ---
  router.get('/actions', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const sourceMeetingId = req.query.sourceMeetingId as string | undefined;
      const actions = await repo.getActions({ status, sourceMeetingId });
      res.json(actions);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching actions', details: err?.message });
    }
  });

  router.post('/actions', async (req: Request, res: Response) => {
    try {
      const act = await repo.createAction(req.body);
      broadcastSse('action_created', act);
      res.status(201).json(act);
    } catch (err: any) {
      res.status(500).json({ error: 'Error creating action', details: err?.message });
    }
  });

  router.patch('/actions/:id/status', async (req: Request, res: Response) => {
    try {
      const { status, actor } = req.body;
      const success = await repo.updateActionStatus(req.params.id, status, actor || 'Operator');
      if (success) {
        broadcastSse('action_status_changed', { id: req.params.id, status });
        res.json({ success: true, status });
      } else {
        res.status(400).json({ success: false, error: 'Failed to update action status' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error updating action status', details: err?.message });
    }
  });

  router.post('/actions/:id/escalate', async (req: Request, res: Response) => {
    try {
      const { reason, actor } = req.body;
      const success = await repo.escalateAction(req.params.id, reason, actor || 'Operator');
      if (success) {
        broadcastSse('action_escalated', { id: req.params.id, reason });
        res.json({ success: true, message: 'Action escalated to executive authority.' });
      } else {
        res.status(400).json({ success: false, error: 'Escalation failed' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error escalating action', details: err?.message });
    }
  });

  router.post('/actions/:id/verify', async (req: Request, res: Response) => {
    try {
      const { notes, verifier } = req.body;
      const success = await repo.verifyAction(req.params.id, notes, verifier || 'Operations Director');
      if (success) {
        broadcastSse('action_verified', { id: req.params.id, verifier });
        res.json({ success: true, message: 'Action successfully verified and completed.' });
      } else {
        res.status(400).json({ success: false, error: 'Verification failed' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error verifying action', details: err?.message });
    }
  });

  router.post('/actions/:id/execute', async (req: Request, res: Response) => {
    try {
      const { actor } = req.body;
      const result = await repo.executeActionWorkflow(req.params.id, actor || 'Operations Director');
      broadcastSse('action_executed', { id: req.params.id, workflowId: result.workflowId });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Workflow execution failed', details: err?.message });
    }
  });

  // --- COMMITMENTS & RISKS ---
  router.get('/commitments', async (req: Request, res: Response) => {
    try {
      const meetingId = req.query.meetingId as string | undefined;
      const commitments = await repo.getCommitments(meetingId);
      res.json(commitments);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching commitments', details: err?.message });
    }
  });

  router.post('/commitments', async (req: Request, res: Response) => {
    try {
      const com = await repo.createCommitment(req.body);
      res.status(201).json(com);
    } catch (err: any) {
      res.status(500).json({ error: 'Error creating commitment', details: err?.message });
    }
  });

  router.get('/risks', async (req: Request, res: Response) => {
    try {
      const meetingId = req.query.meetingId as string | undefined;
      const risks = await repo.getRisks(meetingId);
      res.json(risks);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching risks', details: err?.message });
    }
  });

  router.post('/risks', async (req: Request, res: Response) => {
    try {
      const r = await repo.createRisk(req.body);
      res.status(201).json(r);
    } catch (err: any) {
      res.status(500).json({ error: 'Error creating risk', details: err?.message });
    }
  });

  // --- MINUTES & GOVERNANCE ---
  router.get('/meetings/:id/minutes', async (req: Request, res: Response) => {
    try {
      const minutes = await repo.getMinutes(req.params.id);
      if (minutes) res.json(minutes);
      else res.status(404).json({ error: 'No minutes found for this meeting' });
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching minutes', details: err?.message });
    }
  });

  router.post('/meetings/:id/minutes/generate', async (req: Request, res: Response) => {
    try {
      const meeting = await repo.getMeetingById(req.params.id);
      if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

      const segments = await repo.getTranscripts(req.params.id);
      const decisions = await repo.getDecisions({ meetingId: req.params.id });
      const actions = await repo.getActions({ sourceMeetingId: req.params.id });
      const commitments = await repo.getCommitments(req.params.id);
      const risks = await repo.getRisks(req.params.id);

      const generated = await aiService.generateStructuredMinutes(meeting, segments, decisions, actions, commitments, risks);
      const saved = await repo.saveMinutes(generated);

      broadcastSse('minutes_generated', { meetingId: req.params.id, minutesId: saved.id });
      res.status(201).json(saved);
    } catch (err: any) {
      console.error('[API] Error generating minutes:', err);
      res.status(500).json({ error: 'Failed to generate minutes', details: err?.message });
    }
  });

  router.post('/minutes/:id/save', async (req: Request, res: Response) => {
    try {
      const saved = await repo.saveMinutes(req.body);
      broadcastSse('minutes_saved', { minutesId: saved.id, status: saved.status });
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to save minutes', details: err?.message });
    }
  });

  router.post('/minutes/:id/approve', async (req: Request, res: Response) => {
    try {
      const { chair } = req.body;
      const success = await repo.approveMinutes(req.params.id, chair || 'Kamuren Wanjau (Operations Director)');
      if (success) {
        broadcastSse('minutes_approved', { minutesId: req.params.id });
        res.json({ success: true, message: 'Minutes approved and version-locked.' });
      } else {
        res.status(400).json({ success: false, error: 'Approval failed' });
      }
    } catch (err: any) {
      res.status(500).json({ error: 'Error approving minutes', details: err?.message });
    }
  });

  // --- NOTIFICATIONS & AUDIT ---
  router.get('/notifications', async (req: Request, res: Response) => {
    try {
      const notifs = await repo.getNotifications();
      res.json(notifs);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching notifications', details: err?.message });
    }
  });

  router.post('/notifications/:id/read', async (req: Request, res: Response) => {
    try {
      await repo.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'Error marking notification read', details: err?.message });
    }
  });

  router.get('/audit-log', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await repo.getAuditLog(limit);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: 'Error fetching audit log', details: err?.message });
    }
  });

  // --- KNOWLEDGE GRAPH SUB-GRAPH ---
  router.get('/graph/meeting/:id', async (req: Request, res: Response) => {
    try {
      const subGraph = graphAdapter.getMeetingSubGraph(req.params.id);
      res.json(subGraph);
    } catch (err: any) {
      res.status(500).json({ error: 'Error retrieving meeting knowledge graph', details: err?.message });
    }
  });

  // --- SEARCH ---
  router.post('/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });
      const results = await repo.search(query);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Search failed', details: err?.message });
    }
  });

  // --- REPORTS GENERATOR ---
  router.get('/reports/:type', async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const meetingId = (req.query.meetingId as string) || 'MEETING_SCM_TRANSFORMATION_REVIEW';
      const overview = await repo.getOverview(meetingId);

      const title = type.toUpperCase().replace(/-/g, ' ');
      const timestamp = new Date().toISOString();

      let markdown = `# KETRACO OFFICIAL REPORT: ${title}\n`;
      markdown += `Generated: ${timestamp} | Classification: KETRACO INTERNAL GOVERNANCE\n`;
      markdown += `Meeting: ${overview.next_meeting.title} (${overview.next_meeting.date})\n\n`;

      if (type === 'minutes') {
        const m = overview.active_minutes;
        markdown += `## EXECUTIVE SUMMARY\n${m?.executive_summary || overview.next_meeting.objective}\n\n`;
        markdown += `## DECISIONS ADOPTED\n`;
        overview.decision_register.items.forEach(d => {
          markdown += `- **${d.code}**: ${d.title} (Status: ${d.status}, Authority: ${d.authority})\n`;
        });
        markdown += `\n## ACTIONS ASSIGNED\n`;
        overview.action_control.items.forEach(a => {
          markdown += `- **${a.action_title}** | Owner: ${a.owner} | Due: ${a.due_date} | Status: ${a.status}\n`;
        });
      } else if (type === 'decision-register') {
        markdown += `## STATUTORY DECISION REGISTER\n\n`;
        overview.decision_register.items.forEach(d => {
          markdown += `### ${d.code}: ${d.title}\n`;
          markdown += `- **Status**: ${d.status}\n- **Authority**: ${d.authority}\n- **Owner**: ${d.owner}\n- **Confidence**: ${d.confidence}%\n`;
          markdown += `- **Evidence**: ${d.evidence_text || 'Verified in proceedings'}\n\n`;
        });
      } else if (type === 'action-register') {
        markdown += `## ACTION CONTROL QUEUE\n\n`;
        overview.action_control.items.forEach(a => {
          markdown += `### ${a.action_title}\n`;
          markdown += `- **Owner**: ${a.owner} (${a.department})\n- **Deadline**: ${a.due_date}\n- **Priority**: ${a.priority}\n- **Status**: ${a.status}\n`;
          if (a.verification_notes) markdown += `- **Verification**: ${a.verification_notes} (by ${a.verified_by})\n`;
          markdown += `\n`;
        });
      } else if (type === 'risk-update') {
        markdown += `## RISK & VULNERABILITY RADAR\n\n`;
        overview.risks.forEach(r => {
          markdown += `- **${r.risk_title}** | Severity: ${r.severity} | Likelihood: ${r.likelihood} | Status: ${r.status}\n  *Mitigation*: ${r.mitigation_plan} (Owner: ${r.owner})\n\n`;
        });
      } else {
        markdown += `## GENERAL EXECUTIVE SUMMARY\n`;
        markdown += `Active Decisions: ${overview.decision_register.total} | Open Actions: ${overview.action_control.total} | Risks: ${overview.risks.length}\n`;
      }

      res.json({
        report_type: type,
        title,
        generated_at: timestamp,
        markdown,
        data: overview
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Report generation failed', details: err?.message });
    }
  });

  // --- COPILOT ---
  router.post('/copilot/ask', async (req: Request, res: Response) => {
    try {
      const { prompt, context, userId, tenantId, userRole } = req.body || {};
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

      const authenticatedUserId = userId || (req.headers['x-user-id'] as string) || 'operator';
      const userTenantId = tenantId || (req.headers['x-tenant-id'] as string) || 'ketraco';
      const role = userRole || (req.headers['x-user-role'] as string) || 'CHAIR';

      const reply = await copilot.ask(prompt, authenticatedUserId, userTenantId, role, context || {});
      res.json(reply);
    } catch (err: any) {
      console.error('[API] Copilot ask error:', err);
      res.status(500).json({ error: 'Copilot query execution failed', details: err?.message });
    }
  });

  return router;
}
