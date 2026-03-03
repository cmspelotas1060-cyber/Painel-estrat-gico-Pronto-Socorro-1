
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import { syncService } from '../services/supabase';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, CirclePlus as PlusCircle,
  ChevronRight, ChevronLeft, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check, SquarePlus as PlusSquare, CircleAlert, ReceiptText,
  Search, LayoutList, Share2, Loader2, CheckCircle, Download, ClipboardList, Wallet,
  HelpCircle as HelpIcon, Scale, Landmark, ListChecks, ChevronFirst, ChevronLast, Trophy,
  Activity, BarChart3, CreditCard, Sparkles, Filter, List, AlertTriangle, SearchCode
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

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

const BUDGET_NATURES = {
  "Pessoal e Encargos Sociais": [
    "3.1.9.0.03 - Pensões", "3.1.9.0.04 - Contratação por Tempo Determinado",
    "3.1.9.0.11 - Vencimentos e Vantagens Fixas - Pessoal Civil",
    "3.1.9.0.13 - Obrigações Patronais", "3.1.9.0.16 - Outras Despesas Variáveis Pessoal Civil",
    "3.1.9.0.46 - Auxílio-Alimentação", "3.1.9.0.67 - Depósitos Compulsórios",
    "3.1.9.0.91 - Sentenças Judiciais", "3.1.9.0.92 - Despesas de Exercícios Anteriores",
    "3.1.9.0.94 - Indenizações Trabalhistas", "3.1.9.0.96 - Ressarcimento Despesas de Pessoal Requisitado",
    "3.1.9.1.13 - Obrigações Patronais"
  ],
  "OUTRAS DESPESAS CORRENTES": [
    "3.3.5.0.41 - Contribuições", "3.3.5.0.43 - Subvenções Sociais",
    "3.3.9.0.01 - Aposentadorias", "3.3.9.0.03 - Pensões",
    "3.3.9.0.04 - Contratação por Tempo Determinado", "3.3.9.0.05 - Outros Benefícios Previdenciários",
    "3.3.9.0.08 - Outros Benefícios Assistenciais", "3.3.9.0.14 - Diárias Pessoal Civil",
    "3.3.9.0.18 - Auxílio Financeiro a Estudantes", "3.3.9.0.20 - Auxílio Financeiro a Pesquisadores",
    "3.3.9.0.30 - Material Consumível", "3.3.9.0.31 - Premiações Culturais, Artísticas, Científicas, Desportivas e Outras",
    "3.3.9.0.32 - Material de Distribuição Gratuita", "3.3.9.0.33 - Passagens e Despesas com Locomoção",
    "3.3.9.0.34 - Outras Despesas de Pessoal Dec. Contra. de Terceirização",
    "3.3.9.0.35 - Services de Consultoria", "3.3.9.0.36 - Outros Serviços de Terceiros - Pessoa Física",
    "3.3.9.0.37 - Locações de Mão-de-Obra", "3.3.9.0.38 - Arrendamento Mercantil",
    "3.3.9.0.39 - Outros Serviços de Terceiros - Pessoa Jurídica", "3.3.9.0.40 - Serviços de Tecnologia da Informação e Comunicação - PJ",
    "3.3.9.0.41 - Contribuições", "3.3.9.0.46 - Auxílio - Alimentação",
    "3.3.9.0.47 - Obrigações Tributárias e Contributivas", "3.3.9.0.48 - Outros Auxílios Financeiros a Pessoas Físicas",
    "3.3.9.0.49 - Auxílio -Transporte", "3.3.9.0.67 - Depósitos Compulsórios",
    "3.3.9.0.91 - Sentenças Judiciais", "3.3.9.0.92 - Despesas de Exercícios Anteriores",
    "3.3.9.0.93 - Indenizações e Restituições"
  ],
  "INVESTIMENTOS": [
    "4.4.20.93 - INDENIZAÇÕES E RESTITUIÇÕES - UNIÃO", "4.4.30.93 - INDENIZAÇÕES E RESTITUIÇÕES - ESTADO",
    "4.4.5.0.42 - Auxílios", "4.4.9.0.14 - Diárias - Civil",
    "4.4.9.0.30 - Material Consumível", "4.4.9.0.35 - Serviços de Consultoria",
    "4.4.9.0.36 - Outros Serviços de Terceiros - Pessoa Física", "4.4.9.0.39 - Out Serviços de Terceiros - Pessoa Jurídica",
    "4.4.9.0.51 - Obras e Instalações", "4.4.9.0.52 - Equipamentos e Material Permanente",
    "4.4.9.0.61 - Aquisição de Imóveis", "4.4.9.0.91 - Sentenças Judiciais",
    "4.4.9.0.92 - Despesas de Exercícios Anteriores"
  ]
};

const FUNDING_SOURCES_DETAILED = [
  "1500 – Recursos municipais / aplicação mínima de 15% em ações de saúde.",
  "1500.1002 – Recursos municipais / aplicação mínima de 15% em ações de saúde.",
  "1600 – Recursos de custeio repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.",
  "1605 – Recursos referentes ao complemento do piso da enfermagem.",
  "1604 – Recursos referente ao repasse dos Agentes de Combates a Endemias e Agentes Comunitários de Saúde.",
  "1621 – Recursos repassados para custeio pelo Fundo Estadual de Saúde ao Fundo Municipal de Saúde.",
  "1659 – Recursos de transferências vinculadas para ações de saúde.",
  "1601 – Recursos de investimentos repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.",
  "1600.3110 – Recursos de emendas de deputados federais referentes a custeio.",
  "1600.3120 – Recursos de emendas de bancada federais referentes a custeio.",
  "1601.3110 – Recursos de emendas de deputados federais referentes a investimento.",
  "1601.3120 – Recursos de emendas de bancada federais referentes a investimentos."
];

const sourceStyles: Record<string, string> = {
  '1500': 'bg-slate-900 text-white',
  '1500.1002': 'bg-slate-800 text-white',
  '1621': 'bg-amber-500 text-white',
  '1600': 'bg-emerald-600 text-white',
  '1604': 'bg-emerald-500 text-white',
  '1605': 'bg-emerald-400 text-white',
  '1659': 'bg-indigo-500 text-white',
  '1601': 'bg-cyan-600 text-white',
  '1600.3110': 'bg-teal-600 text-white',
  '1600.3120': 'bg-teal-700 text-white',
  '1601.3110': 'bg-sky-600 text-white',
  '1601.3120': 'bg-sky-700 text-white'
};

