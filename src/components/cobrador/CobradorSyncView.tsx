import React from 'react';
import { Database, CloudUpload, Trash2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { QueueItem } from '../../lib/indexedDB';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';

interface CobradorSyncViewProps {
  effectiveOnline: boolean;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  pendingSyncs: QueueItem[];
  isSyncing: boolean;
  onSync: () => void;
  onClearQueue: () => void;
}

export function CobradorSyncView({
  effectiveOnline,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  pendingSyncs,
  isSyncing,
  onSync,
  onClearQueue,
}: CobradorSyncViewProps) {
  return (
    <div className="space-y-4 px-1">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-[var(--accent)]" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Sincronização offline</h3>
              <p className="text-xs text-[var(--text-muted)]">IndexedDB + Service Worker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            className={`rounded-[var(--radius-pill)] border px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1 ${
              effectiveOnline
                ? 'border-[var(--success)]/30 bg-[var(--success-subtle)] text-[var(--success)]'
                : 'border-[var(--destructive)]/30 bg-[var(--destructive-subtle)] text-[var(--destructive)]'
            }`}
          >
            {effectiveOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {effectiveOnline ? 'Online' : 'Offline sim.'}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--bg-muted)] px-3 py-2.5">
          <span className="text-xs text-[var(--text-secondary)]">Fila de espera</span>
          <Badge tone={pendingSyncs.length > 0 ? 'warning' : 'success'}>{pendingSyncs.length} item(ns)</Badge>
        </div>

        {pendingSyncs.length > 0 ? (
          <>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {pendingSyncs.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-control)] border border-[var(--border)] p-3 text-xs">
                  <p className="font-semibold text-[var(--text-primary)]">{item.parcela.clienteNome}</p>
                  <p className="text-[var(--text-muted)]">
                    Parcela {item.parcela.numeroParcela}/{item.parcela.totalParcelas} · R$ {item.parcela.valorOriginal.toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClearQueue}>
                <Trash2 className="size-4" />
              </Button>
              <Button type="button" size="sm" fullWidth onClick={onSync} disabled={isSyncing || !effectiveOnline}>
                <CloudUpload className="size-4" />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--success-subtle)] px-3 py-3 text-xs text-[var(--success)]">
            <RefreshCw className="size-4 shrink-0" />
            Todos os recebimentos estão sincronizados.
          </div>
        )}

        <p className="mt-3 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-muted)]">
          Dispositivo: {isOnline ? 'Conectado' : 'Desconectado'}
          {isSimulatedOffline && ' · simulação offline ativa'}
        </p>
      </Panel>
    </div>
  );
}