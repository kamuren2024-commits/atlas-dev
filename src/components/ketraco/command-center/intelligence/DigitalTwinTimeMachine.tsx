import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  FastForward, 
  Rewind, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle,
  History,
  Layers
} from 'lucide-react';

export type TemporalMode = 'LIVE' | 'HISTORICAL' | 'SIMULATED' | 'FORECAST';

interface DigitalTwinTimeMachineProps {
  currentMode: TemporalMode;
  onModeChange: (mode: TemporalMode) => void;
  onTimeChange?: (isoTime: string) => void;
}

export default function DigitalTwinTimeMachine({
  currentMode,
  onModeChange,
  onTimeChange
}: DigitalTwinTimeMachineProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [scrubPositionPct, setScrubPositionPct] = useState<number>(100);

  const getModeBadge = (mode: TemporalMode) => {
    switch (mode) {
      case 'LIVE':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-slate-500/20 text-slate-300 border border-slate-500/40">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>LIVE OPERATING STATE (NOT CONNECTED)</span>
          </div>
        );
      case 'HISTORICAL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <History className="w-3.5 h-3.5" />
            <span>HISTORICAL REPLAY (EVENT LOG ARCHIVE)</span>
          </div>
        );
      case 'SIMULATED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WHAT-IF SIMULATION (SYNTHETIC CONTINGENCY)</span>
          </div>
        );
      case 'FORECAST':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Clock className="w-3.5 h-3.5" />
            <span>PREDICTIVE FORECAST (+15M TO +24H LOOKAHEAD)</span>
          </div>
        );
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubPositionPct(val);
  };

  return (
    <div className="w-full bg-[#080e1c] border-b border-slate-800 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-200 font-mono select-none">
      {/* Mode Badges & Watermark */}
      <div className="flex items-center gap-3">
        {getModeBadge(currentMode)}

        {/* Temporal Mode Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
          {(['LIVE', 'HISTORICAL', 'SIMULATED', 'FORECAST'] as TemporalMode[]).map(m => (
            <button
              key={m}
              onClick={() => m !== 'LIVE' && onModeChange(m)}
              disabled={m === 'LIVE'}
              title={m === 'LIVE' ? 'Unavailable: no live telemetry connector is configured' : undefined}
              className={`px-2.5 py-1 rounded font-bold tracking-wider transition-all ${
                currentMode === m
                  ? 'bg-cyan-600 text-white shadow'
                  : m === 'LIVE'
                    ? 'cursor-not-allowed text-slate-600'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {m === 'LIVE' ? 'LIVE · N/C' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Scrub bar & playback controls */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setScrubPositionPct(100)}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200"
            title="Reset to Present"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Time Slider */}
        <div className="flex items-center gap-2 flex-1 md:w-56">
          <span className="text-[10px] text-slate-400">-24h</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrubPositionPct}
            onChange={handleSliderChange}
            className="w-full accent-cyan-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-400">+24h</span>
        </div>

        {/* Playback speed */}
        <div className="flex items-center gap-1 text-[10px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300">
          <span>Speed:</span>
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-1.5 rounded ${playbackSpeed === spd ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
