/* ============ TOWN / CITY GENERATOR ============
   Seeded, deterministic, flat B&W stylized maps. Output is a structured set of
   layers (water, streets, blocks, buildings, wall, docks, marks) that the Map Lab
   renders as SVG. Not a terrain sim — a stylized settlement drawing.

   Styles swap the street algorithm + trappings; water mode clips the footprint. */

import { Delaunay } from 'd3-delaunay';

/* ---------- seeded RNG ---------- */
function xmur3(str){ let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return h >>> 0; }; }
function mulberry32(a){ return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeRng(seedStr){ return mulberry32(xmur3(String(seedStr))()); }

/* ---------- geometry ---------- */
const area = (p) => { let a = 0; for (let i = 0, n = p.length; i < n; i++){ const j = (i + 1) % n; a += p[i][0] * p[j][1] - p[j][0] * p[i][1]; } return a / 2; };
const absArea = (p) => Math.abs(area(p));
function centroid(p){ let x = 0, y = 0, a = 0; for (let i = 0, n = p.length; i < n; i++){ const j = (i + 1) % n; const c = p[i][0] * p[j][1] - p[j][0] * p[i][1]; x += (p[i][0] + p[j][0]) * c; y += (p[i][1] + p[j][1]) * c; a += c; } a *= 0.5; if (!a) { const m = p.reduce((s, q) => [s[0] + q[0], s[1] + q[1]], [0, 0]); return [m[0] / p.length, m[1] / p.length]; } return [x / (6 * a), y / (6 * a)]; }
function ensureCCW(p){ return area(p) < 0 ? p.slice().reverse() : p; }
const bbox = (p) => { let xn = Infinity, yn = Infinity, xx = -Infinity, yx = -Infinity; for (const q of p){ if (q[0] < xn) xn = q[0]; if (q[1] < yn) yn = q[1]; if (q[0] > xx) xx = q[0]; if (q[1] > yx) yx = q[1]; } return { xn, yn, xx, yx, w: xx - xn, h: yx - yn }; };

// clip a polygon to the half-plane left of the directed line a->b (Sutherland-Hodgman, one edge)
function clipHalf(poly, a, b){
  const out = []; const nx = -(b[1] - a[1]), ny = (b[0] - a[0]); // left normal
  const side = (p) => (p[0] - a[0]) * nx + (p[1] - a[1]) * ny;
  for (let i = 0; i < poly.length; i++){
    const cur = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
    const sc = side(cur), sp = side(prev);
    if (sc >= 0){ if (sp < 0){ const t = sp / (sp - sc); out.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]); } out.push(cur); }
    else if (sp >= 0){ const t = sp / (sp - sc); out.push([prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])]); }
  }
  return out;
}
// inset a convex CCW polygon by d (offset every edge inward)
function insetConvex(poly, d){
  poly = ensureCCW(poly); let res = poly;
  for (let i = 0; i < poly.length; i++){
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = dy / len, ny = -dx / len; // inward normal for CCW
    res = clipHalf(res, [a[0] + nx * d, a[1] + ny * d], [b[0] + nx * d, b[1] + ny * d]);
    if (res.length < 3) return null;
  }
  return res.length >= 3 ? res : null;
}
const pathOf = (p) => p.length ? 'M' + p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z' : '';

