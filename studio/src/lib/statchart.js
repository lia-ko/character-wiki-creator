/* Radar (spider) chart geometry, shared by the editor preview and the static renderer so
   both draw the identical polygon. Values are laid on N evenly-spaced axes; the data point
   for axis i sits at radius (value/max)·R. Also drives the label + grid-ring positions. */
export function radarGeom(values, max, size){
  const n = Math.max(values.length, 1);
  const cx = size / 2, cy = size / 2;
  const R = size / 2 * 0.70;                 // leave a margin for the labels
  const m = max > 0 ? max : 1;
  const ang = (i) => (-90 + i * 360 / n) * Math.PI / 180;
  const pt = (i, r) => ({ x: cx + Math.cos(ang(i)) * r, y: cy + Math.sin(ang(i)) * r });
  const data = values.map((v, i) => pt(i, Math.max(0, Math.min(1, (Number(v) || 0) / m)) * R));
  const axisEnds = values.map((_, i) => pt(i, R));
  const labelPts = values.map((_, i) => pt(i, R + size * 0.075));
  const rings = [0.25, 0.5, 0.75, 1].map(f => values.map((_, i) => pt(i, f * R)));
  return { cx, cy, R, data, axisEnds, labelPts, rings };
}
export const ptsAttr = (pts) => pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
export const labelAnchor = (x, cx) => x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle';
