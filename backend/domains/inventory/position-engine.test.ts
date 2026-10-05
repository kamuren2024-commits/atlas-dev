// Slice 1 evidence: ATP engine + overview contract shape (no DB required for engine part).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeAvailableToPromise } from './position-engine.js';

describe('inventory position engine (canonical ATP)', () => {
  it('computes ATP as onHand + inTransit + onOrder - reservations - demand', () => {
    const r = computeAvailableToPromise({ onHand: 4200, inTransit: 500, onOrder: 1000, reserved: 800, allocated: 100, committedDemand: 200, forecastDemand: 300 });
    assert.equal(r.availableToPromise, 4200 + 500 + 1000 - 800 - 100 - 200 - 300);
  });
  it('treats absent inputs as zero, never NaN', () => {
    const r = computeAvailableToPromise({ onHand: 100 });
    assert.equal(r.availableToPromise, 100);
  });
});
