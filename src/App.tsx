import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CLIENTES, 
  INITIAL_PARCELAS, 
  INITIAL_VENDAS, 
  INITIAL_ROTAS, 
  INITIAL_LOGS, 
  INITIAL_SOLICITACOES,
  INITIAL_NOTIFICACOES,
  INITIAL_AVISOS,
  INITIAL_INTERACOES
} from './data/mockData';
import { Cliente, Parcela, Venda, RotaCobranca, LogAuditoria, SolicitacaoLimite, UserRole, NotificacaoEnviada, AvisoGlobal, InteracaoCobranca } from './types';

// Icons
import { 
  Users, Landmark, Compass, FileSpreadsheet, ShieldAlert, Sun, Moon, 
  Monitor, CheckCircle, Smartphone, AlertCircle, Trash2, Edit2, Search, Plus, 
  Lock, KeyRound, Bell, MessageSquare, Menu, X, Star, Coins, TrendingUp, Sparkles,
  Send, MapPin, Zap, ShieldCheck, ClipboardCheck, PlayCircle, Clock, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import KPIs from './components/KPIs';
import Charts from './components/Charts';
import ClientForm from './components/ClientForm';
import FinancialOps from './components/FinancialOps';
import ReportsExplorer from './components/ReportsExplorer';
import RoutesManager from './components/RoutesManager';
import CobradorApp from './components/CobradorApp';
import ClienteApp from './components/ClienteApp';
import CommunicationPanel from './components/CommunicationPanel';
import { CommandActions } from './components/admin/CommandActions';
import { CreditRequestsPanel } from './components/admin/CreditRequestsPanel';
import { CreditRequestCard } from './components/admin/CreditRequestCard';
import { CreditReviewDialog } from './components/admin/CreditReviewDialog';
import { QuickClientRegister } from './components/admin/QuickClientRegister';
import { AppHeader } from './components/layout/AppHeader';
import { NotificationBar } from './components/layout/NotificationBar';
import { AdminShell } from './components/layout/AdminShell';
import { MobileFrame } from './components/layout/MobileFrame';
import { Panel } from './components/ui/Panel';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Badge } from './components/ui/Badge';
import { SegmentedTabs } from './components/ui/SegmentedTabs';

