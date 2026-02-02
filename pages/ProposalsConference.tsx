import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Settings, X, 
  Bookmark, Search,
  Calendar, Plus, Trash2, Edit3, Link as LinkIcon, Fingerprint,
  Info, Sparkles, Target, Zap
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
  score: number;
}

// 1. DICIONÁRIO DE CONTEXTO SEMÂNTICO (TAXONOMIA SUS)
const HEALTH_TAXONOMY: Record<string, string[]> = {
  'Vigilância e Controle': ['dengue', 'arbovirose', 'epidemiol', 'vacina', 'imuniza', 'sanitária', 'endemia', 'zoonose', 'escorpião', 'infecção', 'surto', 'agente de combate'],
  'Saúde Mental': ['caps', 'psicossocial', 'psicólogo', 'psiquiatr', 'droga', 'álcool', 'depressão', 'ansiedade', 'suicídio', 'acolhimento psicológico'],
  'Urgência e Emergência': ['upa', 'samu', 'pronto-socorro', 'emergência', 'trauma', 'urgência', 'ambulância', 'socorro', 'primeiros socorros'],
  'Atenção Primária': ['ubs', 'posto de saúde', 'prevenção', 'básica', 'agente comunitário', 'acs', 'esf', 'estratégia família'],
  'Materno Infantil': ['gestante', 'parto', 'pré-natal', 'criança', 'pediatria', 'amamentação', 'mortalidade infantil', 'bebê', 'puerpério'],
  'Infraestrutura': ['reforma', 'construção', 'equipamento', 'obra', 'manutenção', 'climatização', 'mobiliário', 'pintura', 'telhado', 'físico'],
  'Gestão e Financiamento': ['recurso', 'investimento', 'financeiro', 'gasto', 'custo', 'fundo', 'conselho', 'transparência', 'contratação', 'pessoal']
};

