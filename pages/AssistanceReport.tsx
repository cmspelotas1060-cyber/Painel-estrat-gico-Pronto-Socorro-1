
import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Activity, ClipboardList, Share2, 
  Download, Filter, ChevronDown, CheckCircle, Loader2, Link as LinkIcon
} from 'lucide-react';

const AssistanceReport: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) setData(JSON.parse(saved));
    setLoading(false);
  }, []);

  const compressData = async (data: string): Promise<string> => {
    const stream = new Blob([data]).stream();
    const compressedReadableStream = stream.pipeThrough(new CompressionStream("gzip"));
    const compressedResponse = await new Response(compressedReadableStream);
    const blob = await compressedResponse.blob();
    const buffer = await blob.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  const handleShareView = async () => {
    setIsGenerating(true);
    try {
      // Filter ONLY assistance keys to keep the link lightweight
      const filteredStats: any = {};
      const assistanceKeys = [
        'i1_acolhimento', 'i1_consultas', 'i2_consultas_psp', 'i3_urgencia', 'i3_emergencia',
        'i5_clinica_medica', 'i5_pediatria', 'i14_laboratoriais', 'i15_raio_x', 'i15_tomografias'
      ];
      
      Object.keys(data).forEach(period => {
        filteredStats[period] = {};
        assistanceKeys.forEach(key => {
          if (data[period][key] !== undefined) filteredStats[period][key] = data[period][key];
        });
      });

      const payload = { stats: filteredStats, view: 'assistance', ver: 2 };
      const compressed = await compressData(JSON.stringify(payload));
      const url = `${window.location.origin}${window.location.pathname}#/assistance?share=gz_${compressed}`;
      
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareModal(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fixed calculateTotal: Explicitly define the return type as number to satisfy TS arithmetic requirements
  const calculateTotal = (key: string): number => {
    if (!data) return 0;
    const values = Object.values(data) as any[];
    return values.reduce((acc: number, curr: any) => acc + (parseFloat(curr[key]) || 0), 0);
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Produção Assistencial</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Stethoscope size={16} className="text-blue-500"/>
            Análise de Atendimentos, Consultas e Exames Diagnósticos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-100"
          >
            <Share2 size={16} /> Compartilhar Visão
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Acolhimentos Totais</p>
          <h2 className="text-3xl font-black text-slate-800">{calculateTotal('i1_acolhimento').toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Consultas Médicas</p>
          <h2 className="text-3xl font-black text-blue-600">{calculateTotal('i1_consultas').toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Taxa de Conversão</p>
          <h2 className="text-3xl font-black text-emerald-600">
            {/* The explicit typing of calculateTotal as returning 'number' resolves the arithmetic operation error below */}
            {((calculateTotal('i1_consultas') / (calculateTotal('i1_acolhimento') || 1)) * 100).toFixed(1)}%
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <ClipboardList size={18} className="text-blue-500"/> Produção por Especialidade
           </h3>
           <div className="space-y-3">
              {[
                { label: 'Clínica Médica', key: 'i5_clinica_medica' },
                { label: 'Pediatria', key: 'i5_pediatria' },
                { label: 'Cirurgia Vascular', key: 'i5_cirurgia_vascular' },
                { label: 'Ginecologia', key: 'i5_ginecologia' },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{calculateTotal(item.key).toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <Activity size={18} className="text-purple-500"/> Volume de Exames
           </h3>
           <div className="space-y-3">
              {[
                { label: 'Laboratoriais', key: 'i14_laboratoriais' },
                { label: 'Tomografias', key: 'i15_tomografias' },
                { label: 'Raio X', key: 'i15_raio_x' },
                { label: 'Ultrassom', key: 'i16_ultrasson' },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{calculateTotal(item.key).toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <LinkIcon size={20} className="text-blue-600" /> Compartilhar Visão Assistencial
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              O link gerado conterá apenas os dados assistenciais desta aba, sendo mais curto e rápido para compartilhar.
            </p>
            <button 
              onClick={handleShareView} 
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                copySuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : copySuccess ? <CheckCircle /> : <Share2 size={18} />}
              {copySuccess ? 'Link Copiado!' : 'Gerar e Copiar Link Curto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistanceReport;
