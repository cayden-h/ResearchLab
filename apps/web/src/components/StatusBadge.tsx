import type { ReactNode } from 'react';

interface StatusBadgeProps {
  tone: 'high' | 'medium' | 'low' | 'complete';
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  const tones = {
    high: 'bg-red-50 text-danger',
    medium: 'bg-amber-50 text-warn',
    low: 'bg-emerald-50 text-success',
    complete: 'bg-sky-100 text-secondary',
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
}
