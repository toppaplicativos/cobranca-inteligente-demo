import { Cliente, Parcela, Venda, RotaCobranca, LogAuditoria, SolicitacaoLimite, NotificacaoEnviada, AvisoGlobal, InteracaoCobranca } from '../types';

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'CLI-001',
    nome: 'Carlos Silva Santos',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rg: '12.345.678-9',
    cpf: '123.456.789-01',
    dataNascimento: '1985-05-12',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    nacionalidade: 'Brasileira',
    naturalidade: 'São Paulo - SP',
    nomeMae: 'Maria Silva Santos',
    nomePai: 'José Santos',
    celularPrincipal: '(11) 98765-4321',
    celularSecundario: '(11) 91234-5678',
    whatsApp: '(11) 98765-4321',
    email: 'carlos.santos@gmail.com',
    telefoneResidencial: '(11) 3456-7890',
    telefoneComercial: '(11) 5555-1234',
    cep: '01310-100',
    rua: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    coordenadasGps: { lat: -23.5615, lng: -46.656 },
    empresa: 'Tech Soluções LTDA',
    cargo: 'Analista de Sistemas Sênior',
    tempoServico: '4 anos',
    salario: 8500,
    tipoVinculo: 'CLT',
    rendaFamiliar: 12000,
    telefoneEmpresa: '(11) 5555-4321',
    referencias: [
      {
        id: 'REF-001',
        nome: 'Marcos Silva Santos',
        parentesco: 'Irmão',
        telefone: '(11) 99999-8888',
        endereco: 'Rua Bela Cintra, 450 - Consolação, São Paulo - SP'
      },
      {
        id: 'REF-002',
        nome: 'Fernanda Lima Souza',
        parentesco: 'Amiga',
        telefone: '(11) 97777-6666',
        endereco: 'Rua Augusta, 1200 - Consolação, São Paulo - SP'
      }
    ],
    limiteCredito: 5000,
    limiteUtilizado: 1800,
    limiteDisponivel: 3200,
    scoreInterno: 920,
    scoreRisco: 'Excelente',
    frequenciaPagamento: 'Excelente',
    mediaDiasAtraso: 0.5,
    totalComprado: 12400,
    totalPago: 10600,
    totalEmAberto: 1800,
    valorMedioCompras: 1550,
    documentos: [
      { id: 'DOC-011', tipo: 'RG', nomeArquivo: 'rg_carlos.pdf', url: '#', dataUpload: '2025-01-10' },
      { id: 'DOC-012', tipo: 'CPF', nomeArquivo: 'cpf_carlos.pdf', url: '#', dataUpload: '2025-01-10' },
      { id: 'DOC-013', tipo: 'COMPROVANTE_RESIDENCIA', nomeArquivo: 'luz_carlos.pdf', url: '#', dataUpload: '2025-01-10' },
      { id: 'DOC-014', tipo: 'SELFIE', nomeArquivo: 'selfie_carlos.jpg', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', dataUpload: '2025-01-10' }
    ],
    status: 'Ativo',
    dataCadastro: '2025-01-10'
  },
  {
    id: 'CLI-002',
    nome: 'Mariana Oliveira Costa',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rg: '23.456.789-0',
    cpf: '234.567.890-12',
    dataNascimento: '1992-09-25',
    sexo: 'Feminino',
    estadoCivil: 'Solteira',
    nacionalidade: 'Brasileira',
    naturalidade: 'Campinas - SP',
    nomeMae: 'Rita Oliveira Costa',
    nomePai: 'Antônio Costa',
    celularPrincipal: '(19) 98111-2222',
    celularSecundario: '',
    whatsApp: '(19) 98111-2222',
    email: 'mariana.costa@hotmail.com',
    telefoneResidencial: '(19) 3212-3456',
    telefoneComercial: '',
    cep: '13015-100',
    rua: 'Rua Francisco Glicério',
    numero: '150',
    complemento: 'Bloco B, Ap 103',
    bairro: 'Centro',
    cidade: 'Campinas',
    estado: 'SP',
    coordenadasGps: { lat: -22.9056, lng: -47.0608 },
    empresa: 'Drogaria FarmaVida',
    cargo: 'Farmacêutica',
    tempoServico: '2 anos',
    salario: 4200,
    tipoVinculo: 'CLT',
    rendaFamiliar: 4200,
    telefoneEmpresa: '(19) 3255-8888',
    referencias: [
      {
        id: 'REF-003',
        nome: 'Antônio Costa Filho',
        parentesco: 'Irmão',
        telefone: '(19) 98333-4444',
        endereco: 'Rua Barão de Jaguara, 1200 - Centro, Campinas - SP'
      }
    ],
    limiteCredito: 3000,
    limiteUtilizado: 1200,
    limiteDisponivel: 1800,
    scoreInterno: 710,
    scoreRisco: 'Bom',
    frequenciaPagamento: 'Bom',
    mediaDiasAtraso: 2.1,
    totalComprado: 6200,
    totalPago: 5000,
    totalEmAberto: 1200,
    valorMedioCompras: 800,
    documentos: [
      { id: 'DOC-021', tipo: 'CNH', nomeArquivo: 'cnh_mariana.pdf', url: '#', dataUpload: '2025-02-15' },
      { id: 'DOC-022', tipo: 'COMPROVANTE_RESIDENCIA', nomeArquivo: 'fatura_internet.pdf', url: '#', dataUpload: '2025-02-15' }
    ],
    status: 'Ativo',
    dataCadastro: '2025-02-15'
  },
  {
    id: 'CLI-003',
    nome: 'Fernando Pereira Souza',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rg: '34.567.890-1',
    cpf: '345.678.901-23',
    dataNascimento: '1979-11-02',
    sexo: 'Masculino',
    estadoCivil: 'Divorciado',
    nacionalidade: 'Brasileira',
    naturalidade: 'Santos - SP',
    nomeMae: 'Cleide Pereira',
    nomePai: 'Valdir Souza',
    celularPrincipal: '(13) 98888-1111',
    celularSecundario: '(13) 3222-1234',
    whatsApp: '(13) 98888-1111',
    email: 'fernando.souza79@outlook.com',
    telefoneResidencial: '(13) 3222-1234',
    telefoneComercial: '',
    cep: '11010-000',
    rua: 'Avenida Ana Costa',
    numero: '250',
    complemento: '',
    bairro: 'Gonzaga',
    cidade: 'Santos',
    estado: 'SP',
    coordenadasGps: { lat: -23.968, lng: -46.333 },
    empresa: 'Autônomo (Pinturas Residenciais)',
    cargo: 'Pintor Autônomo',
    tempoServico: '5 anos',
    salario: 2500,
    tipoVinculo: 'Autônomo',
    rendaFamiliar: 2500,
    telefoneEmpresa: '',
    referencias: [
      {
        id: 'REF-004',
        nome: 'Valdir Souza',
        parentesco: 'Pai',
        telefone: '(13) 97411-2233',
        endereco: 'Avenida Vicente de Carvalho, 40 - Boqueirão, Santos - SP'
      }
    ],
    limiteCredito: 1500,
    limiteUtilizado: 1250,
    limiteDisponivel: 250,
    scoreInterno: 380,
    scoreRisco: 'Alto Risco',
    frequenciaPagamento: 'Regular',
    mediaDiasAtraso: 14.5,
    totalComprado: 3500,
    totalPago: 2250,
    totalEmAberto: 1250,
    valorMedioCompras: 650,
    documentos: [
      { id: 'DOC-031', tipo: 'RG', nomeArquivo: 'rg_fernando.jpg', url: '#', dataUpload: '2025-03-20' }
    ],
    status: 'Ativo',
    dataCadastro: '2025-03-20'
  },
  {
    id: 'CLI-004',
    nome: 'Beatriz Souza Lima',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rg: '45.678.901-2',
    cpf: '456.789.012-34',
    dataNascimento: '1998-03-08',
    sexo: 'Feminino',
    estadoCivil: 'Solteira',
    nacionalidade: 'Brasileira',
    naturalidade: 'São Bernardo do Campo - SP',
    nomeMae: 'Clara Souza',
    nomePai: 'Maurício Lima',
    celularPrincipal: '(11) 97777-1122',
    celularSecundario: '',
    whatsApp: '(11) 97777-1122',
    email: 'beatriz.lima98@gmail.com',
    telefoneResidencial: '',
    telefoneComercial: '',
    cep: '09715-000',
    rua: 'Rua Marechal Deodoro',
    numero: '800',
    complemento: 'Bloco C, Ap 12',
    bairro: 'Centro',
    cidade: 'São Bernardo do Campo',
    estado: 'SP',
    coordenadasGps: { lat: -23.694, lng: -46.565 },
    empresa: 'Desempregada',
    cargo: 'Nenhum',
    tempoServico: 'Nenhum',
    salario: 0,
    tipoVinculo: 'Informal',
    rendaFamiliar: 1200,
    telefoneEmpresa: '',
    referencias: [
      {
        id: 'REF-005',
        nome: 'Clara Souza Lima',
        parentesco: 'Mãe',
        telefone: '(11) 98888-5555',
        endereco: 'Rua Marechal Deodoro, 800 - Centro, SBC - SP'
      }
    ],
    limiteCredito: 1000,
    limiteUtilizado: 900,
    limiteDisponivel: 100,
    scoreInterno: 120,
    scoreRisco: 'Bloqueado',
    frequenciaPagamento: 'Inconsistente',
    mediaDiasAtraso: 42.1,
    totalComprado: 2500,
    totalPago: 1600,
    totalEmAberto: 900,
    valorMedioCompras: 500,
    documentos: [
      { id: 'DOC-041', tipo: 'RG', nomeArquivo: 'rg_beatriz.pdf', url: '#', dataUpload: '2025-01-05' }
    ],
    status: 'Bloqueado',
    dataCadastro: '2025-01-05'
  },
  {
    id: 'CLI-005',
    nome: 'Ana Júlia Rodrigues',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rg: '56.789.012-3',
    cpf: '567.890.123-45',
    dataNascimento: '1995-07-19',
    sexo: 'Feminino',
    estadoCivil: 'Solteira',
    nacionalidade: 'Brasileira',
    naturalidade: 'São Paulo - SP',
    nomeMae: 'Zélia Rodrigues',
    nomePai: 'Eder Rodrigues',
    celularPrincipal: '(11) 96543-2109',
    celularSecundario: '',
    whatsApp: '(11) 96543-2109',
    email: 'anajulia.rod@gmail.com',
    telefoneResidencial: '',
    telefoneComercial: '(11) 4004-0000',
    cep: '04571-010',
    rua: 'Avenida Engenheiro Luís Carlos Berrini',
    numero: '1200',
    complemento: '9º andar',
    bairro: 'Cidade Monções',
    cidade: 'São Paulo',
    estado: 'SP',
    coordenadasGps: { lat: -23.608, lng: -46.697 },
    empresa: 'Multinacional Corporativa S/A',
    cargo: 'Gerente de Contas Pleno',
    tempoServico: '1 ano e 6 meses',
    salario: 6800,
    tipoVinculo: 'CLT',
    rendaFamiliar: 6800,
    telefoneEmpresa: '(11) 4004-0000',
    referencias: [
      {
        id: 'REF-006',
        nome: 'Juliana Rodrigues',
        parentesco: 'Prima',
        telefone: '(11) 97111-2222',
        endereco: 'Rua Funchal, 200 - Vila Olímpia, São Paulo - SP'
      }
    ],
    limiteCredito: 4000,
    limiteUtilizado: 0,
    limiteDisponivel: 4000,
    scoreInterno: 830,
    scoreRisco: 'Muito Bom',
    frequenciaPagamento: 'Excelente',
    mediaDiasAtraso: 0,
    totalComprado: 0,
    totalPago: 0,
    totalEmAberto: 0,
    valorMedioCompras: 0,
    documentos: [],
    status: 'Em Análise',
    dataCadastro: '2026-07-02'
  }
];

