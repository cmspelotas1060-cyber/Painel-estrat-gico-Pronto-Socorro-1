
import React, { useState, useEffect } from 'react';
import { 
  History, CheckCircle2, AlertCircle, ShieldCheck, Cpu, Users, 
  HeartPulse, Microscope, Download, Edit3, X, Save, Lock, Plus, Trash2, 
  Share2, Loader2, CheckCircle, GripVertical, Settings2, FolderPlus,
  ArrowDownCircle, Calendar, Target
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

interface IndicatorConfig {
  id: string; label: string; meta: string; unit?: string; reverse?: boolean; [key: string]: any;
}

const DEFAULT_INDICATORS: Record<string, IndicatorConfig[]> = {
  "Diretriz 1. Ampliação do acesso e qualificação da Rede de Atenção à Saúde (RAS)": [
    { id: "isf", label: "ISF do Programa Previne Brasil", v2022: "38,9%", v2023: "51,13%", v2024: "51,30%", q1_25: "51,3%", q2_25: "51,3", meta: "80", unit: "%" },
    { id: "raps", label: "Equipes completas na RAPS", v2022: "25%", v2023: "25%", v2024: "26%", q1_25: "62,5%", q2_25: "62,5", meta: "55", unit: "%" },
  ],
  "Eixo 4: Urgência e Emergência": [
    { id: "fichas", label: "Fichas Azul/Verde no PS Pelotas (%)", v2022: "38%", v2023: "27,4%", v2024: "26,5%", q1_25: "3,3%", q2_25: "14,9", meta: "30", unit: "%", reverse: true },
    { id: "leito_clin", label: "Espera por leito clínico no PS", v2022: "2,20", v2023: "2,42", v2024: "2,54", q1_25: "2,75", q2_25: "2,8", meta: "1", unit: " dias", reverse: true },
  ]
};

const StrategicIndicator: React.FC<{ 
  config: IndicatorConfig; 
  onEdit: (config: IndicatorConfig) => void; 
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  indicatorYears: string[];
}> = ({ config, onEdit, onDelete, onDragStart, onDragOver, onDrop, indicatorYears }) => {
  const { label, meta, unit = "", reverse = false } = config;
  const parseVal = (v: string) => { if (!v) return 0; const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, ''); return parseFloat(clean); };
  
  const currentYearKey = indicatorYears[indicatorYears.length - 1] || 'q2_25';
  const currentVal = config[currentYearKey] || "0";
  const isMet = reverse ? parseVal(currentVal) <= parseVal(meta) : parseVal(currentVal) >= parseVal(meta);
  
  return (
    <div 
      draggable="true"
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-2xl border ${isMet ? 'border-slate-200' : 'border-red-100'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group break-inside-avoid cursor-default active:cursor-grabbing hover:border-blue-300`}
    >
      <div className="p-5 flex-1 relative">
        <div className="absolute top-4 left-4 text-slate-300 group-hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing print:hidden">
          <GripVertical size={18} />
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(config)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={14} /></button>
          <button onClick={() => onDelete(config.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
        </div>

        <div className="flex justify-between items-start mb-3 mt-4">
          <div className="flex flex-col gap-1">
             <h3 className="text-sm font-bold text-slate-700 leading-tight pr-10 pl-2">
               <EditableText id={`ind_label_${config.id}`} defaultText={label} />
             </h3>
             {reverse && <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 pl-2"><ArrowDownCircle size={10}/> Meta Inversa Ativa</span>}
          </div>
          <div className={`p-1.5 rounded-full ${isMet ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isMet ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </div>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Status {currentYearKey.toUpperCase()}</span><div className={`text-3xl font-black ${isMet ? 'text-emerald-600' : 'text-red-600'}`}>{currentVal}{unit}</div></div>
          <div className="text-right"><span className="text-[10px] font-black uppercase text-blue-400 block mb-1">Meta</span><div className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-lg border border-blue-100">{meta}{unit}</div></div>
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-100 p-4 grid grid-cols-4 gap-2 text-center">
          {indicatorYears.map((yearKey, i) => (
            <div key={i} className={yearKey === currentYearKey ? 'bg-blue-100/50 rounded p-1 border border-blue-100' : ''}>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{yearKey.replace('v', '').replace('_', ' ')}</p>
              <p className={`text-[11px] font-bold ${yearKey === currentYearKey ? 'text-blue-600' : 'text-slate-500'}`}>{config[yearKey] || "0"}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

const PMSPelDashboard: React.FC = () => {
  const [indicators, setIndicators] = useState<Record<string, IndicatorConfig[]>>(DEFAULT_INDICATORS);
  const [indicatorYears, setIndicatorYears] = useState<string[]>(() => {
    const saved = localStorage.getItem('rdqa_indicator_years');
    return saved ? JSON.parse(saved) : ['v2022', 'v2023', 'v2024', 'q1_25', 'q2_25'];
  });
  const [editingIndicator, setEditingIndicator] = useState<IndicatorConfig | null>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [editingAxis, setEditingAxis] = useState<{ oldName: string; newName: string } | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [newAxisName, setNewAxisName] = useState("");
  const [formData, setFormData] = useState<Partial<IndicatorConfig>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ axis: string; index: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rdqa_full_indicators');
    if (saved) { 
      try { setIndicators(JSON.parse(saved)); } catch (e) { console.error(e); setIndicators(DEFAULT_INDICATORS); } 
    }
  }, []);

  const persist = (data: Record<string, IndicatorConfig[]>) => {
    setIndicators(data);
    localStorage.setItem('rdqa_full_indicators', JSON.stringify(data));
  };

  const handleDragStart = (axis: string, index: number) => setDraggedItem({ axis, index });
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetAxis: string, targetIndex: number) => {
    if (!draggedItem) return;
    const newIndicators = { ...indicators };
    const sourceAxis = draggedItem.axis;
    const sourceIndex = draggedItem.index;
    if (sourceAxis === targetAxis && sourceIndex === targetIndex) { setDraggedItem(null); return; }
    const sourceItems = [...newIndicators[sourceAxis]];
    const [movedItem] = sourceItems.splice(sourceIndex, 1);
    newIndicators[sourceAxis] = sourceItems;
    const targetItems = sourceAxis === targetAxis ? sourceItems : [...(newIndicators[targetAxis] || [])];
    targetItems.splice(targetIndex, 0, movedItem);
    newIndicators[targetAxis] = targetItems;
    persist(newIndicators);
    setDraggedItem(null);
  };

  const handleAxisDrop = (targetAxis: string) => {
    if (draggedItem && (indicators[targetAxis]?.length === 0)) handleDrop(targetAxis, 0);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb = { 
        rdqa_full_indicators: JSON.stringify(indicators),
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link'),
        ps_ppa_full_data_v2: localStorage.getItem('ps_ppa_full_data_v2'),
        ps_ppa_axis_order: localStorage.getItem('ps_ppa_axis_order')
      };
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) { alert('Erro ao gerar link estratégico.'); } finally { setIsSharing(false); }
  };

  const handleConfirmSave = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    const updated = { ...indicators };
    if (isAdding) {
      updated[isAdding] = [...(updated[isAdding] || []), { ...formData, id: Date.now().toString() } as IndicatorConfig]; 
    } else if (editingIndicator) {
      Object.keys(updated).forEach(e => { 
        updated[e] = updated[e].map(i => i.id === editingIndicator.id ? (formData as IndicatorConfig) : i); 
      });
    }
    persist(updated);
    setEditingIndicator(null); setIsAdding(null); setAdminPassword(""); setError("");
  };

  const handleCreateAxis = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    if (!newAxisName.trim()) { setError("Nome do eixo não pode ser vazio."); return; }
    const updated = { ...indicators, [newAxisName.trim()]: [] };
    persist(updated);
    setIsAddingAxis(false); setNewAxisName(""); setAdminPassword(""); setError("");
  };

  const handleAddYearKey = () => {
    const newKey = prompt("Digite a chave do novo ano/período (ex: v2026 ou q1_26):");
    if (newKey && !indicatorYears.includes(newKey)) {
      const newYears = [...indicatorYears, newKey];
      setIndicatorYears(newYears);
      localStorage.setItem('rdqa_indicator_years', JSON.stringify(newYears));
    }
  };

  const handleDeleteYearKey = (key: string) => {
    if (confirm(`Deseja remover o período ${key} de todos os indicadores?`)) {
      const newYears = indicatorYears.filter(y => y !== key);
      setIndicatorYears(newYears);
      localStorage.setItem('rdqa_indicator_years', JSON.stringify(newYears));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER PADRONIZADO RDQA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="rdqa_main_title" defaultText="Monitoramento RDQA" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
              <Calendar size={16} className="text-blue-500"/>
              <EditableText id="rdqa_main_subtitle" defaultText="Gestão Estratégica PMS Pelotas" />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative shrink-0">
          <button onClick={() => setIsAddingAxis(true)} className="flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-100 transition-all uppercase tracking-widest"><FolderPlus size={18} /> NOVO EIXO</button>
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black transition-all border-2 shadow-xl ${shareSuccess ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-slate-900 border-slate-900 text-white hover:bg-black'}`}>{isSharing ? <Loader2 className="animate-spin" size={16}/> : shareSuccess ? <CheckCircle size={16}/> : <Share2 size={16} />}</button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-slate-800 text-white rounded-2xl text-xs font-black flex items-center gap-3 shadow-xl uppercase tracking-widest"><Download size={18} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {(Object.entries(indicators) as [string, IndicatorConfig[]][]).map(([eixo, list]) => (
          <React.Fragment key={eixo}>
            {/* SUB-HEADER PADRONIZADO EIXO RDQA */}
            <div 
              onDragOver={handleDragOver} 
              onDrop={() => handleAxisDrop(eixo)} 
              className="col-span-full sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md py-4 mt-6 first:mt-0 mb-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 transition-all"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                   <EditableText id={`axis_title_${eixo.replace(/\s/g, '_')}`} defaultText={eixo} />
                </h2>
                <ShieldCheck size={24} className="text-blue-500 opacity-20" />
              </div>
              <button onClick={() => setIsAdding(eixo)} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl print:hidden flex-shrink-0 ml-4">+ Adicionar</button>
            </div>
            
            {list.map((ind, index) => (
              <StrategicIndicator 
                key={ind.id} 
                config={ind} 
                indicatorYears={indicatorYears}
                onDragStart={() => handleDragStart(eixo, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => { e.stopPropagation(); handleDrop(eixo, index); }}
                onEdit={(c) => {setEditingIndicator(c); setFormData(c); setAdminPassword(""); setError("");}} 
                onDelete={(id) => { if (prompt("Senha p/ excluir:") === 'Conselho@2026') { const upd = {...indicators}; Object.keys(upd).forEach(e => upd[e] = upd[e].filter(i => i.id !== id)); persist(upd); } }} 
              />
            ))}
            <div className="col-span-full">
              <DynamicNotes sectionId={`rdqa_axis_${eixo.replace(/\s/g, '_')}`} />
            </div>
          </React.Fragment>
        ))}
      </div>

      {(isAddingAxis || editingAxis) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddingAxis(false); setEditingAxis(null); }}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 animate-fade-in border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg uppercase mb-4">{isAddingAxis ? "Novo Eixo" : "Editar Eixo"}</h3>
            <input type="text" value={isAddingAxis ? newAxisName : editingAxis?.newName} onChange={(e) => isAddingAxis ? setNewAxisName(e.target.value) : setEditingAxis(prev => prev ? {...prev, newName: e.target.value} : null)} className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do eixo..." />
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl mb-4 font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Senha Mestre" />
            <button onClick={isAddingAxis ? handleCreateAxis : () => {}} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg">Confirmar Eixo</button>
          </div>
        </div>
      )}

      {(editingIndicator || isAdding) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {setEditingIndicator(null); setIsAdding(null);}}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-200">
            <div className="bg-slate-900 p-6 border-b border-slate-200 flex items-center justify-between text-white">
              <span className="font-black uppercase tracking-widest text-sm">Configurar Indicador Estratégico</span>
              <button onClick={() => {setEditingIndicator(null); setIsAdding(null);}}><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/30 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Indicador</label>
                <input type="text" value={formData.label || ""} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: % de cobertura vacinal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</label>
                  <input type="text" value={formData.unit || ""} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: % ou dias" />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer w-full hover:bg-slate-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" checked={formData.reverse || false} onChange={(e) => setFormData({...formData, reverse: e.target.checked})} /> 
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">Meta Inversa (Menor é melhor)</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {indicatorYears.map(f => (
                   <div key={f} className="relative group">
                     <label className="text-[9px] font-black text-slate-400 uppercase block mb-1 flex justify-between items-center">
                       {f.toUpperCase()}
                       <button onClick={() => handleDeleteYearKey(f)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10}/></button>
                     </label>
                     <input type="text" value={(formData as any)[f] || ""} onChange={(e) => setFormData({...formData, [f]: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                ))}
                <div key="meta">
                   <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">META</label>
                   <input type="text" value={formData.meta || ""} onChange={(e) => setFormData({...formData, meta: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <button onClick={handleAddYearKey} className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-all">
                <Plus size={14} /> Adicionar Ano/Período
              </button>
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Autorização do Conselho</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border-2 border-slate-200 rounded-xl font-black text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Senha Mestre" />
              </div>
              <button onClick={handleConfirmSave} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Sincronizar ao Painel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMSPelDashboard;
