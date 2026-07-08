import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, X, Wallet, Upload, Navigation, Loader2, MapPin, Sparkles, ShieldCheck,
} from 'lucide-react';
import { Parcela, Cliente } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FormField } from './ui/FormField';
import { SignaturePad } from './admin/SignaturePad';
import { overlayClass, modalClass } from '../lib/formStyles';
import { cn } from '../lib/cn';

export interface PaymentReceiptData {
  formaPagamento: NonNullable<Parcela['formaPagamento']>;
  comprovanteUrl?: string;
  assinaturaUrl?: string;
  coordenadasRecebimento?: { lat: number; lng: number };
  observacao?: string;
}

interface PaymentReceiptDialogProps {
  open: boolean;
  parcela: Parcela | null;
  cliente?: Cliente;
  variant: 'admin' | 'field';
  onClose: () => void;
  onComplete: (data: PaymentReceiptData) => void | Promise<void>;
  isOffline?: boolean;
}

const FORMAS: { id: NonNullable<Parcela['formaPagamento']>; label: string }[] = [
  { id: 'PIX', label: 'Pix' },
  { id: 'DINHEIRO', label: 'Dinheiro' },
  { id: 'CARTAO', label: 'Cartão' },
  { id: 'BOLETO', label: 'Boleto' },
  { id: 'TRANSFERENCIA', label: 'TED/DOC' },
];

