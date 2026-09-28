import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Bot, Search, Bell, Layers, Cpu, Compass, MessageSquare, 
  SearchCode, Play, Network, FileArchive, GitCommit, BarChart3, 
  Eye, ShieldCheck, Settings, Power, User, HelpCircle, AlertCircle,
  X, CheckCircle, Flame, Sparkles, Sliders, Boxes, Anchor, FileText, Scale, FileCheck,
  Lock, Fingerprint, RefreshCw, Activity, Wallet, GitBranch, Shield, Workflow, CheckCircle2, Calendar
} from 'lucide-react';

import { checkSystemHealth } from './utils/ai';

import type { DemoScene } from './components/platform/ExecutiveDemoMode';

const OverviewController = lazy(() => import('./components/ketraco/OverviewController'));
const MeetingIntelligenceModule = lazy(() => import('./components/ketraco/MeetingIntelligenceModule'));
const DroneIntelligenceModule = lazy(() => import('./components/ketraco/DroneIntelligenceModule'));
const TenderStudio = lazy(() => import('./components/ketraco/TenderStudio'));
const ScmDigitalTwin = lazy(() => import('./components/ketraco/ScmDigitalTwin'));
const ScmCopilot = lazy(() => import('./components/ketraco/ScmCopilot'));
const DecisionApprovalCenter = lazy(() => import('./components/ketraco/DecisionApprovalCenter'));
const ScmContractIntelligence = lazy(() => import('./components/ketraco/ScmContractIntelligence'));
const ProjectSupplyNexus = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.ProjectSupplyNexus })));
const SupplierIntelligence = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.SupplierIntelligence })));
const RiskComplianceCenter = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.RiskComplianceCenter })));
const StrategicSourcing = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.StrategicSourcing })));
const ExecutiveIntelligence = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.ExecutiveIntelligence })));
const AdministrationOS = lazy(() => import('./components/ketraco/ScmModules').then(module => ({ default: module.AdministrationOS })));
const LogisticsView = lazy(() => import('./components/logistics').then(module => ({ default: module.LogisticsView })));
const InventoryHub = lazy(() => import('./components/ketraco/InventoryHub'));
const AiOperationsCenter = lazy(() => import('./components/ketraco/AiOperationsCenter'));
const ProcurementGraphCenter = lazy(() => import('./components/ketraco/ProcurementGraphCenter'));
const ProcurementWatchCenter = lazy(() => import('./components/intelligence/ProcurementWatchCenter'));
const CaseManagementSystem = lazy(() => import('./components/intelligence/CaseManagementSystem'));
const FinanceModule = lazy(() => import('./components/ketraco/finance/FinanceModule'));
const AtlasModuleWorkspace = lazy(() => import('./components/platform/AtlasModuleWorkspace'));
const AIRuntimeDashboard = lazy(() => import('./components/ai-runtime/AIRuntimeDashboard'));
const AtlasAgentOS = lazy(() => import('./components/platform/AtlasAgentOS'));
const ExecutiveDemoMode = lazy(() => import('./components/platform/ExecutiveDemoMode'));

import { TenantProvider, useTenant } from './context/TenantContext';
import { ThemeProvider, useAtlasTheme } from './context/ThemeContext';
import { AtlasContextProvider, useAtlasContext } from './context/AtlasContext';
import { TenantBadge, PermissionBadge } from './components/ui/EnterpriseComponents';

import { ShellProvider } from './components/shell/ShellContext';
import GlobalHeader from './components/shell/GlobalHeader';
import GlobalSidebar from './components/shell/GlobalSidebar';
import MinimalPageHero from './components/shell/MinimalPageHero';
import TransparentFooter from './components/shell/TransparentFooter';
import AtlasInspector from './components/shell/AtlasInspector';
import type { ShellNavItem } from './components/shell/types';

