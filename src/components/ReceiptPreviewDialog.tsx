import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCheck, Share2, X, Printer } from 'lucide-react';
import { Parcela } from '../types';
import { Button } from './ui/Button';
import { overlayClass, modalClass } from '../lib/formStyles';

interface ReceiptPreviewDialogProps {
  open: boolean;
  parcela: Parcela | null;
  onClose: () => void;
  onShare?: () => void;
}

export function ReceiptPreviewDialog({ open, parcela, onClose, onShare }: ReceiptPreviewDialogProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && parcela && (
        <div className={overlayClass} role="dialog" aria-modal="true">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            aria-label="Fechar"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`${modalClass} relative z-10 sm:max-w-sm`}
          >
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]" aria-label="Fechar">
                <X className="size-4" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
              className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--success-subtle)]"
            >
              <FileCheck className="size-7 text-[var(--success)]" />
            </motion.div>

            <div className="text-center">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Comprovante de recebimento</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Registro validado e arquivado</p>
            </div>

            <div className="space-y-2 rounded-[var(--radius-panel)] border border-dashed border-[var(--border)] bg-[var(--bg-muted)] p-4 font-mono text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Cliente</span>
                <span className="font-semibold text-[var(--text-primary)]">{parcela.clienteNome}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Data</span>
                <span>{new Date(parcela.dataPagamento || '').toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Parcela</span>
                <span>{parcela.numeroParcela}/{parcela.totalParcelas} · {parcela.vendaId}</span>
              </div>
              <div className="flex justify-between gap-2 border-t border-[var(--border)] pt-2">
                <span className="text-[var(--text-muted)]">Valor</span>
                <span className="font-bold text-[var(--success)]">
                  R$ {parcela.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--text-muted)]">Pagamento</span>
                <span>{parcela.formaPagamento}</span>
              </div>
            </div>

            {parcela.comprovanteUrl && parcela.comprovanteUrl.startsWith('data:') && (
              <img src={parcela.comprovanteUrl} alt="Comprovante anexado" className="mx-auto h-20 rounded-[var(--radius-control)] object-contain" />
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {onShare && (
                <Button type="button" fullWidth onClick={onShare}>
                  <Share2 className="size-4" /> Enviar por WhatsApp
                </Button>
              )}
              <Button type="button" variant="outline" fullWidth onClick={onClose}>
                <Printer className="size-4" /> Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}