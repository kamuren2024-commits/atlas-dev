import React, { useEffect, useState } from 'react';
import { LogisticsShell, CommandCenter } from './index';
import ShipmentIntelligenceView from './views/ShipmentIntelligenceView';
import FleetIntelligenceView from './views/FleetIntelligenceView';
import WarehouseIntelligenceView from './views/WarehouseIntelligenceView';
import RouteIntelligenceView from './views/RouteIntelligenceView';
import DeliveryControlTowerView from './views/DeliveryControlTowerView';
import LogisticsRiskCenterView from './views/LogisticsRiskCenterView';
import AiOperationsWorkspaceView from './views/AiOperationsWorkspaceView';
import LogisticsAnalyticsView from './views/LogisticsAnalyticsView';
import { LOGISTICS_VIEW_IDS, normalizeLogisticsViewId, type LogisticsViewId } from '../../modules/atlas-module-registry';
import './logistics.css';

export const LogisticsView: React.FC = () => {
  const [activeView, setActiveView] = useState<LogisticsViewId>('logistics-command-center');
  const [dataMode, setDataMode] = useState<{ mode: string; label: string; syntheticNotice?: string } | null>(null);

  useEffect(() => {
    const loadDataMode = async () => {
      try {
        const res = await fetch('/api/logistics/data-mode');
        const json = await res.json();
        if (json.ok && json.data) {
          setDataMode({
            mode: json.data.mode,
            label: json.data.label || '● SYNTHETIC DEMO',
            syntheticNotice: json.data.provider?.syntheticNotice || json.data.description,
          });
        }
      } catch {
        setDataMode({ mode: 'SYNTHETIC', label: '● SYNTHETIC DEMO', syntheticNotice: 'SYNTHETIC DEMONSTRATION DATA ONLY. Not connected to production KETRACO telematics.' });
      }
    };

    void loadDataMode();
  }, []);

  const handleViewChange = (view: string) => {
    const normalized = normalizeLogisticsViewId(view);
    setActiveView(normalized ?? 'logistics-command-center');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'logistics-command-center':
        return <CommandCenter />;
      case 'logistics-shipments':
        return <ShipmentIntelligenceView />;
      case 'logistics-fleet':
        return <FleetIntelligenceView />;
      case 'logistics-warehouses':
        return <WarehouseIntelligenceView />;
      case 'logistics-routes':
        return <RouteIntelligenceView />;
      case 'logistics-deliveries':
        return <DeliveryControlTowerView />;
      case 'logistics-disruptions':
        return <LogisticsRiskCenterView />;
      case 'logistics-ai-operations':
        return <AiOperationsWorkspaceView />;
      case 'logistics-analytics':
        return <LogisticsAnalyticsView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="logistics-module flex flex-col h-full">
      <div className="logistics-environment flex-shrink-0 border-b border-cyan-500/20 bg-slate-950/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <span className="logistics-status-indicator" aria-hidden="true" />
          DEMO SIMULATION
          {dataMode?.label && dataMode.label !== 'DEMO SIMULATION' ? (
            <span className="text-slate-400 font-medium tracking-normal">{dataMode.label}</span>
          ) : null}
        </span>
        {dataMode?.syntheticNotice ? (
          <span className="text-xs tracking-normal text-slate-400 normal-case font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%]">
            {dataMode.syntheticNotice}
          </span>
        ) : null}
      </div>
      <LogisticsShell
        activeView={activeView}
        onViewChange={handleViewChange}
      >
        {renderContent()}
      </LogisticsShell>
    </div>
  );
};

export default LogisticsView;
