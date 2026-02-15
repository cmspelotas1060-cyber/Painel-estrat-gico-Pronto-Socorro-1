
import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  ChevronDown, Calendar, Download, Trash2, X, AlertCircle, 
  Lock, Edit3, Save, Share2, Loader2, CheckCircle,
  FileText, Zap, BedDouble, Microscope, Plus, PlusCircle,
  ArrowUpRight, Trophy, BarChart3, Pill, HeartPulse,
  Target, TrendingDown, Home, Building2, HeartHandshake,
  Shield, UserCheck, Bike, Truck, Car, Scissors, Droplets,
  Eye, Search, SearchCode, Bone
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const INITIAL_AGGREGATED_STATS = {
  i1_acolhimento: 0, i1_consultas: 0,
  i2_consultas_psp: 0, i2_upa_areal: 0, i2_traumato_sc: 0, i2_ubs: 0,
  i3_ubs: 0, i3_traumato_sc: 0, i3_pouco_urgente: 0, i3_urgencia: 0, i3_emergencia: 0, i3_upa: 0,
  i4_pelotas: 0, i4_outros_municipios: 0,
  i5_bucomaxilo: 0, i5_cirurgia_vascular: 0, i5_clinica_medica: 0, i5_ginecclogia: 0, i5_pediatria: 0, i5_servico_social: 0,
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
    <div className="flex items-center justify-between mb-10 mt-16 first:mt-0 group">
      <div className="flex items-center gap-6 border-l-[16px] pl-6 py-2 transition-all" style={{ borderLeftColor: color }}>
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">
            <EditableText id={`sec_title_${id}`} defaultText={title} />
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Indicadores Estratégicos Ativos</p>
        </div>
        <div className="opacity-10 group-hover:opacity-100 transition-opacity" style={{ color }}>
          <Icon size={32} />
        </div>
      </div>
      {editorMode && isRemovable && (
        <button onClick={onRemove} className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={24} />
        </button>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState(INITIAL_AGGREGATED_STATS);
  const [rawData, setRawData] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState('2025');
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

  const [hiddenRows, setHiddenRows] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_hidden_rows');
    return saved ? JSON.parse(saved) : [];
  });

  const [customSections, setCustomSections] = useState<{id: string, title: string}[]>(() => {
    const saved = localStorage.getItem('dashboard_custom_sections');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    calculateStats();
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, [selectedYear]);

  const calculateStats = () => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (!saved) return;
    
    const parsed = JSON.parse(saved);
    let yearData: any = {};
    
    // Migração/Detecção de formato multi-ano
    if (parsed.jan || parsed.feb) {
      // Formato antigo, só tem 2025
      yearData = selectedYear === '2025' ? parsed : {};
    } else {
      yearData = parsed[selectedYear] || {};
    }

    setRawData(yearData);
    const aggregated = { ...INITIAL_AGGREGATED_STATS };

    const averageKeys = [
      'i10_clinico_adulto', 'i10_uti_adulto', 'i10_pediatria', 'i10_uti_pediatria',
      'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria',
      'i13_permanencia_oncologico'
    ];

    const counts: Record<string, number> = {};
    averageKeys.forEach(key => counts[key] = 0);
    
    MONTHS_IDS.forEach((periodId) => {
      const periodData = yearData[periodId] || {};
      Object.keys(aggregated).forEach((key) => {
        const val = parseFloat(periodData[key] || 0);
        (aggregated as any)[key] += val;
        if (averageKeys.includes(key) && val > 0) counts[key]++;
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

  const toggleRowVisibility = (rowId: string) => {
    if (!confirm("Deseja realmente remover este item do relatório?")) return;
    const newHidden = hiddenRows.includes(rowId) ? hiddenRows.filter(id => id !== rowId) : [...hiddenRows, rowId];
    setHiddenRows(newHidden);
    localStorage.setItem('dashboard_hidden_rows', JSON.stringify(newHidden));
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
    if (adminPassword !== 'Conselho@2026') { setActionError('Senha incorreta.'); return; }
    setIsSaving(true);
    try {
      const saved = localStorage.getItem('ps_monthly_detailed_stats');
      let parsed = saved ? JSON.parse(saved) : {};
      
      // Ajuste para formato multi-ano ao salvar
      if (parsed.jan || parsed.feb) parsed = { "2025": parsed };
      if (!parsed[selectedYear]) parsed[selectedYear] = {};

      PERIOD_OPTIONS.forEach(period => {
        if (!parsed[selectedYear][period.id]) parsed[selectedYear][period.id] = {};
        targetKeys.forEach(key => { parsed[selectedYear][period.id][key] = parseFloat(editValues[period.id][key] || "0"); });
      });
      localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
      calculateStats();
      setTimeout(() => setShowManageModal(false), 500);
    } catch (err) { setActionError('Erro ao salvar.'); } finally { setIsSaving(false); }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb = {
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        dashboard_hidden_rows: localStorage.getItem('dashboard_hidden_rows'),
        dashboard_custom_rows: localStorage.getItem('dashboard_custom_rows')
      };
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?share=gz_${base64}`);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e) { alert('Falha ao gerar link.'); } finally { setIsSharing(false); }
  };

  const TechnicalDataRow = ({ id, label, value, keys, accentColor = "blue", suffix = "", icon: Icon, isCustom = false, onRemove }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    if (hiddenRows.includes(id) && !isCustom) return null;

    const colorVariants: any = {
      blue: 'from-blue-600 to-blue-700 text-blue-700 border-blue-100 bg-blue-50',
      orange: 'from-orange-500 to-orange-600 text-orange-700 border-orange-100 bg-orange-50',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-700 border-emerald-100 bg-emerald-50',
      purple: 'from-purple-600 to-purple-700 text-purple-700 border-purple-100 bg-purple-50',
      slate: 'from-slate-600 to-slate-700 text-slate-700 border-slate-100 bg-slate-50',
      red: 'from-red-600 to-red-700 text-red-700 border-red-100 bg-red-50'
    };

    const getMonthlyValue = (periodId: string) => {
      let total = 0;
      keys.forEach((key: string) => { total += parseFloat(rawData[periodId]?.[key] || 0); });
      return total;
    };

    const isAverage = suffix === '%' || suffix === ' d';

    return (
      <div className="group transition-all duration-300 mb-4 last:mb-0">
        <div 
          className={`relative overflow-hidden bg-white rounded-[32px] border-2 transition-all cursor-pointer ${isOpen ? 'border-blue-500 shadow-xl scale-[1.01]' : 'border-slate-100 hover:border-blue-200 hover:shadow-lg shadow-sm'}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorVariants[accentColor].split(' ')[0]} text-white shadow-lg`}>
                <Icon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight">
                   {isCustom ? label : <EditableText id={`row_label_${id}`} defaultText={label} />}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance {selectedYear}</span>
                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Expandir Auditoria</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isAverage ? 'Média Anual' : 'Acumulado'}</p>
                <div className={`text-2xl font-black tabular-nums ${colorVariants[accentColor].split(' ')[2]}`}>
                  {typeof value === 'number' 
                    ? (isAverage ? value.toLocaleString('pt-BR', { minimumFractionDigits: 1 }) : Math.floor(value).toLocaleString('pt-BR'))
                    : value}{suffix}
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                {editorMode && (
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => initiateManage(keys, label, e)} 
                      className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-inner"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemove ? onRemove() : toggleRowVisibility(id); }}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-inner"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <div className={`p-2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                  <ChevronDown size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-2 mx-4 p-8 bg-slate-900 rounded-[40px] shadow-2xl animate-scale-in border-4 border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Calendar size={120} className="text-white" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative z-10">
              {PERIOD_OPTIONS.map(period => (
                <div key={period.id} className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-2">{period.label}</span>
                  <div className="text-sm font-black text-white tabular-nums">
                    {getMonthlyValue(period.id).toLocaleString('pt-BR', { minimumFractionDigits: isAverage ? 1 : 0 })}{suffix}
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
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER PREMIUM MULTI-ANO */}
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
                 Sincronização Estratégica {selectedYear}
              </p>
              <div className="h-4 w-[1px] bg-white/20 mx-2"></div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                 {['2025', '2026'].map(yr => (
                   <button 
                     key={yr} 
                     onClick={() => setSelectedYear(yr)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {yr}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-3 px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all border-2 shadow-2xl ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={20}/> : shareSuccess ? <CheckCircle size={20}/> : <Share2 size={20} />}
            {shareSuccess ? 'LINK ATUALIZADO' : 'GERAR LINK ESTRATÉGICO'}
          </button>
          <button onClick={() => window.print()} className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-[28px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3">
             <Download size={20} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* BLOCO 1: FLUXO E DEMANDA */}
      <div className="space-y-6">
        <SectionHeader id="fluxo" icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Users size={80}/></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-4">Acolhimentos Totais</p>
                <div className="flex items-baseline gap-3">
                   <h2 className="text-6xl font-black tabular-nums">{data.i1_acolhimento.toLocaleString()}</h2>
                   <span className="text-xs font-bold text-blue-300 uppercase">Pacientes</span>
                </div>
             </div>
             <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Stethoscope size={80}/></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-4">Consultas Médicas</p>
                <div className="flex items-baseline gap-3">
                   <h2 className="text-6xl font-black tabular-nums">{data.i1_consultas.toLocaleString()}</h2>
                   <span className="text-xs font-bold text-indigo-300 uppercase">Ações</span>
                </div>
             </div>
          </div>
          <TechnicalDataRow id="pro_pelotas" label="Pacientes: Pelotas" value={data.i4_pelotas} keys={['i4_pelotas']} accentColor="blue" icon={Target} />
          <TechnicalDataRow id="pro_outros" label="Pacientes: Outros Municípios" value={data.i4_outros_municipios} keys={['i4_outros_municipios']} accentColor="slate" icon={ArrowUpRight} />
          <TechnicalDataRow id="enc_psp" label="Atendimento: Consultas PSP" value={data.i2_consultas_psp} keys={['i2_consultas_psp']} accentColor="blue" icon={Building2} />
          <TechnicalDataRow id="enc_upa_areal" label="Atendimento: UPA Areal" value={data.i2_upa_areal} keys={['i2_upa_areal']} accentColor="orange" icon={Ambulance} />
          <TechnicalDataRow id="enc_traumato" label="Atendimento: Traumato SC" value={data.i2_traumato_sc} keys={['i2_traumato_sc']} accentColor="emerald" icon={Bone} />
          <TechnicalDataRow id="enc_ubs" label="Atendimento: UBS" value={data.i2_ubs} keys={['i2_ubs']} accentColor="slate" icon={Home} />
        </div>
        <DynamicNotes sectionId={`fluxo_${selectedYear}`} />
      </div>

      {/* BLOCO 2: RISCO E ESPECIALIDADES */}
      <div className="space-y-6">
        <SectionHeader id="risco" icon={Activity} title="Risco e Especialidades" color="#f59e0b" />
        <div className="grid grid-cols-1 gap-2">
          <TechnicalDataRow id="ris_vermelho" label="Emergência (Vermelho)" value={data.i3_emergencia} keys={['i3_emergencia']} accentColor="red" icon={ShieldAlert} />
          <TechnicalDataRow id="ris_amarelo" label="Urgência (Amarelo)" value={data.i3_urgencia} keys={['i3_urgencia']} accentColor="orange" icon={Zap} />
          <TechnicalDataRow id="ris_verde" label="Pouco Urgente (Verde/Azul)" value={data.i3_pouco_urgente} keys={['i3_pouco_urgente']} accentColor="emerald" icon={Activity} />
          
          <div className="mt-8 mb-4 border-b-2 border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Serviços Especializados</span>
          </div>
          
          <TechnicalDataRow id="esp_clinica" label="Especialidade: Clínica Médica" value={data.i5_clinica_medica} keys={['i5_clinica_medica']} accentColor="blue" icon={Stethoscope} />
          <TechnicalDataRow id="esp_pediatria" label="Especialidade: Pediatria" value={data.i5_pediatria} keys={['i5_pediatria']} accentColor="purple" icon={HeartPulse} />
          <TechnicalDataRow id="esp_buco" label="Especialidade: Bucomaxilofacial" value={data.i5_bucomaxilo} keys={['i5_bucomaxilo']} accentColor="slate" icon={SearchCode} />
          <TechnicalDataRow id="esp_vascular" label="Especialidade: Cirurgia Vascular" value={data.i5_cirurgia_vascular} keys={['i5_cirurgia_vascular']} accentColor="red" icon={Activity} />
          <TechnicalDataRow id="esp_social" label="Serviço Social" value={data.i5_servico_social} keys={['i5_servico_social']} accentColor="emerald" icon={HeartHandshake} />
          
          <div className="mt-8 mb-4 border-b-2 border-slate-100 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Transporte e Segurança</span>
          </div>
          
          <TechnicalDataRow id="tra_samu" label="Transporte: SAMU" value={data.i6_samu} keys={['i6_samu']} accentColor="red" icon={Ambulance} />
          <TechnicalDataRow id="tra_ecosul" label="Transporte: Ecosul" value={data.i6_ecosul} keys={['i6_ecosul']} accentColor="orange" icon={Truck} />
          <TechnicalDataRow id="tra_brigada" label="Segurança: Brigada Militar" value={data.i6_brigada_militar} keys={['i6_brigada_militar']} accentColor="slate" icon={Shield} />
        </div>
        <DynamicNotes sectionId={`risco_${selectedYear}`} />
      </div>

      {/* BLOCO 3: CAUSAS EXTERNAS */}
      <div className="space-y-6">
        <SectionHeader id="traumas" icon={AlertTriangle} title="Causas Externas" color="#ef4444" />
        <div className="grid grid-cols-1 gap-2">
          <TechnicalDataRow id="tr_moto" label="Acidente: Moto" value={data.i7_ac_moto} keys={['i7_ac_moto']} accentColor="red" icon={Zap} />
          <TechnicalDataRow id="tr_carro" label="Acidente: Carro" value={data.i7_ac_carro} keys={['i7_ac_carro']} accentColor="orange" icon={Car} />
          <TechnicalDataRow id="tr_bike" label="Acidente: Bicicleta" value={data.i7_ac_bicicleta} keys={['i7_ac_bicicleta']} accentColor="emerald" icon={Bike} />
          <TechnicalDataRow id="ac_quedas" label="Trauma: Quedas" value={data.i8_queda} keys={['i8_queda']} accentColor="orange" icon={TrendingDown} />
          <TechnicalDataRow id="v_fogo" label="Violência: Arma de Fogo" value={data.i9_arma_fogo} keys={['i9_arma_fogo']} accentColor="red" icon={ShieldAlert} />
        </div>
        <DynamicNotes sectionId={`traumas_${selectedYear}`} />
      </div>

      {/* BLOCO 4: GESTÃO DE LEITOS */}
      <div className="space-y-6">
        <SectionHeader id="leitos" icon={BedDouble} title="Gestão de Leitos" color="#8b5cf6" />
        <div className="grid grid-cols-1 gap-2">
          <TechnicalDataRow id="oc_clinico" label="Ocupação: Clínico Adulto" value={data.i10_clinico_adulto} keys={['i10_clinico_adulto']} accentColor="purple" suffix="%" icon={BedDouble} />
          <TechnicalDataRow id="oc_uti" label="Ocupação: UTI Adulto" value={data.i10_uti_adulto} keys={['i10_uti_adulto']} accentColor="red" suffix="%" icon={HeartPulse} />
          <TechnicalDataRow id="pm_clinico" label="Média Permanência: Clínico" value={data.i11_mp_clinico_adulto} keys={['i11_mp_clinico_adulto']} accentColor="slate" suffix=" d" icon={Calendar} />
          <TechnicalDataRow id="fi_aguarda" label="Aguardo: Leito Internação" value={data.i12_aguardando_leito} keys={['i12_aguardando_leito']} accentColor="orange" icon={Loader2} />
          <TechnicalDataRow id="fi_onco" label="Permanência: Oncológico" value={data.i13_permanencia_oncologico} keys={['i13_permanencia_oncologico']} accentColor="purple" suffix=" d" icon={Pill} />
        </div>
        <DynamicNotes sectionId={`leitos_${selectedYear}`} />
      </div>

      {/* BLOCO 5: SUPORTE E DIAGNÓSTICO */}
      <div className="space-y-6">
        <SectionHeader id="diag" icon={Microscope} title="Suporte e Exames" color="#10b981" />
        <div className="grid grid-cols-1 gap-2">
          <TechnicalDataRow id="an_lab" label="Exames: Laboratoriais" value={data.i14_laboratoriais} keys={['i14_laboratoriais']} accentColor="emerald" icon={Microscope} />
          <TechnicalDataRow id="im_tomo" label="Imagem: Tomografias" value={data.i15_tomografias} keys={['i15_tomografias']} accentColor="blue" icon={BarChart3} />
          <TechnicalDataRow id="im_rx" label="Imagem: Raio X" value={data.i15_raio_x} keys={['i15_raio_x']} accentColor="slate" icon={Activity} />
          <TechnicalDataRow id="esp_ultra" label="Especial: Ultrassonografia" value={data.i16_ultrasson} keys={['i16_ultrasson']} accentColor="emerald" icon={Zap} />
        </div>
        <DynamicNotes sectionId={`diag_${selectedYear}`} />
      </div>

      {/* SEÇÕES CUSTOMIZADAS */}
      {customSections.map((section) => (
        <div key={section.id} className="animate-fade-in space-y-6">
          <SectionHeader id={section.id} icon={FileText} title={section.title} color="#64748b" isRemovable={true} onRemove={() => { if(confirm("Remover bloco?")) { const upd = customSections.filter(s => s.id !== section.id); setCustomSections(upd); localStorage.setItem('dashboard_custom_sections', JSON.stringify(upd)); } }} />
          <DynamicNotes sectionId={`${section.id}_${selectedYear}`} />
        </div>
      ))}

      {/* MODAL DE EDIÇÃO */}
      {showManageModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => !isSaving && setShowManageModal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-slate-100">
            <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-2xl transform -rotate-6"><Edit3 size={36}/></div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Ajuste de Indicador</h3>
                   <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-3">{targetLabel} — Exercício {selectedYear}</p>
                 </div>
               </div>
               <button onClick={() => !isSaving && setShowManageModal(false)} className="p-4 hover:bg-white/10 rounded-full transition-all border-2 border-white/5"><X size={44} /></button>
            </div>
            
            <div className="p-12 overflow-y-auto bg-slate-50/50 flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {PERIOD_OPTIONS.map(period => (
                   <div key={period.id} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-4 hover:border-blue-500 transition-colors group/input">
                     <label className="block text-[11px] font-black text-slate-400 group-hover/input:text-blue-600 uppercase tracking-[0.2em] text-center border-b border-slate-50 pb-3 mb-2">{period.label}</label>
                     {targetKeys.map(key => (
                       <div key={key}>
                         <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">VALOR</span>
                         <input 
                           type="number" 
                           value={editValues[period.id]?.[key] || "0"} 
                           onChange={(e) => setEditValues({ ...editValues, [period.id]: { ...editValues[period.id], [key]: e.target.value } })}
                           className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black text-slate-900 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all tabular-nums"
                         />
                       </div>
                     ))}
                   </div>
                 ))}
               </div>
               <div className="mt-16 pt-10 border-t-4 border-dashed border-slate-200 max-w-lg mx-auto text-center">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><AlertCircle size={32}/></div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase mb-5 tracking-[0.3em]">Autenticação de Segurança</label>
                 <input 
                   type="password" 
                   value={adminPassword} 
                   onChange={(e) => setAdminPassword(e.target.value)}
                   className="w-full p-6 bg-white border-4 border-slate-100 rounded-[32px] outline-none focus:border-blue-500 text-center font-black text-3xl tracking-[0.5em] shadow-inner"
                   placeholder="****"
                 />
                 {actionError && <p className="text-red-500 text-xs font-black mt-6 uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse"><AlertCircle size={18}/> {actionError}</p>}
               </div>
            </div>

            <div className="p-12 bg-white border-t-2 border-slate-50 flex gap-6 shrink-0">
              <button onClick={() => !isSaving && setShowManageModal(false)} disabled={isSaving} className="flex-1 py-7 rounded-[32px] font-black text-slate-500 bg-slate-50 border-2 border-slate-100 uppercase tracking-widest text-xs hover:bg-slate-100 transition-all">Cancelar</button>
              <button onClick={saveChanges} disabled={isSaving} className="flex-[2] py-7 rounded-[32px] font-black bg-blue-600 text-white shadow-2xl shadow-blue-300 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-blue-700 transition-all transform active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
                {isSaving ? 'PROCESSANDO...' : 'SINCRONIZAR TÉCNICO'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .tabular-nums { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
};

export default Dashboard;
