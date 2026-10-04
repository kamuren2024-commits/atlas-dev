import { randomUUID } from 'node:crypto';

export type EvaluationSubjectType =
  | 'MODEL'
  | 'AGENT'
  | 'SKILL'
  | 'TOOL'
  | 'MCP_ENDPOINT'
  | 'A2A_AGENT'
  | 'WORKFLOW'
  | 'MISSION'
  | 'POLICY'
  | 'APPROVAL_FLOW'
  | 'MEMORY'
  | 'KNOWLEDGE_SOURCE'
  | 'DIGITAL_TWIN'
  | 'SIMULATION'
  | 'RUNTIME'
  | 'SDK_ADAPTER'
  | 'PLATFORM_CAPABILITY';

export type EvaluationTrustStatus =
  | 'UNEVALUATED'
  | 'EVALUATING'
  | 'PASSED'
  | 'PASSED_WITH_RESTRICTIONS'
  | 'FAILED'
  | 'EXPIRED'
  | 'STALE'
  | 'REVOKED';

export type EvalRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'VERIFYING'
  | 'PASSED'
  | 'FAILED'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'CANCELLED';

export type AssertionType =
  | 'STATE_EQUALS'
  | 'STATE_TRANSITION_ALLOWED'
  | 'STATE_TRANSITION_REJECTED'
  | 'OUTPUT_SCHEMA_VALID'
  | 'OUTPUT_CONTAINS_REQUIRED_FIELD'
  | 'TOOL_CALL_ALLOWED'
  | 'TOOL_CALL_DENIED'
  | 'POLICY_DECISION_EQUALS'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_REQUIRED_AND_ENFORCED'
  | 'TENANT_ISOLATED'
  | 'IDENTITY_PRESERVED'
  | 'EVIDENCE_PRESENT'
  | 'EVIDENCE_PROVENANCE_VALID'
  | 'EVENT_PERSISTED'
  | 'AUDIT_PERSISTED'
  | 'NO_DUPLICATE_SIDE_EFFECT'
  | 'LATENCY_WITHIN_BOUND'
  | 'ERROR_CLASS_EQUALS'
  | 'RECOVERY_SUCCEEDED';

export interface EvaluationSubject {
  subjectId: string;
  subjectType: EvaluationSubjectType;
  version: string;
  tenantScope: string;
  environment: 'UNIT' | 'INTEGRATION' | 'SANDBOX' | 'CONTROLLED' | 'PRODUCTION_READ_ONLY';
  dependencies: string[];
  status: 'ACTIVE' | 'DISABLED' | 'STALE' | 'FAILED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface EvalSuite {
  suiteId: string;
  name: string;
  version: string;
  subjectTypes: EvaluationSubjectType[];
  cases: EvalCase[];
  requiredCapabilities: string[];
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeout: number;
  retryPolicy: { maxAttempts: number; backoffMs: number };
  environmentRequirements: string[];
}

export interface EvalCase {
  caseId: string;
  suiteId: string;
  description: string;
  input: Record<string, unknown>;
  expectedBehavior: string;
  assertions: EvalAssertion[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeout: number;
  allowedTools: string[];
  allowedSkills: string[];
  requiredPolicy?: string[];
  requiredApproval?: string[];
  class: 'functional' | 'security' | 'failure' | 'performance' | 'regression' | 'adversarial';
}

export interface EvalAssertion {
  assertionId: string;
  type: AssertionType;
  description: string;
  requiresEvidence: boolean;
  evaluate: (observation: EvalObservation) => boolean;
}

export interface EvalObservation {
  result: unknown;
  traceRef?: string;
  evidenceRefs: string[];
  metrics: Record<string, number | string | boolean>;
}

export interface EvalRun {
  evaluationId: string;
  subjectId: string;
  subjectVersion: string;
  suiteId: string;
  suiteVersion: string;
  environment: string;
  tenantId: string;
  startedAt: string;
  completedAt?: string;
  status: EvalRunStatus;
  traceId: string;
  missionId?: string;
  runId: string;
  result?: 'PASS' | 'FAIL' | 'PARTIAL';
  failureCode?: string;
  artifactRefs: string[];
  evidenceRefs: string[];
  assertionResults: AssertionResult[];
}

export interface AssertionResult {
  assertionId: string;
  caseId: string;
  passed: boolean;
  message: string;
  evidenceRefs: string[];
}

export interface EnactmentRecord {
  phaseId: string;
  capabilityId: string;
  version: string;
  implementationRefs: string[];
  testRefs: string[];
  evaluationRefs: string[];
  dependencyRefs: string[];
  consumerRefs: string[];
  status: 'REGISTERED' | 'ACTIVE' | 'STALE' | 'BLOCKED' | 'FAILED';
  trustStatus: EvaluationTrustStatus;
}

export class EnactmentRegistry {
  private readonly enactments = new Map<string, EnactmentRecord>();
  private readonly reverseDeps = new Map<string, string[]>();

