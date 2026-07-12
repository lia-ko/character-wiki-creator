<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  function add(){ list.push({ title: 'Excerpt', body: '', source: '' }); markDirty(); }
  function del(i){ list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
</script>

<div class="excs">
  {#each list as e, i (i)}
    <div class="exc">
      <div class="head">
        <input class="t" bind:value={e.title} oninput={markDirty} placeholder="Title" />
        <Reorder list={list} {i} />
        <button class="delx" onclick={() => del(i)} title="remove">✕</button>
      </div>
      <RichEditor value={e.body} multiline placeholder="Passage…" oninput={(v) => setBody(i, v)} />
      <input class="src" bind:value={e.source} oninput={markDirty} placeholder="source / scene" />
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add excerpt</button>
</div>

<style>
  .excs{display:flex;flex-direction:column;gap:8px}
  .exc{border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:10px 12px}
  .head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .t{flex:1;background:none;border:none;outline:none;font-family:var(--body);color:var(--ink);font-size:calc(.95rem*var(--bs,1))}
  .src{width:100%;margin-top:6px;background:none;border:none;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
