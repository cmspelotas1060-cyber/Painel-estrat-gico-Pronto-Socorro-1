import React, { useState, useEffect } from 'react';
import { generateReportAnalysis } from '../services/geminiService';
import { Bot, Search, BrainCircuit, Sparkles, Loader2, Link as LinkIcon, Edit, Database, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_MOCK_DATA = `
RESUMO DE DADOS DO PRONTO SOCORRO (2025):
- 1º Quadrimestre: 5050 atendimentos, Tempo médio 45min. Principais queixas: Respiratórias.
- 2º Quadrimestre: 5800 atendimentos, Tempo médio 40min. Principais queixas: Dengue/Virais.
- 3º Quadrimestre: 5950 atendimentos, Tempo médio 42min. Principais queixas: Traumas.
- Taxa de retorno em 24h: 3.5% (Meta < 5%).
- Absenteísmo médico: 2% (Baixo).
- Faltas de pacientes: 12% em consultas agendadas.
`;

const SmartReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [mode, setMode] = useState<'fast' | 'deep' | 'search'>('fast');
  const [contextData, setContextData] = useState(DEFAULT_MOCK_DATA);
  const [isCustomData, setIsCustomData] = useState(false);
  const [hasDetailedStats, setHasDetailedStats] = useState(false);

  useEffect(() => {
    // Load custom data from Admin Panel if available
    const savedData = localStorage.getItem('ps_context_data');
    if (savedData) {
      setContextData(savedData);
      setIsCustomData(true);
    }
    const savedStats = localStorage.getItem('ps_detailed_stats');
    if (savedStats) {
      setHasDetailedStats(true);
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setReport(null);
    setSources([]);
    
    try {
      const isThinking = mode === 'deep';
      const isSearch = mode === 'search';
      
      const { text, sources: resSources } = await generateReportAnalysis(contextData, isThinking, isSearch);
      setReport(text);
      if (resSources) setSources(resSources);
    } catch (err) {
      setReport("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Relatórios Inteligentes com IA
          </h1>
          <p className="text-slate-500 mt-2">
            Gere análises, comparativos e planos de ação utilizando diferentes modelos Gemini.
          </p>
        </div>
        <Link to="/admin" className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors bg-white p-2 rounded border border-slate-200">
          <Edit size={12} /> Editar Dados Fonte
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setMode('fast')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'fast' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bot size={20} className={mode === 'fast' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="font-semibold text-slate-800">Resumo Rápido</span>
          </div>
          <p className="text-xs text-slate-500">Usa Gemini Flash Lite. Ideal para insights imediatos e resumos executivos.</p>
        </button>

        <button
          onClick={() => setMode('search')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'search' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Search size={20} className={mode === 'search' ? 'text-green-600' : 'text-slate-400'} />
            <span className="font-semibold text-slate-800">Pesquisa Web</span>
          </div>
          <p className="text-xs text-slate-500">Usa Gemini Flash + Google Search. Busca protocolos atualizados e tendências de saúde.</p>
        </button>

        <button
          onClick={() => setMode('deep')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            mode === 'deep' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={20} className={mode === 'deep' ? 'text-purple-600' : 'text-slate-400'} />
            <span className="font-semibold text-slate-800">Análise Estratégica</span>
          </div>
          <p className="text-xs text-slate-500">Usa Gemini Pro + Thinking Mode. Raciocínio complexo para planos de longo prazo.</p>
        </button>
      </div>

      <div className={`p-4 rounded-lg border text-xs font-mono overflow-x-auto relative transition-colors ${isCustomData ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        <div className="flex items-center justify-between mb-2">
          <strong className="flex items-center gap-1">
             {isCustomData ? <CheckCircle size={14} className="text-green-600"/> : <Database size={14} />}
             {isCustomData ? 'Dados Personalizados do Admin Carregados' : 'Dados Padrão do Sistema (Exemplo)'}
          </strong>
          <div className="flex gap-2">
            {hasDetailedStats && (
               <span className="text-[10px] uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-purple-200">
                 <FileSpreadsheet size={10} /> + Indicadores Detalhados
               </span>
            )}
            {isCustomData && <span className="text-[10px] uppercase bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">Ativo</span>}
          </div>
        </div>
        {contextData.substring(0, 150)}...
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Gerando Análise...
            </>
          ) : (
            <>
              Gerar Relatório
              <Sparkles size={18} />
            </>
          )}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Resultado da Análise</h3>
            <span className="text-xs px-2 py-1 bg-slate-200 rounded text-slate-600 uppercase font-bold tracking-wider">
              {mode === 'deep' ? 'Gemini 3 Pro Thinking' : mode === 'search' ? 'Search Grounding' : 'Flash Lite'}
            </span>
          </div>
          <div className="p-8 prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap">{report}</div>
          </div>
          
          {sources.length > 0 && (
            <div className="bg-slate-50 p-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Fontes Consultadas:</h4>
              <ul className="space-y-1">
                {sources.map((chunk, idx) => (
                  chunk.web ? (
                    <li key={idx}>
                      <a href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                        <LinkIcon size={12} />
                        {chunk.web.title}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartReports;