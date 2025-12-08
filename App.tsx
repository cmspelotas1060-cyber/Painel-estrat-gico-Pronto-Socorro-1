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
    // Nova lógica de detecção baseada em HASH (Compatível com HashRouter)
    // URL esperada: site.com/#/?share=DADOS ou site.com/#/admin?share=DADOS
    const hash = window.location.hash;
    
    // Procura pelo parâmetro share= dentro da string do hash
    if (hash.includes('share=')) {
      try {
        // Extrai apenas a parte dos dados
        const shareData = hash.split('share=')[1].split('&')[0];
        
        if (shareData) {
           // Decodificação Segura
           const jsonString = decodeURIComponent(escape(atob(shareData)));
           const parsed = JSON.parse(jsonString);

           if (parsed.stats) {
             localStorage.setItem('ps_monthly_detailed_stats', JSON.stringify(parsed.stats));
           }
           if (parsed.context) {
             localStorage.setItem('ps_context_data', parsed.context);
           }

           // Limpa a URL removendo o parametro share para não ficar gigante visualmente
           // Mantém a rota base (ex: #/ ou #/admin)
           const cleanHash = hash.split('?')[0]; 
           const newUrl = window.location.origin + window.location.pathname + cleanHash;
           
           // Atualiza a URL sem recarregar
           window.history.replaceState({}, document.title, newUrl);

           // Alerta de sucesso e recarga para aplicar dados
           setTimeout(() => {
              alert('Dados importados com sucesso via Link Compartilhado!');
              window.location.reload();
           }, 100);
        }
      } catch (e) {
        console.error("Erro ao importar dados compartilhados:", e);
        // Silencioso se não for um dado válido, para não atrapalhar navegação normal
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