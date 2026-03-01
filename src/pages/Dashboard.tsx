
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { 
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  ChevronDown, Calendar, Download, Trash2, X, AlertCircle, 
  Edit3, Save, Share2, Loader2, CheckCircle,
  FileText, Zap, BedDouble, Microscope, Plus, PlusCircle,
  ArrowUpRight, Trophy, BarChart3, Pill, HeartPulse,
  Target, TrendingDown, Home, Building2, HeartHandshake,
  Shield, UserCheck, Bike, Truck, Car, Scissors, Droplets,
  Eye, Search, SearchCode, Bone, GripVertical, Type, PlusSquare, Settings,
  AlignLeft, ClipboardList, Filter, History, CheckCircle2, ShieldCheck, Cpu,
  Settings2, FolderPlus, ArrowDownCircle
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

interface LayoutItem {
  id: string;
  type: 'section' | 'subtitle' | 'indicator' | 'spacer';
  displayType?: 'sum' | 'average'; // Nova propriedade para controlar a lógica
  label?: string;
  title?: string;
  color?: string;
  iconName?: string;
  keys?: string[];
  suffix?: string;
  accentColor?: string;
}

const ICON_MAP: Record<string, any> = {
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  Zap, BedDouble, Microscope, Pill, HeartPulse, Target, TrendingDown, 
  Home, Building2, HeartHandshake, Shield, UserCheck, Bike, Truck, 
  Car, Scissors, Droplets, Eye, Search, SearchCode, Bone, BarChart3, Star: Trophy,
  AlignLeft, Type, ArrowUpRight, FileText, Plus, PlusCircle, Trophy, Settings, PlusSquare,
  ClipboardList, Filter, History, CheckCircle2, ShieldCheck, Cpu, 
  Share2, Loader2, CheckCircle, GripVertical, Settings2, FolderPlus,
  ArrowDownCircle, Calendar
};

const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: 'sec_fluxo', type: 'section', title: 'Fluxo e Demanda', color: '#3b82f6', iconName: 'Users' },
  { id: 'ind_acolhimento', type: 'indicator', label: 'Acolhimentos Totais', keys: ['i1_acolhimento'], accentColor: 'blue', iconName: 'Users', displayType: 'sum' },
  { id: 'ind_consultas', type: 'indicator', label: 'Consultas Médicas', keys: ['i1_consultas'], accentColor: 'purple', iconName: 'Stethoscope', displayType: 'sum' },
  { id: 'ind_pelotas', type: 'indicator', label: 'Pacientes: Pelotas', keys: ['i4_pelotas'], accentColor: 'blue', iconName: 'Target', displayType: 'sum' },
  { id: 'ind_outros', type: 'indicator', label: 'Pacientes: Outros Municípios', keys: ['i4_outros_municipios'], accentColor: 'slate', iconName: 'ArrowUpRight', displayType: 'sum' },
  { id: 'sec_risco', type: 'section', title: 'Risco e Especialidades', color: '#f59e0b', iconName: 'Activity' },
  { id: 'ind_vermelho', type: 'indicator', label: 'Emergência (Vermelho)', keys: ['i3_emergencia'], accentColor: 'red', iconName: 'ShieldAlert', displayType: 'sum' },
  { id: 'ind_amarelo', type: 'indicator', label: 'Urgência (Amarelo)', keys: ['i3_urgencia'], accentColor: 'orange', iconName: 'Zap', displayType: 'sum' },
  { id: 'ind_verde', type: 'indicator', label: 'Pouco Urgente (Verde/Azul)', keys: ['i3_pouco_urgente'], accentColor: 'emerald', iconName: 'Activity', displayType: 'sum' },
  { id: 'sub_especialidades', type: 'subtitle', title: 'Serviços Especializados' },
  { id: 'ind_clinica', type: 'indicator', label: 'Especialidade: Clínica Médica', keys: ['i5_clinica_medica'], accentColor: 'blue', iconName: 'Stethoscope', displayType: 'sum' },
  { id: 'ind_pediatria', type: 'indicator', label: 'Especialidade: Pediatria', keys: ['i5_pediatria'], accentColor: 'purple', iconName: 'HeartPulse', displayType: 'sum' },
  { id: 'sec_traumas', type: 'section', title: 'Causas Externas', color: '#ef4444', iconName: 'AlertTriangle' },
  { id: 'ind_moto', type: 'indicator', label: 'Acidente: Moto', keys: ['i7_ac_moto'], accentColor: 'red', iconName: 'Zap', displayType: 'sum' },
  { id: 'ind_carro', type: 'indicator', label: 'Acidente: Carro', keys: ['i7_ac_carro'], accentColor: 'orange', iconName: 'Car', displayType: 'sum' },
  { id: 'ind_queda', type: 'indicator', label: 'Trauma: Quedas', keys: ['i8_queda'], accentColor: 'orange', iconName: 'TrendingDown', displayType: 'sum' },
  { id: 'sec_leitos', type: 'section', title: 'Gestão de Leitos', color: '#8b5cf6', iconName: 'BedDouble' },
  { id: 'ind_oc_clinico', type: 'indicator', label: 'Ocupação: Clínico Adulto', keys: ['i10_clinico_adulto'], accentColor: 'purple', suffix: '%', iconName: 'BedDouble', displayType: 'average' },
  { id: 'ind_oc_uti', type: 'indicator', label: 'Ocupação: UTI Adulto', keys: ['i10_uti_adulto'], accentColor: 'red', suffix: '%', iconName: 'HeartPulse', displayType: 'average' }
];

