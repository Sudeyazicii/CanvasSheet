export const kaggleDashboardDataset = [
  {
    "id": "financial_kpi_matrix",
    "title": "Lüks Finansal Analiz & KPI Izgarası",
    "subtitle": "Gelir, Gider ve Bütçe Performansı Özet Görünümü",
    "description": "Büyük finansal göstergeleri, net kar marjlarını ve nakit akışını takip etmek için özel olarak tasarlanmış, KPI odaklı premium bir tasarım.",
    "tags": ["finans", "kpi", "bütçe", "gelir", "operasyon", "executive", "kar", "nakit"],
    "widgets": [
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Toplam Brüt Gelir</div><div class='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1'>{{sum:Tutar}} TL</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full inline-block'>+14.2% Artış</div></div>"
        }
      },
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 2 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Ortalama İşlem Hacmi</div><div class='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-1'>{{avg:Tutar}} TL</div><div class='text-[10px] text-indigo-400 font-bold bg-indigo-400/10 px-2 py-0.5 rounded-full inline-block'>Dengeli Dağılım</div></div>"
        }
      },
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 3 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Aktif Kayıt Sayısı</div><div class='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-1'>{{count:1}} Adet</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full inline-block'>Stabil Veri Akışı</div></div>"
        }
      },
      {
        "type": "bar_chart",
        "gridPosition": { "colSpan": 8, "rowSpan": 2, "order": 4 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest mb-6'>Aylık/Kategori Dağılım Trendi</h4><div class='flex items-end justify-between h-40 pt-4 px-4'><div class='w-12 h-20 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-28 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-14 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-36 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-24 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div></div></div>"
        }
      },
      {
        "type": "comment_cards",
        "gridPosition": { "colSpan": 4, "rowSpan": 2, "order": 5 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest mb-4'>Sistem Sağlığı & İzleme</h4><div class='space-y-3'><div class='p-3 bg-slate-950/40 rounded-2xl border border-white/5'><div class='text-[10px] text-blue-400 font-bold uppercase mb-1'>Öneri</div><p class='text-xs text-slate-400 font-medium leading-relaxed'>Verilerdeki sapmaları engellemek için finansal kuralları etkinleştirin.</p></div><div class='p-3 bg-slate-950/40 rounded-2xl border border-white/5'><div class='text-[10px] text-emerald-400 font-bold uppercase mb-1'>Fırsat</div><p class='text-xs text-slate-400 font-medium leading-relaxed'>Ortalama hacim hedefin %12 üzerinde seyrediyor.</p></div></div></div>"
        }
      }
    ]
  },
  {
    "id": "operational_table_grid",
    "title": "Operasyonel Detay & Tablo Vizyonu",
    "subtitle": "Ham Verilerin Filtreleme ve Hücresel Gösterimi",
    "description": "Büyük veri setlerini, müşteri listelerini veya işlem detaylarını satır satır takip edip hızlı aksiyon almak isteyen ekipler için ideal tablo ağırlıklı yerleşim.",
    "tags": ["operasyon", "tablo", "detay", "filtre", "müşteri", "satış", "ürün", "envanter"],
    "widgets": [
      {
        "type": "smart_chips",
        "gridPosition": { "colSpan": 3, "rowSpan": 1, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Toplam Satır Adedi</div><div class='text-3xl font-black text-white'>{{count:1}} Satır</div></div>"
        }
      },
      {
        "type": "smart_chips",
        "gridPosition": { "colSpan": 3, "rowSpan": 1, "order": 2 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Ölçek Durumu</div><div class='text-3xl font-black text-emerald-400'>Kararlı</div></div>"
        }
      },
      {
        "type": "smart_chips",
        "gridPosition": { "colSpan": 6, "rowSpan": 1, "order": 3 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20 flex items-center justify-between'><span class='text-xs font-black text-slate-400 uppercase tracking-widest'>Aktif Filtreleme Modu</span><span class='px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-wider'>0 Token Kuralları Aktif</span></div>"
        }
      },
      {
        "type": "dynamic_canvas",
        "gridPosition": { "colSpan": 12, "rowSpan": 3, "order": 4 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest mb-6'>Operasyonel Veri Matrisi</h4><div class='overflow-x-auto'><table class='w-full text-left text-xs text-slate-400 border-collapse'><thead class='text-[10px] text-slate-500 font-bold uppercase border-b border-white/5'><tr class=''><th class='pb-3'>Anahtar</th><th class='pb-3'>Değer / Tutar</th><th class='pb-3'>Durum</th></tr></thead><tbody class='divide-y divide-white/5'><tr class='hover:bg-white/5 transition-colors'><td class='py-3 font-semibold text-white'>Kayıt #1</td><td class='py-3 font-medium text-slate-300'>{{sum:Tutar}} TL</td><td class='py-3'><span class='px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold'>Aktif</span></td></tr><tr class='hover:bg-white/5 transition-colors'><td class='py-3 font-semibold text-white'>Kayıt #2</td><td class='py-3 font-medium text-slate-300'>{{avg:Tutar}} TL</td><td class='py-3'><span class='px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-bold'>Kararlı</span></td></tr></tbody></table></div></div>"
        }
      }
    ]
  },
  {
    "id": "marketing_distribution_layout",
    "title": "Pazarlama Dağılım & Dönüşüm Hunisi",
    "subtitle": "Kanal ve Dağılım Metrikleri Görsel Paneli",
    "description": "Kategorilerin yüzde oranlarını, dağılımlarını ve pazarlama kanallarının ROI oranlarını dairesel ve geniş açılı görsel grafiklerle temsil eden şablon.",
    "tags": ["pazarlama", "grafik", "dağılım", "oran", "donut", "dairesel", "sales", "roi", "reklam"],
    "widgets": [
      {
        "type": "pie_chart",
        "gridPosition": { "colSpan": 5, "rowSpan": 2, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20 flex flex-col justify-between'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest mb-4'>Hacimsel Dağılım Oranı</h4><div class='flex items-center justify-center py-6'><div class='w-32 h-32 rounded-full border-[10px] border-blue-500 border-t-indigo-400 border-r-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center'><span class='text-lg font-black text-white'>%100</span></div></div><div class='text-[10px] text-center text-slate-500 font-bold uppercase'>Verinin Toplam Bütün İçindeki Yüzdeleri</div></div>"
        }
      },
      {
        "type": "line_chart",
        "gridPosition": { "colSpan": 7, "rowSpan": 2, "order": 2 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest mb-6'>Kümülatif Büyüme Eğrisi</h4><div class='relative h-44 flex items-end'><svg viewBox='0 0 100 30' class='w-full h-full text-blue-500'><path d='M0,30 Q25,20 50,15 T100,5' fill='none' stroke='currentColor' stroke-width='2' class='shadow-glow'/><path d='M0,30 Q25,20 50,15 T100,5 L100,30 L0,30 Z' fill='url(#grad)' opacity='0.15'/><defs><linearGradient id='grad' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='rgb(59, 130, 246)'/><stop offset='100%' stop-color='transparent'/></linearGradient></defs></svg><div class='absolute bottom-0 left-0 text-[10px] text-slate-500 font-bold'>BAŞLANGIÇ</div><div class='absolute bottom-0 right-0 text-[10px] text-blue-400 font-bold'>ZİRVE: {{sum:Tutar}} TL</div></div></div>"
        }
      }
    ]
  },
  {
    "id": "ceo_summary_deck",
    "title": "CEO Executive Karar Destek Ekranı",
    "subtitle": "Kritik Şirket İçi Metrikler ve Hedef Uyum Oranları",
    "description": "Yöneticilerin ve karar vericilerin tek bakışta hedefleri, sapmaları ve şirketin genel durumunu izleyebileceği sade, temiz ve minimalist arayüz.",
    "tags": ["ceo", "executive", "yönetici", "özet", "hedef", "minimalist", "temiz", "strateji"],
    "widgets": [
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 6, "rowSpan": 1, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Toplam Kayıtlı İşlem</div><div class='text-4xl font-black text-white'>{{count:1}} Kayıt</div><div class='text-[10px] text-slate-500 font-bold uppercase mt-1'>Kararlı Veri Kaynağı</div></div>"
        }
      },
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 6, "rowSpan": 1, "order": 2 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Toplam Parasal Hacim</div><div class='text-4xl font-black text-emerald-400'>{{sum:Tutar}} TL</div><div class='text-[10px] text-emerald-500 font-bold uppercase mt-1'>+8% Büyüme Limiti</div></div>"
        }
      },
      {
        "type": "dynamic_canvas",
        "gridPosition": { "colSpan": 12, "rowSpan": 2, "order": 3 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20'><div class='flex items-center justify-between mb-4'><h4 class='text-sm font-black text-slate-300 uppercase tracking-widest'>Yıllık Hedef Gerçekleşme Skalası</h4><span class='text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full'>Hedef: %100</span></div><div class='w-full bg-slate-950/60 rounded-full h-6 border border-white/5 overflow-hidden shadow-inner'><div class='bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]' style='width: 78%'></div></div><div class='flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase mt-2'><span>Başlangıç</span><span>Mevcut: %78</span><span>Bitiş</span></div></div>"
        }
      }
    ]
  },
  {
    "id": "neon_glow_matrix",
    "title": "Neon Glow Fütüristik Analiz Matrisi",
    "subtitle": "Karanlık Modda Parlayan Renk Geçişleri & Dinamik Kartlar",
    "description": "Genç, dinamik ve modern ekipler için tasarlanmış; lüks cam efekti, arka plan bulanıklığı ve siber neon renklerin öne çıktığı fütüristik dashboard.",
    "tags": ["neon", "glow", "fütüristik", "modern", "trend", "genç", "grafik", "siber"],
    "widgets": [
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-rose-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Toplam İşlem</div><div class='text-3xl font-black text-rose-500 shadow-rose-500/20 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'>{{count:1}}</div></div>"
        }
      },
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 2 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>Genel Toplam</div><div class='text-3xl font-black text-cyan-400 shadow-cyan-400/20 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'>{{sum:Tutar}}</div></div>"
        }
      },
      {
        "type": "kpi_card",
        "gridPosition": { "colSpan": 4, "rowSpan": 1, "order": 3 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/20'><div class='text-xs font-black text-slate-400 uppercase tracking-widest mb-2'>İşlem Ortalaması</div><div class='text-3xl font-black text-emerald-400 shadow-emerald-400/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'>{{avg:Tutar}}</div></div>"
        }
      }
    ]
  },
  {
    "id": "minimalist_data_grid",
    "title": "Minimalist ve Temiz Veri Matrisi",
    "subtitle": "Yüksek Okunabilirlik Ağırlıklı Siyah Beyaz Arayüz",
    "description": "Grafik ve görsel şölen yerine, saf metin okunabilirliği ve verinin hiyerarşik düzenine önem veren klasik minimalist tasarım modeli.",
    "tags": ["minimalist", "sade", "temiz", "klasik", "okunabilirlik", "siyah-beyaz", "basit"],
    "widgets": [
      {
        "type": "dynamic_canvas",
        "gridPosition": { "colSpan": 12, "rowSpan": 2, "order": 1 },
        "config": {
          "htmlTemplate": "<div class='w-full h-full bg-slate-900/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:border-white/10'><h4 class='text-sm font-black text-slate-200 uppercase tracking-widest mb-4'>Minimalist Veri Özeti</h4><p class='text-xs text-slate-400 font-medium leading-relaxed mb-4'>Bu düzen, karmaşık grafikler yerine verinizin sade ve özünü yansıtır. Analiz sonuçlarına göre toplam işlem hacminiz <strong class='text-white'>{{sum:Tutar}} TL</strong> seviyesinde olup, ortalama değer <strong class='text-white'>{{avg:Tutar}} TL</strong> olarak gerçekleşmiştir.</p><div class='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>Sistem Durumu: Kararlı</div></div>"
        }
      }
    ]
  }
];
