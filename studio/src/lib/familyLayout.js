/* ============ FAMILY-TREE LAYOUT ENGINE ============
   Pure function: a genealogy model → positioned nodes + connectors.
   Structured (not flowy): tidy generational rows, couples adjacent, parents
   centered over children, and dual ancestry (a person who is both a child in
   one union and a spouse in another) handled by shared generations.

   Model:
     people: [{ id, name, targetId }]
     unions: [{ id, partners:[idA, idB], kind:'marriage'|'affair', children:[id...] }]
   A person is a child of AT MOST one union (their parents) and may be a partner
   in several. partners[0] is treated as the bloodline for descent ordering.
*/

export const FT = { NW: 152, NH: 52, XGAP: 26, YGAP: 122 };

/* Migrate the OLD inline-lineage model ({nodes:[{id,name,targetId,parentId,partners}]})
   to the new {people, unions} model. A node's partners become people + a union; a node's
   children (old parentId links) attach to that node's primary (first) union. */
export function migrateLineage(old){
  const nodes = (old && old.nodes) || [];
  const people = [], unions = [], primary = {};
  nodes.forEach(n => {
    people.push({ id: n.id, name: n.name || '', targetId: n.targetId || '' });
    (n.partners || []).forEach((p, i) => {
      people.push({ id: p.id, name: p.name || '', targetId: p.targetId || '' });
      const u = { id: 'u_' + n.id + '_' + i, partners: [n.id, p.id], kind: p.kind === 'affair' ? 'affair' : 'marriage', children: [] };
      unions.push(u); if (i === 0) primary[n.id] = u;
    });
  });
  nodes.forEach(n => {
    if (!n.parentId) return;
    let u = primary[n.parentId];
    if (!u) { u = { id: 'us_' + n.parentId, partners: [n.parentId], kind: 'marriage', children: [] }; unions.push(u); primary[n.parentId] = u; }
    u.children.push(n.id);
  });
  return { people, unions };
}

