/**
 * MEETING COPILOT SERVICE — PROVIDER-NEUTRAL ORCHESTRATION
 *
 * Thin orchestration layer that:
 * 1. Authenticates the request
 * 2. Resolves meeting authorization
 * 3. Assembles canonical context via MeetingAiGatewayAdapter
 * 4. Calls the provider-neutral gateway
 * 5. Validates and returns result
 *
 * Does NOT:
 * - Choose a provider directly
 * - Query arbitrary database tables
 * - Implement authorization logic
 * - Implement provider retry logic
 * - Fabricate fallback responses
 */

import { v4 as uuidv4 } from 'uuid';
import { MeetingAiGatewayAdapter } from './meeting-ai-gateway-adapter';
import { DatabaseCore } from '../../database/db-core';
import { CopilotMessage, MeetingEntity } from './types';

export class MeetingCopilotService {
  private static instance: MeetingCopilotService | null = null;
  private gatewayAdapter: MeetingAiGatewayAdapter;
  private db: DatabaseCore;

  private constructor() {
    this.gatewayAdapter = MeetingAiGatewayAdapter.getInstance();
    this.db = DatabaseCore.getInstance();
  }

  public static getInstance(): MeetingCopilotService {
    if (!MeetingCopilotService.instance) {
      MeetingCopilotService.instance = new MeetingCopilotService();
    }
    return MeetingCopilotService.instance;
  }

