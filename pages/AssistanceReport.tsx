
import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, Activity, ClipboardList, 
  Download, Filter, ChevronDown
} from 'lucide-react';

const AssistanceReport: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ps_monthly_detailed_stats');
    if (saved) setData(JSON.parse(saved));
    setLoading(false);
  }, []);

  const calculateTotal = (key: string): number => {
    if (!data) return 0;
    const values = Object.values(data) as any[];
    return values.reduce((acc: number, curr: any) => acc + (parseFloat(curr[key]) || 0), 0);
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Produção Assistencial</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Stethoscope size={16} className="text-blue-500"/>
            Análise de Atendimentos, Consultas e Exames Diagnósticos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all shadow-md print:hidden"
          >
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Acolhimentos Totais</p>
          <h2 className="text-3xl font-black text-slate-800">{calculateTotal('i1_acolhimento').toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Consultas Médicas</p>
          <h2 className="text-3xl font-black text-blue-600">{calculateTotal('i1_consultas').toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Taxa de Conversão</p>
          <h2 className="text-3xl font-black text-emerald-600">
            {((calculateTotal('i1_consultas') / (calculateTotal('i1_acolhimento') || 1)) * 100).toFixed(1)}%
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <ClipboardList size={18} className="text-blue-500"/> Produção por Especialidade
           </h3>
           <div className="space-y-3">
              {[
                { label: 'Clínica Médica', key: 'i5_clinica_medica' },
                { label: 'Pediatria', key: 'i5_pediatria' },
                { label: 'Cirurgia Vascular', key: 'i5_cirurgia_vascular' },
                { label: 'Ginecologia', key: 'i5_ginecologia' },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{calculateTotal(item.key).toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <Activity size={18} className="text-purple-500"/> Volume de Exames
           </h3>
           <div className="space-y-3">
              {[
                { label: 'Laboratoriais', key: 'i14_laboratoriais' },
                { label: 'Tomografias', key: 'i15_tomografias' },
                { label: 'Raio X', key: 'i15_raio_x' },
                { label: 'Ultrassom', key: 'i16_ultrasson' },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="font-bold text-slate-800">{calculateTotal(item.key).toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssistanceReport;
