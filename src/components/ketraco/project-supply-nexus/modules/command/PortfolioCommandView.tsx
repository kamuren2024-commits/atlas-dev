import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Filter, 
  Box, 
  Users, 
  ArrowUpRight,
  Search,
  Network,
  Activity,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
  X,
  Send,
  Zap,
  Check,
  Building,
  FileText
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { 
  PORTFOLIO_OVERVIEW_METRICS,
  PORTFOLIO_DELAYED_PROJECTS,
  PORTFOLIO_CRITICAL_PROJECTS,
  FINANCIAL_EXPOSURE_DATA,
  SUPPLY_EXPOSURE_DATA,
  RESOURCE_CONFLICTS_DATA,
  COMMISSIONING_PIPELINE_DATA,
  PORTFOLIO_RISKS_DATA
} from '../../adapters/fixtures';
import { MASTER_PROJECTS } from '../../adapters/fixturesProjects';
import { ProjectViewMode } from '../../types';

interface PortfolioCommandViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

// Constellation entity node model
interface ConstellationNode {
  id: string;
  name: string;
  code: string;
  type: 'PROGRAM' | 'PROJECT' | 'MILESTONE' | 'SUPPLIER' | 'CONTRACT' | 'ASSET';
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  x: number;
  y: number;
  parentId?: string;
  details: {
    lead: string;
    value?: string;
    progress?: number;
    risk?: string;
    nextMilestone?: string;
  };
}

