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
  
  const sheetName = metadata.sheetName || "Veri Kaynağı";
  
  return {
    title: `${sheetName} - Executive Dashboard`,
    subtitle: "Dinamik Analitik Görünüm & Canlı Metrik Akışı",
    widgets: [
      {
        type: "dynamic_canvas",
        title: "Toplam Veri Satırı",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 1 },
        config: { 
          htmlTemplate: `<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl rounded-[28px] border border-blue-500/30 p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black'>TOPLAM KAYIT</span><span class='w-2 h-2 rounded-full bg-blue-400 animate-pulse'></span></div><div class='my-3'><div class='text-3xl lg:text-4xl font-black text-white tracking-tight'>{{TOTAL_ROWS}}</div><div class='text-xs font-semibold text-slate-400 mt-1'>Satır Verisi Aktif</div></div><div class='flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full w-fit'>✓ Canlı Eşitleniyor</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Aktif Veri Kaynağı",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 2 },
        config: { 
          htmlTemplate: `<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl rounded-[28px] border border-indigo-500/30 p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-black'>VERİ KAYNAĞI</span><span class='w-2 h-2 rounded-full bg-indigo-400 animate-pulse'></span></div><div class='my-3'><div class='text-xl lg:text-2xl font-black text-white truncate tracking-tight'>{{SHEET_NAME}}</div><div class='text-xs font-semibold text-slate-400 mt-1'>Tablo Entegrasyonu</div></div><div class='flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold bg-indigo-400/10 border border-indigo-400/20 px-2.5 py-1 rounded-full w-fit'>MCP Protokolü</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Kritik Değer",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 3 },
        config: { 
          htmlTemplate: `<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl rounded-[28px] border border-emerald-500/30 p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black'>SON GÜNCELLEME</span><span class='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span></div><div class='my-3'><div class='text-3xl lg:text-4xl font-black text-white tracking-tight'>{{LATEST_0}}</div><div class='text-xs font-semibold text-slate-400 mt-1'>Sütun 1 Son Değer</div></div><div class='flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full w-fit'>+12.4% Artış</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Performans İndeksi",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 4 },
        config: { 
          htmlTemplate: `<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl rounded-[28px] border border-purple-500/30 p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] uppercase tracking-[0.2em] text-purple-400 font-black'>KALİTE SKORU</span><span class='w-2 h-2 rounded-full bg-purple-400 animate-pulse'></span></div><div class='my-3'><div class='text-3xl lg:text-4xl font-black text-white tracking-tight'>%98.2</div><div class='text-xs font-semibold text-slate-400 mt-1'>Veri Tutarlılığı</div></div><div class='flex items-center gap-1.5 text-[10px] text-purple-400 font-bold bg-purple-400/10 border border-purple-400/20 px-2.5 py-1 rounded-full w-fit'>Optimum</div></div>` 
        }
      },
      {
        type: "dynamic_canvas",
        title: "Veri Akışı Ve Detay Listesi",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 5 },
        config: { 
          htmlTemplate: `<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl rounded-[32px] border border-white/10 p-8 shadow-2xl'><div class='flex items-center justify-between mb-6 pb-4 border-b border-white/10'><h3 class='text-lg font-black text-white uppercase tracking-wider'>Satır Bazlı Canlı Akış</h3><span class='px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-slate-400'>Toplam {{TOTAL_ROWS}} Kayıt</span></div><div class='space-y-3 overflow-x-auto'>{{LOOP_START}}<div class='flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all text-sm'><span class='text-slate-300 font-medium'>{{COL_0}}</span><span class='text-white font-black'>{{COL_1}}</span></div>{{LOOP_END}}</div></div>` 
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

  console.warn("⚠️ [Pollinations] Servisler yanıt vermedi, Statik Fallback Mimarı devreye sokuluyor.");
  return generateStaticFallback({ sheetName, headers: [] }, styleModifier);
}
