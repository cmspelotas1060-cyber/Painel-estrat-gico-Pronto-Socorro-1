
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, CirclePlus as PlusCircle,
  ChevronRight, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check, SquarePlus as PlusSquare, CircleAlert, ReceiptText,
  Search, LayoutList, Share2, Loader2, CheckCircle, Download, ClipboardList, Wallet,
  HelpCircle as HelpIcon, Scale, Landmark, ListChecks, ChevronFirst, ChevronLast, Trophy
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
    "3.1.9.0.03 - Pensões",
    "3.1.9.0.04 - Contratação por Tempo Determinado",
    "3.1.9.0.11 - Vencimentos e Vantagens Fixas - Pessoal Civil",
    "3.1.9.0.13 - Obrigações Patronais",
    "3.1.9.0.16 - Outras Despesas Variáveis Pessoal Civil",
    "3.1.9.0.46 - Auxílio-Alimentação",
    "3.1.9.0.67 - Depósitos Compulsórios",
    "3.1.9.0.91 - Sentenças Judiciais",
    "3.1.9.0.92 - Despesas de Exercícios Anteriores",
    "3.1.9.0.94 - Indenizações Trabalhistas",
    "3.1.9.0.96 - Ressarcimento Despesas de Pessoal Requisitado",
    "3.1.9.1.13 - Obrigações Patronais"
  ],
  "OUTRAS DESPESAS CORRENTES": [
    "3.3.5.0.41 - Contribuições",
    "3.3.5.0.43 - Subvenções Sociais",
    "3.3.9.0.01 - Aposentadorias",
    "3.3.9.0.03 - Pensões",
    "3.3.9.0.04 - Contratação por Tempo Determinado",
    "3.3.9.0.05 - Outros Benefícios Previdenciários",
    "3.3.9.0.08 - Outros Benefícios Assistenciais",
    "3.3.9.0.14 - Diárias Pessoal Civil",
    "3.3.9.0.18 - Auxílio Financeiro a Estudantes",
    "3.3.9.0.20 - Auxílio Financeiro a Pesquisadores",
    "3.3.9.0.30 - Material Consumível",
    "3.3.9.0.31 - Premiações Culturais, Artísticas, Científicas, Desportivas e Outras",
    "3.3.9.0.32 - Material de Distribuição Gratuita",
    "3.3.9.0.33 - Passagens e Despesas com Locomoção",
    "3.3.9.0.35 - Serviços de Consultoria",
    "3.3.9.0.36 - Outros Serviços de Terceiros - Pessoa Física",
    "3.3.9.0.37 - Locações de Mão-de-Obra",
    "3.3.9.0.38 - Arrendamento Mercantil",
    "3.3.9.0.39 - Outros Serviços de Terceiros - Pessoa Jurídica",
    "3.3.9.0.40 - Serviços de Tecnologia da Informação e Comunicação - PJ",
    "3.3.9.0.41 - Contribuições",
    "3.3.9.0.46 - Auxílio - Alimentação",
    "3.3.9.0.47 - Obrigações Tributárias e Contributivas",
    "3.3.9.0.48 - Outros Auxílios Financeiros a Pessoas Físicas",
    "3.3.9.0.49 - Auxílio -Transporte",
    "3.3.9.0.67 - Depósitos Compulsórios",
    "3.3.9.0.91 - Sentenças Judiciais",
    "3.3.9.0.92 - Despesas de Exercícios Anteriores",
    "3.3.9.0.93 - Indenizações e Restituições"
  ],
  "INVESTIMENTOS": [
    "4.4.20.93 - INDENIZAÇÕES E RESTITUIÇÕES - UNIÃO",
    "4.4.30.93 - INDENIZAÇÕES E RESTITUIÇÕES - ESTADO",
    "4.4.5.0.42 - Auxílios",
    "4.4.9.0.14 - Diárias - Civil",
    "4.4.9.0.30 - Material Consumível",
    "4.4.9.0.35 - Serviços de Consultoria",
    "4.4.9.0.36 - Outros Serviços de Terceiros - Pessoa Física",
    "4.4.9.0.39 - Outros Serviços de Terceiros - Pessoa Jurídica",
    "4.4.9.0.51 - Obras e Instalações",
    "4.4.9.0.52 - Equipamentos e Material Permanente",
    "4.4.9.0.61 - Aquisição de Imóveis",
    "4.4.9.0.91 - Sentenças Judiciais",
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

const parseCurrency = (val: any) => {
  if (!val) return 0;
  let s = val.toString().trim();
  s = s.replace(/\./g, '').replace(',', '.');
  return parseFloat(s) || 0;
};

const ActionCard = ({ item, groupKey, index, viewMode, selectedYear, defaultExpanded, onEdit, onDelete, onDragStart, onDragOver, onDrop }: any) => {
  const years = useMemo(() => {
    return viewMode === 'PPA' ? ['2026', '2027', '2028', '2029'] : [selectedYear];
  }, [viewMode, selectedYear]);

  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (defaultExpanded) {
      const newExpanded: Record<string, boolean> = {};
      years.forEach(y => { newExpanded[y] = true; });
      setExpandedYears(newExpanded);
    }
  }, [defaultExpanded, years]);

  const getAllUniqueSources = () => {
    const sources = new Set<string>();
    Object.values(item.yearlyFunding || {}).forEach((yearData: any) => {
      Object.keys(yearData).forEach(s => sources.add(s));
    });
    if (item.detailedBudget) {
      item.detailedBudget.forEach((b: any) => {
        const code = b.source.split(' – ')[0].split(' - ')[0].trim();
        sources.add(code);
      });
    }
    return Array.from(sources);
  };

  return (
    <div 
      draggable={viewMode !== 'LOA'}
      onDragStart={(e) => viewMode !== 'LOA' && onDragStart(e, groupKey, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, groupKey, index)}
      className="bg-white rounded-[32px] border border-slate-200 shadow-sm transition-all group flex flex-col relative overflow-hidden w-full mb-8"
    >
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-2 mb-1">
            {getAllUniqueSources().map(source => (
              <span key={source} className={`text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>
                {source}
              </span>
            ))}
          </div>
          <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter leading-tight">{item.action}</h4>
          <p className="text-base text-slate-500 italic font-semibold leading-relaxed">"{item.objective}"</p>
        </div>

        <div className="shrink-0 flex items-center gap-5 bg-slate-50 p-6 rounded-[28px] border border-slate-100 shadow-inner">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
            <Target size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Indicador Estratégico</p>
            <p className="text-lg font-black text-slate-800">{item.indicator || 'Não definido'}</p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden ml-4">
          <button onClick={() => onEdit(item)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"><Edit3 size={24}/></button>
          <button onClick={() => onDelete(item.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm bg-white"><Trash2 size={24}/></button>
        </div>
      </div>

      <div className="p-8 bg-slate-50/40">
        <div className={`grid gap-8 ${viewMode !== 'PPA' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {years.map(year => {
            const yearFunding = (item.yearlyFunding && item.yearlyFunding[year]) || {};
            let total = (Object.values(yearFunding) as any[]).reduce((acc: number, val: any) => acc + parseCurrency(val), 0) as number;
            const detailedTotal = (item.detailedBudget || []).reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
            if (total === 0) total = detailedTotal;

            const goal = (item.goals && item.goals[year]) || '-';
            const isExpanded = expandedYears[year];
            
            return (
              <div key={year} className="p-6 rounded-[32px] border bg-white border-slate-200 shadow-sm flex flex-col transition-all hover:border-blue-300 hover:shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black uppercase flex items-center gap-3 text-slate-900 tracking-tight">
                    <span className={`w-4 h-4 rounded-full ${total > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></span> 
                    EXERCÍCIO {year}
                  </span>
                  {(total > 0 || (item.detailedBudget && item.detailedBudget.length > 0)) && (
                    <button 
                      onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                      className={`text-xs font-black uppercase px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm ${isExpanded ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {isExpanded ? 'Recolher' : 'Detalhamento'}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Meta Física Planejada</p>
                    <div className="text-2xl font-black text-blue-600 tracking-tight">{goal}</div>
                  </div>
                  <div className="pt-5 border-t border-slate-100">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2.5"><Coins size={16} className="text-emerald-600"/> Planejamento Financeiro</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-emerald-600">R$</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-dashed border-slate-200 space-y-5 animate-fade-in">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-3">Detalhamento Técnico por Fonte</p>
                        {item.detailedBudget && item.detailedBudget.map((b: any, bidx: number) => (
                          <div key={bidx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                               <span className="text-xs font-black text-blue-700 uppercase leading-tight tracking-tight bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{b.nature}</span>
                               <span className="text-base font-black text-slate-900 whitespace-nowrap tabular-nums">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-xs text-slate-600 italic font-bold leading-relaxed pl-2 border-l-4 border-blue-200">
                              <span className="text-slate-400 font-black not-italic uppercase text-[10px] block mb-1">Fonte de Recurso:</span>
                              {b.source}
                            </div>
                          </div>
                        ))}
                        {Object.entries(yearFunding).map(([source, amount]: any) => (
                          <div key={source} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-sm ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>{source}</span>
                            <span className="text-base font-black text-slate-800 tabular-nums">R$ {parseCurrency(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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

const PPA = () => {
  const [viewMode, setViewMode] = useState('PPA');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [indicators, setIndicators] = useState<Record<string, any[]>>({});
  const [axisOrder, setAxisOrder] = useState<string[]>([]);
  const [isAddingMeta, setIsAddingMeta] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingAxis, setIsAddingAxis] = useState(false);
  const [selectedTitleId, setSelectedTitleId] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<any>({ 
    yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, 
    goals: {},
    detailedBudget: []
  });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');
  const [newBudgetEntry, setNewBudgetEntry] = useState({ nature: '', source: '', value: '' });

  // Controle de visibilidade das seções informativas
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    const savedOrder = localStorage.getItem('ps_ppa_axis_order');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setIndicators(parsed);
        if (savedOrder) {
          setAxisOrder(JSON.parse(savedOrder));
        } else {
          const keys = Object.keys(parsed);
          if (keys.length > 0) {
            setAxisOrder(keys);
            localStorage.setItem('ps_ppa_axis_order', JSON.stringify(keys));
          }
        }
      } catch (e) { console.error(e); }
    }

    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const persist = (data: any, order?: string[]) => {
    setIndicators(data);
    localStorage.setItem('ps_ppa_full_data_v2', JSON.stringify(data));
    if (order) {
      setAxisOrder(order);
      localStorage.setItem('ps_ppa_axis_order', JSON.stringify(order));
    } else {
      const keys = Object.keys(data);
      setAxisOrder(keys);
      localStorage.setItem('ps_ppa_axis_order', JSON.stringify(keys));
    }
  };

  // CÁLCULO DE RANKING POR FONTE
  const sourceRankings = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(indicators).flat().forEach((item: any) => {
      // Adiciona de yearlyFunding (que pode ter valores isolados)
      if (item.yearlyFunding) {
        Object.values(item.yearlyFunding).forEach((yearData: any) => {
          Object.entries(yearData).forEach(([source, val]: any) => {
            const amount = parseCurrency(val);
            if (amount > 0) totals[source] = (totals[source] || 0) + amount;
          });
        });
      }
      // Adiciona de detailedBudget (o detalhamento técnico)
      if (item.detailedBudget) {
        item.detailedBudget.forEach((b: any) => {
          const code = b.source.split(' – ')[0].split(' - ')[0].trim();
          const amount = parseCurrency(b.value);
          if (amount > 0) totals[code] = (totals[code] || 0) + amount;
        });
      }
    });

    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([source, total]) => ({ source, total }));
  }, [indicators]);

  const deleteAxis = (axis: string) => {
    if(!confirm(`Excluir o eixo "${axis}" e todas as suas ações?`)) return;
    const pwd = prompt("Senha Mestre:");
    if(pwd !== 'Conselho@2026') { alert("Senha incorreta"); return; }
    const newData = { ...indicators };
    delete newData[axis];
    const newOrder = axisOrder.filter(a => a !== axis);
    persist(newData, newOrder);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const fullDb = { 
        ps_ppa_full_data_v2: localStorage.getItem('ps_ppa_full_data_v2'),
        ps_ppa_axis_order: localStorage.getItem('ps_ppa_axis_order'),
        ps_monthly_detailed_stats: localStorage.getItem('ps_monthly_detailed_stats'),
        rdqa_full_indicators: localStorage.getItem('rdqa_full_indicators'),
        cms_conference_drive_link: localStorage.getItem('cms_conference_drive_link')
      };
      const payload = JSON.stringify({ full_db: fullDb, ts: Date.now() });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) { alert('Erro ao gerar link.'); } finally { setIsSharing(false); }
  };

  const handleSaveAction = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    const newData = { ...indicators };
    if (isAddingMeta) {
      newData[isAddingMeta] = [...(newData[isAddingMeta] || []), { ...formData, id: Date.now().toString(), status: 'Planejado' }];
    } else if (editingItem) {
      Object.keys(newData).forEach(axis => {
        newData[axis] = newData[axis].map(p => p.id === editingItem.id ? { ...p, ...formData } : p);
      });
    }
    persist(newData);
    setIsAddingMeta(null);
    setEditingItem(null);
    setAdminPassword("");
    setFormData({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {}, detailedBudget: [] });
  };

  const addBudgetEntry = () => {
    if (!newBudgetEntry.nature || !newBudgetEntry.source || !newBudgetEntry.value) {
      alert("Preencha todos os campos da dotação.");
      return;
    }
    const updated = [...(formData.detailedBudget || []), { ...newBudgetEntry }];
    setFormData({ ...formData, detailedBudget: updated });
    setNewBudgetEntry({ nature: '', source: '', value: '' });
  };

  const removeBudgetEntry = (idx: number) => {
    const updated = [...(formData.detailedBudget || [])];
    updated.splice(idx, 1);
    setFormData({ ...formData, detailedBudget: updated });
  };

  const loaGroups = useMemo(() => {
    if (viewMode !== 'LOA') return null;
    const groups: any = {};
    LOA_ACTIVITIES.forEach(act => { groups[act] = []; });
    (Object.values(indicators) as any[][]).forEach(list => {
      (list as any[]).forEach(action => {
        const act = action.loaActivity;
        if (act && groups[act]) {
          groups[act].push(action);
        }
      });
    });
    return groups;
  }, [indicators, viewMode]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-24 min-h-screen">
      {/* SEÇÃO CONGELADA (STICKY HEADER PRINCIPAL) */}
      <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-md pb-6 pt-4 -mx-4 px-4 border-b border-slate-200">
        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-200 flex flex-col gap-6 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl"><Layers size={32} /></div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  <EditableText id="ppa_main_title" defaultText={viewMode === 'PPA' ? 'PPA Estratégico 2026-2029' : `${viewMode} EXERCÍCIO ${selectedYear}`} />
                </h1>
                <p className="text-slate-500 text-sm mt-2 font-black uppercase tracking-[0.3em] opacity-80">
                   <EditableText id="ppa_subtitle" defaultText="Plano Plurianual e Lei Orçamentária" />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-[28px] border border-slate-200 flex-wrap shadow-inner">
              {['PPA', 'LDO', 'LOA'].map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${viewMode === mode ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-500 hover:text-slate-700'}`}>{mode}</button>
              ))}
              {viewMode !== 'PPA' && (
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-black outline-none shadow-sm cursor-pointer hover:border-blue-400 transition-colors">
                  {['2026', '2027', '2028', '2029'].map(yr => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              )}
              <div className="h-10 w-[1.5px] bg-slate-300 mx-2 hidden md:block"></div>
              <button 
                onClick={() => setShowInfo(!showInfo)} 
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 uppercase tracking-widest ${showInfo ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'}`}
              >
                 {showInfo ? <ChevronUp size={18} /> : <Info size={18} />}
                 <span>{showInfo ? 'Ocultar Guia' : 'Ver Guia Técnico'}</span>
              </button>
              <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all border-2 shadow-lg ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-900 text-white hover:bg-black'}`}>
                 {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
              </button>
              <button onClick={() => setIsAddingAxis(true)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"><FolderPlus size={24} /></button>
            </div>
          </div>
        </div>

        {/* ÁREA INFORMATIVA COLAPSÁVEL (CONGELADA JUNTO) */}
        {showInfo && (
          <div className="space-y-4 animate-slide-down print:hidden max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar mt-2">
            
            {/* RANKING DE VALORES POR FONTE */}
            <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl border-4 border-slate-800">
               <div className="flex items-center gap-3 mb-6">
                 <Trophy size={28} className="text-amber-400" />
                 <h2 className="text-lg font-black uppercase tracking-widest text-white">Ranking de Investimento por Fonte</h2>
               </div>
               {sourceRankings.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sourceRankings.map((item, idx) => (
                      <div key={item.source} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between group hover:border-amber-400 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-black text-xs">#{idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${sourceStyles[item.source] || 'bg-slate-600 text-white'}`}>{item.source}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 font-black text-sm block leading-none">R$ {item.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-10 text-center text-slate-500 italic font-bold">Nenhum valor financeiro registrado para gerar o ranking.</div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'PPA - O Plano', desc: 'Diretrizes Estratégicas para 4 anos de gestão (Longo Prazo).', icon: Landmark, color: 'blue' },
                { label: 'LDO - As Regras', desc: 'Metas anuais que orientam a elaboração do orçamento municipal.', icon: Scale, color: 'amber' },
                { label: 'LOA - O Caixa', desc: 'Detalhamento exato da aplicação dos recursos em cada serviço de saúde.', icon: BadgeDollarSign, color: 'emerald' }
              ].map((c, i) => (
                <div key={i} className="bg-white p-5 rounded-[28px] border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-400 transition-all">
                   <div className={`w-12 h-12 bg-${c.color}-100 text-${c.color}-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}><c.icon size={24} /></div>
                   <div>
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-0.5">{c.label}</h3>
                      <p className="text-xs text-slate-500 font-bold leading-tight">{c.desc}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                 <ListChecks size={20} className="text-blue-600" />
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">Legenda Oficial de Fontes de Recurso</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FUNDING_SOURCES_DETAILED.map((item, idx) => {
                    const [code] = item.split(' – ');
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <span className={`shrink-0 text-[10px] font-black px-3 py-1 rounded-lg shadow-sm min-w-[75px] text-center ${sourceStyles[code] || 'bg-slate-500 text-white'}`}>
                          {code}
                        </span>
                        <span className="text-[11px] text-slate-600 font-bold leading-snug">
                          {item.split(' – ')[1]}
                        </span>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTEÚDO PRINCIPAL COM SUB-HEADERS CONGELADOS TAMBÉM */}
      <div className="space-y-16 mt-12 px-4">
        {viewMode !== 'LOA' ? (
          axisOrder.length > 0 ? (
            axisOrder.map((axis) => (
              <div key={axis} className="space-y-8">
                {/* SUB-HEADER CONGELADO (EIXO) */}
                <div className="sticky top-[165px] md:top-[170px] z-40 bg-slate-50/95 backdrop-blur-sm py-4 flex items-center justify-between border-b-4 border-blue-600 shadow-xl -mx-4 px-6 transition-all rounded-b-3xl">
                  <div className="flex items-center gap-4">
                    <GripVertical size={24} className="text-slate-300 cursor-grab active:cursor-grabbing"/>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
                      <EditableText id={`ppa_axis_title_${axis.replace(/\s/g, '_')}`} defaultText={axis} />
                    </h2>
                    {editorMode && (
                      <button onClick={() => deleteAxis(axis)} className="p-2 text-slate-300 hover:text-red-500 transition-colors ml-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <button onClick={() => setIsAddingMeta(axis)} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 border-b-4 border-blue-800">+ Nova Ação Estratégica</button>
                </div>
                
                <div className="space-y-6">
                  {(indicators[axis] || []).map((item, idx) => (
                    <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode={viewMode} selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={(id: string) => { if(confirm("Excluir?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter((i: any) => i.id !== id)); persist(d); }}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />
                  ))}
                </div>
                <div className="px-2">
                  <DynamicNotes sectionId={`ppa_axis_${axis}`} />
                </div>
              </div>
            ))
          ) : (
             <div className="p-32 text-center bg-white rounded-[50px] border-4 border-dashed border-slate-200 shadow-inner">
               <Layers size={80} className="mx-auto text-slate-200 mb-8" />
               <h3 className="text-3xl font-black text-slate-400 uppercase tracking-tighter">Nenhum Eixo Estratégico</h3>
               <p className="text-slate-400 max-w-lg mx-auto mt-4 font-bold text-lg leading-relaxed">Inicie o planejamento criando seu primeiro eixo governamental no ícone de pasta do cabeçalho.</p>
             </div>
          )
        ) : (
          loaGroups ? (
            Object.entries(loaGroups).map(([activity, list]: any) => (
              <div key={activity} className="space-y-8">
                {/* SUB-HEADER CONGELADO (ATIVIDADE LOA) */}
                <div className="sticky top-[165px] md:top-[170px] z-40 bg-slate-50/95 backdrop-blur-sm py-4 flex items-center justify-between border-b-4 border-indigo-600 shadow-xl -mx-4 px-6 transition-all rounded-b-3xl">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase leading-none tracking-tighter flex items-center gap-4">
                    <span className="w-2.5 h-8 bg-indigo-600 rounded-full shadow-lg"></span>
                    {activity}
                  </h2>
                  <div className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-200">{list.length} Registros Orçamentários</div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-indigo-100 shadow-sm space-y-6">
                  <div className="flex gap-6">
                    <div className="flex-1 relative">
                       <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                       <select 
                         className="w-full pl-14 pr-6 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl text-base font-black text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                         value={selectedTitleId[activity] || ""}
                         onChange={(e) => setSelectedTitleId({...selectedTitleId, [activity]: e.target.value})}
                       >
                         <option value="">Clique para pesquisar ação...</option>
                         <option value="ALL">➔ EXIBIR TODOS OS ITENS DESTA ATIVIDADE</option>
                         {list.map((item: any) => <option key={item.id} value={item.id}>{item.action}</option>)}
                       </select>
                    </div>
                    <button 
                       onClick={() => setSelectedTitleId({...selectedTitleId, [activity]: selectedTitleId[activity] === "ALL" ? "" : "ALL"})}
                       className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border-2 transition-all hover:scale-105 shadow-md ${selectedTitleId[activity] === "ALL" ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                    >
                      {selectedTitleId[activity] === "ALL" ? <X size={20}/> : <LayoutList size={20}/>}
                      <span>{selectedTitleId[activity] === "ALL" ? "Recolher Vista" : "Abrir Lista Completa"}</span>
                    </button>
                  </div>
                  <div className="pt-6 border-t border-indigo-100">
                    {selectedTitleId[activity] === "ALL" ? (
                      list.map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={()=>{}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />)
                    ) : selectedTitleId[activity] ? (
                      list.filter((i: any) => i.id === selectedTitleId[activity]).map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={()=>{}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />)
                    ) : (
                      <div className="py-20 text-center text-slate-400 italic font-bold text-lg border-2 border-dashed border-indigo-100 rounded-3xl">Selecione uma ação estratégica ou clique em "Abrir Lista Completa" para visualizar os dados financeiros.</div>
                    )}
                  </div>
                </div>
                <div className="px-2">
                  <DynamicNotes sectionId={`loa_act_${activity}`} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-32 text-center bg-white rounded-[50px] border-4 border-dashed border-slate-200 shadow-inner">
               <ClipboardList size={80} className="mx-auto text-slate-200 mb-8" />
               <h3 className="text-3xl font-black text-slate-400 uppercase tracking-tighter">Nenhum Registro na LOA</h3>
               <p className="text-slate-400 max-w-lg mx-auto mt-4 font-bold text-lg leading-relaxed">Para ver os dados aqui, vincule suas ações às atividades oficiais da LOA no formulário de edição.</p>
             </div>
          )
        )}
      </div>

      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-6xl relative z-10 overflow-hidden flex flex-col max-h-[95vh] border-2 border-slate-200">
             <div className="bg-slate-900 p-10 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-blue-600 rounded-3xl shadow-lg"><Edit3 size={32}/></div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{editingItem ? 'Edição de Ação Estratégica' : 'Cadastrar Nova Ação Governamental'}</h3>
                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mt-3">Configuração de Planejamento e Dotação</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={40}/></button>
             </div>
             
             <div className="p-10 overflow-y-auto bg-slate-50/50 flex-1 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase block mb-3 tracking-widest">Nome da Ação Governamental</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-[24px] font-black text-lg shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Ampliação da Capacidade Resolutiva do PS" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase block mb-3 tracking-widest">Vincular Atividade Oficial (LOA)</label>
                      <select value={formData.loaActivity || ""} onChange={(e) => setFormData({...formData, loaActivity: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-[24px] font-black text-base shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                        <option value="">Selecione para exibição no painel LOA...</option>
                        {LOA_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase block mb-3 tracking-widest">Indicador Principal de Sucesso</label>
                      <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-[24px] font-black text-lg shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Percentual de metas atendidas (%)" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase block mb-3 tracking-widest">Objetivo Geral e Resultados Esperados</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-6 bg-white border-2 border-slate-200 rounded-[32px] h-full min-h-[250px] shadow-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none font-bold text-lg leading-relaxed text-slate-700" placeholder="Descreva os benefícios desta ação para a população..." />
                  </div>
                </div>

                <div className="bg-white rounded-[40px] border-2 border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-8 py-5 bg-slate-900 text-white flex items-center gap-4">
                     <Wallet size={24} className="text-blue-400"/>
                     <h4 className="text-sm font-black uppercase tracking-[0.2em]">Dotação Orçamentária e Origem do Recurso</h4>
                   </div>
                   <div className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-inner">
                        <div className="md:col-span-1">
                           <label className="text-[11px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Natureza da Despesa</label>
                           <select 
                             className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black uppercase"
                             value={newBudgetEntry.nature}
                             onChange={(e) => setNewBudgetEntry({...newBudgetEntry, nature: e.target.value})}
                           >
                             <option value="">Selecione...</option>
                             {Object.entries(BUDGET_NATURES).map(([group, items]) => (
                               <optgroup key={group} label={group}>
                                 {items.map(item => <option key={item} value={item}>{item}</option>)}
                               </optgroup>
                             ))}
                           </select>
                        </div>
                        <div className="md:col-span-1">
                           <label className="text-[11px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Fonte de Recurso</label>
                           <select 
                             className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black uppercase"
                             value={newBudgetEntry.source}
                             onChange={(e) => setNewBudgetEntry({...newBudgetEntry, source: e.target.value})}
                           >
                             <option value="">Selecione...</option>
                             {FUNDING_SOURCES_DETAILED.map(source => <option key={source} value={source}>{source}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-1">
                           <label className="text-[11px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Valor Planejado (R$)</label>
                           <input 
                             type="text" 
                             className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-black text-blue-700 shadow-sm outline-none focus:border-blue-500" 
                             placeholder="0,00"
                             value={newBudgetEntry.value}
                             onChange={(e) => setNewBudgetEntry({...newBudgetEntry, value: e.target.value})}
                           />
                        </div>
                        <button 
                          onClick={addBudgetEntry}
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 border-b-4 border-blue-800"
                        >
                          <Plus size={20} /> Adicionar Item
                        </button>
                      </div>

                      <div className="overflow-hidden border-2 border-slate-100 rounded-[32px] shadow-sm">
                         <table className="w-full text-left">
                            <thead className="bg-slate-900 text-[11px] font-black text-blue-200 uppercase tracking-[0.2em]">
                               <tr>
                                  <th className="px-8 py-5">Natureza</th>
                                  <th className="px-8 py-5">Fonte de Recurso</th>
                                  <th className="px-8 py-5 text-right">Valor Financeiro</th>
                                  <th className="px-8 py-5 text-center">Gestão</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                               {(formData.detailedBudget || []).map((b: any, idx: number) => (
                                 <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5 text-blue-600 uppercase font-black">{b.nature}</td>
                                    <td className="px-8 py-5 text-slate-500 max-w-sm truncate italic">{b.source}</td>
                                    <td className="px-8 py-5 text-right font-black text-slate-900 text-base">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-8 py-5 text-center">
                                       <button onClick={() => removeBudgetEntry(idx)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100"><Trash2 size={18}/></button>
                                    </td>
                                 </tr>
                               ))}
                               {(formData.detailedBudget || []).length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic font-bold text-lg">Ainda não há detalhamento orçamentário para esta ação.</td>
                                 </tr>
                               )}
                            </tbody>
                            {(formData.detailedBudget || []).length > 0 && (
                              <tfoot className="bg-slate-900 border-t-2 border-blue-900 font-black text-white">
                                 <tr>
                                    <td colSpan={2} className="px-8 py-6 text-right uppercase tracking-[0.2em] text-xs text-blue-400">Total Consolidado da Ação:</td>
                                    <td className="px-8 py-6 text-right text-2xl tracking-tighter">
                                      R$ {(formData.detailedBudget || []).reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                 </tr>
                              </tfoot>
                            )}
                         </table>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {['2026', '2027', '2028', '2029'].map(year => (
                    <div key={year} className="bg-white p-8 rounded-[35px] border-2 border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-40 transition-all group-hover:scale-110"></div>
                      <p className="font-black mb-6 text-center text-blue-600 text-2xl tracking-widest">{year}</p>
                      <div className="space-y-6">
                        <div>
                          <label className="text-[11px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Meta Física</label>
                          <input placeholder="Ex: 500 Unid." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Ajuste Financeiro</label>
                          <div className="space-y-3">
                             {Object.entries(formData.yearlyFunding?.[year] || {}).map(([s, a]: any) => (
                              <div key={s} className="flex gap-3 items-center bg-blue-50 p-3 rounded-2xl border border-blue-100 animate-fade-in shadow-sm">
                                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg shadow-sm">{s}</span>
                                <input className="w-full bg-transparent text-sm font-black text-blue-900 outline-none" value={a} onChange={(e) => { const upd = {...formData.yearlyFunding}; upd[year][s] = e.target.value; setFormData({...formData, yearlyFunding: upd}); }} />
                                <button onClick={() => { const upd = {...formData.yearlyFunding}; delete upd[year][s]; setFormData({...formData, yearlyFunding: upd}); }} className="text-blue-300 hover:text-red-500 transition-colors"><X size={20}/></button>
                              </div>
                            ))}
                            <select className="w-full text-xs border-2 border-dashed border-slate-200 bg-white p-3 rounded-2xl font-black text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer outline-none uppercase tracking-widest" onChange={(e) => { if(e.target.value) { const upd = {...formData.yearlyFunding}; upd[year][e.target.value] = ""; setFormData({...formData, yearlyFunding: upd}); e.target.value = ""; } }}>
                              <option value="">+ Fonte</option>
                              {Object.keys(sourceStyles).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-12 border-t-2 border-slate-200 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-full md:w-1/3 bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-xl">
                    <label className="text-xs font-black text-slate-400 uppercase block mb-4 tracking-[0.2em] flex items-center gap-3 justify-center"><Lock size={16} className="text-blue-500"/> Autorização Conselho</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[28px] text-center font-black text-2xl shadow-inner focus:border-blue-500 focus:bg-white outline-none transition-all tracking-[0.3em]" placeholder="****" />
                    {error && <p className="text-red-500 text-xs font-black mt-4 uppercase text-center animate-pulse flex items-center justify-center gap-2"><CircleAlert size={16}/> {error}</p>}
                  </div>
                  <button onClick={handleSaveAction} className="flex-1 py-10 bg-slate-900 text-white rounded-[45px] font-black uppercase tracking-[0.3em] text-lg transition-all shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-6 border-b-8 border-slate-700">
                     <Save size={36}/> Sincronizar ao Mapa Estratégico
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-md relative z-10 p-10 border-2 border-slate-100 animate-scale-in">
             <h3 className="font-black text-slate-900 uppercase text-2xl mb-8 tracking-tighter text-center leading-none">Novo Eixo Governamental</h3>
             <div className="space-y-6">
               <input placeholder="Título do Eixo (Ex: Qualificação do SUS)" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-5 border-2 border-slate-200 rounded-3xl font-black text-lg shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
               <input type="password" placeholder="Senha Mestre" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 border-2 border-slate-200 rounded-3xl font-black text-xl text-center shadow-inner focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all tracking-[0.2em]" />
               <button onClick={() => { if(adminPassword === 'Conselho@2026') { persist({...indicators, [axisName]: []}, [...axisOrder, axisName]); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); } }} className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 border-b-4 border-slate-700 mt-4">Criar Eixo Estratégico</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .animate-slide-down {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PPA;
