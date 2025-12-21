
import React, { useState, useEffect } from 'react';
import { 
  History, CheckCircle2, AlertCircle, ShieldCheck, Cpu, Users, 
  HeartPulse, Microscope, Download, Edit3, X, Save, Lock, Plus, Trash2
} from 'lucide-react';

interface IndicatorConfig {
  id: string;
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

const DEFAULT_INDICATORS: Record<string, IndicatorConfig[]> = {
  "Eixo 1: Atenção Primária": [
    { id: "isf", label: "ISF do Programa Previne Brasil", v2022: "38,9%", v2023: "51,13%", v2024: "51,30%", q1_25: "51,3%", q2_25: "51,3", meta: "80", unit: "%" },
    { id: "cad", label: "Equipes com min. 70% de usuários cadastrados", v2022: "33%", v2023: "60%", v2024: "68,31%", q1_25: "68,3%", q2_25: "66", meta: "100", unit: "%" },
    { id: "bucal", label: "Cobertura de saúde bucal na APS", v2022: "38,2%", v2023: "36,54%", v2024: "35%", q1_25: "40%", q2_25: "44,3", meta: "38,2", unit: "%" },
    { id: "nutri", label: "Utilização de recurso recebido para desenvolvimento de ações de alimentação e nutrição", v2022: "0", v2023: "0", v2024: "0", q1_25: "0", q2_25: "0", meta: "100", unit: "%" },
    { id: "raps", label: "Equipes completas na RAPS", v2022: "25%", v2023: "25%", v2024: "26%", q1_25: "62,5%", q2_25: "62,5", meta: "55", unit: "%" },
    { id: "rbc", label: "UBS que utilizam Rede Bem Cuidar", v2022: "28", v2023: "20", v2024: "31", q1_25: "34", q2_25: "32", meta: "50" },
    { id: "cls", label: "UBS com Conselhos Locais (CLS)", v2022: "12", v2023: "15", v2024: "16", q1_25: "17", q2_25: "17", meta: "25" },
    { id: "jud", label: "Gasto com judicialização de medicamentos (R$) - Diminuir o valor gasto", v2022: "620k", v2023: "568k", v2024: "536k", q1_25: "191k", q2_25: "286k", meta: "700k", reverse: true },
  ],
  "Eixo 2: Estrutura e Tecnologia": [
    { id: "frota", label: "Idade média da frota de veículos (anos)", v2022: "10", v2023: "10", v2024: "11", q1_25: "13,6", q2_25: "10,6", meta: "7", reverse: true },
    { id: "comp", label: "Computadores novos adquiridos", v2022: "0", v2023: "288", v2024: "60", q1_25: "0", q2_25: "0", meta: "60" },
  ],
  "Eixo 3: Especialidades e Filas": [
    { id: "esp", label: "Pacientes aguardando consulta p/ especialista", v2022: "37k", v2023: "58k", v2024: "65k", q1_25: "65k", q2_25: "59k", meta: "23k", reverse: true },
    { id: "onco", label: "Tempo médio espera consulta oncologia", v2022: "26", v2023: "29", v2024: "55", q1_25: "13", q2_25: "17", meta: "30", unit: " dias", reverse: true },
    { id: "exam", label: "Pacientes aguardando exames especializados", v2022: "35k", v2023: "50k", v2024: "66k", q1_25: "67k", q2_25: "65k", meta: "21k", reverse: true },
    { id: "res", label: "Lista de espera para Ressonância", v2022: "1.1k", v2023: "3.3k", v2024: "5.0k", q1_25: "5.2k", q2_25: "2.7k", meta: "0", reverse: true },
    { id: "tom", label: "Lista de espera para Tomografia", v2022: "3.2k", v2023: "5.8k", v2024: "7.3k", q1_25: "6.5k", q2_25: "6.6k", meta: "1k", reverse: true },
    { id: "ultra", label: "Lista de espera para Ultrassonografia", v2022: "12k", v2023: "16k", v2024: "20k", q1_25: "20k", q2_25: "20k", meta: "6k", reverse: true },
  ],
  "Eixo 4: Urgência e Emergência": [
    { id: "fichas", label: "Fichas Azul/Verde no PS Pelotas (%)", v2022: "38%", v2023: "27,4%", v2024: "26,5%", q1_25: "3,3%", q2_25: "14,9", meta: "30", unit: "%", reverse: true },
    { id: "leito_clin", label: "Espera por leito clínico no PS", v2022: "2,20", v2023: "2,42", v2024: "2,54", q1_25: "2,75", q2_25: "2,8", meta: "1", unit: " dias", reverse: true },
    { id: "leito_uti", label: "Espera por leito de UTI no PS", v2022: "0,95", v2023: "1", v2024: "1,51", q1_25: "1,29", q2_25: "1,4", meta: "1", unit: " dias", reverse: true },
    { id: "samu", label: "Tempo/resposta SAMU", v2022: "14,9", v2023: "12,7", v2024: "15,1", q1_25: "16,5", q2_25: "12,5", meta: "12", unit: " min", reverse: true },
    { id: "upa_areal", label: "Atendimentos/mês na UPA Areal", v2022: "5.9k", v2023: "5.5k", v2024: "5.3k", q1_25: "5.0k", q2_25: "7.0k", meta: "5.9k" },
  ]
};

const StrategicIndicator: React.FC<{ 
  config: IndicatorConfig; 
  onEdit: (config: IndicatorConfig) => void;
  onDelete: (id: string) => void;
}> = ({ 
  config, onEdit, onDelete
}) => {
  const { label, v2022, v2023, v2024, q1_25, q2_25, meta, unit = "", reverse = false } = config;

  const parseVal = (v: string) => {
    if (!v) return 0;
    // Remove símbolos e converte vírgula decimal para ponto
    const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, '');
    return parseFloat(clean);
  };

