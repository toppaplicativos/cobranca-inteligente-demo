import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, X, TrendingUp, ShieldCheck, AlertCircle, CalendarClock,
  CreditCard, MapPin, PenLine,
} from 'lucide-react';
import {
  Cliente, SolicitacaoLimite, IntervaloPedido, FormatoCobrancaPedido, FormaPagamentoPedido,
} from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { overlayClass, modalClassLg } from '../../lib/formStyles';

interface CreditReviewDialogProps {
  open: boolean;
  solicitacao: SolicitacaoLimite | null;
  cliente?: Cliente;
  onClose: () => void;
  onApprove: (solId: string, valorAprovado: number) => void;
  onReject: (solId: string, motivoRecusa: string) => void;
}

const INTERVALO_LABEL: Record<IntervaloPedido, string> = {
  DIARIO: 'Diário',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
};

const FORMATO_LABEL: Record<FormatoCobrancaPedido, string> = {
  CARNE: 'Carnê digital',
  BOLETO: 'Boleto registrado',
  PIX_RECORRENTE: 'Pix recorrente',
  MISTO: 'Misto (carnê + Pix)',
};

const PAGAMENTO_LABEL: Record<FormaPagamentoPedido, string> = {
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'TED/DOC',
};

function coordsToPin(coords: { lat: number; lng: number }) {
  const x = 50 + (coords.lng + 46.64) / 0.002;
  const y = 50 - (coords.lat + 23.55) / 0.002;
  return { x: Math.min(92, Math.max(8, x)), y: Math.min(92, Math.max(8, y)) };
}

