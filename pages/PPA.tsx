
import React, { useState, useEffect } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, PlusCircle,
  ChevronRight, Book, ArrowRight
} from 'lucide-react';

type PPASource = '1500' | '1621' | '1600' | '1604' | '1605' | '1659' | '1601';

interface PPAAction {
  id: string;
  action: string;
  objective: string;
  indicator: string;
  yearlyFunding: {
    [year: string]: Partial<Record<PPASource, string>>
  };
  goals: { [key: string]: string };
  status: 'Planejado' | 'Em Execução' | 'Concluído' | 'Atrasado';
}

const sourceStyles: Record<PPASource, string> = {
  '1500': 'bg-slate-900 text-white border-black',
  '1621': 'bg-amber-500 text-white border-amber-600',
  '1600': 'bg-emerald-600 text-white border-emerald-700',
  '1604': 'bg-emerald-500 text-white border-emerald-600',
  '1605': 'bg-emerald-400 text-white border-emerald-500',
  '1659': 'bg-indigo-500 text-white border-indigo-600',
  '1601': 'bg-cyan-600 text-white border-cyan-700'
};

const sourceLabels: Record<PPASource, string> = {
  '1500': '1500 (Rec. Próprios)',
  '1621': '1621 (Estadual)',
  '1600': '1600 (Cust. Nac.)',
  '1604': '1604 (Ag. Saúde)',
  '1605': '1605 (Piso Enferm.)',
  '1659': '1659 (Outras Transf.)',
  '1601': '1601 (Invest. Nac.)'
};

