import Groq from 'groq-sdk';
import { buildSystemPrompt } from './dashboardPrompt.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();
const PRIMARY_MODEL = import.meta.env.VITE_GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

const FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768'
];

let groqClient = null;
function getGroqClient() {
  if (!groqClient && GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  return groqClient;
}

export function isGroqConfigured() {
  return Boolean(GROQ_API_KEY);
}

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY tanımlı değil');
  }

  const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);

  const modelsToTry = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🚀 [Groq] Deneniyor: ${modelName}`);
      const client = getGroqClient();
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `REQUEST: ${userRequest}\n\nMETADATA:\n${metadataPrompt}\n\nReturn a JSON object with at least 5 widgets. ONLY JSON.` }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const text = response.choices?.[0]?.message?.content;
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`✅ [Groq] Başarılı: ${modelName}`);
        return JSON.parse(jsonMatch[0].trim());
      }
      lastError = 'Boş yanıt';
    } catch (e) {
      lastError = e.message;
      console.warn(`⚠️ [Groq] ${modelName} başarısız: ${lastError}`);
      
      // If it's a rate limit error, maybe wait or just try next model
      if (lastError.includes('429')) {
        continue;
      }
    }
  }

  throw new Error(`Tüm Groq modelleri meşgul: ${lastError}`);
}

export async function generateMultipleDashboardConfigs(metadataPrompt, userRequest) {
  const designDirectives = buildSystemPrompt("PREMIUM LUXURY DESIGN");
  const bulkPrompt = `You are a World-Class Strategic UI/UX Planner. 
  Generate 3 RADICALLY DIFFERENT and DISTINCT LUXURY DASHBOARD STRATEGIES in a JSON array.
  
  IMPORTANT: All titles and descriptions MUST be in TURKISH.
  
  CRITICAL INSTRUCTION: The USER REQUEST is your absolute highest priority. You MUST build the dashboard to answer exactly what the user asked for. The 3 strategies should be different VISUAL AND STRUCTURAL INTERPRETATIONS of solving the EXACT SAME USER REQUEST. Do not generate random metrics if the user asked for something specific.
  
  TASK: Based on the USER REQUEST, invent 3 completely different design themes/styles (e.g., one minimal, one data-heavy, one visual/chart-heavy).
  USER REQUEST: ${userRequest}
  COLUMN HEADERS: ${metadataPrompt}
  
  FORMAT: 
  [
    {
      "title": "Strateji Adı (Örn: Minimalist Veri Akışı, Siber Analitik vs.)",
      "subtitle": "Kısa ve havalı bir alt başlık",
      "description": "Burada bu spesifik tasarım konseptinin neden diğerlerinden tamamen FARKLI olduğunu, hangi görsel tarzı benimsediğini ve KULLANICI İSTEĞİNİ (${userRequest}) nasıl farklı bir açıyla çözdüğünü detaylı ve etkileyici bir Türkçe ile açıkla. Seçilen benzersiz stile vurgu yap.",
      "widgets": [
        {
          "type": "dynamic_canvas",
          "gridPosition": { "colSpan": 4, "rowSpan": 2, "order": 1 },
          "config": {
             "htmlTemplate": "<div class='w-full h-full bg-slate-900/40 rounded-3xl border border-white/5 flex items-center justify-center p-4'> ... </div>"
          }
        }
      ] 
    }
  ]
  
  RULES:
  - Language: TURKISH.
  - Tone: Professional, persuasive, luxury-oriented.
  - CONTENT: All 3 concepts MUST analyze and display what was requested in the USER REQUEST.
  - WIDGETS ARRAY: You MUST provide at least 5-6 widgets per concept.
  - LAYOUT DIVERSITY: The gridPositions (colSpan, rowSpan, order) MUST BE COMPLETELY DIFFERENT across the 3 concepts. Concept 1 might have a huge top widget, Concept 2 might have side-by-side columns, Concept 3 might be a dynamic masonry layout.
  - VISUAL DIVERSITY: The HTML mockups inside \`config.htmlTemplate\` MUST visually reflect the different themes.
  - NO WIDGET TITLES: Do not include "title" inside the widget object. The visual should speak for itself.
  - WIREFRAME HTML: For \`config.htmlTemplate\`, you MUST write CUSTOM Tailwind CSS HTML that VISUALLY MATCHES both the widget type AND the specific design theme of this concept!
    - If your description mentions a TABLE, generate a dummy HTML table (empty rows/lines).
    - If it's a BAR CHART, generate div bars of different heights.
    - If it's a PIE CHART, generate a circular div with borders/gradients.
    - If it's a KPI NUMBER, generate a large text skeleton.
  - DO NOT COPY PASTE ONE EXAMPLE. Every concept must feel like it was designed by a different world-class designer.`;

  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY tanımlı değil');

  const client = getGroqClient();
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError = null;

  for (const model of models) {
    try {
      console.log(`⚡ [Groq Bulk] Deneniyor: ${model}`);
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: "You are a World-Class UI Architect. You output ONLY valid JSON arrays of dashboard objects." },
          { role: 'user', content: bulkPrompt }
        ],
        temperature: 0.8, // Daha fazla yaratıcılık ve çeşitlilik için artırıldı
      });

      const text = response.choices?.[0]?.message?.content;
      const jsonMatch = text?.match(/\[[\s\S]*\]/); // Array match
      if (jsonMatch) {
        console.log(`✅ [Groq Bulk] Başarılı: ${model}`);
        return JSON.parse(jsonMatch[0].trim()).slice(0, 3);
      }
    } catch (e) {
      lastError = e.message;
      console.warn(`⚠️ [Groq Bulk] ${model} başarısız: ${lastError}`);
    }
  }
  throw new Error(`Groq Bulk üretim başarısız: ${lastError}`);
}
