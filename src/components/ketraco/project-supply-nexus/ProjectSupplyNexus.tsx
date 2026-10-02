import React, { useState, useEffect } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { ProjectNavigation } from './ProjectNavigation';
import { ProjectCommandView } from './ProjectCommandView';
import { ProjectFooter } from './ProjectFooter';
import { CommandPaletteModal } from './CommandPaletteModal';
import { fetchProjectTelemetry, ProjectTelemetryState } from './adapters/projectApi';
import { ConstellationNode, CriticalException } from './types';
import { LoadingState } from './shared/IntelligenceEvidence';
import { useAtlasContext } from '../../../context/AtlasContext';

// Submodule Views
import { PortfolioCommandView } from './modules/command/PortfolioCommandView';
import { ExecutiveCommandView } from './modules/command/ExecutiveCommandView';
import { DevelopmentPipelineView } from './modules/pds/DevelopmentPipelineView';
import { ConceptsWorkspaceView } from './modules/pds/ConceptsWorkspaceView';
import { FeasibilityAssessmentView } from './modules/pds/FeasibilityAssessmentView';
import { FundingStructureView } from './modules/pds/FundingStructureView';
import { ApprovalsManagementView } from './modules/pds/ApprovalsManagementView';
import { GateReadinessView } from './modules/pds/GateReadinessView';
import { Project360WorkspaceView } from './modules/projects/Project360WorkspaceView';
import { ProgramsPortfolioView } from './modules/projects/ProgramsPortfolioView';
import { WorkPackagesBreakdownView } from './modules/projects/WorkPackagesBreakdownView';
import { MilestonesRoadmapView } from './modules/projects/MilestonesRoadmapView';
import { DependenciesGraphView } from './modules/projects/DependenciesGraphView';
import { ScheduleGanttView } from './modules/controls/ScheduleGanttView';
import { CostCBSView } from './modules/controls/CostCBSView';
import { ResourcesWorkforceView } from './modules/controls/ResourcesWorkforceView';
import { ProgressEVMView } from './modules/controls/ProgressEVMView';
import { CriticalPathAnalysisView } from './modules/controls/CriticalPathAnalysisView';

interface ProjectSupplyNexusProps {
  onAskCopilot?: (prompt: string) => void;
}

