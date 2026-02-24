
import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Share2, Download, 
  ChevronRight, TrendingUp, DollarSign, Activity,
  CheckCircle, Loader2, Link as LinkIcon,
  Plus, Trash2
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const RQDA: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [years, setYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('ps_available_years');
    return saved ? JSON.parse(saved) : ['2024', '2025'];
  });
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1] || '2025');
  const [selectedPeriod, setSelectedPeriod] = useState('q1');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) setData(JSON.parse(saved));
  }, []);

  const handleAddYear = () => {
    const newYear = prompt('Digite o novo ano (ex: 2026):');
    if (newYear && /^\d{4}$/.test(newYear)) {
      if (!years.includes(newYear)) {
        const newYears = [...years, newYear].sort();
        setYears(newYears);
        localStorage.setItem('ps_available_years', JSON.stringify(newYears));
        setSelectedYear(newYear);
      } else {
        alert('Este ano já existe.');
      }
    } else if (newYear) {
      alert('Ano inválido. Use o formato AAAA.');
    }
  };

  const handleDeleteYear = () => {
    if (years.length <= 1) {
      alert('Não é possível excluir todos os anos.');
      return;
    }
    if (confirm(`Deseja realmente excluir o ano ${selectedYear} e todos os seus dados deste relatório?`)) {
      const newYears = years.filter(y => y !== selectedYear);
      setYears(newYears);
      localStorage.setItem('ps_available_years', JSON.stringify(newYears));
      setSelectedYear(newYears[newYears.length - 1]);
    }
  };

  const currentData = (data[selectedYear] && data[selectedYear][selectedPeriod]) || data[selectedPeriod] || {};

  const handleShareRQDA = async () => {
    setIsGenerating(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('ps_') || 
          key.startsWith('rdqa_') || 
          key.startsWith('ui_') || 
          key.startsWith('cms_') || 
          key.startsWith('dashboard_') ||
          key === 'migration_fix_2026_to_2025'
        )) {
          fullDb[key] = localStorage.getItem(key);
        }
      }

      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      
      const compressedBytes = new Uint8Array(compressedBuffer);
      let binary = '';
      for (let i = 0; i < compressedBytes.byteLength; i++) {
        binary += String.fromCharCode(compressedBytes[i]);
      }
      const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
      
      const url = `${window.location.origin}${window.location.pathname}#/rqda?share=gz_${base64}`;
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => { setCopySuccess(false); setShowShareModal(false); }, 2000);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const SummaryCard = ({ id, title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 break-inside-avoid">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          <EditableText id={`rqda_card_title_${id}`} defaultText={title} />
        </p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        <p className="text-xs text-slate-500 mt-1">
          <EditableText id={`rqda_card_sub_${id}`} defaultText={sub} />
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* HEADER PADRONIZADO RQDA */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="rqda_view_title" defaultText="RQDA" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
              <Calendar size={16} className="text-blue-500"/>
              <EditableText id="rqda_view_subtitle" defaultText="Prestação de Contas Quadrimestral" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl focus:ring-0 outline-none cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={handleAddYear} title="Adicionar Ano" className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all">
              <Plus size={14} />
            </button>
            <button onClick={handleDeleteYear} title="Excluir Ano Selecionado" className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {['q1', 'q2', 'q3'].map((q) => (
              <button key={q} onClick={() => setSelectedPeriod(q)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${selectedPeriod === q ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{q.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setShowShareModal(true)} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard id="prod" title="Produção Total" value={(parseFloat(currentData.i1_acolhimento) || 0).toLocaleString()} sub="Acolhimentos registrados" icon={TrendingUp} color="bg-blue-50 text-blue-600" />
        <SummaryCard id="inv" title="Investimento" value={`R$ ${(parseFloat(currentData.fin_total) || 0).toLocaleString('pt-BR')}`} sub="Custo operacional total" icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        <SummaryCard id="grave" title="Casos Graves" value={(parseFloat(currentData.i3_emergencia) || 0).toLocaleString()} sub="Emergências (Vermelho)" icon={Activity} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <CheckCircle size={16} className="text-blue-500" /> 
            <EditableText id="rqda_sec_prod" defaultText="Indicadores de Produção" />
          </div>
          <div className="p-8 space-y-4">
             {[
               { label: 'Consultas Médicas', val: currentData.i1_consultas, id: 'c1' },
               { label: 'Atendimentos Traumato', val: currentData.i3_traumato_sc, id: 'c2' },
               { label: 'Exames Laboratoriais', val: currentData.i14_laboratoriais, id: 'c3' },
               { label: 'Tomografias Realizadas', val: currentData.i15_tomografias, id: 'c4' },
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                 <span className="text-slate-600 font-medium"><EditableText id={`rqda_row_l_${row.id}`} defaultText={row.label} /></span>
                 <span className="font-black text-slate-800">{(parseFloat(row.val) || 0).toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm break-inside-avoid">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" /> 
            <EditableText id="rqda_sec_fluxo" defaultText="Fluxo e Ocupação" />
          </div>
          <div className="p-8 space-y-4">
             {[
               { label: 'Ocupação Clínica (Média)', val: currentData.i10_clinico_adulto, suffix: '%', id: 'f1' },
               { label: 'Ocupação UTI (Média)', val: currentData.i10_uti_adulto, suffix: '%', id: 'f2' },
               { label: 'Média de Permanência', val: currentData.i11_mp_clinico_adulto, suffix: ' dias', id: 'f3' },
               { label: 'Total de Altas no Período', val: currentData.i12_alta, suffix: '', id: 'f4' },
             ].map((row, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                 <span className="text-slate-600 font-medium"><EditableText id={`rqda_row_l_${row.id}`} defaultText={row.label} /></span>
                 <span className="font-black text-slate-800">{(parseFloat(row.val) || 0)}{row.suffix}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[32px] border border-slate-200 text-center text-slate-500 text-xs italic font-medium">
        <EditableText id="rqda_footer_disclaimer" defaultText="Este relatório é um documento oficial de prestação de contas do quadrimestre de 2025. Os dados são extraídos do Painel de Gestão Estratégica." />
      </div>
      <DynamicNotes sectionId={`rqda_${selectedYear}_${selectedPeriod}`} />
    </div>
  );
};

export default RQDA;
