import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  hasConfiguredGatewayProvider,
  parseEvaluationTarget,
} from './eval-harness-contracts';

test('evaluation target parser accepts supported suites', () => {
  for (const target of ['agents', 'gateway', 'ontology', 'tools', 'all']) {
    assert.equal(parseEvaluationTarget(target), target);
  }
});

test('evaluation target parser rejects unknown and missing suites', () => {
  assert.throws(() => parseEvaluationTarget('unknown'), /Usage: eval-harness/);
  assert.throws(() => parseEvaluationTarget(undefined), /Usage: eval-harness/);
});

test('gateway provider detection requires a configured supported provider', () => {
  assert.equal(hasConfiguredGatewayProvider([], {}), false);
  assert.equal(hasConfiguredGatewayProvider([], { GEMINI_API_KEY: '   ' }), false);
  assert.equal(hasConfiguredGatewayProvider([], { GEMINI_API_KEY: 'configured' }), true);
  assert.equal(
    hasConfiguredGatewayProvider([{ provider: 'ollama', availability: 'ACTIVE' }], {}),
    true,
  );
  assert.equal(
    hasConfiguredGatewayProvider([{ provider: 'ollama', availability: 'DISABLED' }], {}),
    false,
  );
  assert.equal(
    hasConfiguredGatewayProvider([{ provider: 'openai', availability: 'ACTIVE' }], {}),
    false,
  );
});
