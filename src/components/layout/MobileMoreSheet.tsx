import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from '../ui/IconButton';

export interface MobileMoreItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
  items: MobileMoreItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  title?: string;
}

export function MobileMoreSheet({
  open,
  onClose,
  items,
  activeId,
  onSelect,
  title = 'Mais opções',
}: MobileMoreSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] lg:hidden" role="presentation">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-[oklch(0_0_0/0.45)]"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-[var(--radius-panel)] border border-[var(--border)]',
          'bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)]',
          'pb-[calc(1rem+env(safe-area-inset-bottom))]'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        <ul className="p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={cn(
                    'flex w-full min-h-[var(--space-touch)] items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium',
                    active
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}