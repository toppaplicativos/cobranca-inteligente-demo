import React from 'react';
import { Cliente, Parcela } from '../types';
import { MetricStrip, MetricItem } from './ui/MetricStrip';

interface KPIsProps {
  clientes: Cliente[];
  parcelas: Parcela[];
}

export default function KPIs({ clientes, parcelas }: KPIsProps) {
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((c) => c.status === 'Ativo').length;
  const clientesBloqueados = clientes.filter((c) => c.status === 'Bloqueado').length;
  const clientesInadimplentes = clientes.filter(
    (c) => c.scoreRisco === 'Alto Risco' || c.status === 'Bloqueado'
  ).length;

  const totalVendido = parcelas.reduce((acc, curr) => acc + curr.valorOriginal, 0);
  const totalRecebido = parcelas
    .filter((p) => p.status === 'Paga')
    .reduce((acc, curr) => acc + curr.valorPago, 0);

  const totalAtrasado = parcelas
    .filter((p) => p.status === 'Atrasada')
    .reduce(
      (acc, curr) => acc + (curr.valorOriginal + curr.valorMulta + curr.valorJuros - curr.valorPago),
      0
    );

  const totalEmAberto = parcelas
    .filter((p) => p.status === 'Pendente' || p.status === 'Atrasada')
    .reduce((acc, curr) => acc + (curr.valorOriginal + curr.valorMulta + curr.valorJuros), 0);

  const recebidosHoje = parcelas
    .filter((p) => p.status === 'Paga' && p.dataPagamento === '2026-07-05')
    .reduce((acc, curr) => acc + curr.valorPago, 0);

  const indiceInadimplencia = totalEmAberto > 0 ? (totalAtrasado / totalEmAberto) * 100 : 0;
  const ticketMedio = totalClientes > 0 ? totalVendido / totalClientes : 0;

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const items: MetricItem[] = [
    {
      id: 'kpi-ativos',
      label: 'Clientes ativos',
      value: clientesAtivos,
      detail: `${clientesBloqueados} bloqueados · ${clientes.filter((c) => c.status === 'Em Análise').length} em análise`,
      tone: 'success',
    },
    {
      id: 'kpi-recebidos',
      label: 'Recebidos hoje',
      value: `R$ ${fmt(recebidosHoje)}`,
      detail: `Mês: R$ ${fmt(totalRecebido)}`,
      tone: 'accent',
    },
    {
      id: 'kpi-aberto',
      label: 'Valor em aberto',
      value: `R$ ${fmt(totalEmAberto)}`,
      detail: `Atrasado: R$ ${fmt(totalAtrasado)}`,
    },
    {
      id: 'kpi-inadimplencia',
      label: 'Inadimplência',
      value: `${indiceInadimplencia.toFixed(1)}%`,
      detail: `${clientesInadimplentes} alto risco`,
      tone: indiceInadimplencia > 15 ? 'destructive' : 'warning',
    },
    {
      id: 'kpi-vendas',
      label: 'Total vendido',
      value: `R$ ${fmt(totalVendido)}`,
      detail: `Ticket médio R$ ${fmt(ticketMedio)}`,
    },
    {
      id: 'kpi-carteira',
      label: 'Parcelas ativas',
      value: parcelas.filter((p) => p.status === 'Pendente' || p.status === 'Atrasada').length,
      detail: 'Cobráveis na carteira',
    },
  ];

  return <MetricStrip items={items} />;
}