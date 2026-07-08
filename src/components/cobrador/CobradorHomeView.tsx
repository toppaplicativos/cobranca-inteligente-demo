import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Route, Wallet, MapPin, ChevronDown, Play, BarChart3,
} from 'lucide-react';
import { RotaCobranca } from '../../types';
import { RouteStop, routeSummary } from '../../lib/smartRoute';
import { NextStopCard } from './NextStopCard';
import { StartFirstStopCard } from './StartFirstStopCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Panel } from '../ui/Panel';

interface CobradorHomeViewProps {
  rotas: RotaCobranca[];
  selectedRotaId: string;
  onSelectRota: (id: string) => void;
  routeActive: boolean;
  routeEngaged: boolean;
  stops: RouteStop[];
  currentIndex: number;
  onLaunchRoute: () => void;
  onStartFirstStop: () => void;
  onReceive: (stop: RouteStop) => void;
  onOccurrence: (stop: RouteStop) => void;
  onNavigate: (stop: RouteStop) => void;
}

export function CobradorHomeView({
  rotas,
  selectedRotaId,
  onSelectRota,
  routeActive,
  routeEngaged,
  stops,
  currentIndex,
  onLaunchRoute,
  onStartFirstStop,
  onReceive,
  onOccurrence,
  onNavigate,
}: CobradorHomeViewProps) {
  const activeRota = rotas.find((r) => r.id === selectedRotaId) ?? rotas[0];
  const summary = routeSummary(stops);
  const currentStop = stops[currentIndex];
  const completedCount = stops.filter((s, i) => i < currentIndex || (s.parcela.status === 'Paga' && !s.parcela.syncPending)).length;

  return (
    <div className="space-y-4 px-1">
      <Panel className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[var(--accent-subtle)] opacity-60" />
        <div className="relative">
          <p className="text-xs text-[var(--text-muted)]">Bom dia,</p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Marcos Entregador</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </Panel>

      <div className="relative">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Roteiro do dia
        </label>
        <div className="relative">
          <select
            value={selectedRotaId}
            onChange={(e) => onSelectRota(e.target.value)}
            className="w-full appearance-none rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-panel)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
          >
            {rotas.map((r) => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>
        {activeRota && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <Badge tone={activeRota.status === 'Em Andamento' ? 'accent' : 'neutral'}>{activeRota.status}</Badge>
            <span className="flex items-center gap-1"><MapPin className="size-3" /> {activeRota.regiao}</span>
            <span>{activeRota.bairros.join(' · ')}</span>
          </div>
        )}
      </div>

      {!routeActive ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center shadow-[var(--shadow-panel)]"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--accent-subtle)]">
            <Route className="size-7 text-[var(--accent)]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">Rota inteligente pronta</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            O sistema analisa a demanda de cobrança, prioriza atrasos e monta o melhor percurso automaticamente.
          </p>
          {stops.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] p-2">
                <p className="text-lg font-semibold">{summary.stopCount}</p>
                <p className="text-[9px] text-[var(--text-muted)]">Paradas</p>
              </div>
              <div className="rounded-[var(--radius-control)] bg-[var(--bg-muted)] p-2">
                <p className="text-lg font-semibold">{summary.totalKm.toFixed(0)} km</p>
                <p className="text-[9px] text-[var(--text-muted)]">Estimado</p>
              </div>
              <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] p-2">
                <p className="text-lg font-semibold text-[var(--accent)]">
                  R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-[var(--text-muted)]">Meta do dia</p>
              </div>
            </div>
          )}
          <Button type="button" fullWidth className="mt-5" onClick={onLaunchRoute} disabled={stops.length === 0}>
            <Sparkles className="size-4" />
            {stops.length === 0 ? 'Sem paradas pendentes' : 'Iniciar rota inteligente'}
          </Button>
        </motion.div>
      ) : !routeEngaged ? (
        <StartFirstStopCard
          stops={stops}
          onStart={onStartFirstStop}
          onNavigate={() => stops[0] && onNavigate(stops[0])}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Panel padding="sm" className="flex items-center gap-2">
              <BarChart3 className="size-4 text-[var(--accent)]" />
              <div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{completedCount}/{stops.length}</p>
                <p className="text-[10px] text-[var(--text-muted)]">Concluídas</p>
              </div>
            </Panel>
            <Panel padding="sm" className="flex items-center gap-2">
              <Wallet className="size-4 text-[var(--success)]" />
              <div>
                <p className="text-lg font-semibold text-[var(--success)]">
                  R$ {stops.slice(currentIndex).reduce((s, st) => s + st.parcela.valorOriginal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">Restante</p>
              </div>
            </Panel>
          </div>

          {currentStop ? (
            <NextStopCard
              stop={currentStop}
              totalStops={stops.length}
              completedCount={completedCount}
              onReceive={() => onReceive(currentStop)}
              onOccurrence={() => onOccurrence(currentStop)}
              onNavigate={() => onNavigate(currentStop)}
            />
          ) : (
            <Panel className="py-8 text-center">
              <Play className="mx-auto size-8 text-[var(--success)]" />
              <p className="mt-3 font-semibold text-[var(--text-primary)]">Rota concluída!</p>
              <p className="text-sm text-[var(--text-muted)]">Meta de R$ {summary.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} atingida.</p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}