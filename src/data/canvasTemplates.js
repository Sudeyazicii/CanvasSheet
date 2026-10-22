export const canvasVisionTemplates = [
  {
    id: "canvas_1",
    title: "Yönetici Özeti (KPI)",
    subtitle: "Aylık Toplam Ciro, Bölge Bazlı Dağılım & Temsilci Performansı",
    description: "Organizasyonun aylık toplam cirosunu, bölge bazlı satış dağılımını ve en yüksek performans gösteren ilk 5 satış temsilcisini etkileşimli grafiklerle sunan modern yönetici paneli.",
    image: "/canvas/54af25b5acbc8641415498be3d7cadf7369bf45e.avif",
    category: "Yönetici Özeti (KPI)",
    akademikPrompt: "Organizasyonun aylık toplam cirosunu, bölge bazlı satış dağılımını ve en yüksek performans gösteren ilk 5 satış temsilcisini etkileşimli grafiklerle sunan modern bir yönetici paneli (dashboard) simüle et.",
    jsonUiSchema: { layout_type: "kpi_main", charts: ["kpi_card", "line_trend", "donut_progress", "data_table"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-blue-400 uppercase tracking-widest mb-2'>Aylık Toplam Ciro</div><div class='text-3xl font-black text-white mb-1'>{{sum:Tutar}} TL</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full inline-block'>+18.4% Hedef Üzeri</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-indigo-400 uppercase tracking-widest mb-2'>Bölge Bazlı Satış</div><div class='text-3xl font-black text-white mb-1'>{{avg:Tutar}} TL</div><div class='text-[10px] text-indigo-400 font-bold bg-indigo-400/10 px-2.5 py-1 rounded-full inline-block'>Bölgesel Lider</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-emerald-400 uppercase tracking-widest mb-2'>Performans Liderleri</div><div class='text-3xl font-black text-white mb-1'>{{count:1}} Temsilci</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full inline-block'>%98 Başarı Oranı</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-6'>Ciro & Trend Matrisi</h4><div class='flex items-end justify-between h-40 pt-4 px-4'><div class='w-12 h-20 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-32 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-24 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-40 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div><div class='w-12 h-28 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl shadow-[0_0_15px_rgba(56,189,248,0.3)]'></div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-4'>Stratejik Notlar</h4><div class='space-y-3'><div class='p-3 bg-slate-950/60 rounded-2xl border border-white/5'><div class='text-[10px] text-blue-400 font-bold uppercase mb-1'>Öneri</div><p class='text-xs text-slate-300'>En yüksek performanslı 5 temsilcinin stratejilerini tüm bölgeye yayın.</p></div></div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_2",
    title: "İnsan Kaynakları (HR)",
    subtitle: "Personel Sayısı, İşe Alım Oranları & Memnuniyet Analitiği",
    description: "Şirket genelindeki personel sayısını, departman bazlı işe alım oranlarını ve çalışan memnuniyeti anket sonuçlarını çalışma zamanında dinamik inşa eden HR paneli.",
    image: "/canvas/Frame 696.png",
    category: "İnsan Kaynakları (HR)",
    akademikPrompt: "Şirket genelindeki personel sayısını, departman bazlı işe alım oranlarını ve çalışan memnuniyeti anket sonuçlarını çalışma zamanında (runtime) dinamik olarak inşa edecek bir analitik panel konfigürasyonu üret.",
    jsonUiSchema: { layout_type: "distribution_focused", charts: ["pie_distribution", "bar_chart", "kpi_card"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-violet-400 uppercase tracking-widest mb-2'>Toplam Personel Sayısı</div><div class='text-3xl font-black text-white mb-1'>{{count:1}} Kişi</div><div class='text-[10px] text-violet-400 font-bold bg-violet-400/10 px-2.5 py-1 rounded-full inline-block'>Aktif Kadro</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-pink-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-pink-400 uppercase tracking-widest mb-2'>İşe Alım Oranı</div><div class='text-3xl font-black text-white mb-1'>%14.2</div><div class='text-[10px] text-pink-400 font-bold bg-pink-400/10 px-2.5 py-1 rounded-full inline-block'>Büyüyen Ekip</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-emerald-400 uppercase tracking-widest mb-2'>Memnuniyet Skoru</div><div class='text-3xl font-black text-white mb-1'>4.8 / 5.0</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full inline-block'>Yüksek Bağlılık</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl'><div class='flex items-center justify-between mb-6'><h4 class='text-sm font-black text-white uppercase tracking-widest'>Departman Dağılımı & Kadro Analitiği</h4><span class='px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-full border border-violet-500/20'>Aktif Kadro</span></div><div class='grid grid-cols-2 sm:grid-cols-4 gap-4'><div class='p-4 bg-violet-950/40 border border-violet-500/10 rounded-2xl text-center'><div class='text-xs text-slate-400 font-bold'>Yazılım & AR-GE</div><div class='text-2xl font-black text-violet-400 mt-1'>%42</div></div><div class='p-4 bg-pink-950/40 border border-pink-500/10 rounded-2xl text-center'><div class='text-xs text-slate-400 font-bold'>Pazarlama & Büyüme</div><div class='text-2xl font-black text-pink-400 mt-1'>%28</div></div><div class='p-4 bg-indigo-950/40 border border-indigo-500/10 rounded-2xl text-center'><div class='text-xs text-slate-400 font-bold'>Operasyon</div><div class='text-2xl font-black text-indigo-400 mt-1'>%18</div></div><div class='p-4 bg-emerald-950/40 border border-emerald-500/10 rounded-2xl text-center'><div class='text-xs text-slate-400 font-bold'>İnsan Kaynakları</div><div class='text-2xl font-black text-emerald-400 mt-1'>%12</div></div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-pink-500/20 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-4'>İK Retansiyon & İçgörü</h4><div class='space-y-3'><div class='p-3 bg-pink-950/30 rounded-2xl border border-pink-500/10'><div class='text-[10px] text-pink-400 font-bold uppercase mb-1'>Öneri</div><p class='text-xs text-slate-300'>Teknoloji ekibinde uzaktan çalışma memnuniyeti %92 ile lider konumda.</p></div></div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_3",
    title: "Operasyon / Stok",
    subtitle: "Stok Durumu, Kritik Seviye & Tedarik Zinciri Trendleri",
    description: "Depolardaki anlık stok durumunu, kritik seviyenin altındaki ürünlerin listesini ve tedarik zinciri gecikme trendlerini MCP standartlarında sunan operasyonel paneli.",
    image: "/canvas/Poster (2).png",
    category: "Operasyon/Stok",
    akademikPrompt: "Depolardaki anlık stok durumunu, kritik seviyenin altındaki ürünlerin listesini ve tedarik zinciri gecikme trendlerini Model Context Protocol (MCP) standartlarına uygun bir JSON UI şeması olarak yapılandır.",
    jsonUiSchema: { layout_type: "operational_grid", charts: ["data_table", "kpi_progress", "line_trend"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 6, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-amber-400 uppercase tracking-widest mb-2'>Toplam Envanter Adedi</div><div class='text-4xl font-black text-white mb-1'>{{sum:Tutar}} Birim</div><div class='text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full inline-block'>Dengeli Stok</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 6, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-rose-400 uppercase tracking-widest mb-2'>Kritik Stok Uyarısı</div><div class='text-4xl font-black text-rose-500 mb-1'>3 Ürün</div><div class='text-[10px] text-rose-400 font-bold bg-rose-400/10 px-2.5 py-1 rounded-full inline-block'>Sipariş Yenilenmeli</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 3, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-6'>Depo & Operasyon Matrisi</h4><div class='overflow-x-auto'><table class='w-full text-left text-xs text-slate-300'><thead class='text-[10px] text-amber-400 font-bold uppercase border-b border-white/10'><tr className=''><th className='pb-3'>Depo Kodu</th><th className='pb-3'>Mevcut Stok</th><th className='pb-3'>Durum</th></tr></thead><tbody className='divide-y divide-white/5'><tr className=''><td className='py-3 font-semibold text-white'>Depo #1 (Merkez)</td><td className='py-3 font-medium text-slate-300'>{{avg:Tutar}} Adet</td><td><span className='px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-bold'>Kararlı</span></td></tr></tbody></table></div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_4",
    title: "Satış Analitiği",
    subtitle: "Dönemsel Gelir Trendleri & Coğrafi Dağılım",
    description: "Organizasyonun genel satış performansını, dönemsel gelir trendlerini ve coğrafi satış dağılımını MCP standartlarına uygun olarak görselleştiren satış paneli.",
    image: "/canvas/Dashboard Overview.png",
    category: "Satış Analitiği",
    akademikPrompt: "Organizasyonun genel satış performansını, dönemsel gelir trendlerini ve coğrafi satış dağılımını Model Context Protocol (MCP) standartlarına uygun bir JSON UI şeması olarak yapılandır.",
    jsonUiSchema: { layout_type: "analytical_overview", charts: ["data_table", "pie_marketing", "line_trend"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-cyan-400 uppercase tracking-widest mb-2'>Brüt Satış Geliri</div><div class='text-3xl font-black text-white mb-1'>{{sum:Tutar}} TL</div><div class='text-[10px] text-cyan-400 font-bold bg-cyan-400/10 px-2.5 py-1 rounded-full inline-block'>+22% Dönemsel Büyüme</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-blue-400 uppercase tracking-widest mb-2'>Sipariş Başı Ortalama</div><div class='text-3xl font-black text-white mb-1'>{{avg:Tutar}} TL</div><div class='text-[10px] text-blue-400 font-bold bg-blue-400/10 px-2.5 py-1 rounded-full inline-block'>Yüksek Sepet Ortalaması</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-emerald-400 uppercase tracking-widest mb-2'>Sadakat İndeksi</div><div class='text-3xl font-black text-white mb-1'>%88.4</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full inline-block'>Yüksek Tekrar Alım</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-4'>Coğrafi Gelir Dağılımı</h4><div class='flex items-center justify-between text-xs text-slate-300 border-b border-white/5 py-2.5'><span>Marmara Bölgesi</span><span className='font-bold text-cyan-400'>%45 Ciro Payı</span></div><div class='flex items-center justify-between text-xs text-slate-300 border-b border-white/5 py-2.5'><span>Ege Bölgesi</span><span className='font-bold text-blue-400'>%30 Ciro Payı</span></div><div class='flex items-center justify-between text-xs text-slate-300 py-2.5'><span>İç Anadolu Bölgesi</span><span className='font-bold text-indigo-400'>%25 Ciro Payı</span></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-4'>Kanal Dönüşümü</h4><div class='space-y-3'><div class='flex justify-between items-center text-xs'><span class='text-slate-400'>Doğrudan Web</span><span class='text-white font-bold'>%54</span></div><div class='w-full bg-white/5 h-2 rounded-full overflow-hidden'><div class='bg-cyan-400 h-full w-[54%]'></div></div><div class='flex justify-between items-center text-xs mt-3'><span class='text-slate-400'>Pazar Yeri</span><span class='text-white font-bold'>%32</span></div><div class='w-full bg-white/5 h-2 rounded-full overflow-hidden'><div class='bg-blue-500 h-full w-[32%]'></div></div></div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_5",
    title: "Performans Analizi",
    subtitle: "Operasyonel Veriler & Anahtar Göstergeler (KPI)",
    description: "Anlık operasyonel verileri, anahtar performans göstergelerini (KPI) ve süreç trendlerini tarayıcı tabanlı görselleştirme kütüphaneleriyle canlandıran analiz paneli.",
    image: "/canvas/Dashboard.png",
    category: "Performans Analizi",
    akademikPrompt: "Anlık operasyonel verileri, anahtar performans göstergelerini (KPI) ve süreç trendlerini tarayıcı tabanlı görselleştirme kütüphaneleriyle canlandıran deterministik bir analiz paneli şeması üret.",
    jsonUiSchema: { layout_type: "performance_grid", charts: ["kpi_progress", "bar_ranking", "pie_workload"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-emerald-400 uppercase tracking-widest mb-2'>Toplam Veri Hacmi</div><div class='text-3xl font-black text-white mb-1'>{{TOTAL_ROWS}} Satır</div><div class='text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full inline-block'>Veri Seti Aktif</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-teal-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-teal-400 uppercase tracking-widest mb-2'>Performans İndeksi</div><div class='text-3xl font-black text-teal-400 mb-1'>%96.8</div><div class='text-[10px] text-teal-400 font-bold bg-teal-400/10 px-2.5 py-1 rounded-full inline-block'>Mükemmel Verim</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-6 shadow-2xl'><div class='text-xs font-black text-blue-400 uppercase tracking-widest mb-2'>Kümülatif Toplam</div><div class='text-3xl font-black text-white mb-1'>{{sum:Tutar}} TL</div><div class='text-[10px] text-blue-400 font-bold bg-blue-400/10 px-2.5 py-1 rounded-full inline-block'>Büyüme Sürdürülebilir</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl'><div class='flex items-center justify-between mb-6'><h4 class='text-sm font-black text-white uppercase tracking-widest'>Performans & Gelir Analiz Grafiği</h4><span class='px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20'>Canlı İndeks</span></div><div class='flex items-end justify-between h-44 pt-6 px-4 gap-3'><div class='flex-1 flex flex-col items-center gap-2'><div class='w-full h-24 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]'></div><span class='text-[10px] font-bold text-slate-400'>Oca</span></div><div class='flex-1 flex flex-col items-center gap-2'><div class='w-full h-36 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]'></div><span class='text-[10px] font-bold text-slate-400'>Şub</span></div><div class='flex-1 flex flex-col items-center gap-2'><div class='w-full h-28 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]'></div><span class='text-[10px] font-bold text-slate-400'>Mar</span></div><div class='flex-1 flex flex-col items-center gap-2'><div class='w-full h-40 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]'></div><span class='text-[10px] font-bold text-slate-400'>Nis</span></div><div class='flex-1 flex flex-col items-center gap-2'><div class='w-full h-32 bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-t-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)]'></div><span class='text-[10px] font-bold text-slate-400'>May</span></div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl'><h4 class='text-sm font-black text-white uppercase tracking-widest mb-4'>Veri Satırları & Detay</h4><div class='space-y-2.5 max-h-48 overflow-y-auto pr-1'>{{LOOP_START}}<div class='p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl flex items-center justify-between transition-all'><span class='text-xs font-bold text-slate-200'>{{col_0}}</span><span class='text-xs font-black text-emerald-400'>{{col_1}}</span></div>{{LOOP_END}}</div></div>"
        }
      }
    ]
  }
];