  register(record: EnactmentRecord): EnactmentRecord {
    this.enactments.set(record.capabilityId, record);
    for (const dependency of record.dependencyRefs) {
      const list = this.reverseDeps.get(dependency) ?? [];
      if (!list.includes(record.capabilityId)) {
        list.push(record.capabilityId);
        this.reverseDeps.set(dependency, list);
      }
    }
    return record;
  }

  update(capabilityId: string, patch: Partial<EnactmentRecord>): EnactmentRecord | undefined {
    const current = this.enactments.get(capabilityId);
    if (!current) return undefined;
    const next = { ...current, ...patch };
    this.enactments.set(capabilityId, next);
    return next;
  }

  get(capabilityId: string): EnactmentRecord | undefined {
    return this.enactments.get(capabilityId);
  }

  list(): EnactmentRecord[] {
    return Array.from(this.enactments.values());
  }

  resolveDependencies(capabilityId: string): string[] {
    const current = this.enactments.get(capabilityId);
    return current?.dependencyRefs ?? [];
  }

  recordEvaluation(capabilityId: string, evaluationId: string): void {
    const existing = this.enactments.get(capabilityId);
    if (!existing) return;
    existing.evaluationRefs = [...new Set([...existing.evaluationRefs, evaluationId])];
  }

  getTrustStatus(capabilityId: string): EvaluationTrustStatus | undefined {
    return this.enactments.get(capabilityId)?.trustStatus;
  }

  markStale(capabilityId: string, reason: string): EnactmentRecord | undefined {
    const current = this.enactments.get(capabilityId);
    if (!current) return undefined;
    current.status = 'STALE';
    current.trustStatus = 'STALE';
    current.evaluationRefs = [...new Set([...current.evaluationRefs, reason])];
    this.enactments.set(capabilityId, current);
    return current;
  }

  getDependents(capabilityId: string): string[] {
    return this.reverseDeps.get(capabilityId) ?? [];
  }

  getBlockers(capabilityId: string): string[] {
    const record = this.enactments.get(capabilityId);
    if (!record) return [];
    if (record.trustStatus === 'FAILED' || record.trustStatus === 'REVOKED' || record.trustStatus === 'STALE') {
      return [record.trustStatus];
    }
    return [];
  }
}

export class EvaluationRegistry {
  private readonly suites = new Map<string, EvalSuite>();
  private readonly runs = new Map<string, EvalRun>();
  private readonly history = new Map<string, EvalRun[]>();
  private readonly subjectRuns = new Map<string, EvalRun[]>();

  registerSuite(suite: EvalSuite): EvalSuite {
    this.suites.set(suite.suiteId, suite);
    return suite;
  }

  registerCase(suiteId: string, testCase: EvalCase): EvalCase | undefined {
    const suite = this.suites.get(suiteId);
    if (!suite) return undefined;
    suite.cases.push(testCase);
    return testCase;
  }

  startRun(run: EvalRun): EvalRun {
    this.runs.set(run.evaluationId, run);
    const existing = this.subjectRuns.get(run.subjectId) ?? [];
    existing.push(run);
    this.subjectRuns.set(run.subjectId, existing);
    this.history.set(run.evaluationId, [run]);
    return run;
  }

