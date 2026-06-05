import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.WEB_PORT || 3100;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.pdf':  'application/pdf',
  '.md':   'text/plain; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
};

function send(res, status, body, type = 'application/json') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(payload);
}

function readFile(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return null; }
}

function writeFile(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');
}

function listDir(rel, ext) {
  try {
    return fs.readdirSync(path.join(ROOT, rel))
      .filter(f => !ext || f.endsWith(ext))
      .map(f => ({ name: f, path: path.join(rel, f) }));
  } catch { return []; }
}

function parseReportMeta(content, filePath) {
  const lines = content.split('\n').slice(0, 20);
  const get = (key) => {
    const line = lines.find(l => l.toLowerCase().startsWith(`**${key.toLowerCase()}:**`));
    return line ? line.replace(/^\*\*[^*]+\*\*:\s*/i, '').trim() : '';
  };
  const nameMatch = path.basename(filePath).match(/^(\d+)-(.+?)-(\d{4}-\d{2}-\d{2})\.md$/);
  return {
    num:         nameMatch ? nameMatch[1] : '',
    company:     get('company') || (nameMatch ? nameMatch[2].replace(/-/g,' ') : ''),
    role:        get('role') || get('position') || '',
    score:       get('score') || get('global score') || '',
    status:      get('status') || 'Evaluated',
    date:        nameMatch ? nameMatch[3] : get('date') || '',
    legitimacy:  get('legitimacy') || '',
    path:        filePath,
  };
}

