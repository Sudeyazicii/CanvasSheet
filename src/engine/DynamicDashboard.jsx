import { useState, useEffect, useMemo } from 'react';
import { getWidgetComponent } from './WidgetRegistry.js';
import DataHub from '../mcp/DataHub';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';

export default function DynamicDashboard({ uiConfig, spreadsheetId, mockMode = false, metadata = null, viewMode = 'grid', activeRule = null }) {
  const auth = useGoogleAuth();
  const accessToken = auth?.accessToken;
  const [sheetData, setSheetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRequests = useMemo(() => {
    if (!uiConfig || !uiConfig.widgets) return [];
    const requests = new Map();

    uiConfig.widgets.forEach(widget => {
      if (widget.dataSource) {
        const { sheetName, range } = widget.dataSource;
        const key = range.includes('!') ? range : `${sheetName}!${range}`;
        if (!requests.has(key)) {
          requests.set(key, { sheetName, range });
        }
      }
    });

    if (requests.size === 0) {
      requests.set('A1:Z50', { sheetName: '', range: 'A1:Z50' });
    }

    return Array.from(requests.values());
  }, [uiConfig]);

  useEffect(() => {
    async function loadData() {
      if (mockMode) {
        const mockDataMap = {};
        if (metadata && metadata.columnStats) {
          const headers = metadata.columnStats.map(c => c.name);
          const mockRows = Array.from({ length: 5 }).map(() => 
            metadata.columnStats.map(c => {
              if (c.type === 'number') return (Math.random() * 1000).toFixed(0) + (c.unit || '');
              if (c.type === 'date') return new Date().toLocaleDateString();
              return `Sallamasyon ${c.name}`;
            })
          );
          const fullMock = [headers, ...mockRows];
          
          dataRequests.forEach(req => {
            const range = req.range.includes('!') ? req.range : `${req.sheetName}${req.sheetName ? '!' : ''}${req.range}`;
            mockDataMap[range] = fullMock;
          });
        }
        setSheetData(mockDataMap);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const dataMap = {};
        const unsubscribes = [];

        for (const req of dataRequests) {
          const range = req.range.includes('!') ? req.range : `${req.sheetName}${req.sheetName ? '!' : ''}${req.range}`;
          const data = await DataHub.fetchData(range);
          const filteredData = data.filter((row, idx) => idx === 0 || row.some(cell => cell && cell.toString().trim() !== ''));
          dataMap[range] = filteredData;

          const unsub = DataHub.subscribe(range, (updatedData) => {
            console.log(`🔔 Live update received for ${range}`);
            setSheetData(prev => ({
              ...prev,
              [range]: updatedData.filter((row, idx) => idx === 0 || row.some(cell => cell && cell.toString().trim() !== ''))
            }));
          });
          unsubscribes.push(unsub);
        }
        setSheetData(dataMap);

        return () => {
          unsubscribes.forEach(unsub => unsub());
        };
      } catch (err) {
        console.error('Data load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const cleanupPromise = loadData();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [spreadsheetId, dataRequests, mockMode, metadata]);

  const handleDataChange = async (widgetIndex, newData) => {
    const widget = uiConfig.widgets[widgetIndex];
    if (!widget?.dataSource) return;

    try {
      const { sheetName, range } = widget.dataSource;
      const fullRange = range.includes('!') ? range : `${sheetName}!${range}`;
      await batchWriteSheet(accessToken, spreadsheetId, [{
        range: fullRange,
        values: newData
      }]);
      setSheetData(prev => ({ ...prev, [fullRange]: newData }));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <Loader2 size={48} className="animate-spin text-blue-500" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">AI Verileri Hazırlıyor...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400">
      <h3 className="font-bold mb-2">Veri Yükleme Hatası</h3>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  );

  const sortedWidgets = [...(uiConfig?.widgets || [])].sort((a, b) => (a.gridPosition?.order || 0) - (b.gridPosition?.order || 0));

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-4xl font-black text-white tracking-tight">{uiConfig.title}</h1>
        <p className="text-slate-400 font-medium text-lg">{uiConfig.subtitle}</p>
        
        {mockMode && (
          <div className="absolute top-0 right-0 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
            <Info size={14} /> Sallamasyon (Mock) Görünüm
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {sortedWidgets.map((widget, index) => {
          try {
            const WidgetComponent = getWidgetComponent(widget.type);
            if (!WidgetComponent) return null;

            const colSpan = viewMode === 'list' ? 12 : (widget.gridPosition?.colSpan || 12);
            const rowSpan = viewMode === 'list' ? 1 : (widget.gridPosition?.rowSpan || 1);

            const colSpanClass = 
              colSpan === 1 ? 'col-span-1' :
              colSpan === 2 ? 'col-span-2' :
              colSpan === 3 ? 'col-span-3' :
              colSpan === 4 ? 'col-span-4' :
              colSpan === 5 ? 'col-span-5' :
              colSpan === 6 ? 'col-span-6' :
              colSpan === 7 ? 'col-span-7' :
              colSpan === 8 ? 'col-span-8' :
              colSpan === 9 ? 'col-span-9' :
              colSpan === 10 ? 'col-span-10' :
              colSpan === 11 ? 'col-span-11' :
              'col-span-12';

            const rowSpanClass = 
              rowSpan === 1 ? 'row-span-1' :
              rowSpan === 2 ? 'row-span-2' :
              rowSpan === 3 ? 'row-span-3' :
              rowSpan === 4 ? 'row-span-4' :
              rowSpan === 5 ? 'row-span-5' :
              'row-span-6';

            const dataKey = widget.dataSource ? (widget.dataSource.range.includes('!') ? widget.dataSource.range : `${widget.dataSource.sheetName}${widget.dataSource.sheetName ? '!' : ''}${widget.dataSource.range}`) : null;
            
            let widgetData = sheetData[dataKey];
            if (!widgetData && widget.dataSource) widgetData = sheetData[widget.dataSource.range];
            if (!widgetData) widgetData = Object.values(sheetData)[0];

            return (
              <div
                key={`${widget.type}-${index}`}
                className={`group relative transition-all duration-150 hover:-translate-y-1 ${colSpanClass} ${rowSpanClass}`}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[32px] blur opacity-0 group-hover:opacity-10 transition duration-200"></div>
                <div className="relative glass-panel rounded-[32px] overflow-hidden border-white/5 group-hover:border-white/10 transition-colors h-full">
                  <WidgetComponent
                     title={widget.title}
                     sheetData={widgetData}
                     onDataChange={(newData) => handleDataChange(index, newData)}
                     config={widget.config}
                     style={widget.style}
                     activeRule={activeRule}
                  />
                </div>
              </div>
            );
          } catch (err) {
            return <div className="col-span-12 p-4 text-rose-500">Widget Error</div>;
          }
        })}
      </div>
    </div>
  );
}
