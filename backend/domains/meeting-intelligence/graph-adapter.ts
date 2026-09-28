/**
 * KETRACO MEETING INTELLIGENCE — KNOWLEDGE GRAPH & ONTOLOGY ADAPTER
 * Connects meetings, decisions, actions, risks, and commitments to the Atlas Knowledge Graph
 */

import { KnowledgeGraphService } from '../../evaluation/knowledge-graph';
import { GraphNode, GraphEdge } from '../../../src/types/evaluation';
import { MeetingEntity, DecisionRecord, ActionControlItem, RiskItem } from './types';

export class MeetingGraphAdapter {
  private static instance: MeetingGraphAdapter | null = null;
  private kg: KnowledgeGraphService;

  private constructor() {
    this.kg = KnowledgeGraphService.getInstance();
  }

  public static getInstance(): MeetingGraphAdapter {
    if (!MeetingGraphAdapter.instance) {
      MeetingGraphAdapter.instance = new MeetingGraphAdapter();
    }
    return MeetingGraphAdapter.instance;
  }

  /**
   * Syncs a meeting and its linked entities into the live Atlas Knowledge Graph
   */
  public syncMeetingToGraph(meeting: MeetingEntity): void {
    const verified = {
      source: 'meeting-intelligence-nexus',
      sourceRecordId: meeting.id,
      observedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED' as const,
      confidence: 1,
    };

    // 1. Add Meeting Node
    const meetingNode: GraphNode = {
      id: meeting.id,
      type: 'ENTITY',
      label: meeting.title,
      properties: {
        entity_subtype: 'Meeting',
        meeting_type: meeting.meeting_type,
        date: meeting.date,
        department: meeting.department,
        status: meeting.status,
        project_id: meeting.project_id,
        pds_stage: meeting.pds_stage,
        tenantId: meeting.tenant_id || 'ketraco',
      },
    };
    this.kg.addNode(meetingNode);

    // 2. Link to Department
    if (meeting.department) {
      const deptId = `dept-${meeting.department.toLowerCase().replace(/\s+/g, '-')}`;
      this.kg.addNode({
        id: deptId,
        type: 'ORGANIZATION',
        label: meeting.department,
        properties: { tenantId: 'ketraco' },
      });
      this.kg.addEdge({
        id: `edge-${meeting.id}-${deptId}`,
        source: meeting.id,
        target: deptId,
        type: 'ORGANIZED_BY',
        confidence: 1,
        properties: {},
        provenance: verified,
      });
    }

    // 3. Link to Project & PDS Stage
    if (meeting.project_id) {
      this.kg.addNode({
        id: meeting.project_id,
        type: 'PROJECT',
        label: meeting.project_id.replace('PRJ-', '').replace(/-/g, ' '),
        properties: { pds_stage: meeting.pds_stage, tenantId: 'ketraco' },
      });
      this.kg.addEdge({
        id: `edge-${meeting.id}-${meeting.project_id}`,
        source: meeting.id,
        target: meeting.project_id,
        type: 'GOVERNS_PROJECT',
        confidence: 0.98,
        properties: { pds_stage: meeting.pds_stage },
        provenance: verified,
      });
    }

    // 4. Link Participants (Persons)
    if (Array.isArray(meeting.participants)) {
      meeting.participants.forEach((p, idx) => {
        const personId = `person-${p.name.toLowerCase().replace(/\s+/g, '-')}`;
        this.kg.addNode({
          id: personId,
          type: 'PERSON',
          label: p.name,
          properties: { role: p.role, department: p.department, email: p.email, tenantId: 'ketraco' },
        });
        this.kg.addEdge({
          id: `edge-${personId}-${meeting.id}-${idx}`,
          source: personId,
          target: meeting.id,
          type: 'ATTENDED',
          confidence: 1,
          properties: { role: p.role },
          provenance: verified,
        });
      });
    }
  }

