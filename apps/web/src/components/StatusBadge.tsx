import type { ReactNode } from 'react';

interface StatusBadgeProps {
  tone: 'high' | 'medium' | 'low' | 'complete';
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const tones = {
    high: 'bg-[rgba(185,28,28,0.1)] text-danger',
    medium: 'bg-[rgba(161,98,7,0.12)] text-warn',
    low: 'bg-[rgba(15,118,110,0.1)] text-success',
    complete: 'bg-[rgba(135,214,254,0.28)] text-secondary',
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
}
