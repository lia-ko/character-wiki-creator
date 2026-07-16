<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import { layoutOrg, orgConnector, ORG } from '../../lib/orgchart.js';
  let { entry, sec, others } = $props();
  $effect(() => { const d = entry.data[sec.key]; if (!d || typeof d !== 'object' || !Array.isArray(d.nodes)) entry.data[sec.key] = { nodes: [] }; });
  const d = $derived(entry.data[sec.key] || { nodes: [] });
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const charTitle = (id) => (others || []).find(o => o.id === id)?.title || '';
  const personName = (n) => n.name || charTitle(n.targetId) || '';
  const nid = () => 'o' + Math.random().toString(36).slice(2, 8);

  const L = $derived(layoutOrg(d));

  function addRole(){ d.nodes.push({ id: nid(), targetId: '', name: '', title: 'Role', parentId: lastId() }); markDirty(); }
  function addChar(id){ if (!id) return; d.nodes.push({ id: nid(), targetId: id, name: '', title: '', parentId: lastId() }); markDirty(); }
  function lastId(){ return d.nodes.length ? d.nodes[d.nodes.length - 1].id : ''; }
  async function del(i){ const n = d.nodes[i]; if (!(await confirmDelete(true, personName(n) || n.title || 'this node'))) return; const id = n.id; d.nodes.forEach(x => { if (x.parentId === id) x.parentId = n.parentId; }); d.nodes.splice(i, 1); markDirty(); }
  const options = (self) => d.nodes.filter(x => x.id !== self.id);
</script>

<div class="org">
  <!-- live tree -->
  {#if L.nodes.length}
    <div class="canvas">
      <svg viewBox="0 0 {L.width} {L.height}" style="width:{L.width}px;max-width:none;height:auto">
        {#each L.edges as e}
          {@const p = L.nodes.find(n => n.id === e.from)}{@const c = L.nodes.find(n => n.id === e.to)}
          <path d={orgConnector(p, c)} class="edge" />
        {/each}
        {#each L.nodes as n}
          <g transform="translate({n.x},{n.y})" class="gnode" onclick={() => n.targetId && openEntry(n.targetId)} role={n.targetId ? 'button' : 'presentation'}>
            <rect width={ORG.NW} height={ORG.NH} rx="9" class="onode" class:linked={n.targetId} />
            {#if personName(n)}
              <text x="12" y="20" class="onm">{personName(n)}</text>
              {#if n.title}<text x="12" y="36" class="oti">{n.title}</text>{/if}
            {:else}
              <text x="12" y="29" class="onm">{n.title || '—'}</text>
            {/if}
          </g>
        {/each}
      </svg>
    </div>
  {/if}

  <!-- node manager -->
  <div class="rows">
    {#each d.nodes as n, i (n.id)}
      <div class="orow">
        {#if n.targetId}
          <span class="pchip">{charTitle(n.targetId) || 'character'}</span>
        {:else}
          <input class="nm" bind:value={n.name} oninput={markDirty} placeholder="name (optional)" />
        {/if}
        <input class="ti" bind:value={n.title} oninput={markDirty} placeholder="role / title" />
        <label class="rep">reports to
          <select bind:value={n.parentId} onchange={markDirty}>
            <option value="">— top —</option>
            {#each options(n) as o}<option value={o.id}>{personName(o) || o.title || 'node'}</option>{/each}
          </select>
        </label>
        <button class="x" onclick={() => del(i)} title="remove" aria-label="remove">✕</button>
      </div>
    {/each}
    <div class="adds">
      <button class="addbtn" onclick={addRole}>＋ role</button>
      {#if chars.length}
        <select class="addsel" value="" onchange={(e) => { addChar(e.target.value); e.target.value = ''; }}>
          <option value="">＋ character…</option>
          {#each chars as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}
        </select>
      {/if}
    </div>
  </div>
</div>

<style>
  .org{display:flex;flex-direction:column;gap:12px}
  .canvas{overflow:auto;border:1px solid var(--rule-soft,var(--rule));border-radius:12px;background:var(--panel-2);padding:16px}
  svg .edge{fill:none;stroke:var(--rule);stroke-width:1.5}
  svg .onode{fill:var(--panel);stroke:var(--rule);stroke-width:1}
  svg .gnode.linked .onode,svg .onode.linked{stroke:color-mix(in srgb,var(--accent) 45%,var(--rule))}
  svg .gnode[role="button"]{cursor:pointer}
  svg .gnode[role="button"]:hover .onode{stroke:var(--accent)}
  svg .onm{font-family:var(--head);font-size:14px;fill:var(--ink)}
  svg .oti{font-family:var(--mono);font-size:9px;letter-spacing:.6px;text-transform:uppercase;fill:var(--faint)}
  .rows{display:flex;flex-direction:column;gap:6px}
  .orow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto auto;gap:8px;align-items:center}
  .nm,.ti{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.88rem;padding:6px 9px;outline:none;min-width:0}
  .nm:focus,.ti:focus{border-color:var(--accent)}
  .pchip{font-family:var(--head);font-size:.95rem;color:var(--accent-soft);border:1px solid color-mix(in srgb,var(--accent) 35%,var(--rule));border-radius:6px;padding:5px 9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rep{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .rep select{font-family:var(--sans);font-size:.76rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 7px;max-width:11em}
  .x{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:5px 9px;font-size:.72rem}
  .x:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .adds{display:flex;gap:8px;margin-top:2px}
  .addbtn,.addsel{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:7px 13px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .addbtn:hover,.addsel:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:560px){.orow{grid-template-columns:1fr 1fr}.rep{grid-column:1/-1}}
</style>
