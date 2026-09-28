import React from 'react';
import { motion } from 'motion/react';
import { financeTokens } from '../tokens';

interface FinancePageHeaderProps {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}

export default function FinancePageHeader({ title, subtitle, right }: FinancePageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-20 shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.05] bg-[rgba(5,7,13,0.85)] backdrop-blur-md flex items-end justify-between gap-4"
    >
      <div className="min-w-0">
        <div
          className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.2em] font-bold"
          style={{ color: financeTokens.colors.primary }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: financeTokens.colors.primary, boxShadow: `0 0 8px ${financeTokens.colors.primaryGlow}` }} />
          KETRACO Enterprise Financial Operations
        </div>
        <h2 className="text-lg md:text-xl font-display font-semibold tracking-tight text-[#F8FAFC] mt-1">{title}</h2>
        <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </motion.header>
  );
}
