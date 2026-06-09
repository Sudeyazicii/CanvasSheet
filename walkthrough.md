# 🚶‍♂️ Walkthrough (Sistem İşleyişi)

Sheet Canvas projesi, veriyi yüklemekten dinamik dashboard oluşturmaya kadar tamamen otonom çalışır.

## 1. Veri Yükleme ve Başlangıç
- Kullanıcı projeye girdiğinde bir `.csv`, `.xlsx` dosyası yükleyebilir veya mevcut test verilerini kullanabilir.
- Arayüzde "Ne analiz etmek istiyorsunuz?" şeklindeki prompt alanına istenen vizyon girilir (Örn: "Satış verilerini analiz et").

## 2. Faz 1: Groq ile İskelet (Layout) Üretimi
- Sistem, girilen komutu alır ve **Groq (LLaMA-3)** API'sine gönderir.
- Groq, saniyeler içinde 3 farklı tasarım vizyonu (Layout) üretir. Bu aşamada gerçek veriler kullanılmaz, sadece iskelet ve Tailwind CSS sınıfları belirlenir.

## 3. Faz 2: Gemini ile Veri Bağlama
- Kullanıcı üretilen 3 vizyondan birini seçer.
- Sistem seçilen iskeleti ve kullanıcının verilerini **Gemini (1.5/2.0)** API'sine iletir.
- Gemini, tasarımı optimize eder ve gerçek verileri kodun içine yerleştirerek nihai interaktif dashboard'u ekrana basar.

## 4. Güvenlik ve Hata Yönetimi (Failover)
- Tüm işlemler tarayıcı (Client-Side) üzerinde gerçekleşir.
- API kotaları veya ağ hataları durumunda sistem otomatik olarak yedek yapay zeka modellerine geçiş yapar.
