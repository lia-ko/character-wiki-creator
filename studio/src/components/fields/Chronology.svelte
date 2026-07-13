<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);
  // surface Event entries first in the optional link picker
  const events = $derived((others || []).filter(o => o.type === 'event'));
  const rest = $derived((others || []).filter(o => o.type !== 'event'));

  function add(){ list.push({ date: '', text: '', targetId: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.date && r.date.trim()) || (r.text && r.text.trim());
    if (!(await confirmDelete(has, r.text ? '“' + r.text + '”' : 'this entry'))) return;
    list.splice(i, 1); markDirty();
  }
</script>

<div class="chron">
  {#each list as r, i (i)}
    <div class="crow">
      <input class="cdate" bind:value={r.date} oninput={markDirty} placeholder="date" />
      <input class="ctext" bind:value={r.text} oninput={markDirty} placeholder="what happened" />
      <select class="clink" bind:value={r.targetId} onchange={markDirty} title="link an Event (optional)">
        <option value="">— link —</option>
        {#if events.length}<optgroup label="Events">{#each events as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
        {#if rest.length}<optgroup label="Other entries">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
      </select>
      <Reorder {list} {i} />
      <button class="cdel" onclick={() => del(i)} title="remove" aria-label="remove">✕</button>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add date</button>
  <p class="chint">Add in the order they happened — earliest first.</p>
</div>

<style>
  .chron{display:flex;flex-direction:column;gap:7px}
  .crow{display:grid;grid-template-columns:minmax(6em,0.5fr) minmax(0,1.4fr) auto auto auto;gap:9px;align-items:center;border:1px solid var(--rule);border-radius:9px;background:var(--panel);padding:7px 11px}
  .cdate{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.62rem;letter-spacing:.04em;color:var(--accent-soft);padding:5px 8px;min-width:0}
  .ctext{background:none;border:none;outline:none;font-family:var(--body);font-size:.98rem;color:var(--ink);min-width:0}
  .cdate::placeholder,.ctext::placeholder{color:var(--faint)}
  .cdate:focus{border-color:var(--accent)}
  .clink{font-family:var(--sans);font-size:.68rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 7px;max-width:11em}
  .cdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .cdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  .chint{margin:0;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  @media(max-width:640px){.crow{grid-template-columns:1fr 1fr auto auto;gap:6px}.ctext{grid-column:1/-1}.clink{grid-column:1/-1;max-width:100%}}
</style>
