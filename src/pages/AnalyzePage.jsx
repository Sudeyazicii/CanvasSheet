import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../auth/useGoogleAuth.js';
import { analyzeSheet, formatMetadataForPrompt } from '../services/sheetAnalyzer.js';
import { generateDashboardConfig } from '../services/geminiService.js';
import DynamicDashboard from '../engine/DynamicDashboard.jsx';
import { Sparkles, Loader2, CheckCircle, ArrowRight, RefreshCw, Layout, Layers, Columns, Info, AlertCircle } from 'lucide-react';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { user, accessToken } = useGoogleAuth();

  const [spreadsheetId] = useState(localStorage.getItem('connectedSheetId') || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [uiConfig, setUiConfig] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle'); // idle, analyzing, analyzed, generating, complete
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/connect');
    }
  }, [user, accessToken, navigate]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setStep('analyzing');
    try {
      const sheetMetadata = await analyzeSheet(spreadsheetId, accessToken);
      setMetadata(sheetMetadata);
      setStep('analyzed');
    } catch (err) {
      setError(`Analiz hatası: ${err.message}`);
      setStep('error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateDashboard = async () => {
    if (!metadata) return;
    setGenerating(true);
    setError(null);
    setStep('generating');
    try {
      const metadataPrompt = formatMetadataForPrompt(metadata);
      const config = await generateDashboardConfig(metadataPrompt, prompt);
      setUiConfig(config);
      setStep('complete');
    } catch (err) {
      setError(`AI Hatası: ${err.message}`);
      setStep('error');
    } finally {
      setGenerating(false);
    }
  };

  if (!user) return null;

  if (step === 'complete' && uiConfig) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={24} className="text-blue-500" />
                <h2 className="text-3xl font-black tracking-tight">Tasarım Hazır!</h2>
              </div>
              <p className="text-slate-400 font-medium italic">AI verilerinizi analiz etti ve size özel bu dashboard'u oluşturdu.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('analyzed')} 
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
              >
                <RefreshCw size={16} /> Yeniden Tasarla
              </button>
            </div>
          </div>
          <DynamicDashboard uiConfig={uiConfig} spreadsheetId={spreadsheetId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[540px] relative z-10 animate-fadeIn">
        <div className="glass-panel rounded-[40px] p-12 shadow-2xl text-center border-slate-700/30">
          
          {/* Header */}
          <div className="mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-6">
              <Sparkles size={32} color="white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Dashboard Studio</h1>
            <p className="text-slate-400 font-medium">Sheet'lerinizi saniyeler içinde analiz edin</p>
          </div>

          {step === 'idle' && (
            <div className="space-y-8">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-left">
                <Info size={18} className="text-blue-500 shrink-0" />
                <span className="text-xs text-slate-400 font-medium truncate">Bağlı Sheet: {spreadsheetId}</span>
              </div>
              <button 
                onClick={handleAnalyze} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-lg"
              >
                Analizi Başlat <ArrowRight size={22} />
              </button>
              <button 
                onClick={() => navigate('/connect')} 
                className="text-slate-500 hover:text-white transition-colors text-sm font-bold underline underline-offset-4"
              >
                Farklı bir sheet bağla
              </button>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-10 animate-pulse">
              <Loader2 size={64} className="animate-spin text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Veriler İşleniyor</h2>
              <p className="text-slate-400">Metadata ve sütun yapıları inceleniyor...</p>
            </div>
          )}

          {step === 'analyzed' && metadata && (
            <div className="text-left space-y-8 animate-fadeIn">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle size={20} />
                <span className="font-bold text-sm">Analiz Tamamlandı!</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <InfoCard label="Sayfa" value={metadata.sheetName} icon={<Layout size={14} />} />
                <InfoCard label="Satır" value={metadata.rowCount} icon={<Layers size={14} />} />
                <InfoCard label="Sütun" value={metadata.headers.length} icon={<Columns size={14} />} />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400 ml-1">Dashboard için bir talimat verin</label>
                <textarea
                  className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-600"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Örn: 'Satış verilerini içeren bir dashboard yap, en çok satan 3 ürünü göster...'"
                />
              </div>

              <button
                onClick={handleGenerateDashboard}
                disabled={generating}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 text-lg"
              >
                {generating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                {generating ? 'Tasarım Yapılıyor...' : 'AI Dashboard Oluştur'}
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-10">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles size={40} className="text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Tasarlıyor</h2>
              <p className="text-slate-400">Verileriniz görselleştiriliyor...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-6">
              <AlertCircle size={64} className="text-rose-500 mx-auto mb-6" />
              <p className="text-rose-400 text-sm mb-8 font-medium">{error}</p>
              <button 
                onClick={() => setStep('idle')} 
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-1 group hover:border-blue-500/20 transition-colors">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-white font-black text-lg truncate w-full">{value}</div>
    </div>
  );
}
