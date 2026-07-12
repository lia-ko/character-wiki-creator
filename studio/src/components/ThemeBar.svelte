<script>
  import { PALETTES, FACES, SIZES } from '../lib/theme.js';
  import { markDirty } from '../lib/store.svelte.js';
  let { target, showPortrait = false } = $props();
  const onchange = () => markDirty();
</script>

<div class="htools">
  <label>Theme
    <select bind:value={target.palette} {onchange}>
      {#each PALETTES as p}<option value={p.id}>{p.name}</option>{/each}
    </select>
  </label>
  <label>Heading
    <select bind:value={target.headFont} {onchange}>
      {#each FACES as f}<option value={f.id}>{f.name}</option>{/each}
    </select>
    <select bind:value={target.headScale} {onchange}>
      {#each SIZES as s}<option value={s.v}>{s.l}</option>{/each}
    </select>
  </label>
  <label>Body
    <select bind:value={target.bodyFont} {onchange}>
      {#each FACES as f}<option value={f.id}>{f.name}</option>{/each}
    </select>
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
</style>
