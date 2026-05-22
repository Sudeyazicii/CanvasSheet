import { readSheet, getSheetMetadata } from './sheetsService.js';
import { parseNumeric } from './dataUtils.js';

export async function analyzeSheet(data, sourceName = 'Data Source') {
  try {
    if (!data || data.length === 0) {
      throw new Error('Veri bulunamadı.');
    }

    const headers = data[0];
    const allRows = data.slice(1);

    // Boş satırları filtrele
    const activeRows = allRows.filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ''));
    const rowCount = activeRows.length;

    // SÜTUN ANALİZİ
    const columnStats = headers.map((header, i) => {
      const samples = activeRows.slice(0, 20).map(row => row[i]).filter(cell => cell !== undefined && cell !== null);
      let detectedType = 'string';
      let hasNumbers = false;
      let detectedUnit = '';
      let semanticRole = 'attribute';

      if (samples.length > 0) {
        const fullString = samples.join(' ').toLowerCase();
        const headerLower = header?.toString().toLowerCase() || '';
        
        if (fullString.includes('$') || headerLower.includes('dollar') || headerLower.includes('dolar')) detectedUnit = '$';
        else if (fullString.includes('%') || headerLower.includes('yüzde') || headerLower.includes('percent')) detectedUnit = '%';
        else if (fullString.includes('€')) detectedUnit = '€';
        else if (fullString.includes('tl') || headerLower.includes('tutar') || headerLower.includes('fiyat')) detectedUnit = 'TL';

        const validNumericCount = samples.filter(s => {
          const n = parseNumeric(s);
          return !isNaN(n) && (n !== 0 || s.toString().includes('0'));
        }).length;

        if (validNumericCount > samples.length * 0.6) {
          detectedType = 'number';
          hasNumbers = true;
        } else if (samples.every(s => !isNaN(Date.parse(s)) && s.toString().length > 5)) {
          detectedType = 'date';
        }

        if (headerLower.includes('tarih') || headerLower.includes('date') || headerLower.includes('ay') || headerLower.includes('month')) semanticRole = 'dimension_time';
        else if (headerLower.includes('kategori') || headerLower.includes('category') || headerLower.includes('ürün') || headerLower.includes('product')) semanticRole = 'dimension_category';
        else if (headerLower.includes('toplam') || headerLower.includes('total') || headerLower.includes('revenue') || headerLower.includes('gelir') || headerLower.includes('tutar') || headerLower.includes('satış')) semanticRole = 'measure_primary';
        else if (headerLower.includes('durum') || headerLower.includes('status')) semanticRole = 'dimension_status';
      }

      return {
        index: i,
        name: header,
        type: detectedType,
        isNumeric: hasNumbers,
        unit: detectedUnit,
        role: semanticRole,
        sampleValues: samples.slice(0, 3)
      };
    });

    return {
      sheetName: sourceName,
      headers,
      columnStats,
      rowCount,
      columnCount: headers.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error(`Analiz hatası: ${error.message}`);
  }
}

export function formatMetadataForPrompt(metadata) {
  if (!metadata || !metadata.columnStats) {
    return "Hata: Analiz verileri eksik.";
  }

  const tagPairs = metadata.columnStats.map(c => {
    const cleanTag = c.name.toString().toLowerCase().trim()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/\s+/g, '_');
    return { tag: cleanTag, col: c };
  });

  const tagWhitelist = tagPairs.map(p => `{{${p.tag}}}`).join(', ');

  return `
Source: ${metadata.sheetName}
Rows: ${metadata.rowCount}

COLUMNS:
${tagPairs.map(p => `- "{{${p.tag}}}": ${p.col.name} (${p.col.type}, ${p.col.role}), Unit: ${p.col.unit || 'none'}, Samples: ${p.col.sampleValues.join(', ')}`).join('\n')}

ALLOWED TAGS (whitelist — use ONLY these column tags, plus {{TITLE}}, {{TOTAL_ROWS}}, {{SHEET_NAME}}, {{COL_N}}, {{HEADER_N}}, {{LATEST_N}}):
${tagWhitelist}

DO NOT invent tags like {{q1_total}}, {{total_revenue}}, {{average_x}}, {{count_y}} — they will render as literal {{...}} text on screen because the engine performs no aggregation.
  `.trim();
}
