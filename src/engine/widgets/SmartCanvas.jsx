import { useMemo } from 'react';

/**
 * SmartCanvas Widget
 * Gemini tarafından üretilen ham HTML ve Tailwind CSS kodlarını render eder.
 * Statik tasarım İÇERMEZ, her şey Gemini'den gelir.
 */
export default function SmartCanvas({ title, sheetData, config }) {
  const renderedContent = useMemo(() => {
    if (!config?.htmlTemplate) return '<div style="color: #94A3B8; padding: 20px;">Tasarım bekleniyor...</div>';
    if (!sheetData || sheetData.length === 0) return '<div style="color: #94A3B8; padding: 20px;">Veri bekleniyor...</div>';

    let html = config.htmlTemplate;

    // Basit Veri Yerleştirme (Data Injection)
    // {{COL_0}}, {{COL_1}}, {{TITLE}}, {{TOTAL_ROWS}} gibi placeholder'ları değiştirir
    const rawHeaders = sheetData[0] || [];
    const headers = rawHeaders.map((h, i) => {
      if (!h || h.toString().trim() === '') {
        return i === 0 ? 'Kategori' : `Sutun_${i}`;
      }
      return h;
    });
    const rows = sheetData.slice(1);
    
    // Değişkenleri tanımla
    const variables = {
      '{{TITLE}}': title || '',
      '{{TOTAL_ROWS}}': rows.length,
      '{{SHEET_NAME}}': config.sheetName || '',
    };

    // Sütun bazlı değişkenler
    headers.forEach((header, i) => {
      const cleanHeader = header.toString().toLowerCase().trim()
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/\s+/g, '_');
      
      variables[`{{HEADER_${i}}}`] = header;
      variables[`{{${cleanHeader}}}`] = rows.length > 0 ? rows[rows.length - 1][i] : '';
      
      if (rows.length > 0) {
        variables[`{{LATEST_${i}}}`] = rows[rows.length - 1][i];
      }
    });

    // 1. Önce Döngüleri (Loop) işle (Çünkü döngüler içindeki {{etiket}}'ler her satıra özeldir)
    if (html.includes('{{LOOP_START}}') && html.includes('{{LOOP_END}}')) {
      const parts = html.split(/{{LOOP_START}}|{{LOOP_END}}/);
      const before = parts[0];
      const loopTemplate = parts[1];
      const after = parts[2];
      
      const renderRows = rows.slice(0, 20);
      
      const loopHtml = renderRows.map(row => {
        let itemHtml = loopTemplate;
        row.forEach((cell, i) => {
          const cleanHeader = headers[i]?.toString().toLowerCase().trim()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
            .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/\s+/g, '_');
            
          const colRegex = new RegExp(`\\{\\{COL_${i}\\}\\}`, 'gi');
          itemHtml = itemHtml.replace(colRegex, cell || '');
          
          if (cleanHeader) {
            // Sadece bu satıra özel olan etiketi değiştir
            const tagRegex = new RegExp(`\\{\\{${cleanHeader}\\}\\}`, 'gi');
            itemHtml = itemHtml.replace(tagRegex, cell || '');
          }
        });
        return itemHtml;
      }).join('');
      
      html = before + loopHtml + after;
    }

    // 2. Sonra Global Değişkenleri işle (KPI'lar, Başlıklar vb. - Bunlar en son veriyi kullanır)
    Object.entries(variables).forEach(([key, val]) => {
      const regexKey = key.replace(/[{}]/g, '\\$&');
      const regex = new RegExp(regexKey, 'gi');
      html = html.replace(regex, val || '');
    });

    return html;
  }, [title, sheetData, config]);

  return (
    <div 
      className="smart-canvas-container"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
      style={{ width: '100%' }}
    />
  );
}
