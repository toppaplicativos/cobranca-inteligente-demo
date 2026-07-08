import React, { useState, useEffect } from 'react';
import { Cliente, Reference, Documento } from '../types';
import { ShieldCheck, Plus, Trash2, Search, ArrowLeft, User, Smartphone, MapPin, Briefcase, FileCheck, Landmark, RefreshCw } from 'lucide-react';
import OCRScanner from './OCRScanner';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { IconButton } from './ui/IconButton';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { FormField } from './ui/FormField';
import { inputClass, selectClass, sectionTitleClass } from '../lib/formStyles';

interface ClientFormProps {
  onSave: (cliente: Cliente) => void;
  onCancel: () => void;
  clienteEdicao?: Cliente | null;
}

const DEFAULT_REFERENCES: Reference[] = [
  { id: '1', nome: '', parentesco: '', telefone: '', endereco: '' }
];

export default function ClientForm({ onSave, onCancel, clienteEdicao }: ClientFormProps) {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'contato' | 'endereco' | 'profissional' | 'referencias' | 'financeiro' | 'documentos'>('pessoal');
  const [showOcr, setShowOcr] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState('');
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('Não Informado');
  const [estadoCivil, setEstadoCivil] = useState('Solteiro(a)');
  const [nacionalidade, setNacionalidade] = useState('Brasileira');
  const [naturalidade, setNaturalidade] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [nomePai, setNomePai] = useState('');

  const [celularPrincipal, setCelularPrincipal] = useState('');
  const [celularSecundario, setCelularSecundario] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [email, setEmail] = useState('');
  const [telefoneResidencial, setTelefoneResidencial] = useState('');
  const [telefoneComercial, setTelefoneComercial] = useState('');

  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  const [tempoServico, setTempoServico] = useState('');
  const [salario, setSalario] = useState<number>(0);
  const [tipoVinculo, setTipoVinculo] = useState<'CLT' | 'Autônomo' | 'Empresário' | 'Aposentado/Pensionista' | 'Informal'>('CLT');
  const [rendaFamiliar, setRendaFamiliar] = useState<number>(0);
  const [telefoneEmpresa, setTelefoneEmpresa] = useState('');

  const [referencias, setReferencias] = useState<Reference[]>(DEFAULT_REFERENCES);

  const [limiteCredito, setLimiteCredito] = useState<number>(1000);
  const [scoreInterno, setScoreInterno] = useState<number>(500);
  const [scoreRisco, setScoreRisco] = useState<Cliente['scoreRisco']>('Bom');
  const [status, setStatus] = useState<Cliente['status']>('Ativo');

  const [documentos, setDocumentos] = useState<Documento[]>([]);

  // SPC/Serasa Simulated Query
  const [spcQueryStatus, setSpcQueryStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [spcScore, setSpcScore] = useState<number | null>(null);
  const [spcStatusText, setSpcStatusText] = useState('');
  
  const handleConsultarSPC = () => {
    setSpcQueryStatus('loading');
    setTimeout(() => {
      setSpcQueryStatus('success');
      // Dynamic score based on declared salary
      const scoreBase = Math.min(990, Math.floor(400 + (salario > 0 ? (salario / 15) : 300) + Math.random() * 100));
      setSpcScore(scoreBase);
      setSpcStatusText(scoreBase >= 650 ? 'Regular - Sem restrições ativas na praça' : 'Atenção - Histórico moderado de apontamentos');
      
      // Auto improve internal score if external score is excellent
      if (scoreBase >= 700) {
        setScoreInterno(prev => Math.min(1000, prev + 120));
      }
    }, 1200);
  };

  // Popula caso seja edição
  useEffect(() => {
    if (clienteEdicao) {
      setNome(clienteEdicao.nome || '');
      setFoto(clienteEdicao.foto || '');
      setRg(clienteEdicao.rg || '');
      setCpf(clienteEdicao.cpf || '');
      setDataNascimento(clienteEdicao.dataNascimento || '');
      setSexo(clienteEdicao.sexo || 'Não Informado');
      setEstadoCivil(clienteEdicao.estadoCivil || 'Solteiro(a)');
      setNacionalidade(clienteEdicao.nacionalidade || 'Brasileira');
      setNaturalidade(clienteEdicao.naturalidade || '');
      setNomeMae(clienteEdicao.nomeMae || '');
      setNomePai(clienteEdicao.nomePai || '');

      setCelularPrincipal(clienteEdicao.celularPrincipal || '');
      setCelularSecundario(clienteEdicao.celularSecundario || '');
      setWhatsApp(clienteEdicao.whatsApp || '');
      setEmail(clienteEdicao.email || '');
      setTelefoneResidencial(clienteEdicao.telefoneResidencial || '');
      setTelefoneComercial(clienteEdicao.telefoneComercial || '');

      setCep(clienteEdicao.cep || '');
      setRua(clienteEdicao.rua || '');
      setNumero(clienteEdicao.numero || '');
      setComplemento(clienteEdicao.complemento || '');
      setBairro(clienteEdicao.bairro || '');
      setCidade(clienteEdicao.cidade || '');
      setEstado(clienteEdicao.estado || '');

      setEmpresa(clienteEdicao.empresa || '');
      setCargo(clienteEdicao.cargo || '');
      setTempoServico(clienteEdicao.tempoServico || '');
      setSalario(clienteEdicao.salario || 0);
      setTipoVinculo(clienteEdicao.tipoVinculo || 'CLT');
      setRendaFamiliar(clienteEdicao.rendaFamiliar || 0);
      setTelefoneEmpresa(clienteEdicao.telefoneEmpresa || '');

      setReferencias(clienteEdicao.referencias?.length ? clienteEdicao.referencias : DEFAULT_REFERENCES);

      setLimiteCredito(clienteEdicao.limiteCredito || 1000);
      setScoreInterno(clienteEdicao.scoreInterno || 500);
      setScoreRisco(clienteEdicao.scoreRisco || 'Bom');
      setStatus(clienteEdicao.status || 'Ativo');
      setDocumentos(clienteEdicao.documentos || []);
    }
  }, [clienteEdicao]);

  // OCR auto populate
  const handleOcrComplete = (data: any) => {
    setNome(data.nome);
    setCpf(data.cpf);
    setRg(data.rg);
    setDataNascimento(data.dataNascimento);
    setNomeMae(data.nomeMae);
    setNomePai(data.nomePai);
    setShowOcr(false);
  };

  // Auto preenchimento por CEP real ViaCEP
  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFetchingCep(true);
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setRua(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setEstado(data.uf || '');
          }
        })
        .catch(err => console.error("ViaCEP error:", err))
        .finally(() => setIsFetchingCep(false));
    }
  }, [cep]);

  // Credit Score Calculator Algorithm
  const handleAutoScore = () => {
    let score = 300; // Base score
    
    // CLT gets high points
    if (tipoVinculo === 'CLT') score += 150;
    else if (tipoVinculo === 'Empresário') score += 120;
    else if (tipoVinculo === 'Aposentado/Pensionista') score += 100;
    else if (tipoVinculo === 'Autônomo') score += 50;

    // Salary factors
    if (salario >= 6000) score += 250;
    else if (salario >= 4000) score += 180;
    else if (salario >= 2500) score += 100;
    else if (salario >= 1500) score += 50;

    // Household Income
    if (rendaFamiliar >= 10000) score += 150;
    else if (rendaFamiliar >= 5000) score += 100;

    // Age factor (if provided)
    if (dataNascimento) {
      const birthYear = new Date(dataNascimento).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      if (age >= 30 && age <= 60) score += 100;
      else if (age > 60) score += 50;
    }

    // Limit points to 1000 max
    score = Math.min(score, 1000);
    setScoreInterno(score);

    // Calculate rating and suggested credit limit
    let rating: Cliente['scoreRisco'] = 'Bom';
    let suggestedLimit = 1000;

    if (score >= 850) {
      rating = 'Excelente';
      suggestedLimit = Math.round(salario * 0.8 + 1000);
    } else if (score >= 700) {
      rating = 'Muito Bom';
      suggestedLimit = Math.round(salario * 0.6 + 500);
    } else if (score >= 500) {
      rating = 'Bom';
      suggestedLimit = Math.round(salario * 0.4 + 200);
    } else if (score >= 350) {
      rating = 'Médio';
      suggestedLimit = Math.round(salario * 0.25);
    } else {
      rating = 'Alto Risco';
      suggestedLimit = 300;
    }

    setScoreRisco(rating);
    setLimiteCredito(suggestedLimit);
  };

  // References actions
  const addReference = () => {
    setReferencias([...referencias, { id: String(Date.now()), nome: '', parentesco: '', telefone: '', endereco: '' }]);
  };

  const removeReference = (id: string) => {
    if (referencias.length > 1) {
      setReferencias(referencias.filter(r => r.id !== id));
    }
  };

  const handleReferenceChange = (id: string, field: keyof Reference, value: string) => {
    setReferencias(referencias.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Document upload sim
  const addMockDocument = (tipo: Documento['tipo']) => {
    const newDoc: Documento = {
      id: `DOC-${Date.now()}`,
      tipo,
      nomeArquivo: `${tipo.toLowerCase()}_${nome.toLowerCase().replace(/\s+/g, '_') || 'cliente'}.pdf`,
      url: '#',
      dataUpload: new Date().toISOString().split('T')[0]
    };
    setDocumentos([...documentos, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocumentos(documentos.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cpf) {
      alert('Nome Completo e CPF são campos obrigatórios!');
      return;
    }

    const compiledClient: Cliente = {
      id: clienteEdicao?.id || `CLI-${Math.floor(100 + Math.random() * 900)}`,
      nome,
      foto: foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rg,
      cpf,
      dataNascimento,
      sexo,
      estadoCivil,
      nacionalidade,
      naturalidade,
      nomeMae,
      nomePai,
      celularPrincipal,
      celularSecundario,
      whatsApp: whatsApp || celularPrincipal,
      email,
      telefoneResidencial,
      telefoneComercial,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      coordenadasGps: clienteEdicao?.coordenadasGps || { lat: -23.5505, lng: -46.6333 },
      fotoResidencia: clienteEdicao?.fotoResidencia,
      empresa,
      cargo,
      tempoServico,
      salario,
      tipoVinculo,
      rendaFamiliar: rendaFamiliar || salario,
      telefoneEmpresa,
      referencias,
      limiteCredito,
      limiteUtilizado: clienteEdicao?.limiteUtilizado || 0,
      limiteDisponivel: limiteCredito - (clienteEdicao?.limiteUtilizado || 0),
      scoreInterno,
      scoreRisco,
      frequenciaPagamento: clienteEdicao?.frequenciaPagamento || 'Excelente',
      mediaDiasAtraso: clienteEdicao?.mediaDiasAtraso || 0,
      totalComprado: clienteEdicao?.totalComprado || 0,
      totalPago: clienteEdicao?.totalPago || 0,
      totalEmAberto: clienteEdicao?.totalEmAberto || 0,
      valorMedioCompras: clienteEdicao?.valorMedioCompras || 0,
      documentos,
      status,
      dataCadastro: clienteEdicao?.dataCadastro || new Date().toISOString().split('T')[0]
    };

    onSave(compiledClient);
  };

  const formTabs = [
    { id: 'pessoal', label: 'Pessoal', icon: User },
    { id: 'contato', label: 'Contatos', icon: Smartphone },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'profissional', label: 'Profissional', icon: Briefcase },
    { id: 'referencias', label: 'Referências', icon: UsersIcon },
    { id: 'financeiro', label: 'Financeiro', icon: Landmark },
    { id: 'documentos', label: 'Documentos', icon: FileCheck },
  ];

  return (
    <div className="space-y-5">
      <Panel className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconButton label="Voltar" onClick={onCancel}>
            <ArrowLeft className="size-5" />
          </IconButton>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {clienteEdicao ? `Editar — ${clienteEdicao.nome}` : 'Novo cadastro de cliente'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Score de risco, referências e OCR integrado</p>
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={() => setShowOcr(!showOcr)}>
          <Search className="size-4" />
          {showOcr ? 'Ocultar OCR' : 'Preencher via OCR'}
        </Button>
      </Panel>

      {showOcr && <OCRScanner onScanComplete={handleOcrComplete} />}

      <SegmentedTabs
        items={formTabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      <Panel padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* TAB 1: DADOS PESSOAIS */}
        {activeTab === 'pessoal' && (
          <div className="space-y-4">
            <h3 className={sectionTitleClass}>Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nome Completo *</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  required 
                  className={inputClass} 
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">URL da Foto</label>
                <input 
                  type="text" 
                  value={foto} 
                  onChange={e => setFoto(e.target.value)} 
                  className={inputClass} 
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">CPF *</label>
                <input 
                  type="text" 
                  value={cpf} 
                  onChange={e => setCpf(e.target.value)} 
                  required 
                  className={inputClass} 
                  placeholder="123.456.789-00"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">RG</label>
                <input 
                  type="text" 
                  value={rg} 
                  onChange={e => setRg(e.target.value)} 
                  className={inputClass} 
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Data de Nascimento</label>
                <input 
                  type="date" 
                  value={dataNascimento} 
                  onChange={e => setDataNascimento(e.target.value)} 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Sexo</label>
                <select 
                  value={sexo} 
                  onChange={e => setSexo(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Não Informado">Não Informado</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Estado Civil</label>
                <select 
                  value={estadoCivil} 
                  onChange={e => setEstadoCivil(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                  <option value="União Estável">União Estável</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nacionalidade</label>
                <input 
                  type="text" 
                  value={nacionalidade} 
                  onChange={e => setNacionalidade(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Naturalidade (Cidade - UF)</label>
                <input 
                  type="text" 
                  value={naturalidade} 
                  onChange={e => setNaturalidade(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="Ex: Santos - SP"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nome da Mãe</label>
                <input 
                  type="text" 
                  value={nomeMae} 
                  onChange={e => setNomeMae(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nome do Pai</label>
                <input 
                  type="text" 
                  value={nomePai} 
                  onChange={e => setNomePai(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTATOS */}
        {activeTab === 'contato' && (
          <div className="space-y-4">
            <h3 className={sectionTitleClass}>Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Celular Principal *</label>
                <input 
                  type="text" 
                  value={celularPrincipal} 
                  onChange={e => setCelularPrincipal(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Celular Secundário</label>
                <input 
                  type="text" 
                  value={celularSecundario} 
                  onChange={e => setCelularSecundario(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">WhatsApp</label>
                <input 
                  type="text" 
                  value={whatsApp} 
                  onChange={e => setWhatsApp(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="Se vazio, usa principal"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="exemplo@gmail.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Telefone Residencial</label>
                <input 
                  type="text" 
                  value={telefoneResidencial} 
                  onChange={e => setTelefoneResidencial(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Telefone Comercial</label>
                <input 
                  type="text" 
                  value={telefoneComercial} 
                  onChange={e => setTelefoneComercial(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENDEREÇO */}
        {activeTab === 'endereco' && (
          <div className="space-y-4">
            <h3 className={sectionTitleClass}>Informações Residenciais</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">CEP *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cep} 
                    onChange={e => setCep(e.target.value)} 
                    required
                    className="w-full text-sm border border-[var(--border)] rounded-xl pl-3 pr-8 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                    placeholder="01310-100"
                  />
                  {isFetchingCep && (
                    <RefreshCw className="w-4 h-4 text-sky-500 animate-spin absolute right-2.5 top-2.5" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Auto-preenche via ViaCEP</span>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Logradouro (Rua/Av) *</label>
                <input 
                  type="text" 
                  value={rua} 
                  onChange={e => setRua(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Número *</label>
                <input 
                  type="text" 
                  value={numero} 
                  onChange={e => setNumero(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Complemento</label>
                <input 
                  type="text" 
                  value={complemento} 
                  onChange={e => setComplemento(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="Ex: Ap 42"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Bairro *</label>
                <input 
                  type="text" 
                  value={bairro} 
                  onChange={e => setBairro(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Cidade *</label>
                <input 
                  type="text" 
                  value={cidade} 
                  onChange={e => setCidade(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Estado (UF) *</label>
                <input 
                  type="text" 
                  value={estado} 
                  onChange={e => setEstado(e.target.value)} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="SP"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DADOS PROFISSIONAIS */}
        {activeTab === 'profissional' && (
          <div className="space-y-4">
            <h3 className={sectionTitleClass}>Vínculo Profissional</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Vínculo Trabalho</label>
                <select 
                  value={tipoVinculo} 
                  onChange={e => setTipoVinculo(e.target.value as any)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="CLT">CLT</option>
                  <option value="Autônomo">Autônomo</option>
                  <option value="Empresário">Empresário</option>
                  <option value="Aposentado/Pensionista">Aposentado / Pensionista</option>
                  <option value="Informal">Informal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nome da Empresa</label>
                <input 
                  type="text" 
                  value={empresa} 
                  onChange={e => setEmpresa(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Cargo</label>
                <input 
                  type="text" 
                  value={cargo} 
                  onChange={e => setCargo(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Salário (R$) *</label>
                <input 
                  type="number" 
                  value={salario} 
                  onChange={e => setSalario(Number(e.target.value))} 
                  required
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Renda Familiar Declarada (R$)</label>
                <input 
                  type="number" 
                  value={rendaFamiliar} 
                  onChange={e => setRendaFamiliar(Number(e.target.value))} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Tempo de Serviço / Atividade</label>
                <input 
                  type="text" 
                  value={tempoServico} 
                  onChange={e => setTempoServico(e.target.value)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                  placeholder="Ex: 2 anos"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REFERÊNCIAS */}
        {activeTab === 'referencias' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">Referências Pessoais e Comerciais</h3>
              <button
                type="button"
                onClick={addReference}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Referência
              </button>
            </div>

            <div className="space-y-4">
              {referencias.map((ref, idx) => (
                <div key={ref.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Referência #{idx + 1}</span>
                    {referencias.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReference(ref.id)}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nome Completo</label>
                      <input 
                        type="text" 
                        value={ref.nome} 
                        onChange={e => handleReferenceChange(ref.id, 'nome', e.target.value)}
                        className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                        placeholder="Nome da referência"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Grau de Parentesco / Vínculo</label>
                      <input 
                        type="text" 
                        value={ref.parentesco} 
                        onChange={e => handleReferenceChange(ref.id, 'parentesco', e.target.value)}
                        className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                        placeholder="Ex: Irmão, Amigo"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Telefone / Celular</label>
                      <input 
                        type="text" 
                        value={ref.telefone} 
                        onChange={e => handleReferenceChange(ref.id, 'telefone', e.target.value)}
                        className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Endereço Completo</label>
                      <input 
                        type="text" 
                        value={ref.endereco} 
                        onChange={e => handleReferenceChange(ref.id, 'endereco', e.target.value)}
                        className="w-full text-xs border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-transparent text-[var(--text-primary)] focus:outline-none" 
                        placeholder="Rua, número, bairro, cidade - UF"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FINANCEIRO & RISCO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">Crédito, Limites e Score Interno</h3>
                <p className="text-[10px] text-slate-500">Aprovação baseada no salário, histórico profissional e perfil demográfico</p>
              </div>
              <button
                type="button"
                onClick={handleAutoScore}
                className="px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" /> Rodar Análise Automática de Risco
              </button>
            </div>

            {/* EXTERNAL SPC/SERASA BACKGROUND CHECK SIMULATOR */}
            <div className="p-4 bg-[var(--bg-inset)]/20 rounded-2xl border border-[var(--border)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Verificação Cadastral Externa</span>
                  <p className="text-[11px] text-slate-500">Consultar restrições de crédito ativas na Receita Federal e agências SPC/Serasa</p>
                </div>

                <button
                  type="button"
                  onClick={handleConsultarSPC}
                  disabled={spcQueryStatus === 'loading'}
                  className="px-3.5 py-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center"
                >
                  {spcQueryStatus === 'loading' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" /> Consultar Restrições CPF (SPC/Serasa)
                    </>
                  )}
                </button>
              </div>

              {spcQueryStatus === 'success' && (
                <div className="p-3 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl flex items-center justify-between gap-4 animate-[fadeIn_0.2s_ease]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {spcScore}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Serasa Score</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{spcStatusText}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-bold">
                      Sem Restrições
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[var(--bg-inset)]/30 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Score Interno Sugerido</span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white block">{scoreInterno}</span>
                <span className="text-[9px] text-slate-400 block">Sugerido por IA Interna</span>
              </div>

              <div className="bg-[var(--bg-inset)]/30 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nível de Risco</span>
                <span className={`text-xl font-bold block ${
                  scoreRisco === 'Excelente' || scoreRisco === 'Muito Bom' ? 'text-emerald-600' :
                  scoreRisco === 'Bom' ? 'text-sky-600' :
                  scoreRisco === 'Médio' ? 'text-amber-500' : 'text-rose-500'
                }`}>{scoreRisco}</span>
                <span className="text-[9px] text-slate-400 block">Classificação da carteira</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Limite de Crédito Sugerido (R$)</label>
                <input 
                  type="number" 
                  value={limiteCredito} 
                  onChange={e => setLimiteCredito(Number(e.target.value))} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] font-bold text-slate-900 focus:outline-none focus:border-slate-500" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Situação Cadastral</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as any)} 
                  className="w-full text-sm border border-[var(--border)] rounded-xl px-3 py-2 bg-transparent text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Bloqueado">Bloqueado (Inadimplente)</option>
                  <option value="Em Análise">Em Análise de Crédito</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="space-y-4">
            <h3 className={sectionTitleClass}>Documentação do Cliente (Upload e Verificação)</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Documento de Identidade (RG/CPF)', tipo: 'RG' },
                { label: 'CNH do Cliente', tipo: 'CNH' },
                { label: 'Comprovante de Renda', tipo: 'COMPROVANTE_RENDA' },
                { label: 'Comprovante de Residência', tipo: 'COMPROVANTE_RESIDENCIA' }
              ].map((docItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addMockDocument(docItem.tipo as any)}
                  className="p-3 border border-[var(--border)] hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-center text-xs font-medium transition text-slate-700 dark:text-slate-300"
                >
                  Anexar {docItem.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-xs font-semibold text-slate-500 block uppercase">Documentos Atualmente Anexados</label>
              {documentos.length === 0 ? (
                <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  Nenhum arquivo anexado para verificação cadastral. Clique acima para simular anexação.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl text-xs">
                      <div className="overflow-hidden pr-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">{doc.tipo}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{doc.nomeArquivo} (Enviado em {doc.dataUpload})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar cadastro</Button>
        </div>
      </form>
      </Panel>
    </div>
  );
}

// Icon wrapper for react icon issues
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