// Static ambient texture for shell depth; it does not represent live data.
function AmbientParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = [
      [0.08, 0.18], [0.21, 0.42], [0.34, 0.22], [0.48, 0.58],
      [0.62, 0.31], [0.77, 0.51], [0.91, 0.23], [0.15, 0.78],
      [0.31, 0.68], [0.45, 0.87], [0.59, 0.73], [0.73, 0.9],
      [0.86, 0.72], [0.96, 0.88],
    ];

    const draw = () => {
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      // Subtle fixed grid — barely visible reference structure
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.018)';
      ctx.lineWidth = 1;
      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const points = nodes.map(([x, y]) => ({ x: x * width, y: y * height }));
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          const maxDistance = 180;
          if (distance < maxDistance) {
            ctx.strokeStyle = `rgba(0, 217, 255, ${0.025 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      points.forEach((point, index) => {
        ctx.fillStyle = index % 4 === 0
          ? 'rgba(139, 92, 246, 0.09)'
          : 'rgba(0, 217, 255, 0.11)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, index % 3 === 0 ? 1.8 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    draw();
    window.addEventListener('resize', draw);

    return () => {
      window.removeEventListener('resize', draw);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 block w-full h-full opacity-60" />;
}

// Read explicit environment overrides only; do not accept client-side bypass flags.
function checkDevAuthBypass(): boolean {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const raw = (import.meta as any).env.DEV_AUTH_BYPASS ?? (import.meta as any).env.VITE_DEV_AUTH_BYPASS;
      if (raw && String(raw).trim().toLowerCase() === 'true') {
        return true;
      }
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      const raw = process.env.DEV_AUTH_BYPASS ?? process.env.VITE_DEV_AUTH_BYPASS;
      if (raw && String(raw).trim().toLowerCase() === 'true') {
        return true;
      }
    }
  } catch {}
  return false;
}

function AppInner() {
  const { currentTenant, availableTenants, switchTenant, userProfile, setUserProfile } = useTenant();
  const { theme } = useAtlasTheme();
  const { setCurrentModule } = useAtlasContext();

  // Check DEV_AUTH_BYPASS environment variable
  const devAuthBypass = checkDevAuthBypass();

  // Zero Trust Access States:
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('atlas_access_token');
  });
  const [allowDevAdmin, setAllowDevAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('kamau@ketraco.co.ke');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTenantId, setLoginTenantId] = useState('ketraco');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check auth configuration on mount & auto-login if devAuthBypass or in development with no token
  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(config => {
        if (!isMounted) return;
        if (config.allowDevAdmin) {
          setAllowDevAdmin(true);
          // Local dev bypass is disabled unless explicitly configured; do not auto-login with a fallback secret.
          const currentToken = localStorage.getItem('atlas_access_token');
          if (devAuthBypass && !currentToken) {
            fetch('/api/auth/config')
              .then(res => res.json())
              .then(config => {
                if (config.devAdminEmail && config.allowDevAdmin) {
                  setAllowDevAdmin(true);
                }
              })
              .catch(() => undefined);
          }

          if (devAuthBypass && !currentToken) {
            fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'dev-admin@salienceatlas.local',
                password: '',
                tenantId: 'ketraco'
              })
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && isMounted) {
                  localStorage.setItem('atlas_access_token', data.accessToken);
                  localStorage.setItem('atlas_refresh_token', data.refreshToken);
                  localStorage.setItem('atlas_user', JSON.stringify(data.user));
                  setUserProfile({
                    name: data.user.name,
                    role: data.user.role,
                    accessLevel: data.user.accessLevel,
                    clearance: data.user.clearance
                  });
                  switchTenant(data.user.tenantId);
                  setIsAuthenticated(true);
                }
              })
              .catch(err => {
                console.warn('[AUTH] Automatic development login deferred:', err.message);
              });
          }
        }
      })
      .catch(err => {
        console.warn('[AUTH] Failed to fetch auth config:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [devAuthBypass]);

  // Global window.fetch interceptor to seamlessly inject JWT tokens
  useEffect(() => {
    const originalFetch = window.fetch;
    
    const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = localStorage.getItem('atlas_access_token');
      const newInit = init ? { ...init } : {};
      
      // Only intercept /api requests to add authorization header
      if (token && typeof input === 'string' && input.startsWith('/api')) {
        let headers: any = {};
        if (newInit.headers) {
          if (newInit.headers instanceof Headers) {
            headers = new Headers(newInit.headers);
            headers.set('Authorization', `Bearer ${token}`);
            newInit.headers = headers;
          } else if (Array.isArray(newInit.headers)) {
            headers = [...newInit.headers];
            if (!headers.some((h: any) => h && h[0] && typeof h[0] === 'string' && h[0].toLowerCase() === 'authorization')) {
              headers.push(['Authorization', `Bearer ${token}`]);
            }
            newInit.headers = headers;
          } else {
            headers = { ...newInit.headers };
            if (!headers['Authorization'] && !headers['authorization']) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            newInit.headers = headers;
          }
        } else {
          headers['Authorization'] = `Bearer ${token}`;
          newInit.headers = headers;
        }
      }
      return originalFetch(input, newInit);
    };

    try {
      // Try to define it via property descriptor which is more robust than direct assignment
      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        configurable: true,
        writable: true
      });
    } catch (e) {
      console.warn('[SECURITY] Could not intercept global fetch. Security headers must be handled manually.', e);
    }

    return () => {
      try {
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          configurable: true,
          writable: true
        });
      } catch (e) {
        // Fallback to direct assignment if defineProperty fails on cleanup
        (window as any).fetch = originalFetch;
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          tenantId: loginTenantId
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('atlas_access_token', data.accessToken);
        localStorage.setItem('atlas_refresh_token', data.refreshToken);
        localStorage.setItem('atlas_user', JSON.stringify(data.user));
        
        // Sync with tenant context user profile
        setUserProfile({
          name: data.user.name,
          role: data.user.role,
          accessLevel: data.user.accessLevel,
          clearance: data.user.clearance
        });
        
        switchTenant(data.user.tenantId);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError('Security Gateway offline. Unable to reach identity service.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('atlas_access_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tenantId: currentTenant.id })
        });
      }
    } catch (err) {
      console.warn('Silent logout warning:', err);
    } finally {
      localStorage.removeItem('atlas_access_token');
      localStorage.removeItem('atlas_refresh_token');
      localStorage.removeItem('atlas_user');
      setIsAuthenticated(false);
    }
  };

  // KETRACO SCM Navigation State
  const [activeModule, setActiveModule] = useState<'overview' | 'meeting-intelligence' | 'drone-intelligence' | 'tender' | 'project' | 'inventory' | 'supplier' | 'logistics' | 'risk' | 'twin' | 'sourcing' | 'executive' | 'admin' | 'agents' | 'decision' | 'ai-ops' | 'acin' | 'ai-runtime' | 'procurement-graph' | 'intelligence' | 'finance' | 'atlas-demo'>(() => {
    if (typeof window === 'undefined') return 'overview';
    const route = window.location.pathname.replace(/\/+$/, '') || '/';
    if (route === '/meeting-intelligence' || route.startsWith('/meeting-intelligence/')) return 'meeting-intelligence';
    if (route === '/drone-intelligence' || route.startsWith('/drone-intelligence/')) return 'drone-intelligence';
    if (route === '/project-supply-nexus' || route.startsWith('/project-supply-nexus') || route === '/project' || route.startsWith('/project/')) return 'project';
    if (route === '/tender' || route.startsWith('/tender')) return 'tender';
    if (route === '/overview') return 'overview';
    if (route === '/atlas-demo') return 'atlas-demo';
    return 'overview';
  });
  const [intelligenceTab, setIntelligenceTab] = useState('Watch Center');
  const [activeWorkspace, setActiveWorkspace] = useState('NEXUS_SCM_MAIN');

  useEffect(() => {
    setCurrentModule(activeModule);
  }, [activeModule, setCurrentModule]);

  // Interactive panels toggles
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [paletteSearch, setPaletteSearch] = useState('');
  
  // Real health telemetry state from backend
  const [systemHealth, setSystemHealth] = useState({
    status: 'authenticating',
    database: 'syncing...',
    gemini_configured: false,
    version: '1.0_KETRACO'
  });

  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [copilotOverridePrompt, setCopilotOverridePrompt] = useState<string | null>(null);

  // Executive Demo Mode state
  const [demoMode, setDemoMode] = useState(false);

  const DEMO_SCENES: DemoScene[] = [
    { id: 's1', title: 'One Enterprise Intelligence Platform', subtitle: 'Salience Atlas sees your enterprise as a living system — data, relationships, assets and agents operating as one cognitive fabric.', icon: Network, module: 'overview' },
    { id: 's2', title: 'Intelligence Anticipates Risk', subtitle: 'Across procurement, supply and logistics, AI monitors live signals and surfaces risk before it disrupts operations.', icon: Eye, module: 'overview', narrative: 'Emerging supplier concentration risk detected. Exposure: $4.2M across a narrow geographic base.' },
    { id: 's3', title: 'Investigation Through the Knowledge Graph', subtitle: 'Click into relationships — how suppliers, contracts, assets and logistics corridors connect to one another.', icon: GitBranch, module: 'procurement-graph', narrative: 'Following the graph reveals affected suppliers, contract dependency and spend exposure.' },
    { id: 's4', title: 'Autonomous Agents Investigate', subtitle: 'Specialist agents act on the shared cognitive fabric — each monitoring a domain and reporting with evidence.', icon: Bot, module: 'agents', narrative: 'Risk Agent investigating 3 anomalies. Logistics Agent optimizing 18 routes.' },
    { id: 's5', title: 'Digital Twins Model the Physical World', subtitle: 'Every critical asset mirrored as a live twin — spatial, relational, operational and temporal views.', icon: Shield, module: 'twin', narrative: 'Transformer TX-042: predicted degradation window identified from anomaly patterns.' },
    { id: 's6', title: 'Recommendations, Not Just Alerts', subtitle: 'AI recommends next steps with confidence, evidence and provenance — enterprise intelligence you can act on.', icon: Workflow, module: 'overview', narrative: 'Recommended: diversify transformer supplier base, mitigate corridor dependency, pre-position spares.' },
    { id: 's7', title: 'From Fragmented Operations to Autonomous Intelligence', subtitle: 'The same cognitive fabric powers every mission. One platform. Understood. Connected. Anticipated.', icon: CheckCircle2, module: 'overview' },
  ];


  const [notifications, setNotifications] = useState([
    { id: '1', type: 'freight', text: "Mombasa Customs hold warning on Substation cable shipment." },
    { id: '2', type: 'compliance', text: "Annual Public Procurement price audit compliance reconciled." }
  ]);

  const fetchTelemetry = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch('/api/scm/telemetry', { signal: controller.signal });
      const data = await res.json();
      clearTimeout(timeoutId);
      if (data.success) {
        setTelemetryLogs(data.logs || []);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // In-app high-fidelity fallback logs in case of offline dev server
      setTelemetryLogs([
        { id: 't1', agentName: 'SCMOrchestrator', timestamp: 'Just now', task: 'Scan Suswa Lot-4 supply readiness', result: 'Allocated 3 core intelligence agents.' },
        { id: 't2', agentName: 'Supplier Intelligence Agent', timestamp: '2 min ago', task: 'Evaluate vendor Shanghai Cable', result: 'SLA rating tagged at 78% reliability buffers.' }
      ]);
    }
  };

  useEffect(() => {
    async function getStats() {
      const stats = await checkSystemHealth();
      setSystemHealth(stats);
    }
    
    // Check for Development Auth Bypass
    async function checkAuthBypass() {
      if (devAuthBypass) {
        setIsAuthenticated(false);
        setUserProfile({
          name: 'John Kamau',
          role: 'SCM Intelligence Officer',
          accessLevel: 'LEVEL 04',
          clearance: 'Enterprise Clear'
        });
        switchTenant('ketraco');
        return;
      }

      try {
        const res = await fetch('/api/auth/config');
        const data = await res.json();
        if (data.bypassActive || data.devAuthBypass) {
          setIsAuthenticated(false);
          setUserProfile({
            name: 'John Kamau',
            role: 'SCM Intelligence Officer',
            accessLevel: 'LEVEL 04',
            clearance: 'Enterprise Clear'
          });
          switchTenant('ketraco');        }
      } catch (err) {
        // Quiet in standard operation
      }
    }

    getStats();
    fetchTelemetry();
    checkAuthBypass();
  }, [devAuthBypass, setUserProfile, switchTenant]);

  // Command palette keyboard shortcut listener (Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setPaletteSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // SCM Search Redirect
  const handleNavSearch = (val: string) => {
    setSearchString(val);
    const lower = val.toLowerCase();
    if (lower.includes('finance') || lower.includes('treasury') || lower.includes('budget') || lower.includes('payment') || lower.includes('commitment') || lower.includes('capex') || lower.includes('opex') || lower.includes('contract finance') || lower.includes('ledger')) setActiveModule('finance');
    else if (lower.includes('meeting') || lower.includes('conversation') || lower.includes('transcript')) setActiveModule('meeting-intelligence');
    else if (lower.includes('drone') || lower.includes('inspection') || lower.includes('asset') || lower.includes('tower') || lower.includes('line') || lower.includes('grid intelligence')) setActiveModule('drone-intelligence');
    else if (lower.includes('graph') || lower.includes('relationship') || lower.includes('node') || lower.includes('edge')) setActiveModule('procurement-graph');
    else if (lower.includes('acin') || lower.includes('contract') || lower.includes('obligation') || lower.includes('negotiation') || lower.includes('assurance')) setActiveModule('acin');
    else if (lower.includes('tender') || lower.includes('bid')) setActiveModule('tender');
    else if (lower.includes('project') || lower.includes('cable')) setActiveModule('project');
    else if (lower.includes('inventory') || lower.includes('stock')) setActiveModule('inventory');
    else if (lower.includes('supplier') || lower.includes('vendor')) setActiveModule('supplier');
    else if (lower.includes('logistics') || lower.includes('mombasa')) setActiveModule('logistics');
    else if (lower.includes('risk') || lower.includes('compliance') || lower.includes('fraud')) setActiveModule('risk');
    else if (lower.includes('twin') || lower.includes('simulation')) setActiveModule('twin');
    else if (lower.includes('sourcing') || lower.includes('savings')) setActiveModule('sourcing');
    else if (lower.includes('executive') || lower.includes('board') || lower.includes('brief')) setActiveModule('executive');
    else if (lower.includes('agent') || lower.includes('sdk')) setActiveModule('agents');
    else if (lower.includes('federation') || lower.includes('cost') || lower.includes('budget') || lower.includes('token') || lower.includes('resilience') || lower.includes('circuit') || lower.includes('gateway')) setActiveModule('ai-ops');
    else if (lower.includes('admin') || lower.includes('telemetry')) setActiveModule('admin');
    else if (lower.includes('audit') || lower.includes('decision') || lower.includes('approval') || lower.includes('ppada') || lower.includes('sign') || lower.includes('ledger') || lower.includes('court') || lower.includes('procurement')) setActiveModule('decision');
    else if (lower.includes('runtime') || lower.includes('earp') || lower.includes('gateway') || lower.includes('prompt') || lower.includes('registry') || lower.includes('inference')) setActiveModule('ai-runtime');
  };

  // Existing module routes, grouped by enterprise domain for progressive disclosure.
  const menuItems = ([
    { 
      id: 'overview', 
      label: currentTenant.id === 'ketraco' ? 'Command Center' : currentTenant.id === 'kengen' ? 'Generation Command' : 'Distribution Hub', 
      icon: Compass, 
      desc: currentTenant.id === 'ketraco' ? 'Central spatial metrics operations' : currentTenant.id === 'kengen' ? 'Geothermal & Hydro live dispatcher' : 'Last-mile grid distribution',
      group: 'COMMAND'
    },
    { 
      id: 'tender', 
      label: currentTenant.id === 'kengen' ? 'Sourcing Suite' : 'Tender Intelligence', 
      icon: FileText, 
      desc: currentTenant.id === 'kengen' ? 'Machinery & turbine tender portfolios' : 'Bid evaluations & scoring matrix',
      group: 'OPERATIONS'
    },
    { 
      id: 'project', 
      label: 'Project Supply Nexus', 
      icon: Network, 
      desc: 'Material readiness & BOM paths',
      group: 'OPERATIONS'
    },
    {
      id: 'atlas-demo',
      label: 'Atlas Module Platform',
      icon: GitCommit,
      desc: 'Reusable graph-aware module demonstration',
      group: 'DATA & PLATFORM'
    },

    { 
      id: 'supplier', 
      label: currentTenant.id === 'kengen' ? 'Vendor Grid' : currentTenant.id === 'kplc' ? 'Contractor Ledger' : 'Supplier Network', 
      icon: User, 
      desc: 'Reliability metrics & scoring trackers',
      group: 'OPERATIONS'
    },
    { 
      id: 'logistics', 
      label: 'Logistics Command', 
      icon: Anchor, 
      desc: 'Maritime shipping & port ETA models',
      group: 'INTELLIGENCE'
    },
    { 
      id: 'risk', 
      label: currentTenant.id === 'kplc' ? 'Grid Loss Prevention' : 'Risk & Compliance', 
      icon: ShieldCheck, 
      desc: 'Fraud auditing & conflict triggers',
      group: 'FINANCE & RISK'
    },
    {
      id: 'decision',
      label: 'Decision & Audit Hub',
      icon: Scale,
      desc: 'PPADA statutory signs & trust ledger',
      group: 'FINANCE & RISK'
    },
    {
      id: 'acin',
      label: 'Contract Intelligence',
      icon: FileCheck,
      desc: 'Autonomous Obligation Twins & Simulator',
      group: 'OPERATIONS'
    },
    {
      id: 'meeting-intelligence',
      label: 'Meeting Intelligence',
      icon: Calendar,
      desc: 'Conversations, Decisions, Action & Memory',
      group: 'INTELLIGENCE'
    },
    {
      id: 'drone-intelligence',
      label: 'Drone Intelligence',
      icon: Eye,
      desc: 'Inspection, defect, asset, and corridor intelligence',
      group: 'INTELLIGENCE'
    },
    {
      id: 'procurement-graph',
      label: 'Graph & Digital Twin',
      icon: Network,
      desc: 'Relationship Knowledge Graph & Digital Twins',
      group: 'INTELLIGENCE'
    },
    {
      id: 'intelligence',
      label: 'Decision Intelligence',
      icon: Activity,
      desc: 'Predictive Command Center & Case Management',
      group: 'INTELLIGENCE'
    },
    { 
      id: 'twin', 
      label: currentTenant.id === 'kengen' ? 'Reservoir Digital Twin' : 'SCM Digital Twin', 
      icon: Cpu, 
      desc: 'Disruption stressors & failure sandbox',
      group: 'INTELLIGENCE'
    },
    { 
      id: 'sourcing', 
      label: 'Strategic Sourcing', 
      icon: BarChart3, 
      desc: 'Spend optimizations & savings indices',
      group: 'OPERATIONS'
    },
    { 
      id: 'executive', 
      label: 'Executive Board', 
      icon: Sliders, 
      desc: 'Board briefings & KPI summaries',
      group: 'INTELLIGENCE'
    },
    { 
      id: 'agents', 
      label: 'Agent OS', 
      icon: Bot, 
      desc: 'Enterprise AI federation & autonomous operations',
      group: 'AI'
    },
    { 
      id: 'ai-ops', 
      label: 'AI Operations Center', 
      icon: Cpu, 
      desc: 'Provider resilience & cost telemetry',
      group: 'AI'
    },
    { 
      id: 'ai-runtime', 
      label: 'AI Runtime Platform', 
      icon: Layers, 
      desc: 'Enterprise AI Governance & Gateway',
      group: 'AI'
    },
    { 
      id: 'admin', 
      label: currentTenant.id === 'kengen' ? 'Control Panel' : 'Administration OS', 
      icon: Settings, 
      desc: 'RBAC controls & multi-agent telemetry',
      group: 'SYSTEM'
    },
    { 
      id: 'finance', 
      label: 'Finance Intelligence', 
      icon: Wallet, 
      desc: 'Budget, commit, payment, CAPEX/OPEX & financial graph',
      group: 'FINANCE & RISK'
    }
  ] satisfies ShellNavItem[]).filter(item => {
    const config = currentTenant.modules.find(m => m.id === item.id);
    return config ? config.enabled : true;
  });

  const handleTriggerCopilot = (promptText: string) => {
    setCopilotOverridePrompt(promptText);
  };

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = window.location.pathname.replace(/\/+$/, '') || '/';
      if (route === '/meeting-intelligence' || route.startsWith('/meeting-intelligence/')) setActiveModule('meeting-intelligence');
      else if (route === '/drone-intelligence' || route.startsWith('/drone-intelligence/')) setActiveModule('drone-intelligence');
      else if (route === '/project-supply-nexus' || route.startsWith('/project-supply-nexus') || route === '/project' || route.startsWith('/project/')) setActiveModule('project');
      else if (route === '/tender' || route.startsWith('/tender')) setActiveModule('tender');
      else if (route === '/overview') setActiveModule('overview');
      else if (route === '/atlas-demo') setActiveModule('atlas-demo');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (activeModule === 'drone-intelligence') {
      const currentPath = window.location.pathname.replace(/\/+$/, '');
      if (!currentPath.startsWith('/drone-intelligence')) {
        window.history.replaceState({}, '', '/drone-intelligence');
      }
      return;
    }

    if (activeModule === 'tender') {
      const currentPath = window.location.pathname.replace(/\/+$/, '');
      if (!currentPath.startsWith('/tender')) {
        window.history.replaceState({}, '', '/tender');
      }
      return;
    }

    const normalizedPath = `/${activeModule}`;
    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState({}, '', normalizedPath);
    }
  }, [activeModule]);

  // Zero Trust Identity Gate
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#05070D] z-50 flex flex-col justify-center items-center overflow-hidden font-sans select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,217,255,0.04),transparent_60%)]"></div>
        
        {/* Static ambient texture; it does not indicate live data. */}
        <div className="absolute inset-x-0 h-44 pointer-events-none opacity-20">
          <AmbientParticleCanvas />
        </div>

        <div className="relative z-10 w-full max-w-md p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-6 space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border border-cyan-500/20 rounded-2xl flex items-center justify-center bg-[#05070D] mx-auto">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-lg font-display font-semibold tracking-tight text-white uppercase mt-4">SALIENCE ATLAS</h1>
              <p className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest">Enterprise Intelligence Access</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-[10px] font-mono rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Platform Environment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ketraco', label: 'KETRACO' },
                    { id: 'kengen', label: 'KenGen' },
                    { id: 'kplc', label: 'KPLC' }
                  ].map(ten => (
                    <button
                      key={ten.id}
                      type="button"
                      onClick={() => setLoginTenantId(ten.id)}
                      className={`py-2 text-center rounded-lg border transition-all cursor-pointer ${
                        loginTenantId === ten.id
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-400'
                          : 'bg-[#05070D] border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {ten.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Identity</label>
                <select
                  value={loginEmail}
                  onChange={e => {
                    const email = e.target.value;
                    setLoginEmail(email);
                    setLoginPassword('');
                  }}
                  className="w-full bg-[#05070D] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer transition-colors"
                >
                  {allowDevAdmin && (
                    <option value="dev-admin@salienceatlas.local">DEV_ADMIN — Platform Administrator (Local Dev)</option>
                  )}
                  <option value="kamau@ketraco.co.ke">John Kamau — SCM Intelligence Officer</option>
                  <option value="board@ketraco.co.ke">Board Director — KETRACO</option>
                  <option value="ndegwa@kengen.co.ke">Dr. Peter Ndegwa — CPO KenGen</option>
                  <option value="kariuki@kplc.co.ke">Eng. Alice Kariuki — Grid Logistics KPLC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Passphrase</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter passphrase"
                  className="w-full bg-[#05070D] border border-slate-800 focus:border-cyan-500/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 placeholder-slate-600 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl text-center uppercase cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" /> Access Intelligence Environment
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-slate-800/60 pt-3 text-center">
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest block">
                Governed under Kenya National Treasury & PPADA 2015
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex flex-col font-sans text-slate-200 overflow-hidden select-none"
      style={{ backgroundColor: theme === 'atlas-dark' ? currentTenant.theme.bodyBg : 'var(--atlas-bg-canvas)' }}
    >
      
      {/* Refined intelligence atmosphere — subtle, purposeful */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-[#00D9FF] opacity-[0.04] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#8B5CF6] opacity-[0.03] blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* Dynamic background canvas */}
      <AmbientParticleCanvas />

      {/* TOP COMMAND NAVIGATION BAR - AI-native enterprise command rail */}
      <GlobalHeader
        searchString={searchString}
        onSearchChange={handleNavSearch}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onSwitchTenant={(id) => {
          switchTenant(id);
          setActiveModule('overview');
          window.history.replaceState({}, '', '/overview');
        }}
        onLogout={handleLogout}
        systemHealth={systemHealth}
        notifications={notifications}
        setNotifications={setNotifications}
        activeModule={activeModule}
      />

      {/* STAGE CONTAINER WITH LEFT COMPACT SIDEBAR AND CENTRAL STAGE */}
      <div className="flex-1 flex overflow-hidden select-none" id="shell-container">
        <GlobalSidebar
          items={menuItems}
          activeModule={activeModule}
          onNavigate={(id) => setActiveModule(id as any)}
          onShutdown={(msg) => {
            setNotifications(prev => [{ id: Date.now().toString(), type: 'shutdown', text: msg }, ...prev]);
            setShowNotifications(true);
          }}
        />

        {/* WORKSPACE CENTRAL MAIN BOARD STAGE */}
        <main className="flex-1 overflow-hidden flex select-none" id="workspace-main-board">
          
          {/* Main Module Render Block inside animated presence container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeModule !== 'project' && activeModule !== 'overview' && <MinimalPageHero activeModule={activeModule} />}
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center bg-[#05070D] text-cyan-300" role="status" aria-live="polite">
                  <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
                  <span className="text-xs font-mono tracking-wider">Loading workspace…</span>
                </div>
              }
            >
            <AnimatePresence mode="wait">
              {activeModule === 'meeting-intelligence' && (
                <motion.div
                  key="meeting-intelligence"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-y-auto"
                >
                  <MeetingIntelligenceModule />
                </motion.div>
              )}

              {activeModule === 'drone-intelligence' && (
                <motion.div
                  key="drone-intelligence"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <DroneIntelligenceModule />
                </motion.div>
              )}

              {activeModule === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <OverviewController 
                    onAskCopilot={handleTriggerCopilot}
                    systemHealth={systemHealth}
                  />
                </motion.div>
              )}

              {activeModule === 'tender' && (
                <motion.div
                  key="tender"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <TenderStudio onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'project' && (
                <motion.div
                  key="project"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ProjectSupplyNexus onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'atlas-demo' && (
                <motion.div
                  key="atlas-demo"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <AtlasModuleWorkspace onAskAtlas={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <InventoryHub onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'supplier' && (
                <motion.div
                  key="supplier"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <SupplierIntelligence onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'logistics' && (
                <motion.div
                  key="logistics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <LogisticsView onNavigate={(view) => setActiveModule(view as any)} />
                </motion.div>
              )}

              {activeModule === 'risk' && (
                <motion.div
                  key="risk"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <RiskComplianceCenter onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'decision' && (
                <motion.div
                  key="decision"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <DecisionApprovalCenter onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'acin' && (
                <motion.div
                  key="acin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ScmContractIntelligence onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'procurement-graph' && (
                <motion.div
                  key="procurement-graph"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ProcurementGraphCenter />
                </motion.div>
              )}

              {activeModule === 'intelligence' && (
                <motion.div
                  key="intelligence"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                   <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="bg-[#0b101d] border-b border-slate-800/80 px-6 sm:px-8 py-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                         {[
                            { id: 'Watch Center', label: 'Watch Center', desc: 'Real-time monitoring' },
                            { id: 'Case Management', label: 'Case Management', desc: 'Investigations & audits' }
                         ].map(tab => (
                            <button 
                               key={tab.id}
                               onClick={() => setIntelligenceTab(tab.id)}
                               className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                                  intelligenceTab === tab.id 
                                     ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,217,255,0.12)]' 
                                     : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                               }`}
                            >
                               {tab.label}
                            </button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         {intelligenceTab === 'Watch Center' && <ProcurementWatchCenter />}
                         {intelligenceTab === 'Case Management' && <CaseManagementSystem />}
                      </div>
                   </div>
                </motion.div>
              )}

              {activeModule === 'twin' && (
                <motion.div
                  key="twin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ScmDigitalTwin onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'sourcing' && (
                <motion.div
                  key="sourcing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <StrategicSourcing onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'executive' && (
                <motion.div
                  key="executive"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ExecutiveIntelligence onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'agents' && (
                <motion.div
                  key="agents"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <AtlasAgentOS />
                </motion.div>
              )}

              {activeModule === 'ai-ops' && (
                <motion.div
                  key="ai-ops"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <AiOperationsCenter />
                </motion.div>
              )}

              {activeModule === 'ai-runtime' && (
                <motion.div
                  key="ai-runtime"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <AIRuntimeDashboard />
                </motion.div>
              )}

              {activeModule === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <AdministrationOS telemetryLogs={telemetryLogs} onAskCopilot={handleTriggerCopilot} />
                </motion.div>
              )}

              {activeModule === 'finance' && (
                <motion.div
                  key="finance"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <FinanceModule />
                </motion.div>
              )}

            </AnimatePresence>
            </Suspense>
          </div>

          {/* SCM AUTONOMOUS COPILOT SIDE DRAWER - Omnipresent companion */}
          <Suspense fallback={null}>
            <ScmCopilot 
              onRefreshTelemetry={fetchTelemetry}
              overridePrompt={copilotOverridePrompt}
              clearOverridePrompt={() => setCopilotOverridePrompt(null)}
            />
          </Suspense>

        </main>
      </div>

      <TransparentFooter systemHealth={systemHealth} />

      <AtlasInspector onOpenRelationships={() => {
        setActiveModule('procurement-graph');
        window.history.replaceState({}, '', '/procurement-graph');
      }} />

      {/* Executive Demo Mode floating trigger */}
      {!demoMode && (
        <button
          onClick={() => setDemoMode(true)}
          className="fixed bottom-14 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B1220]/90 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono font-bold tracking-wider uppercase hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all cursor-pointer shadow-xl"
          title="Launch executive presentation mode"
          aria-label="Launch executive demo mode"
        >
          <Play className="w-3 h-3" /> Demo Mode
        </button>
      )}

      {/* Executive Demo Mode overlay */}
      <AnimatePresence>
        {demoMode && (
          <Suspense fallback={null}>
            <ExecutiveDemoMode
              scenes={DEMO_SCENES}
              activeModule={activeModule}
              onNavigate={(id) => setActiveModule(id as any)}
              onExit={() => setDemoMode(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* DETAILED COMMAND PALETTE SHORTCUT MODAL triggered by Ctrl+K */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 bg-[#05070D]/70 backdrop-blur-md flex items-center justify-center p-4 z-50" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setShowCommandPalette(false); setPaletteSearch(''); } }}>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-xl bg-[#0B1220] border border-cyan-500/10 rounded-2xl overflow-hidden p-5 space-y-4 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="atlas-command-title"
            >
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                <span id="atlas-command-title" className="text-xs font-mono font-bold text-cyan-400/80 flex items-center gap-1.5 uppercase">
                  <Terminal className="w-3.5 h-3.5" /> Intelligence Command
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-600 bg-[#05070D] px-1.5 py-0.5 rounded border border-slate-800">
                    ESC to close
                  </span>
                  <button 
                    onClick={() => { setShowCommandPalette(false); setPaletteSearch(''); }}
                    className="p-1 text-slate-500 hover:text-white rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Input Field */}
              <div className="relative">
                <input 
                  type="text" 
                  autoFocus
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="atlas-command-results"
                  placeholder="Type a module name to navigate, or query SCM Atlas AI directly..."
                  value={paletteSearch}
                  onChange={(e) => setPaletteSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (paletteSearch.trim()) {
                        const matched = menuItems.find(m => m.label.toLowerCase() === paletteSearch.toLowerCase().trim());
                        if (matched) {
                           setActiveModule(matched.id as any);
                           setShowCommandPalette(false);
                           setPaletteSearch('');
                        } else {
                           handleTriggerCopilot(paletteSearch);
                           setShowCommandPalette(false);
                           setPaletteSearch('');
                        }
                      }
                    }
                  }}
                  className="w-full bg-[#05070D] border border-slate-800 focus:border-cyan-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all font-sans"
                />
              </div>

              {/* Filtering logic: AI prompt execute suggestion */}
              {paletteSearch.trim() && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      handleTriggerCopilot(paletteSearch);
                      setShowCommandPalette(false);
                      setPaletteSearch('');
                    }}
                    className="w-full flex items-center justify-between p-3 bg-cyan-950/20 hover:bg-cyan-900/35 border border-cyan-500/20 text-slate-200 rounded-xl text-left cursor-pointer text-xs transition-all"
                  >
                    <div className="flex items-center gap-2 text-cyan-300 font-medium">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Execute Brain Query: "{paletteSearch}"</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded font-black border border-cyan-500/20">
                      ⏎ ENTER TO RUN
                    </span>
                  </button>
                </div>
              )}

              {/* Route module selection with filtering */}
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1 block">
                  {paletteSearch ? 'Filtered Modules' : 'Available SCM Operations'}
                </span>
                <div id="atlas-command-results" role="listbox" aria-label="Command results" className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                  {menuItems
                    .filter(m => 
                      !paletteSearch || 
                      m.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
                      m.desc.toLowerCase().includes(paletteSearch.toLowerCase())
                    )
                    .map(m => {
                      const MIcon = m.icon;
                      return (
                        <button
                          key={m.id}
                          role="option"
                          onClick={() => {
                            setActiveModule(m.id as any);
                            setShowCommandPalette(false);
                            setPaletteSearch('');
                          }}
                          className="flex items-center gap-3 p-3 bg-slate-950 hover:bg-slate-900/80 border border-slate-900 hover:border-cyan-500/15 text-left rounded-xl transition-all cursor-pointer block"
                        >
                          <MIcon className="w-4 h-4 text-[#00D9FF]" />
                          <div>
                            <span className="text-xs font-semibold text-white block truncate">{m.label}</span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5 truncate">{m.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  {menuItems.filter(m => !paletteSearch || m.label.toLowerCase().includes(paletteSearch.toLowerCase()) || m.desc.toLowerCase().includes(paletteSearch.toLowerCase())).length === 0 && (
                    <div className="col-span-full rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-center text-[11px] text-slate-400">
                      No matching module. Press Enter to send this request to the Intelligence Command.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AtlasContextProvider>
          <ShellProvider>
            <AppInner />
          </ShellProvider>
        </AtlasContextProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}
