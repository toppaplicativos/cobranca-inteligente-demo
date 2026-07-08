import React, { useState } from 'react';
import { FileSpreadsheet, Download, Landmark, BarChart2, ShieldAlert, Users, Compass } from 'lucide-react';
import { Cliente, Parcela, Venda, LogAuditoria } from '../types';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { TableScroll } from './ui/TableScroll';
import { inputClass } from '../lib/formStyles';

interface ReportsExplorerProps {
  clientes: Cliente[];
  parcelas: Parcela[];
  vendas: Venda[];
  logs: LogAuditoria[];
}

interface ReportItem {
  id: string;
  nome: string;
  descricao: string;
  gerarDados: (clientes: Cliente[], parcelas: Parcela[], vendas: Venda[], logs: LogAuditoria[]) => { headers: string[]; rows: any[][] };
}

export default function ReportsExplorer({ clientes, parcelas, vendas, logs }: ReportsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedReportId, setSelectedReportId] = useState<string>('c-1');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [filterRegion, setFilterRegion] = useState('');

  // DEFINIÇÃO DE TODOS OS 42 RELATÓRIOS (6 categorias x 7 relatórios)
  const CATEGORIES = [
    {
      nome: 'Caixa & Tesouraria',
      icon: Landmark,
      reports: [
        {
          id: 'c-1',
          nome: 'Fluxo de Caixa Consolidado',
          descricao: 'Entradas e saídas financeiras consolidadas por período.',
          gerarDados: () => ({
            headers: ['Data', 'Tipo', 'Descrição', 'Valor (R$)'],
            rows: [
              ['05/07/2026', 'Entrada', 'Recebimento Parcela PAR-003', '590,00'],
              ['04/07/2026', 'Entrada', 'Recebimento Parcela PAR-011', '270,00'],
              ['03/07/2026', 'Entrada', 'Adiantamento de entrada de carnê', '250,00'],
              ['02/07/2026', 'Saída', 'Compra de bobinas para impressora portátil', '85,00'],
              ['01/07/2026', 'Saída', 'Manutenção corretiva de moto de entregador', '150,00'],
              ['30/06/2026', 'Entrada', 'Fechamento de Caixa Semanal - Rota Central', '3.420,00'],
            ]
          })
        },
        {
          id: 'c-2',
          nome: 'Recebimentos Diários por Cobrador',
          descricao: 'Arrecadação detalhada de hoje dividida por entregador.',
          gerarDados: () => ({
            headers: ['Cobrador', 'Rota', 'Bairros Atendidos', 'Total Arrecadado (R$)', 'Status Rota'],
            rows: [
              ['Marcos Entregador', 'Rota Centro - Bela Vista', 'Bela Vista, Centro', '860,00', 'Em Andamento'],
              ['Roberto Cobrador', 'Rota Norte', 'Santana, Tucuruvi', '1.240,00', 'Concluída'],
              ['Aline Souza', 'Rota Sul', 'Ipiranga, Saúde', '1.580,00', 'Concluída'],
              ['Julio Lima', 'Rota Leste', 'Tatuapé, Penha', '0,00', 'Agendada']
            ]
          })
        },
        {
          id: 'c-3',
          nome: 'Conciliação Bancária de Pix e Cartões',
          descricao: 'Checagem de depósitos automáticos via Pix QR Code e maquininha.',
          gerarDados: () => ({
            headers: ['ID Transação', 'Data', 'Forma', 'Cliente', 'Valor Liquido (R$)', 'Status'],
            rows: [
              ['TX-998822', '05/07/2026', 'PIX', 'Carlos Silva Santos', '590,00', 'Conciliado'],
              ['TX-998823', '04/07/2026', 'PIX', 'Mariana Oliveira Costa', '400,00', 'Conciliado'],
              ['TX-998824', '03/07/2026', 'CARTAO', 'Carlos Silva Santos', '1.200,00', 'Pendente Conciliação']
            ]
          })
        },
        {
          id: 'c-4',
          nome: 'Relatório de Estornos e Reversões',
          descricao: 'Auditoria de cancelamento de baixas financeiras por administradores.',
          gerarDados: () => ({
            headers: ['Data Reversão', 'Parcela ID', 'Cliente', 'Valor Estornado (R$)', 'Autorizado Por'],
            rows: [
              ['04/07/2026', 'PAR-009', 'Mariana Oliveira Costa', '400,00', 'admin@cobranca.com'],
              ['28/06/2026', 'PAR-014', 'Fernando Pereira Souza', '250,00', 'admin@cobranca.com']
            ]
          })
        },
        {
          id: 'c-5',
          nome: 'Comissões de Cobradores',
          descricao: 'Cálculo de bônus por produtividade e taxas de recuperação de atraso.',
          gerarDados: () => ({
            headers: ['Cobrador', 'Recuperado (R$)', 'Meta (R$)', '% Alcançado', 'Comissão Devida (R$)'],
            rows: [
              ['Marcos Entregador', '12.450,00', '15.000,00', '83%', '622,50'],
              ['Roberto Cobrador', '16.200,00', '15.000,00', '108%', '810,00'],
              ['Aline Souza', '15.000,00', '15.000,00', '100%', '750,00']
            ]
          })
        },
        {
          id: 'c-6',
          nome: 'Previsão de Caixa para Próximos 30 dias',
          descricao: 'Projeção de fluxo de caixa baseada em parcelas futuras ativas.',
          gerarDados: () => ({
            headers: ['Semana Projeção', 'Parcelas a Vencer', 'Valor Estimado (R$)', 'Inadimplência Histórica %', 'Previsão Realista (R$)'],
            rows: [
              ['06/07 a 12/07', '18 parcelas', '10.800,00', '12%', '9.504,00'],
              ['13/07 a 19/07', '22 parcelas', '13.200,00', '12%', '11.616,00'],
              ['20/07 a 26/07', '15 parcelas', '9.000,00', '12%', '7.920,00']
            ]
          })
        },
        {
          id: 'c-7',
          nome: 'Saldo e Fechamento de Contas',
          descricao: 'Balanço de saldos em cofres internos e contas bancárias vinculadas.',
          gerarDados: () => ({
            headers: ['Banco / Conta', 'Agência', 'Número Conta', 'Finalidade', 'Saldo Atual (R$)'],
            rows: [
              ['Banco do Brasil', '1202-3', '45.120-X', 'Centralizadora de Boletos', '45.890,20'],
              ['Itaú Unibanco', '0300', '12.345-6', 'Recebimento de PIX instantâneo', '82.411,50'],
              ['Cofre Escritório Principal', '-', '-', 'Troco em espécie para rotas', '2.500,00']
            ]
          })
        }
      ]
    },
    {
      nome: 'Vendas & Faturamento',
      icon: BarChart2,
      reports: [
        {
          id: 'v-1',
          nome: 'Vendas por Período de Crediário',
          descricao: 'Controle de vendas faturadas diretamente em carnês próprios.',
          gerarDados: () => ({
            headers: ['Período', 'Total Vendas', 'Carnês Gerados', 'Valor Médio (R$)', 'Status Geral'],
            rows: [
              ['Julho 2026', '5', '5', '850,00', 'Crescimento'],
              ['Junho 2026', '18', '18', '1.200,00', 'Estável'],
              ['Maio 2026', '24', '24', '1.100,00', 'Estável']
            ]
          })
        },
        {
          id: 'v-2',
          nome: 'Ranking de Vendas por Bairro',
          descricao: 'Análise geográfica de densidade de vendas por crediário.',
          gerarDados: () => ({
            headers: ['Bairro', 'Cidade', 'Quantidade de Vendas', 'Valor Total (R$)', '% do Faturamento'],
            rows: [
              ['Bela Vista', 'São Paulo', '42', '54.200,00', '35%'],
              ['Centro', 'Campinas', '28', '32.100,00', '21%'],
              ['Gonzaga', 'Santos', '15', '21.500,00', '14%'],
              ['Alves Dias', 'SBC', '12', '15.400,00', '10%']
            ]
          })
        },
        {
          id: 'v-3',
          nome: 'Análise de Ticket Médio de Compras',
          descricao: 'Cálculo de ticket médio geral e segmentado por classificação de cliente.',
          gerarDados: () => ({
            headers: ['Classificação do Cliente', 'Total Comprado (R$)', 'Quantidade Compras', 'Ticket Médio (R$)'],
            rows: [
              ['Clientes Excelente', '45.200,00', '30', '1.506,66'],
              ['Clientes Bom', '28.400,00', '35', '811,42'],
              ['Clientes Alto Risco', '15.200,00', '30', '506,66']
            ]
          })
        },
        {
          id: 'v-4',
          nome: 'Vendas por Tipo de Vínculo de Trabalho',
          descricao: 'Aderência de carnês com base no emprego declarado.',
          gerarDados: () => ({
            headers: ['Vínculo Trabalho', 'Total Crediário Emitido (R$)', 'Inadimplência Histórica', 'Score Médio'],
            rows: [
              ['CLT', '142.500,00', '3.2%', '810'],
              ['Autônomo', '84.100,00', '14.5%', '450'],
              ['Aposentado/Pensionista', '92.400,00', '4.1%', '760']
            ]
          })
        },
        {
          id: 'v-5',
          nome: 'Percentual de Vendas com Entrada',
          descricao: 'Avaliação de risco comparando carnês com e sem entrada inicial.',
          gerarDados: () => ({
            headers: ['Modalidade', 'Vendas Efetuadas', 'Volume (R$)', 'Inadimplência Média %'],
            rows: [
              ['Vendas Com Entrada Inicial', '145', '185.000,00', '2.5%'],
              ['Vendas Sem Entrada Inicial', '210', '240.000,00', '9.8%']
            ]
          })
        },
        {
          id: 'v-6',
          nome: 'Lançamento de Parcelas Futuras por Cliente',
          descricao: 'Listagem de parcelas ativas a vencer nos próximos meses.',
          gerarDados: () => ({
            headers: ['Cliente', 'Nº Parcelas Ativas', 'Próximo Vencimento', 'Valor Total Futuro (R$)'],
            rows: [
              ['Carlos Silva Santos', '2', '05/08/2026', '1.200,00'],
              ['Mariana Oliveira Costa', '2', '15/07/2026', '800,00'],
              ['Fernando Pereira Souza', '2', '22/07/2026', '500,00']
            ]
          })
        },
        {
          id: 'v-7',
          nome: 'Análise de Cancelamentos e Devoluções',
          descricao: 'Histórico de devolução de produtos e cancelamento de carnês.',
          gerarDados: () => ({
            headers: ['Data', 'Contrato ID', 'Cliente', 'Motivo Cancelamento', 'Estorno Efetuado (R$)'],
            rows: [
              ['15/06/2026', 'VEN-011', 'Marcos Toledo', 'Devolução por defeito no móvel', '1.200,00'],
              ['10/06/2026', 'VEN-019', 'Zélia Ramos', 'Arrependimento em 7 dias', '450,00']
            ]
          })
        }
      ]
    },
    {
      nome: 'Cobrança & Recebimentos',
      icon: Compass,
      reports: [
        {
          id: 'cb-1',
          nome: 'Desempenho de Rotas Diárias',
          descricao: 'Taxa de conversão de visitas e recolhimento financeiro por cobrador.',
          gerarDados: () => ({
            headers: ['Cobrador', 'Visitas Agendadas', 'Visitas Efetuadas', 'Promessas de Pago', 'Total Coletado (R$)'],
            rows: [
              ['Marcos Entregador', '12', '10', '2', '1.860,00'],
              ['Roberto Cobrador', '15', '15', '0', '2.400,00'],
              ['Aline Souza', '10', '9', '1', '1.150,00']
            ]
          })
        },
        {
          id: 'cb-2',
          nome: 'Relatório de Promessas de Pagamento',
          descricao: 'Acompanhamento de prazos de acordos verbais com inadimplentes.',
          gerarDados: () => ({
            headers: ['Cliente', 'Valor Acordado (R$)', 'Data Promessa', 'Responsável Cobrança', 'Status'],
            rows: [
              ['Fernando Pereira Souza', '250,00', '10/07/2026', 'Marcos Entregador', 'Pendente'],
              ['Beatriz Souza Lima', '500,00', '03/07/2026', 'Aline Souza', 'Quebrada']
            ]
          })
        },
        {
          id: 'cb-3',
          nome: 'Visitas Infrutíferas e Ausências',
          descricao: 'Mapeamento de residências de clientes visitadas sem sucesso.',
          gerarDados: () => ({
            headers: ['Cliente', 'Data Visita', 'Endereço', 'Motivo Ocorrência', 'Tentativa Nº'],
            rows: [
              ['Beatriz Souza Lima', '05/07/2026', 'Rua Marechal Deodoro, 800 - SBC', 'Cliente ausente', '2ª Tentativa'],
              ['Fernando Pereira Souza', '02/07/2026', 'Avenida Ana Costa, 250 - Gonzaga', 'Mudou-se de endereço', '1ª Tentativa']
            ]
          })
        },
        {
          id: 'cb-4',
          nome: 'Aproveitamento de Cobrança por Região',
          descricao: 'Efetividade geográfica de recebimento e recuperação.',
          gerarDados: () => ({
            headers: ['Região', 'Total em Aberto (R$)', 'Total Cobrado (R$)', 'Recuperação %'],
            rows: [
              ['Zona Central (Capital)', '15.400,00', '13.200,00', '85.7%'],
              ['ABC Paulista', '22.100,00', '8.400,00', '38.0%'],
              ['Baixada Santista', '8.500,00', '6.100,00', '71.7%']
            ]
          })
        },
        {
          id: 'cb-5',
          nome: 'Descontos Concedidos em Negociações',
          descricao: 'Auditoria de perdas planejadas para regularização de devedores.',
          gerarDados: () => ({
            headers: ['Data Acordo', 'Cliente', 'Valor Original (R$)', 'Desconto Concedido (R$)', '% Desconto'],
            rows: [
              ['02/07/2026', 'Carlos Silva Santos', '600,00', '10,00', '1.6%'],
              ['25/06/2026', 'Mariana Oliveira Costa', '400,00', '40,00', '10.0%']
            ]
          })
        },
        {
          id: 'cb-6',
          nome: 'Mapeamento de Rotas Otimizadas por GPS',
          descricao: 'Consumo de rotas geradas via algoritmo do menor caminho.',
          gerarDados: () => ({
            headers: ['ID Rota', 'KMs Planejados', 'KMs Rodados', 'Tempo Estimado (h)', 'Custo Combustível Estimado (R$)'],
            rows: [
              ['ROT-001', '14.5 km', '15.2 km', '2.5h', '35,00'],
              ['ROT-002', '32.1 km', '34.8 km', '5.0h', '72,50']
            ]
          })
        },
        {
          id: 'cb-7',
          nome: 'Comprovantes Emitidos em Campo',
          descricao: 'Log de comprovantes digitais gerados pelos cobradores externos.',
          gerarDados: () => ({
            headers: ['ID Comprovante', 'Data/Hora', 'Cliente', 'Valor Recebido (R$)', 'Assinatura Coletada'],
            rows: [
              ['REC-44102', '05/07/2026 10:12', 'Carlos Silva Santos', '600,00', 'Sim (Digital)'],
              ['REC-44103', '04/07/2026 14:30', 'Mariana Oliveira Costa', '400,00', 'Sim (Digital)']
            ]
          })
        }
      ]
    },
    {
      nome: 'Inadimplência & Risco',
      icon: ShieldAlert,
      reports: [
        {
          id: 'i-1',
          nome: 'Clientes com Atraso Crítico (+30 dias)',
          descricao: 'Devedores com prazos estendidos de atraso passíveis de negativação.',
          gerarDados: () => ({
            headers: ['Cliente', 'CPF', 'Parcelas Atrasadas', 'Dias de Atraso Médio', 'Total Devido (R$)'],
            rows: [
              ['Beatriz Souza Lima', '456.789.012-34', '3 parcelas', '116 dias', '1.500,00'],
              ['Fernando Pereira Souza', '345.678.901-23', '1 parcela', '13 dias', '250,00']
            ]
          })
        },
        {
          id: 'i-2',
          nome: 'Índice de Inadimplência por Score de Risco',
          descricao: 'Cruzamento de devedores com score de risco interno original.',
          gerarDados: () => ({
            headers: ['Score de Risco', 'Total Carteira (R$)', 'Total Atrasado (R$)', 'Inadimplência Real %'],
            rows: [
              ['Excelente', '52.400,00', '0,00', '0.0%'],
              ['Bom', '32.100,00', '1.200,00', '3.7%'],
              ['Alto Risco', '12.400,00', '3.120,00', '25.1%'],
              ['Bloqueado', '5.200,00', '4.200,00', '80.7%']
            ]
          })
        },
        {
          id: 'i-3',
          nome: 'Envelhecimento de Parcelas (Ageing List)',
          descricao: 'Enquadramento de dívidas em abas temporais de atraso (1-15, 16-30, +30).',
          gerarDados: () => ({
            headers: ['Intervalo de Atraso', 'Qtd Parcelas', 'Valor Principal (R$)', 'Proporção da Carteira %'],
            rows: [
              ['Em dia / A vencer', '45 parcelas', '22.500,00', '78.5%'],
              ['1 a 15 dias de atraso', '4 parcelas', '1.250,00', '4.3%'],
              ['16 a 30 dias de atraso', '2 parcelas', '800,00', '2.8%'],
              ['Mais de 30 dias de atraso', '6 parcelas', '4.100,00', '14.4%']
            ]
          })
        },
        {
          id: 'i-4',
          nome: 'Histórico de Acordos de Renegociação Quebrados',
          descricao: 'Mapeamento de clientes que descumpriram promessas e prazos renegociados.',
          gerarDados: () => ({
            headers: ['Cliente', 'Data Acordo', 'Parcelas Acordadas', 'Entrada Paga (R$)', 'Parcelas Restantes em Atraso'],
            rows: [
              ['Beatriz Souza Lima', '10/05/2026', '3 parcelas', '150,00', '3 parcelas']
            ]
          })
        },
        {
          id: 'i-5',
          nome: 'Previsão de Perdas de Crediário (Provisão PDD)',
          descricao: 'Cálculo de provisão para devedores duvidosos em conformidade financeira.',
          gerarDados: () => ({
            headers: ['Faixa Risco', 'Saldo Devedor (R$)', '% PDD Aplicado', 'Perda Provisionada (R$)'],
            rows: [
              ['Bom / Sem Atraso', '21.500,00', '1.5%', '322,50'],
              ['Atraso Médio (16-30 dias)', '1.800,00', '25.0%', '450,00'],
              ['Atraso Grave (+30 dias)', '4.100,00', '75.0%', '3.075,00']
            ]
          })
        },
        {
          id: 'i-6',
          nome: 'Probabilidade de Inadimplência Futura por Cliente',
          descricao: 'Modelagem de inteligência artificial de previsão de quebra de parcelas.',
          gerarDados: () => ({
            headers: ['Cliente', 'Score IA', 'Probabilidade de Atraso %', 'Limite Recomendado (R$)'],
            rows: [
              ['Carlos Silva Santos', '98/100', '0.2%', '5.000,00'],
              ['Mariana Oliveira Costa', '78/100', '4.5%', '3.000,00'],
              ['Fernando Pereira Souza', '42/100', '32.1%', '1.500,00'],
              ['Beatriz Souza Lima', '12/100', '88.5%', '0,00']
            ]
          })
        },
        {
          id: 'i-7',
          nome: 'Clientes Bloqueados para Novas Compras',
          descricao: 'Listagem de CPF bloqueados de forma sistêmica por quebra de regra de crédito.',
          gerarDados: () => ({
            headers: ['Cliente', 'CPF', 'Data Bloqueio', 'Motivo Bloqueio', 'Total em Atraso (R$)'],
            rows: [
              ['Beatriz Souza Lima', '456.789.012-34', '15/04/2026', 'Atraso crítico superior a 45 dias', '1.500,00']
            ]
          })
        }
      ]
    },
    {
      nome: 'Clientes & Limites',
      icon: Users,
      reports: [
        {
          id: 'cl-1',
          nome: 'Ranking Geral de Compras de Clientes',
          descricao: 'Ranking dos melhores clientes em volume faturado no crediário.',
          gerarDados: () => ({
            headers: ['Posição', 'Cliente', 'Total Comprado (R$)', 'Total Pago (R$)', 'Score de Risco'],
            rows: [
              ['1º', 'Carlos Silva Santos', '12.400,00', '10.600,00', 'Excelente'],
              ['2º', 'Mariana Oliveira Costa', '6.200,00', '5.000,00', 'Bom'],
              ['3º', 'Fernando Pereira Souza', '3.500,00', '2.250,00', 'Alto Risco'],
              ['4º', 'Beatriz Souza Lima', '2.500,00', '1.600,00', 'Bloqueado']
            ]
          })
        },
        {
          id: 'cl-2',
          nome: 'Limites de Crédito Ativos e Disponíveis',
          descricao: 'Monitoramento de exposição financeira por cliente.',
          gerarDados: () => ({
            headers: ['Cliente', 'Limite Total (R$)', 'Limite Utilizado (R$)', 'Limite Disponível (R$)', '% Consumido'],
            rows: [
              ['Carlos Silva Santos', '5.000,00', '1.800,00', '3.200,00', '36%'],
              ['Mariana Oliveira Costa', '3.000,00', '1.200,00', '1.800,00', '40%'],
              ['Fernando Pereira Souza', '1.500,00', '1.250,00', '250,00', '83%'],
              ['Beatriz Souza Lima', '1.000,00', '900,00', '100,00', '90%']
            ]
          })
        },
        {
          id: 'cl-3',
          nome: 'Análise Demográfica de Crediário por Sexo e Estado Civil',
          descricao: 'Perfil de compras com foco demográfico.',
          gerarDados: () => ({
            headers: ['Segmento', 'Qtd Clientes', 'Faturamento Total (R$)', 'Inadimplência do Segmento %'],
            rows: [
              ['Masculino Casado', '28', '45.120,00', '1.2%'],
              ['Feminino Solteira', '35', '32.100,00', '4.5%'],
              ['Masculino Divorciado', '12', '12.450,00', '14.8%']
            ]
          })
        },
        {
          id: 'cl-4',
          nome: 'Novos Clientes Cadastrados por Período',
          descricao: 'Acompanhamento do ritmo de captação de clientes.',
          gerarDados: () => ({
            headers: ['Mês Cadastro', 'Novos Clientes', 'Aprovados', 'Reprovados / Bloqueados', 'Limite Médio Aprovado'],
            rows: [
              ['Julho 2026', '2', '1', '1', '4.000,00'],
              ['Junho 2026', '12', '10', '2', '2.500,00'],
              ['Maio 2026', '15', '12', '3', '2.100,00']
            ]
          })
        },
        {
          id: 'cl-5',
          nome: 'Clientes Inativos com Saldo Zero',
          descricao: 'Identificação de clientes sem novas compras a mais de 120 dias.',
          gerarDados: () => ({
            headers: ['Cliente', 'Última Compra', 'Dias de Inatividade', 'Limite Total (R$)', 'WhatsApp'],
            rows: [
              ['Ana Júlia Rodrigues', 'Nenhuma', 'Nova', '4.000,00', '(11) 96543-2109']
            ]
          })
        },
        {
          id: 'cl-6',
          nome: 'Atualizações Cadastrais Pendentes',
          descricao: 'Clientes com comprovantes vencidos ou inconsistências de dados.',
          gerarDados: () => ({
            headers: ['Cliente', 'Inconsistência', 'Idade do Cadastro', 'Último Contato', 'Ação Sugerida'],
            rows: [
              ['Fernando Pereira Souza', 'Endereço inconsistente na rota', '109 dias', '02/07/2026', 'Solicitar Comprovante novo'],
              ['Beatriz Souza Lima', 'Renda familiar desatualizada', '180 dias', '05/07/2026', 'Solicitar Holerite']
            ]
          })
        },
        {
          id: 'cl-7',
          nome: 'Solicitações de Aumento de Limite',
          descricao: 'Pedidos de crédito feitos pelos clientes via canal exclusivo.',
          gerarDados: () => ({
            headers: ['Cliente', 'Valor Atual (R$)', 'Valor Solicitado (R$)', 'Score Interno', 'Status'],
            rows: [
              ['Mariana Oliveira Costa', '3.000,00', '4.500,00', '710 (Bom)', 'Pendente'],
              ['Carlos Silva Santos', '4.000,00', '5.000,00', '920 (Excelente)', 'Aprovado']
            ]
          })
        }
      ]
    },
    {
      nome: 'Segurança & Auditoria',
      icon: ShieldAlert,
      reports: [
        {
          id: 's-1',
          nome: 'Logs Completos de Acesso e Auditoria',
          descricao: 'Registros de acessos de administradores e cobradores externos.',
          gerarDados: (c, p, v, logs) => ({
            headers: ['Data/Hora', 'Usuário', 'Papel', 'Ação Realizada', 'IP Origem'],
            rows: logs.map(l => [
              new Date(l.timestamp).toLocaleDateString('pt-BR') + ' ' + new Date(l.timestamp).toLocaleTimeString('pt-BR'),
              l.usuario,
              l.papel,
              l.acao,
              l.ip
            ])
          })
        },
        {
          id: 's-2',
          nome: 'Histórico de Alterações de Limite de Crédito',
          descricao: 'Histórico de ações manuais que modificaram limite de devedores.',
          gerarDados: () => ({
            headers: ['Data Modificação', 'Cliente', 'Limite Anterior (R$)', 'Novo Limite (R$)', 'Responsável'],
            rows: [
              ['04/07/2026', 'Carlos Silva Santos', '4.000,00', '5.000,00', 'admin@cobranca.com'],
              ['15/06/2026', 'Mariana Oliveira Costa', '2.500,00', '3.000,00', 'admin@cobranca.com']
            ]
          })
        },
        {
          id: 's-3',
          nome: 'Auditoria de Exclusão de Registros',
          descricao: 'Rastreabilidade de exclusões e baixas canceladas no sistema.',
          gerarDados: () => ({
            headers: ['Data/Hora', 'Usuário', 'Recurso Excluído', 'Detalhes Técnicos', 'IP'],
            rows: [
              ['01/07/2026 18:42', 'admin@cobranca.com', 'Documento RG', 'rg_marcos_velho.pdf', '192.168.1.100']
            ]
          })
        },
        {
          id: 's-4',
          nome: 'Relatório LGPD de Consentimento de Dados',
          descricao: 'Verificação de termos de aceite e consentimento de dados sensíveis dos devedores.',
          gerarDados: () => ({
            headers: ['Cliente', 'Tipo de Consentimento', 'Data do Aceite', 'Versão do Termo', 'Armazenamento Criptografado'],
            rows: [
              ['Carlos Silva Santos', 'Contrato Crediário & LGPD', '10/01/2025', 'v2.4 - LGPD', 'Sim (AES-256)'],
              ['Mariana Oliveira Costa', 'Contrato Crediário & LGPD', '15/02/2025', 'v2.4 - LGPD', 'Sim (AES-256)'],
              ['Fernando Pereira Souza', 'Contrato Crediário & LGPD', '20/03/2025', 'v2.4 - LGPD', 'Sim (AES-256)']
            ]
          })
        },
        {
          id: 's-5',
          nome: 'Logs de Falhas de Login e Bloqueios Temporários',
          descricao: 'Acompanhamento de tentativas maliciosas de invasão de contas.',
          gerarDados: () => ({
            headers: ['Data/Hora', 'E-mail Digitado', 'Erro Apresentado', 'IP Tentativa', 'Ação de Segurança'],
            rows: [
              ['05/07/2026 01:24', 'root@cobranca.com', 'Senha incorreta', '45.123.8.92', 'Bloqueio de IP temporário'],
              ['04/07/2026 23:12', 'admin@cobranca.com', 'Senha incorreta', '192.168.1.200', 'Aviso enviado ao e-mail']
            ]
          })
        },
        {
          id: 's-6',
          nome: 'Permissões Ativas por Usuário (RBAC)',
          descricao: 'Mapeamento de privilégios de acesso do sistema.',
          gerarDados: () => ({
            headers: ['Usuário', 'Perfil / Cargo', 'Módulos Permitidos', 'Acesso Financeiro', 'Último Update'],
            rows: [
              ['admin@cobrancainteligente.com.br', 'Administrador', 'Todos os módulos', 'Acesso Total', '05/07/2026'],
              ['marcos.cobrador@cobranca.com.br', 'Entregador / Cobrador', 'Visualizar rotas, registrar pagamentos', 'Apenas Baixas', '05/07/2026']
            ]
          })
        },
        {
          id: 's-7',
          nome: 'Relatório de Logs de Backups Executados',
          descricao: 'Histórico de sincronizações em nuvem e backups criptografados.',
          gerarDados: () => ({
            headers: ['Backup ID', 'Data/Hora', 'Tipo Backup', 'Tamanho do Arquivo', 'Status de Integridade'],
            rows: [
              ['BKP-20260705', '05/07/2026 03:00', 'Completo (PostgreSQL + S3)', '142.5 MB', 'Sucesso (Verificado)'],
              ['BKP-20260704', '04/07/2026 03:00', 'Completo (PostgreSQL + S3)', '141.2 MB', 'Sucesso (Verificado)']
            ]
          })
        }
      ]
    }
  ];

  const currentCategory = CATEGORIES[selectedCategory];
  const activeReport = currentCategory.reports.find(r => r.id === selectedReportId) || currentCategory.reports[0];
  const reportData = activeReport.gerarDados(clientes, parcelas, vendas, logs);

  // Trigger real CSV Download for any of the 42 reports!
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for excel
    
    // Header
    csvContent += reportData.headers.join(";") + "\n";
    
    // Rows
    reportData.rows.forEach(row => {
      csvContent += row.join(";") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${activeReport.nome.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryTabs = CATEGORIES.map((cat, idx) => ({
    id: String(idx),
    label: cat.nome.split(' ')[0],
    icon: cat.icon,
  }));

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <Panel className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <FileSpreadsheet className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
          Central de relatórios (42 modelos)
        </h3>
        <p className="text-xs text-[var(--text-muted)]">Auditoria, risco, recebimento e caixa com exportação CSV.</p>
      </Panel>

      <div className="space-y-4 lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="min-w-0 space-y-3 lg:col-span-1">
          <div className="lg:hidden">
            <SegmentedTabs
              items={categoryTabs}
              activeId={String(selectedCategory)}
              onChange={(id) => {
                const idx = Number(id);
                setSelectedCategory(idx);
                setSelectedReportId(CATEGORIES[idx].reports[0].id);
              }}
              scrollable
            />
          </div>

          <Panel padding="sm" className="hidden space-y-1 lg:block">
            <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Categorias</span>
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(idx);
                    setSelectedReportId(cat.reports[0].id);
                  }}
                  className={`flex w-full items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-xs font-medium transition ${
                    selectedCategory === idx
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{cat.nome}</span>
                </button>
              );
            })}
          </Panel>

          <Panel padding="sm" className="space-y-2">
            <label className="block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Relatório
            </label>
            <Select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full text-xs lg:hidden"
            >
              {currentCategory.reports.map((rep) => (
                <option key={rep.id} value={rep.id}>{rep.nome}</option>
              ))}
            </Select>
            <div className="hidden max-h-[280px] space-y-0.5 overflow-y-auto lg:block">
              {currentCategory.reports.map((rep) => (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`block w-full truncate rounded-[var(--radius-control)] p-2 text-left text-xs font-medium transition ${
                    selectedReportId === rep.id
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {rep.nome}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <Panel className="min-w-0 space-y-4 lg:col-span-3">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">{activeReport.nome}</h4>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{activeReport.descricao}</p>
            </div>
            <Button type="button" onClick={handleExportCSV} size="sm" className="w-full shrink-0 sm:w-auto">
              <Download className="size-4" /> Exportar CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-muted)] p-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">Data inicial</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">Data final</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">Região / bairro</label>
              <Input type="text" value={filterRegion} onChange={e => setFilterRegion(e.target.value)} placeholder="Ex: Bela Vista" inputSize="sm" />
            </div>
          </div>

          <TableScroll>
            <table className="w-full min-w-[560px] text-xs text-left">
              <thead className="border-b border-[var(--border)] bg-[var(--bg-muted)] font-medium text-[var(--text-muted)]">
                <tr>
                  {reportData.headers.map((h, i) => (
                    <th key={i} className="whitespace-nowrap px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="transition hover:bg-[var(--bg-muted)]">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="whitespace-nowrap px-4 py-2.5 font-medium text-[var(--text-primary)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </Panel>
      </div>
    </div>
  );
}
