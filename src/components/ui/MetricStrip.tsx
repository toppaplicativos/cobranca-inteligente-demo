import React from 'react';
import { cn } from '../../lib/cn';

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  detail?: string;
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'accent';
}

interface MetricStripProps {
  items: MetricItem[];
  className?: string;
}

const valueTone: Record<NonNullable<MetricItem['tone']>, string> = {
  default: 'text-[var(--text-primary)]',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
  destructive: 'text-[var(--destructive)]',
  accent: 'text-[var(--accent)]',
};

export function MetricStrip({ items, className }: MetricStripProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px overflow-hidden rounded-[var(--radius-panel)]',
        'border border-[var(--border)] bg-[var(--border)] shadow-[var(--shadow-panel)]',
        className
      )}
      role="list"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="listitem"
          className="bg-[var(--bg-surface)] px-3 py-3 min-h-[80px] flex flex-col justify-between sm:px-4 sm:py-3.5 sm:min-h-[88px]"
        >
          <span className="text-[10px] sm:text-[11px] font-medium text-[var(--text-muted)] leading-tight">{item.label}</span>
          <div className="min-w-0">
            <span className={cn('block truncate text-base sm:text-lg font-semibold tracking-tight font-mono tabular-nums', valueTone[item.tone ?? 'default'])}>
              {item.value}
            </span>
            {item.detail && (
              <span className="block mt-0.5 truncate text-[10px] sm:text-[11px] text-[var(--text-secondary)]">{item.detail}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}