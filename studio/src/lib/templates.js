/* ============ TEMPLATE REGISTRY ============
   Every sheet type is a template: a title/subtitle plus an ordered list of typed
   sections. The editor renders/edits any entry from its template, and the exporter
   renders any entry to static HTML. Adding a new sheet type = adding a template here.

   Section types:
     richline     one rich paragraph (bold/italic) — used as a lead
     stats        key/value rows (infobox facts)          [slot: aside]
     gallery      array of images                         [slot: aside]
     richsections list of { h, body } rich prose blocks
     relations    list of { name, role, status, targetId, img, body }
     taggroups    list of { name, items:[{ name, note }] } chip groups
     excerpts     list of { title, body, source } quotes
     outline      acts -> chapters -> beats (plot structure)
*/

export const TEMPLATES = {
  character: {
    type: 'character', label: 'Character', plural: 'Characters', icon: '✦', layout: 'split',
    title: { ph: 'Name' }, subtitle: { ph: 'concept / role (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Portraits', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Age','Height','Pronouns','Origin','Role','Status','Languages'] },
      { key: 'bio', label: 'Biography', type: 'richsections', slot: 'main' },
      { key: 'arc', label: 'Arc & interiority', type: 'arc', slot: 'main', optional: true },
      { key: 'relationships', label: 'Relationships', type: 'relations', slot: 'main' },
      { key: 'homes', label: 'Home & haunts', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'skills', label: 'Abilities & skills', type: 'taggroups', slot: 'main' },
      { key: 'tropes', label: 'Tropes', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Excerpts', type: 'excerpts', slot: 'main' },
      { key: 'soundtrack', label: 'Soundtrack', type: 'spotify', slot: 'main' },
    ],
  },
  location: {
    type: 'location', label: 'Location', plural: 'Locations', icon: '⌖', layout: 'codex',
    title: { ph: 'Place name' }, subtitle: { ph: 'region / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail: Kind chooser → imagery → Details → At a glance */
      { key: 'kind', label: 'Kind', type: 'kind', slot: 'aside' },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Type','Population','Ruler','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', optional: true },
      /* article */
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'features', label: 'Features', type: 'taggroups', slot: 'main' },
      { key: 'notable', label: 'Notable figures & sites', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'businesses', label: 'Shops & businesses', type: 'relations', slot: 'main', display: 'expand', optional: true },
      { key: 'hidden', label: 'The hidden', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  dwelling: {
    type: 'dwelling', label: 'Dwelling / Base', plural: 'Dwellings', icon: '⏢', layout: 'hero', media: 'feature',
    title: { ph: 'Place name (e.g. Ravenhold Manor)' }, subtitle: { ph: 'kind (manor, safehouse, hideout, ship…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Kind','Owner','Located in','Occupants','Built','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'occupants', label: 'Occupants & staff', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'features', label: 'Rooms & features', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  business: {
    type: 'business', label: 'Business / Establishment', plural: 'Businesses', icon: '⚖', layout: 'hero', media: 'feature',
    title: { ph: 'Establishment name (e.g. The Prancing Pony)' }, subtitle: { ph: 'kind (tavern, smithy, shop…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Storefront & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Proprietor','Located in','Founded','Specialty','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'staff', label: 'Proprietor & staff', type: 'relations', slot: 'main' },
      { key: 'wares', label: 'Wares & services', type: 'taggroups', slot: 'main' },
      { key: 'patrons', label: 'Patrons & ties', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  house: {
    type: 'house', label: 'House / Family', plural: 'Houses', icon: '⌂', layout: 'hero', media: 'sigil', motto: true,
    title: { ph: 'House / family name (e.g. House Stark)' }, subtitle: { ph: 'words / motto (e.g. Winter is Coming)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Sigil & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Seat','Head','Founded','Region','Allegiance','Status'] },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'lineage', label: 'Lineage', type: 'familytree', slot: 'main' },
      { key: 'allegiances', label: 'Allegiances & ties', type: 'allegianceweb', slot: 'main' },
      { key: 'holdings', label: 'Seats & holdings', type: 'relations', slot: 'main' },
      { key: 'tenets', label: 'Words & traditions', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  organization: {
    type: 'organization', label: 'Organization', plural: 'Organizations', icon: '⬡', layout: 'hero', media: 'sigil',
    title: { ph: 'Organization name' }, subtitle: { ph: 'kind (order, guild, faith, council…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Emblem & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Founded','Seat','Leader','Size','Allegiance','Status'] },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main' },
      { key: 'base', label: 'Base of operations', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'members', label: 'Members & ranks', type: 'relations', slot: 'main' },
      { key: 'ties', label: 'Allies & rivals', type: 'relations', slot: 'main' },
      { key: 'tenets', label: 'Tenets & traits', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  /* ---- a distinct kind of people / beings — flexible across biological species
     (Asari, werewolves) and culturally-defined peoples (Air Nomads). Lean core +
     opt-in specialist sections so a cultural people isn't shown empty "banes". ---- */
  species: {
    type: 'species', label: 'Species / People', plural: 'Peoples', icon: '❂', layout: 'codex',
    title: { ph: 'Name (e.g. Asari · Air Nomads · Werewolves)' }, subtitle: { ph: 'kind / concept (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* — composable infobox (aside rail) — */
      { key: 'gallery', label: 'Depiction', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Kind','Origin','Homeland','Lifespan','Population','Status'] },
      { key: 'powers', label: 'Powers & abilities', type: 'taggroups', slot: 'aside', optional: true },
      { key: 'weaknesses', label: 'Weaknesses & banes', type: 'taggroups', slot: 'aside', optional: true },
      /* — the article (main) — */
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'society', label: 'Society & culture', type: 'richsections', slot: 'main', optional: true },
      { key: 'lifecycle', label: 'Lifecycle', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'history', slot: 'main', optional: true },
      { key: 'ties', label: 'Relations with other groups', type: 'ties', slot: 'main', optional: true, linkTypes: ['species','organization','house','realm'] },
      { key: 'subtypes', label: 'Subtypes & breeds', type: 'relations', slot: 'band', display: 'expand', optional: true, linkTypes: ['species','article'], addLabel: 'subtype' },
      { key: 'members', label: 'Notable members', type: 'relations', slot: 'main', optional: true, linkTypes: ['character'], addLabel: 'member' },
      { key: 'excerpts', label: 'Lore & accounts', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- realm / setting: a genre-neutral place codex. A `kind` chooser (see
     kinds.js) seeds the Details keys, the At-a-glance gauges, and reveals the
     genre-relevant sections; the lean core below works with no Kind at all.
     Most article sections are opt-in so a blank sheet isn't a fantasy form. ---- */
  realm: {
    type: 'realm', label: 'Realm / Setting', plural: 'Realms', icon: '⬢', layout: 'codex', mapStyle: true,
    title: { ph: 'Realm / setting name' }, subtitle: { ph: 'kingdom · station · sprawl · megacity…' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail: Kind chooser → map → Details → At a glance */
      { key: 'kind', label: 'Kind', type: 'kind', slot: 'aside' },
      { key: 'gallery', label: 'Map & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Capital','Government','Population','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', optional: true },
      /* article — lean core (geography · locations · powers · passages); the rest opt-in / Kind-seeded */
      { key: 'geography', label: 'Geography & description', type: 'richsections', slot: 'main' },
      { key: 'government', label: 'Government & law', type: 'richsections', slot: 'main', optional: true },
      { key: 'economy', label: 'Economy & trade', type: 'richsections', slot: 'main', optional: true },
      { key: 'military', label: 'Military & defense', type: 'richsections', slot: 'main', optional: true },
      { key: 'systems', label: 'Systems & infrastructure', type: 'richsections', slot: 'main', optional: true },
      { key: 'culture', label: 'Culture & daily life', type: 'richsections', slot: 'main', optional: true },
      { key: 'districts', label: 'Districts & quarters', type: 'taggroups', slot: 'main', optional: true },
      { key: 'locations', label: 'Notable locations', type: 'relations', slot: 'main', display: 'expand' },
      { key: 'powers', label: 'Powers & factions', type: 'relations', slot: 'main' },
      { key: 'peoples', label: 'Peoples & cultures', type: 'taggroups', slot: 'main', optional: true },
      { key: 'hidden', label: 'The hidden', type: 'richsections', slot: 'main', optional: true },
      { key: 'history', label: 'History', type: 'richsections', slot: 'main', optional: true },
      { key: 'relations', label: 'Relations', type: 'ties', slot: 'main', optional: true, linkTypes: ['realm','organization','house','species'] },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  /* ---- relationship: a first-class sheet for a key pairing, linked to its two Character
     entries (both get an auto-backlink). Genre-neutral — a romance, rivalry, mentor/protégé,
     a pair of foils. The `dyad` field carries the whole core: the two people + dynamic +
     status, the central tension, and the MIRRORED his/her columns (asymmetry is the point).
     Key moments reuse the History timeline (★ = the black moment / turning point). ---- */
  relationship: {
    type: 'relationship', label: 'Relationship', plural: 'Relationships', icon: '↔', layout: 'hero', media: 'none',
    title: { ph: 'The pairing (e.g. Cael & Bren)' }, subtitle: { ph: 'dynamic (optional)' },
    sections: [
      { key: 'summary', label: 'The pitch', type: 'richline', slot: 'main', lead: true },
      { key: 'dyad', label: 'The pairing', type: 'dyad', slot: 'main' },
      { key: 'trajectory', label: 'Trajectory', type: 'arc', mode: 'relationship', slot: 'main', optional: true },
      { key: 'beats', label: 'Key moments', type: 'history', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'richsections', slot: 'main', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  /* ---- case: the investigation dossier for a mystery. A `suspects` grid (motive/means/
     opportunity/alibi + suspicion + a writer-only guilty flag) and `clues` as two-faced
     cards (reads-as vs means · genuine/red-herring · implicates · planted-where). The
     solution is a `sealed` section — tucked behind a spoiler in the read/export view.
     Pairs with a Timeline (Tracks) for the true-vs-known sequence; clues can link out to
     deep Clue/Evidence entries. ---- */
  case: {
    type: 'case', label: 'Case', plural: 'Cases', icon: '⌕', layout: 'hero', media: 'none',
    title: { ph: 'Case name (e.g. The Cinderhall Murder)' }, subtitle: { ph: 'the crime / question (optional)' },
    sections: [
      { key: 'question', label: 'The question', type: 'richline', slot: 'main', lead: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Victim','Where','When','Investigator','Status'] },
      { key: 'suspects', label: 'Suspects', type: 'suspects', slot: 'main' },
      { key: 'clues', label: 'Clues & evidence', type: 'clues', slot: 'main' },
      { key: 'timeline', label: 'Timeline', type: 'relations', slot: 'main', optional: true, display: 'expand', linkTypes: ['timeline'], addLabel: 'timeline' },
      { key: 'investigation', label: 'The investigation', type: 'richsections', slot: 'main', optional: true },
      { key: 'solution', label: 'The solution', type: 'richsections', slot: 'main', sealed: true, optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  clue: {
    type: 'clue', label: 'Clue / Evidence', plural: 'Clues', icon: '✧', layout: 'codex',
    title: { ph: 'The evidence (e.g. The frost-rimed teacup)' }, subtitle: { ph: 'the case / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Found','Status','Case'] },
      { key: 'reveals', label: 'What it reveals', type: 'richsections', slot: 'main' },
      { key: 'catch', label: 'The catch / misdirection', type: 'richsections', slot: 'main', optional: true },
      { key: 'implicates', label: 'Implicates', type: 'relations', slot: 'main', display: 'expand', optional: true, linkTypes: ['character'], addLabel: 'suspect' },
      { key: 'case', label: 'Part of case', type: 'relations', slot: 'main', optional: true, linkTypes: ['case'], addLabel: 'case' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },
  lore: {
    type: 'lore', label: 'Lore', plural: 'Lore', icon: '❋', layout: 'infobox',
    title: { ph: 'Concept / topic' }, subtitle: { ph: 'category (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Category','Origin','Status'] },
      { key: 'body', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'related', label: 'Connections', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  item: {
    type: 'item', label: 'Item', plural: 'Items', icon: '◈', layout: 'split',
    title: { ph: 'Item name' }, subtitle: { ph: 'kind (artifact, weapon…)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Origin','Owner','Status'] },
      { key: 'body', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'related', label: 'Bearers & links', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  event: {
    type: 'event', label: 'Event', plural: 'Events', icon: '❖', layout: 'hero', media: 'none',
    title: { ph: 'Event name' }, subtitle: { ph: 'when / kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Date','Where','Duration','Outcome'] },
      { key: 'timeline', label: 'Timeline', type: 'eventtimeline', slot: 'main' },
      { key: 'body', label: 'Account', type: 'richsections', slot: 'main' },
      { key: 'participants', label: 'Participants', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  plot: {
    type: 'plot', label: 'Plotline', plural: 'Plot', icon: '✎', layout: 'outline',
    title: { ph: 'Plotline title' }, subtitle: { ph: 'arc / thread (optional)' },
    sections: [
      { key: 'logline', label: 'Logline', type: 'richline', slot: 'main', lead: true },
      { key: 'structure', label: 'Structure', type: 'outline', slot: 'main' },
    ],
  },

  /* ---- timeline: a standalone chronology that aggregates dated beats across a whole
     world or story (distinct from one Event, or the Research per-topic chronology). The
     `timeline` field = era bands + collapsible beats; each beat links to Event/Character/
     Place entries (auto-backlinks) and can be flagged a ★ key beat. Vertical Chronicle. ---- */
  timeline: {
    type: 'timeline', label: 'Timeline', plural: 'Timelines', icon: '◷', layout: 'hero', media: 'none',
    title: { ph: 'Timeline name (e.g. History of the Ember Coast)' }, subtitle: { ph: 'scope / calendar (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Scope','Span','Calendar','Status'] },
      { key: 'chronicle', label: 'Chronicle', type: 'timeline', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- region / group collection sheets (Nature + Culture) ----
     Each is a survey of a place or people holding many items in a `catalog`
     (grouped field-guide cards, each with a scale badge + optional link-out to a
     deep `article` entry). A `meter` gives one domain-fit scale in the header. */
  flora: {
    type: 'flora', label: 'Flora', plural: 'Flora', icon: '⚘', layout: 'hero', media: 'feature',
    title: { ph: 'Region / group (e.g. Flora of the Cindermarch)' }, subtitle: { ph: 'biome / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Biome','Climate','Growing season','Notable species','Status'] },
      { key: 'overview', label: 'Botany & overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Plants & fungi', type: 'catalog', slot: 'main', scale: 'Rarity' },
      { key: 'byuse', label: 'By use', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main' },
    ],
  },
  fauna: {
    type: 'fauna', label: 'Fauna', plural: 'Fauna', icon: '♘', layout: 'hero', media: 'feature',
    title: { ph: 'Region / group (e.g. Fauna of the Sallow Fens)' }, subtitle: { ph: 'biome / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','Biome','Climate','Threat level','Notable species','Status'] },
      { key: 'scale', label: 'Threat level', type: 'meter', slot: 'main', levels: ['Low','Moderate','High','Extreme'] },
      { key: 'overview', label: 'Ecology & overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Creatures', type: 'catalog', slot: 'main', scale: 'Rarity' },
      { key: 'byhabitat', label: 'By habitat', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Field notes', type: 'excerpts', slot: 'main' },
    ],
  },
  religion: {
    type: 'religion', label: 'Religion', plural: 'Religions', icon: '☸', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Faiths of the Western Realms)' }, subtitle: { ph: 'scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Iconography', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Dominant faith','Tolerance','Status'] },
      { key: 'scale', label: 'Tolerance', type: 'meter', slot: 'main', levels: ['Persecuted','Uneasy','Broad','Open'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Faiths & cults', type: 'catalog', slot: 'main', scale: 'Standing' },
      { key: 'deities', label: 'Deities & powers', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
  beliefs: {
    type: 'beliefs', label: 'Beliefs & Customs', plural: 'Beliefs', icon: '☯', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Customs of the Tern Coast)' }, subtitle: { ph: 'culture / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Related faith','Prevalence','Status'] },
      { key: 'scale', label: 'How strictly kept', type: 'meter', slot: 'main', levels: ['Loose','Held','Strict','Absolute'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Customs & beliefs', type: 'catalog', slot: 'main', scale: 'Observance' },
      { key: 'values', label: 'Values & taboos', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Sayings', type: 'excerpts', slot: 'main' },
    ],
  },
  folklore: {
    type: 'folklore', label: 'Folklore', plural: 'Folklore', icon: '❧', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Folklore of the Sallow Fens)' }, subtitle: { ph: 'myths & legends / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Origin','Notable tales','Status'] },
      { key: 'scale', label: 'How widely told', type: 'meter', slot: 'main', levels: ['Local','Regional','Widespread','Ubiquitous'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Tales & legends', type: 'catalog', slot: 'main', scale: 'Currency' },
      { key: 'motifs', label: 'Motifs & themes', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Tellings', type: 'excerpts', slot: 'main' },
    ],
  },
  language: {
    type: 'language', label: 'Language', plural: 'Languages', icon: '¶', layout: 'hero', media: 'feature',
    title: { ph: 'Region / people (e.g. Tongues of the Tern Coast)' }, subtitle: { ph: 'family / scope (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery & script', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Region','People','Family','Script','Speakers','Status'] },
      { key: 'scale', label: 'How widely spoken', type: 'meter', slot: 'main', levels: ['Local','Regional','Common','Lingua franca'] },
      { key: 'overview', label: 'Overview', type: 'richsections', slot: 'main' },
      { key: 'catalog', label: 'Tongues & dialects', type: 'catalog', slot: 'main', scale: 'Vitality' },
      { key: 'features', label: 'Features & sample', type: 'taggroups', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },

  /* ---- research desk: reference notes with sourced reliability + a real-vs-invented
     ledger. Historical fiction's non-negotiable; serves any research-heavy genre.
     Reuses the catalog (a source per card, its scale badge = per-source Reliability)
     and a header `meter` for overall confidence; adds the `ledger` field. ---- */
  research: {
    type: 'research', label: 'Research', plural: 'Research', icon: '❡', layout: 'hero', media: 'feature', mediaToggle: true,
    title: { ph: 'Topic (e.g. Norman siege warfare)' }, subtitle: { ph: 'discipline / period (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Documents & references', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Topic','Discipline','Period','Region','Sources','Status'] },
      /* — Understand — (lean core = not optional: quickfacts, findings, + sources below) */
      { key: 'quickfacts', label: 'Quick facts', type: 'deflist', slot: 'main', zone: 'Understand', termPh: 'What', defPh: 'Figure / fact', notePh: 'source', addLabel: 'fact' },
      { key: 'findings', label: 'Synthesis', type: 'richsections', slot: 'main', zone: 'Understand' },
      { key: 'timeline', label: 'Timeline', type: 'chronology', slot: 'main', zone: 'Understand', optional: true },
      { key: 'keyfigures', label: 'Key figures', type: 'relations', slot: 'main', zone: 'Understand', optional: true, linkTypes: ['character','source'], addLabel: 'figure' },
      /* — Sources & material — */
      { key: 'sources', label: 'Sources', type: 'relations', slot: 'main', zone: 'Sources & material', display: 'expand', linkTypes: ['source'], addLabel: 'source' },
      { key: 'links', label: 'Links & further reading', type: 'references', slot: 'main', zone: 'Sources & material', optional: true },
      { key: 'excerpts', label: 'Quotes & flavour', type: 'excerpts', slot: 'main', zone: 'Sources & material', optional: true },
      /* — Craft reference — */
      { key: 'glossary', label: 'Lexicon', type: 'lexicon', slot: 'main', zone: 'Craft reference', optional: true },
      { key: 'voice', label: 'Voice & speech', type: 'taggroups', slot: 'main', zone: 'Craft reference', optional: true },
      { key: 'sensory', label: 'Sensory & texture', type: 'taggroups', slot: 'main', zone: 'Craft reference', optional: true },
      /* — Accuracy & story — */
      { key: 'ledger', label: 'Real vs invented', type: 'ledger', slot: 'main', zone: 'Accuracy & story', optional: true },
      { key: 'avoid', label: 'Avoid / anachronism', type: 'deflist', slot: 'main', zone: 'Accuracy & story', optional: true, variant: 'avoid', termPh: 'Don’t…', defPh: 'why / the correct version', notePh: 'source', addLabel: 'rule' },
      { key: 'questions', label: 'Open questions', type: 'taggroups', slot: 'main', zone: 'Accuracy & story', optional: true },
      { key: 'feeds', label: 'Feeds into', type: 'relations', slot: 'main', zone: 'Accuracy & story', optional: true },
      /* — Deeper — */
      { key: 'subtopics', label: 'Sub-topics', type: 'relations', slot: 'main', zone: 'Deeper', optional: true, display: 'expand' },
    ],
  },

  /* ---- source: a reusable, note-rich reading record. Authored once, linked from any
     Research topic it informs. The `sourcenotes` field is the workspace: chapters →
     typed notes (quote/fact/summary/question/idea) + plates (images, placeable). ---- */
  source: {
    type: 'source', label: 'Source', plural: 'Sources', icon: '▤', layout: 'hero', media: 'none',
    title: { ph: 'Title (e.g. Henry III)' }, subtitle: { ph: 'author · volume / edition (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Cover & imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Author','Year','Publisher','Type','Reliability','Status'] },
      { key: 'takeaways', label: 'Takeaways', type: 'richsections', slot: 'main' },
      { key: 'notes', label: 'Notes', type: 'sourcenotes', slot: 'main' },
    ],
  },

  /* ---- system / rules: how a magic system, technology, or institution works — and
     what it COSTS. A codex (framework article + at-a-glance rail) that catalogs the
     abilities within it, each linking out to a deep `power` entry (collection→deep,
     like Flora→article). Craft spine is Sanderson-shaped: limitations > powers. The
     `rulelist` field carries both the numbered Laws and the Can/Can’t consistency block. */
  system: {
    type: 'system', label: 'System / Rules', plural: 'Systems', icon: '§', layout: 'codex',
    title: { ph: 'System name (e.g. Emberbinding)' }, subtitle: { ph: 'magic · technology · institution' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      /* aside rail */
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Source','Access','Trained at','Tiers','Status'] },
      { key: 'gauges', label: 'At a glance', type: 'gauges', slot: 'aside', gaugeDefaults: [
        { label: 'Hardness', levels: ['Soft','Mixed','Firm','Hard'] },
        { label: 'Cost', levels: ['Free','Cheap','Steep','Dire'] },
        { label: 'Prevalence', levels: ['Unique','Rare','Common','Ubiquitous'] },
        { label: 'Scope', levels: ['Personal','Local','Regional','World'] },
      ] },
      /* framework article */
      { key: 'howitworks', label: 'How it works', type: 'richsections', slot: 'main' },
      { key: 'laws', label: 'The laws', type: 'rulelist', slot: 'main', variant: 'laws', optional: true },
      { key: 'cancant', label: 'Can & can’t', type: 'rulelist', slot: 'main', variant: 'cancant', optional: true },
      { key: 'limits', label: 'Limits & costs', type: 'richsections', slot: 'main', optional: true },
      { key: 'access', label: 'Who wields it', type: 'richsections', slot: 'main', optional: true },
      { key: 'consequences', label: 'Consequences', type: 'richsections', slot: 'main', optional: true },
      /* the abilities within (full-width band) → deep Power entries */
      { key: 'abilities', label: 'Abilities', type: 'catalog', slot: 'band', scale: 'Tier', optional: true },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- power / ability: a single ability within a System — effect, tier, its cost &
     drawbacks, who wields it, what counters it, and a mastery track for progression. ---- */
  power: {
    type: 'power', label: 'Power / Ability', plural: 'Powers', icon: '✷', layout: 'codex',
    title: { ph: 'Ability name (e.g. Draw)' }, subtitle: { ph: 'system / discipline (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside', optional: true },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Tier','System','Cost','Discipline','Status'] },
      { key: 'effect', label: 'Effect', type: 'richsections', slot: 'main' },
      { key: 'drawbacks', label: 'Cost & drawbacks', type: 'richsections', slot: 'main', optional: true },
      { key: 'mastery', label: 'Mastery', type: 'meter', slot: 'main', levels: ['Novice','Adept','Master'], optional: true },
      { key: 'counters', label: 'Counters', type: 'taggroups', slot: 'main', optional: true },
      { key: 'wielders', label: 'Wielders', type: 'relations', slot: 'main', display: 'expand', optional: true, linkTypes: ['character'], addLabel: 'wielder' },
      { key: 'partof', label: 'Part of', type: 'relations', slot: 'main', optional: true, linkTypes: ['system'], addLabel: 'system' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main', optional: true },
    ],
  },

  /* ---- shared deep single-subject sheet: any catalog item can link out to one ---- */
  article: {
    type: 'article', label: 'Article', plural: 'Articles', icon: '◆', layout: 'split',
    title: { ph: 'Subject (a creature, plant, faith, custom, tale…)' }, subtitle: { ph: 'kind (optional)' },
    sections: [
      { key: 'summary', label: 'Summary', type: 'richline', slot: 'main', lead: true },
      { key: 'gallery', label: 'Imagery', type: 'gallery', slot: 'aside' },
      { key: 'stats', label: 'Details', type: 'stats', slot: 'aside', defaults: ['Type','Origin','Range','Rarity','Status'] },
      { key: 'description', label: 'Description', type: 'richsections', slot: 'main' },
      { key: 'connections', label: 'Connections', type: 'relations', slot: 'main' },
      { key: 'excerpts', label: 'Passages', type: 'excerpts', slot: 'main' },
    ],
  },
};

// Display order for the type picker / project view.
export const ENTRY_TYPES = ['character','relationship','house','organization','species','realm','location','business','dwelling','flora','fauna','religion','beliefs','folklore','language','event','plot','timeline','case','clue','lore','item','system','power','research','source','article'];

// Type families — group the entry types for the project-view category filter + the
// "New entry" picker. Source of truth for section order too (people → places → nature → culture → story → lore).
export const FAMILIES = [
  { key: 'people',  label: 'People',  types: ['character','relationship','house','organization','species'] },
  { key: 'places',  label: 'Places',  types: ['realm','location','business','dwelling'] },
  { key: 'nature',  label: 'Nature',  types: ['flora','fauna'] },
  { key: 'culture', label: 'Culture', types: ['religion','beliefs','folklore','language'] },
  { key: 'story',   label: 'Story',   types: ['event','plot','timeline','case','clue'] },
  { key: 'lore',    label: 'Lore',    types: ['lore','item','system','power','research','source','article'] },
];

// Back-compat: earlier saves used 'faction'; treat it as 'organization'.
export const TYPE_ALIASES = { faction: 'organization' };

export function templateFor(type){ return TEMPLATES[type] || TEMPLATES[TYPE_ALIASES[type]] || TEMPLATES.character; }

// Every field type's empty starting value.
export function emptyValue(section){
  switch (section.type){
    case 'richline': return '';
    case 'stats': return (section.defaults || []).map(k => ({ k, v: '' }));
    case 'gallery': return [];
    case 'richsections': return [];
    case 'relations': return [];
    case 'catalog': return [];
    case 'references': return [];
    case 'deflist': return [];
    case 'lexicon': return [];
    case 'chronology': return [];
    case 'sourcenotes': return { chapters: [] };
    case 'ledger': return [];
    case 'meter': return { levels: (section.levels || []).slice(), at: 0 };
    case 'kind': return { id: '' };
    case 'gauges': return [];
    case 'timeline': return { eras: [], threads: [], entries: [], view: 'chronicle' };
    case 'arc': return { type: 'positive', pos: null, believes: '', is: '', turn: '', learns: '', becomes: '', want: '', need: '' };
    case 'rulelist': return [];
    case 'dyad': return { a: { targetId: '', role: '' }, b: { targetId: '', role: '' }, dynamic: '', status: '', tension: '', sides: { a: { wants: '', fears: '', hides: '', sees: '' }, b: { wants: '', fears: '', hides: '', sees: '' } } };
    case 'suspects': return [];
    case 'clues': return [];
    case 'taggroups': return [];
    case 'excerpts': return [];
    case 'outline': return { acts: [] };
    case 'lineage': return { nodes: [] };
    case 'familytree': return { people: [], unions: [] };
    case 'history': return [];
    case 'ties': return [];
    case 'allegianceweb': return [];
    case 'eventtimeline': return null;
    case 'spotify': return [];
    default: return '';
  }
}
