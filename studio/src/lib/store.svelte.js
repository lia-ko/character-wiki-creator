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
  reconcileSelection();
  saveNow();
  restoring = false;
}
// keep the current selection valid after a snapshot restore (the viewed entry/project may be gone)
function reconcileSelection(){
  if (!app.ws.projects.find(p => p.id === app.projectId)) app.projectId = app.ws.projects[0]?.id || null;
  const p = curProject();
  if (app.view === 'entry' && (!p || !p.entries.find(e => e.id === app.entryId))){ app.view = 'project'; app.entryId = null; }
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
  const proj = app.ws.projects.find(p => p.id === id);
  app.ws.projects = app.ws.projects.filter(p => p.id !== id);
  if (proj) pushTrash({ kind: 'project', project: $state.snapshot(proj), at: Date.now() });
  if (!app.ws.projects.length){ addProject(); }
  else if (app.projectId === id){ app.projectId = app.ws.projects[0].id; }
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
