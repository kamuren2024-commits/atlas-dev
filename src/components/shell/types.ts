import type { LucideIcon } from 'lucide-react';

export type ShellNavGroupId =
  | 'COMMAND'
  | 'INTELLIGENCE'
  | 'OPERATIONS'
  | 'FINANCE & RISK'
  | 'AI'
  | 'DATA & PLATFORM'
  | 'SYSTEM';

export interface ShellNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  group: ShellNavGroupId;
}

export interface ShellNavGroup {
  id: ShellNavGroupId;
  label: string;
}
