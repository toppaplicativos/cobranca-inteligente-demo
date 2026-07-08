import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RotaCobranca, Parcela, Cliente, AvisoGlobal } from '../types';
import {
  addPendingPayment, getPendingPayments, removePendingPayment,
  clearQueue, QueueItem,
} from '../lib/indexedDB';
import { buildSmartRoute, RouteStop } from '../lib/smartRoute';
import { PaymentReceiptDialog, PaymentReceiptData } from './PaymentReceiptDialog';
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog';
import { VisitOccurrenceDialog } from './VisitOccurrenceDialog';
import { FeedbackToast } from './ui/FeedbackToast';
import { CobradorShell, CobradorTab } from './cobrador/CobradorShell';
import { CobradorHomeView } from './cobrador/CobradorHomeView';
import { CobradorMapView } from './cobrador/CobradorMapView';
import { CobradorStopsView } from './cobrador/CobradorStopsView';
import { CobradorSyncView } from './cobrador/CobradorSyncView';
import { CobradorMenuView } from './cobrador/CobradorMenuView';
import { RouteLaunchOverlay } from './cobrador/RouteLaunchOverlay';

interface CobradorAppProps {
  rotas: RotaCobranca[];
  parcelas: Parcela[];
  clientes: Cliente[];
  avisos: AvisoGlobal[];
  onUpdateParcela: (parcela: Parcela) => void;
  onLogAuditoria: (acao: string, detalhes: string) => void;
}

