
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, Edit3, Trash2, X, Save, Lock, 
  Bookmark, Tag, Share2, Loader2, CheckCircle, ChevronDown, 
  ChevronUp, FileText, ClipboardList, Info, BarChart, Upload, FileJson, AlertCircle
} from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Aprovada' | 'Em Análise' | 'Implementada' | 'Rejeitada';
  author: string;
  index?: string;
}

const Users = (props: any) => <ClipboardList {...props} />;
const MapPin = (props: any) => <ClipboardList {...props} />;
const HeartPulse = (props: any) => <ClipboardList {...props} />;
const Ambulance = (props: any) => <ClipboardList {...props} />;
const Microscope = (props: any) => <ClipboardList {...props} />;
const Hospital = (props: any) => <ClipboardList {...props} />;

const AXES = [
  { id: "Eixo 1", name: "Democratização e Controle Social", icon: <Users size={20}/> },
  { id: "Eixo 2", name: "Territorialização dos Serviços do SUS", icon: <MapPin size={20}/> },
  { id: "Eixo 3", name: "Atenção Primária e Saúde Mental", icon: <HeartPulse size={20}/> },
  { id: "Eixo 4", name: "Urgência e Emergência de Pelotas", icon: <Ambulance size={20}/> },
  { id: "Eixo 5", name: "Serviços Intermediários", icon: <Microscope size={20}/> },
  { id: "Eixo 6", name: "Serviços Hospitalares", icon: <Hospital size={20}/> }
];

const INITIAL_PROPOSALS: Proposal[] = [
  { id: "e1-1", index: "01", title: "Aprimoramento na formação dos conselheiros", description: "Capacitação através do Programa Municipal em Controle Social para o SUS.", category: "Eixo 1", status: "Aprovada", author: "17ª Conferência" },
  { id: "e1-2", index: "02", title: "Fortalecimento dos Conselhos Locais", description: "Fomentar a participação estimulando a criação e reativação em todas as UBS.", category: "Eixo 1", status: "Aprovada", author: "17ª Conferência" },
  { id: "e1-12", index: "12", title: "Ampliação da Telemedicina", description: "Ampliar os serviços de Telemedicina em Pelotas para aumentar o acesso especializado.", category: "Eixo 1", status: "Aprovada", author: "17ª Conferência" },
  { id: "e2-1", index: "01", title: "Ampliação das Farmácias Distritais", description: "Prioridade em áreas não assistidas e funcionamento aos finais de semana.", category: "Eixo 2", status: "Aprovada", author: "17ª Conferência" },
  { id: "e3-1", index: "01", title: "Concurso Público 100% ESF", description: "Garantir equipes de estratégia de saúde da família em todo o território municipal.", category: "Eixo 3", status: "Aprovada", author: "17ª Conferência" },
  { id: "e4-19", index: "19", title: "Conclusão do Novo Pronto Socorro", description: "Garantir abertura para ampliar serviços de urgência e emergência.", category: "Eixo 4", status: "Aprovada", author: "17ª Conferência" }
];

