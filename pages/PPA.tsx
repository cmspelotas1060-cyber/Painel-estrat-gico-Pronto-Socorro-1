
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, CheckCircle, AlertCircle, 
  X, Trash2, Edit3, Loader2, Download, 
  Upload, GripVertical, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, FileSearch, Search, BookOpen, PieChart
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type PPASource = 'Fonte Própria' | '1621' | '1600' | '1604' | '1605' | '1659' | '1601';

interface PPAAction {
  id: string;
  action: string;
  objective: string;
  indicator: string;
  source: PPASource;
  funding: { [key: string]: string }; // 2026, 2027, 2028, 2029
  goals: { [key: string]: string };    // 2026, 2027, 2028, 2029
  status: 'Planejado' | 'Em Execução' | 'Concluído' | 'Atrasado';
}

const sourceStyles: Record<PPASource, string> = {
  'Fonte Própria': 'bg-blue-600 text-white border-blue-700',
  '1621': 'bg-amber-500 text-white border-amber-600',
  '1600': 'bg-emerald-600 text-white border-emerald-700',
  '1604': 'bg-emerald-500 text-white border-emerald-600',
  '1605': 'bg-emerald-400 text-white border-emerald-500',
  '1659': 'bg-indigo-500 text-white border-indigo-600',
  '1601': 'bg-cyan-600 text-white border-cyan-700'
};

