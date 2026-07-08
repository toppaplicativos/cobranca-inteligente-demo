import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export type FeedbackTone = 'success' | 'warning' | 'info';

interface FeedbackToastProps {
  open: boolean;
  message: string;
  tone?: FeedbackTone;
  onClose: () => void;
  duration?: number;
}

const toneConfig: Record<FeedbackTone, { icon: React.ElementType; className: string }> = {
  success: { icon: Check, className: 'bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/20' },
  warning: { icon: AlertTriangle, className: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/20' },
  info: { icon: Info, className: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/20' },
};

export function FeedbackToast({ open, message, tone = 'success', onClose, duration = 4500 }: FeedbackToastProps) {
  const Icon = toneConfig[tone].icon;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto fixed bottom-6 left-1/2 z-[calc(var(--z-overlay)+2)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <div
            className={cn(
              'flex items-start gap-3 rounded-[var(--radius-panel)] border px-4 py-3 shadow-[var(--shadow-elevated)] backdrop-blur-sm',
              toneConfig[tone].className
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
              aria-label="Fechar aviso"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}