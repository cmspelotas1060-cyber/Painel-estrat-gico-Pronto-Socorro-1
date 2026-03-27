
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { storage } from '../services/storage';
import { 
  FileText, Settings, X, 
  Bookmark, Search, FilePlus, Monitor, Maximize2, Share,
  Calendar, Plus, Trash2, Edit3, Link as LinkIcon, Fingerprint,
  Info, Sparkles, Target, Zap, Activity, Brain, ShieldAlert,
  Save, CheckCircle, Loader2, Users, MapPin, Layers, Award
} from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Aprovada' | 'Em Análise' | 'Implementada' | 'Rejeitada';
  planningMatches?: MatchResult[];
}

interface MatchResult {
  term: string;
  label: string;
  type: 'PPA' | 'RDQA';
  reason: string;
  score: number; // 0 a 10
  strength: 'Forte' | 'Média' | 'Conceitual';
}

// 1. MAPA DE SINÔNIMOS E ADJACÊNCIA SEMÂNTICA (Ontologia de Saúde)
const SEMANTIC_MAP: Record<string, string[]> = {
  'Vigilância': ['dengue', 'arbovirose', 'epidemiol', 'vacina', 'imuniza', 'sanitária', 'endemia', 'zoonose', 'escorpião', 'infecção', 'surto', 'agente', 'combate', 'fumacê', 'controle de vetores'],
  'Psicossocial': ['caps', 'mental', 'psicólogo', 'psiquiatr', 'droga', 'álcool', 'depressão', 'ansiedade', 'suicídio', 'acolhimento', 'terapêutico'],
  'Emergência': ['upa', 'samu', 'pronto-socorro', 'emergência', 'trauma', 'urgência', 'ambulância', 'socorro', 'primeiros', 'resgate', 'grave', 'choque'],
  'Primária': ['ubs', 'posto', 'prevenção', 'básica', 'comunitário', 'acs', 'esf', 'família', 'visita', 'domiciliar', 'hiperdia'],
  'Gestante': ['parto', 'pré-natal', 'criança', 'pediatria', 'amamentação', 'infantil', 'bebê', 'maternidade', 'obstetrícia', 'puerpério'],
  'Infra': ['reforma', 'construção', 'equipamento', 'obra', 'manutenção', 'climatização', 'mobiliário', 'pintura', 'telhado', 'físico', 'estrutura'],
  'Gestão': ['recurso', 'investimento', 'financeiro', 'gasto', 'custo', 'fundo', 'conselho', 'transparência', 'contratação', 'pessoal', 'rh', 'folha', 'processo']
};

