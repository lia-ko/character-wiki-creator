/* ============ REACTIVE APP STATE (Svelte 5 runes) ============ */
import { createWorkspace, createProject, createEntry, migrateWorkspace, bodySectionsOf, newCustomType, duplicateType, importTypeToProject, typeId, slugify } from './model.js';
import { emptyValue, rebuildCustomTypes, isCustomType, customTypeById } from './templates.js';
import { sectionFromFeature } from './features.js';
import { idbSet, idbGet } from './persist.js';

export const app = $state({
  ws: createWorkspace(),
  projectId: null,
  entryId: null,
  view: 'projects',   // 'projects' | 'project' | 'entry'
  mode: 'edit',       // 'edit' | 'preview'
  dirty: false,
  searchOpen: false,
  trashOpen: false,
  histIndex: 0,       // mirrored from the (non-reactive) history stack for UI enable/disable
  histLen: 1,
  toast: null,        // { msg, actionLabel, action, id }
  confirm: null,      // { message, confirmLabel, danger } while a confirm dialog is open
});

/* ---- in-app confirm dialog (promise-based; replaces native confirm()) ---- */
let confirmResolve = null;
export function confirmModal(message, opts = {}){
  return new Promise(resolve => {
    confirmResolve = resolve;
    app.confirm = { message, confirmLabel: opts.confirmLabel || 'Delete', danger: opts.danger !== false };
  });
}
function settleConfirm(v){ app.confirm = null; const r = confirmResolve; confirmResolve = null; r?.(v); }
export function confirmYes(){ settleConfirm(true); }
export function confirmNo(){ settleConfirm(false); }

/* ---- toast (non-blocking notice, optional action e.g. Undo) ---- */
let toastTimer = null, toastSeq = 0;
export function toast(msg, opts = {}){
  app.toast = { msg, actionLabel: opts.actionLabel || null, action: opts.action || null, id: ++toastSeq };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { app.toast = null; }, opts.action ? 7000 : 4000);
}
export function dismissToast(){ if (toastTimer) clearTimeout(toastTimer); app.toast = null; }

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
  initHistory();
}
export function saveNow(){ if (restored) idbSet('workspace', $state.snapshot(app.ws)).catch(() => {}); }

/* ---- undo / redo (whole-workspace snapshots; depth-capped) ---- */
let history = [];          // plain (non-proxied) ws snapshots — kept out of $state to avoid deep-proxy cost
let hIndex = -1, restoring = false, histTimer = null;
const HIST_CAP = 25;
const syncHist = () => { app.histIndex = hIndex; app.histLen = history.length; };

export function initHistory(){ history = [$state.snapshot(app.ws)]; hIndex = 0; syncHist(); }
function scheduleHistory(){ if (restoring) return; if (histTimer) clearTimeout(histTimer); histTimer = setTimeout(commitHistory, 500); }
function commitHistory(){
  if (restoring) return;
  if (histTimer){ clearTimeout(histTimer); histTimer = null; }
  history = history.slice(0, hIndex + 1);
  history.push($state.snapshot(app.ws));
  if (history.length > HIST_CAP) history = history.slice(history.length - HIST_CAP);
  hIndex = history.length - 1; syncHist();
}
function restoreSnapshot(snap){
  restoring = true;
  app.ws = structuredClone(snap);
  rebuildCustomTypes(app.ws);   // custom-type registry must track undo/redo
  reconcileSelection();
  saveNow();
  restoring = false;
}
// keep the current selection valid after a snapshot restore (the viewed entry/project may be gone)
function reconcileSelection(){
  if (!app.ws.projects.find(p => p.id === app.projectId)) app.projectId = app.ws.projects[0]?.id || null;
  const p = curProject();
  if (app.view === 'entry' && (!p || !p.entries.find(e => e.id === app.entryId))){ app.view = 'project'; app.entryId = null; }
  if (app.view === 'builder' && !(app.ws.typeLibrary || []).some(t => t.type === app.builderTypeId)){ app.view = 'project'; }
}
export function undo(){ if (histTimer) commitHistory(); if (hIndex <= 0) return; hIndex--; restoreSnapshot(history[hIndex]); syncHist(); }
export function redo(){ if (hIndex >= history.length - 1) return; hIndex++; restoreSnapshot(history[hIndex]); syncHist(); }

