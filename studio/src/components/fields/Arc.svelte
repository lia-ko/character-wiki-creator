<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import { ARC_TYPES, ARC_GLYPH, ARC_C, arcMode, arcPalette, arcLine, arcArea, effectiveGeom, defaultPos, yToPos } from '../../lib/arc.js';

  let { entry, sec } = $props();
  const mode = $derived(sec.mode || 'character');
  const cfg = $derived(arcMode(mode));
  const pal = $derived(arcPalette(mode));
  // guarantee shape for entries that predate this field
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d)) entry.data[sec.key] = { type: 'positive', pos: null, believes: '', is: '', turn: '', learns: '', becomes: '', want: '', need: '' };
    else if (!d.type) d.type = 'positive';
  });
  const a = $derived(entry.data[sec.key] || {});
  const g = $derived(effectiveGeom(a, mode));
  const typeColor = (id) => id === 'positive' ? pal.top : id === 'negative' ? pal.bottom : ARC_C.flat;
  function setType(id){ a.type = id; a.pos = null; markDirty(); }
  function resetShape(){ a.pos = null; markDirty(); }

  // drag the three nodes to place their heights
  let svgEl;
  let drag = $state(null);
  function ensurePos(){ if (!a.pos) a.pos = { ...defaultPos(a.type || 'positive') }; }
  function startDrag(e, node){ ensurePos(); drag = node; try { svgEl.setPointerCapture(e.pointerId); } catch {} e.preventDefault(); }
  function onMove(e){
    if (!drag || !svgEl) return;
    const r = svgEl.getBoundingClientRect();
    a.pos[drag] = yToPos((e.clientY - r.top) / r.height * 220);
    markDirty();
  }
  function endDrag(e){ if (drag){ drag = null; try { svgEl.releasePointerCapture(e.pointerId); } catch {} } }
</script>

