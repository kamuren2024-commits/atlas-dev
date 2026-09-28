import React, { createContext, useContext, useMemo } from 'react';
import { useFinanceData, type FinanceDataState } from './useFinanceData';

const FinanceDataContext = createContext<FinanceDataState | null>(null);

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const data = useFinanceData();
  const value = useMemo(() => data, [data]);
  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceDataContext(): FinanceDataState {
  const ctx = useContext(FinanceDataContext);
  if (!ctx) throw new Error('useFinanceDataContext must be used within FinanceDataProvider');
  return ctx;
}