const parseCurrency = (val: any): number => {
  if (val === undefined || val === null || val === "") return 0;
  const clean = val.toString()
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

const ActionCard = ({ item, groupKey, index, viewMode, selectedYear, defaultExpanded, onEdit, onDelete }: any) => {
  const isSingleYear = viewMode === 'LOA' || viewMode === 'LDO';
  const years = useMemo(() => isSingleYear ? [selectedYear] : ['2026', '2027', '2028', '2029'], [isSingleYear, selectedYear]);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (defaultExpanded) {
      const newExpanded: Record<string, boolean> = {};
      years.forEach(y => { newExpanded[y] = true; });
      setExpandedYears(newExpanded);
    }
  }, [defaultExpanded, years]);

  const sourceData = useMemo(() => {
    const summary: Record<string, number> = {};
    const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === selectedYear);
    
    if (yearDetailedBudget.length > 0) {
      yearDetailedBudget.forEach((b: any) => {
        const code = b.source.split(' – ')[0].split(' - ')[0].trim();
        const amount = parseCurrency(b.value);
        if (amount > 0) summary[code] = (summary[code] || 0) + amount;
      });
    } else {
      const yearFunding = (item.yearlyFunding && item.yearlyFunding[selectedYear]) || {};
      
      if (yearFunding.entries && Array.isArray(yearFunding.entries) && yearFunding.entries.length > 0) {
        yearFunding.entries.forEach((entry: any) => {
          const amount = parseCurrency(entry.value);
          if (amount > 0 && entry.source) {
            const code = entry.source.split(' – ')[0].split(' - ')[0].trim();
            summary[code] = (summary[code] || 0) + amount;
          }
        });
      } else {
        const amount = parseCurrency(yearFunding['Total'] || 0);
        if (amount > 0) {
          const specificYearSource = yearFunding['source'] || item.ppaSource;
          if (specificYearSource) {
             const code = specificYearSource.split(' – ')[0].split(' - ')[0].trim();
             summary[code] = (summary[code] || 0) + amount;
          }
        }
      }
    }
    return summary;
  }, [item, selectedYear]);

  const totalAction = useMemo(() => {
     const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === selectedYear);
     if (yearDetailedBudget.length > 0) {
       return yearDetailedBudget.reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
     }
     const yearFunding = item.yearlyFunding?.[selectedYear] || {};
     if (yearFunding.entries && Array.isArray(yearFunding.entries) && yearFunding.entries.length > 0) {
       return yearFunding.entries.reduce((acc: number, entry: any) => acc + parseCurrency(entry.value), 0);
     }
     return parseCurrency(yearFunding['Total'] || 0);
  }, [item, selectedYear]);

  return (
    <div className={`bg-white rounded-[32px] border ${viewMode === 'LOA' ? 'border-indigo-100' : 'border-slate-200'} shadow-sm transition-all flex flex-col relative overflow-hidden w-full mb-8`}>
      <div className={`p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center relative ${viewMode === 'LOA' ? 'bg-slate-50/50' : ''}`}>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2 mb-1">
            {Object.keys(sourceData).map(source => (
              <span key={source} className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>{source}</span>
            ))}
            {(item.origin === 'LOA' || (item.detailedBudget && (item.detailedBudget as any[]).some((b:any) => b.year === selectedYear))) && viewMode === 'LOA' && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 uppercase border border-indigo-200">Em Auditoria LOA</span>}
          </div>
          <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter leading-tight">{item.action}</h4>
          <p className="text-base text-slate-500 italic font-semibold leading-relaxed">"{item.objective}"</p>
          
          {totalAction > 0 && (
            <div className="pt-2 w-full max-w-md">
               <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
                  {Object.entries(sourceData).map(([source, val]) => (
                    <div 
                      key={source} 
                      style={{ width: `${((val as number) / totalAction) * 100}%` }}
                      className={sourceStyles[source] || 'bg-slate-400'}
                      title={`${source}: R$ ${(val as number).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                  ))}
               </div>
               <div className="flex justify-between mt-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Composição Orçamentária</span>
                 <span className="text-[10px] font-black text-slate-900">Total: R$ {totalAction.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
               </div>
            </div>
          )}
        </div>
        
        {viewMode !== 'LOA' && (
          <div className="shrink-0 flex items-center gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100 shadow-inner">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <Target size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Indicador Estratégico</p>
              <p className="text-lg font-black text-slate-800">{item.indicator || 'Não definido'}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 print:hidden ml-4">
          <button onClick={() => onEdit(item)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent shadow-sm bg-white">
            <Edit3 size={24}/>
          </button>
          <button onClick={() => onDelete(item.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent shadow-sm bg-white">
            <Trash2 size={24}/></button>
        </div>
      </div>

      <div className="p-8 bg-white">
        <div className={`grid gap-8 ${isSingleYear ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {years.map(year => {
            const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === year);
            const detailedSum = yearDetailedBudget.reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
            
            let displayTotal = detailedSum;
            if (detailedSum === 0) {
              const yearFunding = (item.yearlyFunding && item.yearlyFunding[year]) || {};
              if (yearFunding.entries && Array.isArray(yearFunding.entries) && yearFunding.entries.length > 0) {
                displayTotal = yearFunding.entries.reduce((acc: number, entry: any) => acc + parseCurrency(entry.value), 0);
              } else {
                displayTotal = parseCurrency(yearFunding['Total'] || 0);
              }
            }

            const goal = (item.goals && item.goals[year]) || '-';
            const isExpanded = expandedYears[year];
            
            return (
              <div key={year} className={`p-6 rounded-[32px] border bg-white border-slate-200 shadow-sm flex flex-col transition-all hover:border-blue-300 ${viewMode === 'LOA' ? 'bg-slate-50/20' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black uppercase flex items-center gap-3 text-slate-900 tracking-tight">
                    <span className={`w-4 h-4 rounded-full ${displayTotal > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></span> EXERCÍCIO {year}
                  </span>
                  {yearDetailedBudget.length > 0 && (
                    <button 
                      onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                      className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm ${isExpanded ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {isExpanded ? 'Ocultar Extrato' : 'Ver Extrato'}
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {viewMode !== 'LOA' && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meta Física</p>
                      <div className="text-xl font-black text-blue-600 tracking-tight">{goal}</div>
                    </div>
                  )}

                  <div className={`flex-1 ${viewMode !== 'LOA' ? 'pt-5 border-t border-slate-100' : ''}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <Coins size={14} className="text-emerald-600"/> Planejamento Financeiro
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-black text-emerald-600">R$</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{displayTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dotação Orçamentária Detalhada</h5>
                      <ReceiptText size={18} className="text-slate-300"/>
                    </div>
                    {yearDetailedBudget.map((b: any, bidx: number) => (
                      <div key={bidx} className="bg-slate-100/50 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-indigo-700 uppercase leading-none bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{b.nature}</span>
                           <div className="text-[11px] text-slate-600 italic font-bold leading-relaxed flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${sourceStyles[b.source.split(' ')[0]] || 'bg-slate-400'}`}></div>
                             {b.source}
                           </div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Valor Alocado</p>
                          <span className="text-xl font-black text-slate-900 tabular-nums">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PPA = () => {
  const [viewMode, setViewMode] = useState('PPA');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [indicators, setIndicators] = useState<Record<string, any[]>>({});
  const [axisOrder, setAxisOrder] = useState<string[]>([]);
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [selectedTitleId, setSelectedTitleId] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<any>({ yearlyFunding: { '2026': { entries: [] }, '2027': { entries: [] }, '2028': { entries: [] }, '2029': { entries: [] } }, goals: {}, detailedBudget: [] });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [newBudgetEntry, setNewBudgetEntry] = useState({ year: '', nature: '', source: '', value: '' });
  const [showInfo, setShowInfo] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const [isLegendRecessed, setIsLegendRecessed] = useState(false);
  const [draggedAxisIndex, setDraggedAxisIndex] = useState<number | null>(null);

  // Estados temporários para os campos de adição de fontes no grid PPA do modal
  const [ppaTempEntries, setPpaTempEntries] = useState<Record<string, { value: string, source: string }>>({
    '2026': { value: '', source: '' },
    '2027': { value: '', source: '' },
    '2028': { value: '', source: '' },
    '2029': { value: '', source: '' }
  });

  useEffect(() => {
    const saved = storage.getSync('ps_ppa_full_data_v2');
    const savedOrder = storage.getSync('ps_ppa_axis_order');
    if (saved) {
      setIndicators(saved);
      if (savedOrder) setAxisOrder(savedOrder);
      else {
        const keys = Object.keys(saved);
        setAxisOrder(keys);
        localStorage.setItem('ps_ppa_axis_order', JSON.stringify(keys));
      }
    }
  }, []);

  const persist = (data: any, order?: string[]) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
    if (order) {
      setAxisOrder(order);
      localStorage.setItem('ps_ppa_axis_order', JSON.stringify(order));
    }
  };

  // Funções para Arrastar Eixos
  const handleAxisDragStart = (index: number) => {
    setDraggedAxisIndex(index);
  };

  const handleAxisDrop = (index: number) => {
    if (draggedAxisIndex === null) return;
    const newOrder = [...axisOrder];
    const [removed] = newOrder.splice(draggedAxisIndex, 1);
    newOrder.splice(index, 0, removed);
    persist(indicators, newOrder);
    setDraggedAxisIndex(null);
  };

  // Deduplicação global de itens para evitar qualquer soma duplicada nos cálculos de ranking
  const uniqueItems = useMemo(() => {
    const allItemsRaw = Object.values(indicators).flat();
    const seenIds = new Set<string>();
    // Fix: Add type assertion to item to avoid property access on unknown type
    return allItemsRaw.filter((item: any) => {
      if (!item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }, [indicators]);

  const { sourceRankings, totalGeralRanking } = useMemo(() => {
    const totalsBySource: Record<string, number> = {};
    let absoluteTotal = 0;
    
    const yearsToSum = viewMode === 'PPA' ? ['2026', '2027', '2028', '2029'] : [selectedYear];

    uniqueItems.forEach((item: any) => {
      // LOA View consider any item with budget for the year as visible for ranking
      // Added explicit type cast to any[] for .some() to resolve 'unknown' type error.
      const hasBudgetForYear = item.detailedBudget && (item.detailedBudget as any[]).some((b:any) => b.year === selectedYear);
      const isVisible = viewMode === 'LOA' ? (item.origin === 'LOA' || hasBudgetForYear) : (item.origin === 'PPA' || !item.origin);
      if (!isVisible) return;

      yearsToSum.forEach(yr => {
        const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === yr);
        
        if (yearDetailedBudget.length > 0) {
          yearDetailedBudget.forEach((b: any) => {
            const code = b.source.split(' – ')[0].split(' - ')[0].trim();
            const amount = parseCurrency(b.value);
            if (amount > 0) {
              if (code !== 'Total') totalsBySource[code] = (totalsBySource[code] || 0) + amount;
            }
          });
        } else {
          const yearFunding = item.yearlyFunding?.[yr] || {};
          
          if (yearFunding.entries && Array.isArray(yearFunding.entries) && yearFunding.entries.length > 0) {
            yearFunding.entries.forEach((entry: any) => {
               const amt = parseCurrency(entry.value);
               if (amt > 0 && entry.source) {
                 const code = entry.source.split(' – ')[0].split(' - ')[0].trim();
                 totalsBySource[code] = (totalsBySource[code] || 0) + amt;
               }
            });
          } else {
            const totalVal = parseCurrency(yearFunding['Total'] || 0);
            if (totalVal > 0) {
              const yearSpecificSource = yearFunding['source'] || (item.origin === 'PPA' ? item.ppaSource : null);
              if (yearSpecificSource) {
                 const code = yearSpecificSource.split(' – ')[0].split(' - ')[0].trim();
                 if (code !== 'Total') totalsBySource[code] = (totalsBySource[code] || 0) + totalVal;
              } else {
                 Object.entries(yearFunding).forEach(([source, val]) => {
                   if (source === 'Total' || source === 'source' || source === 'entries') return;
                   const amount = parseCurrency(val);
                   if (amount > 0) {
                     totalsBySource[source] = (totalsBySource[source] || 0) + amount;
                   }
                 });
              }
            }
          }
        }
      });
    });

    const rankings = Object.entries(totalsBySource)
      .filter(([source]) => source !== 'Total')
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([source, total]) => ({ source, total: total as number }));

    // O total geral deve ser a soma exata dos valores por fonte para garantir consistência visual
    absoluteTotal = rankings.reduce((acc, curr) => acc + curr.total, 0);

    return { sourceRankings: rankings, totalGeralRanking: absoluteTotal };
  }, [uniqueItems, viewMode, selectedYear]);

  const handleSaveAction = (...args: any[]) => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }
    
    const origin = viewMode === 'LOA' ? 'LOA' : 'PPA';
    
    const newData = { ...indicators };
    if (isAddingMeta) {
      newData[isAddingMeta] = [...(newData[isAddingMeta] || []), { ...formData, id: Date.now().toString(), status: 'Planejado', origin }];
    } else if (editingItem) {
      Object.keys(newData).forEach(axis => {
        newData[axis] = newData[axis].map((p: any) => p.id === editingItem.id ? { ...p, ...formData, origin: p.origin || origin } : p);
      });
    }
    persist(newData);
    setIsAddingMeta(null); setEditingItem(null); setAdminPassword(""); setError("");
    setFormData({ yearlyFunding: { '2026': { entries: [] }, '2027': { entries: [] }, '2028': { entries: [] }, '2029': { entries: [] } }, goals: {}, detailedBudget: [] });
  };

  const addBudgetEntry = () => {
    if (!newBudgetEntry.year || !newBudgetEntry.nature || !newBudgetEntry.source || !newBudgetEntry.value) {
      alert("Preencha todos os campos da dotação, incluindo o Ano."); return;
    }
    setFormData({ ...formData, detailedBudget: [...(formData.detailedBudget || []), { ...newBudgetEntry }] });
    setNewBudgetEntry({ year: '', nature: '', source: '', value: '' });
  };

  const addPpaEntry = (year: string) => {
    const entry = ppaTempEntries[year];
    if (!entry.value || !entry.source) {
      alert("Informe o valor e a fonte para adicionar.");
      return;
    }
    
    const currentYearData = formData.yearlyFunding?.[year] || { entries: [] };
    const updatedEntries = [...(currentYearData.entries || []), { ...entry }];
    
    setFormData({
      ...formData,
      yearlyFunding: {
        ...(formData.yearlyFunding || {}),
        [year]: { ...currentYearData, entries: updatedEntries }
      }
    });

    setPpaTempEntries({
      ...ppaTempEntries,
      [year]: { value: '', source: '' }
    });
  };

  const removePpaEntry = (year: string, idx: number) => {
    const currentYearData = formData.yearlyFunding?.[year] || { entries: [] };
    const updatedEntries = [...currentYearData.entries];
    updatedEntries.splice(idx, 1);
    
    setFormData({
      ...formData,
      yearlyFunding: {
        ...(formData.yearlyFunding || {}),
        [year]: { ...currentYearData, entries: updatedEntries }
      }
    });
  };

  // Grouping for LOA Mode - Includes Axis Support and Dynamic Categories
  const loaGroups = useMemo(() => {
    if (viewMode !== 'LOA') return null;
    const groups: any = {};
    
    // Fill with current axis names to ensure they appear even if empty
    axisOrder.forEach(axis => { groups[axis] = []; });
    
    // Also support standard finalistic categories
    LOA_ACTIVITIES.forEach(act => { if(!groups[act]) groups[act] = []; });
    
    groups["DOTAÇÕES SEM CATEGORIA DEFINIDA"] = []; 
    
    uniqueItems.forEach((action: any) => {
      // Added explicit type cast to any[] for .some() to resolve 'unknown' type error.
      const hasBudgetForYear = action.detailedBudget && (action.detailedBudget as any[]).some((b:any) => b.year === selectedYear);
      if (action.origin === 'LOA' || hasBudgetForYear) {
        // Find which axis this action belongs to in the state
        let parentAxis = "";
        Object.entries(indicators).forEach(([axis, items]) => {
           // Added explicit type cast to any[] for .some() to resolve 'unknown' type error.
           if ((items as any[]).some(i => i.id === action.id)) parentAxis = axis;
        });

        // 1. Prioritize Axis organization as folders
        if (parentAxis && groups[parentAxis]) {
          groups[parentAxis].push(action);
        } 
        // 2. Fallback to finalistic activity if axis not found
        else if (action.loaActivity && groups[action.loaActivity]) {
          groups[action.loaActivity].push(action);
        } 
        // 3. Last fallback
        else {
          groups["DOTAÇÕES SEM CATEGORIA DEFINIDA"].push(action);
        }
      }
    });

    const filteredGroups: any = {};
    Object.entries(groups).forEach(([key, val]: [string, any]) => {
      // Keep axes defined in axisOrder visible even if empty to satisfy "Novo eixo apareça"
      // Keep other categories only if they have items
      if (val.length > 0 || axisOrder.includes(key)) {
        filteredGroups[key] = val;
      }
    });

    return filteredGroups;
  }, [uniqueItems, viewMode, axisOrder, indicators, selectedYear]);

  const activitySummary = useMemo(() => {
    const summary: Record<string, { total: number, sources: Record<string, number> }> = {};
    if (!loaGroups) return summary;
    Object.entries(loaGroups).forEach(([activity, actions]: any) => {
      let actTotal = 0; const actSources: Record<string, number> = {};
      actions.forEach((item: any) => {
        const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === selectedYear);
        
        if (yearDetailedBudget.length > 0) {
          yearDetailedBudget.forEach((b: any) => {
             const code = b.source.split(' – ')[0].split(' - ')[0].trim();
             const amt = parseCurrency(b.value);
             if (code !== 'Total') actSources[code] = ((actSources[code] as number) || 0) + amt;
             actTotal += amt;
          });
        } else {
          const yearFunding = item.yearlyFunding?.[selectedYear] || {};
          
          if (yearFunding.entries && Array.isArray(yearFunding.entries) && yearFunding.entries.length > 0) {
            yearFunding.entries.forEach((entry: any) => {
              const amt = parseCurrency(entry.value);
              actTotal += amt;
              if (entry.source) {
                const code = entry.source.split(' – ')[0].split(' - ')[0].trim();
                actSources[code] = ((actSources[code] as number) || 0) + amt;
              }
            });
          } else {
            const yearAmt = parseCurrency(yearFunding['Total'] || 0);
            actTotal += yearAmt;
            const yearSourceFull = yearFunding['source'] || item.ppaSource;
            if (yearSourceFull) {
              const code = yearSourceFull.split(' – ')[0].split(' - ')[0].trim();
              actSources[code] = ((actSources[code] as number) || 0) + yearAmt;
            }
          }
        }
      });
      summary[activity] = { total: actTotal, sources: actSources };
    });
    return summary;
  }, [loaGroups, selectedYear]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('supabase.auth.')) {
          fullDb[key] = localStorage.getItem(key);
        }
      }

      if (Object.keys(fullDb).length === 0) {
        throw new Error('Nenhum dado encontrado para compartilhar.');
      }

      const payload = { full_db: fullDb, ts: Date.now() };
      const shareId = await syncService.createShare(payload);
      
      const currentHash = window.location.hash.split('?')[0] || '#/ppa';
      const shareUrl = `${window.location.origin}${window.location.pathname}${currentHash}${currentHash.includes('?') ? '&' : '?'}share=id_${shareId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e: any) { 
      console.error(e);
      alert(`Erro ao gerar link de sincronização: ${e.message || 'Falha na conexão.'}`); 
    } finally { 
      setIsSharing(false); 
    }
  };

  const handleDeleteItem = (id: string) => {
    if(confirm("Deseja realmente excluir este registro?")) {
      const d = {...indicators};
      Object.keys(d).forEach(a => {
        d[a] = d[a].filter((i: any) => i.id !== id);
      });
      persist(d);
    }
  };

  const handleDeleteAxis = (axis: string) => {
    if (!confirm(`Deseja realmente excluir o eixo "${axis}" e todas as suas ações? Esta ação não pode ser desfeita.`)) return;
    const pw = prompt("Digite a senha master para confirmar a exclusão do eixo:");
    if (pw !== 'Conselho@2026') {
      alert("Senha incorreta.");
      return;
    }
    const newIndicators = { ...indicators };
    delete newIndicators[axis];
    const newAxisOrder = axisOrder.filter(a => a !== axis);
    persist(newIndicators, newAxisOrder);
  };

  // Valor total de itens LOA que não estão categorizados
  const uncategorizedValue = useMemo(() => {
    if (viewMode !== 'LOA') return 0;
    const items = loaGroups?.["DOTAÇÕES SEM CATEGORIA DEFINIDA"] || [];
    return items.reduce((acc: number, item: any) => {
       const yearDetailedBudget = (item.detailedBudget || []).filter((b: any) => b.year === selectedYear);
       if (yearDetailedBudget.length > 0) return acc + yearDetailedBudget.reduce((sum: number, b: any) => sum + parseCurrency(b.value), 0);
       const yearFunding = item.yearlyFunding?.[selectedYear] || {};
       if (yearFunding.entries && Array.isArray(yearFunding.entries)) return acc + yearFunding.entries.reduce((sum: number, e: any) => sum + parseCurrency(e.value), 0);
       return acc + parseCurrency(yearFunding['Total'] || 0);
    }, 0);
  }, [loaGroups, viewMode, selectedYear]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-24 min-h-screen">
      {/* STICKY HEADER */}
      <div className="bg-slate-50 pb-6 pt-4 -mx-4 px-4 border-b border-slate-200">
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 md:gap-8 mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="p-4 md:p-5 bg-slate-900 text-white rounded-2xl md:rounded-3xl shadow-2xl shrink-0">
               <Layers size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {viewMode === 'PPA' ? 'PPA Estratégico 2026-2029' : `${viewMode} EXERCÍCIO ${selectedYear}`}
              </h1>
              <p className="text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-80">
                 <CalendarDays size={14} className="text-blue-500"/>
                 Legislação Orçamentária e Gestão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 bg-slate-100 p-1.5 md:p-2 rounded-[20px] md:rounded-[28px] border border-slate-200 flex-wrap justify-center shadow-inner shrink-0">
            <div className="flex gap-1 md:gap-2">
              {['PPA', 'LDO', 'LOA'].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setViewMode(mode)} 
                  className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {viewMode !== 'PPA' && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border-2 border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-black outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
              >
                {['2026', '2027', '2028', '2029'].map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            )}
            <div className="h-8 md:h-10 w-[1.5px] bg-slate-300 mx-1 md:mx-2 hidden sm:block"></div>
            <div className="flex gap-1 md:gap-2">
              <button onClick={() => setShowGlossary(!showGlossary)} className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${showGlossary ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-100 shadow-sm'}`} title="Legendas Estratégicas"><BookOpen size={18} className="md:w-5 md:h-5"/></button>
              <button 
                onClick={handleShare}
                disabled={isSharing}
                className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${isSharing ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-400 border-2 border-slate-100 shadow-sm hover:text-blue-600 hover:border-blue-200'}`}
                title="Compartilhar Link de Sincronização"
              >
                {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} className="md:w-5 md:h-5" />}
              </button>
              <button onClick={() => setIsAddingAxis(true)} className="p-2 md:p-3 bg-blue-600 text-white rounded-xl md:rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"><FolderPlus size={20} className="md:w-6 md:h-6" /></button>
            </div>
          </div>
        </div>

        {/* FEEDBACK DE COMPARTILHAMENTO */}
        {shareSuccess && (
          <div className="fixed bottom-10 right-10 z-[200] animate-slide-up">
            <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest">Link Copiado!</span>
                <span className="text-[10px] font-bold opacity-80">O link de sincronização está na sua área de transferência.</span>
              </div>
            </div>
          </div>
        )}

        {showGlossary && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            {[
              { 
                id: 'PPA', 
                label: 'Plano Plurianual', 
                text: 'O Plano Plurianual (PPA) é o principal instrumento de planejamento de médio prazo da administração pública, estabelecendo as diretrizes, objetivos e metas a serem seguidos pelo Governo Municipal ao longo de um período de quatro anos. Ele serve como um guia estratégico que organiza as ações governamentais em programas, garantindo a continuidade das políticas públicas além de um único mandato.\n\nSua vigência começa no segundo ano de um mandato e termina no primeiro ano do mandato seguinte, permitindo que a nova gestão avalie e conclua o planejamento anterior antes de iniciar seu próprio ciclo. No contexto deste painel, o PPA 2026-2029 detalha os eixos prioritários para a saúde e o desenvolvimento social, vinculando cada meta física a uma previsão de recursos financeiros.' 
              },
              { 
                id: 'LDO', 
                label: 'Lei de Diretrizes Orçamentárias', 
                text: 'A Lei de Diretrizes Orçamentárias (LDO) atua como um elo entre o planejamento estratégico do PPA e a execução prática do orçamento anual. Ela é elaborada anualmente para selecionar, dentre as prioridades listadas no PPA, quais serão as metas específicas para o próximo exercício financeiro, definindo as regras para a elaboração e execução do orçamento e as metas fiscais da prefeitura.\n\nAlém de orientar a elaboração da LOA, a LDO também trata de temas fundamentais como alterações na legislação tributária, políticas de fomento e despesas com pessoal. Neste painel, o modo LDO permite visualizar o detalhamento das metas físicas planejadas para um ano específico, servindo como base técnica para a fiscalização do Conselho Municipal de Saúde.' 
              },
              { 
                id: 'LOA', 
                label: 'Lei Orçamentária Anual', 
                text: 'A Lei Orçamentária Anual (LOA) é o instrumento que concretiza o planejamento público através da estimativa das receitas que o município espera arrecadar e da fixação das despesas que serão efetivamente realizadas. É na LOA que os recursos são alocados em dotações orçamentárias específicas para cada unidade gestora, permitindo a execução de serviços, obras e a manutenção da rede pública de saúde.\n\nNesta plataforma, a visualização da LOA foca na auditoria da execução orçamentária, permitindo o acompanhamento detalhado das fontes de recursos (municipais, estaduais e federais) e das naturezas de despesa (pessoal, investimentos, custeio). O monitoramento aqui realizado garante transparência sobre como cada centavo está sendo aplicado nas atividades finalísticas da saúde.' 
              }
            ].map(item => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-4">{item.id} — {item.label}</span>
                <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-line">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {showInfo && (
          <div className="space-y-4 animate-slide-down print:hidden mt-2 relative">
            <div className="bg-slate-900 p-6 rounded-[40px] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl"></div>
               <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                            <Trophy size={28} className="text-amber-400" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black uppercase tracking-widest text-white leading-none">Ranking por Fonte</h2>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Distribuição Proporcional de Recursos</p>
                         </div>
                       </div>
                       <div className="text-white font-black text-lg bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
                          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">{viewMode === 'PPA' ? 'Total Planejado (4 Anos)' : `Total Exercício ${selectedYear}`}</span>
                          R$ {totalGeralRanking.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                       {sourceRankings.map((item, idx) => (
                         <div key={item.source} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 hover:border-white/10 transition-all group">
                           <div className="flex items-center gap-3">
                             <div className={`w-2 h-8 rounded-full ${sourceStyles[item.source] || 'bg-slate-600'}`}></div>
                             <span className="text-[11px] font-black text-slate-300 uppercase">{item.source}</span>
                           </div>
                           <span className="text-amber-400 font-black text-sm tabular-nums group-hover:scale-105 transition-transform">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className={`transition-all duration-500 ease-in-out border-l border-white/10 pl-8 ${isLegendRecessed ? 'w-16 flex flex-col items-center' : 'w-full lg:w-[450px]'}`}>
                    <div className="flex items-center justify-between mb-6">
                      {!isLegendRecessed && (
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <HelpIcon size={20} className="text-blue-400" />
                          </div>
                          <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Glossário de Fontes</h3>
                        </div>
                      )}
                      <button 
                        onClick={() => setIsLegendRecessed(!isLegendRecessed)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                        title={isLegendRecessed ? "Expandir Glossário" : "Recuar Glossário"}
                      >
                        {isLegendRecessed ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                      </button>
                    </div>
                    {!isLegendRecessed ? (
                      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar-dark">
                        {FUNDING_SOURCES_DETAILED.map((desc, i) => {
                          const code = desc.split(' – ')[0];
                          const text = desc.split(' – ')[1];
                          return (
                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
                              <span className={`shrink-0 px-2 py-1 rounded-md text-[9px] font-black h-fit mt-0.5 ${sourceStyles[code] || 'bg-slate-500 text-white'}`}>
                                {code}
                              </span>
                              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase group-hover:text-slate-200">
                                {text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4 flex flex-col items-center pt-2">
                        {FUNDING_SOURCES_DETAILED.slice(0, 6).map((desc, i) => {
                           const code = desc.split(' – ')[0];
                           return <div key={i} className={`w-3 h-3 rounded-full ${sourceStyles[code] || 'bg-slate-500'}`} title={code}></div>
                        })}
                        <Sparkles size={16} className="text-blue-400/50" />
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-16 mt-12 px-4">
        {viewMode === 'LOA' && uncategorizedValue > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[32px] flex items-center gap-6 shadow-sm animate-pulse-slow">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <AlertTriangle size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-amber-900 uppercase tracking-tighter leading-none">Atenção Auditoria: Itens Ocultos</h3>
              <p className="text-amber-700 text-sm font-bold mt-2">
                Foram detectados <span className="underline">{loaGroups?.["DOTAÇÕES SEM CATEGORIA DEFINIDA"]?.length} itens</span> que possuem orçamento mas não estão vinculados a nenhum Eixo ou Atividade.
                Total não listado: <span className="font-black">R$ {uncategorizedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.
              </p>
            </div>
            <button 
              onClick={() => {
                const el = document.getElementById('activity-DOTAÇÕES SEM CATEGORIA DEFINIDA');
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md"
            >
              Auditar Itens
            </button>
          </div>
        )}

        {viewMode === 'PPA' ? (
          axisOrder.map((axis, index) => (
            <div key={axis} className="space-y-8">
              <div 
                draggable="true"
                onDragStart={() => handleAxisDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleAxisDrop(index)}
                className="bg-slate-50 py-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 shadow-sm -mx-4 group cursor-move"
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={24} className="text-slate-300 cursor-grab group-hover:text-blue-500 transition-colors"/>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{axis}</h2>
                  <button 
                    onClick={() => handleDeleteAxis(axis)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir este eixo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <button onClick={() => setIsAddingMeta(axis)} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">+ Nova Ação PPA</button>
              </div>
              <div className="space-y-6">
                {(indicators[axis] || [])
                  .filter((item: any) => item.origin === 'PPA' || !item.origin)
                  .map((item: any, idx) => (
                  <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode={viewMode} selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={handleDeleteItem} />
                ))}
              </div>
              <DynamicNotes sectionId={`ppa_axis_${axis}`} />
            </div>
          ))
        ) : viewMode === 'LDO' ? (
          axisOrder.map((axis, index) => (
            <div key={axis} className="space-y-8">
              <div 
                draggable="true"
                onDragStart={() => handleAxisDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleAxisDrop(index)}
                className="bg-slate-50 py-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 shadow-sm -mx-4 group cursor-move"
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={24} className="text-slate-300 cursor-grab group-hover:text-blue-500 transition-colors"/>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{axis}</h2>
                </div>
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-blue-200">LDO {selectedYear}</div>
                </div>
              </div>
              <div className="space-y-6">
                {(indicators[axis] || [])
                  .filter((item: any) => item.origin === 'PPA' || !item.origin)
                  .map((item: any, idx) => (
                  <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode="LDO" selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={handleDeleteItem} />
                ))}
              </div>
            </div>
          ))
        ) : (
          loaGroups && Object.entries(loaGroups).map(([activity, list]: [string, any]) => {
            const isUncategorized = activity === "DOTAÇÕES SEM CATEGORIA DEFINIDA";
            const isAxis = axisOrder.includes(activity);
            const summary = activitySummary[activity] || { total: 0, sources: {} };
            
            return (
              <div key={activity} id={`activity-${activity}`} className={`space-y-8 ${isUncategorized ? 'mt-24 pt-12 border-t-4 border-dashed border-amber-200' : ''}`}>
                <div className={`bg-slate-50 py-4 flex items-center justify-between border-l-[12px] ${isUncategorized ? 'border-amber-500' : (isAxis ? 'border-blue-600' : 'border-indigo-600')} pl-5 shadow-sm -mx-4`}>
                  <div className="flex items-center gap-4">
                    {isUncategorized ? <AlertTriangle size={24} className="text-amber-500" /> : <Layers size={24} className={isAxis ? 'text-blue-500' : 'text-indigo-500'} />}
                    <h2 className={`text-xl font-black ${isUncategorized ? 'text-amber-700' : 'text-slate-900'} uppercase tracking-tighter leading-none`}>{activity}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-5 py-2 ${isUncategorized ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'} rounded-2xl text-[11px] font-black uppercase tracking-widest border`}>{list.length} Registros</div>
                    {!isUncategorized && (
                      <button onClick={() => { setFormData({ yearlyFunding: { '2026': { entries: [] }, '2027': { entries: [] }, '2028': { entries: [] }, '2029': { entries: [] } }, goals: {}, detailedBudget: [], loaActivity: isAxis ? '' : activity }); setIsAddingMeta(activity); }} className={`px-4 py-2 ${isAxis ? 'bg-blue-600' : 'bg-indigo-600'} text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-opacity-80 transition-all`}>+ Nova Dotação {isAxis ? 'neste Eixo' : 'LOA'}</button>
                    )}
                  </div>
                </div>
                <div className={`bg-white p-10 rounded-[48px] border ${isUncategorized ? 'border-amber-200 bg-amber-50/20' : (isAxis ? 'border-blue-100' : 'border-indigo-100')} shadow-sm space-y-10`}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className={`p-8 rounded-[40px] flex items-center gap-8 shadow-2xl border-b-[12px] ${isUncategorized ? 'bg-slate-800 border-amber-500' : (isAxis ? 'bg-slate-900 border-blue-600' : 'bg-slate-900 border-indigo-600')}`}>
                      <div className={`w-20 h-20 ${isUncategorized ? 'bg-amber-500' : (isAxis ? 'bg-blue-600' : 'bg-indigo-600')} rounded-3xl flex items-center justify-center text-white shadow-lg`}>
                        {isUncategorized ? <SearchCode size={40} /> : <Sigma size={40} />}
                      </div>
                      <div>
                        <p className={`text-[11px] font-black ${isUncategorized ? 'text-amber-400' : (isAxis ? 'text-blue-400' : 'text-indigo-400')} uppercase tracking-[0.2em] mb-2`}>{isUncategorized ? 'Valor Pendente' : (isAxis ? 'Total do Eixo (LOA)' : 'Execução da Atividade (LOA)')}</p>
                        <h4 className="text-3xl font-black text-white tabular-nums">R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                      </div>
                    </div>
                    <div className="lg:col-span-2 bg-slate-100/50 p-8 rounded-[40px] border border-slate-200 flex flex-wrap gap-4 items-center">
                      {Object.entries(summary.sources).map(([source, val]) => (
                        <div key={source} className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>{source}</span>
                          <span className="text-base font-black text-slate-800 tabular-nums">R$ {(val as number).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-6 border-t pt-8">
                    <div className="relative flex-1">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                      <select className={`w-full pl-14 pr-6 py-5 ${isUncategorized ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-100'} border-2 rounded-3xl font-black text-slate-700 outline-none appearance-none cursor-pointer shadow-sm`} value={selectedTitleId[activity] || ""} onChange={(e) => setSelectedTitleId({...selectedTitleId, [activity]: e.target.value})}>
                        <option value="">Selecione para auditoria...</option>
                        <option value="ALL">Relatório Completo (Todos os itens deste grupo)</option>
                        {list.map((item: any) => <option key={item.id} value={item.id}>{item.action}</option>)}
                      </select>
                      <List className={`absolute right-6 top-1/2 -translate-y-1/2 ${isUncategorized ? 'text-amber-400' : 'text-indigo-300'}`} size={24} />
                    </div>
                  </div>
                  <div className="pt-8">
                    {selectedTitleId[activity] === "ALL" ? (
                      list.map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={handleDeleteItem} />)
                    ) : selectedTitleId[activity] ? (
                      list.filter((i: any) => i.id === selectedTitleId[activity]).map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={handleDeleteItem} />)
                    ) : (
                      <div className="py-32 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                           <div className={`absolute inset-0 ${isUncategorized ? 'bg-amber-500/10' : 'bg-indigo-500/10'} rounded-full animate-ping`}></div>
                           <BarChart3 size={64} className={`relative z-10 ${isUncategorized ? 'text-amber-200' : 'text-indigo-200'} mx-auto`}/>
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm italic">Filtre registros acima para detalhes da auditoria.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL ADICIONAR/EDITAR */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-7xl relative z-10 overflow-hidden flex flex-col max-h-[95vh] border-2 border-slate-200">
             <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-8">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-2xl"><Edit3 size={36}/></div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{(editingItem || viewMode === 'LOA') ? 'Edição Orçamentária' : 'Nova Ação Estratégica'}</h3>
                   <p className="text-blue-400 text-sm font-black uppercase tracking-[0.2em] mt-3">Sincronização de Metas e Recursos</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-4 hover:bg-white/10 rounded-full transition-colors"><X size={44}/></button>
             </div>
             <div className="p-12 overflow-y-auto bg-slate-50/50 flex-1 space-y-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase block mb-4 tracking-[0.2em]">Identificação da Ação / Objeto</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-6 bg-white border-2 border-slate-200 rounded-[28px] font-black focus:border-blue-500 outline-none shadow-sm" placeholder="Ex: Manutenção do Serviço de Pronto Socorro" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase block mb-4 tracking-[0.2em]">Vínculo Atividade (Finalística)</label>
                      <select value={formData.loaActivity || ""} onChange={(e) => setFormData({...formData, loaActivity: e.target.value})} className="w-full p-6 bg-white border-2 border-slate-200 rounded-[28px] font-black focus:border-blue-500 outline-none cursor-pointer shadow-sm appearance-none"><option value="">Vincular a Atividade Finalística...</option>{LOA_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-4 tracking-[0.2em]">Descrição Detalhada / Justificativa</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-8 bg-white border-2 border-slate-200 rounded-[40px] h-full min-h-[300px] shadow-sm focus:border-blue-500 outline-none resize-none font-bold text-lg leading-relaxed text-slate-700" placeholder="Descreva os objetivos financeiros e operacionais desta dotação..." />
                  </div>
                </div>

                {/* Grid de Planejamento Quadrienal (PPA) */}
                <div className="bg-white rounded-[48px] border-2 border-slate-200 shadow-xl p-10 space-y-8">
                  <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg"><CalendarDays size={28}/></div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Planejamento Quadrienal de Metas (PPA)</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {['2026', '2027', '2028', '2029'].map(year => {
                      const yearData = formData.yearlyFunding?.[year] || { entries: [] };
                      const entriesList = yearData.entries || [];
                      const totalYear = entriesList.reduce((acc: number, entry: any) => acc + parseCurrency(entry.value), 0);
                      const legacyTotal = parseCurrency(yearData['Total'] || 0);
                      
                      return (
                        <div key={year} className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 flex flex-col h-full">
                          <div className="text-center border-b border-slate-200 pb-2 mb-4">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Exercício {year}</span>
                          </div>
                          <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Meta Física Anual</label>
                            <input 
                              type="text" 
                              value={formData.goals?.[year] || ""} 
                              onChange={(e) => setFormData({...formData, goals: {...(formData.goals || {}), [year]: e.target.value}})}
                              className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-black text-slate-700 focus:border-blue-500 outline-none shadow-sm text-sm"
                              placeholder="Ex: 100%"
                            />
                          </div>

                          {/* Lista de Valores/Fontes Adicionados */}
                          <div className="space-y-3 mb-6 flex-1 min-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            <label className="text-[10px] font-black text-blue-600 uppercase block tracking-widest mb-1">Fontes Alocadas</label>
                            {entriesList.map((entry: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center group/entry">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-black text-emerald-600 tabular-nums">R$ {parseCurrency(entry.value).toLocaleString('pt-BR')}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate" title={entry.source}>{entry.source.split(' – ')[0]}</p>
                                </div>
                                <button onClick={() => removePpaEntry(year, idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/entry:opacity-100"><Trash2 size={14}/></button>
                              </div>
                            ))}
                            {entriesList.length === 0 && legacyTotal > 0 && (
                              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex justify-between items-center">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-black text-amber-700 tabular-nums">R$ {legacyTotal.toLocaleString('pt-BR')}</p>
                                  <p className="text-[9px] font-bold text-amber-600 uppercase">Fonte Geral (Legado)</p>
                                </div>
                              </div>
                            )}
                            {entriesList.length === 0 && legacyTotal === 0 && (
                              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-slate-300 uppercase text-center italic">Nenhuma fonte vinculada</p>
                              </div>
                            )}
                          </div>

                          {/* Adicionar Nova Entrada p/ este Ano */}
                          <div className="bg-blue-100/50 p-4 rounded-3xl border border-blue-200 space-y-3">
                            <input 
                              type="text" 
                              placeholder="Valor R$..."
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-black outline-none"
                              value={ppaTempEntries[year].value}
                              onChange={(e) => setPpaTempEntries({...ppaTempEntries, [year]: {...ppaTempEntries[year], value: e.target.value}})}
                            />
                            <select 
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-[10px] font-black uppercase outline-none"
                              value={ppaTempEntries[year].source}
                              onChange={(e) => setPpaTempEntries({...ppaTempEntries, [year]: {...ppaTempEntries[year], source: e.target.value}})}
                            >
                              <option value="">Fonte...</option>
                              {FUNDING_SOURCES_DETAILED.map(s => <option key={s} value={s}>{s.split(' – ')[0]}</option>)}
                            </select>
                            <button 
                              onClick={() => addPpaEntry(year)}
                              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <Plus size={14}/> Vincular Fonte
                            </button>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal {year}</p>
                             <p className="text-sm font-black text-slate-900 tabular-nums">R$ {(entriesList.length > 0 ? totalYear : legacyTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-[48px] border-2 border-slate-200 shadow-xl p-10 space-y-10">
                   <div className="flex items-center justify-between border-b-2 border-slate-100 pb-8"><div className="flex items-center gap-5"><div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg"><Wallet size={28}/></div><h4 className="text-xl font-black uppercase tracking-tighter">Dotação Orçamentária Detalhada (LOA)</h4></div></div>
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end bg-slate-100/50 p-8 rounded-[40px] border border-slate-200">
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Ano</label><select className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm" value={newBudgetEntry.year} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, year: e.target.value})}><option value="">Ano...</option>{['2026','2027','2028','2029'].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Natureza</label><select className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm" value={newBudgetEntry.nature} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, nature: e.target.value})}><option value="">Selecione...</option>{Object.entries(BUDGET_NATURES).map(([g, items]) => (<optgroup key={g} label={g} className="font-black text-slate-400">{items.map(i => <option key={i} value={i} className="text-slate-900">{i}</option>)}</optgroup>))}</select></div>
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Fonte</label><select className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm" value={newBudgetEntry.source} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, source: e.target.value})}><option value="">Selecione...</option>{FUNDING_SOURCES_DETAILED.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Valor (R$)</label><input type="text" className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-base font-black text-emerald-700 outline-none shadow-sm tabular-nums" placeholder="0,00" value={newBudgetEntry.value} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, value: e.target.value})} /></div>
                     <button onClick={addBudgetEntry} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95"><PlusSquare size={20} /> Adicionar</button>
                   </div>
                   <div className="overflow-hidden border-2 border-slate-100 rounded-[40px] shadow-sm"><table className="w-full text-left"><thead className="bg-slate-900 text-[11px] font-black text-blue-200 uppercase tracking-[0.2em]"><tr><th className="px-10 py-6">Ano</th><th className="px-10 py-6">Natureza</th><th className="px-10 py-6">Fonte de Recurso</th><th className="px-10 py-6 text-right">Valor Alocado</th><th className="px-10 py-6 text-center">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs font-bold font-mono">{(formData.detailedBudget || []).map((b: any, idx: number) => (<tr key={idx} className="hover:bg-slate-50/80 transition-colors"><td className="px-10 py-6 text-slate-800 font-black">{b.year || 'N/A'}</td><td className="px-10 py-6 text-blue-700 uppercase font-black font-sans">{b.nature}</td><td className="px-10 py-6 text-slate-500 max-w-sm truncate italic border-l border-slate-50">{b.source}</td><td className="px-10 py-6 text-right font-black text-slate-900 text-lg tabular-nums">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="px-10 py-6 text-center"><button onClick={() => { const u = [...formData.detailedBudget]; u.splice(idx, 1); setFormData({...formData, detailedBudget: u}); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button></td></tr>))}</tbody></table></div>
                </div>
                <div className="pt-16 border-t-2 border-slate-200 flex flex-col md:flex-row items-center gap-12">
                   <div className="w-full md:w-1/3 bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-2xl relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Lock size={14}/> Segurança</div><label className="text-[11px] font-black text-slate-400 uppercase block mb-5 tracking-[0.2em] text-center">Senha de Auditoria</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[32px] text-center font-black text-3xl outline-none focus:bg-white transition-all tracking-[0.3em]" placeholder="****" /></div>
                   <button onClick={handleSaveAction} className="flex-1 py-12 bg-slate-900 text-white rounded-[56px] font-black uppercase tracking-[0.4em] text-xl transition-all shadow-2xl hover:bg-black flex items-center justify-center gap-8 border-b-[12px] border-slate-800 hover:scale-[1.01] active:scale-95 group"><Save size={40} className="group-hover:rotate-12 transition-transform"/> Sincronizar Registro Orçamentário</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR EIXO */}
      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-md relative z-10 p-12 border-2 border-slate-100 animate-scale-in">
             <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"><FolderPlus size={40}/></div>
             <h3 className="font-black text-slate-900 uppercase text-2xl mb-10 tracking-tighter text-center leading-none">Novo Eixo Governamental</h3>
             <div className="space-y-8">
                <input placeholder="Título do Eixo Estratégico" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-6 border-2 border-slate-200 rounded-3xl font-black text-lg focus:border-blue-500 outline-none text-center shadow-sm" /><input type="password" placeholder="Senha Mestre Auditor" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-6 border-2 border-slate-200 rounded-3xl font-black text-xl text-center outline-none shadow-sm" /><button onClick={() => { if (adminPassword === 'Conselho@2026') { persist({ ...indicators, [axisName]: [] }, [...axisOrder, axisName]); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); } }} className="w-full py-8 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all border-b-[8px] border-slate-800 mt-6">Criar Eixo Estratégico</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .animate-slide-down { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .tabular-nums { font-variant-numeric: tabular-nums; }
        .animate-pulse-slow { animation: pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulseSlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.95; transform: scale(0.995); } }
      `}</style>
    </div>
  );
};

export default PPA;
