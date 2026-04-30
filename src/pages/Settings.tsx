import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database, Shield, Key, CheckCircle2, AlertCircle, 
  ExternalLink, RefreshCw
} from 'lucide-react';
import { db } from '../services/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { syncService } from '../services/storage';

const Settings: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      // Simple fetch to verify firestore connectivity
      await getDoc(doc(db, '_internal_', 'test'));
      setStatus('connected');
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Firebase connection error:', err);
      // Permission denied is actually a good sign - it means we reached the server!
      if (err.code === 'permission-denied' || err.message.includes('permission')) {
        setStatus('connected');
        setErrorMsg(null);
      } else {
        setStatus('error');
        setErrorMsg(err.message || 'Erro desconhecido ao conectar ao Firebase.');
      }
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Configurações do Sistema</h1>
            <p className="text-slate-500 font-medium">Gerencie a integração com o banco de dados e segurança.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 
            status === 'checking' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
          }`}>
            {status === 'connected' ? <CheckCircle2 size={16} /> : 
             status === 'checking' ? <RefreshCw size={16} className="animate-spin" /> : <AlertCircle size={16} />}
            {status === 'connected' ? 'Firebase Conectado' : 
             status === 'checking' ? 'Verificando...' : 'Erro de Conexão'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firebase Status Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Status do Firestore</h3>
                <p className="text-xs text-slate-500">Banco de dados NoSQL</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                O sistema agora utiliza o <strong>Google Firebase (Firestore)</strong> para sincronização global de dados. 
                Isso garante que as atualizações feitas em um dispositivo sejam refletidas em todos os outros links de acesso.
              </p>
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-800">Erro detectado:</p>
                  <p className="text-[11px] text-red-600 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            <button 
              onClick={checkConnection}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Testar Conexão Novamente
            </button>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Segurança e Regras</h3>
                <p className="text-xs text-slate-500">Políticas de acesso Firestore</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Os dados estão protegidos por <strong>Firebase Security Rules</strong>. 
                As transações são validadas no servidor para garantir a integridade dos indicadores.
              </p>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Key size={14} /> Sincronização Ativa
                </p>
                <p className="text-[11px] text-blue-700">
                  Os dados são salvos localmente e sincronizados automaticamente com a nuvem sempre que houver conexão.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
              <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-2">
                <RefreshCw size={14} /> Migração de Dados Legados
              </p>
              <p className="text-[11px] text-amber-700 mb-3">
                Se você não está vendo seus dados antigos, use o botão abaixo para tentar migrá-los do sistema anterior (Supabase) para o novo Firebase.
              </p>
              <button
                onClick={async () => {
                  try {
                    const result = await syncService.pullAllFromSupabase();
                    if (result === 'migrated') {
                      alert('Dados migrados com sucesso do Supabase!');
                      window.location.reload();
                    } else if (result === 'pulled' || result === 'synced_local') {
                      alert('Sincronização concluída. Verifique se os dados apareceram.');
                      window.location.reload();
                    } else {
                      alert('Nenhum dado legado encontrado para migração.');
                    }
                  } catch (err) {
                    alert('Erro na migração: ' + err);
                  }
                }}
                className="w-full py-2 bg-amber-600 text-white rounded-lg font-bold text-[10px] hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} />
                Tentar Migrar Dados Antigos
              </button>
            </div>

            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Abrir Firebase Console
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
