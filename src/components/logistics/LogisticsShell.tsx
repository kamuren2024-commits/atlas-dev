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
  { id: 'command-center', icon: Zap, label: 'Command Center' },
  { id: 'shipments', icon: Package, label: 'Shipments' },
  { id: 'fleet', icon: Truck, label: 'Fleet Telematics' },
  { id: 'warehouses', icon: MapPin, label: 'Warehouses' },
  { id: 'routes', icon: Settings, label: 'Corridors' },
  { id: 'deliveries', icon: BarChart3, label: 'Deliveries & e-PoD' },
  { id: 'disruptions', icon: AlertTriangle, label: 'Risk Center' },
  { id: 'ai-operations', icon: Bot, label: 'AI Ops' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
];

const LogisticsShell: React.FC<LogisticsShellProps> = ({
  children,
  activeView,
  onViewChange,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logistics sub-navigation tab bar */}
      <div
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
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ y: -1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
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
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default LogisticsShell;
