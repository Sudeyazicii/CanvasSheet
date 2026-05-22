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
      // Daha esnek URL kontrolü
      if (dbType && (dbType.includes('.') || dbType.includes('/') || dbType.includes('http'))) {
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
          } else {
            this.data = json;
          }
        } catch (err) {
          console.error('❌ [MCP] Veri çekme hatası:', err.message);
          this.data = [["Hata"], [`Veri çekilemedi: ${err.message}`]];
        }
      } else {
        this.data = [["Hata"], ["Geçersiz veri kaynağı URL'si"]];
      }
      this.notifySubscribers();
      resolve();
    });
    return this.ready;
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
      dbType: this.dbType,
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
    // If only one arg is provided, it's the callback
    const cb = typeof range === 'function' ? range : callback;
    if (typeof cb === 'function') {
      this.subscribers.push(cb);
    }
    
    // Simulate live updates every 5 seconds by re-fetching
    if (!this.intervalId) {
      console.log(`📡 [MCP ${this.dbType}] Live sync started...`);
      this.intervalId = setInterval(async () => {
        if (this.dbType && (this.dbType.includes('.') || this.dbType.includes('/') || this.dbType.includes('http'))) {
          try {
            // Önbelleği (cache) kırmak için timestamp ekliyoruz
            const separator = this.dbType.includes('?') ? '&' : '?';
            const fetchUrl = `${this.dbType}${separator}t=${Date.now()}`;
            
            const res = await fetch(fetchUrl);
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
              const headers = Object.keys(json[0]);
              const rows = json.map(obj => headers.map(h => obj[h]));
              this.data = [headers, ...rows];
              this.notifySubscribers();
            }
          } catch (e) {
            console.error('Live sync fetch error:', e);
          }
        }
      }, 5000);
    }
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
      if (this.subscribers.length === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        console.log(`🛑 [MCP ${this.dbType}] Live sync stopped.`);
      }
    };
  }
}
