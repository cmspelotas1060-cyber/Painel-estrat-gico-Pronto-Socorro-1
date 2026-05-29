import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database, Shield, Key, CheckCircle2, AlertCircle, 
  Copy, ExternalLink, Terminal, Save, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Settings: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const checkConnection = async () => {
    setStatus('checking');
    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase não configurado. Por favor, configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel do AI Studio.');
      }
      const { data, error } = await supabase.from('app_data').select('id').limit(1);
      if (error) {
        throw error;
      }
      setStatus('connected');
      setErrorMsg(null);
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Erro desconhecido ao conectar ao Supabase.');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const migrationSql = `-- Create the app_data table to store generic application state
CREATE TABLE IF NOT EXISTS public.app_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone with the anon key to read/write
CREATE POLICY "Allow public access to app_data" 
ON public.app_data 
FOR ALL 
USING (true) 
WITH CHECK (true);`;

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
            {status === 'connected' ? 'Supabase Conectado' : 
             status === 'checking' ? 'Verificando...' : 'Erro de Conexão'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase Status Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Status do Supabase</h3>
                <p className="text-xs text-slate-500">Integração em tempo real</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL do Projeto</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <code className="text-xs text-slate-600 truncate flex-1">{supabaseUrl || 'Não configurado'}</code>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chave Anon (Public)</label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <code className="text-xs text-slate-600 truncate flex-1">{supabaseKey ? '••••••••••••••••' : 'Não configurado'}</code>
                </div>
              </div>
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
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Segurança e RLS</h3>
                <p className="text-xs text-slate-500">Políticas de acesso</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                O sistema utiliza <strong>Row Level Security (RLS)</strong> para proteger seus dados. 
                Atualmente, a política está configurada para acesso público via chave anônima.
              </p>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Key size={14} /> Dica de Segurança
                </p>
                <p className="text-[11px] text-blue-700">
                  Para ambientes de produção, recomenda-se habilitar a autenticação do Supabase e restringir as políticas de RLS apenas para usuários autenticados.
                </p>
              </div>
            </div>

            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Abrir Dashboard Supabase
            </a>
          </div>
        </div>

        {/* Migration Section */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center">
                <Terminal size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">Migration SQL</h3>
                <p className="text-xs text-slate-400">Execute este script no SQL Editor do Supabase</p>
              </div>
            </div>
            <button 
              onClick={() => handleCopy(migrationSql, 'migration')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                copied === 'migration' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {copied === 'migration' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied === 'migration' ? 'Copiado!' : 'Copiar SQL'}
            </button>
          </div>

          <div className="relative group">
            <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed">
              {migrationSql}
            </pre>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Terminal size={16} className="text-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Passo 1</span>
              <p className="text-xs text-slate-300">Acesse o SQL Editor no seu projeto Supabase.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Passo 2</span>
              <p className="text-xs text-slate-300">Cole o código acima e clique em "Run".</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Passo 3</span>
              <p className="text-xs text-slate-300">Verifique se a tabela "app_data" foi criada.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
