import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DATA_STATE_INDICATORS } from '../tokens';
import type { DataState } from '../types';

export const FONT_MONO = "'JetBrains Mono', monospace";
export const FONT_DISPLAY = "'Space Grotesk', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";

// ---------------------------------------------------------------------------
// Formatting helpers (deterministic, board-grade)
// ---------------------------------------------------------------------------

export function formatKES(value: number | undefined | null, digits = 0): string {
  const v = value ?? 0;
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(digits)}B`;
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(digits)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(digits)}K`;
  return `${abs.toLocaleString()}`;
}

export function formatFullKES(value: number | undefined | null): string {
  const v = value ?? 0;
  return `KES ${v.toLocaleString('en-KE')}`;
}

export function formatPct(value: number | undefined | null, signed = true): string {
  const v = value ?? 0;
  const sign = signed && v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

export function formatNumber(value: number | undefined | null): string {
  return (value ?? 0).toLocaleString('en-KE');
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Reduced motion hook (respects prefers-reduced-motion)
// ---------------------------------------------------------------------------

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}

export function motionReduced(duration = 0.35): { duration: number } {
  return { duration: 0 };
}

export function animateProp(duration = 0.35): { duration: number; ease: string } {
  return { duration, ease: 'easeInOut' };
}

// ---------------------------------------------------------------------------
// Data state badge — never disguise fixture/unknown as real
// ---------------------------------------------------------------------------

export function DataStateBadge({ state, compact = false }: { state: DataState | string; compact?: boolean }) {
  const meta = DATA_STATE_INDICATORS[state] ?? DATA_STATE_INDICATORS.UNAVAILABLE;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border"
      style={{ color: meta.color, backgroundColor: meta.bgColor, borderColor: `${meta.color}33` }}
      title={`Data state: ${meta.label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {compact ? meta.label : meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Trend indicator
// ---------------------------------------------------------------------------

export function TrendIndicator({ trend, label }: { trend: 'UP' | 'DOWN' | 'STABLE'; label?: string }) {
  const Icon = trend === 'UP' ? TrendingUp : trend === 'DOWN' ? TrendingDown : Minus;
  const color = trend === 'UP' ? '#10B981' : trend === 'DOWN' ? '#F43F5E' : '#64748B';
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold"
      style={{ color }}
      aria-label={label ?? `Trend ${trend.toLowerCase()}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  dataState?: DataState | string;
  onClick?: () => void;
}

export function KpiCard({ label, value, sub, accent = '#00D9FF', icon, trend, dataState, onClick }: KpiCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { scale: 1.015 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className="finance-kpi flex flex-col gap-1.5 text-left w-full cursor-pointer border transition-colors hover:border-white/15"
      style={{ borderLeft: `2px solid ${accent}` }}
      aria-label={label}
    >
      <div className="flex items-center justify-between">
        <span className="finance-label">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <span className="finance-value" style={{ fontSize: 'clamp(1.15rem, 1.4vw, 1.5rem)' }}>{value}</span>
      {(sub || trend || dataState) && (
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-slate-500 font-mono truncate">{sub}</span>
          <span className="flex items-center gap-1.5">
            {trend && <TrendIndicator trend={trend} />}
            {dataState && dataState !== 'REAL' && <DataStateBadge state={dataState} compact />}
          </span>
        </div>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Panel / card surface
// ---------------------------------------------------------------------------

export function Panel({
  title,
  subtitle,
  right,
  children,
  className = '',
  accent,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <section
      className={`finance-panel overflow-hidden ${className}`}
      style={accent ? { borderTop: `2px solid ${accent}` } : undefined}
    >
      {(title || right) && (
        <header className="px-3 py-2 flex items-center justify-between gap-3 border-b border-white/[0.05]">
          <div className="min-w-0">
            {title && <h3 className="finance-text-primary text-[13px]">{title}</h3>}
            {subtitle && <p className="finance-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
        </header>
      )}
      <div className="p-3">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Select control
// ---------------------------------------------------------------------------

export function FinanceSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
      {label && <span>{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0B1220] border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-400/50 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0B1220]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Sparkline (SVG)
// ---------------------------------------------------------------------------

export function Sparkline({
  data,
  width = 120,
  height = 34,
  color = '#00D9FF',
  fill = true,
}: {
  data: number[];
  width?: number | string;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  const viewW = typeof width === 'number' ? width : 120;
  const { line, area } = useMemo(() => {
    if (!data.length) return { line: '', area: '' };
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = viewW / (data.length - 1 || 1);
    const pts = data.map((d, i) => `${(i * step).toFixed(1)},${(height - 2 - ((d - min) / range) * (height - 6)).toFixed(1)}`);
    return { line: pts.join(' '), area: `0,${height} ${pts.join(' ')} ${viewW},${height}` };
  }, [data, viewW, height]);

  if (!data.length) return <svg width={width} height={height} aria-hidden="true" />;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${viewW} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {fill && <polygon points={area} fill={color} opacity={0.12} />}
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

export function useTooltip() {
  const [tip, setTip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
  const show = useCallback((e: React.MouseEvent, content: React.ReactNode) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ x: rect.left + rect.width / 2, y: rect.top, content });
  }, []);
  const hide = useCallback(() => setTip(null), []);

  const node = tip ? (
    <div
      className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded border text-[10px] font-mono whitespace-nowrap"
      style={{
        left: tip.x,
        top: tip.y - 8,
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#0A0F1C',
        borderColor: 'rgba(0,217,255,0.3)',
        color: '#E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
      role="tooltip"
    >
      {tip.content}
    </div>
  ) : null;

  return { show, hide, tooltip: node };
}

// ---------------------------------------------------------------------------
// Progress / utilization bar
// ---------------------------------------------------------------------------

export function UtilizationBar({
  pct,
  color = '#00D9FF',
  label,
  value,
}: {
  pct: number;
  color?: string;
  label?: string;
  value?: string;
}) {
  return (
    <div className="space-y-1">
      {(label || value) && (
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500">{label}</span>
          <span className="text-slate-300">{value}</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status dot + label chip
// ---------------------------------------------------------------------------

export function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest border"
      style={{ color, borderColor: `${color}44`, backgroundColor: `${color}11` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
