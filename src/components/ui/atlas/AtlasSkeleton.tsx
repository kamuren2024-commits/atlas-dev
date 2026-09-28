import React from 'react';

export interface AtlasSkeletonProps {
  key?: React.Key;
  count?: number;
  height?: number | string;
  width?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'none' | 'full';
  className?: string;
  inline?: boolean;
}

function roundedClass(r: NonNullable<AtlasSkeletonProps['rounded']>) {
  switch (r) {
    case 'sm': return 'rounded';
    case 'md': return 'rounded-lg';
    case 'lg': return 'rounded-xl';
    case 'full': return 'rounded-full';
    case 'none':
    default:
      return '';
  }
}

export function AtlasSkeleton({
  count = 1,
  height = 16,
  width,
  rounded = 'md',
  className = '',
  inline = false,
}: AtlasSkeletonProps) {
  const Wrapper: any = inline ? React.Fragment : 'div';
  const items = Array.from({ length: count });
  return (
    <Wrapper>
      {items.map((_, i) => (
        <div
          key={i}
          className={`atlas-skeleton ${roundedClass(rounded)} ${className} ${
            inline ? 'inline-block' : ''
          } ${i < count - 1 && !inline ? 'mb-2' : ''}`}
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            width: width
              ? typeof width === 'number'
                ? `${width}px`
                : width
              : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </Wrapper>
  );
}

/* ---------------- Pre-made skeletons for common patterns ---------------- */

export function AtlasKpiSkeleton({ count = 4 }: { count?: number }) {
  const cols =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    count === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="atlas-panel p-5 space-y-3">
          <AtlasSkeleton height={12} width={120} rounded="sm" />
          <AtlasSkeleton height={30} width={160} rounded="sm" />
          <div className="flex items-center gap-2 pt-1">
            <AtlasSkeleton height={14} width={72} rounded="full" />
            <AtlasSkeleton height={12} width={100} rounded="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AtlasTableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="atlas-panel overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-slate-800/50 bg-atlas-bg-sunken/40 flex items-center justify-between">
        <div className="space-y-1.5">
          <AtlasSkeleton height={18} width={180} rounded="sm" />
          <AtlasSkeleton height={12} width={240} rounded="sm" />
        </div>
        <div className="flex items-center gap-2">
          <AtlasSkeleton height={36} width={200} rounded="lg" />
          <AtlasSkeleton height={36} width={36} rounded="lg" />
          <AtlasSkeleton height={36} width={36} rounded="lg" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="atlas-table-header">
              <th className="w-10 px-4 py-3"></th>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <AtlasSkeleton height={10} width={i === 0 ? 180 : 100 + Math.random() * 40} rounded="sm" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800/40 atlas-table-row">
                <td className="px-4 py-3 w-10">
                  <AtlasSkeleton height={16} width={16} rounded="sm" />
                </td>
                {Array.from({ length: cols }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <AtlasSkeleton
                      height={12}
                      width={j === 0 ? 240 : 80 + ((i + j) % 5) * 20}
                      rounded="sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-slate-800/50 flex items-center justify-between">
        <AtlasSkeleton height={12} width={160} rounded="sm" />
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map(i => (
            <AtlasSkeleton key={i} height={28} width={28} rounded="md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AtlasPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <AtlasSkeleton height={12} width={180} rounded="sm" />
        <AtlasSkeleton height={36} width={380} rounded="sm" />
        <AtlasSkeleton height={14} width={620} rounded="sm" />
      </div>
      <AtlasKpiSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AtlasTableSkeleton rows={6} cols={5} />
        </div>
        <div className="space-y-4">
          <div className="atlas-panel p-5 space-y-3">
            <AtlasSkeleton height={16} width={140} rounded="sm" />
            <AtlasSkeleton count={5} />
          </div>
          <div className="atlas-panel p-5 space-y-3">
            <AtlasSkeleton height={16} width={120} rounded="sm" />
            <AtlasSkeleton height={200} rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtlasSkeleton;