export function CreditReviewDialog({
  open,
  solicitacao,
  cliente,
  onClose,
  onApprove,
  onReject,
}: CreditReviewDialogProps) {
  const [valorAprovado, setValorAprovado] = useState(0);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [mode, setMode] = useState<'review' | 'reject'>('review');

  useEffect(() => {
    if (solicitacao) {
      setValorAprovado(solicitacao.valorSolicitado);
      setMotivoRecusa('');
      setMode('review');
    }
  }, [solicitacao]);

  const aumento = solicitacao ? solicitacao.valorSolicitado - solicitacao.valorAtual : 0;
  const isPending = solicitacao?.status === 'Pendente';
  const hasExtended = solicitacao && (
    solicitacao.numeroParcelas != null
    || solicitacao.formatoCobranca
    || solicitacao.assinaturaUrl
    || solicitacao.coordenadas
  );

  return (
    <AnimatePresence>
      {open && solicitacao && (
      <div key={solicitacao.id} className={overlayClass} role="dialog" aria-modal="true" aria-labelledby="credit-review-title">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`${modalClassLg} relative z-10 max-h-[min(92dvh,calc(100dvh-1.5rem))] sm:max-h-[92dvh]`}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div className="min-w-0">
              <Badge tone={isPending ? 'warning' : solicitacao.status === 'Aprovado' ? 'success' : 'destructive'}>
                {solicitacao.status}
              </Badge>
              <h2 id="credit-review-title" className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                Análise de pedido de crédito
              </h2>
              <p className="text-xs text-[var(--text-muted)]">{solicitacao.id}</p>
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

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            <div className="flex items-center gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)] p-3">
              {cliente && (
                <img src={cliente.foto} alt="" className="size-12 rounded-full border border-[var(--border)] object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--text-primary)]">{solicitacao.clienteNome}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  CPF {solicitacao.clienteCpf ?? cliente?.cpf}
                  {(solicitacao.clienteTelefone ?? cliente?.celularPrincipal) && (
                    <> · {solicitacao.clienteTelefone ?? cliente?.celularPrincipal}</>
                  )}
                </p>
                {cliente && (
                  <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    Score {cliente.scoreInterno} ({cliente.scoreRisco}) · Em aberto R$ {cliente.totalEmAberto.toLocaleString('pt-BR')}
                  </p>
                )}
                {solicitacao.clienteBairro && (
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{solicitacao.clienteBairro}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[var(--radius-control)] border border-[var(--border)] p-2.5">
                <span className="text-[10px] uppercase text-[var(--text-muted)]">Atual</span>
                <p className="mt-1 text-sm font-semibold">R$ {solicitacao.valorAtual.toLocaleString('pt-BR')}</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-subtle)] p-2.5">
                <TrendingUp className="size-4 text-[var(--accent)]" aria-hidden />
                <span className="mt-1 text-[10px] text-[var(--accent)]">+R$ {aumento.toLocaleString('pt-BR')}</span>
              </div>
              <div className="rounded-[var(--radius-control)] border border-[var(--accent)] bg-[var(--accent-subtle)] p-2.5">
                <span className="text-[10px] uppercase text-[var(--accent)]">Pedido</span>
                <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
                  R$ {solicitacao.valorSolicitado.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {(solicitacao.valorEntrada != null && solicitacao.valorEntrada > 0) && (
              <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                Entrada R$ {solicitacao.valorEntrada.toLocaleString('pt-BR')}
                {solicitacao.valorFinanciado != null && (
                  <> · Financiado R$ {solicitacao.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
                )}
              </div>
            )}

            {hasExtended && (
              <div className="space-y-3 rounded-[var(--radius-panel)] border border-[var(--border)] p-3">
                <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  Condições do pedido
                </span>

                {solicitacao.numeroParcelas != null && (
                  <div className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 size-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {solicitacao.numeroParcelas}x
                        {solicitacao.valorParcelaEstimado != null && (
                          <> de R$ {solicitacao.valorParcelaEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
                        )}
                      </p>
                      {solicitacao.intervaloCobranca && (
                        <p className="text-xs text-[var(--text-muted)]">{INTERVALO_LABEL[solicitacao.intervaloCobranca]}</p>
                      )}
                    </div>
                  </div>
                )}

                {solicitacao.formatoCobranca && (
                  <div className="flex items-center gap-2">
                    <Badge tone="accent">{FORMATO_LABEL[solicitacao.formatoCobranca]}</Badge>
                  </div>
                )}

                {solicitacao.formasPagamento && solicitacao.formasPagamento.length > 0 && (
                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 size-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                    <div className="flex flex-wrap gap-1.5">
                      {solicitacao.formasPagamento.map((p) => (
                        <span key={p}>
                          <Badge tone="neutral">{PAGAMENTO_LABEL[p]}</Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {solicitacao.coordenadas && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <MapPin className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
                      {solicitacao.enderecoReferencia ?? `${solicitacao.coordenadas.lat}, ${solicitacao.coordenadas.lng}`}
                    </div>
                    <div
                      className="relative h-24 overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-muted)]"
                      style={{
                        backgroundImage: `
                          linear-gradient(oklch(0.88 0 0 / 0.35) 1px, transparent 1px),
                          linear-gradient(90deg, oklch(0.88 0 0 / 0.35) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[var(--success-subtle)]/25 to-transparent" />
                      <div
                        className="absolute size-6 -translate-x-1/2 -translate-y-full"
                        style={{
                          left: `${coordsToPin(solicitacao.coordenadas).x}%`,
                          top: `${coordsToPin(solicitacao.coordenadas).y}%`,
                        }}
                      >
                        <MapPin className="size-6 text-[var(--accent)]" fill="currentColor" />
                      </div>
                    </div>
                    <p className="font-mono text-[10px] text-[var(--text-muted)]">
                      {solicitacao.coordenadas.lat}, {solicitacao.coordenadas.lng}
                    </p>
                  </div>
                )}

                {solicitacao.assinaturaUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <PenLine className="size-3.5 shrink-0" aria-hidden />
                      Assinatura do cliente
                    </div>
                    <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-2">
                      <img
                        src={solicitacao.assinaturaUrl}
                        alt="Assinatura do cliente"
                        className="mx-auto h-14 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-[var(--radius-control)] border border-[var(--border)] p-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {solicitacao.descricaoOperacao ? 'Operação' : 'Motivo do cliente'}
              </span>
              {solicitacao.descricaoOperacao && (
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{solicitacao.descricaoOperacao}</p>
              )}
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{solicitacao.motivo}</p>
            </div>
          </div>

          <div className="shrink-0 space-y-3 border-t border-[var(--border)] pt-4" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
            {isPending && mode === 'review' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                    Valor aprovado (pode diferir do solicitado)
                  </label>
                  <Input
                    type="number"
                    min={solicitacao.valorAtual}
                    value={valorAprovado}
                    onChange={(e) => setValorAprovado(Number(e.target.value))}
                    inputSize="sm"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setMode('reject')}
                  >
                    <AlertCircle className="size-4" /> Recusar pedido
                  </Button>
                  <Button
                    type="button"
                    fullWidth
                    onClick={() => onApprove(solicitacao.id, valorAprovado)}
                    disabled={valorAprovado < solicitacao.valorAtual}
                  >
                    <Check className="size-4" /> Aprovar R$ {valorAprovado.toLocaleString('pt-BR')}
                  </Button>
                </div>
              </>
            )}

            {isPending && mode === 'reject' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                    Motivo da recusa (opcional — enviado ao cliente)
                  </label>
                  <textarea
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Ex: Inadimplência recente ou score abaixo do mínimo"
                    className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" fullWidth onClick={() => setMode('review')}>
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    fullWidth
                    onClick={() => onReject(solicitacao.id, motivoRecusa)}
                  >
                    Confirmar recusa
                  </Button>
                </div>
              </>
            )}

            {!isPending && (
              <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--bg-muted)] p-3 text-xs text-[var(--text-secondary)]">
                <ShieldCheck className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
                Este pedido já foi {solicitacao.status === 'Aprovado' ? 'aprovado' : 'recusado'}
                {solicitacao.dataResposta && ` em ${new Date(solicitacao.dataResposta).toLocaleDateString('pt-BR')}`}.
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}