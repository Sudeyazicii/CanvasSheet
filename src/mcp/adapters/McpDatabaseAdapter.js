export class McpDatabaseAdapter {
  constructor(dbType) {
    this.dbType = dbType;
    this.data = [];
    this.subscribers = [];
    this.intervalId = null;
    this.init(dbType);
  }

  async init(dbType) {
    this.ready = new Promise(async (resolve) => {
      const isUrl = dbType && (dbType.includes('.') || dbType.includes('/') || dbType.includes('http'));
      
      if (isUrl) {
        try {
          console.log(`🌐 [MCP] Fetching real data from ${dbType}...`);
          const res = await fetch(dbType);
          if (!res.ok) throw new Error(`HTTP Hata: ${res.status}`);
          const json = await res.json();
          
          if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
            const headers = Object.keys(json[0]);
            const rows = json.map(obj => headers.map(h => obj[h]));
            this.data = [headers, ...rows];
            console.log(`✅ [MCP] ${this.data.length - 1} satır veri başarıyla yüklendi.`);
          } else if (Array.isArray(json)) {
            this.data = json;
          }
        } catch (err) {
          console.warn('⚠️ [MCP] Veri kaynağı URL hatası, varsayılan Kaggle verisetine geçiliyor:', err.message);
          this.loadDefaultDataset();
        }
      } else {
        this.loadDefaultDataset();
      }
      this.notifySubscribers();
      resolve();
    });
    return this.ready;
  }

  loadDefaultDataset() {
    const headers = ["Kategori", "Tutar", "Bölge", "Tarih", "Durum"];
    const rows = [
      ["Elektronik & Teknoloji", "12500", "Marmara", "2026-08-01", "Tamamlandı"],
      ["Yazılım Lisansları", "48000", "Ege", "2026-08-05", "Tamamlandı"],
      ["Donanım & Sunucu", "23400", "İç Anadolu", "2026-08-10", "İşlemde"],
      ["Lojistik Hizmetler", "15600", "Akdeniz", "2026-08-15", "Tamamlandı"],
      ["Pazarlama & Medya", "31200", "Marmara", "2026-08-20", "Tamamlandı"],
      ["Kurumsal Danışmanlık", "18900", "Karadeniz", "2026-08-22", "İşlemde"]
    ];
    this.data = [headers, ...rows];
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
      dbType: this.dbType || 'kaggle',
      rowCount: this.data.length > 0 ? this.data.length - 1 : 0,
      columnCount: this.data.length > 0 ? this.data[0].length : 0,
      headers: this.data.length > 0 ? this.data[0] : [],
      isLive: false
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
