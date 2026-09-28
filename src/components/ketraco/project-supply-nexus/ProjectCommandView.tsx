import React, { useState } from 'react';
import { KPICommandStrip } from './KPICommandStrip';
import { PortfolioConstellation } from './PortfolioConstellation';
import { CriticalExceptions } from './CriticalExceptions';
import { AtlasAICopilot } from './AtlasAICopilot';
import { PDSControlTower } from './PDSControlTower';
import { ProjectHealthGenome } from './ProjectHealthGenome';
import { ProjectDelta } from './ProjectDelta';
import { LiveProjectMap } from './LiveProjectMap';
import { SupplyReadiness } from './SupplyReadiness';
import { ConstructionIntelligence } from './ConstructionIntelligence';
import { FinancialControl } from './FinancialControl';
import { FreshnessIndicator } from './shared/FreshnessIndicator';
import { ProjectTelemetryState } from './adapters/projectApi';
import { ConstellationNode, CriticalException } from './types';
import { ProjectLifecycleVisualizer } from './ProjectLifecycleVisualizer';
import { ProjectFiveSecondSummary } from './ProjectFiveSecondSummary';
import {
  Layers,
  MapPin,
  Activity,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  Truck
} from 'lucide-react';

interface ProjectCommandViewProps {
  telemetry: ProjectTelemetryState;
  selectedNodeId: string;
  onSelectNode: (node: ConstellationNode) => void;
  onAskCopilot?: (prompt: string) => void;
  onInvestigateException?: (exc: CriticalException) => void;
}

