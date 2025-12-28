
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

  // Motor de compressão e geração de Link
  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Captura o estado completo de todos os módulos para inclusão no link compartilhado
      const fullDb = {
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        rdqa_full_indicators: localStorage.getItem('rdqa_full_indicators'),
        // Inclusão dos dados da 17ª Conferência para que o link já venha com o arquivo configurado
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link'),
        cms_conference_doc_source: localStorage.getItem('cms_conference_doc_source')
      };
      
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      
      // Compressão GZIP para manter o link em tamanho aceitável
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
      console.error("Erro ao gerar link:", e);
      alert('Falha ao gerar link. Verifique se há muitos dados salvos.');
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

  const DetailBreakdown = ({ keys, colorClass = "text-slate-600" }: { keys: string[], colorClass?: string }) => {
    const periodsWithData = Object.entries(rawData).map(([periodKey, periodData]: [string, any]) => {
      let sum = 0;
      keys.forEach(k => sum += parseFloat(periodData[k] || 0));
      return { period: periodKey, value: sum };
    }).filter(p => p.value > 0);
    if (periodsWithData.length === 0) return <div className="p-3 text-xs text-slate-400 italic">Sem dados registrados.</div>;
    return (
      <div className="bg-slate-50 border-t border-slate-100 p-3 grid grid-cols-3 gap-2">
        {periodsWithData.map((p) => (
          <div key={p.period} className="flex flex-col items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{PERIOD_LABELS[p.period] || p.period}</span>
            <span className={`text-sm font-bold ${colorClass}`}>{p.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    );
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
        {isOpen && <DetailBreakdown keys={keys} colorClass={colorMap[accentColor]} />}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel de Gestão Estratégica</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium"><Calendar size={16} className="text-blue-500"/>Monitoramento de Indicadores - Pronto Socorro</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 shadow-xl ${
              shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK ATUALIZADO E COPIADO' : 'GERAR LINK DE COMPARTILHAMENTO'}
          </button>
          <button onClick={handleCopySummary} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${copySuccess ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{copySuccess ? <MessageSquare size={16} /> : <Copy size={16} />}{copySuccess ? 'Resumo Copiado!' : 'Copiar Texto'}</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"><Download size={16} /> Exportar PDF</button>
        </div>
      </div>

      {/* 1. FLUXO */}
      <div>
        <SectionHeader icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card title="Acolhimento e Consultas">
            <div className="grid grid-cols-2 gap-2 p-2">
               <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-3xl font-black text-blue-700 mb-1">{data.i1_acolhimento.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase">Acolhimentos</div>
                  <div className="border-t border-blue-200 mt-2 pt-2"><DataRow label="Histórico" value="" keys={['i1_acolhimento']} accentColor="blue" showTotal={false} /></div>
               </div>
               <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                  <div className="text-3xl font-black text-indigo-700 mb-1">{data.i1_consultas.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase">Consultas</div>
                  <div className="border-t border-indigo-200 mt-2 pt-2"><DataRow label="Histórico" value="" keys={['i1_consultas']} accentColor="blue" showTotal={false} /></div>
               </div>
            </div>
          </Card>
          <Card title="Origem dos Pacientes (PSP)">
             <div className="p-2 space-y-1">
                <DataRow label="Pelotas" value={data.i4_pelotas} keys={['i4_pelotas']} accentColor="blue" />
                <DataRow label="Outros Municípios" value={data.i4_outros_municipios} keys={['i4_outros_municipios']} accentColor="slate" />
             </div>
          </Card>
          <Card title="Total Pacientes Atendidos/Encaminhados">
             <div className="p-2 space-y-1">
                <DataRow label="Consultas PSP" value={data.i2_consultas_psp} keys={['i2_consultas_psp']} accentColor="blue" />
                <DataRow label="UPA AREAL" value={data.i2_upa_areal} keys={['i2_upa_areal']} accentColor="slate" />
                <DataRow label="Traumato SC" value={data.i2_traumato_sc} keys={['i2_traumato_sc']} accentColor="slate" />
                <DataRow label="UBS" value={data.i2_ubs} keys={['i2_ubs']} accentColor="slate" />
             </div>
          </Card>
        </div>
      </div>

      {/* 2. RISCO */}
      <div>
        <SectionHeader icon={Activity} title="Classificação de Risco" color="#ef4444" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {[
             { label: 'Emergência', val: data.i3_emergencia, k: ['i3_emergencia'], color: 'bg-red-500' },
             { label: 'Urgência', val: data.i3_urgencia, k: ['i3_urgencia'], color: 'bg-orange-500' },
             { label: 'Pouco Urg.', val: data.i3_pouco_urgente, k: ['i3_pouco_urgente'], color: 'bg-yellow-400' },
             { label: 'UBS', val: data.i3_ubs, k: ['i3_ubs'], color: 'bg-blue-500' },
             { label: 'Traumato', val: data.i3_traumato_sc, k: ['i3_traumato_sc'], color: 'bg-slate-500' },
             { label: 'UPA', val: data.i3_upa, k: ['i3_upa'], color: 'bg-teal-500' },
           ].map((item, idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
               <div className={`${item.color} p-2 text-center text-white text-[10px] font-black uppercase`}>{item.label}</div>
               <div className="p-4 text-center">
                 <div className="text-2xl font-black text-slate-800">{item.val.toLocaleString()}</div>
                 <DataRow label="Detalhes" value="" keys={item.k} accentColor="slate" showTotal={false} />
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 3. ESPECIALIDADES E TRANSPORTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SectionHeader icon={Stethoscope} title="Especialidades" color="#8b5cf6" />
          <Card className="p-2 space-y-1">
            <DataRow label="Bucomaxilofacial" value={data.i5_bucomaxilo} keys={['i5_bucomaxilo']} accentColor="purple" />
            <DataRow label="Cirurgia Vascular" value={data.i5_cirurgia_vascular} keys={['i5_cirurgia_vascular']} accentColor="purple" />
            <DataRow label="Clínica Médica" value={data.i5_clinica_medica} keys={['i5_clinica_medica']} accentColor="purple" />
            <DataRow label="Ginecologia" value={data.i5_ginecologia} keys={['i5_ginecologia']} accentColor="purple" />
            <DataRow label="Pediatria" value={data.i5_pediatria} keys={['i5_pediatria']} accentColor="purple" />
            <DataRow label="Serviço Social" value={data.i5_servico_social} keys={['i5_servico_social']} accentColor="purple" />
          </Card>
        </div>
        <div>
          <SectionHeader icon={Ambulance} title="Transporte e Segurança" color="#10b981" />
          <Card className="p-2 space-y-1">
            <DataRow label="SAMU" value={data.i6_samu} keys={['i6_samu']} accentColor="green" />
            <DataRow label="ECOSUL" value={data.i6_ecosul} keys={['i6_ecosul']} accentColor="green" />
            <DataRow label="Brigada Militar" value={data.i6_brigada_militar} keys={['i6_brigada_militar']} accentColor="green" />
            <DataRow label="SUSEPE" value={data.i6_susepe} keys={['i6_susepe']} accentColor="green" />
            <DataRow label="Polícia Civil" value={data.i6_policia_civil} keys={['i6_policia_civil']} accentColor="green" />
          </Card>
        </div>
      </div>

      {/* 4. TRAUMAS E CAUSAS EXTERNAS */}
      <div>
        <SectionHeader icon={AlertTriangle} title="Causas Externas e Violência" color="#f97316" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Acidentes de Trânsito">
            <div className="p-2 space-y-1">
              <DataRow label="Bicicleta" value={data.i7_ac_bicicleta} keys={['i7_ac_bicicleta']} accentColor="orange" />
              <DataRow label="Carro" value={data.i7_ac_carro} keys={['i7_ac_carro']} accentColor="orange" />
              <DataRow label="Moto" value={data.i7_ac_moto} keys={['i7_ac_moto']} accentColor="orange" />
              <DataRow label="Atropelamento" value={data.i7_atropelamento} keys={['i7_atropelamento']} accentColor="orange" />
            </div>
          </Card>
          <Card title="Outros Acidentes">
            <div className="p-2 space-y-1">
              <DataRow label="Trabalho" value={data.i8_ac_trabalho} keys={['i8_ac_trabalho']} accentColor="orange" />
              <DataRow label="Queda" value={data.i8_queda} keys={['i8_queda']} accentColor="orange" />
              <DataRow label="Agressão" value={data.i8_agressao} keys={['i8_agressao']} accentColor="red" />
            </div>
          </Card>
          <Card title="Violência (Armas)">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="text-xs font-bold text-red-600 uppercase">Fogo</div>
                <div className="text-xl font-black text-red-700">{data.i9_arma_fogo}</div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-600 uppercase">Branca</div>
                <div className="text-xl font-black text-slate-700">{data.i9_arma_branca}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. LEITOS E INTERNAÇÃO */}
      <div>
        <SectionHeader icon={Activity} title="Ocupação e Permanência" color="#64748b" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card title="Taxa de Ocupação Média (%)">
             <div className="p-2 grid grid-cols-2 gap-4">
               <div><DataRow label="Clínico Adulto" value={data.i10_clinico_adulto + '%'} keys={['i10_clinico_adulto']} accentColor="slate" /></div>
               <div><DataRow label="UTI Adulto" value={data.i10_uti_adulto + '%'} keys={['i10_uti_adulto']} accentColor="red" /></div>
               <div><DataRow label="Pediatria" value={data.i10_pediatria + '%'} keys={['i10_pediatria']} accentColor="slate" /></div>
               <div><DataRow label="UTI Ped." value={data.i10_uti_pediatria + '%'} keys={['i10_uti_pediatria']} accentColor="red" /></div>
             </div>
           </Card>
           <Card title="Média Permanência (Dias)">
             <div className="p-2 grid grid-cols-2 gap-4">
               <DataRow label="Clínico Adulto" value={data.i11_mp_clinico_adulto} keys={['i11_mp_clinico_adulto']} accentColor="slate" />
               <DataRow label="UTI Adulto" value={data.i11_mp_uti_adulto} keys={['i11_mp_uti_adulto']} accentColor="slate" />
             </div>
           </Card>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowManageModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-center justify-between">
              <h3 className="font-bold text-blue-800 flex items-center gap-2 text-lg"><Edit3 size={24} />Gerenciar Dados: {targetLabel}</h3>
              <button onClick={() => setShowManageModal(false)} className="text-blue-400 hover:text-blue-600"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {ALL_PERIODS_CONFIG.map((period) => (
                  <div key={period.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <label className="text-[10px] font-bold text-slate-500 uppercase">{period.label}</label>
                     <input type="number" value={editValues[period.id] || "0"} onChange={(e) => setEditValues(prev => ({...prev, [period.id]: e.target.value}))} className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Lock size={12} /> Senha de Administrador</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Senha para salvar..." />
                {actionError && <p className="text-red-500 text-xs mt-2 font-bold">{actionError}</p>}
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setShowManageModal(false)} className="flex-1 py-3 rounded-lg font-bold text-slate-600 hover:bg-white border border-slate-200">Cancelar</button>
              <button onClick={saveChanges} className="flex-1 py-3 rounded-lg font-bold bg-blue-600 text-white flex items-center justify-center gap-2 transition-colors"><Save size={18} /> Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
