
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, CirclePlus as PlusCircle,
  ChevronRight, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check, SquarePlus as PlusSquare, CircleAlert, ReceiptText,
  Search, LayoutList, Share2, Loader2, CheckCircle, Download, ClipboardList, Wallet
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
  "1600 – Recursos de custeio repassados pelo Fundo Nacional de Saúde ao Fundo Municipal de Saúde.",
  "1605 – Recursos referentes ao complemento do piso da enfermagem.",
  "1604 – Recursos referente ao repasse dos Agentes de Combates a Endemias e Agentes Comunitários de Saúde.",
  "1621 – Recursos repassados para custeio pelo Fundo Estadual de Saúde ao Fundo Municipal de Saúde.",
  "1500.1002 – Recursos municipais / aplicação mínima de 15% em ações de saúde.",
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
  '1601': 'bg-cyan-600 text-white'
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
    // Add sources from detailed budget
    if (item.detailedBudget) {
      item.detailedBudget.forEach((b: any) => {
        const code = b.source.split(' – ')[0];
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
      className="bg-white rounded-3xl border border-slate-200 shadow-sm transition-all group flex flex-col relative overflow-hidden w-full mb-6"
    >
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center relative">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {getAllUniqueSources().map(source => (
              <span key={source} className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>
                {source}
              </span>
            ))}
          </div>
          <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{item.action}</h4>
          <p className="text-xs text-slate-500 italic">"{item.objective}"</p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Indicador</p>
            <p className="text-sm font-bold text-slate-800">{item.indicator || 'Não definido'}</p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button>
          <button onClick={() => onDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
        </div>
      </div>

      <div className="p-4 bg-slate-50/30">
        <div className={`grid gap-4 ${viewMode !== 'PPA' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {years.map(year => {
            const yearFunding = (item.yearlyFunding && item.yearlyFunding[year]) || {};
            let total = (Object.values(yearFunding) as any[]).reduce((acc: number, val: any) => acc + parseCurrency(val), 0) as number;
            
            // Add detailed budget sum for this year (simulated logic: if PPA, we assume detailed budget is the annual reference)
            const detailedTotal = (item.detailedBudget || []).reduce((acc: number, b: any) => acc + parseCurrency(b.value), 0);
            if (total === 0) total = detailedTotal;

            const goal = (item.goals && item.goals[year]) || '-';
            const isExpanded = expandedYears[year];
            
            return (
              <div key={year} className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase flex items-center gap-2 text-slate-900">
                    <span className={`w-2 h-2 rounded-full ${total > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span> 
                    {year}
                  </span>
                  {(total > 0 || (item.detailedBudget && item.detailedBudget.length > 0)) && (
                    <button 
                      onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded transition-all flex items-center gap-1 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {isExpanded ? 'Recuar' : 'Dotação Detalhada'}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Meta Física</p>
                    <div className="text-lg font-bold text-blue-600">{goal}</div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Coins size={12} className="text-emerald-600"/> Financeiro Total</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-emerald-600">R$</span>
                      <span className="text-lg font-bold text-slate-900">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-3">
                        {item.detailedBudget && item.detailedBudget.map((b: any, bidx: number) => (
                          <div key={bidx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                               <span className="text-[8px] font-black text-blue-600 uppercase leading-tight">{b.nature}</span>
                               <span className="text-[9px] font-bold text-slate-900 whitespace-nowrap">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="text-[8px] text-slate-500 italic font-medium leading-tight">Fonte: {b.source}</div>
                          </div>
                        ))}
                        {Object.entries(yearFunding).map(([source, amount]: any) => (
                          <div key={source} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sourceStyles[source] || 'bg-slate-500 text-white'}`}>{source}</span>
                            <span className="text-[10px] font-black text-slate-700">R$ {parseCurrency(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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

  // Local state for budget entry in modal
  const [newBudgetEntry, setNewBudgetEntry] = useState({ nature: '', source: '', value: '' });

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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 min-h-screen">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg"><Layers size={28} /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
                <EditableText id="ppa_main_title" defaultText={viewMode === 'PPA' ? 'PPA Estratégico 2026-2029' : `${viewMode} EXERCÍCIO ${selectedYear}`} />
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                 <EditableText id="ppa_subtitle" defaultText="Plano Plurianual e Lei Orçamentária" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-wrap">
            {['PPA', 'LDO', 'LOA'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{mode}</button>
            ))}
            {viewMode !== 'PPA' && (
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                {['2026', '2027', '2028', '2029'].map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            )}
            <button onClick={handleShare} disabled={isSharing} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 shadow-lg ${shareSuccess ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-900 text-white hover:bg-black'}`}>
               {isSharing ? <Loader2 className="animate-spin" size={16}/> : shareSuccess ? <CheckCircle size={16}/> : <Share2 size={16} />}
               {shareSuccess ? 'LINK COPIADO' : 'GERAR LINK'}
            </button>
            <button onClick={() => setIsAddingAxis(true)} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md"><FolderPlus size={18} /></button>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {viewMode !== 'LOA' ? (
          axisOrder.length > 0 ? (
            axisOrder.map((axis) => (
              <div key={axis} className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <GripVertical size={20} className="text-slate-300"/>
                    <h2 className="text-lg font-black text-slate-800 uppercase">
                      <EditableText id={`ppa_axis_title_${axis.replace(/\s/g, '_')}`} defaultText={axis} />
                    </h2>
                    {editorMode && (
                      <button onClick={() => deleteAxis(axis)} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <button onClick={() => setIsAddingMeta(axis)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">+ Nova Ação</button>
                </div>
                <div className="space-y-4">
                  {(indicators[axis] || []).map((item, idx) => (
                    <ActionCard key={item.id} item={item} groupKey={axis} index={idx} viewMode={viewMode} selectedYear={selectedYear} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={(id: string) => { if(confirm("Excluir?")) { const d = {...indicators}; Object.keys(d).forEach(a => d[a] = d[a].filter((i: any) => i.id !== id)); persist(d); }}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />
                  ))}
                </div>
                <DynamicNotes sectionId={`ppa_axis_${axis}`} />
              </div>
            ))
          ) : (
             <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <Layers size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-500">Nenhum eixo estratégico encontrado.</h3>
               <p className="text-slate-400 max-w-sm mx-auto mt-2">Crie o seu primeiro eixo clicando no ícone de pasta acima ou restaure os dados via Link Estratégico.</p>
             </div>
          )
        ) : (
          loaGroups ? (
            Object.entries(loaGroups).map(([activity, list]: any) => (
              <div key={activity} className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-4">
                  <h2 className="text-lg font-black text-slate-800 uppercase">{activity}</h2>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{list.length} Registros</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                       <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                       <select 
                         className="w-full pl-10 pr-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-slate-700 outline-none"
                         value={selectedTitleId[activity] || ""}
                         onChange={(e) => setSelectedTitleId({...selectedTitleId, [activity]: e.target.value})}
                       >
                         <option value="">Pesquisar título de gasto...</option>
                         <option value="ALL">➔ EXIBIR TODOS OS ITENS</option>
                         {list.map((item: any) => <option key={item.id} value={item.id}>{item.action}</option>)}
                       </select>
                    </div>
                    <button 
                       onClick={() => setSelectedTitleId({...selectedTitleId, [activity]: selectedTitleId[activity] === "ALL" ? "" : "ALL"})}
                       className={`px-4 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2 border ${selectedTitleId[activity] === "ALL" ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}
                    >
                      {selectedTitleId[activity] === "ALL" ? <X size={16}/> : <LayoutList size={16}/>}
                      {selectedTitleId[activity] === "ALL" ? "Recolher" : "Abrir Todos"}
                    </button>
                  </div>
                  <div className="pt-4 border-t border-indigo-50">
                    {selectedTitleId[activity] === "ALL" ? (
                      list.map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={()=>{}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />)
                    ) : selectedTitleId[activity] ? (
                      list.filter((i: any) => i.id === selectedTitleId[activity]).map((item: any) => <ActionCard key={item.id} item={item} groupKey={activity} index={0} viewMode="LOA" selectedYear={selectedYear} defaultExpanded={true} onEdit={(p: any) => { setEditingItem(p); setFormData(p); }} onDelete={()=>{}} onDragStart={(...args: any[])=>{}} onDragOver={(e: any)=>e.preventDefault()} onDrop={(...args: any[])=>{}} />)
                    ) : null}
                  </div>
                </div>
                <DynamicNotes sectionId={`loa_act_${activity}`} />
              </div>
            ))
          ) : (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-xl font-bold text-slate-500">Nenhum registro encontrado na LOA.</h3>
               <p className="text-slate-400 max-w-sm mx-auto mt-2">Vincule suas ações a atividades da LOA no formulário de edição para visualizá-las aqui.</p>
             </div>
          )
        )}
      </div>

      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl relative z-10 overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
             <div className="bg-slate-900 p-8 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Edit3 size={28}/></div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{editingItem ? 'Configuração de Ação Estratégica' : 'Nova Ação Governamental'}</h3>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-2">Módulo de Planejamento e Orçamento</p>
                 </div>
               </div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32}/></button>
             </div>
             
             <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Nome da Ação</label>
                      <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Manutenção da Unidade de Pronto Socorro" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Atividade LOA Correspondente</label>
                      <select value={formData.loaActivity || ""} onChange={(e) => setFormData({...formData, loaActivity: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Selecione a atividade oficial...</option>
                        {LOA_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Indicador Principal</label>
                      <input type="text" value={formData.indicator || ""} onChange={(e) => setFormData({...formData, indicator: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: % de satisfação ou Volume de atendimentos" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Objetivo Geral</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl h-full min-h-[220px] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium leading-relaxed" placeholder="Descreva os resultados esperados para esta ação..." />
                  </div>
                </div>

                {/* SEÇÃO: DOTAÇÃO ORÇAMENTÁRIA DETALHADA */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-2">
                     <Wallet size={18} />
                     <h4 className="text-xs font-black uppercase tracking-widest">Dotação Orçamentária Detalhada</h4>
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="md:col-span-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Natureza da Despesa</label>
                           <select 
                             className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
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
                           <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Fonte de Recurso</label>
                           <select 
                             className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                             value={newBudgetEntry.source}
                             onChange={(e) => setNewBudgetEntry({...newBudgetEntry, source: e.target.value})}
                           >
                             <option value="">Selecione...</option>
                             {FUNDING_SOURCES_DETAILED.map(source => <option key={source} value={source}>{source}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Valor (R$)</label>
                           <input 
                             type="text" 
                             className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold" 
                             placeholder="0,00"
                             value={newBudgetEntry.value}
                             onChange={(e) => setNewBudgetEntry({...newBudgetEntry, value: e.target.value})}
                           />
                        </div>
                        <button 
                          onClick={addBudgetEntry}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Adicionar Item
                        </button>
                      </div>

                      <div className="overflow-hidden border border-slate-100 rounded-2xl">
                         <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                               <tr>
                                  <th className="px-4 py-3">Natureza</th>
                                  <th className="px-4 py-3">Fonte</th>
                                  <th className="px-4 py-3 text-right">Valor Planejado</th>
                                  <th className="px-4 py-3 text-center">Ações</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-700">
                               {(formData.detailedBudget || []).map((b: any, idx: number) => (
                                 <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-blue-600 uppercase">{b.nature}</td>
                                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{b.source}</td>
                                    <td className="px-4 py-3 text-right">R$ {parseCurrency(b.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 text-center">
                                       <button onClick={() => removeBudgetEntry(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                                    </td>
                                 </tr>
                               ))}
                               {(formData.detailedBudget || []).length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic">Nenhum detalhamento orçamentário inserido.</td>
                                 </tr>
                               )}
                            </tbody>
                            {(formData.detailedBudget || []).length > 0 && (
                              <tfoot className="bg-slate-50 border-t border-slate-100 font-black text-slate-800">
                                 <tr>
                                    <td colSpan={2} className="px-4 py-4 text-right uppercase tracking-widest text-[9px]">Total Detalhado:</td>
                                    <td className="px-4 py-4 text-right text-sm">
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {['2026', '2027', '2028', '2029'].map(year => (
                    <div key={year} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                      <p className="font-black mb-4 text-center text-blue-600 text-lg">{year}</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Meta Física</label>
                          <input placeholder="Ex: 500 Unid." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Financeiro Adicional</label>
                          <div className="space-y-2">
                             {Object.entries(formData.yearlyFunding?.[year] || {}).map(([s, a]: any) => (
                              <div key={s} className="flex gap-2 items-center bg-blue-50 p-2 rounded-xl border border-blue-100">
                                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg">{s}</span>
                                <input className="w-full bg-transparent text-xs font-black text-blue-900 outline-none" value={a} onChange={(e) => { const upd = {...formData.yearlyFunding}; upd[year][s] = e.target.value; setFormData({...formData, yearlyFunding: upd}); }} />
                                <button onClick={() => { const upd = {...formData.yearlyFunding}; delete upd[year][s]; setFormData({...formData, yearlyFunding: upd}); }} className="text-blue-300 hover:text-red-500"><X size={14}/></button>
                              </div>
                            ))}
                            <select className="w-full text-[10px] border-2 border-dashed border-slate-200 bg-white p-2 rounded-xl font-bold text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer" onChange={(e) => { if(e.target.value) { const upd = {...formData.yearlyFunding}; upd[year][e.target.value] = ""; setFormData({...formData, yearlyFunding: upd}); e.target.value = ""; } }}>
                              <option value="">+ Adicionar Fonte</option>
                              {Object.keys(sourceStyles).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-full md:w-1/3">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest flex items-center gap-2"><Lock size={12} className="text-blue-500"/> Autorização do Conselho</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[24px] text-center font-black text-xl shadow-xl focus:border-blue-500 outline-none transition-all" placeholder="Senha Mestre" />
                    {error && <p className="text-red-500 text-[10px] font-black mt-3 uppercase text-center animate-pulse">{error}</p>}
                  </div>
                  <button onClick={handleSaveAction} className="flex-1 py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4">
                     <Save size={24}/> Sincronizar ao Painel Estratégico
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8 border border-slate-100">
             <h3 className="font-black text-slate-900 uppercase text-lg mb-6 tracking-tighter">Novo Eixo Estratégico</h3>
             <div className="space-y-5">
               <input placeholder="Identificação do Eixo" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
               <input type="password" placeholder="Senha Mestre" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold text-center shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" />
               <button onClick={() => { if(adminPassword === 'Conselho@2026') { persist({...indicators, [axisName]: []}, [...axisOrder, axisName]); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); } }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black">Criar Eixo Governamental</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPA;