  /**
   * Copilot query with authorization boundary and provider-neutral gateway
   */
  public async ask(
    prompt: string,
    authenticatedUserId: string,
    userTenantId: string,
    userRole: string,
    context?: {
      meetingId?: string;
      currentRole?: string;
      selectedEvidence?: string;
    }
  ): Promise<CopilotMessage> {
    const messageId = `msg_${uuidv4()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Check if AI provider is configured
    const providerStatus = await this.gatewayAdapter.getProviderStatus(userTenantId);
    if (providerStatus.providerState === 'AI_PROVIDER_NOT_CONFIGURED') {
      return {
        id: messageId,
        sender: 'COPILOT',
        text: 'AI_PROVIDER_NOT_CONFIGURED: The Meeting Intelligence AI provider is not configured. Meeting records remain available, but live AI analysis is unavailable until a valid provider key is configured.',
        timestamp,
        confidence: 0,
        sources: [],
        suggested_actions: ['Configure AI provider', 'Review transcript ledger', 'Manual decision review'],
        evidence_ref: 'AI Provider Unavailable',
      };
    }

    // 2. If meeting context provided, validate authorization and attempt extraction
    if (context?.meetingId) {
      return this.handleMeetingContextualQuery(
        messageId,
        prompt,
        context.meetingId,
        authenticatedUserId,
        userTenantId,
        userRole,
        timestamp
      );
    }

    // 3. Fallback: Grounded enterprise memory response (database-backed, never AI-fabricated)
    return this.handleGroundedMemoryQuery(messageId, prompt, userTenantId, timestamp);
  }

  /**
   * Query with meeting context — uses AI gateway
   */
  private async handleMeetingContextualQuery(
    messageId: string,
    prompt: string,
    meetingId: string,
    authenticatedUserId: string,
    userTenantId: string,
    userRole: string,
    timestamp: string
  ): Promise<CopilotMessage> {
    try {
      // Validate user is authorized for this meeting
      const meeting = await this.db.get<MeetingEntity>(
        `SELECT * FROM meetings WHERE id = ? AND tenant_id = ?`,
        [meetingId, userTenantId]
      );

      if (!meeting) {
        return {
          id: messageId,
          sender: 'COPILOT',
          text: 'Meeting not found or access denied.',
          timestamp,
          confidence: 0,
          sources: [],
          suggested_actions: [],
          evidence_ref: 'AUTH_FAILURE',
        };
      }

      // Check if user is meeting participant
      const isParticipant = meeting.participants?.some((p) => p.email === authenticatedUserId || p.id === authenticatedUserId);
      if (!isParticipant && userRole !== 'admin' && userRole !== 'CHAIR') {
        return {
          id: messageId,
          sender: 'COPILOT',
          text: `Access denied. You must be a participant in meeting "${meeting.title}" to use AI analysis.`,
          timestamp,
          confidence: 0,
          sources: [],
          suggested_actions: ['Contact meeting organizer'],
          evidence_ref: 'AUTH_FAILURE',
        };
      }

      // Call provider-neutral gateway for contextual analysis
      const lowerPrompt = prompt.toLowerCase();
      let taskType: 'DECISIONS' | 'ACTIONS' | 'RISKS' | 'COMMITMENTS' | 'QUESTIONS' | 'ESCALATIONS' = 'DECISIONS';

      if (lowerPrompt.includes('action') || lowerPrompt.includes('todo') || lowerPrompt.includes('owner')) {
        taskType = 'ACTIONS';
      } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('issue') || lowerPrompt.includes('concern')) {
        taskType = 'RISKS';
      } else if (lowerPrompt.includes('commit') || lowerPrompt.includes('promise')) {
        taskType = 'COMMITMENTS';
      } else if (lowerPrompt.includes('question') || lowerPrompt.includes('ask') || lowerPrompt.includes('why')) {
        taskType = 'QUESTIONS';
      } else if (lowerPrompt.includes('escalat') || lowerPrompt.includes('urgent')) {
        taskType = 'ESCALATIONS';
      }

      const { proposals, envelope } = await this.gatewayAdapter.extractIntelligenceItems(
        meetingId,
        taskType,
        authenticatedUserId,
        userTenantId,
        userRole
      );

      // Format response with proposals
      if (proposals.length === 0) {
        return {
          id: messageId,
          sender: 'COPILOT',
          text: `No ${taskType.toLowerCase()} found in the transcript matching your query. The transcript may not contain explicitly stated ${taskType.toLowerCase()}.`,
          timestamp,
          confidence: 0.7,
          sources: [`Meeting: ${meeting.title}`, `Provider: ${envelope.providerId}/${envelope.modelId}`],
          suggested_actions: ['Review transcript manually', 'Try a different query'],
          evidence_ref: envelope.envelopeId,
        };
      }

      // Build response text from proposals
      const responseText = proposals
        .map(
          (p) =>
            `${p.title}\n` +
            `  Confidence: ${p.confidence}%\n` +
            `  Evidence: "${p.evidence[0]?.quote || 'N/A'}"\n` +
            `  Status: ${p.status}`
        )
        .join('\n\n');

      return {
        id: messageId,
        sender: 'COPILOT',
        text: `Found ${proposals.length} ${taskType.toLowerCase()}:\n\n${responseText}`,
        timestamp,
        confidence: proposals.reduce((sum, p) => sum + p.confidence, 0) / proposals.length / 100,
        sources: [
          `Meeting: ${meeting.title}`,
          `Provider: ${envelope.providerId}/${envelope.modelId}`,
          `Latency: ${envelope.latencyMs}ms`,
        ],
        suggested_actions: [
          'View details',
          'Approve proposal',
          'Edit',
          'Reject',
          'Create workflow',
        ],
        evidence_ref: envelope.envelopeId,
      };
    } catch (err: any) {
      console.warn('[MeetingCopilotService] Error in contextual query:', err?.message);
      return {
        id: messageId,
        sender: 'COPILOT',
        text: `AI analysis failed: ${err?.message || 'Unknown error'}. Please try again or contact support.`,
        timestamp,
        confidence: 0,
        sources: [],
        suggested_actions: ['Retry', 'Contact support'],
        evidence_ref: 'AI_ERROR',
      };
    }
  }

  /**
   * Query without meeting context — grounded memory response (never AI-fabricated)
   * Returns database-backed meeting intelligence without calling AI
   */
  private async handleGroundedMemoryQuery(messageId: string, prompt: string, userTenantId: string, timestamp: string): Promise<CopilotMessage> {
    try {
      const lowerPrompt = prompt.toLowerCase();

      // Grounded query patterns — database only, never AI-generated
      if (lowerPrompt.includes('last meeting') || lowerPrompt.includes('previous meeting')) {
        const lastMeeting = await this.db.get<MeetingEntity>(
          `SELECT * FROM meetings WHERE tenant_id = ? ORDER BY start_time DESC LIMIT 1`,
          [userTenantId]
        );

        if (lastMeeting) {
          return {
            id: messageId,
            sender: 'COPILOT',
            text: `Last meeting: "${lastMeeting.title}" on ${lastMeeting.date} at ${lastMeeting.start_time}, chaired by ${lastMeeting.participants?.[0]?.name || 'Unknown'}. Status: ${lastMeeting.status}.`,
            timestamp,
            confidence: 0.99,
            sources: ['Meeting Ledger'],
            suggested_actions: ['View meeting', 'Review decisions', 'Review actions'],
            evidence_ref: lastMeeting.id,
          };
        }

        return {
          id: messageId,
          sender: 'COPILOT',
          text: 'No previous meetings found in your meeting ledger.',
          timestamp,
          confidence: 0.99,
          sources: ['Meeting Ledger'],
          suggested_actions: ['Create a meeting', 'Browse meeting archive'],
          evidence_ref: 'NO_DATA',
        };
      }

      if (lowerPrompt.includes('overdue') || lowerPrompt.includes('at risk')) {
        const atRiskActions = await this.db.all<any>(
          `SELECT * FROM meeting_actions WHERE tenant_id = ? AND status IN ('OVERDUE', 'AT_RISK') LIMIT 5`,
          [userTenantId]
        );

        if (atRiskActions.length > 0) {
          const summary = atRiskActions
            .map((a) => `• ${a.action_title} (${a.status}, Owner: ${a.owner}, Due: ${a.due_date})`)
            .join('\n');

          return {
            id: messageId,
            sender: 'COPILOT',
            text: `You have ${atRiskActions.length} actions at risk or overdue:\n\n${summary}`,
            timestamp,
            confidence: 0.99,
            sources: ['Action Control Ledger'],
            suggested_actions: ['Review full list', 'Update status', 'Escalate'],
            evidence_ref: 'ACTION_SUMMARY',
          };
        }

        return {
          id: messageId,
          sender: 'COPILOT',
          text: 'No overdue or at-risk actions found in your action control ledger.',
          timestamp,
          confidence: 0.99,
          sources: ['Action Control Ledger'],
          suggested_actions: ['View all actions', 'Create action'],
          evidence_ref: 'NO_DATA',
        };
      }

      // Default fallback — suggest AI configuration
      return {
        id: messageId,
        sender: 'COPILOT',
        text: `I can help with that, but I need more context. Try:\n• "What decisions were made in the last meeting?"\n• "Show my overdue actions"\n• "List risks from meeting [meeting-id]"\n\nFor advanced analysis, configure an AI provider.`,
        timestamp,
        confidence: 0.8,
        sources: ['Meeting Intelligence'],
        suggested_actions: ['Configure AI provider', 'Browse meetings', 'View actions'],
        evidence_ref: 'COPILOT_HELP',
      };
    } catch (err: any) {
      console.warn('[MeetingCopilotService] Error in grounded query:', err?.message);
      return {
        id: messageId,
        sender: 'COPILOT',
        text: 'Unable to retrieve information. Please try again.',
        timestamp,
        confidence: 0,
        sources: [],
        suggested_actions: ['Retry'],
        evidence_ref: 'ERROR',
      };
    }
  }
}
