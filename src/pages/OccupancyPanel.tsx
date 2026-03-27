
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BedDouble, Users, Activity, AlertTriangle, 
  TrendingUp, Calendar, Download, Share2,
  Clock, CheckCircle2, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Loader2, LayoutGrid, BarChart3,
  Stethoscope, Baby, Zap, HeartPulse, Sparkles,
  PlusCircle, Save, X as CloseIcon, FileText, Table as TableIcon,
  Trash2, ArrowRightLeft, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import * as XLSX from 'xlsx';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';
import { PasswordModal } from '../components/PasswordModal';
import { usePasswordPrompt } from '../hooks/usePasswordPrompt';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const OccupancyPanel: React.FC = () => {
  const { passwordModal, requestPassword, closePasswordModal } = usePasswordPrompt();
  const [data, setData] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [selectedHistoryDates, setSelectedHistoryDates] = useState<string[]>([]);
  
  // Daily Entry State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([{ date: new Date().toISOString().split('T')[0], values: {} }]);
  
  const addEntry = () => {
    const lastDate = entries[entries.length - 1].date;
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    setEntries([...entries, { 
      date: nextDate.toISOString().split('T')[0], 
      values: {} 
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newEntries = [...entries];
    if (field === 'date') {
      newEntries[index].date = value;
    } else {
      newEntries[index].values = { ...newEntries[index].values, [field]: value };
    }
    setEntries(newEntries);
  };

  const openModal = () => {
    setEntries([{ date: new Date().toISOString().split('T')[0], values: {} }]);
    setIsEntryModalOpen(true);
  };
  
  // Comparison State
  const [compareDateA, setCompareDateA] = useState(new Date().toISOString().split('T')[0]);
  const [compareDateB, setCompareDateB] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const load = async () => {
      const saved = await storage.getItem('ps_monthly_detailed_stats');
      if (saved) setData(saved);
      
      const dailySaved = await storage.getItem('ps_daily_occupancy_records');
      if (dailySaved) {
        const sorted = Array.isArray(dailySaved) ? [...dailySaved].sort((a, b) => b.date.localeCompare(a.date)) : [];
        setDailyRecords(sorted);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const getYearlyData = useMemo(() => {
    if (!data) return [];
    if (data[selectedYear]) return Object.values(data[selectedYear]);
    return Object.values(data);
  }, [data, selectedYear]);

  const calculateAverage = (key: string) => {
    // Check daily records first for the selected year
    const yearDaily = dailyRecords
      .filter(r => r.date.startsWith(selectedYear))
      .sort((a, b) => b.date.localeCompare(a.date));

    if (yearDaily.length > 0) {
      // Prioritize the LATEST record for "Status" view to show current data
      const latestWithKey = yearDaily.find(r => r.values[key] !== undefined && r.values[key] !== null && r.values[key] !== '');
      if (latestWithKey) {
        return parseFloat(latestWithKey.values[key]) || 0;
      }
      
      const values = yearDaily.map(r => parseFloat(r.values[key]) || 0).filter(v => v > 0);
      if (values.length > 0) {
        return values.reduce((a, b) => a + b, 0) / values.length;
      }
    }

    // Fallback to monthly data
    const values = getYearlyData.map((p: any) => parseFloat(p[key]) || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  const handleSaveDaily = async () => {
    requestPassword("Digite a senha mestre para salvar os registros diários:", (pw) => {
      if (pw !== 'Conselho@2026') return;

      let updatedRecords = [...dailyRecords];

      for (const entry of entries) {
        if (!entry.date) continue;
        
        const existingRecord = updatedRecords.find(r => r.date === entry.date);
        if (existingRecord) {
          const confirmOverwrite = window.confirm(`Já existe um registro para a data ${entry.date.split('-').reverse().join('/')}. Deseja mesclar os novos dados com os existentes?`);
          if (!confirmOverwrite) continue;
        }

        const newRecord = {
          date: entry.date,
          values: { 
            ...(existingRecord?.values || {}),
            ...entry.values 
          }
        };

        updatedRecords = [...updatedRecords.filter(r => r.date !== entry.date), newRecord];
      }

      const sortedRecords = [...updatedRecords].sort((a, b) => b.date.localeCompare(a.date));
      setDailyRecords(sortedRecords);
      storage.setItem('ps_daily_occupancy_records', sortedRecords);
      setIsEntryModalOpen(false);
      setEntries([{ date: new Date().toISOString().split('T')[0], values: {} }]);
      alert("Dados salvos com sucesso!");
    });
  };

  const handleDeleteDaily = async (date: string) => {
    requestPassword(`Para excluir o registro do dia ${date.split('-').reverse().join('/')}, digite a senha mestre:`, (pw) => {
      if (pw !== 'Conselho@2026') return;
      if (window.confirm(`Tem certeza que deseja excluir o registro do dia ${date.split('-').reverse().join('/')}?`)) {
        const updatedRecords = dailyRecords.filter(r => r.date !== date);
        setDailyRecords(updatedRecords);
        storage.setItem('ps_daily_occupancy_records', updatedRecords);
        setSelectedHistoryDates(prev => prev.filter(d => d !== date));
      }
    });
  };

  const handleBulkDeleteDaily = async () => {
    if (selectedHistoryDates.length === 0) return;
    
    requestPassword(`Para excluir os ${selectedHistoryDates.length} registros selecionados, digite a senha mestre:`, (pw) => {
      if (pw !== 'Conselho@2026') return;
      
      if (window.confirm(`Tem certeza que deseja excluir os ${selectedHistoryDates.length} registros selecionados?`)) {
        const updatedRecords = dailyRecords.filter(r => !selectedHistoryDates.includes(r.date));
        setDailyRecords(updatedRecords);
        storage.setItem('ps_daily_occupancy_records', updatedRecords);
        setSelectedHistoryDates([]);
        alert("Registros excluídos com sucesso!");
      }
    });
  };

  const toggleSelectAllHistory = (records: any[]) => {
    if (selectedHistoryDates.length === records.length) {
      setSelectedHistoryDates([]);
    } else {
      setSelectedHistoryDates(records.map(r => r.date));
    }
  };

  const toggleSelectHistoryDate = (date: string) => {
    setSelectedHistoryDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const calculateTotal = (key: string) => {
    return getYearlyData.reduce((acc: number, curr: any) => acc + (parseFloat(curr[key]) || 0), 0);
  };

  // Unidades solicitadas: Clínicos, Cuida+, Leitos UTI (Variável), Pediátricos, Pediátricos Cuida+ e Estabilização
  const units = useMemo(() => [
    { id: 'clinicos', name: 'Clínicos', key: 'i10_clinico_adulto', icon: Stethoscope, color: '#2563eb', capacity: 46 },
    { id: 'cuida_plus', name: 'Cuida+', key: 'i10_cuida_plus', icon: HeartPulse, color: '#0891b2' },
    { id: 'uti_var', name: 'Leitos UTI (Variável)', key: 'i10_uti_adulto', icon: Activity, color: '#dc2626', capacity: 7 },
    { id: 'pediatricos', name: 'Pediátricos', key: 'i10_pediatrico', icon: Baby, color: '#ec4899', capacity: 8 },
    { id: 'ped_cuida_plus', name: 'Pediátricos Cuida+', key: 'i10_ped_cuida_plus', icon: Sparkles, color: '#8b5cf6' },
    { id: 'estabilizacao', name: 'Estabilização', key: 'i10_estabilizacao', icon: Zap, color: '#f59e0b' },
  ], []);

  const unitData = useMemo(() => {
    return units.map(unit => ({
      name: unit.name,
      value: calculateAverage(unit.key) || Math.floor(Math.random() * 40) + 60, // Mock if no data yet
      color: unit.color,
      fullKey: unit.key
    }));
  }, [getYearlyData, units, dailyRecords]);

  const monthlyChartData = useMemo(() => {
    return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, idx) => {
      const monthKey = (idx + 1).toString().padStart(2, '0');
      const monthData = (data[selectedYear] && data[selectedYear][monthKey]) || {};
      return {
        name: month,
        ocupacao: parseFloat(monthData.i10_clinico_adulto) || 0,
        uti: parseFloat(monthData.i10_uti_adulto) || 0
      };
    });
  }, [data, selectedYear]);

  const monthlyExtremes = useMemo(() => {
    const monthDaily = dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`));
    
    if (monthDaily.length === 0) return null;

    const findExtreme = (key: string, type: 'max' | 'min') => {
      return monthDaily.reduce((prev, curr) => {
        const val = parseFloat(curr.values[key]) || 0;
        const prevVal = parseFloat(prev.values[key]) || (type === 'max' ? -1 : 101);
        if (type === 'max') return val > prevVal ? curr : prev;
        return val < prevVal ? curr : prev;
      }, monthDaily[0]);
    };

    const findTotalExtreme = (type: 'max' | 'min') => {
      return monthDaily.reduce((prev, curr) => {
        const calculateTotal = (record: any) => {
          return units.reduce((acc, unit) => acc + (parseFloat(record.values[unit.key]) || 0), 0);
        };
        const val = calculateTotal(curr);
        const prevVal = calculateTotal(prev);
        if (type === 'max') return val > prevVal ? curr : prev;
        return val < prevVal ? curr : prev;
      }, monthDaily[0]);
    };

    return {
      total: {
        max: findTotalExtreme('max'),
        min: findTotalExtreme('min')
      },
      clinicos: {
        max: findExtreme('i10_clinico_adulto', 'max'),
        min: findExtreme('i10_clinico_adulto', 'min')
      },
      uti: {
        max: findExtreme('i10_uti_adulto', 'max'),
        min: findExtreme('i10_uti_adulto', 'min')
      }
    };
  }, [dailyRecords, selectedYear, selectedMonth, units]);

  const yearlyExtremes = useMemo(() => {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const stats = months.map(m => {
      const monthDaily = dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${m}`));
      if (monthDaily.length === 0) return null;
      const avg = monthDaily.reduce((acc, r) => {
        const total = units.reduce((uAcc, unit) => uAcc + (parseFloat(r.values[unit.key]) || 0), 0);
        return acc + total;
      }, 0) / monthDaily.length;
      return { month: m, avg };
    }).filter(s => s !== null) as { month: string, avg: number }[];

    if (stats.length === 0) return null;

    return {
      max: stats.reduce((prev, curr) => curr.avg > prev.avg ? curr : prev, stats[0]),
      min: stats.reduce((prev, curr) => curr.avg < prev.avg ? curr : prev, stats[0])
    };
  }, [dailyRecords, selectedYear, units]);

  const handleShare = async () => {
    setIsSyncing(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('supabase.auth.')) {
          fullDb[key] = localStorage.getItem(key);
        }
      }
      const payload = { full_db: fullDb, ts: Date.now() };
      const shareId = await syncService.createShare(payload);
      const currentHash = window.location.hash.split('?')[0] || '#/occupancy';
      const url = `${window.location.origin}${window.location.pathname}${currentHash}${currentHash.includes('?') ? '&' : '?'}id=${shareId}`;
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar link de compartilhamento.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadXLSX = () => {
    if (dailyRecords.length === 0) {
      alert("Não há registros diários para exportar.");
      return;
    }

    const wsData = dailyRecords
      .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(record => {
        const row: any = { 'Data': record.date };
        units.forEach(unit => {
          row[unit.name] = record.values[unit.key] ? record.values[unit.key] : '-';
        });
        return row;
      });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocupação Diária");
    XLSX.writeFile(wb, `ocupacao_diaria_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const getRecordByDate = (date: string) => dailyRecords.find(r => r.date === date);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-24">
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="p-6 bg-white text-slate-900 rounded-3xl shadow-xl transform -rotate-2">
             <BarChart3 size={40} strokeWidth={3} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none italic">
              <EditableText id="occ_main_title" defaultText="Painel Geral de Ocupação" />
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <p className="text-blue-400 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]">
                 <ShieldCheck size={18} />
                 <EditableText id="occ_monitor_label" defaultText="Monitoramento Detalhado por Unidade" /> {selectedYear}
              </p>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                 {['2026', '2027', '2028', '2029'].map(yr => (
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
           <button 
             onClick={openModal}
             className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
           >
             <PlusCircle size={18} />
             <EditableText id="occ_btn_daily_entry" defaultText="Lançamento Diário" />
           </button>
        </div>
      </div>

      {shareSuccess && (
        <div className="fixed bottom-10 right-10 z-50 animate-bounce-short">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
            <CheckCircle2 size={24} />
            <span className="font-black uppercase text-xs tracking-widest">Link de Sincronização Copiado!</span>
          </div>
        </div>
      )}

      {/* STATUS DETALHADO POR UNIDADE */}
      <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100">
        <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><LayoutGrid size={28}/></div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                <EditableText id="occ_status_title" defaultText="Status por Unidade" />
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {units.map((unit) => {
              const avg = calculateAverage(unit.key) || 0;
              const percentage = unit.capacity ? (avg / unit.capacity) * 100 : avg;
              const isCritical = percentage > 90;
              const isWarning = percentage > 80 && percentage <= 90;
              
              return (
                <div key={unit.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors`}>
                      <unit.icon size={20} />
                    </div>
                    {isCritical ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded-lg animate-pulse">Crítico</span>
                    ) : isWarning ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase rounded-lg">Alerta</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded-lg">Normal</span>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <EditableText id={`occ_unit_label_${unit.id}`} defaultText={unit.name} />
                  </p>
                  <div className="flex items-baseline justify-between gap-1">
                    <div className="flex items-baseline gap-1">
                      <h4 className={`text-2xl font-black ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>{Math.round(avg)}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        <EditableText id="occ_occupied_label" defaultText="Ocupados" />
                      </span>
                    </div>
                    {unit.capacity && (
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none">
                          <EditableText id="occ_capacity_label" defaultText="Capacidade" />
                        </p>
                        <p className="text-xs font-black text-slate-600">{unit.capacity} <EditableText id="occ_beds_label" defaultText="leitos" /></p>
                      </div>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUADRO DE RECORDES MENSAIS */}
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border-b-[12px] border-emerald-600 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/10 text-emerald-400 rounded-2xl shadow-sm"><Calendar size={28}/></div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                    <EditableText id="occ_records_title" defaultText="Recordes do Mês" />
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">
                    <EditableText id="occ_records_subtitle" defaultText="Picos e Vales de Ocupação" />
                  </p>
                </div>
              </div>

              <div className="relative">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-3 pr-12 font-black text-[10px] uppercase tracking-widest text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  {[
                    { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' }, { v: '03', l: 'Março' },
                    { v: '04', l: 'Abril' }, { v: '05', l: 'Maio' }, { v: '06', l: 'Junho' },
                    { v: '07', l: 'Julho' }, { v: '08', l: 'Agosto' }, { v: '09', l: 'Setembro' },
                    { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' }, { v: '12', l: 'Dezembro' }
                  ].map(m => (
                    <option key={m.v} value={m.v} className="bg-slate-900 text-white">{m.l}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Calendar size={14} />
                </div>
              </div>
            </div>

            {monthlyExtremes ? (
              <div className="space-y-8">
                {/* Clínicos */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
                    <EditableText id="occ_unit_clinicos_label" defaultText={`Unidade Clínicos - ${monthNames[parseInt(selectedMonth) - 1]}`} />
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowUpRight className="text-red-500" size={16} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <EditableText id="occ_max_occ_label_clinicos" defaultText="Maior Ocupação" />
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white">{Math.round(parseFloat(monthlyExtremes.clinicos.max.values.i10_clinico_adulto))}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Dia {monthlyExtremes.clinicos.max.date.split('-')[2]} de {monthNames[parseInt(selectedMonth) - 1]}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowDownRight className="text-emerald-500" size={16} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <EditableText id="occ_min_occ_label_clinicos" defaultText="Menor Ocupação" />
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white">{Math.round(parseFloat(monthlyExtremes.clinicos.min.values.i10_clinico_adulto))}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Dia {monthlyExtremes.clinicos.min.date.split('-')[2]} de {monthNames[parseInt(selectedMonth) - 1]}</p>
                    </div>
                  </div>
                </div>

                {/* UTI */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">
                    <EditableText id="occ_unit_uti_label" defaultText={`UTI (Emergência) - ${monthNames[parseInt(selectedMonth) - 1]}`} />
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowUpRight className="text-red-500" size={16} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <EditableText id="occ_max_occ_label_uti" defaultText="Maior Ocupação" />
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white">{Math.round(parseFloat(monthlyExtremes.uti.max.values.i10_uti_adulto))}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Dia {monthlyExtremes.uti.max.date.split('-')[2]} de {monthNames[parseInt(selectedMonth) - 1]}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowDownRight className="text-emerald-500" size={16} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          <EditableText id="occ_min_occ_label_uti" defaultText="Menor Ocupação" />
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-white">{Math.round(parseFloat(monthlyExtremes.uti.min.values.i10_uti_adulto))}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Dia {monthlyExtremes.uti.min.date.split('-')[2]} de {monthNames[parseInt(selectedMonth) - 1]}</p>
                    </div>
                  </div>
                </div>

                {/* Recordes Anuais */}
                {yearlyExtremes && selectedYear !== '2026' && (
                  <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">
                      <EditableText id="occ_yearly_records_label" defaultText={`Recordes do Ano de ${selectedYear}`} />
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <ArrowUpRight className="text-red-500" size={16} />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mês Maior Ocupação</span>
                        </div>
                        <h4 className="text-xl font-black text-white">{monthNames[parseInt(yearlyExtremes.max.month) - 1]}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Média: {Math.round(yearlyExtremes.max.avg)} leitos</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <ArrowDownRight className="text-emerald-500" size={16} />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mês Menor Ocupação</span>
                        </div>
                        <h4 className="text-xl font-black text-white">{monthNames[parseInt(yearlyExtremes.min.month) - 1]}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Média: {Math.round(yearlyExtremes.min.avg)} leitos</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Loader2 className="text-slate-600 animate-spin" size={24} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aguardando lançamentos diários para o mês atual</p>
              </div>
            )}
          </div>
        </div>

        <DynamicNotes sectionId={`occupancy_panel_${selectedYear}`} />

        {/* QUADRO DE COMPARAÇÃO DE DATAS */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm"><ArrowRightLeft size={28}/></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                  <EditableText id="occ_compare_title" defaultText="Comparativo de Datas" />
                </h3>
                <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
                  <EditableText id="occ_compare_subtitle" defaultText="Selecione duas datas para comparar a ocupação" />
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col gap-1 w-full sm:w-40">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Data A</label>
                <input 
                  type="date" 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold outline-none focus:border-blue-500"
                  value={compareDateA}
                  onChange={(e) => setCompareDateA(e.target.value)}
                />
              </div>
              <div className="text-slate-300 hidden sm:block mt-4">
                <ArrowRightLeft size={16} />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-40">
                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Data B</label>
                <input 
                  type="date" 
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold outline-none focus:border-blue-500"
                  value={compareDateB}
                  onChange={(e) => setCompareDateB(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {units.map(unit => {
              const recA = getRecordByDate(compareDateA);
              const recB = getRecordByDate(compareDateB);
              const valA = recA ? parseFloat(recA.values[unit.key]) || 0 : null;
              const valB = recB ? parseFloat(recB.values[unit.key]) || 0 : null;
              const diff = (valA !== null && valB !== null) ? valB - valA : null;

              return (
                <div key={unit.id} className="grid grid-cols-1 md:grid-cols-12 items-center p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                      <unit.icon size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{unit.name}</span>
                  </div>
                  
                  <div className="md:col-span-3 flex flex-col items-center md:items-start mt-2 md:mt-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data A</span>
                    <span className="text-sm font-black text-slate-800">{valA !== null ? valA : '-'}</span>
                  </div>

                  <div className="md:col-span-3 flex flex-col items-center md:items-start mt-2 md:mt-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data B</span>
                    <span className="text-sm font-black text-slate-800">{valB !== null ? valB : '-'}</span>
                  </div>

                  <div className="md:col-span-2 flex flex-col items-center md:items-end mt-2 md:mt-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Diferença</span>
                    {diff !== null ? (
                      <div className={`flex items-center gap-1 font-black text-sm ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {diff > 0 ? <ArrowUpRight size={14} /> : diff < 0 ? <ArrowDownRight size={14} /> : null}
                        {diff > 0 ? `+${diff}` : diff}
                      </div>
                    ) : (
                      <span className="text-sm font-black text-slate-300">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABELA DE REGISTROS DIÁRIOS */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><TableIcon size={28}/></div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                  <EditableText id="occ_history_title" defaultText="Histórico de Lançamentos" />
                </h3>
                <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
                  <EditableText id="occ_history_subtitle" defaultText="Visualização tabelada dos dados inseridos" />
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {selectedHistoryDates.length > 0 && (
                <button 
                  onClick={handleBulkDeleteDaily}
                  className="flex items-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 cursor-pointer"
                >
                  <Trash2 size={18} />
                  Excluir Selecionados ({selectedHistoryDates.length})
                </button>
              )}
              <button 
                onClick={handleDownloadXLSX}
                className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20"
              >
                <FileText size={18} />
                <EditableText id="occ_btn_export" defaultText="Exportar XLSX" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-10 px-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-6 px-4 w-10">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={
                        dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)).length > 0 &&
                        selectedHistoryDates.length === dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)).length
                      }
                      onChange={() => toggleSelectAllHistory(dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)))}
                    />
                  </th>
                  <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <EditableText id="occ_table_date_label" defaultText="Data" />
                  </th>
                  {units.map(unit => (
                    <th key={unit.id} className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <unit.icon size={14} />
                        {unit.name}
                      </div>
                    </th>
                  ))}
                  <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    <EditableText id="occ_table_actions_label" defaultText="Ações" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords
                  .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((record, idx) => (
                    <tr key={idx} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group ${selectedHistoryDates.includes(record.date) ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-6 px-4">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedHistoryDates.includes(record.date)}
                          onChange={() => toggleSelectHistoryDate(record.date)}
                        />
                      </td>
                      <td className="py-6 px-4 font-black text-slate-800 text-sm">{record.date.split('-').reverse().join('/')}</td>
                      {units.map(unit => {
                        const val = parseFloat(record.values[unit.key]);
                        const percentage = unit.capacity ? (val / unit.capacity) * 100 : val;
                        const isHigh = percentage > 90;
                        return (
                          <td key={unit.id} className="py-6 px-4">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${isHigh ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {record.values[unit.key] ? `${record.values[unit.key]}` : '-'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-6 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteDaily(record.date)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Excluir Registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                {dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)).length === 0 && (
                  <tr>
                    <td colSpan={units.length + 2} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                          <TableIcon size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum registro encontrado para {selectedMonth}/{selectedYear}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE LANÇAMENTO DIÁRIO */}
        {isEntryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 p-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <PlusCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                      <EditableText id="occ_modal_title" defaultText="Lançamento Diário" />
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <EditableText id="occ_modal_subtitle" defaultText="Registrar ocupação por unidade (Múltiplos Dias)" />
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsEntryModalOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <CloseIcon size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[180px]">Data do Registro</th>
                        {units.map(unit => (
                          <th key={unit.id} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">
                            <div className="flex flex-col items-center gap-1">
                              <unit.icon size={14} className="text-blue-600" />
                              {unit.name}
                            </div>
                          </th>
                        ))}
                        <th className="p-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {entries.map((entry, index) => (
                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <input 
                              type="date" 
                              className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              value={entry.date}
                              onChange={(e) => updateEntry(index, 'date', e.target.value)}
                            />
                          </td>
                          {units.map(unit => (
                            <td key={unit.id} className="p-3">
                              <input 
                                type="number" 
                                placeholder="0"
                                min="0"
                                className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-sm text-center font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                                value={entry.values[unit.key] || ''}
                                onChange={(e) => updateEntry(index, unit.key, e.target.value)}
                              />
                            </td>
                          ))}
                          <td className="p-3 text-right">
                            {entries.length > 1 && (
                              <button 
                                onClick={() => removeEntry(index)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Remover linha"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={addEntry}
                  className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
                >
                  <PlusCircle size={18} />
                  Adicionar Nova Linha de Data
                </button>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                <button 
                  onClick={() => setIsEntryModalOpen(false)}
                  className="flex-1 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveDaily}
                  className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  Salvar Todos os Registros
                </button>
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
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 p-6 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[32px] shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
              <Sparkles size={40} className="text-white" />
            </div>
            
            <div className="relative z-10 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-500/30">
                  <EditableText id="occ_cuida_tag" defaultText="Institucional" />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <EditableText id="occ_cuida_subtitle" defaultText="Documentação Estratégica" />
                </p>
              </div>
              <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                <EditableText id="occ_cuida_title" defaultText="Projeto Cuida+" />
              </h4>
              <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                <EditableText id="occ_cuida_desc" defaultText="Acesse as diretrizes completas, objetivos e o plano de ação detalhado para a humanização e eficiência do atendimento." />
              </p>
            </div>
            
            <div className="relative z-10 p-5 bg-white/5 rounded-full text-slate-500 group-hover:text-white group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-xl">
              <ExternalLink size={24} />
            </div>
            
            {/* Linha de brilho no topo */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </a>
        </div>

        <PasswordModal 
          isOpen={passwordModal.isOpen} 
          onClose={closePasswordModal} 
          onConfirm={passwordModal.onConfirm}
          title={passwordModal.title}
          message={passwordModal.message}
        />

        <style>{`
          .animate-bounce-short { animation: bounceShort 0.5s ease-in-out; }
          @keyframes bounceShort { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        `}</style>
      </div>
    );
};

export default OccupancyPanel;
