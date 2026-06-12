# 📋 Gelecek Çalışmalar ve TODO Listesi (Future Work)

Bu dosya, projeyi devralacak olan sonraki geliştiriciler (insan veya otonom ajanlar) için bir yol haritası niteliğindedir. Önemli hedefler ve gerçekleştirilme durumları aşağıda listelenmiştir:

## 🎨 Arayüz ve Tasarım (UI/UX)
- [x] **Premium Görünüm Seviyesi:** Glassmorphic kartlar, neon efektler, koyu lacivert lüks tema ve akıcı mikro-animasyonlar tamamlandı.
- [x] **Tinder-Style Konsept Deck:** Kullanıcının tasarımları hızlıca oylayabileceği arayüz tamamlandı.
- [ ] Aydınlık Mod (Light Mode) alternatif tema desteği.

## 🧠 Yapay Zeka ve Mimari (AI & Architecture)
- [x] **Çoklu LLM Modeli Entegrasyonu:** Gemini, Groq, OpenAI ve Pollinations modelleri fallback zinciriyle birbirine bağlandı.
- [x] **Dayanıklı JSON Ayrıştırma:** Eksik/bozuk JSON çıktılarını regex ve recovery algoritmalarıyla otomatik tamir eden sistem tamamlandı.
- [x] **Edge NLP Kural Çözümleyici:** İnternetsiz çalışan yerel NLP Türkçe kural çözümleme motoru tamamlandı.
- [ ] Büyük kurumsal raporlar için yerel Vektör Veritabanı (RAG) desteği eklenmesi.

## 📊 Veri Entegrasyonu & Canlılık
- [x] **Çoklu Format Desteği:** CSV, Excel (XLSX), JSON ve MCP DataHub entegrasyonu tamamlandı.
- [x] **Veri Kaynağı Birleştirme (Join/Merge):** İki farklı tablonun tarayıcıda birleştirilmesi tamamlandı.
- [ ] Gerçek zamanlı (Real-time) veri akışları ve çok oyunculu (multiplayer) dashboard düzenleme için WebSocket entegrasyonu.
- [ ] Mobil uyumluluk için Capacitor entegrasyonunun tamamlanıp iOS/Android paketlerinin derlenmesi.

---

> **Not:** Canvas Sheet projesi şu anda hackathon sunumu için eksiksiz ve en yüksek stabilitede çalışmaktadır. Sistem mimarisini değiştirecek geliştiricilerin öncelikle kök dizindeki `agents.md` dosyasını okuması önemle rica olunur.