const ProposalsConference: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAxes, setExpandedAxes] = useState<string[]>(["Eixo 1"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<Partial<Proposal>>({});
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cms_conference_proposals_v2');
    if (saved) {
      setProposals(JSON.parse(saved));
    } else {
      setProposals(INITIAL_PROPOSALS);
    }
  }, []);

  const persist = (data: Proposal[]) => {
    setProposals(data);
    localStorage.setItem('cms_conference_proposals_v2', JSON.stringify(data));
  };

  const toggleAxis = (axisId: string) => {
    setExpandedAxes(prev => 
      prev.includes(axisId) ? prev.filter(a => a !== axisId) : [...prev, axisId]
    );
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const payload = JSON.stringify({ 
        full_db: { cms_conference_proposals_v2: JSON.stringify(proposals) }, 
        ts: Date.now() 
      });
      const bytes = new TextEncoder().encode(payload);
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes); writer.close();
      const compressedBuffer = await new Response(stream.readable).arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(compressedBuffer))).replace(/\+/g, '-').replace(/\//g, '_');
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=gz_${base64}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 4000);
    } catch (e) {
      alert('Erro ao gerar link.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    if (!formData.title || !formData.category) { setError("Campos obrigatórios ausentes."); return; }

    let updated: Proposal[];
    if (editingProposal) {
      updated = proposals.map(p => p.id === editingProposal.id ? { ...p, ...formData } as Proposal : p);
    } else {
      updated = [...proposals, { ...formData, id: Date.now().toString(), status: 'Aprovada' } as Proposal];
    }
    persist(updated);
    setIsModalOpen(false);
    setAdminPassword("");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let importedData: any[] = [];

        if (file.name.endsWith('.json')) {
          importedData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          importedData = lines.slice(1).filter(l => l.trim()).map(line => {
            const values = line.split(',');
            return {
              id: Date.now().toString() + Math.random(),
              title: values[0]?.trim(),
              description: values[1]?.trim(),
              category: values[2]?.trim() || "Eixo 1",
              status: "Aprovada",
              index: values[3]?.trim()
            };
          });
        }

        if (Array.isArray(importedData)) {
          setFormData({ ...formData, description: JSON.stringify(importedData) } as any); // Temporário para a lógica de confirmação
          setIsImportModalOpen(true);
          setError("");
        } else {
          alert("Formato de arquivo inválido. Use JSON ou CSV.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo. Verifique a formatação.");
      }
    };
    reader.readAsText(file);
  };

  const confirmBatchImport = (append: boolean) => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    try {
      const imported = JSON.parse(formData.description || "[]");
      const normalized = imported.map((p: any) => ({
        id: p.id || (Date.now() + Math.random()).toString(),
        title: p.title || "Sem Título",
        description: p.description || "",
        category: p.category || "Eixo 1",
        status: p.status || "Aprovada",
        index: p.index || "",
        author: p.author || "Importado"
      }));

      const updated = append ? [...proposals, ...normalized] : normalized;
      persist(updated);
      setIsImportModalOpen(false);
      setAdminPassword("");
      setFormData({});
      alert(`${normalized.length} propostas importadas com sucesso!`);
    } catch (e) {
      setError("Erro ao processar dados importados.");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Implementada': return 'bg-emerald-500 text-white';
      case 'Rejeitada': return 'bg-red-500 text-white';
      case 'Em Análise': return 'bg-amber-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const filteredProposals = (axisId: string) => proposals.filter(p => 
    p.category === axisId && 
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* HEADER ESTATÍSTICO */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
            <Bookmark size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">17ª Conferência Municipal</h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <FileText size={14} className="text-indigo-500"/> {proposals.length} Propostas Registradas
               </span>
               <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-l pl-4 border-slate-200">
                 <BarChart size={14} className="text-emerald-500"/> Monitoramento Ativo
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 print:hidden">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv" onChange={handleFileImport} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all border-2 bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm"
          >
            <Upload size={18} /> IMPORTAR ARQUIVO
          </button>

          <button 
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all border-2 ${
              shareSuccess ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {isSharing ? <Loader2 className="animate-spin" size={18}/> : shareSuccess ? <CheckCircle size={18}/> : <Share2 size={18} />}
            {shareSuccess ? 'LINK COPIADO' : 'COMPARTILHAR'}
          </button>
          
          <button 
            onClick={() => { setIsModalOpen(true); setEditingProposal(null); setFormData({ category: 'Eixo 1' }); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
          >
            <Plus size={20} /> ADICIONAR
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar em todas as diretrizes da conferência..." 
          className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none text-lg font-medium shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* AXES ACCORDIONS */}
      <div className="space-y-4">
        {AXES.map((axis) => {
          const axisProposals = filteredProposals(axis.id);
          const isExpanded = expandedAxes.includes(axis.id);
          
          if (searchTerm && axisProposals.length === 0) return null;

          return (
            <div key={axis.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleAxis(axis.id)}
                className={`w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'} transition-all`}>
                    {axis.icon}
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">{axis.id}</span>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">{axis.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">
                    {axisProposals.length} PROPOSTAS
                  </span>
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 pt-0 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {axisProposals.map((p) => (
                      <div key={p.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded leading-none">
                            {axis.id}.{p.index || 'XX'}
                          </span>
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getStatusStyle(p.status)}`}>
                               {p.status}
                             </span>
                             <div className="flex opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                <button onClick={() => { setEditingProposal(p); setFormData(p); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Edit3 size={14}/></button>
                                <button onClick={() => { if(confirm("Remover proposta?")) persist(proposals.filter(x => x.id !== p.id)) }} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                             </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-2 leading-tight pr-8">{p.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in flex flex-col">
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><FileJson size={20} /> Confirmar Importação em Massa</h3>
              <button onClick={() => setIsImportModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800">
                <AlertCircle className="shrink-0" size={20}/>
                <div className="text-sm">
                  <p className="font-bold mb-1 uppercase text-[10px]">Atenção</p>
                  <p>Você está prestes a carregar uma lista de propostas. Escolha se deseja manter os dados atuais ou substituí-los completamente.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase"><Lock size={12}/> Senha do Conselho</label>
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Digite a senha para autorizar" 
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => confirmBatchImport(true)} 
                  className="py-3 px-4 rounded-xl font-bold bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors text-sm"
                >
                  ADICIONAR ÀS ATUAIS
                </button>
                <button 
                  onClick={() => confirmBatchImport(false)} 
                  className="py-3 px-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 text-sm"
                >
                  SUBSTITUIR TUDO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT/ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <FileText size={20} />
                {editingProposal ? "Editar Diretriz" : "Nova Proposta de Gestão"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-indigo-400 hover:text-indigo-600"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Eixo Relacionado</label>
                  <select 
                    value={formData.category || ""} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {AXES.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status de Monitoramento</label>
                  <select 
                    value={formData.status || "Aprovada"} 
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none font-bold"
                  >
                    <option value="Aprovada">Aprovada</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Implementada">Implementada</option>
                    <option value="Rejeitada">Rejeitada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo da Proposta</label>
                <input 
                  type="text" 
                  value={formData.title || ""} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                  placeholder="Título curto e direto..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Texto Completo / Detalhamento</label>
                <textarea 
                  rows={4}
                  value={formData.description || ""} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
                  placeholder="Descreva as ações necessárias, recursos e prazos estimados..."
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase"><Lock size={12}/> Autenticação Necessária</label>
                <input 
                  type="password" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Senha do Conselho" 
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-colors">
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