const ProposalsConference: React.FC = () => {
  // activeTab removed for integrated layout
  const [driveLink, setDriveLink] = useState("");
  const [tempLink, setDriveLinkTemp] = useState("");
  
  const formatDriveLink = (link: string) => {
    if (!link) return "";
    try {
      if (link.includes('drive.google.com')) {
        if (link.includes('/view')) {
          return link.split('/view')[0] + '/preview';
        }
        if (link.includes('/edit')) {
          return link.split('/edit')[0] + '/preview';
        }
      }
      return link;
    } catch (e) {
      return link;
    }
  };
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProjecting, setIsProjecting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  
  const [isAddingProposal, setIsAddingProposal] = useState(false);
  const [isProposalProjectorOpen, setIsProposalProjectorOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [proposalForm, setProposalForm] = useState<Partial<Proposal>>({
    title: '',
    description: '',
    category: 'Eixo Geral',
    status: 'Aprovada'
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<string | null>(null);
  const [showSearchShareFeedback, setShowSearchShareFeedback] = useState(false);

  // 2. MOTOR DE NORMALIZAÇÃO DE TEXTO (Remove ruído e foca no radical)
  const normalize = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9 ]/g, "") // Remove símbolos
      .split(/\s+/)
      .filter(w => w.length > 3); // Remove palavras curtas (de, para, com...)
  };

  // 3. INDEXAÇÃO INTELIGENTE DO PLANEJAMENTO
  const planningData = useMemo(() => {
    const ppaParsed = storage.getSync('ps_ppa_full_data_v2');
    const rdqaParsed = storage.getSync('rdqa_full_indicators');
    
    const items: { label: string; type: 'PPA' | 'RDQA'; tokens: string[] }[] = [];
    
    const processParsed = (parsed: any, type: 'PPA' | 'RDQA', key: string) => {
      if (!parsed) return;
      try {
        const list = Object.values(parsed).flat() as any[];
        list.forEach(item => {
          if (item[key]) {
            items.push({ 
              label: item[key], 
              type, 
              tokens: normalize(item[key]) 
            });
          }
        });
      } catch (e) {}
    };

    processParsed(ppaParsed, 'PPA', 'action');
    processParsed(rdqaParsed, 'RDQA', 'label');
    return items;
  }, []);

  // 4. ALGORITMO DE SCORING SEMÂNTICO
  const crossReference = (proposal: Proposal): MatchResult[] => {
    const propTokens = normalize(`${proposal.title} ${proposal.description}`);
    if (propTokens.length === 0) return [];

    const matches: MatchResult[] = [];
    const seen = new Set<string>();

    planningData.forEach(planItem => {
      let score = 0;
      let matchTerm = "";
      let reason = "";

      // Camada 1: Match de Radical Direto (Ex: "Dengue" <-> "Dengue") - Peso 5
      const directIntersection = propTokens.filter(t => planItem.tokens.includes(t));
      if (directIntersection.length > 0) {
        score += 5;
        matchTerm = directIntersection[0];
        reason = `Match Técnico Direto: "${matchTerm}"`;
      }

      // Camada 2: Match Conceitual (Sinônimos/Ontologia) - Peso 3
      Object.entries(SEMANTIC_MAP).forEach(([concept, terms]) => {
        const propHasConcept = propTokens.some(t => terms.some(term => t.includes(term)));
        const planHasConcept = planItem.tokens.some(t => terms.some(term => t.includes(term)));
        
        if (propHasConcept && planHasConcept) {
          score += 3;
          if (!matchTerm) {
            matchTerm = concept;
            reason = `Convergência Temática: "${concept}"`;
          }
        }
      });

      if (score >= 3 && !seen.has(planItem.label)) {
        const strength = score >= 7 ? 'Forte' : score >= 5 ? 'Média' : 'Conceitual';
        matches.push({
          term: matchTerm.toUpperCase(),
          label: planItem.label,
          type: planItem.type,
          reason,
          score,
          strength
        });
        seen.add(planItem.label);
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  useEffect(() => {
    const load = async () => {
      // Check for search parameter in URL
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const q = params.get('q');
      if (q) {
        setSearchTerm(decodeURIComponent(q));
      }

      const savedLink = await storage.getItem('cms_conference_drive_link');
      if (savedLink) {
        setDriveLink(savedLink);
        setDriveLinkTemp(savedLink);
      }
      const savedProposals = await storage.getItem('cms_conference_proposals_v2');
      if (savedProposals) {
        setProposals(savedProposals);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const persistProposals = (updated: Proposal[]) => {
    setProposals(updated);
    storage.setItem('cms_conference_proposals_v2', updated);
  };

  const handleSaveProposal = () => {
    if (adminPassword !== 'Conselho@2026') { setError("Senha incorreta."); return; }
    let updated: Proposal[];
    if (editingProposal) {
      updated = proposals.map(p => p.id === editingProposal.id ? { ...p, ...proposalForm } as Proposal : p);
    } else {
      updated = [...proposals, { ...proposalForm, id: Date.now().toString() } as Proposal];
    }
    persistProposals(updated);
    setIsAddingProposal(false); setEditingProposal(null); setAdminPassword(""); setError("");
  };

  const handleShareSearch = async () => {
    const currentHash = window.location.hash.split('?')[0] || '#/conferencia';
    const url = `${window.location.origin}${window.location.pathname}${currentHash}?q=${encodeURIComponent(searchTerm)}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowSearchShareFeedback(true);
      setTimeout(() => setShowSearchShareFeedback(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const handleAISearch = async () => {
    if (!searchTerm || !driveLink) return;
    setIsSearchingAI(true);
    setAiSearchResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Busque no PDF fornecido informações sobre: "${searchTerm}". Retorne um resumo curto e direto dos pontos encontrados que mencionam este termo. Se não encontrar nada, diga que o termo não foi localizado no documento.`,
        config: {
          tools: [{ urlContext: {} }]
        },
        // We pass the URL as part of the context if the model supports it via prompt or specific tool config
        // In this SDK, urlContext is a tool that allows the model to fetch URLs mentioned in the prompt.
      });

      setAiSearchResult(response.text || "Nenhum resultado encontrado.");
    } catch (err) {
      console.error('Erro na busca IA:', err);
      setAiSearchResult("Erro ao realizar busca no PDF. Verifique se o link é público.");
    } finally {
      setIsSearchingAI(false);
    }
  };

  const groupedProposals = proposals
    .filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(p => ({
      ...p,
      planningMatches: crossReference(p)
    }))
    .reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = [];
      acc[curr.category].push(curr);
      return acc;
    }, {} as Record<string, Proposal[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 flex flex-col">
      {/* HEADER ESTRATÉGICO */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 md:gap-8 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain size={120} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="p-4 md:p-5 bg-indigo-600 text-white rounded-2xl md:rounded-3xl shadow-xl shrink-0">
             <Target size={28} className="md:w-8 md:h-8" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="conf_main_title" defaultText="17ª Conferência" />
            </h1>
            <p className="text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">
              <Sparkles size={14} className="text-indigo-500 animate-pulse"/>
              Cross-Referencing de Planejamento Ativo
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <FilePlus size={18} /> Adicionar PDF
          </button>
          <button onClick={() => setIsConfigOpen(true)} className="w-full sm:w-auto p-4 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm flex items-center justify-center"><Settings size={22} /></button>
        </div>
      </div>

      {/* BARRA DE PESQUISA GLOBAL DE PROPOSTAS (OCULTA) */}

      {/* RESULTADO DA BUSCA IA (OCULTO) */}

      {/* FEEDBACK DE LINK COPIADO */}
      {showSearchShareFeedback && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-500">
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-widest text-white">Link de Pesquisa Copiado!</span>
              <span className="text-[10px] font-bold opacity-80 text-white">Agora você pode enviar este link para outros visualizarem o mesmo resultado.</span>
            </div>
          </div>
        </div>
      )}

      {/* QUADRO INFORMATIVO DA CONFERÊNCIA */}
      <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Target size={160} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Conferência Municipal de Saúde
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👉</span>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ponto de partida (participação social)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-snug">É onde a população, trabalhadores e gestores se reúnem.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-snug">Define diretrizes e prioridades para a saúde do município.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Bookmark size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-snug">Serve como base para o planejamento governamental.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Sparkles size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✔</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Resultado</p>
                </div>
                <p className="text-xl font-bold leading-tight">
                  Propostas e recomendações para orientar o planejamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMAÇÕES ADICIONAIS DA CONFERÊNCIA */}
      <div className="space-y-12 mb-12 animate-fade-in">
        {/* EIXOS DE DISCUSSÃO */}
        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Layers size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Eixos de Discussão</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Democratização e Controle Social",
                "Territorialização nos Serviços do SUS",
                "Atenção Primária e a Saúde Mental",
                "Atenção aos Serviços de Urgência e Emergência",
                "Atenção aos Serviços Intermediários de Média ou Alta Complexidade",
                "Atenção aos Serviços Hospitalares"
              ].map((eixo, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group cursor-default">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      0{i + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{eixo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRÉ-CONFERÊNCIAS E PARTICIPAÇÃO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ESTATÍSTICAS RÁPIDAS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[48px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-full relative overflow-hidden min-h-[400px]">
              <div className="absolute -right-10 -top-10 opacity-10">
                <Users size={200} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Mobilização Social</p>
                <h3 className="text-6xl font-black tracking-tighter mb-6">879</h3>
                <p className="text-lg font-bold leading-tight opacity-90">Participantes ativos nas pré-conferências municipais.</p>
              </div>
              <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">39</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pré-conferências Realizadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black">282</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Propostas Aprovadas na Plenária</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LOCAIS DAS PRÉ-CONFERÊNCIAS */}
          <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-200 shadow-sm p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                  <MapPin size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Territórios Alcançados</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[450px]">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cohab Tablada", "Fragata", "Sítio Floresta", "Balneário dos Prazeres", "Colônia Z3", 
                    "Monte Bonito", "Santa Terezinha", "Pedreiras", "Py Crespo", "UBS Porto", 
                    "Navegantes II", "UBS Cruzeiro", "Areal", "Faculdade de Odontologia", "UFPEL–Campus Anglo", 
                    "UBS Sansca", "Associação de Moradores da Balsa", "UBS Balsa", "Vila Princesa", 
                    "UBS Osório", "Laranjal", "Simões Lopes", "Pestano", "Getúlio Vargas", "Cascata", "Fátima"
                  ].map((local, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-default">
                      {local}
                    </span>
                  ))}
                </div>
                
                <div className="mt-10 pt-10 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pré-conferências Temáticas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Saúde Mental", "Unidade Cuidativa", "Saúde das Mulheres", "Quilombo do Algodão", 
                      "Aldeia Gyró", "Quilombo Vó Elvira", "Presídio de Pelotas", "Povo de Terreiro", 
                      "IFSUL", "Pessoas com TEA", "Quilombo Alto do Caixão", "Cerrito Alegre", "Colônia Ramos"
                    ].map((tema, i) => (
                      <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-xs font-black border border-indigo-100 hover:bg-indigo-100 transition-all cursor-default">
                        {tema}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATÓRIO PDF INTEGRADO */}
      {driveLink ? (
        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden relative h-[700px] shrink-0">
          <div className="w-full h-full relative group">
            <iframe 
              src={driveLink} 
              className="w-full h-full border-none" 
              title="Relatório da Conferência" 
              allowFullScreen
            />
            <button 
              onClick={() => setIsProjecting(true)}
              className="absolute bottom-8 right-8 p-4 bg-indigo-600 text-white rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 flex items-center gap-3 font-black text-xs uppercase tracking-widest"
            >
              <Maximize2 size={20} /> Tela Cheia
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden relative p-10 text-center shrink-0">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="p-8 bg-indigo-50 text-indigo-600 rounded-[40px] border border-indigo-100 shadow-inner">
              <FileText size={80} strokeWidth={1} />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Nenhum PDF Vinculado</h3>
              <p className="text-slate-500 font-medium italic">O relatório da conferência ainda não foi configurado. Adicione um link do Google Drive para visualizá-lo aqui.</p>
            </div>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
            >
              <FilePlus size={20} /> Configurar Relatório
            </button>
          </div>
        </div>
      )}

      {/* MONITORAMENTO E OBSERVAÇÕES OCULTOS POR SOLICITAÇÃO */}


      {/* MODAL DE PROJEÇÃO DE PROPOSTAS (SLIDE SHOW) */}
      {isProposalProjectorOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-950 flex flex-col animate-fade-in">
          <div className="bg-slate-900 p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Monitor size={24} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm tracking-[0.2em]">Projetor de Diretrizes</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Visualização em Alta Definição para Conferência</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64 md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Filtrar projeção..." 
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-white text-xs" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => setIsProposalProjectorOpen(false)}
                className="p-4 bg-white/5 text-white rounded-2xl hover:bg-red-600 transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_50%)]">
            <div className="max-w-6xl mx-auto space-y-12">
              {Object.entries(groupedProposals).map(([category, items]) => (
                <div key={category} className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{category}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {(items as Proposal[]).map(p => (
                      <div key={p.id} className="bg-white/5 border border-white/10 p-12 rounded-[60px] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                          <Fingerprint size={200} />
                        </div>
                        <div className="relative z-10 space-y-8">
                          <div className="flex items-center gap-4">
                            <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${p.status === 'Implementada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                              {p.status}
                            </div>
                          </div>
                          <h4 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter">{p.title}</h4>
                          <div className="p-8 bg-white/5 rounded-[40px] border border-white/5">
                            <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed font-medium italic">"{p.description}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedProposals).length === 0 && (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                  <div className="p-8 bg-white/5 text-slate-600 rounded-full">
                    <Search size={80} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nenhuma diretriz encontrada</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest">Tente outro termo de pesquisa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PROJEÇÃO (TELA CHEIA) */}
      {isProjecting && driveLink && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col animate-fade-in">
          <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <Monitor size={20} />
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Modo Projeção</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Relatório da 17ª Conferência Municipal de Saúde</p>
              </div>
            </div>
            <button 
              onClick={() => setIsProjecting(false)}
              className="p-3 bg-slate-700 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
            >
              <X size={18} /> Sair da Projeção
            </button>
          </div>
          <div className="flex-1 bg-black">
            <iframe 
              src={driveLink} 
              className="w-full h-full border-none" 
              title="Projeção do Relatório"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* MODAL CADASTRO REFINADO */}
      {isAddingProposal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddingProposal(false)}></div>
          <div className="bg-white rounded-[56px] shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col border border-slate-100 animate-scale-in">
             <div className="bg-slate-900 p-12 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-8">
                   <div className="p-5 bg-indigo-600 rounded-3xl shadow-xl"><FileText size={36}/></div>
                   <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{editingProposal ? 'Ajustar Diretriz' : 'Nova Diretriz'}</h3>
                     <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.2em] mt-3">Sincronização de Decisões Estratégicas</p>
                   </div>
                </div>
                <button onClick={() => setIsAddingProposal(false)} className="p-4 hover:bg-white/10 rounded-full transition-all"><X size={44}/></button>
             </div>
             
             <div className="p-12 space-y-8 overflow-y-auto flex-1 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Eixo Temático</label>
                    <input type="text" value={proposalForm.category} onChange={(e) => setProposalForm({...proposalForm, category: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm" placeholder="Ex: Gestão e Financiamento" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Status de Execução</label>
                    <select value={proposalForm.status} onChange={(e) => setProposalForm({...proposalForm, status: e.target.value as any})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm">
                      <option value="Aprovada">Aprovada pela Conferência</option>
                      <option value="Implementada">Implementada no Plano</option>
                      <option value="Em Análise">Em Análise Técnica</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Título da Proposta (Curto)</label>
                  <input type="text" value={proposalForm.title} onChange={(e) => setProposalForm({...proposalForm, title: e.target.value})} className="w-full p-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm" placeholder="Ex: Ampliação do Serviço de Saúde Mental" />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Texto Integral da Diretriz</label>
                  <textarea value={proposalForm.description} onChange={(e) => setProposalForm({...proposalForm, description: e.target.value})} className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl h-44 font-medium text-slate-700 outline-none focus:border-indigo-500 resize-none shadow-sm" placeholder="Descreva aqui o detalhamento técnico aprovado..." />
                </div>
                <div className="pt-8 border-t border-slate-200">
                  <div className="max-w-md mx-auto text-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Autenticação do Conselho de Saúde</label>
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-5 bg-slate-100 border-2 border-slate-200 rounded-[24px] text-center font-black tracking-[0.5em] mb-6 text-2xl outline-none focus:border-indigo-500" placeholder="****" />
                    {error && <p className="text-red-500 text-[10px] font-black uppercase mb-6 animate-pulse">{error}</p>}
                    <button onClick={handleSaveProposal} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4">
                       <Save size={24}/> Registrar Diretriz
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO DRIVE */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          <div className="bg-white rounded-[40px] shadow-xl w-full max-w-2xl relative z-10 p-12 space-y-8 border border-slate-100">
            <h3 className="font-black text-slate-800 text-2xl uppercase tracking-tighter">Relatório de Conferência Externo</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">URL do Visualizador PDF (Google Drive)</label>
                <input type="text" value={tempLink} onChange={(e) => setDriveLinkTemp(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold outline-none focus:border-indigo-500" placeholder="Cole o link compartilhado..." />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-5 border-2 border-slate-200 rounded-3xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={() => { 
                  const formatted = formatDriveLink(tempLink);
                  storage.setItem('cms_conference_drive_link', formatted); 
                  setDriveLink(formatted); 
                  setDriveLinkTemp(formatted);
                  setIsConfigOpen(false); 
                }} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Sincronizar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsConference;
