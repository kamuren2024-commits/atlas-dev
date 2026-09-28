import React from 'react';
import { GitBranch, Layers3 } from 'lucide-react';
import { useAtlasContext } from '../../context/AtlasContext';
import AtlasDrawer from '../ui/atlas/AtlasDrawer';
import AtlasStatusBadge from '../ui/atlas/AtlasStatusBadge';

export default function AtlasInspector({ onOpenRelationships }: { onOpenRelationships: () => void }) {
  const { selectedEntity, inspectorOpen, closeInspector } = useAtlasContext();
  if (!selectedEntity) return null;

  return (
    <AtlasDrawer open={inspectorOpen} onClose={closeInspector} title={selectedEntity.label} subtitle={`${selectedEntity.type.replaceAll('_', ' ')} · ${selectedEntity.source || 'Atlas context'}`} icon={<Layers3 className="w-5 h-5" />} statusBadge={selectedEntity.status ? <AtlasStatusBadge status={selectedEntity.status} size="xs" /> : undefined} width="default">
      <section className="space-y-4" aria-label="Selected entity context">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
          <span className="text-atlas-label text-slate-500">Entity identifier</span>
          <p className="mt-1 font-mono text-sm text-slate-200 break-all">{selectedEntity.id}</p>
        </div>
        {selectedEntity.metadata && Object.keys(selectedEntity.metadata).length > 0 && (
          <dl className="divide-y divide-slate-800/70 rounded-xl border border-slate-800/70 bg-slate-950/30 px-3">
            {Object.entries(selectedEntity.metadata).map(([key, value]) => value !== undefined && (
              <div className="flex items-start justify-between gap-4 py-2.5" key={key}>
                <dt className="text-atlas-meta text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</dt>
                <dd className="text-sm text-right text-slate-200">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="text-atlas-body-sm text-slate-400">This inspector carries the selected enterprise context across Atlas workspaces. It does not execute actions.</p>
        <button type="button" onClick={onOpenRelationships} className="atlas-btn atlas-focus w-full h-10 border border-cyan-500/30 bg-cyan-950/25 text-cyan-200 text-sm">
          <GitBranch className="w-4 h-4" /> View relationships
        </button>
      </section>
    </AtlasDrawer>
  );
}
