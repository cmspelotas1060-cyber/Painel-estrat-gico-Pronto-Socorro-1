
import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  ChevronDown, ChevronUp, Calendar, Download, Trash2, X, AlertCircle, 
  Lock, Edit3, Save, Copy, MessageSquare, Share2, Loader2, CheckCircle,
  FileText, Zap, Ruler, BedDouble, Microscope, Pill, HeartPulse, Plus, PlusCircle
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const INITIAL_AGGREGATED_STATS = {
  i1_acolhimento: 0, i1_consultas: 0,
  i2_consultas_psp: 0, i2_upa_areal: 0, i2_traumato_sc: 0, i2_ubs: 0,
  i3_ubs: 0, i3_traumato_sc: 0, i3_pouco_urgente: 0, i3_urgencia: 0, i3_emergencia: 0, i3_upa: 0,
  i4_pelotas: 0, i4_outros_municipios: 0,
  i5_bucomaxilo: 0, i5_cirurgia_vascular: 0, i5_clinica_medica: 0, i5_ginecologia: 0, i5_pediatria: 0, i5_servico_social: 0,
  i6_samu: 0, i6_ecosul: 0, i6_brigada_militar: 0, i6_susepe: 0, i6_policia_civil: 0,
  i7_ac_bicicleta: 0, i7_ac_caminhao: 0, i7_ac_carro: 0, i7_ac_moto: 0, i7_ac_onibus: 0, i7_atropelamento: 0, i7_ac_charrete: 0, i7_ac_trator: 0,
  i8_ac_trabalho: 0, i8_afogamento: 0, i8_agressao: 0, i8_choque_eletrico: 0, i8_queda: 0, i8_queimadura: 0,
  i9_arma_fogo: 0, i9_arma_branca: 0,
  i10_clinico_adulto: 0, i10_uti_adulto: 0, i10_pediatria: 0, i10_uti_pediatria: 0,
  i11_mp_clinico_adulto: 0, i11_mp_uti_adulto: 0, i11_mp_pediatria: 0, i11_mp_uti_pediatria: 0,
  i12_aguardando_leito: 0, i12_alta: 0, i12_bloco_cirurgico: 0,
  i13_permanencia_oncologico: 0,
  i14_laboratoriais: 0, i14_transfuscoes: 0,
  i15_tomografias: 0, i15_angiotomografia: 0, i15_raio_x: 0,
  i16_endoscopia: 0, i16_oftalmo: 0, i16_otorrino: 0, i16_ultrasson: 0, i16_urologia: 0
};

const MONTHS_IDS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const PERIOD_OPTIONS = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' }
];