export const INITIAL_VENDAS: Venda[] = [
  {
    id: 'VEN-001',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    dataVenda: '2026-04-10',
    valorTotal: 1800,
    entrada: 0,
    numeroParcelas: 3,
    descricao: 'Compra de Notebook Corporativo',
    status: 'Quitada'
  },
  {
    id: 'VEN-002',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    dataVenda: '2026-06-05',
    valorTotal: 1800,
    entrada: 0,
    numeroParcelas: 3,
    descricao: 'Móveis de Escritório',
    status: 'Ativa'
  },
  {
    id: 'VEN-003',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    dataVenda: '2026-05-15',
    valorTotal: 1200,
    entrada: 0,
    numeroParcelas: 3,
    descricao: 'Smartphone Samsung Galaxy',
    status: 'Ativa'
  },
  {
    id: 'VEN-004',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    dataVenda: '2026-03-22',
    valorTotal: 1500,
    entrada: 250,
    numeroParcelas: 5,
    descricao: 'Materiais de Pintura Profissionais',
    status: 'Ativa'
  },
  {
    id: 'VEN-005',
    clienteId: 'CLI-004',
    clienteNome: 'Beatriz Souza Lima',
    dataVenda: '2026-02-10',
    valorTotal: 1500,
    entrada: 0,
    numeroParcelas: 3,
    descricao: 'Guarda-Roupa Casal e Cama',
    status: 'Atrasada'
  }
];

export const INITIAL_PARCELAS: Parcela[] = [
  // Carlos Venda 001 (Quitada)
  {
    id: 'PAR-001',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-001',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: '2026-05-10',
    valorOriginal: 600,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 600,
    dataPagamento: '2026-05-09',
    formaPagamento: 'PIX',
    status: 'Paga'
  },
  {
    id: 'PAR-002',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-001',
    numeroParcela: 2,
    totalParcelas: 3,
    dataVencimento: '2026-06-10',
    valorOriginal: 600,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 600,
    dataPagamento: '2026-06-10',
    formaPagamento: 'PIX',
    status: 'Paga'
  },
  {
    id: 'PAR-003',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-001',
    numeroParcela: 3,
    totalParcelas: 3,
    dataVencimento: '2026-07-10',
    valorOriginal: 600,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 10,
    valorPago: 590,
    dataPagamento: '2026-07-02', // Paga antecipado
    formaPagamento: 'PIX',
    status: 'Paga'
  },

  // Carlos Venda 002 (Ativa)
  {
    id: 'PAR-004',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-002',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: '2026-07-05', // Hoje no sistema
    valorOriginal: 980,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },
  {
    id: 'PAR-005',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-002',
    numeroParcela: 2,
    totalParcelas: 3,
    dataVencimento: '2026-08-05',
    valorOriginal: 600,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },
  {
    id: 'PAR-006',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    vendaId: 'VEN-002',
    numeroParcela: 3,
    totalParcelas: 3,
    dataVencimento: '2026-09-05',
    valorOriginal: 600,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },

  // Mariana Venda 003 (Ativa)
  {
    id: 'PAR-007',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    vendaId: 'VEN-003',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: '2026-06-15',
    valorOriginal: 400,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 400,
    dataPagamento: '2026-06-17', // Atrasou 2 dias
    formaPagamento: 'DINHEIRO',
    status: 'Paga'
  },
  {
    id: 'PAR-008',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    vendaId: 'VEN-003',
    numeroParcela: 2,
    totalParcelas: 3,
    dataVencimento: '2026-07-15',
    valorOriginal: 820,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },
  {
    id: 'PAR-009',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    vendaId: 'VEN-003',
    numeroParcela: 3,
    totalParcelas: 3,
    dataVencimento: '2026-08-15',
    valorOriginal: 400,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },

  // Fernando Venda 004 (Ativa, com atrasos)
  {
    id: 'PAR-010',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    vendaId: 'VEN-004',
    numeroParcela: 1,
    totalParcelas: 5,
    dataVencimento: '2026-04-22',
    valorOriginal: 250,
    valorJuros: 10,
    valorMulta: 5,
    valorDesconto: 0,
    valorPago: 265,
    dataPagamento: '2026-05-02', // Atraso de 10 dias
    formaPagamento: 'DINHEIRO',
    status: 'Paga'
  },
  {
    id: 'PAR-011',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    vendaId: 'VEN-004',
    numeroParcela: 2,
    totalParcelas: 5,
    dataVencimento: '2026-05-22',
    valorOriginal: 250,
    valorJuros: 15,
    valorMulta: 5,
    valorDesconto: 0,
    valorPago: 270,
    dataPagamento: '2026-06-10', // Atraso de 19 dias
    formaPagamento: 'DINHEIRO',
    status: 'Paga'
  },
  {
    id: 'PAR-012',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    vendaId: 'VEN-004',
    numeroParcela: 3,
    totalParcelas: 5,
    dataVencimento: '2026-06-22', // Atrasada!
    valorOriginal: 890,
    valorJuros: 12.50,
    valorMulta: 5.00,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Atrasada'
  },
  {
    id: 'PAR-013',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    vendaId: 'VEN-004',
    numeroParcela: 4,
    totalParcelas: 5,
    dataVencimento: '2026-07-22',
    valorOriginal: 760,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },
  {
    id: 'PAR-014',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    vendaId: 'VEN-004',
    numeroParcela: 5,
    totalParcelas: 5,
    dataVencimento: '2026-08-22',
    valorOriginal: 250,
    valorJuros: 0,
    valorMulta: 0,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Pendente'
  },

  // Beatriz Venda 005 (Inadimplente - Bloqueada)
  {
    id: 'PAR-015',
    clienteId: 'CLI-004',
    clienteNome: 'Beatriz Souza Lima',
    vendaId: 'VEN-005',
    numeroParcela: 1,
    totalParcelas: 3,
    dataVencimento: '2026-03-10', // Super atrasada!
    valorOriginal: 850,
    valorJuros: 60,
    valorMulta: 10,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Atrasada'
  },
  {
    id: 'PAR-016',
    clienteId: 'CLI-004',
    clienteNome: 'Beatriz Souza Lima',
    vendaId: 'VEN-005',
    numeroParcela: 2,
    totalParcelas: 3,
    dataVencimento: '2026-04-10', // Super atrasada!
    valorOriginal: 780,
    valorJuros: 45,
    valorMulta: 10,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Atrasada'
  },
  {
    id: 'PAR-017',
    clienteId: 'CLI-004',
    clienteNome: 'Beatriz Souza Lima',
    vendaId: 'VEN-005',
    numeroParcela: 3,
    totalParcelas: 3,
    dataVencimento: '2026-05-10', // Super atrasada!
    valorOriginal: 700,
    valorJuros: 30,
    valorMulta: 10,
    valorDesconto: 0,
    valorPago: 0,
    status: 'Atrasada'
  }
];

