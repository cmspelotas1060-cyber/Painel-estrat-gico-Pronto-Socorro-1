
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, X, Trash2, Edit3, FolderPlus,
  Coins, Layers, TrendingUp, Info, Lock, Save, PieChart, CirclePlus as PlusCircle,
  ChevronRight, Book, ArrowRight, ChevronDown, ChevronUp, Eye, GripVertical,
  FileText, CalendarDays, HelpCircle, BookOpen, ListTree, Award, TrendingDown,
  Sigma, BadgeDollarSign, Briefcase, Plus, Check, SquarePlus as PlusSquare, CircleAlert, ReceiptText,
  Search, LayoutList
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

const EXPENDITURE_TITLES = [
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
  "3.1.9.1.13 - Obrigações Patronais",
  "3.3.5.0.41 - Contribuições",
  "3.3.5.0.43 - Subvenções Sociais",
  "3.3.9.0.01 - Aposentadorias",
  "3.3.9.0.30 - Material de Consumo",
  "3.3.9.0.39 - Outros Serviços de Terceiros - Pessoa Jurídica",
  "4.4.9.0.51 - Obras e Instalações",
  "4.4.9.0.52 - Equipamentos e Material Permanente"
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

const sourceLabels: Record<string, string> = {
  '1500': '1500 (Rec. Próprios)',
  '1500.1002': '1500.1002 (Mínimo 15%)',
  '1621': '1621 (Estadual)',
  '1600': '1600 (Cust. Nac.)',
  '1604': '1604 (Ag. Saúde)',
  '1605': '1605 (Piso Enferm.)',
  '1659': '1659 (Outras Transf.)',
  '1601': '1601 (Invest. Nac.)'
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
            <p className="text-sm font-bold text-slate-800">{item.indicator}</p>
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
            const total = (Object.values(yearFunding) as any[]).reduce((acc: number, val: any) => acc + parseCurrency(val), 0) as number;
            const goal = (item.goals && item.goals[year]) || '-';
            const isExpanded = expandedYears[year];
            
            return (
              <div key={year} className="p-4 rounded-2xl border bg-white border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase flex items-center gap-2 text-slate-900">
                    <span className={`w-2 h-2 rounded-full ${total > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span> 
                    {year}
                  </span>
                  {total > 0 && (
                    <button 
                      onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded transition-all flex items-center gap-1 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {isExpanded ? 'Recuar' : 'Fontes'}
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
                      <div className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-2">
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
  const [formData, setFormData] = useState<any>({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {} });
  const [axisName, setAxisName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('ps_ppa_full_data_v2');
    const savedOrder = localStorage.getItem('ps_ppa_axis_order');
    if (saved) {
      try { 
        setIndicators(JSON.parse(saved));
        if (savedOrder) setAxisOrder(JSON.parse(savedOrder));
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
    setFormData({ yearlyFunding: { '2026': {}, '2027': {}, '2028': {}, '2029': {} }, goals: {} });
  };

  const loaGroups = useMemo(() => {
    if (viewMode !== 'LOA') return null;
    const groups: any = {};
    LOA_ACTIVITIES.forEach(act => { groups[act] = []; });
    groups["Outras Atividades"] = [];
    (Object.values(indicators) as any[][]).forEach(list => {
      (list as any[]).forEach(action => {
        const act = action.loaActivity;
        if (act && groups[act]) groups[act].push(action);
        else groups["Outras Atividades"].push(action);
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
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {['PPA', 'LDO', 'LOA'].map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{mode}</button>
            ))}
            {viewMode !== 'PPA' && (
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                {['2026', '2027', '2028', '2029'].map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            )}
            <button onClick={() => setIsAddingAxis(true)} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md"><FolderPlus size={18} /></button>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {viewMode !== 'LOA' ? (
          axisOrder.map((axis) => (
            <div key={axis} className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <GripVertical size={20} className="text-slate-300"/>
                  <h2 className="text-lg font-black text-slate-800 uppercase">{axis}</h2>
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
          loaGroups && Object.entries(loaGroups).map(([activity, list]: any) => (
            <div key={activity} className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-indigo-100 pb-4">
                <h2 className="text-lg font-black text-slate-800 uppercase">{activity}</h2>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{list.length} Registros</div>
              </div>
              {list.length > 0 && (
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
              )}
              <DynamicNotes sectionId={`loa_act_${activity}`} />
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDICAO (REDACTED) */}
      {(isAddingMeta || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-slate-900 p-6 flex items-center justify-between text-white shrink-0">
               <div className="flex items-center gap-4"><Edit3 size={24}/><h3 className="text-lg font-bold uppercase">{editingItem ? 'Editar Ação' : 'Nova Ação'}</h3></div>
               <button onClick={() => { setIsAddingMeta(null); setEditingItem(null); }}><X size={24}/></button>
             </div>
             <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Nome da Ação</label>
                    <input type="text" value={formData.action || ""} onChange={(e) => setFormData({...formData, action: e.target.value})} className="w-full p-4 border rounded-2xl font-bold" />
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Atividade LOA</label>
                    <select value={formData.loaActivity || ""} onChange={(e) => setFormData({...formData, loaActivity: e.target.value})} className="w-full p-4 border rounded-2xl font-bold">
                      <option value="">Selecione...</option>
                      {LOA_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Objetivo</label>
                    <textarea value={formData.objective || ""} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-4 border rounded-2xl h-32 resize-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['2026', '2027', '2028', '2029'].map(year => (
                    <div key={year} className="bg-white p-4 rounded-2xl border">
                      <p className="font-bold mb-2 text-center text-blue-600">{year}</p>
                      <input placeholder="Meta" className="w-full p-2 border rounded-lg text-xs mb-2" value={formData.goals?.[year] || ""} onChange={(e) => setFormData({...formData, goals: {...formData.goals, [year]: e.target.value}})} />
                      {Object.entries(formData.yearlyFunding?.[year] || {}).map(([s, a]: any) => (
                        <div key={s} className="flex gap-1 mb-1 items-center bg-slate-50 p-1 rounded">
                          <span className="text-[8px] font-bold bg-blue-600 text-white px-1 rounded">{s}</span>
                          <input className="w-full bg-transparent text-[10px] font-bold outline-none" value={a} onChange={(e) => { const upd = {...formData.yearlyFunding}; upd[year][s] = e.target.value; setFormData({...formData, yearlyFunding: upd}); }} />
                        </div>
                      ))}
                      <select className="w-full text-[10px] border border-dashed p-1 rounded mt-2" onChange={(e) => { if(e.target.value) { const upd = {...formData.yearlyFunding}; upd[year][e.target.value] = ""; setFormData({...formData, yearlyFunding: upd}); e.target.value = ""; } }}>
                        <option value="">+ Fonte</option>
                        {Object.keys(sourceLabels).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Senha Mestre</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border rounded-2xl text-center font-bold" /></div>
                  <button onClick={handleSaveAction} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase transition-all shadow-lg hover:bg-blue-700">Sincronizar ao Painel</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isAddingAxis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddingAxis(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-8">
             <h3 className="font-bold text-slate-900 uppercase text-lg mb-6">Novo Eixo Estratégico</h3>
             <div className="space-y-4">
               <input placeholder="Identificação do Eixo" value={axisName} onChange={(e) => setAxisName(e.target.value)} className="w-full p-4 border rounded-2xl font-bold" />
               <input type="password" placeholder="Senha Mestre" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border rounded-2xl font-bold text-center" />
               <button onClick={() => { if(adminPassword === 'Conselho@2026') { persist({...indicators, [axisName]: []}, [...axisOrder, axisName]); setIsAddingAxis(false); setAxisName(""); setAdminPassword(""); } }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase">Criar Eixo</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PPA;
