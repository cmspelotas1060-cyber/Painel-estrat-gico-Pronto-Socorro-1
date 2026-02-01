
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, Settings, X, 
  Bookmark, Search,
  Calendar, Plus, Trash2, Edit3, Link as LinkIcon, Fingerprint,
  Info, Sparkles, Filter
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
}

const ProposalsConference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drive' | 'database'>('database');
  const [docSource, setDocSource] = useState<'drive' | 'pdf'>('drive');
  const [driveLink, setDriveLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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

  // --- MOTOR DE RASTREABILIDADE (OPÇÃO 4: BUSCA POR PALAVRAS-CHAVE) ---

  // 1. Indexação dos termos de planejamento (PPA e RDQA) vindos do LocalStorage
  const planningIndex = useMemo(() => {
    const ppaRaw = localStorage.getItem('ps_ppa_full_data_v2');
    const rdqaRaw = localStorage.getItem('rdqa_full_indicators');
    
    const index: { label: string; type: 'PPA' | 'RDQA' }[] = [];
    
    if (ppaRaw) {
      try {
        const parsed = JSON.parse(ppaRaw);
        // Percorre todos os eixos do PPA
        Object.values(parsed).flat().forEach((item: any) => {
          if (item.action) index.push({ label: item.action, type: 'PPA' });
        });
      } catch (e) { console.warn("PPA não indexado."); }
    }

    if (rdqaRaw) {
      try {
        const parsed = JSON.parse(rdqaRaw);
        // Percorre todos os eixos do RDQA
        Object.values(parsed).flat().forEach((item: any) => {
          if (item.label) index.push({ label: item.label, type: 'RDQA' });
        });
      } catch (e) { console.warn("RDQA não indexado."); }
    }

    return index;
  }, []); 

  // 2. Função de Correspondência Automática (Fuzzy Search simplificado)
  const findPlanningLinks = (proposal: Proposal): MatchResult[] => {
    const content = `${proposal.title} ${proposal.description}`.toLowerCase();
    if (content.length < 5) return [];

    // Stopwords e termos genéricos para ignorar no match técnico
    const stopWords = ['para', 'com', 'pelo', 'pela', 'sobre', 'saúde', 'municipal', 'atendimento', 'melhorar', 'ampliar', 'reforma', 'serviço', 'proposta', 'implementar'];
    
    // Extrai palavras-chave significativas (> 4 letras)
    const keywords = content
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopWords.includes(w));

    const matches: MatchResult[] = [];
    const seenLabels = new Set<string>();

    keywords.forEach(word => {
      planningIndex.forEach(planItem => {
        if (planItem.label.toLowerCase().includes(word)) {
          if (!seenLabels.has(planItem.label)) {
            matches.push({ term: word, label: planItem.label, type: planItem.type });
            seenLabels.add(planItem.label);
          }
        }
      });
    });

    return matches.slice(0, 4); // Limita os resultados para manter o card limpo
  };

  useEffect(() => {
    const savedLink = localStorage.getItem('cms_conference_drive_link');
    if (savedLink) setDriveLink(savedLink);

    const savedSource = localStorage.getItem('cms_conference_doc_source');
    if (savedSource) setDocSource(savedSource as 'drive' | 'pdf');

    const savedProposals = localStorage.getItem('cms_conference_proposals_v2');
    if (savedProposals) {
      try {
        setProposals(JSON.parse(savedProposals));
      } catch (e) {
        console.error("Erro ao carregar propostas.");
      }
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
              <Calendar size={16} className="text-indigo-500"/>
              <EditableText id="conf_main_subtitle" defaultText="Monitoramento de Rastreabilidade Automática" />
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
            {/* BARRA DE FILTROS E AÇÕES */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filtrar por diretriz, eixo ou termo..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => { setProposalForm({ title: '', description: '', category: 'Eixo Geral', status: 'Aprovada' }); setIsAddingProposal(true); }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> Nova Diretriz
              </button>
            </div>

            {/* LISTAGEM DE PROPOSTAS */}
            <div className="space-y-12 pb-10">
              {Object.entries(groupedProposals).map(([category, items]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-4 border-l-[12px] border-indigo-600 pl-5 py-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ensure items is treated as an array of Proposal */}
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
                                      <Fingerprint size={10}/> Rastreabilidade Automática
                                   </div>
                                )}
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingProposal(p); setProposalForm(p); setIsAddingProposal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Editar"><Edit3 size={16} /></button>
                                <button onClick={() => { if(confirm("Excluir esta diretriz?")) persistProposals(proposals.filter(item => item.id !== p.id)); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Excluir"><Trash2 size={16} /></button>
                             </div>
                          </div>

                          <h4 className="text-lg font-black text-slate-800 leading-tight mb-3 uppercase tracking-tight">{p.title || '(Sem título)'}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium italic mb-6">"{p.description || '(Sem descrição)'}"</p>
                          
                          {/* VISUALIZAÇÃO DOS VÍNCULOS AUTOMÁTICOS (FUZZY MATCH) */}
                          {links.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <LinkIcon size={12}/> Vínculos Detectados no Planejamento
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  {/* Fix: Ensure links is treated as MatchResult[] before mapping */}
                                  {(links as MatchResult[]).map((link, idx) => (
                                    <div key={idx} className="group/link relative">
                                      <div className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold border transition-all cursor-help flex items-center gap-2 ${link.type === 'PPA' ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm' : 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${link.type === 'PPA' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                        {link.term.toUpperCase()} → {link.type}
                                      </div>
                                      {/* Detalhe do Match no Hover */}
                                      <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-2xl opacity-0 group-hover/link:opacity-100 transition-all pointer-events-none z-50 font-bold shadow-2xl border border-white/10 translate-y-2 group-hover/link:translate-y-0">
                                         <p className="text-indigo-400 mb-1 uppercase tracking-widest text-[8px]">Correspondência encontrada em {link.type}:</p>
                                         <span className="leading-tight">{link.label}</span>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                          
                          {links.length === 0 && (
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase italic">
                               <Info size={12}/> Nenhuma correspondência direta encontrada na base
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
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col border border-slate-100">
             <div className="bg-slate-900 p-10 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl"><FileText size={32}/></div>
                   <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{editingProposal ? 'Editar Diretriz' : 'Nova Diretriz'}</h3>
                     <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-2">Sincronização de Decisões Oficiais</p>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Título da Diretriz</label>
                  <input type="text" value={proposalForm.title} onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="Resumo da Proposta..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Texto Integral / Descrição</label>
                  <textarea value={proposalForm.description} onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl h-32 font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm" placeholder="Cole aqui o texto da proposta aprovada na conferência..." />
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <div className="max-w-xs mx-auto">
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black tracking-[0.3em] mb-4 text-xl outline-none focus:border-indigo-500" placeholder="****" />
                    {error && <p className="text-red-500 text-[10px] font-black text-center uppercase mb-4 animate-pulse">{error}</p>}
                    <button onClick={handleSaveProposal} className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Salvar Diretriz</button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO DO RELATÓRIO PDF */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-[32px] shadow-xl w-full max-w-2xl relative z-10 p-10 space-y-8 border border-slate-100 animate-scale-in">
            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter">Configuração de Relatório Externo</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Link do Relatório (Google Drive)</label>
                <input type="text" value={tempLink} onChange={(e) => setTempLink(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cole o link de visualização..." />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={() => { localStorage.setItem('cms_conference_drive_link', tempLink); setDriveLink(tempLink); setIsConfigOpen(false); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Salvar Link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