/* ---------- footprint clipping ---------- */
const sideOf = (a, b, p) => (p[0] - a[0]) * (-(b[1] - a[1])) + (p[1] - a[1]) * (b[0] - a[0]);
function clipHalfKeep(poly, a, b, ref){ return sideOf(a, b, ref) >= 0 ? clipHalf(poly, a, b) : clipHalf(poly, b, a); }
function clipPolyToConvex(poly, convex){ let r = poly; for (let i = 0; i < convex.length; i++){ r = clipHalf(r, convex[i], convex[(i + 1) % convex.length]); if (r.length < 3) return null; } return r; }
function discPoly(cx, cy, R, n){ const p = []; for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } return ensureCCW(p); }
// Liang–Barsky clip of segment p0->p1 to a convex (CCW) polygon; null if fully outside
function clipSeg(p0, p1, convex){
  let t0 = 0, t1 = 1; const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
  for (let i = 0; i < convex.length; i++){
    const A = convex[i], B = convex[(i + 1) % convex.length];
    const nx = -(B[1] - A[1]), ny = (B[0] - A[0]);
    const denom = dx * nx + dy * ny; const num = (p0[0] - A[0]) * nx + (p0[1] - A[1]) * ny;
    if (Math.abs(denom) < 1e-9){ if (num < 0) return null; }
    else { const t = -num / denom; if (denom > 0){ if (t > t0) t0 = t; } else { if (t < t1) t1 = t; } if (t0 > t1) return null; }
  }
  return [[p0[0] + t0 * dx, p0[1] + t0 * dy], [p0[0] + t1 * dx, p0[1] + t1 * dy]];
}
const segPath = (c) => 'M' + c[0][0].toFixed(1) + ' ' + c[0][1].toFixed(1) + 'L' + c[1][0].toFixed(1) + ' ' + c[1][1].toFixed(1);
function rectAt(c, w, h, ang){ const ca = Math.cos(ang), sa = Math.sin(ang); const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca]); return pathOf(pts); }

/* ---------- building subdivision (recursive lot split) ---------- */
function subdivide(poly, minArea, rng, gap, depth, out){
  if (depth > 9 || absArea(poly) < minArea){ const b = insetConvex(ensureCCW(poly), gap); if (b && absArea(b) > 6) out.push(b); return; }
  const bb = bbox(poly); const horiz = bb.w > bb.h; const c = centroid(poly);
  const j = (rng() - 0.5) * 0.28; // off-center jitter
  let a, b;
  if (horiz){ const x = c[0] + bb.w * j; a = [x, bb.yn - 5]; b = [x, bb.yx + 5]; }
  else { const y = c[1] + bb.h * j; a = [bb.xn - 5, y]; b = [bb.xx + 5, y]; }
  const left = clipHalf(poly, a, b), right = clipHalf(poly, b, a);
  if (left.length >= 3) subdivide(left, minArea, rng, gap, depth + 1, out);
  if (right.length >= 3) subdivide(right, minArea, rng, gap, depth + 1, out);
}

/* ---------- style presets ---------- */
export const STYLES = {
  medieval: { label: 'Medieval', pattern: 'organic', walls: true,  wardCount: 26, lot: 620,  gap: 1.4, plaza: true },
  modern:   { label: 'Modern',   pattern: 'grid',    walls: false, cols: 7,       lot: 900,  gap: 2.0, blockJitter: 0.06 },
  western:  { label: 'Western',  pattern: 'linear',  walls: false, lot: 1100, gap: 2.2 },
  organic:  { label: 'Organic',  pattern: 'organic', walls: false, wardCount: 30, lot: 700,  gap: 1.6, plaza: true },
  village:  { label: 'Village (small)', pattern: 'organic', walls: false, wardCount: 10, lot: 1000, gap: 2.4, plaza: false, spread: true },
  rural:    { label: 'Rural village', pattern: 'rural', walls: false, farms: 13, gap: 2 },
};
export const WATER = { none: 'Inland', coast: 'Port / coast', river: 'River' };

