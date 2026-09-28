import React from 'react';
import CommandCenterShell from './command-center/CommandCenterShell';

interface OverviewControllerProps {
  onAskCopilot?: (prompt: string) => void;
  systemHealth?: any;
}

export default function OverviewController({ onAskCopilot, systemHealth }: OverviewControllerProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#020b14]">
      <div className="min-h-0 flex-1">
        <CommandCenterShell />
      </div>
    </div>
  );
}
