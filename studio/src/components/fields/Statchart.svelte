<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  import { radarGeom, ptsAttr, labelAnchor } from '../../lib/statchart.js';
  let { entry, sec } = $props();
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d) || !Array.isArray(d.stats)) entry.data[sec.key] = { stats: [{ label: 'STR', value: 5 }, { label: 'DEX', value: 5 }, { label: 'CON', value: 5 }], max: 10, view: 'radar' };
    else { if (!d.max) d.max = 10; if (!d.view) d.view = 'radar'; }
  });
  const d = $derived(entry.data[sec.key] || { stats: [], max: 10, view: 'radar' });
  const size = 240;
  const geom = $derived(radarGeom(d.stats.map(s => Number(s.value) || 0), Number(d.max) || 10, size));
  const asRadar = $derived(d.view === 'radar' && d.stats.length >= 3);
  const pct = (v) => Math.max(0, Math.min(100, (Number(v) || 0) / (Number(d.max) || 10) * 100));

  function add(){ d.stats.push({ label: 'Stat', value: Math.round((Number(d.max) || 10) / 2) }); markDirty(); }
  async function del(i){ const s = d.stats[i]; if ((s.label || s.value) && !(await confirmDelete(true, s.label || 'this stat'))) return; d.stats.splice(i, 1); markDirty(); }
</script>

<div class="sc">
  <div class="head">
    <span class="seg">
      <button class:on={d.view === 'radar'} onclick={() => { d.view = 'radar'; markDirty(); }}>Radar</button>
      <button class:on={d.view === 'bars'} onclick={() => { d.view = 'bars'; markDirty(); }}>Bars</button>
    </span>
    <label class="maxf">Max <input type="number" min="1" bind:value={d.max} oninput={markDirty} /></label>
  </div>

  <!-- preview -->
  <div class="preview">
    {#if asRadar}
      <svg viewBox="0 0 {size} {size}" class="radar">
        {#each geom.rings as ring}<polygon points={ptsAttr(ring)} class="ring" />{/each}
        {#each geom.axisEnds as a}<line x1={geom.cx} y1={geom.cy} x2={a.x} y2={a.y} class="axis" />{/each}
        <polygon points={ptsAttr(geom.data)} class="shape" />
        {#each geom.data as p}<circle cx={p.x} cy={p.y} r="2.6" class="dot" />{/each}
        {#each d.stats as s, i}<text x={geom.labelPts[i].x} y={geom.labelPts[i].y} text-anchor={labelAnchor(geom.labelPts[i].x, geom.cx)} dominant-baseline="middle" class="lbl">{s.label}</text>{/each}
      </svg>
    {:else}
      <div class="bars">
        {#each d.stats as s (s)}
          <div class="bar"><span class="bl">{s.label || '—'}</span><span class="bt"><i style="width:{pct(s.value)}%"></i></span><span class="bv">{s.value ?? ''}</span></div>
        {/each}
        {#if d.view === 'radar' && d.stats.length < 3}<p class="hint">Add 3+ stats to draw a radar shape.</p>{/if}
      </div>
    {/if}
  </div>

  <!-- editor rows -->
  <div class="rows">
    {#each d.stats as s, i (i)}
      <div class="srow">
        <input class="slabel" bind:value={s.label} oninput={markDirty} placeholder="stat" />
        <input class="sval" type="number" bind:value={s.value} oninput={markDirty} placeholder="0" />
        <Reorder list={d.stats} {i} />
        <button class="sx" onclick={() => del(i)} title="remove" aria-label="remove">✕</button>
      </div>
    {/each}
    <button class="addbtn" onclick={add}>＋ Add stat</button>
  </div>
</div>

<style>
  .sc{display:flex;flex-direction:column;gap:12px}
  .head{display:flex;align-items:center;gap:14px}
  .seg{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden}
  .seg button{border:none;background:var(--panel-2);color:var(--muted);cursor:pointer;padding:5px 12px;font:inherit;font-size:.76rem;border-right:1px solid var(--rule)}
  .seg button:last-child{border-right:none}
  .seg button.on{background:var(--accent);color:#fff}
  .maxf{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);display:inline-flex;align-items:center;gap:6px}
  .maxf input{width:4em;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.82rem;padding:4px 6px;outline:none}
  .preview{display:flex;justify-content:center;border:1px solid var(--rule-soft,var(--rule));border-radius:12px;background:var(--panel-2);padding:14px}
  svg.radar{width:min(260px,100%);height:auto}
  .radar .ring{fill:none;stroke:var(--rule);stroke-width:1}
  .radar .axis{stroke:var(--rule);stroke-width:1}
  .radar .shape{fill:color-mix(in srgb,var(--accent) 22%,transparent);stroke:var(--accent);stroke-width:2;stroke-linejoin:round}
  .radar .dot{fill:var(--accent)}
  .radar .lbl{font-family:var(--mono);font-size:9px;letter-spacing:.04em;fill:var(--muted)}
  .bars{width:100%;display:flex;flex-direction:column;gap:6px}
  .bar{display:grid;grid-template-columns:5.5em 1fr 2.5em;gap:9px;align-items:center}
  .bar .bl{font-family:var(--mono);font-size:.56rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);text-align:right}
  .bar .bt{height:8px;border-radius:5px;background:var(--rule);overflow:hidden}
  .bar .bt i{display:block;height:100%;background:var(--accent);border-radius:5px}
  .bar .bv{font-family:var(--mono);font-size:.72rem;color:var(--ink)}
  .hint{font-family:var(--sans);font-size:.74rem;color:var(--faint);margin:4px 0 0}
  .rows{display:flex;flex-direction:column;gap:6px}
  .srow{display:grid;grid-template-columns:1fr 5em auto auto;gap:8px;align-items:center}
  .slabel,.sval{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.9rem;padding:6px 9px;outline:none}
  .slabel:focus,.sval:focus{border-color:var(--accent)}
  .sx{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:5px 9px;font-size:.72rem}
  .sx:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:7px 13px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
