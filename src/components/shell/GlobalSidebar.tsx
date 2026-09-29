import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, PanelLeftClose, Power, ShieldCheck } from 'lucide-react';
import { useShell } from './ShellContext';
import type { ShellNavItem } from './types';

const GROUP_ORDER = ['COMMAND', 'INTELLIGENCE', 'OPERATIONS', 'FINANCE & RISK', 'AI', 'DATA & PLATFORM', 'SYSTEM'] as const;

interface GlobalSidebarProps {
  items: ShellNavItem[];
  activeModule: string;
  onNavigate: (id: string) => void;
  onShutdown: (msg: string) => void;
}

export default function GlobalSidebar({ items, activeModule, onNavigate, onShutdown }: GlobalSidebarProps) {
  const { breakpoint, mobileOpen, setMobileOpen, sidebarCollapsed, setSidebarCollapsed } = useShell();
  const [hovered, setHovered] = useState(false);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShellNavItem[]>();
    for (const item of items) {
      const key = item.group;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }

    return GROUP_ORDER
      .filter(group => groups.has(group))
      .map(group => ({
        id: group,
        label: group,
        items: groups.get(group) ?? []
      }));
  }, [items]);

  const isMobileNavOpen = breakpoint === 'desktop' ? true : mobileOpen;
  const isCollapsedDesktop = breakpoint === 'desktop' && !hovered && sidebarCollapsed;

  const handleNavigate = (id: string) => {
    onNavigate(id);
    if (breakpoint !== 'desktop') {
      setMobileOpen(false);
    } else {
      setSidebarCollapsed(true);
    }
  };

  const desktopSidebarWidth = isCollapsedDesktop ? 'w-[52px]' : 'w-[248px]';

  return (
    <>
      {breakpoint !== 'desktop' && (
        <div
          className={`fixed inset-0 z-30 bg-slate-950/70 transition-opacity duration-200 ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} md:hidden`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={false}
        onMouseEnter={() => breakpoint === 'desktop' && setHovered(true)}
        onMouseLeave={() => breakpoint === 'desktop' && setHovered(false)}
        animate={{
          x: breakpoint === 'desktop' ? 0 : isMobileNavOpen ? 0 : -20,
          opacity: breakpoint === 'desktop' || isMobileNavOpen ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          z-40 flex h-full shrink-0 flex-col border-r border-white/8 bg-[rgba(8,12,22,0.82)] backdrop-blur-2xl shadow-[0_0_0_1px_rgba(148,163,184,0.08),0_20px_50px_rgba(2,6,23,0.45)]
          ${breakpoint === 'desktop' ? desktopSidebarWidth : 'fixed left-0 top-0 bottom-0 w-[82%] max-w-[290px] shadow-2xl shadow-black/40'}
          ${breakpoint !== 'desktop' && !isMobileNavOpen ? '-translate-x-full hidden' : 'translate-x-0'}
          md:translate-x-0 md:static md:flex
          ${isCollapsedDesktop ? 'overflow-hidden' : ''}
        `}
      >
        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/8 px-2.5 py-2.5">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              onMouseEnter={() => breakpoint === 'desktop' && setHovered(true)}
              onMouseLeave={() => breakpoint === 'desktop' && setHovered(false)}
              className="group flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/25 bg-[#08131d]/80 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200"
              aria-label={isCollapsedDesktop ? 'Expand navigation' : 'Collapse navigation'}
              title={isCollapsedDesktop ? 'Expand navigation' : 'Collapse navigation'}
            >
              <ShieldCheck className="h-4 w-4" />
            </button>

            {!isCollapsedDesktop && (
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <div className="min-w-0 text-center">
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-300">ATLAS</div>
                  <div className="text-[10px] text-slate-300/80">Navigation</div>
                </div>
              </div>
            )}

            {breakpoint !== 'desktop' && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {groupedItems.map(group => (
              <div key={group.id} className={`${isCollapsedDesktop ? 'mb-2' : 'mb-3'} last:mb-0`}>
                {!isCollapsedDesktop && (
                  <div className="mb-2 px-2 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    {group.label}
                  </div>
                )}

                <div className="space-y-1.5">
                  {group.items.map(item => {
                    const active = item.id === activeModule;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        title={isCollapsedDesktop ? item.label : undefined}
                        className={`group relative flex w-full items-center gap-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isCollapsedDesktop
                            ? 'justify-center border-transparent bg-transparent px-0 py-2.5 hover:border-cyan-500/25 hover:bg-[#0f1f2d]/60'
                            : 'border-transparent bg-transparent px-2.5 py-2 hover:border-slate-700/70 hover:bg-[#101827]/75'
                        } ${
                          active
                            ? isCollapsedDesktop
                              ? 'border-cyan-500/30 bg-cyan-950/25 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.08)]'
                              : 'border-cyan-500/30 bg-[#0d1b2a]/80 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)]'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className={`flex shrink-0 items-center justify-center rounded-lg border ${isCollapsedDesktop ? 'h-7 w-7' : 'h-8 w-8'} ${active ? 'border-cyan-500/30 bg-cyan-900/25 text-cyan-300' : 'border-slate-800/80 bg-[rgba(15,23,42,0.8)] text-slate-400 group-hover:text-slate-200'}`}>
                          <Icon className={isCollapsedDesktop ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                        </div>

                        {!isCollapsedDesktop && (
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold leading-none truncate">{item.label}</div>
                            <div className="mt-1 text-[9px] leading-relaxed text-slate-500">{item.desc}</div>
                          </div>
                        )}

                        {!isCollapsedDesktop && (
                          <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-600'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isCollapsedDesktop && (
            <div className="border-t border-white/8 p-2.5">
              <button
                type="button"
                onClick={() => onShutdown('Shutdown requested from enterprise shell.')}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-[rgba(15,23,42,0.8)] px-3 py-2 text-left text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-200 cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[10px] font-medium">
                  <Power className="h-3.5 w-3.5" />
                  Shutdown
                </span>
                <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-slate-500">SAFE</span>
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