export function ProjectSupplyNexus({ onAskCopilot }: ProjectSupplyNexusProps) {
  const { selectEntity } = useAtlasContext();
  const [activeView, setActiveView] = useState<string>('project-command');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('mombasa');
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('mombasa');

  const [telemetry, setTelemetry] = useState<ProjectTelemetryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global key listener for Ctrl+K / ⌘+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch telemetry
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const data = await fetchProjectTelemetry();
      if (!cancelled) {
        setTelemetry(data);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectNode = (node: ConstellationNode) => {
    setSelectedNodeId(node.id);
    selectEntity({
      id: node.id,
      type: 'PROJECT',
      label: node.name,
      status: node.status,
      source: 'Project Supply Nexus',
      metadata: { stage: node.stage, progress: `${node.progress}%`, activeRisks: node.activeRiskCount, confidence: `${Math.round(node.confidence * 100)}%` },
    });
  };

  const handleInvestigateException = (exc: CriticalException) => {
    onAskCopilot?.(`Investigate exception [${exc.code}]: ${exc.title} affecting project ${exc.project}`);
  };

  if (isLoading || !telemetry) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#05080e] min-h-[500px]">
        <LoadingState message="Initializing Project Supply Nexus Command Fabric..." />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#05080e] text-slate-100 overflow-hidden select-none font-sans"
      id="project-supply-nexus"
    >
      {/* 04 - Global Command Bar */}
      <ProjectHeader
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        activeProjectCount={27}
        riskCount={4}
        eventCount={12}
        userName="John Doe"
        userRole="Project Manager"
      />

      {/* Main Content Area: Left Navigation + Center Workspace View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 05 - Left Navigation */}
        <ProjectNavigation
          activeView={activeView}
          onSelectView={viewId => {
            setActiveView(viewId);
            setNavCollapsed(true);
          }}
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed(prev => !prev)}
        />

        {/* Dynamic Sub-view Stage */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'project-command' && (
            <ProjectCommandView
              telemetry={telemetry}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onAskCopilot={onAskCopilot}
              onInvestigateException={handleInvestigateException}
            />
          )}

          {/* Module Group 1: Command */}
          {(activeView === 'portfolio-view' || activeView === 'portfolio-command') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <PortfolioCommandView
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'executive-view' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ExecutiveCommandView
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {/* Module Group 2: PDS */}
          {(activeView === 'dev-pipeline' || activeView === 'pds-pipeline') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <DevelopmentPipelineView
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {(activeView === 'concepts' || activeView === 'pds-concepts') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ConceptsWorkspaceView
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {(activeView === 'feasibility' || activeView === 'pds-feasibility') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <FeasibilityAssessmentView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {(activeView === 'funding' || activeView === 'pds-funding') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <FundingStructureView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {(activeView === 'approvals' || activeView === 'pds-approvals') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ApprovalsManagementView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {(activeView === 'gate-readiness' || activeView === 'pds-gate') && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <GateReadinessView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {/* Module Group 3: Projects */}
          {activeView === 'project-360' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <Project360WorkspaceView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'programs' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ProgramsPortfolioView
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'work-packages' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <WorkPackagesBreakdownView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'milestones' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <MilestonesRoadmapView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'dependencies' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <DependenciesGraphView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {/* Module Group 4: Controls */}
          {activeView === 'schedule' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ScheduleGanttView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'cost' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <CostCBSView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'resources' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ResourcesWorkforceView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'progress' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <ProgressEVMView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {activeView === 'critical-path' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#05080e] custom-scrollbar">
              <CriticalPathAnalysisView
                projectId={selectedProjectId}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onNavigateView={(view) => setActiveView(view)}
              />
            </div>
          )}

          {/* Fallback for subsequent module groups (Supply, Commercial, Delivery, etc.) */}
          {![
            'project-command',
            'portfolio-view',
            'portfolio-command',
            'executive-view',
            'dev-pipeline',
            'pds-pipeline',
            'concepts',
            'pds-concepts',
            'feasibility',
            'pds-feasibility',
            'funding',
            'pds-funding',
            'approvals',
            'pds-approvals',
            'gate-readiness',
            'pds-gate',
            'project-360',
            'programs',
            'work-packages',
            'milestones',
            'dependencies',
            'schedule',
            'cost',
            'resources',
            'progress',
            'critical-path'
          ].includes(activeView) && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#05080e]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-display font-bold text-white capitalize">
                    {activeView.replace(/-/g, ' ')}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Project Supply Nexus • Part 2 Scope
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('project-command')}
                  className="px-3 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 rounded text-xs font-mono text-cyan-300"
                >
                  ← Return to Project Command
                </button>
              </div>

              <div className="p-6 rounded-lg bg-[#0a0f18] border border-slate-800 space-y-3 text-center py-12">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <span className="font-mono text-cyan-400 font-bold">2.0</span>
                </div>
                <h3 className="text-sm font-mono text-slate-200 uppercase tracking-wider">
                  {activeView.replace(/-/g, ' ')} Module Reserved
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Command, PDS, Projects, and Controls modules are fully operational in Part 1. Supply, Commercial, Delivery, and AI modules are scheduled for the next release tranche.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setActiveView('portfolio-view')}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono transition-all"
                  >
                    Open Portfolio Command
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Bottom Status Bar */}
      <ProjectFooter
        dataFreshnessSeconds={telemetry.dataFreshnessSeconds}
        lastSyncTime={telemetry.lastUpdated}
        isSyncing={false}
      />

      {/* Search / Command Palette Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectResult={item => {
          onAskCopilot?.(`Inspect details for ${item.type}: ${item.title} (${item.code})`);
        }}
      />
    </div>
  );
}
