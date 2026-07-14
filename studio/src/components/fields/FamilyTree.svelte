<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import { uid } from '../../lib/model.js';
  import { layoutFamily, migrateLineage } from '../../lib/familyLayout.js';

  let { entry, sec, others } = $props();

  // ensure shape / migrate old inline-lineage data in place
  $effect(() => {
    try {
      const v = entry.data[sec.key];
      if (v && Array.isArray(v.nodes) && !Array.isArray(v.people)) entry.data[sec.key] = migrateLineage($state.snapshot(v));
      else if (!v || !Array.isArray(v.people) || !Array.isArray(v.unions)) entry.data[sec.key] = { people: (v && v.people) || [], unions: (v && v.unions) || [] };
    } catch (e) { console.error('[familytree] migration failed:', e); entry.data[sec.key] = { people: [], unions: [] }; }
  });
  const data = $derived(entry.data[sec.key] && Array.isArray(entry.data[sec.key].people) ? entry.data[sec.key] : { people: [], unions: [] });
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const EMPTY_L = { nodes: [], marrs: [], links: [], width: 0, height: 0, NW: 152, NH: 52, pos: {} };
  const L = $derived.by(() => {
    try { const r = layoutFamily($state.snapshot(data)); return r && r.pos ? r : { ...EMPTY_L, ...r, pos: r.pos || {} }; }
    catch (e) { console.error('[familytree] layout failed:', e, $state.snapshot(data)); return EMPTY_L; }
  });

  // connectors from the layout
  const geo = $derived.by(() => {
    try {
    const NW = L.NW, NH = L.NH, pos = L.pos || {}, bars = [], marks = [], wires = [];
    (L.marrs || []).forEach(m => { const A = pos[m.a], B = pos[m.b]; if (!A || !B) return;
      const Lf = A.x < B.x ? A : B, R = A.x < B.x ? B : A, y = Lf.y + NH / 2;
      bars.push({ d: `M ${Lf.x + NW} ${y} L ${R.x} ${y}`, affair: m.kind === 'affair' });
      marks.push({ x: (Lf.x + NW + R.x) / 2, y: y - 6, t: m.kind === 'affair' ? '~' : 'm' }); });
    (L.links || []).forEach(k => { const ps = k.parents.map(p => pos[p]).filter(Boolean), cs = k.children.map(c => pos[c]).filter(Boolean);
      if (!ps.length || !cs.length) return;
      const jx = ps.reduce((a, p) => a + p.x + NW / 2, 0) / ps.length, py = Math.max(...ps.map(p => p.y)) + NH / 2;
      const cxs = cs.map(c => c.x + NW / 2), cy = Math.min(...cs.map(c => c.y)), bus = cy - 30;
      wires.push(`M ${jx} ${py} L ${jx} ${bus}`, `M ${Math.min(...cxs)} ${bus} L ${Math.max(...cxs)} ${bus}`);
      cxs.forEach(cx => wires.push(`M ${cx} ${bus} L ${cx} ${cy}`)); });
    return { bars, marks, wires };
    } catch (e) { console.error('[familytree] connectors failed:', e); return { bars: [], marks: [], wires: [] }; }
  });

  // ---- pan / zoom via viewBox (deterministic, container-relative) ----
  let host, box = $state(null);
  const PAD = 56;
  let wantFit = $state(true);
  function fit(){ box = { x: -PAD, y: -PAD, w: (L.width || 300) + PAD * 2, h: (L.height || 180) + PAD * 2 }; }
  // fit on first load and after any structural edit (once the layout has recomputed)
  $effect(() => { if (wantFit && L.width) { fit(); wantFit = false; } });
  const vb = $derived(box ? `${box.x} ${box.y} ${box.w} ${box.h}` : '0 0 300 180');

  function wheel(e){ e.preventDefault(); if (!box) return; const r = host.getBoundingClientRect();
    const mx = box.x + (e.clientX - r.left) / r.width * box.w, my = box.y + (e.clientY - r.top) / r.height * box.h;
    const f = e.deltaY < 0 ? 1 / 1.12 : 1.12, nw = Math.max(220, Math.min(9000, box.w * f)), nh = nw * (box.h / box.w);
    box = { x: mx - (mx - box.x) * (nw / box.w), y: my - (my - box.y) * (nh / box.h), w: nw, h: nh }; }
  let drag = null;
  function pdown(e){ if (e.target.closest('.fnode') || e.target.closest('.fteditor')) return; drag = { x: e.clientX, y: e.clientY, bx: box.x, by: box.y }; host.setPointerCapture(e.pointerId); }
  function pmove(e){ if (!drag || !box) return; const r = host.getBoundingClientRect();
    box = { ...box, x: drag.bx - (e.clientX - drag.x) / r.width * box.w, y: drag.by - (e.clientY - drag.y) / r.height * box.h }; }
  function pup(){ drag = null; }

  // ---- selection + editing (mutate the STORED object so changes persist) ----
  let selId = $state(null);
  const sel = $derived(selId ? (data.people || []).find(p => p.id === selId) : null);
  // the live stored family object, arrays guaranteed
  function D(){ let v = entry.data[sec.key];
    if (!v || !Array.isArray(v.people)) { v = { people: [], unions: [] }; entry.data[sec.key] = v; }
    if (!Array.isArray(entry.data[sec.key].unions)) entry.data[sec.key].unions = [];
    return entry.data[sec.key]; }

  function addRoot(){ const d = D(); const p = { id: uid(), name: 'New person', targetId: '' }; d.people.push(p); selId = p.id; wantFit = true; markDirty(); }
  function addPartner(pid){ const d = D(); const q = { id: uid(), name: 'New partner', targetId: '' }; d.people.push(q);
    d.unions.push({ id: uid(), partners: [pid, q.id], kind: 'marriage', children: [] }); selId = q.id; wantFit = true; markDirty(); }
  function addChild(pid){ const d = D(); const c = { id: uid(), name: 'New child', targetId: '' }; d.people.push(c);
    let u = d.unions.find(u => u.partners.includes(pid)); if (!u) { u = { id: uid(), partners: [pid], kind: 'marriage', children: [] }; d.unions.push(u); }
    (u.children = u.children || []).push(c.id); selId = c.id; wantFit = true; markDirty(); }
  function addParent(pid){ const d = D(); const a = { id: uid(), name: 'Parent', targetId: '' }, b = { id: uid(), name: 'Parent', targetId: '' };
    d.people.push(a, b); d.unions.push({ id: uid(), partners: [a.id, b.id], kind: 'marriage', children: [pid] }); selId = a.id; wantFit = true; markDirty(); }
  async function del(pid){ const d = D(); const p = d.people.find(x => x.id === pid); if (!p) return;
    if (!(await confirmDelete(p.name && !p.name.startsWith('New') && p.name !== 'Parent', p.name ? '“' + p.name + '”' : 'this person'))) return;
    d.people = d.people.filter(x => x.id !== pid);
    d.unions.forEach(u => { u.partners = u.partners.map(x => x === pid ? null : x); u.children = (u.children || []).filter(x => x !== pid); });
    d.unions = d.unions.filter(u => u.partners.some(Boolean) || (u.children || []).length);
    if (selId === pid) selId = null; wantFit = true; markDirty(); }
  function rename(pid, v){ const p = D().people.find(x => x.id === pid); if (p) { p.name = v; markDirty(); } }
  function linkChar(pid, tid){ const p = D().people.find(x => x.id === pid); if (!p) return; p.targetId = tid;
    const c = chars.find(x => x.id === tid); if (c && (!p.name || p.name.startsWith('New') || p.name === 'Parent')) p.name = c.title; markDirty(); }

  // join two EXISTING people
  const otherPeople = $derived((data.people || []).filter(p => p.id !== selId));
  function marryTo(otherId){ if (!otherId || !sel) return; const d = D();
    if (d.unions.some(u => u.partners.includes(sel.id) && u.partners.includes(otherId))) return;
    d.unions.push({ id: uid(), partners: [sel.id, otherId], kind: 'marriage', children: [] }); wantFit = true; markDirty(); }
  function childOf(parentId){ if (!parentId || !sel) return; const d = D();
    d.unions.forEach(u => { u.children = (u.children || []).filter(c => c !== sel.id); });   // one parent-union only
    let u = d.unions.find(u => u.partners.includes(parentId)); if (!u) { u = { id: uid(), partners: [parentId], kind: 'marriage', children: [] }; d.unions.push(u); }
    (u.children = u.children || []).push(sel.id); wantFit = true; markDirty(); }
  const two = (nm) => { const s = (nm || '—').indexOf(' '); return s < 0 ? [nm || '—', ''] : [nm.slice(0, s), nm.slice(s + 1)]; };
