import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  Command,
  Cpu,
  Crosshair,
  Gauge,
  Layers3,
  Map,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Triangle,
  Zap
} from 'lucide-react';

const sidebarItems = [
  { label: 'COMMAND', icon: Command },
  { label: 'LIVE OPS', icon: Activity },
  { label: 'FLEET', icon: Cpu },
  { label: 'MISSIONS', icon: Target },
  { label: 'MAP', icon: Map },
  { label: 'INSPECTIONS', icon: Camera },
  { label: 'AI VISION', icon: Sparkles },
  { label: 'MEDIA', icon: Layers3 },
  { label: 'FINDINGS', icon: AlertTriangle },
  { label: 'ASSETS', icon: Crosshair },
  { label: 'DIGITAL TWIN', icon: Triangle },
  { label: 'ANALYTICS', icon: Gauge },
  { label: 'AUDIT', icon: ShieldCheck },
];

const telemetryPills = [
  { label: 'ALT', value: '182m' },
  { label: 'SPD', value: '11.8m/s' },
  { label: 'BAT', value: '74%' },
  { label: 'SNR', value: '89%' },
];

const missionStats = [
  { label: '12 DRONES', value: 'LIVE' },
  { label: '07 MISSIONS', value: 'ACTIVE' },
  { label: '03 ALERTS', value: 'REVIEW' },
  { label: 'AI VISION', value: 'ONLINE' },
];

const missionTimeline = ['Pre-flight', 'Launch', 'Survey', 'Review'];

const systemHealth = [
  { label: 'Link health', value: '96.1%' },
  { label: 'Thermal pass', value: '98.4%' },
  { label: 'Telemetry', value: 'NC' },
];

const healthMetrics = [
  { label: 'Signal', value: 'Stable', tone: 'text-emerald-300' },
  { label: 'Wind', value: '11 kts', tone: 'text-cyan-300' },
  { label: 'Obstacle', value: 'Low', tone: 'text-amber-300' },
];

