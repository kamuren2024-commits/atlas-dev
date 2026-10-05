// InventoryHub — thin route boundary for the Inventory Intelligence OS.
// Slice 1: renders the real wired OS. Legacy mock panels retired (no fake telemetry).
import React, { lazy, Suspense } from 'react';

const InventoryIntelligenceOS = lazy(() => import('./inventory/InventoryIntelligenceOS'));

export default function InventoryHub({ onAskCopilot }: { onAskCopilot: (prompt: string) => void }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-[#05070D] text-cyan-300" role="status" aria-live="polite">
          <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
          <span className="text-xs font-mono tracking-wider">Loading Inventory Intelligence OS…</span>
        </div>
      }
    >
      <InventoryIntelligenceOS onAskCopilot={onAskCopilot} />
    </Suspense>
  );
}