<div class="arc" style="--arc-lo:{pal.bottom};--arc-hi:{pal.top}">
  <!-- arc-type selector -->
  <div class="atypes">
    {#each ARC_TYPES as id}
      <button class:on={(a.type || 'positive') === id} style={(a.type || 'positive') === id ? `background:color-mix(in srgb,${typeColor(id)} 80%,#000);border-color:${typeColor(id)};color:#fff` : ''} onclick={() => setType(id)}>
        <svg width="34" height="16" viewBox="0 0 34 16"><path class="gl" d={ARC_GLYPH[id]} fill="none" stroke-width="2" stroke-linecap="round" style={(a.type || 'positive') === id ? 'stroke:#fff' : ''} /></svg>
        {cfg.typeLabel[id]}
      </button>
    {/each}
  </div>

  <!-- live curve -->
  <div class="chart">
    <span class="ax top" style="color:{pal.top}">{cfg.axisTop}</span>
    <span class="ax bot" style="color:{pal.bottom}">{cfg.axisBottom}</span>
    <svg class="curve" class:dragging={drag} bind:this={svgEl} onpointermove={onMove} onpointerup={endDrag} onpointercancel={endDrag} viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="{a.type || 'positive'} arc">
      <defs>
        <linearGradient id="arcfill-{entry.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={g.top} stop-opacity=".16" />
          <stop offset="1" stop-color={g.bottom} stop-opacity=".05" />
        </linearGradient>
        <linearGradient id="arcline-{entry.id}" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color={g.bottom} /><stop offset=".5" stop-color={ARC_C.accent} /><stop offset="1" stop-color={g.endColor} />
        </linearGradient>
      </defs>
      <line x1="90" y1="34" x2="620" y2="34" stroke={ARC_C.rule} stroke-dasharray="3 5" />
      <line x1="90" y1="186" x2="620" y2="186" stroke={ARC_C.rule} stroke-dasharray="3 5" />
      <path d={arcArea(g)} fill="url(#arcfill-{entry.id})" />
      <path d={arcLine(g)} fill="none" stroke="url(#arcline-{entry.id})" stroke-width="3.5" stroke-linecap="round" />
      <!-- want / pull baseline -->
      <line x1="90" y1="205" x2="600" y2="205" stroke={ARC_C.want} stroke-width="1.5" stroke-opacity=".45" />
      <path d="M600 205 l-9 -4 M600 205 l-9 4" fill="none" stroke={ARC_C.want} stroke-width="1.5" stroke-opacity=".65" />
      <!-- nodes -->
      <circle cx={g.start.x} cy={g.start.y} r="6.5" fill={ARC_C.node} stroke={g.bottom} stroke-width="3" />
      <circle cx={g.turn.x} cy={g.turn.y} r="7" fill={ARC_C.accent} stroke={ARC_C.node} stroke-width="2" />
      <circle cx={g.end.x} cy={g.end.y} r="6.5" fill={g.endColor} stroke={ARC_C.node} stroke-width="2" />
      <!-- large transparent drag handles -->
      <circle class="grab" cx={g.start.x} cy={g.start.y} r="18" fill="transparent" onpointerdown={(e) => startDrag(e, 'start')} role="slider" tabindex="0" aria-label="start height" aria-valuenow={Math.round((a.pos?.start ?? yToPos(g.start.y)) * 100)} />
      <circle class="grab" cx={g.turn.x} cy={g.turn.y} r="18" fill="transparent" onpointerdown={(e) => startDrag(e, 'turn')} role="slider" tabindex="0" aria-label="turn height" aria-valuenow={Math.round((a.pos?.turn ?? yToPos(g.turn.y)) * 100)} />
      <circle class="grab" cx={g.end.x} cy={g.end.y} r="18" fill="transparent" onpointerdown={(e) => startDrag(e, 'end')} role="slider" tabindex="0" aria-label="end height" aria-valuenow={Math.round((a.pos?.end ?? yToPos(g.end.y)) * 100)} />
      <text x={g.start.x} y={g.start.y - 12} text-anchor="middle" style="fill:{ARC_C.muted}" class="nl">START</text>
      <text x={g.turn.x} y={g.turn.y > 120 ? g.turn.y + 20 : g.turn.y - 12} text-anchor="middle" style="fill:{ARC_C.accent}" class="nl">{g.turnLabel}</text>
      <text x={g.end.x} y={g.end.y - 12} text-anchor="middle" style="fill:{g.endColor}" class="nl">END</text>
    </svg>
  </div>
  <div class="draghint">
    <span>Drag the dots to place the low point &amp; endpoints.</span>
    {#if a.pos}<button class="reset" onclick={resetShape}>Reset to {cfg.typeLabel[a.type || 'positive']} shape</button>{/if}
  </div>

  <!-- editable captions -->
  <div class="caps">
    <div class="cap start">
      <div class="cph">{cfg.startLabel}</div>
      {#each cfg.start as r}
        <label class="k">{r.label}{#if r.hint}<span class="hint">{r.hint}</span>{/if}</label>
        <input bind:value={a[r.key]} oninput={markDirty} placeholder={r.ph} />
      {/each}
    </div>
    <div class="cap turn">
      <div class="cph">{cfg.turn.label}</div>
      <textarea rows="3" bind:value={a[cfg.turn.key]} oninput={markDirty} placeholder={cfg.turn.ph}></textarea>
    </div>
    <div class="cap end">
      <div class="cph">{cfg.endLabel}</div>
      {#each cfg.end as r}
        <label class="k">{r.label}{#if r.hint}<span class="hint">{r.hint}</span>{/if}</label>
        <input bind:value={a[r.key]} oninput={markDirty} placeholder={r.ph} />
      {/each}
    </div>
  </div>

  <!-- forces -->
  <div class="forces">
    {#each cfg.forces as f}
      <div class="force {f.color}">
        <label class="fk">{f.label}{#if f.sub}<span>{f.sub}</span>{/if}</label>
        <input bind:value={a[f.key]} oninput={markDirty} placeholder={f.ph} />
        <p class="fx">{f.foot}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .arc{display:flex;flex-direction:column;gap:14px}
  .atypes{display:flex;gap:8px}
  .atypes button{flex:1;display:flex;align-items:center;gap:9px;border:1px solid var(--rule);background:var(--panel);color:var(--faint);border-radius:9px;padding:8px 11px;cursor:pointer;font-family:var(--mono);font-size:.58rem;letter-spacing:.05em;text-transform:uppercase}
  .atypes button .gl{stroke:var(--faint)}
  .atypes button:hover{color:var(--ink)}

  .chart{position:relative;border:1px solid var(--rule-soft,var(--rule));border-radius:12px;background:linear-gradient(180deg,var(--panel-2),var(--panel));padding:6px 8px 2px}
  .ax{position:absolute;font-family:var(--mono);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;pointer-events:none}
  .ax.top{top:10px;left:14px}
  .ax.bot{bottom:34px;left:14px}
  svg.curve{width:100%;height:auto;display:block;touch-action:none}
  svg.curve.dragging{cursor:ns-resize}
  svg.curve .nl{font-family:var(--mono);font-size:10px;letter-spacing:1px}
  svg.curve .grab{cursor:ns-resize;outline:none}
  svg.curve .grab:focus-visible{stroke:var(--accent-soft);stroke-width:1.5;stroke-dasharray:3 3}
  .draghint{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:-2px}
  .draghint span{font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  .reset{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;padding:3px 9px;cursor:pointer;font-family:var(--sans);font-size:.7rem}
  .reset:hover{border-color:var(--accent);color:var(--ink)}

  .caps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .cap{border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:10px 12px}
  .cap.start{border-top:2px solid var(--arc-lo,#b0596a)} .cap.turn{border-top:2px solid var(--accent)} .cap.end{border-top:2px solid var(--arc-hi,#5aa06f)}
  .cap .cph{font-family:var(--mono);font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:8px}
  .cap .k{display:block;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin:8px 0 3px}
  .cap .k:first-of-type{margin-top:0}
  .cap .k .hint{color:var(--accent-soft);opacity:.85;margin-left:4px}
  .cap input,.cap textarea{width:100%;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.9rem;padding:6px 8px;outline:none;resize:vertical}
  .cap input:focus,.cap textarea:focus{border-color:var(--accent)}
  .cap input::placeholder,.cap textarea::placeholder{color:var(--faint)}

  .forces{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .force{border:1px solid var(--rule);border-radius:11px;background:var(--panel);padding:11px 13px}
  .force.want{border-left:3px solid #c99a5a} .force.need{border-left:3px solid #5f9fb0}
  .force .fk{display:block;font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:5px}
  .force.want .fk{color:#c99a5a} .force.need .fk{color:#5f9fb0}
  .force .fk span{color:var(--faint)}
  .force input{width:100%;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.95rem;padding:6px 8px;outline:none}
  .force input:focus{border-color:var(--accent)}
  .force input::placeholder{color:var(--faint)}
  .force .fx{margin:5px 0 0;font-size:.76rem;color:var(--faint)}
  @media(max-width:640px){.caps,.forces{grid-template-columns:1fr}}
</style>
