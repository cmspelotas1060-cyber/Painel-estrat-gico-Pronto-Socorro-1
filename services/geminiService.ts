
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { GenerationModel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to format detailed stats into text
const formatDetailedStats = (statsJson: string | null): string => {
  if (!statsJson) return "";
  try {
    const parsed = JSON.parse(statsJson);
    let s: any = {};

    // Check if it's the structure with periods (jan, feb, q1...)
    if (parsed.jan || parsed.q1) {
       // Aggregate totals from all available periods (months + quarters)
       const keys = [
         'i1_acolhimento', 'i1_consultas',
         'i2_consultas_psp', 'i2_upa_areal', 'i2_traumato_sc', 'i2_ubs',
         'i3_ubs', 'i3_traumato_sc', 'i3_pouco_urgente', 'i3_urgencia', 'i3_emergencia', 'i3_upa',
         'i4_pelotas', 'i4_outros_municipios',
         'i5_bucomaxilo', 'i5_cirurgia_vascular', 'i5_clinica_medica', 'i5_ginecologia', 'i5_pediatria', 'i5_servico_social',
         'i6_samu', 'i6_ecosul', 'i6_brigada_militar', 'i6_susepe', 'i6_policia_civil',
         'i7_ac_bicicleta', 'i7_ac_caminhao', 'i7_ac_carro', 'i7_ac_moto', 'i7_ac_onibus', 'i7_atropelamento', 'i7_ac_charrete', 'i7_ac_trator',
         'i8_ac_trabalho', 'i8_afogamento', 'i8_agressao', 'i8_choque_eletrico', 'i8_queda', 'i8_queimadura',
         'i9_arma_fogo', 'i9_arma_branca',
         'i10_clinico_adulto', 'i10_uti_adulto', 'i10_pediatria', 'i10_uti_pediatria',
         'i11_mp_clinico_adulto', 'i11_mp_uti_adulto', 'i11_mp_pediatria', 'i11_mp_uti_pediatria',
         'i12_aguardando_leito', 'i12_alta', 'i12_bloco_cirurgico',
         'i14_laboratoriais', 'i14_transfuscoes',
         'i15_tomografias', 'i15_angiotomografia', 'i15_raio_x',
         'i16_endoscopia', 'i16_oftalmo', 'i16_otorrino', 'i16_ultrasson', 'i16_urologia'
       ];
       
       // Initialize sums
       keys.forEach(k => s[k] = 0);
       
       // Sum up all available periods (jan, feb... q1, q2...)
       Object.values(parsed).forEach((periodData: any) => {
         keys.forEach(k => {
            const val = parseFloat(periodData[k]) || 0;
            s[k] += val;
         });
       });

       // Handle remaining text fields. For text fields, we might just take the first non-empty value or concatenate.
       // For simplicity, we check if any period has text for i13.
       let i13_text = "";
       Object.values(parsed).forEach((periodData: any) => {
         if (periodData.i13_permanencia_oncologico && !i13_text) {
           i13_text = periodData.i13_permanencia_oncologico;
         }
       });
       s.i13_permanencia_oncologico = i13_text || "N/A";

    } else {
       // Old format fallback
       s = parsed;
    }

    return `
DADOS DETALHADOS DE INDICADORES (CONSOLIDADO TOTAL - MESES + QUADRIMESTRES):
1. Acolhimentos/Consultas: Acolhimento (${s.i1_acolhimento || 0}), Consultas (${s.i1_consultas || 0}).
2. TOTAL ATENDIDOS/ENCAMINHADOS: Consultas PSP (${s.i2_consultas_psp || 0}), UPA AREAL (${s.i2_upa_areal || 0}), Traumato SC (${s.i2_traumato_sc || 0}), UBS (${s.i2_ubs || 0}).
3. CLASSIFICAÇÃO DE RISCO: UBS (${s.i3_ubs || 0}), Traumato SC (${s.i3_traumato_sc || 0}), Pouco Urgente (${s.i3_pouco_urgente || 0}), Urgência (${s.i3_urgencia || 0}), Emergência (${s.i3_emergencia || 0}), UPA (${s.i3_upa || 0}).
4. ORIGEM PACIENTES ATENDIDOS: Pelotas (${s.i4_pelotas || 0}), Outros Municípios (${s.i4_outros_municipios || 0}).
5. POR ESPECIALIDADE: Bucomaxilofacial (${s.i5_bucomaxilo || 0}), Cirurgia/Vascular/Angiologia (${s.i5_cirurgia_vascular || 0}), Clínica Médica (${s.i5_clinica_medica || 0}), Ginecologia (${s.i5_ginecologia || 0}), Pediatria (${s.i5_pediatria || 0}), Serviço Social (${s.i5_servico_social || 0}).
6. TRAZIDOS POR: SAMU (${s.i6_samu || 0}), Ecosul (${s.i6_ecosul || 0}), Brigada Militar (${s.i6_brigada_militar || 0}), SUSEPE (${s.i6_susepe || 0}), Polícia Civil (${s.i6_policia_civil || 0}).
7. ACIDENTE TRÂNSITO: Bicicleta (${s.i7_ac_bicicleta || 0}), Caminhão (${s.i7_ac_caminhao || 0}), Carro (${s.i7_ac_carro || 0}), Moto (${s.i7_ac_moto || 0}), Ônibus (${s.i7_ac_onibus || 0}), Atropelamento (${s.i7_atropelamento || 0}), Charrete (${s.i7_ac_charrete || 0}), Trator (${s.i7_ac_trator || 0}).
8. OUTROS ACIDENTES: Trabalho (${s.i8_ac_trabalho || 0}), Afogamento (${s.i8_afogamento || 0}), Agressão (${s.i8_agressao || 0}), Choque Elétrico (${s.i8_choque_eletrico || 0}), Queda (${s.i8_queda || 0}), Queimadura (${s.i8_queimadura || 0}).
9. VIOLÊNCIA: Arma de Fogo (${s.i9_arma_fogo || 0}), Arma Branca (${s.i9_arma_branca || 0}).
10. TAXA OCUPAÇÃO LEITOS (Média Acumulada): Clínico Adulto (${s.i10_clinico_adulto || 0}), UTI Adulto (${s.i10_uti_adulto || 0}), Pediatria (${s.i10_pediatria || 0}), UTI Pediatria (${s.i10_uti_pediatria || 0}).
11. MÉDIA PERMANÊNCIA AGUARDANDO LEITO (Acumulado): Clínico Adulto (${s.i11_mp_clinico_adulto || 0}), UTI Adulto (${s.i11_mp_uti_adulto || 0}), Pediatria (${s.i11_mp_pediatria || 0}), UTI Pediatria (${s.i11_mp_uti_pediatria || 0}).
12. ADULTOS AGUARDANDO (ALTA/BLOCO): Aguardando Leito (${s.i12_aguardando_leito || 0}), Alta (${s.i12_alta || 0}), Bloco Cirúrgico (${s.i12_bloco_cirurgico || 0}).
13. PERMANÊNCIA ONCOLÓGICOS: ${s.i13_permanencia_oncologico || 'N/A'}.
14. ANÁLISES CLÍNICAS/TRANSFUSÕES: Laboratoriais (${s.i14_laboratoriais || 0}), Transfusões (${s.i14_transfuscoes || 0}).
15. EXAMES IMAGEM: Tomografias (${s.i15_tomografias || 0}), Angiotomografia (${s.i15_angiotomografia || 0}), Raio X (${s.i15_raio_x || 0}).
16. EXAMES ESPECIAIS: Endoscopia (${s.i16_endoscopia || 0}), Oftalmo (${s.i16_oftalmo || 0}), Otorrino (${s.i16_otorrino || 0}), Ultrasson (${s.i16_ultrasson || 0}), Urologia (${s.i16_urologia || 0}).
`;
  } catch (e) {
    return "";
  }
};

// --- Text & Analysis ---

export const generateReportAnalysis = async (
  contextData: string, 
  useThinking: boolean = false,
  useSearch: boolean = false
): Promise<{ text: string; sources?: any[] }> => {
  const modelName = useThinking ? GenerationModel.Pro : (useSearch ? GenerationModel.Flash : GenerationModel.FlashLite);
  
  // Fetch detailed stats from storage to augment context (ps_monthly_detailed_stats is the new key)
  const detailedStats = localStorage.getItem('ps_monthly_detailed_stats') || localStorage.getItem('ps_detailed_stats');
  const formattedStats = formatDetailedStats(detailedStats);

  const fullContext = `${contextData}\n\n${formattedStats}`;

  const config: any = {};

  if (useThinking) {
    // gemini-3-pro-preview max thinking budget
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Você é um especialista em gestão hospitalar. Analise os seguintes dados do Pronto-Socorro e forneça insights estratégicos.\n\nDados:\n${fullContext}`,
      config,
    });

    const text = response.text || "Não foi possível gerar a análise.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text, sources };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

export const chatWithBot = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  contextData?: string
) => {
  try {
    let systemInstruction = "Você é um assistente virtual especializado em saúde pública e gestão hospitalar. Responda de forma profissional e concisa.";
    
    // Fetch detailed stats
    const detailedStats = localStorage.getItem('ps_monthly_detailed_stats') || localStorage.getItem('ps_detailed_stats');
    const formattedStats = formatDetailedStats(detailedStats);
    const fullContext = contextData ? `${contextData}\n\n${formattedStats}` : formattedStats;

    if (fullContext) {
      systemInstruction += `\n\nUse os seguintes dados do Pronto-Socorro como base para suas respostas sempre que relevante:\n${fullContext}`;
    }

    const chat = ai.chats.create({
      model: GenerationModel.Pro,
      history: history,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

// --- Image Understanding ---

export const analyzeImage = async (base64Image: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: GenerationModel.Pro, // Strongest multimodal reasoning
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
};

// --- Image Generation & Editing ---

export const generateHospitalImage = async (
  prompt: string, 
  size: "1K" | "2K" | "4K", 
  aspectRatio: string
) => {
  // gemini-3-pro-image-preview for high quality generation
  try {
    const response = await ai.models.generateContent({
      model: GenerationModel.ProImage,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio as any,
        }
      }
    });

    // Check for inline data in parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image gen error:", error);
    throw error;
  }
};

export const editHospitalImage = async (base64Image: string, prompt: string) => {
  // gemini-2.5-flash-image for editing (Nano Banana)
  try {
    const response = await ai.models.generateContent({
      model: GenerationModel.FlashImage,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/png", data: base64Image } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image edit error:", error);
    throw error;
  }
};

// --- Maps Grounding ---

export const getGeoInsights = async (query: string, userLat?: number, userLng?: number) => {
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (userLat && userLng) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLat,
            longitude: userLng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: GenerationModel.Flash, // Maps works with Flash
      contents: query,
      config: config
    });

    return {
      text: response.text,
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Maps error:", error);
    throw error;
  }
};
