
import React, { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { 
  DollarSign, TrendingDown, CreditCard, Download, 
  AlertCircle, ChevronDown, Calendar, Users, 
  Truck, Zap, Briefcase, Layers, Edit3, Save, X, Loader2, 
  Trophy, ArrowUpRight, BarChart3, Wallet
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const PERIOD_OPTIONS = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' }
];

const FinancialReport: React.FC = () => {
  const [rawData, setRawData] = useState<any>({});
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
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
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

  const initiateManage = (keys: string[], label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetKeys(keys);
    setTargetLabel(label);
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
      localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
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
                <div className={`text-2xl font-black tabular-nums ${colorVariants[accentColor].split(' ')[2]}`}>
                  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <div key={period.id} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/month">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-2">{period.label}</span>
                  <div className="text-sm font-black text-white tabular-nums">
                    R$ {getMonthlyValue(period.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 bg-white text-slate-900 rounded-[32px] shadow-xl shrink-0 transform -rotate-3">
             <DollarSign size={40} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="fin_main_title_new" defaultText="Performance Financeira" />
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-blue-400 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em]">
                 <ArrowUpRight size={18} />
                 Sincronização Orçamentária {selectedYear}
              </p>
              <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                 {['2025', '2026', '2027', '2028', '2029'].map(yr => (
                   <button 
                     key={yr} 
                     onClick={() => setSelectedYear(yr)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {yr}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <button onClick={() => window.print()} className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3">
             <Download size={20} /> Exportar PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-8 rounded-[48px] shadow-sm border-2 border-slate-100 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-sm"><Trophy size={24}/></div>
             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Ranking de Impacto</h3>
          </div>
          <div className="space-y-6 flex-1">
            {rankingData.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="text-2xl font-black text-slate-200 group-hover:text-blue-200 transition-colors tabular-nums">0{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">R$ {item.value.toLocaleString('pt-BR', {compactDisplay: 'short', maximumFractionDigits: 1})}</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.color === 'blue' ? 'bg-blue-600' :
                        item.color === 'orange' ? 'bg-orange-500' :
                        item.color === 'emerald' ? 'bg-emerald-500' :
                        item.color === 'purple' ? 'bg-purple-600' : 'bg-slate-500'
                      }`}
                      style={{ width: `${(item.value / (rankingData[0]?.value || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t-2 border-slate-50">
             <div className="bg-blue-50 p-6 rounded-[32px] flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Maior Centro de Custo</p>
                   <p className="text-lg font-black text-blue-700 uppercase tracking-tighter leading-none">{rankingData[0]?.label || "N/A"}</p>
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200"><TrendingDown size={20}/></div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-slate-900 rounded-[48px] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-center border-b-[12px] border-blue-600">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <Wallet size={200} className="text-white" />
           </div>
           <div className="relative z-10">
              <span className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] border border-white/10 mb-8 inline-block shadow-lg">Investimento Total Operacional {selectedYear}</span>
              <div className="flex items-baseline gap-4 mt-4">
                 <span className="text-3xl font-black text-blue-500">R$</span>
                 <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                    {calculatedTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </h2>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6 border-l-[16px] border-blue-600 pl-6 py-2 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Detalhamento Técnico {selectedYear}</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Auditoria mensal do exercício selecionado</p>
          </div>
          <BarChart3 size={32} className="text-blue-500 opacity-20" />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <FinancialDataRow id="pessoal" label="Despesas com pessoal" value={getAggregatedTotal('fin_pessoal')} keys={['fin_pessoal']} accentColor="blue" icon={Users} />
          <FinancialDataRow id="fornecedores" label="Fornecedores" value={getAggregatedTotal('fin_fornecedores')} keys={['fin_fornecedores']} accentColor="orange" icon={Truck} />
          <FinancialDataRow id="essenciais" label="Despesas Essenciais" value={getAggregatedTotal('fin_essenciais')} keys={['fin_essenciais']} accentColor="emerald" icon={Zap} />
          <FinancialDataRow id="servicos" label="Prestação de Serviço" value={getAggregatedTotal('fin_servicos')} keys={['fin_servicos']} accentColor="purple" icon={Briefcase} />
          <FinancialDataRow id="rateio" label="Slip Rateio - HUSFP (despesas diversas)" value={getAggregatedTotal('fin_rateio')} keys={['fin_rateio']} accentColor="slate" icon={Layers} />
        </div>
      </div>

      <DynamicNotes sectionId={`financeiro_${selectedYear}`} />

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
                 {PERIOD_OPTIONS.map(period => (
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
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-slate-900 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all tabular-nums"
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
