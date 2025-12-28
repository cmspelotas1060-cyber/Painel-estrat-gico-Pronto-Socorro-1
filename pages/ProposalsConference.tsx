
import React, { useState, useEffect } from 'react';
import { 
  FileText, ExternalLink, Settings, Save, Lock, X, 
  Bookmark, Share2, Loader2, CheckCircle, ChevronDown, 
  ChevronUp, BarChart, ClipboardList, Info, AlertCircle, Maximize2, Search
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

const ProposalsConference: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drive' | 'database'>('drive');
  const [driveLink, setDriveLink] = useState("");
  const [tempLink, setTempLink] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  // Dados do Banco de Dados (Legado/Opcional)
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedLink = localStorage.getItem('cms_conference_drive_link');
    if (savedLink) setDriveLink(savedLink);

    const savedProposals = localStorage.getItem('cms_conference_proposals_v2');
    if (savedProposals) {
      try {
        setProposals(JSON.parse(savedProposals));
      } catch (e) {
        console.error("Erro ao carregar propostas locais");
      }
    }
  }, []);

  const handleSaveConfig = () => {
    if (adminPassword !== 'Conselho@2026') {
      setError("Senha incorreta.");
      return;
    }
    
    // Converte links normais do Drive para links de Preview
    let processedLink = tempLink;
    if (processedLink.includes('docs.google.com')) {
      if (processedLink.includes('/edit')) {
        processedLink = processedLink.replace(/\/edit.*$/, '/preview');
      } else if (!processedLink.endsWith('/preview')) {
        processedLink = processedLink.split('?')[0].replace(/\/$/, '') + '/preview';
      }
    }

    setDriveLink(processedLink);
    localStorage.setItem('cms_conference_drive_link', processedLink);
    setIsConfigOpen(false);
    setAdminPassword("");
    setTempLink("");
    setError("");
  };

  const getDriveIcon = () => {
    if (driveLink.includes('spreadsheets')) return <BarChart className="text-emerald-500" />;
    return <FileText className="text-blue-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 h-[calc(100vh-120px)] flex flex-col">
      
      {/* HEADER E CONTROLES */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <Bookmark size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">17ª Conferência Municipal</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Documentação e Diretrizes Oficiais</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-4">
            <button 
              onClick={() => setActiveTab('drive')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ARQUIVO DRIVE
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'database' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              BANCO DE DADOS
            </button>
          </div>

          <button 
            onClick={() => { setIsConfigOpen(true); setTempLink(driveLink); }}
            className="p-3 bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all"
            title="Configurar Link do Drive"
          >
            <Settings size={20} />
          </button>
          
          {driveLink && (
            <a 
              href={driveLink.replace('/preview', '/edit')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all text-xs"
            >
              <ExternalLink size={16} /> ABRIR NO DRIVE
            </a>
          )}
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        
        {activeTab === 'drive' ? (
          <>
            {driveLink ? (
              <iframe 
                src={driveLink} 
                className="w-full h-full border-none"
                allow="autoplay"
                title="Google Drive Document"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <FileText size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Nenhum documento integrado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Para visualizar o relatório da conferência, clique no ícone de engrenagem e cole o link de compartilhamento do Google Drive.
                  </p>
                </div>
                <button 
                  onClick={() => setIsConfigOpen(true)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Configurar Documento Agora
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 space-y-6 overflow-y-auto h-full">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                {/* Fixed: Added Search to lucide-react imports */}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar propostas já cadastradas..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-2">
                <Info size={16} /> {proposals.length} propostas extraídas no banco local
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {proposals
                 .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
                 .map(p => (
                 <div key={p.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                    <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">{p.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{p.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 group-hover:line-clamp-none transition-all">{p.description}</p>
                 </div>
               ))}
               {proposals.length === 0 && (
                 <div className="col-span-full py-20 text-center text-slate-400 italic">
                   Use a aba "ARQUIVO DRIVE" para consulta direta do documento oficial.
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURAÇÃO DO LINK */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden animate-fade-in">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={20} /> Integração Google Drive</h3>
              <button onClick={() => setIsConfigOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-xs leading-relaxed">
                <p className="font-bold mb-1 uppercase tracking-wider flex items-center gap-1"><Info size={14}/> Como obter o link?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra seu arquivo no Google Drive.</li>
                  <li>Clique em <strong>Compartilhar</strong>.</li>
                  <li>Altere para "Qualquer pessoa com o link".</li>
                  <li>Copie o link e cole abaixo.</li>
                </ol>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link do Documento (Docs ou Sheets)</label>
                <input 
                  type="text" 
                  value={tempLink}
                  onChange={(e) => setTempLink(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                  placeholder="https://docs.google.com/document/d/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Lock size={12}/> Senha do Conselho</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Senha de autorização"
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="flex-1 py-4 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveConfig}
                className="flex-1 py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Salvar Integração
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProposalsConference;
