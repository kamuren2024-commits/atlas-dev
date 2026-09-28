import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass, Search, Bell, User, Power, ShieldCheck, X,
  PanelLeft, Command, Sun, Moon, Rows3,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { PermissionBadge } from '../ui/EnterpriseComponents';
import { useShell } from './ShellContext';
import { useAtlasTheme } from '../../context/ThemeContext';
import { useAtlasContext } from '../../context/AtlasContext';
import { motionTokens } from '../../design-system/tokens';

interface GlobalHeaderProps {
  searchString: string;
  onSearchChange: (val: string) => void;
  onOpenCommandPalette: () => void;
  onSwitchTenant: (id: string) => void;
  onLogout: () => void;
  systemHealth: {
    status?: string;
    database?: string;
    gemini_configured?: boolean;
    version?: string;
    uptime?: number;
  };
  notifications: { id: string; type: string; text: string }[];
  setNotifications: React.Dispatch<React.SetStateAction<{ id: string; type: string; text: string }[]>>;
  activeModule?: string;
}

export default function GlobalHeader({
  searchString,
  onSearchChange,
  onOpenCommandPalette,
  onSwitchTenant,
  onLogout,
  systemHealth,
  notifications,
  setNotifications,
  activeModule,
}: GlobalHeaderProps) {
  const { currentTenant, availableTenants, userProfile } = useTenant();
  const { setMobileOpen, breakpoint, density, cycleDensity } = useShell();
  const { theme, cycleTheme, isDark } = useAtlasTheme();
  const { selectedEntity } = useAtlasContext();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const closeAll = () => {
    setShowTenantDropdown(false);
    setShowUserDropdown(false);
    setShowNotifications(false);
  };

  const systemNominal =
    !systemHealth.status || systemHealth.status.toLowerCase() === 'online' || systemHealth.status === 'healthy';

  const aiOnline = !!systemHealth.gemini_configured;
  const themeLabel = theme.replace(/-/g, ' ');

  const openDrawer = () => {
    closeAll();
    setMobileOpen(true);
  };

  return (
    <header
      className="atlas-shell-header sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-2.5 shrink-0 select-none"
      role="banner"
      aria-label="Global command rail"
    >
      {/* Left: mobile menu + brand + context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={breakpoint === 'desktop' ? undefined : openDrawer}
          className={`atlas-shell-focus md:hidden p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ${breakpoint === 'desktop' ? 'pointer-events-none opacity-0' : ''}`}
          aria-label="Open navigation drawer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 shrink-0 border border-cyan-500/30 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-cyan-500/12 to-violet-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Compass className="w-4.5 h-4.5 text-[#00E1FF]" />
          </div>
          <div className="leading-tight hidden sm:block min-w-0 max-w-[420px]">
            {activeModule === 'tender' ? (
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-mono tracking-[0.18em] text-[#00D9FF] uppercase font-black shrink-0">SALIENCE ATLAS</span>
                <span className="text-[10px] font-mono text-slate-500">/</span>
                <span className="text-[10px] font-mono text-slate-300 font-bold uppercase tracking-[0.12em]">TENDER INTELLIGENCE</span>
                <span className="text-[10px] font-mono text-slate-500">/</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-[0.12em]">EVALUATION OS</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-mono tracking-[0.18em] text-[#00D9FF] uppercase font-black shrink-0">ATLAS</span>
                <span className="text-[10px] font-display font-medium text-slate-400 break-words">
                  / {currentTenant.name}
                </span>
              </div>
            )}
            <span className="text-[11px] font-display font-medium text-slate-300 block mt-0.5 break-words line-clamp-1" title={currentTenant.fullName}>
              {selectedEntity ? `${selectedEntity.type.replaceAll('_', ' ')} › ${selectedEntity.label}` : currentTenant.fullName}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command entry — ⌘K global search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="atlas-command-trigger atlas-shell-focus w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
          aria-label="Open global search and command entry"
        >
          <Search className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[11px] font-mono flex-1 truncate text-slate-300/90">Search, navigate, investigate…</span>
          <span className="flex items-center gap-1 text-[9.5px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
            <Command className="w-3 h-3" /> K
          </span>
        </button>
      </div>

      {/* Right: status + actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Agent state reflects provider availability; it never implies execution. */}
        <button
          onClick={onOpenCommandPalette}
          className="atlas-shell-focus hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/35 hover:border-violet-500/30 transition-colors cursor-pointer"
          title={aiOnline ? 'AI provider is available. Open Intelligence Command.' : 'AI provider is in standby. Open Intelligence Command.'}
          aria-label={aiOnline ? 'AI agent available. Open Intelligence Command.' : 'AI agent standby. Open Intelligence Command.'}
        >
          <span className="relative flex h-2 w-2">
            {aiOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-40" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${aiOnline ? 'bg-violet-400' : 'bg-slate-500'}`} />
          </span>
          <span className="text-[9.5px] font-mono uppercase tracking-[0.14em] text-slate-300 font-semibold">AGENTS</span>
          <span className="text-[9.5px] font-mono uppercase tracking-[0.14em] font-black text-violet-300">
            {aiOnline ? 'AVAILABLE' : 'STANDBY'}
          </span>
        </button>

        {/* System status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/35" title="System health telemetry">
          <span className={`w-1.5 h-1.5 rounded-full ${systemNominal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[9.5px] font-mono uppercase tracking-[0.14em] text-slate-300 font-semibold">
            {systemNominal ? 'SYSTEM NOMINAL' : 'SYSTEM DEGRADED'}
          </span>
        </div>

        {/* Tenant dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowTenantDropdown(!showTenantDropdown); setShowUserDropdown(false); setShowNotifications(false); }}
            className="atlas-shell-focus hidden md:flex items-center gap-2 bg-[#101827] border border-slate-800/70 hover:border-cyan-500/25 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-300 transition-all cursor-pointer"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentTenant.badgeColor.includes('emerald') ? 'bg-emerald-400' : currentTenant.badgeColor.includes('yellow') ? 'bg-yellow-400' : 'bg-cyan-400'}`} />
            <span className="font-bold tracking-wide uppercase">{currentTenant.name}</span>
            <span className="text-slate-500 text-[8px]">▼</span>
          </button>
          <AnimatePresence>
            {showTenantDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={motionTokens.transition.fast}
                className="absolute right-0 mt-2 w-72 bg-[#0d1323] border border-slate-800 rounded-xl shadow-2xl z-50 p-2.5 space-y-1.5"
              >
                <div className="px-2 py-1 border-b border-slate-800 pb-1.5 flex justify-between">
                  <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">COMMAND ENVIRONMENTS</span>
                  <span className="text-[8px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-1 rounded border border-cyan-500/20">MULTI-TENANT</span>
                </div>
                {availableTenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onSwitchTenant(t.id); setShowTenantDropdown(false); }}
                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${currentTenant.id === t.id ? 'bg-[#101827] border-cyan-500/30 text-[#00D9FF] font-bold' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'}`}
                  >
                    <span className="text-xs block">{t.logoText}</span>
                    {currentTenant.id === t.id && (
                      <span className="text-[8px] font-mono text-[#00D9FF] font-black bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded">ACTIVE</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={cycleDensity}
          className="atlas-shell-focus hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-cyan-500/40 bg-atlas-bg-panel text-slate-300 transition-all cursor-pointer"
          title={`Information density: ${density}. Activate to change.`}
          aria-label={`Information density: ${density}. Activate to change.`}
        >
          <Rows3 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-mono uppercase tracking-wider font-bold">{density}</span>
        </button>

        {/* Theme is an explicit workspace preference, preserving all modules. */}
        <button
          onClick={cycleTheme}
          className="atlas-shell-focus flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-cyan-500/40 bg-atlas-bg-panel text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
          title={`Theme: ${themeLabel}. Activate to change.`}
          aria-label={`Theme: ${themeLabel}. Activate to change.`}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold hidden sm:inline text-slate-300">
                {theme === 'atlas-dark' ? 'THEME' : theme === 'enterprise-steel' ? 'STEEL' : 'EMERALD'}
              </span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold hidden sm:inline text-slate-700">
                LIGHT
              </span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); setShowTenantDropdown(false); }}
            className="atlas-shell-focus p-2 bg-[#101827] border border-slate-800/70 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={motionTokens.transition.fast}
                className="absolute right-0 mt-2 w-72 bg-[#090f1d] border border-slate-800 p-3 rounded-xl shadow-2xl z-50 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">TELEMETRY STREAM</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white" aria-label="Close notifications">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 bg-slate-950/80 rounded-lg text-[10.5px] leading-relaxed text-slate-300 border border-slate-900">
                      {n.text}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowTenantDropdown(false); setShowNotifications(false); }}
            className="atlas-shell-focus flex items-center gap-2 px-2 py-1.5 bg-[#101827] border border-slate-800/70 hover:border-[#00D9FF]/25 rounded-lg transition-all cursor-pointer"
            aria-label="User access matrix"
          >
            <div className="w-7 h-7 rounded-full border border-cyan-500/20 bg-slate-900/80 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-[#00D9FF]" />
            </div>
          </button>
          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={motionTokens.transition.fast}
                className="absolute right-0 mt-2 w-80 bg-[#0d1323] border border-slate-800 rounded-xl shadow-2xl z-50 p-4 space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
                    <span className="text-[10px] font-mono font-bold text-slate-200 tracking-wider">SECURE ACCESS MATRIX</span>
                  </div>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/25 text-[#00D9FF] leading-none">{userProfile.accessLevel}</span>
                </div>
                <div className="space-y-1 text-[10.5px] font-mono p-2.5 bg-slate-950/40 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center"><span className="text-slate-500">Identity:</span><span className="text-white font-bold">{userProfile.name}</span></div>
                  <div className="flex justify-between items-center pt-1.5"><span className="text-slate-500">Role:</span><span className="text-cyan-400 font-semibold">{userProfile.role}</span></div>
                  <div className="flex justify-between items-center pt-1.5"><span className="text-slate-500">Clearance:</span><span className="text-emerald-400 font-bold">{userProfile.clearance}</span></div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">VERIFIED PERMISSIONS</span>
                  <div className="grid grid-cols-2 gap-1.5 font-sans">
                    <PermissionBadge permission="Tender Intelligence" granted={currentTenant.permissions.tenderIntel} />
                    <PermissionBadge permission="Compliance" granted={currentTenant.permissions.governance} />
                    <PermissionBadge permission="Digital Twin" granted={currentTenant.permissions.digitalTwin} />
                    <PermissionBadge permission="AI Copilot" granted={currentTenant.permissions.aiAgents} />
                    <PermissionBadge permission="Analytics" granted={currentTenant.permissions.analytics} />
                    <PermissionBadge permission="SLA Contracts" granted={currentTenant.permissions.contracts} />
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-2.5 space-y-2 text-[9px] font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>GOVERNANCE:</span>
                    <span className="text-emerald-400 font-bold">● COMPLIANT</span>
                  </div>
                  <button
                    onClick={() => {
                      setNotifications(prev => [{ id: Date.now().toString(), type: 'security', text: "Audit security packet successfully submitted. 256-bit handshake verified." }, ...prev]);
                      setShowNotifications(true);
                      setShowUserDropdown(false);
                    }}
                    className="w-full py-1.5 bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20 text-[9px] font-black border border-cyan-500/25 rounded-lg text-center cursor-pointer transition-colors"
                  >
                    FORGE SECURE TELEMETRY HANDSHAKE
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 text-[9px] font-black border border-rose-500/20 rounded-lg text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Power className="w-3 h-3" /> TERMINATE SESSION & LOGOUT
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
