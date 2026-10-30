export const canvasVisionTemplates = [
  {
    id: "canvas_1",
    title: "Yönetici Özeti (KPI)",
    subtitle: "Aylık Toplam Ciro, Trend Analitiği & Canlı Hareketler",
    description: "Organizasyonun aylık toplam cirosunu, neon dalga trend grafiğini, hedef göstergesini ve canlı veritabanı kayıtlarını koyu cam efektli yönetici panelinde sunar.",
    image: "/canvas/sleek_dark_dashboard.jpg",
    category: "Yönetici Özeti (KPI)",
    akademikPrompt: "Organizasyonun aylık toplam cirosunu, bölge bazlı satış dağılımını ve en yüksek performans gösteren ilk 5 satış temsilcisini etkileşimli grafiklerle sunan modern bir yönetici paneli (dashboard) simüle et.",
    jsonUiSchema: { layout_type: "kpi_main", charts: ["kpi_card", "line_trend", "donut_progress", "data_table"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest'>KPI CARDS</span><span class='text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1'>+24%</span></div><div class='my-1'><div class='text-2xl font-black text-white tracking-tight'>{{sum:Tutar}} TL</div><div class='text-[10px] text-slate-400 font-semibold'>Aylık Toplam Ciro</div></div><div class='w-full h-8'><svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'><defs><linearGradient id='ct1' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#06b6d4' stop-opacity='0.4'/><stop offset='100%' stop-color='#06b6d4' stop-opacity='0'/></linearGradient></defs><path d='M 0 20 Q 25 5, 50 18 T 100 8 L 100 30 L 0 30 Z' fill='url(#ct1)'/><path d='M 0 20 Q 25 5, 50 18 T 100 8' fill='none' stroke='#06b6d4' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #06b6d4);'/></svg></div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] font-black text-emerald-400 uppercase tracking-widest'>KPI MARKETS</span><span class='text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full'>+5%</span></div><div class='my-1'><div class='text-2xl font-black text-white tracking-tight'>{{count:1}} Kayıt</div><div class='text-[10px] text-slate-400 font-semibold'>Bölgesel Dağılım</div></div><div class='w-full h-8'><svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'><defs><linearGradient id='ct2' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#10b981' stop-opacity='0.4'/><stop offset='100%' stop-color='#10b981' stop-opacity='0'/></linearGradient></defs><path d='M 0 22 Q 25 10, 50 15 T 100 6 L 100 30 L 0 30 Z' fill='url(#ct2)'/><path d='M 0 22 Q 25 10, 50 15 T 100 6' fill='none' stroke='#10b981' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #10b981);'/></svg></div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] font-black text-rose-400 uppercase tracking-widest'>AVERAGE METRIC</span><span class='text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full'>-8%</span></div><div class='my-1'><div class='text-2xl font-black text-white tracking-tight'>{{avg:Tutar}} TL</div><div class='text-[10px] text-slate-400 font-semibold'>Ortalama Satış</div></div><div class='w-full h-8'><svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'><defs><linearGradient id='ct3' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#f43f5e' stop-opacity='0.4'/><stop offset='100%' stop-color='#f43f5e' stop-opacity='0'/></linearGradient></defs><path d='M 0 12 Q 30 25, 60 14 T 100 24 L 100 30 L 0 30 Z' fill='url(#ct3)'/><path d='M 0 12 Q 30 25, 60 14 T 100 24' fill='none' stroke='#f43f5e' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #f43f5e);'/></svg></div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between'><span class='text-[10px] font-black text-violet-400 uppercase tracking-widest'>TOTAL METRIC</span><span class='text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full'>+18%</span></div><div class='my-1'><div class='text-2xl font-black text-white tracking-tight'>{{TOTAL_ROWS}} Satır</div><div class='text-[10px] text-slate-400 font-semibold'>Veritabanı Hacmi</div></div><div class='w-full h-8'><svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'><defs><linearGradient id='ct4' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#8b5cf6' stop-opacity='0.4'/><stop offset='100%' stop-color='#8b5cf6' stop-opacity='0'/></linearGradient></defs><path d='M 0 20 Q 25 8, 50 16 T 100 6 L 100 30 L 0 30 Z' fill='url(#ct4)'/><path d='M 0 20 Q 25 8, 50 16 T 100 6' fill='none' stroke='#8b5cf6' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #8b5cf6);'/></svg></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-4'><div><span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-0.5'>Trend Analitiği</span><h4 class='text-lg font-black text-white uppercase tracking-wider'>VENUE OVERVIEW</h4></div><div class='flex items-center gap-2'><div class='flex bg-slate-950/80 p-1 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400'><span class='px-2.5 py-0.5 rounded-lg bg-blue-600/30 text-cyan-300 border border-cyan-500/30 font-black'>Aylık</span><span class='px-2.5 py-0.5 hover:text-white cursor-pointer'>Haftalık</span><span class='px-2.5 py-0.5 hover:text-white cursor-pointer'>Yıllık</span></div><span class='px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]'>+34.2%</span></div></div><div class='relative flex-1 min-h-[170px] w-full flex items-center justify-center my-2'><svg viewBox='0 0 600 160' class='w-full h-full overflow-visible' preserveAspectRatio='none'><defs><linearGradient id='cyanPurpleGlow' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='#06b6d4'/><stop offset='50%' stop-color='#3b82f6'/><stop offset='100%' stop-color='#a855f7'/></linearGradient><linearGradient id='cyanPurpleArea' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#06b6d4' stop-opacity='0.45'/><stop offset='60%' stop-color='#8b5cf6' stop-opacity='0.15'/><stop offset='100%' stop-color='#0f172a' stop-opacity='0'/></linearGradient></defs><line x1='0' y1='30' x2='600' y2='30' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4'/><line x1='0' y1='75' x2='600' y2='75' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4'/><line x1='0' y1='120' x2='600' y2='120' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4'/><path d='M 0 130 C 70 80, 120 140, 180 85 C 240 30, 310 130, 380 60 C 450 15, 520 90, 600 45 L 600 160 L 0 160 Z' fill='url(#cyanPurpleArea)'/><path d='M 0 130 C 70 80, 120 140, 180 85 C 240 30, 310 130, 380 60 C 450 15, 520 90, 600 45' fill='none' stroke='url(#cyanPurpleGlow)' stroke-width='3.5' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(6,182,212,0.8));'/><circle cx='180' cy='85' r='5' fill='#38bdf8' stroke='#0f172a' stroke-width='2' style='filter: drop-shadow(0 0 6px #38bdf8);'/><circle cx='380' cy='60' r='6' fill='#a855f7' stroke='#ffffff' stroke-width='2' style='filter: drop-shadow(0 0 8px #a855f7);'/><circle cx='600' cy='45' r='5' fill='#ec4899' stroke='#0f172a' stroke-width='2' style='filter: drop-shadow(0 0 6px #ec4899);'/></svg></div><div class='flex justify-between items-center text-[11px] font-bold text-slate-400 pt-2 border-t border-white/5 px-2'><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-2'><h4 class='text-xs font-black text-white uppercase tracking-widest'>ACTIVE USERS</h4><span class='text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20'>Canlı</span></div><div class='flex flex-col items-center justify-center my-1'><div class='relative w-44 h-24 flex items-center justify-center'><svg viewBox='0 0 100 55' class='w-full h-full overflow-visible'><defs><linearGradient id='gg' x1='0%' y1='0%' x2='100%' y2='0%'><stop offset='0%' stop-color='#06b6d4'/><stop offset='100%' stop-color='#3b82f6'/></linearGradient></defs><path d='M 12 48 A 38 38 0 0 1 88 48' fill='none' stroke='#1e293b' stroke-width='7' stroke-linecap='round'/><path d='M 12 48 A 38 38 0 0 1 76 22' fill='none' stroke='url(#gg)' stroke-width='7.5' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(6,182,212,0.8));'/></svg><div class='absolute bottom-1 text-center'><div class='text-2xl font-black text-white tracking-tight'>74%</div><div class='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Progress Bar</div></div></div></div><div class='flex items-center justify-center gap-4 pt-2 border-t border-white/5'><div class='flex items-center gap-1.5 text-[10px] font-bold text-cyan-400'><span class='w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]'></span>Active</div><div class='flex items-center gap-1.5 text-[10px] font-bold text-slate-500'><span class='w-2 h-2 rounded-full bg-slate-600'></span>Inactive</div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 7 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-4'><div><span class='text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-0.5'>Canlı İşlem Kayıtları</span><h4 class='text-sm font-black text-white uppercase tracking-wider'>RECENT ACTIVITIES</h4></div><span class='px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold rounded-xl'>{{TOTAL_ROWS}} Satır</span></div><div class='space-y-2 overflow-y-auto max-h-[170px] pr-1'>{{LOOP_START}}<div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'><div class='flex items-center gap-3'><div class='w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-300'>ID</div><div><div class='text-xs font-black text-white'>{{col_0}}</div><div class='text-[10px] font-medium text-slate-400'>{{col_1}}</div></div></div><div class='text-right'><div class='text-xs font-black text-emerald-400'>{{col_2}} TL</div><span class='text-[9px] font-bold text-cyan-400/80 bg-cyan-400/10 px-2 py-0.5 rounded-full'>Tamamlandı</span></div></div>{{LOOP_END}}</div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_2",
    title: "İnsan Kaynakları & Performans",
    subtitle: "Personel, Görev & Trafik Karşılaştırma Matrisi",
    description: "Kullanıcı trafiği, departman aktiviteleri ve canlı görev durumu ile performans odaklı açık/koyu panel.",
    image: "/canvas/sleek_performance_dashboard.jpg",
    category: "Performans & Dağılım",
    akademikPrompt: "Şirket genelindeki personel sayısını, departman bazlı işe alım oranlarını ve çalışan memnuniyeti anket sonuçlarını çalışma zamanında dinamik olarak inşa edecek bir analitik panel konfigürasyonu üret.",
    jsonUiSchema: { layout_type: "distribution_focused", charts: ["pie_distribution", "bar_chart", "kpi_card"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-bold text-slate-400 uppercase'>Total Base</span><div class='text-3xl font-black text-white mt-1'>{{sum:Tutar}}</div></div><div class='w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-sm'>⚡</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-bold text-slate-400 uppercase'>Active Score</span><div class='text-3xl font-black text-white mt-1'>{{avg:Tutar}}</div></div><div class='w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-black text-sm'>📈</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-bold text-slate-400 uppercase'>Total Projects</span><div class='text-3xl font-black text-white mt-1'>{{count:1}}</div></div><div class='w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-sm'>🎯</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-bold text-slate-400 uppercase'>Live Records</span><div class='text-3xl font-black text-white mt-1'>{{TOTAL_ROWS}}</div></div><div class='w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-black text-sm'>📊</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-3'><div><span class='text-[10px] font-black text-blue-400 uppercase tracking-widest'>Trend Çizelgesi</span><h4 class='text-sm font-black text-white uppercase'>Users, Projects & Operating Status</h4></div><div class='flex items-center gap-3 text-xs font-bold'><span class='flex items-center gap-1.5 text-purple-400'><span class='w-2 h-2 rounded-full bg-purple-400'></span> Users</span><span class='flex items-center gap-1.5 text-cyan-400'><span class='w-2 h-2 rounded-full bg-cyan-400'></span> Projects</span></div></div><div class='relative flex-1 min-h-[140px] w-full flex items-center justify-center my-2'><svg viewBox='0 0 600 130' class='w-full h-full overflow-visible' preserveAspectRatio='none'><path d='M 0 90 Q 75 40, 150 70 T 300 30 T 450 60 T 600 20' fill='none' stroke='#a855f7' stroke-width='3' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #a855f7);'/><path d='M 0 110 Q 75 80, 150 95 T 300 70 T 450 40 T 600 50' fill='none' stroke='#06b6d4' stroke-width='2.5' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #06b6d4);'/></svg></div><div class='flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1'><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 6, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><h4 class='text-xs font-black text-white uppercase tracking-widest mb-3'>Device Traffic</h4><div class='flex items-end justify-between h-32 px-4 gap-3'><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-16 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Web</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-24 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Mobile</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-28 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]'></div><span class='text-[9px] text-cyan-400 font-bold'>Tablet</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-14 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Other</span></div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 6, rowSpan: 2, order: 7 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><h4 class='text-xs font-black text-white uppercase tracking-widest mb-3'>Location Traffic</h4><div class='flex items-end justify-between h-32 px-4 gap-3'><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-20 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>EU</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-32 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]'></div><span class='text-[9px] text-cyan-400 font-bold'>US</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-24 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>TR</span></div><div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-18 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>ASIA</span></div></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 8 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-4'><h4 class='text-xs font-black text-white uppercase tracking-widest'>Projects Overview</h4><span class='text-[10px] text-slate-400 font-bold'>{{TOTAL_ROWS}} Satır</span></div><div class='space-y-2 overflow-y-auto max-h-[160px] pr-1'>{{LOOP_START}}<div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'><div class='flex items-center gap-3'><span class='w-2 h-2 rounded-full bg-cyan-400'></span><span class='text-xs font-bold text-white'>{{col_0}}</span><span class='text-[10px] text-slate-400'>{{col_1}}</span></div><span class='px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black rounded-full'>In Progress</span></div>{{LOOP_END}}</div></div>"
        }
      }
    ]
  },
  {
    id: "canvas_3",
    title: "Operasyon / Telemetri",
    subtitle: "Stok Durumu, Kritik Eşik & Telemetri Çıktısı",
    description: "Depolardaki anlık stok durumunu, operasyonel telemetri eğrilerini ve canlı kayıt matrisini sunan endüstriyel takip paneli.",
    image: "/canvas/sleek_operations_dashboard.jpg",
    category: "Operasyon / Telemetri",
    akademikPrompt: "Depolardaki anlık stok durumunu, kritik seviyenin altındaki ürünlerin listesini ve tedarik zinciri gecikme trendlerini MCP standartlarında sunan operasyonel paneli.",
    jsonUiSchema: { layout_type: "inventory_matrix", charts: ["kpi_card", "bar_chart", "data_table"] },
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-black text-amber-400 uppercase tracking-widest'>Toplam Operasyon Hacmi</span><div class='text-3xl font-black text-white mt-1'>{{sum:Tutar}} TL</div><span class='text-[10px] text-amber-400/80 font-bold'>%99.4 Güvenilirlik</span></div><div class='w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg'>⚡</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-black text-emerald-400 uppercase tracking-widest'>Ortalama Hız</span><div class='text-3xl font-black text-emerald-400 mt-1'>{{avg:Tutar}} TL</div><span class='text-[10px] text-emerald-400/80 font-bold'>Düşük Gecikme</span></div><div class='w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg'>⏱️</div></div>"
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'><div><span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest'>Canlı Kayıt Hacmi</span><div class='text-3xl font-black text-white mt-1'>{{TOTAL_ROWS}} Satır</div><span class='text-[10px] text-cyan-400/80 font-bold'>0 Gecikme</span></div><div class='w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-lg'>📡</div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-3'><div><span class='text-[10px] font-black text-amber-400 uppercase tracking-widest'>Operasyonel Telemetri</span><h4 class='text-sm font-black text-white uppercase'>Süreç & Çıktı Akışı</h4></div><span class='px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black rounded-xl'>Nominal Seviye</span></div><div class='relative flex-1 min-h-[140px] w-full flex items-center justify-center my-2'><svg viewBox='0 0 600 130' class='w-full h-full overflow-visible' preserveAspectRatio='none'><path d='M 0 100 Q 100 30, 200 80 T 400 40 T 600 70' fill='none' stroke='#f59e0b' stroke-width='3' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(245,158,11,0.7));'/><path d='M 0 115 Q 100 85, 200 100 T 400 65 T 600 90' fill='none' stroke='#10b981' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #10b981);'/></svg></div><div class='flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1'><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span></div></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center text-center'><h4 class='text-xs font-black text-white uppercase tracking-widest mb-1'>Sistem Verimliliği</h4><div class='relative w-36 h-36 flex items-center justify-center my-1'><svg viewBox='0 0 100 100' class='w-full h-full -rotate-90'><circle cx='50' cy='50' r='40' fill='none' stroke='#1e293b' stroke-width='8'/><circle cx='50' cy='50' r='40' fill='none' stroke='#f59e0b' stroke-width='8' stroke-dasharray='251.2' stroke-dashoffset='45' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(245,158,11,0.6));'/></svg><div class='absolute inset-0 flex flex-col items-center justify-center'><span class='text-2xl font-black text-white'>%92</span><span class='text-[9px] font-bold text-amber-400 uppercase'>Optimum</span></div></div><span class='text-[10px] text-slate-400 font-semibold'>Kritik Hata Yok</span></div>"
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: "<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'><div class='flex items-center justify-between mb-4'><h4 class='text-xs font-black text-white uppercase tracking-widest'>Canlı Operasyon Kayıtları</h4><span class='text-[10px] text-slate-400 font-bold'>{{TOTAL_ROWS}} Satır</span></div><div class='space-y-2 overflow-y-auto max-h-[160px] pr-1'>{{LOOP_START}}<div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'><div class='flex items-center gap-3'><span class='w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]'></span><span class='text-xs font-bold text-white'>{{col_0}}</span><span class='text-[10px] text-slate-400'>{{col_1}}</span></div><div class='text-right'><span class='text-xs font-black text-amber-400'>{{col_2}} TL</span><span class='block text-[8px] font-bold text-emerald-400 uppercase'>Doğrulandı</span></div></div>{{LOOP_END}}</div></div>"
        }
      }
    ]
  }
];
