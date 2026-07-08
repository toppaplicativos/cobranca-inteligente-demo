import React from 'react';
import { motion } from 'motion/react';
import { Navigation, MapPin, Clock, Wallet, Sparkles, ChevronRight } from 'lucide-react';
import { RouteStop, routeSummary } from '../../lib/smartRoute';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface StartFirstStopCardProps {
  stops: RouteStop[];
  onStart: () => void;
  onNavigate: () => void;
}

export function StartFirstStopCard({ stops, onStart, onNavigate }: StartFirstStopCardProps) {
  const first = stops[0];
  const summary = routeSummary(stops);
  if (!first) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--success)]/35 bg-gradient-to-br from-[var(--bg-surface)] via-[var(--success-subtle)]/25 to-[var(--accent-subtle)]/20 shadow-[var(--shadow-elevated)]"
    >
      <div className="border-b border-[var(--border)]/60 px-4 py-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--success-subtle)]"
        >
          <Sparkles className="size-6 text-[var(--success)]" />
        </motion.div>
        <h3 className="mt-3 text-base font-semibold text-[var(--text-primary)]">Rota montada com sucesso</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {summary.stopCount} paradas · {summary.totalKm.toFixed(1)} km · meta{' '}
          <strong className="text-[var(--accent)]">
            R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
        </p>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Primeira parada</p>

        <div className="mt-3 flex gap-3">
          <img
            src={first.cliente.foto}
            alt=""
            className="size-12 shrink-0 rounded-full border-2 border-[var(--bg-surface)] object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{first.cliente.nome}</span>
              <Badge tone={first.priority === 'alta' ? 'destructive' : 'warning'}>Parada 1</Badge>
            </div>
            <p className="mt-0.5 flex items-start gap-1 text-xs text-[var(--text-secondary)]">
              <MapPin className="mt-0.5 size-3 shrink-0 text-[var(--accent)]" />
              {first.cliente.rua}, {first.cliente.numero} — {first.cliente.bairro}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)]/80 px-2 py-2">
            <Navigation className="mx-auto size-3.5 text-[var(--text-muted)]" />
            <p className="mt-1 text-sm font-semibold">{first.distanceKm} km</p>
            <p className="text-[9px] text-[var(--text-muted)]">Distância</p>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)]/80 px-2 py-2">
            <Clock className="mx-auto size-3.5 text-[var(--text-muted)]" />
            <p className="mt-1 text-sm font-semibold">~{first.etaMinutes} min</p>
            <p className="text-[9px] text-[var(--text-muted)]">ETA</p>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] px-2 py-2">
            <Wallet className="mx-auto size-3.5 text-[var(--accent)]" />
            <p className="mt-1 text-sm font-semibold text-[var(--accent)]">
              R$ {first.parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
            <p className="text-[9px] text-[var(--text-muted)]">A arrecadar</p>
          </div>
        </div>

        <p className="mt-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)]/80 px-3 py-2 text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">{first.actionLabel}</strong>
          {' · '}Parcela {first.parcela.numeroParcela}/{first.parcela.totalParcelas}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Button type="button" fullWidth onClick={onStart}>
            <Navigation className="size-4" />
            Ir para a primeira parada
            <ChevronRight className="size-4" />
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={onNavigate}>
            Abrir no mapa externo
          </Button>
        </div>
      </div>
    </motion.div>
  );
}