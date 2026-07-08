import React from 'react';
import { ArrowRight, Calendar, TrendingUp, CalendarClock, CreditCard } from 'lucide-react';
import { Cliente, SolicitacaoLimite, FormatoCobrancaPedido, IntervaloPedido } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

interface CreditRequestCardProps {
  solicitacao: SolicitacaoLimite;
  cliente?: Cliente;
  onClick: () => void;
  compact?: boolean;
}

const statusTone: Record<SolicitacaoLimite['status'], 'warning' | 'success' | 'destructive'> = {
  Pendente: 'warning',
  Aprovado: 'success',
  Recusado: 'destructive',
};

const INTERVALO_SHORT: Record<IntervaloPedido, string> = {
  DIARIO: 'Diário',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
};

const FORMATO_SHORT: Record<FormatoCobrancaPedido, string> = {
  CARNE: 'Carnê',
  BOLETO: 'Boleto',
  PIX_RECORRENTE: 'Pix recorrente',
  MISTO: 'Misto',
};

export function CreditRequestCard({ solicitacao, cliente, onClick, compact }: CreditRequestCardProps) {
  const aumento = solicitacao.valorSolicitado - solicitacao.valorAtual;
  const pct = solicitacao.valorAtual > 0
    ? Math.round((aumento / solicitacao.valorAtual) * 100)
    : 100;
  const progress = Math.min(100, (solicitacao.valorAtual / solicitacao.valorSolicitado) * 100);
  const hasParcelas = solicitacao.numeroParcelas != null && solicitacao.numeroParcelas > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'surface-card w-full min-w-0 rounded-[var(--radius-panel)] text-left transition',
        'hover:shadow-[var(--shadow-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start gap-3">
        {cliente ? (
          <img
            src={cliente.foto}
            alt=""
            className="size-10 shrink-0 rounded-full border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-xs font-semibold text-[var(--text-muted)]">
            {solicitacao.clienteNome.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {solicitacao.clienteNome}
            </span>
            <Badge tone={statusTone[solicitacao.status]}>{solicitacao.status}</Badge>
          </div>
          <span className="mt-0.5 block font-mono text-[10px] text-[var(--text-muted)]">
            {solicitacao.id} · {solicitacao.clienteId}
          </span>
        </div>

        {solicitacao.status === 'Pendente' && (
          <ArrowRight className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        )}
      </div>

      {hasParcelas && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Badge tone="neutral" className="gap-1">
            <CalendarClock className="size-3" aria-hidden />
            {solicitacao.numeroParcelas}x
            {solicitacao.valorParcelaEstimado != null && (
              <> R$ {solicitacao.valorParcelaEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</>
            )}
            {solicitacao.intervaloCobranca && ` · ${INTERVALO_SHORT[solicitacao.intervaloCobranca]}`}
          </Badge>
          {solicitacao.formatoCobranca && (
            <Badge tone="neutral">{FORMATO_SHORT[solicitacao.formatoCobranca]}</Badge>
          )}
          {solicitacao.formasPagamento && solicitacao.formasPagamento.length > 0 && (
            <Badge tone="neutral" className="gap-1">
              <CreditCard className="size-3" aria-hidden />
              {solicitacao.formasPagamento.length} pagamento{solicitacao.formasPagamento.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      <div className={cn('mt-3 grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
        <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] px-2.5 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Atual</span>
          <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">
            R$ {solicitacao.valorAtual.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] px-2.5 py-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">Solicitado</span>
          <p className="mt-0.5 text-sm font-semibold text-[var(--accent)]">
            R$ {solicitacao.valorSolicitado.toLocaleString('pt-BR')}
          </p>
        </div>
        {!compact && (
          <div className="rounded-[var(--radius-control)] border border-[var(--border)] px-2.5 py-2 sm:col-span-1 col-span-2">
            <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              <TrendingUp className="size-3" aria-hidden /> Aumento
            </span>
            <p className="mt-0.5 text-sm font-semibold text-[var(--success)]">
              +R$ {aumento.toLocaleString('pt-BR')} ({pct}%)
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
        {solicitacao.descricaoOperacao ?? solicitacao.motivo}
      </p>

      <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
        <Calendar className="size-3 shrink-0" aria-hidden />
        {new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR')}
        {solicitacao.dataResposta && (
          <span> · Respondido em {new Date(solicitacao.dataResposta).toLocaleDateString('pt-BR')}</span>
        )}
      </div>
    </button>
  );
}