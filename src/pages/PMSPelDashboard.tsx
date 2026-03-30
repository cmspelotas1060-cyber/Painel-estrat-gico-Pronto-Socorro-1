
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { 
  History, CheckCircle2, AlertCircle, ShieldCheck, Cpu, Users, 
  HeartPulse, Microscope, Download, Edit3, X, Save, Lock, Plus, Trash2, 
  Share2, Loader2, CheckCircle, Check, GripVertical, Settings2, FolderPlus,
  ArrowDownCircle, Calendar, Target, Eye, EyeOff
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';
import { PasswordModal } from '../components/PasswordModal';
import { usePasswordPrompt } from '../hooks/usePasswordPrompt';

interface IndicatorConfig {
  id: string; label: string; meta: string; unit?: string; reverse?: boolean; years?: string[]; [key: string]: any;
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
  onDragEnd?: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  indicatorYears: string[];
  editorMode?: boolean;
}> = ({ config, onEdit, onDelete, onDragStart, onDragEnd, onDragOver, onDragEnter, onDrop, indicatorYears, editorMode }) => {
  const { label, meta, unit = "", reverse = false, years: configYears } = config;
  const displayYears = configYears || indicatorYears;
  const parseVal = (v: string) => { if (!v) return 0; const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, ''); return parseFloat(clean); };
  
  const currentYearKey = displayYears[displayYears.length - 1] || 'q2_25';
  const currentVal = config[currentYearKey] || "0";
  const isMet = reverse ? parseVal(currentVal) <= parseVal(meta) : parseVal(currentVal) >= parseVal(meta);
  
  return (
    <div 
      draggable={editorMode ? "true" : "false"}
      onDragStart={onDragStart}
      onDragEnd={() => onDragEnd?.()}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      className={`bg-white rounded-2xl border ${isMet ? 'border-slate-200' : 'border-red-100'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group break-inside-avoid cursor-default active:cursor-grabbing hover:border-blue-300`}
    >
      <div className="p-5 flex-1 relative">
        {editorMode && (
          <div className="absolute top-4 left-4 text-slate-300 group-hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing print:hidden">
            <GripVertical size={18} />
          </div>
        )}

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
          {displayYears.map((yearKey, i) => (
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
  const navigate = useNavigate();
  const location = useLocation();
  const isArchive = location.pathname === '/rdqa-domi';
  const [isAuthorized, setIsAuthorized] = useState(() => sessionStorage.getItem('pms_authorized') === 'true');
  const [indicators, setIndicators] = useState<Record<string, IndicatorConfig[]>>(DEFAULT_INDICATORS);
  const [indicatorYears, setIndicatorYears] = useState<string[]>(() => {
    const key = isArchive ? 'rdqa_domi_years' : 'rdqa_indicator_years';
    return storage.getSync(key, ['v2022', 'v2023', 'v2024', 'q1_25', 'q2_25']);
  });
  const [editingIndicator, setEditingIndicator] = useState<IndicatorConfig | null>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [editingAxis, setEditingAxis] = useState<{ oldName: string; newName: string } | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [newAxisName, setNewAxisName] = useState("");
  const [formData, setFormData] = useState<Partial<IndicatorConfig>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showSharePasswordModal, setShowSharePasswordModal] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [showSharePassword, setShowSharePassword] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ axis: string; index: number } | null>(null);
  const [draggedAxis, setDraggedAxis] = useState<string | null>(null);
  const { passwordModal, requestPassword, closePasswordModal } = usePasswordPrompt();
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      const key = isArchive ? 'rdqa_domi_indicators' : 'rdqa_full_indicators';
      const saved = await storage.getItem(key);
      if (saved) { 
        setIndicators(saved);
      } else if (isArchive) {
        setIndicators(DEFAULT_INDICATORS);
      }
    };
    load();
    window.addEventListener('storage', load);
    
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('ui_editor_mode_changed', handleModeChange);
    };
  }, []);

  const persist = (data: Record<string, IndicatorConfig[]> | ((prev: Record<string, IndicatorConfig[]>) => Record<string, IndicatorConfig[]>)) => {
    setIndicators(prev => {
      const newData = typeof data === 'function' ? data(prev) : data;
      const key = isArchive ? 'rdqa_domi_indicators' : 'rdqa_full_indicators';
      storage.setItem(key, newData);
      return newData;
    });
  };

  const checkAuth = (providedPw?: string, promptMsg?: string, onAuthorized?: () => void) => {
    if (isAuthorized || sessionStorage.getItem('pms_authorized') === 'true') {
      if (!isAuthorized) {
        setIsAuthorized(true);
        sessionStorage.setItem('pms_authorized', 'true');
      }
      if (onAuthorized) onAuthorized();
      return true;
    }
    
    if (providedPw) {
      if (providedPw === 'Conselho@2026') {
        setIsAuthorized(true);
        sessionStorage.setItem('pms_authorized', 'true');
        if (onAuthorized) onAuthorized();
        return true;
      }
      return false;
    }

    if (promptMsg && onAuthorized) {
      requestPassword(promptMsg, (pw) => {
        if (pw === 'Conselho@2026') {
          setIsAuthorized(true);
          sessionStorage.setItem('pms_authorized', 'true');
          onAuthorized();
        } else {
          alert("Senha incorreta!");
        }
      });
    }
    
    return false;
  };

  const handleDomiAction = () => {
    if (isArchive) {
      navigate('/pmspel');
      return;
    }

    if (editorMode) {
      requestPassword("Para arquivar os indicadores atuais para o DOMI 2022-2025, digite a senha mestre:", (pw) => {
        if (pw === 'Conselho@2026') {
          storage.setItem('rdqa_domi_indicators', indicators);
          storage.setItem('rdqa_domi_years', indicatorYears);
          alert("Indicadores arquivados com sucesso para a página DOMI 2022-2025!");
          navigate('/rdqa-domi');
        }
      });
    } else {
      navigate('/rdqa-domi');
    }
  };

  const stats = React.useMemo(() => {
    let total = 0;
    let met = 0;
    let unmet = 0;

    const parseVal = (v: any) => { 
      if (!v) return 0; 
      const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, ''); 
      return parseFloat(clean); 
    };

    Object.values(indicators).forEach(list => {
      list.forEach(ind => {
        total++;
        const displayYears = ind.years || indicatorYears;
        const currentYearKey = displayYears[displayYears.length - 1] || 'q2_25';
        const currentVal = ind[currentYearKey] || "0";
        const meta = ind.meta || "0";
        const reverse = ind.reverse || false;
        
        const isMet = reverse ? parseVal(currentVal) <= parseVal(meta) : parseVal(currentVal) >= parseVal(meta);
        if (isMet) met++;
        else unmet++;
      });
    });

    return { total, met, unmet };
  }, [indicators, indicatorYears]);

  const handleDragStart = (axis: string, index: number) => {
    if (!editorMode) return;
    setDraggedItem({ axis, index });
  };
  const handleAxisDragStart = (axis: string) => {
    if (!editorMode) return;
    setDraggedAxis(axis);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleAxisDragEnter = (targetAxis: string) => {
    if (!draggedAxis || draggedAxis === targetAxis) return;
    
    setIndicators(prev => {
      const axisKeys = Object.keys(prev);
      const sourceIndex = axisKeys.indexOf(draggedAxis);
      const targetIndex = axisKeys.indexOf(targetAxis);
      
      const newKeys = [...axisKeys];
      newKeys.splice(sourceIndex, 1);
      newKeys.splice(targetIndex, 0, draggedAxis);
      
      const newIndicators: Record<string, IndicatorConfig[]> = {};
      newKeys.forEach(key => {
        newIndicators[key] = prev[key];
      });
      
      return newIndicators;
    });
  };

  const handleIndicatorDragEnter = (targetAxis: string, targetIndex: number) => {
    if (!draggedItem) return;
    const { axis: sourceAxis, index: sourceIndex } = draggedItem;
    
    if (sourceAxis === targetAxis && sourceIndex === targetIndex) return;

    setIndicators(prev => {
      const newIndicators = { ...prev };
      const sourceItems = [...newIndicators[sourceAxis]];
      const [movedItem] = sourceItems.splice(sourceIndex, 1);
      
      const targetItems = sourceAxis === targetAxis ? sourceItems : [...(newIndicators[targetAxis] || [])];
      targetItems.splice(targetIndex, 0, movedItem);
      
      newIndicators[sourceAxis] = sourceItems;
      newIndicators[targetAxis] = targetItems;
      
      return newIndicators;
    });
    
    setDraggedItem({ axis: targetAxis, index: targetIndex });
  };

  const handleAxisDropOnAxis = (targetAxis: string) => {
    if (!draggedAxis) return;
    persist(prev => prev);
    setDraggedAxis(null);
  };

  const handleDrop = (targetAxis: string, targetIndex: number) => {
    if (!draggedItem) return;
    persist(prev => prev);
    setDraggedItem(null);
  };

  const handleShare = () => {
    setShowSharePasswordModal(true);
    setSharePassword('');
  };

  const executeShare = async () => {
    if (sharePassword !== 'Conselho@2026') {
      alert('Senha incorreta.');
      return;
    }
    setShowSharePasswordModal(false);
    setIsSharing(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('supabase.auth.')) {
          fullDb[key] = localStorage.getItem(key);
        }
      }

      if (Object.keys(fullDb).length === 0) {
        throw new Error('Nenhum dado encontrado para compartilhar.');
      }

      const payload = { full_db: fullDb, ts: Date.now() };
      const shareId = await syncService.createShare(payload);
      
      const currentHash = window.location.hash.split('?')[0] || '#/pmspel';
      const shareUrl = `${window.location.origin}${window.location.pathname}${currentHash}${currentHash.includes('?') ? '&' : '?'}id=${shareId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e: any) { 
      console.error(e);
      alert(`Erro ao gerar link estratégico: ${e.message || 'Falha na conexão.'}`); 
    } finally { 
      setIsSharing(false); 
    }
  };

  const handleConfirmSave = () => {
    if (!checkAuth(adminPassword)) { setError("Senha incorreta."); return; }
    persist(prev => {
      const updated = { ...prev };
      if (isAdding) {
        updated[isAdding] = [...(updated[isAdding] || []), { ...formData, id: Date.now().toString() } as IndicatorConfig]; 
      } else if (editingIndicator) {
        Object.keys(updated).forEach(e => { 
          updated[e] = updated[e].map(i => i.id === editingIndicator.id ? (formData as IndicatorConfig) : i); 
        });
      }
      return updated;
    });
    setEditingIndicator(null); setIsAdding(null); setAdminPassword(""); setError("");
  };

  const handleCreateAxis = () => {
    if (!checkAuth(adminPassword, "Digite a senha mestre para criar um novo eixo:")) { setError("Senha incorreta."); return; }
    if (!newAxisName.trim()) { setError("Nome do eixo não pode ser vazio."); return; }
    persist(prev => ({ ...prev, [newAxisName.trim()]: [] }));
    setIsAddingAxis(false); setNewAxisName(""); setAdminPassword(""); setError("");
  };

  const handleDeleteAxis = (axis: string) => {
    checkAuth(undefined, `Para excluir o eixo "${axis}" e TODOS os seus indicadores, digite a senha mestre:`, () => {
      persist(prev => {
        const updated = { ...prev };
        delete updated[axis];
        return updated;
      });
    });
  };

  const handleAddYearKey = () => {
    const newKey = prompt("Digite a chave do novo ano/período (ex: v2026 ou q1_26):");
    if (newKey) {
      const currentYears = formData.years || indicatorYears;
      if (!currentYears.includes(newKey)) {
        setFormData({ ...formData, years: [...currentYears, newKey] });
      }
    }
  };

  const handleDeleteYearKey = (key: string) => {
    if (confirm(`Deseja remover o período ${key} deste indicador?`)) {
      const currentYears = formData.years || indicatorYears;
      setFormData({ ...formData, years: currentYears.filter(y => y !== key) });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER PADRONIZADO RDQA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="p-4 md:p-5 bg-slate-900 text-white rounded-2xl md:rounded-3xl shadow-2xl shrink-0">
             <ShieldCheck size={28} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id={isArchive ? "rdqa_domi_title" : "rdqa_main_title"} defaultText={isArchive ? "DOMI 2022-2025" : "Monitoramento RDQA"} />
            </h1>
            <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-wider mt-1.5 text-center sm:text-left">
              (Relatório Detalhado do Quadrimestre Anterior)
            </p>
            <p className="text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-80">
              <Calendar size={14} className="text-blue-500"/>
              <EditableText id="rdqa_main_subtitle" defaultText="Gestão Estratégica PMS Pelotas" />
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 relative shrink-0 w-full lg:w-auto">
          <button 
            onClick={handleDomiAction}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest shadow-sm ${isArchive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-100'}`}
          >
            <History size={18} />
            {isArchive ? 'VOLTAR AO ATUAL' : 'DOMI 2022-2025'}
          </button>
          {editorMode && !isArchive && (
            <button onClick={() => setIsAddingAxis(true)} className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-100 transition-all uppercase tracking-widest"><FolderPlus size={18} /> NOVO EIXO</button>
          )}
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black bg-slate-900 text-white hover:bg-black transition-all uppercase tracking-widest shadow-xl disabled:opacity-50"
          >
            {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            {isSharing ? 'GERANDO...' : 'COMPARTILHAR'}
          </button>
        </div>
      </div>

      {/* QUADRO EXPLICATIVO RDQA */}
      <div className="animate-slide-down -mt-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row relative overflow-hidden group hover:border-blue-400 transition-all gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all text-blue-600 pointer-events-none">
            <ShieldCheck size={160} />
          </div>
          
          <div className="flex-1 space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                <ShieldCheck size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">RDQA</span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Relatório Detalhado do Quadrimestre Anterior</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">👉</span>
                <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight pt-1">Monitoramento e avaliação (a cada 4 meses)</p>
              </div>
              
              <ul className="space-y-3 ml-8">
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Apresenta o que foi realmente executado.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Mostra gastos, produção de serviços e indicadores.</li>
                <li className="text-sm text-slate-500 font-bold leading-relaxed list-disc marker:text-slate-300">Permite avaliar se o planejado está sendo cumprido.</li>
              </ul>
            </div>
          </div>

          <div className="md:w-72 flex flex-col justify-center relative z-10">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Check size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-2">Resultado</p>
                <p className="text-xs font-black text-blue-700 leading-tight uppercase">Transparência e controle da execução.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESUMO DE INDICADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex items-center gap-5 group hover:border-blue-300 transition-all">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Indicadores</p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex items-center gap-5 group hover:border-emerald-300 transition-all">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metas Atingidas</p>
            <p className="text-3xl font-black text-emerald-600">{stats.met}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex items-center gap-5 group hover:border-red-300 transition-all">
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metas Não Atingidas</p>
            <p className="text-3xl font-black text-red-600">{stats.unmet}</p>
          </div>
        </div>
      </div>

      {/* FEEDBACK DE COMPARTILHAMENTO */}
      {shareSuccess && (
        <div className="fixed bottom-10 right-10 z-[200] animate-slide-up">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest">Link Copiado!</span>
              <span className="text-[10px] font-bold opacity-80">O link de sincronização está na sua área de transferência.</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SENHA PARA COMPARTILHAR */}
      {showSharePasswordModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSharePasswordModal(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-in border border-slate-100">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Lock size={24}/></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Segurança</h3>
              </div>
              <button onClick={() => setShowSharePasswordModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-slate-500 text-sm font-bold">Digite a senha mestre para gerar o link de compartilhamento:</p>
              <div className="relative">
                <input 
                  type={showSharePassword ? "text" : "password"}
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeShare()}
                  autoFocus
                  placeholder="••••••••"
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-900 focus:border-blue-500 outline-none transition-all pr-14"
                />
                <button 
                  type="button"
                  onClick={() => setShowSharePassword(!showSharePassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showSharePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button 
                onClick={executeShare}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
              >
                Confirmar e Gerar Link
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 pt-4">
        {(Object.entries(indicators) as [string, IndicatorConfig[]][]).map(([eixo, list]) => {
          const isDraggingThisAxis = draggedAxis === eixo;
          return (
            <div 
              key={eixo}
              onDragOver={handleDragOver}
              onDragEnter={() => {
                if (draggedAxis) handleAxisDragEnter(eixo);
                else if (draggedItem) handleIndicatorDragEnter(eixo, indicators[eixo].length);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                if (draggedAxis) {
                  handleAxisDropOnAxis(eixo);
                } else {
                  handleDrop(eixo, indicators[eixo].length);
                }
              }}
              className={`space-y-4 transition-all duration-300 ${isDraggingThisAxis ? 'opacity-40 scale-[0.98] grayscale' : ''}`}
            >
              {/* SUB-HEADER PADRONIZADO EIXO RDQA */}
              <div 
                draggable={editorMode ? "true" : "false"}
                onDragStart={() => handleAxisDragStart(eixo)}
                onDragEnd={() => {
                  persist(prev => prev);
                  setDraggedAxis(null);
                }}
                className={`sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md py-4 mt-6 first:mt-0 mb-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 transition-all cursor-move group/axis ${isDraggingThisAxis ? 'border-dashed border-blue-400' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {editorMode && (
                    <div className="text-slate-300 group-hover/axis:text-blue-400 transition-colors mr-2">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                     <EditableText id={`axis_title_${eixo.replace(/\s/g, '_')}`} defaultText={eixo} />
                  </h2>
                  <ShieldCheck size={24} className="text-blue-500 opacity-20" />
                </div>
                <div className="flex items-center gap-3 pr-4">
                  <button 
                    onClick={() => handleDeleteAxis(eixo)} 
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all print:hidden"
                    title="Excluir Eixo"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => {
                    checkAuth(undefined, "Digite a senha mestre para adicionar um indicador:", () => {
                      setIsAdding(eixo);
                      setFormData({ id: Date.now().toString(), label: "", meta: "", unit: "" });
                      setAdminPassword("");
                      setError("");
                    });
                  }} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl print:hidden flex-shrink-0">+ Adicionar</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {list.map((ind, index) => (
                  <StrategicIndicator 
                    key={ind.id} 
                    config={ind} 
                    indicatorYears={indicatorYears}
                    editorMode={editorMode}
                    onDragStart={() => handleDragStart(eixo, index)}
                    onDragEnd={() => {
                      persist(prev => prev);
                      setDraggedItem(null);
                    }}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleIndicatorDragEnter(eixo, index)}
                    onDrop={(e) => { 
                      if (draggedAxis) return; 
                      e.stopPropagation(); 
                      handleDrop(eixo, index); 
                    }} 
                    onEdit={(c) => {
                      checkAuth(undefined, "Digite a senha mestre para editar este indicador:", () => {
                        setEditingIndicator(c); 
                        setFormData(c); 
                        setAdminPassword(""); 
                        setError("");
                      });
                    }} 
                    onDelete={(id) => { 
                      checkAuth(undefined, "Digite a senha mestre para excluir este indicador:", () => { 
                        persist(prev => {
                          const upd = {...prev}; 
                          Object.keys(upd).forEach(e => upd[e] = upd[e].filter(i => i.id !== id)); 
                          return upd;
                        }); 
                      }); 
                    }} 
                  />
                ))}
              </div>
              
              <div className="col-span-full">
                <DynamicNotes sectionId={`rdqa_axis_${eixo.replace(/\s/g, '_')}`} />
              </div>
            </div>
          );
        })}
      </div>

      {(isAddingAxis || editingAxis) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddingAxis(false); setEditingAxis(null); }}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 p-6 animate-fade-in border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg uppercase mb-4">{isAddingAxis ? "Novo Eixo" : "Editar Eixo"}</h3>
            <input type="text" value={isAddingAxis ? newAxisName : editingAxis?.newName} onChange={(e) => isAddingAxis ? setNewAxisName(e.target.value) : setEditingAxis(prev => prev ? {...prev, newName: e.target.value} : null)} className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do eixo..." />
            <div className="relative mb-4">
              <input 
                type={showAdminPassword ? "text" : "password"} 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none pr-12" 
                placeholder="Senha Mestre" 
              />
              <button 
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
                {(formData.years || indicatorYears).map(f => (
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
                <div className="relative">
                  <input 
                    type={showAdminPassword ? "text" : "password"} 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    className="w-full p-4 border-2 border-slate-200 rounded-xl font-black text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none pr-14" 
                    placeholder="Senha Mestre" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button onClick={handleConfirmSave} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Sincronizar ao Painel</button>
            </div>
          </div>
        </div>
      )}

      <PasswordModal 
        isOpen={passwordModal.isOpen}
        onClose={closePasswordModal}
        onConfirm={passwordModal.onConfirm}
        title={passwordModal.title}
        message={passwordModal.message}
      />
    </div>
  );
};

export default PMSPelDashboard;
