<script>
  import { markDirty } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();

  // Flexible score grid: rows of {label, value}, plus a `mode`:
  //   'dnd'   — value is a score; a derived modifier (⌊(v−10)/2⌋) shows below it
  //   'value' — the value stands alone (PbtA +1, Fate skills, CoC 65%, Savage d8…)
  //   'dots'  — value is 0..max, shown as clickable dot ratings (WoD/Storyteller, CofD…)
  const OLD = [['str', 'STR'], ['dex', 'DEX'], ['con', 'CON'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA']];
  function normalize(raw){
    if (raw && Array.isArray(raw.rows)) return { max: 5, ...raw };
    if (raw && typeof raw === 'object' && ('str' in raw || 'dex' in raw))
      return { mode: 'dnd', max: 5, rows: OLD.map(([k, l]) => ({ label: l, value: raw[k] ?? '' })) };
    const labels = (sec.abils && sec.abils.length) ? sec.abils : ['Stat 1', 'Stat 2', 'Stat 3'];
    const mode = sec.mod || 'value';
    return { mode, max: sec.dotsMax || 5, rows: labels.map(l => ({ label: l, value: mode === 'dnd' ? 10 : (mode === 'dots' ? 0 : '') })) };
  }
  // upgrade legacy / seed shape once, in place, so binds persist
  $effect(() => { const raw = entry.data[sec.key]; if (!raw || !Array.isArray(raw.rows)) entry.data[sec.key] = normalize(raw); });
  const model = $derived(entry.data[sec.key]);
  const dnd = $derived(model?.mode === 'dnd');
  const dots = $derived(model?.mode === 'dots');
  const dmax = $derived(model?.max || 5);

  const mod = (v) => { const n = parseInt(v, 10); if (Number.isNaN(n)) return '—'; const m = Math.floor((n - 10) / 2); return (m >= 0 ? '+' : '') + m; };
  function setMode(m){ if (!model) return; model.mode = m; if (m === 'dots') model.rows.forEach(r => { r.value = Math.max(0, Math.min(dmax, parseInt(r.value, 10) || 0)); }); markDirty(); }
  function setDot(row, di){ const cur = parseInt(row.value, 10) || 0; row.value = cur === di + 1 ? di : di + 1; markDirty(); }
  function add(){ model.rows.push({ label: '', value: dnd ? 10 : (dots ? 0 : '') }); markDirty(); }
  function remove(i){ model.rows.splice(i, 1); markDirty(); }
</script>

{#if model?.rows}
  <div class="abwrap">
    <div class="abhd">
      <span class="abht">Show as</span>
      <span class="abseg">
        <button class:on={dnd} onclick={() => setMode('dnd')} title="a score with a derived D&D-style modifier">D&amp;D</button>
        <button class:on={model?.mode === 'value'} onclick={() => setMode('value')} title="the value as-is (PbtA, Fate, %-based, dice…)">Plain</button>
        <button class:on={dots} onclick={() => setMode('dots')} title="dot ratings (World of Darkness / Storyteller, CofD…)">Dots</button>
      </span>
    </div>
    <div class="abil">
      {#each model.rows as row, i (i)}
        <div class="ab" class:isdots={dots}>
          <button class="abx" onclick={() => remove(i)} title="remove" aria-label="remove stat" tabindex="-1">✕</button>
          <input class="abl" bind:value={row.label} oninput={markDirty} placeholder="Stat" aria-label="stat name" />
          {#if dots}
            <div class="dots" role="group" aria-label="rating">
              {#each Array(dmax) as _, di}
                <button class="dot" class:fill={(parseInt(row.value, 10) || 0) > di} onclick={() => setDot(row, di)} aria-label={`rate ${di + 1}`}></button>
              {/each}
            </div>
          {:else}
            <input class="absc" bind:value={row.value} oninput={markDirty} placeholder="—" aria-label="value" />
            {#if dnd}<div class="abmod">{mod(row.value)}</div>{/if}
          {/if}
        </div>
      {/each}
      <button class="abadd" onclick={add} title="add a stat" aria-label="add stat">＋</button>
    </div>
  </div>
{/if}

<style>
  .abwrap{display:flex;flex-direction:column;gap:8px}
  .abhd{display:flex;align-items:center;gap:8px}
  .abht{font-family:var(--mono);font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .abseg{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden}
  .abseg button{font:inherit;font-size:.66rem;background:var(--panel-2);color:var(--muted);border:none;padding:4px 10px;cursor:pointer}
  .abseg button + button{border-left:1px solid var(--rule)}
  .abseg button.on{background:var(--accent);color:#fff}
  .abil{display:grid;grid-template-columns:repeat(auto-fit,minmax(84px,1fr));gap:8px}
  .ab{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:9px 4px 7px}
  .ab.isdots{padding-bottom:9px}
  .abl{width:100%;text-align:center;background:none;border:none;outline:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:600}
  .abl::placeholder{color:var(--faint)}
  .absc{width:100%;text-align:center;background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.35rem*var(--hs,1));color:var(--ink)}
  .absc::placeholder{color:var(--faint)}
  .abmod{font-family:var(--mono);font-size:.72rem;color:var(--muted);border-top:1px solid var(--rule);width:64%;text-align:center;padding-top:4px}
  .dots{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:5px 0 1px}
  .dot{width:13px;height:13px;border-radius:50%;border:1.5px solid var(--muted);background:none;cursor:pointer;padding:0}
  .dot.fill{background:var(--accent);border-color:var(--accent)}
  .dot:hover{border-color:var(--accent)}
  .abx{position:absolute;top:2px;right:2px;border:none;background:none;color:var(--faint);cursor:pointer;font-size:.6rem;line-height:1;padding:2px;border-radius:4px;opacity:0;transition:opacity .12s}
  .ab:hover .abx{opacity:1}
  .abx:hover{color:#fff;background:var(--accent)}
  .abadd{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:10px;cursor:pointer;font-size:1rem;min-height:64px}
  .abadd:hover{border-color:var(--accent);color:var(--ink)}
</style>
