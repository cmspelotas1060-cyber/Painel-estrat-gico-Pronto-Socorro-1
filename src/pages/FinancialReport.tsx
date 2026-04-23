
import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { 
  DollarSign, TrendingDown, CreditCard, Download, 
  AlertCircle, ChevronDown, Calendar, Users, 
  Truck, Zap, Briefcase, Layers, Edit3, Save, X, Loader2, 
  Trophy, ArrowUpRight, BarChart3, Wallet, ShieldCheck, Landmark, Trash2
} from 'lucide-react';
import { PasswordModal } from '../components/PasswordModal';
import { usePasswordPrompt } from '../hooks/usePasswordPrompt';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const PERIOD_OPTIONS = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' }
];

const FinancialReport: React.FC = () => {
  const { passwordModal, requestPassword, closePasswordModal } = usePasswordPrompt();
  const [rawData, setRawData] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState('2025');
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [showManageModal, setShowManageModal] = useState(false);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [targetMonths, setTargetMonths] = useState<string[]>([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({}); 
  const [isSaving, setIsSaving] = useState(false);
  const [expandedQuad, setExpandedQuad] = useState<string | null>(null);

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

  const loadData = () => {
    const parsed = storage.getSync('ps_monthly_detailed_stats');
    if (!parsed) return;
    
    if (parsed.jan || parsed.feb) {
      setRawData(selectedYear === '2025' ? parsed : {});
    } else {
      setRawData(parsed[selectedYear] || {});
    }
  };

  const getAggregatedTotal = (key: string) => {
    let total = 0;
    PERIOD_OPTIONS.forEach(period => {
      total += parseFloat(rawData[period.id]?.[key] || 0);
    });
    return total;
  };

  const getQuadrimestralTotal = (q: string) => {
    const months = q === 'q1' ? ['jan', 'feb', 'mar', 'apr'] : 
                   q === 'q2' ? ['may', 'jun', 'jul', 'aug'] : 
                   ['sep', 'oct', 'nov', 'dec'];
    
    const keys = ['fin_pessoal', 'fin_fornecedores', 'fin_essenciais', 'fin_servicos', 'fin_rateio'];
    let total = 0;
    months.forEach(m => {
      keys.forEach(key => {
        total += parseFloat(rawData[m]?.[key] || 0);
      });
    });
    return total;
  };

  const getMonthlyTotal = (periodId: string) => {
    const keys = ['fin_pessoal', 'fin_fornecedores', 'fin_essenciais', 'fin_servicos', 'fin_rateio'];
    let total = 0;
    keys.forEach(key => {
      total += parseFloat(rawData[periodId]?.[key] || 0);
    });
    return total;
  };

  const initiateManage = (keys: string[], label: string, e: React.MouseEvent, monthsFilter?: string[]) => {
    e.stopPropagation();
    setTargetKeys(keys);
    setTargetLabel(label);
    setTargetMonths(monthsFilter || []);
    setAdminPassword('');
    setActionError('');
    
    const initialEditState: Record<string, Record<string, string>> = {};
    PERIOD_OPTIONS.forEach(period => {
      initialEditState[period.id] = {};
      keys.forEach(key => {
        const val = rawData[period.id]?.[key] ?? 0;
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
      const saved = localStorage.getItem('ps_monthly_detailed_stats');
      let parsed = saved ? JSON.parse(saved) : {};
      
      if (parsed.jan || parsed.feb) parsed = { "2025": parsed };
      if (!parsed[selectedYear]) parsed[selectedYear] = {};

      PERIOD_OPTIONS.forEach(period => {
        if (!parsed[selectedYear][period.id]) parsed[selectedYear][period.id] = {};
        targetKeys.forEach(key => {
          parsed[selectedYear][period.id][key] = parseFloat(editValues[period.id][key] || "0");
        });
      });
      storage.setItem('ps_monthly_detailed_stats', parsed);
      loadData();
      setTimeout(() => setShowManageModal(false), 500);
    } catch (err) {
      setActionError('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const rankingData = [
    { id: 'pessoal', label: 'Pessoal', value: getAggregatedTotal('fin_pessoal'), icon: Users, color: 'blue' },
    { id: 'fornecedores', label: 'Fornecedores', value: getAggregatedTotal('fin_fornecedores'), icon: Truck, color: 'orange' },
    { id: 'essenciais', label: 'Essenciais', value: getAggregatedTotal('fin_essenciais'), icon: Zap, color: 'emerald' },
    { id: 'servicos', label: 'Prestação de Serviço', value: getAggregatedTotal('fin_servicos'), icon: Briefcase, color: 'purple' },
    { id: 'rateio', label: 'Rateio HUSFP', value: getAggregatedTotal('fin_rateio'), icon: Layers, color: 'slate' },
  ].sort((a, b) => b.value - a.value);

  const calculatedTotalGeral = rankingData.reduce((acc, curr) => acc + curr.value, 0);

  const FinancialDataRow = ({ id, label, value, keys, accentColor = "blue", icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorVariants: any = {
      blue: 'from-blue-600 to-blue-700 text-blue-700 border-blue-100 bg-blue-50',
      orange: 'from-orange-500 to-orange-600 text-orange-700 border-orange-100 bg-orange-50',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-700 border-emerald-100 bg-emerald-50',
      purple: 'from-purple-600 to-purple-700 text-purple-700 border-purple-100 bg-purple-50',
      slate: 'from-slate-600 to-slate-700 text-slate-700 border-slate-100 bg-slate-50',
      red: 'from-red-600 to-red-700 text-red-700 border-red-100 bg-red-50'
    };

    const getMonthlyValue = (periodId: string) => {
      let total = 0;
      keys.forEach((key: string) => {
        total += parseFloat(rawData[periodId]?.[key] || 0);
      });
      return total;
    };

    return (
      <div className="group transition-all duration-300 mb-6">
        <div 
          className={`relative overflow-hidden bg-white rounded-[32px] border-2 transition-all cursor-pointer ${isOpen ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-slate-100 hover:border-blue-200 hover:shadow-lg shadow-sm'}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight">
                   <EditableText id={`fin_row_label_${id}`} defaultText={label} />
                </h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consolidado {selectedYear}</span>
                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Clique para expandir</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Acumulado</p>
                  <div className={`flex items-baseline gap-1 justify-end font-black tabular-nums ${colorVariants[accentColor].split(' ')[2]}`}>
                    <span className="text-xs uppercase opacity-60">R$</span>
                    <span className="text-2xl">{value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                {editorMode && (
                  <button 
                    onClick={(e) => initiateManage(keys, label, e)} 
                    className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-inner"
                  >
                    <Edit3 size={20} />
                  </button>
                )}
                <div className={`p-2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                  <ChevronDown size={24} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
            <div className={`h-full bg-gradient-to-r ${colorVariants[accentColor].split(' ')[0]} opacity-30`} style={{width: '100%'}}></div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 mx-4 p-8 bg-slate-900 rounded-[40px] shadow-2xl animate-scale-in border-4 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Calendar size={120} className="text-white" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative z-10">
              {PERIOD_OPTIONS.map(period => (
                <div key={period.id} className="bg-white/5 backdrop-blur-md p-2 sm:p-4 rounded-xl sm:rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/month">
                  <span className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-1 sm:mb-2">{period.label}</span>
                  <div className="flex items-baseline gap-0.5 font-black text-white tabular-nums leading-tight">
                    <span className="text-[7px] sm:text-[9px] opacity-50 uppercase">R$</span>
                    <span className="text-[8px] sm:text-xs lg:text-sm">{getMonthlyValue(period.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER PREMIUM COM SELETOR DE ANO AMPLIADO */}
      <div className="bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl border-b-[8px] md:border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 md:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 relative z-10 w-full lg:w-auto">
          <div className="p-4 md:p-6 bg-white text-slate-900 rounded-[24px] md:rounded-[32px] shadow-xl shrink-0 transform -rotate-3">
             <DollarSign size={32} className="md:w-10 md:h-10" strokeWidth={3} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="fin_main_title_new" defaultText="Performance Financeira" />
            </h1>
            <p className="text-blue-300/60 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-center sm:text-left">
              <EditableText id="fin_data_sources" defaultText="Fontes de Dados: SMSPel • PSPel • UPA-Areal" />
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
              <p className="text-blue-400 flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                 <ArrowUpRight size={16} />
                 Sincronização Orçamentária {selectedYear}
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
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 relative z-10 w-full lg:w-auto">
           {/* Botão oculto por solicitação de segurança */}
        </div>
      </div>

      {/* QUADRO EXPLICATIVO COMUNIDADE */}
      <div className="animate-slide-down -mt-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row relative overflow-hidden group hover:border-blue-400 transition-all gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all text-blue-600 pointer-events-none">
            <DollarSign size={160} />
          </div>
          
          <div className="flex-1 space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Transparência Financeira</span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Por que a comunidade deve verificar este relatório?</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">💰</span>
                <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight pt-1">Fiscalização dos Recursos Públicos</p>
              </div>
              
              <ul className="space-y-3 ml-8">
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Permite acompanhar como o dinheiro da saúde está sendo investido no Pronto Socorro.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Ajuda a identificar os maiores centros de custo e a eficiência dos gastos com pessoal e fornecedores.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Garante que a gestão financeira seja transparente e esteja alinhada com as necessidades da população.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">É um direito do cidadão fiscalizar se os recursos estão sendo usados de forma ética e responsável.</li>
              </ul>
            </div>
          </div>

          <div className="md:w-72 flex flex-col justify-center relative z-10">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Landmark size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-2">Objetivo</p>
                <p className="text-xs font-black text-blue-700 leading-tight uppercase">Transparência absoluta na aplicação dos recursos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="w-full bg-slate-900 rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-center border-b-[8px] md:border-b-[12px] border-blue-600 min-h-[220px] lg:min-h-[260px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
           <div className="absolute top-0 right-0 p-8 md:p-10 opacity-10">
              <Wallet size={160} className="text-white" />
           </div>
           <div className="relative z-10 max-w-4xl">
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] border border-white/10 mb-6 inline-block shadow-lg">Total Investido {selectedYear}</span>
              <div className="flex flex-col sm:flex-row sm:items-baseline mt-4 gap-2 sm:gap-4">
                 <span className="text-xl md:text-3xl font-black text-blue-500 uppercase">R$</span>
                 <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl leading-none">
                    {calculatedTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </h2>
              </div>
              <p className="text-blue-300/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-6 md:mt-8 max-w-sm">Soma consolidada de todas as despesas operacionais do exercício</p>
              
              {editorMode && (
                <button 
                  onClick={() => {
                    if (confirm('Deseja realmente ZERAR todos os valores deste ano? Esta ação não pode ser desfeita.')) {
                      const password = prompt('Digite a senha para confirmar:');
                      if (password === 'Conselho@2026') {
                        const saved = localStorage.getItem('ps_monthly_detailed_stats');
                        let parsed = saved ? JSON.parse(saved) : {};
                        if (parsed.jan || parsed.feb) parsed = { "2025": parsed };
                        parsed[selectedYear] = {};
                        storage.setItem('ps_monthly_detailed_stats', parsed);
                        loadData();
                      } else {
                        alert('Senha incorreta.');
                      }
                    }
                  }}
                  className="mt-8 px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} /> Zerar Dados do Ano
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6 border-l-[16px] border-blue-600 pl-6 py-2 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Despesas Totais por Quadrimestre {selectedYear}</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Valores consolidados por período quadrimestral</p>
          </div>
          <BarChart3 size={32} className="text-blue-500 opacity-20" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'q1', label: '1º Quadrimestre', sub: 'Janeiro a Abril', color: 'blue' },
            { id: 'q2', label: '2º Quadrimestre', sub: 'Maio a Agosto', color: 'purple' },
            { id: 'q3', label: '3º Quadrimestre', sub: 'Setembro a Dezembro', color: 'amber' }
          ].map(q => {
            const themes: Record<string, string> = {
              blue: 'border-blue-100 bg-blue-50/30 text-blue-600 hover:border-blue-500',
              purple: 'border-purple-100 bg-purple-50/30 text-purple-600 hover:border-purple-500',
              amber: 'border-amber-100 bg-amber-50/30 text-amber-600 hover:border-amber-500'
            };
            const iconThemes: Record<string, string> = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              amber: 'bg-amber-100 text-amber-600'
            };

            return (
              <div key={q.id} className="space-y-4">
                <div 
                  onClick={(e) => {
                    if (editorMode) {
                      const months = q.id === 'q1' ? ['jan', 'feb', 'mar', 'apr'] : 
                                     q.id === 'q2' ? ['may', 'jun', 'jul', 'aug'] : 
                                     ['sep', 'oct', 'nov', 'dec'];
                      initiateManage(['fin_pessoal', 'fin_fornecedores', 'fin_essenciais', 'fin_servicos', 'fin_rateio'], q.label, e as any, months);
                    } else {
                      setExpandedQuad(expandedQuad === q.id ? null : q.id);
                    }
                  }}
                  className={`p-8 rounded-[40px] border-2 shadow-sm flex flex-col items-center text-center group transition-all duration-300 cursor-pointer ${expandedQuad === q.id ? 'bg-white border-blue-600 scale-[1.02] shadow-xl' : `bg-white ${themes[q.color]}`}`}
                >
                  <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 group-hover:scale-110 ${expandedQuad === q.id ? 'bg-blue-600 text-white' : iconThemes[q.color]}`}>
                    {editorMode ? <Edit3 size={28} /> : <Landmark size={28} />}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{q.label}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{q.sub}</p>
                  <div className="flex items-baseline gap-1 font-black text-slate-900 tabular-nums">
                    <span className="text-xs uppercase opacity-40">R$</span>
                    <span className="text-2xl">{getQuadrimestralTotal(q.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${expandedQuad === q.id ? 'text-blue-500' : themes[q.color].split(' ')[2]}`}>
                      {editorMode ? 'Clique para editar' : (expandedQuad === q.id ? 'Fechar Detalhamento' : 'Clique para ver')}
                    </span>
                    {!editorMode && <ChevronDown size={16} className={`transition-transform duration-300 ${expandedQuad === q.id ? 'rotate-180 text-blue-600' : themes[q.color].split(' ')[2]}`} />}
                  </div>
                </div>

                {expandedQuad === q.id && !editorMode && (
                  <div className={`p-6 rounded-[32px] border-4 shadow-2xl animate-scale-in ${
                    q.id === 'q1' ? 'bg-blue-900 border-blue-800' :
                    q.id === 'q2' ? 'bg-purple-900 border-purple-800' :
                    'bg-amber-900 border-amber-800'
                  }`}>
                    <div className="grid grid-cols-2 gap-3">
                      {PERIOD_OPTIONS.filter(period => {
                        const qMonths: Record<string, string[]> = {
                          q1: ['jan', 'feb', 'mar', 'apr'],
                          q2: ['may', 'jun', 'jul', 'aug'],
                          q3: ['sep', 'oct', 'nov', 'dec']
                        };
                        return qMonths[q.id].includes(period.id);
                      }).map(period => (
                        <div 
                          key={period.id} 
                          onClick={(e) => {
                            if (editorMode) {
                              e.stopPropagation();
                              initiateManage(['fin_pessoal', 'fin_fornecedores', 'fin_essenciais', 'fin_servicos', 'fin_rateio'], q.label, e as any);
                            }
                          }}
                          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-default"
                        >
                          <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">{period.label}</p>
                          <div className="flex items-baseline gap-0.5 text-white font-black tabular-nums">
                            <span className="text-[8px] opacity-40 uppercase">R$</span>
                            <span className="text-xs">{getMonthlyTotal(period.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DynamicNotes sectionId={`financeiro_${selectedYear}`} requestPassword={requestPassword} />

      {/* MODAL DE EDIÇÃO */}
      {showManageModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => !isSaving && setShowManageModal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-slate-100">
            <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-2xl transform -rotate-6"><Edit3 size={36}/></div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Ajuste Financeiro</h3>
                   <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-3">{targetLabel} — Exercício {selectedYear}</p>
                 </div>
               </div>
               <button onClick={() => !isSaving && setShowManageModal(false)} className="p-4 hover:bg-white/10 rounded-full transition-all border-2 border-white/5"><X size={44} /></button>
            </div>
            
            <div className="p-12 overflow-y-auto bg-slate-50/50 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {PERIOD_OPTIONS
                   .filter(period => targetMonths.length === 0 || targetMonths.includes(period.id))
                   .map(period => (
                   <div key={period.id} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-4 hover:border-blue-500 transition-colors group/input">
                     <label className="block text-[11px] font-black text-slate-400 group-hover/input:text-blue-600 uppercase tracking-[0.2em] text-center border-b border-slate-50 pb-3 mb-2">{period.label}</label>
                     {targetKeys.map(key => (
                       <div key={key}>
                         <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">VALOR BRUTO (R$)</span>
                         <input 
                           type="number" 
                           step="0.01"
                           value={editValues[period.id]?.[key] || "0"} 
                           onChange={(e) => setEditValues({
                             ...editValues, 
                             [period.id]: { ...editValues[period.id], [key]: e.target.value }
                           })}
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 sm:p-4 font-black text-slate-900 text-sm sm:text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all tabular-nums"
                         />
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
               
               <div className="mt-16 pt-10 border-t-4 border-dashed border-slate-200 max-w-lg mx-auto text-center">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><AlertCircle size={32}/></div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.3em]">Autenticação de Segurança</label>
                 <input 
                   type="password" 
                   value={adminPassword} 
                   onChange={(e) => setAdminPassword(e.target.value)}
                   className="w-full p-6 bg-white border-4 border-slate-100 rounded-[32px] outline-none focus:border-blue-500 text-center font-black text-3xl tracking-[0.5em] shadow-inner"
                   placeholder="****"
                 />
                 {actionError && <p className="text-red-500 text-xs font-black mt-6 uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse"><AlertCircle size={18}/> {actionError}</p>}
               </div>
            </div>

            <div className="p-12 bg-white border-t-2 border-slate-50 flex gap-6 shrink-0">
              <button 
                onClick={() => !isSaving && setShowManageModal(false)} 
                disabled={isSaving}
                className="flex-1 py-7 rounded-[32px] font-black text-slate-500 bg-slate-50 border-2 border-slate-100 uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                Cancelar Operação
              </button>
              <button 
                onClick={saveChanges} 
                disabled={isSaving}
                className="flex-[2] py-7 rounded-[32px] font-black bg-blue-600 text-white shadow-2xl shadow-blue-300 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all transform active:scale-95"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
                {isSaving ? 'PROCESSANDO...' : 'SINCRONIZAR VALORES'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PasswordModal 
        isOpen={passwordModal.isOpen}
        onConfirm={passwordModal.onConfirm}
        onClose={closePasswordModal}
        title={passwordModal.title}
        message={passwordModal.message}
      />

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
};

export default FinancialReport;
