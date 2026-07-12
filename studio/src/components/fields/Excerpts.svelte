<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);

  let open = $state({ 0: true });
  function toggle(i){ open[i] = !open[i]; }
  function add(){ list.push({ title: 'Excerpt', body: '', source: '' }); open[list.length - 1] = true; markDirty(); }
  function del(i){ const e = list[i]; const has = (e.body && e.body.trim()) || e.source || (e.title && e.title !== 'Excerpt'); if (!confirmDelete(has, e.title ? '“' + e.title + '”' : 'this excerpt')) return; list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
</script>

<div class="excs">
  {#each list as e, i (i)}
    <div class="exc" class:open={open[i]}>
      <div class="head">
        <input class="t" bind:value={e.title} oninput={markDirty} placeholder="Title" />
        {#if !open[i] && e.source}<span class="hsrc">{e.source}</span>{/if}
        <Reorder list={list} {i} />
        <button class="xmini" onclick={() => toggle(i)} title={open[i] ? 'collapse' : 'expand'}>{open[i] ? '▾' : '▸'}</button>
        <button class="xmini delx" onclick={() => del(i)} title="remove">✕</button>
      </div>
      {#if open[i]}
        <div class="body">
          <RichEditor value={e.body} multiline placeholder="Passage…" oninput={(v) => setBody(i, v)} />
          <input class="src" bind:value={e.source} oninput={markDirty} placeholder="source / scene" />
        </div>
      {/if}
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add excerpt</button>
</div>

<style>
  .excs{display:flex;flex-direction:column;gap:8px}
  .exc{border:1px solid var(--rule);border-radius:10px;background:var(--panel);overflow:hidden}
  .exc.open{border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .head{display:flex;align-items:center;gap:8px;padding:9px 12px}
  .t{flex:1;min-width:0;background:none;border:none;outline:none;font-family:var(--body);color:var(--ink);font-size:calc(.95rem*var(--bs,1))}
  .hsrc{font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40%;flex:none}
  .body{padding:2px 14px 14px;border-top:1px solid var(--rule);display:flex;flex-direction:column;gap:8px}
  .src{width:100%;background:none;border:none;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .xmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .xmini:hover{border-color:var(--accent);color:var(--ink)}
  .xmini.delx:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
