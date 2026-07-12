<script>
  import { markDirty, openEntry, confirmDelete } from '../../lib/store.svelte.js';
  import { uid } from '../../lib/model.js';
  let { entry, sec, others } = $props();

  // lazy-init for entries created before this field / before partners existed
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || !Array.isArray(d.nodes)) { entry.data[sec.key] = { nodes: [] }; return; }
    d.nodes.forEach(n => { if (!Array.isArray(n.partners)) n.partners = []; });
  });
  const nodes = $derived(entry.data[sec.key]?.nodes || []);
  const chars = $derived(others.filter(o => o.type === 'character'));

  const rootsOf = () => nodes.filter(n => !n.parentId || !nodes.some(x => x.id === n.parentId));
  const kidsOf = (id) => nodes.filter(n => n.parentId === id);

  function addRoot(){ nodes.push({ id: uid(), name: '', targetId: '', parentId: null, partners: [] }); markDirty(); }
  function addChild(pid){ nodes.push({ id: uid(), name: '', targetId: '', parentId: pid, partners: [] }); markDirty(); }
  async function del(id){
    const node = nodes.find(n => n.id === id); if (!node) return;
    const has = node.name || kidsOf(id).length || (node.partners && node.partners.length);
    if (!(await confirmDelete(has, node.name ? '“' + node.name + '”' : 'this person'))) return;
    nodes.forEach(n => { if (n.parentId === id) n.parentId = node.parentId || null; }); // reparent orphans
    nodes.splice(nodes.findIndex(n => n.id === id), 1); markDirty();
  }
  function addPartner(n){ n.partners.push({ id: uid(), name: '', targetId: '', kind: 'spouse' }); markDirty(); }
  function delPartner(n, pi){ n.partners.splice(pi, 1); markDirty(); }
  function link(o, tid){ const c = chars.find(x => x.id === tid); if (c && !o.name) o.name = c.title; markDirty(); }
</script>

{#snippet person(o, isPartner)}
  <div class="card" class:partner={isPartner} class:affair={isPartner && o.kind === 'affair'}>
    <input class="nm" bind:value={o.name} oninput={markDirty} placeholder={isPartner ? 'Partner' : 'Name'} />
    <div class="ctrls">
      <select class="lk" bind:value={o.targetId} onchange={() => link(o, o.targetId)} title="link to a character">
        <option value="">— link —</option>
        {#each chars as c}<option value={c.id}>{c.title || 'Untitled'}</option>{/each}
      </select>
      {#if isPartner}
        <select class="kindsel" bind:value={o.kind} onchange={markDirty} title="relationship">
          <option value="spouse">married</option>
          <option value="affair">affair</option>
        </select>
      {/if}
      {#if o.targetId}<button class="mini" onclick={() => openEntry(o.targetId)} title="open">↗</button>{/if}
    </div>
  </div>
{/snippet}

{#snippet sub(n)}
  {@const kids = kidsOf(n.id)}
  <div class="subtree">
    <div class="union">
      <div class="main">
        {@render person(n, false)}
        <div class="mainbtns">
          <button class="mini" onclick={() => addChild(n.id)} title="add child">＋ child</button>
          <button class="mini" onclick={() => addPartner(n)} title="add partner">♥ partner</button>
          <button class="mini del" onclick={() => del(n.id)} title="remove">✕</button>
        </div>
      </div>
      {#each n.partners as pt, pi (pt.id)}
        <div class="bond" class:affair={pt.kind === 'affair'}><span class="line"></span><span class="lbl">{pt.kind === 'affair' ? 'affair' : 'm.'}</span></div>
        <div class="partnerwrap">
          {@render person(pt, true)}
          <button class="mini del pdel" onclick={() => delPartner(n, pi)} title="remove partner">✕</button>
        </div>
      {/each}
    </div>
    {#if kids.length}
      <div class="vline"></div>
      <div class="kids" class:single={kids.length === 1}>
        {#each kids as c (c.id)}<div class="branch">{@render sub(c)}</div>{/each}
      </div>
    {/if}
  </div>
{/snippet}

<div class="lineage">
  {#if nodes.length}
    <div class="canvas">
      {#each rootsOf() as r (r.id)}<div class="branch root">{@render sub(r)}</div>{/each}
    </div>
  {/if}
  <button class="addbtn" onclick={addRoot}>＋ Add {nodes.length ? 'ancestor / person' : 'first person'}</button>
</div>

<style>
  .lineage{display:flex;flex-direction:column;gap:10px}
  .canvas{overflow-x:auto;padding:6px 4px 12px;display:flex;gap:30px;justify-content:center}
  .subtree{display:inline-flex;flex-direction:column;align-items:center}
  .union{display:flex;align-items:center;gap:0}

  .card{background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:7px 9px;min-width:136px;display:flex;flex-direction:column;gap:5px}
  .card.partner{background:var(--panel-2);min-width:120px}
  .card.partner.affair{border-style:dashed}
  .nm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(.92rem*var(--hs,1));color:var(--ink);text-align:center;width:100%}
  .ctrls{display:flex;align-items:center;gap:4px;justify-content:center;flex-wrap:wrap}
  .lk,.kindsel{min-width:0;font-family:var(--sans);font-size:.58rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:5px;padding:2px 4px}
  .card.partner .lk,.card.partner .kindsel{background:var(--panel)}
  .mini{height:20px;padding:0 6px;flex:none;border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:5px;cursor:pointer;font-size:.6rem;line-height:1;white-space:nowrap}
  .mini:hover{border-color:var(--accent);color:var(--ink)}
  .mini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .main{display:flex;flex-direction:column;align-items:center;gap:5px}
  .mainbtns{display:flex;gap:4px}
  .partnerwrap{display:flex;flex-direction:column;align-items:center;gap:5px}
  .pdel{margin-top:0}

  /* bond between spouses/lovers */
  .bond{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 3px}
  .bond .line{width:22px;height:2px;background:var(--accent-soft);border-radius:2px}
  .bond.affair .line{height:0;background:none;border-top:2px dashed var(--faint)}
  .bond .lbl{font-family:var(--mono);font-size:.42rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-top:3px}

  /* generations */
  .vline{width:1px;height:14px;background:var(--rule)}
  .kids{display:flex;gap:16px;align-items:flex-start;position:relative;padding-top:14px}
  .kids::before{content:"";position:absolute;top:0;left:12%;right:12%;height:1px;background:var(--rule)}
  .kids.single::before{display:none}
  .branch{position:relative}
  .kids>.branch::before{content:"";position:absolute;top:-14px;left:50%;width:1px;height:14px;background:var(--rule)}
  .branch.root::before{display:none}

  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