/* ---------- district naming ---------- */
const DISTRICT_NAMES = {
  medieval: ["Old Town", "The Shambles", "Guild Row", "Temple Ward", "The Warrens", "Highgate", "Market Cross", "Nobles' Hill", "Smiths' Quarter", "Blackgate", "The Rookery", "Kingsgate", "Friar's End", "The Bailey"],
  organic:  ["Old Town", "The Shambles", "Guild Row", "Temple Ward", "The Warrens", "Highgate", "Market Cross", "Nobles' Hill", "Smiths' Quarter", "Blackgate", "The Rookery", "The Bailey"],
  modern:   ["Downtown", "Midtown", "The Heights", "Old Quarter", "The Flats", "Eastside", "Parkside", "Uptown", "The Row", "Southgate", "Bishop Park", "The Grid"],
  western:  ["Main Street", "Saloon Row", "The Stockyards", "The Depot", "Old Camp", "Boot Hill", "The Claims", "Front Street", "Miller's End"],
};
const WATER_NAMES = ["The Docks", "The Wharf", "Harborside", "Riverside", "The Fords", "Quayside", "The Quay"];
const RURAL_NAMES = ["North Field", "South Meadow", "Mill Lane", "The Green", "Old Orchard", "Church Farm", "Long Acre", "Ferry Lane", "Goose Green", "Hollow Farm", "West Pasture", "Glebe Field"];
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
function shuffle(arr, rng){ for (let i = arr.length - 1; i > 0; i--){ const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
function makeDistricts(pts, style, seedStr, nearWater){
  if (pts.length < 5) return [];
  const rng = makeRng(seedStr);
  const k = Math.min(6, Math.max(2, Math.round(pts.length / 15)));
  // k-means++ init
  const cents = [pts[Math.floor(rng() * pts.length)].slice()];
  while (cents.length < k){ let best = 0, bd = -1; for (let i = 0; i < pts.length; i++){ let dm = Infinity; for (const c of cents) dm = Math.min(dm, dist2(pts[i], c)); const w = dm * (0.55 + 0.9 * rng()); if (w > bd){ bd = w; best = i; } } cents.push(pts[best].slice()); }
  const assign = new Array(pts.length).fill(0);
  for (let it = 0; it < 8; it++){
    for (let i = 0; i < pts.length; i++){ let bj = 0, bd = Infinity; for (let j = 0; j < k; j++){ const d = dist2(pts[i], cents[j]); if (d < bd){ bd = d; bj = j; } } assign[i] = bj; }
    const sx = new Array(k).fill(0), sy = new Array(k).fill(0), cn = new Array(k).fill(0);
    for (let i = 0; i < pts.length; i++){ sx[assign[i]] += pts[i][0]; sy[assign[i]] += pts[i][1]; cn[assign[i]]++; }
    for (let j = 0; j < k; j++) if (cn[j]){ cents[j] = [sx[j] / cn[j], sy[j] / cn[j]]; }
  }
  const pool = shuffle((DISTRICT_NAMES[style] || DISTRICT_NAMES.medieval).slice(), rng);
  const wpool = shuffle(WATER_NAMES.slice(), rng);
  const out = []; let pi = 0, wi = 0;
  for (let j = 0; j < k; j++){
    let cnt = 0; for (const a of assign) if (a === j) cnt++;
    if (cnt < 2) continue;
    let name;
    if (nearWater(cents[j]) && rng() < 0.75 && wi < wpool.length) name = wpool[wi++];
    else name = pool[pi++ % pool.length];
    out.push({ name, x: cents[j][0], y: cents[j][1] });
  }
  return out;
}

/* ---------- main ---------- */
export function generate(opts){
  const o = Object.assign({ seed: 'town', style: 'medieval', size: 1, water: 'none', density: 1 }, opts);
  const S = STYLES[o.style] || STYLES.medieval;
  const rng = makeRng(o.seed + '|' + o.style + '|' + o.water + '|' + o.size + '|' + o.density);
  const W = 920, H = 700;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.42 * (0.72 + 0.28 * o.size);

  // ----- water region + land test -----
  const water = [];
  let coastY = null, riverPts = null;
  if (o.water === 'coast'){
    coastY = cy + R * 0.35 + (rng() - 0.5) * 30;
    const pts = []; const n = 10;
    for (let i = 0; i <= n; i++){ const x = (W) * i / n; const y = coastY + Math.sin(i * 1.3 + rng() * 6) * 26 + (rng() - 0.5) * 14; pts.push([x, y]); }
    water.push({ path: 'M0 ' + H + ' L0 ' + pts[0][1].toFixed(1) + ' ' + pts.map(p => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' L' + W + ' ' + H + ' Z', line: pts });
  } else if (o.water === 'river'){
    const pts = []; const n = 12; const baseX = cx + (rng() - 0.5) * 80;
    for (let i = 0; i <= n; i++){ const y = H * i / n; const x = baseX + Math.sin(i * 0.9 + rng() * 6) * 60; pts.push([x, y]); }
    riverPts = pts; const wgt = 20;
    const left = pts.map(p => [p[0] - wgt, p[1]]); const right = pts.slice().reverse().map(p => [p[0] + wgt, p[1]]);
    water.push({ path: pathOf(left.concat(right)), line: pts, river: true });
  }
  const inWater = (p) => {
    if (o.water === 'coast') return p[1] > (coastY + Math.sin(p[0] / W * 13) * 20) - 6;
    if (o.water === 'river'){ // distance to river polyline
      let best = Infinity; for (let i = 0; i < riverPts.length - 1; i++){ best = Math.min(best, distSeg(p, riverPts[i], riverPts[i + 1])); } return best < 26;
    }
    return false;
  };
  const inTown = (p) => { const d = Math.hypot(p[0] - cx, p[1] - cy); return d < R * (0.92 + 0.12 * noise(p, rng)); };
  const usable = (p) => inTown(p) && !inWater(p);

  // convex footprint used to clip streets/wards so nothing sprawls into empty paper
  let footC = discPoly(cx, cy, R * 1.02, 34);
  if (o.water === 'coast' && coastY != null) footC = clipHalfKeep(footC, [0, coastY], [W, coastY], [cx, cy]) || footC;

  // ----- streets + blocks per pattern -----
  const streets = []; let blocks = []; const fields = []; let districtsOverride = null;
  if (S.pattern === 'grid'){
    const ang = (rng() - 0.5) * 0.5; const ca = Math.cos(ang), sa = Math.sin(ang);
    const step = (2 * R) / (S.cols + 1);
    const rot = (x, y) => [cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca];
    const lines = [];
    for (let gx = -1; gx <= S.cols + 1; gx++){ const x = cx - R + gx * step; lines.push([rot(x, cy - R * 1.4), rot(x, cy + R * 1.4)]); }
    for (let gy = -1; gy <= S.cols + 1; gy++){ const y = cy - R + gy * step; lines.push([rot(cx - R * 1.4, y), rot(cx + R * 1.4, y)]); }
    lines.forEach(l => { const c = clipSeg(l[0], l[1], footC); if (c) streets.push({ path: segPath(c), w: 3 }); });
    for (let gx = 0; gx <= S.cols; gx++) for (let gy = 0; gy <= S.cols; gy++){
      const x0 = cx - R + gx * step, y0 = cy - R + gy * step;
      const jx = (rng() - 0.5) * step * (S.blockJitter || 0), jy = (rng() - 0.5) * step * (S.blockJitter || 0);
      const inS = step * 0.18;
      const blk = [[x0 + inS + jx, y0 + inS + jy], [x0 + step - inS + jx, y0 + inS + jy], [x0 + step - inS + jx, y0 + step - inS + jy], [x0 + inS + jx, y0 + step - inS + jy]].map(q => rot(q[0], q[1]));
      blocks.push(blk);
    }
  } else if (S.pattern === 'linear'){
    // western: one main street, short perpendicular lanes
    const my = cy + (rng() - 0.5) * 40; const half = R * 0.9;
    const pushSeg = (a, b, w) => { const c = clipSeg(a, b, footC); if (c) streets.push({ path: segPath(c), w }); };
    pushSeg([cx - half, my], [cx + half, my], 5);
    const nLanes = 5 + Math.floor(rng() * 3);
    for (let i = 0; i < nLanes; i++){ const x = cx - half + (i + 0.5) * (2 * half) / nLanes + (rng() - 0.5) * 20; pushSeg([x, my - 90], [x, my + 90], 2.5); }
    for (let side = -1; side <= 1; side += 2){
      for (let i = 0; i < nLanes; i++){
        const x0 = cx - half + i * (2 * half) / nLanes + 6; const bw = (2 * half) / nLanes - 12;
        const y0 = side < 0 ? my - 88 : my + 12; const bh = 76;
        blocks.push([[x0, y0], [x0 + bw, y0], [x0 + bw, y0 + bh], [x0, y0 + bh]]);
      }
    }
  } else if (S.pattern === 'rural'){
    // rural village: winding lanes, scattered farmsteads, big field parcels
    const lane1 = []; const laneY = cy + (rng() - 0.5) * 50;
    for (let i = 0; i <= 9; i++){ const x = cx - R + i * (2 * R) / 9; lane1.push([x, laneY + Math.sin(i * 0.7 + rng() * 6) * 26]); }
    const cxx = cx + (rng() - 0.5) * 110; const lane2 = [];
    for (let i = 0; i <= 7; i++){ const y = cy - R + i * (2 * R) / 7; lane2.push([cxx + Math.sin(i * 0.8 + rng() * 6) * 22, y]); }
    const lanes = [lane1, lane2];
    const pushLane = (ln, w) => { for (let i = 0; i < ln.length - 1; i++){ const c = clipSeg(ln[i], ln[i + 1], footC); if (c) streets.push({ path: segPath(c), w }); } };
    pushLane(lane1, 4.5); pushLane(lane2, 3.5);
    // field parcels via coarse voronoi
    const fpts = []; let ft = 0; while (fpts.length < 9 && ft < 3000){ ft++; const p = [cx + (rng() - 0.5) * 2 * R, cy + (rng() - 0.5) * 2 * R]; if (usable(p)) fpts.push(p); }
    if (fpts.length >= 3){ const fd = Delaunay.from(fpts); const fv = fd.voronoi([0, 0, W, H]); for (let i = 0; i < fpts.length; i++){ const cell = fv.cellPolygon(i); if (!cell) continue; const cp = clipPolyToConvex(ensureCCW(cell.slice(0, -1)), footC); if (cp && cp.length >= 3 && absArea(cp) > 500) fields.push({ path: pathOf(cp), c: centroid(cp) }); } }
    // farmsteads near a lane, spaced apart
    const spots = []; let tt = 0;
    while (spots.length < S.farms && tt < 4000){ tt++; const p = [cx + (rng() - 0.5) * 2 * R, cy + (rng() - 0.5) * 2 * R]; if (!usable(p)) continue; let near = false; for (const ln of lanes){ for (let i = 0; i < ln.length - 1; i++){ if (distSeg(p, ln[i], ln[i + 1]) < 66){ near = true; break; } } if (near) break; } if (!near) continue; if (spots.some(s => dist2(s, p) < 58 * 58)) continue; spots.push(p); }
    blocks = []; // rural draws buildings directly, not from blocks
    return finishRural();
    function finishRural(){
      const buildings = []; const bcent = [];
      for (const s of spots){ const ang = rng() * Math.PI; buildings.push(rectAt(s, 15 + rng() * 9, 11 + rng() * 6, ang)); bcent.push(s); const nOut = 1 + Math.floor(rng() * 2); for (let k = 0; k < nOut; k++){ const off = [s[0] + (rng() - 0.5) * 42, s[1] + (rng() - 0.5) * 42]; if (usable(off)) buildings.push(rectAt(off, 7 + rng() * 5, 6 + rng() * 4, rng() * Math.PI)); } }
      const rn = shuffle(RURAL_NAMES.slice(), makeRng(o.seed + '|rural|' + (o.nameSeed || 0)));
      const districts = fields.slice(0, Math.min(5, fields.length)).map((f, i) => ({ name: rn[i % rn.length], x: f.c[0], y: f.c[1] }));
      return { W, H, water, streets, buildings, wall: null, towers: [], docks: [], bridges: [], fields, districts, style: o.style, seed: o.seed };
    }
  } else {
    // organic: relaxed voronoi wards
    const pts = []; let tries = 0;
    while (pts.length < S.wardCount && tries < 4000){ tries++; const p = [cx + (rng() - 0.5) * 2 * R, cy + (rng() - 0.5) * 2 * R]; if (usable(p)) pts.push(p); }
    let flat = pts.flat();
    for (let it = 0; it < 2; it++){ // Lloyd relaxation
      const del = Delaunay.from(pts); const vor = del.voronoi([0, 0, W, H]); const np = [];
      for (let i = 0; i < pts.length; i++){ const cell = vor.cellPolygon(i); np.push(cell ? centroid(cell) : pts[i]); }
      for (let i = 0; i < pts.length; i++) pts[i] = np[i];
    }
    const del = Delaunay.from(pts); const vor = del.voronoi([0, 0, W, H]);
    let plazaIdx = -1; if (S.plaza){ let bd = Infinity; for (let i = 0; i < pts.length; i++){ const d = Math.hypot(pts[i][0] - cx, pts[i][1] - cy); if (d < bd){ bd = d; plazaIdx = i; } } }
    for (let i = 0; i < pts.length; i++){
      if (!usable(pts[i])) continue;
      const cell = vor.cellPolygon(i); if (!cell) continue;
      const poly = ensureCCW(cell.slice(0, -1));
      const cp = clipPolyToConvex(poly, footC); // clip ward outline to the town footprint
      if (cp && cp.length >= 3) streets.push({ path: pathOf(cp), w: 0, road: true });
      if (i === plazaIdx) continue; // leave plaza open
      const inner = insetConvex(poly, 4.5); if (inner) blocks.push(inner);
    }
  }

  // ----- buildings from blocks -----
  const buildings = []; const bcent = [];
  const minLot = S.lot / Math.max(0.5, o.density);
  for (const blk of blocks){
    const c = centroid(blk); if (!usable(c)) continue;
    const bs = []; subdivide(ensureCCW(blk), minLot, rng, S.gap, 0, bs);
    for (const b of bs){ const bc = centroid(b); if (usable(bc)){ buildings.push(pathOf(b)); bcent.push(bc); } }
  }

  // ----- wall (organic + medieval) -----
  let wall = null; const towers = []; const gates = [];
  if (S.walls){
    const kept = blocks.map(centroid).filter(usable);
    const hull = convexHull(kept.length ? kept : [[cx, cy]]);
    const wpoly = offsetHull(hull, 26);
    wall = pathOf(wpoly);
    for (let i = 0; i < wpoly.length; i++) towers.push({ x: wpoly[i][0], y: wpoly[i][1] });
  }

  // ----- docks (coast) -----
  const docks = [];
  if (o.water === 'coast'){
    const line = water[0].line;
    for (let i = 1; i < line.length - 1; i += 2){ if (rng() < 0.6){ const p = line[i]; const len = 16 + rng() * 22; docks.push({ path: 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'L' + p[0].toFixed(1) + ' ' + (p[1] + len).toFixed(1) }); } }
  }
  // bridges (river)
  const bridges = [];
  if (o.water === 'river'){ for (const s of streets){ /* simple: mark none for now */ } }

  // ----- districts + labels -----
  const nearWater = (p) => {
    if (o.water === 'coast') return p[1] > coastY - 50;
    if (o.water === 'river'){ let best = Infinity; for (let i = 0; i < riverPts.length - 1; i++) best = Math.min(best, distSeg(p, riverPts[i], riverPts[i + 1])); return best < 70; }
    return false;
  };
  const districts = makeDistricts(bcent, o.style, o.seed + '|' + o.style + '|' + o.water + '|' + o.size + '|' + (o.nameSeed || 0), nearWater);

  return { W, H, water, streets, buildings, wall, towers, docks, bridges, fields, districts, style: o.style, seed: o.seed };
}

/* ---------- small helpers ---------- */
function distSeg(p, a, b){ const dx = b[0] - a[0], dy = b[1] - a[1]; const l2 = dx * dx + dy * dy || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2; t = Math.max(0, Math.min(1, t)); return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)); }
function noise(p, rng){ return Math.sin(p[0] * 0.013 + p[1] * 0.017) * 0.5; }
function convexHull(pts){
  if (pts.length < 3) return pts.slice();
  const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const p of s){ while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const up = []; for (let i = s.length - 1; i >= 0; i--){ const p = s[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function offsetHull(hull, d){ const c = centroid(hull); return hull.map(p => { const dx = p[0] - c[0], dy = p[1] - c[1], len = Math.hypot(dx, dy) || 1; return [p[0] + dx / len * d, p[1] + dy / len * d]; }); }
