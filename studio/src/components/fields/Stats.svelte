<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const rows = $derived(entry.data[sec.key]);
  function add(){ rows.push({ k: 'Field', v: '' }); markDirty(); }
  function del(i){ const r = rows[i]; if (!confirmDelete(r.v, r.k ? '“' + r.k + '”' : 'this field')) return; rows.splice(i, 1); markDirty(); }
</script>

<div class="stats">
  {#each rows as row, i (i)}
    <div class="srow">
      <input class="k" bind:value={row.k} oninput={markDirty} placeholder="label" />
      <input class="v" bind:value={row.v} oninput={markDirty} placeholder="—" />
      <Reorder list={rows} {i} />
      <button class="delx" onclick={() => del(i)} title="remove">✕</button>
    </div>
  {/each}
  <button class="addbtn sm" onclick={add}>＋ field</button>
</div>

<style>
  .stats{border:1px solid var(--rule);border-radius:8px;overflow:hidden}
  .srow{display:grid;grid-template-columns:40% 1fr auto auto;gap:8px;align-items:center;padding:7px 10px;border-bottom:1px solid var(--line)}
  input{background:none;border:none;outline:none;color:var(--ink);font:inherit}
  .k{font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .v{font-size:.82rem;color:var(--muted)}
  input:focus{color:var(--ink)}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 5px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn.sm{width:100%;border:none;border-top:1px dashed var(--rule);background:none;color:var(--muted);padding:7px;cursor:pointer;font-family:var(--sans);font-size:.72rem}
  .addbtn.sm:hover{color:var(--ink);background:var(--line)}
</style>
