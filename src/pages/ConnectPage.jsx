import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Link2, ArrowRight, LayoutGrid, Shield, Zap, Database, AlertCircle, CheckCircle2, LogOut, Sparkles } from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';
import { extractSpreadsheetId, extractGid, getSheetMetadata, readSheet } from '../services/sheetsService';
import DataHub from '../mcp/DataHub';
import { FileUp, Type, Server, Trash2, Files, GitBranch } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function ConnectPage() {
  const { user, accessToken, isAuthenticated, isLoading, error: authError, login, logout } = useGoogleAuth();
  const [sheetUrl, setSheetUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet', 'file', 'text', 'mcp'
  const [selectedDb, setSelectedDb] = useState(null);
  const [mcpUrl, setMcpUrl] = useState('');
  const [urlError, setUrlError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [connectedSheets, setConnectedSheets] = useState([]);
  const [isConnectingSheet, setIsConnectingSheet] = useState(false);
  const navigate = useNavigate();

  const [ghSettings, setGhSettings] = useState({
    token: localStorage.getItem('cs_gh_token') || '',
    owner: localStorage.getItem('cs_gh_owner') || '',
    repo: localStorage.getItem('cs_gh_repo') || '',
    path: localStorage.getItem('cs_gh_path') || 'data.csv'
  });

  const handleAddSheet = async () => {
    setUrlError(null);
    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setUrlError('Geçersiz Google Sheet URL\'si. Lütfen doğru bir URL yapıştırın.');
      return;
    }

    if (connectedSheets.some(s => s.id === spreadsheetId)) {
      setUrlError('Bu tablo zaten listeye eklenmiş.');
      return;
    }

    setIsConnectingSheet(true);
    try {
      const meta = await getSheetMetadata(accessToken, spreadsheetId);
      const gid = extractGid(sheetUrl);
      let sheetTab = meta.sheets[0]?.properties?.title;
      if (gid) {
        const matchingTab = meta.sheets.find(s => String(s.properties.sheetId) === String(gid));
        if (matchingTab) sheetTab = matchingTab.properties.title;
      }

      const newSheet = {
        id: spreadsheetId,
        gid: gid,
        url: sheetUrl,
        title: meta.properties.title || 'İsimsiz Tablo',
        sheetTab: sheetTab
      };

      setConnectedSheets(prev => [...prev, newSheet]);
      setSheetUrl('');
    } catch (err) {
      setUrlError(`Tablo bağlantı hatası: ${err.message}`);
    } finally {
      setIsConnectingSheet(false);
    }
  };

  const handleConnectSheets = async () => {
    if (connectedSheets.length === 0) return;
    
    setIsAnalyzing(true);
    setUrlError(null);
    try {
      if (connectedSheets.length === 1) {
        const sh = connectedSheets[0];
        await DataHub.connect('google_sheets', { accessToken, spreadsheetId: sh.id });
        if (sh.gid) sessionStorage.setItem('canvassheet_gid', sh.gid);
        sessionStorage.setItem('canvassheet_url', sh.url);
        localStorage.setItem('connectedSheetId', sh.id);
        navigate('/analyze');
      } else {
        const datasets = [];
        for (let sh of connectedSheets) {
          const tabName = sh.sheetTab || 'Sheet1';
          const data = await readSheet(accessToken, sh.id, tabName);
          if (data.length === 0) {
            throw new Error(`"${sh.title}" tablosunun "${tabName}" sayfası boş veya okunamadı.`);
          }
          datasets.push(data);
        }

        const mergedRows = mergeMultipleDatasets(datasets);
        if (mergedRows.length === 0) {
          throw new Error("Birleştirilen veri seti boş.");
        }

        const csvString = Papa.unparse(mergedRows);
        const mergedFile = new File([csvString], "birlesik_google_sheets.csv", { type: "text/csv" });

        await DataHub.connect('file', { file: mergedFile });
        navigate('/analyze');
      }
    } catch (err) {
      setUrlError(`Tablolar yüklenirken veya birleştirilirken hata oluştu: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const parseFileToRows = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          let rows = [];
          if (file.name.endsWith('.csv')) {
            const parsed = Papa.parse(evt.target.result, { header: false, skipEmptyLines: true });
            rows = parsed.data;
          } else if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(evt.target.result);
            if (Array.isArray(parsed)) {
              if (parsed.length > 0) {
                const headers = Object.keys(parsed[0]);
                rows = [headers, ...parsed.map(item => headers.map(h => item[h] ?? ''))];
              }
            } else {
              throw new Error("JSON dizisi olmalıdır.");
            }
          } else {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          }
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };

      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const mergeMultipleDatasets = (allDatasets) => {
    if (allDatasets.length === 0) return [];
    let baseData = allDatasets[0];
    
    for (let d = 1; d < allDatasets.length; d++) {
      const currentData = allDatasets[d];
      if (currentData.length === 0) continue;
      
      const headersA = baseData[0] || [];
      const headersB = currentData[0] || [];
      
      const colsBToAppend = headersB.map((h, i) => i).filter(i => i !== 0);
      const headersBToAppend = colsBToAppend.map(i => headersB[i] || `Col_${i}`);
      
      const mergedHeaders = [...headersA, ...headersBToAppend];
      const rowsA = baseData.slice(1);
      const rowsB = currentData.slice(1);
      
      const mapB = new Map();
      rowsB.forEach(row => {
        const key = row[0]?.toString().trim().toLowerCase();
        if (key !== undefined) {
          mapB.set(key, row);
        }
      });
      
      const mergedRows = rowsA.map(rowA => {
        const keyA = rowA[0]?.toString().trim().toLowerCase();
        const matchingRowB = mapB.get(keyA);
        
        const rowBValues = colsBToAppend.map(idx => {
          if (matchingRowB && matchingRowB[idx] !== undefined) {
            return matchingRowB[idx];
          }
          return '';
        });
        
        return [...rowA, ...rowBValues];
      });
      
      baseData = [mergedHeaders, ...mergedRows];
    }
    
    return baseData;
  };

  const handleConnectFiles = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsAnalyzing(true);
    setUrlError(null);
    try {
      let finalFile = null;
      
      if (uploadedFiles.length === 1) {
        finalFile = uploadedFiles[0];
      } else {
        const datasets = [];
        for (let file of uploadedFiles) {
          const rows = await parseFileToRows(file);
          datasets.push(rows);
        }
        
        const mergedRows = mergeMultipleDatasets(datasets);
        if (mergedRows.length === 0) {
          throw new Error("Birleştirilen veri seti boş.");
        }
        
        const csvString = Papa.unparse(mergedRows);
        finalFile = new File([csvString], "birlesik_veri_seti.csv", { type: "text/csv" });
      }
      
      await DataHub.connect('file', { file: finalFile });
      navigate('/analyze');
    } catch (err) {
      setUrlError(`Dosya yükleme veya birleştirme hatası: ${err.message}`);
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

  const handleGithubConnect = async () => {
    setIsAnalyzing(true);
    setUrlError(null);
    try {
      const { token, owner, repo, path } = ghSettings;
      if (!owner || !repo || !path) {
        throw new Error("Lütfen tüm alanları doldurun.");
      }
      
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const headers = {
        Accept: 'application/vnd.github.v3+json'
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`GitHub veri çekme hatası: HTTP ${res.status}`);
      }
      const data = await res.json();
      const decodedContent = decodeURIComponent(escape(atob(data.content)));
      
      const parsed = Papa.parse(decodedContent, { header: false, skipEmptyLines: true });
      if (parsed.data.length === 0) {
        throw new Error("GitHub'daki dosya boş veya okunamadı.");
      }
      
      const connectedFile = new File([decodedContent], path.split('/').pop(), { type: 'text/csv' });
      await DataHub.connect('file', { file: connectedFile });
      
      if (token) localStorage.setItem('cs_gh_token', token);
      localStorage.setItem('cs_gh_owner', owner);
      localStorage.setItem('cs_gh_repo', repo);
      localStorage.setItem('cs_gh_path', path);
      
      navigate('/analyze');
    } catch (err) {
      setUrlError(`GitHub bağlantı hatası: ${err.message}`);
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
              {isAuthenticated ? 'Oturum Açıldı' : 'Veya Google ile Giriş Yapın'}
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
              <p className="text-slate-400 text-sm text-center mb-6">Kendi Google Sheet tablolarınızı bağlamak için giriş yapabilirsiniz.</p>
              <button
                onClick={login}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                {isLoading ? 'Yükleniyor...' : 'Google ile Giriş Yap'}
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('guest_mode', 'true');
                  sessionStorage.setItem('mcp_active_source', 'text');
                  navigate('/analyze');
                }}
                className="w-full py-3 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 font-semibold rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-2 text-xs"
              >
                Giriş Yapmadan Misafir Olarak Keşfet
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Source Selection (Disabled until auth) */}
        <div className={`glass-panel rounded-[32px] p-8 shadow-2xl transition-all duration-700 ${!isAuthenticated ? 'grayscale opacity-20 pointer-events-none scale-[0.98]' : 'animate-fadeIn'}`}>
           {/* Tabs */}
          <div className="flex gap-1.5 mb-8 bg-slate-900/50 p-1 rounded-2xl border border-white/5 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'sheet' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Sheet
              </button>
              <button 
                onClick={() => setActiveTab('mcp')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'mcp' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                MCP DB
              </button>
              <button 
                onClick={() => setActiveTab('github')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'github' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                GitHub
              </button>
              <button 
                onClick={() => setActiveTab('file')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Dosya
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Metin
              </button>
            </div>

            <div className="animate-fadeIn">
              {activeTab === 'sheet' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400">2</div>
                    <h3 className="font-bold text-white">Google Sheet Ekle</h3>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        placeholder="Google Sheet URL'sini yapıştırın..."
                        value={sheetUrl}
                        onChange={(e) => { setSheetUrl(e.target.value); setUrlError(null); }}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <button
                      onClick={handleAddSheet}
                      disabled={!sheetUrl.trim() || isConnectingSheet}
                      className={`px-6 font-bold rounded-2xl transition-all flex items-center justify-center text-xs shrink-0 ${
                        sheetUrl.trim()
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isConnectingSheet ? 'Ekleniyor...' : 'Ekle'}
                    </button>
                  </div>

                  {connectedSheets.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eklenen Tablolar ({connectedSheets.length})</span>
                        <button 
                          onClick={() => setConnectedSheets([])} 
                          className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider animate-fadeIn"
                        >
                          Tümünü Temizle
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {connectedSheets.map((sh, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-white/5 rounded-2xl animate-fadeIn">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 shrink-0">
                                <span className="text-[9px] font-bold text-emerald-400 uppercase">Sheet</span>
                              </div>
                              <div className="truncate text-left">
                                <p className="text-white text-xs font-bold truncate">{sh.title}</p>
                                <p className="text-[9px] text-slate-500 font-medium">Sayfa: {sh.sheetTab || 'Varsayılan'}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setConnectedSheets(prev => prev.filter((_, i) => i !== idx))}
                              className="w-8 h-8 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {connectedSheets.length > 1 && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[10px] text-slate-400 text-left leading-relaxed font-medium animate-fadeIn">
                          💡 <strong className="text-emerald-400">Not:</strong> Birden fazla Google Sheet yüklendiğinde, sistem ilk tabloyu ana veri kümesi olarak alıp diğerlerini **ilk sütundaki ortak anahtarlara** göre birleştirecektir.
                        </div>
                      )}

                      <button
                        onClick={handleConnectSheets}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-sm animate-fadeIn"
                      >
                        {isAnalyzing ? "Analiz Ediliyor..." : connectedSheets.length > 1 ? "Tabloları Eşleştir & Birleştirerek Devam Et" : "Seçilen Sheet ile Devam Et"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'file' && (
                <div className="space-y-6">
                  <label className="group cursor-pointer block">
                    <div className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-[32px] p-8 transition-all bg-slate-900/30 group-hover:bg-blue-500/5">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <FileUp size={24} className="text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <p className="text-white text-sm font-bold mb-1">Dosya Ekle</p>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Excel, CSV veya JSON (Çoklu Seçilebilir)</p>
                    </div>
                    <input type="file" multiple accept=".xlsx,.xls,.csv,.json" onChange={handleFileSelect} className="hidden" />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yüklenecek Dosyalar ({uploadedFiles.length})</span>
                        <button 
                          onClick={() => setUploadedFiles([])} 
                          className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider animate-fadeIn"
                        >
                          Tümünü Temizle
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-white/5 rounded-2xl animate-fadeIn">
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10 shrink-0">
                                <span className="text-[9px] font-bold text-blue-400 uppercase">{file.name.split('.').pop()}</span>
                              </div>
                              <div className="truncate text-left">
                                <p className="text-white text-xs font-bold truncate">{file.name}</p>
                                <p className="text-[9px] text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="w-8 h-8 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {uploadedFiles.length > 1 && (
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[10px] text-slate-400 text-left leading-relaxed font-medium animate-fadeIn">
                          💡 <strong className="text-blue-400">Not:</strong> Birden fazla dosya yüklendiğinde, sistem ilk dosyayı ana veri kümesi olarak alıp diğer dosyaları **ilk sütunlarındaki ortak anahtarlara** göre otomatik olarak birleştirecektir.
                        </div>
                      )}

                      <button
                        onClick={handleConnectFiles}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-sm"
                      >
                        {isAnalyzing ? "İşleniyor..." : uploadedFiles.length > 1 ? "Dosyaları Eşleştir & Birleştirerek Devam Et" : "Seçilen Dosya ile Devam Et"}
                      </button>
                    </div>
                  )}
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

              {activeTab === 'github' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <GitBranch size={20} className="text-blue-500 animate-pulse" />
                    <h3 className="font-bold text-white text-sm">GitHub Store Bağlantısı</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] uppercase tracking-wider font-black text-slate-400 ml-1">Personal Access Token (PAT)</label>
                      <input
                        type="password"
                        placeholder="ghp_... (Opsiyonel / Gizli repolar için)"
                        value={ghSettings.token}
                        onChange={(e) => setGhSettings({...ghSettings, token: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-black text-slate-400 ml-1">Repo Sahibi</label>
                        <input
                          type="text"
                          placeholder="Örn: github_user"
                          value={ghSettings.owner}
                          onChange={(e) => setGhSettings({...ghSettings, owner: e.target.value})}
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-black text-slate-400 ml-1">Repo Adı</label>
                        <input
                          type="text"
                          placeholder="Örn: dataset-repo"
                          value={ghSettings.repo}
                          onChange={(e) => setGhSettings({...ghSettings, repo: e.target.value})}
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[9px] uppercase tracking-wider font-black text-slate-400 ml-1">Dosya Yolu (CSV)</label>
                      <input
                        type="text"
                        placeholder="Örn: data/dataset.csv"
                        value={ghSettings.path}
                        onChange={(e) => setGhSettings({...ghSettings, path: e.target.value})}
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-3.5 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                        required
                      />
                    </div>

                    <button
                      onClick={handleGithubConnect}
                      disabled={!ghSettings.owner || !ghSettings.repo || !ghSettings.path || isAnalyzing}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-sm animate-fadeIn"
                    >
                      {isAnalyzing ? "Veri Çekiliyor..." : "GitHub Verisini Yükle"}
                    </button>
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
