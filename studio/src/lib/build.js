/* ============ WORKSPACE BUILD / EXPORT ============
   Assembles the whole workspace into self-contained static HTML files + fonts,
   cross-linked, and packages them as a .zip. */

import { coverOf, slugify } from './model.js';
import { renderEntry, renderHub, renderIndex, docShell } from './render.js';
import { buildZip } from './zip.js';
import { faceById } from './theme.js';

// Events in a project, sorted for the shared timeline (best-effort year from the Date stat).
export function projectEvents(project){
  return (project.entries || []).filter(e => e.type === 'event').map(e => {
    const st = (e.data && e.data.stats) || [];
    const hit = st.find(s => /date|year|when/i.test(s.k)) || st[0];
    const dv = hit ? hit.v : '';
    const m = String(dv || '').match(/-?\d+/g);
    return { id: e.id, title: e.title, date: dv, year: m ? parseInt(m[m.length - 1], 10) : null };
  }).sort((a, b) => { const au = a.year == null, bu = b.year == null; if (au && bu) return 0; if (au) return 1; if (bu) return -1; return a.year - b.year; });
}

function uniqueSlug(name, used){ const base = slugify(name); let s = base, i = 2; while (used[s]){ s = base + '-' + i; i++; } used[s] = 1; return s; }

// Build every file for the workspace and return a .zip Blob. Async (fetches font files).
export async function buildWorkspace(ws){
  const usedFolders = {}, projLoc = {}, entryLoc = {}, coverMap = {};
  ws.projects.forEach(p => {
    const folder = uniqueSlug(p.name || 'project', usedFolders); projLoc[p.id] = folder;
    const usedFiles = {};
    p.entries.forEach(e => { entryLoc[e.id] = { folder, file: uniqueSlug(e.title || e.type, usedFiles) + '.html' }; coverMap[e.id] = coverOf(e); });
  });

  const files = [];
  const doc = (title, theme, fontPrefix, body) => docShell({ title, palette: theme.palette, headFont: theme.headFont, bodyFont: theme.bodyFont, headScale: theme.headScale, bodyScale: theme.bodyScale, portraitScale: theme.portraitScale, fontPrefix, bodyHTML: body });

  ws.projects.forEach(p => {
    const folder = projLoc[p.id];
    const events = projectEvents(p);
    const hubHrefs = {}; p.entries.forEach(e => hubHrefs[e.id] = entryLoc[e.id].file);
    p.entries.forEach(e => {
      const ctx = {
        href: (id) => { const t = entryLoc[id]; if (!t) return null; return t.folder === folder ? t.file : '../' + t.folder + '/' + t.file; },
        cover: (id) => coverMap[id] || null,
        events, hubHref: 'main.html', crumb: p.name,
      };
      files.push({ name: folder + '/' + entryLoc[e.id].file, text: doc((e.title || 'Entry') + ' — ' + (p.name || ''), p, '../fonts/', renderEntry(e, ctx)) });
    });
    files.push({ name: folder + '/main.html', text: doc(p.name || 'Project', p, '../fonts/', renderHub(p, { hrefs: hubHrefs, upHref: '../index.html' })) });
  });

  const idxHrefs = {}; ws.projects.forEach(p => idxHrefs[p.id] = projLoc[p.id] + '/main.html');
  files.push({ name: 'index.html', text: doc(ws.title || 'Your World', ws, 'fonts/', renderIndex(ws, { hrefs: idxHrefs })) });

  // embed the font files actually used
  const faces = {}; const add = (id) => { const f = faceById(id); if (f) faces[f.id] = f; };
  add(ws.headFont); add(ws.bodyFont); ws.projects.forEach(p => { add(p.headFont); add(p.bodyFont); });
  await Promise.all(Object.values(faces).flatMap(f => ['file', 'ital'].filter(k => f[k]).map(async k => {
    try { const r = await fetch('/fonts/' + f.dir + '/' + f[k]); if (!r.ok) return; files.push({ name: 'fonts/' + f.dir + '/' + f[k], bytes: new Uint8Array(await r.arrayBuffer()) }); } catch (_) {}
  })));

  return buildZip(files);
}
