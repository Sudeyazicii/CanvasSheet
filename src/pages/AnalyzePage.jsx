import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '../auth/useGoogleAuth.js';
import { analyzeSheet, formatMetadataForPrompt } from '../services/sheetAnalyzer.js';
import { refineDashboardWithGemini, generateDashboardConfig, generateInsightsWithGemini, generateSwotWithGemini, generateBenchmarkWithGemini, parseRuleWithGemini, recommendKaggleLayouts, modifyDashboardWithGemini, synthesizeDatasetFromPrompt, bindDatasetToTemplates } from '../services/geminiService.js';
import { canvasVisionTemplates } from '../data/canvasTemplates.js';
import { commitToGitHub } from '../services/githubService.js';
import DynamicDashboard from '../engine/DynamicDashboard.jsx';
import Brain from '../services/Brain.js';
import DataHub from '../mcp/DataHub';
import NoktaAvatar from '../components/CanvasAvatar.jsx';
import { Canvas } from '@react-three/fiber';
import Voice from '../services/Voice.js';
import { Sparkles, Loader2, CheckCircle, ArrowRight, RefreshCw, Layout, Layers, Columns, Info, AlertCircle, Send, MessageSquare, UserCheck, Download, Sliders, GitBranch, ThumbsDown, Smile, Heart, Mic, MicOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const expertDashboardConfig = {
  title: "Uzman Tarafından Optimize Edilmiş Satış Dashboard",
  subtitle: "HITL (Human-in-the-Loop) köprüsü üzerinden uzman data analist tarafından hazırlanan premium rapor şeması.",
  widgets: [
    {
      title: "Consolidated Total Revenue",
      type: "dynamic_canvas",
      gridPosition: {
        colSpan: 12,
        rowSpan: 4
      },
      config: {
        htmlTemplate: `
          <div class="h-full bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-xl border border-white/15 p-8 rounded-[32px] flex items-center justify-between shadow-2xl">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] font-black text-blue-300">Özel Sektörel Analiz (HITL)</span>
              <h2 class="text-3xl font-black text-white mt-2">Maksimize Edilmiş Veri Görselleştirme</h2>
              <p class="text-xs text-slate-400 mt-1">İnsan analisti tarafından veri dağılımına göre düzeltilmiş KPI metriği.</p>
            </div>
            <div class="text-right">
              <span class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{{primaryMeasure}}</span>
              <div class="text-xs text-emerald-400 font-bold mt-2">↑ %18.4 (Sektör Standardının Üzerinde)</div>
            </div>
          </div>
        `
      }
    },
    {
      title: "Veri Dağılım Analizi",
      type: "dynamic_canvas",
      gridPosition: {
        colSpan: 6,
        rowSpan: 6
      },
      config: {
        htmlTemplate: `
          <div class="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[24px]">
            <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Grup Bazlı Analiz</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span class="text-slate-400 font-semibold">Toplam İşlem Adedi:</span>
                <span class="text-white font-bold">{{rowCount}} Satır</span>
              </div>
              <div class="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span class="text-slate-400 font-semibold">Ana Ölçüm Kolonu:</span>
                <span class="text-blue-400 font-bold">{{primaryMeasure}}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-semibold">Aktif Veri Kaynağı:</span>
                <span class="text-indigo-400 font-bold">{{sheetName}}</span>
              </div>
            </div>
          </div>
        `
      }
    },
    {
      title: "Tavsiye Edilen Eylemler",
      type: "dynamic_canvas",
      gridPosition: {
        colSpan: 6,
        rowSpan: 6
      },
      config: {
        htmlTemplate: `
          <div class="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[24px]">
            <h3 class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Uzman Strateji Önerisi</h3>
            <ul class="space-y-3 text-xs text-slate-300 leading-relaxed font-semibold">
              <li class="flex items-start gap-2">
                <span class="text-emerald-400">✔</span>
                <span>Yüksek hacimli satış kategorilerinde stok devir hızını %12 artırın.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-400">✔</span>
                <span>Anomali tespit edilen işlem satırları için veri doğrulama kurallarını genişletin.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-400">✔</span>
                <span>Jüri özel sunum modunda tüm veri filtreleme gecikmelerini sıfırlayın.</span>
              </li>
            </ul>
          </div>
        `
      }
    }
  ]
};

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { user, accessToken } = useGoogleAuth();

  const [spreadsheetId] = useState(localStorage.getItem('connectedSheetId') || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [uiConfigs, setUiConfigs] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [expertRequested, setExpertRequested] = useState(false);
  const [expertStep, setExpertStep] = useState('none');
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle');
  const [prompt, setPrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [swot, setSwot] = useState(null);
  const [loadingSwot, setLoadingSwot] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('insights');
  const [benchmark, setBenchmark] = useState([]);
  const [loadingBenchmark, setLoadingBenchmark] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeRule, setActiveRule] = useState(null);
  const [ruleInput, setRuleInput] = useState('');
  const [parsingRule, setParsingRule] = useState(false);
  const [refinedConfigs, setRefinedConfigs] = useState({});

  // Tinder Deck States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | 'up' | null
  const [rejectedIds, setRejectedIds] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // Exclude rejected cards permanently from deck rotations
  const activeConfigs = useMemo(() => {
    return uiConfigs.filter((c, i) => !rejectedIds.includes(c.id || c.title || `card-${i}`));
  }, [uiConfigs, rejectedIds]);

  // Mascot assistant States
  const [mascotChat, setMascotChat] = useState("Selam! Ben NOVA. Verilerini en üst düzey tasarım standartlarında analiz ettim ve senin için 3 farklı PREMİUM konsept hazırladım. Hangisi senin vizyonuna daha yakın?");
  const [refinementInput, setRefinementInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubSettings, setGithubSettings] = useState({
    token: localStorage.getItem('cs_gh_token') || '',
    owner: localStorage.getItem('cs_gh_owner') || '',
    repo: localStorage.getItem('cs_gh_repo') || '',
    path: localStorage.getItem('cs_gh_path') || 'data.csv',
    message: 'Canvas Sheet ile veri güncellemesi'
  });
  const [committingGh, setCommittingGh] = useState(false);
  const [autoSyncGh, setAutoSyncGh] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [webrtcConnected, setWebrtcConnected] = useState(false);
  const [expertMessages, setExpertMessages] = useState([]);

  useEffect(() => {
    const activeSource = sessionStorage.getItem('mcp_active_source');
    if (activeSource === 'google_sheets' && (!user || !accessToken)) {
      navigate('/connect');
    }
  }, [user, accessToken, navigate]);

  // 🚀 Zero-Data / Prompt-First Otomatik Başlatıcı
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const promptParam = params.get('prompt') || sessionStorage.getItem('zero_data_prompt');

    if (mode === 'zero_data' || promptParam) {
      const activePrompt = promptParam || "Modern Yönetici ve Satış Analitiği Paneli";
      setPrompt(activePrompt);
      
      // 1. ANINDA 3 ŞIK ŞABLONU GÖSTER (Kullanıcı hiç beklemez, hemen kartları görür)
      const pLower = activePrompt.toLowerCase();
      let matched = [...canvasVisionTemplates];
      if (pLower.includes('ik') || pLower.includes('hr') || pLower.includes('çalışan') || pLower.includes('personel')) {
        matched = [canvasVisionTemplates[1], canvasVisionTemplates[0], canvasVisionTemplates[4]];
      } else if (pLower.includes('stok') || pLower.includes('depo') || pLower.includes('lojistik') || pLower.includes('operasyon')) {
        matched = [canvasVisionTemplates[2], canvasVisionTemplates[0], canvasVisionTemplates[4]];
      } else if (pLower.includes('performans') || pLower.includes('görev') || pLower.includes('iş yükü')) {
        matched = [canvasVisionTemplates[4], canvasVisionTemplates[0], canvasVisionTemplates[3]];
      } else {
        matched = [canvasVisionTemplates[0], canvasVisionTemplates[3], canvasVisionTemplates[4]];
      }
      
      setUiConfigs(matched);
      setSelectedIndex(0);
      setCurrentCardIndex(0);
      setRejectedIds([]);
      setIsLocked(false);
      setStep('analyzed'); // Kullanıcı önce Prompt sayfasını görür
      setMascotChat(`Hedef analizinizi girin, ardından 'Vizyon Konseptlerini İncele' butonuna tıklayarak Tinder kart destesine geçebilirsiniz.`);

      // 2. ARKA PLANDA HIZLA GEMINI ÇALIŞIYOR (Veri seti yoksa sentezliyor ve bağlıyor)
      synthesizeDatasetFromPrompt(activePrompt).then(async (synth) => {
        try {
          const fullRows = [synth.headers, ...synth.rows];
          setRawData(fullRows);
          
          await DataHub.connect('text', { text: JSON.stringify(synth.rows.map(r => {
            const obj = {};
            synth.headers.forEach((h, i) => { obj[h] = r[i]; });
            return obj;
          })) });

          const sheetMetadata = await analyzeSheet(fullRows, synth.sheetName);
          setMetadata(sheetMetadata);

          const metadataPrompt = formatMetadataForPrompt(sheetMetadata);

          generateInsightsWithGemini(metadataPrompt).then(res => setInsights(res)).catch(() => {});
          generateSwotWithGemini(metadataPrompt).then(res => setSwot(res)).catch(() => {});
          generateBenchmarkWithGemini(metadataPrompt).then(res => setBenchmark(res)).catch(() => {});

          console.log("⚡ [Gemini Background Synthesizer] Veri seti ve şema arka planda hazırlandı:", synth.sheetName);
        } catch (err) {
          console.warn("Background synthesize error:", err);
        }
      });
    }
  }, []);

  // TTS Speech Trigger
  useEffect(() => {
    if (!isMuted && mascotChat) {
      Voice.speak(mascotChat);
    }
    return () => {
      Voice.stop();
    };
  }, [mascotChat, isMuted]);

  // Sync GitHub settings from localStorage when modal opens
  useEffect(() => {
    if (showGithubModal) {
      setGithubSettings({
        token: localStorage.getItem('cs_gh_token') || '',
        owner: localStorage.getItem('cs_gh_owner') || '',
        repo: localStorage.getItem('cs_gh_repo') || '',
        path: localStorage.getItem('cs_gh_path') || 'data.csv',
        message: 'Canvas Sheet ile veri güncellemesi'
      });
    }
  }, [showGithubModal]);

  const handleDelegateExpert = () => {
    setExpertRequested(true);
    setExpertStep('connecting');
    setMascotChat("Harika fikir! Senin verilerini ve tasarımını en iyi analiz edebilecek uzman tasarımcımızı hemen bağlıyorum. Birkaç saniye bekle lütfen...");
    setTimeout(() => setExpertStep('reviewing'), 1000);
    setTimeout(() => {
      setExpertStep('ready');
      setMascotChat("Uzmanımız şu an verilerini inceliyor! Talep #2311-071 numarasıyla sıraya alındın. Uzman görüşü hazır olduğunda sana buradan bildireceğim.");
    }, 2500);
  };

  const handleExportJSON = () => {
    const currentConfig = uiConfigs[selectedIndex];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nokta_dashboard_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setMascotChat("Harika! Tasarım verileri JSON olarak indirildi. Artık bu dosyayı ana Nokta Canvas projesine kolayca entegre edebilirsin.");
  };

  const handleExportCSV = () => {
    if (!rawData) {
      setMascotChat("İndirilecek veri bulunamadı. Lütfen önce verinizi analiz edin.");
      return;
    }
    try {
      const csv = Papa.unparse(rawData);
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${metadata?.sheetName || 'data'}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMascotChat("Harika! Verilerin başarıyla CSV olarak indirildi.");
    } catch (err) {
      console.error(err);
      setMascotChat("CSV dışa aktarma sırasında bir hata oluştu.");
    }
  };

  const handleExportExcel = () => {
    if (!rawData) {
      setMascotChat("İndirilecek veri bulunamadı. Lütfen önce verinizi analiz edin.");
      return;
    }
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(rawData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, metadata?.sheetName || "Sheet1");
      XLSX.writeFile(workbook, `${metadata?.sheetName || 'data'}_export.xlsx`);
      setMascotChat("Mükemmel! Verilerin başarıyla Excel (.xlsx) formatında indirildi.");
    } catch (err) {
      console.error(err);
      setMascotChat("Excel dışa aktarma sırasında bir hata oluştu.");
    }
  };

  const startWebrtcBridge = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setLocalStream(stream);
      setWebrtcConnected(true);
      setMascotChat("WebRTC video köprüsü başarıyla kuruldu. Uzmanımız Ahmet Yılmaz hatta bağlandı!");
      
      setExpertMessages([
        { sender: 'Sistem', text: 'WebRTC video bağlantısı başlatıldı.' },
        { sender: 'Sistem', text: 'Kıdemli Analist Ahmet Yılmaz bağlandı.' }
      ]);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Merhaba, veri setinizdeki kolon yapısını ve reddettiğiniz taslakları inceledim." }]);
      }, 1500);
      
      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Mevcut AI şemasındaki sıkışık 3'lü grid yerine, verilerinize en uygun cam efektli geniş bir Power BI düzeni hazırladım. Ekrana gönderiyorum." }]);
      }, 3500);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "📘 Tasarım Mühendisliği İpucu: AI ile çalışırken promptunuzda her zaman 'Yerleşim Düzeni' (grid), 'Tasarım Dili' (cam efekti, renk) ve 'Vurgulamak istediğiniz kolonları' net belirtin. Bu en stabil çıktıyı sağlar." }]);
      }, 6000);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Bu formüle göre hazırladığım şu promptları aşağıdaki kutudan veya sesli olarak asistanımıza iletebilirsiniz:" }]);
      }, 8500);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "💡 'arka planı tamamen koyu laciverte çevir ve neon mavi kenarlık ekle'" }]);
      }, 10500);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "💡 'kartları cam efektiyle (glassmorphism) güncelle ve gölgelendir'" }]);
      }, 12500);
    } catch (err) {
      console.warn("Kamera erişimi reddedildi veya bulunamadı, WebRTC simülasyonu başlatılıyor.", err);
      setWebrtcConnected(true);
      setMascotChat("Kamera bulunamadı ancak WebRTC ses kanalıyla uzmanımız Ahmet Yılmaz bağlandı!");
      setExpertMessages([
        { sender: 'Sistem', text: 'WebRTC ses bağlantısı başlatıldı.' },
        { sender: 'Sistem', text: 'Kıdemli Analist Ahmet Yılmaz bağlandı.' }
      ]);
      
      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Merhaba, veri setinizi ve şablonlarınızı inceledim. Geniş ve modern bir Power BI düzeni hazırladım." }]);
      }, 1500);
      
      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Özel tasarımı şablonunuza gönderdim. Uygulamak için aşağıdaki butona tıklayabilirsiniz." }]);
      }, 3500);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "📘 Prompt İpucu: En stabil AI arayüzü çıktısı için promptunuza 'Yerleşim Düzeni' (grid), 'Tasarım Dili' (cam efekti, renk) ve 'Kritik veri kolonları' ekleyin." }]);
      }, 6000);

      setTimeout(() => {
        setExpertMessages(prev => [...prev, { sender: 'Ahmet Yılmaz', text: "Örn: 'arka planı yeşil yap' veya 'arka planı mavi yap'" }]);
      }, 8500);
    }
  };

  const applyExpertLayout = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setWebrtcConnected(false);
    setExpertMessages([]);
    setRejectedIds([]);
    setCurrentCardIndex(0);
    
    const expertConfigCopy = JSON.parse(JSON.stringify(expertDashboardConfig));
    expertConfigCopy.widgets.forEach(w => {
      if (w.config) {
        w.config.primaryMeasure = metadata?.primaryMeasure || 'Sales';
        w.config.sheetName = metadata?.sheetName || 'Veri Kaynağı';
      }
    });

    setUiConfigs([expertConfigCopy]);
    setActiveDashboard(expertConfigCopy);
    setSelectedIndex(0);
    setIsLocked(true);
    setMascotChat("İnsan uzman (HITL) tarafından tasarlanan premium arayüz başarıyla uygulandı! Verileriniz canlı olarak bağlandı.");
  };

  const cleanupWebrtc = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setWebrtcConnected(false);
    setExpertMessages([]);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setStep('analyzing');
    try {
      const fetchedData = await DataHub.fetchData('A1:Z500');
      setRawData(fetchedData);
      const meta = await DataHub.getMetadata();
      const sheetMetadata = await analyzeSheet(fetchedData, meta.sheetName || meta.fileName || 'Data Source');
      setMetadata(sheetMetadata);

      const metadataPrompt = formatMetadataForPrompt(sheetMetadata);

      // AI Insights generation
      setLoadingInsights(true);
      generateInsightsWithGemini(metadataPrompt)
        .then(res => setInsights(res))
        .catch(err => console.warn("Insights generation error:", err))
        .finally(() => setLoadingInsights(false));

      // AI SWOT generation
      setLoadingSwot(true);
      generateSwotWithGemini(metadataPrompt)
        .then(res => setSwot(res))
        .catch(err => console.warn("SWOT generation error:", err))
        .finally(() => setLoadingSwot(false));

      setStep('analyzed');
      setMascotChat("Veri setinizi başarıyla analiz ettim! Lütfen dashboard hedefinizi veya promptunuzu girin, ardından 'Vizyon Konseptlerini İncele' butonuna tıklayarak Tinder kart destesine geçebilirsiniz.");
    } catch (err) {
      setError(`Analiz hatası: ${err.message}`);
      setStep('error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleProceedToVisionDeck = async () => {
    setAnalyzing(true);
    setMascotChat("Gemini promptunuza özel 3 farklı vizyon konsepti tasarlıyor, lütfen bekleyin...");
    try {
      let currentMetadata = metadata;
      if (!currentMetadata) {
        const synth = await synthesizeDatasetFromPrompt(prompt || "Genel Satış ve Gelir Analitiği");
        const fullRows = [synth.headers, ...synth.rows];
        setRawData(fullRows);
        await DataHub.connect('text', { text: JSON.stringify(synth.rows.map(r => {
          const obj = {};
          synth.headers.forEach((h, i) => { obj[h] = r[i]; });
          return obj;
        })) });
        currentMetadata = await analyzeSheet(fullRows, synth.sheetName);
        setMetadata(currentMetadata);
      }

      const metadataPrompt = formatMetadataForPrompt(currentMetadata);
      const userPrompt = prompt || "Verilerime uygun lüks bir dashboard tasarla.";
      
      const configs = await recommendKaggleLayouts(
        metadataPrompt,
        userPrompt,
        currentMetadata
      );
      setUiConfigs(configs);
      setSelectedIndex(0);
      setCurrentCardIndex(0);
      setRejectedIds([]);
      setIsLocked(false);
      setStep('complete');
      setMascotChat(`Promptunuza özel 3 vizyon konsepti Gemini ile oluşturuldu! Kartları Tinder gibi kaydırarak veya aşağıdaki butonlarla seçebilirsiniz.`);
    } catch (err) {
      console.warn("Layout recommendation fallback:", err);
      setUiConfigs(canvasVisionTemplates);
      setSelectedIndex(0);
      setCurrentCardIndex(0);
      setRejectedIds([]);
      setIsLocked(false);
      setStep('complete');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyRule = async (e) => {
    e.preventDefault();
    if (!ruleInput.trim()) return;
    setParsingRule(true);
    try {
      const metadataPrompt = formatMetadataForPrompt(metadata);
      const parsed = await parseRuleWithGemini(ruleInput, metadataPrompt);
      setActiveRule(parsed);
      setMascotChat(`Kuralı başarıyla veri setine uyguladım: "${parsed.targetColumn} ${parsed.operator} ${parsed.value}" koşuluna uyan satırları işaretledim.`);
    } catch (err) {
      console.warn("Failed to parse rule:", err);
      setMascotChat("Kuralı çözümlerken bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setParsingRule(false);
    }
  };

  const handleCommitToGithub = async (e) => {
    e.preventDefault();
    if (!rawData) {
      setMascotChat("Commit edilecek ham veri bulunamadı.");
      return;
    }
    const { token, owner, repo, path, message } = githubSettings;
    if (!token || !owner || !repo || !path) {
      setMascotChat("Lütfen tüm GitHub ayarlarını eksiksiz doldurun.");
      return;
    }

    setCommittingGh(true);
    try {
      const csv = Papa.unparse(rawData);
      await commitToGitHub({ token, owner, repo, path, content: csv, message });
      
      localStorage.setItem('cs_gh_token', token);
      localStorage.setItem('cs_gh_owner', owner);
      localStorage.setItem('cs_gh_repo', repo);
      localStorage.setItem('cs_gh_path', path);

      setMascotChat("Harika! Verileriniz GitHub reposuna başarıyla commit edildi.");
      setShowGithubModal(false);
    } catch (err) {
      console.error(err);
      setMascotChat(`GitHub commit hatası: ${err.message}`);
    } finally {
      setCommittingGh(false);
    }
  };

  const handleSimulateCommitToGithub = (e) => {
    e.preventDefault();
    setCommittingGh(true);
    setMascotChat("GitHub Store bağlantısı kuruluyor, veriler şifreleniyor...");
    setTimeout(() => {
      setMascotChat("GitHub API: Repository yazma izinleri doğrulandı. Değişiklik seti commit ediliyor...");
      setTimeout(() => {
        setMascotChat("Harika! Verileriniz GitHub reposuna (seyyah/sheet-canvas) başarıyla commit edildi (Demo/Simüle Modu).");
        setCommittingGh(false);
        setShowGithubModal(false);
      }, 1500);
    }, 1000);
  };

  const triggerAutoSyncGithub = async (newData) => {
    if (!autoSyncGh || !newData) return;
    const token = localStorage.getItem('cs_gh_token') || githubSettings.token;
    const owner = localStorage.getItem('cs_gh_owner') || githubSettings.owner;
    const repo = localStorage.getItem('cs_gh_repo') || githubSettings.repo;
    const path = localStorage.getItem('cs_gh_path') || githubSettings.path;

    if (!token || !owner || !repo || !path) {
      console.warn("[Auto-Sync] GitHub credentials missing in localStorage.");
      return;
    }

    try {
      const csv = Papa.unparse(newData);
      await commitToGitHub({
        token,
        owner,
        repo,
        path,
        content: csv,
        message: 'Canvas Sheet - Canlı Otomatik Eşitleme Güncellemesi'
      });
      console.log("⚡ [GitHub Store] Verileriniz GitHub deposuyla başarıyla otomatik olarak eşitlendi.");
    } catch (err) {
      console.warn("Auto-sync to GitHub failed:", err);
    }
  };

  const handleGenerateFinalDashboard = async () => {
    if (uiConfigs.length === 0) return;
    setGenerating(true);
    setStep('generating');

    try {
      const selectedLayout = uiConfigs[selectedIndex];
      
      let currentMetadata = metadata;
      if (!currentMetadata) {
        const synth = await synthesizeDatasetFromPrompt(prompt || "Genel Satış ve Gelir Analitiği");
        const fullRows = [synth.headers, ...synth.rows];
        setRawData(fullRows);
        await DataHub.connect('text', { text: JSON.stringify(synth.rows.map(r => {
          const obj = {};
          synth.headers.forEach((h, i) => { obj[h] = r[i]; });
          return obj;
        })) });
        currentMetadata = await analyzeSheet(fullRows, synth.sheetName);
        setMetadata(currentMetadata);
      }

      const metadataPrompt = formatMetadataForPrompt(currentMetadata);
      const userInstruction = prompt || "Verilerime uygun lüks bir dashboard tasarla.";

      console.log("🚀 [Gemini Engine] Seçilen Vizyon ve Prompt Gemini ile Bağlanıyor:", userInstruction);

      const refinedConfig = await modifyDashboardWithGemini(
        selectedLayout,
        metadataPrompt,
        userInstruction
      );

      const finalConfig = refinedConfig || selectedLayout;
      setActiveDashboard(finalConfig);
      setIsLocked(true);
      setStep('complete');
      setMascotChat(`Harika! Promptunuz ("${userInstruction}") ve seçtiğiniz vizyon konsepti Gemini ile işlenerek dashboard en sonda başarıyla oluşturuldu!`);
    } catch (err) {
      console.error("Final generation error:", err);
      const selectedLayout = uiConfigs[selectedIndex];
      setActiveDashboard(selectedLayout);
      setIsLocked(true);
      setStep('complete');
      setMascotChat(`Dashboard vizyon konsepti ile başarıyla yüklendi.`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = async (index) => {
    setSelectedIndex(index);
    setIsLocked(true);

    if (refinedConfigs[index]) {
      console.log(`💎 [Refine Cache] Konsept ${index + 1} için önbellekten yükleniyor...`);
      setActiveDashboard(refinedConfigs[index]);
      return;
    }

    try {
      const selectedLayout = uiConfigs[index];
      
      let currentMetadata = metadata;
      if (!currentMetadata) {
        const synth = await synthesizeDatasetFromPrompt(prompt || "Genel Satış ve Gelir Analitiği");
        const fullRows = [synth.headers, ...synth.rows];
        setRawData(fullRows);
        await DataHub.connect('text', { text: JSON.stringify(synth.rows.map(r => {
          const obj = {};
          synth.headers.forEach((h, i) => { obj[h] = r[i]; });
          return obj;
        })) });
        currentMetadata = await analyzeSheet(fullRows, synth.sheetName);
        setMetadata(currentMetadata);
      }

      const metadataPrompt = formatMetadataForPrompt(currentMetadata);
      
      // Birebir Seçilen Vizyonu Canlı Verilerle Bağla (Gemini tasarımı bozmaz, vizyon 1:1 korunur)
      const fastBoundLayout = bindDatasetToTemplates([selectedLayout], metadataPrompt)[0] || selectedLayout;
      fastBoundLayout.image = selectedLayout.image;
      fastBoundLayout.category = selectedLayout.category;
      fastBoundLayout.id = selectedLayout.id;
      setActiveDashboard(fastBoundLayout);
      setMascotChat(`Harika seçim! Seçtiğiniz "${selectedLayout.title}" vizyonu birebir canlı verilerinizle oluşturuldu. Değişiklik yapmak isterseniz bana söyleyebilirsiniz!`);
      setRefining(false);

    } catch (err) {
      console.error("Dashboard bağlama hatası:", err);
      setActiveDashboard(uiConfigs[index]);
      setRefining(false);
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!refinementInput.trim()) return;

    const instruction = refinementInput;
    setRefinementInput('');
    setRefining(true);

    const lowerInstruction = instruction.toLowerCase();
    const isExpertRequest = 
      lowerInstruction.includes('uzman') || 
      lowerInstruction.includes('ahmet') || 
      lowerInstruction.includes('hitl') || 
      lowerInstruction.includes('insan') ||
      lowerInstruction.includes('tasarımını getir') ||
      lowerInstruction.includes('yaptığı tasarım') ||
      lowerInstruction.includes('yaptığı tasarımı');

    if (isExpertRequest) {
      setTimeout(() => {
        applyExpertLayout();
        setRefining(false);
      }, 800);
      return;
    }

    const currentConfig = activeDashboard || uiConfigs[selectedIndex];

    try {
      const metadataPrompt = formatMetadataForPrompt(metadata);

      const refinedConfig = await modifyDashboardWithGemini(
        currentConfig,
        metadataPrompt,
        instruction
      );

      if (refinedConfig && (refinedConfig.widgets || refinedConfig.title)) {
        setRefinedConfigs(prev => ({
          ...prev,
          [selectedIndex]: refinedConfig
        }));

        setActiveDashboard(refinedConfig);
        setMascotChat(`İşte istediğin güncellemeleri yaptım! ("${instruction}" komutu uygulandı)`);
        return;
      }
      throw new Error("Yapay zeka yanıt vermedi, yerel motor çalıştırılıyor.");
    } catch (err) {
      console.warn("Refinement AI error, executing local refinement engine:", err);
      try {
        const fallbackConfig = JSON.parse(JSON.stringify(currentConfig));
        let modifiedAny = false;

        // Clean user topic string (e.g. "a yap" -> "A Analizi", "satış paneli yap" -> "Satış Paneli")
        let cleanTopic = instruction.trim();
        cleanTopic = cleanTopic.replace(/\b(yap|yapılsın|getir|ekle|olsun|tasarla|değiştir)\b/gi, '').trim();
        if (!cleanTopic) cleanTopic = "Özel Analiz Paneli";

        // Update Dashboard Main Title
        fallbackConfig.title = cleanTopic.toUpperCase() + (cleanTopic.length < 5 ? " ANALİZİ" : "");
        modifiedAny = true;

        if (fallbackConfig.widgets && Array.isArray(fallbackConfig.widgets)) {
          fallbackConfig.widgets = fallbackConfig.widgets.map((w, wIdx) => {
            let html = w.config?.htmlTemplate || w.htmlTemplate || '';
            if (!html) return w;

            // Update Inner Widget Titles / Headers inside HTML
            html = html.replace(/<h4 class='([^']+)'>([^<]+)<\/h4>/gi, `<h4 class='$1'>${cleanTopic} - Kart ${wIdx + 1}</h4>`);
            html = html.replace(/<div class='text-xs font-black text-([^']+) uppercase tracking-widest mb-2'>([^<]+)<\/div>/gi, `<div class='text-xs font-black text-$1 uppercase tracking-widest mb-2'>${cleanTopic} Metriği</div>`);

            // Apply Theme Color changes if specified
            if (lowerInstruction.includes('mavi') || lowerInstruction.includes('blue') || lowerInstruction.includes('lacivert')) {
              html = html.replace(/from-\w+-\d+/g, 'from-blue-600').replace(/to-\w+-\d+/g, 'to-cyan-400').replace(/border-\w+-\d+/g, 'border-blue-500/30').replace(/text-\w+-\d+/g, 'text-blue-400');
            } else if (lowerInstruction.includes('yeşil') || lowerInstruction.includes('green') || lowerInstruction.includes('zümrüt')) {
              html = html.replace(/from-\w+-\d+/g, 'from-emerald-600').replace(/to-\w+-\d+/g, 'to-teal-400').replace(/border-\w+-\d+/g, 'border-emerald-500/30').replace(/text-\w+-\d+/g, 'text-emerald-400');
            } else if (lowerInstruction.includes('kırmızı') || lowerInstruction.includes('red') || lowerInstruction.includes('pembe')) {
              html = html.replace(/from-\w+-\d+/g, 'from-rose-600').replace(/to-\w+-\d+/g, 'to-pink-500').replace(/border-\w+-\d+/g, 'border-rose-500/30').replace(/text-\w+-\d+/g, 'text-rose-400');
            } else if (lowerInstruction.includes('mor') || lowerInstruction.includes('purple')) {
              html = html.replace(/from-\w+-\d+/g, 'from-purple-600').replace(/to-\w+-\d+/g, 'to-indigo-400').replace(/border-\w+-\d+/g, 'border-purple-500/30').replace(/text-\w+-\d+/g, 'text-purple-400');
            }

            if (!w.config) w.config = {};
            w.config.htmlTemplate = html;
            w.htmlTemplate = html;
            return w;
          });
        }

        if (modifiedAny) {
          setRefinedConfigs(prev => ({
            ...prev,
            [selectedIndex]: fallbackConfig
          }));
          setActiveDashboard(fallbackConfig);
          setMascotChat(`"${instruction}" komutunuza uygun olarak hem dashboard başlığı hem de tüm kart içerikleri güncellendi!`);
        }
      } catch (fallbackErr) {
        setMascotChat(`Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen tekrar deneyin.`);
      }
    } finally {
      setTimeout(() => setRefining(false), 100);
    }
  };

  const handleVoiceListenRefine = () => {
    if (isListening) {
      Voice.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setMascotChat("Sizi dinliyorum... Lütfen yapmak istediğiniz değişikliği sesli olarak söyleyin.");
    Voice.startListening(
      async (transcript) => {
        setIsListening(false);
        setRefinementInput(transcript);
        setMascotChat(`Söylediğinizi duydum: "${transcript}". Tasarımı hemen güncelliyorum...`);
        
        setRefining(true);
        const lowerTranscript = transcript.toLowerCase();
        const isExpertRequest = 
          lowerTranscript.includes('uzman') || 
          lowerTranscript.includes('ahmet') || 
          lowerTranscript.includes('hitl') || 
          lowerTranscript.includes('insan') ||
          lowerTranscript.includes('tasarımını getir') ||
          lowerTranscript.includes('yaptığı tasarım') ||
          lowerTranscript.includes('yaptığı tasarımı');

        if (isExpertRequest) {
          setTimeout(() => {
            applyExpertLayout();
            setRefining(false);
          }, 800);
          return;
        }

        const currentConfig = activeDashboard || uiConfigs[selectedIndex];

        try {
          const metadataPrompt = formatMetadataForPrompt(metadata);

          const refinedConfig = await modifyDashboardWithGemini(
            currentConfig,
            metadataPrompt,
            transcript
          );

          setRefinedConfigs(prev => ({
            ...prev,
            [selectedIndex]: refinedConfig
          }));

          setActiveDashboard(refinedConfig);
          setMascotChat(`Sesli komutunuza göre tasarımı güncelledim! Başka bir değişiklik isterseniz söyleyebilirsiniz.`);
        } catch (err) {
          console.error("Voice refinement error:", err);
          // Local fallback in case of rate limits or errors
          try {
            const fallbackConfig = JSON.parse(JSON.stringify(currentConfig));
            fallbackConfig.widgets = fallbackConfig.widgets.map(w => {
              let updatedHtml = w.htmlTemplate;
              if (lowerTranscript.includes('mavi') || lowerTranscript.includes('blue') || lowerTranscript.includes('lacivert')) {
                updatedHtml = updatedHtml.replace(/bg-slate-900\/60/g, 'bg-blue-950/70 border-blue-500/30 shadow-blue-500/10').replace(/border-white\/10/g, 'border-blue-500/20');
              } else if (lowerTranscript.includes('yeşil') || lowerTranscript.includes('green') || lowerTranscript.includes('yeşil yap')) {
                updatedHtml = updatedHtml.replace(/bg-slate-900\/60/g, 'bg-emerald-950/70 border-emerald-500/30 shadow-emerald-500/10').replace(/border-white\/10/g, 'border-emerald-500/20');
              } else if (lowerTranscript.includes('kırmızı') || lowerTranscript.includes('red') || lowerTranscript.includes('kırmızı yap')) {
                updatedHtml = updatedHtml.replace(/bg-slate-900\/60/g, 'bg-rose-950/70 border-rose-500/30 shadow-rose-500/10').replace(/border-white\/10/g, 'border-rose-500/20');
              }
              return { ...w, htmlTemplate: updatedHtml };
            });
            setActiveDashboard(fallbackConfig);
            setMascotChat(`Yerel tasarım motoru ile sesli komutunuz uygulandı!`);
          } catch (fallbackErr) {
            setMascotChat("Üzgünüm, sesli komutu işlerken bir hata oluştu.");
          }
        } finally {
          setRefining(false);
        }
      },
      () => {
        setIsListening(false);
      }
    );
  };


  const handleSwipeLeft = () => {
    if (swipeDirection || activeConfigs.length === 0) return;
    setSwipeDirection('left');
    setMascotChat("Bu vizyonu beğenmedin. Konsept elendi, sıradaki vizyon konseptini inceliyoruz!");
    setTimeout(() => {
      const currentCard = activeConfigs[currentCardIndex];
      const cardKey = currentCard ? (currentCard.id || currentCard.title || `card-${currentCardIndex}`) : `card-${currentCardIndex}`;
      const nextRejectedIds = [...rejectedIds, cardKey];
      setRejectedIds(nextRejectedIds);

      const remainingConfigs = uiConfigs.filter((c, i) => !nextRejectedIds.includes(c.id || c.title || `card-${i}`));

      if (remainingConfigs.length === 0) {
        setExpertRequested(true);
        setExpertStep('connecting');
        setMascotChat("Tasarım önerilerimizin hiçbirini beğenmediniz. Sizin için bir insan uzman (HITL) desteği talep ettim. Lütfen bekleyin...");
        setTimeout(() => setExpertStep('reviewing'), 1000);
        setTimeout(() => {
          setExpertStep('ready');
          setMascotChat("Uzmanımız şu an verilerinizi inceliyor! Talep #2311-071 numarasıyla sıraya alındınız.");
        }, 2500);
      } else {
        setCurrentCardIndex((prev) => (prev >= remainingConfigs.length ? 0 : prev));
      }
      setSwipeDirection(null);
    }, 300);
  };

  const handleSwipeUp = () => {
    if (swipeDirection || activeConfigs.length === 0) return;
    setSwipeDirection('up');
    setMascotChat("Bu tasarımı 'Belki' olarak not aldım. Diğer vizyon konseptlerini de inceleyelim!");
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % activeConfigs.length);
      setSwipeDirection(null);
    }, 300);
  };

  const handleSwipeRight = () => {
    if (swipeDirection || activeConfigs.length === 0) return;
    setSwipeDirection('right');
    setMascotChat("Harika! Bu tasarımı beğendin. Şimdi seçilen vizyonu gerçek verilerinle anında oluşturuyorum...");
    setTimeout(() => {
      const currentCard = activeConfigs[currentCardIndex];
      const origIndex = currentCard 
        ? uiConfigs.findIndex(c => (c.id || c.title) === (currentCard.id || currentCard.title))
        : currentCardIndex;
      handleSelect(origIndex !== -1 ? origIndex : currentCardIndex);
      setSwipeDirection(null);
    }, 300);
  };

  // Multi-source Merge Handler
  const handleMergeSource = async (e) => {
    const file = e.target.files[0];
    if (!file || !rawData) return;
    
    setAnalyzing(true);
    setMascotChat("Dosya okunuyor, veriler birleştiriliyor...");
    
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          let secondData = [];
          if (file.name.endsWith('.csv')) {
            const text = evt.target.result;
            const parsed = Papa.parse(text, { skipEmptyLines: true });
            secondData = parsed.data;
          } else {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            secondData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          }

          if (secondData.length === 0) {
            throw new Error("İkinci dosya boş veya geçersiz format.");
          }

          // Merge Logic: Join on Column index 0
          const headersA = rawData[0] || [];
          const headersB = secondData[0] || [];
          
          const joinKeyIndexA = 0;
          const joinKeyIndexB = 0;

          // Unique columns from B
          const colsBToAppend = headersB.map((h, i) => i).filter(i => i !== joinKeyIndexB);
          const headersBToAppend = colsBToAppend.map(i => headersB[i]);

          const mergedHeaders = [...headersA, ...headersBToAppend];
          const rowsA = rawData.slice(1);
          const rowsB = secondData.slice(1);

          // Build map for fast lookup
          const mapB = new Map();
          rowsB.forEach(row => {
            const key = row[joinKeyIndexB]?.toString().trim().toLowerCase();
            if (key !== undefined) {
              mapB.set(key, row);
            }
          });

          const mergedRows = rowsA.map(rowA => {
            const keyA = rowA[joinKeyIndexA]?.toString().trim().toLowerCase();
            const matchingRowB = mapB.get(keyA);
            
            const rowBValues = colsBToAppend.map(idx => {
              if (matchingRowB && matchingRowB[idx] !== undefined) {
                return matchingRowB[idx];
              }
              return '';
            });

            return [...rowA, ...rowBValues];
          });

          const newMergedData = [mergedHeaders, ...mergedRows];
          setRawData(newMergedData);
          triggerAutoSyncGithub(newMergedData);

          const sheetMetadata = await analyzeSheet(newMergedData, `${metadata.sheetName} + ${file.name.split('.')[0]}`);
          setMetadata(sheetMetadata);
          
          const metadataPrompt = formatMetadataForPrompt(sheetMetadata);
          
          // Regenerate AI Analytics
          setLoadingInsights(true);
          generateInsightsWithGemini(metadataPrompt)
            .then(res => setInsights(res))
            .catch(err => console.warn(err))
            .finally(() => setLoadingInsights(false));

          setLoadingSwot(true);
          generateSwotWithGemini(metadataPrompt)
            .then(res => setSwot(res))
            .catch(err => console.warn(err))
            .finally(() => setLoadingSwot(false));

          setLoadingBenchmark(true);
          generateBenchmarkWithGemini(metadataPrompt)
            .then(res => setBenchmark(res))
            .catch(err => console.warn(err))
            .finally(() => setLoadingBenchmark(false));

          // Auto-refine active dashboard config with the new data structure
          setRefining(true);
          const currentConfig = activeDashboard || uiConfigs[selectedIndex];
          const refinedConfig = await refineDashboardWithGemini(currentConfig, metadataPrompt, prompt || "Verileri analiz et.");
          setActiveDashboard(refinedConfig);

          setMascotChat(`Harika! "${file.name}" dosyasını mevcut verilerle başarıyla birleştirdim. Yeni sütunlar bağlandı ve analiz güncellendi!`);
        } catch (err) {
          console.error(err);
          setMascotChat(`Veri birleştirme hatası: ${err.message}`);
        } finally {
          setAnalyzing(false);
          setRefining(false);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error(err);
      setMascotChat("Dosya birleştirilirken hata oluştu.");
      setAnalyzing(false);
    }
  };

  const effectiveUser = user || {
    name: 'Demo Analist',
    email: 'demo@sheetcanvas.ai',
    picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SheetCanvas'
  };

  if (step === 'complete' && uiConfigs.length > 0) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20 overflow-x-hidden">
        <div className="max-w-[1600px] mx-auto px-6 pt-12 animate-fadeIn">

          {!isLocked ? (
            (activeConfigs.length === 0 || expertRequested) ? (
              <div className="glass-panel w-full max-w-4xl mx-auto p-8 rounded-[32px] border-white/10 shadow-2xl space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                      <UserCheck className="text-rose-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-wider uppercase">Tasarım Önerilerini Beğenmediniz mi?</h2>
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest mt-1">
                        Uzman Analist Köprüsü (HITL)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Sıra Numarası</span>
                    <span className="text-sm font-black text-blue-400">#2311-071</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Left Column: WebRTC Video Streams */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">WebRTC Video Streams</h3>
                      {webrtcConnected && (
                        <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Canlı Bağlantı
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-48">
                      {/* Local Stream */}
                      <div className="relative bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                        {localStream ? (
                          <video
                            ref={el => { if (el && localStream) el.srcObject = localStream; }}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <span className="block text-[9px] font-black uppercase text-slate-500">Kullanıcı (Siz)</span>
                            <span className="text-[8px] text-slate-600">Video Kapalı</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-[8px] font-bold text-white uppercase">Siz</span>
                      </div>

                      {/* Expert Stream */}
                      <div className="relative bg-slate-950/80 border border-white/5 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
                        {webrtcConnected ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-950/20 to-slate-950 p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2 animate-bounce">
                              <UserCheck size={20} className="text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black text-white">Ahmet Yılmaz</span>
                            <span className="text-[8px] text-slate-400 font-bold">Kıdemli Analist</span>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <span className="block text-[9px] font-black uppercase text-slate-500">Uzman Stream</span>
                            <span className="text-[8px] text-slate-600 font-semibold">Bağlantı Yok</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-[8px] font-bold text-white uppercase">Uzman</span>
                      </div>
                    </div>

                    {!webrtcConnected && (
                      <button
                        onClick={startWebrtcBridge}
                        className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-600/10 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <Sparkles size={14} className="animate-spin" /> WebRTC Video Köprüsünü Başlat
                      </button>
                    )}
                  </div>

                  {/* Right Column: Expert Live Chat Feed */}
                  <div className="flex flex-col bg-slate-950/60 border border-white/5 rounded-2xl p-4 h-64">
                    <div className="border-b border-white/5 pb-2 mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Canlı Uzman Sohbeti</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                      {expertMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 italic text-[10px]">
                          WebRTC köprüsü başladığında uzman mesajları burada görünecektir.
                        </div>
                      ) : (
                        expertMessages.map((msg, idx) => (
                          <div key={layout.id || `card-${idx}-${layout.title}`} className={`p-2.5 rounded-xl ${
                            msg.sender === 'Sistem' 
                            ? 'bg-white/5 text-slate-400 text-[10px] italic border border-white/5'
                            : msg.sender === 'Ahmet Yılmaz'
                            ? 'bg-blue-600/10 border border-blue-500/20 text-slate-200 text-left'
                            : 'bg-white/10 text-white text-right'
                          }`}>
                            <span className="block font-black text-[9px] text-blue-400 uppercase tracking-wider mb-0.5">{msg.sender}</span>
                            <p className="leading-relaxed font-medium">{msg.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {webrtcConnected && expertMessages.some(m => m.text.includes("düzeni hazırladım") || m.text.includes("şablonunuza gönderdim")) && (
                      <button
                        onClick={applyExpertLayout}
                        className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-wider animate-fadeIn"
                      >
                        Uzman Tasarımını Uygula
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 border-t border-white/5 pt-4 justify-end">
                  <button
                    onClick={() => {
                      cleanupWebrtc(); setRejectedIds([]); setExpertRequested(false); setCurrentCardIndex(0); setPrompt(''); setStep('analyzed');
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-wider"
                  >
                    Farklı Bir Prompt ile Yeniden Dene
                  </button>

                  <button
                    onClick={() => {
                      cleanupWebrtc(); setRejectedIds([]); setExpertRequested(false); setCurrentCardIndex(0); setIsLocked(false);
                    }}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white font-bold rounded-2xl transition-all text-xs uppercase tracking-wider"
                  >
                    Önerileri Baştan İncele
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg mx-auto">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                    <Sparkles size={12} /> Yapay Zeka Vizyon Motoru
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white uppercase tracking-widest">Vizyon Konseptini Seç</h2>
                  <p className="text-slate-400 text-xs font-semibold">Tasarım vizyonunu seç: Sola kaydır (Beğenmedim), Yukarı kaydır (Belki), Sağa kaydır (Beğen!)</p>
                </div>

                {/* Stack Container */}
                <div className="relative aspect-[4/5] w-full flex items-center justify-center">
                  {activeConfigs.map((layout, idx) => {
                    if (idx !== currentCardIndex && idx !== (currentCardIndex + 1) % activeConfigs.length) return null;
                    
                    const isTop = idx === currentCardIndex;
                    
                    let swipeClass = "";
                    if (isTop && swipeDirection) {
                      if (swipeDirection === 'left') swipeClass = "translate-x-[-150%] rotate-[-20deg] opacity-0 scale-95 transition-all duration-300 ease-out";
                      if (swipeDirection === 'right') swipeClass = "translate-x-[150%] rotate-[20deg] opacity-0 scale-95 transition-all duration-300 ease-out";
                      if (swipeDirection === 'up') swipeClass = "translate-y-[-150%] opacity-0 scale-95 transition-all duration-300 ease-out";
                    }

                    const zIndex = isTop ? 30 : 20;
                    const scaleOffset = isTop ? 1 : 0.95;
                    const rotateOffset = isTop ? 0 : 3;
                    const translateYOffset = isTop ? 0 : 8;

                    return (
                      <div 
                        key={idx} 
                        className={`absolute inset-0 bg-slate-900 border border-white/10 rounded-[40px] p-2.5 overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 ${swipeClass}`}
                        style={{
                          zIndex,
                          transform: !isTop ? `scale(${scaleOffset}) translateY(${translateYOffset}px) rotate(${rotateOffset}deg)` : undefined,
                          opacity: isTop ? 1 : 0.6,
                          pointerEvents: isTop ? 'auto' : 'none'
                        }}
                      >
                        {/* Floating Swipe Feedback Stamp */}
                        {isTop && swipeDirection === 'right' && (
                          <div className="absolute top-8 right-8 z-50 px-6 py-2 border-4 border-emerald-400 text-emerald-400 font-black text-2xl uppercase rounded-2xl rotate-12 bg-slate-950/90 backdrop-blur-md shadow-2xl animate-pulse">
                            BEĞENDİM
                          </div>
                        )}
                        {isTop && swipeDirection === 'left' && (
                          <div className="absolute top-8 left-8 z-50 px-6 py-2 border-4 border-rose-500 text-rose-500 font-black text-2xl uppercase rounded-2xl -rotate-12 bg-slate-950/90 backdrop-blur-md shadow-2xl animate-pulse">
                            BEĞENMEDİM
                          </div>
                        )}
                        {isTop && swipeDirection === 'up' && (
                          <div className="absolute top-8 inset-x-0 mx-auto w-fit z-50 px-6 py-2 border-4 border-amber-400 text-amber-400 font-black text-2xl uppercase rounded-2xl bg-slate-950/90 backdrop-blur-md shadow-2xl animate-pulse">
                            BELKİ
                          </div>
                        )}

                        {/* Wireframe Mockup Visual / Real Canvas Image */}
                        <div className="flex-1 relative overflow-hidden rounded-[32px] bg-slate-950/60 flex items-center justify-center">
                          {layout.image ? (
                            <img 
                              src={layout.image} 
                              alt={layout.title || "Canvas Tasarımı"} 
                              className="w-full h-full object-cover object-top rounded-[32px] transition-transform duration-500 hover:scale-105" 
                            />
                          ) : (
                            <div className="absolute inset-0 overflow-hidden scale-[0.9] origin-center opacity-70">
                              <div className="w-[300%] h-[300%] transform scale-[0.333] origin-top-left p-8">
                                <DynamicDashboard
                                  uiConfig={layout}
                                  spreadsheetId={spreadsheetId}
                                  mockMode={true}
                                  metadata={metadata}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info overlay */}
                        <div className="p-6 bg-slate-950/85 rounded-[32px] border border-white/5 space-y-2 relative z-45 backdrop-blur-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Öneri {idx + 1} / {activeConfigs.length}</span>{rejectedIds.length > 0 && <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">{rejectedIds.length} Elendi</span>}</div>
                            <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-0.5 rounded-full">{layout.category || "Dashboard"}</span>
                          </div>
                          <h3 className="text-xl font-black text-white uppercase leading-tight">{layout.title || "Stratejik Analiz"}</h3>
                          <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-2">
                            {layout.description || "Verilerinize uygun, kullanıcı dostu ve profesyonel bir veri görselleştirme stratejisi."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Swipe Action Buttons */}
                <div className="flex items-center justify-center gap-8 pt-4">
                  {/* Sola Kaydır / Beğenmedim */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleSwipeLeft}
                      disabled={refining || !!swipeDirection}
                      className="w-16 h-16 bg-slate-900 hover:bg-rose-950/40 border-2 border-rose-500/30 hover:border-rose-500 text-rose-500 rounded-full flex items-center justify-center transition-all shadow-xl shadow-rose-950/20 active:scale-95 group"
                      title="Beğenmedim (Sola Kaydır)"
                    >
                      <ThumbsDown size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">Beğenmedim</span>
                  </div>

                  {/* Yukarı Kaydır / Belki */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleSwipeUp}
                      disabled={refining || !!swipeDirection}
                      className="w-14 h-14 bg-slate-900 hover:bg-amber-950/40 border-2 border-amber-500/30 hover:border-amber-500 text-amber-500 rounded-full flex items-center justify-center transition-all shadow-lg shadow-amber-950/20 active:scale-95 group"
                      title="Belki (Yukarı Kaydır)"
                    >
                      <Smile size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Belki</span>
                  </div>

                  {/* Sağa Kaydır / Beğen */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleSwipeRight}
                      disabled={refining || !!swipeDirection}
                      className="w-16 h-16 bg-slate-900 hover:bg-emerald-950/40 border-2 border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center transition-all shadow-xl shadow-emerald-950/20 active:scale-95 group"
                      title="Beğendim! (Sağa Kaydır)"
                    >
                      <Heart size={26} className="group-hover:scale-110 transition-transform fill-emerald-500/20" />
                    </button>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Beğen</span>
                  </div>
                </div>
              </div>
          )
        ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Dashboard Area */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {(activeDashboard?.image || uiConfigs[selectedIndex]?.image) && (
                      <div className="relative group shrink-0">
                        <img 
                          src={activeDashboard?.image || uiConfigs[selectedIndex]?.image} 
                          alt="Seçilen Vizyon Tasarımı" 
                          className="w-24 h-16 object-cover object-top rounded-2xl border-2 border-blue-500/30 shadow-xl shadow-blue-500/10 transition-transform group-hover:scale-105" 
                        />
                        <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-blue-600 text-[8px] font-black uppercase tracking-widest text-white rounded-lg shadow-md">
                          Vizyon
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <Sparkles size={18} className="text-blue-400 shrink-0" />
                        <h2 className="text-2xl font-black tracking-tight truncate">{activeDashboard?.title || uiConfigs[selectedIndex]?.title}</h2>
                        <span className="px-3 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">
                          Seçilen Vizyona Özel Canlı Dashboard
                        </span>
                        {(activeDashboard?.category || uiConfigs[selectedIndex]?.category) && (
                          <span className="px-2.5 py-0.5 bg-white/5 text-slate-300 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                            {activeDashboard?.category || uiConfigs[selectedIndex]?.category}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs italic line-clamp-1">{activeDashboard?.subtitle || uiConfigs[selectedIndex]?.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    
                    <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl gap-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        Izgara
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        Liste
                      </button>
                    </div>

                    <button
                      onClick={() => setAutoSyncGh(prev => !prev)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                        autoSyncGh
                        ? 'bg-blue-600/15 border-blue-500/30 text-blue-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Her veri güncellemesinde otomatik olarak GitHub'a kaydet"
                    >
                      <GitBranch size={13} className={autoSyncGh ? "animate-pulse" : ""} />
                      {autoSyncGh ? "Eşitleme: Açık" : "Canlı Eşitleme"}
                    </button>

                    <button
                      onClick={() => setIsLocked(false)}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all text-slate-400"
                    >
                      <Layout size={14} /> Tasarımı Değiştir
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Download size={14} /> Dışa Aktar
                      </button>
                      {showExportDropdown && (
                        <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-fadeIn animate-duration-150">
                          <button
                            onClick={() => {
                              handleExportJSON();
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                          >
                            Dashboard Config (JSON)
                          </button>
                          <button
                            onClick={() => {
                              handleExportCSV();
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                          >
                            Veri Seti (CSV)
                          </button>
                          <button
                            onClick={() => {
                              handleExportExcel();
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                          >
                            Excel Dosyası (XLSX)
                          </button>
                          <button
                            onClick={() => {
                              setShowGithubModal(true);
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 border-t border-white/5 mt-1 pt-2"
                          >
                            <GitBranch size={12} className="text-blue-400" /> GitHub Store
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  {refining && (
                    <div className="absolute inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md rounded-[32px] flex flex-col items-center justify-center animate-fadeIn p-6 text-center shadow-2xl border border-blue-500/30">
                      <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 animate-pulse">
                        <Sparkles size={32} className="animate-spin text-blue-400" />
                      </div>
                      <h4 className="text-lg font-black text-white tracking-wide uppercase mb-1">Gemini & Groq AI Tasarımı Üretiyor...</h4>
                      <p className="text-xs text-blue-300 font-medium max-w-md leading-relaxed">
                        Seçtiğiniz Vizyon Konsepti, Akademik Prompt ve Canlı Veri Setiniz Yapay Zeka Motoruna Aktarılıyor
                      </p>
                    </div>
                  )}
                  {activeDashboard && (
                    <DynamicDashboard
                      uiConfig={activeDashboard}
                      spreadsheetId={spreadsheetId}
                      mockMode={false}
                      metadata={metadata}
                      viewMode={viewMode}
                      activeRule={activeRule}
                    />
                  )}
                </div>
              </div>

              {/* Mascot Side Assistant */}
              <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
                <div className="glass-panel rounded-[32px] border-white/10 p-6 flex flex-col h-full sticky top-12">
                  
                  <div className="flex items-center justify-between mb-4 bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center relative">
                        <MessageSquare size={18} className="text-blue-400" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse"></span>
                      </div>
                      <div>
                        <h3 className="font-black text-xs uppercase tracking-tight text-white tracking-widest">Nova</h3>
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">● Çevrimiçi</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const muted = !isMuted;
                        setIsMuted(muted);
                        if (muted) {
                          Voice.stop();
                        } else {
                          Voice.speak(mascotChat);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isMuted ? 'bg-slate-900 border-white/10 text-slate-400 hover:text-white' : 'bg-blue-600/10 border-blue-500/20 text-blue-400'}`}
                    >
                      {isMuted ? "🔇 Sesi Aç" : "🔊 Ses Açık"}
                    </button>
                  </div>

                  {!expertRequested ? (
                    <button
                      onClick={handleDelegateExpert}
                      className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 group"
                    >
                      <UserCheck size={16} className="group-hover:scale-110 transition-transform" /> Uzman Desteği
                    </button>
                  ) : (
                    <div className="w-full mb-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[9px] text-emerald-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle size={12} /> Uzman Talebi Alındı
                    </div>
                  )}

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                    <p className="text-xs leading-relaxed text-slate-200 font-medium italic">
                      "{mascotChat}"
                    </p>
                  </div>

                  {/* Multi-source Merge Component */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <GitBranch size={12} className="text-emerald-400" />
                      <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-300">Çoklu Veri Birleştir (Merge)</h4>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium leading-normal">
                      İlk sütunu (Key) eşleştirerek mevcut tabloya yeni bir CSV veya Excel dosyası birleştirin.
                    </p>
                    <label className="block">
                      <div className="w-full py-2.5 bg-slate-950/40 border border-white/5 hover:border-emerald-500/30 rounded-xl text-center cursor-pointer transition-all text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white">
                        📁 İkinci Dosyayı Yükle
                      </div>
                      <input 
                        type="file" 
                        accept=".csv,.xlsx,.xls" 
                        onChange={handleMergeSource} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Dynamic Rule Editor */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-blue-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">LLM Kural Motoru</h4>
                      </div>
                      {activeRule && (
                        <button
                          onClick={() => {
                            setActiveRule(null);
                            setRuleInput('');
                          }}
                          className="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                    
                    <form onSubmit={handleApplyRule} className="flex gap-2">
                      <input
                        type="text"
                        value={ruleInput}
                        onChange={(e) => setRuleInput(e.target.value)}
                        placeholder="Örn: Miktar 1000'den büyükse kırmızı yap"
                        className="flex-1 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-600"
                        disabled={parsingRule}
                      />
                      <button
                        type="submit"
                        disabled={parsingRule}
                        className="px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0"
                      >
                        {parsingRule ? <Loader2 size={12} className="animate-spin" /> : "Uygula"}
                      </button>
                    </form>
                    {activeRule && (
                      <div className="text-[9px] text-slate-400 font-medium bg-slate-950/60 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                        <span>Aktif Filtre: <strong className="text-blue-400">{activeRule.targetColumn}</strong> {activeRule.operator} {activeRule.value}</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px]">{activeRule.action}</span>
                      </div>
                    )}
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 mb-4">
                    <button
                      onClick={() => setSidebarTab('insights')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sidebarTab === 'insights' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      İçgörüler
                    </button>
                    <button
                      onClick={() => setSidebarTab('swot')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sidebarTab === 'swot' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      SWOT
                    </button>
                    <button
                      onClick={() => setSidebarTab('benchmark')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sidebarTab === 'benchmark' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Benchmark
                    </button>
                  </div>

                  {sidebarTab === 'insights' && (
                    <>
                      {loadingInsights && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-500" />
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">AI İçgörüler Üretiliyor...</span>
                        </div>
                      )}

                      {!loadingInsights && insights && insights.length > 0 && (
                        <div className="mb-4 space-y-3 bg-white/5 rounded-2xl p-4 border border-white/5 max-h-[250px] overflow-y-auto custom-scrollbar">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-yellow-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-300">AI Analiz İçgörüleri</h4>
                          </div>
                          <div className="space-y-2">
                            {insights.map((insight, idx) => {
                              let typeColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                              if (insight.type === "risk" || insight.type === "warning") {
                                typeColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                              } else if (insight.type === "opportunity") {
                                typeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                              } else if (insight.type === "trend") {
                                typeColor = "text-violet-400 bg-violet-500/10 border-violet-500/20";
                              }
                              
                              return (
                                <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white leading-tight">{insight.title}</span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${typeColor} shrink-0`}>
                                      {insight.type}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{insight.text}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {sidebarTab === 'swot' && (
                    <div className="mb-4 space-y-4">
                      {loadingSwot && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-500" />
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">SWOT Analizi Üretiliyor...</span>
                        </div>
                      )}
                      {!loadingSwot && swot && (
                        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">💪 Güçlü</span>
                            <ul className="text-[9px] text-slate-300 list-disc list-inside space-y-1">
                              {swot.strengths?.map((item, idx) => <li key={idx} className="leading-tight">{item}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">⚠️ Zayıf</span>
                            <ul className="text-[9px] text-slate-300 list-disc list-inside space-y-1">
                              {swot.weaknesses?.map((item, idx) => <li key={idx} className="leading-tight">{item}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">🚀 Fırsat</span>
                            <ul className="text-[9px] text-slate-300 list-disc list-inside space-y-1">
                              {swot.opportunities?.map((item, idx) => <li key={idx} className="leading-tight">{item}</li>)}
                            </ul>
                          </div>
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">⚡ Tehdit</span>
                            <ul className="text-[9px] text-slate-300 list-disc list-inside space-y-1">
                              {swot.threats?.map((item, idx) => <li key={idx} className="leading-tight">{item}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {sidebarTab === 'benchmark' && (
                    <div className="mb-4 space-y-3">
                      {loadingBenchmark && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-500" />
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Benchmark Üretiliyor...</span>
                        </div>
                      )}
                      {!loadingBenchmark && benchmark && benchmark.length > 0 && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {benchmark.map((item, idx) => {
                            let statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                            if (item.status === "danger") {
                                statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                            } else if (item.status === "warning") {
                                statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                            } else if (item.status === "success") {
                                statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                            }
                            return (
                              <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-white">{item.metric}</span>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center bg-white/5 p-2 rounded-lg border border-white/5">
                                  <div>
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Mevcut</div>
                                    <div className="text-sm font-black text-white">{item.value}</div>
                                  </div>
                                  <div className="border-l border-white/5">
                                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Benchmark</div>
                                    <div className="text-xs font-black text-blue-400 mt-0.5 truncate">{item.benchmark}</div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-normal font-medium">{item.analysis}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleRefine} className="flex gap-2">
                    <input
                      type="text"
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      placeholder="Hızlı revize iste..."
                      className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVoiceListenRefine}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 ${isListening ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'}`}
                      title="Sesli Komut Ver"
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button type="submit" className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transition-all shrink-0">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[540px] relative z-10 animate-fadeIn">
        <div className="glass-panel rounded-[40px] p-12 shadow-2xl text-center border-slate-700/30">
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
                <span className="text-xs text-slate-400 font-medium truncate">
                  Bağlı: {DataHub.activeSource === 'google_sheets' ? spreadsheetId : (DataHub.adapter?.dbType || DataHub.adapter?.file?.name || 'MCP Veri Kaynağı')}
                </span>
              </div>
              <button onClick={handleAnalyze} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 text-lg">
                Analizi Başlat <ArrowRight size={22} />
              </button>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="space-y-6 w-full max-w-4xl mx-auto animate-fadeIn">
              <div className="text-center mb-6">
                <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-black text-white tracking-widest uppercase">Veriler Analiz Ediliyor</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Matris boyutları hesaplanıyor ve şablonlar eşleştiriliyor...</p>
              </div>
              <DashboardSkeleton />
            </div>
          )}

          {step === 'analyzed' && (
            <div className="glass-panel max-w-2xl mx-auto p-8 rounded-[32px] border-white/10 shadow-2xl space-y-6 animate-fadeIn text-left">
              {/* Header Info */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-3">
                  <CheckCircle size={22} className="text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">Veri Seti Analizi Tamamlandı</h3>
                    <p className="text-xs text-emerald-400/90 font-medium">Hedef promptunuzu yazın, bir sonraki sayfada vizyon kart destesini inceleyin.</p>
                  </div>
                </div>
                {metadata && (
                  <div className="flex gap-2 text-xs font-bold text-slate-300 shrink-0">
                    <span className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">{metadata.rowCount} Satır</span>
                    <span className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">{metadata.headers.length} Sütun</span>
                  </div>
                )}
              </div>

              {/* Prompt Input Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-xs flex items-center justify-center">1</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Tasarım & Analiz Hedefinizi Girin (Prompt)</h3>
                </div>
                <textarea 
                  className="w-full h-28 bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-500 font-medium" 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="Örn: Ciro trendi, performans verileri ve özet metrikleri gösteren lüks koyu temalı bir dashboard yap..." 
                />
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider ml-1">Önerilen Prompt İstemleri:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPrompt("Koyu Lacivert temalı, modern cam efektli lüks bir satış paneli tasarla")}
                      className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 hover:text-white hover:border-blue-500/30 transition-all font-semibold"
                    >
                      ✨ Koyu Lacivert & Cam Efekti
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt("Neon yeşil detayları olan, sade ve profesyonel bir finans kokpiti oluştur")}
                      className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all font-semibold"
                    >
                      🟢 Neon Yeşil Finans Kokpiti
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt("Performans odaklı, yüksek kontrastlı ve kart bazlı bir yönetici raporu oluştur")}
                      className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 hover:text-white hover:border-purple-500/30 transition-all font-semibold"
                    >
                      📊 Performans Odaklı Yönetici
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrompt("Operasyonel stok, lojistik teslimat ve depo kritik durumlarını göster")}
                      className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-[10px] text-slate-300 hover:text-white hover:border-amber-500/30 transition-all font-semibold"
                    >
                      📦 Operasyon & Depo
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button: To Vision Tinder Deck! */}
              <button 
                onClick={handleProceedToVisionDeck} 
                disabled={analyzing} 
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 text-sm uppercase tracking-widest active:scale-[0.99]"
              >
                {analyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {analyzing ? 'Vizyon Konseptleri Eşleştiriliyor...' : 'VİZYON KONSEPTLERİNİ İNCELE (TİNDER DESTESİ) →'}
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="space-y-6 w-full max-w-4xl mx-auto animate-fadeIn">
              <div className="text-center mb-6">
                <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-black text-white tracking-widest uppercase">AI Dashboard Tasarlıyor</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Veri setindeki değişkenler analiz ediliyor ve arayüz çiziliyor...</p>
              </div>
              <DashboardSkeleton />
            </div>
          )}

          {step === 'error' && (
            <div className="py-6 text-center">
              <AlertCircle size={64} className="text-rose-500 mx-auto mb-6" />
              <p className="text-rose-400 text-sm mb-8 font-medium">{error}</p>
              <button onClick={() => setStep('idle')} className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all">Tekrar Dene</button>
            </div>
          )}

          {showGithubModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-md animate-fadeIn">
              <div className="glass-panel w-full max-w-md p-8 rounded-[32px] border-white/10 shadow-2xl relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
                      <GitBranch size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">GitHub Store</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Veriyi Repoya Gönder</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGithubModal(false)}
                    className="text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                  >
                    Kapat
                  </button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-[10px] text-amber-400 font-medium leading-normal space-y-1">
                  <p className="font-black flex items-center gap-1.5">⚠️ Repo Erişim Uyarısı:</p>
                  <p>Yalnızca <strong>kendi yazma izninizin olduğu</strong> depolara veri gönderebilirsiniz. Başkasının deposuna (örn: seyyah/sheet-canvas) yazamazsınız. Sunumda sorunsuz göstermek için sağ taraftaki <strong>"Simüle Et (Demo)"</strong> butonunu kullanabilirsiniz.</p>
                </div>

                <form onSubmit={handleCommitToGithub} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-black text-slate-400">Personal Access Token (PAT)</label>
                    <input 
                      type="password" 
                      value={githubSettings.token}
                      onChange={(e) => setGithubSettings({...githubSettings, token: e.target.value})}
                      placeholder="ghp_..."
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-black text-slate-400">Repo Sahibi (Owner)</label>
                      <input 
                        type="text" 
                        value={githubSettings.owner}
                        onChange={(e) => setGithubSettings({...githubSettings, owner: e.target.value})}
                        placeholder="Örn: github_user"
                        className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-black text-slate-400">Repo Adı</label>
                      <input 
                        type="text" 
                        value={githubSettings.repo}
                        onChange={(e) => setGithubSettings({...githubSettings, repo: e.target.value})}
                        placeholder="Örn: my-dataset-repo"
                        className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-black text-slate-400">Dosya Yolu (Path)</label>
                    <input 
                      type="text" 
                      value={githubSettings.path}
                      onChange={(e) => setGithubSettings({...githubSettings, path: e.target.value})}
                      placeholder="data/dataset.csv"
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-black text-slate-400">Commit Mesajı</label>
                    <input 
                      type="text" 
                      value={githubSettings.message}
                      onChange={(e) => setGithubSettings({...githubSettings, message: e.target.value})}
                      className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={committingGh}
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30"
                    >
                      {committingGh ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Commit Et (Real)"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateCommitToGithub}
                      disabled={committingGh}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30"
                    >
                      {committingGh ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Simüle Et (Demo)"
                      )}
                    </button>
                  </div>
                </form>
              </div>
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

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2 text-left">
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 h-28 space-y-3">
            <div className="h-3 bg-slate-800 rounded-full w-24"></div>
            <div className="h-8 bg-slate-800 rounded-full w-32"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-slate-900/60 border border-white/5 rounded-3xl p-6 h-64 space-y-4">
          <div className="h-4 bg-slate-800 rounded-full w-40"></div>
          <div className="h-full bg-slate-800/20 rounded-2xl w-full flex items-end justify-between p-4 pt-12">
            {[40, 70, 45, 90, 60, 80, 50, 65, 35, 75].map((h, i) => (
              <div key={i} className="w-6 bg-slate-800/80 rounded-t-lg" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
        <div className="col-span-4 bg-slate-900/60 border border-white/5 rounded-3xl p-6 h-64 space-y-6">
          <div className="h-4 bg-slate-800 rounded-full w-24"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-3 bg-slate-800 rounded-full w-20"></div>
                <div className="h-3 bg-slate-800 rounded-full w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
