
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Activity, AlertTriangle, 
  Calendar, Download, Clock, CheckCircle2, 
  PlusCircle, Save, X as CloseIcon, FileText, Table as TableIcon,
  Trash2, BarChart3, LayoutGrid, ExternalLink, Sparkles, Users,
  GripVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';
import { PasswordModal } from '../components/PasswordModal';
import { usePasswordPrompt } from '../hooks/usePasswordPrompt';

const SortableSection: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/section">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover/section:opacity-100 transition-opacity z-20"
      >
        <GripVertical size={20} />
      </div>
      {children}
    </div>
  );
};

const RiskClassificationPanel: React.FC = () => {
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('-')[1]);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['daily_total', 'monthly_accumulated', 'category_status', 'notes', 'history']);
  const [selectedHistoryDates, setSelectedHistoryDates] = useState<string[]>([]);
  
  const { passwordModal, requestPassword, closePasswordModal } = usePasswordPrompt();

  // Daily Entry State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([{ date: new Date().toISOString().split('T')[0], values: {} }]);

  const addEntry = () => {
    const lastEntry = entries[entries.length - 1];
    let nextDate = new Date().toISOString().split('T')[0];
    
    if (lastEntry && lastEntry.date) {
      const date = new Date(lastEntry.date + 'T00:00:00');
      date.setDate(date.getDate() + 1);
      nextDate = date.toISOString().split('T')[0];
    }
    
    setEntries([...entries, { date: nextDate, values: {} }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const load = async () => {
      const dailySaved = await storage.getItem('ps_daily_risk_records');
      if (dailySaved) setDailyRecords(dailySaved);
      
      const savedOrder = localStorage.getItem('risk_panel_section_order');
      if (savedOrder) setSectionOrder(JSON.parse(savedOrder));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      requestPassword("Digite a senha mestre para mover este quadro:", (pw) => {
        if (pw !== 'Conselho@2026') {
          alert("Senha incorreta!");
          return;
        }
        setSectionOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          const newOrder = arrayMove(items, oldIndex, newIndex);
          storage.setItem('risk_panel_section_order', newOrder);
          return newOrder;
        });
      });
    }
  };

  const riskCategories = useMemo(() => [
    { id: 'vermelho', name: 'Vermelho', key: 'risk_vermelho', icon: AlertTriangle, color: '#ef4444' },
    { id: 'laranja', name: 'Laranja (CRAI)', key: 'risk_laranja', icon: AlertTriangle, color: '#f97316' },
    { id: 'amarelo', name: 'Amarelo', key: 'risk_amarelo', icon: AlertTriangle, color: '#eab308' },
    { id: 'verde', name: 'Verde', key: 'risk_verde', icon: AlertTriangle, color: '#22c55e' },
    { id: 'azul', name: 'Azul', key: 'risk_azul', icon: AlertTriangle, color: '#3b82f6' },
  ], []);

  const latestRecord = useMemo(() => {
    return [...dailyRecords]
      .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [dailyRecords, selectedYear, selectedMonth]);

  const latestTotal = useMemo(() => {
    if (!latestRecord) return 0;
    return riskCategories.reduce((acc, cat) => acc + (parseFloat(latestRecord.values[cat.key]) || 0), 0);
  }, [latestRecord, riskCategories]);

  const movementStats = useMemo(() => {
    const monthRecords = dailyRecords
      .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
      .map(r => ({
        ...r,
        total: riskCategories.reduce((acc, cat) => acc + (parseFloat(r.values[cat.key]) || 0), 0)
      }))
      .filter(r => r.total > 0);

    if (monthRecords.length === 0) return { max: null, min: null };

    const sorted = [...monthRecords].sort((a, b) => b.total - a.total);
    return {
      max: sorted[0],
      min: sorted[sorted.length - 1]
    };
  }, [dailyRecords, selectedYear, selectedMonth, riskCategories]);

  const monthlyTotals = useMemo(() => {
    const monthRecords = dailyRecords.filter(r => 
      r.date.startsWith(`${selectedYear}-${selectedMonth}`)
    );

    const totals: Record<string, number> = {};
    riskCategories.forEach(cat => {
      totals[cat.key] = monthRecords.reduce((acc, r) => acc + (parseFloat(r.values[cat.key]) || 0), 0);
    });

    const grandTotal = Object.values(totals).reduce((acc, val) => acc + val, 0);
    const monthName = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1).toLocaleString('pt-BR', { month: 'long' });

    return { totals, grandTotal, monthName };
  }, [dailyRecords, selectedYear, selectedMonth, riskCategories]);

  const calculateAverage = (key: string) => {
    const monthDaily = dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`));
    if (monthDaily.length > 0) {
      const values = monthDaily.map(r => parseFloat(r.values[key]) || 0).filter(v => v > 0);
      if (values.length > 0) {
        return values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    return 0;
  };

  const handleSaveDaily = async () => {
    requestPassword("Digite a senha mestre para salvar os dados:", async (pw) => {
      if (pw !== 'Conselho@2026') {
        alert("Senha incorreta!");
        return;
      }

      let updatedRecords = [...dailyRecords];
      
      for (const entry of entries) {
        if (!entry.date) continue;
        
        // Preserve other values (like occupancy) if they exist for this date
        const existingRecord = updatedRecords.find(r => r.date === entry.date);
        const newRecord = {
          date: entry.date,
          values: { 
            ...(existingRecord?.values || {}),
            ...entry.values 
          }
        };
        updatedRecords = [...updatedRecords.filter(r => r.date !== entry.date), newRecord];
      }

      setDailyRecords(updatedRecords);
      await storage.setItem('ps_daily_risk_records', updatedRecords);
      setIsEntryModalOpen(false);
      setEntries([{ date: new Date().toISOString().split('T')[0], values: {} }]);
      alert("Dados salvos com sucesso!");
    });
  };

  const handleDeleteDaily = async (date: string) => {
    requestPassword("Digite a senha mestre para excluir este registro:", async (pw) => {
      if (pw !== 'Conselho@2026') {
        alert("Senha incorreta!");
        return;
      }
      if (window.confirm(`Tem certeza que deseja excluir o registro do dia ${date.split('-').reverse().join('/')}?`)) {
        const updatedRecords = dailyRecords.filter(r => r.date !== date);
        setDailyRecords(updatedRecords);
        await storage.setItem('ps_daily_risk_records', updatedRecords);
        setSelectedHistoryDates(prev => prev.filter(d => d !== date));
      }
    });
  };

  const handleBulkDeleteDaily = async () => {
    if (selectedHistoryDates.length === 0) return;
    
    requestPassword(`Digite a senha mestre para excluir ${selectedHistoryDates.length} registros:`, async (pw) => {
      if (pw !== 'Conselho@2026') {
        alert("Senha incorreta!");
        return;
      }
      
      if (window.confirm(`Tem certeza que deseja excluir os ${selectedHistoryDates.length} registros selecionados?`)) {
        const updatedRecords = dailyRecords.filter(r => !selectedHistoryDates.includes(r.date));
        setDailyRecords(updatedRecords);
        await storage.setItem('ps_daily_risk_records', updatedRecords);
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

  const handleDownloadXLSX = () => {
    if (dailyRecords.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }

    const wsData = dailyRecords
      .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(record => {
        const row: any = { 'Data': record.date };
        let total = 0;
        riskCategories.forEach(cat => {
          const val = parseFloat(record.values[cat.key]) || 0;
          row[cat.name] = record.values[cat.key] ? record.values[cat.key] : '-';
          total += val;
        });
        row['Total'] = total;
        return row;
      });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classificação de Risco");
    XLSX.writeFile(wb, `classificacao_risco_${selectedYear}_${selectedMonth}.xlsx`);
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
          <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight italic">
              <EditableText id="risk_panel_main_title" defaultText="Acolhimento e Classificação de Risco" />
            </h1>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-4">
              <p className="text-red-400 flex items-center justify-center sm:justify-start gap-2 text-xs font-black uppercase tracking-[0.3em] text-center sm:text-left">
                 <Activity size={18} className="shrink-0" />
                 <EditableText id="risk_monitor_label" defaultText="Monitoramento de Fluxo por Gravidade" /> {selectedYear}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                   {['2026', '2027', '2028', '2029'].map(yr => (
                     <button 
                       key={yr} 
                       onClick={() => setSelectedYear(yr)}
                       className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${selectedYear === yr ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       {yr}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div 
             onClick={openModal}
             className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 cursor-pointer"
             role="button"
             tabIndex={0}
             onKeyDown={(e) => e.key === 'Enter' && openModal()}
           >
             <PlusCircle size={18} />
             <EditableText id="risk_btn_daily_entry" defaultText="Lançamento Diário" />
           </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-12">
            {sectionOrder.map(sectionId => {
              if (sectionId === 'daily_total') {
                return (
                  <SortableSection key="daily_total" id="daily_total">
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
                  </SortableSection>
                );
              }

              if (sectionId === 'monthly_accumulated') {
                return (
                  <SortableSection key="monthly_accumulated" id="monthly_accumulated">
                    {/* TOTAL ACUMULADO DO MÊS */}
                    <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl border-2 border-slate-800">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white/5 text-indigo-400 rounded-2xl border border-white/10"><BarChart3 size={28}/></div>
                          <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                              <EditableText id="risk_monthly_total_title" defaultText="Total Acumulado do Mês" />
                            </h3>
                            <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">
                              Competência: <span className="text-indigo-400 capitalize">{monthlyTotals.monthName}</span> {selectedYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <select 
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                              className="appearance-none bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-3 pr-12 font-black text-[10px] uppercase tracking-widest text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
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
                          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral:</span>
                            <span className="text-2xl font-black text-white italic">{monthlyTotals.grandTotal}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                        {riskCategories.map((cat) => {
                          const total = monthlyTotals.totals[cat.key] || 0;
                          const percentage = monthlyTotals.grandTotal > 0 ? (total / monthlyTotals.grandTotal) * 100 : 0;
                          
                          return (
                            <div 
                              key={`monthly-${cat.id}`} 
                              className="p-6 rounded-3xl border border-white/10 hover:shadow-2xl transition-all group relative overflow-hidden"
                              style={{ backgroundColor: cat.color }}
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-md">
                                  <cat.icon size={20} />
                                </div>
                              </div>
                              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">
                                {cat.name}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <h4 className="text-2xl font-black text-white">{total}</h4>
                                <span className="text-[10px] font-bold text-white/60 uppercase">Pacientes</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/20 rounded-full mt-4 overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-1000 bg-white" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SortableSection>
                );
              }

              if (sectionId === 'category_status') {
                return (
                  <SortableSection key="category_status" id="category_status">
                    {/* STATUS POR CATEGORIA */}
                    <div className="bg-white p-10 rounded-[48px] shadow-sm border-2 border-slate-100">
                      <div className="flex flex-col sm:flex-row items-center justify-start mb-10 gap-4">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><LayoutGrid size={28}/></div>
                          <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                              <EditableText id="risk_status_title_page" defaultText="Distribuição de Pacientes no Dia" />
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                              <Calendar size={12} className="text-red-500" />
                              {latestRecord ? `Referente a: ${latestRecord.date.split('-').reverse().join('/')}` : 'Nenhum registro selecionado'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                        {riskCategories.map((cat) => {
                          const value = latestRecord ? (parseFloat(latestRecord.values[cat.key]) || 0) : 0;
                          const percentage = latestTotal > 0 ? (value / latestTotal) * 100 : 0;
                          
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
                                <h4 className="text-2xl font-black text-slate-800">{value}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-1000" 
                                  style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SortableSection>
                );
              }

              if (sectionId === 'notes') {
                return (
                  <SortableSection key="notes" id="notes">
                    <DynamicNotes sectionId={`risk_panel_${selectedYear}`} />
                  </SortableSection>
                );
              }

              if (sectionId === 'history') {
                return (
                  <SortableSection key="history" id="history">
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
                          <div 
                            onClick={handleDownloadXLSX}
                            className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleDownloadXLSX()}
                          >
                            <FileText size={18} />
                            <EditableText id="risk_btn_export" defaultText="Exportar XLSX" />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto -mx-10 px-10">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-slate-100">
                              <th className="py-6 px-4 w-10">
                                <input 
                                  type="checkbox"
                                  className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                  checked={
                                    dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)).length > 0 &&
                                    selectedHistoryDates.length === dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)).length
                                  }
                                  onChange={() => toggleSelectAllHistory(dailyRecords.filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`)))}
                                />
                              </th>
                              <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                              {riskCategories.map(cat => (
                                <th key={cat.id} className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <div className="flex items-center gap-2">
                                    <cat.icon size={14} style={{ color: cat.color }} />
                                    {cat.name}
                                  </div>
                                </th>
                              ))}
                              <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                              <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dailyRecords
                              .filter(r => r.date.startsWith(`${selectedYear}-${selectedMonth}`))
                              .sort((a, b) => b.date.localeCompare(a.date))
                              .map((record, idx) => (
                                <tr key={idx} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group ${selectedHistoryDates.includes(record.date) ? 'bg-red-50/30' : ''}`}>
                                  <td className="py-6 px-4">
                                    <input 
                                      type="checkbox"
                                      className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                      checked={selectedHistoryDates.includes(record.date)}
                                      onChange={() => toggleSelectHistoryDate(record.date)}
                                    />
                                  </td>
                                  <td className="py-6 px-4 font-black text-slate-800 text-sm">{record.date.split('-').reverse().join('/')}</td>
                                  {riskCategories.map(cat => (
                                    <td key={cat.id} className="py-6 px-4">
                                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 text-slate-600">
                                        {record.values[cat.key] ? `${record.values[cat.key]}` : '-'}
                                      </span>
                                    </td>
                                  ))}
                                  <td className="py-6 px-4">
                                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 text-white italic">
                                      {riskCategories.reduce((acc, cat) => acc + (parseFloat(record.values[cat.key]) || 0), 0)}
                                    </span>
                                  </td>
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
                  </SortableSection>
                );
              }


              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* MODAL DE LANÇAMENTO */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Lançamento de Risco</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Registrar pacientes por cor (Múltiplos Dias)</p>
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
                      {riskCategories.map(cat => (
                        <th key={cat.id} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <cat.icon size={14} style={{ color: cat.color }} />
                            {cat.name}
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
                        {riskCategories.map(cat => (
                          <td key={cat.id} className="p-3">
                            <input 
                              type="number" 
                              placeholder="0"
                              min="0"
                              className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-sm text-center font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                              value={entry.values[cat.key] || ''}
                              onChange={(e) => updateEntry(index, cat.key, e.target.value)}
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
                className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50/30 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest"
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
                className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} />
                Salvar Todos os Registros
              </button>
            </div>
          </div>
        </div>
      )}

      <PasswordModal 
        isOpen={passwordModal.isOpen}
        onClose={closePasswordModal}
        onConfirm={passwordModal.onConfirm}
        title={passwordModal.title}
        message={passwordModal.message}
      />
    </div>
  );
};

export default RiskClassificationPanel;