export const INITIAL_ROTAS: RotaCobranca[] = [
  {
    id: 'ROT-001',
    nome: 'Rota Inteligente — Grande SP (Hoje)',
    cobradorId: 'COB-001',
    cobradorNome: 'Marcos Entregador',
    data: '2026-07-06',
    bairros: ['Bela Vista', 'Gonzaga', 'Centro SBC', 'Centro Campinas'],
    regiao: 'Grande SP — Oeste & ABC',
    parcelasIds: ['PAR-015', 'PAR-012', 'PAR-016', 'PAR-004', 'PAR-017', 'PAR-013', 'PAR-008'],
    concluida: false,
    status: 'Agendada'
  },
  {
    id: 'ROT-002',
    nome: 'Rota SBC - Centro (Agendada)',
    cobradorId: 'COB-001',
    cobradorNome: 'Marcos Entregador',
    data: '2026-07-06',
    bairros: ['Centro'],
    regiao: 'ABC Paulista',
    parcelasIds: ['PAR-015', 'PAR-016'], // Beatriz (SBC)
    concluida: false,
    status: 'Agendada'
  }
];

export const INITIAL_LOGS: LogAuditoria[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-07-05T08:30:00-03:00',
    usuario: 'admin@cobrancainteligente.com.br',
    papel: 'Administrador',
    acao: 'Login efetuado',
    detalhes: 'Autenticação de administrador realizada com sucesso via JWT e 2FA.',
    ip: '192.168.1.100'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-07-05T09:15:00-03:00',
    usuario: 'admin@cobrancainteligente.com.br',
    papel: 'Administrador',
    acao: 'Novo cliente cadastrado',
    detalhes: 'Cliente Ana Júlia Rodrigues inserido no sistema com score sugerido 830.',
    ip: '192.168.1.100'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-07-05T10:02:15-03:00',
    usuario: 'marcos.cobrador@cobranca.com.br',
    papel: 'Entregador / Cobrador',
    acao: 'Rota iniciada',
    detalhes: 'Cobrador iniciou a rota ROT-001 para Zona Central.',
    ip: '189.122.34.8'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-07-04T16:45:00-03:00',
    usuario: 'admin@cobrancainteligente.com.br',
    papel: 'Administrador',
    acao: 'Alteração de limite de crédito',
    detalhes: 'Limite de crédito do cliente Carlos Silva Santos aumentado de R$ 4000 para R$ 5000.',
    ip: '192.168.1.100'
  }
];

