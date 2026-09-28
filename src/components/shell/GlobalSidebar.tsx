import React, { useMemo } from 'react';
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
  const { breakpoint, mobileOpen, setMobileOpen } = useShell();

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
        animate={{
          x: breakpoint === 'desktop' ? 0 : isMobileNavOpen ? 0 : -20,
          opacity: breakpoint === 'desktop' || isMobileNavOpen ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          z-40 flex h-full shrink-0 flex-col border-r border-slate-800/80 bg-[#070d18]/95 backdrop-blur-xl
          ${breakpoint === 'desktop' ? 'w-72' : 'fixed left-0 top-0 bottom-0 w-[82%] max-w-[290px] shadow-2xl shadow-black/40'}
          ${breakpoint !== 'desktop' && !isMobileNavOpen ? '-translate-x-full hidden' : 'translate-x-0'}
          md:translate-x-0 md:static md:flex
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">ATLAS</div>
              <div className="text-[11px] font-medium text-slate-300 truncate">Operations shell</div>
            </div>
          </div>

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

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {groupedItems.map(group => (
            <div key={group.id} className="mb-4 last:mb-0">
              <div className="mb-2 px-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map(item => {
                  const active = item.id === activeModule;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        if (breakpoint !== 'desktop') setMobileOpen(false);
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all cursor-pointer ${
                        active
                          ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.08)]'
                          : 'border-transparent bg-transparent text-slate-300 hover:border-slate-700/80 hover:bg-slate-900/40 hover:text-white'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${active ? 'border-cyan-500/40 bg-cyan-900/25 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-400 group-hover:text-slate-200'}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold leading-none truncate">{item.label}</div>
                        <div className="mt-1 text-[10px] text-slate-500 line-clamp-2">{item.desc}</div>
                      </div>

                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-cyan-300' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800/80 p-3">
          <button
            type="button"
            onClick={() => onShutdown('Shutdown requested from enterprise shell.')}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-left text-slate-300 transition-colors hover:border-rose-500/40 hover:text-rose-200 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-[11px] font-medium">
              <Power className="h-4 w-4" />
              Shutdown
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">SAFE</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
