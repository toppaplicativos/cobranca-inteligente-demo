import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { RouteStop } from '../../lib/smartRoute';
import { Badge } from '../ui/Badge';

interface CobradorMapViewProps {
  stops: RouteStop[];
  currentIndex: number;
  routeName: string;
}

export function CobradorMapView({ stops, currentIndex, routeName }: CobradorMapViewProps) {
  const current = stops[currentIndex];

  return (
    <div className="space-y-4 px-1">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{routeName}</h2>
          <p className="text-xs text-[var(--text-muted)]">{stops.length} paradas · navegação integrada</p>
        </div>
        <Badge tone="accent" className="gap-1">
          <Layers className="size-3" /> GPS
        </Badge>
      </div>

      <div className="relative h-[min(52vh,380px)] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)] shadow-[var(--shadow-panel)]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-subtle)]/20 via-transparent to-[var(--success-subtle)]/15" />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {stops.map((stop, i) => {
            const prev = stops[i - 1];
            const x1 = prev ? prev.mapX : 10;
            const y1 = prev ? prev.mapY : 90;
            const isCurrent = i === currentIndex;
            const isDone = i < currentIndex;
            return (
              <g key={stop.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={stop.mapX}
                  y2={stop.mapY}
                  stroke={isDone ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isCurrent ? 0.9 : 0.5}
                  strokeDasharray={isCurrent ? undefined : '2 1.5'}
                  opacity={isDone ? 0.5 : 1}
                />
                <circle
                  cx={stop.mapX}
                  cy={stop.mapY}
                  r={isCurrent ? 3 : 2}
                  fill={isDone ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)'}
                />
              </g>
            );
          })}
        </svg>

        {current && (
          <motion.div
            className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/20"
            style={{ left: `${current.mapX}%`, top: `${current.mapY}%` }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        )}

        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--bg-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] backdrop-blur-sm">
          <Navigation className="size-3 text-[var(--accent)]" />
          Modo offline disponível
        </span>
      </div>

      {current && (
        <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Destino atual</p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">{current.cliente.nome}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <MapPin className="size-3 shrink-0" />
            {current.cliente.bairro}, {current.cliente.cidade} · {current.distanceKm} km
          </p>
        </div>
      )}
    </div>
  );
}