<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  import RichEditor from './RichEditor.svelte';
  let { entry, sec } = $props();
  const cats = $derived(entry.data[sec.key]);
  function addCat(){ cats.push({ name: 'Category', items: [] }); markDirty(); }
  async function delCat(ci){ const c = cats[ci]; const has = (c.items && c.items.length) || (c.name && c.name !== 'Category'); if (!(await confirmDelete(has, c.name ? '“' + c.name + '”' : 'this category'))) return; cats.splice(ci, 1); markDirty(); }
  function addItem(ci){ cats[ci].items.push({ name: 'Trait', note: '' }); markDirty(); }
  async function delItem(ci, ii){ const t = cats[ci].items[ii]; const has = (t.name && t.name !== 'Trait') || t.note; if (!(await confirmDelete(has, t.name || 'this entry'))) return; cats[ci].items.splice(ii, 1); markDirty(); }
</script>

<div class="cats">
  {#each cats as c, ci (ci)}
    <div class="cat">
      <div class="chead">
        <input class="cn" bind:value={c.name} oninput={markDirty} placeholder="Category" />
        <Reorder list={cats} i={ci} />
        <button class="delx" onclick={() => delCat(ci)} title="remove">✕</button>
      </div>
      {#each c.items as t, ii (ii)}
        <div class="titem">
          <div class="tihead">
            <input class="tn" bind:value={t.name} oninput={markDirty} placeholder="Name" />
            <Reorder list={c.items} i={ii} />
            <button class="delx" onclick={() => delItem(ci, ii)} title="remove">✕</button>
          </div>
          <div class="tnote"><RichEditor value={t.note} multiline placeholder="write-up… (⌘B / ⌘I)" oninput={(v) => { t.note = v; markDirty(); }} /></div>
        </div>
      {/each}
      <button class="addbtn sm" onclick={() => addItem(ci)}>＋ entry</button>
    </div>
  {/each}
  <button class="addbtn" onclick={addCat}>＋ Add category</button>
</div>

<style>
  .cats{display:flex;flex-direction:column;gap:16px}
  .chead{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--line)}
  .cn{flex:1;background:none;border:none;outline:none;font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
  .titem{display:flex;flex-direction:column;gap:6px;padding:8px 0;border-bottom:1px solid var(--line)}
  .tihead{display:flex;align-items:center;gap:10px}
  .tn{flex:1;background:none;border:none;outline:none;font:inherit;color:var(--ink);font-family:var(--mono);font-size:.72rem;text-transform:uppercase}
  .tnote{font-size:.86rem;color:var(--muted);line-height:1.5}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:6px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn.sm{padding:5px 12px;width:auto;margin-top:6px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
