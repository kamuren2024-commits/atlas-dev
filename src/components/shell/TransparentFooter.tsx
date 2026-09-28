import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';

interface TransparentFooterProps {
  systemHealth: {
    status?: string;
    database?: string;
    gemini_configured?: boolean;
    version?: string;
    uptime?: number;
  };
}

export default function TransparentFooter({ systemHealth }: TransparentFooterProps) {
  const { currentTenant } = useTenant();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const systemNominal =
    !systemHealth.status || systemHealth.status.toLowerCase() === 'online' || systemHealth.status === 'healthy';
  const aiOnline = !!systemHealth.gemini_configured;
  const environment = systemHealth.status === 'offline' ? 'LOCAL' : 'LIVE';
  const version = '5.1.0';

  return (
    <footer
      className="atlas-shell-footer shrink-0 select-none"
      role="contentinfo"
    >
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 md:px-6 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-slate-200 font-bold whitespace-nowrap">ATLAS v{version}</span>
          <span className="hidden sm:inline whitespace-nowrap text-slate-400 font-medium">● {environment}</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${systemNominal ? 'bg-emerald-400' : 'bg-amber-400'}`} /> SYSTEM{' '}
            {systemNominal ? 'NOMINAL' : 'DEGRADED'}
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${aiOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} /> AI{' '}
            {aiOnline ? 'ONLINE' : 'STANDBY'}
          </span>
          {systemHealth.database && (
            <span className="hidden md:inline whitespace-nowrap text-slate-400">DATA {systemHealth.database}</span>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3 whitespace-nowrap">
          <span className="text-slate-300 font-medium">{currentTenant.name} TENANT</span>
          <time dateTime={time.toISOString()} className="text-slate-400" title={time.toLocaleString()}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} LOCAL</time>
        </div>
      </div>
    </footer>
  );
}
