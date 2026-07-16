<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const DICE = [4, 6, 8, 10, 12, 20, 100];
  const model = $derived(entry.data[sec.key]);
  let rolled = $state(null);   // { value, idx } — ephemeral, not saved

  function parseRange(s){
    if (s == null) return null; s = String(s).trim(); if (!s) return null;
    const m = s.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m) return [+m[1], +m[2]];
    if (/^\d+$/.test(s)) return [+s, +s];
    return null;
  }
  const die = $derived((parseInt(model?.die, 10) || (model?.rows?.length) || 1));
  function setDie(d){ model.die = d; markDirty(); }
  function addRow(){ model.rows.push({ range: '', text: '' }); markDirty(); }
  async function delRow(i){
    const r = model.rows[i]; const has = ((r.range || '') + (r.text || '')).trim();
    if (!(await confirmDelete(has, 'this row'))) return;
    model.rows.splice(i, 1); markDirty();
  }
  function autoNumber(){ model.rows.forEach((row, k) => row.range = String(k + 1)); model.die = model.rows.length; rolled = null; markDirty(); }
  function roll(){
    const r = 1 + Math.floor(Math.random() * die);
    let idx = -1;
    model.rows.forEach((row, k) => { const rg = parseRange(row.range); if (idx < 0 && rg && r >= rg[0] && r <= rg[1]) idx = k; });
    rolled = { value: r, idx };
  }
</script>

<div class="rt">
  <div class="rthd">
    <span class="rtlbl">Die</span>
    <span class="rtdice">
      {#each DICE as d}<button class:on={die === d} onclick={() => setDie(d)}>d{d}</button>{/each}
    </span>
    <span class="grow"></span>
    <button class="rtauto" onclick={autoNumber} title="number the rows 1…n and set the die to match">1…n</button>
  </div>
  <div class="rtrows">
    {#each model.rows as row, i (i)}
      <div class="rtrow" class:hit={rolled?.idx === i}>
        <input class="rtrange" bind:value={row.range} oninput={markDirty} placeholder={String(i + 1)} aria-label="range" />
        <input class="rttext" bind:value={row.text} oninput={markDirty} placeholder="result…" aria-label="result" />
        <div class="rtacts"><Reorder list={model.rows} {i} /><button class="rtdel" onclick={() => delRow(i)} title="remove" aria-label="remove row">✕</button></div>
      </div>
    {/each}
    <button class="addbtn" onclick={addRow}>＋ Add row</button>
  </div>
  <div class="rtbar">
    <button class="rtroll" onclick={roll}>🎲 Roll d{die}</button>
    {#if rolled}<span class="rtout">Rolled <b>{rolled.value}</b>{rolled.idx < 0 ? ' · no match' : ''}</span>{/if}
  </div>
</div>

<style>
  .rt{display:flex;flex-direction:column;gap:9px}
  .rthd{display:flex;align-items:center;gap:8px}
  .rtlbl{font-family:var(--mono);font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .grow{flex:1}
  .rtdice{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden}
  .rtdice button{font:inherit;font-size:.68rem;background:var(--panel-2);color:var(--muted);border:none;padding:4px 8px;cursor:pointer}
  .rtdice button + button{border-left:1px solid var(--rule)}
  .rtdice button.on{background:var(--accent);color:#fff}
  .rtauto{font:inherit;font-size:.66rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 9px;cursor:pointer}
  .rtauto:hover{border-color:var(--accent);color:var(--ink)}
  .rtrows{display:flex;flex-direction:column;gap:5px}
  .rtrow{display:grid;grid-template-columns:64px 1fr auto;gap:10px;align-items:center;border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:6px 10px}
  .rtrow.hit{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,var(--panel));box-shadow:inset 3px 0 var(--accent)}
  .rtrange{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.78rem;text-align:center;color:var(--ink);padding:4px 6px;min-width:0}
  .rtrange:focus{border-color:var(--accent)}
  .rttext{background:none;border:none;outline:none;font-family:var(--body);font-size:.98rem;color:var(--ink);min-width:0}
  .rtrange::placeholder,.rttext::placeholder{color:var(--faint)}
  .rtacts{display:inline-flex;align-items:center;gap:4px;flex:none}
  .rtacts{display:inline-flex;align-items:center;gap:4px;opacity:0;transition:opacity .12s}
  .rtrow:hover .rtacts,.rtrow:focus-within .rtacts{opacity:1}
  .rtdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .rtdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:1px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  .rtbar{display:flex;align-items:center;gap:12px}
  .rtroll{font:inherit;font-size:.9rem;font-weight:600;background:var(--accent);color:#fff;border:none;border-radius:9px;padding:9px 18px;cursor:pointer}
  .rtroll:hover{opacity:.92}
  .rtroll:active{transform:translateY(1px)}
  .rtout{font-family:var(--mono);font-size:.74rem;color:var(--muted)}
  .rtout b{color:var(--ink);font-size:1rem}
</style>
