<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import { MATRIX_KINDS, MATRIX_COLOR, pairKey } from '../../lib/matrix.js';
  let { entry, sec, others } = $props();
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d) || !Array.isArray(d.people) || typeof d.pairs !== 'object') entry.data[sec.key] = { people: [], pairs: {} };
  });
  const d = $derived(entry.data[sec.key] || { people: [], pairs: {} });
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const addedIds = $derived(new Set(d.people.map(p => p.targetId).filter(Boolean)));
  const pickable = $derived(chars.filter(o => !addedIds.has(o.id)));
  const nameOf = (p) => p.name || ((others || []).find(o => o.id === p.targetId)?.title) || 'Unknown';

  let brush = $state('ally');
  const nid = () => 'm' + Math.random().toString(36).slice(2, 8);
  function addChar(id){ if (!id) return; d.people.push({ id: nid(), targetId: id, name: '' }); markDirty(); }
  function addName(){ d.people.push({ id: nid(), targetId: '', name: 'Person ' + (d.people.length + 1) }); markDirty(); }
  async function delPerson(i){ const p = d.people[i]; if (!(await confirmDelete(true, nameOf(p)))) return; const id = p.id; d.people.splice(i, 1); for (const k of Object.keys(d.pairs)) if (k.split('|').includes(id)) delete d.pairs[k]; markDirty(); }
  function paint(a, b){ const k = pairKey(a, b); if (d.pairs[k] === brush) delete d.pairs[k]; else d.pairs[k] = brush; markDirty(); }
  const cellKind = (a, b) => MATRIX_COLOR[d.pairs[pairKey(a, b)]] || null;
</script>

<div class="mx">
  <!-- cast -->
  <div class="cast">
    {#each d.people as p, i (p.id)}
      <span class="person">
        {#if p.targetId}<span class="pn">{nameOf(p)}</span>{:else}<input class="pn ed" bind:value={p.name} oninput={markDirty} placeholder="name" />{/if}
        <button class="px" onclick={() => delPerson(i)} title="remove" aria-label="remove">✕</button>
      </span>
    {/each}
    {#if pickable.length}
      <select class="addsel" value="" onchange={(e) => { addChar(e.target.value); e.target.value = ''; }}>
        <option value="">＋ character…</option>
        {#each pickable as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}
      </select>
    {/if}
    <button class="addname" onclick={addName}>＋ name</button>
  </div>

  {#if d.people.length >= 2}
    <!-- brush palette -->
    <div class="brushes">
      <span class="bl">Paint</span>
      {#each MATRIX_KINDS as k}
        <button class="brush" class:on={brush === k.v} style="--c:{k.c}" onclick={() => brush = k.v}><i></i>{k.l}</button>
      {/each}
      <span class="hint">click the active colour, then click cells · click again to clear</span>
    </div>

    <!-- grid -->
    <div class="mscroll">
      <table class="grid">
        <thead>
          <tr>
            <th class="corner"></th>
            {#each d.people as pj (pj.id)}<th class="colh"><span title={nameOf(pj)}>{nameOf(pj)}</span></th>{/each}
          </tr>
        </thead>
        <tbody>
          {#each d.people as pi (pi.id)}
            <tr>
              <th class="rowh" title={nameOf(pi)}>{nameOf(pi)}</th>
              {#each d.people as pj (pj.id)}
                {#if pi.id === pj.id}
                  <td class="self"></td>
                {:else}
                  {@const kd = cellKind(pi.id, pj.id)}
                  <td>
                    <button class="cell" style={kd ? `background:${kd.c}` : ''} title={kd ? `${nameOf(pi)} · ${kd.l} · ${nameOf(pj)}` : `set: ${nameOf(pi)} ↔ ${nameOf(pj)}`} onclick={() => paint(pi.id, pj.id)} aria-label="relationship"></button>
                  </td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="empty">Add at least two people to build the matrix.</p>
  {/if}
</div>

<style>
  .mx{display:flex;flex-direction:column;gap:12px}
  .cast{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .person{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--rule);border-radius:20px;background:var(--panel-2);padding:3px 4px 3px 11px}
  .pn{font-family:var(--head);font-size:.94rem;color:var(--ink)}
  .pn.ed{background:none;border:none;outline:none;color:var(--ink);font:inherit;font-size:.94rem;width:7em}
  .px{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.66rem;padding:2px 4px;border-radius:50%}
  .px:hover{color:#fff;background:var(--accent)}
  .addsel,.addname{font-family:var(--sans);font-size:.74rem;background:var(--panel-2);color:var(--muted);border:1px dashed var(--rule);border-radius:20px;padding:5px 11px;cursor:pointer}
  .addsel:hover,.addname:hover{border-color:var(--accent);color:var(--ink)}
  .brushes{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .bl{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .brush{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:20px;padding:4px 10px;cursor:pointer;font-family:var(--sans);font-size:.74rem}
  .brush i{width:11px;height:11px;border-radius:3px;background:var(--c)}
  .brush.on{border-color:var(--c);color:var(--ink);background:color-mix(in srgb,var(--c) 16%,var(--panel-2))}
  .hint{font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  .mscroll{overflow:auto;border:1px solid var(--rule);border-radius:10px;max-width:100%}
  table.grid{border-collapse:collapse}
  .grid th,.grid td{border:1px solid var(--line,var(--rule))}
  .grid .corner{background:var(--panel-2)}
  .grid .colh{background:var(--panel-2);padding:6px 4px;vertical-align:bottom;height:100px}
  .grid .colh span{writing-mode:vertical-rl;transform:rotate(200grad);display:inline-block;font-family:var(--mono);font-size:.6rem;letter-spacing:.04em;color:var(--muted);white-space:nowrap;max-height:92px;overflow:hidden;text-overflow:ellipsis}
  .grid .rowh{background:var(--panel-2);text-align:right;padding:0 10px;font-family:var(--body);font-size:.86rem;color:var(--ink);white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis;position:sticky;left:0;z-index:1}
  .grid .self{background:repeating-linear-gradient(45deg,var(--panel-2),var(--panel-2) 5px,var(--panel) 5px,var(--panel) 10px);min-width:34px}
  .grid td .cell{display:block;width:100%;min-width:34px;height:34px;border:none;background:none;cursor:pointer}
  .grid td .cell:hover{outline:2px solid var(--accent);outline-offset:-2px}
  .empty{color:var(--faint);font-size:.86rem}
</style>
