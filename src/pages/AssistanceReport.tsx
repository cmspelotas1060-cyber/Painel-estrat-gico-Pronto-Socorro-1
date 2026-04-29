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

  const acolhimentosTotais = calculateTotal('i1_acolhimento');
  const consultasMedicas = calculateTotal('i1_consultas');
  const taxaConversao = ((consultasMedicas / (acolhimentosTotais || 1)) * 100).toFixed(1);

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center space-y-4">
      <Activity className="animate-spin text-blue-500" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sincronizando Relatórios...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER LUXE - IDENTICAL TO FINANCIAL */}
      <div className="bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl border-b-[8px] md:border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 md:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10 w-full lg:w-auto">
          <div className="p-4 md:p-6 bg-white text-slate-900 rounded-[24px] md:rounded-[32px] shadow-xl shrink-0 transform -rotate-3">
             <Stethoscope size={32} className="md:w-10 md:h-10" strokeWidth={3} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="assist_main_title_premium" defaultText="Relatório Técnico Assistencial" />
            </h1>
            <p className="text-blue-300/60 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-center sm:text-left">
              <EditableText id="assist_data_sources" defaultText="Monitoramento de Fluxo e Produção Médica" />
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
              <p className="text-blue-400 flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                 <Activity size={16} />
                 Sincronização de Indicadores {selectedYear}
              </p>
              <div className="h-4 w-[1px] bg-white/20 hidden sm:block mx-2"></div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                 {['2025', '2026', '2027', '2028', '2029'].map(yr => (
                   <button 
                     key={yr} 
                     onClick={() => setSelectedYear(yr)}
                     className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {yr}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => window.print()} 
            className="p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all border border-white/20 flex items-center gap-3 group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* QUADRO EXPLICATIVO COMUNIDADE - STYLE MATCH */}
      <div className="animate-slide-down -mt-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row relative overflow-hidden group hover:border-blue-400 transition-all gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all text-blue-600 pointer-events-none">
            <ClipboardList size={160} />
          </div>
          
          <div className="flex-1 space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Auditagem Assistencial</span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">O que esses indicadores representam?</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">👨‍⚕️</span>
                <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight pt-1">Capacidade de Resposta e Fluxo</p>
              </div>
              
              <ul className="space-y-3 ml-8">
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300"><b>Acolhimento:</b> Reflete o primeiro contato do cidadão com a unidade de saúde e a triagem de riscos.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300"><b>Consultas Médicas:</b> Demonstra a resolutividade e o volume de atendimentos clínicos realizados.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300"><b>Taxa de Efetividade:</b> Mede o percentual de triagens que evoluíram para consulta médica imediata.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300"><b>Transparência:</b> Garante que o cidadão saiba exatamente como o PS está atendendo a demanda da cidade.</li>
              </ul>
            </div>
          </div>

          <div className="md:w-72 flex flex-col justify-center relative z-10">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-2">Público-Alvo</p>
                <p className="text-xs font-black text-blue-700 leading-tight uppercase">Saúde Direta para a Comunidade de Pelotas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIG KPIS BOARD - HIGHLIGHTING ACOLHIMENTO & CONSULTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ACOLHIMENTO BOARD */}
        <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all flex flex-col justify-between min-h-[350px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-4 bg-blue-600 text-white rounded-[24px] shadow-xl shadow-blue-100 transform -rotate-3">
                    <Users size={32} />
                 </div>
                 <span className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">Indicador Primário</span>
              </div>
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">Acolhimento</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-10">Total de Triagens e Fluxo de Entrada</p>
              
              <div className="flex items-baseline gap-4 mt-auto">
                 <h2 className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                    {acolhimentosTotais.toLocaleString()}
                 </h2>
                 <span className="text-blue-500 font-black text-xl uppercase tracking-widest">Pessoas</span>
              </div>
           </div>
           <div className="absolute bottom-10 right-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:rotate-12 transform">
              <ClipboardList size={220} />
           </div>
           <div className="mt-10 relative z-10 flex items-center gap-3">
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Triagem Técnica Realizada</p>
           </div>
        </div>

        {/* CONSULTAS BOARD */}
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group transition-all flex flex-col justify-between min-h-[350px] border-b-[12px] border-purple-600">
           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700"></div>
           <div className="relative z-10 text-white">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-4 bg-purple-600 text-white rounded-[24px] shadow-xl shadow-purple-900/50 transform rotate-3">
                    <Activity size={32} />
                 </div>
                 <span className="px-4 py-2 bg-white/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">Resolutividade</span>
              </div>
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Consultas Médicas</h3>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-10">Atendimento Clínico Especializado</p>
              
              <div className="flex items-baseline gap-4 mt-auto">
                 <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums leading-none">
                    {consultasMedicas.toLocaleString()}
                 </h2>
                 <span className="text-purple-500 font-black text-xl uppercase tracking-widest">Atendimentos</span>
              </div>
           </div>
           <div className="absolute bottom-10 right-10 opacity-[0.05] group-hover:opacity-[0.15] transition-all duration-700 -rotate-12 transform">
              <Stethoscope size={220} />
           </div>
           <div className="mt-10 relative z-10 flex items-center gap-3">
              <div className="h-1 w-20 bg-purple-600 rounded-full"></div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Assistência Médica Plena</p>
           </div>
        </div>
      </div>

      {/* QUADRIMESTRAL SUMMARY - STYLE MATCH */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Calendar size={24}/></div>
            Consolidado Quadrimestral {selectedYear}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'q1', label: '1º Quadrimestre', sub: 'Janeiro a Abril', color: 'blue', months: ['jan', 'feb', 'mar', 'apr'] },
            { id: 'q2', label: '2º Quadrimestre', sub: 'Maio a Agosto', color: 'purple', months: ['may', 'jun', 'jul', 'aug'] },
            { id: 'q3', label: '3º Quadrimestre', sub: 'Setembro a Dezembro', color: 'emerald', months: ['sep', 'oct', 'nov', 'dec'] }
          ].map(q => {
            const themes: Record<string, string> = {
              blue: 'border-blue-100 bg-blue-50/30 text-blue-600',
              purple: 'border-purple-100 bg-purple-50/30 text-purple-600',
              emerald: 'border-emerald-100 bg-emerald-50/30 text-emerald-600'
            };
            const iconThemes: Record<string, string> = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              emerald: 'bg-emerald-100 text-emerald-600'
            };

            const getQuadTotal = (months: string[]) => {
              if (!data) return 0;
              return months.reduce((acc, m) => acc + (parseFloat(data[m]?.i1_consultas) || 0), 0);
            };

            return (
              <div key={q.id} className="space-y-4">
                <div className={`p-8 rounded-[40px] border-2 shadow-sm flex flex-col items-center text-center group transition-all duration-300 bg-white ${themes[q.color]}`}>
                  <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:rotate-12 ${iconThemes[q.color]}`}>
                    <Activity size={28} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{q.label}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{q.sub}</p>
                  <div className="flex items-baseline gap-1 font-black text-slate-900 tabular-nums">
                    <span className="text-2xl">{getQuadTotal(q.months).toLocaleString()}</span>
                    <span className="text-[10px] uppercase opacity-40">Consultas</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADDITIONAL STATS GRID - BENTO STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-12 lg:col-span-12">
            <div className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4 mb-10">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24}/></div>
                 Efetividade de Atendimento
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* KPI BOX: TAXA */}
                  <div className="p-8 bg-emerald-900 rounded-[40px] text-white relative overflow-hidden group/card shadow-2xl">
                     <div className="absolute top-0 right-0 p-6 opacity-10"><TrendingUp size={80}/></div>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Taxa de Conversão</p>
                     <div className="flex items-baseline gap-2">
                        <h2 className="text-5xl font-black">{taxaConversao}</h2>
                        <span className="text-2xl font-black text-emerald-500">%</span>
                     </div>
                     <p className="text-[9px] text-slate-400 mt-4 uppercase font-bold tracking-widest leading-relaxed">Percentual de triagens que resultaram em consulta clínica imediata.</p>
                  </div>

                  {/* MINI INDICATORS GRID */}
                  {[
                    { label: 'Exames Lab.', key: 'i14_laboratoriais', icon: Layers, color: 'blue' },
                    { label: 'Pediatria', key: 'i5_pediatria', icon: Users, color: 'purple' },
                    { label: 'Tomografias', key: 'i15_tomografias', icon: Zap, color: 'orange' },
                    { label: 'Clínica Médica', key: 'i5_clinica_medica', icon: Stethoscope, color: 'blue' },
                    { label: 'Emergência', key: 'i3_emergencia', icon: Zap, color: 'red' },
                    { label: 'Urgência', key: 'i3_urgencia', icon: Activity, color: 'orange' },
                    { label: 'Quedas', key: 'i8_queda', icon: TrendingDown, color: 'slate' },
                  ].map(item => (
                    <div key={item.key} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col justify-between hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-white text-slate-400 rounded-xl"><item.icon size={20} /></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedYear}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                          {calculateTotal(item.key).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </div>

      {/* FOOTER INFO - STYLE MATCH */}
      <div className="bg-slate-900 p-10 rounded-[48px] border-b-[8px] border-blue-600 flex flex-col md:flex-row items-center gap-8 justify-between text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10"><Users size={24} className="text-blue-400"/></div>
            <div>
               <p className="text-xs font-black text-white uppercase tracking-widest">Informações Auditadas e Oficiais</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Dados sincronizados mensalmente via prontuário eletrônico — PSPel.</p>
            </div>
         </div>
         <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            <div className="w-6 h-1 bg-white/40 rounded-full"></div>
            <div className="w-3 h-1 bg-blue-600 rounded-full"></div>
         </div>
      </div>
    </div>
  );
};

export default AssistanceReport;
