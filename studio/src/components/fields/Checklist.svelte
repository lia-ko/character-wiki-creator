<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  const done = $derived(list.filter(r => r.done).length);
  function add(){ list.push({ done: false, text: '' }); markDirty(); }
  function toggle(r){ r.done = !r.done; markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete((r.text || '').trim(), 'this item'))) return; list.splice(i, 1); markDirty(); }
</script>

<div class="ck">
  {#if list.length}<div class="ckhd"><span class="ckbar"><span class="ckfill" style="width:{Math.round(done / list.length * 100)}%"></span></span>{done}/{list.length}</div>{/if}
  {#each list as r, i (i)}
    <div class="ckrow" class:done={r.done}>
      <button class="ckbox" onclick={() => toggle(r)} aria-label={r.done ? 'mark undone' : 'mark done'}>{r.done ? '☑' : '☐'}</button>
      <input class="cktext" bind:value={r.text} oninput={markDirty} placeholder="{sec.addLabel || 'item'}…" />
      <div class="ckacts"><Reorder {list} {i} /><button class="ckdel" onclick={() => del(i)} title="remove" aria-label="remove item">✕</button></div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add {sec.addLabel || 'item'}</button>
</div>

<style>
  .ck{display:flex;flex-direction:column;gap:5px}
  .ckhd{display:flex;align-items:center;gap:9px;font-family:var(--mono);font-size:.6rem;letter-spacing:.06em;color:var(--faint);padding:0 2px 3px}
  .ckbar{flex:1;height:4px;border-radius:3px;background:var(--panel-2);overflow:hidden;max-width:200px}
  .ckfill{display:block;height:100%;background:var(--accent);transition:width .15s}
  .ckrow{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:6px 10px}
  .ckbox{background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.05rem;line-height:1;padding:0;flex:none}
  .ckrow.done .ckbox{color:var(--accent)}
  .cktext{background:none;border:none;outline:none;font-family:var(--body);font-size:.98rem;color:var(--ink);min-width:0}
  .cktext::placeholder{color:var(--faint)}
  .ckrow.done .cktext{color:var(--muted);text-decoration:line-through}
  .ckacts{display:inline-flex;align-items:center;gap:4px;flex:none}
  .ckdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .ckdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:1px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
