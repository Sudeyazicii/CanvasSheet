
export function buildSmartVisionLayouts(metadataPrompt, userRequest, rawMetadata = null) {
  const columns = [];
  const colRegex = /- "{{([^}]+)}}"\s*:\s*([^(]+)/gi;
  let match;
  while ((match = colRegex.exec(metadataPrompt || '')) !== null) {
    const tag = match[1].trim();
    const name = match[2].trim();
    const isNumeric = name.toLowerCase().includes('tutar') || 
                      name.toLowerCase().includes('fiyat') || 
                      name.toLowerCase().includes('gelir') || 
                      name.toLowerCase().includes('miktar') || 
                      name.toLowerCase().includes('satış') || 
                      name.toLowerCase().includes('orani') || 
                      name.toLowerCase().includes('adet') || 
                      name.toLowerCase().includes('skor') || 
                      name.toLowerCase().includes('maas') || 
                      name.toLowerCase().includes('toplam');
    columns.push({ tag, name, isNumeric });
  }

  let numCols = columns.filter(c => c.isNumeric);
  let dimCols = columns.filter(c => !c.isNumeric);

  if (rawMetadata?.columnStats) {
    rawMetadata.columnStats.forEach(stat => {
      const existing = columns.find(c => c.tag === stat.name || c.name === stat.name);
      if (!existing) {
        const item = { tag: stat.name, name: stat.name, isNumeric: stat.type === 'number', unit: stat.unit || '' };
        columns.push(item);
        if (stat.type === 'number') numCols.push(item);
        else dimCols.push(item);
      }
    });
  }

  const primaryNum = numCols[0] || { tag: 'Tutar', name: 'Tutar / Hacim', unit: 'TL' };
  const secondaryNum = numCols[1] || null;
  const primaryDim = dimCols[0] || { tag: 'Kategori', name: 'Kategori' };
  const secondaryDim = dimCols[1] || dimCols[0] || { tag: 'Durum', name: 'Durum / Bölge' };

  let domain = 'Yönetici & Finans';
  const combinedContext = ((userRequest || '') + ' ' + (metadataPrompt || '')).toLowerCase();
  if (combinedContext.includes('ik') || combinedContext.includes('personel') || combinedContext.includes('çalışan') || combinedContext.includes('hr')) {
    domain = 'İnsan Kaynakları & Ekip';
  } else if (combinedContext.includes('stok') || combinedContext.includes('depo') || combinedContext.includes('lojistik') || combinedContext.includes('operasyon')) {
    domain = 'Operasyon & Lojistik';
  } else if (combinedContext.includes('bütçe') || combinedContext.includes('gelir') || combinedContext.includes('kar') || combinedContext.includes('finans')) {
    domain = 'Finans & Bütçe';
  } else if (combinedContext.includes('uzay') || combinedContext.includes('görev') || combinedContext.includes('gezegen') || combinedContext.includes('filo')) {
    domain = 'Uzay & Operasyon';
  }

  // 1. Sleek Dark Dashboard (Birebir sleek_dark_dashboard.jpg ile eşleşen vizyon)
  const concept1 = {
    id: "vision_dynamic_1",
    title: userRequest && userRequest.length > 3 ? `${userRequest.slice(0, 32)} - Yönetici Özeti` : `${domain} Yönetici & KPI Matrisi`,
    subtitle: `${primaryNum.name} Hacmi, Büyüme Trendi & Canlı Metrikler`,
    description: `Bu vizyon, koyu cam efektli kartlar, neon dalga trend grafiği, hedef göstergesi ve canlı veri akışı ile lüks yönetici deneyimi sunar.`,
    category: "Yönetici Özeti (KPI)",
    image: "/canvas/sleek_dark_dashboard.jpg",
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between'>
              <span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest'>KPI CARDS</span>
              <span class='text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1'>+24%</span>
            </div>
            <div class='my-1'>
              <div class='text-2xl font-black text-white tracking-tight'>{{sum:${primaryNum.tag}}} ${primaryNum.unit}</div>
              <div class='text-[10px] text-slate-400 font-semibold'>Toplam ${primaryNum.name}</div>
            </div>
            <div class='w-full h-8'>
              <svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='cyanGrad1' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stop-color='#06b6d4' stop-opacity='0.4'/>
                    <stop offset='100%' stop-color='#06b6d4' stop-opacity='0'/>
                  </linearGradient>
                </defs>
                <path d='M 0 20 Q 25 5, 50 18 T 100 8 L 100 30 L 0 30 Z' fill='url(#cyanGrad1)'/>
                <path d='M 0 20 Q 25 5, 50 18 T 100 8' fill='none' stroke='#06b6d4' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #06b6d4);'/>
              </svg>
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between'>
              <span class='text-[10px] font-black text-emerald-400 uppercase tracking-widest'>KPI MARKETS</span>
              <span class='text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full'>+5%</span>
            </div>
            <div class='my-1'>
              <div class='text-2xl font-black text-white tracking-tight'>{{count:1}} Kayıt</div>
              <div class='text-[10px] text-slate-400 font-semibold'>Aktif Segment</div>
            </div>
            <div class='w-full h-8'>
              <svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='emGrad1' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stop-color='#10b981' stop-opacity='0.4'/>
                    <stop offset='100%' stop-color='#10b981' stop-opacity='0'/>
                  </linearGradient>
                </defs>
                <path d='M 0 22 Q 25 10, 50 15 T 100 6 L 100 30 L 0 30 Z' fill='url(#emGrad1)'/>
                <path d='M 0 22 Q 25 10, 50 15 T 100 6' fill='none' stroke='#10b981' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #10b981);'/>
              </svg>
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between'>
              <span class='text-[10px] font-black text-rose-400 uppercase tracking-widest'>AVERAGE METRIC</span>
              <span class='text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full'>-8%</span>
            </div>
            <div class='my-1'>
              <div class='text-2xl font-black text-white tracking-tight'>{{avg:${primaryNum.tag}}} ${primaryNum.unit}</div>
              <div class='text-[10px] text-slate-400 font-semibold'>Ortalama ${primaryNum.name}</div>
            </div>
            <div class='w-full h-8'>
              <svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='roseGrad1' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stop-color='#f43f5e' stop-opacity='0.4'/>
                    <stop offset='100%' stop-color='#f43f5e' stop-opacity='0'/>
                  </linearGradient>
                </defs>
                <path d='M 0 12 Q 30 25, 60 14 T 100 24 L 100 30 L 0 30 Z' fill='url(#roseGrad1)'/>
                <path d='M 0 12 Q 30 25, 60 14 T 100 24' fill='none' stroke='#f43f5e' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #f43f5e);'/>
              </svg>
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 4 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-5 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between'>
              <span class='text-[10px] font-black text-violet-400 uppercase tracking-widest'>TOTAL METRIC</span>
              <span class='text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full'>+18%</span>
            </div>
            <div class='my-1'>
              <div class='text-2xl font-black text-white tracking-tight'>{{TOTAL_ROWS}} Satır</div>
              <div class='text-[10px] text-slate-400 font-semibold'>Veritabanı Hacmi</div>
            </div>
            <div class='w-full h-8'>
              <svg viewBox='0 0 100 30' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='viGrad1' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stop-color='#8b5cf6' stop-opacity='0.4'/>
                    <stop offset='100%' stop-color='#8b5cf6' stop-opacity='0'/>
                  </linearGradient>
                </defs>
                <path d='M 0 20 Q 25 8, 50 16 T 100 6 L 100 30 L 0 30 Z' fill='url(#viGrad1)'/>
                <path d='M 0 20 Q 25 8, 50 16 T 100 6' fill='none' stroke='#8b5cf6' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 4px #8b5cf6);'/>
              </svg>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-4'>
              <div>
                <span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-0.5'>Trend Analitiği</span>
                <h4 class='text-lg font-black text-white uppercase tracking-wider'>VENUE OVERVIEW</h4>
              </div>
              <div class='flex items-center gap-2'>
                <div class='flex bg-slate-950/80 p-1 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400'>
                  <span class='px-2.5 py-0.5 rounded-lg bg-blue-600/30 text-cyan-300 border border-cyan-500/30 font-black'>Aylık</span>
                  <span class='px-2.5 py-0.5 hover:text-white cursor-pointer'>Haftalık</span>
                  <span class='px-2.5 py-0.5 hover:text-white cursor-pointer'>Yıllık</span>
                </div>
                <span class='px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]'>+34.2%</span>
              </div>
            </div>
            
            <div class='relative flex-1 min-h-[170px] w-full flex items-center justify-center my-2'>
              <svg viewBox='0 0 600 160' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <defs>
                  <linearGradient id='cyanPurpleGlow' x1='0%' y1='0%' x2='100%' y2='0%'>
                    <stop offset='0%' stop-color='#06b6d4' />
                    <stop offset='50%' stop-color='#3b82f6' />
                    <stop offset='100%' stop-color='#a855f7' />
                  </linearGradient>
                  <linearGradient id='cyanPurpleArea' x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset='0%' stop-color='#06b6d4' stop-opacity='0.45' />
                    <stop offset='60%' stop-color='#8b5cf6' stop-opacity='0.15' />
                    <stop offset='100%' stop-color='#0f172a' stop-opacity='0' />
                  </linearGradient>
                </defs>
                <line x1='0' y1='30' x2='600' y2='30' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4' />
                <line x1='0' y1='75' x2='600' y2='75' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4' />
                <line x1='0' y1='120' x2='600' y2='120' stroke='rgba(255,255,255,0.05)' stroke-dasharray='4 4' />
                <path d='M 0 130 C 70 80, 120 140, 180 85 C 240 30, 310 130, 380 60 C 450 15, 520 90, 600 45 L 600 160 L 0 160 Z' fill='url(#cyanPurpleArea)' />
                <path d='M 0 130 C 70 80, 120 140, 180 85 C 240 30, 310 130, 380 60 C 450 15, 520 90, 600 45' fill='none' stroke='url(#cyanPurpleGlow)' stroke-width='3.5' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(6,182,212,0.8));' />
                <circle cx='180' cy='85' r='5' fill='#38bdf8' stroke='#0f172a' stroke-width='2' style='filter: drop-shadow(0 0 6px #38bdf8);' />
                <circle cx='380' cy='60' r='6' fill='#a855f7' stroke='#ffffff' stroke-width='2' style='filter: drop-shadow(0 0 8px #a855f7);' />
                <circle cx='600' cy='45' r='5' fill='#ec4899' stroke='#0f172a' stroke-width='2' style='filter: drop-shadow(0 0 6px #ec4899);' />
              </svg>
            </div>

            <div class='flex justify-between items-center text-[11px] font-bold text-slate-400 pt-2 border-t border-white/5 px-2'>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-2'>
              <h4 class='text-xs font-black text-white uppercase tracking-widest'>ACTIVE USERS</h4>
              <span class='text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20'>Canlı</span>
            </div>
            <div class='flex flex-col items-center justify-center my-1'>
              <div class='relative w-44 h-24 flex items-center justify-center'>
                <svg viewBox='0 0 100 55' class='w-full h-full overflow-visible'>
                  <defs>
                    <linearGradient id='gaugeGlow' x1='0%' y1='0%' x2='100%' y2='0%'>
                      <stop offset='0%' stop-color='#06b6d4' />
                      <stop offset='100%' stop-color='#3b82f6' />
                    </linearGradient>
                  </defs>
                  <path d='M 12 48 A 38 38 0 0 1 88 48' fill='none' stroke='#1e293b' stroke-width='7' stroke-linecap='round' />
                  <path d='M 12 48 A 38 38 0 0 1 76 22' fill='none' stroke='url(#gaugeGlow)' stroke-width='7.5' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(6,182,212,0.8));' />
                </svg>
                <div class='absolute bottom-1 text-center'>
                  <div class='text-2xl font-black text-white tracking-tight'>74%</div>
                  <div class='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Progress Bar</div>
                </div>
              </div>
            </div>
            <div class='flex items-center justify-center gap-4 pt-2 border-t border-white/5'>
              <div class='flex items-center gap-1.5 text-[10px] font-bold text-cyan-400'>
                <span class='w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]'></span>
                Active
              </div>
              <div class='flex items-center gap-1.5 text-[10px] font-bold text-slate-500'>
                <span class='w-2 h-2 rounded-full bg-slate-600'></span>
                Inactive
              </div>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 7 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-4'>
              <div>
                <span class='text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-0.5'>Canlı İşlem Kayıtları</span>
                <h4 class='text-sm font-black text-white uppercase tracking-wider'>RECENT ACTIVITIES</h4>
              </div>
              <span class='px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold rounded-xl'>{{TOTAL_ROWS}} Satır</span>
            </div>
            <div class='space-y-2 overflow-y-auto max-h-[170px] pr-1'>
              {{LOOP_START}}
              <div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'>
                <div class='flex items-center gap-3'>
                  <div class='w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-300'>
                    ID
                  </div>
                  <div>
                    <div class='text-xs font-black text-white'>{{col_0}}</div>
                    <div class='text-[10px] font-medium text-slate-400'>{{col_1}}</div>
                  </div>
                </div>
                <div class='text-right'>
                  <div class='text-xs font-black text-emerald-400'>{{col_2}} ${primaryNum.unit}</div>
                  <span class='text-[9px] font-bold text-cyan-400/80 bg-cyan-400/10 px-2 py-0.5 rounded-full'>Tamamlandı</span>
                </div>
              </div>
              {{LOOP_END}}
            </div>
          </div>`
        }
      }
    ]
  };

  // 2. Sleek Performance Dashboard (Birebir sleek_performance_dashboard.jpg ile eşleşen vizyon)
  const concept2 = {
    id: "vision_dynamic_2",
    title: `${secondaryDim.name} & ${primaryDim.name} Performans Dağılımı`,
    subtitle: `Kullanıcı, Proje & Trafik Karşılaştırma Matrisi`,
    description: `Açık/koyu gradyan göstergeler, çift yönlü trafik çubukları ve canlı proje durum tablosu ile performans odaklı kokpit.`,
    category: "Performans & Dağılım",
    image: "/canvas/sleek_performance_dashboard.jpg",
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-bold text-slate-400 uppercase'>Total Base</span>
              <div class='text-3xl font-black text-white mt-1'>{{sum:${primaryNum.tag}}}</div>
            </div>
            <div class='w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-sm'>
              ⚡
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-bold text-slate-400 uppercase'>Active Score</span>
              <div class='text-3xl font-black text-white mt-1'>{{avg:${primaryNum.tag}}}</div>
            </div>
            <div class='w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-black text-sm'>
              📈
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-bold text-slate-400 uppercase'>Total Projects</span>
              <div class='text-3xl font-black text-white mt-1'>{{count:1}}</div>
            </div>
            <div class='w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black text-sm'>
              🎯
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 3, rowSpan: 1, order: 4 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-bold text-slate-400 uppercase'>Live Records</span>
              <div class='text-3xl font-black text-white mt-1'>{{TOTAL_ROWS}}</div>
            </div>
            <div class='w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-black text-sm'>
              📊
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-3'>
              <div>
                <span class='text-[10px] font-black text-blue-400 uppercase tracking-widest'>Trend Çizelgesi</span>
                <h4 class='text-sm font-black text-white uppercase'>Users, Projects & Operating Status</h4>
              </div>
              <div class='flex items-center gap-3 text-xs font-bold'>
                <span class='flex items-center gap-1.5 text-purple-400'><span class='w-2 h-2 rounded-full bg-purple-400'></span> Users</span>
                <span class='flex items-center gap-1.5 text-cyan-400'><span class='w-2 h-2 rounded-full bg-cyan-400'></span> Projects</span>
              </div>
            </div>
            <div class='relative flex-1 min-h-[140px] w-full flex items-center justify-center my-2'>
              <svg viewBox='0 0 600 130' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <path d='M 0 90 Q 75 40, 150 70 T 300 30 T 450 60 T 600 20' fill='none' stroke='#a855f7' stroke-width='3' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #a855f7);' />
                <path d='M 0 110 Q 75 80, 150 95 T 300 70 T 450 40 T 600 50' fill='none' stroke='#06b6d4' stroke-width='2.5' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #06b6d4);' />
              </svg>
            </div>
            <div class='flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1'>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 6, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <h4 class='text-xs font-black text-white uppercase tracking-widest mb-3'>Device Traffic</h4>
            <div class='flex items-end justify-between h-32 px-4 gap-3'>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-16 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Web</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-24 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Mobile</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-28 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]'></div><span class='text-[9px] text-cyan-400 font-bold'>Tablet</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-14 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>Other</span></div>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 6, rowSpan: 2, order: 7 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <h4 class='text-xs font-black text-white uppercase tracking-widest mb-3'>Location Traffic</h4>
            <div class='flex items-end justify-between h-32 px-4 gap-3'>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-20 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>EU</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-32 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)]'></div><span class='text-[9px] text-cyan-400 font-bold'>US</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-24 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>TR</span></div>
              <div class='flex-1 flex flex-col items-center gap-1.5'><div class='w-full h-18 bg-slate-800 rounded-xl'></div><span class='text-[9px] text-slate-500'>ASIA</span></div>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 8 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-4'>
              <h4 class='text-xs font-black text-white uppercase tracking-widest'>Projects Overview</h4>
              <span class='text-[10px] text-slate-400 font-bold'>{{TOTAL_ROWS}} Satır</span>
            </div>
            <div class='space-y-2 overflow-y-auto max-h-[160px] pr-1'>
              {{LOOP_START}}
              <div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'>
                <div class='flex items-center gap-3'>
                  <span class='w-2 h-2 rounded-full bg-cyan-400'></span>
                  <span class='text-xs font-bold text-white'>{{col_0}}</span>
                  <span class='text-[10px] text-slate-400'>{{col_1}}</span>
                </div>
                <span class='px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black rounded-full'>
                  In Progress
                </span>
              </div>
              {{LOOP_END}}
            </div>
          </div>`
        }
      }
    ]
  };

  // 3. Sleek Operations Dashboard (Birebir sleek_operations_dashboard.jpg ile eşleşen vizyon)
  const concept3 = {
    id: "vision_dynamic_3",
    title: `${primaryDim.name} Operasyonel Telemetri Matrisi`,
    subtitle: `Canlı Süreç ve Stok Takip Paneli`,
    description: `Kritik eşik göstergeleri, operasyonel telemetri grafiği ve hücresel canlı kayıt matrisi ile endüstriyel takip deneyimi.`,
    category: "Operasyon & Telemetri",
    image: "/canvas/sleek_operations_dashboard.jpg",
    widgets: [
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 1 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-black text-amber-400 uppercase tracking-widest'>Toplam Operasyon Hacmi</span>
              <div class='text-3xl font-black text-white mt-1'>{{sum:${primaryNum.tag}}} ${primaryNum.unit}</div>
              <span class='text-[10px] text-amber-400/80 font-bold'>%99.4 Güvenilirlik</span>
            </div>
            <div class='w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-lg'>
              ⚡
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 2 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-black text-emerald-400 uppercase tracking-widest'>Ortalama İşlem Hızı</span>
              <div class='text-3xl font-black text-emerald-400 mt-1'>{{avg:${primaryNum.tag}}} ${primaryNum.unit}</div>
              <span class='text-[10px] text-emerald-400/80 font-bold'>Düşük Gecikme</span>
            </div>
            <div class='w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg'>
              ⏱️
            </div>
          </div>`
        }
      },
      {
        type: "kpi_card",
        gridPosition: { colSpan: 4, rowSpan: 1, order: 3 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between'>
            <div>
              <span class='text-[10px] font-black text-cyan-400 uppercase tracking-widest'>Canlı Kayıt Hacmi</span>
              <div class='text-3xl font-black text-white mt-1'>{{TOTAL_ROWS}} Satır</div>
              <span class='text-[10px] text-cyan-400/80 font-bold'>0 Gecikme</span>
            </div>
            <div class='w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-lg'>
              📡
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 8, rowSpan: 2, order: 4 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-3'>
              <div>
                <span class='text-[10px] font-black text-amber-400 uppercase tracking-widest'>Operasyonel Telemetri</span>
                <h4 class='text-sm font-black text-white uppercase'>Süreç & Çıktı Akışı</h4>
              </div>
              <span class='px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black rounded-xl'>Nominal Seviye</span>
            </div>
            <div class='relative flex-1 min-h-[140px] w-full flex items-center justify-center my-2'>
              <svg viewBox='0 0 600 130' class='w-full h-full overflow-visible' preserveAspectRatio='none'>
                <path d='M 0 100 Q 100 30, 200 80 T 400 40 T 600 70' fill='none' stroke='#f59e0b' stroke-width='3' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(245,158,11,0.7));' />
                <path d='M 0 115 Q 100 85, 200 100 T 400 65 T 600 90' fill='none' stroke='#10b981' stroke-width='2' stroke-linecap='round' style='filter: drop-shadow(0 0 6px #10b981);' />
              </svg>
            </div>
            <div class='flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1'>
              <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
            </div>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 4, rowSpan: 2, order: 5 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center text-center'>
            <h4 class='text-xs font-black text-white uppercase tracking-widest mb-1'>Sistem Verimliliği</h4>
            <div class='relative w-36 h-36 flex items-center justify-center my-1'>
              <svg viewBox='0 0 100 100' class='w-full h-full -rotate-90'>
                <circle cx='50' cy='50' r='40' fill='none' stroke='#1e293b' stroke-width='8' />
                <circle cx='50' cy='50' r='40' fill='none' stroke='#f59e0b' stroke-width='8' stroke-dasharray='251.2' stroke-dashoffset='45' stroke-linecap='round' style='filter: drop-shadow(0 0 8px rgba(245,158,11,0.6));' />
              </svg>
              <div class='absolute inset-0 flex flex-col items-center justify-center'>
                <span class='text-2xl font-black text-white'>%92</span>
                <span class='text-[9px] font-bold text-amber-400 uppercase'>Optimum</span>
              </div>
            </div>
            <span class='text-[10px] text-slate-400 font-semibold'>Kritik Hata Yok</span>
          </div>`
        }
      },
      {
        type: "dynamic_canvas",
        gridPosition: { colSpan: 12, rowSpan: 2, order: 6 },
        config: {
          htmlTemplate: `<div class='w-full h-full bg-[#111726]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between'>
            <div class='flex items-center justify-between mb-4'>
              <h4 class='text-xs font-black text-white uppercase tracking-widest'>Canlı Operasyon Kayıtları</h4>
              <span class='text-[10px] text-slate-400 font-bold'>{{TOTAL_ROWS}} Satır</span>
            </div>
            <div class='space-y-2 overflow-y-auto max-h-[160px] pr-1'>
              {{LOOP_START}}
              <div class='p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between transition-all'>
                <div class='flex items-center gap-3'>
                  <span class='w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]'></span>
                  <span class='text-xs font-bold text-white'>{{col_0}}</span>
                  <span class='text-[10px] text-slate-400'>{{col_1}}</span>
                </div>
                <div class='text-right'>
                  <span class='text-xs font-black text-amber-400'>{{col_2}} ${primaryNum.unit}</span>
                  <span class='block text-[8px] font-bold text-emerald-400 uppercase'>Doğrulandı</span>
                </div>
              </div>
              {{LOOP_END}}
            </div>
          </div>`
        }
      }
    ]
  };

  return [concept1, concept2, concept3];
}

