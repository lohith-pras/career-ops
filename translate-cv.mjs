#!/usr/bin/env node

/**
 * translate-cv.mjs — Translate cv.md (English) → cv.de.md (German) via DeepL.
 *
 * Usage:
 *   node translate-cv.mjs                 # cv.md → cv.de.md (skips if cache fresh)
 *   node translate-cv.mjs --force         # ignore cache, always re-translate
 *   node translate-cv.mjs --source x.md --target x.de.md
 *
 * Requires DEEPL_API_KEY in .env (free-tier keys end in ":fx").
 *
 * Caching: skips translation if the target exists and is newer than the source.
 * Markdown structure (headings, lists, links, tables) is preserved — only the
 * text inside each line is sent to DeepL, leading markdown tokens are kept.
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env (optional — fall back to process.env if dotenv missing)
try {
  const { config } = await import('dotenv');
  config({ path: resolve(__dirname, '.env') });
} catch { /* dotenv not installed — rely on ambient env */ }

function parseArgs(argv) {
  const opts = { source: 'cv.md', target: 'cv.de.md', force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') opts.force = true;
    else if (a === '--source') opts.source = argv[++i];
    else if (a === '--target') opts.target = argv[++i];
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const sourcePath = resolve(__dirname, opts.source);
const targetPath = resolve(__dirname, opts.target);

const apiKey = process.env.DEEPL_API_KEY;
if (!apiKey) {
  console.error('❌ DEEPL_API_KEY not set. Add it to .env (see .env.example).');
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  console.error(`❌ Source not found: ${sourcePath}`);
  process.exit(1);
}

// Cache: skip if target is newer than source
if (!opts.force && existsSync(targetPath)) {
  const srcM = statSync(sourcePath).mtimeMs;
  const tgtM = statSync(targetPath).mtimeMs;
  if (tgtM >= srcM) {
    console.log(`✓ ${opts.target} is up to date (cache hit). Use --force to re-translate.`);
    process.exit(0);
  }
}

// Free-tier keys end in ":fx" and use the free endpoint.
const endpoint = apiKey.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

const source = readFileSync(sourcePath, 'utf-8');
const lines = source.split('\n');

/**
 * Split a markdown line into a leading structural prefix (untranslated) and the
 * translatable text. Keeps headings, list bullets, blockquotes, table pipes intact.
 * Lines that are pure structure (e.g. "---", "|---|---|") are not translated.
 */
function splitLine(line) {
  if (line.trim() === '') return { prefix: line, text: '', translate: false };
  // Horizontal rules / table separators / code fences — leave untouched
  if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) return { prefix: line, text: '', translate: false };
  if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-')) return { prefix: line, text: '', translate: false };
  if (/^\s*```/.test(line)) return { prefix: line, text: '', translate: false };
  // Leading markdown tokens: heading #, list -/*/+, ordered 1., blockquote >
  const m = line.match(/^(\s*(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)?)([\s\S]*)$/);
  return { prefix: m[1], text: m[2], translate: m[2].trim().length > 0 };
}

const parts = lines.map(splitLine);
const toTranslate = parts.filter(p => p.translate).map(p => p.text);

console.log(`🌐 Translating ${toTranslate.length} lines EN → DE via DeepL...`);

// DeepL accepts multiple `text` params per request (batch). Chunk to stay under limits.
const CHUNK = 50;
const translated = [];

for (let i = 0; i < toTranslate.length; i += CHUNK) {
  const batch = toTranslate.slice(i, i + CHUNK);
  const body = new URLSearchParams();
  body.append('source_lang', 'EN');
  body.append('target_lang', 'DE');
  body.append('preserve_formatting', '1');
  for (const t of batch) body.append('text', t);

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`❌ DeepL API error ${resp.status}: ${errText}`);
    process.exit(1);
  }

  const data = await resp.json();
  for (const tr of data.translations) translated.push(tr.text);
}

// Reassemble: walk parts, pulling translated text in order for translatable lines.
let ti = 0;
const outLines = parts.map(p => {
  if (!p.translate) return p.prefix;
  return p.prefix + (translated[ti++] ?? p.text);
});

writeFileSync(targetPath, outLines.join('\n'), 'utf-8');
console.log(`✅ Wrote ${opts.target} (${outLines.length} lines).`);
