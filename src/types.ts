export type UserRole = 'ADMIN' | 'COBRADOR' | 'CLIENTE';

export interface Reference {
  id: string;
  nome: string;
  parentesco: string;
  telefone: string;
  endereco: string;
}

export interface Documento {
  id: string;
  tipo: 'RG' | 'CPF' | 'CNH' | 'COMPROVANTE_RESIDENCIA' | 'COMPROVANTE_RENDA' | 'SELFIE' | 'CONTRATO' | 'OUTROS';
  nomeArquivo: string;
  url: string;
  dataUpload: string;
}

export interface Cliente {
  id: string;
  // Dados Pessoais
  nome: string;
  foto: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  nomeMae: string;
  nomePai: string;
  
  // Contatos
  celularPrincipal: string;
  celularSecundario: string;
  whatsApp: string;
  email: string;
  telefoneResidencial: string;
  telefoneComercial: string;

  // Endereço
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  coordenadasGps?: {
    lat: number;
    lng: number;
  };
  fotoResidencia?: string;

  // Dados Profissionais
  empresa: string;
  cargo: string;
  tempoServico: string; // Ex: "2 anos"
  salario: number;
  tipoVinculo: 'CLT' | 'Autônomo' | 'Empresário' | 'Aposentado/Pensionista' | 'Informal';
  rendaFamiliar: number;
  telefoneEmpresa: string;

  // Referências
  referencias: Reference[];

  // Dados Financeiros
  limiteCredito: number;
  limiteUtilizado: number;
  limiteDisponivel: number;
  scoreInterno: number; // 0 a 1000
  scoreRisco: 'Excelente' | 'Muito Bom' | 'Bom' | 'Médio' | 'Alto Risco' | 'Bloqueado';
  frequenciaPagamento: 'Excelente' | 'Bom' | 'Regular' | 'Inconsistente';
  mediaDiasAtraso: number;
  totalComprado: number;
  totalPago: number;
  totalEmAberto: number;
  valorMedioCompras: number;

  // Documentos
  documentos: Documento[];
  
  // Status
  status: 'Ativo' | 'Inativo' | 'Bloqueado' | 'Em Análise';
  dataCadastro: string;
}

export interface Parcela {
  id: string;
  clienteId: string;
  clienteNome: string;
  vendaId: string;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: string;
  valorOriginal: number;
  valorJuros: number;
  valorMulta: number;
  valorDesconto: number;
  valorPago: number;
  dataPagamento?: string;
  formaPagamento?: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'BOLETO' | 'TRANSFERENCIA';
  status: 'Pendente' | 'Paga' | 'Atrasada' | 'Renegociada';
  syncPending?: boolean;
  comprovanteUrl?: string;
  assinaturaUrl?: string;
  coordenadasRecebimento?: {
    lat: number;
    lng: number;
  };
  observacao?: string;
}

export interface Venda {
  id: string;
  clienteId: string;
  clienteNome: string;
  dataVenda: string;
  valorTotal: number;
  entrada: number;
  numeroParcelas: number;
  descricao: string;
  status: 'Ativa' | 'Quitada' | 'Atrasada' | 'Renegociada';
  intervalo?: 'DIARIO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL';
  taxaJuros?: number;
  tipoJuros?: 'SIMPLES' | 'COMPOSTOS' | 'NENHUM';
  multaAtraso?: number;
  jurosMoraDiario?: number;
}

export interface RotaCobranca {
  id: string;
  nome: string;
  cobradorId: string;
  cobradorNome: string;
  data: string;
  bairros: string[];
  regiao: string;
  parcelasIds: string[];
  concluida: boolean;
  status: 'Agendada' | 'Em Andamento' | 'Concluída';
}

export interface LogAuditoria {
  id: string;
  timestamp: string;
  usuario: string;
  papel: string;
  acao: string;
  detalhes: string;
  ip: string;
}

export interface ChatMessage {
  id: string;
  sender: 'CLIENTE' | 'SUPORTE';
  timestamp: string;
  text: string;
}

export type IntervaloPedido = 'DIARIO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL';
export type FormatoCobrancaPedido = 'CARNE' | 'BOLETO' | 'PIX_RECORRENTE' | 'MISTO';
export type FormaPagamentoPedido = 'PIX' | 'DINHEIRO' | 'CARTAO' | 'BOLETO' | 'TRANSFERENCIA';

export interface SolicitacaoLimite {
  id: string;
  clienteId: string;
  clienteNome: string;
  valorAtual: number;
  valorSolicitado: number;
  motivo: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  dataSolicitacao: string;
  dataResposta?: string;
  valorFinanciado?: number;
  valorEntrada?: number;
  numeroParcelas?: number;
  intervaloCobranca?: IntervaloPedido;
  formatoCobranca?: FormatoCobrancaPedido;
  formasPagamento?: FormaPagamentoPedido[];
  descricaoOperacao?: string;
  valorParcelaEstimado?: number;
  coordenadas?: { lat: number; lng: number };
  enderecoReferencia?: string;
  assinaturaUrl?: string;
  clienteCpf?: string;
  clienteTelefone?: string;
  clienteBairro?: string;
}

export interface NotificacaoEnviada {
  id: string;
  clienteId: string;
  clienteNome: string;
  canal: 'WhatsApp' | 'SMS' | 'E-mail' | 'Push';
  tipo: 'Aviso Vencimento' | 'Cobrança Crítica' | 'Confirmação Pagamento' | 'Acordo/Negociação' | 'Campanha';
  conteudo: string;
  status: 'Enviada' | 'Entregue' | 'Lida' | 'Falhou';
  dataEnvio: string;
}

export interface AvisoGlobal {
  id: string;
  titulo: string;
  conteudo: string;
  severidade: 'Info' | 'Alerta' | 'Critico';
  ativo: boolean;
  dataCriacao: string;
  destino: 'TODOS' | 'CLIENTES' | 'COBRADORES';
}

export interface InteracaoCobranca {
  id: string;
  clienteId: string;
  clienteNome: string;
  tipo: 'Ligação' | 'WhatsApp' | 'Visita Presencial' | 'E-mail' | 'Anotação Interna';
  descricao: string;
  data: string;
  responsavel: string;
  promessaPagamento?: string;
}

