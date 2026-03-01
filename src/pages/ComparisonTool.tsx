import React, { useState, useEffect } from 'react';
import { 
  GitCompare, ArrowRight, ArrowUpRight, ArrowDownRight, 
  Minus, Users, DollarSign, Activity, AlertCircle, BarChart3,
  TrendingUp, TrendingDown, Scale, Download, Lightbulb, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const PERIOD_OPTIONS = [
  { value: 'jan', label: 'Janeiro' },
  { value: 'feb', label: 'Fevereiro' },
  { value: 'mar', label: 'Março' },
  { value: 'apr', label: 'Abril' },
  { value: 'may', label: 'Maio' },
  { value: 'jun', label: 'Junho' },
  { value: 'jul', label: 'Julho' },
  { value: 'aug', label: 'Agosto' },
  { value: 'sep', label: 'Setembro' },
  { value: 'oct', label: 'Outubro' },
  { value: 'nov', label: 'Novembro' },
  { value: 'dec', label: 'Dezembro' },
  { value: 'q1', label: '1º Quadrimestre' },
  { value: 'q2', label: '2º Quadrimestre' },
  { value: 'q3', label: '3º Quadrimestre' },
];

const ComparisonTool: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [periodA, setPeriodA] = useState('jan');
  const [periodB, setPeriodB] = useState('feb');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) {
      setData(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // Helper para buscar dados de forma segura (retorna 0 se nulo)
  const getVal = (period: string, key: string): number => {
    return parseFloat(data[period]?.[key] || 0);
  };

  // 1. Extração de Dados Principais
  const statsA = {
    acolhimentos: getVal(periodA, 'i1_acolhimento'),
    consultas: getVal(periodA, 'i1_consultas'),
    despesas: getVal(periodA, 'fin_total'),
    ocupacao: getVal(periodA, 'i10_clinico_adulto'), 
    emergencia: getVal(periodA, 'i3_emergencia') + getVal(periodA, 'i3_urgencia'),
    leves: getVal(periodA, 'i3_pouco_urgente') + getVal(periodA, 'i3_ubs')
  };

  const statsB = {
    acolhimentos: getVal(periodB, 'i1_acolhimento'),
    consultas: getVal(periodB, 'i1_consultas'),
    despesas: getVal(periodB, 'fin_total'),
    ocupacao: getVal(periodB, 'i10_clinico_adulto'),
    emergencia: getVal(periodB, 'i3_emergencia') + getVal(periodB, 'i3_urgencia'),
    leves: getVal(periodB, 'i3_pouco_urgente') + getVal(periodB, 'i3_ubs')
  };

  // 2. Cálculos de Variação (%)
  const calcPct = (a: number, b: number) => a > 0 ? ((b - a) / a) * 100 : 0;
  
  const pctDespesas = calcPct(statsA.despesas, statsB.despesas);
  const pctVolume = calcPct(statsA.acolhimentos, statsB.acolhimentos);
  const pctEmergencia = calcPct(statsA.emergencia, statsB.emergencia);

  // 3. Cálculos de Eficiência (Custo por Paciente)
  const totalPacientesA = statsA.acolhimentos; 
  const totalPacientesB = statsB.acolhimentos;

  const custoPorPacienteA = totalPacientesA > 0 ? statsA.despesas / totalPacientesA : 0;
  const custoPorPacienteB = totalPacientesB > 0 ? statsB.despesas / totalPacientesB : 0;

  // 4. Lógica de Insights Cruzados (Cross-Analysis)
  const generateInsights = () => {
    const insights = [];

    // Cruzamento 1: Financeiro vs Volume
    // Se a despesa subir muito mais que o volume de pacientes (> 10% de diferença)
    if (pctDespesas > pctVolume + 10) {
      insights.push({
        type: 'alert',
        title: 'Descompasso Financeiro',
        text: `As despesas cresceram ${pctDespesas.toFixed(1)}%, mas o volume de pacientes cresceu apenas ${pctVolume.toFixed(1)}%. Verifique aumento de custos com fornecedores ou horas extras.`
      });
    } else if (pctVolume > pctDespesas + 10 && pctDespesas > 0) {
      insights.push({
        type: 'success',
        title: 'Eficiência de Escala',
        text: `O volume de pacientes aumentou significativamente (${pctVolume.toFixed(1)}%) com baixo impacto nas despesas. Otimização operacional detectada.`
      });
    }

    // Cruzamento 2: Perfil do Paciente (Grave vs Leve)
    if (pctEmergencia > 15) {
       insights.push({
         type: 'warning',
         title: 'Aumento de Complexidade',
         text: `Houve um salto de ${pctEmergencia.toFixed(1)}% nos casos graves (Urgência/Emergência). Isso pressiona mais a equipe e os insumos do que o volume total sugere.`
       });
    }

    // Cruzamento 3: Conversão de Consultas
    const ratioA = statsA.consultas / (statsA.acolhimentos || 1);
    const ratioB = statsB.consultas / (statsB.acolhimentos || 1);
    
    if (ratioB > ratioA + 0.10) { // 10% de aumento na conversão
        insights.push({
          type: 'info',
          title: 'Maior Taxa de Conversão Médica',
          text: `Proporcionalmente, mais pacientes que passaram pela triagem precisaram de consulta médica neste período. Menos evasão ou casos mais pertinentes.`
        });
    }

    // Fallback se nada drástico acontecer
    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        title: 'Estabilidade Operacional',
        text: 'Os indicadores variaram dentro de margens esperadas, mantendo a proporcionalidade entre custos e demanda.'
      });
    }

    return insights;
  };

  const activeInsights = generateInsights();

  // 5. Gráficos Comparativos
  const barData = [
    { name: 'Pacientes (Acolhimento)', A: statsA.acolhimentos, B: statsB.acolhimentos },
    { name: 'Consultas Médicas', A: statsA.consultas, B: statsB.consultas },
    { name: 'Casos Graves (Urg/Emerg)', A: statsA.emergencia, B: statsB.emergencia },
  ];

  const maxDespesa = Math.max(statsA.despesas, statsB.despesas) || 1;
  const maxPacientes = Math.max(totalPacientesA, totalPacientesB) || 1;

  const radarData = [
    { subject: 'Volume Financeiro', A: (statsA.despesas / maxDespesa) * 100, B: (statsB.despesas / maxDespesa) * 100, fullMark: 100 },
    { subject: 'Volume Pacientes', A: (totalPacientesA / maxPacientes) * 100, B: (totalPacientesB / maxPacientes) * 100, fullMark: 100 },
    { subject: 'Taxa Ocupação', A: statsA.ocupacao, B: statsB.ocupacao, fullMark: 100 },
  ];

  // Componente de Badge de Delta
  const DeltaBadge = ({ valA, valB, format = 'number', inverseBetter = false }: { valA: number, valB: number, format?: 'number'|'currency'|'percent', inverseBetter?: boolean }) => {
    const diff = valB - valA;
    const percent = valA > 0 ? ((diff / valA) * 100) : 0;
    
    if (valA === 0 && valB === 0) return <span className="text-slate-400 text-xs">-</span>;

    let color = 'text-slate-500 bg-slate-100';
    let Icon = Minus;

    if (diff > 0) {
       Icon = ArrowUpRight;
       color = inverseBetter ? 'text-red-700 bg-red-100' : 'text-emerald-700 bg-emerald-100';
    } else if (diff < 0) {
       Icon = ArrowDownRight;
       color = inverseBetter ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100';
    }

    const formattedDiff = format === 'currency' 
       ? `R$ ${Math.abs(diff).toLocaleString('pt-BR', {maximumFractionDigits: 0})}`
       : format === 'percent' 
          ? `${diff.toFixed(1)}%`
          : Math.abs(diff).toLocaleString('pt-BR');

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${color}`}>
        <Icon size={14} />
        {formattedDiff} ({Math.abs(percent).toFixed(1)}%)
      </div>
    );
  };

  const labelA = PERIOD_OPTIONS.find(p => p.value === periodA)?.label;
  const labelB = PERIOD_OPTIONS.find(p => p.value === periodB)?.label;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <GitCompare className="text-blue-600" />
              Comparativo Estratégico
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Cruze dados técnicos e financeiros para diagnosticar a eficiência.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200 print:hidden">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Período A</span>
                <select 
                    value={periodA} 
                    onChange={(e) => setPeriodA(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none w-40 font-bold"
                >
                  {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="bg-white rounded-full p-2 border border-slate-200 shadow-sm text-slate-400">
                <ArrowRight size={16} />
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Período B</span>
                <select 
                    value={periodB} 
                    onChange={(e) => setPeriodB(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none w-40 font-bold"
                >
                  {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors print:hidden"
            >
              <Download size={16} /> Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">Carregando comparativo...</div>
      ) : (
        <>
           {/* DIAGNÓSTICO CRUZADO (INSIGHTS) */}
           <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-white break-inside-avoid">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4 flex items-center gap-2">
                <Lightbulb size={18} />
                Diagnóstico Cruzado de Inteligência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeInsights.map((insight, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'alert' ? 'bg-red-500/10 border-red-500' : 
                    insight.type === 'warning' ? 'bg-orange-500/10 border-orange-500' :
                    insight.type === 'success' ? 'bg-emerald-500/10 border-emerald-500' :
                    'bg-slate-700/50 border-blue-400'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {insight.type === 'alert' && <AlertCircle size={16} className="text-red-400" />}
                      {insight.type === 'warning' && <AlertTriangle size={16} className="text-orange-400" />}
                      {insight.type === 'success' && <CheckCircle size={16} className="text-emerald-400" />}
                      <span className="font-bold text-sm">{insight.title}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
           </div>

          {/* CARDS DE EFICIÊNCIA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 break-inside-avoid">
            
            {/* Card 1: Eficiência Financeira (Custo por Paciente) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Scale size={100} />
               </div>
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Activity size={16} className="text-purple-500" />
                 Eficiência (Custo/Paciente)
               </h3>
               
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <span className="text-xs font-bold text-slate-400 block mb-1">{labelA}</span>
                   <div className="text-xl font-bold text-slate-700">R$ {custoPorPacienteA.toFixed(2)}</div>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-blue-500 block mb-1">{labelB}</span>
                   <div className="text-2xl font-black text-blue-600">R$ {custoPorPacienteB.toFixed(2)}</div>
                 </div>
               </div>

               <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                 <span className="text-xs text-slate-500">Variação de Custo</span>
                 <DeltaBadge valA={custoPorPacienteA} valB={custoPorPacienteB} format="currency" inverseBetter={true} />
               </div>
            </div>

            {/* Card 2: Volume de Atendimento */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden break-inside-avoid">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Users size={100} />
               </div>
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Users size={16} className="text-blue-500" />
                 Volume de Atendimentos
               </h3>
               
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <span className="text-xs font-bold text-slate-400 block mb-1">{labelA}</span>
                   <div className="text-xl font-bold text-slate-700">{totalPacientesA.toLocaleString()}</div>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-blue-500 block mb-1">{labelB}</span>
                   <div className="text-2xl font-black text-blue-600">{totalPacientesB.toLocaleString()}</div>
                 </div>
               </div>

               <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                 <span className="text-xs text-slate-500">Crescimento de Demanda</span>
                 <DeltaBadge valA={totalPacientesA} valB={totalPacientesB} />
               </div>
            </div>

            {/* Card 3: Despesa Total */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden break-inside-avoid">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <DollarSign size={100} />
               </div>
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <DollarSign size={16} className="text-red-500" />
                 Despesa Total Operacional
               </h3>
               
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <span className="text-xs font-bold text-slate-400 block mb-1">{labelA}</span>
                   <div className="text-xl font-bold text-slate-700">R$ {statsA.despesas.toLocaleString('pt-BR', {compactDisplay: 'short', maximumFractionDigits: 0})}</div>
                 </div>
                 <div className="text-right">
                   <span className="text-xs font-bold text-blue-500 block mb-1">{labelB}</span>
                   <div className="text-2xl font-black text-blue-600">R$ {statsB.despesas.toLocaleString('pt-BR', {compactDisplay: 'short', maximumFractionDigits: 0})}</div>
                 </div>
               </div>

               <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                 <span className="text-xs text-slate-500">Impacto Financeiro</span>
                 <DeltaBadge valA={statsA.despesas} valB={statsB.despesas} format="percent" inverseBetter={true} />
               </div>
            </div>

          </div>

          {/* VISUALIZAÇÃO GRÁFICA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 break-inside-avoid">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                 <BarChart3 size={20} className="text-blue-500" />
                 Comparativo Técnico (Volume)
               </h3>
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={barData} layout="vertical" margin={{left: 40}}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Legend />
                     <Bar dataKey="A" name={labelA} fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                     <Bar dataKey="B" name={labelB} fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                 <Activity size={20} className="text-emerald-500" />
                 Radar de Equilíbrio (0-100%)
               </h3>
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                     <PolarGrid />
                     <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: 'bold'}} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                     <Radar name={labelA} dataKey="A" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                     <Radar name={labelB} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                     <Legend />
                     <Tooltip />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>
            </div>

          </div>

          {/* TABELA DETALHADA COM SINALIZAÇÃO */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden break-inside-avoid">
             <div className="bg-slate-50 p-4 border-b border-slate-200">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <AlertCircle size={18} className="text-blue-500"/>
                 Tabela de Variação & Sinalização
               </h3>
               <p className="text-xs text-slate-500 mt-1">
                 Itens com variação superior a 15% são destacados automaticamente.
               </p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                   <tr>
                     <th className="px-6 py-3">Indicador</th>
                     <th className="px-6 py-3">{labelA}</th>
                     <th className="px-6 py-3">{labelB}</th>
                     <th className="px-6 py-3 text-right">Variação %</th>
                     <th className="px-6 py-3 text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {[
                     { label: 'Acolhimentos', k: 'i1_acolhimento' },
                     { label: 'Consultas Médicas', k: 'i1_consultas' },
                     { label: 'Pacientes UPA', k: 'i3_upa' },
                     { label: 'Pacientes Graves (Emergência)', k: 'i3_emergencia' },
                     { label: 'Ocupação Leitos Clínicos', k: 'i10_clinico_adulto', suffix: '%' },
                     { label: 'Despesa Total', k: 'fin_total', prefix: 'R$ ' },
                     { label: 'Despesa Pessoal', k: 'fin_pessoal', prefix: 'R$ ' },
                   ].map((row, idx) => {
                     const valA = getVal(periodA, row.k);
                     const valB = getVal(periodB, row.k);
                     const diff = valB - valA;
                     const pct = valA > 0 ? (diff / valA) * 100 : 0;
                     const absPct = Math.abs(pct);

                     // Logic for Status Signal
                     let statusIcon = <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto" title="Estável"></div>;
                     let rowBg = '';

                     if (absPct > 15) {
                        if (pct > 0) {
                            // High Increase
                            statusIcon = <div className="flex items-center justify-center gap-1 text-xs font-bold text-red-600"><TrendingUp size={14}/> Alta</div>;
                            rowBg = 'bg-red-50/50';
                            
                            // Exception: Revenue or some metrics where increase is good (not applicable here mostly)
                        } else {
                            // High Decrease
                            statusIcon = <div className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600"><TrendingDown size={14}/> Queda</div>;
                            rowBg = 'bg-blue-50/50';
                        }
                     }

                     return (
                       <tr key={idx} className={`hover:bg-slate-50 transition-colors ${rowBg}`}>
                         <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                           {row.label}
                         </td>
                         <td className="px-6 py-4 text-slate-500">{row.prefix}{valA.toLocaleString()}{row.suffix}</td>
                         <td className="px-6 py-4 text-blue-600 font-bold">{row.prefix}{valB.toLocaleString()}{row.suffix}</td>
                         <td className="px-6 py-4 text-right">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${pct > 0 ? 'text-red-600' : pct < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                             {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            {statusIcon}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonTool;