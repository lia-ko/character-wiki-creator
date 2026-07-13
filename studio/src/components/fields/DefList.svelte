<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  const termPh = $derived(sec.termPh || 'Term');
  const defPh = $derived(sec.defPh || 'Definition');
  const notePh = $derived(sec.notePh || 'source (optional)');
  const avoid = $derived(sec.variant === 'avoid');   // a "don't" list — warning styling

  function add(){ list.push({ term: '', def: '', note: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.term && r.term.trim()) || (r.def && r.def.trim()) || (r.note && r.note.trim());
    if (!(await confirmDelete(has, r.term ? '“' + r.term + '”' : 'this row'))) return;
    list.splice(i, 1); markDirty();
  }
</script>

<div class="dl">
  {#each list as r, i (i)}
    <div class="drow" class:avoid>
      {#if avoid}<span class="dx" aria-hidden="true">✗</span>{/if}
      <input class="dterm" bind:value={r.term} oninput={markDirty} placeholder={termPh} />
      <input class="ddef" bind:value={r.def} oninput={markDirty} placeholder={defPh} />
      <input class="dnote" bind:value={r.note} oninput={markDirty} placeholder={notePh} />
      <div class="dacts"><Reorder {list} {i} /><button class="ddel" onclick={() => del(i)} title="remove" aria-label="remove row">✕</button></div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add {sec.addLabel || 'row'}</button>
</div>

<style>
  .dl{display:flex;flex-direction:column;gap:7px}
  .drow{display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.5fr) minmax(0,0.7fr) auto;gap:11px;align-items:center;
        border:1px solid var(--rule);border-radius:9px;background:var(--panel);padding:8px 12px}
  .drow.avoid{grid-template-columns:auto minmax(0,0.9fr) minmax(0,1.5fr) minmax(0,0.7fr) auto;border-left:3px solid #c05348}
  .dx{color:#c05348;font-weight:700;font-size:.9rem}
  .dterm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.02rem*var(--hs,1));color:var(--ink);min-width:0;width:100%}
  .ddef{background:none;border:none;outline:none;font-family:var(--body);font-size:.98rem;color:var(--ink);min-width:0;width:100%}
  .dnote{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.04em;color:var(--faint);padding:4px 8px;min-width:0;width:100%}
  .dnote:focus{border-color:var(--accent);color:var(--muted)}
  .dterm::placeholder{color:var(--faint)}
  .ddef::placeholder{color:var(--faint)}
  .dnote::placeholder{color:var(--faint)}
  .dacts{display:inline-flex;align-items:center;gap:4px;flex:none}
  .ddel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .ddel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.drow{grid-template-columns:1fr auto;grid-template-areas:'term acts' 'def def' 'note note';gap:6px}.dterm{grid-area:term}.ddef{grid-area:def}.dnote{grid-area:note}.dacts{grid-area:acts}}
</style>