/* ---- trash (recoverable deletions; lives in the workspace so it survives reloads) ---- */
const TRASH_CAP = 40;
export function openTrash(){ app.trashOpen = true; }
export function closeTrash(){ app.trashOpen = false; }
export const trashKind = (t) => t.kind || (t.project ? 'project' : 'entry');   // back-compat for pre-kind items
function pushTrash(item){
  if (!Array.isArray(app.ws.trash)) app.ws.trash = [];
  app.ws.trash.unshift(item);
  if (app.ws.trash.length > TRASH_CAP) app.ws.trash = app.ws.trash.slice(0, TRASH_CAP);
}
export function restoreTrash(i){
  const t = app.ws.trash?.[i]; if (!t) return;
  if (trashKind(t) === 'project'){
    if (!app.ws.projects.some(p => p.id === t.project.id)) app.ws.projects.push(structuredClone(t.project));
    app.projectId = t.project.id;
  } else {
    const p = app.ws.projects.find(x => x.id === t.projectId) || curProject() || app.ws.projects[0];
    if (!p) return;
    p.entries.push(structuredClone(t.entry));
    app.projectId = p.id;
  }
  app.ws.trash.splice(i, 1);
  markDirty();
}
export function deleteForever(i){ if (app.ws.trash?.[i]){ app.ws.trash.splice(i, 1); markDirty(); } }
export function emptyTrash(){ if (app.ws.trash?.length){ app.ws.trash = []; markDirty(); } }

export function markDirty(){ app.dirty = true; scheduleSave(); scheduleHistory(); }
export function clearDirty(){ app.dirty = false; }

// Async confirm for deleting a sub-item — prompts (via the in-app dialog) only when the item
// actually holds content; blank items delete silently. Returns Promise<boolean>.
export function confirmDelete(hasContent, what){
  return hasContent ? confirmModal('Delete ' + what + '?') : Promise.resolve(true);
}

/* ---- per-entry sections: add custom headings, delete/hide any section ---- */
let secSeq = 0;
const sectionHasContent = (val) => Array.isArray(val)
  ? val.length > 0
  : (val && typeof val === 'object' ? Object.keys(val).some(k => val[k] && (!Array.isArray(val[k]) || val[k].length)) : !!val);

export function addSection(entry, type, opts = {}){
  if (!entry.extra) entry.extra = [];
  const key = 'x' + Date.now().toString(36) + (secSeq++);
  const def = { key, label: opts.label || 'New section', type, slot: 'main', custom: true };
  if (type === 'catalog') def.scale = opts.scale || 'Rating';
  entry.extra.push(def);
  entry.data[key] = emptyValue(def);
  markDirty();
  return def;
}
// add ANY builder feature (with its default config) as a per-entry custom section, so any
// sheet — built-in or custom — can be enriched with the full palette.
export function addFeatureSection(entry, feature){
  if (!entry.extra) entry.extra = [];
  const usedKeys = bodySectionsOf(entry).map(s => s.key).concat((entry.extra || []).map(s => s.key));
  const def = sectionFromFeature(feature, usedKeys);
  def.key = 'x' + Date.now().toString(36) + (secSeq++);   // guaranteed-unique data-map key
  def.slot = 'main'; def.custom = true; delete def.lead;   // per-entry blocks land in the body
  entry.extra.push(def);
  entry.data[def.key] = emptyValue(def);
  markDirty();
  return def;
}
// custom section → removed outright (data discarded)
export async function delSection(entry, key){
  const i = (entry.extra || []).findIndex(s => s.key === key);
  if (i < 0) return;
  const def = entry.extra[i];
  if (!(await confirmDelete(sectionHasContent(entry.data[key]), def.label ? '“' + def.label + '”' : 'this section'))) return;
  entry.extra.splice(i, 1);
  delete entry.data[key];
  markDirty();
}
// template section → hidden non-destructively (data kept, restorable)
export async function hideSection(entry, sec){
  if (!(await confirmDelete(sectionHasContent(entry.data[sec.key]), sec.label ? '“' + sec.label + '”' : 'this section'))) return;
  if (!entry.hidden) entry.hidden = [];
  if (!entry.hidden.includes(sec.key)) entry.hidden.push(sec.key);
  markDirty();
}
export function restoreSection(entry, key){
  const i = (entry.hidden || []).indexOf(key);
  if (i >= 0){ entry.hidden.splice(i, 1); markDirty(); }
}
// move a body section up (-1) or down (+1) among the non-lead sections
export function moveSection(entry, key, dir){
  const order = bodySectionsOf(entry).filter(s => !s.lead).map(s => s.key);
  const i = order.indexOf(key), j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  entry.order = order;
  markDirty();
}

/* ---- navigation ---- */
export function openProjects(){ app.view = 'projects'; }
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
  const proj = app.ws.projects.find(p => p.id === id);
  app.ws.projects = app.ws.projects.filter(p => p.id !== id);
  if (proj) pushTrash({ kind: 'project', project: $state.snapshot(proj), at: Date.now() });
  if (!app.ws.projects.length){ addProject(); }
  else if (app.projectId === id){ app.projectId = app.ws.projects[0].id; }
  markDirty();
}
export function addEntry(type){
  const p = curProject(); if (!p) return;
  // if it's a library type not yet in this project, import a self-contained copy first
  if (isCustomType(type) && !(p.types || []).some(t => t.type === type)){
    importTypeToProject(p, customTypeById(type)); rebuildCustomTypes(app.ws);
  }
  const e = createEntry(type, '');
  e.title = 'New ' + templateLabel(type);
  p.entries.push(e);
  markDirty();
  openEntry(e.id);
}

