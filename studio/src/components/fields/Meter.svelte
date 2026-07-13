<script>
  import { markDirty } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();
  // guarantee shape for any entry that predates this field type
  $effect(() => {
    const cur = entry.data[sec.key];
    if (!cur || typeof cur !== 'object' || !Array.isArray(cur.levels)) {
      entry.data[sec.key] = { levels: (sec.levels || []).slice(), at: 0 };
    }
  });
  const v = $derived(entry.data[sec.key] || { levels: [], at: 0 });

  function setAt(i){ v.at = i; markDirty(); }
  function addLevel(){ v.levels.push('New'); markDirty(); }
  function removeLevel(i){ v.levels.splice(i, 1); if (v.at >= v.levels.length) v.at = Math.max(0, v.levels.length - 1); markDirty(); }
</script>

<div class="met">
  <div class="mrow">
    {#each v.levels as lv, i (i)}
      <div class="mcell" class:on={v.at === i}>
        <input bind:value={v.levels[i]} oninput={markDirty} placeholder="level" />
        <button class="mmark" onclick={() => setAt(i)} title="mark as current" aria-label="mark as current level">{v.at === i ? '●' : '○'}</button>
        <button class="mdel" onclick={() => removeLevel(i)} title="remove level">✕</button>
      </div>
    {/each}
    <button class="madd" onclick={addLevel} title="add level">＋</button>
  </div>
  <p class="mhint">The filled circle marks the current level for this entry.</p>
</div>

<style>
  .met{display:flex;flex-direction:column;gap:6px}
  .mrow{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch}
  .mcell{display:flex;align-items:center;gap:4px;border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:4px 6px 4px 10px}
  .mcell.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--panel))}
  .mcell input{background:none;border:none;outline:none;font-family:var(--mono);font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);field-sizing:content;min-width:3.5em;max-width:12em}
  .mmark{background:none;border:none;cursor:pointer;color:var(--faint);font-size:.8rem;line-height:1;padding:2px}
  .mcell.on .mmark{color:var(--accent)}
  .mdel{background:none;border:none;cursor:pointer;color:var(--faint);font-size:.7rem;line-height:1;padding:2px}
  .mdel:hover{color:var(--accent)}
  .madd{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;cursor:pointer;padding:4px 12px;font-size:.9rem}
  .madd:hover{border-color:var(--accent);color:var(--ink)}
  .mhint{margin:0;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
</style>