  /**
   * Syncs a Decision entity into the Knowledge Graph
   */
  public syncDecisionToGraph(decision: DecisionRecord): void {
    const verified = {
      source: 'meeting-decision-register',
      sourceRecordId: decision.id,
      observedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED' as const,
      confidence: decision.confidence / 100,
    };

    const decNode: GraphNode = {
      id: decision.id,
      type: 'DECISION',
      label: `${decision.code}: ${decision.title}`,
      properties: {
        code: decision.code,
        status: decision.status,
        authority: decision.authority,
        owner: decision.owner,
        approved_by: decision.approved_by,
        tenantId: 'ketraco',
      },
    };
    this.kg.addNode(decNode);

    // Link Decision to Meeting
    if (decision.meeting_id) {
      this.kg.addEdge({
        id: `edge-${decision.meeting_id}-${decision.id}`,
        source: decision.meeting_id,
        target: decision.id,
        type: 'RESOLVED_DECISION',
        confidence: 1,
        properties: {},
        provenance: verified,
      });
    }

    // Link Decision to Project
    if (decision.project_id) {
      this.kg.addEdge({
        id: `edge-${decision.id}-${decision.project_id}`,
        source: decision.id,
        target: decision.project_id,
        type: 'APPLIES_TO',
        confidence: 0.95,
        properties: {},
        provenance: verified,
      });
    }
  }

  /**
   * Syncs an Action into the Knowledge Graph
   */
  public syncActionToGraph(action: ActionControlItem): void {
    const verified = {
      source: 'meeting-action-control',
      sourceRecordId: action.id,
      observedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED' as const,
      confidence: 1,
    };

    const actionNode: GraphNode = {
      id: action.id,
      type: 'TASK',
      label: action.action_title,
      properties: {
        owner: action.owner,
        department: action.department,
        due_date: action.due_date,
        priority: action.priority,
        status: action.status,
        tenantId: 'ketraco',
      },
    };
    this.kg.addNode(actionNode);

    if (action.source_meeting_id) {
      this.kg.addEdge({
        id: `edge-${action.source_meeting_id}-${action.id}`,
        source: action.source_meeting_id,
        target: action.id,
        type: 'GENERATED_ACTION',
        confidence: 1,
        properties: {},
        provenance: verified,
      });
    }

    if (action.project_id) {
      this.kg.addEdge({
        id: `edge-${action.id}-${action.project_id}`,
        source: action.id,
        target: action.project_id,
        type: 'DELIVERS_FOR',
        confidence: 0.95,
        properties: {},
        provenance: verified,
      });
    }
  }

  /**
   * Syncs a Risk into the Knowledge Graph
   */
  public syncRiskToGraph(risk: RiskItem): void {
    const verified = {
      source: 'meeting-risk-radar',
      sourceRecordId: risk.id,
      observedAt: new Date().toISOString(),
      verificationStatus: 'VERIFIED' as const,
      confidence: 0.9,
    };

    const riskNode: GraphNode = {
      id: risk.id,
      type: 'RISK',
      label: risk.risk_title,
      properties: {
        severity: risk.severity,
        likelihood: risk.likelihood,
        owner: risk.owner,
        status: risk.status,
        tenantId: 'ketraco',
      },
    };
    this.kg.addNode(riskNode);

    if (risk.meeting_id) {
      this.kg.addEdge({
        id: `edge-${risk.meeting_id}-${risk.id}`,
        source: risk.meeting_id,
        target: risk.id,
        type: 'IDENTIFIED_RISK',
        confidence: 0.95,
        properties: {},
        provenance: verified,
      });
    }

    if (risk.project_id) {
      this.kg.addEdge({
        id: `edge-${risk.id}-${risk.project_id}`,
        source: risk.id,
        target: risk.project_id,
        type: 'IMPACTS',
        confidence: 0.9,
        properties: { severity: risk.severity },
        provenance: verified,
      });
    }
  }

  /**
   * Retrieves sub-graph for a meeting or entity
   */
  public getMeetingSubGraph(meetingId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const rels = this.kg.getRelationships(meetingId);
    const nodeIds = new Set<string>([meetingId]);
    rels.forEach(e => {
      nodeIds.add(e.source);
      nodeIds.add(e.target);
    });

    const nodes: GraphNode[] = [];
    nodeIds.forEach(id => {
      const n = (this.kg as any).nodes.get(id);
      if (n) nodes.push(n);
    });

    return {
      nodes,
      edges: rels,
    };
  }
}
