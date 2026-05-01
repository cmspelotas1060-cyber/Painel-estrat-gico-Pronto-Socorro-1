import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Activity, ClipboardList, 
  Download, Filter, ChevronDown, Users, 
  TrendingUp, TrendingDown, Clock, ShieldCheck,
  Calendar, Layers, Zap, Briefcase, Plus, Edit3, Save, X, Loader2
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { storage } from '../services/storage';

const PERIOD_OPTIONS = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' }
];

const AssistanceReport: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [showManageModal, setShowManageModal] = useState(false);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({}); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('ui_editor_mode_changed', handleModeChange);
      window.removeEventListener('storage', loadData);
    };
  }, [selectedYear]);

  const loadData = async () => {
    let raw = storage.getSync('ps_monthly_detailed_stats');
    if (!raw) {
      raw = await storage.getItem('ps_monthly_detailed_stats');
    }

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

  const initiateManage = (keys: string[], label: string) => {
    setTargetKeys(keys);
    setTargetLabel(label);
    setAdminPassword('');
    setActionError('');
    
    const initialEditState: Record<string, Record<string, string>> = {};
    PERIOD_OPTIONS.forEach(period => {
      initialEditState[period.id] = {};
      keys.forEach(key => {
        const val = data[period.id]?.[key] ?? 0;
        initialEditState[period.id][key] = val.toString();
      });
    });
    
    setEditValues(initialEditState);
    setShowManageModal(true);
  };

  const saveChanges = async () => {
    if (adminPassword !== 'Conselho@2026') {
      setActionError('Senha incorreta.');
      return;
    }
    setIsSaving(true);
    try {
      const fullData = storage.getSync('ps_monthly_detailed_stats') || {};
      if (!fullData[selectedYear]) fullData[selectedYear] = {};

      PERIOD_OPTIONS.forEach(period => {
        if (!fullData[selectedYear][period.id]) fullData[selectedYear][period.id] = {};
        targetKeys.forEach(key => {
          fullData[selectedYear][period.id][key] = parseFloat(editValues[period.id][key] || "0");
        });
      });

      await storage.setItem('ps_monthly_detailed_stats', fullData);
      loadData();
      setTimeout(() => setShowManageModal(false), 500);
    } catch (err) {
      setActionError('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
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
          {editorMode && (
            <button 
              onClick={() => initiateManage(
                ['i1_acolhimento', 'i1_consultas', 'i4_pelotas', 'i4_outros_municipios', 'i3_emergencia', 'i3_urgencia', 'i3_pouco_urgente', 'i5_clinica_medica', 'i5_pediatria', 'i7_ac_moto', 'i7_ac_carro', 'i8_queda', 'i14_laboratoriais', 'i15_tomografias'], 
                'Relatório Técnico Assistencial'
              )} 
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 group"
            >
              <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Ajustar Valores</span>
            </button>
          )}
          <button 
            onClick={() => window.print()} 
            className="p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl transition-all border border-white/20 flex items-center gap-3 group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* JORNADA DO PACIENTE - INFOGRAPHIC FLOW */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block z-0"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* PASSO 1: ACOLHIMENTO */}
          <div className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm hover:border-blue-500 transition-all group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Users size={32} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Passo 01</p>
                <div className="h-1 w-8 bg-blue-600 mt-1 ml-auto rounded-full"></div>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-1">Acolhimento</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Triagem e Fluxo de Entrada</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums lg:text-4xl xl:text-5xl">{acolhimentosTotais.toLocaleString()}</span>
              <span className="text-[10px] font-black text-blue-500 uppercase">Pacientes</span>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-full animate-progress ring-2 ring-blue-100"></div>
              </div>
              <span className="text-[9px] font-black text-blue-600">100% Demand</span>
            </div>
          </div>

          {/* PASSO 2: FILTRO / EFETIVIDADE */}
          <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl relative overflow-hidden group border-b-[8px] border-emerald-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
              <Activity size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <TrendingUp size={32} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest leading-none">Performance</p>
                </div>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Efetividade</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Taxa de Conversão Médica</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter tabular-nums lg:text-4xl xl:text-5xl">{taxaConversao}</span>
                <span className="text-2xl font-black text-emerald-500">%</span>
              </div>
              <div className="mt-8">
                 <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-2">
                    <span>Performance Operacional</span>
                    <span>Meta: 85%</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${taxaConversao}%` }}></div>
                 </div>
              </div>
            </div>
          </div>

          {/* PASSO 3: CONSULTAS REALIZADAS */}
          <div className="bg-white p-8 rounded-[48px] border-2 border-slate-100 shadow-sm hover:border-purple-500 transition-all group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[24px] flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <Stethoscope size={32} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Passo Final</p>
                <div className="h-1 w-8 bg-purple-600 mt-1 ml-auto rounded-full"></div>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-1">Consultas</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Atendimentos Médicos Plenos</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums lg:text-4xl xl:text-5xl">{consultasMedicas.toLocaleString()}</span>
              <span className="text-[10px] font-black text-purple-500 uppercase">Finalizados</span>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${taxaConversao}%` }}></div>
              </div>
              <span className="text-[9px] font-black text-purple-600">{taxaConversao}% Resolutividade</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DE ESPECIALIDADES - BENTO INFOGRAPHIC */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg">
            <Layers size={18} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Filtro de Especialidades & Diagnósticos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Exames Lab.', key: 'i14_laboratoriais', color: 'blue', val: calculateTotal('i14_laboratoriais') },
            { label: 'Clinica Médica', key: 'i5_clinica_medica', color: 'purple', val: calculateTotal('i5_clinica_medica') },
            { label: 'Pediatria', key: 'i5_pediatria', color: 'pink', val: calculateTotal('i5_pediatria') },
            { label: 'Tomografias', key: 'i15_tomografias', color: 'orange', val: calculateTotal('i15_tomografias') }
          ].map(item => (
            <div key={item.key} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
               <div className="flex items-center justify-between mb-4">
                 <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-50 text-slate-400`}>{selectedYear}</div>
                 <div className={`w-2 h-2 rounded-full ${item.color === 'blue' ? 'bg-blue-500' : item.color === 'purple' ? 'bg-purple-500' : item.color === 'pink' ? 'bg-pink-500' : 'bg-orange-500'}`}></div>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
               <h4 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums mb-4">{item.val.toLocaleString()}</h4>
               <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                 <div className={`h-full opacity-30 ${item.color === 'blue' ? 'bg-blue-500' : item.color === 'purple' ? 'bg-purple-500' : item.color === 'pink' ? 'bg-pink-500' : 'bg-orange-500'}`} style={{ width: '65%' }}></div>
               </div>
            </div>
          ))}
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
                 Demanda por Classificação & Incidentes
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
                    { label: 'Emergência', key: 'i3_emergencia', icon: Zap, color: 'red' },
                    { label: 'Urgência', key: 'i3_urgencia', icon: Activity, color: 'orange' },
                    { label: 'Pouco Urgente', key: 'i3_pouco_urgente', icon: Clock, color: 'slate' },
                    { label: 'Quedas', key: 'i8_queda', icon: TrendingDown, color: 'slate' },
                    { label: 'Acid. Carro', key: 'i7_ac_carro', icon: Briefcase, color: 'red' },
                    { label: 'Acid. Moto', key: 'i7_ac_moto', icon: Briefcase, color: 'red' },
                    { label: 'Outros Munic.', key: 'i4_outros_municipios', icon: Users, color: 'slate' },
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

      {/* MODAL DE GESTÃO DE DADOS */}
      {showManageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in shadow-2xl">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={() => setShowManageModal(false)}></div>
          <div className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 animate-scale-in">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <Edit3 size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{targetLabel}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronização de Indicadores Mensais • {selectedYear}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManageModal(false)}
                className="p-4 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {PERIOD_OPTIONS.map(period => (
                  <div key={period.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        {period.id.slice(0, 3)}
                      </div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{period.label}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {targetKeys.map(key => (
                        <div key={key}>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-1.5 ml-1">
                            {key.replace('i1_', '').replace('i3_', '').replace('i4_', '').replace('i5_', '').replace('i7_', '').replace('i8_', '').replace('i14_', '').replace('i15_', '').replace('_', ' ')}
                          </label>
                          <div className="relative group">
                            <input 
                              type="text"
                              value={editValues[period.id]?.[key] || ''}
                              onChange={(e) => setEditValues({
                                ...editValues,
                                [period.id]: {
                                  ...(editValues[period.id] || {}),
                                  [key]: e.target.value
                                }
                              })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all tabular-nums"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col gap-1 flex-1 md:flex-initial">
                  <input 
                    type="password"
                    placeholder="Senha Administrativa"
                    className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-6 text-sm font-black outline-none focus:border-blue-500 w-full"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  {actionError && <p className="text-[10px] font-black text-red-500 uppercase ml-2">{actionError}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setShowManageModal(false)}
                  className="flex-1 md:flex-none px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveChanges}
                  disabled={isSaving}
                  className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Salvando...' : 'Confirmar e Sincronizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistanceReport;
