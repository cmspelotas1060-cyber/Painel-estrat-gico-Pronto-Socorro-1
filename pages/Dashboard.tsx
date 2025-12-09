import React, { useEffect, useState } from 'react';
import { 
  Users, Activity, AlertTriangle,  
  Stethoscope, Ambulance, ShieldAlert, 
  Brain, ChevronDown, ChevronUp, Calendar,
  BedDouble, Download, Trash2, X, AlertCircle, Lock, CheckSquare, Square
} from 'lucide-react';

// --- Types & Helpers ---

const INITIAL_AGGREGATED_STATS = {
  // 1
  i1_acolhimento: 0, i1_consultas: 0,
  // 2
  i2_consultas_psp: 0, i2_upa_areal: 0, i2_traumato_sc: 0, i2_ubs: 0,
  // 3
  i3_ubs: 0, i3_traumato_sc: 0, i3_pouco_urgente: 0, i3_urgencia: 0, i3_emergencia: 0, i3_upa: 0,
  // 4
  i4_pelotas: 0, i4_outros_municipios: 0,
  // 5
  i5_bucomaxilo: 0, i5_cirurgia_vascular: 0, i5_clinica_medica: 0, i5_ginecologia: 0, i5_pediatria: 0, i5_servico_social: 0,
  // 6
  i6_samu: 0, i6_ecosul: 0, i6_brigada_militar: 0, i6_susepe: 0, i6_policia_civil: 0,
  // 7
  i7_ac_bicicleta: 0, i7_ac_caminhao: 0, i7_ac_carro: 0, i7_ac_moto: 0, i7_ac_onibus: 0, i7_atropelamento: 0, i7_ac_charrete: 0, i7_ac_trator: 0,
  // 8
  i8_ac_trabalho: 0, i8_afogamento: 0, i8_agressao: 0, i8_choque_eletrico: 0, i8_queda: 0, i8_queimadura: 0,
  // 9
  i9_arma_fogo: 0, i9_arma_branca: 0,
  // 10
  i10_clinico_adulto: 0, i10_uti_adulto: 0, i10_pediatria: 0, i10_uti_pediatria: 0,
  // 11
  i11_mp_clinico_adulto: 0, i11_mp_uti_adulto: 0, i11_mp_pediatria: 0, i11_mp_uti_pediatria: 0,
  // 12
  i12_aguardando_leito: 0, i12_alta: 0, i12_bloco_cirurgico: 0,
  // 13
  i13_permanencia_oncologico: "N/A",
  // 14
  i14_laboratoriais: 0, i14_transfuscoes: 0,
  // 15
  i15_tomografias: 0, i15_angiotomografia: 0, i15_raio_x: 0,
  // 16
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

// Helper components extracted to fix type errors
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
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteKeys, setDeleteKeys] = useState<string[]>([]);
  const [deleteLabel, setDeleteLabel] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [selectedDeletePeriods, setSelectedDeletePeriods] = useState<string[]>([]);

  const calculateStats = () => {
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    
    if (savedDetailedStats) {
      const parsed = JSON.parse(savedDetailedStats);
      setRawData(parsed);

      const aggregated = { ...INITIAL_AGGREGATED_STATS };
      
      // Keys that need to be averaged instead of summed (Taxas de Ocupação & Média Permanência)
      const averageKeys = [
        // Item 10: Taxa Ocupação
        'i10_clinico_adulto', 'i10_uti_adulto', 'i10_pediatria', 'i10_uti_pediatria',
        // Item 11: Média Permanência
        'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria'
      ];

      const counts: Record<string, number> = {};
      averageKeys.forEach(key => counts[key] = 0);
      
      Object.values(parsed).forEach((periodData: any) => {
        Object.keys(aggregated).forEach((key) => {
          if (typeof aggregated[key as keyof typeof INITIAL_AGGREGATED_STATS] === 'number') {
            const val = parseFloat(periodData[key] || 0);
            (aggregated as any)[key] += val;

            // Track count for average calculation if value > 0
            if (averageKeys.includes(key) && val > 0) {
              counts[key]++;
            }

          } else if (key === 'i13_permanencia_oncologico' && periodData[key]) {
             (aggregated as any)[key] = periodData[key];
          }
        });
      });

      // Calculate averages for specific keys
      averageKeys.forEach(key => {
        if (counts[key] > 0) {
           // Divide the total sum by the number of contributing periods
           const avg = (aggregated as any)[key] / counts[key];
           // Round to 1 decimal place
           (aggregated as any)[key] = parseFloat(avg.toFixed(1));
        }
      });

      setData(aggregated);
    }
  };

  useEffect(() => {
    calculateStats();
  }, []);

  // --- Deletion Logic ---

  const initiateDelete = (keys: string[], label: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the accordion
    setDeleteKeys(keys);
    setDeleteLabel(label);
    setDeletePassword('');
    setDeleteError('');
    setSelectedDeletePeriods([]); // Reset selections
    setShowDeleteModal(true);
  };

  const togglePeriodSelection = (periodId: string) => {
    setSelectedDeletePeriods(prev => 
      prev.includes(periodId) 
        ? prev.filter(p => p !== periodId)
        : [...prev, periodId]
    );
  };

  const toggleAllPeriods = () => {
    if (selectedDeletePeriods.length === ALL_PERIODS_CONFIG.length) {
      setSelectedDeletePeriods([]);
    } else {
      setSelectedDeletePeriods(ALL_PERIODS_CONFIG.map(p => p.id));
    }
  };

  const confirmDelete = () => {
    if (selectedDeletePeriods.length === 0) {
      setDeleteError('Selecione pelo menos um período para excluir.');
      return;
    }

    if (deletePassword === 'Conselho@2026') {
      const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
      if (savedDetailedStats) {
        const parsed = JSON.parse(savedDetailedStats);
        
        // Loop through only selected periods
        selectedDeletePeriods.forEach(period => {
          if (parsed[period]) {
            deleteKeys.forEach(key => {
              if (parsed[period][key] !== undefined) {
                 // If it's the text field, empty string, otherwise 0
                 parsed[period][key] = key === 'i13_permanencia_oncologico' ? '' : 0;
              }
            });
          }
        });

        localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed));
        calculateStats(); // Refresh UI
        setShowDeleteModal(false);
        alert(`Dados de "${deleteLabel}" zerados para os períodos selecionados.`);
      }
    } else {
      setDeleteError('Senha incorreta.');
    }
  };

  // --- UI Components ---

  const DetailBreakdown = ({ keys, colorClass = "text-slate-600" }: { keys: string[], colorClass?: string }) => {
    const periodsWithData = Object.entries(rawData).map(([periodKey, periodData]: [string, any]) => {
      let sum = 0;
      keys.forEach(k => sum += parseFloat(periodData[k] || 0));
      return { period: periodKey, value: sum };
    }).filter(p => p.value > 0);

    if (periodsWithData.length === 0) return (
      <div className="p-3 text-xs text-slate-400 italic bg-slate-50 border-t border-slate-100">
        Nenhum detalhamento mensal registrado.
      </div>
    );

    return (
      <div className="bg-slate-50 border-t border-slate-100 p-3 grid grid-cols-3 gap-2 animate-fade-in">
        {periodsWithData.map((p) => (
          <div key={p.period} className="flex flex-col items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{PERIOD_LABELS[p.period] || p.period}</span>
            <span className={`text-sm font-bold ${colorClass}`}>{p.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    );
  };

  const DataRow = ({ label, value, keys, accentColor = "blue", showTotal = true }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const colorMap: Record<string, string> = {
      blue: 'text-blue-700 bg-blue-50 group-hover:bg-blue-100',
      red: 'text-red-700 bg-red-50 group-hover:bg-red-100',
      orange: 'text-orange-700 bg-orange-50 group-hover:bg-orange-100',
      green: 'text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100',
      purple: 'text-purple-700 bg-purple-50 group-hover:bg-purple-100',
      slate: 'text-slate-700 bg-slate-100 group-hover:bg-slate-200'
    };

    return (
      <div className="group transition-all duration-200 relative">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-slate-200 text-slate-600' : 'bg-transparent text-slate-300 group-hover:text-slate-500'} print:hidden`}>
              {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
            
            {/* Delete Icon - Visible on hover or when open */}
            <button 
              onClick={(e) => initiateDelete(keys, label, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded print:hidden ml-2"
              title={`Excluir dados de ${label}`}
            >
              <Trash2 size={12} />
            </button>
          </div>

          {showTotal && (
             <div className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${colorMap[accentColor]}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
          )}
        </div>
        {isOpen && <DetailBreakdown keys={keys} colorClass={colorMap[accentColor].split(' ')[0]} />}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel de Gestão Estratégica</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Calendar size={16} className="text-blue-500"/>
            Monitoramento de Indicadores - Pronto Socorro
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
            Ano Base: 2025
          </span>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors print:hidden"
          >
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* 1. FLUXO DE ATENDIMENTO */}
      <div>
        <SectionHeader icon={Users} title="Fluxo e Demanda" color="#3b82f6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          <Card title="Acolhimento e Consultas">
            <div className="grid grid-cols-2 gap-2 p-2">
               <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 relative group/card">
                  <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity print:hidden">
                    <button onClick={(e) => initiateDelete(['i1_acolhimento'], 'Acolhimentos', e)} className="p-1 text-blue-300 hover:text-red-500">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                  <div className="text-3xl font-black text-blue-700 mb-1">{data.i1_acolhimento.toLocaleString()}</div>
                  <div className="text-xs font-bold text-blue-400 uppercase mb-2">Acolhimentos</div>
                  <div className="border-t border-blue-200 pt-2 text-left">
                     <DataRow label="Detalhes" value="" keys={['i1_acolhimento']} accentColor="blue" showTotal={false} />
                  </div>
               </div>
               <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100 relative group/card">
                  <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity print:hidden">
                    <button onClick={(e) => initiateDelete(['i1_consultas'], 'Consultas', e)} className="p-1 text-indigo-300 hover:text-red-500">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                  <div className="text-3xl font-black text-indigo-700 mb-1">{data.i1_consultas.toLocaleString()}</div>
                  <div className="text-xs font-bold text-indigo-400 uppercase mb-2">Consultas</div>
                  <div className="border-t border-indigo-200 pt-2 text-left">
                     <DataRow label="Detalhes" value="" keys={['i1_consultas']} accentColor="blue" showTotal={false} />
                  </div>
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

          <Card title="Pacientes Trazidos Por (Transporte/Segurança)" className="lg:col-span-3 xl:col-span-3">
             <div className="p-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <DataRow label="SAMU" value={data.i6_samu} keys={['i6_samu']} accentColor="red" />
                <DataRow label="ECOSUL" value={data.i6_ecosul} keys={['i6_ecosul']} accentColor="orange" />
                <DataRow label="Brigada Militar" value={data.i6_brigada_militar} keys={['i6_brigada_militar']} accentColor="slate" />
                <DataRow label="SUSEPE" value={data.i6_susepe} keys={['i6_susepe']} accentColor="slate" />
                <DataRow label="Polícia Civil" value={data.i6_policia_civil} keys={['i6_policia_civil']} accentColor="slate" />
             </div>
          </Card>

        </div>
      </div>

      {/* 2. CLASSIFICAÇÃO DE RISCO */}
      <div>
        <SectionHeader icon={Activity} title="Classificação de Risco" color="#ef4444" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {[
             { label: 'Emergência', val: data.i3_emergencia, k: ['i3_emergencia'], color: 'bg-red-500', text: 'text-red-50' },
             { label: 'Urgência', val: data.i3_urgencia, k: ['i3_urgencia'], color: 'bg-orange-500', text: 'text-orange-50' },
             { label: 'Pouco Urg.', val: data.i3_pouco_urgente, k: ['i3_pouco_urgente'], color: 'bg-yellow-400', text: 'text-yellow-900' },
             { label: 'UBS', val: data.i3_ubs, k: ['i3_ubs'], color: 'bg-blue-500', text: 'text-blue-50' },
             { label: 'Traumato', val: data.i3_traumato_sc, k: ['i3_traumato_sc'], color: 'bg-slate-500', text: 'text-slate-50' },
             { label: 'UPA', val: data.i3_upa, k: ['i3_upa'], color: 'bg-teal-500', text: 'text-teal-50' },
           ].map((item, idx) => (
             <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all break-inside-avoid relative">
               <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                    <button onClick={(e) => initiateDelete(item.k, item.label, e)} className="p-1 bg-white/20 hover:bg-white/40 text-white rounded">
                      <Trash2 size={12}/>
                    </button>
               </div>
               <div className={`${item.color} p-2 text-center`}>
                 <span className={`text-xs font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span>
               </div>
               <div className="p-4 text-center">
                 <div className="text-3xl font-black text-slate-800 mb-2">{item.val.toLocaleString()}</div>
                 <div className="border-t border-slate-100 pt-2">
                    <DataRow label="Ver Meses" value="" keys={item.k} accentColor="slate" showTotal={false} />
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* 3. CAUSAS EXTERNAS E VIOLÊNCIA */}
      <div>
        <SectionHeader icon={AlertTriangle} title="Traumas e Causas Externas" color="#f97316" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           
           <Card title="Vítimas de Acidente de Trânsito">
             <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <DataRow label="Moto" value={data.i7_ac_moto} keys={['i7_ac_moto']} accentColor="orange" />
                <DataRow label="Carro" value={data.i7_ac_carro} keys={['i7_ac_carro']} accentColor="orange" />
                <DataRow label="Bicicleta" value={data.i7_ac_bicicleta} keys={['i7_ac_bicicleta']} accentColor="orange" />
                <DataRow label="Atropelamento" value={data.i7_atropelamento} keys={['i7_atropelamento']} accentColor="orange" />
                <DataRow label="Caminhão" value={data.i7_ac_caminhao} keys={['i7_ac_caminhao']} accentColor="orange" />
                <DataRow label="Ônibus" value={data.i7_ac_onibus} keys={['i7_ac_onibus']} accentColor="orange" />
                <DataRow label="Trator" value={data.i7_ac_trator} keys={['i7_ac_trator']} accentColor="orange" />
                <DataRow label="Charrete" value={data.i7_ac_charrete} keys={['i7_ac_charrete']} accentColor="orange" />
             </div>
           </Card>

           <Card title="Outros Tipos de Acidente">
             <div className="p-2 space-y-1">
                <DataRow label="Queda" value={data.i8_queda} keys={['i8_queda']} accentColor="orange" />
                <DataRow label="Trabalho" value={data.i8_ac_trabalho} keys={['i8_ac_trabalho']} accentColor="orange" />
                <DataRow label="Agressão" value={data.i8_agressao} keys={['i8_agressao']} accentColor="red" />
                <DataRow label="Queimadura" value={data.i8_queimadura} keys={['i8_queimadura']} accentColor="orange" />
                <DataRow label="Choque Elétrico" value={data.i8_choque_eletrico} keys={['i8_choque_eletrico']} accentColor="orange" />
                <DataRow label="Afogamento" value={data.i8_afogamento} keys={['i8_afogamento']} accentColor="orange" />
             </div>
           </Card>

           <Card title="Violência (Armas)">
              <div className="p-4 flex flex-col justify-center h-full gap-4">
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <button onClick={(e) => initiateDelete(['i9_arma_fogo'], 'Arma de Fogo', e)} className="p-1 text-red-300 hover:text-red-500">
                          <Trash2 size={12}/>
                        </button>
                    </div>
                    <div>
                       <div className="text-sm text-red-600 font-bold uppercase">Arma de Fogo</div>
                       <div className="text-3xl font-black text-red-800">{data.i9_arma_fogo}</div>
                    </div>
                    <ShieldAlert size={32} className="text-red-300"/>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <button onClick={(e) => initiateDelete(['i9_arma_branca'], 'Arma Branca', e)} className="p-1 text-slate-400 hover:text-red-500">
                          <Trash2 size={12}/>
                        </button>
                    </div>
                    <div>
                       <div className="text-sm text-slate-500 font-bold uppercase">Arma Branca</div>
                       <div className="text-3xl font-black text-slate-700">{data.i9_arma_branca}</div>
                    </div>
                    <ShieldAlert size={32} className="text-slate-300"/>
                 </div>
                 <div className="pt-2">
                   <DataRow label="Ver Detalhes (Arma Fogo)" value="" keys={['i9_arma_fogo']} accentColor="red" showTotal={false} />
                   <DataRow label="Ver Detalhes (Arma Branca)" value="" keys={['i9_arma_branca']} accentColor="slate" showTotal={false} />
                 </div>
              </div>
           </Card>

        </div>
      </div>

      {/* 4. CLÍNICO E EXAMES */}
      <div>
        <SectionHeader icon={Stethoscope} title="Clínico e Diagnóstico" color="#a855f7" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card title="Atendimentos por Especialidade">
            <div className="p-2 space-y-1">
               <DataRow label="Clínica Médica" value={data.i5_clinica_medica} keys={['i5_clinica_medica']} accentColor="purple" />
               <DataRow label="Pediatria" value={data.i5_pediatria} keys={['i5_pediatria']} accentColor="purple" />
               <DataRow label="Cirurgia/Vascular" value={data.i5_cirurgia_vascular} keys={['i5_cirurgia_vascular']} accentColor="purple" />
               <DataRow label="Ginecologia" value={data.i5_ginecologia} keys={['i5_ginecologia']} accentColor="purple" />
               <DataRow label="Bucomaxilofacial" value={data.i5_bucomaxilo} keys={['i5_bucomaxilo']} accentColor="purple" />
               <DataRow label="Serviço Social" value={data.i5_servico_social} keys={['i5_servico_social']} accentColor="purple" />
            </div>
          </Card>

          <Card title="Exames de Imagem">
            <div className="p-2 space-y-1">
               <DataRow label="Raio X" value={data.i15_raio_x} keys={['i15_raio_x']} accentColor="slate" />
               <DataRow label="Tomografias" value={data.i15_tomografias} keys={['i15_tomografias']} accentColor="slate" />
               <DataRow label="Angiotomografia" value={data.i15_angiotomografia} keys={['i15_angiotomografia']} accentColor="slate" />
               <DataRow label="Ultrasson" value={data.i16_ultrasson} keys={['i16_ultrasson']} accentColor="slate" />
            </div>
          </Card>

          <Card title="Análises e Especiais">
            <div className="p-2 space-y-1">
               <DataRow label="Laboratoriais" value={data.i14_laboratoriais} keys={['i14_laboratoriais']} accentColor="purple" />
               <DataRow label="Transfusões" value={data.i14_transfuscoes} keys={['i14_transfuscoes']} accentColor="purple" />
               <div className="my-2 border-b border-slate-100"></div>
               <DataRow label="Endoscopia" value={data.i16_endoscopia} keys={['i16_endoscopia']} accentColor="slate" />
               <DataRow label="Oftalmo" value={data.i16_oftalmo} keys={['i16_oftalmo']} accentColor="slate" />
               <DataRow label="Otorrino" value={data.i16_otorrino} keys={['i16_otorrino']} accentColor="slate" />
               <DataRow label="Urologia" value={data.i16_urologia} keys={['i16_urologia']} accentColor="slate" />
            </div>
          </Card>

        </div>
      </div>

      {/* 5. INTERNAÇÃO E LEITOS */}
      <div>
        <SectionHeader icon={BedDouble} title="Internação e Capacidade" color="#10b981" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

           <Card title="Taxa Ocupação Leitos (Média/Dia)">
              <div className="p-2 space-y-2">
                 <DataRow label="Clínico Adulto" value={`${data.i10_clinico_adulto}%`} keys={['i10_clinico_adulto']} accentColor="green" />
                 <DataRow label="UTI Adulto" value={`${data.i10_uti_adulto}%`} keys={['i10_uti_adulto']} accentColor="green" />
                 <DataRow label="Pediatria" value={`${data.i10_pediatria}%`} keys={['i10_pediatria']} accentColor="green" />
                 <DataRow label="UTI Pediatria" value={`${data.i10_uti_pediatria}%`} keys={['i10_uti_pediatria']} accentColor="green" />
              </div>
           </Card>

           <Card title="Média Permanência (Aguardando Leito)">
              <div className="p-2 space-y-2">
                 <DataRow label="Clínico Adulto" value={data.i11_mp_clinico_adulto} keys={['i11_mp_clinico_adulto']} accentColor="green" />
                 <DataRow label="UTI Adulto" value={data.i11_mp_uti_adulto} keys={['i11_mp_uti_adulto']} accentColor="green" />
                 <DataRow label="Pediatria" value={data.i11_mp_pediatria} keys={['i11_mp_pediatria']} accentColor="green" />
                 <DataRow label="UTI Pediatria" value={data.i11_mp_uti_pediatria} keys={['i11_mp_uti_pediatria']} accentColor="green" />
              </div>
           </Card>

           <Card title="Pacientes Adultos (Status)">
              <div className="p-4 grid grid-cols-1 gap-4">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                        <button onClick={(e) => initiateDelete(['i12_aguardando_leito'], 'Aguardando Leito', e)} className="p-1 text-slate-400 hover:text-red-500">
                          <Trash2 size={12}/>
                        </button>
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Aguardando Leito</div>
                    <div className="text-2xl font-bold text-slate-800">{data.i12_aguardando_leito}</div>
                    <div className="mt-1"><DataRow label="Ver Meses" value="" keys={['i12_aguardando_leito']} accentColor="slate" showTotal={false} /></div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-green-50 p-3 rounded-lg border border-green-100 relative group">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                            <button onClick={(e) => initiateDelete(['i12_alta'], 'Alta', e)} className="p-1 text-green-300 hover:text-red-500">
                              <Trash2 size={12}/>
                            </button>
                        </div>
                        <div className="text-xs text-green-600 font-bold uppercase">Alta</div>
                        <div className="text-xl font-bold text-green-800">{data.i12_alta}</div>
                        <DataRow label="Ver" value="" keys={['i12_alta']} accentColor="green" showTotal={false} />
                    </div>
                    <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100 relative group">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                            <button onClick={(e) => initiateDelete(['i12_bloco_cirurgico'], 'Bloco Cirúrgico', e)} className="p-1 text-blue-300 hover:text-red-500">
                              <Trash2 size={12}/>
                            </button>
                        </div>
                        <div className="text-xs text-blue-600 font-bold uppercase">Bloco Cir.</div>
                        <div className="text-xl font-bold text-blue-800">{data.i12_bloco_cirurgico}</div>
                        <DataRow label="Ver" value="" keys={['i12_bloco_cirurgico']} accentColor="blue" showTotal={false} />
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Oncológicos (Permanência)">
              <div className="p-6 flex flex-col items-center justify-center text-center h-full relative group">
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                    <button onClick={(e) => initiateDelete(['i13_permanencia_oncologico'], 'Oncológicos', e)} className="p-1 text-purple-200 hover:text-red-500">
                      <Trash2 size={12}/>
                    </button>
                 </div>
                 <Brain size={48} className="text-purple-200 mb-4" />
                 <div className="text-sm font-bold text-slate-400 uppercase mb-2">Média de Permanência</div>
                 <div className="text-3xl font-black text-purple-700">{data.i13_permanencia_oncologico}</div>
                 <div className="text-xs text-slate-400 mt-2">Aguardando leito hospitalar</div>
              </div>
           </Card>

        </div>
      </div>

      {/* EXPANDED DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-red-800 flex items-center gap-2 text-lg">
                <Trash2 size={24} />
                Excluir Dados: <span className="underline decoration-red-300">{deleteLabel}</span>
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-red-400 hover:text-red-600">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-500 uppercase">Selecione os períodos para zerar:</label>
                  <button 
                    onClick={toggleAllPeriods}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {selectedDeletePeriods.length === ALL_PERIODS_CONFIG.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_PERIODS_CONFIG.map((period) => {
                    const isSelected = selectedDeletePeriods.includes(period.id);
                    return (
                      <button
                        key={period.id}
                        onClick={() => togglePeriodSelection(period.id)}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all
                          ${isSelected 
                            ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                        `}
                      >
                        {isSelected ? <CheckSquare size={16} className="shrink-0" /> : <Square size={16} className="shrink-0 text-slate-300" />}
                        {period.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                   <Lock size={12} /> Senha de Administrador
                </label>
                <input 
                  type="password" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  placeholder="Digite a senha para confirmar..."
                />
                {deleteError && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold">
                    <AlertCircle size={12} /> {deleteError}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-lg font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                disabled={selectedDeletePeriods.length === 0}
                className="flex-1 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
              >
                Confirmar Exclusão ({selectedDeletePeriods.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;