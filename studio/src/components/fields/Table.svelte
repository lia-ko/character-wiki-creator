<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  let { entry, sec } = $props();
  // guarantee shape
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d) || !Array.isArray(d.cols) || !Array.isArray(d.rows)) entry.data[sec.key] = { cols: ['Column 1', 'Column 2'], rows: [['', '']] };
  });
  const d = $derived(entry.data[sec.key] || { cols: [], rows: [] });

  function addCol(){ d.cols.push('Column ' + (d.cols.length + 1)); d.rows.forEach(r => r.push('')); markDirty(); }
  function delCol(ci){ if (d.cols.length <= 1) return; d.cols.splice(ci, 1); d.rows.forEach(r => r.splice(ci, 1)); markDirty(); }
  function moveCol(ci, dir){ const j = ci + dir; if (j < 0 || j >= d.cols.length) return; const sw = (a) => { [a[ci], a[j]] = [a[j], a[ci]]; }; sw(d.cols); d.rows.forEach(sw); markDirty(); }
  function addRow(){ d.rows.push(d.cols.map(() => '')); markDirty(); }
  async function delRow(ri){ const r = d.rows[ri]; if (r.some(c => (c || '').trim()) && !(await confirmDelete(true, 'this row'))) return; d.rows.splice(ri, 1); markDirty(); }
  function moveRow(ri, dir){ const j = ri + dir; if (j < 0 || j >= d.rows.length) return; [d.rows[ri], d.rows[j]] = [d.rows[j], d.rows[ri]]; markDirty(); }
</script>

<div class="tbl">
  <div class="scroll">
    <table>
      <thead>
        <tr>
          <th class="corner"></th>
          {#each d.cols as c, ci (ci)}
            <th>
              <div class="colhd">
                <input class="cname" bind:value={d.cols[ci]} oninput={markDirty} placeholder="column" />
                <span class="colctl">
                  <button onclick={() => moveCol(ci, -1)} disabled={ci === 0} title="move left" aria-label="move column left">‹</button>
                  <button onclick={() => moveCol(ci, 1)} disabled={ci === d.cols.length - 1} title="move right" aria-label="move column right">›</button>
                  <button class="cx" onclick={() => delCol(ci)} disabled={d.cols.length <= 1} title="remove column" aria-label="remove column">✕</button>
                </span>
              </div>
            </th>
          {/each}
          <th class="addcol"><button onclick={addCol} title="add column" aria-label="add column">＋</button></th>
        </tr>
      </thead>
      <tbody>
        {#each d.rows as row, ri (ri)}
          <tr>
            <td class="rowh">
              <span class="rowctl">
                <button onclick={() => moveRow(ri, -1)} disabled={ri === 0} title="up" aria-label="move row up">▲</button>
                <button onclick={() => moveRow(ri, 1)} disabled={ri === d.rows.length - 1} title="down" aria-label="move row down">▼</button>
                <button class="rx" onclick={() => delRow(ri)} title="remove row" aria-label="remove row">✕</button>
              </span>
            </td>
            {#each d.cols as c, ci (ci)}
              <td><input bind:value={row[ci]} oninput={markDirty} placeholder="—" /></td>
            {/each}
            <td class="pad"></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <button class="addrow" onclick={addRow}>＋ Add row</button>
</div>

<style>
  .tbl{display:flex;flex-direction:column;gap:8px}
  .scroll{overflow-x:auto;border:1px solid var(--rule);border-radius:10px}
  table{border-collapse:collapse;width:100%}
  th,td{border-bottom:1px solid var(--line,var(--rule));border-right:1px solid var(--line,var(--rule));vertical-align:middle}
  th:last-child,td:last-child{border-right:none}
  tr:last-child td{border-bottom:none}
  thead th{background:var(--panel-2);padding:0}
  .corner{width:34px;background:var(--panel-2)}
  .colhd{display:flex;align-items:center;gap:4px;padding:5px 8px}
  .cname{flex:1;min-width:80px;background:none;border:none;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--ink)}
  .cname::placeholder{color:var(--faint)}
  .colctl{display:inline-flex;gap:1px;opacity:0;transition:opacity .12s}
  th:hover .colctl{opacity:1}
  .colctl button,.rowctl button{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.7rem;line-height:1;padding:2px 3px;border-radius:4px}
  .colctl button:hover:not(:disabled),.rowctl button:hover:not(:disabled){color:var(--ink);background:var(--panel-3,var(--panel))}
  .colctl button:disabled,.rowctl button:disabled{opacity:.3;cursor:default}
  .cx:hover:not(:disabled),.rx:hover{color:#fff;background:var(--accent)}
  .addcol{width:34px}
  .addcol button{width:100%;border:none;background:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:6px}
  .addcol button:hover{color:var(--ink);background:var(--panel-3,var(--panel))}
  .rowh{width:34px;background:var(--panel-2);text-align:center}
  .rowctl{display:inline-flex;flex-direction:column;gap:0;opacity:0;transition:opacity .12s}
  tr:hover .rowctl{opacity:1}
  td input{width:100%;background:none;border:none;outline:none;color:var(--ink);font:inherit;font-size:.9rem;padding:6px 9px}
  td input:focus{background:color-mix(in srgb,var(--accent) 8%,transparent)}
  td input::placeholder{color:var(--faint)}
  .pad{width:0;padding:0;border-right:none}
  .addrow{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:7px 13px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .addrow:hover{border-color:var(--accent);color:var(--ink)}
</style>
