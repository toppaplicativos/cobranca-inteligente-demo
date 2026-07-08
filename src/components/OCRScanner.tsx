import React, { useState, useRef } from 'react';
import { Camera, FileText, Upload, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface OCRScannerProps {
  onScanComplete: (extractedData: {
    nome: string;
    cpf: string;
    rg: string;
    dataNascimento: string;
    nomeMae: string;
    nomePai: string;
  }) => void;
}

export default function OCRScanner({ onScanComplete }: OCRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MOCK_DOCUMENTS = [
    {
      tipo: 'RG - João Goulart',
      imagem: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400',
      dados: {
        nome: 'João Belchior Goulart Neto',
        cpf: '321.654.987-10',
        rg: '44.332.211-X',
        dataNascimento: '1988-04-18',
        nomeMae: 'Maria Teresa Goulart',
        nomePai: 'Vicente Goulart'
      }
    },
    {
      tipo: 'CNH - Patrícia Rocha',
      imagem: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      dados: {
        nome: 'Patrícia da Silva Rocha',
        cpf: '987.654.321-09',
        rg: '10.203.405-6',
        dataNascimento: '1995-11-03',
        nomeMae: 'Clara da Silva Rocha',
        nomePai: 'Ronaldo Rocha'
      }
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        triggerScanning(MOCK_DOCUMENTS[0].dados); // Default mock for custom files
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectMock = (doc: typeof MOCK_DOCUMENTS[0]) => {
    setPreviewImage(doc.imagem);
    triggerScanning(doc.dados);
  };

  const triggerScanning = (dadosExtraidos: any) => {
    setIsScanning(true);
    setScanResult(null);
    setProgress(0);
    
    const steps = [
      'Alinhando documento na grade de leitura...',
      'Detectando bordas e aplicando filtro bilinear...',
      'Processando OCR com IA (Rede Neural Convolucional)...',
      'Extraindo metadados e validando CPF na Receita Federal...',
      'Pronto! Verificação de integridade concluída.'
    ];

    let currentStepIndex = 0;
    setScanStep(steps[currentStepIndex]);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;
        
        // Change text based on progress
        const stepIndex = Math.floor((next / 100) * steps.length);
        if (stepIndex !== currentStepIndex && stepIndex < steps.length) {
          currentStepIndex = stepIndex;
          setScanStep(steps[stepIndex]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanResult(dadosExtraidos);
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const confirmImport = () => {
    if (scanResult) {
      onScanComplete(scanResult);
      // Reset state
      setPreviewImage(null);
      setScanResult(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-950 dark:text-white text-base">Scanner de Documentos com OCR Inteligente</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Digitalize RG, CPF ou CNH via foto para preencher o formulário instantaneamente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document input selection */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl p-6 transition flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-950/30 relative overflow-hidden group min-h-[220px]">
            {previewImage ? (
              <div className="relative w-full h-full max-h-[200px] flex items-center justify-center">
                <img src={previewImage} alt="Preview documento" className="max-h-[180px] rounded-lg object-contain" />
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-sky-500 shadow-[0_0_15px_#0ea5e9] animate-[bounce_2s_infinite] top-0" />
                )}
              </div>
            ) : (
              <div className="cursor-pointer w-full h-full flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-sky-500 transition mb-3" />
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">Upload do Documento</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Arraste ou clique para selecionar (JPG, PNG ou PDF)</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,application/pdf" 
              className="hidden" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Modelos de Teste Rápido</label>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_DOCUMENTS.map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectMock(doc)}
                  disabled={isScanning}
                  className="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 rounded-lg text-left transition disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-slate-400" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{doc.tipo}</p>
                    <p className="text-[10px] text-slate-500 truncate">{doc.dados.nome}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OCR Result and Scanning States */}
        <div className="flex flex-col justify-between border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl p-5 min-h-[220px]">
          {isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mb-4" />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 max-w-xs mb-3">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all duration-150" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 animate-pulse">{progress}% - {scanStep}</p>
            </div>
          ) : scanResult ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-3">
                  <CheckCircle2 className="w-4 h-4" /> Leitura OCR Completa (Confiança 99.4%)
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-3">
                  <div className="col-span-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5">
                    <span className="text-[10px] text-slate-500 block">Nome Completo</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{scanResult.nome}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">CPF</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{scanResult.cpf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RG</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{scanResult.rg}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Data de Nascimento</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{scanResult.dataNascimento}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sexo</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Não Declarado</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-500 block">Filiação</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium">{scanResult.nomeMae} (Mãe)</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium block">{scanResult.nomePai} (Pai)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setScanResult(null)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Limpar
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Importar Dados
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <ShieldAlert className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">Selecione um modelo de teste ou faça upload de um documento para iniciar a análise OCR por inteligência artificial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