export const INITIAL_SOLICITACOES: SolicitacaoLimite[] = [
  {
    id: 'SOL-001',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    valorAtual: 3000,
    valorSolicitado: 4500,
    motivo: 'Gostaria de comprar uma geladeira nova e meu limite atual não é suficiente.',
    status: 'Pendente',
    dataSolicitacao: '2026-07-04'
  },
  {
    id: 'SOL-003',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    valorAtual: 1500,
    valorSolicitado: 2500,
    motivo: 'Preciso ampliar o limite para comprar material de construção parcelado.',
    status: 'Pendente',
    dataSolicitacao: '2026-07-05',
    valorFinanciado: 2000,
    valorEntrada: 500,
    numeroParcelas: 8,
    intervaloCobranca: 'QUINZENAL',
    formatoCobranca: 'CARNE',
    formasPagamento: ['PIX', 'DINHEIRO'],
    descricaoOperacao: 'Material de construção — tinta, massa corrida e ferramentas',
    valorParcelaEstimado: 250,
    coordenadas: { lat: -23.968, lng: -46.333 },
    enderecoReferencia: 'Avenida Ana Costa, 250 — Gonzaga, Santos',
    assinaturaUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"%3E%3Cpath d="M12,42 Q45,8 85,38 T165,22" fill="none" stroke="%23333" stroke-width="2.5" stroke-linecap="round"/%3E%3C/svg%3E',
    clienteCpf: '345.678.901-23',
    clienteTelefone: '(13) 98888-1111',
    clienteBairro: 'Gonzaga',
  },
  {
    id: 'SOL-002',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    valorAtual: 4000,
    valorSolicitado: 5000,
    motivo: 'Aumento padrão solicitado por bom histórico.',
    status: 'Aprovado',
    dataSolicitacao: '2026-06-30',
    dataResposta: '2026-07-04'
  }
];