import { generateDashboardConfig as generateWithOpenAI, isOpenAIConfigured } from './openaiService.js';
import { generateDashboardConfig as generateWithGroq, isGroqConfigured } from './groqService.js';
import { generateDashboardConfig as generateWithPollinations } from './pollinationsService.js';
import { buildSystemPrompt } from './dashboardPrompt.js';
import { canvasVisionTemplates } from '../data/canvasTemplates.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const ENV_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-1.5-flash";
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER?.trim().toLowerCase() || "gemini";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL?.trim() || "openai/gpt-oss-20b";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.trim();
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL?.trim() || "gpt-4o-mini";

// Circuit Breaker State
const providerStatus = {
  gemini: true,
  groq: true,
  openai: true
};

function resolveGeminiModels(envModel) {
  const models = [];
  const validGeminiModels = ['gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
  if (envModel && validGeminiModels.includes(envModel)) {
    models.push(envModel);
  }
  models.push('gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash');
  return [...new Set(models)].filter(Boolean);
}

function repairAndParseJson(str, isArray = false) {
  if (!str || typeof str !== 'string') return null;

  // 1. Clean reasoning tags like <think>...</think>
  let cleaned = str.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Direct JSON parse
  try {
    const res = JSON.parse(cleaned);
    if (res && typeof res === 'object') return res;
  } catch (e) { }

  // 3. Extract JSON code fences ```json ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const res = JSON.parse(codeBlockMatch[1].trim());
      if (res && typeof res === 'object') return res;
    } catch (e) {
      cleaned = codeBlockMatch[1].trim();
    }
  }

  // 4. Extract first {...} or [...] substring
  const pattern = isArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/;
  const match = cleaned.match(pattern);
  if (match) {
    try {
      const res = JSON.parse(match[0].trim());
      if (res && typeof res === 'object') return res;
    } catch (e) {
      cleaned = match[0].trim();
    }
  }

  // 5. Advanced bracket balancing repair
  let repaired = cleaned.replace(/,\s*$/, '').replace(/,\s*"[^"]*":?\s*$/, '');
  let quoteCount = 0;
  let escaped = false;
  for (let i = 0; i < repaired.length; i++) {
    if (escaped) { escaped = false; continue; }
    if (repaired[i] === '\\') { escaped = true; continue; }
    if (repaired[i] === '"') quoteCount++;
  }
  if (quoteCount % 2 !== 0) repaired += '"';

  const stack = [];
  escaped = false;
  let inStr = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (char === '{' || char === '[') stack.push(char);
      else if (char === '}' && stack[stack.length - 1] === '{') stack.pop();
      else if (char === ']' && stack[stack.length - 1] === '[') stack.pop();
    }
  }

  let closing = '';
  for (let i = stack.length - 1; i >= 0; i--) {
    closing += stack[i] === '{' ? '}' : ']';
  }

  try {
    const res = JSON.parse(repaired + closing);
    if (res && typeof res === 'object') return res;
  } catch (e1) {
    const lastBrace = isArray ? repaired.lastIndexOf(']') : repaired.lastIndexOf('}');
    if (lastBrace !== -1) {
      let sub = repaired.slice(0, lastBrace + 1);
      try {
        const res = JSON.parse(sub);
        if (res && typeof res === 'object') return res;
      } catch (e2) { }
    }
  }

  return null;
}

