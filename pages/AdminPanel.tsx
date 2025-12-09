import React, { useState, useEffect } from 'react';
import { Lock, Save, AlertCircle, CheckCircle, FileSpreadsheet, Calendar, DollarSign, Trash2, X } from 'lucide-react';

// Empty structure for a single month's detailed stats
const SINGLE_MONTH_STATS = {
  // 1
  i1_acolhimento: 0,
  i1_consultas: 0,
  // 2
  i2_consultas_psp: 0, 
  i2_upa_areal: 0, 
  i2_traumato_sc: 0, 
  i2_ubs: 0,
  // 3
  i3_ubs: 0,
  i3_traumato_sc: 0,
  i3_pouco_urgente: 0,
  i3_urgencia: 0,
  i3_emergencia: 0,
  i3_upa: 0,
  // 4
  i4_pelotas: 0, i4_outros_municipios: 0,
  // 5
  i5_bucomaxilo: 0,
  i5_cirurgia_vascular: 0,
  i5_clinica_medica: 0,
  i5_ginecologia: 0,
  i5_pediatria: 0,
  i5_servico_social: 0,
  // 6
  i6_samu: 0, 
  i6_ecosul: 0, 
  i6_brigada_militar: 0,
  i6_susepe: 0,
  i6_policia_civil: 0,
  // 7
  i7_ac_bicicleta: 0,
  i7_ac_caminhao: 0,
  i7_ac_carro: 0,
  i7_ac_moto: 0,
  i7_ac_onibus: 0,
  i7_atropelamento: 0,
  i7_ac_charrete: 0,
  i7_ac_trator: 0,
  // 8
  i8_ac_trabalho: 0,
  i8_afogamento: 0,
  i8_agressao: 0,
  i8_choque_eletrico: 0,
  i8_queda: 0,
  i8_queimadura: 0,
  // 9
  i9_arma_fogo: 0, i9_arma_branca: 0,
  // 10
  i10_clinico_adulto: 0,
  i10_uti_adulto: 0,
  i10_pediatria: 0,
  i10_uti_pediatria: 0,
  // 11
  i11_mp_clinico_adulto: 0,
  i11_mp_uti_adulto: 0,
  i11_mp_pediatria: 0,
  i11_mp_uti_pediatria: 0,
  // 12
  i12_aguardando_leito: 0,
  i12_alta: 0,
  i12_bloco_cirurgico: 0,
  // 13
  i13_permanencia_oncologico: 0,
  // 14
  i14_laboratoriais: 0,
  i14_transfuscoes: 0,
  // 15
  i15_tomografias: 0,
  i15_angiotomografia: 0,
  i15_raio_x: 0,
  // 16
  i16_endoscopia: 0,
  i16_oftalmo: 0,
  i16_otorrino: 0,
  i16_ultrasson: 0,
  i16_urologia: 0,
  // FINANCEIRO
  fin_receita: 0, // Novo campo
  fin_pessoal: 0,
  fin_fornecedores: 0,
  fin_essenciais: 0,
  fin_servicos: 0,
  fin_rateio: 0,
  fin_total: 0,
  fin_percentual: 0
};

