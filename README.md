<div align="center">

# 🚀 Sheet Canvas Projesi

🏆 **Raise Summit Hackathon Projesi!** 🏆

[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini & Groq API](https://img.shields.io/badge/AI-Hybrid_Engine-orange.svg?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![WebRTC](https://img.shields.io/badge/HITL-WebRTC_Bridge-blueviolet.svg?style=flat)](https://webrtc.org/)

Canvas Sheet, Google Sheets, Excel veya CSV verilerinizi saniyeler içinde benzersiz, modern ve interaktif dashboard'lara dönüştüren, yapay zeka destekli otonom bir arayüz (Generative UI) motorudur. Backend ihtiyacı duymadan tamamen tarayıcı üzerinde çalışan **Groq + Gemini Hibrit AI mimarisi** ve canlı insan entegrasyonu (HITL) ile zenginleştirilmiştir.

<br />

![Dashboard Preview](./image.png)

<br />

**🎥 Canvas Sheet MVP Demo İzle:** [https://www.youtube.com/watch?v=XdQJRQ1bfrY](https://www.youtube.com/watch?v=XdQJRQ1bfrY)

</div>

---

## ✨ Öne Çıkan Gelişmiş Özellikler

- 🤖 **Hibrit AI Arayüz Motoru (Groq + Gemini)**
  Aşama 1'de Groq'un yüksek hızı ile 3 farklı stratejik yerleşim (skeletons) üretilir. Aşama 2'de Gemini'nin gücüyle seçilen iskelet gerçek verilerle doldurulup, grid sütunları genişletilerek premium bir görünüme kavuşturulur.
  
- 🎴 **Tinder-Style Vizyon Seçimi (Tinder Deck)**
  AI tarafından sunulan 3 farklı tasarım vizyonunu Tinder kartları gibi sağa (Beğendim) veya sola (Beğenmedim) kaydırarak seçebilirsiniz. 

- 📞 **HITL (Human-in-the-Loop) WebRTC Uzman Köprüsü**
  Tüm yapay zeka tasarımlarını reddetmeniz durumunda, sistem otonom olarak kıdemli analist/tasarımcı **Ahmet Yılmaz**'a WebRTC video ve ses kanalı üzerinden canlı bağlantı simülasyonu başlatır. Uzman, tasarıma canlı müdahale eder, verileri bağlar ve asistan için en etkili **Prompt Mühendisliği** ipuçlarını sizinle paylaşır.

- 🎙️ **Çift Yönlü Sesli Nova Asistanı (STT & TTS)**
  Sesli geri bildirim özelliği varsayılan olarak açık gelir. Nova asistan analiz sonuçlarını ve uzmanın yönlendirmelerini sesli okurken (TTS), mikrofona tıklayarak tasarımı sesli komutlarınızla da (STT) güncelleyebilirsiniz.

- ⚡ **0-Token Yerel Kural Motoru (Edge NLP Fallback)**
  Verilerinizi ek LLM maliyeti olmadan filtreleyin veya renklendirin! Üstelik internet kesilse bile yerel NLP motorumuz *"yolcu sayısı 100'den büyükse kırmızı yap"* gibi Türkçe komutları çözümleyip doğru kolona uygulayabilir.

- 🔀 **Çoklu Veri Birleştirme (Multi-Source Merge)**
  Farklı kaynaklardan gelen (CSV veya Excel) iki ayrı veri setini, ilk sütunlarındaki ortak anahtarlar (Join Key) üzerinden eşleştirerek tarayıcı üzerinde dinamik olarak birleştirebilirsiniz.

- 📂 **GitHub Store (Live & Demo Modu)**
  Güncel veri setinizi doğrudan GitHub reposuna commit edin! Hackathon sunumları için PAT şifrenizi girmeden çalıştırabileceğiniz **"Simüle Et (Demo)"** butonu ile güvenli ve kusursuz bir entegrasyon demosu sunabilirsiniz.

- 📊 **Insight, SWOT & Benchmark Analizleri**
  Yüklenen veri seti için otomatik olarak stratejik SWOT analiz tablosu, sektör kıyaslama (Benchmark) grafikleri ve önemli metriklerin görsel içgörü raporlarını üretir.

---

## 🛠️ Teknoloji Yığını

| Kategori | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Arayüz (Core)** | React 18, Vite | Hızlı geliştirme ve modern frontend deneyimi |
| **Aşama 1 (Layout)** | Groq (LLaMA-3 70B) | Anında 3 farklı stratejik tasarım vizyonu üretir |
| **Aşama 2 (Veri)** | Google Gemini 1.5/2.0 | Seçilen vizyona gerçek verileri bağlayıp mükemmelleştirir |
| **Ses (Voice)** | Web Speech API | Türkçe ses sentezleme (TTS) ve ses tanıma (STT) motoru |
| **HITL Bağlantı** | WebRTC Simülatörü | Kamera ve ses destekli canlı uzman katılımı |
| **Stil** | Tailwind CSS & Lucide Icons | Glassmorphism ve lüks koyu tema tasarımları |

---

## 🚀 Hızlı Başlangıç

### 1. Kurulum
Projeyi bilgisayarınıza klonlayın ve bağımlılıkları yükleyin:

```bash
git clone https://github.com/seyyah/sheet-canvas.git
cd sheet-canvas
npm install
```

### 2. Ortam Değişkenleri
Projenin kök dizininde bulunan `.env.example` dosyasının adını `.env` olarak değiştirin ve kendi API anahtarlarınızı ekleyin:

```env
VITE_GOOGLE_CLIENT_ID=Sizin_Google_Cloud_Client_ID_Anahtarınız
VITE_GEMINI_API_KEY=Sizin_Gemini_AI_Studio_Anahtarınız
VITE_GROQ_API_KEY=Sizin_Groq_API_Anahtarınız

# Opsiyonel: AI Engine Fallback Zinciri için
VITE_OPENAI_API_KEY=Sizin_OpenAI_API_Anahtarınız
```

### 3. Çalıştırma
Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

---

## 📚 Proje Dokümantasyonu

Projenin gelişim sürecini, yol haritasını ve mimarisini detaylı incelemek için aşağıdaki dosyalara göz atabilirsiniz:
- [Walkthrough (Sistem İşleyişi)](./walkthrough.md)
- [Proje Planı](./plan.md)
- [Gelecek Çalışmalar (TODO)](./future_work/todo.md)
- [Değişiklik Geçmişi (Changelog)](./changelog.md)
- [Fikir ve Teknik Belgeler](./doc/)

---

## 🤝 Kodlama Ajanları İçin
Yapay zeka asistanları veya otonom kodlama ajanları ile bu repoya katkıda bulunuyorsanız, projenin kuralları ve sistem mimarisi için lütfen kök dizindeki `agents.md` dosyasını okuyun.