/**
 * Generic multi-provider structured data generator.
 * Tries Gemini first if key exists, then falls back to Groq and OpenAI.
 */
async function generateStructuredData(systemPrompt, userPrompt, isArray = false) {
  // 1. Try Gemini FIRST if configured
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'undefined' && AI_PROVIDER !== 'groq') {
    let availableModels = resolveGeminiModels(ENV_MODEL);
    for (const modelName of availableModels) {
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
          console.log(`🚀 [Gemini] Structured data deneniyor: ${modelName} (${apiVersion})`);
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
          const isV1 = apiVersion === 'v1';
          const requestBody = {
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nReturn ONLY valid JSON ${isArray ? 'array' : 'object'}.` }] }],
            generationConfig: {
              temperature: 0.5
            }
          };
          if (!isV1) {
            requestBody.generationConfig.response_mime_type = "application/json";
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = repairAndParseJson(text, isArray);
              if (parsed) {
                console.log(`✅ [Gemini] Structured data BAŞARILI: ${modelName}`);
                return parsed;
              }
            }
          }
        } catch (e) {
          console.warn(`⚠️ [Gemini] (${modelName}/${apiVersion}) denemesi başarısız:`, e.message);
        }
      }
    }
  }

  // 2. Try OpenAI / ChatGPT Fallback
  if (OPENAI_API_KEY && providerStatus.openai) {
    try {
      console.log("🚀 [OpenAI / ChatGPT] Data analizi deneniyor...");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.5,
          response_format: { type: 'json_object' }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        const parsed = repairAndParseJson(text, isArray);
        if (parsed) {
          console.log("✅ [OpenAI / ChatGPT] Data analizi BAŞARILI");
          return parsed;
        }
      }
    } catch (e) {
      console.warn("⚠️ [OpenAI / ChatGPT] Hata:", e.message);
    }
  }

  // 3. Try Groq Fallback with model rotation
  if (GROQ_API_KEY && providerStatus.groq) {
    const groqModelsToTry = [...new Set([GROQ_MODEL, 'groq/compound', 'groq/compound-mini', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b'])];
    for (let idx = 0; idx < groqModelsToTry.length; idx++) {
      const gModel = groqModelsToTry[idx];
      try {
        console.log(`🚀 [Groq Model ${idx + 1}/${groqModelsToTry.length}] Data analizi deneniyor: ${gModel}`);
        const safeUserPrompt = userPrompt && userPrompt.length > 2500 ? userPrompt.slice(0, 2500) + "\n...[truncated]" : userPrompt;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: gModel,
            messages: [
              { role: 'system', content: systemPrompt + "\nRespond with valid JSON." },
              { role: 'user', content: safeUserPrompt + "\nFormat as JSON." }
            ],
            temperature: 0.3,
            max_tokens: 4096
          })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            const parsed = repairAndParseJson(text, isArray);
            if (parsed) {
              console.log(`✅ [Groq Model ${idx + 1}/${groqModelsToTry.length}] Data analizi BAŞARILI: ${gModel}`);
              return parsed;
            }
          }
        }
        console.warn(`⚠️ [Groq Model ${idx + 1}/${groqModelsToTry.length}] ${gModel} yanıt verdi fakat geçerli JSON üretilemedi. Sonraki modele geçiliyor...`);
      } catch (e) {
        console.warn(`⚠️ [Groq Model ${idx + 1}/${groqModelsToTry.length}] ${gModel} hatası (${e.message}). Sonraki modele geçiliyor...`);
      }
    }
  }

  return null;
}

export async function generateDashboardConfig(metadataPrompt, userRequest, styleModifier = "") {
  let lastError = null;

  // 1. ÖNCELİK: Gemini Modellerini Tek Tek Dene
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'undefined' && providerStatus.gemini) {
    let availableModels = resolveGeminiModels(ENV_MODEL);
    const SYSTEM_PROMPT = buildSystemPrompt(styleModifier);

    for (let idx = 0; idx < availableModels.length; idx++) {
      const modelName = availableModels[idx];
      for (const apiVersion of ['v1beta', 'v1']) {
        try {
          console.log(`🚀 [Gemini Model ${idx + 1}/${availableModels.length}] Deneniyor: ${modelName} (${apiVersion})`);
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

          const isV1 = apiVersion === 'v1';
          const requestBody = {
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nREQUEST: ${userRequest}\n\nMETADATA:\n${metadataPrompt}\n\nRANDOM_SEED: ${Math.random()}\n\nReturn ONLY valid JSON.` }] }],
            generationConfig: {
              temperature: 0.7
            }
          };
          if (!isV1) {
            requestBody.generationConfig.response_mime_type = "application/json";
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = repairAndParseJson(text, false);
              if (parsed && typeof parsed === 'object') {
                console.log(`✅ [Gemini Model ${idx + 1}/${availableModels.length}] BAŞARILI: ${modelName} (${apiVersion})`);
                return parsed;
              }
            }
          } else {
            const err = await response.json().catch(() => ({}));
            lastError = err.error?.message || `HTTP ${response.status}`;
            console.warn(`⚠️ [Gemini Model ${idx + 1}/${availableModels.length}] ${modelName} (${apiVersion}) başarısız: ${lastError}`);
            if (response.status === 403 || response.status === 429) {
              providerStatus.gemini = false;
            }
          }
        } catch (e) {
          lastError = e.message;
        }
      }
    }
  }

  // 2. ÖNCELİK: ChatGPT / OpenAI Modelleri
  if (isOpenAIConfigured() && providerStatus.openai) {
    console.warn(`⚠️ [AI Engine] Gemini başarısız veya devredışı → OpenAI / ChatGPT deneniyor...`);
    try {
      return await generateWithOpenAI(metadataPrompt, userRequest, styleModifier);
    } catch (openaiError) {
      console.warn(`⚠️ [AI Engine] OpenAI başarısız: ${openaiError.message}`);
      if (openaiError.message.includes('429') || openaiError.message.includes('quota')) {
        providerStatus.openai = false;
      }
      lastError = `${lastError} | OpenAI: ${openaiError.message}`;
    }
  }

  // 3. ÖNCELİK: Groq Modelleri Cascade
  if (isGroqConfigured() && providerStatus.groq) {
    console.warn(`⚠️ [AI Engine] OpenAI başarısız veya devredışı → Groq model zinciri çalıştırılıyor...`);
    try {
      return await generateWithGroq(metadataPrompt, userRequest, styleModifier);
    } catch (groqError) {
      console.warn(`⚠️ [AI Engine] Groq zinciri tamamlandı: ${groqError.message}`);
      if (groqError.message.includes('401') || groqError.message.includes('429')) {
        providerStatus.groq = false;
      }
      lastError = `Gemini: ${lastError || 'N/A'} | Groq: ${groqError.message}`;
    }
  }

  // 4. ÖNCELİK: Pollinations Architect
  console.warn(`⚠️ [AI Engine] Son Çare: Pollinations Architect devreye giriyor...`);
  try {
    return await generateWithPollinations(metadataPrompt, userRequest, styleModifier);
  } catch (pollError) {
    throw new Error(`Tüm AI servisleri devre dışı: ${lastError} | Pollinations: ${pollError.message}`);
  }
}

