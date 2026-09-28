import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Search,
  Filter,
  Square,
  CheckSquare,
  Eye,
  EyeOff,
  X,
  Rows3,
  Columns3,
} from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface AtlasTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  hidden?: boolean;
  numeric?: boolean;
  statusColumn?: boolean;
  wrap?: boolean;
}

export interface AtlasTableProps<T extends { id: string }> {
  columns: AtlasTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selected: Set<string>) => void;
  getRowStatus?: (row: T) => string;
  density?: 'comfortable' | 'standard' | 'compact';
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  bulkActions?: (selected: Set<string>, clear: () => void) => React.ReactNode;
  className?: string;
}

export function AtlasTable<T extends { id: string }>({
  columns,
  rows,
  loading = false,
  emptyTitle = 'No records',
  emptyDescription = 'No data is available to display.',
  selectable = false,
  initialPageSize = 25,
  pageSizeOptions = [25, 50, 100],
  searchable = true,
  searchPlaceholder = 'Search records...',
  onRowClick,
  onSelectionChange,
  getRowStatus,
  density: initialDensity = 'standard',
  title,
  description,
  actions,
  bulkActions,
  className = '',
}: AtlasTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(columns.map(c => [c.id, !c.hidden]))
  );
  const [showColPanel, setShowColPanel] = useState(false);
  const [density, setDensity] = useState(initialDensity);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filteredRows = useMemo(() => {
    let out = [...rows];
    if (search.trim()) {
      const s = search.toLowerCase();
      out = out.filter(row =>
        columns.some(col => {
          const v = col.accessor(row);
          return String(v ?? '').toLowerCase().includes(s);
        })
      );
    }
    if (sortCol && sortDir) {
      const col = columns.find(c => c.id === sortCol);
      const getter = col?.sortValue;
      out.sort((a, b) => {
        const va = getter ? getter(a) : String(col?.accessor(a) ?? '');
        const vb = getter ? getter(b) : String(col?.accessor(b) ?? '');
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        return sortDir === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return out;
  }, [rows, search, sortCol, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pageRows = filteredRows.slice(start, end);

  const toggleSort = (col: AtlasTableColumn<T>) => {
    if (!col.sortable && !col.sortValue) return;
    if (sortCol !== col.id) {
      setSortCol(col.id);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else if (sortDir === 'desc') {
      setSortCol(null);
      setSortDir(null);
    } else {
      setSortDir('asc');
    }
  };

  const toggleRow = (id: string) => {
    const next: Set<string> = new Set<string>(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onSelectionChange?.(next);
  };

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every(r => selected.has(r.id));
  const toggleAllOnPage = () => {
    const next: Set<string> = new Set<string>(selected);
    if (allOnPageSelected) {
      pageRows.forEach(r => next.delete(r.id));
    } else {
      pageRows.forEach(r => next.add(r.id));
    }
    setSelected(next);
    onSelectionChange?.(next);
  };

  const clearSelection = () => {
    const empty: Set<string> = new Set<string>();
    setSelected(empty);
    onSelectionChange?.(empty);
  };

  const activeCols = columns.filter(c => columnVisibility[c.id] !== false);
  const paddingY = density === 'comfortable' ? 'py-3.5' : density === 'standard' ? 'py-2.5' : 'py-1.5';
  const paddingX = density === 'comfortable' ? 'px-4' : density === 'standard' ? 'px-3.5' : 'px-3';
  const rowH = density === 'comfortable' ? '' : density === 'compact' ? 'text-[13px]' : '';
  const headerH = density === 'compact' ? 'py-2 text-[11px]' : 'py-2.5';

  return (
    <div className={`atlas-panel p-0 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 p-4 border-b border-slate-800/50 bg-atlas-bg-sunken/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-atlas-h3 text-slate-200 truncate">{title}</h3>}
            {description && <p className="text-atlas-body-sm text-slate-500 mt-0.5 truncate">{description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder={searchPlaceholder}
                  className="atlas-focus w-[240px] pl-9 pr-8 py-2 h-9 rounded-lg border border-slate-700/60 bg-atlas-bg-sunken text-slate-200 placeholder-slate-500 text-sm focus:border-cyan-500/40 focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white rounded cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setShowFilterPanel(v => !v)}
              className={`atlas-btn variant-status h-9 px-3 gap-1.5 rounded-lg text-sm ${showFilterPanel ? '!border-cyan-500/40 !text-cyan-400' : ''}`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowColPanel(v => !v)}
                className="atlas-btn variant-status h-9 px-3 gap-1.5 rounded-lg text-sm"
                aria-label="Column visibility"
              >
                <Settings2 className="w-4 h-4" />
                <Columns3 className="w-4 h-4 hidden sm:block" />
              </button>
              <AnimatePresence>
                {showColPanel && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowColPanel(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-700/60 bg-atlas-bg-elevated shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-2 z-30"
                    >
                      <div className="text-atlas-label text-slate-500 px-2 py-1.5 tracking-widest">
                        COLUMNS
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {columns.map(col => (
                          <button
                            key={col.id}
                            onClick={() =>
                              setColumnVisibility(v => ({ ...v, [col.id]: !v[col.id] }))
                            }
                            className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 text-left text-sm cursor-pointer"
                          >
                            <span className="text-slate-300 truncate">{col.header}</span>
                            {columnVisibility[col.id] !== false ? (
                              <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center rounded-lg border border-slate-700/60 p-0.5 bg-atlas-bg-sunken">
              {([
                ['comfortable', Rows3, 'Comfortable'],
                ['standard', Columns3, 'Standard'],
                ['compact', Rows3, 'Compact'],
              ] as const).map(([v, Icon, _label]) => (
                <button
                  key={v}
                  onClick={() => setDensity(v)}
                  title={_label}
                  className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                    density === v
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                  aria-label={`Density: ${v}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            {actions}
          </div>
        </div>

        {/* Selection / Bulk actions bar */}
        {selectable && selected.size > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-medium">{selected.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              {bulkActions ? bulkActions(selected, clearSelection) : null}
              <button
                onClick={clearSelection}
                className="atlas-btn variant-ghost size-sm !h-7 !px-2 text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[calc(100vh-420px)] min-h-[360px] relative">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 atlas-table-header backdrop-blur">
            <tr>
              {selectable && (
                <th
                  className={`sticky left-0 z-20 atlas-table-header w-10 ${paddingX} ${headerH} text-left`}
                  style={{ background: 'var(--color-atlas-bg-sunken)' }}
                >
                  <button
                    onClick={toggleAllOnPage}
                    className="text-slate-400 hover:text-white atlas-focus p-0.5 rounded cursor-pointer"
                    aria-label={allOnPageSelected ? 'Deselect all on page' : 'Select all on page'}
                  >
                    {allOnPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              {activeCols.map(col => {
                const canSort = col.sortable || !!col.sortValue;
                const isActive = sortCol === col.id;
                return (
                  <th
                    key={col.id}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    className={`${paddingX} ${headerH} font-mono font-bold uppercase tracking-wider text-[11px] text-slate-300 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${canSort ? 'cursor-pointer select-none hover:text-cyan-400 atlas-focus transition-colors' : ''}`}
                    onClick={() => canSort && toggleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {canSort && (
                        <span className="text-cyan-400">
                          {isActive && sortDir === 'asc' && <ChevronUp className="w-3.5 h-3.5" />}
                          {isActive && sortDir === 'desc' && <ChevronDown className="w-3.5 h-3.5" />}
                          {!isActive && <ChevronUp className="w-3.5 h-3.5 opacity-40 text-slate-400" />}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={activeCols.length + (selectable ? 1 : 0)}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span className="text-atlas-meta text-slate-500">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={activeCols.length + (selectable ? 1 : 0)}
                  className="px-4 py-20"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl border border-slate-800/60 bg-atlas-bg-sunken flex items-center justify-center text-slate-600">
                      <Rows3 className="w-6 h-6" />
                    </div>
                    <h4 className="text-atlas-h4 text-slate-300">{emptyTitle}</h4>
                    <p className="text-atlas-body-sm text-slate-500 max-w-sm mx-auto">
                      {emptyDescription}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map(row => {
                const isSelected = selected.has(row.id);
                const rowStatus = getRowStatus?.(row);
                return (
                  <tr
                    key={row.id}
                    className={`${
                      isSelected ? 'atlas-table-row-selected' : 'atlas-table-row'
                    } ${paddingY} ${rowH} border-b border-slate-800/40 transition-colors atlas-focus ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td
                        className={`sticky left-0 z-[1] ${paddingX} w-10`}
                        style={
                          isSelected
                            ? { background: 'rgba(0, 217, 255, 0.06)' }
                            : { background: 'var(--color-atlas-bg-panel)' }
                        }
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="text-slate-400 hover:text-white atlas-focus p-0.5 rounded cursor-pointer"
                          aria-label={isSelected ? 'Deselect row' : 'Select row'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {activeCols.map(col => (
                      <td
                        key={col.id}
                        className={`${paddingX} ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.numeric ? 'numeric-mono text-slate-200 tabular-nums' : 'text-slate-300'}`}
                        style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                      >
                        <div className={`min-w-0 max-w-[560px] ${col.wrap ? 'break-words whitespace-normal' : 'truncate'}`}>
                          {col.accessor(row)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-800/50 text-atlas-meta text-slate-400">
        <div className="flex items-center gap-3">
          <span className="numeric-mono font-medium text-slate-300">
            {filteredRows.length === 0
              ? '0 records'
              : `${start + 1}–${Math.min(end, filteredRows.length)} of ${filteredRows.length}`}
          </span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="h-7 px-2 rounded-md border border-slate-700/60 bg-atlas-bg-sunken text-slate-200 font-medium text-xs atlas-focus cursor-pointer"
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={currentPage === 0}
            className="atlas-btn variant-ghost size-sm !h-7 !w-7 !p-0 disabled:opacity-30 text-slate-300 hover:text-white"
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="atlas-btn variant-ghost size-sm !h-7 !w-7 !p-0 disabled:opacity-30 text-slate-300 hover:text-white"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[72px] text-center numeric-mono text-slate-200 font-semibold text-sm">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="atlas-btn variant-ghost size-sm !h-7 !w-7 !p-0 disabled:opacity-30 text-slate-300 hover:text-white"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className="atlas-btn variant-ghost size-sm !h-7 !w-7 !p-0 disabled:opacity-30 text-slate-300 hover:text-white"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default AtlasTable;
