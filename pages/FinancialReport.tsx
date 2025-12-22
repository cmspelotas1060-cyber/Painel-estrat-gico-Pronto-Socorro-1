
import React, { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingDown, CreditCard, PieChart as PieChartIcon, Download, 
  AlertCircle, Calculator, ChevronDown, ChevronUp, Calendar, Share2, Loader2, CheckCircle
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

const MONTH_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr', may: 'Mai', jun: 'Jun',
  jul: 'Jul', aug: 'Ago', sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez'
};

const TRIMESTER_MAPPING: Record<string, string> = {
  jan: 'q1', feb: 'q1', mar: 'q1', apr: 'q1', may: 'q2', jun: 'q2', jul: 'q2', aug: 'q2', sep: 'q3', oct: 'q3', nov: 'q3', dec: 'q3'
};

const FinancialCard = ({ title, value, type, icon: Icon, subtext }: any) => {
  let colorClass = 'text-slate-800';
  let iconBg = 'bg-slate-100 text-slate-600';
  if (type === 'negative') { colorClass = 'text-red-700'; iconBg = 'bg-red-100 text-red-600'; } 
  else if (type === 'info') { colorClass = 'text-blue-700'; iconBg = 'bg-blue-100 text-blue-600'; } 
  else if (type === 'emerald') { colorClass = 'text-emerald-700'; iconBg = 'bg-emerald-100 text-emerald-600'; }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-black mt-1 ${colorClass}`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}><Icon size={24} /></div>
      </div>
      {subtext && <div className="text-sm font-medium text-slate-400">{subtext}</div>}
    </div>
  );
};

const TrimesterCard = ({ id, label, total, months }: { id: string, label: string, total: number, months: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeMonths = months.filter(m => m.value > 0).length;
  const average = activeMonths > 0 ? total / activeMonths : 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
           <div className={`p-2 rounded-lg ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}><Calendar size={20} /></div>
           <div><h4 className="font-bold text-slate-800">{label}</h4><p className="text-xs text-slate-500">{activeMonths} meses registrados</p></div>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0 text-right">
           <div><p className="text-[10px] text-slate-400 uppercase font-bold">Total</p><p className="font-bold text-slate-700">R$ {total.toLocaleString('pt-BR')}</p></div>
           <div>{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {months.map((m: any) => (
            <div key={m.key} className="bg-white p-3 rounded border border-slate-200 flex justify-between items-center text-sm">
              <span className="font-medium text-slate-600">{m.label}</span>
              <span className="font-bold text-slate-800">R$ {m.value.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FinancialReport: React.FC = () => {
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [totalDespesa, setTotalDespesa] = useState(0);
  const [mediaMensal, setMediaMensal] = useState(0);
  const [trimesterGroups, setTrimesterGroups] = useState<any>({
    q1: { id: 'q1', label: '1º Quadrimestre', total: 0, months: [] },
    q2: { id: 'q2', label: '2º Quadrimestre', total: 0, months: [] },
    q3: { id: 'q3', label: '3º Quadrimestre', total: 0, months: [] },
  });

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      let acc = 0, count = 0;
      const newTrimesters: any = { q1: { id: 'q1', label: '1º Q', total: 0, months: [] }, q2: { id: 'q2', label: '2º Q', total: 0, months: [] }, q3: { id: 'q3', label: '3º Q', total: 0, months: [] }};
      let b: any = { 'Pessoal': 0, 'Fornecedores': 0, 'Essenciais': 0, 'Serviços': 0, 'Rateio': 0 };

      months.forEach(m => {
        const d = parsed[m] || {};
        const val = parseFloat(d.fin_total || 0);
        newTrimesters[TRIMESTER_MAPPING[m]].months.push({ key: m, label: MONTH_LABELS[m], value: val });
        newTrimesters[TRIMESTER_MAPPING[m]].total += val;
        if (val > 0) { acc += val; count++; b['Pessoal'] += parseFloat(d.fin_pessoal || 0); b['Fornecedores'] += parseFloat(d.fin_fornecedores || 0); b['Essenciais'] += parseFloat(d.fin_essenciais || 0); b['Serviços'] += parseFloat(d.fin_servicos || 0); b['Rateio'] += parseFloat(d.fin_rateio || 0); }
      });
      setTotalDespesa(acc); setMediaMensal(count > 0 ? acc / count : 0); setTrimesterGroups(newTrimesters);
      setCostBreakdown(Object.entries(b).map(([c, v]) => ({ category: c, value: v as number, percent: acc > 0 ? (((v as number)/acc)*100).toFixed(1)+'%' : '0%' })).filter(i => i.value > 0).sort((x, y) => y.value - x.value));
      setFinancialData(months.map(m => ({ month: MONTH_LABELS[m], despesa: parseFloat(parsed[m]?.fin_total || 0) })).filter(i => i.despesa > 0));
    }
    setLoading(false);
  }, []);

  const handleShareFinanceOnly = async () => {
    setIsSharing(true);
    try {
      const storageData = JSON.parse(localStorage.getItem('ps_monthly_detailed_stats') || '{}');
      const filtered: any = {};
      Object.keys(storageData).forEach(period => {
        filtered[period] = {};
        Object.keys(storageData[period]).forEach(k => { if (k.startsWith('fin_')) filtered[period][k] = storageData[period][k]; });
      });

      const blob = await new Response(new Blob([JSON.stringify({ type: 'financial', data: filtered, ts: Date.now() })]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const url = `${window.location.origin}${window.location.pathname}#/share?share=gz_${(reader.result as string).split(',')[1]}`;
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 4000);
        setIsSharing(false);
      };
    } catch (e) {
      console.error(e);
      setIsSharing(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Processando dados financeiros...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div><h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatório de Despesas</h1><p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium"><DollarSign size={16} className="text-emerald-500"/>Acompanhamento de Custos e Despesas do Pronto Socorro (2025)</p></div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={handleShareFinanceOnly} disabled={isSharing} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all border-2 ${shareSuccess ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'}`}>
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK FINANCEIRO COPIADO' : 'COMPARTILHAR ESTA ABA'}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold flex items-center gap-2"><Download size={16} /> Exportar PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialCard title="Despesas Totais" value={totalDespesa} type="negative" icon={TrendingDown} subtext={<span className="text-red-500 font-bold uppercase text-[10px]">Acumulado 2025</span>} />
        <FinancialCard title="Média Mensal" value={mediaMensal} type="info" icon={Calculator} subtext={<span className="text-blue-500 font-bold uppercase text-[10px]">Base Meses Ativos</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest"><PieChartIcon size={18} className="text-red-500"/>Evolução de Despesas</h3>
          <div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="colorD" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `R$${v/1000}k`} /><Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString()}`, 'Despesa']} /><Area type="monotone" dataKey="despesa" stroke="#f87171" strokeWidth={3} fill="url(#colorD)" /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6 uppercase text-xs tracking-widest"><CreditCard size={18} className="text-orange-500"/>Detalhamento</h3><div className="space-y-4">{costBreakdown.map((item, idx) => (<div key={idx}><div className="flex justify-between text-xs mb-1"><span className="font-bold text-slate-500">{item.category}</span><span className="font-black text-slate-800">R$ {item.value.toLocaleString()}</span></div><div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: item.percent }}></div></div></div>))}</div></div>
      </div>

      <div className="space-y-4">
         <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2"><Calendar size={18} className="text-blue-500"/> Quadrimestres</h3>
         <TrimesterCard {...trimesterGroups.q1} />
         <TrimesterCard {...trimesterGroups.q2} />
         <TrimesterCard {...trimesterGroups.q3} />
      </div>
    </div>
  );
};

export default FinancialReport;
