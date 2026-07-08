import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from './IconButton';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Dialog({ open, onClose, title, description, children, className, size = 'md' }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        'fixed inset-0 m-auto w-[calc(100%-2rem)] rounded-[var(--radius-panel)] border border-[var(--border)]',
        'bg-[var(--bg-surface)] text-[var(--text-primary)] p-0 shadow-[var(--shadow-elevated)]',
        'backdrop:bg-[oklch(0.12_0.02_250/0.55)]',
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
          )}
        </div>
        <IconButton label="Fechar" onClick={onClose}>
          <X className="size-4" />
        </IconButton>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}