export function layoutFamily(data){
  const people = (data && data.people) || [];
  const unions = (data && data.unions) || [];
  if (!people.length) return { nodes: [], marrs: [], links: [], width: 0, height: 0, ...FT };
  const step = FT.NW + FT.XGAP;

  const parentU = {};                          // personId -> its parent union
  unions.forEach(u => (u.children || []).forEach(c => { parentU[c] = u; }));

  // ---- 1. generations: longest path from roots, then relax couples + children ----
  const gen = {}, visiting = new Set();
  const G = (id) => {
    if (id in gen) return gen[id];
    if (visiting.has(id)) return 0;            // cycle guard
    visiting.add(id);
    const u = parentU[id];
    const g = u ? 1 + Math.max(0, ...u.partners.map(G)) : 0;
    visiting.delete(id);
    return (gen[id] = g);
  };
  people.forEach(p => G(p.id));
  // Relax to a consistent, aligned assignment (all moves push DOWN, so it converges):
  //  · a couple shares a row (max of the two)
  //  · children sit below their parents (parent + 1)
  //  · parents sit one row above their deepest child — this is what pulls a married-in
  //    spouse's parents down to align when the marriage forced the spouse deeper (dual ancestry)
  for (let k = 0; k < 12; k++) unions.forEach(u => {
    const mg = Math.max(0, ...u.partners.map(p => gen[p] || 0));
    u.partners.forEach(p => { gen[p] = Math.max(gen[p] || 0, mg); });
    (u.children || []).forEach(c => { gen[c] = Math.max(gen[c] || 0, mg + 1); });
    const kids = u.children || [];
    if (kids.length) { const maxc = Math.max(...kids.map(c => gen[c] || 0)); u.partners.forEach(p => { gen[p] = Math.max(gen[p] || 0, maxc - 1); }); }
  });

  // ---- 2. couples + a descent-first ordering (keeps families together, spouses adjacent) ----
  const partnerOf = {};
  unions.forEach(u => { const [a, b] = u.partners; if (a && b) { if (partnerOf[a] == null) partnerOf[a] = b; if (partnerOf[b] == null) partnerOf[b] = a; } });
  const kidsOfPerson = (id) => { const out = []; unions.forEach(u => { if (u.partners.includes(id)) (u.children || []).forEach(c => out.push(c)); }); return out; };

  const order = [], seen = new Set();
  const visit = (id) => {
    if (seen.has(id)) return; seen.add(id); order.push(id);
    const sp = partnerOf[id];
    if (sp && !seen.has(sp)) { seen.add(sp); order.push(sp); }
    const kids = []; [id, sp].filter(Boolean).forEach(x => kidsOfPerson(x).forEach(k => { if (!kids.includes(k)) kids.push(k); }));
    kids.sort((a, b) => (partnerOf[a] ? 1 : 0) - (partnerOf[b] ? 1 : 0));   // married children last → the couple lands at the group's edge, next to the in-law family
    kids.forEach(visit);
  };
  people.filter(p => !parentU[p.id]).forEach(p => visit(p.id));   // roots first
  people.forEach(p => visit(p.id));                               // stragglers

  const layers = {};
  order.forEach(id => { const g = gen[id]; (layers[g] = layers[g] || []).push(id); });
  const rows = Object.keys(layers).map(Number).sort((a, b) => a - b);

  // Ordering note: the DFS above already groups each family and, by emitting married
  // children last, lands an intermarrying couple at the boundary between the two families
  // (so each couple's children stay contiguous). A barycenter crossing-reduction pass was
  // tried here but destabilised that clean order, so the DFS order is kept as-is.
  const parentsOf = id => (parentU[id] ? parentU[id].partners.filter(Boolean) : []);

  // ---- 3. x-coords: order-preserving tidy placement (Walker-style via isotonic relaxation) ----
  // Each row keeps its fixed left→right order. We repeatedly pull every node toward the
  // average of its parents + children, pin couples one slot apart, then re-pack the row as
  // close to those desired centres as possible while staying ≥ step apart and never crossing.
  const x = {};
  rows.forEach(g => layers[g].forEach((id, i) => { x[id] = i * step; }));
  const oi = {}; order.forEach((id, i) => { oi[id] = i; });

  // L2 non-decreasing fit (pool adjacent violators) — the optimal monotone approximation of t
  const isotonic = (t) => {
    const b = [];
    for (const v of t) {
      let cur = { m: v, c: 1 };
      while (b.length && b[b.length - 1].m > cur.m) { const p = b.pop(); cur = { m: (p.m * p.c + cur.m * cur.c) / (p.c + cur.c), c: p.c + cur.c }; }
      b.push(cur);
    }
    const y = []; for (const blk of b) for (let k = 0; k < blk.c; k++) y.push(blk.m); return y;
  };
  // place `ids` (fixed order) at the positions ≥ step apart that are closest to their current x
  const separate = (ids) => {
    const y = isotonic(ids.map((id, i) => x[id] - i * step));
    ids.forEach((id, i) => { x[id] = y[i] + i * step; });
  };

  for (let iter = 0; iter < 40; iter++) {
    for (const g of rows) {
      const row = layers[g];
      for (const id of row) { const nb = parentsOf(id).concat(kidsOfPerson(id)); if (nb.length) x[id] = nb.reduce((a, n) => a + x[n], 0) / nb.length; }
      for (const id of row) { const sp = partnerOf[id]; if (sp && gen[sp] === g && oi[id] < oi[sp]) { const mid = (x[id] + x[sp]) / 2; x[id] = mid - step / 2; x[sp] = mid + step / 2; } }
      separate(row);
    }
  }

  // normalize to origin
  const minx = Math.min(...people.map(p => x[p.id]));
  const nodes = people.map(p => ({ id: p.id, name: p.name, targetId: p.targetId, x: x[p.id] - minx, y: gen[p.id] * FT.YGAP, gen: gen[p.id] }));
  const pos = Object.fromEntries(nodes.map(n => [n.id, n]));

  // ---- 4. connectors ----
  const marrs = unions.filter(u => u.partners[0] && u.partners[1]).map(u => ({ a: u.partners[0], b: u.partners[1], kind: u.kind || 'marriage' }));
  const links = unions.filter(u => (u.children || []).length).map(u => ({
    parents: u.partners.filter(Boolean), children: u.children.filter(c => pos[c]),
  }));

  const width = Math.max(...nodes.map(n => n.x)) + FT.NW;
  const height = Math.max(...nodes.map(n => n.y)) + FT.NH;
  return { nodes, marrs, links, pos, width, height, ...FT };
}
