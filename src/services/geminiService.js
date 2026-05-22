import { generateDashboardConfig as generateWithOpenAI, isOpenAIConfigured } from './openaiService.js';
import { generateDashboardConfig as generateWithGroq, isGroqConfigured } from './groqService.js';
import { generateDashboardConfig as generateWithPollinations } from './pollinationsService.js';
import { buildSystemPrompt } from './dashboardPrompt.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-1.5-flash";
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER?.trim().toLowerCase() || "gemini";

// Circuit Breaker State
const providerStatus = {
  gemini: true,
  groq: true,
  openai: true
};

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  if (AI_PROVIDER === "openai") {
    console.log("🎯 [AI Engine] VITE_AI_PROVIDER=openai → Gemini atlanıyor, doğrudan OpenAI kullanılıyor");
    return generateWithOpenAI(metadataPrompt, userRequest, styleModifier);
  }

  let availableModels = [ENV_MODEL, "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];

  // 1. ADIM: Kullanılabilir Modelleri Keşfet
  try {
    console.log("🔍 [AI Engine] Kullanılabilir modeller taranıyor...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const listRes = await fetch(listUrl);
    
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.models && listData.models.length > 0) {
        const discovered = listData.models
          .filter(m => m.supportedGenerationMethods.includes("generateContent"))
          .map(m => m.name.split('/').pop());
        availableModels = [...new Set([ENV_MODEL, ...discovered])].filter(Boolean);
      }
    } else {
      console.warn(`⚠️ [AI Engine] Liste alınamadı (HTTP ${listRes.status}). Varsayılan modeller kullanılacak.`);
    }
  } catch (e) {
    console.warn("⚠️ [AI Engine] Liste hatası:", e.message);
  }

  if (availableModels.length === 0) {
    availableModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];
  }

  const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);
  let lastError = null;

  // 2. ADIM: Gemini Survivor Mode
  // Zorla deneme modu: Her zaman deniyoruz
  if (true) {
    for (const modelName of availableModels) {
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
          console.log(`🚀 [AI Engine] Deneniyor: ${modelName} (${apiVersion})`);
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

          const isV1 = apiVersion === 'v1';
          const requestBody = {
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nREQUEST: ${userRequest}\n\nMETADATA:\n${metadataPrompt}\n\nRANDOM_SEED: ${Math.random()}\n\nReturn ONLY valid JSON.` }] }],
            generationConfig: { 
              temperature: 0.7
            }
          };
          if (!isV1) {
            requestBody.generationConfig.response_mime_type = "application/json";
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const jsonMatch = text?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              console.log(`✅ [AI Engine] Gemini Başarılı: ${modelName} (${apiVersion})`);
              return JSON.parse(jsonMatch[0].trim());
            }
          } else {
            const err = await response.json().catch(() => ({}));
            lastError = err.error?.message || `HTTP ${response.status}`;
            console.warn(`⚠️ [AI Engine] Gemini ${modelName} (${apiVersion}) başarısız: ${lastError}`);
            if (response.status === 403 || response.status === 429) {
              providerStatus.gemini = false; // Kapasite veya yetki sorunu varsa bu turu kapat
            }
          }
        } catch (e) {
          lastError = e.message;
        }
      }
    }
  }

  // 3. ADIM: Groq Fallback
  if (isGroqConfigured() && providerStatus.groq) {
    console.warn(`⚠️ [AI Engine] Gemini devre dışı veya başarısız. Groq deneniyor...`);
    try {
      return await generateWithGroq(metadataPrompt, userRequest, styleModifier);
    } catch (groqError) {
      console.warn(`⚠️ [AI Engine] Groq başarısız: ${groqError.message}`);
      if (groqError.message.includes('401') || groqError.message.includes('429')) {
        providerStatus.groq = false;
      }
      lastError = `Gemini: ${lastError} | Groq: ${groqError.message}`;
    }
  }

  // 4. ADIM: OpenAI Fallback
  if (isOpenAIConfigured() && providerStatus.openai) {
    console.warn(`⚠️ [AI Engine] Groq devre dışı veya başarısız. OpenAI deneniyor...`);
    try {
      return await generateWithOpenAI(metadataPrompt, userRequest, styleModifier);
    } catch (openaiError) {
      console.warn(`⚠️ [AI Engine] OpenAI başarısız: ${openaiError.message}`);
      if (openaiError.message.includes('429') || openaiError.message.includes('quota')) {
        providerStatus.openai = false;
      }
      lastError = `${lastError} | OpenAI: ${openaiError.message}`;
    }
  }

  // 5. ADIM: Pollinations Architect (Son Çare)
  console.warn(`⚠️ [AI Engine] Kritik seviye: Pollinations Architect devreye giriyor...`);
  try {
    return await generateWithPollinations(metadataPrompt, userRequest, styleModifier);
  } catch (pollError) {
    throw new Error(`Tüm AI servisleri devre dışı: ${lastError} | Pollinations: ${pollError.message}`);
  }
}

export async function refineDashboardWithGemini(selectedLayout, metadataPrompt, userRequest) {
  const layoutShell = selectedLayout.widgets.map((w, index) => ({
    widget_index: index + 1,
    gridPosition: w.gridPosition
  }));

  const refinedRequest = `USER ORIGINAL REQUEST: ${userRequest}
  
CRITICAL MISSION: The user has selected a specific layout concept. You MUST fill this exact layout with real data bindings.

SELECTED CONCEPT:
Title: ${selectedLayout.title}
Description: ${selectedLayout.description}

GRID LAYOUT SHELL (MANDATORY):
${JSON.stringify(layoutShell, null, 2)}

INSTRUCTIONS:
1. OPTIMIZE THE GRID: You MUST output exactly ${layoutShell.length} widgets. Use the GRID LAYOUT SHELL as a starting point, but you MUST OPTIMIZE the 'gridPosition' (colSpan, rowSpan). A full row is 12 columns. Give tables/charts colSpan 6 or 12. Give KPIs colSpan 3 or 4. NEVER use colSpan 1 or 2 (it makes the UI cramped and the user hates it).
2. DATA VARIETY: You MUST use a wide variety of data points. DO NOT repeat the same metrics or {{tag}}s across multiple widgets. Each widget must analyze a completely different aspect of the USER ORIGINAL REQUEST.
3. BIND REAL DATA: Replace the dummy wireframes from the concept with fully designed Tailwind HTML templates that bind the real data tags (e.g., {{tag}}) from the metadata. Ensure the design visually matches what the concept's 'Description' promised.
4. PREMIUM DESIGN: Make the HTML templates ultra-luxurious with glassmorphism, gradients, padding (p-6), and dark mode aesthetics. Ensure text has enough breathing room.`;

  console.log("💎 [Gemini Refine] Taslak Gemini ile mükemmelleştiriliyor...");
  
  try {
    // Gemini'nin en güçlü modelini (Pro) kullanmaya çalış
    const result = await generateDashboardConfig(metadataPrompt, refinedRequest, "LUXURY DATA BINDING PHASE");
    return result;
  } catch (err) {
    console.error("❌ [Gemini Refine] Başarısız:", err.message);
    throw err;
  }
}
