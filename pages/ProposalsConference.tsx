
import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Edit3, Trash2, X, Save, Lock, 
  CheckCircle2, Clock, AlertCircle, Bookmark, Tag, Share2, Loader2, CheckCircle
} from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Aprovada' | 'Em Análise' | 'Rejeitada';
  author: string;
}

const CATEGORIES = ["Atenção Básica", "Gestão", "Financiamento", "Urgência e Emergência", "Recursos Humanos", "Saúde Mental"];

const DEFAULT_PROPOSALS: Proposal[] = [
  { 
    id: "1", 
    title: "Expansão do Horário das UBS", 
    description: "Implementar o terceiro turno em 5 unidades polo para desafogar o Pronto-Socorro em casos de fichas azuis e verdes.", 
    category: "Atenção Básica", 
    status: "Aprovada", 
    author: "Eixo 1 - Gestão" 
  },
  { 
    id: "2", 
    title: "Concurso para Médicos Especialistas", 
    description: "Abertura de edital para contratação imediata de neurologistas e cardiologistas para a rede municipal.", 
    category: "Recursos Humanos", 
    status: "Em Análise", 
    author: "Eixo 3 - Trabalho" 
  }
];

const ProposalsConference: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<Partial<Proposal>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  // Share states
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cms_conference_proposals');
    if (saved) {
      try {
        setProposals(JSON.parse(saved));
      } catch (e) {
        setProposals(DEFAULT_PROPOSALS);
      }
    } else {
      setProposals(DEFAULT_PROPOSALS);
    }
  }, []);

  const persist = (data: Proposal[]) => {
    setProposals(data);
    localStorage.setItem('cms_conference_proposals', JSON.stringify(data));
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const payload = JSON.stringify({ 
        full_db: { cms_conference_proposals: JSON.stringify(proposals) }, 
        ts: Date.now() 
      });

      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer)))
                      .replace(/\+/g, '-')
                      .replace(/\//g, '_');
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar link de compartilhamento.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    let updated: Proposal[];
    if (editingProposal) {
      updated = proposals.map(p => p.id === editingProposal.id ? { ...p, ...formData } as Proposal : p);
    } else {
      const newProposal: Proposal = {
        id: Date.now().toString(),
        title: formData.title!,
        description: formData.description!,
        category: formData.category!,
        status: (formData.status as any) || "Em Análise",
        author: formData.author || "Anônimo"
      };
      updated = [...proposals, newProposal];
    }

    persist(updated);
    setIsModalOpen(false);
    setEditingProposal(null);
    setFormData({});
    setAdminPassword("");
    setError("");
  };

  const handleDelete = (id: string) => {
    if (prompt("Senha para excluir proposta:") === 'Conselho@2026') {
      const updated = proposals.filter(p => p.id !== id);
      persist(updated);
    } else {
      alert("Acesso negado.");
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Todas" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Aprovada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejeitada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-100">
            <Bookmark size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">17ª Conferência Municipal</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitoramento de Propostas e Deliberações</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 print:hidden">
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all border-2 ${
              shareSuccess 
                ? 'bg-emerald-50 border-emerald-400 text-emerald-600' 
                : 'bg-white border-purple-100 text-purple-600 hover:bg-purple-50 shadow-sm'
            }`}
          >
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK DAS PROPOSTAS COPIADO' : 'COMPARTILHAR PROPOSTAS'}
          </button>
          
          <button 
            onClick={() => { setIsModalOpen(true); setEditingProposal(null); setFormData({ status: 'Em Análise' }); }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all"
          >
            <Plus size={20} /> NOVA PROPOSTA
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por título ou conteúdo..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none appearance-none font-medium"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="Todas">Todas Categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProposals.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(p.status)}`}>
                {p.status}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                <button onClick={() => { setEditingProposal(p); setFormData(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{p.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6">{p.description}</p>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
                <Tag size={12} className="text-purple-500" /> {p.category}
              </div>
              <div className="text-[10px] text-slate-400 italic font-medium">Ref: {p.author}</div>
            </div>
          </div>
        ))}
        
        {filteredProposals.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="p-4 bg-slate-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-slate-300">
              <Search size={32} />
            </div>
            <h3 className="font-bold text-slate-600">Nenhuma proposta encontrada</h3>
            <p className="text-slate-400 text-sm">Ajuste os filtros ou crie uma nova propostas para este eixo.</p>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-purple-50 p-6 border-b border-purple-100 flex items-center justify-between">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Bookmark size={20} />
                {editingProposal ? "Editar Proposta" : "Cadastrar Proposta da Conferência"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400 hover:text-purple-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título da Proposta</label>
                <input 
                  type="text" 
                  value={formData.title || ""} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold"
                  placeholder="Ex: Ampliação do Quadro de Médicos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria/Eixo</label>
                  <select 
                    value={formData.category || ""} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">Selecionar...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Atual</label>
                  <select 
                    value={formData.status || "Em Análise"} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Em Análise">Em Análise</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Rejeitada">Rejeitada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição Detalhada</label>
                <textarea 
                  rows={4}
                  value={formData.description || ""} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm leading-relaxed"
                  placeholder="Descreva o objetivo da proposta e os resultados esperados..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Autor/Referência</label>
                <input 
                  type="text" 
                  value={formData.author || ""} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  placeholder="Ex: Grupo de Trabalho - Gestão"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase">
                  <Lock size={12}/> Autenticação Necessária
                </label>
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" 
                  placeholder="Senha do Conselho" 
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold bg-purple-600 text-white shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-colors">
                <Save size={18} /> Salvar Proposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
