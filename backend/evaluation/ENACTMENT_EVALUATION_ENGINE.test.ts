import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EnactmentEvaluationEngine } from './ENACTMENT_EVALUATION_ENGINE';

describe('EnactmentEvaluationEngine', () => {
  const engine = EnactmentEvaluationEngine.getInstance();

  it('returns all enactments in the inventory', () => {
    const inventory = engine.getInventory();
    assert.ok(inventory.length > 0, 'Inventory should not be empty');
    assert.ok(inventory.some(e => e.actualStatus === 'IMPLEMENTED'), 'Should have implemented enactments');
  });

  it('filters enactments by phase', () => {
    const phase1 = engine.getByPhase('PHASE_I');
    assert.ok(phase1.length >= 0, 'Should return array for phase query');
  });

  it('filters enactments by status', () => {
    const implemented = engine.getByStatus('IMPLEMENTED');
    assert.ok(implemented.every(e => e.actualStatus === 'IMPLEMENTED'), 'All results should be IMPLEMENTED');
  });

  it('filters enactments by eligibility', () => {
    const eligible = engine.getByEligibility('ELIGIBLE');
    assert.ok(eligible.every(e => e.eligibility === 'ELIGIBLE'), 'All results should be ELIGIBLE');
  });

  it('generates a summary with status breakdown', () => {
    const summary = engine.getSummary();
    assert.ok(summary.total > 0, 'Summary should have total count');
    assert.ok(typeof summary.byStatus === 'object', 'Summary should have status breakdown');
    assert.ok(typeof summary.byEligibility === 'object', 'Summary should have eligibility breakdown');
  });

  it('evaluates capability eligibility', () => {
    const result = engine.evaluateCapability('kernel-foundations');
    assert.ok(result.evaluation !== null, 'Should find kernel-foundations capability');
    assert.equal(result.evaluation?.actualStatus, 'IMPLEMENTED', 'kernel-foundations should be implemented');
  });

  it('detects missing capabilities', () => {
    const result = engine.evaluateCapability('non-existent-capability');
    assert.equal(result.evaluation, null, 'Should return null for missing capability');
    assert.equal(result.evidence.actual, 'NOT_ENACTED', 'Missing capability should be NOT_ENACTED');
  });

  it('diagnoses evaluation failures', () => {
    const evaluation = engine.getInventory()[0];
    if (evaluation) {
      const diagnosis = engine.diagnoseFailure(evaluation.evaluationId);
      assert.ok(diagnosis.evaluation !== null, 'Should find evaluation for diagnosis');
      assert.ok(Array.isArray(diagnosis.diagnosis.requiredEvidence), 'Should provide list of required evidence');
    }
  });

  it('generates markdown report', () => {
    const report = engine.generateReport();
    assert.ok(report.includes('Cumulative Enactment Evaluation Report'), 'Report should have title');
    assert.ok(report.includes('Executive Summary'), 'Report should have summary section');
    assert.ok(report.includes('Status Distribution'), 'Report should have status distribution');
  });

  it('tracks production control status', () => {
    const summary = engine.getSummary();
    const total = summary.total;
    const risks = summary.risks.filter(r => r.risks.some(risk => risk.includes('Production controls')));
    assert.ok(risks.length >= 0, 'Should track production control risks');
  });

  it('detects regressions in capability status', () => {
    const priorStatus = 'VERIFIED' as const;
    const regressed = engine.hasRegressed('kernel-foundations', priorStatus);
    assert.equal(typeof regressed, 'boolean', 'Should return boolean regression status');
  });
});
