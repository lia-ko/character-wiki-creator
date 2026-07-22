<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  import { imgSrc, imgPos } from '../../lib/model.js';
  import { resolveImg } from '../../lib/imagepool.js';
  let { entry, sec, variant = 'grid', mapStyle = false, aspect = '16/10', overlay = null } = $props();
  const imgs = $derived(entry.data[sec.key]);

  // carousel index for the "feature" variant
  let cur = $state(0);
  $effect(() => { if (cur > imgs.length - 1) cur = Math.max(0, imgs.length - 1); });
  function prev(){ cur = (cur - 1 + imgs.length) % imgs.length; }
  function next(){ cur = (cur + 1) % imgs.length; }
  function makeCover(){ if (cur > 0){ const [m] = imgs.splice(cur, 1); imgs.unshift(m); cur = 0; markDirty(); } }

  async function add(){ const start = imgs.length; const urls = await pickImages(true); if (urls && urls.length){ imgs.push(...urls); cur = start; markDirty(); } }
  async function replace(){ const urls = await pickImages(false); if (urls && urls[0]){ if (imgs.length) imgs[0] = urls[0]; else imgs.push(urls[0]); markDirty(); } }
  async function del(i){ if (!(await confirmDelete(true, 'this image'))) return; imgs.splice(i, 1); markDirty(); }

  // drag to reposition the focal point (object-position) of the shown image
  let primaryEl;
  let dragging = $state(false);
  let dstart = null;
  const parsePos = (p) => { const m = /(-?[\d.]+)%\s+(-?[\d.]+)%/.exec(p || ''); return m ? [+m[1], +m[2]] : [50, 50]; };
  function setPos(i, x, y){
    x = Math.max(0, Math.min(100, x)); y = Math.max(0, Math.min(100, y));
    imgs[i] = { src: imgSrc(imgs[i]), pos: `${x.toFixed(1)}% ${y.toFixed(1)}%` };
    markDirty();
  }
  function dragStart(e){
    if (!imgs.length) return;
    const [px, py] = parsePos(imgPos(imgs[cur]));
    dstart = { x: e.clientX, y: e.clientY, px, py };
    dragging = true; primaryEl.setPointerCapture(e.pointerId);
  }
  function dragMove(e){
    if (!dragging || !dstart) return;
    const r = primaryEl.getBoundingClientRect();
    const dx = (e.clientX - dstart.x) / r.width * 100;
    const dy = (e.clientY - dstart.y) / r.height * 100;
    setPos(cur, dstart.px - dx, dstart.py - dy);   // grab-and-drag: image follows the cursor
  }
  function dragEnd(){ dragging = false; dstart = null; }
  function recenter(){ if (imgs.length) setPos(cur, 50, 50); }
  const repositioned = $derived(imgs.length ? imgPos(imgs[cur]) !== '50% 50%' : false);
</script>