export default function CobradorApp({
  rotas,
  parcelas,
  clientes,
  avisos,
  onUpdateParcela,
  onLogAuditoria,
}: CobradorAppProps) {
  const [activeTab, setActiveTab] = useState<CobradorTab>('home');
  const [selectedRotaId, setSelectedRotaId] = useState('ROT-001');
  const [routeActive, setRouteActive] = useState(false);
  const [routeEngaged, setRouteEngaged] = useState(false);
  const [launchOpen, setLaunchOpen] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const [receiptParcela, setReceiptParcela] = useState<Parcela | null>(null);
  const [occurrenceParcela, setOccurrenceParcela] = useState<Parcela | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<Parcela | null>(null);
  const paidParcelaRef = useRef<Parcela | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [pendingSyncs, setPendingSyncs] = useState<QueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'warning' | 'info' } | null>(null);

  const effectiveOnline = isOnline && !isSimulatedOffline;
  const activeRota = rotas.find((r) => r.id === selectedRotaId) ?? rotas[0];
  const rotaParcelas = parcelas.filter((p) => activeRota?.parcelasIds.includes(p.id));

  const smartStops = useMemo(
    () => buildSmartRoute(rotaParcelas, clientes),
    [rotaParcelas, clientes, parcelas]
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingSyncs = async () => {
    try {
      const items = await getPendingPayments();
      setPendingSyncs(items);
    } catch (err) {
      console.error('Erro ao buscar fila do IndexedDB:', err);
    }
  };

  useEffect(() => { refreshPendingSyncs(); }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('cobranca-sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_ITEM_SUCCESS' || event.data?.type === 'SYNC_ALL_COMPLETE') {
        refreshPendingSyncs();
      }
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    setRouteActive(false);
    setRouteEngaged(false);
    setCurrentStopIndex(0);
  }, [selectedRotaId]);

  useEffect(() => {
    if (effectiveOnline && pendingSyncs.length > 0) triggerSync();
  }, [effectiveOnline]);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
        if (reg.sync) {
          await reg.sync.register('sync-recebimentos');
          setTimeout(async () => {
            await refreshPendingSyncs();
            setIsSyncing(false);
          }, 1500);
          return;
        }
      } catch {
        /* fallback */
      }
    }
    await fallbackManualSync();
  };

  const fallbackManualSync = async () => {
    if (navigator.serviceWorker?.controller) {
      return new Promise<void>((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = () => {
          refreshPendingSyncs();
          setIsSyncing(false);
          resolve();
        };
        navigator.serviceWorker!.controller!.postMessage({ type: 'REQUEST_SYNC' }, [messageChannel.port2]);
      });
    }
    const items = await getPendingPayments();
    for (const item of items) {
      onUpdateParcela({ ...item.parcela, syncPending: false });
      onLogAuditoria('Sincronização em Campo', `Sincronizado ${item.parcela.clienteNome}`);
      await removePendingPayment(item.id);
    }
    await refreshPendingSyncs();
    setIsSyncing(false);
  };

  const handleClearQueue = async () => {
    await clearQueue();
    await refreshPendingSyncs();
    setToast({ message: 'Fila offline limpa.', tone: 'info' });
  };

  const advanceAfterVisit = (parcelaId: string) => {
    const idx = smartStops.findIndex((s) => s.parcela.id === parcelaId);
    if (idx >= 0 && idx === currentStopIndex) {
      const next = smartStops.findIndex((s, i) => i > idx && (s.parcela.status !== 'Paga' || s.parcela.syncPending));
      setCurrentStopIndex(next >= 0 ? next : smartStops.length);
    }
  };

  const handlePaymentComplete = async (data: PaymentReceiptData) => {
    if (!receiptParcela) return;
    const updated: Parcela = {
      ...receiptParcela,
      status: 'Paga',
      valorPago: receiptParcela.valorOriginal,
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: data.formaPagamento,
      comprovanteUrl: data.comprovanteUrl,
      assinaturaUrl: data.assinaturaUrl,
      coordenadasRecebimento: data.coordenadasRecebimento,
      observacao: data.observacao,
      syncPending: !effectiveOnline,
    };

    if (!effectiveOnline) {
      await addPendingPayment(updated);
      onUpdateParcela(updated);
      await refreshPendingSyncs();
      onLogAuditoria('Recebimento Offline', `${receiptParcela.clienteNome} — IndexedDB`);
      setToast({ message: `R$ ${receiptParcela.valorOriginal.toLocaleString('pt-BR')} salvo offline.`, tone: 'warning' });
    } else {
      onUpdateParcela(updated);
      onLogAuditoria('Recebimento em Campo', `${receiptParcela.clienteNome} — R$ ${receiptParcela.valorOriginal.toLocaleString('pt-BR')}`);
      setToast({ message: 'Recebimento confirmado!', tone: 'success' });
    }

    advanceAfterVisit(receiptParcela.id);
    paidParcelaRef.current = updated;
  };

  const handleOccurrence = (obs: string) => {
    if (!occurrenceParcela) return;
    onUpdateParcela({ ...occurrenceParcela, observacao: obs });
    onLogAuditoria('Ocorrência em Campo', `${occurrenceParcela.clienteNome}: ${obs}`);
    setToast({ message: 'Ocorrência registrada.', tone: 'warning' });
    setOccurrenceParcela(null);
  };

  const handleReceiptDialogClose = () => {
    setReceiptParcela(null);
    if (paidParcelaRef.current) {
      setReceiptPreview(paidParcelaRef.current);
      paidParcelaRef.current = null;
    }
  };

  const openFromStop = (stop: RouteStop, action: 'receive' | 'occurrence') => {
    if (action === 'receive') setReceiptParcela(stop.parcela);
    else setOccurrenceParcela(stop.parcela);
  };

  const handleNavigate = (stop: RouteStop) => {
    const coords = stop.cliente.coordenadasGps;
    if (coords) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
    } else {
      setToast({ message: 'GPS do cliente indisponível.', tone: 'info' });
    }
  };

  const handleLaunchComplete = () => {
    setLaunchOpen(false);
    setRouteActive(true);
    setRouteEngaged(false);
    setCurrentStopIndex(0);
    onLogAuditoria('Rota Inteligente Iniciada', `${activeRota?.nome} — ${smartStops.length} paradas · meta R$ 5.780,00`);
    setToast({ message: 'Rota otimizada! Confirme para ir à primeira parada.', tone: 'success' });
  };

  const handleStartFirstStop = () => {
    setRouteEngaged(true);
    setActiveTab('home');
    setToast({ message: `Indo para ${smartStops[0]?.cliente.nome ?? 'primeira parada'}…`, tone: 'info' });
  };

  return (
    <>
      <CobradorShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        online={effectiveOnline}
        cobradorName={activeRota?.cobradorNome ?? 'Cobrador'}
        routeActive={routeActive}
        pendingSyncCount={pendingSyncs.length}
      >
        {activeTab === 'home' && (
          <CobradorHomeView
            rotas={rotas}
            selectedRotaId={selectedRotaId}
            onSelectRota={setSelectedRotaId}
            routeActive={routeActive}
            routeEngaged={routeEngaged}
            stops={smartStops}
            currentIndex={currentStopIndex}
            onLaunchRoute={() => setLaunchOpen(true)}
            onStartFirstStop={handleStartFirstStop}
            onReceive={(s) => openFromStop(s, 'receive')}
            onOccurrence={(s) => openFromStop(s, 'occurrence')}
            onNavigate={handleNavigate}
          />
        )}
        {activeTab === 'map' && (
          <CobradorMapView
            stops={smartStops}
            currentIndex={currentStopIndex}
            routeName={activeRota?.nome ?? 'Rota'}
          />
        )}
        {activeTab === 'stops' && (
          <CobradorStopsView
            stops={smartStops}
            currentIndex={currentStopIndex}
            onSelectStop={(i) => {
              setCurrentStopIndex(i);
              setActiveTab('home');
            }}
          />
        )}
        {activeTab === 'sync' && (
          <CobradorSyncView
            effectiveOnline={effectiveOnline}
            isOnline={isOnline}
            isSimulatedOffline={isSimulatedOffline}
            onToggleSimulatedOffline={() => setIsSimulatedOffline((v) => !v)}
            pendingSyncs={pendingSyncs}
            isSyncing={isSyncing}
            onSync={triggerSync}
            onClearQueue={handleClearQueue}
          />
        )}
        {activeTab === 'menu' && <CobradorMenuView avisos={avisos} />}
      </CobradorShell>

      <RouteLaunchOverlay
        open={launchOpen}
        stops={smartStops}
        routeName={activeRota?.nome ?? 'Rota'}
        onComplete={handleLaunchComplete}
        onClose={() => setLaunchOpen(false)}
      />

      <PaymentReceiptDialog
        open={!!receiptParcela}
        parcela={receiptParcela}
        cliente={receiptParcela ? clientes.find((c) => c.id === receiptParcela.clienteId) : undefined}
        variant="field"
        isOffline={!effectiveOnline}
        onClose={handleReceiptDialogClose}
        onComplete={handlePaymentComplete}
      />

      <VisitOccurrenceDialog
        open={!!occurrenceParcela}
        parcela={occurrenceParcela}
        cliente={occurrenceParcela ? clientes.find((c) => c.id === occurrenceParcela.clienteId) : undefined}
        onClose={() => setOccurrenceParcela(null)}
        onSubmit={handleOccurrence}
      />

      <ReceiptPreviewDialog
        open={!!receiptPreview}
        parcela={receiptPreview}
        onClose={() => setReceiptPreview(null)}
        onShare={() => {
          setToast({ message: 'Comprovante enviado por WhatsApp.', tone: 'success' });
          setReceiptPreview(null);
        }}
      />

      <FeedbackToast
        open={!!toast}
        message={toast?.message ?? ''}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </>
  );
}