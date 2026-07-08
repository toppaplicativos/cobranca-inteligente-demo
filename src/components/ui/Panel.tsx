import React from 'react';
import { cn } from '../../lib/cn';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  inset?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
};

export function Panel({ className, inset, elevated, padding = 'md', children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-panel)]',
        elevated ? 'surface-elevated' : inset ? 'surface-inset' : 'surface-card',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}