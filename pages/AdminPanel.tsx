
import React, { useState, useEffect } from 'react';
import { 
  Lock, Save, AlertCircle, CheckCircle, FileSpreadsheet, 
  Trash2, Edit3, ShieldAlert, Calendar
} from 'lucide-react';

const SINGLE_MONTH_STATS = {
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
  i16_endoscopia: 0, i16_oftalmo: 0, i16_otorrino: 0, i16_ultrasson: 0, i16_urologia: 0,
  fin_pessoal: 0, fin_fornecedores: 0, fin_essenciais: 0, fin_servicos: 0, fin_rateio: 0, fin_total: 0, fin_percentual: 0
};

const PERIOD_OPTIONS = [
  { value: 'jan', label: 'Janeiro' }, { value: 'feb', label: 'Fevereiro' }, { value: 'mar', label: 'Março' },
  { value: 'apr', label: 'Abril' }, { value: 'may', label: 'Maio' }, { id: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' }, { value: 'aug', label: 'Agosto' }, { value: 'sep', label: 'Setembro' },
  { value: 'oct', label: 'Outubro' }, { value: 'nov', label: 'Novembro' }, { value: 'dec', label: 'Dezembro' }
];

const YEAR_OPTIONS = ['2025', '2026', '2027', '2028', '2029'];

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [allYearsData, setAllYearsData] = useState<Record<string, any>>({});
  const [itemPeriods, setItemPeriods] = useState<Record<string, string>>({
    i1: 'jan', i10: 'jan', i2: 'jan', i3: 'jan', i4: 'jan', i5: 'jan', i6: 'jan', i7: 'jan', i8: 'jan', i9: 'jan', i11: 'jan', i12: 'jan', i14: 'jan', i15: 'jan', i16: 'jan', fin: 'jan'
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') setIsAuthenticated(true);
    
    const raw = localStorage.getItem('ps_monthly_detailed_stats');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.jan || parsed.feb) {
        setAllYearsData({ "2025": parsed });
      } else {
        setAllYearsData(parsed);
      }
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
    localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(allYearsData));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const updateStat = (itemId: string, key: string, value: string) => {
    const period = itemPeriods[itemId] || 'jan';
    const newAllData = { ...allYearsData };
    if (!newAllData[selectedYear]) newAllData[selectedYear] = {};
    if (!newAllData[selectedYear][period]) newAllData[selectedYear][period] = { ...SINGLE_MONTH_STATS };
    
    newAllData[selectedYear][period][key] = value;
    setAllYearsData(newAllData);
  };

  const getStats = (itemId: string) => {
    const period = itemPeriods[itemId] || 'jan';
    return allYearsData[selectedYear]?.[period] || SINGLE_MONTH_STATS;
  };

  const ItemHeader = ({ itemId, title }: { itemId: string, title: string }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 border-b border-slate-100 pb-2">
      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tighter">{title}</h3>
      <select 
        value={itemPeriods[itemId] || 'jan'}
        onChange={(e) => setItemPeriods(prev => ({ ...prev, [itemId]: e.target.value }))}
        className="bg-white border border-blue-200 text-blue-800 text-[10px] font-black uppercase rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px] shadow-sm"
      >
        {PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

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
      {/* HEADER ESTRUTURADO POR ANO */}
      <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Administração</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
               Configuração Global de Indicadores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-[28px] border border-slate-200 shadow-inner">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Exercício:</span>
           {YEAR_OPTIONS.map(yr => (
             <button 
               key={yr} 
               onClick={() => setSelectedYear(yr)}
               className={`px-8 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${selectedYear === yr ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {yr}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-5 rounded-[28px] text-white shadow-2xl">
          <div className="flex items-center gap-4 ml-4">
            <Calendar size={18} className="text-blue-400"/>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Editando Exercício {selectedYear}</span>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black transition-all uppercase tracking-widest text-xs ${saveStatus === 'saved' ? 'bg-emerald-50 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl'}`}>
            {saveStatus === 'saved' ? <CheckCircle size={18} /> : <Save size={18} />}
            {saveStatus === 'saved' ? 'Sincronizado!' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner space-y-6">
              <ItemHeader itemId="i1" title="Fluxo: Acolhimentos e Consultas" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Acolhimento</label>
                  <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={getStats('i1').i1_acolhimento} onChange={(e) => updateStat('i1', 'i1_acolhimento', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Consultas</label>
                  <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={getStats('i1').i1_consultas} onChange={(e) => updateStat('i1', 'i1_consultas', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner space-y-6">
              <ItemHeader itemId="i10" title="Ocupação: Leitos Adultos (%)" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Clínico Adulto</label>
                  <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={getStats('i10').i10_clinico_adulto} onChange={(e) => updateStat('i10', 'i10_clinico_adulto', e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">UTI Adulto</label>
                  <input type="number" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 outline-none" value={getStats('i10').i10_uti_adulto} onChange={(e) => updateStat('i10', 'i10_uti_adulto', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner space-y-6 md:col-span-2">
              <ItemHeader itemId="fin" title="Gestão Financeira (Valores Brutos R$)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { k: 'fin_pessoal', l: 'Pessoal' },
                  { k: 'fin_fornecedores', l: 'Fornecedores' },
                  { k: 'fin_essenciais', l: 'Essenciais' },
                  { k: 'fin_servicos', l: 'Prestação Serviço' },
                  { k: 'fin_rateio', l: 'Rateio HUSFP' }
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">{f.l}</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none" value={getStats('fin')[f.k]} onChange={(e) => updateStat('fin', f.k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-span-full p-10 text-center">
              <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">Banco de Dados Estratégico - Exercício {selectedYear}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