</script>

<div class="ftbar">
  <button class="ftb" onclick={addRoot}>＋ Person</button>
  <button class="ftb" onclick={fit}>Fit</button>
  <span class="fthint">Click a person to edit · drag to pan · scroll to zoom</span>
</div>

<div class="ftcanvas" bind:this={host} onwheel={wheel} onpointerdown={pdown} onpointermove={pmove} onpointerup={pup} onpointercancel={pup} role="application" aria-label="Family tree canvas">
  {#if data.people.length}
    <svg class="ftsvg" viewBox={vb} preserveAspectRatio="xMidYMid meet">
      {#each geo.wires as d}<path class="fwire" {d} />{/each}
      {#each geo.bars as b}<path class="fmarr" class:affair={b.affair} d={b.d} />{/each}
      {#each geo.marks as m}<text class="fmlbl" x={m.x} y={m.y}>{m.t}</text>{/each}
      {#each L.nodes as n (n.id)}
        <g class="fnode" class:sel={selId === n.id} transform="translate({n.x} {n.y})" onclick={(e) => { e.stopPropagation(); selId = n.id; }} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selId = n.id; } }} role="button" tabindex="0">
          <rect width={L.NW} height={L.NH} rx="8" />
          <text class="fnm" x={L.NW / 2} y="22">{two(n.name)[0]}</text>
          {#if two(n.name)[1]}<text class="fsur" x={L.NW / 2} y="39">{two(n.name)[1]}</text>{/if}
        </g>
      {/each}
    </svg>
  {:else}
    <div class="ftempty"><span>No family yet.</span><button class="ftb" onclick={addRoot}>＋ Add the first person</button></div>
  {/if}

  {#if sel}
    <div class="fteditor">
      <input class="ftname" value={sel.name} oninput={(e) => rename(sel.id, e.target.value)} placeholder="Name" />
      <select class="ftlink" value={sel.targetId || ''} onchange={(e) => linkChar(sel.id, e.target.value)}>
        <option value="">— link character —</option>
        {#each chars as c}<option value={c.id}>{c.title || 'Untitled'}</option>{/each}
      </select>
      <div class="ftacts">
        <button onclick={() => addParent(sel.id)} title="give this person their own parents">↑ parents</button>
        <button onclick={() => addPartner(sel.id)} title="add a new spouse">♥ partner</button>
        <button onclick={() => addChild(sel.id)} title="add a new child">＋ child</button>
        {#if sel.targetId}<button onclick={() => openEntry(sel.targetId)}>open ↗</button>{/if}
        <button class="del" onclick={() => del(sel.id)}>✕ delete</button>
      </div>
      {#if otherPeople.length}
        <div class="ftjoin">
          <select value="" onchange={(e) => { marryTo(e.target.value); e.target.value = ''; }} title="marry to an existing person">
            <option value="">♥ marry to…</option>
            {#each otherPeople as o}<option value={o.id}>{o.name || 'Untitled'}</option>{/each}
          </select>
          <select value="" onchange={(e) => { childOf(e.target.value); e.target.value = ''; }} title="make a child of an existing person">
            <option value="">＋ child of…</option>
            {#each otherPeople as o}<option value={o.id}>{o.name || 'Untitled'}</option>{/each}
          </select>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ftbar{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .ftb{border:1px solid var(--rule);background:var(--panel-2);color:var(--ink);border-radius:7px;padding:5px 11px;cursor:pointer;font:inherit;font-size:.78rem}
  .ftb:hover{border-color:var(--accent)}
  .fthint{font-family:var(--sans);font-size:.72rem;color:var(--faint)}
  .ftcanvas{position:relative;height:min(66vh,560px);border:1px solid var(--rule);border-radius:12px;overflow:hidden;background:var(--panel);
    background-image:radial-gradient(circle,var(--rule) 1px,transparent 1px);background-size:24px 24px;touch-action:none;cursor:grab}
  .ftcanvas:active{cursor:grabbing}
  .ftsvg{width:100%;height:100%;display:block}
  .fwire{fill:none;stroke:var(--rule);stroke-width:2}
  .fmarr{fill:none;stroke:var(--accent-soft);stroke-width:2.5}
  .fmarr.affair{stroke-dasharray:4 4;stroke:var(--faint)}
  .fmlbl{fill:var(--faint);font-family:var(--mono);font-size:8px;letter-spacing:1px;text-anchor:middle;text-transform:uppercase}
  .fnode{cursor:pointer}
  .fnode rect{fill:var(--panel-2);stroke:var(--rule);stroke-width:1.5}
  .fnode:hover rect{stroke:var(--accent)}
  .fnode.sel rect{stroke:var(--accent);stroke-width:2.5}
  .fnm{fill:var(--ink);font-family:var(--head);font-size:15px;text-anchor:middle;user-select:none}
  .fsur{fill:var(--muted);font-family:var(--head);font-size:12.5px;text-anchor:middle;user-select:none}
  .ftempty{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;color:var(--muted);font-family:var(--body)}
  .fteditor{position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:7px;background:color-mix(in srgb,var(--panel) 92%,transparent);border:1px solid var(--rule);border-radius:10px;padding:10px 12px;min-width:220px;box-shadow:0 12px 30px rgba(0,0,0,.35);backdrop-filter:blur(4px)}
  .ftname{background:none;border:none;outline:none;font-family:var(--head);font-size:1.1rem;color:var(--ink)}
  .ftlink{font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 7px}
  .ftacts{display:flex;flex-wrap:wrap;gap:5px}
  .ftacts button{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 9px;font-family:var(--mono);font-size:.58rem;letter-spacing:.04em;text-transform:uppercase}
  .ftacts button:hover{border-color:var(--accent);color:var(--ink)}
  .ftacts button.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .ftjoin{display:flex;gap:6px;flex-wrap:wrap}
  .ftjoin select{font-family:var(--mono);font-size:.58rem;letter-spacing:.04em;text-transform:uppercase;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 7px;max-width:9.5em;cursor:pointer}
  .ftjoin select:hover{border-color:var(--accent);color:var(--ink)}
</style>
