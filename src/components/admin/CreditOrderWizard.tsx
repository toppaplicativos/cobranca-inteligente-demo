import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronLeft, ChevronRight, User, Wallet, CalendarClock, CreditCard,
  MapPin, PenLine, ClipboardCheck, Check, Sparkles, Navigation, Loader2,
} from 'lucide-react';
import {
  Cliente, SolicitacaoLimite, IntervaloPedido, FormatoCobrancaPedido, FormaPagamentoPedido,
} from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { Badge } from '../ui/Badge';
import { SignaturePad } from './SignaturePad';
import { overlayClass } from '../../lib/formStyles';
import { cn } from '../../lib/cn';

interface CreditOrderWizardProps {
  open: boolean;
  onClose: () => void;
  clientes: Cliente[];
  onSubmit: (sol: SolicitacaoLimite) => void;
}

type StepId = 'cliente' | 'credito' | 'parcelas' | 'pagamentos' | 'local' | 'assinatura' | 'revisao';

const STEPS: { id: StepId; label: string; icon: React.ElementType }[] = [
  { id: 'cliente', label: 'Cliente', icon: User },
  { id: 'credito', label: 'Crédito', icon: Wallet },
  { id: 'parcelas', label: 'Parcelas', icon: CalendarClock },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'local', label: 'Local', icon: MapPin },
  { id: 'assinatura', label: 'Assinatura', icon: PenLine },
  { id: 'revisao', label: 'Revisão', icon: ClipboardCheck },
];

const INTERVALO_LABEL: Record<IntervaloPedido, string> = {
  DIARIO: 'Diário',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
};

const FORMATO_LABEL: Record<FormatoCobrancaPedido, string> = {
  CARNE: 'Carnê digital',
  BOLETO: 'Boleto registrado',
  PIX_RECORRENTE: 'Pix recorrente',
  MISTO: 'Misto (carnê + Pix)',
};

