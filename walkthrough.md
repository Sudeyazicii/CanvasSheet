# 🚶‍♂️ Walkthrough (Sistem İşleyişi)

Sheet Canvas projesi, veriyi yüklemekten dinamik dashboard oluşturmaya kadar tamamen otonom ve interaktif çalışan hibrit bir yapıya sahiptir.

## 1. Veri Bağlantısı ve Birleştirme
- **Giriş:** Kullanıcı sisteme girdiğinde bir `.csv`, `.xlsx` veya `.json` dosyası yükleyebilir ya da Google Sheets ile bağlanabilir.
- **Çoklu Kaynak:** "Çoklu Veri Birleştir" (Merge) aracı sayesinde, ilk sütun üzerinden iki ayrı veri seti tarayıcıda birleştirilerek tek bir tabloya dönüştürülebilir.

## 2. Faz 1: Groq & Kaggle Akıllı Önerici
- Kullanıcı analiz amacını girer (Örn: *"Yıllık seyahat harcamalarını incele"*).
- Sistem, **Groq LLaMA** motorunu tetikleyerek veri şemasına ve amaca en uygun 3 adet Kaggle tasarım şablonunu belirler ve iskelet (skeleton wireframe) olarak hazırlar.

## 3. Tinder-Style Vizyon Seçimi
- Hazırlanan 3 konsept, interaktif bir Tinder Deck olarak kullanıcının önüne gelir.
- Kullanıcı kartları sağa (Beğendim) veya sola (Beğenmedim) kaydırarak ya da tıklayarak karar verir.

## 4. Faz 2: Gemini ile Veri Bağlama (Data Binding)
- Kullanıcı bir tasarımı onayladığında, **Google Gemini** motoru devreye girer.
- Şablondaki tüm yer tutucuları (`{{primaryMeasure}}`, `{{rowCount}}`, `{{sheetName}}` ve veri kolonları) gerçek sayılar ve etiketlerle giydirilir.
- Grid yapısı optimize edilerek premium cam efekti (glassmorphism) ve neon temalı canlı dashboard render edilir.

## 5. Çift Yönlü Ses Kontrolü (NOVA Asistan)
- **Konuşma (TTS):** Ses motoru aktiftir. Nova asistan analiz sonuçlarını ve uzmanın tavsiyelerini sesli olarak Türkçe okur.
- **Dinleme (STT):** Kullanıcı mikrofon tuşuna basıp sesli olarak *"arka planı koyu yeşil yap"* gibi revize isteklerini doğrudan söyleyebilir. Gemini bu isteği anlayarak tasarımı günceller.

## 6. HITL (Human-in-the-Loop) WebRTC Uzman Köprüsü
- Eğer kullanıcı sunulan 3 tasarımı da beğenmeyip sola kaydırırsa, otonom olarak **Uzman Analist Köprüsü** tetiklenir.
- WebRTC video/ses kanalı açılarak Kıdemli Analist **Ahmet Yılmaz** hatta bağlanır.
- Uzman, sisteme doğrudan müdahale ederek Power BI tarzı geniş bir şablon gönderir ve kullanıcıya yapay zekayı en iyi nasıl yönlendirebileceğini (Prompt Mühendisliği kuralları) öğretir.

## 7. 0-Token Yerel Kural Motoru (Edge NLP)
- Kullanıcı *"Yolcu sayısı 100'den büyükse kırmızı yap"* gibi kurallar girer.
- Sistem, API istekleri hata verse dahi yerel NLP parser yardımıyla kuralı çözümler ve sıfır ek token maliyetiyle tablonun eşleşen satırlarını renklendirir.

## 8. GitHub Store & Export
- **Export:** Raporlar anlık olarak Excel (`.xlsx`), CSV veya JSON olarak dışa aktarılabilir.
- **GitHub Store:** Güncellenmiş veri kümesi doğrudan GitHub reposuna pushlanabilir. Hackathon demosu için şifre gerektirmeyen **"Simüle Et (Demo)"** seçeneği ile kesintisiz veri saklama akışı sunulabilir.
