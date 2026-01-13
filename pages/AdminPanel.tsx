
import React, { useState, useEffect } from 'react';
import { 
  Lock, Save, AlertCircle, CheckCircle, FileSpreadsheet, 
  Trash2, Edit3, ShieldAlert
} from 'lucide-react';

const SINGLE_MONTH_STATS = {
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
  i16_endoscopia: 0, i16_oftalmo: 0, i16_otorrino: 0, i16_ultrasson: 0, i16_urologia: 0,
  fin_pessoal: 0, fin_fornecedores: 0, fin_essenciais: 0, fin_servicos: 0, fin_rateio: 0, fin_total: 0, fin_percentual: 0
};

const PERIOD_OPTIONS = [
  { value: 'jan', label: 'Janeiro' }, { value: 'feb', label: 'Fevereiro' }, { value: 'mar', label: 'Março' },
  { value: 'apr', label: 'Abril' }, { value: 'may', label: 'Maio' }, { value: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' }, { value: 'aug', label: 'Agosto' }, { value: 'sep', label: 'Setembro' },
  { value: 'oct', label: 'Outubro' }, { value: 'nov', label: 'Novembro' }, { value: 'dec', label: 'Dezembro' },
  { value: 'q1', label: '1º Quadrimestre (Total)' }, { value: 'q2', label: '2º Quadrimestre (Total)' }, { value: 'q3', label: '3º Quadrimestre (Total)' },
];

const DEFAULT_ALL_MONTHLY_STATS = PERIOD_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = { ...SINGLE_MONTH_STATS };
  return acc;
}, {} as Record<string, typeof SINGLE_MONTH_STATS>);

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [allDetailedStats, setAllDetailedStats] = useState(DEFAULT_ALL_MONTHLY_STATS);
  
  const [itemPeriods, setItemPeriods] = useState<Record<string, string>>({
    i1: 'jan', i10: 'jan'
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') setIsAuthenticated(true);
    
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    if (savedDetailedStats) setAllDetailedStats({ ...DEFAULT_ALL_MONTHLY_STATS, ...JSON.parse(savedDetailedStats) });
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

  const updateStat = (itemId: string, key: keyof typeof SINGLE_MONTH_STATS, value: string) => {
    const period = itemPeriods[itemId] || 'jan';
    setAllDetailedStats(prev => ({ ...prev, [period]: { ...prev[period], [key]: value } }));
  };

  const ItemHeader = ({ itemId, title }: { itemId: string, title: string }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 border-b border-slate-100 pb-2">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <select 
        value={itemPeriods[itemId] || 'jan'}
        onChange={(e) => setItemPeriods(prev => ({ ...prev, [itemId]: e.target.value }))}
        className="bg-white border border-blue-200 text-blue-800 text-xs rounded p-1.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
      >
        {PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  const getStats = (itemId: string) => allDetailedStats[itemPeriods[itemId] || 'jan'] || SINGLE_MONTH_STATS;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-200 animate-fade-in text-center">
          <div className="p-5 bg-slate-900 text-white rounded-3xl w-24 h-24 mx-auto mb-8 flex items-center justify-center shadow-2xl">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Área Restrita</h2>
          <p className="text-slate-500 mb-8 text-xs font-black uppercase tracking-[0.2em] opacity-80">Gestão de Dados Técnicos</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[28px] focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-center font-bold text-2xl tracking-[0.3em]" placeholder="****" />
            {error && <p className="text-red-500 text-xs font-black uppercase flex items-center justify-center gap-1 animate-pulse"><AlertCircle size={14}/> {error}</p>}
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black hover:bg-black transition-all shadow-xl uppercase tracking-widest text-sm">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
      {/* HEADER PADRONIZADO ADMIN */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Administração</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80 italic">
               Gerenciamento centralizado de dados técnicos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
           <div className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black border-2 border-indigo-100 flex items-center gap-3 uppercase tracking-widest shadow-sm">
             <FileSpreadsheet size={18} /> GESTÃO DE DADOS
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-5 rounded-[28px] text-white shadow-2xl shadow-slate-200">
          <span className="text-xs font-black uppercase tracking-[0.2em] ml-4">Sincronização de Banco de Dados</span>
          <button onClick={handleSave} className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black transition-all uppercase tracking-widest text-xs ${saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20'}`}>
            {saveStatus === 'saved' ? <CheckCircle size={18} /> : <Save size={18} />}
            {saveStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
              <ItemHeader itemId="i1" title="1- Acolhimentos e Consultas" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Acolhimento</label>
                  <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={getStats('i1').i1_acolhimento} onChange={(e) => updateStat('i1', 'i1_acolhimento', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Consultas</label>
                  <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={getStats('i1').i1_consultas} onChange={(e) => updateStat('i1', 'i1_consultas', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
              <ItemHeader itemId="i10" title="10- Taxa Ocupação Média (%)" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Clínico Adulto</label>
                  <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={getStats('i10').i10_clinico_adulto} onChange={(e) => updateStat('i10', 'i10_clinico_adulto', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">UTI Adulto</label>
                  <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={getStats('i10').i10_uti_adulto} onChange={(e) => updateStat('i10', 'i10_uti_adulto', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="col-span-full p-16 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
              Sincronização de Dados Estratégicos Ativa
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
