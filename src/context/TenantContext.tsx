import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface TenantTheme {
  primary: string; // Hex code or tailwind class
  secondary: string;
  accent: string;
  panelBg: string;
  bodyBg: string;
}

export interface TenantModule {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

export interface TenantPermissions {
  analytics: boolean;
  tenderIntel: boolean;
  digitalTwin: boolean;
  aiAgents: boolean;
  contracts: boolean;
  governance: boolean;
  securityLevel: string;
}

export interface Tenant {
  id: string;
  name: string;
  fullName: string;
  logoText: string;
  badgeColor: string;
  theme: TenantTheme;
  modules: TenantModule[];
  permissions: TenantPermissions;
}

export interface TenantContextType {
  currentTenant: Tenant;
  availableTenants: Tenant[];
  switchTenant: (id: string) => void;
  isDemoSession: boolean;
  enterDemoSession: () => boolean;
  exitDemoSession: () => void;
  userProfile: {
    name: string;
    role: string;
    accessLevel: string;
    clearance: string;
  };
  setUserProfile: React.Dispatch<React.SetStateAction<{
    name: string;
    role: string;
    accessLevel: string;
    clearance: string;
  }>>;
}

const defaultTenants: Tenant[] = [
  {
    id: 'ketraco',
    name: 'KETRACO',
    fullName: 'Kenya Electricity Transmission Company',
    logoText: '⚡ KETRACO',
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/40',
    theme: {
      primary: '#00D9FF',
      secondary: '#0EA5E9',
      accent: '#00D9FF',
      panelBg: '#101827',
      bodyBg: '#05070D'
    },
    modules: [
      { id: 'overview', label: 'Command Center', desc: 'Central spatial metrics operations', enabled: true },
      { id: 'tender', label: 'Tender Intelligence', desc: 'Bid evaluations & scoring matrix', enabled: true },
      { id: 'project', label: 'Project Supply Nexus', desc: 'Material readiness & BOM paths', enabled: true },
      { id: 'inventory', label: 'Inventory Intelligence', desc: 'Depot stocks & deadstock forecasting', enabled: true },
      { id: 'supplier', label: 'Supplier Network', desc: 'Reliability metrics & scoring trackers', enabled: true },
      { id: 'logistics', label: 'Logistics Command', desc: 'Maritime shipping & port ETA models', enabled: true },
      { id: 'risk', label: 'Risk & Compliance', desc: 'Fraud auditing & conflict triggers', enabled: true },
      { id: 'twin', label: 'SCM Digital Twin', desc: 'Disruption stressors & failure sandbox', enabled: true },
      { id: 'sourcing', label: 'Strategic Sourcing', desc: 'Spend optimizations & savings indices', enabled: true },
      { id: 'executive', label: 'Executive Board', desc: 'Board briefings & KPI summaries', enabled: true },
      { id: 'agents', label: 'Agent Platform', desc: 'Agent SDK Runtime & Orchestration', enabled: true },
      { id: 'acin', label: 'Contract Intelligence', desc: 'Autonomous Obligation Twins & Simulator', enabled: true },
      { id: 'meeting-intelligence', label: 'Meeting Intelligence', desc: 'Conversations, Decisions, Action & Memory', enabled: true },
      { id: 'drone-intelligence', label: 'Drone Intelligence', desc: 'Inspection, defect, asset, and corridor intelligence', enabled: true },
      { id: 'admin', label: 'Administration OS', desc: 'RBAC controls & multi-agent telemetry', enabled: true }
    ],
    permissions: {
      analytics: true,
      tenderIntel: true,
      digitalTwin: true,
      aiAgents: true,
      contracts: true,
      governance: true,
      securityLevel: 'LEVEL 04'
    }
  },
  {
    id: 'kengen',
    name: 'KenGen',
    fullName: 'Kenya Electricity Generating Company',
    logoText: '🔥 KenGen Gen-OS',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    theme: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      panelBg: '#0F172A',
      bodyBg: '#0B0F19'
    },
    modules: [
      { id: 'overview', label: 'Generation Command', desc: 'Geothermal & Hydro live dispatcher', enabled: true },
      { id: 'tender', label: 'Sourcing Suite', desc: 'Machinery & turbine tender portfolios', enabled: true },
      { id: 'supplier', label: 'Vendor Grid', desc: 'SLA auditing of heavy engineers', enabled: true },
      { id: 'risk', label: 'Compliance Audit', desc: 'Environmental governance safeguards', enabled: true },
      { id: 'twin', label: 'Reservoir Digital Twin', desc: 'Thermal stress simulations', enabled: true },
      { id: 'admin', label: 'Control Panel', desc: 'Operator access matrices', enabled: true }
    ],
    permissions: {
      analytics: true,
      tenderIntel: true,
      digitalTwin: true,
      aiAgents: false,
      contracts: true,
      governance: false,
      securityLevel: 'LEVEL 03'
    }
  },
  {
    id: 'kplc',
    name: 'KPLC',
    fullName: 'Kenya Power and Lighting Company',
    logoText: '💡 Kenya Power',
    badgeColor: 'border-yellow-500/30 text-yellow-400 bg-yellow-950/40',
    theme: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      panelBg: '#1C1917',
      bodyBg: '#0C0A09'
    },
    modules: [
      { id: 'overview', label: 'Distribution Hub', desc: 'Last-mile grid distribution', enabled: true },
      { id: 'inventory', label: 'Transformer Vault', desc: 'Subdivision inventory stocks', enabled: true },
      { id: 'supplier', label: 'Contractor Ledger', desc: 'Outsourced engineering teams', enabled: true },
      { id: 'risk', label: 'Grid Loss Prevention', desc: 'Technical & commercial leak auditing', enabled: true },
      { id: 'agents', label: 'Agent Platform', desc: 'Agent SDK Runtime & Orchestration', enabled: true },
      { id: 'admin', label: 'Administration', desc: 'Support dispatch RBAC permissions', enabled: true }
    ],
    permissions: {
      analytics: true,
      tenderIntel: false,
      digitalTwin: false,
      aiAgents: true,
      contracts: true,
      governance: true,
      securityLevel: 'LEVEL 02'
    }
  }
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);
const DEMO_SESSION_STORAGE_KEY = 'atlas_demo_session';
export const isAtlasDemoModeEnabled =
  import.meta.env.VITE_ATLAS_DEMO_MODE === 'true' ||
  import.meta.env.MODE === 'development' ||
  import.meta.env.MODE === 'test';
