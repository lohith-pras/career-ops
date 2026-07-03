#!/usr/bin/env node

/**
 * generate-lebenslauf.mjs — German CV (Lebenslauf) → PDF.
 *
 * Usage:
 *   node generate-lebenslauf.mjs --template modern|classic --lang de|en
 *
 * Reads the CV markdown (cv.de.md for --lang de, cv.md for --lang en), the
 * `candidate` + `lebenslauf` blocks from config/profile.yml, fills the chosen
 * template, then delegates rendering to generate-pdf.mjs (fonts + ATS-normalize).
 *
 * Output: output/lebenslauf-{template}-{lang}.pdf
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

function parseArgs(argv) {
  const opts = { template: 'modern', lang: 'de' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--template') opts.template = argv[++i];
    else if (argv[i] === '--lang') opts.lang = argv[++i];
  }
  if (!['modern', 'classic'].includes(opts.template)) opts.template = 'modern';
  if (!['de', 'en'].includes(opts.lang)) opts.lang = 'de';
  return opts;
}

const opts = parseArgs(process.argv.slice(2));

// ── Load CV markdown ────────────────────────────────────────────────────────
const cvFile = opts.lang === 'de' ? 'cv.de.md' : 'cv.md';
const cvPath = resolve(ROOT, cvFile);
if (!existsSync(cvPath)) {
  if (opts.lang === 'de') {
    console.error(`❌ ${cvFile} not found. Run: node translate-cv.mjs  (cv.md → cv.de.md)`);
  } else {
    console.error(`❌ ${cvFile} not found.`);
  }
  process.exit(1);
}
let cvMd = readFileSync(cvPath, 'utf-8');

// ── Load profile ────────────────────────────────────────────────────────────
const profilePath = resolve(ROOT, 'config/profile.yml');
if (!existsSync(profilePath)) { console.error('❌ config/profile.yml not found.'); process.exit(1); }
const profile = yaml.load(readFileSync(profilePath, 'utf-8')) || {};
const cand = profile.candidate || {};
const lb = profile.lebenslauf || {};

// ── Strip the markdown header (name + contact + first rule) ─────────────────
// The template renders name/contact separately, so drop them to avoid duplication.
{
  const lines = cvMd.split('\n');
  let i = 0;
  if (lines[i]?.startsWith('# ')) i++;            // # Name
  while (i < lines.length && lines[i].trim() === '') i++;
  // contact line(s) until the first '---'
  while (i < lines.length && lines[i].trim() !== '---' && !lines[i].startsWith('## ')) i++;
  if (lines[i]?.trim() === '---') i++;            // drop leading rule
  cvMd = lines.slice(i).join('\n');
}

// ── Minimal markdown → HTML ─────────────────────────────────────────────────
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => `<a href="${url}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
// Reflow hard-wrapped markdown: join continuation lines into their logical
// block. A blank line, heading, bullet, or rule starts a new block; any other
// non-blank line continues the previous one (standard soft-wrap semantics).
function reflow(md) {
  const isBlockStart = (l) =>
    l.trim() === '' || /^#{1,6}\s/.test(l) || /^\s*[-*+]\s/.test(l) ||
    /^\s*\d+\.\s/.test(l) || /^---+$/.test(l.trim());
  // Don't extend headings or rules — only paragraphs and bullets continue.
  const canExtend = (l) =>
    l.trim() !== '' && !/^#{1,6}\s/.test(l) && !/^---+$/.test(l.trim());
  const logical = [];
  for (const line of md.split('\n')) {
    const prev = logical[logical.length - 1];
    if (logical.length && !isBlockStart(line) && canExtend(prev)) {
      logical[logical.length - 1] += ' ' + line.trim();
    } else {
      logical.push(line);
    }
  }
  return logical.join('\n');
}

function mdToHtml(md) {
  const lines = reflow(md).split('\n');
  const out = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false; } };
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '') { closeList(); continue; }
    if (/^---+$/.test(line.trim())) { closeList(); continue; }
    let m;
    if ((m = line.match(/^###\s+(.*)/))) { closeList(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.*)/)))  { closeList(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^#\s+(.*)/)))   { closeList(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^\s*[-*+]\s+(.*)/))) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join('\n');
}
const bodyHtml = mdToHtml(cvMd);

// ── Personal-data rows (template-specific markup) ───────────────────────────
const pdItems = [];
if (lb.geburtsdatum)   pdItems.push(['Geburtsdatum', lb.geburtsdatum]);
if (lb.geburtsort)     pdItems.push(['Geburtsort', lb.geburtsort]);
if (lb.nationalitaet)  pdItems.push(['Nationalität', lb.nationalitaet]);
if (lb.familienstand)  pdItems.push(['Familienstand', lb.familienstand]);

// ── Contact pieces ──────────────────────────────────────────────────────────
const contactItems = [];
if (cand.location) contactItems.push(['Adresse', escapeHtml(cand.location)]);
if (cand.email)    contactItems.push(['E-Mail', `<a href="mailto:${cand.email}">${escapeHtml(cand.email)}</a>`]);
if (cand.phone)    contactItems.push(['Telefon', escapeHtml(cand.phone)]);
if (cand.linkedin) contactItems.push(['LinkedIn', `<a href="https://${cand.linkedin.replace(/^https?:\/\//, '')}">${escapeHtml(cand.linkedin)}</a>`]);
if (cand.github)   contactItems.push(['GitHub', `<a href="https://${cand.github.replace(/^https?:\/\//, '')}">${escapeHtml(cand.github)}</a>`]);

// ── Photo (embedded as absolute file:// so it resolves from output/) ────────
function photoBlock(cls) {
  if (!lb.photo_path) return '';
  const abs = resolve(ROOT, lb.photo_path);
  if (!existsSync(abs)) {
    console.warn(`⚠️  photo_path set but file missing: ${abs} — skipping photo.`);
    return '';
  }
  return `<img class="${cls}" src="file://${abs}" alt="Foto" />`;
}

// ── Signature line (German convention: Ort, Datum) ──────────────────────────
const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const ort = lb.ort_unterschrift || cand.location || '';
const signature = ort ? `${escapeHtml(ort)}, ${today}` : today;

// Role line (modern template subtitle) — first primary target role, if any.
const roleLine = escapeHtml((profile.target_roles?.primary?.[0]) || 'Lebenslauf');

// ── Fill template ───────────────────────────────────────────────────────────
const tplPath = resolve(ROOT, `templates/lebenslauf-${opts.template}.html`);
let tpl = readFileSync(tplPath, 'utf-8');

if (opts.template === 'modern') {
  const pd = pdItems.map(([k, v]) =>
    `<div class="pd-row"><span class="pd-label">${k}</span><span class="pd-value">${escapeHtml(v)}</span></div>`).join('\n');
  const contact = contactItems.map(([k, v]) =>
    `<div class="pd-row"><span class="pd-label">${k}</span><span class="pd-value">${v}</span></div>`).join('\n');
  tpl = tpl
    .replaceAll('{{LANG}}', opts.lang)
    .replaceAll('{{NAME}}', escapeHtml(cand.full_name || ''))
    .replaceAll('{{ROLE_LINE}}', roleLine)
    .replace('{{PHOTO_BLOCK}}', photoBlock('photo'))
    .replace('{{CONTACT_BLOCK}}', contact)
    .replace('{{PERSONAL_DATA}}', pd)
    .replace('{{BODY}}', bodyHtml)
    .replace('{{SIGNATURE}}', signature);
} else {
  const pd = pdItems.map(([k, v]) =>
    `<tr><td class="pd-label">${k}</td><td>${escapeHtml(v)}</td></tr>`).join('\n');
  const contactInline = contactItems.map(([, v]) => v).join(' &nbsp;|&nbsp; ');
  tpl = tpl
    .replaceAll('{{LANG}}', opts.lang)
    .replaceAll('{{NAME}}', escapeHtml(cand.full_name || ''))
    .replace('{{PHOTO_BLOCK}}', photoBlock('photo'))
    .replace('{{CONTACT_INLINE}}', contactInline)
    .replace('{{PERSONAL_DATA}}', pd)
    .replace('{{BODY}}', bodyHtml)
    .replace('{{SIGNATURE}}', signature);
}

// ── Write filled HTML + render via generate-pdf.mjs ─────────────────────────
const htmlOut = resolve(ROOT, `output/lebenslauf-${opts.template}-${opts.lang}.html`);
const pdfOut  = resolve(ROOT, `output/lebenslauf-${opts.template}-${opts.lang}.pdf`);
writeFileSync(htmlOut, tpl, 'utf-8');
console.log(`📝 Filled template → ${htmlOut}`);

const child = spawn('node', ['generate-pdf.mjs', htmlOut, pdfOut, '--format=a4'], { cwd: ROOT, stdio: 'inherit' });
child.on('close', (code) => {
  if (code === 0) console.log(`✅ Lebenslauf PDF → ${pdfOut}`);
  else console.error(`❌ PDF generation failed (exit ${code}).`);
  process.exit(code ?? 1);
});
