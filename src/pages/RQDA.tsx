
import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Share2, Download, 
  ChevronRight, TrendingUp, DollarSign, Activity,
  CheckCircle, Loader2, Link as LinkIcon,
  Plus, Trash2, ChevronDown, ChevronUp,
  ExternalLink, Sparkles, Target, CheckCircle2, AlertCircle
} from 'lucide-react';
import { syncService } from '../services/supabase';
import { storage } from '../services/storage';
import { EditableText } from '../components/EditableText';
import { DynamicNotes } from '../components/DynamicNotes';

const DOMI_INDICATORS = [
  { id: 'i1_acolhimento', label: 'Acolhimentos Totais', meta: 20000 },
  { id: 'i1_consultas', label: 'Consultas Médicas', meta: 5000 },
  { id: 'i2_consultas_psp', label: 'Consultas PSP', meta: 1000 },
  { id: 'i2_upa_areal', label: 'Encaminhados UPA Areal', meta: 500, reverse: true },
  { id: 'i2_traumato_sc', label: 'Encaminhados Traumato SC', meta: 300, reverse: true },
  { id: 'i2_ubs', label: 'Encaminhados UBS', meta: 400, reverse: true },
  { id: 'i3_ubs', label: 'Classificação: UBS' },
  { id: 'i3_traumato_sc', label: 'Classificação: Traumato SC' },
  { id: 'i3_pouco_urgente', label: 'Classificação: Pouco Urgente', reverse: true, meta: 1000 },
  { id: 'i3_urgencia', label: 'Classificação: Urgência' },
  { id: 'i3_emergencia', label: 'Classificação: Emergência' },
  { id: 'i3_upa', label: 'Classificação: UPA' },
  { id: 'i4_pelotas', label: 'Origem: Pelotas' },
  { id: 'i4_outros_municipios', label: 'Origem: Outros Municípios' },
  { id: 'i5_bucomaxilo', label: 'Especialidade: Bucomaxilo' },
  { id: 'i5_cirurgia_vascular', label: 'Especialidade: Cirurgia Vascular' },
  { id: 'i5_clinica_medica', label: 'Especialidade: Clínica Médica' },
  { id: 'i5_ginecologia', label: 'Especialidade: Ginecologia' },
  { id: 'i5_pediatria', label: 'Especialidade: Pediatria' },
  { id: 'i5_servico_social', label: 'Especialidade: Serviço Social' },
  { id: 'i6_samu', label: 'Trazidos por: SAMU' },
  { id: 'i6_ecosul', label: 'Trazidos por: Ecosul' },
  { id: 'i6_brigada_militar', label: 'Trazidos por: Brigada Militar' },
  { id: 'i6_susepe', label: 'Trazidos por: SUSEPE' },
  { id: 'i6_policia_civil', label: 'Trazidos por: Polícia Civil' },
  { id: 'i7_ac_bicicleta', label: 'Acidente: Bicicleta', reverse: true, meta: 50 },
  { id: 'i7_ac_caminhao', label: 'Acidente: Caminhão', reverse: true, meta: 20 },
  { id: 'i7_ac_carro', label: 'Acidente: Carro', reverse: true, meta: 100 },
  { id: 'i7_ac_moto', label: 'Acidente: Moto', reverse: true, meta: 200 },
  { id: 'i7_ac_onibus', label: 'Acidente: Ônibus', reverse: true, meta: 10 },
  { id: 'i7_atropelamento', label: 'Acidente: Atropelamento', reverse: true, meta: 30 },
  { id: 'i7_ac_charrete', label: 'Acidente: Charrete', reverse: true, meta: 5 },
  { id: 'i7_ac_trator', label: 'Acidente: Trator', reverse: true, meta: 2 },
  { id: 'i8_ac_trabalho', label: 'Acidente: Trabalho', reverse: true, meta: 50 },
  { id: 'i8_afogamento', label: 'Acidente: Afogamento', reverse: true, meta: 1 },
  { id: 'i8_agressao', label: 'Acidente: Agressão', reverse: true, meta: 80 },
  { id: 'i8_choque_eletrico', label: 'Acidente: Choque Elétrico', reverse: true, meta: 2 },
  { id: 'i8_queda', label: 'Acidente: Queda', reverse: true, meta: 150 },
  { id: 'i8_queimadura', label: 'Acidente: Queimadura', reverse: true, meta: 20 },
  { id: 'i9_arma_fogo', label: 'Violência: Arma de Fogo', reverse: true, meta: 10 },
  { id: 'i9_arma_branca', label: 'Violência: Arma Branca', reverse: true, meta: 15 },
  { id: 'i10_clinico_adulto', label: 'Ocupação: Clínico Adulto', suffix: '%', meta: 85 },
  { id: 'i10_uti_adulto', label: 'Ocupação: UTI Adulto', suffix: '%', meta: 90 },
  { id: 'i10_pediatria', label: 'Ocupação: Pediatria', suffix: '%', meta: 80 },
  { id: 'i10_uti_pediatria', label: 'Ocupação: UTI Pediatria', suffix: '%', meta: 85 },
  { id: 'i11_mp_clinico_adulto', label: 'Permanência: Clínico Adulto', suffix: ' d', reverse: true, meta: 5 },
  { id: 'i11_mp_uti_adulto', label: 'Permanência: UTI Adulto', suffix: ' d', reverse: true, meta: 10 },
  { id: 'i11_mp_pediatria', label: 'Permanência: Pediatria', suffix: ' d', reverse: true, meta: 4 },
  { id: 'i11_mp_uti_pediatria', label: 'Permanência: UTI Pediatria', suffix: ' d', reverse: true, meta: 8 },
  { id: 'i12_aguardando_leito', label: 'Aguardando Leito', reverse: true, meta: 5 },
  { id: 'i12_alta', label: 'Altas no Período' },
  { id: 'i12_bloco_cirurgico', label: 'Bloco Cirúrgico' },
  { id: 'i13_permanencia_oncologico', label: 'Permanência Oncológicos', reverse: true, meta: 7 },
  { id: 'i14_laboratoriais', label: 'Exames Laboratoriais', meta: 10000 },
  { id: 'i14_transfuscoes', label: 'Transfusões', meta: 200 },
  { id: 'i15_tomografias', label: 'Tomografias', meta: 1500 },
  { id: 'i15_angiotomografia', label: 'Angiotomografias', meta: 100 },
  { id: 'i15_raio_x', label: 'Raio X', meta: 3000 },
  { id: 'i16_endoscopia', label: 'Endoscopia', meta: 50 },
  { id: 'i16_oftalmo', label: 'Oftalmologia', meta: 80 },
  { id: 'i16_otorrino', label: 'Otorrinolaringologia', meta: 60 },
  { id: 'i16_ultrasson', label: 'Ultrassonografia', meta: 400 },
  { id: 'i16_urologia', label: 'Urologia', meta: 40 },
];

