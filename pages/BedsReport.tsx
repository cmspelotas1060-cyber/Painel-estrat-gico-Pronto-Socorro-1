
import React, { useEffect, useState } from 'react';
import { 
  BedDouble, UserCheck, AlertCircle, Download
} from 'lucide-react';

const BedsReport: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) setData(JSON.parse(saved));
    setLoading(false);
  }, []);

  const getAverage = (key: string) => {
    if (!data) return 0;
    const values = Object.values(data).map((p: any) => parseFloat(p[key]) || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Leitos e Fluxo de Internação</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <BedDouble size={16} className="text-emerald-500"/>
            Taxas de Ocupação, Permanência e Giro de Leitos
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold shadow-md print:hidden"
        >
          <Download size={16} /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Ocupação Clínica (Média)</p>
          <div className="text-3xl font-black text-slate-800">{getAverage('i10_clinico_adulto').toFixed(1)}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Ocupação UTI (Média)</p>
          <div className="text-3xl font-black text-red-600">{getAverage('i10_uti_adulto').toFixed(1)}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Média Permanência (Dias)</p>
          <div className="text-3xl font-black text-blue-600">{getAverage('i11_mp_clinico_adulto').toFixed(1)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Aguardando Leito (Total)</p>
          <div className="text-3xl font-black text-orange-500">
            {Object.values(data).reduce((acc: number, curr: any) => acc + (parseFloat(curr.i12_aguardando_leito) || 0), 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 font-bold text-slate-700">
          <AlertCircle size={18} className="text-amber-500" /> Alertas de Gestão de Leitos
        </div>
        <div className="p-6">
           {getAverage('i10_clinico_adulto') > 90 && (
             <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex gap-3">
               <AlertCircle className="shrink-0" />
               <p className="text-sm font-medium"><strong>Alta Ocupação Clínica:</strong> A média anual está acima de 90%, indicando saturação iminente e necessidade de revisão de fluxos de alta.</p>
             </div>
           )}
           <div className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex gap-3">
             <UserCheck className="shrink-0" />
             <p className="text-sm font-medium"><strong>Fluxo de Altas:</strong> Total acumulado de altas registradas no período: {Object.values(data).reduce((acc: number, curr: any) => acc + (parseFloat(curr.i12_alta) || 0), 0).toLocaleString()} pacientes.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BedsReport;