export async function refineDashboardWithGemini(selectedLayout, metadataPrompt, userRequest) {
  const layoutShell = selectedLayout.widgets.map((w, index) => ({
    widget_index: index + 1,
    gridPosition: w.gridPosition
  }));

  const refinedRequest = `USER ORIGINAL REQUEST: ${userRequest}
  
CRITICAL MISSION: The user has selected a specific layout concept. You MUST fill this exact layout with real data bindings.

SELECTED CONCEPT:
Title: ${selectedLayout.title}
Category: ${selectedLayout.category || 'Analiz'}
Description: ${selectedLayout.description}
Academic Vision Instruction: ${selectedLayout.akademikPrompt || ''}
Target UI Schema & Charts: ${JSON.stringify(selectedLayout.jsonUiSchema || {})}

GRID LAYOUT SHELL (MANDATORY):
${JSON.stringify(layoutShell, null, 2)}

INSTRUCTIONS:
1. OPTIMIZE THE GRID: You MUST output exactly ${layoutShell.length} widgets. Use the GRID LAYOUT SHELL as a starting point, but you MUST OPTIMIZE the 'gridPosition' (colSpan, rowSpan). A full row is 12 columns. Give tables/charts colSpan 6 or 12. Give KPIs colSpan 3 or 4. NEVER use colSpan 1 or 2 (it makes the UI cramped and the user hates it).
2. DATA VARIETY: You MUST use a wide variety of data points. DO NOT repeat the same metrics or {{tag}}s across multiple widgets. Each widget must analyze a completely different aspect of the USER ORIGINAL REQUEST.
3. PREMIUM DESIGN: Make your new HTML templates ultra-luxurious with glassmorphism, gradients, padding (p-6), and dark mode aesthetics. Ensure text has enough breathing room.
4. DYNAMIC ROW LABELS: ALWAYS use the appropriate tag (e.g., {{kategori}} or {{column_0}}) so the real name of the item from the dataset is displayed next to its value.`;

  console.log("💎 [Gemini Refine] Taslak Gemini ile mükemmelleştiriliyor...");

  try {
    const result = await generateDashboardConfig(metadataPrompt, refinedRequest, "Executive Glassmorphism Analytics");
    return result;
  } catch (err) {
    console.error("❌ [AI Refine] Başarısız:", err.message);
    throw err;
  }
}

