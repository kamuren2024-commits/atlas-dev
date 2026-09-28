import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Cpu,
  FileImage,
  Gauge,
  Layers3,
  MapPinned,
  MonitorPlay,
  Play,
  RadioTower,
  ShieldCheck,
  UploadCloud,
  Video,
  Waypoints,
  Wifi,
  Zap,
} from 'lucide-react';
import DroneMissionPipelinePanel from './DroneMissionPipelinePanel';

const tabs = ['Overview', 'Missions', 'Evidence', 'Fleet'];

const fleetMetrics = [
  { label: 'Airframes online', value: '08/10', delta: '+2 ready' },
  { label: 'Avg coverage', value: '94.8%', delta: '+4.1%' },
  { label: 'Critical findings', value: '12', delta: '4 escalated' },
  { label: 'Telemetry sync', value: '99.2%', delta: 'stable' },
];

const missionCards = [
  { title: 'Inspection readiness', value: '96%', tone: 'emerald', detail: 'All planned sorties are validated.' },
  { title: 'AI defect confidence', value: '89%', tone: 'cyan', detail: 'High-confidence corrosion and thermal detections.' },
  { title: 'Risk posture', value: 'Elevated', tone: 'amber', detail: 'Human review gate remains active.' },
];

const droneFleet = [
  { id: 'D-07', status: 'IN_FLIGHT', battery: 71, altitude: 184, speed: 12, signal: 'GOOD', mission: 'SUSWA-CORRIDOR-17' },
  { id: 'D-12', status: 'CAPTURING', battery: 68, altitude: 132, speed: 9, signal: 'GOOD', mission: 'KTR-184-INSPECTION' },
  { id: 'D-04', status: 'LOITERING', battery: 54, altitude: 98, speed: 6, signal: 'STABLE', mission: 'LINE-RECOVERY' },
];

const telemetryEvents = [
  '09:42:03 Position updated',
  '09:42:04 Tower detected',
  '09:42:07 Suspected anomaly',
  '09:42:11 Asset correlation complete',
  '09:42:17 Engineer review queued',
];

const inspectionMarkers = [
  { time: '00:02', label: 'Tower', kind: 'asset' },
  { time: '00:08', label: 'Defect', kind: 'defect' },
  { time: '00:15', label: 'Insulator', kind: 'asset' },
  { time: '00:26', label: 'Vegetation', kind: 'risk' },
];

const providerState = [
  { name: 'Enterprise Drone Adapter', status: 'Connected', latency: '118ms', health: 'Healthy' },
  { name: 'Event Fabric', status: 'Streaming', latency: '39ms', health: 'Healthy' },
  { name: 'Vision Inference', status: 'Active', latency: '620ms', health: 'Stable' },
];

function GeospatialMissionBoard() {
  const routePoints = [
    { x: '18%', y: '52%' },
    { x: '32%', y: '66%' },
    { x: '46%', y: '40%' },
    { x: '62%', y: '52%' },
    { x: '78%', y: '44%' },
  ];

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.08),_transparent_50%),linear-gradient(180deg,#071924_0%,#050d17_100%)]">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(14,165,233,0.18),transparent_20%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.14),transparent_25%)]" />
      <div className="absolute left-6 top-6 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.24em] text-violet-200">ISR corridor</div>

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <path d="M 15 55 L 30 68 L 46 42 L 60 52 L 78 46" fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M 15 55 L 18 55" fill="none" stroke="rgba(34,211,238,0.8)" strokeWidth="1.2" />
        <path d="M 78 46 L 90 50" fill="none" stroke="rgba(34,211,238,0.8)" strokeWidth="1.2" />
      </svg>

      {[{ left: '18%', top: '52%', tone: 'cyan' }, { left: '32%', top: '66%', tone: 'amber' }, { left: '46%', top: '40%', tone: 'violet' }, { left: '62%', top: '52%', tone: 'cyan' }, { left: '78%', top: '44%', tone: 'emerald' }].map((marker, index) => (
        <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: marker.left, top: marker.top }}>
          <div className={`h-3 w-3 rounded-full border border-white/40 ${marker.tone === 'amber' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]' : marker.tone === 'violet' ? 'bg-violet-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]' : marker.tone === 'emerald' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]'}`} />
        </div>
      ))}

      <div className="absolute right-5 top-8 rounded-xl border border-slate-700/80 bg-slate-950/75 p-3 backdrop-blur-sm">
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Asset health</div>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          92.4% compliant
        </div>
      </div>

      <div className="absolute bottom-5 left-5 rounded-xl border border-cyan-500/20 bg-[#091c2b]/90 p-3">
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-300">Live objective</div>
        <div className="mt-1 text-sm font-medium text-white">Suswa corridor inspection</div>
      </div>
    </div>
  );
}

