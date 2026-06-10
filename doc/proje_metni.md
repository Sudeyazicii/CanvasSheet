# 📄 Proje Metni

**Proje Adı:** Nokta Canvas (Sheet Canvas)
**Kategori:** Otonom Veri Görselleştirme ve Raporlama
**Etkinlik/Yarışma:** Raise Summit Hackathon Başvuru Projesi

Nokta Canvas, tamamen tarayıcı üzerinde çalışan, backend ihtiyacı duymayan bir yapay zeka uygulamasıdır. Temel amacı, son kullanıcıların karmaşık veri analiz araçlarıyla vakit kaybetmeden, sadece doğal dil kullanarak verilerini görselleştirmelerini sağlamaktır.

Proje, iki aşamalı bir hibrit yapay zeka modeli kullanır:
1. **Groq Engine:** Hızlı tasarım (iskelet) üretimi için kullanılır.
2. **Gemini Engine:** Üretilen tasarıma verilerin akıllı bir şekilde bağlanması ve optimizasyon için kullanılır.

Teknik altyapı React 18 ve Vite üzerine kuruludur. Modern arayüz tasarımı için Tailwind CSS kullanılmaktadır. Sistem aynı zamanda API hatalarına karşı kendi kendini onarabilen bir Failover yapısına sahiptir.
