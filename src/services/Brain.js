import Groq from "groq-sdk";
import Voice from "./Voice";

const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();

let groqClient = null;
function getGroqClient() {
  if (!groqClient && apiKey) {
    groqClient = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return groqClient;
}

class NoktaBrain {
  constructor() {
    this.history = [];
    this.name = "Nova";
    this.systemPrompt = `Sen NOVA'sın. Nokta Canvas ekosisteminin kıdemli UI/UX Designer asistanısın. 
Neşeli, zeki ve samimisin. Cevapların kısa (en fazla 2 cümle) ve motive edici olmalı. Türkçe konuş.`;
  }

  async sendMessage(message, onSpeechEnd = null) {
    let text = "Üzgünüm, şu an vizyonuna bağlanmakta zorlanıyorum. Ama dashboard üzerinde çalışmaya devam ediyorum!";

    try {
      const groq = getGroqClient();
      if (!groq) {
        console.warn("⚠️ VITE_GROQ_API_KEY tanımlı değil, NOVA fallback yanıt veriyor.");
        return text;
      }

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: this.systemPrompt },
          ...this.history,
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,
        max_tokens: 150,
      });

      text = completion.choices[0]?.message?.content || text;
      this.history.push({ role: "user", content: message });
      this.history.push({ role: "assistant", content: text });
      if (this.history.length > 10) this.history = this.history.slice(-10);

    } catch (e) {
      console.error('❌ Groq Brain Error:', e);
    }

    // Voice.speak(text, onSpeechEnd); // Muted per user request
    return text;
  }
}

export default new NoktaBrain();
