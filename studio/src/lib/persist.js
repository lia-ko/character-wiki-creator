/* Minimal IndexedDB store for local autosave. Two object stores:
   - `kv`     : the workspace snapshot (now holds only small image *refs*, not bytes)
   - `images` : image bytes (base64 data URLs) keyed by id, so they never ride along
                in the frequently-cloned workspace snapshot. */
const DB = 'wikistudio', STORE = 'kv', IMGS = 'images';

function open(){
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 2);
    r.onupgradeneeded = (e) => {
      const db = r.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(IMGS)) db.createObjectStore(IMGS);
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function idbSet(key, val){
  const db = await open();
  return new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(val, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export async function idbGet(key){
  const db = await open();
  return new Promise((res, rej) => { const tx = db.transaction(STORE, 'readonly'); const rq = tx.objectStore(STORE).get(key); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); });
}
/* ---- image blob store (one small write per new image; never rewritten) ---- */
export async function imgPut(id, dataUrl){
  const db = await open();
  return new Promise((res, rej) => { const tx = db.transaction(IMGS, 'readwrite'); tx.objectStore(IMGS).put(dataUrl, id); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export async function imgGetAll(){
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(IMGS, 'readonly'); const store = tx.objectStore(IMGS);
    const keys = store.getAllKeys(), vals = store.getAll();
    tx.oncomplete = () => { const out = []; const k = keys.result || [], v = vals.result || []; for (let i = 0; i < k.length; i++) out.push([k[i], v[i]]); res(out); };
    tx.onerror = () => rej(tx.error);
  });
}
