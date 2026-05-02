
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu, Loader2, CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';
import { syncService } from './services/supabase';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import FinancialReport from './pages/FinancialReport';
import PMSPelDashboard from './pages/PMSPelDashboard';
import ProposalsConference from './pages/ProposalsConference';
import PPA from './pages/PPA';
import OccupancyPanel from './pages/OccupancyPanel';
import RiskClassificationPanel from './pages/RiskClassificationPanel';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'error_not_found' | 'error_invalid'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditorMode, setIsEditorMode] = useState(() => localStorage.getItem('ui_editor_mode') === 'true');

  const decompress = async (base64: string): Promise<string> => {
    try {
      if (typeof DecompressionStream === 'undefined') {
        throw new Error("Seu navegador não suporta a tecnologia de descompressão necessária (DecompressionStream). Por favor, use um navegador moderno como Chrome, Edge ou Safari 16.4+.");
      }
      const binString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      const len = binString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const response = new Response(stream.readable);
      return await response.text();
    } catch (e: any) {
      console.error("Falha ao descomprimir dados:", e);
      throw e;
    }
  };

  useEffect(() => {
    const handleImport = async () => {
      const url = window.location.href;
      // Support both ?share=... and ?id=...
      const match = url.match(/[?&](share|id)=([^&?#]+)/);
      const shareData = match ? match[2] : null;
      const paramName = match ? match[1] : null;

      if (shareData) {
        setImportStatus('loading');
        console.log(`Iniciando importação de dados. Param: ${paramName}, Value: ${shareData}`);
        try {
          let payload: any = null;
          const decodedShareData = decodeURIComponent(shareData);

          if (paramName === 'id' || decodedShareData.startsWith('id_')) {
            // New format: stored in Supabase (either via ?id=UUID or ?share=id_UUID)
            const shareId = paramName === 'id' ? decodedShareData : decodedShareData.substring(3).replace(/\/$/, '');
            console.log("Buscando shareId no Supabase:", shareId);
            const rawPayload = await syncService.getShare(shareId);
            console.log("Resposta do Supabase:", rawPayload ? "Dados encontrados" : "Dados NÃO encontrados");
            
            if (!rawPayload) {
              throw new Error("NOT_FOUND");
            }

            // Handle case where Supabase might return stringified JSON
            if (typeof rawPayload === 'string') {
              try {
                payload = JSON.parse(rawPayload);
              } catch (e) {
                console.error("Erro ao parsear payload string:", e);
                payload = rawPayload;
              }
            } else {
              payload = rawPayload;
            }
          } else if (decodedShareData.startsWith('gz_')) {
            // Old format: compressed in URL
            const rawBase64 = decodedShareData.substring(3);
            const jsonString = await decompress(rawBase64);
            payload = JSON.parse(jsonString);
          }

          if (payload && payload.full_db) {
            console.log("Payload válido. Restaurando chaves:", Object.keys(payload.full_db).length);
            for (const [key, value] of Object.entries(payload.full_db)) {
              if (value !== null && value !== undefined) {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                try {
                  localStorage.setItem(key, stringValue);
                } catch (e: any) {
                  if (e.name === 'QuotaExceededError') {
                    console.error("Limite de armazenamento local excedido para chave:", key);
                  } else {
                    throw e;
                  }
                }
                // Sync to Supabase in background
                try {
                  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
                  syncService.set(key, parsed).catch(e => console.warn(`Erro sync background para ${key}:`, e));
                } catch {
                  syncService.set(key, value).catch(e => console.warn(`Erro sync background para ${key}:`, e));
                }
              }
            }
            setImportStatus('success');
          } else {
            console.error("Payload inválido ou sem full_db:", payload);
            throw new Error("INVALID_PAYLOAD");
          }
          
          setTimeout(() => {
            // Use URL API for cleaner removal
            try {
              const urlObj = new URL(window.location.href);
              urlObj.searchParams.delete('share');
              urlObj.searchParams.delete('id');
              // Also check hash for params (HashRouter sometimes puts them there)
              if (urlObj.hash.includes('?')) {
                const [path, query] = urlObj.hash.split('?');
                const hashParams = new URLSearchParams(query);
                hashParams.delete('share');
                hashParams.delete('id');
                const newQuery = hashParams.toString();
                urlObj.hash = newQuery ? `${path}?${newQuery}` : path;
              }
              
              window.history.replaceState({}, '', urlObj.toString());
              setImportStatus('idle');
            } catch (e) {
              // Fallback to old method if URL API fails
              let cleanUrl = url.replace(/([?&])(share|id)=[^&?#]+(&?)/, (match, p1, p2, p3) => {
                if (p1 === '?' && p3 === '&') return '?';
                return p1 === '?' ? '' : p3;
              }).replace(/[?&]$/, '');
              window.location.href = cleanUrl;
            }
          }, 1500);
        } catch (err: any) {
          console.error("Erro na importação estratégica:", err);
          if (err.message === 'NOT_FOUND') {
            setImportStatus('error_not_found');
          } else if (err.message === 'INVALID_PAYLOAD') {
            setImportStatus('error_invalid');
          } else {
            setImportStatus('error');
          }
        }
      }
    };

    const initialSync = async () => {
      // Only sync if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const isValidUrl = (url: string | undefined): boolean => {
        if (!url) return false;
        try { new URL(url); return url.startsWith('http'); } catch { return false; }
      };

      if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
        setIsSyncing(true);
        try {
          console.log("Iniciando sincronização automática com Supabase...");
          await syncService.pullAllFromSupabase();
          // Trigger a re-render/reload of data in components
          window.dispatchEvent(new Event('storage'));
          console.log("Sincronização concluída.");
        } catch (err) {
          console.error("Erro na sincronização inicial:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    handleImport();
    initialSync();

    const handleModeChange = () => setIsEditorMode(localStorage.getItem('ui_editor_mode') === 'true');
    window.addEventListener('ui_editor_mode_changed', handleModeChange);
    return () => window.removeEventListener('ui_editor_mode_changed', handleModeChange);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Pull first to get latest from others
      await syncService.pullAllFromSupabase();
      // Then push local changes
      await syncService.syncAllLocalToSupabase();
      
      // Force refresh of data in pages
      window.dispatchEvent(new Event('storage'));
      
      alert('Sincronização com Supabase concluída com sucesso! Os dados foram atualizados.');
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao sincronizar com Supabase: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSyncing(false);
    }
  };

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
                    <Loader2 className="animate-spin text-blue-600 absolute inset-0" size={80} strokeWidth={1} />
                    <Database className="text-blue-200 absolute inset-0 m-auto" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Sincronizando Painel</h3>
                    <p className="text-sm text-slate-500 mt-2">Reconstruindo indicadores e metas...</p>
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
              {(importStatus === 'error' || importStatus === 'error_not_found' || importStatus === 'error_invalid') && (
                <div className="space-y-6">
                  <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      {importStatus === 'error_not_found' ? 'Link Não Encontrado' : 
                       importStatus === 'error_invalid' ? 'Dados Inválidos' : 'Erro no Link'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">
                      {importStatus === 'error_not_found' ? 'Os dados deste link não existem mais ou o link está incompleto.' : 
                       importStatus === 'error_invalid' ? 'O conteúdo deste link está corrompido ou em formato incompatível.' : 
                       'Não foi possível restaurar os dados deste link de compartilhamento.'}
                    </p>
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
            <div className="ml-4 flex flex-col">
              <span className="font-bold text-slate-800 leading-none">Painel Estratégico</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                  CMSPEL
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Conselho Municipal de Saúde</span>
              </div>
            </div>
            {isEditorMode && (
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className="ml-auto p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Sincronizar com Nuvem"
              >
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            )}
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/finance" element={<FinancialReport />} />
              <Route path="/pmspel" element={<PMSPelDashboard />} />
              <Route path="/rdqa-domi" element={<Navigate to="/pmspel" replace />} />
              <Route path="/ppa" element={<PPA />} />
              <Route path="/proposals" element={<ProposalsConference />} />
              <Route path="/occupancy" element={<OccupancyPanel />} />
              <Route path="/risk-classification" element={<RiskClassificationPanel />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
