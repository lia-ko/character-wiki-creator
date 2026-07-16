<script module>
  // shared drag registry, keyed by the actual list array reference so every
  // <Reorder> rendered for the same list can hit-test against its siblings.
  const REG = new Map();
  function reg(list, rec){
    let set = REG.get(list); if (!set){ set = new Set(); REG.set(list, set); }
    set.add(rec);
    return () => { set.delete(rec); if (!set.size) REG.delete(list); };
  }
</script>

<script>
  import { markDirty } from '../lib/store.svelte.js';
  let { list, i, horizontal = false, onmove = null, first = false, last = false } = $props();

  function move(d){ if (onmove){ onmove(d); return; } const j = i + d; if (j < 0 || j >= list.length) return; const t = list[i]; list[i] = list[j]; list[j] = t; markDirty(); }
  const disPrev = $derived(onmove ? first : i === 0);
  const disNext = $derived(onmove ? last : i === list.length - 1);

  // ---- drag to reorder (plain-list mode only; onmove lists keep the arrows) ----
  const canDrag = $derived(!onmove && (list?.length || 0) > 1);
  let rootEl = $state(null);
  let dragging = $state(false);
  let from = -1, target = -1;

  $effect(() => {
    if (onmove || !rootEl) return;
    return reg(list, { el: rootEl, get i(){ return i; } });
  });

  function clearMarks(){ const set = REG.get(list); if (set) for (const r of set) r.el.classList.remove('rodrop', 'rodrop-h'); }

  function down(e){
    if (!canDrag) return;
    e.preventDefault(); e.stopPropagation();
    from = i; target = -1; dragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.classList.add('ro-dragging');
  }
  function movePtr(e){
    if (!dragging) return;
    const set = REG.get(list); if (!set) return;
    const p = horizontal ? e.clientX : e.clientY;
    let best = null, bd = Infinity;
    for (const r of set){ const b = r.el.getBoundingClientRect(); const c = horizontal ? (b.left + b.right) / 2 : (b.top + b.bottom) / 2; const d = Math.abs(c - p); if (d < bd){ bd = d; best = r; } }
    clearMarks();
    target = best && best.i !== from ? best.i : -1;
    if (best && target >= 0) best.el.classList.add(horizontal ? 'rodrop-h' : 'rodrop');
  }
  function up(){
    if (!dragging) return;
    dragging = false; document.body.classList.remove('ro-dragging'); clearMarks();
    if (target >= 0 && target !== from){
      const [m] = list.splice(from, 1);
      const to = from < target ? target - 1 : target;   // account for the removed slot
      list.splice(to, 0, m); markDirty();
    }
    from = -1; target = -1;
  }
</script>

<span class="ro" class:h={horizontal} class:dragging bind:this={rootEl}>
  {#if canDrag}
    <button class="grip" onpointerdown={down} onpointermove={movePtr} onpointerup={up} onpointercancel={up} title="drag to reorder" aria-label="drag to reorder" tabindex="-1">⠿</button>
  {/if}
  <span class="arrows" class:h={horizontal}>
    <button class="rob" onclick={(e) => { e.stopPropagation(); move(-1); }} disabled={disPrev} title={horizontal ? 'move earlier' : 'move up'} aria-label="move earlier">{horizontal ? '‹' : '▲'}</button>
    <button class="rob" onclick={(e) => { e.stopPropagation(); move(1); }} disabled={disNext} title={horizontal ? 'move later' : 'move down'} aria-label="move later">{horizontal ? '›' : '▼'}</button>
  </span>
</span>

<style>
  .ro{display:inline-flex;align-items:center;gap:3px;flex:none;position:relative}
  .ro:not(.h){flex-direction:row}
  .arrows{display:inline-flex;flex-direction:column;gap:1px}
  .arrows.h{flex-direction:row;gap:2px}
  .grip{border:none;background:none;color:var(--faint);cursor:grab;padding:0 1px;font-size:.8rem;line-height:1;touch-action:none;letter-spacing:-2px;align-self:stretch;display:flex;align-items:center;border-radius:4px}
  .grip:hover{color:var(--muted)}
  .ro.dragging .grip{cursor:grabbing;color:var(--accent)}
  .rob{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:4px;cursor:pointer;font-size:.5rem;line-height:1;padding:2px 0;width:18px;height:13px;display:flex;align-items:center;justify-content:center}
  .arrows.h .rob{height:20px;width:20px;font-size:.8rem}
  .rob:hover:not(:disabled){border-color:var(--accent);color:var(--ink)}
  .rob:disabled{opacity:.3;cursor:default}
  /* drop indicator: a colored bar on the side of the row the item will land at */
  .ro.rodrop::before{content:'';position:absolute;left:-6px;right:-6px;top:-5px;height:2px;background:var(--accent);border-radius:2px;box-shadow:0 0 6px var(--accent)}
  .ro.rodrop-h::before{content:'';position:absolute;top:-6px;bottom:-6px;left:-4px;width:2px;background:var(--accent);border-radius:2px;box-shadow:0 0 6px var(--accent)}
</style>
