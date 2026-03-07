
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Activity, AlertTriangle, 
  Calendar, Download, Clock, CheckCircle2, 
  PlusCircle, Save, X as CloseIcon, FileText, Table as TableIcon,
  Trash2, BarChart3, LayoutGrid, ExternalLink, Sparkles, Users
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const RiskClassificationPanel: React.FC = () => {
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  
  // Daily Entry State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryValues, setEntryValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = () => {
      const dailySaved = localStorage.getItem('ps_daily_occupancy_records');
      if (dailySaved) setDailyRecords(JSON.parse(dailySaved));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const riskCategories = useMemo(() => [
    { id: 'vermelho', name: 'Vermelho', key: 'risk_vermelho', icon: AlertTriangle, color: '#ef4444' },
    { id: 'laranja', name: 'Laranja (CRAI)', key: 'risk_laranja', icon: AlertTriangle, color: '#f97316' },
    { id: 'amarelo', name: 'Amarelo', key: 'risk_amarelo', icon: AlertTriangle, color: '#eab308' },
    { id: 'verde', name: 'Verde', key: 'risk_verde', icon: AlertTriangle, color: '#22c55e' },
    { id: 'azul', name: 'Azul', key: 'risk_azul', icon: AlertTriangle, color: '#3b82f6' },
  ], []);

  const latestRecord = useMemo(() => {
    return [...dailyRecords]
      .filter(r => r.date.startsWith(selectedYear))
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [dailyRecords, selectedYear]);

  const latestTotal = useMemo(() => {
    if (!latestRecord) return 0;
    return riskCategories.reduce((acc, cat) => acc + (parseFloat(latestRecord.values[cat.key]) || 0), 0);
  }, [latestRecord, riskCategories]);

  const movementStats = useMemo(() => {
    const yearRecords = dailyRecords
      .filter(r => r.date.startsWith(selectedYear))
      .map(r => ({
        ...r,
        total: riskCategories.reduce((acc, cat) => acc + (parseFloat(r.values[cat.key]) || 0), 0)
      }))
      .filter(r => r.total > 0);

    if (yearRecords.length === 0) return { max: null, min: null };

    const sorted = [...yearRecords].sort((a, b) => b.total - a.total);
    return {
      max: sorted[0],
      min: sorted[sorted.length - 1]
    };
  }, [dailyRecords, selectedYear, riskCategories]);

  const calculateAverage = (key: string) => {
    const yearDaily = dailyRecords.filter(r => r.date.startsWith(selectedYear));
    if (yearDaily.length > 0) {
      const values = yearDaily.map(r => parseFloat(r.values[key]) || 0).filter(v => v > 0);
      if (values.length > 0) {
        return values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    return 0;
  };

  const handleSaveDaily = async () => {
    const exists = dailyRecords.some(r => r.date === entryDate);
    if (exists) {
      const confirmOverwrite = window.confirm(`Já existe um registro para a data ${entryDate.split('-').reverse().join('/')}. Deseja sobrescrever os dados existentes?`);
      if (!confirmOverwrite) return;
    }

    // Preserve other values (like occupancy) if they exist for this date
    const existingRecord = dailyRecords.find(r => r.date === entryDate);
    const newRecord = {
      date: entryDate,
      values: { 
        ...(existingRecord?.values || {}),
        ...entryValues 
      }
    };

    const updatedRecords = [...dailyRecords.filter(r => r.date !== entryDate), newRecord];
    setDailyRecords(updatedRecords);
    await storage.setItem('ps_daily_occupancy_records', updatedRecords);
    setIsEntryModalOpen(false);
    setEntryValues({});
    alert("Dados salvos com sucesso!");
  };

  const handleDeleteDaily = async (date: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o registro do dia ${date.split('-').reverse().join('/')}?`)) {
      const updatedRecords = dailyRecords.filter(r => r.date !== date);
      setDailyRecords(updatedRecords);
      await storage.setItem('ps_daily_occupancy_records', updatedRecords);
    }
  };

  const handleDownloadXLSX = () => {
    if (dailyRecords.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }

    const wsData = dailyRecords
      .filter(r => r.date.startsWith(selectedYear))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(record => {
        const row: any = { 'Data': record.date };
        riskCategories.forEach(cat => {
          row[cat.name] = record.values[cat.key] ? record.values[cat.key] : '-';
        });
        return row;
      });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classificação de Risco");
    XLSX.writeFile(wb, `classificacao_risco_${selectedYear}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-b-[12px] border-red-600 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl transform -rotate-2">
             <ShieldCheck size={40} strokeWidth={3} className="text-red-600" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="risk_panel_main_title" defaultText="Acolhimento e Classificação de Risco" />
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <p className="text-red-400 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]">
                 <Activity size={18} />
                 <EditableText id="risk_monitor_label" defaultText="Monitoramento de Fluxo por Gravidade" /> {selectedYear}
              </p>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                 {['2025', '2026', '2027', '2028', '2029'].map(yr => (
                   <button 
                     key={yr} 
                     onClick={() => setSelectedYear(yr)}
                     className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {yr}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <button 
             onClick={() => setIsEntryModalOpen(true)}
             className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
           >
             <PlusCircle size={18} />
             <EditableText id="risk_btn_daily_entry" defaultText="Lançamento Diário" />
           </button>
        </div>
      </div>

      {/* TOTAL DO DIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-slate-900 p-10 rounded-[48px] shadow-2xl border-b-[12px] border-emerald-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl shadow-sm">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                <EditableText id="risk_total_day_title" defaultText="Total do Dia" />
              </h3>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-6xl font-black text-white tracking-tighter italic">{latestTotal}</h2>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acolhimentos</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} className="text-emerald-500" />
              {latestRecord ? `Referente a: ${latestRecord.date.split('-').reverse().join('/')}` : 'Nenhum registro hoje'}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <EditableText id="risk_max_mov_label" defaultText="Maior Movimento" />
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-slate-800">{movementStats.max ? movementStats.max.total : '-'}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes</span>
                </div>
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">
                  {movementStats.max ? movementStats.max.date.split('-').reverse().join('/') : 'Sem dados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <EditableText id="risk_min_mov_label" defaultText="Menor Movimento" />
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-slate-800">{movementStats.min ? movementStats.min.total : '-'}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes</span>
                </div>
                <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">
                  {movementStats.min ? movementStats.min.date.split('-').reverse().join('/') : 'Sem dados'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS POR CATEGORIA */}
      <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><LayoutGrid size={28}/></div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
              <EditableText id="risk_status_title_page" defaultText="Distribuição de Pacientes" />
            </h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
          {riskCategories.map((cat) => {
            const avg = calculateAverage(cat.key) || 0;
            
            return (
              <div key={cat.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm" style={{ color: cat.color }}>
                    <cat.icon size={20} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <EditableText id={`risk_cat_label_page_${cat.id}`} defaultText={cat.name} />
                </p>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-2xl font-black text-slate-800">{Math.round(avg)}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (avg/50)*100)}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DynamicNotes sectionId={`risk_panel_${selectedYear}`} />

      {/* TABELA DE HISTÓRICO */}
      <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><TableIcon size={28}/></div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                <EditableText id="risk_history_title" defaultText="Histórico de Classificações" />
              </h3>
              <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
                <EditableText id="risk_history_subtitle" defaultText="Registros diários de acolhimento" />
              </p>
            </div>
          </div>
          <button 
            onClick={handleDownloadXLSX}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20"
          >
            <FileText size={18} />
            <EditableText id="risk_btn_export" defaultText="Exportar XLSX" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-10 px-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                {riskCategories.map(cat => (
                  <th key={cat.id} className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <cat.icon size={14} style={{ color: cat.color }} />
                      {cat.name}
                    </div>
                  </th>
                ))}
                <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dailyRecords
                .filter(r => r.date.startsWith(selectedYear))
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 px-4 font-black text-slate-800 text-sm">{record.date.split('-').reverse().join('/')}</td>
                    {riskCategories.map(cat => (
                      <td key={cat.id} className="py-6 px-4">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-600">
                          {record.values[cat.key] ? `${record.values[cat.key]}` : '-'}
                        </span>
                      </td>
                    ))}
                    <td className="py-6 px-4 text-right">
                      <button 
                        onClick={() => handleDeleteDaily(record.date)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE LANÇAMENTO */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Lançamento de Risco</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Registrar pacientes por cor</p>
                </div>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <CloseIcon size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Registro</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {riskCategories.map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <cat.icon size={14} style={{ color: cat.color }} />
                      {cat.name}
                    </label>
                    <input 
                      type="number" 
                      placeholder="0"
                      min="0"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                      value={entryValues[cat.key] || ''}
                      onChange={(e) => setEntryValues({...entryValues, [cat.key]: e.target.value})}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsEntryModalOpen(false)}
                  className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveDaily}
                  className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  Salvar Registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO PROJETO CUIDA+ */}
      <div className="flex justify-center pt-12 pb-8">
        <a 
          href="https://drive.google.com/file/d/1oB5s2rZEhCwyPPJ1QLzxiBp1QlZjb7n2/view" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative group overflow-hidden flex flex-col md:flex-row items-center gap-8 px-12 py-10 bg-slate-900 text-white rounded-[48px] shadow-2xl transition-all transform hover:-translate-y-2 border border-white/10 w-full max-w-3xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[100px] group-hover:bg-red-600/30 transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 p-6 bg-gradient-to-br from-red-500 to-indigo-700 rounded-[32px] shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
            <Sparkles size={40} className="text-white" />
          </div>
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-red-500/30">
                Institucional
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Documentação Estratégica</p>
            </div>
            <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Projeto Cuida+</h4>
            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">Acesse as diretrizes completas, objetivos e o plano de ação detalhado para a humanização e eficiência do atendimento.</p>
          </div>
          
          <div className="relative z-10 p-5 bg-white/5 rounded-full text-slate-500 group-hover:text-white group-hover:bg-red-600 group-hover:scale-110 transition-all duration-300 shadow-xl">
            <ExternalLink size={24} />
          </div>
        </a>
      </div>
    </div>
  );
};

export default RiskClassificationPanel;
