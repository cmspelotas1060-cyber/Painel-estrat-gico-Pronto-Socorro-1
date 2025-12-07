import React from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, 
  CreditCard, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Printer
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

// Mock Financial Data
const FINANCIAL_DATA = [
  { month: 'Jan', receita: 450000, despesa: 380000 },
  { month: 'Fev', receita: 420000, despesa: 395000 },
  { month: 'Mar', receita: 480000, despesa: 410000 },
  { month: 'Abr', receita: 460000, despesa: 385000 },
  { month: 'Mai', receita: 510000, despesa: 420000 },
  { month: 'Jun', receita: 530000, despesa: 440000 },
];

const COST_BREAKDOWN = [
  { category: 'Pessoal (Médicos/Enf)', value: 220000, percent: '50%' },
  { category: 'Medicamentos e Insumos', value: 110000, percent: '25%' },
  { category: 'Manutenção e Equipamentos', value: 44000, percent: '10%' },
  { category: 'Serviços de Terceiros', value: 35000, percent: '8%' },
  { category: 'Administrativo/Outros', value: 31000, percent: '7%' },
];

const FinancialCard = ({ title, value, type, icon: Icon, subtext }: any) => {
  const isPositive = type === 'positive';
  const isNeutral = type === 'neutral';
  
  let colorClass = 'text-slate-800';
  let bgClass = 'bg-white';
  let iconBg = 'bg-slate-100 text-slate-600';

  if (type === 'positive') {
    colorClass = 'text-emerald-700';
    iconBg = 'bg-emerald-100 text-emerald-600';
  } else if (type === 'negative') {
    colorClass = 'text-red-700';
    iconBg = 'bg-red-100 text-red-600';
  } else if (type === 'info') {
    colorClass = 'text-blue-700';
    iconBg = 'bg-blue-100 text-blue-600';
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-black mt-1 ${colorClass}`}>
            R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={24} />
        </div>
      </div>
      {subtext && (
        <div className="flex items-center gap-1 text-sm font-medium text-slate-400">
           {subtext}
        </div>
      )}
    </div>
  );
};

const FinancialReport: React.FC = () => {
  const totalReceita = FINANCIAL_DATA.reduce((acc, cur) => acc + cur.receita, 0);
  const totalDespesa = FINANCIAL_DATA.reduce((acc, cur) => acc + cur.despesa, 0);
  const saldo = totalReceita - totalDespesa;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatório Financeiro</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <DollarSign size={16} className="text-emerald-500"/>
            Balanço e Indicadores Econômicos do Pronto Socorro (Semestre 1/2025)
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-bold transition-colors print:hidden"
        >
          <Printer size={16} /> Imprimir Relatório
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard 
          title="Faturamento Bruto (Semestre)" 
          value={totalReceita} 
          type="info" 
          icon={TrendingUp}
          subtext={<span className="flex items-center gap-1 text-emerald-600"><ArrowUpRight size={14}/> +12% vs. Semestre Anterior</span>}
        />
        <FinancialCard 
          title="Despesas Operacionais" 
          value={totalDespesa} 
          type="negative" 
          icon={TrendingDown}
          subtext={<span className="flex items-center gap-1 text-red-500"><ArrowUpRight size={14}/> +5% (Inflação Médica)</span>}
        />
        <FinancialCard 
          title="Resultado Operacional" 
          value={saldo} 
          type={saldo >= 0 ? 'positive' : 'negative'} 
          icon={Wallet}
          subtext={<span className="text-slate-400">Margem Líquida: {((saldo/totalReceita)*100).toFixed(1)}%</span>}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-500"/>
              Evolução Financeira (Mensal)
            </h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Receita</span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-red-400"></div> Despesa</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FINANCIAL_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="despesa" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
            <CreditCard size={18} className="text-orange-500"/>
            Detalhamento de Custos
          </h3>
          <div className="flex-1 space-y-4">
            {COST_BREAKDOWN.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{item.category}</span>
                  <span className="text-sm font-bold text-slate-700">R$ {item.value.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-slate-400 h-2 rounded-full group-hover:bg-blue-500 transition-colors" 
                    style={{ width: item.percent }}
                  ></div>
                </div>
                <div className="text-right text-[10px] text-slate-400 mt-0.5">{item.percent} do total</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm">
               <span className="font-bold text-slate-500">Custo Médio Paciente:</span>
               <span className="font-bold text-slate-800">R$ 184,50</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sources / Info Footer */}
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-xs text-slate-500">
         <p className="flex items-center gap-2">
            <strong>Fonte de Dados:</strong> Integração com Sistema ERP Hospitalar (Última sincronização: Hoje, 08:00).
            Os valores apresentados são consolidados e podem sofrer ajustes contábeis até o fechamento do mês.
         </p>
      </div>

    </div>
  );
};

export default FinancialReport;