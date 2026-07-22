/* ============ DATA MODEL ============
   Workspace → Projects → Entries. An Entry is generic: it has a type and a `data`
   map keyed by its template's section keys. Nothing here is character-specific. */

import { templateFor, emptyValue, ENTRY_TYPES, TYPE_ALIASES, rebuildCustomTypes } from './templates.js';
import { resolveImg } from './imagepool.js';

// One-time upgrade: outline beats used to carry a separate `links: [entryId]` array shown as
// chips. Those are now inline [[id|title]] mentions inside the beat's rich text. Fold any existing
// link ids into the beat text (preserving them) and drop the old array.
function foldBeatLinks(p){
  const titleById = {};
  (p.entries || []).forEach(e => { titleById[e.id] = (e.title || 'Untitled').replace(/[|\]]/g, ''); });
  (p.entries || []).forEach(e => {
    const data = e.data || {};
    for (const k in data){
      const v = data[k];
      if (!v || typeof v !== 'object' || !Array.isArray(v.acts)) continue;   // only outline fields
      v.acts.forEach(a => (a.chapters || []).forEach(ch => (ch.beats || []).forEach(bt => {
        if (Array.isArray(bt.links) && bt.links.length){
          let text = String(bt.text || '');
          bt.links.forEach(id => {
            if (id && titleById[id] != null && !text.includes('[[' + id + '|')){
              text += (text && !/\s$/.test(text) ? ' ' : '') + `[[${id}|${titleById[id]}]]`;
            }
          });
          bt.text = text;
        }
        delete bt.links;
      })));
    }
  });
}

// Normalize any renamed/aliased entry types in a loaded workspace (e.g. faction → organization).
export function migrateWorkspace(ws){
  if (!Array.isArray(ws.trash)) ws.trash = [];
  if (!Array.isArray(ws.typeLibrary)) ws.typeLibrary = [];   // the user's custom-type library
  // content width: focused | normal | full (migrate the retired 'wide' → 'normal')
  if (!ws.contentWidth || !['focused', 'normal', 'full'].includes(ws.contentWidth)) ws.contentWidth = 'normal';
  if (!Array.isArray(ws.series)) ws.series = [];             // series = shared "bibles" that group books
  (ws?.projects || []).forEach((p, i) => {
    if (p.portraitScale == null) p.portraitScale = 1;
    if (p.cover == null) p.cover = '';
    if (p.spotify == null) p.spotify = [];
    if (!Array.isArray(p.types)) p.types = [];               // imported copies of custom types
    if (p.seriesId == null) p.seriesId = '';                 // '' = standalone (not in a series)
    if (p.order == null) p.order = i;                        // reading order within its series
  });
  rebuildCustomTypes(ws);                                     // must precede ensureEntryData (custom types)
  (ws?.projects || []).forEach(p => {
    (p.entries || []).forEach(e => {
      if (TYPE_ALIASES[e.type]) e.type = TYPE_ALIASES[e.type];
      ensureEntryData(e);
    });
    foldBeatLinks(p);   // outline beats: retire the old links[] chips into inline [[id|title]] mentions
  });
  (ws.series || []).forEach(s => {                            // bible sheets live at the series level
    if (!Array.isArray(s.entries)) s.entries = [];
    if (s.cover == null) s.cover = '';
    if (s.genre == null) s.genre = '';
    s.entries.forEach(e => {
      if (!Array.isArray(e.books)) e.books = [];              // book ids this bible sheet appears in
      if (TYPE_ALIASES[e.type]) e.type = TYPE_ALIASES[e.type];
      ensureEntryData(e);
    });
  });
  return ws;
}

