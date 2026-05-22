import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 🌌 CANLI MCP TEST VERİLERİ (Uzay Teması)
// ==========================================
let databaseData = [
  ["Gorev_ID", "Uzay_Aracı", "Hedef_Gezegen", "Yakit_Durumu", "Murettebat", "Durum"],
  ["O-1", "Orion-X", "Mars", "%92", "5 Kişi", "İniş Yapıldı"],
  ["V-9", "Voyager-3", "Satürn", "%45", "Robotik", "Halkada"],
  ["S-X", "Starship", "Ay", "%15", "12 Kişi", "Yörüngede"],
  ["A-11", "Apollo-24", "Jüpiter", "%60", "3 Kişi", "Yolda"],
  ["N-5", "Nova-Probe", "Güneş", "%88", "Robotik", "Veri Topluyor"]
];

// 📡 API ENDPOINTS
app.get('/api/mcp/resource', (req, res) => {
  console.log('📡 [MCP] Uzay Görev Verileri Dashboard\'a gönderiliyor...');
  res.json(databaseData);
});

app.listen(PORT, () => {
  console.log(`🚀 [MCP Server] Başlatıldı: http://localhost:${PORT}`);
  console.log(`📡 Canlı Veri Modu: Uzay Operasyonları`);
});
