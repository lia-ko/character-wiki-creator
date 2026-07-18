<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  // categories already in use, for the group autocomplete
  const groups = $derived([...new Set(list.map(r => (r.group || '').trim()).filter(Boolean))]);

  function add(){ list.push({ phrase: '', translation: '', literal: '', usage: '', group: '' }); markDirty(); }
  async function del(i){
    const r = list[i];
    const has = (r.phrase && r.phrase.trim()) || (r.translation && r.translation.trim()) || (r.usage && r.usage.trim());
    if (!(await confirmDelete(has, r.phrase ? '“' + r.phrase + '”' : 'this phrase'))) return;
    list.splice(i, 1); markDirty();
  }
</script>

<div class="pb">
  {#each list as r, i (i)}
    <div class="ph">
      <div class="phead">
        <input class="pphrase" bind:value={r.phrase} oninput={markDirty} placeholder="Phrase" />
        <input class="pgroup" list="pbgrp-{sec.key}" bind:value={r.group} oninput={markDirty} placeholder="category" />
        <Reorder {list} {i} />
        <button class="pdel" onclick={() => del(i)} title="remove" aria-label="remove phrase">✕</button>
      </div>
      <input class="ptrans" bind:value={r.translation} oninput={markDirty} placeholder="Meaning / translation" />
      <input class="plit" bind:value={r.literal} oninput={markDirty} placeholder="literal gloss — word-for-word (optional)" />
      <label class="uwrap"><span class="ul">Usage / register</span><textarea class="pusage" rows="2" bind:value={r.usage} oninput={markDirty} placeholder="When it's said & to whom — the register (optional)…"></textarea></label>
    </div>
  {/each}
  <datalist id="pbgrp-{sec.key}">{#each groups as g}<option value={g}></option>{/each}</datalist>
  <button class="addbtn" onclick={add}>＋ Add phrase</button>
</div>

<style>
  .pb{display:flex;flex-direction:column;gap:10px}
  .ph{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:11px 13px;display:flex;flex-direction:column;gap:7px}
  .phead{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:9px;align-items:center}
  .pphrase{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.18rem*var(--hs,1));color:var(--ink);min-width:0}
  .pgroup{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);padding:4px 8px;field-sizing:content;min-width:5em;max-width:12em}
  .pphrase::placeholder,.pgroup::placeholder{color:var(--faint)}
  .pgroup:focus{border-color:var(--accent)}
  .ptrans{background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;outline:none;font-family:var(--body);font-size:.98rem;color:var(--ink);padding:7px 10px;min-width:0}
  .ptrans:focus{border-color:var(--accent)}
  .plit{background:none;border:1px dashed var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.72rem;color:var(--muted);padding:6px 10px;min-width:0}
  .plit:focus{border-color:var(--accent);border-style:solid}
  .uwrap{display:block;border-left:2px solid var(--accent-dim,var(--accent));padding-left:10px}
  .ul{display:block;font-family:var(--mono);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
  .pusage{width:100%;background:none;border:1px dashed var(--rule);border-radius:7px;outline:none;font-family:var(--body);font-style:italic;font-size:.92rem;color:var(--ink);padding:7px 10px;resize:vertical;line-height:1.45}
  .pusage:focus{border-color:var(--accent);border-style:solid}
  .ptrans::placeholder,.plit::placeholder,.pusage::placeholder{color:var(--faint);font-style:normal}
  .pdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .pdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.phead{grid-template-columns:1fr auto auto}.pgroup{grid-column:1/-1;order:5}}
</style>
