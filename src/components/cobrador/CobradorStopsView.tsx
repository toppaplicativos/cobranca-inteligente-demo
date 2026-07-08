import React from 'react';
import { motion } from 'motion/react';
import { Check, MapPin, Clock, Wallet } from 'lucide-react';
import { RouteStop } from '../../lib/smartRoute';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

interface CobradorStopsViewProps {
  stops: RouteStop[];
  currentIndex: number;
  onSelectStop: (index: number) => void;
}

export function CobradorStopsView({ stops, currentIndex, onSelectStop }: CobradorStopsViewProps) {
  return (
    <div className="space-y-3 px-1">
      <p className="text-xs text-[var(--text-muted)]">
        Sequência otimizada pelo sistema — {stops.length} paradas
      </p>
      <div className="space-y-2">
        {stops.map((stop, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index < currentIndex;
          const isPaga = stop.parcela.status === 'Paga' && !stop.parcela.syncPending;

          return (
            <motion.button
              key={stop.id}
              type="button"
              layout
              onClick={() => onSelectStop(index)}
              className={cn(
                'w-full rounded-[var(--radius-panel)] border p-3 text-left transition',
                isCurrent
                  ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/40 shadow-[var(--shadow-panel)]'
                  : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isDone || isPaga
                      ? 'bg-[var(--success)] text-white'
                      : isCurrent
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                        : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  )}
                >
                  {isDone || isPaga ? <Check className="size-4" /> : stop.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{stop.cliente.nome}</span>
                    {isCurrent && <Badge tone="accent">Atual</Badge>}
                    {stop.priority === 'alta' && !isDone && <Badge tone="destructive">Urgente</Badge>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[var(--text-muted)]">
                    <MapPin className="size-3 shrink-0" />
                    {stop.cliente.bairro}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-0.5"><Clock className="size-3" /> ~{stop.etaMinutes} min</span>
                    <span>{stop.distanceKm} km</span>
                    <span className="flex items-center gap-0.5 font-semibold text-[var(--accent)]">
                      <Wallet className="size-3" />
                      R$ {stop.parcela.valorOriginal.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}