const SectionHeader = ({ id, icon: Icon, title, color, isRemovable, onRemove }: { id: string, icon: any, title: string, color: string, isRemovable?: boolean, onRemove?: () => void }) => {
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  useEffect(() => {
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  return (
    <div className="flex items-center justify-between mb-8 group">
      <div className="flex items-center gap-4 border-l-[12px] pl-5 py-1 transition-all" style={{ borderLeftColor: color }}>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          <EditableText id={`sec_title_${id}`} defaultText={title} />
        </h2>
        <div className="opacity-20 group-hover:opacity-100 transition-opacity" style={{ color }}>
          <Icon size={24} />
        </div>
      </div>
      {editorMode && isRemovable && (
        <button onClick={onRemove} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
};

const Card = ({ id, title, children, className = "", onAddItem }: { id: string, title?: string, children?: React.ReactNode, className?: string, onAddItem?: () => void }) => {
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  useEffect(() => {
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  return (
    <div className={`bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col break-inside-avoid ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
            <EditableText id={`card_title_${id}`} defaultText={title} />
          </h3>
          {editorMode && onAddItem && (
            <button onClick={onAddItem} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Adicionar Item">
              <PlusCircle size={16} />
            </button>
          )}
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState(INITIAL_AGGREGATED_STATS);
  const [rawData, setRawData] = useState<any>({});
  const [showManageModal, setShowManageModal] = useState(false);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({}); 
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  // Estado para itens personalizados e excluídos
  const [hiddenRows, setHiddenRows] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_hidden_rows');
    return saved ? JSON.parse(saved) : [];
  });
  const [customRowsByCard, setCustomRowsByCard] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('dashboard_custom_rows');
    return saved ? JSON.parse(saved) : {};
  });

  const [showAddItemModal, setShowAddItemModal] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({ label: '', key: '', color: 'blue' });

  const [customSections, setCustomSections] = useState<{id: string, title: string}[]>(() => {
    const saved = localStorage.getItem('dashboard_custom_sections');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    calculateStats();
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const calculateStats = () => {
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    const parsed = savedDetailedStats ? JSON.parse(savedDetailedStats) : {};
    setRawData(parsed);

    const aggregated = { ...INITIAL_AGGREGATED_STATS };
    const averageKeys = [
      'i10_clinico_adulto', 'i10_uti_adulto', 'i10_pediatria', 'i10_uti_pediatria',
      'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria'
    ];
    const counts: Record<string, number> = {};
    averageKeys.forEach(key => counts[key] = 0);
    
    MONTHS_IDS.forEach((periodId) => {
      const periodData = parsed[periodId] || {};
      // Also aggregate any custom keys present in rawData
      Object.keys(periodData).forEach(key => {
        if (!aggregated.hasOwnProperty(key)) {
           (aggregated as any)[key] = 0;
        }
      });

      Object.keys(aggregated).forEach((key) => {
        if (typeof (aggregated as any)[key] === 'number') {
          const val = parseFloat(periodData[key] || 0);
          (aggregated as any)[key] += val;
          if (averageKeys.includes(key) && val > 0) counts[key]++;
        }
      });
    });
    
    averageKeys.forEach(key => {
      if (counts[key] > 0) {
         const avg = (aggregated as any)[key] / counts[key];
         (aggregated as any)[key] = parseFloat(avg.toFixed(1));
      }
    });
    setData(aggregated);
  };

  const addCustomSection = () => {
    const newSection = { id: `custom_${Date.now()}`, title: 'Nova Seção Analítica' };
    const updated = [...customSections, newSection];
    setCustomSections(updated);
    localStorage.setItem('dashboard_custom_sections', JSON.stringify(updated));
  };

  const removeCustomSection = (id: string) => {
    if(!confirm("Deseja remover este bloco de análise?")) return;
    const updated = customSections.filter(s => s.id !== id);
    setCustomSections(updated);
    localStorage.setItem('dashboard_custom_sections', JSON.stringify(updated));
  };

  const toggleRowVisibility = (rowId: string) => {
    if (!confirm("Deseja realmente remover este item do relatório?")) return;
    const newHidden = hiddenRows.includes(rowId) 
      ? hiddenRows.filter(id => id !== rowId) 
      : [...hiddenRows, rowId];
    setHiddenRows(newHidden);
    localStorage.setItem('dashboard_hidden_rows', JSON.stringify(newHidden));
  };

  const addNewItemToCard = () => {
    if (!newItemData.label || !newItemData.key || !showAddItemModal) return;
    const cardId = showAddItemModal;
    const newRow = {
      id: `custom_row_${Date.now()}`,
      label: newItemData.label,
      key: newItemData.key,
      color: newItemData.color
    };
    
    const updated = { 
      ...customRowsByCard, 
      [cardId]: [...(customRowsByCard[cardId] || []), newRow] 
    };
    setCustomRowsByCard(updated);
    localStorage.setItem('dashboard_custom_rows', JSON.stringify(updated));
    setShowAddItemModal(null);
    setNewItemData({ label: '', key: '', color: 'blue' });
  };

  const removeCustomRow = (cardId: string, rowId: string) => {
    if (!confirm("Deseja excluir este item personalizado?")) return;
    const updatedRows = (customRowsByCard[cardId] || []).filter(r => r.id !== rowId);
    const updated = { ...customRowsByCard, [cardId]: updatedRows };
    setCustomRowsByCard(updated);
    localStorage.setItem('dashboard_custom_rows', JSON.stringify(updated));
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
      const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
      let parsed = savedDetailedStats ? JSON.parse(savedDetailedStats) : {};

      PERIOD_OPTIONS.forEach(period => {
        if (!parsed[period.id]) parsed[period.id] = {};
        targetKeys.forEach(key => {
          parsed[period.id][key] = parseFloat(editValues[period.id][key] || "0");
        });
      });

      localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
      calculateStats();
      
      await new Promise(r => setTimeout(r, 500));
      setShowManageModal(false);
    } catch (err) {
      setActionError('Erro ao salvar no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb = {
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        rdqa_full_indicators: localStorage.getItem('rdqa_full_indicators'),
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link'),
        ps_ppa_full_data_v2: localStorage.getItem('ps_ppa_full_data_v2'),
        ps_ppa_axis_order: localStorage.getItem('ps_ppa_axis_order'),
        dashboard_custom_sections: localStorage.getItem('dashboard_custom_sections'),
        dashboard_hidden_rows: localStorage.getItem('dashboard_hidden_rows'),
        dashboard_custom_rows: localStorage.getItem('dashboard_custom_rows')
      };
      
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...[...new Uint8Array(compressedBuffer)])).replace(/\+/g, '-').replace(/\//g, '_');

      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e) {
      alert('Falha ao gerar link estratégico.');
    } finally {
      setIsSharing(false);
    }
  };

  const DataRow = ({ id, label, value, keys, accentColor = "blue", showTotal = true, suffix = "", isCustom = false, onRemove, allowExpand = true }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-50 border-blue-100', 
      red: 'text-red-700 bg-red-50 border-red-100', 
      orange: 'text-orange-700 bg-orange-50 border-orange-100',
      green: 'text-emerald-700 bg-emerald-50 border-emerald-100', 
      purple: 'text-purple-700 bg-purple-50 border-purple-100', 
      slate: 'text-slate-700 bg-slate-100 border-slate-200'
    };

    const getMonthlyValue = (periodId: string) => {
      let total = 0;
      keys.forEach((key: string) => {
        total += parseFloat(rawData[periodId]?.[key] || 0);
      });
      return total;
    };

    if (hiddenRows.includes(id) && !isCustom) return null;

    return (
      <div className="group transition-all duration-200">
        <div 
          className={`flex items-center justify-between p-3 rounded-xl border border-transparent ${allowExpand ? 'cursor-pointer ' + (isOpen ? 'bg-slate-50 border-slate-100 shadow-sm' : 'hover:bg-slate-50') : 'cursor-default'}`} 
          onClick={() => allowExpand && setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 flex-1">
            {allowExpand && (
              <div className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                <ChevronDown size={14} className="text-slate-400"/>
              </div>
            )}
            <span className="text-sm font-bold text-slate-600 tracking-tight">
              {isCustom ? label : <EditableText id={`row_label_${id}`} defaultText={label} />}
            </span>
            {editorMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => initiateManage(keys, label, e)} 
                  className="p-1.5 text-slate-300 hover:text-blue-600 transition-all"
                >
                  <Edit3 size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemove ? onRemove() : toggleRowVisibility(id); }}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
          {showTotal && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-black border ${colorMap[accentColor]}`}>
              {typeof value === 'number' ? Math.floor(value).toLocaleString('pt-BR') : value}{suffix}
            </div>
          )}
        </div>

        {isOpen && allowExpand && (
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in border-x border-b border-slate-100 rounded-b-xl mb-2 bg-white/50">
            {PERIOD_OPTIONS.map(period => (
              <div key={period.id} className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-50 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{period.label.substring(0,3)}</span>
                <span className={`text-[11px] font-black ${colorMap[accentColor].split(' ')[0]}`}>
                  {Math.floor(getMonthlyValue(period.id)).toLocaleString('pt-BR')}{suffix}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* NOVO HEADER PADRONIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <Activity size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="main_title" defaultText="Relatório Técnico P.S" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
               <Calendar size={16} className="text-blue-500"/>
               <EditableText id="main_subtitle" defaultText="Monitoramento Consolidado 2025" />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative shrink-0">
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black transition-all border-2 shadow-xl ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK ATUALIZADO' : 'GERAR LINK ESTRATÉGICO'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl"><Download size={18} /> Exportar PDF</button>
        </div>
      </div>

      {/* BLOCO 1: FLUXO E DEMANDA */}
      <div>
        <SectionHeader id="fluxo" icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card id="vol_atendimento" title="Volume de Atendimento" onAddItem={() => setShowAddItemModal('vol_atendimento')}>
            <div className="grid grid-cols-2 gap-3 p-2">
               <div className="bg-blue-50 rounded-[20px] p-5 text-center border border-blue-100 shadow-sm relative group/stat">
                  {editorMode && (
                    <button 
                      onClick={(e) => initiateManage(['i1_acolhimento'], 'Acolhimentos', e)} 
                      className="absolute top-2 right-2 p-1 text-blue-400 opacity-0 group-hover/stat:opacity-100 transition-opacity hover:text-blue-600"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                  <div className="text-3xl font-black text-blue-700 mb-1">{data.i1_acolhimento.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    <EditableText id="label_acolhimentos" defaultText="Acolhimentos" />
                  </div>
               </div>
               <div className="bg-indigo-50 rounded-[20px] p-5 text-center border border-indigo-100 shadow-sm relative group/stat">
                  {editorMode && (
                    <button 
                      onClick={(e) => initiateManage(['i1_consultas'], 'Consultas', e)} 
                      className="absolute top-2 right-2 p-1 text-indigo-400 opacity-0 group-hover/stat:opacity-100 transition-opacity hover:text-indigo-600"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                  <div className="text-3xl font-black text-indigo-700 mb-1">{data.i1_consultas.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    <EditableText id="label_consultas" defaultText="Consultas" />
                  </div>
               </div>
            </div>
            <div className="p-2 space-y-1">
               {(customRowsByCard['vol_atendimento'] || []).map(row => (
                 <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('vol_atendimento', row.id)} />
               ))}
            </div>
          </Card>
          <Card id="procedencia" title="Procedência Original" onAddItem={() => setShowAddItemModal('procedencia')}>
             <div className="p-2 space-y-1">
                <DataRow id="pro_pelotas" label="Pelotas" value={data.i4_pelotas} keys={['i4_pelotas']} accentColor="blue" />
                <DataRow id="pro_outros" label="Outros Municípios" value={data.i4_outros_municipios} keys={['i4_outros_municipios']} accentColor="slate" />
                {(customRowsByCard['procedencia'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('procedencia', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="encaminhamentos" title="Encaminhamentos Pós-Triagem" onAddItem={() => setShowAddItemModal('encaminhamentos')}>
             <div className="p-2 space-y-1">
                <DataRow id="enc_psp" label="PSP" value={data.i2_consultas_psp} keys={['i2_consultas_psp']} accentColor="blue" allowExpand={false} />
                <DataRow id="enc_upa" label="UPA Areal" value={data.i2_upa_areal} keys={['i2_upa_areal']} accentColor="orange" allowExpand={false} />
                <DataRow id="enc_ubs" label="UBS / Redes" value={data.i2_ubs} keys={['i2_ubs']} accentColor="green" allowExpand={false} />
                {(customRowsByCard['encaminhamentos'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('encaminhamentos', row.id)} allowExpand={false} />
                ))}
             </div>
          </Card>
        </div>
        <DynamicNotes sectionId="fluxo" />
      </div>

      {/* BLOCO 2: RISCO E GRAVIDADE */}
      <div>
        <SectionHeader id="risco" icon={Activity} title="Classificação de Risco" color="#f59e0b" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card id="prioridades" title="Prioridades de Atendimento" onAddItem={() => setShowAddItemModal('prioridades')}>
             <div className="p-2 space-y-1">
                <DataRow id="ris_vermelho" label="Emergência (Vermelho)" value={data.i3_emergencia} keys={['i3_emergencia']} accentColor="red" />
                <DataRow id="ris_amarelo" label="Urgência (Amarelo)" value={data.i3_urgencia} keys={['i3_urgencia']} accentColor="orange" />
                <DataRow id="ris_verde" label="Pouco Urgente (Verde/Azul)" value={data.i3_pouco_urgente} keys={['i3_pouco_urgente']} accentColor="green" />
                <DataRow id="ris_outros" label="UPA / Traumato" value={data.i3_upa + data.i3_traumato_sc} keys={['i3_upa', 'i3_traumato_sc']} accentColor="slate" />
                {(customRowsByCard['prioridades'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('prioridades', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="especialidades" title="Especialidades" onAddItem={() => setShowAddItemModal('especialidades')}>
             <div className="p-2 space-y-1">
                <DataRow id="esp_clinica" label="Clínica Médica" value={data.i5_clinica_medica} keys={['i5_clinica_medica']} accentColor="blue" />
                <DataRow id="esp_pediatria" label="Pediatria" value={data.i5_pediatria} keys={['i5_pediatria']} accentColor="purple" />
                <DataRow id="esp_buco" label="Bucomaxilo" value={data.i5_bucomaxilo} keys={['i5_bucomaxilo']} accentColor="slate" />
                <DataRow id="esp_vascular" label="Cirurgia Vascular" value={data.i5_cirurgia_vascular} keys={['i5_cirurgia_vascular']} accentColor="slate" />
                <DataRow id="esp_social" label="Serviço Social" value={data.i5_servico_social} keys={['i5_servico_social']} accentColor="slate" />
                {(customRowsByCard['especialidades'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('especialidades', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="transporte" title="Transporte e Resgate" onAddItem={() => setShowAddItemModal('transporte')}>
             <div className="p-2 space-y-1">
                <DataRow id="tra_samu" label="SAMU" value={data.i6_samu} keys={['i6_samu']} accentColor="red" />
                <DataRow id="tra_ecosul" label="Ecosul" value={data.i6_ecosul} keys={['i6_ecosul']} accentColor="orange" />
                <DataRow id="tra_seguranca" label="Órgãos Segurança" value={data.i6_brigada_militar + data.i6_policia_civil} keys={['i6_brigada_militar', 'i6_policia_civil']} accentColor="slate" />
                {(customRowsByCard['transporte'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('transporte', row.id)} />
                ))}
             </div>
          </Card>
        </div>
        <DynamicNotes sectionId="risco" />
      </div>

      {/* BLOCO 3: TRAUMAS E VIOLÊNCIA */}
      <div>
        <SectionHeader id="traumas" icon={AlertTriangle} title="Causas Externas (Traumas)" color="#ef4444" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card id="transito" title="Acidentes de Trânsito" onAddItem={() => setShowAddItemModal('transito')}>
             <div className="p-2 space-y-1">
                <DataRow id="tr_moto" label="Moto" value={data.i7_ac_moto} keys={['i7_ac_moto']} accentColor="red" />
                <DataRow id="tr_carro" label="Carro / Caminhão" value={data.i7_ac_carro + data.i7_ac_caminhao} keys={['i7_ac_carro', 'i7_ac_caminhao']} accentColor="orange" />
                <DataRow id="tr_bicicleta" label="Bicicleta" value={data.i7_ac_bicicleta} keys={['i7_ac_bicicleta']} accentColor="orange" />
                <DataRow id="tr_atropelamento" label="Atropelamentos" value={data.i7_atropelamento} keys={['i7_atropelamento']} accentColor="red" />
                {(customRowsByCard['transito'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('transito', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="outros_ac" title="Outros Acidentes" onAddItem={() => setShowAddItemModal('outros_ac')}>
             <div className="p-2 space-y-1">
                <DataRow id="ac_quedas" label="Quedas" value={data.i8_queda} keys={['i8_queda']} accentColor="orange" />
                <DataRow id="ac_agressao" label="Agressão Física" value={data.i8_agressao} keys={['i8_agressao']} accentColor="red" />
                <DataRow id="ac_trabalho" label="Acidente de Trabalho" value={data.i8_ac_trabalho} keys={['i8_ac_trabalho']} accentColor="slate" />
                {(customRowsByCard['outros_ac'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('outros_ac', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="violencia" title="Violência / Armas" onAddItem={() => setShowAddItemModal('violencia')}>
             <div className="p-2 space-y-1">
                <DataRow id="v_fogo" label="Arma de Fogo" value={data.i9_arma_fogo} keys={['i9_arma_fogo']} accentColor="red" />
                <DataRow id="v_branca" label="Arma Branca" value={data.i9_arma_branca} keys={['i9_arma_branca']} accentColor="red" />
                {(customRowsByCard['violencia'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('violencia', row.id)} />
                ))}
             </div>
          </Card>
        </div>
        <DynamicNotes sectionId="traumas" />
      </div>

      {/* BLOCO 4: LEITOS E INTERNAÇÃO */}
      <div>
        <SectionHeader id="leitos" icon={BedDouble} title="Gestão de Leitos" color="#8b5cf6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card id="ocupacao" title="Taxa de Ocupação Média" onAddItem={() => setShowAddItemModal('ocupacao')}>
             <div className="p-2 space-y-1">
                <DataRow id="oc_clinico" label="Leito Clínico Adulto" value={data.i10_clinico_adulto} keys={['i10_clinico_adulto']} accentColor="purple" suffix="%" />
                <DataRow id="oc_uti" label="UTI Adulto" value={data.i10_uti_adulto} keys={['i10_uti_adulto']} accentColor="red" suffix="%" />
                <DataRow id="oc_ped" label="Leito Pediatria" value={data.i10_pediatria} keys={['i10_pediatria']} accentColor="blue" suffix="%" />
                {(customRowsByCard['ocupacao'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} suffix="%" onRemove={() => removeCustomRow('ocupacao', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="permanencia" title="Média Permanência Aguardando" onAddItem={() => setShowAddItemModal('permanencia')}>
             <div className="p-2 space-y-1">
                <DataRow id="pm_clinico" label="Clínico Adulto" value={data.i11_mp_clinico_adulto} keys={['i11_mp_clinico_adulto']} accentColor="slate" suffix=" d" />
                <DataRow id="pm_uti" label="UTI Adulto" value={data.i11_mp_uti_adulto} keys={['i11_mp_uti_adulto']} accentColor="red" suffix=" d" />
                {(customRowsByCard['permanencia'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} suffix=" d" onRemove={() => removeCustomRow('permanencia', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="fluxo_internacao" title="Fluxo e Especialidades" onAddItem={() => setShowAddItemModal('fluxo_internacao')}>
             <div className="p-2 space-y-1">
                <DataRow id="fi_aguarda" label="Aguardando Leito" value={data.i12_aguardando_leito} keys={['i12_aguardando_leito']} accentColor="orange" />
                <DataRow id="fi_alta" label="Altas Registradas" value={data.i12_alta} keys={['i12_alta']} accentColor="green" />
                <DataRow id="fi_onco" label="Permanência Oncológico" value={data.i13_permanencia_oncologico} keys={['i13_permanencia_oncologico']} accentColor="purple" suffix=" d" />
                {(customRowsByCard['fluxo_internacao'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('fluxo_internacao', row.id)} />
                ))}
             </div>
          </Card>
        </div>
        <DynamicNotes sectionId="leitos" />
      </div>

      {/* BLOCO 5: APOIO DIAGNÓSTICO */}
      <div>
        <SectionHeader id="diag" icon={Microscope} title="Suporte e Exames" color="#10b981" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card id="analises" title="Análises e Hemoterapia" onAddItem={() => setShowAddItemModal('analises')}>
             <div className="p-2 space-y-1">
                <DataRow id="an_lab" label="Exames Laboratoriais" value={data.i14_laboratoriais} keys={['i14_laboratoriais']} accentColor="green" />
                <DataRow id="an_trans" label="Transfusões" value={data.i14_transfuscoes} keys={['i14_transfuscoes']} accentColor="red" />
                {(customRowsByCard['analises'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('analises', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="imagem" title="Exames de Imagem" onAddItem={() => setShowAddItemModal('imagem')}>
             <div className="p-2 space-y-1">
                <DataRow id="im_tomo" label="Tomografias" value={data.i15_tomografias} keys={['i15_tomografias']} accentColor="blue" />
                <DataRow id="im_rx" label="Raio X" value={data.i15_raio_x} keys={['i15_raio_x']} accentColor="slate" />
                <DataRow id="im_angio" label="Angiotomografias" value={data.i15_angiotomografia} keys={['i15_angiotomografia']} accentColor="blue" />
                {(customRowsByCard['imagem'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('imagem', row.id)} />
                ))}
             </div>
          </Card>
          <Card id="especiais" title="Especialidades Diagnósticas" onAddItem={() => setShowAddItemModal('especiais')}>
             <div className="p-2 space-y-1">
                <DataRow id="esp_ultra" label="Ultrassonografia" value={data.i16_ultrasson} keys={['i16_ultrasson']} accentColor="green" />
                <DataRow id="esp_endo" label="Endoscopia" value={data.i16_ultrasson} keys={['i16_ultrasson']} accentColor="purple" />
                <DataRow id="esp_ofta" label="Oftalmo / Otorrino" value={data.i16_oftalmo + data.i16_otorrino} keys={['i16_oftalmo', 'i16_otorrino']} accentColor="blue" />
                {(customRowsByCard['especiais'] || []).map(row => (
                  <DataRow key={row.id} id={row.id} label={row.label} value={(data as any)[row.key] || 0} keys={[row.key]} accentColor={row.color} isCustom={true} onRemove={() => removeCustomRow('especiais', row.id)} />
                ))}
             </div>
          </Card>
        </div>
        <DynamicNotes sectionId="diag" />
      </div>

      {/* SEÇÕES CUSTOMIZADAS (DINÂMICAS) */}
      {customSections.map((section) => (
        <div key={section.id} className="animate-fade-in">
          <SectionHeader 
            id={section.id} 
            icon={FileText} 
            title={section.title} 
            color="#64748b" 
            isRemovable={true} 
            onRemove={() => removeCustomSection(section.id)}
          />
          <DynamicNotes sectionId={section.id} />
        </div>
      ))}

      {/* BOTÃO ADICIONAR SEÇÃO (MODO EDITOR) */}
      {editorMode && (
        <div className="flex justify-center pt-8 print:hidden">
          <button 
            onClick={addCustomSection}
            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
          >
            <Plus size={24} />
            Acrescentar Bloco de Análise
          </button>
        </div>
      )}

      {/* MODAL ADICIONAR ITEM A UM CARD */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddItemModal(null)}></div>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 p-8 border border-slate-100 animate-fade-in">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">Novo Indicador no Card</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome do Indicador</label>
                <input 
                  type="text" 
                  value={newItemData.label} 
                  onChange={(e) => setNewItemData({...newItemData, label: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  placeholder="Ex: Consultas Oftalmo"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Chave Técnica (ID Único)</label>
                <input 
                  type="text" 
                  value={newItemData.key} 
                  onChange={(e) => setNewItemData({...newItemData, key: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  placeholder="Ex: i17_oftalmo"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cor de Destaque</label>
                <select 
                  value={newItemData.color} 
                  onChange={(e) => setNewItemData({...newItemData, color: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="blue">Azul</option>
                  <option value="red">Vermelho</option>
                  <option value="orange">Laranja</option>
                  <option value="green">Verde</option>
                  <option value="purple">Roxo</option>
                  <option value="slate">Cinza</option>
                </select>
              </div>
              <button 
                onClick={addNewItemToCard}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl transition-all mt-4"
              >
                Cadastrar Indicador
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !isSaving && setShowManageModal(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-100">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Edit3 size={24}/></div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Ajuste Técnico Consolidado</h3>
                   <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">{targetLabel}</p>
                 </div>
               </div>
               <button onClick={() => !isSaving && setShowManageModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {PERIOD_OPTIONS.map(period => (
                   <div key={period.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b pb-2 mb-2">{period.label}</label>
                     {targetKeys.map(key => (
                       <div key={key}>
                         <span className="text-[8px] font-bold text-slate-400 uppercase mb-1 block">
                            {key.replace('i1_', '').replace('i2_', '').replace('i3_', '').replace('i10_', '').replace('i11_', '').replace('_', ' ')}
                         </span>
                         <input 
                           type="number" 
                           value={editValues[period.id]?.[key] || "0"} 
                           onChange={(e) => setEditValues({
                             ...editValues, 
                             [period.id]: { ...editValues[period.id], [key]: e.target.value }
                           })}
                           className="w-full bg-white border border-slate-200 rounded-lg p-2 font-black text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
               <div className="mt-10 pt-6 border-t border-slate-100 max-w-md mx-auto">
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Lock size={12} className="text-blue-500"/> Autorização do Conselho</label>
                 <input 
                   type="password" 
                   value={adminPassword} 
                   onChange={(e) => setAdminPassword(e.target.value)}
                   className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-center text-lg"
                   placeholder="Digite a Senha Mestre"
                 />
                 {actionError && <p className="text-red-500 text-[10px] font-black mt-3 uppercase tracking-tighter flex items-center justify-center gap-2 animate-pulse"><AlertCircle size={14}/> {actionError}</p>}
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t flex gap-4">
              <button 
                onClick={() => !isSaving && setShowManageModal(false)} 
                disabled={isSaving}
                className="flex-1 py-5 rounded-2xl font-black text-slate-500 bg-white border border-slate-200 uppercase tracking-widest text-xs hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={saveChanges} 
                disabled={isSaving}
                className="flex-1 py-5 rounded-2xl font-black bg-blue-600 text-white shadow-2xl shadow-blue-200 uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all transform active:scale-95 disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {isSaving ? 'SALVANDO...' : 'SINCRONIZAR TUDO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
