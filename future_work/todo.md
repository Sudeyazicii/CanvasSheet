# 📋 Gelecek Çalışmalar ve TODO Listesi (Future Work)

Bu dosya, projeyi devralacak olan sonraki geliştiriciler (insan veya otonom ajanlar) için bir yol haritası niteliğindedir. Projenin yaşayan bir organizma olduğu göz önünde bulundurularak aşağıdaki hedefler belirlenmiştir:

## 🎨 Arayüz ve Tasarım (UI/UX)
- [ ] İskelet yapı (UI) tasarımının premium görünüm seviyesine çıkarılması.
- [ ] Groq tarafından üretilen CSS çıktılarının manuel optimize edilmesi.
- [ ] Karanlık mod (Dark Mode) yanında aydınlık mod (Light Mode) desteğinin eklenmesi.

## 🧠 Yapay Zeka ve Mimari (AI & Architecture)
- [ ] Farklı LLM modellerinin (Örn: Claude 3.5 Sonnet) fallback zincirine entegre edilmesi.
- [ ] Prompt optimizasyonu ile token kullanımının %20 oranında azaltılması.
- [ ] `services/geminiService.js` içerisindeki JSON ayrıştırma mantığının daha dayanıklı (robust) hale getirilmesi.

## 📊 Veri Entegrasyonu
- [ ] Sadece CSV değil, doğrudan JSON ve SQL veritabanı bağlantı yeteneğinin eklenmesi.
- [ ] Gerçek zamanlı (Real-time) veri akışları için WebSocket entegrasyonu.

> **Not:** İskelet yapısı ve veri bağlama boru hattı şu anda tamamen otonom ve hatasız çalışır durumdadır. Sistem mimarisini değiştirecek geliştiricilerin öncelikle kök dizindeki `agents.md` dosyasını okuması önemle rica olunur.
