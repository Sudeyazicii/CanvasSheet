import Groq from 'groq-sdk';
import { buildSystemPrompt } from './dashboardPrompt.js';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();
const PRIMARY_MODEL = import.meta.env.VITE_GROQ_MODEL?.trim() || 'groq/compound';

const FALLBACK_MODELS = [
  'groq/compound',
  'groq/compound-mini',
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.6-27b'
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

function repairAndParseJson(str, isArray = false) {
  if (!str || typeof str !== 'string') return null;

  // 1. Clean reasoning tags like <think>...</think>
  let cleaned = str.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Direct JSON parse
  try {
    const res = JSON.parse(cleaned);
    if (res && typeof res === 'object') return res;
  } catch (e) { }

  // 3. Extract JSON code fences ```json ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const res = JSON.parse(codeBlockMatch[1].trim());
      if (res && typeof res === 'object') return res;
    } catch (e) {
      cleaned = codeBlockMatch[1].trim();
    }
  }

  // 4. Extract first {...} or [...] substring
  const pattern = isArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = cleaned.match(pattern);
  if (match) {
    try {
      const res = JSON.parse(match[0].trim());
      if (res && typeof res === 'object') return res;
    } catch (e) {
      cleaned = match[0].trim();
    }
  }

  // 5. Advanced bracket balancing repair
  let repaired = cleaned.replace(/,\s*$/, '').replace(/,\s*"[^"]*":?\s*$/, '');
  let quoteCount = 0;
  let escaped = false;
  for (let i = 0; i < repaired.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (repaired[i] === '\\') { escaped = true; continue; }
    if (repaired[i] === '"') quoteCount++;
  }
  if (quoteCount % 2 !== 0) repaired += '"';

  const stack = [];
  escaped = false;
  let inStr = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (char === '{' || char === '[') stack.push(char);
      else if (char === '}' && stack[stack.length - 1] === '{') stack.pop();
      else if (char === ']' && stack[stack.length - 1] === '[') stack.pop();
    }
  }

  let closing = '';
  for (let i = stack.length - 1; i >= 0; i--) {
    closing += stack[i] === '{' ? '}' : ']';
  }

  try {
    const res = JSON.parse(repaired + closing);
    if (res && typeof res === 'object') return res;
  } catch (e1) {
    const lastBrace = isArray ? repaired.lastIndexOf(']') : repaired.lastIndexOf('}');
    if (lastBrace !== -1) {
      let sub = repaired.slice(0, lastBrace + 1);
      try {
        const res = JSON.parse(sub);
        if (res && typeof res === 'object') return res;
      } catch (e2) { }
    }
  }

  return null;
}

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY tanımlı değil');
  }

  const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);
  const modelsToTry = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
  let lastError = null;

  console.log(`🤖 [Groq Cascade Engine] Toplam ${modelsToTry.length} model sırayla deneniyor:`, modelsToTry.join(', '));

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const modelName = modelsToTry[idx];
    console.log(`🚀 [Groq Model ${idx + 1}/${modelsToTry.length}] Deneniyor: ${modelName}`);

    const client = getGroqClient();
    const safeMetadata = metadataPrompt && metadataPrompt.length > 2000 ? metadataPrompt.slice(0, 2000) + "\n...[truncated]" : metadataPrompt;
    
    // Qwen model does not support json_object format parameter in Groq API
    const supportsJsonFormat = !modelName.includes('qwen');

    try {
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + "\nRespond ONLY with valid JSON." },
          { role: 'user', content: `REQUEST: ${userRequest}\n\nMETADATA:\n${safeMetadata}\n\nReturn a JSON object with widgets.` }
        ],
        temperature: 0.3,
        max_tokens: 4096,
        ...(supportsJsonFormat ? { response_format: { type: 'json_object' } } : {})
      });

      const text = response.choices?.[0]?.message?.content;
      if (text) {
        const parsed = repairAndParseJson(text, false);
        if (parsed && typeof parsed === 'object') {
          console.log(`✅ [Groq Model ${idx + 1}/${modelsToTry.length}] BAŞARILI: ${modelName}`);
          return parsed;
        }
      }
      console.warn(`⚠️ [Groq Model ${idx + 1}/${modelsToTry.length}] ${modelName} yanıt verdi fakat geçerli JSON oluşturulamadı. Sonraki modele geçiliyor...`);
    } catch (e) {
      lastError = e.message;
      console.warn(`⚠️ [Groq Model ${idx + 1}/${modelsToTry.length}] ${modelName} başarısız (${lastError}). Sonraki modele geçiliyor...`);
    }
  }

  throw new Error(`Tüm Groq modelleri denendi ancak yanıt alınamadı: ${lastError}`);
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
  - WIREFRAME HTML (ULTRA PREMIUM QUALITY): For \`config.htmlTemplate\`, you MUST write CUSTOM Tailwind CSS HTML that looks breathtakingly beautiful even without real data.
    - ALWAYS use luxury container styles: \`bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 hover:border-blue-500/30\`.
    - If it's a KPI/METRIC: Generate a sleek layout with a small neon icon, a glowing metric like \`<div class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">12,450</div>\`, and a subtle trend badge like \`<span class="text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm">+14%</span>\`.
    - If it's a BAR CHART: Generate beautiful vertical divs with glowing borders, e.g., \`<div class="w-12 h-32 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]"></div>\`.
    - If it's a LIST/TABLE: Create elegant rows with \`border-b border-white/5 pb-4 mb-4\`, dummy luxury names like "Enterprise License", and dummy values.
  - DO NOT COPY PASTE ONE EXAMPLE. Every concept must feel like a completely unique, high-end SaaS product designed by Apple or Stripe.`;

  if (!GROQ_API_KEY) throw new Error('VITE_GROQ_API_KEY tanımlı değil');

  const client = getGroqClient();
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError = null;

  for (let idx = 0; idx < models.length; idx++) {
    const model = models[idx];
    try {
      console.log(`⚡ [Groq Bulk ${idx + 1}/${models.length}] Deneniyor: ${model}`);
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: "You are a World-Class UI Architect. You output ONLY valid JSON arrays of dashboard objects." },
          { role: 'user', content: bulkPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8192
      });

      const text = response.choices?.[0]?.message?.content;
      if (text) {
        const parsed = repairAndParseJson(text, true);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ [Groq Bulk ${idx + 1}/${models.length}] BAŞARILI: ${model}`);
          return parsed.slice(0, 3);
        }
      }
      console.warn(`⚠️ [Groq Bulk ${idx + 1}/${models.length}] ${model} dizi üretemedi. Sonraki modele geçiliyor...`);
    } catch (e) {
      lastError = e.message;
      console.warn(`⚠️ [Groq Bulk ${idx + 1}/${models.length}] ${model} başarısız (${lastError}). Sonraki modele geçiliyor...`);
    }
  }
  throw new Error(`Groq Bulk üretim başarısız: ${lastError}`);
}
