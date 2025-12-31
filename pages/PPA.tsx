
import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, TrendingUp, CheckCircle, AlertCircle, 
  Settings, Save, Lock, X, Plus, Trash2, Edit3,
  Search, Info, Share2, Loader2, Download, FileText, 
  ExternalLink, FileDigit, Upload, Sparkles, HelpCircle,
  FileCheck, FileSearch, Wand2, GripVertical, FolderPlus,
  ArrowRightCircle, Clock, Coins, Layers
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface PPAAction {
  id: string;
  action: string;
  objective: string;
  indicator: string;
  source: 'Municipal' | 'Estadual' | 'Federal';
  funding: { [key: string]: string }; // 2026, 2027, 2028, 2029
  goals: { [key: string]: string };    // 2026, 2027, 2028, 2029
  status: 'Planejado' | 'Em Execução' | 'Concluído' | 'Atrasado';
}

const DEFAULT_PPA: Record<string, PPAAction[]> = {
  "Eixo 1: Fortalecimento da Gestão": [
    { 
      id: '1', 
      action: 'Qualificação da Atenção Primária', 
      objective: 'Reduzir filas em 30%', 
      indicator: 'Nº de Equipes Ativas',
      source: 'Municipal',
      funding: { '2026': '1.2M', '2027': '1.3M', '2028': '1.4M', '2029': '1.5M' },
      goals: { '2026': '10', '2027': '12', '2028': '15', '2029': '20' },
      status: 'Em Execução'
    }
  ]
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
  const sourceColors = {
    'Municipal': 'bg-blue-100 text-blue-700 border-blue-200',
    'Estadual': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Federal': 'bg-amber-100 text-amber-700 border-amber-200'
  };

  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col relative"
    >
      <div className="absolute top-4 left-4 text-slate-300 group-hover:text-indigo-400 transition-colors cursor-grab active:cursor-grabbing">
        <GripVertical size={18} />
      </div>
      
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit3 size={14}/></button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
      </div>

      <div className="p-6 pt-10">
        <div className="flex justify-between items-start mb-2">
           <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${sourceColors[item.source]}`}>
            Fonte: {item.source}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {item.id.slice(-4)}</span>
        </div>

        <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{item.action}</h4>
        <p className="text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 italic">Obj: {item.objective}</p>

        <div className="bg-slate-50 rounded-xl p-3 mb-4">
          <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><Target size={10}/> Indicador: {item.indicator}</p>
          <div className="grid grid-cols-4 gap-1 text-center">
            {years.map(year => (
              <div key={year} className="bg-white rounded border border-slate-200 p-1">
                <p className="text-[8px] font-bold text-slate-400">{year}</p>
                <p className="text-[10px] font-black text-indigo-600">{item.goals[year] || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Coins size={10}/> Planejamento Financeiro</p>
          <div className="grid grid-cols-4 gap-1 text-center">
             {years.map(year => (
              <div key={year}>
                <p className="text-[8px] font-bold text-slate-400">{year}</p>
                <p className="text-[10px] font-bold text-slate-700">{item.funding[year] || '-'}</p>
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
  const [indicators, setIndicators] = useState<Record<string, PPAAction[]>>(DEFAULT_PPA);
  
  // UI State
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PPAAction | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformStep, setTransformStep] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<PPAAction>>({
    source: 'Municipal',
    funding: {},
    goals: {}
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);

  const [draggedItem, setDraggedItem] = useState<{ axis: string; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v1');
    if (saved) setIndicators(JSON.parse(saved));
  }, []);

  const persist = (data: Record<string, PPAAction[]>) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v1', JSON.stringify(data));
  };

  const handleDragStart = (axis: string, index: number) => setDraggedItem({ axis, index });
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetAxis: string, targetIndex: number) => {
    if (!draggedItem) return;
    const newData = { ...indicators };
    const [moved] = newData[draggedItem.axis].splice(draggedItem.index, 1);
    newData[targetAxis].splice(targetIndex, 0, moved);
    persist(newData);
    setDraggedItem(null);
  };

  const handleTransformDocument = async (file: File) => {
    setIsTransforming(true);
    setTransformStep("Extraindo texto...");
    try {
      const content = await file.text();
      setTransformStep("IA mapeando Ações e Grade 2026-2029...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o PPA e retorne um JSON organizado por Eixos.
        Texto: ${content.substring(0, 15000)}
        Formato: { 
          "Nome do Eixo": [{ 
            "action": "Nome da Ação", 
            "objective": "Objetivo", 
            "indicator": "Indicador",
            "source": "Municipal"|"Estadual"|"Federal",
            "funding": {"2026": "val", "2027": "val", "2028": "val", "2029": "val"},
            "goals": {"2026": "met", "2027": "met", "2028": "met", "2029": "met"}
          }] 
        }`,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text);
      Object.keys(parsed).forEach(axis => {
        parsed[axis] = parsed[axis].map((p: any, i: number) => ({ ...p, id: `ai-${Date.now()}-${i}`, status: 'Planejado' }));
      });
      persist(parsed);
      setTransformStep("Painel Estruturado!");
      setTimeout(() => { setIsTransforming(false); setActiveTab('board'); }, 1500);
    } catch (e) {
      alert("Erro na transformação IA.");
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
    setFormData({ source: 'Municipal', funding: {}, goals: {} });
  };

  const updateNestedField = (field: 'funding' | 'goals', year: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev[field] || {}), [year]: value }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24 h-[calc(100vh-120px)] flex flex-col">
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100"><Layers size={32} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">PPA 2026-2029</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Plano Plurianual de Ações e Objetivos Estratégicos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setActiveTab('board')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>QUADRO TÉCNICO</button>
            <button onClick={() => setActiveTab('document')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'document' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>IMPORTAR PDF</button>
          </div>
          <button onClick={() => setIsAddingAxis(true)} className="p-3 bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><FolderPlus size={20} /></button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative flex flex-col">
        {isTransforming && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-10">
            <Loader2 className="animate-spin text-indigo-600 mb-6" size={80} />
            <h3 className="text-2xl font-black text-slate-800">{transformStep}</h3>
          </div>
        )}

        {activeTab === 'board' ? (
          <div className="p-8 overflow-y-auto h-full space-y-12">
            {(Object.entries(indicators) as [string, PPAAction[]][]).map(([axis, list]) => (
              <div key={axis} className="space-y-4" onDragOver={handleDragOver} onDrop={() => handleDrop(axis, list.length)}>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-3 group">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{axis}</h2>
                    <button onClick={() => { if(confirm("Remover eixo?")) { const d = {...indicators}; delete d[axis]; persist(d); }}} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14}/></button>
                  </div>
                  <button onClick={() => { setIsAddingMeta(axis); setFormData({source: 'Municipal', funding: {}, goals: {}}); }} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase border border-indigo-200">+ Adicionar Ação</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {list.map((item, idx) => (
                    <ActionCard 
                      key={item.id} 
                      item={item} 
                      onEdit={(p) => { setEditingItem(p); setFormData(p); }}
                      onDelete={(id) => { if(confirm("Excluir?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                      onDragStart={() => handleDragStart(axis, idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(axis, idx)}
                    />
                  ))}
                  {list.length === 0 && <div className="col-span-full py-10 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 text-sm">Vazio. Adicione uma ação ou arraste para cá.</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full p-10 flex flex-col items-center justify-center text-center">
             <div className="w-full max-w-xl p-12 border-4 border-dashed border-slate-200 rounded-[40px] bg-white cursor-pointer hover:bg-indigo-50 transition-all" onClick={() => fileInputRef.current?.click()}>
               <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={(e) => e.target.files?.[0] && handleTransformDocument(e.target.files[0])} />
               <Upload className="mx-auto text-indigo-400 mb-4" size={48} />
               <h3 className="text-xl font-black text-slate-800 uppercase">Importação Plurianual IA</h3>
               <p className="text-slate-500 mt-2 text-sm">Arraste o arquivo do PPA para mapear a grade de 2026-2029 automaticamente.</p>
             </div>
          </div>
        )}
      </div>

      {/* FORM MODAL - REFORMULADO */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[95vh]">
             <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between font-black text-slate-800 uppercase tracking-widest text-xs">
               <span>{editingItem ? 'Editar Ação Estratégica' : 'Nova Ação / Objetivo'}</span>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}><X size={24} /></button>
             </div>
             <div className="p-8 overflow-y-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Ação</label>
                    <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Nome da Ação" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Objetivo / Ação</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm h-20" placeholder="Descrição detalhada do objetivo" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Fonte de Recurso</label>
                    <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value as any})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                      <option value="Municipal">Municipal</option>
                      <option value="Estadual">Estadual</option>
                      <option value="Federal">Federal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Indicador</label>
                    <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Ex: % de Cobertura" />
                  </div>
               </div>

               <div className="space-y-4">
                 <h5 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest border-b pb-1">Grade Plurianual 2026-2029</h5>
                 <div className="grid grid-cols-4 gap-3">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="space-y-2">
                        <p className="text-center font-black text-slate-400 text-[10px]">{year}</p>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-300 uppercase">Valor (R$)</label>
                          <input type="text" value={formData.funding?.[year] || ""} onChange={(e) => updateNestedField('funding', year, e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" placeholder="0,00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-300 uppercase">Meta (Física)</label>
                          <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => updateNestedField('goals', year, e.target.value)} className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700" placeholder="Qtd" />
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-4 border-t">
                 <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Senha do Conselho</label>
                 <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" />
                 {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}
               </div>
             </div>
             <div className="p-6 bg-slate-50 flex gap-3">
               <button onClick={handleSaveAction} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100">Salvar Ação PPA</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EIXO */}
      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative z-10 p-8 animate-fade-in">
             <h3 className="font-black text-slate-800 uppercase text-xs mb-4">Novo Eixo Estratégico</h3>
             <div className="space-y-4">
               <input type="text" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Nome do Eixo" />
               <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" placeholder="Senha" />
               <button onClick={() => { if(adminPassword==='Conselho@2026'){ persist({...indicators, [axisName]: []}); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); }else{setError("Senha errada");} }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">Criar Eixo</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PPA;