export const INITIAL_NOTIFICACOES: NotificacaoEnviada[] = [
  {
    id: 'NOT-001',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    canal: 'WhatsApp',
    tipo: 'Aviso Vencimento',
    conteudo: 'Olá Carlos! Lembrando que seu carnê PAR-004 vence amanhã (06/07). Valor: R$ 420,00. Evite juros!',
    status: 'Lida',
    dataEnvio: '2026-07-05 09:30'
  },
  {
    id: 'NOT-002',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    canal: 'SMS',
    tipo: 'Cobrança Crítica',
    conteudo: 'Mariana, identificamos atraso de 15 dias no seu boleto. Entre em contato urgente pelo WhatsApp para renegociar.',
    status: 'Entregue',
    dataEnvio: '2026-07-04 14:15'
  },
  {
    id: 'NOT-003',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    canal: 'E-mail',
    tipo: 'Confirmação Pagamento',
    conteudo: 'Prezado Fernando, seu pagamento no valor de R$ 680,00 foi compensado com sucesso! Obrigado pela pontualidade.',
    status: 'Enviada',
    dataEnvio: '2026-07-03 10:00'
  },
  {
    id: 'NOT-004',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    canal: 'Push',
    tipo: 'Campanha',
    conteudo: 'Parabéns Carlos! Seu limite pré-aprovado aumentou. Aproveite novas compras em nossa loja.',
    status: 'Lida',
    dataEnvio: '2026-07-02 08:00'
  }
];

