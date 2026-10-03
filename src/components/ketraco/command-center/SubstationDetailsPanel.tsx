import React from 'react';
import { Activity, AlertTriangle, MapPin, X } from 'lucide-react';
import type { GridAlarm, GridAsset, GridEvent, TelemetryPoint, TransmissionLine } from './types';

interface SubstationDetailsPanelProps {
  substation: GridAsset;
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  alarms: GridAlarm[];
  events: GridEvent[];
  onClose: () => void;
  onFocus?: () => void;
  onOpenDigitalTwin?: () => void;
  onViewTelemetry?: () => void;
  onViewEvents?: () => void;
  onBackToGrid?: () => void;
}

function formatValue(value: string | number | boolean | null | undefined, unit = ''): string {
  if (value === null || value === undefined || value === '') return 'Data unavailable';
  if (typeof value === 'number' && !Number.isFinite(value)) return 'Data unavailable';
  const formatted = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatList(values: string[] | undefined): string {
  return values?.length ? values.join(', ') : 'Data unavailable';
}

function latestTelemetryTimestamp(telemetry: GridAsset['telemetry']): string | undefined {
  const timestamps = Object.values(telemetry)
    .map((point) => point.timestamp)
    .filter((timestamp) => Number.isFinite(Date.parse(timestamp)));
  return timestamps.sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70">
      <h3 className="border-b border-slate-800 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
        {title}
      </h3>
      <div className="divide-y divide-slate-800/70 px-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-[11px]">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-slate-100">{value}</dd>
    </div>
  );
}

function TelemetryRow({ label, point }: { label: string; point?: TelemetryPoint }) {
  return (
    <DetailRow
      label={label}
      value={point ? `${formatValue(point.value, point.unit)} · ${point.freshness} · ${point.source}` : 'Data unavailable'}
    />
  );
}

