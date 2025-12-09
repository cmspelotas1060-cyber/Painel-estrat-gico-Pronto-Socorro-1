import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, Lock, DollarSign, Share2, AlertCircle, Link as LinkIcon, Check, Copy, MessageCircle, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const navItems = [
    { name: 'Dashboard Geral', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Relatório Financeiro', path: '/finance', icon: <DollarSign size={20} /> },
  ];

  // Função de Compressão GZIP para encurtar o link
  const compressData = async (data: string): Promise<string> => {
    // 1. Converte string para stream de bytes
    const stream = new Blob([data]).stream();
    // 2. Comprime usando GZIP nativo do navegador
    const compressedReadableStream = stream.pipeThrough(new CompressionStream("gzip"));
    const compressedResponse = await new Response(compressedReadableStream);
    const blob = await compressedResponse.blob();
    const buffer = await blob.arrayBuffer();
    // 3. Converte para Base64 seguro para URL
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return base64;
  };

  const generateShareUrl = async () => {
    // 1. Coletar dados
    const detailedStats = localStorage.getItem('ps_monthly_detailed_stats');
    const contextData = localStorage.getItem('ps_context_data');
    
    // Se não houver dados, retorna null
    if (!detailedStats && !contextData) return null;

    const payload = {
      stats: detailedStats ? JSON.parse(detailedStats) : null,
      context: contextData || null,
      ver: 2 // Versão do payload para controle futuro
    };

    const jsonString = JSON.stringify(payload);
    
    // 2. Compressão (Assíncrona)
    // Adicionamos prefixo 'gz_' para identificar que está comprimido
    const compressedData = await compressData(jsonString);
    const finalDataToken = `gz_${compressedData}`;

    // 3. Construção da URL
    const baseUrl = window.location.href.split('#')[0];
    const baseUrlHash = window.location.hash.split('?')[0]; // Mantém a rota (ex: #/ ou #/admin) mas remove query params antigos
    
    // Se não tiver hash, assume root
    const targetHash = baseUrlHash || '#/';
    
    return `${baseUrl}${targetHash}?share=${finalDataToken}`;
  };

  const handleCopyLink = async () => {
    if (password === 'Conselho@2026') {
      setIsGenerating(true);
      setError('');
      try {
        const finalUrl = await generateShareUrl();

        if (!finalUrl) {
           setError('Não há dados salvos para gerar o link.');
           setIsGenerating(false);
           return;
        }

        // Método de Cópia Robusto
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(finalUrl);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = finalUrl;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                throw new Error('Falha ao copiar');
            }
            document.body.removeChild(textArea);
        }

        setCopySuccess(true);
        
        setTimeout(() => {
          setCopySuccess(false);
          setShowShareModal(false);
          setPassword('');
        }, 2000);
      } catch (e) {
        console.error(e);
        setError('Erro ao gerar link compactado. Tente novamente.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      setError('Senha de administrador incorreta.');
    }
  };

  const handleWhatsAppShare = async () => {
    if (password === 'Conselho@2026') {
      setIsGenerating(true);
      setError('');
      try {
        const finalUrl = await generateShareUrl();
        
        if (!finalUrl) {
           setError('Não há dados salvos para compartilhar.');
           setIsGenerating(false);
           return;
        }

        const message = `Acesse o Painel de Gestão PS com os dados atualizados:\n\n${finalUrl}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        setShowShareModal(false);
        setPassword('');
      } catch (e) {
        console.error(e);
        setError('Erro ao gerar link para WhatsApp.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      setError('Senha de administrador incorreta.');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - print:hidden added to hide on PDF export */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transition-transform duration-300 ease-in-out print:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen flex flex-col
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-blue-400">GESTÃO</span>
            <span>PS</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-4">
             <NavLink
              to="/admin"
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-red-900/50 text-red-200 shadow-lg border border-red-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              onClick={() => setIsOpen(false)}
            >
              <Lock size={20} />
              <span className="font-medium">Área Administrativa</span>
            </NavLink>

            <button
              onClick={() => setShowShareModal(true)}
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 p-0.5 shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-indigo-600 to-blue-600 px-4 py-3 font-bold text-white transition-all group-hover:bg-opacity-0">
                <Share2 size={18} className="text-blue-100" />
                <span>Compartilhar Acesso</span>
              </div>
            </button>
          </div>
        </nav>

        <div className="shrink-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              Powered by Gemini
            </div>
            <div className="text-xs text-slate-500 font-light">
              Desenvolvido por <span className="text-blue-400/90 font-medium">Samuel Amaro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Share2 className="text-blue-600" size={20} />
                Compartilhar Acesso
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <LinkIcon size={20} className="shrink-0 mt-0.5" />
                <p>Gere um <strong>link curto e comprimido</strong> com os dados atuais salvos para enviar via WhatsApp.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Senha de Segurança</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a senha do conselho..."
                />
                {error && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> {error}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleCopyLink}
                  disabled={copySuccess || isGenerating}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                    copySuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  } disabled:opacity-70`}
                >
                  {isGenerating ? (
                     <>
                       <Loader2 className="animate-spin" size={18} />
                       Gerando Link...
                     </>
                  ) : copySuccess ? (
                    <>
                      <Check size={18} />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copiar Link
                    </>
                  )}
                </button>

                <button 
                  onClick={handleWhatsAppShare}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors bg-green-500 hover:bg-green-600 text-white disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <MessageCircle size={18} />}
                  Enviar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};