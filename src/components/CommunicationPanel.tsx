import React, { useState } from 'react';
import { Cliente, NotificacaoEnviada, AvisoGlobal, InteracaoCobranca } from '../types';
import { 
  Bell, Send, Mail, MessageSquare, Megaphone, AlertTriangle, History, PhoneCall, 
  Trash2, Plus, Filter, Check, Clock, User, CheckCircle, 
  Settings, ShieldAlert, Layers, Smartphone, RefreshCw, X, Search, Info,
  CheckCheck, HelpCircle, Calendar, MessageCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { MetricStrip } from './ui/MetricStrip';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { FormField } from './ui/FormField';
import { inputClass, selectClass, textareaClass, sectionTitleClass, tableWrapClass, tableHeadClass, tableRowClass, overlayClass } from '../lib/formStyles';

interface CommunicationPanelProps {
  clientes: Cliente[];
  notificacoes: NotificacaoEnviada[];
  onAddNotificacao: (notif: NotificacaoEnviada) => void;
  avisos: AvisoGlobal[];
  onAddAviso: (aviso: AvisoGlobal) => void;
  onToggleAviso: (id: string) => void;
  onDeleteAviso: (id: string) => void;
  interacoes: InteracaoCobranca[];
  onAddInteracao: (int: InteracaoCobranca) => void;
  onLogAuditoria: (acao: string, detalhes: string) => void;
}

export default function CommunicationPanel({
  clientes,
  notificacoes,
  onAddNotificacao,
  avisos,
  onAddAviso,
  onToggleAviso,
  onDeleteAviso,
  interacoes,
  onAddInteracao,
  onLogAuditoria
}: CommunicationPanelProps) {
  // Tabs internas
  const [activeTab, setActiveTab] = useState<'notifs' | 'interacts' | 'notices' | 'rules'>('notifs');

  // Estados de Filtro & Busca
  const [notifFilterCanal, setNotifFilterCanal] = useState<string>('TODOS');
  const [notifSearch, setNotifSearch] = useState<string>('');
  
  const [interactFilterTipo, setInteractFilterTipo] = useState<string>('TODOS');
  const [interactSearch, setInteractSearch] = useState<string>('');

  // Estado para criar Notificação Individual
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedCanal, setSelectedCanal] = useState<'WhatsApp' | 'SMS' | 'E-mail' | 'Push'>('WhatsApp');
  const [selectedTipoNotif, setSelectedTipoNotif] = useState<'Aviso Vencimento' | 'Cobrança Crítica' | 'Confirmação Pagamento' | 'Acordo/Negociação' | 'Campanha'>('Aviso Vencimento');
  const [customMsgContent, setCustomMsgContent] = useState<string>('');
  const [useTemplate, setUseTemplate] = useState<string>('custom');

  // Estado para criar Interação de Cobrança
  const [newInteractClienteId, setNewInteractClienteId] = useState<string>('');
  const [newInteractTipo, setNewInteractTipo] = useState<'Ligação' | 'WhatsApp' | 'Visita Presencial' | 'E-mail' | 'Anotação Interna'>('Ligação');
  const [newInteractDesc, setNewInteractDesc] = useState<string>('');
  const [newInteractResponsavel, setNewInteractResponsavel] = useState<string>('Administrador');
  const [newInteractPromessa, setNewInteractPromessa] = useState<string>('');

  // Estado para criar Aviso Global
  const [newAvisoTitulo, setNewAvisoTitulo] = useState<string>('');
  const [newAvisoConteudo, setNewAvisoConteudo] = useState<string>('');
  const [newAvisoSeveridade, setNewAvisoSeveridade] = useState<'Info' | 'Alerta' | 'Critico'>('Info');
  const [newAvisoDestino, setNewAvisoDestino] = useState<'TODOS' | 'CLIENTES' | 'COBRADORES'>('TODOS');

  // Estado da Régua de Cobrança
  const [reguaAtiva, setReguaAtiva] = useState({
    vencimentoPrevio: true,
    diaVencimento: true,
    atrasoFase1: true,
    atrasoFase2: true,
    quitacaoConfirmada: true
  });

  // Templates de mensagens úteis
  const messageTemplates = [
    {
      id: 'vencimento',
      label: 'Aviso Vencimento (Fatura Próxima)',
      tipo: 'Aviso Vencimento',
      content: 'Olá [NOME]! Lembramos que sua fatura nº [ID_PARCELA] de R$ [VALOR] vencerá em breve ([VENCIMENTO]). Você pode pagar via PIX copiando o código em seu aplicativo para manter seu score excelente!'
    },
    {
      id: 'atraso_leve',
      label: 'Cobrança Leve (1 a 5 dias)',
      tipo: 'Aviso Vencimento',
      content: 'Olá [NOME], notamos que sua parcela de R$ [VALOR] com vencimento em [VENCIMENTO] ainda não foi identificada. Evite acúmulo de juros diários pagando hoje mesmo via PIX Copia e Cola.'
    },
    {
      id: 'critico',
      label: 'Notificação de Cobrança Crítica (Restrição)',
      tipo: 'Cobrança Crítica',
      content: 'URGENTE: Prezado(a) [NOME], sua fatura está com atraso crítico. O não pagamento nas próximas 24h implicará na suspensão preventiva do seu limite de crediário e inclusão de anotações restritivas.'
    },
    {
      id: 'quitacao',
      label: 'Agradecimento / Quitação de Parcela',
      tipo: 'Confirmação Pagamento',
      content: 'Muito obrigado, [NOME]! Confirmamos o recebimento do seu pagamento de R$ [VALOR]. Seu limite disponível já foi atualizado para R$ [LIMITE_DISP] no seu aplicativo.'
    }
  ];

  // Trata mudança de template selecionado
  const handleTemplateChange = (templateId: string, clienteId: string) => {
    setUseTemplate(templateId);
    if (templateId === 'custom') {
      setCustomMsgContent('');
      return;
    }
    const template = messageTemplates.find(t => t.id === templateId);
    if (!template) return;

    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) {
      // Mensagem genérica se nenhum cliente for selecionado
      let text = template.content
        .replace('[NOME]', 'Cliente')
        .replace('[VALOR]', '0,00')
        .replace('[VENCIMENTO]', '00/00')
        .replace('[ID_PARCELA]', 'PAR-XXX')
        .replace('[LIMITE_DISP]', '0,00');
      setCustomMsgContent(text);
      return;
    }

    // Customiza de acordo com o cliente e dados reais
    let text = template.content
      .replace('[NOME]', cliente.nome)
      .replace('[VALOR]', (cliente.totalEmAberto > 0 ? cliente.totalEmAberto : 250).toLocaleString('pt-BR'))
      .replace('[VENCIMENTO]', 'amanhã')
      .replace('[ID_PARCELA]', 'PAR-00' + Math.floor(Math.random() * 9 + 1))
      .replace('[LIMITE_DISP]', cliente.limiteDisponivel.toLocaleString('pt-BR'));
    
    setCustomMsgContent(text);
    setSelectedTipoNotif(template.tipo as any);
  };

  // Enviar Notificação
  const handleSendNotif = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) return;
    if (!customMsgContent.trim()) return;

    const cliente = clientes.find(c => c.id === selectedClienteId);
    if (!cliente) return;

    const novaNotif: NotificacaoEnviada = {
      id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      canal: selectedCanal,
      tipo: selectedTipoNotif,
      conteudo: customMsgContent,
      status: Math.random() > 0.05 ? 'Enviada' : 'Falhou', // Simula 95% sucesso
      dataEnvio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    onAddNotificacao(novaNotif);
    
    // Adiciona uma interação de comunicação automaticamente
    const novaInteract: InteracaoCobranca = {
      id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      tipo: selectedCanal === 'WhatsApp' ? 'WhatsApp' : selectedCanal === 'SMS' ? 'Ligação' : selectedCanal === 'E-mail' ? 'E-mail' : 'Anotação Interna',
      descricao: `[Disparo Automático / Canal: ${selectedCanal}] - ${selectedTipoNotif}: ${customMsgContent.substring(0, 80)}...`,
      data: novaNotif.dataEnvio,
      responsavel: 'Disparo de Notificação (Painel)'
    };
    onAddInteracao(novaInteract);

    // Auditoria
    onLogAuditoria(
      'Notificação de Cobrança', 
      `Disparado lembrete de ${selectedTipoNotif} via ${selectedCanal} para o cliente ${cliente.nome}`
    );

    // Reset formulário
    setCustomMsgContent('');
    setUseTemplate('custom');
    setSelectedClienteId('');
  };

  // Enviar Interação Manual
  const handleSendInteract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteractClienteId || !newInteractDesc.trim()) return;

    const cliente = clientes.find(c => c.id === newInteractClienteId);
    if (!cliente) return;

    const novaInt: InteracaoCobranca = {
      id: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      tipo: newInteractTipo,
      descricao: newInteractDesc,
      data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      responsavel: newInteractResponsavel,
      promessaPagamento: newInteractPromessa || undefined
    };

    onAddInteracao(novaInt);
    
    // Auditoria
    onLogAuditoria(
      'Registro de Interação', 
      `Registrada interação do tipo ${newInteractTipo} para o cliente ${cliente.nome}. Responsável: ${newInteractResponsavel}`
    );

    // Limpar
    setNewInteractDesc('');
    setNewInteractClienteId('');
    setNewInteractPromessa('');
  };

  // Enviar Novo Aviso Global
  const handleSendAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAvisoTitulo.trim() || !newAvisoConteudo.trim()) return;

    const novoAviso: AvisoGlobal = {
      id: `AVS-${Math.floor(100 + Math.random() * 900)}`,
      titulo: newAvisoTitulo,
      conteudo: newAvisoConteudo,
      severidade: newAvisoSeveridade,
      ativo: true,
      dataCriacao: new Date().toISOString().split('T')[0],
      destino: newAvisoDestino
    };

    onAddAviso(novoAviso);

    onLogAuditoria(
      'Cadastro de Alerta', 
      `Cadastrado novo alerta global: "${newAvisoTitulo}" destinado a ${newAvisoDestino}`
    );

    // Limpar
    setNewAvisoTitulo('');
    setNewAvisoConteudo('');
    setNewAvisoSeveridade('Info');
    setNewAvisoDestino('TODOS');
  };

  // Filtragem de dados
  const filteredNotifs = notificacoes.filter(n => {
    const matchCanal = notifFilterCanal === 'TODOS' || n.canal === notifFilterCanal;
    const matchSearch = n.clienteNome.toLowerCase().includes(notifSearch.toLowerCase()) || 
                        n.conteudo.toLowerCase().includes(notifSearch.toLowerCase()) ||
                        n.tipo.toLowerCase().includes(notifSearch.toLowerCase());
    return matchCanal && matchSearch;
  });

  const filteredInteracts = interacoes.filter(i => {
    const matchTipo = interactFilterTipo === 'TODOS' || i.tipo === interactFilterTipo;
    const matchSearch = i.clienteNome.toLowerCase().includes(interactSearch.toLowerCase()) || 
                        i.descricao.toLowerCase().includes(interactSearch.toLowerCase()) ||
                        i.responsavel.toLowerCase().includes(interactSearch.toLowerCase());
    return matchTipo && matchSearch;
  });

  // Indicadores rápidos
  const totalEnviadas = notificacoes.filter(n => n.status === 'Enviada' || n.status === 'Lida' || n.status === 'Entregue').length;
  const taxaEntrega = notificacoes.length > 0 
    ? Math.round((totalEnviadas / notificacoes.length) * 100) 
    : 100;
  
  const contatosRealizados = interacoes.length;
  const promessasAtivas = interacoes.filter(i => i.promessaPagamento).length;

  const commTabs = [
    { id: 'notifs', label: 'Notificações', icon: Bell },
    { id: 'interacts', label: 'Interações', icon: PhoneCall },
    { id: 'notices', label: 'Avisos globais', icon: Megaphone },
    { id: 'rules', label: 'Régua de cobrança', icon: Settings },
  ];

  return (
    <div id="comunicacao-panel" className="min-w-0 space-y-5 overflow-x-hidden">
      <MetricStrip
        items={[
          { id: 'disp', label: 'Disparos de cobrança', value: notificacoes.length, detail: 'Canais ativos', tone: 'accent' },
          { id: 'entrega', label: 'Taxa de entrega', value: `${taxaEntrega}%`, detail: `${notificacoes.filter(n => n.status === 'Falhou').length} falhas`, tone: 'success' },
          { id: 'contatos', label: 'Contatos registrados', value: contatosRealizados, detail: 'Campo e suporte' },
          { id: 'promessas', label: 'Promessas ativas', value: promessasAtivas, detail: 'Aguardando compensação', tone: 'warning' },
        ]}
      />

      <SegmentedTabs
        items={commTabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* Conteúdo por aba */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        
        {/* ======================= ABA 1: NOTIFICAÇÕES ======================= */}
        {activeTab === 'notifs' && (
          <>
            {/* Lado Esquerdo: Formulário de Envio Individual/Lote */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-4 lg:col-span-1 h-fit">
              <h3 className="font-extrabold text-xs text-[var(--text-primary)]  flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
                <Send className="w-4 h-4 text-indigo-500" />
                Disparo Manual Inteligente
              </h3>
              
              <form onSubmit={handleSendNotif} className="space-y-4 text-xs">
                {/* Seleção do Cliente */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Selecione o Cliente Alvo</label>
                  <select
                    required
                    value={selectedClienteId}
                    onChange={(e) => {
                      setSelectedClienteId(e.target.value);
                      handleTemplateChange(useTemplate, e.target.value);
                    }}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-primary)]"
                  >
                    <option value="">-- Selecionar Cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} (Aberto: R$ {c.totalEmAberto.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Canal de Envio */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Canal de Envio</label>
                    <select
                      value={selectedCanal}
                      onChange={(e) => setSelectedCanal(e.target.value as any)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2 py-1.5 font-semibold text-[var(--text-primary)]"
                    >
                      <option value="WhatsApp">WhatsApp API</option>
                      <option value="SMS">SMS Corporativo</option>
                      <option value="E-mail">Correio E-mail</option>
                      <option value="Push">Push App</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Gatilho / Tipo</label>
                    <select
                      value={selectedTipoNotif}
                      onChange={(e) => setSelectedTipoNotif(e.target.value as any)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2 py-1.5 font-semibold text-[var(--text-primary)]"
                    >
                      <option value="Aviso Vencimento">Aviso de Vencimento</option>
                      <option value="Cobrança Crítica">Cobrança Crítica</option>
                      <option value="Confirmação Pagamento">Confirmação de Pagamento</option>
                      <option value="Acordo/Negociação">Negociação de Acordo</option>
                      <option value="Campanha">Campanha de Score</option>
                    </select>
                  </div>
                </div>

                {/* Templates Rápidos */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Modelos (Templates Inteligentes)</label>
                  <select
                    value={useTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value, selectedClienteId)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 font-semibold text-[var(--text-primary)]"
                  >
                    <option value="custom">Escrever mensagem personalizada</option>
                    {messageTemplates.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Conteúdo da Mensagem */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Conteúdo da Mensagem</label>
                    <span className="text-[10px] text-slate-400 font-mono">{customMsgContent.length} carac.</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    value={customMsgContent}
                    onChange={(e) => setCustomMsgContent(e.target.value)}
                    placeholder="Escreva a notificação. Tags como [NOME] ou [VALOR] são aplicadas automaticamente no envio."
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans text-[var(--text-primary)] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedClienteId || !customMsgContent.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Mensagem API
                </button>
              </form>
            </div>

            {/* Lado Direito: Histórico de Envios */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Fila de Disparos e Notificações</h3>
                  <p className="text-[10px] text-slate-400">Status em tempo real das mensagens disparadas via Gateway Multicanal.</p>
                </div>
                
                {/* Filtros rápidos de Notificação */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={notifFilterCanal}
                    onChange={(e) => setNotifFilterCanal(e.target.value)}
                    className="text-[10px] bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-300"
                  >
                    <option value="TODOS">Todos Canais</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Push">Push</option>
                  </select>
                  
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar notificações..."
                      value={notifSearch}
                      onChange={(e) => setNotifSearch(e.target.value)}
                      className="w-full min-w-0 text-[10px] pl-7 pr-2 py-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg sm:w-[140px] focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredNotifs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhuma notificação encontrada com os filtros selecionados.
                  </div>
                ) : (
                  filteredNotifs.slice().reverse().map((notif) => (
                    <div 
                      key={notif.id}
                      className="p-3.5 bg-[var(--bg-inset)]/40 rounded-2xl border border-[var(--border)]/40 hover:border-slate-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                            notif.canal === 'WhatsApp' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                            notif.canal === 'SMS' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400' :
                            notif.canal === 'E-mail' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' :
                            'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}>
                            {notif.canal}
                          </span>
                          <strong className="text-xs text-slate-800 dark:text-slate-100">{notif.clienteNome}</strong>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{notif.dataEnvio}</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-[var(--border)]/60 p-2.5 rounded-xl font-medium">
                        {notif.conteudo}
                      </p>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[9px]  font-bold text-slate-400">
                          Finalidade: <strong className="text-slate-600 dark:text-slate-300">{notif.tipo}</strong>
                        </span>
                        
                        <div className="flex items-center gap-1 font-bold">
                          {notif.status === 'Lida' && (
                            <span className="text-emerald-500 flex items-center gap-0.5">
                              <CheckCheck className="w-3.5 h-3.5" /> Lida
                            </span>
                          )}
                          {notif.status === 'Entregue' && (
                            <span className="text-sky-500 flex items-center gap-0.5">
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400" /> Entregue
                            </span>
                          )}
                          {notif.status === 'Enviada' && (
                            <span className="text-indigo-500 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Enviada
                            </span>
                          )}
                          {notif.status === 'Falhou' && (
                            <span className="text-rose-500 flex items-center gap-0.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Falhou (Reenviar)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================= ABA 2: INTERAÇÕES (CRM) ======================= */}
        {activeTab === 'interacts' && (
          <>
            {/* Lado Esquerdo: Registrar Nova Interação */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-1 h-fit space-y-4">
              <h3 className="font-extrabold text-xs text-[var(--text-primary)]  flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                Registrar Ação de Campo / CRM
              </h3>

              <form onSubmit={handleSendInteract} className="space-y-4 text-xs">
                {/* Seleção do Cliente */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">De qual cliente?</label>
                  <select
                    required
                    value={newInteractClienteId}
                    onChange={(e) => setNewInteractClienteId(e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-primary)]"
                  >
                    <option value="">-- Selecionar Cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} (CPF: {c.cpf})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Tipo de Interação */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Meio de Contato</label>
                    <select
                      value={newInteractTipo}
                      onChange={(e) => setNewInteractTipo(e.target.value as any)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 font-bold text-[var(--text-primary)]"
                    >
                      <option value="Ligação">Ligação Telefônica</option>
                      <option value="WhatsApp">Conversa WhatsApp</option>
                      <option value="Visita Presencial">Visita Presencial de Campo</option>
                      <option value="E-mail">Envio de E-mail</option>
                      <option value="Anotação Interna">Anotação Interna</option>
                    </select>
                  </div>

                  {/* Responsável */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Responsável</label>
                    <input
                      type="text"
                      required
                      value={newInteractResponsavel}
                      onChange={(e) => setNewInteractResponsavel(e.target.value)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 font-semibold text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                {/* Promessa de pagamento opcional */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Houve Promessa de Pagamento? (Opcional)</label>
                  <input
                    type="date"
                    value={newInteractPromessa}
                    onChange={(e) => setNewInteractPromessa(e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-[var(--text-primary)] font-mono"
                  />
                </div>

                {/* Descrição resumida da interação */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Resumo/Histórico da Conversa</label>
                  <textarea
                    required
                    rows={3}
                    value={newInteractDesc}
                    onChange={(e) => setNewInteractDesc(e.target.value)}
                    placeholder="Ex: Cliente atendeu, alegou problemas de saúde na família, mas firmou compromisso de quitar as parcelas em atraso na próxima quinzena."
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newInteractClienteId || !newInteractDesc.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Registrar no CRM
                </button>
              </form>
            </div>

            {/* Lado Direito: Histórico de Interações */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Linha do Tempo de Cobrança (CRM)</h3>
                  <p className="text-[10px] text-slate-400">Todo o registro de visitas presenciais, ligações e interações manuais de cobrança.</p>
                </div>

                {/* Filtros rápidos */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={interactFilterTipo}
                    onChange={(e) => setInteractFilterTipo(e.target.value)}
                    className="text-[10px] bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-300"
                  >
                    <option value="TODOS">Todos Meios</option>
                    <option value="Ligação">Ligação</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Visita Presencial">Visita Presencial</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Anotação Interna">Anotação Interna</option>
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar interações..."
                      value={interactSearch}
                      onChange={(e) => setInteractSearch(e.target.value)}
                      className="w-full min-w-0 text-[10px] pl-7 pr-2 py-1 bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg sm:w-[140px] focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Lista timeline */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {filteredInteracts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhuma interação cadastrada com estes termos.
                  </div>
                ) : (
                  filteredInteracts.slice().reverse().map((item) => (
                    <div key={item.id} className="relative pl-6 pb-2 border-l border-[var(--border)]/80 last:border-l-transparent">
                      {/* Pontinho ou ícone flutuante */}
                      <span className={`absolute -left-2 top-0.5 p-0.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                        item.tipo === 'Visita Presencial' ? 'bg-amber-500 text-white' :
                        item.tipo === 'Ligação' ? 'bg-indigo-500 text-white' :
                        item.tipo === 'WhatsApp' ? 'bg-emerald-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {item.tipo === 'Ligação' ? <PhoneCall className="w-2.5 h-2.5" /> :
                         item.tipo === 'WhatsApp' ? <MessageCircle className="w-2.5 h-2.5" /> :
                         item.tipo === 'Visita Presencial' ? <Smartphone className="w-2.5 h-2.5" /> :
                         <Info className="w-2.5 h-2.5" />}
                      </span>

                      <div className="bg-[var(--bg-inset)]/40 border border-[var(--border)]/40 p-3 rounded-2xl space-y-1.5 hover:shadow-xs transition">
                        <div className="flex justify-between text-[11px]">
                          <div>
                            <span className="text-slate-400 uppercase font-bold text-[9px] tracking-wider block">Cliente</span>
                            <strong className="text-[var(--text-primary)] font-bold">{item.clienteNome}</strong>
                          </div>
                          <span className="text-slate-400 font-mono text-[9px]">{item.data}</span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {item.descricao}
                        </p>

                        <div className="flex justify-between items-center pt-1.5 border-t border-[var(--border)]/20 text-[10px] text-slate-400 font-semibold">
                          <span>Operador: <strong className="text-slate-600 dark:text-slate-300">{item.responsavel}</strong></span>
                          
                          {item.promessaPagamento && (
                            <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Promessa: {new Date(item.promessaPagamento).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================= ABA 3: MURAL DE AVISOS GLOBAIS ======================= */}
        {activeTab === 'notices' && (
          <>
            {/* Criar Alerta Global */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-1 h-fit space-y-4">
              <h3 className="font-extrabold text-xs text-[var(--text-primary)]  flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
                <Megaphone className="w-4 h-4 text-rose-500" />
                Criar Alerta no Sistema
              </h3>

              <form onSubmit={handleSendAviso} className="space-y-4 text-xs">
                {/* Título do Alerta */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Título do Alerta / Aviso</label>
                  <input
                    type="text"
                    required
                    value={newAvisoTitulo}
                    onChange={(e) => setNewAvisoTitulo(e.target.value)}
                    placeholder="Ex: Plantão especial de Sábado"
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text-primary)] font-bold"
                  />
                </div>

                {/* Destino do Alerta */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Destinado a:</label>
                    <select
                      value={newAvisoDestino}
                      onChange={(e) => setNewAvisoDestino(e.target.value as any)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2 py-1.5 font-bold text-[var(--text-primary)]"
                    >
                      <option value="TODOS">Todos do Sistema</option>
                      <option value="CLIENTES">Apenas Clientes</option>
                      <option value="COBRADORES">Apenas Cobradores</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 dark:text-slate-400 block">Criticidade</label>
                    <select
                      value={newAvisoSeveridade}
                      onChange={(e) => setNewAvisoSeveridade(e.target.value as any)}
                      className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-2 py-1.5 font-bold text-[var(--text-primary)]"
                    >
                      <option value="Info">Informativo (Azul)</option>
                      <option value="Alerta">Alerta (Amarelo)</option>
                      <option value="Critico">Crítico/Urgente (Vermelho)</option>
                    </select>
                  </div>
                </div>

                {/* Descrição/Conteúdo */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 dark:text-slate-400 block">Corpo do Aviso / Mensagem</label>
                  <textarea
                    required
                    rows={4}
                    value={newAvisoConteudo}
                    onChange={(e) => setNewAvisoConteudo(e.target.value)}
                    placeholder="Descreva aqui o aviso que aparecerá nas dashboards correspondentes..."
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newAvisoTitulo.trim() || !newAvisoConteudo.trim()}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Ativar Alerta Global
                </button>
              </form>
            </div>

            {/* Listagem de Avisos ativos */}
            <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xs lg:col-span-2 space-y-4">
              <div className="space-y-1 border-b border-[var(--border)] pb-3">
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Mural de Avisos Ativos</h3>
                <p className="text-[10px] text-slate-400">Mensagens exibidas em tempo real para os perfis selecionados nos respectivos painéis.</p>
              </div>

              {/* Grid de Avisos */}
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {avisos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Nenhum aviso configurado no mural do sistema.
                  </div>
                ) : (
                  avisos.map((aviso) => (
                    <div 
                      key={aviso.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 relative overflow-hidden transition ${
                        aviso.ativo 
                          ? aviso.severidade === 'Critico' ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-950/60' :
                            aviso.severidade === 'Alerta' ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-950/40' :
                            'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-950/50'
                          : 'bg-slate-100 dark:bg-slate-950/20 border-[var(--border)]/80 opacity-60'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {aviso.severidade === 'Critico' ? <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /> :
                             aviso.severidade === 'Alerta' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> :
                             <Info className="w-4 h-4 text-sky-500 shrink-0" />}
                            
                            <h4 className="font-bold text-xs text-[var(--text-primary)]">{aviso.titulo}</h4>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500">
                              Para: {aviso.destino}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => onDeleteAviso(aviso.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 rounded-lg transition"
                              title="Remover Alerta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          {aviso.conteudo}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-[var(--border)]/20">
                        <span className="text-[9px] text-slate-400 font-mono">Postado: {aviso.dataCriacao}</span>
                        
                        <button
                          type="button"
                          onClick={() => onToggleAviso(aviso.id)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition  ${
                            aviso.ativo 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {aviso.ativo ? '● Ativo' : '○ Pausado'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================= ABA 4: RÉGUA DE COBRANÇA IA ======================= */}
        {activeTab === 'rules' && (
          <div className="col-span-full space-y-6">
            
            {/* Intro banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-slate-950 dark:to-indigo-990 border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Send className="size-4" aria-hidden />
                  </div>
                  <strong className="text-xs uppercase tracking-widest font-extrabold text-indigo-400">Automação de Contatos Inteligente</strong>
                </div>
                <h3 className="text-base font-black tracking-tight">Régua Multicanal de Cobrança com Inteligência Artificial</h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Reduza o índice de inadimplência em até 42.5% acionando réguas preventivas e notificações estruturadas nos canais preferidos dos clientes, calculando o melhor horário de contato por IA.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <Settings className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold block">Gatilhos Diários</span>
                  <strong className="text-emerald-400 font-black">Motor Ativo (Auto)</strong>
                </div>
              </div>
            </div>

            {/* Fases do Funil da Régua */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Fase 1 */}
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-[var(--border)] font-mono text-[9px] font-bold rounded-lg">Fase 1</span>
                  
                  <input
                    type="checkbox"
                    checked={reguaAtiva.vencimentoPrevio}
                    onChange={(e) => setReguaAtiva(prev => ({ ...prev, vencimentoPrevio: e.target.checked }))}
                    className="accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[var(--text-primary)] block">Pré-Vencimento</strong>
                  <p className="text-[10px] text-slate-400">3 dias antes de vencer</p>
                </div>

                <div className="bg-[var(--bg-inset)]/40 p-2 rounded-xl text-[10px] text-slate-500 font-semibold">
                  Dispara aviso amigável com código Pix Copia e Cola via <strong className="text-indigo-600 dark:text-indigo-400">WhatsApp</strong>.
                </div>
              </div>

              {/* Fase 2 */}
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-[var(--border)] font-mono text-[9px] font-bold rounded-lg">Fase 2</span>
                  
                  <input
                    type="checkbox"
                    checked={reguaAtiva.diaVencimento}
                    onChange={(e) => setReguaAtiva(prev => ({ ...prev, diaVencimento: e.target.checked }))}
                    className="accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[var(--text-primary)] block">Dia do Vencimento</strong>
                  <p className="text-[10px] text-slate-400">Às 09:00 da manhã</p>
                </div>

                <div className="bg-[var(--bg-inset)]/40 p-2 rounded-xl text-[10px] text-slate-500 font-semibold">
                  Mensagem curta de lembrete com chave Pix via <strong className="text-indigo-600 dark:text-indigo-400">WhatsApp + SMS</strong>.
                </div>
              </div>

              {/* Fase 3 */}
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 border border-[var(--border)] font-mono text-[9px] font-bold rounded-lg">Fase 3</span>
                  
                  <input
                    type="checkbox"
                    checked={reguaAtiva.atrasoFase1}
                    onChange={(e) => setReguaAtiva(prev => ({ ...prev, atrasoFase1: e.target.checked }))}
                    className="accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[var(--text-primary)] block">Atraso Recente</strong>
                  <p className="text-[10px] text-slate-400">5 dias de atraso</p>
                </div>

                <div className="bg-[var(--bg-inset)]/40 p-2 rounded-xl text-[10px] text-slate-500 font-semibold">
                  Notificação no <strong className="text-indigo-600 dark:text-indigo-400">E-mail + Alerta Push</strong> com proposta de parcelamento e isenção de multa inicial.
                </div>
              </div>

              {/* Fase 4 */}
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-950 font-mono text-[9px] font-bold rounded-lg">Fase 4</span>
                  
                  <input
                    type="checkbox"
                    checked={reguaAtiva.atrasoFase2}
                    onChange={(e) => setReguaAtiva(prev => ({ ...prev, atrasoFase2: e.target.checked }))}
                    className="accent-rose-600 rounded cursor-pointer"
                  />
                </div>
                
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[var(--text-primary)] block">Atraso Crítico</strong>
                  <p className="text-[10px] text-slate-400">15+ dias de atraso</p>
                </div>

                <div className="bg-[var(--bg-inset)]/40 p-2 rounded-xl text-[10px] text-slate-500 font-semibold">
                  Aviso de suspensão de limite e envio para o <strong className="text-rose-500">Mapeamento de Rotas presenciais</strong> automáticas.
                </div>
              </div>

              {/* Fase 5 */}
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-100 dark:border-emerald-950 font-mono text-[9px] font-bold rounded-lg">Fase 5</span>
                  
                  <input
                    type="checkbox"
                    checked={reguaAtiva.quitacaoConfirmada}
                    onChange={(e) => setReguaAtiva(prev => ({ ...prev, quitacaoConfirmada: e.target.checked }))}
                    className="accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
                
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[var(--text-primary)] block">Quitação / Sucesso</strong>
                  <p className="text-[10px] text-slate-400">Instante do pagamento</p>
                </div>

                <div className="bg-[var(--bg-inset)]/40 p-2 rounded-xl text-[10px] text-slate-500 font-semibold">
                  Confirmação de recebimento, agradecimento e liberação imediata do <strong className="text-indigo-600 dark:text-indigo-400">limite do crediário</strong>.
                </div>
              </div>
            </div>

            {/* Informações adicionais do robô de cobrança */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Diretrizes de Compliance & LGPD</h4>
                <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <p>
                    O nosso módulo de inteligência de comunicação opera sob rigoroso compliance de horário, respeitando o Art. 71 do Código de Defesa do Consumidor (CDC) e orientações de boas práticas regulatórias.
                  </p>
                  <ul className="space-y-2 list-disc pl-4 font-medium text-[11px]">
                    <li>Disparos automáticos ativos exclusivamente de Segunda a Sexta, das 08:30 às 18:30, e aos Sábados das 09:00 às 13:00.</li>
                    <li>Nenhum disparo é realizado em Domingos e Feriados Estaduais ou Nacionais.</li>
                    <li>Bloqueio automático de envio após quitação de parcela para evitar contatos duplicados ou indevidos.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Motor de Recalibração de Score</h4>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    A cada interação e resposta positiva dos clientes, a inteligência recalculas os pesos e as prioridades do perfil de crédito do cliente, reclassificando o score de forma preditiva.
                  </p>
                  <div className="bg-[var(--bg-inset)]/40 p-3 rounded-2xl border border-[var(--border)]/40 flex items-center justify-between text-[11px] font-semibold">
                    <span>Taxa de Acordo sobre Notificações</span>
                    <strong className="text-emerald-500 font-mono text-xs">+ 78.4% de resposta</strong>
                  </div>
                  <div className="bg-[var(--bg-inset)]/40 p-3 rounded-2xl border border-[var(--border)]/40 flex items-center justify-between text-[11px] font-semibold">
                    <span>Taxa de Quitação via Link Automático</span>
                    <strong className="text-indigo-500 font-mono text-xs">64.2% via Pix Copia/Cola</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
