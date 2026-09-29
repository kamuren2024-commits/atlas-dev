/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: SEGREGATION OF DUTIES & CONFLICT-OF-INTEREST CONTROLS
 * 
 * Directives:
 * - Directive 6: Segregation of Duties (Enforceable separation of procurement powers)
 * - Directive 7: Conflict-of-Interest Controls (Mandatory disclosures & recusal enforcement)
 */

export type ProcurementRole = 
  | 'PROCUREMENT_SECRETARIAT'
  | 'EVALUATOR'
  | 'COMMITTEE_CHAIR'
  | 'COMMITTEE_MEMBER'
  | 'TECHNICAL_REVIEWER'
  | 'FINANCE_REVIEWER'
  | 'HEAD_OF_PROCUREMENT'
  | 'ACCOUNTING_OFFICER'
  | 'AUDITOR';

export interface ConflictDeclarationRecord {
  declarationId: string;
  actorId: string;
  actorName: string;
  tenderId: string;
  evaluationId: string;
  declarationType: 'NONE' | 'DIRECT_PECUNIARY' | 'INDIRECT_FAMILY' | 'PREVIOUS_EMPLOYMENT' | 'ADVISORY_ASSOCIATION';
  disclosureDetails: string;
  declaredAt: string;
  status: 'DECLARED' | 'CLEARED' | 'RECUSED' | 'OVERRIDDEN';
  approvingAuthority: string;
  resolutionDetails: string;
  resolutionTimestamp?: string;
  digitalSignatureHash: string;
}

export interface UserContext {
  userId: string;
  name: string;
  email: string;
  roles: ProcurementRole[];
  assignedTenders: string[];
  isTenderOpeningCommitteeMember?: boolean;
  isInspectionAcceptanceMember?: boolean;
}

export class AuthorizationAndConflictManager {
  private static instance: AuthorizationAndConflictManager;
  private conflicts: Map<string, ConflictDeclarationRecord[]> = new Map(); // tenderId -> declarations

  private constructor() {
    // Conflict declarations are authoritative only when they are persisted for an actual tender.
  }

  public static getInstance(): AuthorizationAndConflictManager {
    if (!AuthorizationAndConflictManager.instance) {
      AuthorizationAndConflictManager.instance = new AuthorizationAndConflictManager();
    }
    return AuthorizationAndConflictManager.instance;
  }

  public getDeclarationsForTender(tenderId: string): ConflictDeclarationRecord[] {
    return this.conflicts.get(tenderId) || [];
  }

  public registerConflictDeclaration(record: ConflictDeclarationRecord): void {
    const list = this.conflicts.get(record.tenderId) || [];
    list.push(record);
    this.conflicts.set(record.tenderId, list);
  }

  /**
   * Check whether an actor has a disqualifying conflict for a tender
   */
  public hasDisqualifyingConflict(actorId: string, tenderId: string): { isConflicted: boolean; reason?: string } {
    const decls = this.getDeclarationsForTender(tenderId);
    const actorDecl = decls.find(d => d.actorId === actorId);

    if (!actorDecl) {
      return {
        isConflicted: true,
        reason: 'No statutory conflict of interest declaration registered. Declarations are mandatory prior to any evaluation.'
      };
    }

    if (actorDecl.status === 'RECUSED') {
      return {
        isConflicted: true,
        reason: `Actor has been formally recused from this tender under PPADA Section 66: ${actorDecl.resolutionDetails}`
      };
    }

    if (actorDecl.status === 'DECLARED' && actorDecl.declarationType !== 'NONE') {
      return {
        isConflicted: true,
        reason: 'Conflict of interest declared and pending review by Accounting Officer. Evaluation actions blocked.'
      };
    }

    return { isConflicted: false };
  }

