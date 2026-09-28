import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  FolderGit2,
  AlertTriangle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Bell,
  Command,
  ChevronDown,
  UserCheck,
  Check,
  ExternalLink,
  ShieldAlert,
  Zap,
  X
} from 'lucide-react';

interface ProjectHeaderProps {
  onOpenCommandPalette: () => void;
  onFilterChange?: (query: string) => void;
  activeProjectCount?: number;
  riskCount?: number;
  eventCount?: number;
  userName?: string;
  userRole?: string;
  onSelectPersona?: (name: string, role: string) => void;
  onSelectFilter?: (type: 'projects' | 'risks' | 'events') => void;
}

const PERSONAS = [
  { name: 'John Doe', role: 'Project Manager', initials: 'JD', color: 'from-cyan-600 to-indigo-600' },
  { name: 'Grace Mutua', role: 'Commercial Lead', initials: 'GM', color: 'from-purple-600 to-pink-600' },
  { name: 'Eng. Patrick Odhiambo', role: 'Senior Site Engineer', initials: 'PO', color: 'from-amber-600 to-orange-600' },
  { name: 'Dr. Jane M.', role: 'Executive Director (PDS)', initials: 'JM', color: 'from-emerald-600 to-teal-600' }
];

const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Transformer T-042 Sea Transit Delay',
    detail: 'Port arrival revised to 24-Oct (+14d impact on Mombasa 400kV).',
    severity: 'HIGH',
    time: '12m ago',
    unread: true
  },
  {
    id: 'n2',
    title: 'RAP Dispute Cleared',
    detail: 'Parcel 742 deed signed; Section 4 access unblocked.',
    severity: 'NOMINAL',
    time: '45m ago',
    unread: true
  },
  {
    id: 'n3',
    title: 'Variation Claim KES 124M Submitted',
    detail: 'Bedrock depth deviation claim awaiting commercial review.',
    severity: 'MEDIUM',
    time: '2h ago',
    unread: false
  }
];

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  onOpenCommandPalette,
  onFilterChange,
  activeProjectCount = 27,
  riskCount = 4,
  eventCount = 12,
  userName = 'John Doe',
  userRole = 'Project Manager',
  onSelectPersona,
  onSelectFilter
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="h-14 bg-[#070b12] border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-30 shrink-0 relative">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-black text-base tracking-wider text-cyan-400">
            KETRACO
          </span>
          <span className="text-slate-600 font-light">|</span>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-semibold text-sm text-slate-100 tracking-tight">
              Project Supply Nexus
            </span>
            <span className="text-cyan-400 text-xs font-mono font-bold">Ω</span>
          </div>
        </div>
        <span className="hidden xl:inline-block text-[11px] font-mono text-slate-500 pl-2 border-l border-slate-800">
          Intelligence. Coordination. Delivery.
        </span>
      </div>

      {/* Center Search / Command Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-8 px-3 rounded-md bg-[#0d1422] hover:bg-[#111a2c] border border-slate-800 hover:border-cyan-500/40 text-slate-400 text-xs flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            <span className="text-slate-400 group-hover:text-slate-200">
              Ask anything... (projects, suppliers, materials, risks, etc.)
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right status chips & user session */}
      <div className="flex items-center gap-2">
        {/* Project count pill */}
        <button
          onClick={() => {
            onSelectFilter?.('projects');
            onOpenCommandPalette();
          }}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
          title="Explore 27 Active Projects"
        >
          <FolderGit2 className="w-3 h-3 text-cyan-400" />
          <span>{activeProjectCount} Projects</span>
        </button>

        {/* Risk pill */}
        <button
          onClick={() => onSelectFilter?.('risks')}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-400 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
          title="View 4 Critical Exceptions"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>{riskCount} Risks</span>
        </button>

        {/* Events pill */}
        <button
          onClick={() => onSelectFilter?.('events')}
          className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
          title="12 Delta Events Tracked"
        >
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{eventCount} Events</span>
        </button>

        {/* AI Ready pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-semibold">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>AI Ready</span>
        </div>

        {/* System Nominal pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Nominal</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-colors ml-1"
            title={`${unreadCount} Unread Notifications`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0a0f18] border border-cyan-500/40 rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Alerts & Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 transition-colors hover:bg-slate-900/60 ${
                      n.unread ? 'bg-[#0e1625]' : 'bg-[#0a0f18]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            n.severity === 'HIGH'
                              ? 'bg-rose-400'
                              : n.severity === 'MEDIUM'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-200 leading-tight">
                          {n.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal pl-3">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-slate-800 bg-[#070b12] text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar with Persona Switcher */}
        <div className="relative pl-2 border-l border-slate-800" ref={personaRef}>
          <button
            onClick={() => setShowPersonaMenu(prev => !prev)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-800/50 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
              {userName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="hidden 2xl:block text-left">
              <div className="text-xs font-medium text-slate-200 leading-none group-hover:text-white">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                {userRole}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0a0f18] border border-cyan-500/40 rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-2.5 border-b border-slate-800 bg-[#070b12]">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                <div className="text-[10px] text-slate-500">
                  Select role perspective to simulate access policies
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                {PERSONAS.map(p => {
                  const isActive = p.name === userName;
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        onSelectPersona?.(p.name, p.role);
                        setShowPersonaMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                        isActive
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                          : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-tr ${p.color} flex items-center justify-center text-[10px] font-bold text-white font-mono`}
                        >
                          {p.initials}
                        </div>
                        <div>
                          <div className="text-xs font-medium leading-none">{p.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 mt-0.5">{p.role}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
