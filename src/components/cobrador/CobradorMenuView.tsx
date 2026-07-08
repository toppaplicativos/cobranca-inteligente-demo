import React from 'react';
import { Megaphone, User, HelpCircle, FileText, Bell, Shield } from 'lucide-react';
import { AvisoGlobal } from '../../types';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';

interface CobradorMenuViewProps {
  avisos: AvisoGlobal[];
}

const menuItems = [
  { icon: User, label: 'Meu perfil', desc: 'Marcos Entregador · COB-001' },
  { icon: FileText, label: 'Relatório do dia', desc: 'Resumo de visitas e arrecadação' },
  { icon: Bell, label: 'Notificações', desc: 'Alertas operacionais' },
  { icon: HelpCircle, label: 'Suporte de campo', desc: 'Fale com a central' },
  { icon: Shield, label: 'Segurança', desc: 'Sessão e dispositivo' },
];

export function CobradorMenuView({ avisos }: CobradorMenuViewProps) {
  const filtered = avisos.filter((a) => a.ativo && (a.destino === 'COBRADORES' || a.destino === 'TODOS'));

  return (
    <div className="space-y-4 px-1">
      <Panel className="divide-y divide-[var(--border)] p-0 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--bg-muted)]"
            >
              <div className="flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--bg-muted)] text-[var(--accent)]">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </Panel>

      {filtered.length > 0 && (
        <Panel>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Megaphone className="size-4 text-[var(--warning)]" />
            Comunicados ({filtered.length})
          </h3>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {filtered.map((aviso) => (
              <div
                key={aviso.id}
                className={`rounded-[var(--radius-control)] border p-3 text-xs ${
                  aviso.severidade === 'Critico'
                    ? 'border-[var(--destructive)]/30 bg-[var(--destructive-subtle)]'
                    : aviso.severidade === 'Alerta'
                      ? 'border-[var(--warning)]/30 bg-[var(--warning-subtle)]'
                      : 'border-[var(--border)] bg-[var(--bg-muted)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[var(--text-primary)]">{aviso.titulo}</span>
                  <Badge tone="neutral">{aviso.severidade}</Badge>
                </div>
                <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{aviso.conteudo}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}