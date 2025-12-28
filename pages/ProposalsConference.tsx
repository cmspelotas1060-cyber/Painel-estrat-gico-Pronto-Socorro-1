
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ExternalLink, Settings, Save, Lock, X, 
  Bookmark, Share2, Loader2, CheckCircle, ChevronDown, 
  ChevronUp, BarChart, ClipboardList, Info, AlertCircle, Maximize2, Search, HelpCircle, Upload, FileDigit,
  Database
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
  const [docSource, setDocSource] = useState<'drive' | 'pdf'>('drive');
  const [driveLink, setDriveLink] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [tempLink, setTempLink] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados do Banco de Dados (Legado/Opcional)
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

    // PDFs locais não persistem bem em localStorage por causa do tamanho.
    // Carregamos do sessionStorage se disponível na sessão atual
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
      if (!tempLink.includes('docs.google.com')) {
        setError("O link deve ser um documento válido do Google Docs ou Sheets.");
        return;
      }

      let processedLink = tempLink.trim();

      if (processedLink.includes('/pubhtml') || processedLink.includes('/pub')) {
        if (processedLink.includes('spreadsheets') && !processedLink.includes('widget=')) {
          processedLink += (processedLink.includes('?') ? '&' : '?') + 'widget=true&headers=false';
        }
      } else {
        if (processedLink.includes('/edit')) {
          processedLink = processedLink.replace(/\/edit.*$/, '/preview');
        } else if (!processedLink.includes('/preview')) {
          const parts = processedLink.split('?');
          if (!parts[0].endsWith('/')) parts[0] += '/';
          processedLink = parts[0] + 'preview' + (parts[1] ? '?' + parts[1] : '');
        }
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
      
      // Armazenar apenas o nome para referência. 
      // O blob em si é mantido em memória pela URL do objeto.
      sessionStorage.setItem('cms_current_pdf_name', file.name);
      
      // Nota: Para persistência real entre sessões, precisaríamos de uma URL estável ou base64 (se < 5MB).
      // Por simplicidade e performance, usamos ObjectURL.
    } else {
      alert("Por favor, selecione um arquivo PDF válido.");
    }
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
              VISUALIZADOR
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
            title="Configurar Fonte do Documento"
          >
            <Settings size={20} />
          </button>
          
          {(docSource === 'drive' ? driveLink : pdfUrl) && (
            <button 
              onClick={() => {
                if (docSource === 'drive') {
                  window.open(driveLink.replace('/preview', '/edit').replace('/pubhtml', '/edit'), '_blank');
                } else if (pdfUrl) {
                  window.open(pdfUrl, '_blank');
                }
              }}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all text-xs"
            >
              <ExternalLink size={16} /> ABRIR INTEGRAL
            </button>
          )}
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
        
        {activeTab === 'drive' ? (
          <>
            {(docSource === 'drive' ? driveLink : pdfUrl) ? (
              <div className="w-full h-full relative group">
                <iframe 
                  src={docSource === 'drive' ? driveLink : pdfUrl!} 
                  className="w-full h-full border-none"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  title="Document Viewer"
                  loading="lazy"
                />
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                   <div className="bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-2 shadow-sm">
                     <Info size={12}/> {docSource === 'drive' ? 'Documento do Google Drive' : `Arquivo PDF: ${pdfName}`}
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <FileText size={48} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Nenhum documento configurado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Para visualizar o relatório da conferência, você pode integrar um link do Google Drive ou carregar um arquivo PDF.
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
          <div className="p-8 space-y-6 overflow-y-auto h-full bg-slate-50/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar propostas no banco local..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-2">
                {/* Fixed: Database icon was missing in imports */}
                <Database size={16} /> {proposals.length} itens no banco
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {proposals
                 .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
                 .map(p => (
                 <div key={p.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
                    <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">{p.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">{p.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 group-hover:line-clamp-none transition-all">{p.description}</p>
                 </div>
               ))}
               {proposals.length === 0 && (
                 <div className="col-span-full py-20 text-center text-slate-400 italic">
                   Use a aba principal para consulta direta do arquivo oficial.
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURAÇÃO */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={20} /> Fonte do Documento</h3>
              <button onClick={() => setIsConfigOpen(false)}><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Seleção de Tipo de Fonte */}
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button 
                  onClick={() => setDocSource('drive')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${docSource === 'drive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <FileDigit size={18} /> Google Drive
                </button>
                <button 
                  onClick={() => setDocSource('pdf')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${docSource === 'pdf' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <FileText size={18} /> Arquivo PDF
                </button>
              </div>

              {docSource === 'drive' ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-[11px] leading-relaxed">
                      <p className="font-black mb-1 uppercase tracking-wider flex items-center gap-1"><CheckCircle size={14}/> Compartilhamento</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>No arquivo, clique em <strong>Compartilhar</strong>.</li>
                        <li>Mude para: <strong>"Qualquer pessoa com o link"</strong>.</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-[11px] leading-relaxed">
                      <p className="font-black mb-1 uppercase tracking-wider flex items-center gap-1"><HelpCircle size={14}/> Recomendado</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Vá em <strong>Arquivo</strong> &gt; <strong>Publicar na Web</strong>.</li>
                        <li>Copie o link gerado e cole abaixo.</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link do Documento</label>
                    <input 
                      type="text" 
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                      placeholder="https://docs.google.com/..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handlePdfUpload}
                    />
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    {pdfName ? (
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{pdfName}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Arquivo Carregado com Sucesso</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Clique para selecionar o PDF</p>
                        <p className="text-xs text-slate-400 mt-1">O arquivo será lido localmente no seu navegador</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-[11px] flex gap-3">
                    <Info size={16} className="shrink-0" />
                    <p>Arquivos PDF locais resolvem problemas de "Pedir Acesso" do Google Drive, pois são lidos diretamente do seu computador.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Lock size={12}/> Autenticação do Conselho</label>
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
                <Save size={18} /> Confirmar Configuração
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProposalsConference;
