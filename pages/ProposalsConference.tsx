import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ExternalLink, Settings, Save, Lock, X, 
  Bookmark, Share2, Loader2, CheckCircle, ChevronDown, 
  ChevronUp, BarChart, ClipboardList, Info, AlertCircle, Maximize2, Search, HelpCircle, Upload, FileDigit,
  Database, Calendar, Plus, Trash2, Edit3, GripVertical
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

const ProposalsConference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drive' | 'database'>('database');
  const [docSource, setDocSource] = useState<'drive' | 'pdf'>('drive');
  const [driveLink, setDriveLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editorMode, setEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  useEffect(() => {
    const handleModeChange = () => setEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);

    const savedLink = localStorage.getItem('cms_conference_drive_link');
    if (savedLink) setDriveLink(savedLink);

    const savedSource = localStorage.getItem('cms_conference_doc_source');
    if (savedSource) setDocSource(savedSource as 'drive' | 'pdf');

    const savedProposals = localStorage.getItem('cms_conference_proposals_v2');
    if (savedProposals) {
      try {
        setProposals(JSON.parse(savedProposals));
      } catch (e) {
        console.error("Erro ao carregar propostas locais");
      }
    }

    const cachedPdf = sessionStorage.getItem('cms_current_pdf_blob');
    if (cachedPdf) {
      setPdfUrl(cachedPdf);
      setPdfName(sessionStorage.getItem('cms_current_pdf_name'));
    }

    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const persistProposals = (updated: Proposal[]) => {
    setProposals(updated);
    localStorage.setItem('cms_conference_proposals_v2', JSON.stringify(updated));
  };

  const handleSaveConfig = () => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }
    
    if (docSource === 'drive') {
      let processedLink = tempLink.trim();
      if (processedLink.includes('/edit')) {
        processedLink = processedLink.replace(/\/edit.*$/, '/preview');
      }
      setDriveLink(processedLink);
      localStorage.setItem('cms_conference_drive_link', processedLink);
    }

    localStorage.setItem('cms_conference_doc_source', docSource);
    setIsConfigOpen(false);
    setAdminPassword("");
    setError("");
  };

  const handleSaveProposal = () => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }

    let updated: Proposal[];
    if (editingProposal) {
      updated = proposals.map(p => p.id === editingProposal.id ? { 
        ...p, 
        ...proposalForm,
        title: proposalForm.title ?? p.title,
        description: proposalForm.description ?? p.description,
        category: proposalForm.category ?? p.category,
        status: (proposalForm.status ?? p.status) as any
      } as Proposal : p);
    } else {
      const newProp: Proposal = {
        id: Date.now().toString(),
        title: proposalForm.title || '',
        description: proposalForm.description || '',
        category: proposalForm.category || 'Eixo Geral',
        status: (proposalForm.status as any) || 'Aprovada'
      };
      updated = [...proposals, newProp];
    }

    persistProposals(updated);
    setIsAddingProposal(false);
    setEditingProposal(null);
    setProposalForm({ title: '', description: '', category: 'Eixo Geral', status: 'Aprovada' });
    setAdminPassword("");
    setError("");
  };

  const handleDeleteProposal = (id: string) => {
    if (!confirm("Deseja excluir esta proposta permanentemente?")) return;
    const pw = prompt("Digite a senha de administrador para confirmar:");
    if (pw !== 'Conselho@2026') {
      alert("Senha incorreta.");
      return;
    }
    persistProposals(proposals.filter(p => p.id !== id));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setPdfName(file.name);
      setDocSource('pdf');
      sessionStorage.setItem('cms_current_pdf_name', file.name);
    }
  };

  // Agrupamento por categoria (Eixos)
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
      {/* HEADER PADRONIZADO CONFERÊNCIA */}
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
              <EditableText id="conf_main_subtitle" defaultText="Documentação e Diretrizes Oficiais" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mr-2">
            <button onClick={() => setActiveTab('drive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Relatório (PDF/Drive)</button>
            <button onClick={() => setActiveTab('database')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'database' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Propostas Aprovadas</button>
          </div>
          <button onClick={() => { setIsConfigOpen(true); setTempLink(driveLink); }} className="p-4 bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm"><Settings size={22} /></button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        {activeTab === 'drive' ? (
          <>
            {(docSource === 'drive' ? driveLink : pdfUrl) ? (
              <div className="w-full h-full relative group">
                <iframe src={docSource === 'drive' ? driveLink : pdfUrl!} className="w-full h-full border-none" title="Document Viewer" loading="lazy" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><FileText size={48} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Nenhum documento configurado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">Para visualizar o relatório da conferência, você pode integrar um link do Google Drive ou carregar um arquivo PDF.</p>
                </div>
                <button onClick={() => setIsConfigOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Configurar Documento Agora</button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 space-y-8 overflow-y-auto h-full bg-slate-50/30">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Filtrar por título, eixo ou conteúdo..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-2xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest flex items-center gap-2"><Database size={16} /> {proposals.length} Propostas</div>
                <button 
                  onClick={() => { setProposalForm({ title: '', description: '', category: 'Eixo Geral', status: 'Aprovada' }); setEditingProposal(null); setIsAddingProposal(true); }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  <Plus size={18} /> Cadastrar Proposta
                </button>
              </div>
            </div>

            {Object.keys(groupedProposals).length === 0 ? (
              <div className="py-20 text-center">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><FileDigit size={40} /></div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma proposta encontrada no banco local.</p>
              </div>
            ) : (
              <div className="space-y-12 pb-10">
                {/* FIX: Explicitly cast Object.entries to resolve 'unknown' type inference on 'items' */}
                {(Object.entries(groupedProposals) as [string, Proposal[]][]).map(([category, items]) => (
                  <div key={category} className="space-y-6">
                    <div className="flex items-center gap-4 border-l-[12px] border-indigo-600 pl-5 py-1">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{category}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {items.map(p => (
                        <div key={p.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                          
                          <div className="flex justify-between items-start mb-4">
                             <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">{p.status}</div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setEditingProposal(p); setProposalForm(p); setIsAddingProposal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteProposal(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                             </div>
                          </div>

                          <h4 className="text-lg font-black text-slate-800 leading-tight mb-4 uppercase tracking-tight">{p.title || '(Sem título)'}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium italic flex-1">"{p.description || '(Sem descrição)'}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DynamicNotes sectionId="conferencia_propostas_local" />
          </div>
        )}
      </div>

      {/* MODAL CADASTRO PROPOSTA */}
      {isAddingProposal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddingProposal(false)}></div>
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col border border-slate-100 animate-scale-in">
             <div className="bg-slate-900 p-10 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl"><FileText size={32}/></div>
                   <div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{editingProposal ? 'Editar Proposta' : 'Nova Proposta Aprovada'}</h3>
                     <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mt-2">Cadastro de Diretrizes Oficiais</p>
                   </div>
                </div>
                <button onClick={() => setIsAddingProposal(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={36}/></button>
             </div>
             
             <div className="p-10 space-y-8 overflow-y-auto bg-slate-50/50 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Eixo / Categoria</label>
                    <input 
                      type="text" 
                      value={proposalForm.category} 
                      onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: Eixo 1 - Atenção Primária"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Status da Proposta</label>
                    <select 
                      value={proposalForm.status} 
                      onChange={(e) => setProposalForm({...proposalForm, status: e.target.value as any})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Aprovada">Aprovada</option>
                      <option value="Implementada">Implementada</option>
                      <option value="Em Análise">Em Análise</option>
                      <option value="Rejeitada">Rejeitada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Título da Proposta</label>
                  <input 
                    type="text" 
                    value={proposalForm.title} 
                    onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})}
                    className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Resumo da diretriz aprovada..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Conteúdo Detalhado da Proposta</label>
                  <textarea 
                    value={proposalForm.description} 
                    onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})}
                    className="w-full p-6 bg-white border border-slate-200 rounded-[32px] h-48 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Descreva o texto integral da proposta conforme ata da conferência..."
                  />
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <div className="max-w-xs mx-auto text-center space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Senha de Autorização</label>
                    <input 
                      type="password" 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-center font-black text-2xl tracking-[0.3em] outline-none focus:border-indigo-500"
                      placeholder="****"
                    />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase flex items-center justify-center gap-1 animate-pulse"><AlertCircle size={14}/> {error}</p>}
                    <button 
                      onClick={handleSaveProposal}
                      className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4"
                    >
                      <Save size={20}/> {editingProposal ? 'Salvar Edição' : 'Cadastrar na Base'}
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl relative z-10 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-lg uppercase">Configurar Fonte do Relatório</h3>
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setDocSource('drive')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${docSource === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Link Google Drive</button>
              <button onClick={() => setDocSource('pdf')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${docSource === 'pdf' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Upload PDF Local</button>
            </div>
            
            {docSource === 'drive' ? (
              <input type="text" value={tempLink} onChange={(e) => setTempLink(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="Cole o link de visualização do Google Drive..." />
            ) : (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                 <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handlePdfUpload} />
                 <Upload className="mx-auto text-slate-400 mb-2" />
                 <p className="text-sm font-bold text-slate-600">{pdfName || "Selecionar Arquivo PDF"}</p>
              </div>
            )}

            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border rounded-xl text-center font-bold" placeholder="Senha do Conselho" />
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            
            <div className="flex gap-3">
              <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 border rounded-xl font-bold">Cancelar</button>
              <button onClick={handleSaveConfig} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold">Salvar Configuração</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ProposalsConference;