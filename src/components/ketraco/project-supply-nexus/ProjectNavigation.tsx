import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Layers,
  BarChart3,
  GitPullRequest,
  Lightbulb,
  FileSearch,
  DollarSign,
  CheckSquare,
  ShieldCheck,
  FolderKanban,
  Calendar,
  Boxes,
  Compass,
  Clock,
  Coins,
  Users2,
  TrendingUp,
  Workflow,
  Package,
  Cpu,
  ShoppingCart,
  Truck,
  FileText,
  Scale,
  FileSignature,
  CreditCard,
  HardHat,
  Eye,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  Binary,
  Brain,
  Vote,
  Bot,
  Activity,
  UserCheck,
  Zap,
  ChevronLeft
} from 'lucide-react';

interface ProjectNavigationProps {
  activeView: string;
  onSelectView: (viewId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavGroup {
  id: string;
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'PROJECT-INTELLIGENCE',
    title: 'PROJECT INTELLIGENCE',
    items: [
      { id: 'project-command', label: 'Project Command', icon: LayoutDashboard },
      { id: 'portfolio-view', label: 'Portfolio View', icon: Layers },
      { id: 'executive-view', label: 'Executive View', icon: BarChart3 },
      { id: 'project-360', label: 'Project 360', icon: FolderKanban },
      { id: 'programs', label: 'Programs', icon: Layers },
      { id: 'work-packages', label: 'Work Packages', icon: Boxes },
      { id: 'milestones', label: 'Milestones', icon: Calendar },
      { id: 'dependencies', label: 'Dependencies', icon: Compass },
    ]
  },
  {
    id: 'DEVELOPMENT',
    title: 'DEVELOPMENT',
    items: [
      { id: 'dev-pipeline', label: 'Development Pipeline', icon: GitPullRequest },
      { id: 'concepts', label: 'Concepts', icon: Lightbulb },
      { id: 'feasibility', label: 'Feasibility', icon: FileSearch },
      { id: 'funding', label: 'Funding', icon: DollarSign },
      { id: 'approvals', label: 'Approvals', icon: CheckSquare },
      { id: 'gate-readiness', label: 'Gate Readiness', icon: ShieldCheck },
    ]
  },
  {
    id: 'DELIVERY',
    title: 'DELIVERY',
    items: [
      { id: 'requirements', label: 'Requirements', icon: Package },
      { id: 'materials', label: 'Materials', icon: Cpu },
      { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'logistics', label: 'Logistics', icon: Truck },
      { id: 'contracts', label: 'Contracts', icon: FileText },
      { id: 'obligations', label: 'Obligations', icon: Scale },
      { id: 'variations', label: 'Variations', icon: FileSignature },
      { id: 'claims', label: 'Claims', icon: AlertOctagon },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'construction', label: 'Construction', icon: HardHat },
      { id: 'field-progress', label: 'Field Progress', icon: Eye },
      { id: 'qa-qc', label: 'QA/QC', icon: CheckCircle },
      { id: 'issues', label: 'Issues', icon: AlertOctagon },
      { id: 'commissioning', label: 'Commissioning', icon: Zap },
      { id: 'handover', label: 'Handover', icon: CheckSquare },
    ]
  },
  {
    id: 'CONTROL',
    title: 'CONTROL',
    items: [
      { id: 'schedule', label: 'Schedule', icon: Clock },
      { id: 'cost', label: 'Cost', icon: Coins },
      { id: 'resources', label: 'Resources', icon: Users2 },
      { id: 'progress', label: 'Progress', icon: TrendingUp },
      { id: 'critical-path', label: 'Critical Path', icon: Workflow },
      { id: 'risk', label: 'Risk', icon: ShieldAlert },
      { id: 'gates', label: 'Gates', icon: ShieldCheck },
      { id: 'decisions', label: 'Decisions', icon: Vote },
      { id: 'compliance', label: 'Compliance', icon: FileText },
      { id: 'audit', label: 'Audit', icon: FileSearch },
    ]
  },
  {
    id: 'INTELLIGENCE',
    title: 'INTELLIGENCE',
    items: [
      { id: 'project-graph', label: 'Project Graph', icon: Binary },
      { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
      { id: 'scenarios', label: 'Scenarios', icon: Workflow },
      { id: 'ai-recommendations', label: 'AI Recommendations', icon: Sparkles },
      { id: 'project-memory', label: 'Project Memory', icon: Brain },
      { id: 'agent-fleet', label: 'Agent Fleet', icon: Bot },
      { id: 'agent-runs', label: 'Agent Runs', icon: Activity },
      { id: 'human-approvals', label: 'Human Approvals', icon: UserCheck },
      { id: 'ai-performance', label: 'AI Performance', icon: Zap },
    ]
  }
];

const VIEW_ALIASES: Record<string, string> = {
  'portfolio-command': 'portfolio-view',
  'pds-pipeline': 'dev-pipeline',
  'pds-concepts': 'concepts',
  'pds-feasibility': 'feasibility',
  'pds-funding': 'funding',
  'pds-approvals': 'approvals',
  'pds-gate': 'gate-readiness',
};

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  activeView,
  onSelectView,
  collapsed = false,
  onToggleCollapse
}) => {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [retractedAfterSelect, setRetractedAfterSelect] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'PROJECT-INTELLIGENCE': true,
    DEVELOPMENT: true,
    DELIVERY: true,
    CONTROL: true,
    INTELLIGENCE: true,
  });

  const isCompact = collapsed && (retractedAfterSelect || (!hovered && !focusWithin));

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setHovered(true);
    }
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setRetractedAfterSelect(false);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setFocusWithin(false);
    setRetractedAfterSelect(false);
  };

  const selectView = (viewId: string) => {
    onSelectView(viewId);
    setRetractedAfterSelect(true);
    setFocusWithin(false);
  };

  const toggleNavigation = () => {
    setRetractedAfterSelect(!collapsed);
    setFocusWithin(false);
    onToggleCollapse?.();
  };

  return (
    <nav
      className="relative z-30 h-full w-14 shrink-0"
      aria-label="Project Supply Nexus navigation"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => {
        setFocusWithin(true);
        setRetractedAfterSelect(false);
      }}
      onBlurCapture={handleBlur}
    >
      <div
        className={`project-navigation-panel absolute inset-y-0 left-0 flex flex-col justify-between overflow-hidden rounded-r-xl transition-[width] duration-200 ease-out ${
          isCompact ? 'w-14' : 'w-60'
        }`}
      >
        <div className="project-navigation-content flex-1 overflow-y-auto py-2 px-1.5 space-y-3 custom-scrollbar">
          {!isCompact && (
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-200 uppercase">
                Project Nexus
              </span>
              <span className="text-[9px] font-mono text-slate-300/80 uppercase tracking-wider">
                Navigation
              </span>
            </div>
          )}
          {NAV_GROUPS.map(group => {
            const isExpanded = expandedGroups[group.id] ?? true;

            return (
              <div key={group.id} className="space-y-0.5">
                {!isCompact && (
                  <button
                    type="button"
                    onClick={() => setExpandedGroups(current => ({
                      ...current,
                      [group.id]: !current[group.id]
                    }))}
                    className="atlas-shell-focus w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold tracking-wider text-slate-200/90 hover:text-white uppercase transition-colors"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${group.title} navigation`}
                  >
                    <span>{group.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-slate-300" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-300" aria-hidden="true" />
                    )}
                  </button>
                )}

                {(isCompact || isExpanded) && (
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = (VIEW_ALIASES[activeView] ?? activeView) === (VIEW_ALIASES[item.id] ?? item.id);
                      const IconComponent = item.icon;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectView(item.id)}
                          title={item.label}
                          aria-label={item.label}
                          aria-current={isActive ? 'page' : undefined}
                          className={`atlas-shell-focus w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-[background-color,color,border-color] ${
                            isActive
                              ? 'bg-cyan-400/10 text-cyan-100 font-semibold border border-cyan-300/35 shadow-[inset_2px_0_0_rgba(87,236,255,0.75)]'
                              : 'border border-transparent text-slate-200 hover:text-white hover:bg-white/10'
                          } ${isCompact ? 'justify-center' : ''}`}
                        >
                          <IconComponent
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-cyan-200' : 'text-slate-300'
                            }`}
                            aria-hidden="true"
                          />
                          {!isCompact && <span className="truncate text-left">{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="project-navigation-content p-2 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-slate-200/90">
          {!isCompact && (
            <div className="flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3 h-3 text-emerald-300" aria-hidden="true" />
              <span>KETRACO v2.0.0</span>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={toggleNavigation}
              className="atlas-shell-focus p-1.5 text-slate-200 hover:text-white rounded hover:bg-white/10 transition-colors ml-auto"
              aria-label={collapsed ? 'Pin navigation expanded' : 'Collapse navigation'}
              title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-expanded={!collapsed}
            >
              <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