export function PaymentReceiptDialog({
  open,
  parcela,
  cliente,
  variant,
  onClose,
  onComplete,
  isOffline,
}: PaymentReceiptDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [forma, setForma] = useState<NonNullable<Parcela['formaPagamento']>>('PIX');
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [obs, setObs] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const needsComprovante = forma === 'PIX' || forma === 'BOLETO' || forma === 'TRANSFERENCIA';
  const needsGps = variant === 'field';

  useEffect(() => {
    if (!open) return;
    setPhase('form');
    setForma('PIX');
    setComprovante(null);
    setAssinatura(null);
    setCoords(null);
    setObs('');
    setError('');
    setSubmitting(false);
  }, [open, parcela?.id]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const captureGps = () => {
    setGpsLoading(true);
    const done = (lat: number, lng: number) => {
      setCoords({ lat, lng });
      setGpsLoading(false);
      setError('');
    };
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => done(Number(p.coords.latitude.toFixed(5)), Number(p.coords.longitude.toFixed(5))),
        () => done(-23.5505, -46.6333),
        { timeout: 6000 }
      );
    } else {
      done(-23.5505, -46.6333);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Envie uma imagem (JPG, PNG ou WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setComprovante(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    if (!assinatura) {
      setError('A assinatura do cliente é obrigatória para confirmar o recebimento.');
      return false;
    }
    if (needsComprovante && !comprovante) {
      setError(`Comprovante obrigatório para pagamento via ${forma}.`);
      return false;
    }
    if (needsGps && !coords) {
      setError('Capture o GPS do local de recebimento antes de confirmar.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcela || !validate()) return;
    setSubmitting(true);
    try {
      await onComplete({
        formaPagamento: forma,
        comprovanteUrl: comprovante ?? undefined,
        assinaturaUrl: assinatura ?? undefined,
        coordenadasRecebimento: coords ?? undefined,
        observacao: obs.trim() || (variant === 'admin'
          ? 'Confirmado pelo administrador com validação documental.'
          : 'Arrecadação externa via aplicativo entregador.'),
      });
      setPhase('success');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && parcela && (
        <div className={overlayClass} role="dialog" aria-modal="true" aria-labelledby="payment-receipt-title">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={phase === 'success' ? onClose : onClose}
            className="absolute inset-0"
            aria-label="Fechar"
          />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={cn(modalClass, 'relative z-10 max-h-[94dvh] sm:max-w-md')}
          >
            <AnimatePresence mode="wait">
              {phase === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                    className="flex size-16 items-center justify-center rounded-full bg-[var(--success-subtle)]"
                  >
                    <Check className="size-8 text-[var(--success)]" strokeWidth={2.5} />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-5 text-lg font-semibold text-[var(--text-primary)]"
                  >
                    Recebimento confirmado
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 text-sm text-[var(--text-muted)]"
                  >
                    {isOffline
                      ? 'Salvo localmente. Sincronizará quando a conexão voltar.'
                      : `R$ ${parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado com sucesso.`}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 w-full">
                    <Button type="button" fullWidth onClick={onClose}>
                      <Sparkles className="size-4" /> Concluir
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                        <Wallet className="size-5" aria-hidden />
                      </div>
                      <div>
                        <h2 id="payment-receipt-title" className="text-base font-semibold text-[var(--text-primary)]">
                          {variant === 'admin' ? 'Validar recebimento' : 'Registrar recebimento'}
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                          {variant === 'admin' ? 'Confirme com comprovante e assinatura' : 'Baixa imediata em campo'}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]" aria-label="Fechar">
                      <X className="size-4" />
                    </button>
                  </div>

                  {isOffline && (
                    <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--warning-subtle)] px-3 py-2 text-xs text-[var(--warning)]">
                      <ShieldCheck className="size-4 shrink-0" />
                      Modo offline — o recebimento será enfileirado para sincronização.
                    </div>
                  )}

                  <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{parcela.clienteNome}</span>
                      <Badge tone="warning">{parcela.status}</Badge>
                    </div>
                    {cliente && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <MapPin className="size-3 shrink-0" />
                        {cliente.rua}, {cliente.numero} — {cliente.bairro}
                      </p>
                    )}
                    <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
                      R$ {parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Parcela {parcela.numeroParcela}/{parcela.totalParcelas}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Forma de pagamento" required>
                      <div className="flex flex-wrap gap-2">
                        {FORMAS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => { setForma(f.id); setError(''); }}
                            className={cn(
                              'rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium transition',
                              forma === f.id
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]'
                                : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </FormField>

                    <FormField
                      label="Comprovante de pagamento"
                      required={needsComprovante}
                      hint={needsComprovante ? 'Obrigatório para esta forma' : 'Opcional — recomendado para auditoria'}
                    >
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-panel)] border border-dashed border-[var(--border)] bg-[var(--bg-muted)] p-3 text-left transition hover:border-[var(--accent)]"
                      >
                        {comprovante ? (
                          <img src={comprovante} alt="Comprovante" className="size-14 rounded-[var(--radius-control)] object-cover" />
                        ) : (
                          <div className="flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-[var(--bg-surface)]">
                            <Upload className="size-5 text-[var(--text-muted)]" />
                          </div>
                        )}
                        <span className="text-xs text-[var(--text-secondary)]">
                          {comprovante ? 'Toque para trocar o comprovante' : 'Enviar foto ou print do comprovante'}
                        </span>
                      </button>
                    </FormField>

                    <FormField label="Localização GPS" required={needsGps} hint={variant === 'admin' ? 'Opcional no painel admin' : 'Obrigatório em campo'}>
                      <Button type="button" variant="outline" fullWidth onClick={captureGps} disabled={gpsLoading}>
                        {gpsLoading ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                        {coords ? `GPS: ${coords.lat}, ${coords.lng}` : 'Capturar localização'}
                      </Button>
                    </FormField>

                    <FormField label="Assinatura do cliente" required>
                      <SignaturePad onChange={setAssinatura} />
                    </FormField>

                    <FormField label="Observações">
                      <textarea
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        rows={2}
                        placeholder="Ex: Cliente pagou em dinheiro, notas conferidas"
                        className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
                      />
                    </FormField>

                    {error && (
                      <p className="rounded-[var(--radius-control)] bg-[var(--destructive-subtle)] px-3 py-2 text-xs text-[var(--destructive)]">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-2 border-t border-[var(--border)] pt-4">
                      <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancelar</Button>
                      <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        Confirmar recebimento
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}