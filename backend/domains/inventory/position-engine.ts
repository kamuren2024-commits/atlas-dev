// Centralized canonical inventory position engine.
// ATP = ON_HAND + IN_TRANSIT + ON_ORDER - RESERVED - ALLOCATED - COMMITTED - FORECAST
// Single place where the business semantics live; UI components must not re-derive it.

import type { AtpBreakdown } from './types';

export interface AtpInputs {
  onHand: number;
  inTransit?: number;
  onOrder?: number;
  reserved?: number;
  allocated?: number;
  committedDemand?: number;
  forecastDemand?: number;
}

function num(v: number | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export function computeAvailableToPromise(inputs: AtpInputs): AtpBreakdown {
  const onHand = num(inputs.onHand);
  const inTransit = num(inputs.inTransit);
  const onOrder = num(inputs.onOrder);
  const reserved = num(inputs.reserved);
  const allocated = num(inputs.allocated);
  const committedDemand = num(inputs.committedDemand);
  const forecastDemand = num(inputs.forecastDemand);
  return {
    onHand,
    inTransit,
    onOrder,
    reserved,
    allocated,
    committedDemand,
    forecastDemand,
    availableToPromise: onHand + inTransit + onOrder - reserved - allocated - committedDemand - forecastDemand,
  };
}