export default function DroneMissionPipelinePanel() {
  return (
    <div className="relative h-[calc(100vh-110px)] min-h-[760px] overflow-hidden border-b border-slate-800 bg-[#050d17] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,rgba(13,148,136,0.18),transparent_28%),radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#050d17_0%,#091827_100%)]" />

      <header className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/90 bg-[#071521]/85 px-5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.42em] text-cyan-300">DRONE INTELLIGENCE</div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-400">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-300">
          {missionStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-cyan-300">{stat.label}</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[8px] text-slate-200">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-44 items-center gap-2 rounded-xl border border-slate-700 bg-[#0a1521] px-3 text-[10px] text-slate-400">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Search</span>
          </div>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-[#0a1521] text-slate-300">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0a1521] px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-[10px] text-slate-950">OP</div>
            <div className="leading-none text-left">
              <div className="text-[10px] font-semibold text-white">OPER-7</div>
              <div className="text-[8px] uppercase tracking-[0.14em] text-slate-400">Pilot</div>
            </div>
          </div>
        </div>
      </header>

      <aside className="absolute left-0 top-16 bottom-0 z-10 w-20 border-r border-slate-800/80 bg-[#081521]/75 backdrop-blur-md px-2 py-4">
        <div className="flex h-full flex-col items-center gap-2">
          {sidebarItems.map(({ label, icon: Icon }, idx) => (
            <div key={label} className={`group flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[7px] uppercase tracking-[0.18em] ${
              idx === 0 ? 'border-cyan-500/30 bg-cyan-400/10 text-cyan-300' : 'border-transparent bg-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/40'
            }`}>
              <Icon className="h-4 w-4" />
              <span>{label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="absolute left-20 right-[320px] top-16 bottom-20 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.18),transparent_30%)]" />

          <svg viewBox="0 0 1200 700" className="absolute inset-0 h-full w-full opacity-90">
            <defs>
              <linearGradient id="lineGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path d="M 160 260 L 355 220 L 550 285 L 705 250 L 940 330 L 1110 310" stroke="url(#lineGlow)" strokeWidth="3" fill="none" />
            <path d="M 340 170 L 395 360 L 670 390 L 840 215 L 940 460" stroke="rgba(103, 232, 249, 0.28)" strokeWidth="2" fill="none" />

            {[{ x: 260, y: 310 }, { x: 470, y: 250 }, { x: 710, y: 310 }, { x: 880, y: 240 }, { x: 1030, y: 330 }].map((p, i) => (
              <g key={i}>
                <path d={`M ${p.x} ${p.y} L ${p.x - 12} ${p.y + 42} M ${p.x + 12} ${p.y + 42} L ${p.x} ${p.y}`} stroke="rgba(125,211,252,0.7)" strokeWidth="2" />
                <rect x={p.x - 17} y={p.y + 42} width="34" height="16" rx="4" fill="rgba(15,23,42,0.9)" stroke="rgba(34,211,238,0.5)" />
                <circle cx={p.x} cy={p.y} r="8" fill="rgba(34,211,238,0.7)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              </g>
            ))}

            <g transform="translate(760 250)">
              <rect x="0" y="0" width="80" height="60" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(34,211,238,0.55)" />
              <rect x="16" y="16" width="48" height="28" rx="6" fill="rgba(10, 119, 139, 0.7)" />
            </g>
          </svg>

          <div className="absolute left-10 top-8 rounded-xl border border-cyan-500/20 bg-[#081725]/70 px-3 py-2 shadow-[0_0_18px_rgba(34,211,238,0.14)] backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">ACTIVE ROUTE</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-white">
              <MapPinned className="h-3.5 w-3.5 text-cyan-300" /> 220KV Substation Corridor
            </div>
          </div>

          <div className="absolute right-12 top-16 flex flex-col gap-2">
            {telemetryPills.map((pill) => (
              <div key={pill.label} className="rounded-xl border border-cyan-500/20 bg-[#071827]/80 px-3 py-2 shadow-[0_0_12px_rgba(34,211,238,0.12)] backdrop-blur-sm">
                <div className="text-[8px] uppercase tracking-[0.18em] text-slate-400">{pill.label}</div>
                <div className="text-[12px] font-semibold text-white">{pill.value}</div>
              </div>
            ))}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              <div className="absolute inset-3 rounded-full border border-cyan-400/40" />
              <div className="absolute h-14 w-14 rounded-full border border-dashed border-cyan-200/60" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-sky-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.55)]">
                <span className="text-[8px] font-bold">DRONE</span>
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10" />
            <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10" />
          </div>

          <div className="absolute left-[30%] top-[28%] z-10 flex gap-2 rounded-xl border border-amber-500/30 bg-[#1b150d]/80 px-3 py-2 shadow-[0_0_22px_rgba(251,191,36,0.18)] backdrop-blur-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-amber-300">Possible Insulator Anomaly</div>
              <div className="text-[11px] font-semibold text-white">HIGH SEVERITY</div>
            </div>
          </div>

          <div className="absolute bottom-10 left-12 right-12 flex items-end justify-between">
            <div className="flex gap-2">
              {healthMetrics.map((m) => (
                <div key={m.label} className="rounded-lg border border-slate-700 bg-[#081827]/80 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">
                  <div className="text-slate-400">{m.label}</div>
                  <div className={`${m.tone} mt-1 font-semibold normal-case tracking-normal`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside className="absolute right-0 top-16 bottom-20 z-10 w-[320px] border-l border-slate-800/80 bg-[#071521]/85 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">MISSION INTELLIGENCE</div>
            <div className="mt-1 text-[11px] text-slate-400">Mission INS-2026-0812</div>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-emerald-300">68% complete</div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-700 bg-[#0a1624] p-3">
          <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">Target</div>
          <div className="mt-2 text-lg font-semibold text-white">220KV Substation</div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300">
            <span>Asset match confidence</span>
            <span className="text-cyan-300">94.2%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
          </div>
        </div>

        <div className="mt-4 space-y-3 text-[10px] text-slate-300">
          {[
            { label: 'Detected issue', value: 'Insulator string anomaly', tone: 'text-amber-300' },
            { label: 'Severity', value: 'High' },
            { label: 'Recommended action', value: 'Engineering review + maintenance dispatch' },
            { label: 'Evidence', value: 'Thermal variance 4.1°C / visual defect cluster' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-800 bg-[#091b2d] p-3">
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
              <div className={`mt-1 ${item.tone || 'text-white'}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-cyan-500/20 bg-[#091a2c] p-3">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-slate-400">
            <span>Operator note</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
          </div>
          <div className="mt-2 text-[10px] leading-relaxed text-slate-200">
            Visual evidence indicates corrosion and insulator stress near tower leg T3. Dispatch field verification before any live line intervention.
          </div>
        </div>
      </aside>

      <div className="absolute inset-x-0 bottom-0 z-20 h-20 border-t border-slate-800/90 bg-[#071521]/85 backdrop-blur-md">
        <div className="grid h-full grid-cols-[1.2fr_1.1fr_0.9fr] gap-4 px-5 py-3">
          <div className="rounded-xl border border-slate-800 bg-[#0a1521] p-3">
            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">LIVE TELEMETRY</div>
            <div className="mt-3 flex h-[40px] items-end gap-2">
              {[42, 56, 48, 76, 68, 82, 96, 88, 92, 78, 72, 96].map((bar, idx) => (
                <div key={idx} className="w-full rounded-t-sm bg-gradient-to-t from-cyan-500 to-sky-300/80" style={{ height: `${bar}%` }} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a1521] p-3">
            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">MISSION TIMELINE</div>
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-slate-300">
              {missionTimeline.map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ${idx === 3 ? 'bg-cyan-500 text-slate-950' : 'border border-slate-700 text-slate-300'}`}>
                    {idx + 1}
                  </div>
                  <span>{step}</span>
                  {idx < missionTimeline.length - 1 && <span className="text-slate-600">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a1521] p-3">
            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">SYSTEM</div>
            <div className="mt-3 space-y-2 text-[10px] text-slate-300">
              {systemHealth.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-slate-800 pb-1 last:border-b-0">
                  <span>{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-cyan-500/30 bg-[#071b29]/90 px-5 py-3 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-md">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-cyan-300"><Sparkles className="h-3 w-3" /> Ask Drone Intelligence</span>
          <span className="text-slate-500">⌘ K</span>
        </div>
      </div>
    </div>
  );
}
