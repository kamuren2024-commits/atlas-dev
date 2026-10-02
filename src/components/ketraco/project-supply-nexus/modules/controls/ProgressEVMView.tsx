import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Gauge,
  Camera,
  FileCheck,
  Plane,
  UploadCloud,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { 
  PROGRESS_EVM_METRICS, 
  EVM_MONTHLY_TRENDS, 
  MASTER_WORK_PACKAGES, 
  MASTER_MILESTONES 
} from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface ProgressEVMViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type ProgressTab = 'CURVE' | 'WORK_PACKAGES' | 'MILESTONES' | 'EXCEPTIONS' | 'EVENTS' | 'EVIDENCE';

export const ProgressEVMView: React.FC<ProgressEVMViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [activeTab, setActiveTab] = useState<ProgressTab>('CURVE');
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const evm = PROGRESS_EVM_METRICS;

  const packages = MASTER_WORK_PACKAGES.filter(wp => wp.projectId === currentProject.id);
  const milestones = MASTER_MILESTONES.filter(m => m.projectId === currentProject.id);

  const handleOpenEntity = (data: EntityDrawerData) => {
    setSelectedEntity(data);
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Progress & EVM">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="progress"
          onNavigateView={onNavigateView}
        />

        {/* EVM Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT CONTROLS //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                EARNED VALUE MANAGEMENT (EVM)
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Earned Value Management & Physical Deliverables Velocity
            </h1>
            <p className="text-xs text-slate-400">
              Contractual earned value analysis: PV, EV, AC, cost variance (CV), schedule variance (SV), SPI and CPI
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Schedule Index</span>
              <span className={`text-sm font-bold ${evm.spi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                SPI: {evm.spi}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Cost Efficiency Index</span>
              <span className={`text-sm font-bold ${evm.cpi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                CPI: {evm.cpi}
              </span>
            </div>
          </div>
        </div>

        {/* 10 — EVM Golden Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Planned Value (PV)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">{evm.pv}</span>
            <span className="text-[10px] text-slate-400">Budgeted Work Sched.</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Earned Value (EV)</span>
            <span className="text-cyan-300 font-bold text-sm mt-0.5 block">{evm.ev}</span>
            <span className="text-[10px] text-cyan-400">Budgeted Work Perf.</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Actual Cost (AC)</span>
            <span className="text-white font-bold text-sm mt-0.5 block">{evm.ac}</span>
            <span className="text-[10px] text-slate-400">Actual Cost of Work</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Schedule Variance</span>
            <span className="text-rose-400 font-bold text-sm mt-0.5 block">{evm.scheduleVariance}</span>
            <span className="text-[10px] text-rose-400">EV - PV (Behind)</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Cost Variance</span>
            <span className="text-amber-400 font-bold text-sm mt-0.5 block">{evm.costVariance}</span>
            <span className="text-[10px] text-amber-400">EV - AC (Within band)</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Progress Spread</span>
            <span className="text-white font-bold text-sm mt-0.5 block">{currentProject.progress}% Actual</span>
            <span className="text-[10px] text-slate-400">76% Planned (Lag: -8%)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('CURVE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CURVE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Progress S-Curve
            </button>
            <button
              onClick={() => setActiveTab('WORK_PACKAGES')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'WORK_PACKAGES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Work Package Progress
            </button>
            <button
              onClick={() => setActiveTab('MILESTONES')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'MILESTONES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Milestone Progress
            </button>
            <button
              onClick={() => setActiveTab('EXCEPTIONS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'EXCEPTIONS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Progress Exceptions
            </button>
            <button
              onClick={() => setActiveTab('EVENTS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'EVENTS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Recent Progress Events
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'EVIDENCE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Evidence Vault (Site & Drone)
            </button>
          </div>

          <span className="text-[10px] text-slate-400">
            Certified IPC-08 Standard
          </span>
        </div>

        {/* TAB 1: S-CURVE */}
        {activeTab === 'CURVE' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Physical Deliverables S-Curve (Planned vs Actual vs Forecast)
              </h3>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Planned S-Curve
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Actual Verified (EV)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Forecast Recovery
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-2">
              {EVM_MONTHLY_TRENDS.map((trend, i) => (
                <div key={i} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{trend.month}</span>
                    <span className={`text-[10px] ${trend.spi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      SPI {trend.spi}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PV:</span>
                      <span className="text-slate-300">{trend.pv}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">EV:</span>
                      <span className="text-cyan-300 font-bold">{trend.ev}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AC:</span>
                      <span className="text-white">{trend.ac}M</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: WORK PACKAGE PROGRESS */}
        {activeTab === 'WORK_PACKAGES' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Work Package Physical Progress Distribution
            </h3>
            <div className="space-y-2">
              {packages.map((wp) => (
                <div key={wp.id} className="p-3 bg-slate-900/60 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="w-64">
                    <span className="text-cyan-400 font-bold">{wp.code}</span>
                    <div className="text-slate-200 font-semibold">{wp.title || wp.name}</div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-bold">{wp.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${wp.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[10px]">Contractor: {wp.contractor}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                      wp.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      wp.status === 'IN_PROGRESS' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {wp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MILESTONE PROGRESS */}
        {activeTab === 'MILESTONES' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Statutory Milestone Attainment & Completion Log
            </h3>
            <div className="space-y-2">
              {milestones.map((m) => (
                <div key={m.id} className="p-3 bg-slate-900/60 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-cyan-400 font-bold">{m.code}: {m.name}</span>
                    <div className="text-[10px] text-slate-400">Owner: {m.owner} • Baseline: {m.baseline} • Forecast: {m.forecast}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={m.varianceDays < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {m.varianceDays < 0 ? `${m.varianceDays}d Delay` : 'Completed On Plan'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                      m.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      m.status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROGRESS EXCEPTIONS */}
        {activeTab === 'EXCEPTIONS' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-rose-950/20 rounded-lg border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">Active Field Velocity Exceptions</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Stringing velocity in Mazeras Section 2 is lagging behind baseline target (1.2 km/week vs 2.8 km/week scheduled), creating tensioning plinth backpressure.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold">Exception EXC-PROG-02: Foundation Civils Re-pour</span>
                <span className="text-amber-400 font-bold">Tower 108 Concrete Re-cast</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Core compression test on stub leg 4 showed 26 MPa vs 30 MPa requirement; resident engineer issued rejection certificate; re-pour scheduled this week.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: RECENT PROGRESS EVENTS */}
        {activeTab === 'EVENTS' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Recent Field Progress Log (Certified IPC Logs)
            </h3>
            <div className="space-y-2">
              {[
                { date: 'Yesterday 16:30', title: 'Tower 204 Erection Complete', author: 'Resident Engineer Mombasa', note: 'All 4 legs torque tested to 420 Nm and bolted.' },
                { date: '2 Days Ago 11:15', title: 'Mariakani 400kV Substation Earth Mat Resistance Verified', author: 'Senior Commissioning Engineer', note: 'Measured 0.38 Ohms (within <0.5 Ohm standard).' },
                { date: '4 Days Ago 09:00', title: 'Batch Conductor Reel Staging at Kilifi Depot', author: 'Materials Logistics Officer', note: '14 Drums 500mm² Zebra conductor offloaded successfully.' }
              ].map((ev, i) => (
                <div key={i} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{ev.title}</span>
                    <span className="text-[10px] text-slate-400">{ev.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ev.note}</p>
                  <div className="text-[10px] text-cyan-400">Logged by: {ev.author}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EVIDENCE VAULT (Site Photos, Inspection Reports, Contractor Submissions, Drone Imagery, Field Reports) */}
        {activeTab === 'EVIDENCE' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  Field Evidence Vault & Deliverable Artifacts
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Prepared integration workspace for site photos, drone orthomosaics, engineer inspection signoffs, and contractor claims.
                </p>
              </div>

              <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30 text-[10px]">
                PREPARED FOR FUTURE TELEMETRY LINK
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Site Photos */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] text-slate-400">24 Images</span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs">Site Progress Photos</h4>
                <p className="text-[10px] text-slate-400">Tower erection, concrete foundation testing and conductor stringing.</p>
                <button className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px]">
                  Browse Photos
                </button>
              </div>

              {/* Inspection Reports */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-slate-400">18 Reports</span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs">Engineer Inspection Reports</h4>
                <p className="text-[10px] text-slate-400">Certified cube tests, torque records and earth-mat testing.</p>
                <button className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 text-[10px]">
                  View Certificates
                </button>
              </div>

              {/* Drone Imagery */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <Plane className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] text-slate-400">6 Flights</span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs">Drone Corridor Imagery</h4>
                <p className="text-[10px] text-slate-400">High-resolution right-of-way photogrammetry and tower clearance LiDAR.</p>
                <button className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 text-[10px]">
                  Open Drone GIS
                </button>
              </div>

              {/* Contractor Submissions */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-slate-400">8 Submittals</span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs">Contractor IPC Submissions</h4>
                <p className="text-[10px] text-slate-400">Interim Payment Certificates (IPC-08) and variation notices.</p>
                <button className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[10px]">
                  Inspect Submittals
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Entity Drawer */}
      <NexusEntityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={selectedEntity}
        onNavigateView={onNavigateView}
        onSelectProject={onSelectProject}
      />
    </UIStateContainer>
  );
};
