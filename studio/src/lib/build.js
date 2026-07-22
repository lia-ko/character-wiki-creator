/* ============ WORKSPACE BUILD / EXPORT ============
   Assembles the whole workspace into self-contained static HTML files + fonts,
   cross-linked, and packages them as a .zip. */

import { uniqueSlug, bookPool } from './model.js';
import { renderEntry, renderHub, renderIndex, docShell } from './render.js';
import { readerMaps, baseCtx } from './readerctx.js';
import { buildZip } from './zip.js';
import { faceById } from './theme.js';

// Build every file for the workspace and return a .zip Blob. Async (fetches font files).
// Each book (project) exports its full pool = its own local entries + the series-bible sheets
// it uses, so a book's site is self-contained (shared sheets are snapshotted into each book).
export async function buildWorkspace(ws){
  const usedFolders = {}, projLoc = {}, poolOf = {}, locByBook = {}, ownerLoc = {};
  ws.projects.forEach(p => {
    const folder = uniqueSlug(p.name || 'project', usedFolders); projLoc[p.id] = folder;
    const pool = bookPool(ws, p); poolOf[p.id] = pool;
    const usedFiles = {}, loc = {};
    pool.forEach(e => { loc[e.id] = uniqueSlug(e.title || e.type, usedFiles) + '.html'; });
    locByBook[p.id] = loc;
    (p.entries || []).forEach(e => { ownerLoc[e.id] = { folder, file: loc[e.id] }; });   // a local entry's home, for cross-project links
  });

  const files = [];
  const doc = (title, theme, fontPrefix, body) => docShell({ title, palette: theme.palette, headFont: theme.headFont, bodyFont: theme.bodyFont, headScale: theme.headScale, bodyScale: theme.bodyScale, portraitScale: theme.portraitScale, contentWidth: ws.contentWidth, fontPrefix, bodyHTML: body });

  ws.projects.forEach(p => {
    const folder = projLoc[p.id], pool = poolOf[p.id], loc = locByBook[p.id];
    const maps = readerMaps(p, pool);
    const hubHrefs = {}; pool.forEach(e => hubHrefs[e.id] = loc[e.id]);
    // resolve within this book first (covers its bible copies), then fall back to a local entry's home project
    const href = (id) => loc[id] ? loc[id] : (ownerLoc[id] && ownerLoc[id].folder !== folder ? '../' + ownerLoc[id].folder + '/' + ownerLoc[id].file : null);
    const navProject = { ...p, entries: pool };   // hub + sidenav list the pool (local + bible)
    pool.forEach(e => {
      const ctx = baseCtx(p, maps, { href, hubHref: 'main.html', currentId: e.id, sidebarProject: navProject, entry: e, entries: pool });
      files.push({ name: folder + '/' + loc[e.id], text: doc((e.title || 'Entry') + ' — ' + (p.name || ''), p, '../fonts/', renderEntry(e, ctx)) });
    });
    files.push({ name: folder + '/main.html', text: doc(p.name || 'Project', p, '../fonts/', renderHub(navProject, { hrefs: hubHrefs, upHref: '../index.html' })) });
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
