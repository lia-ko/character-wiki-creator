/* Relationship-matrix kinds — the colour-coded stances for the N×N cast grid. Shared by the
   editor (paint palette) and the static renderer so they stay in step. The matrix is
   symmetric: a cell is the mutual bond between two people, keyed by the sorted id pair. */
export const MATRIX_KINDS = [
  { v: 'ally', l: 'Ally', c: '#5aa06f' },
  { v: 'friend', l: 'Friend', c: '#5f9fb0' },
  { v: 'love', l: 'Love', c: '#c77dab' },
  { v: 'family', l: 'Family', c: '#8a86c9' },
  { v: 'rival', l: 'Rival', c: '#c9a24a' },
  { v: 'wary', l: 'Wary', c: '#b9853a' },
  { v: 'enemy', l: 'Enemy', c: '#c05348' },
];
export const MATRIX_COLOR = Object.fromEntries(MATRIX_KINDS.map(k => [k.v, k]));
export const pairKey = (a, b) => [a, b].sort().join('|');
