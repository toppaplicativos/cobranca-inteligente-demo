import React from 'react';
import { cn } from '../../lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'destructive';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
  accent: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
  success: 'bg-[var(--success-subtle)] text-[var(--success)]',
  warning: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
  destructive: 'bg-[var(--destructive-subtle)] text-[var(--destructive)]',
};

export function Badge({ className, tone = 'neutral', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-medium leading-none',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}