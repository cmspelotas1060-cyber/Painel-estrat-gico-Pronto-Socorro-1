
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, PlusCircle,
  ChevronRight, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check
} from 'lucide-react';

type PPASource = '1500' | '1621' | '1600' | '1604' | '1605' | '1659' | '1601' | '1500.1002' | '1600.3110' | '1600.3120' | '1601.3110' | '1601.3120' | string;

const LOA_ACTIVITIES = [
  "Conselho Municipal de Saúde",
  "Gestão Participativa no Âmbito do SUS",
  "Rede de Equidades",
  "Rede Materno Infantil",
  "Atenção Primária em Saúde – Atividade",
  "Atenção Hospitalar e Especializada",
  "Rede de Urgências e Emergências",
  "Unidade de Pronto Socorro",
  "Serviço de Atendimento Móvel de Urgência- SAMU",
  "Rede de Doenças Crônicas não Transmissíveis",
  "Rede de Atenção Psicossocial",
  "Rede de Doenças Crônicas Transmissíveis",
  "Rede de atenção à saúde bucal",
  "Rede de Atenção à Pessoa com Deficiência",
  "Rede de Assistência Farmacêutica",
  "Planejamento, Gestão Estratégica e Participativa",
  "Centro de Referencia em Saúde do Trabalhador CEREST",
  "Vigilância Sanitária",
  "Vigilância em Saúde",
  "Ações Judiciais em Saúde",
  "Construção de Policlínica de Referência Regional de Pelotas",
  "Construção de Unidades Básicas de Saúde",
  "Central de Regulação de Óbitos",
  "Hemocentro",
  "Reforma de Unidades Básicas de Saúde",
  "Atendimentos Hospitalares de Alta Complexidade – FAEC"
];

interface PPAAction {
  id: string;
  action: string;
  objective: string;
  indicator: string;
  yearlyFunding: {
    [year: string]: Partial<Record<PPASource, string>>
  };
  goals: { [key: string]: string };
  status: 'Planejado' | 'Em Execução' | 'Concluído' | 'Atrasado';
  loaActivity?: string;
}

const sourceStyles: Record<string, string> = {
  '1500': 'bg-slate-900 text-white border-black',
  '1500.1002': 'bg-slate-800 text-white border-black',
  '1621': 'bg-amber-500 text-white border-amber-600',
  '1600': 'bg-emerald-600 text-white border-emerald-700',
  '1600.3110': 'bg-emerald-700 text-white border-emerald-800',
  '1600.3120': 'bg-emerald-800 text-white border-emerald-900',
  '1604': 'bg-emerald-500 text-white border-emerald-600',
  '1605': 'bg-emerald-400 text-white border-emerald-500',
  '1659': 'bg-indigo-500 text-white border-indigo-600',
  '1601': 'bg-cyan-600 text-white border-cyan-700',
  '1601.3110': 'bg-cyan-700 text-white border-cyan-800',
  '1601.3120': 'bg-cyan-800 text-white border-cyan-900'
};

const sourceLabels: Record<string, string> = {
  '1500': '1500 (Rec. Próprios)',
  '1500.1002': '1500.1002 (Mínimo 15%)',
  '1621': '1621 (Estadual)',
  '1600': '1600 (Cust. Nac.)',
  '1600.3110': '1600.3110 (Emenda Fed. Cust.)',
  '1600.3120': '1600.3120 (Emenda Banc. Cust.)',
  '1604': '1604 (Ag. Saúde)',
  '1605': '1605 (Piso Enferm.)',
  '1659': '1659 (Outras Transf.)',
  '1601': '1601 (Invest. Nac.)',
  '1601.3110': '1601.3110 (Emenda Fed. Inv.)',
  '1601.3120': '1601.3120 (Emenda Banc. Inv.)'
};

