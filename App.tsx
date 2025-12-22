
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import FinancialReport from './pages/FinancialReport';
import PMSPelDashboard from './pages/PMSPelDashboard';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const decompressData = async (base64: string): Promise<string> => {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const stream = new Blob([bytes]).stream();
      const decompressedReadableStream = stream.pipeThrough(new DecompressionStream("gzip"));
      const resp = await new Response(decompressedReadableStream);
      return await resp.text();
    } catch (e) {
      console.error("Erro na descompressão:", e);
      throw e;
    }
  };

  useEffect(() => {
    const processSharedLink = async () => {
      const fullUrl = window.location.href;
      if (fullUrl.includes('share=gz_')) {
        setImportStatus('loading');
        try {
          const shareData = fullUrl.split('share=gz_')[1]?.split('&')[0];
          if (!shareData) return;

          const jsonString = await decompressData(shareData);
          const payload = JSON.parse(jsonString);
          
          if (payload.type === 'assistential' || payload.type === 'financial') {
            const current = JSON.parse(localStorage.getItem('ps_monthly_detailed_stats') || '{}');
            localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify({ ...current, ...payload.data }));
          } 
          else if (payload.type === 'strategic') {
            localStorage.setItem('rdqa_full_indicators', JSON.stringify(payload.data));
          }
          else if (payload.full_sync) {
            if (payload.assistential) localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(payload.assistential));
            if (payload.strategic) localStorage.setItem('rdqa_full_indicators', JSON.stringify(payload.strategic));
          }

          setImportStatus('success');
          // Limpa a URL e recarrega para garantir que os dados sejam lidos corretamente pelos componentes
          setTimeout(() => {
            const cleanUrl = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
            window.location.href = cleanUrl;
            window.location.reload();
          }, 1500);

        } catch (e) {
          console.error("Erro ao processar link:", e);
          setImportStatus('error');
          setTimeout(() => setImportStatus('idle'), 3000);
        }
      }
    };
    processSharedLink();
  }, []);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Overlay de Importação */}
        {importStatus !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 border border-slate-200">
              {importStatus === 'loading' && (
                <div className="space-y-4">
                  <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
                  <h3 className="text-lg font-bold text-slate-800">Sincronizando Dados...</h3>
                  <p className="text-sm text-slate-500">Aguarde enquanto reconstruímos o painel.</p>
                </div>
              )}
              {importStatus === 'success' && (
                <div className="space-y-4">
                  <CheckCircle className="text-emerald-500 mx-auto animate-bounce" size={48} />
                  <h3 className="text-lg font-bold text-slate-800">Dados Importados!</h3>
                  <p className="text-sm text-slate-500">O painel será atualizado em instantes.</p>
                </div>
              )}
              {importStatus === 'error' && (
                <div className="space-y-4">
                  <AlertCircle className="text-red-500 mx-auto" size={48} />
                  <h3 className="text-lg font-bold text-slate-800">Falha na Importação</h3>
                  <p className="text-sm text-slate-500">O link parece ser inválido ou expirou.</p>
                  <button onClick={() => setImportStatus('idle')} className="w-full py-2 bg-slate-800 text-white rounded-lg">Fechar</button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 p-4 flex items-center md:hidden print:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-800">Painel Estratégico</span>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<FinancialReport />} />
              <Route path="/pmspel" element={<PMSPelDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
