import React from 'react';
import { DataSource } from '../types';
import { Database, Radio, Server, Shield, CloudRain, Cpu } from 'lucide-react';

interface ProvenanceTagProps {
  source: DataSource;
  quality?: 'GOOD' | 'QUESTIONABLE' | 'ESTIMATED' | 'BAD';
  className?: string;
}

export default function ProvenanceTag({
  source,
  quality = 'GOOD',
  className = ''
}: ProvenanceTagProps) {
  let icon = <Radio className="w-2.5 h-2.5" />;
  let label: string = source;
  let bg = 'bg-slate-900/80 text-slate-400 border-slate-700/50';

  switch (source) {
    case 'SCADA_EMS':
      icon = <Radio className="w-2.5 h-2.5 text-cyan-400" />;
      label = 'SCADA/EMS';
      bg = 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30';
      break;
    case 'WAMS_PMU':
      icon = <Server className="w-2.5 h-2.5 text-purple-400" />;
      label = 'WAMS PMU';
      bg = 'bg-purple-950/40 text-purple-300 border-purple-500/30';
      break;
    case 'GIS_POSTGIS':
      icon = <Database className="w-2.5 h-2.5 text-emerald-400" />;
      label = 'GIS PostGIS';
      bg = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30';
      break;
    case 'EAM_SAP':
      icon = <Shield className="w-2.5 h-2.5 text-amber-400" />;
      label = 'SAP EAM';
      bg = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
      break;
    case 'WEATHER_MET':
      icon = <CloudRain className="w-2.5 h-2.5 text-sky-400" />;
      label = 'METEO DEPT';
      bg = 'bg-sky-950/40 text-sky-300 border-sky-500/30';
      break;
    case 'SIMULATION_ENGINE':
      icon = <Cpu className="w-2.5 h-2.5 text-fuchsia-400" />;
      label = 'SIMULATION';
      bg = 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-500/30';
      break;
  }

  return (
    <div 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono tracking-tight font-medium ${bg} ${className}`}
      title={`Data Provenance: ${source} | Quality: ${quality}`}
    >
      {icon}
      <span>{label}</span>
      {quality && quality !== 'GOOD' && (
        <span className="text-[8px] text-amber-400 font-bold ml-0.5">[{quality[0] || '?'}]</span>
      )}
    </div>
  );
}
