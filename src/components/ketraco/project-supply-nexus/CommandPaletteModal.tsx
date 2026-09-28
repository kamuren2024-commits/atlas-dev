import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderGit2,
  AlertTriangle,
  FileText,
  Cpu,
  User,
  MapPin,
  Calendar,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (result: any) => void;
}

const SEARCH_CATALOG = [
  { id: 'p1', type: 'project', title: 'Mombasa 400kV Substation & Line', code: 'KET-PDS-0042', status: 'Construction' },
  { id: 'p2', type: 'project', title: 'Lamu - Isiolo 400kV Transmission', code: 'KET-PDS-0036', status: 'Construction' },
  { id: 'p3', type: 'project', title: 'Tana River 220kV Grid Reinforcement', code: 'KET-PDS-0071', status: 'Land/Wayleave' },
  { id: 'p4', type: 'project', title: 'Western Grid 132kV Substations', code: 'KET-PDS-0068', status: 'Construction' },
  { id: 's1', type: 'supplier', title: 'Shanghai Electric Power T&D Co.', code: 'SUP-0142', status: 'Active' },
  { id: 's2', type: 'supplier', title: 'KEC International Tower Fabricators', code: 'SUP-0089', status: 'Active' },
  { id: 'c1', type: 'contract', title: 'Contract KET-0036 Civil Works Lot 4', code: 'CNT-0036', status: 'Audited' },
  { id: 'm1', type: 'material', title: '220/132kV 150MVA Power Transformer', code: 'MAT-TX-042', status: 'At Risk' },
  { id: 'r1', type: 'risk', title: 'Wayleave Parcel 742 Dispute', code: 'RSK-0012', status: 'Critical' }
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? SEARCH_CATALOG.filter(
        item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.code.toLowerCase().includes(query.toLowerCase()) ||
          item.type.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_CATALOG.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-2xl bg-[#0a0f18] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, suppliers, materials, contracts, wayleaves, risks..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-slate-500 border border-slate-700/60 px-1.5 py-0.5 rounded">
            ESC to exit
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 py-1">
            {query.trim() ? `Search Results (${filtered.length})` : 'Recommended Entities'}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching entity found for "{query}". Try searching for Mombasa, Transformer, or KET-PDS.
            </div>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectResult?.(item);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 group-hover:text-cyan-300">
                    {item.type === 'project' && <FolderGit2 className="w-4 h-4" />}
                    {item.type === 'supplier' && <User className="w-4 h-4" />}
                    {item.type === 'contract' && <FileText className="w-4 h-4" />}
                    {item.type === 'material' && <Cpu className="w-4 h-4" />}
                    {item.type === 'risk' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {item.code} • {item.type.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {item.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2 border-t border-slate-800/80 bg-[#06090e] flex items-center justify-between text-[10px] font-mono text-slate-500 px-3">
          <span>Project Supply Nexus Knowledge Fabric</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
};
