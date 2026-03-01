
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import { 
  FileText, Settings, X, 
  Bookmark, Search,
  Calendar, Plus, Trash2, Edit3, Link as LinkIcon, Fingerprint,
  Info, Sparkles, Target, Zap, Activity, Brain, ShieldAlert,
  Save
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Aprovada' | 'Em Análise' | 'Implementada' | 'Rejeitada';
}

interface MatchResult {
  term: string;
  label: string;
  type: 'PPA' | 'RDQA';
  reason: string;
  score: number; // 0 a 10
  strength: 'Forte' | 'Média' | 'Conceitual';
}

// 1. MAPA DE SINÔNIMOS E ADJACÊNCIA SEMÂNTICA (Ontologia de Saúde)
const SEMANTIC_MAP: Record<string, string[]> = {
  'Vigilância': ['dengue', 'arbovirose', 'epidemiol', 'vacina', 'imuniza', 'sanitária', 'endemia', 'zoonose', 'escorpião', 'infecção', 'surto', 'agente', 'combate', 'fumacê', 'controle de vetores'],
  'Psicossocial': ['caps', 'mental', 'psicólogo', 'psiquiatr', 'droga', 'álcool', 'depressão', 'ansiedade', 'suicídio', 'acolhimento', 'terapêutico'],
  'Emergência': ['upa', 'samu', 'pronto-socorro', 'emergência', 'trauma', 'urgência', 'ambulância', 'socorro', 'primeiros', 'resgate', 'grave', 'choque'],
  'Primária': ['ubs', 'posto', 'prevenção', 'básica', 'comunitário', 'acs', 'esf', 'família', 'visita', 'domiciliar', 'hiperdia'],
  'Gestante': ['parto', 'pré-natal', 'criança', 'pediatria', 'amamentação', 'infantil', 'bebê', 'maternidade', 'obstetrícia', 'puerpério'],
  'Infra': ['reforma', 'construção', 'equipamento', 'obra', 'manutenção', 'climatização', 'mobiliário', 'pintura', 'telhado', 'físico', 'estrutura'],
  'Gestão': ['recurso', 'investimento', 'financeiro', 'gasto', 'custo', 'fundo', 'conselho', 'transparência', 'contratação', 'pessoal', 'rh', 'folha', 'processo']
};