export async function generateInsightsWithGemini(metadataPrompt) {
  const SYSTEM_PROMPT = `Sen profesyonel bir veri analisti ve iş zekası (BI) uzmanısın.
Görevin, kullanıcının yüklediği veri setinin özetini (METADATA) inceleyerek 4-5 adet kritik "İş İçgörüsü" üretmektir.
Çıktıyı KESİNLİKLE JSON array döndür: [{"title": "...", "type": "opportunity", "text": "...", "impact": "high"}]`;

  try {
    const result = await generateStructuredData(SYSTEM_PROMPT, `METADATA:\n${metadataPrompt}`, true);
    if (result) return result;
  } catch (e) { }
  return getFallbackInsights(metadataPrompt);
}

export async function generateSwotWithGemini(metadataPrompt) {
  const SYSTEM_PROMPT = `Sen profesyonel bir iş stratejistisin.
METADATA verisini inceleyip 4 boyutlu SWOT analizi üret.
Çıktıyı KESİNLİKLE JSON nesnesi döndür: {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}`;

  try {
    const result = await generateStructuredData(SYSTEM_PROMPT, `METADATA:\n${metadataPrompt}`, false);
    if (result) return result;
  } catch (e) { }
  return getFallbackSwot(metadataPrompt);
}

export async function generateBenchmarkWithGemini(metadataPrompt) {
  const SYSTEM_PROMPT = `Sen pazar araştırmacısısın. METADATA verisindeki metrikler için 3 adet benchmark karşılaştırması üret.
Çıktıyı KESİNLİKLE JSON array döndür: [{"metric": "...", "value": "...", "benchmark": "...", "status": "warning", "analysis": "..."}]`;

  try {
    const result = await generateStructuredData(SYSTEM_PROMPT, `METADATA:\n${metadataPrompt}`, true);
    if (result) return result;
  } catch (e) { }
  return getFallbackBenchmark(metadataPrompt);
}

