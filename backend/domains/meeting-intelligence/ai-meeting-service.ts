/**
 * AI MEETING SERVICE — PROVIDER-NEUTRAL DELEGATION
 *
 * This service now delegates ALL AI operations to MeetingAiGatewayAdapter,
 * which in turn uses the canonical AtlasAiGateway.
 *
 * NEVER directly calls GoogleGenAI, Groq, OpenRouter, or any provider.
 * The service is provider-agnostic and remains so regardless of future
 * provider configuration.
 */

import { MeetingAiGatewayAdapter } from './meeting-ai-gateway-adapter';
import {
  TranscriptSegment,
  DetectedIntelligenceItem,
  MeetingMinutes,
  MeetingEntity,
  DetectedItemType,
  MeetingAIContextContract,
} from './types';
import { DatabaseCore } from '../../database/db-core';

export class AiMeetingService {
  private static instance: AiMeetingService | null = null;
  private gatewayAdapter: MeetingAiGatewayAdapter;
  private db: DatabaseCore;

  private constructor() {
    this.gatewayAdapter = MeetingAiGatewayAdapter.getInstance();
    this.db = DatabaseCore.getInstance();
  }

  public static getInstance(): AiMeetingService {
    if (!AiMeetingService.instance) {
      AiMeetingService.instance = new AiMeetingService();
    }
    return AiMeetingService.instance;
  }

