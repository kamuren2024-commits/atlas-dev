import React, { useState } from 'react';
import {
  Search,
  Database,
  Calendar,
  ShieldCheck,
  Clock,
  ArrowRight,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Props {
  onSelectMeetingById?: (id: string) => void;
}

export const OrganizationalMemorySearchView: React.FC<Props> = ({ onSelectMeetingById }) => {
  const [query, setQuery] = useState('KRA');
  const [results, setResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/meeting-intelligence/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Organizational Memory & Semantic Search
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Query across historical KETRACO board sessions, technical hearings, signed decisions, and transcript archives.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-[#0c1220] border border-slate-800 rounded-xl p-3 shadow-lg">
        <Search className="w-4 h-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by keyword, tender code, contractor name, or statutory phrase (e.g. 'KRA', 'Suswa', 'PPADA')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
          {isSearching ? 'Searching...' : 'Search Memory'}
        </button>
      </form>

      {/* Suggested Fast Queries */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span>Suggested:</span>
        {['KRA', 'Evaluation OS', 'Suswa-Isinya', 'Shanghai Electric', 'PPADA'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              setTimeout(() => handleSearch(), 50);
            }}
            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-[11px] cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          <div className="text-xs font-mono text-slate-400">
            Found <strong className="text-cyan-400">{results.total_matches}</strong> matching governance records for "{query}"
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Transcript Matches */}
            {results.transcripts?.length > 0 && (
              <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Transcript Evidence Hits ({results.transcripts.length})
                </h3>
                <div className="space-y-2">
                  {results.transcripts.map((tr: any) => (
                    <div key={tr.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-cyan-300">{tr.speaker}</span>
                        <span className="text-slate-500">[{tr.timestamp_label}]</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed italic">
                        "{tr.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Matches */}
            {results.decisions?.length > 0 && (
              <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Statutory Decisions ({results.decisions.length})
                </h3>
                <div className="space-y-2">
                  {results.decisions.map((dec: any) => (
                    <div key={dec.id} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-cyan-300">{dec.code}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400">{dec.status}</span>
                      </div>
                      <p className="font-semibold text-slate-100">{dec.title}</p>
                      <p className="text-[11px] font-mono text-slate-400">Lead: {dec.owner}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Matches */}
            {results.actions?.length > 0 && (
              <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Action Tasks ({results.actions.length})
                </h3>
                <div className="space-y-2">
                  {results.actions.map((act: any) => (
                    <div key={act.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-200">{act.action_title}</p>
                        <span className="text-[10px] font-mono font-bold text-cyan-400">{act.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Owner: {act.owner}</span>
                        <span>Due: {act.due_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Matches */}
            {results.meetings?.length > 0 && (
              <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Historic Meetings ({results.meetings.length})
                </h3>
                <div className="space-y-2">
                  {results.meetings.map((m: any) => (
                    <div key={m.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-slate-200">{m.title}</span>
                        <span className="text-cyan-400">{m.date}</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400">Dept: {m.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