function MediaDropzone() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<Array<{ id: string; name: string; size: string; status: string }>>([]);

  const handleFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'Queued',
    }));
    setFiles((current) => [...current, ...next]);
  };

  useEffect(() => {
    if (files.length === 0) return;

    const interval = window.setInterval(() => {
      setFiles((current) => current.map((item) => {
        const nextStatus = item.status === 'Queued'
          ? 'Validating'
          : item.status === 'Validating'
            ? 'Processing'
            : item.status === 'Processing'
              ? 'AI analysis'
              : 'Evidence ready';
        return { ...item, status: nextStatus };
      }));
    }, 1200);

    return () => window.clearInterval(interval);
  }, [files.length]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#071723] p-4">
      <div
        className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-500/30 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_42%),#0b1526] p-6 text-center transition hover:border-cyan-400/60 hover:bg-slate-900/30"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files) handleFiles(event.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Drop drone media here</div>
        <h3 className="mt-2 text-xl font-semibold text-white">Images • Video • Inspection Evidence</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">Auto-extract GPS, EXIF, and telemetry metadata before AI correlation.</p>
        <button type="button" className="mt-4 rounded-full border border-cyan-500/40 bg-cyan-950/30 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-200">
          Browse files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#091d2d] px-3 py-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-cyan-300">
                  {file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.mov') ? <Video className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm text-white">{file.name}</div>
                  <div className="text-[9px] font-mono text-slate-400">{file.size} • {file.status}</div>
                </div>
              </div>
              <div className="text-[9px] font-mono text-emerald-300">{file.status === 'Evidence ready' ? 'Ready' : 'Processing'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DroneIntelligenceModule() {
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const slug = activeTab.toLowerCase().replace(/\s+/g, '-');
    const targetPath = `/drone-intelligence/${slug}`;
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({}, '', targetPath);
    }
  }, [activeTab]);

  const activeSummary = useMemo(() => {
    const summaries: Record<string, string> = {
      Overview: 'Mission operations remain stable across the current inspection window with two human review gates in effect.',
      Missions: 'Planned sorties are mapped to corridor priority heatmaps and engineering review queues.',
      Evidence: 'Evidence packages are validated for telemetry consistency, image quality, and asset correlation.',
      Fleet: 'Fleet health, flight readiness, and maintenance slack are monitored against active inspection load.',
    };

    return summaries[activeTab] ?? summaries.Overview;
  }, [activeTab]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#030b14] text-slate-100">
      <div className="border-b border-slate-800/80 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_42%),linear-gradient(180deg,#071321_0%,#040d18_100%)] px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-300">
                <span>Salience Atlas</span>
                <span className="text-slate-500">//</span>
                <span className="text-slate-400">Drone Intelligence</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Autonomous Grid Inspection</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-mono text-emerald-300">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Live operations</span>
            </div>
            <div className="rounded-full border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-[10px] font-mono text-amber-300">
              <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> 2 review gates</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {[
            { label: 'Live drones', value: '08', tone: 'cyan' },
            { label: 'Active missions', value: '04', tone: 'violet' },
            { label: 'Critical findings', value: '12', tone: 'amber' },
            { label: 'Assets inspected', value: '487', tone: 'emerald' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-800 bg-[#091a2a] p-3">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">{item.label}</div>
              <div className={`mt-2 text-2xl font-semibold ${item.tone === 'cyan' ? 'text-cyan-300' : item.tone === 'violet' ? 'text-violet-300' : item.tone === 'amber' ? 'text-amber-300' : 'text-emerald-300'}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] transition-all ${
                activeTab === tab
                  ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.14)]'
                  : 'border-slate-700 bg-slate-900/30 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <DroneMissionPipelinePanel />

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-2xl border border-slate-800 bg-[#071723] p-4 shadow-[0_12px_40px_rgba(2,6,23,0.38)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                <Layers3 className="h-3.5 w-3.5 text-cyan-300" /> Spatial intelligence
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Simulation mode
              </div>
            </div>

            <div className="mt-4">
              <GeospatialMissionBoard />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {fleetMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-slate-800 bg-[#0d1a2a] p-3">
                  <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400">{metric.label}</div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div className="text-2xl font-semibold text-white">{metric.value}</div>
                    <div className="text-[9px] font-mono text-cyan-300">{metric.delta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#091823] p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                <RadioTower className="h-3.5 w-3.5 text-violet-300" /> Live mission status
              </div>
              <div className="mt-4 space-y-3">
                {droneFleet.map((drone) => (
                  <div key={drone.id} className="rounded-xl border border-slate-800 bg-[#0d1a2a] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">{drone.id}</div>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-950/30 px-1.5 py-0.5 text-[8px] font-mono uppercase text-cyan-300">{drone.status}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                      <div>Battery: <span className="text-cyan-300">{drone.battery}%</span></div>
                      <div>Altitude: <span className="text-cyan-300">{drone.altitude}m</span></div>
                      <div>Speed: <span className="text-cyan-300">{drone.speed}m/s</span></div>
                      <div>Signal: <span className="text-emerald-300">{drone.signal}</span></div>
                    </div>
                    <div className="mt-2 text-[9px] font-mono uppercase tracking-[0.16em] text-slate-500">{drone.mission}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#091823] p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                <Wifi className="h-3.5 w-3.5 text-emerald-300" /> Connectivity gateway
              </div>
              <div className="mt-4 space-y-2">
                {providerState.map((item) => (
                  <div key={item.name} className="rounded-xl border border-slate-800 bg-[#0d1a2a] p-2.5 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-white">{item.name}</span>
                      <span className="text-emerald-300">{item.status}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-slate-400">
                      <span>Latency</span>
                      <span>{item.latency}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-slate-400">
                      <span>Health</span>
                      <span className="text-cyan-300">{item.health}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <MediaDropzone />

          <div className="rounded-2xl border border-slate-800 bg-[#071723] p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              <MonitorPlay className="h-3.5 w-3.5 text-cyan-300" /> Live telemetry stream
            </div>
            <div className="mt-4 space-y-2">
              {telemetryEvents.map((event) => (
                <div key={event} className="rounded-xl border border-slate-800 bg-[#0d1a2a] px-3 py-2 text-[10px] text-slate-300">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {missionCards.map(({ title, value, tone, detail }) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-[#071723] p-4">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                <span>{title}</span>
                <ArrowUpRight className={`h-3.5 w-3.5 ${tone === 'emerald' ? 'text-emerald-300' : tone === 'cyan' ? 'text-cyan-300' : 'text-amber-300'}`} />
              </div>
              <div className={`mt-3 text-3xl font-semibold ${tone === 'emerald' ? 'text-emerald-300' : tone === 'cyan' ? 'text-cyan-300' : 'text-amber-300'}`}>
                {value}
              </div>
              <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-[#071723] p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              <Camera className="h-3.5 w-3.5 text-cyan-300" /> Evidence viewer
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Previous inspection', 'Current inspection'].map((label, index) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-[#0d1a2a] p-3">
                  <div className="flex items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    <span>{label}</span>
                    <span className={index === 1 ? 'text-emerald-300' : 'text-amber-300'}>{index === 1 ? 'Live' : 'Archive'}</span>
                  </div>
                  <div className="mt-3 h-36 rounded-xl border border-slate-700 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.12),_transparent_32%),linear-gradient(135deg,#0b1623,#0d1a2a)] p-3">
                    <div className="flex h-full items-center justify-center text-slate-500">
                      <div className="text-center">
                        <Play className="mx-auto h-6 w-6 text-cyan-300" />
                        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.18em]">Inspection frame</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#071723] p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              <Zap className="h-3.5 w-3.5 text-violet-300" /> Temporal twin
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">
                <span>2025</span>
                <span>Healthy</span>
                <span>Degraded</span>
                <span>Critical</span>
              </div>
              <div className="relative flex h-16 items-center">
                <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-slate-700" />
                {['', '', '', ''].map((_, index) => (
                  <div key={index} className="relative z-10 flex-1 flex items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${index === 1 ? 'bg-cyan-400' : index === 2 ? 'bg-amber-400' : index === 3 ? 'bg-rose-400' : 'bg-slate-600'} shadow-[0_0_12px_rgba(34,211,238,0.35)]`} />
                  </div>
                ))}
              </div>
              <div className="grid gap-2 text-[10px] text-slate-300">
                {inspectionMarkers.map((marker) => (
                  <div key={marker.time} className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#0d1a2a] px-2.5 py-2">
                    <span className="font-mono text-slate-500">{marker.time}</span>
                    <span className="text-white">{marker.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-mono uppercase ${marker.kind === 'defect' ? 'bg-amber-500/10 text-amber-300' : marker.kind === 'risk' ? 'bg-rose-500/10 text-rose-300' : 'bg-cyan-500/10 text-cyan-300'}`}>
                      {marker.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-[#071723] p-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-emerald-300" /> Command intelligence summary
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Drone route health', value: 'Excellent', status: 'good' },
              { label: 'Asset matching', value: '92.4%', status: 'good' },
              { label: 'Calibration drift', value: 'Low', status: 'watch' },
              { label: 'Maintenance load', value: 'Balanced', status: 'good' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-800 bg-[#0d1a2a] p-3">
                <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                <div className={`mt-2 text-base font-semibold ${item.status === 'watch' ? 'text-amber-300' : 'text-emerald-300'}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