{#if variant === 'sigil'}
  <div class="sigil">
    {#if imgs.length}
      <div class="sq" style={`background-image:url(${resolveImg(imgSrc(imgs[0]))})`}><button class="x" onclick={() => del(0)} title="remove">✕</button></div>
    {:else}
      <button class="sq add" onclick={replace}><span>＋</span></button>
    {/if}
  </div>

{:else if variant === 'feature'}
  <div class="feat">
    <div class="primary" class:mapgrid={mapStyle} class:draggable={imgs.length} class:dragging
         bind:this={primaryEl}
         onpointerdown={imgs.length ? dragStart : null} onpointermove={dragMove} onpointerup={dragEnd} onpointercancel={dragEnd}
         style={`aspect-ratio:${aspect}` + (imgs.length ? `;background-image:url(${resolveImg(imgSrc(imgs[cur]))});background-position:${imgPos(imgs[cur])}` : '')}>
      {#if mapStyle}<span class="maptag">Map</span>{/if}
      {#if imgs.length > 1}
        <button class="nav prev" onpointerdown={(e) => e.stopPropagation()} onclick={prev} title="previous">‹</button>
        <button class="nav next" onpointerdown={(e) => e.stopPropagation()} onclick={next} title="next">›</button>
        <span class="ccount">{cur + 1} / {imgs.length}</span>
        <span class="cdots">{#each imgs as _, i (i)}<button type="button" class="cdot" class:on={i === cur} onpointerdown={(e) => e.stopPropagation()} onclick={() => cur = i} aria-label={`image ${i + 1}`}></button>{/each}</span>
      {/if}
      {#if imgs.length}<span class="draghint">drag to reposition</span>{/if}
      {#if !imgs.length}<button class="bigadd" onclick={add}><span>＋</span><small>add {mapStyle ? 'map & imagery' : 'image'}</small></button>{/if}
      {#if overlay}<div class="primoverlay">{@render overlay()}</div>{/if}
    </div>
    <div class="caredit">
      <button class="ce" onclick={add}>＋ Add</button>
      {#if imgs.length}
        <button class="ce" class:on={cur === 0} disabled={cur === 0} onclick={makeCover} title={cur === 0 ? 'this is the header image' : 'use this image as the header'}>★ Header</button>
        {#if repositioned}<button class="ce" onclick={recenter} title="re-center the image">⌖ Recenter</button>{/if}
        <button class="ce danger" onclick={() => del(cur)} title="remove the shown image">✕ Remove</button>
      {/if}
    </div>
  </div>

{:else}
  <div class="gal">
    {#each imgs as src, i (i)}
      <div class="thumb" style={`background-image:url(${resolveImg(imgSrc(src))});background-position:${imgPos(src)}`}><button class="x" onclick={() => del(i)} title="remove">✕</button></div>
    {/each}
    <button class="add" onclick={add}><span>＋</span><small>add image</small></button>
  </div>
{/if}

<style>
  /* grid */
  .gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px}
  .thumb{position:relative;aspect-ratio:3/4;background:var(--panel-2) center/cover;border:1px solid var(--rule);border-radius:8px}
  .add{aspect-ratio:3/4;border:1px dashed var(--rule);border-radius:8px;background:none;color:var(--muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
  .add:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .add span{font-size:1.3rem;font-family:var(--head)}
  .add small{font-family:var(--mono);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase}
  .x{position:absolute;top:4px;right:4px;width:20px;height:20px;border:none;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;cursor:pointer;font-size:.7rem;opacity:0;transition:opacity .1s}
  .thumb:hover .x,.sq:hover .x{opacity:1}.x:hover{background:var(--accent)}

  /* sigil */
  .sigil{display:flex}
  .sq{position:relative;width:96px;height:96px;border-radius:12px;background:var(--panel-2) center/cover;border:1px solid var(--rule)}
  .sq.add{display:flex;align-items:center;justify-content:center;border-style:dashed;color:var(--muted);cursor:pointer}
  .sq.add span{font-size:1.6rem;font-family:var(--head)}
  .sq.add:hover{border-color:var(--accent);color:var(--ink)}

  /* feature: single-image carousel (nav + add / remove-shown, no thumbnail strip) */
  .feat{display:flex;flex-direction:column;gap:8px}
  .primary{position:relative;border-radius:12px;background:var(--panel-2) center/cover;border:1px solid var(--rule);overflow:hidden}
  .primary.draggable{cursor:grab;touch-action:none}
  .primary.dragging{cursor:grabbing}
  .draghint{position:absolute;bottom:8px;right:10px;z-index:1;font-family:var(--mono);font-size:.5rem;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.45);padding:3px 7px;border-radius:5px;opacity:0;transition:opacity .12s;pointer-events:none}
  .primary.draggable:hover .draghint{opacity:1}
  .primary.dragging .draghint{opacity:0}
  .primary.mapgrid::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 26px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 26px)}
  .primary.mapgrid{background-color:#1a2226}
  .maptag{position:absolute;top:8px;left:10px;z-index:1;font-family:var(--mono);font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}
  .bigadd{position:absolute;inset:0;border:none;background:none;color:var(--muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
  .bigadd:hover{color:var(--ink);background:var(--line)}
  .bigadd span{font-size:2rem;font-family:var(--head)}
  .bigadd small{font-family:var(--mono);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase}
  .nav{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;border:none;cursor:pointer;font-size:1.3rem;line-height:1;display:flex;align-items:center;justify-content:center;transition:.1s}
  /* poster-hero overlay: an editable title floats over the banner; the empty area stays draggable */
  .primoverlay{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:26px 30px;pointer-events:none;background:linear-gradient(180deg,transparent 42%,rgba(6,5,8,.92)),linear-gradient(90deg,rgba(6,5,8,.72) 20%,transparent 60%)}
  .primoverlay :global(.et){pointer-events:auto}
  /* mirrors the reader's .posterhero .phin h1 — the banner title outranks a plain page title */
  .primoverlay :global(.et-name){color:#fff;font-size:calc(clamp(2.8rem,6.4vw,4.8rem)*var(--hs,1))}
  .primary:has(.primoverlay) .cdots{display:none}
  .nav.prev{left:9px}.nav.next{right:9px}
  .nav:hover{background:var(--accent)}
  .ccount{position:absolute;top:11px;right:12px;z-index:2;pointer-events:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;color:#fff;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:3px 9px}
  .cdots{position:absolute;left:0;right:0;bottom:11px;z-index:2;display:flex;gap:5px;justify-content:center}
  .cdot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);border:none;padding:0;cursor:pointer}
  .cdot.on{background:#fff}
  .caredit{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
  .ce{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-family:var(--mono);font-size:.55rem;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer;line-height:1}
  .ce:hover:not(:disabled){border-color:var(--accent);color:var(--ink)}
  .ce:disabled{cursor:default}
  .ce.on{color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 35%,var(--rule));background:color-mix(in srgb,var(--accent) 10%,var(--panel-2))}
  .ce.danger:hover:not(:disabled){background:var(--accent);border-color:var(--accent);color:#fff}
</style>
