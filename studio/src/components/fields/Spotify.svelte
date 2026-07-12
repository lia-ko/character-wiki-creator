<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { parseSpotify, embedUrl, embedHeight } from '../../lib/spotify.js';
  import Reorder from '../Reorder.svelte';
  // `items` is a bindable array (entry.data[sec.key] for entries, or p.spotify for projects)
  let { items } = $props();
  let url = $state('');
  let err = $state('');

  function add(){
    const p = parseSpotify(url.trim());
    if (!p){ err = 'Paste a Spotify link (playlist, album, track, or artist).'; return; }
    if (items.some(x => x.type === p.type && x.id === p.id)){ err = 'That’s already added.'; url = ''; return; }
    items.push(p); url = ''; err = ''; markDirty();
  }
  async function del(i){ if (!(await confirmDelete(true, 'this embed'))) return; items.splice(i, 1); markDirty(); }
  function onkey(e){ if (e.key === 'Enter'){ e.preventDefault(); add(); } }
</script>

<div class="sp">
  {#each items || [] as it, i (it.type + it.id)}
    <div class="spitem">
      <div class="sphead">
        <span class="sptype">{it.type}</span>
        <Reorder list={items} {i} />
        <button class="spdel" onclick={() => del(i)} title="remove">✕</button>
      </div>
      <iframe class="spframe" title="Spotify {it.type}" src={embedUrl(it)} width="100%" height={embedHeight(it)}
              loading="lazy" frameborder="0" allowfullscreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    </div>
  {/each}
  <div class="spadd">
    <input bind:value={url} onkeydown={onkey} oninput={() => err = ''} placeholder="Paste a Spotify link (playlist, album, track, artist)…" />
    <button class="spaddbtn" onclick={add}>＋ Add</button>
  </div>
  {#if err}<div class="sperr">{err}</div>{/if}
</div>

<style>
  .sp{display:flex;flex-direction:column;gap:12px}
  .spitem{border:1px solid var(--rule);border-radius:12px;background:var(--panel);padding:8px;display:flex;flex-direction:column;gap:6px}
  .sphead{display:flex;align-items:center;gap:8px}
  .sptype{font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);flex:1}
  .spdel{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .spdel:hover{color:#fff;background:var(--accent)}
  .spframe{border:0;border-radius:12px;width:100%;display:block}
  .spadd{display:flex;gap:8px}
  .spadd input{flex:1;font:inherit;font-size:.85rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:8px 11px;outline:none}
  .spadd input:focus{border-color:var(--accent)}
  .spaddbtn{font:inherit;font-size:.8rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:8px 13px;cursor:pointer;white-space:nowrap}
  .spaddbtn:hover{border-color:var(--accent)}
  .sperr{font-size:.78rem;color:var(--accent-soft)}
</style>
