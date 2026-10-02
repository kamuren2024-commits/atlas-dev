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
import { normalizeLogisticsViewId, type LogisticsViewId } from '../../modules/atlas-module-registry';

export const LogisticsView: React.FC = () => {
  const [activeView, setActiveView] = useState<LogisticsViewId>('command-center');
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
    const nextView = normalizeLogisticsViewId(view) ?? 'command-center';
    setActiveView(nextView);
  };

  const renderContent = () => {
    switch (normalizeLogisticsViewId(activeView) ?? 'command-center') {
      case 'command-center':
        return <CommandCenter />;
      case 'shipments':
        return <ShipmentIntelligenceView />;
      case 'fleet':
        return <FleetIntelligenceView />;
      case 'warehouses':
        return <WarehouseIntelligenceView />;
      case 'routes':
        return <RouteIntelligenceView />;
      case 'deliveries':
        return <DeliveryControlTowerView />;
      case 'disruptions':
        return <LogisticsRiskCenterView />;
      case 'ai-operations':
        return <AiOperationsWorkspaceView />;
      case 'analytics':
        return <LogisticsAnalyticsView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-cyan-500/20 bg-slate-950/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 flex items-center justify-between gap-3">
        <span>{dataMode?.label || '● SYNTHETIC DEMO'}</span>
        {dataMode?.syntheticNotice ? (
          <span className="text-[9px] tracking-[0.12em] text-slate-400 normal-case font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%]">
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
