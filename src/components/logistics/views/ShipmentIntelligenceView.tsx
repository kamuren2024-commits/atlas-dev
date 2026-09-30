import React, { useState, useEffect } from 'react';
import {
  Package, Search, Filter, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  MapPin, ShieldAlert, ArrowRight, ExternalLink, Calendar, Truck, User,
  CheckCircle, FileText
} from 'lucide-react';

interface Shipment {
  id: string;
  code: string;
  cargoType: string;
  description: string;
  quantity: number;
  weightKg: number;
  originSubstation: string;
  destinationSubstation: string;
  priority: string;
  status: string;
  assignedMissionId?: string;
  createdAt: string;
}

export default function ShipmentIntelligenceView() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/cargo');
      const json = await res.json();
      if (json.ok && json.data) {
        setShipments(json.data.cargo || []);
        if (json.data.cargo?.length > 0 && !selectedShipment) {
          setSelectedShipment(json.data.cargo[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load shipments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.destinationSubstation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Shipment Intelligence & Manifest Registry
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                Live Data Fabric
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-modal cargo manifests, substation delivery tracking, and bill-of-lading reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchShipments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Manifests</span>
          <div className="text-2xl font-bold text-white mt-1">{shipments.length}</div>
          <span className="text-[11px] text-emerald-400 font-medium">100% Verified Telemetry</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Transit</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {shipments.filter(s => s.status === 'IN_TRANSIT').length}
          </div>
          <span className="text-[11px] text-slate-400">Continuous GPS lock</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High / Critical Priority</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {shipments.filter(s => s.priority === 'CRITICAL' || s.priority === 'HIGH').length}
          </div>
          <span className="text-[11px] text-amber-400/80 font-medium">Suswa & Nairobi Ring</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivered / Staged</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {shipments.filter(s => s.status === 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-emerald-400/80">Digital e-PoD captured</span>
        </div>
      </div>

      {/* Main Body: List + Detail */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left: Filterable Table */}
        <div className="col-span-8 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/80">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search cargo, substation, manifest code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
                <option value="STAGED">Staged</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/60 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Manifest Code</th>
                  <th className="p-3 font-semibold">Description</th>
                  <th className="p-3 font-semibold">Origin ➔ Destination</th>
                  <th className="p-3 font-semibold">Weight</th>
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredShipments.map(s => {
                  const isSelected = selectedShipment?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedShipment(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-cyan-300">{s.code}</td>
                      <td className="p-3 font-medium max-w-[220px] truncate">{s.description}</td>
                      <td className="p-3 text-slate-300">{s.originSubstation} ➔ {s.destinationSubstation}</td>
                      <td className="p-3 font-mono">{(s.weightKg / 1000).toFixed(1)} t</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          s.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                          s.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detailed Manifest Inspector */}
        <div className="col-span-4 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Manifest Dossier</h3>
            </div>
            {selectedShipment && (
              <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                {selectedShipment.code}
              </span>
            )}
          </div>

          {selectedShipment ? (
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Cargo Title & Commodity</span>
                <div className="font-semibold text-white text-sm">{selectedShipment.description}</div>
                <div className="text-[11px] text-slate-400">Class: {selectedShipment.cargoType}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Origin Facility</span>
                  <div className="font-medium text-slate-200 mt-0.5">{selectedShipment.originSubstation}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Destination Hub</span>
                  <div className="font-medium text-cyan-300 mt-0.5">{selectedShipment.destinationSubstation}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Gross Weight</span>
                  <div className="font-mono font-bold text-white mt-0.5">{(selectedShipment.weightKg / 1000).toFixed(2)} Tons</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Units</span>
                  <div className="font-mono font-bold text-white mt-0.5">{selectedShipment.quantity} units</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Supply Chain Provenance</span>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Assigned Transport Mission:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedShipment.assignedMissionId || 'LM-2026-00942'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>KETRACO Project Nexus:</span>
                  <span className="text-emerald-400 font-medium">Suswa Lot 4 Grid Interconnect</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Customs & Port Clearance:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} /> Mombasa Port Cleared
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                  <Truck size={14} />
                  <span>Real-Time Logistics Escort</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Active GPS geofence monitored by KETRACO National Grid Security Dispatch. Heavy transport escort cleared on Northern Corridor.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a manifest to inspect detailed cargo bill-of-lading.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
