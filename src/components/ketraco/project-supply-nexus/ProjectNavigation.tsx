import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FolderKanban,
  Package,
  Calendar,
  Compass,
  Clock,
  Coins,
  TrendingUp,
  Workflow,
  Lightbulb,
  FileSearch,
  DollarSign,
  CheckSquare,
  ShieldCheck,
  ShoppingCart,
  Truck,
  FileText,
  Users2,
  Boxes,
  HardHat,
  ShieldAlert,
  Activity,
} from 'lucide-react';

interface ProjectNavigationProps {
  activeView: string;
  onSelectView: (viewId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavDomain {
  id: string;
  number: string;
  label: string;
  viewId: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const NAV_DOMAINS: NavDomain[] = [
  {
    id: 'project-360',
    number: '01',
    label: 'Project 360',
    viewId: 'project-360',
    icon: FolderKanban,
    children: [
      { id: 'programs', label: 'Programs', icon: FolderKanban },
      { id: 'work-packages', label: 'Work Packages', icon: Boxes },
      { id: 'milestones', label: 'Milestones', icon: Calendar },
      { id: 'dependencies', label: 'Dependencies', icon: Compass },
      { id: 'schedule', label: 'Schedule', icon: Clock },
      { id: 'cost', label: 'Cost', icon: Coins },
      { id: 'resources', label: 'Resources', icon: Users2 },
      { id: 'progress', label: 'Progress', icon: TrendingUp },
      { id: 'critical-path', label: 'Critical Path', icon: Workflow },
    ],
  },
  {
    id: 'demand-planning',
    number: '02',
    label: 'Demand & Planning',
    viewId: 'dev-pipeline',
    icon: Package,
    children: [
      { id: 'concepts', label: 'Concepts', icon: Lightbulb },
      { id: 'feasibility', label: 'Feasibility', icon: FileSearch },
      { id: 'funding', label: 'Funding', icon: DollarSign },
      { id: 'approvals', label: 'Approvals', icon: CheckSquare },
      { id: 'gate-readiness', label: 'Gate Readiness', icon: ShieldCheck },
    ],
  },
  {
    id: 'sourcing-procurement',
    number: '03',
    label: 'Sourcing & Procurement',
    viewId: 'procurement',
    icon: ShoppingCart,
  },
  {
    id: 'supplier-command',
    number: '04',
    label: 'Supplier Command',
    viewId: 'suppliers',
    icon: Users2,
  },
  {
    id: 'contracts-commercial',
    number: '05',
    label: 'Contracts & Commercial',
    viewId: 'contracts',
    icon: FileText,
  },
  {
    id: 'materials-inventory',
    number: '06',
    label: 'Materials & Inventory',
    viewId: 'inventory',
    icon: Boxes,
  },
  {
    id: 'logistics-delivery',
    number: '07',
    label: 'Logistics & Delivery',
    viewId: 'logistics',
    icon: Truck,
  },
  {
    id: 'site-installation',
    number: '08',
    label: 'Site & Installation',
    viewId: 'construction',
    icon: HardHat,
  },
  {
    id: 'risk-exceptions',
    number: '09',
    label: 'Risk & Exceptions',
    viewId: 'risk',
    icon: ShieldAlert,
  },
  {
    id: 'nexus-control-tower',
    number: '10',
    label: 'Nexus Control Tower',
    viewId: 'nexus-control-tower',
    icon: Activity,
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
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

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

  const selectView = (viewId: string, domainId?: string) => {
    onSelectView(viewId);
    if (domainId) {
      setExpandedDomains(current => ({ ...current, [domainId]: true }));
    }
    setRetractedAfterSelect(true);
    setFocusWithin(false);
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(current => ({ ...current, [domainId]: !current[domainId] }));
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
          isCompact ? 'w-14' : 'w-72'
        }`}
      >
        <div className="project-navigation-content flex-1 overflow-y-auto py-4 px-2 space-y-4 custom-scrollbar">
          {!isCompact && (
            <div className="px-3 pb-3 border-b border-white/10">
              <span className="block text-sm font-semibold tracking-wide text-white">
                PROJECT SUPPLY NEXUS
              </span>
              <span className="block mt-1 text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                Operational domains
              </span>
            </div>
          )}
          {NAV_DOMAINS.map(domain => {
            const canonicalActiveView = VIEW_ALIASES[activeView] ?? activeView;
            const canonicalViewId = VIEW_ALIASES[domain.viewId] ?? domain.viewId;
            const activeChild = domain.children?.find(child =>
              (VIEW_ALIASES[child.id] ?? child.id) === canonicalActiveView
            );
            const isActive = canonicalActiveView === canonicalViewId;
            const isExpanded = expandedDomains[domain.id] ?? Boolean(activeChild);
            const IconComponent = domain.icon;
            return (
              <div key={domain.id} className="space-y-1">
                <div className={`flex items-center rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-cyan-400/10 border-cyan-300/30 shadow-[inset_2px_0_0_rgba(87,236,255,0.7)]'
                    : activeChild
                      ? 'bg-white/[0.04] border-white/10'
                      : 'border-transparent hover:bg-white/[0.06]'
                }`}>
                  <button
                    type="button"
                    onClick={() => selectView(domain.viewId, domain.children ? domain.id : undefined)}
                    title={`${domain.number} ${domain.label}`}
                    aria-label={`${domain.number} ${domain.label}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`atlas-shell-focus min-w-0 flex-1 flex items-center gap-3 px-3 py-2.5 text-left ${
                      isCompact ? 'justify-center' : ''
                    }`}
                  >
                    <IconComponent className={`w-[18px] h-[18px] shrink-0 ${
                      isActive || activeChild ? 'text-cyan-200' : 'text-slate-300'
                    }`} aria-hidden="true" />
                    {!isCompact && (
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-100">
                        <span className="mr-2 font-mono text-[11px] text-cyan-300/80">{domain.number}</span>
                        {domain.label}
                      </span>
                    )}
                  </button>

                  {!isCompact && domain.children && (
                    <button
                      type="button"
                      onClick={() => toggleDomain(domain.id)}
                      className="atlas-shell-focus mr-2 rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${domain.label} subnavigation`}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  )}
                </div>

                {!isCompact && isExpanded && domain.children && (
                  <div className="ml-5 space-y-0.5 border-l border-white/10 pl-3">
                    {domain.children.map(child => {
                      const isChildActive = (VIEW_ALIASES[child.id] ?? child.id) === canonicalActiveView;
                      const ChildIcon = child.icon;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => selectView(child.id, domain.id)}
                          title={child.label}
                          aria-label={child.label}
                          aria-current={isChildActive ? 'page' : undefined}
                          className={`atlas-shell-focus w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] transition-colors ${
                            isChildActive
                              ? 'bg-cyan-400/10 text-cyan-100 font-semibold'
                              : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <ChildIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="project-navigation-content p-3 border-t border-white/15 flex items-center justify-between text-[11px] font-medium text-slate-200/90">
          {!isCompact && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
              <span>Atlas operational workspace</span>
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
