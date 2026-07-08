import React from 'react';
import { motion } from 'motion/react';
import {
  Navigation, MapPin, Clock, Wallet, CheckCircle, AlertTriangle, ChevronRight, Phone,
} from 'lucide-react';
import { RouteStop } from '../../lib/smartRoute';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
interface NextStopCardProps {
  stop: RouteStop;
  totalStops: number;
  completedCount: number;
  onReceive: () => void;
  onOccurrence: () => void;
  onNavigate?: () => void;
}

const priorityTone = {
  alta: 'destructive' as const,
  media: 'warning' as const,
  normal: 'neutral' as const,
};

export function NextStopCard({
  stop,
  totalStops,
  completedCount,
  onReceive,
  onOccurrence,
  onNavigate,
}: NextStopCardProps) {
  const progress = totalStops > 0 ? (completedCount / totalStops) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-elevated overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--accent-subtle)]/25 dark:from-[var(--bg-elevated)] dark:to-[var(--accent-subtle)]/15"
    >
      <div className="border-b border-[var(--border)]/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Próxima atividade</p>
            <p className="text-xs text-[var(--text-muted)]">Parada {stop.order} de {totalStops}</p>
          </div>
          <Badge tone={priorityTone[stop.priority]}>{stop.priority === 'alta' ? 'Urgente' : stop.priority === 'media' ? 'Prioridade' : 'Normal'}</Badge>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <img
            src={stop.cliente.foto}
            alt=""
            className="size-14 shrink-0 rounded-full border-2 border-[var(--bg-surface)] object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-[var(--text-primary)]">{stop.cliente.nome}</h3>
            <p className="mt-0.5 flex items-start gap-1 text-xs text-[var(--text-secondary)]">
              <MapPin className="mt-0.5 size-3 shrink-0 text-[var(--accent)]" />
              {stop.cliente.rua}, {stop.cliente.numero} — {stop.cliente.bairro}
            </p>
            <a href={`tel:${stop.cliente.celularPrincipal}`} className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--accent)]">
              <Phone className="size-3" /> {stop.cliente.celularPrincipal}
            </a>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] px-2 py-2 text-center">
            <Navigation className="mx-auto size-3.5 text-[var(--text-muted)]" />
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{stop.distanceKm} km</p>
            <p className="text-[9px] text-[var(--text-muted)]">Distância</p>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] px-2 py-2 text-center">
            <Clock className="mx-auto size-3.5 text-[var(--text-muted)]" />
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">~{stop.etaMinutes} min</p>
            <p className="text-[9px] text-[var(--text-muted)]">ETA</p>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] px-2 py-2 text-center">
            <Wallet className="mx-auto size-3.5 text-[var(--accent)]" />
            <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
              R$ {stop.parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[9px] text-[var(--text-muted)]">A arrecadar</p>
          </div>
        </div>

        <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">O que fazer</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">{stop.actionLabel}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Parcela {stop.parcela.numeroParcela}/{stop.parcela.totalParcelas} · Venc. {new Date(stop.parcela.dataVencimento).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {onNavigate && (
            <Button type="button" variant="outline" fullWidth onClick={onNavigate}>
              <Navigation className="size-4" /> Abrir navegação <ChevronRight className="size-4" />
            </Button>
          )}
          <div className="flex gap-2">
            <Button type="button" fullWidth onClick={onReceive}>
              <CheckCircle className="size-4" /> Receber
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={onOccurrence}>
              <AlertTriangle className="size-4" /> Ocorrência
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}