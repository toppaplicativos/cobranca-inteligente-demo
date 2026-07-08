import React from 'react';
import { MessageSquare, ShieldAlert, Compass, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { Cliente, Parcela, RotaCobranca, LogAuditoria } from '../../types';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

interface CommandActionsProps {
  parcelas: Parcela[];
  clientes: Cliente[];
  rotas: RotaCobranca[];
  logs: LogAuditoria[];
  onMassReminders: () => void;
  onMassBlock: () => void;
  onRouteDispatch: () => void;
  onAiCalibration: () => void;
}

interface ActionItem {
  id: string;
  category: string;
  title: string;
  stat: string;
  tone: 'success' | 'destructive' | 'accent' | 'neutral';
  onClick: () => void;
}

export function CommandActions({
  parcelas,
  clientes,
  rotas,
  logs,
  onMassReminders,
  onMassBlock,
  onRouteDispatch,
  onAiCalibration,
}: CommandActionsProps) {
  const atrasadas = parcelas.filter((p) => p.status === 'Atrasada').length;
  const altoRisco = clientes.filter((c) => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').length;
  const rotasAtivas = rotas.filter((r) => !r.concluida).length;

  const actions: ActionItem[] = [
    {
      id: 'reminders',
      category: 'Comunicação',
      title: 'Cobrança em massa',
      stat: `${atrasadas} parcelas atrasadas`,
      tone: 'success',
      onClick: onMassReminders,
    },
    {
      id: 'block',
      category: 'Risco',
      title: 'Bloqueio preventivo',
      stat: `${altoRisco} contas elegíveis`,
      tone: 'destructive',
      onClick: onMassBlock,
    },
    {
      id: 'dispatch',
      category: 'Campo',
      title: 'Despachar itinerários',
      stat: `${rotasAtivas} rotas ativas`,
      tone: 'accent',
      onClick: onRouteDispatch,
    },
    {
      id: 'calibration',
      category: 'Crédito',
      title: 'Recalibrar scores',
      stat: `${clientes.length} perfis analisados`,
      tone: 'neutral',
      onClick: onAiCalibration,
    },
  ];

  return (
    <Panel className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="accent">Operações</Badge>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <span className="size-1.5 rounded-full bg-[var(--success)]" aria-hidden />
              Sistema ativo
            </span>
          </div>
          <h2 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Ações do dia</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Dispare cobranças, restrinja crédito e sincronize rotas de campo.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-inset)] px-3 py-2 text-xs">
          <Clock className="size-4 text-[var(--text-muted)]" aria-hidden />
          <div>
            <span className="block text-[11px] text-[var(--text-muted)]">Última auditoria</span>
            <span className="font-mono text-[var(--text-primary)]">{logs[0]?.acao ?? 'Sem registros'}</span>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className={cn(
              'group flex flex-col justify-between rounded-[var(--radius-control)] border border-[var(--border)]',
              'bg-[var(--bg-surface)] p-4 text-left min-h-[120px]',
              'transition-[border-color,background-color] duration-[var(--duration-fast)]',
              'hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]'
            )}
          >
            <div className="flex items-start justify-between">
              <ActionIcon id={action.id} />
              <ChevronRight className="size-3.5 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
            <div className="mt-4">
              <span className="text-[11px] text-[var(--text-muted)]">{action.category}</span>
              <span className="mt-0.5 block text-sm font-medium text-[var(--text-primary)]">{action.title}</span>
              <span
                className={cn(
                  'mt-1 block text-[11px] font-medium',
                  action.tone === 'success' && 'text-[var(--success)]',
                  action.tone === 'destructive' && 'text-[var(--destructive)]',
                  action.tone === 'accent' && 'text-[var(--accent)]',
                  action.tone === 'neutral' && 'text-[var(--text-secondary)]'
                )}
              >
                {action.stat}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ActionIcon({ id }: { id: string }) {
  const className = 'size-4';
  const wrap = 'flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--bg-muted)] text-[var(--text-secondary)]';

  switch (id) {
    case 'reminders':
      return <div className={wrap}><MessageSquare className={className} aria-hidden /></div>;
    case 'block':
      return <div className={wrap}><ShieldAlert className={className} aria-hidden /></div>;
    case 'dispatch':
      return <div className={wrap}><Compass className={className} aria-hidden /></div>;
    default:
      return <div className={wrap}><Sparkles className={className} aria-hidden /></div>;
  }
}