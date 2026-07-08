import React from 'react';
import { cn } from '../../lib/cn';

interface TableScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function TableScroll({ children, className }: TableScrollProps) {
  return (
    <div
      className={cn(
        '-mx-3 w-[calc(100%+1.5rem)] overflow-x-auto px-3 md:mx-0 md:w-full md:px-0',
        'rounded-[var(--radius-control)] border border-[var(--border)]',
        className
      )}
    >
      {children}
    </div>
  );
}