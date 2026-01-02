
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, CheckCircle, AlertCircle, 
  X, Trash2, Edit3, Loader2, Download, 
  Upload, GripVertical, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, FileSearch, Search, BookOpen, PieChart, Plus, PlusCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type PPASource = '1500' | '1621' | '1600' | '1604' | '1605' | '1659' | '1601';

interface PPAAction {
  id: string;
  action: string;
  objective: string;
  indicator: string;
  // Estrutura: yearlyFunding[ano][fonte] = valor
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
  // Fix: Updated signatures to accept React.DragEvent to match native div event handler expectations and avoid "Expected 0 arguments, but got 1" errors.
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

  // Fix: Explicitly typed 'acc' as number and cast 'val' to string to resolve "Operator '+' cannot be applied to types 'unknown' and 'number'" and assignment errors.
  const getYearTotal = (year: string) => {
    const funding = item.yearlyFunding[year] || {};
    return Object.values(funding).reduce((acc: number, val) => acc + parseValue(val as string), 0);
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
      className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all group overflow-hidden flex flex-col relative"
    >
      <div className="absolute top-4 left-4 text-slate-300 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
        <GripVertical size={20} />
      </div>
      
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-indigo-600"><Edit3 size={14}/></button>
        <button onClick={() => onDelete(item.id)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
      </div>

      <div className="p-6 pt-12">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {getAllUniqueSources().map(source => (
            <span key={source} className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${sourceStyles[source]}`}>
              {source}
            </span>
          ))}
        </div>

        <h4 className="font-black text-slate-900 text-base leading-tight mb-2 uppercase tracking-tighter">{item.action}</h4>
        <div className="flex gap-2 mb-4">
           <div className="w-1 bg-indigo-500 rounded-full"></div>
           <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">"{item.objective}"</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Target size={14}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metas: {item.indicator}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {years.map(year => (
                <div key={year} className="text-center">
                  <p className="text-[8px] font-black text-slate-300 mb-1">{year}</p>
                  <div className="bg-white py-1 rounded-md border border-slate-200 font-black text-[10px] text-indigo-600 shadow-sm">
                    {item.goals[year] || '-'}
                  </div>
                </div>
              ))}
            </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Coins size={14}/></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aporte Consolidado (Mix de Fontes)</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
             {years.map(year => (
              <div key={year} className="group/year">
                <p className="text-[8px] font-bold text-slate-400 group-hover/year:text-emerald-500 transition-colors">{year}</p>
                <p className="text-[10px] font-black text-slate-800">R$ {getYearTotal(year).toLocaleString('pt-BR')}</p>
              </div>
            ))}
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
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStep, setTransformStep] = useState("");

  const [formData, setFormData] = useState<Partial<PPAAction>>({
    yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} },
    goals: {}
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migração simples para o novo formato se necessário
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
      }, {} as any);
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

  const calculateYearlyTotal = (year: string) => {
    let total = 0;
    Object.values(indicators).forEach((actions: PPAAction[]) => {
      actions.forEach((action: PPAAction) => {
        const yearData = action.yearlyFunding?.[year] || {};
        Object.values(yearData).forEach(val => total += parseValue(val));
      });
    });
    return total;
  };

  const calculateSourceTotal = (source: PPASource) => {
    let total = 0;
    Object.values(indicators).forEach((actions: PPAAction[]) => {
      actions.forEach((action: PPAAction) => {
        ['2026', '2027', '2028', '2029'].forEach(year => {
          const val = action.yearlyFunding?.[year]?.[source];
          if (val) total += parseValue(val);
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
    delete updated[year][source];
    setFormData({ ...formData, yearlyFunding: updated });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24 min-h-screen">
      
      {/* HEADER DINÂMICO REFORMULADO */}
      <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-10 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-30"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl shadow-xl shadow-indigo-200">
              <Layers size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PPA Estratégico</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block">Mix Multimodal de Fontes por Exercício</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('board')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'board' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}>PAINEL</button>
            <button onClick={() => setActiveTab('document')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'document' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}>IA IMPORT</button>
            <button onClick={() => setIsAddingAxis(true)} className="ml-2 p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><FolderPlus size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-500" /> Totais por Exercício (Consolidado)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['2026', '2027', '2028', '2029'].map(year => (
                <div key={year} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{year}</span>
                  <p className="text-sm font-black text-indigo-600 mt-1">
                    R$ {calculateYearlyTotal(year).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PieChart size={14} className="text-emerald-500" /> Somatório Quadrienal por Fonte (2026-2029)
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {(['1500', '1621', '1600', '1604', '1605', '1659', '1601'] as PPASource[]).map(source => {
                const total = calculateSourceTotal(source);
                if (total === 0) return null;
                return (
                  <div key={source} className="flex-shrink-0 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm min-w-[140px]">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase mb-2 inline-block ${sourceStyles[source]}`}>
                      {source}
                    </span>
                    <p className="text-sm font-black text-slate-800">
                      R$ {total.toLocaleString('pt-BR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-[40px] border border-slate-200 shadow-inner relative flex flex-col min-h-[400px]">
        {activeTab === 'board' ? (
          <div className="p-10 space-y-16">
            {(Object.entries(indicators) as [string, PPAAction[]][]).map(([axis, list]) => (
              <div key={axis} className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <div className="flex items-center gap-4 group">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{axis}</h2>
                    <button onClick={() => { if(confirm("Excluir eixo?")) { const d = {...indicators}; delete d[axis]; persist(d); }}} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                  </div>
                  <button onClick={() => { setIsAddingMeta(axis); setFormData({yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}}); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Nova Ação</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {list.map((item, idx) => (
                    <ActionCard 
                      key={item.id} 
                      item={item} 
                      onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                      onDelete={(id) => { if(confirm("Excluir esta ação?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                      // Fix: Added event handlers that pass the event object to prevent "Expected 0 arguments, but got 1" errors.
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
          <div className="p-20 flex items-center justify-center text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Utilize o upload PDF para mapeamento automático via IA (Gemini 3 Flash)</p>
          </div>
        )}
      </div>

      {/* FORM MODAL - ATUALIZADO PARA MULTI-FONTE */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
             <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500 rounded-xl"><Edit3 size={20}/></div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">{editingItem ? 'Configurar Planejamento Multimodal' : 'Nova Ação Estratégica'}</h3>
                   <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">{isAddingMeta || 'Detalhamento de Exercício'}</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
             </div>

             <div className="p-10 overflow-y-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Ação Principal do Eixo</label>
                    <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nome da Ação" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Objetivo Detalhado</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Descrição técnica..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Indicador / Unidade de Medida</label>
                    <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Ex: % Cobertura Vacinal" />
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TrendingUp size={16} className="text-indigo-600"/> Matriz Financeira Quadrienal (Composição de Fontes)
                    </h5>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="bg-slate-50 rounded-[32px] p-6 border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-black text-indigo-600 text-sm">{year}</p>
                          <div className="flex flex-col items-end">
                            <label className="text-[8px] font-black text-slate-400 uppercase">Meta Física</label>
                            <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} className="w-16 p-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-center" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1"><PlusCircle size={10} className="text-indigo-500"/> Composição de Recursos</label>
                          
                          {/* Fontes Já Adicionadas */}
                          {Object.entries(formData.yearlyFunding?.[year] || {}).map(([source, amount]) => (
                            <div key={source} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                               <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${sourceStyles[source as PPASource]}`}>{source}</span>
                               <input 
                                  type="text" 
                                  value={amount} 
                                  onChange={(e) => updateYearlySource(year, source as PPASource, e.target.value)}
                                  className="flex-1 text-[10px] font-black outline-none border-b border-dashed border-slate-200"
                                  placeholder="R$ 0"
                               />
                               <button onClick={() => removeYearlySource(year, source as PPASource)} className="text-red-400 hover:text-red-600 p-1"><X size={12}/></button>
                            </div>
                          ))}

                          {/* Seletor de Nova Fonte */}
                          <div className="pt-2">
                            <select 
                              className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 outline-none"
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateYearlySource(year, e.target.value as PPASource, "");
                                  e.target.value = "";
                                }
                              }}
                            >
                              <option value="">+ Adicionar Fonte...</option>
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

               <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1 tracking-widest"><Lock size={12}/> Autorização Técnica do Conselho</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="Senha do Conselho" />
                    {error && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-tight">{error}</p>}
                 </div>
                 <button onClick={handleSaveAction} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> Sincronizar Ação ao PPA
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EIXO ESTRATÉGICO */}
      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative z-10 p-10 animate-fade-in border border-slate-100">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><FolderPlus size={24}/></div>
                <h3 className="font-black text-slate-900 uppercase text-lg tracking-tighter">Novo Eixo Estratégico</h3>
             </div>
             <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Nome do Eixo</label>
                  <input type="text" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800" placeholder="Ex: Eixo 3: Inovação e Saúde" />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Senha</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl" placeholder="Senha" />
               </div>
               <button onClick={() => { if(adminPassword==='Conselho@2026'){ persist({...indicators, [axisName]: []}); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); }else{setError("Senha incorreta");} }} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200">Criar Eixo Estratégico</button>
               {error && <p className="text-red-500 text-center text-[10px] font-black uppercase">{error}</p>}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PPA;
