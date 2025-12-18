
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import FinancialReport from './pages/FinancialReport';
import AssistanceReport from './pages/AssistanceReport';
import BedsReport from './pages/BedsReport';
import RQDA from './pages/RQDA';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const hash = window.location.hash;
      if (hash.includes('share=')) {
        try {
          const shareData = hash.split('share=')[1].split('&')[0];
          if (shareData) {
             let jsonString = '';
             if (shareData.startsWith('gz_')) {
               const compressedBase64 = shareData.substring(3);
               jsonString = await decompressData(compressedBase64);
             } else {
               jsonString = decodeURIComponent(escape(atob(shareData)));
             }

             const parsed = JSON.parse(jsonString);
             const currentStats = JSON.parse(localStorage.getItem('ps_monthly_detailed_stats') || '{}');
             
             const mergedStats = { ...currentStats };
             if (parsed.stats) {
               Object.keys(parsed.stats).forEach(period => {
                 mergedStats[period] = { ...(mergedStats[period] || {}), ...parsed.stats[period] };
               });
             }
             
             localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(mergedStats));
             if (parsed.context) {
               localStorage.setItem('ps_context_data', parsed.context);
             }

             const cleanHash = hash.split('?')[0]; 
             const newUrl = window.location.origin + window.location.pathname + cleanHash;
             window.history.replaceState({}, document.title, newUrl);

             setTimeout(() => {
                alert('Dados importados com sucesso! O relatório foi atualizado.');
                window.location.reload();
             }, 100);
          }
        } catch (e) {
          console.error("Erro ao importar dados compartilhados:", e);
        }
      }
    };
    processSharedLink();
  }, []);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-200 p-4 flex items-center md:hidden print:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-800">Gestão PS</span>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assistance" element={<AssistanceReport />} />
              <Route path="/beds" element={<BedsReport />} />
              <Route path="/finance" element={<FinancialReport />} />
              <Route path="/rqda" element={<RQDA />} />
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
