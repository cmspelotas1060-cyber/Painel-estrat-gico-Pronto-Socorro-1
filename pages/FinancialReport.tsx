
import React, { useEffect, useState } from 'react';
import { 
  DollarSign, TrendingDown, 
  CreditCard, PieChart as PieChartIcon, Download, AlertCircle
} from 'lucide-react';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

// Helper to map month keys to labels
const MONTH_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr', may: 'Mai', jun: 'Jun',
  jul: 'Jul', aug: 'Ago', sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez'
};

const FinancialCard = ({ title, value, type, icon: Icon, subtext }: any) => {
  let colorClass = 'text-slate-800';
  let iconBg = 'bg-slate-100 text-slate-600';

  if (type === 'negative') {
    colorClass = 'text-red-700';
    iconBg = 'bg-red-100 text-red-600';
  } else if (type === 'info') {
    colorClass = 'text-blue-700';
    iconBg = 'bg-blue-100 text-blue-600';
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full break-inside-avoid">
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
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Totals
  const [totalDespesa, setTotalDespesa] = useState(0);

  useEffect(() => {
    // Read from LocalStorage where Admin Panel saves data
    const savedDetailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    
    if (savedDetailedStats) {
      const parsed = JSON.parse(savedDetailedStats);
      
      // 1. Process Monthly Trend Data
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const chartData: any[] = [];
      let accDespesa = 0;
      let breakdown: any = {
        'Despesa Pessoal': 0,
        'Fornecedores': 0,
        'Despesas Essenciais': 0,
        'Prestação de Serviços': 0,
        'Rateio HUSFP': 0,
        'Outros': 0
      };

      months.forEach(m => {
        const monthData = parsed[m];
        if (monthData) {
          const despesa = parseFloat(monthData.fin_total || 0);
          
          if (despesa > 0) {
            chartData.push({
              month: MONTH_LABELS[m],
              despesa: despesa
            });
            accDespesa += despesa;

            // Aggregate Breakdown
            breakdown['Despesa Pessoal'] += parseFloat(monthData.fin_pessoal || 0);
            breakdown['Fornecedores'] += parseFloat(monthData.fin_fornecedores || 0);
            breakdown['Despesas Essenciais'] += parseFloat(monthData.fin_essenciais || 0);
            breakdown['Prestação de Serviços'] += parseFloat(monthData.fin_servicos || 0);
            breakdown['Rateio HUSFP'] += parseFloat(monthData.fin_rateio || 0);
          }
        }
      });

      setFinancialData(chartData);
      setTotalDespesa(accDespesa);

      // 2. Process Breakdown Data
      const formattedBreakdown = Object.entries(breakdown).map(([category, value]) => {
         const val = value as number;
         return {
           category,
           value: val,
           percent: accDespesa > 0 ? ((val / accDespesa) * 100).toFixed(1) + '%' : '0%'
         };
      }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

      setCostBreakdown(formattedBreakdown);
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-10 text-center">Carregando dados financeiros...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Relatório de Despesas</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <DollarSign size={16} className="text-emerald-500"/>
            Acompanhamento de Custos e Despesas do Pronto Socorro (Ano Base: 2025)
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors print:hidden"
        >
          <Download size={16} /> Baixar Relatório (PDF)
        </button>
      </div>

      {financialData.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl text-center">
           <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
           <h3 className="font-bold text-yellow-800">Sem dados de despesas registrados</h3>
           <p className="text-yellow-700 text-sm mt-1">Acesse a Área Administrativa para inserir os valores de Despesas do período.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-6">
            <FinancialCard 
              title="Despesas Operacionais Totais" 
              value={totalDespesa} 
              type="negative" 
              icon={TrendingDown}
              subtext={<span className="flex items-center gap-1 text-red-500">Acumulado do período</span>}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 break-inside-avoid">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-red-500"/>
                  Evolução de Despesas (Mensal)
                </h3>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-red-400"></div> Despesa</span>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
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
                      formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Despesa']}
                    />
                    <Area type="monotone" dataKey="despesa" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col break-inside-avoid">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
                <CreditCard size={18} className="text-orange-500"/>
                Detalhamento de Custos
              </h3>
              <div className="flex-1 space-y-4">
                {costBreakdown.length > 0 ? costBreakdown.map((item, idx) => (
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
                )) : (
                  <p className="text-sm text-slate-400 italic">Insira detalhes de despesas (Pessoal, Fornecedores, etc) na Área Admin para ver o gráfico.</p>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Sources / Info Footer */}
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-xs text-slate-500">
         <p className="flex items-center gap-2">
            <strong>Fonte de Dados:</strong> Painel Administrativo de Gestão PS.
            Os valores apresentados são consolidados com base nos inputs manuais do administrador.
         </p>
      </div>

    </div>
  );
};

export default FinancialReport;