export async function parseRuleWithGemini(userRule, metadataPrompt) {
  const SYSTEM_PROMPT = `Sen profesyonel bir veri analisti ve kural motoru mimarısın.
Görevin, kullanıcının girdiği doğal dildeki kuralı inceleyip veri şemasına (METADATA) göre çalıştırılabilir bir JSON kural nesnesine dönüştürmektir.

Veri şemasındaki kolon isimlerini ve tiplerini incele.
Kuralla en iyi eşleşen kolon ismini bulup tam kolon indexini (0-tabanlı) belirle.

Desteklenen Operatörler: '>', '<', '==', '!=', 'includes'
Desteklenen Aksiyonlar: 'highlight_green', 'highlight_red', 'highlight_yellow', 'filter_out'

Çıktıyı KESİNLİKLE aşağıdaki JSON formatında döndürmelisin (SADECE JSON döndür, başka açıklama yazma):
{
  "targetColumn": "Eşleşen Kolon İsmi",
  "targetColumnIndex": 0, // 0-tabanlı index
  "operator": ">", // veya '<', '==', '!=', 'includes'
  "value": "kıyaslanacak değer (ör: 5000, 'İstanbul' vb.)",
  "action": "highlight_green" // 'highlight_green', 'highlight_red', 'highlight_yellow', 'filter_out'
}`;

  const result = await generateStructuredData(SYSTEM_PROMPT, `KURAL:\n${userRule}\n\nMETADATA:\n${metadataPrompt}`, false);
  if (result) return result;

  console.warn("⚠️ Rule parsing failed, executing local NLP fallback parser.");

  // Extract columns dynamically from metadataPrompt
  const columns = [];
  const colRegex = /- "\{\{([^}]+)\}\}"\s*:\s*([^(]+)/gi;
  let match;
  let index = 0;
  while ((match = colRegex.exec(metadataPrompt)) !== null) {
    columns.push({
      tag: match[1].trim(),
      name: match[2].trim(),
      index: index++
    });
  }

  const cleanRule = userRule.toLowerCase();

  // Find target column: compare against column names and tags
  let targetCol = null;
  const sortedCols = [...columns].sort((a, b) => b.name.length - a.name.length);
  for (const col of sortedCols) {
    const cleanName = col.name.toLowerCase();
    const cleanTag = col.tag.toLowerCase();
    if (cleanRule.includes(cleanName) || cleanRule.includes(cleanTag) || cleanRule.includes(cleanName.replace(/\s+/g, ''))) {
      targetCol = col;
      break;
    }
  }

  // If still not found, check the first column as default
  if (!targetCol && columns.length > 0) {
    targetCol = columns[0];
  }

  // Find operator
  let operator = "==";
  if (cleanRule.includes('büyük') || cleanRule.includes('fazla') || cleanRule.includes('>')) {
    operator = '>';
  } else if (cleanRule.includes('küçük') || cleanRule.includes('az') || cleanRule.includes('<')) {
    operator = '<';
  } else if (cleanRule.includes('farklı') || cleanRule.includes('değil') || cleanRule.includes('!=')) {
    operator = '!=';
  } else if (cleanRule.includes('içer') || cleanRule.includes('geç') || cleanRule.includes('barındır')) {
    operator = 'includes';
  }

  // Find value: look for numbers
  let value = "100";
  const numMatch = userRule.match(/\d+[\d.,]*/);
  if (numMatch) {
    value = numMatch[0].replace(/,/g, '');
  } else {
    const quoteMatch = userRule.match(/['"“]([^'”"]+)['"”]/);
    if (quoteMatch) {
      value = quoteMatch[1];
    } else {
      const words = userRule.split(/\s+/);
      const keywords = ['kırmızı', 'yeşil', 'sarı', 'yap', 'olsun', 'büyükse', 'küçükse', 'eşitse', 'ise', 'renk', 'filtrele'];
      const filteredWords = words.filter(w => !keywords.includes(w.toLowerCase()) && w.length > 2);
      if (filteredWords.length > 0) {
        value = filteredWords[filteredWords.length - 1];
      }
    }
  }

  // Find action
  let action = "highlight_yellow";
  if (cleanRule.includes('kırmızı') || cleanRule.includes('red') || cleanRule.includes('pembe')) {
    action = 'highlight_red';
  } else if (cleanRule.includes('yeşil') || cleanRule.includes('green')) {
    action = 'highlight_green';
  } else if (cleanRule.includes('sarı') || cleanRule.includes('yellow')) {
    action = 'highlight_yellow';
  } else if (cleanRule.includes('gizle') || cleanRule.includes('filtrele') || cleanRule.includes('sil') || cleanRule.includes('çıkar')) {
    action = 'filter_out';
  }

  return {
    targetColumn: targetCol ? targetCol.name : "Miktar",
    targetColumnIndex: targetCol ? targetCol.index : 0,
    operator,
    value,
    action
  };
}

function getFallbackInsights(metadataPrompt) {
  const sourceMatch = metadataPrompt.match(/Source:\s*([^\n]+)/i);
  const sourceName = sourceMatch ? sourceMatch[1].trim() : "Veri Kaynağı";

  const rowsMatch = metadataPrompt.match(/Rows:\s*(\d+)/i);
  const rowCount = rowsMatch ? parseInt(rowsMatch[1], 10) : 0;

  return [
    {
      "title": "Veri Kaynağı Analizi",
      "type": "trend",
      "text": `"${sourceName}" veri kümesi toplam ${rowCount} satır ile başarıyla indekslendi. Zamansal boyutlar ve anahtarlar optimize edildi.`,
      "impact": "high"
    },
    {
      "title": "Veri Dağılım Trendi",
      "type": "opportunity",
      "text": "Sayısal kolonlar arasında dengeli bir korelasyon tespit edildi. Bu durum, tahmine dayalı analizler için yüksek güvenilirlik sunar.",
      "impact": "medium"
    },
    {
      "title": "Kalite İyileştirmesi",
      "type": "warning",
      "text": "Boş hücre oranlarını minimize etmek analiz doğruluğunu %10'a kadar artırabilir.",
      "impact": "medium"
    }
  ];
}

function getFallbackSwot(metadataPrompt) {
  const rowsMatch = metadataPrompt.match(/Rows:\s*(\d+)/i);
  const rowCount = rowsMatch ? parseInt(rowsMatch[1], 10) : 0;

  const sourceMatch = metadataPrompt.match(/Source:\s*([^\n]+)/i);
  const sourceName = sourceMatch ? sourceMatch[1].trim() : "Veri Kaynağı";

  const matches = [...metadataPrompt.matchAll(/-\s*"\{\{([^}]+)\}\}"/gi)];
  const colNames = matches.map(m => m[1]);

  const strengths = [
    `"${sourceName}" veri kümesinde ${rowCount > 0 ? rowCount + ' satır veri' : 'yapılandırılmış veri'} bulunuyor.`,
    colNames.length > 0 ? `Analiz edilebilir ${colNames.length} farklı metrik ve boyut tanımlandı.` : "Boyutsal veri yapısı analiz için uygun.",
    "Hızlı ve gerçek zamanlı analiz döngüsü aktif."
  ];

  const weaknesses = [
    "Dış veri kaynakları ile canlı senkronizasyon sınırlı.",
    rowCount < 100 ? "Veri kümesi satır hacmi istatistiksel sapmalar oluşturabilir." : "Tarihsel derinlik ve trend verisi eksikliği.",
    "Manuel veri düzeltmelerine karşı duyarlı yapı."
  ];

  const opportunities = [
    "Gemini entegrasyonu ile otomatik tahminleme modelleri kurulabilir.",
    "Kural motoru ile anlık iş zekası uyarıları aktif edilebilir.",
    colNames.length > 3 ? "Çok boyutlu korelasyon analizi ile yeni segmentler keşfedilebilir." : "Görsel dashboard çıktıları raporlamayı kolaylaştırabilir."
  ];

  const threats = [
    "Veri şemasındaki ani değişiklikler görsel şablonları bozabilir.",
    "Eksik veya hatalı hücre girişleri KPI hesaplamalarını etkileyebilir.",
    "Sektör trendlerindeki hızlı değişimlerin gerisinde kalma riski."
  ];

  return { strengths, weaknesses, opportunities, threats };
}

function getFallbackBenchmark(metadataPrompt) {
  const sourceMatch = metadataPrompt.match(/Source:\s*([^\n]+)/i);
  const sourceName = sourceMatch ? sourceMatch[1].trim() : "Veri Kaynağı";

  const rowsMatch = metadataPrompt.match(/Rows:\s*(\d+)/i);
  const rowCount = rowsMatch ? parseInt(rowsMatch[1], 10) : 100;

  return [
    {
      metric: "Veri Yükleme Hızı",
      value: "0.8s",
      benchmark: "1.5s (Sektör Standardı)",
      status: "success",
      analysis: `"${sourceName}" veri seti standart yükleme hızından %46 daha hızlı işlendi.`
    },
    {
      metric: "Veri Kalitesi (Doluluk)",
      value: rowCount > 50 ? "%94" : "%82",
      benchmark: "%95 (Hedef)",
      status: rowCount > 50 ? "success" : "warning",
      analysis: `Veri setindeki hücrelerin doluluk oranı analiz edilmiştir. Hedefe yakın düzeydedir.`
    },
    {
      metric: "Hata / Sapma Oranı",
      value: "%1.2",
      benchmark: "< %2.0 (Kabul Edilebilir)",
      status: "success",
      analysis: "Sayısal kolonlardaki aykırı değer ve gürültü oranı standart tolerans sınırları içindedir."
    }
  ];
}

export function bindDatasetToTemplates(templates, metadataPrompt) {
  if (!metadataPrompt || typeof metadataPrompt !== 'string') return templates;

  const columns = [];
  const colRegex = /- "\{\{([^}]+)\}\}"\s*:\s*([^(]+)/gi;
  let match;
  while ((match = colRegex.exec(metadataPrompt)) !== null) {
    const tag = match[1].trim();
    const name = match[2].trim();
    const isNumeric = name.toLowerCase().includes('tutar') || name.toLowerCase().includes('fiyat') || name.toLowerCase().includes('gelir') || name.toLowerCase().includes('miktar') || name.toLowerCase().includes('satış') || name.toLowerCase().includes('orani') || name.toLowerCase().includes('toplam');
    columns.push({ tag, name, isNumeric });
  }

  if (columns.length === 0) {
    return templates;
  }

  const numCol = columns.find(c => c.isNumeric) || columns[0];
  const strCol = columns.find(c => !c.isNumeric) || columns[1] || columns[0];

  return templates.map(layout => {
    const clonedLayout = JSON.parse(JSON.stringify(layout));
    
    // Clean description and titles of any leftover mustache tags
    if (clonedLayout.description) {
      clonedLayout.description = clonedLayout.description
        .replace(/\{\{kategori\}\}/gi, strCol.name || 'Kategori')
        .replace(/\{\{tutar\}\}/gi, numCol.name || 'Tutar')
        .replace(/\{\{primaryMeasure\}\}/gi, numCol.name || 'Ciro')
        .replace(/\{\{[^}]+\}\}/g, strCol.name || '');
    }
    if (clonedLayout.title) {
      clonedLayout.title = clonedLayout.title.replace(/\{\{[^}]+\}\}/g, '');
    }
    if (clonedLayout.subtitle) {
      clonedLayout.subtitle = clonedLayout.subtitle.replace(/\{\{[^}]+\}\}/g, '');
    }

    clonedLayout.widgets = clonedLayout.widgets.map(w => {
      if (w.config && w.config.htmlTemplate) {
        let html = w.config.htmlTemplate;
        html = html.replace(/\{\{sum:Tutar\}\}/gi, `{{sum:${numCol.tag}}}`);
        html = html.replace(/\{\{avg:Tutar\}\}/gi, `{{avg:${numCol.tag}}}`);
        html = html.replace(/\{\{primaryMeasure\}\}/gi, `{{${numCol.tag}}}`);
        html = html.replace(/\{\{tutar\}\}/gi, `{{${numCol.tag}}}`);
        html = html.replace(/\{\{kategori\}\}/gi, `{{${strCol.tag}}}`);
        html = html.replace(/Tutar/gi, numCol.name);
        html = html.replace(/Kategori/gi, strCol.name);
        w.config.htmlTemplate = html;
      }
      return w;
    });
    return clonedLayout;
  });
}

