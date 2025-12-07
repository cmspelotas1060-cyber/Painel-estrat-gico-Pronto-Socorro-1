import React, { useState, useRef } from 'react';
import { generateHospitalImage, editHospitalImage, analyzeImage } from '../services/geminiService';
import { Image as ImageIcon, Wand2, RefreshCw, Upload, Camera, Loader2 } from 'lucide-react';

const MediaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze'>('generate');
  
  // Generation State
  const [genPrompt, setGenPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Edit State
  const [editPrompt, setEditPrompt] = useState("");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Handlers
  const handleGenerate = async () => {
    if (!genPrompt) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateHospitalImage(genPrompt, size, aspectRatio);
      if (result) setGeneratedImage(result);
    } catch (e) {
      alert("Erro na geração de imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt || !sourceImage) return;
    setLoading(true);
    setEditedImage(null);
    try {
      const cleanBase64 = sourceImage.split(',')[1];
      const result = await editHospitalImage(cleanBase64, editPrompt);
      if (result) setEditedImage(result);
    } catch (e) {
      alert("Erro na edição de imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!sourceImage) return;
    setLoading(true);
    setAnalysisResult(null);
    try {
      const cleanBase64 = sourceImage.split(',')[1];
      const result = await analyzeImage(cleanBase64, "Analise esta imagem detalhadamente no contexto de um ambiente hospitalar. Identifique equipamentos, condições e segurança.");
      setAnalysisResult(result);
    } catch (e) {
      alert("Erro na análise.");
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setEditedImage(null);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wand2 className="text-pink-600" />
          Estúdio de Mídia IA
        </h1>
        <p className="text-slate-500 mt-2">
          Gere visualizações arquitetônicas, edite fotos do PS ou analise imagens de equipamentos.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'generate' ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Gerar Imagem (Pro)
          </button>
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-slate-50 text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Editar Imagem (Banana)
          </button>
          <button 
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'analyze' ? 'bg-slate-50 text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Analisar Imagem (Pro)
          </button>
        </div>

        <div className="p-6 flex-1 bg-slate-50">
          {activeTab === 'generate' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full">
              <div className="w-full lg:w-1/3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
                  <textarea 
                    className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Uma sala de espera de hospital moderna, limpa, com cadeiras azuis e boa iluminação..."
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Aspect Ratio</label>
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      {["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resolução</label>
                    <select 
                      value={size} 
                      onChange={(e) => setSize(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="1K">1K</option>
                      <option value="2K">2K</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || !genPrompt}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                  Gerar
                </button>
              </div>

              <div className="flex-1 bg-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 min-h-[400px]">
                {loading ? (
                  <Loader2 className="animate-spin text-slate-400" size={48} />
                ) : generatedImage ? (
                  <img src={generatedImage} alt="Gerada" className="max-h-full max-w-full rounded-lg shadow-lg object-contain" />
                ) : (
                  <div className="text-center text-slate-500">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p>A imagem gerada aparecerá aqui</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
             <div className="flex flex-col lg:flex-row gap-6 h-full">
               <div className="w-full lg:w-1/3 space-y-4">
                 <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white text-center cursor-pointer hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <Upload className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Clique para enviar imagem</span>
                 </div>

                 {sourceImage && (
                   <div className="h-40 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                     <img src={sourceImage} alt="Source" className="max-h-full max-w-full object-contain" />
                   </div>
                 )}

                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instrução de Edição</label>
                  <textarea 
                    className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    placeholder="Ex: Adicione um filtro retrô, remova a pessoa no fundo..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                  />
                 </div>

                 <button 
                  onClick={handleEdit}
                  disabled={loading || !editPrompt || !sourceImage}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                  Editar (Nano Banana)
                </button>
               </div>

               <div className="flex-1 bg-slate-200 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 min-h-[400px]">
                {loading ? (
                  <Loader2 className="animate-spin text-slate-400" size={48} />
                ) : editedImage ? (
                  <img src={editedImage} alt="Editada" className="max-h-full max-w-full rounded-lg shadow-lg object-contain" />
                ) : (
                  <div className="text-center text-slate-500">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p>A imagem editada aparecerá aqui</p>
                  </div>
                )}
               </div>
             </div>
          )}

          {activeTab === 'analyze' && (
             <div className="flex flex-col lg:flex-row gap-6 h-full">
              <div className="w-full lg:w-1/3 space-y-4">
                 <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white text-center cursor-pointer hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <Camera className="mx-auto text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Tirar/Enviar foto para análise</span>
                 </div>
                 {sourceImage && (
                   <div className="h-60 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                     <img src={sourceImage} alt="Source" className="max-h-full max-w-full object-contain" />
                   </div>
                 )}
                 <button 
                  onClick={handleAnalyze}
                  disabled={loading || !sourceImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Camera size={18} />}
                  Analisar
                </button>
              </div>
              <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 overflow-y-auto">
                 {loading ? (
                    <div className="flex items-center justify-center h-full">
                       <Loader2 className="animate-spin text-purple-600" size={32} />
                    </div>
                 ) : analysisResult ? (
                   <div className="prose prose-slate">
                     <h3 className="text-lg font-bold mb-4">Resultado da Análise Visual</h3>
                     <p className="whitespace-pre-wrap">{analysisResult}</p>
                   </div>
                 ) : (
                   <div className="text-center text-slate-400 mt-20">
                     Faça upload de uma imagem para começar a análise.
                   </div>
                 )}
              </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaStudio;