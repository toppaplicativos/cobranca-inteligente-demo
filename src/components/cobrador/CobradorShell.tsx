import React from 'react';
import { motion } from 'motion/react';
import {
  Home, Map, ListOrdered, CloudUpload, Menu, Wifi, WifiOff, Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export type CobradorTab = 'home' | 'map' | 'stops' | 'sync' | 'menu';

interface CobradorShellProps {
  activeTab: CobradorTab;
  onTabChange: (tab: CobradorTab) => void;
  children: React.ReactNode;
  online: boolean;
  cobradorName: string;
  routeActive: boolean;
  pendingSyncCount: number;
}

const tabs: { id: CobradorTab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'map', label: 'Mapa', icon: Map },
  { id: 'stops', label: 'Paradas', icon: ListOrdered },
  { id: 'sync', label: 'Sync', icon: CloudUpload },
  { id: 'menu', label: 'Menu', icon: Menu },
];

const titles: Record<CobradorTab, string> = {
  home: 'Operação de campo',
  map: 'Mapa da rota',
  stops: 'Paradas ordenadas',
  sync: 'Sincronização',
  menu: 'Menu e avisos',
};

export function CobradorShell({
  activeTab,
  onTabChange,
  children,
  online,
  cobradorName,
  routeActive,
  pendingSyncCount,
}: CobradorShellProps) {
  return (
    <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col">
      <header className="surface-glass sticky top-0 z-20 -mx-3 border-b border-[var(--surface-border)] px-3 py-3 md:-mx-4 md:px-4 dark:border-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Cobrança Inteligente · Campo
            </p>
            <h1 className="truncate text-base font-semibold text-[var(--text-primary)]">{titles[activeTab]}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {routeActive && (
              <span className="flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--accent-subtle)] px-2 py-1 text-[10px] font-semibold text-[var(--accent)]">
                <Sparkles className="size-3" /> Rota ativa
              </span>
            )}
            <span
              className={cn(
                'flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-1 text-[10px] font-bold',
                online
                  ? 'border-[var(--success)]/25 bg-[var(--success-subtle)] text-[var(--success)]'
                  : 'border-[var(--destructive)]/25 bg-[var(--destructive-subtle)] text-[var(--destructive)]'
              )}
            >
              {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{cobradorName}</p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4 pb-24">
        {children}
      </main>

      <nav
        className="surface-glass fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 border-t border-[var(--surface-border)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 dark:border-transparent"
        aria-label="Navegação do cobrador"
      >
        <div className="grid grid-cols-5 gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge = tab.id === 'sync' && pendingSyncCount > 0 ? pendingSyncCount : 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 rounded-[var(--radius-control)] px-1 py-2 text-[10px] font-medium transition',
                  active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="cobrador-nav-pill"
                    className="absolute inset-0 rounded-[var(--radius-control)] bg-[var(--accent-subtle)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center justify-center">
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {badge > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex size-4 items-center justify-center rounded-full bg-[var(--warning)] text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}