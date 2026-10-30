// ==========================================
// 🔌 REA (Reverse Engineer Anything) & MCP Database Adapter
// ==========================================

export class McpDatabaseAdapter {
  constructor(dbType) {
    this.dbType = dbType;
    this.tableName = 'sales';
    this.data = [];
    this.subscribers = [];
    this.intervalId = null;
    this.init(dbType);
  }

  async init(dbType) {
    this.ready = new Promise(async (resolve) => {
      let targetUrl = null;

      if (typeof dbType === 'string') {
        if (dbType.startsWith('http://') || dbType.startsWith('https://')) {
          targetUrl = dbType;
          if (targetUrl.includes('table=')) {
            const match = targetUrl.match(/table=([^&]+)/);
            if (match) this.tableName = match[1];
          }
        } else if (['sales', 'customers', 'missions'].includes(dbType.toLowerCase())) {
          this.tableName = dbType.toLowerCase();
          targetUrl = `http://localhost:3001/api/mcp/sqlite/data?table=${this.tableName}`;
        } else if (dbType.toLowerCase().includes('sqlite')) {
          this.tableName = 'sales';
          targetUrl = `http://localhost:3001/api/mcp/sqlite/data?table=sales`;
        }
      }

      if (!targetUrl) { this.tableName = 'sales'; targetUrl = 'http://localhost:3001/api/mcp/sqlite/data?table=sales'; }
      if (targetUrl) {
        try {
          console.log(`🌐 [REA-MCP] ${targetUrl} adresinden veritabanı verisi çekiliyor...`);
          const res = await fetch(targetUrl);
          if (!res.ok) throw new Error(`HTTP Hata: ${res.status}`);
          const json = await res.json();

          // Array of objects -> 2D matrix
          if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object' && !Array.isArray(json[0])) {
            const headers = Object.keys(json[0]);
            const rows = json.map(obj => headers.map(h => obj[h]));
            this.data = [headers, ...rows];
            console.log(`✅ [REA-MCP] ${this.data.length - 1} satır canlı SQLite verisi başarıyla yüklendi.`);
          } else if (Array.isArray(json) && Array.isArray(json[0])) {
            this.data = json;
            console.log(`✅ [REA-MCP] ${this.data.length - 1} satır matris verisi başarıyla yüklendi.`);
          } else if (json.matrix && Array.isArray(json.matrix)) {
            this.data = json.matrix;
          }
        } catch (err) {
          console.warn('⚠️ [REA-MCP] Yerel MCP sunucusuna (http://localhost:3001) bağlanılamadı:', err.message);
          console.info('💡 İpucu: Gerçek SQLite sunucusunu başlatmak için "npm run mcp" komutunu çalıştırabilirsiniz.');
          this.loadFallbackDataset(this.tableName);
        }
      } else {
        this.loadFallbackDataset(this.tableName);
      }

      this.notifySubscribers();
      resolve();
    });

