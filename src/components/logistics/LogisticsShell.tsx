import React from 'react';
import { motion } from 'motion/react';
import {
  Package, Truck, MapPin, AlertTriangle, Zap, Bot, BarChart3, Settings
} from 'lucide-react';
import { colors } from '../../design-system/tokens';
import {
  LOGISTICS_VIEW_LABELS,
  normalizeLogisticsViewId,
  type LogisticsViewId,
} from '../../modules/atlas-module-registry';

interface LogisticsShellProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const NAV_ITEMS = [
  { id: 'command-center', icon: Zap },
  { id: 'shipments', icon: Package },
  { id: 'fleet', icon: Truck },
  { id: 'warehouses', icon: MapPin },
  { id: 'routes', icon: Settings },
  { id: 'deliveries', icon: BarChart3 },
  { id: 'disruptions', icon: AlertTriangle },
  { id: 'ai-operations', icon: Bot },
  { id: 'analytics', icon: BarChart3 },
] as const satisfies ReadonlyArray<{ id: LogisticsViewId; icon: typeof Zap }>;

const LogisticsShell: React.FC<LogisticsShellProps> = ({
  children,
  activeView,
  onViewChange,
}) => {
  return (
    <div className="logistics-shell flex flex-col h-full overflow-hidden">
      {/* Logistics sub-navigation tab bar */}
      <nav
        aria-label="Logistics workspaces"
        className="flex-shrink-0 px-4 py-1.5 border-b flex items-center gap-1 overflow-x-auto"
        style={{
          borderColor: colors.logistics.border,
          backgroundColor: colors.logistics.surface,
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest mr-3 flex-shrink-0"
          style={{ color: colors.logistics.primary }}
        >
          LOGISTICS
        </span>
        {NAV_ITEMS.map(item => {
          const isActive = normalizeLogisticsViewId(activeView) === item.id;
          const label = LOGISTICS_VIEW_LABELS[item.id];
          return (
            <motion.button
              type="button"
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              title={label}
              whileHover={{ y: -1 }}
              className="logistics-tab flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
              style={{
                backgroundColor: isActive ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                color: isActive ? colors.logistics.primary : colors.logistics.textMuted,
                borderBottom: isActive ? `2px solid ${colors.logistics.primary}` : '2px solid transparent',
              }}
            >
              <item.icon size={13} />
              {LOGISTICS_VIEW_LABELS[item.id]}
            </motion.button>
          );
        })}
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default LogisticsShell;