const PERIOD_OPTIONS = [
  { value: 'jan', label: 'Janeiro' },
  { value: 'feb', label: 'Fevereiro' },
  { value: 'mar', label: 'Março' },
  { value: 'apr', label: 'Abril' },
  { value: 'may', label: 'Maio' },
  { value: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' },
  { value: 'aug', label: 'Agosto' },
  { value: 'sep', label: 'Setembro' },
  { value: 'oct', label: 'Outubro' },
  { value: 'nov', label: 'Novembro' },
  { value: 'dec', label: 'Dezembro' },
  { value: 'q1', label: '1º Quadrimestre (Total)' },
  { value: 'q2', label: '2º Quadrimestre (Total)' },
  { value: 'q3', label: '3º Quadrimestre (Total)' },
];

const FINANCE_FIELDS = [
  { key: 'fin_receita', label: 'Faturamento Bruto (Receita)' },
  { key: 'fin_pessoal', label: 'Despesa Pessoal' },
  { key: 'fin_fornecedores', label: 'Fornecedores' },
  { key: 'fin_essenciais', label: 'Despesas Essenciais' },
  { key: 'fin_servicos', label: 'Prestação de Serviços' },
  { key: 'fin_rateio', label: 'Slip Rateio - HUSFP' },
  { key: 'fin_total', label: 'Despesas Totais do PSP' },
  { key: 'fin_percentual', label: 'Despesas do Pronto Socorro (%)' },
];

// Structure to hold all months and quarters
const DEFAULT_ALL_MONTHLY_STATS = PERIOD_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = { ...SINGLE_MONTH_STATS };
  return acc;
}, {} as Record<string, typeof SINGLE_MONTH_STATS>);

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Detailed Stats State (Stored by Period)
  const [allDetailedStats, setAllDetailedStats] = useState(DEFAULT_ALL_MONTHLY_STATS);
  
  // Per-Item Period Selection State
  const [itemPeriods, setItemPeriods] = useState<Record<string, string>>({
    i1: 'jan', i2: 'q1', i3: 'jan', i4: 'jan', 
    i5: 'jan', i6: 'jan', i7: 'jan', i8: 'jan',
    i9: 'jan', i10: 'jan', i11: 'jan', i12: 'jan', 
    i13: 'jan', i14: 'jan', i15: 'jan', i16: 'jan',
    // Finance items initialized individually
    fin_receita: 'jan',
    fin_pessoal: 'jan',
    fin_fornecedores: 'jan',
    fin_essenciais: 'jan',
    fin_servicos: 'jan',
    fin_rateio: 'jan',
    fin_total: 'jan',
    fin_percentual: 'jan'
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [financeSaveStatus, setFinanceSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'general' | 'finance' | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Check session
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
    
    // Load saved data
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    if (savedDetailedStats) {
       const parsed = JSON.parse(savedDetailedStats);
       setAllDetailedStats({ ...DEFAULT_ALL_MONTHLY_STATS, ...parsed });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Conselho@2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_session', 'true');
      setError('');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleSave = () => {
    localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(allDetailedStats));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleSaveFinance = () => {
    localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(allDetailedStats));
    setFinanceSaveStatus('saved');
    setTimeout(() => setFinanceSaveStatus('idle'), 3000);
  };

  const updateStat = (itemId: string, key: keyof typeof SINGLE_MONTH_STATS, value: string) => {
    const period = itemPeriods[itemId];
    setAllDetailedStats(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [key]: value
      }
    }));
  };

  const updateItemPeriod = (itemId: string, newPeriod: string) => {
    setItemPeriods(prev => ({
      ...prev,
      [itemId]: newPeriod
    }));
  };

  // --- Logic for Deletion ---
  const openDeleteModal = (target: 'general' | 'finance') => {
    setDeleteTarget(target);
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletePassword === 'Conselho@2026') {
      // Logic to clear data based on target
      const newStats = { ...allDetailedStats };
      
      if (deleteTarget === 'finance') {
        // Clear only financial fields for ALL periods or CURRENT?
        // Let's clear ALL financial fields for simplicity as "Exclusion" implies reset
        Object.keys(newStats).forEach(period => {
           FINANCE_FIELDS.forEach(field => {
             (newStats[period] as any)[field.key] = 0;
           });
        });
        setAllDetailedStats(newStats);
        localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(newStats));
        setFinanceSaveStatus('saved'); // Visually show something happened
      } else if (deleteTarget === 'general') {
        // Clear all non-financial fields
        Object.keys(newStats).forEach(period => {
          Object.keys(SINGLE_MONTH_STATS).forEach(key => {
            if (!key.startsWith('fin_')) {
              (newStats[period] as any)[key] = 0;
            }
          });
        });
        setAllDetailedStats(newStats);
        localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(newStats));
        setSaveStatus('saved');
      }

      setShowDeleteModal(false);
      setTimeout(() => {
        setSaveStatus('idle');
        setFinanceSaveStatus('idle');
        alert('Dados excluídos/zerados com sucesso.');
      }, 500);
    } else {
      setDeleteError('Senha incorreta.');
    }
  };

  // Helper Component for Item Header
  const ItemHeader = ({ itemId, title }: { itemId: string, title: string }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 border-b border-slate-100 pb-2">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <select 
        value={itemPeriods[itemId]}
        onChange={(e) => updateItemPeriod(itemId, e.target.value)}
        className="bg-white border border-blue-200 text-blue-800 text-xs rounded p-1.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
      >
        <optgroup label="Meses">
          {PERIOD_OPTIONS.filter(o => !o.value.startsWith('q')).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </optgroup>
        <optgroup label="Quadrimestres">
          {PERIOD_OPTIONS.filter(o => o.value.startsWith('q')).map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );

  // Helper to get stats for a specific item based on its selected period
  const getStats = (itemId: string) => {
    const period = itemPeriods[itemId];
    return allDetailedStats[period] || SINGLE_MONTH_STATS;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-100 rounded-full text-slate-600">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Área Administrativa</h2>
          <p className="text-center text-slate-500 mb-6">Digite a senha do conselho para acessar.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Senha de acesso"
            />
            {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
            <p className="text-slate-500 text-sm">Atualize os indicadores. Selecione o período (Mês ou Quadrimestre) individualmente em cada cartão.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openDeleteModal('general')}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
              title="Excluir Dados Gerais"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {saveStatus === 'saved' ? <CheckCircle size={20} /> : <Save size={20} />}
              {saveStatus === 'saved' ? 'Salvo!' : 'Salvar Geral'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <FileSpreadsheet size={18} />
              Indicadores Detalhados de Gestão
            </div>
          </div>

          <div className="p-6 space-y-8">
              
              {/* ITEM 1 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i1" title="1- N° de Acolhimentos e Consultas" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Acolhimento</label>
                    <input type="number" className="w-full p-2 border rounded" 
                      value={getStats('i1').i1_acolhimento} onChange={(e) => updateStat('i1', 'i1_acolhimento', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Consultas</label>
                    <input type="number" className="w-full p-2 border rounded" 
                      value={getStats('i1').i1_consultas} onChange={(e) => updateStat('i1', 'i1_consultas', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i2" title="2- TOTAL DE PACIENTES ATENDIDOS/ENCAMINHADOS (ADULTO E PEDIÁTRICO)" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Consultas PSP</label>
                    <input type="number" className="w-full p-2 border rounded" value={getStats('i2').i2_consultas_psp} onChange={(e) => updateStat('i2', 'i2_consultas_psp', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">UPA AREAL</label>
                    <input type="number" className="w-full p-2 border rounded" value={getStats('i2').i2_upa_areal} onChange={(e) => updateStat('i2', 'i2_upa_areal', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Traumato SC</label>
                    <input type="number" className="w-full p-2 border rounded" value={getStats('i2').i2_traumato_sc} onChange={(e) => updateStat('i2', 'i2_traumato_sc', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">UBS</label>
                    <input type="number" className="w-full p-2 border rounded" value={getStats('i2').i2_ubs} onChange={(e) => updateStat('i2', 'i2_ubs', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i3" title="3- Classificação de Risco dos Pacientes Atendidos" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-1">UBS</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_ubs} onChange={(e) => updateStat('i3', 'i3_ubs', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Traumato SC</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_traumato_sc} onChange={(e) => updateStat('i3', 'i3_traumato_sc', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Pouco Urgente</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_pouco_urgente} onChange={(e) => updateStat('i3', 'i3_pouco_urgente', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Urgência</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_urgencia} onChange={(e) => updateStat('i3', 'i3_urgencia', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Emergência</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_emergencia} onChange={(e) => updateStat('i3', 'i3_emergencia', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">UPA</label><input type="number" className="w-full p-2 border rounded" value={getStats('i3').i3_upa} onChange={(e) => updateStat('i3', 'i3_upa', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i4" title="4- PACIENTES PELOTAS / OUTROS MUNICÍPIOS ATENDIDOS NO PSP" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Pelotas</label><input type="number" className="w-full p-2 border rounded" value={getStats('i4').i4_pelotas} onChange={(e) => updateStat('i4', 'i4_pelotas', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Outros Municípios</label><input type="number" className="w-full p-2 border rounded" value={getStats('i4').i4_outros_municipios} onChange={(e) => updateStat('i4', 'i4_outros_municipios', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 5 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i5" title="5- NÚMERO DE ATENDIMENTOS POR ESPECIALIDADE" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Bucomaxilofacial</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_bucomaxilo} onChange={(e) => updateStat('i5', 'i5_bucomaxilo', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Cirurgia/Vasc/Angio</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_cirurgia_vascular} onChange={(e) => updateStat('i5', 'i5_cirurgia_vascular', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Clínica Médica</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_clinica_medica} onChange={(e) => updateStat('i5', 'i5_clinica_medica', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Ginecologia</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_ginecologia} onChange={(e) => updateStat('i5', 'i5_ginecologia', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Pediatria</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_pediatria} onChange={(e) => updateStat('i5', 'i5_pediatria', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Serviço Social</label><input type="number" className="w-full p-2 border rounded" value={getStats('i5').i5_servico_social} onChange={(e) => updateStat('i5', 'i5_servico_social', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 6 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i6" title="6- PACIENTES TRAZIDOS POR SAMU, ECOSUL, FORÇAS POLICIAIS" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">SAMU</label><input type="number" className="w-full p-2 border rounded" value={getStats('i6').i6_samu} onChange={(e) => updateStat('i6', 'i6_samu', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">ECOSUL</label><input type="number" className="w-full p-2 border rounded" value={getStats('i6').i6_ecosul} onChange={(e) => updateStat('i6', 'i6_ecosul', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Brigada Militar</label><input type="number" className="w-full p-2 border rounded" value={getStats('i6').i6_brigada_militar} onChange={(e) => updateStat('i6', 'i6_brigada_militar', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">SUSEPE</label><input type="number" className="w-full p-2 border rounded" value={getStats('i6').i6_susepe} onChange={(e) => updateStat('i6', 'i6_susepe', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Polícia Civil</label><input type="number" className="w-full p-2 border rounded" value={getStats('i6').i6_policia_civil} onChange={(e) => updateStat('i6', 'i6_policia_civil', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 7 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i7" title="7- VÍTIMAS DE ACIDENTE DE TRÂNSITO" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['i7_ac_bicicleta', 'i7_ac_caminhao', 'i7_ac_carro', 'i7_ac_moto', 'i7_ac_onibus', 'i7_atropelamento', 'i7_ac_charrete', 'i7_ac_trator'].map((key) => (
                    <div key={key}>
                        <label className="block text-xs text-slate-500 mb-1 capitalize">{key.replace('i7_', '').replace('ac_', '').replace('_', ' ')}</label>
                        <input type="number" className="w-full p-2 border rounded" 
                          value={(getStats('i7') as any)[key]} onChange={(e) => updateStat('i7', key as keyof typeof SINGLE_MONTH_STATS, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ITEM 8 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i8" title="8- OUTROS TIPOS DE ACIDENTE" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">AC Trabalho</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_ac_trabalho} onChange={(e) => updateStat('i8', 'i8_ac_trabalho', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Afogamento</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_afogamento} onChange={(e) => updateStat('i8', 'i8_afogamento', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Agressão</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_agressao} onChange={(e) => updateStat('i8', 'i8_agressao', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Choque Elétrico</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_choque_eletrico} onChange={(e) => updateStat('i8', 'i8_choque_eletrico', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Queda</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_queda} onChange={(e) => updateStat('i8', 'i8_queda', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Queimadura</label><input type="number" className="w-full p-2 border rounded" value={getStats('i8').i8_queimadura} onChange={(e) => updateStat('i8', 'i8_queimadura', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 9 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i9" title="9- VÍTIMAS POR ARMA DE FOGO E ARMA BRANCA" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Arma de Fogo</label><input type="number" className="w-full p-2 border rounded" value={getStats('i9').i9_arma_fogo} onChange={(e) => updateStat('i9', 'i9_arma_fogo', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Arma Branca</label><input type="number" className="w-full p-2 border rounded" value={getStats('i9').i9_arma_branca} onChange={(e) => updateStat('i9', 'i9_arma_branca', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 10 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i10" title="10- TAXA DE OCUPAÇÃO DE LEITOS PSP MÉDIA/DIA (%)" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Clínico Adulto</label>
                      <div className="flex items-center gap-1">
                        <input type="number" className="w-full p-2 border rounded" value={getStats('i10').i10_clinico_adulto} onChange={(e) => updateStat('i10', 'i10_clinico_adulto', e.target.value)} />
                        <span className="text-slate-500 font-bold text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">UTI Adulto</label>
                      <div className="flex items-center gap-1">
                        <input type="number" className="w-full p-2 border rounded" value={getStats('i10').i10_uti_adulto} onChange={(e) => updateStat('i10', 'i10_uti_adulto', e.target.value)} />
                        <span className="text-slate-500 font-bold text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Pediatria</label>
                      <div className="flex items-center gap-1">
                        <input type="number" className="w-full p-2 border rounded" value={getStats('i10').i10_pediatria} onChange={(e) => updateStat('i10', 'i10_pediatria', e.target.value)} />
                        <span className="text-slate-500 font-bold text-sm">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">UTI Pediatria</label>
                      <div className="flex items-center gap-1">
                        <input type="number" className="w-full p-2 border rounded" value={getStats('i10').i10_uti_pediatria} onChange={(e) => updateStat('i10', 'i10_uti_pediatria', e.target.value)} />
                        <span className="text-slate-500 font-bold text-sm">%</span>
                      </div>
                    </div>
                </div>
              </div>

              {/* ITEM 11 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i11" title="11- MÉDIA PERMANÊNCIA AGUARDANDO LEITO" />
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-1">Clínico Adulto</label><input type="number" className="w-full p-2 border rounded" value={getStats('i11').i11_mp_clinico_adulto} onChange={(e) => updateStat('i11', 'i11_mp_clinico_adulto', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">UTI Adulto</label><input type="number" className="w-full p-2 border rounded" value={getStats('i11').i11_mp_uti_adulto} onChange={(e) => updateStat('i11', 'i11_mp_uti_adulto', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Pediatria</label><input type="number" className="w-full p-2 border rounded" value={getStats('i11').i11_mp_pediatria} onChange={(e) => updateStat('i11', 'i11_mp_pediatria', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">UTI Pediatria</label><input type="number" className="w-full p-2 border rounded" value={getStats('i11').i11_mp_uti_pediatria} onChange={(e) => updateStat('i11', 'i11_mp_uti_pediatria', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 12 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i12" title="12- PACIENTES ADULTOS AGUARDANDO + ALTAS + BLOCO" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-1">Aguardando Leito</label><input type="number" className="w-full p-2 border rounded" value={getStats('i12').i12_aguardando_leito} onChange={(e) => updateStat('i12', 'i12_aguardando_leito', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Alta</label><input type="number" className="w-full p-2 border rounded" value={getStats('i12').i12_alta} onChange={(e) => updateStat('i12', 'i12_alta', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Bloco Cirúrgico</label><input type="number" className="w-full p-2 border rounded" value={getStats('i12').i12_bloco_cirurgico} onChange={(e) => updateStat('i12', 'i12_bloco_cirurgico', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 13 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i13" title="13- MÉDIA PERMANÊNCIA ONCOLÓGICOS AGUARDANDO" />
                <div className="flex items-center gap-2">
                   <input 
                      type="number" 
                      className="w-full p-2 border rounded" 
                      value={getStats('i13').i13_permanencia_oncologico} 
                      onChange={(e) => updateStat('i13', 'i13_permanencia_oncologico', e.target.value)} 
                   />
                   <span className="text-slate-500 text-xs font-medium">dias</span>
                </div>
              </div>

              {/* ITEM 14 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i14" title="14- EXAMES DE ANÁLISES CLÍNICAS E TRANSFUSÕES" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">Laboratoriais</label><input type="number" className="w-full p-2 border rounded" value={getStats('i14').i14_laboratoriais} onChange={(e) => updateStat('i14', 'i14_laboratoriais', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">Transfusões</label><input type="number" className="w-full p-2 border rounded" value={getStats('i14').i14_transfuscoes} onChange={(e) => updateStat('i14', 'i14_transfuscoes', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 15 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i15" title="15- EXAMES DE IMAGEM" />
                <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-1">Tomografias</label><input type="number" className="w-full p-2 border rounded" value={getStats('i15').i15_tomografias} onChange={(e) => updateStat('i15', 'i15_tomografias', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Angiotomografia</label><input type="number" className="w-full p-2 border rounded" value={getStats('i15').i15_angiotomografia} onChange={(e) => updateStat('i15', 'i15_angiotomografia', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Raio X</label><input type="number" className="w-full p-2 border rounded" value={getStats('i15').i15_raio_x} onChange={(e) => updateStat('i15', 'i15_raio_x', e.target.value)} /></div>
                </div>
              </div>

              {/* ITEM 16 */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                <ItemHeader itemId="i16" title="16- EXAMES ESPECIAIS (Endo, Oftalmo, Otorrino, Ultra, Uro)" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><label className="block text-xs text-slate-500 mb-1">Endoscopia</label><input type="number" className="w-full p-2 border rounded" value={getStats('i16').i16_endoscopia} onChange={(e) => updateStat('i16', 'i16_endoscopia', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Oftalmo</label><input type="number" className="w-full p-2 border rounded" value={getStats('i16').i16_oftalmo} onChange={(e) => updateStat('i16', 'i16_oftalmo', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Otorrino</label><input type="number" className="w-full p-2 border rounded" value={getStats('i16').i16_otorrino} onChange={(e) => updateStat('i16', 'i16_otorrino', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Ultrasson</label><input type="number" className="w-full p-2 border rounded" value={getStats('i16').i16_ultrasson} onChange={(e) => updateStat('i16', 'i16_ultrasson', e.target.value)} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Urologia</label><input type="number" className="w-full p-2 border rounded" value={getStats('i16').i16_urologia} onChange={(e) => updateStat('i16', 'i16_urologia', e.target.value)} /></div>
                </div>
              </div>

              {/* FINANCEIRO - SEPARADO ITEM POR ITEM */}
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-emerald-200 pb-2 gap-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <DollarSign size={20} />
                    DADOS FINANCEIROS
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDeleteModal('finance')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-100 hover:bg-red-200 border border-red-200 transition-all"
                      title="Excluir Dados Financeiros"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={handleSaveFinance}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
                        financeSaveStatus === 'saved' ? 'bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {financeSaveStatus === 'saved' ? <CheckCircle size={16} /> : <Save size={16} />}
                      {financeSaveStatus === 'saved' ? 'Salvo!' : 'Salvar Finanças'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {FINANCE_FIELDS.map((field) => (
                      <div key={field.key} className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                          <ItemHeader itemId={field.key} title={field.label} />
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold text-sm">R$</span>
                            <input 
                                type="number" 
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={(getStats(field.key) as any)[field.key]} 
                                onChange={(e) => updateStat(field.key, field.key as keyof typeof SINGLE_MONTH_STATS, e.target.value)} 
                            />
                          </div>
                      </div>
                    ))}
                </div>
              </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <Trash2 size={20} />
                Excluir Dados {deleteTarget === 'finance' ? 'Financeiros' : 'Gerais'}
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-red-400 hover:text-red-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>Atenção: Esta ação irá <strong>ZERAR</strong> todos os campos da seção selecionada. Isso é irreversível.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Senha de Administrador</label>
                <input 
                  type="password" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Digite a senha para confirmar..."
                />
                {deleteError && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {deleteError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;