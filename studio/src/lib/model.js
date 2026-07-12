/* ============ DATA MODEL ============
   Workspace → Projects → Entries. An Entry is generic: it has a type and a `data`
   map keyed by its template's section keys. Nothing here is character-specific. */

import { templateFor, emptyValue, ENTRY_TYPES, TYPE_ALIASES } from './templates.js';

// Normalize any renamed/aliased entry types in a loaded workspace (e.g. faction → organization).
export function migrateWorkspace(ws){
  (ws?.projects || []).forEach(p => {
    if (p.portraitScale == null) p.portraitScale = 1;
    if (p.cover == null) p.cover = '';
    (p.entries || []).forEach(e => { if (TYPE_ALIASES[e.type]) e.type = TYPE_ALIASES[e.type]; });
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
  return s;
}

export function createEntry(type, name){
  const tpl = templateFor(type);
  const data = {};
  tpl.sections.forEach(sec => { data[sec.key] = emptyValue(sec); });
  return { id: uid(), type, title: name || ('New ' + tpl.label.toLowerCase()), subtitle: '', data };
}

export function createProject(name, genre){
  return {
    id: uid(), name: name || 'New project', genre: genre || '',
    palette: 'slate', headFont: 'playfair-display', bodyFont: 'eb-garamond',
    headScale: 1, bodyScale: 1, portraitScale: 1, cover: '', entries: [],
  };
}

export function createWorkspace(){
  const p = createProject('My first project', '');
  p.entries.push(createEntry('character', 'New character'));
  return {
    title: 'Your World', palette: 'slate',
    headFont: 'playfair-display', bodyFont: 'eb-garamond', headScale: 1, bodyScale: 1,
    projects: [p],
  };
}

// Cover image for cards: first gallery image of any section, if present.
export function coverOf(entry){
  if (!entry || !entry.data) return '';
  for (const k in entry.data){
    const v = entry.data[k];
    if (Array.isArray(v) && v.length && typeof v[0] === 'string' && /^data:|^https?:|^\.\.?\//.test(v[0])) return v[0];
  }
  return '';
}

export function entriesByType(project){
  const groups = {};
  ENTRY_TYPES.forEach(t => { groups[t] = []; });
  (project.entries || []).forEach(e => { (groups[e.type] || (groups[e.type] = [])).push(e); });
  return groups;
}