const PAGAMENTO_OPTS: { id: FormaPagamentoPedido; label: string }[] = [
  { id: 'PIX', label: 'Pix' },
  { id: 'DINHEIRO', label: 'Dinheiro' },
  { id: 'CARTAO', label: 'Cartão' },
  { id: 'BOLETO', label: 'Boleto' },
  { id: 'TRANSFERENCIA', label: 'TED/DOC' },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

export function CreditOrderWizard({ open, onClose, clientes, onSubmit }: CreditOrderWizardProps) {
  const [phase, setPhase] = useState<'wizard' | 'success'>('wizard');
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const [clienteId, setClienteId] = useState('');
  const [valorSolicitado, setValorSolicitado] = useState(3000);
  const [valorEntrada, setValorEntrada] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [motivo, setMotivo] = useState('');
  const [numParcelas, setNumParcelas] = useState(6);
  const [intervalo, setIntervalo] = useState<IntervaloPedido>('MENSAL');
  const [formato, setFormato] = useState<FormatoCobrancaPedido>('CARNE');
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamentoPedido[]>(['PIX', 'DINHEIRO']);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapPin, setMapPin] = useState({ x: 50, y: 50 });
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState('');

  const step = STEPS[stepIndex];
  const cliente = clientes.find((c) => c.id === clienteId);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const valorFinanciado = Math.max(0, valorSolicitado - valorEntrada);
  const valorParcela = numParcelas > 0 ? Number((valorFinanciado / numParcelas).toFixed(2)) : 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) {
      setPhase('wizard');
      setStepIndex(0);
      setDirection(1);
      setClienteId('');
      setValorSolicitado(3000);
      setValorEntrada(0);
      setDescricao('');
      setMotivo('');
      setNumParcelas(6);
      setIntervalo('MENSAL');
      setFormato('CARNE');
      setFormasPagamento(['PIX', 'DINHEIRO']);
      setCoords(null);
      setAssinatura(null);
    }
  }, [open]);

  const goNext = () => {
    if (!validateStep(step.id)) return;
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const validateStep = (id: StepId): boolean => {
    if (id === 'cliente' && !clienteId) {
      alert('Selecione um cliente para continuar.');
      return false;
    }
    if (id === 'credito') {
      if (valorSolicitado <= 0) { alert('Informe o valor do crédito.'); return false; }
      if (!motivo.trim()) { alert('Descreva o motivo do pedido.'); return false; }
    }
    if (id === 'parcelas' && numParcelas < 1) {
      alert('Defina pelo menos 1 parcela.');
      return false;
    }
    if (id === 'pagamentos' && formasPagamento.length === 0) {
      alert('Selecione ao menos uma forma de pagamento.');
      return false;
    }
    if (id === 'local' && !coords) {
      alert('Capture a localização no mapa ou use o GPS.');
      return false;
    }
    if (id === 'assinatura' && !assinatura) {
      alert('A assinatura do cliente é obrigatória.');
      return false;
    }
    return true;
  };

  const captureGps = () => {
    setGpsLoading(true);
    const done = (lat: number, lng: number) => {
      setCoords({ lat, lng });
      setGpsLoading(false);
    };
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => done(Number(p.coords.latitude.toFixed(5)), Number(p.coords.longitude.toFixed(5))),
        () => done(-23.5505, -46.6333),
        { timeout: 6000 }
      );
    } else {
      done(-23.5505, -46.6333);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMapPin({ x, y });
    const lat = -23.55 + (50 - y) * 0.002;
    const lng = -46.64 + (x - 50) * 0.002;
    setCoords({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) });
  };

  const togglePagamento = (id: FormaPagamentoPedido) => {
    setFormasPagamento((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!cliente || !validateStep('assinatura')) return;
    const id = `SOL-${Math.floor(100 + Math.random() * 900)}`;
    onSubmit({
      id,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      valorAtual: cliente.limiteCredito,
      valorSolicitado,
      motivo: motivo.trim(),
      status: 'Pendente',
      dataSolicitacao: new Date().toISOString().split('T')[0],
      valorFinanciado,
      valorEntrada,
      numeroParcelas: numParcelas,
      intervaloCobranca: intervalo,
      formatoCobranca: formato,
      formasPagamento,
      descricaoOperacao: descricao.trim() || motivo.trim(),
      valorParcelaEstimado: valorParcela,
      coordenadas: coords ?? undefined,
      enderecoReferencia: `${cliente.rua}, ${cliente.numero} — ${cliente.bairro}, ${cliente.cidade}`,
      assinaturaUrl: assinatura ?? undefined,
      clienteCpf: cliente.cpf,
      clienteTelefone: cliente.celularPrincipal,
      clienteBairro: cliente.bairro,
    });
    setSubmittedId(id);
    setPhase('success');
  };

  const stepContent = useMemo(() => {
    switch (step.id) {
      case 'cliente':
        return (
          <div className="space-y-4">
            <FormField label="Selecionar cliente">
              <Select
                value={clienteId}
                onChange={(e) => {
                  setClienteId(e.target.value);
                  const c = clientes.find((x) => x.id === e.target.value);
                  if (c) setValorSolicitado(c.limiteCredito + 1500);
                }}
              >
                <option value="">Escolha um cliente cadastrado</option>
                {clientes.filter((c) => c.status !== 'Inativo').map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} — {c.id}</option>
                ))}
              </Select>
            </FormField>
            {cliente && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)] p-4"
              >
                <img src={cliente.foto} alt="" className="size-14 rounded-full border border-[var(--border)] object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold text-[var(--text-primary)]">{cliente.nome}</p>
                  <p className="text-xs text-[var(--text-muted)]">CPF {cliente.cpf} · {cliente.celularPrincipal}</p>
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                    {cliente.bairro}, {cliente.cidade} — {cliente.estado}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="neutral">Limite R$ {cliente.limiteCredito.toLocaleString('pt-BR')}</Badge>
                    <Badge tone={cliente.scoreRisco === 'Excelente' || cliente.scoreRisco === 'Muito Bom' ? 'success' : 'warning'}>
                      {cliente.scoreRisco}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'credito':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Valor total do crédito (R$)">
                <Input type="number" min={1} value={valorSolicitado} onChange={(e) => setValorSolicitado(Number(e.target.value))} />
              </FormField>
              <FormField label="Entrada (R$)">
                <Input type="number" min={0} value={valorEntrada} onChange={(e) => setValorEntrada(Number(e.target.value))} />
              </FormField>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--accent-subtle)] px-4 py-3 text-sm">
              <span className="text-[var(--text-muted)]">Valor financiado: </span>
              <strong className="text-[var(--accent)]">R$ {valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
            <FormField label="Descrição da operação">
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Financiamento de móveis planejados" />
            </FormField>
            <FormField label="Motivo / justificativa">
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                placeholder="Contexto comercial e capacidade de pagamento"
                className="w-full resize-none rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
              />
            </FormField>
          </div>
        );

      case 'parcelas':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nº de parcelas">
                <Input type="number" min={1} max={48} value={numParcelas} onChange={(e) => setNumParcelas(Number(e.target.value))} />
              </FormField>
              <FormField label="Intervalo">
                <Select value={intervalo} onChange={(e) => setIntervalo(e.target.value as IntervaloPedido)}>
                  {Object.entries(INTERVALO_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Formato da cobrança">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FORMATO_LABEL) as FormatoCobrancaPedido[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormato(f)}
                    className={cn(
                      'rounded-[var(--radius-control)] border px-3 py-2.5 text-left text-xs font-medium transition',
                      formato === f
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                    )}
                  >
                    {FORMATO_LABEL[f]}
                  </button>
                ))}
              </div>
            </FormField>
            <motion.div
              layout
              className="rounded-[var(--radius-panel)] border border-[var(--border)] p-4 text-center"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Simulação</span>
              <motion.p
                key={valorParcela}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
              >
                {numParcelas}x R$ {valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </motion.p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{INTERVALO_LABEL[intervalo]} · {FORMATO_LABEL[formato]}</p>
            </motion.div>
          </div>
        );

      case 'pagamentos':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">Selecione as formas de pagamento aceitas neste pedido.</p>
            <div className="flex flex-wrap gap-2">
              {PAGAMENTO_OPTS.map((p) => {
                const active = formasPagamento.includes(p.id);
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => togglePagamento(p.id)}
                    className={cn(
                      'rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium transition',
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                    )}
                  >
                    {active && <Check className="mr-1 inline size-3.5" />}
                    {p.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 'local':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Toque no mapa para marcar o ponto de referência ou use o GPS do dispositivo.
            </p>
            <div
              role="button"
              tabIndex={0}
              onClick={handleMapClick}
              onKeyDown={() => {}}
              className="relative h-44 cursor-crosshair overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-muted)]"
              style={{
                backgroundImage: `
                  linear-gradient(oklch(0.88 0 0 / 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, oklch(0.88 0 0 / 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--success-subtle)]/30 to-transparent" />
              {cliente && (
                <span className="absolute left-3 top-3 max-w-[70%] truncate rounded bg-[var(--bg-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] shadow-sm">
                  {cliente.bairro}, {cliente.cidade}
                </span>
              )}
              <motion.div
                className="absolute size-8 -translate-x-1/2 -translate-y-full"
                style={{ left: `${mapPin.x}%`, top: `${mapPin.y}%` }}
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                <MapPin className="size-8 text-[var(--accent)] drop-shadow-sm" fill="currentColor" />
              </motion.div>
            </div>
            <Button type="button" variant="outline" fullWidth onClick={captureGps} disabled={gpsLoading}>
              {gpsLoading ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
              {gpsLoading ? 'Capturando GPS...' : 'Usar localização atual'}
            </Button>
            {coords && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center font-mono text-xs text-[var(--text-muted)]"
              >
                Lat {coords.lat} · Lng {coords.lng}
              </motion.p>
            )}
          </div>
        );

      case 'assinatura':
        return (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              Colete a assinatura do cliente para formalizar o pedido de crédito.
            </p>
            {cliente && (
              <p className="text-xs text-[var(--text-muted)]">
                Declarante: <strong className="text-[var(--text-primary)]">{cliente.nome}</strong> — CPF {cliente.cpf}
              </p>
            )}
            <SignaturePad onChange={setAssinatura} />
          </div>
        );

      case 'revisao':
        return (
          <div className="space-y-3 text-sm">
            {[
              ['Cliente', cliente?.nome],
              ['Crédito', `R$ ${valorSolicitado.toLocaleString('pt-BR')} (entrada R$ ${valorEntrada.toLocaleString('pt-BR')})`],
              ['Parcelas', `${numParcelas}x R$ ${valorParcela.toLocaleString('pt-BR')} · ${INTERVALO_LABEL[intervalo]}`],
              ['Cobrança', FORMATO_LABEL[formato]],
              ['Pagamentos', formasPagamento.join(', ')],
              ['Local', coords ? `${coords.lat}, ${coords.lng}` : '—'],
              ['Assinatura', assinatura ? 'Coletada' : 'Pendente'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="text-right font-medium text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
            {assinatura && (
              <img src={assinatura} alt="Assinatura" className="mx-auto h-16 object-contain opacity-80" />
            )}
          </div>
        );

      default:
        return null;
    }
  }, [
    step.id, clienteId, clientes, cliente, valorSolicitado, valorEntrada, valorFinanciado,
    descricao, motivo, numParcelas, intervalo, formato, valorParcela, formasPagamento,
    mapPin, coords, gpsLoading, assinatura,
  ]);

  return (
    <AnimatePresence>
      {open && (
    <div className={cn(overlayClass, 'z-[var(--z-modal)]')} role="dialog" aria-modal="true">
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={phase === 'success' ? onClose : onClose}
        className="absolute inset-0"
        aria-label="Fechar"
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="surface-elevated relative z-10 flex max-h-[min(94dvh,calc(100dvh-1.5rem))] w-full flex-col overflow-hidden rounded-t-[var(--radius-panel)] border border-[var(--surface-border)] dark:border-transparent sm:max-h-[94dvh] sm:max-w-lg sm:rounded-[var(--radius-panel)]"
      >
        <AnimatePresence mode="wait">
          {phase === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center px-6 py-14 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="flex size-20 items-center justify-center rounded-full bg-[var(--success-subtle)]"
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  <Check className="size-10 text-[var(--success)]" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 text-lg font-semibold text-[var(--text-primary)]"
              >
                Pedido registrado
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-2 text-sm text-[var(--text-muted)]"
              >
                {submittedId} enviado para análise. O cliente será notificado após aprovação.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="mt-8 flex w-full flex-col gap-2"
              >
                <Button type="button" fullWidth onClick={onClose}>
                  <Sparkles className="size-4" /> Concluir
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="wizard" className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-[var(--border)] px-4 pb-3 pt-4 sm:px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">Novo pedido de crédito</h2>
                    <p className="text-xs text-[var(--text-muted)]">Etapa {stepIndex + 1} de {STEPS.length} — {step.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[var(--radius-control)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                    aria-label="Fechar"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--accent)]"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const active = i === stepIndex;
                    const done = i < stepIndex;
                    return (
                      <div
                        key={s.id}
                        className={cn(
                          'flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2 py-1 text-[10px] font-medium transition',
                          active ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : done ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'text-[var(--text-muted)]'
                        )}
                      >
                        <Icon className="size-3" aria-hidden />
                        {s.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {stepContent}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="shrink-0 flex gap-2 border-t border-[var(--border)] p-4 sm:px-5" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <Button type="button" variant="outline" onClick={stepIndex === 0 ? onClose : goBack} className="flex-1">
                  {stepIndex === 0 ? 'Cancelar' : <><ChevronLeft className="size-4" /> Voltar</>}
                </Button>
                {stepIndex < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext} className="flex-1">
                    Continuar <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} className="flex-1">
                    <Check className="size-4" /> Enviar pedido
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );
}