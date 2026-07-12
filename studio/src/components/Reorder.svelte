<script>
  import { markDirty } from '../lib/store.svelte.js';
  let { list, i, horizontal = false, onmove = null, first = false, last = false } = $props();
  function move(d){ if (onmove){ onmove(d); return; } const j = i + d; if (j < 0 || j >= list.length) return; const t = list[i]; list[i] = list[j]; list[j] = t; markDirty(); }
  const disPrev = $derived(onmove ? first : i === 0);
  const disNext = $derived(onmove ? last : i === list.length - 1);
</script>

<span class="ro" class:h={horizontal}>
  <button class="rob" onclick={(e) => { e.stopPropagation(); move(-1); }} disabled={disPrev} title={horizontal ? 'move earlier' : 'move up'} aria-label="move earlier">{horizontal ? '‹' : '▲'}</button>
  <button class="rob" onclick={(e) => { e.stopPropagation(); move(1); }} disabled={disNext} title={horizontal ? 'move later' : 'move down'} aria-label="move later">{horizontal ? '›' : '▼'}</button>
</span>

<style>
  .ro{display:inline-flex;flex-direction:column;gap:1px;flex:none}
  .ro.h{flex-direction:row;gap:2px}
  .rob{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:4px;cursor:pointer;font-size:.5rem;line-height:1;padding:2px 0;width:18px;height:13px;display:flex;align-items:center;justify-content:center}
  .ro.h .rob{height:20px;width:20px;font-size:.8rem}
  .rob:hover:not(:disabled){border-color:var(--accent);color:var(--ink)}
  .rob:disabled{opacity:.3;cursor:default}
</style>
