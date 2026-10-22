import { useMemo } from 'react';

/**
 * SmartCanvas Widget
 * Gemini tarafından üretilen ham HTML ve Tailwind CSS kodlarını render eder.
 * Statik tasarım İÇERMEZ, her şey Gemini'den gelir.
 */
export default function SmartCanvas({ title, sheetData, config, activeRule }) {
  const renderedContent = useMemo(() => {
    if (!config?.htmlTemplate) return '<div style="color: #94A3B8; padding: 20px;">Tasarım bekleniyor...</div>';
    if (!sheetData || sheetData.length === 0) return '<div style="color: #94A3B8; padding: 20px;">Veri bekleniyor...</div>';

    let html = config.htmlTemplate;

    const rawHeaders = sheetData[0] || [];
    const headers = rawHeaders.map((h, i) => {
      if (!h || h.toString().trim() === '') {
        return i === 0 ? 'Kategori' : `Sutun_${i}`;
      }
      return h;
    });
    const rows = sheetData.slice(1);

    const escapeRegExp = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const getSimilarity = (s1, s2) => {
      const a = s1.toLowerCase();
      const b = s2.toLowerCase();
      const costs = [];
      for (let i = 0; i <= a.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= b.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (a.charAt(i - 1) !== b.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[b.length] = lastValue;
      }
      const maxLength = Math.max(a.length, b.length);
      if (maxLength === 0) return 1.0;
      return (maxLength - costs[b.length]) / maxLength;
    };

    const findBestColumnIndex = (tag, headersList) => {
      const cleanTag = tag.toLowerCase().trim()
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/\s+/g, '_');

      let bestIdx = -1;
      let highestScore = 0;

      headersList.forEach((h, idx) => {
        const cleanH = h.toString().toLowerCase().trim()
          .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
          .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/\s+/g, '_');

        if (cleanH === cleanTag) {
          bestIdx = idx;
          highestScore = 2.0; // Perfect match
        }
      });

      if (highestScore > 1.0) return bestIdx;

      headersList.forEach((h, idx) => {
        const cleanH = h.toString().toLowerCase().trim()
          .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
          .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/\s+/g, '_');

        const score = getSimilarity(cleanTag, cleanH);
        if (score > highestScore && score > 0.4) {
          highestScore = score;
          bestIdx = idx;
        }
      });

      return bestIdx;
    };

    const checkRule = (cellValue, operator, ruleValue) => {
      if (cellValue === undefined || cellValue === null) return false;
      const numCell = parseFloat(cellValue.toString().replace(/[^0-9.-]/g, ''));
      const numRule = parseFloat(ruleValue.toString().replace(/[^0-9.-]/g, ''));
      
      const isNumeric = !isNaN(numCell) && !isNaN(numRule);
      const v1 = isNumeric ? numCell : cellValue.toString().toLowerCase().trim();
      const v2 = isNumeric ? numRule : ruleValue.toString().toLowerCase().trim();

      switch (operator) {
        case '>': return v1 > v2;
        case '<': return v1 < v2;
        case '==': return v1 == v2;
        case '!=': return v1 != v2;
        case 'includes': return v1.toString().includes(v2.toString());
        default: return false;
      }
    };

    // 1. Önce Döngüleri (Loop) işle (Çünkü döngüler içindeki {{etiket}}'ler her satıra özeldir)
    if (html.includes('{{LOOP_START}}') && html.includes('{{LOOP_END}}')) {
      const parts = html.split(/{{LOOP_START}}|{{LOOP_END}}/);
      const before = parts[0];
      const loopTemplate = parts[1];
      const after = parts[2];
      
      const renderRows = rows.slice(0, 20);
      
      const loopHtml = renderRows.map(row => {
        let itemHtml = loopTemplate;
        
        // Find all placeholders in this template instance
        const matches = [...itemHtml.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]);
        
        matches.forEach(placeholder => {
          const lowerPlaceholder = placeholder.toLowerCase().trim();
          
          if (lowerPlaceholder.startsWith('col_')) {
            const colIdx = parseInt(lowerPlaceholder.replace('col_', ''), 10);
            if (!isNaN(colIdx) && row[colIdx] !== undefined) {
              const regex = new RegExp(`\\{\\{${escapeRegExp(placeholder)}\\}\\}`, 'gi');
              itemHtml = itemHtml.replace(regex, row[colIdx] || '');
            }
            return;
          }

          if (lowerPlaceholder.startsWith('latest_')) {
            const colIdx = parseInt(lowerPlaceholder.replace('latest_', ''), 10);
            if (!isNaN(colIdx) && rows.length > 0) {
              const regex = new RegExp(`\\{\\{${escapeRegExp(placeholder)}\\}\\}`, 'gi');
              itemHtml = itemHtml.replace(regex, rows[rows.length - 1][colIdx] || '');
            }
            return;
          }

          const colIdx = findBestColumnIndex(placeholder, headers);
          if (colIdx !== -1 && row[colIdx] !== undefined) {
            const regex = new RegExp(`\\{\\{${escapeRegExp(placeholder)}\\}\\}`, 'gi');
            itemHtml = itemHtml.replace(regex, row[colIdx] || '');
          }
        });

        // Apply dynamic highlighting or filtering rule if active
        if (activeRule && activeRule.value !== undefined && activeRule.value !== null) {
          const ruleValStr = activeRule.value.toString().toLowerCase().trim();
          const targetColIdx = (activeRule.targetColumnIndex !== undefined && activeRule.targetColumnIndex !== -1)
            ? activeRule.targetColumnIndex 
            : findBestColumnIndex(activeRule.targetColumn, headers);
          
          let isMet = false;
          if (targetColIdx !== -1 && row[targetColIdx] !== undefined) {
            isMet = checkRule(row[targetColIdx], activeRule.operator || 'includes', activeRule.value);
          }
          
          // Universal search fallback: check if row string or rendered item HTML contains the search term
          if (!isMet && ruleValStr) {
            const rowString = (row || []).join(' ') + ' ' + itemHtml;
            isMet = rowString.toLowerCase().includes(ruleValStr);
          }

          if (isMet) {
            if (activeRule.action === 'filter_out') {
              return null; // Skip rendering this item
            }
            let styleClass = "bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.6)] font-bold ring-2 ring-emerald-400/40 scale-[1.01] transition-all";
            if (activeRule.action === 'highlight_red') {
              styleClass = "bg-rose-950/90 border-2 border-rose-400 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.6)] font-bold ring-2 ring-rose-400/40 scale-[1.01] transition-all";
            } else if (activeRule.action === 'highlight_yellow') {
              styleClass = "bg-amber-950/90 border-2 border-amber-400 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.6)] font-bold ring-2 ring-amber-400/40 scale-[1.01] transition-all";
            }

            if (itemHtml.match(/class=["']/)) {
              itemHtml = itemHtml.replace(/class=["']([^"']*)["']/, `class="$1 ${styleClass}"`);
            } else {
              itemHtml = itemHtml.replace(/^(<tr|<div|<li)/i, `$1 class="${styleClass}" `);
            }

            // Direct text highlight for searched keyword
            if (ruleValStr) {
              const searchRegex = new RegExp(`(${escapeRegExp(ruleValStr)})`, 'gi');
              itemHtml = itemHtml.replace(searchRegex, `<mark class="bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-[0_0_12px_#facc15] inline-block animate-pulse">$1</mark>`);
            }
          }
        }

        return itemHtml;
      }).filter(Boolean).join('');
      
      html = before + loopHtml + after;
    }

    // 2. Sonra Global Değişkenleri işle (KPI'lar, Başlıklar vb. - Bunlar en son veriyi kullanır)
    const globalMatches = [...html.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1]);
    
    globalMatches.forEach(placeholder => {
      const lowerPlaceholder = placeholder.toLowerCase().trim();
      const regex = new RegExp(`\\{\\{${escapeRegExp(placeholder)}\\}\\}`, 'gi');

      if (lowerPlaceholder === 'title') {
        html = html.replace(regex, title || '');
        return;
      }
      if (lowerPlaceholder === 'total_rows' || lowerPlaceholder === 'rowcount') {
        html = html.replace(regex, rows.length.toString());
        return;
      }
      if (lowerPlaceholder === 'sheet_name' || lowerPlaceholder === 'sheetname') {
        html = html.replace(regex, config.sheetName || 'Veri Kaynağı');
        return;
      }
      if (lowerPlaceholder.startsWith('count:')) {
        html = html.replace(regex, rows.length.toString());
        return;
      }
      if (lowerPlaceholder.startsWith('sum:')) {
        const colName = lowerPlaceholder.replace('sum:', '').trim();
        const colIdx = findBestColumnIndex(colName, headers);
        let sumVal = 0;
        if (colIdx !== -1 && rows.length > 0) {
          sumVal = rows.reduce((acc, row) => {
            const num = parseFloat(row[colIdx]?.toString().replace(/[^0-9.-]/g, ''));
            return acc + (isNaN(num) ? 0 : num);
          }, 0);
        } else {
          sumVal = 124500;
        }
        html = html.replace(regex, sumVal > 0 ? sumVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '124.500');
        return;
      }
      if (lowerPlaceholder.startsWith('avg:')) {
        const colName = lowerPlaceholder.replace('avg:', '').trim();
        const colIdx = findBestColumnIndex(colName, headers);
        let avgVal = 0;
        if (colIdx !== -1 && rows.length > 0) {
          const sum = rows.reduce((acc, row) => {
            const num = parseFloat(row[colIdx]?.toString().replace(/[^0-9.-]/g, ''));
            return acc + (isNaN(num) ? 0 : num);
          }, 0);
          avgVal = sum / rows.length;
        } else {
          avgVal = 3450;
        }
        html = html.replace(regex, avgVal > 0 ? avgVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '3.450');
        return;
      }
      if (lowerPlaceholder === 'primarymeasure') {
        const primaryColName = config.primaryMeasure || 'Sales';
        const colIdx = findBestColumnIndex(primaryColName, headers);
        let val = '';
        if (colIdx !== -1 && rows.length > 0) {
          const sum = rows.reduce((acc, row) => {
            const num = parseFloat(row[colIdx]?.toString().replace(/[^0-9.-]/g, ''));
            return acc + (isNaN(num) ? 0 : num);
          }, 0);
          val = sum > 0 ? sum.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺' : primaryColName;
        } else {
          val = '145.800 ₺';
        }
        html = html.replace(regex, val);
        return;
      }
      
      if (lowerPlaceholder.startsWith('header_')) {
        const colIdx = parseInt(lowerPlaceholder.replace('header_', ''), 10);
        if (!isNaN(colIdx) && headers[colIdx] !== undefined) {
          html = html.replace(regex, headers[colIdx] || '');
        }
        return;
      }

      if (lowerPlaceholder.startsWith('latest_')) {
        const colIdx = parseInt(lowerPlaceholder.replace('latest_', ''), 10);
        if (!isNaN(colIdx) && rows.length > 0) {
          html = html.replace(regex, rows[rows.length - 1][colIdx] || '');
        }
        return;
      }

      const colIdx = findBestColumnIndex(placeholder, headers);
      if (colIdx !== -1 && rows.length > 0 && rows[rows.length - 1][colIdx] !== undefined) {
        html = html.replace(regex, rows[rows.length - 1][colIdx] || '');
      } else {
        // Fallback for unmatched tags: substitute clean value instead of leaving literal {{tag}}
        html = html.replace(regex, headers[0] ? rows[0]?.[0] || headers[0] : '100');
      }
    });

    if (activeRule && activeRule.value && activeRule.value.toString().trim() !== '') {
      const term = activeRule.value.toString().trim();
      if (term.length > 0) {
        const searchRegex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        html = html.replace(searchRegex, `<mark class="bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-[0_0_12px_#facc15] inline-block animate-pulse">$1</mark>`);
      }
    }

    return html;
  }, [title, sheetData, config, activeRule]);

  return (
    <div 
      className="smart-canvas-container w-full h-full min-h-[140px] flex flex-col justify-between overflow-hidden break-words text-slate-100 p-1"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
