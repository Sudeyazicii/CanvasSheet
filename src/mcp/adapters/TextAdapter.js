export class TextAdapter {
  constructor(text) {
    this.text = text;
    this.data = null;
  }

  async init() {
    try {
      // Try parsing as JSON first
      let parsed = JSON.parse(this.text);
      this.data = this.normalize(parsed);
    } catch (e) {
      // If not valid JSON, try parsing as loosely formatted text (id:1, name:"Ali")
      this.data = this.parseLooseText(this.text);
    }
  }

  normalize(json) {
    if (Array.isArray(json)) {
      if (typeof json[0] === 'object') {
        const headers = Object.keys(json[0]);
        return [headers, ...json.map(obj => headers.map(h => obj[h]))];
      }
      return json;
    }
    if (typeof json === 'object') {
      const headers = Object.keys(json);
      return [headers, headers.map(h => json[h])];
    }
    return [];
  }

  parseLooseText(text) {
    // Simple implementation for loose key:value pairs per line
    const lines = text.split('\n').filter(l => l.trim());
    const items = lines.map(line => {
      const obj = {};
      const pairs = line.match(/(\w+):([^,]+)/g);
      if (pairs) {
        pairs.forEach(p => {
          const [k, v] = p.split(':');
          obj[k.trim()] = v.trim().replace(/^["']|["']$/g, '');
        });
      }
      return obj;
    }).filter(o => Object.keys(o).length > 0);

    if (items.length > 0) {
      const headers = Array.from(new Set(items.flatMap(i => Object.keys(i))));
      return [headers, ...items.map(item => headers.map(h => item[h] || ''))];
    }
    return [];
  }

  async getMetadata() {
    if (!this.data) await this.init();
    return {
      sourceType: 'text',
      rowCount: this.data.length - 1,
      columnCount: this.data[0]?.length || 0,
      headers: this.data[0] || []
    };
  }

  async fetchData() {
    if (!this.data) await this.init();
    return this.data;
  }
}
