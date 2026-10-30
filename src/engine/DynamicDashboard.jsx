import { useState, useEffect, useMemo } from 'react';
import { getWidgetComponent } from './WidgetRegistry.js';
import DataHub from '../mcp/DataHub';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { useGoogleAuth } from '../auth/useGoogleAuth';

export default function DynamicDashboard({ uiConfig, spreadsheetId, mockMode = false, metadata = null, initialData = null, viewMode = 'grid', activeRule = null }) {
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
      if (initialData && Array.isArray(initialData) && initialData.length > 0) {
        const filteredData = initialData.filter((row, idx) => idx === 0 || row.some(cell => cell && cell.toString().trim() !== ''));
        const dataMap = {};
        dataRequests.forEach(req => {
          const range = req.range.includes('!') ? req.range : `${req.sheetName}${req.sheetName ? '!' : ''}${req.range}`;
          dataMap[range] = filteredData;
        });
        setSheetData(dataMap);
        setLoading(false);
        return;
      }

      if (mockMode) {
        const mockDataMap = {};
        if (metadata && metadata.columnStats) {
          const headers = metadata.columnStats.map(c => c.name);
          const mockRows = Array.from({ length: 5 }).map(() => 
            metadata.columnStats.map(c => {
              if (c.type === 'number') return (Math.random() * 1000).toFixed(0) + (c.unit || '');
              if (c.type === 'date') return new Date().toLocaleDateString();
              return c.sampleValues && c.sampleValues[0] ? c.sampleValues[0] : `${c.name} #1`;
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
            if (!updatedData || !Array.isArray(updatedData)) return;
            const newFiltered = updatedData.filter((row, idx) => idx === 0 || row.some(cell => cell && cell.toString().trim() !== ''));
            setSheetData(prev => {
              if (JSON.stringify(prev[range]) === JSON.stringify(newFiltered)) return prev;
              return {
                ...prev,
                [range]: newFiltered
              };
            });
          });
          unsubscribes.push(unsub);
        }
        setSheetData(dataMap);

        return () => {
          unsubscribes.forEach(unsub => unsub && unsub());
        };
      } catch (err) {
        console.warn('⚠️ [DynamicDashboard] Canlı veri yükleme uyarısı, mock veriye geçiliyor:', err.message);
        setSheetData(mockDataMap);
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

  function getResponsiveColSpanClass(rawSpan, viewMode) {
    if (viewMode === 'list') return 'col-span-12';
    const val = Number(rawSpan) || 4;
    if (val === 1) return 'col-span-12 sm:col-span-6 lg:col-span-3';
    if (val === 2) return 'col-span-12 sm:col-span-6 lg:col-span-4';
    if (val === 3) return 'col-span-12 lg:col-span-6';
    if (val === 4) return 'col-span-12';
    if (val >= 12) return 'col-span-12';
    if (val >= 8) return 'col-span-12 lg:col-span-8';
    if (val >= 6) return 'col-span-12 lg:col-span-6';
    return `col-span-12 sm:col-span-6 lg:col-span-${val}`;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {mockMode && (
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs font-black uppercase tracking-widest animate-pulse">
          <Info size={14} /> Mock Görünüm Aktif
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 items-stretch">
        {sortedWidgets.map((widget, index) => {
          try {
            const WidgetComponent = getWidgetComponent(widget.type);
            if (!WidgetComponent) return null;

            const colSpanClass = getResponsiveColSpanClass(widget.gridPosition?.colSpan, viewMode);
            const rowSpanClass = (widget.gridPosition?.rowSpan || 1) > 1 ? 'row-span-2' : 'row-span-1';

            const dataKey = widget.dataSource ? (widget.dataSource.range.includes('!') ? widget.dataSource.range : `${widget.dataSource.sheetName}${widget.dataSource.sheetName ? '!' : ''}${widget.dataSource.range}`) : null;
            
            let widgetData = sheetData[dataKey];
            if (!widgetData && widget.dataSource) widgetData = sheetData[widget.dataSource.range];
            if (!widgetData) widgetData = Object.values(sheetData)[0];

            return (
              <div
                key={`${widget.type}-${index}`}
                className={`group relative transition-all duration-300 hover:-translate-y-1 ${colSpanClass} ${rowSpanClass}`}
              >
                <div className="relative h-full flex flex-col rounded-3xl overflow-hidden">
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
