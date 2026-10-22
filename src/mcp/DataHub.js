import { GoogleSheetAdapter } from './adapters/GoogleSheetAdapter';
import { FileAdapter } from './adapters/FileAdapter';
import { TextAdapter } from './adapters/TextAdapter';
import { McpDatabaseAdapter } from './adapters/McpDatabaseAdapter';

class DataHub {
  constructor() {
    this.adapter = null;
    this.activeSource = null;
  }

  async connect(type, payload) {
    console.log(`🔌 [MCP DataHub] Connecting to ${type}...`);
    if (type === 'google_sheets') {
      const { accessToken, spreadsheetId } = payload;
      this.adapter = new GoogleSheetAdapter(accessToken, spreadsheetId);
    } else if (type === 'file') {
      this.adapter = new FileAdapter(payload.file);
    } else if (type === 'text') {
      this.adapter = new TextAdapter(payload.text);
    } else if (type === 'mcp') {
      this.adapter = new McpDatabaseAdapter(payload.dbType);
    }
    
    this.activeSource = type;
    sessionStorage.setItem('mcp_active_source', type);
    const meta = await this.adapter.getMetadata();
    
    // Persist session info
    if (type === 'google_sheets') {
      sessionStorage.setItem('canvassheet_spreadsheetId', payload.spreadsheetId);
    } else if (type === 'mcp') {
      sessionStorage.setItem('mcp_db_type', payload.dbType);
    } else if (type === 'text') {
      sessionStorage.setItem('mcp_raw_text', payload.text);
    }
    
    return meta;
  }

  async getMetadata() {
    if (!this.adapter) await this.rehydrate();
    if (!this.adapter) throw new Error('DataHub not connected.');
    return this.adapter.getMetadata();
  }

  async fetchData(range) {
    if (!this.adapter) await this.rehydrate();
    if (!this.adapter) throw new Error('DataHub not connected.');
    return this.adapter.fetchData(range);
  }

  subscribe(range, callback) {
    if (this.adapter && this.adapter.subscribe) {
      return this.adapter.subscribe(range, callback);
    }
    return () => {}; // No-op if not supported
  }

  async rehydrate() {
    const source = sessionStorage.getItem('mcp_active_source');
    if (source === 'google_sheets') {
      const spreadsheetId = sessionStorage.getItem('canvassheet_spreadsheetId');
      const accessToken = sessionStorage.getItem('google_access_token');
      if (spreadsheetId && accessToken) {
        this.adapter = new GoogleSheetAdapter(accessToken, spreadsheetId);
        this.activeSource = source;
      }
    } else if (source === 'mcp') {
      const dbType = sessionStorage.getItem('mcp_db_type') || 'kaggle';
      this.adapter = new McpDatabaseAdapter(dbType);
      this.activeSource = source;
    } else if (source === 'text') {
      const text = sessionStorage.getItem('mcp_raw_text');
      if (text) {
        this.adapter = new TextAdapter(text);
        this.activeSource = source;
      }
    }

    if (!this.adapter) {
      console.log('🔄 [DataHub] Otomatik varsayılan veriseti (Kaggle MCP) bağlanıyor...');
      this.adapter = new McpDatabaseAdapter('kaggle');
      this.activeSource = 'mcp';
    }
  }
}

export default new DataHub();
