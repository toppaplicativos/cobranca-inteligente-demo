import React from 'react';
import { Landmark, ShieldAlert, Compass, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

interface AppHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pwaInstalled: boolean;
  onInstallPwa: () => void;
}

const roles: { id: UserRole; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'ADMIN', label: 'Admin', short: 'Admin', icon: ShieldAlert },
  { id: 'COBRADOR', label: 'Cobrador', short: 'Rota', icon: Compass },
  { id: 'CLIENTE', label: 'Cliente', short: 'Cliente', icon: Smartphone },
];

export function AppHeader({
  currentRole,
  onRoleChange,
  theme,
  onToggleTheme,
  pwaInstalled,
  onInstallPwa,
}: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border)] bg-[var(--bg-sidebar)] text-[var(--text-on-sidebar)]"
      role="banner"
    >
      <div className="mx-auto max-w-[1600px] px-3 pt-2 md:px-5 md:pt-0">
        <div className="flex h-12 items-center justify-between gap-2 md:h-14">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-fg)] md:size-9">
              <Landmark className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Cobrança Inteligente</p>
              <p className="hidden text-[11px] text-[var(--text-on-sidebar-muted)] sm:block">
                Gestão de crediário multiperfil
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {!pwaInstalled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onInstallPwa}
                className="hidden text-[var(--text-on-sidebar-muted)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-on-sidebar)] md:inline-flex"
              >
                <Monitor className="size-3.5" />
                Instalar
              </Button>
            )}
            <IconButton
              label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              onClick={onToggleTheme}
              size="sm"
              className="text-[var(--text-on-sidebar-muted)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-on-sidebar)]"
            >
              {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </IconButton>
          </div>
        </div>

        <nav
          aria-label="Perfil de usuário"
          className="grid grid-cols-3 gap-1 pb-2 md:hidden"
        >
          {roles.map((role) => {
            const Icon = role.icon;
            const active = currentRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleChange(role.id)}
                className={cn(
                  'inline-flex min-h-10 items-center justify-center gap-1 rounded-[var(--radius-control)] px-1 text-[11px] font-medium',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  active
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                    : 'bg-[var(--bg-sidebar-hover)] text-[var(--text-on-sidebar-muted)]'
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{role.short}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <nav
        aria-label="Perfil de usuário"
        className="mx-auto hidden max-w-[1600px] items-center justify-center gap-1 px-5 pb-3 md:flex"
      >
        <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--bg-sidebar-hover)] p-1">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = currentRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleChange(role.id)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3 text-xs font-medium',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  active
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                    : 'text-[var(--text-on-sidebar-muted)] hover:text-[var(--text-on-sidebar)]'
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {role.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}