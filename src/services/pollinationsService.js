import { buildSystemPrompt } from './dashboardPrompt.js';

/**
 * Pollinations AI Service
 * Free, no-quota, high-availability fallback for layout generation.
 */
/**
 * Static Fallback Architect
 * AI servisleri tamamen çöktüğünde devreye giren, metadata'ya göre 
 * mantıklı bir dashboard şablonu üreten yerel motor.
 */
function generateStaticFallback(metadata, styleModifier) {
  console.log("🛠️ [Safe Mode] Üst düzey statik mimari oluşturuluyor...");
  
  const headers = metadata.headers || [];
  const sheetName = metadata.sheetName || "Analiz";
  
  // Stil varyasyonları için rastgele renkler
  const colors = [
    { bg: "from-blue-600/20 to-indigo-600/20", border: "border-blue-500/30", text: "text-blue-400" },
    { bg: "from-emerald-600/20 to-teal-600/20", border: "border-emerald-500/30", text: "text-emerald-400" },
    { bg: "from-rose-600/20 to-purple-600/20", border: "border-rose-500/30", text: "text-rose-400" }
  ];
  const theme = colors[Math.floor(Math.random() * colors.length)];

  return {
    title: `${sheetName} - ${styleModifier.split(':')[0] || 'Premium'}`,
    subtitle: "Yapay zeka servisleri şu an yoğun, sistem otomatik olarak en iyi düzeni kurguladı.",
    widgets: [
      {
        type: "dynamic_canvas",
        title: "Kritik Metrik",
        gridPosition: { colSpan: 2, rowSpan: 2, order: 1 },
        config: { 
          htmlTemplate: `<div class='h-full bg-gradient-to-br ${theme.bg} backdrop-blur-3xl rounded-[32px] border ${theme.border} p-10 flex flex-col justify-center'><div class='text-xs uppercase tracking-[0.2em] ${theme.text} font-bold mb-4'>Güncel Durum</div><div class='text-6xl font-black text-white tracking-tighter mb-2'>{{LATEST_0}}</div><div class='text-white/40 text-sm'>${metadata.headers?.[0]?.name || 'Veri'} sütunundaki son değer</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Veri Akışı",
        gridPosition: { colSpan: 2, rowSpan: 2, order: 2 },
        config: { 
          htmlTemplate: `<div class='h-full bg-slate-900/40 backdrop-blur-3xl rounded-[32px] border border-white/10 p-8'><h3 class='text-white font-bold text-xl mb-6 flex justify-between items-center'><span>Sıralı Liste</span><span class='px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/40'>{{TOTAL_ROWS}} Satır</span></h3><div class='space-y-4'>{{LOOP_START}}<div class='flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all'><span class='text-slate-400 font-medium'>{{COL_0}}</span><span class='text-white font-bold'>{{COL_1}}</span></div>{{LOOP_END}}</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Hızlı Özet",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: { 
          htmlTemplate: `<div class='bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-6 flex items-center justify-around'><div class='text-center'><div class='text-[10px] uppercase text-white/40 mb-1'>Toplam Veri</div><div class='text-2xl font-bold text-white'>{{TOTAL_ROWS}}</div></div><div class='w-px h-8 bg-white/10'></div><div class='text-center'><div class='text-[10px] uppercase text-white/40 mb-1'>Kaynak</div><div class='text-2xl font-bold text-blue-400'>{{SHEET_NAME}}</div></div></div>` 
        }
      }
    ]
  };
}

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  // Metadata nesnesini geri kazanmak için (statik fallback için lazım olabilir)
  const metadataMatch = metadataPrompt.match(/SOURCE: (.*)/);
  const sheetName = metadataMatch ? metadataMatch[1] : "Data Source";

  const models = ['openai', 'mistral-large', 'llama'];
  const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);
  
  // Prompt'u daha da basitleştir ve Pollinations'ın sevdiği formata sok
  const fullPrompt = `You are a UI/UX Expert. Generate a LUXURY Dashboard JSON for ${sheetName}.
  USER REQUEST: ${userRequest}. 
  STYLE: ${styleModifier}.
  THEME: Ultra-dark, glassmorphism, high-end typography.
  WIDGETS: Use 'dynamic_canvas' with Tailwind CSS. Include icons and gradients.
  Return ONLY the RAW JSON object. No markdown, no intro text.`;

  for (const modelName of models) {
    try {
      console.log(`🚀 [Pollinations] Ücretsiz kanal (${modelName}) deneniyor...`);
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=${modelName}&seed=${Math.floor(Math.random() * 1000000)}`);

      if (!response.ok) continue;

      const text = await response.text();
      let cleanJson = text.trim();

      // JSON bloğunu ayıkla
      const match = cleanJson.match(/\{[\s\S]*\}/);
      if (match) {
        cleanJson = match[0].trim();
        try {
          const parsed = JSON.parse(cleanJson);
          if (parsed.widgets && parsed.widgets.length > 0) {
            console.log(`✅ [Pollinations] Başarılı: ${modelName}`);
            return parsed;
          }
        } catch (e) {
          console.warn(`⚠️ [Pollinations] Ayrıştırma hatası (${modelName}):`, e.message);
        }
      } else {
        console.warn(`⚠️ [Pollinations] Yanıt içinde JSON bulunamadı (${modelName}). Yanıtın başı: ${cleanJson.substring(0, 100)}`);
      }
    } catch (e) {
      console.warn(`⚠️ [Pollinations] İstek hatası (${modelName}):`, e.message);
    }
  }
  
  throw new Error("Hiçbir AI servisi (Gemini, Groq, OpenAI, Pollinations) yanıt vermedi. Lütfen internet bağlantınızı veya API anahtarlarınızı kontrol edin.");
}