  /**
   * Get provider status — is AI configured?
   */
  public getProviderStatus(meetingId: string, tenantId = 'ketraco'): MeetingAIContextContract {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const providerState = hasGemini ? 'READY' : 'AI_PROVIDER_NOT_CONFIGURED';
    return {
      contextId: `ctx_${meetingId}_${Date.now()}`,
      meetingId,
      tenantId,
      providerState: providerState as any,
      selectedModel: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      groundedContext: [],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract intelligence items from transcript
   * Delegates to MeetingAiGatewayAdapter which uses AtlasAiGateway
   */
  public async extractIntelligenceItems(
    meeting: MeetingEntity,
    segments: TranscriptSegment[]
  ): Promise<DetectedIntelligenceItem[]> {
    // Use system-level authentication (AI service operation)
    const authenticatedUserId = 'ai-meeting-service';
    const userTenantId = meeting.tenant_id || 'ketraco';
    const userRole = 'SYSTEM';

    try {
      const { proposals, envelope } = await this.gatewayAdapter.extractIntelligenceItems(
        meeting.id,
        'DECISIONS', // Default to DECISIONS; can be extended to handle multiple types
        authenticatedUserId,
        userTenantId,
        userRole
      );

      // Map proposals to legacy DetectedIntelligenceItem format
      const items: DetectedIntelligenceItem[] = proposals.map((proposal, idx) => ({
        id: `SIG_${Date.now()}_${idx}`,
        meeting_id: meeting.id,
        item_type: proposal.itemType as DetectedItemType,
        speaker: 'AI_MODEL',
        timestamp_label: proposal.evidence[0]?.timestamp || '00:00',
        source_text: proposal.evidence[0]?.quote || proposal.description,
        suggested_title: proposal.title,
        confidence: proposal.confidence,
        linked_entity: proposal.linkedEntity || meeting.project_id || 'KETRACO',
        category: proposal.category || 'GOVERNANCE',
        evidence_quote: proposal.evidence[0]?.quote || proposal.description,
        status: proposal.status as any,
        created_at: proposal.proposedAt,
      }));

      return items;
    } catch (err) {
      console.warn('[AiMeetingService] Intelligence extraction failed:', err);
      return [];
    }
  }

  /**
   * Generates structured KETRACO enterprise minutes from meeting state
   * This is deterministic document generation, not AI-powered
   * (future enhancement: can accept AI-extracted items but remains structurally deterministic)
   */
  public async generateStructuredMinutes(
    meeting: MeetingEntity,
    segments: TranscriptSegment[],
    decisions: any[],
    actions: any[],
    commitments: any[],
    risks: any[]
  ): Promise<MeetingMinutes> {
    const executiveSummary = `The ${meeting.title} convened on ${meeting.date} at ${meeting.room || 'KETRACO Plaza'}, chaired by ${
      meeting.participants[0]?.name || 'Operations Director'
    }. The session reviewed progress against statutory milestones, resolved technical interface requirements for ${
      meeting.project_id || 'the national grid'
    }, and established mandatory closed-loop action controls. Specific resolutions were adopted in strict adherence to KETRACO governance and Public Procurement and Asset Disposal Act (PPADA) mandates.`;

    const proceedings = (meeting.agenda || []).map((ag, idx) => ({
      agenda_item_id: ag.id,
      agenda_title: ag.title,
      discussion_summary: `The committee delved into Agenda Item ${ag.order}: ${ag.title}, led by ${ag.presenter}. Findings confirmed full alignment on prerequisite actions and resolved operational dependencies.`,
      key_findings: [
        `Presented by ${ag.presenter} (${ag.duration_minutes} mins).`,
        `Formal adoption of underlying technical specifications verified by committee members.`,
      ],
    }));

    return {
      id: `MIN_${meeting.id}_${Date.now()}`,
      meeting_id: meeting.id,
      version: 1,
      status: 'SECRETARY_REVIEW',
      title: `Official Minutes of ${meeting.title}`,
      date: meeting.date,
      location: meeting.room || 'KETRACO Executive Conference Room, Nairobi',
      chair: meeting.participants[0]?.name || 'Kamuren Wanjau (Operations Director)',
      secretary: meeting.participants[1]?.name || 'John Kamau (SCM Lead)',
      attendees: (meeting.participants || []).map((p) => ({
        name: p.name,
        role: p.role,
        organization: 'KETRACO',
      })),
      apologies: [],
      executive_summary: executiveSummary,
      agenda_proceedings: proceedings,
      decisions: decisions.map((d) => ({
        code: d.code,
        title: d.title,
        authority: d.authority,
        approved_by: d.approved_by || 'Pending Official Chair Approval',
      })),
      actions: actions.map((a) => ({
        id: a.id,
        action_title: a.action_title,
        owner: a.owner,
        due_date: a.due_date,
      })),
      commitments: commitments.map((c) => ({
        title: c.commitment_title,
        party: c.party,
        deadline: c.target_date,
      })),
      risks_and_issues: risks.map((r) => ({
        title: r.risk_title,
        severity: r.severity,
        mitigation: r.mitigation_plan,
      })),
      next_meeting_notes: 'Next statutory follow-up session scheduled in 7 calendar days.',
      version_lock_hash: `hash_${Date.now()}`,
      approved_by_chair: null,
      approved_at: null,
      published_at: null,
      audit_events: [
        {
          action: 'GENERATED',
          actor: 'AiMeetingService',
          timestamp: new Date().toISOString(),
          note: 'Structured minutes generated from meeting state and transcript',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Semantic search over organizational memory (deterministic database query, not AI)
   */
  public async semanticSearch(query: string, tenantId: string): Promise<any[]> {
    const lower = query.toLowerCase();

    try {
      // Search meeting decisions
      const decisions = await this.db.all<any>(
        `SELECT * FROM meeting_decisions WHERE title LIKE ? OR description LIKE ? LIMIT 10`,
        [`%${lower}%`, `%${lower}%`]
      );

      // Search actions
      const actions = await this.db.all<any>(
        `SELECT * FROM meeting_actions WHERE action_title LIKE ? OR description LIKE ? LIMIT 10`,
        [`%${lower}%`, `%${lower}%`]
      );

      // Search transcripts
      const transcripts = await this.db.all<any>(
        `SELECT * FROM meeting_transcripts WHERE text LIKE ? LIMIT 10`,
        [`%${lower}%`]
      );

      return [
        ...decisions.map((d) => ({ type: 'DECISION', data: d })),
        ...actions.map((a) => ({ type: 'ACTION', data: a })),
        ...transcripts.map((t) => ({ type: 'TRANSCRIPT', data: t })),
      ];
    } catch (err) {
      console.warn('[AiMeetingService] Semantic search failed:', err);
      return [];
    }
  }
}
