
import React from 'react';
import { 
  History, Target, TrendingUp, TrendingDown, CheckCircle2, 
  AlertCircle, ShieldCheck, Cpu, Users, HeartPulse, Microscope,
  ArrowRight, Download
} from 'lucide-react';

interface IndicatorProps {
  label: string;
  v2022: string;
  v2023: string;
  v2024: string;
  q1_25: string;
  q2_25: string;
  meta: string;
  unit?: string;
  reverse?: boolean;
}

const StrategicIndicator: React.FC<IndicatorProps> = ({ 
  label, v2022, v2023, v2024, q1_25, q2_25, meta, unit = "", reverse = false 
}) => {
  const parseVal = (v: string) => {
    const clean = v.replace('%', '').replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(clean);
  };

  const numQ2 = parseVal(q2_25);
  const numMeta = parseVal(meta);
  
  const isMet = reverse ? numQ2 <= numMeta : numQ2 >= numMeta;
  const hasValue = !isNaN(numQ2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Header do Card */}
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
            {label}
          </h3>
          <div className={`p-1.5 rounded-full ${hasValue ? (isMet ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600') : 'bg-slate-50 text-slate-400'}`}>
            {hasValue ? (isMet ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />) : <History size={16} />}
          </div>
        </div>

        {/* Valor Principal e Meta */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Status 2º Quadrimestre</span>
            <div className={`text-3xl font-black ${hasValue ? (isMet ? 'text-emerald-600' : 'text-red-600') : 'text-slate-400'}`}>
              {q2_25}{unit}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">Meta 2025</span>
            <div className="text-lg font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-lg border border-blue-100 inline-block">
              {meta}{unit}
            </div>
          </div>
        </div>
      </div>

      {/* Série Histórica (Rodapé do Card) */}
      <div className="bg-slate-50 border-t border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-2">
            <History size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Série Histórica</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">2022</p>
            <p className="text-xs font-medium text-slate-500">{v2022}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">2023</p>
            <p className="text-xs font-medium text-slate-500">{v2023}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">2024</p>
            <p className="text-xs font-bold text-slate-600">{v2024}</p>
          </div>
          <div className="text-center bg-blue-100/50 rounded p-0.5 border border-blue-100">
            <p className="text-[9px] font-bold text-blue-400 uppercase">1º Q 25</p>
            <p className="text-xs font-black text-blue-600">{q1_25}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
  <div className="col-span-full mt-8 first:mt-0 mb-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl text-white shadow-sm`} style={{ backgroundColor: color }}>
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h2>
    </div>
  </div>
);

const PMSPelDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Monitoramento RDQA</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Comparativo de Série Histórica e Metas 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase">Última Atualização</p>
            <p className="text-sm font-bold text-slate-700">Setembro 2025</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            <Download size={18} /> Exportar Painel
          </button>
        </div>
      </div>

      {/* GRID DE INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <SectionHeading title="Eixo 1: Atenção Primária" icon={Users} color="#3b82f6" />
        <StrategicIndicator label="ISF do Programa Previne Brasil" v2022="38,9%" v2023="51,13%" v2024="51,30%" q1_25="51,3%" q2_25="51,3" meta="80" unit="%" />
        <StrategicIndicator label="Equipes com min. 70% de usuários cadastrados" v2022="33%" v2023="60%" v2024="68,31%" q1_25="68,3%" q2_25="66" meta="100" unit="%" />
        <StrategicIndicator label="Cobertura de saúde bucal na APS" v2022="38,2%" v2023="36,54%" v2024="35%" q1_25="40%" q2_25="44,3" meta="38,2" unit="%" />
        <StrategicIndicator label="Equipes completas na RAPS" v2022="25%" v2023="25%" v2024="26%" q1_25="62,5%" q2_25="62,5" meta="55" unit="%" />
        <StrategicIndicator label="UBS que utilizam Rede Bem Cuidar" v2022="28" v2023="20" v2024="31" q1_25="34" q2_25="32" meta="50" />
        <StrategicIndicator label="UBS com Conselhos Locais (CLS)" v2022="12" v2023="15" v2024="16" q1_25="17" q2_25="17" meta="25" />
        <StrategicIndicator label="Gasto com judicialização de medicamentos (R$)" v2022="620k" v2023="568k" v2024="536k" q1_25="191k" q2_25="286k" meta="700k" reverse />

        <SectionHeading title="Eixo 2: Estrutura e Tecnologia" icon={Cpu} color="#f59e0b" />
        <StrategicIndicator label="Idade média da frota de veículos (anos)" v2022="10" v2023="10" v2024="11" q1_25="13,6" q2_25="10,6" meta="7" reverse />
        <StrategicIndicator label="Computadores novos adquiridos" v2022="0" v2023="288" v2024="60" q1_25="0" q2_25="0" meta="60" />

        <SectionHeading title="Eixo 3: Especialidades e Filas" icon={Microscope} color="#8b5cf6" />
        <StrategicIndicator label="Pacientes aguardando consulta p/ especialista" v2022="37k" v2023="58k" v2024="65k" q1_25="65k" q2_25="59k" meta="23k" reverse />
        <StrategicIndicator label="Tempo médio espera consulta oncologia" v2022="26" v2023="29" v2024="55" q1_25="13" q2_25="17" meta="30" unit=" dias" reverse />
        <StrategicIndicator label="Pacientes aguardando exames especializados" v2022="35k" v2023="50k" v2024="66k" q1_25="67k" q2_25="65k" meta="21k" reverse />
        <StrategicIndicator label="Lista de espera para Ressonância" v2022="1.1k" v2023="3.3k" v2024="5.0k" q1_25="5.2k" q2_25="2.7k" meta="0" reverse />
        <StrategicIndicator label="Lista de espera para Tomografia" v2022="3.2k" v2023="5.8k" v2024="7.3k" q1_25="6.5k" q2_25="6.6k" meta="1k" reverse />
        <StrategicIndicator label="Lista de espera para Ultrassonografia" v2022="12k" v2023="16k" v2024="20k" q1_25="20k" q2_25="20k" meta="6k" reverse />

        <SectionHeading title="Eixo 4: Urgência e Emergência" icon={HeartPulse} color="#ef4444" />
        <StrategicIndicator label="Fichas Azul/Verde no PS Pelotas (%)" v2022="38%" v2023="27,4%" v2024="26,5%" q1_25="3,3%" q2_25="14,9" meta="30" unit="%" reverse />
        <StrategicIndicator label="Espera por leito clínico no PS" v2022="2,20" v2023="2,42" v2024="2,54" q1_25="2,75" q2_25="2,8" meta="1" unit=" dias" reverse />
        <StrategicIndicator label="Espera por leito de UTI no PS" v2022="0,95" v2023="1" v2024="1,51" q1_25="1,29" q2_25="1,4" meta="1" unit=" dias" reverse />
        <StrategicIndicator label="Tempo/resposta SAMU" v2022="14,9" v2023="12,7" v2024="15,1" q1_25="16,5" q2_25="12,5" meta="12" unit=" min" reverse />
        <StrategicIndicator label="Atendimentos/mês na UPA Areal" v2022="5.9k" v2023="5.5k" v2024="5.3k" q1_25="5.0k" q2_25="7.0k" meta="5.9k" />

      </div>

      {/* FOOTER DE INFORMAÇÕES */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
        <div className="z-10 flex items-center gap-5">
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black">Consolidado Estratégico</h3>
            <p className="text-slate-400 text-sm font-medium">Os dados acima refletem a eficiência operacional da rede de saúde.</p>
          </div>
        </div>
        <div className="z-10 flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Monitoramento Ativo
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest text-blue-400">
            Base: Quadrimestral 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMSPelDashboard;
