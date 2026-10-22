import { readSheet, getSheetMetadata } from '../../services/sheetsService';

export class GoogleSheetAdapter {
  constructor(accessToken, spreadsheetId) {
    this.accessToken = accessToken;
    this.spreadsheetId = spreadsheetId;
    this.dataCache = {};
  }

  async getMetadata() {
    const meta = await getSheetMetadata(this.accessToken, this.spreadsheetId);
    return {
      sourceType: 'google_sheets',
      sheetName: meta.sheets[0].properties.title,
      headers: [], // Will be populated after analysis
      rowCount: 0,
      columnCount: 0,
      rawMetadata: meta
    };
  }

  async fetchData(range) {
    if (this.dataCache[range]) return this.dataCache[range];
    const data = await readSheet(this.accessToken, this.spreadsheetId, range);
    this.dataCache[range] = data;
    return data;
  }

  subscribe(range, callback) {
    if (!this.accessToken || !this.spreadsheetId) {
      return () => {};
    }

    let previousDataJson = JSON.stringify(this.dataCache[range] || null);

    const intervalId = setInterval(async () => {
      try {
        const data = await readSheet(this.accessToken, this.spreadsheetId, range);
        if (!data || !Array.isArray(data)) return;
        
        const newDataJson = JSON.stringify(data);
        if (newDataJson !== previousDataJson) {
          previousDataJson = newDataJson;
          this.dataCache[range] = data;
          callback(data);
        }
      } catch (err) {
        // Silently catch network or auth errors during background polling
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }
}