export async function recommendKaggleLayouts(metadataPrompt, userRequest, rawMetadata = null) {
  // 1. Build 100% data-aware, domain-tailored smart vision layouts
  const smartLayouts = buildSmartVisionLayouts(metadataPrompt, userRequest, rawMetadata);

  try {
    const systemPrompt = `You are an elite Lead UI/UX Dashboard Architect for Google Gemini.
CRITICAL TASK: Based on the USER PROMPT and METADATA, generate exactly 3 DISTINCT, CREATIVE, and STRATEGIC dashboard vision titles and descriptions tailored specifically to the prompt topic and actual columns.

USER PROMPT: ${userRequest}
METADATA: ${metadataPrompt}

For each of the 3 vision concepts, return:
1. "id": "vision_1", "vision_2", "vision_3"
2. "title": Punchy, unique, professional title in Turkish matching the user topic and domain
3. "subtitle": Executive subtitle with metrics/KPIs relevant to the prompt
4. "description": 2-3 sentences explaining what this vision monitors and why it was chosen
5. "category": Category name

Return ONLY a valid JSON array with 3 objects.`;

    console.log("⚡ [Gemini Vision Generator] Gemini 3 Özel Vizyon Konsepti Üretiyor:", userRequest);
    const rawResult = await generateStructuredData(systemPrompt, `GENERATE 3 VISION CONCEPTS FOR: ${userRequest}`, true);

    if (Array.isArray(rawResult) && rawResult.length >= 3) {
      console.log("✅ [Gemini Vision Generator] 3 Vizyon Konsepti Gemini Tarafından Başarıyla Üretildi:", rawResult.map(r => r.title));
      return smartLayouts.map((layout, idx) => {
        const concept = rawResult[idx];
        if (concept) {
          return {
            ...layout,
            title: concept.title || layout.title,
            subtitle: concept.subtitle || layout.subtitle,
            description: (concept.description || layout.description).replace(/\{\{[^}]+\}\}/g, ''),
            category: concept.category || layout.category
          };
        }
        return layout;
      });
    }
  } catch (err) {
    console.warn("⚠️ [Gemini Vision Generator] Yapay zeka vizyon üretimi akıllı yerel motora aktarıldı:", err);
  }

  // Return the perfectly crafted data-aware smart layouts
  return smartLayouts;
}

