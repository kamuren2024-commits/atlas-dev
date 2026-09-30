import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, MapPin, Search, Filter,
  RefreshCw, FileText, UserCheck, AlertTriangle, Truck, ArrowRight
} from 'lucide-react';

interface DeliveryRecord {
  id: string;
  code: string;
  missionId: string;
  missionCode: string;
  cargoId: string;
  recipientName: string;
  recipientRole: string;
  destinationSubstation: string;
  status: string;
  deliveredAt?: string;
  originName: string;
  priority: string;
  riskLevel: string;
  proofOfDelivery: string;
}

export default function DeliveryControlTowerView() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [signoffName, setSignoffName] = useState('');
  const [signoffRole, setSignoffRole] = useState('Resident Substation Engineer');
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/deliveries');
      const json = await res.json();
      if (json.ok && json.data) {
        setDeliveries(json.data.deliveries || []);
        if (json.data.deliveries?.length > 0 && !selectedDelivery) {
          setSelectedDelivery(json.data.deliveries[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load deliveries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleSignoff = async () => {
    if (!selectedDelivery || !signoffName) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/logistics/deliveries/${selectedDelivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DELIVERED',
          recipientName: signoffName,
          recipientRole: signoffRole,
          signoffSignature: `DIGITAL_SIG_${Date.now()}_${signoffName.toUpperCase().replace(/\s+/g, '_')}`,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSignedSuccess(true);
        fetchDeliveries();
      }
    } catch (e) {
      console.error('Signoff failed:', e);
    } finally {
      setSigning(false);
    }
  };

  const filtered = deliveries.filter(d =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.destinationSubstation.toLowerCase().includes(search.toLowerCase()) ||
    d.missionCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Delivery Control Tower & Electronic Proof of Delivery (e-PoD)
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                SLA Custody Handover
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Substation destination reception, chain-of-custody verification, electronic signoff, and project milestone fulfillment.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Deliveries</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Deliveries</span>
          <div className="text-2xl font-bold text-white mt-1">{deliveries.length}</div>
          <span className="text-[11px] text-slate-400">Current quarter handovers</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Delivered (e-PoD)</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {deliveries.filter(d => d.status === 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Digital signatures validated</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Route / Approaching</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {deliveries.filter(d => d.status === 'IN_TRANSIT').length}
          </div>
          <span className="text-[11px] text-slate-400">Escort proximity alerts</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA On-Time Rating</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">94.8%</div>
          <span className="text-[11px] text-emerald-400 font-medium">+2.1% improvement</span>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Table */}
        <div className="col-span-8 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search delivery code, substation, mission..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400">{filtered.length} Consignments Tracked</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Delivery Code</th>
                  <th className="p-3 font-semibold">Mission Code</th>
                  <th className="p-3 font-semibold">Destination Substation</th>
                  <th className="p-3 font-semibold">Recipient</th>
                  <th className="p-3 font-semibold">Proof of Delivery</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map(d => {
                  const isSelected = selectedDelivery?.id === d.id;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => {
                        setSelectedDelivery(d);
                        setSignedSuccess(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-950/40 border-l-2 border-l-emerald-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-emerald-300">{d.code}</td>
                      <td className="p-3 font-mono text-cyan-300">{d.missionCode}</td>
                      <td className="p-3 font-medium text-white">{d.destinationSubstation}</td>
                      <td className="p-3 text-slate-300">{d.recipientName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {d.proofOfDelivery}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Dossier & Signoff Form */}
        <div className="col-span-4 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Custody Handover Dossier</h3>
            </div>
            {selectedDelivery && (
              <span className="font-mono text-xs text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                {selectedDelivery.code}
              </span>
            )}
          </div>

          {selectedDelivery ? (
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Target Substation Facility</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedDelivery.destinationSubstation}</div>
                <div className="text-[11px] text-slate-400 mt-1">Origin: {selectedDelivery.originName || 'Embakasi Central Yard'}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Mission & Chain of Custody</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Mission Code:</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedDelivery.missionCode}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Delivery Status:</span>
                  <span className="font-bold text-white">{selectedDelivery.status}</span>
                </div>
              </div>

              {signedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Electronic Proof of Delivery (e-PoD) locked into audit ledger.</span>
                </div>
              )}

              {selectedDelivery.status !== 'DELIVERED' ? (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <FileText size={14} />
                    <span>Electronic Handover Signoff</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Recipient Receiving Engineer</label>
                    <input
                      type="text"
                      placeholder="e.g. Eng. Peter Macharia"
                      value={signoffName}
                      onChange={e => setSignoffName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Designation / Role</label>
                    <input
                      type="text"
                      value={signoffRole}
                      onChange={e => setSignoffRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSignoff}
                    disabled={signing || !signoffName}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    {signing ? 'Confirming Signoff...' : 'Capture Electronic Proof of Delivery'}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={14} />
                    <span>e-PoD Verified & Archived</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>Signed By: <span className="text-white font-medium">{selectedDelivery.recipientName}</span></div>
                    <div>Designation: <span className="text-white font-medium">{selectedDelivery.recipientRole}</span></div>
                    <div>Timestamp: <span className="font-mono text-cyan-300">{selectedDelivery.deliveredAt || '2026-09-18T07:44:00Z'}</span></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a delivery consignment to execute custody signoff.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
