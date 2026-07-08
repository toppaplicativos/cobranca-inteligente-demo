import React, { useState } from 'react';
import { Plus, Coins } from 'lucide-react';
import { Cliente, SolicitacaoLimite } from '../../types';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Badge } from '../ui/Badge';
import { CreditRequestCard } from './CreditRequestCard';
import { CreditReviewDialog } from './CreditReviewDialog';
import { CreditOrderWizard } from './CreditOrderWizard';

interface CreditRequestsPanelProps {
  clientes: Cliente[];
  solicitacoes: SolicitacaoLimite[];
  onAddSolicitacao: (sol: SolicitacaoLimite) => void;
  onApprove: (solId: string, valorAprovado: number) => void;
  onReject: (solId: string, motivoRecusa: string) => void;
}

export function CreditRequestsPanel({
  clientes,
  solicitacoes,
  onAddSolicitacao,
  onApprove,
  onReject,
}: CreditRequestsPanelProps) {
  const [filter, setFilter] = useState<'Pendente' | 'Aprovado' | 'Recusado' | 'Todos'>('Pendente');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const pendentes = solicitacoes.filter((s) => s.status === 'Pendente').length;

  const filtered = solicitacoes.filter((s) => {
    if (filter === 'Todos') return true;
    return s.status === filter;
  });

  const reviewSol = solicitacoes.find((s) => s.id === reviewId) ?? null;
  const reviewCliente = reviewSol ? clientes.find((c) => c.id === reviewSol.clienteId) : undefined;

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Coins className="size-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pedidos de crédito</h3>
              {pendentes > 0 && <Badge tone="warning">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</Badge>}
            </div>
            <p className="text-xs text-[var(--text-muted)]">Analise, aprove ou recuse solicitações de limite</p>
          </div>
        </div>
        <Button type="button" size="sm" onClick={() => setWizardOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Novo pedido
        </Button>
      </Panel>

      <SegmentedTabs
        items={[
          { id: 'Pendente', label: `Pendentes (${solicitacoes.filter((s) => s.status === 'Pendente').length})` },
          { id: 'Aprovado', label: 'Aprovados' },
          { id: 'Recusado', label: 'Recusados' },
          { id: 'Todos', label: 'Todos' },
        ]}
        activeId={filter}
        onChange={(id) => setFilter(id as typeof filter)}
        scrollable
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <Panel className="col-span-full py-10 text-center text-sm text-[var(--text-muted)]">
            Nenhum pedido nesta categoria.
          </Panel>
        ) : (
          filtered.map((sol) => (
            <div key={sol.id}>
              <CreditRequestCard
                solicitacao={sol}
                cliente={clientes.find((c) => c.id === sol.clienteId)}
                onClick={() => setReviewId(sol.id)}
              />
            </div>
          ))
        )}
      </div>

      <CreditOrderWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        clientes={clientes}
        onSubmit={(sol) => {
          onAddSolicitacao(sol);
        }}
      />

      <CreditReviewDialog
        open={!!reviewId}
        solicitacao={reviewSol}
        cliente={reviewCliente}
        onClose={() => setReviewId(null)}
        onApprove={(id, valor) => {
          onApprove(id, valor);
          setReviewId(null);
        }}
        onReject={(id, motivoRecusa) => {
          onReject(id, motivoRecusa);
          setReviewId(null);
        }}
      />
    </div>
  );
}