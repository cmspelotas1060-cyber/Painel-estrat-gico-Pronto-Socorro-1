
import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Share2, Download, 
  ChevronRight, TrendingUp, DollarSign, Activity,
  CheckCircle, Loader2, Link as LinkIcon
} from 'lucide-react';

const RQDA: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [selectedQ, setSelectedQ] = useState('q1');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) setData(JSON.parse(saved));
  }, []);

  const currentData = data[selectedQ] || {};

  const handleShareRQDA = async () => {
    setIsGenerating(true);
    try {
      // THE ULTIMATE LIGHTWEIGHT LINK: Send ONLY the selected quadrimestre
      const filteredStats = {
        [selectedQ]: currentData
      };

      const payload = { stats: filteredStats, view: `rqda_${selectedQ}`, ver: 2 };
      const stream = new Blob([JSON.stringify(payload)]).stream();
      const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
      const resp = await new Response(compressedStream);
      const blob = await resp.blob();
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      const url = `${window.location.origin}${window.location.pathname}#/rqda?share=gz_${base64}`;
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

  const SummaryCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* HEADER E SELETOR */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">RQDA</h1>
            <p className="text-slate-500 text-sm font-medium">Relatório do Quadrimestre Anterior</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['q1', 'q2', 'q3'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQ(q)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedQ === q ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {q.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* DASHBOARD RQDA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Produção Total" 
          value={(parseFloat(currentData.i1_acolhimento) || 0).toLocaleString()} 
          sub="Acolhimentos registrados"
          icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard 
          title="Investimento" 
          value={`R$ ${(parseFloat(currentData.fin_total) || 0).toLocaleString('pt-BR')}`} 
          sub="Custo operacional total"
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard 
          title="Casos Graves" 
          value={(parseFloat(currentData.i3_emergencia) || 0).toLocaleString()} 
          sub="Emergências (Vermelho)"
          icon={Activity}
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DETALHES ASSISTENCIAIS */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle size={18} className="text-blue-500" /> Indicadores de Produção
          </div>
          <div className="p-6 space-y-4">
             {[
               { label: 'Consultas Médicas', val: currentData.i1_consultas },
               { label: 'Atendimentos Traumato', val: currentData.i3_traumato_sc },
               { label: 'Exames Laboratoriais', val: currentData.i14_laboratoriais },
               { label: 'Tomografias Realizadas', val: currentData.i15_tomografias },
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                 <span className="text-slate-600 font-medium">{row.label}</span>
                 <span className="font-black text-slate-800">{(parseFloat(row.val) || 0).toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        {/* DETALHES DE FLUXO */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <Calendar size={18} className="text-purple-500" /> Fluxo e Ocupação
          </div>
          <div className="p-6 space-y-4">
             {[
               { label: 'Ocupação Clínica (Média)', val: currentData.i10_clinico_adulto, suffix: '%' },
               { label: 'Ocupação UTI (Média)', val: currentData.i10_uti_adulto, suffix: '%' },
               { label: 'Média de Permanência', val: currentData.i11_mp_clinico_adulto, suffix: ' dias' },
               { label: 'Total de Altas no Período', val: currentData.i12_alta, suffix: '' },
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                 <span className="text-slate-600 font-medium">{row.label}</span>
                 <span className="font-black text-slate-800">{(parseFloat(row.val) || 0)}{row.suffix}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs italic">
        Este relatório é um documento oficial de prestação de contas do {selectedQ.toUpperCase()} de 2025. 
        Os dados são extraídos do Painel de Gestão Estratégica.
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <LinkIcon size={20} className="text-blue-600" /> Link de Relatório Leve
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              O link gerado conterá <strong>apenas</strong> os dados do <strong>{selectedQ.toUpperCase()}</strong>. 
              Isso o torna extremamente curto e ideal para envios rápidos.
            </p>
            <button 
              onClick={handleShareRQDA} 
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                copySuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : copySuccess ? <CheckCircle /> : <Share2 size={18} />}
              {copySuccess ? 'Link do Quadrimestre Copiado!' : `Compartilhar ${selectedQ.toUpperCase()}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RQDA;
