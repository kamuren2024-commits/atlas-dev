import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ATLAS_TOP_LEVEL_MODULE_IDS,
  LOGISTICS_VIEW_IDS,
  normalizeAtlasModuleId,
  normalizeLogisticsViewId,
  resolveAtlasModuleFromPath,
} from './atlas-module-registry';

test('Atlas top-level module ids and Logistics view ids remain isolated', () => {
  const overlap = LOGISTICS_VIEW_IDS.filter((viewId) => ATLAS_TOP_LEVEL_MODULE_IDS.includes(viewId as (typeof ATLAS_TOP_LEVEL_MODULE_IDS)[number]));
  assert.deepEqual(overlap, []);
});

test('Atlas route detection resolves every supported top-level module', () => {
  const expectations: Array<[string, string]> = [
    ['/overview', 'overview'],
    ['/meeting-intelligence', 'meeting-intelligence'],
    ['/drone-intelligence', 'drone-intelligence'],
    ['/project', 'project'],
    ['/project-supply-nexus', 'project'],
    ['/tender', 'tender'],
    ['/inventory', 'inventory'],
    ['/supplier', 'supplier'],
    ['/logistics', 'logistics'],
    ['/risk', 'risk'],
    ['/decision', 'decision'],
    ['/finance', 'finance'],
    ['/atlas-demo', 'atlas-demo'],
    ['/ai-runtime', 'ai-runtime'],
    ['/agents', 'agents'],
  ];

  expectations.forEach(([path, expected]) => {
    assert.equal(resolveAtlasModuleFromPath(path), expected, `Expected ${path} to resolve to ${expected}`);
  });
});

test('Normalized ids reject cross-module values while permitting valid ones', () => {
  assert.equal(normalizeAtlasModuleId('logistics'), 'logistics');
  assert.equal(normalizeAtlasModuleId('logistics-command-center'), null);
  assert.equal(normalizeAtlasModuleId('analytics'), null);
  assert.equal(normalizeLogisticsViewId('logistics-analytics'), 'logistics-analytics');
  assert.equal(normalizeLogisticsViewId('analytics'), null);
});
