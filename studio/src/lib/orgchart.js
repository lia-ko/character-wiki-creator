/* Tidy top-down tree layout for the org/hierarchy chart. Each node has a parentId (its
   superior); roots have none. Leaves take sequential x-slots, parents centre over their
   children, depth → y. Cycle-guarded. Shared by the editor preview and the static renderer. */
export const ORG = { NW: 156, NH: 48, HGAP: 20, VGAP: 58 };

export function layoutOrg(data){
  const nodes = (data && Array.isArray(data.nodes)) ? data.nodes : [];
  const { NW, NH, HGAP, VGAP } = ORG;
  if (!nodes.length) return { nodes: [], edges: [], width: 0, height: 0 };
  const byId = {}; nodes.forEach(n => { byId[n.id] = n; });
  const children = {}; nodes.forEach(n => { children[n.id] = []; });
  const roots = [];
  nodes.forEach(n => { if (n.parentId && byId[n.parentId] && n.parentId !== n.id) children[n.parentId].push(n); else roots.push(n); });

  const slot = NW + HGAP, pos = {}, visited = new Set();
  let cursor = 0;
  function place(n, depth){
    if (visited.has(n.id)) return pos[n.id] ? pos[n.id].x : cursor * slot;
    visited.add(n.id);
    const kids = children[n.id].filter(k => !visited.has(k.id));
    let x;
    if (!kids.length){ x = cursor * slot; cursor++; }
    else { const xs = kids.map(k => place(k, depth + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
    pos[n.id] = { x, depth };
    return x;
  }
  roots.forEach(r => place(r, 0));
  nodes.forEach(n => { if (!pos[n.id]){ pos[n.id] = { x: cursor * slot, depth: 0 }; cursor++; } });   // cycle leftovers

  const out = nodes.map(n => ({ ...n, x: pos[n.id].x, y: pos[n.id].depth * (NH + VGAP) }));
  const edges = nodes.filter(n => n.parentId && byId[n.parentId] && n.parentId !== n.id).map(n => ({ from: n.parentId, to: n.id }));
  const width = Math.max(...out.map(n => n.x)) + NW;
  const height = Math.max(...out.map(n => n.y)) + NH;
  return { nodes: out, edges, width, height };
}

// elbow connector from a parent node's bottom-centre to a child's top-centre
export function orgConnector(p, c){
  const { NW, NH } = ORG;
  const px = p.x + NW / 2, py = p.y + NH, cx = c.x + NW / 2, cy = c.y, my = (py + cy) / 2;
  return `M${px} ${py} V${my.toFixed(1)} H${cx} V${cy}`;
}
