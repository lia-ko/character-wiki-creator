/* The feature palette for the sheet-type builder — the app's field types presented as
   friendly, addable building blocks. Each feature carries a default section config; the
   builder assigns a unique key and lets the user customize the rest. Adding a field type
   here is all it takes to expose it in the builder. */

export const FEATURE_GROUPS = [
  { group: 'Text & prose', icon: '¶', color: '#c99a5a', features: [
    { type: 'richline', name: 'Summary line', desc: 'A one-line lead-in, richly formatted.', icon: '¶', sec: { label: 'Summary', slot: 'main', lead: true } },
    { type: 'richsections', name: 'Rich text sections', desc: 'Headed write-ups — prose with subheadings.', icon: '☰', sec: { label: 'Notes', slot: 'main' } },
    { type: 'excerpts', name: 'Quotes & excerpts', desc: 'Pull-quotes and passages with attribution.', icon: '”', sec: { label: 'Quotes', slot: 'main' } },
    { type: 'dialectic', name: 'Two-column', desc: 'Statement ↔ counter (or then → now).', icon: '⇋', sec: { label: 'Two sides', slot: 'main', leftLabel: 'On one hand', rightLabel: 'On the other' } },
  ] },
  { group: 'Facts & stats', icon: '≣', color: '#5f9fb0', features: [
    { type: 'stats', name: 'Detail list', desc: 'Key–value rows — the classic stat block.', icon: '≣', sec: { label: 'Details', slot: 'aside', defaults: ['Field 1', 'Field 2', 'Status'] } },
    { type: 'deflist', name: 'Definitions', desc: 'Term → meaning, with an optional note.', icon: '⇄', sec: { label: 'Definitions', slot: 'main', termPh: 'term', defPh: 'meaning', notePh: 'note' } },
    { type: 'gauges', name: 'At-a-glance gauges', desc: 'Little pip-meters & values, side by side.', icon: '◔', sec: { label: 'At a glance', slot: 'aside' } },
    { type: 'meter', name: 'Scale / meter', desc: 'One labelled level-scale (threat, rarity…).', icon: '▮', sec: { label: 'Scale', slot: 'main', levels: ['Low', 'Mid', 'High'] } },
    { type: 'statchart', name: 'Stat chart / radar', desc: 'A radar or bar chart of numeric attributes.', icon: '⬡', sec: { label: 'Stats', slot: 'main' } },
  ] },
  { group: 'Media', icon: '▦', color: '#8a86c9', features: [
    { type: 'gallery', name: 'Image gallery', desc: 'A carousel of images or a plate.', icon: '▦', sec: { label: 'Imagery', slot: 'aside' } },
    { type: 'embed', name: 'Embed / Video', desc: 'YouTube, Vimeo, Spotify, a map or 3D embed.', icon: '▷', sec: { label: 'Media', slot: 'main' } },
    { type: 'spotify', name: 'Soundtrack', desc: 'Embedded Spotify tracks / playlists.', icon: '♪', sec: { label: 'Soundtrack', slot: 'main' } },
  ] },
  { group: 'Links & people', icon: '☍', color: '#5aa06f', features: [
    { type: 'relations', name: 'Linked entries', desc: 'Relations to other sheets, with roles.', icon: '☍', sec: { label: 'Connections', slot: 'main', display: 'expand' } },
    { type: 'ties', name: 'Relationship web', desc: 'Tagged, colour-coded ties (ally, rival…).', icon: '◎', sec: { label: 'Ties', slot: 'main' } },
    { type: 'familytree', name: 'Family tree', desc: 'An auto-laid-out lineage graph.', icon: '⑂', sec: { label: 'Lineage', slot: 'main' } },
    { type: 'crew', name: 'Roster (with portraits)', desc: 'Cards of linked people — portrait, role, notes.', icon: '◫', sec: { label: 'Roster', slot: 'main' } },
    { type: 'dyad', name: 'Pairing (two-sided)', desc: 'Two linked people + the tension between them.', icon: '⇔', sec: { label: 'Pairing', slot: 'main' } },
    { type: 'matrix', name: 'Relationship matrix', desc: 'An N×N grid of how a cast relates — at a glance.', icon: '⊠', sec: { label: 'Relationships', slot: 'main' } },
    { type: 'orgchart', name: 'Org / hierarchy chart', desc: 'A command tree — leader → lieutenants → members.', icon: '⋔', sec: { label: 'Hierarchy', slot: 'main' } },
  ] },
  { group: 'Lists & tables', icon: '▤', color: '#c98a6a', features: [
    { type: 'table', name: 'Table', desc: 'A multi-column grid — columns & rows you define.', icon: '⊞', sec: { label: 'Table', slot: 'main' } },
    { type: 'taggroups', name: 'Tag groups', desc: 'Grouped chips — traits, tags, features.', icon: '◧', sec: { label: 'Tags', slot: 'main' } },
    { type: 'catalog', name: 'Field-guide catalog', desc: 'Grouped cards with a scale badge + link-out.', icon: '▤', sec: { label: 'Catalog', slot: 'main', scale: 'Rarity' } },
    { type: 'rulelist', name: 'Rules / Can-can’t', desc: 'Numbered laws or a two-sided rule block.', icon: '§', sec: { label: 'Rules', slot: 'main', variant: 'laws' } },
  ] },
  { group: 'Story & time', icon: '◷', color: '#b0596a', features: [
    { type: 'timeline', name: 'Timeline', desc: 'A chronicle of dated beats (3 views).', icon: '◷', sec: { label: 'Timeline', slot: 'main' } },
    { type: 'history', name: 'Simple timeline', desc: 'Dated beats, top-to-bottom.', icon: '⋮', sec: { label: 'History', slot: 'main' } },
    { type: 'arc', name: 'Arc curve', desc: 'A change-over-time curve you can drag.', icon: '◠', sec: { label: 'Arc', slot: 'main' } },
    { type: 'twists', name: 'Plot twists', desc: 'Twist ideas — setup → payoff, with a status you track.', icon: '↯', sec: { label: 'Twist ideas', slot: 'main' } },
    { type: 'chronology', name: 'Date list', desc: 'A light dated list (date · event · link).', icon: '⋯', sec: { label: 'Dates', slot: 'main' } },
  ] },
  { group: 'Game / RPG', icon: '⚄', color: '#b8863f', features: [
    { type: 'abilityscores', name: 'Score grid', desc: 'Named stat cards — D&D abilities, PbtA, Fate, %-based; optional auto modifiers.', icon: '⬢', sec: { label: 'Scores', slot: 'main', mod: 'value', abils: ['Stat 1', 'Stat 2', 'Stat 3'] } },
    { type: 'rolltable', name: 'Roll table', desc: 'A dice table you click to roll — loot, rumours, encounters.', icon: '⚄', sec: { label: 'Roll table', slot: 'main' } },
    { type: 'clocks', name: 'Progress clocks', desc: 'Segmented clocks you fill — fronts, doom, tension, countdowns.', icon: '◵', sec: { label: 'Clocks', slot: 'main' } },
    { type: 'checklist', name: 'Checklist', desc: 'Tickable to-dos — objectives, prep, open threads.', icon: '☑', sec: { label: 'Checklist', slot: 'main' } },
    { type: 'npcroster', name: 'NPC roster', desc: 'Many lightweight NPCs — role, disposition, want, quirk, GM-secret.', icon: '☰', sec: { label: 'NPCs', slot: 'main' } },
  ] },
  { group: 'Reference', icon: '❏', color: '#7f9ac9', features: [
    { type: 'references', name: 'Bibliography', desc: 'Books, links, videos with reliability.', icon: '▤', sec: { label: 'References', slot: 'main' } },
    { type: 'lexicon', name: 'Lexicon', desc: 'Grouped term cards — pronunciation, usage.', icon: '¶', sec: { label: 'Lexicon', slot: 'main' } },
    { type: 'phrasebook', name: 'Phrasebook', desc: 'Phrases → meaning — translation, literal gloss, usage.', icon: '❝', sec: { label: 'Phrasebook', slot: 'main' } },
    { type: 'ledger', name: 'Real vs invented', desc: 'A colour-keyed accuracy ledger.', icon: '⚖', sec: { label: 'Real vs invented', slot: 'main' } },
    { type: 'outline', name: 'Plot outline', desc: 'Acts → chapters → beats.', icon: '✎', sec: { label: 'Structure', slot: 'main' } },
    { type: 'sourcenotes', name: 'Reading notes', desc: 'Chapters → typed notes & plates (a reading log).', icon: '❏', sec: { label: 'Notes', slot: 'main' } },
  ] },
  { group: 'Advanced', icon: '⚙', color: '#9aa1a8', features: [
    { type: 'suspects', name: 'Suspect grid', desc: 'People × motive / means / opportunity / alibi.', icon: '⊞', sec: { label: 'Suspects', slot: 'main' } },
    { type: 'clues', name: 'Clue cards', desc: 'Two-faced clues — reads-as vs. means.', icon: '✦', sec: { label: 'Clues', slot: 'main' } },
  ] },
];