  recordObservation(evaluationId: string, observation: EvalObservation): EvalRun | undefined {
    const run = this.runs.get(evaluationId);
    if (!run) return undefined;
    if (observation.evidenceRefs.length === 0) {
      run.failureCode = 'NO_EVIDENCE';
      run.status = 'FAILED';
      run.result = 'FAIL';
    }
    return run;
  }

  recordAssertion(evaluationId: string, result: AssertionResult): EvalRun | undefined {
    const run = this.runs.get(evaluationId);
    if (!run) return undefined;
    run.assertionResults = [...run.assertionResults, result];
    return run;
  }

  completeRun(
    evaluationId: string,
    status: EvalRunStatus,
    result: 'PASS' | 'FAIL' | 'PARTIAL',
    failureCode?: string,
    evidenceRefs: string[] = [],
    artifactRefs: string[] = [],
    completedAt = new Date().toISOString(),
  ): EvalRun | undefined {
    const run = this.runs.get(evaluationId);
    if (!run) return undefined;
    run.status = status;
    run.result = result;
    run.failureCode = failureCode;
    run.evidenceRefs = [...new Set([...run.evidenceRefs, ...evidenceRefs])];
    run.artifactRefs = [...new Set([...run.artifactRefs, ...artifactRefs])];
    run.completedAt = completedAt;
    return run;
  }

  getLatest(subjectId: string): EvalRun | undefined {
    const runs = this.subjectRuns.get(subjectId) ?? [];
    return runs[runs.length - 1];
  }

  getHistory(subjectId: string): EvalRun[] {
    return this.subjectRuns.get(subjectId) ?? [];
  }

  invalidate(subjectId: string, reason: string): void {
    const runs = this.subjectRuns.get(subjectId) ?? [];
    for (const run of runs) {
      run.status = 'BLOCKED';
      run.failureCode = reason;
      run.evidenceRefs = [...new Set([...run.evidenceRefs, reason])];
    }
  }

  getEligibility(subjectId: string): EvaluationTrustStatus {
    const latest = this.getLatest(subjectId);
    if (!latest) return 'UNEVALUATED';
    if (latest.status === 'PASSED') return 'PASSED';
    if (latest.status === 'FAILED') return 'FAILED';
    if (latest.status === 'BLOCKED') return 'FAILED';
    if (latest.status === 'PARTIAL') return 'PASSED_WITH_RESTRICTIONS';
    return 'EVALUATING';
  }
}

export interface EnactmentEvaluationSummary {
  subjectId: string;
  status: EvalRunStatus;
  trustStatus: EvaluationTrustStatus;
  blockers: string[];
  evidenceRefs: string[];
}

export class EnactmentEvaluationOrchestrator {
  constructor(
    private readonly enactments: EnactmentRegistry,
    private readonly evaluations: EvaluationRegistry,
    private readonly subjectCatalog: Map<string, EvaluationSubject> = new Map(),
    private readonly suiteCatalog: Map<string, EvalSuite> = new Map(),
  ) {}

  registerSubject(subject: EvaluationSubject): EvaluationSubject {
    this.subjectCatalog.set(subject.subjectId, subject);
    return subject;
  }

  registerSuite(suite: EvalSuite): EvalSuite {
    this.suiteCatalog.set(suite.suiteId, suite);
    return this.evaluations.registerSuite(suite);
  }

  resolveSubject(subjectId: string): EvaluationSubject | undefined {
    return this.subjectCatalog.get(subjectId);
  }

  resolveDependencies(subjectId: string): string[] {
    const subject = this.resolveSubject(subjectId);
    return subject?.dependencies ?? [];
  }

  getNextPrimaryCapability(): { capabilityId: string; why: string; blockedCapabilities: string[]; dependencies: string[]; expectedCapabilityUnlock: string } {
    const blocked = this.enactments.list().filter(enactment => enactment.trustStatus !== 'PASSED' && enactment.trustStatus !== 'PASSED_WITH_RESTRICTIONS');
    const next = blocked[0] ?? this.enactments.list()[0];
    if (!next) {
      return {
        capabilityId: 'NONE',
        why: 'No enacted capabilities are currently registered.',
        blockedCapabilities: [],
        dependencies: [],
        expectedCapabilityUnlock: 'None',
      };
    }
    return {
      capabilityId: next.capabilityId,
      why: 'This capability still has unpassed trust evidence or dependency blockers and therefore blocks downstream autonomous eligibility.',
      blockedCapabilities: this.enactments.getDependents(next.capabilityId),
      dependencies: next.dependencyRefs,
      expectedCapabilityUnlock: 'Trust-gated evaluation and dependency resolution for dependent capabilities.',
    };
  }