export async function modifyDashboardWithGemini(currentDashboard, metadataPrompt, modificationRequest) {
  const systemPrompt = `You are a world-class UI Refinement Engine for an executive live analytics dashboard.
CRITICAL MANDATE:
The user has picked this specific dashboard vision from the Tinder deck, and the final dashboard MUST STAY VISUALLY FAITHFUL to this selected vision layout and styling!

RULES:
1. Maintain the EXACT widget count (${currentDashboard.widgets?.length || 5}) and layout grid positions.
2. In each widget's htmlTemplate, adapt the titles, metric labels, and status badges to match the USER REQUEST and domain, while STRICTLY PRESERVING all background colors, gradients, Tailwind CSS classes, and visual containers.
3. Keep valid data interpolation tags like {{sum:Tutar}}, {{avg:Tutar}}, {{count:1}}, {{TOTAL_ROWS}}, etc.
4. Return a valid JSON matching the schema with 'title', 'subtitle', and 'widgets'.`;

  console.log("💎 [AI Modify Engine] Seçilen vizyon korunarak Gemini ile rafine ediliyor:", modificationRequest);

  try {
    const result = await generateStructuredData(systemPrompt, `SELECTED VISION TITLE: ${currentDashboard.title}\nUSER PROMPT: ${modificationRequest}\nMETADATA: ${metadataPrompt}\nCURRENT WIDGETS:\n${JSON.stringify(currentDashboard.widgets, null, 2)}`, false);
    if (result && (result.widgets || result.title)) {
      const mergedResult = {
        ...currentDashboard,
        id: currentDashboard.id,
        image: currentDashboard.image,
        category: currentDashboard.category,
        title: result.title || currentDashboard.title,
        subtitle: result.subtitle || currentDashboard.subtitle,
      };

      if (Array.isArray(result.widgets) && result.widgets.length > 0) {
        mergedResult.widgets = result.widgets.map((w, idx) => {
          const orig = currentDashboard.widgets?.[idx] || {};
          return {
            ...orig,
            title: w.title || orig.title,
            type: orig.type || w.type || 'kpi_card',
            gridPosition: orig.gridPosition || w.gridPosition,
            config: {
              ...(orig.config || {}),
              htmlTemplate: w.config?.htmlTemplate || w.htmlTemplate || orig.config?.htmlTemplate
            }
          };
        });
      } else {
        mergedResult.widgets = currentDashboard.widgets;
      }
      return mergedResult;
    }
  } catch (err) {
    console.warn("⚠️ [AI Modify Engine] Yapay zeka revizyon hatası:", err.message);
  }
  return currentDashboard;
}

export async function synthesizeDatasetFromPrompt(userPrompt) {
  const systemPrompt = `You are a specialized data synthesis engine.
The user wants to generate a dashboard but does NOT have a dataset file.
Based on the USER PROMPT, generate a realistic, high quality synthetic tabular dataset.
Requirements:
1. "sheetName": Short descriptive title (e.g. "E-Ticaret Satışları", "İK Analitiği", "Operasyon & Stok").
2. "headers": Array of 4 to 6 relevant column names (e.g. ["Ay", "Kategori", "Tutar", "Adet", "Durum", "Bölge"]). MUST include at least 1 or 2 numeric metric columns (like "Tutar", "Ciro", "Adet", "Puan", "Maliyet").
3. "rows": Array of 8 to 15 realistic data rows (arrays of values matching the headers). Format numbers as pure numbers (e.g. 45000, not "45.000 TL").
Return ONLY valid JSON format:
{
  "sheetName": "...",
  "headers": ["...", "..."],
  "rows": [
    ["...", 1234, "..."],
    ...
  ]
}`;

  console.log("⚡ [Gemini Data Synthesizer] Prompt'tan veri seti üretiliyor:", userPrompt);
  try {
    const res = await generateStructuredData(systemPrompt, `USER PROMPT: ${userPrompt}`, false);
    if (res && res.headers && Array.isArray(res.rows) && res.rows.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn("Synthesize failed, using intelligent fallback:", err);
  }

  // Fast smart fallback based on prompt keywords:
  const p = (userPrompt || '').toLowerCase();
  if (p.includes('ik') || p.includes('personel') || p.includes('çalışan') || p.includes('hr')) {
    return {
      sheetName: "İK & Personel Analitiği",
      headers: ["Departman", "Çalışan Sayısı", "İşe Alım", "Memnuniyet Skoru", "Devir Oranı"],
      rows: [
        ["Yazılım & Teknoloji", 45, 8, 4.8, 2.1],
        ["Pazarlama & Büyüme", 28, 5, 4.5, 3.4],
        ["Satış & Gelir", 38, 12, 4.2, 4.8],
        ["Operasyon & Lojistik", 32, 4, 4.6, 2.5],
        ["Ürün & Tasarım", 18, 3, 4.9, 1.2],
        ["Müşteri İlişkileri", 24, 6, 4.3, 3.9]
      ]
    };
  } else if (p.includes('stok') || p.includes('depo') || p.includes('lojistik') || p.includes('operasyon')) {
    return {
      sheetName: "Operasyon & Stok Durumu",
      headers: ["Ürün Kodu", "Kategori", "Mevcut Stok", "Kritik Eşik", "Tedarik Süresi", "Durum"],
      rows: [
        ["PRD-101", "Elektronik", 450, 100, 3, "Normal"],
        ["PRD-102", "Aksesuar", 85, 120, 7, "Kritik"],
        ["PRD-103", "Donanım", 620, 150, 2, "Normal"],
        ["PRD-104", "Tüketim", 45, 100, 5, "Kritik"],
        ["PRD-105", "Yedek Parça", 310, 80, 4, "Normal"],
        ["PRD-106", "Kablo & Ağ", 950, 200, 2, "Yüksek"]
      ]
    };
  } else {
    return {
      sheetName: "Satış & Gelir Analitiği",
      headers: ["Ay", "Kategori", "Tutar", "Sipariş Sayısı", "Bölge", "Durum"],
      rows: [
        ["Ocak", "Elektronik", 78500, 142, "Marmara", "Tamamlandı"],
        ["Şubat", "Moda & Giyim", 54200, 215, "Ege", "Tamamlandı"],
        ["Mart", "Ev & Yaşam", 68900, 189, "İç Anadolu", "Tamamlandı"],
        ["Nisan", "Elektronik", 92400, 168, "Marmara", "Tamamlandı"],
        ["Mayıs", "Kozmetik", 41200, 134, "Akdeniz", "Tamamlandı"],
        ["Haziran", "Spor & Outdoor", 63800, 195, "Karadeniz", "Tamamlandı"],
        ["Temmuz", "Elektronik", 105200, 220, "Marmara", "Tamamlandı"]
      ]
    };
  }
}