const CONSTELLATION_NODES: ConstellationNode[] = [
  // Programs
  { id: 'prog-coast', name: 'Coast Transmission Program', code: 'PRG-CST-01', type: 'PROGRAM', status: 'AT_RISK', x: 220, y: 120, details: { lead: 'Eng. Sarah Ochieng', value: 'KES 42.5B', progress: 58, risk: 'Wayleave compensation disputes in Mariakani' } },
  { id: 'prog-lapsset', name: 'LAPSSET Energy Backbone', code: 'PRG-LAP-02', type: 'PROGRAM', status: 'HEALTHY', x: 500, y: 90, details: { lead: 'Eng. Paul Kiptoo', value: 'KES 84.0B', progress: 72, risk: 'Seasonal wildlife corridor restrictions' } },
  { id: 'prog-western', name: 'Western Geothermal Grid', code: 'PRG-WST-03', type: 'PROGRAM', status: 'AT_RISK', x: 780, y: 130, details: { lead: 'Eng. Moses Chebet', value: 'KES 31.8B', progress: 61, risk: 'Escarpment geotechnical ground subsidence' } },

  // Projects
  { id: 'prj-mombasa', name: 'Mombasa 400kV Ring', code: 'KET-PDS-0042', type: 'PROJECT', status: 'AT_RISK', x: 160, y: 260, parentId: 'prog-coast', details: { lead: 'Eng. David Gitau', value: 'KES 6.10B', progress: 53.4, risk: 'Transformer T-204 sea freight transit delay' } },
  { id: 'prj-dongo', name: 'Dongo Kundu SEZ 220kV', code: 'KET-DEV-0072', type: 'PROJECT', status: 'HEALTHY', x: 290, y: 270, parentId: 'prog-coast', details: { lead: 'Eng. Collins Oloo', value: 'KES 3.80B', progress: 41.0, risk: 'Port berth civil foundation clearances' } },
  { id: 'prj-lamu', name: 'Lamu - Isiolo 400kV Line', code: 'KET-PDS-0036', type: 'PROJECT', status: 'HEALTHY', x: 460, y: 240, parentId: 'prog-lapsset', details: { lead: 'Eng. Brian Ndwiga', value: 'KES 11.4B', progress: 72.0, risk: 'Remote bush security logistics convoy' } },
  { id: 'prj-garissa', name: 'Garissa 400/220kV Substation', code: 'KET-SUB-0018', type: 'PROJECT', status: 'HEALTHY', x: 570, y: 250, parentId: 'prog-lapsset', details: { lead: 'Eng. Hassan Abdi', value: 'KES 4.20B', progress: 68.5, risk: 'Severe desert heat thermal stress testing' } },
  { id: 'prj-rift', name: 'Rift Valley Geothermal Evacuation', code: 'KET-PDS-0055', type: 'PROJECT', status: 'AT_RISK', x: 740, y: 260, parentId: 'prog-western', details: { lead: 'Eng. Grace Wanjiku', value: 'KES 4.80B', progress: 58.2, risk: 'Geothermal steam pipe crossing clearances' } },
  { id: 'prj-olkaria', name: 'Olkaria IV 400kV Substation Bay', code: 'KET-SUB-0024', type: 'PROJECT', status: 'CRITICAL', x: 860, y: 270, parentId: 'prog-western', details: { lead: 'Eng. Kevin Kiprotich', value: 'KES 2.90B', progress: 49.0, risk: 'GIS switchgear gas leakage testing delay' } },

  // Suppliers / EPCs
  { id: 'sup-lt', name: 'Larsen & Toubro / S&W JV', code: 'EPC-LT-01', type: 'SUPPLIER', status: 'AT_RISK', x: 140, y: 390, details: { lead: 'VP Infrastructure India', value: 'KES 8.2B Active', risk: 'Subcontractor cash-flow constraints' } },
  { id: 'sup-powerchina', name: 'PowerChina International', code: 'EPC-PC-04', type: 'SUPPLIER', status: 'HEALTHY', x: 480, y: 380, details: { lead: 'Director East Africa', value: 'KES 14.5B Active', risk: 'None reported' } },
  { id: 'sup-kec', name: 'KEC International Ltd', code: 'EPC-KEC-02', type: 'SUPPLIER', status: 'AT_RISK', x: 790, y: 390, details: { lead: 'Regional Operations Lead', value: 'KES 6.1B Active', risk: 'Tower steel delivery bottleneck' } },

  // Milestones & Assets
  { id: 'ast-rabai', name: 'Rabai 400/220kV Substation', code: 'AST-SS-001', type: 'ASSET', status: 'HEALTHY', x: 190, y: 490, details: { lead: 'Coast Operations', value: 'Substation Asset', nextMilestone: 'Commissioning Q4 2026' } },
  { id: 'mls-stringing', name: 'Lamu 320km Stringing', code: 'MLS-STR-01', type: 'MILESTONE', status: 'HEALTHY', x: 440, y: 490, details: { lead: 'Line Works Lead', nextMilestone: 'Tensioning Complete Nov 2026' } },
  { id: 'mls-suswa', name: 'Suswa Intertie Switching', code: 'MLS-SW-04', type: 'MILESTONE', status: 'CRITICAL', x: 840, y: 490, details: { lead: 'Relay Protection Engineer', nextMilestone: 'Grid Code Compliance Dec 2026' } }
];

const CONSTELLATION_EDGES = [
  { from: 'prog-coast', to: 'prj-mombasa' },
  { from: 'prog-coast', to: 'prj-dongo' },
  { from: 'prog-lapsset', to: 'prj-lamu' },
  { from: 'prog-lapsset', to: 'prj-garissa' },
  { from: 'prog-western', to: 'prj-rift' },
  { from: 'prog-western', to: 'prj-olkaria' },
  { from: 'prj-mombasa', to: 'sup-lt' },
  { from: 'prj-lamu', to: 'sup-powerchina' },
  { from: 'prj-garissa', to: 'sup-powerchina' },
  { from: 'prj-rift', to: 'sup-kec' },
  { from: 'prj-olkaria', to: 'sup-kec' },
  { from: 'prj-mombasa', to: 'ast-rabai' },
  { from: 'prj-lamu', to: 'mls-stringing' },
  { from: 'prj-olkaria', to: 'mls-suswa' }
];

