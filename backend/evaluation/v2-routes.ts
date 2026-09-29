import { Router, Request, Response } from 'express';
import { AuthoritativeKnowledgeLayer } from './governance/authoritative-sources';
import { EvaluationDbService } from './evaluation-db-service';
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
  const dbService = EvaluationDbService.getInstance();
  // --- 1. DYNAMIC WORKSPACE ROWS (DATABASE-BACKED) ---
  router.get('/rows', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
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
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
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
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Evaluation evidence upload is unavailable until authenticated uploader identity and versioned object storage are configured.'
    });
  });

  // --- 3. LIVE SCORING ENGINE (TRANSACTIONAL & RBAC) ---
  router.post('/scores/submit', (_req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Score submission is unavailable until authenticated evaluator assignments and policy authorization are connected.'
    });
  });

  // --- 4. CLARIFICATIONS WORKFLOW ---
  router.get('/clarifications', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const items = await dbService.getClarifications(tenderId);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/clarifications/request', async (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Clarification commands require authenticated actor identity and a configured tender-specific workflow.'
    });
  });

  // --- 5. COMMITTEE SESSIONS & CONSENSUS ---
  router.get('/committee/session', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const session = await dbService.getCommitteeSession(tenderId);
      if (!session) {
        return res.status(404).json({ error: `No committee session exists for tender ${tenderId}.` });
      }
      res.json(session);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/committee/consensus', async (req: Request, res: Response) => {
    try {
      const { tenderId, resolutionNumber, recommendedBidderId, awardAmount, chairName, deliberations } = req.body;
      if (!tenderId) {
        return res.status(400).json({ error: 'tenderId is required' });
      }
      if (!resolutionNumber || !recommendedBidderId || typeof awardAmount === 'undefined' || !chairName || !deliberations) {
        return res.status(400).json({ error: 'resolutionNumber, recommendedBidderId, awardAmount, chairName, and deliberations are required.' });
      }
      const result = await dbService.recordConsensus({
        tenderId,
        resolutionNumber,
        recommendedBidderId,
        awardAmount: Number(awardAmount),
        chairName,
        deliberations
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- 6. CRYPTOGRAPHIC AUDIT LEDGER & STATUTORY RECONSTRUCTION ---
  router.get('/audit/blocks', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const blocks = await dbService.getAuditBlocks(tenderId);
      res.json(blocks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/audit/verify-db', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const result = await dbService.verifyLedgerIntegrity(tenderId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/audit/reconstruct-db', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const reconstruction = await dbService.reconstructAuditTrail(tenderId);
      res.json(reconstruction);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 7. WORKFLOW TASKS & ENTERPRISE SEARCH ---
  router.get('/tasks', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const tasks = await dbService.getTasks(tenderId);
      res.json(tasks);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/tasks/:id/complete', (_req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Task completion requires authenticated actor identity, assignment checks, and an audit event.'
    });
  });

  router.get('/search', async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || '';
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const results = await dbService.searchProcurement(q, tenderId);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 8. STATUTORY REPORTS ENGINE ---
  router.get('/reports/:type', async (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Evaluation reports are unavailable until report content is derived exclusively from authoritative evaluation records.'
    });
  });

  // --- 9. ACTIVITY & AGENT STATUS (DERIVED FROM AUDIT & DOMAIN) ---
  router.get('/activity', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
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
    res.status(501).json({ error: 'Persisted evaluation agent assignments are not implemented.' });
  });

  router.get('/findings', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Persisted evaluation findings are not implemented.' });
  });

  // --- 10. GOVERNANCE STATUS ---
  router.get('/governance/status', async (req: Request, res: Response) => {
    try {
      const tenderId = req.query.tenderId as string;
      if (!tenderId) return res.status(400).json({ error: 'tenderId is required' });
      const tender = await dbService.getTender(tenderId);
      if (!tender) return res.status(404).json({ error: 'Tender not found' });
      const chainIntegrity = await dbService.verifyLedgerIntegrity(tenderId);
      const auditBlocks = await dbService.getAuditBlocks(tenderId);

      res.json({
        tenderId,
        procurementReference: tender.procurement_reference,
        title: tender.title,
        workflowState: tender.status,
        stageNumber: tender.stage_number,
        evaluationPlanStatus: 'NOT_CONFIGURED',
        committeeQuorum: null,
        auditLedger: {
          chainLength: auditBlocks.length,
          isChainIntact: chainIntegrity.verified,
          tamperCheck: chainIntegrity.verified ? 'CRYPTOGRAPHICALLY_VERIFIED' : 'TAMPER_DETECTED',
          tipHash: chainIntegrity.tipHash
        },
        egpsSyncStatus: 'NOT_CONFIGURED'
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
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'The in-memory evaluation contract is not an authoritative persisted tender version.'
    });
  });

  router.get('/governance/pre-evaluation-gate', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'The pre-evaluation gate is not connected to a persisted approved evaluation plan.'
    });
  });

  // Conflict of Interest
  router.get('/governance/conflicts', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Conflict declarations are not yet served from the persisted evaluation record.'
    });
  });

  router.post('/governance/conflicts/declare', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Conflict declaration persistence and authenticated actor verification are not implemented.'
    });
  });

  // Mandatory Preliminary
  router.get('/governance/mandatory/:bidderId', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Preliminary results are unavailable until requirements and verified evidence are loaded from the selected tender.'
    });
  });

  // Technical Evaluation
  router.get('/governance/technical/:bidderId', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Technical scoring is unavailable until tender-specific criteria, assignments, and evidence are authoritative.'
    });
  });

  // AI Governance
  router.get('/governance/ai-assistance', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Source-linked AI assistance records are not persisted for this evaluation.'
    });
  });

  router.post('/governance/ai-assistance/override', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'AI review overrides require persisted source evidence, authenticated reviewer authorization, and audit versioning.'
    });
  });

  // State Machine
  router.get('/governance/workflow/state', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'The in-memory lifecycle is not authoritative; a persisted tender-specific workflow is not configured.'
    });
  });

  router.post('/governance/workflow/transition', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'Workflow transitions require a persisted tender-specific plan, policy decision, and authenticated actor.'
    });
  });

  // Audit verify & reconstruct (legacy alias)
  router.get('/governance/audit/reconstruct', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'The legacy in-memory audit reconstruction is not an authoritative audit history.'
    });
  });

  router.get('/governance/audit/verify', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'The legacy in-memory audit ledger is not the authoritative persisted audit chain.'
    });
  });

  // Standard PPRA SCM-08 Export
  router.get('/governance/reports/scm08', async (req: Request, res: Response) => {
    res.status(503).json({
      status: 'UNAVAILABLE',
      error: 'SCM-08 report generation is unavailable until the report is built exclusively from authoritative evaluation records.'
    });
  });

  // External reporting remains unavailable until an authorized connector is configured.
  router.post('/governance/egps/sync', (req: Request, res: Response) => {
    res.status(503).json({
      status: 'NOT_CONFIGURED',
      error: 'No authorized e-GPS connector is configured; no external submission was attempted.'
    });
  });

  return router;
}
