import React, { useState } from 'react';
import {
  Landmark, Users, Compass, MessageSquare, FileSpreadsheet, ShieldAlert, LayoutGrid, Coins,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { PageHeader } from './PageHeader';
import { MobileMoreSheet } from './MobileMoreSheet';

export type AdminTab =
  | 'dashboard'
  | 'clientes'
  | 'credito'
  | 'financas'
  | 'rotas'
  | 'relatorios'
  | 'seguranca'
  | 'comunicacao';

interface AdminShellProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
  pendingCreditCount?: number;
}

const navItems: { id: AdminTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', short: 'Início', icon: Landmark },
  { id: 'clientes', label: 'Clientes', short: 'Clientes', icon: Users },
  { id: 'credito', label: 'Pedidos de crédito', short: 'Crédito', icon: Coins },
  { id: 'financas', label: 'Caixa', short: 'Caixa', icon: Landmark },
  { id: 'rotas', label: 'Rotas', short: 'Rotas', icon: Compass },
  { id: 'comunicacao', label: 'Comunicação', short: 'Comunic.', icon: MessageSquare },
  { id: 'relatorios', label: 'Relatórios', short: 'Relat.', icon: FileSpreadsheet },
  { id: 'seguranca', label: 'Auditoria', short: 'Auditoria', icon: ShieldAlert },
];

const primaryMobileTabs: AdminTab[] = ['dashboard', 'clientes', 'credito', 'financas'];
const moreMobileTabs: AdminTab[] = ['rotas', 'comunicacao', 'relatorios', 'seguranca'];

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Centro de comando', subtitle: 'Visão operacional e ações do dia' },
  clientes: { title: 'Clientes e crediário', subtitle: 'Cadastro, limites e classificação de risco' },
  credito: { title: 'Pedidos de crédito', subtitle: 'Solicitações de limite e análise de risco' },
  financas: { title: 'Caixa e parcelas', subtitle: 'Vendas, recebimentos e inadimplência' },
  rotas: { title: 'Rotas de cobrança', subtitle: 'Itinerários e despacho de campo' },
  comunicacao: { title: 'Comunicação', subtitle: 'Régua de cobrança e avisos' },
  relatorios: { title: 'Relatórios', subtitle: '42 relatórios operacionais e financeiros' },
  seguranca: { title: 'Auditoria e segurança', subtitle: 'Logs, RBAC e conformidade LGPD' },
};

export function AdminShell({ activeTab, onTabChange, children, pendingCreditCount = 0 }: AdminShellProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const meta = tabTitles[activeTab];
  const isMoreActive = moreMobileTabs.includes(activeTab);

  const mobilePrimary = navItems.filter((item) => primaryMobileTabs.includes(item.id));
  const mobileMore = navItems.filter((item) => moreMobileTabs.includes(item.id));

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1600px] gap-0 overflow-x-hidden lg:gap-6">
      <aside
        className="hidden lg:flex lg:w-[var(--sidebar-width)] lg:shrink-0 lg:flex-col lg:gap-1 lg:py-6 lg:pl-5"
        aria-label="Navegação administrativa"
      >
        <p className="mb-3 px-3 text-[11px] font-medium text-[var(--text-muted)]">Módulos</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-left transition-colors duration-[var(--duration-fast)]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                active
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))] lg:pb-8">
        <PageHeader title={meta.title} subtitle={meta.subtitle} className="px-3 pt-4 md:px-5 lg:px-0" />
        <main className="min-w-0 overflow-x-hidden px-3 md:px-5 lg:px-0">{children}</main>
      </div>

      <nav
        className="surface-glass fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--surface-border)] dark:border-transparent lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navegação móvel"
      >
        <div className="grid h-[var(--mobile-nav-height)] grid-cols-5">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]',
                  active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                )}
              >
                <span className="relative">
                  <Icon className="size-[18px]" aria-hidden />
                  {item.id === 'credito' && pendingCreditCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-[var(--destructive)] text-[9px] font-bold text-white">
                      {pendingCreditCount > 9 ? '9+' : pendingCreditCount}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate">{item.short}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]',
              isMoreActive || moreOpen ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
            )}
          >
            <LayoutGrid className="size-[18px]" aria-hidden />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={mobileMore}
        activeId={activeTab}
        onSelect={(id) => onTabChange(id as AdminTab)}
        title="Módulos adicionais"
      />
    </div>
  );
}