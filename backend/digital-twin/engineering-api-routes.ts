import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseCore } from '../database/db-core';
import { ApiGatewayMiddleware } from '../security/api-gateway-middleware';
import { AuthorizationService } from '../security/authorization-service';
import { ObservabilityEngine } from '../../platform/observability/Observability';
import {
  EngineeringSourceError,
  UnavailableEngineeringSimulationProvider,
  UnavailableGridStateProvider,
  UnavailableTopologyProvider,
} from './engineering-providers';
import {
  EngineeringServiceError,
  EngineeringScenarioService,
} from './engineering-scenario-service';
import {
  EngineeringAnalysisCapability,
  EngineeringSimulationProvider,
  GridStateProvider,
  ScenarioClass,
  ScenarioChange,
  TopologyProvider,
} from './engineering-contracts';

export interface EngineeringApiRouterOptions {
  db?: DatabaseCore;
  authz: AuthorizationService;
  gridStateProvider?: GridStateProvider;
  topologyProvider?: TopologyProvider;
  simulationProvider?: EngineeringSimulationProvider;
}

interface RequestIdentity {
  id: string;
  role: string;
  tenantId: string;
}

function getIdentity(req: Request): RequestIdentity | undefined {
  const user = req.user;
  if (!user?.id || !user.tenantId || !user.role) return undefined;
  return { id: user.id, role: user.role, tenantId: user.tenantId };
}

function getCorrelationId(req: Request, res: Response): string {
  const supplied = req.get('x-correlation-id');
  const correlationId = supplied && supplied.length <= 128 && /^[a-zA-Z0-9._:-]+$/.test(supplied)
    ? supplied
    : uuidv4();
  res.setHeader('x-correlation-id', correlationId);
  return correlationId;
}

function bodyRecord(req: Request): Record<string, unknown> {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', 'Request body must be a JSON object.');
  }
  return req.body as Record<string, unknown>;
}

function strings(value: unknown, field: string, fallback?: string[]): string[] {
  if (value === undefined && fallback) return fallback;
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', `${field} must be an array of strings.`);
  }
  return value as string[];
}

function changes(value: unknown): ScenarioChange[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', 'changes must be an array.');
  }
  return value as ScenarioChange[];
}

const SCENARIO_CLASSES = new Set<ScenarioClass>([
  'BASELINE',
  'OUTAGE',
  'N_MINUS_1',
  'N_MINUS_2',
  'GENERATION_LOSS',
  'TRANSMISSION_FAILURE',
  'SUBSTATION_FAILURE',
  'TRANSFORMER_FAILURE',
  'WEATHER_EVENT',
  'COMMUNICATION_FAILURE',
  'CUSTOM',
]);
const ANALYSIS_CAPABILITIES: readonly EngineeringAnalysisCapability[] = [
  'CONTINGENCY_ANALYSIS',
  'POWER_FLOW',
  'DYNAMIC_SIMULATION',
  'RESTORATION_ANALYSIS',
  'CUSTOM_SCENARIO_ANALYSIS',
];

function analysisCapabilities(value: unknown, field: string): EngineeringAnalysisCapability[] {
  const requested = strings(value, field, []);
  return requested.map(item => {
    const supported = ANALYSIS_CAPABILITIES.find(capability => capability === item);
    if (!supported) {
      throw new EngineeringServiceError(400, 'INVALID_ANALYSIS', `${field} contains an unsupported capability.`);
    }
    return supported;
  });
}

function asyncRoute(
  operation: string,
  handler: (req: Request, res: Response) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    const identity = getIdentity(req);
    const span = ObservabilityEngine.startSpan(operation, 'grid-engineering', {
      tenantId: identity?.tenantId,
      scenarioId: req.params.scenarioId,
      simulationRunId: req.params.runId,
    }, undefined, String(res.getHeader('x-correlation-id') ?? ''));
    void handler(req, res).then(() => {
      if (res.statusCode >= 500) {
        ObservabilityEngine.endSpan(span.spanId, 'error', `HTTP ${res.statusCode}`);
      } else {
        ObservabilityEngine.endSpan(span.spanId, 'success');
      }
    }).catch(error => {
      ObservabilityEngine.endSpan(
        span.spanId,
        'error',
        error instanceof Error ? error.message : 'Engineering operation failed.'
      );
      next(error);
    });
  };
}

