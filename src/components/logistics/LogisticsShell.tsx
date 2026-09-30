import React from 'react';
import { motion } from 'motion/react';
import {
  Package, Truck, MapPin, AlertTriangle, Zap, Bot, BarChart3, Settings
} from 'lucide-react';
import { colors } from '../../design-system/tokens';

interface LogisticsShellProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const NAV_ITEMS = [
  { id: 'logistics-command-center', icon: Zap, label: 'Command Center' },
  { id: 'logistics-shipments', icon: Package, label: 'Shipments' },
  { id: 'logistics-fleet', icon: Truck, label: 'Fleet Telematics' },
  { id: 'logistics-warehouses', icon: MapPin, label: 'Warehouses' },
  { id: 'logistics-routes', icon: Settings, label: 'Corridors' },
  { id: 'logistics-deliveries', icon: BarChart3, label: 'Deliveries & e-PoD' },
  { id: 'logistics-disruptions', icon: AlertTriangle, label: 'Risk Center' },
  { id: 'logistics-ai-operations', icon: Bot, label: 'AI Ops' },
  { id: 'logistics-analytics', icon: BarChart3, label: 'Analytics' },
];

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
          const isActive = activeView === item.id;
          return (
            <motion.button
              type="button"
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
              whileHover={{ y: -1 }}
              className="logistics-tab flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
              style={{
                backgroundColor: isActive ? 'rgba(0, 217, 255, 0.12)' : 'transparent',
                color: isActive ? colors.logistics.primary : colors.logistics.textMuted,
                borderBottom: isActive ? `2px solid ${colors.logistics.primary}` : '2px solid transparent',
              }}
            >
              <item.icon size={13} />
              {item.label}
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
