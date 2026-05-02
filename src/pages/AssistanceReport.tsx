import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Activity, ClipboardList, 
  Download, Filter, ChevronDown, Users, 
  TrendingUp, TrendingDown, Clock, ShieldCheck,
  Calendar, Layers, Zap, Briefcase, Plus
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { storage } from '../services/storage';

const AssistanceReport: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [selectedYear]);

  const loadData = () => {
    const raw = storage.getSync('ps_monthly_detailed_stats');
    if (!raw) {
      setLoading(false);
      return;
    }

    // Handle legacy or nested structure
    if (raw[selectedYear]) {
      setData(raw[selectedYear]);
    } else if (raw.jan || raw.feb) {
      setData(selectedYear === '2025' ? raw : {});
    } else {
      setData({});
    }
    setLoading(false);
  };

  const calculateTotal = (key: string): number => {
    if (!data) return 0;
    const values = Object.values(data) as any[];
    return values.reduce((acc: number, curr: any) => acc + (parseFloat(curr[key]) || 0), 0);
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center space-y-4">
      <Activity className="animate-spin text-blue-500" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sincronizando Relatórios...</p>
    </div>
  );

  const acolhimentosTotais = calculateTotal('i1_acolhimento');
  const consultasMedicas = calculateTotal('i1_consultas');
  const taxaConversao = ((consultasMedicas / (acolhimentosTotais || 1)) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER LUXE */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[40px] md:rounded-[56px] shadow-2xl border-b-[12px] border-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-6 bg-white text-slate-900 rounded-[32px] shadow-2xl transform -rotate-3 border-4 border-blue-50">
               <Stethoscope size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none italic mb-3">
                <EditableText id="assist_main_title" defaultText="Relatório Técnico Assistencial" />
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest border border-white/10">Produção Médica</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-widest border border-white/10">Indicadores de Saúde</span>
                <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                   {['2025', '2026', '2027', '2028', '2029'].map(yr => (
                     <button 
                       key={yr} 
                       onClick={() => setSelectedYear(yr)}
                       className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${selectedYear === yr ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       {yr}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="group px-8 py-5 bg-white text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-3 active:scale-95 print:hidden"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            Exportar Consolidados
          </button>
        </div>
      </div>

      {/* MAIN KPIs GRID - TRANSFORMED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ACOLHIMENTO */}
        <div className="relative group overflow-hidden bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all duration-500">
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
           <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-200 mb-8 group-hover:rotate-6 transition-transform">
                <Users size={32} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total de Acolhimentos</p>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-4">
                {acolhimentosTotais.toLocaleString()}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full w-fit">
                 <TrendingUp size={14} className="text-blue-600" />
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Triagem Inicial Realizada</span>
              </div>
           </div>
           <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all -rotate-12 group-hover:rotate-0 duration-700">
             <ClipboardList size={140} />
           </div>
        </div>

        {/* CONSULTAS */}
        <div className="relative group overflow-hidden bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-purple-500 transition-all duration-500 border-b-[12px] border-b-purple-600">
           <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
           <div className="relative z-10">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-purple-200 mb-8 group-hover:-rotate-6 transition-transform">
                <Activity size={32} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Consultas Médicas</p>
              <h2 className="text-6xl font-black text-purple-900 tracking-tighter tabular-nums leading-none mb-4">
                {consultasMedicas.toLocaleString()}
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full w-fit">
                 <ShieldCheck size={14} className="text-purple-600" />
                 <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Assistência Médica Plena</span>
              </div>
           </div>
           <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all rotate-12 group-hover:rotate-0 duration-700">
             <Stethoscope size={140} />
           </div>
        </div>

        {/* TAXA CONVERSÃO */}
        <div className="relative group overflow-hidden bg-slate-900 p-10 rounded-[48px] shadow-2xl border-b-[12px] border-emerald-500 transition-all duration-500">
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
           <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-900/50 mb-8 group-hover:scale-110 transition-transform">
                <TrendingUp size={32} />
              </div>
              <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.3em] mb-2">Taxa de Efetividade</p>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                  {taxaConversao}
                </h2>
                <span className="text-3xl font-black text-emerald-500">%</span>
              </div>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Proporção consultas / acolhimento</p>
           </div>
           <div className="absolute bottom-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700">
             <TrendingUp size={140} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ESPECIALIDADES BENTO */}
        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-blue-600">
              <Briefcase size={120} />
           </div>
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4 mb-10">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Plus size={24}/></div>
             Produção por Especialidade
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Clínica Médica', key: 'i5_clinica_medica', color: 'blue', icon: Activity },
                { label: 'Pediatria', key: 'i5_pediatria', color: 'pink', icon: Users },
                { label: 'Cirurgia Vascular', key: 'i5_cirurgia_vascular', color: 'orange', icon: Layers },
                { label: 'Ginecologia', key: 'i5_ginecologia', color: 'purple', icon: ShieldCheck },
              ].map(item => (
                <div key={item.key} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 group/card">
                  <div className="flex items-center justify-between mb-8">
                     <div className={`p-3 rounded-xl bg-white text-slate-400 group-hover/card:scale-110 transition-transform`}>
                        <item.icon size={20} />
                     </div>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedYear}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                       {calculateTotal(item.key).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* VOLUME EXAMES BENTO */}
        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-purple-600">
              <Zap size={120} />
           </div>
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4 mb-10">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Layers size={24}/></div>
             Volume de Exames Diagnósticos
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Laboratoriais', key: 'i14_laboratoriais', icon: Activity },
                { label: 'Tomografias', key: 'i15_tomografias', icon: Zap },
                { label: 'Raio X', key: 'i15_raio_x', icon: ShieldCheck },
                { label: 'Ultrassom', key: 'i16_ultrasson', icon: Activity },
              ].map(item => (
                <div key={item.key} className="p-6 bg-slate-900 rounded-[32px] border border-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 group/card">
                  <div className="flex items-center justify-between mb-8">
                     <div className={`p-3 rounded-xl bg-white/5 text-purple-400`}>
                        <item.icon size={20} />
                     </div>
                     <div className="w-8 h-1 bg-purple-600/30 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <p className="text-3xl font-black text-white tracking-tighter tabular-nums">
                       {calculateTotal(item.key).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center gap-8 justify-between">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm"><Users size={24} className="text-blue-600"/></div>
            <div>
               <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Informações Auditadas</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Dados atualizados conforme registro em prontuário eletrônico.</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-12 h-1 bg-blue-100 rounded-full"></div>
            <div className="w-6 h-1 bg-blue-200 rounded-full"></div>
            <div className="w-3 h-1 bg-blue-600 rounded-full"></div>
         </div>
      </div>
    </div>
  );
};

export default AssistanceReport;
