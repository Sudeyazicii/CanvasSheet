import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 🔍 REA (Reverse Engineer Anything) İLHAMLI
// SQLite Veritabanı İnceleme ve MCP Sunucusu
// ==========================================

const DB_PATH = path.join(__dirname, 'sample.db');

// Örnek SQLite Veritabanı Başlatma (Yoksa otomatik oluşturulur)
function initSampleDatabase() {
  const db = new DatabaseSync(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Urun_Adi TEXT,
      Kategori TEXT,
      Satis_Tutari REAL,
      Adet INTEGER,
      Bolge TEXT,
      Musteri_Tipi TEXT,
      Tarih TEXT,
      Durum TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Sirket_Adi TEXT,
      Sektor TEXT,
      Yillik_Ciro REAL,
      Calisan_Sayisi INTEGER,
      Sehir TEXT,
      Abonelik_Paketi TEXT,
      Memnuniyet_Skoru REAL
    );

    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Gorev_ID TEXT,
      Uzay_Araci TEXT,
      Hedef_Gezegen TEXT,
      Yakit_Durumu TEXT,
      Murettebat TEXT,
      Durum TEXT
    );
  `);

  // Eğer sales tablosu boşsa örnek verileri doldur
  const countStmt = db.prepare('SELECT COUNT(*) as cnt FROM sales');
  const countResult = countStmt.get();

  if (countResult && countResult.cnt === 0) {
    console.log('📦 [REA-MCP] Örnek SQLite veritabanı tabloları dolduruluyor...');

    db.exec(`
      INSERT INTO sales (Urun_Adi, Kategori, Satis_Tutari, Adet, Bolge, Musteri_Tipi, Tarih, Durum) VALUES
      ('MacBook Pro M3 Max', 'Donanım & Laptop', 89900.00, 14, 'Marmara', 'Kurumsal', '2026-03-01', 'Teslim Edildi'),
      ('Dell XPS 15 OLED', 'Donanım & Laptop', 64500.00, 9, 'İç Anadolu', 'KOBİ', '2026-03-02', 'Teslim Edildi'),
      ('Ergonomik Yönetici Koltuğu', 'Ofis & Mobilya', 14200.00, 28, 'Ege', 'Bireysel', '2026-03-03', 'Teslim Edildi'),
      ('AirPods Pro 2', 'Aksesuar & Ses', 8400.00, 75, 'Marmara', 'Bireysel', '2026-03-04', 'Teslim Edildi'),
      ('LG UltraFine 4K 32"', 'Görüntü & Monitör', 26800.00, 22, 'Akdeniz', 'Kurumsal', '2026-03-05', 'Kargoda'),
      ('Logitech MX Master 3S', 'Aksesuar', 3900.00, 54, 'Marmara', 'KOBİ', '2026-03-06', 'Teslim Edildi'),
      ('Keychron Q1 Pro Klavye', 'Aksesuar', 6200.00, 36, 'Ege', 'Bireysel', '2026-03-07', 'Teslim Edildi'),
      ('Herman Miller Aeron', 'Ofis & Mobilya', 42000.00, 8, 'Marmara', 'Kurumsal', '2026-03-08', 'Teslim Edildi'),
      ('Sony WH-1000XM5', 'Aksesuar & Ses', 12900.00, 31, 'Karadeniz', 'Bireysel', '2026-03-09', 'Teslim Edildi'),
      ('iPad Pro 13" M4', 'Tablet & Mobil', 49900.00, 18, 'İç Anadolu', 'KOBİ', '2026-03-10', 'Kargoda'),
      ('Synology NAS 4-Bay', 'Sunucu & Depolama', 34500.00, 11, 'Marmara', 'Kurumsal', '2026-03-11', 'Teslim Edildi'),
      ('Samsung Odyssey OLED G9', 'Görüntü & Monitör', 44000.00, 7, 'Ege', 'Bireysel', '2026-03-12', 'İade'),
      ('Asus ROG Zephyrus G16', 'Donanım & Laptop', 78900.00, 12, 'Marmara', 'Kurumsal', '2026-03-13', 'Teslim Edildi'),
      ('Steelcase Gesture Koltuk', 'Ofis & Mobilya', 36500.00, 15, 'Akdeniz', 'Kurumsal', '2026-03-14', 'Teslim Edildi'),
      ('Anker 737 PowerBank 140W', 'Aksesuar', 4600.00, 85, 'Güneydoğu Anadolu', 'Bireysel', '2026-03-15', 'Teslim Edildi');

      INSERT INTO customers (Sirket_Adi, Sektor, Yillik_Ciro, Calisan_Sayisi, Sehir, Abonelik_Paketi, Memnuniyet_Skoru) VALUES
      ('NovaTech Bilişim A.Ş.', 'Yazılım & Teknoloji', 18500000.00, 85, 'İstanbul', 'Enterprise', 4.9),
      ('Ege Lojistik Grubu', 'Taşımacılık & Tedarik', 32000000.00, 240, 'İzmir', 'Pro', 4.6),
      ('Anadolu Finans Danışmanlık', 'Bankacılık & Finans', 12400000.00, 45, 'Ankara', 'Enterprise', 4.8),
      ('Akdeniz Otelcilik A.Ş.', 'Turizm & Hizmet', 45000000.00, 520, 'Antalya', 'Pro', 4.3),
      ('Trend Perakende Mağazacılık', 'E-Ticaret & Perakende', 28000000.00, 190, 'Bursa', 'Enterprise', 4.7);

      INSERT INTO missions (Gorev_ID, Uzay_Araci, Hedef_Gezegen, Yakit_Durumu, Murettebat, Durum) VALUES
      ('O-1', 'Orion-X', 'Mars', '%92', '5 Kişi', 'İniş Yapıldı'),
      ('V-9', 'Voyager-3', 'Satürn', '%45', 'Robotik', 'Halkada'),
      ('S-X', 'Starship Alpha', 'Ay', '%78', '12 Kişi', 'Yörüngede'),
      ('A-11', 'Apollo-24', 'Jüpiter', '%60', '3 Kişi', 'Yolda'),
      ('N-5', 'Nova-Probe', 'Güneş', '%88', 'Robotik', 'Veri Topluyor');
    `);
  }

  return db;
}

const sampleDb = initSampleDatabase();

// ==========================================
// 🔍 REA TARZI SQLITE İNCELEME YARDIMCISI
// ==========================================
function inspectDatabase(db) {
  // SQLite tablolarını listele (sqlite_master)
  const tablesStmt = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);
  const tables = tablesStmt.all();

  const inventory = tables.map(t => {
    const tableName = t.name;
    // Kolon bilgilerini al (PRAGMA table_info)
    const infoStmt = db.prepare(`PRAGMA table_info("${tableName}")`);
    const columns = infoStmt.all().map(c => ({
      name: c.name,
      type: c.type,
      notnull: !!c.notnull,
      isPk: !!c.pk
    }));

    // Satır sayısını al
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const count = countStmt.get()?.count || 0;

    return {
      name: tableName,
      columns,
      rowCount: count
    };
  });

  return inventory;
}

// ==========================================
// 📡 API ENDPOINTS
// ==========================================

// 1. Healthcheck & REA Durum Bilgisi
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'REA (Reverse Engineer Anything) SQLite MCP Server',
    database: 'SQLite 3 (node:sqlite DatabaseSync)',
    dbPath: DB_PATH,
    timestamp: new Date().toISOString()
  });
});

// 2. Tablo Envanteri ve Şema (REA inspect_sqlite_database mantığı)
app.get('/api/mcp/sqlite/inspect', (req, res) => {
  try {
    const inventory = inspectDatabase(sampleDb);
    res.json({
      success: true,
      tables: inventory,
      databasePath: DB_PATH
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Tablo Listesi (Basit dizi)
app.get('/api/mcp/sqlite/tables', (req, res) => {
  try {
    const inventory = inspectDatabase(sampleDb);
    res.json(inventory.map(i => i.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Tablo Verisi Çekme (SheetCanvas 2D Array formatında)
// Örn: GET /api/mcp/sqlite/data?table=sales
app.get('/api/mcp/sqlite/data', (req, res) => {
  try {
    const tableName = req.query.table || 'sales';
    const limit = parseInt(req.query.limit, 10) || 1000;

    // Güvenlik doğrulaması: Tablo ismini whitelist kontrolünden geçir
    const validTables = inspectDatabase(sampleDb).map(t => t.name);
    if (!validTables.includes(tableName)) {
      return res.status(400).json({ error: `Geçersiz tablo adı: ${tableName}. Mevcut tablolar: ${validTables.join(', ')}` });
    }

    const stmt = sampleDb.prepare(`SELECT * FROM "${tableName}" LIMIT ?`);
    const rows = stmt.all(limit);

    if (rows.length === 0) {
      return res.json([[]]);
    }

    const headers = Object.keys(rows[0]);
    const matrix = [headers, ...rows.map(r => headers.map(h => r[h]))];

    console.log(`📡 [REA-MCP] "${tableName}" tablosundan ${rows.length} satır veri gönderildi.`);
    res.json(matrix);
  } catch (err) {
    console.error('SQLite veri çekme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Geriye Uyumluluk İçin Standart MCP Kaynak Endpoint'i
app.get('/api/mcp/resource', (req, res) => {
  try {
    const tableName = req.query.table || 'sales';
    const stmt = sampleDb.prepare(`SELECT * FROM "${tableName}"`);
    const rows = stmt.all();

    if (rows.length === 0) {
      return res.json([[]]);
    }

    const headers = Object.keys(rows[0]);
    const matrix = [headers, ...rows.map(r => headers.map(h => r[h]))];

    console.log(`📡 [REA-MCP] /api/mcp/resource -> ${matrix.length - 1} satır gönderildi.`);
    res.json(matrix);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Özel SQL Sorgusu Çalıştırma (Örn: Filtreli dashboard veya özel metrikler)
app.post('/api/mcp/sqlite/query', (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Geçersiz SQL sorgusu.' });
    }

    // Yalnızca SELECT sorgularına izin ver (Güvenli Okuma Modu)
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('PRAGMA') && !trimmed.startsWith('WITH')) {
      return res.status(403).json({ error: 'Yalnızca okuma (SELECT) sorguları desteklenir.' });
    }

    const stmt = sampleDb.prepare(query);
    const rows = stmt.all();

    if (rows.length === 0) {
      return res.json({ headers: [], rows: [], matrix: [[]] });
    }

    const headers = Object.keys(rows[0]);
    const matrix = [headers, ...rows.map(r => headers.map(h => r[h]))];

    res.json({
      success: true,
      rowCount: rows.length,
      headers,
      matrix
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [REA SQLite MCP Server] Başlatıldı: http://localhost:${PORT}`);
  console.log(`🔍 REA Motoru: node:sqlite DatabaseSync`);
  console.log(`📂 Veritabanı Dosyası: ${DB_PATH}`);
  console.log(`📡 Canlı Endpoint'ler:`);
  console.log(`   - Durum Kontrolü : http://localhost:${PORT}/api/health`);
  console.log(`   - Tablo İnceleme : http://localhost:${PORT}/api/mcp/sqlite/inspect`);
  console.log(`   - Satış Verileri : http://localhost:${PORT}/api/mcp/sqlite/data?table=sales`);
  console.log(`   - Müşteri Verisi : http://localhost:${PORT}/api/mcp/sqlite/data?table=customers`);
  console.log(`   - Standart Kaynak: http://localhost:${PORT}/api/mcp/resource`);
  console.log(`======================================================\n`);
});
