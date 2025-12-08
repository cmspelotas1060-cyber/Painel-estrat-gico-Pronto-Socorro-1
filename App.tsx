import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import FinancialReport from './pages/FinancialReport';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for data in URL query params (which usually come BEFORE the hash in this new formula)
    // Example: site.com/?share=XXX#/admin
    const searchParams = new URLSearchParams(window.location.search);
    const shareData = searchParams.get('share');

    if (shareData) {
      try {
        // Decodificação Segura (Inverso do btoa + unescape + encodeURIComponent)
        const jsonString = decodeURIComponent(escape(atob(shareData)));
        const parsed = JSON.parse(jsonString);

        if (parsed.stats) {
          localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed.stats));
        }
        if (parsed.context) {
          localStorage.setItem('ps_context_data', parsed.context);
        }

        // Limpar a URL para não ficar gigante
        const newUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        // Pequeno delay para garantir que o React processe a renderização antes do alert
        setTimeout(() => {
            alert('Dados importados com sucesso via Link Compartilhado!');
            window.location.reload(); // Recarregar para aplicar os dados nos componentes
        }, 100);

      } catch (e) {
        console.error("Erro ao importar dados compartilhados:", e);
        alert('O link de compartilhamento parece estar inválido ou corrompido.');
      }
    }
  }, []);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header - print:hidden added */}
          <header className="bg-white border-b border-slate-200 p-4 flex items-center md:hidden print:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-800">Gestão PS</span>
          </header>

          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<FinancialReport />} />
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