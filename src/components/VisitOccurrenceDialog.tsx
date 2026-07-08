import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, MapPin, X } from 'lucide-react';
import { Parcela, Cliente } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FormField } from './ui/FormField';
import { Select } from './ui/Select';
import { overlayClass, modalClass } from '../lib/formStyles';

type OccurrenceType =
  | 'CLIENTE_AUSENTE'
  | 'RECUSOU_PAGAMENTO'
  | 'ENDERECO_NAO_ENCONTRADO'
  | 'PROMESSA_PAGAMENTO'
  | 'CLIENTE_INDISPONIVEL'
  | 'OUTRO';

const OCCURRENCE_LABELS: Record<OccurrenceType, string> = {
  CLIENTE_AUSENTE: 'Cliente ausente',
  RECUSOU_PAGAMENTO: 'Recusou pagamento',
  ENDERECO_NAO_ENCONTRADO: 'Endereço não encontrado',
  PROMESSA_PAGAMENTO: 'Promessa de pagamento',
  CLIENTE_INDISPONIVEL: 'Cliente indisponível / não atendeu',
  OUTRO: 'Outro motivo',
};

interface VisitOccurrenceDialogProps {
  open: boolean;
  parcela: Parcela | null;
  cliente?: Cliente;
  onClose: () => void;
  onSubmit: (observacao: string) => void;
}

export function VisitOccurrenceDialog({
  open,
  parcela,
  cliente,
  onClose,
  onSubmit,
}: VisitOccurrenceDialogProps) {
  const [tipo, setTipo] = useState<OccurrenceType>('CLIENTE_AUSENTE');
  const [detalhes, setDetalhes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTipo('CLIENTE_AUSENTE');
      setDetalhes('');
      setError('');
    }
  }, [open, parcela?.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipo === 'OUTRO' && !detalhes.trim()) {
      setError('Descreva o motivo da ocorrência.');
      return;
    }
    const label = OCCURRENCE_LABELS[tipo];
    const obs = detalhes.trim()
      ? `[Visita Infrutífera] ${label} — ${detalhes.trim()}`
      : `[Visita Infrutífera] ${label}`;
    onSubmit(obs);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && parcela && (
        <div
          key={parcela.id}
          className={overlayClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="occurrence-dialog-title"
        >
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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`${modalClass} relative z-10 sm:max-w-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--warning-subtle)] text-[var(--warning)]">
                  <AlertTriangle className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 id="occurrence-dialog-title" className="text-base font-semibold text-[var(--text-primary)]">
                    Registrar ocorrência
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Visita sem recebimento — o pedido permanece pendente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-[var(--radius-control)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{parcela.clienteNome}</span>
                <Badge tone="warning">{parcela.status}</Badge>
              </div>
              {cliente && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  {cliente.rua}, {cliente.numero} — {cliente.bairro}
                </p>
              )}
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Parcela {parcela.numeroParcela}/{parcela.totalParcelas} · R$ {parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Tipo de ocorrência" required>
                <Select
                  value={tipo}
                  onChange={(e) => {
                    setTipo(e.target.value as OccurrenceType);
                    setError('');
                  }}
                >
                  {Object.entries(OCCURRENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Observações"
                required={tipo === 'OUTRO'}
                hint={tipo === 'OUTRO' ? 'Obrigatório para "Outro motivo"' : 'Detalhes adicionais para o histórico de cobrança'}
              >
                <textarea
                  value={detalhes}
                  onChange={(e) => {
                    setDetalhes(e.target.value);
                    setError('');
                  }}
                  rows={3}
                  placeholder="Ex: Cliente viajando, retorna na próxima semana. Vizinho informou ausência."
                  className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
                />
              </FormField>

              {error && (
                <p className="rounded-[var(--radius-control)] bg-[var(--destructive-subtle)] px-3 py-2 text-xs text-[var(--destructive)]">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" fullWidth onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  <AlertTriangle className="size-4" />
                  Registrar ocorrência
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}