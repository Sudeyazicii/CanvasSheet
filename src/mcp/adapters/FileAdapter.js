import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export class FileAdapter {
  constructor(file) {
    this.file = file;
    this.data = null;
    this.metadata = null;
  }

  async init() {
    const extension = this.file.name.split('.').pop().toLowerCase();
    
    if (extension === 'csv') {
      this.data = await this.parseCsv();
    } else if (extension === 'json') {
      this.data = await this.parseJson();
    } else if (['xlsx', 'xls'].includes(extension)) {
      this.data = await this.parseExcel();
    } else {
      throw new Error('Desteklenmeyen dosya formatı.');
    }

    this.metadata = {
      sourceType: 'file',
      fileName: this.file.name,
      rowCount: this.data.length - 1,
      columnCount: this.data[0]?.length || 0,
      headers: this.data[0] || []
    };
  }

  parseCsv() {
    return new Promise((resolve, reject) => {
      Papa.parse(this.file, {
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
        header: false
      });
    });
  }

  async parseJson() {
    const text = await this.file.text();
    const json = JSON.parse(text);
    return this.normalizeJson(json);
  }

  async parseExcel() {
    const buffer = await this.file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }

  normalizeJson(json) {
    // If it's an array of objects, convert to 2D array
    if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
      const headers = Object.keys(json[0]);
      const rows = json.map(obj => headers.map(h => obj[h]));
      return [headers, ...rows];
    }
    // If it's already a 2D array
    if (Array.isArray(json) && Array.isArray(json[0])) {
      return json;
    }
    return [];
  }

  async getMetadata() {
    if (!this.data) await this.init();
    return this.metadata;
  }

  async fetchData(range) {
    if (!this.data) await this.init();
    // For files, we usually return the whole data as we don't have server-side ranges
    return this.data;
  }
}