const ProposalsConference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drive' | 'database'>('database');
  const [driveLink, setDriveLink] = useState("");
  const [tempLink, setTempLink] = useState("");
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

  // 2. INDEXAÇÃO COM TAGS DE TEMA
  const planningIndex = useMemo(() => {
    const ppaRaw = localStorage.getItem('ps_ppa_full_data_v2');
    const rdqaRaw = localStorage.getItem('rdqa_full_indicators');
    
    const index: { label: string; type: 'PPA' | 'RDQA'; themes: string[] }[] = [];
    
    const extractThemes = (text: string) => {
      const themes: string[] = [];
      const lowerText = text.toLowerCase();
      Object.entries(HEALTH_TAXONOMY).forEach(([theme, keywords]) => {
        if (keywords.some(k => lowerText.includes(k))) themes.push(theme);
      });
      return themes;
    };

    const processItems = (raw: string | null, type: 'PPA' | 'RDQA', labelKey: string) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        const flatItems = type === 'PPA' ? Object.values(parsed).flat() : Object.values(parsed).flat();
        (flatItems as any[]).forEach(item => {
          const label = item[labelKey];
          if (label) {
            index.push({ 
              label, 
              type, 
              themes: extractThemes(label) 
            });
          }
        });
      } catch (e) { console.error(`Erro ao indexar ${type}`); }
    };

    processItems(ppaRaw, 'PPA', 'action');
    processItems(rdqaRaw, 'RDQA', 'label');

    return index;
  }, []); 

  // 3. MOTOR DE MATCH REFINADO (SCORING)
  const findPlanningLinks = (proposal: Proposal): MatchResult[] => {
    const title = proposal.title.toLowerCase();
    const desc = proposal.description.toLowerCase();
    const fullContent = `${title} ${desc}`;
    
    if (fullContent.length < 5) return [];

    const matches: MatchResult[] = [];
    const seenLabels = new Set<string>();

    // Identifica temas da proposta
    const proposalThemes: string[] = [];
    Object.entries(HEALTH_TAXONOMY).forEach(([theme, keywords]) => {
      if (keywords.some(k => fullContent.includes(k))) proposalThemes.push(theme);
    });

    planningIndex.forEach(planItem => {
      let score = 0;
      let reason = "";
      let matchTerm = "";

      // Critério A: Match de Tema (Contextual)
      const commonThemes = planItem.themes.filter(t => proposalThemes.includes(t));
      if (commonThemes.length > 0) {
        score += 2;
        reason = `Vínculo Temático: ${commonThemes[0]}`;
        matchTerm = commonThemes[0];
      }

      // Critério B: Match de Palavra-Chave Específica (Direct)
      const stopWords = ['para', 'com', 'pelo', 'pela', 'sobre', 'saúde', 'municipal', 'atendimento', 'melhorar', 'ampliar', 'serviço', 'proposta'];
      const words = fullContent.split(/\s+/).filter(w => w.length > 5 && !stopWords.includes(w));
      
      for (const word of words) {
        if (planItem.label.toLowerCase().includes(word)) {
          score += 3;
          reason = `Match Técnico: "${word}"`;
          matchTerm = word;
          break; // Pega o primeiro match forte
        }
      }

      if (score >= 2 && !seenLabels.has(planItem.label)) {
        matches.push({ 
          term: matchTerm, 
          label: planItem.label, 
          type: planItem.type, 
          reason, 
          score 
        });
        seenLabels.add(planItem.label);
      }
    });

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Apenas os 3 links mais fortes
  };

  useEffect(() => {
    const savedLink = localStorage.getItem('cms_conference_drive_link');
    if (savedLink) setDriveLink(savedLink);

    const savedProposals = localStorage.getItem('cms_conference_proposals_v2');
    if (savedProposals) {
      try { setProposals(JSON.parse(savedProposals)); } catch (e) { console.error("Erro ao carregar propostas."); }
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
    setIsAddingProposal(false);
    setEditingProposal(null);
    setAdminPassword("");
    setError("");
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
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20 h-[calc(100vh-120px)] flex flex-col">
      {/* HEADER PRINCIPAL */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <Bookmark size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="conf_main_title" defaultText="17ª Conferência Municipal" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
              <Zap size={16} className="text-indigo-500 animate-pulse"/>
              <EditableText id="conf_main_subtitle" defaultText="Rastreabilidade Semântica de Diretrizes" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onClick={() => setActiveTab('drive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Relatório (PDF)</button>
            <button onClick={() => setActiveTab('database')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'database' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Monitoramento</button>
          </div>
          <button onClick={() => setIsConfigOpen(true)} className="p-4 bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Settings size={22} /></button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        {activeTab === 'drive' ? (
          <iframe src={driveLink} className="w-full h-full border-none" title="Relatório da Conferência" />
        ) : (
          <div className="p-8 space-y-8 overflow-y-auto h-full bg-slate-50/30">
            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar diretriz por palavra ou tema (ex: Mental, Dengue)..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => { setProposalForm({ title: '', description: '', category: 'Eixo Geral', status: 'Aprovada' }); setIsAddingProposal(true); }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> Nova Proposta
              </button>
            </div>

            {/* LISTAGEM */}
            <div className="space-y-12 pb-10">
              {Object.entries(groupedProposals).map(([category, items]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4 border-l-[12px] border-indigo-600 pl-5 py-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(items as Proposal[]).map(p => {
                      const links = findPlanningLinks(p);

                      return (
                        <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col min-h-[280px]">
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${links.length > 0 ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                          
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex flex-wrap gap-2">
                                <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${p.status === 'Implementada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{p.status}</div>
                                {links.length > 0 && (
                                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                                      <Fingerprint size={10}/> Conexão Inteligente
                                   </div>
                                )}
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingProposal(p); setProposalForm(p); setIsAddingProposal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Editar"><Edit3 size={16} /></button>
                                <button onClick={() => { if(confirm("Excluir diretriz?")) persistProposals(proposals.filter(item => item.id !== p.id)); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Excluir"><Trash2 size={16} /></button>
                             </div>
                          </div>

                          <h4 className="text-lg font-black text-slate-800 leading-tight mb-3 uppercase tracking-tight">{p.title || '(Sem título)'}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium italic mb-6">"{p.description || '(Sem descrição)'}"</p>
                          
                          {/* VISUALIZAÇÃO DOS VÍNCULOS AUTOMÁTICOS (REFINADO) */}
                          {links.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <Target size={12} className="text-indigo-500"/> Rastreabilidade no Planejamento
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  {(links as MatchResult[]).map((link, idx) => (
                                    <div key={idx} className="group/link relative">
                                      <div className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-help flex items-center gap-2 ${link.type === 'PPA' ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${link.type === 'PPA' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                        {link.type} → {link.term.toUpperCase()}
                                      </div>
                                      {/* Tooltip de Razão do Match */}
                                      <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-2xl opacity-0 group-hover/link:opacity-100 transition-all pointer-events-none z-50 font-bold shadow-2xl border border-white/10 translate-y-2 group-hover/link:translate-y-0">
                                         <div className="flex items-center gap-2 text-indigo-400 mb-2 uppercase tracking-widest text-[8px]">
                                            <Sparkles size={10}/> {link.reason}
                                         </div>
                                         <p className="leading-tight text-slate-200">Encontrado em: <span className="text-white italic">{link.label}</span></p>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                          
                          {links.length === 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase italic">
                               <Info size={12}/> Sem correspondência direta no PPA/RDQA
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

      {/* MODAL CADASTRO / EDIÇÃO */}
      {isAddingProposal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddingProposal(false)}></div>
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col border border-slate-100 animate-scale-in">
             <div className="bg-slate-900 p-10 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl"><FileText size={32}/></div>
                   <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{editingProposal ? 'Ajustar Diretriz' : 'Nova Diretriz'}</h3>
                     <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-2">Sincronização com o Plano de Saúde</p>
                   </div>
                </div>
                <button onClick={() => setIsAddingProposal(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={36}/></button>
             </div>
             
             <div className="p-10 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Eixo Temático</label>
                    <input type="text" value={proposalForm.category} onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="Ex: Gestão e Financiamento" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Status</label>
                    <select value={proposalForm.status} onChange={(e) => setProposalForm({...proposalForm, status: e.target.value as any})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                      <option value="Aprovada">Aprovada</option>
                      <option value="Implementada">Implementada</option>
                      <option value="Em Análise">Em Análise</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Título da Proposta</label>
                  <input type="text" value={proposalForm.title} onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="Ex: Melhoria da Vigilância em Saúde" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Conteúdo do Relatório</label>
                  <textarea value={proposalForm.description} onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl h-32 font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm" placeholder="Descreva o que foi aprovado na conferência..." />
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <div className="max-w-xs mx-auto">
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black tracking-[0.3em] mb-4 text-xl outline-none focus:border-indigo-500" placeholder="****" />
                    {error && <p className="text-red-500 text-[10px] font-black text-center uppercase mb-4 animate-pulse">{error}</p>}
                    <button onClick={handleSaveProposal} className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Sincronizar Registro</button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-[32px] shadow-xl w-full max-w-2xl relative z-10 p-10 space-y-8 border border-slate-100 animate-scale-in">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter">Relatório Externo</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Link Visualizador (Drive)</label>
                <input type="text" value={tempLink} onChange={(e) => setTempLink(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cole o link aqui..." />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={() => { localStorage.setItem('cms_conference_drive_link', tempLink); setDriveLink(tempLink); setIsConfigOpen(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;