const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function cleanup() {
  let files = fs.readdirSync(LOG_DIR).map(f => {
    const p = path.join(LOG_DIR, f);
    const stat = fs.statSync(p);
    return { path: p, mtime: stat.mtimeMs, size: stat.size };
  });
  let total = files.reduce((s, f) => s + f.size, 0);
  if (total <= 5 * 1024 * 1024) return;
  files.sort((a, b) => a.mtime - b.mtime);
  while (total > 1 * 1024 * 1024 && files.length) {
    const f = files.shift();
    try { fs.unlinkSync(f.path); } catch (_) {}
    total -= f.size;
  }
}

function log(msg) {
  ensureDir();
  cleanup();
  const file = path.join(LOG_DIR, new Date().toISOString().slice(0, 10) + '.log');
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(file, line);
}

module.exports = { log };
