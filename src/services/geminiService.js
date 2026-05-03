const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-1.5-flash";

export async function generateDashboardConfig(metadataPrompt, userRequest) {
  let availableModels = [ENV_MODEL];

  // 1. ADIM: Tüm Kullanılabilir Modelleri Keşfet
  try {
    console.log("🔍 [AI Engine] Kullanılabilir tüm alternatif modeller taranıyor...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();

    if (listData.models && listData.models.length > 0) {
      // generateContent destekleyen tüm modelleri listeye ekle (öncelik sırasına göre)
      const flashModels = listData.models.filter(m => m.name.includes("1.5-flash") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());
      const proModels = listData.models.filter(m => m.name.includes("1.5-pro") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());
      const otherModels = listData.models.filter(m => !m.name.includes("1.5") && m.supportedGenerationMethods.includes("generateContent")).map(m => m.name.split('/').pop());

      // Çakışmaları önleyerek sıralı bir havuz oluştur
      availableModels = [...new Set([ENV_MODEL, ...flashModels, ...proModels, ...otherModels])].filter(Boolean);
      console.log("📋 [AI Engine] Model Havuzu:", availableModels);
    }
  } catch (e) {
    console.warn("⚠️ [AI Engine] Liste alınamadı, sadece varsayılan model denenecek.");
  }

  const SYSTEM_PROMPT = `You are a World-Class UI/UX Designer & Full-Stack Engineer specializing in "Sheet Canvas" Dashboards.
MISSION: Generate a stunning, premium dashboard JSON based on spreadsheet data.

DESIGN RULES:
1. THEME: Use a deep dark navy theme (#0F172A). Use glassmorphism (bg-white/5 backdrop-blur-xl).
2. STYLING: Use Tailwind CSS classes ONLY. 
3. GRADIENTS: Use premium gradients (e.g., from-blue-500 to-indigo-600, from-emerald-400 to-cyan-500).
4. ICONS: Use inline SVGs for icons. Make them sleek and modern.
5. TYPOGRAPHY: Use 'Inter' or 'Outfit'. Bold headers, clean metrics.
6. WIDGETS: Every widget must be 'dynamic_canvas'.

DATA BINDING RULES:
- {{TITLE}}: Widget title.
- {{TOTAL_ROWS}}: Total data rows.
- {{HEADER_i}}: Header name of column i (0-indexed).
- {{LATEST_i}}: Latest value in column i.
- {{LOOP_START}} ... {{COL_i}} ... {{LOOP_END}}: For lists or tables.

OUTPUT FORMAT (JSON ONLY):
{
  "title": "Dashboard Title",
  "subtitle": "Brief description",
  "widgets": [
    {
      "type": "dynamic_canvas",
      "title": "Widget Title",
      "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 1 },
      "config": {
        "htmlTemplate": "<div class='glass-panel p-6 rounded-3xl border border-white/10'>... use {{LATEST_0}} etc ...</div>"
      }
    }
  ]
}

If the user asks for a specific chart or layout, fulfill it using HTML/CSS (e.g., div bars for charts).
BE CREATIVE. NO BORING TABLES. USE CARDS, KPI STRIPS, AND PROGRESS BARS.`;

  let lastError = null;

  // 2. ADIM: Havuzdaki Modelleri Sırayla Dene (Survivor Mode)
  for (const modelName of availableModels) {
    try {
      console.log(`🚀 [AI Engine] Deneniyor: ${modelName}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT },
              { text: `USER REQUEST: ${userRequest}\n\nSHEET METADATA:\n${metadataPrompt}` }
            ]
          }],
          generationConfig: { temperature: 0.2 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const text = data.candidates[0].content.parts[0].text;
          const cleanJson = text.replace(/```json|```/g, "").trim();
          console.log(`✅ [AI Engine] ${modelName} üzerinden üretim başarılı!`);
          return JSON.parse(cleanJson);
        }
      } else {
        const err = await response.json();
        lastError = err.error?.message || "Bilinmeyen hata";
        console.warn(`⚠️ [AI Engine] ${modelName} başarısız (Yoğunluk veya Kota): ${lastError}`);
        // Eğer hata yoğunluk veya kota ise, bir sonraki modele geç
        continue;
      }
    } catch (e) {
      lastError = e.message;
      console.error(`❌ [AI Engine] ${modelName} kritik hata:`, e);
    }
  }

  throw new Error(`AI Hatası: Tüm modeller meşgul veya kotanız dolmuş. Lütfen biraz bekleyin. Son hata: ${lastError}`);
}
