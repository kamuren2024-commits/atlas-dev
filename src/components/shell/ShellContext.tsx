import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ShellBreakpoint = 'mobile' | 'tablet' | 'desktop';
export type ShellDensity = 'compact' | 'comfortable' | 'focus';

interface ShellContextValue {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  breakpoint: ShellBreakpoint;
  density: ShellDensity;
  cycleDensity: () => void;
}

const ShellContext = createContext<ShellContextValue | undefined>(undefined);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [density, setDensity] = useState<ShellDensity>('comfortable');
  const [breakpoint, setBreakpoint] = useState<ShellBreakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.innerWidth < 768) return 'mobile';
    if (window.innerWidth < 1280) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth < 768) {
        setBreakpoint('mobile');
      } else if (window.innerWidth < 1280) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const cycleDensity = () => {
    setDensity(current => {
      if (current === 'compact') return 'comfortable';
      if (current === 'comfortable') return 'focus';
      return 'compact';
    });
  };

  const value = useMemo<ShellContextValue>(
    () => ({ mobileOpen, setMobileOpen, breakpoint, density, cycleDensity }),
    [mobileOpen, breakpoint, density]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}
