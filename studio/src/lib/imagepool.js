/* ============ IMAGE POOL ============
   Image bytes (base64 data URLs) are heavy. Keeping them inside the workspace
   $state means every autosave / undo snapshot deep-clones megabytes, which stalls
   typing. Instead the workspace stores a tiny ref string ("img:<id>") and the bytes
   live here, in a plain Map OUTSIDE $state, backed by a separate IndexedDB store.

   - registerImage(dataUrl) -> "img:<id>"   (called at upload + on legacy migration)
   - resolveImg(ref)        -> data URL      (called at every display / export site)
   - http(s):/relative/'' values pass straight through, unchanged. */

import { imgPut, imgGetAll } from './persist.js';

const pool = new Map();            // id -> data URL (in memory; mirrors the IndexedDB `images` store)
const byData = new Map();          // data URL -> id (dedupe identical uploads / migrations)

export const REF = 'img:';
export const isRef = (s) => typeof s === 'string' && s.startsWith(REF);

// Resolve a stored value to something usable as an <img src> / CSS url(). Refs -> bytes;
// everything else (data:, http(s):, ./relative, '') is returned untouched.
export function resolveImg(s){
  if (typeof s !== 'string') return s;
  return isRef(s) ? (pool.get(s.slice(REF.length)) || '') : s;
}

// Move a data URL into the pool and return its ref. Non-data strings pass through so
// callers can pipe any picked/stored value through this safely.
export function registerImage(dataUrl){
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return dataUrl;
  const existing = byData.get(dataUrl);
  if (existing) return REF + existing;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  pool.set(id, dataUrl); byData.set(dataUrl, id);
  imgPut(id, dataUrl).catch(() => {});
  return REF + id;
}

// Load all persisted image bytes into memory. Call once at startup before restoring ws.
export async function loadPool(){
  try {
    const all = await imgGetAll();
    for (const [id, url] of all){ pool.set(id, url); byData.set(url, id); }
  } catch (_) {}
}

// Deep in-place walk that swaps any bare `data:` image string for a ref (registering the
// bytes into the pool). Used to (a) migrate legacy workspaces whose images are still inline,
// and (b) re-absorb an imported/backed-up .json whose images travel inline.
export function deImageWorkspace(root){
  let n = 0;
  const walk = (node) => {
    if (Array.isArray(node)){
      for (let i = 0; i < node.length; i++){
        const v = node[i];
        if (typeof v === 'string'){ if (v.startsWith('data:')){ node[i] = registerImage(v); n++; } }
        else if (v && typeof v === 'object') walk(v);
      }
    } else if (node && typeof node === 'object'){
      for (const k in node){
        const v = node[k];
        if (typeof v === 'string'){ if (v.startsWith('data:')){ node[k] = registerImage(v); n++; } }
        else if (v && typeof v === 'object') walk(v);
      }
    }
  };
  walk(root);
  return n;   // how many inline images were extracted (0 = nothing to migrate)
}

// JSON.stringify replacer that inlines refs back to data URLs, so an exported/backed-up
// workspace file is self-contained and portable across machines.
export const inlineReplacer = (k, v) => isRef(v) ? resolveImg(v) : v;
