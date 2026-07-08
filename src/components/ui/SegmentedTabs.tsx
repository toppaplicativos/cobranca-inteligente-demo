import React from 'react';
import { cn } from '../../lib/cn';

export interface SegmentedTabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface SegmentedTabsProps {
  items: SegmentedTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  scrollable?: boolean;
}

export function SegmentedTabs({
  items,
  activeId,
  onChange,
  className,
  scrollable = true,
}: SegmentedTabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-muted)] p-1 min-w-0',
        scrollable && 'overflow-x-auto overscroll-x-contain scrollbar-none',
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex min-h-9 md:min-h-9 shrink-0 items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-2.5 sm:px-3 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
              active
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}