const LEGEND_DATA = [
  { code: '1600', text: 'Recursos de custeio repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.' },
  { code: '1605', text: 'Recursos referentes ao complemento do piso da enfermagem.' },
  { code: '1604', text: 'Recursos referente ao repasse dos Agentes de Combates a Endemias e Agentes Comunitários de Saúde.' },
  { code: '1621', text: 'Recursos repassados para custeio pelo Fundo Estadual de Saúde ao Fundo Municipal de Saúde.' },
  { code: '1500.1002', text: 'Recursos municipais / aplicação mínima de 15% em ações de saúde.' },
  { code: '1601', text: 'Recursos de investimentos repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.' },
  { code: '1600.3110', text: 'Recursos de emendas de deputados federais referentes a custeio.' },
  { code: '1600.3120', text: 'Recursos de emendas de bancada federais referentes a custeio.' },
  { code: '1601.3110', text: 'Recursos de emendas de deputados federais referentes a investimento.' },
  { code: '1601.3120', text: 'Recursos de emendas de bancada federais referentes a investimentos.' }
];

const parseCurrency = (valStr: string = "0"): number => {
  let s = valStr.toString().trim();
  s = s.replace(/\./g, '').replace(',', '.');
  return parseFloat(s) || 0;
};

const ActionCard: React.FC<{ 
  item: PPAAction; 
  groupKey: string;
  index: number;
  viewMode: 'PPA' | 'LDO' | 'LOA';
  selectedYear: string;
  onEdit: (p: PPAAction) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, group: string, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetGroup: string, targetIndex: number) => void;
}> = ({ item, groupKey, index, viewMode, selectedYear, onEdit, onDelete, onDragStart, onDragOver, onDrop }) => {
  const years = viewMode === 'PPA' ? ['2026', '2027', '2028', '2029'] : [selectedYear];
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  const getYearTotal = (year: string): number => {
    const funding = item.yearlyFunding[year] || {};
    return Object.values(funding).reduce<number>((acc, val) => acc + parseCurrency((val as string) || "0"), 0);
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const getAllUniqueSources = () => {
    const sources = new Set<PPASource>();
    Object.values(item.yearlyFunding).forEach(yearData => {
      Object.keys(yearData).forEach(s => sources.add(s as PPASource));
    });
    return Array.from(sources);
  };

  const themeColors = {
    PPA: 'border-slate-200 ring-slate-100',
    LDO: 'border-amber-200 ring-amber-100',
    LOA: 'border-indigo-200 ring-indigo-100'
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, groupKey, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, groupKey, index)}
      className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden w-full mb-6 cursor-default active:cursor-grabbing ${viewMode !== 'PPA' ? `ring-2 ${themeColors[viewMode]}` : 'border-slate-200'}`}
    >
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center relative">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-slate-400 transition-colors print:hidden cursor-grab active:cursor-grabbing p-2">
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1 space-y-2 pl-6">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {getAllUniqueSources().map(source => (
              <span key={source} className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>
                {source}
              </span>
            ))}
            {viewMode === 'LOA' && item.loaActivity && (
              <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest">
                {item.loaActivity}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-lg leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">
            {item.action}
          </h4>
          <p className="text-xs text-slate-500 font-medium italic line-clamp-2 md:line-clamp-none">
            "{item.objective}"
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full md:w-auto">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unidade/Indicador</p>
            <p className="text-sm font-bold text-slate-800">{item.indicator}</p>
          </div>
        </div>

        <div className="flex gap-2 absolute top-4 right-4 md:static print:hidden">
          <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
            <Edit3 size={18}/>
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
            <Trash2 size={18}/>
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/30">
        <div className={`grid gap-4 ${viewMode !== 'PPA' ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {years.map(year => {
            const total = getYearTotal(year);
            const goal = item.goals[year] || '-';
            const yearFunding = item.yearlyFunding[year] || {};
            const isExpanded = expandedYears[year];
            
            const accentColor = viewMode === 'LDO' ? 'text-amber-600' : viewMode === 'LOA' ? 'text-indigo-600' : 'text-slate-900';
            const bulletColor = total > 0 ? (viewMode === 'LDO' ? 'bg-amber-500' : viewMode === 'LOA' ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-slate-300';
            
            return (
              <div key={year} className={`p-4 rounded-2xl border transition-all flex flex-col ${total > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100/50 border-slate-100 opacity-60'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-sm font-bold uppercase flex items-center gap-2 ${accentColor}`}>
                    <span className={`w-2 h-2 rounded-full ${bulletColor}`}></span> 
                    {viewMode === 'PPA' ? year : `EXERCÍCIO ${year}`}
                  </span>
                  {total > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleYear(year); }}
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all flex items-center gap-1 ${isExpanded ? (viewMode === 'LDO' ? 'bg-amber-600' : viewMode === 'LOA' ? 'bg-indigo-600' : 'bg-blue-600') + ' text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                      {isExpanded ? 'Recuar' : 'Fontes'}
                      {isExpanded ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                    </button>
                  )}
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meta Física</p>
                    <div className={`text-lg font-bold ${viewMode === 'LDO' ? 'text-amber-700' : viewMode === 'LOA' ? 'text-indigo-700' : 'text-blue-600'}`}>{goal}</div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Coins size={12} className={viewMode === 'LDO' ? 'text-amber-600' : viewMode === 'LOA' ? 'text-indigo-600' : 'text-emerald-600'}/> Financeiro Total
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-[10px] font-bold ${viewMode === 'LDO' ? 'text-amber-600' : viewMode === 'LOA' ? 'text-indigo-600' : 'text-emerald-600'}`}>R$</span>
                      <span className="text-lg font-bold text-slate-900 tracking-tight">
                        {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-2 animate-fade-in">
                        {Object.entries(yearFunding).map(([source, amount]) => (
                          <div key={source} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm ${sourceStyles[source as PPASource] || 'bg-slate-500 text-white'}`}>
                              {source}
                            </span>
                            <span className="text-[10px] font-black text-slate-700">
                              R$ {parseCurrency(amount as string).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PPA: React.FC = () => {
  const [viewMode, setViewMode] = useState<'PPA' | 'LDO' | 'LOA'>('PPA');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showGlossary, setShowGlossary] = useState(true);
  const [showSourcesLegend, setShowSourcesLegend] = useState(false);
  
  const [indicators, setIndicators] = useState<Record<string, PPAAction[]>>({});
  const [axisOrder, setAxisOrder] = useState<string[]>([]);
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PPAAction | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  
  // Quick Entry State for LOA
  const [quickEntryActivity, setQuickEntryActivity] = useState<string | null>(null);
  const [quickEntryData, setQuickEntryData] = useState({ source: '', title: '', goal: '', amount: '' });

  const [formData, setFormData] = useState<Partial<PPAAction>>({
    yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} },
    goals: {}
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  const [draggedAction, setDraggedAction] = useState<{ group: string; index: number } | null>(null);
  const [draggedAxis, setDraggedAxis] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    const savedOrder = localStorage.getItem('ps_ppa_axis_order');
    if (saved) {
      try { 
        const parsedIndicators = JSON.parse(saved);
        setIndicators(parsedIndicators);
        
        if (savedOrder) {
          setAxisOrder(JSON.parse(savedOrder));
        } else {
          setAxisOrder(Object.keys(parsedIndicators));
        }
      } catch (e) { 
        console.error(e); 
      }
    }
  }, []);

  // CÁLCULO DO RANKING DE FONTES E TOTAL GERAL
  const { sourceRanking, totalInvested } = useMemo(() => {
    const sums: Record<string, number> = {};
    const relevantYears = viewMode === 'PPA' ? ['2026', '2027', '2028', '2029'] : [selectedYear];
    let grandTotal = 0;

    (Object.values(indicators).flat() as PPAAction[]).forEach(action => {
      relevantYears.forEach(year => {
        const yearFunding = action.yearlyFunding[year] || {};
        Object.entries(yearFunding).forEach(([source, amount]) => {
          const val = parseCurrency(amount as string);
          sums[source] = (sums[source] || 0) + val;
          grandTotal += val;
        });
      });
    });

    const ranking = Object.entries(sums)
      .map(([source, total]) => ({ source, total }))
      .sort((a, b) => b.total - a.total);

    return { sourceRanking: ranking, totalInvested: grandTotal };
  }, [indicators, viewMode, selectedYear]);

  // AGRUPAMENTO ESPECÍFICO PARA LOA (POR ATIVIDADE)
  const loaGroups = useMemo(() => {
    if (viewMode !== 'LOA') return null;
    const groups: Record<string, PPAAction[]> = {};
    
    LOA_ACTIVITIES.forEach(act => groups[act] = []);
    groups["Outras Atividades"] = [];

    (Object.values(indicators).flat() as PPAAction[]).forEach(action => {
      const act = action.loaActivity;
      if (act && groups[act]) {
        groups[act].push(action);
      } else {
        groups["Outras Atividades"].push(action);
      }
    });

    return groups;
  }, [indicators, viewMode]);

  const persist = (data: Record<string, PPAAction[]>, order?: string[]) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
    
    if (order) {
      setAxisOrder(order);
      localStorage.setItem('ps_ppa_axis_order', JSON.stringify(order));
    } else {
      const currentOrder = axisOrder.length > 0 ? axisOrder : Object.keys(data);
      setAxisOrder(currentOrder);
      localStorage.setItem('ps_ppa_axis_order', JSON.stringify(currentOrder));
    }
  };

  const handleQuickAddLOA = (activity: string) => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    
    const finalSource = quickEntryData.source;
    if (!finalSource || !quickEntryData.title) {
       setError("Preencha Fonte e Título.");
       return;
    }

    const newAction: PPAAction = {
      id: Date.now().toString(),
      action: quickEntryData.title,
      objective: `Gasto vinculado a atividade: ${activity}`,
      indicator: "Execução Orçamentária",
      yearlyFunding: {
        '2026': {}, '2027': {}, '2028': {}, '2029': {},
        [selectedYear]: { [finalSource]: quickEntryData.amount }
      },
      goals: { [selectedYear]: quickEntryData.goal },
      status: 'Planejado',
      loaActivity: activity
    };

    const targetAxis = axisOrder[0] || "LOA Detalhada";
    const newData = { ...indicators };
    if (!newData[targetAxis]) {
       newData[targetAxis] = [];
       setAxisOrder([...axisOrder, targetAxis]);
    }
    newData[targetAxis] = [...newData[targetAxis], newAction];
    
    persist(newData);
    setQuickEntryActivity(null);
    setQuickEntryData({ source: '', title: '', goal: '', amount: '' });
    setError("");
    setAdminPassword("");
  };

  const handleActionDragStart = (e: React.DragEvent, group: string, index: number) => {
    setDraggedAction({ group, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleActionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleActionDrop = (e: React.DragEvent, targetGroup: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedAction || viewMode === 'LOA') return;

    const sourceAxis = draggedAction.group;
    const sourceIndex = draggedAction.index;

    if (sourceAxis === targetGroup && sourceIndex === targetIndex) {
      setDraggedAction(null);
      return;
    }

    const newIndicators = { ...indicators };
    const sourceList = [...newIndicators[sourceAxis]];
    const [movedItem] = sourceList.splice(sourceIndex, 1);
    newIndicators[sourceAxis] = sourceList;

    const targetList = sourceAxis === targetGroup ? sourceList : [...newIndicators[targetGroup]];
    targetList.splice(targetIndex, 0, movedItem);
    newIndicators[targetGroup] = targetList;

    persist(newIndicators);
    setDraggedAction(null);
  };

  const handleAxisDragStart = (e: React.DragEvent, axisName: string) => {
    setDraggedAxis(axisName);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleAxisDrop = (e: React.DragEvent, targetAxis: string) => {
    e.preventDefault();
    if (!draggedAxis || draggedAxis === targetAxis) {
      setDraggedAxis(null);
      return;
    }

    const newOrder = [...axisOrder];
    const sourceIdx = newOrder.indexOf(draggedAxis);
    const targetIdx = newOrder.indexOf(targetAxis);

    newOrder.splice(sourceIdx, 1);
    newOrder.splice(targetIdx, 0, draggedAxis);

    persist(indicators, newOrder);
    setDraggedAxis(null);
  };

  const handleSaveAction = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    const newData = { ...indicators };
    if (isAddingMeta) {
      newData[isAddingMeta] = [...(newData[isAddingMeta] || []), { ...formData, id: Date.now().toString(), status: 'Planejado' } as PPAAction];
    } else if (editingItem) {
      Object.keys(newData).forEach(axis => {
        newData[axis] = newData[axis].map(p => p.id === editingItem.id ? { ...p, ...formData } as PPAAction : p);
      });
    }
    persist(newData);
    setIsAddingMeta(null);
    setEditingItem(null);
    setAdminPassword("");
    setFormData({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {} });
  };

  const updateYearlySource = (year: string, source: PPASource, value: string) => {
    const updated = { ...formData.yearlyFunding };
    if (!updated[year]) updated[year] = {};
    updated[year][source] = value;
    setFormData({ ...formData, yearlyFunding: updated });
  };

  const removeYearlySource = (year: string, source: PPASource) => {
    const updated = { ...formData.yearlyFunding };
    if (updated[year]) {
      delete updated[year][source];
      setFormData({ ...formData, yearlyFunding: updated });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 min-h-screen p-4 md:p-0">
      <datalist id="sources-list-quick">
        {Object.entries(sourceLabels).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </datalist>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl shadow-lg shrink-0 transition-colors ${viewMode === 'LDO' ? 'bg-amber-500 text-white' : viewMode === 'LOA' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>
              {viewMode === 'LDO' ? <FileText size={28} /> : viewMode === 'LOA' ? <BadgeDollarSign size={28}/> : <Layers size={28} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
                  {viewMode === 'PPA' ? 'PPA Estratégico 2026-2029' : `${viewMode} EXERCÍCIO ${selectedYear}`}
                </h1>
                <div className="flex items-center gap-2 mt-1 md:mt-0">
                  <button 
                    onClick={() => setShowGlossary(!showGlossary)} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showGlossary ? 'bg-amber-500 text-white shadow-lg' : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'}`}
                    title="O que é PPA, LDO e LOA?"
                  >
                    <HelpCircle size={14} /> <span>Entender Siglas</span>
                  </button>
                  <button 
                    onClick={() => setShowSourcesLegend(!showSourcesLegend)} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showSourcesLegend ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'}`}
                    title="Ver Legenda de Fontes"
                  >
                    <ListTree size={14} /> <span>Ver Fontes</span>
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-xs font-medium flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'LDO' ? 'bg-amber-500' : viewMode === 'LOA' ? 'bg-indigo-500' : 'bg-blue-500'}`}></span>
                {viewMode === 'PPA' ? 'Plano Plurianual' : viewMode === 'LDO' ? 'Lei de Diretrizes Orçamentárias' : 'Lei Orçamentária Anual'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
            <button 
              onClick={() => { setViewMode('PPA'); }} 
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'PPA' ? 'bg-white text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers size={14}/> PPA
            </button>
            <button 
              onClick={() => { setViewMode('LDO'); }} 
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'LDO' ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-200' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
            >
              <FileText size={14}/> LDO
            </button>
            <button 
              onClick={() => { setViewMode('LOA'); }} 
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'LOA' ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
            >
              <BadgeDollarSign size={14}/> LOA
            </button>

            {viewMode !== 'PPA' && (
              <div className={`flex items-center gap-1 bg-white p-1 rounded-lg border ml-2 animate-fade-in ${viewMode === 'LDO' ? 'border-amber-200' : 'border-indigo-200'}`}>
                {['2026', '2027', '2028', '2029'].map(yr => (
                  <button 
                    key={yr} 
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1 rounded text-[10px] font-black transition-all ${selectedYear === yr ? (viewMode === 'LDO' ? 'bg-amber-600' : 'bg-indigo-600') + ' text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setIsAddingAxis(true)} className="ml-2 p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-md shrink-0"><FolderPlus size={18} /></button>
          </div>
        </div>

        {/* RANKING DE FONTES - DINÂMICO */}
        {sourceRanking.length > 0 && (
          <div className="mt-4 pt-6 border-t border-slate-100 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2 rounded-lg text-white shadow-md ${viewMode === 'LDO' ? 'bg-amber-500' : viewMode === 'LOA' ? 'bg-indigo-500' : 'bg-emerald-600'}`}>
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">Ranking de Investimentos por Fonte</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Soma de recursos vinculados - {viewMode === 'PPA' ? 'Período 2026-2029' : `Exercício ${selectedYear}`}</p>
              </div>
            </div>
            <div className="flex gap-4 min-w-max">
              {/* CARD DE TOTAL GERAL */}
              <div className={`${viewMode === 'LDO' ? 'bg-amber-600 border-amber-500' : viewMode === 'LOA' ? 'bg-indigo-600 border-indigo-500' : 'bg-blue-600 border-blue-500'} rounded-2xl p-3 border flex items-center gap-3 shadow-lg shrink-0`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-xs shrink-0">
                  <Sigma size={16} />
                </div>
                <div>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-white shadow-sm mb-1 block w-fit uppercase ${viewMode === 'LDO' ? 'text-amber-600' : viewMode === 'LOA' ? 'text-indigo-600' : 'text-blue-600'}`}>
                    Total Geral
                  </span>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-[9px] font-bold opacity-80">R$</span>
                    <span className="text-[13px] font-black tracking-tighter">
                      {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {sourceRanking.map((item, idx) => (
                <div key={item.source} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3 shadow-sm hover:border-blue-200 transition-colors group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : idx === 1 ? 'bg-slate-200 text-slate-600 border border-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    {idx + 1}º
                  </div>
                  <div>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm mb-1 block w-fit ${sourceStyles[item.source as PPASource] || 'bg-slate-500 text-white'}`}>
                      {item.source}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-bold text-slate-400">R$</span>
                      <span className="text-[13px] font-black text-slate-800 tracking-tighter">
                        {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in border-t border-slate-100 pt-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
               <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0"><BookOpen size={16}/></div>
               <div>
                  <h4 className="text-[11px] font-black text-blue-700 uppercase tracking-widest mb-1">O que é o PPA?</h4>
                  <p className="text-[10px] text-blue-900/60 leading-relaxed font-medium">
                    É o <strong>Mapa do Futuro</strong> (4 anos). Define onde a saúde quer chegar, organizando os grandes investimentos e direções estratégicas.
                  </p>
               </div>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-4 items-start">
               <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0"><CalendarDays size={16}/></div>
               <div>
                  <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-1">O que é a LDO?</h4>
                  <p className="text-[10px] text-amber-900/60 leading-relaxed font-medium">
                    É o <strong>Ajuste do Ano</strong>. Define as metas e prioridades específicas para o próximo exercício financeiro.
                  </p>
               </div>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 items-start">
               <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0"><BadgeDollarSign size={16}/></div>
               <div>
                  <h4 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-1">O que é a LOA?</h4>
                  <p className="text-[10px] text-indigo-900/60 leading-relaxed font-medium">
                    É o <strong>Dinheiro no Bolso</strong>. O orçamento propriamente dito, que autoriza os gastos detalhados para cada ação.
                  </p>
               </div>
            </div>
          </div>
        )}

        {showSourcesLegend && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <ListTree size={18} className="text-emerald-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Legenda de Fontes de Recursos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {LEGEND_DATA.map((item) => (
                <div key={item.code} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm shrink-0 mt-0.5 ${sourceStyles[item.code as PPASource] || 'bg-slate-500 text-white'}`}>
                    {item.code}
                  </span>
                  <p className="text-[9px] text-slate-500 leading-normal font-medium italic">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {viewMode !== 'LOA' ? (
          axisOrder.map((axis) => {
            const list = indicators[axis] || [];
            return (
              <div 
                key={axis} 
                onDragOver={handleActionDragOver}
                onDrop={(e) => {
                  if (draggedAxis) {
                    handleAxisDrop(e, axis);
                  } else if (draggedAction && list.length === 0) {
                    handleActionDrop(e, axis, 0);
                  }
                }}
                className={`space-y-6 animate-fade-in transition-all ${draggedAxis === axis ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 gap-4">
                  <div 
                    draggable
                    onDragStart={(e) => handleAxisDragStart(e, axis)}
                    className="flex items-center gap-3 group shrink-0 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical size={20} className={`transition-colors ${viewMode === 'LDO' ? 'text-amber-300 group-hover:text-amber-500' : viewMode === 'LOA' ? 'text-indigo-300 group-hover:text-indigo-500' : 'text-slate-300 group-hover:text-blue-500'}`} />
                    <div className={`w-4 h-4 rounded-full shadow-md shrink-0 ${viewMode === 'LDO' ? 'bg-amber-500' : viewMode === 'LOA' ? 'bg-indigo-500' : 'bg-blue-600'}`}></div>
                    <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">{axis}</h2>
                    <button 
                      onClick={() => { if(confirm("Excluir eixo?")) { const d = {...indicators}; delete d[axis]; persist(d, axisOrder.filter(a => a !== axis)); }}} 
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-all shrink-0 print:hidden"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  <button onClick={() => { setIsAddingMeta(axis); setFormData({yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}}); }} className={`px-4 py-2 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md transition-all shrink-0 print:hidden ${viewMode === 'LDO' ? 'bg-amber-600 hover:bg-amber-700' : viewMode === 'LOA' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>+ Nova Ação</button>
                </div>

                <div className="space-y-4">
                  {list.map((item, index) => (
                    <ActionCard 
                      key={item.id} 
                      item={item} 
                      groupKey={axis}
                      index={index}
                      viewMode={viewMode}
                      selectedYear={selectedYear}
                      onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                      onDelete={(id) => { if(confirm("Excluir permanentemente?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                      onDragStart={handleActionDragStart}
                      onDragOver={handleActionDragOver}
                      onDrop={handleActionDrop}
                    />
                  ))}
                  {list.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-300 font-bold uppercase tracking-widest text-xs">
                      Arraste uma ação para este eixo
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          // LOA VIEW WITH QUICK ADD EXPENDITURE PER ACTIVITY
          (Object.entries(loaGroups || {}) as [string, PPAAction[]][]).map(([activity, list]) => (
            <div key={activity} className="space-y-6 animate-fade-in scroll-mt-24" id={`activity-${activity}`}>
              <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-4 gap-4">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-md"></div>
                  <h2 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">{activity}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {list.length} Itens Orçamentários
                  </div>
                  <button 
                    onClick={() => {
                      setQuickEntryActivity(activity === quickEntryActivity ? null : activity);
                      setQuickEntryData({ source: '', title: '', goal: '', amount: '' });
                      setError("");
                    }} 
                    className={`p-2 rounded-xl transition-all shadow-md ${quickEntryActivity === activity ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {quickEntryActivity === activity ? <X size={18}/> : <Plus size={18} />}
                  </button>
                </div>
              </div>

              {/* QUICK ADD EXPENDITURE FORM - IMPROVED WITH DATALIST */}
              {quickEntryActivity === activity && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl animate-fade-in border border-slate-800 ring-4 ring-indigo-100/50">
                   <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400">
                     <PlusCircle size={16}/> Vincular Novo Item Orçamentário à {activity}
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fonte (Selecione ou Digite)</label>
                        <input 
                          list="sources-list-quick"
                          placeholder="Ex: 1500"
                          value={quickEntryData.source}
                          onChange={(e) => setQuickEntryData({...quickEntryData, source: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Gasto (Onde será gasto?)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Diárias, Medicamentos..." 
                          value={quickEntryData.title}
                          onChange={(e) => setQuickEntryData({...quickEntryData, title: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Física</label>
                        <input 
                          type="text" 
                          placeholder="Ex: 10 unid." 
                          value={quickEntryData.goal}
                          onChange={(e) => setQuickEntryData({...quickEntryData, goal: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor R$ ({selectedYear})</label>
                        <input 
                          type="text" 
                          placeholder="0,00" 
                          value={quickEntryData.amount}
                          onChange={(e) => setQuickEntryData({...quickEntryData, amount: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                   </div>

                   <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="w-full md:w-64">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Senha de Autorização</label>
                         <input 
                           type="password" 
                           value={adminPassword} 
                           onChange={(e) => setAdminPassword(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-bold text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                           placeholder="••••••••"
                         />
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
                        <button 
                          onClick={() => handleQuickAddLOA(activity)}
                          className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                        >
                          <Save size={18}/> Sincronizar à LOA
                        </button>
                      </div>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                {list.map((item, index) => (
                  <ActionCard 
                    key={item.id} 
                    item={item} 
                    groupKey={activity}
                    index={index}
                    viewMode={viewMode}
                    selectedYear={selectedYear}
                    onEdit={(p) => { setEditingItem(p); setFormData(p); setAdminPassword(""); setError(""); }}
                    onDelete={(id) => { if(confirm("Excluir permanentemente?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter(i => i.id !== id)); persist(d); }}}
                    onDragStart={() => {}}
                    onDragOver={() => {}}
                    onDrop={() => {}}
                  />
                ))}
                {list.length === 0 && (
                  <div className="py-8 text-center border border-dashed border-indigo-100 rounded-3xl text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                    Nenhum item orçamentário vinculado a esta atividade. Use o botão "+" para adicionar.
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh] border border-slate-200">
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-500 rounded-xl shrink-0"><Edit3 size={20} /></div>
                 <div>
                   <h3 className="text-lg font-bold uppercase tracking-tight leading-none">{editingItem ? 'Editar Ação' : 'Nova Ação'}</h3>
                   <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">{isAddingMeta || 'PPA e LDO 2026-2029'}</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
             </div>

             <div className="p-6 overflow-y-auto space-y-8 bg-slate-50/30 flex-1">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider flex items-center gap-2"><ArrowRight size={14} className="text-blue-500"/> Nome da Ação / Título do Gasto</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Ampliação de Infraestrutura" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Objetivo Estratégico / Descritivo</label>
                      <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-medium text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Finalidade da ação..." />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider flex items-center gap-2">
                        <Briefcase size={14} className="text-indigo-500"/> Atividade LOA (Vínculo Orçamentário)
                      </label>
                      <select 
                        value={formData.loaActivity || ""} 
                        onChange={(e) => setFormData({...formData, loaActivity: e.target.value})} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">Selecione uma atividade orçamentária...</option>
                        {LOA_ACTIVITIES.map(act => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Unidade de Medida / Indicador</label>
                      <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: % de Execução" />
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <h5 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-2">
                   <TrendingUp size={18} className="text-blue-600"/> Cronograma Financeiro e Metas
                 </h5>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                   {['2026', '2027', '2028', '2029'].map(year => (
                     <div key={year} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs">{year}</span>
                          <div className="text-right">
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Meta</label>
                            <input type="text" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center outline-none" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Coins size={14} className="text-emerald-500"/> Fontes de Recurso</label>
                          <div className="space-y-2">
                            {Object.entries(formData.yearlyFunding?.[year] || {}).map(([source, amount]) => (
                              <div key={source} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                 <span className={`text-[8px] font-bold px-2 py-1 rounded shadow-sm ${sourceStyles[source as PPASource] || 'bg-slate-500 text-white'}`}>{source}</span>
                                 <input 
                                    type="text" 
                                    value={amount as string} 
                                    onChange={(e) => updateYearlySource(year, source as PPASource, e.target.value)}
                                    className="flex-1 text-xs font-bold outline-none bg-transparent"
                                    placeholder="0,00"
                                 />
                                 <button onClick={() => removeYearlySource(year, source as PPASource)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                              </div>
                            ))}
                          </div>

                          <select 
                            className="w-full p-2.5 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl text-[10px] font-bold text-blue-600 outline-none hover:bg-blue-50 transition-all"
                            onChange={(e) => {
                              if (e.target.value === "CUSTOM_SRC") {
                                 const custom = prompt("Digite o código da nova fonte:");
                                 if (custom) updateYearlySource(year, custom, "");
                              } else if (e.target.value) {
                                updateYearlySource(year, e.target.value as PPASource, "");
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="">+ Vincular Fonte...</option>
                            {(Object.keys(sourceLabels) as PPASource[]).map(s => (
                              <option key={s} value={s} disabled={!!formData.yearlyFunding?.[year]?.[s]}>{sourceLabels[s]}</option>
                            ))}
                            <option value="CUSTOM_SRC">+ Adicionar Fonte Personalizada</option>
                          </select>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-3 block flex items-center gap-2 tracking-widest"><Lock size={14} className="text-blue-500"/> Autorização de Gestão</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest" placeholder="••••••••" />
                    {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase text-center">{error}</p>}
                 </div>
                 <button onClick={handleSaveAction} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-blue-700 hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                   <Save size={20} /> Sincronizar ao Painel
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8 animate-fade-in border border-slate-200">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FolderPlus size={24}/></div>
                <h3 className="font-bold text-slate-900 uppercase text-lg tracking-tight">Novo Eixo Estratégico</h3>
             </div>
             <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Identificação</label>
                  <input type="text" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Eixo 5: Infraestrutura" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Senha</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-center tracking-widest outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••" />
               </div>
               <button 
                 onClick={() => { 
                   if(adminPassword==='Conselho@2026'){ 
                     const updatedIndicators = {...indicators, [axisName]: []};
                     const updatedOrder = [...axisOrder, axisName];
                     persist(updatedIndicators, updatedOrder); 
                     setIsAddingAxis(false); 
                     setAxisName(""); 
                     setAdminPassword(""); 
                   } else {
                     setError("Senha incorreta");
                   } 
                 }} 
                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
               >
                 Criar Eixo
               </button>
               {error && <p className="text-red-500 text-center text-[10px] font-bold uppercase mt-4">{error}</p>}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PPA;