    return this.ready;
  }

  loadFallbackDataset(table = 'sales') {
    if (table === 'customers') {
      const headers = ["Sirket_Adi", "Sektor", "Yillik_Ciro", "Calisan_Sayisi", "Sehir", "Abonelik_Paketi", "Memnuniyet_Skoru"];
      const rows = [
        ["NovaTech Bilişim A.Ş.", "Yazılım & Teknoloji", "18500000", "85", "İstanbul", "Enterprise", "4.9"],
        ["Ege Lojistik Grubu", "Taşımacılık & Tedarik", "32000000", "240", "İzmir", "Pro", "4.6"],
        ["Anadolu Finans Danışmanlık", "Bankacılık & Finans", "12400000", "45", "Ankara", "Enterprise", "4.8"],
        ["Akdeniz Otelcilik A.Ş.", "Turizm & Hizmet", "45000000", "520", "Antalya", "Pro", "4.3"],
        ["Trend Perakende Mağazacılık", "E-Ticaret & Perakende", "28000000", "190", "Bursa", "Enterprise", "4.7"],
        ["Kuzey Rüzgarı Enerji", "Yenilenebilir Enerji", "52000000", "310", "Trabzon", "Enterprise", "4.5"]
      ];
      this.data = [headers, ...rows];
    } else if (table === 'missions') {
      const headers = ["Gorev_ID", "Uzay_Araci", "Hedef_Gezegen", "Yakit_Durumu", "Murettebat", "Durum"];
      const rows = [
        ["O-1", "Orion-X", "Mars", "%92", "5 Kişi", "İniş Yapıldı"],
        ["V-9", "Voyager-3", "Satürn", "%45", "Robotik", "Halkada"],
        ["S-X", "Starship Alpha", "Ay", "%78", "12 Kişi", "Yörüngede"],
        ["A-11", "Apollo-24", "Jüpiter", "%60", "3 Kişi", "Yolda"],
        ["N-5", "Nova-Probe", "Güneş", "%88", "Robotik", "Veri Topluyor"]
      ];
      this.data = [headers, ...rows];
    } else {
      // Default: Rich REA Sales Dataset
      const headers = ["Urun_Adi", "Kategori", "Satis_Tutari", "Adet", "Bolge", "Musteri_Tipi", "Tarih", "Durum"];
      const rows = [
        ["MacBook Pro M3 Max", "Donanım & Laptop", "89900", "14", "Marmara", "Kurumsal", "2026-03-01", "Teslim Edildi"],
        ["Dell XPS 15 OLED", "Donanım & Laptop", "64500", "9", "İç Anadolu", "KOBİ", "2026-03-02", "Teslim Edildi"],
        ["Ergonomik Yönetici Koltuğu", "Ofis & Mobilya", "14200", "28", "Ege", "Bireysel", "2026-03-03", "Teslim Edildi"],
        ["AirPods Pro 2", "Aksesuar & Ses", "8400", "75", "Marmara", "Bireysel", "2026-03-04", "Teslim Edildi"],
        ["LG UltraFine 4K 32\"", "Görüntü & Monitör", "26800", "22", "Akdeniz", "Kurumsal", "2026-03-05", "Kargoda"],
        ["Logitech MX Master 3S", "Aksesuar", "3900", "54", "Marmara", "KOBİ", "2026-03-06", "Teslim Edildi"],
        ["Keychron Q1 Pro Klavye", "Aksesuar", "6200", "36", "Ege", "Bireysel", "2026-03-07", "Teslim Edildi"],
        ["Herman Miller Aeron", "Ofis & Mobilya", "42000", "8", "Marmara", "Kurumsal", "2026-03-08", "Teslim Edildi"],
        ["Sony WH-1000XM5", "Aksesuar & Ses", "12900", "31", "Karadeniz", "Bireysel", "2026-03-09", "Teslim Edildi"],
        ["iPad Pro 13\" M4", "Tablet & Mobil", "49900", "18", "İç Anadolu", "KOBİ", "2026-03-10", "Kargoda"],
        ["Synology NAS 4-Bay", "Sunucu & Depolama", "34500", "11", "Marmara", "Kurumsal", "2026-03-11", "Teslim Edildi"],
        ["Asus ROG Zephyrus G16", "Donanım & Laptop", "78900", "12", "Marmara", "Kurumsal", "2026-03-13", "Teslim Edildi"]
      ];
      this.data = [headers, ...rows];
    }
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        if (typeof cb === 'function') cb(this.data);
      } catch (e) {
        console.error('Subscriber notification error:', e);
      }
    });
  }

  async getMetadata() {
    if (this.ready) await this.ready;
    return {
      sourceType: 'mcp',
      dbType: this.dbType || 'SQLite (REA)',
      tableName: this.tableName,
      sheetName: `SQLite: ${this.tableName}`,
      rowCount: this.data.length > 0 ? this.data.length - 1 : 0,
      columnCount: this.data.length > 0 ? this.data[0].length : 0,
      headers: this.data.length > 0 ? this.data[0] : [],
      isLive: true
    };
  }

  async fetchData() {
    if (this.ready) await this.ready;
    return this.data;
  }

  subscribe(range, callback) {
    const cb = typeof range === 'function' ? range : callback;
    if (typeof cb === 'function') {
      this.subscribers.push(cb);
      if (this.data && this.data.length > 0) {
        cb(this.data);
      }
    }

    return () => {
      this.subscribers = this.subscribers.filter(subscriber => subscriber !== cb);
    };
  }
}
