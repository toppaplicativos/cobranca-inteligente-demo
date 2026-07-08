import React from 'react';
import { Bell, X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

interface NotificationBarProps {
  message: string;
  onDismiss: () => void;
}

export function NotificationBar({ message, onDismiss }: NotificationBarProps) {
  return (
    <div
      role="status"
      className="border-b border-[var(--border)] bg-[var(--accent-subtle)] px-4 py-2.5"
    >
      <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-2 px-3 py-2.5 text-xs text-[var(--text-primary)] sm:items-center sm:gap-3 sm:px-4">
        <span className="flex min-w-0 items-start gap-2 sm:items-center">
          <Bell className="mt-0.5 size-4 shrink-0 text-[var(--accent)] sm:mt-0" aria-hidden />
          <span className="min-w-0 break-words">{message}</span>
        </span>
        <IconButton label="Dispensar notificação" onClick={onDismiss}>
          <X className="size-3.5" />
        </IconButton>
      </div>
    </div>
  );
}