const RQDA: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [years, setYears] = useState<string[]>(() => {
    const saved = storage.getSync('ps_available_years');
    return saved ? saved : ['2024', '2025'];
  });
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1] || '2025');
  const [selectedPeriod, setSelectedPeriod] = useState('q1');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDiretriz1, setExpandedDiretriz1] = useState(true);

  useEffect(() => {
    const load = async () => {
      const saved = await storage.getItem('ps_monthly_detailed_stats');
      if (saved) setData(saved);
    };
    load();
  }, []);

  const handleAddYear = () => {
    const newYear = prompt('Digite o novo ano (ex: 2026):');
    if (newYear && /^\d{4}$/.test(newYear)) {
      if (!years.includes(newYear)) {
        const newYears = [...years, newYear].sort();
        setYears(newYears);
        storage.setItem('ps_available_years', newYears);
        setSelectedYear(newYear);
      } else {
        alert('Este ano já existe.');
      }
    } else if (newYear) {
      alert('Ano inválido. Use o formato AAAA.');
    }
  };

  const handleDeleteYear = () => {
    if (years.length <= 1) {
      alert('Não é possível excluir todos os anos.');
      return;
    }
    if (confirm(`Deseja realmente excluir o ano ${selectedYear} e todos os seus dados deste relatório?`)) {
      const newYears = years.filter(y => y !== selectedYear);
      setYears(newYears);
      storage.setItem('ps_available_years', newYears);
      setSelectedYear(newYears[newYears.length - 1]);
    }
  };

  const currentData = (data[selectedYear] && data[selectedYear][selectedPeriod]) || data[selectedPeriod] || {};

  const domiStats = React.useMemo(() => {
    let total = DOMI_INDICATORS.length;
    let met = 0;
    let unmet = 0;

    const parseVal = (v: any) => { 
      if (!v) return 0; 
      const clean = v.toString().replace('%', '').replace('R$', '').replace('k', '000').replace(',', '.').replace(/[^\d.-]/g, ''); 
      return parseFloat(clean); 
    };

    DOMI_INDICATORS.forEach(ind => {
      const val = parseVal(currentData[ind.id]);
      const meta = ind.meta || 0;
      const isMet = ind.reverse ? val <= meta : val >= meta;
      
      // We only count it as "met" if the meta is defined (> 0)
      if (meta > 0) {
        if (isMet) met++;
        else unmet++;
      } else {
        // If meta is not defined, we count progress as pending/unmet
        unmet++;
      }
    });

    return { total, met, unmet };
  }, [currentData]);

  const handleShareRQDA = async () => {
    setIsGenerating(true);
    try {
      const fullDb: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('supabase.auth.')) {
          fullDb[key] = localStorage.getItem(key);
        }
      }

      if (Object.keys(fullDb).length === 0) {
        throw new Error('Nenhum dado encontrado para compartilhar.');
      }

      const payload = { full_db: fullDb, ts: Date.now() };
      const shareId = await syncService.createShare(payload);
      
      const currentHash = window.location.hash.split('?')[0] || '#/rqda';
      const url = `${window.location.origin}${window.location.pathname}${currentHash}${currentHash.includes('?') ? '&' : '?'}id=${shareId}`;
      
      await navigator.clipboard.writeText(url);
      
      setCopySuccess(true);
      setTimeout(() => { setCopySuccess(false); setShowShareModal(false); }, 2000);
    } catch (e: any) { 
      console.error(e);
      alert(`Erro ao gerar link: ${e.message || 'Falha na conexão.'}`);
    } finally { 
      setIsGenerating(false); 
    }
  };

  const SummaryCard = ({ id, title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 break-inside-avoid">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          <EditableText id={`rqda_card_title_${id}`} defaultText={title} />
        </p>
        <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        <p className="text-xs text-slate-500 mt-1">
          <EditableText id={`rqda_card_sub_${id}`} defaultText={sub} />
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* HEADER PADRONIZADO RQDA */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative">
          <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl shrink-0">
             <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              <EditableText id="rqda_view_title" defaultText="RQDA" />
            </h1>
            <p className="text-blue-600/40 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-center sm:text-left">
              <EditableText id="rqda_data_sources" defaultText="Fontes de Dados: SMSPel • PSPel • UPA-Areal" />
            </p>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
              <Calendar size={16} className="text-blue-500"/>
              <EditableText id="rqda_view_subtitle" defaultText="Prestação de Contas Quadrimestral" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border-none text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl focus:ring-0 outline-none cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={handleAddYear} title="Adicionar Ano" className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all">
              <Plus size={14} />
            </button>
            <button onClick={handleDeleteYear} title="Excluir Ano Selecionado" className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {['q1', 'q2', 'q3'].map((q) => (
              <button key={q} onClick={() => setSelectedPeriod(q)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${selectedPeriod === q ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{q.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setShowShareModal(true)} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard id="prod" title="Produção Total" value={(parseFloat(currentData.i1_acolhimento) || 0).toLocaleString()} sub="Acolhimentos registrados" icon={TrendingUp} color="bg-blue-50 text-blue-600" />
        <SummaryCard id="inv" title="Investimento" value={`R$ ${(parseFloat(currentData.fin_total) || 0).toLocaleString('pt-BR')}`} sub="Custo operacional total" icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        <SummaryCard id="grave" title="Casos Graves" value={(parseFloat(currentData.i3_emergencia) || 0).toLocaleString()} sub="Emergências (Vermelho)" icon={Activity} color="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <button 
          onClick={() => setExpandedDiretriz1(!expandedDiretriz1)}
          className="w-full px-8 py-6 bg-slate-900 text-white font-black uppercase text-xs tracking-[0.3em] flex items-center justify-between hover:bg-black transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-blue-400" />
            <EditableText id="rqda_sec_domi" defaultText="DOMI 2026-2029" />
          </div>
          {expandedDiretriz1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedDiretriz1 ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-8 space-y-8">
            {/* QUADRO DE RESUMO ESTATÍSTICO DOMI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 mt-2">
              <div className="bg-slate-50 p-6 rounded-[24px] shadow-sm border border-slate-200 flex items-center gap-5 group hover:border-blue-300 transition-all">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Indicadores</p>
                  <p className="text-3xl font-black text-slate-900">{domiStats.total}</p>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-[24px] shadow-sm border border-emerald-100 flex items-center gap-5 group hover:border-emerald-300 transition-all">
                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Metas Atingidas</p>
                  <p className="text-3xl font-black text-emerald-600">{domiStats.met}</p>
                </div>
              </div>
              <div className="bg-red-50/50 p-6 rounded-[24px] shadow-sm border border-red-100 flex items-center gap-5 group hover:border-red-300 transition-all">
                <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-red-600/60 uppercase tracking-widest">Metas Não Atingidas</p>
                  <p className="text-3xl font-black text-red-600">{domiStats.unmet}</p>
                </div>
              </div>
            </div>

            {/* BOTÃO RAG PREMIUM - ESTILO PAINEL DE OCUPAÇÃO */}
            <div className="flex justify-center py-4">
              <a 
                href="https://drive.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative group overflow-hidden flex flex-col md:flex-row items-center gap-8 px-10 py-8 bg-slate-900 text-white rounded-[40px] shadow-2xl transition-all transform hover:-translate-y-2 border border-white/10 w-full"
              >
                {/* Efeitos de Fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 p-5 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[28px] shadow-2xl transform group-hover:rotate-6 transition-all duration-500">
                  <Sparkles size={32} className="text-white" />
                </div>
                
                <div className="relative z-10 text-center md:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-500/30">
                      <EditableText id="rqda_rag_premium_tag" defaultText="Institucional" />
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <EditableText id="rqda_rag_premium_subtitle" defaultText="Relatório Anual de Gestão" />
                    </p>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    <EditableText id="rqda_rag_premium_title" defaultText="RAG 2022-2025 / Documento Completo" />
                  </h4>
                  <p className="text-slate-400 text-xs font-medium max-w-md leading-relaxed">
                    <EditableText id="rqda_rag_premium_desc" defaultText="Acesse a documentação oficial completa, diretrizes e o consolidado quadrimestral de prestação de contas." />
                  </p>
                </div>
                
                <div className="relative z-10 p-4 bg-white/5 rounded-full text-slate-500 group-hover:text-white group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-xl">
                  <ExternalLink size={20} />
                </div>
                
                {/* Linha de brilho no topo */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOMI_INDICATORS.map((row: any, i) => {
                const val = (parseFloat(currentData[row.id]) || 0);
                const meta = row.meta || 0;
                const isMet = row.reverse ? val <= meta : val >= meta;
                const hasMeta = meta > 0;

                return (
                  <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center hover:shadow-md transition-all group ${hasMeta ? (isMet ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/30 border-red-100') : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-medium text-sm group-hover:text-blue-600 transition-colors">
                        <EditableText id={`rqda_domi_l_${row.id}`} defaultText={row.label} />
                      </span>
                      {hasMeta && (
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isMet ? 'text-emerald-600' : 'text-red-500'}`}>
                          Meta: {meta}{row.suffix || ''} • {isMet ? 'Atingida' : 'Abaixo da Meta'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-black ${hasMeta ? (isMet ? 'text-emerald-700' : 'text-red-700') : 'text-slate-800'}`}>
                        {val.toLocaleString()}
                        {row.suffix || ''}
                      </span>
                      {hasMeta && (
                        <div className={`mt-1 ${isMet ? 'text-emerald-500' : 'text-red-400'}`}>
                          {isMet ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-[32px] border border-slate-200 text-center text-slate-500 text-xs italic font-medium">
        <EditableText id="rqda_footer_disclaimer" defaultText="Este relatório é um documento oficial de prestação de contas do quadrimestre de 2025. Os dados são extraídos do Painel de Gestão Estratégica." />
      </div>
      <DynamicNotes sectionId={`rqda_${selectedYear}_${selectedPeriod}`} />
      {/* MODAL DE COMPARTILHAMENTO */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md relative z-10 p-10 border-2 border-slate-100 animate-scale-in">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              {isGenerating ? <Loader2 size={40} className="animate-spin" /> : <Share2 size={40} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter text-center mb-4">Compartilhar Relatório</h3>
            <p className="text-slate-500 text-center text-sm font-medium mb-8">Gere um link seguro para sincronizar todos os dados deste relatório com outros dispositivos.</p>
            
            {!copySuccess ? (
              <button 
                onClick={handleShareRQDA}
                disabled={isGenerating}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                {isGenerating ? 'Gerando Link...' : 'Gerar e Copiar Link'}
              </button>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-100 p-5 rounded-2xl flex items-center gap-4 animate-bounce-short">
                <CheckCircle className="text-emerald-600" size={24} />
                <span className="text-emerald-700 font-black uppercase text-xs tracking-widest">Link Copiado com Sucesso!</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes bounceShort { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-short { animation: bounceShort 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default RQDA;
