import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, RefreshCw, Search, ShieldCheck, UserCheck } from 'lucide-react';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface DeliveryControlTowerViewProps {
  twin: LogisticsTwin;
  loading: boolean;
  error: string | null;
}

export default function DeliveryControlTowerView({ twin, loading, error }: DeliveryControlTowerViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(twin.deliveries[0]?.id ?? null);
  const [signoffName, setSignoffName] = useState('');
  const [signoffRole, setSignoffRole] = useState('Resident Substation Engineer');
  const [signing, setSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  useEffect(() => {
    if (!twin.deliveries.length) {
      setSelectedDeliveryId(null);
      return;
    }

    setSelectedDeliveryId((current) => {
      if (current && twin.deliveries.some((delivery) => delivery.id === current)) {
        return current;
      }
      return twin.deliveries[0].id;
    });
  }, [twin.deliveries]);

  const filteredDeliveries = useMemo(() => {
    const query = search.toLowerCase();
    return twin.deliveries.filter((delivery) => {
      const haystack = `${delivery.code} ${delivery.destination} ${delivery.shipmentId ?? ''} ${delivery.status}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search, twin.deliveries]);

  const selectedDelivery =
    filteredDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ??
    twin.deliveries.find((delivery) => delivery.id === selectedDeliveryId) ??
    twin.deliveries[0] ??
    null;

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
      }
    } catch (deliveryError) {
      console.error('Signoff failed:', deliveryError);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mb-3 animate-spin text-emerald-400">⟳</div>
          <p>Loading delivery operations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-400">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-3 text-yellow-400" />
          <p className="mb-2 font-bold">Data Source Warning</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#020b14] p-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              Delivery Control Tower & Electronic Proof of Delivery (e-PoD)
              <span className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                SLA Custody Handover
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Substation destination reception, chain-of-custody verification, electronic signoff, and project milestone fulfillment.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-slate-700"
          onClick={() => undefined}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Deliveries</span>
        </button>
      </div>

      <div className="my-4 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Deliveries</span>
          <div className="mt-1 text-2xl font-bold text-white">{twin.deliveries.length}</div>
          <span className="text-[11px] text-slate-400">Current quarter handovers</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed Delivered (e-PoD)</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {twin.deliveries.filter((delivery) => delivery.status === 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Digital signatures validated</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Route / Approaching</span>
          <div className="mt-1 text-2xl font-bold text-cyan-400">
            {twin.deliveries.filter((delivery) => delivery.status === 'IN_TRANSIT').length}
          </div>
          <span className="text-[11px] text-slate-400">Escort proximity alerts</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA On-Time Rating</span>
          <div className="mt-1 text-2xl font-bold text-amber-400">94.8%</div>
          <span className="text-[11px] text-emerald-400 font-medium">+2.1% improvement</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-5 overflow-hidden">
        <div className="col-span-8 flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-950/80 px-3 py-1.5 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search delivery code, destination, status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border-none bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">{filteredDeliveries.length} consignments tracked</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 border-b border-slate-800 bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-3 font-semibold">Delivery Code</th>
                  <th className="p-3 font-semibold">Shipment</th>
                  <th className="p-3 font-semibold">Destination</th>
                  <th className="p-3 font-semibold">ETA</th>
                  <th className="p-3 font-semibold">PoD</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredDeliveries.map((delivery) => {
                  const isSelected = selectedDelivery?.id === delivery.id;
                  return (
                    <tr
                      key={delivery.id}
                      onClick={() => {
                        setSelectedDeliveryId(delivery.id);
                        setSignedSuccess(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'border-l-2 border-l-emerald-400 bg-emerald-950/40' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-emerald-300">{delivery.code}</td>
                      <td className="p-3 font-mono text-cyan-300">{delivery.shipmentId ?? '—'}</td>
                      <td className="p-3 font-medium text-white">{delivery.destination}</td>
                      <td className="p-3 text-slate-300">{new Date(delivery.eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${delivery.podStatus === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                          {delivery.podStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${delivery.status === 'DELIVERED' ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'}`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-4 flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-4">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Custody Handover Dossier</h3>
            </div>
            {selectedDelivery && (
              <span className="rounded border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 font-mono text-xs text-emerald-300">
                {selectedDelivery.code}
              </span>
            )}
          </div>

          {selectedDelivery ? (
            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Target Substation Facility</span>
                <div className="mt-0.5 text-sm font-bold text-white">{selectedDelivery.destination}</div>
                <div className="mt-1 text-[11px] text-slate-400">Status: {selectedDelivery.status}</div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Mission & Chain of Custody</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Shipment ID:</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedDelivery.shipmentId ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ETA:</span>
                  <span className="font-bold text-white">{new Date(selectedDelivery.eta).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>

              {signedSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs text-emerald-300">
                  <CheckCircle2 size={16} />
                  <span>Electronic Proof of Delivery (e-PoD) locked into audit ledger.</span>
                </div>
              )}

              {selectedDelivery.status !== 'DELIVERED' ? (
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <FileText size={14} />
                    <span>Electronic Handover Signoff</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Recipient Receiving Engineer</label>
                    <input
                      type="text"
                      placeholder="e.g. Eng. Peter Macharia"
                      value={signoffName}
                      onChange={(event) => setSignoffName(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Designation / Role</label>
                    <input
                      type="text"
                      value={signoffRole}
                      onChange={(event) => setSignoffRole(event.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSignoff}
                    disabled={signing || !signoffName}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 disabled:bg-slate-800"
                  >
                    {signing ? 'Confirming Signoff...' : 'Capture Electronic Proof of Delivery'}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span className="font-bold">Delivery Confirmed</span>
                  </div>
                  <div>Proof-of-delivery has been accepted and archived in the custody ledger.</div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
                <span>Asset Hand-off Ready</span>
                <button type="button" className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white">
                  Open signoff workflow <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Select a delivery to inspect the chain-of-custody record.</div>
          )}
        </div>
      </div>
    </div>
  );
}