  const numQ2 = parseVal(q2_25);
  const numMeta = parseVal(meta);
  
  const isMet = reverse ? numQ2 <= numMeta : numQ2 >= numMeta;
  const hasValue = !isNaN(numQ2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      <div className="p-5 flex-1 relative">
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
          <button 
            onClick={() => onEdit(config)}
            className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
            title="Editar Indicador"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => onDelete(config.id)}
            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
            title="Excluir Indicador"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-sm font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors pr-10">
            {label}
          </h3>
          <div className={`p-1.5 rounded-full ${hasValue ? (isMet ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600') : 'bg-slate-50 text-slate-400'}`}>
            {hasValue ? (isMet ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />) : <History size={16} />}
          </div>
        </div>

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

const PMSPelDashboard: React.FC = () => {
  const [indicators, setIndicators] = useState<Record<string, IndicatorConfig[]>>(DEFAULT_INDICATORS);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorConfig | null>(null);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IndicatorConfig>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('rdqa_full_indicators');
    if (saved) {
      try {
        setIndicators(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar indicadores salvos", e);
      }
    }
  }, []);

  const saveToLocalStorage = (newIndicators: Record<string, IndicatorConfig[]>) => {
    localStorage.setItem('rdqa_full_indicators', JSON.stringify(newIndicators));
    setIndicators(newIndicators);
  };

  const handleOpenEdit = (config: IndicatorConfig) => {
    setEditingIndicator(config);
    setFormData(config);
    setAdminPassword("");
    setError("");
  };

  const handleOpenAdd = (eixo: string) => {
    setIsAdding(eixo);
    setFormData({
      id: `ind_${Date.now()}`,
      label: "",
      v2022: "-",
      v2023: "-",
      v2024: "-",
      q1_25: "-",
      q2_25: "-",
      meta: "0",
      unit: "",
      reverse: false
    });
    setAdminPassword("");
    setError("");
  };