export default function SubstationDetailsPanel({
  substation,
  substations,
  lines,
  alarms,
  events,
  onClose,
  onFocus,
  onOpenDigitalTwin,
  onViewTelemetry,
  onViewEvents,
  onBackToGrid
}: SubstationDetailsPanelProps) {
  const connectedLines = substation.connectedLines.map((lineId) => lines[lineId]).filter(Boolean);
  const assetAlarms = alarms.filter((alarm) => alarm.assetId === substation.id);
  const assetEvents = events.filter((event) => event.assetId === substation.id);
  const telemetryTimestamp = latestTelemetryTimestamp(substation.telemetry);
  const lineEntries = substation.connectedLines.length ? substation.connectedLines : undefined;
  const connectedSubstations = substation.connectedSubstations.length
    ? substation.connectedSubstations.map((id) => substations[id]?.name || id)
    : undefined;
  const maintenanceStatus = substation.state === 'MAINTENANCE' ? 'MAINTENANCE' : undefined;
  return (
    <aside
      aria-label={`${substation.name} operational details`}
      className="flex h-full w-88 shrink-0 flex-col overflow-hidden border-l border-slate-800 bg-[#0a1220] font-sans text-xs text-slate-100 xl:w-[420px]"
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 shrink-0 text-cyan-300" />
            <h2 className="truncate text-sm font-semibold">{substation.name}</h2>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {substation.code} · {substation.type.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onFocus && (
            <button
              type="button"
              onClick={onFocus}
              aria-label="Focus substation on map"
              title="Focus on map"
              className="rounded border border-cyan-500/40 bg-cyan-500/10 p-1.5 text-cyan-300 hover:bg-cyan-500/20"
            >
              <MapPin className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close substation details"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {onBackToGrid && (
            <button type="button" onClick={onBackToGrid} className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200 hover:border-cyan-500/60 hover:text-cyan-200">
              Back to grid
            </button>
          )}
          {onOpenDigitalTwin && (
            <button type="button" onClick={onOpenDigitalTwin} className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200 hover:bg-cyan-500/20">
              Open Digital Twin
            </button>
          )}
          {onViewTelemetry && (
            <button type="button" onClick={onViewTelemetry} className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200 hover:border-violet-500/60 hover:text-violet-200">
              View telemetry
            </button>
          )}
          {onViewEvents && (
            <button type="button" onClick={onViewEvents} className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-200 hover:border-amber-500/60 hover:text-amber-200">
              View events
            </button>
          )}
        </div>

        <DetailSection title="Substation overview">
          <DetailRow label="Operational status" value={formatValue(substation.state)} />
          <DetailRow label="Availability" value="Data unavailable" />
          <DetailRow label="Voltage level" value={formatValue(substation.voltageLevelKV, 'kV')} />
          <DetailRow label="Location" value={`${substation.county}, ${substation.region}`} />
          <DetailRow
            label="Coordinates"
            value={`${formatValue(substation.latitude)}, ${formatValue(substation.longitude)}`}
          />
          <DetailRow label="Elevation" value={formatValue(substation.elevationM, 'm')} />
          <DetailRow label="Capacity" value={formatValue(substation.ratedCapacityMVA, 'MVA')} />
          <DetailRow label="Current loading" value={formatValue(substation.currentLoadMW, 'MW')} />
          <DetailRow label="Peak loading" value={formatValue(substation.peakLoadMW, 'MW')} />
          <DetailRow label="Thermal loading" value={formatValue(substation.telemetry.thermalLoadingPct?.value, '%')} />
        </DetailSection>

        <DetailSection title="Connected assets and equipment">
          <DetailRow label="Connected substations" value={formatList(connectedSubstations)} />
          <DetailRow label="Connected line IDs" value={formatList(lineEntries)} />
          <DetailRow label="Transformers" value={formatValue(substation.transformersCount)} />
          <DetailRow label="Bays" value={formatValue(substation.baysCount)} />
          <DetailRow label="Breakers" value={formatValue(substation.breakersCount)} />
          <DetailRow label="Protection relays" value={formatValue(substation.protectionRelaysCount)} />
        </DetailSection>

        <DetailSection title="Transformer information">
          <DetailRow label="Transformer count" value={formatValue(substation.transformersCount)} />
          <TelemetryRow label="Oil temperature" point={substation.telemetry.transformerOilTempC} />
          <TelemetryRow label="Winding temperature" point={substation.telemetry.windingTempC} />
          <TelemetryRow label="Hydrogen" point={substation.telemetry.hydrogenPpm} />
          <TelemetryRow label="Acetylene" point={substation.telemetry.acetylenePpm} />
          <DetailRow label="Transformer ratings / IDs" value="Data unavailable" />
        </DetailSection>

        <DetailSection title="Circuit and line information">
          {connectedLines.length ? connectedLines.map((line) => (
            <div key={line.id} className="border-b border-slate-800/70 py-2 last:border-0">
              <p className="text-[11px] font-medium text-slate-100">{line.name || line.code}</p>
              <dl className="mt-1 divide-y divide-slate-800/70">
                <DetailRow label="Voltage" value={formatValue(line.voltageKV, 'kV')} />
                <DetailRow label="Status" value={formatValue(line.status ?? line.state)} />
                <DetailRow label="Current load" value={formatValue(line.currentLoadMW, 'MW')} />
                <DetailRow label="Loading" value={formatValue(line.loadingPct, '%')} />
                <DetailRow label="Thermal rating" value={formatValue(line.thermalRatingMVA, 'MVA')} />
                <DetailRow label="Active alarms" value={formatValue(line.activeAlarmsCount)} />
              </dl>
            </div>
          )) : (
            <DetailRow label="Connected lines" value={formatList(lineEntries)} />
          )}
          <DetailRow label="Circuit details" value="Data unavailable" />
        </DetailSection>

        <DetailSection title="Telemetry">
          <TelemetryRow label="Active power" point={substation.telemetry.activePowerMW} />
          <TelemetryRow label="Reactive power" point={substation.telemetry.reactivePowerMVAR} />
          <TelemetryRow label="Voltage" point={substation.telemetry.voltageKV} />
          <TelemetryRow label="Frequency" point={substation.telemetry.frequencyHz} />
          <TelemetryRow label="Power factor" point={substation.telemetry.powerFactor} />
          <TelemetryRow label="Current" point={substation.telemetry.currentAmps} />
          <DetailRow label="Last telemetry update" value={formatValue(telemetryTimestamp)} />
        </DetailSection>

        <DetailSection title="Alarms and events">
          {assetAlarms.length ? assetAlarms.map((alarm) => (
            <div key={alarm.id} className="border-b border-slate-800/70 py-2 last:border-0">
              <p className="flex items-center gap-1.5 font-medium text-amber-200">
                <AlertTriangle className="h-3 w-3" />
                {alarm.severity} · {alarm.title}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">{alarm.state} · {alarm.timestamp}</p>
              <p className="mt-1 text-[10px] text-slate-300">{alarm.description}</p>
            </div>
          )) : <DetailRow label="Alarms" value="No matching alarms" />}
          {assetEvents.length ? assetEvents.map((event) => (
            <div key={event.id} className="border-t border-slate-800/70 py-2">
              <p className="font-medium text-slate-200">{event.severity} · {event.title}</p>
              <p className="mt-1 text-[10px] text-slate-400">{event.timestamp} · {event.source}</p>
              <p className="mt-1 text-[10px] text-slate-300">{event.description}</p>
            </div>
          )) : <DetailRow label="Events" value="No matching events" />}
        </DetailSection>

        <DetailSection title="Provenance and authority">
          <DetailRow label="Data source" value={formatList(substation.sources)} />
          <DetailRow label="Data confidence" value={formatValue(substation.confidence, '%')} />
          <DetailRow label="Reconciliation status" value={formatValue(substation.reconciliationStatus)} />
          <DetailRow label="SCADA ID" value={formatValue(substation.scadaId)} />
          <DetailRow label="GIS ID" value={formatValue(substation.gisId)} />
          <DetailRow label="EAM ID" value={formatValue(substation.eamId)} />
          <DetailRow label="Engineering ID" value={formatValue(substation.engineeringId)} />
          <DetailRow label="Last asset update" value={formatValue(substation.lastUpdated)} />
        </DetailSection>

        <DetailSection title="Maintenance and data">
          <DetailRow label="Maintenance status" value={formatValue(maintenanceStatus)} />
          <DetailRow label="Maintenance forecast" value={formatValue(substation.maintenanceForecast)} />
          <DetailRow label="Connection status" value="Data unavailable" />
          <DetailRow label="Health score" value={formatValue(substation.healthScore, '/100')} />
          <DetailRow label="Risk score" value={formatValue(substation.riskScore, '/100')} />
          <DetailRow label="N-1 redundancy" value={formatValue(substation.nMinusOneRedundant)} />
          <DetailRow label="Criticality" value={formatValue(substation.criticalityScore, '/10')} />
        </DetailSection>
      </div>
    </aside>
  );
}
