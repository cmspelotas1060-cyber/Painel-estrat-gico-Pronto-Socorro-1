
import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  ChevronDown, ChevronUp, Calendar, Download, Trash2, X, AlertCircle, 
  Lock, Edit3, Save, Copy, MessageSquare, Share2, Loader2, CheckCircle
} from 'lucide-react';

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

const PERIOD_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr', may: 'Mai', jun: 'Jun',
  jul: 'Jul', aug: 'Ago', sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez',
  q1: '1º Q', q2: '2º Q', q3: '3º Q'
};

const ALL_PERIODS_CONFIG = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' },
  { id: 'q1', label: '1º Quadrimestre' }, { id: 'q2', label: '2º Quadrimestre' }, { id: 'q3', label: '3º Quadrimestre' },
];

const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div className={`flex items-center gap-3 pb-3 mb-4 border-b-2`} style={{ borderColor: color }}>
    <div className="p-2 rounded-lg text-white shadow-sm" style={{ backgroundColor: color }}>
      <Icon size={20} />
    </div>
    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{title}</h2>
  </div>
);

const Card = ({ title, children, className = "" }: { title?: string, children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col break-inside-avoid ${className}`}>
    {title && (
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-2 flex-1 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState(INITIAL_AGGREGATED_STATS);
  const [rawData, setRawData] = useState<any>({});
  const [showManageModal, setShowManageModal] = useState(false);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [actionError, setActionError] = useState('');
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const calculateStats = () => {
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    if (savedDetailedStats) {
      const parsed = JSON.parse(savedDetailedStats);
      setRawData(parsed);
      const aggregated = { ...INITIAL_AGGREGATED_STATS };
      const averageKeys = [
        'i10_clinico_adulto', 'i10_uti_adulto', 'i10_pediatria', 'i10_uti_pediatria',
        'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria',
        'i13_permanencia_oncologico'
      ];
      const counts: Record<string, number> = {};
      averageKeys.forEach(key => counts[key] = 0);
      Object.values(parsed).forEach((periodData: any) => {
        Object.keys(aggregated).forEach((key) => {
          if (typeof aggregated[key as keyof typeof INITIAL_AGGREGATED_STATS] === 'number') {
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
    }
  };

  useEffect(() => {
    calculateStats();
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Otimização Estratégica: Não enviamos ps_access_logs para manter o link curto
      // Os logs são para auditoria local ou compartilhamento manual da base
      const fullDb = {
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        rdqa_full_indicators: localStorage.getItem('rdqa_full_indicators'),
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link'),
        cms_conference_doc_source: localStorage.getItem('cms_conference_doc_source'),
        ps_ppa_programs: localStorage.getItem('ps_ppa_programs')
      };
      
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
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
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e) {
      alert('Falha ao gerar link estratégico.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `📊 *RESUMO EXECUTIVO - PRONTO SOCORRO 2025*\n\n✅ *FLUXO:* \n- Acolhimentos: ${data.i1_acolhimento.toLocaleString()}\n- Consultas Médicas: ${data.i1_consultas.toLocaleString()}\n\n🚨 *RISCO:* \n- Emergências: ${data.i3_emergencia.toLocaleString()}\n- Urgências: ${data.i3_urgencia.toLocaleString()}\n\n🏥 *LEITOS:* \n- Ocupação Clínica: ${data.i10_clinico_adulto}%\n- Ocupação UTI: ${data.i10_uti_adulto}%\n\n📍 *ORIGEM:* \n- Pelotas: ${data.i4_pelotas.toLocaleString()}\n- Outros: ${data.i4_outros_municipios.toLocaleString()}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const initiateManage = (keys: string[], label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetKeys(keys);
    setTargetLabel(label);
    setAdminPassword('');
    setActionError('');
    const currentValues: Record<string, string> = {};
    ALL_PERIODS_CONFIG.forEach(period => {
      const val = rawData[period.id]?.[keys[0]] ?? 0;
      currentValues[period.id] = val.toString();
    });
    setEditValues(currentValues);
    setShowManageModal(true);
  };

  const saveChanges = () => {
    if (adminPassword === 'Conselho@2026') {
      const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
      let parsed = savedDetailedStats ? JSON.parse(savedDetailedStats) : {};
      ALL_PERIODS_CONFIG.forEach(period => {
        if (!parsed[period.id]) parsed[period.id] = {};
        targetKeys.forEach(key => {
          parsed[period.id][key] = parseFloat(editValues[period.id] || "0");
        });
      });
      localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
      calculateStats();
      setShowManageModal(false);
    } else {
      setActionError('Senha incorreta.');
    }
  };

  const DataRow = ({ label, value, keys, accentColor = "blue", showTotal = true }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-50', red: 'text-red-700 bg-red-50', orange: 'text-orange-700 bg-orange-50',
      green: 'text-emerald-700 bg-emerald-50', purple: 'text-purple-700 bg-purple-50', slate: 'text-slate-700 bg-slate-100'
    };
    return (
      <div className="group transition-all duration-200">
        <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50'}`} onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2 flex-1">
            {isOpen ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <button onClick={(e) => initiateManage(keys, label, e)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-blue-600 print:hidden transition-opacity"><Edit3 size={12} /></button>
          </div>
          {showTotal && <div className={`px-3 py-1 rounded-full text-sm font-bold ${colorMap[accentColor]}`}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel de Gestão Estratégica</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium"><Calendar size={16} className="text-blue-500"/>Monitoramento de Indicadores - Pronto Socorro</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 shadow-xl ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK ATUALIZADO E COPIADO' : 'GERAR LINK DE COMPARTILHAMENTO'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"><Download size={16} /> Exportar PDF</button>
        </div>
      </div>

      <div>
        <SectionHeader icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card title="Acolhimento e Consultas">
            <div className="grid grid-cols-2 gap-2 p-2">
               <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-3xl font-black text-blue-700 mb-1">{data.i1_acolhimento.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase">Acolhimentos</div>
               </div>
               <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                  <div className="text-3xl font-black text-indigo-700 mb-1">{data.i1_consultas.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">Consultas</div>
               </div>
            </div>
          </Card>
          <Card title="Origem dos Pacientes (PSP)">
             <div className="p-2 space-y-1">
                <DataRow label="Pelotas" value={data.i4_pelotas} keys={['i4_pelotas']} accentColor="blue" />
                <DataRow label="Outros Municípios" value={data.i4_outros_municipios} keys={['i4_outros_municipios']} accentColor="slate" />
             </div>
          </Card>
        </div>
      </div>

      {showManageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowManageModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800 tracking-tight uppercase">
              <span className="flex items-center gap-2"><Edit3 size={18} /> Gerenciar: {targetLabel}</span>
              <button onClick={() => setShowManageModal(false)}><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
               <div className="grid grid-cols-3 gap-3">
                 {ALL_PERIODS_CONFIG.map(period => (
                   <div key={period.id}>
                     <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{period.label}</label>
                     <input 
                       type="number" 
                       value={editValues[period.id] || "0"} 
                       onChange={(e) => setEditValues({...editValues, [period.id]: e.target.value})}
                       className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700"
                     />
                   </div>
                 ))}
               </div>
               <div className="pt-4 border-t border-slate-100">
                 <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><Lock size={12}/> Autorização Necessária</label>
                 <input 
                   type="password" 
                   value={adminPassword} 
                   onChange={(e) => setAdminPassword(e.target.value)}
                   className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                   placeholder="Senha do Conselho"
                 />
                 {actionError && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><AlertCircle size={14}/> {actionError}</p>}
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setShowManageModal(false)} className="flex-1 py-4 rounded-2xl font-black text-slate-500 bg-white border border-slate-200 uppercase tracking-widest text-xs">Cancelar</button>
              <button onClick={saveChanges} className="flex-1 py-4 rounded-2xl font-black bg-blue-600 text-white shadow-xl shadow-blue-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Save size={18}/> Aplicar e Sincronizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
