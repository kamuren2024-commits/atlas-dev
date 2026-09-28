/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Mission Engine API Routes
 * 
 * REST endpoints for mission control, orchestration, and decision-making
 */

import { Router, Request, Response } from 'express';
import { GridMissionEngine } from './mission-engine';
import { GridAgentOrchestrator } from './orchestrator';
import { RootCauseEngine, RecommendationEngine } from './analysis-engines';
import { CausalGraphEngine } from './causal-graph';
import { ScenarioEngine } from './scenarios';
import { ApprovalWorkflow, ApprovalGateManager } from './approvals';
import { MissionMemory } from './mission-memory';
import { GridPlaybooksLibrary } from './playbooks';

const router = Router();

const missionEngine = GridMissionEngine.getInstance();
const agentOrchestrator = GridAgentOrchestrator.getInstance();
const rootCauseEngine = RootCauseEngine.getInstance();
const recommendationEngine = RecommendationEngine.getInstance();
const causalGraphEngine = CausalGraphEngine.getInstance();
const scenarioEngine = ScenarioEngine.getInstance();
const approvalWorkflow = ApprovalWorkflow.getInstance();
const approvalGateManager = ApprovalGateManager.getInstance();
const missionMemory = MissionMemory.getInstance();
const playbooksLibrary = GridPlaybooksLibrary.getInstance();

/**
 * POST /missions
 * Create mission from event
 */
router.post('/missions', (req: Request, res: Response) => {
  try {
    const { event } = req.body;

    const mission = missionEngine.createMissionFromEvent(event);

    return res.status(201).json({
      success: true,
      mission,
    });
  } catch (error) {
    console.error('[MISSION-API] Error creating mission:', error);
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /missions/:missionId
 * Get mission details
 */
router.get('/missions/:missionId', (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = missionEngine.getMission(missionId);

    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    return res.status(200).json({
      success: true,
      mission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /missions
 * List all missions
 */
router.get('/missions', (req: Request, res: Response) => {
  try {
    const missions = missionEngine.listMissions();

    return res.status(200).json({
      success: true,
      missions,
      count: missions.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /missions/:missionId/orchestrate
 * Start multi-agent investigation
 */
router.post('/missions/:missionId/orchestrate', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = missionEngine.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    const consensus = await agentOrchestrator.orchestrateMission(mission);

    return res.status(200).json({
      success: true,
      consensus,
    });
  } catch (error) {
    console.error('[MISSION-API] Orchestration error:', error);
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /missions/:missionId/analyze-root-cause
 * Analyze root cause
 */
router.post('/missions/:missionId/analyze-root-cause', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = missionEngine.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    const analysis = await rootCauseEngine.analyze(mission);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /missions/:missionId/generate-recommendations
 * Generate recommendations
 */
router.post(
  '/missions/:missionId/generate-recommendations',
  async (req: Request, res: Response) => {
    try {
      const { missionId } = req.params;

      const mission = missionEngine.getMission(missionId);
      if (!mission) {
        return res.status(404).json({
          success: false,
          error: 'Mission not found',
        });
      }

      const recommendations = await recommendationEngine.generateRecommendations(mission);

      return res.status(200).json({
        success: true,
        recommendations,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  }
);

/**
 * POST /missions/:missionId/causal-graph
 * Build causal graph
 */
router.post('/missions/:missionId/causal-graph', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const { rootCause, recommendation } = req.body;

    const mission = missionEngine.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    const graph = causalGraphEngine.buildGraph(mission, rootCause, recommendation);
    const explanation = causalGraphEngine.explainCausalChain(graph);

    return res.status(200).json({
      success: true,
      graph,
      explanation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /missions/:missionId/causal-graph
 * Get causal graph
 */
router.get('/missions/:missionId/causal-graph', (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const graph = causalGraphEngine.getGraph(missionId);

    if (!graph) {
      return res.status(404).json({
        success: false,
        error: 'Causal graph not found',
      });
    }

    return res.status(200).json({
      success: true,
      graph,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /missions/:missionId/scenarios
 * Generate scenarios
 */
router.post('/missions/:missionId/scenarios', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = missionEngine.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    const comparison = await scenarioEngine.generateScenarios(mission);

    return res.status(200).json({
      success: true,
      comparison,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /missions/:missionId/approval
 * Start approval workflow
 */
router.post('/missions/:missionId/approval', async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;

    const mission = missionEngine.getMission(missionId);
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found',
      });
    }

    const gate = await approvalWorkflow.startWorkflow(mission);

    return res.status(200).json({
      success: true,
      gate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * POST /approval-gates/:gateId/decide
 * Submit approval decision
 */
router.post('/approval-gates/:gateId/decide', async (req: Request, res: Response) => {
  try {
    const { gateId } = req.params;
    const { userId, userRole, decision, reason } = req.body;

    const result = await approvalGateManager.submitDecision(
      gateId,
      userId,
      userRole,
      decision,
      reason
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      gate: result.gate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /approval-gates/:gateId
 * Get approval gate status
 */
router.get('/approval-gates/:gateId', (req: Request, res: Response) => {
  try {
    const { gateId } = req.params;

    const gate = approvalGateManager.getGate(gateId);

    if (!gate) {
      return res.status(404).json({
        success: false,
        error: 'Approval gate not found',
      });
    }

    const approvals = approvalGateManager.getApprovals(gateId);

    return res.status(200).json({
      success: true,
      gate,
      approvals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /playbooks
 * List all playbooks
 */
router.get('/playbooks', (req: Request, res: Response) => {
  try {
    const playbooks = playbooksLibrary.listPlaybooks();

    return res.status(200).json({
      success: true,
      playbooks,
      count: playbooks.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /playbooks/:playbookId
 * Get playbook
 */
router.get('/playbooks/:playbookId', (req: Request, res: Response) => {
  try {
    const { playbookId } = req.params;

    const playbook = playbooksLibrary.getPlaybook(playbookId);

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: 'Playbook not found',
      });
    }

    return res.status(200).json({
      success: true,
      playbook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /playbooks/recommend/:missionType
 * Get recommended playbook
 */
router.get('/playbooks/recommend/:missionType', (req: Request, res: Response) => {
  try {
    const { missionType } = req.params;

    const playbook = playbooksLibrary.recommendPlaybook(missionType);

    if (!playbook) {
      return res.status(404).json({
        success: false,
        error: 'No playbook recommended',
      });
    }

    return res.status(200).json({
      success: true,
      playbook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /mission-memory/similar
 * Find similar missions
 */
router.get('/mission-memory/similar', (req: Request, res: Response) => {
  try {
    const { missionType, severity, assetId } = req.query;

    const similar = missionMemory.findSimilarMissions(
      String(missionType),
      severity ? String(severity) : undefined,
      assetId ? String(assetId) : undefined
    );

    return res.status(200).json({
      success: true,
      similar,
      count: similar.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * GET /mission-memory/patterns/:missionType
 * Get pattern matches
 */
router.get('/mission-memory/patterns/:missionType', (req: Request, res: Response) => {
  try {
    const { missionType } = req.params;

    const patterns = missionMemory.getPatternMatches(missionType);
    const metrics = missionMemory.getSuccessMetrics(missionType);

    return res.status(200).json({
      success: true,
      patterns,
      metrics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

export default router;