  const handleConfirmSave = () => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha de administrador incorreta.");
      return;
    }

    const updatedIndicators = { ...indicators };
    
    if (isAdding) {
      updatedIndicators[isAdding] = [...updatedIndicators[isAdding], formData as IndicatorConfig];
    } else if (editingIndicator) {
      Object.keys(updatedIndicators).forEach(eixo => {
        updatedIndicators[eixo] = updatedIndicators[eixo].map(ind => 
          ind.id === editingIndicator.id ? (formData as IndicatorConfig) : ind
        );
      });
    }

    saveToLocalStorage(updatedIndicators);
    setEditingIndicator(null);
    setIsAdding(null);
  };

  const handleDelete = (id: string) => {
    const password = prompt("Digite a senha de administrador para excluir:");
    if (password === 'Conselho@2026') {
      const updatedIndicators = { ...indicators };
      Object.keys(updatedIndicators).forEach(eixo => {
        updatedIndicators[eixo] = updatedIndicators[eixo].filter(ind => ind.id !== id);
      });
      saveToLocalStorage(updatedIndicators);
    } else if (password !== null) {
      alert("Senha incorreta.");
    }
  };

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
            <p className="text-slate-500 text-sm mt-1 font-medium">Gestão Estratégica de Série Histórica e Metas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase">Status do Sistema</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sincronizado
            </p>
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
        {(Object.entries(indicators) as [string, IndicatorConfig[]][]).map(([eixo, list]) => (
          <React.Fragment key={eixo}>
            <div className="col-span-full mt-10 first:mt-0 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white shadow-sm bg-blue-600`}>
                   {eixo.includes("Primária") && <Users size={20} />}
                   {eixo.includes("Estrutura") && <Cpu size={20} />}
                   {eixo.includes("Filas") && <Microscope size={20} />}
                   {eixo.includes("Urgência") && <HeartPulse size={20} />}
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{eixo}</h2>
              </div>
              <button 
                onClick={() => handleOpenAdd(eixo)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200 print:hidden"
              >
                <Plus size={14} /> Novo Indicador
              </button>
            </div>
            {list.map(ind => (
              <StrategicIndicator 
                key={ind.id} 
                config={ind} 
                onEdit={handleOpenEdit} 
                onDelete={handleDelete} 
              />
            ))}
            {list.length === 0 && (
              <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-medium italic">
                Nenhum indicador cadastrado neste eixo.
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* MODAL DE GESTÃO (ADICIONAR / EDITAR) */}
      {(editingIndicator || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => {setEditingIndicator(null); setIsAdding(null);}}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                {isAdding ? <Plus size={18} /> : <Edit3 size={18} />}
                {isAdding ? `Novo Indicador: ${isAdding}` : 'Editar Configurações do Indicador'}
              </h3>
              <button onClick={() => {setEditingIndicator(null); setIsAdding(null);}} className="text-blue-400 hover:text-blue-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Título do Indicador</label>
                  <input 
                    type="text" 
                    value={formData.label || ""}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="Ex: Cobertura Vacinal..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Unidade (opcional)</label>
                  <input 
                    type="text" 
                    value={formData.unit || ""}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="Ex: %, dias, R$"
                  />
                </div>
                <div className="flex items-center gap-3 h-full pt-6">
                   <input 
                      type="checkbox" 
                      id="reverse"
                      checked={formData.reverse}
                      onChange={(e) => setFormData({...formData, reverse: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                   />
                   <label htmlFor="reverse" className="text-sm font-bold text-slate-600 cursor-pointer">Lógica Inversa (Meta é reduzir valor)</label>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <History size={12} /> Série Histórica Completa
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {['2022', '2023', '2024', 'Q1_25', 'Q2_25', 'Meta'].map((field) => {
                    // Mapeia os anos para a chave correta no objeto (v2022, v2023, v2024)
                    const key = field.match(/^\d{4}$/) ? `v${field}` : field.toLowerCase();
                    return (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">{field.replace('_', ' ')}</label>
                        <input 
                          type="text" 
                          value={(formData as any)[key] || ""}
                          onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                          className="w-full p-2 border border-slate-200 rounded-lg text-center font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider flex items-center gap-1">
                  <Lock size={12} /> Autenticação Necessária
                </label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Senha do Administrador"
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 sticky bottom-0 z-10">
              <button 
                onClick={() => {setEditingIndicator(null); setIsAdding(null);}}
                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmSave}
                className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {isAdding ? 'Adicionar Indicador' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER DE INFORMAÇÕES */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 mt-12 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110 duration-700"></div>
        <div className="z-10 flex items-center gap-5">
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black">Central de Indicadores</h3>
            <p className="text-slate-400 text-sm font-medium">Use os controles de administrador para manter a rede de saúde atualizada.</p>
          </div>
        </div>
        <div className="z-10 flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Modo de Edição Ativado
          </div>
          <div className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest text-blue-400">
            Persistência: LocalStorage
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMSPelDashboard;
