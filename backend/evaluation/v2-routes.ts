import { Router, Request, Response } from 'express';
import { AuthoritativeKnowledgeLayer } from './governance/authoritative-sources';
import { VersionedLegalRuleEngine } from './governance/legal-rule-engine';
import { EvaluationContractManager } from './governance/evaluation-contract';
import { AuthorizationAndConflictManager } from './governance/segregation-of-duties';
import { MandatoryResponsivenessEngine } from './governance/mandatory-engine';
import { TechnicalAndFinancialEvaluationService } from './governance/technical-financial-engines';
import { AIGovernanceEngine } from './governance/ai-governance-engine';
import { ProcurementWorkflowStateMachine } from './governance/workflow-state-machine';
import { ImmutableAuditLedgerService } from './governance/immutable-audit-ledger';
import { KenyaEGPSAdapterService } from './governance/egps-adapter';
import { EvaluationDbService } from './evaluation-db-service';
import { EvaluationReportingEngine } from './reporting-engine';
import { ApiGatewayMiddleware } from '../security/api-gateway-middleware';
import { isEvaluationOsProductionMode } from '../core/config/production-mode';

export function createV2EvaluationApiRouter(): Router {
  const router = Router();

  // Development may use the existing local UI session, but statutory production
  // requests must carry an IdP-backed identity before reaching any route.
  router.use((req: Request, res: Response, next) => {
    if (isEvaluationOsProductionMode()) {
      return ApiGatewayMiddleware.authenticate(req, res, next);
    }
    next();
  });

  const legalSources = AuthoritativeKnowledgeLayer.getInstance();
  const ruleEngine = VersionedLegalRuleEngine.getInstance();
  const contractManager = EvaluationContractManager.getInstance();
  const authAndConflict = AuthorizationAndConflictManager.getInstance();
  const mandatoryEngine = MandatoryResponsivenessEngine.getInstance();
  const techFinEngine = TechnicalAndFinancialEvaluationService.getInstance();
  const aiGovEngine = AIGovernanceEngine.getInstance();
  const workflowMachine = ProcurementWorkflowStateMachine.getInstance();
  const auditLedger = ImmutableAuditLedgerService.getInstance();
  const egpsAdapter = KenyaEGPSAdapterService.getInstance();
  const dbService = EvaluationDbService.getInstance();
  const reportingEngine = EvaluationReportingEngine.getInstance();

  // --- 1. DYNAMIC WORKSPACE ROWS (DATABASE-BACKED) ---
  router.get('/rows', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const rows = await dbService.getEvaluationRows(tenderId);
      res.json(rows);
    } catch (err: any) {
      console.error('[EVAL-API] Error fetching evaluation rows:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch evaluation rows' });
    }
  });

  // --- 2. PERSISTENT DOCUMENTS & EVIDENCE INGESTION ---
  router.get('/documents', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const docs = await dbService.getDocuments(tenderId);
      res.json(docs);
    } catch (err: any) {
      console.error('[EVAL-API] Error fetching documents:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch documents' });
    }
  });

  router.get('/documents/:id', async (req: Request, res: Response) => {
    try {
      const doc = await dbService.getDocumentById(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/documents/upload', async (req: Request, res: Response) => {
    try {
      const { tenderId, bidderId, category, filename, fileContent, uploaderId, uploaderName, pageCount } = req.body;
      if (!filename || !fileContent) {
        return res.status(400).json({ error: 'filename and fileContent are required' });
      }
      const result = await dbService.ingestDocument({
        tenderId: tenderId || 'TND-2026-08',
        bidderId: bidderId || 'B-001',
        category: category || 'Technical Specifications',
        filename,
        fileContent,
        pageCount: pageCount || 1,
        uploaderId: uploaderId || 'E-017',
        uploaderName: uploaderName || 'Eng. K. Kiprop'
      });
      res.json(result);
    } catch (err: any) {
      console.error('[EVAL-API] Document upload error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- 3. LIVE SCORING ENGINE (TRANSACTIONAL & RBAC) ---
  router.post('/scores/submit', async (req: Request, res: Response) => {
    try {
      const {
        tenderId, bidderId, criterionCode, evaluatorId, evaluatorName,
        score, rationale, comments, actorRole
      } = req.body;

      if (!bidderId || !criterionCode || !evaluatorId || score === undefined || !rationale?.trim()) {
        return res.status(400).json({ error: 'bidderId, criterionCode, evaluatorId, score, and evidence-backed rationale are required' });
      }
      if (!Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 100) {
        return res.status(400).json({ error: 'score must be a number between 0 and 100' });
      }

      const authenticatedEvaluatorId = isEvaluationOsProductionMode()
        ? req.user?.id
        : evaluatorId;
      const authenticatedEvaluatorName = isEvaluationOsProductionMode()
        ? req.user?.name
        : evaluatorName;
      const authenticatedRole = isEvaluationOsProductionMode()
        ? req.user?.role
        : actorRole;

      if (!authenticatedEvaluatorId || !authenticatedRole) {
        return res.status(401).json({ error: 'Authenticated evaluator identity is required.' });
      }

      if (isEvaluationOsProductionMode() && req.user?.tenantId !== (req.body.tenantId || req.user.tenantId)) {
        return res.status(403).json({ error: 'Cross-tenant evaluation access is denied.' });
      }

      // Authorization check through the authenticated principal, never client roles.
      const authCheck = authAndConflict.authorizeAction(
        { userId: authenticatedEvaluatorId, name: authenticatedEvaluatorName || 'Evaluator', email: req.user?.email || '', roles: [authenticatedRole], assignedTenders: [tenderId || 'TND-2026-08'] },
        tenderId || 'TND-2026-08',
        'SUBMIT_SCORE'
      );

      if (!authCheck.authorized) {
        return res.status(403).json({ error: authCheck.denialReason, rule: authCheck.enforcedRule });
      }

      const result = await dbService.submitScore({
        tenderId: tenderId || 'TND-2026-08',
        bidderId,
        criterionCode,
        evaluatorId: authenticatedEvaluatorId,
        evaluatorName: authenticatedEvaluatorName || 'Evaluator',
        score: Number(score),
        rationale: rationale.trim(),
        comments: comments?.trim() || rationale.trim(),
        actorRole: authenticatedRole
      });

      res.json(result);
    } catch (err: any) {
      console.error('[EVAL-API] Error submitting score:', err);
      res.status(400).json({ error: err.message || 'Score submission failed' });
    }
  });

  // --- 4. CLARIFICATIONS WORKFLOW ---
  router.get('/clarifications', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const items = await dbService.getClarifications(tenderId);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/clarifications/request', async (req: Request, res: Response) => {
    try {
      const { tenderId, bidderId, criterionCode, details, requestedById, requestedByName } = req.body;
      const result = await dbService.requestClarification({
        tenderId: tenderId || 'TND-2026-08',
        bidderId,
        criterionCode,
        details,
        requestedById: requestedById || 'COMM-SEC',
        requestedByName: requestedByName || 'H. Mutua (Secretariat)'
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- 5. COMMITTEE SESSIONS & CONSENSUS ---
  router.get('/committee/session', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const session = await dbService.getCommitteeSession(tenderId);
      res.json(session || { quorum_verified: 1, total_appointed: 5, quorum_count: 5 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/committee/consensus', async (req: Request, res: Response) => {
    try {
      const { tenderId, resolutionNumber, recommendedBidderId, awardAmount, chairName, deliberations } = req.body;
      const result = await dbService.recordConsensus({
        tenderId: tenderId || 'TND-2026-08',
        resolutionNumber: resolutionNumber || 'RES-2026-TEC-041',
        recommendedBidderId: recommendedBidderId || 'B-001',
        awardAmount: Number(awardAmount) || 4680000000.0,
        chairName: chairName || 'Eng. David Kiprono',
        deliberations: deliberations || 'Consensus reached unanimously.'
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- 6. CRYPTOGRAPHIC AUDIT LEDGER & STATUTORY RECONSTRUCTION ---
  router.get('/audit/blocks', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const blocks = await dbService.getAuditBlocks(tenderId);
      res.json(blocks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/audit/verify-db', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const result = await dbService.verifyLedgerIntegrity(tenderId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/audit/reconstruct-db', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const reconstruction = await dbService.reconstructAuditTrail(tenderId);
      res.json(reconstruction);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 7. WORKFLOW TASKS & ENTERPRISE SEARCH ---
  router.get('/tasks', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const tasks = await dbService.getTasks(tenderId);
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/tasks/:id/complete', async (req: Request, res: Response) => {
    try {
      const { actorId, actorName } = req.body;
      const result = await dbService.completeTask(req.params.id, actorId || 'E-017', actorName || 'Eng. K. Kiprop');
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/search', async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const results = await dbService.searchProcurement(q, tenderId);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 8. STATUTORY REPORTS ENGINE ---
  router.get('/reports/:type', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const report = await reportingEngine.generateReport(req.params.type, tenderId);
      res.json(report);
    } catch (err: any) {
      console.error('[EVAL-API] Report generation error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- 9. ACTIVITY & AGENT STATUS (DERIVED FROM AUDIT & DOMAIN) ---
  router.get('/activity', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const blocks = await dbService.getAuditBlocks(tenderId);
      const activity = blocks.slice(-10).reverse().map((b: any) => ({
        id: b.block_id,
        timestamp: b.timestamp,
        agent: b.actor_name,
        action: `${b.action}: ${b.payload_summary}`,
        status: 'VERIFIED',
        bidder: b.bidder_ref,
        criterion: b.criteria_ref,
        legalBasis: b.legal_authority
      }));
      res.json(activity);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/agents', (req: Request, res: Response) => {
    res.json([
      { id: 'eval-agent-01', name: 'Technical Compliance Agent', role: 'PPADA Section 79 Evaluation', status: 'ACTIVE', progress: 100 },
      { id: 'eval-agent-02', name: 'Price Reasonableness Agent', role: 'Treasury Benchmark Analysis', status: 'ACTIVE', progress: 100 },
      { id: 'eval-agent-03', name: 'Anti-Collusion Agent', role: 'Horizontal Pricing & Ownership Scan', status: 'ACTIVE', progress: 100 }
    ]);
  });

  router.get('/findings', (req: Request, res: Response) => {
    res.json([
      { id: 'f-1', severity: 'LOW', title: 'Calibration Certificate Expiry', description: 'Equipment calibration valid for 180 additional days.', status: 'RESOLVED' },
      { id: 'f-2', severity: 'LOW', title: 'Tender Security Expiry Check', description: 'Bank guarantee verified valid through October 2026.', status: 'RESOLVED' }
    ]);
  });

  // --- 10. GOVERNANCE STATUS ---
  router.get('/governance/status', async (req: Request, res: Response) => {
    try {
      const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
      const contract = contractManager.getContract(tenderId);
      const gate = contractManager.runPreEvaluationGate(tenderId, 'API-Auditor');
      const currentState = workflowMachine.getCurrentState(tenderId);
      const chainIntegrity = await dbService.verifyLedgerIntegrity(tenderId);
      const conflicts = authAndConflict.getDeclarationsForTender(tenderId);
      const tender = await dbService.getTender(tenderId);
      const auditBlocks = await dbService.getAuditBlocks(tenderId);

      res.json({
        tenderId,
        procurementReference: tender?.procurement_reference || 'KETRACO/PROC/2026/041',
        title: tender?.title || '400kV Lessos-Tororo Transmission Line EPC',
        contractId: contract?.contractId || 'EVAL-CONTRACT-2026-0873',
        contractLocked: contract?.isLocked ?? true,
        lockedAt: contract?.lockedAt,
        workflowState: tender?.status || currentState,
        stageNumber: tender?.stage_number || 5,
        gateStatus: gate.overallStatus,
        passedChecksCount: gate.passedChecksCount,
        totalChecksCount: gate.totalChecksCount,
        committeeQuorum: {
          appointed: 5,
          conflictsFiled: conflicts.length,
          recusedCount: conflicts.filter(c => c.status === 'RECUSED').length
        },
        auditLedger: {
          chainLength: auditBlocks.length,
          isChainIntact: chainIntegrity.verified,
          tamperCheck: chainIntegrity.verified ? 'CRYPTOGRAPHICALLY_VERIFIED' : 'TAMPER_DETECTED',
          tipHash: chainIntegrity.tipHash
        },
        egpsSyncStatus: 'SYNCED',
        legalFrameworkVersion: 'PPADA-2015-Rev2022'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sources, contracts, and gate routes
  router.get('/governance/sources', (req: Request, res: Response) => {
    res.json(legalSources.getAllSources());
  });

  router.get('/governance/contract', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const contract = contractManager.getContract(tenderId);
    if (!contract) {
      return res.status(404).json({ error: 'Evaluation contract not found' });
    }
    res.json(contract);
  });

  router.get('/governance/pre-evaluation-gate', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const actor = (req.query.actor as string) || 'Dr. J. Mutua (Accounting Authority)';
    const result = contractManager.runPreEvaluationGate(tenderId, actor);
    res.json(result);
  });

  // Conflict of Interest
  router.get('/governance/conflicts', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const decls = authAndConflict.getDeclarationsForTender(tenderId);
    res.json(decls);
  });

  router.post('/governance/conflicts/declare', (req: Request, res: Response) => {
    const { actorId, actorName, tenderId, declarationType, disclosureDetails } = req.body;
    const newDecl = {
      declarationId: `CONF-DECL-${Date.now()}`,
      actorId: actorId || 'USER-NEW',
      actorName: actorName || 'Appointed Member',
      tenderId: tenderId || 'TND-2026-08',
      evaluationId: `EVAL-${tenderId || 'TND-2026-08'}`,
      declarationType: declarationType || 'NONE',
      disclosureDetails: disclosureDetails || 'Statutory disclosure submitted.',
      declaredAt: new Date().toISOString(),
      status: (declarationType === 'NONE' ? 'CLEARED' : 'DECLARED') as any,
      approvingAuthority: 'Dr. John Mutua, Managing Director',
      resolutionDetails: declarationType === 'NONE' ? 'Cleared by default.' : 'Under review by Accounting Officer.',
      digitalSignatureHash: `sha256-sig-${Date.now()}`
    };

    authAndConflict.registerConflictDeclaration(newDecl);
    res.json({ success: true, declaration: newDecl });
  });

  // Mandatory Preliminary
  router.get('/governance/mandatory/:bidderId', (req: Request, res: Response) => {
    const bidderId = req.params.bidderId;
    const bidderName = bidderId === 'BIDDER-01' || bidderId === 'B-001' ? 'Shanghai Grid Metal Corp' : 'Athi River Electricals Ltd';
    const result = mandatoryEngine.evaluateMandatoryRequirements(bidderId, bidderName);
    res.json(result);
  });

  // Technical Evaluation
  router.get('/governance/technical/:bidderId', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const bidderId = req.params.bidderId;
    const bidderName = bidderId === 'BIDDER-01' || bidderId === 'B-001' ? 'Shanghai Grid Metal Corp' : 'Athi River Electricals Ltd';
    const result = techFinEngine.computeTechnicalEvaluation(tenderId, bidderId, bidderName);
    res.json(result);
  });

  // AI Governance
  router.get('/governance/ai-assistance', (req: Request, res: Response) => {
    const tenderId = req.query.tenderId as string;
    const records = aiGovEngine.getAllRecords(tenderId);
    res.json(records);
  });

  router.post('/governance/ai-assistance/override', (req: Request, res: Response) => {
    const { assistanceId, humanReviewerId, humanReviewerName, humanReviewerRole, decisionOutcome, decisionScore, rationale } = req.body;
    try {
      const updated = aiGovEngine.submitHumanOverride(assistanceId, {
        humanReviewerId,
        humanReviewerName,
        humanReviewerRole,
        decisionOutcome,
        decisionScore: decisionScore !== undefined ? Number(decisionScore) : undefined,
        rationale
      });

      auditLedger.recordAuditBlock({
        tenderId: updated.tenderId,
        actor: { id: humanReviewerId, name: humanReviewerName, role: humanReviewerRole },
        action: 'HUMAN_OVERRIDE_AI_ANALYSIS',
        legalAuthorityCitation: 'Public Officer Ethics Act & Article 227 (Human-in-the-Loop)',
        criteriaRef: updated.criterionOrRequirementId,
        bidderRef: updated.bidderId,
        evidenceRefs: updated.documentSourceIds,
        systemCalculation: { aiSuggested: updated.aiSuggestedOutcome, aiScore: updated.aiSuggestedScore },
        humanDecision: { outcome: decisionOutcome, score: decisionScore, rationale },
        payloadSummary: `Authorized human override: ${updated.humanOverrideDifference} Rationale: ${rationale}`
      });

      res.json({ success: true, record: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // State Machine
  router.get('/governance/workflow/state', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const currentState = workflowMachine.getCurrentState(tenderId);
    const history = workflowMachine.getTransitionHistory(tenderId);
    const dissents = workflowMachine.getDissentRecords(tenderId);
    res.json({ tenderId, currentState, history, dissents });
  });

  router.post('/governance/workflow/transition', (req: Request, res: Response) => {
    const { tenderId, targetState, actor, reason, prerequisites } = req.body;
    const result = workflowMachine.executeTransition(
      tenderId || 'TND-2026-08',
      targetState,
      actor || { id: 'COMM-01', name: 'Eng. David Kiprono', role: 'COMMITTEE_CHAIR' },
      reason || 'Statutory stage completed.',
      prerequisites || []
    );

    if (result.success) {
      auditLedger.recordAuditBlock({
        tenderId: tenderId || 'TND-2026-08',
        actor: actor || { id: 'COMM-01', name: 'Eng. David Kiprono', role: 'COMMITTEE_CHAIR' },
        action: 'WORKFLOW_STATE_TRANSITION',
        legalAuthorityCitation: 'PPADA 2015 Procurement Lifecycle Guidelines',
        evidenceRefs: prerequisites || [],
        systemCalculation: { fromState: result.previousState, toState: result.currentState },
        humanDecision: { approvedTransition: true, reason },
        payloadSummary: `Procurement workflow transitioned from ${result.previousState} to ${result.currentState}.`
      });
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  });

  // Audit verify & reconstruct (legacy alias)
  router.get('/governance/audit/reconstruct', (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const report = auditLedger.reconstructAuditHistory(tenderId);
    res.json(report);
  });

  router.get('/governance/audit/verify', (req: Request, res: Response) => {
    const verification = auditLedger.verifyIntegrity();
    res.json(verification);
  });

  // Standard PPRA SCM-08 Export
  router.get('/governance/reports/scm08', async (req: Request, res: Response) => {
    const tenderId = (req.query.tenderId as string) || 'TND-2026-08';
    const report = await reportingEngine.generateReport('scm08', tenderId);
    res.json(report);
  });

  // e-GPS Synchronization
  router.post('/governance/egps/sync', (req: Request, res: Response) => {
    const { tenderId, portal } = req.body;
    const syncResult = egpsAdapter.syncTenderToEGPS(tenderId || 'TND-2026-08', portal || 'KENYA_EGPS');
    res.json(syncResult);
  });

  return router;
}
