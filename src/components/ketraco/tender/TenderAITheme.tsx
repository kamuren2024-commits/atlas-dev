import React, { createContext, useContext, ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, LucideIcon } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';

// 1. Framer Motion Presets (Micro-interactions & transitions matching parent)
export const TenderAIMotion = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.25 } }
  },
  buttonHover: {
    scale: 1.015,
    y: -0.5,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  },
  buttonTap: { scale: 0.985 },
  cardHover: {
    y: -2,
    transition: { duration: 0.25, ease: "easeOut" }
  }
};

// 2. Theme Context to preserve Tender Intelligence state while sharing global context
interface ThemeContextType {
  highClearanceMode: boolean;
  setHighClearanceMode: (active: boolean) => void;
  activeCopilotPrompt: string;
  setActiveCopilotPrompt: (prompt: string) => void;
}

const TenderAIThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function TenderIntelligenceProvider({ children }: { children: ReactNode }) {
  const [highClearanceMode, setHighClearanceMode] = useState(true);
  const [activeCopilotPrompt, setActiveCopilotPrompt] = useState('');

  return (
    <TenderAIThemeContext.Provider value={{
      highClearanceMode,
      setHighClearanceMode,
      activeCopilotPrompt,
      setActiveCopilotPrompt
    }}>
      {children}
    </TenderAIThemeContext.Provider>
  );
}

export function useTenderTheme() {
  const context = useContext(TenderAIThemeContext);
  if (!context) {
    throw new Error('useTenderTheme must be used within a TenderIntelligenceProvider');
  }
  return context;
}

// 3. Adaptive Layout Wrapper (Merges seamlessly into the parent workspace)
export function TenderIntelligenceLayout({ children }: { children: ReactNode }) {
  const { currentTenant } = useTenant();
  return (
    <div 
      className="flex-1 flex flex-col select-none font-sans" 
      id="tender-intelligence-root"
      style={{ 
        backgroundColor: currentTenant.theme.bodyBg,
        ['--primary-brand' as any]: currentTenant.theme.primary,
        ['--primary-glow' as any]: `${currentTenant.theme.primary}20`
      }}
    >
      {children}
    </div>
  );
}

// 4. Scoped Adaptive Components (Inherit parent styles directly)
interface TenderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  level?: 1 | 2 | 3;
  glowing?: boolean;
  hoverable?: boolean;
  className?: string;
}

export function TenderCard({ children, level = 2, glowing = false, hoverable = true, className = '', ...props }: TenderCardProps) {
  const { currentTenant } = useTenant();
  
  const shadowClass = 
    level === 1 ? 'shadow-sm' :
    level === 3 ? 'shadow-2xl' :
    'shadow-lg';

  const glowStyle = glowing 
    ? { borderColor: `${currentTenant.theme.primary}30`, boxShadow: `0 0 20px ${currentTenant.theme.primary}10` }
    : { borderColor: 'rgba(255, 255, 255, 0.05)' };

  return (
    <div 
      className={`bg-[#101827]/75 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 ${shadowClass} ${hoverable ? 'hover:border-slate-700/50 hover:shadow-xl' : ''} ${className}`}
      style={glowStyle}
      {...props}
    >
      {children}
    </div>
  );
}

interface TenderAIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
}

export function TenderAIButton({ children, variant = 'primary', size = 'sm', icon: Icon, className = '', ...props }: TenderAIButtonProps) {
  const { currentTenant } = useTenant();
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl cursor-pointer active:scale-95';
  
  const isPrimary = variant === 'primary';
  const customStyle = isPrimary 
    ? { 
        backgroundColor: currentTenant.theme.primary, 
        boxShadow: `0 4px 12px ${currentTenant.theme.primary}20`,
        color: '#000000' // High-contrast crisp black on vibrant primary
      } 
    : undefined;

  const variantStyles = {
    primary: 'hover:opacity-90 font-bold',
    secondary: 'bg-[#151B23] hover:bg-[#151B23]/80 text-white/90 border border-white/5 hover:border-white/10',
    outline: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[10px]',
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={customStyle}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}

interface TenderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function TenderDialog({ isOpen, onClose, title, children }: TenderDialogProps) {
  const { currentTenant } = useTenant();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#101827]/95 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: currentTenant.theme.primary }} /> {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-white/45 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all text-xs"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

interface TenderTableProps {
  headers: string[];
  children: ReactNode;
}

export function TenderTable({ headers, children }: TenderTableProps) {
  return (
    <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#101827]/40">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-[#151B23]/30">
            {headers.map((h, i) => (
              <th key={i} className="p-3 text-[9.5px] font-mono uppercase tracking-wider text-white/45 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface TenderBadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function TenderBadge({ children, variant = 'neutral' }: TenderBadgeProps) {
  const { currentTenant } = useTenant();
  
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-[var(--primary-brand)]/10 border-[var(--primary-brand)]/20',
    neutral: 'bg-[#151B23] text-white/45 border-white/5'
  };

  const isInfo = variant === 'info';
  const customStyle = isInfo 
    ? { 
        color: currentTenant.theme.primary,
        borderColor: `${currentTenant.theme.primary}30`,
        backgroundColor: `${currentTenant.theme.primary}12`
      }
    : undefined;

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border font-semibold ${styles[variant]}`}
      style={customStyle}
    >
      {children}
    </span>
  );
}
