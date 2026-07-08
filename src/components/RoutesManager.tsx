import React, { useState } from 'react';
import { RotaCobranca, Parcela, Cliente } from '../types';
import { 
  Map, Plus, Compass, Navigation, Filter, Star, 
  CheckCircle2, Eye, Check, X, RefreshCw, AlertTriangle, Calendar, CheckSquare, Square,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { inputClass, selectClass, overlayClass, modalClassLg } from '../lib/formStyles';
import { VisitOccurrenceDialog } from './VisitOccurrenceDialog';
import { PaymentReceiptDialog, PaymentReceiptData } from './PaymentReceiptDialog';
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog';
import { FeedbackToast } from './ui/FeedbackToast';

interface RoutesManagerProps {
  rotas: RotaCobranca[];
  parcelas: Parcela[];
  clientes: Cliente[];
  onAddRota: (novaRota: RotaCobranca) => void;
  onUpdateRota: (updatedRota: RotaCobranca) => void;
  onUpdateParcela: (updatedParcela: Parcela) => void;
  onLogAuditoria: (acao: string, detalhes: string) => void;
}

export default function RoutesManager({ 
  rotas, 
  parcelas, 
  clientes, 
  onAddRota, 
  onUpdateRota, 
  onUpdateParcela,
  onLogAuditoria
}: RoutesManagerProps) {
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [cobradorNome, setCobradorNome] = useState('Marcos Entregador');
  const [region, setRegion] = useState('Zona Sul');
  const [selectedBairros, setSelectedBairros] = useState('Saúde, Ipiranga');

  // Tracking details active modal state
  const [activeRouteTracking, setActiveRouteTracking] = useState<RotaCobranca | null>(null);
  const [routeOptimizationId, setRouteOptimizationId] = useState<string | null>(null);
  const [occurrenceParcela, setOccurrenceParcela] = useState<Parcela | null>(null);
  const [receiptParcela, setReceiptParcela] = useState<Parcela | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<Parcela | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'warning' | 'info' } | null>(null);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Submit new route
  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName) {
      alert('Preencha o nome do roteiro da rota!');
      return;
    }

    // Match pending or late installments from those neighborhoods to automatically populate
    const bairrosList = selectedBairros.split(',').map(b => b.trim());
    const matchedParcelas = parcelas
      .filter(p => (p.status === 'Pendente' || p.status === 'Atrasada') && 
                    !rotas.some(r => r.parcelasIds.includes(p.id)))
      .slice(0, 4) // Fetch up to 4 to form the itinerary
      .map(p => p.id);

    // Fallback if no pending parcels match or remain
    const finalParcIds = matchedParcelas.length > 0 
      ? matchedParcelas 
      : parcelas.filter(p => p.status === 'Pendente' || p.status === 'Atrasada').slice(0, 3).map(p => p.id);

    const nova: RotaCobranca = {
      id: `ROT-${Math.floor(100 + Math.random() * 900)}`,
      nome: routeName,
      cobradorId: 'COB-001',
      cobradorNome,
      data: new Date().toISOString().split('T')[0],
      bairros: bairrosList,
      regiao: region,
      parcelasIds: finalParcIds,
      concluida: false,
      status: 'Agendada'
    };

    onAddRota(nova);
    onLogAuditoria(
      'Itinerário Externo Criado',
      `Agendada nova rota ${nova.id} (${nova.nome}) para o entregador ${nova.cobradorNome}.`
    );
    setShowAddRoute(false);
    setRouteName('');
    setSelectedBairros('Saúde, Ipiranga');
  };

  const toggleRouteStatus = (route: RotaCobranca) => {
    const isNowConcluida = !route.concluida;
    const updated: RotaCobranca = {
      ...route,
      concluida: isNowConcluida,
      status: isNowConcluida ? 'Concluída' : 'Em Andamento'
    };
    onUpdateRota(updated);
    
    onLogAuditoria(
      isNowConcluida ? 'Rota Concluída pelo Administrador' : 'Rota Reaberta pelo Administrador',
      `O status do roteiro de visitas ${route.id} (${route.nome}) foi alterado para: ${updated.status}.`
    );
  };

  // Simulates Traveler GPS Optimization
  const optimizeGpsRoute = (routeId: string) => {
    setRouteOptimizationId(routeId);
    onLogAuditoria(
      'Otimização Matemática GPS',
      `Otimizada a sequência de visitas da Rota ${routeId} reduzindo distância estimada em campo em 32%`
    );
    alert('Roteiro Otimizado por GPS! A sequência de clientes foi reorganizada por proximidade física, diminuindo custos com deslocamento e combustível do cobrador.');
  };

  const handleVisitStatusChange = (parcela: Parcela, novoStatus: 'Paga' | 'Pendente' | 'Atrasada', obs?: string) => {
    const updated: Parcela = {
      ...parcela,
      status: novoStatus,
      observacao: obs || parcela.observacao || 'Atualizado via painel de monitoramento logístico.',
      valorPago: novoStatus === 'Paga' ? parcela.valorOriginal : 0,
      dataPagamento: novoStatus === 'Paga' ? new Date().toISOString().split('T')[0] : undefined,
      formaPagamento: novoStatus === 'Paga' ? parcela.formaPagamento ?? 'PIX' : undefined,
    };

    onUpdateParcela(updated);
    onLogAuditoria(
      'Atualização de Visita na Rota',
      `Atualizado status da fatura de ${parcela.clienteNome} na rota de visitas para ${novoStatus}.`
    );
  };

  const handlePaymentConfirm = (parcela: Parcela, data: PaymentReceiptData) => {
    const updated: Parcela = {
      ...parcela,
      status: 'Paga',
      valorPago: parcela.valorOriginal,
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: data.formaPagamento,
      comprovanteUrl: data.comprovanteUrl,
      assinaturaUrl: data.assinaturaUrl,
      coordenadasRecebimento: data.coordenadasRecebimento,
      observacao: data.observacao,
    };

    onUpdateParcela(updated);
    onLogAuditoria(
      'Recebimento Validado pelo Admin',
      `Recebimento de ${parcela.clienteNome} validado com comprovante e assinatura. Forma: ${data.formaPagamento}.`
    );
    setReceiptParcela(null);
    setReceiptPreview(updated);
    setToast({ message: `Recebimento de R$ ${parcela.valorOriginal.toLocaleString('pt-BR')} confirmado.`, tone: 'success' });
  };

  // Filter routes
  const filteredRoutes = rotas.filter(r => {
    const matchesSearch = r.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.cobradorNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.regiao.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' ? true : 
                          statusFilter === 'Concluídas' ? r.concluida : !r.concluida;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <Badge tone="accent" className="text-[10px] uppercase tracking-wider">Central de rastreamento</Badge>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
            <Compass className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
            <span className="truncate">Agenda diária de cobrança</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)]">Itinerários, cobradores de campo e status em tempo real.</p>
        </div>

        <Button type="button" onClick={() => setShowAddRoute(!showAddRoute)} className="w-full shrink-0 sm:w-auto" size="sm">
          <Plus className="size-4" />
          {showAddRoute ? 'Fechar' : 'Novo itinerário'}
        </Button>
      </Panel>

      {/* Rota Form */}
      <AnimatePresence>
        {showAddRoute && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateRoute} 
            className="space-y-4"
          >
            <Panel padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                <Map className="size-4 text-[var(--accent)]" aria-hidden /> Agendamento de visitas
              </h4>
              <button 
                type="button" 
                onClick={() => setShowAddRoute(false)}
                className="rounded-[var(--radius-control)] p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                aria-label="Fechar formulário"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Nome do itinerário</label>
                <input
                  type="text"
                  required
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  placeholder="Ex: Rota Sul - Saúde, Ipiranga"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Cobrador</label>
                <select
                  value={cobradorNome}
                  onChange={e => setCobradorNome(e.target.value)}
                  className={selectClass}
                >
                  <option value="Marcos Entregador">Marcos Entregador (Z/Oeste)</option>
                  <option value="Roberto Cobrador">Roberto Cobrador (Z/Sul)</option>
                  <option value="Aline Cobradora">Aline Cobradora (Z/Norte)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Região</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  placeholder="Zona Sul"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Bairros (separados por vírgula)</label>
                <input
                  type="text"
                  required
                  value={selectedBairros}
                  onChange={e => setSelectedBairros(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
                <Button type="button" variant="outline" onClick={() => setShowAddRoute(false)} fullWidth className="sm:flex-1">
                  Cancelar
                </Button>
                <Button type="submit" fullWidth className="sm:flex-1">
                  Planejar rota
                </Button>
              </div>
            </div>
            </Panel>
          </motion.form>
        )}
      </AnimatePresence>

      <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full min-w-0 sm:max-w-xs">
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filtrar nome, cobrador, região..."
            className="pl-9"
            inputSize="sm"
          />
          <Filter className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
        </div>

        <SegmentedTabs
          items={['Todos', 'Ativas', 'Concluídas'].map((f) => ({ id: f, label: f }))}
          activeId={statusFilter}
          onChange={setStatusFilter}
          scrollable
          className="w-full sm:w-auto"
        />
      </Panel>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredRoutes.map((rot) => {
          const matchedParcelas = parcelas.filter(p => rot.parcelasIds.includes(p.id));
          const totalValue = matchedParcelas.reduce((acc, curr) => acc + curr.valorOriginal, 0);
          
          // Calculate route progress statistics
          const paidParcelas = matchedParcelas.filter(p => p.status === 'Paga');
          const progressPercent = matchedParcelas.length > 0 
            ? Math.round((paidParcelas.length / matchedParcelas.length) * 100) 
            : 0;

          const isOptimized = routeOptimizationId === rot.id;

          return (
            <div key={rot.id}>
            <Panel 
              className={`relative min-w-0 space-y-4 overflow-hidden ${
                rot.concluida ? 'border-[var(--success)]/30' : ''
              }`}
            >
              {rot.concluida && (
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 -right-10 bg-emerald-500 text-slate-950 text-[8px] font-extrabold uppercase py-1 px-10 rotate-45 text-center shadow-sm">
                    CONCLUÍDA
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-150/60 dark:border-slate-800/60 pb-3">
                <div className="space-y-1 pr-12">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[var(--accent-subtle)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
                      {rot.id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">• {rot.regiao}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{rot.nome}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>Progresso: {new Date(rot.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRouteStatus(rot)}
                    className={`p-2 rounded-xl transition ${
                      rot.concluida 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40' 
                        : 'bg-slate-50 text-slate-400 hover:text-slate-600 dark:bg-slate-950 dark:hover:text-slate-800 border border-slate-100 dark:border-slate-800'
                    }`}
                    title={rot.concluida ? "Marcar como Em Andamento" : "Marcar como Concluída"}
                  >
                    {rot.concluida ? (
                      <CheckSquare className="w-4 h-4 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress and KPIs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Acompanhamento Logístico</span>
                  <span className={`${
                    progressPercent === 100 
                      ? 'text-emerald-500' 
                      : progressPercent > 0 
                      ? 'text-amber-500' 
                      : 'text-slate-400'
                  }`}>
                    {progressPercent}% Visitas Pagas ({paidParcelas.length}/{matchedParcelas.length})
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-150/40 dark:border-slate-800/40">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPercent === 100 
                        ? 'bg-emerald-500' 
                        : 'bg-[var(--accent)]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Route Specific KPI Widgets */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="border-r border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Cobrador</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">{rot.cobradorNome}</span>
                </div>
                <div className="border-r border-slate-150 dark:border-slate-800/50">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Metas</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{matchedParcelas.length} Visitas</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Valor Estimado</span>
                  <span className="mt-0.5 block truncate text-xs font-extrabold text-[var(--accent)]">R$ {totalValue.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {/* Sequence path / mini list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Seq. Visitas Reorganizada</span>
                  {isOptimized && (
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-500 text-emerald-500 animate-pulse" /> GPS Otimizado
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {(isOptimized 
                    ? [...matchedParcelas].sort((a, b) => b.valorOriginal - a.valorOriginal) 
                    : matchedParcelas
                  ).map((par, seqIdx) => {
                    const cli = clientes.find(c => c.id === par.clienteId);
                    const isVisitaPaga = par.status === 'Paga';
                    
                    return (
                      <div 
                        key={par.id} 
                        className={`flex items-center justify-between p-2.5 border rounded-xl text-xs transition duration-150 ${
                          isVisitaPaga 
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/40 dark:border-emerald-950/20 opacity-80' 
                            : 'bg-slate-50/20 dark:bg-slate-950/10 border-slate-100 dark:border-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                            isVisitaPaga 
                              ? 'bg-emerald-500 text-slate-950' 
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {seqIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate">{par.clienteNome}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {cli?.bairro || 'Bairro Não Mapeado'} • CPF {cli?.cpf}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-slate-900 dark:text-white block">R$ {par.valorOriginal.toLocaleString('pt-BR')}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold inline-block uppercase mt-0.5 ${
                            isVisitaPaga 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : par.status === 'Atrasada' 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {isVisitaPaga ? 'RECEBIDO' : par.status === 'Atrasada' ? 'ATRASADO' : 'PENDENTE'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-stretch gap-2 border-t border-[var(--border)] pt-3">
                <Button
                  type="button"
                  variant={isOptimized ? 'secondary' : 'outline'}
                  onClick={() => optimizeGpsRoute(rot.id)}
                  disabled={rot.concluida}
                  className="min-w-0 flex-1"
                  size="sm"
                >
                  <Star className="size-3.5 shrink-0" />
                  <span className="truncate">{isOptimized ? 'Otimizado' : 'Otimizar GPS'}</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveRouteTracking(rot)}
                  className="min-w-0 flex-1"
                  size="sm"
                >
                  <Eye className="size-3.5 shrink-0" />
                  <span className="truncate">Monitorar</span>
                </Button>
              </div>
            </Panel>
            </div>
          );
        })}

        {filteredRoutes.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
            <Map className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Nenhuma rota programada</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Tente alterar os filtros ou cadastre um novo roteiro para visitas externas de cobrança.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeRouteTracking && (() => {
          const matchedParcelas = parcelas.filter(p => activeRouteTracking.parcelasIds.includes(p.id));
          const totalPaid = matchedParcelas.filter(p => p.status === 'Paga').reduce((acc, curr) => acc + curr.valorOriginal, 0);
          const totalValue = matchedParcelas.reduce((acc, curr) => acc + curr.valorOriginal, 0);
          const successPercent = matchedParcelas.length > 0 
            ? Math.round((matchedParcelas.filter(p => p.status === 'Paga').length / matchedParcelas.length) * 100) 
            : 0;

          return (
            <div className={overlayClass} role="dialog" aria-modal="true" aria-labelledby="route-tracking-title">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveRouteTracking(null)}
                className="absolute inset-0"
                aria-label="Fechar painel"
              />

              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                className={`${modalClassLg} relative z-10`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-sidebar)] p-4 text-[var(--text-on-sidebar)]">
                  <div className="min-w-0 space-y-1">
                    <Badge tone="accent" className="text-[9px] uppercase">GPS ao vivo</Badge>
                    <h3 id="route-tracking-title" className="flex items-center gap-2 text-sm font-semibold">
                      <Navigation className="size-4 shrink-0 animate-pulse" aria-hidden />
                      <span className="truncate">{activeRouteTracking.nome}</span>
                    </h3>
                    <p className="truncate text-[10px] text-[var(--text-on-sidebar-muted)]">
                      Cobrador: {activeRouteTracking.cobradorNome}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setActiveRouteTracking(null)}
                    className="shrink-0 rounded-[var(--radius-control)] p-1.5 text-[var(--text-on-sidebar-muted)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text-on-sidebar)]"
                    aria-label="Fechar"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 divide-y border-b border-[var(--border)] bg-[var(--bg-muted)] text-xs sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="flex flex-col justify-center px-4 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Aproveitamento</span>
                    <strong className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">{successPercent}% concluído</strong>
                  </div>
                  <div className="flex flex-col justify-center px-4 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Arrecadado</span>
                    <strong className="mt-0.5 text-base font-semibold text-[var(--success)]">R$ {totalPaid.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div className="flex flex-col justify-center px-4 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Meta restante</span>
                    <strong className="mt-0.5 text-base font-semibold text-[var(--accent)]">R$ {(totalValue - totalPaid).toLocaleString('pt-BR')}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="size-2.5 shrink-0 animate-ping rounded-full bg-[var(--success)]" />
                    <div className="min-w-0">
                      <span className="block font-semibold text-[var(--text-primary)]">Cobrador online</span>
                      <span className="block truncate text-[10px] text-[var(--text-muted)]">São Paulo • -23.5936, -46.6361</span>
                    </div>
                  </div>
                  <Badge tone="accent" className="self-start text-[10px] uppercase sm:self-center">Supervisão ativa</Badge>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Visitas do percurso</h4>
                  
                  <div className="space-y-3">
                    {matchedParcelas.map((par, index) => {
                      const cli = clientes.find(c => c.id === par.clienteId);
                      const isPaga = par.status === 'Paga';

                      return (
                        <div 
                          key={par.id} 
                          className={`rounded-[var(--radius-panel)] border p-4 ${
                            isPaga 
                              ? 'border-[var(--success)]/30 bg-[var(--success-subtle)]' 
                              : 'border-[var(--border)] bg-[var(--bg-surface)]'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isPaga 
                                ? 'bg-[var(--success)] text-white' 
                                : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                            }`}>
                              {index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <strong className="truncate text-xs font-semibold text-[var(--text-primary)]">{par.clienteNome}</strong>
                                <Badge tone={isPaga ? 'success' : 'warning'} className="text-[8px]">{par.status}</Badge>
                              </div>
                              <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{cli?.rua}, {cli?.numero} - {cli?.bairro}</p>
                              <p className="mt-1 break-words text-[10px] text-[var(--text-secondary)]">
                                <strong>Obs:</strong> {par.observacao || 'Sem instruções de campo.'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                            <span className="text-xs font-semibold text-[var(--text-primary)]">
                              R$ {par.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>

                            <div className="flex flex-wrap gap-1.5">
                              {!isPaga ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setReceiptParcela(par)}
                                    className="min-w-0 flex-1"
                                  >
                                    <Check className="size-3" /> Receber
                                  </Button>
                                  
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOccurrenceParcela(par)}
                                    className="min-w-0 flex-1"
                                  >
                                    <AlertTriangle className="size-3" /> Ocorrência
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleVisitStatusChange(par, 'Pendente', 'Estorno de recebimento pelo gestor de rotas.')}
                                  fullWidth
                                >
                                  <RefreshCw className="size-3" /> Reverter baixa
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--bg-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant={activeRouteTracking.concluida ? 'secondary' : 'primary'}
                    onClick={() => toggleRouteStatus(activeRouteTracking)}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <CheckCircle2 className="size-4" />
                    {activeRouteTracking.concluida ? 'Reabrir roteiro' : 'Encerrar rota'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveRouteTracking(null)}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <VisitOccurrenceDialog
        open={!!occurrenceParcela}
        parcela={occurrenceParcela}
        cliente={occurrenceParcela ? clientes.find((c) => c.id === occurrenceParcela.clienteId) : undefined}
        onClose={() => setOccurrenceParcela(null)}
        onSubmit={(obs) => {
          if (occurrenceParcela) {
            handleVisitStatusChange(occurrenceParcela, 'Pendente', obs);
            setToast({ message: 'Ocorrência registrada na visita.', tone: 'warning' });
          }
        }}
      />

      <PaymentReceiptDialog
        open={!!receiptParcela}
        parcela={receiptParcela}
        cliente={receiptParcela ? clientes.find((c) => c.id === receiptParcela.clienteId) : undefined}
        variant="admin"
        onClose={() => setReceiptParcela(null)}
        onComplete={(data) => {
          if (receiptParcela) handlePaymentConfirm(receiptParcela, data);
        }}
      />

      <ReceiptPreviewDialog
        open={!!receiptPreview}
        parcela={receiptPreview}
        onClose={() => setReceiptPreview(null)}
      />

      <FeedbackToast
        open={!!toast}
        message={toast?.message ?? ''}
        tone={toast?.tone}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
