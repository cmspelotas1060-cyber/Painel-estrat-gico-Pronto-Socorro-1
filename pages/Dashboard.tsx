
import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, AlertTriangle, Stethoscope, Ambulance, ShieldAlert, 
  ChevronDown, ChevronUp, Calendar, Download, Trash2, X, AlertCircle, 
  Lock, Edit3, Save, Copy, MessageSquare, Share2, Loader2, CheckCircle,
  FileText, Zap, Ruler, BedDouble, Microscope, Pill
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

const ALL_PERIODS_CONFIG = [
  { id: 'jan', label: 'Janeiro' }, { id: 'feb', label: 'Fevereiro' }, { id: 'mar', label: 'Março' },
  { id: 'apr', label: 'Abril' }, { id: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { id: 'jul', label: 'Julho' }, { id: 'aug', label: 'Agosto' }, { id: 'sep', label: 'Setembro' },
  { id: 'oct', label: 'Outubro' }, { id: 'nov', label: 'Novembro' }, { id: 'dec', label: 'Dezembro' },
  { id: 'q1', label: '1º Quadrimestre' }, { id: 'q2', label: '2º Quadrimestre' }, { id: 'q3', label: '3º Quadrimestre' },
];

const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div className={`flex items-center gap-3 pb-3 mb-6 border-b-2`} style={{ borderColor: color }}>
    <div className="p-2.5 rounded-xl text-white shadow-lg" style={{ backgroundColor: color }}>
      <Icon size={22} />
    </div>
    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{title}</h2>
  </div>
);

