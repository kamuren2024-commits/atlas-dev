import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ZapOff, 
  Flame, 
  ShieldCheck, 
  Layers, 
  BellRing, 
  CloudRain, 
  Share2, 
  Box, 
  Database, 
  ChevronDown, 
  TrendingUp, 
  Cpu, 
  GitPullRequest, 
  Eye, 
  Target,
  Sparkles,
  GitMerge,
  Building2
} from 'lucide-react';
import { COMMAND_MODES, CommandModeKey } from './tokens';

interface ModeSwitcherProps {
  currentMode: CommandModeKey;
  onSelectMode: (mode: CommandModeKey) => void;
  activeLevel?: number;
  onScrollToLevel?: (level: number) => void;
}

export default function ModeSwitcher({
  currentMode,
  onSelectMode,
  activeLevel,
  onScrollToLevel
}: ModeSwitcherProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity': return <Activity className="w-3.5 h-3.5" />;
      case 'TrendingUp': return <TrendingUp className="w-3.5 h-3.5" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5" />;
      case 'GitPullRequest': return <GitPullRequest className="w-3.5 h-3.5" />;
      case 'Eye': return <Eye className="w-3.5 h-3.5" />;
      case 'AlertTriangle': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'ZapOff': return <ZapOff className="w-3.5 h-3.5" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Layers': return <Layers className="w-3.5 h-3.5" />;
      case 'BellRing': return <BellRing className="w-3.5 h-3.5" />;
      case 'CloudRain': return <CloudRain className="w-3.5 h-3.5" />;
      case 'Target': return <Target className="w-3.5 h-3.5" />;
      case 'Share2': return <Share2 className="w-3.5 h-3.5" />;
      case 'Box': return <Box className="w-3.5 h-3.5" />;
      case 'Database': return <Database className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'GitMerge': return <GitMerge className="w-3.5 h-3.5" />;
      case 'Building2': return <Building2 className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const operationalLevels = [
    { level: 0, label: 'L0 Map/Twin', targetId: 'level-0-stage' },
    { level: 1, label: 'L1 System Ops', targetId: 'level-1-ops' },
    { level: 2, label: 'L2 Transmission', targetId: 'level-2-transmission' },
    { level: 3, label: 'L3 Asset Health', targetId: 'level-3-assets' },
    { level: 4, label: 'L4 Risk Matrix', targetId: 'level-4-risk' },
    { level: 5, label: 'L5 Outages & Alarms', targetId: 'level-5-outages' },
    { level: 6, label: 'L6 Forecast & Met', targetId: 'level-6-forecast' },
    { level: 7, label: 'L7 Graph & AI', targetId: 'level-7-ai' },
  ];

  return (
    <div className="w-full bg-[#080d1a] border-b border-slate-800/80 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none shadow-inner z-20">
      
      {/* Mode Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-2 border-r border-slate-800 mr-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          OP-MODE:
        </span>

        {COMMAND_MODES.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono tracking-wide font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
              title={mode.desc}
            >
              {getIcon(mode.icon)}
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Level Navigator */}
      <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-3">
        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold mr-1">
          DENSITY LEVEL:
        </span>
        {operationalLevels.map((lvl) => {
          const isLvlActive = activeLevel === lvl.level;
          return (
            <button
              key={lvl.level}
              onClick={() => {
                onScrollToLevel?.(lvl.level);
                const el = document.getElementById(lvl.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                isLvlActive
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              L{lvl.level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
