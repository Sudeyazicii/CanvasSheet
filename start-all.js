import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 [SheetCanvas] Hem REA SQLite MCP Sunucusu hem Vite Başlatılıyor...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. MCP SQLite Sunucusu (Port 3001)
const mcp = spawn('node', ['server/mcp-server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 2. Vite Frontend Sunucusu (Port 5173)
const vite = spawn(npmCmd, ['run', 'dev', '--', '--host'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n🛑 Servisler durduruluyor...');
  try { mcp.kill(); } catch (e) {}
  try { vite.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