export const PortfolioCommandView: React.FC<PortfolioCommandViewProps> = ({
  onSelectProject,
  onNavigateView
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONSTELLATION' | 'HEALTH_MATRIX' | 'EXCEPTIONS' | 'DELAYS' | 'EXPOSURES' | 'PIPELINE'>('OVERVIEW');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Constellation interactive state
  const [selectedConstellationNode, setSelectedConstellationNode] = useState<ConstellationNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [constellationFilter, setConstellationFilter] = useState<'ALL' | 'PROGRAM' | 'PROJECT' | 'SUPPLIER'>('ALL');

  // Inspection drawer state
  const [drawerEntity, setDrawerEntity] = useState<{
    title: string;
    code: string;
    type: string;
    status: string;
    details: Record<string, any>;
    projectId?: string;
  } | null>(null);

  // Toast / feedback message state
  const [actionToast, setActionToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const filteredDelayed = PORTFOLIO_DELAYED_PROJECTS.filter((p) => {
    if (filterHealth !== 'ALL' && p.health !== filterHealth) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredMasterProjects = MASTER_PROJECTS.filter((p) => {
    if (filterHealth !== 'ALL' && p.status !== filterHealth) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <UIStateContainer moduleName="Portfolio Command">
      <div className="space-y-4">
        {/* Module Header & Sub-Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">COMMAND GROUP //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PORTFOLIO PULSE
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              National Transmission Grid Portfolio Command
            </h1>
            <p className="text-xs text-slate-400">
              Cross-asset portfolio capital execution, topology network, health matrix & critical exceptions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'OVERVIEW' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & Assets
            </button>
            <button
              onClick={() => setActiveTab('CONSTELLATION')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'CONSTELLATION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3 h-3 text-cyan-400" />
              Portfolio Constellation
            </button>
            <button
              onClick={() => setActiveTab('HEALTH_MATRIX')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'HEALTH_MATRIX' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3 h-3 text-emerald-400" />
              Health Matrix
            </button>
            <button
              onClick={() => setActiveTab('EXCEPTIONS')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'EXCEPTIONS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              Critical Exceptions
            </button>
            <button
              onClick={() => setActiveTab('DELAYS')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'DELAYS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Variance & Delays ({PORTFOLIO_DELAYED_PROJECTS.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPOSURES')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'EXPOSURES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Exposures ({FINANCIAL_EXPOSURE_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('PIPELINE')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'PIPELINE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Commissioning ({COMMISSIONING_PIPELINE_DATA.length})
            </button>
          </div>
        </div>

        {/* Global Action Toast Notification */}
        {actionToast && (
          <div className="p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-lg text-xs font-mono text-cyan-200 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400" />
              <span>{actionToast}</span>
            </div>
            <button onClick={() => setActionToast(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 7-Card Portfolio KPI Strip (Strictly meeting prompt Section 03) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* 1. Portfolio Projects */}
          <div 
            onClick={() => setActiveTab('OVERVIEW')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Portfolio Projects</span>
              <span className="text-[9px] font-mono px-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">HEALTHY</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">27 Active</div>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between mt-0.5">
              <span>+2 YTD New Starts</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 2. Total Program Value */}
          <div 
            onClick={() => setActiveTab('HEALTH_MATRIX')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Program Value</span>
              <span className="text-[9px] font-mono px-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">ON_TARGET</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">KES 342.8B</div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-between mt-0.5">
              <span>+4.2% YoY Capex</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 3. Delivery Confidence */}
          <div 
            onClick={() => setActiveTab('CONSTELLATION')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Delivery Conf.</span>
              <span className="text-[9px] font-mono px-1 rounded text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">HIGH</span>
            </div>
            <div className="text-base font-bold font-mono text-cyan-300 mt-1">88.4%</div>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between mt-0.5">
              <span>+1.2% Trend MoM</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 4. Projects At Risk */}
          <div 
            onClick={() => {
              setFilterHealth('AT_RISK');
              setActiveTab('HEALTH_MATRIX');
            }}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Projects At Risk</span>
              <span className="text-[9px] font-mono px-1 rounded text-amber-400 bg-amber-500/10 border border-amber-500/30">ELEVATED</span>
            </div>
            <div className="text-base font-bold font-mono text-amber-400 mt-1">6 Assets</div>
            <div className="text-[10px] font-mono text-amber-300 flex items-center justify-between mt-0.5">
              <span>-1 This Month</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 5. Delayed Projects */}
          <div 
            onClick={() => setActiveTab('DELAYS')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Delayed Projects</span>
              <span className="text-[9px] font-mono px-1 rounded text-rose-400 bg-rose-500/10 border border-rose-500/30">MONITOR</span>
            </div>
            <div className="text-base font-bold font-mono text-rose-400 mt-1">4 Critical</div>
            <div className="text-[10px] font-mono text-rose-300 flex items-center justify-between mt-0.5">
              <span>+12d Avg Slip</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 6. Upcoming Commissioning */}
          <div 
            onClick={() => setActiveTab('PIPELINE')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Commissioning</span>
              <span className="text-[9px] font-mono px-1 rounded text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">ON_TRACK</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1">5 Bays / Lines</div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-0.5">
              <span>Q4 2026 Target</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 7. Financial Exposure */}
          <div 
            onClick={() => setActiveTab('EXPOSURES')}
            className="bg-[#080d17] p-2.5 rounded border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Exposure</span>
              <span className="text-[9px] font-mono px-1 rounded text-rose-400 bg-rose-500/10 border border-rose-500/30">HIGH</span>
            </div>
            <div className="text-base font-bold font-mono text-rose-400 mt-1">KES 1.84B</div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-0.5">
              <span>Claims & Forex</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Tab 1: Overview & Priority Assets */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Priority Capital Projects */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Priority Capital Transmission Projects
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  Showing top 4 high-capex assets
                </span>
              </div>

              <div className="space-y-2">
                {PORTFOLIO_CRITICAL_PROJECTS.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 bg-[#080d17] border border-slate-800/90 hover:border-cyan-500/40 rounded transition-all group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{proj.code}</span>
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                          {proj.name}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {proj.voltage}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase ${
                          proj.health === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                          proj.health === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        }`}>
                          {proj.health}
                        </span>

                        <button
                          onClick={() => {
                            setDrawerEntity({
                              title: proj.name,
                              code: proj.code,
                              type: 'Transmission Project',
                              status: proj.health,
                              projectId: proj.id,
                              details: {
                                Voltage: proj.voltage,
                                Capex: proj.capex,
                                Progress: `${proj.progress}%`,
                                Confidence: `${proj.confidence}%`,
                                TargetCOD: proj.targetDate,
                                TopRisk: proj.topRisk
                              }
                            });
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          Quick Inspect
                        </button>

                        <button
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigateView('project-360');
                          }}
                          className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 transition-all"
                        >
                          Project 360
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Approved Capex</span>
                        <span className="text-slate-200 font-medium">{proj.capex}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold">{proj.progress}%</span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Target COD</span>
                        <span className="text-slate-200 font-medium">{proj.targetDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Delivery Confidence</span>
                        <span className="text-cyan-400 font-bold">{proj.confidence}%</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/60 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300 font-normal">Top Risk:</strong> {proj.topRisk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Register & Resource Bottlenecks */}
            <div className="space-y-4">
              <div className="bg-[#080d17] p-3 rounded border border-slate-800">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Portfolio Systemic Risks
                </h3>

                <div className="space-y-2">
                  {PORTFOLIO_RISKS_DATA.map((risk) => (
                    <div key={risk.id} className="p-2 bg-slate-900/80 rounded border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {risk.category}
                        </span>
                        <span className={`text-[9px] font-mono px-1 rounded uppercase ${
                          risk.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10' :
                          risk.severity === 'HIGH' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10'
                        }`}>
                          {risk.severity} SEVERITY
                        </span>
                      </div>
                      <div className="text-slate-200 font-medium text-[11px] leading-snug">{risk.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                        <span>{risk.affectedProjectsCount} Projects Affected</span>
                        <span className="text-rose-300">{risk.exposure}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#080d17] p-3 rounded border border-slate-800">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Critical Resource Bottlenecks
                </h3>

                <div className="space-y-2">
                  {RESOURCE_CONFLICTS_DATA.map((res) => (
                    <div key={res.id} className="p-2 bg-slate-900/80 rounded border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-300 font-medium text-[11px]">{res.resourceName}</span>
                        <span className="text-[10px] font-mono text-rose-400 font-bold">{res.allocationPercent}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mb-1 font-mono">
                        Competing: {res.competingProjects.join(' vs ')}
                      </div>
                      <div className="text-[10px] text-cyan-400 bg-cyan-950/20 p-1 rounded border border-cyan-500/20">
                        Fix: {res.recommendedResolution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Portfolio Constellation (Interactive Network) */}
        {activeTab === 'CONSTELLATION' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Portfolio Constellation: Relationship & Dependency Mesh
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visual graph modeling relationships: Program → Project → Milestone → Supplier → Contract → Asset
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400 text-[10px]">Filter Nodes:</span>
                {(['ALL', 'PROGRAM', 'PROJECT', 'SUPPLIER'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setConstellationFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                      constellationFilter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="relative w-full h-[520px] bg-[#04070e] rounded border border-slate-800/80 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1000 540">
                <defs>
                  <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#082f49" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                <rect width="1000" height="540" fill="url(#grid-grad)" />

                {/* Subtle Grid Lines */}
                <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3">
                  <line x1="100" y1="0" x2="100" y2="540" />
                  <line x1="300" y1="0" x2="300" y2="540" />
                  <line x1="500" y1="0" x2="500" y2="540" />
                  <line x1="700" y1="0" x2="700" y2="540" />
                  <line x1="900" y1="0" x2="900" y2="540" />
                  <line x1="0" y1="150" x2="1000" y2="150" />
                  <line x1="0" y1="300" x2="1000" y2="300" />
                  <line x1="0" y1="450" x2="1000" y2="450" />
                </g>

                {/* Edges */}
                {CONSTELLATION_EDGES.map((edge, idx) => {
                  const src = CONSTELLATION_NODES.find(n => n.id === edge.from);
                  const dst = CONSTELLATION_NODES.find(n => n.id === edge.to);
                  if (!src || !dst) return null;
                  const isHighlighted = hoveredNodeId === src.id || hoveredNodeId === dst.id;

                  return (
                    <line
                      key={idx}
                      x1={src.x}
                      y1={src.y}
                      x2={dst.x}
                      y2={dst.y}
                      stroke={isHighlighted ? '#06b6d4' : '#334155'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? undefined : '4 2'}
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {CONSTELLATION_NODES.filter(n => constellationFilter === 'ALL' || n.type === constellationFilter).map((node) => {
                  const isHovered = hoveredNodeId === node.id;
                  const isSelected = selectedConstellationNode?.id === node.id;

                  let fill = '#0284c7';
                  if (node.status === 'CRITICAL') fill = '#e11d48';
                  else if (node.status === 'AT_RISK') fill = '#d97706';
                  else if (node.status === 'HEALTHY') fill = '#10b981';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => {
                        setSelectedConstellationNode(node);
                        setDrawerEntity({
                          title: node.name,
                          code: node.code,
                          type: node.type,
                          status: node.status,
                          details: node.details,
                          projectId: node.type === 'PROJECT' ? node.id.replace('prj-', '') : undefined
                        });
                      }}
                      className="cursor-pointer transition-transform duration-200"
                    >
                      {/* Pulse Circle */}
                      <circle
                        r={node.type === 'PROGRAM' ? 24 : node.type === 'PROJECT' ? 18 : 14}
                        fill={fill}
                        fillOpacity={isSelected ? 0.4 : isHovered ? 0.3 : 0.15}
                        stroke={fill}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <circle
                        r={node.type === 'PROGRAM' ? 8 : node.type === 'PROJECT' ? 6 : 4}
                        fill={fill}
                      />
                      <text
                        y={node.type === 'PROGRAM' ? 38 : 30}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {node.code}
                      </text>
                      <text
                        y={node.type === 'PROGRAM' ? 49 : 41}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="8.5"
                        fontFamily="sans-serif"
                      >
                        {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover preview tooltip */}
              {hoveredNodeId && (
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur border border-cyan-500/40 rounded p-3 text-xs font-mono shadow-xl max-w-xs pointer-events-none">
                  {(() => {
                    const n = CONSTELLATION_NODES.find(node => node.id === hoveredNodeId);
                    if (!n) return null;
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold">{n.code}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                            n.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10' :
                            n.status === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            {n.status}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-100">{n.name}</div>
                        <div className="text-[10px] text-slate-400">Entity: {n.type}</div>
                        <div className="text-[10px] text-slate-300">Lead: {n.details.lead}</div>
                        {n.details.risk && (
                          <div className="text-[10px] text-amber-300 pt-1 border-t border-slate-800">
                            Risk: {n.details.risk}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Portfolio Health Matrix (5 Dimensions) */}
        {activeTab === 'HEALTH_MATRIX' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Portfolio Health Matrix (5 Core Dimensions)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Comprehensive audit across Schedule, Cost, Supply, Risk, and Delivery probability
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  {['ALL', 'HEALTHY', 'AT_RISK'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterHealth(st)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                        filterHealth === st ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search matrix..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-2">Project Asset</th>
                    <th className="py-2.5 px-2">1. Schedule</th>
                    <th className="py-2.5 px-2">2. Cost (Budget vs EAC)</th>
                    <th className="py-2.5 px-2">3. Supply Transit</th>
                    <th className="py-2.5 px-2">4. Risk Severity</th>
                    <th className="py-2.5 px-2">5. Delivery Probability</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMasterProjects.map((proj) => (
                    <tr 
                      key={proj.id}
                      onClick={() => {
                        setDrawerEntity({
                          title: proj.name,
                          code: proj.code,
                          type: 'Project Matrix Record',
                          status: proj.status,
                          projectId: proj.id,
                          details: {
                            Voltage: proj.voltage,
                            Stage: proj.stage,
                            ApprovedBudget: proj.approvedBudget,
                            SpentBudget: proj.spentBudget,
                            EAC: proj.eacBudget,
                            Variance: proj.varianceEac,
                            DelayDays: `+${proj.delayDays} days`,
                            Contractor: proj.epcContractor
                          }
                        });
                      }}
                      className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-slate-200">{proj.name}</div>
                        <div className="text-[10px] text-cyan-400 flex items-center gap-1.5 mt-0.5">
                          <span>{proj.code}</span>
                          <span className="text-slate-500">•</span>
                          <span>{proj.voltage}</span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-2.5 px-2">
                        <div className={proj.delayDays > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {proj.delayDays > 0 ? `+${proj.delayDays}d Slip` : 'On Baseline'}
                        </div>
                        <span className="text-[9px] text-slate-400 block">Target: {proj.forecastCompletion}</span>
                      </td>

                      {/* Cost */}
                      <td className="py-2.5 px-2">
                        <div className="text-slate-200 font-medium">{proj.eacBudget}</div>
                        <span className={`text-[10px] ${proj.varianceEac.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>
                          Var: {proj.varianceEac}
                        </span>
                      </td>

                      {/* Supply */}
                      <td className="py-2.5 px-2">
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          Clearance 88%
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{proj.epcContractor.split('/')[0]}</span>
                      </td>

                      {/* Risk */}
                      <td className="py-2.5 px-2">
                        <span className={`px-1.5 py-0.5 text-[9px] rounded uppercase ${
                          proj.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10' :
                          proj.status === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {proj.status}
                        </span>
                      </td>

                      {/* Delivery */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold">{proj.confidence}%</span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full" style={{ width: `${proj.confidence}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 block">Progress: {proj.progress}%</span>
                      </td>

                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(proj.id);
                            onNavigateView('project-360');
                          }}
                          className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 text-[10px] inline-flex items-center gap-1"
                        >
                          360 Drill
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Critical Portfolio Exceptions */}
        {activeTab === 'EXCEPTIONS' && (
          <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Critical Portfolio Exceptions Register
                </h3>
                <p className="text-[11px] text-slate-400">
                  Escalated variances exceeding threshold tolerance with immediate corrective actions
                </p>
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                3 Urgent Operational Flags
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'exc-01',
                  project: 'Mombasa 400kV Ring',
                  code: 'EXC-TX-04',
                  severity: 'CRITICAL',
                  trend: 'WORSENING',
                  headline: 'Transformer T-204 Shipping ETA Variance',
                  impact: '+14 days critical path slip to Rabai energization; KES 45M liquidated damages risk.',
                  recommendation: 'Engage MSC Shipping line for priority berthing at Mombasa Berth 4.',
                  actionKey: 'MOMBASA_TRANSFORMER'
                },
                {
                  id: 'exc-02',
                  project: 'Rift Valley Geothermal Evacuation',
                  code: 'EXC-LAND-09',
                  severity: 'CRITICAL',
                  trend: 'STABLE',
                  headline: 'Disputed Wayleave Escrow Deposit in Narok',
                  impact: 'Injunction risk on tower foundations #122-140; potential 30-day civil suspension.',
                  recommendation: 'Release KES 38M from counterpart exchequer escrow via NLC urgent dispatch.',
                  actionKey: 'NAROK_WAYLEAVE'
                },
                {
                  id: 'exc-03',
                  project: 'Garissa 400/220kV Substation',
                  code: 'EXC-SUP-02',
                  severity: 'HIGH',
                  trend: 'MITIGATING',
                  headline: 'High-Salinity Insulator Specification Mismatch',
                  impact: 'Delay in outdoor yard switchgear stringing testing; contingency stock needed.',
                  recommendation: 'Authorize airfreight of 18 composite silicone insulator sets from Dubai depot.',
                  actionKey: 'GARISSA_INSULATORS'
                }
              ].map((exc) => (
                <div key={exc.id} className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs space-y-2.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">{exc.code}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30">
                          {exc.severity}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-300 bg-slate-800">
                          {exc.trend}
                        </span>
                      </div>
                    </div>

                    <div className="font-semibold text-slate-100 text-sm leading-snug">{exc.headline}</div>
                    <div className="text-[10px] font-mono text-slate-400">Asset: {exc.project}</div>

                    <p className="text-[11px] text-rose-300/90 leading-relaxed bg-rose-950/20 p-2 rounded border border-rose-500/20">
                      <strong>Impact:</strong> {exc.impact}
                    </p>

                    <p className="text-[11px] text-cyan-300 leading-relaxed bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                      <strong>Next Step:</strong> {exc.recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        triggerToast(`Investigation initiated for ${exc.code} (${exc.project}). Incident dossier created.`);
                      }}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono text-center transition-colors"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => {
                        triggerToast(`Exception ${exc.code} escalated to Managing Director & Board Technical Committee.`);
                      }}
                      className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded text-[10px] font-mono text-center transition-colors"
                    >
                      Escalate to MD
                    </button>
                    <button
                      onClick={() => {
                        triggerToast(`Mitigation mandate deployed for ${exc.code}. Field team notified.`);
                      }}
                      className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-mono text-center transition-colors"
                    >
                      Mitigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Delays */}
        {activeTab === 'DELAYS' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono text-slate-300">Filter By Health:</span>
                {['ALL', 'CRITICAL', 'AT_RISK', 'HEALTHY'].map((h) => (
                  <button
                    key={h}
                    onClick={() => setFilterHealth(h)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      filterHealth === h ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search delayed project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-2">Project</th>
                    <th className="py-2 px-2">Phase</th>
                    <th className="py-2 px-2">Delay Slip</th>
                    <th className="py-2 px-2">Critical Milestone Affected</th>
                    <th className="py-2 px-2">Root Driver</th>
                    <th className="py-2 px-2">Mitigation Action</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDelayed.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-slate-200">{proj.name}</div>
                        <div className="text-[10px] text-cyan-400">{proj.code}</div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-300">{proj.phase}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-rose-400 font-bold">+{proj.delayDays} Days</span>
                        <span className={`block text-[9px] uppercase ${
                          proj.impactScore === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {proj.impactScore}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-200">{proj.criticalMilestone}</td>
                      <td className="py-2.5 px-2 text-slate-400 max-w-[200px] leading-tight text-[11px]">
                        {proj.driver}
                      </td>
                      <td className="py-2.5 px-2 text-cyan-300 max-w-[220px] leading-tight text-[11px]">
                        {proj.mitigation}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => {
                            onSelectProject(proj.id);
                            onNavigateView('project-360');
                          }}
                          className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 text-[10px] inline-flex items-center gap-1"
                        >
                          View 360
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Exposures */}
        {activeTab === 'EXPOSURES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Financial Exposures */}
            <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                  Contractual & Financial Exposures
                </h3>
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  Total: KES 1.84B
                </span>
              </div>

              <div className="space-y-2">
                {FINANCIAL_EXPOSURE_DATA.map((fin) => (
                  <div key={fin.id} className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200">{fin.project}</div>
                      <span className="text-rose-400 font-mono font-bold text-sm">{fin.exposureAmount}</span>
                    </div>
                    <div className="flex items-center gap-2 my-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {fin.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30">
                        {fin.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Risk Score: {fin.riskScore}/100</span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                      <strong>Mitigation:</strong> {fin.mitigationAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Chain Gateway Exposures */}
            <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  Long-Lead Supply Exposures
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">
                  Global Factory & Sea Freight Tracking
                </span>
              </div>

              <div className="space-y-2">
                {SUPPLY_EXPOSURE_DATA.map((sup) => (
                  <div key={sup.id} className="p-2.5 bg-slate-900/80 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200">{sup.item}</div>
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded uppercase border ${
                        sup.criticality === 'CRITICAL' ? 'text-rose-400 border-rose-500/40' : 'text-amber-400 border-amber-500/40'
                      }`}>
                        {sup.criticality}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                      Asset: {sup.project} • Supplier: {sup.supplier}
                    </div>
                    <div className="flex items-center justify-between my-1 text-[10px] font-mono">
                      <span className="text-rose-400 font-bold">Delay: +{sup.delayWeeks} Weeks</span>
                      <span className={sup.contingencyAvailable ? 'text-emerald-400' : 'text-slate-400'}>
                        Buffer Stock: {sup.contingencyAvailable ? 'AVAILABLE' : 'NONE'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                      {sup.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Commissioning Pipeline & Timeline */}
        {activeTab === 'PIPELINE' && (
          <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  National Grid Energization & Commissioning Schedule (2026-2027)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Target Commercial Operation Dates (COD) and critical system readiness prerequisites
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMMISSIONING_PIPELINE_DATA.map((comm) => (
                <div key={comm.id} className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {comm.targetQuarter}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded uppercase border ${
                      comm.status === 'ON_TRACK' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                      comm.status === 'AT_RISK' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                      'text-rose-400 border-rose-500/40 bg-rose-500/10'
                    }`}>
                      {comm.status}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-100">{comm.project}</div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Target COD Date</span>
                      <span className="text-white font-bold">{comm.targetDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Confidence</span>
                      <span className="text-cyan-400 font-bold">{comm.confidence}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300 block text-[10px] uppercase font-mono mb-0.5">Critical Prerequisite:</strong>
                    {comm.criticalPrerequisite}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide-out Entity Inspection Drawer */}
        {drawerEntity && (
          <div className="fixed inset-y-0 right-0 w-96 bg-[#090d16] border-l border-cyan-500/30 shadow-2xl z-50 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{drawerEntity.type}</span>
                  <h3 className="font-bold text-slate-100 text-sm mt-0.5">{drawerEntity.title}</h3>
                  <span className="text-xs font-mono text-slate-400">{drawerEntity.code}</span>
                </div>
                <button
                  onClick={() => setDrawerEntity(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Inspection Metadata</span>
                <div className="space-y-1.5 bg-slate-950/80 p-3 rounded border border-slate-800 text-xs font-mono">
                  {Object.entries(drawerEntity.details).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-900 last:border-0">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-slate-200 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded text-xs text-slate-300 space-y-1">
                <span className="font-mono text-cyan-400 text-[10px] uppercase font-bold block">Governance Assurance</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Entity linked into the National Transmission Supply Nexus master database. All ledger events timestamped.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {drawerEntity.projectId && (
                <button
                  onClick={() => {
                    onSelectProject(drawerEntity.projectId!);
                    onNavigateView('project-360');
                    setDrawerEntity(null);
                  }}
                  className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Open Deep Project 360
                </button>
              )}
              <button
                onClick={() => setDrawerEntity(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </UIStateContainer>
  );
};
