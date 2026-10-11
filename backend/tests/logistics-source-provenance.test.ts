import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveLogisticsSourceType } from '../../src/components/logistics/logistics-data-fabric';

test('logistics source authority requires explicit connected-provider metadata', () => {
  assert.equal(
    resolveLogisticsSourceType({
      mode: 'SYNTHETIC',
      synthetic: true,
      source: 'SYNTHETIC_DEMO_DATA',
      isConnected: false,
    }),
    'SYNTHETIC'
  );
  assert.equal(
    resolveLogisticsSourceType({
      mode: 'LIVE',
      synthetic: false,
      source: 'CONNECTED_PROVIDER',
      isConnected: true,
      isLive: true,
      status: 'LIVE',
    }),
    'LIVE_AUTHORITATIVE'
  );
  assert.equal(
    resolveLogisticsSourceType({
      mode: 'LIVE',
      synthetic: false,
      source: 'CONNECTED_PROVIDER',
      isConnected: false,
      isLive: true,
      status: 'LIVE',
    }),
    'UNAVAILABLE'
  );
  assert.equal(
    resolveLogisticsSourceType({
      mode: 'LIVE',
      synthetic: false,
      source: 'CONNECTED_PROVIDER',
      isConnected: true,
      isLive: false,
      status: 'LIVE',
    }),
    'UNAVAILABLE'
  );
  assert.equal(resolveLogisticsSourceType({ mode: 'LIVE' }), 'UNAVAILABLE');
  assert.equal(resolveLogisticsSourceType(null), 'UNAVAILABLE');
});