function parseApplications() {
  const md = readFile('data/applications.md');
  if (!md) return [];
  const rows = [];
  for (const line of md.split('\n')) {
    if (!line.startsWith('|') || line.includes('---') || line.toLowerCase().includes('company')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 4) continue;
    const linkMatch = cells[7]?.match(/\[(\d+)\]\(([^)]+)\)/);
    rows.push({
      num:         cells[0] || '',
      date:        cells[1] || '',
      company:     cells[2] || '',
      role:        cells[3] || '',
      score:       cells[4] || '',
      status:      cells[5] || '',
      pdf:         cells[6] || '',
      report_path: linkMatch ? linkMatch[2] : '',
      notes:       cells[8] || '',
    });
  }
  return rows;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── Static files ──────────────────────────────────────────
  if (req.method === 'GET' && !pathname.startsWith('/api/')) {
    const target = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.resolve(path.join(ROOT, 'web'), target.slice(1));
    if (!safePath.startsWith(path.join(ROOT, 'web'))) { send(res, 403, 'Forbidden', 'text/plain'); return; }
    try {
      const data = fs.readFileSync(safePath);
      const ext  = path.extname(safePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    } catch { send(res, 404, 'Not found', 'text/plain'); }
    return;
  }

  // ── API ───────────────────────────────────────────────────
  let body = '';
  req.on('data', d => { body += d; if (body.length > 5e6) req.destroy(); });
  req.on('end', () => {
    let json = {};
    try { json = body ? JSON.parse(body) : {}; } catch {}

    // GET /api/version
    if (req.method === 'GET' && pathname === '/api/version') {
      const v = readFile('VERSION');
      send(res, 200, { version: (v || '').trim() });
      return;
    }

    // GET /api/cv?lang=en|de
    if (req.method === 'GET' && pathname === '/api/cv') {
      const lang = url.searchParams.get('lang') || 'en';
      const file = lang === 'de' ? 'cv.de.md' : 'cv.md';
      const content = readFile(file);
      if (!content) { send(res, 404, 'Not found', 'text/plain'); return; }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(content);
      return;
    }

    // POST /api/cv
    if (req.method === 'POST' && pathname === '/api/cv') {
      if (!json.content) { send(res, 400, { error: 'content required' }); return; }
      writeFile('cv.md', json.content);
      send(res, 200, { ok: true });
      return;
    }

    // GET /api/profile
    if (req.method === 'GET' && pathname === '/api/profile') {
      const raw = readFile('config/profile.yml');
      if (!raw) { send(res, 404, { error: 'profile.yml not found' }); return; }
      try { send(res, 200, yaml.load(raw)); } catch { send(res, 500, { error: 'parse error' }); }
      return;
    }

    // POST /api/profile
    if (req.method === 'POST' && pathname === '/api/profile') {
      const existing = readFile('config/profile.yml') || '';
      let profile = {};
      try { profile = yaml.load(existing) || {}; } catch {}

      profile.candidate = {
        full_name:  json.full_name  || profile.candidate?.full_name  || '',
        email:      json.email      || profile.candidate?.email       || '',
        phone:      json.phone      || profile.candidate?.phone       || '',
        location:   json.location   || profile.candidate?.location    || '',
        linkedin:   json.linkedin   || profile.candidate?.linkedin    || '',
        github:     json.github     || profile.candidate?.github      || '',
      };

      if (json.headline) {
        profile.narrative = profile.narrative || {};
        profile.narrative.headline = json.headline;
      }

      if (json.target_roles?.length) {
        profile.target_roles = profile.target_roles || {};
        profile.target_roles.primary = json.target_roles;
      }

      if (json.scan_config) {
        profile.scan = profile.scan || {};
        if (json.scan_config.locations?.length)    profile.scan.location_filter = { always_allow: json.scan_config.locations };
        if (json.scan_config.min_score)            profile.scan.min_score = parseFloat(json.scan_config.min_score);
      }

      writeFile('config/profile.yml', yaml.dump(profile, { lineWidth: 120 }));
      send(res, 200, { ok: true });
      return;
    }

    // GET /api/applications
    if (req.method === 'GET' && pathname === '/api/applications') {
      send(res, 200, parseApplications());
      return;
    }

    // GET /api/reports
    if (req.method === 'GET' && pathname === '/api/reports') {
      const limit = parseInt(url.searchParams.get('limit')) || 999;
      const files = listDir('reports', '.md').reverse().slice(0, limit);
      const reports = files.map(f => {
        const content = readFile(f.path) || '';
        return parseReportMeta(content, f.path);
      });
      send(res, 200, reports);
      return;
    }

    // GET /api/report?path=...
    if (req.method === 'GET' && pathname === '/api/report') {
      const p = url.searchParams.get('path') || '';
      const safe = path.resolve(ROOT, p);
      if (!safe.startsWith(path.join(ROOT, 'reports')) && !safe.startsWith(path.join(ROOT, 'data'))) {
        send(res, 403, 'Forbidden', 'text/plain'); return;
      }
      const content = readFile(p);
      if (!content) { send(res, 404, 'Not found', 'text/plain'); return; }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(content);
      return;
    }

    // GET /api/latest-report
    if (req.method === 'GET' && pathname === '/api/latest-report') {
      const files = listDir('reports', '.md').reverse();
      if (!files.length) { send(res, 404, { error: 'no reports' }); return; }
      const content = readFile(files[0].path) || '';
      send(res, 200, { content, ...parseReportMeta(content, files[0].path) });
      return;
    }

    // GET /api/outputs
    if (req.method === 'GET' && pathname === '/api/outputs') {
      const files = listDir('output', '.pdf').map(f => {
        const stat = fs.statSync(path.join(ROOT, f.path));
        const kb = Math.round(stat.size / 1024);
        return { ...f, size: `${kb} KB` };
      });
      send(res, 200, files);
      return;
    }

    // GET /api/output?path=...
    if (req.method === 'GET' && pathname === '/api/output') {
      const p = url.searchParams.get('path') || '';
      const safe = path.resolve(ROOT, p);
      if (!safe.startsWith(path.join(ROOT, 'output'))) { send(res, 403, 'Forbidden', 'text/plain'); return; }
      try {
        const data = fs.readFileSync(safe);
        res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${path.basename(p)}"` });
        res.end(data);
      } catch { send(res, 404, 'Not found', 'text/plain'); }
      return;
    }

    // GET /api/deepl-status
    if (req.method === 'GET' && pathname === '/api/deepl-status') {
      const env = readFile('.env') || '';
      const configured = env.includes('DEEPL_API_KEY=') && !env.includes('DEEPL_API_KEY=\n') && !env.includes('DEEPL_API_KEY=""');
      send(res, 200, { configured });
      return;
    }

    // POST /api/evaluate — SSE stream from claude -p
    if (req.method === 'POST' && pathname === '/api/evaluate') {
      const jobUrl = (json.url || '').trim();
      if (!jobUrl) { send(res, 400, { error: 'url required' }); return; }

      const prompt = `Read modes/_shared.md, modes/_profile.md, config/profile.yml, and cv.md. Then evaluate this job posting using the oferta mode: ${jobUrl}`;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      const child = spawn('claude', ['-p', prompt], { cwd: ROOT, env: { ...process.env } });

      child.stdout.on('data', chunk => {
        const text = chunk.toString();
        for (const line of text.split('\n')) {
          res.write(`data: ${line}\n\n`);
        }
      });

      child.stderr.on('data', chunk => {
        res.write(`data: [stderr] ${chunk.toString().trim()}\n\n`);
      });

      child.on('close', () => {
        res.write('data: [DONE]\n\n');
        res.end();
      });

      req.on('close', () => { try { child.kill(); } catch {} });
      return;
    }

    // POST /api/generate-pdf
    if (req.method === 'POST' && pathname === '/api/generate-pdf') {
      const child = spawn('node', ['generate-pdf.mjs'], { cwd: ROOT });
      let out = '';
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        send(res, code === 0 ? 200 : 500, { ok: code === 0, output: out });
      });
      return;
    }

    // POST /api/generate-lebenslauf
    if (req.method === 'POST' && pathname === '/api/generate-lebenslauf') {
      const template = json.template === 'classic' ? 'classic' : 'modern';
      const lang     = json.lang === 'en' ? 'en' : 'de';
      const child = spawn('node', ['generate-lebenslauf.mjs', '--template', template, '--lang', lang], { cwd: ROOT });
      let out = '';
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        send(res, code === 0 ? 200 : 500, { ok: code === 0, output: out });
      });
      return;
    }

    // POST /api/translate-cv
    if (req.method === 'POST' && pathname === '/api/translate-cv') {
      const child = spawn('node', ['translate-cv.mjs'], { cwd: ROOT });
      let out = '';
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        if (code !== 0) { send(res, 500, { error: out }); return; }
        const content = readFile('cv.de.md') || '';
        send(res, 200, { ok: true, content });
      });
      return;
    }

    // POST /api/scan
    if (req.method === 'POST' && pathname === '/api/scan') {
      const child = spawn('node', ['scan.mjs'], { cwd: ROOT });
      let out = '';
      child.stdout.on('data', d => { out += d; });
      child.stderr.on('data', d => { out += d; });
      child.on('close', code => {
        send(res, code === 0 ? 200 : 500, { ok: code === 0, message: code === 0 ? 'Scan complete — check data/pipeline.md for new URLs.' : 'Scan encountered errors.', output: out });
      });
      return;
    }

    send(res, 404, { error: 'Not found' });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`career-ops web UI → http://localhost:${PORT}`);
  console.log(`Setup wizard     → http://localhost:${PORT}/setup.html`);
  console.log('');
  console.log('Press Ctrl+C to stop.');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} in use. Set WEB_PORT=XXXX to use a different port.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
