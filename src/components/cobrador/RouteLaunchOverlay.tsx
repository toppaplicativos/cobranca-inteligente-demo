import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, MapPin, Route, Sparkles, Check } from 'lucide-react';
import { RouteStop, routeSummary } from '../../lib/smartRoute';
import { Button } from '../ui/Button';

type Phase = 'analyzing' | 'dividing' | 'optimizing' | 'ready';

interface RouteLaunchOverlayProps {
  open: boolean;
  stops: RouteStop[];
  routeName: string;
  onComplete: () => void;
  onClose: () => void;
}

export function RouteLaunchOverlay({ open, stops, routeName, onComplete, onClose }: RouteLaunchOverlayProps) {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const summary = routeSummary(stops);

  useEffect(() => {
    if (!open) {
      setPhase('analyzing');
      return;
    }
    const t1 = setTimeout(() => setPhase('dividing'), 1400);
    const t2 = setTimeout(() => setPhase('optimizing'), 2800);
    const t3 = setTimeout(() => setPhase('ready'), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[calc(var(--z-overlay)+4)] flex items-end justify-center bg-[oklch(0.08_0.02_250/0.72)] p-0 sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)] sm:max-w-md sm:rounded-[var(--radius-panel)]"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-subtle)] text-[var(--accent)]">
              <Brain className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Rota inteligente</h2>
              <p className="text-xs text-[var(--text-muted)]">{routeName}</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px] flex-1 overflow-hidden bg-[var(--bg-muted)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(var(--border) 1px, transparent 1px),
                linear-gradient(90deg, var(--border) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <AnimatePresence>
              {phase !== 'analyzing' && stops.map((stop, i) => {
                const prev = stops[i - 1];
                const x1 = prev ? prev.mapX : 12;
                const y1 = prev ? prev.mapY : 88;
                return (
                  <motion.g key={stop.id}>
                    <motion.line
                      x1={x1}
                      y1={y1}
                      x2={stop.mapX}
                      y2={stop.mapY}
                      stroke="var(--accent)"
                      strokeWidth="0.6"
                      strokeDasharray="2 1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ delay: i * 0.35, duration: 0.5 }}
                    />
                    <motion.circle
                      cx={stop.mapX}
                      cy={stop.mapY}
                      r="2.2"
                      fill={stop.priority === 'alta' ? 'var(--destructive)' : 'var(--accent)'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.35 + 0.2, type: 'spring', stiffness: 300 }}
                    />
                    <motion.text
                      x={stop.mapX + 2.5}
                      y={stop.mapY + 0.8}
                      fontSize="3"
                      fill="var(--text-secondary)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.35 + 0.4 }}
                    >
                      {stop.order}
                    </motion.text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>

          <motion.div
            className="absolute left-3 top-3 rounded-[var(--radius-control)] bg-[var(--bg-surface)]/90 px-2.5 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-sm"
            animate={{ opacity: phase === 'analyzing' ? 1 : 0.6 }}
          >
            <MapPin className="mr-1 inline size-3 text-[var(--accent)]" />
            Origem · depósito operacional
          </motion.div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <AnimatePresence mode="wait">
            {phase === 'analyzing' && (
              <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="mx-auto mb-3 size-8 rounded-full border-2 border-[var(--accent)] border-t-transparent"
                />
                <p className="text-sm font-medium text-[var(--text-primary)]">Analisando demanda de cobrança...</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Priorizando atrasos e valor a arrecadar</p>
              </motion.div>
            )}
            {phase === 'dividing' && (
              <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <Route className="mx-auto mb-2 size-6 text-[var(--accent)]" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Dividindo rota em {stops.length} paradas</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Agrupando bairros e janelas de visita</p>
              </motion.div>
            )}
            {phase === 'optimizing' && (
              <motion.div key="o" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <Sparkles className="mx-auto mb-2 size-6 text-[var(--accent)]" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Otimizando sequência por proximidade</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Reduzindo deslocamento estimado em até 32%</p>
              </motion.div>
            )}
            {phase === 'ready' && (
              <motion.div key="r" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[var(--success)]">
                  <Check className="size-5" />
                  <span className="text-sm font-semibold">Rota pronta para iniciar</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] p-2">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{summary.stopCount}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Paradas</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] p-2">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{summary.totalKm.toFixed(1)} km</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Percurso</p>
                  </div>
                  <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] p-2">
                    <p className="text-lg font-semibold text-[var(--accent)]">
                      R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">Meta do dia</p>
                  </div>
                </div>
                {stops[0] && (
                  <div className="rounded-[var(--radius-panel)] border border-[var(--accent)]/30 bg-[var(--accent-subtle)]/50 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--accent)]">Próxima atividade</p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{stops[0].cliente.nome}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{stops[0].actionLabel} · {stops[0].distanceKm} km · ~{stops[0].etaMinutes} min</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            {phase !== 'ready' ? (
              <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancelar</Button>
            ) : (
              <>
                <Button type="button" variant="outline" fullWidth onClick={onClose}>Voltar</Button>
                <Button type="button" fullWidth onClick={onComplete}>
                  <Sparkles className="size-4" /> Iniciar rota
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}