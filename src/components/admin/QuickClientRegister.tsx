import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, FileText, X } from 'lucide-react';
import { Cliente } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';
import { overlayClass, modalClass } from '../../lib/formStyles';
import { cn } from '../../lib/cn';

interface QuickClientRegisterProps {
  open: boolean;
  onSave: (cliente: Cliente) => void;
  onClose: () => void;
  onOpenFullForm?: () => void;
}

export function QuickClientRegister({ open, onSave, onClose, onOpenFullForm }: QuickClientRegisterProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [limiteCredito, setLimiteCredito] = useState(1500);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNome('');
      setCpf('');
      setCelular('');
      setEmail('');
      setCidade('');
      setBairro('');
      setLimiteCredito(1500);
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cpf.trim() || !celular.trim()) {
      setError('Preencha nome, CPF e celular para concluir o cadastro.');
      return;
    }

    const novo: Cliente = {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      nome: nome.trim(),
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rg: '',
      cpf: cpf.trim(),
      dataNascimento: '',
      sexo: 'Não Informado',
      estadoCivil: 'Solteiro(a)',
      nacionalidade: 'Brasileira',
      naturalidade: cidade || 'São Paulo',
      nomeMae: '',
      nomePai: '',
      celularPrincipal: celular.trim(),
      celularSecundario: '',
      whatsApp: celular.trim(),
      email: email.trim() || `${cpf.replace(/\D/g, '').slice(0, 8)}@cliente.local`,
      telefoneResidencial: '',
      telefoneComercial: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: bairro.trim() || 'Centro',
      cidade: cidade.trim() || 'São Paulo',
      estado: 'SP',
      coordenadasGps: { lat: -23.5505, lng: -46.6333 },
      empresa: '',
      cargo: '',
      tempoServico: '',
      salario: 0,
      tipoVinculo: 'CLT',
      rendaFamiliar: 0,
      telefoneEmpresa: '',
      referencias: [{ id: '1', nome: '', parentesco: '', telefone: '', endereco: '' }],
      limiteCredito,
      limiteUtilizado: 0,
      limiteDisponivel: limiteCredito,
      scoreInterno: 550,
      scoreRisco: 'Bom',
      frequenciaPagamento: 'Bom',
      mediaDiasAtraso: 0,
      totalComprado: 0,
      totalPago: 0,
      totalEmAberto: 0,
      valorMedioCompras: 0,
      documentos: [],
      status: 'Ativo',
      dataCadastro: new Date().toISOString().split('T')[0],
    };

    onSave(novo);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={overlayClass} role="dialog" aria-modal="true" aria-labelledby="quick-register-title">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            aria-label="Fechar"
          />

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              modalClass,
              'relative z-10 flex max-h-[min(94dvh,calc(100dvh-1.5rem))] flex-col overflow-hidden p-0 sm:max-h-[92dvh] sm:max-w-lg'
            )}
          >
            <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                    <UserPlus className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h2 id="quick-register-title" className="text-base font-semibold text-[var(--text-primary)]">
                      Cadastro rápido
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Registre em menos de 1 minuto. Complete o perfil depois.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-[var(--radius-control)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Nome completo" className="sm:col-span-2">
                    <Input value={nome} onChange={(e) => { setNome(e.target.value); setError(''); }} placeholder="Ex: Ana Paula Souza" required />
                  </FormField>
                  <FormField label="CPF">
                    <Input value={cpf} onChange={(e) => { setCpf(e.target.value); setError(''); }} placeholder="000.000.000-00" required />
                  </FormField>
                  <FormField label="Celular / WhatsApp">
                    <Input value={celular} onChange={(e) => { setCelular(e.target.value); setError(''); }} placeholder="(11) 99999-9999" required />
                  </FormField>
                  <FormField label="E-mail">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opcional" />
                  </FormField>
                  <FormField label="Limite inicial (R$)">
                    <Input
                      type="number"
                      min={500}
                      step={100}
                      value={limiteCredito}
                      onChange={(e) => setLimiteCredito(Number(e.target.value))}
                    />
                  </FormField>
                  <FormField label="Cidade">
                    <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
                  </FormField>
                  <FormField label="Bairro">
                    <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
                  </FormField>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[1000, 1500, 3000, 5000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setLimiteCredito(v)}
                      className={cn(
                        'rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-medium transition',
                        limiteCredito === v
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                          : 'surface-muted text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]'
                      )}
                    >
                      R$ {v.toLocaleString('pt-BR')}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="rounded-[var(--radius-control)] bg-[var(--destructive-subtle)] px-3 py-2 text-xs text-[var(--destructive)]">
                    {error}
                  </p>
                )}
              </div>

              <div
                className="shrink-0 space-y-2 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 dark:bg-[var(--bg-elevated)] sm:px-5"
                style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              >
                {onOpenFullForm && (
                  <Button type="button" variant="ghost" size="sm" fullWidth onClick={onOpenFullForm}>
                    <FileText className="size-4" /> Usar cadastro completo
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" fullWidth onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" fullWidth>
                    Registrar cliente
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}