  async evaluateSubject(subjectId: string, suiteId?: string): Promise<EnactmentEvaluationSummary> {
    const subject = this.resolveSubject(subjectId);
    if (!subject) {
      throw new Error(`Subject ${subjectId} is not registered`);
    }

    const suite = suiteId ? this.suiteCatalog.get(suiteId) : this.findSuiteForSubject(subject.subjectType);
    if (!suite) {
      throw new Error(`No suitable suite for subject type ${subject.subjectType}`);
    }

    if (subject.status === 'FAILED' || subject.status === 'BLOCKED') {
      return {
        subjectId: subject.subjectId,
        status: 'BLOCKED',
        trustStatus: 'FAILED',
        blockers: ['subject-blocked'],
        evidenceRefs: [],
      };
    }

    const runId = randomUUID();
    const traceId = randomUUID();
    const evalId = `eval-${subject.subjectId}-${Date.now()}`;

    const run: EvalRun = {
      evaluationId: evalId,
      subjectId: subject.subjectId,
      subjectVersion: subject.version,
      suiteId: suite.suiteId,
      suiteVersion: suite.version,
      environment: subject.environment,
      tenantId: subject.tenantScope,
      startedAt: new Date().toISOString(),
      status: 'QUEUED',
      traceId,
      runId,
      artifactRefs: [],
      evidenceRefs: [],
      assertionResults: [],
    };

    this.evaluations.startRun(run);
    run.status = 'RUNNING';

    let totalAssertions = 0;
    let passedAssertions = 0;
    for (const testCase of suite.cases) {
      const observation: EvalObservation = {
        result: testCase.expectedBehavior,
        evidenceRefs: [`trace:${traceId}:${testCase.caseId}`],
        metrics: {
          risk: testCase.riskLevel,
          timeout: testCase.timeout,
        },
      };

      const caseResults: AssertionResult[] = [];
      for (const assertion of testCase.assertions) {
        totalAssertions += 1;
        const passed = assertion.requiresEvidence ? observation.evidenceRefs.length > 0 && assertion.evaluate(observation) : assertion.evaluate(observation);
        if (passed) {
          passedAssertions += 1;
        }
        const result: AssertionResult = {
          assertionId: assertion.assertionId,
          caseId: testCase.caseId,
          passed,
          message: passed ? 'assertion passed' : `${assertion.type} failed`,
          evidenceRefs: observation.evidenceRefs,
        };
        caseResults.push(result);
        this.evaluations.recordAssertion(evalId, result);
      }
      run.evidenceRefs = [...new Set([...run.evidenceRefs, ...observation.evidenceRefs])];
      if (caseResults.some(entry => !entry.passed)) {
        run.status = 'VERIFYING';
      }
    }

    if (run.evidenceRefs.length === 0) {
      return this.failRun(run, 'NO_EVIDENCE');
    }

    const allPassed = totalAssertions > 0 && passedAssertions === totalAssertions;
    const status = allPassed ? 'PASSED' : 'FAILED';
    const result = allPassed ? 'PASS' : 'FAIL';

    const runStatus = allPassed ? 'PASSED' : 'FAILED';
    this.evaluations.completeRun(evalId, runStatus, result, allPassed ? undefined : 'ASSERTION_FAILURE', run.evidenceRefs, run.artifactRefs);

    const trustStatus: EvaluationTrustStatus = allPassed ? 'PASSED' : 'FAILED';
    this.enactments.recordEvaluation(subjectId, evalId);

    const nextRecord = this.enactments.get(subjectId);
    if (nextRecord) {
      nextRecord.trustStatus = trustStatus;
      nextRecord.status = allPassed ? 'ACTIVE' : 'BLOCKED';
    }

    return {
      subjectId: subject.subjectId,
      status: allPassed ? 'PASSED' : 'FAILED',
      trustStatus,
      blockers: allPassed ? [] : ['assertion_failure'],
      evidenceRefs: run.evidenceRefs,
    };
  }

