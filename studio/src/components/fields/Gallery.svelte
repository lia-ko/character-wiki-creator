<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  let { entry, sec, variant = 'grid', mapStyle = false, aspect = '16/10' } = $props();
  const imgs = $derived(entry.data[sec.key]);

  // carousel index for the "feature" variant
  let cur = $state(0);
  $effect(() => { if (cur > imgs.length - 1) cur = Math.max(0, imgs.length - 1); });
  function prev(){ cur = (cur - 1 + imgs.length) % imgs.length; }
  function next(){ cur = (cur + 1) % imgs.length; }
  function makeCover(){ if (cur > 0){ const [m] = imgs.splice(cur, 1); imgs.unshift(m); cur = 0; markDirty(); } }

  async function add(){ const start = imgs.length; const urls = await pickImages(true); if (urls && urls.length){ imgs.push(...urls); cur = start; markDirty(); } }
  async function replace(){ const urls = await pickImages(false); if (urls && urls[0]){ if (imgs.length) imgs[0] = urls[0]; else imgs.push(urls[0]); markDirty(); } }
  function del(i){ if (!confirmDelete(true, 'this image')) return; imgs.splice(i, 1); markDirty(); }
</script>

{#if variant === 'sigil'}
  <div class="sigil">
    {#if imgs.length}
      <div class="sq" style={`background-image:url(${imgs[0]})`}><button class="x" onclick={() => del(0)} title="remove">✕</button></div>
    {:else}
      <button class="sq add" onclick={replace}><span>＋</span></button>
    {/if}
  </div>

{:else if variant === 'feature'}
  <div class="feat">
    <div class="primary" class:mapgrid={mapStyle} style={`aspect-ratio:${aspect}` + (imgs.length ? `;background-image:url(${imgs[cur]})` : '')}>
      {#if mapStyle}<span class="maptag">Map</span>{/if}
      {#if imgs.length > 1}
        <button class="nav prev" onclick={prev} title="previous">‹</button>
        <button class="nav next" onclick={next} title="next">›</button>
      {/if}
      {#if !imgs.length}<button class="bigadd" onclick={add}><span>＋</span><small>add {mapStyle ? 'map & imagery' : 'image'}</small></button>{/if}
    </div>
    {#if imgs.length}
      <div class="cnav">
        <button class="cbtn" onclick={prev} disabled={imgs.length < 2}>‹</button>
        <span class="ccount">{cur + 1} / {imgs.length}</span>
        <button class="cbtn" onclick={next} disabled={imgs.length < 2}>›</button>
      </div>
    {/if}
    <div class="caredit">
      <button onclick={add}>＋ Add</button>
      {#if imgs.length}
        {#if cur === 0}<span class="isheader">★ header image</span>{:else}<button onclick={makeCover} title="use this as the header / cover image">★ Set as header</button>{/if}
        <button onclick={() => del(cur)}>✕ Remove shown</button>
      {/if}
    </div>
  </div>

{:else}
  <div class="gal">
    {#each imgs as src, i (i)}
      <div class="thumb" style={`background-image:url(${src})`}><button class="x" onclick={() => del(i)} title="remove">✕</button></div>
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
  .primary.mapgrid::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 26px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 26px)}
  .primary.mapgrid{background-color:#1a2226}
  .maptag{position:absolute;top:8px;left:10px;z-index:1;font-family:var(--mono);font-size:.5rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}
  .bigadd{position:absolute;inset:0;border:none;background:none;color:var(--muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
  .bigadd:hover{color:var(--ink);background:var(--line)}
  .bigadd span{font-size:2rem;font-family:var(--head)}
  .bigadd small{font-family:var(--mono);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase}
  .nav{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.5);color:#fff;border:none;cursor:pointer;font-size:1.3rem;line-height:1;display:flex;align-items:center;justify-content:center;transition:.1s}
  .nav.prev{left:9px}.nav.next{right:9px}
  .nav:hover{background:var(--accent)}
  .cnav{display:flex;align-items:center;justify-content:center;gap:14px}
  .cbtn{background:none;border:1px solid var(--rule);border-radius:6px;color:var(--muted);width:34px;height:26px;cursor:pointer;font-size:1rem;line-height:1}
  .cbtn:hover:not(:disabled){color:var(--ink);border-color:var(--accent)}.cbtn:disabled{opacity:.4;cursor:default}
  .ccount{font-family:var(--mono);font-size:.62rem;letter-spacing:.12em;color:var(--faint)}
  .caredit{display:flex;gap:8px;justify-content:center}
  .caredit button{font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--rule);background:none;color:var(--muted);border-radius:6px;padding:6px 12px;cursor:pointer}
  .caredit button:hover{border-color:var(--accent);color:var(--ink)}
  .isheader{display:flex;align-items:center;font-family:var(--mono);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-soft);padding:6px 4px}
</style>
