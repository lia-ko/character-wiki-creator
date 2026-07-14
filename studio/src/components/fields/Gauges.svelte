<script>
  import { markDirty } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();
  // tolerate any pre-existing shape
  $effect(() => { if (!Array.isArray(entry.data[sec.key])) entry.data[sec.key] = []; });
  const rows = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);

  function setAt(g, i){ g.at = i; markDirty(); }
  function addMeter(){ rows.push({ label: 'Gauge', levels: ['Low', 'Mid', 'High', 'Max'], at: 0 }); markDirty(); }
  function addValue(){ rows.push({ label: 'Fact', text: true, value: '' }); markDirty(); }
  function remove(i){ rows.splice(i, 1); markDirty(); }
</script>

<div class="gauges">
  {#each rows as g, i (i)}
    <div class="tile">
      <div class="th">
        <input class="tlabel" bind:value={g.label} oninput={markDirty} placeholder="label" />
        <button class="tx" onclick={() => remove(i)} title="remove">✕</button>
      </div>
      {#if g.text}
        <input class="tval" bind:value={g.value} oninput={markDirty} placeholder="—" />
      {:else if Array.isArray(g.levels)}
        <div class="pips" role="group" aria-label={g.label}>
          {#each g.levels as lv, j (j)}
            <button class="pip" class:on={j <= g.at} onclick={() => setAt(g, j)} title={lv} aria-label={lv}></button>
          {/each}
        </div>
        <div class="tnow">{g.levels[g.at] || ''}</div>
      {/if}
    </div>
  {/each}
  <div class="gadd">
    <button onclick={addMeter}>＋ meter</button>
    <button onclick={addValue}>＋ value</button>
  </div>
</div>

<style>
  .gauges{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .tile{background:var(--panel-2);border:1px solid var(--rule);border-radius:8px;padding:7px 9px 8px;min-width:0}
  .th{display:flex;align-items:center;gap:4px}
  .tlabel{flex:1;min-width:0;background:none;border:none;outline:none;font-family:var(--mono);font-size:.5rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .tlabel:focus{color:var(--ink)}
  .tx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.62rem;line-height:1;padding:1px 3px;opacity:0;transition:opacity .12s}
  .tile:hover .tx{opacity:1}
  .tx:hover{color:var(--accent)}
  .tval{width:100%;background:none;border:none;outline:none;font-family:var(--head,var(--body));font-size:.98rem;color:var(--ink);margin-top:2px}
  .pips{display:flex;gap:3px;margin-top:5px}
  .pip{flex:1;height:5px;min-width:8px;border:none;border-radius:3px;background:var(--rule);cursor:pointer;padding:0}
  .pip.on{background:var(--accent)}
  .pip:hover{outline:1px solid color-mix(in srgb,var(--accent) 50%,transparent)}
  .tnow{font-family:var(--head,var(--body));font-size:.9rem;color:var(--ink);margin-top:4px}
  .gadd{grid-column:1 / -1;display:flex;gap:6px}
  .gadd button{flex:1;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:6px;cursor:pointer;font-family:var(--sans);font-size:.72rem}
  .gadd button:hover{border-color:var(--accent);color:var(--ink)}
</style>
