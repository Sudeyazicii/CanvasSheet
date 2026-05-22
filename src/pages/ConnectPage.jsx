import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Link2, ArrowRight, LayoutGrid, Shield, Zap, Database, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';
import { extractSpreadsheetId, extractGid } from '../services/sheetsService';
import DataHub from '../mcp/DataHub';
import { FileUp, Type, Server } from 'lucide-react';

export default function ConnectPage() {
  const { user, accessToken, isAuthenticated, isLoading, error: authError, login, logout } = useGoogleAuth();
  const [sheetUrl, setSheetUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet', 'file', 'text', 'mcp'
  const [selectedDb, setSelectedDb] = useState(null);
  const [mcpUrl, setMcpUrl] = useState('');
  const [urlError, setUrlError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    setUrlError(null);
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setUrlError('Geçersiz Google Sheet URL\'si. Lütfen doğru bir URL yapıştırın.');
      return;
    }

    setIsAnalyzing(true);
    try {
      await DataHub.connect('google_sheets', { accessToken, spreadsheetId });
      const gid = extractGid(sheetUrl);
      if (gid) sessionStorage.setItem('canvassheet_gid', gid);
      sessionStorage.setItem('canvassheet_url', sheetUrl);
      localStorage.setItem('connectedSheetId', spreadsheetId);
      navigate('/analyze');
    } catch (err) {
      setUrlError(`Bağlantı hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      await DataHub.connect('file', { file });
      navigate('/analyze');
    } catch (err) {
      setUrlError(`Dosya okuma hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextConnect = async () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    try {
      await DataHub.connect('text', { text: rawText });
      navigate('/analyze');
    } catch (err) {
      setUrlError(`Metin işleme hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMcpConnect = async (dbType) => {
    setIsAnalyzing(true);
    try {
      await DataHub.connect('mcp', { dbType });
      navigate('/analyze');
    } catch (err) {
      setUrlError(`MCP bağlantı hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0F172A]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[480px] relative z-10 animate-fadeIn">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <LayoutGrid size={40} color="white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">CanvasSheet</h1>
          <p className="text-slate-400 font-medium">Google Sheet'inizi canlı dashboard'a dönüştürün</p>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-[32px] p-8 shadow-2xl">
        {/* Step 1: Global Login */}
        <div className="glass-panel rounded-[32px] p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${isAuthenticated ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
              {isAuthenticated ? <CheckCircle2 size={16} /> : '1'}
            </div>
            <h3 className={`font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-white'}`}>
              {isAuthenticated ? 'Oturum Açıldı' : 'Google ile Giriş Yapın'}
            </h3>
          </div>

          {isAuthenticated ? (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 group">
              <img src={user?.picture} alt="" className="w-12 h-12 rounded-full border-2 border-slate-700" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{user?.name}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm text-center mb-6">Sistemi kullanabilmek için önce Google hesabınızla giriş yapmalısınız.</p>
              <button
                onClick={login}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                {isLoading ? 'Yükleniyor...' : 'Google ile Giriş Yap'}
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Source Selection (Disabled until auth) */}
        <div className={`glass-panel rounded-[32px] p-8 shadow-2xl transition-all duration-700 ${!isAuthenticated ? 'grayscale opacity-20 pointer-events-none scale-[0.98]' : 'animate-fadeIn'}`}>
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setActiveTab('sheet')}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Sheet
              </button>
              <button 
                onClick={() => setActiveTab('mcp')}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'mcp' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                MCP DB
              </button>
              <button 
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Dosya
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Metin
              </button>
            </div>

            <div className="animate-fadeIn">
              {activeTab === 'sheet' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400">2</div>
                    <h3 className="font-bold text-white">Google Sheet URL'nizi Yapıştırın</h3>
                  </div>

                  <div className="relative mb-6">
                    <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetUrl}
                      onChange={(e) => { setSheetUrl(e.target.value); setUrlError(null); }}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={!sheetUrl.trim() || isAnalyzing}
                    className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                      sheetUrl.trim() 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAnalyzing ? "Analiz Ediliyor..." : "Bağlan & Devam Et"}
                  </button>
                </div>
              )}

              {activeTab === 'file' && (
                <div className="text-center">
                  <label className="group cursor-pointer block">
                    <div className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-[32px] p-10 transition-all bg-slate-900/30 group-hover:bg-blue-500/5">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <FileUp size={32} className="text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <p className="text-white font-bold mb-1">Dosya Seçin</p>
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Excel, CSV veya JSON</p>
                    </div>
                    <input type="file" accept=".xlsx,.xls,.csv,.json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      placeholder="MongoDB çıktısı veya JSON yapıştırın...&#10;Örn: {id:1, isim:'Ali'}"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="w-full h-40 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 resize-none font-mono"
                    />
                  </div>
                  <button
                    onClick={handleTextConnect}
                    disabled={!rawText.trim() || isAnalyzing}
                    className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                      rawText.trim() 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAnalyzing ? "İşleniyor..." : "Veriyi Analiz Et"}
                  </button>
                </div>
              )}

              {activeTab === 'mcp' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Server size={20} className="text-blue-500" />
                    <h3 className="font-bold text-white text-sm">MCP Database Bağlantısı</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['MongoDB', 'PostgreSQL', 'BigQuery', 'Redis', 'Snowflake', 'MySQL'].map(db => (
                      <button
                        key={db}
                        onClick={() => setSelectedDb(db)}
                        className={`p-3 rounded-xl border transition-all text-center ${selectedDb === db ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-500'}`}
                      >
                        <p className="font-bold text-[10px]">{db}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold uppercase">URL</div>
                      <input
                        type="text"
                        placeholder="mongodb+srv://cluster0.example.com/..."
                        value={mcpUrl}
                        onChange={(e) => setMcpUrl(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    
                    <button
                      onClick={() => handleMcpConnect(mcpUrl)}
                      disabled={!selectedDb || !mcpUrl.trim() || isAnalyzing}
                      className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${
                        selectedDb && mcpUrl.trim() 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isAnalyzing ? "Bağlanıyor..." : "MCP Kaynağına Bağlan"}
                    </button>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] text-blue-300 font-medium leading-relaxed italic">
                    * MCP (Model Context Protocol) üzerinden veritabanınıza canlı bağlantı kurulur. Bağlantı sağlandıktan sonra verileriniz otomatik olarak analiz edilecektir.
                  </div>
                </div>
              )}

              {urlError && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-6 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 animate-fadeIn">
                  <AlertCircle size={14} />
                  {urlError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-center gap-8 mt-10 opacity-40">
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Shield size={14} /> OAuth2 Güvenlik
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Zap size={14} /> Realtime Sync
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white font-bold uppercase tracking-wider">
            <Database size={14} /> Sıfır Kurulum
          </div>
        </div>
      </div>
    </div>
  );
}