const demoUserProfile = {
  name: 'Demo_User',
  role: 'Stakeholder Demo',
  accessLevel: 'DEMO',
  clearance: 'Demo only'
};

const hasRestoredDemoSession = (() => {
  if (!isAtlasDemoModeEnabled || typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY) === 'active';
  } catch {
    return false;
  }
})();

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string>('ketraco');
  const [isDemoSession, setIsDemoSession] = useState(hasRestoredDemoSession);
  const [userProfile, setUserProfile] = useState(() => (
    hasRestoredDemoSession ? demoUserProfile : {
      name: 'John Kamau',
      role: 'SCM Intelligence Officer',
      accessLevel: 'LEVEL 04',
      clearance: 'Enterprise Clear'
    }
  ));

  const currentTenant = defaultTenants.find(t => t.id === tenantId) || defaultTenants[0];

  const switchTenant = (id: string) => {
    setTenantId(id);
    if (isDemoSession) return;
    if (id === 'kengen') {
      setUserProfile({
        name: 'Dr. Peter Ndegwa',
        role: 'Chief Procurement Officer',
        accessLevel: 'LEVEL 03',
        clearance: 'Generation Command'
      });
    } else if (id === 'kplc') {
      setUserProfile({
        name: 'Eng. Alice Kariuki',
        role: 'Director Grid Logistics',
        accessLevel: 'LEVEL 02',
        clearance: 'Distribution Admin'
      });
    } else {
      setUserProfile({
        name: 'John Kamau',
        role: 'SCM Intelligence Officer',
        accessLevel: 'LEVEL 04',
        clearance: 'Salience Clear'
      });
    }
  };

  const enterDemoSession = () => {
    if (!isAtlasDemoModeEnabled) return false;
    try {
      window.sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, 'active');
    } catch {
      // The session remains active for this tab even when storage is unavailable.
    }
    setUserProfile(demoUserProfile);
    setIsDemoSession(true);
    return true;
  };

  const exitDemoSession = () => {
    try {
      window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    } catch {
      // Continue clearing in-memory demo authorization.
    }
    setIsDemoSession(false);
    setTenantId('ketraco');
    setUserProfile({
      name: 'John Kamau',
      role: 'SCM Intelligence Officer',
      accessLevel: 'LEVEL 04',
      clearance: 'Enterprise Clear'
    });
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      availableTenants: defaultTenants,
      switchTenant,
      isDemoSession,
      enterDemoSession,
      exitDemoSession,
      userProfile,
      setUserProfile
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used inside a TenantProvider');
  }
  return context;
}