/* ---- custom sheet types (the workspace type library) ---- */
function templateLabel(type){ const t = customTypeById(type); return t ? t.label.toLowerCase() : type; }
export function typeLibrary(){ if (!Array.isArray(app.ws.typeLibrary)) app.ws.typeLibrary = []; return app.ws.typeLibrary; }
// create a type in the library — blank, or forked from an existing type (built-in or custom)
export function createCustomType(label, forkFrom){
  const t = forkFrom ? duplicateType(forkFrom, label) : newCustomType(label);
  typeLibrary().push(t);
  rebuildCustomTypes(app.ws); markDirty();
  return t;
}
// keep every project's embedded copy in step with the library master, so a project stays
// self-contained AND current (portability without drift). Called on every builder edit.
function syncTypeCopies(){
  const lib = {}; (app.ws.typeLibrary || []).forEach(t => { lib[t.type] = t; });
  (app.ws.projects || []).forEach(p => (p.types || []).forEach((t, i) => { if (lib[t.type]) p.types[i] = JSON.parse(JSON.stringify(lib[t.type])); }));
}
// call after mutating a library type in the builder, to sync copies + re-register + persist
export function touchCustomTypes(){ syncTypeCopies(); rebuildCustomTypes(app.ws); markDirty(); }

/* ---- sharing: a type (or a whole pack) is just JSON ---- */
function downloadBlob(text, name, mime = 'application/json'){
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export function exportType(id){
  const t = typeLibrary().find(x => x.type === id); if (!t) return;
  downloadBlob(JSON.stringify({ kind: 'sheettype', version: 1, type: $state.snapshot(t) }, null, 2), slugify(t.label) + '.sheettype.json');
}
export function exportAllTypes(){
  const types = typeLibrary().map(t => $state.snapshot(t)); if (!types.length) { toast('No custom types to export'); return; }
  downloadBlob(JSON.stringify({ kind: 'sheetpack', version: 1, types }, null, 2), (slugify(app.ws.title || 'my') + '-sheet-types.json'));
}
// accept a single type, a {kind:'sheettype'} wrapper, a {kind:'sheetpack',types:[]}, or a bare array
export function importTypeFromJSON(text){
  let obj; try { obj = JSON.parse(text); } catch { toast('That isn’t a valid type file'); return []; }
  const raws = (obj && obj.kind === 'sheetpack' && Array.isArray(obj.types)) ? obj.types
    : (obj && obj.kind === 'sheettype' && obj.type) ? [obj.type]
    : Array.isArray(obj) ? obj : (obj && Array.isArray(obj.sections)) ? [obj] : [];
  const added = [];
  for (const raw of raws){
    if (!raw || !Array.isArray(raw.sections)) continue;
    const t = JSON.parse(JSON.stringify(raw));
    t.custom = true;
    t.type = typeId(t.label);   // always re-id (collision-free)
    if (!t.plural) t.plural = (t.label || 'Type') + 's';
    if (!t.layout) t.layout = 'hero';
    typeLibrary().push(t); added.push(t);
  }
  if (!added.length){ toast('No sheet type found in that file'); return []; }
  rebuildCustomTypes(app.ws); markDirty();
  toast('Imported ' + added.length + ' sheet type' + (added.length > 1 ? 's' : ''));
  return added;
}
export function deleteCustomType(id){
  app.ws.typeLibrary = typeLibrary().filter(t => t.type !== id);
  rebuildCustomTypes(app.ws); markDirty();
}
// make a project self-contained by importing a copy of a library type
export function useTypeInProject(type){
  const p = curProject(); if (!p || !type) return;
  importTypeToProject(p, type); rebuildCustomTypes(app.ws); markDirty();
}
// the builder view: open on a library type (create one first via createCustomType)
export function openBuilder(typeId){ app.builderTypeId = typeId; app.view = 'builder'; }
export function builderType(){ return typeLibrary().find(t => t.type === app.builderTypeId) || null; }
export function newTypeAndEdit(forkFrom){ const t = createCustomType('', forkFrom); openBuilder(t.type); }
export function deleteEntry(id){
  const p = curProject(); if (!p) return;
  const e = p.entries.find(x => x.id === id);
  p.entries = p.entries.filter(x => x.id !== id);
  if (e) pushTrash({ kind: 'entry', entry: $state.snapshot(e), projectId: p.id, projectName: p.name, at: Date.now() });
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

// seed the undo baseline for the initial (pre-restore) workspace
initHistory();
