
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, CirclePlus as PlusCircle,
  ChevronRight, ChevronLeft, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check, SquarePlus as PlusSquare, CircleAlert, ReceiptText,
  Search, LayoutList, Share2, Loader2, CheckCircle, Download, ClipboardList, Wallet,
  HelpCircle as HelpIcon, Scale, Landmark, ListChecks, ChevronFirst, ChevronLast, Trophy,
  Activity, BarChart3, CreditCard, Sparkles, Filter, List
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
    "3.3.9.0.35 - Serviços de Consultoria", "3.3.9.0.36 - Outros Serviços de Terceiros - Pessoa Física",
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
  if (!val) return 0;
  let s = val.toString().trim().replace(/\./g, '').replace(',', '.');
  return parseFloat(s) || 0;
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
    const yearFunding = (item.yearlyFunding && item.yearlyFunding[selectedYear]) || {};
    
    Object.entries(yearFunding).forEach(([s, v]) => {
      const amount = parseCurrency(v);
      if (amount > 0) summary[s] = (summary[s] || 0) + amount;
    });

    if (item.detailedBudget) {
      item.detailedBudget.forEach((b: any) => {
        const code = b.source.split(' – ')[0].split(' - ')[0].trim();
        const amount = parseCurrency(b.value);
        if (amount > 0) summary[code] = (summary[code] || 0) + amount;
      });
    }
    return summary;
  }, [item, selectedYear]);

  const totalAction = (Object.values(sourceData) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className={`bg-white rounded-[32px] border ${viewMode === 'LOA' ? 'border-indigo-100' : 'border-slate-200'} shadow-sm transition-all flex flex-col relative overflow-hidden w-full mb-8`}>
      <div className={`p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center relative ${viewMode === 'LOA' ? 'bg-slate-50/50' : ''}`}>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2 mb-1">
            {Object.keys(sourceData).map(source => (
              <span key={source} className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>{source}</span>
            ))}
          </div>
          <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter leading-tight">{item.action}</h4>
          <p className="text-base text-slate-500 italic font-semibold leading-relaxed">"{item.objective}"</p>
          
          {viewMode === 'LOA' && totalAction > 0 && (
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
            const yearFunding = (item.yearlyFunding && item.yearlyFunding[year]) || {};
            let total = (Object.values(yearFunding) as any[]).reduce((acc: number, val: any) => acc + parseCurrency(val), 0);
            const detailedTotal = (item.detailedBudget || []).reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
            if (total === 0) total = detailedTotal;
            const goal = (item.goals && item.goals[year]) || '-';
            const isExpanded = expandedYears[year];
            
            return (
              <div key={year} className={`p-6 rounded-[32px] border bg-white border-slate-200 shadow-sm flex flex-col transition-all hover:border-blue-300 ${viewMode === 'LOA' ? 'bg-slate-50/20' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black uppercase flex items-center gap-3 text-slate-900 tracking-tight">
                    <span className={`w-4 h-4 rounded-full ${total > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></span> EXERCÍCIO {year}
                  </span>
                  {(total > 0 || (item.detailedBudget && item.detailedBudget.length > 0)) && (
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
                      <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Dotação Orçamentária Detalhada</h5>
                      <ReceiptText size={18} className="text-slate-300"/>
                    </div>
                    {item.detailedBudget && item.detailedBudget.map((b: any, bidx: number) => (
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
                          <span className="text-xl font-black text-slate-900 tabular-nums">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
  const [formData, setFormData] = useState<any>({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}, detailedBudget: [] });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [newBudgetEntry, setNewBudgetEntry] = useState({ nature: '', source: '', value: '' });
  const [showInfo, setShowInfo] = useState(true);
  const [showGlossary, setShowGlossary] = useState(false);
  const [isLegendRecessed, setIsLegendRecessed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    const savedOrder = localStorage.getItem('ps_ppa_axis_order');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setIndicators(parsed);
        if (savedOrder) setAxisOrder(JSON.parse(savedOrder));
        else {
          const keys = Object.keys(parsed);
          setAxisOrder(keys);
          localStorage.setItem('ps_ppa_axis_order', JSON.stringify(keys));
        }
      } catch (e) { console.error(e); }
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

  const sourceRankings = useMemo(() => {
    const totals: Record<string, number> = {};
    const items = Object.values(indicators).flat();
    const yearsToSum = viewMode === 'PPA' ? ['2026', '2027', '2028', '2029'] : [selectedYear];

    items.forEach((item: any) => {
      yearsToSum.forEach(yr => {
        const yearData = (item.yearlyFunding && item.yearlyFunding[yr]) || {};
        Object.entries(yearData).forEach(([source, val]) => {
          const amount = parseCurrency(val);
          if (amount > 0) totals[source] = ((totals[source] as number) || 0) + amount;
        });

        if (item.detailedBudget) {
          item.detailedBudget.forEach((b: any) => {
            const code = b.source.split(' – ')[0].split(' - ')[0].trim();
            const amount = parseCurrency(b.value);
            if (amount > 0) totals[code] = ((totals[code] as number) || 0) + amount;
          });
        }
      });
    });

    return Object.entries(totals).sort(([, a], [, b]) => (b as number) - (a as number)).map(([source, total]) => ({ source, total: total as number }));
  }, [indicators, viewMode, selectedYear]);

  const totalGeralRanking = useMemo(() => (sourceRankings as { total: number }[]).reduce((acc: number, curr: { total: number }) => acc + curr.total, 0), [sourceRankings]);

  const handleSaveAction = (...args: any[]) => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }
    const newData = { ...indicators };
    if (isAddingMeta) {
      newData[isAddingMeta] = [...(newData[isAddingMeta] || []), { ...formData, id: Date.now().toString(), status: 'Planejado' }];
    } else if (editingItem) {
      Object.keys(newData).forEach(axis => {
        newData[axis] = newData[axis].map(p => p.id === editingItem.id ? { ...p, ...formData } : p);
      });
    }
    persist(newData);
    setIsAddingMeta(null); setEditingItem(null); setAdminPassword("");
    setFormData({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}, detailedBudget: [] });
  };

  const addBudgetEntry = () => {
    if (!newBudgetEntry.nature || !newBudgetEntry.source || !newBudgetEntry.value) {
      alert("Preencha todos os campos da dotação."); return;
    }
    setFormData({ ...formData, detailedBudget: [...(formData.detailedBudget || []), { ...newBudgetEntry }] });
    setNewBudgetEntry({ nature: '', source: '', value: '' });
  };

  const loaGroups = useMemo(() => {
    if (viewMode !== 'LOA') return null;
    const groups: any = {};
    LOA_ACTIVITIES.forEach(act => { groups[act] = []; });
    Object.values(indicators).flat().forEach((action: any) => {
      if (action.loaActivity && groups[action.loaActivity]) groups[action.loaActivity].push(action);
    });
    return groups;
  }, [indicators, viewMode]);

  const activitySummary = useMemo(() => {
    const summary: Record<string, { total: number, sources: Record<string, number> }> = {};
    if (!loaGroups) return summary;
    Object.entries(loaGroups).forEach(([activity, actions]: any) => {
      let actTotal = 0; const actSources: Record<string, number> = {};
      actions.forEach((item: any) => {
        const yearFunding = item.yearlyFunding?.[selectedYear] || {};
        let itemTotal = (Object.values(yearFunding) as any[]).reduce((acc: number, val: any) => acc + parseCurrency(val), 0);
        const detailedTotal = (item.detailedBudget || []).reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
        if (itemTotal === 0) itemTotal = (detailedTotal as number);
        Object.entries(yearFunding).forEach(([source, amount]: any) => {
           actSources[source] = ((actSources[source] as number) || 0) + parseCurrency(amount);
        });
        (item.detailedBudget || []).forEach((b: any) => {
           const code = b.source.split(' – ')[0].split(' - ')[0].trim();
           actSources[code] = ((actSources[code] as number) || 0) + parseCurrency(b.value);
        });
        actTotal += (itemTotal as number);
      });
      summary[activity] = { total: actTotal, sources: actSources };
    });
    return summary;
  }, [loaGroups, selectedYear]);

  const handleShare = async (...args: any[]) => {
    setIsSharing(true);
    try {
      const fullDb = { 
        ps_ppa_full_data_v2: localStorage.getItem('ps_ppa_full_data_v2'),
        ps_ppa_axis_order: localStorage.getItem('ps_ppa_axis_order')
      };
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?share=gz_${base64}`);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) { alert('Erro ao gerar link.'); } finally { setIsSharing(false); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-24 min-h-screen">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-md pb-6 pt-4 -mx-4 px-4 border-b border-slate-200">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
          <div className="flex items-center gap-6 relative">
            <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
               <Layers size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {viewMode === 'PPA' ? 'PPA Estratégico 2026-2029' : `${viewMode} EXERCÍCIO ${selectedYear}`}
              </h1>
              <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
                 <CalendarDays size={16} className="text-blue-500"/>
                 Planejamento e Gestão Orçamentária
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-[28px] border border-slate-200 flex-wrap shadow-inner shrink-0">
            {['PPA', 'LDO', 'LOA'].map(mode => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode)} 
                className={`px-8 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {mode}
              </button>
            ))}
            {viewMode !== 'PPA' && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-black outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
              >
                {['2026', '2027', '2028', '2029'].map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            )}
            <div className="h-10 w-[1.5px] bg-slate-300 mx-2 hidden md:block"></div>
            <button onClick={() => setShowGlossary(!showGlossary)} className={`p-3 rounded-2xl transition-all ${showGlossary ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-100 shadow-sm'}`} title="Legendas Estratégicas"><BookOpen size={20}/></button>
            <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border-2 shadow-lg ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-900 text-white hover:bg-black'}`}>
               {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            </button>
            <button onClick={() => setIsAddingAxis(true)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"><FolderPlus size={24} /></button>
          </div>
        </div>

        {/* GLOSSARIO PPA/LDO/LOA */}
        {showGlossary && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            {[
              { id: 'PPA', label: 'Plano Plurianual', text: 'Define diretrizes, objetivos e metas da administração pública para um período de 4 anos.' },
              { id: 'LDO', label: 'Lei de Diretrizes Orçamentárias', text: 'Orienta a elaboração dos orçamentos fiscais, seguridade social e de investimentos para o ano seguinte.' },
              { id: 'LOA', label: 'Lei Orçamentária Anual', text: 'Estima as receitas e fixa as despesas do governo para o exercício financeiro corrente.' }
            ].map(item => (
              <div key={item.id} className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">{item.id} — {item.label}</span>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* RANKING PANEL & LEGENDA DE FONTES REESTILIZADA */}
        {showInfo && (
          <div className="space-y-4 animate-slide-down print:hidden mt-2 relative">
            <div className="bg-slate-900 p-6 rounded-[40px] shadow-2xl border-4 border-slate-800 overflow-hidden relative">
               
               {/* Decoração de fundo moderna */}
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
                          <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">Acumulado Geral</span>
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

                  {/* NOVO DESIGN DA LEGENDA DE FONTES COM SISTEMA DE RECUO */}
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

      {/* CONTEUDO PRINCIPAL */}
      <div className="space-y-16 mt-12 px-4">
        {viewMode === 'PPA' ? (
          axisOrder.map((axis) => (
            <div key={axis} className="space-y-8">
              <div className="sticky top-[165px] md:top-[170px] z-40 bg-slate-50/95 backdrop-blur-md py-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 shadow-sm -mx-4">
                <div className="flex items-center gap-4">
                  <GripVertical size={24} className="text-slate-300 cursor-grab"/>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">{axis}</h2>
                </div>
                <button onClick={() => setIsAddingMeta(axis)} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">+ Nova Ação</button>
              </div>
              <div className="space-y-6">
                {(indicators[axis] || []).map((item, idx) => (
                  <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode={viewMode} selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={(id: string) => { if(confirm("Excluir?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter((i: any) => i.id !== id)); persist(d); }}} />
                ))}
              </div>
              <DynamicNotes sectionId={`ppa_axis_${axis}`} />
            </div>
          ))
        ) : viewMode === 'LDO' ? (
          axisOrder.map((axis) => (
            <div key={axis} className="space-y-8">
              <div className="sticky top-[165px] md:top-[170px] z-40 bg-slate-50/95 backdrop-blur-md py-4 flex items-center justify-between border-l-[12px] border-blue-600 pl-5 shadow-sm -mx-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{axis}</h2>
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-blue-200">Exercício {selectedYear}</div>
                </div>
              </div>
              <div className="space-y-6">
                {(indicators[axis] || []).map((item, idx) => (
                  <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode="LDO" selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={(id: string) => { if(confirm("Excluir?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter((i: any) => i.id !== id)); persist(d); }}} />
                ))}
              </div>
            </div>
          ))
        ) : (
          loaGroups && Object.entries(loaGroups).map(([activity, list]: any) => {
            const summary = activitySummary[activity] || { total: 0, sources: {} };
            return (
              <div key={activity} className="space-y-8">
                <div className="sticky top-[165px] md:top-[170px] z-40 bg-slate-50/95 backdrop-blur-md py-4 flex items-center justify-between border-l-[12px] border-indigo-600 pl-5 shadow-sm -mx-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activity}</h2>
                  <div className="flex items-center gap-3">
                    <div className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-200">{list.length} Registros</div>
                    <button onClick={() => { setFormData({ ...formData, loaActivity: activity }); setIsAddingMeta(activity); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">+ Nova Dotação</button>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[48px] border border-indigo-100 shadow-sm space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[40px] flex items-center gap-8 shadow-2xl border-b-[12px] border-indigo-600">
                      <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg"><Sigma size={40} /></div>
                      <div>
                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Custo Executivo da Atividade</p>
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
                      <select className="w-full pl-14 pr-6 py-5 bg-indigo-50 border-2 border-indigo-100 rounded-3xl font-black text-slate-700 outline-none appearance-none cursor-pointer shadow-sm" value={selectedTitleId[activity] || ""} onChange={(e) => setSelectedTitleId({...selectedTitleId, [activity]: e.target.value})}>
                        <option value="">Selecione uma dotação para auditoria...</option>
                        <option value="ALL">Visualizar Todas (Relatório Completo)</option>
                        {list.map((item: any) => <option key={item.id} value={item.id}>{item.action}</option>)}
                      </select>
                      <List className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-300" size={24} />
                    </div>
                  </div>
                  <div className="pt-8">
                    {selectedTitleId[activity] === "ALL" ? (
                      list.map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} />)
                    ) : selectedTitleId[activity] ? (
                      list.filter((i: any) => i.id === selectedTitleId[activity]).map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} />)
                    ) : (
                      <div className="py-32 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                           <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
                           <BarChart3 size={64} className="relative z-10 text-indigo-200 mx-auto"/>
                        </div>
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm italic">Selecione uma dotação acima para carregar os detalhes fiscais.</p>
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
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-6xl relative z-10 overflow-hidden flex flex-col max-h-[95vh] border-2 border-slate-200">
             <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-8">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-2xl"><Edit3 size={36}/></div>
                 <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{editingItem ? 'Edição Orçamentária' : 'Nova Dotação LOA'}</h3>
                   <p className="text-blue-400 text-sm font-black uppercase tracking-[0.2em] mt-3">Execução e Alocação de Recursos</p>
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
                      <label className="text-[11px] font-black text-slate-400 uppercase block mb-4 tracking-[0.2em]">Vínculo Atividade (LOA)</label>
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
                  <div className="flex items-center gap-5 border-b-2 border-slate-100 pb-6">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg"><CalendarDays size={28}/></div>
                    <h4 className="text-xl font-black uppercase tracking-tighter">Planejamento de Metas e Valores (2026-2029)</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {['2026', '2027', '2028', '2029'].map(year => (
                      <div key={year} className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 space-y-4">
                        <div className="text-center border-b border-slate-200 pb-2 mb-2">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Exercício {year}</span>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Meta Física</label>
                          <input 
                            type="text" 
                            value={formData.goals?.[year] || ""} 
                            onChange={(e) => setFormData({...formData, goals: {...(formData.goals || {}), [year]: e.target.value}})}
                            className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-black text-slate-700 focus:border-blue-500 outline-none"
                            placeholder="Ex: 100%"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Investimento (R$)</label>
                          <input 
                            type="text" 
                            value={formData.yearlyFunding?.[year]?.['Total'] || ""} 
                            onChange={(e) => setFormData({
                              ...formData, 
                              yearlyFunding: {
                                ...(formData.yearlyFunding || {}), 
                                [year]: { ...(formData.yearlyFunding?.[year] || {}), 'Total': e.target.value }
                              }
                            })}
                            className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-black text-emerald-700 focus:border-emerald-500 outline-none tabular-nums"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[48px] border-2 border-slate-200 shadow-xl p-10 space-y-10">
                   <div className="flex items-center justify-between border-b-2 border-slate-100 pb-8"><div className="flex items-center gap-5"><div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg"><Wallet size={28}/></div><h4 className="text-xl font-black uppercase tracking-tighter">Dotação Orçamentária Detalhada</h4></div></div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end bg-slate-100/50 p-8 rounded-[40px] border border-slate-200">
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Natureza</label><select className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm" value={newBudgetEntry.nature} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, nature: e.target.value})}><option value="">Selecione...</option>{Object.entries(BUDGET_NATURES).map(([g, items]) => (<optgroup key={g} label={g} className="font-black text-slate-400">{items.map(i => <option key={i} value={i} className="text-slate-900">{i}</option>)}</optgroup>))}</select></div>
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Fonte</label><select className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black uppercase shadow-sm" value={newBudgetEntry.source} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, source: e.target.value})}><option value="">Selecione...</option>{FUNDING_SOURCES_DETAILED.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                     <div className="md:col-span-1"><label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Valor (R$)</label><input type="text" className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl text-base font-black text-emerald-700 outline-none shadow-sm tabular-nums" placeholder="0,00" value={newBudgetEntry.value} onChange={(e) => setNewBudgetEntry({...newBudgetEntry, value: e.target.value})} /></div>
                     <button onClick={addBudgetEntry} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 shadow-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95"><PlusSquare size={20} /> Adicionar Linha</button>
                   </div>
                   <div className="overflow-hidden border-2 border-slate-100 rounded-[40px] shadow-sm"><table className="w-full text-left"><thead className="bg-slate-900 text-[11px] font-black text-blue-200 uppercase tracking-[0.2em]"><tr><th className="px-10 py-6">Natureza</th><th className="px-10 py-6">Fonte de Recurso</th><th className="px-10 py-6 text-right">Valor Alocado</th><th className="px-10 py-6 text-center">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs font-bold font-mono">{(formData.detailedBudget || []).map((b: any, idx: number) => (<tr key={idx} className="hover:bg-slate-50/80 transition-colors"><td className="px-10 py-6 text-blue-700 uppercase font-black font-sans">{b.nature}</td><td className="px-10 py-6 text-slate-500 max-w-sm truncate italic border-l border-slate-50">{b.source}</td><td className="px-10 py-6 text-right font-black text-slate-900 text-lg tabular-nums">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td className="px-10 py-6 text-center"><button onClick={() => { const u = [...formData.detailedBudget]; u.splice(idx, 1); setFormData({...formData, detailedBudget: u}); }} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button></td></tr>))}</tbody></table></div>
                </div>
                <div className="pt-16 border-t-2 border-slate-200 flex flex-col md:flex-row items-center gap-12">
                   <div className="w-full md:w-1/3 bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-2xl relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Lock size={14}/> Segurança</div><label className="text-[11px] font-black text-slate-400 uppercase block mb-5 tracking-[0.2em] text-center">Senha de Auditoria</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-[32px] text-center font-black text-3xl outline-none focus:bg-white transition-all tracking-[0.3em]" placeholder="****" /></div>
                   <button onClick={handleSaveAction} className="flex-1 py-12 bg-slate-900 text-white rounded-[56px] font-black uppercase tracking-[0.4em] text-xl transition-all shadow-2xl hover:bg-black flex items-center justify-center gap-8 border-b-[12px] border-slate-800 hover:scale-[1.01] active:scale-95 group"><Save size={40} className="group-hover:rotate-12 transition-transform"/> Salvar Dotação Orçamentária</button>
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
      `}</style>
    </div>
  );
};

export default PPA;