export const ProjectCommandView: React.FC<ProjectCommandViewProps> = ({
  telemetry,
  selectedNodeId,
  onSelectNode,
  onAskCopilot,
  onInvestigateException
}) => {
  const [operationalTab, setOperationalTab] = useState<'NETWORK' | 'EXCEPTIONS' | 'GENOME' | 'SUPPLY' | 'FINANCE'>('NETWORK');

  const fallbackNode = {
    id: 'proj_mombasa_nairobi',
    code: 'KET-PDS-0042',
    name: 'Mombasa–Nairobi 400kV Transmission Project',
    stage: 'CONSTRUCTION',
    health: 'HEALTHY',
    healthScore: 88,
    progress: 74,
    budgetSpentPct: 68,
    owner: 'KETRACO Major Projects',
    epcContractor: 'Larsen & Toubro Ltd',
    targetDate: '2026-11-30'
  } as any;

  const selectedNode =
    telemetry?.nodes?.find(n => n.id === selectedNodeId) ||
    telemetry?.nodes?.find(n => n.name?.toLowerCase().includes('mombasa')) ||
    telemetry?.nodes?.[0] ||
    fallbackNode;

  const handleMapSelectProject = (projectName: string) => {
    if (!projectName || !telemetry?.nodes) return;
    const token = projectName.toLowerCase().split(' ')[0] || '';
    const matched = telemetry.nodes.find(n =>
      n.name?.toLowerCase().includes(token)
    );
    if (matched) {
      onSelectNode(matched);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[#05080e]">
      
      {/* Title & Live Status Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              PROJECT SUPPLY NEXUS
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight mt-0.5">
            Project Command & Lifecycle Architecture
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            End-to-end transmission capital project delivery, supply chain readiness, and statutory gate governance
          </p>
        </div>

        <FreshnessIndicator
          lastUpdated={telemetry.lastUpdated}
          isLive={telemetry.status === 'LIVE'}
          freshnessSeconds={telemetry.dataFreshnessSeconds}
        />
      </div>

      {/* 1. 5-SECOND EXECUTIVE OVERVIEW: Answers the 6 vital operational questions */}
      <ProjectFiveSecondSummary
        selectedNode={selectedNode}
        allNodes={telemetry.nodes}
        onSelectProject={onSelectNode}
        onAskCopilot={onAskCopilot}
      />

      {/* 2. PRIMARY: 12-STAGE CANONICAL ENTERPRISE LIFECYCLE VISUALIZATION */}
      <ProjectLifecycleVisualizer
        projectName={selectedNode.name}
        projectCode={selectedNode.code || 'KET-PDS-0042'}
        onSelectStage={(stage) => {
          if (onAskCopilot) {
            onAskCopilot(`Provide detailed gate audit breakdown for stage ${stage.name} on project ${selectedNode.name}`);
          }
        }}
      />

      {/* 3. LEVEL 1 KPI COMMAND STRIP */}
      <div className="pt-1">
        <KPICommandStrip kpis={telemetry.kpis} />
      </div>

      {/* 4. SECONDARY: PROJECT INTELLIGENCE & OPERATIONAL HUDS */}
      <div className="space-y-4">
        
        {/* Operational Section Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider mr-2">
              PROJECT INTELLIGENCE:
            </span>

            <button
              onClick={() => setOperationalTab('NETWORK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                operationalTab === 'NETWORK'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Constellation & GIS Map</span>
            </button>

            <button
              onClick={() => setOperationalTab('EXCEPTIONS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                operationalTab === 'EXCEPTIONS'
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Exceptions & AI Copilot</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-900/80 text-rose-200 text-[10px] font-bold">
                {telemetry.exceptions.length}
              </span>
            </button>

            <button
              onClick={() => setOperationalTab('GENOME')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                operationalTab === 'GENOME'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Health Genome & PDS Tower</span>
            </button>

            <button
              onClick={() => setOperationalTab('SUPPLY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                operationalTab === 'SUPPLY'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Supply Readiness & Construction</span>
            </button>

            <button
              onClick={() => setOperationalTab('FINANCE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                operationalTab === 'FINANCE'
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.2)] font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financial Control & Variations</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {operationalTab === 'NETWORK' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 h-[420px]">
              <PortfolioConstellation
                nodes={telemetry.nodes}
                edges={telemetry.edges}
                selectedNodeId={selectedNode.id}
                onSelectNode={onSelectNode}
              />
            </div>
            <div className="lg:col-span-5 h-[420px]">
              <LiveProjectMap
                layers={telemetry.layers}
                selectedProjectName={selectedNode.name}
                selectedProgress={selectedNode.progress}
                onSelectProject={handleMapSelectProject}
              />
            </div>
          </div>
        )}

        {operationalTab === 'EXCEPTIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 h-[400px]">
              <CriticalExceptions
                exceptions={telemetry.exceptions}
                onInvestigate={onInvestigateException}
                onSimulate={exc =>
                  onAskCopilot?.(`Simulate impact of exception: ${exc.title} for ${exc.project}`)
                }
                onRecoveryPlan={exc =>
                  onAskCopilot?.(`Generate recovery plan for: ${exc.title} on ${exc.project}`)
                }
              />
            </div>
            <div className="lg:col-span-5 h-[400px]">
              <AtlasAICopilot
                onAskCopilot={onAskCopilot}
                onInvestigateAnomaly={() =>
                  onAskCopilot?.('Investigate why supplier delivery probability dropped from 88% to 71%')
                }
                onSimulateAnomaly={() =>
                  onAskCopilot?.('Simulate schedule delay if conductor factory shipment is delayed 14 days')
                }
                onCreateRecoveryPlan={() =>
                  onAskCopilot?.('Draft alternative procurement routing and buffer allocation for conductor supply')
                }
              />
            </div>
          </div>
        )}

        {operationalTab === 'GENOME' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 h-[380px]">
              <ProjectHealthGenome
                dimensions={telemetry.genome}
                projectCode={selectedNode.code || 'KET-PDS-0042'}
                projectName={selectedNode.name}
                overallDeliveryConfidence={selectedNode.healthScore || 81.7}
                deliveryDelta={selectedNode.health === 'HEALTHY' ? '▲ +1.8% (7d)' : '▼ -2.4% (7d)'}
              />
            </div>
            <div className="lg:col-span-6 h-[380px]">
              <PDSControlTower stages={telemetry.stages} />
            </div>
          </div>
        )}

        {operationalTab === 'SUPPLY' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 h-[360px]">
              <SupplyReadiness materials={telemetry.materials} />
            </div>
            <div className="lg:col-span-6 h-[360px]">
              <ConstructionIntelligence
                projectCode={selectedNode.code || 'KET-PDS-0042'}
                physicalProgress={selectedNode.progress}
              />
            </div>
          </div>
        )}

        {operationalTab === 'FINANCE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 h-[360px]">
              <FinancialControl />
            </div>
            <div className="lg:col-span-5 h-[360px]">
              <ProjectDelta events={telemetry.deltas} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