let _seq = 0;
export function uid(){ _seq++; return 'x' + Date.now().toString(36) + '-' + _seq.toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

export function slugify(s){
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'untitled';
}
export function uniqueSlug(name, used){
  const base = slugify(name); let s = base, i = 2;
  while (used[s]){ s = base + '-' + i; i++; }
  used[s] = 1; return s;
}

// Events in a project, sorted for the shared timeline (best-effort year from a Date-ish stat).
export function projectEvents(project){
  return (project.entries || []).filter(e => e.type === 'event').map(e => {
    const st = (e.data && e.data.stats) || [];
    const hit = st.find(s => /date|year|when/i.test(s.k)) || st[0];
    const dv = hit ? hit.v : '';
    const m = String(dv || '').match(/-?\d+/g);
    return { id: e.id, title: e.title, date: dv, year: m ? parseInt(m[m.length - 1], 10) : null };
  }).sort((a, b) => { const au = a.year == null, bu = b.year == null; if (au && bu) return 0; if (au) return 1; if (bu) return -1; return a.year - b.year; });
}

export function createEntry(type, name){
  const tpl = templateFor(type);
  const data = {};
  tpl.sections.forEach(sec => {
    data[sec.key] = emptyValue(sec);
    // pre-seed at-a-glance meters from a section's gaugeDefaults (e.g. System's Hardness/Cost/…)
    if (sec.type === 'gauges' && Array.isArray(sec.gaugeDefaults)){
      data[sec.key] = sec.gaugeDefaults.map(g => g.text ? { label: g.label, text: true, value: '' } : { label: g.label, levels: (g.levels || []).slice(), at: 0 });
    }
    // pre-seed fixed starter rows for a list field (e.g. Setting's five senses)
    if (Array.isArray(sec.rowDefaults)) data[sec.key] = sec.rowDefaults.map(r => ({ ...r }));
  });
  const entry = { id: uid(), type, title: name || ('New ' + tpl.label.toLowerCase()), subtitle: '', group: '', data };
  // sections flagged `optional` start hidden — the entry opens on a lean core, the rest
  // are added on demand from the "＋ Add section" menu (which lists them under their zone).
  const optional = tpl.sections.filter(s => s.optional).map(s => s.key);
  if (optional.length) entry.hidden = optional;
  return entry;
}

// An entry's effective sections: the template's sections plus any per-entry custom
// sections the user has added (entry.extra).
export function sectionsOf(entry){
  const base = templateFor(entry.type).sections;
  return (entry && entry.extra && entry.extra.length) ? base.concat(entry.extra) : base;
}

// The body sections to render, in display order: drop aside + hidden, keep the lead
// pinned first, and apply the per-entry reorder (entry.order) to the rest.
export function bodySectionsOf(entry){
  const hidden = entry.hidden || [];
  const secs = sectionsOf(entry).filter(s => s.slot !== 'aside' && !hidden.includes(s.key));
  const order = entry.order;
  if (!order || !order.length) return secs;
  const lead = secs.filter(s => s.lead), rest = secs.filter(s => !s.lead);
  const idx = (k) => { const i = order.indexOf(k); return i === -1 ? Infinity : i; };
  rest.sort((a, b) => idx(a.key) - idx(b.key));   // stable: unordered keys keep their natural order, at the end
  return lead.concat(rest);
}

// Backfill any section keys missing from an entry's data (a section added to the template
// after the entry was created, or a restored custom section). Used by the loader + live editor.
export function ensureEntryData(entry){
  if (entry && entry.data){
    sectionsOf(entry).forEach(s => { if (!(s.key in entry.data)) entry.data[s.key] = emptyValue(s); });
  }
  return entry;
}

export function createProject(name, genre){
  return {
    id: uid(), name: name || 'New project', genre: genre || '',
    palette: 'slate', headFont: 'playfair-display', bodyFont: 'eb-garamond',
    headScale: 1, bodyScale: 1, portraitScale: 1, cover: '', spotify: [], entries: [], types: [],
    seriesId: '', order: 0,   // '' seriesId = standalone; order = reading order within its series
  };
}

export function createWorkspace(){
  const p = createProject('My first project', '');
  p.entries.push(createEntry('character', 'New character'));
  return {
    title: 'Your World', palette: 'slate',
    headFont: 'playfair-display', bodyFont: 'eb-garamond', headScale: 1, bodyScale: 1,
    projects: [p], series: [], trash: [], typeLibrary: [], contentWidth: 'normal',
  };
}

/* ---- series (shared "bible" that groups books) ----
   A series holds shared bible entries (each tagged with the book ids it appears in) and groups
   projects (= books) via project.seriesId. A book's effective entry pool = its own local entries
   + the bible entries whose `books` include it. A standalone project has seriesId ''. */
export function createSeries(name, genre){
  return { id: uid(), name: name || 'New series', genre: genre || '', cover: '', entries: [] };
}
export function seriesById(ws, id){ return (ws.series || []).find(s => s.id === id) || null; }
export function seriesOf(ws, project){ return project && project.seriesId ? seriesById(ws, project.seriesId) : null; }
// books (projects) in a series, in reading order
export function booksInSeries(ws, seriesId){
  return (ws.projects || []).filter(p => p.seriesId === seriesId)
    .sort((a, b) => (a.order | 0) - (b.order | 0) || String(a.name).localeCompare(String(b.name)));
}
// bible entries that appear in a given book
export function bibleForBook(series, projectId){
  return series ? (series.entries || []).filter(e => (e.books || []).includes(projectId)) : [];
}
// a book's effective entry pool: its own local entries + the bible entries used in it
export function bookPool(ws, project){
  return (project.entries || []).concat(bibleForBook(seriesOf(ws, project), project.id));
}
// which books (of the series) a bible entry is used in, as their book projects
export function booksForBibleEntry(ws, series, entry){
  const ids = new Set(entry.books || []);
  return booksInSeries(ws, series.id).filter(p => ids.has(p.id));
}
// put a project into a series (or '' to make it standalone), appended after the series' last book
export function setBookSeries(ws, projectId, seriesId){
  const p = (ws.projects || []).find(x => x.id === projectId);
  if (!p) return null;
  p.seriesId = seriesId || '';
  if (p.seriesId){
    const others = (ws.projects || []).filter(x => x.seriesId === p.seriesId && x.id !== p.id);
    p.order = others.length ? Math.max(...others.map(o => o.order | 0)) + 1 : 0;
  }
  return p;
}
// Move a local entry up into its series' bible (shared). Defaults membership to every book in
// the series so it's visible everywhere at once. Returns the moved entry (or null).
export function promoteToBible(ws, projectId, entryId){
  const project = (ws.projects || []).find(p => p.id === projectId);
  const series = project && seriesOf(ws, project);
  if (!project || !series) return null;
  const i = (project.entries || []).findIndex(e => e.id === entryId);
  if (i === -1) return null;
  const [entry] = project.entries.splice(i, 1);
  entry.books = booksInSeries(ws, series.id).map(p => p.id);   // used in all books by default
  series.entries.push(entry);
  return entry;
}
// Move a bible entry back down into a specific book as a local entry (drops its membership).
export function demoteToLocal(ws, seriesId, entryId, projectId){
  const series = seriesById(ws, seriesId);
  const project = (ws.projects || []).find(p => p.id === projectId);
  if (!series || !project) return null;
  const i = (series.entries || []).findIndex(e => e.id === entryId);
  if (i === -1) return null;
  const [entry] = series.entries.splice(i, 1);
  delete entry.books;
  project.entries.push(entry);
  return entry;
}

/* ---- custom sheet types ----
   A custom type is the same object shape as a built-in template. `newCustomType` starts
   blank; `duplicateType` forks a built-in (or another custom type) as a starting point;
   `importTypeToProject` copies a library type into a project so it stays self-contained. */
// a unique custom-type id (the uid tail is seq+random → collision-free even within one ms)
export function typeId(label){ return 'ct_' + slugify(label || 'type') + '_' + (uid().split('-').pop() || uid().slice(-6)); }
export function newCustomType(label){
  const nm = (label || 'New type').trim() || 'New type';
  return {
    type: typeId(nm), label: nm, plural: nm + 's',
    icon: '◆', layout: 'hero', media: 'none', custom: true,
    sections: [{ key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true }],
  };
}
export function duplicateType(srcType, label){
  const base = JSON.parse(JSON.stringify(templateFor(srcType)));
  const nm = (label || (base.label + ' copy')).trim();
  base.type = typeId(nm);
  base.custom = true; base.label = nm; base.plural = nm.endsWith('s') ? nm : nm + 's';
  return base;
}
export function importTypeToProject(project, type){
  if (!project || !type) return;
  if (!Array.isArray(project.types)) project.types = [];
  if (!project.types.some(t => t.type === type.type)) project.types.push(JSON.parse(JSON.stringify(type)));
}

// A gallery item is a URL string or, once repositioned, { src, pos } where pos is
// a CSS object-position (e.g. "50% 30%"). These helpers read either shape.
export const imgSrc = (x) => (x && typeof x === 'object') ? x.src : x;
export const imgPos = (x) => (x && typeof x === 'object' && x.pos) ? x.pos : '50% 50%';

// Cover image for cards: first gallery image of any section, if present.
export function coverOf(entry){
  if (!entry || !entry.data) return '';
  for (const k in entry.data){
    const v = entry.data[k];
    if (Array.isArray(v) && v.length){
      const s = resolveImg(imgSrc(v[0]));
      if (typeof s === 'string' && /^data:|^https?:|^\.\.?\//.test(s)) return s;
    }
  }
  return '';
}

// Deep-walk any field value, collecting the "role" of every link to `id` — structured
// targetId links on objects AND inline [[id|label]] tokens inside rich-text strings.
function collectTargets(val, id, hits){
  if (typeof val === 'string'){
    const re = /\[\[([\w-]+)\|[^\]]*\]\]/g; let m;
    while ((m = re.exec(val))) if (m[1] === id) hits.push('mention');
    return;
  }
  if (Array.isArray(val)){ for (const v of val) collectTargets(v, id, hits); return; }
  if (val && typeof val === 'object'){
    if (val.targetId === id) hits.push(val.role || val.status || val.kind || '');
    for (const k in val){ if (k !== 'targetId') collectTargets(val[k], id, hits); }
  }
}

// Reverse of the targetId links: every entry that points AT `entry`, with the section
// + role it linked under. Powers the read-only "Linked from" backlinks block.
export function backlinksFor(entry, project, entries){
  if (!entry || !project) return [];
  const out = [];
  for (const src of (entries || project.entries || [])){
    if (src.id === entry.id || !src.data) continue;
    const labelOf = {}; templateFor(src.type).sections.forEach(s => { labelOf[s.key] = s.label; });
    const seen = new Set();
    for (const key in src.data){
      const hits = []; collectTargets(src.data[key], entry.id, hits);
      for (const role of hits){
        const sig = key + '|' + role;
        if (seen.has(sig)) continue; seen.add(sig);
        out.push({ id: src.id, title: src.title || 'Untitled', type: src.type, section: labelOf[key] || key, role });
      }
    }
  }
  return out;
}

export function entriesByType(project){
  const groups = {};
  ENTRY_TYPES.forEach(t => { groups[t] = []; });
  (project.entries || []).forEach(e => { (groups[e.type] || (groups[e.type] = [])).push(e); });
  return groups;
}
