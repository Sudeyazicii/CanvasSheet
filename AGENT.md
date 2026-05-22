# 🤖 Kodlama Ajanları İçin Sistem Mimarisi ve Yönergeler (AGENT.md)

Hoş geldin Otonom Ajan / Yapay Zeka Asistanı.
Bu belge, **Nokta Canvas** (eski adıyla Sheet Canvas) projesinin çekirdek mimarisini, kurallarını ve mantık döngülerini özetlemektedir. 
Bu repodaki kodları değiştirmeden önce lütfen bu manifestoyu dikkatlice oku.

## 🏗️ Projeye Genel Bakış
Nokta Canvas, tamamen tarayıcı üzerinde çalışan (Zero-Backend) ve Yüksek Dil Modellerini (LLM) kullanarak otonom bir şekilde JSON + Tailwind HTML döndüren dinamik bir React uygulamasıdır.

### Temel Felsefe
1. **Dinamik Üretim (Dynamic Generation):** Tablolar veya grafikler için önceden kodlanmış (hardcoded) React bileşenleri KULLANMIYORUZ. Bunun yerine, LLM'e anlık olarak özel ve stillendirilmiş HTML (`Tailwind CSS`) üretmesi için prompt (komut) veriyoruz.
2. **Hibrit Motor (Hybrid Engine):** Token tasarrufu yapmak ve hızı maksimize etmek için üretim sürecini iki aşamaya bölüyoruz (Aşama 1: Groq, Aşama 2: Gemini).
3. **Survivor AI (Hata Toleransı):** Sistem, oran sınırları (rate limits) veya çökmeler nedeniyle asla durmamalıdır. API sağlayıcıları arasında sessizce geçiş yapan bir "circuit breaker" yapısı vardır.

## 🔄 Dashboard Üretim Boru Hattı (Pipeline)
Dashboard'ların nasıl üretildiğine dair bir değişiklik yapman istenirse, `AnalyzePage.jsx` ve `services/` dizinini çok iyi anlamalısın.

### Aşama 1: Layout ve Strateji (Groq/LLaMA)
- **Dosya:** `src/services/groqService.js` -> `generateMultipleDashboardConfigs`
- **Ne Yapar:** Yalnızca meta verileri (sütun başlıkları, sayfa adı) ve Kullanıcı Komutunu (Prompt) Groq'a gönderir.
- **Amaç:** LLM'e 3 farklı "Konsept" veya "Vizyon" içeren bir JSON dizisi döndürmesini emreder. Her konseptin bir başlığı, açıklaması ve içinde sadece HTML iskeletini (`htmlTemplate`) barındıran widget'ları vardır.
- **Kural:** Buradaki `colSpan` ve `rowSpan` özellikleri başlangıç grid yapısını (ızgara) belirler.

### Aşama 2: Rafine Etme ve Veri Bağlama (Gemini)
- **Dosya:** `src/services/geminiService.js` -> `refineDashboardWithGemini`
- **Ne Yapar:** Kullanıcının Aşama 1'de seçtiği spesifik Konsepti/Layout'u ve TAM veri setini (metadata) alır.
- **Amaç:** Geçici HTML iskeletlerini GERÇEK VERİLERLE (`{{tag}}` değiştirmeleri) doldurur ve grid özelliklerini optimize eder (Örn: Sıkışıklığı önlemek için grafik/tablo colSpan değerlerini genişletir).
- **Kural:** Bu aşamada Gemini kullanıyoruz çünkü karmaşık bağlamı anlama ve gerçek sayılarla katı JSON çıktı kurallarına uyma konusunda daha başarılıdır.

### Aşama 3: Render (Ekrana Çizme)
- **Dosyalar:** `src/engine/DynamicDashboard.jsx` & `src/engine/widgets/SmartCanvas.jsx`
- **Ne Yapar:** Rafine edilmiş JSON'u alır. HTML'i `dangerouslySetInnerHTML` kullanarak güvenli bir şekilde React içinde render eder. Sayfadaki gerçek verileri HTML etiketleriyle eşleştirir.

## 🛠️ Kod Değiştirme Kuralları

### 1. Stil ve Estetik (KRİTİK)
- Üretilen dashboard bileşenleri için standart/jenerik UI kütüphaneleri (MUI, AntD vb.) **KULLANMAYIN**. LLM saf HTML + Tailwind CSS üretmelidir.
- **Tasarım Standartı:** Koyu Lacivert arka planlar (`bg-slate-900`), Cam Efekti (`bg-white/5`, `backdrop-blur`), ince sınırlar (`border-white/10`), neon yansımalar (`shadow-blue-500/20`) ve gradyanlar (`bg-gradient-to-br from-blue-500 to-indigo-600`).
- Ana grid konteyneri hariç, LLM'in yaratıcılığını kısıtlayacak CSS sınıflarını React render motoru (SmartCanvas) içine "hardcode" OLARAK YAZMAYIN.

### 2. Prompt Ayarlamaları (Tuning)
- Eğer kullanıcı "veriler çok tekrar ediyor" veya "arayüz çok sıkışık" diye şikayet ederse, **React bileşenlerini DÜZENLEMEYİN**. Bunun yerine `groqService.js` veya `geminiService.js` içindeki Sistem Prompt'larını düzeltin.
- Her zaman JSON doğrulamasını zorunlu kılın.

### 3. Hata Yönetimi (Error Handling)
- Bir AI servisinde (örneğin Groq'ta) hiçbir zaman yakalanmamış (uncaught) bir hata fırlatmayın. Hatayı yakalayın (`catch`), loglayın ve zincirdeki bir sonraki alternatifi (Gemini -> Groq -> OpenAI -> Pollinations) tetikleyin.

## 🤖 Senin İçin Son Talimat (Nihai Direktif)
Kullanıcı senden yeni bir özellik uygulamanı istediğinde:
1. Bu değişikliğin Render Motorunda mı (React) yoksa AI Boru Hattında mı (Promptlar) olması gerektiğini doğrula.
2. Hardcode (elle yazılmış sabit) React bileşenleri yazmak yerine, her zaman daha sağlam prompt'lar yazmaya öncelik ver.
3. Mimariye dair köklü bir değişiklik yaparsan her zaman kodu belgelendir.
