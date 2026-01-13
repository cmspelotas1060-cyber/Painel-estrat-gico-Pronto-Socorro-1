
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ExternalLink, Settings, Save, Lock, X, 
  Bookmark, Share2, Loader2, CheckCircle, ChevronDown, 
  ChevronUp, BarChart, ClipboardList, Info, AlertCircle, Maximize2, Search, HelpCircle, Upload, FileDigit,
  Database, Calendar
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

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
  const [docSource, setDocSource] = useState<'drive' | 'pdf'>('drive');
  const [driveLink, setDriveLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [tempLink, setTempLink] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        console.error("Erro ao carregar propostas locais");
      }
    }

    const cachedPdf = sessionStorage.getItem('cms_current_pdf_blob');
    if (cachedPdf) {
      setPdfUrl(cachedPdf);
      setPdfName(sessionStorage.getItem('cms_current_pdf_name'));
    }
  }, []);

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
            <button onClick={() => setActiveTab('drive')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Visualizador</button>
            <button onClick={() => setActiveTab('database')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === 'database' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Banco Local</button>
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
          <div className="p-8 space-y-6 overflow-y-auto h-full bg-slate-50/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Pesquisar propostas no banco local..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-2"><Database size={16} /> {proposals.length} itens no banco</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {proposals.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                 <div key={p.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">{p.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{p.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3">{p.description}</p>
                 </div>
               ))}
            </div>
            <DynamicNotes sectionId="conferencia_propostas" />
          </div>
        )}
      </div>

      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl relative z-10 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-lg uppercase">Configurar Fonte</h3>
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setDocSource('drive')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${docSource === 'drive' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>Google Drive</button>
              <button onClick={() => setDocSource('pdf')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${docSource === 'pdf' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>PDF Local</button>
            </div>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 border rounded-xl" placeholder="Senha do Conselho" />
            <div className="flex gap-3"><button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 border rounded-xl">Cancelar</button><button onClick={handleSaveConfig} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
