import React, { useState } from 'react';
import { Cliente, Parcela } from '../types';
import { Panel } from './ui/Panel';

interface ChartsProps {
  clientes: Cliente[];
  parcelas: Parcela[];
}

export default function Charts({ clientes, parcelas }: ChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // 1. Dados para Gráfico de Recebimentos por Mês (Mock + reais)
  // Consolidando os dados
  const mensalidades = [
    { mes: 'Jan', valor: 4500, recebido: 4500 },
    { mes: 'Fev', valor: 6200, recebido: 5800 },
    { mes: 'Mar', valor: 7800, recebido: 6100 },
    { mes: 'Abr', valor: 8900, recebido: 8100 },
    { mes: 'Mai', valor: 9500, recebido: 8700 },
    { mes: 'Jun', valor: 12100, recebido: 10200 },
    { mes: 'Jul (Atu)', valor: 8200, recebido: 3400 },
  ];

  // 2. Dados para Gráfico de Riscos de Crédito (Distribuição de Scores)
  const riscoContagem = clientes.reduce((acc, c) => {
    acc[c.scoreRisco] = (acc[c.scoreRisco] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riscoCores: Record<string, string> = {
    'Excelente': '#10b981', // emerald-500
    'Muito Bom': '#3b82f6', // blue-500
    'Bom': '#0ea5e9', // sky-500
    'Médio': '#f59e0b', // amber-500
    'Alto Risco': '#ef4444', // red-500
    'Bloqueado': '#64748b', // slate-500
  };

  const riscoCategorias = Object.keys(riscoCores).map(cat => ({
    categoria: cat,
    total: riscoContagem[cat] || 0,
    cor: riscoCores[cat]
  })).filter(c => c.total > 0);

  const totalClientesVal = riscoCategorias.reduce((acc, curr) => acc + curr.total, 0);

  // Constantes de SVG para o gráfico de barras
  const chartHeight = 160;
  const maxVal = Math.max(...mensalidades.map(m => m.valor));

  // Desenha os pedaços da rosca de risco
  let acumuladoAngulo = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Panel className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recebimentos mensais</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Faturado versus liquidado</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
              <span className="size-2.5 rounded-sm bg-[var(--border-strong)] block" aria-hidden /> Faturado
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
              <span className="size-2.5 rounded-sm bg-[var(--accent)] block" aria-hidden /> Liquidado
            </span>
          </div>
        </div>

        <div className="relative pt-2 h-[180px] flex items-end justify-between gap-2 border-b border-[var(--border)] pb-1">
          {mensalidades.map((m, idx) => {
            const faturadoHeight = (m.valor / maxVal) * chartHeight;
            const liquidadoHeight = (m.recebido / maxVal) * chartHeight;

            return (
              <div 
                key={idx} 
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {hoveredBar === idx && (
                  <div className="absolute bottom-full mb-2 bg-slate-950 text-white text-[10px] font-medium px-2 py-1.5 rounded-lg shadow-xl z-10 flex flex-col items-start gap-0.5 whitespace-nowrap">
                    <span className="font-bold text-slate-300 border-b border-slate-800 pb-0.5 mb-0.5 w-full">{m.mes} / 2026</span>
                    <span>Vendido: R$ {m.valor.toLocaleString()}</span>
                    <span className="text-sky-400 font-semibold">Recebido: R$ {m.recebido.toLocaleString()}</span>
                  </div>
                )}

                <div className="w-full flex justify-center items-end gap-1.5 h-[160px] relative">
                  {/* Faturado Bar */}
                  <div 
                    className="w-3 bg-slate-200 dark:bg-slate-800 rounded-t-sm transition-all duration-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-700" 
                    style={{ height: `${faturadoHeight}px` }}
                  />
                  {/* Liquidado Bar */}
                  <div 
                    className="w-3 bg-[var(--accent)] rounded-t-sm transition-all duration-300 group-hover:opacity-80" 
                    style={{ height: `${liquidadoHeight}px` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2 block">{m.mes}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Distribuição de risco</h3>
          <p className="text-[11px] text-[var(--text-secondary)]">Carteira por classificação de score</p>
        </div>

        <div className="flex flex-col items-center justify-center mt-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Rosca */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {totalClientesVal === 0 ? (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
              ) : (
                riscoCategorias.map((c, idx) => {
                  const percent = c.total / totalClientesVal;
                  const perimetro = 2 * Math.PI * 40; // R = 40
                  const strokeDasharray = `${percent * perimetro} ${perimetro}`;
                  const strokeDashoffset = -acumuladoAngulo * perimetro;
                  acumuladoAngulo += percent;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={c.cor}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 cursor-pointer hover:stroke-[14]"
                      onMouseEnter={() => setHoveredSlice(c.categoria)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-950 dark:text-white">{totalClientesVal}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Clientes</span>
            </div>
          </div>

          {/* Legenda Dinâmica */}
          <div className="grid grid-cols-2 gap-2 w-full mt-5">
            {riscoCategorias.map((c, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border border-transparent transition ${
                  hoveredSlice === c.categoria ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: c.cor }} />
                <div className="overflow-hidden">
                  <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 block truncate">{c.categoria}</span>
                  <span className="text-[9px] text-slate-500 block">{c.total} {c.total === 1 ? 'cliente' : 'clientes'} ({Math.round((c.total / totalClientesVal) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
