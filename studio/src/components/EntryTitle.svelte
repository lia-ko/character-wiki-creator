<script>
  import { markDirty } from '../lib/store.svelte.js';
  let { entry, tpl, center = false } = $props();
</script>

<div class="et" class:center>
  <div class="et-kick">{tpl.label}</div>
  <input class="et-name" bind:value={entry.title} oninput={markDirty} placeholder={tpl.title.ph} />
  {#if tpl.motto}
    <div class="words"><input class="et-motto" bind:value={entry.subtitle} oninput={markDirty} placeholder={tpl.subtitle.ph} /></div>
  {:else}
    <input class="et-sub" bind:value={entry.subtitle} oninput={markDirty} placeholder={tpl.subtitle.ph} />
  {/if}
</div>

<style>
  .et{display:flex;flex-direction:column;gap:4px;min-width:0}
  .et.center{align-items:center;text-align:center}
  .et-kick{font-family:var(--mono);font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
  .et.center .et-kick{text-align:center}
  /* matches the reader's .etitle h1 so the edit view is WYSIWYG */
  .et-name{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(clamp(2.4rem,5vw,3.4rem)*var(--hs,1));line-height:.98;color:var(--ink);width:100%}
  .et.center .et-name{text-align:center}
  .et-sub{background:none;border:none;outline:none;font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);width:100%}
  .et.center .et-sub{text-align:center}
  .words{display:flex;align-items:center;gap:10px;justify-content:center;width:100%;margin-top:2px}
  .words::before,.words::after{content:"";height:1px;flex:1;max-width:80px;background:var(--rule)}
  .et-motto{background:none;border:none;outline:none;font-family:var(--body);font-style:italic;font-size:calc(.95rem*var(--bs,1));color:var(--muted);text-align:center;width:auto;min-width:8em}
  @media(max-width:640px){.et-name{font-size:calc(clamp(1.9rem,7vw,2.8rem)*var(--hs,1))}}
</style>
