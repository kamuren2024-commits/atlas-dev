import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface ProjectFooterProps {
  dataFreshnessSeconds?: number;
  lastSyncTime?: string;
  isSyncing?: boolean;
}

export const ProjectFooter: React.FC<ProjectFooterProps> = ({
  dataFreshnessSeconds = 42,
  lastSyncTime = '12:42:31',
  isSyncing = false
}) => {
  return (
    <footer className="h-7 bg-[#05080e] border-t border-slate-800/80 px-4 flex items-center justify-between text-[10px] font-mono select-none shrink-0 z-20">
      {/* Left services telemetry dots */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        <span className="font-bold text-cyan-400 font-display">KETRACO</span>
        <span className="w-px h-3 bg-slate-800" />

        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Project Services LIVE
        </span>

        <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Data Fabric LIVE
        </span>

        <span className="hidden sm:flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          AI Services LIVE
        </span>

        <span className="hidden md:flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          GIS Services LIVE
        </span>

        <span className="hidden lg:flex items-center gap-1.5 text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          ERP/SCM LIVE
        </span>

        <span className="hidden xl:flex items-center gap-1.5 text-amber-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Document Services SYNCING (2 delayed)
        </span>
      </div>

      {/* Right telemetry freshness */}
      <div className="flex items-center gap-3 text-slate-500 shrink-0">
        <span>Data freshness: {dataFreshnessSeconds}s</span>
        <span className="w-px h-3 bg-slate-800" />
        <span className="text-slate-400">Last sync: {lastSyncTime}</span>
      </div>
    </footer>
  );
};
