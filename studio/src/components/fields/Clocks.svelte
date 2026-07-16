<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);

  // pie-wedge path for segment i of n (12 o'clock start, clockwise)
  function wedge(i, n){
    const cx = 24, cy = 24, r = 22;
    const a0 = (-90 + i * 360 / n) * Math.PI / 180;
    const a1 = (-90 + (i + 1) * 360 / n) * Math.PI / 180;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = (360 / n) > 180 ? 1 : 0;
    return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
  }
  function add(){ list.push({ label: '', segments: 4, filled: 0 }); markDirty(); }
  async function del(i){ const c = list[i]; if (!(await confirmDelete((c.label || '').trim() || c.filled, 'this clock'))) return; list.splice(i, 1); markDirty(); }
  function setSeg(c, i){ c.filled = c.filled === i + 1 ? i : i + 1; markDirty(); }
  function resize(c, d){ c.segments = Math.max(2, Math.min(12, c.segments + d)); if (c.filled > c.segments) c.filled = c.segments; markDirty(); }
</script>

<div class="clocks">
  {#each list as c, i (i)}
    <div class="clk">
      <button class="clkx" onclick={() => del(i)} title="remove clock" aria-label="remove clock" tabindex="-1">✕</button>
      <svg class="clkface" viewBox="0 0 48 48" aria-label={`${c.filled} of ${c.segments}`}>
        {#each Array(c.segments) as _, s (s)}
          <path class="seg" class:fill={s < c.filled} d={wedge(s, c.segments)} onclick={() => setSeg(c, s)} />
        {/each}
        <circle class="clkring" cx="24" cy="24" r="22" />
      </svg>
      <input class="clklbl" bind:value={c.label} oninput={markDirty} placeholder="Clock…" />
      <div class="clkctl">
        <button onclick={() => resize(c, -1)} title="fewer segments" aria-label="fewer segments">−</button>
        <span>{c.filled}/{c.segments}</span>
        <button onclick={() => resize(c, 1)} title="more segments" aria-label="more segments">＋</button>
      </div>
    </div>
  {/each}
  <button class="clkadd" onclick={add} title="add a clock">＋ Clock</button>
</div>

<style>
  .clocks{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
  .clk{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;width:104px}
  .clkx{position:absolute;top:-4px;right:2px;border:none;background:none;color:var(--faint);cursor:pointer;font-size:.62rem;line-height:1;padding:2px;border-radius:4px;opacity:0;transition:opacity .12s}
  .clk:hover .clkx{opacity:1}
  .clkx:hover{color:#fff;background:var(--accent)}
  .clkface{width:66px;height:66px}
  .seg{fill:var(--panel-2);stroke:var(--bg);stroke-width:1.3;cursor:pointer;transition:fill .1s}
  .seg:hover{fill:color-mix(in srgb,var(--accent) 35%,var(--panel-2))}
  .seg.fill{fill:var(--accent)}
  .seg.fill:hover{fill:color-mix(in srgb,var(--accent) 80%,#000)}
  .clkring{fill:none;stroke:var(--rule);stroke-width:1.4}
  .clklbl{width:100%;text-align:center;background:none;border:none;outline:none;font-family:var(--sans);font-size:.8rem;color:var(--ink)}
  .clklbl::placeholder{color:var(--faint)}
  .clkctl{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.64rem;color:var(--muted)}
  .clkctl button{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:5px;cursor:pointer;width:18px;height:18px;line-height:1;font-size:.72rem;display:flex;align-items:center;justify-content:center}
  .clkctl button:hover{border-color:var(--accent);color:var(--ink)}
  .clkadd{align-self:center;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 12px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .clkadd:hover{border-color:var(--accent);color:var(--ink)}
</style>