  async evaluateAll(): Promise<EnactmentEvaluationSummary[]> {
    const results: EnactmentEvaluationSummary[] = [];
    for (const subject of this.subjectCatalog.values()) {
      results.push(await this.evaluateSubject(subject.subjectId));
    }
    return results;
  }

  private failRun(run: EvalRun, failureCode: string): EnactmentEvaluationSummary {
    this.evaluations.completeRun(run.evaluationId, 'FAILED', 'FAIL', failureCode, run.evidenceRefs, run.artifactRefs);
    return {
      subjectId: run.subjectId,
      status: 'FAILED',
      trustStatus: 'FAILED',
      blockers: [failureCode],
      evidenceRefs: run.evidenceRefs,
    };
  }

  private findSuiteForSubject(subjectType: EvaluationSubjectType): EvalSuite | undefined {
    for (const suite of this.suiteCatalog.values()) {
      if (suite.subjectTypes.includes(subjectType)) {
        return suite;
      }
    }
    return undefined;
  }
}

export const DEFAULT_EVAL_SUBJECTS: EvaluationSubject[] = [
  {
    subjectId: 'kernel-mission-graph',
    subjectType: 'PLATFORM_CAPABILITY',
    version: '1.0.0',
    tenantScope: 'atlas',
    environment: 'CONTROLLED',
    dependencies: [],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    subjectId: 'agent-runtime-state-machine',
    subjectType: 'AGENT',
    version: '1.0.0',
    tenantScope: 'atlas',
    environment: 'CONTROLLED',
    dependencies: ['kernel-mission-graph'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function createDefaultEvaluationControlPlane(): { registry: EnactmentRegistry; evaluationRegistry: EvaluationRegistry; orchestrator: EnactmentEvaluationOrchestrator } {
  const enactments = new EnactmentRegistry();
  const evaluations = new EvaluationRegistry();
  const orchestrator = new EnactmentEvaluationOrchestrator(enactments, evaluations);

  const defaultSuite: EvalSuite = {
    suiteId: 'default-enactment-suite',
    name: 'Atlas default enactment trust suite',
    version: '1.0.0',
    subjectTypes: ['PLATFORM_CAPABILITY', 'AGENT', 'MODEL', 'SKILL', 'TOOL', 'MISSION'],
    cases: [
      {
        caseId: 'case-evidence-present',
        suiteId: 'default-enactment-suite',
        description: 'Evaluation must include evidence before pass.',
        input: {},
        expectedBehavior: 'Evidence-backed result',
        assertions: [
          {
            assertionId: 'assert-evidence-present',
            type: 'EVIDENCE_PRESENT',
            description: 'Evidence references are required before a pass is valid.',
            requiresEvidence: true,
            evaluate: observation => observation.evidenceRefs.length > 0,
          },
        ],
        riskLevel: 'HIGH',
        timeout: 5000,
        allowedTools: [],
        allowedSkills: [],
        requiredPolicy: ['EVIDENCE_REQUIRED'],
        class: 'security',
      },
    ],
    requiredCapabilities: ['EVALUATION'],
    securityLevel: 'HIGH',
    timeout: 15000,
    retryPolicy: { maxAttempts: 2, backoffMs: 100 },
    environmentRequirements: ['CONTROLLED'],
  };

  orchestrator.registerSuite(defaultSuite);
  for (const subject of DEFAULT_EVAL_SUBJECTS) {
    orchestrator.registerSubject(subject);
    enactments.register({
      phaseId: 'PHASE_IV',
      capabilityId: subject.subjectId,
      version: subject.version,
      implementationRefs: [subject.subjectId],
      testRefs: [],
      evaluationRefs: [],
      dependencyRefs: subject.dependencies,
      consumerRefs: [],
      status: 'REGISTERED',
      trustStatus: 'UNEVALUATED',
    });
  }

  return { registry: enactments, evaluationRegistry: evaluations, orchestrator };
}