  /**
   * Authoritative Segregation of Duties Check
   */
  public authorizeAction(
    user: UserContext,
    tenderId: string,
    action: string
  ): {
    authorized: boolean;
    denialReason?: string;
    enforcedRule?: string;
  } {
    // 1. Auditor is strictly read-only
    if (user.roles.includes('AUDITOR')) {
      const readActions = ['VIEW_DASHBOARD', 'VIEW_EVIDENCE', 'VIEW_SCORES', 'VIEW_AUDIT_LOG', 'EXPORT_REPORT'];
      if (!readActions.includes(action)) {
        return {
          authorized: false,
          denialReason: 'Auditors possess strictly read-only inspection authority under Kenyan public audit standards.',
          enforcedRule: 'SEGREGATION_OF_DUTIES_AUDITOR_READONLY'
        };
      }
      return { authorized: true };
    }

    // 2. Check for conflict of interest recusal
    const conflictCheck = this.hasDisqualifyingConflict(user.userId, tenderId);
    const conflictRestrictedActions = ['SUBMIT_SCORE', 'APPROVE_EVALUATION', 'OVERRIDE_SCORE', 'CAST_CONSENSUS_VOTE'];
    if (conflictCheck.isConflicted && conflictRestrictedActions.includes(action)) {
      return {
        authorized: false,
        denialReason: conflictCheck.reason,
        enforcedRule: 'PPADA_SECTION_66_CONFLICT_OF_INTEREST'
      };
    }

    // 3. Section 66(3): Tender Opening Committee member CANNOT evaluate
    if (user.isTenderOpeningCommitteeMember && ['SUBMIT_SCORE', 'COMMITTEE_DELIBERATE', 'APPROVE_EVALUATION'].includes(action)) {
      return {
        authorized: false,
        denialReason: 'Under PPADA Section 66(3), a member of the tender opening committee shall not be a member of the evaluation committee.',
        enforcedRule: 'PPADA_SECTION_66_3_SEGREGATION'
      };
    }

    // 4. Accounting Officer CANNOT be an evaluator
    if (user.roles.includes('ACCOUNTING_OFFICER') && action === 'SUBMIT_SCORE') {
      return {
        authorized: false,
        denialReason: 'Accounting Officer exercises statutory approval authority and cannot score individual tender criteria.',
        enforcedRule: 'PPADA_SECTION_46_ACCOUNTING_OFFICER_SEGREGATION'
      };
    }

    // 5. Procurement Secretariat prepares documents and runs gate, does NOT score
    if (user.roles.includes('PROCUREMENT_SECRETARIAT') && action === 'SUBMIT_SCORE') {
      return {
        authorized: false,
        denialReason: 'Procurement Secretariat manages intake and administration; scoring is reserved exclusively for appointed evaluation committee.',
        enforcedRule: 'PPADR_REGULATION_77_SECRETARIAT_SEPARATION'
      };
    }

    // 6. Action-specific role requirements
    if (action === 'SUBMIT_SCORE' && !user.roles.some(r => ['EVALUATOR', 'COMMITTEE_CHAIR', 'COMMITTEE_MEMBER'].includes(r))) {
      return {
        authorized: false,
        denialReason: 'Only appointed evaluation committee members are authorized to score bids.',
        enforcedRule: 'EVALUATOR_ROLE_MANDATE'
      };
    }

    if (action === 'SIGN_FINAL_REPORT' && !user.roles.includes('COMMITTEE_CHAIR') && !user.roles.includes('COMMITTEE_MEMBER')) {
      return {
        authorized: false,
        denialReason: 'Only appointed evaluation committee members may sign the statutory SCM-08 report.',
        enforcedRule: 'PPADA_SECTION_84_COMMITTEE_SIGNATURE'
      };
    }

    if (action === 'AWARD_CONTRACT' && !user.roles.includes('ACCOUNTING_OFFICER')) {
      return {
        authorized: false,
        denialReason: 'Contract award recommendation can only be approved by the designated Accounting Officer.',
        enforcedRule: 'PPADA_SECTION_87_ACCOUNTING_OFFICER_AWARD'
      };
    }

    return { authorized: true };
  }
}