const Dashboard: React.FC = () => {
  const [rawData, setRawData] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState('2025');
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    return storage.getSync('dashboard_v3_layout', DEFAULT_LAYOUT);
  });
  
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [showManageModal, setShowManageModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configItem, setConfigItem] = useState<LayoutItem | null>(null);
  
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({}); 
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const loadData = useCallback(() => {
    const parsed = storage.getSync('ps_monthly_detailed_stats');
    if (!parsed) return;

    const migrationFixDone = localStorage.getItem('migration_fix_2026_to_2025');
    if (!migrationFixDone && parsed['2026'] && !parsed['2025']) {
        parsed['2025'] = parsed['2026'];
        delete parsed['2026'];
        localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
        localStorage.setItem('migration_fix_2026_to_2025', 'true');
    }

    setRawData(parsed[selectedYear] || parsed || {});
  }, [selectedYear]);

  useEffect(() => {
    loadData();
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, [loadData, selectedYear]);

  const saveLayout = (newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    localStorage.setItem('dashboard_v3_layout', JSON.stringify(newLayout));
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newList = [...layout];
      const draggedItemContent = newList[dragItem.current];
      newList.splice(dragItem.current, 1);
      newList.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      saveLayout(newList);
    }
  };

  const addNewBlock = (type: LayoutItem['type']) => {
    const timestamp = Date.now();
    const newBlock: LayoutItem = {
      id: `custom_${timestamp}`,
      type,
      displayType: type === 'indicator' ? 'sum' : undefined,
      title: type === 'section' ? 'Nova Seção' : type === 'subtitle' ? 'Novo Subtítulo' : undefined,
      label: type === 'indicator' ? 'Novo Indicador' : undefined,
      accentColor: 'blue',
      color: '#3b82f6',
      iconName: type === 'section' ? 'Layers' : type === 'subtitle' ? 'AlignLeft' : 'Activity',
      keys: type === 'indicator' ? [`key_${timestamp}`] : undefined,
      suffix: ''
    };
    saveLayout([...layout, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (confirm("Deseja remover este elemento permanentemente do layout?")) {
      saveLayout(layout.filter(item => item.id !== id));
    }
  };

  const initiateManage = (keys: string[], label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetKeys(keys);
    setTargetLabel(label);
    setAdminPassword('');
    setActionError('');
    const initialEditState: Record<string, Record<string, string>> = {};
    
    const fullData = JSON.parse(localStorage.getItem('ps_monthly_detailed_stats') || '{}');
    const yearData = fullData[selectedYear] || {};

    ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].forEach(period => {
      initialEditState[period] = {};
      keys.forEach(key => {
        const val = yearData[period]?.[key] ?? 0;
        initialEditState[period][key] = val.toString();
      });
    });
    setEditValues(initialEditState);
    setShowManageModal(true);
  };

  const saveChanges = async () => {
    if (adminPassword !== 'Conselho@2026') { setActionError('Senha incorreta.'); return; }
    setIsSaving(true);
    try {
      const saved = localStorage.getItem('ps_monthly_detailed_stats');
      let parsed = saved ? JSON.parse(saved) : {};
      
      if (!parsed[selectedYear]) parsed[selectedYear] = {};

      Object.keys(editValues).forEach(period => {
        if (!parsed[selectedYear][period]) parsed[selectedYear][period] = {};
        targetKeys.forEach(key => { 
          parsed[selectedYear][period][key] = parseFloat(editValues[period][key] || "0"); 
        });
      });

      localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
      loadData();
      setTimeout(() => setShowManageModal(false), 300);
    } catch (err) { setActionError('Erro ao salvar os dados.'); } finally { setIsSaving(false); }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('ps_') || 
          key.startsWith('rdqa_') || 
          key.startsWith('ui_') || 
          key.startsWith('cms_') || 
          key.startsWith('dashboard_') ||
          key === 'migration_fix_2026_to_2025'
        )) {
          fullDb[key] = localStorage.getItem(key);
        }
      }

      const payload = { full_db: fullDb, ts: Date.now() };
      const shareId = await syncService.createShare(payload);
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=id_${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e) { 
      console.error(e);
      alert('Falha ao gerar link de sincronização. Tente novamente.'); 
    } finally { 
      setIsSharing(false); 
    }
  };

  const TechnicalDataRow = ({ item }: { item: LayoutItem }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { id, label, keys = [], accentColor = "blue", suffix = "", iconName = "Activity", displayType = 'sum' } = item;
    const Icon = ICON_MAP[iconName] || Activity;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const getMonthlyValue = (periodId: string) => {
      const fullData = JSON.parse(localStorage.getItem('ps_monthly_detailed_stats') || '{}');
      const yearData = fullData[selectedYear] || {};
      return keys.reduce((acc, k) => acc + parseFloat(yearData[periodId]?.[k] || 0), 0);
    };

    // Lógica inteligente de cálculo baseada no displayType
    const isAverage = displayType === 'average' || suffix === '%' || suffix === ' d';
    const totalValue = months.reduce((acc, m) => acc + getMonthlyValue(m), 0);
    
    const monthsWithData = months.filter(m => getMonthlyValue(m) > 0).length;
    const displayValue = isAverage 
      ? (monthsWithData > 0 ? totalValue / monthsWithData : 0)
      : totalValue;

    const colorVariants: any = {
      blue: 'from-blue-600 to-blue-700 text-blue-700 border-blue-100 bg-blue-50',
      orange: 'from-orange-500 to-orange-600 text-orange-700 border-orange-100 bg-orange-50',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-700 border-emerald-100 bg-emerald-50',
      purple: 'from-purple-600 to-purple-700 text-purple-700 border-purple-100 bg-purple-50',
      slate: 'from-slate-600 to-slate-700 text-slate-700 border-slate-100 bg-slate-50',
      red: 'from-red-600 to-red-700 text-red-700 border-red-100 bg-red-50'
    };

    return (
      <div className="group transition-all duration-300 mb-4">
        <div 
          className={`relative overflow-hidden bg-white rounded-[32px] border-2 transition-all cursor-pointer ${isOpen ? 'border-blue-500 shadow-xl scale-[1.01]' : 'border-slate-100 hover:border-blue-200 hover:shadow-lg shadow-sm'}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {editorMode && (
                <div className="p-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-blue-500 shrink-0" onClick={e => e.stopPropagation()}>
                  <GripVertical size={20} />
                </div>
              )}
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${accentColor === 'blue' ? 'from-blue-600 to-blue-700' : accentColor === 'orange' ? 'from-orange-500 to-orange-600' : accentColor === 'emerald' ? 'from-emerald-500 to-emerald-600' : accentColor === 'purple' ? 'from-purple-600 to-purple-700' : accentColor === 'red' ? 'from-red-600 to-red-700' : 'from-slate-600 to-slate-700'} text-white shadow-lg shrink-0 flex items-center justify-center`}>
                {React.createElement(Icon, { size: 28, strokeWidth: 2.5 })}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight truncate">
                   <EditableText id={`row_label_${id}`} defaultText={label || "Novo Indicador"} />
                </h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAverage ? 'Visualização em Média' : 'Acumulado Anual'} {selectedYear}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAverage ? 'Performance' : 'Total'}</p>
                <div className={`text-2xl font-black tabular-nums ${colorVariants[accentColor].split(' ')[2]}`}>
                  {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: isAverage ? 1 : 0, maximumFractionDigits: isAverage ? 2 : 0 })}{suffix}
                </div>
              </div>
              {editorMode && (
                <div className="flex gap-1 border-l border-slate-100 pl-4" onClick={e => e.stopPropagation()}>
                  <button title="Inserir Dados" onClick={(e) => initiateManage(keys, label || "Indicador", e)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all"><Edit3 size={18} /></button>
                  <button title="Configurações" onClick={(e) => { e.stopPropagation(); setConfigItem(item); setShowConfigModal(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><Settings size={18} /></button>
                  <button title="Excluir" onClick={(e) => { e.stopPropagation(); removeBlock(id); }} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={18} /></button>
                </div>
              )}
              <div className={`p-2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                <ChevronDown size={24} />
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 mx-4 p-8 bg-slate-900 rounded-[40px] shadow-2xl animate-scale-in border-4 border-slate-800 relative overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative z-10">
              {months.map(m => (
                <div key={m} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">{m.toUpperCase()}</span>
                  <div className="text-sm font-black text-white tabular-nums">
                    {getMonthlyValue(m).toLocaleString('pt-BR')}{suffix}
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
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-32">
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-6 bg-white text-slate-900 rounded-[32px] shadow-xl shrink-0 transform -rotate-3">
             <Activity size={40} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="main_title_premium" defaultText="Relatório Técnico P.S" />
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <p className="text-blue-400 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em]">
                 <ArrowUpRight size={18} />
                 Gestão Integrada {selectedYear}
              </p>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                 {['2025', '2026', '2027', '2028', '2029'].map(yr => (
                   <button key={yr} onClick={() => setSelectedYear(yr)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{yr}</button>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-3 px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all border-2 shadow-2xl ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={20}/> : shareSuccess ? <CheckCircle size={20}/> : <Share2 size={20} />}
            {shareSuccess ? 'SINC. REALIZADA' : 'SINCRONIZAR PAINEL'}
          </button>
          <button onClick={() => window.print()} className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3">
             <Download size={20} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* RENDERIZADOR DINÂMICO DE LAYOUT */}
      <div className="space-y-2">
        {layout.map((item, index) => (
          <div 
            key={item.id}
            draggable={editorMode}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`transition-all ${editorMode ? 'hover:bg-slate-100/50 rounded-3xl p-1' : ''}`}
          >
            {item.type === 'section' && (
              <div className="flex items-center justify-between mt-16 mb-8 group">
                <div className="flex items-center gap-6 border-l-[16px] pl-6 py-2" style={{ borderLeftColor: item.color }}>
                  {editorMode && <GripVertical className="text-slate-300 -ml-4 mr-2" size={24} />}
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                      <EditableText id={`sec_title_${item.id}`} defaultText={item.title || "Nova Seção"} />
                    </h2>
                  </div>
                  <div className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: item.color }}>
                    {ICON_MAP[item.iconName || 'Activity'] && React.createElement(ICON_MAP[item.iconName || 'Activity'], { size: 32, strokeWidth: 2.5 })}
                  </div>
                </div>
                {editorMode && (
                  <div className="flex gap-2">
                    <button onClick={() => { setConfigItem(item); setShowConfigModal(true); }} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><Settings size={20}/></button>
                    <button onClick={() => removeBlock(item.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                  </div>
                )}
              </div>
            )}

            {item.type === 'subtitle' && (
              <div className="flex items-center justify-between mb-4 mt-8 group">
                <div className="flex items-center gap-4">
                  {editorMode && <GripVertical className="text-slate-200" size={18} />}
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-1 flex items-center gap-2">
                    {React.createElement(ICON_MAP[item.iconName || 'AlignLeft'], { size: 14, className: "opacity-40" })}
                    <EditableText id={`sub_title_${item.id}`} defaultText={item.title || "Novo Subtítulo"} />
                  </h3>
                </div>
                {editorMode && (
                   <div className="flex items-center gap-1">
                      <button onClick={() => { setConfigItem(item); setShowConfigModal(true); }} className="p-2 text-slate-200 hover:text-indigo-400 transition-all"><Settings size={14}/></button>
                      <button onClick={() => removeBlock(item.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                   </div>
                )}
              </div>
            )}

            {item.type === 'indicator' && <TechnicalDataRow item={item} />}
          </div>
        ))}
      </div>

      {/* BARRA DE FERRAMENTAS DO EDITOR */}
      {editorMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-[32px] shadow-2xl flex items-center gap-6 z-[100] animate-slide-up">
          <div className="flex items-center gap-3 px-6 border-r border-white/10">
            <PlusSquare className="text-blue-400" size={24} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Painel de Construção</span>
          </div>
          <button onClick={() => addNewBlock('section')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"><Type size={16}/> Título</button>
          <button onClick={() => addNewBlock('subtitle')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"><AlignLeft size={16}/> Subtítulo</button>
          <button onClick={() => addNewBlock('indicator')} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"><Activity size={16}/> Novo Indicador</button>
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÃO DE BLOCO */}
      {showConfigModal && configItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowConfigModal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-scale-in border border-slate-100">
            <div className="bg-slate-900 p-10 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <Settings size={28} className="text-blue-400" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Configuração Técnica</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)}><X size={32}/></button>
            </div>
            <div className="p-10 space-y-6">
              {configItem.type === 'indicator' && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Unidade / Cálculo</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                         onClick={() => {
                           const newLayout = layout.map(it => it.id === configItem.id ? {...it, displayType: 'sum' as const, suffix: ''} : it);
                           saveLayout(newLayout);
                         }}
                         className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${configItem.displayType === 'sum' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                       >
                         Absoluto (Soma)
                       </button>
                       <button 
                         onClick={() => {
                           const newLayout = layout.map(it => it.id === configItem.id ? {...it, displayType: 'average' as const, suffix: '%'} : it);
                           saveLayout(newLayout);
                         }}
                         className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${configItem.suffix === '%' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                       >
                         Porcentagem (%)
                       </button>
                       <button 
                         onClick={() => {
                           const newLayout = layout.map(it => it.id === configItem.id ? {...it, displayType: 'average' as const, suffix: ''} : it);
                           saveLayout(newLayout);
                         }}
                         className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${configItem.displayType === 'average' && configItem.suffix === '' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                       >
                         Média Simples
                       </button>
                       <button 
                         onClick={() => {
                           const newLayout = layout.map(it => it.id === configItem.id ? {...it, displayType: 'average' as const, suffix: ' d'} : it);
                           saveLayout(newLayout);
                         }}
                         className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${configItem.suffix === ' d' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                       >
                         Temporal (Dias)
                       </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">ID Único do Banco (Chave)</label>
                    <input 
                      type="text" 
                      value={configItem.keys?.join(',')} 
                      onChange={(e) => {
                        const newLayout = layout.map(it => it.id === configItem.id ? {...it, keys: e.target.value.split(',')} : it);
                        saveLayout(newLayout);
                      }}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sufixo Manual</label>
                      <input 
                        type="text" 
                        value={configItem.suffix || ""} 
                        onChange={(e) => saveLayout(layout.map(it => it.id === configItem.id ? {...it, suffix: e.target.value} : it))}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none"
                        placeholder="Ex: d, h, %"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estilo Visual</label>
                      <select 
                        value={configItem.accentColor} 
                        onChange={(e) => saveLayout(layout.map(it => it.id === configItem.id ? {...it, accentColor: e.target.value} : it))}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-blue-500 outline-none"
                      >
                        <option value="blue">Padrão PS (Azul)</option><option value="red">Crítico (Vermelho)</option><option value="orange">Alerta (Laranja)</option><option value="emerald">Eficiente (Verde)</option><option value="purple">Especial (Roxo)</option><option value="slate">Suporte (Cinza)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {(configItem.type === 'section' || configItem.type === 'subtitle') && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cor de Identificação</label>
                  <input 
                    type="color" 
                    value={configItem.color} 
                    onChange={(e) => saveLayout(layout.map(it => it.id === configItem.id ? {...it, color: e.target.value} : it))}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>
              )}
              <div className="pt-6">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Seletor de Ícone</label>
                 <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    {Object.keys(ICON_MAP).map(iName => (
                      <button 
                        key={iName}
                        onClick={() => saveLayout(layout.map(it => it.id === configItem.id ? {...it, iconName: iName} : it))}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${configItem.iconName === iName ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
                      >
                        {React.createElement(ICON_MAP[iName], { size: 20 })}
                      </button>
                    ))}
                 </div>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl mt-4">Confirmar Configuração</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE VALORES (Pencil icon) */}
      {showManageModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => !isSaving && setShowManageModal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-slate-100">
            <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-2xl transform -rotate-6"><Edit3 size={36}/></div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Inserir Dados</h3>
                   <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-3">{targetLabel} — Exercício {selectedYear}</p>
                 </div>
               </div>
               <button onClick={() => !isSaving && setShowManageModal(false)} className="p-4 hover:bg-white/10 rounded-full transition-all border-2 border-white/5"><X size={44} /></button>
            </div>
            <div className="p-12 overflow-y-auto bg-slate-50/50 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(period => (
                   <div key={period} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-4">
                     <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest text-center border-b pb-3 mb-2">{period.toUpperCase()}</label>
                     {targetKeys.map(key => (
                       <input 
                         key={key}
                         type="number" 
                         value={editValues[period]?.[key] || "0"} 
                         onChange={(e) => setEditValues({ ...editValues, [period]: { ...editValues[period], [key]: e.target.value } })}
                         className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-slate-900 text-lg focus:border-blue-500 outline-none transition-all tabular-nums"
                       />
                     ))}
                   </div>
                 ))}
               </div>
               <div className="mt-16 pt-10 border-t-4 border-dashed border-slate-200 max-w-lg mx-auto text-center">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><AlertCircle size={32}/></div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.3em]">Autenticação do Conselho</label>
                 <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-6 bg-white border-4 border-slate-100 rounded-[32px] outline-none focus:border-blue-500 text-center font-black text-3xl tracking-[0.5em] shadow-inner" placeholder="****" />
                 {actionError && <p className="text-red-500 text-xs font-black mt-6 uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse"><AlertCircle size={18}/> {actionError}</p>}
               </div>
            </div>
            <div className="p-12 bg-white border-t-2 border-slate-50 flex gap-6 shrink-0">
              <button onClick={() => !isSaving && setShowManageModal(false)} className="flex-1 py-7 rounded-[32px] font-black text-slate-500 bg-slate-50 border-2 border-slate-100 uppercase tracking-widest text-xs hover:bg-slate-100 transition-all">Descartar</button>
              <button onClick={saveChanges} disabled={isSaving} className="flex-[2] py-7 rounded-[32px] font-black bg-blue-600 text-white shadow-2xl shadow-blue-300 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all transform active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
                {isSaving ? 'PROCESSANDO...' : 'ATUALIZAR DADOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 50px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
};

export default Dashboard;
