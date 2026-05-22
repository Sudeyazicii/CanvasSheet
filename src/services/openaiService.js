import OpenAI from 'openai';
import { buildSystemPrompt } from './dashboardPrompt.js';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.trim();
const PRIMARY_MODEL = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini';

const FALLBACK_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo-2024-04-09',
  'o3-mini',
  'gpt-3.5-turbo'
];

let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient && OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  return openaiClient;
}

export function isOpenAIConfigured() {
  return Boolean(OPENAI_API_KEY);
}

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY tanımlı değil');
  }

  const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);

  const modelsToTry = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🚀 [OpenAI] Deneniyor: ${modelName}`);
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `REQUEST: ${userRequest}\n\nMETADATA:\n${metadataPrompt}\n\nReturn a JSON object with at least 5 widgets following the composition rules. Use ONLY tags from the ALLOWED TAGS whitelist above. Any tag outside the whitelist will render as literal {{...}} text and break the dashboard.` }
        ],
        temperature: 0.4,
        max_tokens: 16000,
        response_format: { type: 'json_object' }
      });

      const text = response.choices?.[0]?.message?.content;
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`✅ [OpenAI] Başarılı: ${modelName}`);
        return JSON.parse(jsonMatch[0].trim());
      }
      lastError = 'Boş yanıt';
    } catch (e) {
      lastError = e.message;
      console.warn(`⚠️ [OpenAI] ${modelName} başarısız: ${lastError}`);
    }
  }

  throw new Error(`Tüm OpenAI modelleri meşgul: ${lastError}`);
}
