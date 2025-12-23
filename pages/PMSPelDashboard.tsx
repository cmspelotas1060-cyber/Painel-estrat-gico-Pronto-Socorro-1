
import React, { useState, useEffect } from 'react';
import { 
  History, CheckCircle2, AlertCircle, ShieldCheck, Cpu, Users, 
  HeartPulse, Microscope, Download, Edit3, X, Save, Lock, Plus, Trash2, 
  Share2, Loader2, CheckCircle, GripVertical
} from 'lucide-react';

interface IndicatorConfig {
  id: string; label: string; v2022: string; v2023: string; v2024: string; q1_25: string; q2_25: string; meta: string; unit?: string; reverse?: boolean;
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
}> = ({ config, onEdit, onDelete, onDragStart, onDragOver, onDrop }) => {
  const { label, v2022, v2023, v2024, q1_25, q2_25, meta, unit = "", reverse = false } = config;
  const parseVal = (v: string) => { if (!v) return 0; const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, ''); return parseFloat(clean); };
  const isMet = reverse ? parseVal(q2_25) <= parseVal(meta) : parseVal(q2_25) >= parseVal(meta);
  
  return (
    <div 
      draggable="true"
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group break-inside-avoid cursor-default active:cursor-grabbing hover:border-blue-300"
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
          <h3 className="text-sm font-bold text-slate-700 leading-tight pr-10 pl-2">{label}</h3>
          <div className={`p-1.5 rounded-full ${isMet ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isMet ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </div>
        </div>
        <div className="flex items-end justify-between mt-4">
          <div><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Status Q2</span><div className={`text-3xl font-black ${isMet ? 'text-emerald-600' : 'text-red-600'}`}>{q2_25}{unit}</div></div>
          <div className="text-right"><span className="text-[10px] font-black uppercase text-blue-400 block mb-1">Meta</span><div className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-lg border border-blue-100">{meta}{unit}</div></div>
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-100 p-4 grid grid-cols-4 gap-2 text-center">
          {[{l: '2022', v: v2022}, {l: '2023', v: v2023}, {l: '2024', v: v2024}, {l: 'Q1 25', v: q1_25, h: true}].map((x, i) => (
            <div key={i} className={x.h ? 'bg-blue-100/50 rounded p-1 border border-blue-100' : ''}>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{x.l}</p>
              <p className={`text-[11px] font-bold ${x.h ? 'text-blue-600' : 'text-slate-500'}`}>{x.v}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

const PMSPelDashboard: React.FC = () => {
  const [indicators, setIndicators] = useState<Record<string, IndicatorConfig[]>>(DEFAULT_INDICATORS);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorConfig | null>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IndicatorConfig>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  
  // State for Drag and Drop reordering
  const [draggedItem, setDraggedItem] = useState<{ axis: string; index: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rdqa_full_indicators');
    if (saved) { 
      try { 
        setIndicators(JSON.parse(saved)); 
      } catch (e) { 
        console.error(e); 
        // Fallback to default if corrupted
        setIndicators(DEFAULT_INDICATORS);
      } 
    }
  }, []);

  const handleDragStart = (axis: string, index: number) => {
    setDraggedItem({ axis, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetAxis: string, targetIndex: number) => {
    if (!draggedItem || draggedItem.axis !== targetAxis) return;

    const newIndicators = { ...indicators };
    const axisItems = [...newIndicators[targetAxis]];
    
    // Swap items
    const [movedItem] = axisItems.splice(draggedItem.index, 1);
    axisItems.splice(targetIndex, 0, movedItem);
    
    newIndicators[targetAxis] = axisItems;
    setIndicators(newIndicators);
    localStorage.setItem('rdqa_full_indicators', JSON.stringify(newIndicators));
    setDraggedItem(null);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const strategicData = JSON.parse(localStorage.getItem('rdqa_full_indicators') || JSON.stringify(indicators));
      const payload = JSON.stringify({ type: 'strategic', data: strategicData, timestamp: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)))
                      .replace(/\+/g, '-')
                      .replace(/\//g, '_');

      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar link estratégico.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleConfirmSave = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    const updated = { ...indicators };
    if (isAdding) updated[isAdding] = [...(updated[isAdding] || []), formData as IndicatorConfig]; 
    else if (editingIndicator) Object.keys(updated).forEach(e => { updated[e] = updated[e].map(i => i.id === editingIndicator.id ? (formData as IndicatorConfig) : i); });
    localStorage.setItem('rdqa_full_indicators', JSON.stringify(updated));
    setIndicators(updated); setEditingIndicator(null); setIsAdding(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><ShieldCheck size={32} /></div>
          <div><h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Monitoramento RDQA</h1><p className="text-slate-500 text-sm mt-1 font-medium">Gestão Estratégica de Série Histórica e Metas</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${
              shareSuccess ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-slate-900 border-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
            }`}
          >
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK ESTRATÉGICO COPIADO' : 'COMPARTILHAR ESTA ABA'}
          </button>
          <button onClick={() => window.print()} className="px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-700 shadow-lg"><Download size={18} /> Exportar PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.entries(indicators) as [string, IndicatorConfig[]][]).map(([eixo, list]) => (
          <React.Fragment key={eixo}>
            <div className="col-span-full mt-10 first:mt-0 mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 max-w-4xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest leading-relaxed">{eixo}</h2>
              </div>
              <button onClick={() => setIsAdding(eixo)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-200 print:hidden flex-shrink-0 ml-4">+ Novo Indicador</button>
            </div>
            {list.map((ind, index) => (
              <StrategicIndicator 
                key={ind.id} 
                config={ind} 
                onDragStart={() => handleDragStart(eixo, index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(eixo, index)}
                onEdit={(c) => {setEditingIndicator(c); setFormData(c); setAdminPassword(""); setError("");}} 
                onDelete={(id) => { if (prompt("Senha p/ excluir:") === 'Conselho@2026') { const upd = {...indicators}; Object.keys(upd).forEach(e => upd[e] = upd[e].filter(i => i.id !== id)); localStorage.setItem('rdqa_full_indicators', JSON.stringify(upd)); setIndicators(upd); } }} 
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {(editingIndicator || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {setEditingIndicator(null); setIsAdding(null);}}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800 tracking-tight"><span>{isAdding ? `Novo Indicador em ${isAdding.substring(0, 30)}...` : `Editando: ${editingIndicator?.label}`}</span><button onClick={() => {setEditingIndicator(null); setIsAdding(null);}}><X size={24} /></button></div>
            <div className="p-6 overflow-y-auto space-y-4">
              <input type="text" value={formData.label || ""} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" placeholder="Título do Indicador" />
              <div className="grid grid-cols-3 gap-2">
                {['v2022', 'v2023', 'v2024', 'q1_25', 'q2_25', 'meta'].map(f => (
                   <div key={f}><label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">{f.toUpperCase().replace('V', '')}</label><input type="text" value={(formData as any)[f] || ""} onChange={(e) => setFormData({...formData, [f]: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold" /></div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100"><label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase"><Lock size={12}/> Autenticação Necessária</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl" placeholder="Senha do Conselho" />{error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}</div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3"><button onClick={() => {setEditingIndicator(null); setIsAdding(null);}} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200">Cancelar</button><button onClick={handleConfirmSave} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-colors"><Save size={18} /> Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMSPelDashboard;
