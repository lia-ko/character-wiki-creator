<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  // categories already in use, for the group autocomplete
  const groups = $derived([...new Set(list.map(r => (r.group || '').trim()).filter(Boolean))]);

  function add(){ list.push({ term: '', pron: '', def: '', example: '', source: '', group: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.term && r.term.trim()) || (r.def && r.def.trim()) || (r.example && r.example.trim());
    if (!(await confirmDelete(has, r.term ? '“' + r.term + '”' : 'this term'))) return;
    list.splice(i, 1); markDirty();
  }
</script>

<div class="lex">
  {#each list as r, i (i)}
    <div class="term">
      <div class="thead">
        <input class="tterm" bind:value={r.term} oninput={markDirty} placeholder="Term" />
        <input class="tpron" bind:value={r.pron} oninput={markDirty} placeholder="/pronunciation/" />
        <input class="tgroup" list="lexgrp-{sec.key}" bind:value={r.group} oninput={markDirty} placeholder="category" />
        <Reorder {list} {i} />
        <button class="tdel" onclick={() => del(i)} title="remove" aria-label="remove term">✕</button>
      </div>
      <textarea class="tdef" rows="2" bind:value={r.def} oninput={markDirty} placeholder="Definition"></textarea>
      <label class="exwrap"><span class="exl">In a sentence</span><textarea class="tex" rows="2" bind:value={r.example} oninput={markDirty} placeholder="Use the word in a natural sentence — to get the register right…"></textarea></label>
      <input class="tsrc" bind:value={r.source} oninput={markDirty} placeholder="source (optional)" />
    </div>
  {/each}
  <datalist id="lexgrp-{sec.key}">{#each groups as g}<option value={g}></option>{/each}</datalist>
  <button class="addbtn" onclick={add}>＋ Add term</button>
</div>

<style>
  .lex{display:flex;flex-direction:column;gap:10px}
  .term{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:11px 13px;display:flex;flex-direction:column;gap:7px}
  .thead{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,0.8fr) auto auto auto;gap:9px;align-items:center}
  .tterm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.15rem*var(--hs,1));color:var(--ink);min-width:0}
  .tpron{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.62rem;color:var(--faint);padding:4px 8px;min-width:0}
  .tgroup{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);padding:4px 8px;field-sizing:content;min-width:5em;max-width:12em}
  .tterm::placeholder,.tpron::placeholder,.tgroup::placeholder{color:var(--faint)}
  .tpron:focus,.tgroup:focus{border-color:var(--accent)}
  .tdef{background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;outline:none;font-family:var(--body);font-size:.96rem;color:var(--ink);padding:7px 10px;resize:vertical;line-height:1.45}
  .tdef:focus{border-color:var(--accent)}
  .exwrap{display:block;border-left:2px solid var(--accent-dim,var(--accent));padding-left:10px}
  .exl{display:block;font-family:var(--mono);font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
  .tex{width:100%;background:none;border:1px dashed var(--rule);border-radius:7px;outline:none;font-family:var(--body);font-style:italic;font-size:.94rem;color:var(--ink);padding:7px 10px;resize:vertical;line-height:1.45}
  .tex:focus{border-color:var(--accent);border-style:solid}
  .tdef::placeholder,.tex::placeholder{color:var(--faint);font-style:normal}
  .tsrc{align-self:flex-start;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.04em;color:var(--faint);padding:4px 9px;field-sizing:content;min-width:8em;max-width:100%}
  .tsrc:focus{border-color:var(--accent);color:var(--muted)}
  .tdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .tdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.thead{grid-template-columns:1fr auto auto auto}.tpron{grid-column:1/-1;order:5}}
</style>