// flat lookup by field type
export const FEATURE_BY_TYPE = {};
FEATURE_GROUPS.forEach(g => g.features.forEach(f => { FEATURE_BY_TYPE[f.type] = { ...f, color: g.color, group: g.group }; }));

// layout choices (each sets template.layout + optional media)
export const LAYOUTS = [
  { id: 'hero-none', name: 'Simple', hint: 'Title + body', layout: 'hero', media: 'none' },
  { id: 'hero-feature', name: 'Feature image', hint: 'Big image on top', layout: 'hero', media: 'feature' },
  { id: 'split', name: 'Split', hint: 'Image column + body', layout: 'split', media: 'feature' },
  { id: 'codex', name: 'Article + sidebar', hint: 'Composable rail', layout: 'codex' },
];
export function layoutId(tpl){
  // 'infobox' is retired — legacy types that still carry it resolve to the composable rail (codex)
  const layout = tpl.layout === 'infobox' ? 'codex' : tpl.layout;
  const m = tpl.media || (layout === 'hero' ? 'none' : undefined);
  return (LAYOUTS.find(l => l.layout === layout && (l.media === m || l.media === undefined)) || LAYOUTS[0]).id;
}

// build a section config from a feature, with a key unique among existing keys
export function sectionFromFeature(feature, existingKeys){
  const base = { key: '', type: feature.type, ...JSON.parse(JSON.stringify(feature.sec)) };
  let root = (feature.sec.label || feature.type).toLowerCase().replace(/[^a-z0-9]+/g, '') || 'field';
  let k = root, i = 2;
  const used = new Set(existingKeys || []);
  while (used.has(k)) { k = root + i; i++; }
  base.key = k;
  return base;
}

// which config controls a field type supports (drives the builder's config panel)
export function configFor(type){
  switch (type){
    case 'stats': return ['defaults'];
    case 'meter': return ['levels'];
    case 'deflist': return ['placeholders'];
    case 'relations': return ['linkTypes', 'display'];
    case 'ties': return ['linkTypes'];
    case 'dialectic': return ['dialecticLabels'];
    case 'rulelist': return ['ruleVariant'];
    case 'catalog': return ['scale'];
    default: return [];
  }
}
