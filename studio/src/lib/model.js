/* ============ DATA MODEL ============
   Workspace → Projects → Entries. An Entry is generic: it has a type and a `data`
   map keyed by its template's section keys. Nothing here is character-specific. */

import { templateFor, emptyValue, ENTRY_TYPES, TYPE_ALIASES } from './templates.js';

// Normalize any renamed/aliased entry types in a loaded workspace (e.g. faction → organization).
export function migrateWorkspace(ws){
  if (!Array.isArray(ws.trash)) ws.trash = [];
  (ws?.projects || []).forEach(p => {
    if (p.portraitScale == null) p.portraitScale = 1;
    if (p.cover == null) p.cover = '';
    if (p.spotify == null) p.spotify = [];
    (p.entries || []).forEach(e => {
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
    headScale: 1, bodyScale: 1, portraitScale: 1, cover: '', spotify: [], entries: [],
  };
}

export function createWorkspace(){
  const p = createProject('My first project', '');
  p.entries.push(createEntry('character', 'New character'));
  return {
    title: 'Your World', palette: 'slate',
    headFont: 'playfair-display', bodyFont: 'eb-garamond', headScale: 1, bodyScale: 1,
    projects: [p], trash: [],
  };
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
      const s = imgSrc(v[0]);
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
export function backlinksFor(entry, project){
  if (!entry || !project) return [];
  const out = [];
  for (const src of (project.entries || [])){
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
