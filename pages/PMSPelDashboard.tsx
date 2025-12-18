
import React from 'react';
import { ClipboardCheck, FileText, Download, Target, Calendar, AlertCircle, History } from 'lucide-react';

interface IndicatorRowProps {
  label: string;
  v2022: string | number;
  v2023: string | number;
  v2024: string | number;
  q1_25: string | number;
  q2_25: string | number;
  meta: string | number;
  unit?: string;
  reverse?: boolean; // Se menor valor for melhor
}

const IndicatorRow: React.FC<IndicatorRowProps> = ({ label, v2022, v2023, v2024, q1_25, q2_25, meta, unit = "", reverse = false }) => {
  const parseVal = (v: any) => {
    if (typeof v === 'number') return v;
    const clean = String(v).replace('%', '').replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(clean);
  };

  const numQ2 = parseVal(q2_25);
  const numMeta = parseVal(meta);
  
  let isMet = reverse ? numQ2 <= numMeta : numQ2 >= numMeta;
  if (isNaN(numQ2) || isNaN(numMeta)) isMet = true;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 text-sm font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{label}</td>
      <td className="py-3 px-4 text-xs text-center text-slate-400 font-mono italic">{v2022}{unit}</td>
      <td className="py-3 px-4 text-xs text-center text-slate-400 font-mono italic">{v2023}{unit}</td>
      <td className="py-3 px-4 text-xs text-center text-slate-500 font-mono font-bold border-r border-slate-100">{v2024}{unit}</td>
      <td className="py-3 px-4 text-sm text-center text-blue-500 font-mono">{q1_25}{unit}</td>
      <td className={`py-3 px-4 text-sm text-center font-black font-mono ${isMet ? 'text-emerald-600' : 'text-red-600'}`}>
        {q2_25}{unit}
      </td>
      <td className="py-3 px-4 text-sm text-center text-blue-700 font-bold bg-blue-50/30 font-mono">{meta}{unit}</td>
    </tr>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <tr className="bg-slate-50/80">
    <td colSpan={7} className="py-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-y border-slate-100">{title}</td>
  </tr>
);

const PMSPelDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Série Histórica & RDQA</h1>
            <p className="text-slate-500 text-sm">Evolução dos Indicadores (2022-2024) e Monitoramento 2025</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all print:hidden"
        >
          <Download size={16} /> Exportar Painel Completo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider sticky left-0 bg-slate-800 z-20">Indicador Estratégico</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-400">2022</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-400">2023</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-slate-300 border-r border-slate-700">2024</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-blue-200">1º Q 25</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center text-emerald-400">2º Q 25</th>
              <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-center bg-blue-700">Meta Final</th>
            </tr>
          </thead>
          <tbody>
            <SectionHeader title="Eixo 1: Atenção Primária e Previne Brasil" />
            <IndicatorRow label="ISF do Programa Previne Brasil" v2022="38,9%" v2023="51,13%" v2024="51,30%" q1_25="51,3%" q2_25="51,3" meta="80" />
            <IndicatorRow label="Equipes com min. 70% de usuários cadastrados" v2022="33%" v2023="60%" v2024="68,31%" q1_25="68,3%" q2_25="66%" meta="100" />
            <IndicatorRow label="Cobertura de saúde bucal na APS" v2022="38,2%" v2023="36,54%" v2024="35%" q1_25="40%" q2_25="44,3%" meta="38,2" />
            <IndicatorRow label="Equipes completas na RAPS" v2022="25%" v2023="25%" v2024="26%" q1_25="62,5%" q2_25="62,5%" meta="55" />
            <IndicatorRow label="Gasto com judicialização de medicamentos (R$)" v2022="620.569" v2023="568.720" v2024="536.810" q1_25="191.568" q2_25="286.174" meta="700.000" reverse />
            <IndicatorRow label="UBS que utilizam Rede Bem Cuidar" v2022="28" v2023="20" v2024="31" q1_25="34" q2_25="32" meta="50" />
            <IndicatorRow label="UBS com Conselhos Locais (CLS)" v2022="12" v2023="15" v2024="16" q1_25="17" q2_25="17" meta="25" />

            <SectionHeader title="Eixo 2: Estrutura e Tecnologia" />
            <IndicatorRow label="Idade média da frota de veículos (anos)" v2022="10" v2023="10" v2024="11" q1_25="13,6" q2_25="10,67" meta="7" reverse />
            <IndicatorRow label="Computadores novos adquiridos" v2022="0" v2023="288" v2024="60" q1_25="0" q2_25="0" meta="60" />

            <SectionHeader title="Eixo 3: Especialidades e Filas de Espera" />
            <IndicatorRow label="Pacientes aguardando consulta p/ especialista" v2022="37.621" v2023="58.933" v2024="65.093" q1_25="65.137" q2_25="59.751" meta="23.387" reverse />
            <IndicatorRow label="Tempo médio espera consulta oncologia (dias)" v2022="26" v2023="29" v2024="55" q1_25="13" q2_25="17" meta="30" reverse />
            <IndicatorRow label="Pacientes aguardando exames especializados" v2022="35.355" v2023="50.586" v2024="66.823" q1_25="67.000" q2_25="65.771" meta="21.606" reverse />
            <IndicatorRow label="Lista de espera para Ressonância" v2022="1.158" v2023="3.338" v2024="5.064" q1_25="5.287" q2_25="2.763" meta="0" reverse />
            <IndicatorRow label="Lista de espera para Tomografia" v2022="3.219" v2023="5.827" v2024="7.347" q1_25="6.595" q2_25="6.658" meta="1.000" reverse />
            <IndicatorRow label="Lista de espera para Mamografia" v2022="1.342" v2023="2.348" v2024="1.198" q1_25="1.229" q2_25="907" meta="0" reverse />
            <IndicatorRow label="Lista de espera para Ultrassonografia" v2022="12.392" v2023="16.112" v2024="20.763" q1_25="20.544" q2_25="20.739" meta="6.000" reverse />
            
            <SectionHeader title="Eixo 4: Urgência e Emergência (PS e SAMU)" />
            <IndicatorRow label="Fichas Azul/Verde no PS Pelotas (%)" v2022="38%" v2023="27,44%" v2024="26,52%" q1_25="3,37%" q2_25="14,99%" meta="30" reverse />
            <IndicatorRow label="Espera por leito clínico no PS (dias)" v2022="2,20" v2023="2,42" v2024="2,54" q1_25="2,75" q2_25="2,84" meta="1" reverse />
            <IndicatorRow label="Espera por leito de UTI no PS (dias)" v2022="0,95" v2023="1" v2024="1,51" q1_25="1,29" q2_25="1,44" meta="1" reverse />
            <IndicatorRow label="Tempo/resposta SAMU (minutos)" v2022="14,96" v2023="12,71" v2024="15,18" q1_25="16,56" q2_25="12,58" meta="12" reverse />
            <IndicatorRow label="Atendimentos/mês na UPA Areal" v2022="5.976" v2023="5.530" v2024="5.392" q1_25="5.067" q2_25="7.086" meta="5.976" />

            <SectionHeader title="Eixo 5: Vigilância e Ciclos de Vida" />
            <IndicatorRow label="Investigação de óbito infantil (%)" v2022="100%" v2023="100%" v2024="100%" q1_25="83%" q2_25="30%" meta="100" />
            <IndicatorRow label="Notificações de violência VIGEP" v2022="742" v2023="986" v2024="1192" q1_25="401" q2_25="394" meta="811" />
            <IndicatorRow label="Taxa de mortalidade infantil" v2022="9,97" v2023="11,35" v2024="14,92" q1_25="6,34" q2_25="8,98" meta="10" reverse />
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <AlertCircle className="text-blue-500 shrink-0" size={24} />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Nota Comparativa:</p>
          A tabela exibe a série histórica consolidada (2022-2024) para permitir a visualização da tendência dos indicadores antes do monitoramento quadrimestral de 2025. 
          As colunas 2022 a 2024 servem como base de comparação de longo prazo, enquanto as colunas 2025 mostram o desempenho imediato frente à meta anual.
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <FileText size={40} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-bold">Relatório Evolutivo Completo</h3>
            <p className="text-slate-400 text-sm">Painel estratégico consolidado - Pelotas/RS</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-700/50 px-4 py-2 rounded-lg">
          <Calendar size={14} /> Atualizado: Setembro 2025
        </div>
      </div>
    </div>
  );
};

export default PMSPelDashboard;