export const INITIAL_AVISOS: AvisoGlobal[] = [
  {
    id: 'AVS-001',
    titulo: 'Expediente no Feriado de 9 de Julho',
    conteudo: 'Atenção cobradores: na próxima terça-feira (09/07), feriado estadual, não haverá rotas externas de cobrança de campo. O suporte online funcionará em regime de plantão das 09h às 13h.',
    severidade: 'Alerta',
    ativo: true,
    dataCriacao: '2026-07-04',
    destino: 'TODOS'
  },
  {
    id: 'AVS-002',
    titulo: 'Nova Funcionalidade: Pix Copia e Cola',
    conteudo: 'Prezados clientes, agora vocês podem gerar o código Pix Copia e Cola diretamente no aplicativo para quitação imediata de suas faturas com juros e descontos recalculados automaticamente.',
    severidade: 'Info',
    ativo: true,
    dataCriacao: '2026-07-03',
    destino: 'CLIENTES'
  }
];

export const INITIAL_INTERACOES: InteracaoCobranca[] = [
  {
    id: 'INT-001',
    clienteId: 'CLI-001',
    clienteNome: 'Carlos Silva Santos',
    tipo: 'WhatsApp',
    descricao: 'Cliente enviou comprovante de transferência bancária do adiantamento da parcela PAR-003.',
    data: '2026-07-02 11:20',
    responsavel: 'Felipe Souza (Suporte)'
  },
  {
    id: 'INT-002',
    clienteId: 'CLI-002',
    clienteNome: 'Mariana Oliveira Costa',
    tipo: 'Ligação',
    descricao: 'Tentativa de contato telefônico. Telefone chamou até cair na caixa postal. Deixado recado na caixa de voz.',
    data: '2026-07-04 16:30',
    responsavel: 'Aline Rocha (Cobrança)'
  },
  {
    id: 'INT-003',
    clienteId: 'CLI-003',
    clienteNome: 'Fernando Pereira Souza',
    tipo: 'Visita Presencial',
    descricao: 'Cobrador de campo realizou visita. Fernando foi muito receptivo, pagou a parcela PAR-005 em dinheiro e assinou o recibo digital.',
    data: '2026-07-01 14:45',
    responsavel: 'Roberto Alencar (Cobrador)'
  }
];

