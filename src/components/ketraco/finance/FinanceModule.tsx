import React from 'react';
import { FinanceDataProvider } from './components/FinanceDataContext';
import FinanceShell from './FinanceShell';

export default function FinanceModule() {
  return (
    <FinanceDataProvider>
      <FinanceShell />
    </FinanceDataProvider>
  );
}