export default function App() {
  // Global States
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const cached = localStorage.getItem('cobranca_clientes');
    return cached ? JSON.parse(cached) : INITIAL_CLIENTES;
  });

  const [parcelas, setParcelas] = useState<Parcela[]>(() => {
    const cached = localStorage.getItem('cobranca_parcelas');
    return cached ? JSON.parse(cached) : INITIAL_PARCELAS;
  });

  const [vendas, setVendas] = useState<Venda[]>(() => {
    const cached = localStorage.getItem('cobranca_vendas');
    return cached ? JSON.parse(cached) : INITIAL_VENDAS;
  });

  const [rotas, setRotas] = useState<RotaCobranca[]>(() => {
    const cached = localStorage.getItem('cobranca_rotas');
    return cached ? JSON.parse(cached) : INITIAL_ROTAS;
  });

  const [logs, setLogs] = useState<LogAuditoria[]>(() => {
    const cached = localStorage.getItem('cobranca_logs');
    return cached ? JSON.parse(cached) : INITIAL_LOGS;
  });

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoLimite[]>(() => {
    const cached = localStorage.getItem('cobranca_solicitacoes');
    return cached ? JSON.parse(cached) : INITIAL_SOLICITACOES;
  });

  const [notificacoes, setNotificacoes] = useState<NotificacaoEnviada[]>(() => {
    const cached = localStorage.getItem('cobranca_notificacoes');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICACOES;
  });

  const [avisos, setAvisos] = useState<AvisoGlobal[]>(() => {
    const cached = localStorage.getItem('cobranca_avisos');
    return cached ? JSON.parse(cached) : INITIAL_AVISOS;
  });

  const [interacoes, setInteracoes] = useState<InteracaoCobranca[]>(() => {
    const cached = localStorage.getItem('cobranca_interacoes');
    return cached ? JSON.parse(cached) : INITIAL_INTERACOES;
  });

  // UI States
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('cobranca_theme');
    return (cached as any) || 'light';
  });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'clientes' | 'credito' | 'financas' | 'rotas' | 'relatorios' | 'seguranca' | 'comunicacao'>('dashboard');
  const [clientesView, setClientesView] = useState<'lista' | 'cadastro-rapido' | 'cadastro-completo'>('lista');
  const [dashboardReviewId, setDashboardReviewId] = useState<string | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Cliente | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [notification, setNotification] = useState<string | null>(
    'Bem-vindo ao aplicativo Cobrança Inteligente! Explore os perfis de usuário usando a barra superior.'
  );

  // New UI states for Credit Adjustments and "Ações do Dia"
  const [selectedClientForCreditAdjust, setSelectedClientForCreditAdjust] = useState<Cliente | null>(null);
  const [showMassRemindersModal, setShowMassRemindersModal] = useState(false);
  const [showMassBlockModal, setShowMassBlockModal] = useState(false);
  const [showRouteDispatchModal, setShowRouteDispatchModal] = useState(false);
  const [showAiCalibrationModal, setShowAiCalibrationModal] = useState(false);
  const [reminderProgress, setReminderProgress] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Synced state variables for the quick credit adjustment form
  const [adjustLimit, setAdjustLimit] = useState(0);
  const [adjustScore, setAdjustScore] = useState(0);
  const [adjustStatus, setAdjustStatus] = useState<string>('Ativo');
  const [adjustRiskScore, setAdjustRiskScore] = useState<string>('Médio');

  useEffect(() => {
    if (selectedClientForCreditAdjust) {
      setAdjustLimit(selectedClientForCreditAdjust.limiteCredito);
      setAdjustScore(selectedClientForCreditAdjust.scoreInterno);
      setAdjustStatus(selectedClientForCreditAdjust.status);
      setAdjustRiskScore(selectedClientForCreditAdjust.scoreRisco);
    }
  }, [selectedClientForCreditAdjust]);

  // Search/Filters for admin clientes list
  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [filterRisco, setFilterRisco] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('cobranca_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('cobranca_parcelas', JSON.stringify(parcelas));
  }, [parcelas]);

  useEffect(() => {
    localStorage.setItem('cobranca_vendas', JSON.stringify(vendas));
  }, [vendas]);

  useEffect(() => {
    localStorage.setItem('cobranca_rotas', JSON.stringify(rotas));
  }, [rotas]);

  useEffect(() => {
    localStorage.setItem('cobranca_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('cobranca_solicitacoes', JSON.stringify(solicitacoes));
  }, [solicitacoes]);

  useEffect(() => {
    localStorage.setItem('cobranca_notificacoes', JSON.stringify(notificacoes));
  }, [notificacoes]);

  useEffect(() => {
    localStorage.setItem('cobranca_avisos', JSON.stringify(avisos));
  }, [avisos]);

  useEffect(() => {
    localStorage.setItem('cobranca_interacoes', JSON.stringify(interacoes));
  }, [interacoes]);

  // Escuta o Service Worker via BroadcastChannel para sincronização automática em segundo plano
  useEffect(() => {
    const channel = new BroadcastChannel('cobranca-sync');
    
    channel.onmessage = (event) => {
      if (event.data) {
        if (event.data.type === 'SYNC_ITEM_SUCCESS') {
          const { parcelaId, parcela } = event.data;
          
          // Remove a tag de pendente de sincronização
          const updatedParcela: Parcela = {
            ...parcela,
            syncPending: false
          };
          
          // Atualiza a parcela na lista global
          setParcelas(prev => prev.map(p => p.id === parcelaId ? updatedParcela : p));
          
          // Registra log de auditoria de sucesso de sincronização
          const logMsg = `Sincronizador em segundo plano enviou para o servidor o recebimento de ${parcela.clienteNome} (R$ ${parcela.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
          
          const newLog: LogAuditoria = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            usuario: 'marcos.cobrador@cobranca.com.br',
            papel: 'Entregador / Cobrador',
            acao: 'Sincronização offline bem-sucedida',
            detalhes: logMsg,
            ip: '127.0.0.1 (Service Worker Sync)'
          };
          
          setLogs(prev => [newLog, ...prev]);
          setNotification(`Recebimento de ${parcela.clienteNome} foi sincronizado automaticamente com o servidor!`);
        } else if (event.data.type === 'SYNC_ALL_COMPLETE') {
          const { count } = event.data;
          if (count > 0) {
            setNotification(`Sincronização em segundo plano bem-sucedida! ${count} parcela(s) enviadas ao servidor.`);
          }
        }
      }
    };
    
    return () => {
      channel.close();
    };
  }, []);

  // Apply Theme Mode Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cobranca_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Log Auditoria Helper
  const handleLogAuditoria = (acao: string, detalhes: string) => {
    const newLog: LogAuditoria = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      usuario: currentRole === 'ADMIN' ? 'admin@cobrancainteligente.com.br' : 
               currentRole === 'COBRADOR' ? 'marcos.cobrador@cobranca.com.br' : 'carlos.santos@gmail.com',
      papel: currentRole === 'ADMIN' ? 'Administrador' : 
             currentRole === 'COBRADOR' ? 'Entregador / Cobrador' : 'Cliente',
      acao,
      detalhes,
      ip: '189.22.41.95'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Funções de Gerenciamento de Comunicação e Notificações
  const handleAddNotificacao = (notif: NotificacaoEnviada) => {
    setNotificacoes(prev => [...prev, notif]);
  };

  const handleAddAviso = (aviso: AvisoGlobal) => {
    setAvisos(prev => [...prev, aviso]);
  };

  const handleToggleAviso = (id: string) => {
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const handleDeleteAviso = (id: string) => {
    setAvisos(prev => prev.filter(a => a.id !== id));
  };

  const handleAddInteracao = (int: InteracaoCobranca) => {
    setInteracoes(prev => [...prev, int]);
  };

  // State manipulation triggers
  const handleSaveCliente = (cli: Cliente) => {
    const exists = clientes.some(c => c.id === cli.id);
    if (exists) {
      setClientes(prev => prev.map(c => c.id === cli.id ? cli : c));
      handleLogAuditoria('Atualização cadastral realizada', `Dados do cliente ${cli.nome} (${cli.id}) atualizados pelo administrador.`);
      setNotification(`Cadastro do cliente ${cli.nome} atualizado com sucesso!`);
    } else {
      setClientes(prev => [cli, ...prev]);
      handleLogAuditoria('Novo cliente registrado', `Cliente ${cli.nome} (${cli.id}) inserido no sistema pelo administrador.`);
      setNotification(`Novo cliente ${cli.nome} cadastrado com sucesso!`);
    }
    setShowClientForm(false);
    setSelectedClientForEdit(null);
  };

  const handleDeleteCliente = (id: string) => {
    const cli = clientes.find(c => c.id === id);
    if (cli && confirm(`Tem certeza que deseja desativar o cadastro do cliente ${cli.nome}?`)) {
      setClientes(prev => prev.map(c => c.id === id ? { ...c, status: 'Inativo' } : c));
      handleLogAuditoria('Cliente desativado', `Status do cliente ${cli.nome} alterado para Inativo.`);
      setNotification(`Cliente ${cli.nome} foi desativado.`);
    }
  };

  const handleAddVenda = (venda: Venda, novasParcelas: Parcela[]) => {
    setVendas(prev => [venda, ...prev]);
    setParcelas(prev => [...novasParcelas, ...prev]);
    
    // Update client total buys
    setClientes(prev => prev.map(c => {
      if (c.id === venda.clienteId) {
        const totalComprado = c.totalComprado + venda.valorTotal;
        const totalEmAberto = c.totalEmAberto + (venda.valorTotal - venda.entrada);
        const limiteUtilizado = c.limiteUtilizado + (venda.valorTotal - venda.entrada);
        return {
          ...c,
          totalComprado,
          totalEmAberto,
          limiteUtilizado,
          limiteDisponivel: c.limiteCredito - limiteUtilizado
        };
      }
      return c;
    }));

    handleLogAuditoria('Nova venda parcelada registrada', `Venda ${venda.id} de R$ ${venda.valorTotal} gerada para ${venda.clienteNome}.`);
    setNotification(`Carnê gerado com sucesso para ${venda.clienteNome}!`);
  };

  const handleUpdateParcela = (par: Parcela) => {
    // Find previous status
    const previous = parcelas.find(p => p.id === par.id);
    
    setParcelas(prev => prev.map(p => p.id === par.id ? par : p));
    
    if (previous && previous.status !== par.status) {
      setClientes(prev => prev.map(c => {
        if (c.id === par.clienteId) {
          let totalPago = c.totalPago;
          let totalEmAberto = c.totalEmAberto;
          let limiteUtilizado = c.limiteUtilizado;

          // If changing TO Paid
          if (par.status === 'Paga' && previous.status !== 'Paga') {
            totalPago += par.valorOriginal;
            totalEmAberto = Math.max(0, totalEmAberto - par.valorOriginal);
            limiteUtilizado = Math.max(0, limiteUtilizado - par.valorOriginal);
          }
          // If changing FROM Paid
          else if (previous.status === 'Paga' && par.status !== 'Paga') {
            totalPago = Math.max(0, totalPago - previous.valorOriginal);
            totalEmAberto += par.valorOriginal;
            limiteUtilizado += par.valorOriginal;
          }

          return {
            ...c,
            totalPago,
            totalEmAberto,
            limiteUtilizado,
            limiteDisponivel: c.limiteCredito - limiteUtilizado
          };
        }
        return c;
      }));
    }
  };

  const handleAddRota = (novaRota: RotaCobranca) => {
    setRotas(prev => [novaRota, ...prev]);
    handleLogAuditoria('Novo itinerário planejado', `Rota ${novaRota.id} para cobrador ${novaRota.cobradorNome} registrada.`);
    setNotification(`Nova rota ${novaRota.id} criada com sucesso!`);
  };

  const handleAddSolicitacao = (sol: SolicitacaoLimite) => {
    setSolicitacoes(prev => [sol, ...prev]);
    handleLogAuditoria('Solicitação de aumento de limite', `Cliente ${sol.clienteNome} solicitou limite de R$ ${sol.valorSolicitado}.`);
    setNotification(`Pedido ${sol.id} registrado para ${sol.clienteNome}.`);
  };

  const handleApproveSolicitacao = (solId: string, valorAprovado: number) => {
    const sol = solicitacoes.find((s) => s.id === solId);
    if (!sol) return;
    setClientes((prev) =>
      prev.map((c) =>
        c.id === sol.clienteId
          ? { ...c, limiteCredito: valorAprovado, limiteDisponivel: valorAprovado - c.limiteUtilizado }
          : c
      )
    );
    setSolicitacoes((prev) =>
      prev.map((s) =>
        s.id === solId
          ? { ...s, status: 'Aprovado', dataResposta: new Date().toISOString().split('T')[0] }
          : s
      )
    );
    handleLogAuditoria(
      'Limite aprovado',
      `Aprovado limite de ${sol.clienteNome} para R$ ${valorAprovado.toLocaleString('pt-BR')}.`
    );
    setNotification(`Limite de ${sol.clienteNome} aprovado em R$ ${valorAprovado.toLocaleString('pt-BR')}!`);
  };

  const handleRejectSolicitacao = (solId: string, motivoRecusa: string) => {
    const sol = solicitacoes.find((s) => s.id === solId);
    if (!sol) return;
    setSolicitacoes((prev) =>
      prev.map((s) =>
        s.id === solId
          ? { ...s, status: 'Recusado', dataResposta: new Date().toISOString().split('T')[0] }
          : s
      )
    );
    handleLogAuditoria(
      'Limite recusado',
      `Recusado pedido de ${sol.clienteNome}.${motivoRecusa ? ` Motivo: ${motivoRecusa}` : ''}`
    );
    setNotification(`Pedido de ${sol.clienteNome} recusado.`);
  };

  const pendentesCredito = solicitacoes.filter((s) => s.status === 'Pendente').length;

  // Simulates PWA Install action
  const handlePwaInstallSim = () => {
    setPwaInstalled(true);
    alert('Aplicativo Cobrança Inteligente instalado com sucesso na sua Área de Trabalho / Tela Inicial! Ícone ativo e sincronização offline habilitada.');
  };

  // Filter clients list for Admin Grid
  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchClientQuery.toLowerCase()) || 
                          c.cpf.includes(searchClientQuery) || 
                          c.id.toLowerCase().includes(searchClientQuery.toLowerCase());
    const matchesRisco = filterRisco ? c.scoreRisco === filterRisco : true;
    const matchesStatus = filterStatus ? c.status === filterStatus : true;
    return matchesSearch && matchesRisco && matchesStatus;
  });

  const handleRoleChange = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      COBRADOR: 'Cobrador',
      CLIENTE: 'Cliente',
    };
    setCurrentRole(role);
    handleLogAuditoria('Alteração de perfil', `Usuário alternou visualização para perfil ${labels[role]}`);
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <AppHeader
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        theme={theme}
        onToggleTheme={toggleTheme}
        pwaInstalled={pwaInstalled}
        onInstallPwa={handlePwaInstallSim}
      />

      {notification && (
        <NotificationBar message={notification} onDismiss={() => setNotification(null)} />
      )}

      <div className="w-full min-w-0 overflow-x-hidden">
        
        {/* =======================================================
            PROFILE 1: ADMINISTRADOR
           ======================================================= */}
        {currentRole === 'ADMIN' && (
          <AdminShell
            activeTab={adminTab}
            pendingCreditCount={pendentesCredito}
            onTabChange={(tab) => {
              setAdminTab(tab);
              setShowClientForm(false);
              setClientesView('lista');
            }}
          >
            {adminTab === 'dashboard' && (
              <div className="space-y-5">
                <CommandActions
                  parcelas={parcelas}
                  clientes={clientes}
                  rotas={rotas}
                  logs={logs}
                  onMassReminders={() => {
                    setReminderProgress(0);
                    setShowMassRemindersModal(true);
                  }}
                  onMassBlock={() => setShowMassBlockModal(true)}
                  onRouteDispatch={() => setShowRouteDispatchModal(true)}
                  onAiCalibration={() => {
                    setCalibrationProgress(0);
                    setShowAiCalibrationModal(true);
                  }}
                />

                <KPIs clientes={clientes} parcelas={parcelas} />
                <Charts clientes={clientes} parcelas={parcelas} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Panel className="space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pedidos de crédito pendentes</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdminTab('credito')}
                      >
                        Ver todos
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {solicitacoes.filter((s) => s.status === 'Pendente').slice(0, 4).map((sol) => (
                        <div key={sol.id}>
                          <CreditRequestCard
                            solicitacao={sol}
                            cliente={clientes.find((c) => c.id === sol.clienteId)}
                            onClick={() => setDashboardReviewId(sol.id)}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                    {pendentesCredito === 0 && (
                      <p className="py-4 text-center text-xs text-[var(--text-muted)]">
                        Nenhum pedido pendente. Crie um em Pedidos de crédito.
                      </p>
                    )}
                  </Panel>

                  <Panel className="space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Rota ativa</h3>
                    {rotas.slice(0, 1).map((r) => {
                      const pars = parcelas.filter(p => r.parcelasIds.includes(p.id));
                      return (
                        <div key={r.id} className="space-y-3 text-xs">
                          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <strong className="block">{r.nome}</strong>
                              <span className="text-[10px] text-slate-400">Cobrador: {r.cobradorNome}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full">{r.status}</span>
                          </div>

                          <div className="space-y-2">
                            {pars.map(p => (
                              <div key={p.id} className="flex justify-between text-xs border-b border-slate-100 pb-1.5 last:border-0">
                                <span>{p.clienteNome}</span>
                                <strong className="text-indigo-600">R$ {p.valorOriginal.toLocaleString()}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </Panel>
                </div>
              </div>
            )}

            {adminTab === 'credito' && (
              <CreditRequestsPanel
                clientes={clientes}
                solicitacoes={solicitacoes}
                onAddSolicitacao={handleAddSolicitacao}
                onApprove={handleApproveSolicitacao}
                onReject={handleRejectSolicitacao}
              />
            )}

            {adminTab === 'clientes' && (
              <div className="min-w-0 space-y-5">
                {clientesView === 'cadastro-completo' || showClientForm ? (
                  <ClientForm
                    onSave={(cli) => {
                      handleSaveCliente(cli);
                      setClientesView('lista');
                    }}
                    onCancel={() => {
                      setShowClientForm(false);
                      setSelectedClientForEdit(null);
                      setClientesView('lista');
                    }}
                    clienteEdicao={selectedClientForEdit}
                  />
                ) : (
                  <Panel className="min-w-0 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <SegmentedTabs
                        items={[
                          { id: 'lista', label: 'Clientes' },
                          { id: 'cadastro-rapido', label: 'Cadastro rápido' },
                        ]}
                        activeId="lista"
                        onChange={(id) => {
                          if (id === 'cadastro-rapido') setClientesView('cadastro-rapido');
                        }}
                        className="w-full sm:w-auto"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdminTab('credito')}
                        >
                          Pedidos ({pendentesCredito})
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setClientesView('cadastro-rapido')}
                        >
                          <Plus className="size-4" /> Novo cliente
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="relative w-full">
                        <Input
                          type="text"
                          value={searchClientQuery}
                          onChange={e => setSearchClientQuery(e.target.value)}
                          placeholder="Buscar nome, CPF ou código..."
                          className="pl-9"
                          inputSize="sm"
                        />
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
                      </div>

                      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                        <Select
                          value={filterRisco}
                          onChange={e => setFilterRisco(e.target.value)}
                          className="w-full text-xs sm:w-auto sm:min-w-[140px]"
                        >
                          <option value="">Risco (Todos)</option>
                          <option value="Excelente">Excelente</option>
                          <option value="Muito Bom">Muito Bom</option>
                          <option value="Bom">Bom</option>
                          <option value="Médio">Médio</option>
                          <option value="Alto Risco">Alto Risco</option>
                          <option value="Bloqueado">Bloqueado</option>
                        </Select>

                        <Select
                          value={filterStatus}
                          onChange={e => setFilterStatus(e.target.value)}
                          className="w-full text-xs sm:w-auto sm:min-w-[140px]"
                        >
                          <option value="">Status (Todos)</option>
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                          <option value="Bloqueado">Bloqueado</option>
                          <option value="Em Análise">Em Análise</option>
                        </Select>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedClientForEdit(null);
                            setShowClientForm(true);
                            setClientesView('cadastro-completo');
                          }}
                          className="w-full sm:w-auto"
                          size="sm"
                        >
                          Cadastro completo
                        </Button>
                      </div>
                    </div>

                    {/* Data Grid list (Desktop Only) */}
                    <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950/30 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3">ID / Nome</th>
                            <th className="px-4 py-3">CPF</th>
                            <th className="px-4 py-3">Contato Principal</th>
                            <th className="px-4 py-3">Cidade / Bairro</th>
                            <th className="px-4 py-3 text-right">Limite Total</th>
                            <th className="px-4 py-3 text-right">Saldo Devedor</th>
                            <th className="px-4 py-3">Classif. Risco</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredClientes.map((cli) => (
                            <tr key={cli.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <img src={cli.foto} alt={cli.nome} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100" />
                                  <div>
                                    <strong className="text-slate-850 dark:text-white block">{cli.nome}</strong>
                                    <span className="text-[10px] font-mono text-slate-400">{cli.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono">{cli.cpf}</td>
                              <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">{cli.celularPrincipal}</td>
                              <td className="px-4 py-3 text-slate-500">{cli.cidade} - {cli.bairro}</td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                R$ {cli.limiteCredito.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-rose-500">
                                R$ {cli.totalEmAberto.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cli.scoreRisco === 'Excelente' || cli.scoreRisco === 'Muito Bom' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                                  cli.scoreRisco === 'Bom' ? 'bg-sky-50 text-sky-600' :
                                  cli.scoreRisco === 'Médio' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {cli.scoreRisco} ({cli.scoreInterno})
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  cli.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                                  cli.status === 'Bloqueado' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {cli.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedClientForCreditAdjust(cli)}
                                    className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-500 rounded transition"
                                    title="Ajuste de Crédito Rápido"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedClientForEdit(cli);
                                      setShowClientForm(true);
                                      setClientesView('cadastro-completo');
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition text-slate-600 dark:text-slate-300"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCliente(cli.id)}
                                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded transition"
                                    title="Desativar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cards List (Mobile Only) */}
                    <div className="block md:hidden space-y-4">
                      {filteredClientes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">Nenhum cliente cadastrado ou encontrado.</div>
                      ) : (
                        filteredClientes.map((cli) => (
                          <div key={cli.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3.5 animate-[fadeIn_0.15s_ease]">
                            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src={cli.foto} alt={cli.nome} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-850" />
                                <div className="min-w-0">
                                  <strong className="text-slate-900 dark:text-white block text-sm font-extrabold truncate">{cli.nome}</strong>
                                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{cli.id} • CPF: {cli.cpf}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 self-start ${
                                cli.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                cli.status === 'Bloqueado' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {cli.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-50/60 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Limite Total</span>
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs block mt-0.5">R$ {cli.limiteCredito.toLocaleString()}</span>
                              </div>
                              <div className="bg-slate-50/60 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Saldo Devedor</span>
                                <span className="font-extrabold text-rose-500 text-xs block mt-0.5">R$ {cli.totalEmAberto.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-[11px] bg-slate-50/20 dark:bg-slate-950/10 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/30">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Contato:</span>
                                <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cli.celularPrincipal}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Cidade/Bairro:</span>
                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">{cli.cidade} - {cli.bairro}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Classificação:</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  cli.scoreRisco === 'Excelente' || cli.scoreRisco === 'Muito Bom' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                  cli.scoreRisco === 'Bom' ? 'bg-sky-50 text-sky-600' :
                                  cli.scoreRisco === 'Médio' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {cli.scoreRisco} ({cli.scoreInterno})
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                              <button
                                type="button"
                                onClick={() => setSelectedClientForCreditAdjust(cli)}
                                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Crédito
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedClientForEdit(cli);
                                  setShowClientForm(true);
                                  setClientesView('cadastro-completo');
                                }}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCliente(cli.id)}
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Desativar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Panel>
                )}

                <QuickClientRegister
                  open={clientesView === 'cadastro-rapido'}
                  onSave={(cli) => {
                    handleSaveCliente(cli);
                    setClientesView('lista');
                  }}
                  onClose={() => setClientesView('lista')}
                  onOpenFullForm={() => {
                    setSelectedClientForEdit(null);
                    setClientesView('cadastro-completo');
                    setShowClientForm(true);
                  }}
                />
              </div>
            )}

            {adminTab === 'financas' && (
              <FinancialOps 
                clientes={clientes} 
                parcelas={parcelas} 
                vendas={vendas} 
                onAddVenda={handleAddVenda} 
                onUpdateParcela={handleUpdateParcela} 
              />
            )}

            {adminTab === 'rotas' && (
              <RoutesManager 
                rotas={rotas} 
                parcelas={parcelas} 
                clientes={clientes} 
                onAddRota={handleAddRota} 
                onUpdateRota={(updated) => {
                  setRotas(prev => prev.map(r => r.id === updated.id ? updated : r));
                }}
                onUpdateParcela={handleUpdateParcela}
                onLogAuditoria={handleLogAuditoria}
              />
            )}

            {adminTab === 'relatorios' && (
              <ReportsExplorer 
                clientes={clientes} 
                parcelas={parcelas} 
                vendas={vendas} 
                logs={logs} 
              />
            )}

            {adminTab === 'comunicacao' && (
              <CommunicationPanel
                clientes={clientes}
                notificacoes={notificacoes}
                onAddNotificacao={handleAddNotificacao}
                avisos={avisos}
                onAddAviso={handleAddAviso}
                onToggleAviso={handleToggleAviso}
                onDeleteAviso={handleDeleteAviso}
                interacoes={interacoes}
                onAddInteracao={handleAddInteracao}
                onLogAuditoria={handleLogAuditoria}
              />
            )}

            {adminTab === 'seguranca' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.2s_ease]">
                
                {/* Security configuration card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-1">
                  <h3 className="font-bold text-slate-950 dark:text-white text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Lock className="w-4 h-4 text-rose-500" /> Parâmetros de Criptografia & LGPD
                  </h3>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="block">Criptografia AES-256</strong>
                        <span className="text-[10px] text-slate-400">Banco de dados e anexos em S3 em repouso</span>
                      </div>
                      <span className="text-emerald-500 font-bold">ATIVO</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="block">Controle de RBAC</strong>
                        <span className="text-[10px] text-slate-400">Administrador / Cobradores / Cliente</span>
                      </div>
                      <span className="text-emerald-500 font-bold">ATIVO</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="block">Autenticação 2FA por SMS</strong>
                        <span className="text-[10px] text-slate-400">Exigido para todos os logins administrativos</span>
                      </div>
                      <span className="text-emerald-500 font-bold">ATIVO</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="block">Conformidade LGPD Ready</strong>
                        <span className="text-[10px] text-slate-400">Consentimentos digitais e anonimização</span>
                      </div>
                      <span className="text-emerald-500 font-bold">ATIVO</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] text-slate-500">
                    O sistema registra instantaneamente qualquer IP, requisição de token, e modificação de limites na tabela de logs para fins de auditoria judicial.
                  </div>
                </div>

                {/* Audit trail grid list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
                  <h3 className="font-bold text-slate-950 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                    Rastro de Auditoria e Logs de Segurança
                  </h3>

                  {/* Tabela de logs (Desktop Only) */}
                  <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl max-h-[300px]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950/30 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2">Data/Hora</th>
                          <th className="px-4 py-2">Usuário</th>
                          <th className="px-4 py-2">Papel</th>
                          <th className="px-4 py-2">Ação</th>
                          <th className="px-4 py-2">Origem IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.map((lg) => (
                          <tr key={lg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                            <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">
                              {new Date(lg.timestamp).toLocaleDateString()} {new Date(lg.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{lg.usuario}</td>
                            <td className="px-4 py-2 font-semibold text-slate-500">{lg.papel}</td>
                            <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{lg.acao}</td>
                            <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">{lg.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Lista de logs (Mobile Only) */}
                  <div className="block md:hidden border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-150/60 dark:divide-slate-800/60 max-h-[300px] overflow-y-auto">
                    {logs.map((lg) => (
                      <div key={lg.id} className="p-3 text-[11px] space-y-1 hover:bg-slate-50 dark:hover:bg-slate-950/10 transition">
                        <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                          <span>{new Date(lg.timestamp).toLocaleDateString()} {new Date(lg.timestamp).toLocaleTimeString()}</span>
                          <span>IP: {lg.ip}</span>
                        </div>
                        <div className="flex justify-between items-start gap-2 pt-0.5">
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {lg.usuario} <span className="text-slate-400 font-normal">({lg.papel})</span>
                          </span>
                          <span className="font-extrabold text-slate-900 dark:text-white text-right shrink-0">{lg.acao}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </AdminShell>
        )}

        {currentRole === 'COBRADOR' && (
          <MobileFrame>
          <CobradorApp
            rotas={rotas} 
            parcelas={parcelas} 
            clientes={clientes} 
            avisos={avisos}
            onUpdateParcela={handleUpdateParcela}
            onLogAuditoria={handleLogAuditoria}
          />
          </MobileFrame>
        )}

        {currentRole === 'CLIENTE' && (
          <MobileFrame>
          <ClienteApp
            clientes={clientes} 
            parcelas={parcelas} 
            solicitacoes={solicitacoes}
            avisos={avisos}
            onAddSolicitacao={handleAddSolicitacao}
          />
          </MobileFrame>
        )}

        <CreditReviewDialog
          open={!!dashboardReviewId}
          solicitacao={solicitacoes.find((s) => s.id === dashboardReviewId) ?? null}
          cliente={clientes.find((c) => c.id === solicitacoes.find((s) => s.id === dashboardReviewId)?.clienteId)}
          onClose={() => setDashboardReviewId(null)}
          onApprove={(id, valor) => {
            handleApproveSolicitacao(id, valor);
            setDashboardReviewId(null);
          }}
          onReject={(id, motivo) => {
            handleRejectSolicitacao(id, motivo);
            setDashboardReviewId(null);
          }}
        />

        <AnimatePresence>
          {/* 1. QUICK CREDIT & RISK ADJUSTMENT MODAL */}
          {selectedClientForCreditAdjust && (
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center bg-[oklch(0_0_0/0.55)] p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-h-[92dvh] overflow-y-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-[var(--shadow-elevated)] sm:max-w-lg space-y-5 text-[var(--text-primary)]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Ajuste de Crédito Rápido</h4>
                      <p className="text-[10px] text-slate-400">ID: {selectedClientForCreditAdjust.id}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClientForCreditAdjust(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile header */}
                <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                  <img
                    src={selectedClientForCreditAdjust.foto}
                    alt={selectedClientForCreditAdjust.nome}
                    className="w-12 h-12 rounded-full object-cover border border-white dark:border-slate-800 shadow-sm"
                  />
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white block">{selectedClientForCreditAdjust.nome}</strong>
                    <span className="text-[10px] text-slate-500 font-mono block">CPF: {selectedClientForCreditAdjust.cpf}</span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold text-slate-600 dark:text-slate-400">
                        Aberto: R$ {selectedClientForCreditAdjust.totalEmAberto.toLocaleString()}
                      </span>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                        Pago: R$ {selectedClientForCreditAdjust.totalPago.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Limite de Crédito with Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Limite de Crédito Ativo</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                        <input
                          type="number"
                          value={adjustLimit}
                          onChange={(e) => setAdjustLimit(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Utilizado: R$ {selectedClientForCreditAdjust.limiteUtilizado.toLocaleString()}
                      </span>
                    </div>
                    {/* Presets Grid */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[1000, 2000, 5000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAdjustLimit(val)}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition"
                        >
                          Definir R$ {val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAdjustLimit(prev => prev + 1000)}
                        className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold transition"
                      >
                        + R$ 1.000
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Classificação de Risco */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Classif. Risco</label>
                      <select
                        value={adjustRiskScore}
                        onChange={(e) => setAdjustRiskScore(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Muito Bom">Muito Bom</option>
                        <option value="Bom">Bom</option>
                        <option value="Médio">Médio</option>
                        <option value="Alto Risco">Alto Risco</option>
                        <option value="Bloqueado">Bloqueado</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Status Operacional</label>
                      <select
                        value={adjustStatus}
                        onChange={(e) => setAdjustStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Bloqueado">Bloqueado</option>
                        <option value="Em Análise">Em Análise</option>
                      </select>
                    </div>
                  </div>

                  {/* Score de Crédito slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Score Interno IA</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{adjustScore} / 1000</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={adjustScore}
                      onChange={(e) => setAdjustScore(Number(e.target.value))}
                      className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-950 rounded-lg h-1.5 appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClientForCreditAdjust(null)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientes(prev => prev.map(c => {
                        if (c.id === selectedClientForCreditAdjust.id) {
                          const limiteUtilizado = c.limiteUtilizado;
                          return {
                            ...c,
                            limiteCredito: adjustLimit,
                            limiteDisponivel: adjustLimit - limiteUtilizado,
                            scoreInterno: adjustScore,
                            scoreRisco: adjustRiskScore as any,
                            status: adjustStatus as any
                          };
                        }
                        return c;
                      }));
                      handleLogAuditoria(
                        'Ajuste de Crédito Rápido', 
                        `Ajustado limite de ${selectedClientForCreditAdjust.nome} para R$ ${adjustLimit.toLocaleString()}, risco: ${adjustRiskScore}, status: ${adjustStatus}`
                      );
                      setNotification(`Parâmetros de crédito otimizados para ${selectedClientForCreditAdjust.nome}!`);
                      setSelectedClientForCreditAdjust(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" /> Aplicar Ajustes
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* 2. BATCH WHATSAPP REMINDERS MODAL */}
          {showMassRemindersModal && (
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center bg-[oklch(0_0_0/0.55)] p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-h-[92dvh] overflow-y-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-[var(--shadow-elevated)] sm:max-w-md space-y-5 text-[var(--text-primary)]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Lembrete WhatsApp em Lote</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMassRemindersModal(false);
                      setReminderProgress(0);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {reminderProgress === 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      O sistema identificou <strong className="text-slate-800 dark:text-white font-bold">{parcelas.filter(p => p.status === 'Atrasada').length} parcelas críticas</strong> com pagamento pendente. Deseja disparar alertas de cobrança personalizados com o carnê digital em anexo?
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[11px] space-y-1.5 max-h-[160px] overflow-y-auto">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Destinatários Elegíveis</span>
                      {parcelas.filter(p => p.status === 'Atrasada').map(p => (
                        <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/20 last:border-0">
                          <span>{p.clienteNome} (Fat. {p.id})</span>
                          <strong className="text-rose-500">R$ {p.valorOriginal.toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMassRemindersModal(false)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          let current = 0;
                          const interval = setInterval(() => {
                            current += 20;
                            setReminderProgress(current);
                            if (current >= 100) {
                              clearInterval(interval);
                              // Mark parcelas as notified
                              setParcelas(prev => prev.map(p => p.status === 'Atrasada' ? { ...p, observacao: `${p.observacao || ''} [Notificado via WhatsApp Lote]`.trim() } : p));
                              handleLogAuditoria(
                                'Envio de Notificações WhatsApp', 
                                `Disparados ${parcelas.filter(p => p.status === 'Atrasada').length} avisos automáticos de cobrança para clientes inadimplentes.`
                              );
                              setNotification('Todos os avisos automáticos foram enviados via WhatsApp em Lote!');
                            }
                          }, 300);
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Send className="w-4 h-4" /> Disparar Lote
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 animate-pulse" />
                      <div className="absolute inset-2 rounded-full border-4 border-t-emerald-500 border-r-transparent animate-spin" />
                      <MessageSquare className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xs text-slate-800 dark:text-white block font-bold">
                        {reminderProgress < 100 ? 'Enviando Lembretes...' : 'Notificações Enviadas!'}
                      </strong>
                      <p className="text-[10px] text-slate-400">Progresso: {reminderProgress}%</p>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${reminderProgress}%` }}
                      />
                    </div>
                    {reminderProgress === 100 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMassRemindersModal(false);
                          setReminderProgress(0);
                        }}
                        className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50 text-xs font-bold rounded-xl transition"
                      >
                        Concluído
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* 3. BATCH PREVENTATIVE BLOCK MODAL */}
          {showMassBlockModal && (
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center bg-[oklch(0_0_0/0.55)] p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-h-[92dvh] overflow-y-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-[var(--shadow-elevated)] sm:max-w-md space-y-5 text-[var(--text-primary)]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Mitigação de Perdas & Bloqueio</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMassBlockModal(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Foi verificado que <strong className="text-slate-800 dark:text-white font-bold">{clientes.filter(c => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').length} clientes ativos</strong> possuem classificação de <strong className="text-rose-500 font-bold">Alto Risco</strong> e faturas em aberto. Deseja realizar o bloqueio operacional preventivo para evitar novas vendas no crediário?
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[11px] space-y-1.5 max-h-[160px] overflow-y-auto">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Clientes para Restrição Preventiva</span>
                    {clientes.filter(c => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').map(c => (
                      <div key={c.id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/20 last:border-0">
                        <span>{c.nome}</span>
                        <strong className="text-rose-500">R$ {c.totalEmAberto.toLocaleString()}</strong>
                      </div>
                    ))}
                    {clientes.filter(c => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').length === 0 && (
                      <div className="py-4 text-center text-slate-400">Nenhum cliente ativo elegível para bloqueio preventivo.</div>
                    )}
                  </div>

                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/40 rounded-xl text-[10px] text-rose-600 dark:text-rose-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Esta ação suspenderá novos crediários e faturamentos para estes clientes imediatamente. Uma notificação interna de restrição será vinculada ao perfil de cada um.</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMassBlockModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={clientes.filter(c => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').length === 0}
                      onClick={() => {
                        const targetCount = clientes.filter(c => c.scoreRisco === 'Alto Risco' && c.status === 'Ativo').length;
                        setClientes(prev => prev.map(c => (c.scoreRisco === 'Alto Risco' && c.status === 'Ativo') ? { ...c, status: 'Bloqueado', scoreRisco: 'Bloqueado' } : c));
                        handleLogAuditoria(
                          'Bloqueio Preventivo em Massa', 
                          `Bloqueado acesso e suspensa concessão de crédito para ${targetCount} clientes de Alto Risco em atraso.`
                        );
                        setNotification('Bloqueio Preventivo aplicado com sucesso!');
                        setShowMassBlockModal(false);
                      }}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShieldAlert className="w-4 h-4" /> Bloquear Contas
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* 4. SATELLITE GPS ROUTE DISPATCH MODAL */}
          {showRouteDispatchModal && (
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center bg-[oklch(0_0_0/0.55)] p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-h-[92dvh] overflow-y-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-[var(--shadow-elevated)] sm:max-w-md space-y-5 text-[var(--text-primary)]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-50 dark:bg-sky-950/40 text-sky-600 rounded-xl">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Despacho & Sincronização GPS</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRouteDispatchModal(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Existem <strong className="text-slate-800 dark:text-white font-bold">{rotas.filter(r => !r.concluida).length} itinerários agendados</strong> para hoje. Sincronizar coordenadas de geolocalização por satélite e despachar as rotas de campo para os coletores?
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[11px] space-y-2 max-h-[160px] overflow-y-auto">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Coletores & Itinerários Ativos</span>
                    {rotas.filter(r => !r.concluida).map(r => (
                      <div key={r.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/20 last:border-0">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          <span>{r.nome}</span>
                        </div>
                        <span className="text-[9px] bg-sky-50 text-sky-600 font-bold px-1.5 py-0.5 rounded-full">
                          {r.cobradorNome}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRouteDispatchModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogAuditoria(
                          'Despacho de Rota GPS', 
                          `Enviadas diretrizes de GPS e itinerários do dia para os cobradores de campo.`
                        );
                        setNotification('Cobradores de campo notificados! Dispositivos móveis sincronizados via telemetria.');
                        setShowRouteDispatchModal(false);
                      }}
                      className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <MapPin className="w-4 h-4 animate-bounce" /> Despachar via Satélite
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* 5. IA CREDIT SCORE RECALIBRATION MODAL */}
          {showAiCalibrationModal && (
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center bg-[oklch(0_0_0/0.55)] p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-h-[92dvh] overflow-y-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-[var(--shadow-elevated)] sm:max-w-md space-y-5 text-[var(--text-primary)]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">Recalibração Inteligente de Crédito IA</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiCalibrationModal(false);
                      setCalibrationProgress(0);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {calibrationProgress === 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      O motor preditivo de aprendizado do sistema avaliará o índice de pontualidade, saldo em aberto e histórico de pagamento de todos os <strong className="text-slate-850 dark:text-white font-bold">{clientes.length} clientes ativos</strong> para redefinir limites pré-aprovados e classes de risco. Deseja iniciar?
                    </p>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl text-[10px] text-indigo-600 dark:text-indigo-400 flex gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>Clientes exemplares com total pago em dia receberão upgrade automático de limite (+ R$ 500) e melhora nos perfis de score de risco.</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAiCalibrationModal(false)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          let current = 0;
                          const interval = setInterval(() => {
                            current += 25;
                            setCalibrationProgress(current);
                            if (current >= 100) {
                              clearInterval(interval);
                              // Optimize scores for excellent clients (0 total em aberto and paid something)
                              setClientes(prev => prev.map(c => {
                                if (c.totalEmAberto === 0 && c.totalPago > 0) {
                                  const novoLimite = c.limiteCredito + 500;
                                  return {
                                    ...c,
                                    limiteCredito: novoLimite,
                                    limiteDisponivel: novoLimite - c.limiteUtilizado,
                                    scoreInterno: Math.min(1000, c.scoreInterno + 120),
                                    scoreRisco: 'Excelente'
                                  };
                                }
                                return c;
                              }));
                              handleLogAuditoria(
                                'Recalibração de Crédito IA', 
                                `Processado modelo preditivo de crédito. Scores e limites recalibrados com base no índice de pontualidade de pagamento.`
                              );
                              setNotification('Pontuações e limites do motor de IA calibrados com sucesso!');
                            }
                          }, 250);
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Sparkles className="w-4 h-4" /> Iniciar Análise IA
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-pulse" />
                      <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-transparent animate-spin" />
                      <Sparkles className="w-6 h-6 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <strong className="text-xs text-slate-800 dark:text-white block font-bold">
                        {calibrationProgress < 100 ? 'Executando Algoritmo IA...' : 'Recalibração Concluída!'}
                      </strong>
                      <p className="text-[10px] text-slate-400 font-mono">Status: {calibrationProgress}%</p>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-indigo-500 h-full"
                        style={{ width: `${calibrationProgress}%` }}
                      />
                    </div>
                    {calibrationProgress === 100 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAiCalibrationModal(false);
                          setCalibrationProgress(0);
                        }}
                        className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50 text-xs font-bold rounded-xl transition"
                      >
                        Visualizar Resultados
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
