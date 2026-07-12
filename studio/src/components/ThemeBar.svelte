<script>
  import { PALETTES, SIZES } from '../lib/theme.js';
  import { markDirty } from '../lib/store.svelte.js';
  import { dismissable } from '../lib/dismissable.js';
  import FontPicker from './FontPicker.svelte';
  let { target, showPortrait = false } = $props();
  const onchange = () => markDirty();

  let paletteOpen = $state(false);
  const curPal = $derived(PALETTES.find(p => p.id === target.palette) || PALETTES[0]);
  function pickPalette(id){ target.palette = id; paletteOpen = false; markDirty(); }
</script>

<div class="htools">
  <label>Theme
    <div class="ppick" use:dismissable={() => paletteOpen = false}>
      <button type="button" class="pptrig" onclick={() => paletteOpen = !paletteOpen} aria-expanded={paletteOpen}>
        <span class="ppsw"><i style="background:{curPal.bg}"></i><i style="background:{curPal.accent}"></i><i style="background:{curPal.ink}"></i></span>
        <span class="ppname">{curPal.name}</span>
        <span class="ppcar">▾</span>
      </button>
      {#if paletteOpen}
        <div class="ppmenu">
          {#each PALETTES as p}
            <button type="button" class="pt" class:on={p.id === target.palette} onclick={() => pickPalette(p.id)} title={p.name}>
              <span class="ptview" style="border-color:{p.rule}">
                <i style="background:{p.bg}"></i><i style="background:{p.panel2}"></i><i style="background:{p.accent}"></i><i style="background:{p.ink}"></i>
              </span>
              <span class="ptname">{p.name}{#if p.id === target.palette} ✓{/if}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </label>
  <label>Heading
    <FontPicker bind:value={target.headFont} onpick={onchange} />
    <select bind:value={target.headScale} {onchange}>
      {#each SIZES as s}<option value={s.v}>{s.l}</option>{/each}
    </select>
  </label>
  <label>Body
    <FontPicker bind:value={target.bodyFont} onpick={onchange} />
    <select bind:value={target.bodyScale} {onchange}>
      {#each SIZES as s}<option value={s.v}>{s.l}</option>{/each}
    </select>
  </label>
  {#if showPortrait}
    <label>Portrait
      <select bind:value={target.portraitScale} {onchange}>
        {#each SIZES as s}<option value={s.v}>{s.l}</option>{/each}
      </select>
    </label>
  {/if}
</div>

<style>
  .htools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  label{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  select{font:inherit;font-size:.75rem;text-transform:none;letter-spacing:0;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 9px}

  /* theme swatch picker */
  .ppick{position:relative}
  .pptrig{display:flex;align-items:center;gap:8px;font:inherit;font-size:.75rem;text-transform:none;letter-spacing:0;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:5px 9px;cursor:pointer}
  .pptrig:hover{border-color:var(--accent)}
  .ppsw{display:inline-flex;width:30px;height:16px;border-radius:4px;overflow:hidden;border:1px solid var(--rule);flex:none}
  .ppsw i{flex:1}
  .ppname{white-space:nowrap}
  .ppcar{font-size:.6rem;color:var(--faint)}
  .ppmenu{position:absolute;top:calc(100% + 6px);left:0;z-index:var(--z-dropdown);display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(320px,86vw);max-height:min(60vh,430px);overflow:auto;padding:10px;background:var(--panel);border:1px solid var(--rule);border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.5)}
  .pt{display:flex;flex-direction:column;gap:5px;padding:5px;background:none;border:1px solid transparent;border-radius:8px;cursor:pointer}
  .pt:hover{border-color:var(--rule);background:var(--panel-2)}
  .pt.on{border-color:var(--accent)}
  .ptview{display:flex;height:34px;border-radius:6px;overflow:hidden;border:1px solid var(--rule)}
  .ptview i{flex:1}
  .ptname{font-family:var(--mono);font-size:.56rem;letter-spacing:.04em;text-transform:none;color:var(--muted);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pt.on .ptname{color:var(--accent-soft)}
</style>