const ProposalsConference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drive' | 'database'>('database');
  const [driveLink, setDriveLink] = useState("");
  const [tempLink, setDriveLinkTemp] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  const [isAddingProposal, setIsAddingProposal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [proposalForm, setProposalForm] = useState<Partial<Proposal>>({
    title: '',
    description: '',
    category: 'Eixo Geral',
    status: 'Aprovada'
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. MOTOR DE NORMALIZAÇÃO DE TEXTO (Remove ruído e foca no radical)
  const normalize = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9 ]/g, "") // Remove símbolos
      .split(/\s+/)
      .filter(w => w.length > 3); // Remove palavras curtas (de, para, com...)
  };

  // 3. INDEXAÇÃO INTELIGENTE DO PLANEJAMENTO
  const planningData = useMemo(() => {
    const ppaParsed = storage.getSync('ps_ppa_full_data_v2');
    const rdqaParsed = storage.getSync('rdqa_full_indicators');
    
    const items: { label: string; type: 'PPA' | 'RDQA'; tokens: string[] }[] = [];
    
    const processParsed = (parsed: any, type: 'PPA' | 'RDQA', key: string) => {
      if (!parsed) return;
      try {
        const list = Object.values(parsed).flat() as any[];
        list.forEach(item => {
          if (item[key]) {
            items.push({ 
              label: item[key], 
              type, 
              tokens: normalize(item[key]) 
            });
          }
        });
      } catch (e) {}
    };

    processParsed(ppaParsed, 'PPA', 'action');
    processParsed(rdqaParsed, 'RDQA', 'label');
    return items;
  }, []);

  // 4. ALGORITMO DE SCORING SEMÂNTICO
  const crossReference = (proposal: Proposal): MatchResult[] => {
    const propTokens = normalize(`${proposal.title} ${proposal.description}`);
    if (propTokens.length === 0) return [];

    const matches: MatchResult[] = [];
    const seen = new Set<string>();

    planningData.forEach(planItem => {
      let score = 0;
      let matchTerm = "";
      let reason = "";

      // Camada 1: Match de Radical Direto (Ex: "Dengue" <-> "Dengue") - Peso 5
      const directIntersection = propTokens.filter(t => planItem.tokens.includes(t));
      if (directIntersection.length > 0) {
        score += 5;
        matchTerm = directIntersection[0];
        reason = `Match Técnico Direto: "${matchTerm}"`;
      }

      // Camada 2: Match Conceitual (Sinônimos/Ontologia) - Peso 3
      Object.entries(SEMANTIC_MAP).forEach(([concept, terms]) => {
        const propHasConcept = propTokens.some(t => terms.some(term => t.includes(term)));
        const planHasConcept = planItem.tokens.some(t => terms.some(term => t.includes(term)));
        
        if (propHasConcept && planHasConcept) {
          score += 3;
          if (!matchTerm) {
            matchTerm = concept;
            reason = `Convergência Temática: "${concept}"`;
          }
        }
      });

      if (score >= 3 && !seen.has(planItem.label)) {
        const strength = score >= 7 ? 'Forte' : score >= 5 ? 'Média' : 'Conceitual';
        matches.push({
          term: matchTerm.toUpperCase(),
          label: planItem.label,
          type: planItem.type,
          reason,
          score,
          strength
        });
        seen.add(planItem.label);
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  useEffect(() => {
    const savedLink = localStorage.getItem('cms_conference_drive_link');
    if (savedLink) setDriveLink(savedLink);
    const savedProposals = storage.getSync('cms_conference_proposals_v2');
    if (savedProposals) {
      setProposals(savedProposals);
    }
  }, []);

  const persistProposals = (updated: Proposal[]) => {
    setProposals(updated);
    localStorage.setItem('cms_conference_proposals_v2', JSON.stringify(updated));
  };

  const handleSaveProposal = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    let updated: Proposal[];
    if (editingProposal) {
      updated = proposals.map(p => p.id === editingProposal.id ? { ...p, ...proposalForm } as Proposal : p);
    } else {
      updated = [...proposals, { ...proposalForm, id: Date.now().toString() } as Proposal];
    }
    persistProposals(updated);
    setIsAddingProposal(false); setEditingProposal(null); setAdminPassword(""); setError("");
  };

  const groupedProposals = proposals
    .filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as Record<string, Proposal[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 h-[calc(100vh-120px)] flex flex-col">
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain size={120} />
        </div>
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shrink-0">
             <Target size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="conf_main_title" defaultText="17ª Conferência" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={16} className="text-indigo-500 animate-pulse"/>
              Cross-Referencing de Planejamento Ativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('drive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Relatório PDF</button>
            <button onClick={() => setActiveTab('database')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'database' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Monitoramento</button>
          </div>
          <button onClick={() => setIsConfigOpen(true)} className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Settings size={22} /></button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden relative">
        {activeTab === 'drive' ? (
          <iframe src={driveLink} className="w-full h-full border-none" title="Relatório da Conferência" />
        ) : (
          <div className="p-10 space-y-10 overflow-y-auto h-full bg-slate-50/30">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="relative flex-1 max-w-3xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Pesquise por termos técnicos ou diretrizes (Ex: Dengue, CAPS, UPA)..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700 shadow-inner" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => { setProposalForm({ title: '', description: '', category: 'Eixo Geral', status: 'Aprovada' }); setIsAddingProposal(true); }}
                className="px-8 py-4 bg-slate-900 text-white rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3"
              >
                <Plus size={20} /> Nova Diretriz
              </button>
            </div>

            <div className="space-y-16 pb-12">
              {Object.entries(groupedProposals).map(([category, items]) => (
                <div key={category} className="space-y-8">
                  <div className="flex items-center gap-4 border-l-[14px] border-indigo-600 pl-6 py-1">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(items as Proposal[]).map(p => {
                      const crossLinks = crossReference(p);

                      return (
                        <div key={p.id} className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col min-h-[320px]">
                          {/* Indicador de Força de Vínculo na lateral */}
                          <div className={`absolute top-0 left-0 w-2 h-full transition-all ${crossLinks.length > 0 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                          
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex flex-wrap gap-2">
                                <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 ${p.status === 'Implementada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{p.status}</div>
                                {crossLinks.length > 0 && (
                                   <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-100">
                                      <Fingerprint size={14}/> Sincronizado
                                   </div>
                                )}
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingProposal(p); setProposalForm(p); setIsAddingProposal(true); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit3 size={20} /></button>
                                <button onClick={() => { if(confirm("Excluir diretriz?")) persistProposals(proposals.filter(item => item.id !== p.id)); }} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                             </div>
                          </div>

                          <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 uppercase tracking-tight">{p.title || '(Sem título)'}</h4>
                          <p className="text-base text-slate-500 leading-relaxed font-medium italic mb-8 border-l-4 border-slate-100 pl-4">"{p.description || '(Sem descrição)'}"</p>
                          
                          {/* MOTOR DE CROSS-REFERENCING REFINADO */}
                          {crossLinks.length > 0 && (
                            <div className="mt-auto pt-6 border-t border-slate-50 space-y-4">
                               <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <Brain size={14} className="text-indigo-500"/> Rastreabilidade do Planejamento
                               </div>
                               <div className="grid grid-cols-1 gap-3">
                                  {crossLinks.map((link, idx) => (
                                    <div key={idx} className="group/link relative flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all cursor-help">
                                      <div className={`w-3 h-3 rounded-full shrink-0 ${link.type === 'PPA' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]'}`}></div>
                                      <div className="flex-1 min-w-0">
                                         <p className="text-[10px] font-black text-slate-800 uppercase truncate">{link.type}: {link.label}</p>
                                         <p className="text-[9px] font-bold text-indigo-500 uppercase flex items-center gap-1.5 mt-0.5">
                                            <Zap size={10}/> {link.reason} 
                                            <span className="text-slate-300 mx-1">•</span> 
                                            Força: {link.strength}
                                         </p>
                                      </div>
                                      {/* Barra de progresso da força do match */}
                                      <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                        <div className={`h-full ${link.score >= 7 ? 'bg-emerald-500 w-full' : link.score >= 5 ? 'bg-amber-500 w-2/3' : 'bg-indigo-400 w-1/3'}`}></div>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                          
                          {crossLinks.length === 0 && (
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3 text-[11px] font-black text-slate-300 uppercase italic">
                               <ShieldAlert size={14}/> Diretriz sem vínculo identificado no plano atual
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <DynamicNotes sectionId="conferencia_propostas_local" />
          </div>
        )}
      </div>

      {/* MODAL CADASTRO REFINADO */}
      {isAddingProposal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddingProposal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col border border-slate-100 animate-scale-in">
             <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-8">
                   <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl"><FileText size={36}/></div>
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{editingProposal ? 'Ajustar Diretriz' : 'Nova Diretriz'}</h3>
                     <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.2em] mt-3">Sincronização de Decisões Estratégicas</p>
                   </div>
                </div>
                <button onClick={() => setIsAddingProposal(false)} className="p-4 hover:bg-white/10 rounded-full transition-all"><X size={44}/></button>
             </div>
             
             <div className="p-12 space-y-8 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Eixo Temático</label>
                    <input type="text" value={proposalForm.category} onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm" placeholder="Ex: Gestão e Financiamento" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Status de Execução</label>
                    <select value={proposalForm.status} onChange={(e) => setProposalForm({...proposalForm, status: e.target.value as any})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm">
                      <option value="Aprovada">Aprovada pela Conferência</option>
                      <option value="Implementada">Implementada no Plano</option>
                      <option value="Em Análise">Em Análise Técnica</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Título da Proposta (Curto)</label>
                  <input type="text" value={proposalForm.title} onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm" placeholder="Ex: Ampliação do Serviço de Saúde Mental" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Texto Integral da Diretriz</label>
                  <textarea value={proposalForm.description} onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})} className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl h-44 font-medium text-slate-700 outline-none focus:border-indigo-500 resize-none shadow-sm" placeholder="Descreva aqui o detalhamento técnico aprovado..." />
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <div className="max-w-md mx-auto text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Autenticação do Conselho de Saúde</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 bg-slate-100 border-2 border-slate-200 rounded-[24px] text-center font-black tracking-[0.5em] mb-6 text-2xl outline-none focus:border-indigo-500" placeholder="****" />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase mb-6 animate-pulse">{error}</p>}
                    <button onClick={handleSaveProposal} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4">
                       <Save size={24}/> Registrar Diretriz
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO DRIVE */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-[40px] shadow-xl w-full max-w-2xl relative z-10 p-12 space-y-8 border border-slate-100">
            <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tighter">Relatório de Conferência Externo</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">URL do Visualizador PDF (Google Drive)</label>
                <input type="text" value={tempLink} onChange={(e) => setDriveLinkTemp(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold outline-none focus:border-indigo-500" placeholder="Cole o link compartilhado..." />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-5 border-2 border-slate-200 rounded-3xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={() => { localStorage.setItem('cms_conference_drive_link', tempLink); setDriveLink(tempLink); setIsConfigOpen(false); }} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Sincronizar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
