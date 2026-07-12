<script>
  import { generate, STYLES, WATER } from '../lib/towngen.js';
  import { app, openProjects, openAnyEntry } from '../lib/store.svelte.js';
  import { download } from '../lib/download.js';

  let uidn = 0;
  let pins = $state([]);
  const entries = $derived(app.ws.projects.flatMap(p => p.entries.map(e => ({ id: e.id, title: e.title, type: e.type }))));

  let drag = null; let suppressClick = false;
  function svgPoint(evt){ const pt = svgEl.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY; const p = pt.matrixTransform(svgEl.getScreenCTM().inverse()); return [p.x, p.y]; }
  function mapClick(evt){ if (suppressClick){ suppressClick = false; return; } const [x, y] = svgPoint(evt); pins.push({ id: ++uidn, x, y, name: 'Place ' + (pins.length + 1), targetId: '' }); }
  function pinDown(evt, i){ evt.stopPropagation(); suppressClick = true; drag = i; }
  function move(evt){ if (drag == null) return; const [x, y] = svgPoint(evt); pins[drag].x = x; pins[drag].y = y; }
  function up(){ drag = null; }
  function delPin(i){ pins.splice(i, 1); }
  function linkName(id){ const e = entries.find(x => x.id === id); return e ? e.title : ''; }

  let seed = $state('havenport');
  let style = $state('medieval');
  let water = $state('coast');
  let size = $state(0.6);
  let density = $state(1);
  let nameSeed = $state(0);
  let showLabels = $state(true);
  let nameOverride = $state({});
  let svgEl;

  const town = $derived(generate({ seed, style, water, size, density, nameSeed }));
  // clear manual district renames whenever the layout or names regenerate
  $effect(() => { town.districts; nameOverride = {}; });
  const displayName = (i) => nameOverride[i] ?? town.districts[i]?.name ?? '';

  function reroll(){ seed = Math.random().toString(36).slice(2, 9); }
  function rerollNames(){ nameSeed++; }
  function slug(){ return (seed || 'map').replace(/[^a-z0-9]+/gi, '-').toLowerCase(); }

  function svgString(){
    const s = svgEl.cloneNode(true);
    s.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(s);
  }
  function downloadSVG(){ download(new Blob([svgString()], { type: 'image/svg+xml' }), slug() + '-map.svg'); }
  function downloadPNG(){
    const str = svgString(); const img = new Image(); const scale = 2;
    img.onload = () => { const cv = document.createElement('canvas'); cv.width = town.W * scale; cv.height = town.H * scale; const ctx = cv.getContext('2d'); ctx.scale(scale, scale); ctx.drawImage(img, 0, 0); cv.toBlob(b => download(b, slug() + '-map.png'), 'image/png'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  }
</script>

<div class="lab">
  <aside class="panel">
    <button class="back" onclick={openProjects}>← Back</button>
    <h1>Map Lab</h1>
    <p class="sub">Seeded town &amp; city maps. Download, then add as imagery on any Realm or Location.</p>

    <label class="fld">Seed
      <div class="seedrow"><input bind:value={seed} placeholder="seed" /><button class="mini" onclick={reroll} title="random seed">🎲</button></div>
    </label>

    <label class="fld">Style
      <select bind:value={style}>{#each Object.entries(STYLES) as [k, v]}<option value={k}>{v.label}</option>{/each}</select>
    </label>

    <label class="fld">Water
      <select bind:value={water}>{#each Object.entries(WATER) as [k, v]}<option value={k}>{v}</option>{/each}</select>
    </label>

    <label class="fld">Size <span class="v">{Math.round(size * 100)}</span>
      <input type="range" min="0" max="1" step="0.05" bind:value={size} />
    </label>
    <label class="fld">Density <span class="v">{density.toFixed(2)}×</span>
      <input type="range" min="0.5" max="2" step="0.1" bind:value={density} />
    </label>

    <label class="chk"><input type="checkbox" bind:checked={showLabels} /> District labels</label>
    {#if showLabels && town.districts.length}
      <div class="dists">
        <div class="dhead"><span>Districts</span><button class="mini" onclick={rerollNames} title="reroll names">↺ names</button></div>
        {#each town.districts as d, i}
          <input class="dname" value={displayName(i)} oninput={(e) => nameOverride[i] = e.target.value} placeholder="district" />
        {/each}
      </div>
    {/if}

    <div class="pins">
      <div class="dhead"><span>Pins</span><span class="tip">click the map to drop one</span></div>
      {#each pins as pin, i (pin.id)}
        <div class="pinrow">
          <input class="pn" bind:value={pin.name} placeholder="place name" />
          <select class="pl" bind:value={pin.targetId}>
            <option value="">— link entry —</option>
            {#each entries as e}<option value={e.id}>{e.title || 'Untitled'} ({e.type})</option>{/each}
          </select>
          {#if pin.targetId}<button class="mini" onclick={() => openAnyEntry(pin.targetId)} title="open linked entry">↗</button>{/if}
          <button class="mini del" onclick={() => delPin(i)} title="remove">✕</button>
        </div>
      {/each}
    </div>

    <div class="exports">
      <button class="ex" onclick={reroll}>↻ New town</button>
      <button class="ex" onclick={downloadSVG}>↓ SVG</button>
      <button class="ex" onclick={downloadPNG}>↓ PNG</button>
    </div>
    <p class="hint">Same seed + settings always draws the same map, so it's reproducible.</p>
  </aside>

  <div class="stage">
    <svg bind:this={svgEl} viewBox="0 0 {town.W} {town.H}" class="map" onclick={mapClick} onpointermove={move} onpointerup={up} onpointerleave={up} role="application" aria-label="town map">
      <defs>
        <pattern id="wave" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
          <path d="M0 6 Q2 4 4 6 T8 6" fill="none" stroke="#9fb4bf" stroke-width="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={town.W} height={town.H} fill="#f4f1e8" />
      <!-- water -->
      {#each town.water as w}
        <path d={w.path} fill="#dce6e8" />
        <path d={w.path} fill="url(#wave)" />
        {#if w.line}<path d={'M' + w.line.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')} fill="none" stroke="#4a6b74" stroke-width="1.4" />{/if}
      {/each}
      <!-- docks -->
      {#each town.docks as d}<path d={d.path} stroke="#2a2a26" stroke-width="2.4" fill="none" stroke-linecap="round" />{/each}
      <!-- field parcels (rural) -->
      {#each town.fields || [] as f}<path d={f.path} fill="none" stroke="#cbc4b0" stroke-width="1" stroke-dasharray="5 4" />{/each}
      <!-- streets / ward roads -->
      {#each town.streets as s}
        {#if s.road}<path d={s.path} fill="none" stroke="#cfc7b4" stroke-width="1" />
        {:else}<path d={s.path} fill="none" stroke="#d8d0bd" stroke-width={s.w} stroke-linecap="round" />{/if}
      {/each}
      <!-- buildings -->
      {#each town.buildings as b}<path d={b} fill="#fbfaf5" stroke="#26261f" stroke-width="0.7" stroke-linejoin="round" />{/each}
      <!-- wall + towers -->
      {#if town.wall}
        <path d={town.wall} fill="none" stroke="#26261f" stroke-width="4" stroke-linejoin="round" />
        {#each town.towers as t}<circle cx={t.x} cy={t.y} r="4.5" fill="#f4f1e8" stroke="#26261f" stroke-width="2" />{/each}
      {/if}
      <!-- district labels (self-contained attrs for export fidelity) -->
      {#if showLabels}
        {#each town.districts as d, i}
          <text x={d.x.toFixed(1)} y={d.y.toFixed(1)} text-anchor="middle" dominant-baseline="middle"
                font-family="Georgia, 'Times New Roman', serif" font-size="15" letter-spacing="1.3" font-weight="500"
                fill="#26261f" stroke="#f4f1e8" stroke-width="3.5" paint-order="stroke">{(displayName(i) || '').toUpperCase()}</text>
        {/each}
      {/if}
      <!-- pins -->
      {#each pins as pin, i (pin.id)}
        <g class="pin" onpointerdown={(e) => pinDown(e, i)}>
          <line x1={pin.x} y1={pin.y} x2={pin.x} y2={pin.y - 16} stroke="#a8323a" stroke-width="2" />
          <circle cx={pin.x} cy={pin.y - 18} r="6" fill="#a8323a" stroke="#f4f1e8" stroke-width="2" />
          <text x={pin.x + 10} y={pin.y - 14} font-family="Georgia, serif" font-size="14" font-weight="600" fill="#26261f" stroke="#f4f1e8" stroke-width="3" paint-order="stroke">{pin.name}</text>
        </g>
      {/each}
      <rect x="1" y="1" width={town.W - 2} height={town.H - 2} fill="none" stroke="#26261f" stroke-width="2" pointer-events="none" />
    </svg>
  </div>
</div>

<style>
  .lab{display:grid;grid-template-columns:260px 1fr;gap:0;min-height:calc(100vh - var(--appbar-h))}
  .panel{border-right:1px solid var(--rule);padding:22px 20px;display:flex;flex-direction:column;gap:14px;background:var(--panel)}
  .back{align-self:flex-start;font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .back:hover{border-color:var(--accent)}
  h1{font-family:var(--head);font-weight:400;font-size:1.7rem;margin:4px 0 0;color:var(--ink)}
  .sub{margin:0;color:var(--muted);font-size:.8rem;line-height:1.5}
  .fld{display:flex;flex-direction:column;gap:6px;font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .fld .v{color:var(--accent-soft)}
  .fld input[type=range]{width:100%;accent-color:var(--accent)}
  select,.seedrow input{font:inherit;font-size:.82rem;text-transform:none;letter-spacing:0;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:7px 9px;width:100%}
  .seedrow{display:flex;gap:6px}
  .mini{flex:none;background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;cursor:pointer;padding:0 10px;font-size:.9rem}
  .mini:hover{border-color:var(--accent)}
  .exports{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
  .ex{flex:1;min-width:70px;font:inherit;font-size:.76rem;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:9px;cursor:pointer;font-weight:600}
  .ex:first-child{background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);font-weight:400}
  .ex:hover{opacity:.92}
  .hint{margin:2px 0 0;color:var(--faint);font-size:.72rem;line-height:1.5}
  .chk{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);cursor:pointer}
  .chk input{accent-color:var(--accent)}
  .dists{display:flex;flex-direction:column;gap:5px;border:1px solid var(--rule);border-radius:8px;padding:9px}
  .dhead{display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:2px}
  .dhead .mini{font-size:.56rem;letter-spacing:.06em;padding:3px 7px;text-transform:uppercase;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:5px;cursor:pointer}
  .dhead .mini:hover{border-color:var(--accent);color:var(--ink)}
  .dname{font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:6px;padding:5px 8px}
  .pins{display:flex;flex-direction:column;gap:6px;border:1px solid var(--rule);border-radius:8px;padding:9px}
  .dhead{display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .dhead .tip{text-transform:none;letter-spacing:0;font-family:var(--sans);font-size:.66rem;color:var(--faint)}
  .pinrow{display:grid;grid-template-columns:1fr auto auto;gap:5px;align-items:center}
  .pinrow .pn{grid-column:1/-1;font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:6px;padding:5px 8px}
  .pinrow .pl{font:inherit;font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 6px;min-width:0}
  .pinrow .mini{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--muted);cursor:pointer;padding:4px 8px;font-size:.72rem}
  .pinrow .mini:hover{border-color:var(--accent);color:var(--ink)}
  .pinrow .mini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  :global(.pin){cursor:grab}
  .stage{padding:26px;display:flex;align-items:flex-start;justify-content:center;overflow:auto}
  .map{width:100%;max-width:1000px;height:auto;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.4)}
  @media(max-width:760px){ .lab{grid-template-columns:1fr} .panel{border-right:none;border-bottom:1px solid var(--rule)} }
</style>
