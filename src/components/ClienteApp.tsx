import React, { useState } from 'react';
import { Cliente, Parcela, ChatMessage, SolicitacaoLimite, AvisoGlobal } from '../types';
import { Smartphone, ShieldCheck, QrCode, ClipboardCheck, MessageSquare, Plus, CheckCircle, RefreshCw, AlertTriangle, UserCheck, CreditCard, Send, Megaphone } from 'lucide-react';

interface ClienteAppProps {
  clientes: Cliente[];
  parcelas: Parcela[];
  solicitacoes: SolicitacaoLimite[];
  avisos: AvisoGlobal[];
  onAddSolicitacao: (sol: SolicitacaoLimite) => void;
}

export default function ClienteApp({ clientes, parcelas, solicitacoes, avisos, onAddSolicitacao }: ClienteAppProps) {
  // Use Carlos Silva Santos (CLI-001) as the active mock client log
  const activeCliente = clientes.find(c => c.id === 'CLI-001') || clientes[0];
  const clientParcelas = parcelas.filter(p => p.clienteId === activeCliente.id);

  const totalDevido = clientParcelas
    .filter(p => p.status === 'Pendente' || p.status === 'Atrasada')
    .reduce((acc, curr) => acc + curr.valorOriginal, 0);

  const parcelasPagas = clientParcelas.filter(p => p.status === 'Paga');
  const parcelasPendentes = clientParcelas.filter(p => p.status === 'Pendente' || p.status === 'Atrasada');

  // Limits increase form state
  const [showLimitForm, setShowLimitForm] = useState(false);
  const [solValue, setSolValue] = useState<number>(1000);
  const [solMotivo, setSolMotivo] = useState('');
  const [limitStatus, setLimitStatus] = useState<string | null>(null);

  // Profile update state
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatePhone, setUpdatePhone] = useState(activeCliente.celularPrincipal);
  const [updateAddress, setUpdateAddress] = useState(`${activeCliente.rua}, ${activeCliente.numero}`);
  const [updateCompany, setUpdateCompany] = useState(activeCliente.empresa);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);

  // Chat messages simulation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'SUPORTE', timestamp: '05/07/2026 09:00', text: 'Olá, Carlos! Seja bem-vindo ao suporte da Cobrança Inteligente. Como posso te ajudar hoje?' },
    { id: '2', sender: 'CLIENTE', timestamp: '05/07/2026 09:02', text: 'Olá! Gostaria de saber se o meu adiantamento de parcela foi compensado.' },
    { id: '3', sender: 'SUPORTE', timestamp: '05/07/2026 09:03', text: 'Sim, Carlos! A sua parcela PAR-003 no valor de R$ 590,00 foi quitada antecipada em 02/07 e o seu limite já foi restabelecido.' }
  ]);
  const [newMsgText, setNewMsgText] = useState('');

  // Pix Copia e Cola generator
  const [activePixCode, setActivePixCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const triggerPixGenerate = (par: Parcela) => {
    const pixPayload = `00020101021226830014br.gov.pix0114+55119876543210215PagamentoCarnes0503***5204000053039865405${par.valorOriginal.toFixed(2)}5802BR5920CobrancaInteligente6009SaoPaulo62070503***6304FC3A`;
    setActivePixCode(pixPayload);
    setCopied(false);
  };

  const handleCopyPix = () => {
    if (activePixCode) {
      navigator.clipboard.writeText(activePixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'CLIENTE',
      timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text: newMsgText
    };

    setChatMessages(prev => [...prev, userMsg]);
    setNewMsgText('');

    // Trigger AI automatic response after 1 second
    setTimeout(() => {
      const supportMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'SUPORTE',
        timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: 'Perfeito, Carlos! Recebemos sua mensagem. Um de nossos atendentes de cobrança ou crédito retornará o contato o mais rápido possível no seu WhatsApp.'
      };
      setChatMessages(prev => [...prev, supportMsg]);
    }, 1200);
  };

  // Submit credit request
  const handleRequestLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: SolicitacaoLimite = {
      id: `SOL-${Math.floor(100 + Math.random() * 900)}`,
      clienteId: activeCliente.id,
      clienteNome: activeCliente.nome,
      valorAtual: activeCliente.limiteCredito,
      valorSolicitado: solValue,
      motivo: solMotivo || 'Ampliar limite para novos carnês de compras residenciais.',
      status: 'Pendente',
      dataSolicitacao: new Date().toISOString().split('T')[0]
    };

    onAddSolicitacao(newRequest);
    setLimitStatus('Solicitação de aumento enviada com sucesso! Aguarde a análise de crédito da equipe administrativa.');
    setShowLimitForm(false);
    setSolMotivo('');
  };

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-sidebar)] p-4 text-[var(--text-on-sidebar)] shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-3">
          <img src={activeCliente.foto} alt={activeCliente.nome} className="size-12 rounded-full object-cover border border-[var(--border-strong)]" />
          <div>
            <span className="text-[11px] text-[var(--text-on-sidebar-muted)]">Portal do cliente</span>
            <h2 className="text-base font-semibold tracking-tight">{activeCliente.nome}</h2>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--bg-sidebar-hover)] p-3">
            <span className="text-[11px] text-[var(--text-on-sidebar-muted)]">Crédito disponível</span>
            <span className="mt-0.5 block font-mono text-base font-semibold text-[var(--success)]">
              R$ {activeCliente.limiteDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-[var(--text-on-sidebar-muted)]">Limite R$ {activeCliente.limiteCredito.toLocaleString()}</span>
          </div>
          <div className="rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--bg-sidebar-hover)] p-3">
            <span className="text-[11px] text-[var(--text-on-sidebar-muted)]">Saldo devedor</span>
            <span className="mt-0.5 block font-mono text-base font-semibold text-[var(--destructive)]">
              R$ {totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-[var(--text-on-sidebar-muted)]">{parcelasPendentes.length} parcelas ativas</span>
          </div>
        </div>
      </div>

      {/* MURAL DE COMUNICADOS E ALERTA AO CLIENTE */}
      {avisos.filter(a => a.ativo && (a.destino === 'CLIENTES' || a.destino === 'TODOS')).length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3 animate-[fadeIn_0.25s_ease]">
          <h4 className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
            <Megaphone className="w-4 h-4 text-indigo-500 shrink-0" />
            Mural de Avisos Importantes ({avisos.filter(a => a.ativo && (a.destino === 'CLIENTES' || a.destino === 'TODOS')).length})
          </h4>
          
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {avisos.filter(a => a.ativo && (a.destino === 'CLIENTES' || a.destino === 'TODOS')).map((aviso) => (
              <div 
                key={aviso.id} 
                className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                  aviso.severidade === 'Critico' ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-850 dark:text-rose-400' :
                  aviso.severidade === 'Alerta' ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-850 dark:text-amber-400' :
                  'bg-blue-50/40 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-850 dark:text-blue-300'
                }`}
              >
                <div className="flex justify-between items-center font-extrabold">
                  <span>{aviso.titulo}</span>
                  <span className="text-[9px] opacity-65 font-mono font-normal">{aviso.dataCriacao}</span>
                </div>
                <p className="leading-relaxed font-medium opacity-95">{aviso.conteudo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carnê Digital & Installment list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <h4 className="font-bold text-slate-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-sky-500" /> Carnê Digital & Pagamentos
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Clique em qualquer parcela pendente para gerar código Pix Copia e Cola.</p>
        </div>

        <div className="space-y-2">
          {clientParcelas.map((par) => {
            const isPaga = par.status === 'Paga';
            return (
              <div 
                key={par.id} 
                className={`p-3 border rounded-xl flex items-center justify-between text-xs transition ${
                  isPaga 
                    ? 'border-slate-100 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800' 
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Parcela #{par.numeroParcela} / {par.totalParcelas}</span>
                  <span className="text-[10px] text-slate-400 block">Vencimento: {new Date(par.dataVencimento).toLocaleDateString()}</span>
                  {isPaga && (
                    <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">Liquidada em {new Date(par.dataPagamento || '').toLocaleDateString()}</span>
                  )}
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">R$ {par.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold inline-block ${
                      isPaga ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {par.status}
                    </span>
                  </div>

                  {!isPaga && (
                    <button
                      type="button"
                      onClick={() => triggerPixGenerate(par)}
                      className="p-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 rounded-lg transition"
                      title="Gerar PIX"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIX COPY AND PASTE DRAWER */}
      {activePixCode && (
        <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <QrCode className="w-4 h-4" /> QR Code e Pix Copia e Cola
            </span>
            <button type="button" onClick={() => setActivePixCode(null)} className="text-[10px] text-slate-500 hover:underline">Fechar</button>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-sky-100 rounded-xl space-y-2">
            {/* Visual simulation of Pix QR Code */}
            <div className="w-28 h-28 bg-slate-100 border-2 border-slate-900 p-2 flex items-center justify-center relative">
              <div className="grid grid-cols-4 gap-1.5 w-full h-full opacity-80">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-xs ${i % 3 === 0 ? 'bg-slate-900' : 'bg-transparent'}`} />
                ))}
              </div>
              <span className="absolute text-[9px] font-mono font-bold bg-white text-slate-900 px-1 py-0.2 border border-slate-900 rounded">PIX</span>
            </div>
            
            <button
              type="button"
              onClick={handleCopyPix}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <ClipboardCheck className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Código Pix Copia e Cola'}
            </button>
          </div>
        </div>
      )}

      {/* Credit and profile utilities */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setShowLimitForm(!showLimitForm);
            setShowUpdateForm(false);
            setLimitStatus(null);
          }}
          className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-center text-xs font-semibold hover:bg-slate-50 transition text-slate-800 dark:text-slate-200"
        >
          Solicitar Limite
        </button>
        <button
          type="button"
          onClick={() => {
            setShowUpdateForm(!showUpdateForm);
            setShowLimitForm(false);
            setUpdateStatusText(null);
          }}
          className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-center text-xs font-semibold hover:bg-slate-50 transition text-slate-800 dark:text-slate-200"
        >
          Atualizar Cadastro
        </button>
      </div>

      {/* Credit Request Panel */}
      {showLimitForm && (
        <form onSubmit={handleRequestLimit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-[fadeIn_0.2s_ease]">
          <h5 className="font-bold text-xs text-slate-950 dark:text-white uppercase tracking-wider block">Solicitar Aumento de Limite</h5>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Valor de Limite Solicitado (R$)</label>
            <input
              type="number"
              required
              value={solValue}
              onChange={e => setSolValue(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-950 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">Justificativa / Motivo</label>
            <textarea
              required
              value={solMotivo}
              onChange={e => setSolMotivo(e.target.value)}
              placeholder="Ex: Gostaria de parcelar materiais de reforma"
              className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-transparent text-slate-950 dark:text-white h-16 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-1.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-lg text-xs font-semibold">
              Enviar Solicitação
            </button>
            <button type="button" onClick={() => setShowLimitForm(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {limitStatus && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
          {limitStatus}
        </div>
      )}

      {/* Profile update request */}
      {showUpdateForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
          <h5 className="font-bold text-xs text-slate-950 dark:text-white uppercase tracking-wider block">Solicitar Atualização Cadastral</h5>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Celular de Contato</label>
              <input
                type="text"
                value={updatePhone}
                onChange={e => setUpdatePhone(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 bg-transparent text-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Logradouro / Endereço</label>
              <input
                type="text"
                value={updateAddress}
                onChange={e => setUpdateAddress(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 bg-transparent text-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block">Empresa de Vínculo</label>
              <input
                type="text"
                value={updateCompany}
                onChange={e => setUpdateCompany(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 bg-transparent text-slate-950 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setUpdateStatusText('Sua solicitação de atualização cadastral foi enviada com sucesso ao setor de conformidade!');
                  setShowUpdateForm(false);
                }}
                className="flex-1 py-1.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-lg text-xs font-semibold"
              >
                Salvar Solicitação
              </button>
              <button type="button" onClick={() => setShowUpdateForm(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {updateStatusText && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 rounded-xl text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
          {updateStatusText}
        </div>
      )}

      {/* Customer Chat Support simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h4 className="font-bold text-slate-950 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-emerald-500" /> Suporte em Tempo Real
        </h4>

        {/* Messages feed */}
        <div className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl p-3 h-48 overflow-y-auto space-y-3">
          {chatMessages.map((msg) => {
            const isMe = msg.sender === 'CLIENTE';
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-2.5 rounded-2xl max-w-[80%] text-xs ${
                  isMe 
                    ? 'bg-slate-950 text-white dark:bg-slate-800' 
                    : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}>
                  <p>{msg.text}</p>
                </div>
                <span className="text-[8px] text-slate-400 mt-0.5">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={newMsgText}
            onChange={e => setNewMsgText(e.target.value)}
            placeholder="Digite sua mensagem de suporte..."
            className="flex-1 text-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 bg-transparent text-slate-950 dark:text-white focus:outline-none"
          />
          <button type="submit" className="p-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 rounded-xl transition">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