const ActionCard: React.FC<{ 
  item: PPAAction; 
  onEdit: (p: PPAAction) => void;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}> = ({ item, onEdit, onDelete, onDragStart, onDragOver, onDrop }) => {
  const years = ['2026', '2027', '2028', '2029'];

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-indigo-300 transition-all group overflow-hidden flex flex-col relative"
    >
      {/* Drag Handle & Actions */}
      <div className="absolute top-4 left-4 text-slate-300 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
        <GripVertical size={20} />
      </div>
      
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-indigo-600"><Edit3 size={14}/></button>
        <button onClick={() => onDelete(item.id)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
      </div>

      <div className="p-6 pt-12">
        {/* Badge de Fonte */}
        <div className="mb-4">
           <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.1em] shadow-sm ${sourceStyles[item.source] || 'bg-slate-500 text-white'}`}>
            {item.source}
          </span>
        </div>

        <h4 className="font-black text-slate-900 text-base leading-tight mb-2 uppercase tracking-tighter">{item.action}</h4>
        <div className="flex gap-2 mb-4">
           <div className="w-1 bg-indigo-500 rounded-full"></div>
           <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">"{item.objective}"</p>
        </div>

        {/* Indicador em Destaque */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Target size={14}/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indicador: {item.indicator}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {years.map(year => (
                <div key={year} className="text-center">
                  <p className="text-[8px] font-black text-slate-300 mb-1">{year}</p>
                  <div className="bg-white py-1 rounded-md border border-slate-200 font-black text-xs text-indigo-600 shadow-sm">
                    {item.goals[year] || '-'}
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Planejamento Financeiro */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Coins size={14}/></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aporte Financeiro Previsto</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
             {years.map(year => (
              <div key={year} className="group/year">
                <p className="text-[8px] font-bold text-slate-400 group-hover/year:text-emerald-500 transition-colors">{year}</p>
                <p className="text-[11px] font-black text-slate-800">R$ {item.funding[year] || '0'}</p>
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
  
  // UI State
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PPAAction | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStep, setTransformStep] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<PPAAction>>({
    source: 'Fonte Própria',
    funding: {},
    goals: {}
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    if (saved) setIndicators(JSON.parse(saved));
    else setIndicators({}); 
  }, []);

  const persist = (data: Record<string, PPAAction[]>) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
  };

  const parseValueWithSuffix = (valStr: string = "0"): number => {
    let s = valStr.toLowerCase().trim();
    let multiplier = 1;

    if (s.includes('k')) {
      multiplier = 1000;
      s = s.replace('k', '');
    } else if (s.includes('m')) {
      multiplier = 1000000;
      s = s.replace('mi', '').replace('m', '');
    } else if (s.includes('b')) {
      multiplier = 1000000000;
      s = s.replace('bi', '').replace('b', '');
    }

    s = s.replace(',', '.');
    return (parseFloat(s.replace(/[^0-9.]/g, '')) || 0) * multiplier;
  };

  const calculateYearlyTotal = (year: string) => {
    let total = 0;
    Object.values(indicators).forEach((actions: PPAAction[]) => {
      actions.forEach((action: PPAAction) => {
        total += parseValueWithSuffix(action.funding[year]);
      });
    });
    return total;
  };

  const calculateSourceTotal = (source: PPASource) => {
    let total = 0;
    Object.values(indicators).forEach((actions: PPAAction[]) => {
      actions.forEach((action: PPAAction) => {
        if (action.source === source) {
          ['2026', '2027', '2028', '2029'].forEach(year => {
            total += parseValueWithSuffix(action.funding[year]);
          });
        }
      });
    });
    return total;
  };

  const handleDragStart = (axis: string, index: number) => { /* logic here */ };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetAxis: string, targetIndex: number) => { /* logic here */ };

  const handleTransformDocument = async (file: File) => {
    setIsTransforming(true);
    setTransformStep("Lendo arquivo...");
    try {
      const content = await file.text();
      setTransformStep("IA gerando matriz de 4 anos...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o PPA e gere um JSON com eixos, ações, objetivos, indicadores, fontes e a grade 2026-2029 (financeiro e metas).
        As fontes permitidas são: 'Fonte Própria', '1621', '1600', '1604', '1605', '1659', '1601'.
        Texto: ${content.substring(0, 15000)}
        Formato: { "Eixo": [{ "action": "", "objective": "", "indicator": "", "source": "Fonte Própria", "funding": {"2026": ""...}, "goals": {"2026": ""...} }] }`,
        config: { responseMimeType: "application/json" }
      });

      const parsed: any = JSON.parse(response.text);
      Object.keys(parsed).forEach(axis => {
        if (Array.isArray(parsed[axis])) {
          parsed[axis] = parsed[axis].map((p: any, i: number) => ({ ...p, id: `ai-${Date.now()}-${i}`, status: 'Planejado' }));
        }
      });
      persist(parsed);
      setIsTransforming(false);
      setActiveTab('board');
    } catch (e) {
      alert("Erro na IA.");
      setIsTransforming(false);
    }
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
    setFormData({ source: 'Fonte Própria', funding: {}, goals: {} });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24 min-h-screen">
      
      {/* HEADER DINÂMICO REFORMULADO */}
      <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col gap-10 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-30"></div>
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-3xl shadow-xl shadow-indigo-200">
              <Layers size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">PPA Estratégico</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block">Planejamento Quadrienal 2026-2029</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('board')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'board' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}>PAINEL</button>
            <button onClick={() => setActiveTab('document')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'document' ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500'}`}>IA IMPORT</button>
            <button onClick={() => setIsAddingAxis(true)} className="ml-2 p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><FolderPlus size={18} /></button>
          </div>
        </div>

        {/* Totals Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative">
          
          {/* Totais por Ano */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-500" /> Totais por Exercício
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

          {/* Totais por Fonte */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PieChart size={14} className="text-emerald-500" /> Totais por Fonte de Recurso (2026-2029)
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {(['Fonte Própria', '1621', '1600', '1604', '1605', '1659', '1601'] as PPASource[]).map(source => {
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

      {/* LEGENDA DE FONTES */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={20}/></div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Legenda de Fontes de Recurso</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1600</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Custeio Nacional:</strong> Recursos de custeio repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-emerald-400 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1605</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Piso Enfermagem:</strong> Recursos referentes ao complemento do piso da enfermagem.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1604</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Agentes de Saúde:</strong> Recursos referente ao repasse dos Agentes de Combates a Endemias e Agentes Comunitários de Saúde.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1621</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Custeio Estadual:</strong> Recursos repassados para custeio pelo Fundo Estadual de Saúde ao Fundo Municipal de Saúde.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-cyan-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1601</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Investimento Nacional:</strong> Recursos de investimentos repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0">1659</span>
              <p className="text-xs text-slate-600 leading-relaxed"><strong className="text-slate-900 block">Outras Transferências:</strong> Recursos de transferências fundo a fundo não especificados anteriormente.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 rounded-[40px] border border-slate-200 shadow-inner relative flex flex-col">
        {isTransforming && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-10">
            <Loader2 className="animate-spin text-indigo-600 mb-6" size={80} strokeWidth={1} />
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{transformStep}</h3>
            <p className="text-slate-500 mt-2 font-medium">Isso pode levar alguns segundos enquanto processamos os dados...</p>
          </div>
        )}

        {activeTab === 'board' ? (
          <div className="p-10 space-y-16">
            {Object.keys(indicators).length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <Search size={100} strokeWidth={1} className="text-slate-300" />
                <h2 className="text-xl font-bold text-slate-800">Seu Painel PPA está vazio</h2>
                <p className="text-sm max-w-xs">Adicione um novo eixo ou utilize a Importação via IA para começar seu planejamento.</p>
              </div>
            )}

            {(Object.entries(indicators) as [string, PPAAction[]][]).map(([axis, list]) => (
              <div key={axis} className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
                  <div className="flex items-center gap-4 group">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{axis}</h2>
                    <button onClick={() => { if(confirm("Excluir eixo?")) { const d = {...indicators}; delete d[axis]; persist(d); }}} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                  </div>
                  <button onClick={() => { setIsAddingMeta(axis); setFormData({source: 'Fonte Própria', funding: {}, goals: {}}); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Nova Ação</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {list.map((item, idx) => (
                    <ActionCard 
                      key={item.id} 
                      item={item} 
                      onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                      onDelete={(id) => { if(confirm("Excluir esta ação?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                      onDragStart={() => handleDragStart(axis, idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(axis, idx)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
             <div className="w-full max-w-2xl p-20 border-4 border-dashed border-slate-200 rounded-[60px] bg-white cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group" onClick={() => fileInputRef.current?.click()}>
               <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={(e) => e.target.files?.[0] && handleTransformDocument(e.target.files[0])} />
               <div className="p-8 bg-indigo-50 text-indigo-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform"><Upload size={48} /></div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Importação Quadrienal via IA</h3>
               <p className="text-slate-500 mt-4 font-medium">Arraste o arquivo oficial do PPA para que o Gemini mapeie automaticamente as ações, objetivos e a grade financeira 2026-2029.</p>
             </div>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
             <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-500 rounded-xl"><Edit3 size={20}/></div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">{editingItem ? 'Editar Ação Estratégica' : 'Nova Ação / Objetivo'}</h3>
                   <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">{isAddingMeta || 'Gestão PPA'}</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
             </div>

             <div className="p-10 overflow-y-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Ação Principal</label>
                    <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nome da Ação" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Objetivo Detalhado / Descrição</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm h-28 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="O que se pretende atingir com esta ação?" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block text-indigo-600">Fonte de Recurso</label>
                    <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value as PPASource})} className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold text-indigo-700 outline-none">
                      <option value="Fonte Própria">Fonte Própria</option>
                      <option value="1621">1621 (Estadual)</option>
                      <option value="1600">1600 (Custeio Nacional)</option>
                      <option value="1604">1604 (Agentes de Saúde)</option>
                      <option value="1605">1605 (Piso Enfermagem)</option>
                      <option value="1659">1659 (Outras Transf.)</option>
                      <option value="1601">1601 (Investimento Nac.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Indicador de Medição</label>
                    <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Ex: % de Cobertura Vacinal" />
                  </div>
               </div>

               <div className="space-y-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                 <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TrendingUp size={16} className="text-indigo-600"/> Planejamento Plurianual 2026-2029
                    </h5>
                    <div className="px-3 py-1 bg-white rounded-full text-[9px] font-black text-slate-400 uppercase border border-slate-200 shadow-sm">Valores & Metas</div>
                 </div>
                 
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-center font-black text-indigo-600 text-sm">{year}</p>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Aporte (R$)</label>
                            <input type="text" value={formData.funding?.[year] || ""} onChange={(e) => setFormData({...formData, funding: {...formData.funding, [year]: e.target.value}})} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:border-indigo-500 outline-none" placeholder="Ex: 500k" />
                          </div>
                          <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase block mb-1">Meta Física</label>
                            <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} className="w-full p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 focus:border-indigo-500 outline-none" placeholder="Qtd" />
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-1"><Lock size={12}/> Senha de Autorização</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="Digite a senha do Conselho" />
                    {error && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-tight">{error}</p>}
                 </div>
                 <button onClick={handleSaveAction} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> Salvar Ação PPA
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