function sendError(error: unknown, req: Request, res: Response): void {
  const correlationId = String(res.getHeader('x-correlation-id') ?? '');
  if (error instanceof EngineeringServiceError) {
    res.status(error.statusCode).json({
      ok: false,
      error: { code: error.code, message: error.message },
      correlationId,
    });
    return;
  }
  if (error instanceof EngineeringSourceError) {
    res.status(503).json({
      ok: false,
      error: { code: error.code, message: error.message },
      correlationId,
    });
    return;
  }
  console.error('[GRID-ENGINEERING] Request failed', {
    path: req.path,
    correlationId,
    error,
  });
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Engineering request failed.' },
    correlationId,
  });
}

export function createEngineeringApiRouter(options: EngineeringApiRouterOptions): Router {
  const router = Router();
  const service = new EngineeringScenarioService({
    db: options.db,
    gridStateProvider: options.gridStateProvider ?? new UnavailableGridStateProvider(),
    topologyProvider: options.topologyProvider ?? new UnavailableTopologyProvider(),
    simulationProvider: options.simulationProvider ?? new UnavailableEngineeringSimulationProvider(),
  });

  router.use((req, res, next) => {
    getCorrelationId(req, res);
    next();
  });
  const authenticate: RequestHandler = (req, res, next) => {
    const span = ObservabilityEngine.startSpan('request.authenticate', 'grid-engineering', {
      path: req.path,
    }, undefined, String(res.getHeader('x-correlation-id') ?? ''));
    let spanClosed = false;
    const finish = (status: 'success' | 'error', message?: string) => {
      if (spanClosed) return;
      spanClosed = true;
      ObservabilityEngine.endSpan(span.spanId, status, message);
    };
    ApiGatewayMiddleware.authenticate(req, res, error => {
      if (error) {
        finish('error', error instanceof Error ? error.message : 'Authentication failed.');
        next(error);
        return;
      }
      finish('success');
      next();
    }).then(() => {
      if (res.headersSent && res.statusCode >= 400) {
        finish('error', `HTTP ${res.statusCode}`);
      }
    }).catch(error => {
      finish('error', error instanceof Error ? error.message : 'Authentication failed.');
      next(error);
    });
  };
  router.use(authenticate);

  const authorize = (action: 'read' | 'create' | 'update' | 'admin'): RequestHandler =>
    (req, res, next) => {
      const identity = getIdentity(req);
      if (!identity) {
        res.status(401).json({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Authenticated Atlas identity is required.' },
          correlationId: String(res.getHeader('x-correlation-id') ?? ''),
        });
        return;
      }
      const bodyTenant = req.body && typeof req.body === 'object' ? req.body.tenantId : undefined;
      const queryTenant = req.query.tenantId;
      const requestedTenant = typeof bodyTenant === 'string' ? bodyTenant : queryTenant;
      const scenarioId = req.params.scenarioId ?? req.params.runId ?? 'collection';
      const authzSpan = ObservabilityEngine.startSpan('authorization.evaluate', 'grid-engineering', {
        tenantId: identity.tenantId,
        scenarioId,
        action,
      }, undefined, String(res.getHeader('x-correlation-id') ?? ''));
      let isAuthorized: boolean;
      try {
        isAuthorized = requestedTenant !== undefined && requestedTenant !== identity.tenantId
          ? false
          : options.authz.evaluate(identity, action, 'grid_engineering', {
            tenantId: identity.tenantId,
            scenarioId,
          }).isAuthorized;
      } catch (error) {
        ObservabilityEngine.endSpan(
          authzSpan.spanId,
          'error',
          error instanceof Error ? error.message : 'Authorization evaluation failed.'
        );
        next(error);
        return;
      }
      if (!isAuthorized) {
        ObservabilityEngine.endSpan(authzSpan.spanId, 'error', 'Authorization denied.');
        void service.recordAuthorizationDenied({
          tenantId: identity.tenantId,
          actorId: identity.id,
          actorRole: identity.role,
          correlationId: String(res.getHeader('x-correlation-id') ?? ''),
          resourceId: scenarioId,
          details: `Denied ${action} access to ${req.method} ${req.path}.`,
        }).then(() => {
          res.status(403).json({
            ok: false,
            error: { code: 'FORBIDDEN', message: 'Engineering permission denied.' },
            correlationId: String(res.getHeader('x-correlation-id') ?? ''),
          });
        }).catch(error => {
          const auditSpan = ObservabilityEngine.startSpan('authorization.audit.failure', 'grid-engineering', {
            tenantId: identity.tenantId,
            scenarioId,
          }, undefined, String(res.getHeader('x-correlation-id') ?? ''));
          ObservabilityEngine.endSpan(
            auditSpan.spanId,
            'error',
            error instanceof Error ? error.message : 'Authorization denial audit failed.'
          );
          next(error);
        });
        return;
      }
      ObservabilityEngine.endSpan(authzSpan.spanId, 'success');
      next();
    };

  router.post('/scenarios', authorize('create'), asyncRoute('scenario.create', async (req, res) => {
    const identity = getIdentity(req)!;
    const body = bodyRecord(req);
    if (typeof body.name !== 'string' || typeof body.scenarioClass !== 'string'
      || !SCENARIO_CLASSES.has(body.scenarioClass as ScenarioClass)) {
      throw new EngineeringServiceError(400, 'INVALID_INPUT', 'name and a supported scenarioClass are required.');
    }
    const scenario = await service.createScenario({
      tenantId: identity.tenantId,
      actorId: identity.id,
      actorRole: identity.role,
      name: body.name,
      scenarioClass: body.scenarioClass as ScenarioClass,
      changes: changes(body.changes),
      assumptions: strings(body.assumptions, 'assumptions', []),
      requestedAnalysis: analysisCapabilities(body.requestedAnalysis, 'requestedAnalysis'),
      correlationId: String(res.getHeader('x-correlation-id') ?? ''),
    });
    res.status(201).json({ ok: true, data: scenario, correlationId: scenario.correlationId });
  }));

  router.get('/scenarios', authorize('read'), asyncRoute('scenario.list', async (req, res) => {
    const identity = getIdentity(req)!;
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100
      || !Number.isInteger(offset) || offset < 0) {
      throw new EngineeringServiceError(400, 'INVALID_PAGINATION', 'limit must be 1-100 and offset must be non-negative.');
    }
    const scenarios = await service.listScenarios(identity.tenantId, identity.id, limit, offset);
    res.json({ ok: true, data: scenarios, correlationId: String(res.getHeader('x-correlation-id') ?? '') });
  }));

  router.get('/scenarios/:scenarioId/audit', authorize('read'), asyncRoute('scenario.audit.read', async (req, res) => {
    const identity = getIdentity(req)!;
    const audit = await service.listScenarioAudit(identity.tenantId, identity.id, req.params.scenarioId);
    res.json({ ok: true, data: audit, correlationId: String(res.getHeader('x-correlation-id') ?? '') });
  }));

  router.get('/scenarios/:scenarioId', authorize('read'), asyncRoute('scenario.read', async (req, res) => {
    const identity = getIdentity(req)!;
    const scenario = await service.getScenario(identity.tenantId, identity.id, req.params.scenarioId);
    res.json({ ok: true, data: scenario, correlationId: String(res.getHeader('x-correlation-id') ?? '') });
  }));

  router.patch('/scenarios/:scenarioId', authorize('update'), asyncRoute('scenario.update', async (req, res) => {
    const identity = getIdentity(req)!;
    const body = bodyRecord(req);
    const scenario = await service.updateScenario({
      tenantId: identity.tenantId,
      actorId: identity.id,
      actorRole: identity.role,
      scenarioId: req.params.scenarioId,
      name: typeof body.name === 'string' ? body.name : undefined,
      changes: body.changes === undefined ? undefined : changes(body.changes),
      assumptions: body.assumptions === undefined ? undefined : strings(body.assumptions, 'assumptions'),
      requestedAnalysis: body.requestedAnalysis === undefined
        ? undefined
        : analysisCapabilities(body.requestedAnalysis, 'requestedAnalysis'),
      correlationId: String(res.getHeader('x-correlation-id') ?? ''),
    });
    res.json({ ok: true, data: scenario, correlationId: scenario.correlationId });
  }));

  router.post('/scenarios/:scenarioId/simulations', authorize('admin'), asyncRoute('simulation.request', async (req, res) => {
    const identity = getIdentity(req)!;
    const idempotencyKey = req.get('idempotency-key');
    if (!idempotencyKey || idempotencyKey.length > 200) {
      throw new EngineeringServiceError(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required (maximum 200 characters).');
    }
    const run = await service.requestSimulation({
      tenantId: identity.tenantId,
      actorId: identity.id,
      actorRole: identity.role,
      scenarioId: req.params.scenarioId,
      correlationId: String(res.getHeader('x-correlation-id') ?? ''),
      idempotencyKey,
    });
    const statusCode = run.executionStatus === 'UNAVAILABLE'
      ? 503
      : run.executionStatus === 'FAILED'
        ? 500
        : run.executionStatus === 'INVALID' || run.executionStatus === 'CANCELLED'
          ? 409
          : run.executionStatus === 'QUEUED' || run.executionStatus === 'RUNNING'
            ? 202
            : 200;
    res.status(statusCode).json({
      ok: run.executionStatus === 'COMPLETED',
      data: run,
      correlationId: run.correlationId,
    });
  }));

  router.get('/simulations/:runId', authorize('read'), asyncRoute('simulation.status.read', async (req, res) => {
    const identity = getIdentity(req)!;
    const run = await service.getRun(identity.tenantId, identity.id, req.params.runId);
    res.json({ ok: true, data: run, correlationId: String(res.getHeader('x-correlation-id') ?? '') });
  }));

  router.get('/simulations/:runId/result', authorize('read'), asyncRoute('simulation.result.read', async (req, res) => {
    const identity = getIdentity(req)!;
    const result = await service.getResult({
      tenantId: identity.tenantId,
      actorId: identity.id,
      actorRole: identity.role,
      runId: req.params.runId,
      correlationId: String(res.getHeader('x-correlation-id') ?? ''),
    });
    if (result.status === 'UNAVAILABLE') {
      res.status(503).json({
        ok: false,
        data: result,
        error: { code: 'SIMULATION_UNAVAILABLE', message: 'No validated simulation provider is configured.' },
        correlationId: String(res.getHeader('x-correlation-id') ?? ''),
      });
      return;
    }
    res.json({ ok: result.status === 'COMPLETED', data: result, correlationId: String(res.getHeader('x-correlation-id') ?? '') });
  }));

  router.post('/simulations/:runId/cancel', authorize('admin'), asyncRoute('simulation.cancel', async (req, res) => {
    const identity = getIdentity(req)!;
    const run = await service.cancelRun({
      tenantId: identity.tenantId,
      actorId: identity.id,
      actorRole: identity.role,
      runId: req.params.runId,
      correlationId: String(res.getHeader('x-correlation-id') ?? ''),
    });
    res.json({ ok: true, data: run, correlationId: run.correlationId });
  }));

  router.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    sendError(error, req, res);
  });
  return router;
}
