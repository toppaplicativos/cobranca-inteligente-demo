import React, { useState, useEffect } from 'react';
import { Cliente, Parcela, Venda } from '../types';
import { 
  Plus, Check, DollarSign, Calendar, Landmark, RotateCcw, 
  ShieldAlert, FileText, TrendingUp, Coins, Receipt, Percent, 
  Clock, ArrowRight, Search, Printer, QrCode, Smartphone, Send, 
  AlertTriangle, Copy, CheckCircle, RefreshCw
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { MetricStrip } from './ui/MetricStrip';
import { FormField } from './ui/FormField';
import { selectClass, inputClass, sectionTitleClass, overlayClass, modalClass } from '../lib/formStyles';

interface FinancialOpsProps {
  clientes: Cliente[];
  parcelas: Parcela[];
  vendas: Venda[];
  onAddVenda: (venda: Venda, novasParcelas: Parcela[]) => void;
  onUpdateParcela: (parcela: Parcela) => void;
}

export default function FinancialOps({ clientes, parcelas, vendas, onAddVenda, onUpdateParcela }: FinancialOpsProps) {
  const [selectedClienteId, setSelectedClienteId] = useState('');
  
  // Nova Venda / Concessão de Crédito State
  const [showNewVenda, setShowNewVenda] = useState(false);
  const [vendaValorTotal, setVendaValorTotal] = useState<number>(1200);
  const [vendaEntrada, setVendaEntrada] = useState<number>(200);
  const [vendaNumParcelas, setVendaNumParcelas] = useState<number>(6);
  const [vendaDescricao, setVendaDescricao] = useState('');
  const [vendaIntervalo, setVendaIntervalo] = useState<'DIARIO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL'>('MENSAL');
  const [vendaTaxaJuros, setVendaTaxaJuros] = useState<number>(3.5); // % por período
  const [vendaTipoJuros, setVendaTipoJuros] = useState<'SIMPLES' | 'COMPOSTOS' | 'NENHUM'>('SIMPLES');
  const [vendaMultaAtraso, setVendaMultaAtraso] = useState<number>(2.0); // % multa flat por atraso
  const [vendaJurosMoraDiario, setVendaJurosMoraDiario] = useState<number>(0.33); // % juros diários após vencimento

  // Checkout & Detalhes da Fatura State
  const [activeCheckoutParcela, setActiveCheckoutParcela] = useState<Parcela | null>(null);
  const [checkoutFormaPagamento, setCheckoutFormaPagamento] = useState<Parcela['formaPagamento']>('PIX');
  const [checkoutDesconto, setCheckoutDesconto] = useState<number>(0);
  const [checkoutComprovanteSimulado, setCheckoutComprovanteSimulado] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showReciboPrint, setShowReciboPrint] = useState<Parcela | null>(null);

  // Baixa / Recebimento Modal State (Quick action fallback)
  const [showBaixaModal, setShowBaixaModal] = useState<Parcela | null>(null);
  const [baixaForma, setBaixaForma] = useState<Parcela['formaPagamento']>('PIX');
  const [baixaDesconto, setBaixaDesconto] = useState<number>(0);
  const [baixaJuros, setBaixaJuros] = useState<number>(0);
  const [baixaMulta, setBaixaMulta] = useState<number>(0);
  const [baixaObs, setBaixaObs] = useState('');

  // Renegociação Modal State
  const [showRenegociarModal, setShowRenegociarModal] = useState<Parcela | null>(null);
  const [renegData, setRenegData] = useState('');
  const [renegDesconto, setRenegDesconto] = useState<number>(0);

  // Search filter for transactions
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Pendente' | 'Paga' | 'Atrasada' | 'Renegociada'>('TODOS');

  // Filter clients that can buy
  const activeClientes = clientes.filter(c => c.status === 'Ativo');
  const selectedCliente = clientes.find(c => c.id === selectedClienteId);

  // Helper date calculator
  const obterDataVencimento = (dataBase: Date, parcelaNum: number, intervalo: 'DIARIO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL') => {
    const d = new Date(dataBase);
    if (intervalo === 'DIARIO') {
      d.setDate(d.getDate() + parcelaNum);
    } else if (intervalo === 'SEMANAL') {
      d.setDate(d.getDate() + (parcelaNum * 7));
    } else if (intervalo === 'QUINZENAL') {
      d.setDate(d.getDate() + (parcelaNum * 15));
    } else if (intervalo === 'MENSAL') {
      d.setMonth(d.getMonth() + parcelaNum);
    }
    return d.toISOString().split('T')[0];
  };

  // Live projection calculations
  const calcularValoresProjetados = () => {
    const valorFinanciado = Math.max(0, vendaValorTotal - vendaEntrada);
    let jurosTotais = 0;
    let valorTotalComJuros = valorFinanciado;

    if (valorFinanciado > 0) {
      if (vendaTipoJuros === 'SIMPLES') {
        jurosTotais = valorFinanciado * (vendaTaxaJuros / 100) * vendaNumParcelas;
        valorTotalComJuros = valorFinanciado + jurosTotais;
      } else if (vendaTipoJuros === 'COMPOSTOS') {
        valorTotalComJuros = valorFinanciado * Math.pow(1 + (vendaTaxaJuros / 100), vendaNumParcelas);
        jurosTotais = valorTotalComJuros - valorFinanciado;
      }
    } else {
      valorTotalComJuros = 0;
    }

    const valorCadaParcela = vendaNumParcelas > 0 ? Number((valorTotalComJuros / vendaNumParcelas).toFixed(2)) : 0;
    
    return {
      valorFinanciado,
      jurosTotais: Number(jurosTotais.toFixed(2)),
      valorTotalComJuros: Number(valorTotalComJuros.toFixed(2)),
      valorCadaParcela
    };
  };

  const { valorFinanciado, jurosTotais, valorTotalComJuros, valorCadaParcela } = calcularValoresProjetados();

  // Dynamic late-fees calculator (calculates based on actual system local time!)
  const calcularEncargosAtraso = (par: Parcela) => {
    if (par.status === 'Paga') {
      return {
        diasAtraso: 0,
        multa: par.valorMulta,
        juros: par.valorJuros,
        total: par.valorPago
      };
    }

    const dataVenc = new Date(par.dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataVenc.setHours(0, 0, 0, 0);

    const diffTime = hoje.getTime() - dataVenc.getTime();
    const diasAtraso = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Find custom sale rates or use robust defaults
    const vendaRelacionada = vendas.find(v => v.id === par.vendaId);
    const txMulta = vendaRelacionada?.multaAtraso ?? vendaMultaAtraso; 
    const txJurosDiario = vendaRelacionada?.jurosMoraDiario ?? vendaJurosMoraDiario; 

    let multa = 0;
    let juros = 0;

    if (diasAtraso > 0) {
      multa = par.valorOriginal * (txMulta / 100);
      juros = par.valorOriginal * (txJurosDiario / 100) * diasAtraso;
    }

    return {
      diasAtraso,
      multa: Number(multa.toFixed(2)),
      juros: Number(juros.toFixed(2)),
      total: Number((par.valorOriginal + multa + juros).toFixed(2))
    };
  };

  // Registra Nova Venda / Concessão de Crédito
  const handleCreateVenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) {
      alert('Selecione um cliente para prosseguir!');
      return;
    }
    if (vendaValorTotal <= 0) {
      alert('O valor total da venda deve ser maior que zero!');
      return;
    }
    if (vendaNumParcelas < 1) {
      alert('Defina pelo menos 1 parcela para o plano!');
      return;
    }

    const { valorFinanciado, valorTotalComJuros, valorCadaParcela } = calcularValoresProjetados();

    if (valorFinanciado > (selectedCliente?.limiteDisponivel || 0)) {
      if (!confirm(`Alerta de Risco! O valor financiado (R$ ${valorFinanciado.toFixed(2)}) ultrapassa o limite disponível do cliente (R$ ${selectedCliente?.limiteDisponivel.toFixed(2)}). Deseja forçar e aprovar esta concessão extraordinária?`)) {
        return;
      }
    }

    const vId = `VEN-${Math.floor(100 + Math.random() * 900)}`;
    const novaVenda: Venda = {
      id: vId,
      clienteId: selectedClienteId,
      clienteNome: selectedCliente?.nome || '',
      dataVenda: new Date().toISOString().split('T')[0],
      valorTotal: Number((vendaValorTotal + jurosTotais).toFixed(2)),
      entrada: vendaEntrada,
      numeroParcelas: vendaNumParcelas,
      descricao: vendaDescricao || `Concessão de Crédito em Plano ${vendaIntervalo}`,
      status: valorFinanciado <= 0 ? 'Quitada' : 'Ativa',
      intervalo: vendaIntervalo,
      taxaJuros: vendaTaxaJuros,
      tipoJuros: vendaTipoJuros,
      multaAtraso: vendaMultaAtraso,
      jurosMoraDiario: vendaJurosMoraDiario
    };

    const novasParcelas: Parcela[] = [];
    if (valorFinanciado > 0) {
      const dataVendaObj = new Date();
      for (let i = 1; i <= vendaNumParcelas; i++) {
        const dataVencStr = obterDataVencimento(dataVendaObj, i, vendaIntervalo);

        novasParcelas.push({
          id: `PAR-${Math.floor(1000 + Math.random() * 9000)}`,
          clienteId: selectedClienteId,
          clienteNome: selectedCliente?.nome || '',
          vendaId: vId,
          numeroParcela: i,
          totalParcelas: vendaNumParcelas,
          dataVencimento: dataVencStr,
          valorOriginal: i === vendaNumParcelas 
            ? Number((valorTotalComJuros - (valorCadaParcela * (vendaNumParcelas - 1))).toFixed(2)) // Dízima
            : valorCadaParcela,
          valorJuros: 0,
          valorMulta: 0,
          valorDesconto: 0,
          valorPago: 0,
          status: 'Pendente'
        });
      }
    }

    onAddVenda(novaVenda, novasParcelas);
    setShowNewVenda(false);
    
    // Reset form states
    setVendaValorTotal(1200);
    setVendaEntrada(200);
    setVendaNumParcelas(6);
    setVendaDescricao('');
  };

  // Processa Baixa Simplificada (Legado)
  const handleProcessarBaixa = () => {
    if (!showBaixaModal) return;

    const originalVal = showBaixaModal.valorOriginal;
    const finalVal = Number((originalVal + baixaJuros + baixaMulta - baixaDesconto).toFixed(2));

    const updated: Parcela = {
      ...showBaixaModal,
      valorJuros: baixaJuros,
      valorMulta: baixaMulta,
      valorDesconto: baixaDesconto,
      valorPago: finalVal,
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: baixaForma,
      status: 'Paga',
      observacao: baixaObs
    };

    onUpdateParcela(updated);
    setShowBaixaModal(null);
    setBaixaDesconto(0);
    setBaixaJuros(0);
    setBaixaMulta(0);
    setBaixaObs('');
  };

  // Processa Baixa pelo Painel de Checkout Inteligente (Prioritário)
  const handleCheckoutBaixa = () => {
    if (!activeCheckoutParcela) return;

    const { multa, juros } = calcularEncargosAtraso(activeCheckoutParcela);
    const totalComEncargos = activeCheckoutParcela.valorOriginal + multa + juros;
    const finalVal = Number((totalComEncargos - checkoutDesconto).toFixed(2));

    const updated: Parcela = {
      ...activeCheckoutParcela,
      valorJuros: juros,
      valorMulta: multa,
      valorDesconto: checkoutDesconto,
      valorPago: finalVal,
      dataPagamento: new Date().toISOString().split('T')[0],
      formaPagamento: checkoutFormaPagamento,
      status: 'Paga',
      observacao: `Quitado no Checkout Inteligente via ${checkoutFormaPagamento}. ${checkoutDesconto > 0 ? `Desconto de R$ ${checkoutDesconto}` : ''}`
    };

    onUpdateParcela(updated);
    setActiveCheckoutParcela(null);
    setCheckoutDesconto(0);
    setCheckoutComprovanteSimulado(false);
    alert(`Recebimento registrado com sucesso! Parcela quitada.`);
  };

  // Processa Estorno de Parcela
  const handleEstornar = (par: Parcela) => {
    if (confirm(`Tem certeza que deseja estornar o pagamento da Parcela #${par.numeroParcela} de R$ ${par.valorPago}?`)) {
      const updated: Parcela = {
        ...par,
        valorPago: 0,
        dataPagamento: undefined,
        formaPagamento: undefined,
        status: 'Pendente',
        observacao: `Estornado em ${new Date().toLocaleDateString('pt-BR')}`
      };
      onUpdateParcela(updated);
    }
  };

  // Processa Renegociação
  const handleProcessarRenegociacao = () => {
    if (!showRenegociarModal) return;

    const finalVal = Number((showRenegociarModal.valorOriginal - renegDesconto).toFixed(2));
    const updated: Parcela = {
      ...showRenegociarModal,
      valorOriginal: finalVal,
      valorDesconto: renegDesconto,
      dataVencimento: renegData || showRenegociarModal.dataVencimento,
      status: 'Renegociada',
      observacao: `Renegociada: Desconto de R$ ${renegDesconto}. Vencimento alterado para ${renegData}.`
    };

    onUpdateParcela(updated);
    setShowRenegociarModal(null);
  };

  // WhatsApp reminder template builder
  const handleCopyWppRemind = (par: Parcela) => {
    const { total } = calcularEncargosAtraso(par);
    const text = `Olá, ${par.clienteNome}! Relembramos que sua parcela (${par.numeroParcela}/${par.totalParcelas}) da fatura ${par.vendaId} venceu em ${new Date(par.dataVencimento).toLocaleDateString('pt-BR')}. Valor atualizado com juros: R$ ${total.toFixed(2)}. Chave Pix para pagamento rápido: financeiro@cobrancainteligente.com.br. Envie o comprovante!`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filtragem de parcelas do cliente selecionado e filtros de busca/status
  const parcelasFiltradas = parcelas.filter(p => {
    // 1. Filtro de Cliente
    if (selectedClienteId && p.clienteId !== selectedClienteId) return false;
    
    // 2. Filtro de Status
    if (statusFilter !== 'TODOS') {
      if (statusFilter === 'Pendente' && p.status !== 'Pendente') return false;
      if (statusFilter === 'Paga' && p.status !== 'Paga') return false;
      if (statusFilter === 'Atrasada' && p.status !== 'Atrasada') return false;
      if (statusFilter === 'Renegociada' && p.status !== 'Renegociada') return false;
    }

    // 3. Busca livre (Nome do cliente ou código da venda)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchNome = p.clienteNome.toLowerCase().includes(query);
      const matchVenda = p.vendaId.toLowerCase().includes(query);
      const matchId = p.id.toLowerCase().includes(query);
      return matchNome || matchVenda || matchId;
    }

    return true;
  });

  // Consolidação financeira do cliente selecionado (Acompanhamento de Checkout & Faturamento)
  const consolidadoCliente = () => {
    if (!selectedClienteId) return null;
    const clientPars = parcelas.filter(p => p.clienteId === selectedClienteId);
    
    const faturamentoBruto = clientPars.reduce((acc, curr) => acc + curr.valorOriginal, 0);
    const totalLiquidado = clientPars.filter(p => p.status === 'Paga').reduce((acc, curr) => acc + curr.valorPago, 0);
    const saldoEmAberto = clientPars.filter(p => p.status !== 'Paga').reduce((acc, curr) => acc + curr.valorOriginal, 0);
    
    const parcelasAtraso = clientPars.filter(p => p.status === 'Atrasada');
    const valorEmAtraso = parcelasAtraso.reduce((acc, curr) => acc + curr.valorOriginal, 0);
    
    const jurosEfetivos = clientPars.filter(p => p.status === 'Paga').reduce((acc, curr) => acc + curr.valorJuros, 0);
    const multaEfetiva = clientPars.filter(p => p.status === 'Paga').reduce((acc, curr) => acc + curr.valorMulta, 0);

    return {
      faturamentoBruto,
      totalLiquidado,
      saldoEmAberto,
      qtdAtraso: parcelasAtraso.length,
      valorEmAtraso,
      encargosLiquidados: jurosEfetivos + multaEfetiva
    };
  };

  const stats = consolidadoCliente();

  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <Panel className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <FormField label="Cliente para faturamento" className="flex-1 max-w-md">
            <Select
              value={selectedClienteId}
              onChange={(e) => {
                setSelectedClienteId(e.target.value);
                setSearchQuery('');
              }}
              className="w-full"
            >
              <option value="">Todos os clientes da carteira</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.id}) — {c.status}
                </option>
              ))}
            </Select>
          </FormField>

          {selectedClienteId && selectedCliente?.status === 'Ativo' && (
            <Button type="button" onClick={() => setShowNewVenda(!showNewVenda)}>
              <Plus className="size-4" />
              {showNewVenda ? 'Fechar formulário' : 'Nova concessão de crédito'}
            </Button>
          )}
        </div>

        {selectedClienteId && stats && (
          <MetricStrip
            items={[
              { id: 'fat', label: 'Faturamento total', value: `R$ ${fmt(stats.faturamentoBruto)}`, detail: 'Todos os contratos' },
              { id: 'liq', label: 'Montante recebido', value: `R$ ${fmt(stats.totalLiquidado)}`, detail: `Juros R$ ${stats.encargosLiquidados.toFixed(2)}`, tone: 'success' },
              { id: 'aberto', label: 'Saldo devedor', value: `R$ ${fmt(stats.saldoEmAberto)}`, detail: `Limite livre R$ ${selectedCliente?.limiteDisponivel.toFixed(2)}`, tone: 'accent' },
              { id: 'atraso', label: 'Inadimplência', value: `R$ ${fmt(stats.valorEmAtraso)}`, detail: `${stats.qtdAtraso} faturas em atraso`, tone: 'destructive' },
            ]}
          />
        )}
      </Panel>

      {/* FORMULÁRIO COMPLETO E AVANÇADO DE CONCESSÃO DE CRÉDITO */}
      {showNewVenda && selectedCliente && (
        <Panel padding="lg" className="space-y-5">
        <form onSubmit={handleCreateVenda} className="space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Coins className="size-5 text-[var(--accent)]" aria-hidden />
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-sm">Painel do Concessor: Criar Novo Contrato e Parcelas</h3>
              <p className="text-[11px] text-slate-500">Amortização flexível por intervalo, juros calculados na fonte e simulação real do carnê</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* INPUTS ESQUERDO */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Finalidade da Concessão de Crédito</label>
                  <input
                    type="text"
                    required
                    value={vendaDescricao}
                    onChange={e => setVendaDescricao(e.target.value)}
                    placeholder="Ex: Financiamento de enxoval de roupas, mercadorias, empréstimo livre"
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-transparent text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Valor Total Financiado (R$)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={vendaValorTotal}
                    onChange={e => setVendaValorTotal(Number(e.target.value))}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-transparent text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Valor de Entrada (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={vendaEntrada}
                    onChange={e => setVendaEntrada(Number(e.target.value))}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-transparent text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Frequência dos Vencimentos</label>
                  <select
                    value={vendaIntervalo}
                    onChange={e => setVendaIntervalo(e.target.value as any)}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-white dark:bg-slate-950 text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="DIARIO">Diário (Todo dia consecutivamente)</option>
                    <option value="SEMANAL">Semanal (De 7 em 7 dias)</option>
                    <option value="QUINZENAL">Quinzenal (De 15 em 15 dias)</option>
                    <option value="MENSAL">Mensal (De 30 em 30 dias)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Definir Número de Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={vendaNumParcelas}
                    onChange={e => setVendaNumParcelas(Number(e.target.value))}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-transparent text-[var(--text-primary)] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* ABAS DE REGRAS DE JUROS E MULTAS */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Metodologia e Amortização de Juros</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Regime de Juros</label>
                    <select
                      value={vendaTipoJuros}
                      onChange={e => setVendaTipoJuros(e.target.value as any)}
                      className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-900 text-[var(--text-primary)]"
                    >
                      <option value="SIMPLES">Juros Simples (Flat)</option>
                      <option value="COMPOSTOS">Juros Compostos (Mês/Período)</option>
                      <option value="NENHUM">Sem Juros Embutidos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Taxa de Juros (%) por parcela</label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={vendaTipoJuros === 'NENHUM'}
                      value={vendaTaxaJuros}
                      onChange={e => setVendaTaxaJuros(Number(e.target.value))}
                      className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Multa por Atraso (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vendaMultaAtraso}
                      onChange={e => setVendaMultaAtraso(Number(e.target.value))}
                      className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Juros de Mora Diários por Atraso (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={vendaJurosMoraDiario}
                        onChange={e => setVendaJurosMoraDiario(Number(e.target.value))}
                        className="w-28 text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)]"
                      />
                      <span className="text-[10px] text-slate-500">Equivale a {((vendaJurosMoraDiario * 30)).toFixed(1)}% ao mês em atraso sobre as faturas devidas.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOX DE PROJEÇÃO DE CRÉDITO E PARCELAMENTO */}
            <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-[var(--border)] p-4 space-y-4">
              <h4 className="font-extrabold text-[var(--text-primary)] text-xs  border-b border-[var(--border)] pb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Projeção Real do Plano
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor Inicial:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">R$ {vendaValorTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrada Deduzida:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">- R$ {vendaEntrada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2 font-medium">
                  <span className="text-slate-600">Principal Financiado:</span>
                  <span className="text-[var(--text-primary)]">R$ {valorFinanciado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-650 dark:text-indigo-400">
                  <span>Juros Totais Embutidos ({vendaTaxaJuros}%):</span>
                  <span className="font-bold">+ R$ {jurosTotais.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2 text-sm font-extrabold text-[var(--text-primary)]">
                  <span>Total Carnê:</span>
                  <span>R$ {valorTotalComJuros.toFixed(2)}</span>
                </div>

                <div className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-[var(--border)]/80 text-center space-y-1 mt-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-widest">Valor por Parcela</span>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 block">
                    {vendaNumParcelas}x de R$ {valorCadaParcela.toFixed(2)}
                  </span>
                  <span className="text-[8px] text-slate-500 block">Frequência: {vendaIntervalo}</span>
                </div>
              </div>

              {/* CREDIT WARNING */}
              {valorFinanciado > (selectedCliente?.limiteDisponivel || 0) && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-xl text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong>Limite Excedido!</strong> O cliente possui apenas R$ {selectedCliente.limiteDisponivel.toFixed(2)} de limite livre. Esta operação exigirá autorização forçada.
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewVenda(false)}
                  className="flex-1 px-3 py-2 border border-[var(--border)] hover:bg-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition"
                >
                  Gerar Carnê
                </button>
              </div>
            </div>
          </div>
        </form>
        </Panel>
      )}

      <Panel className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
              <Receipt className="size-4 text-[var(--accent)]" aria-hidden /> Faturamento e checkout
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Faturas, Pix e liquidação prioritária</p>
          </div>

          {/* FILTRO RAPIDO DE STATUS */}
          <div className="flex w-full min-w-0 overflow-x-auto overscroll-x-contain gap-1 border border-[var(--border)] p-1 rounded-[var(--radius-control)] scrollbar-none sm:w-auto">
            {['TODOS', 'Pendente', 'Paga', 'Atrasada', 'Renegociada'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* BUSCA E DETALHES LIVRES */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar parcela por nome do cliente ou código da venda (VEN-XX)..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/30 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* TABELA DE CHECKOUT DE PARCELAS */}
        <div className="hidden md:block overflow-x-auto rounded-[var(--radius-control)] border border-[var(--border)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/30 text-slate-500 font-bold border-b border-slate-150 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Fatura / Parcela</th>
                <th className="px-4 py-3.5">Cliente</th>
                <th className="px-4 py-3.5">Vencimento</th>
                <th className="px-4 py-3.5 text-right">Valor Original</th>
                <th className="px-4 py-3.5 text-right">Encargos (Multa/Juros)</th>
                <th className="px-4 py-3.5 text-right">Faturamento Final</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Checkout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parcelasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-450 font-medium">Nenhuma fatura encontrada com os filtros ativos.</td>
                </tr>
              ) : (
                parcelasFiltradas.map((par) => {
                  const { diasAtraso, juros, multa, total } = calcularEncargosAtraso(par);
                  
                  return (
                    <tr key={par.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {par.vendaId} <span className="text-indigo-600 dark:text-indigo-400 font-bold">({par.numeroParcela}/{par.totalParcelas})</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-850 dark:text-slate-200">{par.clienteNome}</td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {new Date(par.dataVencimento).toLocaleDateString('pt-BR')}
                        {diasAtraso > 0 && par.status !== 'Paga' && (
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded ml-1.5">
                            {diasAtraso} dias de atraso
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        R$ {par.valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-rose-500 font-medium">
                        {par.status === 'Paga' ? (
                          par.valorJuros + par.valorMulta > 0 ? (
                            <span>+ R$ {(par.valorJuros + par.valorMulta).toFixed(2)}</span>
                          ) : '-'
                        ) : (
                          juros + multa > 0 ? (
                            <span className="font-semibold text-rose-600">+ R$ {(juros + multa).toFixed(2)}</span>
                          ) : '-'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-[var(--text-primary)]">
                        R$ {par.status === 'Paga' 
                          ? par.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
                          : total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        }
                        {par.status === 'Paga' && (
                          <span className="text-[9px] text-emerald-500 block font-normal">via {par.formaPagamento}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          par.status === 'Paga' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          par.status === 'Atrasada' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                          par.status === 'Renegociada' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' :
                          'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {par.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {par.status !== 'Paga' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveCheckoutParcela(par)}
                                title="Abrir Checkout Inteligente Pix/Boleto/Recibo"
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold flex items-center gap-1 transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Checkout
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setShowRenegociarModal(par);
                                  setRenegData(par.dataVencimento);
                                }}
                                title="Renegociar Vencimento / Conceder Desconto"
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 rounded transition"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setShowReciboPrint(par)}
                                title="Visualizar/Imprimir Recibo Térmico"
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded transition"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEstornar(par)}
                                title="Estornar Liquidação"
                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* LISTAGEM DE FATURAS (Mobile Only) */}
        <div className="block md:hidden space-y-4">
          {parcelasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">Nenhuma fatura encontrada para exibição.</div>
          ) : (
            parcelasFiltradas.map((par) => {
              const { diasAtraso, juros, multa, total } = calcularEncargosAtraso(par);
              
              return (
                <div key={par.id} className="bg-slate-50/60 dark:bg-slate-950/10 border border-[var(--border)] rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-150 dark:border-slate-800/60 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                        {par.vendaId} ({par.numeroParcela}/{par.totalParcelas})
                      </span>
                      <strong className="text-[var(--text-primary)] block mt-1 text-sm font-extrabold">{par.clienteNome}</strong>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      par.status === 'Paga' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' :
                      par.status === 'Atrasada' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {par.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs leading-relaxed">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Vencimento</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(par.dataVencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Faturamento Original</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        R$ {par.valorOriginal.toFixed(2)}
                      </span>
                    </div>

                    {diasAtraso > 0 && par.status !== 'Paga' && (
                      <div className="col-span-2 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/35 p-2 rounded-xl text-[10px]">
                        <span className="font-bold text-rose-600 dark:text-rose-450 block">Overdue (+{diasAtraso} dias de atraso):</span>
                        <div className="flex justify-between text-rose-500">
                          <span>Multa ({vendaMultaAtraso}%): R$ {multa.toFixed(2)}</span>
                          <span>Juros Mora Diário: R$ {juros.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-center text-sm">
                      <span className="font-extrabold text-[var(--text-primary)]">
                        {par.status === 'Paga' ? 'Montante Pago' : 'Total Checkout'}
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        R$ {par.status === 'Paga' ? par.valorPago.toFixed(2) : total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-stretch justify-end gap-1.5 border-t border-[var(--border)] pt-2">
                    {par.status !== 'Paga' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveCheckoutParcela(par)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Iniciar Checkout
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRenegociarModal(par);
                            setRenegData(par.dataVencimento);
                          }}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowReciboPrint(par)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Imprimir Recibo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEstornar(par)}
                          className="p-1.5 bg-rose-50 text-rose-500 rounded-xl"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Panel>

      {/* MODAL / PAINEL DE CHECKOUT INTELIGENTE (REAL-TIME INTERESTS, PIX QR CODE & RECEIPT) */}
      {activeCheckoutParcela && (() => {
        const { diasAtraso, juros, multa, total } = calcularEncargosAtraso(activeCheckoutParcela);
        const valorAposDesconto = Number((total - checkoutDesconto).toFixed(2));
        
        return (
          <div className={overlayClass}>
            <div className={`${modalClass} animate-[fadeIn_0.15s_ease]`}>
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-[var(--text-primary)] text-base">Checkout Inteligente de Fatura</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCheckoutParcela(null);
                    setCheckoutDesconto(0);
                    setCheckoutComprovanteSimulado(false);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 rounded-full transition text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* CARD DE DADOS DA FATURA COM ENCARGOS CALCULADOS AO VIVO */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3 text-xs leading-relaxed">
                <div className="flex justify-between items-center border-b border-slate-250/50 dark:border-slate-800/50 pb-2">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Cliente</span>
                    <span className="font-extrabold text-[var(--text-primary)] text-sm">{activeCheckoutParcela.clienteNome}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Documento Contrato</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeCheckoutParcela.vendaId} (Par. {activeCheckoutParcela.numeroParcela}/{activeCheckoutParcela.totalParcelas})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Vencimento Original:</span>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{new Date(activeCheckoutParcela.dataVencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status do Lançamento:</span>
                    <p className="font-bold text-rose-500 flex items-center gap-1">{activeCheckoutParcela.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Valor Principal Original:</span>
                    <p className="font-extrabold text-[var(--text-primary)]">R$ {activeCheckoutParcela.valorOriginal.toFixed(2)}</p>
                  </div>
                </div>

                {/* ENCARGOS DE ATRASO ADICIONADOS EM REAL-TIME */}
                {diasAtraso > 0 && (
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/30 rounded-xl space-y-1.5 animate-[fadeIn_0.2s_ease]">
                    <div className="flex justify-between font-bold text-rose-700 dark:text-rose-400 text-[10px] ">
                      <span>Cálculo de Juros e Aplicação Prioritária:</span>
                      <span>+{diasAtraso} dias em atraso</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-rose-600 dark:text-rose-450">
                      <span>Multa por Atraso Recorrente ({vendaMultaAtraso}%):</span>
                      <span className="font-semibold">+ R$ {multa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-rose-600 dark:text-rose-450">
                      <span>Juros de Mora Acumulados ({vendaJurosMoraDiario}% ao dia):</span>
                      <span className="font-semibold">+ R$ {juros.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ABAS DE PAGAMENTO (PIX QR CODE VS MANUAL) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Método de Quitação</label>
                  <select
                    value={checkoutFormaPagamento}
                    onChange={e => setCheckoutFormaPagamento(e.target.value as any)}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-2.5 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="PIX">Pix (Geração de QR Code)</option>
                    <option value="DINHEIRO">Dinheiro (Em Mãos)</option>
                    <option value="CARTAO">Cartão Crédito/Débito</option>
                    <option value="BOLETO">Boleto Registrado</option>
                    <option value="TRANSFERENCIA">TED/DOC Bancário</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Conceder Desconto Extra (R$)</label>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    value={checkoutDesconto}
                    onChange={e => setCheckoutDesconto(Number(e.target.value))}
                    className="w-full text-xs border border-[var(--border)] rounded-xl px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO VISUAL DO PIX - QR CODE REALÍSTICO COM CHAVE */}
              {checkoutFormaPagamento === 'PIX' && (
                <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 rounded-2xl space-y-3.5 text-center flex flex-col items-center animate-[fadeIn_0.2s_ease]">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border)] shadow-xs">
                    {/* SVG de QR Code Mockup de Alta Fidelidade */}
                    <svg className="w-32 h-32 text-indigo-950 dark:text-white" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="none" />
                      <path d="M5 5h30v30H5V5zm3 3v24h24V8H8zm6 6h12v12H14V14zM5 65h30v30H5V65zm3 3v24h24V68H8zm6 6h12v12H14V74zM65 5h30v30H65V5zm3 3v24h24V8H68zm6 6h12v12H74V14z" fill="currentColor" />
                      <path d="M45 10h10v10H45zm10 15H45v10h10zm10 15H45v10h10zm20 15H65v10h20zM45 55h10v10H45zm15 15H45v15h15zm30-20H65v5h25v-5zm-25 15h15v10H65zm25 10H80v5h10zm-5 10h5v5h-5z" fill="currentColor" />
                      <circle cx="50" cy="50" r="10" fill="#4f46e5" />
                      <path d="M47 50h6v1H47zm3-3h1v6h-1z" fill="white" />
                    </svg>
                  </div>

                  <div className="w-full space-y-1.5 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-300">Pix Copia e Cola (Chave Estática de Checkout)</p>
                    <div className="flex border border-[var(--border)] rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/50">
                      <input
                        type="text"
                        readOnly
                        value={`00020101021226870014br.gov.bcb.pix2565pix.cobrancainteligente.com.br/checkout/${activeCheckoutParcela.id}?value=${valorAposDesconto}`}
                        className="flex-1 bg-transparent px-2.5 py-1.5 font-mono text-[9px] text-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`00020101021226870014br.gov.bcb.pix2565pix.cobrancainteligente.com.br/checkout/${activeCheckoutParcela.id}?value=${valorAposDesconto}`);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border-l border-slate-300/40"
                      >
                        {isCopied ? 'Copiado!' : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RÉGUA DE COBRANÇA / AVISOS DE CHECKOUT */}
              <div className="p-3 bg-emerald-50/25 dark:bg-emerald-950/10 border border-emerald-100/35 rounded-2xl space-y-2 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-300 block">Régua de Notificação Manual</span>
                  <span className="text-[10px] text-slate-500 block">Copie a mensagem de aviso adaptada para WhatsApp e envie ao cliente</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyWppRemind(activeCheckoutParcela)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 transition shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Cobrança WhatsApp
                </button>
              </div>

              {/* SIMULADOR DE COMPROVANTE */}
              <div className="flex items-center justify-between text-xs p-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600 dark:text-slate-450">
                  <input
                    type="checkbox"
                    checked={checkoutComprovanteSimulado}
                    onChange={e => setCheckoutComprovanteSimulado(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Anexar comprovante de faturamento e quitação assinado digitalmente
                </label>
              </div>

              {/* TOTAL A LIQUIDAR E CONFIRMAÇÃO */}
              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs text-[var(--text-muted)]">Total liquidado com juros:</span>
                  <strong className="text-lg font-semibold text-[var(--text-primary)]">
                    R$ {valorAposDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCheckoutParcela(null);
                      setCheckoutDesconto(0);
                      setCheckoutComprovanteSimulado(false);
                    }}
                    className="px-3.5 py-2 border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckoutBaixa}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/15 transition"
                  >
                    Confirmar Liquidação (Dar Baixa)
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* RENEGOCIAR MODAL */}
      {showRenegociarModal && (
        <div className={overlayClass}>
          <div className={modalClass}>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Renegociação — {showRenegociarModal.clienteNome}</h4>
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Mude datas de vencimento ou conceda descontos estruturais para acordos de inadimplência.</p>
              <div className="flex justify-between font-bold mt-1.5 pt-1 border-t border-indigo-200/40">
                <span>Vencimento Anterior:</span>
                <span>{new Date(showRenegociarModal.dataVencimento).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Novo Desconto de Renegociação (R$)</label>
                <input
                  type="number"
                  value={renegDesconto}
                  onChange={e => setRenegDesconto(Number(e.target.value))}
                  className="w-full text-xs border border-[var(--border)] rounded-xl px-2.5 py-2 bg-transparent text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Novo Vencimento Prorrogado</label>
                <input
                  type="date"
                  value={renegData}
                  onChange={e => setRenegData(e.target.value)}
                  className="w-full text-xs border border-[var(--border)] rounded-xl px-2.5 py-2 bg-transparent text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Valor renegociado: <strong className="text-[var(--text-primary)]">
                  R$ {Math.max(0, showRenegociarModal.valorOriginal - renegDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowRenegociarModal(null)}
                  className="px-3 py-1.5 border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleProcessarRenegociacao}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Registrar Acordo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE RECIBO TÉRMICO MOCK IMPRESSÃO (HIGH-FIDELITY DESIGN) */}
      {showReciboPrint && (
        <div className={overlayClass}>
          <div className={`${modalClass} font-mono text-xs leading-relaxed relative`}>
            <button
              type="button"
              onClick={() => setShowReciboPrint(null)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕
            </button>
            
            <div className="text-center space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <strong className="text-sm block">SISTEMA COBRANÇA INTELIGENTE</strong>
              <p className="text-[10px]">AV. PAULISTA, 1000 - SÃO PAULO - SP</p>
              <p className="text-[9px]">CNPJ: 00.123.456/0001-99</p>
              <p className="text-[11px] font-bold mt-2">COMPROVANTE OFICIAL DE QUITAÇÃO</p>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
              <p><strong>CÓDIGO DA PARCELA:</strong> {showReciboPrint.id}</p>
              <p><strong>CÓDIGO DO CONTRATO:</strong> {showReciboPrint.vendaId}</p>
              <p><strong>CLIENTE:</strong> {showReciboPrint.clienteNome}</p>
              <p><strong>DATA DO PAGAMENTO:</strong> {showReciboPrint.dataPagamento ? new Date(showReciboPrint.dataPagamento).toLocaleDateString('pt-BR') : '-'}</p>
              <p><strong>METODO DE LIQUIDAÇÃO:</strong> {showReciboPrint.formaPagamento}</p>
            </div>

            <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>VALOR PARCELA BASE:</span>
                <span>R$ {showReciboPrint.valorOriginal.toFixed(2)}</span>
              </div>
              {showReciboPrint.valorMulta > 0 && (
                <div className="flex justify-between">
                  <span>MULTA POR ATRASO (+):</span>
                  <span>R$ {showReciboPrint.valorMulta.toFixed(2)}</span>
                </div>
              )}
              {showReciboPrint.valorJuros > 0 && (
                <div className="flex justify-between">
                  <span>JUROS MORATÓRIOS (+):</span>
                  <span>R$ {showReciboPrint.valorJuros.toFixed(2)}</span>
                </div>
              )}
              {showReciboPrint.valorDesconto > 0 && (
                <div className="flex justify-between">
                  <span>DESCONTO CONCEDIDO (-):</span>
                  <span>R$ {showReciboPrint.valorDesconto.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-dashed border-slate-200">
                <span>TOTAL LIQUIDADO:</span>
                <span>R$ {showReciboPrint.valorPago.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] space-y-1">
              <p className="italic">Autenticação Digital:</p>
              <p className="font-mono text-[9px] break-all text-slate-500">MD5: {Math.random().toString(36).substring(2, 10).toUpperCase()}-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              <p className="font-bold text-emerald-600 mt-2">TRANSACÇÃO APROVADA PELO CAIXA</p>
              
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-4 w-full bg-slate-900 text-white font-mono py-1.5 rounded-lg hover:bg-slate-850 transition"
              >
                [IMPRIMIR COMPROVANTE]
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