const ActionCard: React.FC<{ 
  item: PPAAction; 
  onEdit: (p: PPAAction) => void;
  onDelete: (id: string) => void;
}> = ({ item, onEdit, onDelete }) => {
  const years = ['2026', '2027', '2028', '2029'];

  const parseValue = (valStr: string = "0"): number => {
    let s = valStr.toString().trim();
    s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s) || 0;
  };

  const getYearTotal = (year: string): number => {
    const funding = item.yearlyFunding[year] || {};
    return Object.values(funding).reduce<number>((acc, val) => acc + parseValue((val as string) || "0"), 0);
  };

  const getAllUniqueSources = () => {
    const sources = new Set<PPASource>();
    Object.values(item.yearlyFunding).forEach(yearData => {
      Object.keys(yearData).forEach(s => sources.add(s as PPASource));
    });
    return Array.from(sources);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden w-full mb-6">
      {/* CABEÇALHO DA AÇÃO */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {getAllUniqueSources().map(source => (
              <span key={source} className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sourceStyles[source]}`}>
                {source}
              </span>
            ))}
          </div>
          <h4 className="font-bold text-slate-900 text-lg leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
            {item.action}
          </h4>
          <p className="text-xs text-slate-500 font-medium italic line-clamp-2 md:line-clamp-none">
            "{item.objective}"
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unidade/Indicador</p>
            <p className="text-sm font-bold text-slate-800">{item.indicator}</p>
          </div>
        </div>

        <div className="flex gap-2 absolute top-4 right-4 md:static print:hidden">
          <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Edit3 size={18}/>
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={18}/>
          </button>
        </div>
      </div>

      {/* GRADE DE VALORES ANUAIS RESPONSIVA */}
      <div className="p-4 bg-slate-50/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {years.map(year => {
            const total = getYearTotal(year);
            const goal = item.goals[year] || '-';
            
            return (
              <div key={year} className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${total > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100/50 border-slate-100 opacity-60'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${total > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span> {year}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meta Física</p>
                    <div className="text-lg font-bold text-blue-600">{goal}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Coins size={12} className="text-emerald-600"/> Financeiro
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-emerald-600">R$</span>
                      <span className="text-lg font-bold text-slate-900 tracking-tight">
                        {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PPA: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'document'>('board');
  const [indicators, setIndicators] = useState<Record<string, PPAAction[]>>({});
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PPAAction | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [formData, setFormData] = useState<Partial<PPAAction>>({
    yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} },
    goals: {}
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    if (saved) {
      try { setIndicators(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const persist = (data: Record<string, PPAAction[]>) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
  };

  const parseValue = (valStr: string = "0"): number => {
    let s = valStr.toString().trim();
    s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s) || 0;
  };

  const handleSaveAction = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    const newData = { ...indicators };
    if (isAddingMeta) {
      newData[isAddingMeta] = [...(newData[isAddingMeta] || []), { ...formData, id: Date.now().toString(), status: 'Planejado' } as PPAAction];
    } else if (editingItem) {
      Object.keys(newData).forEach(axis => {
        newData[axis] = newData[axis].map(p => p.id === editingItem.id ? { ...p, ...formData } as PPAAction : p);
      });
    }
    persist(newData);
    setIsAddingMeta(null);
    setEditingItem(null);
    setAdminPassword("");
    setFormData({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {} });
  };

  const updateYearlySource = (year: string, source: PPASource, value: string) => {
    const updated = { ...formData.yearlyFunding };
    if (!updated[year]) updated[year] = {};
    updated[year][source] = value;
    setFormData({ ...formData, yearlyFunding: updated });
  };

  const removeYearlySource = (year: string, source: PPASource) => {
    const updated = { ...formData.yearlyFunding };
    if (updated[year]) {
      delete updated[year][source];
      setFormData({ ...formData, yearlyFunding: updated });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 min-h-screen p-4 md:p-0">
      
      {/* HEADER COMPACTO E RESPONSIVO */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shrink-0">
              <Layers size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">PPA Estratégico</h1>
              <p className="text-slate-500 text-xs font-medium flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Planejamento Orçamentário 2026-2029
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
            <button onClick={() => setActiveTab('board')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>PAINEL</button>
            <button onClick={() => setIsAddingAxis(true)} className="ml-2 p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md shrink-0"><FolderPlus size={18} /></button>
          </div>
        </div>
      </div>

      {/* ÁREA DOS EIXOS */}
      <div className="space-y-12">
        {(Object.entries(indicators) as [string, PPAAction[]][]).map(([axis, list]) => (
          <div key={axis} className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3 group shrink-0">
                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-md shrink-0"></div>
                <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">{axis}</h2>
                <button onClick={() => { if(confirm("Excluir eixo?")) { const d = {...indicators}; delete d[axis]; persist(d); }}} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-all shrink-0"><Trash2 size={16}/></button>
              </div>
              <button onClick={() => { setIsAddingMeta(axis); setFormData({yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}}); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all shrink-0">+ Nova Ação</button>
            </div>

            <div className="space-y-4">
              {list.map((item) => (
                <ActionCard 
                  key={item.id} 
                  item={item} 
                  onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                  onDelete={(id) => { if(confirm("Excluir permanentemente?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                />
              ))}
              {list.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-300 font-bold uppercase tracking-widest text-xs">
                  Sem ações neste eixo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL EQUILIBRADO */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-200">
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-500 rounded-xl shrink-0"><Edit3 size={20} /></div>
                 <div>
                   <h3 className="text-lg font-bold uppercase tracking-tight leading-none">{editingItem ? 'Editar Ação' : 'Nova Ação'}</h3>
                   <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">{isAddingMeta || 'PPA 2026-2029'}</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
             </div>

             <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/30 flex-1">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider flex items-center gap-2"><ArrowRight size={14} className="text-blue-500"/> Nome da Ação</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Ampliação de Infraestrutura" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Objetivo Estratégico</label>
                      <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-medium text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Finalidade da ação..." />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Unidade de Medida / Indicador</label>
                      <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: % de Execução" />
                    </div>
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100/50">
                       <h5 className="text-[10px] font-bold text-blue-500 uppercase mb-4 tracking-widest flex items-center gap-2"><Info size={14}/> Instruções</h5>
                       <ul className="text-xs text-blue-900/60 font-medium space-y-3 leading-relaxed">
                         <li>• Insira o valor total com centavos (Ex: 1500,50).</li>
                         <li>• Selecione a fonte de recurso para cada ano.</li>
                         <li>• Use o painel de gestão para visualizar o acumulado.</li>
                       </ul>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <h5 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-2">
                   <TrendingUp size={18} className="text-blue-600"/> Cronograma Financeiro e Metas
                 </h5>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs">{year}</span>
                          <div className="text-right">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Meta</label>
                            <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Coins size={14} className="text-emerald-500"/> Fontes de Recurso</label>
                          <div className="space-y-2">
                            {Object.entries(formData.yearlyFunding?.[year] || {}).map(([source, amount]) => (
                              <div key={source} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                 <span className={`text-[8px] font-bold px-2 py-1 rounded shadow-sm ${sourceStyles[source as PPASource]}`}>{source}</span>
                                 <input 
                                    type="text" 
                                    value={amount as string} 
                                    onChange={(e) => updateYearlySource(year, source as PPASource, e.target.value)}
                                    className="flex-1 text-xs font-bold outline-none bg-transparent"
                                    placeholder="0,00"
                                 />
                                 <button onClick={() => removeYearlySource(year, source as PPASource)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                              </div>
                            ))}
                          </div>

                          <select 
                            className="w-full p-2.5 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl text-[10px] font-bold text-blue-600 outline-none hover:bg-blue-50 transition-all"
                            onChange={(e) => {
                              if (e.target.value) {
                                updateYearlySource(year, e.target.value as PPASource, "");
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="">+ Vincular Fonte...</option>
                            {(['1500', '1621', '1600', '1604', '1605', '1659', '1601'] as PPASource[]).map(s => (
                              <option key={s} value={s} disabled={!!formData.yearlyFunding?.[year]?.[s]}>{sourceLabels[s]}</option>
                            ))}
                          </select>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2 tracking-widest"><Lock size={14} className="text-blue-500"/> Autorização de Gestão</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest" placeholder="••••••••" />
                    {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase text-center">{error}</p>}
                 </div>
                 <button onClick={handleSaveAction} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> Sincronizar ao PPA
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EIXO COMPACTO */}
      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8 animate-fade-in border border-slate-200">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FolderPlus size={24}/></div>
                <h3 className="font-bold text-slate-900 uppercase text-lg tracking-tight">Novo Eixo Estratégico</h3>
             </div>
             <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Identificação</label>
                  <input type="text" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Eixo 5: Infraestrutura" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Senha</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••" />
               </div>
               <button onClick={() => { if(adminPassword==='Conselho@2026'){ persist({...indicators, [axisName]: []}); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); }else{setError("Senha incorreta");} }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg">Criar Eixo</button>
               {error && <p className="text-red-500 text-center text-[10px] font-bold uppercase mt-4">{error}</p>}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PPA;
