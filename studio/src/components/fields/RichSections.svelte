<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);
  function add(){ list.push({ h: 'Section', body: '' }); markDirty(); }
  async function del(i){ const s = list[i]; const has = (s.body && s.body.trim()) || (s.h && s.h !== 'Section'); if (!(await confirmDelete(has, s.h ? '“' + s.h + '”' : 'this section'))) return; list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
</script>

<div class="secs">
  {#each list as s, i (i)}
    <div class="sec">
      <div class="head">
        <input class="h" bind:value={s.h} oninput={markDirty} placeholder="Heading" />
        <Reorder list={list} {i} />
        <button class="delx" onclick={() => del(i)} title="remove">✕</button>
      </div>
      <RichEditor value={s.body} multiline placeholder="Body text… (⌘B / ⌘I for bold / italic)" oninput={(v) => setBody(i, v)} />
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add {sec.label.toLowerCase()} section</button>
</div>

<style>
  .secs{display:flex;flex-direction:column;gap:6px}
  .sec{padding:4px 0}
  .head{display:flex;align-items:center;gap:8px;margin-bottom:4px}
  .h{flex:1;background:none;border:none;outline:none;font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{width:100%;margin-top:6px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
