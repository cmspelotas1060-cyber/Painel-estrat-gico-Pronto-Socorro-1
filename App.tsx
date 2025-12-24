
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import FinancialReport from './pages/FinancialReport';
import PMSPelDashboard from './pages/PMSPelDashboard';
import ProposalsConference from './pages/ProposalsConference';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const decompress = async (base64: string): Promise<string> => {
    try {
      const binString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const response = new Response(stream.readable);
      return await response.text();
    } catch (e) {
      console.error("Falha ao descomprimir dados:", e);
      throw e;
    }
  };

  useEffect(() => {
    const handleImport = async () => {
      const url = window.location.href;
      const searchParams = new URLSearchParams(url.split('?')[1]);
      const shareData = searchParams.get('share');

      if (shareData && shareData.startsWith('gz_')) {
        setImportStatus('loading');
        try {
          const rawBase64 = shareData.substring(3);
          const jsonString = await decompress(rawBase64);
          const payload = JSON.parse(jsonString);

          if (payload.full_db) {
            Object.entries(payload.full_db).forEach(([key, value]) => {
              if (value) {
                localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
              }
            });
          }

          setImportStatus('success');
          
          setTimeout(() => {
            const baseUrl = url.split('?')[0];
            window.location.href = baseUrl;
          }, 1500);
        } catch (err) {
          console.error("Erro na importação estratégica:", err);
          setImportStatus('error');
        }
      }
    };

    handleImport();
  }, []);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {importStatus !== 'idle' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 border border-slate-200">
              {importStatus === 'loading' && (
                <div className="space-y-6">
                  <div className="relative mx-auto w-20 h-20">
                    <Loader2 className="animate-spin text-blue-600 absolute inset-0" size={80} />
                    <Database className="text-blue-200 absolute inset-0 m-auto" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Sincronizando Painel</h3>
                    <p className="text-sm text-slate-500 mt-2">Reconstruindo indicadores a partir do link compartilhado...</p>
                  </div>
                </div>
              )}
              {importStatus === 'success' && (
                <div className="space-y-6">
                  <div className="bg-emerald-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <CheckCircle className="text-emerald-600" size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Dados Restaurados!</h3>
                    <p className="text-sm text-slate-500 mt-2">O painel foi atualizado com as novas informações.</p>
                  </div>
                </div>
              )}
              {importStatus === 'error' && (
                <div className="space-y-6">
                  <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Erro no Link</h3>
                    <p className="text-sm text-slate-500 mt-2">Os dados deste link estão corrompidos ou incompletos.</p>
                  </div>
                  <button onClick={() => setImportStatus('idle')} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold">Voltar</button>
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
              <Route path="/proposals" element={<ProposalsConference />} />
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
