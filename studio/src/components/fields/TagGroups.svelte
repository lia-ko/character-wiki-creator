<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const cats = $derived(entry.data[sec.key]);
  function addCat(){ cats.push({ name: 'Category', items: [] }); markDirty(); }
  function delCat(ci){ cats.splice(ci, 1); markDirty(); }
  function addItem(ci){ cats[ci].items.push({ name: 'Trait', note: '' }); markDirty(); }
  function delItem(ci, ii){ cats[ci].items.splice(ii, 1); markDirty(); }
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
        <div class="trow">
          <input class="tn" bind:value={t.name} oninput={markDirty} placeholder="Name" />
          <input class="td" bind:value={t.note} oninput={markDirty} placeholder="note (optional)" />
          <Reorder list={c.items} i={ii} />
          <button class="delx" onclick={() => delItem(ci, ii)} title="remove">✕</button>
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
  .trow{display:grid;grid-template-columns:1fr 1.4fr auto auto;gap:10px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)}
  .trow input{background:none;border:none;outline:none;font:inherit;color:var(--ink)}
  .tn{font-family:var(--mono);font-size:.72rem;text-transform:uppercase}
  .td{font-size:.84rem;color:var(--muted)}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:6px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn.sm{padding:5px 12px;width:auto;margin-top:6px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
