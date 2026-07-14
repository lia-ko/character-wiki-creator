/* Shared geometry + config for the Arc curve, so the live editor viz and the static
   export renderer draw the identical curve. Coordinate space: viewBox 0 0 640 220, y down.
   The vertical axis is a journey; the arc TYPE picks the silhouette. Two MODES reuse the
   same machinery: `character` (lie→truth interiority) and `relationship` (bond over time). */

// fixed hex (CSS var() doesn't resolve in SVG attributes)
export const ARC_C = { want: '#c99a5a', need: '#5f9fb0', accent: '#c2564a', flat: '#9aa1a8', node: '#141820', rule: '#2b3239', muted: '#9aa1a8' };

// per-mode axis palette: bottom = low pole, top = high pole
export const ARC_PALETTE = {
  character: { bottom: '#b0596a', top: '#5aa06f' },
  relationship: { bottom: '#5f8fb0', top: '#d98d82' },
};

export const ARC_TYPES = ['negative', 'flat', 'positive'];

// mini silhouettes for the type selector (34×16 box)
export const ARC_GLYPH = {
  negative: 'M2 4 C 12 4, 14 13, 32 13',
  flat: 'M2 8 L 32 8',
  positive: 'M2 12 C 12 14, 16 3, 32 3',
};

/* Everything a mode relabels: axis poles, the three type labels, the midpoint label per
   type, the caption schema (which text fields + labels), and the two "forces". The data
   shape is shared (believes/is/turn/learns/becomes/want/need) — a mode only renames it. */
export const ARC_MODES = {
  character: {
    axisTop: 'Living the truth', axisBottom: 'Ruled by the lie',
    typeLabel: { negative: 'Fall', flat: 'Flat · testing', positive: 'Positive change' },
    turnLabel: { negative: 'THE FALSE PEAK', flat: 'THE TEST', positive: 'THE TURN' },
    startLabel: 'At the start', endLabel: 'By the end',
    start: [{ key: 'believes', label: 'Believes', hint: 'the lie', color: 'lo', ph: '“I carry it alone.”' }, { key: 'is', label: 'Is', ph: 'who they are now' }],
    turn: { key: 'turn', label: 'The crucible', ph: 'where the lie is tested hardest / all seems lost' },
    end: [{ key: 'learns', label: 'Learns', hint: 'the truth', color: 'hi', ph: 'the truth they reach' }, { key: 'becomes', label: 'Becomes', ph: 'who they become' }],
    forces: [
      { key: 'want', label: 'Want', sub: '· the horizontal drive', foot: 'what pulls them along the arc', ph: 'the external goal', color: 'want' },
      { key: 'need', label: 'Need', sub: '· the vertical lift', foot: 'what actually raises them', ph: 'the internal truth they resist', color: 'need' },
    ],
  },
  relationship: {
    axisTop: 'Devoted · intimate', axisBottom: 'Guarded · at arm’s length',
    typeLabel: { negative: 'Falling apart', flat: 'Steady', positive: 'Drawn together' },
    turnLabel: { negative: 'THE FALSE PEAK', flat: 'THE TEST', positive: 'THE BLACK MOMENT' },
    startLabel: 'How they begin', endLabel: 'Where they land',
    start: [{ key: 'believes', label: 'They meet', ph: 'how it starts between them' }, { key: 'is', label: 'Where they stand', ph: 'the early footing' }],
    turn: { key: 'turn', label: 'The low point', ph: 'the rupture / betrayal / near-loss' },
    end: [{ key: 'learns', label: 'What it becomes', color: 'hi', ph: 'where the bond ends up' }, { key: 'becomes', label: 'Left unspoken', ph: 'what neither says' }],
    forces: [
      { key: 'want', label: 'What draws them together', sub: '', foot: 'the pull', ph: 'what binds them', color: 'want' },
      { key: 'need', label: 'What keeps them apart', sub: '', foot: 'the resistance', ph: 'the wedge between them', color: 'need' },
    ],
  },
};
export function arcMode(mode){ return ARC_MODES[mode] || ARC_MODES.character; }
export function arcPalette(mode){ return ARC_PALETTE[mode] || ARC_PALETTE.character; }

// node positions + end colour + midpoint label, per arc type + mode
export function arcGeom(type, mode = 'character'){
  const pal = arcPalette(mode), cfg = arcMode(mode);
  const endColor = type === 'negative' ? pal.bottom : type === 'flat' ? ARC_C.flat : pal.top;
  const turnLabel = cfg.turnLabel[type] || 'THE TURN';
  let start, turn, end;
  if (type === 'negative'){ start = { x: 90, y: 92 }; turn = { x: 320, y: 52 }; end = { x: 590, y: 182 }; }
  else if (type === 'flat'){ start = { x: 90, y: 92 }; turn = { x: 320, y: 86 }; end = { x: 590, y: 82 }; }
  else { start = { x: 90, y: 150 }; turn = { x: 320, y: 186 }; end = { x: 590, y: 46 }; }
  return { start, turn, end, endColor, turnLabel, bottom: pal.bottom, top: pal.top };
}

// fixed x positions of the three nodes; y ranges between the two poles
export const ARC_X = { start: 90, turn: 320, end: 590 };
export const ARC_Y = { top: 40, bot: 186 };
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
// height stored normalized: 0 = low pole (bottom), 1 = high pole (top)
export function yToPos(y){ return clamp((ARC_Y.bot - y) / (ARC_Y.bot - ARC_Y.top), 0, 1); }
export function posToY(p){ return ARC_Y.bot - clamp(p, 0, 1) * (ARC_Y.bot - ARC_Y.top); }
// the type's silhouette expressed as normalized node heights (the drag defaults)
export function defaultPos(type){ const g = arcGeom(type); return { start: yToPos(g.start.y), turn: yToPos(g.turn.y), end: yToPos(g.end.y) }; }
// build geometry from custom heights; colour + midpoint label stay type/mode-driven
export function geomFromPos(pos, type, mode = 'character'){
  const base = arcGeom(type, mode);
  return {
    start: { x: ARC_X.start, y: posToY(pos.start) },
    turn: { x: ARC_X.turn, y: posToY(pos.turn) },
    end: { x: ARC_X.end, y: posToY(pos.end) },
    endColor: base.endColor, turnLabel: base.turnLabel, bottom: base.bottom, top: base.top,
  };
}
// the geometry actually drawn: custom heights if dragged, else the type silhouette
export function effectiveGeom(v, mode = 'character'){
  const type = (v && v.type) || 'positive';
  return v && v.pos ? geomFromPos(v.pos, type, mode) : arcGeom(type, mode);
}

export function arcLine(g){
  return `M${g.start.x} ${g.start.y} C ${g.start.x + 100} ${g.start.y} ${g.turn.x - 70} ${g.turn.y} ${g.turn.x} ${g.turn.y} C ${g.turn.x + 90} ${g.turn.y} ${g.end.x - 90} ${g.end.y} ${g.end.x} ${g.end.y}`;
}
export function arcArea(g){
  return `${arcLine(g)} L ${g.end.x} 186 L ${g.start.x} 186 Z`;
}