const Card = ({ title, children, className = "" }: { title?: string, children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col break-inside-avoid ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{title}</h3>
      </div>
    )}
    <div className="p-4 flex-1 flex flex-col justify-center">
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
        'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria'
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
      const fullDb = {
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        rdqa_full_indicators: localStorage.getItem('rdqa_full_indicators'),
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link'),
        cms_conference_doc_source: localStorage.getItem('cms_conference_doc_source'),
        ps_ppa_full_data_v2: localStorage.getItem('ps_ppa_full_data_v2')
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

  const DataRow = ({ label, value, keys, accentColor = "blue", showTotal = true, suffix = "" }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-50 border-blue-100', 
      red: 'text-red-700 bg-red-50 border-red-100', 
      orange: 'text-orange-700 bg-orange-50 border-orange-100',
      green: 'text-emerald-700 bg-emerald-50 border-emerald-100', 
      purple: 'text-purple-700 bg-purple-50 border-purple-100', 
      slate: 'text-slate-700 bg-slate-100 border-slate-200'
    };
    return (
      <div className="group transition-all duration-200">
        <div className={`flex items-center justify-between p-3 rounded-xl border border-transparent cursor-pointer ${isOpen ? 'bg-slate-50 border-slate-100 shadow-sm' : 'hover:bg-slate-50'}`} onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2 flex-1">
            {isOpen ? <ChevronUp size={14} className="text-slate-400"/> : <ChevronDown size={14} className="text-slate-400"/>}
            <span className="text-sm font-bold text-slate-600 tracking-tight">{label}</span>
            <button onClick={(e) => initiateManage(keys, label, e)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-blue-600 transition-all"><Edit3 size={12} /></button>
          </div>
          {showTotal && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-black border ${colorMap[accentColor]}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-40"></div>
        <div className="relative">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Painel de Gestão Estratégica</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-medium"><Calendar size={16} className="text-blue-500"/>Monitoramento de Indicadores - PS Pelotas</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative">
          <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 shadow-lg ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK ATUALIZADO' : 'GERAR LINK ESTRATÉGICO'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold transition-all"><Download size={18} /> Exportar PDF</button>
        </div>
      </div>

      {/* BLOCO 1: FLUXO E DEMANDA */}
      <div>
        <SectionHeader icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Volume de Atendimento">
            <div className="grid grid-cols-2 gap-3 p-2">
               <div className="bg-blue-50 rounded-[20px] p-5 text-center border border-blue-100 shadow-sm">
                  <div className="text-3xl font-black text-blue-700 mb-1">{data.i1_acolhimento.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Acolhimentos</div>
               </div>
               <div className="bg-indigo-50 rounded-[20px] p-5 text-center border border-indigo-100 shadow-sm">
                  <div className="text-3xl font-black text-indigo-700 mb-1">{data.i1_consultas.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Consultas</div>
               </div>
            </div>
          </Card>
          <Card title="Procedência (Original Pelotas)">
             <div className="p-2 space-y-1">
                <DataRow label="Pelotas" value={data.i4_pelotas} keys={['i4_pelotas']} accentColor="blue" />
                <DataRow label="Outros Municípios" value={data.i4_outros_municipios} keys={['i4_outros_municipios']} accentColor="slate" />
             </div>
          </Card>
          <Card title="Encaminhamentos Pós-Triagem">
             <div className="p-2 space-y-1">
                <DataRow label="UPA Areal" value={data.i2_upa_areal} keys={['i2_upa_areal']} accentColor="orange" />
                <DataRow label="UBS / Redes" value={data.i2_ubs} keys={['i2_ubs']} accentColor="green" />
             </div>
          </Card>
        </div>
      </div>

      {/* BLOCO 2: RISCO E GRAVIDADE */}
      <div>
        <SectionHeader icon={Activity} title="Classificação de Risco" color="#f59e0b" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Prioridades de Atendimento">
             <div className="p-2 space-y-1">
                <DataRow label="Emergência (Vermelho)" value={data.i3_emergencia} keys={['i3_emergencia']} accentColor="red" />
                <DataRow label="Urgência (Amarelo)" value={data.i3_urgencia} keys={['i3_urgencia']} accentColor="orange" />
                <DataRow label="Pouco Urgente (Verde/Azul)" value={data.i3_pouco_urgente} keys={['i3_pouco_urgente']} accentColor="green" />
             </div>
          </Card>
          <Card title="Especialidades">
             <div className="p-2 space-y-1">
                <DataRow label="Clínica Médica" value={data.i5_clinica_medica} keys={['i5_clinica_medica']} accentColor="blue" />
                <DataRow label="Pediatria" value={data.i5_pediatria} keys={['i5_pediatria']} accentColor="purple" />
                <DataRow label="Cirurgia Vascular" value={data.i5_cirurgia_vascular} keys={['i5_cirurgia_vascular']} accentColor="slate" />
                <DataRow label="Serviço Social" value={data.i5_servico_social} keys={['i5_servico_social']} accentColor="slate" />
             </div>
          </Card>
          <Card title="Transporte e Resgate">
             <div className="p-2 space-y-1">
                <DataRow label="SAMU" value={data.i6_samu} keys={['i6_samu']} accentColor="red" />
                <DataRow label="Ecosul" value={data.i6_ecosul} keys={['i6_ecosul']} accentColor="orange" />
                <DataRow label="Brigada Militar" value={data.i6_brigada_militar} keys={['i6_brigada_militar']} accentColor="slate" />
             </div>
          </Card>
        </div>
      </div>

      {/* BLOCO 3: TRAUMAS E VIOLÊNCIA */}
      <div>
        <SectionHeader icon={AlertTriangle} title="Causas Externas (Traumas)" color="#ef4444" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Acidentes de Trânsito">
             <div className="p-2 space-y-1">
                <DataRow label="Moto" value={data.i7_ac_moto} keys={['i7_ac_moto']} accentColor="red" />
                <DataRow label="Carro" value={data.i7_ac_carro} keys={['i7_ac_carro']} accentColor="orange" />
                <DataRow label="Bicicleta" value={data.i7_ac_bicicleta} keys={['i7_ac_bicicleta']} accentColor="orange" />
                <DataRow label="Atropelamentos" value={data.i7_atropelamento} keys={['i7_atropelamento']} accentColor="red" />
             </div>
          </Card>
          <Card title="Outros Acidentes">
             <div className="p-2 space-y-1">
                <DataRow label="Quedas" value={data.i8_queda} keys={['i8_queda']} accentColor="orange" />
                <DataRow label="Agressão Física" value={data.i8_agressao} keys={['i8_agressao']} accentColor="red" />
                <DataRow label="Acidente de Trabalho" value={data.i8_ac_trabalho} keys={['i8_ac_trabalho']} accentColor="slate" />
             </div>
          </Card>
          <Card title="Violência (Armas)">
             <div className="p-2 space-y-1">
                <DataRow label="Arma de Fogo" value={data.i9_arma_fogo} keys={['i9_arma_fogo']} accentColor="red" />
                <DataRow label="Arma Branca" value={data.i9_arma_branca} keys={['i9_arma_branca']} accentColor="red" />
             </div>
          </Card>
        </div>
      </div>

      {/* BLOCO 4: LEITOS E INTERNAÇÃO */}
      <div>
        <SectionHeader icon={BedDouble} title="Gestão de Leitos" color="#8b5cf6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Taxa de Ocupação Média">
             <div className="p-2 space-y-1">
                <DataRow label="Leito Clínico Adulto" value={data.i10_clinico_adulto} keys={['i10_clinico_adulto']} accentColor="purple" suffix="%" />
                <DataRow label="UTI Adulto" value={data.i10_uti_adulto} keys={['i10_uti_adulto']} accentColor="red" suffix="%" />
                <DataRow label="Leito Pediatria" value={data.i10_pediatria} keys={['i10_pediatria']} accentColor="blue" suffix="%" />
             </div>
          </Card>
          <Card title="Média Permanência (Dias)">
             <div className="p-2 space-y-1">
                <DataRow label="Clínico Adulto" value={data.i11_mp_clinico_adulto} keys={['i11_mp_clinico_adulto']} accentColor="slate" suffix=" dias" />
                <DataRow label="UTI Adulto" value={data.i11_mp_uti_adulto} keys={['i11_mp_uti_adulto']} accentColor="red" suffix=" dias" />
             </div>
          </Card>
          <Card title="Fluxo de Altas e Bloco">
             <div className="p-2 space-y-1">
                <DataRow label="Aguardando Leito" value={data.i12_aguardando_leito} keys={['i12_aguardando_leito']} accentColor="orange" />
                <DataRow label="Altas Registradas" value={data.i12_alta} keys={['i12_alta']} accentColor="green" />
                <DataRow label="Bloco Cirúrgico" value={data.i12_bloco_cirurgico} keys={['i12_bloco_cirurgico']} accentColor="blue" />
             </div>
          </Card>
        </div>
      </div>

      {/* BLOCO 5: APOIO DIAGNÓSTICO */}
      <div>
        <SectionHeader icon={Microscope} title="Suporte e Exames" color="#10b981" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Análises Clínicas">
             <div className="p-2 space-y-1">
                <DataRow label="Exames Laboratoriais" value={data.i14_laboratoriais} keys={['i14_laboratoriais']} accentColor="green" />
                <DataRow label="Transfusões" value={data.i14_transfuscoes} keys={['i14_transfuscoes']} accentColor="red" />
             </div>
          </Card>
          <Card title="Exames de Imagem">
             <div className="p-2 space-y-1">
                <DataRow label="Tomografias" value={data.i15_tomografias} keys={['i15_tomografias']} accentColor="blue" />
                <DataRow label="Raio X" value={data.i15_raio_x} keys={['i15_raio_x']} accentColor="slate" />
                <DataRow label="Angiotomografias" value={data.i15_angiotomografia} keys={['i15_angiotomografia']} accentColor="blue" />
             </div>
          </Card>
          <Card title="Exames Especiais">
             <div className="p-2 space-y-1">
                <DataRow label="Ultrassonografia" value={data.i16_ultrasson} keys={['i16_ultrasson']} accentColor="green" />
                <DataRow label="Endoscopia" value={data.i16_endoscopia} keys={['i16_endoscopia']} accentColor="purple" />
                <DataRow label="Oftalmologia" value={data.i16_oftalmo} keys={['i16_oftalmo']} accentColor="blue" />
             </div>
          </Card>
        </div>
      </div>

      {/* MODAL DE GERENCIAMENTO */}
      {showManageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowManageModal(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-100">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Edit3 size={24}/></div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Ajuste Técnico</h3>
                   <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">{targetLabel}</p>
                 </div>
               </div>
               <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {ALL_PERIODS_CONFIG.map(period => (
                   <div key={period.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white">
                     <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">{period.label}</label>
                     <input 
                       type="number" 
                       value={editValues[period.id] || "0"} 
                       onChange={(e) => setEditValues({...editValues, [period.id]: e.target.value})}
                       className="w-full bg-transparent border-none text-center font-black text-slate-800 focus:ring-0 p-0 text-lg"
                     />
                   </div>
                 ))}
               </div>
               <div className="pt-6 border-t border-slate-100">
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
              <button onClick={() => setShowManageModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-500 bg-white border border-slate-200 uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Cancelar</button>
              <button onClick={saveChanges} className="flex-1 py-5 rounded-2xl font-black bg-blue-600 text-white shadow-2xl shadow-blue-200 uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-blue-700 transition-all transform active:scale-95"><Save size={20}/> Sincronizar Tudo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
