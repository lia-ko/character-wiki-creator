/* ============ SINGLE / SELECTED ENTRY EXPORT ============
   Share individual sheets without re-exporting the whole workspace.
   - One entry  -> a single self-contained .html (fonts embedded as data URIs).
   - Several    -> a .zip of cross-linked sheets (shared fonts folder) + a mini sidebar
                   scoped to just the exported set. Links to non-exported entries fall
                   back to plain text. */

import { coverOf, slugify, backlinksFor } from './model.js';
import { renderEntry, docShell } from './render.js';
import { projectEvents } from './build.js';
import { faceById } from './theme.js';
import { buildZip } from './zip.js';

// base64-encode a fetched binary asset (chunked to avoid arg-length limits on big fonts)
async function fetchB64(url){
  const r = await fetch(url); if (!r.ok) throw new Error('font fetch failed');
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = ''; const CH = 0x8000;
  for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CH));
  return btoa(bin);
}

// @font-face CSS with the .ttf files embedded as data URIs (fully portable, no /fonts/ needed)
async function inlineFontFaceCSS(ids){
  const seen = {}, faces = ids.map(faceById).filter(f => f && !seen[f.id] && (seen[f.id] = 1));
  let css = '';
  for (const f of faces){
    const face = (b64, style) => `@font-face{font-family:"${f.family}";font-style:${style};font-weight:${f.varr ? '100 900' : '400'};font-display:swap;src:url(data:font/ttf;base64,${b64}) format("truetype")}`;
    try { css += face(await fetchB64('/fonts/' + f.dir + '/' + f.file), 'normal'); } catch (_) {}
    if (f.ital){ try { css += face(await fetchB64('/fonts/' + f.dir + '/' + f.ital), 'italic'); } catch (_) {} }
  }
  return css;
}

function download(blob, filename){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const coverMapOf = (project) => { const m = {}; (project.entries || []).forEach(e => m[e.id] = coverOf(e)); return m; };
const titleOf = (project) => { const m = {}; (project.entries || []).forEach(e => m[e.id] = e.title); return (id) => m[id] != null ? m[id] : null; };

// One entry -> a single self-contained .html file (no sidebar; backlinks render as plain text).
export async function exportSingleEntry(entry, project){
  const coverMap = coverMapOf(project);
  const ctx = { href: () => null, cover: (id) => coverMap[id] || null, title: titleOf(project), events: projectEvents(project), hubHref: null, crumb: project.name, backlinks: backlinksFor(entry, project) };
  const faceCSS = await inlineFontFaceCSS([project.headFont, project.bodyFont]);
  const html = docShell({ title: entry.title || 'Sheet', palette: project.palette, headFont: project.headFont, bodyFont: project.bodyFont, headScale: project.headScale, bodyScale: project.bodyScale, portraitScale: project.portraitScale, faceCSS, bodyHTML: renderEntry(entry, ctx) });
  download(new Blob([html], { type: 'text/html' }), (slugify(entry.title) || 'sheet') + '.html');
}

// Several entries -> a .zip of cross-linked sheets with a sidebar scoped to the selection.
export async function exportEntryBundle(project, entries){
  if (entries.length === 1) return exportSingleEntry(entries[0], project);
  const ids = new Set(entries.map(e => e.id));
  const coverMap = coverMapOf(project);
  const title = titleOf(project);
  const events = projectEvents(project);
  const used = {}, loc = {};
  entries.forEach(e => { loc[e.id] = (function(n){ const b = slugify(n) || 'sheet'; let s = b, i = 2; while (used[s]){ s = b + '-' + i; i++; } used[s] = 1; return s; })(e.title || e.type) + '.html'; });

  const navProject = { name: project.name, entries };   // sidebar shows only the exported set
  const files = entries.map(e => {
    const ctx = {
      href: (id) => ids.has(id) ? loc[id] : null,        // cross-link within the set; others -> plain text
      cover: (id) => coverMap[id] || null, title, events, hubHref: null, crumb: project.name,
      backlinks: backlinksFor(e, project), project: navProject, currentId: e.id,
    };
    const html = docShell({ title: e.title || 'Sheet', palette: project.palette, headFont: project.headFont, bodyFont: project.bodyFont, headScale: project.headScale, bodyScale: project.bodyScale, portraitScale: project.portraitScale, fontPrefix: 'fonts/', bodyHTML: renderEntry(e, ctx) });
    return { name: loc[e.id], text: html };
  });

  // include the font files actually used
  const faces = {}; [project.headFont, project.bodyFont].forEach(id => { const f = faceById(id); if (f) faces[f.id] = f; });
  await Promise.all(Object.values(faces).flatMap(f => ['file', 'ital'].filter(k => f[k]).map(async k => {
    try { const r = await fetch('/fonts/' + f.dir + '/' + f[k]); if (!r.ok) return; files.push({ name: 'fonts/' + f.dir + '/' + f[k], bytes: new Uint8Array(await r.arrayBuffer()) }); } catch (_) {}
  })));

  const blob = await buildZip(files);
  download(blob, (slugify(project.name) || 'sheets') + '-sheets.zip');
}
