/* ============ REACTIVE APP STATE (Svelte 5 runes) ============ */
import { createWorkspace, createProject, createEntry, migrateWorkspace } from './model.js';
import { idbSet, idbGet } from './persist.js';

export const app = $state({
  ws: createWorkspace(),
  projectId: null,
  entryId: null,
  view: 'projects',   // 'projects' | 'project' | 'entry'
  mode: 'edit',       // 'edit' | 'preview'
  dirty: false,
  searchOpen: false,
});

/* ---- command palette (⌘K search / quick-jump) ---- */
export function openSearch(){ app.searchOpen = true; }
export function closeSearch(){ app.searchOpen = false; }
export function toggleSearch(){ app.searchOpen = !app.searchOpen; }

// point selection at the seeded project on boot
app.projectId = app.ws.projects[0].id;

export function curProject(){
  return app.ws.projects.find(p => p.id === app.projectId) || app.ws.projects[0] || null;
}
export function curEntry(){
  const p = curProject();
  if (!p) return null;
  return p.entries.find(e => e.id === app.entryId) || null;
}
/* ---- local autosave (IndexedDB) so a refresh never loses work ---- */
let saveTimer = null, restored = false;
function scheduleSave(){
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { idbSet('workspace', $state.snapshot(app.ws)).catch(() => {}); }, 500);
}
export async function restoreWorkspace(){
  try {
    const saved = await idbGet('workspace');
    if (saved && Array.isArray(saved.projects) && saved.projects.length){
      app.ws = migrateWorkspace(saved); app.projectId = saved.projects[0].id; app.entryId = null; app.view = 'projects';
    }
  } catch (_) {}
  restored = true;
}
export function saveNow(){ if (restored) idbSet('workspace', $state.snapshot(app.ws)).catch(() => {}); }

export function markDirty(){ app.dirty = true; scheduleSave(); }
export function clearDirty(){ app.dirty = false; }

// confirm a delete only when the item actually holds content (blank items delete silently)
export function confirmDelete(hasContent, what){ return !hasContent || confirm('Delete ' + what + '? This can’t be undone.'); }

/* ---- navigation ---- */
export function openProjects(){ app.view = 'projects'; }
export function openMapLab(){ app.view = 'maplab'; }
export function openProject(id){ app.projectId = id; app.view = 'project'; }
export function openEntry(id){ app.entryId = id; app.view = 'entry'; app.mode = 'edit'; }
export function openAnyEntry(id){ for (const p of app.ws.projects){ if (p.entries.some(e => e.id === id)){ app.projectId = p.id; app.entryId = id; app.view = 'entry'; app.mode = 'edit'; return; } } }
export function toggleMode(){ app.mode = app.mode === 'edit' ? 'preview' : 'edit'; }

/* ---- mutations ---- */
export function addProject(){
  const p = createProject('New project', '');
  p.entries.push(createEntry('character', 'New character'));
  app.ws.projects.push(p);
  markDirty();
  openProject(p.id);
}
export function deleteProject(id){
  app.ws.projects = app.ws.projects.filter(p => p.id !== id);
  if (!app.ws.projects.length){ addProject(); }
  markDirty();
}
export function addEntry(type){
  const p = curProject(); if (!p) return;
  const e = createEntry(type, '');
  e.title = 'New ' + type;
  p.entries.push(e);
  markDirty();
  openEntry(e.id);
}
export function deleteEntry(id){
  const p = curProject(); if (!p) return;
  p.entries = p.entries.filter(e => e.id !== id);
  markDirty();
  if (app.entryId === id) app.view = 'project';
}

/* theme resolution for the current view (workspace theme in projects view, else project theme) */
export function themeFor(){
  const p = curProject();
  if (app.view === 'projects' || !p){
    const w = app.ws;
    return { palette: w.palette, head: w.headFont, body: w.bodyFont, hs: w.headScale, bs: w.bodyScale, ps: 1 };
  }
  return { palette: p.palette, head: p.headFont, body: p.bodyFont, hs: p.headScale, bs: p.bodyScale, ps: p.portraitScale || 1 };
}
