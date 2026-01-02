
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, CheckCircle, AlertCircle, 
  X, Trash2, Edit3, Loader2, Download, 
  Upload, GripVertical, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, FileSearch, Search, BookOpen, PieChart, Plus, PlusCircle,
  ChevronRight, ListFilter, Book
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

const sourceDescriptions: Record<PPASource, string> = {
  '1600': 'Recursos de custeio repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.',
  '1605': 'Recursos referentes ao complemento do piso da enfermagem.',
  '1604': 'Recursos referente ao repasse dos Agentes de Combates a Endemias e Agentes Comunitários de Saúde.',
  '1621': 'Recursos repassados para custeio pelo Fundo Estadual de Saúde ao Fundo Municipal de Saúde.',
  '1601': 'Recursos de investimentos repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde e fonte 1500 (fonte própria do município).',
  '1500': 'Recursos próprios do município (Fonte 1500).',
  '1659': 'Outras transferências e recursos vinculados específicos.'
};

const ActionCard: React.FC<{ 
  item: PPAAction; 
  onEdit: (p: PPAAction) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}> = ({ item, onEdit, onDelete, onDragStart, onDragOver, onDrop }) => {
  const years = ['2026', '2027', '2028', '2029'];

  const parseValue = (valStr: string = "0"): number => {
    let s = valStr.toString().toLowerCase().trim();
    let multiplier = 1;
    if (s.includes('k')) { multiplier = 1000; s = s.replace('k', ''); }
    else if (s.includes('m')) { multiplier = 1000000; s = s.replace('mi', '').replace('m', ''); }
    s = s.replace(',', '.');
    return (parseFloat(s.replace(/[^0-9.]/g, '')) || 0) * multiplier;
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
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-indigo-400 transition-all group overflow-hidden flex flex-col relative"
    >
      <div className="absolute top-6 left-6 text-slate-300 group-hover:text-indigo-500 transition-colors cursor-grab active:cursor-grabbing print:hidden">
        <GripVertical size={20} />
      </div>
      
      <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <button onClick={() => onEdit(item)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={16}/></button>
        <button onClick={() => onDelete(item.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
      </div>

      <div className="p-8 pt-16">
        <div className="flex flex-wrap gap-1.5 mb-5">
          {getAllUniqueSources().map(source => (
            <span key={source} title={sourceLabels[source]} className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm ${sourceStyles[source]}`}>
              {source}
            </span>
          ))}
        </div>

        <h4 className="font-black text-slate-900 text-lg leading-tight mb-3 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{item.action}</h4>
        
        <div className="flex gap-3 mb-6 items-start">
           <div className="w-1 h-12 bg-indigo-500 rounded-full shrink-0"></div>
           <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">"{item.objective}"</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Target size={14}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metas: {item.indicator}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {years.map(year => (
                <div key={year} className="text-center">
                  <p className="text-[9px] font-black text-slate-400 mb-1">{year}</p>
                  <div className="bg-white py-1.5 rounded-xl border border-slate-200 font-black text-xs text-indigo-600 shadow-sm">
                    {item.goals[year] || '-'}
                  </div>
                </div>
              ))}
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Coins size={16}/></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aporte Quadrienal</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {years.map(year => {
               const total = getYearTotal(year);
               const hasMultiple = Object.keys(item.yearlyFunding[year] || {}).length > 1;
               
               return (
                <div key={year} className={`p-4 rounded-[20px] border transition-all ${total > 0 ? 'bg-white border-emerald-100 shadow-md shadow-emerald-50' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400">{year}</span>
                    {hasMultiple && <PlusCircle size={10} className="text-emerald-500" title="Múltiplas fontes" />}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] font-bold text-emerald-500">R$</span>
                    <span className="text-base font-black text-slate-900 tracking-tighter">
                      {total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
               );
             })}
          </div>
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
      const parsed = JSON.parse(saved);
      const migrated = Object.keys(parsed).reduce((acc, axis) => {
        acc[axis] = parsed[axis].map((item: any) => {
          if (!item.yearlyFunding) {
            const yearlyFunding: any = { '2026': {}, '2027': {}, '2028': {}, '2029': {} };
            ['2026', '2027', '2028', '2029'].forEach(y => {
              if (item.source && item.funding?.[y]) {
                yearlyFunding[y][item.source] = item.funding[y];
              }
            });
            return { ...item, yearlyFunding };
          }
          return item;
        });
        return acc;
      }, {} as Record<string, PPAAction[]>);
      setIndicators(migrated);
    }
  }, []);

  const persist = (data: Record<string, PPAAction[]>) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
  };

  const parseValue = (valStr: string = "0"): number => {
    let s = valStr.toString().toLowerCase().trim();
    let multiplier = 1;
    if (s.includes('k')) { multiplier = 1000; s = s.replace('k', ''); }
    else if (s.includes('m')) { multiplier = 1000000; s = s.replace('mi', '').replace('m', ''); }
    s = s.replace(',', '.');
    return (parseFloat(s.replace(/[^0-9.]/g, '')) || 0) * multiplier;
  };

  const calculateYearlyTotal = (year: string): number => {
    let total: number = 0;
    (Object.values(indicators) as PPAAction[][]).forEach((actions) => {
      actions.forEach((action) => {
        const yearData = action.yearlyFunding?.[year] || {};
        Object.values(yearData).forEach(val => {
          if (val) total += parseValue(val as string);
        });
      });
    });
    return total;
  };

  const calculateSourceTotal = (source: PPASource): number => {
    let total: number = 0;
    (Object.values(indicators) as PPAAction[][]).forEach((actions) => {
      actions.forEach((action) => {
        ['2026', '2027', '2028', '2029'].forEach(year => {
          const val = action.yearlyFunding?.[year]?.[source];
          if (val) total += parseValue(val as string);
        });
      });
    });
    return total;
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24 min-h-screen">
      
      {/* HEADER DINÂMICO REFORMULADO */}
      <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-10 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full -mr-64 -mt-64 blur-3xl"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[32px] shadow-2xl shadow-indigo-200">
              <Layers size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">PPA Estratégico</h1>
              <p className="text-slate-500 text-base mt-3 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Planejamento Orçamentário Multimodal 2026-2029
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-2 rounded-[24px] border border-slate-200 shadow-inner">
            <button onClick={() => setActiveTab('board')} className={`px-8 py-4 rounded-[18px] text-sm font-black transition-all ${activeTab === 'board' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>PAINEL DE GESTÃO</button>
            <button onClick={() => setActiveTab('document')} className={`px-8 py-4 rounded-[18px] text-sm font-black transition-all ${activeTab === 'document' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>IMPORTAÇÃO IA</button>
            <button onClick={() => setIsAddingAxis(true)} className="ml-3 p-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-[18px] transition-all shadow-lg shadow-indigo-100"><FolderPlus size={22} /></button>
          </div>
        </div>

        {/* GRADE DE TOTAIS E CONSOLIDAÇÃO */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative">
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <TrendingUp size={16} className="text-indigo-500" /> Projeção Consolidada por Ano
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {['2026', '2027', '2028', '2029'].map(year => (
                <div key={year} className="bg-white rounded-3xl p-6 border border-slate-100 text-center shadow-lg shadow-slate-100/50 hover:border-indigo-200 transition-all group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">{year}</span>
                  <p className="text-lg font-black text-slate-900 mt-2">
                    <span className="text-xs text-indigo-500 mr-0.5">R$</span>
                    {calculateYearlyTotal(year).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <PieChart size={16} className="text-emerald-500" /> Totais por Fonte (Consolidado)
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
              {(['1500', '1621', '1600', '1604', '1605', '1659', '1601'] as PPASource[]).map(source => {
                const total = calculateSourceTotal(source);
                if (total === 0) return null;
                return (
                  <div key={source} className="flex-shrink-0 bg-slate-50 border border-slate-100 p-5 rounded-3xl shadow-sm min-w-[160px] hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase shadow-sm ${sourceStyles[source]}`}>
                        {source}
                      </span>
                    </div>
                    <p className="text-base font-black text-slate-900 leading-tight">
                      <span className="text-[10px] text-emerald-500 mr-1">R$</span>
                      {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GLOSSÁRIO TÉCNICO DE FONTES (SOLICITADO PELO USUÁRIO) */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Book size={24}/></div>
           <div>
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Glossário de Fontes de Recurso</h2>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Identificação Técnica Multimodal das Origens Orçamentárias</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {(['1600', '1605', '1604', '1621', '1601', '1500'] as PPASource[]).map(source => (
            <div key={source} className="flex gap-5 group items-start">
               <div className={`w-14 h-8 flex items-center justify-center rounded-xl text-[10px] font-black shadow-md shrink-0 transition-transform group-hover:scale-110 ${sourceStyles[source]}`}>
                 {source}
               </div>
               <div>
                 <p className="text-[13px] leading-relaxed font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                   {sourceDescriptions[source]}
                 </p>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-[56px] border border-slate-200 shadow-inner relative flex flex-col min-h-[500px] overflow-hidden">
        {activeTab === 'board' ? (
          <div className="p-12 space-y-24">
            {(Object.entries(indicators) as [string, PPAAction[]][]).map(([axis, list]) => (
              <div key={axis} className="space-y-10 animate-fade-in">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-5">
                  <div className="flex items-center gap-5 group">
                    <div className="w-5 h-5 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-300"></div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{axis}</h2>
                    <button onClick={() => { if(confirm("Excluir eixo estrategico?")) { const d = {...indicators}; delete d[axis]; persist(d); }}} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={20}/></button>
                  </div>
                  <button onClick={() => { setIsAddingMeta(axis); setFormData({yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}}); }} className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all">+ Nova Ação Estratégica</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                  {list.map((item) => (
                    <ActionCard 
                      key={item.id} 
                      item={item} 
                      onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                      onDelete={(id) => { if(confirm("Excluir esta ação permanentemente?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                      onDragStart={(e) => {}}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center">
             <div className="p-10 bg-indigo-50 rounded-full mb-8 text-indigo-600"><FileSearch size={80} strokeWidth={1} /></div>
             <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm max-w-lg">Mapeamento Automático via IA (Gemini 3 Flash)</p>
             <p className="text-slate-400 mt-4 text-xs font-medium italic">A função de upload está sendo otimizada para o novo formato multimodal.</p>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-6xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[95vh] border border-slate-100">
             <div className="bg-slate-900 p-10 flex items-center justify-between text-white">
               <div className="flex items-center gap-5">
                 <div className="p-3 bg-indigo-500 rounded-2xl shadow-2xl shadow-indigo-500/20"><Edit3 size={28}/></div>
                 <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{editingItem ? 'Configuração Técnica de Ação' : 'Nova Ação Estratégica'}</h3>
                   <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-2">{isAddingMeta || 'Gestão Quadrienal'}</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
             </div>

             <div className="p-12 overflow-y-auto space-y-12 bg-slate-50/30">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block tracking-widest flex items-center gap-2"><ChevronRight size={14} className="text-indigo-500"/> Definição da Ação</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-5 bg-white border border-slate-200 rounded-3xl font-black text-xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Ex: Ampliação de Equipes" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Objetivo Estratégico</label>
                      <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-6 bg-white border border-slate-200 rounded-[32px] font-medium text-base h-40 shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none" placeholder="Descreva os resultados esperados..." />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Indicador / Unidade</label>
                      <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-5 bg-white border border-slate-200 rounded-3xl font-bold text-lg shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Ex: % Cobertura Vacinal" />
                    </div>
                    <div className="p-8 bg-indigo-50 rounded-[32px] border border-indigo-100/50">
                       <h5 className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-[0.2em] flex items-center gap-2"><Info size={16}/> Resumo de Regras</h5>
                       <ul className="text-xs text-indigo-900/70 font-bold space-y-3 shadow-sm leading-relaxed">
                         <li className="flex gap-2"><span>•</span> Adicione múltiplas fontes por ano se necessário.</li>
                         <li className="flex gap-2"><span>•</span> Utilize sufixos 'k' para milhares (Ex: 50k = 50.000).</li>
                         <li className="flex gap-2"><span>•</span> Os valores são consolidados automaticamente no painel principal.</li>
                       </ul>
                    </div>
                  </div>
               </div>

               <div className="space-y-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                 <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                      <TrendingUp size={20} className="text-indigo-600"/> Grade Multimodal Financeira & Metas
                    </h5>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4">
                          <span className="px-5 py-2 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100">{year}</span>
                          <div className="text-right">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Meta Física</label>
                            <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} className="w-20 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-center focus:ring-2 focus:ring-indigo-500 outline-none" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><PlusCircle size={14} className="text-indigo-500"/> Recursos Financeiros</label>
                          
                          {Object.entries(formData.yearlyFunding?.[year] || {}).map(([source, amount]) => (
                            <div key={source} className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in group">
                               <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-sm ${sourceStyles[source as PPASource]}`}>{source}</span>
                               <input 
                                  type="text" 
                                  value={amount as string} 
                                  onChange={(e) => updateYearlySource(year, source as PPASource, e.target.value)}
                                  className="flex-1 text-sm font-black outline-none border-b-2 border-transparent focus:border-indigo-400 transition-colors bg-transparent"
                                  placeholder="R$ 0"
                               />
                               <button onClick={() => removeYearlySource(year, source as PPASource)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                            </div>
                          ))}

                          <div className="pt-2">
                            <select 
                              className="w-full p-3.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-[11px] font-black text-indigo-600 outline-none hover:bg-indigo-50 transition-all cursor-pointer"
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
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-10 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase mb-4 block flex items-center gap-2 tracking-[0.2em]"><Lock size={16} className="text-indigo-500"/> Autorização Administrativa</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-6 bg-white border border-slate-200 rounded-3xl font-black text-lg focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-center tracking-widest" placeholder="••••••••" />
                    {error && <p className="text-red-500 text-[10px] font-black mt-3 uppercase tracking-tighter text-center">{error}</p>}
                 </div>
                 <button onClick={handleSaveAction} className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                   <Save size={24} /> Sincronizar ao PPA
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EIXO ESTRATÉGICO */}
      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-lg relative z-10 p-12 animate-fade-in border border-slate-100">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-[24px]"><FolderPlus size={32}/></div>
                <h3 className="font-black text-slate-900 uppercase text-2xl tracking-tighter leading-none">Novo Eixo Estratégico</h3>
             </div>
             <div className="space-y-8">
               <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Nome do Eixo</label>
                  <input type="text" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-800 text-lg" placeholder="Ex: Eixo 3: Saúde Digital" />
               </div>
               <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Senha de Segurança</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-center" placeholder="••••" />
               </div>
               <button onClick={() => { if(adminPassword==='Conselho@2026'){ persist({...indicators, [axisName]: []}); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); }else{setError("Senha incorreta");} }} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-300">Criar Eixo Estratégico</button>
               {error && <p className="text-red-500 text-center text-[10px] font-black uppercase mt-4">{error}</p>}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PPA;
